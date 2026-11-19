"use strict";

// Transfer and registration calendar, season 2026/27, for every country in the
// league directory (public/assets/leagues.src.js). One row per deadline.
// status: confirmed (read in the named source) | needs_check (a date exists
// but EHA has not confirmed it for 2026/27) | not_published (EHA looked and
// found no published date). Rendered by <!-- TRANSFER_CALENDAR --> in
// src/article-blocks.js. Add a row only with a source; update checkedAt.
//
// windows: machine-readable dates of the row, only as stated in the source:
//   { opens?: "YYYY-MM-DD", closes?: "YYYY-MM-DD", closesTime?: "HH:MM", closesMonthDay?: "MM-DD" }
// closesMonthDay is used when the source gives no year. No time or time zone
// is added when the source states none. "Open now" needs status "confirmed"
// and a window with both opens and closes. A new season gets new rows from
// its own documents; dates are never carried over from the previous season.
// type: international (IIHF / federation move between countries) |
// registration (league registration and late additions) | domestic |
// restriction (e.g. limits on arrivals) | playoff (play-off-only rules).

const { deadline, DEADLINES } = require("./deadlines");
const SWISS_NL = DEADLINES["ch-nl-2026-27"];
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
  en: { international: "International transfer (IIHF / federation)", registration: "League registration / late additions", domestic: "Domestic transfer window", restriction: "Other restriction", playoff: "Play-off rule",
    senior: "Senior", junior: "Junior", all: "All ages", confirmed: "Confirmed", needs_check: "Requires checking", not_published: "Date not found in published sources" },
  ru: { international: "Международный трансфер (IIHF / федерация)", registration: "Регистрация и дозаявка в лиге", domestic: "Внутреннее трансферное окно", restriction: "Другое ограничение", playoff: "Правило плей-офф",
    senior: "Взрослые", junior: "Юниоры", all: "Все возрасты", confirmed: "Подтверждено", needs_check: "Требует проверки", not_published: "Дата не найдена в опубликованных источниках" }
};

const C = (en, ru) => ({ en, ru });
const ROWS = [
  { country: C("All countries", "Все страны"), league: "IIHF", category: "senior", type: "international", date: C("1 July 2026 – 15 February 2027 (players 18+)", "1 июля 2026 – 15 февраля 2027 (игроки 18+)"), note: C("Under 18: this window does not apply; national rules do.", "До 18 лет это окно не действует; применяются национальные правила."), windows: [{ opens: "2026-07-01", closes: "2027-02-15" }], status: "confirmed", source: "iihf", checkedAt: "2026-11-18" },
  { country: C("Austria", "Австрия"), league: "ÖEHV (all competitions)", category: "all", type: "domestic", date: C("Domestic licensing window ends 15 February", "Внутреннее окно лицензирования заканчивается 15 февраля"), windows: [{ closesMonthDay: "02-15" }], status: "confirmed", source: "oehv", checkedAt: "2026-11-18" },
  { country: C("Austria", "Австрия"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), windows: [{ closes: "2026-12-30", closesTime: "18:00" }], status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Austria", "Австрия"), league: "ICE Hockey League", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Belgium", "Бельгия"), league: "CEHL", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Canada", "Канада"), league: "CHL (WHL / OHL / QMJHL)", category: "junior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Croatia", "Хорватия"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), windows: [{ closes: "2026-12-30", closesTime: "18:00" }], status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Czechia", "Чехия"), league: "ČSLH (outside Extraliga and 1. liga)", category: "all", type: "domestic", date: C("1 May – 31 January", "1 мая – 31 января"), windows: [{ opens: "2026-05-01", closes: "2027-01-31" }], status: "confirmed", source: "cslh", checkedAt: "2026-11-18" },
  { country: C("Czechia", "Чехия"), league: "Tipsport Extraliga / Maxa liga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Denmark", "Дания"), league: "Metal Ligaen", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Estonia", "Эстония"), league: "Unibet Hokiliiga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Finland", "Финляндия"), league: "Liiga / Mestis / Suomi-sarja", category: "senior", type: "registration", date: C("—", "—"), note: C("Mestis 2026/27 roster rules publish no registration deadline.", "Правила составов Mestis 2026/27 не публикуют срок регистрации."), status: "not_published", source: null, checkedAt: "2026-11-18" },
  { country: C("France", "Франция"), league: "Ligue Magnus", category: "senior", type: "registration", date: C("Transfers filed by 31 December 2026, 23:59", "Переходы до 31 декабря 2026, 23:59"), windows: [{ closes: "2026-12-31", closesTime: "23:59" }], status: "confirmed", source: "ffhgAlm", checkedAt: "2026-11-18" },
  { country: C("France", "Франция"), league: "Ligue Magnus", category: "senior", type: "restriction", date: C("1–31 January 2027: two more arrivals per club", "1–31 января 2027: ещё два новичка на клуб"), windows: [{ opens: "2027-01-01", closes: "2027-01-31" }], status: "confirmed", source: "ffhgAlm", checkedAt: "2026-11-18" },
  { country: C("France", "Франция"), league: "Division 1", category: "senior", type: "registration", date: C("Transfers filed by 31 December 2026, 23:59; former club validates a national transfer by 5 January 2027", "Переходы до 31 декабря 2026, 23:59; прежний клуб подтверждает внутренний переход до 5 января 2027"), windows: [{ closes: "2026-12-31", closesTime: "23:59" }], status: "confirmed", source: "ffhgAlm", checkedAt: "2026-11-18" },
  { country: C("Germany", "Германия"), league: "DEL2", category: "senior", type: "registration", date: C("Last licence application 15 February 2027", "Последний день подачи на лицензию — 15 февраля 2027"), windows: [{ closes: "2027-02-15" }], status: "confirmed", source: "del2", checkedAt: "2026-11-18" },
  { country: C("Germany", "Германия"), league: "DEB youth competitions", category: "junior", type: "domestic", date: C("1 June – 15 September and 1 December – 31 January", "1 июня – 15 сентября и 1 декабря – 31 января"), note: C("How this interacts with the IIHF under-18 rule is to be confirmed with the DEB.", "Как это сочетается с правилом IIHF для игроков до 18, уточняйте в DEB."), windows: [{ opens: "2026-06-01", closes: "2026-09-15" }, { opens: "2026-12-01", closes: "2027-01-31" }], status: "confirmed", source: "deb", checkedAt: "2026-11-18" },
  { country: C("Germany", "Германия"), league: "DEL / Oberliga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Hungary", "Венгрия"), league: "Erste Liga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Italy", "Италия"), league: "Italian Hockey League", category: "senior", type: "registration", date: C("Transfer and registration deadline 11 January 2027", "Срок перехода и регистрации — 11 января 2027"), windows: [{ closes: "2027-01-11" }], status: "confirmed", source: "fisg", checkedAt: "2026-11-18" },
  { country: C("Italy", "Италия"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), windows: [{ closes: "2026-12-30", closesTime: "18:00" }], status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Japan", "Япония"), league: "Asia League Ice Hockey", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Kazakhstan", "Казахстан"), league: "Pro Hokei Ligasy", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Latvia", "Латвия"), league: "Optibet hokeja līga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Lithuania", "Литва"), league: "Optibet hokeja lyga", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Netherlands", "Нидерланды"), league: "CEHL", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Norway", "Норвегия"), league: "EliteHockey Ligaen", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Poland", "Польша"), league: "TAURON Hokej Liga", category: "senior", type: "registration", date: C("Window closes 15 February 2027, 23:59", "Окно закрывается 15 февраля 2027, 23:59"), windows: [{ closes: "2027-02-15", closesTime: "23:59" }], status: "confirmed", source: "thl", checkedAt: "2026-11-18" },
  { country: C("Poland", "Польша"), league: "TAURON Hokej Liga", category: "senior", type: "restriction", date: C("1–31 December: up to 3 arrivals; 1 January – 15 February: up to 2", "1–31 декабря: до 3 новичков; 1 января – 15 февраля: до 2"), windows: [{ opens: "2026-12-01", closes: "2026-12-31" }, { opens: "2027-01-01", closes: "2027-02-15" }], status: "confirmed", source: "thl", checkedAt: "2026-11-18" },
  { country: C("Poland", "Польша"), league: "1 Liga", category: "senior", type: "registration", date: C("31 January (regulation text says 31.01.2026)", "31 января (в тексте регламента — 31.01.2026)"), note: C("Year to be confirmed with the PZHL.", "Год уточняйте в PZHL."), windows: [{ closesMonthDay: "01-31" }], status: "needs_check", source: "pl1", checkedAt: "2026-11-18" },
  { country: C("Romania", "Румыния"), league: "Liga Naţională", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Serbia", "Сербия"), league: "International Hockey League (IHL)", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Slovakia", "Словакия"), league: "Tipsport liga / TIPOS SHL", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Slovenia", "Словения"), league: "Alps Hockey League", category: "senior", type: "registration", date: C("Non-domestic players may change clubs until 30 December 2026, 18:00", "Неместные игроки могут сменить клуб до 30 декабря 2026, 18:00"), windows: [{ closes: "2026-12-30", closesTime: "18:00" }], status: "confirmed", source: "alps", checkedAt: "2026-11-18" },
  { country: C("Spain", "Испания"), league: "Liga Nacional", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" },
  { country: C("Sweden", "Швеция"), league: "SIF (all competitions)", category: "all", type: "international", date: C("Move from a foreign club: 1 June – 31 January", "Переход из зарубежного клуба: 1 июня – 31 января"), note: C("Competition-specific deadlines can differ.", "Сроки отдельных соревнований могут отличаться."), windows: [{ opens: "2026-06-01", closes: "2027-01-31" }], status: "confirmed", source: "sif", checkedAt: "2026-11-18" },
  { country: C("Switzerland", "Швейцария"), league: "SIHF (all competitions)", category: "all", type: "domestic", date: C("15 April – 15 September and 1 November – 31 December", "15 апреля – 15 сентября и 1 ноября – 31 декабря"), note: C("31 December is also the deadline for international transfers into youth and amateur hockey.", "31 декабря — также срок международных переходов в юношеский и любительский хоккей."), windows: [{ opens: "2026-04-15", closes: "2026-09-15" }, { opens: "2026-11-01", closes: "2026-12-31" }], status: "confirmed", source: "sihf", checkedAt: "2026-11-18" },
  { country: C("Switzerland", "Швейцария"), league: "National League", category: "senior", type: "registration", date: C(`Swiss players until ${CH("swiss", "en")}; foreign players and IIHF approval until ${CH("foreign", "en")}`, `Швейцарские игроки — до ${CH("swiss", "ru")}; иностранцы и одобрение IIHF — до ${CH("foreign", "ru")}`), windows: [{ closes: SWISS_NL.swiss.date, closesTime: "24:00", who: C("Swiss players", "швейцарские игроки") }, { closes: SWISS_NL.foreign.date, closesTime: "24:00", who: C("Foreign players and IIHF approval", "иностранцы и одобрение IIHF") }], status: "confirmed", source: "nl", checkedAt: "2026-11-18" },
  { country: C("United Kingdom", "Великобритания"), league: "EIHL", category: "senior", type: "international", date: C("1 August – 15 February, 23:59 CET (2025/26 policy)", "1 августа – 15 февраля, 23:59 CET (политика 2025/26)"), note: C("2026/27 dates to be confirmed with Ice Hockey UK.", "Даты 2026/27 уточняйте в Ice Hockey UK."), status: "needs_check", source: "ihuk", checkedAt: "2026-11-18" },
  { country: C("United Kingdom", "Великобритания"), league: "England and Scotland leagues (NIHL and others)", category: "senior", type: "international", date: C("1 August – 31 January, 23:59 CET (2025/26 policy)", "1 августа – 31 января, 23:59 CET (политика 2025/26)"), note: C("2026/27 dates to be confirmed.", "Даты 2026/27 уточняйте."), status: "needs_check", source: "ihuk", checkedAt: "2026-11-18" },
  { country: C("USA", "США"), league: "NCAA / ECHL / NCDC", category: "senior", type: "registration", date: C("—", "—"), status: "needs_check", source: null, checkedAt: "2026-11-18" }
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SEASON = "2026/27";
// Months in season order (July → June) for the month filter.
const SEASON_MONTHS = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
const MONTH_NAMES = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
};

const UI = {
  en: { country: "Country", league: "League", category: "Age", type: "Deadline type", date: "Date", season: "Season", status: "Status", source: "Official source", checked: "Checked",
    any: "All", filters: "Calendar filters", count: "Rows shown:", month: "Deadline month", openNow: "Open now", january: "January", february: "February", reset: "Reset filters",
    empty: "No rows match these filters. A missing row does not mean a window is open or closed — reset the filters or check the country guide.",
    stateOpen: "Open now", stateClosed: "Window closed", stateAhead: "Deadline ahead; start of the window not confirmed", stateOpens: "Opens",
    notFound: "Date not found in published sources", caption: "Transfer and registration deadlines, season 2026/27", guide: "country guide", iihfGuide: "IIHF transfer guide" },
  ru: { country: "Страна", league: "Лига", category: "Возраст", type: "Тип срока", date: "Дата", season: "Сезон", status: "Статус", source: "Официальный источник", checked: "Проверено",
    any: "Все", filters: "Фильтры календаря", count: "Показано записей:", month: "Месяц дедлайна", openNow: "Открыто сейчас", january: "Январь", february: "Февраль", reset: "Сбросить фильтры",
    empty: "Под эти фильтры записей нет. Отсутствие строки не означает, что окно открыто или закрыто — сбросьте фильтры или проверьте гайд по стране.",
    stateOpen: "Открыто сейчас", stateClosed: "Окно закрыто", stateAhead: "Срок впереди; начало окна не подтверждено", stateOpens: "Открывается",
    notFound: "Дата не найдена в опубликованных источниках", caption: "Сроки переходов и дозаявки, сезон 2026/27", guide: "гайд по стране", iihfGuide: "гайд по трансферу IIHF" }
};

// Today's date (YYYY-MM-DD) in the site's time zone, for the server-rendered state.
function todayIso(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

// Months (1–12) in which a row has a deadline: the closing month of each window.
function deadlineMonths(row) {
  const months = new Set();
  for (const w of row.windows || []) {
    if (w.closes) months.add(Number(w.closes.slice(5, 7)));
    else if (w.closesMonthDay) months.add(Number(w.closesMonthDay.slice(0, 2)));
  }
  return [...months];
}

// State of a row on a given date. "open" only when the row is confirmed and a
// window with a confirmed start and end contains the date. A future deadline
// without a confirmed start is "ahead", never "open".
function windowState(row, today) {
  if (row.status !== "confirmed" || !row.windows) return null;
  const full = row.windows.filter((w) => w.closes);
  if (!full.length) return null;
  if (full.some((w) => w.opens && w.opens <= today && today <= w.closes)) return { state: "open" };
  const next = full.filter((w) => w.opens && w.opens > today).sort((a, b) => a.opens.localeCompare(b.opens))[0];
  if (next) return { state: "opens", date: next.opens };
  if (full.some((w) => !w.opens && today <= w.closes)) return { state: "ahead" };
  if (full.every((w) => w.closes < today)) return { state: "closed" };
  return null;
}

function formatIso(iso, locale) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = locale === "ru"
    ? ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
    : MONTH_NAMES.en;
  return `${d} ${months[m - 1]} ${y}`;
}

let LINKS = null;
// Country guide and league page for a row, from the existing routes.
function links(row, locale) {
  if (!LINKS) {
    const fs = require("node:fs");
    const path = require("node:path");
    const { PAGES } = require("./locales");
    const { normalizeLeague } = require("./attribution");
    const guides = new Set(fs.readdirSync(path.join(__dirname, "..", "public", "en", "guides")).map((f) => f.replace(/\.html$/, "")));
    const ru = new Map(PAGES.map((p) => [p.en, p.ru]));
    LINKS = { guides, ru, normalizeLeague };
  }
  const prefix = locale === "ru" ? "/ru" : "";
  const local = (enPath) => (locale === "ru" ? (LINKS.ru.has(enPath) ? `${prefix}${LINKS.ru.get(enPath)}` : null) : enPath);
  const out = {};
  if (row.league === "IIHF") out.league = local("/guides/iihf-international-transfer");
  const g = `hockey-in-${slug(row.country.en === "USA" ? "usa" : row.country.en)}`;
  if (LINKS.guides.has(g)) out.country = local(`/guides/${g}`);
  const id = LINKS.normalizeLeague(row.league).league;
  if (id && !out.league) out.league = local(`/leagues/${id}`);
  return out;
}

function renderCalendar(locale, now = new Date()) {
  const t = T[locale] || T.en;
  const L = UI[locale] || UI.en;
  const today = todayIso(now);
  const countries = [];
  ROWS.forEach((r) => { if (!countries.some((c) => c.en === r.country.en)) countries.push(r.country); });
  const leagues = [...new Set(ROWS.map((r) => r.league))].sort();
  const usedMonths = new Set(ROWS.flatMap(deadlineMonths));
  const opt = (v, l) => `<option value="${esc(v)}">${esc(l)}</option>`;
  const filters = `<form class="calendar-filters" id="calendar-filters" aria-label="${L.filters}" hidden>` +
    `<label>${L.country}<select data-filter="country"><option value="">${L.any}</option>${countries.map((c) => opt(slug(c.en), c[locale] || c.en)).join("")}</select></label>` +
    `<label>${L.league}<select data-filter="league"><option value="">${L.any}</option>${leagues.map((l) => opt(slug(l), l)).join("")}</select></label>` +
    `<label>${L.category}<select data-filter="category"><option value="">${L.any}</option>${["senior", "junior"].map((c) => opt(c, t[c])).join("")}</select></label>` +
    `<label>${L.month}<select data-filter="month"><option value="">${L.any}</option>${SEASON_MONTHS.filter((m) => usedMonths.has(m)).map((m) => opt(String(m), MONTH_NAMES[locale === "ru" ? "ru" : "en"][m - 1])).join("")}</select></label>` +
    `<label class="calendar-check"><input type="checkbox" data-filter="open" value="1"> ${L.openNow}</label>` +
    `<div class="calendar-quick"><button type="button" class="calendar-chip" data-month="1">${L.january}</button><button type="button" class="calendar-chip" data-month="2">${L.february}</button><button type="button" class="calendar-chip" data-open="1">${L.openNow}</button><button type="reset" class="calendar-reset">${L.reset}</button></div>` +
    `<p class="muted calendar-count" aria-live="polite">${L.count} <span id="calendar-count">${ROWS.length}</span></p></form>`;
  const rows = ROWS.map((r) => {
    const lk = links(r, locale);
    const countryName = esc(r.country[locale] || r.country.en);
    const country = lk.country ? `<a href="${lk.country}">${countryName}</a>` : countryName;
    const league = lk.league ? `<a href="${lk.league}">${esc(r.league)}</a>` : esc(r.league);
    const src = r.source && S[r.source] ? `<a href="${esc(S[r.source].url)}" rel="noopener" target="_blank">${esc(S[r.source].label)} ↗</a>` : "—";
    const note = r.note ? `<br><small>${esc(r.note[locale] || r.note.en)}</small>` : "";
    const [y, m, d] = r.checkedAt.split("-");
    const ws = windowState(r, today);
    const stateText = !ws ? "" : ws.state === "open" ? L.stateOpen : ws.state === "closed" ? L.stateClosed : ws.state === "ahead" ? L.stateAhead : `${L.stateOpens} ${formatIso(ws.date, locale)}`;
    const stateHtml = `<br><small class="cal-now" data-now>${ws ? `<span class="cal-state cal-state-${ws.state}">${esc(stateText)}</span>` : ""}</small>`;
    const statusLabel = r.status === "not_published" ? L.notFound : t[r.status];
    const dateText = r.status === "not_published" ? L.notFound : (r.date[locale] || r.date.en);
    const winAttr = (r.windows || []).filter((w) => w.closes).map((w) => `${w.opens || ""}~${w.closes}`).join(" ");
    return `<tr data-country="${slug(r.country.en)}" data-league="${slug(r.league)}" data-category="${r.category}" data-status="${r.status}" data-months="${deadlineMonths(r).join(" ")}" data-windows="${winAttr}">` +
      `<td data-label="${L.country}">${country}</td><td data-label="${L.league}">${league}</td>` +
      `<td data-label="${L.category}">${t[r.category]}</td><td data-label="${L.type}">${t[r.type]}</td><td data-label="${L.season}">${esc(r.season || SEASON)}</td><td data-label="${L.date}"><strong>${esc(dateText)}</strong>${note}</td>` +
      `<td data-label="${L.status}"><span class="cal-status cal-${r.status}">${esc(statusLabel)}</span>${stateHtml}</td><td data-label="${L.source}">${src}</td><td data-label="${L.checked}"><small>${d}.${m}.${y}</small></td></tr>`;
  }).join("");
  const i18n = esc(JSON.stringify({ open: L.stateOpen, closed: L.stateClosed, ahead: L.stateAhead, opens: L.stateOpens, locale }));
  return filters + `<div class="league-wrap" role="region" aria-label="${esc(L.caption)}" tabindex="0"><table class="league-table" id="transfer-calendar" data-today="${today}" data-i18n="${i18n}"><caption class="visually-hidden">${esc(L.caption)}</caption><thead><tr><th scope="col">${L.country}</th><th scope="col">${L.league}</th><th scope="col">${L.category}</th><th scope="col">${L.type}</th><th scope="col">${L.season}</th><th scope="col">${L.date}</th><th scope="col">${L.status}</th><th scope="col">${L.source}</th><th scope="col">${L.checked}</th></tr></thead><tbody>${rows}</tbody></table></div>` +
    `<p class="calendar-empty" id="calendar-empty" hidden role="status">${esc(L.empty)} <button type="button" class="calendar-reset" data-reset>${esc(L.reset)}</button></p>`;
}

module.exports = { ROWS, SOURCES: S, SEASON, renderCalendar, windowState, deadlineMonths, todayIso };
