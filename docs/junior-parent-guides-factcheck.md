# Junior parent guides and season cost calculator: fact-check record

Pages: `guides/child-safety-and-host-families-in-hockey` (RU `bezopasnost-rebenka-i-prinimayushchaya-semya`), `guides/homesickness-and-adaptation-for-young-hockey-players` (RU `adaptaciya-yunogo-hokkeista-za-rubezhom`), `guides/hockey-offer-scams-and-sample-offer` (RU `moshennichestvo-v-hokkee-i-obrazec-oferty`), `junior-season-cost-calculator` (RU `kalkulyator-stoimosti-sezona`). Written 14 October 2026. This is an editorial record, not legal advice.

No source was re-fetched for this change. Every regulatory claim is taken from an existing fact-check in this folder and carries that document's check date. Re-verify against the primary source before relying on any of it as current.

## Child safety and host families

| Claim on the page | Source record | Checked |
| --- | --- | --- |
| Hockey Canada billeting package: screening of household members 19+, in-home interview, references, orientation, supervision, private bedroom, school attendance, anti-hazing appendix; leagues and teams apply it themselves | `canada-junior-factcheck.md` | 10 Aug 2026 |
| CHL Respect Hockey Culture Center, independent third-party reporting platform, launched October 2023 | `canada-junior-factcheck.md` | 10 Aug 2026 |
| NCDC Player Safety Policies state adherence to USA Hockey's SafeSport Program; page appeared not fully current | `usa-junior-factcheck.md` | 10 Aug 2026 |
| DEB Safe Sport toolkit (guidance for clubs, not one binding policy); Krefeld boarding house, Kölner Haie and Nürnberg host-family recruitment | `germany-junior-factcheck.md` | 9 Aug 2026 |
| Swiss Sport Integrity (2022); SIHF adherence and coach reporting duty; R067 lists housing or host family as negotiated | `switzerland-junior-factcheck.md` | 9 Aug 2026 |
| Finnish "Et ole yksin" framework; club-level application not confirmed | `finland-junior-factcheck.md` | 9 Aug 2026 |
| Swedish RF "Trygg idrott"; no universal housing model | `sweden-junior-factcheck.md` | 3 Aug 2026 |
| Czech national ethics code requires a federation safeguarding officer; ČSLH policy not confirmed | `czechia-junior-factcheck.md` | 9 Aug 2026 |
| No federation-wide housing or billeting model in Sweden, Finland, Czechia, Slovakia, Germany | `junior-pathway-compare-factcheck.md` | see that file |

Not sourced from a fact-check and therefore stated only as general knowledge or EHA recommendation: emergency numbers (112 in the EU, 911 in Canada and the USA), the recommendation that the selecting coach not be the only adult a child can turn to, and the question lists for host families and boarding houses. The Slovakia fact-check was not used for a safety claim.

Deliberately omitted: Austria and Slovakia safeguarding bodies (not researched), and any claim about the current status of Canada's OSIC (the Canada record says it could not be verified).

## Homesickness and adaptation

Editorial content with no regulatory claim. Call frequency, warning signs and "when to come home" criteria are EHA suggestions and are labelled as such on the page. The page says it is not medical advice and tells parents to involve a local doctor or psychologist and use the local emergency number in an emergency. No clinical statistics or study results are cited. No page source list is shown.

## Offer scams and sample offer

Patterns are generic and unattributed. No real case, club, agency or person is named. The sample offer is fictional: "Northern Stars HC" and "Euro Elite Hockey Management" were invented, and the sender address uses the reserved `.invalid` domain. The page states that fees are not by themselves a sign of fraud and describes the test (legal entity, written terms, payee, refund). Links point to Your Europe and IIHF transfer regulations already used on `how-to-verify-a-hockey-club-offer`. The "ask the federation whether agent registration is required" step is phrased as a question because rules differ by country and were not researched.

## Season cost calculator

Built-in prices come only from `north-america-hockey-academies-factcheck.md` (checked 10 Aug 2026, direct reads). Each preset is one named, dated data point. The calculator adds entered amounts, never averages or ranks schools, and never supplies an exchange rate.

| Preset | Currency | School | Hockey | Other fees | Year |
| --- | --- | --- | --- | --- | --- |
| Shattuck-St Mary's, international | USD | 73,000 | 11,000 | 0 | 2026-27 |
| Shattuck-St Mary's, domestic | USD | 65,000 | 11,000 | 0 | 2026-27 |
| Kent School | USD | 83,700 | not itemised | 0 | 2026-27 |
| Culver Academies | USD | 69,500 | not itemised | 0 | 2026-27 |
| Salisbury School | USD | 75,450 | not itemised | 3,338.50 | 2025-26 |
| Berkshire School | USD | 82,200 | not itemised | 1,590 | 2026-27 |
| Tabor Academy | USD | 82,100 | not itemised | 0 | 2026-27 |
| Ontario Hockey Academy, Canadian boarding | CAD | 44,200 (33,500 + 10,700) | 11,500 | 5,000 deposit | not stated |
| CIHA, Canadian boarding | CAD | 48,900 | not itemised | 0 | not stated |
| CIHA, international boarding | CAD | 52,900 | not itemised | 0 | not stated |

`test/cost-calculator.test.js` asserts that each preset sums to the total recorded in the fact-check (for example Berkshire 83,790, Salisbury 78,788.50, OHA 60,700).

Deliberately excluded: Avon Old Farms (conflicting figures), the NTDP (cost unconfirmed), Victus Academy and Bishop Kearney (search snippets only), American Hockey Academy (price not published), the OHA international rate (not reviewed), and every European programme (no verified figure exists in these records). Academic years for OHA and CIHA are unstated on the school pages and the calculator says so.

## Topics from the original request not covered yet

School and diploma recognition, per-country minor visas with dated IIHF steps, the U16-to-pro ladder with NCAA and CHL rules, and the monthly calendar. They need primary-source fact-checks with dates first. Existing coverage: `junior-pathway-compare` (school column, under-18 transfer rules by country, CHL/NCDC), `news/ncaa-allows-chl-players-to-keep-division-i-eligibility`, and the per-country junior fact-checks.
