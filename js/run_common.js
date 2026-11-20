// What the live agent and the simulation player share: the queue of the person's decisions, which a tool
// waits on, and the reading of a response's server-tool blocks and citations.

import { bus } from "./events.js";

const DECISIONS = ["choice_decision", "review_decision", "lever_decision"];

/**
 * The person's decisions of one run, captured from its start so none is lost while the producer is busy.
 * next(type, predicate) resolves with the first matching payload (oldest first), now or when it arrives;
 * it rejects with `abortValue` once the run is closed.
 */
export function createDecisionQueue(isEnded, isCancelled, abortValue) {
  const queued = [];
  const waiters = new Set();
  let closed = false;
  const poke = () => { for (const w of [...waiters]) w.check(); };
  const offs = DECISIONS.map((type) => bus.on(type, (ev) => {
    if (closed || isEnded()) return;
    queued.push({ type, payload: ev.payload || {} });
    poke();
  }));
  function take(type, pred) {
    const i = queued.findIndex((q) => q.type === type && pred(q.payload));
    return i >= 0 ? queued.splice(i, 1)[0].payload : null;
  }
  return {
    next(type, pred = () => true) {
      if (closed || isCancelled()) return Promise.reject(abortValue);
      const now = take(type, pred);
      if (now) return Promise.resolve(now);
      return new Promise((resolve, reject) => {
        const w = {
          check: () => {
            const v = take(type, pred);
            if (!v) return;
            waiters.delete(w);
            resolve(v);
          },
          cancel: () => { waiters.delete(w); reject(abortValue); }
        };
        waiters.add(w);
      });
    },
    close() {
      if (closed) return;
      closed = true;
      offs.forEach((off) => off());
      for (const w of [...waiters]) w.cancel();
    }
  };
}

/**
 * The research steps and citations of a kept response, in block order: web_search_tool_result and
 * web_fetch_tool_result blocks (with the query or URL of their server_tool_use), and the citations of
 * text and thinking blocks. Returns { steps: [{ kind, query?, results?, url?, title?, ok, error_code?,
 * text?, doc?, toolResult }], citations }.
 */
export function researchFromBlocks(content = []) {
  const uses = new Map();
  const steps = [];
  const citations = [];
  for (const b of content) {
    if (!b || typeof b !== "object") continue;
    if (b.type === "server_tool_use") uses.set(b.id, b);
    else if (b.type === "web_search_tool_result") {
      const query = uses.get(b.tool_use_id)?.input?.query || "";
      if (Array.isArray(b.content)) {
        const results = b.content.filter((x) => x?.type === "web_search_result").map((x) => ({ url: x.url, title: x.title || "", page_age: x.page_age || null }));
        steps.push({ kind: "search", query, results, ok: true, toolResult: { call_id: b.tool_use_id, name: "web_search", server: true, ok: true, result: { query, results } } });
      } else {
        const code = b.content?.error_code || "unavailable";
        steps.push({ kind: "search", query, ok: false, error_code: code, toolResult: { call_id: b.tool_use_id, name: "web_search", server: true, ok: false, result: { query, error: code } } });
      }
    } else if (b.type === "web_fetch_tool_result") {
      const asked = uses.get(b.tool_use_id)?.input?.url || "";
      const c = b.content || {};
      if (c.type === "web_fetch_result") {
        const doc = c.content || {};
        const src = doc.source || {};
        const isText = src.type === "text" && typeof src.data === "string";
        const isPdf = src.type === "base64" && /pdf/i.test(src.media_type || "");
        const url = c.url || asked;
        const title = doc.title || c.title || "";
        steps.push({ kind: "fetch", url, title, ok: true, text: isText ? src.data : null, doc: isText ? "text" : isPdf ? "pdf" : "other",
          toolResult: { call_id: b.tool_use_id, name: "web_fetch", server: true, ok: true, result: { url, title, pdf: isPdf } } });
      } else {
        const code = c.error_code || "unavailable";
        steps.push({ kind: "fetch", url: asked, title: "", ok: false, error_code: code, toolResult: { call_id: b.tool_use_id, name: "web_fetch", server: true, ok: false, result: { url: asked, error: code } } });
      }
    } else if ((b.type === "text" || b.type === "thinking") && Array.isArray(b.citations)) {
      citations.push(...b.citations);
    }
  }
  return { steps, citations };
}
