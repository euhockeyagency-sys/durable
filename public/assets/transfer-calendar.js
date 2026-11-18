/* Filters for the transfer calendar table. Progressive enhancement: without
   JavaScript every row stays visible and the form stays hidden. */
(function () {
  "use strict";
  var form = document.getElementById("calendar-filters");
  var table = document.getElementById("transfer-calendar");
  if (!form || !table) return;
  form.hidden = false;
  var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
  var count = document.getElementById("calendar-count");
  function apply() {
    var f = {};
    Array.prototype.forEach.call(form.querySelectorAll("select[data-filter]"), function (s) { f[s.getAttribute("data-filter")] = s.value; });
    var shown = 0;
    rows.forEach(function (r) {
      var ok = (!f.country || r.getAttribute("data-country") === f.country || r.getAttribute("data-country") === "all-countries") &&
        (!f.league || r.getAttribute("data-league") === f.league) &&
        (!f.category || r.getAttribute("data-category") === f.category || r.getAttribute("data-category") === "all");
      r.hidden = !ok;
      if (ok) shown += 1;
    });
    if (count) count.textContent = shown;
    if (window.ehaTrack) window.ehaTrack("calendar_filter", { country: f.country || "", league: f.league || "", category: f.category || "" });
  }
  form.addEventListener("change", apply);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
})();
