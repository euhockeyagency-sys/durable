const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveLocale, baseUrlFor, altUrlFor, hreflangFor } = require("../src/locales");

const single = { hostsConfigured: false, siteUrl: "https://eha.test" };
const split = {
  hostsConfigured: true,
  siteUrl: "https://eurohockeyagency.com",
  ruHost: "eurohockeyagency.ru",
  enHost: "eurohockeyagency.com",
  ruUrl: "https://eurohockeyagency.ru",
  enUrl: "https://eurohockeyagency.com"
};

test("single-domain: RU at root, EN under /en/", () => {
  assert.deepEqual(resolveLocale("x", "/", single), { locale: "ru", root: "ru", logicalPath: "/" });
  assert.deepEqual(resolveLocale("x", "/services", single), { locale: "ru", root: "ru", logicalPath: "/services" });
  assert.deepEqual(resolveLocale("x", "/en", single), { locale: "en", root: "en", logicalPath: "/" });
  assert.deepEqual(resolveLocale("x", "/en/", single), { locale: "en", root: "en", logicalPath: "/" });
  assert.deepEqual(resolveLocale("x", "/en/for-players", single), { locale: "en", root: "en", logicalPath: "/for-players" });
});

test("single-domain: the Host header is ignored (no reflection)", () => {
  assert.deepEqual(resolveLocale("attacker.example", "/", single), { locale: "ru", root: "ru", logicalPath: "/" });
  assert.equal(baseUrlFor("ru", single), "https://eha.test");
  assert.equal(baseUrlFor("en", single), "https://eha.test/en");
});

test("single-domain: language switcher points at the counterpart page", () => {
  assert.equal(altUrlFor("ru", "/players", single), "https://eha.test/en/for-players");
  assert.equal(altUrlFor("en", "/for-players", single), "https://eha.test/players");
  assert.equal(altUrlFor("ru", "/", single), "https://eha.test/en/");
  // A page without a declared translation falls back to the other language home.
  assert.equal(altUrlFor("ru", "/guides/hokkej-v-shvecii", single), "https://eha.test/en/");
});

test("two-domain: host decides the language for shared slugs", () => {
  assert.deepEqual(resolveLocale("eurohockeyagency.com", "/services", split), { locale: "en", root: "en", logicalPath: "/services" });
  assert.deepEqual(resolveLocale("eurohockeyagency.ru", "/services", split), { locale: "ru", root: "ru", logicalPath: "/services" });
  assert.deepEqual(resolveLocale("eurohockeyagency.com", "/for-players", split), { locale: "en", root: "en", logicalPath: "/for-players" });
  assert.deepEqual(resolveLocale("eurohockeyagency.ru", "/kalkulyator-urovnya", split), { locale: "ru", root: "ru", logicalPath: "/kalkulyator-urovnya" });
});

test("two-domain: a slug on the wrong domain 301s to the right one", () => {
  assert.deepEqual(resolveLocale("eurohockeyagency.com", "/players", split).redirect,
    { status: 301, location: "https://eurohockeyagency.ru/players" });
  assert.deepEqual(resolveLocale("eurohockeyagency.com", "/kalkulyator-urovnya", split).redirect,
    { status: 301, location: "https://eurohockeyagency.ru/kalkulyator-urovnya" });
  assert.deepEqual(resolveLocale("eurohockeyagency.ru", "/level-calculator", split).redirect,
    { status: 301, location: "https://eurohockeyagency.com/level-calculator" });
});

test("two-domain: a stray /en/ prefix 301s to the clean English URL", () => {
  assert.deepEqual(resolveLocale("eurohockeyagency.com", "/en/for-players", split).redirect,
    { status: 301, location: "https://eurohockeyagency.com/for-players" });
  assert.deepEqual(resolveLocale("eurohockeyagency.ru", "/en/services", split).redirect,
    { status: 301, location: "https://eurohockeyagency.com/services" });
});

test("two-domain: an untrusted host defaults to RU without reflecting it", () => {
  assert.deepEqual(resolveLocale("attacker.example", "/kalkulyator-urovnya", split),
    { locale: "ru", root: "ru", logicalPath: "/kalkulyator-urovnya" });
});

test("hreflang alternates come from the page table", () => {
  assert.deepEqual(hreflangFor("/players", "ru", single), {
    ru: "https://eha.test/players",
    en: "https://eha.test/en/for-players"
  });
  assert.deepEqual(hreflangFor("/for-players", "en", single), {
    ru: "https://eha.test/players",
    en: "https://eha.test/en/for-players"
  });
  assert.equal(hreflangFor("/guides/hokkej-v-shvecii", "ru", single), null);
  assert.deepEqual(hreflangFor("/guides/hokkej-v-polshe", "ru", single), {
    ru: "https://eha.test/guides/hokkej-v-polshe",
    en: "https://eha.test/en/guides/hockey-in-poland"
  });
  assert.equal(altUrlFor("en", "/guides/hockey-in-poland", single), "https://eha.test/guides/hokkej-v-polshe");
});
