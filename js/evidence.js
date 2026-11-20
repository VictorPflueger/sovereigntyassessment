// Evidence verification in code (brief §6.6; PLAN.md d.1 to d.5): which URLs a run may cite, whether a
// quote is verified, and which of a block's fields count as unknown for scoring because no verified quote
// supports them. Pure functions and one registry per run, shared by the live agent, the simulation player,
// tools/check-runs.mjs and the Node tests. Nothing here touches the page.
//
// Provenance (d.1): an evidence URL counts only if this run's web_search results or web_fetch results
// returned it, or cat_lookup or ref_facts listed it (a replayed pre-run lists its own research steps).
// URLs are compared after normalisation: lower-case scheme and host, fragment removed.
//
// Quotes (d.2, d.3): a quote is verified when, with whitespace normalised, it occurs in the text of the
// page at its URL as fetched in this run, or in the cited_text of a citation of that URL in this run. A
// search citation carries its URL; a fetched-document citation carries only a document_index, which the
// registry maps to the URL of the fetched document at that position in the conversation (PLAN.md I2). An
// index that points at no document, or at a document whose title differs from the citation's, maps to
// nothing: the quote stays unverified. Quotes of the bundled reference facts were verified at build time,
// and a pre-run's quotes were checked against research/ by tools/check-runs.mjs; both arrive as
// pre-verified quotes with their origin.
//
// Fields (d.4): Made in becomes UNKNOWN when `tech` or a recorded `tech.parent` lacks a verified quote,
// Run by likewise with `operator` and `operator.parent`; the hosting region becomes UNKNOWN, the licence
// unknown and the exit path unknown. A reviewer's correction needs a reason, not evidence (d.6): a
// corrected field counts as the reviewer set it.

import { classOf } from "./classes.js";

export const BLOCK_FIELDS = Object.freeze(["tech", "tech.parent", "operator", "operator.parent", "hosting", "licence", "exit"]);
export const MAX_QUOTE = 150;

/** A URL for comparison: lower-case scheme and host (the URL parser does both), fragment removed. */
export function normaliseUrl(url) {
  const raw = String(url ?? "").trim();
  try {
    const u = new URL(raw);
    u.hash = "";
    return u.href;
  } catch {
    return raw.replace(/#.*$/, "");
  }
}

/** Whitespace normalised: every run of white space (non-breaking spaces included) becomes one space. */
export function normaliseText(text) {
  return String(text ?? "").replace(/\s+/gu, " ").trim();
}

/** A title for comparison: whitespace normalised, case ignored. */
const titleKey = (title) => normaliseText(title).toLowerCase();

/** A cited text cut to at most 150 characters at a word boundary, for evidence that names no quote. */
export function clipQuote(text, max = MAX_QUOTE) {
  const s = normaliseText(text);
  if ([...s].length <= max) return s;
  const cut = [...s].slice(0, max).join("");
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:–-]+$/u, "");
}

/**
 * The evidence registry of one run. Every method takes URLs as written and normalises them itself.
 */
export function createEvidenceRegistry() {
  const urls = new Map();       // url → { url, title, via: Set<"search"|"fetch"|"catalogue"|"ref_facts"|"recording"> }
  const pages = new Map();      // url → [fetched text, normalised]
  const docs = [];              // fetched documents in conversation order: { url, title, kind: "text"|"pdf"|"other" }
  const cited = new Map();      // url → [cited_text, normalised]
  const known = new Map();      // url → [{ quote (normalised), via }]  pre-verified quotes
  const unmapped = [];          // citations that could not be mapped to a URL, with the reason

  const push = (map, key, value) => {
    if (!map.has(key)) map.set(key, []);
    const list = map.get(key);
    if (!list.includes(value)) list.push(value);
  };

  /** Makes a URL citable in this run. via: search, fetch, catalogue, ref_facts or recording. */
  function allowUrl(url, { via, title = "" } = {}) {
    const key = normaliseUrl(url);
    if (!key) return null;
    const entry = urls.get(key) || { url: String(url).trim(), title: "", via: new Set() };
    if (title && !entry.title) entry.title = normaliseText(title);
    if (via) entry.via.add(via);
    urls.set(key, entry);
    return key;
  }

  /**
   * A web_fetch result, in the order the conversation holds it. text: the page's text for a text
   * document, null for a PDF (base64) or anything else. Returns the document's index.
   */
  function addDocument({ url, title = "", text = null, kind = text === null ? "pdf" : "text" }) {
    const key = allowUrl(url, { via: "fetch", title });
    // The fetched page's own title names the source, over a search result's (the review's finding R-14).
    if (key && title) urls.get(key).title = normaliseText(title);
    docs.push({ url: key, title: normaliseText(title), kind });
    if (typeof text === "string" && text.trim()) push(pages, key, normaliseText(text));
    return docs.length - 1;
  }

  /**
   * A citation from a response's text (or thinking) block. Search citations carry their URL; document
   * citations (char_location, page_location, content_block_location) carry a document_index. Returns
   * { url, mapped, reason }: the URL the citation counts for, or null with the reason.
   */
  function addCitation(c) {
    if (!c || typeof c !== "object") return { url: null, mapped: false, reason: "not a citation" };
    const text = normaliseText(c.cited_text);
    if (c.type === "web_search_result_location" || (c.url && c.document_index === undefined)) {
      const key = normaliseUrl(c.url);
      if (!key || !urls.has(key)) {
        unmapped.push({ citation: c.type, reason: "url_not_returned" });
        return { url: null, mapped: false, reason: "url_not_returned" };
      }
      if (text) push(cited, key, text);
      return { url: key, mapped: true, reason: null };
    }
    if (Number.isInteger(c.document_index)) {
      const doc = docs[c.document_index];
      if (!doc) {
        unmapped.push({ citation: c.type, reason: "no_document_at_index", index: c.document_index });
        return { url: null, mapped: false, reason: "no_document_at_index" };
      }
      if (c.document_title && doc.title && titleKey(c.document_title) !== titleKey(doc.title)) {
        unmapped.push({ citation: c.type, reason: "title_mismatch", index: c.document_index });
        return { url: null, mapped: false, reason: "title_mismatch" };
      }
      if (text) push(cited, doc.url, text);
      return { url: doc.url, mapped: true, reason: null };
    }
    unmapped.push({ citation: c.type || "unknown", reason: "no_location" });
    return { url: null, mapped: false, reason: "no_location" };
  }

  /**
   * A quote verified elsewhere: a reference fact (ref_facts), or a pre-run's quote (recording). It counts
   * only while its URL is also allowed in this run: this never makes a URL citable by itself.
   */
  function addVerifiedQuote(url, quote, via) {
    const key = normaliseUrl(url);
    const q = normaliseText(quote);
    if (!q) return;
    const list = known.get(key) || [];
    if (!list.some((x) => x.quote === q)) list.push({ quote: q, via });
    known.set(key, list);
  }

  const isAllowed = (url) => urls.has(normaliseUrl(url));

  /**
   * Whether a quote is verified for its URL, and how: { verified, via }. via is "ref_facts" or
   * "recording" for pre-verified quotes, "fetched_text", "citation", or "none".
   */
  function verifyQuote(url, quote) {
    const key = normaliseUrl(url);
    const q = normaliseText(quote);
    if (!q || !urls.has(key)) return { verified: false, via: "none" };
    if ([...q].length > MAX_QUOTE) return { verified: false, via: "none" };
    const pre = (known.get(key) || []).find((x) => x.quote === q);
    if (pre) return { verified: true, via: pre.via };
    if ((pages.get(key) || []).some((text) => text.includes(q))) return { verified: true, via: "fetched_text" };
    if ((cited.get(key) || []).some((text) => text.includes(q))) return { verified: true, via: "citation" };
    return { verified: false, via: "none" };
  }

  /** The latest citation of a URL in this run, clipped to 150 characters, or null. */
  function citedQuote(url) {
    const list = cited.get(normaliseUrl(url)) || [];
    return list.length ? clipQuote(list[list.length - 1]) : null;
  }

  return {
    allowUrl, addDocument, addCitation, addVerifiedQuote, isAllowed, verifyQuote, citedQuote,
    /** The URLs this run may cite, as first written, for an instructive error. */
    allowedUrls: () => [...urls.values()].map((e) => e.url),
    /** Titles of the search results and pages this run read, for the fact audit's evidence. */
    titles: () => [...urls.values()].map((e) => e.title).filter(Boolean),
    titleOf: (url) => urls.get(normaliseUrl(url))?.title || "",
    viaOf: (url) => [...(urls.get(normaliseUrl(url))?.via || [])],
    documents: () => docs.map((d) => ({ ...d })),
    unmapped: () => unmapped.slice(),
    /** Counts for Diagnostics, the audit export and the tests. */
    stats: () => ({ urls: urls.size, documents: docs.length, pages: pages.size, cited_urls: cited.size, unmapped: unmapped.length })
  };
}

/**
 * Checks a list of evidence items against the registry. Items without a quote take this run's citation
 * of their URL. Returns { refused, checks }: refused lists the URLs this run never returned (the call is
 * then refused with is_error); checks holds each item with its quote, verified flag and origin.
 */
export function checkEvidence(registry, items = [], { readOn = null } = {}) {
  const refused = [];
  const checks = [];
  for (const item of items || []) {
    if (!registry.isAllowed(item.url)) { refused.push(item.url); continue; }
    let quote = typeof item.quote === "string" ? normaliseText(item.quote) : "";
    let fromCitation = false;
    if (!quote) {
      quote = registry.citedQuote(item.url) || "";
      fromCitation = !!quote;
    }
    const v = quote ? registry.verifyQuote(item.url, quote) : { verified: false, via: "none" };
    checks.push({
      url: item.url,
      // The title the run read for the page, not one the model wrote (R-14); the model's only where the
      // run read none.
      title: registry.titleOf(item.url) || item.title,
      quote,
      lang: item.lang,
      supports: [...(item.supports || [])],
      ...(item.read_on || readOn ? { read_on: item.read_on || readOn } : {}),
      verified: v.verified,
      via: v.via,
      ...(fromCitation ? { quote_from: "citation" } : {})
    });
  }
  return { refused, checks };
}

/** The fields that at least one verified evidence item supports. */
export function verifiedFields(checks = []) {
  const out = new Set();
  for (const c of checks) if (c.verified) for (const f of c.supports || []) out.add(f);
  return out;
}

/**
 * The block as the engine scores it: every recorded field without a verified quote replaced by its
 * unknown (d.4), then the reviewer's corrections laid over it (d.6). block: as recorded (tech and
 * operator as parties, hosting, licence, exit); checks: its evidence checks; corrections: the
 * reviewer's, as { tech?, operator?, hosting?, licence?, exit?, criticality? } with the values set.
 * Returns { effective, unknown_fields }: unknown_fields lists the gated fields, in BLOCK_FIELDS order.
 */
export function gateBlock(block, checks = [], corrections = {}) {
  const ok = verifiedFields(checks);
  const fixed = corrections || {};
  const gated = [];
  const override = {};
  const effective = { ...block };
  delete effective.class_override;

  // A party counts only with a verified quote for it and for a recorded parent. A party recorded as
  // unknown (no country, no parent) is unknown anyway and is not listed.
  for (const field of ["tech", "operator"]) {
    if (fixed[field]) continue;
    const party = block[field];
    const informative = party && (classOf(party.country) !== "UNKNOWN" || party.parent);
    if (informative && !ok.has(field)) gated.push(field);
    if (party?.parent && !ok.has(`${field}.parent`)) gated.push(`${field}.parent`);
    if (gated.includes(field) || gated.includes(`${field}.parent`)) override[field] = "UNKNOWN";
  }
  for (const [field, unknown] of [["hosting", "UNKNOWN"], ["licence", "unknown"], ["exit", "unknown"]]) {
    if (fixed[field] !== undefined || ok.has(field)) continue;
    if (block[field] !== unknown) gated.push(field);
    effective[field] = unknown;
  }
  for (const field of ["tech", "operator"]) if (fixed[field]) effective[field] = structuredClone(fixed[field]);
  for (const field of ["hosting", "licence", "exit", "criticality"]) if (fixed[field] !== undefined) effective[field] = fixed[field];
  if (Object.keys(override).length) effective.class_override = override;
  return { effective, unknown_fields: BLOCK_FIELDS.filter((f) => gated.includes(f)) };
}
