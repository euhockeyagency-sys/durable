// Verified per-league club tables. This is the factual, sourced half of the
// league-page de-boilerplating: concrete data that is unique per league, not
// generic advice. Every entry names the season it describes and links the
// sources it was checked against — no unverified numbers (see BRAND.md).
//
// Data is for the LAST COMPLETED season until a federation confirms the new
// one, because upcoming-season rosters are not authoritative until then. The
// `season` field is rendered verbatim so the label is never ambiguous. Arena
// and capacity are optional per club: a column is shown only when at least one
// club in the league carries that field, so a club-and-city-only league (where
// arena data could not be verified) still renders cleanly rather than guessing.

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
  },

  "/leagues/sweden-hockeyallsvenskan": {
    season: "2025/26",
    regularGames: 52,
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    clubs: [
      { name: "AIK", city: { en: "Stockholm", ru: "Стокгольм" }, arena: "Hovet", capacity: 8094 },
      { name: "Almtuna IS", city: { en: "Uppsala", ru: "Уппсала" }, arena: "Upplands Bilforum Arena", capacity: 2800 },
      { name: "IF Björklöven", city: { en: "Umeå", ru: "Умео" }, arena: "Winpos Arena", capacity: 5400 },
      { name: "Kalmar HC", city: { en: "Kalmar", ru: "Кальмар" }, arena: "Hatstore Arena", capacity: 2500 },
      { name: "BIK Karlskoga", city: { en: "Karlskoga", ru: "Карлскуга" }, arena: "Nobelhallen", capacity: 6300 },
      { name: "Modo Hockey", city: { en: "Örnsköldsvik", ru: "Эрншёльдсвик" }, arena: "Hägglunds Arena", capacity: 7265 },
      { name: "Mora IK", city: { en: "Mora", ru: "Мура" }, arena: "Smidjegrav Arena", capacity: 4500 },
      { name: "Nybro Vikings", city: { en: "Nybro", ru: "Нюбру" }, arena: "Liljas Arena", capacity: 2380 },
      { name: "IK Oskarshamn", city: { en: "Oskarshamn", ru: "Оскарсхамн" }, arena: "Be-Ge Hockey Center", capacity: 3275 },
      { name: "Södertälje SK", city: { en: "Södertälje", ru: "Сёдертелье" }, arena: "Scaniarinken", capacity: 6200 },
      { name: "IF Troja-Ljungby", city: { en: "Ljungby", ru: "Юнгбю" }, arena: "Ljungby Arena", capacity: 3620 },
      { name: "Västerås IK", city: { en: "Västerås", ru: "Вестерос" }, arena: "ABB Arena Nord", capacity: 4902 },
      { name: "Vimmerby HC", city: { en: "Vimmerby", ru: "Виммербю" }, arena: "VBO Arena", capacity: 1750 },
      { name: "Östersunds IK", city: { en: "Östersund", ru: "Эстерсунд" }, arena: "Östersund Arena", capacity: 2700 }
    ],
    sources: [
      { label: { en: "Wikipedia — 2025–26 HockeyAllsvenskan season", ru: "Wikipedia — сезон HockeyAllsvenskan 2025/26" }, url: "https://en.wikipedia.org/wiki/2025%E2%80%9326_HockeyAllsvenskan_season" }
    ]
  },

  "/leagues/switzerland-national-league": {
    season: "2025/26",
    regularGames: 52,
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    clubs: [
      { name: "HC Ajoie", city: { en: "Porrentruy", ru: "Порантрюи" }, arena: "Raiffeisen Arena", capacity: 5078 },
      { name: "HC Ambrì-Piotta", city: { en: "Ambrì", ru: "Амбри" }, arena: "Gottardo Arena", capacity: 6775 },
      { name: "SC Bern", city: { en: "Bern", ru: "Берн" }, arena: "PostFinance Arena", capacity: 17031 },
      { name: "EHC Biel", city: { en: "Biel/Bienne", ru: "Биль" }, arena: "Tissot Arena", capacity: 6562 },
      { name: "HC Davos", city: { en: "Davos", ru: "Давос" }, arena: "Eisstadion Davos", capacity: 6547 },
      { name: "Fribourg-Gottéron", city: { en: "Fribourg", ru: "Фрибур" }, arena: "BCF Arena", capacity: 9075 },
      { name: "Genève-Servette HC", city: { en: "Geneva", ru: "Женева" }, arena: "Patinoire des Vernets", capacity: 7135 },
      { name: "EHC Kloten", city: { en: "Kloten", ru: "Клотен" }, arena: "SWISS Arena", capacity: 7624 },
      { name: "Lausanne HC", city: { en: "Lausanne", ru: "Лозанна" }, arena: "Vaudoise Aréna", capacity: 9600 },
      { name: "HC Lugano", city: { en: "Lugano", ru: "Лугано" }, arena: "Cornèr Arena", capacity: 7800 },
      { name: "SCL Tigers", city: { en: "Langnau", ru: "Лангнау" }, arena: "Ilfis Stadium", capacity: 6000 },
      { name: "SC Rapperswil-Jona Lakers", city: { en: "Rapperswil", ru: "Рапперсвиль" }, arena: "St. Galler Kantonalbank Arena", capacity: 6100 },
      { name: "ZSC Lions", city: { en: "Zürich", ru: "Цюрих" }, arena: "Swiss Life Arena", capacity: 12000 },
      { name: "EV Zug", city: { en: "Zug", ru: "Цуг" }, arena: "Bossard Arena", capacity: 7200 }
    ],
    sources: [
      { label: { en: "Wikipedia — 2025–26 National League season", ru: "Wikipedia — сезон National League 2025/26" }, url: "https://en.wikipedia.org/wiki/2025%E2%80%9326_National_League_(ice_hockey)_season" }
    ]
  },

  "/leagues/slovakia-tipsport-liga": {
    season: "2025/26",
    regularGames: 54,
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    // Club + city only: the season source did not carry verified arena
    // capacities and had an arena-name error, so no arena column is published.
    clubs: [
      { name: "HK Nitra", city: { en: "Nitra", ru: "Нитра" } },
      { name: "HC Slovan Bratislava", city: { en: "Bratislava", ru: "Братислава" } },
      { name: "HC Košice", city: { en: "Košice", ru: "Кошице" } },
      { name: "Vlci Žilina", city: { en: "Žilina", ru: "Жилина" } },
      { name: "HC '05 Banská Bystrica", city: { en: "Banská Bystrica", ru: "Банска-Бистрица" } },
      { name: "HK Poprad", city: { en: "Poprad", ru: "Попрад" } },
      { name: "HK Spišská Nová Ves", city: { en: "Spišská Nová Ves", ru: "Спишска-Нова-Вес" } },
      { name: "MHk 32 Liptovský Mikuláš", city: { en: "Liptovský Mikuláš", ru: "Липтовски-Микулаш" } },
      { name: "HK Dukla Michalovce", city: { en: "Michalovce", ru: "Михаловце" } },
      { name: "HKM Zvolen", city: { en: "Zvolen", ru: "Зволен" } },
      { name: "HK Dukla Trenčín", city: { en: "Trenčín", ru: "Тренчин" } },
      { name: "HC 21 Prešov", city: { en: "Prešov", ru: "Прешов" } }
    ],
    sources: [
      { label: { en: "Wikipedia — 2025–26 Slovak Extraliga season", ru: "Wikipedia — сезон Slovak Extraliga 2025/26" }, url: "https://en.wikipedia.org/wiki/2025%E2%80%9326_Slovak_Extraliga_season" }
    ]
  },

  "/leagues/austria-ice-hockey-league": {
    season: "2025/26",
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    // Multinational league (Austria, Italy, Slovenia, Hungary): the country
    // column is shown because clubs carry one.
    clubs: [
      { name: "EC iDM Wärmepumpen VSV", city: { en: "Villach", ru: "Филлах" }, country: { en: "Austria", ru: "Австрия" }, arena: "Villacher Stadthalle", capacity: 4800 },
      { name: "EC KAC", city: { en: "Klagenfurt", ru: "Клагенфурт" }, country: { en: "Austria", ru: "Австрия" }, arena: "Stadthalle Klagenfurt", capacity: 5500 },
      { name: "EC Red Bull Salzburg", city: { en: "Salzburg", ru: "Зальцбург" }, country: { en: "Austria", ru: "Австрия" }, arena: "Eisarena Salzburg", capacity: 3600 },
      { name: "Fehérvár AV19", city: { en: "Székesfehérvár", ru: "Секешфехервар" }, country: { en: "Hungary", ru: "Венгрия" }, arena: "Alba Aréna", capacity: 6000 },
      { name: "Ferencvárosi TC", city: { en: "Budapest", ru: "Будапешт" }, country: { en: "Hungary", ru: "Венгрия" }, arena: "Tüskecsarnok", capacity: 2540 },
      { name: "Graz99ers", city: { en: "Graz", ru: "Грац" }, country: { en: "Austria", ru: "Австрия" }, arena: "Eisstadion Liebenau", capacity: 4050 },
      { name: "HC Bozen–Bolzano", city: { en: "Bolzano", ru: "Больцано" }, country: { en: "Italy", ru: "Италия" }, arena: "Sparkasse Arena", capacity: 7220 },
      { name: "HC Pustertal Wölfe", city: { en: "Bruneck", ru: "Брунико" }, country: { en: "Italy", ru: "Италия" }, arena: "Intercable Arena", capacity: 3100 },
      { name: "HC TWK Innsbruck", city: { en: "Innsbruck", ru: "Инсбрук" }, country: { en: "Austria", ru: "Австрия" }, arena: "TIWAG Arena", capacity: 3200 },
      { name: "HK Olimpija Ljubljana", city: { en: "Ljubljana", ru: "Любляна" }, country: { en: "Slovenia", ru: "Словения" }, arena: "Tivoli Hall", capacity: 6800 },
      { name: "Steinbach Black Wings Linz", city: { en: "Linz", ru: "Линц" }, country: { en: "Austria", ru: "Австрия" }, arena: "Linz AG Eisarena", capacity: 3800 },
      { name: "Vienna Capitals", city: { en: "Vienna", ru: "Вена" }, country: { en: "Austria", ru: "Австрия" }, arena: "Erste Bank Arena", capacity: 7022 },
      { name: "Pioneers Vorarlberg", city: { en: "Feldkirch", ru: "Фельдкирх" }, country: { en: "Austria", ru: "Австрия" }, arena: "Vorarlberghalle", capacity: 5200 }
    ],
    sources: [
      { label: { en: "Wikipedia — ICE Hockey League", ru: "Wikipedia — ICE Hockey League" }, url: "https://en.wikipedia.org/wiki/ICE_Hockey_League" }
    ]
  },

  "/leagues/france-ligue-magnus": {
    season: "2025/26",
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    // Club, city and arena verified; the source did not carry capacities, so no
    // capacity column is published.
    clubs: [
      { name: "Gothiques d'Amiens", city: { en: "Amiens", ru: "Амьен" }, arena: "Coliséum" },
      { name: "Ducs d'Angers", city: { en: "Angers", ru: "Анже" }, arena: "IceParc" },
      { name: "Anglet Hormadi Élite", city: { en: "Anglet", ru: "Англе" }, arena: "Patinoire de la Barre" },
      { name: "Boxers de Bordeaux", city: { en: "Bordeaux", ru: "Бордо" }, arena: "Patinoire de Mériadeck" },
      { name: "Diables Rouges de Briançon", city: { en: "Briançon", ru: "Бриансон" }, arena: "Patinoire René Froger" },
      { name: "Jokers de Cergy-Pontoise", city: { en: "Cergy-Pontoise", ru: "Сержи-Понтуаз" }, arena: "Aren'Ice" },
      { name: "Pionniers de Chamonix", city: { en: "Chamonix", ru: "Шамони" }, arena: "Centre Sportif Richard Bozon" },
      { name: "Rapaces de Gap", city: { en: "Gap", ru: "Гап" }, arena: "Alp'Arena" },
      { name: "Brûleurs de Loups", city: { en: "Grenoble", ru: "Гренобль" }, arena: "Patinoire Pôle Sud" },
      { name: "Spartiates de Marseille", city: { en: "Marseille", ru: "Марсель" }, arena: "Palais omnisports Marseille Grand-Est" },
      { name: "Aigles de Nice", city: { en: "Nice", ru: "Ницца" }, arena: "Patinoire Jean Bouin" },
      { name: "Dragons de Rouen", city: { en: "Rouen", ru: "Руан" }, arena: "Patinoire de l'Île Lacroix" }
    ],
    sources: [
      { label: { en: "Wikipedia — Ligue Magnus", ru: "Wikipedia — Ligue Magnus" }, url: "https://en.wikipedia.org/wiki/Ligue_Magnus" }
    ]
  },

  "/leagues/czechia-tipsport-extraliga": {
    season: "2025/26",
    regularGames: 52,
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    // Club + city: the season source did not carry verified arenas.
    clubs: [
      { name: "HC Dynamo Pardubice", city: { en: "Pardubice", ru: "Пардубице" } },
      { name: "HC Škoda Plzeň", city: { en: "Plzeň", ru: "Пльзень" } },
      { name: "HC Bílí Tygři Liberec", city: { en: "Liberec", ru: "Либерец" } },
      { name: "Mountfield HK", city: { en: "Hradec Králové", ru: "Градец-Кралове" } },
      { name: "HC Oceláři Třinec", city: { en: "Třinec", ru: "Тршинец" } },
      { name: "HC Energie Karlovy Vary", city: { en: "Karlovy Vary", ru: "Карловы Вары" } },
      { name: "HC Sparta Praha", city: { en: "Prague", ru: "Прага" } },
      { name: "HC Kometa Brno", city: { en: "Brno", ru: "Брно" } },
      { name: "Motor České Budějovice", city: { en: "České Budějovice", ru: "Ческе-Будеёвице" } },
      { name: "Rytíři Kladno", city: { en: "Kladno", ru: "Кладно" } },
      { name: "HC Vítkovice Ridera", city: { en: "Ostrava", ru: "Острава" } },
      { name: "HC Olomouc", city: { en: "Olomouc", ru: "Оломоуц" } },
      { name: "BK Mladá Boleslav", city: { en: "Mladá Boleslav", ru: "Млада-Болеслав" } },
      { name: "HC Litvínov", city: { en: "Litvínov", ru: "Литвинов" } }
    ],
    sources: [
      { label: { en: "Wikipedia — 2025–26 Czech Extraliga season", ru: "Wikipedia — сезон Czech Extraliga 2025/26" }, url: "https://en.wikipedia.org/wiki/2025%E2%80%9326_Czech_Extraliga_season" }
    ]
  },

  "/leagues/germany-del2": {
    season: "2025/26",
    verified: { en: "1 August 2026", ru: "1 августа 2026" },
    clubs: [
      { name: "Blue Devils Weiden", city: { en: "Weiden", ru: "Вайден" }, arena: "Hans-Schröpf-Arena", capacity: 2560 },
      { name: "Düsseldorfer EG", city: { en: "Düsseldorf", ru: "Дюссельдорф" }, arena: "PSD Bank Dome", capacity: 14282 },
      { name: "EC Bad Nauheim", city: { en: "Bad Nauheim", ru: "Бад-Наухайм" }, arena: "Colonel Knight Stadion", capacity: 4500 },
      { name: "EC Kassel Huskies", city: { en: "Kassel", ru: "Кассель" }, arena: "Eissporthalle Kassel", capacity: 6100 },
      { name: "EHC Freiburg", city: { en: "Freiburg im Breisgau", ru: "Фрайбург" }, arena: "Echte Helden Arena", capacity: 3500 },
      { name: "Eisbären Regensburg", city: { en: "Regensburg", ru: "Регенсбург" }, arena: "Donau-Arena", capacity: 4961 },
      { name: "Eispiraten Crimmitschau", city: { en: "Crimmitschau", ru: "Кримичау" }, arena: "Eisstadion im Sahnpark", capacity: 5222 },
      { name: "ESV Kaufbeuren", city: { en: "Kaufbeuren", ru: "Кауфбойрен" }, arena: "Erdgas Schwaben Arena", capacity: 3100 },
      { name: "EV Landshut", city: { en: "Landshut", ru: "Ландсхут" }, arena: "VR-Bank Landshut Arena", capacity: 4448 },
      { name: "Krefeld Pinguine", city: { en: "Krefeld", ru: "Крефельд" }, arena: "Yayla-Arena", capacity: 8029 },
      { name: "Lausitzer Füchse", city: { en: "Weißwasser", ru: "Вайсвассер" }, arena: "Eisstadion Weißwasser", capacity: 3050 },
      { name: "Ravensburg Towerstars", city: { en: "Ravensburg", ru: "Равенсбург" }, arena: "Eissporthalle Ravensburg", capacity: 3300 },
      { name: "SC Bietigheim Steelers", city: { en: "Bietigheim-Bissingen", ru: "Битигхайм-Биссинген" }, arena: "EgeTrans Arena", capacity: 4500 },
      { name: "Starbulls Rosenheim", city: { en: "Rosenheim", ru: "Розенхайм" }, arena: "ROFA-Stadion", capacity: 4425 }
    ],
    sources: [
      { label: { en: "Wikipedia — DEL2", ru: "Wikipedia — DEL2" }, url: "https://en.wikipedia.org/wiki/DEL2" }
    ]
  }
};

const RU_TO_EN_PATH = new Map([
  ["/ligi/finlyandiya-mestis", "/leagues/finland-mestis"],
  ["/ligi/shvetsiya-hockeyallsvenskan", "/leagues/sweden-hockeyallsvenskan"],
  ["/ligi/shvejcariya-national-league", "/leagues/switzerland-national-league"],
  ["/ligi/slovakiya-tipsport-liga", "/leagues/slovakia-tipsport-liga"],
  ["/ligi/avstriya-ice-hockey-league", "/leagues/austria-ice-hockey-league"],
  ["/ligi/franciya-ligue-magnus", "/leagues/france-ligue-magnus"],
  ["/ligi/chehiya-tipsport-extraliga", "/leagues/czechia-tipsport-extraliga"],
  ["/ligi/germaniya-del2", "/leagues/germany-del2"]
]);

const COPY = {
  en: {
    label: (f) => `${f.season} season`,
    heading: (f) => `Clubs: ${f.season} season`,
    intro: (f) =>
      `${f.clubs.length} clubs${f.regularGames ? `, ${f.regularGames} regular-season games` : ""}. Where the clubs are based in the last completed season — the reference imports use to gauge travel, market size and where a realistic vacancy is likely.`,
    cols: { club: "Club", city: "City", country: "Country", arena: "Arena", capacity: "Capacity" },
    verified: (f) => `Verified ${f.verified.en} against`,
    city: (c) => c.en
  },
  ru: {
    label: (f) => `сезон ${f.season}`,
    heading: (f) => `Клубы: сезон ${f.season}`,
    intro: (f) =>
      `${f.clubs.length} клубов${f.regularGames ? `, ${f.regularGames} матчей в регулярном чемпионате` : ""}. Где базируются клубы в последнем сыгранном сезоне — ориентир по логистике, размеру рынка и тому, где реальнее ждать вакансию для легионера.`,
    cols: { club: "Клуб", city: "Город", country: "Страна", arena: "Арена", capacity: "Вместимость" },
    verified: (f) => `Проверено ${f.verified.ru} по источникам:`,
    city: (c) => c.ru || c.en
  }
};

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

const localized = (value, locale) => (value && typeof value === "object" ? value[locale] || value.en : value);

function leagueFacts(logicalPath, locale) {
  const key = locale === "ru" ? RU_TO_EN_PATH.get(logicalPath) : logicalPath;
  const facts = FACTS[key];
  if (!facts) return "";
  const t = COPY[locale] || COPY.en;
  const hasCountry = facts.clubs.some((club) => club.country);
  const hasArena = facts.clubs.some((club) => club.arena);
  const hasCapacity = facts.clubs.some((club) => Number.isFinite(club.capacity));

  const columns = ["club", "city", ...(hasCountry ? ["country"] : []), ...(hasArena ? ["arena"] : []), ...(hasCapacity ? ["capacity"] : [])];
  const head = columns.map((col) => `<th>${escape(t.cols[col])}</th>`).join("");
  const rows = facts.clubs
    .map((club) => {
      const cells = [`<td>${escape(club.name)}</td>`, `<td>${escape(t.city(club.city))}</td>`];
      if (hasCountry) cells.push(`<td>${escape(club.country ? localized(club.country, locale) : "—")}</td>`);
      if (hasArena) cells.push(`<td>${escape(club.arena || "—")}</td>`);
      if (hasCapacity) cells.push(`<td class="num">${Number.isFinite(club.capacity) ? escape(club.capacity.toLocaleString("en-US")) : "—"}</td>`);
      return `<tr>${cells.join("")}</tr>`;
    })
    .join("");

  const sources = facts.sources
    .map((source) => `<a href="${escape(source.url)}" target="_blank" rel="nofollow noopener">${escape(localized(source.label, locale))}</a>`)
    .join(", ");

  return (
    `<section class="league-clubs">` +
    `<span class="section-number">${escape(t.label(facts))}</span>` +
    `<h2>${escape(t.heading(facts))}</h2>` +
    `<p>${escape(t.intro(facts))}</p>` +
    `<div class="table-wrap"><table style="min-width:${columns.length * 130}px"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>` +
    `<p class="source-note">${escape(t.verified(facts))} ${sources}.</p>` +
    `</section>`
  );
}

module.exports = { leagueFacts, FACTS };
