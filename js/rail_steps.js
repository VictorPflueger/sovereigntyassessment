// The agent's five steps, shared by the progress rail above the console (js/progress.js, configured
// here), the intro window and the status pill: Understand, Research, Score, Your review, Recommend.
// Run states map onto them monotonically; the three states that wait for the person show the
// person's turn in merlot (HUMAN_STATES in js/events.js).

import { configureRail } from "./progress.js";

export const RAIL_STEPS = Object.freeze([
  { id: "understand", labelKey: "rail.step.understand" },
  { id: "research", labelKey: "rail.step.research" },
  { id: "score", labelKey: "rail.step.score" },
  { id: "review", labelKey: "rail.step.review" },
  { id: "recommend", labelKey: "rail.step.recommend" }
]);

export const STATE_STEP = Object.freeze({
  understanding: 0, awaiting_choice: 0,
  researching: 1,
  scoring: 2,
  awaiting_review: 3,
  recommending: 4, awaiting_decision: 4, drafting: 4
});

export const TURNS = Object.freeze({
  awaiting_choice: { labelKey: "rail.turn.choice", neededKey: "rail.needed.choice" },
  awaiting_review: { labelKey: "rail.turn.review", neededKey: "rail.needed.review" },
  awaiting_decision: { labelKey: "rail.turn.decision", neededKey: "rail.needed.decision" }
});

// A run that ends "not a service" has done everything it needed: the rest of the steps were not needed.
export const COMPLETE = Object.freeze(["done", "not_a_service"]);

/** Gives the shell's rail this app's steps (call once, before the console builds its rail). */
export function setUpRail() {
  configureRail({ steps: [...RAIL_STEPS], stateStep: { ...STATE_STEP }, turns: { ...TURNS }, complete: [...COMPLETE] });
}
