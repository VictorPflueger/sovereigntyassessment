// Intro window ("How it works"): what the Sovereignty Assessment does, how the agent works in the same
// five steps as the progress rail, and what a person gets from it. It opens by itself on a visitor's
// first visit (remembered in this browser's local storage, "sa.introSeen") and any time from the "How
// it works" button in the header. Every word is an i18n key, so a switch translates it in place.

import { h } from "./dom.js";
import { icon } from "./icons.js";
import { openModal } from "./modal.js";
import { tx } from "./text.js";
import { STORAGE } from "./config.js";
import { RAIL_STEPS } from "./rail_steps.js";

// The steps' hexagons in the app's colour grammar (DESIGN.md): lilac where the AI works on its own,
// fjord where it checks sources, neutral where code computes, merlot where the person decides, ink
// for the levers it recommends.
const TONE = { understand: "ai", research: "check", score: "code", review: "person", recommend: "ink" };

const VALUE = ["intro.value.score", "intro.value.sources", "intro.value.levers"];

/** True once this browser has seen the intro (closed it at least once). */
export function introSeen() {
  try { return localStorage.getItem(STORAGE.introSeen) === "1"; } catch { return false; }
}

function markIntroSeen() {
  try { localStorage.setItem(STORAGE.introSeen, "1"); } catch { /* storage blocked: it opens again next time */ }
}

/**
 * Opens the intro window. With `onStart`, its main button starts the usual run flow (mode choice
 * first) under the label key `startKey`; without it (a run is in progress) there is only Close.
 * Resolves "start" or null.
 */
export function openIntro({ startKey = "controls.start", onStart = null } = {}) {
  return new Promise((resolve) => {
    let modal;
    const steps = h("ol", { class: "vc-stepper intro-steps" }, RAIL_STEPS.map((s, i) =>
      h("li", { class: "vc-step intro-step", dataset: { tone: TONE[s.id] || "code", step: s.id } },
        h("span", { class: "vc-step__marker intro-num", "aria-hidden": "true" }, String(i + 1)),
        tx(s.labelKey, null, { tag: "strong", cls: "vc-step__label intro-step-title" }),
        tx(`intro.step.${s.id}`, null, { cls: "vc-step__hint intro-step-text" }))));
    const value = h("ul", { class: "intro-value" }, VALUE.map((k) =>
      h("li", {}, tx(`${k}.title`, null, { tag: "strong" }), tx(`${k}.text`))));

    const footer = onStart
      ? [
        tx("intro.footnote", null, { cls: "dialog-note" }),
        h("button", { class: "vc-button vc-button--ghost", type: "button", on: { click: () => modal.close(null) } }, tx("intro.close")),
        h("button", { class: "vc-button", type: "button", id: "btn-intro-start", autofocus: true, on: { click: () => modal.close("start") } }, icon("play", 18), tx(startKey))
      ]
      : [h("button", { class: "vc-button", type: "button", autofocus: true, on: { click: () => modal.close(null) } }, tx("intro.close"))];

    modal = openModal({
      title: tx("intro.title"),
      intro: tx("intro.lead"),
      className: "intro-modal",
      size: "intro",
      body: [
        tx("intro.what.title", null, { tag: "h3" }),
        tx("intro.what.text", null, { tag: "p", cls: "intro-lead" }),
        tx("intro.how.title", null, { tag: "h3" }),
        steps,
        tx("intro.value.title", null, { tag: "h3" }),
        value,
        tx("intro.note", null, { tag: "p", cls: "intro-note" })
      ],
      footer,
      onClose: (result) => {
        markIntroSeen();
        resolve(result || null);
        if (result === "start") onStart?.();
      }
    });
  });
}
