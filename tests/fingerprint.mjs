// The case is version 2.1.0's baseline, byte for byte, and its engine still 1.0.0's: the engine, the fact
// check, the evidence check, the guardrails, the agent with its prompt, tools and client, the simulation
// player, the pre-run check, the catalogue, the reference facts, the eighteen pre-runs and their research
// notes, and js/chain.js, the figures 2.1.0 derives. tests/lib/baseline.mjs holds both baselines: 1.0.0's
// hashes from the release commit 1dc145e, and 2.1.0's, taken on 27 November 2026 after the changes
// TECH_NOTES.md §25 lists with their reasons (tests/docs.mjs, case "pinned", checks that list). The
// engine's rules (js/engine.js, js/classes.js, js/weights.js, js/facts.js, js/audit.js) must equal 1.0.0's
// in both. The agent's settings in js/config.js (the API, the server tools, the models and their prices,
// the caps, the exchange rate, the security policy) and the words the case modules ask the dictionaries
// for (the API's errors, the notices, the memo templates) are compared with 1.0.0's too.
// Usage: node tests/fingerprint.mjs
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_ROOT } from "./lib/harness.mjs";
import { RELEASE_1, SHA256_1, SHA256 } from "./lib/baseline.mjs";

export const VERSION = "2.1.0";
const ENGINE = ["js/engine.js", "js/classes.js", "js/weights.js", "js/facts.js", "js/audit.js"];
// js/config.js at 1.0.0: the agent's settings, as canonical JSON (keys sorted).
const CONFIG_1 = {"AGENT":{"budgetEur":3,"idleTimeoutMs":90000,"maxNudges":2,"maxOutputTokens":128000,"maxSteps":40},"ANTHROPIC":{"apiVersion":"2023-06-01","browserHeader":"anthropic-dangerous-direct-browser-access","consoleKeysUrl":"https://platform.claude.com/settings/keys","consoleWorkspacesUrl":"https://platform.claude.com/settings/workspaces","messagesUrl":"https://api.anthropic.com/v1/messages","modelsUrl":"https://api.anthropic.com/v1/models?limit=100","webSearchTool":{"max_uses":5,"name":"web_search","type":"web_search_20250305"},"webSearchUsdPer1000":10},"CSP":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src https://api.anthropic.com; object-src 'none'; base-uri 'none'; form-action 'none'","FX_USD_EUR":0.894,"MODELS":[{"effort":"medium","hintKey":"model.hint.sonnet","id":"claude-sonnet-5-5","label":"Sonnet 5.5","maxTokens":16000,"price":{"cacheRead":0.1,"cacheWrite":2.5,"input":2,"output":10}},{"effort":"medium","hintKey":"model.hint.haiku","id":"claude-haiku-5-5","label":"Haiku 5.5","maxTokens":12000,"price":{"cacheRead":0.01,"cacheWrite":0.125,"input":0.1,"longPrompt":{"cacheRead":0.05,"cacheWrite":0.625,"input":0.5,"output":2.5,"thresholdTokens":100000},"output":0.5}},{"effort":"high","hintKey":"model.hint.opus","id":"claude-opus-5-5","label":"Opus 5.5","maxTokens":16000,"price":{"cacheRead":0.2,"cacheWrite":5,"input":4,"output":20}}],"SERVER_TOOLS":[{"max_uses":12,"name":"web_search","type":"web_search_20250305","user_location":{"country":"DE","timezone":"Europe/Berlin","type":"approximate"}},{"citations":{"enabled":true},"max_content_tokens":8000,"max_uses":10,"name":"web_fetch","type":"web_fetch_20250910"}]};
// The dictionary keys the case modules ask for, and the SHA-256 of their English and German texts at
// 1.0.0 as canonical JSON ({ key: [en, de] }, keys sorted).
const CASE_KEYS = ["api.forbidden", "api.network", "api.other", "api.overloaded", "api.rateLimited", "api.server", "api.spendLimit", "api.timeout", "api.unauthorized", "api.workspace", "controls.aborted", "fact.level", "memo.sim.body.keep", "memo.sim.body.lever", "memo.sim.subject.keep", "memo.sim.subject.lever", "notice.contextWindow", "notice.correctionIgnored", "notice.correctionLogged", "notice.costCap", "notice.discarded", "notice.ended", "notice.fetchBudget", "notice.maxTokensRetry", "notice.modelMissing", "notice.nudge", "notice.refusal", "notice.retrying", "notice.searchBudget", "notice.simFailed", "notice.stepLimit", "notice.unchecked", "notice.unexpected", "notice.webFetchOff", "notice.webSearchOff"];
const CASE_WORDS_1 = "6d69e1b9f50aafba128788bc3d02b8195a2151e790e7b99e3fcd986a4c5c98fd";

const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}` : JSON.stringify(v));
const results = [];
const check = (ok, what, detail = "") => results.push({ ok, what, detail });

// The negative control: a file with one byte changed has another hash.
{
  const original = fs.readFileSync(path.join(APP_ROOT, "js/engine.js"));
  const planted = Buffer.concat([original, Buffer.from(" ")]);
  check(sha(original) === SHA256["js/engine.js"] && sha(planted) !== SHA256["js/engine.js"], "the check tells a changed byte (positive control: js/engine.js with one space more)");
}

// The engine's rules are 1.0.0's, in both baselines and on disk.
const engine = ENGINE.filter((f) => SHA256_1[f] !== SHA256[f] || sha(fs.readFileSync(path.join(APP_ROOT, f))) !== SHA256_1[f]);
check(!engine.length, `the engine's rules equal ${RELEASE_1} byte for byte (${ENGINE.join(", ")})`, engine.join(", "));

// Every case file, byte for byte; and no file of the case is missing from the list.
const changed = [];
for (const [f, want] of Object.entries(SHA256)) {
  const p = path.join(APP_ROOT, f);
  if (!fs.existsSync(p)) { changed.push(`${f} is missing`); continue; }
  if (sha(fs.readFileSync(p)) !== want) changed.push(`${f} differs from the ${VERSION} baseline`);
}
check(!changed.length, `${Object.keys(SHA256).length} files of the case equal the ${VERSION} baseline byte for byte`, changed.join("; "));
const runs = fs.readdirSync(path.join(APP_ROOT, "data/runs")).map((f) => `data/runs/${f}`);
const notes = fs.readdirSync(path.join(APP_ROOT, "research")).filter((f) => f !== "sources.md").map((f) => `research/${f}`);
const unlisted = [...runs, ...notes].filter((f) => !Object.hasOwn(SHA256, f));
check(!unlisted.length && runs.length === 18 && notes.length === 18, "the eighteen pre-runs and their eighteen notes are all on the list", unlisted.join(", "));
check(Object.keys(SHA256_1).every((f) => Object.hasOwn(SHA256, f)), `every file ${RELEASE_1} pinned is still pinned`, Object.keys(SHA256_1).filter((f) => !Object.hasOwn(SHA256, f)).join(", "));

// The agent's settings.
const C = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const now = canon({ ANTHROPIC: C.ANTHROPIC, SERVER_TOOLS: C.SERVER_TOOLS, MODELS: C.MODELS, AGENT: C.AGENT, FX_USD_EUR: C.FX_USD_EUR, CSP: C.CSP });
const was = canon(CONFIG_1);
const diff = Object.keys(CONFIG_1).filter((k) => canon(CONFIG_1[k]) !== canon({ ANTHROPIC: C.ANTHROPIC, SERVER_TOOLS: C.SERVER_TOOLS, MODELS: C.MODELS, AGENT: C.AGENT, FX_USD_EUR: C.FX_USD_EUR, CSP: C.CSP }[k]));
check(now === was, "js/config.js keeps 1.0.0's API, server tools, models and prices, caps, exchange rate and security policy", diff.join(", "));
check(C.APP.version === VERSION, `js/config.js says version ${C.APP.version}`);

// The words the case modules use.
const EN = (await import(pathToFileURL(path.join(APP_ROOT, "js/i18n/en.js")).href)).default;
const DE = (await import(pathToFileURL(path.join(APP_ROOT, "js/i18n/de.js")).href)).default;
const words = sha(canon(Object.fromEntries(CASE_KEYS.map((k) => [k, [EN[k], DE[k]]]))));
check(words === CASE_WORDS_1, `the ${CASE_KEYS.length} texts the case modules ask for read as in 1.0.0, in both languages`, CASE_KEYS.filter((k) => !EN[k] || !DE[k]).join(", "));

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.what}${!r.ok && r.detail ? `\n      ${r.detail}` : ""}`);
const failed = results.filter((r) => !r.ok).length;
if (!failed) console.log("CASE UNCHANGED");
process.exit(failed ? 1 : 0);
