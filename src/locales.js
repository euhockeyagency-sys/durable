"use strict";

// Single source of truth for the bilingual routing. Every page that exists in
// both languages is listed here once; this table drives four things that must
// never disagree: the language switcher, hreflang tags, the 301 redirect map
// for the eventual domain split, and the test that guards translation parity.
//
// `ru` and `en` are the public URL paths in each language. Where they are equal
// (e.g. "/services") the slug is shared across both domains; where they differ
// the slug belongs to exactly one language and, once the domains are split, a
// request for it on the wrong domain is 301'd to the right one.
const PAGES = [
  { ru: "/",                    en: "/" },
  { ru: "/services",            en: "/services" },
  { ru: "/players",             en: "/for-players" },
  { ru: "/cases",               en: "/cases" },
  { ru: "/agent",               en: "/agent" },
  { ru: "/contact",             en: "/contact" },
  { ru: "/for-clubs",           en: "/for-clubs" },
  { ru: "/guides",              en: "/guides" },
  { ru: "/privacy",             en: "/privacy" },
  { ru: "/kalkulyator-urovnya", en: "/level-calculator" },
  { ru: "/ligi-evropy",         en: "/european-leagues" },
  { ru: "/otkrytye-ligi-dlya-legionerov", en: "/open-hockey-leagues-for-imports" },
  { ru: "/yuniorskie-ligi-evropy", en: "/junior-hockey-leagues" },
  { ru: "/yuniorskij-hokkej-roditelyam", en: "/junior-hockey-for-parents" },
  { ru: "/ligi/shvetsiya-j20", en: "/leagues/sweden-j20" },
  { ru: "/ligi/shvetsiya-j18", en: "/leagues/sweden-j18" },
  { ru: "/guides/hokkej-v-polshe", en: "/guides/hockey-in-poland" },
  { ru: "/metodologiya", en: "/editorial-methodology" },
  { ru: "/hokkejnye-strany", en: "/hockey-countries" },
  { ru: "/guides/hokkej-v-avstrii", en: "/guides/hockey-in-austria" },
  { ru: "/guides/hokkej-v-kanade", en: "/guides/hockey-in-canada" },
  { ru: "/guides/hokkej-v-chexii", en: "/guides/hockey-in-czechia" },
  { ru: "/guides/hokkej-v-danii", en: "/guides/hockey-in-denmark" },
  { ru: "/guides/hokkej-v-finlyandii", en: "/guides/hockey-in-finland" },
  { ru: "/guides/hokkej-vo-francii", en: "/guides/hockey-in-france" },
  { ru: "/guides/hokkej-v-germanii", en: "/guides/hockey-in-germany" },
  { ru: "/guides/hokkej-v-italii", en: "/guides/hockey-in-italy" },
  { ru: "/guides/hokkej-v-niderlandah", en: "/guides/hockey-in-netherlands" },
  { ru: "/guides/hokkej-v-norvegii", en: "/guides/hockey-in-norway" },
  { ru: "/ligi/norvegiya-elitehockeyligaen", en: "/leagues/norway-elitehockeyligaen" },
  { ru: "/ligi/norvegiya-hockeyliga1", en: "/leagues/norway-hockeyliga1" },
  { ru: "/ligi/daniya-metal-ligaen", en: "/leagues/denmark-metal-ligaen" },
  { ru: "/ligi/daniya-1-division", en: "/leagues/denmark-1-division" },
  { ru: "/guides/hokkej-v-slovakii", en: "/guides/hockey-in-slovakia" },
  { ru: "/guides/hokkej-v-shvecii", en: "/guides/hockey-in-sweden" },
  { ru: "/guides/hokkej-v-shvejcarii", en: "/guides/hockey-in-switzerland" },
  { ru: "/guides/hokkej-v-velikobritanii", en: "/guides/hockey-in-united-kingdom" },
  { ru: "/guides/hokkej-v-ssha", en: "/guides/hockey-in-usa" },
  { ru: "/guides/dokumenty-dlya-yuniora-i-vzroslogo-hokkeista", en: "/guides/documents-for-junior-and-senior-hockey-players" },
  { ru: "/guides/pasport-es-i-non-eu-v-hokkee", en: "/guides/eu-vs-non-eu-passport-in-hockey" },
  { ru: "/guides/kak-najti-hokkejnyj-klub-v-evrope", en: "/guides/find-a-hockey-club-in-europe" },
  { ru: "/guides/hokkejnyj-agent-v-germanii", en: "/guides/hockey-agent-in-germany" },
  { ru: "/guides/hokkejnyj-agent-v-shvecii", en: "/guides/hockey-agent-in-sweden" },
  { ru: "/guides/karta-hokkejnyh-rynkov-2026", en: "/guides/hockey-market-map-2026" },
  { ru: "/guides/transfernye-okna-v-hokkee", en: "/guides/hockey-transfer-windows" },
  { ru: "/guides/dokumenty-i-transfery-v-hokkee", en: "/guides/hockey-visas-and-transfers" },
  { ru: "/guides/kak-proverit-predlozhenie-hokkejnogo-kluba", en: "/guides/how-to-verify-a-hockey-club-offer" },
  { ru: "/guides/mezhdunarodnyj-transfer-iihf", en: "/guides/iihf-international-transfer" },
  { ru: "/guides/poezdka-na-prosmotr-v-hokkejnyj-klub", en: "/guides/travelling-for-a-hockey-tryout" },
  { ru: "/guides/rabochaya-viza-dlya-hokkeista", en: "/guides/work-visa-for-hockey-player" },
  { ru: "/guides/hokkejnoe-rezyume", en: "/guides/hockey-resume-for-european-clubs" },
  { ru: "/guides/kak-rabotaet-hokkejnyj-agent", en: "/guides/how-a-hockey-agent-works" },
  { ru: "/guides/kak-vybrat-ligu", en: "/guides/how-to-choose-a-hockey-league" },
  { ru: "/guides/video-dlya-kluba", en: "/guides/hockey-video-for-clubs" },
  { ru: "/guides/chto-sprosit-u-hokkejnogo-agenta-pered-prosmotrom", en: "/guides/what-to-ask-a-hockey-agent-before-a-trial" },
  { ru: "/guides/kak-provesti-effektivnyj-prosmotr", en: "/guides/running-an-efficient-trial-checklist" },
  { ru: "/guides/chto-igrovoe-video-pokazyvaet-klubu", en: "/guides/what-game-video-tells-a-club" },
  { ru: "/ligi/finlyandiya-mestis", en: "/leagues/finland-mestis" },
  { ru: "/ligi/finlyandiya-suomi-sarja", en: "/leagues/finland-suomi-sarja" },
  { ru: "/ligi/shvetsiya-hockeyallsvenskan", en: "/leagues/sweden-hockeyallsvenskan" },
  { ru: "/ligi/shvetsiya-hockeyettan", en: "/leagues/sweden-hockeyettan" },
  { ru: "/ligi/germaniya-del2", en: "/leagues/germany-del2" },
  { ru: "/ligi/germaniya-oberliga", en: "/leagues/germany-oberliga" },
  { ru: "/ligi/chehiya-tipsport-extraliga", en: "/leagues/czechia-tipsport-extraliga" },
  { ru: "/ligi/chehiya-maxa-liga", en: "/leagues/czechia-maxa-liga" },
  { ru: "/ligi/slovakiya-tipsport-liga", en: "/leagues/slovakia-tipsport-liga" },
  { ru: "/ligi/slovakiya-tipos-shl", en: "/leagues/slovakia-tipos-shl" },
  { ru: "/ligi/polsha-tauron-hokej-liga", en: "/leagues/poland-tauron-hokej-liga" },
  { ru: "/ligi/polsha-1-liga-mhl", en: "/leagues/poland-1-liga-mhl" },
  { ru: "/ligi/avstriya-ice-hockey-league", en: "/leagues/austria-ice-hockey-league" },
  { ru: "/ligi/alps-hockey-league", en: "/leagues/alps-hockey-league" },
  { ru: "/ligi/franciya-ligue-magnus", en: "/leagues/france-ligue-magnus" },
  { ru: "/ligi/franciya-division-1", en: "/leagues/france-division-1" },
  { ru: "/ligi/velikobritaniya-eihl", en: "/leagues/uk-eihl" },
  { ru: "/ligi/velikobritaniya-planet-ice-national-league", en: "/leagues/uk-planet-ice-national-league" },
  { ru: "/ligi/shvejcariya-national-league", en: "/leagues/switzerland-national-league" },
  { ru: "/ligi/shvejcariya-sky-swiss-league", en: "/leagues/switzerland-sky-swiss-league" },
  { ru: "/ligi/niderlandy-cehl", en: "/leagues/netherlands-cehl" },
  { ru: "/ligi/niderlandy-eredivisie", en: "/leagues/netherlands-eredivisie" },
  { ru: "/ligi/vengriya-erste-liga", en: "/leagues/hungary-erste-liga" },
  { ru: "/ligi/vengriya-andersen-liga", en: "/leagues/hungary-andersen-liga" },
  { ru: "/ligi/rumyniya-campionatul-national", en: "/leagues/romania-campionatul-national" },
  { ru: "/guides/hokkej-v-estonii", en: "/guides/hockey-in-estonia" },
  { ru: "/guides/hokkej-v-vengrii", en: "/guides/hockey-in-hungary" },
  { ru: "/guides/hokkej-v-yaponii", en: "/guides/hockey-in-japan" },
  { ru: "/guides/hokkej-v-kazahstane", en: "/guides/hockey-in-kazakhstan" },
  { ru: "/guides/hokkej-v-latvii", en: "/guides/hockey-in-latvia" },
  { ru: "/guides/hokkej-v-litve", en: "/guides/hockey-in-lithuania" },
  { ru: "/guides/hokkej-v-rumynii", en: "/guides/hockey-in-romania" },
  { ru: "/guides/hokkej-v-slovenii", en: "/guides/hockey-in-slovenia" },
  { ru: "/guides/hokkej-v-ispanii", en: "/guides/hockey-in-spain" },
  { ru: "/guides/hokkej-v-serbii", en: "/guides/hockey-in-serbia" },
  { ru: "/guides/hokkej-v-horvatii", en: "/guides/hockey-in-croatia" },
  { ru: "/guides/hokkej-v-belgii", en: "/guides/hockey-in-belgium" },
  { ru: "/guides/zarplaty-hokkeistov-v-evrope", en: "/guides/hockey-player-salaries-in-europe" },
  { ru: "/ligi/italiya-ihl-serie-a", en: "/leagues/italy-ihl-serie-a" },
  { ru: "/ligi/italiya-italian-hockey-league", en: "/leagues/italy-italian-hockey-league" },
  { ru: "/ligi/latviya-1-liga", en: "/leagues/latvia-1-liga" },
  { ru: "/ligi/latviya-optibet-hokeja-liga", en: "/leagues/latvia-optibet-hokeja-liga" },
  { ru: "/ligi/estoniya-unibet-hokiliiga", en: "/leagues/estonia-unibet-hokiliiga" },
  { ru: "/ligi/ispaniya-liga-nacional", en: "/leagues/spain-liga-nacional" },
  { ru: "/ligi/kazahstan-pro-hokei-ligasy", en: "/leagues/kazakhstan-pro-hokei-ligasy" },
  { ru: "/ligi/yaponiya-asia-league", en: "/leagues/japan-asia-league" },
  { ru: "/ligi/ssha-ncaa-division-i", en: "/leagues/usa-ncaa-division-i" },
  { ru: "/ligi/ssha-echl", en: "/leagues/usa-echl" },
  { ru: "/ligi/finlyandiya-yuniorskij-hokkej", en: "/leagues/finland-junior-hockey" },
  { ru: "/ligi/chehiya-yuniorskij-hokkej", en: "/leagues/czechia-junior-hockey" },
  { ru: "/ligi/shvejcariya-yuniorskij-hokkej", en: "/leagues/switzerland-junior-hockey" },
  { ru: "/ligi/germaniya-yuniorskij-hokkej", en: "/leagues/germany-junior-hockey" },
  { ru: "/ligi/kanada-yuniorskij-hokkej", en: "/leagues/canada-junior-hockey" },
  { ru: "/ligi/ssha-ncdc", en: "/leagues/usa-ncdc" },
  { ru: "/guides/chehiya-tipsport-extraliga-vs-shvejcariya-national-league", en: "/guides/czechia-tipsport-extraliga-vs-switzerland-national-league" },
  { ru: "/guides/chehiya-maxa-liga-vs-slovakiya-tipos-shl", en: "/guides/czechia-maxa-liga-vs-slovakia-tipos-shl" },
  { ru: "/guides/shvetsiya-hockeyallsvenskan-vs-finlyandiya-mestis", en: "/guides/sweden-hockeyallsvenskan-vs-finland-mestis" },
  { ru: "/guides/germaniya-del2-vs-chehiya-maxa-liga", en: "/guides/germany-del2-vs-czechia-maxa-liga" },
  { ru: "/guides/hokkej-v-belarusi", en: "/guides/hockey-in-belarus" },
  { ru: "/novosti", en: "/news" },
  { ru: "/novosti/ncaa-razreshila-igrokam-chl-sohranyat-dopusk-division-i", en: "/news/ncaa-allows-chl-players-to-keep-division-i-eligibility" }
];

const RU_TO_EN = new Map(PAGES.map((p) => [p.ru, p.en]));
const EN_TO_RU = new Map(PAGES.map((p) => [p.en, p.ru]));

// Slug ownership for the two-domain redirect logic. A slug that appears only in
// one column "belongs" to that language; a slug present in both is shared and
// served from whichever domain asked for it.
const RU_ONLY = new Set(PAGES.filter((p) => p.ru !== p.en).map((p) => p.ru));
const EN_ONLY = new Set(PAGES.filter((p) => p.ru !== p.en).map((p) => p.en));

function classifyPath(pathname) {
  if (RU_ONLY.has(pathname)) return "ru";
  if (EN_ONLY.has(pathname)) return "en";
  return "shared"; // shared page, asset, guide, or anything else
}

function hostname(host) {
  return String(host || "").split(":")[0].trim().toLowerCase();
}

// Absolute base URL for a language. Always taken from configuration, never from
// the request Host header, so an untrusted host can never be reflected back into
// canonical/hreflang tags. Consolidated model: English at the primary root
// (enUrl), Russian under /ru/ on the same domain (ruUrl = enUrl + "/ru").
function baseUrlFor(locale, config) {
  return locale === "en" ? config.enUrl : config.ruUrl;
}

function joinBase(base, logicalPath) {
  return logicalPath === "/" ? `${base}/` : base + logicalPath;
}

// Absolute URL of the counterpart page in the other language, for the language
// switcher. Falls back to the other language's home when the page has no
// declared translation (e.g. a guide not yet translated).
function altUrlFor(locale, logicalPath, config) {
  const other = locale === "ru" ? "en" : "ru";
  const map = locale === "ru" ? RU_TO_EN : EN_TO_RU;
  return joinBase(baseUrlFor(other, config), map.get(logicalPath) || "/");
}

// hreflang alternates for a page, or "" if the page is not a declared bilingual
// page. x-default points at English (the international default audience).
function hreflangFor(logicalPath, locale, config) {
  const ruPath = locale === "ru" ? logicalPath : EN_TO_RU.get(logicalPath);
  const enPath = locale === "en" ? logicalPath : RU_TO_EN.get(logicalPath);
  if (!ruPath || !enPath) return null;
  return {
    ru: joinBase(baseUrlFor("ru", config), ruPath),
    en: joinBase(baseUrlFor("en", config), enPath)
  };
}

// Resolve a request (already on the primary domain — legacy hosts are 301'd to
// it earlier, in redirectDuplicateHosts) to a language, a file root under
// publicDir, and the language-neutral logical path used to locate the file.
// Consolidated model: English at the root, Russian under /ru/. May instead
// return a 301 (stray /en/ prefix, or a Russian-only slug reached without /ru/).
function resolveLocale(host, pathname, config) {
  const ruPrefix = config.ruPrefix || "/ru";
  const enPrefixed = pathname === "/en" || pathname.startsWith("/en/");
  const ruPrefixed = pathname === ruPrefix || pathname.startsWith(`${ruPrefix}/`);

  // A stray /en/ prefix must not create a duplicate of the root English tree.
  if (enPrefixed) {
    const rest = pathname === "/en" ? "/" : (pathname.slice(3) || "/");
    return { redirect: { status: 301, location: joinBase(config.enUrl, rest) } };
  }

  // Russian lives under /ru/. Serve it from public/ru with internal links and
  // absolute URLs prefixed, so canonical/hreflang/sitemap all read .com/ru/...
  if (ruPrefixed) {
    let rest = pathname === ruPrefix ? "/" : (pathname.slice(ruPrefix.length) || "/");
    // A doubled prefix (/ru/ru/...) is a duplicate URL. Collapse every extra
    // prefix and 301 to the single canonical /ru/ URL so it can never be served
    // or indexed twice — this catches external inbound links too.
    if (rest === ruPrefix || rest.startsWith(`${ruPrefix}/`)) {
      while (rest === ruPrefix || rest.startsWith(`${ruPrefix}/`)) {
        rest = rest === ruPrefix ? "/" : (rest.slice(ruPrefix.length) || "/");
      }
      return { redirect: { status: 301, location: joinBase(config.ruUrl, rest) } };
    }
    return { locale: "ru", root: "ru", logicalPath: rest, urlPrefix: ruPrefix };
  }

  // Root of the primary domain is English. A Russian-only slug that arrives
  // without the /ru/ prefix (an old inbound link) is 301'd into the /ru/ tree.
  const cls = classifyPath(pathname);
  if (cls === "ru") {
    return { redirect: { status: 301, location: config.enUrl + ruPrefix + pathname } };
  }
  return { locale: "en", root: "en", logicalPath: pathname };
}

module.exports = {
  PAGES,
  RU_TO_EN,
  EN_TO_RU,
  resolveLocale,
  baseUrlFor,
  altUrlFor,
  hreflangFor,
  classifyPath
};
