// Progress rail: the agent's plan as steps (the same steps as the intro window), on Vici's stepper,
// shown above the console. Before a run it previews the plan; during a run it shows where the agent is
// (ink, its hexagon pulsing); when the agent hands over to the person, the step turns merlot with the
// person's turn ("Your review"). A tick marks a step done, a stop mark where a run ended early, a dashed
// hexagon a step the run did not need.
//
// Run states map onto steps monotonically: once the agent has reached a step, a later return to an
// earlier phase does not move the rail backwards.
//
// Adapted from the shared shell for two languages (REVIEW.md, "Adapted shell modules"): every
// user-visible string comes from the app's i18n (t(), re-rendered through onLang()), and the app
// defines the steps, the state-to-step map, the person's turns and the outcomes that count as
// complete with configureRail(), instead of the shell's fixed five steps and two turns.

import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { awaitedStep, onAwaitedChange } from "./handover.js";
import { t, onLang } from "./i18n/index.js";

let config = { steps: [], stateStep: {}, turns: {}, complete: ["done"] };

/**
 * The app's rail: { steps: [{ id, labelKey }], stateStep: { runState: step index },
 * turns: { runState: { labelKey, neededKey } } for the states that wait for the person,
 * complete: run_end statuses after which the steps not reached count as "not needed" }.
 * Call once before createProgressRail().
 */
export function configureRail({ steps, stateStep, turns = {}, complete = ["done"] }) {
  config = { steps: steps.map((s) => ({ ...s })), stateStep: { ...stateStep }, turns: { ...turns }, complete: [...complete] };
}

const STATE_TEXT = {
  todo: "rail.state.todo", active: "rail.state.active", done: "rail.state.done",
  stopped: "rail.state.stopped", skipped: "rail.state.skipped"
};

export function createProgressRail() {
  const el = h("ol", { class: "vc-stepper rail", "aria-label": t("rail.label") });
  let reached = -1;     // furthest step reached in this run
  let ended = null;     // null while running; otherwise the run_end status
  let lastState = null; // the run state last shown

  // The person's turn shows while the run waits for them; once they have acted it gives way at once.
  const turnOf = (runState) => (awaitedStep() ? config.turns[runState] || null : null);
  // Right after the person acts, the step stops waiting even before the next state arrives.
  onAwaitedChange(() => { if (!ended && reached >= 0) render(lastState); });
  // A language change re-draws the rail in the new language; where the run stands does not change.
  onLang(() => {
    el.setAttribute("aria-label", t("rail.label"));
    render(lastState);
  });

  function render(runState) {
    lastState = runState;
    clear(el);
    config.steps.forEach((step, i) => {
      let state = "todo";
      if (ended) {
        if (config.complete.includes(ended)) state = i <= reached ? "done" : reached >= 0 ? "skipped" : "todo";
        else state = i < reached ? "done" : i === reached ? "stopped" : "todo";
      } else if (reached >= 0) {
        if (i < reached) state = "done";
        else if (i === reached) state = turnOf(runState) ? "yours" : "active";
      }
      const current = !ended && reached >= 0 && i === reached;
      const turn = state === "yours" ? turnOf(runState) : null;
      // A done step shows Vici's tick (drawn by the stepper), so its marker keeps just the number.
      const mark = state === "yours" ? icon("user", 16)
        : state === "stopped" ? icon("stop", 14)
          : h("span", { class: "rail-num" }, String(i + 1));
      el.appendChild(h("li", {
        class: ["vc-step", "rail-step", state === "done" ? "vc-step--done" : "", current ? "vc-step--current" : ""],
        dataset: { state, step: step.id },
        ...(current ? { "aria-current": "step" } : {})
      },
      h("span", { class: "vc-step__marker rail-dot", "aria-hidden": "true" }, mark),
      h("span", { class: "vc-step__label rail-label" }, t(step.labelKey)),
      turn ? h("span", { class: "vc-tag vc-tag--solid rail-turn" }, t(turn.labelKey)) : null,
      h("span", { class: "vc-visually-hidden" }, `: ${turn ? t(turn.neededKey) : t(STATE_TEXT[state])}`)));
    });
  }

  return {
    el,
    /** Follow a run state (state_change). */
    update(runState) {
      if (ended) return;
      if (runState in config.stateStep) reached = Math.max(reached, config.stateStep[runState]);
      render(runState);
    },
    /** The run has ended with this status (one of the app's run_end statuses). */
    finish(status) {
      ended = status || "done";
      render(null);
    },
    /** Back to the plan preview (Reset, or a new run). */
    reset() {
      reached = -1;
      ended = null;
      render(null);
    }
  };
}
