// League profiles: the structured, sourced half of a league page. One record
// per league with a stable id. The same record renders the league page body
// (src/league-profile.js), the rule summary on the country guide and the
// calculator context, so a rule changed here changes every page that shows it.
//
// Rules for writing a record:
// - every rule names the season, who it applies to, where it applies
//   (game sheet, registration, transfer, eligibility) and its source;
// - status "official" means EHA read the federation or league document itself;
//   "press" means a media report, shown as such; nothing else is published;
// - money: publish an average only with a reliable sample. Third-party ranges
//   are labelled as such, with currency and what the source does not say;
// - `missing` lists what EHA has not confirmed yet. It is shown on the page so
//   a reader knows what to ask the club.
// Text fields are { en, ru }. Paths are logical (no /ru prefix).

const SOURCES = {
  ffhgAs: {
    label: { en: "FFHG: sporting activities regulation 2026/27 (Règlement AS)", ru: "FFHG: регламент спортивной деятельности 2026/27 (Règlement AS)" },
    url: "https://www.hockeyfrance.com/wp-content/uploads/2026/05/06-Reglement-AS-2026.27_VF.pdf"
  },
  ffhgAlm: {
    label: { en: "FFHG: affiliations, licences and transfers regulation 2026/27 (Règlement ALM)", ru: "FFHG: регламент лицензий и переходов 2026/27 (Règlement ALM)" },
    url: "https://www.hockeyfrance.com/wp-content/uploads/2026/05/07-Reglement-ALM-2026.27_VF.pdf"
  },
  ffhgD1Calendar: {
    label: { en: "FFHG: Division 1 calendar 2026/27", ru: "FFHG: календарь Division 1 2026/27" },
    url: "https://www.hockeyfrance.com/competitions/2026/08/05/d1-le-calendrier-de-la-saison-2026-2027/"
  },
  frWork: {
    label: { en: "Service-Public.fr: work authorisation for a foreign employee", ru: "Service-Public.fr: разрешение на работу для иностранного работника" },
    url: "https://www.service-public.fr/particuliers/vosdroits/F2728?lang=en"
  },
  iihf: {
    label: { en: "IIHF: rules and transfer regulations", ru: "IIHF: правила и регламент переходов" },
    url: "https://www.iihf.com/en/statichub/4719/rules-and-regulations"
  },
  thlRules: {
    label: { en: "TAURON Hokej Liga regulation 2026/27 (PDF, PZHL document list)", ru: "Регламент TAURON Hokej Liga 2026/27 (PDF из списка документов PZHL)" },
    url: "https://cdn.sportigio.com/spaces/173/uploads/f860h7rqa4MI3nmLYztiSFQxHyeorimVe970fPR9.pdf"
  },
  pzhlDocs: {
    label: { en: "PZHL: regulations and documents", ru: "PZHL: регламенты и документы" },
    url: "https://pzhl.eu/i/dokumenty/13"
  },
  thlSchedule: {
    label: { en: "PZHL: TAURON Hokej Liga schedule 2026/27", ru: "PZHL: календарь TAURON Hokej Liga 2026/27" },
    url: "https://polskihokej.eu/artykul/znamy-terminarz-tauron-hokej-ligi-w-sezonie-2026-27"
  },
  plWork: {
    label: { en: "Wielkopolska Voivodeship Office (gov.pl): when a foreigner needs a work permit", ru: "Воеводское управление Великопольши (gov.pl): когда иностранцу нужно разрешение на работу" },
    url: "https://migrant.poznan.uw.gov.pl/pl/procedury/zatrudnienie-cudzoziemca-zezwolenie-na-prace"
  },
  euPortal: {
    label: { en: "EU Immigration Portal: Poland", ru: "Иммиграционный портал ЕС: Польша" },
    url: "https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal_en"
  },
  flashscorePl: {
    label: { en: "Flashscore.pl: season-launch report quoting the PZHL president (press)", ru: "Flashscore.pl: репортаж к старту сезона со словами президента PZHL (пресса)" },
    url: "https://www.flashscore.pl/wiadomosci/10-druzyn-i-wysokie-nagrody-w-systemie-juniorskim-startuje-sezon-tauron-hokej-ligi/UFdJtiId/"
  },
  phieSalaries: {
    label: { en: "playhockeyineurope.com: salary ranges by league (third-party, page dated 7 September 2026)", ru: "playhockeyineurope.com: диапазоны зарплат по лигам (сторонний сайт, страница от 7 сентября 2026)" },
    url: "https://www.playhockeyineurope.com/how-much-do-hockey-players-make-in-europe/"
  }
};

const PROFILES = [
  {
    id: "fr-d1",
    country: { code: "FR", en: "France", ru: "Франция" },
    // Must match the league record in public/assets/leagues.src.js (calculator context).
    data: { name: "Division 1", country: "France" },
    names: {
      display: { en: "France Division 1", ru: "Division 1 (Франция)" },
      short: "Division 1",
      aliases: ["D1", "FFHG Division 1", "France D1"],
      note: {
        en: "Official name: Division 1 (D1), run by the French ice hockey federation (FFHG). It has no title sponsor in the 2026/27 documents EHA read.",
        ru: "Официальное название — Division 1 (D1), соревнование проводит Федерация хоккея Франции (FFHG). В документах сезона 2026/27, которые читала EHA, у лиги нет спонсорского названия."
      }
    },
    paths: { en: "/leagues/france-division-1", ru: "/ligi/franciya-division-1" },
    guide: { en: "/guides/hockey-in-france", ru: "/guides/hokkej-vo-francii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "How do you get into France Division 1?",
      ru: "Как попасть в хоккейную лигу France Division 1?"
    },
    answer: {
      en: "Through a club that has a role for you and room under the JFL rule. A full Division 1 game sheet of 20 players must include at least 13 locally trained (JFL) players, so a club can dress at most 7 non-JFL players. Clubs in this level look for players who change a line straight away: a recent full season of senior or strong junior hockey, verified statistics and a full-game video. The club enters the player with the FFHG, and for a player coming from another federation the international transfer has to be filed by 31 December 2026.",
      ru: "Через клуб, у которого есть для вас роль и место в рамках правила JFL. В полной заявке Division 1 на 20 игроков должно быть не меньше 13 игроков местной подготовки (JFL), то есть клуб может внести в протокол не больше 7 игроков без статуса JFL. На этом уровне ищут хоккеистов, которые сразу усиливают звено: свежий полный сезон во взрослом или сильном юниорском хоккее, проверяемая статистика и видео полной игры. Игрока оформляет клуб через FFHG, а для перехода из другой федерации международный трансфер нужно подать до 31 декабря 2026 года."
    },
    fitFor: {
      en: "It fits a player who is ready for a defined senior role but not yet for Ligue Magnus: a strong junior graduate, a player from a third or second division elsewhere, or a professional rebuilding after an injury. A young player looking mainly for development should compare it with junior routes where ice time is guaranteed.",
      ru: "Уровень подходит игроку, который готов к понятной роли во взрослом хоккее, но ещё не к Ligue Magnus: сильному выпускнику юниорской лиги, хоккеисту из второго или третьего дивизиона другой страны, профессионалу после травмы. Молодому игроку, которому прежде всего нужно развитие, стоит сравнить этот вариант с юниорскими лигами, где игровое время гарантировано."
    },
    position: {
      en: "Division 1 is the second national senior level in France, below Synerglace Ligue Magnus and above Division 2. In 2026/27 it has 16 teams and a 30-round regular season (FFHG calendar). A team can dress up to 18 skaters and 2 goaltenders.",
      ru: "Division 1 — второй национальный взрослый уровень Франции: ниже Synerglace Ligue Magnus и выше Division 2. В сезоне 2026/27 в лиге 16 команд, регулярный чемпионат — 30 туров (календарь FFHG). В заявку на матч входят до 18 полевых игроков и 2 вратарей."
    },
    expectations: {
      en: [
        "Experience: a recent full season at senior level, or a leading role in a strong junior league. Career totals matter less than the last season.",
        "Ice time: clubs want to see a player who already plays regular shifts, special teams or a clear defensive role, not a player who sat on the bench.",
        "Video: a full game from the last season plus a short clip package by role. Clubs judge pace, decisions under pressure and play without the puck.",
        "Status: say whether you may count as JFL (training years in French clubs), your citizenship and your contract or release status. This decides whether the club can use you."
      ],
      ru: [
        "Опыт: свежий полный сезон во взрослом хоккее или ведущая роль в сильной юниорской лиге. Последний сезон важнее суммы за карьеру.",
        "Игровая практика: клубу нужен хоккеист, который уже регулярно выходит на лёд, играет в спецбригадах или выполняет понятную оборонительную роль, а не сидит в запасе.",
        "Видео: полная игра прошлого сезона и короткая нарезка по роли. Клубы смотрят на скорость, решения под давлением и игру без шайбы.",
        "Статус: укажите, можете ли вы считаться JFL (годы подготовки во французских клубах), гражданство и статус контракта. От этого зависит, сможет ли клуб вас заявить."
      ]
    },
    rules: [
      {
        id: "fr-d1-jfl-gamesheet",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Non-JFL players (any passport)", ru: "Игроки без статуса JFL (любой паспорт)" },
        value: {
          en: "At least 13 JFL players on a 19–20 player game sheet, including at least one JFL goaltender, so at most 7 non-JFL players. Smaller sheets have lower minimums: 12 JFL for 17–18 players, 11 for 16, 10 for 14–15, 9 for 13, 8 for 11–12.",
          ru: "Не меньше 13 игроков JFL в протоколе на 19–20 игроков, включая минимум одного вратаря JFL, то есть не больше 7 игроков без статуса JFL. Для меньшего протокола минимум ниже: 12 JFL при 17–18 игроках, 11 при 16, 10 при 14–15, 9 при 13, 8 при 11–12."
        },
        exceptions: {
          en: "JFL is not nationality. A JFL player, of any nationality, was licensed only for ice hockey in FFHG-affiliated clubs for four full seasons up to the season in which he turns 20 (since 29 April 2006). Transitional rule: players born in 2006 with three full seasons by the end of 2026/27 become JFL at the end of that season.",
          ru: "JFL — это не гражданство. Игрок JFL любой национальности был лицензирован только в хоккее в клубах FFHG четыре полных сезона до сезона, в котором ему исполняется 20 лет (с 29 апреля 2006 года). Переходное правило: игроки 2006 года рождения с тремя полными сезонами к концу 2026/27 получают статус JFL по окончании этого сезона."
        },
        ref: "Règlement AS, art. 1.5.2, 8.1, 8.3",
        status: "official",
        source: "ffhgAs",
        checkedAt: "2026-11-18"
      },
      {
        id: "fr-d1-registration",
        season: "2026/27",
        scope: "registration",
        category: { en: "Non-JFL and foreign licences in the squad", ru: "Лицензии игроков без JFL и иностранцев в составе" },
        value: {
          en: "No separate cap on the number of non-JFL or foreign licence holders in a Division 1 squad was found in the AS and ALM regulations EHA read. The limit that bites is the game-sheet minimum above.",
          ru: "Отдельного лимита на количество лицензий игроков без JFL или иностранцев в составе Division 1 в прочитанных EHA регламентах AS и ALM не найдено. Реально ограничивает минимум JFL в протоколе матча."
        },
        exceptions: null,
        ref: "Règlement AS; Règlement ALM",
        status: "official",
        source: "ffhgAlm",
        checkedAt: "2026-11-18"
      },
      {
        id: "fr-d1-transfer-deadline",
        season: "2026/27",
        scope: "transfer",
        category: { en: "Transfers into Division 1 (national and international)", ru: "Переходы в Division 1 (внутри страны и из-за рубежа)" },
        value: {
          en: "The new club must file a national transfer or an international transfer request by 31 December 2026, 23:59. For a national transfer the former club must validate it by 5 January 2027. The extra January window (two arrivals) exists only for Ligue Magnus clubs, not for Division 1.",
          ru: "Новый клуб должен подать заявку на переход внутри страны или на международный трансфер до 31 декабря 2026 года, 23:59. При переходе внутри страны прежний клуб подтверждает его до 5 января 2027 года. Дополнительное январское окно (два новичка) есть только у клубов Ligue Magnus, у Division 1 его нет."
        },
        exceptions: {
          en: "Medical jokers: after 31 December a Division 1 club may add one player if a player is injured for at least six weeks on national-team duty, or a goaltender joker if its goaltender (seven or more senior game sheets) is out for at least three months; conditions in art. 38.",
          ru: "Медицинские замены: после 31 декабря клуб Division 1 может добавить одного игрока, если хоккеист травмирован минимум на шесть недель в сборной, или вратаря, если его вратарь (семь и более взрослых протоколов) выбыл минимум на три месяца; условия — в статье 38."
        },
        ref: "Règlement ALM, art. 32.2, 33.3, 38",
        status: "official",
        source: "ffhgAlm",
        checkedAt: "2026-11-18"
      },
      {
        id: "fr-d1-tryout",
        season: "2026/27",
        scope: "eligibility",
        category: { en: "Tryout with a player from another federation", ru: "Просмотр игрока из другой федерации" },
        value: {
          en: "A player from a federation other than the FFHG can try out only under a DECOUVERTE licence coupled with a tryout procedure, with his home federation's approval. For a player who needs an international transfer it is valid for 15 days and can be renewed once.",
          ru: "Игрок из другой федерации может пройти просмотр только по лицензии DECOUVERTE вместе с процедурой просмотра и с согласия своей федерации. Для игрока, которому нужен международный трансфер, она действует 15 дней и продлевается один раз."
        },
        exceptions: null,
        ref: "Règlement ALM, art. 21.1, 34.1",
        status: "official",
        source: "ffhgAlm",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the FFHG: a licence issued through the club, the international transfer for a player from another federation, and the JFL count on each game sheet.",
        ru: "Спортивный допуск даёт FFHG: лицензия, оформленная клубом, международный трансфер для игрока из другой федерации и учёт JFL в каждом протоколе матча."
      },
      residence: {
        en: "EU, EEA and Swiss citizens can live in France without a visa. Other players need a visa or residence document for the length of the contract. An FFHG licence does not give a right of stay.",
        ru: "Граждане ЕС, ЕЭЗ и Швейцарии могут жить во Франции без визы. Остальным нужна виза или вид на жительство на срок контракта. Лицензия FFHG не даёт права на пребывание."
      },
      work: {
        en: "For a player who is not an EU, EEA or Swiss citizen, the employer generally needs a work authorisation, unless the player already holds a visa or residence permit that allows work (Service-Public.fr).",
        ru: "Для игрока без гражданства ЕС, ЕЭЗ или Швейцарии работодатель, как правило, должен получить разрешение на работу, если у игрока ещё нет визы или вида на жительство с правом работы (Service-Public.fr)."
      },
      sources: ["frWork", "iihf"]
    },
    windows: [
      {
        kind: "official",
        label: { en: "Team entries for the season", ru: "Заявка команд на сезон" },
        dates: { en: "By 15 July; FFHG validates entries from 1 August", ru: "До 15 июля; FFHG утверждает заявки с 1 августа" },
        ref: "Règlement AS, art. 11.3.2",
        source: "ffhgAs"
      },
      {
        kind: "official",
        label: { en: "Last day to file a transfer (national or international)", ru: "Последний день подачи перехода (внутри страны или международного)" },
        dates: { en: "31 December 2026, 23:59 (former club validates a national transfer by 5 January 2027)", ru: "31 декабря 2026, 23:59 (прежний клуб подтверждает переход внутри страны до 5 января 2027)" },
        ref: "Règlement ALM, art. 32.2, 33.3",
        source: "ffhgAlm"
      },
      {
        kind: "guide",
        label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" },
        dates: { en: "Spring and summer before the season; in-season additions until the 31 December deadline", ru: "Весна и лето перед сезоном; добор по ходу сезона до 31 декабря" },
        ref: null,
        source: null
      }
    ],
    money: {
      status: "no_sample",
      summary: {
        en: "EHA has no reliable salary sample for Division 1 and found no official salary scale. A package can combine salary, housing, a car, meals and expenses, so ask for each item separately. We do not publish an average.",
        ru: "У EHA нет надёжной выборки зарплат в Division 1, официальной шкалы тоже нет. Пакет может включать зарплату, жильё, машину, питание и компенсацию расходов, поэтому уточняйте каждый пункт отдельно. Среднюю цифру мы не публикуем."
      },
      examples: []
    },
    steps: {
      en: [
        "Check your status: citizenship, whether you can count as JFL, contract or release status with your current club.",
        "Prepare a full game from last season, a short clip package by role and verified statistics.",
        "Check your level with the calculator on this page and decide whether Division 1 is the right step or Ligue Magnus / Division 2 fits better.",
        "Shortlist clubs by role and roster needs; contact only people the club authorises.",
        "For a tryout, agree dates, costs and the DECOUVERTE licence before you travel.",
        "Get the offer in writing, then check the transfer deadline (31 December), licence, insurance and work authorisation."
      ],
      ru: [
        "Проверьте свой статус: гражданство, можно ли считать вас JFL, контракт или отказ текущего клуба.",
        "Подготовьте полную игру прошлого сезона, короткую нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице и решите, подходит ли Division 1 или лучше Ligue Magnus / Division 2.",
        "Составьте список клубов по роли и потребностям состава; общайтесь только с уполномоченными представителями клуба.",
        "Если зовут на просмотр, до поездки договоритесь о датах, расходах и лицензии DECOUVERTE.",
        "Получите предложение письменно и проверьте срок перехода (31 декабря), лицензию, страховку и разрешение на работу."
      ]
    },
    calcChecks: {
      en: ["JFL: at most 7 non-JFL players on a full game sheet.", "Transfer deadline for Division 1: 31 December 2026.", "Non-EU players: work authorisation and residence document."],
      ru: ["JFL: не больше 7 игроков без статуса JFL в полном протоколе.", "Срок перехода в Division 1: 31 декабря 2026.", "Игроки не из ЕС: разрешение на работу и документ на пребывание."]
    },
    faq: [
      {
        q: { en: "How do you get into France Division 1?", ru: "Как попасть в France Division 1?" },
        a: {
          en: "Through a club with a role for you and room under the JFL rule: at most 7 non-JFL players on a full game sheet. Send a full game, verified statistics and your status; the club files the licence and, for a player from abroad, the international transfer by 31 December.",
          ru: "Через клуб, у которого есть для вас роль и место в рамках правила JFL: не больше 7 игроков без JFL в полном протоколе. Отправьте полную игру, проверяемую статистику и сведения о статусе; клуб оформляет лицензию и для игрока из-за рубежа — международный трансфер до 31 декабря."
        }
      },
      {
        q: { en: "How many foreign players can play in Division 1?", ru: "Сколько иностранцев может играть в Division 1?" },
        a: {
          en: "France counts JFL status, not passports. On a 19–20 player game sheet at least 13 players must be JFL, so up to 7 can be non-JFL. A foreign player can be JFL if he trained in French clubs long enough.",
          ru: "Во Франции считают статус JFL, а не паспорт. В протоколе на 19–20 игроков не меньше 13 должны быть JFL, то есть без этого статуса может быть до 7. Иностранец может быть JFL, если достаточно долго занимался во французских клубах."
        }
      },
      {
        q: { en: "Until when can a Division 1 club sign a player?", ru: "До какого числа клуб Division 1 может заявить игрока?" },
        a: {
          en: "A transfer must be filed by 31 December 2026. The January window is for Ligue Magnus only; after 31 December Division 1 clubs can add a player only as a medical joker under art. 38.",
          ru: "Переход нужно подать до 31 декабря 2026 года. Январское окно есть только у Ligue Magnus; после 31 декабря клуб Division 1 может добавить игрока лишь как медицинскую замену по статье 38."
        }
      },
      {
        q: { en: "What do Division 1 players earn?", ru: "Сколько зарабатывают в Division 1?" },
        a: {
          en: "There is no official scale and EHA has no reliable sample, so we do not quote an average. Compare the full package: gross or net pay, housing, car, meals, insurance and travel.",
          ru: "Официальной шкалы нет, надёжной выборки у EHA тоже нет, поэтому среднюю цифру мы не называем. Сравнивайте весь пакет: зарплата брутто или нетто, жильё, машина, питание, страховка и дорога."
        }
      }
    ],
    missing: {
      en: [
        "The opening date of the senior transfer period (only the 31 December closing date was confirmed).",
        "The 2026/27 Division 1 club list and playoff and relegation format (annex AS 3 was not read).",
        "Any salary sample or official salary scale."
      ],
      ru: [
        "Дата открытия периода переходов для взрослых (подтверждена только дата закрытия — 31 декабря).",
        "Список клубов Division 1 2026/27, формат плей-офф и вылета (приложение AS 3 не прочитано).",
        "Выборка зарплат или официальная шкала."
      ]
    },
    sources: ["ffhgAs", "ffhgAlm", "ffhgD1Calendar", "frWork", "iihf"]
  },

  {
    id: "pl-thl",
    country: { code: "PL", en: "Poland", ru: "Польша" },
    data: { name: "TAURON Hokej Liga", country: "Poland" },
    names: {
      display: { en: "TAURON Hokej Liga", ru: "TAURON Hokej Liga" },
      short: "TAURON Hokej Liga",
      aliases: ["THL", "PHL", "Polska Hokej Liga", "Polish Hockey League", "Ekstraliga"],
      note: {
        en: "The 2026/27 regulation names the competition TAURON Hokej Liga (THL), the men's top professional league, organised by Polish Ice Hockey Events Department Sp. z o.o. (PIHED) in Katowice. PHL (Polska Hokej Liga) is the former name; it is still used in searches and in some PZHL documents. When you read “PHL limit”, it means this league.",
        ru: "Регламент сезона 2026/27 называет соревнование TAURON Hokej Liga (THL) — высшая профессиональная мужская лига, организатор — Polish Ice Hockey Events Department Sp. z o.o. (PIHED), Катовице. PHL (Polska Hokej Liga) — прежнее название, его до сих пор используют в поиске и в некоторых документах PZHL. Если вы ищете «лимит легионеров PHL», речь об этой лиге."
      }
    },
    paths: { en: "/leagues/poland-tauron-hokej-liga", ru: "/ligi/polsha-tauron-hokej-liga" },
    guide: { en: "/guides/hockey-in-poland", ru: "/guides/hokkej-v-polshe" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "What is the foreign-player limit in Poland's top hockey league?",
      ru: "Какой лимит легионеров в высшей хоккейной лиге Польши?"
    },
    answer: {
      en: "The 2026/27 regulation does not cap imports directly. It requires at least 10 players with Polish citizenship or a Karta Polaka (Pole's Card), including one goaltender, in every match roster of 12–22 players. With a full 22-player roster that leaves room for up to 12 other players. A team must also dress at least two Polish (or Karta Polaka) players born 2003–2010; without them the roster is capped at 20 (21 with one). Breaking either rule means a 1:0 forfeit.",
      ru: "Регламент сезона 2026/27 не ограничивает число легионеров напрямую. Он требует, чтобы в каждой заявке на матч (от 12 до 22 игроков) было не меньше 10 хоккеистов с польским гражданством или Картой поляка, в том числе один вратарь. При полной заявке из 22 игроков остаётся место максимум для 12 остальных. Кроме того, в составе должны быть минимум два игрока с польским гражданством (или Картой поляка) 2003–2010 годов рождения; без них заявка ограничена 20 игроками (21 — если такой игрок один). Нарушение любого из правил — техническое поражение 1:0."
    },
    fitFor: {
      en: "It fits a senior player who can take a defined role at once: clubs bring in imports for impact, not for development. A player without a recent senior season usually needs a stronger proof season first, for example in the Polish 1 Liga or a comparable second division.",
      ru: "Лига подходит взрослому игроку, который сразу берёт на себя понятную роль: легионеров приглашают как усиление, а не на развитие. Игроку без свежего взрослого сезона обычно сначала нужен сезон-доказательство, например в польской 1 Liga или сопоставимом втором дивизионе."
    },
    position: {
      en: "TAURON Hokej Liga is Poland's top senior level, above the 1 Liga. In 2026/27 it has 10 teams; the season started on 15 September 2026, the regular season has 45 rounds and ends on 21 February 2027, with playoffs from 26–27 February (PZHL schedule). Competitions run between 1 September and 30 April.",
      ru: "TAURON Hokej Liga — высший взрослый уровень Польши, выше 1 Liga. В сезоне 2026/27 в лиге 10 команд; сезон начался 15 сентября 2026 года, регулярный чемпионат — 45 туров до 21 февраля 2027 года, плей-офф с 26–27 февраля (календарь PZHL). Соревнования проходят с 1 сентября по 30 апреля."
    },
    expectations: {
      en: [
        "Experience: recent senior seasons at a comparable or higher level. An import is expected to play a top role, not to sit in the stands.",
        "Ice time: show the role you actually play — power play, penalty kill, top-four defence, starting goaltender.",
        "Video: a recent full game and a short clip package by role; clubs check pace, battles and decisions.",
        "Status: Polish citizenship or a Karta Polaka changes everything, because such a player counts towards the 10-player minimum. Say so in the first message."
      ],
      ru: [
        "Опыт: свежие взрослые сезоны на сопоставимом или более высоком уровне. От легионера ждут роли в первых звеньях, а не места на трибуне.",
        "Игровая практика: покажите роль, которую вы реально выполняете, — большинство, меньшинство, первая четвёрка защиты, основной вратарь.",
        "Видео: свежая полная игра и короткая нарезка по роли; клубы смотрят на скорость, единоборства и решения.",
        "Статус: польское гражданство или Карта поляка меняет всё, потому что такой игрок входит в минимум из 10 поляков. Сообщите об этом в первом сообщении."
      ]
    },
    rules: [
      {
        id: "pl-thl-polish-minimum",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Players without Polish citizenship or Karta Polaka", ru: "Игроки без польского гражданства или Карты поляка" },
        value: {
          en: "The match roster has 12–22 players and must include at least 10 players with Polish citizenship or a Karta Polaka, including one goaltender. With 22 players, up to 12 may be others.",
          ru: "В заявке на матч от 12 до 22 игроков, из них не меньше 10 — с польским гражданством или Картой поляка, включая одного вратаря. При 22 игроках остальных может быть до 12."
        },
        exceptions: {
          en: "The count is by citizenship or Karta Polaka, not by where the player trained. The “up to 12” figure is EHA's arithmetic from the two rules, not a number written in the regulation.",
          ru: "Считается гражданство или Карта поляка, а не место подготовки. Цифра «до 12» — арифметика EHA по двум правилам, а не число из регламента."
        },
        ref: "Regulamin THL 2026/27, §13.3–13.4, §13.6",
        status: "official",
        source: "thlRules",
        checkedAt: "2026-11-18"
      },
      {
        id: "pl-thl-u23",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Young Polish players (U23)", ru: "Молодые польские игроки (U23)" },
        value: {
          en: "At least two Polish (or Karta Polaka) players born 2003–2010 must be in the roster. Without them the team may enter at most 20 players; with one, at most 21.",
          ru: "В составе должны быть минимум два игрока с польским гражданством (или Картой поляка) 2003–2010 годов рождения. Без них команда может внести в протокол не больше 20 игроков, с одним — не больше 21."
        },
        exceptions: {
          en: "A roster cut to 20 also cuts the room for other players to 10.",
          ru: "Если заявка сокращена до 20, место для остальных игроков сокращается до 10."
        },
        ref: "Regulamin THL 2026/27, §13.5–13.6",
        status: "official",
        source: "thlRules",
        checkedAt: "2026-11-18"
      },
      {
        id: "pl-thl-registration",
        season: "2026/27",
        scope: "registration",
        category: { en: "Licences for foreign players", ru: "Лицензии иностранных игроков" },
        value: {
          en: "No cap on the number of foreign licence holders was found in the pages of the THL regulation EHA read. A foreign player gets a season licence (Okresowe Uprawnienie Zawodnika) after the PZHL issues a promise confirming he can move to a THL club; the club applies with a copy of his passport.",
          ru: "Лимита на число лицензий иностранцев в прочитанных EHA разделах регламента THL не найдено. Иностранный игрок получает сезонное право выступать (Okresowe Uprawnienie Zawodnika) после того, как PZHL выдаст подтверждение, что он может перейти в клуб THL; клуб подаёт заявление с копией паспорта."
        },
        exceptions: null,
        ref: "Regulamin THL 2026/27, §15.3, §16.2",
        status: "official",
        source: "thlRules",
        checkedAt: "2026-11-18"
      },
      {
        id: "pl-thl-window",
        season: "2026/27",
        scope: "transfer",
        category: { en: "Transfers and loans into a THL club", ru: "Переходы и аренды в клуб THL" },
        value: {
          en: "The transfer window is open until 15 February 2027, 23:59. From 1 to 31 December a club may make at most 3 incoming transfers (loans included); from 1 January to 15 February at most 2. After the window closes, a licence can be issued only to the club's own player.",
          ru: "Трансферное окно открыто до 15 февраля 2027 года, 23:59. С 1 по 31 декабря клуб может сделать не больше 3 входящих переходов (включая аренды), с 1 января по 15 февраля — не больше 2. После закрытия окна лицензию можно выдать только собственному игроку клуба."
        },
        exceptions: {
          en: "One extra transfer for the same position is allowed if a player is injured on national-team duty and cannot return this season, confirmed by the national-team doctor. Contracts must run for at least 3 months; the regulation sets no salary limits.",
          ru: "Дополнительный переход на ту же позицию разрешён, если игрок травмирован в сборной и не вернётся в этом сезоне, что подтверждает врач сборной. Контракт заключается минимум на 3 месяца; ограничений по зарплате регламент не устанавливает."
        },
        ref: "Regulamin THL 2026/27, §20.2–20.4, §21.2",
        status: "official",
        source: "thlRules",
        checkedAt: "2026-11-18"
      },
      {
        id: "pl-thl-future",
        season: "2027/28+",
        scope: "game_sheet",
        category: { en: "Future seasons (press report)", ru: "Будущие сезоны (сообщение прессы)" },
        value: {
          en: "At the 2026/27 season launch the PZHL president said the Polish minimum is 10 for this season and the next, rising later to 11 and 12. Not yet in a regulation.",
          ru: "На старте сезона 2026/27 президент PZHL сказал, что минимум поляков — 10 в этом и следующем сезоне, затем 11 и 12. В регламенте этого пока нет."
        },
        exceptions: null,
        ref: null,
        status: "press",
        source: "flashscorePl",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the league organiser (PIHED) and the PZHL: the season licence, the PZHL transfer promise, the IIHF international transfer for a player from another federation, and the Polish-player count on each match roster.",
        ru: "Спортивный допуск дают организатор лиги (PIHED) и PZHL: сезонное право выступать, подтверждение PZHL на переход, международный трансфер IIHF для игрока из другой федерации и учёт польских игроков в каждой заявке на матч."
      },
      residence: {
        en: "EU, EEA and Swiss citizens can live in Poland without a visa. Other players need a visa or a temporary residence permit; a THL licence does not give a right of stay.",
        ru: "Граждане ЕС, ЕЭЗ и Швейцарии могут жить в Польше без визы. Остальным нужна виза или разрешение на временное пребывание; лицензия THL права на пребывание не даёт."
      },
      work: {
        en: "EU, EEA and Swiss citizens and Karta Polaka holders do not need a work permit. Other players generally need one, applied for by the employer through praca.gov.pl, unless another exemption applies. A short exemption for athletes competing up to 30 days a year does not cover a season.",
        ru: "Гражданам ЕС, ЕЭЗ и Швейцарии и владельцам Карты поляка разрешение на работу не нужно. Остальным оно, как правило, требуется, заявление подаёт работодатель через praca.gov.pl, если не действует другое исключение. Короткое исключение для спортсменов, выступающих до 30 дней в году, на сезон не распространяется."
      },
      sources: ["plWork", "euPortal", "iihf"]
    },
    windows: [
      {
        kind: "official",
        label: { en: "Season (regulation)", ru: "Сезон (регламент)" },
        dates: { en: "Competitions between 1 September and 30 April; 2026/27 started on 15 September 2026", ru: "Соревнования с 1 сентября по 30 апреля; сезон 2026/27 начался 15 сентября 2026" },
        ref: "Regulamin THL 2026/27, §5.5",
        source: "thlRules"
      },
      {
        kind: "official",
        label: { en: "Transfer window closes", ru: "Закрытие трансферного окна" },
        dates: { en: "15 February 2027, 23:59", ru: "15 февраля 2027, 23:59" },
        ref: "Regulamin THL 2026/27, §20.2",
        source: "thlRules"
      },
      {
        kind: "official",
        label: { en: "In-season arrivals limit", ru: "Лимит новичков по ходу сезона" },
        dates: { en: "1–31 December: up to 3 incoming; 1 January – 15 February: up to 2", ru: "1–31 декабря: до 3 входящих; 1 января – 15 февраля: до 2" },
        ref: "Regulamin THL 2026/27, §20.3",
        source: "thlRules"
      },
      {
        kind: "guide",
        label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" },
        dates: { en: "April to August; after that clubs mostly replace injured or underperforming players", ru: "С апреля по август; после этого клубы в основном заменяют травмированных или не оправдавших ожиданий игроков" },
        ref: null,
        source: null
      }
    ],
    money: {
      status: "third_party",
      summary: {
        en: "EHA has no reliable salary sample for TAURON Hokej Liga and there is no official scale; the regulation itself sets no salary limits. The only public figure we found is a third-party range, shown below as an example, not an average.",
        ru: "Надёжной выборки зарплат в TAURON Hokej Liga у EHA нет, официальной шкалы тоже; сам регламент ограничений по зарплате не устанавливает. Единственная публичная цифра — диапазон со стороннего сайта, он приведён ниже как пример, а не как средняя."
      },
      examples: [
        {
          value: { en: "EUR 15,000–60,000+", ru: "15 000–60 000+ евро" },
          note: {
            en: "Third-party range for the “Polish Hockey League”. The source does not say gross or net, per year or per season, or what is included.",
            ru: "Диапазон стороннего сайта для «Polish Hockey League». Источник не уточняет, брутто это или нетто, за год или за сезон и что входит в сумму."
          },
          source: "phieSalaries",
          checkedAt: "2026-11-15"
        }
      ]
    },
    steps: {
      en: [
        "Check your status: citizenship, Karta Polaka, contract or release status with your current club.",
        "Prepare a recent full game, a clip package by role and verified statistics.",
        "Check your level with the calculator on this page; if TAURON Hokej Liga is a stretch, look at the 1 Liga or a comparable second division first.",
        "Shortlist clubs by position needs and their recent import choices.",
        "Get a written offer (at least 3 months), then check the PZHL transfer promise, IIHF transfer, insurance and work permit.",
        "Mind the dates: a club has only 3 arrival slots in December and 2 from January to 15 February."
      ],
      ru: [
        "Проверьте статус: гражданство, Карта поляка, контракт или отказ текущего клуба.",
        "Подготовьте свежую полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице; если TAURON Hokej Liga пока высоковата, сначала посмотрите на 1 Liga или сопоставимый второй дивизион.",
        "Составьте список клубов по потребностям в позиции и недавним решениям по легионерам.",
        "Получите письменное предложение (минимум на 3 месяца) и проверьте подтверждение PZHL, трансфер IIHF, страховку и разрешение на работу.",
        "Учитывайте даты: в декабре у клуба только 3 места для новичков, с января до 15 февраля — 2."
      ]
    },
    calcChecks: {
      en: ["At least 10 Polish or Karta Polaka players per match roster: up to 12 others on a full roster.", "Transfer window closes 15 February 2027; 3 arrivals in December, 2 after.", "Non-EU players: work permit unless exempt (Karta Polaka holders are exempt)."],
      ru: ["Минимум 10 поляков или владельцев Карты поляка в заявке: при полной заявке до 12 остальных.", "Окно закрывается 15 февраля 2027; в декабре 3 новичка, потом 2.", "Игроки не из ЕС: разрешение на работу, если нет исключения (Карта поляка освобождает)."]
    },
    faq: [
      {
        q: { en: "What is the import limit in Poland's top hockey league?", ru: "Какой лимит легионеров в высшей лиге Польши?" },
        a: {
          en: "There is no direct cap. Each 12–22 player match roster must include at least 10 players with Polish citizenship or a Karta Polaka, including a goaltender, so a full roster has room for up to 12 others (2026/27 regulation, §13.4).",
          ru: "Прямого лимита нет. В каждой заявке на матч (12–22 игрока) должно быть не меньше 10 игроков с польским гражданством или Картой поляка, включая вратаря, поэтому при полной заявке остаётся место максимум для 12 остальных (регламент 2026/27, §13.4)."
        }
      },
      {
        q: { en: "Is the PHL the same league as TAURON Hokej Liga?", ru: "PHL и TAURON Hokej Liga — одна лига?" },
        a: {
          en: "Yes. PHL (Polska Hokej Liga) is the former name. The 2026/27 regulation calls the top league TAURON Hokej Liga, organised by PIHED.",
          ru: "Да. PHL (Polska Hokej Liga) — прежнее название. Регламент 2026/27 называет высшую лигу TAURON Hokej Liga, организатор — PIHED."
        }
      },
      {
        q: { en: "Does a Karta Polaka count as Polish?", ru: "Считается ли Карта поляка польским статусом?" },
        a: {
          en: "For the match-roster minimum, yes: the regulation counts Polish citizens and Karta Polaka holders. Karta Polaka holders also do not need a work permit.",
          ru: "Для минимума в заявке — да: регламент учитывает граждан Польши и владельцев Карты поляка. Владельцам Карты поляка также не нужно разрешение на работу."
        }
      },
      {
        q: { en: "When does the transfer window close?", ru: "Когда закрывается трансферное окно?" },
        a: {
          en: "On 15 February 2027 at 23:59. From 1 to 31 December a club can add up to 3 players, from 1 January to 15 February up to 2.",
          ru: "15 февраля 2027 года в 23:59. С 1 по 31 декабря клуб может добавить до 3 игроков, с 1 января по 15 февраля — до 2."
        }
      }
    ],
    missing: {
      en: [
        "The opening date of the transfer window (the regulation pages EHA read give only the closing date).",
        "Whether the PZHL or PIHED caps the number of foreign licences in a separate resolution.",
        "A reliable salary sample; only a third-party range is available."
      ],
      ru: [
        "Дата открытия трансферного окна (в прочитанных EHA разделах регламента есть только дата закрытия).",
        "Ограничивают ли PZHL или PIHED число лицензий иностранцев отдельным решением.",
        "Надёжная выборка зарплат; есть только диапазон стороннего сайта."
      ]
    },
    sources: ["thlRules", "pzhlDocs", "thlSchedule", "plWork", "euPortal", "iihf", "flashscorePl"]
  }
];

const BY_ID = new Map(PROFILES.map((p) => [p.id, p]));
const BY_PATH = new Map();
for (const p of PROFILES) {
  BY_PATH.set(p.paths.en, { profile: p, locale: "en" });
  BY_PATH.set(p.paths.ru, { profile: p, locale: "ru" });
}

const SCOPES = ["game_sheet", "registration", "transfer", "eligibility"];
const STATUSES = ["official", "press"];

// Structural checks used by the tests and by scripts: a profile must not
// publish a rule without a season, scope, source and check date.
function validateProfile(p) {
  const errors = [];
  const needText = (v, where) => { if (!v || !v.en || !v.ru) errors.push(`${p.id}: ${where} needs en and ru`); };
  if (!/^[a-z]{2}-[a-z0-9-]+$/.test(p.id || "")) errors.push(`${p.id}: bad id`);
  for (const k of ["question", "answer", "fitFor", "position"]) needText(p[k], k);
  if (!p.paths || !p.paths.en || !p.paths.ru) errors.push(`${p.id}: paths`);
  for (const r of p.rules || []) {
    if (!r.season || !SCOPES.includes(r.scope) || !STATUSES.includes(r.status)) errors.push(`${p.id}/${r.id}: season, scope or status`);
    if (!SOURCES[r.source]) errors.push(`${p.id}/${r.id}: unknown source ${r.source}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt || "")) errors.push(`${p.id}/${r.id}: checkedAt`);
    needText(r.category, `${r.id}.category`); needText(r.value, `${r.id}.value`);
  }
  for (const w of p.windows || []) {
    if (w.kind === "official" && !SOURCES[w.source]) errors.push(`${p.id}: official window without source`);
  }
  for (const ex of (p.money && p.money.examples) || []) {
    if (!SOURCES[ex.source]) errors.push(`${p.id}: salary example without source`);
  }
  for (const s of p.sources || []) if (!SOURCES[s]) errors.push(`${p.id}: unknown source ${s}`);
  return errors;
}

function profileById(id) { return BY_ID.get(id) || null; }
function profileForPath(logicalPath) { return BY_PATH.get(logicalPath) || null; }

module.exports = { PROFILES, SOURCES, profileById, profileForPath, validateProfile };
