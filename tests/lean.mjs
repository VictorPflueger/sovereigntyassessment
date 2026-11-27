// How lean the prototype stays: limits a change has to argue with. Node.js only.
//   shell    the presenter is 10 modules of its own (main, app, view, story, run, estimate, lang, and
//            2.1.0's chain, cases and overview) of at most 2,400 lines; everything else in js/ is 1.0.0's
//            engine, tools, agent and simulation
//   app      at most 6,600 lines of JavaScript in js/ (10,115 in 1.0.0) and one stylesheet of at most
//            560 lines (1,681 in seven files in 1.0.0); vici/ is Vici's, tests/ and tools/ aren't the app
//            Version 2.1.0 moved these limits on purpose (TECH_NOTES.md §25): a review of 2.0.0 asked for
//            All services and Compare, the make-up of every figure, the starting points and the lower
//            blocks, which 2.0.0's limits of 7 modules, 1,500 shell lines, 6,000 lines and 450 CSS lines
//            could not hold.
//   network  one module makes requests, js/anthropic.js, in a live run; no module and not the page
//            names another host to call, and the security policy connects to api.anthropic.com only
//   cut      nothing of 1.0.0's console is on the page or in its scripts: no control bar, console
//            replay, drawer, map, spider, Compare, Portfolio, exports, recorder, method view,
//            Diagnostics, intro, mode cards, typed service or catalogue chips
//   docs     README.md at most 900 words, DEMO_SCRIPT.md at most 1,400 (its English and German halves;
//            700 for the English-only script of 2.0.0), DESIGN.md at most 700 and DATA_SOURCES.md at most
//            600; PLAN.md lives in the git history, and REVIEW.md is version 2.1.0's cold read and reviews
//            (1.0.0's is in the history at 1dc145e)
// Each rule is first tried on a planted example that must break it. Prints CUTS OK and LEAN OK.
// Usage: node tests/lean.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { APP_ROOT } from "./lib/harness.mjs";

const LIMITS = { shellModules: 10, shellLines: 2400, jsLines: 6600, cssFiles: 1, cssLines: 560, readme: 900, script: 1400, design: 700, sources: 600 };
const SHELL = ["main.js", "app.js", "view.js", "story.js", "run.js", "estimate.js", "lang.js", "chain.js", "cases.js", "overview.js"];
const NET = /\bfetch\s*\(|XMLHttpRequest|WebSocket|new EventSource|navigator\.sendBeacon/;
const HOSTS = /https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi;
const CALLED = new Set(["api.anthropic.com"]);
// Links a person follows, not hosts the page calls: the byline, Vici, and Anthropic's console in key messages.
const LINKS = new Set(["www.linkedin.com", "victorpflueger.github.io", "platform.claude.com"]);
// 1.0.0's console, by the ids and classes it used.
const OLD_UI = /\b(?:id|class)="[^"]*\b(control-bar|controls-|console-|console\b|drawer|sovmap|honeycomb-map|spider|compare-|portfolio|export-|outbox|recorder|method-|diag-|diagnostics|intro-modal|mode-card|service-input|catalogue-chip|btn-[a-z]+)/;
const OLD_CODE = /\b(createRecorder|renderSpider|renderHoneycomb|openDrawer|exportReport|portfolioView|compareView|runDiagnostics|showIntro)\b/;

const results = [];
const cut = [];
const check = (ok, what, list = results) => list.push([!!ok, what]);
const read = (f) => readFileSync(path.join(APP_ROOT, f), "utf8");
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const lines = (text) => text.split("\n").length;
const words = (text) => text.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
const policy = (html) => Object.fromEntries(((html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || "")
  .split(";").map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map(([k, ...v]) => [k, v]));
const policyProblems = (html) => {
  const p = policy(html);
  const out = [];
  const connect = (p["connect-src"] || []).map((s) => s.replace(/^https:\/\//, ""));
  if (connect.sort().join(" ") !== [...CALLED].sort().join(" ")) out.push(`connect-src is "${(p["connect-src"] || []).join(" ")}"`);
  for (const [k, v] of Object.entries(p)) if (k !== "connect-src" && v.some((s) => /^https?:|^\*$|^wss?:/.test(s))) out.push(`${k} loads from ${v.join(" ")}`);
  if (!p["default-src"]?.includes("'self'")) out.push("no default-src 'self'");
  return out;
};
const hostsIn = (text) => [...text.matchAll(HOSTS)].map((m) => m[1].toLowerCase()).filter((h) => !CALLED.has(h) && !LINKS.has(h) && h !== "www.w3.org");

// ---- the rules catch what they are for ----------------------------------------------------------------
check(NET.test(code('const r = await fetch("https://api.open-meteo.com/v1/forecast");')) && !NET.test(code("// reads fetch() bodies\nconst fetched = items.filter(Boolean);")), "control: the network pattern catches a request, and passes a comment and ordinary code");
check(hostsIn('const URL = "https://api.open-meteo.com/v1/forecast";').length === 1 && !hostsIn('fetch("https://api.anthropic.com/v1/messages")').length, "control: a host other than the API is caught");
check(policyProblems(`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src https://api.anthropic.com https://unpkg.com">`).length > 0 && policyProblems(`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://unpkg.com; connect-src https://api.anthropic.com">`).length > 0, "control: a policy that connects or loads elsewhere is caught");
check(OLD_UI.test('<aside class="drawer" id="drawer">') && OLD_UI.test('<button id="btn-diagnostics">') && !OLD_UI.test('<dialog id="start-dialog">') && !OLD_UI.test('<div class="kpis">'), "control: a leftover of 1.0.0's console is caught, and the presenter's own parts are not");

// ---- the app ----------------------------------------------------------------------------------------------
const js = readdirSync(path.join(APP_ROOT, "js")).filter((f) => f.endsWith(".js"));
const jsLines = js.reduce((n, f) => n + lines(read(`js/${f}`)), 0);
const shell = SHELL.filter((f) => js.includes(f));
const shellLines = shell.reduce((n, f) => n + lines(read(`js/${f}`)), 0);
check(shell.length === SHELL.length && shell.length <= LIMITS.shellModules, `shell: ${shell.length} modules of the presenter's own (${shell.join(", ")}), at most ${LIMITS.shellModules}`);
check(shellLines <= LIMITS.shellLines, `shell: ${shellLines} lines, at most ${LIMITS.shellLines}`);
check(jsLines <= LIMITS.jsLines, `app: ${jsLines} lines of JavaScript in ${js.length} modules, at most ${LIMITS.jsLines} (10,115 in 1.0.0)`);
const css = readdirSync(path.join(APP_ROOT, "css")).filter((f) => f.endsWith(".css"));
const cssLines = css.reduce((n, f) => n + lines(read(`css/${f}`)), 0);
check(css.length === LIMITS.cssFiles && cssLines <= LIMITS.cssLines, `app: ${cssLines} lines of CSS in ${css.length} file(s), one file of at most ${LIMITS.cssLines} lines (1,681 in seven files in 1.0.0)`);

// ---- network and policy -----------------------------------------------------------------------------------
const net = js.filter((f) => NET.test(code(read(`js/${f}`))));
check(net.join() === "anthropic.js", `network: only js/anthropic.js makes requests (found in ${net.join(", ") || "none"})`);
const hosts = [...js.map((f) => `js/${f}`), ...readdirSync(path.join(APP_ROOT, "js/i18n")).map((f) => `js/i18n/${f}`), "index.html", "css/app.css"].flatMap((f) => hostsIn(code(read(f))).map((h) => `${f}: ${h}`));
check(!hosts.length, `network: no module and not the page names a host to call but the API${hosts.length ? `; found ${[...new Set(hosts)].slice(0, 6).join(", ")}` : ""}`);
const p = policyProblems(read("index.html"));
check(!p.length, `policy: the page connects to api.anthropic.com only and loads everything from itself${p.length ? `; ${p.join("; ")}` : ""}`);

// ---- the cut ---------------------------------------------------------------------------------------------------
const left = read("index.html").match(OLD_UI);
check(!left, `page: nothing of 1.0.0's console is left in index.html${left ? ` (found ${left[0]})` : ""}`, cut);
const leftCode = js.map((f) => [f, code(read(`js/${f}`)).match(OLD_CODE) || code(read(`js/${f}`)).match(OLD_UI)]).filter(([, m]) => m);
check(!leftCode.length, `page: no script builds a part of 1.0.0's console${leftCode.length ? ` (${leftCode.map(([f, m]) => `${f}: ${m[0]}`).join("; ")})` : ""}`, cut);
const gone = ["recorder.js", "drawer.js", "console.js", "controls.js", "compare.js", "portfolio.js", "export.js", "export_panel.js", "diagnostics.js", "diagnostics_view.js", "method_panel.js", "sovmap.js", "spider.js", "honeycomb.js", "intro.js", "outbox.js"].filter((f) => js.includes(f));
check(!gone.length, `page: 1.0.0's console modules are gone from js/${gone.length ? ` (still here: ${gone.join(", ")})` : ""}`, cut);
// The case menu: every catalogue entry one menu away, BundID on the first screen.
const app = read("js/app.js");
check(/const FIRST = "bundid"/.test(app) && /function buildCaseMenu\(\)/.test(app) && /popovertarget="case-menu"/.test(read("index.html")), "page: BundID is the first case, and the others sit in one menu (#case-menu)", cut);

// ---- docs ---------------------------------------------------------------------------------------------------------
const count = (f) => (existsSync(path.join(APP_ROOT, f)) ? words(read(f)) : Infinity);
for (const [f, max] of [["README.md", LIMITS.readme], ["DEMO_SCRIPT.md", LIMITS.script], ["DESIGN.md", LIMITS.design], ["DATA_SOURCES.md", LIMITS.sources]]) check(count(f) <= max, `docs: ${f} has ${count(f)} words, at most ${max}`);
const kept = ["PLAN.md"].filter((f) => existsSync(path.join(APP_ROOT, f)));
check(!kept.length && existsSync(path.join(APP_ROOT, "REVIEW.md")), `docs: PLAN.md lives in the git history, and REVIEW.md holds version 2.1.0's cold read${kept.length ? ` (still here: ${kept.join(", ")})` : ""}`);

let failed = 0;
for (const [list, token] of [[results, null], [cut, "CUTS OK"]]) {
  for (const [ok, what] of list) console.log(`${ok ? "PASS" : "FAIL"}  ${what}`);
  const f = list.filter(([ok]) => !ok).length;
  failed += f;
  if (token && !f) console.log(token);
}
if (failed) { console.log(`\n${failed} of ${results.length + cut.length} checks failed.`); process.exit(1); }
console.log(`\nAll ${results.length + cut.length} checks passed.\nLEAN OK`);
