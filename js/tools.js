// The live agent's tools: the fifteen client tools' JSON Schemas (PLAN.md b.3), the two server tools, and
// the executors that run in the browser. The simulation player and tools/check-runs.mjs drive the same
// executors with a pre-run's recorded inputs, so a replay shows exactly what the code computes for them.
// Every screen effect is a run event on the bus (js/events.js).
//
// Control in code, not only in the prompt:
//   - every call is validated against its schema (js/schema.js); a failure returns is_error with what
//     to fix. `strict` is not sent (PLAN.md P5);
//   - evidence: provenance, quote checks and field gating in js/evidence.js; an evidence URL the run
//     never returned is refused with is_error and the URLs the run may use (AC-09);
//   - figures: the engine (js/engine.js) computes every level, score and share; the model cites them
//     only as {{fact:key}} with keys a tool returned in this run, and the fact audit (js/facts.js)
//     refuses any other number on every audited text. After two failed retries the text is accepted
//     with an "Unchecked" tag and a console line, never silently (rule 4);
//   - the sequence of a run: js/guards.js (rules 2, 5 and 7);
//   - the person's steps (the choice of a service, the review, the lever decision) come only from the
//     person's clicks on the bus; the tool waits for them.

import { SERVER_TOOLS } from "./config.js";
import { validate, describeErrors } from "./schema.js";
import { auditText, FACT_RE } from "./facts.js";
import { LAYERS, METHOD_VERSION, EQUAL_LAYER_WEIGHTS, score, whatIf, assessBlock } from "./engine.js";
import { CLASSES } from "./classes.js";
import { checkEvidence, gateBlock, normaliseText } from "./evidence.js";
import { guardTool } from "./guards.js";
import { lookup, entryById, entryTexts } from "./catalogue.js";

// ---- schemas (PLAN.md b.3), composed from shared parts so the definitions hold no $ref ----------------

const COUNTRY = { type: "string", pattern: "^([A-Z]{2}|UNKNOWN)$", description: "ISO 3166-1 alpha-2 code, or UNKNOWN when no source names the country." };
const PARTY = {
  type: "object", additionalProperties: false, required: ["name", "country"],
  properties: {
    name: { type: "string" }, country: COUNTRY,
    parent: { anyOf: [{ type: "null" }, { type: "object", additionalProperties: false, required: ["name", "country"], properties: { name: { type: "string" }, country: COUNTRY } }] }
  }
};
const EVIDENCE = (fields) => ({
  type: "array", minItems: 1,
  items: {
    type: "object", additionalProperties: false, required: ["url", "title", "lang", "supports"],
    properties: {
      url: { type: "string" }, title: { type: "string" },
      quote: { type: "string", maxLength: 150, description: "Verbatim, at most 150 characters. Omit it to let code take the quote from this run's citation of the URL." },
      lang: { type: "string", pattern: "^[a-z]{2}$" },
      supports: { type: "array", minItems: 1, items: { type: "string", enum: fields } }
    }
  }
});
const LAYER = { type: "string", enum: [...LAYERS] };
const BLOCK_FIELDS = ["tech", "tech.parent", "operator", "operator.parent", "hosting", "licence", "exit"];
const PROFILE_FIELDS = ["what", "how", "owner", "operator", "status", "legal_basis", "governance"];
const CLASS = { type: "string", enum: [...CLASSES] };
const HOSTING = { type: "string", enum: ["EU", "NON_EU", "UNKNOWN"] };
const LICENCE = { type: "string", enum: ["open_source", "proprietary", "unknown"] };
const BLOCK_ID = { type: "string", pattern: "^B-\\d{2}$" };
const CHANGES = {
  type: "array", minItems: 1,
  items: { type: "object", additionalProperties: false, required: ["block_id"], properties: { block_id: BLOCK_ID, made_in: CLASS, run_by: CLASS, hosting: HOSTING, licence: LICENCE } }
};
const BLOCK = {
  layer: LAYER, name: { type: "string" }, role: { type: "string" }, note: { type: "string" },
  criticality: { type: "string", enum: ["critical", "important", "supporting"] }, tech: PARTY, operator: PARTY,
  hosting: HOSTING, licence: LICENCE,
  exit: { type: "string", enum: ["easy", "possible", "hard", "unknown"] },
  confidence: { type: "string", enum: ["high", "medium", "low"] }
};
const obj = (required, properties) => ({ type: "object", additionalProperties: false, required, properties });

export const CLIENT_TOOLS = Object.freeze([
  { name: "cat_lookup", description: "Find the service in the bundled catalogue by name or alias. Returns up to five entries with id, names in both languages, category, status note and verified starting URLs; those URLs become fetchable. An empty list means the service is not in the catalogue: research it from the web.",
    input_schema: obj(["query"], { query: { type: "string" } }) },
  { name: "ref_facts", description: "Bundled structural facts verified at build time, each with URL, title, verbatim quote and the fields it supports, for example how iOS and Android apps are distributed and how they receive push messages.",
    input_schema: obj(["topic"], { topic: { type: "string", enum: ["app_distribution", "push_messaging", "mobile_os", "browsers", "federal_it"] } }) },
  { name: "rec_profile", description: "Record the service profile: names, category, what it does, how it works, owner, operator, status, legal basis and sources. Write in the run's language; figures only as placeholders. The category self_assessment is for this prototype itself only.",
    input_schema: obj(["names", "category", "what", "how", "owner", "operator", "status", "evidence"], {
      names: { type: "array", minItems: 1, items: { type: "string" } }, category: { type: "string", enum: ["base_service", "platform_or_access", "self_assessment"] },
      what: { type: "string" }, how: { type: "string" }, owner: PARTY, operator: PARTY, status: { type: "string" },
      legal_basis: { type: "string" }, governance: { type: "string" }, evidence: EVIDENCE(PROFILE_FIELDS)
    }) },
  { name: "rec_block", description: "Record one building block with its evidence. Code checks each URL's provenance and each quote, derives Made in and Run by, and computes the level; a field without a verified quote counts as unknown. Returns the block id and what counted.",
    input_schema: obj(["layer", "name", "role", "criticality", "tech", "operator", "hosting", "licence", "exit", "evidence", "confidence"], { ...BLOCK, evidence: EVIDENCE(BLOCK_FIELDS) }) },
  { name: "rec_block_update", description: "Change fields of a recorded block, with new evidence where a field needs it and a one-line reason.",
    input_schema: obj(["block_id", "changes", "reason"], { block_id: BLOCK_ID, changes: { type: "object", additionalProperties: false, properties: BLOCK }, evidence: EVIDENCE(BLOCK_FIELDS), reason: { type: "string" } }) },
  { name: "rec_block_remove", description: "Remove a recorded block, with a one-line reason.",
    input_schema: obj(["block_id", "reason"], { block_id: BLOCK_ID, reason: { type: "string" } }) },
  { name: "rec_layer", description: "Mark a layer 'not applicable' (with a source saying why) or 'no evidence found', with a short reason.",
    input_schema: obj(["layer", "status", "reason"], { layer: LAYER, status: { type: "string", enum: ["not_applicable", "no_evidence"] }, reason: { type: "string" }, evidence: EVIDENCE(["not_applicable"]) }) },
  { name: "eng_score", description: "The engine's scores for the current blocks: layer scores, overall score, weakest critical link, evidence coverage, exclusive non-EU control and the Made-in and Run-by counts, each with its fact key and display value.",
    input_schema: obj([], {}) },
  { name: "eng_whatif", description: "Apply one lever's changes (Made-in class, Run-by class, hosting or licence of named blocks; never a company) to a copy of the blocks and return its figures as fact keys. The assessment does not change.",
    input_schema: obj(["lever_id", "changes"], { lever_id: { type: "string", enum: ["L1", "L2", "L3"] }, changes: CHANGES }) },
  { name: "ui_progress", description: "One short sentence of narration for the console, in the run's language. Audited: figures only as placeholders.",
    input_schema: obj(["text"], { text: { type: "string" } }) },
  { name: "ui_choose_service", description: "Show up to five candidates for an ambiguous name and wait for the person's choice.",
    input_schema: obj(["question", "candidates"], {
      question: { type: "string" },
      candidates: { type: "array", minItems: 2, maxItems: 5, items: obj(["name", "description"], { entry_id: { type: "string" }, name: { type: "string" }, description: { type: "string" } }) }
    }) },
  { name: "ui_request_review", description: "Hand the findings to the person and wait until they confirm, correct (each correction with a reason) or skip. Returns what they did.",
    input_schema: obj(["summary"], { summary: { type: "string" }, focus: { type: "array", items: BLOCK_ID } }) },
  { name: "ui_propose_levers", description: "Propose up to three levers, each a set of block changes with a rationale and evidence that such an alternative exists; 'Keep as is' is added in code. The engine prices each; waits for the person's choice.",
    input_schema: obj(["levers"], {
      levers: { type: "array", minItems: 1, maxItems: 3, items: obj(["lever_id", "title", "rationale", "changes", "evidence"], {
        lever_id: { type: "string", enum: ["L1", "L2", "L3"] }, title: { type: "string" }, rationale: { type: "string" }, changes: CHANGES, evidence: EVIDENCE(["alternative"])
      }) },
      // Version 2.1.0: research leads a source names for a weak block's function, never ranked (brief SA-03).
      starting_points: { type: "array", maxItems: 12, items: obj(["block_id", "name", "evidence"], {
        block_id: BLOCK_ID, name: { type: "string" }, note: { type: "string" }, catalogue_id: { type: "string" },
        tech: PARTY, operator: PARTY, hosting: HOSTING, licence: LICENCE,
        evidence: EVIDENCE(["alternative", "tech", "tech.parent", "operator", "operator.parent", "hosting", "licence"])
      }) }
    }) },
  { name: "ui_draft_memo", description: "Draft the memo for the chosen lever (or for keeping things as they are). Audited; code adds the header, the before and after figures and 'Draft. Nothing is sent.'",
    input_schema: obj(["lever_id", "subject", "body"], { lever_id: { type: "string", enum: ["L1", "L2", "L3", "keep"] }, subject: { type: "string" }, body: { type: "string" } }) },
  { name: "ui_final_report", description: "End the run with its outcome and the report in Markdown, figures only as placeholders.",
    input_schema: obj(["outcome", "markdown"], { outcome: { type: "string", enum: ["assessed", "not_a_service", "stopped"] }, markdown: { type: "string" } }) }
]);

/** The tools array of every request of a run: the fifteen client tools and the two server tools, fixed (rule 8). */
export function toolDefinitions() {
  return [...CLIENT_TOOLS.map((t) => structuredClone(t)), ...SERVER_TOOLS.map((t) => structuredClone(t))];
}

/** Tools that wait for the person. */
export const UI_BLOCKING_TOOLS = new Set(["ui_choose_service", "ui_request_review", "ui_propose_levers"]);

/** Server tools run on Anthropic's servers; the agent only reads their result blocks. */
export const SERVER_TOOL_NAMES = new Set(SERVER_TOOLS.map((t) => t.name));

const SCHEMAS = Object.fromEntries(CLIENT_TOOLS.map((t) => [t.name, t.input_schema]));

/** The parties' names a tool records (maker, operator, owner and their parents), as [field, text] pairs. */
const partyNames = (o, prefix = "") => ["tech", "operator", "owner"].flatMap((k) => [
  ...(typeof o?.[k]?.name === "string" ? [[`${prefix}${k}.name`, o[k].name]] : []),
  ...(typeof o?.[k]?.parent?.name === "string" ? [[`${prefix}${k}.parent.name`, o[k].parent.name]] : [])
]);

/**
 * The texts of each tool that the fact audit reads (rule 4), as [field, text] pairs: every text of the
 * model's that the screen shows, the names of services and parties and the reasons included (the review's
 * finding R-14).
 */
const AUDITED = {
  ui_progress: (i) => [["text", i.text]],
  ui_choose_service: (i) => [["question", i.question], ...(i.candidates || []).flatMap((c, k) => [[`candidates[${k}].name`, c.name], [`candidates[${k}].description`, c.description]])].filter(([, v]) => typeof v === "string"),
  rec_profile: (i) => [...["what", "how", "status", "legal_basis", "governance"].filter((f) => typeof i[f] === "string").map((f) => [f, i[f]]), ...(i.names || []).filter((n) => typeof n === "string").map((n, k) => [`names[${k}]`, n]), ...partyNames(i)],
  rec_block: (i) => [...["name", "role", "note"].filter((f) => typeof i[f] === "string").map((f) => [f, i[f]]), ...partyNames(i)],
  rec_block_update: (i) => [...["name", "role", "note"].filter((f) => typeof i.changes?.[f] === "string").map((f) => [f, i.changes[f]]), ...partyNames(i.changes, "changes."), ...(typeof i.reason === "string" ? [["reason", i.reason]] : [])],
  rec_block_remove: (i) => (typeof i.reason === "string" ? [["reason", i.reason]] : []),
  rec_layer: (i) => [["reason", i.reason]],
  ui_request_review: (i) => [["summary", i.summary]],
  ui_propose_levers: (i) => [
    ...(i.levers || []).flatMap((l) => [[`${l.lever_id}.title`, l.title], [`${l.lever_id}.rationale`, l.rationale]]),
    ...(i.starting_points || []).flatMap((p, k) => [[`starting_points[${k}].name`, p.name], ...(typeof p.note === "string" ? [[`starting_points[${k}].note`, p.note]] : []), ...partyNames(p, `starting_points[${k}].`)])
  ].filter(([, v]) => typeof v === "string"),
  ui_draft_memo: (i) => [["subject", i.subject], ["body", i.body]],
  ui_final_report: (i) => [["markdown", i.markdown]]
};

/** The audit refuses a text this many times, then accepts it with an "Unchecked" tag (rule 4). */
export const FACT_RETRIES = 2;

/** A pre-run's text in one language: every { en, de } object is replaced by its value in `lang`. */
export function pickLang(value, lang) {
  if (Array.isArray(value)) return value.map((v) => pickLang(v, lang));
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 2 && keys.includes("en") && keys.includes("de")) return value[lang];
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, pickLang(v, lang)]));
  }
  return value;
}

/** The fact keys a text cites. */
export function factKeysIn(text) {
  return [...String(text ?? "").matchAll(new RegExp(FACT_RE.source, "g"))].map((m) => m[1]);
}

const isoDay = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);

// ---- executors ------------------------------------------------------------------------------------

/**
 * The executor of one run. ctx: {
 *   emit(type, payload)        run events (dropped by the producer once the run has ended)
 *   lang                       the run's language, "en" or "de"
 *   mode                       "live", "simulation" or "check" (tools/check-runs.mjs: no retries)
 *   registry                   the run's evidence registry (js/evidence.js)
 *   next(type, predicate)      resolves with the payload of the next matching decision event
 *   onPhase(state)             the run state, for the rail and the status pill
 *   now()                      today, for the read_on date of evidence
 *   catalogue, refFacts        the bundled data (window.SA_CATALOGUE and window.SA_REF_FACTS by default)
 *   service                    { query, entry_id }
 *   weights                    the overall score's layer weights when the run starts (js/weights.js;
 *                              equal by default); setWeights() changes them during or after the run
 * }
 * execute(name, input) resolves { content (string for tool_result), isError, result (object), summary }.
 */
export function createToolbox(ctx) {
  const lang = ctx.lang === "de" ? "de" : "en";
  const catalogueData = ctx.catalogue || globalThis.window?.SA_CATALOGUE;
  const refData = ctx.refFacts || globalThis.window?.SA_REF_FACTS;
  const today = () => isoDay(ctx.now ? ctx.now() : new Date());
  const run = {
    entries: new Map(),        // catalogue entries cat_lookup returned
    profile: null,
    blocks: new Map(),         // id → { recorded, checks, corrections, log, view }
    nextId: 1,
    layerStatus: {},           // layer → { status, reason, evidence }
    weights: { ...EQUAL_LAYER_WEIGHTS, ...(ctx.weights || {}) },
    result: null,              // the engine's latest result on the current blocks
    whatifs: {},               // lever id → { changes, facts }
    known: new Set(),          // fact keys a tool returned to the model
    quotes: new Set(),         // verified quotes of the recorded evidence and the reference facts
    review: "none",
    reviewAction: null,
    corrections: [],           // the reviewer's corrections, in order
    decisions: [],             // the person's steps with their times: the choice, the review, the lever
    levers: "none",
    leverSet: null,            // the levers payload on screen
    optionsSeq: 0,
    decision: null,
    memo: null,
    reported: false,
    outcome: null,
    scoredFresh: false,
    failures: new Map(),       // tool → failed audits in a row
    unchecked: [],             // { tool, field, tokens }
    auditLog: [],              // every audit outcome, for check-runs and the tests
    requests: 0
  };

  const emit = (type, payload) => ctx.emit?.(type, payload);
  const serviceName = () => ctx.service?.name || ctx.service?.query || "";
  const phase = (s) => ctx.onPhase?.(s);

  // ---- state -------------------------------------------------------------------------------------
  const effectiveBlocks = () => [...run.blocks.values()].map((b) => ({ id: b.recorded.id, ...b.effective }));
  const layerStatusMap = () => Object.fromEntries(Object.entries(run.layerStatus).map(([l, s]) => [l, s.status]));
  const recompute = () => {
    run.result = score(effectiveBlocks(), { layerWeights: run.weights, layerStatus: layerStatusMap() });
    for (const b of run.blocks.values()) b.view = viewOf(b);
    return run.result;
  };
  const values = () => {
    const out = { ...(run.result?.facts || {}) };
    for (const w of Object.values(run.whatifs)) Object.assign(out, w.facts);
    return out;
  };
  /** The values of the fact keys a text cites, at this moment (the text keeps the figures it was written with). */
  const usedValues = (text) => {
    const all = values();
    return Object.fromEntries(factKeysIn(text).map((k) => [k, all[k] ?? null]));
  };
  const guardState = (input) => ({
    reported: run.reported,
    blocks: run.blocks.size,
    review: run.review,
    scoredFresh: run.scoredFresh,
    layerBlocks: Object.fromEntries(LAYERS.map((l) => [l, [...run.blocks.values()].filter((b) => b.recorded.layer === l).length])),
    layerStatus: layerStatusMap(),
    levers: run.levers,
    decision: run.decision,
    memo: !!run.memo,
    ...input
  });

  /** The run's evidence as the fact audit reads it (rule 4). */
  function corpus() {
    const texts = [];
    for (const e of run.entries.values()) texts.push(...entryTexts(e));
    return { titles: ctx.registry.titles(), quotes: [...run.quotes], texts, urls: ctx.registry.allowedUrls() };
  }

  /**
   * The fact audit on a tool's texts. Returns { reject } with what to fix, or { unchecked: tokens } once
   * the retries are used up (and in check mode, where a failure is recorded, not retried), or {}.
   */
  function audit(tool, input) {
    const fields = (AUDITED[tool] ? AUDITED[tool](input) : []).filter(([, text]) => typeof text === "string" && text.trim());
    const bad = [];
    const unknownFacts = [];
    const ev = corpus();
    for (const [field, text] of fields) {
      const r = auditText(text, { facts: run.known, evidence: ev });
      if (!r.pass) bad.push({ field, tokens: r.tokens, unknownFacts: r.unknownFacts });
      for (const k of r.unknownFacts) if (!unknownFacts.includes(k)) unknownFacts.push(k);
    }
    run.auditLog.push({ tool, pass: !bad.length, bad });
    if (!bad.length) { run.failures.set(tool, 0); return {}; }
    const tokens = [...new Set(bad.flatMap((b) => b.tokens))];
    const tries = run.failures.get(tool) || 0;
    if (ctx.mode !== "check" && tries < FACT_RETRIES) {
      run.failures.set(tool, tries + 1);
      const parts = [];
      if (tokens.length) parts.push(`These figures or proportions are written outside a placeholder: ${tokens.join(", ")}. Never write a level, score, share or proportion yourself: cite the engine's figures as {{fact:<key>}} with keys a tool returned in this run, write counts as words ("three layers"), and quote a source only verbatim and in quotation marks.`);
      if (unknownFacts.length) parts.push(`These fact keys were never returned in this run: ${unknownFacts.join(", ")}. Use only keys that eng_score, eng_whatif, ui_propose_levers or rec_block returned.`);
      parts.push(`Fields: ${bad.map((b) => b.field).join(", ")}. Then call ${tool} again.`);
      return { reject: { error: parts.join(" "), audit: { tokens, unknown_fact_keys: unknownFacts, fields: bad.map((b) => b.field) } } };
    }
    run.failures.set(tool, 0);
    const shown = [...tokens, ...unknownFacts.map((k) => `{{fact:${k}}}`)];
    run.unchecked.push({ tool, fields: bad.map((b) => b.field), tokens: shown });
    emit("notice", { level: "warn", key: "notice.unchecked", vars: { tokens: shown.join(", ") } });
    return { unchecked: shown };
  }

  /** Evidence of a call: refused URLs end the call (AC-09); every check is shown on the bus. */
  function evidenceFor(subject, items, { quiet = false } = {}) {
    const { refused, checks } = checkEvidence(ctx.registry, items, { readOn: today() });
    if (refused.length) {
      return {
        error: {
          error: `These evidence URLs were not returned by this run's web_search or web_fetch results, nor listed by cat_lookup or ref_facts: ${refused.join(", ")}. Cite only URLs this run returned. Fetch a page first if you have only its address.`,
          refused_urls: refused,
          allowed_urls: ctx.registry.allowedUrls()
        }
      };
    }
    for (const c of checks) {
      if (c.verified && c.quote) run.quotes.add(normaliseText(c.quote));
      if (!quiet) emit("evidence_check", { subject, url: c.url, quote: c.quote, verified: c.verified, via: c.via, fields: c.supports, lang: c.lang, title: c.title });
    }
    return { checks };
  }

  const evidenceSummary = (checks) => checks.map((c) => ({ url: c.url, verified: c.verified, via: c.via, supports: c.supports, ...(c.quote_from ? { quote_from: c.quote_from } : {}), ...(c.quote ? {} : { quote: null }) }));
  const unverifiedHint = (checks) => checks.some((c) => !c.verified)
    ? "Some quotes are not verified: a quote counts only when it occurs verbatim in the page as fetched in this run, or in a citation of that URL. For a PDF or a search result you have not fetched, first write one plain sentence that cites the source, then send the evidence without a quote so code takes it from the citation."
    : undefined;

  // ---- blocks -------------------------------------------------------------------------------------
  function viewOf(b) {
    const assessed = run.result?.blocks.find((x) => x.id === b.recorded.id) || {};
    const r = b.recorded;
    return {
      id: r.id, layer: r.layer, name: r.name, role: r.role, ...(r.note ? { note: r.note } : {}),
      criticality: b.effective.criticality,
      tech: b.corrections.tech || r.tech, operator: b.corrections.operator || r.operator,
      hosting: b.corrections.hosting ?? r.hosting, licence: b.corrections.licence ?? r.licence, exit: b.corrections.exit ?? r.exit,
      confidence: r.confidence,
      evidence: b.checks.map((c) => ({ ...c })),
      tech_class: assessed.tech_class ?? "UNKNOWN",
      operator_class: assessed.operator_class ?? "UNKNOWN",
      level: assessed.level ?? null,
      partly_unknown: !!assessed.partly_unknown,
      unscored: !!assessed.unscored,
      unknown_fields: b.unknown_fields.slice(),
      scored: { hosting: b.effective.hosting, licence: b.effective.licence, exit: b.effective.exit, criticality: b.effective.criticality,
        tech: countedValue(b, "tech"), operator: countedValue(b, "operator") },
      corrections: b.log.map((x) => ({ ...x })),
      lang
    };
  }

  function regate(b) {
    const g = gateBlock(b.recorded, b.checks, b.corrections);
    b.effective = g.effective;
    b.unknown_fields = g.unknown_fields;
  }

  function scoreUpdate(partial = true) {
    emit("score_update", { facts: { ...run.result.facts }, partial, result: publicResult() });
  }

  /** The engine's result as the screen draws it (no internal fields). */
  function publicResult() {
    const r = run.result;
    return r ? { method_version: r.method_version, layers: r.layers, overall: r.overall, weakest: r.weakest, coverage: r.coverage, exclusive_non_eu: r.exclusive_non_eu, counts: r.counts, facts: { ...r.facts }, blocks: [...run.blocks.values()].map((b) => b.view) } : null;
  }

  const blockReply = (b, extra = {}) => {
    const v = b.view;
    const key = `seal.${v.id}`;
    run.known.add(key);
    return {
      block_id: v.id, layer: v.layer, made_in: v.tech_class, run_by: v.operator_class,
      level: v.level, fact_key: key, partly_unknown: v.partly_unknown, unscored: v.unscored,
      unknown_fields: v.unknown_fields.map((f) => ({ field: f, why: "no verified quote supports it" })),
      evidence: evidenceSummary(v.evidence),
      ...extra,
      hint: unverifiedHint(v.evidence),
      note: `Cite this block's level only as {{fact:${key}}}.`
    };
  };

  // ---- handlers -------------------------------------------------------------------------------------
  const handlers = {
    cat_lookup(i) {
      phase("understanding");
      const hits = lookup(i.query, { data: catalogueData, limit: 5 });
      const entries = hits.map(({ entry, how }) => {
        run.entries.set(entry.id, entry);
        for (const u of entry.urls || []) ctx.registry.allowUrl(u.url, { via: "catalogue", title: u.title });
        return {
          id: entry.id, names: entry.names, category: entry.category, match: how,
          description: entry.description?.[lang], status: entry.status?.[lang],
          urls: (entry.urls || []).map((u) => ({ url: u.url, title: u.title, lang: u.lang }))
        };
      });
      return entries.length
        ? { entries, note: "These starting URLs are now fetchable and citable. Fetch them before you rely on them." }
        : { entries: [], note: "The service is not in the catalogue. Research it from the web." };
    },

    ref_facts(i) {
      const facts = (refData?.facts || []).filter((f) => f.topic === i.topic).map((f) => {
        ctx.registry.addVerifiedQuote(f.evidence.url, f.evidence.quote, "ref_facts");
        ctx.registry.allowUrl(f.evidence.url, { via: "ref_facts", title: f.evidence.title });
        run.quotes.add(normaliseText(f.evidence.quote));
        return { id: f.id, statement: f.statement?.[lang], evidence: { ...f.evidence } };
      });
      return facts.length
        ? { topic: i.topic, facts, note: "These quotes are verified; cite them with their URL and the fields they support." }
        : { topic: i.topic, facts: [], note: "No bundled facts for this topic yet. Research it from the web." };
    },

    rec_profile(i) {
      phase("understanding");
      const ev = evidenceFor("profile", i.evidence);
      if (ev.error) return ev.error;
      const a = audit("rec_profile", i);
      if (a.reject) return a.reject;
      const verified = new Set(ev.checks.filter((c) => c.verified).flatMap((c) => c.supports));
      run.profile = { ...i, evidence: ev.checks, lang, ...(a.unchecked ? { unchecked: a.unchecked } : {}) };
      emit("profile_recorded", { profile: run.profile, evidence_checks: ev.checks });
      return {
        ok: true,
        verified_fields: PROFILE_FIELDS.filter((f) => verified.has(f)),
        unverified_fields: PROFILE_FIELDS.filter((f) => !verified.has(f) && (i[f] !== undefined)),
        hint: unverifiedHint(ev.checks),
        next: "Research the six layers in the portal's order, recording blocks with rec_block and marking layers without evidence with rec_layer."
      };
    },

    rec_block(i) {
      phase("researching");
      const ev = evidenceFor(null, i.evidence, { quiet: true });
      if (ev.error) return ev.error;
      const a = audit("rec_block", i);
      if (a.reject) return a.reject;
      if (run.nextId > 99) return { error: "A run records at most 99 building blocks." };
      const id = `B-${String(run.nextId++).padStart(2, "0")}`;
      const { evidence, ...fields } = i;
      const b = { recorded: { id, ...fields }, checks: ev.checks, corrections: {}, log: [], unchecked: a.unchecked || null };
      regate(b);
      run.blocks.set(id, b);
      if (run.layerStatus[i.layer]) delete run.layerStatus[i.layer];
      run.scoredFresh = false;
      recompute();
      for (const c of b.checks) emit("evidence_check", { subject: id, url: c.url, quote: c.quote, verified: c.verified, via: c.via, fields: c.supports, lang: c.lang, title: c.title });
      emit("block_recorded", { op: "add", block: b.view, ...(a.unchecked ? { unchecked: a.unchecked } : {}) });
      scoreUpdate(true);
      return blockReply(b);
    },

    rec_block_update(i) {
      phase("researching");
      const b = run.blocks.get(i.block_id);
      if (!b) return { error: `There is no block ${i.block_id}. Recorded blocks: ${[...run.blocks.keys()].join(", ") || "none"}.` };
      if (!Object.keys(i.changes || {}).length && !i.evidence) return { error: "Name at least one change, or new evidence." };
      let checks = [];
      if (i.evidence) {
        const ev = evidenceFor(i.block_id, i.evidence);
        if (ev.error) return ev.error;
        checks = ev.checks;
      }
      const a = audit("rec_block_update", i);
      if (a.reject) return a.reject;
      const before = b.view;
      b.recorded = { ...b.recorded, ...structuredClone(i.changes || {}) };
      b.checks = [...b.checks, ...checks];
      regate(b);
      run.scoredFresh = false;
      recompute();
      emit("block_recorded", { op: "update", block: b.view, reason: i.reason, ...(a.unchecked ? { unchecked: a.unchecked } : {}) });
      scoreUpdate(true);
      return blockReply(b, { changed: Object.keys(i.changes || {}), previous_level: before.level });
    },

    rec_block_remove(i) {
      phase("researching");
      const b = run.blocks.get(i.block_id);
      if (!b) return { error: `There is no block ${i.block_id}. Recorded blocks: ${[...run.blocks.keys()].join(", ") || "none"}.` };
      const a = audit("rec_block_remove", i);
      if (a.reject) return a.reject;
      run.blocks.delete(i.block_id);
      run.scoredFresh = false;
      recompute();
      emit("block_recorded", { op: "remove", block: { ...b.view }, reason: i.reason });
      scoreUpdate(true);
      return { ok: true, removed: i.block_id, remaining: [...run.blocks.keys()] };
    },

    rec_layer(i) {
      phase("researching");
      if ([...run.blocks.values()].some((b) => b.recorded.layer === i.layer)) {
        return { error: `The layer ${i.layer} has recorded blocks; its status comes from them. Remove the blocks first if they do not belong.` };
      }
      if (i.status === "not_applicable" && !i.evidence) return { error: "\"not_applicable\" needs a source saying why: add evidence that supports not_applicable." };
      let checks = [];
      if (i.evidence) {
        const ev = evidenceFor(i.layer, i.evidence);
        if (ev.error) return ev.error;
        checks = ev.checks;
      }
      const a = audit("rec_layer", i);
      if (a.reject) return a.reject;
      run.layerStatus[i.layer] = { status: i.status, reason: i.reason, evidence: checks, lang, ...(a.unchecked ? { unchecked: a.unchecked } : {}) };
      run.scoredFresh = false;
      recompute();
      emit("layer_status", { layer: i.layer, status: i.status, reason: i.reason, evidence: checks, lang, ...(a.unchecked ? { unchecked: a.unchecked } : {}) });
      scoreUpdate(true);
      return { ok: true, layer: i.layer, status: i.status, open_layers: LAYERS.filter((l) => !run.layerStatus[l] && ![...run.blocks.values()].some((b) => b.recorded.layer === l)) };
    },

    eng_score() {
      phase("scoring");
      const r = recompute();
      run.scoredFresh = true;
      for (const k of Object.keys(r.facts)) run.known.add(k);
      scoreUpdate(false);
      const open = LAYERS.filter((l) => r.layers[l].status === "open");
      return {
        method_version: METHOD_VERSION,
        facts: Object.entries(r.facts).filter(([k]) => !k.startsWith("count.") || r.facts[k] > 0).map(([key, value]) => ({ key, value })),
        layers: Object.fromEntries(LAYERS.map((l) => [l, { status: r.layers[l].status, blocks: r.layers[l].blocks, scored: r.layers[l].scored, fact_key: `score.layer.${l}` }])),
        ...(open.length ? { open_layers: open, hint: "Every layer needs blocks or a status (rec_layer) before the review." } : {}),
        note: "Cite every figure as {{fact:<key>}}; never write a number, a level or a share yourself. A null value is no data, never zero."
      };
    },

    eng_whatif(i) {
      phase("recommending");
      const missing = i.changes.map((c) => c.block_id).filter((id) => !run.blocks.has(id));
      if (missing.length) return { error: `There is no block ${missing.join(", ")}. Recorded blocks: ${[...run.blocks.keys()].join(", ") || "none"}.` };
      const w = whatIf(effectiveBlocks(), i.lever_id, i.changes, { layerWeights: run.weights, layerStatus: layerStatusMap() });
      run.whatifs[i.lever_id] = { changes: structuredClone(i.changes), facts: w.facts };
      for (const k of Object.keys(w.facts)) run.known.add(k);
      return {
        lever_id: i.lever_id,
        facts: Object.entries(w.facts).map(([key, value]) => ({ key, value })),
        note: "The assessment itself is unchanged. Cite these figures only as placeholders."
      };
    },

    ui_progress(i) {
      const a = audit("ui_progress", i);
      if (a.reject) return a.reject;
      emit("narration", { msg_id: `p-${++run.requests}`, text: i.text, done: true, lang, audit: a.unchecked ? "unchecked" : "passed", values: usedValues(i.text), ...(a.unchecked ? { unchecked: a.unchecked } : {}) });
      return { ok: true };
    },

    async ui_choose_service(i) {
      const a = audit("ui_choose_service", i);
      if (a.reject) return a.reject;
      const request_id = `choice-${++run.requests}`;
      phase("awaiting_choice");
      emit("choice_request", { request_id, question: i.question, candidates: i.candidates, lang });
      const d = await ctx.next("choice_decision", (p) => p.request_id === request_id);
      run.decisions.push({ kind: "choice", request_id, chosen: Number.isInteger(d.chosen) ? d.chosen : null, by: "user", ts: new Date().toISOString() });
      phase("understanding");
      const chosen = Number.isInteger(d.chosen) ? i.candidates[d.chosen] : null;
      return chosen
        ? { chosen, next: chosen.entry_id ? "Look the entry up with cat_lookup and continue." : "Research this service and continue." }
        : { chosen: null, next: "The person chose none of them. End with ui_final_report and outcome \"stopped\", saying in one sentence that no service was chosen." };
    },

    async ui_request_review(i) {
      const a = audit("ui_request_review", i);
      if (a.reject) return a.reject;
      const request_id = `review-${++run.requests}`;
      run.review = "requested";
      phase("awaiting_review");
      const focus = (i.focus || []).filter((id) => run.blocks.has(id));
      emit("review_request", { request_id, summary: i.summary, values: usedValues(i.summary), block_ids: focus.length ? focus : [...run.blocks.keys()], lang, ...(a.unchecked ? { unchecked: a.unchecked } : {}) });
      for (;;) {
        const d = await ctx.next("review_decision", (p) => p.request_id === request_id);
        if (d.action === "correct") { applyCorrection(d); continue; }
        run.review = "resolved";
        run.reviewAction = d.action === "skip" ? "skip" : "confirm";
        run.decisions.push({ kind: "review", request_id, action: run.reviewAction, by: "user", ts: new Date().toISOString() });
        break;
      }
      run.scoredFresh = true;
      for (const k of Object.keys(run.result.facts)) run.known.add(k);
      phase("recommending");
      return {
        action: run.reviewAction,
        corrections: run.corrections.map((c) => ({ block_id: c.block_id, field: c.field, from: c.from, to: c.to, reason: c.reason })),
        facts_after_review: Object.entries(run.result.facts).filter(([k]) => !k.startsWith("count.")).map(([key, value]) => ({ key, value })),
        next: "The findings are frozen now. Price up to three levers with eng_whatif and propose them with ui_propose_levers. Do not describe the person's corrections as your findings."
      };
    },

    async ui_propose_levers(i) {
      const ids = i.levers.map((l) => l.lever_id);
      if (new Set(ids).size !== ids.length) return { error: "Each lever needs its own id (L1, L2, L3)." };
      const missing = [...new Set(i.levers.flatMap((l) => l.changes.map((c) => c.block_id)).filter((id) => !run.blocks.has(id)))];
      if (missing.length) return { error: `There is no block ${missing.join(", ")}. Recorded blocks: ${[...run.blocks.keys()].join(", ")}.` };
      const checks = {};
      for (const l of i.levers) {
        const ev = evidenceFor(`lever:${l.lever_id}`, l.evidence);
        if (ev.error) return ev.error;
        checks[l.lever_id] = ev.checks;
      }
      const sps = i.starting_points || [];
      const spMissing = [...new Set(sps.map((p) => p.block_id).filter((id) => !run.blocks.has(id)))];
      if (spMissing.length) return { error: `A starting point names no recorded block: ${spMissing.join(", ")}. Recorded blocks: ${[...run.blocks.keys()].join(", ")}.` };
      const spBadCatalogue = sps.filter((p) => p.catalogue_id && !entryById(p.catalogue_id, catalogueData)).map((p) => p.catalogue_id);
      if (spBadCatalogue.length) return { error: `No catalogue entry ${spBadCatalogue.join(", ")}: give catalogue_id only for a service cat_lookup knows.` };
      const spChecks = [];
      for (const [k, p] of sps.entries()) {
        const ev = evidenceFor(`starting_point:${p.block_id}:${k}`, p.evidence);
        if (ev.error) return ev.error;
        spChecks.push(ev.checks);
      }
      const a = audit("ui_propose_levers", i);
      if (a.reject) return a.reject;
      const opts = { layerWeights: run.weights, layerStatus: layerStatusMap() };
      const levers = i.levers.map((l) => {
        const w = whatIf(effectiveBlocks(), l.lever_id, l.changes, opts);
        run.whatifs[l.lever_id] = { changes: structuredClone(l.changes), facts: w.facts };
        for (const k of Object.keys(w.facts)) run.known.add(k);
        // The what-if's blocks, so the screen can name the lowest block after the lever (2.1.0).
        const blocksAfter = w.result.blocks.map((b) => ({ id: b.id, layer: b.layer, criticality: b.criticality, level: b.level, unscored: b.unscored }));
        return { lever_id: l.lever_id, title: l.title, rationale: l.rationale, changes: structuredClone(l.changes), evidence: checks[l.lever_id], whatif: { facts: w.facts, blocks: blocksAfter } };
      });
      // A starting point's level is the engine's, and only where verified quotes name both its maker and its
      // operator. Each block's list goes in alphabetical order, whatever order the model sent: nothing is ranked.
      const byName = new Intl.Collator("en-GB", { sensitivity: "base" });
      const starting_points = sps.map((p, k) => {
        const g = gateBlock({ tech: p.tech || { name: "unknown", country: "UNKNOWN", parent: null }, operator: p.operator || { name: "unknown", country: "UNKNOWN", parent: null }, hosting: p.hosting || "UNKNOWN", licence: p.licence || "unknown", exit: "unknown" }, spChecks[k]);
        const assessed = assessBlock({ id: `SP-${k}`, layer: run.blocks.get(p.block_id).recorded.layer, criticality: "supporting", ...g.effective });
        const known = assessed.tech_class !== "UNKNOWN" && assessed.operator_class !== "UNKNOWN";
        return { block_id: p.block_id, name: p.name, ...(p.note ? { note: p.note } : {}), ...(p.catalogue_id ? { catalogue_id: p.catalogue_id } : {}),
          tech_class: assessed.tech_class, operator_class: assessed.operator_class, level: known ? assessed.level : null, evidence: spChecks[k] };
      }).sort((a, b) => a.block_id.localeCompare(b.block_id) || byName.compare(a.name, b.name));
      const options_seq = ++run.optionsSeq;
      run.leverSet = { options_seq, levers, keep: { facts: { ...run.result.facts } }, values: values(), lang, ...(starting_points.length ? { starting_points } : {}), ...(a.unchecked ? { unchecked: a.unchecked } : {}) };
      run.levers = "proposed";
      phase("awaiting_decision");
      emit("levers", run.leverSet);
      const valid = new Set([...ids, "keep"]);
      const d = await ctx.next("lever_decision", (p) => p.options_seq === options_seq && valid.has(p.lever_id));
      run.levers = "decided";
      run.decision = d.lever_id;
      run.decisions.push({ kind: "lever", lever_id: d.lever_id, by: "user", ts: new Date().toISOString() });
      phase("drafting");
      const chosen = levers.find((l) => l.lever_id === d.lever_id);
      return {
        decision: d.lever_id,
        ...(chosen ? { title: chosen.title, facts: Object.entries(chosen.whatif.facts).map(([key, value]) => ({ key, value })) } : { note: "The person keeps things as they are." }),
        next: `Draft the memo for "${d.lever_id}" with ui_draft_memo, then publish the report with ui_final_report and outcome "assessed".`
      };
    },

    ui_draft_memo(i) {
      phase("drafting");
      const a = audit("ui_draft_memo", i);
      if (a.reject) return a.reject;
      const lever = run.leverSet?.levers.find((l) => l.lever_id === i.lever_id) || null;
      run.memo = {
        action_id: "memo-1", type: "memo", lever_id: i.lever_id, subject: i.subject, body: i.body, lang,
        service: serviceName(), date: today(),
        lever_title: lever ? lever.title : null,
        before: { ...run.result.facts },
        after: lever ? { ...lever.whatif.facts } : null,
        values: values(),
        // The blocks' names by id, so the memo names its weakest link, not only its id (the review's R-26).
        names: Object.fromEntries([...run.blocks.values()].map((b) => b.view).filter(Boolean).map((v) => [v.id, v.name])),
        weights: { ...run.weights },
        status: "draft",
        audit: a.unchecked ? "unchecked" : "passed",
        ...(a.unchecked ? { unchecked: a.unchecked } : {})
      };
      emit("action_draft", run.memo);
      return { ok: true, action_id: run.memo.action_id, note: "The memo is in the Outbox as a draft. Nothing is sent. Publish the report with ui_final_report." };
    },

    ui_final_report(i) {
      // A run that ends without an assessment stops at its research, if it researched: scoring, the review
      // and the recommendation were not needed, and the rail says so (the review's finding R-07).
      if (i.outcome !== "not_a_service") phase("drafting");
      else if (run.researched) phase("researching");
      const a = audit("ui_final_report", i);
      if (a.reject) return a.reject;
      run.reported = true;
      run.outcome = i.outcome;
      const lever = run.leverSet?.levers.find((l) => l.lever_id === run.decision) || null;
      const report = {
        markdown: i.markdown, outcome: i.outcome, lang, service: serviceName(),
        audit: a.unchecked ? "unchecked" : "passed", ...(a.unchecked ? { unchecked: a.unchecked } : {}),
        values: values(),
        closing: {
          as_of: today(),
          method_version: METHOD_VERSION,
          weights: { ...run.weights },
          review: run.reviewAction,
          corrections: run.corrections.map((c) => ({ ...c })),
          decision: run.decision ? { lever_id: run.decision, title: lever ? lever.title : null, facts: lever ? { ...lever.whatif.facts } : null } : null,
          // The blocks the findings and figures refer to by id, with their names and levels, so an
          // exported report reads on its own (the review's R-26).
          blocks: i.outcome === "assessed" ? [...run.blocks.values()].map((b) => b.view).filter(Boolean).map((v) => ({
            id: v.id, layer: v.layer, name: v.name, lang: v.lang || null, criticality: v.criticality,
            made_in: v.tech_class, run_by: v.operator_class, level: v.unscored ? null : v.level, partly_unknown: !!v.partly_unknown
          })) : [],
          sources: sources()
        }
      };
      emit("report", report);
      return { ok: true, published: true, outcome: i.outcome, next: "End your turn now with one short closing sentence." };
    }
  };

  /** Every evidence item the run recorded, once per URL and quote, for the report's sources. */
  function sources() {
    const seen = new Map();
    const add = (c) => {
      const key = `${c.url}|${c.quote}`;
      if (!seen.has(key)) seen.set(key, { url: c.url, title: c.title, quote: c.quote, lang: c.lang, read_on: c.read_on, verified: c.verified, via: c.via });
    };
    for (const c of run.profile?.evidence || []) add(c);
    for (const b of run.blocks.values()) for (const c of b.checks) add(c);
    for (const s of Object.values(run.layerStatus)) for (const c of s.evidence || []) add(c);
    return [...seen.values()];
  }

  /**
   * A field's value as it counted for scoring: a party without a verified quote counts as unknown (null),
   * hosting, licence and exit as the engine used them.
   */
  function countedValue(b, field) {
    if (field === "tech" || field === "operator") {
      if (b.corrections[field]) return b.corrections[field];
      return b.unknown_fields.includes(field) || b.unknown_fields.includes(`${field}.parent`) ? null : b.recorded[field];
    }
    return b.effective[field];
  }

  /** A reviewer's correction (d.6): needs a reason, not evidence; recomputes and is logged. */
  function applyCorrection(d) {
    const b = run.blocks.get(d.block_id);
    const reason = String(d.reason || "").trim();
    if (!b || !reason || !d.changes || typeof d.changes !== "object") {
      emit("notice", { level: "warn", key: "notice.correctionIgnored", vars: { block: d.block_id || "?" } });
      return;
    }
    const ts = new Date().toISOString();
    for (const [field, to] of Object.entries(d.changes)) {
      if (!["criticality", "tech", "operator", "hosting", "licence", "exit"].includes(field)) continue;
      const from = countedValue(b, field);
      if (JSON.stringify(from) === JSON.stringify(to)) continue;
      b.corrections[field] = structuredClone(to);
      const entry = { block_id: b.recorded.id, field, from: structuredClone(from), to: structuredClone(to), reason, by: "reviewer", ts };
      b.log.push(entry);
      run.corrections.push(entry);
    }
    regate(b);
    recompute();
    emit("block_recorded", { op: "update", block: b.view, by: "reviewer", reason });
    scoreUpdate(false);
    emit("notice", { level: "info", key: "notice.correctionLogged", vars: { block: b.recorded.id } });
  }

  // ---- execute ---------------------------------------------------------------------------------------
  async function execute(name, input = {}) {
    const schema = SCHEMAS[name];
    if (!schema) return done(name, { error: `Unknown tool "${name}". The client tools are: ${Object.keys(SCHEMAS).join(", ")}.` }, input);
    const v = validate(input ?? {}, schema);
    if (!v.valid) return done(name, { error: `The input does not match the tool's schema:\n${describeErrors(v.errors)}\nFix these fields and call ${name} again.` }, input);
    const g = guardTool(name, guardState(), input);
    if (g) return done(name, g, input);
    let result;
    try {
      result = await handlers[name](structuredClone(input));
    } catch (e) {
      // Cancellation (the producer's abort symbol or an AbortError) ends the run, not the tool.
      if (typeof e === "symbol" || e?.name === "AbortError") throw e;
      console.error(`[Sovereignty Assessment] tool ${name} failed:`, e);
      result = { error: `The tool failed unexpectedly (${String(e?.message || "unknown error")}). Try different input or another tool.` };
    }
    return done(name, result, input);
  }

  function done(name, result, input) {
    const isError = !!(result && result.error);
    return { content: JSON.stringify(result), isError, result, summary: { name, ok: !isError, input } };
  }

  /**
   * A research step from the server tools (live) or a recording (simulation): search results and fetched
   * pages become citable; a fetched text page's text is kept for quote checks, never shown or exported.
   * step: { kind: "search"|"fetch", query?, results?: [{ url, title }], url?, title?, ok, error_code?, text?, doc? }
   */
  function research(step) {
    const payload = { kind: step.kind, ok: !!step.ok };
    if (step.kind === "search") {
      payload.query = step.query || "";
      if (step.ok) {
        payload.results = (step.results || []).map((x) => ({ url: x.url, title: x.title || "" }));
        for (const x of payload.results) ctx.registry.allowUrl(x.url, { via: "search", title: x.title });
      }
    } else {
      payload.url = step.url || "";
      payload.title = step.title || "";
      if (step.ok && step.url) {
        ctx.registry.addDocument({ url: step.url, title: step.title || "", text: typeof step.text === "string" ? step.text : null, kind: step.doc || (typeof step.text === "string" ? "text" : "pdf") });
        if (step.doc === "pdf") payload.pdf = true;
      }
    }
    if (!step.ok) payload.error_code = step.error_code || "unavailable";
    else run.researched = true;
    emit("research_step", payload);
    if (!step.ok && step.error_code === "max_uses_exceeded") emit("notice", { level: "warn", key: step.kind === "search" ? "notice.searchBudget" : "notice.fetchBudget" });
    return payload;
  }

  /** A citation from a kept response (text or thinking block), into the evidence registry. */
  function cite(citation) {
    return ctx.registry.addCitation(citation);
  }

  /**
   * New layer weights for the overall score (the method view; brief §6.5): the person's assumption,
   * during or after the run. Recomputes the assessment, prices the proposed levers again with the same
   * changes, and brings the drafts' figures up to date (their texts cite figures only as placeholders,
   * so a draft stays true to the screen). Returns what the screen needs, or null when nothing changed.
   */
  function setWeights(next) {
    const to = { ...EQUAL_LAYER_WEIGHTS, ...(next || {}) };
    if (LAYERS.every((l) => to[l] === run.weights[l])) return null;
    const from = { ...run.weights };
    run.weights = to;
    if (!run.blocks.size && !Object.keys(run.layerStatus).length) return { from, to, result: null, values: values() };
    recompute();
    const opts = { layerWeights: run.weights, layerStatus: layerStatusMap() };
    for (const [id, w] of Object.entries(run.whatifs)) run.whatifs[id] = { changes: w.changes, facts: whatIf(effectiveBlocks(), id, w.changes, opts).facts };
    // New objects throughout: the events already sent keep the figures they showed (the audit log
    // holds them), and the change itself travels as its own event.
    let levers = null;
    if (run.leverSet) {
      run.leverSet = {
        ...run.leverSet,
        // Block levels do not depend on the layer weights, so the what-if's blocks stay as they were.
        levers: run.leverSet.levers.map((l) => ({ ...l, whatif: { ...l.whatif, facts: { ...run.whatifs[l.lever_id].facts } } })),
        keep: { facts: { ...run.result.facts } },
        values: values()
      };
      levers = { options_seq: run.leverSet.options_seq, levers: run.leverSet.levers.map((l) => ({ lever_id: l.lever_id, facts: { ...l.whatif.facts } })), keep: { ...run.result.facts }, values: values() };
    }
    let memo = null;
    if (run.memo) {
      const lever = run.leverSet?.levers.find((l) => l.lever_id === run.memo.lever_id) || null;
      run.memo = { ...run.memo, before: { ...run.result.facts }, after: lever ? { ...lever.whatif.facts } : null, values: values(), weights: { ...run.weights } };
      memo = { before: run.memo.before, after: run.memo.after, values: run.memo.values, weights: run.memo.weights };
    }
    let report = null;
    if (run.reported) report = { values: values(), weights: { ...run.weights }, decision_facts: run.decision && run.decision !== "keep" ? { ...run.whatifs[run.decision]?.facts } : null };
    return { from, to, result: publicResult(), values: values(), levers, memo, report };
  }

  /**
   * The run as a record, for the assessment export (js/assessment.js): each block as the agent recorded
   * it with its evidence checks and the reviewer's corrections, the layers' statuses with their reasons
   * and evidence, the profile, the weights and the person's steps. Copies: changing them changes nothing.
   */
  function records() {
    return structuredClone({
      lang,
      profile: run.profile,
      blocks: [...run.blocks.values()].map((b) => ({ recorded: b.recorded, checks: b.checks, corrections: b.corrections, log: b.log })),
      layerStatus: run.layerStatus,
      weights: run.weights,
      review: run.review,
      reviewAction: run.reviewAction,
      corrections: run.corrections,
      decisions: run.decisions,
      decision: run.decision,
      reported: run.reported,
      outcome: run.outcome
    });
  }

  return {
    execute,
    research,
    cite,
    setWeights,
    records,
    weights: () => ({ ...run.weights }),
    /** A summary of the run for the agent loop, the player, the recorder and the tests. */
    state: () => ({
      reported: run.reported, outcome: run.outcome, blocks: run.blocks.size, review: run.review, reviewAction: run.reviewAction,
      levers: run.levers, decision: run.decision, memo: !!run.memo, profile: !!run.profile,
      layerStatus: layerStatusMap(), openLayers: LAYERS.filter((l) => !run.layerStatus[l] && ![...run.blocks.values()].some((b) => b.recorded.layer === l)),
      corrections: run.corrections.length, unchecked: run.unchecked.slice(), known: [...run.known],
      entries: [...run.entries.keys()]
    }),
    result: () => publicResult(),
    values,
    blocks: () => [...run.blocks.values()].map((b) => b.view),
    leverSet: () => run.leverSet,
    memo: () => run.memo,
    profile: () => run.profile,
    auditLog: () => run.auditLog.slice(),
    sources,
    entry: (id) => entryById(id, catalogueData),
    lang
  };
}
