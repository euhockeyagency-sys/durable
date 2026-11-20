#!/usr/bin/env node
"use strict";

// Writes public/assets/lastmod.json: for every EN/RU page, the date of the last
// commit that changed the page's own content. Content = visible text inside
// <main> (tags, attributes, link URLs, scripts, styles and template tokens are
// ignored). A sitewide navigation, footer, CTA-link or markup change therefore
// does not move <lastmod>. Pages without git history get no entry, and the
// sitemap then omits <lastmod> for them rather than inventing a date.
//
// Limit: blocks injected at request time from src/ data files (league profiles,
// transfer calendar) are not part of the page file, so their updates are not
// reflected here.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync, spawnSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// Sitewide blocks inside <main> that are not the page's own content.
// agent-callout: CTA asides ("Hockey agent in X", level check) added 20.11.2026.
const BOILERPLATE = ["reviewer-note", "breadcrumbs", "related", "cta", "agent-callout", "eha-byline", "page-updated", "editorial-meta"];

// Removes every element whose class list contains one of `classes`, including
// its nested children (same-name tags are counted to find the matching close).
function stripBlocks(html, classes = BOILERPLATE) {
  const open = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\bclass="(?:[^"]*\\s)?(?:${classes.join("|")})(?:\\s[^"]*)?"[^>]*>`, "gi");
  let out = html;
  for (;;) {
    open.lastIndex = 0;
    const m = open.exec(out);
    if (!m) return out;
    const tag = m[1].toLowerCase();
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
    re.lastIndex = m.index + m[0].length;
    let depth = 1, end = out.length, t;
    while ((t = re.exec(out))) { depth += t[1] ? -1 : 1; if (depth === 0) { end = t.index + t[0].length; break; } }
    out = out.slice(0, m.index) + " " + out.slice(end);
  }
}

const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December|январ[ьяе]|феврал[ьяе]|марта?|марте|апрел[ьяе]|ма[йяе]|июн[ьяе]|июл[ьяе]|августа?|августе|сентябр[ьяе]|октябр[ьяе]|ноябр[ьяе]|декабр[ьяе]";
const DATES = new RegExp(`(?<!\\p{L})(?:в\\s+)?(?:\\d{1,2}\\s+(?:${MONTHS})(?!\\p{L})(?:\\s+20\\d\\d)?|(?:${MONTHS})(?!\\p{L})\\s+20\\d\\d)(?:\\s+года)?|\\b20\\d\\d-\\d\\d-\\d\\d\\b`, "giu");
// Byline wording ("Reviewed by" → "By", «Проверено/Проверил» → «Автор:», 20.11.2026)
// is attribution, not content.
const EDITORIAL_WORDS = /(?<!\p{L})(?:last updated|updated|reviewed by|reviewed|editorial (?:update|review)|by|дата обновления|обновлено|редакционн(?:ое|ая) (?:обновление|проверка)|материал проверил|автор материала|проверено|проверил|автор)(?!\p{L}):?/giu;

function contentFingerprint(html) {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  const body = stripBlocks(main ? main[1] : html);
  const text = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{\{[A-Z_]+\}\}/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    // Editorial date stamps ("Updated 18 November 2026", "обновлено в сентябре
    // 2026", "Editorial review: …") are not content: adding or removing one
    // must not move lastmod. Fact-check dates elsewhere in a sentence are also
    // ignored, so only changes to the wording count.
    .replace(EDITORIAL_WORDS, " ")
    .replace(DATES, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ") // words only: punctuation left behind by a removed stamp is not a change
    .replace(/\s+/g, " ")
    .trim();
  return crypto.createHash("sha256").update(text).digest("hex");
}

function listFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) out.push(path.relative(ROOT, full).split(path.sep).join("/"));
    }
  };
  for (const locale of ["en", "ru"]) walk(path.join(PUBLIC, locale));
  return out;
}

// file -> [{ commit, date }] newest first (renames are not followed).
function history() {
  const log = execFileSync("git", ["log", "--format=@%H %cI", "--name-only", "--", "public/en", "public/ru"], { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  const map = new Map();
  let current = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("@")) { const [commit, date] = line.slice(1).split(" "); current = { commit, date: date.slice(0, 10) }; }
    else if (line.trim() && current) { if (!map.has(line)) map.set(line, []); map.get(line).push(current); }
  }
  return map;
}

// Reads many blobs with one `git cat-file --batch` process.
function readBlobs(specs) {
  if (!specs.length) return [];
  const res = spawnSync("git", ["cat-file", "--batch"], { cwd: ROOT, input: specs.join("\n") + "\n", maxBuffer: 2 * 1024 * 1024 * 1024 });
  const buf = res.stdout;
  const out = [];
  let pos = 0;
  for (let i = 0; i < specs.length; i++) {
    const nl = buf.indexOf(10, pos);
    const header = buf.slice(pos, nl).toString();
    pos = nl + 1;
    if (header.endsWith(" missing")) { out.push(null); continue; }
    const size = Number(header.split(" ")[2]);
    out.push(buf.slice(pos, pos + size).toString("utf8"));
    pos += size + 1;
  }
  return out;
}

function lastContentChange(file, commits) {
  const blobs = readBlobs(commits.map((c) => `${c.commit}:${file}`));
  const prints = blobs.map((b) => (b === null ? null : contentFingerprint(b)));
  // commits are newest first; the first one whose content differs from the
  // next older version is the last real content change.
  for (let i = 0; i < commits.length; i++) {
    if (prints[i] === null) continue;
    const older = prints.slice(i + 1).find((p) => p !== null);
    if (older === undefined || older !== prints[i]) return commits[i].date;
  }
  return null;
}

function generate() {
  const hist = history();
  const result = {};
  for (const file of listFiles()) {
    const commits = hist.get(file);
    if (!commits || !commits.length) continue;
    // Uncommitted edits to the working copy are not dated: the date would be a guess.
    const date = lastContentChange(file, commits);
    if (date) result[file] = date;
  }
  return result;
}

if (require.main === module) {
  const result = generate();
  fs.writeFileSync(path.join(PUBLIC, "assets", "lastmod.json"), `${JSON.stringify(result, null, 2)}\n`);
  const counts = {};
  for (const d of Object.values(result)) counts[d] = (counts[d] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d, n]) => `${d}: ${n}`).join(", ");
  console.log(`generated ${Object.keys(result).length} lastmod entries (most common dates: ${top})`);
}

module.exports = { stripBlocks, contentFingerprint, lastContentChange, generate };
