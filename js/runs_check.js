// The checks of a pre-run assessment (brief §8; PLAN.md d.5), shared by tools/check-runs.mjs and the
// tests. A pre-run fails on: a missing language; different placeholders between the languages; a
// model-written field that fails the rule 4 audit, with its exemptions and the run's own evidence; an
// unknown fact key; a block without evidence; an evidence URL that neither the run's research steps, the
// catalogue nor the reference facts contain; a quote longer than 150 characters; a hand-authored quote
// missing from research/; a key-like string; a thinking block. The research notes set each quote's
// verified flag. The play check runs the pre-run through the real simulation player and the real tool
// executors, in both languages and along every lever choice, so what passes here plays in the browser.

import { normaliseUrl, normaliseText, MAX_QUOTE } from "./evidence.js";
import { factKeysIn } from "./tools.js";
import { METHOD_VERSION, LAYERS } from "./engine.js";
import { bus } from "./events.js";

/** The canonical text of a pre-run file. */
export function runFileText(def, name = def.id) {
  return `/* Pre-run assessment of ${name} (${String(def.source).replace("_", "-")}, as of ${def.as_of}): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/${def.id}.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs[${JSON.stringify(def.id)}] = ${JSON.stringify(def, null, 1)};
})();
`;
}

/** The model-written texts of each step kind, as paths into the step: each must be { en, de }. */
const TEXT_PATHS = {
  say: (s) => [["say", s.say]],
  report: (s) => [["findings", s.report?.findings]],
  rec_profile: (i) => ["what", "how", "status", "legal_basis", "governance"].filter((f) => i[f] !== undefined).map((f) => [f, i[f]]),
  rec_block: (i) => ["name", "role", "note"].filter((f) => i[f] !== undefined).map((f) => [f, i[f]]),
  rec_block_update: (i) => [...["name", "role", "note"].filter((f) => i.changes?.[f] !== undefined).map((f) => [`changes.${f}`, i.changes[f]]), ["reason", i.reason]],
  rec_block_remove: (i) => [["reason", i.reason]],
  rec_layer: (i) => [["reason", i.reason]],
  ui_request_review: (i) => [["summary", i.summary]],
  ui_propose_levers: (i) => (i.levers || []).flatMap((l, k) => [[`levers[${k}].title`, l.title], [`levers[${k}].rationale`, l.rationale]]),
  ui_choose_service: (i) => [["question", i.question], ...(i.candidates || []).flatMap((c, k) => [[`candidates[${k}].name`, c.name], [`candidates[${k}].description`, c.description]])]
};

const KNOWN_STEPS = ["say", "search", "fetch", "tool", "memo", "report"];
// Legal forms after a company's name ("Apple Inc.", "Dataport AöR"): a party whose name carries one is a
// company, and its name before the form may not appear in a lever.
const LEGAL_FORM = /\s+(GmbH & Co\. KG|GmbH|AG|SE|Inc\.|Ltd\.|LLC|PBC|Corp\.|eG|AöR|KG|S\.à r\.l\. et Cie, S\.C\.A\.|Holdings, Inc\.)$/;
// Products and companies the sources name as alternatives or platforms, which no lever may name either.
const LEVER_NAMES = ["Apple", "App Store", "Anthropic", "Claude", "AWS", "Amazon", "Bedrock", "GCP", "Google", "Vertex", "Microsoft", "Foundry", "Azure",
  "Mistral", "STACKIT", "StackIT", "Stackit", "Wero", "European Payments Initiative", "EPI", "PayPal", "Mastercard", "Visa", "GitLab", "GitHub",
  "Keycloak", "Kubernetes", "Shopware", "SAP", "IONOS", "T-Systems", "Telekom", "Dataport", "Governikus", "Bundesdruckerei", "D-Trust", "SEITENBAU",
  "Sonatype", "SVA", "ARWINET", "AKDB", "govdigital", "Linux Foundation", "CNCF", "Wire"];
const KEY_LIKE = /sk-ant-[A-Za-z0-9_-]{6,}/;
const isBoth = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 2 && "en" in v && "de" in v;

/**
 * The research notes of one entry (research/<entry>.md): sections "### [Title](URL)", a line "Read on
 * YYYY-MM-DD", and one quote per line starting with "> ". Returns Map<normalised URL, { url, title,
 * read_on, quotes: Set<normalised quote> }>.
 */
export function parseResearch(md) {
  const out = new Map();
  let cur = null;
  for (const raw of String(md || "").split(/\r?\n/)) {
    const line = raw.trim();
    const head = line.match(/^###\s+\[(.+)\]\((https?:\/\/[^\s)]+)\)\s*$/);
    if (head) {
      cur = { url: head[2], title: head[1], read_on: null, quotes: new Set() };
      const key = normaliseUrl(head[2]);
      if (out.has(key)) for (const q of out.get(key).quotes) cur.quotes.add(q);
      out.set(key, cur);
      continue;
    }
    if (!cur) continue;
    const read = line.match(/^Read on (\d{4}-\d{2}-\d{2})\b/);
    if (read) { cur.read_on = read[1]; continue; }
    if (line.startsWith("> ")) cur.quotes.add(normaliseText(line.slice(2)));
  }
  return out;
}

/** True when an evidence item cites a bundled reference fact verbatim (verified when the facts were built). */
export function isRefFact(item, refFacts = globalThis.window?.SA_REF_FACTS) {
  return (refFacts?.facts || []).some((f) => normaliseUrl(f.evidence.url) === normaliseUrl(item.url) && normaliseText(f.evidence.quote) === normaliseText(item.quote));
}

/** Every evidence item of a pre-run, with where it sits: [{ item, where }]. */
export function evidenceItems(def) {
  const out = [];
  (def.steps || []).forEach((step, n) => {
    const visit = (node, where) => {
      if (Array.isArray(node)) { node.forEach((v, k) => visit(v, `${where}[${k}]`)); return; }
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node.evidence)) node.evidence.forEach((item, k) => out.push({ item, where: `${where}.evidence[${k}]` }));
      for (const [key, v] of Object.entries(node)) if (key !== "evidence" && v && typeof v === "object") visit(v, `${where}.${key}`);
    };
    if (step.tool) visit(step.input, `steps[${n}] ${step.tool}`);
  });
  return out;
}

/**
 * Sets each quote's verified flag from the research notes: true when the quote is listed under the same
 * URL in research/<entry>.md. Returns how many flags changed.
 */
export function applyFlags(def, research, refFacts = globalThis.window?.SA_REF_FACTS) {
  let changed = 0;
  // A recorded run keeps the flags its live run set: there is no research note to compare with.
  if (def.source !== "hand_authored") return 0;
  for (const { item } of evidenceItems(def)) {
    const note = research?.get(normaliseUrl(item.url));
    const flag = !!(item.quote && ((note && note.quotes.has(normaliseText(item.quote))) || isRefFact(item, refFacts)));
    if (item.verified !== flag) { item.verified = flag; changed += 1; }
  }
  return changed;
}

/**
 * The static checks of a pre-run. ctx: { catalogue (window.SA_CATALOGUE), refFacts (window.SA_REF_FACTS),
 * research (parseResearch of research/<entry>.md, or null), id (the file's entry id) }. Returns
 * [{ code, where, message }].
 */
export function staticProblems(def, ctx = {}) {
  const problems = [];
  const add = (code, where, message) => problems.push({ code, where, message });

  // Shape.
  if (!def || typeof def !== "object") { add("shape", "run", "not an object"); return problems; }
  if (ctx.id && def.id !== ctx.id) add("shape", "id", `id "${def.id}" does not match the file name "${ctx.id}"`);
  const entries = ctx.catalogue?.entries || [];
  if (!entries.some((e) => e.id === def.entry_id)) add("shape", "entry_id", `no catalogue entry "${def.entry_id}"`);
  if (!["hand_authored", "recorded"].includes(def.source)) add("shape", "source", `source must be hand_authored or recorded, not ${JSON.stringify(def.source)}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(def.as_of || ""))) add("shape", "as_of", "as_of must be a date written YYYY-MM-DD");
  if (def.method_version !== METHOD_VERSION) add("shape", "method_version", `method_version must be ${METHOD_VERSION}`);
  if (!Array.isArray(def.steps) || !def.steps.length) add("shape", "steps", "no steps");

  // A key-like string or a thinking block anywhere.
  const text = JSON.stringify(def);
  if (KEY_LIKE.test(text)) add("key_like", "run", "a string that looks like an API key");
  if (/"(thinking|redacted_thinking|reasoning|think|signature)"\s*:/.test(text) || /"type"\s*:\s*"(thinking|redacted_thinking)"/.test(text)) add("thinking", "run", "a thinking block or its signature");

  // The URLs the run may cite: its research steps, the catalogue and the reference facts.
  const allowed = new Set();
  for (const s of def.steps || []) {
    if (s.search) for (const r of s.search.results || []) allowed.add(normaliseUrl(r.url));
    if (s.fetch) allowed.add(normaliseUrl(s.fetch.url));
  }
  for (const e of entries) for (const u of e.urls || []) allowed.add(normaliseUrl(u.url));
  for (const f of ctx.refFacts?.facts || []) allowed.add(normaliseUrl(f.evidence.url));

  (def.steps || []).forEach((step, n) => {
    const kinds = Object.keys(step).filter((k) => KNOWN_STEPS.includes(k));
    if (kinds.length !== 1) { add("step", `steps[${n}]`, `a step needs exactly one of ${KNOWN_STEPS.join(", ")}`); return; }
    const kind = kinds[0];
    const where = `steps[${n}] ${kind === "tool" ? step.tool : kind}`;
    const texts = kind === "tool" ? (TEXT_PATHS[step.tool] ? TEXT_PATHS[step.tool](step.input || {}) : []) : TEXT_PATHS[kind] ? TEXT_PATHS[kind](step) : [];
    for (const [path, value] of texts) {
      if (!isBoth(value) || !String(value.en || "").trim() || !String(value.de || "").trim()) {
        add("missing_language", `${where} ${path}`, "a model-written text needs both languages, { en, de }");
        continue;
      }
      const en = factKeysIn(value.en).sort().join(",");
      const de = factKeysIn(value.de).sort().join(",");
      if (en !== de) add("placeholders_differ", `${where} ${path}`, `English cites [${en}], German cites [${de}]`);
    }
    if (kind === "search" && !(step.search.query && Array.isArray(step.search.results) && step.search.results.length)) add("step", where, "a search needs its query and its results");
    if (kind === "fetch" && !(step.fetch.url && step.fetch.title)) add("step", where, "a fetch needs its URL and its title");
    if (kind === "tool" && step.tool === "rec_block" && !(Array.isArray(step.input?.evidence) && step.input.evidence.length)) add("block_without_evidence", where, "a block needs evidence");
  });

  // Every field a block records stands on a quote that supports it (brief §6.6): an unsupported field counts
  // as unknown for scoring, and the exit path, which is not scored, would otherwise be shown and exported
  // as a judgement without a source (the review's findings R-01 and R-10).
  (def.steps || []).forEach((step, n) => {
    if (step.tool !== "rec_block" || !step.input) return;
    const b = step.input;
    const sup = new Set((b.evidence || []).flatMap((e) => e.supports || []));
    const need = [
      [b.exit && b.exit !== "unknown", "exit", `the exit path "${b.exit}"`],
      [b.hosting && b.hosting !== "UNKNOWN", "hosting", `the hosting "${b.hosting}"`],
      [b.licence && b.licence !== "unknown", "licence", `the licence "${b.licence}"`],
      [b.tech?.country && b.tech.country !== "UNKNOWN", "tech", `the maker ${b.tech?.name}`],
      [b.operator?.country && b.operator.country !== "UNKNOWN", "operator", `the operator ${b.operator?.name}`],
      [!!b.tech?.parent, "tech.parent", `the maker's parent ${b.tech?.parent?.name}`],
      [!!b.operator?.parent, "operator.parent", `the operator's parent ${b.operator?.parent?.name}`]
    ];
    for (const [recorded, field, what] of need) if (recorded && !sup.has(field)) add("unsupported_field", `steps[${n}] rec_block`, `${what} has no evidence that supports "${field}"`);
  });

  // A lever names categories, never a company or a product (brief §6.5 and §6.6); the names stay in its
  // evidence. Checked against the companies the run's blocks record and the products its sources name.
  const companies = new Set(LEVER_NAMES);
  for (const step of def.steps || []) {
    if (step.tool !== "rec_block" || !step.input) continue;
    for (const p of [step.input.tech, step.input.operator, step.input.tech?.parent, step.input.operator?.parent]) {
      const name = String(p?.name || "").replace(/\s*\(.*?\)\s*/g, " ").trim();
      const form = name.match(LEGAL_FORM);
      if (form) companies.add(name.slice(0, form.index).replace(/,$/, "").trim());
    }
  }
  (def.steps || []).forEach((step, n) => {
    if (step.tool !== "ui_propose_levers") return;
    (step.input?.levers || []).forEach((l, k) => {
      for (const field of ["title", "rationale"]) for (const lang of ["en", "de"]) {
        const text = String(l[field]?.[lang] || "");
        const hit = [...companies].filter((c) => new RegExp(`(^|[^\\p{L}\\p{N}])${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}\\p{N}])`, "u").test(text));
        if (hit.length) add("lever_names_company", `steps[${n}] levers[${k}].${field}.${lang}`, `names ${hit.join(", ")}`);
      }
    });
  });

  for (const { item, where } of evidenceItems(def)) {
    if (!allowed.has(normaliseUrl(item.url))) add("unknown_url", where, `${item.url} is in neither the run's research steps, the catalogue nor the reference facts`);
    if (typeof item.quote === "string" && [...item.quote].length > MAX_QUOTE) add("long_quote", where, `the quote has ${[...item.quote].length} characters, more than ${MAX_QUOTE}`);
    if (def.source === "hand_authored" && !isRefFact(item, ctx.refFacts)) {
      if (!item.quote) add("quote_not_in_research", where, "a hand-authored evidence item needs its quote");
      else {
        const note = ctx.research?.get(normaliseUrl(item.url));
        if (!note) add("quote_not_in_research", where, `research/${def.id}.md has no section for ${item.url}`);
        else if (!note.quotes.has(normaliseText(item.quote))) add("quote_not_in_research", where, `the quote is not listed under ${item.url} in research/${def.id}.md`);
        if (note && !note.read_on) add("quote_not_in_research", where, `the section for ${item.url} in research/${def.id}.md has no "Read on" date`);
      }
    }
    if (typeof item.verified !== "boolean") add("flag", where, "the verified flag is missing: run tools/check-runs.mjs --write");
  }
  return problems;
}

/** The lever choices a pre-run offers: its recorded lever ids and "keep". */
export function leverChoices(def) {
  const step = (def.steps || []).find((s) => s.tool === "ui_propose_levers");
  return [...(step?.input?.levers || []).map((l) => l.lever_id), "keep"];
}

/**
 * Plays a pre-run through the simulation player in one language with automatic decisions: the review
 * confirmed, the lever `choice` chosen. createPlayer: js/simulation.js's createSimulationPlayer (passed in,
 * so this module stays importable without it). Returns { problems, state, blocks, layers }.
 */
export async function playProblems(def, { lang, choice = "keep", createPlayer }) {
  const problems = [];
  // A pre-run whose report says "not_a_service" ends that way: no blocks, no review, no levers.
  const expected = (def?.steps || []).some((s) => s.report?.outcome === "not_a_service") ? "not_a_service" : "done";
  const offs = [
    bus.on("review_request", (ev) => bus.emit("review_decision", { request_id: ev.payload.request_id, action: "confirm", by: "user" })),
    bus.on("levers", (ev) => bus.emit("lever_decision", { options_seq: ev.payload.options_seq, lever_id: choice, by: "user" })),
    bus.on("choice_request", (ev) => bus.emit("choice_decision", { request_id: ev.payload.request_id, chosen: 0, by: "user" })),
    bus.on("notice", (ev) => { if (ev.payload.level === "error") problems.push({ code: "play", where: `${lang} ${choice}`, message: `${ev.payload.key}: ${ev.payload.vars?.message || ""}` }); }),
    bus.on("run_end", (ev) => { if (ev.payload.status !== expected) problems.push({ code: "play", where: `${lang} ${choice}`, message: `the run ended with ${ev.payload.status}, not ${expected}` }); })
  ];
  const player = createPlayer({ getSpeed: () => 1e7 });
  let toolbox = null;
  const grab = bus.on("tool_call", () => { toolbox = toolbox || player.toolbox(); });
  try {
    await player.play(structuredClone(def), { lang, service: def.query, mode: "check" });
  } finally {
    offs.forEach((off) => off());
    grab();
  }
  if (!toolbox) return { problems: [...problems, { code: "play", where: lang, message: "no tool ran" }], state: null };
  for (const a of toolbox.auditLog()) {
    for (const b of a.bad) {
      if (b.tokens.length) problems.push({ code: "audit", where: `${lang} ${a.tool} ${b.field}`, message: `blocked tokens: ${b.tokens.join(", ")}` });
      if (b.unknownFacts.length) problems.push({ code: "unknown_fact", where: `${lang} ${a.tool} ${b.field}`, message: `unknown fact keys: ${b.unknownFacts.join(", ")}` });
    }
  }
  const state = toolbox.state();
  const result = toolbox.result();
  if (!state.reported) problems.push({ code: "play", where: `${lang} ${choice}`, message: "the run published no report" });
  for (const l of LAYERS) {
    if (!result?.layers?.[l]) continue;
    if (result.layers[l].status === "open") problems.push({ code: "play", where: `${lang} ${l}`, message: "a layer has neither blocks nor a status" });
  }
  return { problems, state, result, blocks: toolbox.blocks() };
}
