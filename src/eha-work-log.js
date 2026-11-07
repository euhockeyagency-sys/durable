// EHA internal website work log. Data only; not imported by the application.
// Read and update through EHA1990. Keep completed work separate from proposals.
module.exports = {
  "title": "EHA — единый журнал работ сайта",
  "scope": "Только eurohockeyagency.com и его EN/RU страницы. Внутренняя документация, не публичная статья.",
  "last_reviewed": "2026-11-07",
  "how_to_use": [
    "Перед работой прочитать этот файл через EHA1990 read_project_file с path='src/eha-work-log.js'. Затем прочитать нужные страницы и проверить актуальное состояние.",
    "Перед повторным предложением задачи проверить записи completed, historical и open_issues. Повторять выполненную задачу только при новой ошибке, устаревании или новых данных.",
    "После этапа обновить запись: файлы и URL EN/RU, что изменено, доказательства проверки, ограничения и следующий шаг. Не переписывать историю как текущий факт.",
    "Различать proposed (предложено), approved (согласовано), saved (сохранено), published_verified (публикация проверена), blocked (заблокировано).",
    "Этот журнал не меняет инструкции проекта автоматически. Пользователь должен указать в инструкциях его точный путь.",
    "Не хранить здесь персональные заявки, контакты игроков, паспортные или медицинские документы, секреты и токены."
  ],
  "rules": [
    "English основной язык, RU второй. Развивать связанную базу Country → League → Rules/Documents → Application.",
    "EHA1990 — основной канал изменения сайта. Сначала улучшать существующее, проверять дубли и поисковое намерение.",
    "Не публиковать прямые ссылки на команды/академии и их контакты для самостоятельного обращения. Названия допустимы; первичные официальные источники правил сохранять.",
    "Призывы к действию от имени агентства: «Получить консультацию EHA», а не разговорное «со Славой».",
    "Не показывать даты добавления или редакционной правки страниц. Сохранять честные Schema metadata; дату проверки изменяющихся фактов и сезон указывать отдельно.",
    "Official / Verified отделять от EHA Assessment. Не выдумывать зарплаты, лимиты, вакансии, цены и результаты.",
    "Не запрашивать сканы паспортов и медицинские документы для первого обращения.",
    "Не менять URL, canonical, hreflang, индексируемость и существующие связи без основания.",
    "Проверять сохранённый файл и опубликованную страницу отдельно. Реальные заявки не отправлять без поручения."
  ],
  "completed": [
    {
      "id": "AT-COUNTRY",
      "status": "published_verified",
      "files": [
        "public/en/guides/hockey-in-austria.html",
        "public/ru/guides/hokkej-v-avstrii.html"
      ],
      "urls": [
        "/guides/hockey-in-austria",
        "/ru/guides/hokkej-v-avstrii"
      ],
      "changes": [
        "Маршруты юниоров и взрослых; школа, жильё, бюджет и документы.",
        "Разделены официальные сведения и оценка EHA; убрана неподтверждённая маркировка AlpsHL как открытой лиги.",
        "Добавлены материалы для обращения, порядок помощи EHA, FAQ и внутренние связи.",
        "Русские кнопки приведены к профессиональной формулировке «Получить консультацию EHA»."
      ],
      "evidence": "2026-11-06: файлы прочитаны, verify_site вернул HTTP 200, productionHeaderMatchesFile=true и localMatchesProduction=true для обеих страниц.",
      "prior_qa": "В ходе выполнения проверялись мобильное отображение, JSON-LD и переход к форме; повторно визуально 2026-11-06 не проверялось."
    },
    {
      "id": "AT-ICEHL",
      "status": "published_verified",
      "files": [
        "public/en/leagues/austria-ice-hockey-league.html",
        "public/ru/ligi/avstriya-ice-hockey-league.html",
        "src/league-facts.js"
      ],
      "urls": [
        "/leagues/austria-ice-hockey-league",
        "/ru/ligi/avstriya-ice-hockey-league"
      ],
      "changes": [
        "Обновлены формат 2026/27 и список 14 команд с городами и странами без прямых ссылок на клубы.",
        "Убрано повторное добавление устаревшего списка из 13 команд: правка league-facts и явный собственный блок в шаблонах.",
        "Добавлены оценка соответствия, материалы игрока, помощь EHA, FAQ и CTA."
      ],
      "evidence": "2026-11-06: шаблоны прочитаны, обе страницы HTTP 200; локальная и production версии совпадают, source header соответствует файлам.",
      "limits": "Числа и правила — снимок сезона 2026/27, а не бессрочные факты. Работа серверного модуля после перезапуска отдельно не проверена; опубликованный дубль был устранён также шаблоном."
    },
    {
      "id": "AT-JUNIOR",
      "status": "published_verified",
      "files": [
        "public/en/leagues/austria-junior-hockey.html",
        "public/ru/ligi/avstriya-yuniorskij-hokkej.html"
      ],
      "urls": [
        "/leagues/austria-junior-hockey",
        "/ru/ligi/avstriya-yuniorskij-hokkej"
      ],
      "changes": [
        "Уточнены сбор IIHF до 18 лет, отдельные сроки заявки DÖNAM и условия плей-офф.",
        "Убраны устаревшее миграционное ограничение и неработающая ссылка на Meldebestimmungen.",
        "Убраны категоричные неподтверждённые обобщения о школах и автоматическом допуске.",
        "Добавлены школа, присмотр, полный бюджет, подготовка профиля, FAQ и консультация EHA."
      ],
      "evidence": "2026-11-06: обе страницы прочитаны, HTTP 200 и совпадение опубликованных версий с файлами подтверждены.",
      "limits": "Детальные условия EHÖ/EHÖ-EU остаются неподтверждёнными актуальным доступным первичным документом; на странице это обозначено."
    },
    {
      "id": "ALPS-GUIDE",
      "status": "published_verified",
      "files": [
        "public/en/leagues/alps-hockey-league.html",
        "public/ru/ligi/alps-hockey-league.html"
      ],
      "urls": [
        "/leagues/alps-hockey-league",
        "/ru/ligi/alps-hockey-league"
      ],
      "changes": [
        "Майский обзор переходов заменён первичным League Mode как источником формата.",
        "Добавлены формат 2026/27, 36 матчей регулярного сезона, Master/Qualification Round и даты этапов.",
        "Раскрыты спортивное соответствие, переход юниора, роль вратаря, оплата, жильё и полный пакет расходов.",
        "Убран запрос паспорта и медицинских сведений при первом обращении; добавлены FAQ и консультация."
      ],
      "evidence": "2026-11-06: обе страницы прочитаны, HTTP 200, production и локальная версия совпадают с сохранёнными шаблонами.",
      "limits": "Актуальная общая шкала зарплат и единый лимит иностранцев для всех категорий здесь не установлены."
    },
    {
      "id": "AT-AGENCY",
      "status": "published_verified",
      "files": [
        "public/en/guides/hockey-agent-in-austria.html",
        "public/ru/guides/hokkejnyj-agent-v-avstrii.html"
      ],
      "urls": [
        "/guides/hockey-agent-in-austria",
        "/ru/guides/hokkejnyj-agent-v-avstrii"
      ],
      "changes": [
        "Описаны аудитория, этапы работы, первичное рассмотрение и отдельный подробный анализ.",
        "Добавлены помощь родителям, согласование услуг, оплаты и представительства без выдуманных тарифов.",
        "Добавлены внутренние связи, FAQ и профессиональные CTA; убраны видимые редакционные даты."
      ],
      "evidence": "2026-11-06: обе страницы прочитаны; HTTP 200, productionHeaderMatchesFile=true, localMatchesProduction=true."
    },
    {
      "id": "FUNNEL-1-PARENTS",
      "status": "published_verified",
      "files": [
        "public/en/leagues/austria-junior-hockey.html",
        "public/ru/ligi/avstriya-yuniorskij-hokkej.html"
      ],
      "changes": [
        "На каждой странице две отдельные кнопки для родителей: в начале и в конце.",
        "Кнопки передают type=parent_guardian; обычные обращения игроков сохранены."
      ],
      "evidence": "2026-11-06: по две родительские ссылки подтверждены в каждом шаблоне. При выполнении этапа браузер подтвердил выбранный parent_guardian, родительский заголовок, видимые поля и отсутствие мобильного overflow."
    },
    {
      "id": "FUNNEL-2-CONTEXT",
      "status": "published_verified",
      "files": [
        "Все 10 EN/RU страниц пакета Австрии, перечисленные выше"
      ],
      "changes": [
        "Контекстные ссылки передают intent и source_page: junior_route, league_fit либо austria_consultation.",
        "Сохранены country, league и родительский type."
      ],
      "evidence": "2026-11-06: значения intent и source_page прочитаны во всех контекстных ссылках десяти шаблонов; публикация этих шаблонов подтверждена. Ранее проверено в коде: public/site.js заполняет поля, src/validation.js принимает intent и sourcePage.",
      "limits": "Реальная отправка и сохранение заявки на сервере не проверялись. Браузер скрывал значения hidden inputs, поэтому полная сквозная передача не считается доказанной."
    },
    {
      "id": "FUNNEL-3-RU-LABELS",
      "status": "published_verified",
      "files": [
        "public/site.js",
        "public/ru/contact.html"
      ],
      "changes": [
        "В русской форме Austria отображается как «Австрия», Austria junior — «Юниорский хоккей Австрии».",
        "Для русской формы добавлена версия /site.js?v=20261104-austria-labels, чтобы обновление не блокировалось старым кешем.",
        "English-подписи сохранены."
      ],
      "evidence": "2026-11-06: код локализации и версия script URL подтверждены чтением файлов; /ru/contact HTTP 200 и соответствует файлу. При выполнении этапа браузером проверены русские подписи и обычный/родительский режим.",
      "limits": "Другие страны и названия лиг этим небольшим изменением не локализованы."
    },
    {
      "id": "SALARY-SOURCES-EN-RU-20261106",
      "status": "published_verified",
      "date": "2026-11-06",
      "files": [
        "public/en/guides/hockey-player-salaries-in-europe.html",
        "public/ru/guides/zarplaty-hokkeistov-v-evrope.html"
      ],
      "urls": [
        "/guides/hockey-player-salaries-in-europe",
        "/ru/guides/zarplaty-hokkeistov-v-evrope"
      ],
      "changes": [
        "Убраны диапазоны другого агентства без ясной базы gross/net и оплачиваемого периода; сохранены основные Title, Description, URL, canonical и внутренние связи.",
        "Добавлены первичный договор HockeyAllsvenskan (§4, документ 6 мая 2020) и официальный пример Hockeyettan 2026/27 (интервью 28 октября, один клуб, не средняя по лиге).",
        "Исторические суммы SHL оставлены как исторические; повторно прочитаны SICO SHL/HA, NHLPA, Yle и hockeyarena.se.",
        "Добавлены FAQ Hockeyettan и DEL2 и соответствующие вопросы JSON-LD; теперь по 7 FAQ EN/RU.",
        "Убраны видимые редакционные даты в hero; дата проверки источников 6 ноября указана отдельно. Schema dateModified отражает эту правку."
      ],
      "evidence": [
        "Повторное чтение через read_project_file: обе сохранённые страницы точно совпадают с отправленными версиями.",
        "verify_site: EN/RU HTTP 200, localMatchesProduction=true, productionHeaderMatchesFile=true.",
        "Firecrawl rawHtml maxAge=0: один H1, правильный self canonical, взаимные en/ru/x-default hreflang, валидный JSON Article/FAQPage/BreadcrumbList, 7 вопросов FAQ.",
        "12 внутренних ссылок на лиги и справочник EN/RU проверены verify_site: HTTP 200.",
        "Browser: EN/RU при viewport 390x844, document scrollWidth=375, innerWidth=390; изображения статьи загружены. Родительские кнопки обеих страниц открывают contact с выбранным parent_guardian."
      ],
      "limits": [
        "Официальные текущие средние/сетки ICEHL, DEL2, Hockeyettan, AlpsHL этим обзором не установлены; отсутствие найденной сетки не доказывает отсутствие правила.",
        "Отправка и серверное сохранение заявки не проверялись. Hidden-поля не использованы как доказательство сквозной передачи.",
        "Core Web Vitals и все страницы сайта не проверялись; проверка мобильного overflow выполнена на ширине 390 px.",
        "Оценка органического эффекта требует периода после публикации."
      ],
      "next_step": "Доработать существующий справочник европейских лиг EN/RU: выбор по возрасту, уровню и цели. Новую статью «После U20» пока не создавать без проверки дублей."
    },
    {
      "id": "GERMANY-DE-LEAGUE-ORDER-20261107",
      "status": "published_verified",
      "date": "2026-11-07",
      "files": [
        "public/de/eishockey-in-deutschland.html"
      ],
      "urls": [
        "/de/eishockey-in-deutschland"
      ],
      "changes": [
        "Локальный SEO-пилот: обновлены Title, Description, H1, OG и Article JSON-LD под запрос eishockey ligen deutschland.",
        "В начале добавлена таблица DEL → DEL2 → Oberliga → региональные соревнования. Данные DEL2, Oberliga и U17/U20 2026/27 сверены с лигой и DEB. Исправлена ссылка на официальный сайт DEL.",
        "Добавлены якоря для взрослых и семей, ссылки на DEL2, Oberliga, юниорский гайд и контекстную форму EHA. Дата проверки указана для таблицы."
      ],
      "evidence": [
        "Search Console, Германия 8 октября — 4 ноября: запрос eishockey ligen deutschland — 121 показ, 1 клик, позиция 9,8.",
        "Сохранённый HTML совпадает с подготовленной версией. verify_site: HTTP 200, localMatchesProduction и productionHeaderMatchesFile true. В опубликованном HTML один H1, self canonical, hreflang en/ru/de/x-default и валидные Article, BreadcrumbList, FAQPage.",
        "Целевые страницы DEL2, Oberliga, Junior и contact вернули HTTP 200. Мобильная ширина 390 px без горизонтального переполнения, четыре строки таблицы и пять рабочих якорей. Прямое открытие URL родительской кнопки в браузере активировало parent_guardian."
      ],
      "limits": [
        "Форма и углублённые гайды доступны на EN, это отмечено в ссылках. Отправка заявки не тестировалась.",
        "Правовые условия вне правки таблицы; повторная проверка немецкой страницы федерального портала завершилась таймаутом, старая дата проверки соответствующего раздела сохранена.",
        "Эффект в Google пока не оценивался."
      ],
      "next_step": "Добавить на справочник лиг EN/RU три входа по возрасту и цели. Через четыре недели сравнить немецкий поисковый запрос в Search Console с базовым периодом."
    }
  ],
  "historical": [
    {
      "status": "reported_completed_in_conversation_not_reverified",
      "items": [
        "Germany junior EN/RU",
        "Czechia junior EN/RU",
        "CHL/NCAA age-pathway guide EN/RU"
      ],
      "note": "В более раннем ходе разговора сообщалось об обновлении и QA. Перед новой работой перечитать текущие страницы; не считать повторную публикацию новой задачей без сравнения."
    },
    {
      "status": "existing_materials",
      "items": [
        "US junior league comparison",
        "North American academy costs",
        "European hockey salary guide",
        "European league directory",
        "Resume, game video, IIHF transfer, offer comparison, agent-process guides"
      ],
      "note": "Наличие подтверждено инвентарём и/или чтением во время SEO-анализа. Не создавать дубли; новое обновление требует свежего чтения."
    }
  ],
  "open_issues": [
    {
      "id": "COPY-1",
      "status": "proposed",
      "task": "Уточнить заголовки о зарплатах там, где нет подтверждённых сумм: рассмотреть «оплата и условия контракта». Не менять без анализа намерения запроса."
    },
    {
      "id": "COPY-2",
      "status": "proposed",
      "task": "Сократить редакционные обороты вроде «не публикуем стандартную цену» в пользу полезного объяснения посетителю."
    },
    {
      "id": "COPY-3",
      "status": "proposed",
      "task": "Сделать заголовок юниорской Австрии понятнее: U20/U18, учёба и проживание."
    },
    {
      "id": "VERIFY-1",
      "status": "open",
      "task": "Требуется первичный актуальный документ для точных условий EHÖ/EHÖ-EU."
    },
    {
      "id": "VERIFY-2",
      "status": "open",
      "task": "Не считать сквозное создание заявки проверенным только по переходу к форме. Реальную отправку без поручения не выполнять."
    },
    {
      "id": "QA-TESTS",
      "status": "historical_limitation",
      "task": "Ранее run_tests сообщал 54 pass и 2 недоступных локально suite из-за supertest; результат GitHub Actions не был получен. Не заявлять, что все CI проверки пройдены."
    }
  ],
  "proposed_next": [
    {
      "order": 1,
      "status": "published_verified",
      "task": "Свежий аудит и доработка существующей страницы зарплат EN/RU: источники, соответствие запросам, первые ответы и связь с услугами EHA.",
      "completion_ref": "SALARY-SOURCES-EN-RU-20261106"
    },
    {
      "order": 2,
      "status": "proposed_not_approved_for_edit",
      "task": "Улучшить существующий справочник европейских лиг: уровни, возраст, цели и путь к оценке EHA."
    },
    {
      "order": 3,
      "status": "proposed_not_created",
      "task": "Новая статья EN/RU «После U20: переход во взрослый хоккей Европы». Сначала проверить дубли и обоснование темы. Спрос именно на тему пока не подтверждён."
    },
    {
      "order": 4,
      "status": "ideas_not_created",
      "task": "Статьи о переходе вратаря, страховке хоккеиста и действиях после непрохождения просмотра. Это гипотезы, не подтверждённый спрос."
    }
  ],
  "analytics_snapshot": {
    "status": "historical_snapshot_not_fresh_query_in_this_log_creation",
    "period": "2026-10-07—2026-11-03",
    "source": "EHA CONTROL live Search Console query из предшествующего SEO-анализа; страницы, не тематические группы",
    "pages": [
      {
        "path": "/guides/hockey-player-salaries-in-europe",
        "impressions": 8067,
        "clicks": 93,
        "position": 6.5
      },
      {
        "path": "/leagues/austria-ice-hockey-league",
        "impressions": 1657,
        "clicks": 16,
        "position": 6.1
      },
      {
        "path": "/european-leagues",
        "impressions": 1612,
        "clicks": 17,
        "position": 6.6
      },
      {
        "path": "/guides/hockey-academies-in-north-america",
        "impressions": 1108,
        "clicks": 13,
        "position": 7.5
      }
    ],
    "limits": "Показы сайта не равны общему объёму поиска. Результат недавних обновлений нельзя выводить из периода до этих правок. Для решений запрашивать свежие данные."
  }
};
