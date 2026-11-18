# Content plan, 14 topics: facts and sources (checked 18 November 2026)

All league rules in the new tables come from `src/league-profiles.js` (one record per league, with season, status and source) and render through `src/article-blocks.js`. Facts below are the ones written directly into article text.

| Fact | Source | Status |
|---|---|---|
| AlpsHL 2026/27: 16 points per game; 4 / 2 (born 2005–2006) / 1 (born 2007+); 4 domestic incl. 1 U20 and 3 U22 per sheet; status declared once per season | Alps Hockey League Game Book 2026/27, section C §1–4 (gamebook.alps.hockey, dated 1 Sep 2026), via the AlpsHL league page | official |
| AlpsHL: 13 clubs (AT, IT, SI, HR), 36 games | AlpsHL league mode 2026/27 | official |
| AlpsHL pay €15,000–45,000 per season | EHA estimate (owner, 16 Nov 2026; salary article) | EHA estimate |
| Oberliga 26 teams (12 North, 14 South) | DEB, 1 July 2026 | official |
| DEL2: 4 foreign per sheet, 6 per season, non-German = foreign; licence deadline 15 Feb 2027 | DEL2 Spielordnung (Sept 2026) | official |
| Germany athlete route €50,700 gross a year (2026) | German athlete visa source on the DEL2/Oberliga profiles | official |
| Bavarian Bayernliga run by BEV; regional leagues' import rules | BEV documents; 2026/27 regional rules not read | gap |
| HockeyEttan 40 clubs, 2×20, 38 rounds | Swedish Ice Hockey Association league page | official |
| HockeyAllsvenskan 52 rounds, 364 games from 18 Sep 2026 | HockeyAllsvenskan schedule article | official |
| Sweden athlete permit: salary ≥ one third of the price base amount; SEK 59,200 in 2026 | Migrationsverket athletes page; Statistics Sweden (as recorded on the HockeyEttan page). Per-month wording not re-read this time | official, wording to re-check |
| Suomi-sarja 14 teams; no universal roster rule found | Leijonat results service; Finland guide | official / gap |
| Mestis, Migri €1,149 | see `docs/league-profiles-factcheck.md` | official |
| CHL ages 16–20 (early entry at 15), 3 import spots, Import Draft 2026 | CHL recruitment page; CHL/WHL 23 June 2026 | official |
| USHL tuition-free with housing and travel; NAHL no hockey tuition | NAHL pages and the US junior guide's sources | official / league pages |
| NCAA DI age-based model (enrol by the academic year after the 19th birthday, up to five years) | NCAA Eligibility Center page | official |
| Erste Liga 11 foreign registrations per season | Erste Liga profile | official |
| “100+ players placed since 2016”, agent since 2016 | `BRAND.md` (owner-confirmed) | confirmed |

Not used: average salaries for leagues without a sample; any case on the career-restart page (no confirmed, consented case); “100+ deals” (BRAND.md confirms players placed, not deals).

Topic 14 (league-to-league stats before and after) is blocked: `src/cases-data.js` has 37 published cases, none with a season or previous league recorded, at most four per destination league. A comparison needs, per case, the season, the previous league, games and points before and after, and the player's permission for public use. Stats can come from the official EP API (key not provided) or league sites — not from scraping.
