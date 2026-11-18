# League pages audit: country → league → page (18 November 2026)

Scope: the league directory (`public/assets/leagues.src.js`, 58 records in 28 country records; 29 country guides including Belarus) and the 52 English league pages (`public/en/leagues/`, each paired with a Russian page in `PAGES`).

## Decisions taken in this pass

- No new league URLs. Every pilot league already had a page, so both were rebuilt on their current URLs.
- One page per league, aliases recorded in data:
  - France Division 1 — aliases D1, FFHG Division 1.
  - TAURON Hokej Liga — former name PHL (Polska Hokej Liga), also THL; explained on the page so a "PHL limit" search lands on it.
  - Norway: the directory used the old name "1. divisjon" while the page is Hockeyliga1; the record is renamed to Hockeyliga1 with "formerly 1. divisjon" in the note.
- 15 directory records had a page but no `url`, so the calculator result and the directory table did not link to them. The `url` is now set for all of them (France ×2, Austria ×2, Norway, Denmark ×2, Switzerland ×2, Hungary, UK ×2, Italy, Latvia, Romania).
- Shared league template: `src/league-profiles.js` (data) and `src/league-profile.js` (rendering). Pilots: `fr-d1`, `pl-thl`.

## Map

| Country | League (data) | Tier | Existing page | Action |
|---|---|---|---|---|
| Finland | Liiga | 1 | — | No page — create only when verified data exists |
| Finland | Mestis | 2 | `/leagues/finland-mestis` | Update on current URL |
| Finland | Suomi-sarja | 3 | `/leagues/finland-suomi-sarja` | Update on current URL |
| Finland | U20 SM-sarja (junior) | 1 | `/leagues/finland-junior-hockey` | Update on current URL |
| Finland | U18 SM-sarja (junior) | 1 | `/leagues/finland-junior-hockey` | Update on current URL |
| Sweden | SHL | 1 | — | No page — create only when verified data exists |
| Sweden | HockeyAllsvenskan | 2 | `/leagues/sweden-hockeyallsvenskan` | Update on current URL |
| Sweden | Hockeyettan | 3 | `/leagues/sweden-hockeyettan` | Update on current URL |
| Sweden | U20 Nationell (junior) | 1 | `/leagues/sweden-j20` | Update on current URL |
| Sweden | U18 Nationell (junior) | 1 | `/leagues/sweden-j18` | Update on current URL |
| Czechia | Tipsport Extraliga | 1 | `/leagues/czechia-tipsport-extraliga` | Update on current URL |
| Czechia | Maxa liga | 2 | `/leagues/czechia-maxa-liga` | Update on current URL |
| Czechia | 2. liga | 3 | — | No page — create only when verified data exists |
| Czechia | Extraliga juniorů (junior) | 1 | `/leagues/czechia-junior-hockey` | Update on current URL |
| Czechia | Extraliga staršího dorostu (junior) | 1 | `/leagues/czechia-junior-hockey` | Update on current URL |
| Slovakia | Tipsport liga | 1 | `/leagues/slovakia-tipsport-liga` | Update on current URL |
| Slovakia | TIPOS SHL | 2 | `/leagues/slovakia-tipos-shl` | Update on current URL |
| Germany | DEL | 1 | — | No page — create only when verified data exists |
| Germany | DEL2 | 2 | `/leagues/germany-del2` | Update on current URL |
| Germany | Oberliga | 3 | `/leagues/germany-oberliga` | Update on current URL |
| Germany | U20 Division I (junior) | 1 | `/leagues/germany-junior-hockey` | Update on current URL |
| Germany | U17 Division I (junior) | 1 | `/leagues/germany-junior-hockey` | Update on current URL |
| Austria | ICE Hockey League | 1 | `/leagues/austria-ice-hockey-league` | Update on current URL (url added to leagues.src.js in this pass) |
| Austria | Alps Hockey League | 2 | `/leagues/alps-hockey-league` | Update on current URL (url added to leagues.src.js in this pass) |
| Slovenia | Alps Hockey League | 1 | `/leagues/alps-hockey-league` | Update on current URL. Shares the multi-country Alps Hockey League page. |
| Poland | TAURON Hokej Liga | 1 | `/leagues/poland-tauron-hokej-liga` | Update on current URL. Pilot page (this task). Historical name: Polska Hokej Liga (PHL). |
| Poland | 1 liga | 2 | `/leagues/poland-1-liga-mhl` | Update on current URL |
| Norway | EliteHockey Ligaen | 1 | `/leagues/norway-elitehockeyligaen` | Update on current URL |
| Norway | 1. divisjon | 2 | `/leagues/norway-hockeyliga1` | Update on current URL (url added to leagues.src.js in this pass). Data name is the old one; the page uses the current name Hockeyliga1. Keep one page, add the old name as an alias. |
| Denmark | Metal Ligaen | 1 | `/leagues/denmark-metal-ligaen` | Update on current URL (url added to leagues.src.js in this pass) |
| Denmark | 1. division | 2 | `/leagues/denmark-1-division` | Update on current URL (url added to leagues.src.js in this pass) |
| Switzerland | National League | 1 | `/leagues/switzerland-national-league` | Update on current URL (url added to leagues.src.js in this pass) |
| Switzerland | Swiss League | 2 | `/leagues/switzerland-sky-swiss-league` | Update on current URL (url added to leagues.src.js in this pass) |
| Switzerland | MyHockey League | 3 | — | No page — create only when verified data exists |
| Switzerland | U21-Elit (junior) | 1 | `/leagues/switzerland-junior-hockey` | Update on current URL |
| Switzerland | U18-Elit (junior) | 1 | `/leagues/switzerland-junior-hockey` | Update on current URL |
| France | Ligue Magnus | 1 | `/leagues/france-ligue-magnus` | Update on current URL (url added to leagues.src.js in this pass) |
| France | Division 1 | 2 | `/leagues/france-division-1` | Update on current URL (url added to leagues.src.js in this pass). Pilot page (this task). |
| France | Division 2 | 3 | — | No page — create only when verified data exists |
| Hungary | Erste Liga | 1 | `/leagues/hungary-erste-liga` | Update on current URL (url added to leagues.src.js in this pass) |
| United Kingdom | EIHL | 1 | `/leagues/uk-eihl` | Update on current URL (url added to leagues.src.js in this pass) |
| United Kingdom | NIHL National | 2 | `/leagues/uk-planet-ice-national-league` | Update on current URL (url added to leagues.src.js in this pass) |
| Italy | IHL Serie A | 1 | `/leagues/italy-ihl-serie-a` | Update on current URL (url added to leagues.src.js in this pass). Page exists; Italian Hockey League (second level) page is not in the data source. |
| Latvia | Optibet hokeja līga | 1 | `/leagues/latvia-optibet-hokeja-liga` | Update on current URL (url added to leagues.src.js in this pass) |
| Lithuania | Optibet hokeja līga | 1 | `/leagues/latvia-optibet-hokeja-liga` | Update on current URL. Lithuania points to the Latvian league page; check which competition Lithuanian clubs play in for 2026/27 before building a Lithuania page. |
| Estonia | Unibet Hokiliiga | 1 | `/leagues/estonia-unibet-hokiliiga` | Update on current URL |
| Netherlands | CEHL | 1 | `/leagues/netherlands-cehl` | Update on current URL |
| Spain | Liga Nacional | 1 | `/leagues/spain-liga-nacional` | Update on current URL |
| Romania | Liga Naţională | 1 | `/leagues/romania-campionatul-national` | Update on current URL (url added to leagues.src.js in this pass). Page exists as Romanian Senior Championship (Campionatul Național); data name differs. |
| Serbia | International Hockey League (IHL) | 1 | — | No page — create only when verified data exists. No page; regional league, data not verified. |
| Croatia | IHL / Alps Hockey League | 1 | — | No page — create only when verified data exists. Shared record; no Croatian page. Check which competition each Croatian club enters. |
| Belgium | CEHL | 1 | `/leagues/netherlands-cehl` | Update on current URL. Shares the CEHL page with the Netherlands (former BeNe League); no separate Belgian page. |
| Kazakhstan | Pro Hokei Ligasy | 1 | `/leagues/kazakhstan-pro-hokei-ligasy` | Update on current URL |
| Japan | Asia League Ice Hockey | 1 | `/leagues/japan-asia-league` | Update on current URL |
| Canada | CHL (WHL / OHL / QMJHL) (junior) | 1 | `/leagues/canada-junior-hockey` | Update on current URL |
| USA | NCAA Division I | 1 | `/leagues/usa-ncaa-division-i` | Update on current URL |
| USA | NCDC (junior) | 2 | `/leagues/usa-ncdc` | Update on current URL |
| USA | ECHL | 2 | `/leagues/usa-echl` | Update on current URL |

Pages without a record in `leagues.src.js`:

- `/leagues/austria-junior-hockey`
- `/leagues/hungary-andersen-liga`
- `/leagues/italy-italian-hockey-league`
- `/leagues/latvia-1-liga`
- `/leagues/netherlands-eredivisie`
- `/leagues/slovakia-junior-hockey`
- `/leagues/usa-nahl`
- `/leagues/usa-ushl`
- `/leagues/usa-usphl-premier`


The pages above without a directory record are not duplicates: Andersen Liga is a separate Hungarian competition from Erste Liga, the Italian Hockey League is the level below IHL Serie A, and the rest are junior or North American pages.

## Points to check before more pages

- Lithuania points to the Latvian league page. Confirm which competition Lithuanian clubs enter in 2026/27 before writing a Lithuania page.
- Croatia and Serbia: shared or regional records, no verified rules. No page until a primary source is read.
- Czech 2. liga, French Division 2, Liiga, SHL, DEL, Swiss MyHockey League: no page. Create one only once rules and windows are verified.

## Next leagues for the template, with missing data

| League | Already verified (docs or pages) | Missing before the template can be filled |
|---|---|---|
| France Ligue Magnus | FFHG AS/ALM 2026/27 (same documents as D1): January window with two arrivals, medical jokers | Ligue Magnus JFL minimums (AS art. 8.3 table for LM), club list, salary sample |
| Poland 1 Liga / MHL | Regulation PDF exists in the PZHL list | Read the 1 Liga 2026/27 regulation (press reports 55% domestic players and a Polish goaltender); window dates |
| Italy Italian Hockey League | Category B limit, goalkeeper rule, transfer deadline (page verified) | Move facts into a profile; salary sample |
| Hungary Erste Liga / Andersen Liga | Foreign-player limits and transfer deadline (pages verified) | Re-check for 2026/27, residence and work sources |
| UK EIHL | `docs/eihl-factcheck.md` | Import-licence rules for 2026/27, windows |
| Switzerland National League | `docs/switzerland-factcheck.md` | Window dates, licence category rules |
| Alps Hockey League | Club and game counts (3 Nov 2026) | Per-country import rules (AT, IT, SI) — three federations |
| Sweden Hockeyettan | Third-party salary range | SIHF import rules for 2026/27, windows |
| Netherlands CEHL | Former BeNe League naming | Import limits per federation (NL, BE), windows |
| Norway Hockeyliga1, Denmark Metal Ligaen / 1. division | Pages exist | Import rules and windows from NIHF / DIU documents |
