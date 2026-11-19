// "Club vacancies and deadlines" subscription block for the Telegram channel.
// Injected by src/app.js under guides and on the club-needs page. The channel
// is anonymous for subscribers: the site collects nothing here.
const TELEGRAM_CHANNEL_URL = "https://t.me/eu_hockeyagency";

const COPY = {
  en: {
    title: "Club vacancies and transfer deadlines — in Telegram",
    text: "Once a week: open requests from clubs (position, birth year, passport) and the transfer deadlines coming up. Urgent vacancies are posted the same day.",
    button: "Join the Telegram channel"
  },
  ru: {
    title: "Вакансии клубов и трансферные дедлайны — в Telegram",
    text: "Раз в неделю: открытые запросы клубов (позиция, год рождения, паспорт) и ближайшие трансферные дедлайны. Срочные вакансии публикуем в тот же день.",
    button: "Подписаться на Telegram-канал"
  }
};

function channelCta(locale) {
  const c = COPY[locale === "ru" ? "ru" : "en"];
  return `<section class="channel-cta wrap" aria-labelledby="channel-cta-title"><div class="channel-cta-box"><h2 id="channel-cta-title">${c.title}</h2><p>${c.text}</p><a class="btn primary" href="${TELEGRAM_CHANNEL_URL}" target="_blank" rel="noopener" data-channel-cta="telegram">${c.button}</a></div></section>`;
}

const CHANNEL_CTA_PATHS = new Set(["/club-needs", "/zaprosy-klubov"]);

function wantsChannelCta(logicalPath) {
  return logicalPath.startsWith("/guides/") || CHANNEL_CTA_PATHS.has(logicalPath);
}

module.exports = { channelCta, wantsChannelCta, TELEGRAM_CHANNEL_URL };
