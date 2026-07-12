/* ============================================================
   DD&SA — Form handler (contact + subscribe)

   Uses Web3Forms (https://web3forms.com) — a free form-relay
   service with no backend required. It delivers submissions to
   governance@dd-sa.org by email.

   >>> SETUP (one-time, ~2 minutes) <<<
   1. Go to https://web3forms.com and enter governance@dd-sa.org.
   2. You'll be emailed an Access Key — copy it.
   3. Paste it below, replacing "YOUR-WEB3FORMS-ACCESS-KEY".
   4. Deploy. Submit a test message on /contact.html and
      /subscribe.html to confirm delivery, then done.

   Until a real key is set, forms show a clear on-page notice
   instead of silently failing.
   ============================================================ */

(function () {
  var ACCESS_KEY = "113ca7c7-432f-4ec3-9345-02c13a605a9c";
  var ENDPOINT = "https://api.web3forms.com/submit";

  function isConfigured() {
    return ACCESS_KEY && ACCESS_KEY.indexOf("YOUR-") !== 0;
  }

  function setFieldError(field, message) {
    field.classList.add("error");
    var msg = field.querySelector(".err-msg");
    if (msg) msg.textContent = message;
  }
  function clearFieldError(field) {
    field.classList.remove("error");
  }

  function showStatus(el, kind, message) {
    el.className = "ddsa-status show " + kind;
    el.innerHTML = (kind === "ok"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>'
    ) + "<span>" + message + "</span>";
  }

  function validate(form) {
    var ok = true;
    var required = form.querySelectorAll("[data-required]");
    required.forEach(function (input) {
      var field = input.closest(".ddsa-field");
      var value = (input.value || "").trim();
      var valid = value.length > 0;
      if (input.type === "email" && valid) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!valid && field) setFieldError(field, "Enter a valid email address.");
      } else if (!valid && field) {
        setFieldError(field, "This field is required.");
      }
      if (valid && field) clearFieldError(field);
      if (!valid) ok = false;
    });
    return ok;
  }

  function initForm(form) {
    var button = form.querySelector(".ddsa-submit");
    var statusEl = form.querySelector(".ddsa-status");
    var labelSpan = button ? button.querySelector(".label-text") : null;
    var defaultLabel = labelSpan ? labelSpan.textContent : "Send";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot check
      var hp = form.querySelector('input[name="ddsa_hp"]');
      if (hp && hp.value) return; // silently drop — bot filled the trap

      if (!validate(form)) {
        if (statusEl) showStatus(statusEl, "fail", "Please check the fields highlighted above.");
        return;
      }

      if (!isConfigured()) {
        if (statusEl) {
          showStatus(
            statusEl,
            "fail",
            "This form isn't connected yet — add a Web3Forms access key in assets/ddsa-forms.js. " +
            "In the meantime, please email governance@dd-sa.org directly."
          );
        }
        return;
      }

      button && button.classList.add("loading");
      button && button.setAttribute("disabled", "disabled");
      if (labelSpan) labelSpan.textContent = "Sending…";

      var formData = new FormData(form);
      formData.set("access_key", ACCESS_KEY);

      fetch(ENDPOINT, { method: "POST", body: formData })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            if (statusEl) showStatus(statusEl, "ok", form.dataset.successMessage || "Sent. Thank you.");
          } else {
            if (statusEl) showStatus(statusEl, "fail", "Something went wrong sending that. Please try again, or email governance@dd-sa.org.");
          }
        })
        .catch(function () {
          if (statusEl) showStatus(statusEl, "fail", "Couldn't reach the form service. Please try again, or email governance@dd-sa.org.");
        })
        .finally(function () {
          button && button.classList.remove("loading");
          button && button.removeAttribute("disabled");
          if (labelSpan) labelSpan.textContent = defaultLabel;
        });
    });
  }

  function initEmailCopy(btn) {
    var defaultLabel = btn.querySelector(".copy-label").textContent;
    btn.addEventListener("click", function () {
      var email = btn.getAttribute("data-email");
      var done = function () {
        btn.classList.add("copied");
        btn.querySelector(".copy-label").textContent = "Copied — " + email;
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.querySelector(".copy-label").textContent = defaultLabel;
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {
          window.prompt("Copy this address:", email);
        });
      } else {
        window.prompt("Copy this address:", email);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form.ddsa-form").forEach(initForm);
    document.querySelectorAll(".ddsa-email-copy").forEach(initEmailCopy);
  });
})();
