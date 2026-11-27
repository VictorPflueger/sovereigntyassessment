// Every case side by side (2.1.0, brief SA-04): the overview of all services and Compare, as text for
// js/overview.js to draw. The figures come from the engine's results of the pre-runs, which js/app.js plays
// once in this tab with nothing stored, and from a live run of this tab; the derived figures (the blocks
// below the weakest critical link, the critical blocks left unscored, each layer's lowest block) come from
// js/chain.js. This module words them; it decides no level and no score.

import { t, tn } from "./i18n/index.js";
import { fmtScore, fmtInt, fmtDateShort } from "./format.js";
import { LAYERS } from "./engine.js";
import { links, layerSum, byLevel } from "./chain.js";
import { pct, inLang } from "./story.js";

const caseName = (id, lang) => t(`p.case.${id}.short`, null, lang);
const keyOf = (c) => (c.live ? `live:${c.entry.id}` : c.entry.id);

/** Each block's name in both languages, by the id the toolbox gives it (B-01 for the first rec_block). */
export function blockNames(def) {
  const out = {};
  let n = 0;
  for (const st of def?.steps || []) {
    if (st.tool === "rec_block") out[`B-${String(++n).padStart(2, "0")}`] = st.input?.name;
    if (st.tool === "rec_block_update" && st.input?.changes?.name) out[st.input.block_id] = st.input.changes.name;
  }
  return out;
}

/** A block's name in a case: a pre-run's in the language asked for, a live run's as the agent wrote it. */
function namer(c, lang) {
  const names = c.live ? {} : blockNames(c.def);
  return (id) => (names[id] ? inLang(names[id], lang) : inLang((c.run?.blockList || []).find((b) => b.id === id)?.name, lang) || id);
}

/**
 * Each case's overall score, the number of layers it rests on and its weakest critical link with the block's
 * name in both languages, as js/story.js's comparable services take them.
 */
export function scoresOf(list) {
  const out = {};
  for (const c of list) {
    if (!c.run) continue;
    if (c.run.notService) { out[c.entry.id] = { notService: true }; continue; }
    const r = c.run.score?.result;
    if (!r) continue;
    const w = r.weakest;
    out[c.entry.id] = { overall: r.overall, layers: LAYERS.filter((l) => r.layers[l].score !== null).length, weakest: w ? { level: w.level, name: blockNames(c.def)[w.block_id] || w.block_id } : null };
  }
  return out;
}

/**
 * The figures of one case from its run's digest (js/run.js): { notService }, { pending } or { overall,
 * scored, weakest, lower, unknownCritical, exclusive, layers }, where each layer has its score or status
 * and its lowest block (the one that holds the weighted mean down), with how many share that level.
 */
export function caseFigures(run) {
  if (!run || run.notService) return { notService: true };
  const r = run.score?.result;
  if (!r) return { pending: true };
  const L = links(r);
  const layers = {};
  for (const l of LAYERS) {
    const lay = r.layers[l];
    const terms = [...layerSum(r, l).terms].sort((a, b) => a.level - b.level || (a.criticality === "critical" ? 0 : 1) - (b.criticality === "critical" ? 0 : 1) || byLevel(a, b));
    const low = terms[0] || null;
    layers[l] = {
      score: lay?.score ?? null,
      status: lay?.score !== null && lay?.score !== undefined ? "scored" : lay?.status || "open",
      low: low ? { id: low.id, level: low.level, same: terms.filter((x) => x.level === low.level).length - 1, blocks: terms.length } : null
    };
  }
  return {
    overall: r.overall, scored: LAYERS.filter((l) => r.layers[l].score !== null).length,
    weakest: L.weakest, lower: L.lower, unknownCritical: L.unknownCritical, exclusive: r.exclusive_non_eu,
    critical: r.blocks.filter((b) => !b.unscored && b.criticality === "critical").length, layers
  };
}

/** The cells both views share: the score, the weakest critical link, what lies below it, exclusive control. */
function cells(c, f, lang) {
  const blockName = namer(c, lang);
  const unknown = f.unknownCritical.length ? tn("p.ov.unknown", f.unknownCritical.length, { n: fmtInt(f.unknownCritical.length, lang) }, lang) : "";
  return {
    score: f.overall === null ? t("p.noScore", null, lang) : fmtScore(f.overall, lang),
    of: t("p.kpi.layers", { n: fmtInt(f.scored, lang) }, lang),
    // The critical blocks no source names stand with the weakest critical link, as on the tile; the next
    // column holds only blocks that are not critical (cold read, 2.1.0).
    weakest: f.weakest
      ? { level: f.weakest.level, name: blockName(f.weakest.id), more: f.weakest.ties ? tn("p.ov.ties", f.weakest.ties, { n: fmtInt(f.weakest.ties, lang) }, lang) : "", unknown }
      : { none: [t("p.kpi.noCritical", null, lang), unknown].filter(Boolean).join("; ") },
    lower: f.lower.length
      ? { level: f.lower[0].level, name: blockName(f.lower[0].id), more: f.lower.length > 1 ? tn("p.ov.below", f.lower.length - 1, { n: fmtInt(f.lower.length - 1, lang), level: fmtInt(f.weakest.level, lang) }, lang) : "" }
      : { none: t("p.ov.noneLower", null, lang) },
    exclusive: f.exclusive === null ? t("p.kpi.none", null, lang) : t("p.ov.exclusive", { pct: pct(f.exclusive, lang), n: fmtInt(f.critical, lang) }, lang)
  };
}

/**
 * The overview: { rows, ended, self }. cases: [{ entry, def, run, live }] in the catalogue's order, a live
 * run of this tab after its pre-run; viewed: the case ids opened in this tab. Rows go best first, equal
 * scores by name; the cases that ended without an assessment and this prototype stand apart.
 */
export function overviewModel({ cases, lang, viewed = new Set() }) {
  const rows = [];
  const ended = [];
  let self = null;
  for (const c of cases) {
    const f = caseFigures(c.run);
    const base = {
      id: c.entry.id, key: keyOf(c), name: caseName(c.entry.id, lang), live: !!c.live, viewed: !c.live && viewed.has(c.entry.id),
      group: c.entry.group && c.entry.group !== "self" ? t(`p.group.${c.entry.group}`, null, lang) : "",
      asOf: fmtDateShort(c.live ? c.run?.asOf || c.asOf : c.def.as_of, lang)
    };
    if (f.notService) { if (!c.live) ended.push({ ...base, reason: t(`p.ov.reason.${c.entry.id}`, null, lang) }); continue; }
    if (f.pending) continue;
    const row = { ...base, overall: f.overall, ...cells(c, f, lang) };
    if (c.entry.category === "self_assessment") self = row; else rows.push(row);
  }
  const collator = new Intl.Collator(lang === "de" ? "de-DE" : "en-GB", { sensitivity: "base" });
  rows.sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1) || collator.compare(a.name, b.name) || (a.live ? 1 : 0) - (b.live ? 1 : 0));
  return { rows, ended, self };
}

/** Compare of two or three cases, by the keys overviewModel gives them: the four figures, then the six layers. */
export function compareModel({ cases, keys, lang }) {
  const cols = keys.map((k) => cases.find((c) => keyOf(c) === k)).filter(Boolean).map((c) => {
    const f = caseFigures(c.run);
    if (f.notService || f.pending) return null;
    const blockName = namer(c, lang);
    const name = caseName(c.entry.id, lang);
    return {
      key: keyOf(c), id: c.entry.id, live: !!c.live, name: c.live ? t("p.cmp.liveName", { name }, lang) : name,
      ...cells(c, f, lang),
      layers: Object.fromEntries(LAYERS.map((l) => {
        const x = f.layers[l];
        if (x.score === null) return [l, { none: t(`p.layer.${x.status === "scored" ? "open" : x.status}`, null, lang) }];
        return [l, { score: fmtScore(x.score, lang), level: x.low.level, name: blockName(x.low.id), more: x.low.same ? tn("p.ov.ties", x.low.same, { n: fmtInt(x.low.same, lang) }, lang) : "", blocks: tn("p.cmp.blocks", x.low.blocks, { n: fmtInt(x.low.blocks, lang) }, lang) }];
      }))
    };
  }).filter(Boolean);
  return {
    title: t("p.cmp.title", { names: cols.map((c) => c.name).join(" · ") }, lang),
    cols,
    four: [
      { key: "score", label: t("p.kpi.score.label", null, lang) },
      { key: "weakest", label: t("p.kpi.weakest.label", null, lang) },
      { key: "lower", label: t("p.ov.col.lower", null, lang) },
      { key: "exclusive", label: t("p.kpi.exclusive.label", null, lang) }
    ],
    layers: LAYERS.map((l) => ({ layer: l, label: t(`p.layer.${l}`, null, lang) }))
  };
}
