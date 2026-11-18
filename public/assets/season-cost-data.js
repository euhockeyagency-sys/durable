/* Season Cost Estimator data (public/assets/season-cost-estimator.js).
   Edit THIS file to update figures; the interface reads it as is.

   Rules (see docs/season-cost-estimator-factcheck.md):
   - Only figures from a programme's or club's own published tariff/document.
   - Each entry is ONE named programme. `example: true` = one programme's
     figures, not a market average.
   - Line values:
       number            amount in `cur` for the whole period
       [lo, hi]          published range
       { inc: "line" }   included in another line (never counted twice)
       { cov: true }     covered by the programme per its own description
       null              unknown: shown as missing, never treated as zero
   - Main lines: fee, housing, meals, equipment, insurance, pocket.
     Shown separately: school, travel.
*/
(function (root) {
  "use strict";
  var DATA = {
    checked: "2026-11-18",
    markets: ["sweden", "czechia", "austria", "finland", "switzerland", "usa", "canada"],
    ages: ["U16", "U18", "U20"],
    types: ["club", "academy", "covered"],
    // Which programme types exist for a market and age group. "covered" is
    // listed only where the league itself documents what it covers.
    apply: {
      club: { all: ["U16", "U18", "U20"] },
      academy: { all: ["U16", "U18"] },
      covered: { usa: ["U18", "U20"], canada: ["U18", "U20"] }
    },
    coveredNote: {
      canada: {
        en: "CHL teams house players with billet families and the leagues describe an education package; we found no published per-season family figures.",
        ru: "Команды CHL селят игроков в принимающих семьях, лиги описывают образовательный пакет; опубликованных сумм расходов семьи за сезон мы не нашли."
      }
    },
    entries: [
      {
        id: "se-tyreso-u16", market: "sweden", ages: ["U16"], type: "club", example: true,
        name: "Tyresö Hanviken Hockey (U15–16 team fee)",
        cur: "SEK", season: "2026/27", period: { en: "season, billed Aug–Nov", ru: "сезон, счета август–ноябрь" },
        src: "https://s3-eu-west-1.amazonaws.com/myclub-site/uploads/documents/000/031/378/THH_F_rv_ntansdok_s_s_26-27_3.0.pdf",
        lines: { fee: [10300, 11850], housing: null, meals: null, equipment: null, insurance: null, pocket: null, school: null, travel: null },
        note: {
          en: "Section fee SEK 10,000–11,500 for U15–16 plus the SEK 300 club membership (2026). A local club fee: housing, meals and school for a player from abroad are not part of it.",
          ru: "Взнос секции 10 000–11 500 SEK для U15–16 плюс членский взнос клуба 300 SEK (2026). Это взнос местного клуба: жильё, питание и школа для игрока из-за рубежа в него не входят."
        }
      },
      {
        id: "se-tyreso-junior", market: "sweden", ages: ["U18", "U20"], type: "club", example: true,
        name: "Tyresö Hanviken Hockey (Junior team fee)",
        cur: "SEK", season: "2026/27", period: { en: "season, billed Sep–Dec", ru: "сезон, счета сентябрь–декабрь" },
        src: "https://s3-eu-west-1.amazonaws.com/myclub-site/uploads/documents/000/031/378/THH_F_rv_ntansdok_s_s_26-27_3.0.pdf",
        lines: { fee: 17300, housing: null, meals: null, equipment: null, insurance: null, pocket: null, school: null, travel: null },
        note: {
          en: "Junior section fee SEK 17,000 plus SEK 300 membership. The club's document does not define which ages “Junior” covers — confirm U18/U20 with the club.",
          ru: "Взнос секции «Junior» 17 000 SEK плюс членский взнос 300 SEK. В документе клуба не указано, какие возрасты входят в «Junior», — уточните U18/U20 у клуба."
        }
      },
      {
        id: "cz-vsetin", market: "czechia", ages: ["U16", "U18", "U20"], type: "club", example: true,
        name: "VHK Vsetín (youth membership contribution)",
        cur: "CZK", season: "2025/26", period: { en: "season, two instalments", ru: "сезон, два платежа" },
        src: "https://hc-vsetin.cz/docs/Prispevky_2025-2026.pdf",
        lines: { fee: 17900, housing: null, meals: null, equipment: null, insurance: null, pocket: null, school: null, travel: null },
        note: {
          en: "CZK 17,900 per season for 9th grade, dorost and junioři (2 × 8,950). 2025/26 is the latest published tariff we found; ask the club for 2026/27.",
          ru: "17 900 CZK за сезон для 9-го класса, дороста и юниоров (2 × 8 950). Это последний найденный опубликованный тариф (2025/26); тариф на 2026/27 уточните в клубе."
        }
      },
      {
        id: "us-ssm-intl", market: "usa", ages: ["U16", "U18"], type: "academy", example: true,
        name: "Shattuck-St. Mary's — international boarding + Hockey Signature Program",
        cur: "USD", season: "2026/27", period: { en: "school year", ru: "учебный год" },
        src: "https://www.s-sm.org/admissions/affording-ssm",
        lines: {
          fee: 11000, school: 73000, housing: { inc: "school" }, meals: { inc: "school" },
          equipment: [400, 800], insurance: null, pocket: 3000, travel: null
        },
        note: {
          en: "Tuition $73,000 includes meals, room and instruction; Hockey Signature Program $11,000. Equipment line = the school's uniform estimate ($400–800); pocket line = the required $3,000 incidental deposit (allowances, airport transfers, laundry). Books $400–800 are extra. Health insurance is not priced for international students.",
          ru: "Обучение $73 000 включает питание, проживание и занятия; хоккейная программа Signature $11 000. Строка «экипировка» — оценка школы на форму ($400–800); «карманные» — обязательный депозит $3 000 (карманные деньги, трансферы, стирка). Учебники $400–800 — отдельно. Страховка для иностранных учеников не оценена."
        }
      },
      {
        id: "us-cats-aha", market: "usa", ages: ["U16", "U18"], type: "academy", example: true,
        name: "American Hockey Academy — CATS Academy Boston (school and boarding only)",
        cur: "USD", season: "2026/27", period: { en: "school year", ru: "учебный год" },
        src: "https://www.catsacademyboston.com/admissions/fees/",
        lines: { fee: null, school: 41700, housing: 34000, meals: null, equipment: null, insurance: null, pocket: null, travel: null },
        note: {
          en: "High School Diploma tuition $41,200 + $500 registration; full-time dormitory boarding $34,000; $2,500 deposit. No hockey programme fee is published — ask the academy.",
          ru: "Обучение High School Diploma $41 200 + регистрация $500; проживание в общежитии $34 000; депозит $2 500. Взнос за хоккейную программу не опубликован — уточните в академии."
        }
      },
      {
        id: "us-ushl", market: "usa", ages: ["U18", "U20"], type: "covered", example: false,
        name: "USHL (Tier I model)",
        cur: "USD", season: "2026/27", period: { en: "season", ru: "сезон" },
        src: "https://ushl.com/sports/2022/8/15/ladderdevelopment.aspx",
        lines: { fee: { cov: true }, housing: { cov: true }, meals: null, equipment: { cov: true }, insurance: null, pocket: null, school: null, travel: { cov: true } },
        note: {
          en: "The league's Tier I model covers hockey development, equipment, billet housing and team travel. Personal costs, school and insurance must be checked in the written offer and the 2026 SPDA.",
          ru: "Модель Tier I лиги покрывает хоккейную подготовку, экипировку, проживание в принимающей семье и выезды команды. Личные расходы, школу и страховку проверяйте по письменному предложению и SPDA 2026."
        }
      },
      {
        id: "ca-ciha-intl", market: "canada", ages: ["U16", "U18"], type: "academy", example: true,
        name: "Canadian International Hockey Academy — international student",
        cur: "CAD", season: { en: "not stated on the page (checked 18 Nov 2026)", ru: "на странице не указан (проверено 18.11.2026)" },
        period: { en: "school year", ru: "учебный год" },
        src: "https://www.cihacademy.com/admissions/tuition-cost/",
        lines: {
          fee: 53900, school: { inc: "fee" }, housing: { inc: "fee" }, meals: { inc: "fee" },
          equipment: null, insurance: null, pocket: null, travel: { inc: "fee" }
        },
        note: {
          en: "CAD 53,900 includes academics, the hockey programme, room and board, and travel and meals at regional tournaments. Not included: health insurance, textbooks (about CAD 300–500), the apparel/uniform package (unpriced) and the CSSHL player fee of 450. The page says prices may change without notice.",
          ru: "53 900 CAD включают учёбу, хоккейную программу, проживание и питание, поездки и питание на региональных турнирах. Не входят: медицинская страховка, учебники (около 300–500 CAD), комплект формы (цена не указана) и взнос игрока CSSHL 450. На странице сказано, что цены могут меняться без уведомления."
        }
      }
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = DATA;
  else root.EHA_SEASON_COST = DATA;
})(typeof window !== "undefined" ? window : this);
