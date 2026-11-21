// Renders a league profile (src/league-profiles.js) into the league page body,
// a compact rule summary for country guides and the FAQPage JSON-LD. Output
// uses logical internal paths ("/contact"); renderBody adds the /ru prefix.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { PROFILES, SOURCES, profileById, profileForPath } = require("./league-profiles");

const PROFILE_MARKER = "<!-- LEAGUE_PROFILE -->";
const PROFILE_LD_MARKER = "<!-- LEAGUE_PROFILE_LD -->";
const RULES_MARKER_RE = /<!-- LEAGUE_RULES:([a-z0-9-]+) -->/g;
const CLUBS_BLOCK_RE = /<!-- LEAGUE_CLUBS:START -->([\s\S]*?)<!-- LEAGUE_CLUBS:END -->/;
const RULES_ANCHOR = '<section class="league-profile-section" id="import-rules">';
const WHATSAPP_URL = "https://wa.me/375297957818";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const t = (v, locale) => (v && typeof v === "object" ? (v[locale] || v.en) : v);

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
};
function formatDate(iso, locale) {
  const [y, m, d] = iso.split("-").map(Number);
  return locale === "ru" ? `${d} ${MONTHS.ru[m - 1]} ${y}` : `${d} ${MONTHS.en[m - 1]} ${y}`;
}

const L = {
  en: {
    who: "Who this level suits",
    system: "Place in the system and what clubs expect",
    rules: (s) => `Rules for foreign players, season ${s}`,
    rulesIntro: "A game-sheet limit applies to each match roster; a registration limit applies to licences in the squad. The table says which one each rule is.",
    thRule: "Rule", thScope: "Where it applies", thValue: "What it says", thSource: "Source and check date",
    scope: { game_sheet: "Match roster", registration: "Registration / licences", transfer: "Transfers", eligibility: "Eligibility" },
    status: { official: "official document", press: "press report, not a regulation" },
    exceptions: "Exceptions and notes",
    checked: "checked",
    permits: "Sport eligibility, residence and work: three separate checks",
    sport: "Sport eligibility", residence: "Right to live in the country", work: "Right to work",
    windows: "Transfer and registration windows",
    windowsIntro: "Official dates come from the regulation. The roster-building period is EHA's guide, not a rule.",
    thPeriod: "Period", thDates: "Dates", thBasis: "Basis",
    official: "Official", guide: "EHA guide",
    money: "Salary, housing and player costs",
    example: "Example, not an average",
    ask: "What to confirm in writing before signing",
    askList: ["Pay: gross or net, monthly or per season, payment dates, bonuses", "Housing: who pays rent, deposit and utilities; shared or own flat", "Meals, car or transport, flights at the start and end of the contract", "Equipment: sticks, skates and what the club provides", "Insurance and injury: medical cover, who pays treatment, pay during injury", "Your own costs: tryout travel, visa or permit fees, agent fees, taxes", "Contract length, termination and release terms"],
    steps: "What to do: step by step",
    submit: "Submit your profile", whatsapp: "Ask on WhatsApp ↗",
    calc: (n) => `Check your level for ${n}`,
    calcIntro: (n) => `Enter your data: the result shows how ${n} compares with your indicative range. It is a preliminary sporting estimate; documents and eligibility are checked separately.`,
    routes: "Related routes",
    routeCountry: (c) => `Hockey in ${c}: all levels and rules`,
    routeDirectory: "European league directory",
    routeCalc: "Standalone level calculator",
    sameCountry: "Same country", similar: "Similar level in other countries",
    missing: "Not yet confirmed by EHA",
    missingIntro: "Ask the club about these points; we will add them once we see a primary source.",
    sources: "Official sources and FAQ",
    verified: "Verified",
    names: "Name and other names",
    aliases: "Also searched as",
    rulesSummary: (n, s) => `${n}: rules for foreign players, ${s}`,
    rulesMore: (n) => `Full guide to ${n}`
  },
  ru: {
    who: "Кому подходит этот уровень",
    system: "Место в системе и чего ждут клубы",
    rules: (s) => `Правила для иностранных игроков, сезон ${s}`,
    rulesIntro: "Лимит в заявке на матч действует для каждого протокола; лимит при регистрации — для лицензий в составе. В таблице указано, к чему относится каждое правило.",
    thRule: "Правило", thScope: "Где действует", thValue: "Что сказано", thSource: "Источник и дата проверки",
    scope: { game_sheet: "Заявка на матч", registration: "Регистрация / лицензии", transfer: "Переходы", eligibility: "Допуск" },
    status: { official: "официальный документ", press: "сообщение прессы, не регламент" },
    exceptions: "Исключения и примечания",
    checked: "проверено",
    permits: "Спортивный допуск, проживание и работа: три отдельные проверки",
    sport: "Спортивный допуск", residence: "Право жить в стране", work: "Право работать",
    windows: "Трансферные и регистрационные окна",
    windowsIntro: "Официальные даты взяты из регламента. Период комплектования — ориентир EHA, а не правило.",
    thPeriod: "Период", thDates: "Даты", thBasis: "Основание",
    official: "Официально", guide: "Ориентир EHA",
    money: "Зарплата, жильё и расходы игрока",
    example: "Пример, не средняя цифра",
    ask: "Что уточнить письменно до подписания",
    askList: ["Зарплата: брутто или нетто, в месяц или за сезон, даты выплат, бонусы", "Жильё: кто платит аренду, залог и коммунальные; отдельная квартира или общая", "Питание, машина или транспорт, перелёты в начале и в конце контракта", "Экипировка: клюшки, коньки и что даёт клуб", "Страховка и травмы: медицинское покрытие, кто оплачивает лечение, выплаты во время травмы", "Ваши расходы: дорога на просмотр, визы и разрешения, услуги агента, налоги", "Срок контракта, условия расторжения и отказа"],
    steps: "Что делать: по шагам",
    submit: "Отправить профиль", whatsapp: "Написать в WhatsApp ↗",
    calc: (n) => `Проверьте свой уровень для ${n}`,
    calcIntro: (n) => `Введите данные: результат покажет, как ${n} соотносится с вашим ориентировочным диапазоном. Это предварительная спортивная оценка; документы и допуск проверяются отдельно.`,
    routes: "Связанные маршруты",
    routeCountry: (c) => `Хоккей: ${c} — все уровни и правила`,
    routeDirectory: "Справочник лиг Европы",
    routeCalc: "Калькулятор уровня на отдельной странице",
    sameCountry: "Та же страна", similar: "Близкий уровень в других странах",
    missing: "Пока не подтверждено EHA",
    missingIntro: "Уточните эти пункты у клуба; мы добавим их, когда увидим первичный источник.",
    sources: "Официальные источники и вопросы",
    verified: "Проверено",
    names: "Название и другие названия",
    aliases: "Также ищут как",
    rulesSummary: (n, s) => `${n}: правила для иностранных игроков, ${s}`,
    rulesMore: (n) => `Подробный гид по ${n}`
  }
};

// League reference data (same source as the calculator and the directory).
let leagueData = null;
function leagues() {
  if (leagueData) return leagueData;
  try {
    const src = fs.readFileSync(path.join(__dirname, "..", "public", "assets", "leagues.src.js"), "utf8");
    const sandbox = { window: {} };
    vm.runInNewContext(src, sandbox, { timeout: 500 });
    leagueData = (sandbox.window.EHA_LEAGUES_SRC && sandbox.window.EHA_LEAGUES_SRC.leagues) || [];
  } catch {
    leagueData = [];
  }
  return leagueData;
}

function recordFor(profile) {
  return leagues().find((l) => l.name === profile.data.name && l.country.en === profile.data.country) || null;
}

// Same country one tier up or down, then other countries at the same tier
// (similar access first). Only leagues with a page are linked.
function relatedLeagues(profile, locale) {
  const self = recordFor(profile);
  if (!self) return { sameCountry: [], similar: [] };
  const seen = new Set([self.url && self.url.en]);
  const pick = (l) => {
    if (!l.url || seen.has(l.url.en) || l.age === "junior") return false;
    seen.add(l.url.en);
    return true;
  };
  const all = leagues();
  const sameCountry = all
    .filter((l) => l.country.en === self.country.en && Math.abs(l.tier - self.tier) === 1)
    .filter(pick)
    .map((l) => ({ name: l.name, url: l.url[locale], tier: l.tier }));
  const accessOrder = (l) => (l.open === self.open ? 0 : 1);
  const similar = all
    .filter((l) => l.country.en !== self.country.en && l.tier === self.tier)
    .sort((a, b) => accessOrder(a) - accessOrder(b))
    .filter(pick)
    .slice(0, 6)
    .map((l) => ({ name: l.name, url: l.url[locale], country: t(l.country, locale) }));
  return { sameCountry, similar };
}

function sourceLink(key, locale) {
  const s = SOURCES[key];
  if (!s) return "";
  return `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(t(s.label, locale))} ↗</a>`;
}

function rulesTable(profile, locale, { compact = false } = {}) {
  const s = L[locale];
  const rows = profile.rules.map((r) => {
    const exc = r.exceptions && !compact ? `<p class="rule-note"><strong>${s.exceptions}:</strong> ${esc(t(r.exceptions, locale))}</p>` : "";
    const status = r.status === "press" ? ` <span class="rule-status rule-press">${s.status.press}</span>` : "";
    const ref = r.ref ? `${esc(r.ref)}. ` : "";
    return `<tr data-rule-id="${esc(r.id)}"><td data-label="${s.thRule}"><strong>${esc(t(r.category, locale))}</strong><br><small>${esc(r.season)}</small>${status}</td>` +
      `<td data-label="${s.thScope}">${s.scope[r.scope]}</td>` +
      `<td data-label="${s.thValue}"><p>${esc(t(r.value, locale))}</p>${exc}</td>` +
      `<td data-label="${s.thSource}">${ref}${sourceLink(r.source, locale)}<br><small>${s.checked} ${formatDate(r.checkedAt, locale)}</small></td></tr>`;
  }).join("");
  return `<div class="league-wrap" role="region" aria-label="${esc(s.rules(profile.season))}" tabindex="0"><table class="league-table league-rules"><thead><tr><th>${s.thRule}</th><th>${s.thScope}</th><th>${s.thValue}</th><th>${s.thSource}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function calculatorBlock(profile, locale) {
  const s = L[locale];
  const name = t(profile.names.display, locale);
  const record = recordFor(profile);
  const en = locale === "en";
  const opt = (v, label, sel) => `<option value="${v}"${sel ? " selected" : ""}>${label}</option>`;
  const checks = JSON.stringify(t(profile.calcChecks, locale) || []);
  return `<form class="calc-form" id="calc" data-league-name="${esc(record ? record.name : profile.data.name)}" data-league-guide="${esc(profile.guide.en)}" data-league-label="${esc(name)}" data-league-checks="${esc(checks)}">` +
    `<label>${en ? "Year of birth" : "Год рождения"}<input type="number" id="c-year" min="1970" max="2014" placeholder="2004" required></label>` +
    `<label>${en ? "Position" : "Позиция"}<select id="c-pos" required>${opt("forward", en ? "Forward" : "Нападающий")}${opt("defense", en ? "Defence" : "Защитник")}${opt("goalie", en ? "Goaltender" : "Вратарь")}</select></label>` +
    `<label>${en ? "EU passport" : "Паспорт ЕС"}<select id="c-eu" required>${opt("no", en ? "No" : "Нет")}${opt("yes", en ? "Yes" : "Да")}</select></label>` +
    `<label>${en ? "Level of your current league" : "Уровень вашей текущей лиги"}<select id="c-level" required>` +
    opt("top", en ? "Top division of a strong country (SHL, Liiga, Extraliga, NL…)" : "Высший дивизион сильной страны (SHL, Liiga, Extraliga, NL…)") +
    opt("t2", en ? "Second division of a strong country or top of a mid one (Allsvenskan, Mestis, DEL2…)" : "Второй дивизион сильной страны или высший средней (Allsvenskan, Mestis, DEL2…)", true) +
    opt("t3", en ? "Third level or top division of a small country (HockeyEttan, Oberliga…)" : "Третий уровень или высший дивизион малой страны (HockeyEttan, Oberliga…)") +
    opt("junior", en ? "Junior league (USHL, CHL, NAHL, J20, U20)" : "Юниорская лига (USHL, CHL, NAHL, J20, U20)") +
    opt("amateur", en ? "Amateur or college club level" : "Любительский или студенческий уровень") +
    `</select></label>` +
    `<label>${en ? "Points last season" : "Очки за прошлый сезон"}<input type="number" id="c-points" min="0" max="300" placeholder="25"><small>${en ? "Goaltenders can leave this blank" : "Вратарям можно не заполнять"}</small></label>` +
    `<label>${en ? "Games last season" : "Игры за прошлый сезон"}<input type="number" id="c-games" min="1" max="120" placeholder="45"></label>` +
    `<label>${en ? "Pro seasons played" : "Сезонов во взрослом хоккее"}<input type="number" id="c-seasons" min="0" max="25" placeholder="2" required></label>` +
    `<label>${en ? "Elite Prospects profile link — optional" : "Ссылка на профиль Elite Prospects — необязательно"}<input type="url" id="calc-ep" maxlength="300" placeholder="https://www.eliteprospects.com/player/…"><small>${en ? "It is passed to the application form; you confirm all data there." : "Ссылка перейдёт в форму заявки; все данные вы подтвердите там."}</small></label>` +
    `<button class="btn primary" type="submit">${en ? "Check my level" : "Проверить уровень"}</button></form>` +
    `<div class="calc-result" id="calc-result" hidden role="status" aria-live="polite">` +
    `<p class="kicker">${en ? "Your estimate" : "Ваша оценка"}</p><h3 class="calc-band" id="calc-band" tabindex="-1"></h3>` +
    `<div class="calc-league-fit" id="calc-league-fit"></div>` +
    `<p class="calc-guide" id="calc-guide"></p><p class="calc-summary" id="calc-summary"></p>` +
    `<div class="calc-next" id="calc-next"><p class="kicker">${en ? "Next step" : "Следующий шаг"}</p><p>${en ? "Leave your Elite Prospects link. EHA will review your profile and pick 1–3 suitable clubs. Your personal list is prepared after we review the application." : "Оставьте ссылку на Elite Prospects. EHA рассмотрит ваш профиль и подберёт 1–3 подходящих клуба. Персональный список готовится после рассмотрения заявки."}</p>` +
    `<a class="btn primary" id="calc-cta" href="/contact">${en ? "Submit Your Profile" : "Отправить профиль агенту"}</a> <a class="text-link" href="${WHATSAPP_URL}" target="_blank" rel="noopener">${s.whatsapp}</a>` +
    `<p class="calc-next-note">${en ? "No Elite Prospects profile? Use the same button: the form works without it, add your stats and video instead." : "Нет профиля на Elite Prospects? Нажмите ту же кнопку: форма работает и без него, вместо ссылки укажите статистику и видео."}</p></div>` +
    `<h4 class="calc-subtitle">${en ? "Leagues to research for your profile" : "Лиги для изучения по вашему профилю"}</h4><div class="calc-leagues" id="calc-leagues"></div>` +
    `<div hidden><h4 class="calc-subtitle">${en ? "Country guides" : "Гиды по странам"}</h4><p class="calc-countries" id="calc-countries"></p></div>` +
    `<h4 class="calc-subtitle">${en ? "What to strengthen in your profile" : "Что усилить в профиле"}</h4><ul class="ticks" id="calc-tips"></ul>` +
    `</div>`;
}

function renderLeagueProfile(profile, locale) {
  const s = L[locale];
  const name = t(profile.names.display, locale);
  const n = { v: 0 };
  const num = () => String(++n.v).padStart(2, "0");
  const section = (inner, attrs = "") => `<section class="league-profile-section"${attrs}><span class="section-number">${num()}</span>${inner}</section>`;
  const list = (items, cls = "ticks") => `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  const rel = relatedLeagues(profile, locale);
  const country = t(profile.country, locale);

  const parts = [];
  parts.push(section(
    `<h2>${esc(t(profile.question, locale))}</h2><div class="quick-answer"><p>${esc(t(profile.answer, locale))}</p></div>` +
    `<h3>${s.who}</h3><p>${esc(t(profile.fitFor, locale))}</p>` +
    `<p class="league-names"><strong>${s.names}:</strong> ${esc(t(profile.names.note, locale))} <span class="muted">${s.aliases}: ${profile.names.aliases.map(esc).join(", ")}.</span></p>`,
    ' id="quick-answer"'
  ));
  parts.push(section(`<h2>${s.system}</h2><p>${esc(t(profile.position, locale))}</p>${list(t(profile.expectations, locale))}`));
  parts.push(section(`<h2>${s.rules(profile.season)}</h2><p>${s.rulesIntro}</p>${rulesTable(profile, locale)}`, ' id="import-rules"'));
  const permit = (title, key) => `<div><h3>${title}</h3><p>${esc(t(profile.permits[key], locale))}</p></div>`;
  parts.push(section(
    `<h2>${s.permits}</h2><div class="permit-grid">${permit(s.sport, "sport")}${permit(s.residence, "residence")}${permit(s.work, "work")}</div>` +
    `<p class="source-line">${profile.permits.sources.map((k) => sourceLink(k, locale)).join(" · ")}</p>`
  ));
  const wrows = profile.windows.map((w) => `<tr><td data-label="${s.thPeriod}"><strong>${esc(t(w.label, locale))}</strong><br><small>${w.kind === "official" ? s.official : s.guide}</small></td><td data-label="${s.thDates}">${esc(t(w.dates, locale))}</td><td data-label="${s.thBasis}">${w.ref ? esc(w.ref) + ". " : ""}${w.source ? sourceLink(w.source, locale) : "—"}</td></tr>`).join("");
  parts.push(section(`<h2>${s.windows}</h2><p>${s.windowsIntro}</p><div class="league-wrap" role="region" aria-label="${esc(s.windows)}" tabindex="0"><table class="league-table"><thead><tr><th>${s.thPeriod}</th><th>${s.thDates}</th><th>${s.thBasis}</th></tr></thead><tbody>${wrows}</tbody></table></div>`, ' id="windows"'));
  const examples = (profile.money.examples || []).map((ex) => `<li><strong>${esc(t(ex.value, locale))}</strong> — ${s.example}. ${esc(t(ex.note, locale))} ${sourceLink(ex.source, locale)} <small>(${s.checked} ${formatDate(ex.checkedAt, locale)})</small></li>`).join("");
  parts.push(section(
    `<h2>${s.money}</h2><p>${esc(t(profile.money.summary, locale))}</p>${examples ? `<ul class="salary-examples">${examples}</ul>` : ""}` +
    `<h3>${s.ask}</h3>${list(s.askList)}`,
    ' id="salary-costs"'
  ));
  parts.push(section(
    `<h2>${s.steps}</h2><ol class="league-steps">${t(profile.steps, locale).map((i) => `<li>${esc(i)}</li>`).join("")}</ol>` +
    `<p class="league-actions"><a class="btn primary" href="/contact?league=${encodeURIComponent(name)}">${s.submit}</a> <a class="text-link" href="${WHATSAPP_URL}" target="_blank" rel="noopener">${s.whatsapp}</a></p>`
  ));
  parts.push(section(`<h2>${s.calc(name)}</h2><p>${esc(s.calcIntro(name))}</p>${calculatorBlock(profile, locale)}`, ' id="league-calculator"'));
  const linkList = (items, label) => items.length ? `<h3>${label}</h3><ul class="route-links">${items.map((l) => `<li><a href="${esc(l.url)}">${esc(l.name)}${l.country ? ` <small>(${esc(l.country)})</small>` : ""}</a></li>`).join("")}</ul>` : "";
  parts.push(section(
    `<h2>${s.routes}</h2><ul class="route-links"><li><a href="${esc(profile.guide[locale])}">${esc(s.routeCountry(country))}</a></li><li><a href="${locale === "ru" ? "/ligi-evropy" : "/european-leagues"}">${s.routeDirectory}</a></li><li><a href="${locale === "ru" ? "/kalkulyator-urovnya" : "/level-calculator"}">${s.routeCalc}</a></li></ul>` +
    linkList(rel.sameCountry, s.sameCountry) + linkList(rel.similar, s.similar),
    ' id="related-routes"'
  ));
  parts.push(section(`<h2>${s.missing}</h2><p>${s.missingIntro}</p>${list(t(profile.missing, locale))}`, ' id="not-confirmed"'));
  const faq = profile.faq.map((f) => `<details><summary>${esc(t(f.q, locale))}</summary><p>${esc(t(f.a, locale))}</p></details>`).join("");
  parts.push(`<section data-country-section="11" class="sources-block"><span class="section-number">${num()}</span><h2>${s.sources}</h2><ul>${profile.sources.map((k) => `<li>${sourceLink(k, locale)}</li>`).join("")}</ul>` +
    `<p class="updated-date"><strong>${s.verified}:</strong> ${formatDate(profile.checkedAt, locale)}.</p><div class="faq country-faq">${faq}</div></section>`);
  return `<div class="league-profile" data-league-id="${esc(profile.id)}">${parts.join("")}</div>`;
}

function renderLeagueRulesSummary(profile, locale) {
  const s = L[locale];
  const name = t(profile.names.display, locale);
  return `<section class="league-rules-summary" data-league-id="${esc(profile.id)}"><h2>${esc(s.rulesSummary(name, profile.season))}</h2>` +
    `<div class="quick-answer"><p>${esc(t(profile.answer, locale))}</p></div>${rulesTable(profile, locale, { compact: true })}` +
    `<p><a href="${esc(profile.paths[locale])}#import-rules">${esc(s.rulesMore(name))} →</a></p></section>`;
}

function faqJsonLd(profile, locale) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: profile.faq.map((f) => ({ "@type": "Question", name: t(f.q, locale), acceptedAnswer: { "@type": "Answer", text: t(f.a, locale) } }))
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}


// One cross-league table of match-roster (game-sheet) limits for foreign
// players, built only from the verified rules in league-profiles.js, so the
// hub page can never drift from the league pages it links to.
const IMPORT_TABLE_MARKER = "<!-- IMPORT_RULES_TABLE -->";
const IMPORT_L = {
  en: { league: "League", country: "Country", limit: "Match-roster rule", source: "Source and check date", label: "Import rules by league, 2026/27" },
  ru: { league: "Лига", country: "Страна", limit: "Правило заявки на матч", source: "Источник и дата проверки", label: "Лимиты легионеров по лигам, 2026/27" }
};
function renderImportRulesTable(locale) {
  const s = L[locale];
  const h = IMPORT_L[locale];
  const rows = [...PROFILES]
    .filter((p) => p.rules.some((r) => r.scope === "game_sheet"))
    .sort((a, b) => t(a.country, locale).localeCompare(t(b.country, locale), locale) || a.id.localeCompare(b.id))
    .map((p) => {
      const rules = p.rules.filter((r) => r.scope === "game_sheet");
      const limit = rules.map((r) => {
        const status = r.status === "press" ? ` <span class="rule-status rule-press">${s.status.press}</span>` : "";
        return `<p><strong>${esc(t(r.category, locale))}.</strong> ${esc(t(r.value, locale))}${status}</p>`;
      }).join("");
      const src = rules.map((r) => `${sourceLink(r.source, locale)} <small>${s.checked} ${formatDate(r.checkedAt, locale)}</small>`)
        .filter((v, i, a) => a.indexOf(v) === i).join("<br>");
      return `<tr data-profile-id="${esc(p.id)}"><td data-label="${h.league}"><a href="${esc(p.paths[locale])}"><strong>${esc(t(p.names.display, locale))}</strong></a><br><small>${esc(p.season)}</small></td>` +
        `<td data-label="${h.country}">${esc(t(p.country, locale))}</td><td data-label="${h.limit}">${limit}</td><td data-label="${h.source}">${src}</td></tr>`;
    }).join("");
  return `<div class="league-wrap" role="region" aria-label="${h.label}" tabindex="0"><table class="league-table league-rules import-rules-table"><thead><tr><th>${h.league}</th><th>${h.country}</th><th>${h.limit}</th><th>${h.source}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// Applies every league-profile marker in a rendered page.
function applyLeagueProfiles(html, logicalPath, locale) {
  const hit = profileForPath(logicalPath);
  if (hit && hit.locale === locale) {
    if (html.includes(PROFILE_MARKER)) html = html.replace(PROFILE_MARKER, renderLeagueProfile(hit.profile, locale));
    // A page may keep its own verified club list between LEAGUE_CLUBS markers;
    // it is moved in front of the rules table so the page reads league →
    // clubs → rules, as on pages whose club table comes from league-facts.
    const clubs = html.match(CLUBS_BLOCK_RE);
    if (clubs && html.includes(RULES_ANCHOR)) {
      html = html.replace(clubs[0], "").replace(RULES_ANCHOR, `${clubs[1]}${RULES_ANCHOR}`);
    }
    if (html.includes(PROFILE_LD_MARKER)) html = html.replace(PROFILE_LD_MARKER, faqJsonLd(hit.profile, locale));
  }
  if (html.includes(IMPORT_TABLE_MARKER)) html = html.replace(IMPORT_TABLE_MARKER, renderImportRulesTable(locale));
  if (html.includes("<!-- LEAGUE_RULES:")) {
    html = html.replace(RULES_MARKER_RE, (m, id) => {
      const p = profileById(id);
      return p ? renderLeagueRulesSummary(p, locale) : "";
    });
  }
  return html;
}

module.exports = { applyLeagueProfiles, renderLeagueProfile, renderLeagueRulesSummary, relatedLeagues, faqJsonLd, renderImportRulesTable, IMPORT_TABLE_MARKER, PROFILE_MARKER, PROFILE_LD_MARKER, PROFILES };
