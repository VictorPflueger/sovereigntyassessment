// The documentation set is complete and consistent with the code:
//   - README, PLAN, DESIGN, TECH_NOTES, DATA_SOURCES, REVIEW, DEMO_SCRIPT and tests/README exist, are
//     substantial for this version and carry their required sections;
//   - every section the code cites ("TECH_NOTES §3", "DATA_SOURCES.md §4", "DESIGN.md §3") exists;
//   - every repository path a document names (in backticks or as a relative link) exists;
//   - the README links the live site and names the version js/config.js carries.
// Taken from the Timetable Translator's tests/docs.mjs, with this app's documents for version 0.1.0;
// the minimum lengths grow with the milestones (PLAN.md h).
// Usage: node tests/docs.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { APP_ROOT } from "./lib/harness.mjs";

const { APP } = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const DOCS = {
  "README.md": { words: 900, sections: ["Status: version", "Run it", "The two modes", "Your API key", "Safety and the EU AI Act", "Quality and tests", "Files"] },
  // The plan names the files of later milestones and of the sister apps, so its paths are not checked.
  "PLAN.md": { words: 5000, sections: ["Phase 0 in one page", "Architecture and file tree", "Milestones"], paths: false },
  "DESIGN.md": { words: 900, numbered: 8 },
  "TECH_NOTES.md": { words: 1800, numbered: 12 },
  "DATA_SOURCES.md": { words: 900, numbered: 6 },
  "REVIEW.md": { words: 500, sections: ["Part 1. Status", "Copied unchanged", "Adapted shell modules"] },
  "DEMO_SCRIPT.md": { words: 200, sections: ["Pre-flight"] },
  "tests/README.md": { words: 500, sections: ["What runs", "Setup for the browser suites", "The private term list"] }
};
const LIVE_URL = "https://victorpflueger.github.io/sovereigntyassessment/";

const problems = [];
const text = {};
for (const [f, rule] of Object.entries(DOCS)) {
  const p = path.join(APP_ROOT, f);
  if (!fs.existsSync(p)) { problems.push(`${f} is missing`); continue; }
  const t = fs.readFileSync(p, "utf8");
  text[f] = t;
  const words = t.split(/\s+/).filter(Boolean).length;
  if (words < rule.words) problems.push(`${f} has ${words} words (at least ${rule.words} expected)`);
  const heads = [...t.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim());
  for (const s of rule.sections || []) if (!heads.some((h) => h.startsWith(s) || h.includes(s))) problems.push(`${f} lacks the section "${s}"`);
  if (rule.numbered) for (let n = 1; n <= rule.numbered; n++) if (!heads.some((h) => h.startsWith(`${n}. `))) problems.push(`${f} lacks section ${n}`);
}

// Sections the code cites.
const tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: APP_ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
const sources = tracked.filter((f) => /\.(m?js|css|html|yml)$/.test(f));
const DOC_OF = { TECH_NOTES: "TECH_NOTES.md", DESIGN: "DESIGN.md", DATA_SOURCES: "DATA_SOURCES.md" };
let cited = 0;
for (const f of [...sources, ...Object.keys(text)]) {
  const t = fs.readFileSync(path.join(APP_ROOT, f), "utf8");
  for (const m of t.matchAll(/\b(TECH_NOTES|DESIGN|DATA_SOURCES)(?:\.md)? ?§ ?(\d+)(?:[–-](\d+))?(?: and §(\d+))?/g)) {
    const doc = DOC_OF[m[1]];
    const nums = [Number(m[2]), m[3] ? Number(m[3]) : null, m[4] ? Number(m[4]) : null].filter((x) => x !== null);
    const all = m[3] ? Array.from({ length: Number(m[3]) - Number(m[2]) + 1 }, (_, i) => Number(m[2]) + i) : nums;
    for (const n of all) {
      cited += 1;
      if (text[doc] && !new RegExp(`^#{2,3} ${n}\\. `, "m").test(text[doc])) problems.push(`${f} cites ${doc} §${n}, which does not exist`);
    }
  }
}

// Paths the documents name.
const EXT = /\.(m?js|css|html|md|json|svg|yml|txt|jpg|woff2)$/;
const FOLDERS = ["", "js", "js/i18n", "css", "data", "tests", "tests/lib", "tests/fixtures", "tools", "vici", "vici/dist", ".github/workflows"];
let named = 0;
for (const [f, t] of Object.entries(text)) {
  if (DOCS[f].paths === false) continue;
  const base = path.dirname(path.join(APP_ROOT, f));
  const names = new Set();
  for (const m of t.matchAll(/`([^`\s]+)`/g)) names.add(m[1]);
  for (const m of t.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) if (!/^[a-z]+:/i.test(m[1])) names.add(m[1]);
  for (const n of names) {
    const clean = n.replace(/[.,;:]$/, "");
    if (/[<>*{}$]|^~|^\/|^https?:|^-/.test(clean)) continue;
    if (/^[\w-]+(\.[\w-]+)*\.(io|com|org|net|de|dev|ai|eu)(\/|$)/i.test(clean)) continue; // a web address, not a path
    if (!clean.includes("/") && !EXT.test(clean)) continue;
    if (!/^[\w./ -]+$/.test(clean) || !(EXT.test(clean) || clean.endsWith("/") || /^(js|css|data|tests|tools|vici|fixtures|lib)(\/|$)/.test(clean))) continue;
    // A bare file name ("engine.js") may live in any of the app's folders.
    const candidates = clean.includes("/")
      ? [path.join(APP_ROOT, clean), path.join(base, clean)]
      : FOLDERS.map((d) => path.join(APP_ROOT, d, clean));
    named += 1;
    if (!candidates.some((c) => fs.existsSync(c))) problems.push(`${f} names ${clean}, which does not exist`);
  }
}

if (text["README.md"] && !text["README.md"].includes(LIVE_URL)) problems.push(`README.md does not link the live site (${LIVE_URL})`);
if (text["README.md"] && !text["README.md"].includes(`version ${APP.version}`)) problems.push(`README.md does not name the version in js/config.js (${APP.version})`);
for (const f of ["TECH_NOTES.md", "DESIGN.md", "DEMO_SCRIPT.md"]) if (text[f] && !text[f].includes(`Version ${APP.version}`)) problems.push(`${f} does not name the version in js/config.js (${APP.version})`);

for (const p of problems) console.log(`FAIL  ${p}`);
console.log(`${Object.keys(DOCS).length} documents checked, ${cited} section citations and ${named} named paths: ${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
if (!problems.length) console.log("DOCS OK");
process.exit(problems.length ? 1 : 0);
