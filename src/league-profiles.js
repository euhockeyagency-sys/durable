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
  },
  slmRules: {
    label: { en: "FFHG: Synerglace Ligue Magnus general regulations 2026/27", ru: "FFHG: общий регламент Synerglace Ligue Magnus 2026/27" },
    url: "https://www.hockeyfrance.com/wp-content/uploads/2026/09/12-Reglements-generaux-SLM-2026.27-VF.pdf"
  },
  slmFormat: {
    label: { en: "Ligue Magnus: season format 2026/27", ru: "Ligue Magnus: формат сезона 2026/27" },
    url: "https://liguemagnus.com/la-ligue-magnus/formule/"
  },
  pl1LigaRules: {
    label: { en: "PZHL: 1 Liga regulation 2026/27 (PDF)", ru: "PZHL: регламент 1 Ligi 2026/27 (PDF)" },
    url: "https://cdn.sportigio.com/spaces/173/uploads/ObrL4yd4mzFvGON0dykXw3aM0SVSMkj4LMDmMXZ7.pdf"
  },
  pl1LigaSchedule: {
    label: { en: "PZHL: 1 Liga schedule 2026/27", ru: "PZHL: календарь 1 Ligi 2026/27" },
    url: "https://polskihokej.eu/artykul/5117"
  },
  mjszSeason: {
    label: { en: "MJSZ: Erste Liga 2026/27 season information", ru: "MJSZ: информация о сезоне Erste Liga 2026/27" },
    url: "https://www.jegkorongszovetseg.hu/informaciok-az-erste-liga-uj-szezonjarol"
  },
  mjszTeams: {
    label: { en: "MJSZ: ten teams entered for 2026/27", ru: "MJSZ: десять команд на сезон 2026/27" },
    url: "https://www.jegkorongszovetseg.hu/tiz-csapat-nevezett-az-erste-liga-uj-idenyere"
  },
  huCard: {
    label: { en: "Hungarian immigration office: Hungarian Card residence permit", ru: "Миграционная служба Венгрии: вид на жительство Hungarian Card" },
    url: "https://oif.gov.hu/factsheets/residence-permit-for-hungarian-card"
  },
  fisgNofa: {
    label: { en: "FISG: competition rules 2026/27 (NOFA)", ru: "FISG: правила соревнований 2026/27 (NOFA)" },
    url: "https://static.fisg.it/wp-content/uploads/2026/07/07183941/NOFA_26_27_def-1.pdf"
  },
  itWork: {
    label: { en: "EU Immigration Portal: employed worker in Italy", ru: "Иммиграционный портал ЕС: работа по найму в Италии" },
    url: "https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal/employed-worker-italy_en"
  },
  icehlGameMode: {
    label: { en: "ICE Hockey League: game mode 2026/27", ru: "ICE Hockey League: формат сезона 2026/27" },
    url: "https://www.ice.hockey/en/league/game-mode"
  },
  laolaRules2022: {
    label: { en: "LAOLA1: the new ICE roster rules explained (2022, press)", ru: "LAOLA1: новые правила составов ICE (2022, пресса)" },
    url: "https://www.laola1.at/de/red/wintersport/eishockey/ice-hockey-league/ice-scout/ice---legionaere-und-nachwuchsspieler--neue-kaderregeln-erklaert/"
  },
  laolaRules2023: {
    label: { en: "LAOLA1: which ICE roster rules missed their aim (2024, press)", ru: "LAOLA1: какие правила составов ICE не сработали (2024, пресса)" },
    url: "https://www.laola1.at/de/red/wintersport/eishockey/ice-hockey-league/ice-scout/eishockey---ice--welche-kader-regelungen-ihre-wirkung-verfehlt-/"
  },
  hnEuProposal: {
    label: { en: "Hockey-News.info: KAC president proposes counting EU players as domestic (November 2026, press)", ru: "Hockey-News.info: президент KAC предлагает считать игроков ЕС местными (ноябрь 2026, пресса)" },
    url: "https://www.hockey-news.info/neue-kaderregel-koennte-icehl-auf-den-kopf-stellen-kac-praesident-schwaiger-macht-druck/"
  },
  ehaIcehlSalaries: {
    label: { en: "EHA: ICEHL and Alps Hockey League salaries (approximate EHA estimate)", ru: "EHA: зарплаты в ICEHL и Alps Hockey League (приблизительная оценка EHA)" },
    url: "https://eurohockeyagency.com/guides/icehl-and-alps-hockey-league-salaries"
  },
  nlWeisungen2627: {
    label: { en: "National League: Weisungen Spielbetrieb 2026/27 (2 September 2026)", ru: "National League: Weisungen Spielbetrieb 2026/27 (2 сентября 2026)" },
    url: "https://www.nationalleague.ch/media/bvinatrg/weisungen_spielbetrieb_nl_26_27_d.pdf"
  },
  nlDecision2021: {
    label: { en: "National League clubs' 2021 decisions on foreign players (copy on evz.ch)", ru: "Решения клубов National League 2021 года по иностранцам (копия на evz.ch)" },
    url: "https://www.evz.ch/news/medientyp/news/2021/06/national-league-faellt-wichtige-entscheide-fuer-die-zukunft/"
  },
  sihfClubs: {
    label: { en: "SIHF Game Center: National League clubs 2026/27", ru: "SIHF Game Center: клубы National League 2026/27" },
    url: "https://www.sihf.ch/de/game-center/on-boarding/"
  },
  semEu: {
    label: { en: "SEM: EU/EFTA citizens in Switzerland", ru: "SEM: граждане ЕС/ЕАСТ в Швейцарии" },
    url: "https://www.sem.admin.ch/sem/en/home/themen/fza_schweiz-eu-efta/eu-efta_buerger_schweiz.html"
  },
  semNonEu: {
    label: { en: "SEM: work for non-EU/EFTA nationals", ru: "SEM: работа для граждан стран вне ЕС/ЕАСТ" },
    url: "https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta-angehoerige.html"
  },
  mestisRoster: {
    label: { en: "Mestis: roster rules 2026/27 (22 April 2026)", ru: "Mestis: правила составов 2026/27 (22 апреля 2026)" },
    url: "https://mestis.fi/fi/uutiset/2026/04/22/mestiksen-kokoonpanosaannot-202627"
  },
  mestisFormat: {
    label: { en: "Mestis: competition format 2026/27", ru: "Mestis: формат сезона 2026/27" },
    url: "https://mestis.fi/fi/uutiset/2026/05/21/mestiksen-pelaamistapa-202627"
  },
  mestisSchedule: {
    label: { en: "Mestis: schedule 2026/27 published", ru: "Mestis: календарь сезона 2026/27" },
    url: "https://mestis.fi/fi/uutiset/2026/06/05/mestiksen-otteluohjelma-kaudelle-202627-on-julkaistu"
  },
  migriAthlete: {
    label: { en: "Migri: residence permit for an athlete, coach or trainer", ru: "Migri: вид на жительство для спортсмена или тренера" },
    url: "https://migri.fi/en/athlete-coach-or-trainer"
  },
  eihlOpeningRosters: {
    label: { en: "Elite League: opening rosters 2026/27", ru: "Elite League: стартовые составы 2026/27" },
    url: "https://www.eliteleague.co.uk/article/5504-opening-rosters-2026-27"
  },
  eihlRules2526: {
    label: { en: "Elite League: updated roster regulations for 2025/26", ru: "Elite League: правила составов на 2025/26" },
    url: "https://www.eliteleague.co.uk/article/4646-updated-roster-regulations-for-2025-26"
  },
  phnEihl2627: {
    label: { en: "Pro Hockey News: EIHL roster regulations updated for 2026/27 (league release, trade press)", ru: "Pro Hockey News: правила составов EIHL на 2026/27 (релиз лиги, отраслевая пресса)" },
    url: "https://prohockeynews.com/eihl-roster-regulations-updated-for-2026-27/"
  },
  eihlSeason: {
    label: { en: "Elite League: 50 days to go — 2026/27 season dates", ru: "Elite League: даты сезона 2026/27" },
    url: "https://www.eliteleague.co.uk/article/5442-50-days-to-go"
  },
  ukSportsVisa: {
    label: { en: "GOV.UK: International Sportsperson visa", ru: "GOV.UK: виза International Sportsperson" },
    url: "https://www.gov.uk/sportsperson-visa"
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
  },

  {
    id: "fr-ligue-magnus",
    country: { code: "FR", en: "France", ru: "Франция" },
    data: { name: "Ligue Magnus", country: "France" },
    names: {
      display: { en: "Synerglace Ligue Magnus", ru: "Synerglace Ligue Magnus" },
      short: "Ligue Magnus",
      aliases: ["Ligue Magnus", "SLM", "French top league", "Magnus"],
      note: {
        en: "Official name: Synerglace Ligue Magnus (SLM), France's top division, organised by the FFHG. Synerglace is the title sponsor; searches for “Ligue Magnus” mean this league.",
        ru: "Официальное название — Synerglace Ligue Magnus (SLM), высший дивизион Франции, организатор — FFHG. Synerglace — титульный спонсор; запрос «Ligue Magnus» — про эту лигу."
      }
    },
    paths: { en: "/leagues/france-ligue-magnus", ru: "/ligi/franciya-ligue-magnus" },
    guide: { en: "/guides/hockey-in-france", ru: "/guides/hokkej-vo-francii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "How many non-French players can a Ligue Magnus team dress?",
      ru: "Сколько игроков без французской подготовки может заявить команда Ligue Magnus?"
    },
    answer: {
      en: "France does not count passports but locally trained (JFL) players. A Ligue Magnus game sheet of 19–20 players needs at least 10 JFL, including a goaltender, and a 21-player sheet at least 11 — so up to 10 players without JFL status can dress. Each club must also have at least 14 skaters and 2 goaltenders under full-time professional contracts. Transfers must be filed by 31 December 2026; Ligue Magnus clubs then get two extra arrivals in January.",
      ru: "Во Франции считают не паспорта, а игроков местной подготовки (JFL). В протоколе Ligue Magnus на 19–20 игроков нужно не меньше 10 JFL, включая вратаря, на 21 игрока — не меньше 11, то есть без статуса JFL могут играть до 10 человек. У каждого клуба также должно быть не меньше 14 полевых и 2 вратарей на полных профессиональных контрактах. Переходы подаются до 31 декабря 2026 года, а в январе у клубов Ligue Magnus есть ещё два места для новичков."
    },
    fitFor: {
      en: "It fits a professional who can take a top-nine forward, top-four defence or starting-goaltender role in a 12-team top division. For a North American player that usually means a solid AHL/ECHL or strong European second-division record; clubs sign non-JFL players for impact, since each one uses one of about ten places.",
      ru: "Лига подходит профессионалу, готовому играть в первых трёх звеньях, первой четвёрке защиты или основным вратарём в высшем дивизионе из 12 команд. Для игрока из Северной Америки это обычно уверенный уровень AHL/ECHL или сильный сезон во втором дивизионе Европы; игроков без JFL берут как усиление, ведь каждый занимает одно из примерно десяти мест."
    },
    position: {
      en: "Ligue Magnus is France's top division, above Division 1. In 2026/27 it has 12 teams; the regular season runs from 15 September 2026 to 2 March 2027, playoffs from 8 March to 17 April 2027 and a relegation group from 9 March to 2 April. A team can dress up to 19 skaters and 2 goaltenders on weekdays and in the playoffs, 18 + 2 on Friday to Sunday.",
      ru: "Ligue Magnus — высший дивизион Франции, выше Division 1. В сезоне 2026/27 в ней 12 команд; регулярный чемпионат — с 15 сентября 2026 по 2 марта 2027, плей-офф — с 8 марта по 17 апреля 2027, турнир на выживание — с 9 марта по 2 апреля. В будние дни и в плей-офф в протоколе до 19 полевых и 2 вратарей, с пятницы по воскресенье — 18 + 2."
    },
    expectations: {
      en: [
        "Experience: recent professional seasons; a top-division role elsewhere or a leading role in a strong second division.",
        "Contract: Ligue Magnus requires full-time fixed-term employment contracts registered with the FFHG for the professional core of the roster.",
        "Video: a full game from last season plus role clips; clubs want to see special-teams value.",
        "Status: tell the club whether you may be JFL (training years in French clubs) — a JFL player does not use a non-JFL place."
      ],
      ru: [
        "Опыт: свежие профессиональные сезоны; роль в высшем дивизионе другой страны или ведущая роль в сильном втором дивизионе.",
        "Контракт: для профессионального ядра состава Ligue Magnus требует срочных трудовых договоров на полный день, зарегистрированных в FFHG.",
        "Видео: полная игра прошлого сезона и нарезка по роли; клубы хотят видеть пользу в спецбригадах.",
        "Статус: сообщите клубу, можете ли вы быть JFL (годы подготовки во французских клубах) — игрок JFL не занимает место игрока без JFL."
      ]
    },
    rules: [
      {
        id: "fr-lm-jfl",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Players without JFL status (any passport)", ru: "Игроки без статуса JFL (любой паспорт)" },
        value: {
          en: "JFL minimum on the game sheet, including at least one JFL goaltender: 10 for 19–20 players, 11 for 21, 9 for 17–18, 8 for 15–16, 7 for 13–14, 6 for 11–12. So at most 10 players without JFL status dress.",
          ru: "Минимум JFL в протоколе, включая хотя бы одного вратаря JFL: 10 при 19–20 игроках, 11 при 21, 9 при 17–18, 8 при 15–16, 7 при 13–14, 6 при 11–12. Значит, без статуса JFL играют не больше 10 человек."
        },
        exceptions: {
          en: "JFL is training history, not nationality: four full seasons licensed only for ice hockey in FFHG clubs up to the season of turning 20 (AS art. 8.1). No separate cap on foreign or non-EU players was found in the Ligue Magnus regulations.",
          ru: "JFL — это история подготовки, а не гражданство: четыре полных сезона с лицензией только по хоккею в клубах FFHG до сезона, в котором игроку исполняется 20 (AS ст. 8.1). Отдельного лимита на иностранцев или игроков не из ЕС в регламенте Ligue Magnus не найдено."
        },
        ref: "Règlement AS 2026/27 art. 8.3; Règlements SLM 2026/27 art. 4.2–4.3",
        status: "official",
        source: "slmRules",
        checkedAt: "2026-11-18"
      },
      {
        id: "fr-lm-professionals",
        season: "2026/27",
        scope: "registration",
        category: { en: "Professional roster core", ru: "Профессиональное ядро состава" },
        value: {
          en: "At least 14 skaters and 2 goaltenders under the professional-player status (full-time fixed-term employment contract approved by the FFHG), checked on the eve of the first game and on 31 January at 12:00.",
          ru: "Не меньше 14 полевых и 2 вратарей со статусом профессионального игрока (срочный трудовой договор на полный день, утверждённый FFHG); проверяется накануне первого матча и 31 января в 12:00."
        },
        exceptions: {
          en: "Contracts must state the gross salary; the regulation sets no minimum amount.",
          ru: "В контракте обязательно указывается зарплата брутто; минимальной суммы регламент не устанавливает."
        },
        ref: "Règlements SLM 2026/27 art. 3, 6, 36",
        status: "official",
        source: "slmRules",
        checkedAt: "2026-11-18"
      },
      {
        id: "fr-lm-transfers",
        season: "2026/27",
        scope: "transfer",
        category: { en: "Transfers into Ligue Magnus", ru: "Переходы в Ligue Magnus" },
        value: {
          en: "National and international transfers must be filed by 31 December 2026, 23:59. From 1 to 31 January each Ligue Magnus club may make two more arrivals (national or international). Qualification is possible from 1 July; a complete file must reach the FFHG at least 48 hours before the game.",
          ru: "Переходы внутри страны и международные подаются до 31 декабря 2026 года, 23:59. С 1 по 31 января каждый клуб Ligue Magnus может оформить ещё двух новичков. Допуск возможен с 1 июля; полный пакет документов должен поступить в FFHG минимум за 48 часов до матча."
        },
        exceptions: null,
        ref: "Règlement ALM 2026/27 art. 32.2, 33.3; Règlements SLM 2026/27 art. 17, 21",
        status: "official",
        source: "ffhgAlm",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the FFHG: licence and qualification for the Ligue Magnus club, the JFL count on each game sheet and the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск даёт FFHG: лицензия и допуск в клуб Ligue Magnus, учёт JFL в каждом протоколе и трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU, EEA and Swiss citizens can live in France without a visa. Others need a visa or residence document for the length of the contract.",
        ru: "Граждане ЕС, ЕЭЗ и Швейцарии живут во Франции без визы. Остальным нужна виза или вид на жительство на срок контракта."
      },
      work: {
        en: "For a player who is not an EU, EEA or Swiss citizen, the employer generally needs a work authorisation; the Ligue Magnus file includes, where applicable, the document allowing the player to work in France (SLM art. 40.1).",
        ru: "Для игрока без гражданства ЕС, ЕЭЗ или Швейцарии работодатель, как правило, оформляет разрешение на работу; в пакет документов Ligue Magnus при необходимости входит документ, разрешающий работать во Франции (SLM ст. 40.1)."
      },
      sources: ["frWork", "iihf"]
    },
    windows: [
      { kind: "official", label: { en: "Qualification opens", ru: "Начало допуска" }, dates: { en: "1 July 2026", ru: "1 июля 2026" }, ref: "Règlements SLM art. 17", source: "slmRules" },
      { kind: "official", label: { en: "Last day to file a transfer", ru: "Последний день подачи перехода" }, dates: { en: "31 December 2026, 23:59", ru: "31 декабря 2026, 23:59" }, ref: "Règlement ALM art. 32.2, 33.3", source: "ffhgAlm" },
      { kind: "official", label: { en: "January window (two arrivals per club)", ru: "Январское окно (два новичка на клуб)" }, dates: { en: "1–31 January 2027", ru: "1–31 января 2027" }, ref: "Règlement ALM art. 32.2", source: "ffhgAlm" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "March to July", ru: "С марта по июль" }, ref: null, source: null }
    ],
    money: {
      status: "no_sample",
      summary: {
        en: "Every professional contract must state the gross salary, but there is no official salary scale and EHA has no reliable sample, so we do not quote an average. Ask for gross and net pay, housing, car, flights and insurance separately.",
        ru: "В каждом профессиональном контракте указывается зарплата брутто, но официальной шкалы нет, а надёжной выборки у EHA тоже нет, поэтому среднюю цифру мы не называем. Уточняйте отдельно зарплату брутто и нетто, жильё, машину, перелёты и страховку."
      },
      examples: []
    },
    steps: {
      en: [
        "Check whether you can be JFL; if not, you compete for about ten non-JFL places.",
        "Prepare a full game, role clips and verified statistics.",
        "Check your level with the calculator on this page; Division 1 is the step below.",
        "Shortlist clubs by position needs; ask how many non-JFL places are already used.",
        "Get a full-time contract in writing with the gross salary stated.",
        "File the transfer by 31 December, or use one of the club's two January places."
      ],
      ru: [
        "Проверьте, можете ли вы быть JFL; если нет — вы претендуете на одно из примерно десяти мест без JFL.",
        "Подготовьте полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице; Division 1 — ступень ниже.",
        "Составьте список клубов по потребностям в позиции; спросите, сколько мест без JFL уже занято.",
        "Получите письменный контракт на полный день с указанной зарплатой брутто.",
        "Подайте переход до 31 декабря или займите одно из двух январских мест клуба."
      ]
    },
    calcChecks: {
      en: ["Up to 10 players without JFL status per game sheet.", "Transfers by 31 December 2026, plus two January arrivals per club.", "Non-EU: work authorisation in the qualification file."],
      ru: ["До 10 игроков без JFL в протоколе.", "Переходы до 31 декабря 2026 плюс два январских новичка на клуб.", "Игроки не из ЕС: разрешение на работу в пакете документов."]
    },
    faq: [
      { q: { en: "How many imports can play in Ligue Magnus?", ru: "Сколько легионеров может играть в Ligue Magnus?" }, a: { en: "France counts JFL, not passports: at least 10 JFL on a 19–20 player sheet (11 on 21), so up to 10 without JFL status.", ru: "Во Франции считают JFL, а не паспорта: не меньше 10 JFL в протоколе на 19–20 игроков (11 на 21), то есть до 10 без статуса JFL." } },
      { q: { en: "Does Ligue Magnus have a January transfer window?", ru: "Есть ли у Ligue Magnus январское окно?" }, a: { en: "Yes. After the 31 December deadline, each Ligue Magnus club may make two more arrivals from 1 to 31 January.", ru: "Да. После срока 31 декабря каждый клуб Ligue Magnus может оформить ещё двух новичков с 1 по 31 января." } },
      { q: { en: "Is there a minimum salary in Ligue Magnus?", ru: "Есть ли минимальная зарплата в Ligue Magnus?" }, a: { en: "The regulation requires full-time contracts that state the gross salary but sets no minimum amount.", ru: "Регламент требует контракты на полный день с указанием зарплаты брутто, но минимальной суммы не устанавливает." } },
      { q: { en: "How many teams play in 2026/27?", ru: "Сколько команд в сезоне 2026/27?" }, a: { en: "Twelve, in one group, with playoffs from 8 March 2027.", ru: "Двенадцать в одной группе, плей-офф с 8 марта 2027." } }
    ],
    missing: {
      en: ["Any salary sample or scale.", "Whether a separate document limits non-EU players (none found in the regulations read)."],
      ru: ["Выборка или шкала зарплат.", "Ограничивает ли игроков не из ЕС отдельный документ (в прочитанных регламентах такого нет)."]
    },
    sources: ["slmRules", "ffhgAs", "ffhgAlm", "slmFormat", "frWork", "iihf"]
  },

  {
    id: "pl-1-liga",
    country: { code: "PL", en: "Poland", ru: "Польша" },
    data: { name: "1 liga", country: "Poland" },
    names: {
      display: { en: "Polish 1 Liga", ru: "1 Liga (Польша)" },
      short: "1 Liga",
      aliases: ["I liga", "Polska 1 Liga", "MHL Poland", "Polish second division"],
      note: {
        en: "The 1 Liga (I Liga) is Poland's second level, organised by the PZHL itself, below TAURON Hokej Liga. Several teams are development or academy sides.",
        ru: "1 Liga (I Liga) — второй уровень Польши, её проводит сама PZHL, ниже TAURON Hokej Liga. Часть команд — молодёжные и академические."
      }
    },
    paths: { en: "/leagues/poland-1-liga-mhl", ru: "/ligi/polsha-1-liga-mhl" },
    guide: { en: "/guides/hockey-in-poland", ru: "/guides/hokkej-v-polshe" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "Can a foreign player play in the Polish 1 Liga in 2026/27?",
      ru: "Может ли иностранец играть в польской 1 Liga в 2026/27?"
    },
    answer: {
      en: "Yes, within a domestic quota: in 2026/27 at least 55% of skaters on the roster must be Polish (for example 11 of 20, 6 of 10) and one goaltender must hold a Polish passport. The quota tightens every season — 60% and two Polish goaltenders in 2027/28, 80% by 2030/31. Academic teams are exempt under their own conditions. The league is small: five active teams after one withdrew in August 2026.",
      ru: "Да, в пределах квоты: в 2026/27 не меньше 55% полевых в заявке должны быть поляками (например, 11 из 20, 6 из 10), а один вратарь — с польским паспортом. Квота ужесточается каждый сезон — 60% и два польских вратаря в 2027/28, 80% к 2030/31. Академические команды освобождены на своих условиях. Лига небольшая: пять активных команд после того, как одна снялась в августе 2026."
    },
    fitFor: {
      en: "It fits a young player who needs senior minutes and a development plan, or a player with Polish roots building a route to TAURON Hokej Liga. For a foreign veteran the quota and the small field make it a narrow market.",
      ru: "Лига подходит молодому игроку, которому нужны взрослые минуты и план развития, или игроку с польскими корнями, который строит путь в TAURON Hokej Liga. Для опытного иностранца квота и маленький состав лиги делают этот рынок узким."
    },
    position: {
      en: "The 1 Liga is the second level under TAURON Hokej Liga, organised by the PZHL. Six teams entered for 2026/27; UHT Sabers Oświęcim withdrew on 12 August, leaving five active. The regular season has six rounds and 30 games per team from 19–20 September 2026, followed by semifinals and a final.",
      ru: "1 Liga — второй уровень после TAURON Hokej Liga, организатор — PZHL. На сезон 2026/27 заявились шесть команд; UHT Sabers Oświęcim снялась 12 августа, активных осталось пять. Регулярный чемпионат — шесть кругов, 30 матчей на команду с 19–20 сентября 2026, затем полуфиналы и финал."
    },
    expectations: {
      en: [
        "Role: clubs want players who develop and play real minutes, not depth.",
        "Status: Polish citizenship changes everything because of the 55% quota.",
        "Video and statistics: a full game and recent stats are still expected even at this level.",
        "Conditions: ask about housing, registration and the link to a TAURON Hokej Liga club."
      ],
      ru: [
        "Роль: клубам нужны игроки, которые развиваются и играют реальные минуты, а не «на глубину».",
        "Статус: польское гражданство меняет всё из-за квоты 55%.",
        "Видео и статистика: полная игра и свежая статистика нужны и на этом уровне.",
        "Условия: спросите о жилье, регистрации и связи с клубом TAURON Hokej Liga."
      ]
    },
    rules: [
      {
        id: "pl-1liga-quota",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Polish players on the roster", ru: "Польские игроки в заявке" },
        value: {
          en: "At least 55% Polish skaters on the roster (e.g. 11 of 20, 6 of 10) and one goaltender with a Polish passport. Teams play with at least 10 skaters and 2 goaltenders.",
          ru: "Не меньше 55% польских полевых в заявке (например, 11 из 20, 6 из 10) и один вратарь с польским паспортом. Команды играют минимум с 10 полевыми и 2 вратарями."
        },
        exceptions: {
          en: "Rising quota: 60% and two Polish goaltenders in 2027/28, up to 80% and two Polish goaltenders in 2030/31. Academic teams are exempt from §7 if at least 10 players meet the listed nationality or training conditions.",
          ru: "Квота растёт: 60% и два польских вратаря в 2027/28, до 80% и двух польских вратарей в 2030/31. Академические команды освобождены от §7, если не меньше 10 игроков отвечают перечисленным условиям гражданства или подготовки."
        },
        ref: "Regulamin 1 Ligi 2026/27, §6, §7, §9",
        status: "official",
        source: "pl1LigaRules",
        checkedAt: "2026-11-18"
      },
      {
        id: "pl-1liga-deadline",
        season: "2026/27",
        scope: "transfer",
        category: { en: "Transfers and player approval", ru: "Переходы и утверждение игроков" },
        value: {
          en: "The regulation sets a transfer deadline of 31 January; the text prints “31.01.2026”, which appears to be a typo for 2027 — confirm with the PZHL. Players must be submitted for approval by Thursday 14:30 before each match weekend.",
          ru: "Регламент устанавливает срок переходов 31 января; в тексте напечатано «31.01.2026», что похоже на опечатку вместо 2027 — уточняйте в PZHL. Игроков нужно подать на утверждение до четверга 14:30 перед каждым игровым уикендом."
        },
        exceptions: null,
        ref: "Regulamin 1 Ligi 2026/27, §7, §8",
        status: "official",
        source: "pl1LigaRules",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the PZHL: player approval for the 1 Liga club, the Polish quota on each roster and the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск даёт PZHL: утверждение игрока для клуба 1 Ligi, учёт польской квоты в заявке и трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU, EEA and Swiss citizens can live in Poland without a visa. Others need a visa or a temporary residence permit.",
        ru: "Граждане ЕС, ЕЭЗ и Швейцарии живут в Польше без визы. Остальным нужна виза или разрешение на временное пребывание."
      },
      work: {
        en: "EU, EEA and Swiss citizens and Karta Polaka holders do not need a work permit. Others generally do, applied for by the employer through praca.gov.pl, unless another exemption applies.",
        ru: "Гражданам ЕС, ЕЭЗ и Швейцарии и владельцам Карты поляка разрешение на работу не нужно. Остальным оно, как правило, требуется, заявление подаёт работодатель через praca.gov.pl, если нет другого исключения."
      },
      sources: ["plWork", "euPortal", "iihf"]
    },
    windows: [
      { kind: "official", label: { en: "Transfer deadline (regulation)", ru: "Срок переходов (регламент)" }, dates: { en: "31 January (text says 31.01.2026; confirm the year)", ru: "31 января (в тексте 31.01.2026; уточняйте год)" }, ref: "Regulamin 1 Ligi §7", source: "pl1LigaRules" },
      { kind: "official", label: { en: "Weekly player approval", ru: "Еженедельное утверждение игроков" }, dates: { en: "By Thursday 14:30 before the match weekend", ru: "До четверга 14:30 перед игровым уикендом" }, ref: "Regulamin 1 Ligi §8", source: "pl1LigaRules" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "May to August", ru: "С мая по август" }, ref: null, source: null }
    ],
    money: {
      status: "no_sample",
      summary: {
        en: "No official scale and no reliable sample. At this level many offers are development packages (housing, meals, equipment) rather than salaries; ask for each item in writing and who pays registration and visa costs.",
        ru: "Официальной шкалы и надёжной выборки нет. На этом уровне многие предложения — пакеты развития (жильё, питание, экипировка), а не зарплата; просите каждый пункт письменно и уточняйте, кто платит за регистрацию и визу."
      },
      examples: []
    },
    steps: {
      en: [
        "Check your status: Polish citizenship or Karta Polaka, age, contract.",
        "Prepare a full game and recent statistics.",
        "Check your level with the calculator on this page; compare with TAURON Hokej Liga.",
        "Ask the club how many non-Polish places it still has under the 55% quota.",
        "Get housing, registration and any link to a top-league club in writing.",
        "Complete the transfer before the deadline and the Thursday approval cut-off."
      ],
      ru: [
        "Проверьте статус: польское гражданство или Карта поляка, возраст, контракт.",
        "Подготовьте полную игру и свежую статистику.",
        "Оцените уровень в калькуляторе на этой странице; сравните с TAURON Hokej Liga.",
        "Спросите клуб, сколько мест для не-поляков у него осталось в рамках квоты 55%.",
        "Зафиксируйте письменно жильё, регистрацию и связь с клубом высшей лиги.",
        "Завершите переход до срока и до четверговой подачи на утверждение."
      ]
    },
    calcChecks: {
      en: ["At least 55% Polish skaters and one Polish goaltender per roster (2026/27).", "Quota rises to 60% in 2027/28.", "Transfer deadline 31 January — confirm the year with the PZHL."],
      ru: ["Не меньше 55% польских полевых и один польский вратарь в заявке (2026/27).", "Квота вырастет до 60% в 2027/28.", "Срок переходов 31 января — год уточняйте в PZHL."]
    },
    faq: [
      { q: { en: "How many foreigners can play in the Polish 1 Liga?", ru: "Сколько иностранцев может играть в польской 1 Liga?" }, a: { en: "At least 55% of skaters must be Polish and one goaltender must hold a Polish passport in 2026/27, so on a 20-player roster up to 9 skaters can be non-Polish.", ru: "В 2026/27 не меньше 55% полевых должны быть поляками, а один вратарь — с польским паспортом, поэтому в заявке из 20 игроков не-поляков среди полевых может быть до 9." } },
      { q: { en: "Will the quota change?", ru: "Изменится ли квота?" }, a: { en: "Yes: 60% and two Polish goaltenders in 2027/28, rising to 80% by 2030/31.", ru: "Да: 60% и два польских вратаря в 2027/28, до 80% к 2030/31." } },
      { q: { en: "How many teams play in 2026/27?", ru: "Сколько команд в 2026/27?" }, a: { en: "Five active teams; six entered but UHT Sabers Oświęcim withdrew on 12 August 2026.", ru: "Пять активных команд; заявились шесть, но UHT Sabers Oświęcim снялась 12 августа 2026." } }
    ],
    missing: {
      en: ["The correct year of the transfer deadline (the regulation prints 31.01.2026).", "Whether Karta Polaka holders count as Polish for the 1 Liga quota (the text says passport for goaltenders).", "Any salary sample."],
      ru: ["Правильный год срока переходов (в регламенте напечатано 31.01.2026).", "Считаются ли владельцы Карты поляка поляками для квоты 1 Ligi (для вратарей в тексте указан паспорт).", "Выборка зарплат."]
    },
    sources: ["pl1LigaRules", "pl1LigaSchedule", "plWork", "euPortal", "iihf"]
  },

  {
    id: "hu-erste-liga",
    country: { code: "HU", en: "Hungary", ru: "Венгрия" },
    data: { name: "Erste Liga", country: "Hungary" },
    names: {
      display: { en: "Erste Liga", ru: "Erste Liga" },
      short: "Erste Liga",
      aliases: ["Erste Liga Hungary", "Erste Liga Romania", "MOL Liga"],
      note: {
        en: "Erste Liga is a cross-border league of Hungarian and Romanian clubs run by the Hungarian federation (MJSZ). It is not the same competition as the national Andersen Liga.",
        ru: "Erste Liga — международная лига венгерских и румынских клубов под управлением Федерации хоккея Венгрии (MJSZ). Это не то же соревнование, что национальная Andersen Liga."
      }
    },
    paths: { en: "/leagues/hungary-erste-liga", ru: "/ligi/vengriya-erste-liga" },
    guide: { en: "/guides/hockey-in-hungary", ru: "/guides/hokkej-v-vengrii" },
    season: "2026/27",
    checkedAt: "2026-10-02",
    question: {
      en: "What is the import limit in the Erste Liga?",
      ru: "Какой лимит легионеров в Erste Liga?"
    },
    answer: {
      en: "The published 2026/27 rules allow at most five foreign players in a match and eleven registered foreign players over the season. Ten clubs from Hungary and Romania play; the season started on 18 September 2026 and the top eight reach the playoffs from 12 March 2027. Immigration follows the country of the club: Hungarian rules for Hungarian clubs, Romanian rules for Romanian clubs.",
      ru: "Опубликованные правила 2026/27 допускают не больше пяти иностранцев в матче и одиннадцати зарегистрированных иностранцев за сезон. Играют десять клубов из Венгрии и Румынии; сезон начался 18 сентября 2026 года, восемь лучших выходят в плей-офф с 12 марта 2027. Миграционные правила зависят от страны клуба: венгерские для венгерских клубов, румынские — для румынских."
    },
    fitFor: {
      en: "It fits an import who wants a clear role with five import places per game: a scoring forward, a puck-moving defender or a starting goaltender. With eleven season registrations, clubs do replace imports during the season, so in-season openings are more common than in tighter leagues.",
      ru: "Лига подходит легионеру, которому нужна понятная роль при пяти местах на матч: результативному нападающему, защитнику с первым пасом или основному вратарю. При одиннадцати регистрациях за сезон клубы меняют легионеров по ходу сезона, поэтому вакансии в сезоне здесь чаще, чем в лигах с жёстким лимитом."
    },
    position: {
      en: "Erste Liga is a cross-border senior competition of Hungarian and Romanian clubs within the MJSZ structure, alongside the ICE Hockey League and the national Andersen Liga. In 2026/27 the MJSZ announced ten clubs; each plays every opponent four times, and the top eight advance to the playoffs starting on 12 March 2027.",
      ru: "Erste Liga — международное взрослое соревнование венгерских и румынских клубов в структуре MJSZ, наряду с ICE Hockey League и национальной Andersen Liga. На 2026/27 MJSZ объявила десять клубов; каждый играет с каждым четыре раза, восемь лучших выходят в плей-офф с 12 марта 2027."
    },
    expectations: {
      en: [
        "Experience: senior seasons at a comparable second-division level or a top division of a smaller country.",
        "Role: imports are expected to lead; show special-teams value.",
        "Video: a recent full game and role clips.",
        "Location: ask whether the club is in Hungary or Romania — it changes the visa and work route."
      ],
      ru: [
        "Опыт: взрослые сезоны в сопоставимом втором дивизионе или высшем дивизионе небольшой страны.",
        "Роль: от легионеров ждут лидерства; покажите пользу в спецбригадах.",
        "Видео: свежая полная игра и нарезка по роли.",
        "Страна: уточните, где находится клуб — в Венгрии или Румынии; от этого зависит виза и право на работу."
      ]
    },
    rules: [
      {
        id: "hu-erste-imports",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Foreign players", ru: "Иностранные игроки" },
        value: {
          en: "At most five foreign players in a match.",
          ru: "Не больше пяти иностранцев в матче."
        },
        exceptions: {
          en: "How a dual citizen or a player with Hungarian or Romanian roots is classified is decided by the federation; confirm before signing.",
          ru: "Как классифицируется игрок с двойным гражданством или венгерскими/румынскими корнями, решает федерация; уточняйте до подписания."
        },
        ref: "MJSZ, Erste Liga 2026/27 season information",
        status: "official",
        source: "mjszSeason",
        checkedAt: "2026-10-02"
      },
      {
        id: "hu-erste-registrations",
        season: "2026/27",
        scope: "registration",
        category: { en: "Foreign registrations per season", ru: "Регистрации иностранцев за сезон" },
        value: {
          en: "At most eleven foreign players registered by a club during the season.",
          ru: "Не больше одиннадцати зарегистрированных иностранцев на клуб за сезон."
        },
        exceptions: null,
        ref: "MJSZ, Erste Liga 2026/27 season information",
        status: "official",
        source: "mjszSeason",
        checkedAt: "2026-10-02"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the MJSZ (and the Romanian federation for Romanian clubs): registration within the eleven-player season limit and the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск даёт MJSZ (и румынская федерация для румынских клубов): регистрация в пределах одиннадцати иностранцев за сезон и трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU, EEA and Swiss citizens can live in Hungary or Romania without a visa. Others need a residence permit of the club's country.",
        ru: "Граждане ЕС, ЕЭЗ и Швейцарии живут в Венгрии или Румынии без визы. Остальным нужен вид на жительство страны клуба."
      },
      work: {
        en: "For a Hungary-based club, the official framework includes the Hungarian Card route for a professional sportsperson doing genuine paid work, subject to its conditions. Romanian clubs follow Romanian immigration law.",
        ru: "Для клуба в Венгрии официальная система предусматривает путь Hungarian Card для профессионального спортсмена на реальной оплачиваемой работе — при соблюдении условий. Клубы в Румынии следуют румынскому миграционному праву."
      },
      sources: ["huCard", "iihf"]
    },
    windows: [
      { kind: "official", label: { en: "Season", ru: "Сезон" }, dates: { en: "From 18 September 2026; playoffs from 12 March 2027", ru: "С 18 сентября 2026; плей-офф с 12 марта 2027" }, ref: "MJSZ season announcement", source: "mjszSeason" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "April to August; replacements during the season within the eleven registrations", ru: "С апреля по август; замены по ходу сезона в пределах одиннадцати регистраций" }, ref: null, source: null }
    ],
    money: {
      status: "third_party",
      summary: {
        en: "No official scale and no reliable EHA sample. The third-party range below is an example only; ask for gross and net, housing, car and flights separately.",
        ru: "Официальной шкалы и надёжной выборки у EHA нет. Диапазон ниже — только пример; уточняйте отдельно брутто и нетто, жильё, машину и перелёты."
      },
      examples: [
        {
          value: { en: "EUR 15,000–50,000", ru: "15 000–50 000 евро" },
          note: { en: "Third-party range for Erste Liga (Hungary and Romania). The source does not say gross or net, per year or per season, or what is included.", ru: "Диапазон стороннего сайта для Erste Liga (Венгрия и Румыния). Источник не уточняет брутто или нетто, за год или за сезон и что входит." },
          source: "phieSalaries",
          checkedAt: "2026-11-15"
        }
      ]
    },
    steps: {
      en: [
        "Check whether the target club is in Hungary or Romania.",
        "Prepare a full game, role clips and verified statistics.",
        "Check your level with the calculator on this page.",
        "Ask how many of the five game places and eleven season registrations are used.",
        "Confirm the residence and work route for the club's country before travel.",
        "Get the full package in writing."
      ],
      ru: [
        "Уточните, где находится клуб — в Венгрии или Румынии.",
        "Подготовьте полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице.",
        "Спросите, сколько из пяти мест на матч и одиннадцати регистраций за сезон уже занято.",
        "До поездки подтвердите путь к проживанию и работе в стране клуба.",
        "Получите весь пакет условий письменно."
      ]
    },
    calcChecks: {
      en: ["At most 5 foreign players per match, 11 registered per season.", "Visa and work route depend on whether the club is in Hungary or Romania."],
      ru: ["Не больше 5 иностранцев в матче и 11 зарегистрированных за сезон.", "Виза и право на работу зависят от страны клуба — Венгрия или Румыния."]
    },
    faq: [
      { q: { en: "How many imports can play in the Erste Liga?", ru: "Сколько легионеров может играть в Erste Liga?" }, a: { en: "At most five in a match and eleven registered per club over the 2026/27 season (MJSZ).", ru: "Не больше пяти в матче и одиннадцати зарегистрированных на клуб за сезон 2026/27 (MJSZ)." } },
      { q: { en: "Is the Erste Liga the Hungarian national championship?", ru: "Erste Liga — национальный чемпионат Венгрии?" }, a: { en: "No. It is a cross-border league of Hungarian and Romanian clubs; the national senior championship is the Andersen Liga, and some Hungarian clubs play in the ICE Hockey League.", ru: "Нет. Это международная лига венгерских и румынских клубов; национальный взрослый чемпионат — Andersen Liga, а часть венгерских клубов играет в ICE Hockey League." } },
      { q: { en: "How many clubs play in 2026/27?", ru: "Сколько клубов в 2026/27?" }, a: { en: "Ten, according to the MJSZ.", ru: "Десять, по данным MJSZ." } }
    ],
    missing: {
      en: ["The registration deadline for foreign players in 2026/27.", "A reliable salary sample."],
      ru: ["Срок регистрации иностранцев в сезоне 2026/27.", "Надёжная выборка зарплат."]
    },
    sources: ["mjszSeason", "mjszTeams", "huCard", "iihf", "phieSalaries"]
  },

  {
    id: "it-ihl",
    country: { code: "IT", en: "Italy", ru: "Италия" },
    data: { name: "Italian Hockey League", country: "Italy" },
    names: {
      display: { en: "Italian Hockey League (IHL)", ru: "Italian Hockey League (IHL)" },
      short: "Italian Hockey League",
      aliases: ["IHL Italy", "Serie B Italy", "Italian second division"],
      note: {
        en: "The Italian Hockey League is the national league below IHL Serie A, run by the Italian federation FISG. Do not confuse it with the International Hockey League in Serbia and Croatia.",
        ru: "Italian Hockey League — национальная лига ниже IHL Serie A под управлением федерации FISG. Не путайте с International Hockey League в Сербии и Хорватии."
      }
    },
    paths: { en: "/leagues/italy-italian-hockey-league", ru: "/ligi/italiya-italian-hockey-league" },
    guide: { en: "/guides/hockey-in-italy", ru: "/guides/hokkej-v-italii" },
    season: "2026/27",
    checkedAt: "2026-10-02",
    question: {
      en: "How many foreign players can an Italian Hockey League team use?",
      ru: "Сколько иностранцев может использовать команда Italian Hockey League?"
    },
    answer: {
      en: "Italy works with player categories, not a simple passport count. In 2026/27 an Italian Hockey League team may use at most three Category B players, and only Category A players may play in goal. The published transfer and registration deadline is 11 January 2027. Twelve teams play; FISG decides each player's category before registration.",
      ru: "В Италии работают категории игроков, а не простой подсчёт паспортов. В 2026/27 команда Italian Hockey League может использовать не больше трёх игроков категории B, а вратарями могут быть только игроки категории A. Опубликованный срок переходов и регистрации — 11 января 2027. Играют двенадцать команд; категорию каждого игрока до регистрации определяет FISG."
    },
    fitFor: {
      en: "It fits a player with Italian eligibility (Category A) looking for senior minutes, or an import strong enough to be one of only three Category B players. A foreign goaltender cannot play here unless he is Category A.",
      ru: "Лига подходит игроку с итальянским статусом (категория A), которому нужны взрослые минуты, или легионеру, достаточно сильному, чтобы быть одним из всего трёх игроков категории B. Иностранный вратарь здесь играть не может, если он не категории A."
    },
    position: {
      en: "The Italian Hockey League is the national level below IHL Serie A (whose clubs also play in the Alps Hockey League). FISG lists 12 teams in 2026/27; the first phase starts on 19 September 2026, then teams split into Master and Qualification rounds, followed by an eight-team playoff.",
      ru: "Italian Hockey League — национальный уровень ниже IHL Serie A (клубы которой играют ещё и в Alps Hockey League). В сезоне 2026/27 FISG указывает 12 команд; первая фаза начинается 19 сентября 2026, затем команды делятся на группы Master и Qualification, после — плей-офф восьми команд."
    },
    expectations: {
      en: [
        "Status first: ask FISG, through the club, which category you are before anything else.",
        "Role: a Category B import is expected to be among the team's best players.",
        "Video: a full game and role clips.",
        "Goaltenders: only Category A goaltenders are allowed."
      ],
      ru: [
        "Сначала статус: через клуб узнайте у FISG, к какой категории вы относитесь.",
        "Роль: от легионера категории B ждут, что он будет среди лучших игроков команды.",
        "Видео: полная игра и нарезка по роли.",
        "Вратари: допускаются только вратари категории A."
      ]
    },
    rules: [
      {
        id: "it-ihl-category-b",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Category B players", ru: "Игроки категории B" },
        value: {
          en: "At most three Category B players per team; only Category A players may be used as goaltenders.",
          ru: "Не больше трёх игроков категории B на команду; вратарями могут быть только игроки категории A."
        },
        exceptions: {
          en: "The category is a FISG classification, not simply nationality; FISG and the club confirm it before registration.",
          ru: "Категория — это классификация FISG, а не просто гражданство; FISG и клуб подтверждают её до регистрации."
        },
        ref: "FISG NOFA 2026/27",
        status: "official",
        source: "fisgNofa",
        checkedAt: "2026-10-02"
      },
      {
        id: "it-ihl-deadline",
        season: "2026/27",
        scope: "transfer",
        category: { en: "Transfer and registration deadline", ru: "Срок переходов и регистрации" },
        value: {
          en: "11 January 2027.",
          ru: "11 января 2027."
        },
        exceptions: null,
        ref: "FISG NOFA 2026/27",
        status: "official",
        source: "fisgNofa",
        checkedAt: "2026-10-02"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from FISG: the player's category, registration before 11 January 2027 and the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск даёт FISG: категория игрока, регистрация до 11 января 2027 и трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU, EEA and Swiss citizens can live in Italy without a visa. Others need a visa and residence permit for the purpose of employment.",
        ru: "Граждане ЕС, ЕЭЗ и Швейцарии живут в Италии без визы. Остальным нужны виза и вид на жительство с целью работы."
      },
      work: {
        en: "A non-EU player needs authorisation to work in Italy before starting; the EU Immigration Portal describes the employed-worker route. Ask the club which route it will use for a sports contract.",
        ru: "Игроку не из ЕС до начала работы нужно разрешение на работу в Италии; путь работника по найму описан на иммиграционном портале ЕС. Спросите клуб, какой путь он использует для спортивного контракта."
      },
      sources: ["itWork", "iihf"]
    },
    windows: [
      { kind: "official", label: { en: "Season start", ru: "Начало сезона" }, dates: { en: "19 September 2026", ru: "19 сентября 2026" }, ref: "FISG NOFA 2026/27", source: "fisgNofa" },
      { kind: "official", label: { en: "Transfer and registration deadline", ru: "Срок переходов и регистрации" }, dates: { en: "11 January 2027", ru: "11 января 2027" }, ref: "FISG NOFA 2026/27", source: "fisgNofa" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "May to August", ru: "С мая по август" }, ref: null, source: null }
    ],
    money: {
      status: "no_sample",
      summary: {
        en: "No official scale and no reliable sample. Ask for gross and net pay, housing, car, meals and insurance separately before signing.",
        ru: "Официальной шкалы и надёжной выборки нет. До подписания уточняйте отдельно зарплату брутто и нетто, жильё, машину, питание и страховку."
      },
      examples: []
    },
    steps: {
      en: [
        "Find out your FISG category through the club first.",
        "Prepare a full game, role clips and verified statistics.",
        "Check your level with the calculator on this page.",
        "If you are Category B, ask how many of the three places are taken.",
        "Confirm the work route for a non-EU player before travel.",
        "Register before 11 January 2027."
      ],
      ru: [
        "Сначала через клуб узнайте свою категорию FISG.",
        "Подготовьте полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице.",
        "Если вы категории B, спросите, сколько из трёх мест занято.",
        "До поездки подтвердите путь к работе для игрока не из ЕС.",
        "Зарегистрируйтесь до 11 января 2027."
      ]
    },
    calcChecks: {
      en: ["At most 3 Category B players; goaltenders must be Category A.", "Transfer and registration deadline 11 January 2027."],
      ru: ["Не больше 3 игроков категории B; вратари — только категории A.", "Срок переходов и регистрации — 11 января 2027."]
    },
    faq: [
      { q: { en: "What is the import limit in the Italian Hockey League?", ru: "Какой лимит легионеров в Italian Hockey League?" }, a: { en: "At most three Category B players per team in 2026/27, and only Category A goaltenders (FISG NOFA).", ru: "Не больше трёх игроков категории B на команду в 2026/27, вратари — только категории A (FISG NOFA)." } },
      { q: { en: "Can a foreign goaltender play in the Italian Hockey League?", ru: "Может ли иностранный вратарь играть в Italian Hockey League?" }, a: { en: "Only if FISG classifies him as Category A.", ru: "Только если FISG относит его к категории A." } },
      { q: { en: "When is the registration deadline?", ru: "Когда срок регистрации?" }, a: { en: "11 January 2027.", ru: "11 января 2027." } }
    ],
    missing: {
      en: ["The exact FISG definitions of Category A and B for 2026/27 (summarised, not quoted here).", "A reliable salary sample."],
      ru: ["Точные определения категорий A и B по FISG на 2026/27 (здесь в пересказе, без цитаты).", "Надёжная выборка зарплат."]
    },
    sources: ["fisgNofa", "itWork", "iihf"]
  },

  {
    id: "at-icehl",
    country: { code: "AT", en: "Austria", ru: "Австрия" },
    data: { name: "ICE Hockey League", country: "Austria" },
    names: {
      display: { en: "ICE Hockey League (ICEHL)", ru: "ICE Hockey League (ICEHL)" },
      short: "ICEHL",
      aliases: ["ICEHL", "win2day ICE Hockey League", "ICE", "EBEL", "Austrian Hockey League"],
      note: {
        en: "Official name: win2day ICE Hockey League (ICEHL), a multinational top league with clubs from Austria, Italy, Slovenia and Hungary. win2day is the title sponsor; the league was formerly known as the EBEL.",
        ru: "Официальное название — win2day ICE Hockey League (ICEHL), международная высшая лига с клубами из Австрии, Италии, Словении и Венгрии. win2day — титульный спонсор; раньше лига называлась EBEL."
      }
    },
    paths: { en: "/leagues/austria-ice-hockey-league", ru: "/ligi/avstriya-ice-hockey-league" },
    guide: { en: "/guides/hockey-in-austria", ru: "/guides/hokkej-v-avstrii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "What do ICEHL players earn, and how many imports can a team dress?",
      ru: "Сколько зарабатывают в ICEHL и сколько легионеров может заявить команда?"
    },
    answer: {
      en: "By EHA's approximate estimate an ICEHL player earns about €35,000–150,000+ per season; there is no official salary scale, so the contract decides. Imports: under the roster rule introduced in 2022, a 22-player game sheet must include at least 12 domestic players (two of them under 24), which leaves up to 10 places for imports, and a club may register at most 26 players over 24 in a season. A step-down to 8 imports per game from 2026/27 was announced in 2022; EHA has not seen a 2026/27 league document confirming whether it applies, so ask the club for the current number.",
      ru: "По приблизительной оценке EHA, игрок ICEHL получает около 35 000–150 000+ евро за сезон; официальной шкалы нет, сумму определяет контракт. Легионеры: по правилу, введённому в 2022 году, в протоколе на 22 игрока должно быть не меньше 12 местных игроков (двое из них моложе 24 лет), то есть легионерам остаётся до 10 мест, а за сезон клуб может зарегистрировать не больше 26 игроков старше 24 лет. В 2022 году объявляли снижение до 8 легионеров на матч с сезона 2026/27; документа лиги на 2026/27, который бы это подтверждал, EHA не видела — уточняйте текущее число у клуба."
    },
    fitFor: {
      en: "It fits an import who can play a top-six forward, top-four defence or starting-goaltender role in a 14-team professional league. For a North American player that usually means a solid AHL or strong ECHL record; for a European, a regular role in a top division or a leading role in a strong second division. Younger players often get more from the Alps Hockey League's ice time than from a fourth-line ICEHL spot.",
      ru: "Лига подходит легионеру, который может играть в первых двух звеньях, первой четвёрке защиты или основным вратарём в профессиональной лиге из 14 команд. Для игрока из Северной Америки это обычно уверенный уровень AHL или сильный ECHL; для европейца — регулярная роль в высшем дивизионе или ведущая во втором сильном. Молодым игрокам игровое время в Alps Hockey League часто полезнее, чем место в четвёртом звене ICEHL."
    },
    position: {
      en: "ICEHL is the top level for its Austrian clubs and a cross-border league with teams from Italy, Slovenia and Hungary. In 2026/27 the 14 clubs play each opponent four times — 52 games each — from 18 September 2026; the top six go straight to the quarterfinals and places 7–10 play best-of-three pre-playoffs. Quarterfinals, semifinals and the final are best-of-seven.",
      ru: "ICEHL — высший уровень для австрийских клубов и международная лига с командами из Италии, Словении и Венгрии. В сезоне 2026/27 14 клубов играют друг с другом по четыре раза — по 52 матча — с 18 сентября 2026; шесть лучших сразу выходят в четвертьфинал, места 7–10 играют предварительный раунд до двух побед. Четвертьфиналы, полуфиналы и финал — до четырёх побед."
    },
    expectations: {
      en: [
        "Experience: recent professional seasons; clubs compare the level where the points were scored, not the total.",
        "Role: with about ten import places, an import is signed to play in the top lines or on special teams.",
        "Video: a recent full game plus role clips.",
        "Status: say whether you may count as domestic for a club's country (citizenship, dual citizenship, years played there) — it decides whether you use an import place."
      ],
      ru: [
        "Опыт: свежие профессиональные сезоны; клубы сравнивают уровень, где набраны очки, а не их сумму.",
        "Роль: при примерно десяти местах легионеров иностранца берут в первые звенья или спецбригады.",
        "Видео: свежая полная игра и нарезка по роли.",
        "Статус: сообщите, можете ли вы считаться местным для страны клуба (гражданство, двойное гражданство, годы игры там) — от этого зависит, займёте ли вы место легионера."
      ]
    },
    rules: [
      {
        id: "at-icehl-gamesheet",
        season: "Rule introduced 2022/23 (press)",
        scope: "game_sheet",
        category: { en: "Non-domestic players (imports)", ru: "Неместные игроки (легионеры)" },
        value: {
          en: "Up to 22 players on the game sheet; at least 12 must be domestic players, including at least two domestic players under 24. The other places — up to 10 — may be imports. If 12 domestic players are not available, the sheet gets shorter; imports cannot fill the gap.",
          ru: "В протоколе до 22 игроков; не меньше 12 из них — местные, включая минимум двух местных моложе 24 лет. Остальные места — до 10 — могут занять легионеры. Если 12 местных нет, протокол сокращается; легионерами недостачу не закрыть."
        },
        exceptions: {
          en: "A dual citizen who is not yet eligible to play for that country counts as non-domestic. A 2022 announcement planned a reduction to 9 imports for 2024/25–2025/26 and 8 from 2026/27; EHA has not seen a league document confirming the 2026/27 number. In November 2026 a club president publicly proposed counting EU players as domestic; that is a proposal, not a rule.",
          ru: "Игрок с двойным гражданством, который ещё не имеет права играть за эту страну, считается неместным. В 2022 году объявляли снижение до 9 легионеров в 2024/25–2025/26 и до 8 с 2026/27; документа лиги с числом на 2026/27 EHA не видела. В ноябре 2026 года президент одного из клубов публично предложил считать игроков из ЕС местными — это предложение, а не правило."
        },
        ref: null,
        status: "press",
        source: "laolaRules2022",
        checkedAt: "2026-11-18"
      },
      {
        id: "at-icehl-season",
        season: "Rule introduced 2022/23 (press)",
        scope: "registration",
        category: { en: "Players over 24 per season", ru: "Игроки старше 24 лет за сезон" },
        value: {
          en: "A club may register at most 26 players over 24 during the season, domestic and imports together; domestic players under 24 are unlimited.",
          ru: "За сезон клуб может зарегистрировать не больше 26 игроков старше 24 лет — местных и легионеров вместе; местные моложе 24 лет не ограничены."
        },
        exceptions: null,
        ref: null,
        status: "press",
        source: "laolaRules2023",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the league and the federation of the club's country (Austria, Italy, Slovenia or Hungary): registration within the roster rules plus the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск дают лига и федерация страны клуба (Австрия, Италия, Словения или Венгрия): регистрация в рамках правил состава плюс трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU, EEA and Swiss citizens can live in all four countries without a visa. Other players need a residence permit of the club's country; the four countries have different procedures.",
        ru: "Граждане ЕС, ЕЭЗ и Швейцарии живут во всех четырёх странах без визы. Остальным нужен вид на жительство страны клуба; процедуры в четырёх странах разные."
      },
      work: {
        en: "A non-EU player needs permission to work in the club's country before the first game; the route and fees depend on whether the club is in Austria, Italy, Slovenia or Hungary. A league registration does not give a work permit.",
        ru: "Игроку не из ЕС до первого матча нужно разрешение на работу в стране клуба; путь и сборы зависят от того, где клуб — в Австрии, Италии, Словении или Венгрии. Регистрация в лиге разрешения на работу не даёт."
      },
      sources: ["euPortal", "iihfTransfer2026"]
    },
    windows: [
      { kind: "official", label: { en: "IIHF transfer period (18+)", ru: "Период переходов IIHF (18+)" }, dates: { en: "1 July 2026 – 15 February 2027", ru: "1 июля 2026 – 15 февраля 2027" }, ref: "IIHF International Transfer Regulations 2026", source: "iihfTransfer2026" },
      { kind: "official", label: { en: "Regular season", ru: "Регулярный чемпионат" }, dates: { en: "From 18 September 2026, 52 games per club", ru: "С 18 сентября 2026, 52 матча на клуб" }, ref: "ICEHL game mode", source: "icehlGameMode" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "March to July; in-season signings replace injured or released imports", ru: "С марта по июль; по ходу сезона подписывают замену травмированным или отчисленным легионерам" }, ref: null, source: null }
    ],
    money: {
      status: "eha_estimate",
      summary: {
        en: "There is no official ICEHL salary scale. EHA's approximate estimate is about €35,000–150,000+ per season; the low end is a young or depth player at a small-budget club, the high end a top-line import at a large-budget club. Clubs quote gross or net differently — always ask which.",
        ru: "Официальной шкалы зарплат ICEHL нет. Приблизительная оценка EHA — около 35 000–150 000+ евро за сезон; нижняя граница — молодой игрок или игрок глубины в небогатом клубе, верхняя — легионер первых звеньев в клубе с большим бюджетом. Клубы называют суммы по-разному — всегда уточняйте, брутто это или нетто."
      },
      examples: [
        {
          value: { en: "EUR 35,000–150,000+ per season (EHA estimate)", ru: "35 000–150 000+ евро за сезон (оценка EHA)" },
          note: { en: "Approximate market range from EHA, not contract data; gross or net not specified.", ru: "Приблизительный рыночный диапазон EHA, не данные контрактов; брутто или нетто не уточняется." },
          source: "ehaIcehlSalaries",
          checkedAt: "2026-11-16"
        },
        {
          value: { en: "EUR 40,000–150,000+", ru: "40 000–150 000+ евро" },
          note: { en: "Third-party range. The source does not say gross or net, per year or per season, or what is included.", ru: "Диапазон стороннего сайта. Источник не уточняет брутто или нетто, за год или за сезон и что входит." },
          source: "phieSalaries",
          checkedAt: "2026-11-15"
        }
      ]
    },
    steps: {
      en: [
        "Check whether you can count as domestic for any club country (citizenship, dual citizenship, years played).",
        "Prepare a recent full game, role clips and verified statistics.",
        "Check your level with the calculator on this page; compare with the Alps Hockey League one step below.",
        "Shortlist clubs by position needs and how many import places they already use.",
        "Agree the full package in writing: gross or net, months paid, housing, car, flights, insurance.",
        "Confirm the work permit route for the club's country and finish the IIHF transfer before 15 February."
      ],
      ru: [
        "Проверьте, можете ли вы считаться местным в какой-либо стране клуба (гражданство, двойное гражданство, годы игры).",
        "Подготовьте свежую полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице; сравните с Alps Hockey League ступенью ниже.",
        "Составьте список клубов по потребностям в позиции и по тому, сколько мест легионеров уже занято.",
        "Согласуйте весь пакет письменно: брутто или нетто, число оплачиваемых месяцев, жильё, машина, перелёты, страховка.",
        "Подтвердите путь к разрешению на работу в стране клуба и завершите трансфер IIHF до 15 февраля."
      ]
    },
    calcChecks: {
      en: ["EHA estimate: €35,000–150,000+ per season; ask gross or net.", "Up to 10 imports on a 22-player sheet under the 2022 rule; the 2026/27 number is not confirmed.", "Work permit depends on the club's country (AT, IT, SI, HU)."],
      ru: ["Оценка EHA: 35 000–150 000+ евро за сезон; уточняйте брутто или нетто.", "До 10 легионеров в протоколе на 22 игрока по правилу 2022 года; число на 2026/27 не подтверждено.", "Разрешение на работу зависит от страны клуба (AT, IT, SI, HU)."]
    },
    faq: [
      { q: { en: "What is the average ICEHL salary?", ru: "Какая средняя зарплата в ICEHL?" }, a: { en: "There is no official average or scale. EHA's approximate range is €35,000–150,000+ per season, depending on role, club budget and country; always ask whether a figure is gross or net.", ru: "Официальной средней или шкалы нет. Приблизительный диапазон EHA — 35 000–150 000+ евро за сезон в зависимости от роли, бюджета клуба и страны; всегда уточняйте, брутто это или нетто." } },
      { q: { en: "How many imports can play in the ICEHL?", ru: "Сколько легионеров может играть в ICEHL?" }, a: { en: "Under the 2022 rule, at least 12 domestic players on a 22-player sheet, so up to 10 imports. A reduction to 8 from 2026/27 was announced in 2022 but is not confirmed by a league document EHA has seen.", ru: "По правилу 2022 года в протоколе на 22 игрока не меньше 12 местных, то есть до 10 легионеров. Снижение до 8 с 2026/27 объявляли в 2022 году, но документом лиги, который видела EHA, это не подтверждено." } },
      { q: { en: "Do EU players count as imports in the ICEHL?", ru: "Считаются ли игроки из ЕС легионерами в ICEHL?" }, a: { en: "Under the current rule, a player is domestic only for his club's country, so an EU citizen from another country counts as an import. Counting EU players as domestic was proposed in November 2026 but is not a rule.", ru: "По действующему правилу игрок считается местным только для страны своего клуба, поэтому гражданин ЕС из другой страны — легионер. Считать игроков ЕС местными предложили в ноябре 2026 года, но это не правило." } },
      { q: { en: "How many teams play in 2026/27?", ru: "Сколько команд в 2026/27?" }, a: { en: "Fourteen clubs from Austria, Italy, Slovenia and Hungary, 52 regular-season games each.", ru: "Четырнадцать клубов из Австрии, Италии, Словении и Венгрии, по 52 матча регулярного чемпионата." } }
    ],
    missing: {
      en: ["The ICEHL roster rule document for 2026/27 (import number, domestic definition).", "The import registration or trading deadline for 2026/27.", "Work permit procedures per club country."],
      ru: ["Документ ICEHL о составах на 2026/27 (число легионеров, определение местного игрока).", "Срок регистрации или обмена легионеров на 2026/27.", "Процедуры разрешения на работу в каждой стране клубов."]
    },
    sources: ["icehlGameMode", "laolaRules2022", "laolaRules2023", "hnEuProposal", "ehaIcehlSalaries", "phieSalaries", "euPortal", "iihfTransfer2026"]
  },

  {
    id: "ch-national-league",
    country: { code: "CH", en: "Switzerland", ru: "Швейцария" },
    data: { name: "National League", country: "Switzerland" },
    names: {
      display: { en: "Swiss National League", ru: "National League (Швейцария)" },
      short: "National League",
      aliases: ["NL", "Swiss NL", "National League A", "NLA", "Swiss hockey league"],
      note: {
        en: "The National League (NL, formerly NLA) is Switzerland's top professional league, run by National League AG within the Swiss Ice Hockey Federation (SIHF). The level below is the Sky Swiss League.",
        ru: "National League (NL, раньше NLA) — высшая профессиональная лига Швейцарии; её проводит National League AG в структуре Федерации хоккея Швейцарии (SIHF). Уровнем ниже — Sky Swiss League."
      }
    },
    paths: { en: "/leagues/switzerland-national-league", ru: "/ligi/shvejcariya-national-league" },
    guide: { en: "/guides/hockey-in-switzerland", ru: "/guides/hokkej-v-shvejcarii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "How many foreign players can a Swiss National League team use in 2026/27?",
      ru: "Сколько иностранцев может использовать команда Swiss National League в 2026/27?"
    },
    answer: {
      en: "Six per game and ten per club over the season (four per game in the NL/SL qualification), according to the National League's 2026/27 game-operations directive. Dual citizens and players with “like a Swiss” (Wie Schweizer) status do not count; players with S status do. Club changes for foreign players close on 15 February 2027 at 24:00, and international transfers must be approved in the IIHF system by then. There is no official salary scale and EHA has no reliable sample for this league.",
      ru: "Шесть на матч и десять на клуб за сезон (четыре на матч в квалификации NL/SL) — по директиве National League на сезон 2026/27. Игроки с двойным гражданством и со статусом «как швейцарец» (Wie Schweizer) не считаются; игроки со статусом S — считаются. Переходы иностранцев закрываются 15 февраля 2027 года в 24:00, и международный трансфер должен быть одобрен в системе IIHF к этому сроку. Официальной шкалы зарплат нет, надёжной выборки по этой лиге у EHA тоже."
    },
    fitFor: {
      en: "It fits an established professional who would be one of a club's six best imports: a proven top-league or AHL scorer, a top-pair defender or a starting goaltender. With six places per game, Swiss clubs rarely sign imports for depth; for most players the realistic first step in Switzerland is the Sky Swiss League or another strong league.",
      ru: "Лига подходит состоявшемуся профессионалу, который будет одним из шести лучших легионеров клуба: результативному игроку высших лиг или AHL, защитнику первой пары или основному вратарю. При шести местах на матч швейцарские клубы почти не берут легионеров «на глубину»; для большинства игроков реалистичный первый шаг в Швейцарии — Sky Swiss League или другая сильная лига."
    },
    position: {
      en: "The National League is Switzerland's highest professional men's competition, above the Sky Swiss League. SIHF lists 14 clubs for 2026/27. Under the clubs' 2021 decision the number of foreign players per game follows league size — 4 with 12 clubs, 5 with 13, 6 with 14 — which matches the six in the 2026/27 directive.",
      ru: "National League — высшее профессиональное мужское соревнование Швейцарии, выше Sky Swiss League. SIHF указывает 14 клубов на сезон 2026/27. По решению клубов 2021 года число иностранцев на матч зависит от числа клубов — 4 при 12, 5 при 13, 6 при 14, — что совпадает с шестью в директиве на 2026/27."
    },
    expectations: {
      en: [
        "Experience: a proven role in a top European league or the AHL; clubs pay for impact.",
        "Role: top-six forward, top-four defence or starting goaltender — the six import places go to the best players.",
        "Video: recent full games and role clips; special-teams value matters.",
        "Status: tell the club about any Swiss citizenship, dual citizenship or Swiss youth-hockey history — it can mean you do not use a quota place."
      ],
      ru: [
        "Опыт: подтверждённая роль в высшей лиге Европы или AHL; клубы платят за результат.",
        "Роль: первые два звена, первая четвёрка защиты или основной вратарь — шесть мест легионеров достаются лучшим.",
        "Видео: свежие полные игры и нарезка по роли; важна польза в спецбригадах.",
        "Статус: сообщите клубу о швейцарском или двойном гражданстве и о детско-юношеском хоккее в Швейцарии — это может означать, что вы не занимаете место в квоте."
      ]
    },
    rules: [
      {
        id: "ch-nl-game",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Foreign players per game", ru: "Иностранцы на матч" },
        value: {
          en: "Six foreign players per game in the National League; four in the NL/SL qualification. A quota place counts as used when the foreign player is on the game sheet at the start of a league game; the same limits apply to the warm-up line-up (max 20 skaters and 2 goaltenders).",
          ru: "Шесть иностранцев на матч в National League; четыре — в квалификации NL/SL. Место в квоте считается использованным, если иностранец внесён в протокол на начало матча; те же лимиты действуют для разминки (не больше 20 полевых и 2 вратарей)."
        },
        exceptions: {
          en: "Dual citizens and “like a Swiss” players do not count; players with S status count as foreign. Under the clubs' 2021 decision, a Swiss-trained foreign player keeps “like a Swiss” status in the NL only until age 23 from 2026/27 (a broadcaster reported 22); the 2026/27 directive does not state the age.",
          ru: "Игроки с двойным гражданством и «как швейцарцы» не считаются; игроки со статусом S считаются иностранцами. По решению клубов 2021 года с 2026/27 иностранец, подготовленный в Швейцарии, сохраняет статус «как швейцарец» в NL только до 23 лет (одна телекомпания сообщала о 22); директива 2026/27 возраст не называет."
        },
        ref: "Weisungen Spielbetrieb NL 2026/27, sec. 1.3.1, 1.7",
        status: "official",
        source: "nlWeisungen2627",
        checkedAt: "2026-11-18"
      },
      {
        id: "ch-nl-quota",
        season: "2026/27",
        scope: "registration",
        category: { en: "Foreign players per club and season", ru: "Иностранцы на клуб за сезон" },
        value: {
          en: "A season quota of 10 foreign players per club in the National League.",
          ru: "Квота — 10 иностранных игроков на клуб за сезон в National League."
        },
        exceptions: null,
        ref: "Weisungen Spielbetrieb NL 2026/27, sec. 1.3.1",
        status: "official",
        source: "nlWeisungen2627",
        checkedAt: "2026-11-18"
      },
      {
        id: "ch-nl-deadline",
        season: "2026/27",
        scope: "transfer",
        category: { en: "Club-change deadlines", ru: "Сроки переходов" },
        value: {
          en: "Foreign players: 15 February 2027, 24:00. Swiss players, dual citizens and “like a Swiss” players: 1 February 2027, 24:00. The T3 form must be complete and signed by then, and an international transfer must be approved in the IIHF online system by 15 February, 24:00 — the releasing federation has seven days to decide.",
          ru: "Иностранцы: 15 февраля 2027, 24:00. Швейцарцы, игроки с двойным гражданством и «как швейцарцы»: 1 февраля 2027, 24:00. К этому сроку форма T3 должна быть заполнена и подписана, а международный трансфер — одобрен в системе IIHF до 15 февраля, 24:00; у отпускающей федерации есть семь дней на решение."
        },
        exceptions: {
          en: "Each player may change club only once per season within the National League and the Sky Swiss League.",
          ru: "Каждый игрок может сменить клуб только один раз за сезон в пределах National League и Sky Swiss League."
        },
        ref: "Weisungen Spielbetrieb NL 2026/27, sec. 1.3.2, 1.3.4",
        status: "official",
        source: "nlWeisungen2627",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the National League and SIHF: registration and the T3 transfer form, the foreign-player quota and, for a player from abroad, IIHF approval by 15 February.",
        ru: "Спортивный допуск дают National League и SIHF: регистрация и форма перехода T3, квота иностранцев и, для игрока из-за рубежа, одобрение IIHF до 15 февраля."
      },
      residence: {
        en: "EU/EFTA citizens are handled by the cantons under the free-movement framework. Other players need a residence permit linked to the job.",
        ru: "Граждан ЕС/ЕАСТ оформляют кантоны в рамках свободы передвижения. Остальным нужен вид на жительство, связанный с работой."
      },
      work: {
        en: "For non-EU/EFTA nationals admission is restrictive: the employer must meet labour-market requirements and employment conditions (SEM). Start the permit process as soon as terms are agreed.",
        ru: "Для граждан стран вне ЕС/ЕАСТ допуск ограничен: работодатель должен выполнить требования рынка труда и условий найма (SEM). Начинайте оформление разрешения сразу после согласования условий."
      },
      sources: ["semEu", "semNonEu", "iihfTransfer2026"]
    },
    windows: [
      { kind: "official", label: { en: "Swiss, dual-citizen and “like a Swiss” players", ru: "Швейцарцы, двойное гражданство и «как швейцарцы»" }, dates: { en: "Until 1 February 2027, 24:00", ru: "До 1 февраля 2027, 24:00" }, ref: "Weisungen 2026/27, sec. 1.3.2", source: "nlWeisungen2627" },
      { kind: "official", label: { en: "Foreign players and IIHF approval", ru: "Иностранцы и одобрение IIHF" }, dates: { en: "Until 15 February 2027, 24:00", ru: "До 15 февраля 2027, 24:00" }, ref: "Weisungen 2026/27, sec. 1.3.2", source: "nlWeisungen2627" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "Often a season ahead for top imports; in-season moves mostly replace injured imports", ru: "Для лучших легионеров часто за сезон вперёд; по ходу сезона в основном заменяют травмированных" }, ref: null, source: null }
    ],
    money: {
      status: "no_sample",
      summary: {
        en: "The National League publishes no salary scale, and EHA has no reliable sample or third-party range for it, so we do not quote a number. Swiss contracts are usually stated in CHF; ask whether the figure is gross or net, what tax and social contributions are deducted, and what housing, car and insurance are included.",
        ru: "National League не публикует шкалу зарплат, а у EHA нет ни надёжной выборки, ни диапазона стороннего источника, поэтому цифру мы не называем. Швейцарские контракты обычно указывают в CHF; уточняйте, брутто это или нетто, какие налоги и взносы вычитают и входят ли жильё, машина и страховка."
      },
      examples: []
    },
    steps: {
      en: [
        "Check your status: Swiss or dual citizenship, Swiss youth-hockey years (“like a Swiss”), S status.",
        "Be honest about level: with six import places, compare the Sky Swiss League and other top leagues too.",
        "Prepare recent full games, role clips and verified statistics.",
        "Shortlist clubs by position needs and how many of their ten quota places are used.",
        "Agree the contract in CHF with gross/net, tax, housing and insurance in writing.",
        "Start the permit process early and finish the T3 form and IIHF approval before 15 February."
      ],
      ru: [
        "Проверьте статус: швейцарское или двойное гражданство, годы в швейцарском детско-юношеском хоккее («как швейцарец»), статус S.",
        "Трезво оцените уровень: при шести местах легионеров сравните и Sky Swiss League, и другие сильные лиги.",
        "Подготовьте свежие полные игры, нарезку по роли и проверяемую статистику.",
        "Составьте список клубов по потребностям в позиции и по тому, сколько из десяти мест квоты занято.",
        "Согласуйте контракт в CHF с брутто/нетто, налогами, жильём и страховкой — письменно.",
        "Рано начните оформление разрешений и завершите форму T3 и одобрение IIHF до 15 февраля."
      ]
    },
    calcChecks: {
      en: ["6 foreign players per game, 10 per club and season (2026/27 directive).", "Dual citizens and “like a Swiss” players do not count; S status does.", "Foreign players' deadline 15 February 2027, including IIHF approval."],
      ru: ["6 иностранцев на матч, 10 на клуб за сезон (директива 2026/27).", "Двойное гражданство и «как швейцарец» не считаются; статус S считается.", "Срок для иностранцев — 15 февраля 2027, включая одобрение IIHF."]
    },
    faq: [
      { q: { en: "How many imports can play in the Swiss National League?", ru: "Сколько легионеров может играть в Swiss National League?" }, a: { en: "Six per game and ten per club over the 2026/27 season (four per game in the NL/SL qualification), under the league's game-operations directive.", ru: "Шесть на матч и десять на клуб за сезон 2026/27 (четыре на матч в квалификации NL/SL) — по директиве лиги." } },
      { q: { en: "Who does not count as a foreign player?", ru: "Кто не считается иностранцем?" }, a: { en: "Dual citizens and players with “like a Swiss” status. Players with S status do count as foreign.", ru: "Игроки с двойным гражданством и со статусом «как швейцарец». Игроки со статусом S считаются иностранцами." } },
      { q: { en: "When is the transfer deadline in 2026/27?", ru: "Когда срок переходов в 2026/27?" }, a: { en: "15 February 2027 at 24:00 for foreign players, including IIHF approval; 1 February 2027 for Swiss, dual-citizen and “like a Swiss” players.", ru: "15 февраля 2027 в 24:00 для иностранцев, включая одобрение IIHF; 1 февраля 2027 для швейцарцев, игроков с двойным гражданством и «как швейцарцев»." } },
      { q: { en: "What do Swiss National League players earn?", ru: "Сколько зарабатывают в Swiss National League?" }, a: { en: "There is no official salary scale and EHA has no reliable sample, so we do not quote a figure. Compare offers in CHF, gross and net, with housing, car and insurance listed.", ru: "Официальной шкалы нет, надёжной выборки у EHA тоже, поэтому цифру мы не называем. Сравнивайте предложения в CHF, брутто и нетто, с перечнем жилья, машины и страховки." } }
    ],
    missing: {
      en: ["Any salary sample or reliable range.", "The exact age limit for “like a Swiss” status (23 in the 2021 decision, 22 in one broadcast report)."],
      ru: ["Выборка или надёжный диапазон зарплат.", "Точный возрастной предел статуса «как швейцарец» (23 в решении 2021 года, 22 в одном телерепортаже)."]
    },
    sources: ["nlWeisungen2627", "nlDecision2021", "sihfClubs", "semEu", "semNonEu", "iihfTransfer2026"]
  },

  {
    id: "fi-mestis",
    country: { code: "FI", en: "Finland", ru: "Финляндия" },
    data: { name: "Mestis", country: "Finland" },
    names: {
      display: { en: "Mestis (Finland)", ru: "Mestis (Финляндия)" },
      short: "Mestis",
      aliases: ["Mestis", "Finnish second division", "Mestis hockey league"],
      note: {
        en: "Mestis is Finland's second national senior level, below Liiga. It is run separately from the Liiga; the league's own site is mestis.fi.",
        ru: "Mestis — второй национальный взрослый уровень Финляндии, ниже Liiga. Лига работает отдельно от Liiga; её сайт — mestis.fi."
      }
    },
    paths: { en: "/leagues/finland-mestis", ru: "/ligi/finlyandiya-mestis" },
    guide: { en: "/guides/hockey-in-finland", ru: "/guides/hokkej-v-finlyandii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "Can an import play in Mestis, and what does Mestis pay?",
      ru: "Может ли легионер играть в Mestis и сколько там платят?"
    },
    answer: {
      en: "Mestis publishes no foreign-player quota for 2026/27: its roster rules limit Liiga loan players (at most two per game, plus two U19–U20 skaters born 2007–2008) and require at least 20 own contracted players at the start of the season. So an import's chances depend on the club's need, not a quota. There is no official salary scale and EHA has no reliable sample; the only fixed number is immigration: a non-EU athlete needs a gross sports salary of at least €1,149 a month in 2026 for the Finnish athlete permit.",
      ru: "Квоты иностранцев на 2026/27 Mestis не публикует: правила составов ограничивают игроков в аренде из Liiga (не больше двух на матч плюс двое U19–U20 2007–2008 годов рождения) и требуют не меньше 20 собственных игроков по контракту на старте сезона. Поэтому шансы легионера зависят от потребности клуба, а не от квоты. Официальной шкалы зарплат нет, надёжной выборки у EHA тоже; единственная твёрдая цифра — миграционная: для финского разрешения спортсмена игроку не из ЕС нужна спортивная зарплата не меньше 1 149 евро брутто в месяц в 2026 году."
    },
    fitFor: {
      en: "It fits a player who wants a professional environment and real minutes one level below Liiga: a strong junior graduate, a player from a European third level, or an import ready for a defined role. For a North American player, think strong junior A, NCAA Division III or SPHL/FPHL level with a clear role, and expect clubs to compare carefully with Finnish players and Liiga loans.",
      ru: "Лига подходит игроку, которому нужна профессиональная среда и реальные минуты на уровень ниже Liiga: сильному выпускнику юниоров, игроку третьего европейского уровня или легионеру, готовому к понятной роли. Для игрока из Северной Америки ориентир — сильный junior A, NCAA Division III или уровень SPHL/FPHL с понятной ролью; клубы будут внимательно сравнивать вас с финскими игроками и арендованными из Liiga."
    },
    position: {
      en: "Mestis is the second level below Liiga. For 2026/27 the league confirmed nine teams — Hermes, IPK, Ketterä, KeuPa HT, Kiekko-Pojat, Kiekko-Vantaa, Pyry, RoKi and TUTO; the regular season is a six-fold round robin of 48 games per team from 11 September 2026 to 13 March 2027. Any move into the Liiga-run competition for 2027/28 remains subject to licence conditions.",
      ru: "Mestis — второй уровень после Liiga. На сезон 2026/27 лига подтвердила девять команд — Hermes, IPK, Ketterä, KeuPa HT, Kiekko-Pojat, Kiekko-Vantaa, Pyry, RoKi и TUTO; регулярный чемпионат — шесть кругов, по 48 матчей на команду, с 11 сентября 2026 по 13 марта 2027. Переход в соревнование под управлением Liiga в 2027/28 зависит от лицензионных условий."
    },
    expectations: {
      en: [
        "Role: clubs carry at least 20 own contracted players and can add Liiga loans, so an import needs a clear position and special-teams role.",
        "Experience: a recent full senior season or a leading junior role.",
        "Video: a full game and role clips.",
        "Package: many offers combine a modest salary with housing and a car; ask for each item in writing."
      ],
      ru: [
        "Роль: у клубов не меньше 20 собственных игроков по контракту плюс аренды из Liiga, поэтому легионеру нужна понятная позиция и роль в спецбригадах.",
        "Опыт: свежий полный взрослый сезон или ведущая роль в юниорах.",
        "Видео: полная игра и нарезка по роли.",
        "Пакет: многие предложения сочетают скромную зарплату с жильём и машиной; просите каждый пункт письменно."
      ]
    },
    rules: [
      {
        id: "fi-mestis-loans",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Liiga loan players (not an import quota)", ru: "Игроки в аренде из Liiga (не квота легионеров)" },
        value: {
          en: "At most two defined Liiga loan skaters per game, plus two U19–U20 skaters born in 2007–2008.",
          ru: "Не больше двух полевых игроков в аренде из Liiga на матч плюс двое U19–U20 2007–2008 годов рождения."
        },
        exceptions: {
          en: "The 2026/27 rules publish no separate limit on foreign players.",
          ru: "Отдельного лимита на иностранцев правила 2026/27 не публикуют."
        },
        ref: "Mestis roster rules 2026/27",
        status: "official",
        source: "mestisRoster",
        checkedAt: "2026-10-02"
      },
      {
        id: "fi-mestis-own-players",
        season: "2026/27",
        scope: "registration",
        category: { en: "Own contracted players", ru: "Собственные игроки по контракту" },
        value: {
          en: "At least 20 of a club's own contracted players at the start of the regular season.",
          ru: "Не меньше 20 собственных игроков клуба по контракту на старте регулярного чемпионата."
        },
        exceptions: null,
        ref: "Mestis roster rules 2026/27",
        status: "official",
        source: "mestisRoster",
        checkedAt: "2026-10-02"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the Finnish Ice Hockey Association and the league: registration with the club and the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск дают Федерация хоккея Финляндии и лига: регистрация в клубе и трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "EU/EEA citizens register their right of residence. Other players need a residence permit before they start; Migri has a dedicated permit for professional athletes and coaches.",
        ru: "Граждане ЕС/ЕЭЗ регистрируют право на проживание. Остальным до начала работы нужен вид на жительство; у Migri есть отдельное разрешение для профессиональных спортсменов и тренеров."
      },
      work: {
        en: "For the athlete permit the sports work must be professional and income must mainly come from it; in 2026 Migri sets a minimum gross sports salary of €1,149 a month. That is an immigration threshold, not a Mestis salary.",
        ru: "Для разрешения спортсмена спортивная работа должна быть профессиональной, а доход — в основном от неё; в 2026 году Migri устанавливает минимальную спортивную зарплату 1 149 евро брутто в месяц. Это миграционный порог, а не зарплата Mestis."
      },
      sources: ["migriAthlete", "iihfTransfer2026"]
    },
    windows: [
      { kind: "official", label: { en: "IIHF transfer period (18+)", ru: "Период переходов IIHF (18+)" }, dates: { en: "1 July 2026 – 15 February 2027", ru: "1 июля 2026 – 15 февраля 2027" }, ref: "IIHF International Transfer Regulations 2026", source: "iihfTransfer2026" },
      { kind: "official", label: { en: "Regular season", ru: "Регулярный чемпионат" }, dates: { en: "11 September 2026 – 13 March 2027", ru: "11 сентября 2026 – 13 марта 2027" }, ref: "Mestis format and schedule", source: "mestisFormat" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "April to August", ru: "С апреля по август" }, ref: null, source: null }
    ],
    money: {
      status: "no_sample",
      summary: {
        en: "Mestis publishes no salary scale, and EHA has no reliable sample or third-party range for it, so we do not quote an average. The only official figure is Migri's €1,149 gross monthly minimum for a non-EU athlete permit (2026). Compare offers on guaranteed income minus every cost you pay yourself.",
        ru: "Mestis не публикует шкалу зарплат, а у EHA нет ни надёжной выборки, ни стороннего диапазона, поэтому среднюю цифру мы не называем. Единственная официальная цифра — минимум Migri 1 149 евро брутто в месяц для разрешения спортсмена не из ЕС (2026). Сравнивайте предложения по гарантированному доходу за вычетом всех расходов, которые вы оплачиваете сами."
      },
      examples: []
    },
    steps: {
      en: [
        "Check your status: EU/EEA citizenship or the Migri athlete permit route.",
        "Prepare a full game, role clips and verified statistics.",
        "Check your level with the calculator on this page; compare with HockeyAllsvenskan and Liiga loans.",
        "Shortlist the nine clubs by position needs.",
        "Get salary, housing, car and insurance in writing; for non-EU check the €1,149 monthly minimum.",
        "Finish the IIHF transfer and permit before travel."
      ],
      ru: [
        "Проверьте статус: гражданство ЕС/ЕЭЗ или путь через разрешение спортсмена Migri.",
        "Подготовьте полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице; сравните с HockeyAllsvenskan и арендами из Liiga.",
        "Составьте список из девяти клубов по потребностям в позиции.",
        "Получите письменно зарплату, жильё, машину и страховку; игрокам не из ЕС — проверить минимум 1 149 евро в месяц.",
        "Завершите трансфер IIHF и разрешение до поездки."
      ]
    },
    calcChecks: {
      en: ["No published foreign-player quota; clubs fill needs around 20 own players and Liiga loans.", "Non-EU athlete permit: at least €1,149 gross a month (2026)."],
      ru: ["Квота иностранцев не публикуется; клубы закрывают потребности при 20 своих игроках и арендах из Liiga.", "Разрешение спортсмена не из ЕС: от 1 149 евро брутто в месяц (2026)."]
    },
    faq: [
      { q: { en: "What is the Mestis salary?", ru: "Какая зарплата в Mestis?" }, a: { en: "There is no official scale and EHA has no reliable sample, so we do not quote a number. A non-EU player needs at least €1,149 gross a month for the Finnish athlete permit (2026).", ru: "Официальной шкалы нет, надёжной выборки у EHA тоже, поэтому цифру мы не называем. Игроку не из ЕС для финского разрешения спортсмена нужно не меньше 1 149 евро брутто в месяц (2026)." } },
      { q: { en: "Is there an import limit in Mestis?", ru: "Есть ли лимит легионеров в Mestis?" }, a: { en: "The 2026/27 roster rules publish none; they limit Liiga loan players instead (two per game plus two U19–U20).", ru: "Правила составов 2026/27 его не публикуют; вместо этого ограничены аренды из Liiga (двое на матч плюс двое U19–U20)." } },
      { q: { en: "How many teams play in Mestis in 2026/27?", ru: "Сколько команд в Mestis в 2026/27?" }, a: { en: "Nine, with 48 regular-season games each from 11 September 2026 to 13 March 2027.", ru: "Девять, по 48 матчей регулярного чемпионата с 11 сентября 2026 по 13 марта 2027." } }
    ],
    missing: {
      en: ["A salary sample or reliable range.", "A Mestis registration deadline for 2026/27."],
      ru: ["Выборка или надёжный диапазон зарплат.", "Срок регистрации игроков Mestis на 2026/27."]
    },
    sources: ["mestisRoster", "mestisFormat", "mestisSchedule", "migriAthlete", "iihfTransfer2026"]
  },

  {
    id: "uk-eihl",
    country: { code: "GB", en: "United Kingdom", ru: "Великобритания" },
    data: { name: "EIHL", country: "United Kingdom" },
    names: {
      display: { en: "Elite Ice Hockey League (EIHL)", ru: "Elite Ice Hockey League (EIHL)" },
      short: "EIHL",
      aliases: ["EIHL", "Elite League", "Motorpoint Elite League", "British Elite League"],
      note: {
        en: "The Elite Ice Hockey League (Motorpoint Elite League, after its title sponsor) is the UK's top senior league, with ten teams from England, Scotland, Wales and Northern Ireland. Its rules speak of homegrown and non-homegrown players, not “imports”.",
        ru: "Elite Ice Hockey League (по титульному спонсору — Motorpoint Elite League) — высшая взрослая лига Великобритании, десять команд из Англии, Шотландии, Уэльса и Северной Ирландии. В её правилах говорят о «homegrown» и «non-homegrown» игроках, а не о «легионерах»."
      }
    },
    paths: { en: "/leagues/uk-eihl", ru: "/ligi/velikobritaniya-eihl" },
    guide: { en: "/guides/hockey-in-united-kingdom", ru: "/guides/hokkej-v-velikobritanii" },
    season: "2026/27",
    checkedAt: "2026-11-18",
    question: {
      en: "What are the EIHL import rules for 2026/27?",
      ru: "Какие правила для легионеров в EIHL в 2026/27?"
    },
    answer: {
      en: "The EIHL limits “non-homegrown” players rather than imports: at most 15 on a gameday roster of 18 skaters and two goaltenders, at most 18 registered at one time and 20 used over the season, within a 25-player season roster — as published after the league's July 2026 board meeting. Every team needs a British goaltender. The ten opening rosters on 12 September 2026 carried 15–18 non-homegrown players each. A non-UK player also needs the UK International Sportsperson visa.",
      ru: "EIHL ограничивает не «легионеров», а игроков «non-homegrown»: не больше 15 в заявке на матч из 18 полевых и двух вратарей, не больше 18 зарегистрированных одновременно и 20 использованных за сезон при общем составе на сезон 25 игроков — по решению совета лиги в июле 2026 года. В каждой команде должен быть британский вратарь. В десяти стартовых составах 12 сентября 2026 года было по 15–18 игроков non-homegrown. Игроку без британского права на работу нужна виза International Sportsperson."
    },
    fitFor: {
      en: "It fits an import who wants a full professional season with a defined role: most EIHL rosters are built around non-homegrown players, so there are more places than in leagues with tight passport quotas. For a North American player, strong ECHL, SPHL-top or U Sports/NCAA experience is a common route; clubs still sign for a specific role.",
      ru: "Лига подходит легионеру, которому нужен полный профессиональный сезон с понятной ролью: большинство составов EIHL строятся вокруг игроков non-homegrown, поэтому мест больше, чем в лигах с жёсткими квотами по паспорту. Для игрока из Северной Америки частый путь — сильный ECHL, лучшие игроки SPHL или U Sports/NCAA; клубы всё равно подписывают под конкретную роль."
    },
    position: {
      en: "The EIHL is the UK's highest senior competition. In 2026/27 its ten teams opened on 12 September with Challenge Cup games; league fixtures run from 20 September 2026 to 4 April 2027, 54 regular-season games per club.",
      ru: "EIHL — высшее взрослое соревнование Великобритании. В сезоне 2026/27 десять команд стартовали 12 сентября матчами Challenge Cup; матчи лиги идут с 20 сентября 2026 по 4 апреля 2027, по 54 игры регулярного чемпионата на клуб."
    },
    expectations: {
      en: [
        "Role: with up to 15 non-homegrown players dressed, clubs sign imports for specific lines and special teams.",
        "Experience: recent professional or high-level college seasons.",
        "Video: a full game and role clips; clubs check pace and physical play.",
        "Status: tell the club about any British citizenship or UK training history — homegrown status changes your roster value; the league's definition must be confirmed in writing."
      ],
      ru: [
        "Роль: при заявке до 15 игроков non-homegrown клубы подписывают легионеров под конкретные звенья и спецбригады.",
        "Опыт: свежие профессиональные или сильные студенческие сезоны.",
        "Видео: полная игра и нарезка по роли; клубы смотрят на скорость и силовую игру.",
        "Статус: сообщите клубу о британском гражданстве или подготовке в Великобритании — статус homegrown меняет вашу ценность для состава; определение лиги подтвердите письменно."
      ]
    },
    rules: [
      {
        id: "uk-eihl-gameday",
        season: "2026/27",
        scope: "game_sheet",
        category: { en: "Non-homegrown players per game", ru: "Игроки non-homegrown на матч" },
        value: {
          en: "Gameday roster of 18 skaters and two goaltenders, with at most 15 non-homegrown players. Every team must have at least one British goaltender on its roster.",
          ru: "Заявка на матч — 18 полевых и два вратаря, из них не больше 15 игроков non-homegrown. В составе каждой команды должен быть хотя бы один британский вратарь."
        },
        exceptions: {
          en: "As published after the July 2026 board meeting (league release, read via trade press). The league's definition of “homegrown” was not confirmed from a primary source.",
          ru: "По решению совета лиги в июле 2026 года (релиз лиги в пересказе отраслевой прессы). Определение «homegrown» по первоисточнику не подтверждено."
        },
        ref: null,
        status: "press",
        source: "phnEihl2627",
        checkedAt: "2026-11-18"
      },
      {
        id: "uk-eihl-season",
        season: "2026/27",
        scope: "registration",
        category: { en: "Season roster", ru: "Состав на сезон" },
        value: {
          en: "25 players for the season (excluding injured-reserve replacements and, where allowed, two-way players); at most 20 non-homegrown players used in a season and 18 registered at one time. Opening rosters on 12 September 2026: 15–18 non-homegrown players per team.",
          ru: "25 игроков на сезон (без замен с injured reserve и, где разрешено, двусторонних игроков); не больше 20 игроков non-homegrown за сезон и 18 зарегистрированных одновременно. Стартовые составы 12 сентября 2026: по 15–18 игроков non-homegrown в команде."
        },
        exceptions: {
          en: "Two-way players (homegrown, under 25 on 1 August, contracted mainly to a lower-league club) may play 20 league games before they count. A homegrown player on injured reserve can be replaced only by another homegrown player.",
          ru: "Двусторонние игроки (homegrown, младше 25 лет на 1 августа, с основным контрактом в клубе низшей лиги) могут сыграть 20 матчей лиги, прежде чем их начнут учитывать в составе. Игрока homegrown на injured reserve можно заменить только другим homegrown."
        },
        ref: null,
        status: "press",
        source: "phnEihl2627",
        checkedAt: "2026-11-18"
      }
    ],
    permits: {
      sport: {
        en: "Sport eligibility comes from the league and Ice Hockey UK: registration within the roster rules and the IIHF transfer for a player from another federation.",
        ru: "Спортивный допуск дают лига и Ice Hockey UK: регистрация в рамках правил состава и трансфер IIHF для игрока из другой федерации."
      },
      residence: {
        en: "Players without a UK right to work, including EU citizens since Brexit, need a UK visa for the season.",
        ru: "Игрокам без британского права на работу, включая граждан ЕС после Brexit, нужна британская виза на сезон."
      },
      work: {
        en: "The usual route is the International Sportsperson visa, which needs a licensed sponsor (the club) and an endorsement from the sport's governing body; check the conditions on GOV.UK before agreeing terms.",
        ru: "Обычный путь — виза International Sportsperson: нужен лицензированный спонсор (клуб) и одобрение руководящего органа вида спорта; до согласования условий проверьте требования на GOV.UK."
      },
      sources: ["ukSportsVisa", "iihfTransfer2026"]
    },
    windows: [
      { kind: "official", label: { en: "Season", ru: "Сезон" }, dates: { en: "Opened 12 September 2026; league games 20 September 2026 – 4 April 2027", ru: "Старт 12 сентября 2026; матчи лиги с 20 сентября 2026 по 4 апреля 2027" }, ref: "Elite League season announcement", source: "eihlSeason" },
      { kind: "official", label: { en: "IIHF transfer period (18+)", ru: "Период переходов IIHF (18+)" }, dates: { en: "1 July 2026 – 15 February 2027", ru: "1 июля 2026 – 15 февраля 2027" }, ref: "IIHF International Transfer Regulations 2026", source: "iihfTransfer2026" },
      { kind: "guide", label: { en: "Main roster building (EHA guide, not a rule)", ru: "Основное комплектование (ориентир EHA, не правило)" }, dates: { en: "March to August; visa time must be added before the first game", ru: "С марта по август; до первого матча нужно учесть время на визу" }, ref: null, source: null }
    ],
    money: {
      status: "no_sample",
      summary: {
        en: "The EIHL publishes no salary scale and EHA has no reliable sample or third-party range for it, so we do not quote a number. Ask whether pay is weekly or monthly, gross or net of UK tax, and whether housing, a car and flights are included — and who pays the visa costs.",
        ru: "EIHL не публикует шкалу зарплат, а у EHA нет ни надёжной выборки, ни стороннего диапазона, поэтому цифру мы не называем. Уточняйте, платят понедельно или помесячно, брутто или нетто после британских налогов, входят ли жильё, машина и перелёты и кто оплачивает визу."
      },
      examples: []
    },
    steps: {
      en: [
        "Check your status: British citizenship or UK training history (homegrown), UK right to work.",
        "Prepare a full game, role clips and verified statistics.",
        "Check your level with the calculator on this page.",
        "Shortlist clubs by position and how many non-homegrown places they use.",
        "Get the offer in writing, including who pays the visa, housing and flights.",
        "Start the International Sportsperson visa early; finish the IIHF transfer before 15 February."
      ],
      ru: [
        "Проверьте статус: британское гражданство или подготовка в Великобритании (homegrown), право на работу в Великобритании.",
        "Подготовьте полную игру, нарезку по роли и проверяемую статистику.",
        "Оцените уровень в калькуляторе на этой странице.",
        "Составьте список клубов по позиции и по тому, сколько мест non-homegrown занято.",
        "Получите предложение письменно, включая оплату визы, жилья и перелётов.",
        "Заранее начните оформление визы International Sportsperson; завершите трансфер IIHF до 15 февраля."
      ]
    },
    calcChecks: {
      en: ["At most 15 non-homegrown players per game; 20 per season, 18 at one time (2026/27, as published).", "Non-UK players need the International Sportsperson visa."],
      ru: ["Не больше 15 non-homegrown на матч; 20 за сезон, 18 одновременно (2026/27, по опубликованным данным).", "Игрокам без британского права на работу нужна виза International Sportsperson."]
    },
    faq: [
      { q: { en: "How many imports can play in the EIHL?", ru: "Сколько легионеров может играть в EIHL?" }, a: { en: "The league counts non-homegrown players: at most 15 on an 18 + 2 gameday roster, 20 used per season and 18 registered at one time in 2026/27, as published after the July board meeting.", ru: "Лига считает игроков non-homegrown: не больше 15 в заявке 18 + 2, 20 за сезон и 18 одновременно в 2026/27 — по решению совета лиги в июле." } },
      { q: { en: "Do EU players need a visa for the EIHL?", ru: "Нужна ли игрокам из ЕС виза для EIHL?" }, a: { en: "Yes, unless they already have a UK right to work. The usual route is the International Sportsperson visa.", ru: "Да, если у них ещё нет британского права на работу. Обычный путь — виза International Sportsperson." } },
      { q: { en: "When does the 2026/27 EIHL season run?", ru: "Когда идёт сезон EIHL 2026/27?" }, a: { en: "It opened on 12 September 2026; league games run from 20 September 2026 to 4 April 2027, 54 per club.", ru: "Старт 12 сентября 2026; матчи лиги — с 20 сентября 2026 по 4 апреля 2027, по 54 на клуб." } }
    ],
    missing: {
      en: ["The league's own 2026/27 roster regulations text and its definition of “homegrown”.", "A salary sample or reliable range.", "An EIHL registration deadline for 2026/27."],
      ru: ["Собственный текст правил составов лиги на 2026/27 и её определение «homegrown».", "Выборка или надёжный диапазон зарплат.", "Срок регистрации игроков EIHL на 2026/27."]
    },
    sources: ["phnEihl2627", "eihlOpeningRosters", "eihlRules2526", "eihlSeason", "ukSportsVisa", "iihfTransfer2026"]
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
