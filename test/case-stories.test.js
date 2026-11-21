"use strict";
// /cases cards carry a "result" for every case in both languages, and the
// EHA-work field appears only where cases-data.js has a confirmed story.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const CASES = require("../src/cases-data");

const read = (l) => fs.readFileSync(path.join(__dirname, "..", "public", l, "cases.html"), "utf8");
const card = (html, player) => { const i = html.indexOf(`<h2>${player}</h2>`); return html.slice(i, html.indexOf("</article>", i)); };

test("every case card has a result in EN and RU, with the same fields in both", () => {
  const en = read("en"); const ru = read("ru");
  for (const c of CASES) {
    const e = card(en, c.player); const r = card(ru, c.player);
    assert.match(e, /<dt>Result<\/dt>/, c.player); assert.match(r, /<dt>Итог<\/dt>/, c.player);
    assert.equal((e.match(/<dt>/g) || []).length, (r.match(/<dt>/g) || []).length, c.player);
    const hasWork = Boolean(c.story && c.story.work);
    assert.equal(/<dt>EHA's work<\/dt>/.test(e), hasWork, c.player);
    assert.equal(/<dt>Работа EHA<\/dt>/.test(r), hasWork, c.player);
    if (c.status === "pending") assert.match(r, /Ожидает подтверждения/, c.player);
  }
});

test("results never claim a contract the source does not state", () => {
  const ru = read("ru");
  for (const c of CASES.filter((x) => x.status === "elite_prospects_history" && !(x.story && x.story.result))) {
    assert.match(card(ru, c.player), /просмотр, контракт или регистрация, источник не уточняет/, c.player);
  }
});
