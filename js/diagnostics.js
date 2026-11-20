// Self-tests from the presenter's browser: the one outside service (the Anthropic API; web search and
// web fetch run on Anthropic's servers, so there is nothing else to reach), the method on the brief's
// golden cases, both languages, the key and privacy rules with the page's security policy, and the
// bundled data against its schemas. Every result names an i18n key, so the dialog shows it in the
// active language and re-renders it after a switch.

import { APP, CSP, MODELS, STORAGE, THEME_KEY } from "./config.js";
import { checkKey, probeEndpoint } from "./anthropic.js";
import { getKey, redactSecrets } from "./keystore.js";
import { apiMessage } from "./api_messages.js";
import { dictionary, missingKeys } from "./i18n/index.js";
import { goldenChecks } from "./selftest.js";
import { validate } from "./schema.js";
import { catalogueEntries } from "./catalogue.js";

export const TESTS = [
  { id: "anthropic", labelKey: "diag.test.anthropic", host: "api.anthropic.com", purposeKey: "diag.purpose.anthropic" },
  { id: "method", labelKey: "diag.test.method", host: null, purposeKey: "diag.purpose.method" },
  { id: "languages", labelKey: "diag.test.languages", host: null, purposeKey: "diag.purpose.languages" },
  { id: "privacy", labelKey: "diag.test.privacy", host: null, purposeKey: "diag.purpose.privacy" },
  { id: "data", labelKey: "diag.test.data", host: null, purposeKey: "diag.purpose.data" }
];

/** The tests that need no network and run as soon as the dialog opens. */
export const LOCAL_TESTS = TESTS.filter((x) => !x.host).map((x) => x.id);

const KEY_LIKE = /sk-ant-(?!\[REDACTED\])[A-Za-z0-9_-]{8,}/;
const detail = (key, vars = null) => ({ key, vars });

// ---- the API result of this session ---------------------------------------------------------------

/** The last API result in this tab (sessionStorage "sa.diag"), for "earlier this session". */
export function memory() {
  try {
    const j = JSON.parse(sessionStorage.getItem(STORAGE.diagnostics) || "null");
    return j && typeof j === "object" ? j : {};
  } catch {
    return {};
  }
}

function remember(id, r) {
  try {
    const all = memory();
    all[id] = { status: r.status, detail: r.detail, at: new Date().toISOString() };
    sessionStorage.setItem(STORAGE.diagnostics, JSON.stringify(all));
  } catch { /* storage unavailable: nothing to remember */ }
}

// ---- the tests --------------------------------------------------------------------------------------

/** Placeholder names in a text: "{n} of {total}" → ["n", "total"]. */
const placeholders = (text) => [...String(text).matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).sort();

/** Both dictionaries side by side: [{ id, ok, n }] for parity, empty values, placeholders and unknown keys. */
export function languageChecks(en = dictionary("en"), de = dictionary("de"), asked = missingKeys()) {
  const ek = Object.keys(en);
  const dk = Object.keys(de);
  const onlyOne = [...ek.filter((k) => !Object.hasOwn(de, k)), ...dk.filter((k) => !Object.hasOwn(en, k))];
  const empty = [...ek, ...dk].filter((k) => typeof (en[k] ?? de[k]) !== "string" || !String(en[k] ?? "").trim() || !String(de[k] ?? "").trim());
  const uneven = ek.filter((k) => Object.hasOwn(de, k) && placeholders(en[k]).join() !== placeholders(de[k]).join());
  return [
    { id: "parity", ok: onlyOne.length === 0, n: onlyOne.length, keys: ek.length, sample: onlyOne.slice(0, 3) },
    { id: "empty", ok: empty.length === 0, n: new Set(empty).size, sample: [...new Set(empty)].slice(0, 3) },
    { id: "placeholders", ok: uneven.length === 0, n: uneven.length, sample: uneven.slice(0, 3) },
    { id: "unknown", ok: asked.length === 0, n: asked.length, sample: asked.slice(0, 3) }
  ];
}

const RUNNERS = {
  async anthropic() {
    const key = getKey();
    if (!key) {
      const r = await probeEndpoint();
      return r.ok
        ? { status: "pass", ms: r.ms, detail: detail("diag.api.reachable") }
        : { status: "fail", ms: r.ms, detail: apiMessage({ status: r.status, detail: r.detail }) };
    }
    const r = await checkKey(key);
    if (!r.ok) {
      const m = apiMessage(r);
      return { status: "fail", ms: r.ms, detail: m };
    }
    if (r.missing.length) {
      const names = r.missing.map((id) => MODELS.find((m) => m.id === id)?.label || id).join(", ");
      return { status: "warn", ms: r.ms, detail: detail("diag.api.missingModels", { models: names }) };
    }
    return { status: "pass", ms: r.ms, detail: detail("diag.api.keyValid", { n: MODELS.length }) };
  },

  async method() {
    const started = performance.now();
    let golden;
    try {
      golden = (await import("../data/golden.js")).default;
    } catch {
      return { status: "fail", ms: null, detail: detail("diag.method.missing"), checks: [] };
    }
    const groups = goldenChecks(golden);
    const total = groups.reduce((s, g) => s + g.total, 0);
    const passed = groups.reduce((s, g) => s + g.passed, 0);
    const checks = groups.map((g) => ({ key: `diag.method.${g.id}`, ok: g.passed === g.total, vars: { passed: g.passed, total: g.total }, failures: g.failures }));
    return {
      status: passed === total ? "pass" : "fail",
      ms: Math.round(performance.now() - started),
      detail: detail("diag.method.summary", { passed, total }),
      checks
    };
  },

  async languages() {
    const checks = languageChecks().map((c) => ({
      key: `diag.lang.${c.id}`, ok: c.ok,
      vars: { n: c.n, keys: c.keys ?? 0, sample: c.sample.join(", ") }
    }));
    const keys = Object.keys(dictionary("en")).length;
    const ok = checks.every((c) => c.ok);
    return { status: ok ? "pass" : "fail", ms: null, detail: detail(ok ? "diag.lang.ok" : "diag.lang.fail", { keys, n: checks.filter((c) => !c.ok).length }), checks };
  },

  async privacy() {
    const checks = [];
    // 1. The browser enforces where the page may connect: the meta tag is exactly the brief's policy.
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute("content") || "";
    const connect = (/connect-src([^;]*)/.exec(meta)?.[1] || "").trim().split(/\s+/).filter(Boolean);
    checks.push({ key: "diag.privacy.policy", ok: meta === CSP && connect.length === 1 && connect[0] === "https://api.anthropic.com", vars: { host: connect.join(" ") || "–" } });
    // 2. The key lives in this tab's session storage only, under this app's own name.
    let inLocal = false;
    let misplaced = 0;
    let foreign = 0;
    const own = new Set(Object.values(STORAGE));
    const unknownOwn = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (KEY_LIKE.test(localStorage.getItem(k) || "")) inLocal = true;
        if (k.startsWith(`${APP.id}.`) && !own.has(k)) unknownOwn.push(k);
        else if (!k.startsWith(`${APP.id}.`) && k !== THEME_KEY) foreign += 1;
      }
    } catch { /* storage unavailable */ }
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k.startsWith(`${APP.id}.`)) {
          if (!own.has(k)) unknownOwn.push(k);
          if (k !== STORAGE.apiKey && KEY_LIKE.test(sessionStorage.getItem(k) || "")) misplaced += 1;
        } else if (k !== THEME_KEY) foreign += 1;
      }
    } catch { /* storage unavailable */ }
    checks.push({ key: getKey() ? "diag.privacy.keyStored" : "diag.privacy.noKey", ok: !inLocal && !misplaced, vars: { name: STORAGE.apiKey } });
    checks.push({ key: "diag.privacy.storage", ok: unknownOwn.length === 0, vars: { prefix: `${APP.id}.`, theme: THEME_KEY, others: foreign, unknown: unknownOwn.join(", ") || "–" } });
    // 3. Nothing exported can carry the key.
    const sample = getKey() || "sk-ant-EXAMPLE-not-a-real-key-0000";
    checks.push({ key: "diag.privacy.redaction", ok: !redactSecrets(`x ${sample} y`).includes(sample), vars: null });
    const ok = checks.every((c) => c.ok);
    return { status: ok ? "pass" : "fail", ms: null, detail: detail(ok ? "diag.privacy.ok" : "diag.privacy.fail", { n: checks.filter((c) => !c.ok).length }), checks };
  },

  async data() {
    const schemas = globalThis.SA_SCHEMAS || {};
    const entries = catalogueEntries();
    const facts = globalThis.SA_REF_FACTS?.facts || [];
    const invalidEntries = entries.filter((e) => !validate(e, schemas.CatalogueEntry || {}, schemas).valid).map((e) => e.id);
    const ids = entries.map((e) => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    const invalidFacts = facts.filter((f) => !validate(f.evidence, schemas.Evidence || {}, schemas).valid || !f.statement?.en || !f.statement?.de).map((f) => f.id);
    const checks = [
      { key: "diag.data.schemas", ok: Object.keys(schemas).length === 11, vars: { n: Object.keys(schemas).length } },
      // Sixteen services and, from version 0.3.0, the self-assessment of this prototype.
      { key: "diag.data.catalogue", ok: entries.length === 17 && entries.filter((e) => e.category === "self_assessment").length === 1 && !invalidEntries.length && !dupes.length && !!schemas.CatalogueEntry, vars: { n: entries.length, bad: [...invalidEntries, ...dupes].join(", ") || "–" } },
      { key: "diag.data.refFacts", ok: facts.length > 0 && !invalidFacts.length && !!schemas.Evidence, vars: { n: facts.length, bad: invalidFacts.join(", ") || "–" } }
    ];
    const ok = checks.every((c) => c.ok);
    return { status: ok ? "pass" : "fail", ms: null, detail: detail(ok ? "diag.data.ok" : "diag.data.fail", { n: checks.filter((c) => !c.ok).length }), checks };
  }
};

/** Runs one test; the API's result is remembered for this tab. */
export async function runTest(id) {
  const fn = RUNNERS[id];
  if (!fn) return { status: "skip", detail: detail("diag.unknownTest") };
  let r;
  try {
    r = await fn();
  } catch (e) {
    r = { status: "fail", ms: null, detail: detail("diag.crashed", { message: redactSecrets(String(e?.message || e)).slice(0, 160) }) };
  }
  if (id === "anthropic") remember(id, r);
  return r;
}

/** Runs every test in parallel and reports each result as it arrives. */
export async function runAll(onResult) {
  const out = {};
  await Promise.all(TESTS.map(async (x) => {
    onResult?.(x.id, { status: "running" });
    const r = await runTest(x.id);
    out[x.id] = r;
    onResult?.(x.id, r);
  }));
  return out;
}
