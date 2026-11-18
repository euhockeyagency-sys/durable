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


const PARENT_PAIRS = [
  ["/junior-hockey-for-parents", "/ru/yuniorskij-hokkej-roditelyam"],
  ["/junior-season-cost-calculator", "/ru/kalkulyator-stoimosti-sezona"],
  ["/guides/hockey-academies-in-europe-cost-and-admission", "/ru/guides/hokkejnye-akademii-evropy-stoimost-i-postuplenie"],
  ["/guides/child-safety-and-host-families-in-hockey", "/ru/guides/bezopasnost-rebenka-i-prinimayushchaya-semya"],
  ["/guides/u18-stronger-league-or-more-ice-time", "/ru/guides/u18-silnaya-liga-ili-igrovoe-vremya"],
  ["/guides/documents-and-iihf-transfer-for-a-minor-hockey-player", "/ru/guides/dokumenty-nesovershennoletnego-hokkeista-i-transfer-iihf"],
  ["/guides/paid-hockey-showcases-in-europe", "/ru/guides/platnye-prosmotry-i-shoukejsy-v-evrope"],
  ["/guides/junior-hockey-europe-vs-north-america", "/ru/guides/yuniorskij-hokkej-evropa-ili-severnaya-amerika"]
];

test("parents hub: menu item on every main page, four sections, tools, six guides, CTA without a visible phone number", async () => {
  for (const [url, label, href] of [["/", "For parents", "/junior-hockey-for-parents"], ["/ru/", "Родителям", "/ru/yuniorskij-hokkej-roditelyam"], ["/guides/hockey-in-sweden", "For parents", "/junior-hockey-for-parents"]]) {
    const html = (await get(url)).text;
    const nav = html.slice(html.indexOf('<header class="header">'), html.indexOf("</header>"));
    assert.ok(nav.includes(`href="http://eha.test${href}">${label}</a>`) || nav.includes(`href="${href}">${label}</a>`), `${url}: menu item`);
  }
  for (const [url, cta] of [["/junior-hockey-for-parents", "Discuss your player&#39;s options with EHA"], ["/ru/yuniorskij-hokkej-roditelyam", "Обсудить маршрут игрока с EHA"]]) {
    const html = (await get(url)).text;
    for (const id of ["safety", "education", "budget", "protect", "readiness-checklist", "articles", "discuss"]) assert.ok(html.includes(`id="${id}"`), `${url}: #${id}`);
    assert.ok(html.includes(cta.replace("&#39;", "'")), `${url}: main CTA`);
    assert.ok(html.includes("readiness-checklist.js?v="), `${url}: checklist script versioned`);
    assert.ok(html.includes("wa.me/375297957818") && !/\+375 ?29/.test(html.replace(/<script[\s\S]*?<\/script>/g, "")), `${url}: WhatsApp link, no visible number`);
    assert.ok(!/бесплатн/i.test(html.slice(html.indexOf('id="four-questions"'), html.indexOf('id="discuss"') + 2000)), `${url}: no "free" claim in the new block`);
    assert.equal((html.match(/href="[^"]*\/guides\/[^"]+"/g) || []).length >= 6, true);
  }
  for (const [from, to] of [["/for-parents", "/junior-hockey-for-parents"], ["/for-parents/", "/junior-hockey-for-parents"], ["/ru/for-parents", "/ru/yuniorskij-hokkej-roditelyam"]]) {
    const res = await request(app).get(from).set("Host", "eha.test").expect(301);
    assert.ok(res.headers.location.endsWith(to), `${from} -> ${res.headers.location}`);
  }
});

test("parents guides: hreflang pairs, hub link, estimator scripts on the calculator page", async () => {
  for (const pair of PARENT_PAIRS) for (const url of pair) {
    const html = (await get(url)).text;
    const other = pair.find((u) => u !== url);
    assert.ok(html.includes(`href="http://eha.test${other}"`), `${url}: hreflang pair`);
    if (url.includes("/guides/")) assert.ok(/href="(http:\/\/eha\.test)?(\/ru)?\/(junior-hockey-for-parents|yuniorskij-hokkej-roditelyam)"/.test(html), `${url}: links to the hub`);
  }
  const calc = (await get("/junior-season-cost-calculator")).text;
  assert.ok(calc.includes('id="season-estimator"') && calc.includes("season-cost-data.js?v=") && calc.includes("season-cost-estimator.js?v="));
  assert.ok(calc.includes('id="cost-form"'), "two-offer comparison kept");
});
