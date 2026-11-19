const path = require("node:path");
const { messages, normalizeLocale } = require("./messages");
const { normalizeIntent, normalizeCountry, normalizeLeague, normalizeSourcePage } = require("./attribution");

const GOALS = new Set(["pro", "development", "study"]);

const POSITION_VALUES = new Set(["forward", "defense", "goalie"]);
const STICK_VALUES = new Set(["left", "right"]);
const APPLICANT_TYPES = new Set(["player", "parent_guardian"]);
const ALLOWED_FILES = {
  "application/pdf": { extensions: new Set([".pdf"]), signature: (b) => b.subarray(0, 5).toString() === "%PDF-" },
  "image/jpeg": { extensions: new Set([".jpg", ".jpeg"]), signature: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extensions: new Set([".png"]), signature: (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) }
};

const CALCULATOR_BANDS = new Set(["top", "mid", "low"]);

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

// Level-calculator context passed through the form. It is self-reported client
// data, so it is only kept when well-formed and is shown to the agent as such.
function calculatorContext(body) {
  const band = text(body.calcBand, 10);
  const score = Number(body.calcScore);
  if (!CALCULATOR_BANDS.has(band) || !Number.isInteger(score) || score < 0 || score > 200) return null;
  const leagues = text(body.calcLeagues, 300).split("|").map((name) => name.trim().slice(0, 80)).filter(Boolean).slice(0, 3);
  return { band, score, leagues };
}

// Attribution: canonical intent, CTA page with /ru kept for Russian pages,
// country (ISO alpha-2) and league (league page slug) as stable identifiers.
// All fields are optional so older cached pages keep working; an unknown value
// is kept in *_input so nothing the visitor sent is silently dropped.
function attributionContext(body, locale) {
  const intent = normalizeIntent(body.intent);
  const page = normalizeSourcePage(body.sourcePage, normalizeLocale(locale));
  const country = normalizeCountry(body.country);
  const league = normalizeLeague(body.league);
  const goal = text(body.goal, 20);
  const out = {
    intent: intent.intent,
    source_page: page.sourcePage,
    country: country.country,
    league: league.league,
    goal: GOALS.has(goal) ? goal : null,
    from_calculator: body.fromCalculator === "1" || body.fromCalculator === "true"
  };
  if (intent.original) out.intent_input = intent.original;
  if (page.input) { out.source_page_input = page.input; out.source_page_resolution = page.resolution; }
  if (country.input) out.country_input = country.input;
  if (league.input) out.league_input = league.input;
  return out;
}

function validateApplication(body, files, now = new Date(), requireTurnstile = true, locale = "ru", { measurementsRequired = true } = {}) {
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
  const applicantTypeRaw = text(body.applicantType, 30);
  const applicantType = APPLICANT_TYPES.has(applicantTypeRaw) ? applicantTypeRaw : "player";
  const eliteProspectsInput = text(body.eliteProspectsUrl, 500);
  const eliteProspectsUrl = eliteProspectsInput ? httpUrl(eliteProspectsInput, { hostname: "eliteprospects.com" }) : null;
  const videoInputs = asArray(body.videoUrls).map((value) => text(value, 500)).filter(Boolean);
  const videoUrls = videoInputs.map((value) => httpUrl(value));
  const isMinor = Number.isInteger(birthYear) && birthYear >= currentYear - 18;

  if (!playerName) errors.playerName = m.playerName;
  if (!Number.isInteger(birthYear) || birthYear < currentYear - 60 || birthYear > currentYear - 8) errors.birthYear = m.birthYear;
  if (!POSITION_VALUES.has(position)) errors.position = m.position;
  if (!citizenship) errors.citizenship = m.citizenship;
  if (!currentClub) errors.currentClub = m.currentClub;
  // Height, weight and stick hand are required from a player only while the
  // database still demands them (see src/intake/schema-state.js). A value that
  // is given is always range-checked.
  const needMeasurements = measurementsRequired && applicantType === "player";
  if ((needMeasurements || body.heightCm) && (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230)) errors.heightCm = m.heightCm;
  if ((needMeasurements || body.weightKg) && (!Number.isFinite(weightKg) || weightKg < 35 || weightKg > 180)) errors.weightKg = m.weightKg;
  if ((needMeasurements || stickHand) && !STICK_VALUES.has(stickHand)) errors.stickHand = m.stickHand;
  if (!phone) errors.phone = m.phone;
  // Required since applications are answered by email: without an address there
  // is no way to reply to the player.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = m.email;
  if (eliteProspectsInput && !eliteProspectsUrl) errors.eliteProspectsUrl = m.eliteProspectsUrl;
  if (videoInputs.length > 3) errors.videoUrls = m.videoUrlsMax;
  if (videoUrls.some((url) => !url)) errors.videoUrls = m.videoUrlsInvalid;
  if (body.availableFrom && !/^\d{4}-\d{2}-\d{2}$/.test(body.availableFrom)) errors.availableFrom = m.availableFrom;
  if (!checked(body.dataConsent)) errors.dataConsent = m.dataConsent;
  if (text(body.website, 200)) errors.website = m.website;

  const parentName = text(body.parentName, 120);
  const parentContact = text(body.parentContact, 160);
  const needsParentDetails = isMinor || applicantType === "parent_guardian";
  if (needsParentDetails && !parentName) errors.parentName = m.parentName;
  if (needsParentDetails && !parentContact) errors.parentContact = m.parentContact;
  if (needsParentDetails && !checked(body.parentConsent)) errors.parentConsent = m.parentConsent;

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
    heightCm: body.heightCm && Number.isFinite(heightCm) ? heightCm : null,
    weightKg: body.weightKg && Number.isFinite(weightKg) ? weightKg : null,
    stickHand: STICK_VALUES.has(stickHand) ? stickHand : null,
    availableFrom: body.availableFrom || null,
    phone,
    email: email || null,
    eliteProspectsUrl,
    videoUrls: videoUrls.filter(Boolean),
    message: text(body.message, 3000) || null,
    parentName: needsParentDetails ? parentName : null,
    parentContact: needsParentDetails ? parentContact : null,
    dataConsent: checked(body.dataConsent),
    parentConsent: needsParentDetails ? checked(body.parentConsent) : false,
    source: {
      locale: normalizeLocale(locale),
      applicant_type: applicantType,
      ...attributionContext(body, body.locale || locale),
      landing_page: /^\/(?!\/)[^?#\\]*$/.test(text(body.landingPage, 300)) ? text(body.landingPage, 300) : null,
      initial_referrer_host: /^[a-z0-9.-]+$/i.test(text(body.initialReferrerHost, 200)) ? text(body.initialReferrerHost, 200) : null,
      utm_source: text(body.utmSource, 120) || null,
      utm_medium: text(body.utmMedium, 120) || null,
      utm_campaign: text(body.utmCampaign, 160) || null,
      utm_content: text(body.utmContent, 160) || null,
      utm_term: text(body.utmTerm, 160) || null,
      referrer: text(body.referrer, 500) || null,
      calculator: calculatorContext(body)
    },
    turnstileToken: text(body["cf-turnstile-response"], 2048)
  };

  if (requireTurnstile && !value.turnstileToken) errors.turnstile = m.turnstile;
  return { ok: Object.keys(errors).length === 0, errors, value };
}

function validateClubRequest(body, requireTurnstile = true, locale = "ru") {
  const m = messages(locale);
  const errors = {};
  const clubName = text(body.clubName, 160);
  const contactName = text(body.contactName, 120);
  const email = text(body.email, 160).toLowerCase();
  const phone = text(body.phone, 60);
  const country = text(body.country, 100);
  const positionNeeded = text(body.positionNeeded, 120);
  const level = text(body.level, 160);
  const message = text(body.message, 3000);
  const website = text(body.website, 200);
  const turnstileToken = text(body.turnstileToken || body["cf-turnstile-response"], 2048);

  if (!clubName) errors.clubName = m.clubName;
  if (!contactName) errors.contactName = m.contactName;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = m.clubEmail;
  if (!email && !phone) {
    errors.email = m.clubContact;
    errors.phone = m.clubContact;
  }
  if (!country) errors.country = m.country;
  if (!positionNeeded) errors.positionNeeded = m.positionNeeded;
  if (!level) errors.level = m.level;
  if (!message) errors.message = m.clubMessage;
  if (!checked(body.dataConsent)) errors.dataConsent = m.dataConsent;
  if (website) errors.website = m.website;
  if (requireTurnstile && !turnstileToken) errors.turnstile = m.turnstile;

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      clubName,
      contactName,
      email: email || null,
      phone: phone || null,
      country,
      positionNeeded,
      level,
      message,
      dataConsent: checked(body.dataConsent),
      locale: normalizeLocale(locale),
      turnstileToken
    }
  };
}

module.exports = { validateApplication, validateClubRequest, ALLOWED_FILES };