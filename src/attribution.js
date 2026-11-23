"use strict";

// One vocabulary for "where did this application come from and what does the
// person want": intent, CTA page (source_page), country and league. Links on
// the site use the canonical values; the server also accepts the older
// spellings (aliases) so links cached in browsers, emails and other sites keep
// working. Historical rows in the database are not rewritten here — see
// scripts/attribution-history-dry-run.js.

const fs = require("node:fs");
const path = require("node:path");
const { PAGES } = require("./locales");

// ---------- intent ----------
// Services are kept apart (free first review vs paid full analysis); topic
// intents keep their meaning and only get one spelling. Unknown values are
// normalised to snake_case and kept, so a new CTA is never lost.
const INTENTS = {
  free_assessment: "Free first review of the player profile",
  player_analysis: "Paid full player analysis (/player-assessment)",
  league_assessment: "Which league / team in a league is realistic",
  country_assessment: "Route and options in one country",
  junior_route: "Junior route (U18/U20, school, housing)",
  route_discussion: "Parent: discuss the player's options",
  europe_route: "Route into European hockey",
  terms_question: "Question about EHA fees and terms (ask the agent)",
  offer_review: "Check a club offer or contract terms",
  offer_comparison: "Compare two offers",
  salary_context: "Salary and offer conditions",
  salary_icehl_alps: "ICEHL / AlpsHL salary question",
  calculator_result: "From the level calculator result",
  club_needs_profile: "Player for a club request (/club-needs)",
  transfer_check: "Transfer, ITC, transfer window",
  visa_check: "Visa, work permit, passport status",
  documents_minor: "Documents and IIHF transfer for a minor",
  academy_choice: "Hockey academy (Europe or North America)",
  age_pathway: "Age pathway, CHL/NCAA",
  after_u20: "Junior to senior transition",
  video_review: "Game video and highlight video",
  resume_review: "Hockey CV",
  career_restart: "Restart after a bad season or injury",
  showcase_check: "Paid showcase or camp check",
  child_safety: "Child safety, billet family",
  adaptation: "Homesickness and adaptation",
  school_education: "School and education abroad",
  insurance_check: "Insurance",
  calendar: "Season calendar and timing",
  season_cost: "Season cost estimate",
  league_comparison: "Comparison of two leagues",
  imports_leagues: "Leagues open to imports",
  mhl_route: "After MHL/NMHL to Europe"
};

const INTENT_ALIASES = {
  "free-assessment": "free_assessment",
  assessment: "free_assessment",
  player_assessment: "free_assessment",
  player_profile: "free_assessment",
  find_club: "free_assessment",
  "player-analysis": "player_analysis",
  "league-assessment": "league_assessment",
  league_fit: "league_assessment",
  germany_level: "country_assessment",
  "country-assessment": "country_assessment",
  country_france: "country_assessment",
  country_sweden: "country_assessment",
  country_czechia: "country_assessment",
  country_germany: "country_assessment",
  country_slovakia: "country_assessment",
  austria_consultation: "country_assessment",
  "route-discussion": "route_discussion",
  "offer-review": "offer_review",
  scam_check: "offer_review",
  net_gross: "salary_context",
  itc_check: "transfer_check",
  transfer_checklist: "transfer_check",
  signing_window: "transfer_check",
  timing_plan: "transfer_check",
  passport_status: "visa_check",
  minor_documents: "documents_minor",
  academy_comparison: "academy_choice",
  academy_europe: "academy_choice",
  choose_academy: "academy_choice",
  u20_route: "junior_route",
  europe_vs_north_america: "junior_route",
  us_junior_to_europe: "after_u20",
  after_juniors_route: "after_u20",
  profile_video: "video_review",
  resume_template: "resume_review",
  points_translation: "league_comparison",
  pl_vs_fr: "league_comparison",
  nordic_compare: "league_comparison",
  ettan_vs_mestis: "league_comparison",
  alpshl_vs_oberliga: "league_comparison",
  top_leagues_imports: "imports_leagues"
};

function slugToken(value, max = 60) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, max);
}

// Returns { intent, original } — original is set only when the value changed.
function normalizeIntent(raw) {
  const input = String(raw || "").trim().slice(0, 60);
  if (!input) return { intent: null, original: null };
  const intent = INTENT_ALIASES[input] || INTENT_ALIASES[input.toLowerCase()] || (INTENTS[slugToken(input)] ? slugToken(input) : INTENT_ALIASES[slugToken(input)] || slugToken(input)) || null;
  return { intent, original: intent === input ? null : input };
}

// ---------- country ----------
// ISO 3166-1 alpha-2, as in src/country-rules.js; labels as in leagues.src.js.
const COUNTRIES = {
  AT: { en: "Austria", ru: "Австрия" }, BY: { en: "Belarus", ru: "Беларусь" }, BE: { en: "Belgium", ru: "Бельгия" },
  CA: { en: "Canada", ru: "Канада" }, HR: { en: "Croatia", ru: "Хорватия" }, CZ: { en: "Czechia", ru: "Чехия" },
  DK: { en: "Denmark", ru: "Дания" }, EE: { en: "Estonia", ru: "Эстония" }, FI: { en: "Finland", ru: "Финляндия" },
  FR: { en: "France", ru: "Франция" }, DE: { en: "Germany", ru: "Германия" }, HU: { en: "Hungary", ru: "Венгрия" },
  IT: { en: "Italy", ru: "Италия" }, JP: { en: "Japan", ru: "Япония" }, KZ: { en: "Kazakhstan", ru: "Казахстан" },
  LV: { en: "Latvia", ru: "Латвия" }, LT: { en: "Lithuania", ru: "Литва" }, NL: { en: "Netherlands", ru: "Нидерланды" },
  NO: { en: "Norway", ru: "Норвегия" }, PL: { en: "Poland", ru: "Польша" }, RO: { en: "Romania", ru: "Румыния" },
  RS: { en: "Serbia", ru: "Сербия" }, SK: { en: "Slovakia", ru: "Словакия" }, SI: { en: "Slovenia", ru: "Словения" },
  ES: { en: "Spain", ru: "Испания" }, SE: { en: "Sweden", ru: "Швеция" }, CH: { en: "Switzerland", ru: "Швейцария" },
  GB: { en: "United Kingdom", ru: "Великобритания" }, US: { en: "United States", ru: "США" }
};
const COUNTRY_ALIASES = { USA: "US", UK: "GB", "Czech Republic": "CZ" };

const countryIndex = new Map();
for (const [code, labels] of Object.entries(COUNTRIES)) {
  for (const key of [code, labels.en, labels.ru]) countryIndex.set(key.toLowerCase(), code);
}
for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) countryIndex.set(alias.toLowerCase(), code);

function normalizeCountry(raw) {
  const input = String(raw || "").trim().slice(0, 100);
  if (!input) return { country: null, input: null };
  const code = countryIndex.get(input.toLowerCase()) || null;
  return { country: code, input: code ? null : input };
}

// ---------- league ----------
// Identifier = the slug of the league page (/leagues/<id>), the stable URL the
// site already uses. Labels: the league name; junior pages get a descriptive
// label per language.
const LEAGUES_DIR = path.join(__dirname, "..", "public", "en", "leagues");
const LEAGUE_IDS = fs.readdirSync(LEAGUES_DIR).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5)).sort();

const LEAGUE_LABELS = {
  "alps-hockey-league": "Alps Hockey League", "austria-ice-hockey-league": "ICE Hockey League",
  "czechia-maxa-liga": "Maxa liga", "czechia-tipsport-extraliga": "Tipsport Extraliga",
  "denmark-1-division": "1. division", "denmark-metal-ligaen": "Metal Ligaen", "estonia-unibet-hokiliiga": "Unibet Hokiliiga",
  "finland-mestis": "Mestis", "finland-suomi-sarja": "Suomi-sarja", "france-division-1": "Division 1", "france-ligue-magnus": "Ligue Magnus",
  "germany-del2": "DEL2", "germany-oberliga": "Oberliga", "hungary-andersen-liga": "Andersen Liga", "hungary-erste-liga": "Erste Liga",
  "italy-ihl-serie-a": "IHL Serie A", "italy-italian-hockey-league": "Italian Hockey League", "japan-asia-league": "Asia League",
  "kazakhstan-pro-hokei-ligasy": "Pro Hokei Ligasy", "latvia-1-liga": "1. Līga", "latvia-optibet-hokeja-liga": "Optibet Hokeja Līga",
  "netherlands-cehl": "CEHL", "netherlands-eredivisie": "Eredivisie", "norway-elitehockeyligaen": "EliteHockey Ligaen",
  "norway-hockeyliga1": "Hockeyliga1", "poland-1-liga-mhl": "1 liga", "poland-tauron-hokej-liga": "TAURON Hokej Liga",
  "romania-campionatul-national": "Campionatul Național", "slovakia-tipos-shl": "TIPOS SHL", "slovakia-tipsport-liga": "Tipsport liga",
  "spain-liga-nacional": "Liga Nacional", "sweden-hockeyallsvenskan": "HockeyAllsvenskan", "sweden-hockeyettan": "Hockeyettan",
  "sweden-j18": "U18 Nationell (J18)", "sweden-j20": "U20 Nationell (J20)", "switzerland-national-league": "National League",
  "switzerland-sky-swiss-league": "Sky Swiss League", "uk-eihl": "EIHL", "uk-planet-ice-national-league": "NIHL National",
  "usa-echl": "ECHL", "usa-nahl": "NAHL", "usa-ncaa-division-i": "NCAA Division I", "usa-ncdc": "NCDC", "usa-ushl": "USHL",
  "usa-usphl-premier": "USPHL Premier"
};
const JUNIOR_LABELS = {
  "austria-junior-hockey": { en: "Austria junior hockey", ru: "Юниорский хоккей Австрии" },
  "canada-junior-hockey": { en: "Canada junior hockey (CHL)", ru: "Юниорский хоккей Канады (CHL)" },
  "czechia-junior-hockey": { en: "Czechia junior hockey", ru: "Юниорский хоккей Чехии" },
  "finland-junior-hockey": { en: "Finland junior hockey", ru: "Юниорский хоккей Финляндии" },
  "germany-junior-hockey": { en: "Germany junior hockey", ru: "Юниорский хоккей Германии" },
  "slovakia-junior-hockey": { en: "Slovakia junior hockey", ru: "Юниорский хоккей Словакии" },
  "switzerland-junior-hockey": { en: "Switzerland junior hockey", ru: "Юниорский хоккей Швейцарии" }
};

function leagueLabel(id, locale = "en") {
  if (JUNIOR_LABELS[id]) return JUNIOR_LABELS[id][locale === "ru" ? "ru" : "en"];
  return LEAGUE_LABELS[id] || id;
}

// Values the site's links used before the identifiers existed.
const LEAGUE_ALIASES = {
  icehl: "austria-ice-hockey-league", elitehockeyligaen: "norway-elitehockeyligaen", "austria junior": "austria-junior-hockey", "canada junior": "canada-junior-hockey",
  "czechia junior": "czechia-junior-hockey", "finland junior": "finland-junior-hockey", "germany junior": "germany-junior-hockey",
  "slovakia junior": "slovakia-junior-hockey", "switzerland junior": "switzerland-junior-hockey",
  "sweden u18": "sweden-j18", "sweden u20": "sweden-j20", "usphl-premier": "usa-usphl-premier", "usa-junior": null,
  "netherlands-eredivisie": "netherlands-eredivisie", "planet-ice-national-league": "uk-planet-ice-national-league",
  "sky-swiss-league": "switzerland-sky-swiss-league", "campionatul national de seniori": "romania-campionatul-national"
};

const leagueIndex = new Map();
for (const id of LEAGUE_IDS) {
  leagueIndex.set(id, id);
  if (LEAGUE_LABELS[id]) leagueIndex.set(LEAGUE_LABELS[id].toLowerCase(), id);
}
for (const [alias, id] of Object.entries(LEAGUE_ALIASES)) if (id) leagueIndex.set(alias, id);

// Values that are not leagues at all (a comparison guide, a service) are not
// stored as a league.
const NOT_A_LEAGUE = /(^|-)vs(-|$)|^offer-review$|^usa-junior$/i;

function normalizeLeague(raw) {
  const input = String(raw || "").trim().slice(0, 100);
  if (!input) return { league: null, input: null };
  if (NOT_A_LEAGUE.test(input)) return { league: null, input: null };
  const id = leagueIndex.get(input.toLowerCase()) || null;
  return { league: id, input: id ? null : input };
}

// Labels for the contact form (injected into /contact as JSON), so a link
// carrying country=SE&league=sweden-j20 is shown as "Швеция · U20 Nationell
// (J20)" on the Russian form and "Sweden · …" on the English one.
function labelsFor(locale = "en") {
  const lang = locale === "ru" ? "ru" : "en";
  const countries = Object.fromEntries(Object.entries(COUNTRIES).map(([code, l]) => [code, l[lang]]));
  const leagues = Object.fromEntries(LEAGUE_IDS.map((id) => [id, leagueLabel(id, lang)]));
  return { countries, leagues };
}

// ---------- source_page ----------
// Public paths of every page in each language (RU under /ru).
function collectRoutes(publicDir = path.join(__dirname, "..", "public")) {
  const routes = { en: new Set(), ru: new Set() };
  for (const locale of ["en", "ru"]) {
    const walk = (dir, prefix) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) { if (entry.name !== "assets") walk(path.join(dir, entry.name), `${prefix}${entry.name}/`); continue; }
        if (!entry.name.endsWith(".html")) continue;
        const slug = entry.name === "index.html" && !prefix ? "/" : `/${prefix}${entry.name.replace(/\.html$/, "")}`;
        routes[locale].add(slug);
      }
    };
    walk(path.join(publicDir, locale), "");
  }
  return routes;
}
let ROUTES = null;
const routes = () => (ROUTES ||= collectRoutes());

// RU logical paths that also exist in EN with the same spelling (/agent,
// /services, /guides, …): only the language context can tell them apart.
const SHARED_SLUGS = new Set(PAGES.filter((p) => p.ru === p.en).map((p) => p.ru));

function cleanPath(raw) {
  let value = String(raw || "").trim();
  if (!value) return "";
  try { value = decodeURIComponent(value); } catch { /* keep as is */ }
  try { if (/^https?:\/\//i.test(value)) value = new URL(value).pathname; } catch { return ""; }
  value = value.split(/[?#]/)[0];
  if (value.length > 1) value = value.replace(/\/+$/, "");
  return value.slice(0, 300);
}

// Returns { sourcePage, input, resolution } where resolution is one of
// exact | locale | slug | unresolved (input keeps the raw value then).
function normalizeSourcePage(raw, locale = "en") {
  const value = cleanPath(raw);
  if (!value) return { sourcePage: null, input: null, resolution: null };
  const r = routes();
  const isRu = locale === "ru";
  if (value === "/ru" || value.startsWith("/ru/")) {
    const logical = value === "/ru" ? "/" : value.slice(3);
    return r.ru.has(logical) ? { sourcePage: value === "/ru" ? "/ru/" : value, input: null, resolution: "exact" } : { sourcePage: null, input: value, resolution: "unresolved" };
  }
  if (value.startsWith("/") && !value.startsWith("//")) {
    const inEn = r.en.has(value) || value.startsWith("/de/") || value.startsWith("/sv/") || value.startsWith("/fi/") || value.startsWith("/cs/");
    const inRu = r.ru.has(value);
    if (isRu && inRu && !inEn) return { sourcePage: value === "/" ? "/ru/" : `/ru${value}`, input: value, resolution: "exact" };
    if (isRu && inRu && inEn) return { sourcePage: value === "/" ? "/ru/" : `/ru${value}`, input: value, resolution: "locale" };
    if (!isRu && inEn) return { sourcePage: value, input: null, resolution: "exact" };
    if (!isRu && inRu && !inEn) return { sourcePage: value === "/" ? "/ru/" : `/ru${value}`, input: value, resolution: "slug" };
    if (isRu && inEn && !inRu) return { sourcePage: value, input: null, resolution: "exact" };
    return { sourcePage: null, input: value, resolution: "unresolved" };
  }
  // A bare token such as "country_czechia" or "hockey-in-czechia".
  const token = value.toLowerCase().replace(/_/g, "-");
  const guess = token.startsWith("country-") ? `/guides/hockey-in-${token.slice(8)}` : `/guides/${token}`;
  if (isRu && r.ru.has(`/guides/${token}`)) return { sourcePage: `/ru/guides/${token}`, input: value, resolution: "slug" };
  if (r.en.has(guess) && !isRu) return { sourcePage: guess, input: value, resolution: "slug" };
  if (r.en.has(guess) && isRu) {
    const ru = PAGES.find((p) => p.en === guess);
    if (ru) return { sourcePage: `/ru${ru.ru}`, input: value, resolution: "slug" };
  }
  return { sourcePage: null, input: value, resolution: "unresolved" };
}

module.exports = {
  INTENTS, INTENT_ALIASES, normalizeIntent,
  COUNTRIES, normalizeCountry,
  LEAGUE_IDS, leagueLabel, normalizeLeague, labelsFor,
  normalizeSourcePage, collectRoutes, SHARED_SLUGS
};
