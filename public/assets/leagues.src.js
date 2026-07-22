/* Bilingual source of truth for the European league reference. Build step
   (scripts/build-leagues.js) renders this into the runtime files
   assets/leagues.ru.js + assets/leagues.en.js and into the static table rows on
   /ligi-evropy (RU) and /european-leagues (EN). Edit here, then run:
     node scripts/build-leagues.js
   IMPORTANT: data is a guideline. Import limits and rules change season to
   season and must be verified for the current year. tier: 1 top division, 2
   second, 3 third. open: how realistic a spot is for an import — high|mid|low. */
window.EHA_LEAGUES_SRC = {
  updated: { ru: "июль 2026", en: "July 2026" },
  windowNote: {
    ru: "Основное окно комплектования — апрель–август; точечные усиления возможны по ходу сезона.",
    en: "The main roster-building window is April–August; targeted additions are possible during the season."
  },
  leagues: [
    { country: { ru: "Финляндия", en: "Finland" }, flag: "🇫🇮", name: "Liiga", tier: 1, open: "low", note: { ru: "Высший дивизион, элитный уровень", en: "Top division, elite level" }, imports: { ru: "Мест мало, берут только явное усиление", en: "Few spots; only clear upgrades are signed" } },
    { country: { ru: "Финляндия", en: "Finland" }, flag: "🇫🇮", name: "Mestis", tier: 2, open: "mid", note: { ru: "Второй дивизион, профессиональный", en: "Second division, professional" }, imports: { ru: "Требования мягче, чем в Liiga", en: "A lower bar than Liiga" } },
    { country: { ru: "Финляндия", en: "Finland" }, flag: "🇫🇮", name: "Suomi-sarja", tier: 3, open: "mid", note: { ru: "Третий уровень, полупрофессиональный", en: "Third level, semi-pro" }, imports: { ru: "Подходит для входа и адаптации", en: "Good for entry and adapting" } },

    { country: { ru: "Швеция", en: "Sweden" }, flag: "🇸🇪", name: "SHL", tier: 1, open: "low", note: { ru: "Один из сильнейших чемпионатов мира", en: "One of the strongest leagues in the world" }, imports: { ru: "Попадают единицы", en: "Only a handful of imports make it" } },
    { country: { ru: "Швеция", en: "Sweden" }, flag: "🇸🇪", name: "HockeyAllsvenskan", tier: 2, open: "low", note: { ru: "Второй дивизион, сильный и полностью профессиональный", en: "Second division, strong and fully professional" }, imports: { ru: "Конкуренция высокая", en: "Competition is high" } },
    { country: { ru: "Швеция", en: "Sweden" }, flag: "🇸🇪", name: "HockeyEttan", tier: 3, open: "mid", note: { ru: "Третий уровень, региональные группы", en: "Third level, regional groups" }, imports: { ru: "Реальная точка входа; паспорт ЕС решает многое", en: "A realistic entry point; an EU passport matters a lot" } },

    { country: { ru: "Чехия", en: "Czechia" }, flag: "🇨🇿", name: "Tipsport Extraliga", tier: 1, open: "mid", note: { ru: "Высший дивизион, один из сильнейших в Европе", en: "Top division, one of Europe's strongest" }, imports: { ru: "Легионерские места ограничены", en: "Import spots are limited" } },
    { country: { ru: "Чехия", en: "Czechia" }, flag: "🇨🇿", name: "Chance liga", tier: 2, open: "mid", note: { ru: "Второй дивизион, профессиональный", en: "Second division, professional" }, imports: { ru: "Частая точка входа для легионера", en: "A common entry point for imports" } },
    { country: { ru: "Чехия", en: "Czechia" }, flag: "🇨🇿", name: "2. liga", tier: 3, open: "mid", note: { ru: "Третий уровень, региональные группы", en: "Third level, regional groups" }, imports: { ru: "Вход и адаптация к рынку", en: "Entry and adapting to the market" } },

    { country: { ru: "Словакия", en: "Slovakia" }, flag: "🇸🇰", name: "Tipos extraliga", tier: 1, open: "mid", note: { ru: "Высший дивизион", en: "Top division" }, imports: { ru: "Легионеры есть, лимит по сезону", en: "Imports allowed, with a seasonal limit" } },
    { country: { ru: "Словакия", en: "Slovakia" }, flag: "🇸🇰", name: "1. liga", tier: 2, open: "high", note: { ru: "Второй дивизион", en: "Second division" }, imports: { ru: "Достаточно открыта для легионеров", en: "Fairly open to imports" } },

    { country: { ru: "Германия", en: "Germany" }, flag: "🇩🇪", name: "DEL", tier: 1, open: "mid", note: { ru: "Высший дивизион, сильные бюджеты", en: "Top division, strong budgets" }, imports: { ru: "Заметное число иностранцев, конкуренция высокая", en: "A notable number of foreigners; high competition" } },
    { country: { ru: "Германия", en: "Germany" }, flag: "🇩🇪", name: "DEL2", tier: 2, open: "mid", note: { ru: "Второй дивизион, профессиональный", en: "Second division, professional" }, imports: { ru: "Реальная точка входа", en: "A realistic entry point" } },
    { country: { ru: "Германия", en: "Germany" }, flag: "🇩🇪", name: "Oberliga", tier: 3, open: "high", note: { ru: "Третий уровень, группы Север и Юг", en: "Third level, North and South groups" }, imports: { ru: "Много команд — чаще всего появляются вакансии", en: "Many teams — openings appear most often here" } },

    { country: { ru: "Австрия", en: "Austria" }, flag: "🇦🇹", name: "ICE Hockey League", tier: 1, open: "mid", note: { ru: "Международный высший дивизион", en: "International top division" }, imports: { ru: "Легионеров много, но и уровень высокий", en: "Many imports, but the level is high" } },
    { country: { ru: "Австрия", en: "Austria" }, flag: "🇦🇹", name: "Alps Hockey League", tier: 2, open: "high", note: { ru: "Международная лига (Австрия, Италия, Словения)", en: "International league (Austria, Italy, Slovenia)" }, imports: { ru: "Открыта для иностранцев", en: "Open to foreigners" } },

    { country: { ru: "Польша", en: "Poland" }, flag: "🇵🇱", name: "PHL", tier: 1, open: "high", note: { ru: "Высший дивизион, растущий рынок", en: "Top division, a growing market" }, imports: { ru: "Клубы традиционно активно берут легионеров", en: "Clubs traditionally sign imports actively" } },
    { country: { ru: "Польша", en: "Poland" }, flag: "🇵🇱", name: "1 liga", tier: 2, open: "high", note: { ru: "Второй дивизион", en: "Second division" }, imports: { ru: "Вход и адаптация", en: "Entry and adapting" } },

    { country: { ru: "Норвегия", en: "Norway" }, flag: "🇳🇴", name: "Eliteserien", tier: 1, open: "mid", note: { ru: "Высший дивизион", en: "Top division" }, imports: { ru: "Лимит на легионеров", en: "An import limit applies" } },
    { country: { ru: "Норвегия", en: "Norway" }, flag: "🇳🇴", name: "1. divisjon", tier: 2, open: "high", note: { ru: "Второй дивизион", en: "Second division" }, imports: { ru: "Более доступный вход", en: "A more accessible entry" } },

    { country: { ru: "Дания", en: "Denmark" }, flag: "🇩🇰", name: "Metal Ligaen", tier: 1, open: "mid", note: { ru: "Высший дивизион", en: "Top division" }, imports: { ru: "Легионеры есть, места ограничены", en: "Imports allowed, spots limited" } },
    { country: { ru: "Дания", en: "Denmark" }, flag: "🇩🇰", name: "1. division", tier: 2, open: "high", note: { ru: "Второй дивизион", en: "Second division" }, imports: { ru: "Доступнее для входа", en: "Easier to enter" } },

    { country: { ru: "Швейцария", en: "Switzerland" }, flag: "🇨🇭", name: "National League", tier: 1, open: "low", note: { ru: "Один из самых сильных и богатых чемпионатов", en: "One of the strongest and richest leagues" }, imports: { ru: "Крайне высокая планка", en: "An extremely high bar" } },
    { country: { ru: "Швейцария", en: "Switzerland" }, flag: "🇨🇭", name: "Swiss League", tier: 2, open: "low", note: { ru: "Второй дивизион, сильный уровень", en: "Second division, strong level" }, imports: { ru: "Жёсткий отбор", en: "Tough selection" } },
    { country: { ru: "Швейцария", en: "Switzerland" }, flag: "🇨🇭", name: "MyHockey League", tier: 3, open: "mid", note: { ru: "Третий уровень, полупрофессиональный", en: "Third level, semi-pro" }, imports: { ru: "Возможен вход", en: "Entry is possible" } },

    { country: { ru: "Франция", en: "France" }, flag: "🇫🇷", name: "Ligue Magnus", tier: 1, open: "mid", note: { ru: "Высший дивизион", en: "Top division" }, imports: { ru: "Лимит на легионеров", en: "An import limit applies" } },
    { country: { ru: "Франция", en: "France" }, flag: "🇫🇷", name: "Division 1", tier: 2, open: "high", note: { ru: "Второй дивизион", en: "Second division" }, imports: { ru: "Доступный вход", en: "An accessible entry" } },
    { country: { ru: "Франция", en: "France" }, flag: "🇫🇷", name: "Division 2", tier: 3, open: "high", note: { ru: "Третий уровень", en: "Third level" }, imports: { ru: "Открыт, уровень ниже", en: "Open, lower level" } },

    { country: { ru: "Венгрия", en: "Hungary" }, flag: "🇭🇺", name: "Erste Liga", tier: 1, open: "high", note: { ru: "Международная лига (Венгрия, Румыния)", en: "International league (Hungary, Romania)" }, imports: { ru: "Открыта для легионеров", en: "Open to imports" } },

    { country: { ru: "Великобритания", en: "United Kingdom" }, flag: "🇬🇧", name: "EIHL", tier: 1, open: "mid", note: { ru: "Высший дивизион, много иностранцев", en: "Top division, many foreigners" }, imports: { ru: "Нужны рабочие визы", en: "Work visas required" } },
    { country: { ru: "Великобритания", en: "United Kingdom" }, flag: "🇬🇧", name: "NIHL National", tier: 2, open: "high", note: { ru: "Второй уровень", en: "Second level" }, imports: { ru: "Доступнее, но ниже уровнем", en: "More accessible, but lower level" } },

    { country: { ru: "Италия", en: "Italy" }, flag: "🇮🇹", name: "IHL Serie A", tier: 1, open: "high", note: { ru: "Высший дивизион", en: "Top division" }, imports: { ru: "Открыт для легионеров", en: "Open to imports" } },

    { country: { ru: "Латвия", en: "Latvia" }, flag: "🇱🇻", name: "Optibet hokeja līga", tier: 1, open: "high", note: { ru: "Высший дивизион", en: "Top division" }, imports: { ru: "Достаточно открыта, знакомый стиль хоккея", en: "Fairly open, a familiar style of hockey" } },

    { country: { ru: "Нидерланды", en: "Netherlands" }, flag: "🇳🇱", name: "BeNe League", tier: 1, open: "high", note: { ru: "Совместная лига Нидерландов и Бельгии", en: "Joint league of the Netherlands and Belgium" }, imports: { ru: "Открыта, уровень средний", en: "Open, mid-level" } },

    { country: { ru: "Испания", en: "Spain" }, flag: "🇪🇸", name: "Liga Nacional", tier: 1, open: "high", note: { ru: "Высший дивизион, небольшой рынок", en: "Top division, a small market" }, imports: { ru: "Открыт, уровень невысокий", en: "Open, modest level" } },

    { country: { ru: "Румыния", en: "Romania" }, flag: "🇷🇴", name: "Liga Naţională", tier: 1, open: "high", note: { ru: "Высший дивизион", en: "Top division" }, imports: { ru: "Открыт для легионеров", en: "Open to imports" } }
  ]
};
