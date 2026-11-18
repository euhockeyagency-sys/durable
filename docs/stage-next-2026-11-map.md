# Next stage (brief of 18.11.2026): status, URLs, sources, gaps

Russian pages: the primary domain serves them under `/ru/`; `eurohockeyagency.ru` answers with a 301 redirect to the same path under `https://eurohockeyagency.com/ru` (`src/app.js`, legacy host). Hreflang, canonical and sitemaps use the `/ru/` URLs only.

| # | Item | Decision | EN · RU |
|---|---|---|---|
| 1 | ITC: how it works, cost, who pays, refusals | updated existing guide | /guides/iihf-international-transfer · /ru/guides/mezhdunarodnyj-transfer-iihf |
| 2 | Net vs gross: €2,000 in Germany and Poland | new | /guides/net-vs-gross-hockey-salary-germany-poland · /ru/guides/netto-i-brutto-zarplata-hokkeista-germaniya-polsha |
| 3 | Sports visa and EU work permit, CIS and North America | updated existing guide | /guides/work-visa-for-hockey-player · /ru/guides/rabochaya-viza-dlya-hokkeista |
| 4 | Import player insurance | new | /guides/hockey-player-insurance-abroad · /ru/guides/strahovka-hokkeista-legionera |
| 5 | After MHL/NMHL to Europe | not published | needs a country-by-country check of league restrictions and visa availability for Russian and Belarusian citizens in 2026/27 |
| 6 | From USPHL / EHL / NA3HL to Europe | new | /guides/from-usphl-ehl-na3hl-to-senior-hockey-in-europe · /ru/guides/iz-usphl-ehl-na3hl-vo-vzroslyj-hokkej-evropy |
| 7 | European U20: SWE, FIN, CZE, SUI, AUT | new hub | /guides/european-u20-hockey-sweden-finland-czechia-switzerland-austria · /ru/guides/evropejskie-u20-shvetsiya-finlyandiya-chehiya-shvejcariya-avstriya |
| 8 | Clubs: import on a budget | new | /guides/import-player-on-a-budget-for-second-and-third-division-clubs · /ru/guides/legioner-s-ogranichennym-byudzhetom-dlya-klubov-vtorogo-i-tretego-diviziona |
| 9 | Clubs: first two weeks checklist | new, printable | /guides/import-player-first-two-weeks-checklist · /ru/guides/pervye-dve-nedeli-legionera-v-klube |
| 10 | Points between leagues (NHLe) | new, method only, no coefficients | /guides/why-points-do-not-translate-between-hockey-leagues · /ru/guides/pochemu-ochki-ne-perenosyatsya-mezhdu-ligami |
| C1 | AlpsHL vs Oberliga | new | /guides/alps-hockey-league-vs-oberliga · /ru/guides/alps-hockey-league-ili-oberliga |
| C2 | TAURON Hokej Liga (PHL) vs Ligue Magnus | new | /guides/tauron-hokej-liga-vs-ligue-magnus · /ru/guides/tauron-hokej-liga-ili-ligue-magnus |
| C3 | HockeyEttan vs Mestis | new | /guides/hockeyettan-vs-mestis · /ru/guides/hockeyettan-ili-mestis |
| T1 | Transfer calendar 2026/27 | new tool, all 28 directory countries | /guides/transfer-calendar-2026-27 · /ru/guides/kalendar-transfernyh-okon-2026-27 (data `src/transfer-calendar.js`) |
| T2 | Free Hockey CV | .docx + PDF added to the existing resume guide | /assets/downloads/EHA-Hockey-CV-template.{docx,pdf}, EHA-hokkejnoe-rezyume-shablon.{docx,pdf} |
| K | Calculator | up to 3 matching guides, directory fallback, "Submit Your Profile" / «Отправить профиль агенту» | `public/assets/level-calculator.js` |

## Sources used for new facts

- ITC fees and process: Ice Hockey UK ITC policy 2025/26 (fee breakdown 300 CHF IIHF + 300 CHF home association, £954 total, 7-day reply, refusal grounds); IIHF unlimited transfer request form (associations may charge up to 500 CHF; player responsible for service charges); DEB information page (325 euros per transfer card). The 2026 IIHF regulation PDF could not be opened from EHA's environment.
- Germany 2026 social insurance rates: Arbeitskammer des Saarlandes, Sozialversicherungswerte 01/2026. Wage tax: not calculated, BMF calculator linked.
- Poland 2026: Zielona Linia (public employment service) — 13.71% employee social contributions, 9% health, 12% PIT, 30,000 PLN tax-free amount.
- USPHL/NCDC 2026/27: usphl.com releases; NA3HL: na3hl.com (38 teams, 4 September 2026); EHL team count: trade press (Arizona Rubber).
- U20 facts: the existing junior league pages and their federation sources (SIF, SJL/Finhockey, ČSLH, SIHF, ÖEHV).
- Visa routes: Make it in Germany, Migri, Migrationsverket, Polish voivodeship procedure, Service-Public.fr, GOV.UK, EU Immigration Portal.

## Not confirmed / open

- Article 5 (MHL/NMHL): not written — league restrictions for Russian/Belarusian players and visa availability by country need primary sources.
- Transfer calendar: 16 countries have "requires checking" or "not published" rows (ICEHL, CEHL, CHL, Czech senior leagues, Denmark, Estonia, Finland senior, DEL/Oberliga, Erste Liga, Japan, Kazakhstan, Latvia, Lithuania, Norway, Romania, Serbia, Slovakia, Spain, USA); UK dates are from the 2025/26 IHUK policy; Polish 1 Liga year to confirm.
- No EHA salary sample for any league in the comparisons except the AlpsHL estimate.
- No verified EHA transfer cases from USPHL/EHL/NA3HL; no data for an EHA Index (cases lack seasons and previous leagues).
- Expert review: all new texts say "Prepared by the EHA editorial team" (owner decision); no "Reviewed by" claim.
- Search demand for the three comparisons is a hypothesis from Search Console query and page data; no direct "X vs Y" queries were seen.
