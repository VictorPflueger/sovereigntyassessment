// The golden fixtures (tests/fixtures/*.json, the brief's section 11) as the engine and the audit take
// them: table rows become building blocks of the shape the agent records (brief §10), and the exact
// fractions become numbers to compare within 1e-9. Until 1.0.0 these helpers lived in js/selftest.js
// for the browser's Diagnostics; 2.0.0 took Diagnostics off the page, so they live here.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { APP_ROOT } from "./harness.mjs";

export const FIXTURES = path.join(APP_ROOT, "tests", "fixtures");

/** One fixture file, parsed. */
export function fixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURES, name), "utf8"));
}

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
  return String(text).replace(/[\u00a0\u202f]/g, " ");
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

/** Every golden file by name ({ "s1-levels.json": … }). */
export function allFixtures() {
  return Object.fromEntries(readdirSync(FIXTURES).filter((f) => f.endsWith(".json")).sort().map((f) => [f, fixture(f)]));
}

/**
 * A golden row's country as the schema takes it: a two-letter code stays (DE, FR, US, CN); the class
 * OTHER, which is no country, becomes a country of that class (CH); anything else is UNKNOWN.
 */
const countryOf = (v) => (/^[A-Z]{2}$/.test(String(v)) ? v : v === "OTHER" ? "CH" : "UNKNOWN");

/**
 * A golden case's rows as an assessment file (the Assessment schema), as the app exports one: each block
 * with one verified source for every field, so the engine scores exactly the row's classes, hosting and
 * licence. The source is fictional, like the golden cases.
 */
export function fixtureAssessment({ service, category, rows, as_of = "2026-11-20", lang = "en" }) {
  const blocks = rows.map((row, i) => {
    const b = blockFromRow(row, i);
    b.name = `${service} ${b.id}`;
    b.role = "A fictional building block of a golden case";
    delete b.note;
    b.tech = { name: `${service} ${b.id} maker`, country: countryOf(row.made_in), parent: null };
    b.operator = { name: `${service} ${b.id} operator`, country: countryOf(row.run_by), parent: null };
    b.evidence = [{ url: "https://example.org/golden-cases", title: "Golden cases (fictional)", quote: "A fictional source for the golden cases.", lang: "en", read_on: as_of, supports: ["tech", "operator", "hosting", "licence", "exit"], verified: true }];
    return b;
  });
  return { service: { query: service, entry_id: null, name: service }, category, lang, as_of, source: "hand_authored", method_version: "1.0", profile: null, blocks, layers: [] };
}
