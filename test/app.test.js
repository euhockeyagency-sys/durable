const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");
const { PAGES } = require("../src/locales");

function config(overrides = {}) {
  return {
    port: 3000,
    publicDir: require("node:path").join(__dirname, "..", "public"),
    siteUrl: "https://eha.test",
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

test("limits the sixth attempt from one address", async () => {
  const app = createApp({ config: config(), services: serviceMock(), now: () => new Date("2026-07-18T12:00:00Z") });
  for (let attempt = 0; attempt < 5; attempt += 1) await request(app).post("/api/applications").expect(400);
  await request(app).post("/api/applications").expect(429);
});

function splitConfig(overrides = {}) {
  return config({
    hostsConfigured: true,
    ruHost: "eurohockeyagency.ru",
    enHost: "eurohockeyagency.com",
    ruUrl: "https://eurohockeyagency.ru",
    enUrl: "https://eurohockeyagency.com",
    ...overrides
  });
}

test("every bilingual page exists as a file in both language directories", () => {
  const publicDir = path.join(__dirname, "..", "public");
  const toFile = (slug) => (slug === "/" ? "/index" : slug) + ".html";
  for (const page of PAGES) {
    assert.ok(fs.existsSync(path.join(publicDir, "ru", `.${toFile(page.ru)}`)), `missing RU file for ${page.ru}`);
    assert.ok(fs.existsSync(path.join(publicDir, "en", `.${toFile(page.en)}`)), `missing EN file for ${page.en}`);
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
  const ru = await request(app).get("/guides/hokkej-v-polshe").expect(200);
  assert.match(ru.text, /class="lang-switch" href="https:\/\/eha\.test\/en\/guides\/hockey-in-poland"/);
  const en = await request(app).get("/en/guides/hockey-in-poland").expect(200);
  assert.match(en.text, /class="lang-switch" href="https:\/\/eha\.test\/guides\/hokkej-v-polshe"/);
});

test("club pages and Poland guides appear in their language sitemaps", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const ru = await request(app).get("/sitemap.xml").expect(200);
  assert.match(ru.text, /https:\/\/eha\.test\/for-clubs/);
  assert.match(ru.text, /https:\/\/eha\.test\/guides\/hokkej-v-polshe/);
  const en = await request(app).get("/en/sitemap.xml").expect(200);
  assert.match(en.text, /https:\/\/eha\.test\/en\/for-clubs/);
  assert.match(en.text, /https:\/\/eha\.test\/en\/guides\/hockey-in-poland/);
});

test("serves the English home under /en/ with English canonical and hreflang", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const response = await request(app).get("/en/").expect(200);
  assert.match(response.text, /<html lang="en"/);
  assert.match(response.text, /rel="canonical" href="https:\/\/eha\.test\/en\/"/);
  assert.match(response.text, /hreflang="ru" href="https:\/\/eha\.test\/"/);
  assert.match(response.text, /hreflang="en" href="https:\/\/eha\.test\/en\/"/);
  assert.match(response.text, /og:locale" content="en_US"/);
});

test("serves an English page with a translated slug under /en/", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  await request(app).get("/en/for-players").expect(200);
  await request(app).get("/en/level-calculator").expect(200);
  const leagues = await request(app).get("/en/european-leagues").expect(200);
  assert.match(leagues.text, /Finland/);
});

test("the RU sitemap contains only Russian slugs, the EN sitemap only English", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const ru = await request(app).get("/sitemap.xml").expect(200);
  assert.match(ru.text, /https:\/\/eha\.test\/kalkulyator-urovnya/);
  assert.doesNotMatch(ru.text, /for-players/);
  const en = await request(app).get("/en/sitemap.xml").expect(200);
  assert.match(en.text, /https:\/\/eha\.test\/en\/for-players/);
  assert.doesNotMatch(en.text, /kalkulyator-urovnya/);
});

test("two-domain mode 301s a cross-language slug to the right domain", async () => {
  const app = createApp({ config: splitConfig(), services: serviceMock() });
  const r1 = await request(app).get("/players").set("Host", "eurohockeyagency.com").expect(301);
  assert.equal(r1.headers.location, "https://eurohockeyagency.ru/players");
  const r2 = await request(app).get("/level-calculator").set("Host", "eurohockeyagency.ru").expect(301);
  assert.equal(r2.headers.location, "https://eurohockeyagency.com/level-calculator");
});

test("two-domain mode serves each domain its own language for a shared slug", async () => {
  const app = createApp({ config: splitConfig(), services: serviceMock() });
  const en = await request(app).get("/services").set("Host", "eurohockeyagency.com").expect(200);
  assert.match(en.text, /<html lang="en"/);
  const ru = await request(app).get("/services").set("Host", "eurohockeyagency.ru").expect(200);
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
