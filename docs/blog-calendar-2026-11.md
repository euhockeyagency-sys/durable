# Блог как поисковый канал: календарь на 8 недель (ноябрь 2026 – январь 2027)

Шаблон статьи — `docs/blog-article-template.md`. Статус выполнения — только в `PROJECT_STATUS.md`.
Все 8 тем уже имеют EN- и RU-страницы, поэтому новых маршрутов не требуется: каждая неделя — обновление существующей пары под шаблон, а не новая статья.

## Календарь

| Нед. | Даты | Запрос EN / RU | URL EN / RU | Действие | Первичные источники | CTA | Обратные ссылки |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 18–24 ноя | alpshl vs oberliga / alps hockey league или оберлига | `/guides/alps-hockey-league-vs-oberliga` / `/ru/guides/alps-hockey-league-ili-oberliga` | **Готово на ветке `claude/blog-week1`**: переписано под шаблон | AlpsHL Game Book 2026/27 (C§4, C§8), league mode, DEB, Make it in Germany, IIHF 2026; пресса — Eishockey News | Отправить профиль | Лиги AlpsHL и Oberliga, гиды Австрия/Германия, «Открытые лиги» (EN/RU); калькулятор |
| 2 | 25 ноя – 1 дек | iihf transfer under 18 / трансфер iihf несовершеннолетнего | `/guides/documents-and-iihf-transfer-for-a-minor-hockey-player` / `/ru/guides/dokumenty-nesovershennoletnego-hokkeista-i-transfer-iihf` | Обновить (правки ниже) | IIHF International Transfer Regulations 2026; SIF, SJL, ÖEHV, SIHF, ČSLH; Migrationsverket, IRCC | Консультация родителя + WhatsApp | Хаб «Родителям» (уже есть), `iihf-international-transfer`, гид «Переезд до 18» |
| 3 | 2–8 дек | mhl to europe / из мхл в европу | `/guides/after-mhl-and-nmhl-to-europe-options-for-russian-and-belarusian-players` / `/ru/guides/posle-mhl-i-nmhl-v-evropu-varianty-dlya-igrokov-iz-rossii-i-belarusi` | Обновить: Quick answer, таблица «страна — статус паспорта РФ/РБ — сезон», 4 FAQ | Регламенты федераций, IIHF, консульские сайты | Отправить профиль | Гиды Казахстан/Сербия/Венгрия, юниорские лиги |
| 4 | 9–15 дек | usphl to europe pro hockey / из usphl в европу | `/guides/from-usphl-ehl-na3hl-to-senior-hockey-in-europe` / `/ru/guides/iz-usphl-ehl-na3hl-vo-vzroslyj-hokkej-evropy` | Обновить: таблица «лига NA → реалистичный уровень в Европе», ITC из USA Hockey | IIHF, USA Hockey transfer, регламенты лиг | Отправить профиль | Europe vs North America, AlpsHL/Oberliga, «Открытые лиги» |
| 5 | 16–22 дек | hockey salary net vs gross / зарплата хоккеиста нетто брутто | `/guides/net-vs-gross-hockey-salary-germany-poland` / `/ru/guides/netto-i-brutto-zarplata-hokkeista-germaniya-polsha` | Расширить на Францию и Скандинавию только по официальным налоговым источникам; ссылка на «Как работает агент» | BMF/ELSTER, gov.pl, impots.gouv.fr, Skatteverket, Skatteetaten | Отправить профиль | Гиды Германия/Польша/Франция, `how-a-hockey-agent-works` |
| 6 | 23–29 дек | hockey player work visa europe / рабочая виза хоккеиста | `/guides/work-visa-for-hockey-player` / `/ru/guides/rabochaya-viza-dlya-hokkeista` | Обновить: календарь «подписание → дебют» по странам, ссылка на For clubs | Make it in Germany, gov.pl, MV ČR, oesterreich.gv.at, Migri | Отправить профиль | For clubs, гиды стран, AlpsHL vs Oberliga |
| 7 | 30 дек – 5 янв | tauron vs ligue magnus / tauron или ligue magnus | `/guides/tauron-hokej-liga-vs-ligue-magnus` / `/ru/guides/tauron-hokej-liga-ili-ligue-magnus` | Обновить: добавить Erste Liga (профиль `hu-erste-liga`) | Регламенты PZHL, FFHG, MJSZ / Erste Liga | Отправить профиль | Лиги Польша/Франция/Венгрия, «Открытые лиги» |
| 8 | 6–12 янв | hockey highlight video for scouts / видео для хоккейного клуба | `/guides/hockey-video-for-clubs` / `/ru/guides/video-dlya-kluba` | Обновить ведущую страницу; связать с `what-game-video-tells-a-club`, `why-good-hockey-stats-do-not-bring-club-offers`, `hockey-resume-for-european-clubs` (без слияния, чтобы не терять URL) | Только редакционный опыт EHA; без внешних фактов | Отправить профиль | 3 связанных гида, страница «Игрокам» |

Повторно проверять для каждой недели: сезон и дату проверки в `docs/*-factcheck.md`; клубы не упоминать ссылками.

## Неделя 2: правки IIHF-гайда (точные URL)

- EN: https://eurohockeyagency.com/guides/documents-and-iihf-transfer-for-a-minor-hockey-player
- RU: https://eurohockeyagency.com/ru/guides/dokumenty-nesovershennoletnego-hokkeista-i-transfer-iihf
- GSC 18.11.2026: обе в индексе, EN последний обход 12.11; индексирование запрошено для EN и RU.

Правки:
1. Под H1 — блок **Quick answer / Короткий ответ** (сейчас «Short answer» есть только внутри раздела `#three-permissions`): для игрока до 18 трансферного сбора нет (IIHF 2026, I.5.1), общее окно 1 июля – 15 февраля не применяется, но разрешение на проживание и место в школе — отдельные решения.
2. Формулировку «no transfer fee for minors» оставить строго как в I.5.1 («для трансфера, завершённого до 18-летия») и сохранить оговорку, что национальный регистрационный сбор не подтверждён.
3. Новый блок «Сборы и сроки»: таблица «шаг — кто — срок — сбор» (апелляция 7 дней; апелляция в Disciplinary Board — CHF 1,000; фиксированный сбор IIHF — не публичен, так и написать).
4. CTA в конце — консультация родителя (`/contact?type=parent`) + существующая кнопка WhatsApp; один CTA.
5. FAQ ровно 4 (сейчас 4 — сверить с JSON-LD), блок источников есть; добавить дату проверки.
6. Обратные ссылки: хаб «Родителям» (есть), `iihf-international-transfer` / `mezhdunarodnyj-transfer-iihf`, гид «Переезд до 18» (`#three-permissions`).

## Базовая линия GSC (28 дней, 20.10–16.11.2026)

| Срез | Клики | Показы | CTR | Позиция |
| --- | --- | --- | --- | --- |
| Все `/guides/` (126 стр.) | 490 | 28 400 | 1,7 % | 7,1 |
| `iihf-international-transfer` (EN) | 9 | 503 | — | 7,3 |
| `mezhdunarodnyj-transfer-iihf` (RU) | 5 | 164 | — | 5,5 |
| Гид несовершеннолетнего EN | 4 | 307 | — | 6,9 |
| Гид несовершеннолетнего RU | 1 | 108 | — | 5,6 |
| AlpsHL vs Oberliga EN/RU | 0 | 0 | — | — (обновлён, не опубликован) |

## Измерение

- Каждые две недели (2, 16, 30 дек; 13 янв): GSC → Эффективность → фильтр страницы, 28 дней; записать в таблицу ниже.
- Запросы на позициях 8–20 с показами: добавить формулировку в H2/FAQ/description, усилить внутреннюю ссылку.
- Обзор через 30 и 60 дней после публикации каждой статьи: клики, показы, CTR, позиция, заявки с `?type=` и переходы в калькулятор.
- Плановое сравнение GSC — 10.12.2026 (уже запланировано).

| Статья | Дата публ. | База (клики/показы/поз.) | +14 дн. | +30 дн. | +60 дн. | Действие |
| --- | --- | --- | --- | --- | --- | --- |
| AlpsHL vs Oberliga | — | 0/0/— | | | | |
| IIHF до 18 | — | EN 4/307/6,9; RU 1/108/5,6 | | | | |
