const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const cal = require("../src/transfer-calendar");
const client = require("../public/assets/transfer-calendar.js");

const NOW = new Date("2026-11-19T12:00:00Z");
const html = (locale = "en", now = NOW) => cal.renderCalendar(locale, now);
const rowsOf = (h) => [...h.matchAll(/<tr data-country="([^"]*)" data-league="([^"]*)" data-category="([^"]*)" data-status="([^"]*)" data-months="([^"]*)" data-windows="([^"]*)">/g)]
  .map((m) => ({ country: m[1], league: m[2], category: m[3], status: m[4], months: m[5], windows: m[6] }));
const find = (country, league) => cal.ROWS.find((r) => r.country.en === country && r.league === league && r.type !== "restriction");
const filter = (f, today = "2026-11-19") => rowsOf(html()).filter((r) => client.matches(r, f, today));

test("the full table is in the HTML before JavaScript; filters start hidden", () => {
  const h = html();
  assert.equal(rowsOf(h).length, cal.ROWS.length);
  assert.match(h, /<form class="calendar-filters" id="calendar-filters" aria-label="Calendar filters" hidden>/);
  for (const f of ['data-filter="country"', 'data-filter="league"', 'data-filter="category"', 'data-filter="month"', 'data-filter="open"', 'data-month="1"', 'data-month="2"', 'data-open="1"', 'type="reset"']) assert.ok(h.includes(f), f);
  assert.match(h, /id="calendar-empty" hidden/);
});

test("coverage: every country of the league directory is in the calendar", () => {
  global.window = {};
  require("../public/assets/leagues.src.js");
  const directory = new Set(window.EHA_LEAGUES_SRC.leagues.map((l) => l.country.en));
  delete global.window;
  const calendar = new Set(cal.ROWS.map((r) => r.country.en));
  for (const c of directory) assert.ok(calendar.has(c), c);
  assert.equal(directory.size, 28);
  const confirmed = new Set(cal.ROWS.filter((r) => r.status === "confirmed" && r.country.en !== "All countries").map((r) => r.country.en));
  assert.equal(confirmed.size, 10);
});

test("every row names season, type, league or age, status, check date; confirmed rows name an official source", () => {
  for (const r of cal.ROWS) {
    assert.ok(["international", "registration", "domestic", "restriction", "playoff"].includes(r.type));
    assert.ok(["senior", "junior", "all"].includes(r.category) && r.league);
    assert.match(r.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    if (r.status === "confirmed") assert.ok(r.source && cal.SOURCES[r.source].url.startsWith("https://"), r.league);
    for (const w of r.windows || []) {
      if (w.opens && w.closes) assert.ok(w.opens <= w.closes, r.league);
      if (w.closes) assert.ok(w.closes >= "2026-07-01" && w.closes <= "2027-06-30", `${r.league}: date outside season 2026/27`);
    }
  }
  assert.match(html(), /<td data-label="Season">2026\/27<\/td>/);
});

test("open now: only confirmed windows with a confirmed start and end", () => {
  const today = "2026-11-19";
  const open = cal.ROWS.filter((r) => (cal.windowState(r, today) || {}).state === "open").map((r) => `${r.country.en}|${r.league}`);
  assert.deepEqual(open.sort(), ["All countries|IIHF", "Czechia|ČSLH (outside Extraliga and 1. liga)", "Sweden|SIF (all competitions)", "Switzerland|SIHF (all competitions)"].sort());
  // a future deadline without a confirmed start is never "open"
  assert.equal(cal.windowState(find("Germany", "DEL2"), today).state, "ahead");
  assert.equal(cal.windowState(find("Austria", "Alps Hockey League"), today).state, "ahead");
  // an unconfirmed date (Polish 1 Liga, year unclear) never opens anything
  assert.equal(cal.windowState(find("Poland", "1 Liga"), today), null);
  assert.equal(filter({ open: "1" }).length, 4);
});

test("closing boundary and the year change at 31 December", () => {
  const sihf = find("Switzerland", "SIHF (all competitions)"); // 1 Nov – 31 Dec 2026
  const sif = find("Sweden", "SIF (all competitions)"); // 1 Jun 2026 – 31 Jan 2027
  assert.equal(cal.windowState(sihf, "2026-12-31").state, "open");
  assert.equal(cal.windowState(sihf, "2027-01-01").state, "closed");
  assert.equal(cal.windowState(sif, "2026-12-31").state, "open");
  assert.equal(cal.windowState(sif, "2027-01-01").state, "open");
  assert.equal(cal.windowState(sif, "2027-01-31").state, "open");
  assert.equal(cal.windowState(sif, "2027-02-01").state, "closed");
  const alps = find("Austria", "Alps Hockey League"); // closes 30 Dec 2026, 18:00, no time zone in the source
  assert.equal(cal.windowState(alps, "2026-12-30").state, "ahead");
  assert.equal(cal.windowState(alps, "2026-12-31").state, "closed");
  assert.ok(!JSON.stringify(alps.windows).match(/CET|UTC|tz/));
  // DEB youth: second window opens 1 December
  assert.deepEqual(cal.windowState(find("Germany", "DEB youth competitions"), "2026-11-19"), { state: "opens", date: "2026-12-01" });
  assert.equal(cal.windowState(find("Germany", "DEB youth competitions"), "2026-12-01").state, "open");
  // client and server agree
  for (const day of ["2026-11-19", "2026-12-31", "2027-01-01", "2027-02-16"]) {
    for (const r of cal.ROWS) {
      const w = (r.windows || []).filter((x) => x.closes).map((x) => `${x.opens || ""}~${x.closes}`).join(" ");
      assert.deepEqual(client.state(r.status, w, day), cal.windowState(r, day), `${r.league} ${day}`);
    }
  }
});

test("January and February deadlines, combinations and the empty result", () => {
  const jan = filter({ month: "1" }).map((r) => r.league);
  assert.ok(jan.includes("sif-all-competitions") && jan.includes("italian-hockey-league") && jan.includes("1-liga"), "unconfirmed 1 Liga date is listed with its status");
  assert.ok(!jan.includes("del2"));
  const feb = filter({ month: "2" }).map((r) => r.league);
  for (const l of ["iihf", "del2", "tauron-hokej-liga", "national-league"]) assert.ok(feb.includes(l), l);
  assert.ok(!feb.includes("eihl"), "last season's UK dates are not treated as 2026/27 deadlines");
  assert.equal(filter({ country: "finland", month: "1" }).filter((r) => r.country !== "all-countries").length, 0);
  assert.equal(filter({ country: "finland", month: "1" }).length, 0);
  const deFeb = filter({ country: "germany", month: "2" }).map((r) => r.league);
  assert.deepEqual(deFeb.sort(), ["del2", "iihf"].sort());
});

test("junior and senior rules are not mixed", () => {
  const senior = filter({ category: "senior" });
  const junior = filter({ category: "junior" });
  assert.ok(!senior.some((r) => r.category === "junior"));
  assert.ok(!junior.some((r) => r.category === "senior"), "IIHF 18+ window is not shown as a junior rule");
  assert.ok(junior.some((r) => r.league === "deb-youth-competitions") && junior.some((r) => r.league === "sif-all-competitions"));
});

test("statuses: not found in sources is labelled differently from a closed window; RU is localised", () => {
  const en = html();
  assert.match(en, /cal-not_published">Date not found in published sources</);
  const closed = html("en", new Date("2027-03-01T12:00:00Z"));
  assert.match(closed, /cal-state-closed">Window closed</);
  const ru = html("ru");
  for (const s of ["Месяц дедлайна", "Открыто сейчас", "Январь", "Февраль", "Сбросить фильтры", "Дата не найдена в опубликованных источниках", "Под эти фильтры записей нет"]) assert.ok(ru.includes(s), s);
  assert.ok(ru.includes('href="/ru/guides/mezhdunarodnyj-transfer-iihf"') && ru.includes('href="/ru/guides/hokkej-v-shvecii"'));
  assert.ok(en.includes('href="/leagues/germany-del2"') && en.includes('href="/guides/hockey-in-germany"'));
});

test("calendar page: filter combinations stay out of the sitemap and canonical", () => {
  const sitemapSrc = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");
  assert.ok(sitemapSrc.includes('"assets/transfer-calendar.js"'), "filter script is versioned");
  for (const f of ["en/guides/transfer-calendar-2026-27.html", "ru/guides/kalendar-transfernyh-okon-2026-27.html"]) {
    const page = fs.readFileSync(path.join(__dirname, "..", "public", f), "utf8");
    assert.ok(page.includes("<!-- TRANSFER_CALENDAR -->"));
    assert.ok(!/canonical" href="[^"]*\?/.test(page));
  }
});

test("AlpsHL vs Oberliga pair: answer, verifiable table with labelled sources, profile guidance, parent CTA and links in EN and RU", () => {
  for (const [f, lbl, parent, cal, dir] of [
    ["en/guides/alps-hockey-league-vs-oberliga.html", "EHA assessment", "/contact?type=parent&amp;intent=league_comparison&amp;source_page=/guides/alps-hockey-league-vs-oberliga", "/guides/transfer-calendar-2026-27", "/european-leagues"],
    ["ru/guides/alps-hockey-league-ili-oberliga.html", "оценка EHA", "/contact?type=parent&amp;intent=league_comparison&amp;source_page=/ru/guides/alps-hockey-league-ili-oberliga", "/guides/kalendar-transfernyh-okon-2026-27", "/ligi-evropy"]
  ]) {
    const s = fs.readFileSync(path.join(__dirname, "..", "public", f), "utf8");
    const table = s.slice(s.indexOf('<table class="league-table">'), s.indexOf("</table>"));
    assert.equal((table.match(/<tr>/g) || []).length, 11, `${f}: 10 criteria + header`);
    assert.equal((table.match(/<tr>/g) || []).length, (table.match(/<\/tr>/g) || []).length);
    assert.ok((table.match(new RegExp(lbl, "g")) || []).length >= 2, `${f}: assessment rows labelled`);
    assert.ok(s.includes(parent) && s.includes(`${cal}"`) && s.includes(`${dir}"`), f);
    assert.ok(/<h3>(How age, current league, role and goal change the choice|Как выбор зависит от возраста, текущей лиги, роли и цели)<\/h3>/.test(s));
  }
});
