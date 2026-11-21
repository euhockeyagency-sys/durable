// Club requests page: Telegram subscription form and unsubscribe button.
// Loaded only when the server renders the subscription block.
(function () {
  var form = document.querySelector(".club-needs-subscribe-form");
  if (!form) return;
  var locale = form.getAttribute("data-locale") === "en" ? "en" : "ru";
  var T = locale === "en"
    ? { sending: "Sending…", open: "Open the bot in Telegram", network: "Network error. Please try again." }
    : { sending: "Отправляем…", open: "Открыть бота в Telegram", network: "Ошибка сети. Попробуйте ещё раз." };
  var status = form.querySelector(".form-status");
  function post(url, body) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }
  function clearErrors() {
    Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (el) { el.removeAttribute("aria-invalid"); });
    Array.prototype.forEach.call(form.querySelectorAll(".field-error"), function (el) { el.remove(); });
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();
    var button = form.querySelector("button[type=submit]");
    button.disabled = true;
    status.textContent = T.sending;
    post("/api/club-needs/subscribe", {
      locale: locale,
      position: form.position.value,
      birthYear: form.birthYear.value,
      eliteProspectsUrl: form.eliteProspectsUrl.value,
      consent: form.consent.checked,
      website: form.website.value
    }).then(function (data) {
      button.disabled = false;
      status.textContent = data.message || T.network;
      if (data.errors) {
        Object.keys(data.errors).forEach(function (name) {
          var field = form.elements[name];
          if (!field) return;
          field.setAttribute("aria-invalid", "true");
          var p = document.createElement("span");
          p.className = "field-error";
          p.textContent = data.errors[name];
          field.parentNode.appendChild(p);
        });
      }
      if (data.ok && data.deepLink) {
        var a = document.createElement("a");
        a.className = "btn primary";
        a.href = data.deepLink;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = T.open;
        status.appendChild(document.createElement("br"));
        status.appendChild(a);
      }
    }).catch(function () { button.disabled = false; status.textContent = T.network; });
  });
  var token = new URLSearchParams(location.search).get("unsubscribe");
  var unsub = document.querySelector("[data-unsubscribe]");
  if (token && unsub) {
    unsub.hidden = false;
    unsub.addEventListener("click", function () {
      var out = unsub.parentNode.querySelector(".form-status");
      unsub.disabled = true;
      post("/api/club-needs/unsubscribe", { locale: locale, token: token })
        .then(function (data) { out.textContent = data.message || T.network; if (!data.ok) unsub.disabled = false; })
        .catch(function () { unsub.disabled = false; out.textContent = T.network; });
    });
  }
})();
