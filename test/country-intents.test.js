"use strict";
// Country directory: the seven pilot countries link each search intent
// (how to go, import rules, pay, visa) to an existing page or section.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");

const base = "https://eha.test";
const app = createApp({ config: { port: 0, publicDir: path.join(__dirname, "..", "public"), siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "x.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", trustProxy: false, applicationConfigured: false, missingApplicationKeys: [] }, services: {} });
const get = (u) => request(app).get(u).set("Host", "eha.test");

for (const [url, src] of [["/ru/hokkejnye-strany", "/ru/hokkejnye-strany"], ["/hockey-countries", "/hockey-countries"]]) {
  test(`${url}: 7 countries × 4 intent links, each target and anchor exists`, async () => {
    const { text } = await get(url).expect(200);
    const lists = [...text.matchAll(/<ul class="country-intents"[^>]*>(.*?)<\/ul>/g)].map((m) => m[1]);
    assert.equal(lists.length, 7);
    for (const list of lists) {
      const hrefs = [...list.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(hrefs.length, 4);
      for (const href of hrefs) {
        const [p, hash] = href.split("#");
        const page = await get(p).expect(200);
        if (hash) assert.ok(page.text.includes(`id="${hash}"`), `${href} anchor`);
      }
    }
    for (const code of ["PL", "CZ", "SK", "DE", "AT", "FI", "SE"]) assert.ok(text.includes(`/contact?country=${code}&amp;source_page=${src}"`), code);
  });
}

test("club requests pages: title has no repeated word and no claim of open requests", async () => {
  for (const u of ["/ru/zaprosy-klubov", "/club-needs"]) {
    const { text } = await get(u).expect(200);
    const title = text.match(/<title>([^<]*)/)[1];
    assert.doesNotMatch(title, /Запросы клубов:.*запросы/i);
    assert.doesNotMatch(text.match(/name="description" content="([^"]*)"/)[1], /на текущий сезон|for the current season/);
  }
});
