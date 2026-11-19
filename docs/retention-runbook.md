# Хранение заявок: защита необработанных, dry-run, резервная копия

Подготовлено 19.11.2026 (пакет A аудита). Выполнение на production — только с явного разрешения владельца.

## Что было и что меняется

- Расписание: `pg_cron` задача `cleanup-expired-applications-daily`, каждый день в 03:17 UTC, вызывает Edge Function `cleanup-applications` (миграция `20260718195655`).
- Было: удалялись заявки со статусом `new`, `rejected`, `archived` после `retention_until` (создание + 1 год), если нет плановой даты контакта сегодня или позже. Файлы удалялись через Storage API, затем строка. Клубные запросы — так же, без файлов.
- Стало (`supabase/functions/cleanup-applications/cleanup.mjs`): удаляются только `rejected` и `archived`. Статус `new` (никто не смотрел) больше не удаляется молча: после истечения срока запись и её файлы удерживаются и попадают в счётчик `heldUnprocessed` и в предупреждение в `/admin`. `contacted` и `qualified` по-прежнему не трогаются.
- Ближайшая дата риска при старой логике: первая заявка от 23.07.2026 → `retention_until` 23.07.2027, удаление в прогоне 24.07.2027 03:17 UTC.
- Политика конфиденциальности обещает удаление *неактивных* заявок через 12 месяцев. Удержание `new` после срока — до решения владельца по каждой заявке; бессрочное хранение необработанных заявок с текстом политики не согласовано. **Решение владельца:** обрабатывать очередь до истечения срока (рекомендуется) или изменить текст `/privacy` и `/ru/privacy`.

## Как владельцу работать с очередью в `/admin`

1. Войти в `/admin` (пароль `ADMIN_PASSWORD`).
2. Первая строка карточек: «unprocessed (new)» — сколько заявок не обработано (ссылка открывает очередь), «oldest unprocessed» — возраст самой старой в днях, «new > 7 days», «past retention, held until processed».
3. Очередь `?status=new` отсортирована от самой старой. В колонке «Created / age» — дата и возраст; у необработанных старше 7 дней пометка «waiting».
4. Открыть заявку по номеру (`EHA-…`), посмотреть данные и файлы.
5. Зафиксировать результат: в колонке «Status» выбрать `contacted` / `qualified` (активный клиент, не удаляется) или `rejected` / `archived` (удалится вместе с файлами после срока хранения); при необходимости внутренняя заметка и «Next contact».
6. Не ставить статусы «для галочки»: старым заявкам статус присваивается только по факту обработки.

## Dry-run (ничего не меняет)

```bash
curl -sS -X POST "https://<project-ref>.supabase.co/functions/v1/cleanup-applications" \
  -H "Content-Type: application/json" -H "x-cleanup-secret: $CLEANUP_SECRET" \
  -d '{"dryRun":true}'
```

Ответ: `applications.candidates` (будут удалены), `applications.files`, `applications.heldUnprocessed`, то же для `clubRequests`. Значение секрета не печатать и не сохранять в истории оболочки (`export` из менеджера паролей).

## Резервная копия перед деплоем функции

1. Таблицы: `supabase db dump --data-only -s public -t applications -t application_files -t application_notifications -t club_requests -t club_request_notifications > backup-$(date +%F).sql` — файл хранить зашифрованным вне репозитория.
2. Файлы: выгрузить bucket `application-files` (Supabase Dashboard → Storage или `supabase storage cp -r ss:///application-files ./backup-files --experimental`).
3. Проверка восстановления (на отдельном проекте или локальном `supabase start`): загрузить дамп, скопировать файлы, открыть одну синтетическую заявку в `/admin` (локальный сервер с env этого проекта) и скачать её PDF/файл. Критерий: строка, связанные `application_files` и объект в bucket совпадают по `storage_path`.

## Деплой (после разрешения)

1. `supabase functions deploy cleanup-applications --no-verify-jwt`
2. Dry-run (выше): `applications.heldUnprocessed` ≥ 0, `candidates` содержит только rejected/archived.
3. Наблюдать первый ночной прогон: ответ в `net._http_response` (`select status_code, content from net._http_response order by created desc limit 1;`).

## Проверка

- `node --test test/cleanup-retention.test.js`: граница 12 месяцев (ровно на сроке — не удаляется), все статусы, файлы, dry-run, повторный запуск, удаление после решения владельца.
- `node --test test/app.test.js`: очередь `new`, возраст, сортировка, удержание после срока.
