# Data duplication (item 17), 19.11.2026

## Done: Swiss National League transfer deadline

- **Rule:** Weisungen Spielbetrieb NL 2026/27, sec. 1.3.2, re-read on 19.11.2026.
  - Swiss players, dual citizens and "like a Swiss" players: 1 February 2027, 24:00.
  - Foreign players: 15 February 2027, 24:00, including IIHF approval; the releasing federation has 7 days.
- **Before:** the dates were hand-typed in about 10 places. These were the league profile (rule text, windows, summary, checks, FAQ, eligibility, checklist), the transfer calendar row, and the EN/RU page meta.
- **Now:** a single record in `src/deadlines.js` (`ch-nl-2026-27`). The consumers below render the date from it:
  - `src/league-profiles.js`, through the `CH(...)` helper;
  - `src/transfer-calendar.js`;
  - the page meta, through the `{{DEADLINE:ch-nl-2026-27:foreign}}` token, replaced in `renderBody`.
- **Check:** `test/deadlines.test.js` changes the record in a separate process. Every consumer must show the new date, and none may keep the old one.
- **Pages checked:** /leagues/switzerland-national-league, /ru/ligi/shvejcariya-national-league, /guides/transfer-calendar-2026-27 (and RU).
- **Kept separate on purpose:** the SIHF-wide domestic windows ("15 April – 15 September and 1 November – 31 December") and the IIHF transfer period (1 July – 15 February). These are different rules with a different scope.

## Checked, no duplication

- **Level Calculator league names:** taken from `window.EHA_LEAGUES` (`/assets/leagues.en.js`, `/assets/leagues.ru.js`), which `scripts/build-leagues.js` generates from `public/assets/leagues.src.js`.
- **Hub tables:** the hubs `/european-leagues`, `/ru/ligi-evropy`, `/junior-hockey-leagues` and `/ru/yuniorskie-ligi-evropy` render the same source between `LEAGUES:START/END`.

## Found, next candidates (not changed)

- **`/open-hockey-leagues-for-imports` (and RU):** a hand-written table of 11 leagues, giving import quota and status. It repeats rules that are also stored in the league profiles (e.g. EIHL).
  - Next step: render it from the profiles, the same way as the Swiss deadline.
- **Same date in two records:** the TAURON Hokej Liga deadline (15 February 2027, 23:59) and the DEL2 licence deadline (15 February 2027). Each lives both in `league-profiles.js` and in `transfer-calendar.js`.
  - Next step: move both to `src/deadlines.js`.
