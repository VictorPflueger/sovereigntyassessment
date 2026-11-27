// Unit tests without a browser (Node.js 22): the streaming client and the cost maths; the formats in
// both languages; the catalogue's name matching; the API's errors in both languages; the language
// module's choice of language; the page's security policy and storage keys, read from the files; the
// evidence check and the sequence rules; and the presenter: every pre-run played in both languages and
// turned into the five steps and the four key figures, with the figures checked against the engine.
// Usage: node tests/unit.mjs            (every group)
//        node tests/unit.mjs format     (only the named groups)
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, wanted } from "./lib/harness.mjs";
import { loadData, playCase, hasLevers } from "./lib/play.mjs";

const mod = (p) => import(pathToFileURL(path.join(APP_ROOT, p)).href);
const read = (f) => fs.readFileSync(path.join(APP_ROOT, f), "utf8");
/** A data script (window.* globals) run in a sandbox: its window. */
const dataScript = (f) => { const ctx = { window: {} }; vm.runInNewContext(read(f), ctx, { filename: f }); return ctx.window; };

// The language module reads and writes local storage and <html lang>: a stand-in for both.
const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
globalThis.document = { documentElement: { lang: "" }, querySelectorAll: () => [], title: "" };

const results = [];
let count = 0;
const check = new Proxy(assert, { get: (target, prop) => (typeof target[prop] === "function" ? (...args) => { count += 1; return target[prop](...args); } : target[prop]) });
async function group(name, what, fn) {
  if (!wanted(name)) return;
  count = 0;
  try {
    await fn();
    results.push({ name, ok: true, what: `${what} (${count} ${count === 1 ? "check" : "checks"})` });
  } catch (e) {
    results.push({ name, ok: false, what, error: String(e?.message || e).split("\n").slice(0, 6).join(" | ") });
  }
}

// ---- the shared shell: streaming client and cost maths (the Timetable Translator's tests) -------------
await group("client", "streaming client: SSE parsing in every chunking, mid-stream errors, 429, spend limit, retries, cut tool input, abort, truncated streams", async () => {
  const { streamMessage, ApiError, withRetry } = await mod("js/anthropic.js");
  const sse = (events, { crlf = false } = {}) => {
    const nl = crlf ? "\r\n" : "\n";
    return events.map(([ev, data]) => `event: ${ev}${nl}data: ${JSON.stringify(data)}${nl}${nl}`).join("");
  };
  const chunked = (text, sizes) => {
    const enc = new TextEncoder().encode(text);
    const parts = [];
    let i = 0, k = 0;
    while (i < enc.length) { const n = sizes[k++ % sizes.length]; parts.push(enc.slice(i, i + n)); i += n; }
    return new ReadableStream({ start(c) { for (const p of parts) c.enqueue(p); c.close(); } });
  };
  const events = [
    ["message_start", { type: "message_start", message: { id: "msg_1", model: "claude-sonnet-5-5", role: "assistant", content: [], usage: { input_tokens: 1200, cache_creation_input_tokens: 3000, cache_read_input_tokens: 0, output_tokens: 3 } } }],
    ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "Check the operator " } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "first." } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "SIG==abc" } }],
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["ping", { type: "ping" }],
    ["content_block_start", { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Laut Impressum betreibt " } }],
    ["content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "das ITZBund den Dienst — Köln ✓" } }],
    ["content_block_stop", { type: "content_block_stop", index: 1 }],
    ["content_block_start", { type: "content_block_start", index: 2, content_block: { type: "tool_use", id: "toolu_1", name: "cat_lookup", input: {} } }],
    ["content_block_delta", { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: "{\"na" } }],
    ["content_block_delta", { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: "me\": \"BundID\"}" } }],
    ["content_block_stop", { type: "content_block_stop", index: 2 }],
    ["content_block_start", { type: "content_block_start", index: 3, content_block: { type: "tool_use", id: "toolu_2", name: "ui_show_score", input: {} } }],
    ["content_block_stop", { type: "content_block_stop", index: 3 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: "tool_use", stop_sequence: null }, usage: { output_tokens: 240, server_tool_use: { web_search_requests: 0 } } }],
    ["message_stop", { type: "message_stop" }]
  ];
  for (const [label, crlf, sizes] of [["lf small chunks", false, [7, 13, 1, 50]], ["crlf odd chunks", true, [3, 1, 2, 97, 5]], ["one chunk", false, [100000]]]) {
    globalThis.fetch = async () => new Response(chunked(sse(events, { crlf }), sizes), { status: 200, headers: { "content-type": "text/event-stream", "request-id": "req_123" } });
    const texts = [];
    const r = await streamMessage({ key: "k", body: { model: "claude-sonnet-5-5", messages: [] }, hooks: { onText: (i, t) => texts.push(t) } });
    const m = r.message;
    check.equal(m.stop_reason, "tool_use", label);
    check.equal(m.content.length, 4, label);
    check.deepEqual(m.content[0], { type: "thinking", thinking: "Check the operator first.", signature: "SIG==abc" }, label);
    check.equal(m.content[1].text, "Laut Impressum betreibt das ITZBund den Dienst — Köln ✓", label);
    check.deepEqual(m.content[2].input, { name: "BundID" }, label);
    check.deepEqual(m.content[3].input, {}, label);
    check.equal(m.usage.output_tokens, 240, label);
    check.equal(m.usage.cache_creation_input_tokens, 3000, label);
    check.equal(r.requestId, "req_123");
    check.ok(texts.length >= 2);
  }
  globalThis.fetch = async () => new Response(chunked(sse([events[0], ["error", { type: "error", error: { type: "overloaded_error", message: "Overloaded" } }]]), [11]), { status: 200 });
  await check.rejects(() => streamMessage({ key: "k", body: {} }), (e) => e instanceof ApiError && e.type === "overloaded_error" && e.retryable && e.midStream);
  globalThis.fetch = async () => new Response(JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "slow down" }, request_id: "req_9" }), { status: 429, headers: { "retry-after": "1" } });
  await check.rejects(() => streamMessage({ key: "k", body: {} }), (e) => e.status === 429 && e.retryAfter === "1" && e.retryable);
  check.equal(new ApiError({ status: 429, type: "rate_limit_error", message: "x", details: { error_code: "enforced_spend_limit_reached" } }).retryable, false);
  let n = 0;
  const v = await withRetry(async () => { n++; if (n < 3) throw new ApiError({ status: 529, type: "overloaded_error", message: "o" }); return 42; }, { retries: 2 });
  check.equal(v, 42);
  check.equal(n, 3);
  const cut = [events[0], ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "tool_use", id: "toolu_x", name: "out_draft_memo", input: {} } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "input_json_delta", partial_json: "{\"subject\": \"Souveränität von Bund" } }],
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: "max_tokens" }, usage: { output_tokens: 16000 } }]];
  globalThis.fetch = async () => new Response(chunked(sse(cut), [64]), { status: 200 });
  const rc = await streamMessage({ key: "k", body: {} });
  check.equal(rc.message.stop_reason, "max_tokens");
  check.ok(rc.incomplete.has(0));
  const ac = new AbortController();
  globalThis.fetch = async (url, init) => new Promise((res, rej) => init.signal.addEventListener("abort", () => rej(Object.assign(new Error("aborted"), { name: "AbortError" }))));
  setTimeout(() => ac.abort(), 20);
  await check.rejects(() => streamMessage({ key: "k", body: {}, signal: ac.signal }), (e) => e.name === "AbortError");
  globalThis.fetch = async () => new Response(JSON.stringify({ data: [] }), { status: 200, headers: { "content-type": "application/json" } });
  await check.rejects(() => streamMessage({ key: "k", body: {} }), (e) => e instanceof ApiError && e.type === "network_error" && e.midStream);
  globalThis.fetch = async () => new Response(chunked(sse(events.slice(0, 6)), [40]), { status: 200 });
  await check.rejects(() => streamMessage({ key: "k", body: {} }), (e) => e instanceof ApiError && e.type === "network_error");
  delete globalThis.fetch;
});

await group("cost", "cost maths: tokens at the listed prices, cache writes and reads, the web search fee, Haiku's long-prompt tier, euros at 0.894", async () => {
  const { usageCostUsd, createCostTracker } = await mod("js/cost.js");
  const usd = usageCostUsd("claude-sonnet-5-5", { input_tokens: 1200, cache_creation_input_tokens: 3000, cache_read_input_tokens: 10000, output_tokens: 240, server_tool_use: { web_search_requests: 2 } });
  const expected = 1200 * 2 / 1e6 + 3000 * 2.5 / 1e6 + 10000 * 0.1 / 1e6 + 240 * 10 / 1e6 + 2 * 0.01;
  check.ok(Math.abs(usd - expected) < 1e-12, `${usd} vs ${expected}`);
  const haikuLong = usageCostUsd("claude-haiku-5-5", { input_tokens: 90000, cache_read_input_tokens: 20000, output_tokens: 1000 });
  check.ok(Math.abs(haikuLong - (90000 * 0.5 / 1e6 + 20000 * 0.05 / 1e6 + 1000 * 2.5 / 1e6)) < 1e-12);
  const t = createCostTracker("claude-opus-5-5");
  t.add({ input_tokens: 1e6 });
  const snap = t.add({ output_tokens: 1e6 });
  check.ok(Math.abs(snap.usd - 24) < 1e-9 && Math.abs(snap.eur - 24 * 0.894) < 1e-9 && snap.requests === 2);
});

// ---- formats in both languages -------------------------------------------------------------------------------
await group("format", "Intl formats: whole scores, whole percentages, signed changes, whole numbers, dates with the month written out, no data", async () => {
  const f = await mod("js/format.js");
  const plain = (s) => String(s).replace(/[  ]/g, " ");
  const both = (fn, x) => [plain(fn(x, "en")), plain(fn(x, "de"))];
  check.deepEqual(both(f.fmtScore, 865 / 12), ["72", "72"]);
  check.deepEqual(both(f.fmtShare, 23 / 25), ["92%", "92 %"]);
  check.deepEqual(both(f.fmtShare, 2 / 3), ["67%", "67 %"]);
  check.deepEqual(both(f.fmtDelta, 75 / 8), ["+9", "+9"]);
  check.deepEqual(both(f.fmtDelta, 0), ["0", "0"]);
  check.deepEqual(both(f.fmtDelta, -3.2), ["-3", "-3"]);
  check.deepEqual(both(f.fmtInt, 1122), ["1,122", "1.122"]);
  check.deepEqual(both(f.fmtDate, "2026-11-19"), ["19 November 2026", "19. November 2026"]);
  check.deepEqual(both(f.fmtScore, null), ["no data", "keine Daten"]);
  check.deepEqual(both(f.fmtShare, undefined), ["no data", "keine Daten"]);
  check.deepEqual(both(f.fmtDate, "not a date"), ["no data", "keine Daten"]);
});

// ---- the catalogue's name matching -------------------------------------------------------------------
await group("catalogue", "catalogue matching: names and aliases in both languages, near misses with difflib's ratio, the groups and the URLs", async () => {
  const c = await mod("js/catalogue.js");
  const data = dataScript("data/catalogue.js").SA_CATALOGUE;
  // Ratios computed with Python 3's difflib.SequenceMatcher(None, a, b).ratio() on 19 November 2026.
  const PY = [["bundid", "bundidkonto", 0.7058823529411765], ["onlineausweis", "onlineausweiseid", 0.896551724137931], ["fitconnect", "fitkonnect", 0.9],
    ["epaybl", "epayble", 0.9230769230769231], ["deutschlandapp", "deutschlandap", 0.9629629629629629], ["kipitz", "kipits", 0.8333333333333334], ["abc", "xyz", 0]];
  for (const [a, b, r] of PY) check.ok(Math.abs(c.sequenceRatio(a, b) - r) < 1e-15, `${a}/${b}`);
  const first = (q) => c.lookup(q, { data })[0];
  check.equal(first("Bund-ID")?.entry.id, "bundid");
  check.equal(first("Bund-ID")?.how, "exact");
  check.equal(first("Onlineausweis")?.entry.id, "online-ausweis");
  check.equal(first("FIT Konnect")?.entry.id, "fit-connect");
  check.equal(first("FIT Konnect")?.how, "similar");
  check.equal(first("Deutschland App")?.entry.id, "deutschland-app");
  check.deepEqual(c.lookup("Bund", { data }).map((x) => x.entry.id).slice(0, 2), ["bundesportal", "bundid"]);
  check.deepEqual(c.lookup("xyz", { data }), []);
  check.equal(c.nameKey("Deutschland-App"), "deutschlandapp");
  check.equal(c.nameKey("Straße Ä"), "strassea");
  const groups = c.byCategory(data);
  check.equal(groups.base_service.length, 9);
  check.equal(groups.platform_or_access.length, 8, "eight platforms or access channels, the Serviceportal.NRW among them");
  for (const e of data.entries) {
    check.ok(c.entryUrls(e).length >= 1 && c.entryUrls(e).every((u) => u.startsWith("https://")), e.id);
    check.ok(c.entryTexts(e).length >= 4, e.id);
  }
});

// ---- the API's errors in both languages ------------------------------------------------------------------
await group("api", "the shared client's errors as i18n keys: network, timeout, 401, 403, 429 and the spend limit, 400 for a workspace, 529 and 5xx", async () => {
  const { apiMessage } = await mod("js/api_messages.js");
  const { networkMessage } = await mod("js/anthropic.js");
  const { t } = await mod("js/i18n/index.js");
  const cases = [
    [{ status: 0, error: { type: "network", message: networkMessage(new Error("x")) } }, "api.network"],
    [{ status: 0, error: { type: "network", message: networkMessage({ name: "AbortError" }) } }, "api.timeout"],
    [{ status: 0, detail: networkMessage(new Error("x")) }, "api.network"],
    [{ status: 401, error: { type: "authentication_error", message: "invalid x-api-key" } }, "api.unauthorized"],
    [{ status: 403, error: { type: "permission_error", message: "nope" } }, "api.forbidden"],
    [{ status: 429, error: { type: "rate_limit_error", message: "slow" } }, "api.rateLimited"],
    [{ status: 429, error: { type: "rate_limit_error", message: "You have reached your spend limit" } }, "api.spendLimit"],
    [{ status: 400, error: { type: "invalid_request_error", message: "This key belongs to more than one workspace." } }, "api.workspace"],
    [{ status: 529, error: { type: "overloaded_error", message: "Overloaded" } }, "api.overloaded"],
    [{ status: 502, error: { type: "api_error", message: "Bad gateway" } }, "api.server"],
    [{ status: 404, error: { type: "not_found_error", message: "no such model" } }, "api.other"]
  ];
  for (const [input, key] of cases) check.equal(apiMessage(input).key, key, JSON.stringify(input));
  // Every key renders in both languages with its placeholders filled.
  for (const [input] of cases) {
    const m = apiMessage(input);
    for (const l of ["en", "de"]) check.ok(!/\{[a-z]+\}/.test(t(m.key, m.vars, l)), `${m.key} ${l}`);
  }
});

// ---- the language module -------------------------------------------------------------------------------------
await group("lang", "choice of language: English on a first visit, ?lang= wins and is stored, then the stored choice; t() fills placeholders; plural forms; an unknown key shows itself", async () => {
  const i = await mod("js/i18n/index.js");
  store.clear();
  check.equal(i.initLang(""), "en", "a first visit");
  check.equal(document.documentElement.lang, "en");
  check.equal(store.has("sa.lang"), false, "nothing stored on a first visit");
  check.equal(i.initLang("?lang=de"), "de", "?lang=de");
  check.equal(store.get("sa.lang"), "de", "?lang=de is stored");
  check.equal(document.documentElement.lang, "de");
  check.equal(i.initLang(""), "de", "the stored choice");
  check.equal(i.initLang("?lang=en"), "en", "?lang=en wins over the stored choice");
  check.equal(store.get("sa.lang"), "en");
  check.equal(i.initLang("?lang=fr"), "en", "an unknown language is ignored");
  let heard = null;
  const off = i.onLang((l) => { heard = l; });
  i.setLang("de");
  check.equal(heard, "de");
  check.equal(i.getLang(), "de");
  check.equal(store.get("sa.lang"), "de");
  off();
  check.equal(i.t("fact.level", { n: 4 }), "Stufe 4");
  check.equal(i.t("fact.level", { n: 4 }, "en"), "level 4");
  check.equal(i.tn("p.log.summary", 1, {}, "en"), "Decision log: 1 entry");
  check.equal(i.tn("p.log.summary", 3, {}, "de"), "Entscheidungsprotokoll: 3 Einträge");
  check.equal(i.t("no.such.key"), "no.such.key");
  check.ok(i.missingKeys().includes("no.such.key"));
  check.equal(i.locale("de"), "de-DE");
  check.equal(i.locale("en"), "en-GB");
  i.setLang("en");
});

// ---- the page's security policy and storage keys, from the files -------------------------------------------
await group("policy", "index.html carries config.js's policy, with no inline script or style and nothing from another site", async () => {
  const { CSP } = await mod("js/config.js");
  const html = read("index.html");
  const metas = [...html.matchAll(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/g)].map((m) => m[1]);
  check.deepEqual(metas, [CSP], "exactly one policy, equal to js/config.js's");
  check.equal(/<script(?![^>]*\bsrc=)[^>]*>/.test(html), false, "no inline script");
  check.equal(/<style\b/.test(html) || /\sstyle="/.test(html), false, "no inline style");
  check.equal(/\son[a-z]+="/.test(html), false, "no inline event handler");
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)) check.ok(!/^[a-z]+:|^\/\//i.test(m[1]), `${m[1]} is on this site`);
});

await group("storage", "every storage key the code writes is the app's own (sa.) or Vici's shared theme key", async () => {
  const { STORAGE, THEME_KEY, APP } = await mod("js/config.js");
  check.equal(APP.id, "sa");
  for (const [name, key] of Object.entries(STORAGE)) check.ok(key.startsWith("sa."), `${name}: ${key}`);
  check.equal(THEME_KEY, "vc-theme");
  // No script names a storage key as a literal: they all go through js/config.js.
  const files = fs.readdirSync(path.join(APP_ROOT, "js"), { recursive: true }).filter((f) => f.endsWith(".js")).map((f) => `js/${f}`);
  for (const f of files) {
    for (const m of read(f).matchAll(/(?:local|session)Storage\.(?:getItem|setItem|removeItem)\(\s*(["'`])([^"'`]+)\1/g)) {
      check.ok(m[2] === THEME_KEY || m[2].startsWith("sa."), `${f}: ${m[2]}`);
    }
  }
  // Vici keeps the theme under its own key.
  check.ok(read("vici/dist/vici.js").includes("'vc-theme'"));
});

// ---- M2: evidence verification and the sequence rules -------------------------------------------------------
await group("evidence", "evidence (AC-09): provenance, quotes in fetched text or citations, the document registry in conversation order, gating and corrections", async () => {
  const { createEvidenceRegistry, checkEvidence, gateBlock, normaliseUrl, clipQuote, MAX_QUOTE } = await mod("js/evidence.js");
  const { assessBlock } = await mod("js/engine.js");
  const r = createEvidenceRegistry();
  // Provenance: only URLs a search, a fetch, the catalogue, the reference facts or a recording returned.
  r.allowUrl("https://example.gov/search-hit", { via: "search", title: "Search hit" });
  check.equal(r.isAllowed("HTTPS://EXAMPLE.gov/search-hit"), true, "scheme and host compare case-insensitively");
  check.equal(r.isAllowed("https://example.gov/Search-hit"), false, "the path compares exactly");
  check.equal(normaliseUrl("https://example.gov/a#frag"), normaliseUrl("https://example.gov/a"), "the fragment does not count");
  const unknownUrl = checkEvidence(r, [{ url: "https://never-returned.example/", title: "x", quote: "anything", lang: "en", supports: ["tech"] }]);
  check.deepEqual(unknownUrl.refused, ["https://never-returned.example/"], "a URL the run never returned is refused");
  // Fetched documents in conversation order; a text document's quote counts.
  const i0 = r.addDocument({ url: "https://example.gov/page", title: "The page", text: "The account is operated by the ITZBund in its data centres." });
  const i1 = r.addDocument({ url: "https://example.gov/paper.pdf", title: "A paper" });
  check.deepEqual([i0, i1], [0, 1], "documents are numbered in the order the conversation holds them");
  const inText = checkEvidence(r, [{ url: "https://example.gov/page", title: "The page", quote: "operated by the ITZBund", lang: "en", supports: ["operator"] }]).checks[0];
  check.equal(inText.verified, true, "a quote in the fetched text counts");
  check.equal(inText.via, "fetched_text");
  // A citation of a fetched PDF is mapped to its URL through document_index; a wrong title is not mapped.
  check.equal(r.addCitation({ type: "page_location", document_index: 1, document_title: "A paper", cited_text: "Hosting is in Germany only." }).url, normaliseUrl("https://example.gov/paper.pdf"), "document_index maps to the document's URL");
  check.equal(r.addCitation({ type: "page_location", document_index: 1, document_title: "Another paper", cited_text: "x" }).reason, "title_mismatch", "a title that does not match is not mapped");
  check.equal(r.addCitation({ type: "char_location", document_index: 7, cited_text: "x" }).reason, "no_document_at_index", "an index without a document is not mapped");
  const inCitation = checkEvidence(r, [{ url: "https://example.gov/paper.pdf", title: "A paper", quote: "Hosting is in Germany only.", lang: "en", supports: ["hosting"] }]).checks[0];
  check.equal(inCitation.verified, true, "a quote in a citation of its URL counts");
  check.equal(inCitation.via, "citation");
  // A search citation counts for its URL; a quote taken from the run's citation when the item has none.
  r.addCitation({ type: "web_search_result_location", url: "https://example.gov/search-hit", cited_text: "The service is developed by Example GmbH in Bremen." });
  const fromCitation = checkEvidence(r, [{ url: "https://example.gov/search-hit", title: "Search hit", lang: "en", supports: ["tech"] }]).checks[0];
  check.equal(fromCitation.verified, true);
  check.equal(fromCitation.quote_from, "citation", "an item without a quote takes the run's citation");
  // A quote found nowhere does not count; nor does one over the length limit.
  const nowhere = checkEvidence(r, [{ url: "https://example.gov/page", title: "The page", quote: "run by a company in the United States", lang: "en", supports: ["operator"] }]).checks[0];
  check.equal(nowhere.verified, false, "a quote in neither the text nor a citation does not count");
  // The source is named by the title the run read, not one the model writes (the review's finding R-14);
  // a page fetched after a search names itself by its own title.
  const titled = checkEvidence(r, [{ url: "https://example.gov/page", title: "Official ministry statement", quote: "operated by the ITZBund", lang: "en", supports: ["operator"] }]).checks[0];
  check.equal(titled.title, "The page", "the fetched page's title, not the model's");
  r.allowUrl("https://example.gov/later", { via: "search", title: "example.gov" });
  r.addDocument({ url: "https://example.gov/later", title: "The later page", text: "Run by the ITZBund." });
  check.equal(r.titleOf("https://example.gov/later"), "The later page", "a fetch's title over a search result's");
  check.equal([...clipQuote("x".repeat(400))].length <= MAX_QUOTE, true, "clipped to the limit");
  // A pre-verified quote counts only while its URL is allowed in the run.
  r.addVerifiedQuote("https://unlisted.example/", "A fact.", "ref_facts");
  check.equal(r.verifyQuote("https://unlisted.example/", "A fact.").verified, false, "a pre-verified quote never makes its URL citable");
  r.allowUrl("https://unlisted.example/", { via: "ref_facts" });
  check.equal(r.verifyQuote("https://unlisted.example/", "A fact.").via, "ref_facts");
  // Gating: an unverified field counts as unknown for scoring; a verified one counts; corrections win.
  const block = { id: "B-01", layer: "platform", criticality: "critical", tech: { name: "Example Inc.", country: "US", parent: null }, operator: { name: "ITZBund", country: "DE", parent: null }, hosting: "EU", licence: "proprietary", exit: "hard" };
  const checks = [inText, nowhere];
  const gated = gateBlock(block, checks);
  check.deepEqual(gated.unknown_fields, ["tech", "hosting", "licence", "exit"], "the fields without a verified quote are listed");
  check.equal(gated.effective.class_override.tech, "UNKNOWN", "an unverified party is unknown for scoring");
  check.equal(gated.effective.hosting, "UNKNOWN");
  const scored = assessBlock(gated.effective);
  check.equal(scored.partly_unknown, true, "the block is marked partly unknown");
  check.equal(scored.level, 2, "partly unknown is capped at 2");
  const corrected = gateBlock(block, checks, { tech: { name: "Example GmbH", country: "DE", parent: null } });
  check.equal(corrected.unknown_fields.includes("tech"), false, "a reviewer's correction overrides the gating");
  check.equal(assessBlock(corrected.effective).tech_class, "DE");
});

await group("guards", "sequence rules (brief §7): review after every layer, levers after the review, memo after the choice, assessed reports, not_a_service, frozen findings", async () => {
  const { guardTool, openLayers } = await mod("js/guards.js");
  const { LAYERS } = await mod("js/engine.js");
  const all = (n) => Object.fromEntries(LAYERS.map((l) => [l, n]));
  const base = { reported: false, blocks: 3, layerBlocks: all(0), layerStatus: {}, scoredFresh: true, review: "none", levers: "none", decision: null, memo: false };
  check.equal(openLayers(base).length, 6, "six open layers without blocks or a status");
  check.match(guardTool("ui_request_review", base)?.error || "", /neither a block nor a status/, "no review while a layer is open");
  const ready = { ...base, layerBlocks: { ...all(1), platform: 0 }, layerStatus: { platform: "no_evidence" } };
  check.equal(guardTool("ui_request_review", ready), null, "the review may come once every layer has blocks or a status");
  check.match(guardTool("ui_request_review", { ...ready, scoredFresh: false })?.error || "", /eng_score/, "the review needs a fresh eng_score");
  check.match(guardTool("ui_request_review", { ...ready, blocks: 0 })?.error || "", /no building blocks/, "no review without blocks");
  check.match(guardTool("ui_propose_levers", ready)?.error || "", /after the person's review/, "no levers before the review");
  const reviewed = { ...ready, review: "resolved" };
  check.equal(guardTool("ui_propose_levers", reviewed), null);
  check.match(guardTool("rec_block", reviewed)?.error || "", /frozen/, "findings are frozen after the review");
  check.match(guardTool("ui_draft_memo", reviewed, { lever_id: "L1" })?.error || "", /follows the person's lever decision/, "no memo before the choice");
  const decided = { ...reviewed, levers: "decided", decision: "L2" };
  check.match(guardTool("ui_draft_memo", decided, { lever_id: "L1" })?.error || "", /the memo is for "L2"/, "the memo names the chosen lever");
  check.equal(guardTool("ui_draft_memo", decided, { lever_id: "L2" }), null);
  check.match(guardTool("ui_final_report", decided, { outcome: "assessed" })?.error || "", /memo/, "no assessed report before the memo");
  check.equal(guardTool("ui_final_report", { ...decided, memo: true }, { outcome: "assessed" }), null);
  check.match(guardTool("ui_final_report", ready, { outcome: "assessed" })?.error || "", /review first/, "no assessed report before the review");
  check.match(guardTool("ui_final_report", ready, { outcome: "not_a_service" })?.error || "", /not_a_service/, "not_a_service only without blocks");
  check.equal(guardTool("ui_final_report", { ...base, blocks: 0 }, { outcome: "not_a_service" }), null, "not_a_service ends a run without blocks");
  check.equal(guardTool("ui_final_report", ready, { outcome: "stopped" }), null, "stopped may end a run before a report");
  check.match(guardTool("rec_block", { ...decided, memo: true, reported: true })?.error || "", /run is over/, "nothing runs after the report");
  check.match(guardTool("ui_choose_service", ready)?.error || "", /new run/, "a service is chosen only before any block");
});

// ---- the presenter: every pre-run as five steps and four key figures ------------------------------------------
await group("presenter", "every pre-run played in both languages: five steps, names instead of ids, and the tiles equal to the engine's figures recomputed from the gated blocks; a partial score says on how many layers it rests and the other tiles wait", async () => {
  const win = loadData();
  const { digest, STEP_IDS } = await mod("js/run.js");
  const { story, pct } = await mod("js/story.js");
  const { score, LAYERS } = await mod("js/engine.js");
  const { gateBlock } = await mod("js/evidence.js");
  const { fmtScore, fmtInt } = await mod("js/format.js");
  const { t } = await mod("js/i18n/index.js");
  const entries = win.SA_CATALOGUE.entries;
  check.equal(Object.keys(win.SA_RUNS).length, 18, "eighteen pre-runs");
  check.deepEqual(STEP_IDS, ["understand", "research", "score", "review", "recommend"]);
  const play = (def, lang, choice) => playCase(def, lang, { choice });
  // The texts a person reads on a step, without the fields that only key the page's elements.
  const SKIP = new Set(["id", "kind", "status", "layer", "decision", "act", "secondaryAct", "url", "lang", "where"]);
  const texts = (v, out = []) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) texts(x, out);
    return out;
  };
  const ID = /(?<![\p{L}\p{N}-])(?:B-\d{2}|L[1-3])(?![\p{L}\p{N}])/u;

  for (const def of Object.values(win.SA_RUNS)) {
    const entry = entries.find((e) => e.id === def.entry_id) || null;
    check.ok(entry, `${def.id}: its catalogue entry`);
    for (const lang of ["en", "de"]) {
      const kept = await play(def, lang, "keep");
      check.deepEqual(kept.problems, [], `${def.id} ${lang}: plays without a problem`);
      const run = digest(kept.events);
      const v = story({ run, lang, mode: "simulation", entry });
      check.deepEqual(v.steps.map((st) => st.id), STEP_IDS, `${def.id} ${lang}: five steps`);
      check.deepEqual(v.steps.map((st) => st.person), [false, false, false, true, true], `${def.id} ${lang}: Your review and Recommend are the person's`);
      const shown = v.steps.flatMap((st) => texts([st.title, st.lead, st.agent, st.stage]));
      const leak = shown.find((x) => ID.test(x));
      check.equal(leak, undefined, `${def.id} ${lang}: no block or lever id on screen`);
      check.ok(!shown.some((x) => /\{\{|\}\}/.test(x)), `${def.id} ${lang}: every figure filled in`);
      if (run.notService) {
        check.equal(v.kpis.score.value, t("p.kpi.none", null, lang), `${def.id} ${lang}: not a service, not scored`);
        continue;
      }
      // The engine on the blocks as the toolbox gates them, recomputed here: the tiles must show it.
      const gated = kept.blocks.map((b) => ({ id: b.id, ...gateBlock(b, b.evidence, {}).effective }));
      const r = score(gated);
      const layers = LAYERS.filter((l) => r.layers[l].score !== null).length;
      check.ok(v.complete, `${def.id} ${lang}: complete at the end`);
      check.equal(v.kpis.score.value, fmtScore(r.overall, lang), `${def.id} ${lang}: overall score`);
      check.equal(v.kpis.score.of.trim(), t("p.kpi.layers", { n: fmtInt(layers, lang) }, lang).trim(), `${def.id} ${lang}: the score says on how many layers it rests`);
      check.match(v.kpis.score.of, lang === "en" ? / of 6 layers$/ : / von 6 Ebenen$/, `${def.id} ${lang}: "of 6" in the value`);
      if (r.weakest) {
        check.equal(v.kpis.weakest.value, t("p.kpi.level", { n: fmtInt(r.weakest.level, lang) }, lang), `${def.id} ${lang}: weakest critical link`);
        check.ok(v.kpis.weakest.note && !ID.test(v.kpis.weakest.note), `${def.id} ${lang}: the weakest link by its name (${v.kpis.weakest.note})`);
      }
      check.equal(v.kpis.exclusive.value, r.exclusive_non_eu === null ? t("p.kpi.none", null, lang) : pct(r.exclusive_non_eu, lang), `${def.id} ${lang}: exclusive non-EU control`);
      // The first lever: the memo is drafted and approved, and a figure the lever moves keeps its old value.
      if (hasLevers(def)) {
        const lever = await play(def, lang, "L1");
        check.deepEqual(lever.problems, [], `${def.id} ${lang}: the first lever plays without a problem`);
        const w = story({ run: digest(lever.events), lang, mode: "simulation", entry });
        check.equal(w.steps[4].stage.kind, "memo", `${def.id} ${lang}: the memo after the lever`);
        check.equal(w.steps[4].stage.status, "approved", `${def.id} ${lang}: the memo approved, nothing sent`);
        if (w.kpis.score.was) check.equal(w.kpis.score.was, fmtScore(r.overall, lang), `${def.id} ${lang}: the score keeps its old value`);
      }
    }
  }

  // A partial score, as a live run can show it before every layer is in: three layers scored. The score
  // says so in its value, and the figures that need every layer wait.
  const def = win.SA_RUNS.bundid;
  const full = await play(def, "en", "keep");
  const run = digest(full.events);
  const firstThree = new Set(LAYERS.slice(0, 3));
  const gated = full.blocks.filter((b) => firstThree.has(b.layer)).map((b) => ({ id: b.id, ...gateBlock(b, b.evidence, {}).effective }));
  const part = score(gated);
  const scoredNow = LAYERS.filter((l) => part.layers[l].score !== null).length;
  check.ok(scoredNow > 0 && scoredNow < 6, `the partial case scores ${scoredNow} of 6 layers`);
  const partial = { ...run, mode: "live", scoredOnce: false, end: null, review: null, reviewed: null, levers: null, decision: null, memo: null,
    score: { ...run.score, partial: true, result: part, facts: { ...run.score.facts, "score.overall": part.overall } } };
  for (const lang of ["en", "de"]) {
    const v = story({ run: partial, lang, mode: "live", entry: entries.find((e) => e.id === "bundid") });
    check.equal(v.complete, false, `${lang}: a partial run is not complete`);
    check.equal(v.kpis.score.of.trim(), t("p.kpi.layers", { n: fmtInt(scoredNow, lang) }, lang).trim(), `${lang}: the partial score says "${scoredNow} of 6" in its value`);
    check.equal(v.kpis.weakest.value, "…", `${lang}: the weakest link waits`);
    check.equal(v.kpis.exclusive.value, "…", `${lang}: exclusive non-EU control waits`);
    check.ok(v.kpis.weakest.note && v.kpis.exclusive.note, `${lang}: their notes say what they wait for`);
  }
});

// ---- report -----------------------------------------------------------------------------------------------
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(9)} ${r.what}${r.ok ? "" : `\n      ${r.error}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} unit groups passed.`);
if (!failed && ONLY.length === 0) console.log("UNIT OK");
process.exit(failed ? 1 : 0);
