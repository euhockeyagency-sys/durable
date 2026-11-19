#!/usr/bin/env node
"use strict";

// Rewrites the query of every /contact link in public/en and public/ru to the
// canonical attribution values (src/attribution.js):
//   intent       canonical value (aliases resolved; country_<x> also sets country)
//   country      ISO 3166-1 alpha-2 code
//   league       league page slug; values that are not a league are dropped
//   source_page  full public path of the CTA page, /ru kept for Russian pages
// Only the query string of href="…/contact?…" is touched. Idempotent.
//   node scripts/normalize-cta-links.js          rewrite files
//   node scripts/normalize-cta-links.js --check  list links that would change, exit 1 if any

const fs = require("node:fs");
const path = require("node:path");
const { normalizeIntent, normalizeCountry, normalizeLeague, normalizeSourcePage} = require("../src/attribution");

const ROOT = path.join(__dirname, "..", "public");
const COUNTRY_INTENT = /^country_(france|sweden|czechia|germany|slovakia)$/;

function files(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const dec = (v) => { try { return decodeURIComponent(v.replace(/\+/g, " ")); } catch { return v; } };
const enc = (v) => encodeURIComponent(v).replace(/%2F/g, "/").replace(/%7C/gi, "|");

// Edits only the parameters whose canonical value differs; every other part of
// the query keeps its original spelling and encoding.
function normalizeQuery(query, locale, pagePath = null) {
  const parts = query.split("&").filter(Boolean).map((part) => {
    const i = part.indexOf("=");
    return i < 0 ? { key: part, raw: null } : { key: part.slice(0, i), raw: part.slice(i + 1) };
  });
  const get = (key) => { const p = parts.find((x) => x.key === key); return p && p.raw !== null ? dec(p.raw) : null; };
  const set = (key, value) => {
    const p = parts.find((x) => x.key === key);
    if (p) { if (dec(p.raw ?? "") !== value) p.raw = enc(value); }
    else parts.push({ key, raw: enc(value) });
  };
  const drop = (key) => { const i = parts.findIndex((x) => x.key === key); if (i >= 0) parts.splice(i, 1); };

  const intentRaw = get("intent");
  if (intentRaw !== null) {
    const m = COUNTRY_INTENT.exec(intentRaw);
    if (m && !get("country")) set("country", m[1]);
    const { intent } = normalizeIntent(intentRaw);
    if (intent && intent !== intentRaw) set("intent", intent);
  }
  const country = get("country");
  if (country !== null) { const r = normalizeCountry(country); if (r.country) set("country", r.country); }
  const league = get("league");
  if (league !== null) {
    const r = normalizeLeague(league);
    if (r.league) set("league", r.league);
    else if (!r.input) {
      // Not a league: keep the meaning in the field it belongs to.
      drop("league");
      if (/(^|-)vs(-|$)/i.test(league)) { if (!get("intent")) set("intent", "league_comparison"); if (!get("source_page") && pagePath) set("source_page", pagePath); }
      else if (/^offer-review$/i.test(league)) set("intent", "offer_review");
      else if (/^usa-junior$/i.test(league) && !get("country")) set("country", "US");
    }
  }
  const page = get("source_page");
  if (page !== null) { const r = normalizeSourcePage(page, locale); if (r.sourcePage) set("source_page", r.sourcePage); }
  return parts.map((p) => (p.raw === null ? p.key : `${p.key}=${p.raw}`)).join("&");
}

function processFile(file, locale) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(path.join(ROOT, locale), file).replace(/\\/g, "/").replace(/\.html$/, "");
  const logical = rel === "index" ? "/" : `/${rel}`;
  const pagePath = locale === "ru" ? (logical === "/" ? "/ru/" : `/ru${logical}`) : logical;
  const changes = [];
  const next = html.replace(/href="([^"]*\/contact\?)([^"#]*)(#[^"]*)?"/g, (whole, base, query, hash = "") => {
    const amp = query.includes("&amp;");
    const decoded = amp ? query.replace(/&amp;/g, "&") : query;
    const normalized = normalizeQuery(decoded, locale, pagePath);
    if (normalized === decoded) return whole;
    changes.push({ from: decoded, to: normalized });
    return `href="${base}${amp ? normalized.replace(/&/g, "&amp;") : normalized}${hash}"`;
  });
  return { next, changes, changed: next !== html };
}

function run({ check = false } = {}) {
  const report = [];
  for (const locale of ["en", "ru"]) {
    for (const file of files(path.join(ROOT, locale))) {
      const { next, changes, changed } = processFile(file, locale);
      if (!changed) continue;
      report.push({ file: path.relative(ROOT, file), changes });
      if (!check) fs.writeFileSync(file, next);
    }
  }
  return report;
}

if (require.main === module) {
  const check = process.argv.includes("--check");
  const report = run({ check });
  const total = report.reduce((n, r) => n + r.changes.length, 0);
  for (const r of report) for (const c of r.changes) console.log(`${r.file}\n  - ${c.from}\n  + ${c.to}`);
  console.log(`${check ? "would change" : "changed"}: ${total} links in ${report.length} files`);
  if (check && total) process.exitCode = 1;
}

module.exports = { normalizeQuery, run };
