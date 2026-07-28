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
  { ru: "/guides/video-dlya-kluba", en: "/guides/hockey-video-for-clubs" }
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
// canonical/hreflang tags.
function baseUrlFor(locale, config) {
  if (config.hostsConfigured) return locale === "en" ? config.enUrl : config.ruUrl;
  // Single-domain mode: EN lives under /en/, RU at the root.
  return locale === "en" ? `${config.siteUrl}/en` : config.siteUrl;
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

// Resolve a request to a language, a file root under publicDir, and the logical
// path used to locate the file. In two-domain mode it may instead return a 301
// redirect (cross-language slug on the wrong domain, or a stray /en/ prefix).
function resolveLocale(host, pathname, config) {
  const enPrefixed = pathname === "/en" || pathname.startsWith("/en/");
  const ruPrefixed = pathname === "/ru" || pathname.startsWith("/ru/");
  const stripEn = () => {
    if (pathname === "/en") return "/";
    const rest = pathname.slice(3);
    return rest === "" ? "/" : rest;
  };
  const stripRu = () => {
    if (pathname === "/ru" || pathname === "/ru/") return "/";
    return pathname.slice(3);
  };

  if (!config.hostsConfigured) {
    // Single-domain mode (pre-migration): the Host header is ignored entirely.
    if (enPrefixed) return { locale: "en", root: "en", logicalPath: stripEn() };
    return { locale: "ru", root: "ru", logicalPath: pathname };
  }

  // Two-domain mode (post-migration): the host decides the language.
  const name = hostname(host);
  const onRu = name === config.ruHost;

  // Keep Russian content reachable below /ru/ on the English domain while the
  // dedicated .ru hostname remains unavailable.
  if (ruPrefixed && !onRu) {
    return { locale: "ru", root: "ru", logicalPath: stripRu(), urlPrefix: "/ru" };
  }
  if (ruPrefixed && onRu) {
    return { redirect: { status: 301, location: joinBase(config.ruUrl, stripRu()) } };
  }

  // No /en/ prefix should survive on a language-specific domain.
  if (enPrefixed) {
    return { redirect: { status: 301, location: joinBase(config.enUrl, stripEn()) } };
  }

  const cls = classifyPath(pathname);
  // Only the exact RU hostname selects the unprefixed Russian tree. Requests
  // without a public Host (for example a localhost health check) default to EN.
  if (!onRu) {
    if (cls === "ru") return { redirect: { status: 301, location: config.ruUrl + pathname } };
    return { locale: "en", root: "en", logicalPath: pathname };
  }
  // The dedicated RU domain serves the unprefixed Russian tree.
  if (cls === "en") return { redirect: { status: 301, location: config.enUrl + pathname } };
  return { locale: "ru", root: "ru", logicalPath: pathname };
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
