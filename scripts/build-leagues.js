#!/usr/bin/env node
// Renders the static league rows into public/ligi-evropy.html from public/assets/leagues.js
// (single source of truth). Static rows keep the table indexable; page JS only filters them.
// Run after editing leagues.js:  node scripts/build-leagues.js
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "public", "assets", "leagues.js");
const PAGE = path.join(ROOT, "public", "ligi-evropy.html");
const START = "<!-- LEAGUES:START -->";
const END = "<!-- LEAGUES:END -->";

const OPEN_LABEL = { high: "Открыта", mid: "Ограниченно", low: "Сложно" };

const esc = (s) => String(s)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// Evaluate the data file in a sandbox that only provides `window`.
const sandbox = { window: {} };
new Function("window", fs.readFileSync(DATA, "utf8"))(sandbox.window);
const { leagues } = sandbox.window.EHA_LEAGUES;

const rows = leagues.map((l) => {
  const open = OPEN_LABEL[l.open] || l.open;
  return `<tr data-country="${esc(l.country)}" data-tier="${l.tier}" data-open="${esc(l.open)}">` +
    `<td data-label="Страна">${esc(l.flag)} ${esc(l.country)}</td>` +
    `<td data-label="Лига"><b>${esc(l.name)}</b></td>` +
    `<td data-label="Уровень"><span class="tier tier-${l.tier}">${l.tier}</span></td>` +
    `<td data-label="Характеристика">${esc(l.note)}</td>` +
    `<td data-label="Для легионеров"><span class="open open-${esc(l.open)}">${esc(open)}</span> ${esc(l.imports)}</td>` +
    `</tr>`;
}).join("\n");

const html = fs.readFileSync(PAGE, "utf8");
const startIndex = html.indexOf(START);
const endIndex = html.indexOf(END);
if (startIndex === -1 || endIndex === -1) {
  console.error("Маркеры LEAGUES:START/END не найдены в ligi-evropy.html");
  process.exit(1);
}
const updated = html.slice(0, startIndex + START.length) + "\n" + rows + "\n" + html.slice(endIndex);
fs.writeFileSync(PAGE, updated);
console.log(`вставлено строк: ${leagues.length}`);
