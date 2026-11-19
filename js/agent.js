// The live agent: the Claude tool-use loop with web search and web fetch, run entirely in the presenter's
// browser (brief §7). Adapted from Rebate Hunter's js/agent.js, the sister app that already sends the
// server-side web search.
//
// One run = repeated streaming calls to POST /v1/messages with the same tools array (rule 8). Every
// assistant block goes back unchanged, encrypted content, citations and thinking included (rule 6).
// stop_reason drives the loop:
//   tool_use   → execute the client tools and answer with tool_result blocks only (in a mixed turn the
//                server tools' results are already inside the assistant message)
//   pause_turn → resend the conversation unchanged
//   max_tokens → retry once with more room if a tool call was cut off, otherwise ask to continue
//   end_turn   → done after the report; before it, at most two nudges that say what is left of each budget
// Caps checked before every call: no 41st model call, and none once €3 is spent (AC-10). A 400 for a
// switched-off web search or web fetch stops Live with a message that offers Simulation (AC-08).
// Searches and fetches count only once the response that ran them is kept: their results then feed the
// evidence registry (provenance, fetched text, documents in conversation order, citations).

import { bus } from "./events.js";
import { MODELS, AGENT, SERVER_TOOLS } from "./config.js";
import { streamMessage, withRetry, ApiError } from "./anthropic.js";
import { toolDefinitions, createToolbox, UI_BLOCKING_TOOLS, SERVER_TOOL_NAMES } from "./tools.js";
import { buildSystemPrompt, buildOpeningMessage, buildNudge } from "./prompt.js";
import { createEvidenceRegistry } from "./evidence.js";
import { createCostTracker } from "./cost.js";
import { recordExchange } from "./audit.js";
import { getKey, forgetKey } from "./keystore.js";
import { apiMessage } from "./api_messages.js";
import { appToday } from "./clock.js";
import { createDecisionQueue, researchFromBlocks } from "./run_common.js";

const ABORT = Symbol("abort");
const PER_TURN = Object.fromEntries(SERVER_TOOLS.map((t) => [t.name, t.max_uses]));

/** True for the 400 an organisation returns when an admin has switched a server tool off. */
export function disabledServerTool(err) {
  if (!(err instanceof ApiError) && err?.status === undefined) return null;
  if (err.status !== 400) return null;
  const m = String(err.message || "");
  const off = /(not enabled|disabled|not allowed|not available|turned off|switched off)/i.test(m);
  if (off && /web[\s_-]?search/i.test(m)) return "web_search";
  if (off && /web[\s_-]?fetch/i.test(m)) return "web_fetch";
  return null;
}

/**
 * hooks: { onKeyRejected() }. run({ query, entryId, lang, modelId }) resolves when the run has ended.
 */
export function createLiveAgent(hooks = {}) {
  let current = null;

  async function run({ query, entryId = null, lang = "en", modelId }) {
    const modelDef = MODELS.find((m) => m.id === modelId) || MODELS[0];
    const todayDate = appToday();
    const today = todayDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const r = {
      modelDef, lang, ended: false, cancelled: false,
      ac: new AbortController(),
      phase: null, calls: 0, step: 0,
      compat: { effort: true, display: true, thinking: true, cache: true },
      maxTokens: modelDef.maxTokens,
      cost: createCostTracker(modelDef.id),
      searches: 0, fetches: 0, nudges: 0,
      registry: createEvidenceRegistry(),
      exchanges: 0
    };
    current = r;
    const decisions = createDecisionQueue(() => r.ended, () => r.cancelled, ABORT);
    r.decisions = decisions;

    const toolbox = createToolbox({
      lang, mode: "live", registry: r.registry,
      // Nothing a tool emits after the run has ended (abort, reset) may reach the next run's screen.
      emit: (type, payload) => { if (!r.ended) bus.emit(type, payload); },
      next: (type, pred) => decisions.next(type, pred),
      onPhase: (s) => setPhase(r, s),
      now: () => todayDate,
      service: { query, entry_id: entryId }
    });
    r.toolbox = toolbox;

    bus.emit("cost_update", { ...r.cost.snapshot(), web_fetches: 0 });
    budget(r);
    setPhase(r, "understanding");

    let system = buildSystemPrompt({ lang, today });
    const messages = [{ role: "user", content: buildOpeningMessage({ query, entryId, lang, today }) }];
    let sentUpTo = 0;
    let maxTokensRetried = false;

    try {
      for (;;) {
        if (r.cancelled) throw ABORT;
        // The caps, before every call (AC-10).
        if (r.calls >= AGENT.maxSteps) return stop(r, "notice.stepLimit", { n: AGENT.maxSteps });
        if (r.cost.snapshot().eur >= AGENT.budgetEur) return stop(r, "notice.costCap");
        r.step += 1;
        r.calls += 1;
        budget(r);

        const started = performance.now();
        const call = await callModel(r, { getSystem: () => system, messages });
        const { message, requestId, incomplete, attemptBody, attemptIds } = call;
        const snap = r.cost.add(message.usage);
        audit(r, { body: attemptBody, appended: messages.slice(sentUpTo).filter((m) => m.role === "user"), message, requestId, ms: Math.round(performance.now() - started) });
        sentUpTo = messages.length;

        const stopReason = message.stop_reason;
        if (stopReason === "max_tokens" && incomplete.size && !maxTokensRetried) {
          // A tool call was cut off mid-input: discard this turn and retry once with more room.
          maxTokensRetried = true;
          r.maxTokens = Math.min(AGENT.maxOutputTokens, Math.round(r.maxTokens * 1.5));
          bus.emit("cost_update", { ...snap, web_fetches: r.fetches });
          discardAttempt(attemptIds, "notice.maxTokensRetry");
          continue;
        }

        // The response is kept: its searches, fetches and citations now count (in block order, so a
        // fetched document precedes the text that cites it).
        const kept = incomplete.size ? message.content.filter((_, i) => !incomplete.has(i)) : message.content;
        absorb(r, kept, toolbox);
        bus.emit("cost_update", { ...snap, web_fetches: r.fetches });
        budget(r);
        if (kept.length) messages.push({ role: "assistant", content: kept });

        if (snap.eur >= AGENT.budgetEur) return stop(r, "notice.costCap");
        if (stopReason === "pause_turn") continue;

        const uses = kept.filter((b) => b.type === "tool_use");
        if (stopReason === "tool_use" || (stopReason === "max_tokens" && uses.length)) {
          if (!uses.length) continue;
          const results = await runTools(r, uses, toolbox);
          messages.push({ role: "user", content: results });
          continue;
        }
        if (stopReason === "max_tokens") {
          sentUpTo = Math.min(sentUpTo, pushUserText(messages, "Continue from where you stopped."));
          continue;
        }
        if (stopReason === "refusal") return stop(r, "notice.refusal", null, "error");
        if (stopReason === "model_context_window_exceeded") return stop(r, "notice.contextWindow", null, "error");

        // end_turn: done after the report; before it, at most two nudges (rule 8).
        const st = toolbox.state();
        if (st.reported) return finish(r, st.outcome === "not_a_service" ? "not_a_service" : st.outcome === "stopped" ? "stopped" : "done");
        if (r.nudges < AGENT.maxNudges) {
          r.nudges += 1;
          budget(r);
          bus.emit("notice", { level: "info", key: "notice.nudge", vars: { n: r.nudges, max: AGENT.maxNudges } });
          const nudge = buildNudge({
            calls: AGENT.maxSteps - r.calls,
            eurLeft: Math.max(0, AGENT.budgetEur - r.cost.snapshot().eur),
            searches: r.searches, fetches: r.fetches, state: st
          });
          sentUpTo = Math.min(sentUpTo, pushUserText(messages, nudge));
          continue;
        }
        return stop(r, "notice.ended", null, "stopped");
      }
    } catch (e) {
      if (e === ABORT || e?.name === "AbortError") {
        if (!r.ended) finish(r, "aborted", "controls.aborted");
        return;
      }
      handleError(r, e);
    } finally {
      decisions.close();
      if (current === r) current = null;
    }
  }

  // ---- model calls ----------------------------------------------------------------------------------

  async function callModel(r, { getSystem, messages }) {
    const stream = makeStreamHooks(r);
    let downgraded = 0;
    for (;;) {
      const body = requestBody(r, getSystem(), messages);
      try {
        const out = await withRetry(
          () => { stream.beginAttempt(); return streamMessage({ key: getKey(), body, signal: r.ac.signal, hooks: stream.hooks, idleMs: AGENT.idleTimeoutMs }); },
          {
            retries: 2,
            signal: r.ac.signal,
            onRetry: ({ attempt, waitMs, error }) => {
              // Whatever the failed attempt showed is not part of the run.
              discardAttempt(stream.ids(), null);
              const m = apiMessage({ status: error.status, error });
              bus.emit("notice", { level: "warn", key: "notice.retrying", vars: { seconds: Math.round(waitMs / 1000), attempt, of: 2, why: m.key } });
            }
          }
        );
        return { ...out, attemptBody: body, attemptIds: stream.ids() };
      } catch (e) {
        if (r.cancelled) throw ABORT;
        discardAttempt(stream.ids(), null);
        if (!(e instanceof ApiError) || e.status !== 400 || downgraded >= 4) throw e;
        if (disabledServerTool(e)) throw e;
        // Graceful degradation for optional request features, as in Rebate Hunter.
        if (/output_config|effort/i.test(e.message) && r.compat.effort) r.compat.effort = false;
        else if (/display/i.test(e.message) && r.compat.display) r.compat.display = false;
        else if (/thinking/i.test(e.message) && r.compat.thinking) r.compat.thinking = false;
        else if (/cache_control/i.test(e.message) && r.compat.cache) r.compat.cache = false;
        else throw e;
        downgraded += 1;
      } finally {
        stream.flush();
      }
    }
  }

  function requestBody(r, system, messages) {
    const body = {
      model: r.modelDef.id,
      max_tokens: r.maxTokens,
      system,
      // The same array in every request of the run (rule 8): the tests compare each with the first.
      tools: toolDefinitions(),
      tool_choice: { type: "auto" },
      messages
    };
    if (r.compat.cache) body.cache_control = { type: "ephemeral" };
    if (r.compat.thinking) body.thinking = r.compat.display ? { type: "adaptive", display: "summarized" } : { type: "adaptive" };
    if (r.compat.effort) body.output_config = { effort: r.modelDef.effort };
    return body;
  }

  /**
   * Streams the model's plain text (shown behind Details, brief §6.6) and summarised thinking to the
   * console while a response arrives, and shows each server tool call as it starts. Message ids are
   * unique per attempt, so a discarded attempt's lines can be marked without touching the retry's.
   */
  function makeStreamHooks(r) {
    const pending = new Map();
    let timer = null;
    let attempt = 0;
    let shown = { msg_ids: [], call_ids: [] };
    const flushPending = () => {
      timer = null;
      if (!r.ended) for (const [id, ev] of pending) bus.emit(ev.type, { msg_id: id, text: ev.text, done: false, ...(ev.type === "narration" ? { lang: r.lang, detail: true } : {}) });
      pending.clear();
    };
    const queue = (type, id, text) => {
      if (r.ended) return;
      pending.set(id, { type, text });
      if (!timer) timer = setTimeout(flushPending, 45);
    };
    const nid = (i) => `n-${r.step}-${attempt}-${i}`;
    const rid = (i) => `r-${r.step}-${attempt}-${i}`;
    const seen = (id) => { if (!shown.msg_ids.includes(id)) shown.msg_ids.push(id); };
    return {
      beginAttempt: () => {
        clearTimeout(timer);
        timer = null;
        pending.clear();
        attempt += 1;
        shown = { msg_ids: [], call_ids: [] };
      },
      ids: () => ({ msg_ids: shown.msg_ids.slice(), call_ids: shown.call_ids.slice() }),
      hooks: {
        onText: (i, text) => { if (text.trim()) { seen(nid(i)); queue("narration", nid(i), text); } },
        onThinking: (i, text) => { if (text.trim()) { seen(rid(i)); queue("reasoning", rid(i), text); } },
        onBlockStop: (i, block) => {
          if (r.ended) return;
          if (block.type === "text" && block.text.trim()) {
            pending.delete(nid(i));
            seen(nid(i));
            bus.emit("narration", { msg_id: nid(i), text: block.text, done: true, lang: r.lang, detail: true, citations: (block.citations || []).length });
          } else if (block.type === "thinking" && block.thinking?.trim()) {
            pending.delete(rid(i));
            seen(rid(i));
            bus.emit("reasoning", { msg_id: rid(i), text: block.thinking, done: true });
          } else if (block.type === "server_tool_use") {
            setPhase(r, researchPhase(r));
            shown.call_ids.push(block.id);
            bus.emit("tool_call", { call_id: block.id, name: block.name, input: block.input || {}, server: true });
          }
        }
      },
      flush: () => {
        clearTimeout(timer);
        timer = null;
        pending.clear();
      }
    };
  }

  /** Marks what a response that is not kept showed as discarded. */
  function discardAttempt(ids, key) {
    if (ids && (ids.msg_ids.length || ids.call_ids.length)) bus.emit("attempt_discarded", { ...ids, reason: key || "notice.discarded" });
    if (key) bus.emit("notice", { level: "info", key });
  }

  /** A kept response's server-tool blocks and citations, into the run's counts and evidence registry. */
  function absorb(r, content, toolbox) {
    const research = researchFromBlocks(content);
    for (const step of research.steps) {
      if (step.kind === "search") r.searches += 1;
      if (step.kind === "fetch") r.fetches += 1;
      toolbox.research(step);
      bus.emit("tool_result", step.toolResult);
    }
    for (const c of research.citations) toolbox.cite(c);
  }

  // ---- client tools -----------------------------------------------------------------------------------

  async function runTools(r, uses, toolbox) {
    // Recording tools may run side by side; everything else in order.
    const results = [];
    for (const block of uses) {
      if (r.cancelled) throw ABORT;
      results.push(await execOne(r, block, toolbox));
    }
    return results;
  }

  async function execOne(r, block, toolbox) {
    const name = block.name;
    bus.emit("tool_call", { call_id: block.id, name, input: block.input || {}, server: false });
    let out;
    try {
      out = await toolbox.execute(name, block.input || {});
    } catch (e) {
      if (e === ABORT || typeof e === "symbol" || e?.name === "AbortError") throw ABORT;
      const why = String(e?.message || "unknown error");
      out = { content: JSON.stringify({ error: why }), isError: true, result: { error: why }, summary: { name, ok: false } };
    }
    // A tool that returns after Abort or Reset is dropped, never shown in the next run.
    if (r.ended || r.cancelled) throw ABORT;
    bus.emit("tool_result", { call_id: block.id, name, ok: !out.isError, result: out.result, input: block.input || {}, server: false });
    if (!UI_BLOCKING_TOOLS.has(name) && SERVER_TOOL_NAMES.has(name)) setPhase(r, researchPhase(r));
    return { type: "tool_result", tool_use_id: block.id, content: out.content, ...(out.isError ? { is_error: true } : {}) };
  }

  // ---- phases, budgets ----------------------------------------------------------------------------------

  function researchPhase(r) {
    const st = r.toolbox?.state();
    if (!st) return "understanding";
    if (["recommending", "awaiting_decision", "drafting", "awaiting_review", "scoring"].includes(r.phase)) return r.phase;
    return st.profile || st.blocks ? "researching" : "understanding";
  }

  function setPhase(r, state) {
    if (!state || state === r.phase || r.ended) return;
    r.phase = state;
    bus.emit("state_change", { state });
  }

  function budget(r) {
    if (r.ended) return;
    bus.emit("budget_update", {
      model_calls: { used: r.calls, cap: AGENT.maxSteps },
      searches: { used: r.searches, per_turn_cap: PER_TURN.web_search },
      fetches: { used: r.fetches, per_turn_cap: PER_TURN.web_fetch },
      nudges: r.nudges,
      cost: { eur: r.cost.snapshot().eur, cap: AGENT.budgetEur }
    });
  }

  // ---- ending -------------------------------------------------------------------------------------------

  function finish(r, status, reasonKey) {
    if (r.ended) return;
    r.ended = true;
    const state = status === "done" || status === "not_a_service" ? "done" : status;
    bus.emit("state_change", { state });
    bus.emit("run_end", { status, ...(reasonKey ? { reason: reasonKey } : {}) });
  }

  /** Ends the run with a notice: a cap, the agent's own stop, a refusal. */
  function stop(r, key, vars = null, status = "stopped") {
    bus.emit("notice", { level: status === "error" ? "error" : "warn", key, ...(vars ? { vars } : {}) });
    finish(r, status, key);
  }

  function handleError(r, e) {
    // An API error is the run's outcome, said in the console; anything else is a defect worth an error.
    if (e instanceof ApiError) console.warn("[Sovereignty Assessment] live run stopped:", e.status, e.type, e.message);
    else console.error("[Sovereignty Assessment] live run failed:", e);
    const tool = disabledServerTool(e);
    if (tool) {
      // The key's organisation has switched a server tool off: Live cannot research (rule 6).
      bus.emit("notice", { level: "error", key: tool === "web_search" ? "notice.webSearchOff" : "notice.webFetchOff", vars: { message: e.message }, action: "simulation" });
      finish(r, "stopped", tool === "web_search" ? "notice.webSearchOff" : "notice.webFetchOff");
      return;
    }
    if (e instanceof ApiError) {
      if (e.status === 401) { forgetKey(); hooks.onKeyRejected?.(); }
      const m = e.status === 404 ? { key: "notice.modelMissing", vars: { model: r.modelDef.label } } : apiMessage({ status: e.status, error: e });
      bus.emit("notice", { level: "error", key: m.key, vars: { ...(m.vars || {}), ...(e.requestId ? { request: e.requestId } : {}) } });
    } else {
      bus.emit("notice", { level: "error", key: "notice.unexpected", vars: { message: String(e?.message || e) } });
    }
    finish(r, "error", "notice.unexpected");
  }

  function abort() {
    const r = current;
    if (!r || r.ended) return;
    r.cancelled = true;
    r.ac.abort();
    r.decisions?.close();
    finish(r, "aborted", "controls.aborted");
  }

  return { run, abort, isActive: () => !!current && !current.ended, toolbox: () => current?.toolbox || null };
}

// -----------------------------------------------------------------------------------------------------

/**
 * Adds a text instruction as the next user turn, merging into a trailing user turn if needed. Returns
 * the index of the message it changed, so the audit records it again.
 */
function pushUserText(messages, text) {
  const last = messages[messages.length - 1];
  if (last?.role === "user") {
    const content = Array.isArray(last.content) ? last.content : [{ type: "text", text: String(last.content) }];
    last.content = [...content, { type: "text", text }];
    return messages.length - 1;
  }
  messages.push({ role: "user", content: text });
  return messages.length - 1;
}

/** Audit record of one model exchange: the newly sent messages and the response, without page texts. */
function audit(r, { body, appended, message, requestId, ms }) {
  r.exchanges += 1;
  const request = {
    model: body.model, max_tokens: body.max_tokens,
    thinking: body.thinking || null, output_config: body.output_config || null,
    cache_control: body.cache_control || null,
    tools: body.tools.map((t) => t.name),
    messages_total: body.messages.length,
    appended_messages: appended.map((m) => ({ role: m.role, content: Array.isArray(m.content) ? m.content.map(stripBlock) : m.content }))
  };
  if (r.exchanges === 1) {
    request.system = body.system;
    request.tool_definitions = body.tools;
  }
  recordExchange({
    step: r.step, request_id: requestId, duration_ms: ms, model: body.model,
    request,
    response: { id: message.id, model: message.model, stop_reason: message.stop_reason, usage: message.usage, content: message.content.map(stripBlock) },
    usage: message.usage
  });
}

/**
 * A content block as the audit keeps it: signatures, encrypted content and the text of fetched pages are
 * left out (exports store URL, title and quote, never a page's text: brief §6.6).
 */
export function stripBlock(b) {
  if (!b || typeof b !== "object") return b;
  const copy = { ...b };
  if (copy.signature) copy.signature = "[signature omitted]";
  if (copy.type === "redacted_thinking") copy.data = "[redacted]";
  if (copy.type === "web_search_tool_result" && Array.isArray(copy.content)) {
    copy.content = copy.content.map((x) => ({ type: x.type, title: x.title, url: x.url, page_age: x.page_age }));
  }
  if (copy.type === "web_fetch_tool_result" && copy.content && typeof copy.content === "object") {
    const c = copy.content;
    copy.content = c.type === "web_fetch_result"
      ? { type: c.type, url: c.url, retrieved_at: c.retrieved_at, document: { title: c.content?.title ?? c.title ?? null, source_type: c.content?.source?.type ?? null, media_type: c.content?.source?.media_type ?? null, characters: typeof c.content?.source?.data === "string" ? c.content.source.data.length : null, data: "[page text omitted]" } }
      : { ...c };
  }
  if (copy.type === "tool_result" && typeof copy.content === "string" && copy.content.length > 4000) copy.content = `${copy.content.slice(0, 4000)}…`;
  return copy;
}
