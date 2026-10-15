const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { calculate, offerTotals, PRESETS, LINES } = require("../public/assets/cost-calculator.js");

const preset = (id) => PRESETS.find((p) => p.id === id);
const presetTotal = (id) => offerTotals({ currency: preset(id).cur, school: preset(id).school, hockey: preset(id).hockey, fees: preset(id).fees }).total;

test("offerTotals adds every line and multiplies trips by ticket price", () => {
  const r = offerTotals({ currency: "EUR", school: "1000", hockey: "200", fees: "50", housing: "300", insurance: "40", equipment: "60", other: "10", trips: "3", ticket: "150" });
  assert.equal(r.lines.travel, 450);
  assert.equal(r.total, 1000 + 200 + 50 + 300 + 40 + 60 + 10 + 450);
  assert.equal(r.currency, "EUR");
});

test("blank, negative and non-numeric input counts as zero", () => {
  const r = offerTotals({ currency: "USD", school: "", hockey: "-5", fees: "abc", housing: null, trips: "2" });
  assert.equal(r.total, 0);
  assert.deepEqual(Object.values(r.lines).every((v) => v === 0), true);
});

test("a single offer has no comparison", () => {
  const r = calculate({ a: { currency: "USD", school: 100 }, b: {} });
  assert.equal(r.b, null);
  assert.equal(r.comparison, null);
});

test("two offers in the same currency report the cheaper one and the gap", () => {
  const r = calculate({ a: { currency: "EUR", school: 8000 }, b: { currency: "EUR", school: 10000 } });
  assert.equal(r.comparison.cheaper, "A");
  assert.equal(r.comparison.amount, 2000);
  assert.equal(r.comparison.percent, 20);
  assert.equal(r.comparison.converted, false);
});

test("equal totals are reported as equal", () => {
  const r = calculate({ a: { currency: "EUR", school: 500 }, b: { currency: "EUR", school: 500 } });
  assert.equal(r.comparison.cheaper, "equal");
  assert.equal(r.comparison.amount, 0);
});

test("different currencies are never compared without an explicit rate", () => {
  const input = { a: { currency: "USD", school: 1000 }, b: { currency: "CAD", school: 1200 } };
  assert.deepEqual(calculate(input).comparison, { needsRate: true });
  assert.deepEqual(calculate({ ...input, rate: "0" }).comparison, { needsRate: true });
  const withRate = calculate({ ...input, rate: "1.5" }).comparison;
  assert.equal(withRate.needsRate, false);
  assert.equal(withRate.converted, true);
  assert.equal(withRate.currency, "CAD");
  assert.equal(withRate.cheaper, "B");
  assert.equal(withRate.amount, 300);
});

test("presets reproduce the totals recorded in the North America fact-check", () => {
  assert.equal(presetTotal("ssm-intl"), 73000 + 11000);
  assert.equal(presetTotal("ssm-dom"), 65000 + 11000);
  assert.equal(presetTotal("kent"), 83700);
  assert.equal(presetTotal("culver"), 69500);
  assert.equal(presetTotal("salisbury"), 78788.5);
  assert.equal(presetTotal("berkshire"), 83790);
  assert.equal(presetTotal("tabor"), 82100);
  assert.equal(presetTotal("oha"), 60700);
  assert.equal(presetTotal("ciha-can"), 48900);
  assert.equal(presetTotal("ciha-intl"), 52900);
});

test("every preset names its source, currency, and both languages", () => {
  const ids = new Set();
  for (const p of PRESETS) {
    assert.ok(!ids.has(p.id), `duplicate preset id ${p.id}`);
    ids.add(p.id);
    assert.match(p.src, /^https:\/\//);
    assert.ok(["USD", "CAD"].includes(p.cur), `${p.id} currency`);
    for (const lang of ["en", "ru"]) {
      assert.ok(p.label[lang] && p.note[lang], `${p.id} missing ${lang} copy`);
    }
    assert.ok(p.year === null || /^\d{4}-\d{2}$/.test(p.year), `${p.id} year`);
  }
});

test("presets whose page does not state the academic year say so instead of guessing", () => {
  for (const id of ["oha", "ciha-can", "ciha-intl"]) assert.equal(preset(id).year, null);
});

test("both calculator pages contain every element id the script reads", () => {
  const ids = ["cost-form", "cost-result", "cost-heading", "cost-body", "cost-cta", "rate"];
  for (const side of ["a", "b"]) {
    ids.push(`${side}-preset`, `${side}-note`, `${side}-cur`, `${side}-trips`, `${side}-ticket`);
    for (const key of LINES) ids.push(`${side}-${key}`);
  }
  for (const file of ["public/en/junior-season-cost-calculator.html", "public/ru/kalkulyator-stoimosti-sezona.html"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    const missing = ids.filter((id) => !html.includes(`id="${id}"`));
    assert.deepEqual(missing, [], `${file} is missing ids: ${missing.join(", ")}`);
    assert.match(html, /<script src="\/assets\/cost-calculator\.js"><\/script>/);
  }
});
