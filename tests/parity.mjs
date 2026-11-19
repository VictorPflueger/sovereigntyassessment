// Parity with the sister app: the shared shell must stay the shell the sister apps run, so a fix or a
// design change in one can be carried to the others file by file. Compared with a checkout of Rebate
// Hunter (the sister app whose shell this one takes over), with the app names and storage prefixes
// normalised:
//   identical   the shared modules, js/theme.js, the shared stylesheets and the four tests that are the
//               same file in every prototype, character for character (comments included); the hexagon
//               test without its list of exceptions, the one place a shared test may differ
//   same code   stylesheets whose comments name the app's own centrepiece or domain: the rules must
//               match with comments removed (style.css up to its marked app-specific block)
//   adapted     the four shell modules this app adapted for two languages (brief §4): each must exist
//               here and in the sister app, and REVIEW.md must name it with its reason; their content
//               is this app's, so it is not compared
//   same Vici   vici/, Victor's design system: the same files, byte for byte
// Taken from the Timetable Translator's tests/parity.mjs; this app's name and prefix are added to the
// normalisation, and the four adapted modules moved from the identical list to their own list.
// Usage: node tests/parity.mjs <path to a PROC-Rebate-Hunter checkout>
//        (or set PARITY_REF; without a reference the check cannot run and says so)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { APP_ROOT } from "./lib/harness.mjs";

const REF = process.argv[2] || process.env.PARITY_REF || path.resolve(APP_ROOT, "..", "PROC-Rebate-Hunter");
if (!fs.existsSync(path.join(REF, "js", "sse.js"))) {
  console.error(`No sister-app checkout at ${REF}. Clone https://github.com/VictorPflueger/PROC-Rebate-Hunter and pass its path.`);
  process.exit(2);
}

const IDENTICAL = [
  "js/anthropic.js", "js/clock.js", "js/cost.js", "js/dom.js", "js/keystore.js",
  "js/labels.js", "js/md.js", "js/sse.js", "js/theme.js",
  "css/components.css", "css/console.css",
  "tests/tokens.mjs", "tests/hexagon.mjs", "tests/page-icon.mjs", "tests/vici-files.mjs"
];
const SAME_CODE = ["css/drawer.css", "css/modals.css", "css/style.css"];
// Adapted for two languages: strings through the app's i18n, tabs and rail steps defined by the app.
const ADAPTED = ["js/drawer.js", "js/handover.js", "js/modal.js", "js/progress.js"];
const APP_BLOCK = /\/\* -{20,} \*\/\n\/\* App-specific: not part of the shared shell[\s\S]*$/;
// The hexagon test's exceptions (with the comment that introduces them) may differ between the prototypes.
const EXCEPTIONS = /(\/\*\*\s*\n \* Allowed round things[\s\S]*?\*\/\s*\n)?const EXCEPTIONS = \[[\s\S]*?\];/;

const read = (root, f) => fs.readFileSync(path.join(root, f), "utf8");
const names = (s) => s
  .replace(/the Rebate Hunter|the Timetable Translator|the Sovereignty Assessment/g, "the APP")
  .replace(/Rebate Hunter|Timetable Translator|Sovereignty Assessment/g, "APP")
  .replace(/rebate-hunter|timetable-translator|sovereignty-assessment/g, "app")
  .replace(/(["'`])(rh|tt|sa)\./g, "$1app.");
const shared = (f, s) => (f === "tests/hexagon.mjs" ? s.replace(EXCEPTIONS, "const EXCEPTIONS = …;") : s);
const code = (s) => names(s).replace(APP_BLOCK, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();

const problems = [];
let checked = 0;
const firstDiff = (a, b) => {
  const la = a.split("\n");
  const lb = b.split("\n");
  for (let i = 0; i < Math.max(la.length, lb.length); i++) if (la[i] !== lb[i]) return `line ${i + 1}: "${(la[i] ?? "").trim().slice(0, 70)}" ≠ "${(lb[i] ?? "").trim().slice(0, 70)}"`;
  return "";
};

for (const f of IDENTICAL) {
  checked += 1;
  if (!fs.existsSync(path.join(REF, f)) || !fs.existsSync(path.join(APP_ROOT, f))) {
    problems.push(`${f} is missing ${fs.existsSync(path.join(APP_ROOT, f)) ? "from the sister app" : "here"}`);
    continue;
  }
  const a = names(shared(f, read(REF, f)));
  const b = names(shared(f, read(APP_ROOT, f)));
  if (a !== b) problems.push(`${f} differs from the sister app (${firstDiff(a, b)})`);
}
for (const f of SAME_CODE) {
  const a = code(read(REF, f));
  const b = code(read(APP_ROOT, f));
  checked += 1;
  if (a !== b) {
    let i = 0;
    while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
    problems.push(`${f}: the rules differ from the sister app near "${a.slice(Math.max(0, i - 30), i + 40)}" / "${b.slice(Math.max(0, i - 30), i + 40)}"`);
  }
}

// The adapted modules: present in both apps, and each named in REVIEW.md's list of adapted shell
// modules with its reason (a line that names the file and says why).
const review = fs.existsSync(path.join(APP_ROOT, "REVIEW.md")) ? read(APP_ROOT, "REVIEW.md") : "";
const adaptedSection = (review.match(/#+ Adapted shell modules[\s\S]*?(?=\n#+ |$)/) || [""])[0];
for (const f of ADAPTED) {
  checked += 1;
  if (!fs.existsSync(path.join(APP_ROOT, f))) { problems.push(`${f} (adapted) is missing here`); continue; }
  if (!fs.existsSync(path.join(REF, f))) { problems.push(`${f} (adapted) is missing from the sister app`); continue; }
  const line = adaptedSection.split("\n").find((l) => l.includes(`\`${f}\``));
  if (!line) problems.push(`${f} is adapted but REVIEW.md's "Adapted shell modules" does not name it`);
  else if (!/\b(because|so that|so the|reason|for two languages)\b/i.test(line) || line.replace(/`[^`]*`/g, "").trim().split(/\s+/).length < 8) problems.push(`${f}: REVIEW.md names it without its reason`);
  else if (names(read(REF, f)) === names(read(APP_ROOT, f))) problems.push(`${f} is listed as adapted but is identical to the sister app's: move it back to the identical list`);
}

// vici/: the same files, byte for byte.
const hash = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const walk = (root, dir = "") => fs.readdirSync(path.join(root, dir), { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(root, path.join(dir, e.name)) : [path.join(dir, e.name)])).sort();
checked += 1;
if (!fs.existsSync(path.join(REF, "vici")) || !fs.existsSync(path.join(APP_ROOT, "vici"))) problems.push(`vici/ is missing ${fs.existsSync(path.join(APP_ROOT, "vici")) ? "from the sister app" : "here"}`);
else {
  const va = walk(path.join(REF, "vici"));
  const vb = walk(path.join(APP_ROOT, "vici"));
  const only = (x, y) => x.filter((f) => !y.includes(f));
  if (va.join() !== vb.join()) problems.push(`vici/: different files (only in the sister app: ${only(va, vb).join(", ") || "none"}; only here: ${only(vb, va).join(", ") || "none"})`);
  else {
    const differ = va.filter((f) => hash(path.join(REF, "vici", f)) !== hash(path.join(APP_ROOT, "vici", f)));
    if (differ.length) problems.push(`vici/: ${differ.length} file(s) differ (${differ.slice(0, 5).join(", ")})`);
  }
}

for (const p of problems) console.log(`FAIL  ${p}`);
console.log(`${checked - problems.length}/${checked} parity checks passed against ${REF}.`);
if (!problems.length) console.log("PARITY OK");
process.exit(problems.length ? 1 : 0);
