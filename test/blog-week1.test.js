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



test("week 1 article (AlpsHL vs Oberliga) follows the blog template in EN and RU", async () => {
  for (const [url, other, quick, calc, cta] of [
    ["/guides/alps-hockey-league-vs-oberliga", "/ru/guides/alps-hockey-league-ili-oberliga", "Quick answer", "/level-calculator", "/contact?intent=league_comparison"],
    ["/ru/guides/alps-hockey-league-ili-oberliga", "/guides/alps-hockey-league-vs-oberliga", "Короткий ответ", "/ru/kalkulyator-urovnya", "/ru/contact?intent=league_comparison"]
  ]) {
    const html = (await get(url)).text;
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${url}: one H1`);
    const h1 = html.indexOf("<h1"), qa = html.indexOf(`<h2>${quick}</h2>`), table = html.indexOf('class="league-table"');
    assert.ok(h1 > 0 && qa > h1 && table > qa, `${url}: quick answer under H1, then the table`);
    const calcAt = html.indexOf(`${calc}"`, qa), faqAt = html.search(/<h2>(Frequently asked questions|Частые вопросы)<\/h2>/);
    assert.ok(calcAt > table && calcAt < faqAt, `${url}: calculator link mid-article`);
    assert.ok(html.includes(cta), `${url}: submit-profile CTA`);
    assert.ok(html.includes(`<link rel="canonical" href="http://eha.test${url}">`) && html.includes(`hreflang="${url.startsWith("/ru") ? "en" : "ru"}" href="http://eha.test${other}"`), `${url}: canonical + hreflang`);
    assert.ok(!/Search demand|Спрос в поиске/.test(html), `${url}: no internal search-demand notes`);
    const faqLd = JSON.parse(html.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema.org","@type":"FAQPage".*?)<\/script>/)[1]);
    const visible = (html.slice(faqAt).match(/<summary>[^<]+<\/summary>/g) || []).map((s) => s.replace(/<\/?summary>/g, ""));
    assert.equal(faqLd.mainEntity.length, 4);
    assert.deepEqual(faqLd.mainEntity.map((q) => q.name), visible.slice(0, 4), `${url}: FAQ JSON-LD matches the visible questions`);
    const sources = html.slice(html.indexOf('id="sources"')).match(/<li><a href="https:/g) || [];
    assert.ok(sources.length >= 5, `${url}: sources block`);
    const internal = ["/leagues/alps-hockey-league", "/leagues/germany-oberliga", "/guides/hockey-in-austria", "/guides/hockey-in-germany", "/ligi/alps-hockey-league", "/ligi/germaniya-oberliga", "/guides/hokkej-v-avstrii", "/guides/hokkej-v-germanii"].filter((p) => html.includes(`${p}"`));
    assert.ok(internal.length >= 3, `${url}: country and league links`);
  }
  const sm = (await get("/sitemap.xml")).text, smRu = (await get("/ru/sitemap.xml")).text;
  assert.ok(sm.includes("/guides/alps-hockey-league-vs-oberliga</loc>") && smRu.includes("/ru/guides/alps-hockey-league-ili-oberliga</loc>"));
  for (const [page, href] of [["/leagues/alps-hockey-league", "/guides/alps-hockey-league-vs-oberliga"], ["/leagues/germany-oberliga", "/guides/alps-hockey-league-vs-oberliga"], ["/ru/guides/hokkej-v-germanii", "/ru/guides/alps-hockey-league-ili-oberliga"], ["/open-hockey-leagues-for-imports", "/guides/alps-hockey-league-vs-oberliga"]]) {
    assert.ok((await get(page)).text.includes(`${href}"`), `${page}: backlink`);
  }
});
