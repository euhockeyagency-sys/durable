const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");

function config(overrides = {}) {
  const primaryUrl = "https://eha.test";
  return {
    port: 3000,
    publicDir: path.join(__dirname, "..", "public"),
    siteUrl: primaryUrl,
    primaryUrl,
    primaryHost: "eha.test",
    enUrl: primaryUrl,
    ruUrl: `${primaryUrl}/ru`,
    ruPrefix: "/ru",
    legacyRuHost: "eha-legacy.test",
    contactEmail: "privacy@eha.test",
    privacyPolicyVersion: "test-v1",
    turnstileSiteKey: "test-site-key",
    trustProxy: false,
    applicationConfigured: true,
    missingApplicationKeys: [],
    turnstileConfigured: true,
    telegramConfigured: true,
    emailConfigured: true,
    ...overrides
  };
}

function serviceMock() {
  return {
    supabase: { from() { return { async insert() { return { error: null }; } }; }, storage: { from() { return {}; } } },
    async verifyTurnstile() { return { success: true }; },
    async sendEmail() { return "email-id"; },
    async sendTelegram() { return "telegram-id"; },
    async sendClubRequestEmail() { return "club-email-id"; },
    async sendClubRequestTelegram() { return "club-telegram-id"; }
  };
}

// One-page-per-locale bonus guides: native-language landing pages for
// Swedish, Finnish, Czech and German players, linking out to the full EN/RU
// flagship country guides rather than mirroring the whole site.
const BONUS_PAGES = [
  { locale: "sv", path: "/sv/ishockey-i-sverige", enGuide: "/guides/hockey-in-sweden", ruGuide: "/ru/guides/hokkej-v-shvecii" },
  { locale: "fi", path: "/fi/jaakiekko-suomessa", enGuide: "/guides/hockey-in-finland", ruGuide: "/ru/guides/hokkej-v-finlyandii" },
  { locale: "cs", path: "/cs/hokej-v-cesku", enGuide: "/guides/hockey-in-czechia", ruGuide: "/ru/guides/hokkej-v-chexii" },
  { locale: "de", path: "/de/eishockey-in-deutschland", enGuide: "/guides/hockey-in-germany", ruGuide: "/ru/guides/hokkej-v-germanii" }
];

function jsonLdBlocks(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.map((m) => JSON.parse(m[1]));
}

for (const page of BONUS_PAGES) {
  test(`${page.locale} bonus guide renders with a self-referential canonical and valid JSON-LD`, async () => {
    const app = createApp({ config: config(), services: serviceMock() });
    const res = await request(app).get(page.path).set("Host", "eha.test").expect(200);
    const canonical = res.text.match(/<link rel="canonical" href="([^"]*)">/);
    assert.ok(canonical, "missing canonical link");
    assert.equal(canonical[1], `https://eha.test${page.path}`);
    const blocks = jsonLdBlocks(res.text);
    assert.ok(blocks.some((b) => b["@type"] === "Article"), "missing Article JSON-LD");
    assert.ok(blocks.some((b) => b["@type"] === "FAQPage"), "missing FAQPage JSON-LD");
  });

  test(`${page.locale} bonus guide declares reciprocal hreflang to itself, EN and RU`, async () => {
    const app = createApp({ config: config(), services: serviceMock() });
    const res = await request(app).get(page.path).set("Host", "eha.test").expect(200);
    assert.match(res.text, new RegExp(`hreflang="${page.locale}" href="https://eha\\.test${page.path.replace(/\//g, "\\/")}"`));
    assert.match(res.text, /hreflang="en" href="https:\/\/eha\.test\/guides\//);
    assert.match(res.text, /hreflang="ru" href="https:\/\/eha\.test\/ru\/guides\//);
  });

  test(`${page.locale} bonus guide links out to the full EN and RU guides`, async () => {
    const app = createApp({ config: config(), services: serviceMock() });
    const res = await request(app).get(page.path).set("Host", "eha.test").expect(200);
    assert.ok(res.text.includes(`href="https://eha.test${page.enGuide}"`), `missing link to ${page.enGuide}`);
    assert.ok(res.text.includes(`href="https://eha.test${page.ruGuide}"`), `missing link to ${page.ruGuide}`);
  });

  test(`the ${page.locale} sitemap lists the bonus guide`, async () => {
    const app = createApp({ config: config(), services: serviceMock() });
    const res = await request(app).get(`/${page.locale}/sitemap.xml`).set("Host", "eha.test").expect(200);
    assert.ok(res.text.includes(`https://eha.test${page.path}`), `sitemap missing ${page.path}`);
  });

  test(`the EN and RU flagship guides reciprocally link to the ${page.locale} bonus guide`, async () => {
    const app = createApp({ config: config(), services: serviceMock() });
    const en = await request(app).get(page.enGuide).set("Host", "eha.test").expect(200);
    assert.ok(en.text.includes(`hreflang="${page.locale}" href="https://eha.test${page.path}"`), `EN guide missing hreflang to ${page.path}`);
    assert.ok(en.text.includes(`href="https://eha.test${page.path}"`), `EN guide missing visible link to ${page.path}`);
    const ru = await request(app).get(page.ruGuide).set("Host", "eha.test").expect(200);
    assert.ok(ru.text.includes(`hreflang="${page.locale}" href="https://eha.test${page.path}"`), `RU guide missing hreflang to ${page.path}`);
    assert.ok(ru.text.includes(`href="https://eha.test${page.path}"`), `RU guide missing visible link to ${page.path}`);
  });
}

test("robots.txt advertises all four bonus-locale sitemaps", async () => {
  const app = createApp({ config: config(), services: serviceMock() });
  const res = await request(app).get("/robots.txt").set("Host", "eha.test").expect(200);
  for (const page of BONUS_PAGES) {
    assert.ok(res.text.includes(`Sitemap: https://eha.test/${page.locale}/sitemap.xml`), `robots.txt missing ${page.locale} sitemap`);
  }
});
