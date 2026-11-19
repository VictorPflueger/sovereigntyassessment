// The run-event bus. Every UI effect flows through here, whether the live agent or the simulation
// player produced it. The UI subscribes to event types and never asks which producer is running;
// only the mode badge, the console watermark and the audit export read the envelope's `mode`.
// The bus and the envelope are the sister apps'; the event types and run states are this app's
// (PLAN.md b.1).
//
// Envelope: { id, seq, type, ts (ISO), t (ms since run start or null), run_id, mode, payload }
//
// Event types and payloads (the agent and the player arrive in version 0.2.0; version 0.1.0 emits none)
//   run_start        { run_id, mode: "live"|"simulation", query, entry_id?, lang, model?, source?: "hand_authored"|"recorded", as_of? }
//   state_change     { state, note? }   states: see RUN_STATES
//   narration        { msg_id, text, done, lang, audit: "passed"|"unchecked" }
//   reasoning        { msg_id, text, done }            summarised model thinking (shown collapsed)
//   tool_call        { call_id, name, input, server }  server=true for Anthropic-hosted tools (web_search, web_fetch)
//   tool_result      { call_id, name, ok, summary, result, server }
//   choice_request   { request_id, question, candidates: [{ entry_id?, name, description }] }
//   choice_decision  { request_id, chosen: index|null, by: "user" }
//   profile_recorded { profile, evidence_checks }
//   research_step    { kind: "search"|"fetch", query?, url?, title?, results?: [{ url, title }], ok, error_code? }
//   evidence_check   { subject, url, quote, verified, via: "fetched_text"|"citation"|"catalogue"|"ref_facts"|"recording", fields }
//   block_recorded   { op: "add"|"update"|"remove", block }
//   layer_status     { layer, status: "no_evidence"|"not_applicable", reason, evidence? }
//   score_update     { facts: { key: value }, partial }
//   review_request   { request_id, summary, block_ids }
//   review_decision  { request_id, action: "confirm"|"skip"|"correct", block_id?, changes?, reason?, by: "user" }
//   levers           { options_seq, levers: [{ lever_id, title, rationale, changes, evidence, whatif: { facts } }], keep: { facts } }
//   lever_decision   { options_seq, lever_id: "L1"|"L2"|"L3"|"keep", by: "user" }
//   action_draft     { action_id, type: "memo", subject, body, status: "pending", unchecked?: [token] }
//   action_decision  { action_id, decision: "approved"|"rejected", by: "user" }
//   report           { markdown, outcome: "assessed"|"not_a_service"|"stopped", lang }
//   budget_update    { model_calls: { used, cap }, searches: { used, per_turn_cap }, fetches: { used, per_turn_cap }, nudges }
//   cost_update      { eur, usd, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, web_searches, web_fetches, simulated }
//   weights_change   { from, to, by: "user" }        logged as an assumption
//   notice           { level: "info"|"warn"|"error", key, vars? }   code-written lines are i18n keys, re-rendered on a language change
//   attempt_discarded { msg_ids, call_ids, reason }   a response that was not kept (failed and retried, or redone)
//   run_end          { status: "done"|"not_a_service"|"stopped"|"aborted"|"error", reason? }

/**
 * The run states, in the order a run passes them. Their labels are i18n keys "state.<state>"; the
 * status pill and the console's phase lines say what the agent does in the words of the five steps.
 */
export const RUN_STATES = [
  "idle", "understanding", "awaiting_choice", "researching", "scoring", "awaiting_review",
  "recommending", "awaiting_decision", "drafting", "done", "stopped", "aborted", "error"
];

/** The run states in which the run waits for the person, and the step each one waits for. */
export const HUMAN_STATES = { awaiting_choice: "choice", awaiting_review: "review", awaiting_decision: "decision" };

/** The run states after which no run is in progress. */
export const TERMINAL_STATES = ["done", "stopped", "aborted", "error"];

class RunEventBus {
  constructor() {
    this.handlers = new Map();
    this.anyHandlers = new Set();
    this.seq = 0;
    this.run = null; // { run_id, mode, t0 }
  }

  /** Subscribe to one event type. Returns an unsubscribe function. */
  on(type, fn) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type).add(fn);
    return () => this.handlers.get(type)?.delete(fn);
  }

  /** Subscribe to every event. Returns an unsubscribe function. */
  onAny(fn) {
    this.anyHandlers.add(fn);
    return () => this.anyHandlers.delete(fn);
  }

  /** Marks the start of a run so events carry run id, mode and relative time. */
  beginRun({ run_id, mode }) {
    this.run = { run_id, mode, t0: performance.now() };
  }

  endRun() {
    this.run = null;
  }

  currentRun() {
    return this.run ? { ...this.run } : null;
  }

  emit(type, payload = {}) {
    const envelope = {
      id: `ev-${Date.now().toString(36)}-${(++this.seq).toString(36)}`,
      seq: this.seq,
      type,
      ts: new Date().toISOString(),
      t: this.run ? Math.round(performance.now() - this.run.t0) : null,
      run_id: this.run?.run_id ?? null,
      mode: this.run?.mode ?? null,
      payload
    };
    for (const fn of this.handlers.get(type) || []) safeCall(fn, envelope);
    for (const fn of this.anyHandlers) safeCall(fn, envelope);
    return envelope;
  }
}

function safeCall(fn, envelope) {
  try {
    fn(envelope);
  } catch (err) {
    // A failing subscriber must never break the run; surface it in the browser console only.
    console.error(`[Sovereignty Assessment] event handler failed for ${envelope.type}:`, err);
  }
}

export const bus = new RunEventBus();

/** New run id, e.g. run-20261119-1556-k3f9. */
export function newRunId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `run-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}-${Math.random().toString(36).slice(2, 6)}`;
}
