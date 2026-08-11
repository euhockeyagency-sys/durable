const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
// Regression guard for the bug where the calculator's own "current level"
// dropdown listed example leagues that contradicted the real tier they were
// meant to illustrate (NCAA D1 / PHL shown as "second division" examples
// while leagues.src.js has both at tier 1) — a player who trusted the
// example and picked the wrong option got a materially wrong score.
//
// leagues.src.js assigns `window.EHA_LEAGUES_SRC = {...}` where the object
// itself is a JS object literal (bilingual {ru,en} fields, so not strict
// JSON) — extract it with Function() rather than eval'ing the whole file.
function loadLeaguesSrc() {
  const src = fs.readFileSync(path.join(__dirname, "..", "public", "assets", "leagues.src.js"), "utf8");
  const objSrc = src.slice(src.indexOf("{", src.indexOf("EHA_LEAGUES_SRC"))).trim().replace(/;\s*$/, "");
  // eslint-disable-next-line no-new-func
  const data = new Function(`"use strict"; return (${objSrc});`)();
  const byName = new Map();
  for (const l of data.leagues) {
    const name = typeof l.name === "string" ? l.name : l.name.en;
    byName.set(name, l);
  }
  return byName;
}

const EXPECTED_TIER = { top: 1, t2: 2, t3: 3 };

function optionExamples(html, value) {
  const optionMatch = html.match(new RegExp(`<option value="${value}"[^>]*>([^<]*)</option>`));
  assert.ok(optionMatch, `missing <option value="${value}"> in the level select`);
  const bracketed = optionMatch[1].match(/\(([^)]*)\)/);
  if (!bracketed) return [];
  return bracketed[1].replace(/…$/, "").split(",").map((s) => s.trim()).filter(Boolean);
}

for (const [label, file] of [["EN", "public/en/level-calculator.html"], ["RU", "public/ru/kalkulyator-urovnya.html"]]) {
  test(`${label} level-calculator dropdown examples match leagues.src.js tiers`, () => {
    const html = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    const byName = loadLeaguesSrc();
    const mismatches = [];
    for (const value of ["top", "t2", "t3"]) {
      for (const example of optionExamples(html, value)) {
        const league = byName.get(example);
        if (!league) continue; // not every example is in the reference dataset (e.g. AHL, NCAA-adjacent names) — only check what we can verify
        if (league.tier !== EXPECTED_TIER[value]) {
          mismatches.push(`"${example}" is listed under "${value}" (expects tier ${EXPECTED_TIER[value]}) but leagues.src.js has tier ${league.tier}`);
        }
      }
    }
    assert.deepEqual(mismatches, [], mismatches.join("\n"));
  });
}
