// The method's self-test: the golden cases of the brief (section 11) recomputed by this engine and this
// fact audit, wherever they run. Diagnostics runs it in the presenter's browser on data/golden.js (a copy
// of tests/fixtures/ that tools/golden.mjs writes and tests/unit.mjs keeps equal to them); the Node
// suites use the same helpers through tests/lib/fixtures.mjs. Values compare within 1e-9 of the exact
// fractions, display strings in both languages with non-breaking spaces as normal ones.

import { LAYERS, assessBlock, blockLevel, score, whatIf, portfolio } from "./engine.js";
import { classOf } from "./classes.js";
import { formatFact, auditText } from "./facts.js";
import { fmtScore } from "./format.js";

/** "865/12" → 72.083…, "100" → 100. */
export function fraction(text) {
  const [n, d = "1"] = String(text).split("/");
  return Number(n) / Number(d);
}

/** Within 1e-9 of the exact fraction. */
export function near(value, exact) {
  return typeof value === "number" && Math.abs(value - fraction(exact)) <= 1e-9;
}

/** Display strings compare after non-breaking spaces become normal spaces (brief §6.5). */
export function plain(text) {
  return String(text).replace(/[  ]/g, " ");
}

/**
 * A fixture row ({ id, layer?, criticality?, made_in, licence, run_by, hosting }) as a recorded block:
 * Made in and Run by are countries (or UNKNOWN), so they become the technology provider's and the
 * operator's country. The names are ids: no golden block is ever shown.
 */
export function blockFromRow(row, i = 0) {
  const id = row.id && /^B-\d{2}$/.test(row.id) ? row.id : `B-${String(i + 1).padStart(2, "0")}`;
  return {
    id,
    layer: row.layer || "platform",
    name: id,
    role: "",
    note: "",
    criticality: row.criticality || "critical",
    tech: { name: `${id}.tech`, country: row.made_in, parent: null },
    operator: { name: `${id}.operator`, country: row.run_by, parent: null },
    hosting: row.hosting,
    licence: row.licence,
    exit: "unknown",
    evidence: [],
    confidence: "high"
  };
}

/** JSON with sorted keys, so two objects compare by content. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  return JSON.stringify(value);
}
const same = (a, b) => canonical(a) === canonical(b);

/** A group of checks: ok(condition, id) counts one check and remembers the ids of those that failed. */
function group(id) {
  const g = { id, total: 0, passed: 0, failures: [] };
  g.ok = (condition, label) => {
    g.total += 1;
    if (condition) g.passed += 1;
    else g.failures.push(label);
    return condition;
  };
  return g;
}
const both = (fn) => ({ en: plain(fn("en")), de: plain(fn("de")) });

/** The golden files by name: { "s1-levels.json": …, … } (data/golden.js, or the fixtures read from disk). */
export function goldenChecks(golden) {
  const file = (name) => golden?.[name];
  const groups = [];
  const run = (id, fn) => {
    const g = group(id);
    try {
      fn(g);
    } catch (e) {
      g.total += 1;
      g.failures.push(`${id}: ${e?.message || e}`);
    }
    groups.push({ id: g.id, total: g.total, passed: g.passed, failures: g.failures });
  };

  run("s1", (g) => {
    const cases = file("s1-levels.json").cases;
    g.ok(cases.length === 13, "s1.rows");
    for (const c of cases) {
      const b = assessBlock(blockFromRow(c));
      g.ok(b.level === c.expected.level, `${c.id}.level`);
      g.ok(b.partly_unknown === !!c.expected.partly_unknown, `${c.id}.partly_unknown`);
      g.ok(b.unscored === !!c.expected.unscored, `${c.id}.unscored`);
      g.ok(blockLevel(classOf(c.made_in), c.licence, classOf(c.run_by), c.hosting).level === c.expected.level, `${c.id}.block_level`);
    }
  });

  run("s2", (g) => {
    const s2 = file("s2-assessment.json");
    const r = score(s2.blocks.map(blockFromRow));
    const e = s2.expected;
    for (const layer of LAYERS) {
      const x = e.layers[layer];
      g.ok(near(r.layers[layer].score, x.exact), `${layer}.score`);
      g.ok(same(both((l) => fmtScore(r.layers[layer].score, l)), { en: x.en, de: x.de }), `${layer}.display`);
    }
    g.ok(near(r.overall, e.overall.exact), "overall");
    g.ok(same(both((l) => formatFact("score.overall", r.facts["score.overall"], l)), { en: e.overall.en, de: e.overall.de }), "overall.display");
    g.ok(near(r.coverage, e.coverage.exact), "coverage");
    g.ok(same(both((l) => formatFact("coverage", r.facts.coverage, l)), { en: e.coverage.en, de: e.coverage.de }), "coverage.display");
    g.ok(near(r.exclusive_non_eu, e.exclusive_non_eu.exact), "exclusive_non_eu");
    g.ok(same(both((l) => formatFact("share.exclusive_non_eu", r.facts["share.exclusive_non_eu"], l)), { en: e.exclusive_non_eu.en, de: e.exclusive_non_eu.de }), "exclusive_non_eu.display");
    g.ok(same(r.weakest, { block_id: e.weakest.block, level: e.weakest.level, ties: e.weakest.ties }), "weakest");
    g.ok(same(r.blocks.filter((b) => b.unscored).map((b) => b.id), e.unscored), "unscored");
    g.ok(same(r.blocks.filter((b) => b.partly_unknown).map((b) => b.id), e.partly_unknown), "partly_unknown");
    g.ok(same(r.counts.made_in.all, e.made_in_all), "made_in.all");
    g.ok(same(r.counts.made_in.critical, e.made_in_critical), "made_in.critical");
    g.ok(same(r.counts.run_by.all, e.run_by_all), "run_by.all");
  });

  run("s3", (g) => {
    const blocks = file("s2-assessment.json").blocks.map(blockFromRow);
    const before = JSON.stringify(blocks);
    for (const lever of file("s3-levers.json").levers) {
      const w = whatIf(blocks, lever.lever_id, lever.changes);
      const x = lever.expected;
      const p = `whatif.${lever.lever_id}`;
      g.ok(near(w.result.overall, x.overall.exact), `${lever.lever_id}.overall`);
      g.ok(near(w.delta, x.delta.exact), `${lever.lever_id}.delta`);
      g.ok(same(both((l) => formatFact(`${p}.overall`, w.facts[`${p}.overall`], l)), { en: x.overall.en, de: x.overall.de }), `${lever.lever_id}.overall.display`);
      g.ok(same(both((l) => formatFact(`${p}.delta`, w.facts[`${p}.delta`], l)), { en: x.delta.en, de: x.delta.de }), `${lever.lever_id}.delta.display`);
      g.ok(w.facts[`${p}.weakest.block`] === x.weakest.block && w.facts[`${p}.weakest.level`] === x.weakest.level, `${lever.lever_id}.weakest`);
      g.ok(near(w.facts[`${p}.exclusive_non_eu`], x.exclusive_non_eu.exact), `${lever.lever_id}.exclusive_non_eu`);
    }
    g.ok(JSON.stringify(blocks) === before, "s3.unchanged");
  });

  run("s4", (g) => {
    const s2 = file("s2-assessment.json");
    const s4 = file("s4-portfolio.json");
    const assessments = s4.assessments.map((a) => ({ service: a.service, category: a.category, blocks: (a.from ? s2.blocks : a.blocks).map(blockFromRow) }));
    const p = portfolio(assessments);
    for (const [cat, x] of Object.entries(s4.expected)) {
      const c = p.categories[cat];
      g.ok(`${c?.exclusive} of ${c?.critical}` === x.count, `${cat}.count`);
      g.ok(near(c?.exclusive_non_eu, x.exact), `${cat}.share`);
      g.ok(same(both((l) => formatFact(`portfolio.${cat}.exclusive_non_eu`, p.facts[`portfolio.${cat}.exclusive_non_eu`], l)), { en: x.en, de: x.de }), `${cat}.display`);
    }
  });

  const audit = (g, cases, fx) => {
    const ctx = { facts: fx.facts, evidence: fx.evidence };
    for (const c of cases) {
      const r = auditText(c.text, ctx);
      const x = c.expected;
      g.ok(r.pass === x.pass && same(r.tokens, x.tokens || []) && same(r.unknownFacts, x.unknown_facts || []), c.id);
    }
  };
  run("audit", (g) => {
    const fx = file("f-audit.json");
    audit(g, [...fx.cases, ...fx.nbsp_variants.cases], fx);
  });
  run("decisions", (g) => {
    const fx = file("f-audit.json");
    audit(g, fx.decisions.cases, fx);
  });

  return groups;
}

