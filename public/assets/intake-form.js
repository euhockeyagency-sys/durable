/* Intake helpers: Elite Prospects lookup and confirmation on the profile form,
   stats rows by position, the EP field in the level calculator, and the
   player feedback on the success page. Progressive enhancement: without this
   script the form still submits everything manually. */
(function () {
  "use strict";
  var LANG = document.documentElement.lang === "en" ? "en" : "ru";
  var T = {
    en: {
      fetching: "Fetching data from Elite Prospects…",
      filled: "Filled from Elite Prospects. Check every field, correct anything that is wrong and confirm below.",
      notConfigured: "Automatic import from Elite Prospects is not connected yet. The link will be saved with your application; please fill in the fields yourself.",
      notFound: "That Elite Prospects profile could not be found. Check the link or fill in the fields yourself.",
      unavailable: "Elite Prospects is not available right now. Your entries are kept; fill in the fields yourself or try again later.",
      invalid: "Paste a player profile link like https://www.eliteprospects.com/player/12345/name.",
      rate: "Too many attempts. Please fill in the fields yourself or try again later.",
      pdf: "Download my player card (PDF)", review: "Ask for a manual review", reviewDone: "Done: the agent will review your application manually.",
      update: "Update data and send again", feedbackTitle: "What would help the assessment"
    },
    ru: {
      fetching: "Получаем данные из Elite Prospects…",
      filled: "Поля заполнены из Elite Prospects. Проверьте каждое, исправьте неточности и подтвердите ниже.",
      notConfigured: "Автоматическая загрузка из Elite Prospects пока не подключена. Ссылка сохранится в заявке, заполните поля самостоятельно.",
      notFound: "Профиль Elite Prospects не найден. Проверьте ссылку или заполните поля самостоятельно.",
      unavailable: "Elite Prospects сейчас недоступен. Введённые данные сохранены; заполните поля вручную или попробуйте позже.",
      invalid: "Вставьте ссылку на профиль игрока вида https://www.eliteprospects.com/player/12345/name.",
      rate: "Слишком много попыток. Заполните поля вручную или попробуйте позже.",
      pdf: "Скачать мою карточку игрока (PDF)", review: "Запросить ручное рассмотрение", reviewDone: "Готово: агент рассмотрит заявку вручную.",
      update: "Обновить данные и отправить снова", feedbackTitle: "Что поможет оценке"
    }
  }[LANG];
  var q = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- profile form ----------
  var form = q("#profile-form");
  if (form) {
    var epInput = q('[name="eliteProspectsUrl"]', form);
    var epButton = q("#ep-lookup", form);
    var epStatus = q("#ep-status", form);
    var epImport = q('[name="epImport"]', form);
    var confirmBox = q("#ep-confirm", form);
    var position = q('[name="position"]', form);
    var params = new URLSearchParams(location.search);
    if (epInput && !epInput.value && /^https:\/\/(www\.)?eliteprospects\.com\/player\/\d+/.test(params.get("ep") || "")) epInput.value = params.get("ep").slice(0, 300);

    var syncPosition = function () {
      var goalie = position && position.value === "goalie";
      qa("[data-skater]", form).forEach(function (el) { el.hidden = goalie; });
      qa("[data-goalie]", form).forEach(function (el) { el.hidden = !goalie; });
      var hand = q("#stick-hand-label", form);
      if (hand) hand.firstChild.textContent = goalie ? (LANG === "en" ? "Catches" : "Ловушка") : (LANG === "en" ? "Shot" : "Хват");
    };
    if (position) { position.addEventListener("change", syncPosition); syncPosition(); }

    // Optional details: one stats row by default, more on request. Rows that
    // already hold data (browser restore, Elite Prospects import) stay visible.
    var more = q("#form-more", form);
    var addRow = q("#stats-add", form);
    var rowUsed = function (row) { return qa("input", row).some(function (el) { return el.value !== ""; }); };
    var syncRows = function () {
      var hiddenLeft = 0;
      qa(".stats-extra", form).forEach(function (row) { if (rowUsed(row)) row.hidden = false; if (row.hidden) hiddenLeft += 1; });
      if (addRow) addRow.hidden = hiddenLeft === 0;
    };
    qa(".stats-extra", form).forEach(function (row) { row.hidden = !rowUsed(row); });
    if (addRow) addRow.addEventListener("click", function () {
      var next = qa(".stats-extra", form).filter(function (row) { return row.hidden; })[0];
      if (next) { next.hidden = false; var first = q("input", next); if (first) first.focus(); }
      syncRows();
    });
    syncRows();

    var setField = function (name, value, filled) {
      if (value === null || value === undefined || value === "") return;
      var el = q('[name="' + name + '"]', form);
      if (!el) return;
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      filled.push(name);
    };
    var setRows = function (stats, filled) {
      var rows = qa(".stats-row", form);
      (stats || []).slice(0, rows.length).forEach(function (s, i) {
        var row = rows[i];
        var set = function (n, v) { var el = q('[name="' + n + '"]', row); if (el && v !== null && v !== undefined) el.value = v; };
        set("statsSeason", s.season); set("statsTeam", s.team); set("statsLeague", s.league); set("statsCompetition", s.competition);
        set("statsGp", s.gp); set("statsG", s.g); set("statsA", s.a); set("statsGaa", s.gaa); set("statsSvp", s.svp);
      });
      if ((stats || []).length) filled.push("stats");
    };
    var say = function (text, error) { if (epStatus) { epStatus.textContent = text; epStatus.classList.toggle("error", Boolean(error)); } };

    if (epButton && epInput) {
      epButton.hidden = false;
      epButton.addEventListener("click", function () {
        var url = epInput.value.trim();
        if (!/^https?:\/\/(www\.)?eliteprospects\.com\/player\/\d+/i.test(url)) { say(T.invalid, true); epInput.focus(); return; }
        epButton.disabled = true; say(T.fetching, false);
        fetch("/api/ep-lookup", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ url: url }) })
          .then(function (r) { if (r.status === 429) return { ok: false, reason: "rate_limited" }; return r.json().catch(function () { return { ok: false, reason: "unavailable" }; }); })
          .then(function (data) {
            if (!data.ok) {
              say({ not_configured: T.notConfigured, not_found: T.notFound, invalid_url: T.invalid, wrong_domain: T.invalid, not_a_player_profile: T.invalid, rate_limited: T.rate }[data.reason] || T.unavailable, data.reason !== "not_configured");
              return;
            }
            var p = data.player || {}; var filled = [];
            // Only real API data fills the form; nothing is invented.
            setField("playerName", p.name, filled);
            if (p.birthDate) { setField("birthDate", p.birthDate, filled); setField("birthYear", p.birthDate.slice(0, 4), filled); }
            if (p.citizenships && p.citizenships.length) setField("citizenship", p.citizenships.join(", "), filled);
            setField("position", p.position, filled);
            setField("stickHand", p.stickHand, filled);
            setField("heightCm", p.heightCm, filled);
            setField("weightKg", p.weightKg, filled);
            setField("currentClub", p.currentTeam, filled);
            setField("currentLeague", p.currentLeague, filled);
            setRows(data.stats, filled);
            syncPosition(); syncRows();
            // Imported values must be checked by the player: show them.
            if (more) more.open = true;
            if (epImport) epImport.value = JSON.stringify({ epId: data.epId, fetchedAt: data.fetchedAt, fields: filled });
            if (confirmBox) { confirmBox.hidden = false; var cb = q('[name="dataConfirmed"]', confirmBox); if (cb) cb.required = true; }
            say(T.filled, false);
          })
          .catch(function () { say(T.unavailable, true); })
          .then(function () { epButton.disabled = false; });
      });
    }

    // Keep the API response for the success page (same tab only; the owner
    // token never goes into a URL).
    form.addEventListener("eha:submitted", function (event) {
      try { sessionStorage.setItem("eha-last-application", JSON.stringify(event.detail)); } catch (e) { /* storage blocked */ }
    });
  }

  // ---------- level calculator: carry the EP link to the form ----------
  var calcEp = q("#calc-ep");
  if (calcEp) {
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest('a[href*="/contact"]');
      var value = calcEp.value.trim();
      if (!link || !/^https?:\/\/(www\.)?eliteprospects\.com\/player\/\d+/i.test(value)) return;
      var url = new URL(link.href, location.href); url.searchParams.set("ep", value.slice(0, 300)); link.href = url.pathname + url.search;
    }, true);
  }

  // ---------- success page: practical feedback, PDF, manual review ----------
  var box = q("#application-feedback");
  if (box) {
    var ref = new URLSearchParams(location.search).get("ref") || "";
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem("eha-last-application") || "null"); } catch (e) { saved = null; }
    if (saved && saved.reference === ref && /^EHA-\d{6}-[A-F0-9]{6}$/.test(ref)) {
      var fb = saved.feedback || {};
      var html = "";
      if (fb.items && fb.items.length) html += "<h2>" + T.feedbackTitle + "</h2><ul>" + fb.items.map(function (i) { var li = document.createElement("li"); li.textContent = i; return li.outerHTML; }).join("") + "</ul>";
      var next = document.createElement("p"); next.textContent = fb.next || ""; html += next.outerHTML;
      html += '<div class="profile-actions">';
      if (saved.ownerToken) html += '<a class="btn primary" id="own-pdf" href="#">' + T.pdf + "</a>";
      if (saved.ownerToken) html += '<button class="btn ghost" type="button" id="own-review">' + T.review + "</button>";
      html += '<a class="btn ghost" href="' + (LANG === "ru" ? "/ru" : "") + '/contact">' + T.update + "</a></div><p class=\"form-status\" id=\"own-status\" role=\"status\" aria-live=\"polite\"></p>";
      box.innerHTML = html; box.hidden = false;
      var pdf = q("#own-pdf", box);
      if (pdf) pdf.addEventListener("click", function (e) {
        e.preventDefault();
        fetch("/api/applications/" + encodeURIComponent(ref) + "/pdf?download=1&token=" + encodeURIComponent(saved.ownerToken))
          .then(function (r) { if (!r.ok) throw new Error("pdf"); return r.blob(); })
          .then(function (blob) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "EHA-player-card-" + ref + ".pdf"; document.body.append(a); a.click(); a.remove(); })
          .catch(function () { q("#own-status", box).textContent = T.unavailable; });
      });
      var review = q("#own-review", box);
      if (review) review.addEventListener("click", function () {
        review.disabled = true;
        fetch("/api/applications/" + encodeURIComponent(ref) + "/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: saved.ownerToken }) })
          .then(function (r) { q("#own-status", box).textContent = r.ok ? T.reviewDone : T.unavailable; if (!r.ok) review.disabled = false; })
          .catch(function () { q("#own-status", box).textContent = T.unavailable; review.disabled = false; });
      });
    }
  }
})();
