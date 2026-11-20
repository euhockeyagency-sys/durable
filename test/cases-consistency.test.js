"use strict";

// The "100+ players placed" claim is shown next to the number of cases with a
// public source; that number, the /cases cards and src/cases-data.js must agree.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const cases = require("../src/cases-data");

const PUBLIC = path.join(__dirname, "..", "public");
const read = (rel) => fs.readFileSync(path.join(PUBLIC, rel), "utf8");
const confirmed = cases.filter((c) => c.publish && c.status !== "pending");

test("/cases shows exactly the confirmed cases from cases-data as confirmed", () => {
  for (const lang of ["en", "ru"]) {
    const html = read(`${lang}/cases.html`).replace(/<!--[\s\S]*?-->/g, "");
    const cards = [...html.matchAll(/<article>[\s\S]*?<h2>([^<]+)<\/h2>[\s\S]*?evidence-badge (\w+)[\s\S]*?<\/article>/g)];
    const shown = cards.filter((m) => m[2] !== "pending").map((m) => m[1]).sort();
    assert.deepEqual(shown, confirmed.map((c) => c.player).sort(), lang);
  }
});

test("the 100+ claim carries the current number of publicly confirmed cases", () => {
  const n = String(confirmed.length);
  for (const [rel, re] of [
    ["en/index.html", new RegExp(`>${n} with public proof<`)],
    ["ru/index.html", new RegExp(`>${n} с публичным подтверждением<`)],
    ["en/agent.html", new RegExp(`>${n} documented with a public source<`)],
    ["ru/agent.html", new RegExp(`>${n} подтверждены публичным источником<`)]
  ]) assert.match(read(rel), re, rel);
});

test("family relation is disclosed correctly: the twins are brothers of the agent, not his twins", () => {
  for (const text of [read("en/cases.html"), read("ru/cases.html"), JSON.stringify(cases)]) {
    assert.doesNotMatch(text, /twin brother of EHA agent|брат-близнец агента/);
  }
  assert.match(read("en/cases.html"), /Disclosure: Semyon and his twin Matvei are brothers of EHA agent Viachaslau Marshchonak/);
  assert.match(read("ru/cases.html"), /Раскрываем: Семён и его брат-близнец Матвей — братья агента EHA Вячеслава Морщенка/);
});
