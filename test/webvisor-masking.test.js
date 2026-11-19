const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", "public", file), "utf8");

// Session replay (Yandex Webvisor) must not record what players, parents and
// clubs type: ym-hide-content blocks the whole form, ym-disable-keys masks
// field values whichever "record all fields" setting the counter has.
for (const [file, id] of [["en/contact.html", "profile-form"], ["ru/contact.html", "profile-form"], ["en/for-clubs.html", "club-request-form"], ["ru/for-clubs.html", "club-request-form"]]) {
  test(`${file}: #${id} and every typed field are masked from session replay`, () => {
    const html = read(file);
    const start = html.indexOf(`id="${id}"`);
    const form = html.slice(html.lastIndexOf("<form", start), html.indexOf("</form>", start));
    const formTag = form.match(/^<form[^>]*>/)[0];
    assert.match(formTag, /class="[^"]*\bym-hide-content\b/);
    assert.match(formTag, /class="[^"]*\bym-disable-keys\b/);
    const fields = [...form.matchAll(/<(input|textarea|select)\b[^>]*>/g)].map((m) => m[0])
      .filter((tag) => !/type="(hidden|submit|button|radio|checkbox)"/.test(tag));
    assert.ok(fields.length > 5);
    for (const tag of fields) assert.match(tag, /class="[^"]*\bym-disable-keys\b/, tag);
    assert.doesNotMatch(form, /ym-record-keys|ym-show-content/);
  });
}

test("the calculator's Elite Prospects link and the success-page reference are masked", () => {
  for (const file of ["en/level-calculator.html", "ru/kalkulyator-urovnya.html"]) {
    assert.match(read(file), /<input[^>]*class="[^"]*\bym-disable-keys\b[^"]*"[^>]*id="calc-ep"|<input[^>]*id="calc-ep"[^>]*class="[^"]*\bym-disable-keys\b/);
  }
  for (const file of ["en/application-success.html", "ru/application-success.html"]) {
    assert.match(read(file), /<strong class="ym-hide-content" data-application-reference>/);
  }
});

test("Metrica is initialised only after consent", () => {
  const site = read("site.js");
  assert.match(site, /if\(consent==='granted'\)\{updateConsent\(true\);initYandex\(\)\}/);
  assert.match(site, /if\(choice==='accept'\)\{initYandex\(\)/);
});
