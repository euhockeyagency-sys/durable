const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const request = require("supertest");

const PUBLIC = path.join(__dirname, "..", "public");
const { PROFILES, validateProfile, profileById } = require("../src/league-profiles");
const { renderLeagueProfile, relatedLeagues } = require("../src/league-profile");
const calc = require("../public/assets/level-calculator.js");
const { createApp } = require("../src/app");
const { PAGES } = require("../src/locales");

const base = "https://eha.test";
const app = createApp({
  config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true },
  services: {},
  now: () => new Date("2026-11-18T12:00:00Z")
});
const get = (url) => request(app).get(url).set("Host", "eha.test");
const url = (p, locale) => (locale === "ru" ? `/ru${p.ru}` : p.en);

function leaguesSrc() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(PUBLIC, "assets", "leagues.src.js"), "utf8"), sandbox);
  return sandbox.window.EHA_LEAGUES_SRC.leagues;
}

test("every league profile is complete: season, scope, source and check date on each rule", () => {
  for (const p of PROFILES) assert.deepEqual(validateProfile(p), [], p.id);
  assert.ok(profileById("fr-d1") && profileById("pl-thl"));
});

test("each profile is paired in PAGES and linked from the league data source with a verified review", () => {
  const L = leaguesSrc();
  for (const p of PROFILES) {
    assert.ok(PAGES.some((x) => x.en === p.paths.en && x.ru === p.paths.ru), p.id);
    const rec = L.find((l) => l.name === p.data.name && l.country.en === p.data.country);
    assert.ok(rec, `${p.id} has a leagues.src.js record`);
    assert.equal(rec.url.en, p.paths.en);
    assert.equal(rec.review.reviewedAt, p.checkedAt, `${p.id}: directory review date matches the profile`);
    assert.notEqual(rec.review.status, "pending");
  }
});

test("league pages render the profile server-side with rules, windows, calculator and FAQ JSON-LD", async () => {
  for (const p of PROFILES) {
    for (const locale of ["en", "ru"]) {
      const res = await get(url(p.paths, locale));
      assert.equal(res.status, 200);
      const html = res.text;
      assert.ok(!html.includes("<!-- LEAGUE_"), "no marker left");
      assert.ok(html.includes(`<h2>${p.question[locale]}</h2>`), "main question as H2");
      for (const r of p.rules) assert.ok(html.includes(`data-rule-id="${r.id}"`), r.id);
      assert.ok(html.includes('id="windows"') && html.includes('id="salary-costs"') && html.includes('id="not-confirmed"'));
      assert.ok(html.includes('<form class="calc-form" id="calc" data-league-name="'), "embedded calculator");
      assert.match(html, /<script src="\/assets\/level-calculator\.js\?v=/);
      const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
      const faq = ld.find((d) => d["@type"] === "FAQPage");
      assert.ok(faq, "FAQPage present");
      for (const q of faq.mainEntity) assert.ok(html.includes(`<summary>${q.name.replace(/&/g, "&amp;")}</summary>`), `visible FAQ: ${q.name}`);
      assert.equal(html.match(/<h1>/g).length, 1);
      if (locale === "ru") assert.ok(!html.includes('href="/ru/ru/') && !/href="\/(contact|guides|ligi|leagues)\b/.test(html), "RU links prefixed once");
      // No phone number shown as text; WhatsApp only as a link.
      assert.ok(!/>\s*\+?375[\d\s]{6,}</.test(html));
    }
  }
});

test("Poland page states the regulation's Polish-player minimum, not an import cap, and labels the press report", async () => {
  const html = (await get("/leagues/poland-tauron-hokej-liga")).text;
  assert.ok(html.includes("at least 10 players with Polish citizenship or a Karta Polaka"));
  assert.ok(html.includes("§13.3–13.4"));
  assert.ok(html.includes("press report, not a regulation"));
  assert.ok(html.includes("former name"), "PHL explained as former name");
});

test("country guides show the rule summary from the same record", async () => {
  const pl = (await get("/guides/hockey-in-poland")).text;
  assert.ok(pl.includes('class="league-rules-summary" data-league-id="pl-thl"'));
  assert.ok(!pl.includes("Reported limit of ten imports"));
  const fr = (await get("/ru/guides/hokkej-vo-francii")).text;
  assert.ok(fr.includes('data-league-id="fr-d1"') && fr.includes('href="/ru/ligi/franciya-division-1#import-rules"'));
});

test("pilot pages are in the sitemap with both languages", async () => {
  const en = (await get("/sitemap.xml")).text;
  const ru = (await get("/ru/sitemap.xml")).text;
  for (const p of PROFILES) {
    assert.ok(en.includes(`${base}${p.paths.en}<`), p.paths.en);
    assert.ok(ru.includes(`${base}/ru${p.paths.ru}<`), p.paths.ru);
  }
});

test("related leagues: same country one tier away and similar tier elsewhere, only pages that exist", () => {
  const rel = relatedLeagues(profileById("fr-d1"), "en");
  assert.ok(rel.sameCountry.some((l) => l.url === "/leagues/france-ligue-magnus"));
  const files = new Set(fs.readdirSync(path.join(PUBLIC, "en", "leagues")).map((f) => `/leagues/${f.replace(/\.html$/, "")}`));
  for (const l of [...rel.sameCountry, ...rel.similar]) assert.ok(files.has(l.url), l.url);
});

test("calculator league fit follows the same band, passport and age logic", () => {
  const leagues = [{ name: "Division 1", country: "France", tier: 2, open: "high" }, { name: "Liiga", country: "Finland", tier: 1, open: "low" }];
  const base = { pos: "forward", points: 30, games: 40, seasons: 3, goal: "" };
  const mid = calc.calculate({ ...base, year: 2001, eu: false, level: "t3" }, leagues, "en");
  assert.deepEqual(mid.band, [2, 3]);
  assert.equal(calc.leagueFit(leagues[0], mid, { eu: false }), "fit");
  assert.equal(calc.leagueFit(leagues[1], mid, { eu: false }), "stretch");
  const top = calc.calculate({ ...base, year: 1998, eu: false, level: "top" }, leagues, "en");
  assert.equal(calc.leagueFit(leagues[1], top, { eu: false }), "access");
  assert.equal(calc.leagueFit(leagues[0], { ...top, band: [1, 1] }, { eu: true }), "below");
  assert.equal(calc.leagueFit(null, top, { eu: true }), "unknown");
  assert.ok(calc.findLeague([{ name: "Division 1", country: "France" }], "Division 1", "/guides/hockey-in-france"));
  for (const lang of ["en", "ru"]) for (const k of ["fit", "stretch", "below", "access", "junior", "unknown"]) assert.equal(typeof calc.STRINGS[lang].leagueFit[k], "function");
});

test("renderer escapes text and keeps logical internal paths", () => {
  const html = renderLeagueProfile(profileById("pl-thl"), "ru");
  assert.ok(html.includes('href="/guides/hokkej-v-polshe"'));
  assert.ok(!html.includes("/ru/"));
});
