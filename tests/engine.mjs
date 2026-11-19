// The engine against the golden cases (brief §11; AC-01 and AC-03): S1 to S4 from tests/fixtures/, raw
// values within 1e-9 of the exact fractions and every display string in en-GB and de-DE; the origin
// classes; no data is not zero; ties; layer weights; the fact keys and their rendering.
// Usage: node tests/engine.mjs            (every group)
//        node tests/engine.mjs classes s2 (only the named groups)
import assert from "node:assert/strict";
import { ONLY, wanted } from "./lib/harness.mjs";
import { fixture, near, plain, blockFromRow } from "./lib/fixtures.mjs";
import { classOf, partyClass, EU_OTHER, CLASSES } from "../js/classes.js";
import { LAYERS, blockLevel, assessBlock, score, whatIf, applyChanges, portfolio } from "../js/engine.js";
import { formatFact, renderFacts, factKind } from "../js/facts.js";
import { fmtScore, fmtShare, fmtDelta } from "../js/format.js";

const results = [];
// Every assertion is counted, so the report says how many checks each group made.
let count = 0;
const check = new Proxy(assert, { get: (target, prop) => (typeof target[prop] === "function" ? (...args) => { count += 1; return target[prop](...args); } : target[prop]) });
function group(name, what, fn) {
  if (!wanted(name)) return;
  count = 0;
  try {
    fn();
    results.push({ name, ok: true, what: `${what} (${count} ${count === 1 ? "check" : "checks"})` });
  } catch (e) {
    results.push({ name, ok: false, what, error: e.message.split("\n").slice(0, 6).join(" | ") });
  }
}
const both = (fn) => ({ en: plain(fn("en")), de: plain(fn("de")) });

// ---- S1: the level rules -------------------------------------------------------------------------
group("s1", "S1: the thirteen level rules R01 to R13", () => {
  const { cases } = fixture("s1-levels.json");
  check.equal(cases.length, 13);
  for (const c of cases) {
    const b = assessBlock(blockFromRow(c));
    check.equal(b.level, c.expected.level, `${c.id} level`);
    check.equal(b.partly_unknown, !!c.expected.partly_unknown, `${c.id} partly unknown`);
    check.equal(b.unscored, !!c.expected.unscored, `${c.id} unscored`);
    const direct = blockLevel(classOf(c.made_in), c.licence, classOf(c.run_by), c.hosting);
    check.equal(direct.level, c.expected.level, `${c.id} via blockLevel`);
  }
});

// ---- S2: a whole assessment ---------------------------------------------------------------------------
group("s2", "S2: Musterdienst, every layer score, the overall score, coverage, exclusive non-EU control, weakest link, gaps and counts, in both languages", () => {
  const s2 = fixture("s2-assessment.json");
  const blocks = s2.blocks.map(blockFromRow);
  const r = score(blocks);
  const e = s2.expected;
  for (const layer of LAYERS) {
    const x = e.layers[layer];
    check.ok(near(r.layers[layer].score, x.exact), `${layer}: ${r.layers[layer].score} vs ${x.exact}`);
    check.deepEqual(both((l) => fmtScore(r.layers[layer].score, l)), { en: x.en, de: x.de }, `${layer} display`);
    check.ok(near(r.facts[`score.layer.${layer}`], x.exact), `${layer} fact`);
  }
  check.ok(near(r.overall, e.overall.exact), `overall ${r.overall}`);
  check.deepEqual(both((l) => formatFact("score.overall", r.facts["score.overall"], l)), { en: e.overall.en, de: e.overall.de });
  check.ok(near(r.coverage, e.coverage.exact), `coverage ${r.coverage}`);
  check.deepEqual(both((l) => formatFact("coverage", r.facts.coverage, l)), { en: e.coverage.en, de: e.coverage.de });
  check.ok(near(r.exclusive_non_eu, e.exclusive_non_eu.exact), `exclusive ${r.exclusive_non_eu}`);
  check.deepEqual(both((l) => formatFact("share.exclusive_non_eu", r.facts["share.exclusive_non_eu"], l)), { en: e.exclusive_non_eu.en, de: e.exclusive_non_eu.de });
  check.deepEqual(r.weakest, { block_id: e.weakest.block, level: e.weakest.level, ties: e.weakest.ties });
  check.deepEqual(r.blocks.filter((b) => b.unscored).map((b) => b.id), e.unscored);
  check.deepEqual(r.blocks.filter((b) => b.partly_unknown).map((b) => b.id), e.partly_unknown);
  check.deepEqual(r.counts.made_in.all, e.made_in_all);
  check.deepEqual(r.counts.made_in.critical, e.made_in_critical);
  check.deepEqual(r.counts.run_by.all, e.run_by_all);
  for (const c of CLASSES) check.equal(r.facts[`count.made_in.${c}`], e.made_in_all[c], `count.made_in.${c}`);
});

// ---- S3: levers -----------------------------------------------------------------------------------
group("s3", "S3: levers L1 and L2, overall, change, weakest link and exclusive control; the assessment unchanged", () => {
  const s2 = fixture("s2-assessment.json");
  const { levers } = fixture("s3-levers.json");
  const blocks = s2.blocks.map(blockFromRow);
  const before = JSON.stringify(blocks);
  const baseFacts = JSON.stringify(score(blocks).facts);
  for (const lever of levers) {
    const w = whatIf(blocks, lever.lever_id, lever.changes);
    const x = lever.expected;
    const p = `whatif.${lever.lever_id}`;
    check.ok(near(w.result.overall, x.overall.exact), `${lever.lever_id} overall ${w.result.overall}`);
    check.ok(near(w.delta, x.delta.exact), `${lever.lever_id} delta ${w.delta}`);
    check.deepEqual(both((l) => formatFact(`${p}.overall`, w.facts[`${p}.overall`], l)), { en: x.overall.en, de: x.overall.de });
    check.deepEqual(both((l) => formatFact(`${p}.delta`, w.facts[`${p}.delta`], l)), { en: x.delta.en, de: x.delta.de });
    check.equal(w.facts[`${p}.weakest.block`], x.weakest.block);
    check.equal(w.facts[`${p}.weakest.level`], x.weakest.level);
    check.ok(near(w.facts[`${p}.exclusive_non_eu`], x.exclusive_non_eu.exact));
    check.deepEqual(w.unknown_blocks, []);
  }
  check.equal(JSON.stringify(blocks), before, "the blocks passed in are unchanged after both what-ifs");
  check.equal(JSON.stringify(score(blocks).facts), baseFacts, "the assessment's figures are unchanged after both what-ifs");
  check.deepEqual(applyChanges(blocks, [{ block_id: "B-99", hosting: "EU" }]).unknown, ["B-99"], "an unknown block id is reported");
});

// ---- S4: portfolio -----------------------------------------------------------------------------------
group("s4", "S4: portfolio, exclusive non-EU control per category pooled over the scored critical blocks", () => {
  const s4 = fixture("s4-portfolio.json");
  const s2 = fixture("s2-assessment.json");
  const assessments = s4.assessments.map((a) => ({
    service: a.service, category: a.category,
    blocks: (a.from ? s2.blocks : a.blocks).map(blockFromRow)
  }));
  for (const [i, a] of assessments.entries()) {
    const levels = score(a.blocks).blocks.filter((b) => !b.unscored && b.criticality === "critical").map((b) => b.level);
    check.deepEqual([...levels].sort(), [...s4.assessments[i].critical_levels].sort(), `${a.service}: critical levels`);
  }
  const p = portfolio(assessments);
  for (const [cat, x] of Object.entries(s4.expected)) {
    const c = p.categories[cat];
    check.equal(`${c.exclusive} of ${c.critical}`, x.count, `${cat} count`);
    check.ok(near(c.exclusive_non_eu, x.exact), `${cat} share ${c.exclusive_non_eu}`);
    check.deepEqual(both((l) => formatFact(`portfolio.${cat}.exclusive_non_eu`, p.facts[`portfolio.${cat}.exclusive_non_eu`], l)), { en: x.en, de: x.de });
  }
  // The self-assessment stays out of the portfolio.
  const withSelf = portfolio([...assessments, { service: "this prototype", category: "self_assessment", blocks: s2.blocks.map(blockFromRow) }]);
  check.equal(Object.keys(withSelf.categories).includes("self_assessment"), false);
});

// ---- Classes (AC-03) -------------------------------------------------------------------------------
group("classes", "origin classes: the 26 other EU states, DE, US, CN with HK and MO, OTHER, UNKNOWN, the ultimate-parent rule, public bodies and open source without a steward", () => {
  check.equal(EU_OTHER.length, 26);
  check.equal(new Set(EU_OTHER).size, 26);
  check.ok(!EU_OTHER.includes("DE"));
  for (const c of EU_OTHER) { check.equal(classOf(c), "EU", c); }
  check.equal(classOf("DE"), "DE");
  check.equal(classOf("US"), "US");
  for (const c of ["CN", "HK", "MO"]) check.equal(classOf(c), "CN", c);
  for (const c of ["CH", "GB", "NO", "IS", "LI", "JP", "IN", "CA", "IL", "KR", "TW", "RU", "UA", "TR"]) { check.equal(classOf(c), "OTHER", c); }
  for (const c of ["UNKNOWN", "", null, undefined, "D", "DEU", "12", "U S"]) { check.equal(classOf(c), "UNKNOWN", String(c)); }
  check.equal(classOf("fr"), "EU", "lower case");
  check.equal(classOf(" nl "), "EU", "spaces");
  check.equal(classOf("EL"), "EU", "EL, the EU's code for Greece");
  check.equal(classOf("UK"), "OTHER", "UK, reserved for the United Kingdom");
  check.equal(classOf("EU"), "EU", "EU, the Union's own bodies");
  // The ultimate-parent rule: a German subsidiary of a US company is US, and the reverse.
  check.equal(partyClass({ name: "A GmbH", country: "DE", parent: { name: "A Inc.", country: "US" } }), "US");
  check.equal(partyClass({ name: "B Inc.", country: "US", parent: { name: "B AG", country: "DE" } }), "DE");
  check.equal(partyClass({ name: "C SAS", country: "FR", parent: null }), "EU");
  check.equal(partyClass({ name: "D Ltd", country: "IE", parent: { name: "D Group", country: "UNKNOWN" } }), "UNKNOWN", "a recorded parent without a country is UNKNOWN");
  check.equal(partyClass(null), "UNKNOWN");
  // A German public body or public IT provider is recorded with country DE.
  check.equal(partyClass({ name: "A federal IT service provider", country: "DE", parent: null }), "DE");
  // An open-source project without an identifiable steward is recorded with country UNKNOWN: no
  // technology level, so the block is partly unknown and capped at 2 (or unscored).
  const oss = assessBlock({ id: "B-01", layer: "platform", criticality: "critical", tech: { name: "A project without a steward", country: "UNKNOWN", parent: null }, operator: { name: "An operator", country: "DE", parent: null }, hosting: "EU", licence: "open_source" });
  check.equal(oss.tech_class, "UNKNOWN");
  check.equal(oss.level, 2);
  check.equal(oss.partly_unknown, true);
  // Made in is the technology provider's class, Run by the operator's.
  const b = assessBlock({ id: "B-02", layer: "access", criticality: "important", tech: { name: "T", country: "US", parent: null }, operator: { name: "O", country: "AT", parent: null }, hosting: "EU", licence: "proprietary" });
  check.deepEqual([b.tech_class, b.operator_class, b.level], ["US", "EU", 2]);
});

// ---- No data is not zero ----------------------------------------------------------------------------
group("nodata", "no data is not zero: figures without a basis are null and show as no data, never 0", () => {
  const empty = score([]);
  for (const k of ["score.overall", "coverage", "share.exclusive_non_eu", "weakest.block", "weakest.level"]) check.equal(empty.facts[k], null, k);
  for (const layer of LAYERS) check.equal(empty.layers[layer].score, null);
  check.deepEqual(both((l) => formatFact("score.overall", null, l)), { en: "no data", de: "keine Daten" });
  check.deepEqual(both((l) => fmtShare(undefined, l)), { en: "no data", de: "keine Daten" });
  // A layer with only an unscored block has no score and is "no evidence found"; one the agent marked
  // "not applicable" says so; neither enters the overall score.
  const blocks = [
    { id: "B-01", layer: "infrastructure", criticality: "critical", tech: { name: "x", country: "UNKNOWN", parent: null }, operator: { name: "y", country: "UNKNOWN", parent: null }, hosting: "UNKNOWN", licence: "unknown" },
    { id: "B-02", layer: "access", criticality: "supporting", tech: { name: "x", country: "DE", parent: null }, operator: { name: "y", country: "DE", parent: null }, hosting: "EU", licence: "proprietary" }
  ];
  const r = score(blocks, { layerStatus: { platform: "not_applicable" } });
  check.equal(r.layers.infrastructure.score, null);
  check.equal(r.layers.infrastructure.status, "no_evidence");
  check.equal(r.layers.platform.status, "not_applicable");
  check.equal(r.layers.devsecops.status, "open");
  check.equal(r.overall, 100, "the overall score is the mean of the existing layer scores only");
  check.equal(r.weakest, null, "no scored critical block: no weakest link");
  check.equal(r.exclusive_non_eu, null, "no scored critical block: no share");
  check.ok(near(r.coverage, "1/4"));
});

// ---- Weakest link ties -------------------------------------------------------------------------------
group("ties", "weakest critical link: ties go to the first in layer order, then by block id, and are counted", () => {
  const mk = (id, layer, country, hosting) => ({ id, layer, criticality: "critical", tech: { name: "t", country, parent: null }, operator: { name: "o", country, parent: null }, hosting, licence: "proprietary" });
  const r = score([mk("B-05", "access", "US", "NON_EU"), mk("B-02", "platform", "US", "NON_EU"), mk("B-01", "platform", "US", "NON_EU"), mk("B-09", "infrastructure", "DE", "EU")]);
  check.deepEqual(r.weakest, { block_id: "B-01", level: 0, ties: 2 });
});

// ---- Layer weights ---------------------------------------------------------------------------------------
group("weights", "layer weights: the overall score follows a person's weights; zero weights leave no basis", () => {
  const s2 = fixture("s2-assessment.json");
  const blocks = s2.blocks.map(blockFromRow);
  const weights = { infrastructure: 2, devsecops: 1, platform: 1, base_service: 1, applications: 1, access: 0 };
  const r = score(blocks, { layerWeights: weights });
  const expected = (2 * 175 / 4 + 100 + 65 + 100 + 375 / 4) / 6;
  check.ok(Math.abs(r.overall - expected) <= 1e-9, `${r.overall} vs ${expected}`);
  const zero = score(blocks, { layerWeights: Object.fromEntries(LAYERS.map((l) => [l, 0])) });
  check.equal(zero.overall, null);
});

// ---- Fact keys and rendering ---------------------------------------------------------------------------
group("facts", "fact keys of the engine and their rendering in both languages", () => {
  const s2 = fixture("s2-assessment.json");
  const r = score(s2.blocks.map(blockFromRow));
  for (const k of ["score.overall", "score.layer.access", "seal.B-03", "coverage", "share.exclusive_non_eu", "weakest.block", "weakest.level", "weakest.ties", "count.made_in.US", "count.made_in.critical.US", "count.run_by.DE", "count.run_by.critical.US"]) {
    check.ok(Object.hasOwn(r.facts, k), `fact ${k}`);
    check.notEqual(factKind(k), "unknown", `kind of ${k}`);
  }
  check.equal(factKind("whatif.L1.delta"), "delta");
  check.equal(factKind("portfolio.base_service.exclusive_non_eu"), "share");
  check.equal(factKind("nonsense"), "unknown");
  check.deepEqual(both((l) => renderFacts("The overall score is {{fact:score.overall}}; B-03 stands at {{fact:seal.B-03}}; coverage {{fact:coverage}}.", r.facts, l)), {
    en: "The overall score is 72; B-03 stands at level 4; coverage 92%.",
    de: "The overall score is 72; B-03 stands at Stufe 4; coverage 92 %."
  });
  check.equal(renderFacts("{{fact:coverage.critical}}", r.facts, "en"), "{{fact:coverage.critical}}", "an unknown key stays as written");
  check.deepEqual(both((l) => fmtDelta(0.3, l)), { en: "0", de: "0" }, "a change that rounds to zero has no sign");
  check.deepEqual(both((l) => fmtDelta(-3.2, l)), { en: "-3", de: "-3" });
});

// ---- Report -------------------------------------------------------------------------------------------
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}: ${r.what}`);
  if (!r.ok) console.log(`      ${r.error}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} engine groups passed.`);
if (!failed && results.length && ONLY.length === 0) console.log("ENGINE OK");
process.exit(failed || !results.length ? 1 : 0);
