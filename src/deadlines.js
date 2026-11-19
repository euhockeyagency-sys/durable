"use strict";

// Dated deadlines shared by several pages. One record per rule; every page
// that states the date renders it from here, so a correction is made once.
// Keep rules with a different scope as separate records (e.g. the SIHF-wide
// domestic window and the National League deadline are not the same rule).

const DEADLINES = {
  // Swiss National League, Weisungen Spielbetrieb 2026/27, sec. 1.3.2. Re-read 19.11.2026.
  "ch-nl-2026-27": {
    season: "2026/27",
    ref: "Weisungen 2026/27, sec. 1.3.2",
    source: "https://www.nationalleague.ch/media/bvinatrg/weisungen_spielbetrieb_nl_26_27_d.pdf",
    checkedAt: "2026-11-19",
    swiss: { date: "2027-02-01", time: "24:00" }, // Swiss, dual citizens, "like a Swiss"
    foreign: { date: "2027-02-15", time: "24:00" } // foreign players; IIHF approval by the same time
  }
};

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
};

function formatDay(iso, locale) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[locale === "ru" ? "ru" : "en"][m - 1]} ${y}`;
}

// deadline("ch-nl-2026-27", "foreign", "en") -> "15 February 2027, 24:00"
// { time: false } drops the time; { dayMonth: true } drops the year too.
function deadline(id, part, locale = "en", { time = true, dayMonth = false } = {}) {
  const rec = DEADLINES[id];
  if (!rec || !rec[part]) throw new Error(`unknown deadline ${id}.${part}`);
  let day = formatDay(rec[part].date, locale);
  if (dayMonth) day = day.replace(/ \d{4}$/, "");
  return time && rec[part].time ? `${day}, ${rec[part].time}` : day;
}

// { en, ru } pair for records that hold both languages.
const pair = (fn) => ({ en: fn("en"), ru: fn("ru") });

module.exports = { DEADLINES, deadline, pair, formatDay };
