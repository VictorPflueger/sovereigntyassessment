// The documentation set is lean and consistent with the code. Cases, each runnable alone:
//   docs         README has at most 900 words, DEMO_SCRIPT.md at most 1,400 (its English and German halves),
//                DESIGN.md at most 700 and DATA_SOURCES.md at most 600; a word is anything between spaces,
//                table bars included; each carries its sections and names the version js/config.js does.
//                PLAN.md is only in the git history; REVIEW.md is version 2.1.0's cold read and reviews
//                (1.0.0's is in the history at 1dc145e). Every section the code cites ("TECH_NOTES §3")
//                exists, every repository path a document names exists, and every pre-run's sources are
//                accounted for: a heading in research/<id>.md for every page it cites, no quote a note
//                lists that the pre-run does not cite unless marked "Not cited", and research/sources.md
//                with each pre-run's counts, its note and exactly its pages.
//   talk-track   DEMO_SCRIPT.md's five minutes are the guide's last chapter, step by step, in English and
//                in German: three to seven timed steps of about five minutes that show a weak link that
//                isn't critical, its make-up, its starting points, BundID against the ID wallet in Compare
//                and the Serviceportal.NRW; and DEMO_SCRIPT.md answers the review's six questions in both
//                languages.
//   nrw-sources  research/sources.md and DATA_SOURCES.md list every page the Serviceportal.NRW's pre-run
//                cites, each with the date it was read.
//   pinned       TECH_NOTES.md §25 gives a reason for every file whose hash 2.1.0 changed against 1.0.0
//                (tests/lib/baseline.mjs), the engine's rules are not among them, and decisions D1 to D8
//                stand there with the choice in force.
//   cold-read    REVIEW.md's cold read: for BundID and FIT-Connect in English and German every one of the
//                eight questions has an expected and a given answer, and question 6 also from the
//                overview alone; every given answer names what the expected one must (the "Must name"
//                column), the figures among them are the engine's, every row says "yes", and no person is
//                named. Narrow it with question ids: q1 to q8, or q6-overview.
// Each case first catches a planted fault. Prints DOCS OK <case> per case that passed (for the cold read,
// DOCS OK cold-read <q> per question asked, or "all"), and DOCS OK when every case ran and passed.
// Usage: node tests/docs.mjs [case …] [q3 …]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import { APP_ROOT } from "./lib/harness.mjs";

const Q_ARG = /^q[1-8](?:-overview)?$/;
const CASES = ["docs", "talk-track", "nrw-sources", "pinned", "cold-read"];
const ARGS = process.argv.slice(2);
const askedCases = ARGS.filter((a) => !Q_ARG.test(a));
const askedQs = ARGS.filter((a) => Q_ARG.test(a));
for (const a of askedCases) if (!CASES.includes(a)) { console.log(`Unknown case "${a}"; the cases are ${CASES.join(", ")}.`); process.exit(2); }
const runs = (c) => !askedCases.length || askedCases.includes(c);

const { APP } = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const RELEASE_1 = "1dc145e";
const DOCS = {
  "README.md": { max: 900, sections: ["The four figures", "The talk track", "Start agent", "What is real", "How it works", "Run it", "Tests", "History", "Author"], version: `version ${APP.version}` },
  "DEMO_SCRIPT.md": { max: 1400, sections: ["The four figures at the top", "Before the call", "The five minutes", "Questions you will get", "If something goes wrong", "Auf Deutsch", "Die fünf Minuten", "Fragen, die kommen"], version: `Version ${APP.version}` },
  "DESIGN.md": { max: 700, sections: ["The screen", "Colour", "Play, words and languages", "The figures", "What stayed and what went"], version: `Version ${APP.version}` },
  "DATA_SOURCES.md": { max: 600, numbered: 5, version: `Version ${APP.version}` },
  // Version 1.0.0's record, with 2.1.0's §25: the code that stayed still cites its sections, and its first
  // paragraph says which parts 2.0.0 removed, so the paths and citations inside it are not held to the tree.
  "TECH_NOTES.md": { numbered: 25, history: true },
  "tests/README.md": { sections: ["What runs", "Setup for the browser suites", "The private term list"] },
  "research/sources.md": { sections: ["The catalogue", "The reference facts", "The pre-runs"] },
  "REVIEW.md": { sections: ["Cold read", "Partner review", "Design review", "Usability audit", "Critique of every changed screen"], version: `version ${APP.version}` }
};
const LIVE_URL = "https://victorpflueger.github.io/sovereigntyassessment/";

const problems = new Map(CASES.map((c) => [c, []]));
const fail = (c, msg) => problems.get(c).push(msg);
const text = {};
for (const f of Object.keys(DOCS)) {
  const p = path.join(APP_ROOT, f);
  if (fs.existsSync(p)) text[f] = fs.readFileSync(p, "utf8");
}
const counts = [];
const norm = (s) => String(s || "").replace(/[   ]/g, " ").replace(/[“”„‟"«»]/g, '"').replace(/[‘’‚]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
/** A section of a Markdown text, from its heading to the next heading of the same or a higher level. */
const section = (md, heading, level = 2) => {
  const lines = (md || "").split("\n");
  const at = lines.findIndex((l) => new RegExp(`^#{${level}} ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(l));
  if (at < 0) return "";
  const end = lines.findIndex((l, i) => i > at && new RegExp(`^#{1,${level}} `).test(l));
  return lines.slice(at, end < 0 ? undefined : end).join("\n");
};
/** The rows of the first Markdown table in a text, as arrays of trimmed cells, header and rule left out. */
const tableRows = (md) => {
  const rows = [];
  let inTable = false;
  for (const line of (md || "").split("\n")) {
    if (!/^\|.*\|\s*$/.test(line)) { if (inTable) break; continue; }
    inTable = true;
    rows.push(line.trim().slice(1, -1).split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|")));
  }
  return rows.slice(2);
};

// ---- docs ------------------------------------------------------------------------------------------------------
if (runs("docs")) {
  const C = "docs";
  // A negative control: the counting and the section check catch a planted fault.
  {
    const planted = "## 1. A\n" + "word ".repeat(950);
    if (!(planted.split(/\s+/).filter(Boolean).length > 900)) fail(C, "self-test: the word count missed a planted long document");
    if (/^## 2\. /m.test(planted)) fail(C, "self-test: the section check missed a planted missing section");
  }
  for (const [f, rule] of Object.entries(DOCS)) {
    const t = text[f];
    if (t === undefined) { fail(C, `${f} is missing`); continue; }
    const tokens = t.split(/\s+/).filter(Boolean).length;
    const words = t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    if (rule.max) {
      counts.push(`${f} ${words} words (${tokens} with table bars) of ${rule.max}`);
      if (tokens > rule.max) fail(C, `${f} has ${tokens} words, counting table bars (${words} without); at most ${rule.max}`);
    }
    const heads = [...t.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim());
    for (const s of rule.sections || []) if (!heads.some((h) => h.startsWith(s))) fail(C, `${f} lacks the section "${s}"`);
    if (rule.numbered) for (let n = 1; n <= rule.numbered; n++) if (!heads.some((h) => h.startsWith(`${n}. `))) fail(C, `${f} lacks section ${n}`);
    if (rule.version && !t.includes(rule.version)) fail(C, `${f} does not name "${rule.version}"`);
  }
  if (text["README.md"] && !text["README.md"].includes(LIVE_URL)) fail(C, `README.md does not link the live site (${LIVE_URL})`);

  // PLAN.md in the history only; REVIEW.md in the tree, 1.0.0's in the history.
  const git = (...args) => execFileSync("git", args, { cwd: APP_ROOT, encoding: "utf8" });
  const tracked = git("ls-files", "--cached", "--others", "--exclude-standard").split("\n").filter(Boolean);
  if (fs.existsSync(path.join(APP_ROOT, "PLAN.md")) || tracked.includes("PLAN.md")) fail(C, "PLAN.md is still in the tree; it belongs to the git history");
  for (const f of ["PLAN.md", "REVIEW.md"]) {
    try { git("cat-file", "-e", `${RELEASE_1}:${f}`); } catch { fail(C, `${f} is not in the git history at ${RELEASE_1}`); }
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
        if (text[doc] && !new RegExp(`^#{2,3} ${n}\\. `, "m").test(text[doc])) fail(C, `${f} cites ${doc} §${n}, which does not exist`);
      }
    }
    if (/\bDESIGN(?:\.md)? ?§ ?\d/.test(t)) fail(C, `${f} cites DESIGN.md by section number; its sections have names`);
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
      if (!candidates.some((c) => fs.existsSync(c))) fail(C, `${f} names ${clean}, which does not exist`);
    }
  }

  // The pre-runs' sources: research notes and research/sources.md.
  const { readRunFile, runIds } = await import(pathToFileURL(path.join(APP_ROOT, "tools/check-runs.mjs")).href);
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(APP_ROOT, "data/ref_facts.js"), "utf8"), sandbox);
  const refUrls = new Set(JSON.stringify(sandbox.window.SA_REF_FACTS).match(/https?:\/\/[^"\s]+/g) || []);
  const table = new Map();
  const runsPart = (text["research/sources.md"] || "").split(/^## The pre-runs/m)[1] || "";
  for (const m of runsPart.split(/^### /m)[0].matchAll(/^\| ([^|]+) \| (\d+) \| (\d+) \| \[([\w.-]+)\]\(([\w.-]+)\) \|$/gm)) table.set(m[5].replace(/\.md$/, ""), { pages: +m[2], quotes: +m[3], label: m[4] });
  const sections = (text["research/sources.md"] || "").split(/^### /m);
  const refPart = (text["research/sources.md"] || "").split(/^## The reference facts/m)[1]?.split(/^## /m)[0] || "";
  for (const u of refUrls) if (!refPart.includes(u)) fail(C, `research/sources.md does not list the reference facts' page ${u}`);
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
    const row = table.get(id);
    if (!row) fail(C, `research/sources.md has no row for ${id} linking ${id}.md`);
    else if (row.pages !== pages.size || row.quotes !== quotes.size) fail(C, `research/sources.md says ${id} cites ${row.pages} pages with ${row.quotes} quotes; it cites ${pages.size} with ${quotes.size}`);
    const sec = sections.find((x) => x.includes(`(\`data/runs/${id}.js\`)`));
    if (!sec) fail(C, `research/sources.md has no entry for data/runs/${id}.js`);
    else {
      const listed = new Set([...sec.matchAll(/^\| \[[^\]]*\]\((\S+?)\) \|/gm)].map((m) => m[1]));
      for (const u of pages) if (!listed.has(u)) fail(C, `research/sources.md does not list ${u} under ${id}, which cites it`);
      const fetched = new Set(def.steps.filter((st) => st.fetch).map((st) => st.fetch.url));
      for (const u of listed) if (!pages.has(u) && !fetched.has(u)) fail(C, `research/sources.md lists ${u} under ${id}, which neither cites nor reads it`);
    }
    const notePath = path.join(APP_ROOT, "research", `${id}.md`);
    if (!fs.existsSync(notePath)) { fail(C, `research/${id}.md is missing`); continue; }
    const note = fs.readFileSync(notePath, "utf8");
    const heads = new Set([...note.matchAll(/^###\s+\[.*\]\((https?:\/\/[^\s)]+)\)\s*$/gm)].map((m) => m[1]));
    for (const u of pages) if (!heads.has(u)) fail(C, `research/${id}.md has no heading for ${u}, which its pre-run cites`);
    let url = null;
    let marked = false;
    for (const line of note.split("\n")) {
      const head = line.match(/^###\s+\[.*\]\((https?:\/\/[^\s)]+)\)\s*$/);
      if (head) { url = head[1]; marked = false; continue; }
      if (/^Not cited\b.{10,}/.test(line)) { marked = true; continue; }
      const q = line.match(/^> (.+)$/);
      if (!q || !url) continue;
      if (marked) { marked = false; continue; }
      if (!cites.has(`${url}\n${q[1].replace(/\s+/g, " ").trim()}`)) fail(C, `research/${id}.md lists a quote its pre-run does not cite, unmarked: "${q[1].slice(0, 70)}"`);
    }
  }
  if (table.size !== entries) fail(C, `research/sources.md counts ${table.size} pre-runs of ${entries}`);
  counts.push(`${Object.keys(DOCS).length} documents, ${cited} section citations, ${named} named paths and ${entries} pre-runs' sources checked`);
}

// ---- talk-track ------------------------------------------------------------------------------------------------
if (runs("talk-track")) {
  const C = "talk-track";
  const html = fs.readFileSync(path.join(APP_ROOT, "index.html"), "utf8");
  const clean = (x) => x.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const guideSteps = (lang) => {
    const guide = (html.match(new RegExp(`<dialog[^>]*id="guide-${lang}"[\\s\\S]*?</dialog>`)) || [""])[0];
    const present = (guide.match(/data-vc-chapter="present"[\s\S]*?<\/ol>/) || [""])[0];
    return [...present.matchAll(/<li><strong>([\s\S]*?)<\/strong>\s*<span class="vc-guide__say">([\s\S]*?)<\/span>\s*<span class="vc-guide__time">([\s\S]*?)<\/span>/g)].map((m) => ({ step: clean(m[1]), say: clean(m[2]), time: clean(m[3]) }));
  };
  const script = text["DEMO_SCRIPT.md"] || "";
  const [en, de] = [script.split(/^## Auf Deutsch/m)[0], section(script, "Auf Deutsch")];
  const scriptSteps = (md, heading, level, open, close) => [...section(md, heading, level).matchAll(new RegExp(`^\\d\\. \\*\\*([^*]+)\\*\\*[^\\n]*\\n\\s+(${open}[^\\n]+${close})`, "gm"))].map((m) => ({ step: m[1].trim(), say: m[2].trim() }));
  const same = (g, d) => g.length === d.length && g.every((x, i) => x.step === d[i].step && x.say === d[i].say);
  const minutes = (steps) => steps.reduce((n, s) => n + (Number((s.time.match(/^(\d+(?:[.,]\d+)?) min$/) || [])[1]?.replace(",", ".")) || NaN), 0);
  // The new parts the script must show, by what its steps say.
  const SHOWS = {
    en: [["a weak link that isn't critical", /App Store[^.]*(runs without it|not critical|isn't critical)/i], ["its make-up", /open the App Store block/i], ["its starting points", /starting point/i], ["BundID against the ID wallet in Compare", /compare BundID with the ID wallet|Compare puts/i], ["the Serviceportal.NRW", /Serviceportal\.NRW/]],
    de: [["a weak link that isn't critical", /App Store[^.]*(ohne ihn|nicht kritisch)/i], ["its make-up", /App-Store-Baustein öffnen/i], ["its starting points", /Ansatzpunkt/i], ["BundID against the ID wallet in Compare", /mit der Wallet d-you vergleichen|Vergleich stellt/i], ["the Serviceportal.NRW", /Serviceportal\.NRW/]]
  };
  const QUESTIONS = {
    en: ["Why does the tile say 4 of 4 when a block shows 0?", "Are blocks without sources left out?", "Why aren't the alternatives ranked?", "Did the replay cost money?", "Does it work for a state's platform?", "Is this an official assessment?"],
    de: ["Warum zeigt die Kachel 4 von 4, wenn ein Baustein 0 hat?", "Fallen Bausteine ohne Quellen weg?", "Warum sind die Alternativen nicht gereiht?", "Hat die Wiedergabe Geld gekostet?", "Funktioniert das auch für die Plattform eines Landes?", "Ist das eine amtliche Bewertung?"]
  };
  const answered = (md, q) => { const m = md.match(new RegExp(`^\\*\\*${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\* (.+)$`, "m")); return m ? m[1].split(/\s+/).length : 0; };
  // Planted faults: a changed line, and a question without its answer.
  {
    const g = guideSteps("en");
    const planted = scriptSteps(en.replace("costs nothing.”", "costs nothing at all.”"), "The five minutes", 2, "“", "”");
    if (g.length && same(g, planted)) fail(C, "self-test: the comparison missed a planted difference");
    if (answered(en.replace(QUESTIONS.en[3], "Did it cost?"), QUESTIONS.en[3]) > 0) fail(C, "self-test: the question check missed a planted missing question");
  }
  for (const [lang, md, heading, level, open, close] of [["en", en, "The five minutes", 2, "“", "”"], ["de", de, "Die fünf Minuten", 3, "„", "“"]]) {
    const g = guideSteps(lang);
    const d = scriptSteps(md, heading, level, open, close);
    if (!(g.length >= 3 && g.length <= 7)) fail(C, `${lang}: the guide's talk track has ${g.length} steps; three to seven`);
    if (!same(g, d)) fail(C, `${lang}: DEMO_SCRIPT.md's five minutes differ from the guide's talk track: ${JSON.stringify(g.map(({ step, say }) => [step, say]))} vs ${JSON.stringify(d.map(({ step, say }) => [step, say]))}`);
    const total = minutes(g);
    if (!(total >= 4 && total <= 6)) fail(C, `${lang}: the talk track's steps add up to ${total} minutes; about five`);
    const all = g.map((s) => `${s.step} ${s.say}`).join(" ");
    for (const [what, re] of SHOWS[lang]) if (!re.test(all)) fail(C, `${lang}: the talk track does not show ${what}`);
    for (const q of QUESTIONS[lang]) if (answered(md, q) < 8) fail(C, `${lang}: DEMO_SCRIPT.md does not answer "${q}"`);
  }
}

// ---- nrw-sources ---------------------------------------------------------------------------------------------
if (runs("nrw-sources")) {
  const C = "nrw-sources";
  const box = { window: {} };
  for (const f of ["data/ref_facts.js", "data/runs/serviceportal-nrw.js"]) vm.runInNewContext(fs.readFileSync(path.join(APP_ROOT, f), "utf8"), box);
  const refUrls = new Set(JSON.stringify(box.window.SA_REF_FACTS).match(/https?:\/\/[^"\s]+/g) || []);
  const pages = new Map();
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    if (typeof v.url === "string" && typeof v.quote === "string" && !refUrls.has(v.url)) pages.set(v.url, [pages.get(v.url), v.read_on].filter(Boolean).sort().pop());
    Object.values(v).forEach(walk);
  };
  walk(box.window.SA_RUNS["serviceportal-nrw"].steps);
  const sec = ((text["research/sources.md"] || "").split(/^### /m).find((x) => x.includes("(`data/runs/serviceportal-nrw.js`)")) || "");
  const listedIn = (md, url, date) => (md || "").split("\n").some((l) => l.includes(`](${url})`) && l.includes(date));
  // A planted fault: a page without its date is caught.
  if (pages.size && listedIn(sec.replace(/\| \d{4}-\d{2}-\d{2} \|/g, "| |"), [...pages.keys()][0], [...pages.values()][0])) fail(C, "self-test: a row without its date passed");
  if (!pages.size) fail(C, "the Serviceportal.NRW's pre-run cites no page");
  if (!sec) fail(C, "research/sources.md has no section for data/runs/serviceportal-nrw.js");
  for (const [url, date] of pages) {
    if (!date) { fail(C, `the pre-run cites ${url} without a read date`); continue; }
    if (!listedIn(sec, url, date)) fail(C, `research/sources.md does not list ${url} with its read date ${date} under the Serviceportal.NRW`);
    if (!listedIn(text["DATA_SOURCES.md"], url, date)) fail(C, `DATA_SOURCES.md does not list ${url} with its read date ${date}`);
  }
  counts.push(`the Serviceportal.NRW cites ${pages.size} pages`);
}

// ---- pinned --------------------------------------------------------------------------------------------------
if (runs("pinned")) {
  const C = "pinned";
  const { SHA256_1, SHA256 } = await import(pathToFileURL(path.join(APP_ROOT, "tests/lib/baseline.mjs")).href);
  const changed = Object.keys(SHA256).filter((f) => SHA256_1[f] !== SHA256[f]);
  const ENGINE = ["js/engine.js", "js/classes.js", "js/weights.js", "js/facts.js", "js/audit.js"];
  for (const f of ENGINE) if (SHA256_1[f] !== SHA256[f]) fail(C, `${f} changed against 1.0.0: the engine's rules must stay`);
  const s25 = section(text["TECH_NOTES.md"], "25. ");
  const reasons = (md) => {
    const out = new Map();
    for (const line of (md || "").split("\n")) {
      const cells = line.match(/^\|(.+)\|\s*$/)?.[1].split(/(?<!\\)\|/).map((c) => c.trim());
      if (!cells || cells.length < 2) continue;
      for (const m of cells[0].matchAll(/`([^`]+)`/g)) out.set(m[1], cells[1]);
    }
    return out;
  };
  const given = reasons(s25);
  // A planted fault: a file without its row is caught.
  if (changed.length && reasons(s25.split("\n").filter((l) => !l.includes(`\`${changed[0]}\``)).join("\n")).has(changed[0])) fail(C, "self-test: a file without its row passed");
  if (!s25) fail(C, "TECH_NOTES.md has no §25");
  for (const f of changed) {
    const why = given.get(f);
    if (!why || why.split(/\s+/).length < 4) fail(C, `TECH_NOTES.md §25 gives no reason for ${f}, which 2.1.0 changed`);
  }
  for (const f of given.keys()) if (/^(js|data|research|tools)\//.test(f) && Object.hasOwn(SHA256, f) && !changed.includes(f)) fail(C, `TECH_NOTES.md §25 lists ${f} as changed, but its hash is 1.0.0's`);
  for (let n = 1; n <= 8; n++) {
    const row = (s25.match(new RegExp(`^\\| D${n} \\|(.+)\\|\\s*$`, "m")) || [])[1];
    if (!row || row.split("|").filter((c) => c.trim()).length < 3) fail(C, `TECH_NOTES.md §25 does not record decision D${n} with its default and the choice in force`);
  }
  counts.push(`${changed.length} pinned files changed against 1.0.0, each with its reason`);
}

// ---- cold-read -----------------------------------------------------------------------------------------------
if (runs("cold-read")) {
  const C = "cold-read";
  const review = text["REVIEW.md"] || "";
  const rows = tableRows(section(review, "Cold read").split(/^### Answers/m)[1] || "").map(([q, kase, lang, expected, given, must, match]) => ({ q, kase, lang, expected, given, must, match }));
  // The engine's figures the answers name: overall score, lever, and the comparable service that scores higher.
  const { loadData, playCase } = await import(pathToFileURL(path.join(APP_ROOT, "tests/lib/play.mjs")).href);
  const { comparable } = await import(pathToFileURL(path.join(APP_ROOT, "js/chain.js")).href);
  const EN = (await import(pathToFileURL(path.join(APP_ROOT, "js/i18n/en.js")).href)).default;
  const DE = (await import(pathToFileURL(path.join(APP_ROOT, "js/i18n/de.js")).href)).default;
  const win = loadData();
  const entries = win.SA_CATALOGUE.entries;
  const scores = {};
  const facts = {};
  for (const e of entries) {
    const played = await playCase(win.SA_RUNS[e.id], "en", { choice: "keep" });
    const res = played.result;
    if (!res || res.overall === null || res.overall === undefined) { scores[e.id] = { notService: true }; continue; }
    scores[e.id] = { overall: res.overall, layers: Object.values(res.layers).filter((l) => l.score !== null).length };
    if (e.id === "bundid" || e.id === "fit-connect") {
      const lever = played.events.find((ev) => ev.type === "levers")?.payload?.levers?.[0];
      facts[e.id] = { overall: Math.round(res.overall), lever: lever ? Math.round(lever.whatif.facts[`whatif.${lever.lever_id}.overall`]) : null };
    }
  }
  for (const id of Object.keys(facts)) {
    const higher = comparable(entries, scores, id).filter((x) => x.overall > scores[id].overall);
    facts[id].higher = higher[0] ? { score: Math.round(higher[0].overall), en: EN[`p.case.${higher[0].id}.short`], de: DE[`p.case.${higher[0].id}.short`] } : null;
  }
  const CASE_ID = { "BundID": "bundid", "FIT-Connect": "fit-connect", "Overview: BundID": "bundid", "Overview: FIT-Connect": "fit-connect" };
  // What a row's answers must name beyond its own column: the engine's figures.
  const engineKeys = (r) => {
    const f = facts[CASE_ID[r.kase]];
    const lang = r.lang.toLowerCase();
    if (!f) return [];
    if (r.q === "q2") return [String(f.overall)];
    if (r.q === "q5") return [String(f.lever)];
    if (r.q === "q6") return f.higher ? [f.higher[lang], String(f.higher.score)] : [];
    return [];
  };
  const rowProblems = (r) => {
    const out = [];
    if (!r.expected || !r.given) out.push("an empty answer");
    const keys = [...(r.must || "").split(";").map((k) => k.trim()).filter(Boolean), ...engineKeys(r)];
    if (!keys.length) out.push("nothing it must name");
    for (const k of keys) {
      if (!norm(r.expected).includes(norm(k))) out.push(`the expected answer lacks "${k}"`);
      if (!norm(r.given).includes(norm(k))) out.push(`the given answer lacks "${k}"`);
    }
    if (norm(r.match) !== "yes") out.push(`match is "${r.match}"`);
    return out;
  };
  // A planted fault: a given answer without its figure fails.
  {
    const probe = rows.find((r) => r.q === "q2" && r.kase === "BundID" && r.lang === "EN");
    if (probe && !rowProblems({ ...probe, given: probe.given.replaceAll(String(facts.bundid?.overall), "") }).length) fail(C, "self-test: a given answer without the engine's score passed");
  }
  const want = [];
  const qs = askedQs.length ? askedQs : ["all"];
  for (const q of qs) {
    const ids = q === "all" ? ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q6-overview"] : [q];
    for (const id of ids) {
      const [qq, overview] = [id.replace("-overview", ""), id.endsWith("-overview")];
      for (const kase of overview ? ["Overview: BundID", "Overview: FIT-Connect"] : ["BundID", "FIT-Connect"]) for (const lang of ["EN", "DE"]) want.push({ asked: q, q: qq, kase, lang });
    }
  }
  const bad = new Map(qs.map((q) => [q, []]));
  for (const w of want) {
    const r = rows.find((x) => x.q === w.q && x.kase === w.kase && x.lang === w.lang);
    if (!r) { bad.get(w.asked).push(`REVIEW.md has no cold-read row for ${w.q}, ${w.kase}, ${w.lang}`); continue; }
    for (const p of rowProblems(r)) bad.get(w.asked).push(`${w.q}, ${w.kase}, ${w.lang}: ${p}`);
  }
  if (/\bVictor\b|Pflüger|Pflueger/.test(review)) bad.get(qs[0]).push("REVIEW.md names a person");
  for (const [q, list] of bad) for (const p of list) fail(C, p);
  counts.push(`${want.length} cold-read answers checked against ${rows.length} rows`);
  problems.set(`${C}:qs`, qs);
  problems.set(`${C}:bad`, bad);
}

for (const c of counts) console.log(`      ${c}`);
let failed = 0;
for (const c of CASES) {
  if (!runs(c)) continue;
  const list = problems.get(c);
  for (const p of list) console.log(`FAIL  ${c}: ${p}`);
  failed += list.length;
  if (c === "cold-read") { for (const q of problems.get(`${c}:qs`)) if (!problems.get(`${c}:bad`).get(q).length && !list.some((p) => p.startsWith("self-test"))) console.log(`DOCS OK cold-read ${q}`); }
  else if (!list.length) console.log(`DOCS OK ${c}`);
}
console.log(`${failed} problem${failed === 1 ? "" : "s"}.`);
if (!failed && !askedCases.length && !askedQs.length) console.log("DOCS OK");
process.exit(failed ? 1 : 0);
