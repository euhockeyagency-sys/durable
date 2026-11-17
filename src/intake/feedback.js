// Player-facing feedback after submission, in the form's language. Built from
// what is missing in the confirmed data, never from the internal tier: no
// category, score or refusal is ever shown. No promises of visa, contract or
// invitation, and no verdicts on level from a form alone.
const T = {
  en: {
    intro: "Thank you. Your application is saved and the agent will review it personally.",
    video: "Add video: a few complete shifts with context (not only highlights), your jersey number and colour, and if possible one full game.",
    videoGoalie: "Add video: game sequences that show your positioning, rebounds and puck handling, your jersey number and colour, and if possible one full game.",
    fullGame: "If you have it, add one full game: clubs use it to see your role, not only your best moments.",
    stats: "Add statistics for the last seasons (games, and for skaters goals and assists; for goalies GAA and save percentage), regular season and playoffs separately.",
    level: "Tell us the league and level you play in now.",
    measurements: "Add your height and weight.",
    availability: "Tell us from which date you are available.",
    goals: "Describe your goal for next season (for example: senior hockey in Europe, a junior league, college in the USA).",
    eliteProspects: "If you have an Elite Prospects profile, add the link.",
    outside: "Our current work focuses on routes in European senior and junior hockey and on junior and college routes in North America. Your profile does not match these routes right now; you can still ask for a manual review or update the application later.",
    next: "You can update your data and send the application again at any time, or ask for a manual review.",
  },
  ru: {
    intro: "Спасибо. Заявка сохранена, агент рассмотрит её лично.",
    video: "Добавьте видео: несколько полных смен с контекстом игры (не только хайлайты), номер и цвет формы, а по возможности — один полный матч.",
    videoGoalie: "Добавьте видео: игровые эпизоды, где видны выбор позиции, отскоки и игра клюшкой, номер и цвет формы, а по возможности — один полный матч.",
    fullGame: "Если есть, приложите один полный матч: по нему клубы видят вашу роль, а не только лучшие моменты.",
    stats: "Добавьте статистику за последние сезоны (игры, у полевых — голы и передачи, у вратарей — КН и процент отражённых), отдельно регулярный сезон и плей-офф.",
    level: "Укажите лигу и уровень, где вы играете сейчас.",
    measurements: "Укажите рост и вес.",
    availability: "Укажите, с какой даты вы свободны.",
    goals: "Опишите цель на следующий сезон (например: взрослый хоккей в Европе, юниорская лига, колледж в США).",
    eliteProspects: "Если у вас есть профиль Elite Prospects, добавьте ссылку.",
    outside: "Сейчас мы работаем с маршрутами во взрослом и юниорском хоккее Европы и с юниорскими и студенческими маршрутами в Северной Америке. Сейчас ваш профиль не совпадает с этими направлениями; вы можете запросить ручное рассмотрение или обновить заявку позже.",
    next: "Вы можете в любой момент обновить данные и отправить заявку повторно или запросить ручное рассмотрение.",
  },
};

function playerFeedback(app, assessment, locale = "ru") {
  const t = T[locale === "en" ? "en" : "ru"];
  const items = [];
  const missing = new Set(assessment.missing || []);
  if (missing.has("video")) items.push(app.position === "goalie" ? t.videoGoalie : t.video);
  else if (missing.has("fullGameVideo")) items.push(t.fullGame);
  if (missing.has("stats")) items.push(t.stats);
  if (missing.has("current_level")) items.push(t.level);
  if (missing.has("measurements")) items.push(t.measurements);
  if (missing.has("availability")) items.push(t.availability);
  if (missing.has("goals")) items.push(t.goals);
  if (missing.has("eliteProspects")) items.push(t.eliteProspects);
  if (assessment.category === "not_fit") items.push(t.outside);
  return { intro: t.intro, items, next: t.next };
}

module.exports = { playerFeedback };
