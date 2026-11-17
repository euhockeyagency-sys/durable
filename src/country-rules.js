// Verified passport / roster / registration / immigration rules by country.
// ONE source for the "Verified rules" block on country guides
// (rendered by scripts/build-cases.js). Kept apart from cases.
//
// id            stable slug
// countryCode   ISO 3166-1 alpha-2
// competition   the exact league, federation scope or immigration route
// age           { en, ru }: age category the rule applies to
// season        season or year the source states, e.g. "2026/27" or "2026"
// validUntil    YYYY-MM-DD: after this date the rule is hidden on the site
//               (by the server at request time), never shown as current
// citizenship   { en, ru }: who it applies to. Never assume a European passport
//               is an EU passport; JFL-type rules are about training, not passports
// kind          foreign_limit | registration_transfer | residence | work
//               (an import quota, a sporting registration/transfer rule, the
//               right to stay and the right to work are always separate entries)
// text          { en, ru }: the rule as verified
// source        official source (league, federation or government)
// checkedAt     YYYY-MM-DD: when EHA actually checked the source
// verified      must be true to be published; unverified drafts stay false
//
// Do not add a rule without an official source and a real check date.
const ALL = { en: "All ages", ru: "Все возрасты" };
const SENIOR = { en: "Senior", ru: "Взрослые" };
const NON_EU = { en: "Non-EU/EEA nationals", ru: "Граждане не из ЕС/ЕЭЗ" };

module.exports = [
  { id: "se-sif-foreign-transfer-window", countryCode: "SE", competition: "SIF (all competitions)", age: ALL, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Any player moving from a foreign club", ru: "Любой игрок, переходящий из иностранного клуба" }, kind: "registration_transfer",
    text: { en: "General window for a move from a foreign club: 1 June–31 January; competition-specific deadlines can differ.", ru: "Общее окно для перехода из иностранного клуба: 1 июня – 31 января; сроки отдельных турниров могут отличаться." },
    source: "https://www.swehockey.se/spelare/spelare-aktiva/spelaroevergaang/internationell/", checkedAt: "2026-11-17", verified: true },
  { id: "se-athlete-work-permit", countryCode: "SE", competition: "Work permit for professional athletes (Migrationsverket)", age: SENIOR, season: "2026", validUntil: "2026-12-31",
    citizenship: NON_EU, kind: "work",
    text: { en: "Salary before tax at least one third of the price base amount in force when applying (2026 price base amount SEK 59,200).", ru: "Зарплата до налогов — не меньше трети базовой суммы цен на дату подачи (базовая сумма 2026 — SEK 59 200)." },
    source: "https://www.migrationsverket.se/en/you-want-to-apply/work/employee-or-self-employed/athletes-and-coaches.html", checkedAt: "2026-10-05", verified: true },
  { id: "de-athlete-residence-work", countryCode: "DE", competition: "Residence permit for professional athletes (Make it in Germany)", age: { en: "16 and older", ru: "С 16 лет" }, season: "2026", validUntil: "2026-12-31",
    citizenship: NON_EU, kind: "work",
    text: { en: "At least €50,700 gross a year, minimum age 16. An immigration threshold, not an import quota.", ru: "Не менее €50 700 брутто в год, минимальный возраст 16 лет. Миграционный порог, а не квота легионеров." },
    source: "https://www.make-it-in-germany.com/en/visa-residence/types/other/athletes-coaches", checkedAt: "2026-10-05", verified: true },
  { id: "cz-maxa-liga-foreign-limit", countryCode: "CZ", competition: "Maxa liga", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Players classified as foreign nationals by ČSLH", ru: "Игроки, которых ČSLH относит к иностранцам" }, kind: "foreign_limit",
    text: { en: "At most three players classified as foreign nationals in a game.", ru: "Не более трёх игроков-иностранцев в матче." },
    source: "https://www.czehockey.cz/competition/format/2", checkedAt: "2026-10-05", verified: true },
  { id: "cz-cslh-domestic-window", countryCode: "CZ", competition: "ČSLH (outside Extraliga and 1st league)", age: ALL, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Domestic transfers between Czech clubs", ru: "Внутренние переходы между чешскими клубами" }, kind: "registration_transfer",
    text: { en: "Domestic transfer window 1 May–31 January.", ru: "Внутреннее трансферное окно 1 мая – 31 января." },
    source: "https://www.ceskyhokej.cz/data/document/20260729/111830_3883_Prestupni-rad-mimo-klubu-extraligy-a-I.ligy-cistopis.pdf", checkedAt: "2026-11-17", verified: true },
  { id: "fr-ligue-magnus-jfl", countryCode: "FR", competition: "Synerglace Ligue Magnus", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Non-JFL players (status by training history, not passport)", ru: "Игроки не-JFL (статус по истории подготовки, а не по паспорту)" }, kind: "foreign_limit",
    text: { en: "At least 10 locally trained players (JFL) on a 20-player game sheet; JFL status is based on training history, not nationality.", ru: "Минимум 10 местно подготовленных игроков (JFL) в заявке из 20; статус JFL зависит от истории подготовки, а не от гражданства." },
    source: "https://www.hockeyfrance.com/wp-content/uploads/2026/05/06-Reglement-AS-2026.27_VF.pdf", checkedAt: "2026-10-02", verified: true },
  { id: "at-alps-hl-points", countryCode: "AT", competition: "Alps Hockey League", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Non-domestic players under the league points system", ru: "Игроки не местной подготовки по системе баллов лиги" }, kind: "foreign_limit",
    text: { en: "Points system: a non-domestic player counts 4 points, maximum 16 points per game sheet.", ru: "Система баллов: легионер стоит 4 балла, максимум 16 баллов на заявку." },
    source: "https://gamebook.alps.hockey/documents/gamebooks/alps/ALPS_2627_Game_Book_260901.pdf", checkedAt: "2026-11-16", verified: true },
  { id: "at-key-workers-athletes", countryCode: "AT", competition: "Other Key Workers route (Migration Austria)", age: SENIOR, season: "2026", validUntil: "2026-12-31",
    citizenship: NON_EU, kind: "work",
    text: { en: "Professional athletes get 20 bonus points; statutory minimum €3,465 gross a month in 2026, labour-market test and a 55-point minimum. An immigration threshold, not a market salary.", ru: "Профессиональным спортсменам — 20 бонусных баллов; установленный минимум €3 465 брутто в месяц в 2026 году, проверка рынка труда и минимум 55 баллов. Миграционный порог, а не рыночная зарплата." },
    source: "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/other-key-workers/", checkedAt: "2026-10-02", verified: true },
  { id: "fi-u18-guardian-transfer", countryCode: "FI", competition: "Finnish Ice Hockey Association competition rules", age: { en: "Under 18", ru: "До 18 лет" }, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Foreign minors moving to Finland", ru: "Иностранные несовершеннолетние, переезжающие в Финляндию" }, kind: "registration_transfer",
    text: { en: "A player under 18 may transfer permanently to Finland only when moving permanently with a guardian; for U15 and younger the international transfer period ends on 30 November unless the family moves permanently.", ru: "Игрок младше 18 лет может перейти в Финляндию насовсем только при переезде с опекуном; для U15 и младше период международных трансферов заканчивается 30 ноября, если семья не переезжает насовсем." },
    source: "https://www.finhockey.fi/tuomarille/saannot-ja-tulkinnat/kilpailusaannot", checkedAt: "2026-10-05", verified: true },
  { id: "fi-mestis-no-import-quota", countryCode: "FI", competition: "Mestis", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Foreign players", ru: "Иностранные игроки" }, kind: "foreign_limit",
    text: { en: "No universal foreign-player quota is published. The published rule limits Liiga loan players (at most two Liiga loan skaters per match), not imports.", ru: "Общей квоты на иностранцев не опубликовано. Опубликованное правило ограничивает игроков в аренде из Liiga (не более двух полевых игроков на матч), а не легионеров." },
    source: "https://mestis.fi/fi/uutiset/2026/05/21/mestiksen-pelaamistapa-202627", checkedAt: "2026-10-02", verified: true },
  { id: "fi-migri-athlete-residence", countryCode: "FI", competition: "Residence permit for professional athletes (Migri)", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Non-EU nationals", ru: "Граждане не из ЕС" }, kind: "residence",
    text: { en: "A residence permit for athletes is a separate step from Finnish sporting registration; EU citizens register their right of residence instead.", ru: "Вид на жительство для спортсменов — отдельный шаг от спортивной регистрации; граждане ЕС вместо этого регистрируют право на проживание." },
    source: "https://migri.fi/en/athlete-coach-or-trainer", checkedAt: "2026-10-05", verified: true },
  { id: "no-udi-athlete-route", countryCode: "NO", competition: "Athlete or coach residence permit (UDI)", age: SENIOR, season: "2026", validUntil: "2026-12-31",
    citizenship: NON_EU, kind: "work",
    text: { en: "Concrete job offer from a specific employer, level confirmed by the Norwegian sports association, normally full-time work, at least NOK 341,373 a year before tax; since 2026 the employer must confirm the job offer before an application from abroad.", ru: "Конкретное предложение от работодателя, подтверждение уровня норвежской спортивной ассоциацией, обычно полная занятость, не менее NOK 341 373 в год до налогов; с 2026 года работодатель подтверждает предложение до подачи заявления из-за рубежа." },
    source: "https://www.udi.no/en/want-to-apply/work-immigration/skilled-workers/", checkedAt: "2026-10-02", verified: true },
  { id: "dk-athlete-route", countryCode: "DK", competition: "Special individual qualifications: athlete or coach (New to Denmark)", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Third-country nationals", ru: "Граждане третьих стран" }, kind: "work",
    text: { en: "Explicitly covers professional ice hockey players: the club must be affiliated through a specialised association, an advance statement from the association is required, and salary and terms must match Danish standards.", ru: "Прямо охватывает профессиональных хоккеистов: клуб должен быть членом профильной ассоциации, нужно предварительное заключение ассоциации, а зарплата и условия — по датским стандартам." },
    source: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/athlete-special-qualifications", checkedAt: "2026-10-02", verified: true },
  { id: "ch-sem-non-eu-efta", countryCode: "CH", competition: "Work and residence (SEM)", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Non-EU/EFTA nationals", ru: "Граждане не из ЕС/ЕАСТ" }, kind: "work",
    text: { en: "Admission is limited; the employer must meet labour-market requirements and employment conditions. A hockey contract or federation registration does not create a right to work.", ru: "Допуск ограничен; работодатель должен выполнить требования рынка труда и условия занятости. Хоккейный контракт или регистрация в федерации не дают права на работу." },
    source: "https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta-angehoerige.html", checkedAt: "2026-10-02", verified: true },
  { id: "nl-eredivisie-transfer-deadlines", countryCode: "NL", competition: "IJshockey Nederland: Eredivisie", age: ALL, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Players transferring to Dutch competitions", ru: "Игроки, переходящие в нидерландские турниры" }, kind: "registration_transfer",
    text: { en: "National-transfer deadline 1 September 2026 (Oberliga, Eredivisie, U13–U23); international transfer request for Eredivisie by 1 October 2026; a foreign player is eligible only after the international transfer is completed.", ru: "Дедлайн национальных трансферов 1 сентября 2026 (Oberliga, Eredivisie, U13–U23); запрос международного трансфера для Eredivisie — до 1 октября 2026; иностранный игрок допускается только после завершения международного трансфера." },
    source: "https://www.ijshockeynederland.nl/reglementen/bijlage-bij-het-sportreglement-seizoen-2024-2025/bijlage-ii-nationale-transfers", checkedAt: "2026-10-02", verified: true },
  { id: "nl-work-permit", countryCode: "NL", competition: "Work permits (Government of the Netherlands)", age: SENIOR, season: "2026/27", validUntil: "2027-06-30",
    citizenship: { en: "Nationals outside the EEA and Switzerland", ru: "Граждане вне ЕЭЗ и Швейцарии" }, kind: "work",
    text: { en: "Dutch, EEA and Swiss nationals need no work permit. Most others need a TWV, or a GVVA for work longer than three months, unless an exemption applies; IJshockey Nederland requires these documents before even a friendly match.", ru: "Гражданам Нидерландов, ЕЭЗ и Швейцарии разрешение не нужно. Большинству остальных нужен TWV или GVVA для работы дольше трёх месяцев, если нет исключения; IJshockey Nederland требует эти документы ещё до товарищеского матча." },
    source: "https://www.government.nl/faq/foreign-citizens-working-in-the-netherlands/what-permits-do-foreign-workers-need", checkedAt: "2026-10-02", verified: true },
];
