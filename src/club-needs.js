const defaultNeeds = require("./club-needs-data");

const PATHS = { en: "/club-needs", ru: "/zaprosy-klubov" };
const MARKER = "<!-- CLUB_NEEDS -->";
const WHATSAPP = "https://wa.me/375297957818";
const PUBLIC_FIELDS = ["id", "status", "publish", "countryCode", "league", "season", "position", "age", "birthYears", "importStatus", "conditions"];
const INTERNAL_FIELDS = ["lastChecked", "validUntil", "source", "notes"];
const POSITIONS = {
  G: { en: "Goaltender", ru: "Вратарь" },
  D: { en: "Defence", ru: "Защитник" },
  F: { en: "Forward", ru: "Нападающий" },
  C: { en: "Centre", ru: "Центральный нападающий" },
  W: { en: "Winger", ru: "Крайний нападающий" },
  LW: { en: "Left wing", ru: "Левый крайний" },
  RW: { en: "Right wing", ru: "Правый крайний" },
};
const COUNTRIES = {
  AT: ["Austria", "Австрия"], BE: ["Belgium", "Бельгия"], CH: ["Switzerland", "Швейцария"], CZ: ["Czechia", "Чехия"],
  DE: ["Germany", "Германия"], DK: ["Denmark", "Дания"], EE: ["Estonia", "Эстония"], ES: ["Spain", "Испания"],
  FI: ["Finland", "Финляндия"], FR: ["France", "Франция"], GB: ["United Kingdom", "Великобритания"], HU: ["Hungary", "Венгрия"],
  IT: ["Italy", "Италия"], KZ: ["Kazakhstan", "Казахстан"], LT: ["Lithuania", "Литва"], LV: ["Latvia", "Латвия"],
  NL: ["Netherlands", "Нидерланды"], NO: ["Norway", "Норвегия"], PL: ["Poland", "Польша"], RO: ["Romania", "Румыния"],
  SE: ["Sweden", "Швеция"], SI: ["Slovenia", "Словения"], SK: ["Slovakia", "Словакия"], US: ["USA", "США"], CA: ["Canada", "Канада"],
};
const T = {
  en: {
    country: "Country", league: "League", season: "Season", position: "Position", age: "Age", importStatus: "Citizenship / import status", conditions: "Known conditions",
    open: "Open", apply: "Send my profile for this request", whatsapp: "Ask on WhatsApp ↗", notConfirmed: "not confirmed by the club",
    emptyTitle: "No confirmed club requests right now",
    emptyText: "We publish a request only after a club has confirmed it to EHA, and remove it once it is filled, expires or is not reconfirmed. Old requests from past conversations are not shown as current. Send your profile: when a confirmed request matches it, EHA will compare it with your level, position and documents.",
    emptyCta: "Send profile to EHA", listLabel: "Open club requests",
    note: (n, pos) => `Club request ${n.id}: ${pos}, ${n.league}, ${n.season}`,
    wa: (n, pos) => `Hello EHA, I am interested in club request ${n.id} (${pos}, ${n.league}, ${n.season}).`,
  },
  ru: {
    country: "Страна", league: "Лига", season: "Сезон", position: "Позиция", age: "Возраст", importStatus: "Гражданство / статус легионера", conditions: "Известные условия",
    open: "Открыт", apply: "Отправить профиль под этот запрос", whatsapp: "Спросить в WhatsApp ↗", notConfirmed: "клуб не уточнил",
    emptyTitle: "Сейчас нет подтверждённых запросов клубов",
    emptyText: "Мы публикуем запрос только после того, как клуб подтвердил его EHA, и снимаем его, когда место закрыто, срок истёк или клуб не подтвердил запрос повторно. Старые запросы из переписок не выдаются за действующие. Отправьте профиль: когда появится подтверждённый запрос, который ему соответствует, EHA сравнит его с вашим уровнем, позицией и документами.",
    emptyCta: "Отправить профиль в EHA", listLabel: "Открытые запросы клубов",
    note: (n, pos) => `Запрос клуба ${n.id}: ${pos}, ${n.league}, ${n.season}`,
    wa: (n, pos) => `Здравствуйте, EHA! Меня интересует запрос клуба ${n.id} (${pos}, ${n.league}, ${n.season}).`,
  },
};

const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isoDay = (date) => (date instanceof Date ? date : new Date(date)).toISOString().slice(0, 10);
const localized = (value, locale) => (value && typeof value === "object" ? value[locale] || value.en : value);

function validateNeed(need) {
  const errors = [];
  if (!need || typeof need !== "object") return ["not an object"];
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(need.id || "")) errors.push("id must be a lowercase slug");
  if (!["open", "closed"].includes(need.status)) errors.push("status must be open or closed");
  if (typeof need.publish !== "boolean") errors.push("publish must be true or false");
  if (!COUNTRIES[need.countryCode]) errors.push(`unknown countryCode ${need.countryCode}`);
  if (!need.league || typeof need.league !== "string") errors.push("league is required");
  if (!/^\d{4}\/\d{2}$/.test(need.season || "")) errors.push("season must look like 2026/27");
  if (!POSITIONS[need.position]) errors.push(`unknown position ${need.position}`);
  for (const key of ["age", "importStatus", "conditions"]) {
    const v = need[key];
    if (v !== null && v !== undefined && !(v && typeof v === "object" && v.en && v.ru)) errors.push(`${key} must be null or { en, ru }`);
  }
  if (need.birthYears !== undefined && need.birthYears !== null) {
    const b = need.birthYears;
    const ok = b && typeof b === "object" && [b.from, b.to].every((v) => v === undefined || Number.isInteger(v)) && (b.from || b.to) && !(b.from && b.to && b.from > b.to);
    if (!ok) errors.push("birthYears must be null or { from, to } birth years");
  }
  for (const key of ["lastChecked", "validUntil"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(need[key] || "")) errors.push(`${key} must be YYYY-MM-DD`);
  }
  if (need.lastChecked && need.validUntil && need.validUntil < need.lastChecked) errors.push("validUntil is before lastChecked");
  const unknown = Object.keys(need).filter((k) => !PUBLIC_FIELDS.includes(k) && !INTERNAL_FIELDS.includes(k));
  if (unknown.length) errors.push(`unknown fields ${unknown.join(", ")}`);
  return errors;
}

// A request is current only if it is valid, open, cleared for publication and
// not past its validUntil date. Anything else stays off the page.
function isCurrent(need, today) {
  return validateNeed(need).length === 0 && need.status === "open" && need.publish === true && need.validUntil >= today;
}

function currentNeeds(needs, now) {
  const today = isoDay(now || new Date());
  return (needs || []).filter((n) => isCurrent(n, today));
}

function contactUrl(locale, need, pos, sourcePath) {
  const params = new URLSearchParams({
    intent: "club_need",
    country: COUNTRIES[need.countryCode][locale === "ru" ? 1 : 0],
    league: need.league,
    note: T[locale].note(need, pos),
    source_page: sourcePath,
  });
  return `/contact?${params.toString().replace(/&/g, "&amp;")}`;
}

function renderNeed(need, locale) {
  const t = T[locale];
  const pos = POSITIONS[need.position][locale];
  const country = COUNTRIES[need.countryCode][locale === "ru" ? 1 : 0];
  const row = (label, value) => `<div><dt>${esc(label)}</dt><dd>${value === null || value === undefined ? `<span class="muted">${esc(t.notConfirmed)}</span>` : esc(value)}</dd></div>`;
  const wa = `${WHATSAPP}?text=${encodeURIComponent(t.wa(need, pos))}`;
  return `<li class="club-need" id="${esc(need.id)}"><p class="club-need-status">${esc(t.open)} · <code>${esc(need.id)}</code></p><h3>${esc(pos)} · ${esc(need.league)}</h3><dl>${row(t.country, country)}${row(t.league, need.league)}${row(t.season, need.season)}${row(t.position, pos)}${row(t.age, localized(need.age, locale))}${row(t.importStatus, localized(need.importStatus, locale))}${row(t.conditions, localized(need.conditions, locale))}</dl><p class="club-need-actions"><a class="btn primary" href="${contactUrl(locale, need, pos, PATHS[locale])}">${esc(t.apply)}</a> <a class="text-link" href="${esc(wa)}" rel="noopener" target="_blank">${esc(t.whatsapp)}</a></p></li>`;
}

function renderClubNeeds(locale, now, needs = defaultNeeds) {
  const loc = locale === "ru" ? "ru" : "en";
  const t = T[loc];
  const list = currentNeeds(needs, now);
  if (!list.length) {
    return `<div class="club-needs-empty" data-club-needs="0"><h3>${esc(t.emptyTitle)}</h3><p>${esc(t.emptyText)}</p><p><a class="btn primary" href="/contact?intent=club_needs_profile&amp;source_page=${PATHS[loc]}">${esc(t.emptyCta)}</a></p></div>`;
  }
  return `<ul class="club-needs-list" data-club-needs="${list.length}" aria-label="${esc(t.listLabel)}">${list.map((n) => renderNeed(n, loc)).join("")}</ul>`;
}

// Internal links in the rendered block are logical (/contact); renderBody
// inserts it before prefixInternalLinks, so RU links get the /ru prefix.
function clubNeedsLocaleFor(logicalPath, locale) {
  if (locale === "en" && logicalPath === PATHS.en) return "en";
  if (locale === "ru" && logicalPath === PATHS.ru) return "ru";
  return null;
}

module.exports = { PATHS, MARKER, POSITIONS, COUNTRIES, INTERNAL_FIELDS, validateNeed, isCurrent, currentNeeds, renderClubNeeds, clubNeedsLocaleFor };
