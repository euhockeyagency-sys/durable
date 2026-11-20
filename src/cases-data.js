// Confirmed EHA transfers, one record per published case (source: /cases).
// countryCode = ISO 3166-1 alpha-2 of the destination country; used to place a
// case on that country's guide. status: elite_prospects_history | club_announcement
// | pending (pending is never shown). season: null when no source states it.
// quote (optional): { en, ru } short confirmed quote from the player or family,
// published only with consent; shown on the country guide under the case.
// publish: the case is already public on /cases. Edit here, then run
// `node scripts/build-cases.js`.
module.exports = [
  {
    "player": "Jack Graham",
    "countryCode": "NL",
    "league": "Netherlands2",
    "team": "Eindhoven Kemphanen",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/870626/jack-graham",
    "publish": true,
    "media": [],
    "note": {
      "en": "Defenceman/forward. The move to Eindhoven Kemphanen was announced by the agency and is reflected in the player's history on Elite Prospects.",
      "ru": "Защитник/нападающий. Переход в Eindhoven Kemphanen опубликован агентством и отражён в истории игрока на Elite Prospects."
    }
  },
  {
    "player": "Domeniks Vinkalns",
    "countryCode": "US",
    "league": "USPHL",
    "team": "Dells Ducks",
    "season": null,
    "status": "club_announcement",
    "source": "https://www.facebook.com/dellsducks/posts/we-would-like-to-welcome-goaltender-domeniks_vinkalns39-domeniks-is-a-60-goalten/1667078545425752/",
    "publish": true,
    "media": [],
    "note": {
      "en": "Goaltender from Latvia. The signing with the Dells Ducks was announced by the club and European Hockey Agency.",
      "ru": "Вратарь из Латвии. Подписание с Dells Ducks опубликовано клубом и European Hockey Agency."
    }
  },
  {
    "player": "Sandis Cionelis",
    "countryCode": "FR",
    "league": "",
    "team": "Rendez-Vous Orléans",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/792077/sandis-cionelis",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian player. The move to Rendez-Vous Orléans is reflected in the player's profile on Elite Prospects.",
      "ru": "Латвийский игрок. Переход в Rendez-Vous Orléans отражён в профиле игрока на Elite Prospects."
    }
  },
  {
    "player": "Mantas Lisauskas",
    "countryCode": "US",
    "league": "NCDC",
    "team": "Potomac Patriots",
    "season": null,
    "status": "pending",
    "reviewNote": "17 Nov 2026: Elite Prospects lists 2026-27 Boston Jr. Rangers (USPHL Premier), not Potomac Patriots; held back until EHA confirms",
    "source": "https://www.eliteprospects.com/player/1008869/mantas-lisauskas",
    "publish": true,
    "media": [],
    "note": {
      "en": "Lithuanian defenceman. The move to the Potomac Patriots is confirmed by the player's profile and team on Elite Prospects.",
      "ru": "Литовский защитник. Potomac Patriots и лига NCDC указаны в текущем профиле игрока на Elite Prospects."
    }
  },
  {
    "player": "Alexei Baskov",
    "countryCode": "FR",
    "league": "France2",
    "team": "Valence",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/160268/alexei-baskov",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian forward. The move to Valence is confirmed by an up-to-date Elite Prospects profile.",
      "ru": "Российский нападающий. Valence и лига France2 указаны в текущем профиле игрока на Elite Prospects."
    }
  },
  {
    "player": "Roberts Skute",
    "countryCode": "SE",
    "league": "Division 3",
    "team": "Osby IK",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/756959/roberts-skute",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Osby IK is reflected in the player's profile and stats on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Osby IK отражён в профиле и статистике игрока на Elite Prospects."
    }
  },
  {
    "player": "Matiass Daniels Grinbergs",
    "countryCode": "US",
    "league": "USPHL Premier",
    "team": "Seattle Totems",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/791418/matiass-daniels-grinbergs",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. His time with the Seattle Totems is confirmed by an Elite Prospects profile.",
      "ru": "Латвийский нападающий. Выступление за Seattle Totems подтверждено профилем Elite Prospects."
    }
  },
  {
    "player": "Oleksandr Kurzenkov",
    "countryCode": "US",
    "league": "USPHL Premier",
    "team": "Seattle Totems",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/929827/oleksandr-kurzenkov",
    "publish": true,
    "media": [],
    "note": {
      "en": "Ukrainian player. The move to the Seattle Totems is confirmed by an Elite Prospects profile.",
      "ru": "Украинский хоккеист. Переход в Seattle Totems подтверждён профилем Elite Prospects."
    }
  },
  {
    "player": "Denis Cherevach",
    "countryCode": "TR",
    "league": "",
    "team": "Istanbul Büyükşehir SK",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/238710/denis-cherevach",
    "publish": true,
    "media": [],
    "note": {
      "en": "Belarusian defenceman. His season with Istanbul Büyükşehir SK is reflected in Elite Prospects stats.",
      "ru": "Белорусский защитник. Сезон в Istanbul Büyükşehir SK отражён в статистике Elite Prospects."
    }
  },
  {
    "player": "Andrei Gerasimov",
    "countryCode": "TR",
    "league": "",
    "team": "Zeytinburnu Belediyesi SK",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/105705/andrei-gerasimov",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian defenceman. The move to Zeytinburnu Belediyesi SK is confirmed by an Elite Prospects profile.",
      "ru": "Российский защитник. Переход в Zeytinburnu Belediyesi SK подтверждается профилем Elite Prospects."
    }
  },
  {
    "player": "Kristers Kuznecovs",
    "countryCode": "FR",
    "league": "France3",
    "team": "Orléans",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/792076/kristers-kuznecovs",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Orléans is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Orléans подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Ilja Vasiljevs",
    "countryCode": "DE",
    "league": "",
    "team": "ESV 03 Chemnitz U20",
    "season": null,
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/1031229/ilja-vasiljevs",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The agency reports a move to ESV 03 Chemnitz U20; independent public confirmation is pending.",
      "ru": "Латвийский нападающий. Агентство сообщает о переходе в ESV 03 Chemnitz U20; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "player": "Ilja Kozlovs",
    "countryCode": "US",
    "league": "NCDC",
    "team": "Red River Spartans",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1009135/ilja-kozlovs",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian defenceman. The move to the Red River Spartans is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский защитник. Переход в Red River Spartans подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Nicolas Heger",
    "countryCode": "FI",
    "league": "U16 SM-sarja",
    "team": "Sport U16",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1084709/nicolas-heger",
    "publish": true,
    "media": [],
    "note": {
      "en": "Slovak forward. The move to Sport U16 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Словацкий нападающий. Переход в Sport U16 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Krists Salmins",
    "countryCode": "FI",
    "league": "U20 Mestis",
    "team": "Laser HT U20",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/927760/krists-salmins",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Laser HT U20 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Laser HT U20 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Alex Curti",
    "countryCode": "CA",
    "league": "BCHL",
    "team": "Brooks Bandits",
    "season": null,
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/802058/alex-curti",
    "publish": true,
    "media": [],
    "note": {
      "en": "Italian defenceman. The agency reports a move to the Brooks Bandits; independent public confirmation is pending.",
      "ru": "Итальянский защитник. Агентство сообщает о переходе в Brooks Bandits; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "player": "Sergejs Zabavnikovs",
    "countryCode": "US",
    "league": "",
    "team": "Potomac Patriots",
    "season": null,
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/955835/sergejs-zabavnikovs",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The agency reports a move to the Potomac Patriots; independent public confirmation is pending.",
      "ru": "Латвийский нападающий. Агентство сообщает о переходе в Potomac Patriots; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "player": "Ratmirs Jermolins",
    "countryCode": "US",
    "league": "",
    "team": "Potomac Patriots",
    "season": null,
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/1031225/ratmirs-jermolins",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian defenceman. The agency reports a move to the Potomac Patriots; independent public confirmation is pending.",
      "ru": "Латвийский защитник. Агентство сообщает о переходе в Potomac Patriots; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "player": "Arturs Zirnitis",
    "countryCode": "US",
    "league": "",
    "team": "Boston Dogs",
    "season": null,
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/1037075/arturs-zirnitis",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The agency reports a move to the Boston Dogs; independent public confirmation is pending.",
      "ru": "Латвийский нападающий. Агентство сообщает о переходе в Boston Dogs; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "player": "Emil Malysjev",
    "countryCode": "DE",
    "league": "Germany4",
    "team": "ESV Burgau 2000",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/398121/emil-malysjev",
    "publish": true,
    "media": [],
    "note": {
      "en": "Swedish defenceman. The move to ESV Burgau 2000 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Шведский защитник. Переход в ESV Burgau 2000 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Markuss Staugis",
    "countryCode": "SE",
    "league": "U18 Div.1",
    "team": "AIK Härnösand U18",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1031274/markuss-staugis",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian defenceman. The move to AIK Härnösand U18 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский защитник. Переход в AIK Härnösand U18 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Jevgeni Ivanov",
    "countryCode": "US",
    "league": "USPHL Premier",
    "team": "Potomac Patriots",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/982708/jevgeni-ivanov",
    "publish": true,
    "media": [],
    "note": {
      "en": "Estonian forward. The move to the Potomac Patriots is confirmed by the player's profile on Elite Prospects.",
      "ru": "Эстонский нападающий. Переход в Potomac Patriots подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Alexei Syutkin",
    "countryCode": "HU",
    "league": "Andersen Liga",
    "team": "Goodwill Pharma Szeged",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/699022/alexei-syutkin",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian defenceman. The move to Goodwill Pharma Szeged is confirmed by the player's profile on Elite Prospects.",
      "ru": "Российский защитник. Переход в Goodwill Pharma Szeged подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Bruno Alic",
    "countryCode": "US",
    "league": "USPHL Premier",
    "team": "Potomac Patriots",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1032771/bruno-alic",
    "publish": true,
    "media": [],
    "note": {
      "en": "Croatian forward. The move to the Potomac Patriots is confirmed by the player's profile on Elite Prospects.",
      "ru": "Хорватский нападающий. Переход в Potomac Patriots подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Andrew Rocha",
    "countryCode": "PL",
    "league": "Poland2",
    "team": "GAS Olivia Gdańsk",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/313070/andrew-rocha",
    "publish": true,
    "media": [],
    "note": {
      "en": "Canadian goaltender. The move to GAS Olivia Gdańsk is confirmed by the player's profile on Elite Prospects.",
      "ru": "Канадский вратарь. Переход в GAS Olivia Gdańsk подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Juho Nupponen",
    "countryCode": "US",
    "league": "FPHL",
    "team": "Baton Rouge Zydeco",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/683122/juho-nupponen",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish goaltender. The move to the Baton Rouge Zydeco is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский вратарь. Переход в Baton Rouge Zydeco подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Patriks Vasiljevs",
    "countryCode": "FI",
    "league": "U20 II-divisioona",
    "team": "Spirit U20",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1031215/patriks-vasiljevs",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian goaltender. The move to Spirit U20 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский вратарь. Переход в Spirit U20 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Kohl Hedquist",
    "countryCode": "NL",
    "league": "Netherlands2",
    "team": "GIJS Groningen",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/388051/kohl-hedquist",
    "publish": true,
    "media": [],
    "note": {
      "en": "American forward. The move to GIJS Groningen is confirmed by the player's profile on Elite Prospects.",
      "ru": "Американский нападающий. Переход в GIJS Groningen подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Alexander Vasilyev",
    "countryCode": "US",
    "league": "FPHL",
    "team": "Danbury Hat Tricks",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/30516/alexander-vasilyev",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian forward. The move to the Danbury Hat Tricks is confirmed by the player's profile on Elite Prospects.",
      "ru": "Российский нападающий. Переход в Danbury Hat Tricks подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Love Green",
    "countryCode": "HU",
    "league": "",
    "team": "Dunaújvárosi Acélbikák",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/606467/love-green",
    "publish": true,
    "media": [],
    "note": {
      "en": "Swedish forward. The move to Dunaújvárosi Acélbikák is confirmed by the player's profile on Elite Prospects.",
      "ru": "Шведский нападающий. Переход в Dunaújvárosi Acélbikák подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Alex Cyrenne",
    "countryCode": "HU",
    "league": "Andersen Liga",
    "team": "Goodwill Pharma Szeged",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/303615/alex-cyrenne",
    "publish": true,
    "media": [],
    "note": {
      "en": "Canadian defenceman. The move to Goodwill Pharma Szeged is confirmed by the player's profile on Elite Prospects.",
      "ru": "Канадский защитник. Переход в Goodwill Pharma Szeged подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Aleksis Ostankovics",
    "countryCode": "SE",
    "league": "Division 3",
    "team": "Glimma HK",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/557693/aleksis-ostankovics",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Glimma HK is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Glimma HK подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Kristers Bukss",
    "countryCode": "SE",
    "league": "Division 3",
    "team": "Osby IK",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/789826/kristers-bukss",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Osby IK is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Osby IK подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Samuli Yliniva",
    "countryCode": "FR",
    "league": "France3",
    "team": "Châlons-en-Champagne",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/326821/samuli-yliniva",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish forward. The move to Châlons-en-Champagne is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский нападающий. Переход в Châlons-en-Champagne подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Patrik Forsberg",
    "countryCode": "BE",
    "league": "CEHL",
    "team": "Golden Sharks Mechelen",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/65455/patrik-forsberg",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish defenceman/forward. The move to Golden Sharks Mechelen is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский защитник/нападающий. Переход в Golden Sharks Mechelen подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Yegor Kalin",
    "countryCode": "FR",
    "league": "France2",
    "team": "Mont-Blanc",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/490217/yegor-kalin",
    "publish": true,
    "media": [],
    "note": {
      "en": "Belarusian defenceman. The move to Mont-Blanc is confirmed by the player's profile on Elite Prospects.",
      "ru": "Белорусский защитник. Переход в Mont-Blanc подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Jami Tuokkola",
    "countryCode": "FR",
    "league": "France3",
    "team": "Annecy",
    "season": null,
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/611906/jami-tuokkola",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish defenceman. The move to Annecy is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский защитник. Переход в Annecy подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "player": "Semyon Morshchyonok",
    "countryCode": "US",
    "league": "NCAA",
    "team": "Augustana University",
    "season": "2026/27",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/619229/semyon-morshchyonok",
    "publish": true,
    "media": [],
    "note": {
      "en": "Belarusian forward. Route: Team Belarus U18 → Potomac Patriots (USPHL Premier, 2022–2024) → Pueblo Bulls (NCDC, 2024/25, league-leading 75 points) → Austin Bruins (NAHL, 2025/26) → Augustana University (NCAA, from 2026/27). Every step is in his Elite Prospects history; the NCAA move was confirmed there on 29 December 2025. Disclosure: Semyon and his twin Matvei are brothers of EHA agent Viachaslau Marshchonak; EHA handled each step of the route.",
      "ru": "Белорусский нападающий. Маршрут: сборная Беларуси U18 → Potomac Patriots (USPHL Premier, 2022–2024) → Pueblo Bulls (NCDC, 2024/25, лучший бомбардир лиги — 75 очков) → Austin Bruins (NAHL, 2025/26) → Augustana University (NCAA, с сезона 2026/27). Каждый шаг отражён в истории на Elite Prospects; переход в NCAA подтверждён там 29 декабря 2025. Раскрываем: Семён и его брат-близнец Матвей — братья агента EHA Вячеслава Морщенка; каждый шаг маршрута вёл EHA."
    }
  },
  {
    "player": "Matvei Morshchyonok",
    "countryCode": "US",
    "league": "NCAA",
    "team": "Augustana University",
    "season": "2026/27",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/619233/matvei-morshchyonok",
    "publish": true,
    "media": [],
    "note": {
      "en": "Belarusian centre. Route: Team Belarus U18 → Potomac Patriots (USPHL Premier, 2022–2024, 93 points in 2023/24) → Pueblo Bulls (NCDC, 2024/25) → Austin Bruins (NAHL, 2025/26) → Augustana University (NCAA, from 2026/27). Every step is in his Elite Prospects history; the NCAA move was confirmed there on 29 December 2025. Disclosure: Matvei and his twin Semyon are brothers of EHA agent Viachaslau Marshchonak; EHA handled each step of the route.",
      "ru": "Белорусский центральный нападающий. Маршрут: сборная Беларуси U18 → Potomac Patriots (USPHL Premier, 2022–2024, 93 очка в 2023/24) → Pueblo Bulls (NCDC, 2024/25) → Austin Bruins (NAHL, 2025/26) → Augustana University (NCAA, с сезона 2026/27). Каждый шаг отражён в истории на Elite Prospects; переход в NCAA подтверждён там 29 декабря 2025. Раскрываем: Матвей и его брат-близнец Семён — братья агента EHA Вячеслава Морщенка; каждый шаг маршрута вёл EHA."
    }
  }
];
