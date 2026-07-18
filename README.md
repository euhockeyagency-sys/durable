# European Hockey Agency

Статический сайт с серверным приёмом заявок игроков. Заявки сохраняются в Supabase, документы — в приватном Storage, уведомления отправляются в Telegram и через Resend.

## Локальный запуск

Требуется Node.js 20+.

```bash
npm install
cp .env.example .env
# заполните .env реальными значениями
npm run dev
```

В production запускайте `npm start` и задавайте переменные средствами хостинга. Без обязательных секретов сайт запускается, но `POST /api/applications` возвращает `503`, а `/api/health` показывает `applicationsConfigured: false`. Секрет Supabase, Turnstile, Telegram и Resend никогда не должен попадать в `public/` или браузерный JavaScript.

## Supabase

1. Создайте hosted-проект в регионе ЕС и установите/обновите Supabase CLI.
2. Свяжите проект и примените миграции:

```bash
supabase login
supabase link --project-ref PROJECT_REF
supabase db push
```

Миграции создают таблицы с RLS, отзывают права `anon`/`authenticated` и создают приватный bucket `application-files`. Backend использует новый серверный ключ `sb_secret_...`; публичный ключ приложению не требуется.

3. Разверните функцию очистки и задайте её секреты:

```bash
supabase secrets set CLEANUP_SECRET=replace_with_long_random_value
supabase functions deploy cleanup-applications --no-verify-jwt
```

Hosted Edge Functions получают `SUPABASE_SECRET_KEYS` автоматически; вручную задавать секрет с зарезервированным префиксом `SUPABASE_` не нужно.

4. В SQL Editor добавьте значения в Vault. `cleanup_secret` должен совпадать с `CLEANUP_SECRET` функции:

```sql
select vault.create_secret('https://PROJECT_REF.supabase.co', 'project_url');
select vault.create_secret('replace_with_long_random_value', 'cleanup_secret');
```

Cron ежедневно вызывает функцию. Она удаляет через Storage API файлы и затем заявки старше 12 месяцев со статусами `new`, `rejected` или `archived`. Статусы `contacted` и `qualified` считаются активными.

После применения миграций запустите проверки безопасности и производительности:

```bash
supabase db advisors
supabase migration list
```

## Внешние сервисы

- **Cloudflare Turnstile:** создайте отдельные widgets для production и staging, ограничьте production hostname, перенесите site key и secret в окружение. Сервер проверяет hostname (если задан), action `profile_application` и одноразовый токен.
- **Telegram:** создайте бота, добавьте его в целевой чат и задайте `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`.
- **Resend:** подтвердите домен отправителя, создайте API key и заполните `RESEND_FROM` и `NOTIFICATION_EMAIL`.

## Проверки и публикация

```bash
npm run check
npm test
npm audit
```

На production обязателен HTTPS. Установите `SITE_URL` фиксированным публичным адресом и `TRUST_PROXY=1`, только если Node работает за одним доверенным reverse proxy. Перед публикацией замените примеры юридического email и проверьте текст `/privacy` с ответственным за защиту данных.

## Railway

Репозиторий содержит `railway.json`: Railway использует Railpack, запускает `npm start` и проверяет `/api/health` перед переключением deployment. `PORT` задаётся Railway автоматически; volume и Railway Postgres этому приложению не требуются. На первом этапе оставьте одну реплику, поскольку rate limit хранится в памяти процесса.
