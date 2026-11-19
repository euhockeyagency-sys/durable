const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PAGES = { en: "en/guides/hockey-academies-in-north-america.html", ru: "ru/guides/hokkejnye-akademii-severnoj-ameriki.html" };
const read = (p) => fs.readFileSync(path.join(__dirname, "..", "public", p), "utf8");
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test("North American academies guide has one price block", () => {
  for (const [locale, file] of Object.entries(PAGES)) {
    const html = read(file);
    assert.equal((html.match(/<table class="league-table">/g) || []).length, 1, `${locale}: one price table`);
    assert.ok(!/US boarding prep schools: what they actually charge|Prep-школы США: что реально стоит/.test(html), `${locale}: duplicate price section removed`);
    // each programme's price appears in the table only (CIHA and OHA were duplicated in prose)
    const outsideTable = html.replace(/<table class="league-table">[\s\S]*?<\/table>/, "").replace(/<script[\s\S]*?<\/script>/g, "");
    for (const price of ["53,900", "53 900", "60,700", "60 700", "83,700", "83 700"]) assert.ok(!outsideTable.includes(price), `${locale}: ${price} outside the table`);
    assert.ok(/Ontario Hockey Academy \(OHA\)<\/td>/.test(html), `${locale}: OHA row in the table`);
  }
});

test("NTDP: text, visible FAQ and FAQPage JSON-LD say the same and never call it free", () => {
  for (const [locale, file] of Object.entries(PAGES)) {
    const html = read(file);
    const faq = jsonLd(html).flatMap((d) => (d["@type"] === "FAQPage" ? d.mainEntity : []));
    const q = faq.find((x) => /NTDP/.test(x.name));
    assert.ok(q, `${locale}: NTDP question in JSON-LD`);
    const answer = q.acceptedAnswer.text;
    assert.ok(html.includes(`<p>${answer}</p>`), `${locale}: visible FAQ equals JSON-LD`);
    assert.ok(!/\bfree\b|бесплатн/i.test(answer), `${locale}: JSON-LD does not call it free`);
    assert.ok(/19 (November|ноября) 2026/.test(answer));
    assert.ok(/does not call the NTDP free|не называет NTDP бесплатной/.test(html), `${locale}: section text consistent`);
  }
});

test("Shattuck-St Mary's: international and domestic rate plus the hockey fee, confirmed on the school page", () => {
  assert.match(read(PAGES.en), /USD \$73,000 international boarding tuition \+ \$11,000 hockey programme fee = \$84,000[^<]*domestic boarding: \$65,000 \+ \$11,000[^<]*19 November 2026/);
  assert.match(read(PAGES.ru), /\$73 000[^<]*\+ \$11 000 за хоккейную программу = \$84 000[^<]*\$65 000 \+ \$11 000[^<]*19 ноября 2026/);
});
