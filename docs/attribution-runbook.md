# Attribution: intent, source_page, country, league

Single source of truth: `src/attribution.js`. The site's links use canonical values. The server also accepts older spellings, so cached pages and old links keep working.

## Fields in `applications.source` (jsonb, no migration needed)

| Field | Value | Example |
|---|---|---|
| `intent` | canonical value from `INTENTS` | `league_assessment` |
| `intent_input` | original value, set only when an alias was resolved | `league-assessment` |
| `source_page` | path of the page with the CTA; `/ru` is kept for Russian pages | `/ru/guides/hokkej-v-rumynii` |
| `source_page_input`, `source_page_resolution` | what was sent and how it was resolved (`exact`, `locale`, `slug`, `unresolved`) | `/guides/hokkej-v-rumynii`, `exact` |
| `landing_page` | first page of the session; recorded only after analytics consent, separate from `source_page` | `/ru/` |
| `country` | ISO 3166-1 alpha-2 | `SE` |
| `league` | slug of the league page (`/leagues/<id>`) | `sweden-j20` |
| `country_input`, `league_input` | unknown value kept apart, never lost | `Narnia` |
| `goal` | `pro` \| `development` \| `study` (level calculator) | `study` |
| `from_calculator` | `true` when the application came from the calculator CTA | `true` |

Values that are not leagues (`offer-review`, comparison pages like `DEL2-vs-Maxa-liga`, `USA-junior`) are not stored in `league`. In the links they became `intent=offer_review`, `intent=league_comparison` and `country=US`.

## Service intents kept apart

- `free_assessment`: free first review. Aliases: `assessment`, `free-assessment`, `player_assessment`, `player_profile`, `find_club`.
- `player_analysis`: paid full analysis at `/player-assessment`. Alias: `player-analysis`.
- `league_assessment`, `country_assessment`, `junior_route` and the other topic intents: see `INTENTS`.

## Links on the site

```
node scripts/normalize-cta-links.js --check   # must print "would change: 0 links"
node scripts/normalize-cta-links.js           # rewrite after adding new CTAs
```

`test/attribution.test.js` fails if any `/contact` link carries a non-canonical value, or a `source_page` other than the page itself.

## CRM history: dry run (read-only)

The script reads only `id` and `source`. Its output has no names, contacts or messages.

```
SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/attribution-history-dry-run.js --out /tmp/attribution-plan.json
```

The summary shows the number of rows, the changes per field (including how many RU pages get the `/ru` prefix, e.g. `/guides/hokkej-v-rumynii` → `/ru/guides/hokkej-v-rumynii`), and the list of unresolved `source_page` values.

Not run against production from this session: the Supabase connector has no access to the production project.

## Applying to history (only with explicit owner approval)

1. Make a backup: `create table applications_source_backup_YYYYMMDD as select id, source from applications;`
2. Review `/tmp/attribution-plan.json`: the unresolved rows and the RU prefix count.
3. Apply per row with `update applications set source = source || '<patch json>'::jsonb where id = '<id>';`. Generate the statements from `items[].patch` and run them in one transaction.
4. Check with the dry run again: `changed` must be 0.
5. Roll back with `update applications a set source = b.source from applications_source_backup_YYYYMMDD b where a.id = b.id;`
