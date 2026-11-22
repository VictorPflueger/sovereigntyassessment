// Plays a pre-run in Node the way the page replays it: the bundled data as window globals, the run on
// the event bus with its own id, every decision answered (the review confirmed, a lever or Keep as is,
// the memo approved or rejected), and the run's events collected for js/run.js's digest. Used by
// tests/unit.mjs (the presenter group) and tests/vici.mjs (every sentence on every path).
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import { APP_ROOT } from "./harness.mjs";

const mod = (p) => import(pathToFileURL(path.join(APP_ROOT, p)).href);

/** The bundled data as the page has it: window.SA_CATALOGUE, SA_REF_FACTS and SA_RUNS. */
export function loadData() {
  const win = {};
  for (const f of ["data/catalogue.js", "data/ref_facts.js", ...fs.readdirSync(path.join(APP_ROOT, "data/runs")).sort().map((x) => `data/runs/${x}`)]) {
    vm.runInNewContext(fs.readFileSync(path.join(APP_ROOT, f), "utf8"), { window: win }, { filename: f });
  }
  globalThis.window = Object.assign(globalThis.window || {}, win);
  return win;
}

/**
 * Plays `def` in `lang`: choice is a lever id or "keep"; memo "approved" or "rejected".
 * Returns { events, problems, blocks, result } (js/runs_check.js's playProblems, with the events).
 */
export async function playCase(def, lang, { choice = "keep", memo = "approved" } = {}) {
  const { bus } = await mod("js/events.js");
  const { playProblems } = await mod("js/runs_check.js");
  const { createSimulationPlayer } = await mod("js/simulation.js");
  const runId = `test-${def.id}-${lang}-${choice}-${memo}`;
  const events = [];
  const off = bus.onAny((ev) => { if (ev.run_id === runId) events.push(ev); });
  const answer = bus.on("action_draft", (ev) => queueMicrotask(() => bus.emit("action_decision", { action_id: ev.payload.action_id, decision: memo, by: "user" })));
  bus.beginRun({ run_id: runId, mode: "simulation" });
  bus.emit("run_start", { query: def.query, entry_id: def.entry_id, lang, source: def.source, as_of: def.as_of });
  try {
    const played = await playProblems(def, { lang, choice, createPlayer: createSimulationPlayer });
    return { events, ...played };
  } finally {
    off();
    answer();
    bus.endRun();
  }
}

/** Whether a pre-run proposes levers (and so has a memo after the person's choice). */
export const hasLevers = (def) => def.steps.some((st) => st.tool === "ui_propose_levers" || st.levers);
