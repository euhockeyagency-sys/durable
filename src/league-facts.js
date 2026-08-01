// Verified per-league club tables. This is the factual, sourced half of the
// league-page de-boilerplating: concrete data that is unique per league, not
// generic advice. Every entry names the season it describes and links the
// sources it was checked against — no unverified numbers (see BRAND.md).
//
// Data is for the LAST COMPLETED season until a federation confirms the new
// one, because upcoming-season rosters are not authoritative until then. The
// `season` field is rendered verbatim so the label is never ambiguous.

const FACTS = {
  "/leagues/finland-mestis": {
    season: "2025/26",
    regularGames: 49,
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    clubs: [
      { name: "Hermes", city: { en: "Kokkola", ru: "Коккола" }, arena: "Kokkolan jäähalli", capacity: 4200 },
      { name: "IPK", city: { en: "Iisalmi", ru: "Ийсалми" }, arena: "Kankaan jäähalli", capacity: 1380 },
      { name: "Jokerit", city: { en: "Helsinki", ru: "Хельсинки" }, arena: "Helsinki Ice Hall", capacity: 8200 },
      { name: "JoKP", city: { en: "Joensuu", ru: "Йоэнсу" }, arena: "Mehtimäki Ice Hall", capacity: 4800 },
      { name: "Ketterä", city: { en: "Imatra", ru: "Иматра" }, arena: "Imatra Spa Areena", capacity: 1300 },
      { name: "KeuPa HT", city: { en: "Keuruu", ru: "Кеуруу" }, arena: "Keuruun jäähalli", capacity: 1100 },
      { name: "Kiekko-Vantaa", city: { en: "Vantaa", ru: "Вантаа" }, arena: "Trio Areena", capacity: 3700 },
      { name: "Pyry Hockey", city: { en: "Nokia", ru: "Нокиа" }, arena: "Kattokeskus Areena", capacity: 1100 },
      { name: "RoKi", city: { en: "Rovaniemi", ru: "Рованиеми" }, arena: "Lappi Areena", capacity: 3500 },
      { name: "TUTO Hockey", city: { en: "Turku", ru: "Турку" }, arena: "Rajupaja Areena", capacity: 3000 }
    ],
    sources: [
      { label: "Elite Prospects — Mestis 2025/26", url: "https://www.eliteprospects.com/league/mestis/2025-2026" },
      { label: { en: "Wikipedia — 2025–26 Mestis season", ru: "Wikipedia — сезон Mestis 2025/26" }, url: "https://en.wikipedia.org/wiki/2025%E2%80%9326_Mestis_season" }
    ]
  }
};

const RU_TO_EN_PATH = new Map([
  ["/ligi/finlyandiya-mestis", "/leagues/finland-mestis"]
]);

const COPY = {
  en: (f) => ({
    label: `${f.season} season`,
    heading: `Clubs: ${f.season} season`,
    intro: `${f.clubs.length} clubs, ${f.regularGames} regular-season games. Home cities and arena capacities for the last completed season — the reference imports use to gauge travel, market size and where a realistic vacancy is likely.`,
    cols: ["Club", "City", "Arena", "Capacity"],
    verified: `Verified ${f.verified.en} against`,
    localeName: (c) => c.en
  }),
  ru: (f) => ({
    label: `сезон ${f.season}`,
    heading: `Клубы: сезон ${f.season}`,
    intro: `${f.clubs.length} клубов, ${f.regularGames} матчей в регулярном чемпионате. Города и вместимость арен за последний сыгранный сезон — ориентир по логистике, размеру рынка и тому, где реальнее ждать вакансию для легионера.`,
    cols: ["Клуб", "Город", "Арена", "Вместимость"],
    verified: `Проверено ${f.verified.ru} по источникам:`,
    localeName: (c) => c.ru
  })
};

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

const localized = (value, locale) => (value && typeof value === "object" ? value[locale] || value.en : value);

function leagueFacts(logicalPath, locale) {
  const key = locale === "ru" ? RU_TO_EN_PATH.get(logicalPath) : logicalPath;
  const facts = FACTS[key];
  if (!facts) return "";
  const t = (COPY[locale] || COPY.en)(facts);

  const rows = facts.clubs
    .map((club) => {
      const capacity = Number.isFinite(club.capacity) ? escape(club.capacity.toLocaleString("en-US")) : "";
      return `<tr><td>${escape(club.name)}</td><td>${escape(localized(club.city, locale))}</td><td>${escape(club.arena)}</td><td class="num">${capacity}</td></tr>`;
    })
    .join("");

  const sources = facts.sources
    .map((source) => `<a href="${escape(source.url)}" target="_blank" rel="nofollow noopener">${escape(localized(source.label, locale))}</a>`)
    .join(", ");

  return (
    `<section class="league-clubs">` +
    `<span class="section-number">${escape(t.label)}</span>` +
    `<h2>${escape(t.heading)}</h2>` +
    `<p>${escape(t.intro)}</p>` +
    `<div class="table-wrap"><table><thead><tr>` +
    t.cols.map((col) => `<th>${escape(col)}</th>`).join("") +
    `</tr></thead><tbody>${rows}</tbody></table></div>` +
    `<p class="source-note">${escape(t.verified)} ${sources}.</p>` +
    `</section>`
  );
}

module.exports = { leagueFacts, FACTS };
