// The layer weights of the overall score (brief §6.5): equal by default; the method view lets a person
// change them, and every change is logged as an assumption. They live in this tab's memory only, so a
// reload starts again from equal weights and no stored assumption shapes a later visit unseen. The run
// on screen, Compare and the Portfolio all compute with the weights in force; ui.js logs each change on
// the run-event bus (weights_change), where the audit log and the console pick it up.

import { LAYERS, EQUAL_LAYER_WEIGHTS } from "./engine.js";

/** The weights a person may choose per layer: 0 leaves a layer out of the overall score. */
export const WEIGHT_CHOICES = Object.freeze([0, 0.5, 1, 1.5, 2, 3]);

let current = { ...EQUAL_LAYER_WEIGHTS };
const changes = [];
const listeners = new Set();

/** The weights in force, as a copy. */
export function getWeights() {
  return { ...current };
}

/** True when every layer weighs the same (any common value counts as equal). */
export function isEqualWeights(w = current) {
  const values = LAYERS.map((l) => Number(w?.[l] ?? 1));
  return values.every((v) => v === values[0]);
}

/**
 * New weights (a full or partial map; missing layers keep theirs). A value outside WEIGHT_CHOICES, or a
 * map that leaves every layer at 0, is refused. Returns the change { from, to, ts } or null when the
 * weights stay as they are.
 */
export function setWeights(next) {
  const to = { ...current };
  for (const l of LAYERS) {
    if (next?.[l] === undefined) continue;
    const v = Number(next[l]);
    if (!WEIGHT_CHOICES.includes(v)) throw new RangeError(`weight ${next[l]} for ${l} is not one of ${WEIGHT_CHOICES.join(", ")}`);
    to[l] = v;
  }
  if (LAYERS.every((l) => to[l] === 0)) throw new RangeError("at least one layer needs a weight above 0");
  if (LAYERS.every((l) => to[l] === current[l])) return null;
  const change = { from: { ...current }, to: { ...to }, ts: new Date().toISOString() };
  current = to;
  changes.push(change);
  for (const fn of listeners) {
    try { fn(change); } catch (e) { console.error("[Sovereignty Assessment] weights listener failed:", e); }
  }
  return change;
}

/** Equal weights again (itself a logged change when the weights were not equal). */
export function resetWeights() {
  return setWeights({ ...EQUAL_LAYER_WEIGHTS });
}

/** Every change in this tab, oldest first. */
export function weightChanges() {
  return changes.map((c) => structuredClone(c));
}

/** Subscribes to changes; returns an unsubscribe function. */
export function onWeights(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
