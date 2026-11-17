const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");
const { build, validate } = require("../scripts/build-cases");
const { stripExpired } = require("../src/expiring-content");
const CASES = require("../src/cases-data");
const RULES = require("../src/country-rules");

const PUBLIC = path.join(__dirname, "..", "public");
const base = "https://eha.test";
const makeApp = (day) => createApp({
  config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true },
  services: {},
  now: () => new Date(`${day}T12:00:00Z`),
});
const app = makeApp("2026-11-17");
const get = (a, url) => request(a).get(url).set("Host", "eha.test");
const MARKETS = { SE: "sweden", FI: "finland", NO: "norway", DK: "denmark", DE: "germany", CZ: "czechia", SK: "slovakia", AT: "austria", CH: "switzerland", FR: "france", NL: "netherlands" };

test("case and rule data are valid", () => {
  assert.deepEqual(validate({ CASES, RULES }), []);
  for (const r of RULES) assert.equal(r.verified, true, r.id);
});

test("every Hockey markets country link on the home page resolves (EN and RU)", async () => {
  for (const url of ["/", "/ru"]) {
    const html = (await get(app, url)).text;
    const block = html.slice(html.indexOf('<div class="market-grid">'), html.indexOf("</section>", html.indexOf('<div class="market-grid">')));
    const links = [...block.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(links.length >= 12, `${url}: ${links.length} links`);
    for (const href of links) {
      const res = await get(app, href.replace("https://eha.test", ""));
      assert.equal(res.status, 200, `${url} -> ${href}`);
    }
  }
});

test("each market country page has the full landing structure and both CTAs", async () => {
  for (const [code, key] of Object.entries(MARKETS)) {
    for (const url of [`/guides/hockey-in-${key}`]) {
      const html = (await get(app, url)).text;
      for (const id of ["who-it-suits", "at-a-glance", "eha-process"]) assert.match(html, new RegExp(`id="${id}"`), `${url} #${id}`);
      assert.match(html, new RegExp(`/level-calculator\\?country=${key}`), `${url} calculator`);
      assert.match(html, /\/contact\?intent=country_/, `${url} submit profile`);
      assert.match(html, /href="https:\/\/wa\.me\/375297957818"/, `${url} WhatsApp`);
      assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ""), /\+375|795-78-18/, `${url} phone as text`);
      // cases block only when that country has confirmed, EHA-confirmed, public cases
      const expected = CASES.filter((c) => c.countryCode === code && c.publish && c.ehaConfirmed && c.status !== "pending");
      if (expected.length) {
        for (const c of expected) assert.ok(html.includes(`id="country-case-${c.id}"`), `${url} ${c.id}`);
      } else {
        assert.doesNotMatch(html, /id="country-cases"/, `${url} should hide the empty cases block`);
      }
      const others = CASES.filter((c) => c.countryCode !== code || c.status === "pending");
      for (const c of others) assert.ok(!html.includes(`id="country-case-${c.id}"`), `${url} must not show ${c.id}`);
    }
  }
});

test("/cases cards link back to the destination country guide", async () => {
  const html = (await get(app, "/cases")).text;
  const graham = html.slice(html.indexOf('id="case-jack-graham"'), html.indexOf("</article>", html.indexOf('id="case-jack-graham"')));
  assert.match(graham, /href="\/guides\/hockey-in-netherlands">Country guide: Netherlands/);
  const ru = (await get(app, "/ru/cases")).text;
  assert.match(ru, /id="case-jack-graham"[\s\S]*?href="\/ru\/guides\/hokkej-v-niderlandah"/);
});

test("adding a case updates the country page and /cases through the build (test data, not written)", () => {
  const extra = { id: "test-only-player", player: "Test Only Player", countryCode: "NO", team: "Test Club", league: "Hockeyliga1", season: "2026/27", fromTeam: "Origin Club", fromLeague: "Origin League", stage: "signed", status: "club_announcement", source: "https://example.test/announcement", caseUrl: null, ehaConfirmed: true, ehaBasis: "eha_cases_page", publish: true, media: [], note: { en: "Test", ru: "Тест" } };
  const out = build({ write: false, today: "2026-11-17", data: { CASES: [...CASES, extra], RULES } });
  const no = out[path.join(PUBLIC, "en", "guides", "hockey-in-norway.html")];
  assert.match(no, /id="country-case-test-only-player"/);
  assert.match(no, /Signed contract/);
  assert.match(no, /Origin Club \(Origin League\) → Test Club \(Hockeyliga1\)/);
  assert.match(no, /href="\/cases#case-test-only-player"/);
  assert.match(out[path.join(PUBLIC, "en", "cases.html")], /id="case-test-only-player"/);
  for (const variant of [{ ehaConfirmed: false }, { publish: false }, { status: "pending" }]) {
    const o = build({ write: false, today: "2026-11-17", data: { CASES: [...CASES, { ...extra, ...variant }], RULES } });
    assert.doesNotMatch(o[path.join(PUBLIC, "en", "guides", "hockey-in-norway.html")], /test-only-player/, JSON.stringify(variant));
  }
  // nothing was written to disk
  assert.doesNotMatch(fs.readFileSync(path.join(PUBLIC, "en", "cases.html"), "utf8"), /test-only-player/);
});

test("roster history is not presented as a professional contract", async () => {
  const html = (await get(app, "/guides/hockey-in-france")).text;
  const block = html.slice(html.indexOf('id="country-cases"'));
  assert.match(block, /Joined the roster/);
  assert.doesNotMatch(block.slice(0, block.indexOf("</section>")), /Signed contract|professional contract/i);
});

test("rules are split by type and expired rules disappear at request time", async () => {
  const se = (await get(app, "/guides/hockey-in-sweden")).text;
  assert.match(se, /Sporting registration and international transfer/);
  assert.match(se, /Right to work/);
  assert.match(se, /SEK 59,200/);
  // 2026 work-permit rule (validUntil 2026-12-31) must vanish in 2027 without a rebuild
  const later = (await get(makeApp("2027-01-15"), "/guides/hockey-in-sweden")).text;
  assert.match(se, /data-valid-until="2026-12-31"/);
  assert.doesNotMatch(later, /data-valid-until="2026-12-31"/);
  assert.match(later, /data-valid-until="2027-06-30"/);
  assert.doesNotMatch(later, /<h3>Right to work<\/h3>/);
  // a section whose every rule expired is removed entirely
  const all = stripExpired('<section class="country-extra" id="verified-rules"><h2>R</h2><div class="rule-group"><h3>W</h3><ul class="rule-list"><li data-valid-until="2026-01-01">x</li></ul></div><p>n</p></section>\nrest', "2026-11-17");
  assert.equal(all, "rest");
});
