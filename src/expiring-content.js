// Hides dated content after its validity ends, at request time, so an outdated
// rule is never shown as current even if the page was built earlier.
// Markup contract (scripts/build-cases.js):
//   <li data-valid-until="YYYY-MM-DD">…</li> inside <div class="rule-group">…</div>
//   inside <section class="country-extra" id="verified-rules">…</section>
const ITEM = /<li data-valid-until="(\d{4}-\d{2}-\d{2})">[\s\S]*?<\/li>/g;
const EMPTY_GROUP = /<div class="rule-group"><h3>[^<]*<\/h3><ul class="rule-list"><\/ul><\/div>/g;
const RULES_SECTION = /<section class="country-extra" id="verified-rules">[\s\S]*?<\/section>\n?/;

function stripExpired(html, today) {
  if (!html.includes("data-valid-until=")) return html;
  let out = html.replace(ITEM, (item, date) => (date >= today ? item : ""));
  out = out.replace(EMPTY_GROUP, "");
  const section = out.match(RULES_SECTION);
  if (section && !section[0].includes("<li")) out = out.replace(RULES_SECTION, "");
  return out;
}

module.exports = { stripExpired };
