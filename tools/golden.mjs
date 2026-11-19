// Writes data/golden.js, the copy of the golden fixtures (tests/fixtures/*.json, the brief's section 11)
// that Diagnostics runs in the browser: the page's security policy allows no fetch from its own origin,
// so the cases ship as an ES module that Diagnostics imports when it opens. tests/unit.mjs fails when
// the copy and the fixtures differ, so run this after any change to tests/fixtures/.
// Usage: node tools/golden.mjs          (writes data/golden.js)
//        node tools/golden.mjs --check  (exits 1 when data/golden.js is not the current copy)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURES = path.join(ROOT, "tests", "fixtures");
const OUT = path.join(ROOT, "data", "golden.js");

export function goldenSource() {
  const files = readdirSync(FIXTURES).filter((f) => f.endsWith(".json")).sort();
  const golden = Object.fromEntries(files.map((f) => [f, JSON.parse(readFileSync(path.join(FIXTURES, f), "utf8"))]));
  return `// The golden cases of the brief (section 11) for Diagnostics in the browser: an exact copy of
// tests/fixtures/*.json, written by tools/golden.mjs. Do not edit by hand; tests/unit.mjs checks the copy.
// Fictional services and figures throughout.
export default Object.freeze(${JSON.stringify(golden, null, 1)});
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const src = goldenSource();
  if (process.argv.includes("--check")) {
    let current = "";
    try { current = readFileSync(OUT, "utf8"); } catch { /* missing: not current */ }
    if (current !== src) {
      console.error("data/golden.js is not the current copy of tests/fixtures/. Run node tools/golden.mjs.");
      process.exit(1);
    }
    console.log("data/golden.js is the current copy of tests/fixtures/.");
  } else {
    writeFileSync(OUT, src);
    console.log(`Wrote ${path.relative(ROOT, OUT)} (${src.length} bytes) from ${path.relative(ROOT, FIXTURES)}/.`);
  }
}
