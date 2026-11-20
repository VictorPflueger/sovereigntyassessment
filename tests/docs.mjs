// The documentation set is complete and consistent with the code:
//   - README, PLAN, DESIGN, TECH_NOTES, DATA_SOURCES, REVIEW, DEMO_SCRIPT and tests/README exist, are
//     substantial for this version and carry their required sections;
//   - every section the code cites ("TECH_NOTES §3", "DATA_SOURCES.md §4", "DESIGN.md §3") exists;
//   - every repository path a document names (in backticks or as a relative link) exists;
//   - the README links the live site and names the version js/config.js carries;
//   - DATA_SOURCES §7 states for each pre-run the pages it cites outside the reference facts and their
//     quotes, and its table lists exactly those pages; a page listed but not cited must be one the pre-run
//     reads and the entry must say "N sources read, M of them with the K quotes cited";
//   - every quote a research note lists is cited by its pre-run, unless it follows, under the same source, a
//     paragraph that begins "Not cited" and says why.
// Taken from the Timetable Translator's tests/docs.mjs, with this app's documents for version 0.2.0;
// the minimum lengths grow with the milestones (PLAN.md h).
// Usage: node tests/docs.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
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

// DATA_SOURCES §7 against the pre-runs: the pages each cites with a quote, apart from the reference facts'.
let entries = 0;
if (text["DATA_SOURCES.md"]) {
  const { readRunFile, runIds } = await import(pathToFileURL(path.join(APP_ROOT, "tools/check-runs.mjs")).href);
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(APP_ROOT, "data/ref_facts.js"), "utf8"), sandbox);
  const refUrls = new Set(JSON.stringify(sandbox.window.SA_REF_FACTS).match(/https?:\/\/[^"\s]+/g) || []);
  const sections = text["DATA_SOURCES.md"].split(/^### /m);
  for (const id of runIds()) {
    const def = readRunFile(path.join(APP_ROOT, "data/runs", `${id}.js`));
    const pages = new Set(), quotes = new Set();
    const walk = (v) => {
      if (Array.isArray(v)) return v.forEach(walk);
      if (!v || typeof v !== "object") return;
      if (typeof v.url === "string" && typeof v.quote === "string" && !refUrls.has(v.url)) { pages.add(v.url); quotes.add(`${v.url}\n${v.quote}`); }
      Object.values(v).forEach(walk);
    };
    walk(def.steps);
    const fetched = new Set(def.steps.filter((st) => st.fetch).map((st) => st.fetch.url));
    const sec = sections.find((x) => x.includes(`(\`data/runs/${id}.js\`)`));
    if (!sec) { problems.push(`DATA_SOURCES.md has no entry for data/runs/${id}.js`); continue; }
    entries += 1;
    const listed = new Set([...sec.matchAll(/^\| \[[^\]]*\]\((\S+?)\) \|/gm)].map((m) => m[1]));
    for (const u of pages) if (!listed.has(u)) problems.push(`DATA_SOURCES.md does not list ${u} under ${id}, which cites it`);
    const uncited = [...listed].filter((u) => !pages.has(u));
    const read = sec.match(/(\d+) sources read, (\d+) of them with the (\d+) quotes cited/);
    const plain = sec.match(/(\d+) sources? with (\d+) quotes/);
    if (read) {
      if (+read[1] !== listed.size || +read[2] !== pages.size || +read[3] !== quotes.size) problems.push(`DATA_SOURCES.md says ${id} read ${read[1]} sources and cites ${read[2]} with ${read[3]} quotes; it lists ${listed.size} and cites ${pages.size} with ${quotes.size}`);
      for (const u of uncited) if (!fetched.has(u)) problems.push(`DATA_SOURCES.md lists ${u} under ${id}, which neither cites nor reads it`);
    } else if (plain) {
      if (+plain[1] !== pages.size || +plain[2] !== quotes.size) problems.push(`DATA_SOURCES.md says ${id} has ${plain[1]} sources with ${plain[2]} quotes; it cites ${pages.size} with ${quotes.size}`);
      for (const u of uncited) problems.push(`DATA_SOURCES.md lists ${u} under ${id}, which does not cite it`);
    } else problems.push(`DATA_SOURCES.md does not count the sources of ${id}`);
    // The research note: each quote it lists is one the pre-run cites, or is marked as not cited.
    const notePath = path.join(APP_ROOT, "research", `${id}.md`);
    if (!fs.existsSync(notePath)) { problems.push(`research/${id}.md is missing`); continue; }
    const cites = new Set();
    const all = (v) => {
      if (Array.isArray(v)) return v.forEach(all);
      if (!v || typeof v !== "object") return;
      if (typeof v.url === "string" && typeof v.quote === "string") cites.add(`${v.url}\n${v.quote.replace(/\s+/g, " ").trim()}`);
      Object.values(v).forEach(all);
    };
    all(def.steps);
    let url = null;
    let marked = false;
    for (const line of fs.readFileSync(notePath, "utf8").split("\n")) {
      const head = line.match(/^###\s+\[.*\]\((https?:\/\/[^\s)]+)\)\s*$/);
      if (head) { url = head[1]; marked = false; continue; }
      if (/^Not cited\b.{10,}/.test(line)) { marked = true; continue; }
      const q = line.match(/^> (.+)$/);
      if (!q || !url || marked) continue;
      if (!cites.has(`${url}\n${q[1].replace(/\s+/g, " ").trim()}`)) problems.push(`research/${id}.md lists a quote its pre-run does not cite, unmarked: "${q[1].slice(0, 70)}"`);
    }
  }
}

for (const p of problems) console.log(`FAIL  ${p}`);
console.log(`${Object.keys(DOCS).length} documents checked, ${cited} section citations, ${named} named paths and ${entries} pre-runs' sources: ${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
if (!problems.length) console.log("DOCS OK");
process.exit(problems.length ? 1 : 0);
