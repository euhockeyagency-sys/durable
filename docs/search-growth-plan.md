# Search growth plan: countries, leagues, languages (18 November 2026)

Status of each item is kept in `PROJECT_STATUS.md`; this file is the map and the plan.

## 1. Country page vs league page

- **Country guide** (`/guides/hockey-in-<country>`): compares the levels inside one market, explains the passport, visa and work route once for the country, and shows the rule tables of its leagues from `src/league-profiles.js` (`<!-- LEAGUE_RULES:<id> -->`).
- **League page** (`/leagues/<country>-<league>`): answers one concrete question first (limit, deadline, how to get in), then rules with season and source, windows, pay, steps and the embedded calculator.

The full country → league → page map with decisions is in `docs/league-pages-audit.md`.

## 2. Germany (done in this pass)

| Page | URL (EN / RU) | Main question | Status |
|---|---|---|---|
| Country guide | `/guides/hockey-in-germany` / `/ru/guides/hokkej-v-germanii` | How to play pro hockey in Germany: DEL2, Oberliga, import rules and visas | Updated: EN title/H1, short import answer, rule tables for DEL2 and Oberliga, outdated "no single import limit" line replaced |
| DEL2 | `/leagues/germany-del2` / `/ru/ligi/germaniya-del2` | How many imports can play, who counts as one | Rebuilt on the profile template; official rule from the DEL2 Spielordnung (September 2026) |
| Oberliga | `/leagues/germany-oberliga` / `/ru/ligi/germaniya-oberliga` | Can an import play, what does it pay | Rebuilt; import rule only from press (2022, 2024), labelled as such |

DEL2 and Oberliga keep separate pages: different organiser (ESBG vs DEB), different import rule, different pay level and visa question.

EHA cases: no confirmed EHA case in DEL2 or Oberliga. The one German case on record is a fourth-level move (already on the country guide), so the league pages do not show a case.

Missing for Germany: the DEB 2026/27 Oberliga regulation (import count, how EU citizens count, over-23 figure), the Oberliga registration deadline, any salary sample.

## 3. Next markets for the template

Order by data readiness (verified primary rules already read or easy to read):

1. France Ligue Magnus — same FFHG documents as Division 1.
2. Poland 1 Liga — regulation PDF in the PZHL list.
3. Italy Italian Hockey League, Hungary Erste Liga / Andersen Liga — rules already verified on the pages, need moving into profiles.
4. UK EIHL, Switzerland National League — factchecks exist; window dates missing.
5. Alps Hockey League, Sweden Hockeyettan, CEHL, Norway, Denmark — need federation documents first.

Search Console was not used in this pass; check impressions for these pages before choosing between items of the same readiness.

## 4. Languages

Architecture today:
- EN at the root and RU under `/ru`, paired through `PAGES` in `src/locales.js` (canonical, hreflang, language switch, sitemap).
- One standalone page each for DE (`/de/eishockey-in-deutschland`), SV (`/sv/ishockey-i-sverige`), CS (`/cs/hokej-v-cesku`), FI (`/fi/jaakiekko-suomessa`), with their own rules in `test/bonus-locales.test.js`. No Slovak page.

Recommendation for the first pages per language:

| Language | First page | Why | Can it be kept up to date? |
|---|---|---|---|
| German | Update the existing `/de/eishockey-in-deutschland` with the DEL2 rule and the visa threshold from this pass | German players and parents search in German for DEL2/Oberliga questions; facts are now verified | Yes, one page fed by the same facts |
| Swedish | Keep `/sv/ishockey-i-sverige`; add Hockeyettan facts once the SIHF import rules are read | Swedish import rules not verified yet | Only after the rules are read |
| Czech | Keep `/cs/hokej-v-cesku` | Czech market page exists | Yes |
| Slovak | Do not reuse the Czech page. A separate Slovak page only after the Tipsport liga 2026/27 import rule is confirmed | Different federation (SZĽH), different rules, Slovak language | Not yet — no verified rule |

Audience framing to add when pages are rewritten:
- North American players: map their history to European levels (ECHL / strong NCAA or U Sports → DEL2 or comparable second divisions; junior A → third levels or junior routes), always with the caveat that role, age and video decide, not the league name alone.
- Parents of juniors: lead with ice time, school, housing and total cost; link the cost calculator and the junior parent hub.

## 5. Tools

- Hockey CV: existing template on `/guides/hockey-resume-for-european-clubs` and `/ru/guides/hokkejnoe-rezyume`; now copy and download (.txt). The RU page's template is in English on purpose (clubs read English).
- Transfer-window checklist: added as section 8 of `/guides/hockey-transfer-windows` and `/ru/guides/transfernye-okna-v-hokkee`; copy and download, then links to the calculator, Submit profile and WhatsApp.
- Level calculator: unchanged in this pass; the Germany guide links to it with `?country=germany`, and the result names DEL2 and Oberliga when they fit.

## 6. Outreach

Drafts (analysis, short community version, outlet list) are kept in the project docs (`claude/outreach-league-rules-2026-11.md`) for approval. Nothing has been sent or posted. Reddit could not be opened from the work environment, so r/hockeyplayers rules must be read manually before any post.
