# Task for Codex: B2B content track for `for-clubs.html`

## What this is

A self-contained work order. You (Codex) are executing this without any
prior conversation history — everything you need is either in this file or
discoverable by reading the repo. Do not ask the repo owner questions this
file already answers; do use `AskUserQuestion`-equivalent judgment only for
genuinely blocking gaps (see "Stop and ask" at the bottom).

## Context: what this site is

`eurohockeyagency.com` — a Node/Express static-content site for a hockey
player agency (European Hockey Agency / EHA). Bilingual: English at the
root (`/guides/<slug>`), Russian under `/ru/` at the same `/guides/<slug>`
path structure but with a transliterated Russian slug (e.g. EN
`/guides/hockey-in-serbia` ↔ RU `/guides/hokkej-v-serbii`, both served from
`public/en/guides/` and `public/ru/guides/` respectively) — check
`src/locales.js` for the full list of existing pairs. Pages are
plain HTML files under `public/en/` and `public/ru/` with server-side
token substitution (`{{BASE_URL}}`, `{{EN}}`, `{{RU}}`, `{{ALT_URL}}`,
`{{CONTACT_EMAIL}}`) done at request time — leave those tokens literal in
the HTML you write, do not resolve them.

Read these before writing anything:
- `BRAND.md` — the single source of truth for name, contact details,
  founding year, confirmed numbers (e.g. "100+ players placed since 2016").
  Never state a number or fact that isn't in this file or already published
  elsewhere on the site.
- `public/en/editorial-methodology.html` — the site's own public commitment
  to sourced, dated claims. New content must not violate it.
- `public/en/for-clubs.html` — the existing club-facing landing page (the
  request form, FAQ, and service description). This is the page the new
  content should feed traffic into and link back from.

## Goal

`for-clubs.html` is currently the *only* touchpoint for the sporting
director / club-staff audience. There's no supporting content that ranks
for club-side search intent or builds trust before a club fills out the
request form. Add a small "For clubs" content track: a few short guide
articles written from EHA's own operating point of view (how trials,
agent relationships and player evaluation actually work from the buy side),
not federation-sourced facts — this keeps sourcing risk low, unlike
country/visa content elsewhere on the site.

## Recommended topics (adjust if a better angle is obvious, but keep the scope this small)

1. **"What to ask a hockey agent before a trial"** (EN slug
   `what-to-ask-a-hockey-agent-before-a-trial`) — practical questions a
   sporting director should put to an agent pitching a player: eligibility
   status, video authenticity, availability, comparable placements. Written
   as EHA's own advice to clubs, not a claim about how all agents behave.
2. **"Running an efficient trial: a checklist for sporting directors"**
   (EN slug `running-an-efficient-trial-checklist`) — logistics and
   evaluation checklist for a club hosting an import trial (what to confirm
   before travel, what to evaluate on and off the ice, how to give a timely
   decision).
3. **"What game video actually tells a club"** (EN slug
   `what-game-video-tells-a-club`) — the club-side mirror of the existing
   player-facing guide `hockey-video-for-clubs` (`public/en/guides/hockey-video-for-clubs.html`)
   — read that file first so this doesn't duplicate it; angle this one at
   what a recruiter should look for when *watching* footage, not what a
   player should *submit*.

Ship all three, or ship just #1 if you want the smallest possible slice —
either is a reasonable stopping point. Do not expand beyond these three
without checking with the repo owner first.

## Content rules (hard constraints)

- No fabricated statistics, salary figures, legal claims, or named
  federation rules. If a claim needs a source you don't have, cut it or
  phrase it as EHA's own practice/opinion ("EHA typically asks...", "we
  recommend...") rather than a stated fact.
- Any number you use must come from `BRAND.md` verbatim or already exist
  elsewhere on the site — do not invent placement counts, response times,
  or success rates.
- Keep the existing legal-hedging pattern used throughout the site: sporting
  fit and legal/immigration eligibility are presented as separate concerns
  (see the `.legal-note` paragraphs in `for-clubs.html` for the house style).
- Write in the same register as `public/en/guides/how-a-hockey-agent-works.html`
  — direct, practical, no filler, short paragraphs, no marketing hype.

## Template and technical pattern to follow

Use `public/en/guides/how-a-hockey-agent-works.html` as the structural
template — it's the closest existing page (a "process"-category guide, not
a country guide, so it has no league pyramid/eligibility sections). Its
shape:

```
<section class="article-hero wrap"> ... <h1>, <p class="lead"> ... </section>
<section class="wrap"><figure class="article-figure"><img ...></figure></section>
<article class="article-body wrap">
  <section> ... numbered/topical content sections with <h2> ... </section>
  (repeat)
</article>
<section class="related wrap"> ... related-grid links ... </section>
<section class="cta"> ... final CTA ... </section>
```

Copy its `<head>` block structure (canonical, og:*, twitter:*, JSON-LD
`Article` + `BreadcrumbList`, optionally `FAQPage` if you add an FAQ) and
adapt title/description/schema per new page. Keep meta description
120–165 chars and title under 60 chars, matching the rest of the site.

For each of the 3 topics you ship, create **both** language versions:
- `public/en/guides/<en-slug>.html`
- `public/ru/guides/<ru-slug>.html` — pick a transliterated slug consistent
  with existing RU slugs in `src/locales.js` (e.g. kebab-case
  transliteration, no diacritics — look at 5–6 existing `ru:` entries in
  that file for the exact convention before inventing new ones).

## Required registration steps (do all of them — each is independently required)

1. **`src/locales.js`** — add `{ ru: "/guides/<ru-slug>", en: "/guides/<en-slug>" }`
   to the `PAGES` array for each new page pair. `test/locales.test.js`
   fails the build if a published page isn't registered here.
2. **`src/guide-index.js`** — add an entry to the `GUIDES` array for each
   new page: `{ en: "<en-slug>", ru: "<ru-slug>", cat: "clubs", title: { en: "...", ru: "..." } }`.
   This is a **separate registry from `PAGES`** — a page can pass every
   other test while still being missing from the `/guides` hub index if you
   skip this step (this has bitten this repo before). Also add a new
   category to the `CATEGORIES` array in the same file:
   `{ id: "clubs", label: { en: "For clubs", ru: "Клубам" } }` — the
   existing categories (`countries`, `process`, `documents`) are all
   player-facing, so club content needs its own bucket rather than being
   mislabeled under "Getting signed".
3. **Cross-link from `public/en/for-clubs.html` and `public/ru/for-clubs.html`.**
   The crawler test only catches broken links, not orphaned-but-registered
   pages — a page can be fully registered and still never get a real
   inbound link if you skip this. Add a new section (or extend the existing
   `.dual-cta` section) linking to the new guide(s), and add a `.related`
   block to each new guide page linking back to `for-clubs.html` and to the
   other 1–2 new guides.
4. **Cover art.** Add an entry per new EN page to the `ARTICLES` array in
   `scripts/generate-images.js` (mirror the format of existing "process"
   category entries — `{ slug, category, title, domain: "eurohockeyagency.com" }`
   for EN, no `domain` key for the RU counterpart), then run
   `node scripts/generate-images.js`. Ship the generated cover inline from
   the start: `<section class="wrap"><figure class="article-figure"><img
   src="/assets/covers/<slug>.webp" alt="..." width="1200" height="630"
   loading="lazy" decoding="async"></figure></section>` right after the
   `.article-hero` section (this is the standing convention for every guide
   on the site — check any recent guide page for the exact attributes).

## Verification (do not skip)

1. `npm test` — must stay at 0 failures. Note: this suite has a known,
   pre-existing intermittent flakiness unrelated to content changes (a
   handful of unrelated tests occasionally fail on rerun for environmental
   reasons). If a failure looks unrelated to your changes, rerun `npm test`
   2–3 times; if it passes clean on a rerun, treat the first failure as
   noise, not a regression. If the *same* test fails on your changed files
   every time, it's a real bug — fix it.
2. `npm run check` — syntax check across `server.js`, `src/*.js`,
   `public/site.js` (you touched `src/locales.js` and `src/guide-index.js`).
3. Manually verify (by reading the rendered HTML, not just trusting the
   registries) that each new page is reachable by a real click path from
   `/guides` and from `/for-clubs`.
4. Confirm the sitemap needs no manual edit — `buildSitemap()` walks the
   filesystem automatically.

## Git workflow — stop before pushing

Commit your work locally with a clear message. **Do not push to `main` or
trigger a deploy without the repo owner's explicit go-ahead** — this repo's
working convention is that every push is confirmed by the owner first, even
when the change is low-risk. Stage only the files you intentionally
changed (new HTML pages, `src/locales.js`, `src/guide-index.js`,
`scripts/generate-images.js`, and the generated files under
`public/assets/covers/`) — do not run a blanket `git add -A`.

## Stop and ask (genuinely blocking, not busywork)

- If you can't find a consistent RU slug transliteration pattern to follow.
- If `how-a-hockey-agent-works.html` has changed shape enough that the
  template description above no longer matches — describe the mismatch
  rather than guessing.
- If you're tempted to add a real number, statistic, or claim about a named
  league/federation that isn't already published elsewhere on the site —
  ask for the source rather than inventing or omitting silently.
