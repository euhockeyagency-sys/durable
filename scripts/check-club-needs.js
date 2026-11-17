#!/usr/bin/env node
// Weekly review of club requests (src/club-needs-data.js). Read-only: prints
// what is shown, what needs reconfirming and what is invalid. Exit code 1 if
// any record is invalid. Usage: node scripts/check-club-needs.js [YYYY-MM-DD]
const needs = require("../src/club-needs-data");
const { validateNeed, isCurrent } = require("../src/club-needs");

const today = process.argv[2] || new Date().toISOString().slice(0, 10);
const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const weekAgo = addDays(today, -7);
const inAWeek = addDays(today, 7);
let invalid = 0;
const rows = { shown: [], reconfirm: [], expiresSoon: [], expired: [], hidden: [] };

for (const need of needs) {
  const errors = validateNeed(need);
  if (errors.length) {
    invalid += 1;
    console.log(`INVALID ${need && need.id}: ${errors.join("; ")}`);
    continue;
  }
  if (need.status !== "open") continue;
  if (need.validUntil < today) rows.expired.push(need);
  else if (!need.publish) rows.hidden.push(need);
  if (isCurrent(need, today)) {
    rows.shown.push(need);
    if (need.lastChecked < weekAgo) rows.reconfirm.push(need);
    if (need.validUntil <= inAWeek) rows.expiresSoon.push(need);
  }
}

const line = (n) => `  - ${n.id} | ${n.league} | ${n.position} | checked ${n.lastChecked} | valid until ${n.validUntil}`;
console.log(`Club requests review for ${today}: ${needs.length} records, ${rows.shown.length} shown on the site.`);
for (const [key, label] of [
  ["shown", "Shown on the site"],
  ["reconfirm", "Shown, last reconfirmed more than 7 days ago: ask the club"],
  ["expiresSoon", "Shown, validity ends within 7 days: reconfirm or let it close"],
  ["expired", "Open but past validUntil (hidden automatically): set status \"closed\""],
  ["hidden", "Open but publish=false (not shown)"],
]) {
  console.log(`${label}: ${rows[key].length}`);
  rows[key].forEach((n) => console.log(line(n)));
}
if (!needs.length) console.log("No records: the pages show the empty state with the \"Send profile to EHA\" button.");
process.exitCode = invalid ? 1 : 0;
