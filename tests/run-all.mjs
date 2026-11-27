// Runs every check in order and prints a summary. The app itself needs none of this.
// Usage: node tests/run-all.mjs                  (all suites)
//        node tests/run-all.mjs unit showcase    (only the named suites)
//        node tests/run-all.mjs --require-vici   (fail, rather than skip, without a ViciDesign checkout)
import { spawnSync } from "node:child_process";
import path from "node:path";
import { APP_ROOT } from "./lib/harness.mjs";

const SUITES = [
  { id: "tokens", what: "colour system on Vici's tokens, light and dark: contrast, colour-blind separation", file: "tests/tokens.mjs", browser: false },
  { id: "page-icon", what: "page icon: favicon, header and loading screen, as on the website's card", file: "tests/page-icon.mjs", browser: false },
  { id: "i18n", what: "both languages: the same keys, no empty value, the same placeholders, every key asked for and used, no typed sentence", file: "tests/i18n.mjs", browser: false },
  { id: "unit", what: "client, cost, formats, catalogue, API errors, language, policy, storage, evidence, sequence rules, and every pre-run as five steps and four figures", file: "tests/unit.mjs", browser: false },
  { id: "engine", what: "golden cases S1 to S4 in both languages, origin classes, no data is not zero, weights, fact keys", file: "tests/engine.mjs", browser: false },
  { id: "audit", what: "fact audit: F01 to F29, the non-breaking-space variants, decisions D9 and D10", file: "tests/audit.mjs", browser: false },
  { id: "figures", what: "the figures 2.1.0 adds: section 3's cases, lower and unknown blocks, make-up and arithmetic, comparable services, starting points", file: "tests/figures.mjs", browser: false },
  { id: "runs", what: "the eighteen pre-runs, index.html loading each, each rule's planted defect and the planted starting points", file: "tests/runs.mjs", browser: false },
  { id: "fingerprint", what: "the case is the 2.1.0 baseline byte for byte, its engine 1.0.0's: fact audit, evidence, guardrails, agent, player, pre-runs, notes", file: "tests/fingerprint.mjs", browser: false },
  { id: "lean", what: "the presenter's size, one request module and one host, the cut of 1.0.0's console, the docs' length", file: "tests/lean.mjs", browser: false },
  { id: "hygiene", what: "no client, prospect, contact or meeting named in any published file", file: "tests/hygiene.mjs", browser: false },
  { id: "docs", what: "the documents' length and sections, every path and section named, every pre-run's sources, the talk track in both languages, the pinned files' reasons, the cold read", file: "tests/docs.mjs", browser: false },
  { id: "vici", what: "Vici's own checks on the page served and rendered in both languages, every text on every path, the docs; vici/ byte for byte", file: "tests/vici.mjs", browser: true },
  { id: "hexagon", what: "nothing round: the app's files, and the rendered page in both themes", file: "tests/hexagon.mjs", browser: true },
  { id: "showcase", what: "the presenter in Chromium: guide, tiles, partial figures, header, Your turn, Play, languages, network, offline, steps, names, Start agent, the keep list, all cases, layout", file: "tests/showcase.mjs", browser: true },
  { id: "live", what: "the live agent against the API stand-in, started and answered on the page: protocol, nudges, switched-off tools, evidence, caps, cost, guardrails, the key", file: "tests/live.mjs", browser: true }
];

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const chosen = SUITES.filter((s) => !only.length || only.includes(s.id));
const summary = [];
// In GitHub Actions a failed suite also becomes an annotation with its FAIL lines, readable in the
// run's summary and through the API without the full log.
const CI = process.env.GITHUB_ACTIONS === "true";
const annotate = (s, out) => {
  // Each FAIL line with the indented detail lines under it; otherwise the last lines of the output.
  const lines = out.split("\n").filter((l) => l.trim());
  const picked = [];
  lines.forEach((l, i) => {
    if (!/^(FAIL|Error|AssertionError|TypeError)|failed|exceeded/i.test(l.trim())) return;
    picked.push(l.trim());
    for (let j = i + 1; j < lines.length && /^\s+(-|at |\S)/.test(lines[j]) && j <= i + 8; j++) picked.push(lines[j].trim());
  });
  const text = (picked.length ? picked : lines.slice(-12).map((l) => l.trim())).join(" ⏎ ").slice(0, 6000);
  console.log(`::error title=${s.id} suite failed::${text}`);
};
for (const s of chosen) {
  console.log(`\n=== ${s.id}: ${s.what} ===`);
  const started = Date.now();
  const r = spawnSync(process.execPath, [path.join(APP_ROOT, s.file), ...(s.args || []), ...(s.id === "vici" ? flags : [])], { cwd: APP_ROOT, stdio: CI ? ["inherit", "pipe", "pipe"] : "inherit", env: process.env, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (CI) {
    process.stdout.write(r.stdout || "");
    process.stderr.write(r.stderr || "");
    if (r.status !== 0 && !(s.optional && r.status === 2)) annotate(s, `${r.stdout || ""}\n${r.stderr || ""}`);
  }
  // An optional suite without what it needs exits 2: skipped.
  if (s.optional && r.status === 2) {
    summary.push({ ...s, ok: true, skipped: true, code: r.status, seconds: Math.round((Date.now() - started) / 1000) });
    continue;
  }
  summary.push({ ...s, ok: r.status === 0, code: r.status, seconds: Math.round((Date.now() - started) / 1000) });
  if (r.status === 2 && s.browser) {
    console.log("Playwright is missing; browser suites are skipped. See tests/README.md.");
    break;
  }
}

console.log("\n=== Summary ===");
for (const s of summary) console.log(`${s.skipped ? "SKIP" : s.ok ? "PASS" : "FAIL"}  ${s.id.padEnd(10)} ${String(s.seconds).padStart(4)} s  ${s.what}`);
const skipped = chosen.length - summary.length;
if (skipped) console.log(`(${skipped} suite${skipped === 1 ? "" : "s"} not run)`);
const allPassed = summary.length === chosen.length && summary.every((s) => s.ok);
// The success line names a run of every suite, none skipped (a partial run or a skipped suite says so above).
if (allPassed && !only.length && summary.every((s) => !s.skipped)) console.log(`ALL SUITES PASSED (${summary.length} of ${SUITES.length})`);
process.exit(allPassed ? 0 : 1);
