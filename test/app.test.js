const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../src/app");

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
    async sendTelegram() { if (options.telegramFailure) throw new Error("telegram down"); return "telegram-id"; }
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
    contractStatus: "free",
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
