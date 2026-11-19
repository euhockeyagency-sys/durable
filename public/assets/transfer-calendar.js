/* Filters for the transfer calendar table. Progressive enhancement: without
   JavaScript every row stays visible, the server-rendered state stays as it
   is, and the form stays hidden. Filters: country, league, age, deadline
   month and "Open now"; quick chips for January, February and Open now.
   The filter state is mirrored in the URL query (for sharing); the canonical
   URL and the sitemap never include it. */
(function (root) {
  "use strict";

  // A row is open on `today` only when it is confirmed and one of its windows
  // has a confirmed start and end around that date. Shared with the tests.
  function isOpen(status, windows, today) {
    if (status !== "confirmed" || !windows) return false;
    return windows.split(" ").some(function (w) {
      var p = w.split("~");
      return p[0] && p[1] && p[0] <= today && today <= p[1];
    });
  }
  // Same states as the server renderer (src/transfer-calendar.js windowState).
  function state(status, windows, today) {
    if (status !== "confirmed" || !windows) return null;
    var list = windows.split(" ").map(function (w) { var p = w.split("~"); return { opens: p[0], closes: p[1] }; }).filter(function (w) { return w.closes; });
    if (!list.length) return null;
    if (isOpen(status, windows, today)) return { state: "open" };
    var next = list.filter(function (w) { return w.opens && w.opens > today; }).sort(function (a, b) { return a.opens < b.opens ? -1 : 1; })[0];
    if (next) return { state: "opens", date: next.opens };
    if (list.some(function (w) { return !w.opens && today <= w.closes; })) return { state: "ahead" };
    if (list.every(function (w) { return w.closes < today; })) return { state: "closed" };
    return null;
  }
  function matches(row, f, today) {
    var cat = row.category;
    return (!f.country || row.country === f.country || row.country === "all-countries") &&
      (!f.league || row.league === f.league) &&
      (!f.category || cat === f.category || cat === "all") &&
      (!f.month || (" " + row.months + " ").indexOf(" " + f.month + " ") >= 0) &&
      (!f.open || isOpen(row.status, row.windows, today));
  }
  var api = { isOpen: isOpen, state: state, matches: matches };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  var form = document.getElementById("calendar-filters");
  var table = document.getElementById("transfer-calendar");
  if (!form || !table) return;
  form.hidden = false;
  var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
  var count = document.getElementById("calendar-count");
  var empty = document.getElementById("calendar-empty");
  var i18n = {};
  try { i18n = JSON.parse(table.getAttribute("data-i18n") || "{}"); } catch (e) {}
  var MONTHS = i18n.locale === "ru"
    ? ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var d = new Date();
  var today = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

  // Refresh the "now" state for the visitor's date.
  rows.forEach(function (r) {
    var cell = r.querySelector("[data-now]");
    if (!cell) return;
    var s = state(r.getAttribute("data-status"), r.getAttribute("data-windows"), today);
    if (!s) { cell.textContent = ""; return; }
    var text = s.state === "opens" ? i18n.opens + " " + (function (iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; })(s.date) : i18n[s.state];
    cell.innerHTML = "";
    var span = document.createElement("span");
    span.className = "cal-state cal-state-" + s.state;
    span.textContent = text;
    cell.appendChild(span);
  });

  var fields = {};
  Array.prototype.forEach.call(form.querySelectorAll("[data-filter]"), function (el) { fields[el.getAttribute("data-filter")] = el; });
  function read() {
    var f = {};
    Object.keys(fields).forEach(function (k) { var el = fields[k]; f[k] = el.type === "checkbox" ? (el.checked ? "1" : "") : el.value; });
    return f;
  }
  function syncUrl(f) {
    if (!window.history || !history.replaceState) return;
    var params = new URLSearchParams(location.search);
    Object.keys(fields).forEach(function (k) { if (f[k]) params.set(k, f[k]); else params.delete(k); });
    var q = params.toString();
    history.replaceState(history.state, "", location.pathname + (q ? "?" + q : "") + location.hash);
  }
  function apply(track) {
    var f = read();
    var shown = 0;
    rows.forEach(function (r) {
      var ok = matches({ country: r.getAttribute("data-country"), league: r.getAttribute("data-league"), category: r.getAttribute("data-category"), months: r.getAttribute("data-months") || "", status: r.getAttribute("data-status"), windows: r.getAttribute("data-windows") || "" }, f, today);
      r.hidden = !ok;
      if (ok) shown += 1;
    });
    if (count) count.textContent = shown;
    if (empty) empty.hidden = shown > 0;
    Array.prototype.forEach.call(form.querySelectorAll(".calendar-chip"), function (b) {
      var on = b.hasAttribute("data-open") ? f.open === "1" : f.month === b.getAttribute("data-month");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    syncUrl(f);
    if (track && window.ehaTrack) window.ehaTrack("calendar_filter", { country: f.country || "", league: f.league || "", category: f.category || "", month: f.month || "", open_now: f.open === "1" });
  }
  // Start from the URL query (only values that exist in the form are taken).
  var initial = new URLSearchParams(location.search);
  Object.keys(fields).forEach(function (k) {
    var v = initial.get(k), el = fields[k];
    if (!v) return;
    if (el.type === "checkbox") el.checked = v === "1";
    else if (Array.prototype.some.call(el.options, function (o) { return o.value === v; })) el.value = v;
  });
  form.addEventListener("change", function () { apply(true); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  form.addEventListener("reset", function () { setTimeout(function () { apply(true); }, 0); });
  Array.prototype.forEach.call(form.querySelectorAll(".calendar-chip"), function (b) {
    b.addEventListener("click", function () {
      if (b.hasAttribute("data-open")) fields.open.checked = !fields.open.checked;
      else fields.month.value = fields.month.value === b.getAttribute("data-month") ? "" : b.getAttribute("data-month");
      apply(true);
    });
  });
  if (empty) Array.prototype.forEach.call(empty.querySelectorAll("[data-reset]"), function (b) { b.addEventListener("click", function () { form.reset(); }); });
  apply(false);
})(typeof window !== "undefined" ? window : this);
