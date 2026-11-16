// Guards for structured data and home-page conversion points (SEO week 1, Nov 2026).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PUBLIC = path.join(__dirname, "..", "public");
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
}
const files = [...htmlFiles(path.join(PUBLIC, "en")), ...htmlFiles(path.join(PUBLIC, "ru"))];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|’/g, "'").replace(/&nbsp;/g, " ");
const plain = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().toLowerCase();
function ldNodes(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((m) => { const d = JSON.parse(m[1]); return d["@graph"] ? d["@graph"] : [d]; });
}

test("FAQPage markup only lists questions and answers visible on the page", () => {
  const problems = [];
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const faqs = ldNodes(html).filter((n) => n["@type"] === "FAQPage");
    if (!faqs.length) continue;
    const visible = plain(html.slice(html.indexOf("<body")).replace(/<script[\s\S]*?<\/script>/g, ""));
    for (const f of faqs) for (const q of f.mainEntity) {
      if (!visible.includes(plain(q.name))) problems.push(`${path.relative(PUBLIC, file)}: question "${q.name}"`);
      else if (!visible.includes(plain(q.acceptedAnswer.text).slice(0, 80))) problems.push(`${path.relative(PUBLIC, file)}: answer to "${q.name}"`);
    }
  }
  assert.deepEqual(problems.slice(0, 10), [], `${problems.length} FAQ entries not visible`);
});

test("every EHA Organization node shares one @id", () => {
  const bad = [];
  for (const file of files) {
    const walk = (n) => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!n || typeof n !== "object") return;
      if (["Organization", "ProfessionalService"].includes(n["@type"]) && String(n.name || "").startsWith("European Hockey Agency") && n["@id"] !== "{{BASE_URL_EN}}/#organization") bad.push(path.relative(PUBLIC, file));
      Object.values(n).forEach(walk);
    };
    ldNodes(fs.readFileSync(file, "utf8")).forEach(walk);
  }
  assert.deepEqual([...new Set(bad)].slice(0, 10), []);
});

for (const [lang, file, calc] of [["en", "en/index.html", "{{EN}}/level-calculator"], ["ru", "ru/index.html", "/kalkulyator-urovnya"]]) {
  test(`${lang} home hero has one H1, the find-a-club CTA, the calculator link and counters in the HTML`, () => {
    const html = fs.readFileSync(path.join(PUBLIC, file), "utf8");
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(html, /<a class="btn primary" href="[^"]*\/contact\?intent=find_club[^"]*">/);
    assert.ok(html.includes(`<a class="btn ghost" href="${calc}">`), "secondary hero button must open the level calculator");
    for (const value of ["100+", "10+"]) assert.ok(html.includes(`>${value}</strong>`), `counter ${value} must be present without JavaScript`);
  });
}

test("/parents redirects to the parent guide", async () => {
  const { createApp } = require("../src/app");
  const request = require("supertest");
  const base = "https://eha.test";
  const app = createApp({ config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true }, services: {} });
  const response = await request(app).get("/parents?utm_source=x").set("Host", "eha.test").expect(301);
  assert.equal(response.headers.location, "/junior-hockey-for-parents?utm_source=x");
});

test("URLs Search Console reported as 404 now 301 to the intended page, keeping the query", async () => {
  const { createApp } = require("../src/app");
  const request = require("supertest");
  const base = "https://eha.test";
  const app = createApp({ config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true }, services: {} });
  const cases = [
    ["/ru/en/guides/hockey-transfer-windows?a=1", `${base}/guides/hockey-transfer-windows?a=1`],
    ["/ru/hockey-countries", `${base}/ru/hokkejnye-strany`],
    ["/ru/guides/hockey-transfer-windows", `${base}/ru/guides/transfernye-okna-v-hokkee`],
    ["/sv/guides", `${base}/sv/ishockey-i-sverige`],
    ["/contacts", "/contact"]
  ];
  for (const [from, to] of cases) {
    const r = await request(app).get(from).set("Host", "eha.test").expect(301);
    assert.equal(r.headers.location, to, from);
  }
  await request(app).get("/ru/contact").set("Host", "eha.test").expect(200);
  await request(app).get("/ru/cases").set("Host", "eha.test").expect(200);
});
