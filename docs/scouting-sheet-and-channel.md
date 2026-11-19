# Карточка игрока для клубов и Telegram-канал вакансий (19.11.2026)

## Карточка игрока (Scouting Sheet)

- Адрес: `https://eurohockeyagency.com/s/<token>`. Одна ссылка = один игрок + один клуб.
- Данные: CRM (проект Supabase `kkxugkmpugwwndxsevdy`), таблица `players`, паспорта — из активного `player_search_profiles`.
- Что видит клуб: имя, год рождения, позиция, хват, рост/вес, паспорт, текущая команда/лига/страна, статус доступности, видео (YouTube/Vimeo — встроенный плеер, остальное — кнопки), `stats_summary`, ссылка EP, `strengths`, `short_description`, кнопки «Связаться с агентом» (email) и WhatsApp.
- Что клуб НЕ видит: контакты игрока и родителей, `notes`, `contract_terms`, `development_areas`, `target_markets`, название клуба-получателя. Белый список полей задан в SQL-функции `get_scouting_sheet`.
- Страница: `noindex`, `no-store`, `no-referrer`, не в sitemap, ссылок с сайта нет. Ссылка живёт 60 дней (1–365), её можно отключить.
- Просмотры: каждый просмотр человеком увеличивает `view_count`; агенту приходит сообщение в Telegram (не чаще одного раза в 30 минут на ссылку). Превью мессенджеров и ботов (WhatsApp, Telegram, Slack, Google, почтовые сканеры с узнаваемым User-Agent) не считаются. Почтовые сканеры без такого признака могут дать ложное «открыли».
- Код: `src/scouting-sheet.js`, тесты `test/scouting-sheet.test.js`, миграция CRM `crm/migrations/20261119190000_scouting_links.sql` (применяется в CRM вручную с разрешения владельца; `supabase/` — проект сайта, не CRM).

### Команды (через Claude / SQL в CRM)

```sql
-- создать ссылку (вернёт токен; ссылка = https://eurohockeyagency.com/s/<токен>)
select public.create_scouting_link('<player_id>', 'Pueblo Bulls', null, 'en', 60);
-- отключить
update public.scouting_links set revoked_at = now() where id = '<link_id>';
-- кто открывал
select recipient_label, view_count, first_viewed_at, last_viewed_at from public.scouting_links where player_id = '<player_id>';
```

## Telegram-канал вакансий

- Канал: `https://t.me/eu_hockeyagency`. Блок подписки (`src/channel-cta.js`) выводится под всеми гидами (`/guides/*`, включая календарь трансферов) и на «Запросы клубов» (EN/RU). Событие аналитики `telegram_channel_click` (только после согласия на cookies, только путь страницы).
- WhatsApp: ссылка владельца ведёт в группу (номера участников видны всем), поэтому на сайт не поставлена — ждёт WhatsApp-канала.
- Еженедельный дайджест и срочные посты: черновик владельцу → публикация только после «ок». Ещё не сделано (нужен бот-администратор канала).
