# Analytics events: WhatsApp and application_sent (checked 19.11.2026)

## Why `whatsapp_click` showed 0

- The event was added on 16.11.2026 (commit 3e0961e).
- The live GA4 Data API, read through EHA CONTROL `ga4_report` on 19.11, has `whatsapp_click` = 3 (17.11: 2, 18.11: 1).
- On the same days, GA's own outbound `click` to `wa.me` was also 2 and 1, so the site-side event matches.
- The 0 came from the EHA CONTROL `ga4_events` history table. It stores only 8 event names (page_view, form_start, parent_hub_view, application_sent, parent_cta_click, calculator_start/done, form_submit) and leaves out `whatsapp_click`, `click`, `scroll` and the rest.
- The fix is in the EHA CONTROL collector, which is not in this repository. **Owner step:** add `whatsapp_click`, `calculator_result_click` and `cost_calc_done` to the collected events.
- Earlier WhatsApp clicks (Sep–Nov) are visible only as the enhanced-measurement `click` with `linkDomain = wa.me`.

## Found while checking: application reference in GA

- GA4 enhanced measurement recorded `link_url` of the success-page WhatsApp link, which contained `?text=…reference: EHA-…`.
- The success-page `page_location` contained `?ref=EHA-…`.
- A reference is a pseudonymous identifier that links to a CRM record. The values are not repeated here.

Fixed in code:

- The success link `href` is plain `https://wa.me/<number>`. The greeting with the reference is opened via `window.open` on click, so GA and Metrica `trackLinks` see no text.
- `site.js` reads `ref` and keeps it in `sessionStorage` for the tab. It then removes `ref` from the address bar before Metrica starts. `intake-form.js` reads the same `sessionStorage` key.
- The GA snippet sends `page_location` without `ref` and `token`.

**Owner steps in GA4 (not doable from code):**

1. Admin → Data deletion requests: delete the parameter values `link_url` and `page_location` containing `EHA-` for the period from the start of the form until the deploy date.
2. Optional: turn off "Outbound clicks" in enhanced measurement. `whatsapp_click` replaces it for WhatsApp.

## whatsapp_click now

- Sent only when `eha-cookie-consent` = `granted`.
- One event per click, with a 1 s guard against double handlers.
- Parameters: `entry_page`, `placement` (`float`, `inline` or `success`). No number and no message text.

## application_sent vs CRM (01.10–18.11.2026)

| Source | Count |
|---|---|
| CRM (`app_daily`, kind = player) | 33 |
| GA4 `application_sent` | 28 |

- **Fewer in GA:** visitors who did not accept analytics are not reported, and GA uses the property time zone while CRM uses UTC dates.
- **More in GA on 4 days:** for example 18.11 had 3 in CRM and 6 in GA. The deduplication was per tab (`sessionStorage`), so opening the success URL again in another tab or browser fired the event again.
- Now deduplicated per reference in `localStorage` too.
- The CRM is the source of truth for application counts. Use GA only for the funnel ratio.
