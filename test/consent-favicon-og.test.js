"use strict";

// Point-5 fixes (20.11.2026): Metrika is consent-gated at load time, /favicon.ico
// exists, and pages that declare their own og:image use a JPEG, not WebP.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");

const PUBLIC = path.join(__dirname, "..", "public");
const base = "https://eha.test";
const app = createApp({
  config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", trustProxy: false, applicationConfigured: false, missingApplicationKeys: [] },
  services: {}
});

test("no Yandex Metrika request is made from the page before consent", async () => {
  for (const url of ["/", "/ru/", "/guides/hockey-in-germany"]) {
    const res = await request(app).get(url).set("Host", "eha.test").expect(200);
    assert.doesNotMatch(res.text, /mc\.yandex\.ru\/metrika\/tag\.js/, url);
  }
  const js = fs.readFileSync(path.join(PUBLIC, "site.js"), "utf8");
  const init = js.slice(js.indexOf("const initYandex"), js.indexOf("const consent="));
  assert.match(init, /metrika\/tag\.js/, "tag.js is injected inside initYandex, which runs only after consent");
});

test("/favicon.ico is served as an icon", async () => {
  const res = await request(app).get("/favicon.ico").set("Host", "eha.test").expect(200);
  assert.match(res.headers["content-type"], /image\/(x-icon|vnd\.microsoft\.icon)/);
});

test("declared social images are JPEG files of 1200x630 or covers", () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".html") ? [path.join(d, e.name)] : []);
  const bad = [];
  for (const f of [...walk(path.join(PUBLIC, "en")), ...walk(path.join(PUBLIC, "ru"))]) {
    const html = fs.readFileSync(f, "utf8");
    for (const m of html.matchAll(/<meta (?:property="og:image"|name="twitter:image") content="([^"]+)"/g)) {
      if (!/\.jpe?g$/.test(m[1])) bad.push(`${path.relative(PUBLIC, f)}: ${m[1]}`);
    }
  }
  assert.deepEqual(bad, []);
});
