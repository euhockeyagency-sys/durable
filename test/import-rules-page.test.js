"use strict";

// Item 5 (21.11.2026): the cross-league import-limit page is built only from
// league-profiles.js, and the age-pathway guide carries a sourced age table.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");
const { PROFILES } = require("../src/league-profiles");

const PUBLIC = path.join(__dirname, "..", "public");
const base = "https://eha.test";
const app = createApp({
  config: { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", trustProxy: false, applicationConfigured: false, missingApplicationKeys: [] },
  services: {}
});
const get = (url) => request(app).get(url).set("Host", "eha.test").expect(200);
const withGameSheet = PROFILES.filter((p) => p.rules.some((r) => r.scope === "game_sheet"));

for (const [url, locale] of [["/guides/european-hockey-import-rules-2026-27", "en"], ["/ru/guides/limity-legionerov-v-ligah-evropy-2026-27", "ru"]]) {
  test(`import-limit table (${locale}) has one row per profiled league and labels press reports`, async () => {
    const { text } = await get(url);
    assert.doesNotMatch(text, /IMPORT_RULES_TABLE/);
    const rows = [...text.matchAll(/data-profile-id="([a-z0-9-]+)"/g)].map((m) => m[1]);
    assert.deepEqual(rows.sort(), withGameSheet.map((p) => p.id).sort());
    const pressRules = withGameSheet.flatMap((p) => p.rules).filter((r) => r.scope === "game_sheet" && r.status === "press");
    assert.equal((text.match(/rule-status rule-press/g) || []).length, pressRules.length);
    for (const p of withGameSheet) assert.ok(text.includes(`href="${locale === "ru" ? "/ru" : ""}${p.paths[locale]}"`), p.id);
    assert.match(text, /hreflang="(ru|en)"/);
    assert.match(text, /"@type":"FAQPage"/);
  });
}

test("age-pathway guides carry a sourced CHL/USHL/NAHL/NCAA table in both languages", async () => {
  for (const url of ["/guides/junior-hockey-age-pathway-ncaa-chl", "/ru/guides/put-yunogo-hokkeista-po-vozrastam-ncaa-chl"]) {
    const { text } = await get(url);
    const table = text.slice(text.indexOf('id="age-table"'), text.indexOf('id="chl-ages"'));
    for (const name of ["CHL", "USHL", "NAHL", "NCAA"]) assert.ok(table.includes(`<strong>${name}`), `${url} ${name}`);
    for (const src of ["chl.ca", "usahockey.com", "ushl.com", "nahl.com", "ncaa.org"]) assert.ok(table.includes(src), `${url} ${src}`);
  }
});
