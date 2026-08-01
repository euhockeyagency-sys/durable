// ItemList schema for the European leagues hub. The countries hub already
// enumerates its pages as an ItemList; this gives the leagues hub the same
// machine-readable list of the league pages it indexes, so both engines can
// read what the hub collects. The list is built from the PAGES table (every
// league page that actually resolves and ships in the sitemap) with names taken
// from each page's own H1, so it can never drift from the real pages.

const fs = require("node:fs");
const path = require("node:path");
const { PAGES } = require("./locales");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

function h1Name(file) {
  try {
    const match = fs.readFileSync(file, "utf8").match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!match) return "";
    // "DEL2: player route and rules 2026/27" -> "DEL2"
    return match[1].replace(/<[^>]+>/g, " ").split(":")[0].replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

let cache = null;
function leaguePages() {
  if (cache) return cache;
  cache = PAGES.filter((p) => p.en.startsWith("/leagues/")).map((p) => ({
    en: p.en,
    ru: p.ru,
    nameEn: h1Name(path.join(PUBLIC_DIR, "en", `${p.en}.html`)),
    nameRu: h1Name(path.join(PUBLIC_DIR, "ru", `${p.ru}.html`))
  }));
  return cache;
}

const jsonSafe = (value) =>
  String(value).replace(/[<>&]/g, (ch) => ({ "<": "\\u003C", ">": "\\u003E", "&": "\\u0026" }[ch]));

// Returns a JSON-LD <script> enumerating every league page as an ItemList.
function leaguesItemList(locale, baseUrl) {
  const loc = locale === "ru" ? "ru" : "en";
  const pages = leaguePages();
  if (!pages.length) return "";
  const items = pages.map((p, i) => {
    const item = { "@type": "ListItem", position: i + 1, url: baseUrl + p[loc] };
    const name = loc === "ru" ? p.nameRu : p.nameEn;
    if (name) item.name = name;
    return item;
  });
  const graph = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: loc === "ru" ? "Хоккейные лиги Европы" : "European hockey leagues",
    numberOfItems: items.length,
    itemListElement: items
  };
  return `<script type="application/ld+json">${jsonSafe(JSON.stringify(graph))}</script>`;
}

module.exports = { leaguesItemList, leaguePages };
