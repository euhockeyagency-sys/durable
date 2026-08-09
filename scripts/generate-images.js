#!/usr/bin/env node
// Generates branded article covers and league-pyramid diagrams.
// Run manually after adding an article:  node scripts/generate-images.js
const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

const OUT = path.join(__dirname, "..", "public", "assets", "covers");
const INK = "#030b14";
const BLUE = "#1687ff";
const BLUE_SOFT = "#7fc0ff";
const MUTED = "#9db0c3";

const ARTICLES = [
  { slug: "kak-najti-hokkejnyj-klub-v-evrope", category: "Карьера", title: "Как найти хоккейный клуб в Европе" },
  { slug: "hokkejnoe-rezyume", category: "Подготовка", title: "Хоккейное резюме для европейского клуба" },
  { slug: "video-dlya-kluba", category: "Видео", title: "Какое видео нужно европейскому клубу" },
  { slug: "kak-vybrat-ligu", category: "Выбор лиги", title: "Как оценить реалистичный уровень лиги" },
  { slug: "kak-rabotaet-hokkejnyj-agent", category: "Карьера", title: "Как работает хоккейный агент" },
  { slug: "hokkej-v-finlyandii", category: "Страны · Финляндия", title: "Хоккей в Финляндии: лиги и как попасть" },
  { slug: "hokkej-v-shvecii", category: "Страны · Швеция", title: "Хоккей в Швеции: лиги и как попасть" },
  { slug: "hokkej-v-chexii", category: "Страны · Чехия", title: "Хоккей в Чехии: лиги и как попасть" },
  { slug: "hokkej-v-germanii", category: "Страны · Германия", title: "Хоккей в Германии: лиги и как попасть" },
  { slug: "hokkej-v-polshe", category: "Страны · Польша", title: "Хоккей в Польше: лиги и как попасть" },
  { slug: "hockey-in-poland", category: "Countries · Poland", title: "Hockey in Poland: leagues, imports and work rules", domain: "eurohockeyagency.com" },
  { slug: "ligi-evropy", category: "Справочник", title: "Хоккейные лиги Европы: уровни и легионеры" },
  { slug: "kalkulyator-urovnya", category: "Инструмент", title: "Калькулятор уровня: какая лига реальна" }
  ,{ slug: "junior-hockey-leagues", category: "Junior hockey", title: "Junior hockey leagues in Europe", domain: "eurohockeyagency.com" }
  ,{ slug: "junior-hockey-for-parents", category: "Junior hockey", title: "Junior hockey abroad: a parent guide", domain: "eurohockeyagency.com" }
  ,{ slug: "sweden-j20", category: "Junior leagues · Sweden", title: "Sweden J20 Nationell: player route", domain: "eurohockeyagency.com" }
  ,{ slug: "sweden-j18", category: "Junior leagues · Sweden", title: "Sweden J18 Nationell: player route", domain: "eurohockeyagency.com" }
  ,{ slug: "yuniorskie-ligi-evropy", category: "Юниорский хоккей", title: "Юниорские хоккейные лиги Европы" }
  ,{ slug: "yuniorskij-hokkej-roditelyam", category: "Юниорский хоккей", title: "Юниорский хоккей за рубежом: родителям" }
  ,{ slug: "alps-hockey-league", category: "Leagues · Europe", title: "Alps Hockey League", domain: "eurohockeyagency.com" },
  { slug: "austria-ice-hockey-league", category: "Leagues · Austria", title: "win2day ICE Hockey League", domain: "eurohockeyagency.com" },
  { slug: "avstriya-ice-hockey-league", category: "Лиги · Австрия", title: "win2day ICE Hockey League" },
  { slug: "chehiya-maxa-liga", category: "Лиги · Чехия", title: "Maxa liga" },
  { slug: "chehiya-tipsport-extraliga", category: "Лиги · Чехия", title: "Tipsport Extraliga" },
  { slug: "czechia-maxa-liga", category: "Leagues · Czechia", title: "Maxa liga", domain: "eurohockeyagency.com" },
  { slug: "czechia-tipsport-extraliga", category: "Leagues · Czechia", title: "Tipsport Extraliga", domain: "eurohockeyagency.com" },
  { slug: "daniya-1-division", category: "Лиги · Дания", title: "Дания 1. division" },
  { slug: "daniya-metal-ligaen", category: "Лиги · Дания", title: "Metal Ligaen" },
  { slug: "denmark-1-division", category: "Leagues · Denmark", title: "Denmark 1. Division", domain: "eurohockeyagency.com" },
  { slug: "denmark-metal-ligaen", category: "Leagues · Denmark", title: "Metal Ligaen", domain: "eurohockeyagency.com" },
  { slug: "documents-for-junior-and-senior-hockey-players", category: "Documents", title: "Documents for junior and senior hockey players in Europe", domain: "eurohockeyagency.com" },
  { slug: "dokumenty-dlya-yuniora-i-vzroslogo-hokkeista", category: "Документы", title: "Документы для юниора и взрослого хоккеиста в Европе" },
  { slug: "dokumenty-i-transfery-v-hokkee", category: "Документы", title: "Документы, визы и трансферы для хоккеистов" },
  { slug: "eu-vs-non-eu-passport-in-hockey", category: "Documents", title: "EU vs non-EU passport in European hockey", domain: "eurohockeyagency.com" },
  { slug: "find-a-hockey-club-in-europe", category: "Career", title: "Find a hockey club in Europe", domain: "eurohockeyagency.com" },
  { slug: "finland-mestis", category: "Leagues · Finland", title: "Mestis", domain: "eurohockeyagency.com" },
  { slug: "finland-suomi-sarja", category: "Leagues · Finland", title: "Suomi-sarja", domain: "eurohockeyagency.com" },
  { slug: "finlyandiya-mestis", category: "Лиги · Финляндия", title: "Mestis" },
  { slug: "finlyandiya-suomi-sarja", category: "Лиги · Финляндия", title: "Suomi-sarja" },
  { slug: "france-division-1", category: "Leagues · France", title: "France Division 1", domain: "eurohockeyagency.com" },
  { slug: "france-ligue-magnus", category: "Leagues · France", title: "Synerglace Ligue Magnus", domain: "eurohockeyagency.com" },
  { slug: "franciya-division-1", category: "Лиги · Франция", title: "France Division 1" },
  { slug: "franciya-ligue-magnus", category: "Лиги · Франция", title: "Synerglace Ligue Magnus" },
  { slug: "germaniya-del2", category: "Лиги · Германия", title: "DEL2" },
  { slug: "germaniya-oberliga", category: "Лиги · Германия", title: "Oberliga" },
  { slug: "germany-del2", category: "Leagues · Germany", title: "DEL2", domain: "eurohockeyagency.com" },
  { slug: "germany-oberliga", category: "Leagues · Germany", title: "Oberliga", domain: "eurohockeyagency.com" },
  { slug: "hockey-agent-in-germany", category: "Career", title: "Hockey agent in Germany", domain: "eurohockeyagency.com" },
  { slug: "hockey-agent-in-sweden", category: "Career", title: "Hockey agent in Sweden", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-austria", category: "Countries · Austria", title: "Hockey in Austria", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-canada", category: "Countries · Canada", title: "Hockey in Canada", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-czechia", category: "Countries · Czechia", title: "Hockey in Czechia", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-denmark", category: "Countries · Denmark", title: "Hockey in Denmark", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-estonia", category: "Countries · Estonia", title: "Hockey in Estonia", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-finland", category: "Countries · Finland", title: "Hockey in Finland", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-france", category: "Countries · France", title: "Hockey in France", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-germany", category: "Countries · Germany", title: "Hockey in Germany", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-hungary", category: "Countries · Hungary", title: "Hockey in Hungary", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-italy", category: "Countries · Italy", title: "Hockey in Italy", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-japan", category: "Countries · Japan", title: "Hockey in Japan", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-kazakhstan", category: "Countries · Kazakhstan", title: "Hockey in Kazakhstan", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-latvia", category: "Countries · Latvia", title: "Hockey in Latvia", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-lithuania", category: "Countries · Lithuania", title: "Hockey in Lithuania", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-netherlands", category: "Countries · Netherlands", title: "Hockey in Netherlands", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-norway", category: "Countries · Norway", title: "Hockey in Norway", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-romania", category: "Countries · Romania", title: "Hockey in Romania", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-slovakia", category: "Countries · Slovakia", title: "Hockey in Slovakia", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-slovenia", category: "Countries · Slovenia", title: "Hockey in Slovenia", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-spain", category: "Countries · Spain", title: "Hockey in Spain", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-sweden", category: "Countries · Sweden", title: "Hockey in Sweden", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-switzerland", category: "Countries · Switzerland", title: "Hockey in Switzerland", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-united-kingdom", category: "Countries · United Kingdom", title: "Hockey in United Kingdom", domain: "eurohockeyagency.com" },
  { slug: "hockey-in-usa", category: "Countries · United States", title: "Hockey in United States", domain: "eurohockeyagency.com" },
  { slug: "hockey-market-map-2026", category: "Reference", title: "Hockey Market Map 2026", domain: "eurohockeyagency.com" },
  { slug: "hockey-resume-for-european-clubs", category: "Career", title: "Hockey resume for a European club", domain: "eurohockeyagency.com" },
  { slug: "hockey-transfer-windows", category: "Documents", title: "Hockey transfer windows", domain: "eurohockeyagency.com" },
  { slug: "hockey-video-for-clubs", category: "Career", title: "What hockey video European clubs need", domain: "eurohockeyagency.com" },
  { slug: "hockey-visas-and-transfers", category: "Documents", title: "Hockey visas, passports and international transfers", domain: "eurohockeyagency.com" },
  { slug: "hokkej-v-avstrii", category: "Страны · Австрия", title: "Хоккей в Австрии" },
  { slug: "hokkej-v-danii", category: "Страны · Дания", title: "Хоккей в Дании" },
  { slug: "hokkej-v-estonii", category: "Страны · Эстония", title: "Хоккей в Эстонии" },
  { slug: "hokkej-v-italii", category: "Страны · Италия", title: "Хоккей в Италии" },
  { slug: "hokkej-v-kanade", category: "Страны · Канада", title: "Хоккей в Канаде" },
  { slug: "hokkej-v-kazahstane", category: "Страны · Казахстан", title: "Хоккей в Казахстане" },
  { slug: "hokkej-v-latvii", category: "Страны · Латвия", title: "Хоккей в Латвии" },
  { slug: "hokkej-v-litve", category: "Страны · Литва", title: "Хоккей в Литве" },
  { slug: "hokkej-v-niderlandah", category: "Страны · Нидерланды", title: "Хоккей в Нидерландах" },
  { slug: "hokkej-v-norvegii", category: "Страны · Норвегия", title: "Хоккей в Норвегии" },
  { slug: "hokkej-v-rumynii", category: "Страны · Румыния", title: "Хоккей в Румынии" },
  { slug: "hokkej-v-shvejcarii", category: "Страны · Швейцария", title: "Хоккей в Швейцарии" },
  { slug: "hokkej-v-slovakii", category: "Страны · Словакия", title: "Хоккей в Словакии" },
  { slug: "hokkej-v-slovenii", category: "Страны · Словения", title: "Хоккей в Словении" },
  { slug: "hokkej-v-ispanii", category: "Страны · Испания", title: "Хоккей в Испании" },
  { slug: "hokkej-v-ssha", category: "Страны · США", title: "Хоккей в США: лиги, легионеры и документы" },
  { slug: "hokkej-v-velikobritanii", category: "Страны · Великобритания", title: "Хоккей в Великобритании" },
  { slug: "hokkej-v-vengrii", category: "Страны · Венгрия", title: "Хоккей в Венгрии" },
  { slug: "hokkej-v-yaponii", category: "Страны · Япония", title: "Хоккей в Японии" },
  { slug: "hokkej-vo-francii", category: "Страны · Франция", title: "Хоккей во Франции" },
  { slug: "hokkejnyj-agent-v-germanii", category: "Карьера", title: "Хоккейный агент в Германии" },
  { slug: "hokkejnyj-agent-v-shvecii", category: "Карьера", title: "Хоккейный агент в Швеции" },
  { slug: "how-a-hockey-agent-works", category: "Career", title: "How a hockey agent works and what the service costs", domain: "eurohockeyagency.com" },
  { slug: "how-to-choose-a-hockey-league", category: "Career", title: "How to choose a realistic hockey league level in Europe", domain: "eurohockeyagency.com" },
  { slug: "how-to-verify-a-hockey-club-offer", category: "Career", title: "How to verify a hockey club offer", domain: "eurohockeyagency.com" },
  { slug: "hungary-andersen-liga", category: "Leagues · Hungary", title: "Andersen Liga", domain: "eurohockeyagency.com" },
  { slug: "hungary-erste-liga", category: "Leagues · Hungary", title: "Erste Liga", domain: "eurohockeyagency.com" },
  { slug: "iihf-international-transfer", category: "Documents", title: "IIHF international transfer", domain: "eurohockeyagency.com" },
  { slug: "italiya-ihl-serie-a", category: "Лиги · Италия", title: "IHL Serie A" },
  { slug: "italiya-italian-hockey-league", category: "Лиги · Италия", title: "Italian Hockey League" },
  { slug: "italy-ihl-serie-a", category: "Leagues · Italy", title: "IHL Serie A", domain: "eurohockeyagency.com" },
  { slug: "italy-italian-hockey-league", category: "Leagues · Italy", title: "Italian Hockey League", domain: "eurohockeyagency.com" },
  { slug: "kak-proverit-predlozhenie-hokkejnogo-kluba", category: "Карьера", title: "Как проверить предложение хоккейного клуба: 15 пунктов" },
  { slug: "karta-hokkejnyh-rynkov-2026", category: "Справочник", title: "Карта хоккейных рынков 2026" },
  { slug: "latvia-1-liga", category: "Leagues · Latvia", title: "1. Līga", domain: "eurohockeyagency.com" },
  { slug: "latvia-optibet-hokeja-liga", category: "Leagues · Latvia", title: "Optibet Hokeja Līga", domain: "eurohockeyagency.com" },
  { slug: "latviya-1-liga", category: "Лиги · Латвия", title: "1. Līga" },
  { slug: "latviya-optibet-hokeja-liga", category: "Лиги · Латвия", title: "Optibet Hokeja Līga" },
  { slug: "mezhdunarodnyj-transfer-iihf", category: "Документы", title: "Международный трансфер IIHF" },
  { slug: "netherlands-cehl", category: "Leagues · Netherlands", title: "CEHL", domain: "eurohockeyagency.com" },
  { slug: "netherlands-eredivisie", category: "Leagues · Netherlands", title: "Netherlands Eredivisie", domain: "eurohockeyagency.com" },
  { slug: "niderlandy-cehl", category: "Лиги · Нидерланды", title: "CEHL" },
  { slug: "niderlandy-eredivisie", category: "Лиги · Нидерланды", title: "Eredivisie Нидерландов" },
  { slug: "norvegiya-elitehockeyligaen", category: "Лиги · Норвегия", title: "Elitehockeyligaen" },
  { slug: "norvegiya-hockeyliga1", category: "Лиги · Норвегия", title: "Hockeyliga1" },
  { slug: "norway-elitehockeyligaen", category: "Leagues · Norway", title: "Elitehockeyligaen", domain: "eurohockeyagency.com" },
  { slug: "norway-hockeyliga1", category: "Leagues · Norway", title: "Hockeyliga1", domain: "eurohockeyagency.com" },
  { slug: "pasport-es-i-non-eu-v-hokkee", category: "Документы", title: "Паспорт ЕС и non-EU в европейском хоккее" },
  { slug: "poezdka-na-prosmotr-v-hokkejnyj-klub", category: "Карьера", title: "Поездка на просмотр в хоккейный клуб" },
  { slug: "poland-1-liga-mhl", category: "Leagues · Poland", title: "Polish 1 Liga / MHL", domain: "eurohockeyagency.com" },
  { slug: "poland-tauron-hokej-liga", category: "Leagues · Poland", title: "TAURON Hokej Liga", domain: "eurohockeyagency.com" },
  { slug: "polsha-1-liga-mhl", category: "Лиги · Польша", title: "Польская 1 Liga / MHL" },
  { slug: "polsha-tauron-hokej-liga", category: "Лиги · Польша", title: "TAURON Hokej Liga" },
  { slug: "rabochaya-viza-dlya-hokkeista", category: "Документы", title: "Рабочая виза для хоккеиста" },
  { slug: "romania-campionatul-national", category: "Leagues · Romania", title: "Romanian Senior Championship", domain: "eurohockeyagency.com" },
  { slug: "rumyniya-campionatul-national", category: "Лиги · Румыния", title: "Чемпионат Румынии" },
  { slug: "shvejcariya-national-league", category: "Лиги · Швейцария", title: "National League Швейцарии" },
  { slug: "shvejcariya-sky-swiss-league", category: "Лиги · Швейцария", title: "Sky Swiss League" },
  { slug: "shvetsiya-hockeyallsvenskan", category: "Лиги · Швеция", title: "HockeyAllsvenskan" },
  { slug: "shvetsiya-hockeyettan", category: "Лиги · Швеция", title: "HockeyEttan" },
  { slug: "shvetsiya-j18", category: "Лиги · Швеция", title: "J18 Nationell" },
  { slug: "shvetsiya-j20", category: "Лиги · Швеция", title: "J20 Nationell" },
  { slug: "slovakia-tipos-shl", category: "Leagues · Slovakia", title: "TIPOS SHL", domain: "eurohockeyagency.com" },
  { slug: "slovakia-tipsport-liga", category: "Leagues · Slovakia", title: "Tipsport liga", domain: "eurohockeyagency.com" },
  { slug: "slovakiya-tipos-shl", category: "Лиги · Словакия", title: "TIPOS SHL" },
  { slug: "slovakiya-tipsport-liga", category: "Лиги · Словакия", title: "Tipsport liga" },
  { slug: "sweden-hockeyallsvenskan", category: "Leagues · Sweden", title: "HockeyAllsvenskan", domain: "eurohockeyagency.com" },
  { slug: "sweden-hockeyettan", category: "Leagues · Sweden", title: "HockeyEttan", domain: "eurohockeyagency.com" },
  { slug: "switzerland-national-league", category: "Leagues · Switzerland", title: "Swiss National League", domain: "eurohockeyagency.com" },
  { slug: "switzerland-sky-swiss-league", category: "Leagues · Switzerland", title: "Sky Swiss League", domain: "eurohockeyagency.com" },
  { slug: "transfernye-okna-v-hokkee", category: "Документы", title: "Трансферные окна в хоккее" },
  { slug: "travelling-for-a-hockey-tryout", category: "Career", title: "Travelling for a hockey tryout", domain: "eurohockeyagency.com" },
  { slug: "uk-eihl", category: "Leagues · United Kingdom", title: "EIHL", domain: "eurohockeyagency.com" },
  { slug: "uk-planet-ice-national-league", category: "Leagues · United Kingdom", title: "Planet Ice National League", domain: "eurohockeyagency.com" },
  { slug: "velikobritaniya-eihl", category: "Лиги · Великобритания", title: "EIHL" },
  { slug: "velikobritaniya-planet-ice-national-league", category: "Лиги · Великобритания", title: "Planet Ice National League" },
  { slug: "vengriya-andersen-liga", category: "Лиги · Венгрия", title: "Andersen Liga" },
  { slug: "vengriya-erste-liga", category: "Лиги · Венгрия", title: "Erste Liga" },
  { slug: "work-visa-for-hockey-player", category: "Documents", title: "Work visa for a hockey player", domain: "eurohockeyagency.com" },
  { slug: "estonia-unibet-hokiliiga", category: "Leagues · Estonia", title: "Unibet Hokiliiga", domain: "eurohockeyagency.com" },
  { slug: "estoniya-unibet-hokiliiga", category: "Лиги · Эстония", title: "Unibet Hokiliiga" },
  { slug: "spain-liga-nacional", category: "Leagues · Spain", title: "Liga Nacional", domain: "eurohockeyagency.com" },
  { slug: "ispaniya-liga-nacional", category: "Лиги · Испания", title: "Liga Nacional" },
  { slug: "kazakhstan-pro-hokei-ligasy", category: "Leagues · Kazakhstan", title: "Pro Hokei Ligasy", domain: "eurohockeyagency.com" },
  { slug: "kazahstan-pro-hokei-ligasy", category: "Лиги · Казахстан", title: "Pro Hokei Ligasy" },
  { slug: "japan-asia-league", category: "Leagues · Japan", title: "Asia League Ice Hockey", domain: "eurohockeyagency.com" },
  { slug: "yaponiya-asia-league", category: "Лиги · Япония", title: "Asia League Ice Hockey" },
  { slug: "usa-ncaa-division-i", category: "Leagues · United States", title: "NCAA Division I", domain: "eurohockeyagency.com" },
  { slug: "ssha-ncaa-division-i", category: "Лиги · США", title: "NCAA Division I" },
  { slug: "usa-echl", category: "Leagues · United States", title: "ECHL", domain: "eurohockeyagency.com" },
  { slug: "ssha-echl", category: "Лиги · США", title: "ECHL" },
  { slug: "hockey-in-serbia", category: "Countries · Serbia", title: "Hockey in Serbia: leagues, work permits and transfers", domain: "eurohockeyagency.com" },
  { slug: "hokkej-v-serbii", category: "Страны · Сербия", title: "Хоккей в Сербии: лиги, работа и трансферы" },
  { slug: "hockey-in-croatia", category: "Countries · Croatia", title: "Hockey in Croatia: leagues, EU rules and transfers", domain: "eurohockeyagency.com" },
  { slug: "hokkej-v-horvatii", category: "Страны · Хорватия", title: "Хоккей в Хорватии: лиги, ЕС и трансферы" },
  { slug: "hockey-in-belgium", category: "Countries · Belgium", title: "Hockey in Belgium: leagues, work permits and transfers", domain: "eurohockeyagency.com" },
  { slug: "hokkej-v-belgii", category: "Страны · Бельгия", title: "Хоккей в Бельгии: лиги, работа и трансферы" },
  { slug: "hockey-player-salaries-in-europe", category: "Reference", title: "Hockey player salaries in Europe", domain: "eurohockeyagency.com" },
  { slug: "zarplaty-hokkeistov-v-evrope", category: "Справочник", title: "Зарплаты хоккеистов в Европе" },
  { slug: "finland-junior-hockey", category: "Junior leagues · Finland", title: "Finland U20/U18 SM-sarja", domain: "eurohockeyagency.com" },
  { slug: "finlyandiya-yuniorskij-hokkej", category: "Юниорские лиги · Финляндия", title: "Финляндия U20/U18 SM-sarja" },
  { slug: "czechia-junior-hockey", category: "Junior leagues · Czechia", title: "Czechia junior hockey", domain: "eurohockeyagency.com" },
  { slug: "chehiya-yuniorskij-hokkej", category: "Юниорские лиги · Чехия", title: "Юниорский хоккей Чехии" },
  { slug: "switzerland-junior-hockey", category: "Junior leagues · Switzerland", title: "Switzerland U21/U18-Elit", domain: "eurohockeyagency.com" },
  { slug: "shvejcariya-yuniorskij-hokkej", category: "Юниорские лиги · Швейцария", title: "Швейцария U21/U18-Elit" },
  { slug: "germany-junior-hockey", category: "Junior leagues · Germany", title: "Germany U20/U17 Division", domain: "eurohockeyagency.com" },
  { slug: "germaniya-yuniorskij-hokkej", category: "Юниорские лиги · Германия", title: "Германия U20/U17 Division" },
];

// Division pyramids: listed top (strongest) to bottom (entry level).
const PYRAMIDS = [
  { slug: "hokkej-v-finlyandii", country: "Финляндия", levels: [
    { name: "Liiga", note: "Высший дивизион, элитный уровень" },
    { name: "Mestis", note: "Второй дивизион, профессиональный", entry: true },
    { name: "Suomi-sarja", note: "Третий уровень, адаптация к рынку" }
  ] },
  { slug: "hokkej-v-shvecii", country: "Швеция", levels: [
    { name: "SHL", note: "Высший дивизион, один из сильнейших в мире" },
    { name: "HockeyAllsvenskan", note: "Второй дивизион, полностью профессиональный" },
    { name: "HockeyEttan", note: "Третий уровень, полупрофессиональный", entry: true }
  ] },
  { slug: "hokkej-v-chexii", country: "Чехия", levels: [
    { name: "Extraliga", note: "Высший дивизион, высокий уровень" },
    { name: "Chance liga", note: "Второй дивизион, профессиональный", entry: true },
    { name: "2. liga", note: "Третий уровень, полупрофессиональный" }
  ] },
  { slug: "hokkej-v-germanii", country: "Германия", levels: [
    { name: "DEL", note: "Высший дивизион, сильный бюджетный чемпионат" },
    { name: "DEL2", note: "Второй дивизион, профессиональный", entry: true },
    { name: "Oberliga", note: "Третий уровень, широкий рынок" }
  ] },
  { slug: "hokkej-v-polshe", country: "Польша", levels: [
    { name: "PHL", note: "Высший дивизион, открыт для легионеров", entry: true },
    { name: "1 liga", note: "Второй дивизион, вход и адаптация" }
  ] },
  { slug: "hockey-in-poland", country: "Poland", lang: "en", levels: [
    { name: "PHL", note: "Top division; import opportunities", entry: true },
    { name: "1 liga", note: "Second level; entry and adaptation" }
  ] }
];

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Naive wrap by estimated glyph width — good enough for headline-sized text.
function wrap(text, maxChars) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > maxChars && line) { lines.push(line.trim()); line = word; }
    else line += " " + word;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function logo(x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="0" y="0" width="74" height="74" fill="${BLUE}" transform="skewX(-8)"/>
    <text x="37" y="52" font-family="Arial Black, Arial, sans-serif" font-size="34" font-weight="900" fill="#fff" text-anchor="middle">EHA</text>
    <text x="96" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="3" fill="#cfe4ff">EUROPEAN</text>
    <text x="96" y="54" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="3" fill="#cfe4ff">HOCKEY AGENCY</text>
  </g>`;
}

function coverSvg({ category, title, domain = "eurohockeyagency.ru" }) {
  const lines = wrap(title, 26).slice(0, 3);
  const size = lines.length >= 3 ? 58 : 68;
  const startY = 310; // fixed first baseline keeps clear of the category label
  const rows = lines.map((l, i) =>
    `<text x="80" y="${startY + i * (size + 12)}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="900" fill="#ffffff">${esc(l)}</text>`
  ).join("");
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INK}"/><stop offset="0.6" stop-color="#071a2c"/><stop offset="1" stop-color="#0b2740"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0" stop-color="${BLUE}" stop-opacity="0.35"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="10" height="630" fill="${BLUE}"/>
  ${logo(80, 70)}
  <text x="80" y="222" font-family="Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="4" fill="${BLUE_SOFT}">${esc(category.toUpperCase())}</text>
  ${rows}
  <text x="80" y="560" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${BLUE}">${esc(domain)}</text>
</svg>`;
}

function pyramidSvg({ country, levels, lang = "ru" }) {
  const W = 1000, H = 240 + levels.length * 130;
  const maxW = 760, minW = 420;
  const step = levels.length > 1 ? (maxW - minW) / (levels.length - 1) : 0;
  const blocks = levels.map((lvl, i) => {
    const w = minW + step * i;
    const x = (W - w) / 2;
    const y = 170 + i * 130;
    const stroke = lvl.entry ? BLUE : "rgba(255,255,255,.18)";
    const fill = lvl.entry ? "rgba(22,135,255,.16)" : "rgba(255,255,255,.05)";
    const badge = lvl.entry
      ? `<text x="${W / 2}" y="${y + 96}" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="${BLUE}" text-anchor="middle">${lang === "en" ? "REALISTIC ENTRY POINT" : "РЕАЛЬНАЯ ТОЧКА ВХОДА"}</text>`
      : "";
    return `<rect x="${x}" y="${y}" width="${w}" height="${lvl.entry ? 108 : 92}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${lvl.entry ? 3 : 1.5}"/>
      <text x="${W / 2}" y="${y + 40}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${esc(lvl.name)}</text>
      <text x="${W / 2}" y="${y + 70}" font-family="Arial, sans-serif" font-size="19" fill="${MUTED}" text-anchor="middle">${esc(lvl.note)}</text>${badge}`;
  }).join("");
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${BLUE}"/>
  <text x="${W / 2}" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="4" fill="${BLUE_SOFT}" text-anchor="middle">${lang === "en" ? "LEAGUE PYRAMID" : "ПИРАМИДА ЛИГ"}</text>
  <text x="${W / 2}" y="126" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="900" fill="#ffffff" text-anchor="middle">${esc(country)}</text>
  ${blocks}
  <text x="${W / 2}" y="${H - 28}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="${BLUE}" text-anchor="middle">${lang === "en" ? "eurohockeyagency.com" : "eurohockeyagency.ru"}</text>
</svg>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let count = 0;
  for (const article of ARTICLES) {
    const svg = Buffer.from(coverSvg(article));
    await sharp(svg).webp({ quality: 86 }).toFile(path.join(OUT, `${article.slug}.webp`));
    await sharp(svg).jpeg({ quality: 84 }).toFile(path.join(OUT, `${article.slug}.jpg`));
    count += 2;
    console.log(`обложка: ${article.slug}`);
  }
  for (const pyramid of PYRAMIDS) {
    const svg = Buffer.from(pyramidSvg(pyramid));
    await sharp(svg).webp({ quality: 88 }).toFile(path.join(OUT, `${pyramid.slug}-pyramid.webp`));
    count += 1;
    console.log(`схема:    ${pyramid.slug}`);
  }
  console.log(`\nготово: ${count} файлов в public/assets/covers/`);
})();
