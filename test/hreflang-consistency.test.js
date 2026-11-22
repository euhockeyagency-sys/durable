"use strict";
// Every URL in every sitemap: HTTP 200, self-canonical, and its <xhtml:link>
// alternates equal the <link rel="alternate" hreflang> set in the page head;
// every alternate itself answers 200 and lists the page back (reciprocity).
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");

const base = "https://eha.test";
const app = createApp({ config: { port: 0, publicDir: path.join(__dirname, "..", "public"), siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "x.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", trustProxy: false, applicationConfigured: false, missingApplicationKeys: [] }, services: {} });
const get = (u) => request(app).get(u.replace(base, "") || "/").set("Host", "eha.test").redirects(0);
const altSet = (pairs) => pairs.map(([l, h]) => `${l}=${h}`).sort().join(" ");

test("sitemaps and page heads agree on hreflang; clusters are reciprocal", async () => {
  const pages = new Map();
  for (const sm of ["/sitemap.xml", "/ru/sitemap.xml", "/de/sitemap.xml", "/cs/sitemap.xml", "/fi/sitemap.xml", "/sv/sitemap.xml"]) {
    const xml = (await get(sm).expect(200)).text;
    for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>(.*?)<\/url>/g)) {
      pages.set(m[1], [...m[2].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((x) => [x[1], x[2]]));
    }
  }
  const heads = new Map();
  for (const [url, smAlts] of pages) {
    const res = await get(url);
    assert.equal(res.status, 200, url);
    const canon = (res.text.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    assert.equal(canon, url, `${url} canonical`);
    const head = [...res.text.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((x) => [x[1], x[2]]);
    heads.set(url, head);
    assert.equal(altSet(smAlts), altSet(head), `${url} sitemap vs head`);
    if (head.length) assert.ok(head.some(([, h]) => h === url), `${url} self-reference`);
  }
  for (const [url, head] of heads) {
    for (const [, h] of head) {
      assert.ok(heads.has(h), `${url} → ${h} is not a sitemap URL`);
      assert.equal(altSet(heads.get(h)), altSet(head), `${url} ↔ ${h} not reciprocal`);
    }
  }
});
