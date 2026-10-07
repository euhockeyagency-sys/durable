const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { validateApplication } = require("../src/validation");
const { notificationText } = require("../src/services");

function body(overrides = {}) {
  return {
    playerName: "Test Player",
    birthYear: "2000",
    citizenship: "Canada",
    currentClub: "HC Test",
    position: "forward",
    heightCm: "185",
    weightKg: "85",
    stickHand: "left",
    phone: "+1 555 0100",
    email: "family@example.com",
    eliteProspectsUrl: "https://www.eliteprospects.com/player/123/test",
    dataConsent: "true",
    applicantType: "player",
    ...overrides
  };
}

test("player application still requires measurements", () => {
  const result = validateApplication(body({ heightCm: "", weightKg: "", stickHand: "" }), [], new Date("2026-10-04T12:00:00Z"), false, "en");
  assert.equal(result.ok, false);
  assert.ok(result.errors.heightCm);
  assert.ok(result.errors.weightKg);
  assert.ok(result.errors.stickHand);
});

test("parent applicant can send an adult player's first enquiry without measurements", () => {
  const result = validateApplication(body({
    applicantType: "parent_guardian",
    heightCm: "",
    weightKg: "",
    stickHand: "",
    parentName: "Parent Name",
    parentContact: "parent@example.com",
    parentConsent: "true",
    intent: "assessment",
    sourcePage: "/junior-hockey-for-parents"
  }), [], new Date("2026-10-04T12:00:00Z"), false, "en");
  assert.equal(result.ok, true);
  assert.equal(result.value.isMinor, false);
  assert.equal(result.value.heightCm, null);
  assert.equal(result.value.weightKg, null);
  assert.equal(result.value.stickHand, null);
  assert.equal(result.value.source.applicant_type, "parent_guardian");
  assert.equal(result.value.source.intent, "assessment");
  assert.equal(result.value.source.source_page, "/junior-hockey-for-parents");
});

test("minor status is independent and still requires guardian details and consent", () => {
  const result = validateApplication(body({ birthYear: "2010", applicantType: "player" }), [], new Date("2026-10-04T12:00:00Z"), false, "en");
  assert.equal(result.ok, false);
  assert.equal(result.value.isMinor, true);
  assert.ok(result.errors.parentName);
  assert.ok(result.errors.parentContact);
  assert.ok(result.errors.parentConsent);
});

test("application notifications expose route intent and source page", () => {
  const message = notificationText({
    reference_code: "EHA-261006-ABC123",
    player_name: "Test Player",
    birth_year: 2000,
    position: "defense",
    height_cm: 185,
    weight_kg: 85,
    citizenship: "Canada",
    current_club: "HC Test",
    phone: "+1 555 0100",
    email: "player@example.com",
    elite_prospects_url: "https://www.eliteprospects.com/player/123/test",
    video_urls: [],
    source: {
      locale: "en",
      intent: "europe_route",
      source_page: "/guides/find-a-hockey-club-in-europe"
    }
  });
  assert.match(message, /Тип заявки: europe_route/);
  assert.match(message, /Источник: \/guides\/find-a-hockey-club-in-europe/);
});