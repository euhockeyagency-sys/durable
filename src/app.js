const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { createHash } = require("node:crypto");
const express = require("express");
const multer = require("multer");
const { createApplicationHandler } = require("./applications");
const { createServices } = require("./services");
const { validateClubRequest } = require("./validation");
const { messages, normalizeLocale } = require("./messages");
const { resolveLocale, baseUrlFor, altUrlFor, hreflangFor } = require("./locales");

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

const PRIMARY_ORIGIN = "https://eurohockeyagency.com";
const PRIMARY_HOST = "eurohockeyagency.com";
const LEGACY_PATHS = new Map([
  ["/about", "/agent"],
  ["/about-the-agent", "/agent"],
  ["/clients", "/cases"],
  ["/contact-us", "/contact"]
]);

function createApp({ config, services, now, randomUUID } = {}) {
  if (!config) throw new Error("createApp requires config");
  const app = express();
  if (config.trustProxy !== false) app.set("trust proxy", config.trustProxy);
  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(redirectDuplicateHosts(config));
  app.get([...LEGACY_PATHS.keys()], (req, res) => {
    const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
    return res.redirect(301, `${LEGACY_PATHS.get(req.path)}${query}`);
  });

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
  const clubLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000, now: () => (now ? now().getTime() : Date.now()) });
  const appServices = services || ((config.applicationConfigured || config.clubRequestConfigured) ? createServices(config) : null);

  app.get("/api/health", (_req, res) => {
    // Notification state is reported too: storage alone being configured is not
    // enough — an application nobody is told about is a lost lead. The address
    // is masked so the endpoint stays safe to call publicly.
    res.json({
      ok: true,
      applicationsConfigured: config.applicationConfigured,
      captchaConfigured: Boolean(config.turnstileConfigured),
      notifications: {
        email: Boolean(config.emailConfigured),
        telegram: Boolean(config.telegramConfigured),
        emailTo: maskEmail(config.notificationEmail)
      }
    });
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
  app.post("/api/club-request", clubLimiter, express.json({ limit: "20kb" }), createClubRequestHandler({
    config,
    services: appServices,
    now,
    randomUUID
  }));
  app.all("/api/club-request", (_req, res) => {
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

  // Generated from the files on disk, so new pages appear automatically. Each
  // language gets its own sitemap/feed; the locale is resolved from host + path
  // exactly like a page request (so /en/sitemap.xml works pre-migration).
  const localeFeed = (build) => (req, res) => {
    const resolved = resolveLocale(req.headers.host, req.path, config);
    if (resolved.redirect) return res.redirect(resolved.redirect.status, resolved.redirect.location);
    sendBody(req, res, Buffer.from(build(config, resolved.locale)), ".xml");
  };
  app.get("/sitemap.xml", localeFeed(buildSitemap));
  app.get("/ru/sitemap.xml", localeFeed(buildSitemap));
  app.get("/en/sitemap.xml", localeFeed(buildSitemap));
  app.get("/feed.xml", localeFeed(buildFeed));
  app.get("/ru/feed.xml", localeFeed(buildFeed));
  app.get("/en/feed.xml", localeFeed(buildFeed));

  app.get("*path", (req, res) => servePublic(req, res, config));
  app.head("*path", (req, res) => servePublic(req, res, config));
  app.use((error, _req, res, _next) => {
    console.error("Unhandled request error", error);
    res.status(500).json({ ok: false, code: "internal_error" });
  });
  return app;
}

// Consolidate every legacy host onto the single primary domain, preserving the
// path and query so search engines transfer signals page-by-page:
//   - the former Russian domain (and its www) -> https://.com/ru/<same path>
//   - www of the primary domain, and any stray Railway host -> primary origin
// The primary host itself passes straight through to normal routing.
function redirectDuplicateHosts(config) {
  const primaryHost = config.primaryHost || PRIMARY_HOST;
  const legacyRuHost = config.legacyRuHost;

  return function redirectDuplicateHost(req, res, next) {
    const host = String(req.headers.host || "").split(":")[0].trim().toLowerCase();
    if (!host || host === primaryHost) return next();
    const originalUrl = req.originalUrl || "/";

    // Legacy Russian domain -> the /ru/ tree on the primary domain. Every old
    // .ru URL kept the Russian content at the root, so it maps under /ru/.
    if (legacyRuHost && (host === legacyRuHost || host === `www.${legacyRuHost}`)) {
      return res.redirect(301, `${config.ruUrl}${originalUrl === "/" ? "/" : originalUrl}`);
    }

    // www of the primary domain, or any leftover Railway host -> primary origin.
    if (host === `www.${primaryHost}` || host.endsWith(".up.railway.app")) {
      return res.redirect(301, `${config.enUrl}${originalUrl}`);
    }

    return next(); // unknown host: serve as the primary domain, never reflected
  };
}

// "euhockeyagency@gmail.com" -> "eu***@gmail.com": enough to confirm the right
// mailbox is configured, not enough to harvest the address.
function maskEmail(value) {
  const [user, domain] = String(value || "").split("@");
  if (!user || !domain) return null;
  return `${user.slice(0, 2)}***@${domain}`;
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

function createClubRequestHandler({ config, services, now = () => new Date(), randomUUID = cryptoRandomUUID } = {}) {
  return async function submitClubRequest(req, res) {
    const locale = normalizeLocale((req.body || {}).locale);
    const m = messages(locale);
    const configured = config.clubRequestConfigured !== undefined
      ? config.clubRequestConfigured
      : Boolean(config.emailConfigured || config.telegramConfigured);
    if (!configured || !services) {
      return res.status(503).json({
        ok: false,
        code: "service_unavailable",
        message: m.serviceUnavailable,
        contactEmail: config.contactEmail
      });
    }

    const validation = validateClubRequest(req.body || {}, Boolean(config.turnstileConfigured), locale);
    if (!validation.ok) {
      return res.status(400).json({ ok: false, code: "validation_error", errors: validation.errors });
    }

    if (config.turnstileConfigured) {
      try {
        const result = await services.verifyTurnstile({
          token: validation.value.turnstileToken,
          ip: req.ip,
          idempotencyKey: randomUUID(),
          action: "club_request"
        });
        if (!result.success) {
          return res.status(422).json({
            ok: false,
            code: "verification_failed",
            errors: { turnstile: m.verificationFailed }
          });
        }
      } catch (error) {
        console.error("Club request Turnstile verification unavailable", error.message);
        return res.status(503).json({
          ok: false,
          code: "verification_unavailable",
          message: m.verificationUnavailable,
          contactEmail: config.contactEmail
        });
      }
    }

    const createdAt = now();
    const reference = createClubRequestReference(createdAt, randomUUID);
    const clubRequest = { ...validation.value, reference, createdAt: createdAt.toISOString() };
    const deliveries = [];
    if (config.telegramConfigured !== false) {
      deliveries.push(["telegram", () => services.sendClubRequestTelegram(clubRequest)]);
    }
    if (config.emailConfigured !== false) {
      deliveries.push(["email", () => services.sendClubRequestEmail(clubRequest)]);
    }
    const results = await Promise.allSettled(deliveries.map(([, send]) => send()));
    const failed = results
      .map((result, index) => result.status === "rejected"
        ? `${deliveries[index][0]}: ${String(result.reason?.message || result.reason).slice(0, 300)}`
        : null)
      .filter(Boolean);
    if (failed.length) {
      console.error(`Club request ${reference} notification failure`, failed.join("; "));
      return res.status(502).json({
        ok: false,
        code: "notification_failed",
        message: m.notificationFailed,
        contactEmail: config.contactEmail
      });
    }
    return res.status(201).json({ ok: true, reference });
  };
}

function cryptoRandomUUID() {
  return require("node:crypto").randomUUID();
}

function createClubRequestReference(now, randomUUID = cryptoRandomUUID) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const suffix = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `EHA-CLUB-${year}${month}-${suffix}`;
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

// Cache-busting: CSS/JS are cached for a week, so their URLs must change when the
// file changes — otherwise returning visitors keep the stale version for days.
let assetVersions = null;
function assetVersion(config, file) {
  if (!assetVersions) {
    assetVersions = {};
    for (const name of ["styles.css", "site.js", "assets/leagues.ru.js", "assets/leagues.en.js"]) {
      try { assetVersions[name] = Math.round(fs.statSync(path.join(config.publicDir, name)).mtimeMs).toString(36); }
      catch { assetVersions[name] = "0"; }
    }
  }
  return assetVersions[file] || "0";
}

// Per-article share image when public/assets/covers/<slug>.jpg exists. Covers
// are shared across languages, so only the base URL differs per locale.
let coverCache = null;
function coverFor(config, logicalPath, baseUrl) {
  if (!coverCache) {
    try { coverCache = new Set(fs.readdirSync(path.join(config.publicDir, "assets", "covers"))); }
    catch { coverCache = new Set(); }
  }
  const slug = logicalPath.split("/").filter(Boolean).pop();
  return slug && coverCache.has(`${slug}.jpg`)
    ? `${baseUrl}/assets/covers/${slug}.jpg`
    : `${baseUrl}/assets/og-cover.jpg`;
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;").replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

// Build Open Graph + Twitter Card tags from the page's own <title>/description.
function buildSocialTags(html, pageUrl, isArticle, imageUrl, locale) {
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
    `<meta property="og:locale" content="${locale === "en" ? "en_US" : "ru_RU"}">` +
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

// The only files served from the shared public/ root (everything else lives in a
// language directory). Keep in sync with the actual contents of public/.
const SHARED_ROOT_ALLOW = /^\/(?:assets\/|favicon\.svg$|robots\.txt$|site\.js$|styles\.css$|google[0-9a-f]+\.html$|yandex_[0-9a-f]+\.html$)/i;

function servePublic(req, res, config) {
  let pathname;
  try {
    pathname = decodeURIComponent(req.path);
  } catch {
    return res.status(400).type("text").send("Bad request");
  }
  if (pathname.includes("\0")) return res.status(400).type("text").send("Bad request");

  const resolved = resolveLocale(req.headers.host, pathname, config);
  if (resolved.redirect) return res.redirect(resolved.redirect.status, resolved.redirect.location);
  const { locale, root, logicalPath, urlPrefix = "" } = resolved;

  const requested = logicalPath === "/" ? "/index.html"
    : (path.extname(logicalPath) ? logicalPath : `${logicalPath}.html`);
  const publicRoot = path.resolve(config.publicDir) + path.sep;
  // Try the language directory first. The shared root holds only assets and the
  // handful of language-neutral files below (styles, script, favicon, robots,
  // search-engine verification), so it is tried ONLY for those — otherwise a
  // language path like /ru/ru/services would resolve against the shared root and
  // serve a duplicate URL that should have 404'd.
  const candidates = [path.resolve(config.publicDir, root, `.${requested}`)];
  if (SHARED_ROOT_ALLOW.test(requested)) {
    candidates.push(path.resolve(config.publicDir, `.${requested}`));
  }
  const context = { locale, logicalPath, urlPrefix };

  const tryNext = (index) => {
    if (index >= candidates.length) return serveNotFound(req, res, config, locale, root);
    const filePath = candidates[index];
    if (!filePath.startsWith(publicRoot)) return res.status(403).type("text").send("Forbidden");
    fs.readFile(filePath, (error, data) => {
      if (error) return tryNext(index + 1);
      const extension = path.extname(filePath);
      if (extension === ".html") {
        const source = path.relative(config.publicDir, filePath).split(path.sep).join("/");
        res.set("X-EHA-Source", source);
        res.set("X-EHA-Source-SHA256", createHash("sha256").update(data).digest("hex"));
      }
      sendBody(req, res, renderBody(data, extension, config, context), extension, 200);
    });
  };
  tryNext(0);
}

// Applies template tokens and, for HTML, injects social tags + analytics.
// `context` carries the resolved locale and the language-neutral logical path.
function renderBody(data, extension, config, context) {
  if (![".html", ".txt", ".xml"].includes(extension)) return data;
  const { locale, logicalPath, urlPrefix = "" } = context;
  // baseUrlFor already returns .com for EN and .com/ru for RU, so canonical,
  // og:url, hreflang, sitemap and feed all read the same consolidated URLs.
  const baseUrl = baseUrlFor(locale, config);
  // English is at the domain root, so the {{EN}} link-prefix token is now empty
  // (kept only so any older template that still uses it resolves cleanly).
  // Russian internal links get the /ru/ prefix applied by prefixInternalLinks.
  const enPrefix = "";
  let html = data.toString("utf8")
    .replaceAll("{{BASE_URL}}", baseUrl)
    .replaceAll("{{EN}}", enPrefix)
    // Russian internal links are logical (no /ru/); prefixInternalLinks applies
    // the /ru/ prefix below, so the RU link-prefix token resolves to empty just
    // like {{EN}}. Without this the raw token shipped to the browser as a broken
    // relative URL (e.g. /ru/ligi/x/{{RU}}/services).
    .replaceAll("{{RU}}", "")
    .replaceAll("{{ALT_URL}}", altUrlFor(locale, logicalPath, config))
    .replaceAll("{{TURNSTILE_SITE_KEY}}", config.turnstileSiteKey)
    .replaceAll("{{CONTACT_EMAIL}}", config.contactEmail)
    .replaceAll("{{PRIVACY_POLICY_VERSION}}", config.privacyPolicyVersion);
  if (extension === ".html" && urlPrefix) {
    html = prefixInternalLinks(html, urlPrefix);
  }
  if (extension === ".html" && !config.turnstileConfigured) {
    html = html
      .replace(/<script src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js" async defer><\/script>\s*/g, "")
      .replace(/<div class="cf-turnstile"[^>]*><\/div>/g, "");
  }
  if (extension === ".html") {
    html = html
      .replaceAll('href="/styles.css"', `href="/styles.css?v=${assetVersion(config, "styles.css")}"`)
      .replaceAll('src="/site.js"', `src="/site.js?v=${assetVersion(config, "site.js")}"`)
      .replaceAll('src="/assets/leagues.ru.js"', `src="/assets/leagues.ru.js?v=${assetVersion(config, "assets/leagues.ru.js")}"`)
      .replaceAll('src="/assets/leagues.en.js"', `src="/assets/leagues.en.js?v=${assetVersion(config, "assets/leagues.en.js")}"`);
  }
  if (extension === ".html" && html.includes("</head>")) {
    const pageUrl = joinUrl(baseUrl, logicalPath);
    const isArticle = logicalPath.startsWith("/guides/");
    const social = buildSocialTags(html, pageUrl, isArticle, coverFor(config, logicalPath, baseUrl), locale);
    const fontSubset = locale === "ru" ? "oswald-500-cyrillic" : "oswald-500-latin";
    const fontPreload = `<link rel="preload" as="font" href="/assets/fonts/${fontSubset}.woff2" type="font/woff2" crossorigin>`;
    const feedTitle = locale === "en" ? "EHA — resources for players" : "EHA — материалы для хоккеистов";
    const feed = `<link rel="alternate" type="application/rss+xml" title="${feedTitle}" href="${baseUrl}/feed.xml">`;
    html = html.replace("</head>", `${fontPreload}${social}${buildHreflang(logicalPath, locale, config)}${feed}${YANDEX_METRIKA}</head>`);
  }
  return Buffer.from(html);
}

function prefixInternalLinks(html, prefix) {
  const seg = prefix.replace(/^\/+/, ""); // "/ru" -> "ru"
  return html.replace(/href="\/([^"]*)"/g, (match, target) => {
    if (/^(?:assets\/|styles\.css(?:\?|$)|site\.js(?:\?|$)|favicon\.svg$)/.test(target)) return match;
    // Idempotent: a link already under the prefix must not be prefixed again,
    // or it becomes a duplicate /ru/ru/... URL.
    if (target === seg || target.startsWith(`${seg}/`)) return match;
    return `href="${prefix}/${target}"`;
  });
}

function joinUrl(base, logicalPath) {
  return logicalPath === "/" ? `${base}/` : base + logicalPath;
}

// hreflang alternates for bilingual pages; empty for pages with no declared
// translation (assets, untranslated guides).
function buildHreflang(logicalPath, locale, config) {
  const alts = hreflangFor(logicalPath, locale, config);
  if (!alts) return "";
  return `<link rel="alternate" hreflang="ru" href="${htmlEscape(alts.ru)}">` +
    `<link rel="alternate" hreflang="en" href="${htmlEscape(alts.en)}">` +
    `<link rel="alternate" hreflang="x-default" href="${htmlEscape(alts.en)}">`;
}

function sendBody(req, res, body, extension, status = 200) {
  res.status(status);
  res.set("Content-Type", CONTENT_TYPES[extension] || "application/octet-stream");
  const cacheableHtml = extension === ".html" && status === 200;
  res.set("Cache-Control", cacheableHtml
    ? "public, max-age=0, must-revalidate"
    : extension === ".html" ? "no-cache, no-store, must-revalidate" : "public, max-age=604800");
  if (cacheableHtml) {
    const etag = `"${createHash("sha256").update(body).digest("hex")}"`;
    res.set("ETag", etag);
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
  }
  const compressible = [".html", ".css", ".js", ".svg", ".txt", ".xml"].includes(extension);
  const acceptedEncoding = req.headers["accept-encoding"] || "";
  if (compressible && /br/.test(acceptedEncoding)) {
    zlib.brotliCompress(body, (brotliError, compressed) => {
      if (brotliError) return res.send(body);
      res.set("Content-Encoding", "br");
      res.set("Vary", "Accept-Encoding");
      res.send(compressed);
    });
    return;
  }
  if (compressible && /gzip/.test(acceptedEncoding)) {
    zlib.gzip(body, (gzipError, compressed) => {
      if (gzipError) return res.send(body);
      res.set("Content-Encoding", "gzip");
      res.set("Vary", "Accept-Encoding");
      res.send(compressed);
    });
    return;
  }
  if (compressible) res.set("Vary", "Accept-Encoding");
  res.send(body);
}

// Branded 404 page in the requested language; falls back to plain text.
function serveNotFound(req, res, config, locale = "ru", root = "ru") {
  res.set("X-Robots-Tag", "noindex");
  fs.readFile(path.join(config.publicDir, root, "404.html"), (error, data) => {
    if (error) return res.status(404).type("text").send("Not found");
    sendBody(req, res, renderBody(data, ".html", config, { locale, logicalPath: "/404" }), ".html", 404);
  });
}

const SITEMAP_EXCLUDED = /^(404|application-success|google[0-9a-f]+|yandex_[0-9a-f]+)\.html$/i;

// Collect every .html page in one language's directory (public/<locale>/),
// excluding utility pages, with its git-based modification date when the
// deployment generated public/assets/lastmod.json. Slugs are language-neutral
// logical paths (the locale directory is not part of the URL).
function collectPages(publicDir, locale = "ru") {
  const pages = [];
  const root = path.join(publicDir, locale);
  let lastmod = {};
  try { lastmod = JSON.parse(fs.readFileSync(path.join(publicDir, "assets", "lastmod.json"), "utf8")); } catch { /* local checkout before deploy */ }
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
        const relative = path.relative(path.join(publicDir, ".."), full).split(path.sep).join("/");
        const gitDate = lastmod[relative];
        if (gitDate) mtime = new Date(`${gitDate}T00:00:00Z`);
        pages.push({ slug, mtime, file: full });
      }
    }
  };
  walk(root, "");
  return pages;
}

function xmlEscape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function buildSitemap(config, locale = "ru") {
  const base = baseUrlFor(locale, config);
  const rows = collectPages(config.publicDir, locale)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map(({ slug, mtime }) => {
      const isArticle = slug.startsWith("/guides/");
      const priority = slug === "/" ? "1.0" : slug === "/privacy" ? "0.3" : isArticle ? "0.8" : "0.9";
      const changefreq = slug === "/" || slug === "/guides" ? "weekly" : slug === "/privacy" ? "yearly" : "monthly";
      return `  <url><loc>${xmlEscape(joinUrl(base, slug))}</loc><lastmod>${mtime.toISOString().slice(0, 10)}</lastmod>` +
        `<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

const FEED_META = {
  ru: {
    title: "European Hockey Agency — материалы для хоккеистов",
    description: "Как найти клуб в Европе: лиги, резюме, видео, выбор уровня."
  },
  en: {
    title: "European Hockey Agency — resources for players",
    description: "How to find a club in Europe: leagues, resume, video, picking a level."
  }
};

function buildFeed(config, locale = "ru") {
  const base = baseUrlFor(locale, config);
  const meta = FEED_META[locale] || FEED_META.ru;
  const items = collectPages(config.publicDir, locale)
    .filter(({ slug }) => slug.startsWith("/guides/"))
    .sort((a, b) => b.mtime - a.mtime)
    .map(({ slug, mtime, file }) => {
      let html = "";
      try { html = fs.readFileSync(file, "utf8"); } catch { /* skip content */ }
      const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || slug).split(" | ")[0].trim();
      const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || "";
      const url = joinUrl(base, slug);
      return `    <item>\n      <title>${xmlEscape(title)}</title>\n      <link>${xmlEscape(url)}</link>\n` +
        `      <guid isPermaLink="true">${xmlEscape(url)}</guid>\n      <pubDate>${mtime.toUTCString()}</pubDate>\n` +
        `      <description>${xmlEscape(description)}</description>\n    </item>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n` +
    `    <title>${xmlEscape(meta.title)}</title>\n` +
    `    <link>${xmlEscape(base)}/guides</link>\n` +
    `    <description>${xmlEscape(meta.description)}</description>\n` +
    `    <language>${locale}</language>\n${items.join("\n")}\n  </channel>\n</rss>\n`;
}

module.exports = {
  createApp,
  createRateLimiter,
  createClubRequestHandler,
  createClubRequestReference,
  servePublic,
  buildSitemap,
  buildFeed
};
