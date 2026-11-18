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
      assert.ok(/\/contact\?intent=[a-z_]+&amp;source_page=/.test(html) && html.includes("wa.me/375297957818"), `${url}: submit profile and WhatsApp`);
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

test("comparison and byline blocks: no salary invented, no expert review claimed until confirmed", () => {
  const ru = compareTable(["fi-mestis", "uk-eihl"], "ru");
  assert.ok(ru.includes("Надёжной выборки нет"));
  assert.equal(REVIEWED.size, 0);
  const en = byline("/guides/paid-hockey-showcases-in-europe", "en");
  assert.ok(en.includes("Prepared by the European Hockey Agency editorial team") && !en.includes("Reviewed by"));
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
