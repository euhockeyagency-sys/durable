# Rolling out the audit fixes (branch `fix/audit-2026-11-19`)

Nothing has been published from this branch. Each step below needs the owner's explicit permission. Order matters: steps 1–2 protect data before anything else changes.

| # | Operation | Procedure | Done when |
|---|---|---|---|
| 1 | Backup | `docs/retention-runbook.md` → "Backup": DB dump of `applications`, `application_files` and `club_requests`, plus a copy of the storage bucket | Dump and bucket copy exist; a test restore of one application with its files succeeds in a scratch project |
| 2 | Edge Function `cleanup-applications` | `supabase functions deploy cleanup-applications`. Then call it with `{"dryRun":true}` | Dry-run shows `heldUnprocessed` > 0 and `deleted` = 0 for `new`; the cron job `cleanup-expired-applications-daily` still points at the function |
| 3 | Site deploy | Merge to `main` (the push triggers the GitHub Actions deploy). `deploy-production.sh` regenerates `lastmod.json` | `X-EHA-Source-SHA256` of `/contact` matches the branch file; `/sitemap.xml` shows varied dates |
| 4 | Production checks | `curl -I` on `/index.html`, `/ru/index.html`, `/ru`, `/404`, `/leagues`. Then `GET /api/applications/<synthetic-ref>/pdf?token=x`. Open `/contact` and `/ru/contact` in a browser | Expected codes are 301, 301, 301, 404, 404 and 410. The PDF GET does not echo the token. The forms work |
| 5 | Webvisor | `docs/webvisor-check.md`: open the Metrica recordings for a synthetic session on `/contact` after accepting cookies | Form fields show as masked |
| 6 | Owner PDF tokens | `docs/owner-token-runbook.md`: count `token=` requests in the Caddy and journald logs (counts only). Null `owner_token_hash` for the affected references | Count recorded; owners of the affected references use the new download path |
| 7 | CRM history attribution | `docs/attribution-runbook.md`: dry-run first. Review `sourcePageCertainty` and `unresolved`; rows in `by_language` need a manual look. Apply in one transaction after a `source` backup | A second dry-run shows `changed` = 0 |
| 8 | GA4 | `docs/analytics-events.md`: data deletion request for `link_url` and `page_location` values containing `EHA-`. In EHA CONTROL, add `whatsapp_click` to the collected events | DebugView: no `ref` in `page_location`; `whatsapp_click` appears in `ga4_events` |
| 9 | Lab and accessibility on production | PageSpeed Insights mobile, 3 runs each on `/` and `/ru/`. Lighthouse accessibility on `/`, `/contact`, a guide page and a league page | LCP element is hero text, not the logo; accessibility score is 100 |

After each step, mark the matching work-log entry `published_verified` only with the evidence from the "Done when" column.

## Rollback

- Every package is a separate commit; `git revert <sha>` on `main` redeploys without it.
- The Edge Function is redeployed from the previous commit.
- The CRM `source` backup restores attribution in one `update … from backup`.
