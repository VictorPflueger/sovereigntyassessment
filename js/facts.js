// Fact keys, placeholders and the fact audit (brief §7, rules 3 and 4; PLAN.md c.4 and c.6).
//
// The model never writes a level, score or share: it cites the engine's figures through placeholders,
// {{fact:<key>}}, with keys the engine returned in this run, and code renders them in the run's
// language. The fact audit runs on every model-written text the brief names (narration, the profile's
// texts, block names, roles and notes, layer reasons, levers, the memo and the report) and finds every
// number or proportion written outside those placeholders. In this order, on the text with its
// whitespace normalised (non-breaking spaces included):
//   1. placeholders are resolved; an unknown key is an error;
//   2. quoted text that appears verbatim in the run's evidence is set aside („…“, “…”, "…", »…«, «…», ‚…‘);
//   3. ISO dates (YYYY-MM-DD), block ids (B-nn) and lever ids (L1 to L3) are set aside;
//   4. legal references (§ or Art. with its number) that appear in the run's evidence are set aside;
//   5. blocked words and fractions are reported, once each, as written: "%", percent, per cent, Prozent,
//      half and halves (not "half-"), a third, one third, two thirds, a quarter, one quarter, three
//      quarters (except before party, parties, country or countries, and in "once a quarter"), thirds,
//      quarters, Hälfte, Drittel and Viertel with their inflected forms, "SEAL-" with a digit, and (D10)
//      cardinal number words above twelve in English and German, compounds included;
//   6. every other number token is reported (a run of digits with "." or "," between digits and any
//      letters joined to it: "2.0", "C5", "PSD2", "27001"), unless it is written as the run's evidence
//      writes it: a token with letters on its own ("C5"), a number with the word directly before it
//      ("Microsoft 365", "ISO 27001"), or (D9) a four-digit year that the evidence contains.
// The run's evidence: the catalogue entry, the titles of the search results and pages the run read, and
// the quotes of its recorded evidence; evidence URLs are set aside too, so a source can be linked.

import { t, getLang } from "./i18n/index.js";
import { fmtScore, fmtShare, fmtDelta, fmtInt, noData } from "./format.js";

/** A placeholder: {{fact:score.overall}}. */
export const FACT_RE = /\{\{fact:([A-Za-z0-9_.-]+)\}\}/g;

/** The kind of a fact key, which decides how it renders. */
export function factKind(key) {
  const k = String(key);
  if (/^whatif\.L[1-3]\.delta$/.test(k)) return "delta";
  if (/^(score\.|whatif\.L[1-3]\.overall$)/.test(k)) return "score";
  if (/^(coverage$|share\.|whatif\.L[1-3]\.exclusive_non_eu$|portfolio\.[a-z_]+\.exclusive_non_eu$)/.test(k)) return "share";
  if (/^(seal\.|weakest\.level$|whatif\.L[1-3]\.weakest\.level$)/.test(k)) return "level";
  if (/^(weakest\.block$|whatif\.L[1-3]\.weakest\.block$)/.test(k)) return "block";
  if (/^(count\.|weakest\.ties$|whatif\.L[1-3]\.weakest\.ties$)/.test(k)) return "count";
  return "unknown";
}

/** A fact's value as text in a language: 72, 92 %, +9, level 4 / Stufe 4, B-10, 3; null is "no data". */
export function formatFact(key, value, lang = getLang()) {
  if (value === null || value === undefined) return noData(lang);
  switch (factKind(key)) {
    case "score": return fmtScore(value, lang);
    case "share": return fmtShare(value, lang);
    case "delta": return fmtDelta(value, lang);
    case "level": return t("fact.level", { n: fmtInt(value, lang) }, lang);
    case "block": return String(value);
    case "count": return fmtInt(value, lang);
    default: return String(value);
  }
}

/** The text with every {{fact:key}} replaced by its rendered value; an unknown key stays as written. */
export function renderFacts(text, values, lang = getLang()) {
  return String(text ?? "").replace(FACT_RE, (m, key) => (values && Object.hasOwn(values, key) ? formatFact(key, values[key], lang) : m));
}

/** Whitespace normalised: every run of white space (non-breaking spaces included) becomes one space. */
export function normalise(text) {
  return String(text ?? "").replace(/\s+/gu, " ").trim();
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const L = "[\\p{L}\\p{N}]";
const NOT_BEFORE = `(?<!${L})`;
const NOT_AFTER = `(?!${L})`;

/**
 * The run's evidence as the audit reads it. evidence: { titles, quotes, texts (the catalogue entry's
 * texts), urls }. Returns helpers over the normalised strings.
 */
export function evidenceCorpus(evidence = {}) {
  const strings = [...(evidence.titles || []), ...(evidence.quotes || []), ...(evidence.texts || [])].map(normalise).filter(Boolean);
  const urls = (evidence.urls || []).map((u) => String(u).trim()).filter(Boolean);
  return {
    strings,
    urls,
    /** The text occurs verbatim in a piece of evidence. */
    contains: (s) => strings.some((e) => e.includes(s)),
    /** The phrase occurs in a piece of evidence as whole words. */
    containsWords: (s) => {
      const re = new RegExp(`${NOT_BEFORE}${esc(s)}${NOT_AFTER}`, "u");
      return strings.some((e) => re.test(e));
    }
  };
}

// Blocked words and fractions (step 5), each a pattern on the normalised text, case ignored.
const EXCEPT = `(?![ -](?:party|parties|country|countries)${NOT_AFTER})`;
const FRACTIONS = [
  `${NOT_BEFORE}(?:two)[ -]thirds${NOT_AFTER}${EXCEPT}`,
  `${NOT_BEFORE}(?:three)[ -]quarters${NOT_AFTER}${EXCEPT}`,
  `${NOT_BEFORE}(?:a|one)[ -]third${NOT_AFTER}${EXCEPT}`,
  `${NOT_BEFORE}(?<!once )(?:a)[ -]quarter${NOT_AFTER}${EXCEPT}`,
  `${NOT_BEFORE}(?:one)[ -]quarter${NOT_AFTER}${EXCEPT}`
];
const WORDS = [
  `${NOT_BEFORE}thirds${NOT_AFTER}`,
  `${NOT_BEFORE}quarters${NOT_AFTER}`,
  `${NOT_BEFORE}half${NOT_AFTER}(?!-)`,
  `${NOT_BEFORE}halves${NOT_AFTER}`,
  `${NOT_BEFORE}(?:percent|per cent|prozent)${NOT_AFTER}`,
  `${NOT_BEFORE}(?:hälfte|hälften)${NOT_AFTER}`,
  `${NOT_BEFORE}(?:drittel|drittels|dritteln)${NOT_AFTER}`,
  `${NOT_BEFORE}(?:viertel|viertels|vierteln)${NOT_AFTER}`,
  `${NOT_BEFORE}SEAL-\\p{N}+${NOT_AFTER}`,
  `%`
];
// D10: English cardinal number words above twelve, with their compounds ("seventy-two") and plurals.
const EN_BIG = `${NOT_BEFORE}(?:thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion)s?(?:-(?:one|two|three|four|five|six|seven|eight|nine))?(?![\\p{L}\\p{N}-])`;
// D10: German number words, compounds included: a word made only of number parts that is above twelve.
const DE_PARTS = /^(?:ein|eins|eine|zwei|drei|vier|fünf|sechs|sech|sieben|sieb|acht|neun|zehn|elf|zwölf|und|zwanzig|dreißig|dreissig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig|hundert|tausend)+$/u;
const DE_BIG = /(?:zwanzig|ßig|ssig|zig|hundert|tausend)/u;
const DE_TEEN = /(?:drei|vier|fünf|sech|sieb|acht|neun)zehn$/u;
const DE_LARGE = /^(?:millionen?|milliarden?|billionen?)$/u;

/**
 * The fact audit. text: model-written text; facts: the keys the engine returned in this run (array or
 * Set); evidence: { titles, quotes, texts, urls }. Returns { pass, tokens, unknownFacts }: the blocked
 * tokens once each, as written, in the order they appear.
 */
export function auditText(text, { facts = [], evidence = {} } = {}) {
  const known = facts instanceof Set ? facts : new Set(facts);
  const corpus = evidenceCorpus(evidence);
  const src = normalise(text);
  let w = src;
  const hits = [];
  const unknownFacts = [];
  const mask = (start, length) => { w = w.slice(0, start) + " ".repeat(length) + w.slice(start + length); };
  const each = (re, fn) => { for (const m of [...w.matchAll(re)]) fn(m); };

  // 1. Placeholders: resolved against the run's facts; an unknown key is an error.
  each(new RegExp(FACT_RE.source, "g"), (m) => {
    if (!known.has(m[1]) && !unknownFacts.includes(m[1])) unknownFacts.push(m[1]);
    mask(m.index, m[0].length);
  });

  // Evidence URLs, so a source can be linked.
  for (const url of corpus.urls) {
    let i = w.indexOf(url);
    while (i >= 0) { mask(i, url.length); i = w.indexOf(url, i + url.length); }
  }

  // 2. Quoted text that appears verbatim in the run's evidence.
  const QUOTES = [/„([^“”„]*)[“”]/gu, /“([^”“]*)”/gu, /»([^«»]*)«/gu, /«([^«»]*)»/gu, /‚([^‘‚]*)‘/gu, /"([^"]*)"/gu];
  for (const re of QUOTES) {
    each(re, (m) => {
      const inner = normalise(m[1]);
      if (inner && corpus.contains(inner)) mask(m.index, m[0].length);
    });
  }

  // 3. ISO dates, block ids and lever ids.
  each(new RegExp(`${NOT_BEFORE}\\d{4}-\\d{2}-\\d{2}${NOT_AFTER}`, "gu"), (m) => mask(m.index, m[0].length));
  each(new RegExp(`${NOT_BEFORE}B-\\d{2}${NOT_AFTER}`, "gu"), (m) => mask(m.index, m[0].length));
  each(new RegExp(`${NOT_BEFORE}L[1-3]${NOT_AFTER}`, "gu"), (m) => mask(m.index, m[0].length));

  // 4. Legal references that appear in the run's evidence: § 3, §§ 9a, Art. 6, with Abs., Satz or Nr.
  const LEGAL = /(§§?|Art\.) ?(\d+[a-z]?(?: (?:Abs\.|Absatz|Satz|S\.|Nr\.|lit\.) ?\d+[a-z]?)*)(?![\p{L}\p{N}])/gu;
  each(LEGAL, (m) => {
    const ref = new RegExp(`${esc(m[1])} ?${m[2].split(" ").map(esc).join(" ?")}(?![\\p{L}\\p{N}])`, "u");
    if (corpus.strings.some((e) => ref.test(e))) mask(m.index, m[0].length);
  });

  // 5. Blocked words and fractions, reported as written.
  for (const source of [...FRACTIONS, ...WORDS, EN_BIG]) {
    each(new RegExp(source, "giu"), (m) => { hits.push({ index: m.index, token: m[0] }); mask(m.index, m[0].length); });
  }
  each(/\p{L}+/gu, (m) => {
    const word = m[0].toLowerCase();
    if ((DE_PARTS.test(word) && (DE_BIG.test(word) || DE_TEEN.test(word))) || DE_LARGE.test(word)) {
      hits.push({ index: m.index, token: m[0] });
      mask(m.index, m[0].length);
    }
  });

  // 6. Number tokens, unless written as the run's evidence writes them.
  const NUMBER = /(?<![\p{L}\p{N}])(?=[\p{L}\p{N}]*\p{N})[\p{L}\p{N}]+(?:(?<=\p{N})[.,](?=\p{N})[\p{L}\p{N}]+)*/gu;
  each(NUMBER, (m) => {
    const token = m[0];
    if (/\p{L}/u.test(token)) {
      if (corpus.containsWords(token)) return;
    } else {
      if (/^(?:19|20)\d{2}$/.test(token) && corpus.containsWords(token)) return; // D9: a year the evidence contains
      const before = src.slice(0, m.index).trimEnd();
      const prev = (before.match(/(\S+)$/) || [])[1]?.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      if (prev && corpus.containsWords(`${prev} ${token}`)) return;
    }
    hits.push({ index: m.index, token });
  });

  hits.sort((a, b) => a.index - b.index);
  const tokens = [];
  for (const h of hits) if (!tokens.includes(h.token)) tokens.push(h.token);
  return { pass: tokens.length === 0 && unknownFacts.length === 0, tokens, unknownFacts };
}
