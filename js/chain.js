// The figures version 2.1.0 shows beside the engine's, derived from score()'s result alone: the lowest
// level in the chain and the blocks below the weakest critical link, the critical blocks no source could
// score, each block's make-up, each layer's arithmetic and the overall mean, the blocks that need an
// alternative, and the comparable services of a function group. js/engine.js stays as it is: these read
// its result and change no rule (method 1.0). Pure module, shared by the page and the tests; it computes,
// js/story.js words, js/view.js draws.

import { LAYERS, WEIGHTS, techLevel, opLevel } from "./engine.js";

const layerAt = (l) => { const i = LAYERS.indexOf(l); return i < 0 ? LAYERS.length : i; };
/** Lowest level first, then the layers' order, then the block id. */
export const byLevel = (a, b) => a.level - b.level || layerAt(a.layer) - layerAt(b.layer) || String(a.id).localeCompare(String(b.id));
const byLayer = (a, b) => layerAt(a.layer) - layerAt(b.layer) || String(a.id).localeCompare(String(b.id));
const isScored = (b) => !b.unscored && b.level !== null && b.level !== undefined;

/**
 * The links of the chain: { weakest, lowest, lower, unknownCritical, noWeak }.
 * weakest: the engine's weakest critical link { id, level, ties }, or null without a scored critical block.
 * lowest: the lowest scored level { id, level, critical }, a critical block first on a tie.
 * lower: the scored blocks below the weakest critical link, lowest first; none of them is critical.
 * unknownCritical: the ids of critical blocks whose maker and operator no source names.
 * noWeak: nothing lower and nothing unknown.
 */
export function links(result) {
  if (!result) return null;
  const blocks = result.blocks || [];
  const scored = blocks.filter(isScored);
  const weakest = result.weakest ? { id: result.weakest.block_id, level: result.weakest.level, ties: result.weakest.ties } : null;
  const sorted = [...scored].sort((a, b) => a.level - b.level || (a.criticality === "critical" ? 0 : 1) - (b.criticality === "critical" ? 0 : 1) || byLayer(a, b));
  const lowest = sorted[0] ? { id: sorted[0].id, level: sorted[0].level, critical: sorted[0].criticality === "critical" } : null;
  // Without a scored critical block there is no link to be below; the lowest block still shows.
  const lower = weakest ? scored.filter((b) => b.level < weakest.level && b.criticality !== "critical").sort(byLevel).map((b) => ({ id: b.id, level: b.level, criticality: b.criticality })) : [];
  const unknownCritical = blocks.filter((b) => !isScored(b) && b.criticality === "critical").sort(byLayer).map((b) => b.id);
  return { weakest, lowest, lower, unknownCritical, noWeak: !lower.length && !unknownCritical.length };
}

/**
 * A block's make-up: who makes it and the level that gives, who runs it and where it is hosted and the
 * level that gives, and the rule that sets the block's level: "lower" (the lower of the two), "capped" (one
 * side not in the sources: the other, at most 2) or "unscored" (neither side in the sources).
 */
export function makeup(block) {
  const licence = block.scored?.licence ?? block.licence ?? "unknown";
  const hosting = block.scored?.hosting ?? block.hosting ?? "UNKNOWN";
  const tech = techLevel(block.tech_class, licence);
  const op = opLevel(block.operator_class, hosting);
  const rule = tech === null && op === null ? "unscored" : tech === null || op === null ? "capped" : "lower";
  return {
    tech: { cls: block.tech_class || "UNKNOWN", licence, level: tech },
    op: { cls: block.operator_class || "UNKNOWN", hosting, level: op },
    rule,
    level: rule === "unscored" ? null : block.level
  };
}

/**
 * A layer's arithmetic: { layer, score, status, terms: [{ id, level, weight, criticality }], weights, value }.
 * value = 25 × Σ(level × weight) ÷ Σ weights over the layer's scored blocks; null without one.
 */
export function layerSum(result, layer) {
  const L = result?.layers?.[layer] || { score: null, status: "open" };
  const terms = (result?.blocks || []).filter((b) => b.layer === layer && isScored(b)).sort(byLayer)
    .map((b) => ({ id: b.id, level: b.level, weight: WEIGHTS[b.criticality] ?? 0, criticality: b.criticality }));
  const weights = terms.reduce((s, t) => s + t.weight, 0);
  const value = terms.length && weights > 0 ? (25 * terms.reduce((s, t) => s + t.level * t.weight, 0)) / weights : null;
  return { layer, score: L.score, status: L.status, terms, weights, value };
}

/** The overall score as the mean of the layer scores: { score, layers: [{ layer, score }], left: [{ layer, status }] }. */
export function overallSum(result) {
  const layers = LAYERS.filter((l) => result?.layers?.[l]?.score !== null && result?.layers?.[l]?.score !== undefined).map((l) => ({ layer: l, score: result.layers[l].score }));
  const left = LAYERS.filter((l) => !layers.some((x) => x.layer === l)).map((l) => ({ layer: l, status: result?.layers?.[l]?.status || "open" }));
  return { score: result?.overall ?? null, layers, left };
}

/**
 * The blocks an alternative is asked for, lowest first: the weakest critical link when below level 4,
 * every block below it, and every block at level 0 or 1.
 */
export function weakBlocks(result) {
  const L = links(result);
  if (!L) return [];
  const scored = (result.blocks || []).filter(isScored);
  const ids = new Set();
  if (L.weakest && L.weakest.level < 4) ids.add(L.weakest.id);
  for (const x of L.lower) ids.add(x.id);
  for (const b of scored) if (b.level <= 1) ids.add(b.id);
  return scored.filter((b) => ids.has(b.id)).sort(byLevel).map((b) => b.id);
}

/**
 * The comparable services of an entry: the other assessed services of its function group, best first.
 * entries: the catalogue's entries; scores: { [id]: { overall, layers } or { notService: true } }.
 */
export function comparable(entries, scores, id) {
  const me = (entries || []).find((e) => e.id === id);
  if (!me || !me.group || me.group === "self") return [];
  return entries
    .filter((e) => e.id !== id && e.group === me.group && scores?.[e.id] && !scores[e.id].notService && scores[e.id].overall !== null && scores[e.id].overall !== undefined)
    .map((e) => ({ id: e.id, overall: scores[e.id].overall, layers: scores[e.id].layers }))
    .sort((a, b) => b.overall - a.overall || a.id.localeCompare(b.id));
}
