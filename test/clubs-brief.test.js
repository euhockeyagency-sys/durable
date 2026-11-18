"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../src/app");
const { compareTable, byline, REVIEWED } = require("../src/article-blocks");

const config = () => ({
  port: 0, publicDir: require("node:path").join(__dirname, "..", "public"), siteUrl: "http://eha.test", primaryUrl: "http://eha.test", primaryHost: "eha.test",
  enUrl: "http://eha.test", ruUrl: "http://eha.test/ru", ruPrefix: "/ru", legacyRuHost: "legacy.invalid", contactEmail: "p@eha.test", privacyPolicyVersion: "t",
  turnstileSiteKey: "", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: false, telegramConfigured: true, emailConfigured: true
});
const app = createApp({ config: config(), services: {} });
const get = (url) => request(app).get(url).set("Host", "eha.test").expect(200);


const brief = require("../public/assets/club-brief.js");
const calc = require("../public/assets/level-calculator.js");

test("club brief: selected values in the message, empty optional fields skipped, WhatsApp link encoded", () => {
  const text = brief.briefText({ clubName: "HC Test & Co", country: "Austria", level: "AlpsHL", positions: ["C", "LW"], hand: "L", elig: "other", eligNote: "max. 2 imports", budget: "2500", currency: "EUR", period: "month", housing: "provided", transport: "", other: "  ", comment: "" }, "en");
  assert.match(text, /^Hello EHA, club brief:\nClub: HC Test & Co\n/);
  assert.ok(text.includes("Position: C, LW") && text.includes("Eligibility: other — max. 2 imports") && text.includes("Budget: 2500 EUR per month"));
  assert.ok(!/Transport|Other conditions|Comment|Season/.test(text), "empty fields skipped");
  const ru = brief.briefText({ positions: ["any"], hand: "any" }, "ru");
  assert.equal(ru, "Здравствуйте, EHA! Бриф клуба:\nПозиция: любая\nХват: любой");
  assert.equal(brief.briefText({}, "en"), "");
  const link = brief.waLink(text);
  assert.ok(link.startsWith("https://wa.me/375297957818?text="));
  assert.ok(link.includes("%0A") && link.includes("%26") && !/[\s&]/.test(link.split("?text=")[1]));
});

test("available players: filters, and the public list ships empty (no demo players)", () => {
  const data = require("../public/assets/available-players.js");
  assert.deepEqual(data.players, []);
  const sample = [{ code: "A", position: "C", hand: "L", passport: "EU" }, { code: "B", position: "D", hand: "R", passport: "non-EU" }];
  assert.deepEqual(brief.filterPlayers(sample, { pos: "any", hand: "any", passport: "any" }).map((p) => p.code), ["A", "B"]);
  assert.deepEqual(brief.filterPlayers(sample, { pos: "D", hand: "any", passport: "any" }).map((p) => p.code), ["B"]);
  assert.deepEqual(brief.filterPlayers(sample, { pos: "any", hand: "L", passport: "non-EU" }), []);
});

test("/for-clubs: brief builder, choice of WhatsApp or site (email + Telegram), no public email", async () => {
  for (const [url, wa] of [["/for-clubs", "Send brief via WhatsApp"], ["/ru/for-clubs", "Отправить бриф в WhatsApp"]]) {
    const html = (await get(url)).text;
    assert.ok(html.includes('id="brief-preview"') && html.includes(wa) && !html.includes('id="available-players"'), "showcase hidden for now");
    assert.ok(html.includes('name="briefChannel" value="wa" checked') && html.includes('name="briefChannel" value="site"') && html.includes('data-channel="site" hidden'));
    assert.ok(html.includes('action="/api/club-request"') && html.includes('name="positionNeeded"') && html.includes('name="message"'));
    assert.ok(!/gmail|mailto:|p@eha\.test/.test(html), `${url}: no email shown`);
    assert.ok(html.includes("club-brief.js?v="));
    for (const v of ["C", "LW", "RW", "D", "G", "any"]) assert.ok(html.includes(`name="briefPos" value="${v}"`));
  }
});

test("footer Navigation links to the parents section in both languages", async () => {
  for (const [url, label, href] of [["/", "For parents", "/junior-hockey-for-parents"], ["/guides/hockey-transfer-windows", "For parents", "/junior-hockey-for-parents"], ["/ru/", "Родителям", "/ru/yuniorskij-hokkej-roditelyam"], ["/ru/metodologiya", "Родителям", "/ru/yuniorskij-hokkej-roditelyam"]]) {
    const html = (await get(url)).text;
    const footer = html.slice(html.indexOf("<footer"));
    assert.ok(footer.includes(`${href}">${label}</a>`), `${url}: footer link`);
  }
  const home = (await get("/")).text, ru = (await get("/ru/")).text;
  assert.ok(home.includes('/junior-hockey-for-parents">Parent guide →'));
  assert.ok(ru.includes('/ru/yuniorskij-hokkej-roditelyam">Гайд для родителей →'));
});

test("calculator 'What to read next': imports for adults, parents for juniors, under-18 only when proven", () => {
  const y = new Date().getFullYear();
  const keys = (age, eu = true) => { const input = { year: y - age, pos: "forward", level: "t3", seasons: 2, gp: 30, pts: 20, eu }; return calc.readNext(calc.calculate(input, [], "en"), input, "en").map((i) => i.key); };
  assert.deepEqual(keys(16), ["minor", "parents", "academy"]);
  assert.ok(!keys(18).includes("minor"), "turning 18 this year may already be 18");
  assert.deepEqual(keys(19, false), ["parents", "academy", "imports"]);
  assert.deepEqual(keys(26), ["imports"]);
  const ru = calc.readNext(calc.calculate({ year: y - 16, pos: "forward", level: "t3", seasons: 1, gp: 20, pts: 5, eu: true }, [], "ru"), { eu: true }, "ru");
  assert.ok(ru.every((i) => i.url.startsWith("/guides/") || i.url === "/yuniorskij-hokkej-roditelyam"));
  assert.ok(calc.renderReadNext(ru, "ru").includes('href="/ru/'));
});

test("new and extended articles: pairs, listed in Resources, links back", async () => {
  const pairs = [["/guides/how-to-choose-a-hockey-academy", "/ru/guides/kak-vybrat-hokkejnuyu-akademiyu"], ["/guides/best-european-hockey-leagues-for-imports", "/ru/guides/luchshie-ligi-evropy-dlya-legionerov"], ["/guides/documents-and-iihf-transfer-for-a-minor-hockey-player", "/ru/guides/dokumenty-nesovershennoletnego-hokkeista-i-transfer-iihf"]];
  const idxEn = (await get("/guides")).text, idxRu = (await get("/ru/guides")).text;
  for (const [en, ru] of pairs) {
    const a = (await get(en)).text, b = (await get(ru)).text;
    assert.ok(a.includes(`href="http://eha.test${ru}"`) && b.includes(`href="http://eha.test${en}"`), `${en}: hreflang`);
    assert.ok(idxEn.includes(en.replace("/guides/", "")) && idxRu.includes(ru.replace("/ru/guides/", "")), `${en}: in Resources`);
  }
  const open = (await get("/guides/best-european-hockey-leagues-for-imports")).text;
  assert.ok(open.includes('id="most-open"') && /href="[^"]*\/level-calculator"/.test(open));
  const choose = (await get("/ru/guides/kak-vybrat-hokkejnuyu-akademiyu")).text;
  assert.ok(choose.includes("/ru/kalkulyator-stoimosti-sezona") && choose.includes("/ru/yuniorskij-hokkej-roditelyam") && choose.includes("/ru/kalkulyator-urovnya"));
});
