// The documentation set of version 2.0.0 is lean and consistent with the code:
//   - README has at most 900 words, DEMO_SCRIPT.md at most 700, DESIGN.md and DATA_SOURCES.md fit a
//     page (700 and 600); a word is anything between spaces, table bars included, so either way of
//     counting stays under the limit; each carries its sections and names the version js/config.js does;
//   - PLAN.md and REVIEW.md are only in the git history (at 1.0.0's commit), not in the tree;
//   - every section the code cites ("TECH_NOTES §3", "DATA_SOURCES.md §4") exists, and every repository
//     path a document names (in backticks or as a relative link) exists;
//   - every page a pre-run cites, apart from the reference facts', has its heading in research/<id>.md;
//     every quote a note lists is cited by its pre-run, unless the paragraph before it begins "Not cited"
//     and says why; DATA_SOURCES §4 counts each pre-run's pages and quotes and links its note, and
//     research/sources.md lists exactly the pages each pre-run cites, with its counts.
// Usage: node tests/docs.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import { APP_ROOT } from "./lib/harness.mjs";

const { APP } = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const RELEASE_1 = "1dc145e";
const DOCS = {
  "README.md": { max: 900, sections: ["The four figures", "The talk track", "Start agent", "What is real", "How it works", "Run it", "Tests", "History", "Author"], version: `version ${APP.version}` },
  "DEMO_SCRIPT.md": { max: 700, sections: ["The four figures at the top", "Before the call", "The five minutes", "Questions you will get", "If something goes wrong"], version: `Version ${APP.version}` },
  "DESIGN.md": { max: 700, sections: ["The screen", "Colour", "Play and Your turn", "Plain words", "The figures", "Two languages", "What stayed and what went"], version: `Version ${APP.version}` },
  "DATA_SOURCES.md": { max: 600, numbered: 5, version: `Version ${APP.version}` },
  // Version 1.0.0's record: the code that stayed still cites its sections, and its first paragraph says
  // which parts 2.0.0 removed, so the paths and citations inside it are not held to the 2.0.0 tree.
  "TECH_NOTES.md": { numbered: 24, history: true },
  "tests/README.md": { sections: ["What runs", "Setup for the browser suites", "The private term list"] },
  "research/sources.md": { sections: ["The catalogue", "The pre-runs"] }
};
const LIVE_URL = "https://victorpflueger.github.io/sovereigntyassessment/";

const problems = [];
const text = {};
const counts = [];
for (const [f, rule] of Object.entries(DOCS)) {
  const p = path.join(APP_ROOT, f);
  if (!fs.existsSync(p)) { problems.push(`${f} is missing`); continue; }
  const t = fs.readFileSync(p, "utf8");
  text[f] = t;
  const tokens = t.split(/\s+/).filter(Boolean).length;
  const words = t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  if (rule.max) {
    counts.push(`${f} ${words} words (${tokens} with table bars) of ${rule.max}`);
    if (tokens > rule.max) problems.push(`${f} has ${tokens} words, counting table bars (${words} without); at most ${rule.max}`);
  }
  const heads = [...t.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim());
  for (const s of rule.sections || []) if (!heads.some((h) => h.startsWith(s))) problems.push(`${f} lacks the section "${s}"`);
  if (rule.numbered) for (let n = 1; n <= rule.numbered; n++) if (!heads.some((h) => h.startsWith(`${n}. `))) problems.push(`${f} lacks section ${n}`);
  if (rule.version && !t.includes(rule.version)) problems.push(`${f} does not name "${rule.version}"`);
}
if (text["README.md"] && !text["README.md"].includes(LIVE_URL)) problems.push(`README.md does not link the live site (${LIVE_URL})`);

// PLAN.md and REVIEW.md: in the history, not in the tree.
const git = (...args) => execFileSync("git", args, { cwd: APP_ROOT, encoding: "utf8" });
const tracked = git("ls-files", "--cached", "--others", "--exclude-standard").split("\n").filter(Boolean);
for (const f of ["PLAN.md", "REVIEW.md"]) {
  if (fs.existsSync(path.join(APP_ROOT, f)) || tracked.includes(f)) problems.push(`${f} is still in the tree; it belongs to the git history`);
  try { git("cat-file", "-e", `${RELEASE_1}:${f}`); } catch { problems.push(`${f} is not in the git history at ${RELEASE_1}`); }
}

// Sections the code and the documents cite.
const sources = tracked.filter((f) => /\.(m?js|css|html|yml)$/.test(f) && fs.existsSync(path.join(APP_ROOT, f)));
const DOC_OF = { TECH_NOTES: "TECH_NOTES.md", DATA_SOURCES: "DATA_SOURCES.md" };
let cited = 0;
for (const f of [...sources, ...Object.keys(text).filter((d) => !DOCS[d].history)]) {
  const t = fs.readFileSync(path.join(APP_ROOT, f), "utf8");
  for (const m of t.matchAll(/\b(TECH_NOTES|DATA_SOURCES)(?:\.md)? ?§ ?(\d+)(?:[–-](\d+))?(?:(?:,| and) §(\d+))?/g)) {
    const doc = DOC_OF[m[1]];
    const all = m[3] ? Array.from({ length: Number(m[3]) - Number(m[2]) + 1 }, (_, i) => Number(m[2]) + i) : [Number(m[2]), m[4] ? Number(m[4]) : null].filter((x) => x !== null);
    for (const n of all) {
      cited += 1;
      if (text[doc] && !new RegExp(`^#{2,3} ${n}\\. `, "m").test(text[doc])) problems.push(`${f} cites ${doc} §${n}, which does not exist`);
    }
  }
  if (/\bDESIGN(?:\.md)? ?§ ?\d/.test(t)) problems.push(`${f} cites DESIGN.md by section number; its sections have names`);
}

// Paths the documents name.
const EXT = /\.(m?js|css|html|md|json|svg|yml|txt|jpg|woff2)$/;
const FOLDERS = ["", "js", "js/i18n", "css", "data", "data/runs", "research", "tests", "tests/lib", "tests/fixtures", "tools", "vici", "vici/dist", ".github/workflows"];
let named = 0;
for (const [f, t] of Object.entries(text)) {
  if (DOCS[f].history) continue;
  const base = path.dirname(path.join(APP_ROOT, f));
  const names = new Set();
  for (const m of t.matchAll(/`([^`\s]+)`/g)) names.add(m[1]);
  for (const m of t.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) if (!/^[a-z]+:/i.test(m[1])) names.add(m[1]);
  for (const n of names) {
    const clean = n.replace(/[.,;:]$/, "");
    if (/[<>*{}$]|^~|^\/|^https?:|^-/.test(clean)) continue;
    if (/^[\w-]+(\.[\w-]+)*\.(io|com|org|net|de|dev|ai|eu)(\/|$)/i.test(clean)) continue; // a web address, not a path
    if (!clean.includes("/") && !EXT.test(clean)) continue;
    if (!/^[\w./ -]+$/.test(clean) || !(EXT.test(clean) || clean.endsWith("/") || /^(\.\.\/)?(js|css|data|research|tests|tools|vici|fixtures|lib)(\/|$)/.test(clean))) continue;
    const candidates = clean.includes("/") ? [path.join(APP_ROOT, clean), path.join(base, clean)] : FOLDERS.map((d) => path.join(APP_ROOT, d, clean));
    named += 1;
    if (!candidates.some((c) => fs.existsSync(c))) problems.push(`${f} names ${clean}, which does not exist`);
  }
}

// The pre-runs' sources: research notes, DATA_SOURCES §4 and research/sources.md.
const { readRunFile, runIds } = await import(pathToFileURL(path.join(APP_ROOT, "tools/check-runs.mjs")).href);
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(APP_ROOT, "data/ref_facts.js"), "utf8"), sandbox);
const refUrls = new Set(JSON.stringify(sandbox.window.SA_REF_FACTS).match(/https?:\/\/[^"\s]+/g) || []);
const table = new Map();
const s4 = (text["DATA_SOURCES.md"] || "").split(/^## 4\. /m)[1]?.split(/^## /m)[0] || "";
for (const m of s4.matchAll(/^\| ([^|]+) \| (\d+) \| (\d+) \| \[([\w.-]+)\]\(research\/([\w.-]+)\) \|$/gm)) table.set(m[5].replace(/\.md$/, ""), { pages: +m[2], quotes: +m[3], label: m[4] });
const sections = (text["research/sources.md"] || "").split(/^### /m);
let entries = 0;
for (const id of runIds()) {
  const def = readRunFile(path.join(APP_ROOT, "data/runs", `${id}.js`));
  const pages = new Set();
  const quotes = new Set();
  const cites = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    if (typeof v.url === "string" && typeof v.quote === "string") {
      cites.add(`${v.url}\n${v.quote.replace(/\s+/g, " ").trim()}`);
      if (!refUrls.has(v.url)) { pages.add(v.url); quotes.add(`${v.url}\n${v.quote}`); }
    }
    Object.values(v).forEach(walk);
  };
  walk(def.steps);
  entries += 1;
  // DATA_SOURCES §4: the row of this pre-run, with its counts and its note.
  const row = table.get(id);
  if (!row) problems.push(`DATA_SOURCES.md §4 has no row for ${id} linking research/${id}.md`);
  else if (row.pages !== pages.size || row.quotes !== quotes.size) problems.push(`DATA_SOURCES.md §4 says ${id} cites ${row.pages} pages with ${row.quotes} quotes; it cites ${pages.size} with ${quotes.size}`);
  // research/sources.md: the pages it lists for this pre-run are the pages it cites (and pages it read).
  const sec = sections.find((x) => x.includes(`(\`data/runs/${id}.js\`)`));
  if (!sec) problems.push(`research/sources.md has no entry for data/runs/${id}.js`);
  else {
    const listed = new Set([...sec.matchAll(/^\| \[[^\]]*\]\((\S+?)\) \|/gm)].map((m) => m[1]));
    for (const u of pages) if (!listed.has(u)) problems.push(`research/sources.md does not list ${u} under ${id}, which cites it`);
    const fetched = new Set(def.steps.filter((st) => st.fetch).map((st) => st.fetch.url));
    for (const u of listed) if (!pages.has(u) && !fetched.has(u)) problems.push(`research/sources.md lists ${u} under ${id}, which neither cites nor reads it`);
  }
  // The research note: a heading for every page the pre-run cites, and only quotes it cites.
  const notePath = path.join(APP_ROOT, "research", `${id}.md`);
  if (!fs.existsSync(notePath)) { problems.push(`research/${id}.md is missing`); continue; }
  const note = fs.readFileSync(notePath, "utf8");
  const heads = new Set([...note.matchAll(/^###\s+\[.*\]\((https?:\/\/[^\s)]+)\)\s*$/gm)].map((m) => m[1]));
  for (const u of pages) if (!heads.has(u)) problems.push(`research/${id}.md has no heading for ${u}, which its pre-run cites`);
  let url = null;
  let marked = false;
  for (const line of note.split("\n")) {
    const head = line.match(/^###\s+\[.*\]\((https?:\/\/[^\s)]+)\)\s*$/);
    if (head) { url = head[1]; marked = false; continue; }
    if (/^Not cited\b.{10,}/.test(line)) { marked = true; continue; }
    const q = line.match(/^> (.+)$/);
    if (!q || !url) continue;
    if (marked) { marked = false; continue; }
    if (!cites.has(`${url}\n${q[1].replace(/\s+/g, " ").trim()}`)) problems.push(`research/${id}.md lists a quote its pre-run does not cite, unmarked: "${q[1].slice(0, 70)}"`);
  }
}
if (table.size !== entries) problems.push(`DATA_SOURCES.md §4 has ${table.size} rows for ${entries} pre-runs`);

// The talk track: DEMO_SCRIPT.md's five minutes are the English guide's last chapter, step by step.
const guideSteps = (html) => {
  const guide = (html.match(/<dialog[^>]*id="guide-en"[\s\S]*?<\/dialog>/) || [""])[0];
  const present = (guide.match(/data-vc-chapter="present"[\s\S]*?<\/ol>/) || [""])[0];
  return [...present.matchAll(/<li><strong>([\s\S]*?)<\/strong>\s*<span class="vc-guide__say">([\s\S]*?)<\/span>\s*<span class="vc-guide__time">/g)]
    .map((m) => [m[1], m[2]].map((x) => x.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()));
};
const scriptSteps = (md) => [...(md.split(/^## The five minutes/m)[1] || "").split(/^## /m)[0].matchAll(/^\d\. \*\*([^*]+)\*\*[^\n]*\n\s+(“[^\n]+”)/gm)].map((m) => [m[1].trim(), m[2].trim()]);
{
  const g = guideSteps(fs.readFileSync(path.join(APP_ROOT, "index.html"), "utf8"));
  const d = scriptSteps(text["DEMO_SCRIPT.md"] || "");
  const same = g.length >= 3 && g.length <= 7 && g.length === d.length && g.every(([a, b], i) => a === d[i][0] && b === d[i][1]);
  if (!same) problems.push(`DEMO_SCRIPT.md's five minutes differ from the guide's talk track: ${JSON.stringify(g)} vs ${JSON.stringify(d)}`);
  const planted = scriptSteps((text["DEMO_SCRIPT.md"] || "").replace("Nothing is sent.”", "Nothing at all is sent.”"));
  if (g.length && planted.every(([a, b], i) => g[i] && a === g[i][0] && b === g[i][1])) problems.push("self-test: the talk-track comparison missed a planted difference");
}

// A negative control: the counting and the section check catch a planted fault.
{
  const planted = "## 1. A\n" + "word ".repeat(950);
  const plantedTokens = planted.split(/\s+/).filter(Boolean).length;
  if (!(plantedTokens > 900)) problems.push("self-test: the word count missed a planted long document");
  const missingSection = !/^## 2\. /m.test(planted);
  if (!missingSection) problems.push("self-test: the section check missed a planted missing section");
}

for (const c of counts) console.log(`      ${c}`);
for (const p of problems) console.log(`FAIL  ${p}`);
console.log(`${Object.keys(DOCS).length} documents checked, ${cited} section citations, ${named} named paths and ${entries} pre-runs' sources: ${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
if (!problems.length) console.log("DOCS OK");
process.exit(problems.length ? 1 : 0);
