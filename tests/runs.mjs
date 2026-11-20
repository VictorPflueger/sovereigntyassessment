// The pre-run assessments under the rules of section 8 of the brief (AC-12), without a browser:
//   all        tools/check-runs.mjs passes every pre-run in data/runs/: the brief's six, the five of decision
//              D3 (0.3.0), the self-assessment and the five added in 1.0.0 (three of which end without an
//              assessment), each played in both languages along every lever choice, with its verified flags
//              equal to research/; index.html loads every pre-run file
//   planted    each rule catches its defect, planted in a copy of a passing pre-run: a missing language,
//              different placeholders, an audit failure, an unknown fact key, a block without evidence, an
//              unknown URL, a long quote, a quote missing from research/, a key-like string, a thinking
//              block, a field no quote supports (an exit path, an operator), a lever that names a company;
//              the unchanged copy is the positive control and has no problem
// Usage: node tests/runs.mjs [case…]
import path from "node:path";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, wanted } from "./lib/harness.mjs";

const { checkRun, readRunFile, runIds } = await import(pathToFileURL(path.join(APP_ROOT, "tools/check-runs.mjs")).href);
const results = [];
const SIX = ["bundesportal", "bundid", "deutschland-app", "epaybl", "fit-connect", "online-ausweis"];
// D3 (0.3.0): the remaining entries with enough public evidence, and this prototype's self-assessment.
const D3 = ["dvc", "eudi-wallet", "kipitz", "muk", "opencode", "sovereignty-assessment"];
// 1.0.0: the five entries that had only a research note. NOOTS and the Marktplatz are assessed; ZBDS, ZaPuK and
// low-code end "not_a_service" (a concept, a target architecture and a category), with no block.
const V1 = ["low-code", "marktplatz-deutschland-digital", "noots", "zapuk", "zbds"];
const ALL = [...SIX, ...D3, ...V1].sort();

// ---- all --------------------------------------------------------------------------------------------------
if (wanted("all")) {
  const r = spawnSync(process.execPath, [path.join(APP_ROOT, "tools/check-runs.mjs")], { cwd: APP_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout}${r.stderr}`;
  const ids = runIds();
  const problems = [];
  if (r.status !== 0) problems.push(`tools/check-runs.mjs exited ${r.status}: ${out.split("\n").filter((l) => /FAIL|\[/.test(l)).slice(0, 12).join(" | ")}`);
  if (JSON.stringify(ids) !== JSON.stringify(ALL)) problems.push(`the pre-runs are ${JSON.stringify(ids)}, not ${JSON.stringify(ALL)}`);
  const m = out.match(/CHECK-RUNS OK \((\d+) pre-runs, (\d+) plays\)/);
  if (!m || Number(m[1]) !== ALL.length) problems.push(`no "CHECK-RUNS OK (${ALL.length} pre-runs …)" line`);
  for (const id of ALL) if (!new RegExp(`^PASS ${id}:`, "m").test(out)) problems.push(`no PASS line for ${id}`);
  const html = readFileSync(path.join(APP_ROOT, "index.html"), "utf8");
  for (const id of ids) if (!html.includes(`<script src="data/runs/${id}.js" defer></script>`)) problems.push(`index.html does not load data/runs/${id}.js`);
  results.push({ name: `all: the ${ALL.length} pre-runs pass tools/check-runs.mjs${m ? ` (${m[2]} plays)` : ""}, and index.html loads each`, ok: !problems.length, problems });
}

// ---- planted ----------------------------------------------------------------------------------------------
if (wanted("planted")) {
  const id = "bundid";
  const base = readRunFile(path.join(APP_ROOT, "data/runs", `${id}.js`));
  const research = readFileSync(path.join(APP_ROOT, "research", `${id}.md`), "utf8");
  const firstIndex = (def, pred) => def.steps.findIndex(pred);
  const blockStep = (def) => def.steps[firstIndex(def, (s) => s.tool === "rec_block")];
  const reviewStep = (def) => def.steps[firstIndex(def, (s) => s.tool === "ui_request_review")];
  // Each defect: [name, the problem code it must raise, how to plant it in a copy].
  const DEFECTS = [
    ["a missing language", "missing_language", (d) => { d.steps[firstIndex(d, (s) => s.say)].say = { en: "Only English here." }; }],
    ["different placeholders", "placeholders_differ", (d) => { const s = reviewStep(d); s.input.summary.de = s.input.summary.de.replace(/\{\{fact:[^}]+\}\}/, "unbekannt"); }],
    ["an audit failure", "audit", (d) => { blockStep(d).input.note = { en: "About 75 % of the parts are run in Germany.", de: "Etwa 75 % der Teile werden in Deutschland betrieben." }; }],
    ["an unknown fact key", "unknown_fact", (d) => { const s = reviewStep(d); s.input.summary.en += " See {{fact:score.made_up}}."; s.input.summary.de += " Siehe {{fact:score.made_up}}."; }],
    ["a block without evidence", "block_without_evidence", (d) => { blockStep(d).input.evidence = []; }],
    ["an unknown URL", "unknown_url", (d) => { blockStep(d).input.evidence[0].url = "https://not-returned.example/page"; }],
    ["a long quote", "long_quote", (d) => { blockStep(d).input.evidence[0].quote = "x".repeat(151); }],
    ["a quote missing from research/", "quote_not_in_research", (d) => { const e = blockStep(d).input.evidence[0]; e.quote = `${e.quote.slice(0, 120)} (reworded)`; }],
    ["a key-like string", "key_like", (d) => { d.steps[firstIndex(d, (s) => s.say)].say.en += " sk-ant-api03-" + "Ab1".repeat(16); }],
    ["a thinking block", "thinking", (d) => { d.steps.splice(1, 0, { say: { en: "x", de: "x" }, thinking: "private reasoning" }); }],
    ["an exit path no quote supports", "unsupported_field", (d) => { blockStep(d).input.exit = "hard"; }],
    ["an operator no quote supports", "unsupported_field", (d) => { for (const e of blockStep(d).input.evidence) e.supports = e.supports.filter((f) => f !== "operator"); if (!blockStep(d).input.evidence.some((e) => e.supports.length)) blockStep(d).input.evidence[0].supports = ["tech"]; }],
    ["a lever that names a company", "lever_names_company", (d) => { const l = d.steps[firstIndex(d, (s) => s.tool === "ui_propose_levers")].input.levers[0]; l.title.en = `${l.title.en} from Apple`; }]
  ];
  // Positive control: the unchanged copy passes.
  const control = await checkRun(structuredClone(base), { id, researchText: research });
  results.push({ name: `planted: the unchanged ${id} copy has no problem (${control.plays} plays)`, ok: control.problems.length === 0 && control.plays > 0, problems: control.problems.map((p) => `[${p.code}] ${p.where}: ${p.message}`) });
  // A planted defect may make the simulation player log its failure; collected here, not printed.
  const logged = [];
  const consoleError = console.error;
  for (const [what, code, plant] of DEFECTS) {
    const def = structuredClone(base);
    plant(def);
    console.error = (...a) => logged.push(a.map(String).join(" "));
    const r = await checkRun(def, { id, researchText: research }).finally(() => { console.error = consoleError; });
    const hit = r.problems.filter((p) => p.code === code);
    results.push({ name: `planted: ${what} raises ${code}`, ok: hit.length > 0, problems: hit.length ? [] : [`got ${JSON.stringify(r.problems.map((p) => p.code))}`], detail: hit[0] ? `${hit[0].where}: ${hit[0].message}` : "" });
  }
}

for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok && r.detail ? `\n      ${r.detail}` : ""}`);
  if (!r.ok) for (const p of r.problems.slice(0, 12)) console.log(`      - ${p}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} runs cases passed.`);
if (!failed && ONLY.length === 0) console.log("RUNS OK");
process.exit(failed ? 1 : 0);
