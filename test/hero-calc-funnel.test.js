const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const request = require("supertest");

const PUBLIC = path.join(__dirname, "..", "public");
const calc = require("../public/assets/level-calculator.js");
const { agentCard } = require("../src/intake/agent-card");
const { createApp } = require("../src/app");

const base = "https://eha.test";
const app = createApp({
  config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", turnstileSiteKey: "k", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: true, telegramConfigured: true, emailConfigured: true },
  services: {}
});
const get = (url) => request(app).get(url).set("Host", "eha.test");

test("home counters ship their final values in the HTML (BRAND.md figures)", async () => {
  for (const [url, values] of [["/", ["100+", "10+", "48 h"]], ["/ru/", ["100+", "10+", "48 ч"]]]) {
    const html = (await get(url)).text;
    const shown = [...html.matchAll(/<strong data-count="\d+" data-suffix="[^"]*">([^<]+)<\/strong>/g)].map((m) => m[1]);
    assert.deepEqual(shown, values, url);
  }
});

test("site.js never rewrites a counter (no count-up from zero) and stats are not hidden by reveal", () => {
  const js = fs.readFileSync(path.join(PUBLIC, "site.js"), "utf8");
  const block = js.slice(js.indexOf("[data-count]") - 200, js.indexOf("[data-count]") + 300);
  assert.ok(!/textContent\s*=\s*['"]0/.test(js), "no '0' written into counters");
  assert.ok(!/dataset\.count/.test(js), "counter value is not read to animate text");
  assert.match(block, /count-in/);
  assert.ok(!js.includes(".proof>div"), "proof stats excluded from scroll reveal");
});

test("calculator guide is built only from the shortlist and asks for stats when they are missing", () => {
  const leagues = [
    { name: "Division 1", country: "France", tier: 2, open: "high", url: "/leagues/france-division-1" },
    { name: "Hockeyettan", country: "Sweden", tier: 3, open: "high", url: "/leagues/sweden-hockeyettan" }
  ];
  const input = { year: 2001, pos: "forward", eu: false, level: "t3", points: 36, games: 40, seasons: 3, goal: "" };
  const r = calc.calculate(input, leagues, "en");
  const g = calc.guideFor(r, input, "en");
  assert.equal(g.status, "ok");
  assert.deepEqual(g.parts.map((p) => p.text), ["second division of France (Division 1)", "third division of Sweden (Hockeyettan)"]);
  const html = calc.renderGuide(g, "en");
  assert.ok(html.startsWith("<strong>Preliminary guide — </strong>"));
  assert.ok(html.includes('href="/leagues/france-division-1"'));
  const ru = calc.renderGuide(calc.guideFor(calc.calculate(input, leagues.map((l) => ({ ...l, country: l.country === "France" ? "Франция" : "Швеция" })), "ru"), input, "ru"), "ru");
  assert.ok(ru.includes("второй дивизион Франции") && ru.includes("третий дивизион Швеции") && ru.includes('href="/ru/leagues/france-division-1"'));
  const noStats = { ...input, points: 0, games: 0 };
  assert.equal(calc.guideFor(calc.calculate(noStats, leagues, "en"), noStats, "en").status, "need_stats");
  assert.equal(calc.guideFor({ candidates: [] }, input, "en").status, "none");
});

test("CTA query carries a valid EP link and the source trail, nothing else from the EP field", () => {
  const r = { bandKey: "mid", score: 73, candidates: [{ name: "Division 1" }] };
  const q = new URLSearchParams(calc.buildCtaQuery({ pos: "forward", year: 2001, goal: "", ep: "https://www.eliteprospects.com/player/1/x", source: "/european-leagues → /level-calculator" }, r, "note"));
  assert.equal(q.get("ep"), "https://www.eliteprospects.com/player/1/x");
  assert.equal(q.get("source_page"), "/european-leagues → /level-calculator");
  const bad = new URLSearchParams(calc.buildCtaQuery({ pos: "forward", year: 2001, ep: "https://evil.test/player/1" }, r, "n"));
  assert.equal(bad.get("ep"), null);
});

test("calculator pages and league embeds show the Elite Prospects next step beside the result", async () => {
  for (const [url, cta, note] of [
    ["/level-calculator", "Submit your Elite Prospects profile", "Your personal list is prepared after we review the application."],
    ["/ru/kalkulyator-urovnya", "Отправить профиль Elite Prospects", "Персональный список готовится после рассмотрения заявки."],
    ["/leagues/france-division-1", "Submit your Elite Prospects profile", "Your personal list is prepared after we review the application."],
    ["/ru/ligi/polsha-tauron-hokej-liga", "Отправить профиль Elite Prospects", "Персональный список готовится после рассмотрения заявки."]
  ]) {
    const html = (await get(url)).text;
    assert.ok(html.includes(`id="calc-cta" href="${url.startsWith("/ru") ? "/ru" : ""}/contact">${cta}</a>`), url);
    assert.ok(html.includes(note) && html.includes('id="calc-guide"') && html.includes('id="calc-ep"'), url);
    assert.ok(/1–3 suitable clubs|1–3 подходящих клуба/.test(html), url);
  }
});

test("agent card shows the source trail and the calculator context", () => {
  const text = agentCard({ reference_code: "EHA-202611-ABCDEF", player_name: "Test", birth_year: 2001, position: "forward", citizenship: "X", current_club: "Y", video_urls: [], profile: {}, assessment: {}, source: { source_page: "/european-leagues → /level-calculator", calculator: { band: "mid", score: 73, leagues: ["Division 1"] } } });
  assert.ok(text.includes("Источник: /european-leagues → /level-calculator"));
  assert.ok(text.includes("Калькулятор (со слов игрока): 2–3 дивизионы, балл 73; лиги: Division 1"));
  assert.ok(text.includes("EP: не указан"));
});
