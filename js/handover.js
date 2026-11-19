// Which step the run is waiting for the person to take. The status pill, the console's phase line and
// the progress rail all name it through this module, so the words match everywhere.
//
// Adapted from the shared shell for two languages (REVIEW.md, "Adapted shell modules"): the labels
// come from the app's i18n (t()), and the person's steps come from the app's run states. In the
// shared shell one state ("awaiting_approval") covered two moments that its decision events told
// apart; here every moment that waits for the person is a run state of its own (HUMAN_STATES in
// js/events.js: a choice, a review, a decision), so the awaited step follows the run state, and a
// person's answer (choice_decision, review_decision, lever_decision) ends it at once, before the next
// state arrives.

import { bus, RUN_STATES, HUMAN_STATES } from "./events.js";
import { t } from "./i18n/index.js";

let awaited = null; // "choice" | "review" | "decision" while the run waits for the person, else null
const listeners = new Set();

function set(value) {
  if (awaited === value) return;
  awaited = value;
  for (const fn of listeners) fn();
}

bus.on("run_start", () => set(null));
bus.on("state_change", (ev) => set(HUMAN_STATES[ev.payload?.state] || null));
bus.on("choice_decision", () => set(null));
// A correction keeps the review open; confirming or skipping ends it.
bus.on("review_decision", (ev) => { if (ev.payload?.action !== "correct") set(null); });
bus.on("lever_decision", () => set(null));
bus.on("run_end", () => set(null));

/** "choice", "review" or "decision" while the run waits for the person; otherwise null. */
export function awaitedStep() {
  return awaited;
}

/** Display label for a run state in the active language ("Researching", "Awaiting your review"). */
export function runStateLabel(state) {
  return RUN_STATES.includes(state) ? t(`state.${state}`) : String(state ?? "");
}

/** Call `fn` whenever the awaited step changes (for example right after the person confirms the review). */
export function onAwaitedChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
