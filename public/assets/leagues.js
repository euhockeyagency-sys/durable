/* Справочник европейских лиг для таблицы /ligi-evropy и калькулятора /kalkulyator-urovnya.
   ВАЖНО: данные — ориентир. Лимиты легионеров и правила меняются от сезона к сезону,
   их нужно уточнять на актуальный год. tier: 1 — высший дивизион страны, 2 — второй, 3 — третий.
   open: how realistic it is for an import to get a spot — "high" | "mid" | "low". */
window.EHA_LEAGUES = {
  updated: "июль 2026",
  windowNote: "Основное окно комплектования — апрель–август; точечные усиления возможны по ходу сезона.",
  leagues: [
    { country: "Финляндия", flag: "🇫🇮", name: "Liiga", tier: 1, open: "low", note: "Высший дивизион, элитный уровень", imports: "Мест мало, берут только явное усиление" },
    { country: "Финляндия", flag: "🇫🇮", name: "Mestis", tier: 2, open: "mid", note: "Второй дивизион, профессиональный", imports: "Требования мягче, чем в Liiga" },
    { country: "Финляндия", flag: "🇫🇮", name: "Suomi-sarja", tier: 3, open: "mid", note: "Третий уровень, полупрофессиональный", imports: "Подходит для входа и адаптации" },

    { country: "Швеция", flag: "🇸🇪", name: "SHL", tier: 1, open: "low", note: "Один из сильнейших чемпионатов мира", imports: "Попадают единицы" },
    { country: "Швеция", flag: "🇸🇪", name: "HockeyAllsvenskan", tier: 2, open: "low", note: "Второй дивизион, сильный и полностью профессиональный", imports: "Конкуренция высокая" },
    { country: "Швеция", flag: "🇸🇪", name: "HockeyEttan", tier: 3, open: "mid", note: "Третий уровень, региональные группы", imports: "Реальная точка входа; паспорт ЕС решает многое" },

    { country: "Чехия", flag: "🇨🇿", name: "Tipsport Extraliga", tier: 1, open: "mid", note: "Высший дивизион, один из сильнейших в Европе", imports: "Легионерские места ограничены" },
    { country: "Чехия", flag: "🇨🇿", name: "Chance liga", tier: 2, open: "mid", note: "Второй дивизион, профессиональный", imports: "Частая точка входа для легионера" },
    { country: "Чехия", flag: "🇨🇿", name: "2. liga", tier: 3, open: "mid", note: "Третий уровень, региональные группы", imports: "Вход и адаптация к рынку" },

    { country: "Словакия", flag: "🇸🇰", name: "Tipos extraliga", tier: 1, open: "mid", note: "Высший дивизион", imports: "Легионеры есть, лимит по сезону" },
    { country: "Словакия", flag: "🇸🇰", name: "1. liga", tier: 2, open: "high", note: "Второй дивизион", imports: "Достаточно открыта для легионеров" },

    { country: "Германия", flag: "🇩🇪", name: "DEL", tier: 1, open: "mid", note: "Высший дивизион, сильные бюджеты", imports: "Заметное число иностранцев, конкуренция высокая" },
    { country: "Германия", flag: "🇩🇪", name: "DEL2", tier: 2, open: "mid", note: "Второй дивизион, профессиональный", imports: "Реальная точка входа" },
    { country: "Германия", flag: "🇩🇪", name: "Oberliga", tier: 3, open: "high", note: "Третий уровень, группы Север и Юг", imports: "Много команд — чаще всего появляются вакансии" },

    { country: "Австрия", flag: "🇦🇹", name: "ICE Hockey League", tier: 1, open: "mid", note: "Международный высший дивизион", imports: "Легионеров много, но и уровень высокий" },
    { country: "Австрия", flag: "🇦🇹", name: "Alps Hockey League", tier: 2, open: "high", note: "Международная лига (Австрия, Италия, Словения)", imports: "Открыта для иностранцев" },

    { country: "Польша", flag: "🇵🇱", name: "PHL", tier: 1, open: "high", note: "Высший дивизион, растущий рынок", imports: "Клубы традиционно активно берут легионеров" },
    { country: "Польша", flag: "🇵🇱", name: "1 liga", tier: 2, open: "high", note: "Второй дивизион", imports: "Вход и адаптация" },

    { country: "Норвегия", flag: "🇳🇴", name: "Eliteserien", tier: 1, open: "mid", note: "Высший дивизион", imports: "Лимит на легионеров" },
    { country: "Норвегия", flag: "🇳🇴", name: "1. divisjon", tier: 2, open: "high", note: "Второй дивизион", imports: "Более доступный вход" },

    { country: "Дания", flag: "🇩🇰", name: "Metal Ligaen", tier: 1, open: "mid", note: "Высший дивизион", imports: "Легионеры есть, места ограничены" },
    { country: "Дания", flag: "🇩🇰", name: "1. division", tier: 2, open: "high", note: "Второй дивизион", imports: "Доступнее для входа" },

    { country: "Швейцария", flag: "🇨🇭", name: "National League", tier: 1, open: "low", note: "Один из самых сильных и богатых чемпионатов", imports: "Крайне высокая планка" },
    { country: "Швейцария", flag: "🇨🇭", name: "Swiss League", tier: 2, open: "low", note: "Второй дивизион, сильный уровень", imports: "Жёсткий отбор" },
    { country: "Швейцария", flag: "🇨🇭", name: "MyHockey League", tier: 3, open: "mid", note: "Третий уровень, полупрофессиональный", imports: "Возможен вход" },

    { country: "Франция", flag: "🇫🇷", name: "Ligue Magnus", tier: 1, open: "mid", note: "Высший дивизион", imports: "Лимит на легионеров" },
    { country: "Франция", flag: "🇫🇷", name: "Division 1", tier: 2, open: "high", note: "Второй дивизион", imports: "Доступный вход" },
    { country: "Франция", flag: "🇫🇷", name: "Division 2", tier: 3, open: "high", note: "Третий уровень", imports: "Открыт, уровень ниже" },

    { country: "Венгрия", flag: "🇭🇺", name: "Erste Liga", tier: 1, open: "high", note: "Международная лига (Венгрия, Румыния)", imports: "Открыта для легионеров" },

    { country: "Великобритания", flag: "🇬🇧", name: "EIHL", tier: 1, open: "mid", note: "Высший дивизион, много иностранцев", imports: "Нужны рабочие визы" },
    { country: "Великобритания", flag: "🇬🇧", name: "NIHL National", tier: 2, open: "high", note: "Второй уровень", imports: "Доступнее, но ниже уровнем" },

    { country: "Италия", flag: "🇮🇹", name: "IHL Serie A", tier: 1, open: "high", note: "Высший дивизион", imports: "Открыт для легионеров" },

    { country: "Латвия", flag: "🇱🇻", name: "Optibet hokeja līga", tier: 1, open: "high", note: "Высший дивизион", imports: "Достаточно открыта, знакомый стиль хоккея" },

    { country: "Нидерланды", flag: "🇳🇱", name: "BeNe League", tier: 1, open: "high", note: "Совместная лига Нидерландов и Бельгии", imports: "Открыта, уровень средний" },

    { country: "Испания", flag: "🇪🇸", name: "Liga Nacional", tier: 1, open: "high", note: "Высший дивизион, небольшой рынок", imports: "Открыт, уровень невысокий" },

    { country: "Румыния", flag: "🇷🇴", name: "Liga Naţională", tier: 1, open: "high", note: "Высший дивизион", imports: "Открыт для легионеров" }
  ]
};
