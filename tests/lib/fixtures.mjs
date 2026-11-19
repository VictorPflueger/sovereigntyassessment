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
export { fraction, near, plain, blockFromRow } from "../../js/selftest.js";

/** Every golden file by name ({ "s1-levels.json": … }), as data/golden.js carries them. */
export function allFixtures() {
  return Object.fromEntries(readdirSync(FIXTURES).filter((f) => f.endsWith(".json")).sort().map((f) => [f, fixture(f)]));
}
