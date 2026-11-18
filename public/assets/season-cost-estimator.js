/* Season Cost Estimator (EN /junior-season-cost-calculator, RU /kalkulyator-stoimosti-sezona).
   Figures live in season-cost-data.js; this file only reads and adds them up.
   Unknown lines are never treated as zero: they are listed as missing and the
   family can type in its own amount. Pure functions are exported for tests. */
(function (root) {
  "use strict";

  var MAIN = ["fee", "housing", "meals", "equipment", "insurance", "pocket"];
  var EXTRA = ["school", "travel"];
  var ALL = MAIN.concat(EXTRA);

  var T = {
    en: {
      lines: { fee: "Team or programme fee", housing: "Housing", meals: "Meals", equipment: "Equipment", insurance: "Insurance", pocket: "Pocket money", school: "School / tuition", travel: "Travel" },
      markets: { sweden: "Sweden", czechia: "Czechia", austria: "Austria", finland: "Finland", switzerland: "Switzerland", usa: "USA", canada: "Canada" },
      types: { club: "Club team", academy: "Pay-to-play academy", covered: "Programme with confirmed partial cost coverage" },
      included: "included in", covered: "covered by the programme", unknown: "no verified data",
      own: "your amount", example: "Example programme", programme: "Programme data",
      cur: "Currency", period: "Period", season: "Season of data", source: "Source", checked: "checked",
      known: "Known part", total: "Estimated total", missing: "Missing lines (not counted)",
      extras: "Shown separately", insufficient: "Insufficient data",
      insufficientText: "We have no verified published figures for this combination. Enter the amounts from the club's or academy's written offer: blank lines stay listed as missing.",
      ownCur: "Currency of your figures", range: "Across the example programmes",
      noTypes: "No programme type with documented terms for this market and age group.",
      cta: "Discuss the budget with EHA", wa: "Ask on WhatsApp",
      ctaText: "Send the birth year, position, current league and the countries you are considering. EHA will go through the offer line by line with you."
    },
    ru: {
      lines: { fee: "Взнос команды или программы", housing: "Проживание", meals: "Питание", equipment: "Экипировка", insurance: "Страховка", pocket: "Карманные расходы", school: "Школа / обучение", travel: "Поездки" },
      markets: { sweden: "Швеция", czechia: "Чехия", austria: "Австрия", finland: "Финляндия", switzerland: "Швейцария", usa: "США", canada: "Канада" },
      types: { club: "Клубная команда", academy: "Платная академия (Pay-to-play)", covered: "Программа с подтверждённым частичным покрытием расходов" },
      included: "входит в строку", covered: "покрывает программа", unknown: "нет проверенных данных",
      own: "ваша сумма", example: "Пример программы", programme: "Данные программы",
      cur: "Валюта", period: "Период", season: "Сезон данных", source: "Источник", checked: "проверено",
      known: "Известная часть", total: "Ориентировочный итог", missing: "Не хватает данных (не учтено)",
      extras: "Показано отдельно", insufficient: "Недостаточно данных",
      insufficientText: "Проверенных опубликованных цифр для этой комбинации у нас нет. Введите суммы из письменного предложения клуба или академии: пустые строки останутся в списке недостающих.",
      ownCur: "Валюта ваших сумм", range: "По примерам программ",
      noTypes: "Для этого рынка и возраста нет типа программы с задокументированными условиями.",
      cta: "Обсудить бюджет с EHA", wa: "Написать в WhatsApp",
      ctaText: "Укажите год рождения, позицию, текущую лигу и страны, которые рассматриваете. EHA разберёт предложение с вами по строкам."
    }
  };

  function applicableTypes(data, market, age) {
    return data.types.filter(function (t) {
      var rule = data.apply[t] || {};
      var ages = rule[market] || rule.all || [];
      return ages.indexOf(age) !== -1;
    });
  }

  function entriesFor(data, market, age, type) {
    return data.entries.filter(function (e) { return e.market === market && e.type === type && e.ages.indexOf(age) !== -1; });
  }

  function num(v) { var n = typeof v === "string" ? Number(v.replace(/[\s ]/g, "").replace(",", ".")) : v; return typeof n === "number" && isFinite(n) && n >= 0 ? n : null; }

  // Returns per-line states and the known subtotal. `user` maps line -> amount
  // typed by the family for lines the data does not know.
  function computeEntry(entry, user) {
    user = user || {};
    var out = { lines: {}, lo: 0, hi: 0, missing: [], extraLo: 0, extraHi: 0 };
    ALL.forEach(function (k) {
      var v = entry.lines[k];
      var s;
      if (Array.isArray(v)) s = { state: "value", lo: v[0], hi: v[1] };
      else if (typeof v === "number") s = { state: "value", lo: v, hi: v };
      else if (v && v.inc) s = { state: "included", inc: v.inc };
      else if (v && v.cov) s = { state: "covered" };
      else {
        var u = num(user[k]);
        s = u === null ? { state: "unknown" } : { state: "user", lo: u, hi: u };
      }
      out.lines[k] = s;
      if (s.state === "value" || s.state === "user") { out.lo += s.lo; out.hi += s.hi; }
      if (s.state === "unknown") out.missing.push(k);
    });
    out.complete = out.missing.length === 0;
    return out;
  }

  function fmt(n, lang) { return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-GB", { maximumFractionDigits: 0 }).format(n); }
  function money(lo, hi, cur, lang) { return (lo === hi ? fmt(lo, lang) : fmt(lo, lang) + "–" + fmt(hi, lang)) + " " + cur; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function loc(v, lang) { return v && typeof v === "object" ? (v[lang] || v.en) : v; }

  function rowHtml(k, s, t, lang, cur, idx) {
    var val;
    if (s.state === "value") val = money(s.lo, s.hi, cur, lang);
    else if (s.state === "included") val = t.included + " «" + t.lines[s.inc] + "»";
    else if (s.state === "covered") val = t.covered;
    else {
      var id = "sce-" + idx + "-" + k;
      val = '<span class="sce-unknown">' + t.unknown + '</span> <label class="sce-own" for="' + id + '"><span class="visually-hidden">' + t.lines[k] + ", " + t.own + '</span><input id="' + id + '" data-line="' + k + '" inputmode="decimal" placeholder="' + t.own + '"' + (s.state === "user" ? ' value="' + s.lo + '"' : "") + "></label>";
    }
    return "<tr><th scope=\"row\">" + t.lines[k] + "</th><td>" + val + "</td></tr>";
  }

  function entryHtml(entry, res, t, lang, idx) {
    var cur = entry.cur;
    var h = '<article class="sce-card" data-entry="' + idx + '"><header><h3>' + esc(entry.name) + "</h3>" +
      '<span class="sce-badge">' + (entry.example ? t.example : t.programme) + "</span></header>" +
      '<dl class="sce-meta"><div><dt>' + t.cur + "</dt><dd>" + cur + "</dd></div><div><dt>" + t.period + "</dt><dd>" + esc(loc(entry.period, lang)) +
      "</dd></div><div><dt>" + t.season + "</dt><dd>" + esc(loc(entry.season, lang)) + '</dd></div><div><dt>' + t.source + '</dt><dd><a href="' + entry.src + '" target="_blank" rel="noopener nofollow">' + esc(entry.src.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) + " ↗</a></dd></div></dl>" +
      '<table class="sce-table"><tbody>' + MAIN.map(function (k) { return rowHtml(k, res.lines[k], t, lang, cur, idx); }).join("") +
      '</tbody><tbody class="sce-extra"><tr><th colspan="2" scope="rowgroup">' + t.extras + "</th></tr>" + EXTRA.map(function (k) { return rowHtml(k, res.lines[k], t, lang, cur, idx); }).join("") + "</tbody></table>" +
      '<p class="sce-total"><strong>' + (res.complete ? t.total : t.known) + ": " + money(res.lo, res.hi, cur, lang) + "</strong></p>";
    if (res.missing.length) h += '<p class="sce-missing">' + t.missing + ": " + res.missing.map(function (k) { return t.lines[k]; }).join(", ") + "</p>";
    h += '<p class="sce-note">' + esc(loc(entry.note, lang)) + "</p></article>";
    return h;
  }

  function manualHtml(t, lang, state) {
    var curs = ["EUR", "SEK", "CZK", "CHF", "USD", "CAD"];
    var h = '<div class="sce-insufficient"><h3>' + t.insufficient + "</h3><p>" + t.insufficientText + '</p><label class="sce-cur">' + t.ownCur +
      ' <select data-manual-cur>' + curs.map(function (c) { return "<option" + (c === state.cur ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></label>";
    var entry = { lines: {} };
    ALL.forEach(function (k) { entry.lines[k] = null; });
    var res = computeEntry(entry, state.user);
    h += '<table class="sce-table" data-entry="manual"><tbody>' + MAIN.map(function (k) { return rowHtml(k, res.lines[k], t, lang, state.cur, "m"); }).join("") +
      '</tbody><tbody class="sce-extra"><tr><th colspan="2" scope="rowgroup">' + t.extras + "</th></tr>" + EXTRA.map(function (k) { return rowHtml(k, res.lines[k], t, lang, state.cur, "m"); }).join("") + "</tbody></table>";
    if (res.lo || res.hi) h += '<p class="sce-total"><strong>' + (res.complete ? t.total : t.known) + ": " + money(res.lo, res.hi, state.cur, lang) + "</strong></p>";
    if (res.missing.length) h += '<p class="sce-missing">' + t.missing + ": " + res.missing.map(function (k) { return t.lines[k]; }).join(", ") + "</p>";
    return h + "</div>";
  }

  function init(container, data) {
    var lang = (document.documentElement.lang || "en").slice(0, 2) === "ru" ? "ru" : "en";
    var t = T[lang];
    var ageSel = container.querySelector("[data-sce-age]");
    var mktSel = container.querySelector("[data-sce-market]");
    var typeSel = container.querySelector("[data-sce-type]");
    var out = container.querySelector("[data-sce-result]");
    var cta = container.getAttribute("data-cta") || "/contact";
    var wa = container.getAttribute("data-wa") || "";
    var user = {}; // key: market|age|type|entryIdx -> {line: amount}
    var manual = {}; // key: market|age|type -> {cur, user}

    function fillTypes() {
      var types = applicableTypes(data, mktSel.value, ageSel.value);
      var prev = typeSel.value;
      typeSel.innerHTML = types.map(function (ty) { return '<option value="' + ty + '">' + t.types[ty] + "</option>"; }).join("");
      if (types.indexOf(prev) !== -1) typeSel.value = prev;
      typeSel.disabled = types.length === 0;
    }

    function render() {
      var key = mktSel.value + "|" + ageSel.value + "|" + typeSel.value;
      var html = "";
      if (!typeSel.value) html = "<p>" + t.noTypes + "</p>";
      else {
        var list = entriesFor(data, mktSel.value, ageSel.value, typeSel.value);
        var note = typeSel.value === "covered" && data.coveredNote[mktSel.value];
        if (note) html += '<p class="sce-note">' + esc(loc(note, lang)) + "</p>";
        if (!list.length) {
          manual[key] = manual[key] || { cur: { sweden: "SEK", czechia: "CZK", switzerland: "CHF", usa: "USD", canada: "CAD" }[mktSel.value] || "EUR", user: {} };
          html += manualHtml(t, lang, manual[key]);
        } else {
          var results = list.map(function (e, i) { var r = computeEntry(e, user[key + "|" + i]); return { e: e, r: r, i: i }; });
          var curs = results.map(function (x) { return x.e.cur; });
          if (results.length > 1 && curs.every(function (c) { return c === curs[0]; }) && results.every(function (x) { return x.r.complete; })) {
            var lo = Math.min.apply(null, results.map(function (x) { return x.r.lo; }));
            var hi = Math.max.apply(null, results.map(function (x) { return x.r.hi; }));
            html += '<p class="sce-range"><strong>' + t.range + ":</strong> " + money(lo, hi, curs[0], lang) + "</p>";
          }
          html += results.map(function (x) { return entryHtml(x.e, x.r, t, lang, x.i); }).join("");
        }
      }
      html += '<div class="sce-cta"><p>' + t.ctaText + '</p><div class="actions"><a class="btn primary" data-sce-cta href="' + cta + "&amp;market=" + encodeURIComponent(mktSel.value) + "&amp;age=" + encodeURIComponent(ageSel.value) + '">' + t.cta + "</a>" +
        (wa ? '<a class="text-link" href="' + wa + '" target="_blank" rel="noopener">' + t.wa + " ↗</a>" : "") + "</div></div>";
      var focused = document.activeElement && document.activeElement.id;
      out.innerHTML = html;
      if (focused) { var el = document.getElementById(focused); if (el) { el.focus(); if (el.setSelectionRange && el.value) el.setSelectionRange(el.value.length, el.value.length); } }
    }

    out.addEventListener("input", function (ev) {
      var line = ev.target.getAttribute && ev.target.getAttribute("data-line");
      if (!line) return;
      var key = mktSel.value + "|" + ageSel.value + "|" + typeSel.value;
      var card = ev.target.closest("[data-entry]");
      if (card && card.getAttribute("data-entry") === "manual") { manual[key].user[line] = ev.target.value; }
      else if (card) { var k = key + "|" + card.getAttribute("data-entry"); user[k] = user[k] || {}; user[k][line] = ev.target.value; }
      render();
    });
    out.addEventListener("change", function (ev) {
      if (ev.target.hasAttribute && ev.target.hasAttribute("data-manual-cur")) {
        manual[mktSel.value + "|" + ageSel.value + "|" + typeSel.value].cur = ev.target.value; render();
      }
    });
    [ageSel, mktSel].forEach(function (s) { s.addEventListener("change", function () { fillTypes(); render(); }); });
    typeSel.addEventListener("change", render);
    var params = new URLSearchParams(location.search);
    if (params.get("market") && data.markets.indexOf(params.get("market")) !== -1) mktSel.value = params.get("market");
    if (params.get("age") && data.ages.indexOf(params.get("age")) !== -1) ageSel.value = params.get("age");
    fillTypes();
    render();
  }

  var api = { applicableTypes: applicableTypes, entriesFor: entriesFor, computeEntry: computeEntry, MAIN: MAIN, EXTRA: EXTRA };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.EHASeasonCost = api;
    var boot = function () { var c = document.getElementById("season-estimator"); if (c && root.EHA_SEASON_COST) init(c, root.EHA_SEASON_COST); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }
})(typeof window !== "undefined" ? window : this);
