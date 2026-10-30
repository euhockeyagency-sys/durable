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

test("Elite Prospects is optional when the field is empty", () => {
  const result = validateApplication(body({ eliteProspectsUrl: "" }), [], new Date("2026-10-04T12:00:00Z"), false, "en");
  assert.equal(result.ok, true);
  assert.equal(result.value.eliteProspectsUrl, null);
});

test("a supplied Elite Prospects URL must use the Elite Prospects domain", () => {
  const result = validateApplication(body({ eliteProspectsUrl: "https://example.com/player/123" }), [], new Date("2026-10-04T12:00:00Z"), false, "en");
  assert.equal(result.ok, false);
  assert.ok(result.errors.eliteProspectsUrl);
});

test("application form validates the success payload and guards browser draft storage", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "site.js"), "utf8");
  assert.ok(source.includes("if(!data.ok||!/^EHA-\\d{6}-[A-F0-9]{6}$/.test(data.reference||''))"));
  assert.ok(source.includes("try{sessionStorage.removeItem('eha-application-draft')}catch(error){}"));
  assert.ok(source.includes("status.textContent=T.unconfirmed"));
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

test("application notifications omit missing measurements and Elite Prospects", () => {
  const message = notificationText({
    reference_code: "EHA-261007-ABC124",
    player_name: "Adult Player",
    birth_year: 2000,
    position: "forward",
    height_cm: null,
    weight_kg: null,
    citizenship: "Canada",
    current_club: "HC Test",
    phone: "+1 555 0101",
    email: "adult@example.com",
    elite_prospects_url: null,
    video_urls: [],
    is_minor: false,
    source: { locale: "en", applicant_type: "player" }
  });
  assert.match(message, /Позиция: Нападающий/);
  assert.doesNotMatch(message, /null|undefined|Elite Prospects:/);
});

test("application notifications include a parent contact for an adult player when a parent applied", () => {
  const message = notificationText({
    reference_code: "EHA-261007-ABC125",
    player_name: "Adult Player",
    birth_year: 2000,
    position: "goalie",
    height_cm: null,
    weight_kg: null,
    citizenship: "Canada",
    current_club: "HC Test",
    phone: "+1 555 0102",
    email: "family@example.com",
    elite_prospects_url: null,
    video_urls: [],
    is_minor: false,
    parent_name: "Parent Name",
    parent_contact: "parent@example.com",
    source: { locale: "en", applicant_type: "parent_guardian" }
  });
  assert.match(message, /Родитель: Parent Name; parent@example\.com/);
});
test("application source keeps first landing distinct and rejects URLs with query data", () => {
  const valid=validateApplication(body({sourcePage:"/contact",landingPage:"/guides/hockey-in-usa",initialReferrerHost:"google.com"}),[],new Date("2026-10-30"),false,"en");
  assert.equal(valid.ok,true);
  assert.equal(valid.value.source.landing_page,"/guides/hockey-in-usa");
  assert.equal(valid.value.source.source_page,"/contact");
  assert.equal(valid.value.source.initial_referrer_host,"google.com");
  for(const landingPage of ["https://example.com/","//example.com/","/contact?email=private","/page#private"]){
    const result=validateApplication(body({landingPage}),[],new Date("2026-10-30"),false,"en");
    assert.equal(result.ok,true);
    assert.equal(result.value.source.landing_page,null);
  }
});
test("session attribution preserves campaign across pages and tolerates blocked storage", () => {
  const vm=require("node:vm");
  const code=fs.readFileSync(path.join(__dirname,"../public/site.js"),"utf8");
  const helper=code.slice(code.indexOf("function readAttribution("),code.indexOf("let attribution={};"));
  const context={URL,URLSearchParams};vm.createContext(context);vm.runInContext(helper,context);
  let stored;const storage={getItem:()=>stored,setItem:(key,value)=>{stored=value}};
  context.readAttribution(storage,"/guides/entry",new URLSearchParams("utm_source=instagram"),"https://instagram.com/");
  const next=context.readAttribution(storage,"/contact",new URLSearchParams(),"");
  assert.equal(next.landingPage,"/guides/entry");
  assert.equal(next.previousPage,"/guides/entry");
  assert.equal(next.utm_source,"instagram");
  assert.equal(next.referrerHost,"instagram.com");
  assert.doesNotThrow(()=>context.readAttribution({getItem(){throw Error("blocked")},setItem(){throw Error("blocked")}},"/contact",new URLSearchParams(),""));
});
