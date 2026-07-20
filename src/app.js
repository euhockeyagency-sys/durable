const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const express = require("express");
const multer = require("multer");
const { createApplicationHandler } = require("./applications");
const { createServices } = require("./services");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

function createApp({ config, services, now, randomUUID } = {}) {
  if (!config) throw new Error("createApp requires config");
  const app = express();
  if (config.trustProxy !== false) app.set("trust proxy", config.trustProxy);
  app.disable("x-powered-by");
  app.use(securityHeaders);

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      files: 3,
      fileSize: 5 * 1024 * 1024,
      fields: 40,
      fieldSize: 20 * 1024
    }
  });
  const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000, now: () => (now ? now().getTime() : Date.now()) });
  const appServices = services || (config.applicationConfigured ? createServices(config) : null);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, applicationsConfigured: config.applicationConfigured });
  });
  app.post("/api/applications", limiter, upload.array("files", 3), createApplicationHandler({
    config,
    services: appServices,
    now,
    randomUUID
  }));
  app.all("/api/applications", (_req, res) => {
    res.set("Allow", "POST").status(405).json({ ok: false, code: "method_not_allowed" });
  });

  app.use((error, _req, res, next) => {
    if (!(error instanceof multer.MulterError)) return next(error);
    const tooLarge = ["LIMIT_FILE_SIZE", "LIMIT_FILE_COUNT", "LIMIT_UNEXPECTED_FILE"].includes(error.code);
    return res.status(tooLarge ? 413 : 400).json({
      ok: false,
      code: tooLarge ? "file_limit_exceeded" : "invalid_multipart",
      errors: { files: tooLarge ? "Превышен лимит количества или размера файлов." : "Не удалось обработать файлы." }
    });
  });

  app.get("*path", (req, res) => servePublic(req, res, config));
  app.head("*path", (req, res) => servePublic(req, res, config));
  app.use((error, _req, res, _next) => {
    console.error("Unhandled request error", error);
    res.status(500).json({ ok: false, code: "internal_error" });
  });
  return app;
}

function createRateLimiter({ limit, windowMs, now }) {
  const clients = new Map();
  return (req, res, next) => {
    const timestamp = now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let state = clients.get(key);
    if (!state || state.resetAt <= timestamp) state = { count: 0, resetAt: timestamp + windowMs };
    state.count += 1;
    clients.set(key, state);
    res.set("RateLimit-Limit", String(limit));
    res.set("RateLimit-Remaining", String(Math.max(0, limit - state.count)));
    res.set("RateLimit-Reset", String(Math.ceil(state.resetAt / 1000)));
    if (state.count > limit) {
      res.set("Retry-After", String(Math.ceil((state.resetAt - timestamp) / 1000)));
      return res.status(429).json({ ok: false, code: "rate_limit_exceeded", message: "Слишком много попыток. Попробуйте через 15 минут." });
    }
    next();
  };
}

function securityHeaders(_req, res, next) {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data: https://mc.yandex.ru https://*.mc.yandex.ru; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://mc.yandex.ru; frame-src https://challenges.cloudflare.com https://mc.yandex.ru; connect-src 'self' https://challenges.cloudflare.com https://mc.yandex.ru https://*.mc.yandex.ru https://mc.yandex.md; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  });
  next();
}

const YANDEX_METRIKA = `<!-- Yandex.Metrika counter --><script type="text/javascript">(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=110889446','ym');ym(110889446,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});</script><noscript><div><img src="https://mc.yandex.ru/watch/110889446" style="position:absolute;left:-9999px;" alt="" /></div></noscript><!-- /Yandex.Metrika counter -->`;

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

// Build Open Graph + Twitter Card tags from the page's own <title>/description.
function buildSocialTags(html, pageUrl, isArticle, imageUrl) {
  if (html.includes('property="og:title"')) return ""; // page already declares its own OG
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!titleMatch) return "";
  const fullTitle = titleMatch[1].trim();
  const ogTitle = htmlEscape(fullTitle.split(" | ")[0].trim());
  const ogDesc = htmlEscape((descMatch ? descMatch[1] : "").trim());
  const url = htmlEscape(pageUrl);
  const img = htmlEscape(imageUrl);
  return `<meta property="og:type" content="${isArticle ? "article" : "website"}">` +
    `<meta property="og:site_name" content="European Hockey Agency">` +
    `<meta property="og:locale" content="ru_RU">` +
    `<meta property="og:title" content="${ogTitle}">` +
    `<meta property="og:description" content="${ogDesc}">` +
    `<meta property="og:url" content="${url}">` +
    `<meta property="og:image" content="${img}">` +
    `<meta property="og:image:width" content="1200">` +
    `<meta property="og:image:height" content="630">` +
    `<meta name="twitter:card" content="summary_large_image">` +
    `<meta name="twitter:title" content="${ogTitle}">` +
    `<meta name="twitter:description" content="${ogDesc}">` +
    `<meta name="twitter:image" content="${img}">`;
}

function servePublic(req, res, config) {
  let pathname;
  try {
    pathname = decodeURIComponent(req.path);
  } catch {
    return res.status(400).type("text").send("Bad request");
  }
  if (pathname.includes("\0")) return res.status(400).type("text").send("Bad request");
  const requested = pathname === "/" ? "/index.html" : (path.extname(pathname) ? pathname : `${pathname}.html`);
  const filePath = path.resolve(config.publicDir, `.${requested}`);
  const publicRoot = path.resolve(config.publicDir) + path.sep;
  if (!filePath.startsWith(publicRoot)) return res.status(403).type("text").send("Forbidden");

  fs.readFile(filePath, (error, data) => {
    if (error) return res.status(404).type("text").send("Not found");
    const extension = path.extname(filePath);
    let body = data;
    if ([".html", ".txt", ".xml"].includes(extension)) {
      let html = data.toString("utf8")
        .replaceAll("{{BASE_URL}}", config.siteUrl)
        .replaceAll("{{TURNSTILE_SITE_KEY}}", config.turnstileSiteKey)
        .replaceAll("{{CONTACT_EMAIL}}", config.contactEmail)
        .replaceAll("{{PRIVACY_POLICY_VERSION}}", config.privacyPolicyVersion);
      if (extension === ".html" && html.includes("</head>")) {
        const pageUrl = config.siteUrl + (pathname === "/" ? "/" : pathname);
        const social = buildSocialTags(html, pageUrl, pathname.startsWith("/guides/"), `${config.siteUrl}/assets/og-cover.jpg`);
        html = html.replace("</head>", `${social}${YANDEX_METRIKA}</head>`);
      }
      body = Buffer.from(html);
    }
    res.set("Content-Type", CONTENT_TYPES[extension] || "application/octet-stream");
    res.set("Cache-Control", extension === ".html" ? "no-cache" : "public, max-age=604800");
    const compressible = [".html", ".css", ".js", ".svg", ".txt", ".xml"].includes(extension);
    if (compressible && /gzip/.test(req.headers["accept-encoding"] || "")) {
      zlib.gzip(body, (gzipError, compressed) => {
        if (gzipError) return res.send(body);
        res.set("Content-Encoding", "gzip");
        res.set("Vary", "Accept-Encoding");
        res.send(compressed);
      });
      return;
    }
    res.send(body);
  });
}

module.exports = { createApp, createRateLimiter, servePublic };
