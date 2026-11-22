// Both languages, statically: en.js and de.js have the same keys, no empty value and the same
// placeholders; every key the page asks for exists, and every key is asked for; index.html's English
// defaults are exactly the English texts of the keys they name; no sentence a person sees is typed into
// the page's own scripts instead of the dictionaries; and exclusive non-EU control has one name, its
// tile's, in every pre-run's texts. The switch in the browser is in tests/showcase.mjs (lang).
// Usage: node tests/i18n.mjs
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY } from "./lib/harness.mjs";
import { stringLiterals, looksLikeProse } from "./lib/strings.mjs";

const mod = (p) => import(pathToFileURL(path.join(APP_ROOT, p)).href);
const EN = (await mod("js/i18n/en.js")).default;
const DE = (await mod("js/i18n/de.js")).default;
const { LAYERS } = await mod("js/engine.js");
const { CLASSES } = await mod("js/classes.js");
const { STEP_IDS } = await mod("js/run.js");
const read = (f) => fs.readFileSync(path.join(APP_ROOT, f), "utf8");

const results = [];
const check = (ok, what, detail = "") => results.push({ ok, what, detail });

// ---- the two dictionaries ---------------------------------------------------------------------------
const en = Object.keys(EN);
const de = Object.keys(DE);
const onlyEn = en.filter((k) => !Object.hasOwn(DE, k));
const onlyDe = de.filter((k) => !Object.hasOwn(EN, k));
check(!onlyEn.length && !onlyDe.length, `en.js and de.js have the same ${en.length} keys`, [...onlyEn.map((k) => `only in en: ${k}`), ...onlyDe.map((k) => `only in de: ${k}`)].join("; "));
const empty = [...en.filter((k) => typeof EN[k] !== "string" || !EN[k].trim()).map((k) => `en ${k}`), ...de.filter((k) => typeof DE[k] !== "string" || !DE[k].trim()).map((k) => `de ${k}`)];
check(!empty.length, "no empty value in either language", empty.join(", "));
const placeholders = (s) => [...String(s).matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).sort().join(",");
const uneven = en.filter((k) => Object.hasOwn(DE, k) && placeholders(EN[k]) !== placeholders(DE[k]));
check(!uneven.length, "the same placeholders in both languages", uneven.map((k) => `${k}: {${placeholders(EN[k])}} vs {${placeholders(DE[k])}}`).join("; "));
// A text that reads the same in both languages is fine for names and codes; anything longer than a
// word is probably untranslated. These keys are the same in German on purpose.
const SAME_ALLOWED = new Set([
  "p.class.CN",                                  // China is China
  "p.case.bundid", "p.case.bundid.short",        // service names stay as they are
  "p.case.online-ausweis.short", "p.case.eudi-wallet.short", "p.case.fit-connect", "p.case.fit-connect.short",
  "p.case.epaybl.short", "p.case.kipitz.short", "p.case.opencode.short", "p.case.opencode", "p.case.dvc.short",
  "p.case.bundesportal.short", "p.case.deutschland-app.short", "p.case.noots.short", "p.case.zbds.short",
  "p.case.zapuk.short", "p.case.marktplatz-deutschland-digital.short", "p.case.muk.short",
  "p.case.marktplatz-deutschland-digital",
  "p.agent", "p.agent.live",                     // "Agent" and "live, Claude …" read the same in German
  "p.byline.tip", "p.play.pause", "p.start.sim"  // "Website", "Pause", "Simulation"
]);
const same = en.filter((k) => EN[k] === DE[k] && /\p{L}{4,}/u.test(EN[k]) && !/^[\p{Lu}\s-]+$/u.test(EN[k]) && !/^\{/.test(EN[k]));
const untranslated = same.filter((k) => !SAME_ALLOWED.has(k));
check(!untranslated.length, "every text is translated (the same in both only for names and codes)", untranslated.map((k) => `${k}: "${EN[k]}"`).join("; "));

// One term per figure: a pre-run text that cites exclusive non-EU control names it as the tile does.
const html = read("index.html");
const tileName = (attr) => (new RegExp(`id="kpi-exclusive"[^>]*\\b${attr}="([^"]+)"`).exec(html) || [])[1];
const TERM = { en: tileName("data-vc-kpi"), de: tileName("data-vc-kpi-de") };
check(!!TERM.en && !!TERM.de, `the tile names the figure in both languages ("${TERM.en}", "${TERM.de}")`);
const { readRunFile, runIds } = await mod("tools/check-runs.mjs");
const preRunWrong = [];
for (const id of runIds()) {
  const def = readRunFile(path.join(APP_ROOT, "data/runs", `${id}.js`));
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== "object") return;
    const keys = Object.keys(v);
    if (keys.length === 2 && typeof v.en === "string" && typeof v.de === "string") {
      for (const lang of ["en", "de"]) {
        const term = String(TERM[lang]).toLowerCase();
        for (const clause of v[lang].split(/[.;!?](?:\s|$)/)) if (/exclusive_non_eu\}\}/.test(clause) && !clause.toLowerCase().includes(term)) preRunWrong.push(`${id} (${lang}): "${clause.trim().slice(0, 90)}"`);
      }
      return;
    }
    Object.values(v).forEach(walk);
  };
  walk(def.steps);
}
check(!preRunWrong.length, "every pre-run text that cites exclusive non-EU control names it as the tile does", preRunWrong.join("; "));

// ---- every key the page asks for exists, and every key is asked for ---------------------------------------
// The page's scripts: everything js/main.js and js/lang.js load, the case modules included.
const reach = new Set();
const queue = ["js/main.js", "js/lang.js"];
while (queue.length) {
  const f = queue.shift();
  if (reach.has(f) || !fs.existsSync(path.join(APP_ROOT, f))) continue;
  reach.add(f);
  for (const m of read(f).matchAll(/(?:import|export)\s[^"']*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)) {
    const r = m[1] || m[2];
    if (r.startsWith(".")) queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(f), r)));
  }
}
const scripts = [...reach].filter((f) => !/^js\/i18n\/(en|de)\.js$/.test(f)).sort();
check(scripts.length >= 25 && reach.has("js/app.js") && reach.has("js/agent.js"), `the page loads ${scripts.length} scripts besides the dictionaries, from js/main.js on`);

const PREFIXES = new Set(en.map((k) => k.split(".")[0]));
const KEYLIKE = /^[a-z][A-Za-z]*(\.[A-Za-z0-9_-]+)+$/;
const used = new Set();
const unknown = [];
for (const f of scripts) {
  for (const lit of stringLiterals(read(f))) {
    if (!KEYLIKE.test(lit.value) || !PREFIXES.has(lit.value.split(".")[0])) continue;
    if (/\.(js|json|html|css|mjs|com|de|org|eu|io|net)$/.test(lit.value)) continue;
    // A key, or the stem of a family the code completes (a plural: stem.one, stem.other).
    const family = en.filter((k) => k.startsWith(`${lit.value}.`));
    if (Object.hasOwn(EN, lit.value)) used.add(lit.value);
    else if (family.length) for (const k of family) used.add(k);
    else unknown.push(`${f}:${lit.line} "${lit.value}"`);
  }
}
// A key inside a template's ${…} is not a literal of its own to the tokenizer: t("key", …) calls count too.
for (const f of scripts) {
  for (const m of read(f).matchAll(/\bt\(\s*"([a-z][A-Za-z0-9_.-]+)"/g)) {
    if (!PREFIXES.has(m[1].split(".")[0])) continue;
    if (Object.hasOwn(EN, m[1])) used.add(m[1]);
    else if (!en.some((k) => k.startsWith(`${m[1]}.`))) unknown.push(`${f} t("${m[1]}")`);
  }
}
for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) used.add(m[1]);
for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) for (const pair of m[1].split(";")) used.add(pair.split(":")[1].trim());
// Keys the code builds from a family and a value, with every value the family can take.
const catalogue = (() => {
  const sandbox = {};
  new Function("window", read("data/catalogue.js"))(sandbox);
  const c = sandbox.SA_CATALOGUE;
  return (Array.isArray(c) ? c : c.entries).map((e) => e.id);
})();
const FAMILIES = {
  "p.step.": STEP_IDS,
  "p.layer.": [...LAYERS, "open", "no_evidence", "not_applicable"],
  "p.class.": [...CLASSES, "UNKNOWN"],
  "p.crit.": ["critical", "important", "supporting"],
  "p.legend.": ["0", "1", "2", "3", "4", "gap"],
  "p.stage.": ["service", "choice", "layers", "levels", "review", "levers", "memo"],
  "p.memo.": ["pending", "approved", "rejected"],
  "p.play.": ["play", "pause", "replay"],
  "p.live.end.": ["stopped", "aborted", "error"],
  "p.case.": catalogue.flatMap((id) => [id, `${id}.short`, `${id}.tip`])
};
const families = [];
for (const [prefix, values] of Object.entries(FAMILIES)) {
  const built = scripts.some((f) => read(f).includes(`\`${prefix}\${`));
  if (!built) families.push(`${prefix}* is no longer built anywhere`);
  for (const v of values) {
    used.add(prefix + v);
    if (!Object.hasOwn(EN, prefix + v)) unknown.push(`family ${prefix}${v}`);
  }
}
check(!unknown.length && !families.length, `every key the page asks for exists (${used.size} keys asked for)`, [...unknown, ...families].join("; "));
const unused = en.filter((k) => !used.has(k));
check(!unused.length, "every key in the dictionaries is asked for", unused.join(", "));

// ---- index.html: the static defaults are the English texts -----------------------------------------
const staticWrong = [];
for (const m of html.matchAll(/<([a-z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>([^<]*)</g)) {
  const [, , key, text] = m;
  if (text !== EN[key]) staticWrong.push(`${key}: "${text}" ≠ "${EN[key]}"`);
}
for (const m of html.matchAll(/<[a-z0-9]+\b([^>]*)\bdata-i18n-attr="([^"]+)"([^>]*)>/g)) {
  const attrs = m[1] + m[3];
  for (const pair of m[2].split(";")) {
    const [attr, key] = pair.split(":").map((s) => s.trim());
    const value = (new RegExp(`\\b${attr}="([^"]*)"`).exec(attrs) || [])[1];
    if (value !== EN[key]) staticWrong.push(`${attr} of ${key}: "${value}" ≠ "${EN[key]}"`);
  }
}
const title = (/<title>([^<]*)<\/title>/.exec(html) || [])[1];
if (title !== EN["app.title"]) staticWrong.push(`<title> "${title}" ≠ "${EN["app.title"]}"`);
const staticCount = (html.match(/data-i18n="/g) || []).length + (html.match(/data-i18n-attr="/g) || []).length;
check(!staticWrong.length && staticCount >= 10, `index.html's ${staticCount} static defaults are the English texts of their keys`, staticWrong.join("; "));

// ---- no sentence a person sees typed into the page's own scripts ----------------------------------------
// The page's own scripts are the ones 2.0.0 wrote; the case modules (the agent, its prompt and tools,
// the engine, the audit) keep their words where the person never sees them as text.
const OWN = ["js/app.js", "js/story.js", "js/view.js", "js/run.js", "js/estimate.js", "js/main.js", "js/lang.js", "js/drafts.js", "js/format.js"];
const ALLOWED = [
  ["js/main.js", "Script error.", "the browser's own text for an error in a script from another site, compared, never shown"],
  ["js/estimate.js", "The report is published.", "the last tool result the model reads in a live run, counted for the estimate, never shown"]
];
const DEV_ONLY = /\bconsole\.(log|info|warn|error|debug)\(/;
function strays(file, src) {
  const found = [];
  for (const lit of stringLiterals(src)) {
    if (!looksLikeProse(lit.value)) continue;
    if (DEV_ONLY.test(lit.text)) continue;
    if (ALLOWED.some(([f, v]) => f === file && v === lit.value)) continue;
    found.push(`${file}:${lit.line} ${JSON.stringify(lit.value.slice(0, 70))}`);
  }
  return found;
}
// The positive control: a view with two typed sentences and the technical strings around them.
const PLANTED = `import { h } from "./view.js";
const regex = /["'][a-z]+["']/g; // a regular expression with quotes is not a string
export function view() {
  return h("div", { class: "vc-card vc-card--flat", "aria-label": "Choose a service first" },
    h("p", {}, "Every step of the agent appears here."),
    h("span", { class: "label" }, t("p.strip")), \`run-\${Date.now()}\`);
}`;
const caught = strays("planted.js", PLANTED);
check(caught.length === 2 && caught.some((c) => c.includes("Choose a service first")) && caught.some((c) => c.includes("Every step of the agent")),
  `the stray-string check catches typed sentences (positive control: ${caught.length} of 2 caught)`, caught.join("; "));
const allStrays = OWN.flatMap((f) => strays(f, read(f)));
check(!allStrays.length, `no sentence typed into the page's ${OWN.length} own scripts`, allStrays.join("; "));
const allowedStill = ALLOWED.filter(([f, v]) => stringLiterals(read(f)).some((l) => l.value === v));
check(allowedStill.length === ALLOWED.length, `each allowed literal still exists, so the list stays short (${allowedStill.length} of ${ALLOWED.length})`);

// ---- report -------------------------------------------------------------------------------------------
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.what}${!r.ok && r.detail ? `\n      ${r.detail}` : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} language checks passed.`);
if (!failed && ONLY.length === 0) console.log("I18N OK");
process.exit(failed ? 1 : 0);
