// The figures version 2.1.0 adds to the screen, checked in Node against the engine (no browser):
//   section3    the six cases of the revision's section 3 have exactly its figures, and the counts over
//               the seventeen pre-runs of 2.0.0 (assessed, tile above a block, critical block unknown)
//               are measured, not copied
//   all-cases   for every assessed pre-run in English and German, js/chain.js's lowest level, lower
//               blocks and unknown critical blocks equal a second, naive computation from the blocks
//   makeup      each layer's arithmetic evaluates to the engine's layer score; BundID's access layer and
//               FIT-Connect's read as the revision sets out, in both languages; every block's make-up
//               names both sides and the rule that sets its level
//   comparable  every catalogue entry has one of the five function groups (this prototype stands apart),
//               and each case's comparable services are the other assessed services of its group, best
//               first, with the engine's scores
//   starting-points  in the six required cases every weak block (the weakest critical link below 4, every
//               block below it, every block at level 0 or 1) has a sourced starting point, or its
//               research note lists the searches that found none; every list on screen is alphabetical
//   view-computes-nothing  the view modules import neither the engine nor the derived figures
// Prints FIGURES OK <case> per case and FIGURES OK when every case ran and passed.
// Usage: node tests/figures.mjs [case…]
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, wanted } from "./lib/harness.mjs";
import { loadData, playCase } from "./lib/play.mjs";

const mod = (p) => import(pathToFileURL(path.join(APP_ROOT, p)).href);
const read = (f) => fs.readFileSync(path.join(APP_ROOT, f), "utf8");
const FIX = JSON.parse(read("tests/fixtures/sa-section3.json"));
const ORIGINAL = ["bundid", "online-ausweis", "eudi-wallet", "muk", "fit-connect", "noots", "zapuk", "zbds", "epaybl", "kipitz", "low-code", "marktplatz-deutschland-digital", "opencode", "dvc", "bundesportal", "deutschland-app", "sovereignty-assessment"];
const REQUIRED = ["bundid", "fit-connect", "eudi-wallet", "epaybl", "online-ausweis", "serviceportal-nrw"];
const GROUPS = ["identity", "payments", "data_exchange", "platforms", "portals"];

const win = loadData();
const { digest } = await mod("js/run.js");
const { story } = await mod("js/story.js");
const { LAYERS, WEIGHTS, techLevel, opLevel } = await mod("js/engine.js");
const chainModule = await mod("js/chain.js").catch((e) => ({ missing: String(e.message || e).split("\n")[0] }));
const nb = (s) => String(s).replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();
const entries = () => win.SA_CATALOGUE.entries;
const entryOf = (id) => entries().find((e) => e.id === id);

const results = [];
let count = 0;
const check = new Proxy(assert, { get: (target, prop) => (typeof target[prop] === "function" ? (...args) => { count += 1; return target[prop](...args); } : target[prop]) });
async function group(name, what, fn) {
  if (!wanted(name)) return;
  count = 0;
  try {
    if (chainModule.missing) throw new Error(`js/chain.js does not load: ${chainModule.missing}`);
    await fn();
    results.push({ name, ok: true, what: `${what} (${count} checks)` });
  } catch (e) {
    results.push({ name, ok: false, what, error: String(e?.message || e).split("\n").slice(0, 8).join(" | ") });
  }
}

// Every pre-run played once per language with the review confirmed and Keep as is; the digest as the page has it.
const played = new Map();
async function runOf(id, lang = "en", choice = "keep") {
  const k = `${id}|${lang}|${choice}`;
  if (!played.has(k)) {
    const def = win.SA_RUNS[id];
    if (!def) throw new Error(`no pre-run ${id}`);
    const p = await playCase(def, lang, { choice, memo: "approved" });
    played.set(k, digest(p.events));
  }
  return played.get(k);
}
const nameOf = (result, id, lang = "en") => { const b = result.blocks.find((x) => x.id === id); return b && typeof b.name === "object" ? b.name[lang] : b?.name; };
const order = (a, b) => a.level - b.level || LAYERS.indexOf(a.layer) - LAYERS.indexOf(b.layer) || String(a.id).localeCompare(String(b.id));
/** The naive computation the tests trust: straight from the scored blocks. */
function naive(result) {
  const scored = result.blocks.filter((b) => !b.unscored);
  const critical = scored.filter((b) => b.criticality === "critical");
  const min = critical.length ? Math.min(...critical.map((b) => b.level)) : null;
  const lower = min === null ? [] : scored.filter((b) => b.level < min).sort(order).map((b) => b.id);
  const lowestLevel = scored.length ? Math.min(...scored.map((b) => b.level)) : null;
  const unknownCritical = result.blocks.filter((b) => b.unscored && b.criticality === "critical").sort(order).map((b) => b.id);
  return { min, lower, lowestLevel, unknownCritical };
}
const assessedIds = () => Object.keys(win.SA_RUNS).filter((id) => !win.SA_RUNS[id].steps.some((s) => s.report?.outcome === "not_a_service"));

// ---- section 3 -----------------------------------------------------------------------------------------------
await group("section3", "the six cases of section 3 with exactly their figures; the counts over 2.0.0's seventeen pre-runs measured", async () => {
  const { links } = chainModule;
  for (const c of FIX.cases) {
    const run = await runOf(c.id);
    const r = run.score.result;
    const L = links(r);
    check.equal(Math.round(r.overall), c.overall, `${c.id}: overall`);
    check.equal(LAYERS.filter((l) => r.layers[l].score !== null).length, c.layers, `${c.id}: layers`);
    check.equal(L.weakest.level, c.weakest.level, `${c.id}: weakest level`);
    check.equal(nameOf(r, L.weakest.id), c.weakest.block, `${c.id}: weakest block`);
    check.equal(L.weakest.ties, c.weakest.ties, `${c.id}: ties`);
    check.equal(L.lowest.level, c.lowest, `${c.id}: lowest level`);
    check.deepEqual(L.lower.map((x) => ({ block: nameOf(r, x.id), criticality: r.blocks.find((b) => b.id === x.id).criticality, level: x.level })), c.lower, `${c.id}: lower blocks`);
    check.deepEqual(L.unknownCritical.map((id) => nameOf(r, id)), c.unknown_critical, `${c.id}: unknown critical blocks`);
  }
  let assessed = 0, above = 0, unknown = 0;
  for (const id of ORIGINAL) {
    const run = await runOf(id);
    if (run.notService) continue;
    assessed += 1;
    const L = links(run.score.result);
    if (L.lower.length) above += 1;
    if (L.unknownCritical.length) unknown += 1;
  }
  check.equal(ORIGINAL.length, FIX.counts.pre_runs);
  check.equal(assessed, FIX.counts.assessed, "assessed pre-runs");
  check.equal(above, FIX.counts.tile_above_a_block, "cases with a block below the tile");
  check.equal(unknown, FIX.counts.critical_left_out_as_unknown, "cases with a critical block left out as unknown");
});

// ---- every case --------------------------------------------------------------------------------------------------
await group("all-cases", "every assessed pre-run in both languages: lowest, lower and unknown critical blocks as a naive computation gives them", async () => {
  const { links } = chainModule;
  for (const id of assessedIds()) {
    for (const lang of ["en", "de"]) {
      const r = (await runOf(id, lang)).score.result;
      const L = links(r);
      const n = naive(r);
      check.equal(L.weakest?.level ?? null, n.min, `${id} ${lang}: weakest level`);
      check.deepEqual(L.lower.map((x) => x.id), n.lower, `${id} ${lang}: lower blocks`);
      check.equal(L.lowest?.level ?? null, n.lowestLevel, `${id} ${lang}: lowest level`);
      check.deepEqual(L.unknownCritical, n.unknownCritical, `${id} ${lang}: unknown critical blocks`);
      check.equal(L.noWeak, !n.lower.length && !n.unknownCritical.length, `${id} ${lang}: nothing lower`);
      for (const x of L.lower) check.notEqual(r.blocks.find((b) => b.id === x.id).criticality, "critical", `${id}: a lower block is never critical`);
    }
  }
});

// ---- make-up and arithmetic --------------------------------------------------------------------------------------
await group("makeup", "each layer's arithmetic equals the engine's score; BundID's and FIT-Connect's access layers in words; every block's two sides and its rule", async () => {
  const { layerSum, overallSum, makeup } = chainModule;
  for (const id of assessedIds()) {
    const r = (await runOf(id)).score.result;
    for (const l of LAYERS) {
      const s = layerSum(r, l);
      if (r.layers[l].score === null) { check.equal(s.value, null, `${id} ${l}: no score, no sum`); continue; }
      const top = s.terms.reduce((a, t) => a + t.level * t.weight, 0);
      check.equal(s.weights, s.terms.reduce((a, t) => a + t.weight, 0));
      check.ok(Math.abs((25 * top) / s.weights - r.layers[l].score) < 1e-9, `${id} ${l}: ${top}/${s.weights}×25 vs ${r.layers[l].score}`);
      for (const t of s.terms) check.equal(t.weight, WEIGHTS[r.blocks.find((b) => b.id === t.id).criticality]);
    }
    const o = overallSum(r);
    check.ok(Math.abs(o.layers.reduce((a, x) => a + x.score, 0) / o.layers.length - r.overall) < 1e-9, `${id}: the mean of the layer scores`);
    for (const b of r.blocks) {
      const m = makeup(b);
      const tech = techLevel(b.tech_class, b.scored?.licence ?? b.licence);
      const op = opLevel(b.operator_class, b.scored?.hosting ?? b.hosting);
      check.equal(m.tech.level, tech, `${id} ${b.id}: maker's level`);
      check.equal(m.op.level, op, `${id} ${b.id}: operator's level`);
      check.equal(m.rule, b.unscored ? "unscored" : tech === null || op === null ? "capped" : "lower", `${id} ${b.id}: rule`);
      if (!b.unscored) check.equal(m.level, b.level);
    }
  }
  for (const a of FIX.arithmetic) {
    const r = (await runOf(a.id)).score.result;
    const s = layerSum(r, a.layer);
    check.equal(Math.round(s.value), a.score, `${a.id} ${a.layer}: score`);
    check.deepEqual(s.terms.map((t) => [t.level, t.weight]), a.terms, `${a.id} ${a.layer}: terms`);
    check.equal(s.weights, a.weights, `${a.id} ${a.layer}: weights`);
  }
  // The words on the score step, in both languages.
  const want = {
    bundid: { en: ["60 = (4 × 3 + 0 × 2) ÷ 5 × 25", "Sign-in page at id.bund.de (critical, level 4)", "AusweisApp on iPhones through the App Store (important, level 0)"], de: ["60 = (4 × 3 + 0 × 2) ÷ 5 × 25", "kritisch, Stufe 4", "wichtig, Stufe 0"] },
    "fit-connect": { en: ["0 = (0 × 2) ÷ 2 × 25", "Java SDK distribution through Maven Central (important, level 0)"], de: ["0 = (0 × 2) ÷ 2 × 25", "wichtig, Stufe 0"] }
  };
  for (const [id, byLang] of Object.entries(want)) {
    for (const lang of ["en", "de"]) {
      const view = story({ run: await runOf(id, lang), lang, mode: "simulation", entry: entryOf(id) });
      const row = view.steps[2].stage.rows.find((x) => x.layer === "access");
      check.ok(row?.sum?.text, `${id} ${lang}: the access layer has its arithmetic`);
      for (const piece of byLang[lang]) check.ok(nb(row.sum.text).includes(piece), `${id} ${lang}: "${piece}" in "${nb(row.sum.text)}"`);
      const lead = nb(view.steps[2].sum?.text || "");
      check.ok(lead.length > 0 && /\d/.test(lead), `${id} ${lang}: the overall score explains itself in one line`);
      for (const b of view.steps[2].stage.rows.flatMap((x) => x.blocks)) {
        check.ok(b.makeup && b.makeup.made && b.makeup.run && b.makeup.rule, `${id} ${lang} ${b.id}: its make-up names both sides and the rule`);
        check.ok(["critical", "important", "supporting"].includes(b.crit) && b.criticality, `${id} ${lang} ${b.id}: criticality in words`);
      }
    }
  }
});

// ---- comparable services --------------------------------------------------------------------------------------------
await group("comparable", "five function groups, this prototype apart; comparable services best first with the engine's scores", async () => {
  const { comparable } = chainModule;
  for (const e of entries()) {
    if (e.category === "self_assessment") check.ok(!e.group || e.group === "self", `${e.id}: the prototype stands apart`);
    else check.ok(GROUPS.includes(e.group), `${e.id}: one of the five groups (${e.group})`);
  }
  const scores = {};
  for (const id of Object.keys(win.SA_RUNS)) {
    const run = await runOf(id);
    scores[id] = run.notService ? { notService: true } : { overall: run.score.result.overall, layers: LAYERS.filter((l) => run.score.result.layers[l].score !== null).length };
  }
  for (const e of entries().filter((x) => win.SA_RUNS[x.id] && x.category !== "self_assessment")) {
    const list = comparable(entries(), scores, e.id);
    const want = entries().filter((x) => x.id !== e.id && x.group === e.group && scores[x.id] && !scores[x.id].notService).map((x) => ({ id: x.id, overall: scores[x.id].overall }))
      .sort((a, b) => b.overall - a.overall || a.id.localeCompare(b.id));
    check.deepEqual(list.map((x) => ({ id: x.id, overall: x.overall })), want, `${e.id}: comparable services`);
  }
  const bundid = comparable(entries(), scores, "bundid");
  check.ok(bundid.length >= 2, "BundID has at least two comparable services");
  for (const lang of ["en", "de"]) {
    const view = story({ run: await runOf("bundid", lang), lang, mode: "simulation", entry: entryOf("bundid"), others: scores });
    const items = view.steps[4].comparable?.items || [];
    check.ok(items.filter((x) => !x.current).length >= 2, `BundID ${lang}: two comparable services on screen`);
    for (const x of items.filter((y) => !y.current)) check.equal(x.score, String(Math.round(scores[x.id].overall)), `BundID ${lang}: ${x.id}'s score`);
  }
});

// ---- starting points ----------------------------------------------------------------------------------------------
await group("starting-points", "the six required cases: every weak block has a sourced starting point or a note of the searches; every list alphabetical", async () => {
  const { weakBlocks } = chainModule;
  for (const id of REQUIRED) {
    check.ok(win.SA_RUNS[id], `${id}: a pre-run`);
    const note = read(`research/${id}.md`);
    const searched = (note.split(/^## Searches without a named alternative/m)[1] || "").split(/^## /m)[0];
    for (const lang of ["en", "de"]) {
      const run = await runOf(id, lang);
      const r = run.score.result;
      const sps = run.levers?.starting_points || [];
      for (const bid of weakBlocks(r)) {
        const mine = sps.filter((s) => s.block_id === bid);
        if (!mine.length) { check.ok(new RegExp(`\\b${bid}\\b`).test(searched), `${id} ${bid}: no starting point and no searches listed in research/${id}.md`); continue; }
        for (const s of mine) {
          check.ok(s.evidence?.length && s.evidence.every((c) => c.url && c.quote && c.verified && /^\d{4}-\d{2}-\d{2}$/.test(c.read_on || "")), `${id} ${bid}: ${s.name} has a source, a verified quote and a read date`);
          check.ok(s.evidence.every((c) => [...c.quote].length <= 150), `${id} ${bid}: quotes of at most 150 characters`);
        }
      }
      const view = story({ run, lang, mode: "simulation", entry: entryOf(id) });
      for (const alt of view.steps[4].alternatives || []) {
        const names = alt.starting.map((s) => s.name);
        const sorted = [...names].sort((a, b) => a.localeCompare(b, lang === "de" ? "de-DE" : "en-GB", { sensitivity: "base" }));
        check.deepEqual(names, sorted, `${id} ${lang} ${alt.block.id}: alphabetical`);
      }
    }
  }
});

// ---- the view computes nothing --------------------------------------------------------------------------------------
await group("view-computes-nothing", "the view modules import neither the engine nor the derived figures (a planted import is caught)", async () => {
  const IMPORTS = /import\s[^;]*from\s+["']\.\/(engine|chain)\.js["']/;
  check.ok(IMPORTS.test('import { score } from "./engine.js";') && IMPORTS.test("import { links } from './chain.js';"), "control: a planted import is caught");
  const views = ["js/view.js", ...["js/overview.js"].filter((f) => fs.existsSync(path.join(APP_ROOT, f)))];
  for (const f of views) check.ok(!IMPORTS.test(read(f)), `${f} imports no figure maker`);
  check.ok(/from "\.\/chain\.js"/.test(read("js/story.js")), "js/story.js takes the derived figures from js/chain.js");
});

// ---- summary ----------------------------------------------------------------------------------------------------------
let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}: ${r.what}${r.ok ? "" : `\n      ${r.error}`}`);
  if (r.ok) console.log(`FIGURES OK ${r.name}`); else failed += 1;
}
if (!results.length) { console.log("No case ran."); process.exit(1); }
if (failed) { console.log(`\n${failed} of ${results.length} cases failed.`); process.exit(1); }
if (ONLY.length === 0) console.log("FIGURES OK");
process.exit(0);
