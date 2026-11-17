const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");

const PUBLIC = path.join(__dirname, "..", "public");
const base = "https://eha.test";
const app = createApp({
  config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true },
  services: {},
});
const get = (url) => request(app).get(url).set("Host", "eha.test");
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const IG_AGENT = "https://www.instagram.com/marshchonak_hockeyagent/";
const IG_EHA = "https://www.instagram.com/ehahockeyagency/";
const TT_EHA = "https://www.tiktok.com/@euhockeyagency";

for (const [url, name, alt] of [["/agent", "Viachaslau Marshchonak", "https://eha.test/ru/agent"], ["/ru/agent", "Вячеслав Морщенок", "https://eha.test/agent"]]) {
  test(`${url}: ProfilePage with one Person, official profiles and contact buttons`, async () => {
    const res = await get(url);
    assert.equal(res.status, 200);
    const html = res.text;
    assert.equal((html.match(/<h1/g) || []).length, 1);
    assert.match(html, new RegExp(`<h1>${name}<br>`));
    const nodes = jsonLd(html);
    const pages = nodes.filter((n) => n["@type"] === "ProfilePage");
    assert.equal(pages.length, 1);
    assert.equal(nodes.filter((n) => n["@type"] === "Person").length, 0, "Person lives only inside ProfilePage.mainEntity");
    assert.equal(nodes.filter((n) => n["@type"] === "BreadcrumbList").length, 1);
    const person = pages[0].mainEntity;
    assert.equal(person["@type"], "Person");
    assert.equal(person["@id"], "https://eha.test/agent#person");
    assert.equal(person.name, name);
    assert.equal(person.url, "https://eha.test/agent");
    assert.match(person.image, /viachaslau-marshchonak-fixed\.webp$/);
    assert.ok(person.jobTitle);
    assert.equal(person.worksFor["@id"], "https://eha.test/#organization");
    assert.deepEqual(person.sameAs, [IG_AGENT], "only the personal profile belongs to the Person");
    for (const link of [IG_AGENT, IG_EHA, TT_EHA]) assert.ok(html.includes(`href="${link}"`), link);
    assert.match(html, /href="https:\/\/wa\.me\/375297957818"/);
    assert.match(html, /intent=player_profile&amp;source_page=\/agent/);
    assert.doesNotMatch(html, /verified (account|profile)|верифицированн/i);
    assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ""), /\+375|795-78-18/);
    assert.match(html, /src="\/assets\/viachaslau-marshchonak-fixed\.webp"/);
    assert.ok(html.includes(`hreflang="${url === "/agent" ? "ru" : "en"}" href="${alt}"`));
    assert.match(html, new RegExp(`<link rel="canonical" href="https://eha.test${url}"`));
  });
}

test("agency profiles are on the Organization, the personal profile is not", async () => {
  for (const url of ["/", "/ru"]) {
    const org = jsonLd((await get(url)).text).find((n) => n["@id"] === "https://eha.test/#organization");
    assert.ok(org, url);
    assert.ok(org.sameAs.includes(IG_EHA) && org.sameAs.includes(TT_EHA), url);
    assert.ok(!org.sameAs.includes(IG_AGENT), url);
  }
});

test("author: Person only where the page shows the agent as author in a visible byline", () => {
  const files = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") && files.push(path.join(dir, e.name))));
  walk(path.join(PUBLIC, "en"));
  walk(path.join(PUBLIC, "ru"));
  let persons = 0;
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    if (!/"author":\{"@type":"Person"/.test(html)) continue;
    persons += 1;
    assert.match(html, /Автор:? <a href="\/agent">|>By <a href="[^"]*\/agent">/, `${path.relative(PUBLIC, f)} has author Person without a visible author byline`);
  }
  assert.ok(persons <= 16, `unexpected number of Person authors: ${persons}`);
});
