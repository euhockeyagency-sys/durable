const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");

const PUBLIC = path.join(__dirname, "..", "public");
const { createApp } = require("../src/app");
const { run } = require("../scripts/add-early-cta");

const base = "https://eha.test";
const config = { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true };
const app = createApp({ config, services: {} });
const get = (url) => request(app).get(url).set("Host", "eha.test");
const mainOf = (html) => html.slice(html.indexOf("<main"), html.indexOf("</main>"));

// 24.11.2026: early next-step strip on high-traffic guides (calculator,
// WhatsApp with a prefilled question, form) within the first half of <main>.
test("early CTA: every target guide has it, in the first half of the page", async () => {
  assert.deepEqual(run(true), [], "add-early-cta.js --check must be clean");
  for (const url of ["/guides/hockey-player-salaries-in-europe", "/ru/guides/zarplaty-hokkeistov-v-evrope", "/guides/hockey-in-poland", "/ru/guides/hokkej-v-ispanii", "/guides/hockey-agent-in-sweden", "/ru/guides/hokkejnye-akademii-severnoj-ameriki"]) {
    const main = mainOf((await get(url)).text);
    const at = main.indexOf("early-cta");
    assert.ok(at > 0 && at / main.length < 0.5, `${url}: early strip in first half`);
    const strip = main.slice(at, main.indexOf("</aside>", at));
    assert.ok(/href="https:\/\/wa\.me\/375297957818\?text=[^"]+"/.test(strip), `${url}: WhatsApp`);
    assert.ok(/href="(\/ru)?\/contact\?[^"]*source_page=/.test(strip), `${url}: form`);
    assert.ok(/href="(\/ru)?\/(level-calculator|kalkulyator-urovnya)"/.test(strip), `${url}: calculator`);
  }
});

test("junior agent guide: EN/RU pair, sitemap, hub, source and ask-the-agent block", async () => {
  for (const [url, map] of [["/guides/does-a-junior-hockey-player-need-an-agent", "/sitemap.xml"], ["/ru/guides/nuzhen-li-agent-yunioru-hokkeistu", "/ru/sitemap.xml"]]) {
    const res = await get(url);
    assert.equal(res.status, 200, url);
    assert.ok(res.text.includes("collegehockeyinc.com/faq"), `${url}: source`);
    assert.ok(res.text.includes('id="ask-agent"') && res.text.includes("wa.me/375297957818?text="), `${url}: CTA`);
    assert.ok((await get(map)).text.includes(url), `${url}: in sitemap`);
  }
});

test("players page: timing table and tryout section in both languages", async () => {
  for (const url of ["/for-players", "/ru/players"]) {
    const html = (await get(url)).text;
    assert.ok(html.includes('id="when-to-apply"') && html.includes('id="tryouts"'), url);
    assert.ok(/1 (July|июля)/.test(html) && /15 (February|февраля)/.test(html), `${url}: IIHF window`);
  }
});

test("parents page: budget examples carry a source link on every row", async () => {
  for (const url of ["/junior-hockey-for-parents", "/ru/yuniorskij-hokkej-roditelyam"]) {
    const html = (await get(url)).text;
    const start = html.indexOf('id="budget-examples"');
    assert.ok(start > 0, url);
    const rows = html.slice(start, html.indexOf("</tbody>", start)).split("<tr>").slice(2);
    assert.ok(rows.length >= 5, `${url}: rows`);
    for (const row of rows) assert.ok(/href="https:\/\//.test(row), `${url}: source on every row`);
  }
});
