#!/usr/bin/env node
"use strict";

// DRY RUN ONLY. Shows how existing CRM rows (applications.source) would look
// with the canonical attribution values from src/attribution.js. It never
// writes to the database. Output contains row ids and attribution fields only
// (no names, contacts, referrer URLs or message text).
//
//   SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/attribution-history-dry-run.js [--out plan.json]
//   node scripts/attribution-history-dry-run.js --input rows.json [--out plan.json]
//
// rows.json: [{ "id": "…", "source": { …applications.source… } }, …]
// Applying the plan is a separate, owner-approved step (docs/attribution-runbook.md).

const fs = require("node:fs");
const { normalizeIntent, normalizeSourcePage, normalizeCountry, normalizeLeague } = require("../src/attribution");

// Older calculator links sent "/from → /level-calculator"; the CTA page is the last part.
function splitTrail(value) {
  const parts = String(value || "").split(/\s*→\s*/).map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? { page: parts[parts.length - 1], previous: parts[parts.length - 2] } : { page: parts[0] || "", previous: null };
}

function planRow(row) {
  const source = row.source || {};
  const locale = source.locale === "en" ? "en" : "ru";
  const patch = {};
  const notes = [];
  let sourcePageResolution = null;

  if (source.intent) {
    const r = normalizeIntent(source.intent);
    if (r.intent !== source.intent) { patch.intent = r.intent; patch.intent_input = source.intent; }
  }
  if (source.source_page) {
    const trail = splitTrail(source.source_page);
    const r = normalizeSourcePage(trail.page, locale);
    sourcePageResolution = r.resolution;
    if (r.sourcePage && r.sourcePage !== source.source_page) {
      patch.source_page = r.sourcePage;
      patch.source_page_input = source.source_page;
      if (trail.previous) patch.previous_page = trail.previous;
      if (r.resolution === "locale") notes.push("shared slug resolved by form locale");
    } else if (!r.sourcePage) notes.push("source_page unresolved — left as is");
  }
  for (const [key, fn, field] of [["country", normalizeCountry, "country"], ["league", normalizeLeague, "league"]]) {
    if (!source[key]) continue;
    const r = fn(source[key]);
    if (r[field] && r[field] !== source[key]) { patch[key] = r[field]; patch[`${key}_input`] = source[key]; }
    else if (!r[field] && !r.input) { patch[key] = null; patch[`${key}_input`] = source[key]; notes.push(`${key} is not a ${key} — moved to ${key}_input`); }
  }
  return { id: row.id, locale, before: pick(source), patch, notes, sourcePageResolution };
}

function pick(source) {
  const out = {};
  for (const key of ["intent", "source_page", "landing_page", "country", "league"]) if (source[key] !== undefined) out[key] = source[key];
  return out;
}

function plan(rows) {
  const items = rows.map(planRow);
  const changed = items.filter((i) => Object.keys(i.patch).length);
  const count = (fn) => changed.filter(fn).length;
  return {
    dryRun: true,
    rows: items.length,
    changed: changed.length,
    byField: {
      intent: count((i) => "intent" in i.patch),
      source_page: count((i) => "source_page" in i.patch),
      source_page_ru_prefix_added: count((i) => i.patch.source_page && i.patch.source_page.startsWith("/ru") && !String(i.before.source_page).startsWith("/ru")),
      country: count((i) => "country" in i.patch),
      league: count((i) => "league" in i.patch)
    },
    // source_page by how certain the mapping is: exact = the stored path names
    // one real route; by_language = a slug that exists in both languages,
    // decided only by the form locale (review before applying); token = a
    // legacy token mapped to its guide; unresolved = left as is.
    sourcePageCertainty: {
      exact: items.filter((i) => i.sourcePageResolution === "exact").length,
      by_language: items.filter((i) => i.sourcePageResolution === "locale").length,
      token: items.filter((i) => i.sourcePageResolution === "slug").length,
      unresolved: items.filter((i) => i.sourcePageResolution === "unresolved").length
    },
    unresolved: items.filter((i) => i.notes.some((n) => n.includes("unresolved"))).map((i) => ({ id: i.id, source_page: i.before.source_page })),
    items: changed
  };
}

async function loadRows(args) {
  const input = args.indexOf("--input");
  if (input >= 0) return JSON.parse(fs.readFileSync(args[input + 1], "utf8"));
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY, or pass --input rows.json");
  const { createClient } = require("@supabase/supabase-js");
  const db = createClient(url, key, { auth: { persistSession: false } });
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("applications").select("id, source").order("created_at").range(from, from + 999);
    if (error) throw new Error(`read failed: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const result = plan(await loadRows(args));
    const out = args.indexOf("--out");
    if (out >= 0) fs.writeFileSync(args[out + 1], JSON.stringify(result, null, 2));
    const { items, ...summary } = result;
    console.log(JSON.stringify(summary, null, 2));
  })().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { plan, planRow, splitTrail };
