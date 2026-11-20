// An assessment as a record (brief §10, the Assessment schema): what the export writes, what Compare and
// the Portfolio read, and what an imported file brings back. Three ways to one:
//   - from the run on screen, live or simulated (assessmentFromRecords with the toolbox's records());
//   - from a pre-run, without playing it: its research steps and its recording tools go through the same
//     executors as in a replay (js/tools.js), up to the review, with no event on the bus;
//   - from an exported file, validated against the schema before anything reads it.
// Figures are never taken from a record: scoreAssessment() gates each block by its evidence's verified
// flags, lays the reviewer's corrections over it and scores the blocks in code (js/engine.js), with the
// layer weights in force. A block keeps what the agent recorded; corrections stay apart, as in the report.

import { createToolbox, pickLang } from "./tools.js";
import { createEvidenceRegistry, gateBlock } from "./evidence.js";
import { prepareEvidence } from "./simulation.js";
import { LAYERS, METHOD_VERSION, EQUAL_LAYER_WEIGHTS, score } from "./engine.js";
import { validate } from "./schema.js";
import { entryById } from "./catalogue.js";

/** The categories an assessment may have; the Portfolio leaves the last one out (brief §8). */
export const CATEGORIES = Object.freeze(["base_service", "platform_or_access", "self_assessment"]);

/** The fields of a block as the agent records it (brief §10), in the schema's order. */
const RECORDED = ["id", "layer", "name", "role", "note", "criticality", "tech", "operator", "hosting", "licence", "exit"];
const PROFILE = ["names", "category", "what", "how", "owner", "operator", "status", "legal_basis", "governance"];

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj?.[k] !== undefined).map((k) => [k, structuredClone(obj[k])]));

/** A text in a language: a plain string as it is, { en, de } in that language (English if it lacks one). */
export function textIn(value, lang) {
  if (value && typeof value === "object") return value[lang] || value.en || value.de || "";
  return value == null ? "" : String(value);
}

/** An evidence check as the Evidence schema has it: URL, title, quote, language, read date, fields, flag. */
export function evidenceRecord(c) {
  return {
    url: c.url,
    title: c.title || c.url,
    ...(c.quote ? { quote: c.quote } : {}),
    lang: /^[a-z]{2}$/.test(String(c.lang || "")) ? c.lang : "en",
    ...(c.read_on ? { read_on: c.read_on } : {}),
    supports: [...(c.supports || [])],
    verified: !!c.verified,
    ...(c.via ? { via: c.via } : {})
  };
}

/** The reviewer's corrections of a block as gateBlock() takes them: the last value per field. */
function correctionMap(block) {
  const out = {};
  for (const c of block.corrections || []) out[c.field] = structuredClone(c.to);
  return out;
}

/**
 * The figures of an assessment, computed from its own fields: each block gated by the verified flags of
 * its evidence (a field without a verified quote counts as unknown), the reviewer's corrections laid
 * over it, the layers' statuses as recorded, and the layer weights given (equal by default). Returns
 * the engine's result plus each block's unknown fields.
 */
export function scoreAssessment(a, weights = EQUAL_LAYER_WEIGHTS) {
  const unknown = {};
  const blocks = effectiveBlocks(a, unknown);
  const result = score(blocks, { layerWeights: { ...EQUAL_LAYER_WEIGHTS, ...(weights || {}) }, layerStatus: layerStatusOf(a) });
  return { ...result, unknown_fields: unknown };
}

/** The layers' recorded statuses as the engine takes them: { layer: status }. */
export function layerStatusOf(a) {
  return Object.fromEntries((a?.layers || []).map((l) => [l.layer, l.status]));
}

/**
 * The blocks as the engine scores them: each gated by its evidence's verified flags, with the
 * reviewer's corrections laid over it. unknown (optional): filled with each block's unknown fields.
 */
export function effectiveBlocks(a, unknown = {}) {
  return (a?.blocks || []).map((b) => {
    const g = gateBlock(pick(b, RECORDED), b.evidence || [], correctionMap(b));
    unknown[b.id] = g.unknown_fields;
    return { id: b.id, ...g.effective };
  });
}

/**
 * The run on screen as an Assessment. records: the toolbox's records(); meta: { query, entryId, name,
 * category, asOf, source, catalogue }. Returns null while there is nothing to export (no category known
 * yet: neither a catalogue entry nor a recorded profile says it).
 */
export function assessmentFromRecords(records, { query = "", entryId = null, name = "", category = null, asOf, source = "live", catalogue, weights } = {}) {
  const rec = records || {};
  const lang = rec.lang === "de" ? "de" : "en";
  const entry = entryId ? entryById(entryId, catalogue) : null;
  const cat = category || entry?.category || rec.profile?.category || null;
  if (!CATEGORIES.includes(cat)) return null;
  const profile = rec.profile ? { ...pick(rec.profile, PROFILE), evidence: (rec.profile.evidence || []).map(evidenceRecord) } : null;
  const blocks = (rec.blocks || []).map((b) => ({
    ...pick(b.recorded, RECORDED),
    evidence: (b.checks || []).map(evidenceRecord),
    confidence: b.recorded.confidence,
    ...(b.log?.length ? { corrections: b.log.map((c) => ({ field: c.field, from: c.from ?? null, to: c.to, reason: c.reason, by: "reviewer", ...(c.ts ? { ts: c.ts } : {}) })) } : {})
  }));
  const layers = LAYERS.filter((l) => rec.layerStatus?.[l]).map((l) => {
    const s = rec.layerStatus[l];
    return { layer: l, status: s.status, reason: s.reason, ...(s.evidence?.length ? { evidence: s.evidence.map(evidenceRecord) } : {}) };
  });
  const decisions = [
    ...(rec.decisions || []).map((d) => ({ ...d, by: "user" })),
    ...(rec.corrections || []).map((c) => ({ kind: "review", action: "correct", block_id: c.block_id, changes: { [c.field]: structuredClone(c.to) }, reason: c.reason, by: "user", ts: c.ts }))
  ].filter((d) => d.ts).sort((x, y) => String(x.ts).localeCompare(String(y.ts)));
  const w = { ...EQUAL_LAYER_WEIGHTS, ...(weights || rec.weights || {}) };
  const a = {
    service: { query: query || name || entry?.names?.[lang] || "", entry_id: entryId || null, name: name || entry?.names?.[lang] || query || "" },
    category: cat,
    lang,
    as_of: asOf,
    source,
    method_version: METHOD_VERSION,
    profile,
    blocks,
    layers,
    weights: w,
    decisions
  };
  return withFigures(a, w);
}

/** The assessment with what code computes: each block's classes and level, and the result's facts. */
export function withFigures(a, weights = EQUAL_LAYER_WEIGHTS) {
  const r = scoreAssessment(a, weights);
  const byId = new Map(r.blocks.map((b) => [b.id, b]));
  const blocks = a.blocks.map((b) => {
    const s = byId.get(b.id);
    const out = { ...b };
    for (const k of ["tech_class", "operator_class", "level", "partly_unknown", "unscored", "unknown_fields"]) delete out[k];
    return { ...out, tech_class: s.tech_class, operator_class: s.operator_class, level: s.level, partly_unknown: s.partly_unknown, unscored: s.unscored, unknown_fields: r.unknown_fields[b.id] || [] };
  });
  return { ...a, blocks, weights: { ...EQUAL_LAYER_WEIGHTS, ...(weights || {}) }, result: { method_version: METHOD_VERSION, weights: { ...EQUAL_LAYER_WEIGHTS, ...(weights || {}) }, facts: { ...r.facts } } };
}

/** The tools of a pre-run that record findings or open sources; everything else waits for a person. */
const REPLAYED = new Set(["cat_lookup", "ref_facts", "rec_profile", "rec_block", "rec_block_update", "rec_block_remove", "rec_layer", "eng_score"]);

/**
 * A pre-run's assessment in one language, as its replay records it up to the review: the same research
 * steps and recording tools through the same executors, with no event on the bus and no wait. Throws
 * when a recorded call is refused (a pre-run that passed tools/check-runs.mjs never is).
 */
export async function assessmentFromPreRun(def, lang = "en", { catalogue, refFacts } = {}) {
  const registry = createEvidenceRegistry();
  const toolbox = createToolbox({
    lang, mode: "check", registry, catalogue, refFacts,
    emit: () => {},
    next: () => new Promise(() => {}),
    onPhase: () => {},
    now: () => new Date(`${def.as_of}T12:00:00Z`),
    service: { query: def.query, entry_id: def.entry_id, name: def.query },
    weights: EQUAL_LAYER_WEIGHTS
  });
  for (const step of def.steps || []) {
    if (step.search) toolbox.research({ kind: "search", query: step.search.query, results: step.search.results, ok: true });
    else if (step.fetch) toolbox.research({ kind: "fetch", url: step.fetch.url, title: step.fetch.title, ok: true, text: null, doc: step.fetch.pdf ? "pdf" : "recorded" });
    else if (step.tool === "ui_request_review") break;
    else if (step.tool && REPLAYED.has(step.tool)) {
      const input = prepareEvidence(pickLang(structuredClone(step.input || {}), lang), registry);
      const out = await toolbox.execute(step.tool, input);
      if (out.isError) throw new Error(`${def.id}: ${step.tool} was refused: ${out.result?.error || "unknown error"}`);
    }
  }
  const entry = entryById(def.entry_id, catalogue);
  return assessmentFromRecords(toolbox.records(), {
    query: def.query, entryId: def.entry_id, name: entry?.names?.[lang] || def.query,
    category: entry?.category || null, asOf: def.as_of, source: def.source, catalogue
  });
}

/**
 * An assessment from a file's text: JSON, valid against the Assessment schema (and its references), with
 * unique block ids. Returns { ok: true, assessment } with the figures computed afresh, or { ok: false,
 * errors: [{ path, message }] }. Nothing in a file is executed or trusted as a figure.
 */
export function readAssessment(text, schemas = globalThis.window?.SA_SCHEMAS) {
  let data;
  try {
    data = JSON.parse(String(text));
  } catch (e) {
    return { ok: false, errors: [{ path: "", message: `not JSON (${String(e?.message || e).slice(0, 80)})` }] };
  }
  if (!schemas?.Assessment) return { ok: false, errors: [{ path: "", message: "the schemas are not loaded" }] };
  const v = validate(data, schemas.Assessment, schemas);
  if (!v.valid) return { ok: false, errors: v.errors };
  const ids = data.blocks.map((b) => b.id);
  if (new Set(ids).size !== ids.length) return { ok: false, errors: [{ path: "blocks", message: "block ids must be unique" }] };
  const layers = data.layers.map((l) => l.layer);
  if (new Set(layers).size !== layers.length) return { ok: false, errors: [{ path: "layers", message: "a layer may have one status only" }] };
  return { ok: true, assessment: withFigures(data, data.weights) };
}

/** Problems of an assessment against the schema, for the export's own check and the tests. */
export function assessmentErrors(a, schemas = globalThis.window?.SA_SCHEMAS) {
  return validate(a, schemas.Assessment, schemas).errors;
}

/** The service's name in a language. */
export function serviceName(a, lang) {
  return textIn(a?.service?.name, lang) || a?.service?.query || "";
}
