/* /for-clubs: structured club brief with WhatsApp hand-off and the
   "Available players" showcase. The server form (#club-request-form ->
   /api/club-request, handled in site.js) still works: this script fills its
   hidden positionNeeded and message fields from the brief. Pure helpers are
   exported for tests. */
(function (root) {
  "use strict";

  var WA = "https://wa.me/375297957818";
  var T = {
    en: {
      hello: "Hello EHA, club brief:",
      club: "Club", country: "Country", level: "League / level", timing: "Season / joining",
      position: "Position", hand: "Shooting side", elig: "Eligibility", budget: "Budget", housing: "Housing",
      transport: "Transport", other: "Other conditions", comment: "Comment",
      any: "any", hands: { L: "left", R: "right", any: "any" },
      eligs: { EU: "EU passport", nonEU: "non-EU (import slot available)", any: "any", other: "other" },
      periods: { month: "per month", season: "per season", discuss: "to discuss" },
      housings: { provided: "provided", partly: "partly covered", none: "not provided", discuss: "to discuss" },
      transports: { car: "car provided", public: "public transport / bike", none: "not provided", discuss: "to discuss" },
      empty: "Choose at least the position or fill in a field to build the brief.",
      request: "Hello EHA, please send the full profile of player {code}.",
      listRequest: "Hello EHA, please send the current list of available players",
      filters: { pos: "position", hand: "shooting side", passport: "passport" },
      card: { hand: "Shoots", age: "Age group", passport: "Passport / status", league: "Last league", available: "Availability", confirmed: "confirmed" },
      req: "Request profile", none: "Request the current list of players from EHA", noneMatch: "No published profiles match these filters.",
      noneText: "Profiles appear here only with the player's consent. EHA shares the current list and full profiles directly.",
      listBtn: "Request the list via WhatsApp"
    },
    ru: {
      hello: "Здравствуйте, EHA! Бриф клуба:",
      club: "Клуб", country: "Страна", level: "Лига / уровень", timing: "Сезон / срок присоединения",
      position: "Позиция", hand: "Хват", elig: "Паспорт / допуск", budget: "Бюджет", housing: "Жильё",
      transport: "Транспорт", other: "Другие условия", comment: "Комментарий",
      any: "любая", hands: { L: "левый", R: "правый", any: "любой" },
      eligs: { EU: "паспорт ЕС", nonEU: "non-EU (есть место легионера)", any: "любой", other: "другое" },
      periods: { month: "в месяц", season: "за сезон", discuss: "обсуждается" },
      housings: { provided: "предоставляется", partly: "частично", none: "не предоставляется", discuss: "обсуждается" },
      transports: { car: "автомобиль", public: "общественный транспорт / велосипед", none: "не предоставляется", discuss: "обсуждается" },
      empty: "Выберите хотя бы позицию или заполните поле, чтобы собрать бриф.",
      request: "Здравствуйте, EHA! Пришлите, пожалуйста, полный профиль игрока {code}.",
      listRequest: "Здравствуйте, EHA! Пришлите, пожалуйста, актуальный список свободных игроков",
      filters: { pos: "позиция", hand: "хват", passport: "паспорт" },
      card: { hand: "Хват", age: "Возраст", passport: "Паспорт / статус", league: "Последняя лига", available: "Доступность", confirmed: "подтверждено" },
      req: "Запросить профиль", none: "Запросите актуальный список игроков у EHA", noneMatch: "Нет опубликованных профилей под эти фильтры.",
      noneText: "Профили появляются здесь только с согласия игрока. Актуальный список и полные профили EHA передаёт напрямую.",
      listBtn: "Запросить список в WhatsApp"
    }
  };

  function clean(v) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim(); }

  // brief: {clubName, country, level, timing, positions[], hand, elig, eligNote,
  //          budget, currency, period, housing, transport, other, comment}
  function briefLines(brief, lang) {
    var t = T[lang] || T.en, lines = [];
    function add(label, value) { value = clean(value); if (value) lines.push(label + ": " + value); }
    add(t.club, brief.clubName);
    add(t.country, brief.country);
    add(t.level, brief.level);
    add(t.timing, brief.timing);
    var pos = (brief.positions || []).map(function (p) { return p === "any" ? t.any : p; });
    add(t.position, pos.join(", "));
    if (brief.hand) add(t.hand, t.hands[brief.hand] || brief.hand);
    if (brief.elig) {
      var e = t.eligs[brief.elig] || brief.elig, note = clean(brief.eligNote);
      add(t.elig, note ? e + " — " + note : e);
    } else add(t.elig, brief.eligNote);
    var amount = clean(brief.budget);
    if (amount) add(t.budget, [amount, clean(brief.currency), brief.period ? t.periods[brief.period] : ""].filter(Boolean).join(" "));
    else if (brief.period === "discuss") add(t.budget, t.periods.discuss);
    if (brief.housing) add(t.housing, t.housings[brief.housing]);
    if (brief.transport) add(t.transport, t.transports[brief.transport]);
    add(t.other, brief.other);
    add(t.comment, brief.comment);
    return lines;
  }

  function briefText(brief, lang) {
    var lines = briefLines(brief, lang);
    return lines.length ? (T[lang] || T.en).hello + "\n" + lines.join("\n") : "";
  }

  function waLink(text) { return WA + "?text=" + encodeURIComponent(text); }

  function filterPlayers(players, f) {
    return players.filter(function (p) {
      return (!f.pos || f.pos === "any" || p.position === f.pos) &&
        (!f.hand || f.hand === "any" || p.hand === f.hand) &&
        (!f.passport || f.passport === "any" || p.passport === f.passport);
    });
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function loc(v, lang) { return v && typeof v === "object" ? (v[lang] || v.en) : v; }

  function initBrief(form, lang) {
    var t = T[lang];
    var preview = document.getElementById("brief-preview");
    var waBtn = document.getElementById("brief-wa");
    var posHidden = form.querySelector('[name="positionNeeded"]');
    var msgHidden = form.querySelector('[name="message"]');
    function val(name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value : ""; }
    function checkedVal(name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : ""; }
    function read() {
      return {
        clubName: val("clubName"), country: val("country"), level: val("level"), timing: val("briefTiming"),
        positions: Array.prototype.map.call(form.querySelectorAll('[name="briefPos"]:checked'), function (el) { return el.value; }),
        hand: checkedVal("briefHand"), elig: checkedVal("briefElig"), eligNote: val("briefEligNote"),
        budget: val("briefBudget"), currency: val("briefCurrency"), period: val("briefPeriod"),
        housing: val("briefHousing"), transport: val("briefTransport"), other: val("briefOther"), comment: val("briefComment")
      };
    }
    function update() {
      var b = read();
      // "any" excludes specific positions and vice versa
      var text = briefText(b, lang);
      preview.textContent = text || t.empty;
      preview.classList.toggle("is-empty", !text);
      waBtn.setAttribute("href", waLink(text || t.hello));
      waBtn.setAttribute("aria-disabled", text ? "false" : "true");
      posHidden.value = b.positions.map(function (p) { return p === "any" ? t.any : p; }).join(", ");
      msgHidden.value = text;
    }
    form.addEventListener("input", update);
    form.addEventListener("change", function (ev) {
      var el = ev.target;
      if (el.name === "briefPos" && el.checked) {
        Array.prototype.forEach.call(form.querySelectorAll('[name="briefPos"]'), function (o) {
          if (o !== el && (el.value === "any" || o.value === "any")) o.checked = false;
        });
      }
      update();
    });
    form.addEventListener("reset", function () { setTimeout(function () { showChannel(); update(); }, 0); });
    // Channel choice: WhatsApp hand-off or the site form (email + Telegram).
    function channel() { var c = form.querySelector('[name="briefChannel"]:checked'); return c ? c.value : "wa"; }
    function showChannel() {
      var ch = channel();
      Array.prototype.forEach.call(form.querySelectorAll(".brief-send"), function (p) { p.hidden = p.getAttribute("data-channel") !== ch; });
    }
    form.addEventListener("change", function (ev) { if (ev.target.name === "briefChannel") showChannel(); });
    // Enter in a field while WhatsApp is chosen must not post the site form.
    document.addEventListener("submit", function (ev) {
      if (ev.target === form && channel() !== "site") { ev.preventDefault(); ev.stopImmediatePropagation(); }
    }, true);
    showChannel();
    waBtn.addEventListener("click", function (ev) {
      if (waBtn.getAttribute("aria-disabled") === "true") { ev.preventDefault(); preview.focus(); return; }
      if (window.ehaTrack) window.ehaTrack("club_brief_whatsapp", { lang: lang });
    });
    update();
  }

  function initShowcase(box, data, lang) {
    var t = T[lang];
    var out = box.querySelector("[data-players]");
    var sel = function (n) { return box.querySelector('[data-filter="' + n + '"]'); };
    function render() {
      var f = { pos: sel("pos").value, hand: sel("hand").value, passport: sel("passport").value };
      var list = filterPlayers(data.players || [], f);
      if (!list.length) {
        var parts = [];
        if (f.pos !== "any") parts.push(t.filters.pos + " " + f.pos);
        if (f.hand !== "any") parts.push(t.filters.hand + " " + t.hands[f.hand]);
        if (f.passport !== "any") parts.push(t.filters.passport + " " + f.passport);
        var msg = t.listRequest + (parts.length ? " (" + parts.join(", ") + ")" : "") + ".";
        out.innerHTML = '<div class="players-empty"><h3>' + t.none + "</h3><p>" + ((data.players || []).length ? t.noneMatch + " " : "") + t.noneText +
          '</p><a class="btn primary" target="_blank" rel="noopener" href="' + esc(waLink(msg)) + '">' + t.listBtn + "</a></div>";
        return;
      }
      out.innerHTML = '<div class="players-grid">' + list.map(function (p) {
        var c = t.card;
        return '<article class="player-card"><header><span class="player-pos">' + esc(p.position) + '</span><b>' + esc(p.code) + "</b></header><dl>" +
          "<div><dt>" + c.hand + "</dt><dd>" + esc(t.hands[p.hand] || p.hand) + "</dd></div>" +
          "<div><dt>" + c.age + "</dt><dd>" + esc(p.age) + "</dd></div>" +
          "<div><dt>" + c.passport + "</dt><dd>" + esc(p.passport + (p.passportNote ? " — " + loc(p.passportNote, lang) : "")) + "</dd></div>" +
          "<div><dt>" + c.league + "</dt><dd>" + esc(p.lastLeague) + "</dd></div>" +
          "<div><dt>" + c.available + "</dt><dd>" + esc(loc(p.available, lang)) + (p.confirmed ? ' <small>(' + c.confirmed + " " + esc(p.confirmed) + ")</small>" : "") + "</dd></div></dl>" +
          '<a class="btn ghost" target="_blank" rel="noopener" href="' + esc(waLink(t.request.replace("{code}", p.code))) + '">' + t.req + "</a></article>";
      }).join("") + "</div>";
    }
    Array.prototype.forEach.call(box.querySelectorAll("[data-filter]"), function (s) { s.addEventListener("change", render); });
    render();
  }

  var api = { briefText: briefText, briefLines: briefLines, waLink: waLink, filterPlayers: filterPlayers, WA: WA };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    var boot = function () {
      var lang = (document.documentElement.lang || "en").slice(0, 2) === "ru" ? "ru" : "en";
      var form = document.getElementById("club-request-form");
      if (form && document.getElementById("brief-preview")) initBrief(form, lang);
      var box = document.getElementById("available-players");
      if (box) initShowcase(box, root.EHA_AVAILABLE_PLAYERS || { players: [] }, lang);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }
})(typeof window !== "undefined" ? window : this);
