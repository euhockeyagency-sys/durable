// Confirmed EHA cases: ONE source for /cases (EN/RU) and the "Confirmed EHA cases"
// block on each country guide. Edit here, then run `node scripts/build-cases.js`.
//
// id            stable slug; anchor on /cases is #case-<id>
// player        player name as published
// countryCode   ISO 3166-1 alpha-2 of the DESTINATION country (places the case on
//               that country's guide; matching never uses text)
// team, league  destination team and league ("" if the source does not name it)
// season        "2026/27" or null when no source states it
// fromTeam, fromLeague  origin, only if confirmed by a source; otherwise null
// stage         what the source confirms, never upgraded:
//                 tryout     invited to / attended a tryout
//                 offer      written offer received
//                 registered registered with the federation / league
//                 roster     appears on the team roster (Elite Prospects history
//                            or a club announcement); NOT proof of a pro contract
//                 signed     a signed contract confirmed by the club or league
// status        evidence type: elite_prospects_history | club_announcement |
//               pending (pending is shown on /cases with a "Pending" badge and is
//               never shown on country guides)
// source        public confirmation link
// caseUrl       internal case page if one exists; null -> /cases#case-<id>
// ehaConfirmed  EHA's own involvement is confirmed by agency material (a public
//               transfer alone does not prove EHA's role); false -> not shown
// ehaBasis      what confirms EHA's role: eha_cases_page = listed by EHA on its
//               own cases page from agency records
// publish       the player/case may be shown publicly
// note          short description per locale
module.exports = [
  {
    "id": "jack-graham",
    "player": "Jack Graham",
    "countryCode": "NL",
    "team": "Eindhoven Kemphanen",
    "league": "Netherlands2",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/870626/jack-graham",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Defenceman/forward. The move to Eindhoven Kemphanen was announced by the agency and is reflected in the player's history on Elite Prospects.",
      "ru": "Защитник/нападающий. Переход в Eindhoven Kemphanen опубликован агентством и отражён в истории игрока на Elite Prospects."
    }
  },
  {
    "id": "domeniks-vinkalns",
    "player": "Domeniks Vinkalns",
    "countryCode": "US",
    "team": "Dells Ducks",
    "league": "USPHL",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "club_announcement",
    "source": "https://www.facebook.com/dellsducks/posts/we-would-like-to-welcome-goaltender-domeniks_vinkalns39-domeniks-is-a-60-goalten/1667078545425752/",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Goaltender from Latvia. The signing with the Dells Ducks was announced by the club and European Hockey Agency.",
      "ru": "Вратарь из Латвии. Подписание с Dells Ducks опубликовано клубом и European Hockey Agency."
    }
  },
  {
    "id": "sandis-cionelis",
    "player": "Sandis Cionelis",
    "countryCode": "FR",
    "team": "Rendez-Vous Orléans",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/792077/sandis-cionelis",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian player. The move to Rendez-Vous Orléans is reflected in the player's profile on Elite Prospects.",
      "ru": "Латвийский игрок. Переход в Rendez-Vous Orléans отражён в профиле игрока на Elite Prospects."
    }
  },
  {
    "id": "mantas-lisauskas",
    "player": "Mantas Lisauskas",
    "countryCode": "US",
    "team": "Potomac Patriots",
    "league": "NCDC",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/1008869/mantas-lisauskas",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Lithuanian defenceman. The move to the Potomac Patriots is confirmed by the player's profile and team on Elite Prospects.",
      "ru": "Литовский защитник. Potomac Patriots и лига NCDC указаны в текущем профиле игрока на Elite Prospects."
    },
    "reviewNote": "17 Nov 2026: Elite Prospects lists 2026-27 Boston Jr. Rangers (USPHL Premier), not Potomac Patriots; held back until EHA confirms"
  },
  {
    "id": "alexei-baskov",
    "player": "Alexei Baskov",
    "countryCode": "FR",
    "team": "Valence",
    "league": "France2",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/160268/alexei-baskov",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian forward. The move to Valence is confirmed by an up-to-date Elite Prospects profile.",
      "ru": "Российский нападающий. Valence и лига France2 указаны в текущем профиле игрока на Elite Prospects."
    }
  },
  {
    "id": "roberts-skute",
    "player": "Roberts Skute",
    "countryCode": "SE",
    "team": "Osby IK",
    "league": "Division 3",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/756959/roberts-skute",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Osby IK is reflected in the player's profile and stats on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Osby IK отражён в профиле и статистике игрока на Elite Prospects."
    }
  },
  {
    "id": "matiass-daniels-grinbergs",
    "player": "Matiass Daniels Grinbergs",
    "countryCode": "US",
    "team": "Seattle Totems",
    "league": "USPHL Premier",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/791418/matiass-daniels-grinbergs",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. His time with the Seattle Totems is confirmed by an Elite Prospects profile.",
      "ru": "Латвийский нападающий. Выступление за Seattle Totems подтверждено профилем Elite Prospects."
    }
  },
  {
    "id": "oleksandr-kurzenkov",
    "player": "Oleksandr Kurzenkov",
    "countryCode": "US",
    "team": "Seattle Totems",
    "league": "USPHL Premier",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/929827/oleksandr-kurzenkov",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Ukrainian player. The move to the Seattle Totems is confirmed by an Elite Prospects profile.",
      "ru": "Украинский хоккеист. Переход в Seattle Totems подтверждён профилем Elite Prospects."
    }
  },
  {
    "id": "denis-cherevach",
    "player": "Denis Cherevach",
    "countryCode": "TR",
    "team": "Istanbul Büyükşehir SK",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/238710/denis-cherevach",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Belarusian defenceman. His season with Istanbul Büyükşehir SK is reflected in Elite Prospects stats.",
      "ru": "Белорусский защитник. Сезон в Istanbul Büyükşehir SK отражён в статистике Elite Prospects."
    }
  },
  {
    "id": "andrei-gerasimov",
    "player": "Andrei Gerasimov",
    "countryCode": "TR",
    "team": "Zeytinburnu Belediyesi SK",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/105705/andrei-gerasimov",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian defenceman. The move to Zeytinburnu Belediyesi SK is confirmed by an Elite Prospects profile.",
      "ru": "Российский защитник. Переход в Zeytinburnu Belediyesi SK подтверждается профилем Elite Prospects."
    }
  },
  {
    "id": "kristers-kuznecovs",
    "player": "Kristers Kuznecovs",
    "countryCode": "FR",
    "team": "Orléans",
    "league": "France3",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/792076/kristers-kuznecovs",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Orléans is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Orléans подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "ilja-vasiljevs",
    "player": "Ilja Vasiljevs",
    "countryCode": "DE",
    "team": "ESV 03 Chemnitz U20",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/1031229/ilja-vasiljevs",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The agency reports a move to ESV 03 Chemnitz U20; independent public confirmation is pending.",
      "ru": "Латвийский нападающий. Агентство сообщает о переходе в ESV 03 Chemnitz U20; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "id": "ilja-kozlovs",
    "player": "Ilja Kozlovs",
    "countryCode": "US",
    "team": "Red River Spartans",
    "league": "NCDC",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1009135/ilja-kozlovs",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian defenceman. The move to the Red River Spartans is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский защитник. Переход в Red River Spartans подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "nicolas-heger",
    "player": "Nicolas Heger",
    "countryCode": "FI",
    "team": "Sport U16",
    "league": "U16 SM-sarja",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1084709/nicolas-heger",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Slovak forward. The move to Sport U16 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Словацкий нападающий. Переход в Sport U16 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "krists-salmins",
    "player": "Krists Salmins",
    "countryCode": "FI",
    "team": "Laser HT U20",
    "league": "U20 Mestis",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/927760/krists-salmins",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Laser HT U20 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Laser HT U20 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "alex-curti",
    "player": "Alex Curti",
    "countryCode": "CA",
    "team": "Brooks Bandits",
    "league": "BCHL",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/802058/alex-curti",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Italian defenceman. The agency reports a move to the Brooks Bandits; independent public confirmation is pending.",
      "ru": "Итальянский защитник. Агентство сообщает о переходе в Brooks Bandits; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "id": "sergejs-zabavnikovs",
    "player": "Sergejs Zabavnikovs",
    "countryCode": "US",
    "team": "Potomac Patriots",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/955835/sergejs-zabavnikovs",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The agency reports a move to the Potomac Patriots; independent public confirmation is pending.",
      "ru": "Латвийский нападающий. Агентство сообщает о переходе в Potomac Patriots; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "id": "ratmirs-jermolins",
    "player": "Ratmirs Jermolins",
    "countryCode": "US",
    "team": "Potomac Patriots",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/1031225/ratmirs-jermolins",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian defenceman. The agency reports a move to the Potomac Patriots; independent public confirmation is pending.",
      "ru": "Латвийский защитник. Агентство сообщает о переходе в Potomac Patriots; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "id": "arturs-zirnitis",
    "player": "Arturs Zirnitis",
    "countryCode": "US",
    "team": "Boston Dogs",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "pending",
    "source": "https://www.eliteprospects.com/player/1037075/arturs-zirnitis",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The agency reports a move to the Boston Dogs; independent public confirmation is pending.",
      "ru": "Латвийский нападающий. Агентство сообщает о переходе в Boston Dogs; независимое публичное подтверждение пока не найдено."
    }
  },
  {
    "id": "emil-malysjev",
    "player": "Emil Malysjev",
    "countryCode": "DE",
    "team": "ESV Burgau 2000",
    "league": "Germany4",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/398121/emil-malysjev",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Swedish defenceman. The move to ESV Burgau 2000 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Шведский защитник. Переход в ESV Burgau 2000 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "markuss-staugis",
    "player": "Markuss Staugis",
    "countryCode": "SE",
    "team": "AIK Härnösand U18",
    "league": "U18 Div.1",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1031274/markuss-staugis",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian defenceman. The move to AIK Härnösand U18 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский защитник. Переход в AIK Härnösand U18 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "jevgeni-ivanov",
    "player": "Jevgeni Ivanov",
    "countryCode": "US",
    "team": "Potomac Patriots",
    "league": "USPHL Premier",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/982708/jevgeni-ivanov",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Estonian forward. The move to the Potomac Patriots is confirmed by the player's profile on Elite Prospects.",
      "ru": "Эстонский нападающий. Переход в Potomac Patriots подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "alexei-syutkin",
    "player": "Alexei Syutkin",
    "countryCode": "HU",
    "team": "Goodwill Pharma Szeged",
    "league": "Andersen Liga",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/699022/alexei-syutkin",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian defenceman. The move to Goodwill Pharma Szeged is confirmed by the player's profile on Elite Prospects.",
      "ru": "Российский защитник. Переход в Goodwill Pharma Szeged подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "bruno-alic",
    "player": "Bruno Alic",
    "countryCode": "US",
    "team": "Potomac Patriots",
    "league": "USPHL Premier",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1032771/bruno-alic",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Croatian forward. The move to the Potomac Patriots is confirmed by the player's profile on Elite Prospects.",
      "ru": "Хорватский нападающий. Переход в Potomac Patriots подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "andrew-rocha",
    "player": "Andrew Rocha",
    "countryCode": "PL",
    "team": "GAS Olivia Gdańsk",
    "league": "Poland2",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/313070/andrew-rocha",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Canadian goaltender. The move to GAS Olivia Gdańsk is confirmed by the player's profile on Elite Prospects.",
      "ru": "Канадский вратарь. Переход в GAS Olivia Gdańsk подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "juho-nupponen",
    "player": "Juho Nupponen",
    "countryCode": "US",
    "team": "Baton Rouge Zydeco",
    "league": "FPHL",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/683122/juho-nupponen",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish goaltender. The move to the Baton Rouge Zydeco is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский вратарь. Переход в Baton Rouge Zydeco подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "patriks-vasiljevs",
    "player": "Patriks Vasiljevs",
    "countryCode": "FI",
    "team": "Spirit U20",
    "league": "U20 II-divisioona",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/1031215/patriks-vasiljevs",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian goaltender. The move to Spirit U20 is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский вратарь. Переход в Spirit U20 подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "kohl-hedquist",
    "player": "Kohl Hedquist",
    "countryCode": "NL",
    "team": "GIJS Groningen",
    "league": "Netherlands2",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/388051/kohl-hedquist",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "American forward. The move to GIJS Groningen is confirmed by the player's profile on Elite Prospects.",
      "ru": "Американский нападающий. Переход в GIJS Groningen подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "alexander-vasilyev",
    "player": "Alexander Vasilyev",
    "countryCode": "US",
    "team": "Danbury Hat Tricks",
    "league": "FPHL",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/30516/alexander-vasilyev",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Russian forward. The move to the Danbury Hat Tricks is confirmed by the player's profile on Elite Prospects.",
      "ru": "Российский нападающий. Переход в Danbury Hat Tricks подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "love-green",
    "player": "Love Green",
    "countryCode": "HU",
    "team": "Dunaújvárosi Acélbikák",
    "league": "",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/606467/love-green",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Swedish forward. The move to Dunaújvárosi Acélbikák is confirmed by the player's profile on Elite Prospects.",
      "ru": "Шведский нападающий. Переход в Dunaújvárosi Acélbikák подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "alex-cyrenne",
    "player": "Alex Cyrenne",
    "countryCode": "HU",
    "team": "Goodwill Pharma Szeged",
    "league": "Andersen Liga",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/303615/alex-cyrenne",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Canadian defenceman. The move to Goodwill Pharma Szeged is confirmed by the player's profile on Elite Prospects.",
      "ru": "Канадский защитник. Переход в Goodwill Pharma Szeged подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "aleksis-ostankovics",
    "player": "Aleksis Ostankovics",
    "countryCode": "SE",
    "team": "Glimma HK",
    "league": "Division 3",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/557693/aleksis-ostankovics",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Glimma HK is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Glimma HK подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "kristers-bukss",
    "player": "Kristers Bukss",
    "countryCode": "SE",
    "team": "Osby IK",
    "league": "Division 3",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/789826/kristers-bukss",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Latvian forward. The move to Osby IK is confirmed by the player's profile on Elite Prospects.",
      "ru": "Латвийский нападающий. Переход в Osby IK подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "samuli-yliniva",
    "player": "Samuli Yliniva",
    "countryCode": "FR",
    "team": "Châlons-en-Champagne",
    "league": "France3",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/326821/samuli-yliniva",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish forward. The move to Châlons-en-Champagne is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский нападающий. Переход в Châlons-en-Champagne подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "patrik-forsberg",
    "player": "Patrik Forsberg",
    "countryCode": "BE",
    "team": "Golden Sharks Mechelen",
    "league": "CEHL",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/65455/patrik-forsberg",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish defenceman/forward. The move to Golden Sharks Mechelen is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский защитник/нападающий. Переход в Golden Sharks Mechelen подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "yegor-kalin",
    "player": "Yegor Kalin",
    "countryCode": "FR",
    "team": "Mont-Blanc",
    "league": "France2",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/490217/yegor-kalin",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Belarusian defenceman. The move to Mont-Blanc is confirmed by the player's profile on Elite Prospects.",
      "ru": "Белорусский защитник. Переход в Mont-Blanc подтверждается профилем игрока на Elite Prospects."
    }
  },
  {
    "id": "jami-tuokkola",
    "player": "Jami Tuokkola",
    "countryCode": "FR",
    "team": "Annecy",
    "league": "France3",
    "season": null,
    "fromTeam": null,
    "fromLeague": null,
    "stage": "roster",
    "status": "elite_prospects_history",
    "source": "https://www.eliteprospects.com/player/611906/jami-tuokkola",
    "caseUrl": null,
    "ehaConfirmed": true,
    "ehaBasis": "eha_cases_page",
    "publish": true,
    "media": [],
    "note": {
      "en": "Finnish defenceman. The move to Annecy is confirmed by the player's profile on Elite Prospects.",
      "ru": "Финский защитник. Переход в Annecy подтверждается профилем игрока на Elite Prospects."
    }
  }
];
