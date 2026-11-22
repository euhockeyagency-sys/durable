# Technical SEO audit, long-tail map and link plan — 23 November 2026

Data sources: local Express render of every sitemap URL (EN, RU, DE, CS, FI, SV); EHA CONTROL (Google Search Console API, web search, 23.08–20.11.2026, page and query dimensions). The GSC Pages report and URL Inspection are not available through EHA CONTROL; they were read later the same day in the owner's GSC account in Chrome (section 2a). Before that, the proxy was sitemap URLs with no impressions at all in 90 days.

## 1. hreflang and EN/RU routing

- Pilot `/for-players` ↔ `/ru/players`: HTTP 200, self-canonical, absolute alternates `en`, `ru`, `x-default` (= EN), reciprocal, language switcher points to the counterpart, `<html lang>` correct, both in the sitemap.
- All 173 pairs of `src/locales.js` PAGES: 0 problems (200, self-canonical, no noindex, alternates and switcher consistent, in sitemap). All 346 EN/RU sitemap URLs: 200, self-canonical, indexable.
- **Fixed:** the four bonus pages (`/de/eishockey-in-deutschland`, `/cs/hokej-v-cesku`, `/fi/jaakiekko-suomessa`, `/sv/ishockey-i-sverige`) and their EN/RU country guides declare `de/cs/fi/sv` alternates in the HTML head, but the sitemaps did not (EN/RU entries listed only ru/en/x-default; the bonus sitemaps had no alternates at all). The sitemap generator now reads one map (`EXTRA_LOCALE_COUNTERPART` in `src/locales.js`) so the sitemap and the page heads agree. Guarded by `test/hreflang-consistency.test.js` (every sitemap URL: 200, self-canonical, sitemap alternates = head alternates, reciprocity across the whole cluster).

## 2. Indexability of deep pages

- Crawl from `/` and `/ru/`: all 350 sitemap URLs reachable, maximum click depth 3, no orphans; no robots/noindex/X-Robots-Tag barriers; no non-200 or non-canonical sitemap entries. Only extra crawled URLs are the four resume-template downloads (correctly not in the sitemap).
- 57 sitemap URLs had **no impressions at all** (23.08–20.11). Most are new (published after mid-October) or the hockey-agent-in-country series. Pages with a fixable gap in the natural path from their topic section (≤10):

| URL (EN / RU) | Gap found | Link added |
| --- | --- | --- |
| /leagues/usa-ushl, /ru/ligi/ssha-ushl | 1 content link (only from the US junior guide) | US country guide list, age-pathway table, junior leagues hub |
| /leagues/usa-nahl, /ru/ligi/ssha-nahl | not linked from the US country guide or the junior hub | same three places |
| /leagues/slovakia-junior-hockey, /ru/ligi/slovakiya-yuniorskij-hokkej | missing from the junior leagues hub | junior leagues hub |
| /leagues/austria-junior-hockey, /ru/ligi/avstriya-yuniorskij-hokkej | missing from the junior leagues hub | junior leagues hub |
| /guides/after-mhl-and-nmhl-…, /ru/guides/posle-mhl-i-nmhl-… | linked only from the guides hub, although it is the core audience | For players / Игрокам (Juniors card), Belarus guide, After-U20 guide |
| /guides/hockey-agent-in-* (11 EN + 11 RU) | each linked only from its own country guide | "Hockey agent by country" block on /services and /ru/services |
| /guides/icehl-and-alps-hockey-league-salaries (+RU) | "alpshl salary" impressions split across 4 URLs | AlpsHL row of the salaries hub links to it; title now uses "AlpsHL" |

Indexing must be confirmed in GSC after the next crawl (impressions in EHA CONTROL, or URL Inspection by the owner).

### 2a. GSC Pages report (read 23.11.2026; Google's data as of 16.11.2026, i.e. before the 23.11 deploy)

Indexed 284, not indexed 210.

| Reason | Count | What it is | Action |
| --- | --- | --- | --- |
| Alternate page with proper canonical | 110 | duplicates pointing to the canonical (query/legacy variants) | none — expected |
| Page with redirect | 40 | legacy slugs with 301 | none — expected |
| Discovered – currently not indexed | 30 | listed below | links added in PR #30; indexing requested for the priority ones |
| Crawled – currently not indexed | 16 | old `/blog/*` slugs, `feed.xml` (EN/RU/fi/sv), `/contact-us`, `/contact?league=…` | none for feeds/forms; all old blog slugs 301 — those that fell back to the `/guides` hub now point to the guide on the same subject (PR #33; the seasonal-preparation post has no match and stays on the hub) |
| Not found (404) | 8 | validation already started | wait for validation |
| Soft 404 | 3 | `/blog/hockey-cv-template-european-clubs`, `/blog/north-american-vs-european-hockey-key-differences`, `/hockey-agent-in-europe` | all already 301; the last two pointed to the home page / a loosely related guide → now `/services` and `/guides/junior-hockey-europe-vs-north-america` (PR #33) |
| Blocked by robots.txt | 3 | `/cdn-cgi/l/email-protection`, an old `/blog/…` slug, one query URL | none — expected |

"Discovered – not indexed" (30), grouped:
- 22 hockey-agent-in-country guides (11 EN + 11 RU) — the main group; until PR #30 each had one internal link.
- USHL, Slovakia junior, Austria junior league pages (EN + RU = 6).
- `/guides/after-u20-senior-hockey-in-europe`.
- 5 legacy `/blog/*` slugs — all 301; those that fell back to the `/guides` hub now go to the matching guide or `/cases` (PR #33).

URL Inspection showed for these pages "Referring page: not found", and for several RU pages "URL unknown to Google, no referring sitemap" — Google had not yet seen any internal link to them. That matches the PR #30 fix (links from /services, the junior hub and country guides).

Indexing requested 23.11.2026 (11 URLs, then the daily quota was reached):
/leagues/usa-ushl, /ru/ligi/ssha-ushl, /leagues/slovakia-junior-hockey, /leagues/austria-junior-hockey, /guides/after-mhl-and-nmhl-to-europe-options-for-russian-and-belarusian-players, /services (recrawl), /ru/services (recrawl), /guides/icehl-and-alps-hockey-league-salaries (recrawl; already indexed), /guides/hockey-agent-in-finland, /guides/hockey-agent-in-czechia, /ru/guides/hokkejnyj-agent-v-finlyandii.

Next batch (after 24.11): /ru/ligi/slovakiya-yuniorskij-hokkej, /ru/ligi/avstriya-yuniorskij-hokkej, /ru/guides/hokkejnyj-agent-v-chexii, /guides/hockey-agent-in-austria, /guides/hockey-agent-in-switzerland, /guides/after-u20-senior-hockey-in-europe. The RU after-MHL guide is already indexed.

## 3. Schema.org and authors

Inventory (all sitemap URLs): ProfessionalService 2, WebSite 2, Article 304, BlogPosting 4, NewsArticle 2, FAQPage 304, BreadcrumbList 348, CollectionPage 10, ProfilePage 2, Service 6, HowTo 4, SportsTeam 4, Dataset 2, ItemList 2, WebPage 6. All JSON-LD parses.

- Agency: one entity `https://eurohockeyagency.com/#organization` (ProfessionalService, a subtype of Organization) referenced as `publisher` by every Article and by WebSite; no duplicate Organization. `sameAs`: Instagram, TikTok, Telegram (confirmed in BRAND.md). Person `…/agent#person`: Instagram + LinkedIn (owner-supplied, merged from PR #26).
- Articles: headline, author (Person, same @id), publisher, datePublished/dateModified, mainEntityOfPage = canonical, inLanguage — complete. **Fixed:** `image` was missing on all 306 Article/BlogPosting/NewsArticle; the renderer now adds the page's own og:image when an Article has none. Fact-check dates stay in the visible "checked …" notes, separate from the editorial dates.
- Breadcrumbs: BreadcrumbList on 348 pages; on the 40 top-level pages (Home › Page) there is no visible crumb trail, which matches the header navigation. **Fixed:** 20 pages used `<div class="breadcrumbs">`; all crumb trails are now `<nav aria-label="Breadcrumb|Навигационная цепочка">`.
- FAQPage: every question and answer in markup is visible on the page (checked by text match). Validity: valid Schema.org. Google rich result: since August 2023 FAQ rich results are shown only for well-known government and health sites, so EHA's FAQPage is valid but **not eligible** for the FAQ rich result; HowTo rich results were retired in September 2023. Article and Breadcrumb remain eligible.
- Authors: all 306 articles are authored by Viachaslau Marshchonak (owner confirmed on 20.11: "2 пункт я писал"); author and reviewer are the same person, so no separate reviewer is shown. **Fixed:** 227 pages had a text-only author line; they now use the shared byline component (photo, name, role, link to /agent, link to the editorial methodology). The byline role no longer repeats the unqualified "100+ players placed" claim. Guides with unconfirmed authorship: none. Elite Prospects and GRAET profiles of the agent: still not supplied.

## 4. Long-tail map (query → intent → URL → gap → change)

GSC 90 days (gsc_rows; anonymised queries excluded).

| Cluster / query | Data | Intent | Current URL | Gap | Change |
| --- | --- | --- | --- | --- | --- |
| alpshl salary / alps hockey league salary | 258 impr., 1 click, pos. 7–9, split across 4 URLs | pay in AlpsHL | /guides/icehl-and-alps-hockey-league-salaries (target), /leagues/alps-hockey-league, salaries hub | cannibalisation; target title lacked "AlpsHL" | **Pilot:** title "ICEHL and AlpsHL Salaries 2026/27: What Players Earn" (EN/RU), hub row links to it |
| AlpsHL import rules | no query data → editorial hypothesis | import status | /leagues/alps-hockey-league (title already "AlpsHL Import Guide 2026/27") | no league-wide import rule found in an official source | keep; add a profile only after the AlpsHL/federation document is found |
| how to play hockey in Germany / Austria / Czechia | no EN query data → hypothesis (RU demand is "чемпионат X по хоккею") | relocation route | /guides/hockey-in-germany (title "How to Play Pro Hockey in Germany…"), hockey-in-austria, hockey-in-czechia | Austria/Czechia titles do not lead with "how to play" | next: test "How to Play Hockey in Austria/Czechia" titles |
| DEL2 vs Allsvenskan | no data → hypothesis | level comparison, senior import | /guides/germany-del2-vs-czechia-maxa-liga, /guides/sweden-hockeyallsvenskan-vs-finland-mestis | no direct pair | only if demand appears; answer for a 21–25 import forward, not a generic "which is better" |
| NAHL vs European juniors | ushl vs nahl 5, ncdc vs nahl 3 (pos. 17–42) | US Tier II vs Europe at 18–20 | /guides/junior-hockey-usa, /guides/junior-hockey-europe-vs-north-america | weak rank on "vs" queries | add a "USHL vs NAHL" answer-first block to /guides/junior-hockey-usa |
| MHL vs USHL | no data → hypothesis | RU/BY 17–20 choosing a route | /guides/after-mhl-and-nmhl-…, /leagues/usa-ushl | not linked together | linked now from For players and Belarus guide; comparison paragraph later |
| IIHF transfer card fee / regulations | 84 impr., pos. 4–7 | cost and process of ITC | /guides/iihf-international-transfer (+RU) | improved 21.11 | wait for GSC |
| hockey visa Europe | 40 impr., pos. ~5 | right to work per country | /guides/work-visa-for-hockey-player, country guides | country rules only in PL/SK/CZ/FI/DE/AT/SE | add per-country summary table with government sources |
| level calculator | 3 impr. | league fit | /level-calculator (+RU) | methodology and next step present | none |
| season cost / budget | no data | junior season budget | /junior-season-cost-calculator (+RU) | no explicit next step | **Added** "Next step" with EHA budget check CTA (EN/RU) |

Guide title audit: country-guide titles that named no league were made specific (EN: Norway, Denmark, Slovakia, France, Switzerland, UK; RU: Norway, Denmark, Slovakia, France, Switzerland). Seasons were added only where the page holds verified season data; URLs unchanged.

Priority list for the remaining topics: (1) USHL vs NAHL block; (2) per-country right-to-work table on the work-visa guide; (3) "How to play hockey in Austria/Czechia" title test; (4) AlpsHL import profile once a primary source is found; (5) DEL2 vs HockeyAllsvenskan only with demand.

## 5. External links — plan and drafts (owner sends; nothing was sent)

Plan:
1. Clubs/players with a published, confirmed EHA transfer: ask for a credit link to the home page or the matching case. Start with Dells Ducks (club post announcing Domeniks Vinkalns, already credits EHA by name) → target `https://eurohockeyagency.com/cases`.
2. Expert answers on r/hockeyplayers, r/hockey and HFBoards threads asking how to play in Europe / import rules / visas → one relevant guide link, disclosure "I run EHA". Target `/guides/european-hockey-import-rules-2026-27` or `/guides/find-a-hockey-club-in-europe`.
3. Data citations: the import-limit table and the CHL/USHL/NAHL/NCAA age table are linkable references for hockey bloggers and parent forums.

### Draft 1 — email to a club (Dells Ducks)

Subject: Domeniks Vinkalns — EHA credit link

Hi Dells Ducks team,

Thank you for announcing Domeniks Vinkalns' signing and for mentioning European Hockey Agency in the post. We publish the move on our cases page with a link to your announcement.

Would you be willing to add a link to our site next to the EHA mention — either our home page (https://eurohockeyagency.com/) or the cases page (https://eurohockeyagency.com/cases)? If you prefer a short line for your website news section, we are happy to supply one.

Thank you, and good luck this season.

Viachaslau Marshchonak
European Hockey Agency · euhockeyagency@gmail.com

### Draft 2 — forum answer (question type: "Can an EU passport get me into a European league as a non-import?")

Short answer: not always — each league counts something different.

- DEL2 (Germany) counts citizenship: anyone without German citizenship is a foreign player, EU passport or not; at most 4 per game in 2026/27.
- France counts training status (JFL), not the passport.
- Poland counts Polish citizenship or a Karta Polaka.
- The EIHL (UK) counts homegrown status; it allows up to 15 non-homegrown players per game (league release reported by the press).

And the import rule is separate from the right to work: an EU citizen can work anywhere in the EU, but a Canadian or American still needs the national work route (for Poland, for example, the short athlete exemption covers only 30 days a year).

I put the 2026/27 match-roster rules for 12 leagues, with links to each regulation, in one table: https://eurohockeyagency.com/guides/european-hockey-import-rules-2026-27 — disclosure: I run European Hockey Agency, the site that published it.

(Check the community rules on self-promotion before posting; on Reddit post from the owner's account and keep the disclosure line.)
