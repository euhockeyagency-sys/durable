"use strict";

// Shared blocks for guide articles:
//   <!-- LEAGUE_COMPARE:id1,id2,... -->  comparison table built from league profiles
//   <!-- EHA_BYLINE -->                   agent byline with a link to /agent
// Both are filled at render time so the numbers stay in one place
// (src/league-profiles.js) and the byline wording follows BRAND.md.

const { profileById } = require("./league-profiles");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const t = (v, locale) => (v && typeof v === "object" ? (v[locale] || v.en) : v);

const COMPARE_RE = /<!-- LEAGUE_COMPARE:([a-z0-9,-]+) -->/g;
const DEADLINES_RE = /<!-- LEAGUE_DEADLINES:([a-z0-9,-]+) -->/g;
const BYLINE_MARKER = "<!-- EHA_BYLINE -->";

// Owner's decision, 20.11.2026: Viachaslau Marshchonak is the author of the EN/RU
// articles, so the byline names him as author (matching author = Person in the
// page JSON-LD). REVIEWED stays exported for older callers and is no longer used.
const REVIEWED = new Set([]);

const L = {
  en: {
    caption: "Leagues compared: level, import rule and pay data",
    thLeague: "League", thLevel: "Level", thRule: "Rule for imports", thPay: "Pay data", thChecked: "Checked",
    tier: { 1: "Top level", 2: "Second level", 3: "Third level", 4: "Fourth level" },
    press: "press report, not a regulation",
    pay: { eha_estimate: "EHA estimate", third_party: "third-party range — an example, not an average", no_sample: "No reliable sample" },
    more: "League page",
    dlCaption: "Official dates by league, season 2026/27", thPeriod: "Period", thDates: "Dates", thBasis: "Basis",
    by: "By",
    method: "How we check facts",
    reviewed: "Reviewed by an expert",
    agent: "Viachaslau Marshchonak",
    role: "hockey agent since 2016, founder of EHA; 100+ players placed",
    about: "About the agent"
  },
  ru: {
    caption: "Сравнение лиг: уровень, правило для легионеров и данные о зарплатах",
    thLeague: "Лига", thLevel: "Уровень", thRule: "Правило для легионеров", thPay: "Данные о зарплатах", thChecked: "Проверено",
    tier: { 1: "Высший уровень", 2: "Второй уровень", 3: "Третий уровень", 4: "Четвёртый уровень" },
    press: "сообщение прессы, не регламент",
    pay: { eha_estimate: "оценка EHA", third_party: "сторонний диапазон — пример, не средняя", no_sample: "Надёжной выборки нет" },
    more: "Страница лиги",
    dlCaption: "Официальные даты по лигам, сезон 2026/27", thPeriod: "Период", thDates: "Даты", thBasis: "Основание",
    by: "Автор:",
    method: "Как мы проверяем факты",
    reviewed: "Проверено экспертом",
    agent: "Вячеслав Морщенок",
    role: "хоккейный агент с 2016 года, основатель EHA; 100+ игроков размещено",
    about: "Об агенте"
  }
};

const MONTHS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["янв.", "февр.", "марта", "апр.", "мая", "июня", "июля", "авг.", "сент.", "окт.", "нояб.", "дек."]
};
const shortDate = (iso, locale) => {
  const [y, m, d] = iso.split("-").map(Number);
  return locale === "ru" ? `${d} ${MONTHS.ru[m - 1]} ${y}` : `${d} ${MONTHS.en[m - 1]} ${y}`;
};

let leagueData = null;
function leagues() {
  if (leagueData) return leagueData;
  try {
    const src = fs.readFileSync(path.join(__dirname, "..", "public", "assets", "leagues.src.js"), "utf8");
    const sandbox = { window: {} };
    vm.runInNewContext(src, sandbox, { timeout: 500 });
    leagueData = (sandbox.window.EHA_LEAGUES_SRC && sandbox.window.EHA_LEAGUES_SRC.leagues) || [];
  } catch {
    leagueData = [];
  }
  return leagueData;
}

function compareTable(ids, locale) {
  const s = L[locale];
  const rows = ids.map(profileById).filter(Boolean).map((p) => {
    const rec = leagues().find((l) => l.name === p.data.name && l.country.en === p.data.country);
    const name = t(p.names.display, locale);
    const level = rec ? `${s.tier[rec.tier] || ""} · ${esc(t(p.country, locale))}` : esc(t(p.country, locale));
    const rule = t(p.importSummary, locale) || t(p.calcChecks, locale)[0];
    const press = p.rules[0] && p.rules[0].status === "press" ? ` <span class="rule-status rule-press">${s.press}</span>` : "";
    const ex = (p.money.examples || [])[0];
    const exValue = ex ? t(ex.value, locale) : "";
    const payLabel = /EHA/.test(exValue) ? "" : `<br><small>${s.pay[p.money.status] || ""}</small>`;
    const pay = ex ? `<strong>${esc(exValue)}</strong>${payLabel}` : s.pay.no_sample;
    return `<tr data-league-id="${esc(p.id)}"><td data-label="${s.thLeague}"><a href="${esc(p.paths[locale])}"><strong>${esc(name)}</strong></a></td>` +
      `<td data-label="${s.thLevel}">${level}</td>` +
      `<td data-label="${s.thRule}">${esc(rule)} <small>(${esc(p.season)})</small>${press}</td>` +
      `<td data-label="${s.thPay}">${pay}</td>` +
      `<td data-label="${s.thChecked}"><small>${shortDate(p.checkedAt, locale)}</small></td></tr>`;
  }).join("");
  return `<div class="league-wrap league-compare" role="region" aria-label="${esc(s.caption)}" tabindex="0"><table class="league-table"><thead><tr><th>${s.thLeague}</th><th>${s.thLevel}</th><th>${s.thRule}</th><th>${s.thPay}</th><th>${s.thChecked}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// Official windows only (EHA guide periods are left out); generic IIHF and
// season rows are skipped so the table shows league-specific deadlines.
function deadlinesTable(ids, locale) {
  const s = L[locale];
  const { SOURCES } = require("./league-profiles");
  const rows = ids.map(profileById).filter(Boolean).flatMap((p) => p.windows
    .filter((w) => w.kind === "official" && !/^IIHF transfer period|^Season$|^Regular season$|^Season start$|^Season \(regulation\)$/.test(w.label.en))
    .map((w) => {
      const src = w.source && SOURCES[w.source] ? `<a href="${esc(SOURCES[w.source].url)}" rel="noopener" target="_blank">${esc(t(SOURCES[w.source].label, locale))} ↗</a>` : "";
      return `<tr><td data-label="${s.thLeague}"><a href="${esc(p.paths[locale])}">${esc(t(p.names.display, locale))}</a></td><td data-label="${s.thPeriod}">${esc(t(w.label, locale))}</td><td data-label="${s.thDates}"><strong>${esc(t(w.dates, locale))}</strong></td><td data-label="${s.thBasis}">${w.ref ? esc(w.ref) + ". " : ""}${src}</td></tr>`;
    })).join("");
  return `<div class="league-wrap" role="region" aria-label="${esc(s.dlCaption)}" tabindex="0"><table class="league-table"><thead><tr><th>${s.thLeague}</th><th>${s.thPeriod}</th><th>${s.thDates}</th><th>${s.thBasis}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function byline(logicalPath, locale) {
  const s = L[locale];
  const method = locale === "ru" ? "/metodologiya" : "/editorial-methodology";
  const lead = `<strong>${s.by} <a href="/agent">${s.agent}</a></strong>, ${s.role}. <a href="${method}">${s.method} →</a>`;
  return `<aside class="article-byline"><img src="/assets/viachaslau-marshchonak-640.webp" alt="" width="48" height="48" loading="lazy"><p>${lead}</p></aside>`;
}

function applyArticleBlocks(html, logicalPath, locale) {
  if (html.includes("<!-- LEAGUE_COMPARE:")) {
    html = html.replace(COMPARE_RE, (m, ids) => compareTable(ids.split(","), locale));
  }
  if (html.includes("<!-- LEAGUE_DEADLINES:")) {
    html = html.replace(DEADLINES_RE, (m, ids) => deadlinesTable(ids.split(","), locale));
  }
  if (html.includes("<!-- TRANSFER_CALENDAR -->")) {
    const { renderCalendar } = require("./transfer-calendar");
    html = html.replace("<!-- TRANSFER_CALENDAR -->", renderCalendar(locale));
  }
  if (html.includes(BYLINE_MARKER)) html = html.split(BYLINE_MARKER).join(byline(logicalPath, locale));
  return html;
}

module.exports = { applyArticleBlocks, compareTable, deadlinesTable, byline, REVIEWED, BYLINE_MARKER };
