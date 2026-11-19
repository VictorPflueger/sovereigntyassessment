// The golden fixtures (tests/fixtures/*.json, the brief's section 11) as the engine and the audit take
// them: table rows become building blocks of the shape the agent records (brief §10), and the exact
// fractions become numbers to compare within 1e-9.
import { readFileSync } from "node:fs";
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
  return String(text).replace(/[  ]/g, " ");
}

/**
 * A fixture row ({ id, layer?, criticality?, made_in, licence, run_by, hosting }) as a recorded block:
 * Made in and Run by are countries (or UNKNOWN), so they become the technology provider's and the
 * operator's country.
 */
export function blockFromRow(row, i = 0) {
  return {
    id: row.id && /^B-\d{2}$/.test(row.id) ? row.id : `B-${String(i + 1).padStart(2, "0")}`,
    layer: row.layer || "platform",
    name: `Block ${row.id || i + 1}`,
    role: "A fictional block of the golden cases",
    note: "",
    criticality: row.criticality || "critical",
    tech: { name: `Maker of ${row.id || i + 1}`, country: row.made_in, parent: null },
    operator: { name: `Operator of ${row.id || i + 1}`, country: row.run_by, parent: null },
    hosting: row.hosting,
    licence: row.licence,
    exit: "unknown",
    evidence: [],
    confidence: "high"
  };
}
