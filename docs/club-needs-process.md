# Club requests: add, check, close

Pages: `/club-needs` (EN, `public/en/club-needs.html`) and `/ru/zaprosy-klubov` (RU, `public/ru/zaprosy-klubov.html`).
Data: `src/club-needs-data.js`. Rendering and filtering: `src/club-needs.js`, inserted by `renderBody` in `src/app.js` at the `<!-- CLUB_NEEDS -->` marker on every request.

## Rules

- Publish only requests that a club confirmed to EHA. No demo or example vacancies, and no old requests from past conversations unless the club reconfirms them.
- Public fields show only what the club confirmed. Unknown values stay `null` and the page shows "not confirmed by the club" / «клуб не уточнил».
- Never publish club contact details. Publish the club name only if the club allowed it (there is no club-name field; do not put it into `conditions`).
- `lastChecked` and `validUntil` are internal. They are never rendered and there is no public date on the page.
- A request is shown only when `status: "open"`, `publish: true` and `validUntil` is today or later. An expired request disappears from the page automatically on the next page view, without a deploy.
- No `JobPosting` markup on the list page. The page has `CollectionPage` and `BreadcrumbList` only.
- Changing the data file does not change `public/assets/lastmod.json` (lastmod comes from the HTML files' Git history). Do not edit lastmod by hand.

## Add a request

1. Get written confirmation from the club: position, league, season, and only those details the club is ready to state (age range, citizenship or import status, conditions), plus agreement that the request can be public.
2. Add a record to `src/club-needs-data.js` with a new `id` (for example `2026-11-se-hockeyettan-d`), `status: "open"`, `publish: true`, `lastChecked` = date of the club's confirmation, `validUntil` = the date agreed with the club (default suggestion: no more than 30 days ahead), and `source` = who confirmed it and how.
3. Run `node scripts/check-club-needs.js` and `node --test test/club-needs.test.js`.
4. Commit and publish only with the owner's approval (push to `main` deploys).

## Weekly check (manual process, run by EHA)

Once a week (for example on Monday):

1. Run `node scripts/check-club-needs.js`. It lists shown requests, requests not reconfirmed for more than 7 days, requests whose validity ends within 7 days, expired open requests and invalid records.
2. Ask the club about every request in the "reconfirm" and "ends within 7 days" groups. If the club reconfirms, update `lastChecked` and, if agreed, `validUntil`. If not, close the request.
3. Set `status: "closed"` for expired requests so the data file reflects reality.

There is no automatic reminder or club synchronisation: the check above is a manual step.

## Close a request

Set `status: "closed"` (keep the record for history, or delete it). Closed requests are never shown. Use closing when the place is filled, the club withdraws the request, the validity has ended, or the club did not reconfirm.

## Players who respond

Each card links to the contact form with `intent=club_need` and a note that names the request id, league, position and season, and to WhatsApp with a prefilled message naming the request. The phone number is not shown as text.

## Telegram-подписка игроков (добавлено 21.11.2026, выключено)

Код: `src/club-needs-subscriptions.js`, миграция `supabase/migrations/20261121120000_club_need_subscriptions.sql`, рассылка `scripts/notify-club-needs.js`, тесты `test/club-needs-subscriptions.test.js`.

Форма на `/zaprosy-klubov` и `/club-needs` появляется только когда выполнены ВСЕ условия:

1. Миграция `20261121120000_club_need_subscriptions.sql` применена к базе сайта (таблицы `club_need_subscriptions`, `club_need_deliveries`, RLS, доступ только service_role).
2. Создан ОТДЕЛЬНЫЙ бот для игроков в @BotFather (не бот уведомлений агента). В окружении сервера: `TELEGRAM_SUBSCRIBER_BOT_TOKEN`, `TELEGRAM_SUBSCRIBER_BOT_USERNAME`, `TELEGRAM_SUBSCRIBER_WEBHOOK_SECRET` (32+ символа `A-Za-z0-9_-`).
3. Вебхук: `setWebhook` с `url=https://eurohockeyagency.com/api/telegram/club-needs-webhook`, `secret_token=<TELEGRAM_SUBSCRIBER_WEBHOOK_SECRET>`, `allowed_updates=["message"]`.
4. `CLUB_NEEDS_SUBSCRIPTIONS=on`, перезапуск сервиса.
5. Проверка на тестовом аккаунте владельца: подписка → Start → подтверждение в боте; тестовый запрос в `club-needs-data.js` с `publish:false` не уходит; `node --env-file=.env scripts/notify-club-needs.js --dry-run` показывает совпадения; `/stop` и ссылка отписки прекращают доставку.

После добавления нового подтверждённого запроса: `node --env-file=.env scripts/notify-club-needs.js`. Повторный запуск не дублирует сообщения (уникальность subscription_id + need_id). Поле `birthYears: { from, to }` в запросе включает фильтр по году рождения; без него рассылка идёт всем подписчикам позиции.

Хранится: позиция, год рождения, ссылка Elite Prospects (необязательно), язык, время и версия согласия, chat id, статус. Ссылка-токен хранится только как SHA-256 и действует 30 минут; ссылка отписки подписана HMAC и не хранится. Удаление неподтверждённых (через сутки) и отписавшихся (через 30 дней) — следующий шаг: функция `cleanup-applications` эту таблицу пока не чистит.
