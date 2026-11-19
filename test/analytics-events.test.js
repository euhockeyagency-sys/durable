const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const site = fs.readFileSync(path.join(__dirname, "..", "public", "site.js"), "utf8");
const app = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");

// Runs only the whatsapp_click listener from site.js against a tiny fake DOM.
function waHarness(consent) {
  const start = site.indexOf("let lastWa=0;");
  const end = site.indexOf("});", start) + 3;
  assert.ok(start > 0 && end > start, "whatsapp listener found");
  const sent = [];
  let handler;
  const ctx = {
    CONSENT_KEY: "eha-cookie-consent",
    localStorage: { getItem: () => consent },
    location: { pathname: "/contact" },
    document: { addEventListener: (type, fn) => { handler = fn; } },
    track: (name, params) => sent.push({ name, params }),
    Date
  };
  vm.runInNewContext(site.slice(start, end), ctx);
  const link = (cls, attr) => ({
    classList: { contains: (c) => c === cls },
    hasAttribute: (a) => a === attr,
    href: "https://wa.me/375297957818?text=secret"
  });
  const click = (el) => handler({ target: { closest: () => el } });
  return { sent, click, link };
}

test("whatsapp_click is not sent before analytics consent", () => {
  for (const consent of [null, "denied"]) {
    const h = waHarness(consent);
    h.click(h.link("whatsapp-float"));
    assert.equal(h.sent.length, 0, String(consent));
  }
});

test("whatsapp_click fires once per click after consent, without phone number or message text", () => {
  const h = waHarness("granted");
  h.click(h.link("whatsapp-float"));
  h.click(h.link("whatsapp-float")); // double click / second listener within 1 s
  assert.equal(h.sent.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(h.sent[0])), { name: "whatsapp_click", params: { entry_page: "/contact", placement: "float" } });
  assert.doesNotMatch(JSON.stringify(h.sent), /375297957818|secret|text=/);
});

test("success page: the WhatsApp link carries no reference in its href and the URL drops ?ref before analytics", () => {
  for (const locale of ["en", "ru"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", "public", locale, "application-success.html"), "utf8");
    assert.match(html, /data-success-whatsapp href="https:\/\/wa\.me\/375297957818"/);
  }
  // the greeting with the reference is opened on click, never written into href
  assert.ok(!/link\.href=`https:\/\/wa\.me\/375297957818\?text=/.test(site));
  assert.ok(site.includes("window.open(`https://wa.me/375297957818?text=${encodeURIComponent(T.waGreeting(value))}`"));
  // the reference is removed from the address bar before Metrica is initialised
  assert.ok(site.indexOf("u.searchParams.delete('ref')") < site.indexOf("const initYandex="));
  // GA page_view uses a page_location without ref/token
  assert.ok(app.includes("u.searchParams.delete('ref');u.searchParams.delete('token');gtag('config','G-TPD2W77SZ3',{page_location:u.href})"));
});

test("application_sent is counted once per reference across tabs", () => {
  assert.ok(site.includes("if(!localStorage.getItem(key)&&!sessionStorage.getItem(key)){"));
});
