// Dialogs: the run-mode choice and the API key. Every word is an i18n key (js/text.js), so a language
// switch while a dialog is open translates it in place; what the person typed and where the check
// stands stay as they are.

import { h, withTooltip } from "./dom.js";
import { icon } from "./icons.js";
import { openModal } from "./modal.js";
import { tx } from "./text.js";
import { t, onLang } from "./i18n/index.js";
import { ANTHROPIC, AGENT, STORAGE } from "./config.js";
import { getKey, setKey, forgetKey, hasKey, looksLikeKey, maskKey } from "./keystore.js";
import { checkKey } from "./anthropic.js";
import { apiMessage } from "./api_messages.js";
import { fmtEur, fmtInt } from "./format.js";

/** True when this page runs inside another page's frame (where clicks could be steered). */
export function isFramed() {
  try { return window.top !== window.self; } catch { return true; }
}

/**
 * Asks which mode to run in. Resolves "simulation" | "live" | "key" (change or forget the stored key) | null.
 * service: the service's name as the person will read it; simKey: the i18n key of the reason Simulation
 * is unavailable, or null when a pre-run exists.
 */
export function chooseMode({ service, simKey = null }) {
  return new Promise((resolve) => {
    let modal;
    const pick = (mode) => modal.close(mode);
    const blocked = !!simKey;
    // Each card is one choice (Vici's interactive card): its button is the card's link, so a click
    // anywhere on the card makes the choice, and the keyboard still reaches the one button.
    const simCard = h("section", { class: ["vc-card", blocked ? "" : "vc-card--interactive", "mode-card"], dataset: { mode: "simulation" }, "aria-disabled": blocked ? "true" : "false" },
      h("div", { class: "vc-card__body" },
        h("h3", { class: "vc-card__title" }, icon("play", 22), tx("mode.simulation")),
        h("span", { class: "vc-tag mode-tag", dataset: { mode: "simulation" } }, tx("badge.simulation")),
        h("ul", {},
          tx("dialog.mode.sim.1", null, { tag: "li" }),
          tx("dialog.mode.sim.2", null, { tag: "li" }),
          tx("dialog.mode.sim.3", null, { tag: "li" })),
        blocked ? tx(simKey, null, { tag: "p", cls: "why-disabled" }) : null,
        h("div", { class: "mode-cta" },
          h("button", {
            class: ["vc-button vc-button--outline", blocked ? "" : "vc-card__link"], type: "button", "aria-disabled": blocked ? "true" : "false",
            on: { click: () => { if (!blocked) pick("simulation"); } }
          }, icon("play", 18), tx("dialog.mode.runSim")))));
    const liveButton = h("button", { class: "vc-button vc-card__link", type: "button", autofocus: true, on: { click: () => pick("live") } },
      icon("key", 18), hasKey() ? tx("dialog.mode.useKey", { key: maskKey() }) : tx("dialog.mode.continueKey"));
    const liveCard = h("section", { class: "vc-card vc-card--interactive mode-card", dataset: { mode: "live" } },
      h("div", { class: "vc-card__body" },
        h("h3", { class: "vc-card__title" }, icon("spark", 22), tx("mode.live")),
        h("span", { class: "vc-tag vc-tag--solid mode-tag", dataset: { mode: "live" } }, tx("badge.live")),
        h("ul", {},
          tx("dialog.mode.live.1", null, { tag: "li" }),
          tx("dialog.mode.live.2", null, { tag: "li" }),
          caps("li"),
          tx("dialog.mode.live.4", null, { tag: "li" })),
        h("div", { class: "mode-cta" }, liveButton)));

    // With a key stored, the footer offers the only other way to it: change it or forget it.
    const footer = hasKey()
      ? [
        h("span", { class: "dialog-note" }, tx("dialog.mode.keyStored"), " ", h("code", {}, maskKey())),
        h("button", { class: "vc-button vc-button--ghost button-compact", type: "button", id: "btn-manage-key", on: { click: () => pick("key") } }, icon("key", 16), tx("dialog.mode.manageKey"))
      ]
      : [];

    modal = openModal({
      title: tx("dialog.mode.title"),
      intro: tx("dialog.mode.intro"),
      body: [
        h("div", { class: "vc-card vc-card--flat run-summary" }, tx("dialog.mode.willAssess", null, { cls: "label" }), h("strong", {}, service)),
        h("div", { class: "mode-cards" }, simCard, liveCard)
      ],
      footer,
      className: "mode-modal",
      onClose: (result) => resolve(result || null)
    });
  });
}

/**
 * The live run's caps in the active language: the euro amount and the call count are formatted for it,
 * so this line re-renders itself after a switch.
 */
function caps(tag) {
  const el = h(tag, {});
  const render = () => { el.textContent = t("dialog.mode.live.3", { calls: fmtInt(AGENT.maxSteps), cap: fmtEur(AGENT.budgetEur) }); };
  render();
  const off = onLang(() => (el.isConnected ? render() : off()));
  return el;
}

// The key dialog's message line: an error, or how the check goes (Vici's field help).
const ERROR = "vc-help vc-help--error field-msg";
const OK = "vc-help vc-help--success field-msg";

/** Asks for (or confirms) the API key. Resolves true when a key is stored and accepted. */
export function askApiKey() {
  return new Promise((resolve) => {
    let modal;
    let accepted = false;
    // A key is not a password: password managers are asked not to offer to save it.
    const input = h("input", {
      class: "vc-input key-input", id: "api-key-input", name: `${STORAGE.apiKey}-input`, type: "password", autocomplete: "off", spellcheck: "false",
      "data-1p-ignore": "", "data-lpignore": "true", "data-bwignore": "true", "data-form-type": "other",
      placeholder: "sk-ant-…", "aria-describedby": "api-key-help api-key-msg", autofocus: true
    });
    // Inside a frame another page could steer the clicks (clickjacking): live mode, and so the key,
    // needs this app open in its own tab.
    const framed = isFramed();
    const showBtn = h("button", { class: "vc-icon-button", type: "button", id: "btn-show-key" }, icon("eye", 20));
    const showTip = withTooltip(showBtn, tx("dialog.key.show"));
    showBtn.addEventListener("click", () => {
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      showBtn.replaceChildren(icon(hidden ? "eyeOff" : "eye", 20));
      showBtn.tooltip.replaceChildren(tx(hidden ? "dialog.key.hide" : "dialog.key.show"));
    });
    const msg = h("div", { class: ERROR, id: "api-key-msg", role: "status" });
    const say = (cls, key, vars = null) => {
      msg.className = cls;
      msg.replaceChildren(tx(key, vars));
    };
    const saveBtn = h("button", { class: "vc-button", type: "button", id: "btn-check-key" }, icon("check", 18), tx("dialog.key.check"));
    const forgetBtn = h("button", { class: "vc-button vc-button--danger", type: "button", id: "btn-forget-key", hidden: !hasKey() }, tx("dialog.key.forget"));

    const current = hasKey()
      ? h("div", { class: "vc-alert vc-alert--neutral key-current" }, icon("key", 18), h("div", { class: "vc-alert__body" }, h("p", {}, tx("dialog.mode.keyStored"), " ", h("code", {}, maskKey()))))
      : null;

    async function save() {
      if (saveBtn.getAttribute("aria-disabled") === "true" || framed) return;
      const raw = input.value.trim() || getKey() || "";
      if (!raw) { say(ERROR, "dialog.key.empty"); input.focus(); return; }
      if (!looksLikeKey(raw)) { say(ERROR, "dialog.key.malformed"); input.focus(); return; }
      saveBtn.setAttribute("aria-disabled", "true");
      msg.className = OK;
      msg.replaceChildren(h("span", { class: "vc-spinner vc-spinner--sm", "aria-hidden": "true" }), " ", tx("dialog.key.checking"));
      const r = await checkKey(raw);
      saveBtn.setAttribute("aria-disabled", "false");
      if (r.ok) {
        setKey(raw);
        accepted = true;
        modal.close(true);
        return;
      }
      if (r.status === 0) {
        // Network or CORS problem: keep the key so the presenter can retry, and say so plainly.
        setKey(raw);
        const m = apiMessage(r);
        msg.className = ERROR;
        msg.replaceChildren(tx(m.key, m.vars), " ", tx("dialog.key.storedAnyway"));
        forgetBtn.hidden = false;
        return;
      }
      const m = apiMessage(r);
      say(ERROR, m.key, m.vars);
    }

    saveBtn.addEventListener("click", save);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") save(); });
    forgetBtn.addEventListener("click", () => {
      forgetKey();
      input.value = "";
      forgetBtn.hidden = true;
      current?.remove();
      say(OK, "dialog.key.forgotten");
    });

    if (framed) {
      input.disabled = true;
      saveBtn.setAttribute("aria-disabled", "true");
      say(ERROR, "dialog.key.framed");
    }

    const link = (href, key) => h("a", { href, target: "_blank", rel: "noopener noreferrer" }, tx(key));
    modal = openModal({
      title: tx("dialog.key.title"),
      intro: tx("dialog.key.intro"),
      size: "narrow",
      className: "key-modal",
      body: [
        h("div", { class: "vc-alert vc-alert--warning key-advice" }, icon("alert", 22), h("div", { class: "vc-alert__body" },
          h("p", {}, tx("dialog.key.advice1", null, { tag: "strong" }), " ", tx("dialog.key.advice1b")),
          h("p", {}, tx("dialog.key.advice2a"), " ", link(ANTHROPIC.consoleWorkspacesUrl, "dialog.key.workspaces"), tx("dialog.key.advice2b"), " ",
            link(ANTHROPIC.consoleKeysUrl, "dialog.key.apiKeys"), tx("dialog.key.advice2c")))),
        current,
        h("div", { class: "vc-field" },
          h("label", { class: "vc-label", for: "api-key-input" }, tx("dialog.key.label")),
          h("div", { class: "input-row" }, input, showTip),
          tx("dialog.key.help", null, { cls: "vc-help", attrs: { id: "api-key-help" } }),
          msg),
        h("ul", { class: "key-facts" },
          h("li", {}, icon("check", 16), tx("dialog.key.fact1", { name: STORAGE.apiKey })),
          h("li", {}, icon("check", 16), tx("dialog.key.fact2")),
          h("li", {}, icon("check", 16), tx("dialog.key.fact3")))
      ],
      footer: [forgetBtn, saveBtn],
      onClose: () => resolve(accepted)
    });
  });
}
