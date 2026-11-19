// Small observable application state (mode, run state, the service to assess, model, speed). The UI
// modules subscribe to it.

import { DEFAULT_MODEL, MODELS, STORAGE } from "./config.js";
import { TERMINAL_STATES } from "./events.js";

const listeners = new Set();

const storedModel = readSession(STORAGE.model);
const storedSpeed = Number(readSession(STORAGE.speed));

const state = {
  mode: null,              // null | "simulation" | "live"   (chosen per run; cleared by Reset)
  runState: "idle",        // see RUN_STATES in events.js
  runId: null,
  service: { entryId: null, text: "" }, // a catalogue entry, or free text (entryId null)
  model: MODELS.some((m) => m.id === storedModel) ? storedModel : DEFAULT_MODEL,
  speed: [1, 2, 4].includes(storedSpeed) ? storedSpeed : 1,
  keyPresent: false,
  drawerOpen: false
};

export function getState() {
  return { ...state, service: { ...state.service } };
}

export function setState(patch) {
  let changed = false;
  for (const [k, v] of Object.entries(patch)) {
    const same = k === "service" ? state.service.entryId === v?.entryId && state.service.text === v?.text : state[k] === v;
    if (!same) {
      state[k] = k === "service" ? { entryId: v?.entryId ?? null, text: String(v?.text ?? "") } : v;
      changed = true;
    }
  }
  if (patch.model) writeSession(STORAGE.model, patch.model);
  if (patch.speed) writeSession(STORAGE.speed, String(patch.speed));
  if (changed) for (const fn of listeners) fn(getState());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** True while a run is in progress (anything except idle and the terminal states). */
export function isRunning(s = state) {
  return s.runState !== "idle" && !TERMINAL_STATES.includes(s.runState);
}

/** True once a run has ended, whatever the outcome. */
export function isFinished(s = state) {
  return TERMINAL_STATES.includes(s.runState);
}

function readSession(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function writeSession(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* storage unavailable: keep in memory only */ }
}
