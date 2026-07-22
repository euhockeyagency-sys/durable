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
  { ru: "/guides",              en: "/guides" },
  { ru: "/privacy",             en: "/privacy" },
  { ru: "/kalkulyator-urovnya", en: "/level-calculator" },
  { ru: "/ligi-evropy",         en: "/european-leagues" }
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
  const stripEn = () => {
    if (pathname === "/en") return "/";
    const rest = pathname.slice(3);
    return rest === "" ? "/" : rest;
  };

  if (!config.hostsConfigured) {
    // Single-domain mode (pre-migration): the Host header is ignored entirely.
    if (enPrefixed) return { locale: "en", root: "en", logicalPath: stripEn() };
    return { locale: "ru", root: "ru", logicalPath: pathname };
  }

  // Two-domain mode (post-migration): the host decides the language.
  const name = hostname(host);
  const onEn = name === config.enHost;

  // No /en/ prefix should survive on a language-specific domain.
  if (enPrefixed) {
    return { redirect: { status: 301, location: joinBase(config.enUrl, stripEn()) } };
  }

  const cls = classifyPath(pathname);
  if (onEn) {
    if (cls === "ru") return { redirect: { status: 301, location: config.ruUrl + pathname } };
    return { locale: "en", root: "en", logicalPath: pathname };
  }
  // On the RU domain, or an untrusted host (defaults to RU without reflecting it).
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
