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

  // Generated from the files on disk, so new pages appear automatically.
  app.get("/sitemap.xml", (req, res) => sendBody(req, res, Buffer.from(buildSitemap(config)), ".xml"));
  app.get("/feed.xml", (req, res) => sendBody(req, res, Buffer.from(buildFeed(config)), ".xml"));

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
    if (error) return serveNotFound(req, res, config);
    const extension = path.extname(filePath);
    const body = renderBody(data, extension, config, pathname);
    sendBody(req, res, body, extension, 200);
  });
}

// Applies template tokens and, for HTML, injects social tags + analytics.
function renderBody(data, extension, config, pathname) {
  if (![".html", ".txt", ".xml"].includes(extension)) return data;
  let html = data.toString("utf8")
    .replaceAll("{{BASE_URL}}", config.siteUrl)
    .replaceAll("{{TURNSTILE_SITE_KEY}}", config.turnstileSiteKey)
    .replaceAll("{{CONTACT_EMAIL}}", config.contactEmail)
    .replaceAll("{{PRIVACY_POLICY_VERSION}}", config.privacyPolicyVersion);
  if (extension === ".html" && html.includes("</head>")) {
    const pageUrl = config.siteUrl + (pathname === "/" ? "/" : pathname);
    const social = buildSocialTags(html, pageUrl, pathname.startsWith("/guides/"), `${config.siteUrl}/assets/og-cover.jpg`);
    const feed = `<link rel="alternate" type="application/rss+xml" title="EHA — материалы для хоккеистов" href="${config.siteUrl}/feed.xml">`;
    html = html.replace("</head>", `${social}${feed}${YANDEX_METRIKA}</head>`);
  }
  return Buffer.from(html);
}

function sendBody(req, res, body, extension, status = 200) {
  res.status(status);
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
}

// Branded 404 page; falls back to plain text if the file is missing.
function serveNotFound(req, res, config) {
  fs.readFile(path.join(config.publicDir, "404.html"), (error, data) => {
    if (error) return res.status(404).type("text").send("Not found");
    sendBody(req, res, renderBody(data, ".html", config, "/404"), ".html", 404);
  });
}

const SITEMAP_EXCLUDED = /^(404|application-success|google[0-9a-f]+|yandex_[0-9a-f]+)\.html$/i;

// Collect every public .html page (excluding utility pages) with its mtime.
function collectPages(publicDir) {
  const pages = [];
  const walk = (dir, prefix) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "assets") walk(full, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith(".html") && !SITEMAP_EXCLUDED.test(entry.name)) {
        const slug = entry.name === "index.html" && prefix === "" ? "/" : `/${prefix}${entry.name.replace(/\.html$/, "")}`;
        let mtime = new Date();
        try { mtime = fs.statSync(full).mtime; } catch { /* keep default */ }
        pages.push({ slug, mtime, file: full });
      }
    }
  };
  walk(publicDir, "");
  return pages;
}

function xmlEscape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function buildSitemap(config) {
  const rows = collectPages(config.publicDir)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map(({ slug, mtime }) => {
      const isArticle = slug.startsWith("/guides/");
      const priority = slug === "/" ? "1.0" : slug === "/privacy" ? "0.3" : isArticle ? "0.8" : "0.9";
      const changefreq = slug === "/" || slug === "/guides" ? "weekly" : slug === "/privacy" ? "yearly" : "monthly";
      return `  <url><loc>${xmlEscape(config.siteUrl + slug)}</loc><lastmod>${mtime.toISOString().slice(0, 10)}</lastmod>` +
        `<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

function buildFeed(config) {
  const items = collectPages(config.publicDir)
    .filter(({ slug }) => slug.startsWith("/guides/"))
    .sort((a, b) => b.mtime - a.mtime)
    .map(({ slug, mtime, file }) => {
      let html = "";
      try { html = fs.readFileSync(file, "utf8"); } catch { /* skip content */ }
      const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || slug).split(" | ")[0].trim();
      const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || "";
      const url = config.siteUrl + slug;
      return `    <item>\n      <title>${xmlEscape(title)}</title>\n      <link>${xmlEscape(url)}</link>\n` +
        `      <guid isPermaLink="true">${xmlEscape(url)}</guid>\n      <pubDate>${mtime.toUTCString()}</pubDate>\n` +
        `      <description>${xmlEscape(description)}</description>\n    </item>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n` +
    `    <title>European Hockey Agency — материалы для хоккеистов</title>\n` +
    `    <link>${xmlEscape(config.siteUrl)}/guides</link>\n` +
    `    <description>Как найти клуб в Европе: лиги, резюме, видео, выбор уровня.</description>\n` +
    `    <language>ru</language>\n${items.join("\n")}\n  </channel>\n</rss>\n`;
}

module.exports = { createApp, createRateLimiter, servePublic, buildSitemap, buildFeed };
