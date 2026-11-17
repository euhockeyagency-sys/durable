#!/usr/bin/env node
// Builds case and rule blocks from the two data sources:
//   src/cases-data.js    -> /cases (EN/RU) between <!-- CASES_PAGE:START/END -->
//                           and the "Confirmed EHA cases" block on each country guide
//   src/country-rules.js -> the "Verified rules" block on each country guide
// Country guide blocks sit between <!-- CASES:START --> / <!-- CASES:END -->.
// Matching uses the ISO country code, never text. A country without cases or
// rules gets an empty block (nothing visible). Run after editing either file:
//   node scripts/build-cases.js
// Rules carry data-valid-until; the server hides expired rules at request time
// (src/expiring-content.js), so an outdated rule is never shown as current.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const { PAGES } = require(path.join(ROOT, "src", "locales.js"));
const START = "<!-- CASES:START -->";
const END = "<!-- CASES:END -->";
const PSTART = "<!-- CASES_PAGE:START -->";
const PEND = "<!-- CASES_PAGE:END -->";

// ISO code -> English guide slug (/guides/hockey-in-<slug>).
const GUIDE_SLUG = {
  AT: "austria", BE: "belgium", CA: "canada", CH: "switzerland", CZ: "czechia", DE: "germany", DK: "denmark",
  EE: "estonia", ES: "spain", FI: "finland", FR: "france", GB: "united-kingdom", HR: "croatia", HU: "hungary",
  IT: "italy", JP: "japan", KZ: "kazakhstan", LT: "lithuania", LV: "latvia", NL: "netherlands", NO: "norway",
  PL: "poland", RO: "romania", RS: "serbia", SE: "sweden", SI: "slovenia", SK: "slovakia", US: "usa"
};
const COUNTRY = {
  AT: ["Austria", "Австрия"], BE: ["Belgium", "Бельгия"], CA: ["Canada", "Канада"], CH: ["Switzerland", "Швейцария"], CZ: ["Czechia", "Чехия"],
  DE: ["Germany", "Германия"], DK: ["Denmark", "Дания"], FI: ["Finland", "Финляндия"], FR: ["France", "Франция"], HU: ["Hungary", "Венгрия"],
  NL: ["Netherlands", "Нидерланды"], NO: ["Norway", "Норвегия"], PL: ["Poland", "Польша"], SE: ["Sweden", "Швеция"], SK: ["Slovakia", "Словакия"],
  TR: ["Türkiye", "Турция"], US: ["USA", "США"], GB: ["United Kingdom", "Великобритания"], IT: ["Italy", "Италия"],
};
const RULE_KINDS = ["foreign_limit", "registration_transfer", "residence", "work"];
const CASE_STAGES = ["tryout", "offer", "registered", "roster", "signed"];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const T = {
  en: {
    rules: "Verified rules by league and passport", rulesNote: "Each rule applies only to the league, age group and passport category shown. Checked against the official source on the date shown; confirm the current season with the club.",
    kinds: { foreign_limit: "Import / foreign-player limits", registration_transfer: "Sporting registration and international transfer", residence: "Right to reside", work: "Right to work" },
    season: "Season", applies: "Applies to", checked: "checked", src: "Official source",
    cases: "Confirmed EHA cases in this country", casesNote: "Only moves confirmed by a public source and by EHA's own records are shown. A previous move does not guarantee a result for another player.",
    stage: { tryout: "Tryout", offer: "Offer received", registered: "Registered", roster: "Joined the roster", signed: "Signed contract" },
    evidence: { elite_prospects_history: "Elite Prospects history", club_announcement: "Club announcement" },
    seasonNA: "not stated in the source", dest: "Destination", details: "Case details", allCases: "All confirmed cases",
    page: { club: "Club", badge: { elite_prospects_history: "Elite Prospects", club_announcement: "Club confirmation", pending: "Pending" },
      link: { elite_prospects_history: "Check Elite Prospects", club_announcement: "Club confirmation", pending: "Check Elite Prospects" }, guide: "Country guide", stageLabel: "Confirmed step" },
    guidePrefix: "{{EN}}",
  },
  ru: {
    rules: "Проверенные правила по лигам и паспортам", rulesNote: "Каждое правило относится только к указанной лиге, возрастной группе и категории паспорта. Сверено с официальным источником на указанную дату; актуальный сезон уточняйте у клуба.",
    kinds: { foreign_limit: "Лимит легионеров / иностранцев", registration_transfer: "Спортивная регистрация и международный трансфер", residence: "Право на проживание", work: "Право на работу" },
    season: "Сезон", applies: "Для кого", checked: "проверено", src: "Официальный источник",
    cases: "Подтверждённые кейсы EHA в этой стране", casesNote: "Показаны только переходы, подтверждённые публичным источником и записями EHA. Прошлый переход не гарантирует результат другому игроку.",
    stage: { tryout: "Просмотр", offer: "Получено предложение", registered: "Зарегистрирован", roster: "В составе команды", signed: "Подписан контракт" },
    evidence: { elite_prospects_history: "История на Elite Prospects", club_announcement: "Объявление клуба" },
    seasonNA: "в источнике не указан", dest: "Куда", details: "Подробнее о кейсе", allCases: "Все подтверждённые кейсы",
    page: { club: "Клуб", badge: { elite_prospects_history: "Elite Prospects", club_announcement: "Подтверждение клуба", pending: "Ожидает подтверждения" },
      link: { elite_prospects_history: "Проверить Elite Prospects", club_announcement: "Подтверждение клуба", pending: "Проверить Elite Prospects" }, guide: "Гид по стране", stageLabel: "Подтверждённый шаг" },
    guidePrefix: "",
  },
};

function loadData() {
  // fresh require so tests can call build() with modified data
  for (const f of ["cases-data.js", "country-rules.js"]) delete require.cache[require.resolve(path.join(ROOT, "src", f))];
  return { CASES: require(path.join(ROOT, "src", "cases-data.js")), RULES: require(path.join(ROOT, "src", "country-rules.js")) };
}

function validate({ CASES, RULES }) {
  const errors = [];
  const ids = new Set();
  for (const c of CASES) {
    if (!c.id || ids.has(c.id)) errors.push(`case id missing or duplicate: ${c.id}`);
    ids.add(c.id);
    if (!/^[A-Z]{2}$/.test(c.countryCode || "")) errors.push(`case ${c.id}: countryCode`);
    if (!CASE_STAGES.includes(c.stage)) errors.push(`case ${c.id}: stage ${c.stage}`);
    if (!["elite_prospects_history", "club_announcement", "pending"].includes(c.status)) errors.push(`case ${c.id}: status ${c.status}`);
    if (typeof c.publish !== "boolean" || typeof c.ehaConfirmed !== "boolean") errors.push(`case ${c.id}: publish/ehaConfirmed must be boolean`);
    if (c.season !== null && !/^\d{4}\/\d{2}$/.test(c.season)) errors.push(`case ${c.id}: season`);
  }
  const rids = new Set();
  for (const r of RULES) {
    if (!r.id || rids.has(r.id)) errors.push(`rule id missing or duplicate: ${r.id}`);
    rids.add(r.id);
    if (!RULE_KINDS.includes(r.kind)) errors.push(`rule ${r.id}: kind ${r.kind}`);
    for (const k of ["checkedAt", "validUntil"]) if (!/^\d{4}-\d{2}-\d{2}$/.test(r[k] || "")) errors.push(`rule ${r.id}: ${k}`);
    if (!/^https:\/\//.test(r.source || "")) errors.push(`rule ${r.id}: source`);
    for (const k of ["age", "citizenship", "text"]) if (!r[k] || !r[k].en || !r[k].ru) errors.push(`rule ${r.id}: ${k} needs en and ru`);
  }
  return errors;
}

const caseHref = (c) => c.caseUrl || `/cases#case-${c.id}`;
const shownOnCountry = (c) => c.publish && c.ehaConfirmed && c.status !== "pending" && CASE_STAGES.includes(c.stage);
const guidePath = (code, locale) => {
  const page = GUIDE_SLUG[code] && PAGES.find((p) => p.en === `/guides/hockey-in-${GUIDE_SLUG[code]}`);
  return page ? page[locale] : null;
};

function route(c, locale) {
  const to = `${esc(c.team)}${c.league ? ` (${esc(c.league)})` : ""}`;
  const from = c.fromTeam && c.fromLeague ? `${esc(c.fromTeam)} (${esc(c.fromLeague)})` : esc(c.fromTeam || c.fromLeague || "");
  return from ? `${from} → ${to}` : `${T[locale].dest}: ${to}`;
}

function countryBlock(code, locale, data, today) {
  const t = T[locale];
  const rules = data.RULES.filter((r) => r.countryCode === code && r.verified === true && r.validUntil >= today);
  const cases = data.CASES.filter((c) => c.countryCode === code && shownOnCountry(c));
  let html = "";
  if (rules.length) {
    html += `<section class="country-extra" id="verified-rules"><h2>${t.rules}</h2>`;
    for (const kind of RULE_KINDS) {
      const list = rules.filter((r) => r.kind === kind);
      if (!list.length) continue;
      html += `<div class="rule-group"><h3>${t.kinds[kind]}</h3><ul class="rule-list">` +
        list.map((r) => `<li data-valid-until="${r.validUntil}"><strong>${esc(r.competition)}</strong> · ${esc(r.age[locale])} · ${t.season} ${esc(r.season)}<br><span class="rule-applies">${t.applies}: ${esc(r.citizenship[locale])}</span><br>${esc(r.text[locale])} <a href="${esc(r.source)}" target="_blank" rel="noopener">${t.src} ↗</a> <small>(${t.checked} ${r.checkedAt})</small></li>`).join("") +
        `</ul></div>`;
    }
    html += `<p class="tool-note">${t.rulesNote}</p></section>\n`;
  }
  if (cases.length) {
    html += `<section class="country-extra" id="country-cases"><h2>${t.cases}</h2><ul class="country-cases">` +
      cases.map((c) => `<li id="country-case-${esc(c.id)}"><strong>${esc(c.player)}</strong> <span class="case-stage">${t.stage[c.stage]}</span><br>${route(c, locale)}. ${t.season}: ${c.season ? esc(c.season) : t.seasonNA}.<br><a href="${caseHref(c)}">${t.details} →</a>${c.source ? ` · <a href="${esc(c.source)}" target="_blank" rel="noopener">${t.evidence[c.status]} ↗</a>` : ""}</li>`).join("") +
      `</ul><p class="tool-note">${t.casesNote} <a href="/cases">${t.allCases} →</a></p></section>\n`;
  }
  return html;
}

function casesPage(locale, data) {
  const t = T[locale];
  return data.CASES.filter((c) => c.publish).map((c, i) => {
    const name = COUNTRY[c.countryCode] ? COUNTRY[c.countryCode][locale === "ru" ? 1 : 0] : c.countryCode;
    const guide = guidePath(c.countryCode, locale);
    const guideLink = guide ? `<a class="text-link case-guide" href="${t.guidePrefix}${guide}">${t.page.guide}: ${esc(name)} →</a>` : "";
    const stage = c.status === "pending" ? "" : `<div class="case-stage-row"><span>${t.page.stageLabel}</span><strong>${t.stage[c.stage]}</strong></div>`;
    return `<article id="case-${esc(c.id)}"><div class="case-number">${String(i + 1).padStart(2, "0")}</div><div class="case-country">${esc(name)}${c.league ? ` · ${esc(c.league)}` : ""}</div><h2>${esc(c.player)}</h2><p>${esc(c.note[locale])}</p><div class="case-club"><span>${t.page.club}</span><strong>${esc(c.team)}</strong></div>${stage}<div class="case-evidence"><span class="evidence-badge ${c.status === "elite_prospects_history" ? "ep" : c.status === "club_announcement" ? "club" : "pending"}">${t.page.badge[c.status]}</span></div><a class="text-link" href="${esc(c.source)}" rel="noopener">${t.page.link[c.status]} ↗</a>${guideLink}</article>`;
  }).join("\n");
}

function build({ root = ROOT, today = new Date().toISOString().slice(0, 10), write = true, data = loadData() } = {}) {
  const errors = validate(data);
  if (errors.length) throw new Error(`invalid data:\n${errors.join("\n")}`);
  const out = {};
  for (const [code, slug] of Object.entries(GUIDE_SLUG)) {
    const page = PAGES.find((p) => p.en === `/guides/hockey-in-${slug}`);
    if (!page) continue;
    for (const locale of ["en", "ru"]) {
      const file = path.join(root, "public", locale, `${page[locale]}.html`);
      if (!fs.existsSync(file)) continue;
      let html = fs.readFileSync(file, "utf8");
      const content = `${START}\n${countryBlock(code, locale, data, today)}${END}`;
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
      out[file] = html;
    }
  }
  for (const locale of ["en", "ru"]) {
    const file = path.join(root, "public", locale, "cases.html");
    let html = fs.readFileSync(file, "utf8");
    if (!html.includes(PSTART)) {
      // first run: wrap the existing hand-written cards in markers
      const a = html.indexOf('<section class="case-grid wrap">') + '<section class="case-grid wrap">'.length;
      const b = html.indexOf("</section>", a);
      html = `${html.slice(0, a)}\n${PSTART}${PEND}\n${html.slice(b)}`;
    }
    html = html.replace(new RegExp(`${PSTART}[\\s\\S]*?${PEND}`), `${PSTART}\n${casesPage(locale, data)}\n${PEND}`);
    out[file] = html;
  }
  if (write) for (const [f, h] of Object.entries(out)) fs.writeFileSync(f, h);
  return out;
}

module.exports = { build, validate, countryBlock, casesPage, GUIDE_SLUG };
if (require.main === module) {
  const out = build();
  console.log(`files updated: ${Object.keys(out).length}`);
}
