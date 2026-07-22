const path = require("node:path");
const { messages, normalizeLocale } = require("./messages");

const POSITION_VALUES = new Set(["forward", "defense", "goalie"]);
const STICK_VALUES = new Set(["left", "right"]);
const ALLOWED_FILES = {
  "application/pdf": { extensions: new Set([".pdf"]), signature: (b) => b.subarray(0, 5).toString() === "%PDF-" },
  "image/jpeg": { extensions: new Set([".jpg", ".jpeg"]), signature: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extensions: new Set([".png"]), signature: (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) }
};

const text = (value, max = 500) => String(value || "").trim().slice(0, max);
const checked = (value) => ["true", "on", "1", "yes"].includes(String(value || "").toLowerCase());

function httpUrl(value, options = {}) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (options.hostname && parsed.hostname !== options.hostname && !parsed.hostname.endsWith(`.${options.hostname}`)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === "" ? [] : [value];
}

function validateApplication(body, files, now = new Date(), requireTurnstile = true, locale = "ru") {
  const m = messages(locale);
  const errors = {};
  const currentYear = now.getUTCFullYear();
  const birthYear = Number(body.birthYear);
  const heightCm = Number(body.heightCm);
  const weightKg = Number(body.weightKg);
  const playerName = text(body.playerName, 120);
  const citizenship = text(body.citizenship, 100);
  const currentClub = text(body.currentClub, 160);
  const phone = text(body.phone, 60);
  const email = text(body.email, 160).toLowerCase();
  const position = text(body.position, 20);
  const stickHand = text(body.stickHand, 20);
  const eliteProspectsUrl = httpUrl(text(body.eliteProspectsUrl, 500), { hostname: "eliteprospects.com" });
  const videoInputs = asArray(body.videoUrls).map((value) => text(value, 500)).filter(Boolean);
  const videoUrls = videoInputs.map((value) => httpUrl(value));
  const isMinor = Number.isInteger(birthYear) && birthYear >= currentYear - 18;

  if (!playerName) errors.playerName = m.playerName;
  if (!Number.isInteger(birthYear) || birthYear < currentYear - 60 || birthYear > currentYear - 8) errors.birthYear = m.birthYear;
  if (!POSITION_VALUES.has(position)) errors.position = m.position;
  if (!citizenship) errors.citizenship = m.citizenship;
  if (!currentClub) errors.currentClub = m.currentClub;
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) errors.heightCm = m.heightCm;
  if (!Number.isFinite(weightKg) || weightKg < 35 || weightKg > 180) errors.weightKg = m.weightKg;
  if (!STICK_VALUES.has(stickHand)) errors.stickHand = m.stickHand;
  if (!phone) errors.phone = m.phone;
  // Required since applications are answered by email: without an address there
  // is no way to reply to the player.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = m.email;
  if (!eliteProspectsUrl) errors.eliteProspectsUrl = m.eliteProspectsUrl;
  if (videoInputs.length > 3) errors.videoUrls = m.videoUrlsMax;
  if (videoUrls.some((url) => !url)) errors.videoUrls = m.videoUrlsInvalid;
  if (body.availableFrom && !/^\d{4}-\d{2}-\d{2}$/.test(body.availableFrom)) errors.availableFrom = m.availableFrom;
  if (!checked(body.dataConsent)) errors.dataConsent = m.dataConsent;
  if (text(body.website, 200)) errors.website = m.website;

  const parentName = text(body.parentName, 120);
  const parentContact = text(body.parentContact, 160);
  if (isMinor && !parentName) errors.parentName = m.parentName;
  if (isMinor && !parentContact) errors.parentContact = m.parentContact;
  if (isMinor && !checked(body.parentConsent)) errors.parentConsent = m.parentConsent;

  if (files.length > 3) errors.files = m.filesMax;
  if (files.reduce((sum, file) => sum + file.size, 0) > 10 * 1024 * 1024) errors.files = m.filesSize;
  for (const file of files) {
    const rule = ALLOWED_FILES[file.mimetype];
    const extension = path.extname(file.originalname).toLowerCase();
    if (!rule || !rule.extensions.has(extension) || !rule.signature(file.buffer)) {
      errors.files = m.filesType;
      break;
    }
  }

  const value = {
    playerName,
    birthYear,
    isMinor,
    citizenship,
    currentClub,
    position,
    heightCm,
    weightKg,
    stickHand,
    availableFrom: body.availableFrom || null,
    phone,
    email: email || null,
    eliteProspectsUrl,
    videoUrls: videoUrls.filter(Boolean),
    message: text(body.message, 3000) || null,
    parentName: isMinor ? parentName : null,
    parentContact: isMinor ? parentContact : null,
    dataConsent: checked(body.dataConsent),
    parentConsent: isMinor ? checked(body.parentConsent) : false,
    source: {
      locale: normalizeLocale(locale),
      utm_source: text(body.utmSource, 120) || null,
      utm_medium: text(body.utmMedium, 120) || null,
      utm_campaign: text(body.utmCampaign, 160) || null,
      utm_content: text(body.utmContent, 160) || null,
      utm_term: text(body.utmTerm, 160) || null,
      referrer: text(body.referrer, 500) || null
    },
    turnstileToken: text(body["cf-turnstile-response"], 2048)
  };

  if (requireTurnstile && !value.turnstileToken) errors.turnstile = m.turnstile;
  return { ok: Object.keys(errors).length === 0, errors, value };
}

module.exports = { validateApplication, ALLOWED_FILES };
