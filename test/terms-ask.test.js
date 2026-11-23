const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const request = require("supertest");

const PUBLIC = path.join(__dirname, "..", "public");
const { createApp } = require("../src/app");
const { normalizeIntent, INTENTS } = require("../src/attribution");

const base = "https://eha.test";
const config = { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true };
const app = createApp({ config, services: {} });
const get = (url) => request(app).get(url).set("Host", "eha.test");

// Owner decision 23.11.2026: no prices or fee figures for EHA on the site; the
// pages send visitors to ask the agent on WhatsApp (personal chat, prefilled
// question) or through the site form. No Telegram on these buttons.
const PAGES = ["/services", "/ru/services", "/for-players", "/ru/players", "/junior-hockey-for-parents", "/ru/yuniorskij-hokkej-roditelyam"];

test("terms block: WhatsApp with a prefilled question and the form, on every page pair", async () => {
  for (const url of PAGES) {
    const res = await get(url);
    assert.equal(res.status, 200, url);
    const html = res.text;
    const start = html.indexOf('id="terms"');
    assert.ok(start > 0, `${url}: terms block`);
    const block = html.slice(start, start + 2500).split(/<section|<details/)[0];
    const wa = block.match(/href="(https:\/\/wa\.me\/375297957818\?text=[^"]+)"/);
    assert.ok(wa, `${url}: personal WhatsApp link with text`);
    assert.ok(decodeURIComponent(wa[1].split("text=")[1]).length > 20, `${url}: prefilled question`);
    assert.ok(/href="(\/ru)?\/contact\?intent=terms_question&amp;source_page=/.test(block), `${url}: form link`);
    assert.ok(!/t\.me\//.test(block), `${url}: no Telegram in the block`);
    assert.ok(!/\d+\s?(%|€|EUR|USD|\$)/.test(block.replace(/<[^>]+>/g, " ")), `${url}: no price figures`);
  }
});

test("terms_question is a canonical intent", () => {
  assert.ok(INTENTS.terms_question);
  assert.equal(normalizeIntent("terms_question").intent, "terms_question");
});

test("contact page has a heading for the terms_question entry in both languages", () => {
  const site = fs.readFileSync(path.join(PUBLIC, "site.js"), "utf8");
  assert.ok(site.includes("termsEntry=requestedIntent==='terms_question'"));
  assert.ok(site.includes("Ask the agent<br><em>about terms</em>") && site.includes("Спросите агента<br><em>об условиях</em>"));
});
