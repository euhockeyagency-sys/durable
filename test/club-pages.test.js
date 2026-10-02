const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PAGES } = require("../src/locales");

const root = path.join(__dirname, "..");

function fileFor(locale, route) {
  return path.join(root, "public", locale, `${route.replace(/^\//, "")}.html`);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

test("club pages are bilingual, routed and carry the required EHA club-page contract", () => {
  const clubRoutes = PAGES.filter((p) => p.en.startsWith("/clubs/"));
  assert.ok(clubRoutes.length > 0, "at least one verified club route should exist");

  for (const route of clubRoutes) {
    assert.ok(route.ru.startsWith("/kluby/"), `${route.en} must have a /kluby/ RU route`);

    const enFile = fileFor("en", route.en);
    const ruFile = fileFor("ru", route.ru);
    assert.ok(fs.existsSync(enFile), `missing EN club file for ${route.en}`);
    assert.ok(fs.existsSync(ruFile), `missing RU club file for ${route.ru}`);

    for (const [locale, file, canonicalRoute] of [
      ["en", enFile, route.en],
      ["ru", ruFile, route.ru]
    ]) {
      const html = read(file);
      assert.equal(countMatches(html, /<h1(?:\s[^>]*)?>/g), 1, `${file} must have exactly one H1`);
      assert.ok(
        html.includes(`<link rel="canonical" href="{{BASE_URL}}${canonicalRoute}">`),
        `${file} must have the route canonical`
      );
      assert.match(html, /"@type":"SportsTeam"/, `${file} must include SportsTeam schema`);
      assert.match(html, /"@type":"BreadcrumbList"/, `${file} must include breadcrumb schema`);
      assert.match(html, /"@type":"FAQPage"/, `${file} must include FAQ schema`);
      assert.match(html, /class="sources-block"/, `${file} must include an official-sources block`);
      assert.match(html, /https:\/\//, `${file} must cite at least one external official source`);
      assert.match(html, /2026\/27/, `${file} must state the active season`);

      if (locale === "en") {
        assert.match(html, /<strong>Verified:<\/strong>/, `${file} must show a verified date`);
        assert.match(html, /href="{{EN}}\/guides\//, `${file} must link its country guide`);
        assert.match(html, /href="{{EN}}\/leagues\//, `${file} must link its league guide`);
      } else {
        assert.match(html, /<strong>Проверено:<\/strong>/, `${file} must show a verified date`);
        assert.match(html, /href="\/guides\//, `${file} must link its country guide`);
        assert.match(html, /href="\/ligi\//, `${file} must link its league guide`);
      }
    }
  }
});
