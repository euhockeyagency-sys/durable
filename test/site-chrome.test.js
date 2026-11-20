"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { run } = require("../scripts/normalize-chrome");

test("every EN/RU page uses the shared header nav and footer template", () => {
  assert.deepEqual(run({ check: true }), []);
});

test("header nav has Agent and For parents, News lives in the footer only", () => {
  for (const [file, agent, parents, news] of [
    ["en/guides/hockey-in-canada.html", '{{EN}}/agent">Agent<', '{{EN}}/junior-hockey-for-parents">For parents<', '{{EN}}/news"'],
    ["ru/ligi/kanada-yuniorskij-hokkej.html", '"/agent">Агент<', '"/yuniorskij-hokkej-roditelyam">Родителям<', '"/novosti"']
  ]) {
    const html = fs.readFileSync(path.join(__dirname, "..", "public", file), "utf8");
    const header = html.slice(html.indexOf('<header class="header">'), html.indexOf("</header>"));
    const footer = html.slice(html.indexOf("<footer"));
    assert.ok(header.includes(agent) && header.includes(parents), `${file}: header items`);
    assert.ok(!header.includes(news), `${file}: no News in header`);
    assert.ok(footer.includes(news) && footer.includes("euhockeyagency@gmail.com"), `${file}: footer News and email`);
  }
});
