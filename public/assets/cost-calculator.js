/* Shared logic for the junior season cost calculator
   (public/en/junior-season-cost-calculator.html and
   public/ru/kalkulyator-stoimosti-sezona.html). One file for both languages so
   the copy cannot drift. Wrapped in an IIFE because it loads next to site.js
   and must not collide with its globals; exports pure functions via
   module.exports when required() from tests.

   The only built-in prices are the published tuition figures recorded in
   docs/north-america-hockey-academies-factcheck.md (checked 10 Aug 2026).
   There is NO European price data here on purpose: nothing in the fact-checks
   supports one. For any European offer the parent types in the figures from the
   written offer. The calculator adds up named, dated figures per offer; it
   never averages or ranks schools. */
(function (root) {
  "use strict";

  var LINES = ["school", "hockey", "fees", "housing", "insurance", "equipment", "other"];

  // Each preset is one named, dated, published figure. `year` is null when the
  // school's own page does not label the academic year — the UI then says so.
  var PRESETS = [
    {
      id: "ssm-intl", cur: "USD", year: "2026-27", school: 73000, hockey: 11000, fees: 0,
      src: "https://www.s-sm.org/admissions/affording-ssm",
      label: { en: "Shattuck-St Mary's — international boarding", ru: "Shattuck-St Mary's — международный пансион" },
      note: {
        en: "Boarding tuition $73,000 plus a separate $11,000 hockey programme fee.",
        ru: "Обучение с проживанием $73 000 плюс отдельный взнос за хоккейную программу $11 000."
      }
    },
    {
      id: "ssm-dom", cur: "USD", year: "2026-27", school: 65000, hockey: 11000, fees: 0,
      src: "https://www.s-sm.org/admissions/affording-ssm",
      label: { en: "Shattuck-St Mary's — domestic boarding", ru: "Shattuck-St Mary's — пансион (резидент США)" },
      note: {
        en: "Boarding tuition $65,000 plus a separate $11,000 hockey programme fee.",
        ru: "Обучение с проживанием $65 000 плюс отдельный взнос за хоккейную программу $11 000."
      }
    },
    {
      id: "kent", cur: "USD", year: "2026-27", school: 83700, hockey: 0, fees: 0,
      src: "https://www.kent-school.edu/admissions/tuition-financial-aid",
      label: { en: "Kent School — boarding", ru: "Kent School — пансион" },
      note: {
        en: "Boarding $83,700 (room and board, health centre, technology, most textbooks). The page does not itemise hockey costs — ask the school.",
        ru: "Пансион $83 700 (проживание и питание, медцентр, техника, большинство учебников). Хоккейные расходы на странице не выделены — уточните у школы."
      }
    },
    {
      id: "culver", cur: "USD", year: "2026-27", school: 69500, hockey: 0, fees: 0,
      src: "https://www.culver.org/admissions/tuition-financial-aid",
      label: { en: "Culver Academies — combined tuition, room and board", ru: "Culver Academies — обучение, проживание и питание" },
      note: {
        en: "Combined figure $69,500. The page does not itemise hockey costs — ask the school.",
        ru: "Общая сумма $69 500. Хоккейные расходы на странице не выделены — уточните у школы."
      }
    },
    {
      id: "salisbury", cur: "USD", year: "2025-26", school: 75450, hockey: 0, fees: 3338.5,
      src: "https://www.salisburyschool.org/become-a-knight/tuition-fees",
      label: { en: "Salisbury School — boarding", ru: "Salisbury School — пансион" },
      note: {
        en: "Tuition $75,450 plus general, technology and textbook fees ($78,788.50 in total). This is the 2025-26 year, not 2026-27. Equipment and travel are billed separately.",
        ru: "Обучение $75 450 плюс общие, технологические сборы и учебники (итого $78 788,50). Это 2025-26 год, а не 2026-27. Экипировка и поездки оплачиваются отдельно."
      }
    },
    {
      id: "berkshire", cur: "USD", year: "2026-27", school: 82200, hockey: 0, fees: 1590,
      src: "https://www.berkshireschool.org/admission/tuition-and-financial-aid",
      label: { en: "Berkshire School — boarding", ru: "Berkshire School — пансион" },
      note: {
        en: "Tuition $82,200 plus $695 technology and $895 health fees ($83,790 in total). The page does not itemise hockey costs.",
        ru: "Обучение $82 200 плюс $695 технологический и $895 медицинский сбор (итого $83 790). Хоккейные расходы на странице не выделены."
      }
    },
    {
      id: "tabor", cur: "USD", year: "2026-27", school: 82100, hockey: 0, fees: 0,
      src: "https://www.taboracademy.org/admissions/tuition-financial-aid",
      label: { en: "Tabor Academy — boarding", ru: "Tabor Academy — пансион" },
      note: {
        en: "Boarding $82,100. Books and athletic supplies are billed separately.",
        ru: "Пансион $82 100. Книги и спортивные принадлежности оплачиваются отдельно."
      }
    },
    {
      id: "oha", cur: "CAD", year: null, school: 44200, hockey: 11500, fees: 5000,
      src: "https://www.ohacanada.com/canadianfees",
      label: { en: "Ontario Hockey Academy — Canadian boarding", ru: "Ontario Hockey Academy — пансион (канадский студент)" },
      note: {
        en: "CAD 33,500 academic and facility + CAD 10,700 boarding and meals (entered as school fee), CAD 11,500 hockey and travel, and a CAD 5,000 non-refundable deposit (entered as other school fees): CAD 60,700 in total. An equipment fee of CAD 450–950 is extra. The page does not state the academic year, and the international rate was not reviewed.",
        ru: "CAD 33 500 обучение и инфраструктура + CAD 10 700 проживание и питание (внесено как плата школе), CAD 11 500 хоккей и поездки и невозвратный депозит CAD 5 000 (внесён как прочие сборы школы): итого CAD 60 700. Сбор за экипировку CAD 450–950 — сверху. Учебный год на странице не указан, международный тариф не проверялся."
      }
    },
    {
      id: "ciha-can", cur: "CAD", year: null, school: 48900, hockey: 0, fees: 0,
      src: "https://www.cihacademy.com/admissions/tuition-cost/",
      label: { en: "Canadian International Hockey Academy — Canadian boarding", ru: "Canadian International Hockey Academy — пансион (канадский студент)" },
      note: {
        en: "CAD 48,900. The page says pricing is subject to change without notice and does not clearly state the academic year.",
        ru: "CAD 48 900. На странице указано, что цены могут измениться без уведомления, а учебный год чётко не назван."
      }
    },
    {
      id: "ciha-intl", cur: "CAD", year: null, school: 52900, hockey: 0, fees: 0,
      src: "https://www.cihacademy.com/admissions/tuition-cost/",
      label: { en: "Canadian International Hockey Academy — international boarding", ru: "Canadian International Hockey Academy — международный пансион" },
      note: {
        en: "CAD 52,900. The page says pricing is subject to change without notice and does not clearly state the academic year.",
        ru: "CAD 52 900. На странице указано, что цены могут измениться без уведомления, а учебный год чётко не назван."
      }
    }
  ];

  var STRINGS = {
    en: {
      custom: "— enter my own figures (from the written offer) —",
      presetGroup: "Published North America figures (checked 10 Aug 2026)",
      year: "academic year",
      yearUnknown: "academic year not stated on the school page",
      source: "School page",
      presetWarn: "Published figure only. Re-check it on the school's own current page before relying on it.",
      offerA: "Offer A", offerB: "Offer B",
      lines: {
        school: "School, tuition and boarding",
        hockey: "Hockey programme fee",
        fees: "Other school fees and deposit",
        housing: "Housing and meals not covered above",
        insurance: "Insurance",
        equipment: "Equipment",
        travel: "Travel",
        other: "Anything else (registration, transfer, guardian, activities)"
      },
      total: "Total for the season",
      currencyMix: "The two offers are in different currencies. Enter an exchange rate to compare them, or compare the totals yourself.",
      needOne: "Enter at least one amount for Offer A.",
      rateUsed: function (a, b, rate) { return "Offer A converted at 1 " + a + " = " + rate + " " + b + " (your rate)."; },
      diff: function (cheaper, amount, cur, pct) { return "Offer " + cheaper + " costs " + cur + " " + amount + " less over the season (" + pct + "%)."; },
      equal: "The two totals are equal.",
      notIncluded: "Not included unless you entered it: school-year flights beyond the trips you listed, visa and consular fees, medical costs outside insurance, pocket money, summer camps and any fee the club has not yet told you about.",
      aidNote: "These are published list prices. Financial aid, scholarships and club contributions are not subtracted — enter them as lower figures only if they are confirmed in writing.",
      ctaNote: "Season cost calculator: compared two written offers.",
      writeDown: "Ask the club or school to confirm every line in writing, including what happens to money already paid if the player leaves or is not registered."
    },
    ru: {
      custom: "— ввести свои суммы (из письменной оферты) —",
      presetGroup: "Опубликованные цифры по Северной Америке (проверено 10.08.2026)",
      year: "учебный год",
      yearUnknown: "учебный год на странице школы не указан",
      source: "Страница школы",
      presetWarn: "Это только опубликованная цифра. Перед тем как на неё опираться, перепроверьте её на актуальной странице самой школы.",
      offerA: "Предложение A", offerB: "Предложение B",
      lines: {
        school: "Школа: обучение и проживание",
        hockey: "Взнос за хоккейную программу",
        fees: "Прочие сборы школы и депозит",
        housing: "Жильё и питание сверх указанного выше",
        insurance: "Страховка",
        equipment: "Экипировка",
        travel: "Поездки",
        other: "Прочее (регистрация, трансфер, опекун, активности)"
      },
      total: "Итого за сезон",
      currencyMix: "Предложения в разных валютах. Укажите курс, чтобы сравнить их, или сравните итоги самостоятельно.",
      needOne: "Введите хотя бы одну сумму для предложения A.",
      rateUsed: function (a, b, rate) { return "Предложение A пересчитано по курсу 1 " + a + " = " + rate + " " + b + " (ваш курс)."; },
      diff: function (cheaper, amount, cur, pct) { return "Предложение " + cheaper + " дешевле за сезон на " + cur + " " + amount + " (" + pct + "%)."; },
      equal: "Итоги совпадают.",
      notIncluded: "Не учтено, если вы не ввели: перелёты сверх указанных поездок, визовые и консульские сборы, медицинские расходы вне страховки, карманные деньги, летние сборы и любые платежи, о которых клуб ещё не сообщил.",
      aidNote: "Это опубликованные прейскурантные цены. Финансовая помощь, стипендии и вклад клуба не вычитаются — вводите их как меньшие суммы только если они подтверждены письменно.",
      ctaNote: "Калькулятор стоимости сезона: сравнение двух письменных предложений.",
      writeDown: "Попросите клуб или школу подтвердить каждую строку письменно, включая судьбу уже внесённых денег, если игрок уедет или не будет зарегистрирован."
    }
  };

  function num(value) {
    var n = Number(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  // One offer: sums the named lines. Travel is trips x ticket price.
  function offerTotals(offer) {
    var lines = {};
    var total = 0;
    LINES.forEach(function (key) {
      lines[key] = num(offer && offer[key]);
      total += lines[key];
    });
    lines.travel = num(offer && offer.trips) * num(offer && offer.ticket);
    total += lines.travel;
    return { currency: (offer && offer.currency) || "USD", lines: lines, total: total };
  }

  // Compares at most two offers. Different currencies are only compared when
  // the caller supplies an explicit rate (1 unit of A's currency in B's); this
  // function never invents an exchange rate.
  function calculate(input) {
    var a = offerTotals(input && input.a);
    var hasB = Boolean(input && input.b) && offerTotals(input.b).total > 0;
    var b = hasB ? offerTotals(input.b) : null;
    var result = { a: a, b: b, comparison: null };
    if (!b || a.total <= 0) return result;
    var rate = num(input && input.rate);
    var aTotal = a.total;
    var currency = b.currency;
    if (a.currency !== b.currency) {
      if (!rate) {
        result.comparison = { needsRate: true };
        return result;
      }
      aTotal = a.total * rate;
    } else {
      currency = a.currency;
    }
    var diff = Math.abs(aTotal - b.total);
    var base = Math.max(aTotal, b.total);
    result.comparison = {
      needsRate: false,
      currency: currency,
      cheaper: diff === 0 ? "equal" : (aTotal < b.total ? "A" : "B"),
      amount: diff,
      percent: base ? (diff / base) * 100 : 0,
      converted: a.currency !== b.currency,
      rate: a.currency !== b.currency ? rate : null
    };
    return result;
  }

  function init(lang) {
    var strings = STRINGS[lang];
    var form = document.getElementById("cost-form");
    if (!form) return;
    var nf = new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", { maximumFractionDigits: 2 });
    var money = function (cur, value) { return cur + " " + nf.format(value); };
    var byId = function (id) { return document.getElementById(id); };

    ["a", "b"].forEach(function (side) {
      var select = byId(side + "-preset");
      var optgroup = document.createElement("optgroup");
      optgroup.label = strings.presetGroup;
      PRESETS.forEach(function (p) {
        var option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.label[lang] + " · " + p.cur;
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
      select.addEventListener("change", function () { applyPreset(side, select.value); });
    });

    function applyPreset(side, id) {
      var noteEl = byId(side + "-note");
      var preset = PRESETS.filter(function (p) { return p.id === id; })[0];
      if (!preset) { noteEl.hidden = true; noteEl.textContent = ""; return; }
      byId(side + "-cur").value = preset.cur;
      ["school", "hockey", "fees"].forEach(function (key) {
        byId(side + "-" + key).value = preset[key] ? String(preset[key]) : "";
      });
      var yearText = preset.year ? strings.year + " " + preset.year : strings.yearUnknown;
      noteEl.textContent = "";
      var text = document.createElement("span");
      text.textContent = preset.note[lang] + " (" + yearText + ") " + strings.presetWarn + " ";
      var link = document.createElement("a");
      link.href = preset.src;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = strings.source + " ↗";
      noteEl.appendChild(text);
      noteEl.appendChild(link);
      noteEl.hidden = false;
    }

    function read(side) {
      var value = function (key) { return byId(side + "-" + key).value; };
      var offer = { currency: value("cur"), trips: value("trips"), ticket: value("ticket") };
      LINES.forEach(function (key) { offer[key] = value(key); });
      return offer;
    }

    var started = false;
    form.addEventListener("focusin", function () {
      if (started) return;
      started = true;
      if (root.ehaTrack) root.ehaTrack("cost_calc_start");
    });

    var resultEl = byId("cost-result");
    var headingEl = byId("cost-heading");
    var bodyEl = byId("cost-body");
    var ctaEl = byId("cost-cta");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var r = calculate({ a: read("a"), b: read("b"), rate: byId("rate").value });
      if (r.a.total <= 0) {
        headingEl.textContent = strings.needOne;
        bodyEl.innerHTML = "";
        resultEl.hidden = false;
        headingEl.focus();
        return;
      }
      var offers = [{ name: strings.offerA, o: r.a }];
      if (r.b) offers.push({ name: strings.offerB, o: r.b });

      var rows = LINES.slice(0, 6).concat(["travel", "other"]).map(function (key) {
        var cells = offers.map(function (x) {
          return '<td class="num">' + (x.o.lines[key] ? money(x.o.currency, x.o.lines[key]) : "—") + "</td>";
        }).join("");
        return "<tr><th scope=\"row\">" + strings.lines[key] + "</th>" + cells + "</tr>";
      }).join("");
      var head = "<tr><th scope=\"col\"></th>" + offers.map(function (x) {
        return '<th scope="col" class="num">' + x.name + "</th>";
      }).join("") + "</tr>";
      var foot = "<tr class=\"cost-total\"><th scope=\"row\">" + strings.total + "</th>" + offers.map(function (x) {
        return '<td class="num"><strong>' + money(x.o.currency, x.o.total) + "</strong></td>";
      }).join("") + "</tr>";

      var summary = "";
      var c = r.comparison;
      if (c && c.needsRate) {
        summary = strings.currencyMix;
      } else if (c) {
        summary = c.cheaper === "equal"
          ? strings.equal
          : strings.diff(c.cheaper, nf.format(c.amount), c.currency, nf.format(Math.round(c.percent * 10) / 10));
        if (c.converted) summary += " " + strings.rateUsed(r.a.currency, r.b.currency, nf.format(c.rate));
      }

      headingEl.textContent = offers.map(function (x) { return x.name + ": " + money(x.o.currency, x.o.total); }).join(" · ");
      bodyEl.innerHTML =
        '<div class="table-wrap"><table class="cost-table"><thead>' + head + "</thead><tbody>" + rows + foot + "</tbody></table></div>" +
        (summary ? '<p class="calc-summary">' + summary + "</p>" : "") +
        '<p class="tool-note">' + strings.notIncluded + "</p>" +
        '<p class="tool-note">' + strings.aidNote + "</p>" +
        '<p class="tool-note">' + strings.writeDown + "</p>";

      if (ctaEl) {
        var base = ctaEl.getAttribute("href").split("?")[0];
        var query = "type=parent&intent=season_cost&source_page=" + encodeURIComponent(location.pathname.replace(/^\/ru(?=\/)/, "")) +
          "&note=" + encodeURIComponent(strings.ctaNote);
        ctaEl.href = base + "?" + query;
      }

      resultEl.hidden = false;
      resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
      headingEl.focus();
      if (root.ehaTrack) {
        root.ehaTrack("cost_calc_done", {
          a_preset: byId("a-preset").value || "custom",
          b_preset: r.b ? (byId("b-preset").value || "custom") : "none",
          currency_a: r.a.currency,
          compared: Boolean(r.b)
        });
      }
    });
  }

  var api = { LINES: LINES, PRESETS: PRESETS, STRINGS: STRINGS, calculate: calculate, offerTotals: offerTotals };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.EHA_COST_CALCULATOR = api;
    if (typeof document !== "undefined") {
      init(document.documentElement.lang === "en" ? "en" : "ru");
    }
  }
})(typeof window !== "undefined" ? window : this);
