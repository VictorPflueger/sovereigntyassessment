// The audit log of a run: every run event as the screen saw it, and every model call (what was sent,
// without the key, and what came back, without signatures, encrypted content or page texts), exported as
// JSON from the Audit tab (brief §4). The export's totals show the model, the usage, the searches and the
// cost, which AC-21 reads. Exports store URL, title and quote, never a page's text (brief §6.6), and any
// key-like string is redacted before a file is written.

import { bus } from "./events.js";
import { APP, FX_USD_EUR } from "./config.js";
import { redactSecrets } from "./keystore.js";

const log = {
  run: null,          // { run_id, mode, query, entry_id, lang, model, source, as_of, started_at, ended_at, status }
  events: [],
  calls: [],
  cost: null,         // the last cost_update payload
  budget: null        // the last budget_update payload
};
const listeners = new Set();
let started = false;

/** Starts listening to the bus (once). */
export function initAudit() {
  if (started) return;
  started = true;
  bus.onAny((ev) => {
    if (ev.type === "run_start") {
      log.run = { run_id: ev.run_id, mode: ev.mode, ...pick(ev.payload, ["query", "entry_id", "lang", "model", "source", "as_of"]), started_at: ev.ts, ended_at: null, status: null };
      log.events = [];
      log.calls = [];
      log.cost = null;
      log.budget = null;
    }
    if (!log.run || (ev.run_id && ev.run_id !== log.run.run_id)) return;
    log.events.push(ev);
    if (ev.type === "cost_update") log.cost = ev.payload;
    if (ev.type === "budget_update") log.budget = ev.payload;
    if (ev.type === "run_end") { log.run.ended_at = ev.ts; log.run.status = ev.payload?.status || null; }
    notify();
  });
}

function pick(obj = {}, keys) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

function notify() {
  for (const fn of listeners) {
    try { fn(); } catch (e) { console.error("[Sovereignty Assessment] audit listener failed:", e); }
  }
}

/** Subscribes to changes of the log. */
export function onAudit(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** One model exchange of the live agent (js/agent.js). */
export function recordExchange({ step, request_id = null, duration_ms = null, model, request, response, usage }) {
  if (!log.run) return;
  log.calls.push({
    type: "model_call", ts: new Date().toISOString(), run_id: log.run.run_id, seq: log.calls.length + 1,
    step, model, request, response, usage: usage || null, request_id, ms: duration_ms
  });
  notify();
}

/** Counts for the Audit tab. */
export function auditCounts() {
  return { events: log.events.length, calls: log.calls.length, run: log.run ? { ...log.run } : null };
}

/** The run's totals as the export states them. */
export function auditTotals() {
  const c = log.cost || {};
  const b = log.budget || {};
  return {
    model: log.run?.model || c.model || null,
    simulated: log.run?.mode === "simulation",
    model_calls: log.calls.length,
    input_tokens: c.input_tokens || 0,
    output_tokens: c.output_tokens || 0,
    cache_write_tokens: c.cache_write_tokens || 0,
    cache_read_tokens: c.cache_read_tokens || 0,
    web_searches_billed: c.web_searches || 0,
    web_searches: b.searches?.used ?? 0,
    web_fetches: b.fetches?.used ?? c.web_fetches ?? 0,
    nudges: b.nudges ?? 0,
    cost_usd: c.usd || 0,
    cost_eur: c.eur || 0,
    fx_usd_eur: FX_USD_EUR
  };
}

/** The whole log as an object: the run, its totals, its events and its model calls. */
export function auditSnapshot() {
  return {
    app: APP.name, version: APP.version, kind: "audit",
    exported_at: new Date().toISOString(),
    run: log.run ? { ...log.run } : null,
    totals: auditTotals(),
    events: log.events.map((e) => structuredClone(e)),
    model_calls: log.calls.map((c) => structuredClone(c))
  };
}

/** The export as JSON text, with anything key-like redacted. */
export function auditJson() {
  return redactSecrets(JSON.stringify(auditSnapshot(), null, 2));
}

/** The events of the current run (for the recorder). */
export function auditEvents() {
  return log.events.slice();
}
