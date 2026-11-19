const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const a = require("../src/attribution");
const { validateApplication } = require("../src/validation");
const { normalizeQuery } = require("../scripts/normalize-cta-links");
const { plan } = require("../scripts/attribution-history-dry-run");

const PUBLIC = path.join(__dirname, "..", "public");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []);
function contactLinks() {
  const out = [];
  for (const locale of ["en", "ru"]) {
    for (const file of walk(path.join(PUBLIC, locale))) {
      const rel = path.relative(path.join(PUBLIC, locale), file).replace(/\\/g, "/").replace(/\.html$/, "");
      const own = (locale === "ru" ? "/ru" : "") + (rel === "index" ? "/" : `/${rel}`);
      for (const m of fs.readFileSync(file, "utf8").matchAll(/href="[^"]*\/contact\?([^"#]*)/g)) {
        out.push({ locale, file: path.relative(PUBLIC, file), own, params: new URLSearchParams(m[1].replace(/&amp;/g, "&")) });
      }
    }
  }
  return out;
}

function body(overrides = {}) {
  return { playerName: "Synthetic Player", birthYear: "2000", citizenship: "X", currentClub: "Y", position: "forward", heightCm: "185", weightKg: "85", stickHand: "left", phone: "+10000000000", email: "synthetic@example.test", dataConsent: "true", ...overrides };
}
const validate = (overrides, locale = "en") => validateApplication(body(overrides), [], new Date("2026-11-19T12:00:00Z"), false, locale).value.source;

test("intent: one spelling per service, older spellings resolve through aliases", () => {
  assert.equal(a.normalizeIntent("league-assessment").intent, "league_assessment");
  assert.equal(a.normalizeIntent("league_assessment").intent, "league_assessment");
  for (const legacy of ["assessment", "free-assessment", "player_assessment", "player_profile", "find_club"]) assert.equal(a.normalizeIntent(legacy).intent, "free_assessment", legacy);
  // the paid full analysis stays a separate service
  assert.equal(a.normalizeIntent("player-analysis").intent, "player_analysis");
  assert.equal(a.normalizeIntent("country_france").intent, "country_assessment");
  // an unknown CTA value is kept (normalised), never dropped
  assert.equal(a.normalizeIntent("New CTA").intent, "new_cta");
});

test("every /contact link on the site uses canonical intent, country, league and its own page as source_page", () => {
  const links = contactLinks();
  assert.ok(links.length > 300);
  for (const { file, own, params, locale } of links) {
    const intent = params.get("intent");
    if (intent) assert.ok(a.INTENTS[intent], `${file}: intent ${intent} is not canonical`);
    const country = params.get("country");
    if (country) assert.ok(a.COUNTRIES[country], `${file}: country ${country} is not an ISO code`);
    const league = params.get("league");
    if (league) assert.ok(a.LEAGUE_IDS.includes(league), `${file}: league ${league} is not a league id`);
    const page = params.get("source_page");
    if (page) {
      assert.equal(page, own, `${file}: source_page should be the CTA page itself`);
      if (locale === "ru") assert.ok(page.startsWith("/ru/"), `${file}: RU source_page without /ru`);
    }
  }
});

test("league never carries a service or a comparison", () => {
  for (const bad of ["offer-review", "DEL2-vs-Maxa-liga", "USA-junior"]) assert.deepEqual(a.normalizeLeague(bad), { league: null, input: null });
  assert.equal(normalizeQuery("league=offer-review&intent=league-assessment", "en"), "intent=offer_review");
  assert.equal(normalizeQuery("league=DEL2-vs-Maxa-liga", "en", "/guides/germany-del2-vs-czechia-maxa-liga"), "intent=league_comparison&source_page=/guides/germany-del2-vs-czechia-maxa-liga");
  const s = validate({ league: "offer-review", intent: "league-assessment" });
  assert.equal(s.league, null);
  assert.equal(s.league_input, undefined);
});

test("country and league are stored as stable ids; old labels and RU labels still work", () => {
  const s = validate({ country: "Sweden", league: "Sweden U20", intent: "league_assessment", locale: "en" });
  assert.equal(s.country, "SE");
  assert.equal(s.league, "sweden-j20");
  assert.equal(validate({ country: "Чехия" }, "ru").country, "CZ");
  assert.equal(validate({ country: "CZ", league: "czechia-maxa-liga" }).league, "czechia-maxa-liga");
  // unknown values are kept apart, not lost and not stored as an id
  const u = validate({ country: "Narnia", league: "Mystery Liga" });
  assert.equal(u.country, null);
  assert.equal(u.country_input, "Narnia");
  assert.equal(u.league_input, "Mystery Liga");
  // older clients that send none of the new fields still validate
  const old = validateApplication(body({}), [], new Date("2026-11-19T12:00:00Z"), false, "en");
  assert.equal(old.ok, true);
  assert.equal(old.value.source.country, null);
  assert.equal(old.value.source.from_calculator, false);
});

test("source_page keeps /ru for Russian pages and stays separate from the landing page", () => {
  const ru = validate({ sourcePage: "/guides/hokkej-v-rumynii", landingPage: "/ru/", locale: "ru" }, "ru");
  assert.equal(ru.source_page, "/ru/guides/hokkej-v-rumynii");
  assert.equal(ru.source_page_input, "/guides/hokkej-v-rumynii");
  assert.equal(ru.landing_page, "/ru/");
  assert.equal(validate({ sourcePage: "/ru/guides/hokkej-v-rumynii", locale: "ru" }, "ru").source_page, "/ru/guides/hokkej-v-rumynii");
  // a slug that exists in both languages is resolved by the form's language
  assert.equal(validate({ sourcePage: "/agent", locale: "ru" }, "ru").source_page, "/ru/agent");
  assert.equal(validate({ sourcePage: "/agent", locale: "en" }).source_page, "/agent");
  // a full URL is reduced to its path; tokens map to the guide
  assert.equal(validate({ sourcePage: "https://eurohockeyagency.com/ru/kalkulyator-urovnya?utm_source=x", locale: "ru" }, "ru").source_page, "/ru/kalkulyator-urovnya");
  assert.equal(validate({ sourcePage: "country_czechia", locale: "en" }).source_page, "/guides/hockey-in-czechia");
  const unknown = validate({ sourcePage: "/no-such-page" });
  assert.equal(unknown.source_page, null);
  assert.equal(unknown.source_page_input, "/no-such-page");
});

test("calculator CTA fields reach the CRM record", () => {
  const s = validate({ intent: "calculator_result", goal: "development", fromCalculator: "1", sourcePage: "/level-calculator", calcBand: "mid", calcScore: "73", calcLeagues: "Division 1" });
  assert.equal(s.intent, "calculator_result");
  assert.equal(s.goal, "development");
  assert.equal(s.from_calculator, true);
  assert.equal(s.source_page, "/level-calculator");
  assert.equal(validate({ goal: "<script>" }).goal, null);
});

test("contact form receives the hidden fields and labels in its own language", async () => {
  for (const locale of ["en", "ru"]) {
    const html = fs.readFileSync(path.join(PUBLIC, locale, "contact.html"), "utf8");
    for (const name of ["intent", "sourcePage", "country", "league", "goal", "fromCalculator"]) assert.ok(html.includes(`<input type="hidden" name="${name}">`), `${locale}: ${name}`);
    assert.ok(html.includes('<script type="application/json" id="eha-attribution-labels">{{ATTRIBUTION_LABELS}}</script>'));
  }
  assert.equal(a.labelsFor("ru").countries.SE, "Швеция");
  assert.equal(a.labelsFor("en").countries.SE, "Sweden");
  assert.equal(a.labelsFor("ru").leagues["finland-junior-hockey"], "Юниорский хоккей Финляндии");
  const site = fs.readFileSync(path.join(PUBLIC, "site.js"), "utf8");
  // the link's note is appended to the country/league context, not replaced by it
  assert.ok(site.includes("displayLeague?`${LANG==='en'?'Target league':'Интересующая лига'}: ${displayLeague}`:'',note].filter(Boolean)"));
  assert.ok(!site.includes("else if(note&&message"));
});

test("contact page is served with the labels JSON for its locale", async () => {
  const request = require("supertest");
  const { createApp } = require("../src/app");
  const primaryUrl = "https://eha.test";
  const app = createApp({ config: { port: 3000, publicDir: PUBLIC, siteUrl: primaryUrl, primaryUrl, primaryHost: "eha.test", enUrl: primaryUrl, ruUrl: `${primaryUrl}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "privacy@eha.test", privacyPolicyVersion: "test-v1", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: false, emailConfigured: false }, services: {} });
  for (const [url, se] of [["/ru/contact", "Швеция"], ["/contact", "Sweden"]]) {
    const res = await request(app).get(url).set("Host", "eha.test").expect(200);
    const json = /id="eha-attribution-labels">([^<]*)</.exec(res.text);
    assert.ok(json, `${url}: labels script present`);
    assert.equal(JSON.parse(json[1]).countries.SE, se);
    assert.ok(!res.text.includes("{{ATTRIBUTION_LABELS}}"));
  }
});

test("CRM history dry run proposes canonical values without writing, including /guides/hokkej-v-rumynii", () => {
  const rows = [
    { id: "r1", source: { locale: "ru", intent: "league-assessment", source_page: "/guides/hokkej-v-rumynii", league: "offer-review" } },
    { id: "r2", source: { locale: "en", intent: "free_assessment", source_page: "/guides/hockey-in-romania" } },
    { id: "r3", source: { locale: "ru", source_page: "/european-leagues → /level-calculator" } },
    { id: "r4", source: { locale: "en", source_page: "/gone" } }
  ];
  const before = JSON.stringify(rows);
  const result = plan(rows);
  assert.equal(JSON.stringify(rows), before, "input untouched");
  assert.equal(result.dryRun, true);
  assert.equal(result.changed, 2);
  const r1 = result.items.find((i) => i.id === "r1");
  assert.equal(r1.patch.source_page, "/ru/guides/hokkej-v-rumynii");
  assert.equal(r1.patch.intent, "league_assessment");
  assert.equal(r1.patch.league, null);
  assert.equal(r1.patch.league_input, "offer-review");
  const r3 = result.items.find((i) => i.id === "r3");
  assert.equal(r3.patch.source_page, "/level-calculator");
  assert.equal(r3.patch.previous_page, "/european-leagues");
  assert.equal(result.byField.source_page_ru_prefix_added, 1);
  assert.deepEqual(result.unresolved, [{ id: "r4", source_page: "/gone" }]);
});
