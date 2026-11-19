# Mobile LCP and fonts (19.11.2026)

## Measurement conditions

- Lighthouse 13.6, mobile form factor, `--throttling-method=devtools` (real throttling, slow 4G), headless Chrome.
- Local server (`createApp`, same code). The "before" checkout is at 62858bd and the "after" one is the branch.
- Production could not be measured from the session:
  - the container proxy returns 403 for the site;
  - the PageSpeed Insights API returned 429 (quota).
- No CrUX field data is available for the site (audit note); that has not changed.
- These are lab figures. They are comparable before vs after, not with the 4.6 s production lab figure from the audit.

## Cause

1. The hero text (`.kicker`, `h1 span`, `.lead`, `.actions`, `.note`) started at `opacity:0`. The second `hero-in` definition also started with `clip-path: inset(0 … 100% …)`.
2. The text appeared only through an animation with delays of 0.1–0.84 s and a duration of 0.75–1.1 s.
3. Chrome does not count invisible text as an LCP candidate. LCP therefore came either:
   - late, when the lead paragraph faded in (local "before" run); or
   - from a small visible element, the "EHA" logo square in the header (production audit trace).

   In both cases the "element render delay" was the wait for the hero to become visible.
4. The only render-blocking resource is `styles.css` (about 20 KB gzip), which bounds FCP.
5. Third-party JS (gtag async; Metrica only after consent) is not render-blocking.

## Fix

- The hero animation now moves the text (`transform`) and no longer hides it (`opacity` and `clip-path` removed). The motion stays, and `prefers-reduced-motion` already turns it off.
- Consent and analytics are unchanged.
- Rejected experiment: lowering the mobile hero-image preload priority. The gain (about 0.1 s) was within run-to-run variation and the background would appear later, so it was reverted.

## Results (local, devtools throttling, mobile)

| Run | FCP | LCP | LCP element |
|---|---|---|---|
| before #1 | 1865 | 3031 | hero lead paragraph |
| before #2 | 1885 | 3033 | hero lead paragraph |
| before #3 | 1785 | 2916 | hero lead paragraph |
| before #4 | 2000 | 3225 | hero lead paragraph |
| before #5 | 1835 | 3003 | hero lead paragraph |
| after #1 | 1901 | 1901 | h1 span |
| after #2 | 1866 | 1866 | h1 span |
| after #3 | 1969 | 1969 | hero lead paragraph |

Median LCP went from about 3.03 s to about 1.90 s. LCP now equals FCP, so any further gain has to come from the render-blocking CSS (critical CSS), which is a separate decision.

## Fonts (item 14)

Measured on the live site in the built-in browser, EN home, 19.11, before the change:

- 5 font requests: `manrope-400-latin`, `manrope-700-latin`, `manrope-800-latin`, `oswald-700-latin`, `oswald-600-latin`.
- These are 3 byte-identical Manrope files and 2 identical Oswald files: 3 × 24,576 + 2 × 21,412 = **116,552 bytes**.

After the change:

- 2 requests (`manrope-latin`, `oswald-latin`), 24,576 + 21,412 = **45,988 bytes**, for the same subset.
- RU pages behave the same with the cyrillic subset: 3 × 14,544 + 2 × 11,708 = 67,048 → 26,252 bytes.
- The "after" figures are computed from the files and the new CSS. They need confirming in the browser after publication.
