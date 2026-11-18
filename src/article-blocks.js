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
const BYLINE_MARKER = "<!-- EHA_BYLINE -->";

// Logical paths (EN and RU) of articles the agent has reviewed. Add a path only after
// Viachaslau Marshchonak confirms he checked that text; until then the byline
// says the article was prepared by EHA, without claiming an expert review.
const REVIEWED = new Set([]);

const L = {
  en: {
    caption: "Leagues compared: level, import rule and pay data",
    thLeague: "League", thLevel: "Level", thRule: "Rule for imports", thPay: "Pay data", thChecked: "Checked",
    tier: { 1: "Top level", 2: "Second level", 3: "Third level", 4: "Fourth level" },
    press: "press report, not a regulation",
    pay: { eha_estimate: "EHA estimate", third_party: "third-party range — an example, not an average", no_sample: "No reliable sample" },
    more: "League page",
    by: "Prepared by the European Hockey Agency editorial team",
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
    by: "Подготовлено редакцией European Hockey Agency",
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
    const press = p.rules.some((r) => r.status === "press") ? ` <span class="rule-status rule-press">${s.press}</span>` : "";
    const ex = (p.money.examples || [])[0];
    const pay = ex ? `<strong>${esc(t(ex.value, locale))}</strong><br><small>${s.pay[p.money.status] || ""}</small>` : s.pay.no_sample;
    return `<tr data-league-id="${esc(p.id)}"><td data-label="${s.thLeague}"><a href="${esc(p.paths[locale])}"><strong>${esc(name)}</strong></a></td>` +
      `<td data-label="${s.thLevel}">${level}</td>` +
      `<td data-label="${s.thRule}">${esc(rule)} <small>(${esc(p.season)})</small>${press}</td>` +
      `<td data-label="${s.thPay}">${pay}</td>` +
      `<td data-label="${s.thChecked}"><small>${shortDate(p.checkedAt, locale)}</small></td></tr>`;
  }).join("");
  return `<div class="league-wrap league-compare" role="region" aria-label="${esc(s.caption)}" tabindex="0"><table class="league-table"><thead><tr><th>${s.thLeague}</th><th>${s.thLevel}</th><th>${s.thRule}</th><th>${s.thPay}</th><th>${s.thChecked}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function byline(logicalPath, locale) {
  const s = L[locale];
  const agentUrl = "/agent";
  const lead = REVIEWED.has(logicalPath)
    ? `<strong>${s.reviewed}:</strong> <a href="${agentUrl}">${s.agent}</a>, ${s.role}.`
    : `<a href="${locale === "ru" ? "/metodologiya" : "/editorial-methodology"}">${s.by}</a>. ${s.agent}, ${s.role}. <a href="${agentUrl}">${s.about} →</a>`;
  return `<aside class="article-byline"><img src="/assets/viachaslau-marshchonak-640.webp" alt="" width="48" height="48" loading="lazy"><p>${lead}</p></aside>`;
}

function applyArticleBlocks(html, logicalPath, locale) {
  if (html.includes("<!-- LEAGUE_COMPARE:")) {
    html = html.replace(COMPARE_RE, (m, ids) => compareTable(ids.split(","), locale));
  }
  if (html.includes(BYLINE_MARKER)) html = html.split(BYLINE_MARKER).join(byline(logicalPath, locale));
  return html;
}

module.exports = { applyArticleBlocks, compareTable, byline, REVIEWED, BYLINE_MARKER };
