const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");

const PUBLIC = path.join(__dirname, "..", "public");
const data = require("../src/club-needs-data");
const { renderClubNeeds, validateNeed, currentNeeds, PATHS } = require("../src/club-needs");
const { createApp } = require("../src/app");
const { PAGES } = require("../src/locales");

const base = "https://eha.test";
const makeApp = (day) => createApp({
  config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true },
  services: {},
  now: () => new Date(`${day}T12:00:00Z`),
});
const get = (app, url) => request(app).get(url).set("Host", "eha.test");

const need = (over = {}) => ({
  id: "2026-11-se-hockeyettan-d",
  status: "open",
  publish: true,
  countryCode: "SE",
  league: "Hockeyettan",
  season: "2026/27",
  position: "D",
  age: { en: "born 2002–2006", ru: "2002–2006 г. р." },
  importStatus: null,
  conditions: null,
  lastChecked: "2026-11-15",
  validUntil: "2026-12-01",
  source: "INTERNAL-SOURCE-NOTE",
  notes: "INTERNAL-NOTE",
  ...over,
});

test("the shipped data has no demo requests and every record is valid", () => {
  for (const n of data) assert.deepEqual(validateNeed(n), [], n.id);
  assert.doesNotMatch(JSON.stringify(data), /demo|example|lorem|test/i);
});

test("club needs pages are registered as a language pair", () => {
  assert.ok(PAGES.some((p) => p.en === PATHS.en && p.ru === PATHS.ru));
});

test("empty list renders an honest empty state with a profile CTA in both languages", async () => {
  assert.equal(data.length, 0, "this test expects the shipped data to be empty");
  const app = makeApp("2026-11-17");
  const en = await get(app, "/club-needs");
  assert.equal(en.status, 200);
  assert.match(en.text, /data-club-needs="0"/);
  assert.match(en.text, /No confirmed club requests right now/);
  assert.match(en.text, /href="\/contact\?intent=club_needs_profile&amp;source_page=\/club-needs">Send profile to EHA</);
  const ru = await get(app, "/ru/zaprosy-klubov");
  assert.equal(ru.status, 200);
  assert.match(ru.text, /Сейчас нет подтверждённых запросов клубов/);
  assert.match(ru.text, /href="\/ru\/contact\?intent=club_needs_profile&amp;source_page=\/zaprosy-klubov">Отправить профиль в EHA</);
  for (const res of [en, ru]) {
    assert.doesNotMatch(res.text, /<!-- CLUB_NEEDS -->/);
    assert.doesNotMatch(res.text, /JobPosting/);
    assert.equal((res.text.match(/<h1/g) || []).length, 1);
    assert.match(res.text, /"@type":"CollectionPage"/);
    assert.match(res.text, /"@type":"BreadcrumbList"/);
    assert.match(res.text, /hreflang="en" href="https:\/\/eha\.test\/club-needs"/);
    assert.match(res.text, /hreflang="ru" href="https:\/\/eha\.test\/ru\/zaprosy-klubov"/);
    assert.doesNotMatch(res.text, /375\s?29|\+375/);
  }
});

test("only open, published, unexpired requests are shown; internal fields never render", async () => {
  data.push(
    need(),
    need({ id: "closed-one", status: "closed" }),
    need({ id: "private-one", publish: false }),
    need({ id: "expired-one", validUntil: "2026-11-10" }),
    need({ id: "broken-one", position: "XX" }),
  );
  try {
    const app = makeApp("2026-11-17");
    const en = await get(app, "/club-needs");
    assert.match(en.text, /data-club-needs="1"/);
    assert.match(en.text, /id="2026-11-se-hockeyettan-d"/);
    for (const hidden of ["closed-one", "private-one", "expired-one", "broken-one"]) assert.doesNotMatch(en.text, new RegExp(hidden));
    for (const secret of ["INTERNAL-SOURCE-NOTE", "INTERNAL-NOTE", "2026-11-15", "2026-12-01", "lastChecked", "validUntil"]) assert.doesNotMatch(en.text, new RegExp(secret));
    assert.match(en.text, /not confirmed by the club/);
    assert.match(en.text, /intent=club_need&amp;country=Sweden&amp;league=Hockeyettan&amp;note=Club\+request\+2026-11-se-hockeyettan-d/);
    assert.match(en.text, /https:\/\/wa\.me\/375297957818\?text=[^"]*2026-11-se-hockeyettan-d/);
    assert.doesNotMatch(en.text, /JobPosting/);
    const ru = await get(app, "/ru/zaprosy-klubov");
    assert.match(ru.text, /Защитник · Hockeyettan/);
    assert.match(ru.text, /href="\/ru\/contact\?intent=club_need&amp;country=%D0%A8/);
    assert.match(ru.text, /клуб не уточнил/);
    // the same request disappears after validUntil without a redeploy
    const later = await get(makeApp("2026-12-02"), "/club-needs");
    assert.match(later.text, /data-club-needs="0"/);
  } finally {
    data.length = 0;
  }
});

test("validation rejects unknown fields and bad dates", () => {
  assert.ok(validateNeed(need({ clubEmail: "x@club.test" })).some((e) => /unknown fields/.test(e)));
  assert.ok(validateNeed(need({ validUntil: "2026-11-01" })).some((e) => /before lastChecked/.test(e)));
  assert.equal(currentNeeds([need()], new Date("2026-11-17")).length, 1);
  assert.match(renderClubNeeds("en", new Date("2026-11-17"), [need({ conditions: { en: "Housing provided", ru: "Жильё" } })]), /Housing provided/);
});
