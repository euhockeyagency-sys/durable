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

test("short form: only the basics are outside the optional block once the database allows it", async () => {
  for (const url of ["/contact", "/ru/contact"]) {
    const html = (await get(appWith(true), url)).text;
    assert.ok(html.includes('data-measurements="optional"') && !html.includes("MEASUREMENTS"), url);
    const main = mainPart(html);
    const required = [...main.matchAll(/<(?:input|select)\b[^>]*name="([A-Za-z]+)"[^>]*\srequired/g)].map((m) => m[1]);
    assert.deepEqual(required, ["playerName", "birthYear", "citizenship", "currentClub", "position", "phone", "email"], url);
    for (const name of ["heightCm", "weightKg", "stickHand", "statsSeason", "goals", "budget", "photo"]) assert.ok(!main.includes(`name="${name}"`), `${url}: ${name} is in the optional block`);
    assert.ok(main.includes('name="eliteProspectsUrl"') && main.includes('name="videoUrls"'));
    const more = html.slice(html.indexOf("<details"), html.indexOf("</details>"));
    assert.ok(!/name="(heightCm|weightKg|stickHand)"[^>]*\srequired/.test(more));
    assert.equal((more.match(/class="stats-row stats-extra"/g) || []).length, 3);
    assert.equal((html.match(/name="videoUrls"/g) || []).length, 3);
  }
});

test("until the migration is applied, height, weight and stick hand stay required in the main fields", async () => {
  for (const state of [false, null]) {
    const html = (await get(appWith(state), "/ru/contact")).text;
    assert.ok(html.includes('data-measurements="required"') && !html.includes("MEASUREMENTS"));
    const main = mainPart(html);
    for (const name of ["heightCm", "weightKg", "stickHand"]) assert.match(main, new RegExp(`name="${name}"[^>]*\\srequired`));
  }
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
