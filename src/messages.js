"use strict";

// User-facing strings for the application form, per language. The RU/EN split is
// driven by a hidden `locale` field the form submits, so a player sees validation
// errors and status responses in the language of the page they filled in.
const MESSAGES = {
  ru: {
    playerName: "Укажите имя и фамилию.",
    birthYear: "Проверьте год рождения.",
    position: "Выберите позицию.",
    citizenship: "Укажите гражданство.",
    currentClub: "Укажите текущий клуб или «без клуба».",
    heightCm: "Рост должен быть от 120 до 230 см.",
    weightKg: "Вес должен быть от 35 до 180 кг.",
    stickHand: "Выберите хват.",
    phone: "Укажите WhatsApp или телефон.",
    email: "Укажите корректный email — на него придёт ответ.",
    eliteProspectsUrl: "Укажите корректную ссылку Elite Prospects.",
    videoUrlsMax: "Можно добавить не более трёх ссылок.",
    videoUrlsInvalid: "Проверьте ссылки на видео.",
    availableFrom: "Проверьте дату доступности.",
    dataConsent: "Необходимо согласие на обработку данных.",
    website: "Не удалось отправить заявку.",
    parentName: "Укажите имя родителя или представителя.",
    parentContact: "Укажите контакт родителя или представителя.",
    parentConsent: "Необходимо согласие родителя или представителя.",
    filesMax: "Можно загрузить не более трёх файлов.",
    filesSize: "Общий размер файлов не должен превышать 10 МБ.",
    filesType: "Разрешены только настоящие PDF, JPG и PNG файлы.",
    turnstile: "Подтвердите, что вы не робот.",
    serviceUnavailable: "Форма временно недоступна. Свяжитесь с нами напрямую.",
    verificationUnavailable: "Проверка безопасности временно недоступна. Попробуйте позже или свяжитесь с нами напрямую.",
    verificationFailed: "Проверка безопасности истекла или уже была использована. Повторите её.",
    persistenceFailed: "Не удалось сохранить заявку. Данные не были приняты — попробуйте ещё раз."
  },
  en: {
    playerName: "Enter your first and last name.",
    birthYear: "Check your birth year.",
    position: "Select a position.",
    citizenship: "Enter your citizenship.",
    currentClub: "Enter your current club, or “no club”.",
    heightCm: "Height must be between 120 and 230 cm.",
    weightKg: "Weight must be between 35 and 180 kg.",
    stickHand: "Select which hand you shoot.",
    phone: "Enter a WhatsApp number or phone.",
    email: "Enter a valid email address — we reply there.",
    eliteProspectsUrl: "Enter a valid Elite Prospects link.",
    videoUrlsMax: "You can add up to three links.",
    videoUrlsInvalid: "Check your video links.",
    availableFrom: "Check the availability date.",
    dataConsent: "Consent to data processing is required.",
    website: "Could not send the application.",
    parentName: "Enter a parent or guardian name.",
    parentContact: "Enter a parent or guardian contact.",
    parentConsent: "Parent or guardian consent is required.",
    filesMax: "You can upload up to three files.",
    filesSize: "Total file size must not exceed 10 MB.",
    filesType: "Only genuine PDF, JPG and PNG files are allowed.",
    turnstile: "Confirm that you are not a robot.",
    serviceUnavailable: "The form is temporarily unavailable. Please contact us directly.",
    verificationUnavailable: "Security verification is temporarily unavailable. Please try again later or contact us directly.",
    verificationFailed: "Security verification expired or was already used. Please try again.",
    persistenceFailed: "Could not save the application. Your data was not accepted — please try again."
  }
};

// Anything other than an explicit "en" falls back to Russian (the default site).
function normalizeLocale(value) {
  return String(value || "").toLowerCase() === "en" ? "en" : "ru";
}

function messages(locale) {
  return MESSAGES[normalizeLocale(locale)];
}

module.exports = { MESSAGES, messages, normalizeLocale };
