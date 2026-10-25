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
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Международный высший дивизион",
        "en": "International top division"
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
      "name": "Alps Hockey League",
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
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; competition name verified",
        "status": "pending",
        "sources": [
          "https://polskihokej.eu/ligi"
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
        "ru": "Актуальный лимит и допуск не подтверждены этой проверкой; уточняйте регламент сезона и статус игрока.",
        "en": "Current quota and eligibility were not verified in this review; check the season rules and player status."
      },
      "review": {
        "reviewedAt": "2026-10-25",
        "season": "2026/27",
        "scope": "Import wording screened; current quota not verified; 1 LIGA listed in federation competition directory",
        "status": "pending",
        "sources": [
          "https://polskihokej.eu/ligi"
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
      "name": "1. divisjon",
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
        "ru": "Дания",
        "en": "Denmark"
      },
      "flag": "🇩🇰",
      "name": "Metal Ligaen",
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
      "tier": 1,
      "open": "low",
      "note": {
        "ru": "Высший взрослый дивизион Швейцарии.",
        "en": "Switzerland's top senior division."
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
      "name": "Swiss League",
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
        "ru": "Франция",
        "en": "France"
      },
      "flag": "🇫🇷",
      "name": "Division 1",
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
      "tier": 1,
      "open": "high",
      "note": {
        "ru": "Международная лига (Венгрия, Румыния)",
        "en": "International league (Hungary, Romania)"
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
        "ru": "Великобритания",
        "en": "United Kingdom"
      },
      "flag": "🇬🇧",
      "name": "EIHL",
      "tier": 1,
      "open": "mid",
      "note": {
        "ru": "Высший дивизион, много иностранцев",
        "en": "Top division, many foreigners"
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
        "ru": "Великобритания",
        "en": "United Kingdom"
      },
      "flag": "🇬🇧",
      "name": "NIHL National",
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
        "ru": "Латвия",
        "en": "Latvia"
      },
      "flag": "🇱🇻",
      "name": "Optibet hokeja līga",
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
