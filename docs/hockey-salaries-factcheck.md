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
