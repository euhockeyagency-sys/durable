# Hockey player salaries — factcheck log

Source for the page: `public/en/guides/hockey-player-salaries-in-europe.html` and
`public/ru/guides/zarplaty-hokkeistov-v-evrope.html`.

## 2026-10-05 review

Triggered by Search Console query data showing real search demand for leagues
the page didn't cover by name (ICEHL, DEL2, HockeyEttan, Hungary's Erste Liga),
with existing content for ICEHL and DEL2 buried mid-paragraph where it couldn't
match the query. Restructured so each league gets its own paragraph; added two
genuinely new entries (HockeyEttan, Erste Liga) after verification below.

| League | Figure added | Source | Verification |
| --- | --- | --- | --- |
| Austria — ICEHL | 40,000–150,000+ EUR/year, unofficial | playhockeyineurope.com, fetched 2026-10-05 (page's own "Publication Date: September 7, 2026") | Matches the figure already on the page (cited 24 Sep 2025), same unofficial estimate reconfirmed. No official ICEHL/union source found. |
| Germany — DEL2 | 25,000–90,000 EUR/year, unofficial | playhockeyineurope.com, fetched 2026-10-05 | Differs from the page's existing "~20,000–60,000 EUR, player-agency sources" figure (undated, unnamed source). Presented as two disagreeing unofficial estimates, neither removed. |
| Sweden — HockeyEttan | 12,000–25,000 EUR/year, imports only, unofficial | playhockeyineurope.com, fetched 2026-10-05 | WebFetch directly on playhockeyineurope.com's HockeyAllsvenskan-vs-HockeyEttan comparison page and on sico.nu found **no** usable figure (comparison page has no numbers; sico.nu URL 404s). The figure used comes from playhockeyineurope.com's main cross-league page instead, consistent with how the rest of the page already cites that same page for other leagues. |
| Hungary — Erste Liga | 15,000–50,000 EUR/year, unofficial | playhockeyineurope.com, fetched 2026-10-05 | No independent second source checked; flagged as unofficial/third-party only, matching the page's existing confidence-labelling convention. |

## Still unverified / out of scope this pass

- Whether playhockeyineurope.com's "Publication Date: September 7, 2026" reflects
  a per-figure update or just a page-level timestamp — treated conservatively as
  "most recently confirmed" rather than claiming it as the original observation date.
- No attempt was made to find a second independent source for HockeyEttan, Erste
  Liga or the new DEL2 range. If a club/agent disputes a figure, prefer the
  official league/union source over this page.

## 2026-11-14 review — Liiga

Triggered by Search Console: many "liiga salary" impressions, page had no Liiga
terms beyond one Yle example. Added only what a primary document states.

| Item | Figure / term | Source | Verification |
| --- | --- | --- | --- |
| Liiga — agreement | Dated 15 June 2026, valid for season 2026–27; no minimum salary or pay scale published | SM-liiga Oy / Suomen Jääkiekkoilijat ry convention PDF (sjry.fi) | Fetched 2026-11-14. Pay sits in the Player Contract and its "Player Fee" appendix (Appendix 1), not in the public text. Signature block in the copy is blank — page says so. |
| Injury compensation | 85% of season salary, on a maximum of EUR 143,620 for 2026 | §3.4.2 | Verbatim quote confirmed on second fetch. |
| Holiday pay | Salary in contract = total incl. holiday pay; 9% monthly (11.5% after 1 year) | §3.5.6 | Verbatim quote confirmed. |
| Pension premium | 4.5% of salary during the season | §3.4.3 | Verbatim quote confirmed. |
| May salaries | Clubs playing in May pay salaries until the last game | §4 | Quote confirmed. |

Not added: third-party Liiga ranges (playhockeyineurope.com 75,000–300,000 EUR;
expert-zoom.com articles) — unofficial or unverifiable, not presented as fact.
Title/meta of the EN and RU pages were retargeted to "SHL, Liiga, ICEHL, DEL2".

## 2026-11-14 — country guides: "Чемпионат X по хоккею" answer paragraphs

Titles/H1 of six RU guides (Czechia, Italy, Spain, Hungary, France, Netherlands)
retargeted to "Чемпионат X по хоккею" (Search Console demand), and a one-paragraph
answer added at the top of each RU+EN guide. No new facts: every statement is
copied from the same page's already-verified sections (league names, levels, team
counts, dates). Not a salary change; logged here for the audit trail only.

## 2026-11-15 — Germany: championship wording

RU guide `hokkej-v-germanii`: title/H1 now "Чемпионат Германии по хоккею 2026/27 …". RU and EN Germany guides, and the DE page `eishockey-in-deutschland` (title, meta, H1, first H2: "Welche Eishockey-Ligen gibt es in Deutschland? Das Ligasystem"), were retargeted at search queries. The new short answer in the RU/EN guides uses only facts already on the same page (DEL top level; DEL2 14 clubs, 52 games; Oberliga 26 teams, 12 North and 14 South) from the 5 October 2026 check. No new facts and no new salary figures; the sources were not re-opened on this date.

## 2026-11-15 — third-party estimates table (unofficial)

Owner approved restoring third-party ranges as a separately labelled table on the salary guide (EN `hockey-player-salaries-in-europe`, RU `zarplaty-hokkeistov-v-evrope`, section `third-party-salary-estimates`).

Source: playhockeyineurope.com, "How Much Do Hockey Players Make In Europe?", page dated 7 September 2026, read 15 November 2026. Ranges copied as listed, in EUR: ICEHL 40,000–150,000+; Alps Hockey League 18,000–45,000; DEL 90,000–350,000; DEL2 25,000–90,000; Oberliga 15,000–40,000 (imports); SHL 80,000–300,000+; Allsvenskan 18,000–48,000; Sweden Division 1 12,000–25,000 (high end, imports only); Liiga 75,000–300,000; Czech Extraliga 50,000–250,000+; Polish Hockey League 15,000–60,000+; Erste Liga (Hungary and Romania) 15,000–50,000; Metal Ligaen 20,000–39,000.

Limits stated on the page: the source calls them approximate ranges from its network and player-reported figures; it does not say gross or net, annual or per season, or what is included. The Allsvenskan and Division 1 lines were mapped by EHA to HockeyAllsvenskan and Hockeyettan (the source uses its own names). Second source: icehockeyjobs.com listed ICEHL at USD 27,376–109,504 (August 2023 conversion), shown on the page as evidence that unofficial sources disagree. No official league or union scale was found for any of these leagues, so none is claimed. EHA's own ranges are not published; they need the owner's data from real offers.
