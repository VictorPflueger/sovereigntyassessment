// The golden fixtures (tests/fixtures/*.json, the brief's section 11) as the engine and the audit take
// them: table rows become building blocks of the shape the agent records (brief §10), and the exact
// fractions become numbers to compare within 1e-9. The helpers live in js/selftest.js, which the
// browser's Diagnostics runs on the same cases.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { APP_ROOT } from "./harness.mjs";

export const FIXTURES = path.join(APP_ROOT, "tests", "fixtures");

/** One fixture file, parsed. */
export function fixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURES, name), "utf8"));
}

// One implementation for the browser's Diagnostics and the Node suites: js/selftest.js.
import { blockFromRow } from "../../js/selftest.js";
export { fraction, near, plain, blockFromRow } from "../../js/selftest.js";

/** Every golden file by name ({ "s1-levels.json": … }), as data/golden.js carries them. */
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
