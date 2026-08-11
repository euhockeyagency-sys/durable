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
      nonEu: "Without an EU passport you take an import spot: a club will sign you only if you're clearly better than a local, and you'll need a work visa. Check whether you may qualify for European citizenship.",
      solidProfile: "Your profile looks solid — strengthen the presentation: fresh video and an up-to-date Elite Prospects.",
      prepareAhead: "Prepare your hockey resume and video in advance: when a club has an opening, the decision is made fast.",
      bandTop: "Top divisions in Europe",
      bandMid: "Second and third divisions, including the top divisions of smaller countries",
      bandLow: "Third level and lower divisions",
      summaryPrefix: "Overall, your realistic estimate is divisions around level ",
      summarySuffixEu: ". Below are leagues that genuinely consider a profile like yours.",
      summarySuffixNonEu: ". Below are leagues that genuinely consider a profile like yours; the list accounts for the fact that you take an import spot.",
      noLeagues: "No leagues in the reference match these parameters — send your profile and we'll review it manually.",
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
      nonEu: "Без паспорта ЕС вы занимаете легионерское место: клуб возьмёт вас, только если вы заметно сильнее местного игрока. Проверьте, нет ли у вас оснований для европейского гражданства.",
      solidProfile: "Профиль выглядит собранным — усильте презентацию: свежее видео и актуальный Elite Prospects.",
      prepareAhead: "Подготовьте хоккейное резюме и видео заранее: когда у клуба открывается место, решение принимается быстро.",
      bandTop: "Высшие дивизионы Европы",
      bandMid: "Вторые и третьи дивизионы, включая высшие дивизионы малых стран",
      bandLow: "Третий уровень и низшие дивизионы",
      summaryPrefix: "По совокупности факторов реалистичный ориентир — дивизионы уровня ",
      summarySuffixEu: ". Ниже — лиги, где профиль вроде вашего действительно рассматривают.",
      summarySuffixNonEu: ". Ниже — лиги, где профиль вроде вашего действительно рассматривают; список учитывает, что вы занимаете легионерское место.",
      noLeagues: "Под такие параметры подходящих лиг в справочнике не нашлось — отправьте профиль, разберём вручную.",
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
    var band, label;
    if (score >= 82) { band = [1, 2]; label = strings.bandTop; }
    else if (score >= 48) { band = [2, 3]; label = strings.bandMid; }
    else { band = [3, 3]; label = strings.bandLow; }

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

    return { score: score, elite: elite, band: band, label: label, summary: summary, candidates: candidates, tips: tips, playerAge: playerAge };
  }

  function renderLeagueCard(l) {
    return '<div class="calc-league"><b>' + l.flag + " " + l.name + "</b>" +
      '<span class="tier tier-' + l.tier + '">' + l.tier + "</span>" +
      "<small>" + l.country + " · " + l.note + "</small></div>";
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

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = {
        year: num("c-year"),
        pos: val("c-pos"),
        eu: val("c-eu") === "yes",
        level: val("c-level"),
        points: num("c-points"),
        games: num("c-games"),
        seasons: num("c-seasons")
      };
      var r = calculate(input, data, lang);

      bandEl.textContent = r.label;
      document.getElementById("calc-summary").textContent = r.summary;
      document.getElementById("calc-leagues").innerHTML =
        r.candidates.map(renderLeagueCard).join("") || '<p class="tool-note">' + strings.noLeagues + "</p>";
      document.getElementById("calc-tips").innerHTML = r.tips.map(function (t) { return "<li>" + t + "</li>"; }).join("");

      // Bug G: carry the result into the contact form as a prefilled note,
      // the same way country pages already pass `?country=` (see site.js).
      if (ctaEl) {
        var posLabel = document.querySelector('#c-pos option[value="' + input.pos + '"]').textContent;
        var note = strings.ctaNote({ label: r.label, score: r.score, pos: posLabel, year: input.year, eu: input.eu });
        var base = ctaEl.getAttribute("href").split("?")[0];
        ctaEl.href = base + "?note=" + encodeURIComponent(note);
      }

      resultEl.hidden = false;
      // aria-live on #calc-result (set in the HTML) announces the update for
      // screen readers; moving focus to the heading (bug H) additionally
      // gets keyboard/AT users there, not just scrolls sighted users to it.
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
      bandEl.focus();
      if (root.ym) root.ym(110889446, "reachGoal", "calculator_done");
    });
  }

  var api = { BASE: BASE, PPG: PPG, STRINGS: STRINGS, calculate: calculate };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.EHA_LEVEL_CALCULATOR = api;
    if (typeof document !== "undefined") {
      init(document.documentElement.lang === "en" ? "en" : "ru");
    }
  }
})(typeof window !== "undefined" ? window : this);
