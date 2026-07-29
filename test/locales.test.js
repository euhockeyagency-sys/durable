const test = require("node:test");
const assert = require("node:assert/strict");
const { PAGES, resolveLocale, baseUrlFor, altUrlFor, hreflangFor } = require("../src/locales");

// Consolidated single-domain model: English at the primary root, Russian under
// /ru/ on the same domain. Legacy-host 301s are handled in app.js middleware,
// so resolveLocale here only ever sees the primary domain.
const cfg = {
  siteUrl: "https://eha.test",
  primaryUrl: "https://eha.test",
  primaryHost: "eha.test",
  enUrl: "https://eha.test",
  ruUrl: "https://eha.test/ru",
  ruPrefix: "/ru",
  legacyRuHost: "eha-legacy.test"
};

test("base URLs: English at the root, Russian under /ru/", () => {
  assert.equal(baseUrlFor("en", cfg), "https://eha.test");
  assert.equal(baseUrlFor("ru", cfg), "https://eha.test/ru");
});

test("English is served at the root", () => {
  assert.deepEqual(resolveLocale("eha.test", "/", cfg), { locale: "en", root: "en", logicalPath: "/" });
  assert.deepEqual(resolveLocale("eha.test", "/services", cfg), { locale: "en", root: "en", logicalPath: "/services" });
  assert.deepEqual(resolveLocale("eha.test", "/for-players", cfg), { locale: "en", root: "en", logicalPath: "/for-players" });
});

test("Russian is served under /ru/ with the /ru prefix carried for link rewriting", () => {
  assert.deepEqual(resolveLocale("eha.test", "/ru", cfg), { locale: "ru", root: "ru", logicalPath: "/", urlPrefix: "/ru" });
  assert.deepEqual(resolveLocale("eha.test", "/ru/", cfg), { locale: "ru", root: "ru", logicalPath: "/", urlPrefix: "/ru" });
  assert.deepEqual(resolveLocale("eha.test", "/ru/services", cfg), { locale: "ru", root: "ru", logicalPath: "/services", urlPrefix: "/ru" });
  assert.deepEqual(resolveLocale("eha.test", "/ru/kalkulyator-urovnya", cfg), { locale: "ru", root: "ru", logicalPath: "/kalkulyator-urovnya", urlPrefix: "/ru" });
});

test("a Russian-only slug reached without /ru/ 301s into the /ru/ tree", () => {
  assert.deepEqual(resolveLocale("eha.test", "/players", cfg).redirect,
    { status: 301, location: "https://eha.test/ru/players" });
  assert.deepEqual(resolveLocale("eha.test", "/kalkulyator-urovnya", cfg).redirect,
    { status: 301, location: "https://eha.test/ru/kalkulyator-urovnya" });
});

test("a stray /en/ prefix 301s to the clean root URL", () => {
  assert.deepEqual(resolveLocale("eha.test", "/en", cfg).redirect,
    { status: 301, location: "https://eha.test/" });
  assert.deepEqual(resolveLocale("eha.test", "/en/", cfg).redirect,
    { status: 301, location: "https://eha.test/" });
  assert.deepEqual(resolveLocale("eha.test", "/en/for-players", cfg).redirect,
    { status: 301, location: "https://eha.test/for-players" });
});

test("language switcher points at the counterpart page on the same domain", () => {
  assert.equal(altUrlFor("ru", "/players", cfg), "https://eha.test/for-players");
  assert.equal(altUrlFor("en", "/for-players", cfg), "https://eha.test/ru/players");
  assert.equal(altUrlFor("ru", "/", cfg), "https://eha.test/");
  assert.equal(altUrlFor("en", "/", cfg), "https://eha.test/ru/");
  // A page without a declared translation falls back to the other language home.
  assert.equal(altUrlFor("ru", "/guides/not-translated", cfg), "https://eha.test/");
});

test("hreflang alternates come from the page table, all on the primary domain", () => {
  assert.deepEqual(hreflangFor("/players", "ru", cfg), {
    ru: "https://eha.test/ru/players",
    en: "https://eha.test/for-players"
  });
  assert.deepEqual(hreflangFor("/for-players", "en", cfg), {
    ru: "https://eha.test/ru/players",
    en: "https://eha.test/for-players"
  });
  assert.deepEqual(hreflangFor("/guides/hokkej-v-shvecii", "ru", cfg), {
    ru: "https://eha.test/ru/guides/hokkej-v-shvecii",
    en: "https://eha.test/guides/hockey-in-sweden"
  });
  assert.deepEqual(hreflangFor("/guides/hockey-in-poland", "en", cfg), {
    ru: "https://eha.test/ru/guides/hokkej-v-polshe",
    en: "https://eha.test/guides/hockey-in-poland"
  });
  assert.equal(altUrlFor("en", "/guides/hockey-video-for-clubs", cfg), "https://eha.test/ru/guides/video-dlya-kluba");
});

test("page table covers every published bilingual pair without duplicate paths", () => {
  assert.equal(PAGES.length, 45);
  assert.equal(new Set(PAGES.map((page) => page.ru)).size, PAGES.length);
  assert.equal(new Set(PAGES.map((page) => page.en)).size, PAGES.length);
});
