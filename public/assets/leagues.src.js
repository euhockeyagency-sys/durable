/* Bilingual source of truth for the European league reference. Build step
   (scripts/build-leagues.js) renders this into the runtime files
   assets/leagues.ru.js + assets/leagues.en.js and into the static table rows on
   /ligi-evropy (RU) and /european-leagues (EN). Edit here, then run:
     node scripts/build-leagues.js
   IMPORTANT: data is a guideline. Import limits and rules change season to
   season and must be verified for the current year. age defaults to senior;
   junior records use age: "junior". tier: 1 top division, 2 second, 3 third.
   open: how realistic a spot is for an import — high|mid|low. */
window.EHA_LEAGUES_SRC = {
  "updated": {
    "ru": "25 октября 2026 — редакционная проверка, частичное подтверждение правил",
    "en": "25 October 2026 — editorial review, partial rule verification"
  },
  "windowNote": {
    "ru": "Сроки набора, трансфера и регистрации различаются; подтверждайте даты для команды и сезона.",
    "en": "Recruitment, transfer and registration dates differ; confirm them for the team and season."
  },
  "leagues": [
    {
      "country": {
        "ru": "Финляндия",
        "en": "Finland"
      },
      "flag": "🇫🇮",
      "name": "Liiga",
      "tier": 1,
      "open": "low",
      "note": {
        "ru": "Высший дивизион, элитный уровень",
        "en": "Top division, elite level"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Финляндия",
        "en": "Finland"
      },
      "flag": "🇫🇮",
      "name": "Mestis",
      "url": {
        "ru": "/ligi/finlyandiya-mestis",
        "en": "/leagues/finland-mestis"
      },
      "tier": 2,
      "open": "mid",
      "note": {
        "ru": "Второй дивизион, профессиональный",
        "en": "Second division, professional"
      },
      "imports": {
        "ru": "2026/27: квота иностранцев не публикуется; на матч не больше 2 игроков в аренде из Liiga плюс 2 U19–U20; не меньше 20 своих игроков по контракту.",
        "en": "2026/27: no published foreign-player quota; per game at most 2 Liiga loan skaters plus 2 U19–U20; at least 20 own contracted players."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Mestis roster rules 2026/27 (league news 22 April 2026)",
        "status": "partial",
        "sources": [
          "https://mestis.fi/fi/uutiset/2026/04/22/mestiksen-kokoonpanosaannot-202627"
        ]
      }
    },
    {
      "country": {
        "ru": "Финляндия",
        "en": "Finland"
      },
      "flag": "🇫🇮",
      "name": "Suomi-sarja",
      "url": {
        "ru": "/ligi/finlyandiya-suomi-sarja",
        "en": "/leagues/finland-suomi-sarja"
      },
      "tier": 3,
      "open": "mid",
      "note": {
        "ru": "Третий уровень, полупрофессиональный",
        "en": "Third level, semi-pro"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Финляндия",
        "en": "Finland"
      },
      "flag": "🇫🇮",
      "name": "U20 SM-sarja",
      "url": {
        "ru": "/ligi/finlyandiya-yuniorskij-hokkej",
        "en": "/leagues/finland-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "mid",
      "note": {
        "ru": "Верхний юниорский дивизион, до 20 лет",
        "en": "Top junior division, U20"
      },
      "imports": {
        "ru": "SJL §6.7: постоянный международный трансфер до 18 лет требует постоянного переезда с родителем или законным представителем; другие случаи проверяются отдельно.",
        "en": "SJL §6.7: a permanent international transfer under 18 requires permanent relocation with a parent or legal guardian; check other cases separately."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Permanent international transfer under 18, SJL §6.7; not all eligibility rules",
        "status": "partial",
        "sources": [
          "https://www.finhockey.fi/tuomarille/saannot-ja-tulkinnat/kilpailusaannot"
        ]
      }
    },
    {
      "country": {
        "ru": "Финляндия",
        "en": "Finland"
      },
      "flag": "🇫🇮",
      "name": "U18 SM-sarja",
      "url": {
        "ru": "/ligi/finlyandiya-yuniorskij-hokkej",
        "en": "/leagues/finland-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "mid",
      "note": {
        "ru": "Верхний юниорский дивизион, до 18 лет",
        "en": "Top junior division, U18"
      },
      "imports": {
        "ru": "SJL §6.7: постоянный международный трансфер до 18 лет требует постоянного переезда с родителем или законным представителем; другие случаи проверяются отдельно.",
        "en": "SJL §6.7: a permanent international transfer under 18 requires permanent relocation with a parent or legal guardian; check other cases separately."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Permanent international transfer under 18, SJL §6.7; not all eligibility rules",
        "status": "partial",
        "sources": [
          "https://www.finhockey.fi/tuomarille/saannot-ja-tulkinnat/kilpailusaannot"
        ]
      }
    },
    {
      "country": {
        "ru": "Швеция",
        "en": "Sweden"
      },
      "flag": "🇸🇪",
      "name": "SHL",
      "tier": 1,
      "open": "low",
      "note": {
        "ru": "Высший взрослый дивизион Швеции.",
        "en": "Sweden's top senior division."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Швеция",
        "en": "Sweden"
      },
      "flag": "🇸🇪",
      "name": "HockeyAllsvenskan",
      "url": {
        "ru": "/ligi/shvetsiya-hockeyallsvenskan",
        "en": "/leagues/sweden-hockeyallsvenskan"
      },
      "tier": 2,
      "open": "low",
      "note": {
        "ru": "Второй взрослый дивизион; занятость и условия зависят от договора.",
        "en": "Second senior division; employment and terms depend on the contract."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Швеция",
        "en": "Sweden"
      },
      "flag": "🇸🇪",
      "name": "Hockeyettan",
      "url": {
        "ru": "/ligi/shvetsiya-hockeyettan",
        "en": "/leagues/sweden-hockeyettan"
      },
      "tier": 3,
      "open": "mid",
      "note": {
        "ru": "Третий уровень, региональные группы",
        "en": "Third level, regional groups"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Швеция",
        "en": "Sweden"
      },
      "flag": "🇸🇪",
      "name": "U20 Nationell",
      "url": {
        "ru": "/ligi/shvetsiya-j20",
        "en": "/leagues/sweden-j20"
      },
      "tier": 1,
      "age": "junior",
      "open": "low",
      "note": {
        "ru": "Верхний юниорский дивизион, до 20 лет",
        "en": "Upper junior division, U20"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; competition name verified",
        "status": "pending",
        "sources": [
          "https://www.swehockey.se/foerening/sport/serier/u20-nationell-herr/"
        ]
      }
    },
    {
      "country": {
        "ru": "Швеция",
        "en": "Sweden"
      },
      "flag": "🇸🇪",
      "name": "U18 Nationell",
      "url": {
        "ru": "/ligi/shvetsiya-j18",
        "en": "/leagues/sweden-j18"
      },
      "tier": 1,
      "age": "junior",
      "open": "low",
      "note": {
        "ru": "Верхний юниорский дивизион, до 18 лет",
        "en": "Upper junior division, U18"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; competition name verified",
        "status": "pending",
        "sources": [
          "https://www.swehockey.se/foerening/sport/serier/u18-nationell-herr/"
        ]
      }
    },
    {
      "country": {
        "ru": "Чехия",
        "en": "Czechia"
      },
      "flag": "🇨🇿",
      "name": "Tipsport Extraliga",
      "url": {
        "ru": "/ligi/chehiya-tipsport-extraliga",
        "en": "/leagues/czechia-tipsport-extraliga"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион, один из сильнейших в Европе",
        "en": "Top division, one of Europe's strongest"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Чехия",
        "en": "Czechia"
      },
      "flag": "🇨🇿",
      "name": "Maxa liga",
      "url": {
        "ru": "/ligi/chehiya-maxa-liga",
        "en": "/leagues/czechia-maxa-liga"
      },
      "tier": 2,
      "open": "mid",
      "note": {
        "ru": "Второй дивизион, профессиональный",
        "en": "Second division, professional"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Чехия",
        "en": "Czechia"
      },
      "flag": "🇨🇿",
      "name": "2. liga",
      "tier": 3,
      "open": "mid",
      "note": {
        "ru": "Третий уровень, региональные группы",
        "en": "Third level, regional groups"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Чехия",
        "en": "Czechia"
      },
      "flag": "🇨🇿",
      "name": "Extraliga juniorů",
      "url": {
        "ru": "/ligi/chehiya-yuniorskij-hokkej",
        "en": "/leagues/czechia-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "mid",
      "note": {
        "ru": "Верхний юниорский дивизион, до 20 лет",
        "en": "Top junior division, U20"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Чехия",
        "en": "Czechia"
      },
      "flag": "🇨🇿",
      "name": "Extraliga staršího dorostu",
      "url": {
        "ru": "/ligi/chehiya-yuniorskij-hokkej",
        "en": "/leagues/czechia-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "mid",
      "note": {
        "ru": "Верхний юниорский дивизион, до 18 лет",
        "en": "Top junior division, U18"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Словакия",
        "en": "Slovakia"
      },
      "flag": "🇸🇰",
      "name": "Tipsport liga",
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион",
        "en": "Top division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; competition name verified against club season listing",
        "status": "pending",
        "sources": [
          "https://www.hcslovan.sk/sk/stats/tournaments"
        ]
      },
      "url": {
        "ru": "/ligi/slovakiya-tipsport-liga",
        "en": "/leagues/slovakia-tipsport-liga"
      }
    },
    {
      "country": {
        "ru": "Словакия",
        "en": "Slovakia"
      },
      "flag": "🇸🇰",
      "name": "TIPOS SHL",
      "tier": 2,
      "open": "high",
      "note": {
        "ru": "Второй дивизион",
        "en": "Second division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; competition name verified",
        "status": "pending",
        "sources": [
          "https://shl.hockeyslovakia.sk/sk/stats/info/1198/"
        ]
      },
      "url": {
        "ru": "/ligi/slovakiya-tipos-shl",
        "en": "/leagues/slovakia-tipos-shl"
      }
    },
    {
      "country": {
        "ru": "Германия",
        "en": "Germany"
      },
      "flag": "🇩🇪",
      "name": "DEL",
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион, сильные бюджеты",
        "en": "Top division, strong budgets"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Германия",
        "en": "Germany"
      },
      "flag": "🇩🇪",
      "name": "DEL2",
      "url": {
        "ru": "/ligi/germaniya-del2",
        "en": "/leagues/germany-del2"
      },
      "tier": 2,
      "open": "mid",
      "note": {
        "ru": "Второй дивизион, профессиональный",
        "en": "Second division, professional"
      },
      "imports": {
        "ru": "2026/27: не больше 4 иностранцев в протоколе и 6 лицензий иностранцев на клуб за сезон; иностранец — любой без немецкого гражданства (ЕС не исключён); лицензии до 15 февраля.",
        "en": "2026/27: at most 4 foreign players per game sheet and 6 foreign licences per club and season; foreign = no German citizenship (EU not exempt); licences until 15 February."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Spielordnung DEL2 (September 2026) §18(2), §26(3)",
        "status": "partial",
        "sources": [
          "https://www.del-2.org/media/regeln/spielordnung_del2_26_27.pdf"
        ]
      }
    },
    {
      "country": {
        "ru": "Германия",
        "en": "Germany"
      },
      "flag": "🇩🇪",
      "name": "Oberliga",
      "url": {
        "ru": "/ligi/germaniya-oberliga",
        "en": "/leagues/germany-oberliga"
      },
      "tier": 3,
      "open": "high",
      "note": {
        "ru": "Третий уровень, группы Север и Юг",
        "en": "Third level, North and South groups"
      },
      "imports": {
        "ru": "По данным прессы (2022, 2024): 3 легионера на матч, 5 лицензий за сезон, лимит игроков старше 23 лет; регламент DEB 2026/27 не проверен.",
        "en": "Press reports (2022, 2024): 3 imports per game, 5 import licences per season, over-23 limit; DEB 2026/27 regulation not verified."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Press reports only; DEB 2026/27 Oberliga regulation not seen",
        "status": "partial",
        "sources": [
          "https://www.eishockeynews.de/artikel/2024/04/05/oberligisten-staerken-nachwuchsfoerderung-weiterhin-drei-kontingentspieler-erlaubt/e11703f8-3051-4e68-89ca-c6484d166c81.html"
        ]
      }
    },
    {
      "country": {
        "ru": "Германия",
        "en": "Germany"
      },
      "flag": "🇩🇪",
      "name": "U20 Division I",
      "url": {
        "ru": "/ligi/germaniya-yuniorskij-hokkej",
        "en": "/leagues/germany-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "mid",
      "note": {
        "ru": "Верхний юниорский дивизион, до 20 лет",
        "en": "Top junior division, U20"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Германия",
        "en": "Germany"
      },
      "flag": "🇩🇪",
      "name": "U17 Division I",
      "url": {
        "ru": "/ligi/germaniya-yuniorskij-hokkej",
        "en": "/leagues/germany-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "mid",
      "note": {
        "ru": "Верхний юниорский дивизион, до 17 лет",
        "en": "Top junior division, U17"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Австрия",
        "en": "Austria"
      },
      "flag": "🇦🇹",
      "name": "ICE Hockey League",
      "url": {
        "ru": "/ligi/avstriya-ice-hockey-league",
        "en": "/leagues/austria-ice-hockey-league"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Международный высший дивизион",
        "en": "International top division"
      },
      "imports": {
        "ru": "По правилу 2022 года: в протоколе на 22 игрока не меньше 12 местных (двое моложе 24), то есть до 10 легионеров; 26 игроков старше 24 лет за сезон. Число на 2026/27 не подтверждено документом лиги.",
        "en": "Under the 2022 rule: at least 12 domestic players (two under 24) on a 22-player sheet, so up to 10 imports; 26 over-24 players per season. The 2026/27 number is not confirmed by a league document."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Press reports of the 2022 roster rule; no 2026/27 league document seen",
        "status": "partial",
        "sources": [
          "https://www.laola1.at/de/red/wintersport/eishockey/ice-hockey-league/ice-scout/ice---legionaere-und-nachwuchsspieler--neue-kaderregeln-erklaert/"
        ]
      }
    },
    {
      "country": {
        "ru": "Австрия",
        "en": "Austria"
      },
      "flag": "🇦🇹",
      "name": "Alps Hockey League",
      "url": {
        "ru": "/ligi/alps-hockey-league",
        "en": "/leagues/alps-hockey-league"
      },
      "tier": 2,
      "open": "high",
      "note": {
        "ru": "Международная лига (Австрия, Италия, Словения)",
        "en": "International league (Austria, Italy, Slovenia)"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Словения",
        "en": "Slovenia"
      },
      "flag": "🇸🇮",
      "name": "Alps Hockey League",
      "url": {
        "ru": "/ligi/alps-hockey-league",
        "en": "/leagues/alps-hockey-league"
      },
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Международная Alps Hockey League; участие клуба и национальный статус проверяются отдельно.",
        "en": "Cross-border Alps Hockey League; verify club participation and domestic status separately."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Польша",
        "en": "Poland"
      },
      "flag": "🇵🇱",
      "name": "TAURON Hokej Liga",
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Высший дивизион, растущий рынок",
        "en": "Top division, a growing market"
      },
      "imports": {
        "ru": "2026/27: в заявке на матч (12–22) минимум 10 игроков с польским гражданством или Картой поляка, включая вратаря; прямого лимита легионеров нет; окно до 15 февраля.",
        "en": "2026/27: at least 10 players with Polish citizenship or a Karta Polaka, including a goaltender, in each 12–22 player match roster; no direct import cap; window closes 15 February."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Match-roster Polish minimum and U23 rule (§13.3–13.6), transfer window (§20); no licence cap found in the pages read",
        "status": "partial",
        "sources": [
          "https://cdn.sportigio.com/spaces/173/uploads/f860h7rqa4MI3nmLYztiSFQxHyeorimVe970fPR9.pdf"
        ]
      },
      "url": {
        "ru": "/ligi/polsha-tauron-hokej-liga",
        "en": "/leagues/poland-tauron-hokej-liga"
      }
    },
    {
      "country": {
        "ru": "Польша",
        "en": "Poland"
      },
      "flag": "🇵🇱",
      "name": "1 liga",
      "tier": 2,
      "open": "high",
      "note": {
        "ru": "Второй дивизион",
        "en": "Second division"
      },
      "imports": {
        "ru": "2026/27: не меньше 55% польских полевых и один польский вратарь в заявке; квота растёт до 60% в 2027/28.",
        "en": "2026/27: at least 55% Polish skaters and one Polish goaltender per roster; quota rises to 60% in 2027/28."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Regulamin 1 Ligi 2026/27 §6–§9",
        "status": "partial",
        "sources": [
          "https://cdn.sportigio.com/spaces/173/uploads/ObrL4yd4mzFvGON0dykXw3aM0SVSMkj4LMDmMXZ7.pdf"
        ]
      },
      "url": {
        "ru": "/ligi/polsha-1-liga-mhl",
        "en": "/leagues/poland-1-liga-mhl"
      }
    },
    {
      "country": {
        "ru": "Норвегия",
        "en": "Norway"
      },
      "flag": "🇳🇴",
      "name": "EliteHockey Ligaen",
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион",
        "en": "Top division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; competition identity verified",
        "status": "pending",
        "sources": [
          "https://www.ehl.no/"
        ]
      },
      "url": {
        "ru": "/ligi/norvegiya-elitehockeyligaen",
        "en": "/leagues/norway-elitehockeyligaen"
      }
    },
    {
      "country": {
        "ru": "Норвегия",
        "en": "Norway"
      },
      "flag": "🇳🇴",
      "name": "Hockeyliga1",
      "url": {
        "ru": "/ligi/norvegiya-hockeyliga1",
        "en": "/leagues/norway-hockeyliga1"
      },
      "tier": 2,
      "open": "high",
      "note": {
        "ru": "Второй дивизион (бывший 1. divisjon)",
        "en": "Second division (formerly 1. divisjon)"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Дания",
        "en": "Denmark"
      },
      "flag": "🇩🇰",
      "name": "Metal Ligaen",
      "url": {
        "ru": "/ligi/daniya-metal-ligaen",
        "en": "/leagues/denmark-metal-ligaen"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион",
        "en": "Top division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Дания",
        "en": "Denmark"
      },
      "flag": "🇩🇰",
      "name": "1. division",
      "url": {
        "ru": "/ligi/daniya-1-division",
        "en": "/leagues/denmark-1-division"
      },
      "tier": 2,
      "open": "high",
      "note": {
        "ru": "Второй дивизион",
        "en": "Second division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Швейцария",
        "en": "Switzerland"
      },
      "flag": "🇨🇭",
      "name": "National League",
      "url": {
        "ru": "/ligi/shvejcariya-national-league",
        "en": "/leagues/switzerland-national-league"
      },
      "tier": 1,
      "open": "low",
      "note": {
        "ru": "Высший взрослый дивизион Швейцарии.",
        "en": "Switzerland's top senior division."
      },
      "imports": {
        "ru": "2026/27: 6 иностранцев на матч и 10 на клуб за сезон; двойное гражданство и «как швейцарец» не в квоте; переходы иностранцев до 15 февраля 2027.",
        "en": "2026/27: 6 foreign players per game and 10 per club and season; dual citizens and “like a Swiss” not counted; foreign players' deadline 15 February 2027."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Weisungen Spielbetrieb NL 2026/27 sec. 1.3.1–1.3.4, 1.7",
        "status": "partial",
        "sources": [
          "https://www.nationalleague.ch/media/bvinatrg/weisungen_spielbetrieb_nl_26_27_d.pdf"
        ]
      }
    },
    {
      "country": {
        "ru": "Швейцария",
        "en": "Switzerland"
      },
      "flag": "🇨🇭",
      "name": "Swiss League",
      "url": {
        "ru": "/ligi/shvejcariya-sky-swiss-league",
        "en": "/leagues/switzerland-sky-swiss-league"
      },
      "tier": 2,
      "open": "low",
      "note": {
        "ru": "Второй дивизион, сильный уровень",
        "en": "Second division, strong level"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Швейцария",
        "en": "Switzerland"
      },
      "flag": "🇨🇭",
      "name": "MyHockey League",
      "tier": 3,
      "open": "low",
      "note": {
        "ru": "Третий уровень; SIHF относит его к высшей любительской лиге страны.",
        "en": "Third level; SIHF describes it as the country's highest amateur league."
      },
      "imports": {
        "ru": "SIHF 2026/27: общего допуска иностранных игроков нет; предусмотрены статусы «как швейцарец», двойное гражданство и ограниченное исключение для ВНЖ C. Проверьте весь регламент.",
        "en": "SIHF 2026/27: no general foreign-player eligibility; Swiss-equivalent status, dual nationality and a limited C-permit exception are specified. Check the full rules."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "SIHF Art.17(2)(a); special qualification provisions must be checked separately",
        "status": "partial",
        "sources": [
          "https://www.sihf.ch/media/4qwbqzsa/rahmenbedingungen-2026_27.pdf",
          "https://www.sihf.ch/de/ligen/myhockey-league/"
        ]
      }
    },
    {
      "country": {
        "ru": "Швейцария",
        "en": "Switzerland"
      },
      "flag": "🇨🇭",
      "name": "U21-Elit",
      "url": {
        "ru": "/ligi/shvejcariya-yuniorskij-hokkej",
        "en": "/leagues/switzerland-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "low",
      "note": {
        "ru": "Верхний юниорский дивизион, до 21 года",
        "en": "Top junior division, U21"
      },
      "imports": {
        "ru": "SIHF: допуск зависит от юниорской категории, статуса и прежней регистрации; для вратарей отдельные условия. Отсутствие ITC не означает отсутствие процедуры перехода.",
        "en": "SIHF: eligibility depends on junior category, status and registration history; goalies have separate conditions. No ITC does not mean no transfer procedure."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "SIHF junior eligibility differs by category/status and goalie position; no simplified universal entry claim",
        "status": "partial",
        "sources": [
          "https://www.sihf.ch/media/4qwbqzsa/rahmenbedingungen-2026_27.pdf"
        ]
      }
    },
    {
      "country": {
        "ru": "Швейцария",
        "en": "Switzerland"
      },
      "flag": "🇨🇭",
      "name": "U18-Elit",
      "url": {
        "ru": "/ligi/shvejcariya-yuniorskij-hokkej",
        "en": "/leagues/switzerland-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "low",
      "note": {
        "ru": "Верхний юниорский дивизион, до 18 лет",
        "en": "Top junior division, U18"
      },
      "imports": {
        "ru": "SIHF: допуск зависит от юниорской категории, статуса и прежней регистрации; для вратарей отдельные условия. Отсутствие ITC не означает отсутствие процедуры перехода.",
        "en": "SIHF: eligibility depends on junior category, status and registration history; goalies have separate conditions. No ITC does not mean no transfer procedure."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "SIHF junior eligibility differs by category/status and goalie position; no simplified universal entry claim",
        "status": "partial",
        "sources": [
          "https://www.sihf.ch/media/4qwbqzsa/rahmenbedingungen-2026_27.pdf"
        ]
      }
    },
    {
      "country": {
        "ru": "Франция",
        "en": "France"
      },
      "flag": "🇫🇷",
      "name": "Ligue Magnus",
      "url": {
        "ru": "/ligi/franciya-ligue-magnus",
        "en": "/leagues/france-ligue-magnus"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион",
        "en": "Top division"
      },
      "imports": {
        "ru": "2026/27: в протоколе на 19–20 игроков не меньше 10 JFL (на 21 — 11), то есть до 10 игроков без JFL; переходы до 31 декабря плюс два новичка в январе.",
        "en": "2026/27: at least 10 JFL on a 19–20 player sheet (11 on 21), so up to 10 non-JFL; transfers by 31 December plus two January arrivals."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "AS art. 8.3, SLM art. 3–4, ALM art. 32.2/33.3",
        "status": "partial",
        "sources": [
          "https://www.hockeyfrance.com/wp-content/uploads/2026/09/12-Reglements-generaux-SLM-2026.27-VF.pdf"
        ]
      }
    },
    {
      "country": {
        "ru": "Франция",
        "en": "France"
      },
      "flag": "🇫🇷",
      "name": "Division 1",
      "url": {
        "ru": "/ligi/franciya-division-1",
        "en": "/leagues/france-division-1"
      },
      "tier": 2,
      "open": "high",
      "note": {
        "ru": "Второй дивизион",
        "en": "Second division"
      },
      "imports": {
        "ru": "2026/27: в протоколе на 19–20 игроков не меньше 13 JFL (местной подготовки, не гражданство), то есть до 7 игроков без JFL; переходы — до 31 декабря.",
        "en": "2026/27: at least 13 JFL (locally trained, not nationality) on a 19–20 player game sheet, so up to 7 non-JFL; transfers by 31 December."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "Game-sheet JFL minimum (AS art. 8.3) and transfer deadline (ALM art. 32.2, 33.3); no separate licence cap found",
        "status": "partial",
        "sources": [
          "https://www.hockeyfrance.com/wp-content/uploads/2026/05/06-Reglement-AS-2026.27_VF.pdf",
          "https://www.hockeyfrance.com/wp-content/uploads/2026/05/07-Reglement-ALM-2026.27_VF.pdf"
        ]
      }
    },
    {
      "country": {
        "ru": "Франция",
        "en": "France"
      },
      "flag": "🇫🇷",
      "name": "Division 2",
      "tier": 3,
      "open": "high",
      "note": {
        "ru": "Третий уровень",
        "en": "Third level"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Венгрия",
        "en": "Hungary"
      },
      "flag": "🇭🇺",
      "name": "Erste Liga",
      "url": {
        "ru": "/ligi/vengriya-erste-liga",
        "en": "/leagues/hungary-erste-liga"
      },
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Международная лига (Венгрия, Румыния)",
        "en": "International league (Hungary, Romania)"
      },
      "imports": {
        "ru": "2026/27: не больше 5 иностранцев в матче и 11 зарегистрированных за сезон (MJSZ).",
        "en": "2026/27: at most 5 foreign players per match and 11 registered per season (MJSZ)."
      },
      "review": {
        "reviewedAt": "2026-10-02",
        "season": "2026/27",
        "scope": "MJSZ season information: match and season foreign limits",
        "status": "partial",
        "sources": [
          "https://www.jegkorongszovetseg.hu/informaciok-az-erste-liga-uj-szezonjarol"
        ]
      }
    },
    {
      "country": {
        "ru": "Великобритания",
        "en": "United Kingdom"
      },
      "flag": "🇬🇧",
      "name": "EIHL",
      "url": {
        "ru": "/ligi/velikobritaniya-eihl",
        "en": "/leagues/uk-eihl"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион, много иностранцев",
        "en": "Top division, many foreigners"
      },
      "imports": {
        "ru": "2026/27 (по пресс-релизу): до 15 non-homegrown на матч, 20 за сезон и 18 одновременно; нужен британский вратарь; иностранцам — британская виза.",
        "en": "2026/27 (per press release): up to 15 non-homegrown per game, 20 per season and 18 at one time; a British goaltender required; non-UK players need a UK visa."
      },
      "review": {
        "reviewedAt": "2026-11-18",
        "season": "2026/27",
        "scope": "League release on 2026/27 roster regulations via trade press; opening rosters (league)",
        "status": "partial",
        "sources": [
          "https://prohockeynews.com/eihl-roster-regulations-updated-for-2026-27/",
          "https://www.eliteleague.co.uk/article/5504-opening-rosters-2026-27"
        ]
      }
    },
    {
      "country": {
        "ru": "Великобритания",
        "en": "United Kingdom"
      },
      "flag": "🇬🇧",
      "name": "NIHL National",
      "url": {
        "ru": "/ligi/velikobritaniya-planet-ice-national-league",
        "en": "/leagues/uk-planet-ice-national-league"
      },
      "tier": 2,
      "open": "high",
      "note": {
        "ru": "Второй уровень",
        "en": "Second level"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Италия",
        "en": "Italy"
      },
      "flag": "🇮🇹",
      "name": "IHL Serie A",
      "url": {
        "ru": "/ligi/italiya-ihl-serie-a",
        "en": "/leagues/italy-ihl-serie-a"
      },
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Высший дивизион",
        "en": "Top division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Италия",
        "en": "Italy"
      },
      "flag": "🇮🇹",
      "name": "Italian Hockey League",
      "url": {
        "ru": "/ligi/italiya-italian-hockey-league",
        "en": "/leagues/italy-italian-hockey-league"
      },
      "tier": 2,
      "open": "mid",
      "note": {
        "ru": "Второй уровень (ниже IHL Serie A)",
        "en": "Second level (below IHL Serie A)"
      },
      "imports": {
        "ru": "2026/27: не больше 3 игроков категории B; вратари только категории A; срок регистрации 11 января 2027 (FISG).",
        "en": "2026/27: at most 3 Category B players; goaltenders Category A only; registration deadline 11 January 2027 (FISG)."
      },
      "review": {
        "reviewedAt": "2026-10-02",
        "season": "2026/27",
        "scope": "FISG NOFA 2026/27: Category B limit, goaltender rule, deadline",
        "status": "partial",
        "sources": [
          "https://static.fisg.it/wp-content/uploads/2026/07/07183941/NOFA_26_27_def-1.pdf"
        ]
      }
    },
    {
      "country": {
        "ru": "Латвия",
        "en": "Latvia"
      },
      "flag": "🇱🇻",
      "name": "Optibet hokeja līga",
      "url": {
        "ru": "/ligi/latviya-optibet-hokeja-liga",
        "en": "/leagues/latvia-optibet-hokeja-liga"
      },
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Высший дивизион",
        "en": "Top division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Литва",
        "en": "Lithuania"
      },
      "flag": "🇱🇹",
      "name": "Optibet hokeja līga",
      "url": {
        "ru": "/ligi/latviya-optibet-hokeja-liga",
        "en": "/leagues/latvia-optibet-hokeja-liga"
      },
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Маршрут через Optibet hokeja līga; участие конкретной команды проверяется по сезону.",
        "en": "Optibet hokeja līga route; verify the specific team's participation for the season."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Эстония",
        "en": "Estonia"
      },
      "flag": "🇪🇪",
      "name": "Unibet Hokiliiga",
      "url": {
        "ru": "/ligi/estoniya-unibet-hokiliiga",
        "en": "/leagues/estonia-unibet-hokiliiga"
      },
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Высший взрослый дивизион; число участников в текущем сезоне здесь не подтверждено.",
        "en": "Top senior division; current-season team count is not verified here."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Нидерланды",
        "en": "Netherlands"
      },
      "flag": "🇳🇱",
      "name": "CEHL",
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Международная лига; открытая страница команд помечена 2025/26 — состав 2026/27 отдельно не подтверждён.",
        "en": "Cross-border league; the public team page is labelled 2025/26, so its 2026/27 lineup is not verified here."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; official CEHL page found, displayed team season 2025/26",
        "status": "pending",
        "sources": [
          "https://www.cehl.eu/teams/"
        ]
      },
      "url": {
        "ru": "/ligi/niderlandy-cehl",
        "en": "/leagues/netherlands-cehl"
      }
    },
    {
      "country": {
        "ru": "Испания",
        "en": "Spain"
      },
      "flag": "🇪🇸",
      "name": "Liga Nacional",
      "url": {
        "ru": "/ligi/ispaniya-liga-nacional",
        "en": "/leagues/spain-liga-nacional"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший взрослый дивизион; состав участников и условия сезона требуют проверки.",
        "en": "Top senior division; check current participants and season conditions."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Румыния",
        "en": "Romania"
      },
      "flag": "🇷🇴",
      "name": "Liga Naţională",
      "url": {
        "ru": "/ligi/rumyniya-campionatul-national",
        "en": "/leagues/romania-campionatul-national"
      },
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Высший дивизион",
        "en": "Top division"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Сербия",
        "en": "Serbia"
      },
      "flag": "🇷🇸",
      "name": "International Hockey League (IHL)",
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Региональная лига со Словенией и Хорватией; отдельно есть внутренний чемпионат",
        "en": "Regional league with Slovenia and Croatia; a separate domestic championship also exists"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Хорватия",
        "en": "Croatia"
      },
      "flag": "🇭🇷",
      "name": "IHL / Alps Hockey League",
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Клубы играют в двух региональных лигах и во внутреннем чемпионате",
        "en": "Clubs play across two regional leagues and a domestic championship"
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Бельгия",
        "en": "Belgium"
      },
      "flag": "🇧🇪",
      "name": "CEHL",
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Международная лига; открытая страница команд помечена 2025/26 — состав 2026/27 отдельно не подтверждён.",
        "en": "Cross-border league; the public team page is labelled 2025/26, so its 2026/27 lineup is not verified here."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; official CEHL page found, displayed team season 2025/26",
        "status": "pending",
        "sources": [
          "https://www.cehl.eu/teams/"
        ]
      },
      "url": {
        "ru": "/ligi/niderlandy-cehl",
        "en": "/leagues/netherlands-cehl"
      }
    },
    {
      "country": {
        "ru": "Казахстан",
        "en": "Kazakhstan"
      },
      "flag": "🇰🇿",
      "name": "Pro Hokei Ligasy",
      "url": {
        "ru": "/ligi/kazahstan-pro-hokei-ligasy",
        "en": "/leagues/kazakhstan-pro-hokei-ligasy"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший взрослый дивизион; участники и источники финансирования проверяются отдельно.",
        "en": "Top senior division; verify participants and funding conditions separately."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Япония",
        "en": "Japan"
      },
      "flag": "🇯🇵",
      "name": "Asia League Ice Hockey",
      "url": {
        "ru": "/ligi/yaponiya-asia-league",
        "en": "/leagues/japan-asia-league"
      },
      "tier": 1,
      "open": "low",
      "note": {
        "ru": "Международная Asia League; число команд и импортных мест не подтверждено этой проверкой.",
        "en": "Cross-border Asia League; this review does not verify team or import-slot counts."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "Канада",
        "en": "Canada"
      },
      "flag": "🇨🇦",
      "name": "CHL (WHL / OHL / QMJHL)",
      "url": {
        "ru": "/ligi/kanada-yuniorskij-hokkej",
        "en": "/leagues/canada-junior-hockey"
      },
      "tier": 1,
      "age": "junior",
      "open": "low",
      "note": {
        "ru": "Юниорские лиги WHL, OHL и QMJHL; для импортного маршрута важны драфт и права клуба.",
        "en": "Major junior WHL, OHL and QMJHL; import recruitment involves draft and club rights."
      },
      "imports": {
        "ru": "CHL 2026: до 3 импортных мест; для 16-летних есть отдельные ограничения, способные сократить квоту. Возраст, права и регистрацию подтверждают отдельно.",
        "en": "CHL 2026: up to 3 import spots; separate rules for 16-year-olds can reduce that allowance. Confirm age, rights and registration separately."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "CHL 2026 draft announcement: import roster allowance and age-specific caveat",
        "status": "partial",
        "sources": [
          "https://chl.ca/article/final-order-set-for-tuesdays-2026-chl-import-draft/"
        ]
      }
    },
    {
      "country": {
        "ru": "США",
        "en": "USA"
      },
      "flag": "🇺🇸",
      "name": "NCAA Division I",
      "url": {
        "ru": "/ligi/ssha-ncaa-division-i",
        "en": "/leagues/usa-ncaa-division-i"
      },
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Студенческий хоккей; не ступень национальной профессиональной пирамиды.",
        "en": "College hockey; not a tier in a national professional league pyramid."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "США",
        "en": "USA"
      },
      "flag": "🇺🇸",
      "name": "NCDC",
      "url": {
        "ru": "/ligi/ssha-ncdc",
        "en": "/leagues/usa-ncdc"
      },
      "tier": 2,
      "age": "junior",
      "open": "mid",
      "note": {
        "ru": "Юниорская лига USPHL; расходы и условия программы требуют письменного подтверждения.",
        "en": "USPHL junior league; confirm programme costs and terms in writing."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    },
    {
      "country": {
        "ru": "США",
        "en": "USA"
      },
      "flag": "🇺🇸",
      "name": "ECHL",
      "url": {
        "ru": "/ligi/ssha-echl",
        "en": "/leagues/usa-echl"
      },
      "tier": 2,
      "open": "low",
      "note": {
        "ru": "Профессиональная лига; номер в справочнике не является местом в пирамиде США.",
        "en": "Professional league; the reference's level number is not a US pyramid ranking."
      },
      "imports": {
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified",
        "status": "pending",
        "sources": []
      }
    }
  ],
  "reviewPolicy": {
    "reviewedAt": "2026-10-25",
    "scope": "Editorial screening of all rows; only explicitly sourced rule/name checks verified. No vacancies, salaries, immigration outcomes or complete current team lists confirmed.",
    "ratings": "open is a legacy EHA market assessment, not an official quota or eligibility finding"
  }
};
