// EHA internal website work log. Data only; not imported by the application.
// Read and update through EHA1990. Keep completed work separate from proposals.
module.exports = {
  "title": "EHA — единый журнал работ сайта",
  "scope": "Только eurohockeyagency.com и его EN/RU страницы. Внутренняя документация, не публичная статья.",
  "last_reviewed": "2026-11-23",
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
  "id": "CONTACT-WHATSAPP-BUTTON-20261114",
  "status": "published_verified",
  "date": "2026-11-14",
  "files": [
    "public/en/contact.html",
    "public/ru/contact.html"
  ],
  "urls": [
    "/contact",
    "/ru/contact"
  ],
  "changes": [
    "В видимом блоке контактов убран текст номера телефона. EN кнопка Message on WhatsApp, RU Написать в WhatsApp; существующая wa.me ссылка сохранена."
  ],
  "evidence": [
    "Оба сохранённых HTML совпадают с подготовленной правкой.",
    "verify_site EN/RU HTTP 200, localMatchesProduction=true, productionHeaderMatchesFile=true.",
    "Firecrawl maxAge=0 rawHtml: в тексте страницы нет номера, локализованные подписи кнопок есть, wa.me ссылка сохранена."
  ],
  "limits": [
    "WhatsApp и отправка сообщений не запускались. Номер остаётся частью адреса wa.me, необходимого для работы ссылки."
  ],
  "next_step": "Продолжить согласованный выбор SEO-пакета; правка кнопки завершена."
},
{
  "id": "FI-JUNIOR-MOBILE-QA-20261114",
  "status": "published_verified",
  "date": "2026-11-14",
  "files": [
    "public/en/leagues/finland-junior-hockey.html",
    "public/ru/ligi/finlyandiya-yuniorskij-hokkej.html",
    "public/ru/contact.html"
  ],
  "urls": [
    "/leagues/finland-junior-hockey",
    "/ru/ligi/finlyandiya-yuniorskij-hokkej",
    "/ru/contact"
  ],
  "changes": [
    "Завершена мобильная проверка гайдов EN/RU на ширинах 320 и 390 px.",
    "Найдена и исправлена растягивающая grid проблема в русской родительской форме при 320 px: локальный CSS max-width:600px задаёт min-width:0 детям contact-grid и адаптивный размер/перенос contact-title. Другие страницы и desktop CSS не менялись."
  ],
  "evidence": [
    "Kernel Chromium: EN/RU таблицы на 390 px шириной 331 px, на 320 px — 261 px, совпадают с контейнерами; выходящих за экран CTA не найдено.",
    "Мобильные меню EN/RU открываются и закрываются. Переходы из новых родительских CTA EN/RU выбирают parent_guardian; родительские поля видимы.",
    "RU contact до исправления scrollWidth=347 при innerWidth=320; после исправления 305 при 320 и 375 при 390, выходящих за экран полей нет. Снимок экрана после исправления проверен визуально.",
    "Повторное чтение RU contact: точное совпадение с отправленным HTML. verify_site /ru/contact: HTTP 200, localMatchesProduction=true, productionHeaderMatchesFile=true."
  ],
  "limits": [
    "Проверка выполнена в Chromium с viewport телефона, не на физическом iPhone/Safari.",
    "Реальная отправка/сохранение заявки, Core Web Vitals и итог GitHub Actions не проверены."
  ],
  "next_step": "Выбирать следующий контентный этап по свежим Search Console запросам; эффект правок Финляндии оценивать после публикации 14 ноября."
},
{
  "id": "FI-JUNIOR-FAMILY-ROUTE-20261114",
  "status": "published_verified",
  "date": "2026-11-14",
  "files": [
    "public/en/leagues/finland-junior-hockey.html",
    "public/ru/ligi/finlyandiya-yuniorskij-hokkej.html"
  ],
  "urls": [
    "/leagues/finland-junior-hockey",
    "/ru/ligi/finlyandiya-yuniorskij-hokkej"
  ],
  "changes": [
    "Раскрыты U18 SM-sarja, Mestis, Suomi-sarja и региональные II/III уровни в существующей таблице; без новых страниц и URL.",
    "Добавлен маршрут семьи из четырёх решений: возраст/уровень, профиль/видео, письменный бюджет, готовность переезда. Встроена ссылка на «После U20» EN/RU.",
    "Убраны видимые редакционные даты; Article dateModified=2026-11-14. Прежние даты миграционной/паспортной проверки сохранены.",
    "Родительские ссылки используют type=parent_guardian и сохраняют intent/country/league/source_page; в RU шаблоне contact явно /ru/contact."
  ],
  "evidence": [
    "Официальные страницы SJL прочитаны через Firecrawl maxAge=0: правила 2026/27 §5.2/5.4/6.7, решения 12 марта, 20 мая и 3 сентября. Результат-сервис перечисляет U18 Mestis и другие категории; текущие составы не подтверждались.",
    "Оба сохранённых HTML точно совпадают с подготовленными версиями. verify_site обеих страниц: HTTP 200, localMatchesProduction=true, productionHeaderMatchesFile=true.",
    "Browser DOM: один H1, self canonical, взаимные en/ru/x-default, валидный JSON Article/BreadcrumbList/FAQPage; изображение загружено; нет несуществующих внутренних якорей.",
    "Ссылки «После U20» EN/RU HTTP 200. Новые родительские кнопки открыты браузером: после загрузки site.js выбран parent_guardian на обеих формах."
  ],
  "limits": [
    "Мобильная интерактивная проверка/overflow не выполнена; запрос мобильного снимка выполнен, но снимок не использован как доказательство визуального QA.",
    "Заявки не отправлялись; сохранение заявки не проверялось.",
    "Миграционные/паспортные сведения не перепроверялись; их старые даты сохранены. Вакансии, цены, школы и составы не подтверждены.",
    "Свежая аналитика в этом этапе не получена; ранее сообщённые поисковые показатели не названы свежими."
  ],
  "next_step": "Проверить мобильное отображение таблицы и формы; оценивать органический эффект по периоду после 14 ноября. Следующую тему выбирать по свежим запросам."
},
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
    },
    {
      "id": "EUROPEAN-LEAGUES-ROUTES-20261107",
      "status": "published_verified",
      "date": "2026-11-07",
      "files": [
        "public/en/european-leagues.html",
        "public/ru/ligi-evropy.html"
      ],
      "urls": [
        "/european-leagues",
        "/ru/ligi-evropy"
      ],
      "changes": [
        "В начале обеих страниц добавлены три маршрута: U18/U20, переход из юниоров во взрослую команду, сравнение предложений во взрослом хоккее.",
        "Добавлены ссылки на справочник стран, материалы для родителей, калькулятор уровня, условия контрактов и трансфер IIHF; контекстная форма оценки EHA, отдельная родительская ссылка.",
        "В первом экране добавлен якорь на маршруты. Убрана видимая дата редакции, сохранена дата набора данных."
      ],
      "evidence": [
        "Оба шаблона после чтения точно совпадают с подготовленными файлами. verify_site: HTTP 200, localMatchesProduction=true, productionHeaderMatchesFile=true для EN/RU.",
        "На обеих страницах проверены один H1, self canonical, взаимные EN/RU и x-default hreflang и JSON-LD BreadcrumbList, FAQPage, ItemList.",
        "14 внутренних URL новых ссылок отвечают HTTP 200. В браузере EN/RU на 390 px без горизонтального переполнения, отображаются три маршрута. Поиск без результатов и сброс фильтров возвращают исходные 46 строк. URL обеих родительских кнопок открывают parent_guardian."
      ],
      "limits": [
        "Отправка и сохранение заявки не проверялись. Данные Search Console после публикации пока не оценивались."
      ],
      "next_step": "Собрать данные Search Console по немецкому гайду и справочнику после четырёх недель. Перед отдельной статьёй «После U20» проверить пересечения с существующими гайдами и данные поисковых запросов."
    },
    {
      "id": "AFTER-U20-GUIDE-20261107",
      "status": "published_verified",
      "date": "2026-11-07",
      "files": [
        "public/en/guides/after-u20-senior-hockey-in-europe.html",
        "public/ru/guides/posle-u20-vzroslyj-hokkej-v-evrope.html",
        "public/en/european-leagues.html",
        "public/ru/ligi-evropy.html",
        "src/locales.js"
      ],
      "urls": [
        "/guides/after-u20-senior-hockey-in-europe",
        "/ru/guides/posle-u20-vzroslyj-hokkej-v-evrope"
      ],
      "changes": [
        "Опубликован гайд о первом взрослом сезоне после U20: доказательства по амплуа, условное сравнение двух предложений, план первого месяца, FAQ и контекстные формы.",
        "Прочитаны рекомендации Google Search Central, исследование перехода шведских хоккеистов (DiVA 1117709) и официальный раздел IIHF. Практические советы EHA отделены от источников.",
        "Из блока «После юниоров» справочников добавлены ссылки на гайд. Пара зарегистрирована в PAGES и опубликована в sitemap.xml и /ru/sitemap.xml."
      ],
      "evidence": [
        "Две статьи HTTP 200 и опубликованные ответы совпадают с файлами. В браузере EN/RU: один H1, self canonical, JSON-LD Article/BreadcrumbList, четыре строки таблицы, без переполнения при ширине 390 px, переходы из справочника, родительский режим. 10 внутренних целевых URL дали HTTP 200.",
        "Переключатели в шаблонах явно ведут на вторую языковую версию, RU переключатель подтверждён браузером после правки.",
        "2026-11-07: eha.service перезапущен в 22:34 CET. Обе страницы HTTP 200, self canonical и взаимные hreflang en/ru/x-default подтверждены в опубликованном HTML."
      ],
      "limits": [
        "Отправка заявки не выполнялась. Поисковый спрос на конкретный переход не подтверждён, позиции после публикации не оценивались."
      ],
      "next_step": "Отслеживать обе версии статьи в Search Console."
    },
{
  "id": "AUDIT-P0-RETENTION-20261119",
  "status": "blocked",
  "date": "2026-11-19",
  "files": [
    "supabase/functions/cleanup-applications/cleanup.mjs",
    "supabase/functions/cleanup-applications/index.ts",
    "src/app.js",
    "test/cleanup-retention.test.js",
    "test/app.test.js",
    "docs/retention-runbook.md"
  ],
  "urls": [
    "/admin"
  ],
  "changes": [
    "Очистка удаляет по сроку только заявки со статусом rejected/archived и без будущего follow-up; new удерживаются и считаются как heldUnprocessed. Добавлен dryRun.",
    "В админке: очередь необработанных, возраст, сортировка старых первыми, счётчик удержанных после срока хранения."
  ],
  "evidence": [
    "Сайт с очередью new в админке опубликован 19.11 (deploy e5fafce/последующий). Защита при очистке живёт в Edge Function cleanup-applications, которую GitHub Actions не деплоит; доступа к Supabase production у сессии нет — функция НЕ задеплоена, cron работает по старой логике до деплоя по docs/retention-runbook.md.",
    "test/cleanup-retention.test.js: граница срока, все статусы, файлы, dry-run, повторный запуск, удаление после отклонения владельцем.",
    "npm test 275/275 на ветке fix/audit-2026-11-19."
  ],
  "limits": [
    "Не опубликовано: Edge Function и сайт не задеплоены. Состояние pg_cron и базы production не проверено (нет доступа коннектора).",
    "Формулировку политики приватности о 12 месяцах должен решить владелец (docs/retention-runbook.md)."
  ],
  "next_step": "Деплой функции и сайта по docs/retention-runbook.md после разрешения владельца, затем dry-run на production."
},
{
  "id": "AUDIT-P0-PDF-TOKEN-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "src/intake/routes.js",
    "public/assets/intake-form.js",
    "test/intake.test.js",
    "docs/owner-token-runbook.md"
  ],
  "urls": [
    "/api/applications/:ref/pdf"
  ],
  "changes": [
    "PDF владельца выдаётся только через POST с токеном в теле, no-store и no-referrer. Старый GET с ?token отвечает 410 и не читает query."
  ],
  "evidence": [
    "Production 19.11: GET /api/applications/<синтетический ref>/pdf?token=… → 410, токен в ответе не возвращается. Остаётся: оценка логов и ротация (docs/owner-token-runbook.md).",
    "test/intake.test.js: неверный токен/ref → 404, токен в query на POST не принимается, GET → 410, токен не попадает в URL и логи сервера."
  ],
  "limits": [
    "Не опубликовано. Оценка старых логов Caddy/journald и ротация токенов — только процедура (docs/owner-token-runbook.md), выполняется владельцем."
  ],
  "next_step": "После деплоя: подсчёт запросов с token= в логах и обнуление owner_token_hash для затронутых заявок по runbook."
},
{
  "id": "AUDIT-P0-WEBVISOR-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/en/contact.html",
    "public/ru/contact.html",
    "public/en/for-clubs.html",
    "public/ru/for-clubs.html",
    "public/en/level-calculator.html",
    "public/ru/kalkulyator-urovnya.html",
    "public/en/application-success.html",
    "public/ru/application-success.html",
    "test/webvisor-masking.test.js",
    "docs/webvisor-check.md"
  ],
  "urls": [
    "/contact",
    "/ru/contact",
    "/for-clubs",
    "/ru/for-clubs",
    "/level-calculator",
    "/ru/kalkulyator-urovnya"
  ],
  "changes": [
    "Формы заявки и запроса клуба: ym-hide-content и ym-disable-keys; поля ввода и номер заявки на странице успеха замаскированы."
  ],
  "evidence": [
    "Production 19.11: форма заявки отдаётся с ym-hide-content ym-disable-keys. Проверка записи в Метрике — за владельцем.",
    "test/webvisor-masking.test.js (6 тестов). Проверка production до согласия: Метрика не отправляет hit до согласия."
  ],
  "limits": [
    "После согласия запись Вебвизора в браузере не наблюдалась за 20 с — проверка неокончательная без доступа к счётчику. Не опубликовано."
  ],
  "next_step": "После деплоя владелец проверяет записи Вебвизора в Метрике по docs/webvisor-check.md."
},
{
  "id": "AUDIT-P1-ATTRIBUTION-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "src/attribution.js",
    "src/validation.js",
    "src/app.js",
    "src/intake/agent-card.js",
    "public/site.js",
    "public/assets/level-calculator.js",
    "public/assets/cost-calculator.js",
    "public/en/contact.html",
    "public/ru/contact.html",
    "scripts/normalize-cta-links.js",
    "scripts/attribution-history-dry-run.js",
    "test/attribution.test.js",
    "docs/attribution-runbook.md",
    "226 EN/RU страниц с CTA /contact"
  ],
  "urls": [
    "/contact",
    "/ru/contact",
    "/level-calculator",
    "/ru/kalkulyator-urovnya",
    "/junior-season-cost-calculator"
  ],
  "changes": [
    "Единый набор intent с алиасами (league-assessment → league_assessment; assessment/free-assessment/player_assessment → free_assessment; player-analysis → player_analysis отдельно).",
    "source_page = страница CTA с /ru для RU; landing_page хранится отдельно. Калькулятор стоимости больше не срезает /ru.",
    "country (ISO) и league (slug страницы лиги) — отдельные поля; offer-review и сравнения убраны из league. RU форма показывает русские подписи, note не теряется.",
    "CTA калькулятора уровня передаёт goal, intent=calculator_result, source_page, from_calculator."
  ],
  "evidence": [
    "Production 19.11: /ru/contact содержит скрытые поля country/league/goal/fromCalculator и русские подписи (SE → Швеция); ссылки гайдов канонические; калькулятор передаёт intent=calculator_result и from_calculator. История CRM не изменялась.",
    "test/attribution.test.js (9 тестов): все 336 ссылок /contact канонические, source_page совпадает со страницей, dry-run истории CRM включая /guides/hokkej-v-rumynii.",
    "scripts/normalize-cta-links.js --check: 0 изменений."
  ],
  "limits": [
    "Не опубликовано. Dry-run истории CRM на production не запускался (нет доступа к базе); применение — только с разрешения владельца (docs/attribution-runbook.md).",
    "События GA пока получают intent из URL как есть; старые ссылки из кэша дадут старое значение в GA, CRM нормализует."
  ],
  "next_step": "После деплоя: dry-run истории CRM, решение владельца о применении."
},
{
  "id": "AUDIT-P1-WHATSAPP-EVENTS-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/site.js",
    "public/assets/intake-form.js",
    "src/app.js",
    "test/analytics-events.test.js",
    "docs/analytics-events.md"
  ],
  "urls": [
    "/application-success",
    "/ru/application-success",
    "все страницы с WhatsApp"
  ],
  "changes": [
    "Причина 0: whatsapp_click есть в GA4 (3 с 16.11, совпадает с outbound click на wa.me), но не собирается в таблицу EHA CONTROL ga4_events.",
    "whatsapp_click только после согласия, один раз на клик, без номера и текста.",
    "Номер заявки убран из href WhatsApp на странице успеха и из page_location (GA) и адреса до запуска Метрики.",
    "application_sent дедуплицируется по номеру заявки и в localStorage."
  ],
  "evidence": [
    "Production 19.11: site.js с отправкой whatsapp_click только после согласия; ссылка WhatsApp на странице успеха без текста; GA page_location без ref. Удаление исторических данных GA4 и сборщик EHA CONTROL — за владельцем.",
    "test/analytics-events.test.js (4 теста, в т.ч. исполнение обработчика в vm).",
    "GA4 Data API 19.11: whatsapp_click 17.11=2, 18.11=1; click wa.me 2 и 1. CRM 33 vs GA application_sent 28 за 01.10–18.11."
  ],
  "limits": [
    "Не опубликовано. Сборщик EHA CONTROL не в этом репозитории — добавить события должен владелец.",
    "Исторические link_url/page_location с номерами заявок в GA4 удаляются только через Data deletion request владельцем."
  ],
  "next_step": "После деплоя: проверить в GA DebugView отсутствие ref в page_location; владелец — удаление данных в GA4 и расширение списка событий EHA CONTROL."
},
{
  "id": "AUDIT-P1-SALARY-INTENT-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/en/guides/hockey-player-salaries-in-europe.html",
    "public/ru/guides/zarplaty-hokkeistov-v-evrope.html",
    "test/salary-pages.test.js",
    "docs/hockey-salaries-factcheck.md"
  ],
  "urls": [
    "/guides/hockey-player-salaries-in-europe",
    "/ru/guides/zarplaty-hokkeistov-v-evrope",
    "/guides/icehl-and-alps-hockey-league-salaries",
    "/ru/guides/zarplaty-icehl-i-alps-hockey-league"
  ],
  "changes": [
    "Хаб — сравнение лиг: ICEHL убрана из title/og/twitter. Вопрос FAQ про ICEHL больше не противоречит отдельному гайду (оценка EHA €35–150k+, сторонняя €40–150k+, gross/net не указан) и ведёт на него.",
    "Диапазоны €35–150k+ и €15–45k подтверждены как приблизительная оценка владельца (16.11) и везде подписаны как оценка EHA."
  ],
  "evidence": [
    "Production 19.11: title хаба «European Hockey Salaries by League: SHL, Liiga, DEL, DEL2».",
    "test/salary-pages.test.js: title, отсутствие противоречия, ссылка, подпись каждого упоминания диапазона на EN/RU.",
    "GSC 20.10–18.11: запросы о зарплатах ICEHL/AlpsHL — хаб 359 показов, поз. 7,3; отдельный гайд — 1 показ."
  ],
  "limits": [
    "Не опубликовано. Риск временной потери показов хаба по запросам ICEHL до роста отдельного гайда. Цифры не проверялись заново — это оценка владельца."
  ],
  "next_step": "После публикации 4 недели наблюдать распределение показов ICEHL-запросов между двумя страницами."
},
{
  "id": "AUDIT-P1-SITEMAP-LASTMOD-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "scripts/generate-lastmod.js",
    "src/app.js",
    "test/lastmod.test.js",
    "test/app.test.js",
    ".gitignore"
  ],
  "urls": [
    "/sitemap.xml",
    "/ru/sitemap.xml",
    "/feed.xml"
  ],
  "changes": [
    "Причина одинакового lastmod 18.11: дата последнего коммита файла, а сквозные коммиты (навигация, футер, подпись проверяющего) трогали все страницы.",
    "lastmod теперь — дата последнего изменения видимого текста внутри <main>, без разметки, ссылок, хлебных крошек, CTA, блока проверяющего и связанных материалов. Без такой даты <lastmod> не выводится (раньше подставлялось время деплоя)."
  ],
  "evidence": [
    "Production 19.11 после второго деплоя: /sitemap.xml и /ru/sitemap.xml по 172 URL, у всех lastmod, даты распределены (18.11: 53, 17.11: 31, 15.11: 20, 02.10: 11–12, 19.11: 7). Первый деплой показал 60 URL с 19.11 из-за удаления редакционных дат — исправлено (штампы дат не считаются изменением).",
    "test/lastmod.test.js: отпечаток не меняется от ссылок/разметки/сквозных блоков; коммит только с CTA-ссылками не двигает дату (реальная история /agent).",
    "Локальная генерация: 348 страниц, даты распределены (18.11: 108, 15.10: 102, 17.11: 64, 15.11: 44 …) вместо одной."
  ],
  "limits": [
    "Не опубликовано; lastmod.json создаётся на сервере при деплое (scripts/deploy-production.sh).",
    "Блоки, подставляемые сервером из src (профили лиг, календарь трансферов), в дате не учитываются."
  ],
  "next_step": "После деплоя открыть /sitemap.xml и сверить несколько дат с историей страниц."
},
{
  "id": "AUDIT-P1-EDITORIAL-DATES-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "~120 EN/RU страниц в public/en и public/ru",
    "test/editorial-dates.test.js"
  ],
  "urls": [
    "/guides/*",
    "/ru/guides/*",
    "/leagues/*",
    "/ru/ligi/*"
  ],
  "changes": [
    "Убраны видимые даты добавления/редакционной правки: «· updated/обновлено …» в кикерах, «Updated 18 November 2026.», «Updated: July 2026», «Дата обновления», «Editorial review/Редакционная проверка», «Editorial update/Редакционное обновление», даты в подписи автора и в блоках «Как цитировать».",
    "Оставлены даты проверки фактов (checked/verified/проверено …), сезоны, даты документов-источников и schema.org dateModified. Формулировки, ссылавшиеся на «editorial update», переписаны без даты правки."
  ],
  "evidence": [
    "Production 19.11: /guides/hockey-agent-in-denmark и /ru/guides/hokkejnyj-agent-v-shvejcarii без «updated/обновлено …».",
    "test/editorial-dates.test.js: запрещённые шаблоны на всех EN/RU страницах, контроль сохранения дат проверки.",
    "npm test зелёный."
  ],
  "limits": [
    "Не опубликовано. «Сравнение составлено: дата» и «версия методологии от июля 2026» оставлены как даты данных/версии документа — решение владельца, если их тоже скрыть."
  ],
  "next_step": "После деплоя выборочно открыть 5 страниц EN/RU и убедиться, что дат правки нет."
},
{
  "id": "AUDIT-P1-ACADEMIES-NA-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/en/guides/hockey-academies-in-north-america.html",
    "public/ru/guides/hokkejnye-akademii-severnoj-ameriki.html",
    "test/academies-guide.test.js",
    "docs/north-america-hockey-academies-factcheck.md"
  ],
  "urls": [
    "/guides/hockey-academies-in-north-america",
    "/ru/guides/hokkejnye-akademii-severnoj-ameriki"
  ],
  "changes": [
    "Один блок цен: дублирующий раздел цен prep-школ удалён, цены CIHA/OHA только в таблице (OHA перенесена в таблицу со своей датой проверки).",
    "NTDP: текст, видимый FAQ и FAQPage JSON-LD дают один ответ — игроков отбирают, а не зачисляют за плату; бесплатность не утверждается, стоимость уточнять в USA Hockey.",
    "Shattuck: $73 000 / $65 000 + $11 000 подтверждены на странице школы 19.11.2026."
  ],
  "evidence": [
    "Production 19.11: одна таблица цен, раздела-дубля нет, NTDP не называется бесплатной.",
    "test/academies-guide.test.js (3 теста).",
    "WebFetch s-sm.org/admissions/affording-ssm и usahockeyntdp.com/faq 19.11.2026; запись в docs/north-america-hockey-academies-factcheck.md."
  ],
  "limits": [
    "Не опубликовано. Остальные цены таблицы повторно не проверялись (сохраняют свои даты)."
  ],
  "next_step": "При следующем обзоре — повторная проверка Kent, Culver, Tabor, Berkshire, CIHA на 2027/28."
},
{
  "id": "AUDIT-P1-ROUTES-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "src/app.js",
    "test/app.test.js",
    "test/agent-profile.test.js"
  ],
  "urls": [
    "/index.html",
    "/ru/index.html",
    "/ru",
    "/404",
    "/ru/404",
    "/leagues",
    "/ru/ligi"
  ],
  "changes": [
    "301: /index.html → /, /ru/index.html → /ru/, /ru → /ru/ (query сохраняется), /<страница>.html → /<страница>. Файлы подтверждения Google/Яндекс не затронуты.",
    "/404 и /ru/404 отвечают статусом 404 (раньше 200 + noindex).",
    "/leagues и /ru/ligi оставлены 404: нет внутренних ссылок и нет показов в Search Console — основания для хаба или редиректа нет."
  ],
  "evidence": [
    "Production 19.11: /index.html → /, /ru/index.html и /ru → /ru/ (query сохраняется), /services.html → /services; /404, /ru/404, /leagues, /ru/ligi, неизвестный путь → 404.",
    "test/app.test.js «routes: one URL per page, real 404s, no invented hubs».",
    "Проверка отрисованных EN/RU страниц: внутренних ссылок на /ru без слэша и на .html нет. GSC: 0 строк по этим URL."
  ],
  "limits": [
    "Не опубликовано. Если Caddy когда-либо будет обслуживать эти пути сам, правило нужно продублировать там."
  ],
  "next_step": "После деплоя: curl -I для 7 URL на production."
},
{
  "id": "AUDIT-P2-FONTS-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/styles.css",
    "public/assets/fonts/*",
    "src/app.js",
    "test/app.test.js"
  ],
  "urls": [
    "все страницы"
  ],
  "changes": [
    "Manrope и Oswald — вариативные шрифты (ось wght 200–800 и 400–700, проверено fontTools). Вместо 24 @font-face и 24 файлов (байт-в-байт дубли по весам) — 6 правил с диапазонами весов и 6 файлов. Preload указывает на новые файлы."
  ],
  "evidence": [
    "Production 19.11: в styles.css 6 @font-face, preload oswald-latin и manrope-latin.",
    "test/app.test.js: нет одинаковых файлов шрифтов, 6 @font-face с диапазоном весов, все url существуют.",
    "Размер папки шрифтов: ~456 KB → ~108 KB; браузер больше не скачивает один и тот же файл под разными URL для разных весов."
  ],
  "limits": [
    "Не опубликовано. Визуальная проверка начертаний в браузере не проводилась; отображение должно совпасть, так как файлы те же."
  ],
  "next_step": "После деплоя: вкладка Network на главной EN/RU — по одному файлу на семейство и подмножество."
},
{
  "id": "AUDIT-P2-LCP-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/styles.css",
    "test/app.test.js",
    "docs/performance-lcp-fonts.md"
  ],
  "urls": [
    "/",
    "/ru/"
  ],
  "changes": [
    "Причина задержки LCP: текст hero начинался с opacity:0 (и clip-path) и появлялся анимацией с задержками; LCP приходился на поздно проявленный абзац или на маленький логотип «EHA». Анимация теперь только сдвигает текст и не скрывает его."
  ],
  "evidence": [
    "Production 19.11: styles.css без opacity в keyframes hero-in. Замер PageSpeed на production не выполнен (API 429) — лабораторные цифры только локальные.",
    "Lighthouse 13.6, mobile, devtools-throttling, локально: LCP до 2,92–3,23 с (5 прогонов), после 1,87–1,97 с (3 прогона); LCP = FCP.",
    "test/app.test.js: в keyframes hero-in нет opacity/clip-path."
  ],
  "limits": [
    "Production не замерен: прокси контейнера 403, PageSpeed API 429. Полевых данных CrUX нет. Дальнейший выигрыш — критический CSS (решение отдельно). Не опубликовано."
  ],
  "next_step": "После деплоя: PageSpeed Insights mobile 3 прогона на главной EN/RU."
},
{
  "id": "AUDIT-P2-A11Y-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/styles.css",
    "public/site.js",
    "274 EN/RU страницы (футер, переключатель языка)",
    "test/accessibility.test.js"
  ],
  "urls": [
    "все страницы"
  ],
  "changes": [
    "Контраст: белый текст на кнопках с заливкой — более тёмный оттенок фирменного синего #0b6fd6 (4,9:1, hover #0a5cc0); кнопка WhatsApp #0f7a40 (5,4:1). Раньше 3,5:1 и 2,6:1.",
    "Порядок заголовков: h4 в футере → h2.footer-heading (вид прежний).",
    "Переключатель языка и кнопка WhatsApp: доступное имя содержит видимый текст (EN/RU/WA)."
  ],
  "evidence": [
    "Production 19.11: новые цвета кнопок в styles.css, заголовки футера h2. Lighthouse a11y на production не запускался (нет доступа из контейнера).",
    "Lighthouse a11y mobile, локально: /, /ru/, /contact, /ru/contact, гайд, лига — 95 → 100.",
    "Puppeteer 320 и 390 px: нет горизонтальной прокрутки; цели в меню (открытом) и футере проходят WCAG 2.2 2.5.8 (24 px или исключение по отступу); Tab по /contact — видимый outline у каждого элемента.",
    "test/accessibility.test.js."
  ],
  "limits": [
    "Не опубликовано. Цвет кнопок немного темнее фирменного — согласовать с владельцем при желании оставить #1687ff (тогда нужен тёмный текст). Скринридером вручную не проверялось."
  ],
  "next_step": "После деплоя: Lighthouse a11y на production для 4 страниц."
},
{
  "id": "AUDIT-P2-DATA-DUP-CH-DEADLINE-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "src/deadlines.js",
    "src/league-profiles.js",
    "src/transfer-calendar.js",
    "src/app.js",
    "public/en/leagues/switzerland-national-league.html",
    "public/ru/ligi/shvejcariya-national-league.html",
    "test/deadlines.test.js",
    "docs/data-duplication.md"
  ],
  "urls": [
    "/leagues/switzerland-national-league",
    "/ru/ligi/shvejcariya-national-league",
    "/guides/transfer-calendar-2026-27",
    "/ru/guides/kalendar-transfernyh-okon-2026-27"
  ],
  "changes": [
    "Срок переходов Swiss National League 2026/27 (иностранцы 15.02.2027 24:00, швейцарцы 01.02.2027 24:00) перепроверен по Weisungen 1.3.2 и вынесен в одну запись src/deadlines.js; профиль лиги, календарь трансферов и meta страниц берут дату оттуда.",
    "Правила с другой областью действия (окна SIHF, период IIHF) оставлены отдельно."
  ],
  "evidence": [
    "Production 19.11: страница Swiss NL без токенов, meta содержит «deadline 15 February 2027» из общего источника.",
    "test/deadlines.test.js: изменение записи в дочернем процессе меняет все потребители, старой даты не остаётся.",
    "Отрисовка EN/RU страниц лиги и календаря: токенов не осталось, даты корректны."
  ],
  "limits": [
    "Не опубликовано. Таблица /open-hockey-leagues-for-imports и сроки PHL/DEL2 — следующие кандидаты (docs/data-duplication.md), не менялись."
  ],
  "next_step": "После проверки этой связки на production — перевести сроки PHL и DEL2 и таблицу открытых лиг на общий источник."
},
{
  "id": "AUDIT-P2-FAQ-HOWTO-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "public/en/guides/how-to-verify-a-hockey-club-offer.html",
    "public/ru/guides/kak-proverit-predlozhenie-hokkejnogo-kluba.html",
    "public/en/guides/hockey-player-salaries-in-europe.html",
    "public/ru/guides/zarplaty-hokkeistov-v-evrope.html",
    "test/structured-data-visible.test.js"
  ],
  "urls": [
    "/guides/how-to-verify-a-hockey-club-offer",
    "/ru/guides/kak-proverit-predlozhenie-hokkejnogo-kluba"
  ],
  "changes": [
    "Документация Google (май 2026): FAQ rich results больше не показываются, разметка FAQPage остаётся допустимой; HowTo rich results сняты в 2023. Массового удаления разметки нет — оснований нет.",
    "Сверка разметки с видимым текстом: 1 198 вопросов FAQPage на 272 страницах (1 284 на 296 после серверной отрисовки) совпадают. HowTo в гайде проверки предложения EN/RU называл шаги иначе, чем видимый чек-лист — шаги разметки приведены к видимым пунктам."
  ],
  "evidence": [
    "Production 19.11: HowTo на /guides/how-to-verify-a-hockey-club-offer со шагами «Club and contact» …",
    "test/structured-data-visible.test.js: каждый вопрос/ответ FAQPage и каждый шаг HowTo присутствует в видимом тексте.",
    "Проверка отрисованных локальным сервером 344 страниц: 0 расхождений."
  ],
  "limits": [
    "Не опубликовано. Расширенные сниппеты как результат не оцениваются (их нет по решению Google)."
  ],
  "next_step": "После деплоя — выборочно Schema Markup Validator для двух HowTo-страниц."
},
{
  "id": "SEO-GEO-CALENDAR-COMPARISONS-SYMMETRY-20261119",
  "status": "published_verified",
  "date": "2026-11-19",
  "files": [
    "src/transfer-calendar.js",
    "public/assets/transfer-calendar.js",
    "public/styles.css",
    "src/app.js",
    "public/en/guides/transfer-calendar-2026-27.html",
    "public/ru/guides/kalendar-transfernyh-okon-2026-27.html",
    "public/en/guides/alps-hockey-league-vs-oberliga.html",
    "public/ru/guides/alps-hockey-league-ili-oberliga.html",
    "58 EN/RU страниц (переключатель языка)",
    "test/transfer-calendar.test.js",
    "test/blog-week1.test.js",
    "docs/seo-geo-2026-11-19.md",
    "PROJECT_STATUS.md"
  ],
  "urls": [
    "/guides/transfer-calendar-2026-27",
    "/ru/guides/kalendar-transfernyh-okon-2026-27",
    "/guides/alps-hockey-league-vs-oberliga",
    "/ru/guides/alps-hockey-league-ili-oberliga"
  ],
  "changes": [
    "Проверено и уже было на сайте: «Three free tools»/«Три бесплатных инструмента» — 3 карточки, 3 рабочие ссылки; «For parents»/«Родителям» в футере ведут на рабочие страницы (production 19.11).",
    "Календарь: фильтры месяца дедлайна и «Открыто сейчас», быстрые «Январь»/«Февраль»/«Открыто сейчас», сброс, пустое состояние EN/RU, синхронизация с URL без влияния на canonical/sitemap; окна windows только по источнику; «Дата не найдена в опубликованных источниках» отдельно от «Окно закрыто»; колонка сезона; ссылки на гайды стран, лиги и IIHF. Охват: 28 стран, 10 с подтверждёнными сроками + окно IIHF.",
    "Сравнения: AlpsHL vs Oberliga доработана (10 критериев с метками официально/пресса/оценка EHA, выбор по возрасту/лиге/роли/цели, родительский CTA, ссылки на справочник и календарь, FAQ о лимите U23); PHL vs Ligue Magnus и Hockeyettan vs Mestis — оставить; USPHL Premier vs European U20 — отложено (разные системы U20). Спрос по сравнительным запросам в GSC не найден — редакционные гипотезы.",
    "Языковая симметрия: 44 пары — все есть, 200, canonical, взаимный hreflang, x-default (EN), sitemap; переключатель языка на 58 страницах переведён с жёсткого production-URL на {{ALT_URL}}, 158 переключателям добавлены hreflang/lang."
  ],
  "evidence": [
    "Production 19.11 после Merge PR #12 и #13 (деплой ce8d0e2 успешен): календарь EN — 41 строка, ?month=1 → 6, «Открыто сейчас» → 4 (IIHF, ČSLH, SIF, SIHF), сброс → 41, скрипт версионирован, canonical без параметров, в sitemap нет URL с параметрами; RU — подписи и пустое состояние для Финляндия+январь; AlpsHL/Oberliga EN/RU — 10 критериев, родительский CTA, новый FAQ; переключатели языка с hreflang/lang.",
    "test/transfer-calendar.test.js (10 тестов): HTML до JS, охват, январь/февраль, 31 декабря, граница закрытия, непроверенная дата, пустая выдача, юниоры/взрослые, статусы, RU, структура пары AlpsHL/Oberliga.",
    "Puppeteer 320/390 px: фильтры, чипы 44 px, без горизонтальной прокрутки, сброс, URL-параметры, пустое состояние RU, 41 строка без JS.",
    "npm test зелёный; проверка FAQ/HowTo против видимого текста — 0 расхождений."
  ],
  "limits": [
    "Не опубликовано: изменения в Pull Request, публикация после Merge владельцем. «Открыто сейчас» на сервере считается по дате Europe/Zurich, в браузере — по дате посетителя."
  ],
  "next_step": "После Merge: проверить на production фильтры, пару AlpsHL/Oberliga и переключатели; через 4 недели — GSC по сравнениям."
},
{
  "id": "AUDIT-RECHECK-PRODUCTION-20261120",
  "status": "published_verified",
  "date": "2026-11-20",
  "files": [],
  "urls": [
    "/index.html",
    "/ru/index.html",
    "/ru",
    "/404",
    "/ru/404",
    "/leagues",
    "/ru/ligi",
    "/api/applications/<ref>/pdf",
    "/sitemap.xml",
    "/styles.css",
    "/contact",
    "/ru/contact"
  ],
  "changes": [
    "Повторная проверка пакета аудита 19.11 на production (браузер владельца, fetch с того же origin, синтетический номер заявки и синтетический токен)."
  ],
  "evidence": [
    "Маршруты (п.13): /index.html → /, /ru/index.html и /ru → /ru/ (одна переадресация), /contact.html?a=1 → /contact?a=1; /404, /ru/404, неизвестный путь, /leagues, /ru/ligi — HTTP 404.",
    "PDF (п.2): GET …/pdf?token=<синтетический> → 410, Cache-Control no-store; POST с неверным токеном → 404, private, no-store.",
    "Шрифты (п.14): 6 @font-face в styles.css, по одному woff2 на семейство и набор.",
    "Sitemap (п.10): 172 URL, у всех lastmod, есть xhtml:link. Выявлена регрессия: 30 URL получили 20.11 из-за CTA-блоков и смены подписи автора — исправлено в AUDIT-RECHECK-LASTMOD-20261120.",
    "Вебвизор (п.3): форма заявки на production с классами ym-hide-content ym-disable-keys; tag.js Метрики грузится только после согласия (PR #18)."
  ],
  "limits": [
    "Записи AUDIT-…-20261119 со статусом published_verified содержат в limits устаревшую фразу «Не опубликовано» — история не переписывается, актуальное состояние в этой записи.",
    "Логи Caddy/journald и записи Вебвизора в интерфейсе Метрики не проверялись (нет доступа к серверу и счётчику)."
  ],
  "next_step": "Владелец: шаги docs/owner-token-runbook.md и docs/webvisor-check.md."
},
{
  "id": "AUDIT-RECHECK-LASTMOD-20261120",
  "status": "published_verified",
  "date": "2026-11-20",
  "files": [
    "scripts/generate-lastmod.js",
    "test/lastmod.test.js"
  ],
  "urls": [
    "/sitemap.xml",
    "/ru/sitemap.xml"
  ],
  "changes": [
    "agent-callout (CTA «Hockey agent in X», «проверка уровня») добавлен в сквозные блоки; формулировки подписи автора (Reviewed by/By, Проверено/Проверил/Автор:) не считаются содержанием.",
    "Из 61 EN/RU страницы, изменённой 20.11, дату меняют только 16 с содержательной правкой (H1 главной и услуг, кейсы, подпись к «100+», анкета, подписи цифр, раскрытие родства в гайде США)."
  ],
  "evidence": [
    "Production 21.11 после деплоя f1a8b6b: /guides/hockey-in-germany lastmod 2026-11-18 (было 2026-11-20), /guides/hockey-player-salaries-in-europe 2026-11-19; дату 2026-11-20 сохраняют 8 EN URL с содержательной правкой.",
    "node --test test/lastmod.test.js — новый тест: CTA-блок и смена подписи не меняют отпечаток, изменение текста меняет.",
    "Сравнение отпечатков 9fbb318 → HEAD по всем изменённым файлам."
  ],
  "limits": [
    "Не опубликовано: PR ждёт разрешения владельца на деплой. lastmod.json пересчитывается на сервере при деплое."
  ],
  "next_step": "После деплоя: /sitemap.xml — у CTA-страниц (например /guides/hockey-in-germany) дата не 2026-11-20."
},
{
  "id": "AUDIT-RECHECK-A11Y-320-20261120",
  "status": "published_verified",
  "date": "2026-11-20",
  "files": [
    "public/styles.css"
  ],
  "urls": [
    "/agent",
    "/ru/agent",
    "/cases",
    "/ru/cases",
    "/ru/guides/dokumenty-nesovershennoletnego-hokkeista-i-transfer-iihf",
    "/ru/ligi/finlyandiya-yuniorskij-hokkej"
  ],
  "changes": [
    "На 320 px страницы прокручивались вбок (существовало до 20.11): колонки сеток по длине длинных слов, flex-summary FAQ. Мобильные сетки — minmax(0,1fr), длинные заголовки и вопросы FAQ переносятся."
  ],
  "evidence": [
    "Production 21.11 после деплоя f1a8b6b, окно 320 px: /cases и /ru/agent — scrollWidth 320 = ширине окна; styles.css содержит новые правила.",
    "Playwright: 344 URL из sitemap EN/RU на 320 и 390 px — scrollWidth не больше ширины.",
    "Lighthouse (локально, mobile) a11y 100: /, /contact, /ru/contact, /agent, /guides/hockey-in-germany, /cases; фокус ссылок футера — outline 2px."
  ],
  "limits": [
    "Не опубликовано. Lighthouse — локальный лабораторный замер без сторонних скриптов."
  ],
  "next_step": "После деплоя: открыть /ru/agent и /cases на телефоне 320–390 px."
},
{
  "id": "AUDIT-RECHECK-LCP-20261120",
  "status": "saved",
  "date": "2026-11-20",
  "files": [],
  "urls": [
    "/"
  ],
  "changes": [
    "Сравнение главной до правок 20.11 (9fbb318) и после: Lighthouse mobile, 3 прогона на одной машине."
  ],
  "evidence": [
    "До: LCP 2126/2111/2122 мс, элемент p.lead. После: 2117/2124/2257 мс, элемент — span H1. Ухудшения нет."
  ],
  "limits": [
    "Лабораторный локальный замер без сетевых сторонних скриптов (заблокированы в контейнере); полевых данных CrUX нет; PageSpeed API production недоступен из контейнера."
  ],
  "next_step": "Владелец: PageSpeed Insights mobile 3 прогона на production EN/RU."
},
{
  "id": "AUDIT-RECHECK-RETENTION-20261120",
  "status": "blocked",
  "date": "2026-11-20",
  "files": [
    "supabase/functions/cleanup-applications/cleanup.mjs",
    "docs/retention-runbook.md"
  ],
  "urls": [
    "/admin"
  ],
  "changes": [
    "Повторно проверено: защита new в репозитории на месте (node --test test/cleanup-retention.test.js — 5/5: граница 12 месяцев, статусы, файлы, dry-run, повторный запуск, удаление после решения владельца)."
  ],
  "evidence": [
    "Supabase-коннектор этой сессии видит только проект kkxugkmpugwwndxsevdy; рабочая база сайта по документации — lvcrutflxscynaewkcno. Состояние pg_cron, развёрнутой функции и очереди new на production не проверено."
  ],
  "limits": [
    "Деплой Edge Function, резервная копия и dry-run — только с разрешения владельца и с доступом к проекту lvcrutflxscynaewkcno. Ближайшая дата риска при старой функции — прогон 24.07.2027 03:17 UTC."
  ],
  "next_step": "Владелец: подключить коннектор к проекту сайта или выполнить docs/retention-runbook.md (бэкап → проверка восстановления → deploy → dry-run)."
}
,
{
  "id": "META-AUDIT-20261121",
  "status": "published_verified",
  "date": "2026-11-21",
  "files": [
    "public/ru/zaprosy-klubov.html",
    "public/en/club-needs.html",
    "public/en/open-hockey-leagues-for-imports.html",
    "public/ru/otkrytye-ligi-dlya-legionerov.html",
    "public/en/guides/hockey-in-{denmark,norway,slovakia,france,united-kingdom,usa}.html",
    "public/ru/guides/hokkej-v-{norvegii,slovakii}.html",
    "public/ru/guides/hokkej-vo-francii.html",
    "src/guide-index.js",
    "public/en/leagues/*.html (Hockey in the United Kingdom/States)"
  ],
  "urls": [
    "/ru/zaprosy-klubov",
    "/club-needs",
    "/open-hockey-leagues-for-imports",
    "/ru/otkrytye-ligi-dlya-legionerov",
    "/guides/hockey-in-denmark",
    "/guides/hockey-in-norway",
    "/guides/hockey-in-slovakia",
    "/guides/hockey-in-france",
    "/guides/hockey-in-united-kingdom",
    "/guides/hockey-in-usa",
    "/ru/guides/hokkej-v-norvegii",
    "/ru/guides/hokkej-v-slovakii",
    "/ru/guides/hokkej-vo-francii"
  ],
  "changes": [
    "Аудит 350 индексируемых URL из sitemap EN/RU/DE/CS/FI/SV (локальный рендер через Express): пустых title/description, дублей title, неверного регистра и устаревших сезонов в метаданных не найдено; H1 по одному на всех страницах.",
    "/ru/zaprosy-klubov и /club-needs: убран повтор «Запросы клубов: … запросы»; description больше не утверждает, что позиции на текущий сезон есть (список пуст), а объясняет, что игрок увидит в открытом запросе и как отправить профиль. Title опубликован = исходнику; заголовок в выдаче Google проверить нельзя: у страницы 0 показов в GSC.",
    "Открытые лиги EN/RU: убрано обещание «realistic vacancy / реальной вакансией» (страница не публикует вакансии).",
    "Шаблонные почти-дубли description (Hockey in X: senior and junior leagues…) заменены на конкретные для DK, NO, SK, FR, UK EN и NO, SK, FR RU. «Hockey in United Kingdom/States» → «the United Kingdom/States»."
  ],
  "evidence": [
    "GSC (EHA CONTROL, 21.10–18.11.2026, страницы): приоритет по показам; «бесплатно» и «48 часов» оставлены — подтверждены BRAND.md и FAQ /services.",
    "test/meta-length.test.js, test/country-intents.test.js (title/description клубных запросов).", "Production 22.11.2026 после деплоя PR #27 (GitHub Actions success, main dc4f258): страницы 200, один H1, canonical и 5 hreflang, JSON-LD на месте; title/description совпадают с сохранёнными; 28 ссылок-намерений каталога ведут на 200 и существующие якоря; /cases EN/RU — 39 блоков case-story; блоки права на работу Польши и Словакии видны EN/RU; форма подписки не показывается, API подписки отвечает 503."
  ],
  "limits": [
    "Страница с наибольшими показами (/guides/hockey-player-salaries-in-europe, 8169 показов, CTR 0,9%) не имеет дефекта метаданных; её CTR — отдельная задача."
  ],
  "next_step": "Через 3–4 недели сравнить CTR изменённых URL в GSC."
},
{
  "id": "COUNTRY-CATALOG-INTENTS-20261121",
  "status": "published_verified",
  "date": "2026-11-21",
  "files": [
    "public/ru/hokkejnye-strany.html",
    "public/en/hockey-countries.html",
    "public/ru/guides/hokkej-v-{polshe,chexii,slovakii,germanii,avstrii,finlyandii,shvecii}.html",
    "public/en/guides/hockey-in-{poland,czechia,slovakia,germany,austria,finland,sweden}.html",
    "public/styles.css",
    "docs/country-pages-factcheck.md"
  ],
  "urls": [
    "/ru/hokkejnye-strany",
    "/hockey-countries",
    "/ru/guides/hokkej-v-polshe",
    "/guides/hockey-in-poland"
  ],
  "changes": [
    "Карточки PL, CZ, SK, DE, AT, FI, SE: «Кому подходит» и четыре ссылки по намерениям — как уехать (гид страны), правила легионеров 2026/27 (#import-rules страницы лиги с профилем или раздела гида), зарплаты и условия, виза и право на работу. Якоря добавлены к существующим разделам гидов. CTA «Получить оценку» передаёт country и source_page.",
    "Пилот Польша: в раздел «Трансфер, регистрация, виза и работа» EN/RU добавлен блок о праве на работу по государственным источникам (Dz.U. 2025 поз. 1620: исключение для спортсменов только 30 дней в году; oświadczenie для граждан Армении, Беларуси, Молдовы, Украины до 24 месяцев, Грузия исключена с 1.12.2025; Карта поляка; подача через praca.gov.pl). Проверено 21.11.2026."
  ],
  "evidence": [
    "GSC 23.08–18.11.2026: по 7 странам спрос в основном «чемпионат X по хоккею» и названия лиг; запросов про визу, зарплату и переезд почти нет — четыре намерения помечены как редакционная гипотеза.",
    "test/country-intents.test.js: 7×4 ссылки EN и RU, каждая страница 200 и каждый якорь существует.", "Production 22.11.2026 после деплоя PR #27 (GitHub Actions success, main dc4f258): страницы 200, один H1, canonical и 5 hreflang, JSON-LD на месте; title/description совпадают с сохранёнными; 28 ссылок-намерений каталога ведут на 200 и существующие якоря; /cases EN/RU — 39 блоков case-story; блоки права на работу Польши и Словакии видны EN/RU; форма подписки не показывается, API подписки отвечает 503."
  ],
  "limits": [
    "Польша: все факты подтверждены прямым чтением официальных страниц (Dz.U. 2025 поз. 1620 на gov.pl, Zielona Linia); сайт воеводства из источников убран. Словакия: добавлен блок о праве на работу по закону 5/2004 (ред. с 1.08.2026) и перечню МВД (июль 2025); срок пребывания и 90-дневное исключение не публиковались — не прочитаны напрямую. Швеция: отдельной страницы лиги с проверенным лимитом нет — ссылка на раздел гида о регистрации и home-grown."
  ],
  "next_step": "При спросе — профили лиг для Hockeyettan и Maxa liga; для Словакии прочитать § 23 закона 404/2011 и добавить срок пребывания."
},
{
  "id": "CLUB-NEEDS-TELEGRAM-SUBSCRIPTION-20261121",
  "status": "saved",
  "date": "2026-11-21",
  "files": [
    "src/club-needs-subscriptions.js",
    "src/club-needs.js",
    "src/club-needs-data.js",
    "src/app.js",
    "src/config.js",
    ".env.example",
    "public/assets/club-needs-subscribe.js",
    "public/styles.css",
    "scripts/notify-club-needs.js",
    "docs/club-needs-process.md",
    "test/club-needs-subscriptions.test.js",
    "supabase/migrations/20261121120000_club_need_subscriptions.sql (отдельная ветка db/club-need-subscriptions, не в main)"
  ],
  "urls": [
    "/ru/zaprosy-klubov",
    "/club-needs",
    "/api/club-needs/subscribe",
    "/api/club-needs/unsubscribe",
    "/api/telegram/club-needs-webhook"
  ],
  "changes": [
    "Существующий бот TELEGRAM_BOT_TOKEN шлёт уведомления только агенту, вебхука нет; подтверждённые запросы берутся из src/club-needs-data.js (сейчас пусто). Подписка сделана на отдельном боте: форма (позиция, год рождения, Elite Prospects, согласие) → одноразовая ссылка t.me/<bot>?start=<token> (30 мин, в базе только SHA-256) → вебхук с секретом активирует подписку; /stop и подписанная HMAC ссылка отписки прекращают доставку.",
    "Рассылка scripts/notify-club-needs.js: только открытые опубликованные запросы, совпадение позиции (F = C/W/LW/RW) и года рождения при заданном birthYears; доставка сначала фиксируется (unique subscription+need), повторный запуск не дублирует.",
    "Форма скрыта, API отвечает 503, пока не заданы CLUB_NEEDS_SUBSCRIPTIONS=on, TELEGRAM_SUBSCRIBER_BOT_TOKEN/USERNAME/WEBHOOK_SECRET и Supabase."
  ],
  "evidence": [
    "test/club-needs-subscriptions.test.js (9/9, память + поддельный Telegram): выключенное состояние, русские ошибки валидации, подтверждение и одноразовость токена, просроченная ссылка, неверный секрет вебхука, одна активная подписка на чат и позицию, доставка только подходящим, без дублей при повторе, /stop и отписка по ссылке, подделка ссылки отклоняется.", "Production 22.11.2026: код выложен, форма скрыта, POST /api/club-needs/subscribe → 503 (выключено, как задумано). Статус остаётся saved до запуска бота и миграции."
  ],
  "limits": [
    "Не запускалось с реальным ботом и базой. Миграция не применена: для production нужна явная команда владельца. Таблицу не чистит cleanup-applications (сроки заданы retention_until)."
  ],
  "next_step": "Владелец: создать бота игроков, применить миграцию из ветки db/club-need-subscriptions, задать переменные и setWebhook по docs/club-needs-process.md, проверить на своём аккаунте; затем CLUB_NEEDS_SUBSCRIPTIONS=on."
},
{
  "id": "CASES-STRUCTURE-20261121",
  "status": "published_verified",
  "date": "2026-11-21",
  "files": [
    "src/cases-data.js",
    "scripts/build-cases.js",
    "public/ru/cases.html",
    "public/en/cases.html",
    "public/styles.css",
    "test/case-stories.test.js"
  ],
  "urls": [
    "/ru/cases",
    "/cases"
  ],
  "changes": [
    "В каждую из 39 карточек EN/RU добавлен блок из data (маркер CASE_STORY, генерирует scripts/build-cases.js). «Итог» — по статусу источника: история Elite Prospects (без утверждения просмотр/контракт/регистрация), объявление клуба о подписании, ожидает подтверждения.",
    "Исходная точка, задача и работа EHA заполнены только для Семёна и Матвея Морщёнков (маршрут по EP, подтверждение агентства, раскрытие родства); для остальных — «не опубликованы»."
  ],
  "evidence": [
    "test/case-stories.test.js: у каждого кейса есть итог, набор полей EN = RU, «Работа EHA» только при подтверждённых данных, ожидающие помечены.", "Production 22.11.2026 после деплоя PR #27 (GitHub Actions success, main dc4f258): страницы 200, один H1, canonical и 5 hreflang, JSON-LD на месте; title/description совпадают с сохранёнными; 28 ссылок-намерений каталога ведут на 200 и существующие якоря; /cases EN/RU — 39 блоков case-story; блоки права на работу Польши и Словакии видны EN/RU; форма подписки не показывается, API подписки отвечает 503."
  ],
  "limits": [
    "Подтверждённых материалов агентства о работе по остальным 37 кейсам в репозитории нет; Elite Prospects не скрейпится."
  ],
  "next_step": "Владелец: по каждому кейсу дать исходную точку и конкретное действие EHA (письмо клубу, просмотр, переговоры, документы) — внести в story в src/cases-data.js."
},
{
  "id": "TECH-SEO-AUDIT-20261123",
  "status": "published_verified",
  "date": "2026-11-23",
  "files": [
    "src/locales.js",
    "src/app.js",
    "src/article-blocks.js",
    "public/**/*.html (breadcrumb nav aria-label, EHA_BYLINE in 227 articles)",
    "public/en/junior-hockey-leagues.html",
    "public/ru/yuniorskie-ligi-evropy.html",
    "public/en|ru services, for-players/players, hockey-in-usa/hokkej-v-ssha, hockey-in-belarus/hokkej-v-belarusi, after-u20 guides, age-pathway guides",
    "public/en|ru salaries hub and ICEHL/AlpsHL salaries guide",
    "public/en|ru season cost calculator",
    "country guide titles (EN 6, RU 5)",
    "public/styles.css",
    "test/hreflang-consistency.test.js",
    "test/agent-profile.test.js",
    "docs/seo-tech-audit-2026-11-23.md"
  ],
  "urls": [
    "/for-players",
    "/ru/players",
    "/sitemap.xml",
    "/ru/sitemap.xml",
    "/de/sitemap.xml",
    "/cs/sitemap.xml",
    "/fi/sitemap.xml",
    "/sv/sitemap.xml",
    "/services",
    "/ru/services",
    "/junior-hockey-leagues",
    "/ru/yuniorskie-ligi-evropy",
    "/junior-season-cost-calculator",
    "/ru/kalkulyator-stoimosti-sezona",
    "/guides/icehl-and-alps-hockey-league-salaries",
    "/ru/guides/zarplaty-icehl-i-alps-hockey-league"
  ],
  "changes": [
    "hreflang: 173 пары EN/RU без ошибок (200, self-canonical, взаимность, x-default=EN, переключатель, sitemap). Исправлено расхождение: de/cs/fi/sv-альтернативы были в HTML, но не в sitemap — генератор читает одну карту EXTRA_LOCALE_COUNTERPART.",
    "Глубокие страницы: глубина ≤3, сирот нет, барьеров robots/noindex нет. Добавлены тематические ссылки на USHL/NAHL, юниорские Австрии и Словакии, гид «После МХЛ и НМХЛ», 11+11 страниц «агент по стране» (блок на /services), целевой гид зарплат AlpsHL.",
    "Schema: Article получил image из og:image (306 страниц); хлебные крошки — nav с aria-label; подпись автора — общий компонент с фото на 227 страницах; убрано неподтверждённое «100+ игроков» из подписи.",
    "Пилот long-tail: «alpshl salary» (258 показов, 4 конкурирующих URL) — Title целевого гида с «AlpsHL», ссылка из хаба зарплат. Конкретные Title 11 гидов стран. «Следующий шаг» в калькуляторе бюджета EN/RU."
  ],
  "evidence": [
    "node /tmp audit scripts по локальному рендеру всех URL из sitemap; test/hreflang-consistency.test.js; npm test 343/343; GSC (EHA CONTROL) 23.08–20.11.2026: 57 URL без показов.",
    "Production 23.11.2026 (main 3b080dc, Deploy success): 200, self-canonical, один H1, валидный JSON-LD, hreflang de в кластере Германии и в sitemap, блок agent-by-country, подпись без «100+», nav-крошки, #next-step; lastmod не сдвинут.",
    "GSC «Страницы» (прочитано 23.11, данные 16.11): 284 в индексе, 210 нет; «Обнаружена, не проиндексирована» 30 — 22 гида «агент в стране», USHL и юниорские Австрии/Словакии EN/RU, гид после U20, 5 старых /blog. URL Inspection: «ссылающаяся страница не найдена». Запрошено индексирование 11 URL (список в docs/seo-tech-audit-2026-11-23.md, раздел 2a)."
  ],
  "limits": [
    "Данные GSC «Страницы» от 16.11.2026 — до деплоя PR #30; эффект ссылок проверять после пересканирования. Дневная квота запросов индексирования — около 10 URL.",
    "FAQPage валиден, но расширенный результат FAQ Google показывает только гос- и медсайтам; HowTo отключён Google."
  ],
  "next_step": "С 24.11 — вторая партия запросов индексирования (раздел 2a отчёта); проверить 3 soft 404 и старые /blog-слаги на 301; через 2–3 недели — показы 57 URL и запросов alpshl salary в GSC."
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
    },
    {
      "id": "U20-HREFLANG-RUNTIME",
      "status": "resolved",
      "task": "Проверить автоматические hreflang en/ru/x-default для новых страниц «После U20» после штатной перезагрузки eha.service.",
      "resolution": "2026-11-07: eha.service перезапущен в 22:34 CET. Обе страницы HTTP 200, self canonical и взаимные hreflang en/ru/x-default подтверждены в опубликованном HTML."
    }
  ],
  "proposed_next": [
{
  "id": "SEO-PRIORITY-REVIEW-20261114",
  "status": "proposed",
  "date": "2026-11-14",
  "task": "Следующий контентный пакет: повторная проверка и согласование существующего гайда академий Северной Америки EN/RU; не добавлять повторно уже существующие таблицу и бюджет.",
  "evidence": [
    "Свежий list_sites: sync 14 ноября, stored coverage до 12 ноября; live GSC final date query фактически вернул даты 16 октября — 11 ноября (27 дней).",
    "GSC 16 октября — 11 ноября: 799 кликов, 42002 показа. Равные предшествующие 27 дней 19 сентября — 15 октября: 582 клика, 31483 показа. Это описательная динамика, не доказательство влияния конкретных правок.",
    "Точечный page report: academies EN 1605 показов/13 кликов/CTR 0.81%; age pathway CHL-NCAA EN 951/1/0.11%; Mestis EN 662/0/0%.",
    "Прочитаны текущие EN шаблоны трёх кандидатов. Академии уже содержат сравнительную таблицу и бюджет: новую таблицу как отсутствующую не предлагать. Найдены повторяющиеся стоимостные блоки за разные годы, видимые редакционные даты и несогласованное FAQ NTDP (бесплатно / цена не подтверждена). Требуется повторная первичная проверка до изменения фактов.",
    "GA4 за тот же период: form_start=67, parent_cta_click=22, application_sent=17; это события, не 17 подтверждённых уникальных заявок CRM."
  ],
  "limits": [
    "Публичные страницы в этом аналитическом этапе не изменены.",
    "Официальные источники цен/правил в этом этапе повторно не проверялись; точные изменения требуют проверки EN/RU и источников.",
    "CTR общих лиг может отражать навигационный спрос на результаты/таблицы; низкий CTR сам по себе не доказывает плохой текст.",
    "Эффект Финляндии от 14 ноября не может присутствовать в периоде по 11 ноября."
  ],
  "next_step": "Проверить RU академии и первичные цены, устранить дубли/противоречия EN/RU, сохранить URL и SEO; затем QA. Второй кандидат — CHL/NCAA, третий — Mestis."
},
    {
      "order": 1,
      "status": "published_verified",
      "task": "Свежий аудит и доработка существующей страницы зарплат EN/RU: источники, соответствие запросам, первые ответы и связь с услугами EHA.",
      "completion_ref": "SALARY-SOURCES-EN-RU-20261106"
    },
    {
      "order": 2,
      "status": "published_verified",
      "task": "Улучшить существующий справочник европейских лиг: уровни, возраст, цели и путь к оценке EHA.",
      "completion_ref": "EUROPEAN-LEAGUES-ROUTES-20261107"
    },
    {
      "order": 3,
      "status": "published_verified",
      "task": "Новая статья EN/RU «После U20: переход во взрослый хоккей Европы». Сначала проверить дубли и обоснование темы. Спрос именно на тему пока не подтверждён.",
      "completion_ref": "AFTER-U20-GUIDE-20261107"
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
