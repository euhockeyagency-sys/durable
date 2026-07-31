const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

test("every published page is registered in the PAGES table", () => {
  // The companion test in app.test.js walks table -> file. This walks file ->
  // table: a page that ships without a PAGES row silently loses hreflang and
  // gets a language switcher that dumps the visitor on the home page, and the
  // table->file test can never catch it. Utility pages that are intentionally
  // language-local (no cross-language counterpart) are the only exceptions.
  const publicDir = path.join(__dirname, "..", "public");
  const UTILITY = /^(404|application-success)$/;
  const columns = { en: new Set(PAGES.map((p) => p.en)), ru: new Set(PAGES.map((p) => p.ru)) };
  const missing = [];
  for (const locale of ["en", "ru"]) {
    const root = path.join(publicDir, locale);
    const walk = (dir, prefix) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { if (entry.name !== "assets") walk(full, `${prefix}${entry.name}/`); continue; }
        if (!entry.name.endsWith(".html")) continue;
        const base = entry.name.replace(/\.html$/, "");
        if (UTILITY.test(base)) continue;
        const slug = base === "index" && prefix === "" ? "/" : `/${prefix}${base}`;
        if (!columns[locale].has(slug)) missing.push(`${locale}: ${slug}`);
      }
    };
    walk(root, "");
  }
  assert.deepEqual(missing, [], `pages missing from PAGES:\n${missing.join("\n")}`);
});

test("page table covers every published bilingual pair without duplicate paths", () => {
  // No hardcoded page count: the table grows every time a page is published,
  // and a snapshot number would turn every legitimate addition into a red
  // build. What must hold is the invariant — each path appears exactly once in
  // its language column, so the switcher, hreflang and the redirect map can
  // never disagree. (The companion test in app.test.js checks that every
  // registered pair actually exists as a file in both language directories.)
  assert.ok(PAGES.length >= 45, `expected at least 45 bilingual pages, got ${PAGES.length}`);
  assert.equal(new Set(PAGES.map((page) => page.ru)).size, PAGES.length, "duplicate RU path in PAGES");
  assert.equal(new Set(PAGES.map((page) => page.en)).size, PAGES.length, "duplicate EN path in PAGES");
  for (const page of PAGES) {
    assert.ok(page.ru.startsWith("/"), `RU path must start with "/": ${page.ru}`);
    assert.ok(page.en.startsWith("/"), `EN path must start with "/": ${page.en}`);
    assert.ok(!page.ru.startsWith("/ru/"), `RU path must not carry a language prefix: ${page.ru}`);
    assert.ok(!page.en.startsWith("/en/"), `EN path must not carry a language prefix: ${page.en}`);
  }
});
