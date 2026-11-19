// A scripted stand-in for POST /v1/messages that streams realistic SSE, with the server tools of this app
// (web search and web fetch), and checks every request against the protocol rules the live agent must
// follow (brief §7, rules 6 and 8; PLAN.md g; AC-08 and AC-10). Adapted from the Timetable Translator's
// tests/lib/fake-claude.mjs, extended with: server_tool_use blocks for both tools; web_search_tool_result
// with encrypted_content; web_fetch_tool_result with a text document or a base64 PDF; citations of both
// kinds (in text and in thinking blocks); pause_turn; a mixed turn; in-result errors with HTTP 200; the
// 400 a switched-off tool returns; usage with web_search_requests and web_fetch_requests.
// It asserts that every assistant block comes back unchanged, that the tools array never changes, that a
// mixed turn is answered with tool_result blocks only, that pause_turn is resent unchanged, that at most
// two nudges are sent, and that no 41st request arrives.
import { isDeepStrictEqual } from "node:util";

export const MODEL = "claude-sonnet-5-5";

export function sseFor({ id, model = MODEL, blocks, stop, usage = {}, cut = null }) {
  const ev = [];
  const push = (event, data) => ev.push(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  push("message_start", { type: "message_start", message: { id, type: "message", role: "assistant", model, content: [], stop_reason: null, usage: { input_tokens: usage.input_tokens ?? 1500, cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0, cache_read_input_tokens: usage.cache_read_input_tokens ?? 0, output_tokens: 1 } } });
  blocks.forEach((b, i) => {
    if (b.type === "text") {
      push("content_block_start", { type: "content_block_start", index: i, content_block: { type: "text", text: "" } });
      for (const piece of chunks(b.text, 17)) push("content_block_delta", { type: "content_block_delta", index: i, delta: { type: "text_delta", text: piece } });
      for (const c of b.citations || []) push("content_block_delta", { type: "content_block_delta", index: i, delta: { type: "citations_delta", citation: c } });
    } else if (b.type === "thinking") {
      push("content_block_start", { type: "content_block_start", index: i, content_block: { type: "thinking", thinking: "", signature: "" } });
      for (const piece of chunks(b.thinking, 23)) push("content_block_delta", { type: "content_block_delta", index: i, delta: { type: "thinking_delta", thinking: piece } });
      for (const c of b.citations || []) push("content_block_delta", { type: "content_block_delta", index: i, delta: { type: "citations_delta", citation: c } });
      push("content_block_delta", { type: "content_block_delta", index: i, delta: { type: "signature_delta", signature: b.signature } });
    } else if (b.type === "tool_use" || b.type === "server_tool_use") {
      push("content_block_start", { type: "content_block_start", index: i, content_block: { type: b.type, id: b.id, name: b.name, input: {} } });
      const json = cut === i ? JSON.stringify(b.input).slice(0, 25) : JSON.stringify(b.input);
      for (const piece of chunks(json, 29)) push("content_block_delta", { type: "content_block_delta", index: i, delta: { type: "input_json_delta", partial_json: piece } });
    } else {
      // web_search_tool_result and web_fetch_tool_result arrive whole in content_block_start.
      push("content_block_start", { type: "content_block_start", index: i, content_block: b });
    }
    push("content_block_stop", { type: "content_block_stop", index: i });
  });
  push("message_delta", { type: "message_delta", delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: usage.output_tokens ?? 600, server_tool_use: { web_search_requests: usage.web_search_requests ?? 0, web_fetch_requests: usage.web_fetch_requests ?? 0 } } });
  push("message_stop", { type: "message_stop" });
  return ev.join("");
}

function chunks(s, n) {
  const out = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out.length ? out : [""];
}

/** What the agent should send back for each earlier assistant turn: every block as the stream built it. */
function echoOf(blocks) {
  return blocks.map((b) => {
    if (b.type === "text") return b.citations?.length ? { type: "text", text: b.text, citations: b.citations } : { type: "text", text: b.text };
    if (b.type === "thinking") return b.citations?.length ? { type: "thinking", thinking: b.thinking, signature: b.signature, citations: b.citations } : { type: "thinking", thinking: b.thinking, signature: b.signature };
    if (b.type === "tool_use" || b.type === "server_tool_use") return { type: b.type, id: b.id, name: b.name, input: b.input };
    return b;
  });
}

// ---- block builders ------------------------------------------------------------------------------------
let seq = 0;
const nid = (p) => `${p}_${String(++seq).padStart(4, "0")}`;
export const text = (t, citations) => ({ type: "text", text: t, ...(citations ? { citations } : {}) });
export const tool = (name, input) => ({ type: "tool_use", id: nid("toolu"), name, input });
export function search(query, results) {
  const id = nid("srvtoolu");
  return [
    { type: "server_tool_use", id, name: "web_search", input: { query } },
    { type: "web_search_tool_result", tool_use_id: id, content: results.map((r) => ({ type: "web_search_result", url: r.url, title: r.title, encrypted_content: `enc:${Buffer.from(r.url).toString("base64")}:${"x".repeat(40)}`, page_age: r.page_age || "2 days ago" })) }
  ];
}
export function searchError(query, code) {
  const id = nid("srvtoolu");
  return [{ type: "server_tool_use", id, name: "web_search", input: { query } }, { type: "web_search_tool_result", tool_use_id: id, content: { type: "web_search_tool_result_error", error_code: code } }];
}
export function fetchText(url, title, data) {
  const id = nid("srvtoolu");
  return [
    { type: "server_tool_use", id, name: "web_fetch", input: { url } },
    { type: "web_fetch_tool_result", tool_use_id: id, content: { type: "web_fetch_result", url, content: { type: "document", source: { type: "text", media_type: "text/plain", data }, title, citations: { enabled: true } }, retrieved_at: "2026-11-19T10:00:00Z" } }
  ];
}
export function fetchPdf(url, title) {
  const id = nid("srvtoolu");
  return [
    { type: "server_tool_use", id, name: "web_fetch", input: { url } },
    { type: "web_fetch_tool_result", tool_use_id: id, content: { type: "web_fetch_result", url, content: { type: "document", source: { type: "base64", media_type: "application/pdf", data: "JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PC9UeXBlL0NhdGFsb2c+PgplbmRvYmoK" }, title, citations: { enabled: true } }, retrieved_at: "2026-11-19T10:00:00Z" } }
  ];
}
export function fetchError(url, code) {
  const id = nid("srvtoolu");
  return [{ type: "server_tool_use", id, name: "web_fetch", input: { url } }, { type: "web_fetch_tool_result", tool_use_id: id, content: { type: "web_fetch_tool_error", error_code: code } }];
}

/**
 * script: array of steps, each a response { blocks, stop, usage, expect?(req, ctx) } or an error
 * { error: { status, type, message } } returned once.
 */
export function createFakeClaude(script, { model = MODEL } = {}) {
  const violations = [];
  const requests = [];
  const sent = [];
  let firstTools = null;
  let i = 0;

  function check(cond, msg) { if (!cond) violations.push(`request ${requests.length}: ${msg}`); }

  function validate(req, headers) {
    check(headers["x-api-key"] && headers["x-api-key"].startsWith("sk-ant-"), "x-api-key missing");
    check(headers["anthropic-version"] === "2023-06-01", "anthropic-version wrong");
    check(headers["anthropic-dangerous-direct-browser-access"] === "true", "direct browser access header missing");
    check(req.stream === true, "stream must be true");
    check(req.tool_choice?.type === "auto", "tool_choice must be auto");
    check(Array.isArray(req.tools) && req.tools.length === 17, `fifteen client tools and two server tools (got ${req.tools?.length})`);
    check(req.tools?.some((t) => t.type === "web_search_20250305" && t.max_uses === 12) && req.tools?.some((t) => t.type === "web_fetch_20250910" && t.max_uses === 10 && t.citations?.enabled === true), "the two server tools as the brief defines them");
    check(!req.tools?.some((t) => "strict" in t), "strict is not sent");
    if (firstTools === null) firstTools = req.tools;
    else check(isDeepStrictEqual(req.tools, firstTools), "the tools array changed during the run");
    check(typeof req.system === "string" && req.system.startsWith("You are the research agent of \"Sovereignty Assessment\""), "system prompt missing");
    check(requests.length <= 40, "a 41st model call");
    const msgs = req.messages || [];
    let a = 0;
    msgs.forEach((m, k) => {
      if (m.role !== "assistant") return;
      const expected = sent[a];
      check(expected && isDeepStrictEqual(m.content, expected), `assistant turn ${a + 1} was not passed back unchanged`);
      a += 1;
      const uses = m.content.filter((b) => b.type === "tool_use");
      const next = msgs[k + 1];
      if (uses.length) {
        check(next && next.role === "user", "tool_use not followed by a user message");
        const content = Array.isArray(next?.content) ? next.content : [];
        const results = content.filter((b) => b.type === "tool_result");
        for (const u of uses) check(results.some((r) => r.tool_use_id === u.id), `tool_use ${u.id} has no tool_result`);
        const firstOther = content.findIndex((b) => b.type !== "tool_result");
        check(firstOther === -1 || content.slice(firstOther).every((b) => b.type !== "tool_result"), "tool_result blocks must come first");
        // A mixed turn (a server tool and a client tool in one response) is answered with tool results only.
        if (m.content.some((b) => b.type === "server_tool_use")) check(content.every((b) => b.type === "tool_result"), "a mixed turn must be answered with tool_result blocks only");
      }
    });
    // pause_turn: the conversation is sent again unchanged (the paused assistant turn last, no new user turn).
    const prev = requests[requests.length - 2];
    if (prev?.stop === "pause_turn") {
      const before = prev.req.messages;
      check(msgs.length === before.length + 1 && isDeepStrictEqual(msgs.slice(0, before.length), before) && msgs[msgs.length - 1].role === "assistant", "after pause_turn the conversation must be resent unchanged");
    }
    const nudges = msgs.slice(1).filter((m) => m.role === "user" && (typeof m.content === "string" || (Array.isArray(m.content) && m.content.some((b) => b.type === "text")))).length;
    check(nudges <= 2, `more than two nudges (${nudges})`);
  }

  return {
    violations, requests, sent,
    remaining: () => script.length - i,
    nudges: () => {
      const last = requests[requests.length - 1]?.req.messages || [];
      return last.slice(1).filter((m) => m.role === "user" && (typeof m.content === "string" || (Array.isArray(m.content) && m.content.some((b) => b.type === "text"))));
    },
    handle(raw, headers) {
      const req = JSON.parse(raw);
      const entry = { req, headers, stop: null };
      requests.push(entry);
      validate(req, headers);
      const step = typeof script === "function" ? script(requests.length, req) : script[i++];
      if (!step) {
        violations.push(`unexpected request ${requests.length} (script exhausted)`);
        return { status: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "error", error: { type: "api_error", message: "script exhausted" } }) };
      }
      try { step.expect?.(req, { check }); } catch (e) { violations.push(`request ${requests.length}: expectation threw ${e.message}`); }
      if (step.error) {
        return { status: step.error.status, headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "error", error: { type: step.error.type, message: step.error.message } }) };
      }
      entry.stop = step.stop;
      const body = sseFor({ id: `msg_${requests.length}`, model, blocks: step.blocks, stop: step.stop, usage: step.usage, cut: step.cut ?? null });
      if (!step.discard) sent.push(echoOf(step.cut === undefined || step.cut === null ? step.blocks : step.blocks.filter((_, k) => k !== step.cut)));
      return { status: 200, headers: { "content-type": "text/event-stream", "request-id": `req_${requests.length}` }, body };
    }
  };
}

/** The last tool_result for a tool_use id in a request, parsed. */
export function resultFor(req, toolUseId) {
  for (const m of [...(req.messages || [])].reverse()) {
    if (m.role !== "user" || !Array.isArray(m.content)) continue;
    const r = m.content.find((b) => b.type === "tool_result" && b.tool_use_id === toolUseId);
    if (r) { let parsed = null; try { parsed = JSON.parse(r.content); } catch { /* not JSON */ } return { ...r, parsed }; }
  }
  return null;
}
