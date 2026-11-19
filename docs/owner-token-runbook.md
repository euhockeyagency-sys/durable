# Токен владельца PDF: перенос из URL, оценка логов, ротация

Подготовлено 19.11.2026 (пакет B аудита). Операции на сервере и в базе — только с разрешения владельца. Значения токенов не выводить ни в терминал, ни в отчёты.

## Что изменено в коде

- Токен выдаётся один раз в ответе `POST /api/applications` и хранится только в `sessionStorage` вкладки (страница успеха). В базе — только SHA-256.
- Загрузка PDF: `POST /api/applications/:ref/pdf` с телом `{"token": "…"}`; ответ `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`.
- Старый способ `GET /api/applications/:ref/pdf?token=…` отвечает `410 use_post` с пояснением и `no-store`; query не читается и не возвращается. Токен в query для POST тоже не принимается.
- Кто вызывал старый URL: только `public/assets/intake-form.js` на странице успеха через `fetch` (не навигация, поэтому в GA4/Метрику адрес не попадал). Скрипт версионируется (`VERSIONED_SCRIPTS`), после деплоя браузеры получат новую версию. Страница с устаревшим скриптом увидит «недоступно»; кнопка заработает после перезагрузки.
- Node не пишет журнал запросов (нет morgan/логирования URL); тест `owner token never appears in URLs or server logs` проверяет вывод console на синтетическом токене.
- Ссылка `/shared/player-card/:token` — отдельный механизм: агент создаёт её для внешнего получателя, токен в пути по замыслу, срок ограничен. В эту правку не входит; при желании — сократить срок и выдавать одноразово.

## Оценка исторических логов (на сервере, только счётчики)

```bash
# 1. Пишет ли Caddy access-лог и куда
grep -nE '^\s*log\b|output file' /etc/caddy/Caddyfile
# 2. Сколько строк со старым URL (без вывода самих строк)
sudo grep -cE '/api/applications/EHA-[0-9]{6}-[A-F0-9]{6}/pdf\?' /var/log/caddy/*.log 2>/dev/null
sudo zgrep -cE '/api/applications/EHA-[0-9]{6}-[A-F0-9]{6}/pdf\?' /var/log/caddy/*.gz 2>/dev/null
# 3. journald сервиса Node
sudo journalctl -u eha --since 2026-11-18 | grep -cE 'pdf\?.*token='
```

Критерий: если все счётчики 0 — ротация не требуется. Если больше 0 — список номеров заявок (без токенов): `grep -oE 'EHA-[0-9]{6}-[A-F0-9]{6}/pdf' … | sort -u`.

## Ротация (только для затронутых номеров, после разрешения)

```sql
-- предварительно: сколько заявок затронуто
select count(*) from applications where reference_code = any(:refs) and owner_token_hash is not null;
-- аннулировать токены: игрок больше не скачает PDF со страницы успеха, агент выдаёт PDF через /admin или share-ссылку
update applications set owner_token_hash = null where reference_code = any(:refs);
```

После ротации удалить или сжать логи с такими строками по политике хранения логов сервера. Если Caddy access-лог не включён, хранить не нужно ничего: шаги 2–3 вернут 0.
