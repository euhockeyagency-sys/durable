"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../src/app");
const { compareTable, byline, REVIEWED } = require("../src/article-blocks");

const config = () => ({
  port: 0, publicDir: require("node:path").join(__dirname, "..", "public"), siteUrl: "http://eha.test", primaryUrl: "http://eha.test", primaryHost: "eha.test",
  enUrl: "http://eha.test", ruUrl: "http://eha.test/ru", ruPrefix: "/ru", legacyRuHost: "legacy.invalid", contactEmail: "p@eha.test", privacyPolicyVersion: "t",
  turnstileSiteKey: "", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: false, telegramConfigured: true, emailConfigured: true
});
const app = createApp({ config: config(), services: {} });
const get = (url) => request(app).get(url).set("Host", "eha.test").expect(200);

const ARTICLES = [
  ["/guides/best-european-hockey-leagues-for-imports", "/ru/guides/luchshie-ligi-evropy-dlya-legionerov"],
  ["/guides/france-poland-or-alps-hockey-league-after-juniors", "/ru/guides/franciya-polsha-ili-alps-hockey-league-posle-yuniorov"],
  ["/guides/paid-hockey-showcases-in-europe", "/ru/guides/platnye-prosmotry-i-shoukejsy-v-evrope"],
  ["/guides/restart-hockey-career-after-bad-season-or-injury", "/ru/guides/perezapusk-kariery-posle-slabogo-sezona-ili-travmy"],
  ["/guides/sweden-hockeyallsvenskan-vs-finland-mestis", "/ru/guides/shvetsiya-hockeyallsvenskan-vs-finlyandiya-mestis"],
  ["/guides/hockey-transfer-windows", "/ru/guides/transfernye-okna-v-hokkee"]
];

test("content-plan articles: byline, calculator link mid-article and at the end, submit profile and WhatsApp without the number as text", async () => {
  for (const pair of ARTICLES) {
    for (const url of pair) {
      const html = (await get(url)).text;
      assert.ok(html.includes('class="article-byline"') && /href="(\/ru)?\/agent"/.test(html), `${url}: byline links to the agent`);
      assert.ok(html.includes('class="calc-cta"') && html.includes('id="next-step"'), `${url}: calculator mid and end`);
      assert.ok(/\/contact\?intent=[a-z0-9_]+&amp;source_page=/.test(html) && html.includes("wa.me/375297957818"), `${url}: submit profile and WhatsApp`);
      assert.ok(!/>\s*\+?375[\d\s-]{6,}</.test(html), `${url}: no phone as text`);
      assert.ok(!html.includes("<!-- LEAGUE_") && !html.includes("<!-- EHA_BYLINE"), `${url}: markers replaced`);
      const other = pair.find((u) => u !== url);
      assert.ok(html.includes(`hreflang="${other.startsWith("/ru") ? "ru" : "en"}" href="http://eha.test${other}"`), `${url}: reciprocal hreflang`);
    }
  }
});

test("top-10 leagues table is built from league profiles, with press rules labelled", async () => {
  const html = (await get("/guides/best-european-hockey-leagues-for-imports")).text;
  const rows = html.match(/<tr data-league-id="[a-z0-9-]+"/g) || [];
  assert.equal(rows.length, 10);
  assert.ok(html.includes("press report, not a regulation"));
  assert.ok(html.includes("€35,000–150,000+") || html.includes("EUR 35,000–150,000+"));
});

test("comparison and byline blocks: no salary invented, byline names the agent as author", () => {
  const ru = compareTable(["fi-mestis", "uk-eihl"], "ru");
  assert.ok(ru.includes("Надёжной выборки нет"));
  assert.equal(REVIEWED.size, 0);
  const en = byline("/guides/paid-hockey-showcases-in-europe", "en");
  assert.ok(en.includes('<strong>By <a href="/agent">Viachaslau Marshchonak</a></strong>') && !en.includes("Reviewed by"));
  assert.ok(byline("/guides/platnye-prosmotry-i-shoukejsy-v-evrope", "ru").includes('<strong>Автор: <a href="/agent">Вячеслав Морщенок</a></strong>'));
});

test("transfer windows guide lists official 2026/27 league deadlines from the profiles", async () => {
  const html = (await get("/guides/hockey-transfer-windows")).text;
  assert.ok(html.includes("15 February 2027") && html.includes("31 December 2026, 23:59") && html.includes("11 January 2027"));
});

test("calculator: up to three matching guides, the league page first, the directory when nothing matches", () => {
  const calc = require("../public/assets/level-calculator.js");
  const leagues = [
    { name: "A", country: "Germany", tier: 2, open: "mid", url: "/leagues/a" },
    { name: "B", country: "Germany", tier: 2, open: "mid" },
    { name: "C", country: "Poland", tier: 2, open: "mid" },
    { name: "D", country: "Atlantis", tier: 2, open: "mid" },
    { name: "E", country: "France", tier: 2, open: "mid", url: "/leagues/e" }
  ];
  const items = calc.recommendGuides({ candidates: leagues }, "en");
  assert.deepEqual(items.map((i) => i.url), ["/leagues/a", "/guides/hockey-in-germany", "/guides/hockey-in-poland"]);
  assert.equal(calc.recommendGuides({ candidates: [leagues[0]] }, "en").length, 1);
  const none = calc.renderRecommendations([], "ru");
  assert.ok(none.includes('href="/ru/ligi-evropy"') && none.includes("Данных недостаточно"));
});

test("transfer calendar: every directory country in server HTML, statuses and sources, filters for country, league and category", async () => {
  global.window = {};
  require("../public/assets/leagues.src.js");
  const countries = [...new Set(global.window.EHA_LEAGUES_SRC.leagues.map((l) => l.country.en))];
  const { ROWS } = require("../src/transfer-calendar");
  for (const c of countries) assert.ok(ROWS.some((r) => r.country.en === c), `calendar covers ${c}`);
  for (const r of ROWS) {
    assert.ok(["confirmed", "needs_check", "not_published"].includes(r.status));
    if (r.status === "confirmed") assert.ok(r.source, `${r.country.en} ${r.league}: confirmed rows need a source`);
  }
  for (const url of ["/guides/transfer-calendar-2026-27", "/ru/guides/kalendar-transfernyh-okon-2026-27"]) {
    const html = (await get(url)).text;
    assert.equal((html.match(/<tr data-country=/g) || []).length, ROWS.length);
    for (const f of ["country", "league", "category"]) assert.ok(html.includes(`data-filter="${f}"`));
    assert.ok(html.includes("/assets/transfer-calendar.js"));
  }
});

test("free Hockey CV: editable .docx and PDF download without a form", async () => {
  for (const [file, type] of [["EHA-Hockey-CV-template.docx", "wordprocessingml"], ["EHA-Hockey-CV-template.pdf", "application/pdf"], ["EHA-hokkejnoe-rezyume-shablon.docx", "wordprocessingml"], ["EHA-hokkejnoe-rezyume-shablon.pdf", "application/pdf"]]) {
    const res = await get(`/assets/downloads/${file}`);
    assert.ok(String(res.headers["content-type"]).includes(type), file);
    assert.ok(res.body.length > 5000 || (res.text || "").length > 5000, file);
  }
  const page = (await get("/guides/hockey-resume-for-european-clubs")).text;
  assert.ok(page.includes('href="/assets/downloads/EHA-Hockey-CV-template.docx" download') && page.includes('EHA-Hockey-CV-template.pdf'));
});

test("new articles, comparisons and club guides: B2B pages lead to /for-clubs", async () => {
  const pairs = [
    ["/guides/net-vs-gross-hockey-salary-germany-poland", "/ru/guides/netto-i-brutto-zarplata-hokkeista-germaniya-polsha"],
    ["/guides/hockey-player-insurance-abroad", "/ru/guides/strahovka-hokkeista-legionera"],
    ["/guides/from-usphl-ehl-na3hl-to-senior-hockey-in-europe", "/ru/guides/iz-usphl-ehl-na3hl-vo-vzroslyj-hokkej-evropy"],
    ["/guides/european-u20-hockey-sweden-finland-czechia-switzerland-austria", "/ru/guides/evropejskie-u20-shvetsiya-finlyandiya-chehiya-shvejcariya-avstriya"],
    ["/guides/why-points-do-not-translate-between-hockey-leagues", "/ru/guides/pochemu-ochki-ne-perenosyatsya-mezhdu-ligami"],
    ["/guides/alps-hockey-league-vs-oberliga", "/ru/guides/alps-hockey-league-ili-oberliga"],
    ["/guides/tauron-hokej-liga-vs-ligue-magnus", "/ru/guides/tauron-hokej-liga-ili-ligue-magnus"],
    ["/guides/hockeyettan-vs-mestis", "/ru/guides/hockeyettan-ili-mestis"],
    ["/guides/import-player-on-a-budget-for-second-and-third-division-clubs", "/ru/guides/legioner-s-ogranichennym-byudzhetom-dlya-klubov-vtorogo-i-tretego-diviziona"],
    ["/guides/import-player-first-two-weeks-checklist", "/ru/guides/pervye-dve-nedeli-legionera-v-klube"],
    ["/guides/after-mhl-and-nmhl-to-europe-options-for-russian-and-belarusian-players", "/ru/guides/posle-mhl-i-nmhl-v-evropu-varianty-dlya-igrokov-iz-rossii-i-belarusi"]
  ];
  for (const pair of pairs) for (const url of pair) {
    const html = (await get(url)).text;
    const other = pair.find((u) => u !== url);
    assert.ok(html.includes(`href="http://eha.test${other}"`), `${url}: hreflang pair`);
    assert.ok(html.includes('class="article-byline"'), `${url}: byline`);
    if (/budget|byudzhet|two-weeks|dve-nedeli/.test(url)) assert.ok(/class="btn primary" href="(\/ru)?\/for-clubs/.test(html), `${url}: club CTA first`);
  }
  const twoWeeks = (await get("/guides/import-player-first-two-weeks-checklist")).text;
  assert.ok(twoWeeks.includes('data-print="tpl-first-two-weeks"'));
});
