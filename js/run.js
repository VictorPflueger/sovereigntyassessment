// A run as the presenter needs it. The simulation player and the live agent emit the same events on the
// bus (js/events.js); digest() reads them in order and sorts what happened into the five steps:
// Understand, Research, Score, Your review and Recommend. Pure module: the page feeds it the bus, the
// tests the events of a pre-run played in Node.
//
// The agent's words go to the step they announce: a sentence said before its first block goes to
// Research, one said after the engine has scored stays with the step the run is in. Progress only moves
// forward. Every decision a person takes also goes into the log, with its time.

export const STEP_IDS = ["understand", "research", "score", "review", "recommend"];

/** The step a tool call belongs to; searches, fetches and reference facts follow the profile. */
const STEP_OF_TOOL = {
  cat_lookup: 0, rec_profile: 0, ui_choose_service: 0,
  rec_block: 1, rec_block_update: 1, rec_block_remove: 1, rec_layer: 1,
  eng_score: 2,
  ui_request_review: 3,
  eng_whatif: 4, ui_propose_levers: 4, ui_draft_memo: 4, ui_final_report: 4
};
const RESEARCH_TOOLS = new Set(["web_search", "web_fetch", "ref_facts"]);

/** The step a run state belongs to. */
const STEP_OF_STATE = {
  understanding: 0, awaiting_choice: 0, researching: 1, scoring: 2, awaiting_review: 3,
  recommending: 4, awaiting_decision: 4, drafting: 4
};

export function digest(events) {
  const r = {
    mode: null, query: null, entryId: null, lang: null, model: null, source: null, asOf: null,
    state: null, profile: null, blocks: new Map(), layers: {}, score: null, scoredOnce: false,
    research: [], evidence: [], narration: [], choice: null, chosen: null,
    review: null, reviewed: null, levers: null, decision: null, memo: null, memoDecision: null,
    report: null, cost: null, budget: null, notices: [], end: null, reached: 0, log: []
  };
  const said = new Map();
  let cursor = 0;
  let profiled = false;
  let open = []; // sentences waiting for the next tool call that says where they belong
  const place = (step) => {
    for (const m of open) m.step = cursor >= 2 ? cursor : Math.max(cursor, step);
    open = [];
  };
  for (const e of events) {
    const p = e.payload || {};
    switch (e.type) {
      case "run_start":
        Object.assign(r, { mode: p.mode || null, query: p.query || null, entryId: p.entry_id || null, lang: p.lang || null, model: p.model || null, source: p.source || null, asOf: p.as_of || null });
        break;
      case "state_change":
        r.state = p.state;
        if (STEP_OF_STATE[p.state] !== undefined) cursor = Math.max(cursor, STEP_OF_STATE[p.state]);
        break;
      case "narration": {
        const m = said.get(p.msg_id) || { msg_id: p.msg_id, step: cursor, lang: p.lang || r.lang };
        m.text = p.text;
        m.values = p.values || m.values || null;
        // A figure the fact audit could not check twice is shown, and marked as unchecked.
        m.audit = p.audit || m.audit || "passed";
        if (!said.has(p.msg_id)) { said.set(p.msg_id, m); open.push(m); }
        break;
      }
      case "tool_call": {
        if (p.name === "ui_progress") break;
        r.lastCall = { name: p.name, input: p.input || {} };
        const step = STEP_OF_TOOL[p.name] ?? (RESEARCH_TOOLS.has(p.name) ? (profiled ? 1 : 0) : null);
        if (step === null) break;
        place(step);
        cursor = Math.max(cursor, step);
        break;
      }
      case "profile_recorded": r.profile = p.profile; profiled = true; break;
      case "research_step": r.research.push(p); break;
      case "evidence_check": r.evidence.push(p); break;
      case "block_recorded":
        if (p.op === "remove") r.blocks.delete(p.block.id);
        else r.blocks.set(p.block.id, p.block);
        break;
      case "layer_status": r.layers[p.layer] = { status: p.status, reason: p.reason, evidence: p.evidence || [] }; break;
      case "score_update":
        r.score = { facts: p.facts || {}, partial: !!p.partial, result: p.result || null };
        if (!p.partial) r.scoredOnce = true;
        break;
      case "choice_request": r.choice = p; break;
      case "choice_decision": r.chosen = p; r.log.push({ at: e.ts || null, kind: "choice", ...p }); break;
      case "review_request": r.review = p; break;
      case "review_decision":
        if (p.action !== "correct") { r.reviewed = p; r.log.push({ at: e.ts || null, kind: "review", ...p }); }
        break;
      case "levers": r.levers = p; break;
      case "lever_decision": r.decision = p; r.log.push({ at: e.ts || null, kind: "lever", ...p }); break;
      case "action_draft": r.memo = { ...p, status: p.status === "draft" ? "pending" : p.status || "pending" }; break;
      case "action_decision":
        r.memoDecision = p;
        if (r.memo && r.memo.action_id === p.action_id) r.memo = { ...r.memo, status: p.decision };
        r.log.push({ at: e.ts || null, kind: "memo", ...p });
        break;
      case "report": r.report = p; r.log.push({ at: e.ts || null, kind: "report", by: "agent", outcome: p.outcome }); break;
      case "cost_update": r.cost = p; break;
      case "budget_update": r.budget = p; break;
      case "notice": r.notices.push(p); break;
      case "run_end": r.end = p; place(cursor); break;
      default: break;
    }
    r.reached = Math.max(r.reached, cursor);
  }
  place(cursor);
  // Words said before a tool the run never got to show on the last step the run reached, so a run that
  // stops early keeps all of its words in view.
  const last = r.end ? Math.max(r.reached, 1) : r.reached;
  r.narration = [...said.values()].filter((m) => m.text && m.text.trim()).map((m) => (m.step > last && r.end ? { ...m, step: last } : m));
  r.blockList = [...r.blocks.values()];
  r.outcome = r.report?.outcome || null;
  r.notService = r.outcome === "not_a_service";
  return r;
}

/** The scored layers of a result: how many of the six have a score. */
export function scoredLayers(result) {
  return result ? Object.values(result.layers || {}).filter((l) => l.score !== null && l.score !== undefined).length : 0;
}
