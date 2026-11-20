// Both languages, statically (brief §5; AC-04): en.js and de.js have the same keys, no empty value and
// the same placeholders; every key the app asks for exists, and every key is used; index.html's static
// English defaults are exactly the English texts of the keys they name; and no user-visible sentence is
// typed into the app's code instead of the dictionaries. The end-to-end half (first visit, ?lang=, the
// switch without a reload) is in tests/smoke.mjs.
// Usage: node tests/i18n.mjs
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY } from "./lib/harness.mjs";
import { stringLiterals, looksLikeProse } from "./lib/strings.mjs";

const mod = (p) => import(pathToFileURL(path.join(APP_ROOT, p)).href);
const EN = (await mod("js/i18n/en.js")).default;
const DE = (await mod("js/i18n/de.js")).default;
const { RUN_STATES } = await mod("js/events.js");
const { MODELS } = await mod("js/config.js");
const { LAYERS } = await mod("js/engine.js");
const { CLASSES } = await mod("js/classes.js");
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
const same = en.filter((k) => EN[k] === DE[k] && !/^(app\.title|app\.name)$/.test(k) && /\p{L}{4,}/u.test(EN[k]) && !/^[\p{Lu}\s-]+$/u.test(EN[k]) && !/^\{/.test(EN[k]));
// A text that reads the same in both languages is fine for names and codes; anything longer than a
// word is probably untranslated. Words that are the same in German stay allowed by this list.
const SAME_ALLOWED = new Set(["mode.simulation", "diag.col.status", "diag.col.details", "dialog.key.workspaces", "dialog.key.apiKeys",
  // Names and words that German uses as they are: a layer's short name, a country, the run's title line.
  "layer.devsecops.short", "class.CN", "field.hosting", "blocks.col.hosting", "map.col.status", "map.col.name", "review.partyName",
  "console.run.sim", "outbox.kind.memo", "audit.tokens",
  // Version 0.3.0: words German uses as they are.
  "centre.portfolio", "portfolio.title", "export.title"]);
const untranslated = same.filter((k) => !SAME_ALLOWED.has(k));
check(!untranslated.length, "every text is translated (the same in both only for names and codes)", untranslated.map((k) => `${k}: "${EN[k]}"`).join("; "));

// ---- the files the app's words come from --------------------------------------------------------------
// The shared shell's files that stay unchanged (tests/parity.mjs, IDENTICAL) are the sister apps' and
// keep their own words where the app does not show them (js/api_messages.js translates the client's
// errors); every other script under js/ is this app's own and takes its words from the dictionaries.
const parity = read("tests/parity.mjs");
const unchanged = new Set([...(/const IDENTICAL = \[([\s\S]*?)\];/.exec(parity)?.[1] || "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));
check(unchanged.size >= 9 && unchanged.has("js/anthropic.js"), `the shared files that stay unchanged are read from tests/parity.mjs (${unchanged.size})`);
const jsFiles = (dir) => fs.readdirSync(path.join(APP_ROOT, dir), { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? jsFiles(path.join(dir, d.name)) : d.name.endsWith(".js") ? [path.join(dir, d.name).split(path.sep).join("/")] : []));
const appFiles = jsFiles("js").filter((f) => !/^js\/i18n\/(en|de)\.js$/.test(f) && !unchanged.has(f));
check(appFiles.length >= 25, `the app's own scripts: ${appFiles.length} files under js/`);

// ---- every key the app asks for exists, and every key is used ---------------------------------------------
const PREFIXES = new Set(en.map((k) => k.split(".")[0]));
const KEYLIKE = /^[a-z][A-Za-z]*(\.[A-Za-z0-9_]+)+$/;
const used = new Set();
const unknown = [];
const sources = [...appFiles, "index.html"];
for (const f of appFiles) {
  for (const lit of stringLiterals(read(f))) {
    if (!KEYLIKE.test(lit.value) || !PREFIXES.has(lit.value.split(".")[0])) continue;
    // File names ("data/golden.js") and host names ("api.anthropic.com") are not keys.
    if (/\.(js|json|html|css|mjs|com|de|org|eu|io|net)$/.test(lit.value)) continue;
    // A key, or the stem of a family the code completes: a plural (tn: stem.one, stem.other) or a
    // group ("intro.value.score" + ".title", ".text").
    const family = en.filter((k) => k.startsWith(`${lit.value}.`));
    if (Object.hasOwn(EN, lit.value)) used.add(lit.value);
    else if (family.length) for (const k of family) used.add(k);
    else unknown.push(`${f}:${lit.line} "${lit.value}"`);
  }
}
const html = read("index.html");
for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) used.add(m[1]);
for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) for (const pair of m[1].split(";")) used.add(pair.split(":")[1].trim());
// Keys the code builds from a family name and a value: each family with every value it can take.
const tabs = ["blocks", "review", "levers", "outbox", "audit"];
const FAMILIES = {
  "state.": RUN_STATES,
  "rail.state.": ["todo", "active", "done", "stopped", "skipped"],
  "diag.status.": ["pass", "fail", "warn", "skip", "running", "idle"],
  "drawer.tab.": tabs,
  "drawer.empty.": tabs,
  "drawer.emptyTitle.": tabs,
  "catalogue.cat.": ["base_service", "platform_or_access", "self_assessment"],
  "intro.step.": ["understand", "research", "score", "review", "recommend"],
  "diag.method.": ["s1", "s2", "s3", "s4", "audit", "decisions"],
  "diag.lang.": ["parity", "empty", "placeholders", "unknown"],
  // Version 0.2.0: the agent, the sovereignty map and the panels.
  "layer.": [...LAYERS, ...LAYERS.map((l) => `${l}.short`), ...LAYERS.map((l) => `${l}.full`)],
  "class.": [...CLASSES, ...CLASSES.map((c) => `${c}.short`)],
  "value.criticality.": ["critical", "important", "supporting"],
  "value.hosting.": ["EU", "NON_EU", "UNKNOWN"],
  "value.licence.": ["open_source", "proprietary", "unknown"],
  "value.exit.": ["easy", "possible", "hard", "unknown"],
  "field.": ["criticality", "tech", "tech.parent", "operator", "operator.parent", "hosting", "licence", "exit"],
  "topic.": ["app_distribution", "push_messaging", "mobile_os", "browsers", "federal_it"],
  "lang.tag.": ["en", "de"],
  "lang.name.": ["en", "de"],
  "ai.kind.": ["narration", "profile", "block", "review", "levers", "memo", "report"].flatMap((k) => [k, `${k}.text`]),
  "console.end.": ["done", "not_a_service", "stopped", "aborted", "error"],
  "map.status.": ["scored", "open", "no_evidence", "not_applicable", "not_assessed", "no_origin"],
  "tool.rec_layer.": ["no_evidence", "not_applicable"],
  "tool.ui_request_review.": ["confirm", "skip"],
  "outbox.kind.": ["memo", "report"],
  "blocks.ev.verified.": ["fetched_text", "citation", "ref_facts", "recording", "catalogue"],
  "review.": ["tech", "operator", "tech.name", "tech.country", "operator.name", "operator.country"],
  "badge.": ["live", "simulation"],
  // Version 0.3.0: the centre's views, the Portfolio, the exports and the method view.
  "centre.": ["assessment", "compare", "portfolio"].flatMap((v) => [v, `${v}.title`]),
  "portfolio.cat.short.": ["base_service", "platform_or_access", "self_assessment"],
  "export.": ["reportMd", "reportHtml", "assessment", "audit"],
  "method.look.": LAYERS,
  "method.source.": ["layers", "seal", "criteria"],
  "method.seal.": ["0", "1", "2", "3", "4"]
};
const families = [];
for (const [prefix, values] of Object.entries(FAMILIES)) {
  // The family must still be built in the code (a template or a concatenation with this prefix).
  const built = sources.some((f) => read(f).includes(prefix.replace(/\.$/, "")));
  if (!built) families.push(`${prefix}* is no longer built anywhere`);
  for (const v of values) {
    used.add(prefix + v);
    if (!Object.hasOwn(EN, prefix + v)) unknown.push(`family ${prefix}${v}`);
  }
}
for (const m of MODELS) {
  used.add(m.hintKey);
  if (!Object.hasOwn(EN, m.hintKey)) unknown.push(`js/config.js MODELS ${m.hintKey}`);
}
check(!unknown.length && !families.length, `every key the app asks for exists (${used.size} keys asked for)`, [...unknown, ...families].join("; "));
const unused = en.filter((k) => !used.has(k));
check(!unused.length, "every key in the dictionaries is used", unused.join(", "));

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
check(!staticWrong.length && staticCount >= 15, `index.html's ${staticCount} static defaults are the English texts of their keys`, staticWrong.join("; "));

// ---- no user-visible sentence typed into the code ---------------------------------------------------------
// Literals that read like prose but are not shown as text, each with its reason.
const ALLOWED = [
  ["js/drawer.js", "Victor Pflüger", "a person's name in Vici's byline, the same in every language"],
  ["js/main.js", "Script error.", "the browser's own text for an error in a script from another site, compared, never shown"],
  ["js/config.js", "Sovereignty Assessment", "the product's name for the developer console and file names; the interface shows app.name"],
  ["js/agent.js", "Continue from where you stopped.", "the agent loop's message to the model after a cut-off response, never shown as interface text"]
];
// Files whose prose is addressed to the model, not the person: the system prompt, the tool definitions and
// the tools' messages to the agent, and the sequence rules' refusals (tool results are English, like the
// system prompt; the console shows them only as raw JSON behind Details). And the pre-run checks, whose
// messages are tools/check-runs.mjs's output for the developer.
const MODEL_FACING = ["js/prompt.js", "js/tools.js", "js/guards.js", "js/runs_check.js"];
// Lines that only the developer sees: the browser console, and errors the engine throws at its callers.
const DEV_ONLY = /\bconsole\.(log|info|warn|error|debug)\(/;
function strays(file, src) {
  const found = [];
  if (MODEL_FACING.includes(file)) return found;
  for (const lit of stringLiterals(src)) {
    if (!looksLikeProse(lit.value)) continue;
    if (DEV_ONLY.test(lit.text)) continue;
    if (ALLOWED.some(([f, v]) => f === file && v === lit.value)) continue;
    found.push(`${file}:${lit.line} ${JSON.stringify(lit.value.slice(0, 70))}`);
  }
  return found;
}
// The positive control: a view with two typed sentences and the technical strings around them.
const PLANTED = `import { h } from "./dom.js";
const regex = /["'][a-z]+["']/g; // a regular expression with quotes is not a string
export function view() {
  return h("div", { class: "vc-card vc-card--flat", "aria-label": "Choose a service first" },
    h("p", {}, "Every step of the agent appears here."),
    h("span", { class: "label" }, t("console.title")), \`run-\${Date.now()}\`);
}`;
const caught = strays("planted.js", PLANTED);
check(caught.length === 2 && caught.some((c) => c.includes("Choose a service first")) && caught.some((c) => c.includes("Every step of the agent")),
  `the stray-string check catches typed sentences (positive control: ${caught.length} of 2 caught)`, caught.join("; "));
const allStrays = appFiles.flatMap((f) => strays(f, read(f)));
check(!allStrays.length, `no user-visible sentence typed into the app's ${appFiles.length} scripts`, allStrays.join("; "));
const allowedStill = ALLOWED.filter(([f, v]) => stringLiterals(read(f)).some((l) => l.value === v));
check(allowedStill.length === ALLOWED.length, `each allowed literal still exists, so the list stays short (${allowedStill.length} of ${ALLOWED.length})`);

// ---- report -------------------------------------------------------------------------------------------
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.what}${!r.ok && r.detail ? `\n      ${r.detail}` : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} language checks passed.`);
if (!failed && ONLY.length === 0) console.log("I18N OK");
process.exit(failed ? 1 : 0);
