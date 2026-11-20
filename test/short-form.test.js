const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");

const PUBLIC = path.join(__dirname, "..", "public");
const { createApp } = require("../src/app");
const { createSchemaState } = require("../src/intake/schema-state");
const { validateApplication } = require("../src/validation");

const base = "https://eha.test";
const config = { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true };
const appWith = (initial) => createApp({ config, services: {}, schemaState: createSchemaState({ initial }) });
const get = (app, url) => request(app).get(url).set("Host", "eha.test");
const mainPart = (html) => { const f = html.slice(html.indexOf('<form id="profile-form"')); return f.slice(0, f.indexOf("<details")); };
const body = { playerName: "Test Player", birthYear: "2001", citizenship: "Testonia", currentClub: "Club", position: "forward", phone: "+100", email: "a@b.test", dataConsent: "true" };

test("form: first step is the short list from 20.11; height, weight and stick hand stay required", async () => {
  for (const state of [true, false, null]) for (const url of ["/contact", "/ru/contact"]) {
    const html = (await get(appWith(state), url)).text;
    assert.ok(html.includes('data-measurements="required"') && !html.includes("MEASUREMENTS"), url);
    const main = mainPart(html);
    const required = [...main.matchAll(/<(?:input|select)\b[^>]*name="([A-Za-z]+)"[^>]*\srequired/g)].map((m) => m[1]);
    // Owner, 20.11.2026: first step = name, year of birth, position, height, weight,
    // video, Elite Prospects, additional information, one contact and consent.
    for (const name of ["playerName", "birthYear", "position", "heightCm", "weightKg", "stickHand"]) assert.ok(required.includes(name), `${url}: ${name} required`);
    for (const name of ["citizenship", "currentClub", "phone", "email"]) assert.ok(!required.includes(name), `${url}: ${name} not required`);
    for (const name of ["statsSeason", "goals", "budget", "photo", "citizenship", "currentClub"]) assert.ok(!main.includes(`name="${name}"`), `${url}: ${name} is in the optional block`);
    for (const name of ["eliteProspectsUrl", "videoUrls", "message", "phone", "email"]) assert.ok(main.includes(`name="${name}"`), `${url}: ${name} in the first step`);
  }
});

test("submission without height, weight or stick hand is refused with field errors", async () => {
  const app = appWith(true);
  let call = request(app).post("/api/applications");
  for (const [k, v] of Object.entries(body)) call = call.field(k, v);
  const res = await call;
  assert.equal(res.status, 400);
  for (const k of ["heightCm", "weightKg", "stickHand"]) assert.ok(res.body.errors && res.body.errors[k], k);
});

test("validation: measurements optional only when allowed; given values are always range-checked", () => {
  const now = new Date("2026-11-18T12:00:00Z");
  const strict = validateApplication(body, [], now, false, "en");
  assert.ok(strict.errors.heightCm && strict.errors.weightKg && strict.errors.stickHand);
  const relaxed = validateApplication(body, [], now, false, "en", { measurementsRequired: false });
  assert.equal(relaxed.ok, true);
  assert.equal(relaxed.value.heightCm, null);
  const bad = validateApplication({ ...body, heightCm: "500", stickHand: "both" }, [], now, false, "en", { measurementsRequired: false });
  assert.ok(bad.errors.heightCm && bad.errors.stickHand && !bad.errors.weightKg);
});

test("schema state: probe reads the migration marker and re-checks while the answer is not 'optional'", async () => {
  let error = { code: "42703", message: "column applications.birth_date does not exist" };
  let calls = 0; let clock = 0;
  const supabase = { from: () => ({ select: () => ({ limit: async () => { calls += 1; return { error }; } }) }) };
  const state = createSchemaState({ supabase, recheckMs: 1000, now: () => clock });
  assert.equal(state.measurementsRequired(), true);
  await state.probe();
  assert.equal(state.measurementsRequired(), true);
  error = null; clock = 5000;
  state.measurementsRequired(); // triggers a background re-check
  await state.probe();
  assert.equal(state.measurementsRequired(), false);
  const before = calls; clock = 50000; state.measurementsRequired();
  assert.equal(calls, before, "no more probes once optional");
});
