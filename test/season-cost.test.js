const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../public/assets/season-cost-data.js");
const est = require("../public/assets/season-cost-estimator.js");

test("every data entry is sourced, dated and uses known lines", () => {
  const lines = est.MAIN.concat(est.EXTRA);
  for (const e of data.entries) {
    assert.ok(/^https:\/\//.test(e.src), `${e.id}: source`);
    assert.ok(e.cur && e.season && e.period && e.note && e.note.en && e.note.ru, `${e.id}: meta`);
    assert.ok(data.markets.includes(e.market) && data.types.includes(e.type), `${e.id}: market/type`);
    assert.deepEqual(Object.keys(e.lines).sort(), [...lines].sort(), `${e.id}: all lines declared`);
    for (const age of e.ages) assert.ok(est.applicableTypes(data, e.market, age).includes(e.type), `${e.id}: ${age} applicable`);
    for (const [k, v] of Object.entries(e.lines)) if (v && v.inc) assert.ok(lines.includes(v.inc) && v.inc !== k, `${e.id}: ${k} included target`);
  }
});

test("unknown lines are missing, never zero; included lines are not counted twice", () => {
  const ssm = data.entries.find((e) => e.id === "us-ssm-intl");
  const r = est.computeEntry(ssm, {});
  assert.equal(r.lines.housing.state, "included");
  assert.equal(r.lo, 11000 + 73000 + 400 + 3000);
  assert.equal(r.hi, 11000 + 73000 + 800 + 3000);
  assert.deepEqual(r.missing.sort(), ["insurance", "travel"]);
  assert.equal(r.complete, false);
  const withUser = est.computeEntry(ssm, { insurance: "1 200", travel: "abc" });
  assert.equal(withUser.lines.insurance.state, "user");
  assert.equal(withUser.lo, r.lo + 1200);
  assert.deepEqual(withUser.missing, ["travel"]);
});

test("applicable types depend on market and age; Europe has no 'covered' type", () => {
  assert.deepEqual(est.applicableTypes(data, "usa", "U20"), ["club", "covered"]);
  assert.deepEqual(est.applicableTypes(data, "sweden", "U16"), ["club", "academy"]);
  assert.ok(!est.applicableTypes(data, "finland", "U18").includes("covered"));
  assert.equal(est.entriesFor(data, "austria", "U18", "club").length, 0, "Austria: insufficient data");
  assert.equal(est.entriesFor(data, "czechia", "U16", "club").length, 1);
});

test("covered programme lines report coverage, not amounts", () => {
  const ushl = data.entries.find((e) => e.id === "us-ushl");
  const r = est.computeEntry(ushl, {});
  assert.equal(r.lines.housing.state, "covered");
  assert.equal(r.lo, 0);
  assert.ok(r.missing.includes("pocket"));
});

test("readiness checklist: seven questions per language, result only when all answered", () => {
  const rc = require("../public/assets/readiness-checklist.js");
  for (const lang of ["en", "ru"]) {
    const qs = rc.QUESTIONS[lang];
    assert.equal(qs.length, 7);
    for (const q of qs) assert.ok(q.q && q.h && q.prep && q.ask, `${lang}:${q.id}`);
    assert.equal(rc.evaluate(qs, { daily: "yes" }).complete, false);
    const all = Object.fromEntries(qs.map((q) => [q.id, "yes"]));
    assert.equal(rc.evaluate(qs, all).level, "all");
    const many = Object.fromEntries(qs.map((q, i) => [q.id, i < 3 ? "no" : "yes"]));
    assert.equal(rc.evaluate(qs, many).level, "many");
  }
  assert.deepEqual(rc.QUESTIONS.en.map((q) => q.id), rc.QUESTIONS.ru.map((q) => q.id));
});
