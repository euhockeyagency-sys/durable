/* Shared logic for the level calculator (public/en/level-calculator.html and
   public/ru/kalkulyator-urovnya.html). One file instead of two near-identical
   inline <script> copies, so EN/RU can no longer drift apart — see the
   dropdown-example bug that already happened when they were separate. Wrapped
   in an IIFE (not a flat top-level script like site.js) because this file is
   loaded on the same pages as site.js and must not collide with its globals.
   Exports pure functions via module.exports when required() from tests. */
(function (root) {
  "use strict";

  // Base score: the league you play in now is the dominant signal.
  var BASE = { top: 100, t2: 78, t3: 58, junior: 55, amateur: 35 };
  // Points-per-game thresholds by position. Goalies are judged on level and
  // experience only — no per-game production number applies to them.
  var PPG = { forward: [0.8, 0.5, 0.3], defense: [0.5, 0.3, 0.15], goalie: null };
  // Age at/under which a player is still a realistic fit for a junior/U20
  // league — reused both for the "consider junior programs" tip and (bug A)
  // for actually filtering junior-tagged leagues out of an adult's results.
  var JUNIOR_AGE_CEILING = 19;
  // A "top league, zero pro seasons" profile isn't a coherent signal — cap it
  // instead of letting BASE alone carry an implausible score (bug F).
  var IMPLAUSIBLE_AGE_FLOOR = 23;

  var STRINGS = {
    en: {
      belowBenchmark: "Your production is below the benchmark for your position — in your video, emphasise play without the puck, defending and your role on the team.",
      addStats: "Add stats from a full season — without them a club can't assess your profile.",
      youngPotential: "At your age clubs look at potential — consider junior and U20 programs with real ice time.",
      experienced: "After 30, clubs sign a player for a specific role — highlight your experience, consistency and leadership.",
      noProSeasons: "Without pro seasons, the path usually runs through junior leagues or lower divisions.",
      implausible: "Zero pro seasons at your age doesn't match a top-division level — the estimate below is capped as unverified. Send your profile for a direct read.",
      nonEu: "Import status and permission to work depend on the country, competition rules and your individual status. Not holding an EU passport does not by itself establish whether you take an import spot or need a work permit. Check the current rules before approaching a club.",
      solidProfile: "Your profile looks solid — strengthen the presentation: fresh video and an up-to-date Elite Prospects.",
      prepareAhead: "Prepare your hockey resume and video in advance: when a club has an opening, the decision is made fast.",
      bandTop: "Top divisions in Europe",
      bandMid: "Second and third divisions, including the top divisions of smaller countries",
      bandLow: "Third level and lower divisions",
      summaryPrefix: "The model suggests researching domestic division levels ",
      summarySuffixEu: ". These are reference leagues to investigate, not confirmed club interest or eligibility. An EU passport does not automatically remove league import limits; division numbers are not equivalent across countries.",
      summarySuffixNonEu: ". These are reference leagues to investigate, not confirmed club interest or eligibility. The passport filter is a broad model assumption, not a check of current quotas or work permission; division numbers are not equivalent across countries.",
      noLeagues: "No leagues in the reference match these parameters — send your profile and we'll review it manually.",
      countryGuide: "Hockey in ",
      prelim: "Preliminary: the calculator uses your birth year, EU/non-EU passport, level and stats. It does not check your exact citizenship, national rules such as France's JFL status, import quotas or registration deadlines, so every country needs an individual check.",
      focusFit: function (c, names) { return "You came from the " + c + " page. Leagues there within your indicative range: " + names + "."; },
      focusNone: function (c) { return "You came from the " + c + " page. No " + c + " league falls within your indicative range on the current model; the guide explains the levels and requirements."; },
      focusLink: function (c) { return "Back to the " + c + " guide"; },
      goalTips: {
        pro: "For a professional contract, clubs look first at your role and recent full-game video at your current level.",
        development: "For development, compare guaranteed ice time and coaching in each route, not only the league name.",
        study: "If school or university matters, check the academic programme and schedule alongside the hockey level; NCAA eligibility has its own rules."
      },
      ctaNote: function (r) {
        return "Level calculator: " + r.label + " (score " + r.score + "), " + r.pos + ", born " + r.year + (r.eu ? ", EU passport" : ", non-EU passport") + ".";
      }
    },
    ru: {
      belowBenchmark: "Результативность ниже ориентира для вашей позиции — сделайте акцент в видео на игре без шайбы, обороне и роли в команде.",
      addStats: "Укажите статистику за полный сезон — без неё клубу трудно оценить профиль.",
      youngPotential: "В вашем возрасте клубы смотрят на потенциал — рассмотрите юниорские и молодёжные программы с игровым временем.",
      experienced: "После 30 клубы берут игрока под конкретную роль — подчеркните опыт, стабильность и лидерские качества.",
      noProSeasons: "Без взрослых сезонов путь обычно идёт через юниорские лиги или низшие дивизионы.",
      implausible: "Ноль взрослых сезонов в этом возрасте не сходится с уровнем высшего дивизиона — оценка ниже ограничена как неподтверждённая. Отправьте профиль на прямую оценку.",
      nonEu: "Легионерский статус и право на работу зависят от страны, регламента соревнования и вашего индивидуального статуса. Отсутствие паспорта ЕС само по себе не определяет, займёте ли вы легионерское место и нужно ли разрешение на работу. До обращения в клуб проверьте актуальные правила.",
      solidProfile: "Профиль выглядит собранным — усильте презентацию: свежее видео и актуальный Elite Prospects.",
      prepareAhead: "Подготовьте хоккейное резюме и видео заранее: когда у клуба открывается место, решение принимается быстро.",
      bandTop: "Высшие дивизионы Европы",
      bandMid: "Вторые и третьи дивизионы, включая высшие дивизионы малых стран",
      bandLow: "Третий уровень и низшие дивизионы",
      summaryPrefix: "По модели стоит изучить национальные дивизионы уровней ",
      summarySuffixEu: ". Ниже — лиги для дальнейшего изучения, а не подтверждённый интерес клубов или допуск игрока. Паспорт ЕС не снимает автоматически легионерские лимиты; номера дивизионов разных стран не равнозначны.",
      summarySuffixNonEu: ". Ниже — лиги для дальнейшего изучения, а не подтверждённый интерес клубов или допуск игрока. Фильтр по паспорту — условие модели, а не проверка действующих квот или права на работу; номера дивизионов разных стран не равнозначны.",
      noLeagues: "Под такие параметры подходящих лиг в справочнике не нашлось — отправьте профиль, разберём вручную.",
      countryGuide: "Хоккей: ",
      prelim: "Результат предварительный: калькулятор учитывает год рождения, паспорт ЕС или не ЕС, уровень и статистику. Он не проверяет точное гражданство, национальные правила вроде статуса JFL во Франции, лимиты легионеров и сроки регистрации, поэтому по каждой стране нужна индивидуальная проверка.",
      focusFit: function (c, names) { return "Вы пришли со страницы «" + c + "». Лиги этой страны в вашем ориентировочном диапазоне: " + names + "."; },
      focusNone: function (c) { return "Вы пришли со страницы «" + c + "». По текущей модели ни одна лига этой страны не попадает в ваш ориентировочный диапазон; в гиде описаны уровни и требования."; },
      focusLink: function (c) { return "Вернуться к гиду: " + c; },
      goalTips: {
        pro: "Для профессионального контракта клубы прежде всего смотрят на вашу роль и свежее видео полной игры на текущем уровне.",
        development: "Для развития сравнивайте гарантированное игровое время и тренерскую работу в каждом варианте, а не только название лиги.",
        study: "Если важны школа или университет, проверяйте учебную программу и расписание вместе с хоккейным уровнем; для NCAA действуют отдельные правила допуска."
      },
      ctaNote: function (r) {
        return "Калькулятор уровня: " + r.label + " (балл " + r.score + "), " + r.pos + ", год рождения " + r.year + (r.eu ? ", паспорт ЕС" : ", без паспорта ЕС") + ".";
      }
    }
  };

  // Pure scoring + candidate-selection. No DOM access, so this is directly
  // unit-testable via module.exports below.
  function calculate(input, leagues, lang) {
    var strings = STRINGS[lang] || STRINGS.ru;
    var currentYear = input.currentYear || new Date().getFullYear();
    var playerAge = currentYear - input.year;
    var score = BASE[input.level] || BASE.t3;
    var tips = [];

    var ppg = input.games > 0 ? input.points / input.games : 0;
    if (PPG[input.pos] && input.games >= 10) {
      var t = PPG[input.pos];
      if (ppg >= t[0]) score += 12;
      else if (ppg >= t[1]) score += 6;
      else if (ppg >= t[2]) score += 0;
      else { score -= 8; tips.push(strings.belowBenchmark); }
    } else if (PPG[input.pos]) {
      tips.push(strings.addStats);
    }

    if (playerAge <= JUNIOR_AGE_CEILING) { score += 6; tips.push(strings.youngPotential); }
    else if (playerAge <= 23) score += 3;
    else if (playerAge <= 27) score += 0;
    else if (playerAge <= 31) score -= 5;
    else { score -= 10; tips.push(strings.experienced); }

    if (input.seasons >= 3) score += 3;
    else if (input.seasons === 0) { score -= 4; tips.push(strings.noProSeasons); }

    // A "top division, zero pro seasons" combination isn't a coherent
    // profile — cap the score instead of reporting an elite band on that
    // basis alone (bug F).
    if (input.seasons === 0 && playerAge > IMPLAUSIBLE_AGE_FLOOR && score > BASE.t3) {
      score = BASE.t3;
      tips.push(strings.implausible);
    }

    if (!input.eu) tips.push(strings.nonEu);

    // Score -> realistic tier band. Collapsed from 5 labeled bands to 3: the
    // old 82-99 label promised tier-2 leagues that the tier-ascending,
    // slice(0,8) selection below could never actually surface (bug B/C).
    // `elite` (score >= 100) still changes sort order below, so it survives
    // as an internal-only flag rather than a fourth label.
    var elite = score >= 100;
    var band, label, bandKey;
    if (score >= 82) { band = [1, 2]; label = strings.bandTop; bandKey = "top"; }
    else if (score >= 48) { band = [2, 3]; label = strings.bandMid; bandKey = "mid"; }
    else { band = [3, 3]; label = strings.bandLow; bandKey = "low"; }

    var seekingJunior = playerAge <= JUNIOR_AGE_CEILING;
    var candidates = (leagues || []).filter(function (l) {
      if (l.tier < band[0] || l.tier > band[1]) return false;
      if (!input.eu && l.open === "low") return false;
      // Bug A: a league tagged for junior/U20 competition shouldn't be
      // recommended to a player past the age where that's realistic.
      if (l.age === "junior" && !seekingJunior) return false;
      return true;
    });

    var accessFirst = { high: 0, mid: 1, low: 2 };
    var strengthFirst = { low: 0, mid: 1, high: 2 };
    var order = elite ? strengthFirst : accessFirst;
    candidates.sort(function (a, b) { return (a.tier - b.tier) || (order[a.open] - order[b.open]); });

    // Bug E: the same league can appear under two country records (e.g. Alps
    // Hockey League for both Austria and Slovenia). Dedupe by name AFTER
    // sorting — so the higher-priority record wins — and BEFORE slicing, so
    // a duplicate doesn't waste one of only 8 shown slots.
    var seen = {};
    candidates = candidates.filter(function (l) {
      if (seen[l.name]) return false;
      seen[l.name] = true;
      return true;
    });
    candidates = candidates.slice(0, 8);

    if (!tips.length) tips.push(strings.solidProfile);
    tips.push(strings.prepareAhead);

    var summary = strings.summaryPrefix +
      (band[0] === band[1] ? band[0] : band[0] + "–" + band[1]) +
      (input.eu ? strings.summarySuffixEu : strings.summarySuffixNonEu);

    return { score: score, elite: elite, band: band, bandKey: bandKey, label: label, summary: summary, candidates: candidates, tips: tips, playerAge: playerAge };
  }

  // Country guide paths keyed by the lower-cased country name used in the
  // league data (EN and RU). Generated from PAGES in src/locales.js.
  var COUNTRY_GUIDES = {"poland": {"en": "/guides/hockey-in-poland", "ru": "/guides/hokkej-v-polshe"}, "austria": {"en": "/guides/hockey-in-austria", "ru": "/guides/hokkej-v-avstrii"}, "canada": {"en": "/guides/hockey-in-canada", "ru": "/guides/hokkej-v-kanade"}, "czechia": {"en": "/guides/hockey-in-czechia", "ru": "/guides/hokkej-v-chexii"}, "denmark": {"en": "/guides/hockey-in-denmark", "ru": "/guides/hokkej-v-danii"}, "finland": {"en": "/guides/hockey-in-finland", "ru": "/guides/hokkej-v-finlyandii"}, "france": {"en": "/guides/hockey-in-france", "ru": "/guides/hokkej-vo-francii"}, "germany": {"en": "/guides/hockey-in-germany", "ru": "/guides/hokkej-v-germanii"}, "italy": {"en": "/guides/hockey-in-italy", "ru": "/guides/hokkej-v-italii"}, "netherlands": {"en": "/guides/hockey-in-netherlands", "ru": "/guides/hokkej-v-niderlandah"}, "norway": {"en": "/guides/hockey-in-norway", "ru": "/guides/hokkej-v-norvegii"}, "slovakia": {"en": "/guides/hockey-in-slovakia", "ru": "/guides/hokkej-v-slovakii"}, "sweden": {"en": "/guides/hockey-in-sweden", "ru": "/guides/hokkej-v-shvecii"}, "switzerland": {"en": "/guides/hockey-in-switzerland", "ru": "/guides/hokkej-v-shvejcarii"}, "united kingdom": {"en": "/guides/hockey-in-united-kingdom", "ru": "/guides/hokkej-v-velikobritanii"}, "usa": {"en": "/guides/hockey-in-usa", "ru": "/guides/hokkej-v-ssha"}, "estonia": {"en": "/guides/hockey-in-estonia", "ru": "/guides/hokkej-v-estonii"}, "hungary": {"en": "/guides/hockey-in-hungary", "ru": "/guides/hokkej-v-vengrii"}, "japan": {"en": "/guides/hockey-in-japan", "ru": "/guides/hokkej-v-yaponii"}, "kazakhstan": {"en": "/guides/hockey-in-kazakhstan", "ru": "/guides/hokkej-v-kazahstane"}, "latvia": {"en": "/guides/hockey-in-latvia", "ru": "/guides/hokkej-v-latvii"}, "lithuania": {"en": "/guides/hockey-in-lithuania", "ru": "/guides/hokkej-v-litve"}, "romania": {"en": "/guides/hockey-in-romania", "ru": "/guides/hokkej-v-rumynii"}, "slovenia": {"en": "/guides/hockey-in-slovenia", "ru": "/guides/hokkej-v-slovenii"}, "spain": {"en": "/guides/hockey-in-spain", "ru": "/guides/hokkej-v-ispanii"}, "serbia": {"en": "/guides/hockey-in-serbia", "ru": "/guides/hokkej-v-serbii"}, "croatia": {"en": "/guides/hockey-in-croatia", "ru": "/guides/hokkej-v-horvatii"}, "belgium": {"en": "/guides/hockey-in-belgium", "ru": "/guides/hokkej-v-belgii"}, "австрия": {"en": "/guides/hockey-in-austria", "ru": "/guides/hokkej-v-avstrii"}, "бельгия": {"en": "/guides/hockey-in-belgium", "ru": "/guides/hokkej-v-belgii"}, "великобритания": {"en": "/guides/hockey-in-united-kingdom", "ru": "/guides/hokkej-v-velikobritanii"}, "венгрия": {"en": "/guides/hockey-in-hungary", "ru": "/guides/hokkej-v-vengrii"}, "германия": {"en": "/guides/hockey-in-germany", "ru": "/guides/hokkej-v-germanii"}, "дания": {"en": "/guides/hockey-in-denmark", "ru": "/guides/hokkej-v-danii"}, "испания": {"en": "/guides/hockey-in-spain", "ru": "/guides/hokkej-v-ispanii"}, "италия": {"en": "/guides/hockey-in-italy", "ru": "/guides/hokkej-v-italii"}, "казахстан": {"en": "/guides/hockey-in-kazakhstan", "ru": "/guides/hokkej-v-kazahstane"}, "канада": {"en": "/guides/hockey-in-canada", "ru": "/guides/hokkej-v-kanade"}, "латвия": {"en": "/guides/hockey-in-latvia", "ru": "/guides/hokkej-v-latvii"}, "литва": {"en": "/guides/hockey-in-lithuania", "ru": "/guides/hokkej-v-litve"}, "нидерланды": {"en": "/guides/hockey-in-netherlands", "ru": "/guides/hokkej-v-niderlandah"}, "норвегия": {"en": "/guides/hockey-in-norway", "ru": "/guides/hokkej-v-norvegii"}, "польша": {"en": "/guides/hockey-in-poland", "ru": "/guides/hokkej-v-polshe"}, "румыния": {"en": "/guides/hockey-in-romania", "ru": "/guides/hokkej-v-rumynii"}, "сша": {"en": "/guides/hockey-in-usa", "ru": "/guides/hokkej-v-ssha"}, "сербия": {"en": "/guides/hockey-in-serbia", "ru": "/guides/hokkej-v-serbii"}, "словакия": {"en": "/guides/hockey-in-slovakia", "ru": "/guides/hokkej-v-slovakii"}, "словения": {"en": "/guides/hockey-in-slovenia", "ru": "/guides/hokkej-v-slovenii"}, "финляндия": {"en": "/guides/hockey-in-finland", "ru": "/guides/hokkej-v-finlyandii"}, "франция": {"en": "/guides/hockey-in-france", "ru": "/guides/hokkej-vo-francii"}, "хорватия": {"en": "/guides/hockey-in-croatia", "ru": "/guides/hokkej-v-horvatii"}, "чехия": {"en": "/guides/hockey-in-czechia", "ru": "/guides/hokkej-v-chexii"}, "швейцария": {"en": "/guides/hockey-in-switzerland", "ru": "/guides/hokkej-v-shvejcarii"}, "швеция": {"en": "/guides/hockey-in-sweden", "ru": "/guides/hokkej-v-shvecii"}, "эстония": {"en": "/guides/hockey-in-estonia", "ru": "/guides/hokkej-v-estonii"}, "япония": {"en": "/guides/hockey-in-japan", "ru": "/guides/hokkej-v-yaponii"}};
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var prefixFor = function (lang) { return lang === "ru" ? "/ru" : ""; };

  function renderLeagueCard(l, lang) {
    var name = l.flag + " " + l.name;
    var title = l.url ? '<a href="' + esc(prefixFor(lang) + l.url) + '" data-calc-link="league">' + name + "</a>" : name;
    return '<div class="calc-league"><b>' + title + "</b>" +
      '<span class="tier tier-' + l.tier + '">' + l.tier + "</span>" +
      "<small>" + l.country + " · " + l.note + "</small></div>";
  }

  // Query string for the "send your profile" link. League names come from the
  // reference data and are joined with "|" (no league name contains one).
  function buildCtaQuery(input, r, note) {
    var params = [
      ["note", note],
      ["goal", input.goal || ""],
      ["pos", input.pos],
      ["year", input.year],
      ["calc_band", r.bandKey],
      ["calc_score", r.score],
      ["calc_leagues", r.candidates.slice(0, 3).map(function (l) { return l.name; }).join("|")]
    ];
    return params.map(function (p) { return p[0] + "=" + encodeURIComponent(p[1]); }).join("&");
  }


  // Leagues of one country that pass the same band / passport / age filters
  // as calculate(). Used only to annotate the result for a visitor who came
  // from that country's guide.
  function filterForFocus(leagues, r, input, guide) {
    var names = [], countryName = "";
    (leagues || []).forEach(function (l) {
      var g = COUNTRY_GUIDES[String(l.country).toLowerCase()];
      if (!g || g.en !== guide.en) return;
      countryName = countryName || l.country;
      if (l.tier < r.band[0] || l.tier > r.band[1]) return;
      if (!input.eu && l.open === "low") return;
      if (l.age === "junior" && r.playerAge > JUNIOR_AGE_CEILING) return;
      if (names.indexOf(l.name) < 0) names.push(l.name);
    });
    return { names: names.slice(0, 4), countryName: countryName };
  }

  function init(lang) {
    var form = document.getElementById("calc");
    if (!form) return;
    var strings = STRINGS[lang] || STRINGS.ru;
    var data = (root.EHA_LEAGUES || { leagues: [] }).leagues;
    var val = function (id) { return document.getElementById(id).value; };
    var num = function (id) { return parseFloat(document.getElementById(id).value) || 0; };

    // Bug F: points/games are only meaningful (and only required) for
    // non-goalies — toggle `required` instead of silently ignoring blanks.
    var posSelect = document.getElementById("c-pos");
    var pointsInput = document.getElementById("c-points");
    var gamesInput = document.getElementById("c-games");
    var toggleStatsRequired = function () {
      var isGoalie = posSelect.value === "goalie";
      pointsInput.required = !isGoalie;
      gamesInput.required = !isGoalie;
    };
    posSelect.addEventListener("change", toggleStatsRequired);
    toggleStatsRequired();

    var resultEl = document.getElementById("calc-result");
    var bandEl = document.getElementById("calc-band");
    var ctaEl = document.getElementById("calc-cta");

    // First interaction with the calculator = the "started" step of the funnel.
    var started = false;
    form.addEventListener("focusin", function () {
      if (started) return;
      started = true;
      if (root.ehaTrack) root.ehaTrack("calculator_start");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = {
        year: num("c-year"),
        pos: val("c-pos"),
        eu: val("c-eu") === "yes",
        level: val("c-level"),
        points: num("c-points"),
        games: num("c-games"),
        seasons: num("c-seasons"),
        goal: document.getElementById("c-goal") ? val("c-goal") : ""
      };
      var r = calculate(input, data, lang);

      bandEl.textContent = r.label;
      document.getElementById("calc-summary").textContent = r.summary;
      document.getElementById("calc-leagues").innerHTML =
        r.candidates.map(function (l) { return renderLeagueCard(l, lang); }).join("") || '<p class="tool-note">' + strings.noLeagues + "</p>";
      var tips = r.tips.slice();
      if (input.goal && strings.goalTips[input.goal]) tips.unshift(strings.goalTips[input.goal]);
      document.getElementById("calc-tips").innerHTML = tips.map(function (t) { return "<li>" + t + "</li>"; }).join("");
      // Country guides for the suggested leagues: the route article -> calculator -> country -> application.
      var countriesEl = document.getElementById("calc-countries");
      if (countriesEl) {
        var seen = {}, links = [];
        r.candidates.forEach(function (l) {
          var g = COUNTRY_GUIDES[String(l.country).toLowerCase()];
          if (!g || seen[l.country]) return;
          seen[l.country] = true;
          links.push('<a href="' + esc(prefixFor(lang) + g[lang === "ru" ? "ru" : "en"]) + '" data-calc-link="country">' + strings.countryGuide + esc(l.country) + "</a>");
        });
        var html = links.slice(0, 6).join(" · ");
        // Arriving from a country page (?country=sweden): say honestly whether
        // that country's leagues fall within this player's indicative range,
        // using the same filters as the main result, not a fixed list.
        var focusKey = "";
        try { focusKey = (new URLSearchParams(root.location.search).get("country") || "").toLowerCase(); } catch (e) {}
        var focusGuide = focusKey && COUNTRY_GUIDES[focusKey];
        if (focusGuide) {
          var fit = filterForFocus(data, r, input, focusGuide);
          var cname = fit.countryName || focusKey;
          var focusHtml = '<span class="calc-focus">' + esc(fit.names.length ? strings.focusFit(cname, fit.names.join(", ")) : strings.focusNone(cname)) +
            ' <a href="' + esc(prefixFor(lang) + focusGuide[lang === "ru" ? "ru" : "en"]) + '" data-calc-link="country">' + esc(strings.focusLink(cname)) + "</a></span>";
          html = focusHtml + (html ? "<br>" + html : "");
        }
        countriesEl.innerHTML = html + '<span class="calc-prelim">' + esc(strings.prelim) + "</span>";
        countriesEl.parentNode.hidden = false;
      }

      // Bug G: carry the result into the contact form. `note` keeps the
      // human-readable prefill for the message field; the structured
      // calc_* / pos / year params let the form fill position and birth year
      // and hand the agent the band, score and suggested leagues (see site.js).
      if (ctaEl) {
        var posLabel = document.querySelector('#c-pos option[value="' + input.pos + '"]').textContent;
        var note = strings.ctaNote({ label: r.label, score: r.score, pos: posLabel, year: input.year, eu: input.eu });
        var base = ctaEl.getAttribute("href").split("?")[0];
        ctaEl.href = base + "?" + buildCtaQuery(input, r, note);
      }

      resultEl.hidden = false;
      // aria-live on #calc-result (set in the HTML) announces the update for
      // screen readers; moving focus to the heading (bug H) additionally
      // gets keyboard/AT users there, not just scrolls sighted users to it.
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
      bandEl.focus();
      if (root.ehaTrack) root.ehaTrack("calculator_done", { band: r.bandKey, score: r.score, goal: input.goal || "" });
    });

    // Clicks from the result to a league or country page. Only the page path is sent.
    resultEl.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a[data-calc-link]");
      if (!link || !root.ehaTrack) return;
      root.ehaTrack("calculator_result_click", { link_type: link.getAttribute("data-calc-link"), destination: link.getAttribute("href") });
    });
  }

  var api = { BASE: BASE, PPG: PPG, STRINGS: STRINGS, calculate: calculate, buildCtaQuery: buildCtaQuery, filterForFocus: filterForFocus, COUNTRY_GUIDES: COUNTRY_GUIDES };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.EHA_LEVEL_CALCULATOR = api;
    if (typeof document !== "undefined") {
      init(document.documentElement.lang === "en" ? "en" : "ru");
    }
  }
})(typeof window !== "undefined" ? window : this);
