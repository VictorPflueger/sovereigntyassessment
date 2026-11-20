// The assessments loaded in this tab, which Compare and the Portfolio read (brief §9): the bundled
// pre-runs (data/runs/), each assessment of this session once its findings are frozen (the person
// confirmed or skipped the review), and assessment files the person loads. One item per key: a session's
// assessment of a catalogue entry takes the place of that entry's pre-run, the newest first; a file keeps
// its own place. In memory only: a reload starts again from the pre-runs.

import { assessmentFromPreRun, readAssessment } from "./assessment.js";

const items = new Map();     // key → { key, origin: "prerun" | "session" | "file", def?, assessment?, file?, seq }
const derived = new Map();   // `${key}|${lang}` → Promise of a pre-run's assessment in that language
const listeners = new Set();
let seq = 0;

const notify = () => { for (const fn of listeners) { try { fn(); } catch (e) { console.error("[Sovereignty Assessment] loaded-set listener failed:", e); } } };

/** The key of an assessment: its catalogue entry, else its query. */
export function keyOf(entryId, query) {
  return entryId ? `entry:${entryId}` : `query:${String(query || "").trim().toLowerCase()}`;
}

/** The bundled pre-runs in the order the catalogue lists their entries. */
function bundled() {
  const runs = globalThis.SA_RUNS || {};
  const order = (globalThis.SA_CATALOGUE?.entries || []).map((e) => e.id);
  return Object.values(runs).sort((a, b) => order.indexOf(a.entry_id) - order.indexOf(b.entry_id));
}

/** Adds every bundled pre-run that is not loaded yet (and not replaced by this session's assessment). */
export function addPreRuns() {
  let added = 0;
  for (const def of bundled()) {
    const key = keyOf(def.entry_id);
    if (items.has(key)) continue;
    items.set(key, { key, origin: "prerun", def, seq: ++seq });
    added += 1;
  }
  if (added) notify();
  return added;
}

/** This session's assessment of a service, once its findings are frozen. */
export function addSessionAssessment(assessment) {
  if (!assessment) return null;
  const key = keyOf(assessment.service.entry_id, assessment.service.query);
  const prev = items.get(key);
  items.set(key, { key, origin: "session", assessment, seq: prev?.origin === "session" ? prev.seq : ++seq });
  for (const k of [...derived.keys()]) if (k.startsWith(`${key}|`)) derived.delete(k);
  notify();
  return key;
}

/**
 * An assessment file's text. Returns { ok, key } or { ok: false, errors } (the schema's findings). A file
 * of the same service, date and source as one loaded before takes its place.
 */
export function addFile(text, fileName = "") {
  const r = readAssessment(text);
  if (!r.ok) return { ok: false, errors: r.errors, file: fileName };
  const a = r.assessment;
  const key = `file:${keyOf(a.service.entry_id, a.service.query)}:${a.as_of}:${a.source}`;
  const prev = items.get(key);
  items.set(key, { key, origin: "file", assessment: a, file: fileName, seq: prev ? prev.seq : ++seq });
  notify();
  return { ok: true, key, file: fileName };
}

export function removeLoaded(key) {
  if (!items.delete(key)) return false;
  for (const k of [...derived.keys()]) if (k.startsWith(`${key}|`)) derived.delete(k);
  notify();
  return true;
}

export function clearLoaded() {
  if (!items.size) return;
  items.clear();
  derived.clear();
  notify();
}

/** The loaded items, in the order they were added. */
export function loadedItems() {
  return [...items.values()].sort((a, b) => a.seq - b.seq);
}

/** One item's assessment in a language: a pre-run is derived once per language, the rest as stored. */
export function assessmentOf(item, lang = "en") {
  if (item.origin !== "prerun") return Promise.resolve(item.assessment);
  const k = `${item.key}|${lang}`;
  if (!derived.has(k)) derived.set(k, assessmentFromPreRun(item.def, lang));
  return derived.get(k);
}

/** Every loaded assessment in a language, with its item: [{ item, assessment }]. A pre-run that fails is left out and reported. */
export async function loadedAssessments(lang = "en") {
  const list = loadedItems();
  const out = [];
  for (const item of list) {
    try {
      out.push({ item, assessment: await assessmentOf(item, lang) });
    } catch (e) {
      console.error(`[Sovereignty Assessment] the assessment of ${item.key} could not be derived:`, e);
    }
  }
  return out;
}

export function onLoaded(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
