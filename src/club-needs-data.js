// Club requests shown on /club-needs (EN) and /zaprosy-klubov (RU).
//
// Add a request ONLY after the club has confirmed it to EHA. Never add demo,
// example or old requests from past conversations. The workflow (add, weekly
// check, close) is described in docs/club-needs-process.md; run
// `node scripts/check-club-needs.js` for the weekly review.
//
// Public fields (rendered on the page):
//   id            stable slug, e.g. "2026-11-se-hockeyettan-d"; used in the CTA
//   status        "open" | "closed"  (closed requests are never rendered)
//   publish       true only when the club agreed that the request may be public
//   countryCode   ISO 3166-1 alpha-2, e.g. "SE"
//   league        league name as the club uses it
//   season        "2026/27"
//   position      "G" | "D" | "F" | "C" | "W" | "LW" | "RW"
//   age           { en, ru } or null, e.g. born 2003–2006
//   importStatus  { en, ru } or null; only what the club confirmed in writing
//   conditions    { en, ru } or null; known conditions only, no guesses
//
// Internal fields (never rendered, never sent to the browser):
//   lastChecked   "YYYY-MM-DD": last time the club reconfirmed the request
//   validUntil    "YYYY-MM-DD": the request disappears from the page after this date
//   source        who confirmed it and how (internal note)
//   notes         internal notes
//
// Do not put club contact details, private names or the club name (unless the
// club allowed it) in any public field.
module.exports = [];
