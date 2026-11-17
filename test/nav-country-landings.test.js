const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");

const PUBLIC = path.join(__dirname, "..", "public");
const read = (p) => fs.readFileSync(path.join(PUBLIC, p), "utf8");

test("mobile menu does not show a second language link next to the header switch", () => {
  const css = read("styles.css");
  assert.match(css, /@media\(max-width:850px\)\{\.header nav \.lang-switch\{display:none\}\}/);
  const js = read("site.js");
  assert.match(js, /setAttribute\('aria-controls'/);
  assert.match(js, /e\.key==='Escape'/);
  assert.match(js, /Close menu/);
});

const COUNTRIES = [
  ["en/guides/hockey-in-sweden.html", "ru/guides/hokkej-v-shvecii.html", "sweden"],
  ["en/guides/hockey-in-germany.html", "ru/guides/hokkej-v-germanii.html", "germany"],
  ["en/guides/hockey-in-france.html", "ru/guides/hokkej-vo-francii.html", "france"],
  ["en/guides/hockey-in-czechia.html", "ru/guides/hokkej-v-chexii.html", "czechia"],
  ["en/guides/hockey-in-slovakia.html", "ru/guides/hokkej-v-slovakii.html", "slovakia"],
];

test("priority country landings carry the full block set in both languages", () => {
  for (const [en, ru, key] of COUNTRIES) {
    for (const file of [en, ru]) {
      const html = read(file);
      for (const id of ["who-it-suits", "at-a-glance", "player-costs", "deadlines", "eha-process"]) {
        assert.ok(html.includes(`id="${id}"`), `${file} missing #${id}`);
      }
      assert.ok(html.includes(`?country=${key}`), `${file} missing calculator link`);
      assert.ok(html.includes(`/contact?intent=country_${key}`), `${file} missing profile link`);
      assert.ok(html.includes('href="https://wa.me/'), `${file} missing WhatsApp link`);
      assert.ok(!/\+375\s?\d/.test(html.replace(/https:\/\/wa\.me\/\d+/g, "")), `${file} shows a phone number`);
    }
  }
});

test("country landings render with canonical and reciprocal hreflang", async () => {
  const { createApp } = require("../src/app");
  const base = "https://eha.test";
  const app = createApp({ config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true }, services: {} });
  for (const [en, ru] of COUNTRIES) {
    const enPath = "/" + en.replace(/^en\//, "").replace(/\.html$/, "");
    const ruPath = "/ru/" + ru.replace(/^ru\//, "").replace(/\.html$/, "");
    const e = await request(app).get(enPath).set("Host", "eha.test").expect(200);
    assert.ok(e.text.includes(`<link rel="canonical" href="${base}${enPath}">`), enPath);
    assert.ok(e.text.includes(`hreflang="ru" href="${base}${ruPath}"`), enPath);
    const r = await request(app).get(ruPath).set("Host", "eha.test").expect(200);
    assert.ok(r.text.includes(`hreflang="en" href="${base}${enPath}"`), ruPath);
    assert.doesNotMatch(r.text, /\/ru\/ru\//);
  }
});

test("calculator focus country uses the same filters as the result", () => {
  const calc = require("../public/assets/level-calculator.js");
  const leagues = [
    { name: "A1", country: "Sweden", tier: 1, open: "low" },
    { name: "A3", country: "Sweden", tier: 3, open: "mid" },
    { name: "J", country: "Sweden", tier: 3, open: "high", age: "junior" },
    { name: "G3", country: "Germany", tier: 3, open: "mid" },
  ];
  const guide = calc.COUNTRY_GUIDES.sweden;
  const r = { band: [3, 3], playerAge: 25 };
  assert.deepEqual(calc.filterForFocus(leagues, r, { eu: true }, guide).names, ["A3"]);
  assert.deepEqual(calc.filterForFocus(leagues, { band: [3, 3], playerAge: 17 }, { eu: true }, guide).names, ["A3", "J"]);
  assert.deepEqual(calc.filterForFocus(leagues, { band: [1, 1], playerAge: 25 }, { eu: false }, guide).names, []);
});

test("league directory links each country to its guide", () => {
  const en = read("en/european-leagues.html");
  assert.ok(en.includes('<a href="/guides/hockey-in-sweden">Sweden</a>'));
  const ru = read("ru/ligi-evropy.html");
  assert.match(ru, /<a href="\/guides\/hokkej-v-shvecii">Швеция<\/a>/);
});
