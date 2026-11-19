const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { deadline } = require("../src/deadlines");

test("deadline formatter", () => {
  assert.equal(deadline("ch-nl-2026-27", "foreign", "en"), "15 February 2027, 24:00");
  assert.equal(deadline("ch-nl-2026-27", "swiss", "ru"), "1 февраля 2027, 24:00");
  assert.equal(deadline("ch-nl-2026-27", "foreign", "ru", { dayMonth: true }), "15 февраля, 24:00");
  assert.throws(() => deadline("nope", "foreign"));
});

test("Swiss NL deadline has one source: league profile, transfer calendar and page meta follow src/deadlines.js", () => {
  // Change the record in a child process and check that every consumer moves with it.
  const script = `
    const d = require(${JSON.stringify(path.join(__dirname, "..", "src", "deadlines.js"))});
    d.DEADLINES["ch-nl-2026-27"].foreign.date = "2027-02-20";
    d.DEADLINES["ch-nl-2026-27"].swiss.date = "2027-02-03";
    const lp = require(${JSON.stringify(path.join(__dirname, "..", "src", "league-profiles.js"))});
    const tc = require(${JSON.stringify(path.join(__dirname, "..", "src", "transfer-calendar.js"))});
    const profile = lp.PROFILES.find((p) => /switzerland-national-league/.test(JSON.stringify(p.paths || p.path || p.url || p.id)) || p.id === "ch-national-league");
    const rows = tc.ROWS.filter((r) => r.league === "National League");
    process.stdout.write(JSON.stringify({ profile, rows }));
  `;
  const out = JSON.parse(execFileSync(process.execPath, ["-e", script], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  assert.ok(out.profile, "Swiss NL profile found");
  const text = JSON.stringify(out);
  for (const s of ["20 February 2027", "20 февраля 2027", "3 February 2027", "3 февраля 2027"]) assert.ok(text.includes(s), s);
  // nothing in the Swiss NL profile or calendar row still states the old dates
  assert.ok(!/15 (February|февраля)|\b1 (February|февраля)/.test(text), "no hard-coded Swiss NL date left");
  for (const f of ["en/leagues/switzerland-national-league.html", "ru/ligi/shvejcariya-national-league.html"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", "public", f), "utf8");
    assert.ok(html.includes("{{DEADLINE:ch-nl-2026-27:foreign}}") && !/(deadline|срок) 15 (February|февраля) 2027/.test(html), f);
  }
});
