/* "Is your child ready for a hockey move abroad?" — readiness checklist on the
   parents hub. Runs entirely in the browser: no answers are stored or sent,
   and it asks for no documents or personal data about the minor. */
(function (root) {
  "use strict";

  var Q = {
    en: [
      { id: "daily", q: "Everyday independence", h: "Gets up on time, packs the hockey bag, does laundry, manages simple meals and pocket money without reminders.",
        prep: "Practise a “away week” at home: own alarm, laundry, a weekly budget.", ask: "Who checks the daily routine, meals and sleep, and how often do they report to you?" },
      { id: "lang", q: "Language", h: "Can explain a problem to a coach, teacher or doctor in English or the local language.",
        prep: "Book language lessons now and agree which language school and team use.", ask: "Which language do the coaches and the school use, and is there language support?" },
      { id: "school", q: "School plan", h: "There is a confirmed school place (or online option) that fits training and away games.",
        prep: "Get written confirmation of enrolment, timetable and how grades will be recognised at home.", ask: "Which school exactly, who arranges enrolment, and what happens to school if the player changes team?" },
      { id: "ice", q: "Playing practice", h: "Has played regular minutes in the current season and has a recent full game on video.",
        prep: "Collect full-game video and the coach's written feedback before the move.", ask: "Which team will the player be registered with, and how will the role be reviewed during the season?" },
      { id: "team", q: "Adapting to a new group", h: "Has handled a new team, camp or school before and makes contact with new people.",
        prep: "A camp or tryout week away from home is a useful rehearsal.", ask: "How are new and foreign players integrated in the first weeks?" },
      { id: "help", q: "Asking for help", h: "Will tell a parent, coach or another adult when something is wrong — injury, homesickness, pressure.",
        prep: "Agree a weekly call and a simple signal for “I need help now”.", ask: "Who is the responsible adult on site, and who do we call in an emergency?" },
      { id: "parents", q: "Parents in the decision", h: "Both parents (or legal guardians) know the plan, the budget and who signs what.",
        prep: "Write down the budget, the exit plan and who gives consent and signs for the minor.", ask: "Which documents need a parent's or guardian's signature or consent under the country's and the programme's rules?" }
    ],
    ru: [
      { id: "daily", q: "Бытовая самостоятельность", h: "Встаёт вовремя, собирает баул, стирает, справляется с простой едой и карманными деньгами без напоминаний.",
        prep: "Устройте дома «неделю отъезда»: свой будильник, стирка, недельный бюджет.", ask: "Кто следит за распорядком, питанием и сном и как часто сообщает вам?" },
      { id: "lang", q: "Язык", h: "Может объяснить проблему тренеру, учителю или врачу на английском или местном языке.",
        prep: "Начните занятия языком сейчас и выясните, на каком языке работают школа и команда.", ask: "На каком языке работают тренеры и школа, есть ли языковая поддержка?" },
      { id: "school", q: "План учёбы", h: "Есть подтверждённое место в школе (или онлайн-обучение), совместимое с тренировками и выездами.",
        prep: "Получите письменное подтверждение зачисления, расписание и порядок признания оценок дома.", ask: "Какая именно школа, кто оформляет зачисление и что будет с учёбой, если игрок сменит команду?" },
      { id: "ice", q: "Игровая практика", h: "В этом сезоне регулярно получает игровое время, есть свежая полная игра на видео.",
        prep: "Соберите видео полных игр и письменный отзыв тренера до переезда.", ask: "За какую команду игрок будет заявлен и как будут пересматривать его роль по ходу сезона?" },
      { id: "team", q: "Адаптация к новому коллективу", h: "Уже переходил в новую команду, лагерь или школу и легко знакомится.",
        prep: "Лагерь или просмотр на неделю вдали от дома — хорошая репетиция.", ask: "Как в команде принимают новых и иностранных игроков в первые недели?" },
      { id: "help", q: "Готовность обращаться за помощью", h: "Скажет родителю, тренеру или другому взрослому, если что-то не так: травма, тоска по дому, давление.",
        prep: "Договоритесь о еженедельном звонке и простом сигнале «мне нужна помощь сейчас».", ask: "Кто ответственный взрослый на месте и кому звонить в экстренной ситуации?" },
      { id: "parents", q: "Участие родителей в решении", h: "Оба родителя (или законные представители) знают план, бюджет и кто что подписывает.",
        prep: "Запишите бюджет, план выхода и кто даёт согласие и подписывает за несовершеннолетнего.", ask: "Какие документы требуют подписи или согласия родителя либо законного представителя по правилам страны и программы?" }
    ]
  };
  var L = {
    en: { yes: "Yes", part: "Partly", no: "Not yet", result: "Your result", answered: "Answer all seven questions to see the result.",
      ready: "Ready in", partly: "Partly ready in", notyet: "Not yet ready in",
      sumAll: "Strong starting point. Still confirm school, housing and the responsible adult in writing before any payment.",
      sumSome: "A move can work, but prepare the points below first before the move.",
      sumMany: "Several basics are not in place yet. Consider a camp, a tryout week or a closer team before a full move.",
      prep: "What to prepare", ask: "Questions to ask the club or academy", cta: "Discuss your player's options with EHA", wa: "Ask on WhatsApp",
      ctaText: "Tell us the birth year, position, current league and countries of interest. Nothing from this checklist is sent or saved.", reset: "Start again" },
    ru: { yes: "Да", part: "Частично", no: "Пока нет", result: "Ваш результат", answered: "Ответьте на все семь вопросов, чтобы увидеть результат.",
      ready: "Готов", partly: "Частично готов", notyet: "Пока не готов",
      sumAll: "Хорошая стартовая позиция. До любой оплаты всё равно подтвердите письменно школу, жильё и ответственного взрослого.",
      sumSome: "Переезд возможен, но сначала подготовьте пункты ниже до переезда.",
      sumMany: "Несколько базовых вещей пока не готовы. Рассмотрите лагерь, неделю просмотра или команду ближе к дому до полного переезда.",
      prep: "Что подготовить", ask: "Вопросы клубу или академии", cta: "Обсудить маршрут игрока с EHA", wa: "Написать в WhatsApp",
      ctaText: "Укажите год рождения, позицию, текущую лигу и страны интереса. Ответы этого чек-листа никуда не отправляются и не сохраняются.", reset: "Начать заново" }
  };

  // Pure: answers {id: "yes"|"part"|"no"} -> summary for tests and UI.
  function evaluate(questions, answers) {
    var out = { yes: [], part: [], no: [], complete: true };
    questions.forEach(function (q) {
      var a = answers[q.id];
      if (!a) out.complete = false; else out[a].push(q.id);
    });
    out.level = out.no.length === 0 && out.part.length <= 1 ? "all" : (out.no.length >= 3 ? "many" : "some");
    return out;
  }

  function init(el) {
    var lang = (document.documentElement.lang || "en").slice(0, 2) === "ru" ? "ru" : "en";
    var qs = Q[lang], t = L[lang];
    var cta = el.getAttribute("data-cta") || "/contact", wa = el.getAttribute("data-wa") || "";
    var form = document.createElement("form");
    form.className = "readiness";
    form.innerHTML = qs.map(function (q, i) {
      return '<fieldset><legend>' + (i + 1) + ". " + q.q + '</legend><p class="rq-hint">' + q.h + '</p><div class="rq-opts">' +
        ["yes", "part", "no"].map(function (v) { return '<label><input type="radio" name="rq-' + q.id + '" value="' + v + '"><span>' + t[v] + "</span></label>"; }).join("") + "</div></fieldset>";
    }).join("") + '<div class="readiness-result" aria-live="polite"><p>' + t.answered + '</p></div><p><button type="reset" class="text-link">' + t.reset + "</button></p>";
    el.appendChild(form);
    var res = form.querySelector(".readiness-result");
    function render() {
      var answers = {};
      qs.forEach(function (q) { var c = form.querySelector('input[name="rq-' + q.id + '"]:checked'); if (c) answers[q.id] = c.value; });
      var r = evaluate(qs, answers);
      if (!r.complete) { res.innerHTML = "<p>" + t.answered + "</p>"; return; }
      var name = function (id) { return qs.filter(function (q) { return q.id === id; })[0]; };
      var gaps = r.no.concat(r.part).map(name);
      var line = function (label, ids) { return ids.length ? "<li><strong>" + label + ":</strong> " + ids.map(function (id) { return name(id).q; }).join(", ") + "</li>" : ""; };
      var h = "<h3>" + t.result + "</h3><p>" + (r.level === "all" ? t.sumAll : r.level === "many" ? t.sumMany : t.sumSome) + "</p><ul>" +
        line(t.ready, r.yes) + line(t.partly, r.part) + line(t.notyet, r.no) + "</ul>";
      var asks = (gaps.length ? gaps : qs.filter(function (q) { return q.id === "school" || q.id === "help" || q.id === "parents"; }));
      if (gaps.length) h += "<h4>" + t.prep + "</h4><ul>" + gaps.map(function (q) { return "<li>" + q.prep + "</li>"; }).join("") + "</ul>";
      h += "<h4>" + t.ask + "</h4><ul>" + asks.map(function (q) { return "<li>" + q.ask + "</li>"; }).join("") + "</ul>";
      h += '<div class="readiness-cta"><p>' + t.ctaText + '</p><div class="actions"><a class="btn primary" href="' + cta + '">' + t.cta + "</a>" + (wa ? '<a class="text-link" href="' + wa + '" target="_blank" rel="noopener">' + t.wa + " ↗</a>" : "") + "</div></div>";
      res.innerHTML = h;
    }
    form.addEventListener("change", render);
    form.addEventListener("reset", function () { setTimeout(render, 0); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
  }

  var api = { evaluate: evaluate, QUESTIONS: Q };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    var boot = function () { var el = document.getElementById("readiness-checklist"); if (el) init(el); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }
})(typeof window !== "undefined" ? window : this);
