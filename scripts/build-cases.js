#!/usr/bin/env node
// Renders confirmed cases (src/cases-data.js) and verified country rules
// (src/country-rules.js) onto each country guide, EN and RU, between
// <!-- CASES:START --> / <!-- CASES:END -->. Matching uses the ISO country
// code, never text. A country without confirmed cases or rules gets an empty
// block (nothing visible). Run after editing either data file:
//   node scripts/build-cases.js
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const { PAGES } = require(path.join(ROOT, "src", "locales.js"));
const CASES = require(path.join(ROOT, "src", "cases-data.js"));
const RULES = require(path.join(ROOT, "src", "country-rules.js"));
const START = "<!-- CASES:START -->";
const END = "<!-- CASES:END -->";

// ISO code -> English guide slug (/guides/hockey-in-<slug>).
const GUIDE_SLUG = {
  AT: "austria", BE: "belgium", CA: "canada", CH: "switzerland", CZ: "czechia", DE: "germany", DK: "denmark",
  EE: "estonia", ES: "spain", FI: "finland", FR: "france", GB: "united-kingdom", HR: "croatia", HU: "hungary",
  IT: "italy", JP: "japan", KZ: "kazakhstan", LT: "lithuania", LV: "latvia", NL: "netherlands", NO: "norway",
  PL: "poland", RO: "romania", RS: "serbia", SE: "sweden", SI: "slovenia", SK: "slovakia", US: "usa"
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const T = {
  en: { rules: "Verified rules (dated)", rulesNote: "Checked against the source on the date shown; confirm the current season with the club.", comp: "Competition", season: "Season", rule: "Rule", src: "Source", checked: "Checked",
        kinds: { import_limit: "Roster / import rule", registration: "Registration", residence_work: "Residence and work", transfer: "Transfer" },
        cases: "Confirmed EHA transfers to this country", casesNote: "Only moves confirmed by a public source are shown; a previous transfer does not guarantee one for another player.",
        status: { elite_prospects_history: "Elite Prospects history", club_announcement: "Club announcement" }, seasonNA: "not stated in the source", allCases: "All confirmed cases" },
  ru: { rules: "Проверенные правила (с датой)", rulesNote: "Сверено с источником на указанную дату; актуальный сезон уточняйте у клуба.", comp: "Соревнование", season: "Сезон", rule: "Правило", src: "Источник", checked: "Проверено",
        kinds: { import_limit: "Правило состава / легионеров", registration: "Регистрация", residence_work: "Проживание и работа", transfer: "Трансфер" },
        cases: "Подтверждённые переходы EHA в эту страну", casesNote: "Показаны только переходы, подтверждённые публичным источником; прошлый переход не гарантирует результат другому игроку.",
        status: { elite_prospects_history: "История на Elite Prospects", club_announcement: "Объявление клуба" }, seasonNA: "в источнике не указан", allCases: "Все подтверждённые кейсы" },
};

function block(code, locale) {
  const t = T[locale];
  const rules = RULES.filter((r) => r.countryCode === code);
  const cases = CASES.filter((c) => c.countryCode === code && c.publish && c.status !== "pending");
  let html = "";
  if (rules.length) {
    html += `<section class="country-extra" id="verified-rules"><h2>${t.rules}</h2>` +
      `<div class="league-wrap" role="region" aria-label="${t.rules}" tabindex="0"><table class="league-table"><thead><tr><th scope="col">${t.comp}</th><th scope="col">${t.season}</th><th scope="col">${t.rule}</th><th scope="col">${t.checked}</th></tr></thead><tbody>` +
      rules.map((r) => `<tr><td data-label="${t.comp}">${esc(r.competition)}<br><small>${t.kinds[r.kind] || r.kind}</small></td><td data-label="${t.season}">${esc(r.season)}</td><td data-label="${t.rule}">${esc(r.text[locale])} <a href="${esc(r.source)}" target="_blank" rel="noopener">${t.src} ↗</a></td><td data-label="${t.checked}">${esc(r.checkedAt)}</td></tr>`).join("") +
      `</tbody></table></div><p class="tool-note">${t.rulesNote}</p></section>\n`;
  }
  if (cases.length) {
    html += `<section class="country-extra" id="country-cases"><h2>${t.cases}</h2><ul class="country-cases">` +
      cases.map((c) => `<li><strong>${esc(c.player)}</strong> — ${esc(c.team)}${c.league ? ` (${esc(c.league)})` : ""}. ${t.season}: ${c.season ? esc(c.season) : t.seasonNA}. <a href="${esc(c.source)}" target="_blank" rel="noopener">${t.status[c.status]} ↗</a>${c.quote && c.quote[locale] ? `<blockquote class="case-quote"><p>${esc(c.quote[locale])}</p></blockquote>` : ""}</li>`).join("") +
      `</ul><p class="tool-note">${t.casesNote} <a href="/cases">${t.allCases} →</a></p></section>\n`;
  }
  return html;
}

let touched = 0;
for (const [code, slug] of Object.entries(GUIDE_SLUG)) {
  const page = PAGES.find((p) => p.en === `/guides/hockey-in-${slug}`);
  if (!page) continue;
  for (const locale of ["en", "ru"]) {
    const file = path.join(ROOT, "public", locale, `${page[locale]}.html`);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    const content = `${START}\n${block(code, locale)}${END}`;
    // Always (re)place the block: remove an existing one, then insert after the
    // official-deadlines block when present, else before "how EHA works", else
    // before the assessment CTA section.
    html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\n?`), "");
    let at = -1;
    const dl = html.indexOf('<section class="country-extra" id="deadlines">');
    if (dl >= 0) at = html.indexOf("</section>", dl) + "</section>".length + 1;
    if (at < 0) at = html.indexOf('<section class="country-extra" id="eha-process">');
    if (at < 0) {
      const m = html.match(/<section[^>]*>\s*(?:<span class="section-number">\d+<\/span>)?\s*<h2>(?:Get assessed|Get an assessment|Получить оценку|Discuss your|Консультация EHA)/);
      at = m ? m.index : -1;
    }
    if (at < 0) { console.warn("no anchor:", file); continue; }
    html = html.slice(0, at) + content + "\n" + html.slice(at);
    fs.writeFileSync(file, html);
    touched++;
  }
}
console.log(`country guides updated: ${touched}`);

// /cases cards: a compact "starting point → task → EHA's work → result" block,
// injected into each card (matched by player name) between CASE_STORY markers.
// Only confirmed fields are shown; "result" is derived from the public evidence
// status unless the record has its own story.result.
const STORY = {
  en: { start: "Starting point", task: "Task", work: "EHA's work", result: "Result", missing: "Starting point, task and EHA's work are not published.",
        ep: (c) => `${c.team} is listed in the player's Elite Prospects history${c.season ? ` for ${c.season}` : ""}. The source does not say whether this was a tryout, a contract or a registration.`,
        club: (c) => `${c.team} announced the signing of the player.`,
        pending: () => "Awaiting confirmation: no independent public source has been found yet." },
  ru: { start: "Исходная точка", task: "Задача", work: "Работа EHA", result: "Итог", missing: "Исходная точка, задача и работа EHA не опубликованы.",
        ep: (c) => `Команда ${c.team} указана в истории игрока на Elite Prospects${c.season ? ` (сезон ${c.season})` : ""}. Был ли это просмотр, контракт или регистрация, источник не уточняет.`,
        club: (c) => `Клуб ${c.team} объявил о подписании игрока.`,
        pending: () => "Ожидает подтверждения: независимый публичный источник пока не найден." },
};
function storyBlock(c, locale) {
  const t = STORY[locale];
  const st = c.story || {};
  const pick = (k) => (st[k] && st[k][locale]) || null;
  const result = pick("result") || (c.status === "pending" ? t.pending(c) : c.status === "club_announcement" ? t.club(c) : t.ep(c));
  const rows = ["start", "task", "work"].map((k) => [k, pick(k)]).filter(([, v]) => v);
  const dl = rows.map(([k, v]) => `<div><dt>${t[k]}</dt><dd>${esc(v)}</dd></div>`).join("") + `<div><dt>${t.result}</dt><dd>${esc(result)}</dd></div>`;
  const note = !rows.length ? `<p class="case-story-note">${t.missing}</p>` : "";
  return `<!-- CASE_STORY --><dl class="case-story">${dl}</dl>${note}<!-- /CASE_STORY -->`;
}
let storyCards = 0;
for (const locale of ["en", "ru"]) {
  const file = path.join(ROOT, "public", locale, "cases.html");
  let html = fs.readFileSync(file, "utf8").replace(/<!-- CASE_STORY -->[\s\S]*?<!-- \/CASE_STORY -->/g, "");
  for (const c of CASES) {
    const h2 = `<h2>${esc(c.player)}</h2>`;
    const i = html.indexOf(h2);
    if (i < 0) { console.warn("case card not found:", locale, c.player); continue; }
    const pEnd = html.indexOf("</p>", i) + 4;
    html = html.slice(0, pEnd) + storyBlock(c, locale) + html.slice(pEnd);
    storyCards++;
  }
  fs.writeFileSync(file, html);
}
console.log(`case stories: ${storyCards} cards`);
