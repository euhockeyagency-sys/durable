"use strict";

// Transfer and registration calendar, season 2026/27, for every country in the
// league directory (public/assets/leagues.src.js). One row per deadline.
// status: confirmed (read in the named source) | needs_check (a date exists
// but EHA has not confirmed it for 2026/27) | not_published (EHA looked and
// found no published date). Rendered by <!-- TRANSFER_CALENDAR --> in
// src/article-blocks.js. Add a row only with a source; update checkedAt.

const { deadline } = require("./deadlines");
const CH = (part, locale) => deadline("ch-nl-2026-27", part, locale);

const S = {
  iihf: { label: "IIHF International Transfer Regulations 2026", url: "https://blob.iihf.com/iihf-media/iihfmvc/media/downloads/regulations/2026/2026_iihf_international_transfer_regulations.pdf" },
  alps: { label: "Alps Hockey League Game Book 2026/27", url: "https://gamebook.alps.hockey/documents/gamebooks/alps/ALPS_2627_Game_Book_260901.pdf" },
  oehv: { label: "ÖEHV Meldebestimmungen", url: "https://www.eishockey.at/media/doc/26c009e59e706d59dfddae3cd96ebb75/oeehv-meldebestimmungen.pdf" },
  cslh: { label: "ČSLH transfer rules (Přestupní řád) 2026", url: "https://www.ceskyhokej.cz/data/document/20260729/111830_3883_Prestupni-rad-mimo-klubu-extraligy-a-I.ligy-cistopis.pdf" },
  ffhgAlm: { label: "FFHG Règlement ALM 2026/27", url: "https://www.hockeyfrance.com/wp-content/uploads/2026/05/07-Reglement-ALM-2026.27_VF.pdf" },
  del2: { label: "DEL2 Spielordnung 2026/27", url: "https://www.del-2.org/media/regeln/spielordnung_del2_26_27.pdf" },
  deb: { label: "DEB Spielordnung", url: "https://www.deb-online.de/download/403/satzungen-ordnungen-des-deb/32777/spielordnung.pdf" },
  fisg: { label: "FISG NOFA 2026/27", url: "https://static.fisg.it/wp-content/uploads/2026/07/07183941/NOFA_26_27_def-1.pdf" },
  thl: { label: "Regulamin TAURON Hokej Ligi 2026/27", url: "https://cdn.sportigio.com/spaces/173/uploads/f860h7rqa4MI3nmLYztiSFQxHyeorimVe970fPR9.pdf" },
  pl1: { label: "Regulamin 1 Ligi", url: "https://cdn.sportigio.com/spaces/173/uploads/ObrL4yd4mzFvGON0dykXw3aM0SVSMkj4LMDmMXZ7.pdf" },
  sif: { label: "Swedish Ice Hockey Association: competition rules 2026/27", url: "https://www.swehockey.se/media/r1ickxrh/taevlingsbestaemmelser-2026-2027.pdf" },
  sihf: { label: "SIHF Reglement Spielbetrieb 2026/27", url: "https://m.sihf.ch/media/29858/r054_reglement-spielbetrieb-2026_2027.pdf" },
  nl: { label: "National League: Weisungen Spielbetrieb 2026/27", url: "https://www.nationalleague.ch/media/bvinatrg/weisungen_spielbetrieb_nl_26_27_d.pdf" },
  ihuk: { label: "Ice Hockey UK: ITC policy 2025/26", url: "https://englandicehockey.com/wp-content/uploads/2025/10/IHUK-ITC-Policy-Process-and-FAQs.pdf" }
};

const T = {
  en: { international: "International transfer", registration: "League registration deadline", domestic: "Domestic transfer window", restriction: "Other restriction",
    senior: "Senior", junior: "Junior", all: "All ages", confirmed: "Confirmed", needs_check: "Requires checking", not_published: "Not published" },
  ru: { international: "Международный трансфер", registration: "Срок дозаявки в лиге", domestic: "Внутреннее трансферное окно", restriction: "Другое ограничение",
    senior: "Взрослые", junior: "Юниоры", all: "Все возрасты", confirmed: "Подтверждено", needs_check: "Требует проверки", not_published: "Не опубликовано" }
};

const C = (en, ru) => ({ en, ru });
const ROWS = [
  { country: C("All countries", "Все страны"), league: "IIHF", category: "senior", type: "international", date: C("1 July 2026 – 15 February 2027 (players 18+)", "1 июля 2026 – 15 февраля 2027 (игроки 18+)"), note: C("Under 18: this window does not apply; national rules do.", "До 18 лет это окно не действует; применяются национальные правила."), status: "confirmed", source: "iihf", checkedAt: "2026-11-18" },
  { country: C("Austria", "Австрия"), league: "ÖEHV (all competitions)", category: "all", type: "domestic", date: C("Domestic licensing window ends 15 February", "Внутреннее окно лицензирования заканчивается 15 февраля"), status: "confirmed", source: "oehv", checkedAt: "2026-11-18" },
  { country: C("Austria", "Австрия"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Austria", "Австрия"), league: "ICE Hockey League", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Belgium", "Бельгия"), league: "CEHL", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Canada", "Канада"), league: "CHL (WHL / OHL / QMJHL)", category: "junior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Croatia", "Хорватия"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Czechia", "Чехия"), league: "ČSLH (outside Extraliga and 1. liga)", category: "all", type: "domestic", date: C("1 May – 31 January", "1 мая – 31 января"), status: "confirmed", source: "cslh", checkedAt: "2026-11-18" },
  { country: C("Czechia", "Чехия"), league: "Tipsport Extraliga / Maxa liga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Denmark", "Дания"), league: "Metal Ligaen", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Estonia", "Эстония"), league: "Unibet Hokiliiga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Finland", "Финляндия"), league: "Liiga / Mestis / Suomi-sarja", category: "senior", type: "registration", date: C("—", "—"), note: C("Mestis 2026/27 roster rules publish no registration deadline.", "Правила составов Mestis 2026/27 не публикуют срок регистрации."), status: "not_published", source: null, checkedAt: "2026-11-18" },
  { country: C("France", "Франция"), league: "Ligue Magnus", category: "senior", type: "registration", date: C("Transfers filed by 31 December 2026, 23:59", "Переходы до 31 декабря 2026, 23:59"), status: "confirmed", source: "ffhgAlm", checkedAt: "2026-11-18" },
  { country: C("France", "Франция"), league: "Ligue Magnus", category: "senior", type: "restriction", date: C("1–31 January 2027: two more arrivals per club", "1–31 января 2027: ещё два новичка на клуб"), status: "confirmed", source: "ffhgAlm", checkedAt: "2026-11-18" },
  { country: C("France", "Франция"), league: "Division 1", category: "senior", type: "registration", date: C("Transfers filed by 31 December 2026, 23:59; former club validates a national transfer by 5 January 2027", "Переходы до 31 декабря 2026, 23:59; прежний клуб подтверждает внутренний переход до 5 января 2027"), status: "confirmed", source: "ffhgAlm", checkedAt: "2026-11-18" },
  { country: C("Germany", "Германия"), league: "DEL2", category: "senior", type: "registration", date: C("Last licence application 15 February 2027", "Последний день подачи на лицензию — 15 февраля 2027"), status: "confirmed", source: "del2", checkedAt: "2026-11-18" },
  { country: C("Germany", "Германия"), league: "DEB youth competitions", category: "junior", type: "domestic", date: C("1 June – 15 September and 1 December – 31 January", "1 июня – 15 сентября и 1 декабря – 31 января"), note: C("How this interacts with the IIHF under-18 rule is to be confirmed with the DEB.", "Как это сочетается с правилом IIHF для игроков до 18, уточняйте в DEB."), status: "confirmed", source: "deb", checkedAt: "2026-11-18" },
  { country: C("Germany", "Германия"), league: "DEL / Oberliga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Hungary", "Венгрия"), league: "Erste Liga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Italy", "Италия"), league: "Italian Hockey League", category: "senior", type: "registration", date: C("Transfer and registration deadline 11 January 2027", "Срок перехода и регистрации — 11 января 2027"), status: "confirmed", source: "fisg", checkedAt: "2026-11-18" },
  { country: C("Italy", "Италия"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Japan", "Япония"), league: "Asia League Ice Hockey", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Kazakhstan", "Казахстан"), league: "Pro Hokei Ligasy", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Latvia", "Латвия"), league: "Optibet hokeja līga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Lithuania", "Литва"), league: "Optibet hokeja lyga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Netherlands", "Нидерланды"), league: "CEHL", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Norway", "Норвегия"), league: "EliteHockey Ligaen", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Poland", "Польша"), league: "TAURON Hokej Liga", category: "senior", type: "registration", date: C("Window closes 15 February 2027, 23:59", "Окно закрывается 15 февраля 2027, 23:59"), status: "confirmed", source: "thl", checkedAt: "2026-11-18" },
  { country: C("Poland", "Польша"), league: "TAURON Hokej Liga", category: "senior", type: "restriction", date: C("1–31 December: up to 3 arrivals; 1 January – 15 February: up to 2", "1–31 декабря: до 3 новичков; 1 января – 15 февраля: до 2"), status: "confirmed", source: "thl", checkedAt: "2026-11-18" },
  { country: C("Poland", "Польша"), league: "1 Liga", category: "senior", type: "registration", date: C("31 January (regulation text says 31.01.2026)", "31 января (в тексте регламента — 31.01.2026)"), note: C("Year to be confirmed with the PZHL.", "Год уточняйте в PZHL."), status: "needs_check", source: "pl1", checkedAt: "2026-11-18" },
  { country: C("Romania", "Румыния"), league: "Liga Naţională", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Serbia", "Сербия"), league: "International Hockey League (IHL)", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Slovakia", "Словакия"), league: "Tipsport liga / TIPOS SHL", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Slovenia", "Словения"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Spain", "Испания"), league: "Liga Nacional", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Sweden", "Швеция"), league: "SIF (all competitions)", category: "all", type: "international", date: C("Move from a foreign club: 1 June – 31 January", "Переход из зарубежного клуба: 1 июня – 31 января"), note: C("Competition-specific deadlines can differ.", "Сроки отдельных соревнований могут отличаться."), status: "confirmed", source: "sif", checkedAt: "2026-11-18" },
  { country: C("Switzerland", "Швейцария"), league: "SIHF (all competitions)", category: "all", type: "domestic", date: C("15 April – 15 September and 1 November – 31 December", "15 апреля – 15 сентября и 1 ноября – 31 декабря"), note: C("31 December is also the deadline for international transfers into youth and amateur hockey.", "31 декабря — также срок международных переходов в юношеский и любительский хоккей."), status: "confirmed", source: "sihf", checkedAt: "2026-11-18" },
  { country: C("Switzerland", "Швейцария"), league: "National League", category: "senior", type: "registration", date: C(`Swiss players until ${CH("swiss", "en")}; foreign players and IIHF approval until ${CH("foreign", "en")}`, `Швейцарские игроки — до ${CH("swiss", "ru")}; иностранцы и одобрение IIHF — до ${CH("foreign", "ru")}`), status: "confirmed", source: "nl", checkedAt: "2026-11-18" },
  { country: C("United Kingdom", "Великобритания"), league: "EIHL", category: "senior", type: "international", date: C("1 August – 15 February, 23:59 CET (2025/26 policy)", "1 августа – 15 февраля, 23:59 CET (политика 2025/26)"), note: C("2026/27 dates to be confirmed with Ice Hockey UK.", "Даты 2026/27 уточняйте в Ice Hockey UK."), status: "needs_check", source: "ihuk", checkedAt: "2026-11-18" },
  { country: C("United Kingdom", "Великобритания"), league: "England and Scotland leagues (NIHL and others)", category: "senior", type: "international", date: C("1 August – 31 January, 23:59 CET (2025/26 policy)", "1 августа – 31 января, 23:59 CET (политика 2025/26)"), note: C("2026/27 dates to be confirmed.", "Даты 2026/27 уточняйте."), status: "needs_check", source: "ihuk", checkedAt: "2026-11-18" },
  { country: C("USA", "США"), league: "NCAA / ECHL / NCDC", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" }
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function renderCalendar(locale) {
  const t = T[locale] || T.en;
  const L = locale === "ru"
    ? { country: "Страна", league: "Лига", category: "Категория", type: "Тип срока", date: "Дата", status: "Статус", source: "Источник", checked: "Проверено", any: "Все", filters: "Фильтры календаря", count: "Показано записей:" }
    : { country: "Country", league: "League", category: "Category", type: "Deadline type", date: "Date", status: "Status", source: "Source", checked: "Checked", any: "All", filters: "Calendar filters", count: "Rows shown:" };
  const countries = [];
  ROWS.forEach((r) => { if (!countries.some((c) => c.en === r.country.en)) countries.push(r.country); });
  const leagues = [...new Set(ROWS.map((r) => r.league))].sort();
  const opt = (v, l) => `<option value="${esc(v)}">${esc(l)}</option>`;
  const filters = `<form class="calendar-filters" id="calendar-filters" aria-label="${L.filters}" hidden>` +
    `<label>${L.country}<select data-filter="country"><option value="">${L.any}</option>${countries.map((c) => opt(slug(c.en), c[locale] || c.en)).join("")}</select></label>` +
    `<label>${L.league}<select data-filter="league"><option value="">${L.any}</option>${leagues.map((l) => opt(slug(l), l)).join("")}</select></label>` +
    `<label>${L.category}<select data-filter="category"><option value="">${L.any}</option>${["senior", "junior", "all"].map((c) => opt(c, t[c])).join("")}</select></label>` +
    `<p class="muted" aria-live="polite">${L.count} <span id="calendar-count">${ROWS.length}</span></p></form>`;
  const rows = ROWS.map((r) => {
    const country = r.country[locale] || r.country.en;
    const src = r.source && S[r.source] ? `<a href="${esc(S[r.source].url)}" rel="noopener" target="_blank">${esc(S[r.source].label)} ↗</a>` : "—";
    const note = r.note ? `<br><small>${esc(r.note[locale] || r.note.en)}</small>` : "";
    const [y, m, d] = r.checkedAt.split("-");
    return `<tr data-country="${slug(r.country.en)}" data-league="${slug(r.league)}" data-category="${r.category}"><td data-label="${L.country}">${esc(country)}</td><td data-label="${L.league}">${esc(r.league)}</td>` +
      `<td data-label="${L.category}">${t[r.category]}</td><td data-label="${L.type}">${t[r.type]}</td><td data-label="${L.date}"><strong>${esc(r.date[locale] || r.date.en)}</strong>${note}</td>` +
      `<td data-label="${L.status}"><span class="cal-status cal-${r.status}">${t[r.status]}</span></td><td data-label="${L.source}">${src}</td><td data-label="${L.checked}"><small>${d}.${m}.${y}</small></td></tr>`;
  }).join("");
  return filters + `<div class="league-wrap" role="region" aria-label="${esc(L.filters)}" tabindex="0"><table class="league-table" id="transfer-calendar"><thead><tr><th>${L.country}</th><th>${L.league}</th><th>${L.category}</th><th>${L.type}</th><th>${L.date}</th><th>${L.status}</th><th>${L.source}</th><th>${L.checked}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

module.exports = { ROWS, SOURCES: S, renderCalendar };
