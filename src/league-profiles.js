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
  },
  del2Rules: {
    label: { en: "DEL2: Spielordnung (September 2026)", ru: "DEL2: Spielordnung (сентябрь 2026)" },
    url: "https://www.del-2.org/media/regeln/spielordnung_del2_26_27.pdf"
  },
  del2Format: {
    label: { en: "DEL2: competition format", ru: "DEL2: формат соревнования" },
    url: "https://www.del-2.org/spielmodus/"
  },
  debOberligaTeams: {
    label: { en: "DEB: Oberliga licensing for 2026/27 completed", ru: "DEB: допуск команд Oberliga на 2026/27" },
    url: "https://www.deb-online.de/2026/07/01/deb-oberligen-zulassungsverfahren-fuer-die-saison-2026-2027-abgeschlossen/"
  },
  debOberligaSchedule: {
    label: { en: "DEB: Oberliga schedule 2026/27", ru: "DEB: календарь Oberliga 2026/27" },
    url: "https://www.deb-online.de/2026/07/06/deb-oberliga-spielplan-fuer-die-saison-2026-2027-steht/"
  },
  ehnImports2022: {
    label: { en: "Eishockey NEWS: DEB vice-president on three import players in the Oberliga (2022, press)", ru: "Eishockey NEWS: вице-президент DEB о трёх легионерах в Oberliga (2022, пресса)" },
    url: "https://www.eishockeynews.de/artikel/2022/06/17/deb-vizepraesident-marc-hindelang-spricht-in-der-aktuellen-printausgabe-ueber-die-erhoehung-der-importstellen-in-der-oberliga/146b2c76-3342-47bd-9871-43a7d045e680.html"
  },
  ehnU23_2024: {
    label: { en: "Eishockey NEWS: new over-23 limit in the Oberliga, still three import players (2024, press)", ru: "Eishockey NEWS: новый лимит игроков старше 23 лет в Oberliga, по-прежнему три легионера (2024, пресса)" },
    url: "https://www.eishockeynews.de/artikel/2024/04/05/oberligisten-staerken-nachwuchsfoerderung-weiterhin-drei-kontingentspieler-erlaubt/e11703f8-3051-4e68-89ca-c6484d166c81.html"
  },
  deAthleteVisa: {
    label: { en: "Make it in Germany (federal portal): athletes and coaches", ru: "Make it in Germany (федеральный портал): спортсмены и тренеры" },
    url: "https://www.make-it-in-germany.com/en/visa-residence/types/other/athletes-coaches"
  },
  iihfTransfer2026: {
    label: { en: "IIHF International Transfer Regulations 2026", ru: "IIHF: регламент международных переходов 2026" },
    url: "https://blob.iihf.com/iihf-media/iihfmvc/media/downloads/regulations/2026/2026_iihf_international_transfer_regulations.pdf"
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
  },

  {
    id: "de-del2",
    country: { code: "DE", en: "Germany", ru: "Германия" },
    data: { name: "DEL2", country: "Germany" },
    names: {
      display: { en: "DEL2", ru: "DEL2" },
      short: "DEL2",
      aliases: ["DEL 2", "2. Liga Deutschland", "German second division"],
      note: {
        en: "DEL2 is the second professional level in Germany, run by ESBG (Eishockeyspielbetriebsgesellschaft mbH). It is a separate league company from the DEL above it.",
        ru: "DEL2 — второй профессиональный уровень Германии, её проводит ESBG (Eishockeyspielbetriebsgesellschaft mbH). Это отдельная лига, не связанная организационно с DEL уровнем выше."
      }
    },
    paths: { en: "/leagues/germany-del2", ru: "/ligi/germaniya-del2" },
    guide: { en: "/guides/hockey-in-germany", ru: "/guides/hokkej-v-germanii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "How many imports can play in DEL2, and who counts as one?",
      ru: "Сколько легионеров может играть в DEL2 и кто считается легионером?"
    },
    answer: {
      en: "At most four foreign players on a DEL2 game sheet, and a club can license at most six foreign players over the whole season. “Foreign” means anyone without German citizenship when the licence is issued, so an EU passport does not make a player non-foreign here. No new licences can be applied for after 15 February 2027 (DEL2 Spielordnung, September 2026). For a non-EU player the federal professional-athlete route also requires a gross salary of at least €50,700 a year in 2026.",
      ru: "В протокол матча DEL2 можно внести не больше четырёх иностранных игроков, а за весь сезон клуб может лицензировать не больше шести. «Иностранец» здесь — любой игрок без немецкого гражданства на момент выдачи лицензии, поэтому паспорт ЕС не делает игрока «своим». После 15 февраля 2027 года новые лицензии запросить нельзя (Spielordnung DEL2, сентябрь 2026). Для игрока не из ЕС федеральный путь для профессиональных спортсменов в 2026 году требует ещё и зарплаты не меньше 50 700 евро брутто в год."
    },
    fitFor: {
      en: "It fits an import who is ready to play a top-six, top-four or starting-goaltender role in a professional league from day one: with only four import places per game, clubs do not sign foreign depth players. For a North American player that usually means a strong ECHL season or a high-level U Sports/NCAA record with a defined role; for a European, a solid season in a comparable second division or a top division of a smaller country.",
      ru: "Лига подходит легионеру, готовому с первого дня играть в первых двух звеньях, первой четвёрке защиты или основным вратарём профессиональной лиги: при четырёх местах на матч клубы не берут иностранцев «на глубину». Для игрока из Северной Америки это обычно сильный сезон в ECHL или высокого уровня U Sports/NCAA с понятной ролью; для европейца — уверенный сезон в сопоставимом втором дивизионе или высшем дивизионе небольшой страны."
    },
    position: {
      en: "DEL2 is the second level, below the DEL and above the two Oberliga groups. In 2026/27 it has 14 clubs and 52 regular-season games each (DEL2 format page). A game sheet holds up to 19 skaters, 2 goaltenders and an emergency goaltender; at most 15 of them may hold regular licences, and the 18th and 19th skater spots are for U21 development players.",
      ru: "DEL2 — второй уровень: ниже DEL и выше двух групп Oberliga. В сезоне 2026/27 в лиге 14 клубов, у каждого 52 матча регулярного чемпионата (страница формата DEL2). В протокол входят до 19 полевых, 2 вратаря и запасной вратарь; не больше 15 из них — с обычными лицензиями, а 18-е и 19-е места полевых отведены игрокам U21 по программе развития."
    },
    expectations: {
      en: [
        "Experience: recent professional or high-level senior seasons; DEL2 clubs rarely take an import straight from junior hockey.",
        "Role: an import is expected to be a difference-maker — power play, top-four minutes or the starting job in goal.",
        "Video: a recent full game plus role clips; pace, battles and decisions under pressure are what clubs check first.",
        "Status: say whether you hold German citizenship or are eligible for a German licence category (U21/U24 rules), because that changes whether you take an import place at all."
      ],
      ru: [
        "Опыт: свежие профессиональные или сильные взрослые сезоны; сразу из юниоров легионеров в DEL2 берут редко.",
        "Роль: от легионера ждут, что он будет решать — большинство, минуты в первой четвёрке или место основного вратаря.",
        "Видео: свежая полная игра и нарезка по роли; клубы прежде всего смотрят на скорость, единоборства и решения под давлением.",
        "Статус: сообщите, есть ли у вас немецкое гражданство или право на немецкую категорию лицензии (правила U21/U24) — от этого зависит, займёте ли вы место легионера вообще."
      ]
    },
    rules: [
      {
        id: "de-del2-foreign-gamesheet",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Foreign players (no German citizenship)", ru: "Иностранные игроки (без немецкого гражданства)" },
        value: {
          en: "Up to 19 skaters, 2 goaltenders and 1 emergency goaltender on the game sheet; at most 15 with regular licences, of whom at most 4 may be foreign. Breaking the limit means the game is scored as lost.",
          ru: "В протоколе до 19 полевых, 2 вратарей и 1 запасного вратаря; не больше 15 с обычными лицензиями, из них не больше 4 иностранцев. Нарушение — техническое поражение."
        },
        exceptions: {
          en: "A foreign player is one without German citizenship at the time the licence is issued; a player who becomes German later stops counting from that date. The regulation does not exempt EU citizens. U21 skaters, U24 players and goaltenders aged under 26 hold non-regular licences.",
          ru: "Иностранец — игрок без немецкого гражданства на момент выдачи лицензии; если он позже получает гражданство, то перестаёт считаться иностранцем с этой даты. Граждан ЕС регламент не исключает. Полевые U21, игроки U24 и вратари младше 26 лет получают необычные (не «регулярные») лицензии."
        },
        ref: "Spielordnung DEL2 (September 2026), §18 (2), §24 (6)–(9), §10 (8) f)",
        status: "official",
        source: "del2Rules",
        checkedAt: "2026-11-18"
      },
      {
        id: "de-del2-foreign-season",
        season: "2026/27",
        scope: "registration",
        category: { en: "Foreign licences per club and season", ru: "Лицензии иностранцев на клуб за сезон" },
        value: {
          en: "A club can be granted licences for at most 6 foreign players over the whole season. A replacement after a release uses one of these six.",
          ru: "За весь сезон клуб может получить лицензии не больше чем на 6 иностранных игроков. Замена после отчисления тоже расходует одно из этих шести мест."
        },
        exceptions: null,
        ref: "Spielordnung DEL2 (September 2026), §18 (2)",
        status: "official",
        source: "del2Rules",
        checkedAt: "2026-11-18"
      },
      {
        id: "de-del2-deadline",
        season: "2026/27",
        scope: "transfer",
        category: { en: "Licence deadline (all players)", ru: "Срок лицензирования (все игроки)" },
        value: {
          en: "No player licences can be applied for after 15 February for the current season. Documents must reach the league at least 24 hours before a player's first championship game.",
          ru: "После 15 февраля лицензии на текущий сезон запросить нельзя. Документы должны поступить в лигу минимум за 24 часа до первого матча игрока."
        },
        exceptions: {
          en: "The IIHF international transfer period for players aged 18 and over runs from 1 July to 15 February (IIHF 2026 regulations), so a move from abroad must be completed inside it as well.",
          ru: "Период международных переходов IIHF для игроков от 18 лет — с 1 июля по 15 февраля (регламент IIHF 2026), поэтому переход из-за рубежа тоже должен уложиться в эти даты."
        },
        ref: "Spielordnung DEL2 (September 2026), §24 (1), §26 (3)",
        status: "official",
        source: "del2Rules",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the league company (ESBG): a DEL2 licence in the right category, counted against the four-per-game and six-per-season import limits, plus the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск даёт лига (ESBG): лицензия DEL2 нужной категории, которая учитывается в лимитах «четыре на матч» и «шесть за сезон», плюс трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU/EEA and Swiss citizens can live in Germany without a visa but must register their address. Other players need a visa and residence title for the purpose of employment before they start.",
        ru: "Граждане ЕС/ЕЭЗ и Швейцарии живут в Германии без визы, но регистрируют адрес. Остальным до начала работы нужны виза и вид на жительство с целью трудоустройства."
      },
      work: {
        en: "For non-EU players, the federal professional-athlete route in 2026 requires age 16+, employment by a German club in competitive sport, confirmation by the national governing body and at least €50,700 gross a year (€4,225 a month). This is an immigration threshold, not a league salary scale.",
        ru: "Для игроков не из ЕС федеральный путь для профессиональных спортсменов в 2026 году требует: возраст от 16 лет, работа в немецком клубе в соревновательном спорте, подтверждение национальной федерации и не меньше 50 700 евро брутто в год (4 225 в месяц). Это миграционный порог, а не зарплатная шкала лиги."
      },
      sources: ["deAthleteVisa", "iihfTransfer2026"]
    },
    windows: [
      {
        kind: "official",
        label: { en: "IIHF transfer period (18+)", ru: "Период переходов IIHF (18+)" },
        dates: { en: "1 July 2026 – 15 February 2027", ru: "1 июля 2026 – 15 февраля 2027" },
        ref: "IIHF International Transfer Regulations 2026",
        source: "iihfTransfer2026"
      },
      {
        kind: "official",
        label: { en: "Last day to apply for a DEL2 licence", ru: "Последний день запроса лицензии DEL2" },
        dates: { en: "15 February 2027", ru: "15 февраля 2027" },
        ref: "Spielordnung DEL2, §26 (3)",
        source: "del2Rules"
      },
      {
        kind: "guide",
        label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" },
        dates: { en: "March to July; in-season clubs mostly replace an import who is injured or released", ru: "С марта по июль; по ходу сезона клубы в основном заменяют травмированного или отчисленного легионера" },
        ref: null,
        source: null
      }
    ],
    money: {
      status: "third_party",
      summary: {
        en: "There is no official DEL2 salary scale and EHA has no reliable sample of its own. The public figures are third-party ranges, shown as examples. For a non-EU player the €50,700 immigration threshold is a separate, hard requirement.",
        ru: "Официальной шкалы зарплат DEL2 нет, собственной надёжной выборки у EHA тоже. Публичные цифры — диапазоны сторонних сайтов, приведены как примеры. Для игрока не из ЕС порог 50 700 евро — отдельное обязательное требование."
      },
      examples: [
        {
          value: { en: "EUR 25,000–90,000", ru: "25 000–90 000 евро" },
          note: {
            en: "Third-party range for DEL2. The source does not say gross or net, per year or per season, or what is included.",
            ru: "Диапазон стороннего сайта для DEL2. Источник не уточняет брутто или нетто, за год или за сезон и что входит."
          },
          source: "phieSalaries",
          checkedAt: "2026-11-15"
        }
      ]
    },
    steps: {
      en: [
        "Check your status: citizenship (German citizenship changes everything), age category for U21/U24 licences, contract or release.",
        "Prepare a recent full game, role clips and verified statistics.",
        "Check your level with the calculator on this page. With four import places per game, aim for a role where you would be among the club's top imports.",
        "Shortlist clubs by position needs and how many of their six import licences are already used.",
        "Non-EU: check the €50,700 salary threshold and the governing-body confirmation before you agree terms.",
        "Get the offer in writing and finish the IIHF transfer and licence before 15 February."
      ],
      ru: [
        "Проверьте статус: гражданство (немецкое меняет всё), возрастная категория для лицензий U21/U24, контракт или отказ.",
        "Подготовьте свежую полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице. При четырёх местах на матч цельтесь в роль, где вы будете среди лучших легионеров клуба.",
        "Составьте список клубов по потребностям в позиции и по тому, сколько из шести лицензий иностранцев у них уже занято.",
        "Игроки не из ЕС: до согласования условий проверьте порог 50 700 евро и подтверждение федерации.",
        "Получите письменное предложение и завершите трансфер IIHF и лицензию до 15 февраля."
      ]
    },
    calcChecks: {
      en: ["At most 4 foreign players per game sheet, 6 foreign licences per club and season.", "EU passport does not count as German in DEL2.", "Licence deadline 15 February 2027; non-EU visa route needs €50,700 gross a year."],
      ru: ["Не больше 4 иностранцев в протоколе и 6 лицензий иностранцев на клуб за сезон.", "Паспорт ЕС в DEL2 не приравнивается к немецкому.", "Лицензии до 15 февраля 2027; виза для игрока не из ЕС — от 50 700 евро брутто в год."]
    },
    faq: [
      {
        q: { en: "How many imports can play in DEL2?", ru: "Сколько легионеров может играть в DEL2?" },
        a: {
          en: "At most four foreign players on the game sheet, and at most six foreign licences per club over the season (DEL2 Spielordnung, September 2026, §18).",
          ru: "Не больше четырёх иностранцев в протоколе матча и не больше шести лицензий иностранцев на клуб за сезон (Spielordnung DEL2, сентябрь 2026, §18)."
        }
      },
      {
        q: { en: "Does an EU passport count as German in DEL2?", ru: "Считается ли паспорт ЕС немецким в DEL2?" },
        a: {
          en: "No. The regulation defines a foreign player as one without German citizenship when the licence is issued and does not exempt EU citizens.",
          ru: "Нет. Регламент считает иностранцем любого игрока без немецкого гражданства на момент выдачи лицензии и граждан ЕС не исключает."
        }
      },
      {
        q: { en: "Until when can a DEL2 club sign a player?", ru: "До какого числа клуб DEL2 может заявить игрока?" },
        a: {
          en: "Licences cannot be applied for after 15 February. A player from abroad also needs the IIHF transfer, whose period for players 18+ ends on 15 February.",
          ru: "После 15 февраля лицензию запросить нельзя. Игроку из-за рубежа нужен ещё трансфер IIHF, период которого для игроков от 18 лет тоже заканчивается 15 февраля."
        }
      },
      {
        q: { en: "What salary does a non-EU player need for a German work visa?", ru: "Какая зарплата нужна игроку не из ЕС для немецкой рабочей визы?" },
        a: {
          en: "On the federal professional-athlete route, at least €50,700 gross a year in 2026, plus the other conditions listed on Make it in Germany. It is a visa threshold, not a DEL2 pay standard.",
          ru: "По федеральному пути для профессиональных спортсменов — не меньше 50 700 евро брутто в год в 2026 году плюс остальные условия с портала Make it in Germany. Это визовый порог, а не стандарт зарплат DEL2."
        }
      }
    ],
    missing: {
      en: ["A reliable DEL2 salary sample; only a third-party range is available.", "Which licence category applies to a dual citizen or a player with German heritage — confirm with the club.", "Whether the 14-club field and promotion/relegation format change for 2027/28."],
      ru: ["Надёжная выборка зарплат DEL2; есть только диапазон стороннего сайта.", "Какая категория лицензии у игрока с двойным гражданством или немецкими корнями — уточняйте у клуба.", "Изменятся ли состав из 14 клубов и формат повышения и вылета в 2027/28."]
    },
    sources: ["del2Rules", "del2Format", "deAthleteVisa", "iihfTransfer2026", "phieSalaries"]
  },

  {
    id: "de-oberliga",
    country: { code: "DE", en: "Germany", ru: "Германия" },
    data: { name: "Oberliga", country: "Germany" },
    names: {
      display: { en: "Oberliga (Germany)", ru: "Oberliga (Германия)" },
      short: "Oberliga",
      aliases: ["Oberliga Nord", "Oberliga Süd", "DEB-Oberliga", "German third division"],
      note: {
        en: "The Oberliga is run by the German Ice Hockey Federation (DEB) in two groups, Nord and Süd. It is the third national level and not the same competition as the regional Oberliga levels in other sports.",
        ru: "Oberliga проводит Федерация хоккея Германии (DEB) в двух группах — Nord и Süd. Это третий национальный уровень; не путайте с региональными «Оберлигами» в других видах спорта."
      }
    },
    paths: { en: "/leagues/germany-oberliga", ru: "/ligi/germaniya-oberliga" },
    guide: { en: "/guides/hockey-in-germany", ru: "/guides/hokkej-v-germanii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "Can an import play in the German Oberliga, and what does it pay?",
      ru: "Может ли легионер играть в немецкой Oberliga и сколько там платят?"
    },
    answer: {
      en: "Yes, but places are few: press reports since 2022 describe three import players per game and five import licences per club and season, and EHA has not seen the DEB's 2026/27 regulation itself. The league has 26 teams (12 North, 14 South) in 2026/27. Pay varies from club to club; a third-party source puts import packages at €15,000–40,000. For a non-EU player that matters: the federal athlete visa route needs at least €50,700 gross a year in 2026, which many Oberliga offers do not reach.",
      ru: "Да, но мест мало: по сообщениям прессы с 2022 года — три легионера на матч и пять лицензий легионеров на клуб за сезон; сам регламент DEB на 2026/27 EHA не видела. В сезоне 2026/27 в лиге 26 команд (12 на севере, 14 на юге). Условия зависят от клуба; сторонний сайт оценивает пакеты легионеров в 15 000–40 000 евро. Для игрока не из ЕС это важно: федеральный визовый путь для спортсменов требует не меньше 50 700 евро брутто в год в 2026 году, и многие предложения Oberliga до него не дотягивают."
    },
    fitFor: {
      en: "It fits an EU/EEA player who wants a senior role in a deep, well-supported league, a young import using it as a first season in Germany, or a veteran looking for a defined role with a community club. A non-EU player should first check whether the offer can meet the visa salary threshold.",
      ru: "Лига подходит игроку из ЕС/ЕЭЗ, которому нужна взрослая роль в плотной лиге с хорошей поддержкой, молодому легионеру для первого сезона в Германии или опытному игроку на понятную роль в клубе с сильной местной базой. Игроку не из ЕС сначала стоит проверить, может ли предложение соответствовать визовому порогу по зарплате."
    },
    position: {
      en: "The Oberliga is the third level, below DEL2. In 2026/27 the DEB licensed 26 teams: 12 in the North and 14 in the South, each group with its own schedule. Clubs range from semi-professional to near-professional budgets, so two offers with the same league name can be very different.",
      ru: "Oberliga — третий уровень, ниже DEL2. На сезон 2026/27 DEB допустила 26 команд: 12 на севере и 14 на юге, у каждой группы свой календарь. Бюджеты клубов — от полупрофессиональных до почти профессиональных, поэтому два предложения с одним названием лиги могут сильно различаться."
    },
    expectations: {
      en: [
        "Experience: a recent senior season or a strong final junior year; for an import, a clear scoring or defensive role.",
        "Age: press reports describe an over-23 limit on the game sheet that tightens towards 12 players by 2027/28, so clubs value younger players.",
        "Video: a full game and role clips; the North and South groups play different styles, ask which one the club is in.",
        "Package: ask what is paid in cash and what comes as housing, car or meals — that decides whether the offer works, especially for a visa."
      ],
      ru: [
        "Опыт: свежий взрослый сезон или сильный последний юниорский год; легионеру нужна понятная атакующая или оборонительная роль.",
        "Возраст: по сообщениям прессы, в протоколе действует лимит игроков старше 23 лет, который ужесточается до 12 к 2027/28, поэтому клубы ценят молодых.",
        "Видео: полная игра и нарезка по роли; у групп Nord и Süd разный стиль, уточните, где играет клуб.",
        "Пакет: спросите, что выплачивается деньгами, а что — жильём, машиной или питанием; от этого зависит, подходит ли предложение, особенно для визы."
      ]
    },
    rules: [
      {
        id: "de-oberliga-imports",
        season: "2022/23 onwards (press)",
        scope: "game_sheet",
        category: { en: "Import players (transfer-card players)", ru: "Легионеры (игроки с трансферной картой)" },
        value: {
          en: "Three import players per game and at most five import licences per club over a season, according to the DEB vice-president quoted in 2022 and repeated in 2024 reporting.",
          ru: "Три легионера на матч и не больше пяти лицензий легионеров на клуб за сезон — по словам вице-президента DEB в 2022 году, что подтверждали и публикации 2024 года."
        },
        exceptions: {
          en: "EHA has not seen the DEB's 2026/27 Oberliga regulation, so treat this as a press report and ask the club for the current wording. How EU citizens are counted is not confirmed here.",
          ru: "Регламент DEB для Oberliga на 2026/27 EHA не видела, поэтому считайте это сообщением прессы и уточняйте у клуба текущую формулировку. Как учитываются граждане ЕС, здесь не подтверждено."
        },
        ref: null,
        status: "press",
        source: "ehnImports2022",
        checkedAt: "2026-11-18"
      },
      {
        id: "de-oberliga-u23",
        season: "2024/25–2027/28 (press)",
        scope: "game_sheet",
        category: { en: "Players over 23", ru: "Игроки старше 23 лет" },
        value: {
          en: "Reported limit on over-23 players in a game: 14 in 2024/25, 13 in 2025/26, falling to 12 from 2027/28.",
          ru: "Сообщаемый лимит игроков старше 23 лет в матче: 14 в 2024/25, 13 в 2025/26, со снижением до 12 с 2027/28."
        },
        exceptions: {
          en: "The 2026/27 figure is not stated in the report EHA read.",
          ru: "Цифра для 2026/27 в прочитанном материале не названа."
        },
        ref: null,
        status: "press",
        source: "ehnU23_2024",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the DEB: a player licence for the Oberliga club, counted against the import limits, plus the IIHF international transfer for a player from another federation.",
        ru: "Спортивный допуск даёт DEB: лицензия игрока для клуба Oberliga с учётом лимита легионеров плюс международный трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU/EEA and Swiss citizens can live in Germany without a visa but must register their address. Other players need a visa and residence title for employment before they start.",
        ru: "Граждане ЕС/ЕЭЗ и Швейцарии живут в Германии без визы, но регистрируют адрес. Остальным до начала работы нужны виза и вид на жительство с целью трудоустройства."
      },
      work: {
        en: "For non-EU players, the federal professional-athlete route in 2026 requires age 16+, employment by a German club in competitive sport, governing-body confirmation and at least €50,700 gross a year. If an Oberliga offer is below that, ask the club which other legal route it intends to use before travelling.",
        ru: "Для игроков не из ЕС федеральный путь для профессиональных спортсменов в 2026 году требует: возраст от 16 лет, работа в немецком клубе в соревновательном спорте, подтверждение федерации и не меньше 50 700 евро брутто в год. Если предложение Oberliga ниже порога, до поездки спросите клуб, какой другой законный путь он планирует использовать."
      },
      sources: ["deAthleteVisa", "iihfTransfer2026"]
    },
    windows: [
      {
        kind: "official",
        label: { en: "IIHF transfer period (18+)", ru: "Период переходов IIHF (18+)" },
        dates: { en: "1 July 2026 – 15 February 2027", ru: "1 июля 2026 – 15 февраля 2027" },
        ref: "IIHF International Transfer Regulations 2026",
        source: "iihfTransfer2026"
      },
      {
        kind: "guide",
        label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" },
        dates: { en: "April to August; the DEB's own Oberliga registration deadline for 2026/27 is not confirmed here — ask the club", ru: "С апреля по август; собственный срок регистрации DEB для Oberliga 2026/27 здесь не подтверждён — уточняйте у клуба" },
        ref: null,
        source: null
      }
    ],
    money: {
      status: "third_party",
      summary: {
        en: "No official salary scale and no reliable EHA sample. Packages often combine a smaller salary with housing, a car and meals; ask for each item in writing. The third-party range below is an example only.",
        ru: "Официальной шкалы нет, надёжной выборки у EHA тоже. Пакет часто сочетает небольшую зарплату с жильём, машиной и питанием; просите каждый пункт письменно. Диапазон ниже — только пример."
      },
      examples: [
        {
          value: { en: "EUR 15,000–40,000 (imports)", ru: "15 000–40 000 евро (легионеры)" },
          note: {
            en: "Third-party range for Oberliga imports. The source does not say gross or net, per year or per season, or what is included.",
            ru: "Диапазон стороннего сайта для легионеров Oberliga. Источник не уточняет брутто или нетто, за год или за сезон и что входит."
          },
          source: "phieSalaries",
          checkedAt: "2026-11-15"
        }
      ]
    },
    steps: {
      en: [
        "Decide North or South: travel, style and clubs differ between the two groups.",
        "Check your status: citizenship, age (over-23 limit), contract or release.",
        "Prepare a full game, role clips and verified statistics.",
        "Check your level with the calculator on this page; compare with DEL2 if your profile is above range.",
        "Ask how many of the club's import places and licences are already taken before you discuss money.",
        "Non-EU: confirm the visa route and salary before travelling; get the full package in writing."
      ],
      ru: [
        "Выберите север или юг: поездки, стиль и клубы в группах различаются.",
        "Проверьте статус: гражданство, возраст (лимит старше 23 лет), контракт или отказ.",
        "Подготовьте полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице; если профиль выше, сравните с DEL2.",
        "До разговора о деньгах спросите, сколько мест и лицензий легионеров у клуба уже занято.",
        "Игрокам не из ЕС: до поездки подтвердите визовый путь и зарплату; весь пакет — письменно."
      ]
    },
    calcChecks: {
      en: ["Reported: 3 imports per game, 5 import licences per season (press, not the 2026/27 regulation).", "Over-23 limit on the game sheet favours younger players.", "Non-EU visa route needs €50,700 gross a year — check the offer first."],
      ru: ["По сообщениям прессы: 3 легионера на матч, 5 лицензий за сезон (не регламент 2026/27).", "Лимит игроков старше 23 лет в протоколе — плюс для молодых.", "Виза для игрока не из ЕС — от 50 700 евро брутто в год; сначала проверьте предложение."]
    },
    faq: [
      {
        q: { en: "How many imports can play in the Oberliga?", ru: "Сколько легионеров может играть в Oberliga?" },
        a: {
          en: "Press reports since 2022 describe three per game and five licences per club and season. EHA has not seen the 2026/27 DEB regulation, so confirm with the club.",
          ru: "По сообщениям прессы с 2022 года — три на матч и пять лицензий на клуб за сезон. Регламент DEB на 2026/27 EHA не видела, уточняйте у клуба."
        }
      },
      {
        q: { en: "How many teams play in the Oberliga in 2026/27?", ru: "Сколько команд в Oberliga в 2026/27?" },
        a: {
          en: "Twenty-six: twelve in the North and fourteen in the South (DEB licensing announcement, July 2026).",
          ru: "Двадцать шесть: двенадцать на севере и четырнадцать на юге (сообщение DEB о допуске, июль 2026)."
        }
      },
      {
        q: { en: "Can a non-EU player get a visa for an Oberliga contract?", ru: "Может ли игрок не из ЕС получить визу по контракту Oberliga?" },
        a: {
          en: "Only if a legal route applies. The federal athlete route needs at least €50,700 gross a year in 2026, which many Oberliga packages do not reach; ask the club which route it will use before you travel.",
          ru: "Только если подходит законный путь. Федеральный путь для спортсменов требует не меньше 50 700 евро брутто в год в 2026 году, а многие пакеты Oberliga до этого не дотягивают; до поездки спросите клуб, какой путь он будет использовать."
        }
      },
      {
        q: { en: "Is the Oberliga a good first step to DEL2?", ru: "Oberliga — хороший первый шаг к DEL2?" },
        a: {
          en: "It can be, if the player gets a real role and minutes. Production at this level is read together with age, role and video, not on its own.",
          ru: "Может быть, если у игрока реальная роль и минуты. Статистику на этом уровне оценивают вместе с возрастом, ролью и видео, а не саму по себе."
        }
      }
    ],
    missing: {
      en: ["The DEB's 2026/27 Oberliga regulation: import limit, how EU citizens count, over-23 figure for this season.", "The Oberliga registration deadline for 2026/27.", "A reliable salary sample."],
      ru: ["Регламент DEB для Oberliga 2026/27: лимит легионеров, учёт граждан ЕС, цифра «старше 23 лет» на этот сезон.", "Срок регистрации Oberliga на 2026/27.", "Надёжная выборка зарплат."]
    },
    sources: ["debOberligaTeams", "debOberligaSchedule", "ehnImports2022", "ehnU23_2024", "deAthleteVisa", "iihfTransfer2026", "phieSalaries"]
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
