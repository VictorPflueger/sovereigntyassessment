// Checks every pre-run assessment (data/runs/<entry>.js) under the rules of section 8 of the brief, with
// its research notes (research/<entry>.md), and sets each quote's verified flag from them. The static
// checks are in js/runs_check.js; the play check runs each pre-run through the real simulation player and
// tool executors in English and in German, along every lever choice, so a pre-run that passes here plays
// in the browser with the same figures and texts.
// Usage: node tools/check-runs.mjs [entry…]          check (exit 1 on any problem)
//        node tools/check-runs.mjs --write [entry…]  set the verified flags from research/, then check
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNS = path.join(ROOT, "data", "runs");
const RESEARCH = path.join(ROOT, "research");

globalThis.window = globalThis.window || globalThis;
const load = async (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

/** Reads a pre-run file without the browser: the object it sets on window.SA_RUNS. */
export function readRunFile(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(file, "utf8"), sandbox, { filename: file });
  const runs = sandbox.window.SA_RUNS || {};
  const ids = Object.keys(runs);
  if (ids.length !== 1) throw new Error(`${path.basename(file)} must set exactly one pre-run, not ${ids.length}`);
  return JSON.parse(JSON.stringify(runs[ids[0]]));
}

/** Every pre-run file's entry id. */
export function runIds() {
  return existsSync(RUNS) ? readdirSync(RUNS).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3)).sort() : [];
}

/**
 * Checks one pre-run: the static checks and the plays. Returns { problems, plays }. def is checked as
 * given (a test passes planted defects here).
 */
export async function checkRun(def, { id = def?.id, researchText = null } = {}) {
  await load("data/catalogue.js");
  await load("data/ref_facts.js");
  const { staticProblems, parseResearch, leverChoices, playProblems } = await load("js/runs_check.js");
  const { createSimulationPlayer } = await load("js/simulation.js");
  const md = researchText ?? (existsSync(path.join(RESEARCH, `${id}.md`)) ? readFileSync(path.join(RESEARCH, `${id}.md`), "utf8") : null);
  const research = md === null ? null : parseResearch(md);
  const problems = staticProblems(def, { id, catalogue: window.SA_CATALOGUE, refFacts: window.SA_REF_FACTS, research });
  let plays = 0;
  // A run that is not well-formed is not played: its static problems say why.
  if (!problems.some((p) => ["shape", "step", "key_like", "thinking"].includes(p.code))) {
    for (const lang of ["en", "de"]) {
      for (const choice of leverChoices(def)) {
        const r = await playProblems(def, { lang, choice, createPlayer: createSimulationPlayer });
        plays += 1;
        for (const p of r.problems) if (!problems.some((q) => q.code === p.code && q.where === p.where && q.message === p.message)) problems.push(p);
      }
    }
  }
  return { problems, plays };
}

async function main(argv) {
  const write = argv.includes("--write");
  const only = argv.filter((a) => !a.startsWith("--"));
  const ids = runIds().filter((id) => !only.length || only.includes(id));
  const { parseResearch, applyFlags } = await load("js/runs_check.js");
  // Both before the first flag is set: a quote of the bundled reference facts counts as verified.
  await load("data/catalogue.js");
  await load("data/ref_facts.js");
  let failed = 0;
  let plays = 0;
  for (const id of ids) {
    const file = path.join(RUNS, `${id}.js`);
    let def;
    try { def = readRunFile(file); } catch (e) { console.log(`FAIL ${id}: ${e.message}`); failed += 1; continue; }
    const mdFile = path.join(RESEARCH, `${id}.md`);
    if (write) {
      const { runFileText } = await load("js/runs_check.js");
      const research = existsSync(mdFile) ? parseResearch(readFileSync(mdFile, "utf8")) : null;
      const changed = applyFlags(def, research);
      const entry = window.SA_CATALOGUE.entries.find((e) => e.id === def.entry_id);
      const text = runFileText(def, entry?.names?.en || def.id);
      if (text !== readFileSync(file, "utf8")) { writeFileSync(file, text); console.log(`wrote ${path.relative(ROOT, file)} (${changed} flag${changed === 1 ? "" : "s"} changed)`); }
    }
    const r = await checkRun(def, { id });
    plays += r.plays;
    if (!write) {
      const { applyFlags: flags } = await load("js/runs_check.js");
      const copy = structuredClone(def);
      const research = existsSync(mdFile) ? parseResearch(readFileSync(mdFile, "utf8")) : null;
      if (flags(copy, research)) r.problems.push({ code: "flag", where: "evidence", message: "verified flags differ from research/: run tools/check-runs.mjs --write" });
    }
    if (r.problems.length) {
      failed += 1;
      console.log(`FAIL ${id} (${r.problems.length} problem${r.problems.length === 1 ? "" : "s"})`);
      for (const p of r.problems.slice(0, 40)) console.log(`  [${p.code}] ${p.where}: ${p.message}`);
    } else {
      const blocks = def.steps.filter((s) => s.tool === "rec_block").length;
      console.log(`PASS ${id}: ${def.steps.length} steps, ${blocks} blocks, ${r.plays} plays`);
    }
  }
  if (!ids.length) { console.log("No pre-runs found."); process.exit(1); }
  if (failed) { console.log(`CHECK-RUNS FAILED (${failed} of ${ids.length})`); process.exit(1); }
  console.log(`CHECK-RUNS OK (${ids.length} pre-run${ids.length === 1 ? "" : "s"}, ${plays} plays)`);
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
