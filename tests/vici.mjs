// Vici's own rules, checked with Vici's own functions (Build a prototype, "Check it"): the How it works
// guides and their key figures (guideProblems), the byline (bylineProblems), the Writing guideline's
// checkable patterns (writingProblems) and the AI notice of a page that can start a live run
// (aiNoticeProblems). They run on the page as served, on the page as rendered in English and in German,
// on every text the presenter writes for the seventeen cases along every decision path in both
// languages, on the dictionaries and on the docs. ViciDesign's check-guide-render.mjs drives the guide
// over http. vici/ holds Vici's files byte for byte, at the commit vici/README.md and the workflow name.
//
// Each imported check first fails on a planted control. Prints VICI CONTROLS OK, VICI STANDARDS OK and
// VICI OK. The functions come from a ViciDesign checkout (VICI_DIR, or ../ViciDesign); without one the
// suite says so and passes, unless --require-vici is given or it runs on GitHub Actions.
// Usage: node tests/vici.mjs [--require-vici]
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_ROOT, REQUIRE_VICI, viciDir, launchBrowser, serveStatic, NETWORK_NOISE } from "./lib/harness.mjs";
import { loadData, playCase, hasLevers } from "./lib/play.mjs";

const dir = viciDir();
if (!dir) {
  console.log(`${REQUIRE_VICI ? "FAIL" : "SKIP"}  no ViciDesign checkout in VICI_DIR or next to this repository (../ViciDesign)`);
  process.exit(REQUIRE_VICI ? 1 : 0);
}
const lib = async (file) => import(pathToFileURL(path.join(dir, "scripts", "lib", file)).href);
const { guideProblems } = await lib("guide.mjs");
const { bylineProblems } = await lib("byline.mjs");
const { writingProblems } = await lib("writing.mjs");
const { aiNoticeProblems, canRunLive, AI_NOTICE } = await lib("ai.mjs");
const mod = (p) => import(pathToFileURL(path.join(APP_ROOT, p)).href);

const read = (f) => readFileSync(path.join(APP_ROOT, f), "utf8");
const html = read("index.html");
const page = (paragraphs, lang = "en-GB") => `<html lang="${lang}"><body>${paragraphs.map((t) => `<p>${String(t).replace(/</g, "&lt;")}</p>`).join("")}</body></html>`;
const controls = [];
const standards = [];
const control = (ok, what) => controls.push([!!ok, what]);
const check = (ok, what) => standards.push([!!ok, what]);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---- the checks can fail ----------------------------------------------------------------------------
control(guideProblems(html.replace(/<dialog\b[^>]*vc-guide[\s\S]*?<\/dialog>/g, "")).length > 0, "control: guideProblems catches a page without its guides");
control(guideProblems(html.replace('<div class="kpis"', '<p class="vc-stat" data-vc-kpi="Blocks checked" data-vc-kpi-de="Geprüfte Bausteine">6</p><div class="kpis"')).some((p) => /Blocks checked|Geprüfte Bausteine/.test(p)), "control: guideProblems catches a key figure no How it works chapter explains");
control(bylineProblems(html.replace(/href="https:\/\/victorpflueger\.github\.io\/VIP\/index\.html"/, 'href="#"')).length > 0, "control: bylineProblems catches a byline without the website link");
control(writingProblems(page(["BundID scores 77 — much more."])).length > 0 && writingProblems(page(["A seamless assessment."])).length > 0, "control: writingProblems catches an em dash and a stock word");
control(aiNoticeProblems(html.split(AI_NOTICE.en).join("An assistant")).length > 0 && !aiNoticeProblems('<meta http-equiv="Content-Security-Policy" content="connect-src \'none\'"><p>Replay</p>').length, "control: aiNoticeProblems catches a live page that never says it is an AI, and leaves a page that cannot run live alone");

// ---- the page as served -------------------------------------------------------------------------------
const g = guideProblems(html);
check(!g.length, `the two guides follow Vici's standard, a row in How it works for each key figure in its language included${g.length ? `: ${g.join("; ")}` : ""}`);
check(/<dialog class="vc-dialog vc-guide" id="guide-en" lang="en-GB"[\s\S]*?<h2[^>]*>How the prototype works<\/h2>/.test(html), "the English guide is titled How the prototype works, in English");
check(/<dialog class="vc-dialog vc-guide" id="guide-de" lang="de"[\s\S]*?<h2[^>]*>So funktioniert der Prototyp<\/h2>/.test(html), "the German guide is titled So funktioniert der Prototyp, in German");
const kpis = [...html.matchAll(/\bdata-vc-kpi="([^"]+)" data-vc-kpi-de="([^"]+)"/g)].map((m) => `${m[1]} / ${m[2]}`);
check(kpis.join("|") === "Overall score / Gesamtwert|Weakest critical link / Schwächstes kritisches Glied|Exclusive non-EU control / Exklusive Nicht-EU-Kontrolle|Session cost / Sitzungskosten", `the header marks four key figures, each in both languages (${kpis.join(", ")})`);
const b = bylineProblems(html);
check(!b.length, `the byline follows Vici's standard${b.length ? `: ${b.join("; ")}` : ""}`);
const w = writingProblems(html);
check(!w.length, `index.html keeps Vici's writing rules${w.length ? `: ${w.join("; ")}` : ""}`);
const a = aiNoticeProblems(html);
check(canRunLive(html) && !a.length, `the page can start a live run and says "${AI_NOTICE.en}"${a.length ? `: ${a.join("; ")}` : ""}`);
check(new RegExp(`id="start" data-vc-live[^>]*>[^<]*</button>\\s*<span class="vc-tag vc-tag--feature[^"]*"[^>]*>[\\s\\S]{0,160}${esc(AI_NOTICE.en)}</span>`).test(html), "the AI notice stands in a lilac tag right beside Start agent");
check(new RegExp(`${esc(AI_NOTICE.en)}[\\s\\S]{0,1600}id="live-start" data-vc-live`).test(html), "the live card says it too, before its key and its start button");
const DE = (await mod("js/i18n/de.js")).default;
check(Object.values(DE).includes(AI_NOTICE.de), `the German page says "${AI_NOTICE.de}"`);
const header = (html.match(/<header class="app-header"[\s\S]*?<\/header>/) || [""])[0];
check(/>SIMULATION</.test(header) && /"LIVE"/.test(read("js/app.js")), "the header says SIMULATION, or LIVE during a live run, in capitals");
const strip = (html.match(/<\/header>(?:\s*<!--[\s\S]*?-->)?\s*<div class="intro"[^>]*>([\s\S]*?)<\/div>\s*(?:<!--[\s\S]*?-->\s*)?<nav/) || [])[1] || "";
check(/<p class="intro-text"[^>]*>[^<]{40,200}<\/p>/.test(strip) && /real sources/.test(strip) && /indicative, not an official assessment/.test(strip) && /class="vc-byline"/.test(strip), "one sentence under the header says what the prototype does, that its sources are real and its scores indicative, beside the byline");
check((html.match(/class="vc-byline"/g) || []).length === 1, "the page carries one byline");

// ---- the page as rendered, in English and in German ---------------------------------------------------
const browser = await launchBrowser();
const server = await serveStatic(APP_ROOT, 8600 + Math.floor(Math.random() * 300));
try {
  for (const lang of ["en", "de"]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort("blockedbyclient"));
    const p = await context.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e.message || e)));
    p.on("console", (m) => { if (m.type() === "error" && !NETWORK_NOISE.test(m.text())) errors.push(m.text()); });
    await p.goto(`${server.base}?guide=0&lang=${lang}`);
    await p.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
    await p.waitForTimeout(400);
    // The page at the person's first turn and at the end: Your review, then Recommend with the memo approved.
    const views = [];
    views.push(await p.content());
    for (const act of ["#turn-primary", "#turn-primary", "#turn-primary"]) {
      await p.evaluate(() => window.sovereignty.go(window.sovereignty.S.view.steps.findLastIndex((st) => st.ready)));
      await p.click(act);
      await p.waitForTimeout(250);
    }
    views.push(await p.content());
    const doc = views.join("\n");
    // The page in one language shows one guide: the other is out of its way (lang.js takes its
    // data-vc-guide-auto and its button), so Vici's guide check sees the page as a one-language page.
    const other = lang === "en" ? "de" : "en";
    const rg = guideProblems(views[0].replace(new RegExp(`<dialog\\b[^>]*\\bid="guide-${other}"[\\s\\S]*?</dialog>`), "").replace(new RegExp(`<button[^>]*data-vc-guide-open="guide-${other}"[\\s\\S]*?</button>`), ""));
    const rb = bylineProblems(views[0]);
    const rw = views.flatMap((v) => writingProblems(v));
    const ra = aiNoticeProblems(views[0]);
    check(!rg.length && !rb.length && !rw.length && !ra.length && !errors.length, `rendered in ${lang === "en" ? "English" : "German"}: the guides, the byline, the writing and the AI notice pass, at the start and at the end of the case${[...rg, ...rb, ...rw, ...ra, ...errors].length ? `: ${[...rg, ...rb, ...rw, ...ra, ...errors].join("; ")}` : ""}`);
    check(new RegExp(`<html[^>]*lang="${lang === "de" ? "de" : "en-GB"}"`).test(views[0]) && doc.includes(lang === "de" ? AI_NOTICE.de : AI_NOTICE.en), `rendered in ${lang === "en" ? "English" : "German"}: the page says its language and carries the AI notice in it`);
    await context.close();
  }
  // ViciDesign's own drive of the guide, over http.
  const r = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(dir, "scripts", "check-guide-render.mjs"), server.base], { cwd: dir, env: process.env });
    let out = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { out += d; });
    const timer = setTimeout(() => child.kill("SIGKILL"), 240000);
    child.on("close", (code) => { clearTimeout(timer); resolve({ code, out }); });
  });
  check(r.code === 0 && /GUIDE BEHAVIOUR OK/.test(r.out), `Vici's check-guide-render.mjs passes against the page over http${r.code === 0 ? "" : `: ${r.out.split("\n").filter((l) => l.trim()).slice(-6).join(" | ")}`}`);
} finally {
  await server.close();
  await browser.close();
}

// ---- every text the presenter writes, for the seventeen cases along every decision path ---------------
const win = loadData();
const { digest } = await mod("js/run.js");
const { story } = await mod("js/story.js");
const entries = win.SA_CATALOGUE.entries;
const said = { en: new Set(), de: new Set() };
const SKIP = new Set(["id", "kind", "status", "layer", "decision", "act", "secondaryAct", "url", "lang", "index"]);
// A source (a quote with its page's title and address) is the page's own words, not the presenter's.
const collect = (set, v) => {
  if (typeof v === "string") { if (/\p{L}/u.test(v)) set.add(v); return; }
  if (Array.isArray(v)) return v.forEach((x) => collect(set, x));
  if (v && typeof v === "object" && typeof v.quote === "string" && typeof v.url === "string") return;
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) collect(set, x);
};
const FORBIDDEN = [[/(?<![\p{L}\p{N}-])B-\d{2}(?![\p{L}\p{N}])/u, "a block id"], [/(?<![\p{L}\p{N}])L[1-3](?![\p{L}\p{N}])/u, "a lever id"], [/\{\{|\}\}/, "an unfilled figure"], [/\{[a-z]+\}/i, "an unfilled placeholder"], [/\b(undefined|NaN|null)\b/, "a value that is no text"]];
let paths = 0;
for (const def of Object.values(win.SA_RUNS)) {
  const entry = entries.find((e) => e.id === def.entry_id) || null;
  const plans = hasLevers(def) ? [{ choice: "keep" }, { choice: "L1" }, { choice: "L1", memo: "rejected" }] : [{ choice: "keep" }];
  for (const lang of ["en", "de"]) {
    for (const plan of plans) {
      const r = await playCase(def, lang, plan);
      paths += 1;
      // Every stage of the run: at the review, at the levers, at the memo and at the end.
      const cuts = ["review_request", "levers", "action_draft"].map((type) => r.events.findIndex((e) => e.type === type) + 1).filter((i) => i > 0);
      for (const n of [...cuts, r.events.length]) {
        for (const mode of ["simulation", "live"]) {
          const v = story({ run: digest(r.events.slice(0, n)), lang, mode, entry });
          collect(said[lang], v.steps.map(({ label, title, lead, agent, turn, stage }) => ({ label, title, lead, agent, turn, stage })));
          collect(said[lang], [v.kpis, v.log.map((l) => `${l.who} ${l.what}`)]);
        }
      }
    }
  }
}
for (const lang of ["en", "de"]) {
  const sentences = [...said[lang]];
  const written = writingProblems(page(sentences, lang === "de" ? "de" : "en-GB"));
  check(sentences.length > 300 && !written.length, `${lang === "en" ? "English" : "German"}: the ${sentences.length} texts the presenter writes on ${paths / 2} paths through the seventeen cases keep the writing rules${written.length ? `: ${written.join("; ")}` : ""}`);
  for (const [re, what] of FORBIDDEN) {
    const hit = sentences.find((x) => re.test(x));
    check(!hit, `${lang === "en" ? "English" : "German"}: no text on any path shows ${what}${hit ? `: "${hit.slice(0, 120)}"` : ""}`);
  }
}
// Every text in the dictionaries the presenter uses.
const EN = (await mod("js/i18n/en.js")).default;
for (const [lang, D] of [["en", EN], ["de", DE]]) {
  const texts = Object.entries(D).filter(([k]) => k.startsWith("p.")).map(([, v]) => v);
  const p = writingProblems(page(texts, lang === "de" ? "de" : "en-GB"));
  check(texts.length > 200 && !p.length, `${lang === "en" ? "English" : "German"}: the ${texts.length} texts of the presenter's dictionary keep the writing rules${p.length ? `: ${p.join("; ")}` : ""}`);
}

// ---- the docs, as text --------------------------------------------------------------------------------
for (const doc of ["README.md", "DEMO_SCRIPT.md", "DESIGN.md", "DATA_SOURCES.md", "tests/README.md", "vici/README.md"]) {
  const there = existsSync(path.join(APP_ROOT, doc));
  const p = there ? writingProblems(page([read(doc).replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "")])) : ["missing"];
  check(!p.length, `${doc} keeps the writing rules${p.length ? `: ${p.join("; ")}` : ""}`);
}

// ---- vici/: Vici's files, unchanged, at the commit the README and the workflow name -------------------
const pin = (read("vici/README.md").match(/commit \*\*`([0-9a-f]{7,40})`\*\*/) || [])[1];
const ref = (read(".github/workflows/tests.yml").match(/repository: VictorPflueger\/ViciDesign\s+ref: ([0-9a-f]{7,40})/) || [])[1];
check(pin && ref && ref.startsWith(pin), `vici/README.md and the workflow name the same ViciDesign commit (${pin} and ${ref})`);
let head = null;
try { head = execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { /* not a git checkout */ }
check(!head || !pin || head.startsWith(pin), `the ViciDesign checkout is at that commit (${head ? head.slice(0, 7) : "not a git checkout"})`);
const files = [];
const walk = (d) => { for (const f of readdirSync(path.join(APP_ROOT, d))) { const p = `${d}/${f}`; if (statSync(path.join(APP_ROOT, p)).isDirectory()) walk(p); else files.push(p); } };
walk("vici");
const ours = files.filter((f) => f !== "vici/README.md");
const differ = ours.filter((f) => { const there = path.join(dir, f.slice("vici/".length)); return !existsSync(there) || !readFileSync(there).equals(readFileSync(path.join(APP_ROOT, f))); });
check(ours.length >= 18 && !differ.length, `the ${ours.length} files in vici/ equal ViciDesign's byte for byte${differ.length ? `: ${differ.join(", ")} differ` : ""}`);
const listed = [...read("vici/README.md").matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1]);
const unlisted = ours.filter((f) => !listed.some((l) => (l.includes("*") ? new RegExp(`^${l.replace(/[.]/g, "\\.").replace(/\*/g, "[^/]*")}$`).test(f.slice(5)) : f.slice(5) === l)));
check(!unlisted.length, `vici/README.md lists every file it holds${unlisted.length ? `: ${unlisted.join(", ")} missing` : ""}`);

let failed = 0;
const report = (results, token) => {
  const f = results.filter(([ok]) => !ok).length;
  for (const [ok, what] of results) console.log(`${ok ? "PASS" : "FAIL"}  ${what}`);
  failed += f;
  return f ? null : token;
};
const tokens = [report(controls, "VICI CONTROLS OK"), report(standards, "VICI STANDARDS OK")].filter(Boolean);
console.log(`(Vici's checks from ${dir})`);
if (failed) { console.log(`\n${failed} checks failed.`); process.exit(1); }
console.log(`\nAll ${controls.length + standards.length} checks passed.\n${tokens.join("\n")}\nVICI OK`);
