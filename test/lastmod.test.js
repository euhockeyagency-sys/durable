const test = require("node:test");
const assert = require("node:assert/strict");
const { contentFingerprint, lastContentChange } = require("../scripts/generate-lastmod");

const page = (main, extra = "") => `<html><head><title>T</title></head><body><nav>menu</nav><main>${main}</main><footer>f${extra}</footer></body></html>`;

test("lastmod fingerprint ignores markup, links, sitewide blocks and template tokens", () => {
  const base = contentFingerprint(page('<h1>DEL2</h1><p>Import rule: <a href="/contact?intent=a">ask</a></p>'));
  for (const variant of [
    page('<h1 class="x">DEL2</h1>\n<p>Import rule:  <a href="/contact?intent=league_assessment&amp;country=DE">ask</a></p>'),
    page('<h1>DEL2</h1><p>Import rule: <a href="{{EN}}/contact">ask</a></p>', " new footer link"),
    page('<nav class="breadcrumbs wrap">Home / Leagues</nav><h1>DEL2</h1><div class="wrap reviewer-note"><p>Reviewed by someone</p></div><p>Import rule: <a href="/x">ask</a></p><section class="cta"><h2>Send profile</h2></section>'),
    page('<h1>DEL2</h1><script>var a=1</script><p>Import rule: <a>ask</a></p>')
  ]) assert.equal(contentFingerprint(variant), base);
  assert.notEqual(contentFingerprint(page("<h1>DEL2</h1><p>Import rule changed: <a>ask</a></p>")), base);
});

test("a CTA-link-only commit does not move the page's lastmod (real history)", () => {
  // 29a6244 rewrote only /contact link queries on /agent; e2b3f37 is the previous version.
  const commits = [
    { commit: "29a6244c30c076f9c619f9bd4bf8ae092c0964bc", date: "2026-11-19" },
    { commit: "e2b3f3745b237a7635f1885f9332946bb19a21c3", date: "2026-11-18" },
    { commit: "e69e102788d72f535462b34c2ffbd4b57765d92f", date: "2026-11-18" }
  ];
  const date = lastContentChange("public/en/agent.html", commits);
  assert.notEqual(date, "2026-11-19");
});

test("adding or removing an editorial date stamp does not move lastmod", () => {
  const p = (main) => `<html><body><main>${main}</main></body></html>`;
  assert.equal(contentFingerprint(p("<p>Text. Updated 18 November 2026.</p>")), contentFingerprint(p("<p>Text.</p>")));
  assert.equal(contentFingerprint(p('<p class="kicker">Рынок игроков · обновлено в сентябре 2026</p>')), contentFingerprint(p('<p class="kicker">Рынок игроков</p>')));
  assert.equal(contentFingerprint(p("<p><strong>Editorial review:</strong> 8 August 2026. Re-check.</p>")), contentFingerprint(p("<p>Re-check.</p>")));
  // ordinary words that look like months are still content
  assert.notEqual(contentFingerprint(p("<p>Players may sign</p>")), contentFingerprint(p("<p>Players sign</p>")));
});
