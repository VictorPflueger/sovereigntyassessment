// The engine: every level, score and share of an assessment, computed in code (brief §6.4 and §6.5;
// PLAN.md c.2 to c.4). Pure functions of the blocks, the layer weights and the layers' statuses, shared
// by the browser, the Node tests and tools/check-runs.mjs. It computes at full precision; only the
// display rounds, with Intl (js/facts.js). The model never writes a figure: it cites the fact keys this
// module returns.
//
// A block here is a block as the agent records it (brief §10): layer, criticality, tech and operator
// ({ name, country, parent }), hosting (EU, NON_EU, UNKNOWN) and licence (open_source, proprietary,
// unknown), with every field already gated by its evidence (a field without a verified quote arrives as
// its unknown; js/evidence.js does that from version 0.2.0). A what-if's change sets a block's Made-in or
// Run-by class directly (`class_override`), never a company.

import { CLASSES, partyClass, isEuropean, isNonEu } from "./classes.js";

export const METHOD_VERSION = "1.0";

/** The six technical layers of the Deutschland-Stack, in the portal's order (brief §6.1). */
export const LAYERS = Object.freeze(["infrastructure", "devsecops", "platform", "base_service", "applications", "access"]);

/** Weights by criticality (brief §6.5). */
export const WEIGHTS = Object.freeze({ critical: 3, important: 2, supporting: 1 });

/** Equal layer weights, the default for the overall score. */
export const EQUAL_LAYER_WEIGHTS = Object.freeze(Object.fromEntries(LAYERS.map((l) => [l, 1])));

/**
 * Technology level from the Made-in class and the licence: made in DE or EU gives 4; made in US, CN or
 * OTHER gives 3 when open source and 2 when proprietary or of unknown licence; made in UNKNOWN gives none.
 */
export function techLevel(madeIn, licence) {
  if (isEuropean(madeIn)) return 4;
  if (isNonEu(madeIn)) return licence === "open_source" ? 3 : 2;
  return null;
}

/**
 * Operation level from the Run-by class and the hosting region: run by DE or EU gives 4; run by US, CN
 * or OTHER gives 1 when hosted in the EU and 0 when hosted outside the EU or in an unknown region; run by
 * UNKNOWN gives none.
 */
export function opLevel(runBy, hosting) {
  if (isEuropean(runBy)) return 4;
  if (isNonEu(runBy)) return hosting === "EU" ? 1 : 0;
  return null;
}

/**
 * Block level: the lower of the two. If exactly one of them is none, the other one, capped at 2, and the
 * block is "partly unknown". If both are none, the block is unscored and counts as a gap.
 */
export function blockLevel(madeIn, licence, runBy, hosting) {
  const tech = techLevel(madeIn, licence);
  const op = opLevel(runBy, hosting);
  if (tech === null && op === null) return { level: null, tech, op, partly_unknown: false, unscored: true };
  if (tech === null || op === null) return { level: Math.min(tech ?? op, 2), tech, op, partly_unknown: true, unscored: false };
  return { level: Math.min(tech, op), tech, op, partly_unknown: false, unscored: false };
}

/** A block with the fields code adds: tech_class, operator_class, level, partly_unknown, unscored. */
export function assessBlock(block) {
  const override = block.class_override || {};
  const techClass = CLASSES.includes(override.tech) ? override.tech : partyClass(block.tech);
  const operatorClass = CLASSES.includes(override.operator) ? override.operator : partyClass(block.operator);
  const r = blockLevel(techClass, block.licence, operatorClass, block.hosting);
  return { ...block, tech_class: techClass, operator_class: operatorClass, level: r.level, partly_unknown: r.partly_unknown, unscored: r.unscored };
}

const weightOf = (b) => WEIGHTS[b.criticality] ?? 0;
const layerIndex = (l) => { const i = LAYERS.indexOf(l); return i < 0 ? LAYERS.length : i; };
const byLayerThenId = (a, b) => layerIndex(a.layer) - layerIndex(b.layer) || String(a.id).localeCompare(String(b.id));
const zeroCounts = () => Object.fromEntries(CLASSES.map((c) => [c, 0]));

/**
 * Scores of an assessment (brief §6.5). blocks: the recorded blocks; options.layerWeights: the overall
 * score's weights per layer (equal by default; a person may change them in the method panel);
 * options.layerStatus: { layer: "no_evidence" | "not_applicable" } as the agent recorded them.
 * Returns the assessed blocks, per-layer scores, the overall score, the weakest critical link, evidence
 * coverage, exclusive non-EU control, the Made-in and Run-by counts, and every figure under its fact key.
 * A figure without a basis is null ("no data"), never 0.
 */
export function score(blocks, { layerWeights = EQUAL_LAYER_WEIGHTS, layerStatus = {} } = {}) {
  const assessed = (blocks || []).map(assessBlock);
  const scored = assessed.filter((b) => !b.unscored);

  // Layer score: 25 × the weighted mean level of the layer's scored blocks.
  const layers = {};
  for (const layer of LAYERS) {
    const inLayer = assessed.filter((b) => b.layer === layer);
    const sc = inLayer.filter((b) => !b.unscored);
    const w = sc.reduce((s, b) => s + weightOf(b), 0);
    const value = sc.length && w > 0 ? (25 * sc.reduce((s, b) => s + weightOf(b) * b.level, 0)) / w : null;
    layers[layer] = {
      score: value,
      status: value !== null ? "scored" : layerStatus[layer] || (inLayer.length ? "no_evidence" : "open"),
      blocks: inLayer.length,
      scored: sc.length
    };
  }

  // Overall: the weighted mean of the existing layer scores (equal weights by default).
  const withScore = LAYERS.filter((l) => layers[l].score !== null);
  const lw = (l) => Math.max(0, Number(layerWeights?.[l] ?? 1));
  const wSum = withScore.reduce((s, l) => s + lw(l), 0);
  const overall = withScore.length && wSum > 0 ? withScore.reduce((s, l) => s + lw(l) * layers[l].score, 0) / wSum : null;

  // Weakest critical link: the lowest level among scored critical blocks; ties by layer order, then id.
  const critical = scored.filter((b) => b.criticality === "critical");
  let weakest = null;
  if (critical.length) {
    const lowest = Math.min(...critical.map((b) => b.level));
    const atLowest = critical.filter((b) => b.level === lowest).sort(byLayerThenId);
    weakest = { block_id: atLowest[0].id, level: lowest, ties: atLowest.length - 1 };
  }

  // Evidence coverage: the weight of scored blocks over the weight of all blocks.
  const wAll = assessed.reduce((s, b) => s + weightOf(b), 0);
  const coverage = wAll > 0 ? scored.reduce((s, b) => s + weightOf(b), 0) / wAll : null;

  // Exclusive non-EU control: the share of scored critical blocks at level 0 or 1.
  const exclusiveNonEu = critical.length ? critical.filter((b) => b.level <= 1).length / critical.length : null;

  // Made in and Run by: counts of blocks per class, for all blocks and for critical blocks.
  const counts = { made_in: { all: zeroCounts(), critical: zeroCounts() }, run_by: { all: zeroCounts(), critical: zeroCounts() } };
  for (const b of assessed) {
    counts.made_in.all[b.tech_class] += 1;
    counts.run_by.all[b.operator_class] += 1;
    if (b.criticality === "critical") {
      counts.made_in.critical[b.tech_class] += 1;
      counts.run_by.critical[b.operator_class] += 1;
    }
  }

  const facts = {
    "score.overall": overall,
    coverage,
    "share.exclusive_non_eu": exclusiveNonEu,
    "weakest.block": weakest ? weakest.block_id : null,
    "weakest.level": weakest ? weakest.level : null,
    "weakest.ties": weakest ? weakest.ties : null
  };
  for (const layer of LAYERS) facts[`score.layer.${layer}`] = layers[layer].score;
  for (const b of assessed) facts[`seal.${b.id}`] = b.level;
  for (const c of CLASSES) {
    facts[`count.made_in.${c}`] = counts.made_in.all[c];
    facts[`count.made_in.critical.${c}`] = counts.made_in.critical[c];
    facts[`count.run_by.${c}`] = counts.run_by.all[c];
    facts[`count.run_by.critical.${c}`] = counts.run_by.critical[c];
  }

  return { method_version: METHOD_VERSION, blocks: assessed, layers, overall, weakest, coverage, exclusive_non_eu: exclusiveNonEu, counts, facts };
}

/**
 * A lever's changes applied to a copy of the blocks: [{ block_id, made_in?, run_by?, hosting?, licence? }],
 * made_in and run_by as classes. The blocks passed in are never changed. Unknown block ids are reported.
 */
export function applyChanges(blocks, changes) {
  const copy = structuredClone(blocks || []);
  const unknown = [];
  for (const c of changes || []) {
    const b = copy.find((x) => x.id === c.block_id);
    if (!b) { unknown.push(c.block_id); continue; }
    const override = { ...(b.class_override || {}) };
    if (c.made_in) override.tech = c.made_in;
    if (c.run_by) override.operator = c.run_by;
    if (Object.keys(override).length) b.class_override = override;
    if (c.hosting) b.hosting = c.hosting;
    if (c.licence) b.licence = c.licence;
  }
  return { blocks: copy, unknown };
}

/**
 * Lever what-if: the same computation on a copy of the blocks with the lever's changes applied. Returns
 * the what-if's result and its facts under whatif.<lever>.*; the assessment itself never changes.
 */
export function whatIf(blocks, leverId, changes, options = {}) {
  const base = score(blocks, options);
  const { blocks: changed, unknown } = applyChanges(blocks, changes);
  const result = score(changed, options);
  const delta = result.overall !== null && base.overall !== null ? result.overall - base.overall : null;
  const p = `whatif.${leverId}`;
  const facts = {
    [`${p}.overall`]: result.overall,
    [`${p}.delta`]: delta,
    [`${p}.weakest.block`]: result.weakest ? result.weakest.block_id : null,
    [`${p}.weakest.level`]: result.weakest ? result.weakest.level : null,
    [`${p}.weakest.ties`]: result.weakest ? result.weakest.ties : null,
    [`${p}.exclusive_non_eu`]: result.exclusive_non_eu
  };
  return { lever_id: leverId, result, delta, unknown_blocks: unknown, facts };
}

/**
 * Portfolio across loaded assessments (brief §6.5; PLAN.md I11): per category, the share of scored
 * critical blocks at level 0 or 1, pooled over the blocks (not a mean of the services' shares), the
 * Made-in mix, and the overall scores. assessments: [{ service, category, blocks }]. The category
 * "self_assessment" stays out.
 */
export function portfolio(assessments, options = {}) {
  const categories = {};
  for (const a of assessments || []) {
    if (!a || a.category === "self_assessment") continue;
    const r = score(a.blocks, options);
    const cat = categories[a.category] || (categories[a.category] = { critical: 0, exclusive: 0, made_in: zeroCounts(), services: [] });
    const crit = r.blocks.filter((b) => !b.unscored && b.criticality === "critical");
    cat.critical += crit.length;
    cat.exclusive += crit.filter((b) => b.level <= 1).length;
    for (const c of CLASSES) cat.made_in[c] += r.counts.made_in.all[c];
    cat.services.push({ service: a.service, overall: r.overall });
  }
  const facts = {};
  for (const [name, cat] of Object.entries(categories)) {
    cat.exclusive_non_eu = cat.critical ? cat.exclusive / cat.critical : null;
    cat.services.sort((x, y) => (y.overall ?? -1) - (x.overall ?? -1));
    facts[`portfolio.${name}.exclusive_non_eu`] = cat.exclusive_non_eu;
  }
  return { categories, facts };
}
