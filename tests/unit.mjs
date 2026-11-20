// Unit tests without a browser (Node.js 22): the streaming client and the cost maths of the shared
// shell (taken from the Timetable Translator's tests/unit.mjs); the schemas of the data contracts and
// the validator; the formats in both languages; the catalogue's name matching; the API's errors in
// both languages; the language module's choice of language; the golden copy that Diagnostics runs;
// the page's security policy and storage keys, read from the files.
// Usage: node tests/unit.mjs            (every group)
//        node tests/unit.mjs format     (only the named groups)
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, wanted } from "./lib/harness.mjs";
import { fixture, allFixtures, blockFromRow, fixtureAssessment } from "./lib/fixtures.mjs";

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

// ---- the data contracts ------------------------------------------------------------------------------
await group("schemas", "the eleven schemas: the brief's example block, the golden blocks, the catalogue and the reference facts are valid; broken copies are not", async () => {
  const { validate } = await mod("js/schema.js");
  const S = dataScript("data/schemas.js").SA_SCHEMAS;
  const names = ["CatalogueEntry", "ServiceProfile", "BuildingBlock", "Evidence", "LayerStatus", "Assessment", "EngineResult", "Lever", "Decision", "RunEvent", "AuditEvent"];
  check.deepEqual(Object.keys(S).sort(), [...names].sort());
  for (const n of names) check.equal(S[n].$id, `https://victorpflueger.github.io/sovereigntyassessment/schemas/${n}.json`, n);
  const ok = (v, n) => validate(v, S[n], S).valid;
  // The brief's example (section 10), as the agent records a block.
  const example = {
    id: "B-03", layer: "access", name: "App distribution on iOS", role: "Delivers the app to iPhone users",
    note: "No other distribution path for iOS users in Germany is documented for this app", criticality: "critical",
    tech: { name: "Apple Inc.", country: "US", parent: null }, operator: { name: "Apple Inc.", country: "US", parent: null },
    hosting: "NON_EU", licence: "proprietary", exit: "hard",
    evidence: [{ url: "https://…", title: "…", quote: "…", lang: "en", read_on: "2026-11-20", supports: ["tech", "operator", "hosting", "licence"] }],
    confidence: "high"
  };
  check.ok(ok(example, "BuildingBlock"), "the brief's example block");
  // A pre-run's block carries its texts in both languages.
  check.ok(ok({ ...example, name: { en: "App distribution on iOS", de: "App-Vertrieb unter iOS" }, role: { en: "Delivers the app", de: "Liefert die App aus" }, note: { en: "x", de: "y" } }, "BuildingBlock"), "a pre-run's bilingual block");
  // The golden blocks are fictional and carry no source; with one, each is a valid block (a recorded
  // block always has at least one evidence record).
  for (const row of fixture("s2-assessment.json").blocks) check.ok(ok({ ...blockFromRow(row), evidence: example.evidence }, "BuildingBlock"), `S2 ${row.id}`);
  check.equal(ok(blockFromRow(fixture("s2-assessment.json").blocks[0]), "BuildingBlock"), false, "a block without evidence");
  const cat = dataScript("data/catalogue.js").SA_CATALOGUE;
  // Sixteen services and, from version 0.3.0, this prototype's self-assessment in a category of its own.
  check.equal(cat.entries.length, 17);
  check.equal(cat.entries.filter((e) => e.category === "self_assessment").map((e) => e.id).join(), "sovereignty-assessment");
  for (const e of cat.entries) check.ok(ok(e, "CatalogueEntry"), `catalogue ${e.id}`);
  const rf = dataScript("data/ref_facts.js").SA_REF_FACTS;
  check.ok(rf.facts.length >= 6);
  for (const f of rf.facts) check.ok(ok(f.evidence, "Evidence"), `reference fact ${f.id}`);
  // Broken copies: a missing field, a wrong enum, a long quote, a URL without a scheme, a stray field,
  // an empty German name, a parent without a country.
  const broken = [
    [{ ...example, criticality: "vital" }, "BuildingBlock", "criticality outside its enum"],
    [{ ...example, hosting: undefined }, "BuildingBlock", "hosting missing"],
    [{ ...example, vendor_rank: 1 }, "BuildingBlock", "a field outside the contract"],
    [{ ...example, level: 5 }, "BuildingBlock", "a level outside 0 to 4"],
    [{ ...example, tech: { name: "X", country: "US", parent: { name: "Y" } } }, "BuildingBlock", "a parent without its country"],
    [{ ...example.evidence[0], quote: "x".repeat(151) }, "Evidence", "a quote longer than 150 characters"],
    [{ ...example.evidence[0], url: "www.example.org" }, "Evidence", "a URL without a scheme"],
    [{ ...example.evidence[0], supports: [] }, "Evidence", "evidence that supports nothing"],
    [{ ...cat.entries[0], names: { en: "BundID", de: "" } }, "CatalogueEntry", "an empty German name"],
    [{ ...cat.entries[0], category: "standard" }, "CatalogueEntry", "a category outside the version-1 set (D5)"]
  ];
  for (const [value, schema, what] of broken) {
    const clean = JSON.parse(JSON.stringify(value));
    check.equal(ok(clean, schema), false, what);
  }
});

// ---- formats in both languages -------------------------------------------------------------------------------
await group("format", "Intl formats: whole scores, whole percentages, signed changes, euros, dates with the month written out, no data", async () => {
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
  check.deepEqual(both(f.fmtEur, 0.3789), ["€0.38", "0,38 €"]);
  check.deepEqual(both(f.fmtEur, 3), ["€3.00", "3,00 €"]);
  check.deepEqual(both(f.fmtDate, "2026-11-19"), ["19 November 2026", "19. November 2026"]);
  check.deepEqual(both(f.fmtScore, null), ["no data", "keine Daten"]);
  check.deepEqual(both(f.fmtShare, undefined), ["no data", "keine Daten"]);
  check.deepEqual(both(f.fmtDate, "not a date"), ["no data", "keine Daten"]);
  check.equal(f.clock(3_725_000), "1:02:05");
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
  check.equal(groups.platform_or_access.length, 7);
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
  check.equal(i.tn("console.count", 1, {}, "en"), "1 entry");
  check.equal(i.tn("console.count", 3, {}, "de"), "3 Einträge");
  check.equal(i.t("no.such.key"), "no.such.key");
  check.ok(i.missingKeys().includes("no.such.key"));
  check.equal(i.locale("de"), "de-DE");
  check.equal(i.locale("en"), "en-GB");
  i.setLang("en");
});

// ---- the golden copy for Diagnostics -----------------------------------------------------------------------------
await group("golden", "data/golden.js is the exact copy of tests/fixtures/, its checks all pass, and a changed expectation fails them", async () => {
  const { goldenSource } = await mod("tools/golden.mjs");
  check.equal(read("data/golden.js"), goldenSource(), "data/golden.js is the current copy (node tools/golden.mjs)");
  const golden = (await mod("data/golden.js")).default;
  check.deepEqual(JSON.parse(JSON.stringify(golden)), allFixtures());
  const { goldenChecks } = await mod("js/selftest.js");
  const groups = goldenChecks(golden);
  check.deepEqual(groups.map((g) => g.id), ["s1", "s2", "s3", "s4", "audit", "decisions"]);
  for (const g of groups) check.equal(g.passed, g.total, `${g.id}: ${g.failures.join(", ")}`);
  // The negative control: one figure changed in a copy, and one audit result flipped.
  const changed = JSON.parse(JSON.stringify(golden));
  changed["s2-assessment.json"].expected.overall.exact = "866/12";
  changed["f-audit.json"].cases[0].expected.pass = false;
  const bad = goldenChecks(changed);
  check.ok(bad.find((g) => g.id === "s2").failures.includes("overall"), "a changed overall score is caught");
  check.ok(bad.find((g) => g.id === "audit").failures.includes("F01"), "a flipped audit result is caught");
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

// ---- the exports (AC-17): the JSON against the schemas, the import, the names, the language -----------
await group("exports", "the assessment JSON of every pre-run is valid in both languages and imports to the same figures; broken copies are refused; the audit rows are valid AuditEvents; names; the report's language rule", async () => {
  // The bundled data as the page has it: window globals.
  const win = {};
  for (const f of ["data/catalogue.js", "data/ref_facts.js", "data/schemas.js", ...fs.readdirSync(path.join(APP_ROOT, "data/runs")).map((x) => `data/runs/${x}`)]) {
    const ctx = { window: win };
    vm.runInNewContext(read(f), ctx, { filename: f });
  }
  globalThis.window = Object.assign(globalThis.window || {}, win);
  globalThis.SA_RUNS = win.SA_RUNS;
  const S = win.SA_SCHEMAS;
  const { validate } = await mod("js/schema.js");
  const A = await mod("js/assessment.js");
  const { exportFileName, slugOf, reportMarkdownExport, assessmentJson } = await mod("js/export.js");
  const runs = Object.values(win.SA_RUNS);
  check.ok(runs.length >= 6, `the pre-runs (${runs.length})`);
  for (const def of runs) {
    for (const lang of ["en", "de"]) {
      const a = await A.assessmentFromPreRun(def, lang, { catalogue: win.SA_CATALOGUE, refFacts: win.SA_REF_FACTS });
      check.deepEqual(validate(a, S.Assessment, S).errors.slice(0, 2), [], `${def.id} ${lang}: valid`);
      check.equal(a.lang, lang);
      check.equal(a.as_of, def.as_of);
      const back = A.readAssessment(assessmentJson(a), S);
      check.ok(back.ok, `${def.id} ${lang}: the export reads back`);
      check.deepEqual(back.assessment.result.facts, a.result.facts, `${def.id} ${lang}: the same figures after the import`);
    }
  }
  // A golden case as a file: S2 imports to its exact overall score, 865/12.
  const s2 = fixtureAssessment({ service: "Musterdienst", category: "base_service", rows: fixture("s2-assessment.json").blocks });
  const s2back = A.readAssessment(JSON.stringify(s2), S);
  check.ok(s2back.ok);
  check.ok(Math.abs(A.scoreAssessment(s2back.assessment).overall - 865 / 12) < 1e-9, "S2's overall from the file");
  check.equal(A.scoreAssessment(s2back.assessment, { infrastructure: 0 }).overall === A.scoreAssessment(s2back.assessment).overall, false, "the weights count");
  // Broken files are refused, each for its reason; nothing of them is loaded.
  const one = structuredClone(s2);
  const broken = [
    [{ ...one, service: undefined }, "no service"],
    [{ ...one, category: "standard" }, "a category outside the set"],
    [{ ...one, lang: "fr" }, "a language the app does not have"],
    [{ ...one, weights: { infrastructure: 4 } }, "a weight above 3"],
    [{ ...one, weights: { politics: 1 } }, "a weight for no layer"],
    [{ ...one, blocks: [{ ...one.blocks[0], tech: { name: "X", country: "Germany", parent: null } }] }, "a country that is no code"],
    [{ ...one, blocks: [{ ...one.blocks[0], evidence: [{ ...one.blocks[0].evidence[0], quote: "x".repeat(151) }] }] }, "a quote longer than 150 characters"],
    [{ ...one, blocks: [{ ...one.blocks[0], evidence: [{ ...one.blocks[0].evidence[0], url: "javascript:alert(1)" }] }] }, "a source that is no web address"],
    [{ ...one, blocks: [one.blocks[0], one.blocks[0]] }, "the same block twice"],
    [{ ...one, script: "<script>" }, "a field outside the contract"]
  ];
  for (const [value, what] of broken) check.equal(A.readAssessment(JSON.stringify(value), S).ok, false, what);
  check.equal(A.readAssessment("{ not json", S).ok, false, "text that is no JSON");
  // The audit log of a played pre-run: every row a valid AuditEvent.
  const { bus } = await mod("js/events.js");
  const { initAudit, auditSnapshot } = await mod("js/audit.js");
  const { playProblems } = await mod("js/runs_check.js");
  const { createSimulationPlayer } = await mod("js/simulation.js");
  initAudit();
  let report = null;
  const off = bus.on("report", (ev) => { report = ev.payload; });
  const def = win.SA_RUNS.bundid;
  bus.beginRun({ run_id: "run-unit-exports", mode: "simulation" });
  bus.emit("run_start", { run_id: "run-unit-exports", mode: "simulation", query: def.query, entry_id: def.entry_id, lang: "en", source: def.source, as_of: def.as_of, weights: { infrastructure: 1 } });
  const played = await playProblems(def, { lang: "en", choice: "L1", createPlayer: createSimulationPlayer });
  off();
  bus.endRun();
  check.deepEqual(played.problems, []);
  const snap = auditSnapshot();
  const rows = [...snap.events, ...snap.model_calls];
  check.ok(rows.length > 20, `audit rows (${rows.length})`);
  const bad = rows.filter((r) => !validate(r, S.AuditEvent, S).valid).map((r) => r.type);
  check.deepEqual(bad, [], "every audit row is an AuditEvent");
  check.equal(snap.kind, "audit");
  // The names: the prefix, a slug of the service, the date, the language.
  check.equal(exportFileName("report", { service: "Online ID (eID)", date: "2026-11-19", lang: "en", ext: "md" }), "sovereignty-assessment-report-online-id-eid-2026-11-19-en.md");
  check.equal(exportFileName(null, { service: "Souveränität für Bürger", date: "2026-11-20", lang: "de", ext: "json" }), "sovereignty-assessment-souveraenitaet-fuer-buerger-2026-11-20-de.json");
  check.equal(slugOf("  …  "), "service");
  // The report's language rule: what code writes follows the active language; the findings keep theirs.
  check.ok(report && report.lang === "en", "the run's report");
  const de = reportMarkdownExport(report, "de");
  const en = reportMarkdownExport(report, "en");
  check.match(de, /## Korrekturen/);
  check.match(de, /Die Befunde oben sind auf Englisch/);
  check.match(de, /# BundID: findings/);
  check.match(en, /## Corrections by the reviewer/);
  check.doesNotMatch(en, /The findings above are in/);
  check.doesNotMatch(en + de, /\{\{fact:/);
});

// ---- report -----------------------------------------------------------------------------------------------
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(9)} ${r.what}${r.ok ? "" : `\n      ${r.error}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} unit groups passed.`);
if (!failed && ONLY.length === 0) console.log("UNIT OK");
process.exit(failed ? 1 : 0);
