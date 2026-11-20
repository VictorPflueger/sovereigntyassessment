// The simulation player: replays a pre-run assessment (data/runs/<entry>.js) on the same run-event bus
// the live agent uses, through the same tool executors (js/tools.js), so the engine, the evidence flags,
// the guardrails and the screen behave as in Live (PLAN.md a.2). Figures are recomputed at playback; the
// texts use placeholders. The review and the lever choice wait for the person in both modes; the memo for
// the person's choice and the report's closing part come from templates in both languages, so a choice
// other than the recorded one still yields a consistent memo and report (AC-11).
//
// A pre-run: { id, entry_id, source: "hand_authored"|"recorded", as_of, method_version, query, steps }.
// Steps (one key each):
//   say:    { en, de }                            one sentence of narration (through ui_progress, audited)
//   search: { query, results: [{ url, title }] }  a web search and the results it returned
//   fetch:  { url, title, pdf? }                  a page the agent read (its text is never stored)
//   tool:   name, input                           a client tool with its recorded input; texts as { en, de }
//   memo:   true                                  the memo for the person's choice, from the template
//   report: { findings: { en, de } }              the report: the recorded findings, then code's closing part
// Evidence items carry `verified` as tools/check-runs.mjs set it from research/; the player registers the
// verified quotes as checked by the recording and sends the tool the item without the flag.
// The language is the one active when the run starts; it stays for the whole run (brief §5).

import { bus } from "./events.js";
import { createToolbox, pickLang } from "./tools.js";
import { createEvidenceRegistry } from "./evidence.js";
import { createDecisionQueue } from "./run_common.js";
import { memoTemplate } from "./drafts.js";
import { getWeights } from "./weights.js";

const ABORT = Symbol("abort");

/** Pauses before each kind of step at ×1, in milliseconds (×2 and ×4 divide them). */
export const STEP_MS = Object.freeze({ say: 1700, search: 1500, fetch: 1300, rec_block: 1100, tool: 700, memo: 1200, report: 1400 });

/** Removes the recording's flags from evidence and registers its verified quotes (in place). */
export function prepareEvidence(input, registry) {
  const visit = (node) => {
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node.evidence)) {
      for (const item of node.evidence) {
        if (item && typeof item === "object") {
          if (item.verified === true && item.quote) registry.addVerifiedQuote(item.url, item.quote, "recording");
          delete item.verified;
          delete item.read_on;
          delete item.via;
        }
      }
    }
    for (const v of Object.values(node)) if (v && typeof v === "object") visit(v);
  };
  visit(input);
  return input;
}

export function createSimulationPlayer({ getSpeed }) {
  let current = null;
  let last = null; // the latest run, ended or not: its toolbox stays readable for the exports

  async function play(def, { lang = "en", service = "", mode = "simulation" } = {}) {
    const r = { ended: false, cancelled: false, waiters: new Set(), calls: 0 };
    current = r;
    last = r;
    const registry = createEvidenceRegistry();
    const decisions = createDecisionQueue(() => r.ended, () => r.cancelled, ABORT);
    r.decisions = decisions;
    const asOf = new Date(`${def.as_of}T12:00:00Z`);
    let phase = null;
    const toolbox = createToolbox({
      lang, mode, registry,
      emit: (type, payload) => { if (!r.ended) bus.emit(type, payload); },
      next: (type, pred) => decisions.next(type, pred),
      onPhase: (s) => { if (s && s !== phase && !r.ended) { phase = s; bus.emit("state_change", { state: s }); } },
      now: () => asOf,
      service: { query: def.query, entry_id: def.entry_id, name: service },
      weights: getWeights()
    });
    r.toolbox = toolbox;

    try {
      bus.emit("cost_update", { simulated: true, eur: 0, usd: 0, input_tokens: 0, output_tokens: 0, web_searches: 0, web_fetches: 0 });
      let searches = 0;
      let fetches = 0;
      const budget = () => bus.emit("budget_update", { model_calls: { used: 0, cap: 0 }, searches: { used: searches, per_turn_cap: null }, fetches: { used: fetches, per_turn_cap: null }, nudges: 0, simulated: true });
      budget();
      for (const step of def.steps) {
        if (r.cancelled) throw ABORT;
        if (step.say) {
          await wait(r, STEP_MS.say);
          await callTool(r, "ui_progress", { text: pickLang(step.say, lang) });
        } else if (step.search) {
          const id = `sim-s-${++r.calls}`;
          bus.emit("tool_call", { call_id: id, name: "web_search", input: { query: step.search.query }, server: true });
          if (phase === null || phase === "idle") { phase = "understanding"; bus.emit("state_change", { state: phase }); }
          await wait(r, STEP_MS.search);
          toolbox.research({ kind: "search", query: step.search.query, results: step.search.results, ok: true });
          searches += 1;
          bus.emit("tool_result", { call_id: id, name: "web_search", server: true, ok: true, result: { query: step.search.query, results: step.search.results } });
          budget();
        } else if (step.fetch) {
          const id = `sim-f-${++r.calls}`;
          bus.emit("tool_call", { call_id: id, name: "web_fetch", input: { url: step.fetch.url }, server: true });
          await wait(r, STEP_MS.fetch);
          toolbox.research({ kind: "fetch", url: step.fetch.url, title: step.fetch.title, ok: true, text: null, doc: step.fetch.pdf ? "pdf" : "recorded" });
          fetches += 1;
          bus.emit("tool_result", { call_id: id, name: "web_fetch", server: true, ok: true, result: { url: step.fetch.url, title: step.fetch.title, pdf: !!step.fetch.pdf } });
          budget();
        } else if (step.tool) {
          await wait(r, step.tool === "rec_block" ? STEP_MS.rec_block : STEP_MS.tool);
          const input = prepareEvidence(pickLang(structuredClone(step.input || {}), lang), registry);
          await callTool(r, step.tool, input);
        } else if (step.memo) {
          await wait(r, STEP_MS.memo);
          const st = toolbox.state();
          const memo = memoTemplate(toolbox.leverSet(), st.decision, lang);
          await callTool(r, "ui_draft_memo", { lever_id: st.decision, subject: memo.subject, body: memo.body });
        } else if (step.report) {
          await wait(r, STEP_MS.report);
          await callTool(r, "ui_final_report", { outcome: step.report.outcome || "assessed", markdown: pickLang(step.report.findings, lang) });
        }
      }
      const st = toolbox.state();
      end(r, st.outcome === "not_a_service" ? "not_a_service" : st.reported ? "done" : "stopped");
    } catch (e) {
      if (e === ABORT || e?.name === "AbortError") return;
      console.error("[Sovereignty Assessment] simulation failed:", e);
      bus.emit("notice", { level: "error", key: "notice.simFailed", vars: { message: String(e?.message || e) } });
      end(r, "error");
    } finally {
      decisions.close();
      if (current === r) current = null;
    }
  }

  /** One recorded tool call through the executors, with the console's tool line around it. */
  async function callTool(r, name, input) {
    const call_id = `sim-t-${++r.calls}`;
    bus.emit("tool_call", { call_id, name, input, server: false });
    const out = await r.toolbox.execute(name, input);
    if (r.ended || r.cancelled) throw ABORT;
    bus.emit("tool_result", { call_id, name, ok: !out.isError, result: out.result, input, server: false });
    // A pre-run passed tools/check-runs.mjs, so a refusal means the recording does not fit this build.
    if (out.isError) throw new Error(`${name}: ${out.result?.error || "refused"}`);
    return out;
  }

  function wait(r, ms) {
    if (r.cancelled) return Promise.reject(ABORT);
    const speed = Math.max(0.25, Number(getSpeed?.()) || 1);
    return new Promise((resolve, reject) => {
      const cancel = () => { clearTimeout(timer); r.waiters.delete(cancel); reject(ABORT); };
      const timer = setTimeout(() => { r.waiters.delete(cancel); resolve(); }, ms / speed);
      r.waiters.add(cancel);
    });
  }

  function end(r, status, reasonKey = null) {
    if (r.ended) return;
    r.ended = true;
    bus.emit("state_change", { state: status === "done" || status === "not_a_service" ? "done" : status });
    bus.emit("run_end", { status, ...(reasonKey ? { reason: reasonKey } : {}) });
  }

  function abort() {
    const r = current;
    if (!r || r.ended) return;
    r.cancelled = true;
    for (const w of [...r.waiters]) w();
    r.decisions?.close();
    end(r, "aborted", "controls.aborted");
  }

  return { play, abort, isActive: () => !!current && !current.ended, toolbox: () => (current || last)?.toolbox || null };
}
