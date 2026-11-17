// Verified roster, registration and immigration rules by country, kept apart
// from cases. Each entry: countryCode (ISO alpha-2), competition, season, kind
// (import_limit | registration | residence_work | transfer), text per locale,
// source URL and the date EHA checked it. Only verified entries belong here;
// rendered by scripts/build-cases.js on the country guides.
module.exports = [
  { countryCode: "SE", competition: "SIF (all competitions)", season: "2026/27", kind: "registration", checkedAt: "2026-11-17",
    text: { en: "General window for a move from a foreign club: 1 June–31 January; competition-specific deadlines can differ.", ru: "Общее окно для перехода из иностранного клуба: 1 июня – 31 января; сроки отдельных турниров могут отличаться." },
    source: "https://www.swehockey.se/spelare/spelare-aktiva/spelaroevergaang/internationell/" },
  { countryCode: "SE", competition: "Work permit for professional athletes", season: "2026", kind: "residence_work", checkedAt: "2026-10-05",
    text: { en: "Salary before tax at least one third of the price base amount in force when applying (2026 price base amount SEK 59,200).", ru: "Зарплата до налогов — не меньше трети базовой суммы цен на дату подачи (базовая сумма 2026 — SEK 59 200)." },
    source: "https://www.migrationsverket.se/en/you-want-to-apply/work/employee-or-self-employed/athletes-and-coaches.html" },
  { countryCode: "DE", competition: "Professional-athlete route (non-EU)", season: "2026", kind: "residence_work", checkedAt: "2026-10-05",
    text: { en: "At least €50,700 gross a year, minimum age 16. An immigration threshold, not an import quota.", ru: "Не менее €50 700 брутто в год, минимальный возраст 16 лет. Миграционный порог, а не квота легионеров." },
    source: "https://www.make-it-in-germany.com/en/visa-residence/types/other/athletes-coaches" },
  { countryCode: "CZ", competition: "Maxa liga", season: "2026/27", kind: "import_limit", checkedAt: "2026-10-05",
    text: { en: "At most three players classified as foreign nationals in a game.", ru: "Не более трёх игроков-иностранцев в матче." },
    source: "https://www.czehockey.cz/competition/format/2" },
  { countryCode: "CZ", competition: "ČSLH (outside Extraliga and 1st league)", season: "2026/27", kind: "registration", checkedAt: "2026-11-17",
    text: { en: "Domestic transfer window 1 May–31 January.", ru: "Внутреннее трансферное окно 1 мая – 31 января." },
    source: "https://www.ceskyhokej.cz/data/document/20260729/111830_3883_Prestupni-rad-mimo-klubu-extraligy-a-I.ligy-cistopis.pdf" },
  { countryCode: "FR", competition: "Synerglace Ligue Magnus", season: "2026/27", kind: "import_limit", checkedAt: "2026-10-02",
    text: { en: "At least 10 locally trained players (JFL) on a 20-player game sheet; JFL status is based on training history, not nationality.", ru: "Минимум 10 местно подготовленных игроков (JFL) в заявке из 20; статус JFL зависит от истории подготовки, а не от гражданства." },
    source: "https://www.hockeyfrance.com/wp-content/uploads/2026/05/06-Reglement-AS-2026.27_VF.pdf" },
  { countryCode: "AT", competition: "Alps Hockey League", season: "2026/27", kind: "import_limit", checkedAt: "2026-11-16",
    text: { en: "Points system: a non-domestic player counts 4 points, maximum 16 points per game sheet.", ru: "Система баллов: легионер стоит 4 балла, максимум 16 баллов на заявку." },
    source: "https://gamebook.alps.hockey/documents/gamebooks/alps/ALPS_2627_Game_Book_260901.pdf" },
];
