const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");
const { PAGES } = require("../src/locales");

function config(overrides = {}) {
  const primaryUrl = "https://eha.test";
  return {
    port: 3000,
    publicDir: require("node:path").join(__dirname, "..", "public"),
    // Consolidated single-domain model: English at the primary root, Russian
    // under /ru/, and a legacy Russian host kept only as a 301 source.
    siteUrl: primaryUrl,
    primaryUrl,
    primaryHost: "eha.test",
    enUrl: primaryUrl,
    ruUrl: `${primaryUrl}/ru`,
    ruPrefix: "/ru",
    legacyRuHost: "eha-legacy.test",
    contactEmail: "privacy@eha.test",
    privacyPolicyVersion: "test-v1",
    turnstileSiteKey: "test-site-key",
    trustProxy: false,
    applicationConfigured: true,
    missingApplicationKeys: [],
    turnstileConfigured: true,
    telegramConfigured: true,
    emailConfigured: true,
    ...overrides
  };
}

function serviceMock(options = {}) {
  const rows = { applications: [], application_files: [], application_notifications: [] };
  const uploaded = [];
  const removed = [];
  const supabase = {
    from(table) {
      return {
        async insert(value) {
          if (table === "applications" && options.persistenceFailure) return { error: new Error("database down") };
          if (table === "application_files" && options.metadataFailure) return { error: new Error("metadata down") };
          if (table === "application_notifications" && options.notificationAuditFailure) throw new Error("audit down");
          rows[table].push(value);
          return { error: null };
        },
        delete() {
          return { async eq(_column, id) { rows[table] = rows[table].filter((row) => row.id !== id && row.application_id !== id); return { error: null }; } };
        }
      };
    },
    storage: {
      from() {
        return {
          async upload(storagePath) { uploaded.push(storagePath); return { error: options.uploadFailure ? new Error("upload down") : null }; },
          async remove(paths) { removed.push(...paths); return { error: null }; }
        };
      }
    }
  };
  return {
    rows, uploaded, removed, supabase,
    async verifyTurnstile() {
      if (options.turnstileError) throw new Error("turnstile down");
      return { success: !options.turnstileInvalid };
    },
    async sendEmail() { if (options.emailFailure) throw new Error("email down"); return "email-id"; },
    async sendTelegram() { if (options.telegramFailure) throw new Error("telegram down"); return "telegram-id"; },
    async sendClubRequestEmail() { if (options.clubEmailFailure) throw new Error("email down"); return "club-email-id"; },
    async sendClubRequestTelegram() { if (options.clubTelegramFailure) throw new Error("telegram down"); return "club-telegram-id"; }
  };
}

function validRequest(agent, overrides = {}) {
  const fields = {
    playerName: "Иван Иванов",
    birthYear: "2000",
    citizenship: "Беларусь",
    currentClub: "HC Test",
    position: "forward",
    heightCm: "185",
    weightKg: "85",
    stickHand: "left",
    phone: "+375291234567",
    email: "ivan@example.com",
    eliteProspectsUrl: "https://www.eliteprospects.com/player/123/test",
    dataConsent: "true",
    "cf-turnstile-response": "valid-token",
    ...overrides
  };
  let call = agent.post("/api/applications");
  for (const [name, value] of Object.entries(fields)) call = call.field(name, value);
  return call;
}

function validClubRequest(agent, overrides = {}) {
  return agent.post("/api/club-request").send({
    clubName: "HC Test",
    contactName: "Anna Smith",
    email: "anna@example.com",
    country: "Poland",
    positionNeeded: "Centre",
    level: "Senior Division 1",
    message: "Two-way centre available from August.",
    dataConsent: true,
    turnstileToken: "valid-token",
    locale: "en",
    ...overrides
  });
}

test("redirects www and the legacy Russian host onto the primary domain", async () => {
  const app = createApp({ config: config(), services: serviceMock() });

  for (const [host, path, expected] of [
    // www of the primary domain -> primary root, path and query preserved.
    ["www.eha.test", "/guides/hockey-in-poland?source=www", "https://eha.test/guides/hockey-in-poland?source=www"],
    // Legacy Russian domain -> the /ru/ tree on the primary domain.
    ["eha-legacy.test", "/guides/hokkej-v-polshe?source=www", "https://eha.test/ru/guides/hokkej-v-polshe?source=www"],
    ["eha-legacy.test", "/", "https://eha.test/ru/"],
    ["www.eha-legacy.test", "/services", "https://eha.test/ru/services"]
  ]) {
    const response = await request(app).get(path).set("Host", host).expect(301);
    assert.equal(response.headers.location, expected);
  }
});

test("redirects Railway platform hosts to the primary origin", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app)
    .get("/guides/hockey-in-poland")
    .set("Host", "euro-hockey-agency-production.up.railway.app")
    .expect(301);
  assert.equal(response.headers.location, "https://eha.test/guides/hockey-in-poland");
});

test("serves the primary domain without redirecting", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  await request(app).get("/").set("Host", "eha.test").expect(200);
  await request(app).get("/ru/").set("Host", "eha.test").expect(200);
});

test("HTML responses support revalidation with ETag", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const first = await request(app).get("/").set("Host", "eha.test").expect(200);
  assert.match(first.headers.etag, /^"[a-f0-9]{64}"$/);
  assert.equal(first.headers["cache-control"], "public, max-age=0, must-revalidate");
  await request(app).get("/").set("Host", "eha.test").set("If-None-Match", first.headers.etag).expect(304);
});

test("rendered pages preload the locale-specific Oswald subset", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const en = await request(app).get("/").set("Host", "eha.test").expect(200);
  const ru = await request(app).get("/ru/").set("Host", "eha.test").expect(200);
  assert.match(en.text, /preload" as="font" href="\/assets\/fonts\/oswald-500-latin\.woff2/);
  assert.match(ru.text, /preload" as="font" href="\/assets\/fonts\/oswald-500-cyrillic\.woff2/);
});

test("rendered HTML inlines critical CSS and defers the full stylesheet", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app).get("/").set("Host", "eha.test").expect(200);
  assert.match(response.text, /<style data-critical-css>/);
  assert.match(response.text, /rel="preload" href="\/styles\.css\?v=[a-z0-9]+" as="style"/);
  assert.match(response.text, /media="print" onload="this\.media='all'"/);
});

test("priority league pages receive distinct editorial assessments in both languages", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const routes = [
    "/leagues/czechia-maxa-liga", "/leagues/czechia-tipsport-extraliga",
    "/leagues/germany-del2", "/leagues/germany-oberliga",
    "/leagues/denmark-1-division", "/leagues/denmark-metal-ligaen",
    "/leagues/poland-1-liga-mhl", "/leagues/poland-tauron-hokej-liga",
    "/ru/ligi/chehiya-maxa-liga", "/ru/ligi/chehiya-tipsport-extraliga",
    "/ru/ligi/germaniya-del2", "/ru/ligi/germaniya-oberliga",
    "/ru/ligi/daniya-1-division", "/ru/ligi/daniya-metal-ligaen",
    "/ru/ligi/polsha-1-liga-mhl", "/ru/ligi/polsha-tauron-hokej-liga"
  ];
  for (const route of routes) {
    const response = await request(app).get(route).set("Host", "eha.test").expect(200);
    assert.match(response.text, /class="editorial-assessment"/);
  }
});

test("league pages with verified facts render a season-labelled club table in both languages", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const en = await request(app).get("/leagues/finland-mestis").set("Host", "eha.test").expect(200);
  assert.match(en.text, /Clubs: 2025\/26 season/);
  assert.match(en.text, /<table[ >]/);
  assert.match(en.text, /Kokkola/);
  assert.match(en.text, /rel="nofollow noopener"/); // sources cited, external and non-endorsing
  const ru = await request(app).get("/ru/ligi/finlyandiya-mestis").set("Host", "eha.test").expect(200);
  assert.match(ru.text, /Клубы: сезон 2025\/26/);
  assert.match(ru.text, /Коккола/);
});

test("club tables cover multiple leagues, with an arena column only when data exists", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  // Full table: Swiss NL carries arena + capacity columns.
  const swiss = await request(app).get("/leagues/switzerland-national-league").set("Host", "eha.test").expect(200);
  assert.match(swiss.text, /PostFinance Arena/);
  assert.match(swiss.text, /<th>Capacity<\/th>/);
  // Club-and-city-only: Slovak Extraliga must NOT invent an arena column.
  const slovak = await request(app).get("/leagues/slovakia-tipsport-liga").set("Host", "eha.test").expect(200);
  assert.match(slovak.text, /HC Košice/);
  assert.doesNotMatch(slovak.text, /<th>Arena<\/th>/);
  // Russian mirror resolves and localises the city.
  const swissRu = await request(app).get("/ru/ligi/shvejcariya-national-league").set("Host", "eha.test").expect(200);
  assert.match(swissRu.text, /Цюрих/);
});

test("compresses HTML with Brotli when the client supports it", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app).get("/").set("Host", "eha.test").set("Accept-Encoding", "br").expect(200);
  assert.equal(response.headers["content-encoding"], "br");
  assert.equal(response.headers.vary, "Accept-Encoding");
});

test("robots.txt advertises both sitemaps on the primary origin", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app)
    .get("/robots.txt")
    .set("Host", "eha.test")
    .expect(200);
  assert.match(response.text, /Sitemap: https:\/\/eha\.test\/sitemap\.xml/);
  assert.match(response.text, /Sitemap: https:\/\/eha\.test\/ru\/sitemap\.xml/);
});

test("does not load an invalid Turnstile widget when captcha is not configured", async () => {
  const app = createApp({
    config: config({ turnstileConfigured: false, turnstileSiteKey: "" }),
    services: serviceMock()
  });
  const response = await request(app).get("/for-clubs").expect(200);
  assert.doesNotMatch(response.text, /challenges\.cloudflare\.com\/turnstile/);
  assert.doesNotMatch(response.text, /class="cf-turnstile"/);
});

test("loads Turnstile when captcha is configured", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app).get("/for-clubs").expect(200);
  assert.match(response.text, /challenges\.cloudflare\.com\/turnstile/);
  assert.match(response.text, /class="cf-turnstile" data-sitekey="test-site-key"/);
});

test("delivers a valid club request without writing to Supabase", async () => {
  const services = serviceMock();
  const app = createApp({ config: config({ clubRequestConfigured: true }), services, now: () => new Date("2026-07-23T12:00:00Z") });
  const response = await validClubRequest(request(app)).expect(201);
  assert.equal(response.body.ok, true);
  assert.match(response.body.reference, /^EHA-CLUB-202607-[A-F0-9]{6}$/);
  assert.equal(services.rows.applications.length, 0);
  assert.equal(services.rows.application_notifications.length, 0);
});

test("club request accepts phone when email is empty", async () => {
  const services = serviceMock();
  const app = createApp({ config: config({ clubRequestConfigured: true }), services });
  await validClubRequest(request(app), { email: "", phone: "+48123456789" }).expect(201);
});

test("club request requires at least one contact method", async () => {
  const services = serviceMock();
  const app = createApp({ config: config({ clubRequestConfigured: true }), services });
  const response = await validClubRequest(request(app), { email: "", phone: "" }).expect(400);
  assert.ok(response.body.errors.email);
  assert.ok(response.body.errors.phone);
});

test("club request honeypot prevents notification delivery", async () => {
  let calls = 0;
  const services = serviceMock();
  services.sendClubRequestEmail = async () => { calls += 1; };
  services.sendClubRequestTelegram = async () => { calls += 1; };
  const app = createApp({ config: config({ clubRequestConfigured: true }), services });
  await validClubRequest(request(app), { website: "https://spam.example" }).expect(400);
  assert.equal(calls, 0);
});

test("club request reports a notification channel failure", async () => {
  const services = serviceMock({ clubEmailFailure: true });
  const app = createApp({ config: config({ clubRequestConfigured: true }), services });
  const response = await validClubRequest(request(app)).expect(502);
  assert.equal(response.body.code, "notification_failed");
});

test("club request rate limiter rejects the sixth attempt", async () => {
  const app = createApp({ config: config({ clubRequestConfigured: true }), services: serviceMock() });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await request(app).post("/api/club-request").send({}).expect(400);
  }
  await request(app).post("/api/club-request").send({}).expect(429);
});

test("stores a valid adult application and notification audits", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  const response = await validRequest(request(app)).expect(201);
  assert.equal(response.body.ok, true);
  assert.match(response.body.reference, /^EHA-202607-[A-F0-9]{6}$/);
  assert.equal(services.rows.applications.length, 1);
  assert.equal(services.rows.application_notifications.length, 2);
  assert.deepEqual(services.rows.application_notifications.map((row) => row.status).sort(), ["sent", "sent"]);
});

test("returns English validation errors when locale=en, Russian by default", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  const en = await validRequest(request(app), { locale: "en", playerName: "" }).expect(400);
  assert.equal(en.body.errors.playerName, "Enter your first and last name.");
  const ru = await validRequest(request(app), { playerName: "" }).expect(400);
  assert.equal(ru.body.errors.playerName, "Укажите имя и фамилию.");
});

test("records the applicant locale in the stored source", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app), { locale: "en" }).expect(201);
  assert.equal(services.rows.applications[0].source.locale, "en");
});

test("rejects an application without an email to reply to", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  const response = await validRequest(request(app), { email: "" }).expect(400);
  assert.equal(response.body.code, "validation_error");
  assert.ok(response.body.errors.email);
  assert.equal(services.rows.applications.length, 0);
});

test("rejects a malformed email", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  const response = await validRequest(request(app), { email: "ivan@example" }).expect(400);
  assert.ok(response.body.errors.email);
  assert.equal(services.rows.applications.length, 0);
});

test("requires parent details and consent for a minor", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  const response = await validRequest(request(app), { birthYear: "2010" }).expect(400);
  assert.equal(response.body.code, "validation_error");
  assert.ok(response.body.errors.parentName);
  assert.ok(response.body.errors.parentContact);
  assert.ok(response.body.errors.parentConsent);
  assert.equal(services.rows.applications.length, 0);
});

test("accepts a minor when parent fields are present", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app), {
    birthYear: "2010",
    parentName: "Пётр Иванов",
    parentContact: "+375291111111",
    parentConsent: "true"
  }).expect(201);
  assert.equal(services.rows.applications[0].is_minor, true);
  assert.ok(services.rows.applications[0].parent_consent_at);
});

test("rejects a forged PDF by signature", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  const response = await validRequest(request(app))
    .attach("files", Buffer.from("not a pdf"), { filename: "resume.pdf", contentType: "application/pdf" })
    .expect(400);
  assert.ok(response.body.errors.files);
});

test("stores a valid PDF in the private application path", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app))
    .attach("files", Buffer.from("%PDF-1.4\nvalid test"), { filename: "resume.pdf", contentType: "application/pdf" })
    .expect(201);
  assert.equal(services.uploaded.length, 1);
  assert.match(services.uploaded[0], /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/);
  assert.equal(services.rows.application_files.length, 1);
});

test("removes an uploaded object when file metadata cannot be saved", async () => {
  const services = serviceMock({ metadataFailure: true });
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app))
    .attach("files", Buffer.from("%PDF-1.4\nvalid test"), { filename: "resume.pdf", contentType: "application/pdf" })
    .expect(503);
  assert.deepEqual(services.removed, services.uploaded);
  assert.equal(services.rows.applications.length, 0);
});

test("rejects a file larger than 5 MB with 413", async () => {
  const app = createApp({ config: config(), services: serviceMock(), now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app))
    .attach("files", Buffer.alloc(5 * 1024 * 1024 + 1, 1), { filename: "large.jpg", contentType: "image/jpeg" })
    .expect(413);
});

test("rejects a filled honeypot before external services are used", async () => {
  const services = serviceMock();
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  const response = await validRequest(request(app), { website: "https://spam.example" }).expect(400);
  assert.ok(response.body.errors.website);
  assert.equal(services.rows.applications.length, 0);
});

test("returns 422 when Turnstile rejects the token", async () => {
  const app = createApp({ config: config(), services: serviceMock({ turnstileInvalid: true }), now: () => new Date("2026-07-18T12:00:00Z") });
  const response = await validRequest(request(app)).expect(422);
  assert.equal(response.body.code, "verification_failed");
});

test("returns 503 and stores nothing when persistence fails", async () => {
  const services = serviceMock({ persistenceFailure: true });
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app)).expect(503);
  assert.equal(services.rows.applications.length, 0);
});

test("keeps a saved application when notifications fail", async () => {
  const services = serviceMock({ emailFailure: true, telegramFailure: true });
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app)).expect(201);
  assert.equal(services.rows.applications.length, 1);
  assert.deepEqual(services.rows.application_notifications.map((row) => row.status), ["failed", "failed"]);
});

test("keeps a saved application when notification audit fails", async () => {
  const services = serviceMock({ notificationAuditFailure: true });
  const app = createApp({ config: config(), services, now: () => new Date("2026-07-18T12:00:00Z") });
  await validRequest(request(app)).expect(201);
  assert.equal(services.rows.applications.length, 1);
});

test("application forms collect the fields required to assess age and eligibility", () => {
  for (const locale of ["en", "ru"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", "public", locale, "contact.html"), "utf8");
    assert.match(html, /name="birthYear" type="number"/);
    assert.match(html, /name="citizenship"[^>]*required/);
    assert.match(html, /name="currentClub"[^>]*required/);
    assert.doesNotMatch(html, /name="birthYear" value="2000"/);
    assert.doesNotMatch(html, /video\/(?:mp4|quicktime|webm)/);
  }
});

test("limits the sixth attempt from one address", async () => {
  const app = createApp({ config: config(), services: serviceMock(), now: () => new Date("2026-07-18T12:00:00Z") });
  for (let attempt = 0; attempt < 5; attempt += 1) await request(app).post("/api/applications").expect(400);
  await request(app).post("/api/applications").expect(429);
});

// The consolidated model has a single domain, so there is no separate "split"
// config anymore; kept as a thin alias so existing callers still read naturally.
function splitConfig(overrides = {}) {
  return config(overrides);
}

test("every bilingual page exists as a file in both language directories", () => {
  const publicDir = path.join(__dirname, "..", "public");
  const toFile = (slug) => (slug === "/" ? "/index" : slug) + ".html";
  for (const page of PAGES) {
    assert.ok(fs.existsSync(path.join(publicDir, "ru", `.${toFile(page.ru)}`)), `missing RU file for ${page.ru}`);
    assert.ok(fs.existsSync(path.join(publicDir, "en", `.${toFile(page.en)}`)), `missing EN file for ${page.en}`);
  }
});

test("routes expose the exact source file and content hash", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const publicDir = path.join(__dirname, "..", "public");
  const routes = [
    ["/", "en/index.html", "en"],
    ["/agent", "en/agent.html", "en"],
    ["/services", "en/services.html", "en"],
    ["/guides", "en/guides.html", "en"],
    ["/ru/", "ru/index.html", "ru"],
    ["/ru/agent", "ru/agent.html", "ru"],
    ["/ru/services", "ru/services.html", "ru"],
    ["/ru/guides", "ru/guides.html", "ru"]
  ];

  for (const [route, source, lang] of routes) {
    const response = await request(app).get(route).set("Host", "eha.test").expect(200);
    const expectedHash = require("node:crypto")
      .createHash("sha256")
      .update(fs.readFileSync(path.join(publicDir, source)))
      .digest("hex");
    assert.equal(response.headers["x-eha-source"], source);
    assert.equal(response.headers["x-eha-source-sha256"], expectedHash);
    assert.equal(response.headers["cache-control"], "public, max-age=0, must-revalidate");
    assert.match(response.text, new RegExp(`<html lang="${lang}"`));
  }
});

test("the /ru/ prefix serves Russian files with prefixed navigation", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  for (const [route, source] of [
    ["/ru/", "ru/index.html"],
    ["/ru/agent", "ru/agent.html"],
    ["/ru/services", "ru/services.html"],
    ["/ru/guides", "ru/guides.html"]
  ]) {
    const response = await request(app)
      .get(route)
      .set("Host", "eha.test")
      .expect(200);
    assert.equal(response.headers["x-eha-source"], source);
    assert.match(response.text, /<html lang="ru"/);
    assert.match(response.text, /href="\/ru\/services"/);
    assert.doesNotMatch(response.text, /href="\/ru\/styles\.css/);
  }
  const home = await request(app).get("/ru/").set("Host", "eha.test");
  assert.match(home.text, /rel="canonical" href="https:\/\/eha\.test\/ru\/"/);
});

test("legacy public URLs redirect permanently to the current structure", async () => {
  const app = createApp({ config: splitConfig(), services: serviceMock() });
  for (const [legacy, current] of [
    ["/about", "/agent"],
    ["/about-the-agent", "/agent"],
    ["/clients", "/cases"],
    ["/contact-us", "/contact"]
  ]) {
    const response = await request(app)
      .get(`${legacy}?source=search`)
      .set("Host", "eurohockeyagency.com")
      .expect(301);
    assert.equal(response.headers.location, `${current}?source=search`);
  }
});

test("Poland country guides contain all twelve sections", () => {
  const publicDir = path.join(__dirname, "..", "public");
  for (const file of [
    path.join(publicDir, "ru", "guides", "hokkej-v-polshe.html"),
    path.join(publicDir, "en", "guides", "hockey-in-poland.html")
  ]) {
    const html = fs.readFileSync(file, "utf8");
    const sections = [...html.matchAll(/data-country-section="(\d+)"/g)].map((match) => Number(match[1]));
    assert.deepEqual(sections, Array.from({ length: 12 }, (_, index) => index + 1));
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.match(html, /"@type":"FAQPage"/);
  }
});

test("Poland guide language switcher points to the translated guide", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const ru = await request(app).get("/ru/guides/hokkej-v-polshe").set("Host", "eha.test").expect(200);
  assert.match(ru.text, /class="lang-switch" href="https:\/\/eha\.test\/guides\/hockey-in-poland"/);
  const en = await request(app).get("/guides/hockey-in-poland").set("Host", "eha.test").expect(200);
  assert.match(en.text, /class="lang-switch" href="https:\/\/eha\.test\/ru\/guides\/hokkej-v-polshe"/);
});

test("club pages and Poland guides appear in their language sitemaps", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const en = await request(app).get("/sitemap.xml").set("Host", "eha.test").expect(200);
  assert.match(en.text, /https:\/\/eha\.test\/for-clubs/);
  assert.match(en.text, /https:\/\/eha\.test\/guides\/hockey-in-poland/);
  const ru = await request(app).get("/ru/sitemap.xml").set("Host", "eha.test").expect(200);
  assert.match(ru.text, /https:\/\/eha\.test\/ru\/for-clubs/);
  assert.match(ru.text, /https:\/\/eha\.test\/ru\/guides\/hokkej-v-polshe/);
});

test("serves the English home at the root with English canonical and hreflang", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app).get("/").set("Host", "eha.test").expect(200);
  assert.match(response.text, /<html lang="en"/);
  assert.match(response.text, /rel="canonical" href="https:\/\/eha\.test\/"/);
  assert.match(response.text, /hreflang="ru" href="https:\/\/eha\.test\/ru\/"/);
  assert.match(response.text, /hreflang="en" href="https:\/\/eha\.test\/"/);
  assert.match(response.text, /og:locale" content="en_US"/);
  // A stray /en/ prefix collapses to the clean root URL.
  const strayEn = await request(app).get("/en/").set("Host", "eha.test").expect(301);
  assert.equal(strayEn.headers.location, "https://eha.test/");
});

test("serves English pages with translated slugs at the root", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  await request(app).get("/for-players").set("Host", "eha.test").expect(200);
  await request(app).get("/level-calculator").set("Host", "eha.test").expect(200);
  const leagues = await request(app).get("/european-leagues").set("Host", "eha.test").expect(200);
  assert.match(leagues.text, /Finland/);
});

test("the RU sitemap contains only Russian slugs, the EN sitemap only English", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const ru = await request(app).get("/ru/sitemap.xml").set("Host", "eha.test").expect(200);
  assert.match(ru.text, /https:\/\/eha\.test\/ru\/kalkulyator-urovnya/);
  assert.doesNotMatch(ru.text, /for-players/);
  const en = await request(app).get("/sitemap.xml").set("Host", "eha.test").expect(200);
  assert.match(en.text, /https:\/\/eha\.test\/for-players/);
  assert.doesNotMatch(en.text, /kalkulyator-urovnya/);
});

test("a Russian-only slug at the root 301s into the /ru/ tree", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const r1 = await request(app).get("/players").set("Host", "eha.test").expect(301);
  assert.equal(r1.headers.location, "https://eha.test/ru/players");
  const r2 = await request(app).get("/kalkulyator-urovnya").set("Host", "eha.test").expect(301);
  assert.equal(r2.headers.location, "https://eha.test/ru/kalkulyator-urovnya");
});

test("a shared slug serves English at the root and Russian under /ru/", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const en = await request(app).get("/services").set("Host", "eha.test").expect(200);
  assert.match(en.text, /<html lang="en"/);
  const ru = await request(app).get("/ru/services").set("Host", "eha.test").expect(200);
  assert.match(ru.text, /<html lang="ru"/);
});

test("does not derive canonical URLs from an untrusted Host header", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app).get("/").set("Host", "attacker.example").expect(200);
  assert.match(response.text, /https:\/\/eha\.test\//);
  assert.doesNotMatch(response.text, /attacker\.example/);
});

test("returns a safe 503 when application services are not configured", async () => {
  const app = createApp({ config: config({ applicationConfigured: false, missingApplicationKeys: ["SUPABASE_URL"] }) });
  const response = await request(app).post("/api/applications").expect(503);
  assert.equal(response.body.code, "service_unavailable");
});

test("accepts an application without a captcha token when Turnstile is not configured", async () => {
  const services = serviceMock();
  const app = createApp({
    config: config({ turnstileConfigured: false }),
    services,
    now: () => new Date("2026-07-18T12:00:00Z")
  });
  const response = await validRequest(request(app), { "cf-turnstile-response": "" }).expect(201);
  assert.equal(response.body.ok, true);
  assert.equal(services.rows.applications.length, 1);
});

test("skips notification channels that are not configured", async () => {
  const services = serviceMock();
  const app = createApp({
    config: config({ telegramConfigured: true, emailConfigured: false }),
    services,
    now: () => new Date("2026-07-18T12:00:00Z")
  });
  await validRequest(request(app)).expect(201);
  assert.deepEqual(services.rows.application_notifications.map((row) => row.channel), ["telegram"]);
});

test("stores the application even when no channel can notify anyone", async () => {
  const services = serviceMock();
  const app = createApp({
    config: config({ telegramConfigured: false, emailConfigured: false }),
    services,
    now: () => new Date("2026-07-18T12:00:00Z")
  });
  await validRequest(request(app)).expect(201);
  assert.equal(services.rows.applications.length, 1);
  assert.equal(services.rows.application_notifications.length, 0);
});

test("health reports notification delivery with a masked recipient", async () => {
  const app = createApp({
    config: config({ notificationEmail: "euhockeyagency@gmail.com" }),
    services: serviceMock()
  });
  const response = await request(app).get("/api/health").expect(200);
  assert.deepEqual(response.body, {
    ok: true,
    applicationsConfigured: true,
    captchaConfigured: true,
    notifications: { email: true, telegram: true, emailTo: "eu***@gmail.com" }
  });
});

test("health reports an unnotified form as such", async () => {
  const app = createApp({
    config: config({ telegramConfigured: false, emailConfigured: false, notificationEmail: "" }),
    services: serviceMock()
  });
  const response = await request(app).get("/api/health").expect(200);
  assert.deepEqual(response.body.notifications, { email: false, telegram: false, emailTo: null });
});

// --- Tier 0 crawl guards: the internal link graph must be clean ------------
//
// ~18% of the site's internal links were broken, redirected or carried an
// unsubstituted template token before these landed. A leaking crawl graph
// cannot rank, so all three failure classes are build errors. The crawler
// asserts on arrays of offending edges, not counts, so a failure names exactly
// which link on which page is wrong.

function internalTarget(href) {
  // Returns the request path for an internal link, or null to skip (external,
  // mailto/tel, pure anchor, protocol-relative). Query and hash are dropped:
  // routing ignores them and they only fragment dedup.
  if (!href || href.startsWith("#") || href.startsWith("//")) return null;
  if (/^(?:mailto:|tel:|https?:\/\/(?!eha\.test\b))/i.test(href)) return null;
  let rest = href.replace(/^https:\/\/eha\.test/i, "");
  if (!rest.startsWith("/")) return null;
  return rest.split("#")[0].split("?")[0] || "/";
}

function extractHrefs(html) {
  return [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
}

test("no rendered page ships an unsubstituted template token", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const offenders = [];
  for (const page of PAGES) {
    for (const [route] of [[page.en], [`/ru${page.ru === "/" ? "" : page.ru}` || "/ru/"]]) {
      const url = route === "/ru" ? "/ru/" : route;
      const res = await request(app).get(url).set("Host", "eha.test");
      const tokens = res.text.match(/\{\{[A-Z_]+\}\}/g);
      if (tokens) offenders.push(`${url}: ${[...new Set(tokens)].join(", ")}`);
    }
  }
  assert.deepEqual(offenders, [], `unsubstituted tokens:\n${offenders.join("\n")}`);
});

test("every internal link resolves 200 at the exact URL linked", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const seen = new Set();
  const queue = ["/", "/ru/"];
  const broken = [];      // link target 404s
  const redirecting = []; // link target 301/302s (a wasted hop = not canonical)
  const request200 = async (url) => request(app).get(url).set("Host", "eha.test");

  // Fetch each distinct URL at most once. A page links the same targets many
  // times over (nav, footer, breadcrumbs), so without this the crawl fires
  // thousands of redundant requests, exhausting sockets and surfacing spurious
  // 404s for URLs that individually serve 200. Dedup keeps the graph assertions
  // identical while making the crawl deterministic and fast.
  const edgeCache = new Map();
  const probe = async (target) => {
    const cached = edgeCache.get(target);
    if (cached) return cached;
    const res = await request200(target);
    const isHtml = (res.headers["content-type"] || "").includes("text/html");
    const info = { status: res.status, location: res.headers.location, isHtml, text: isHtml ? res.text : "" };
    edgeCache.set(target, info);
    return info;
  };

  while (queue.length) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const page = await probe(url);
    if (!page.isHtml) continue; // asset already confirmed 200 by its own edge
    for (const href of extractHrefs(page.text)) {
      const target = internalTarget(href);
      if (target === null) continue;
      const edge = await probe(target);
      if (edge.status === 404) broken.push(`${url} -> ${target} (404)`);
      else if (edge.status >= 300 && edge.status < 400) {
        redirecting.push(`${url} -> ${target} (${edge.status} -> ${edge.location})`);
      }
      if (edge.status === 200 && edge.isHtml && !seen.has(target)) queue.push(target);
    }
  }
  assert.deepEqual(broken, [], `broken internal links:\n${broken.join("\n")}`);
  assert.deepEqual(redirecting, [], `internal links that redirect (link to the canonical URL instead):\n${redirecting.join("\n")}`);
  assert.ok(seen.size > 150, `crawler only reached ${seen.size} URLs — expected the whole site`);
});

test("a doubled /ru/ prefix 301s to the canonical URL", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const res = await request(app).get("/ru/ru/ligi/daniya-metal-ligaen").set("Host", "eha.test").expect(301);
  assert.equal(res.headers.location, "https://eha.test/ru/ligi/daniya-metal-ligaen");
  const triple = await request(app).get("/ru/ru/ru/services").set("Host", "eha.test").expect(301);
  assert.equal(triple.headers.location, "https://eha.test/ru/services");
});

test("the RU leagues hub never emits a doubled /ru/ru/ link", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const res = await request(app).get("/ru/ligi-evropy").set("Host", "eha.test").expect(200);
  assert.doesNotMatch(res.text, /href="\/ru\/ru\//);
});
