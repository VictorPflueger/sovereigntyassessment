// The simulation player in the running app (AC-11, AC-13, AC-14, AC-15), offline and without a key:
//   play       every pre-run in data/runs/ plays to its report in English and in German (two plays per
//              pre-run file; thirty-four from version 1.0.0): the
//              SIMULATION badge and tape, the tiles and the spider diagram equal to the engine's
//              recomputation of the final blocks, the memo and the report in the Outbox in the run's
//              language, no unresolved placeholder or broken value anywhere, no request to any host. A
//              pre-run that ends "not_a_service" (ZBDS, ZaPuK, low-code) ends done with that line, no
//              block, no figure, no memo, its report with its sources in the Outbox, and an assessment
//              export that says why there is nothing to save
//   alternate  a reviewer's correction and the choice "Keep as is" (the plays approve L1): the tiles
//              follow the correction, the memo is for keeping things as they are, the report lists the
//              correction and the decision
//   map        the spider diagram: six axes in the portal's order in the layer view, one axis per block in
//              the block view, values equal to the engine's, dashed axes where there is no score; the
//              Made-in and Run-by mix beside it with the engine's counts; the table with the same numbers
//   review     a correction needs a reason; two corrections recompute and are logged, the block marked;
//              Confirm resolves; the report lists every correction; in a second run, in German, the form
//              shows an unknown maker as "unbekannt" with an empty country and changes nothing applied
//              unchanged, the codes are spelled out, a tool call's raw record is labelled in German and
//              marked as English, and Skip resolves too
//   levers     at most three levers plus Keep as is; Approve needs a choice; a what-if never changes the
//              assessment; the memo lands in the Outbox with "Draft. Nothing is sent."
// Every case fails on a page error, a console error, a policy violation or any request to another host
// (a simulation reaches no host at all, api.anthropic.com included).
// Usage: node tests/sims.mjs [case…]
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, NETWORK_NOISE, SKIP_INTRO } from "./lib/harness.mjs";

const OUT = await outDir("sims");
const { base: BASE, close } = await serveStatic(APP_ROOT, 8768);
const browser = await launchBrowser();
const results = [];
// Every bundled pre-run: the brief's six, the five of decision D3 and the self-assessment (0.3.0), and the
// five added in 1.0.0.
const PRE_RUNS = readdirSync(path.join(APP_ROOT, "data/runs")).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3)).sort();
const { readRunFile } = await import(pathToFileURL(path.join(APP_ROOT, "tools/check-runs.mjs")).href);
const { endsWithoutAssessment } = await import(pathToFileURL(path.join(APP_ROOT, "js/loaded.js")).href);
/** The pre-runs that end "not_a_service": no block, no review, no lever. */
const NOT_A_SERVICE = new Set(PRE_RUNS.filter((id) => endsWithoutAssessment(readRunFile(path.join(APP_ROOT, "data/runs", `${id}.js`)))));
const LAYERS = ["infrastructure", "devsecops", "platform", "base_service", "applications", "access"];
const TERMINAL = ["done", "stopped", "aborted", "error"];

async function newPage({ lang = "en", viewport = { width: 1600, height: 1000 } } = {}) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(SKIP_INTRO);
  await context.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`.trim()));
  });
  const external = [];
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => {
    const u = new URL(route.request().url());
    external.push(`${route.request().method()} ${u.host}${u.pathname}`);
    return route.abort("blockedbyclient");
  });
  const page = await context.newPage();
  const log = { pageErrors: [], consoleErrors: [] };
  page.on("pageerror", (e) => log.pageErrors.push(String(e.message || e)));
  page.on("console", (m) => { if (m.type() === "error") log.consoleErrors.push(m.text()); });
  await page.goto(`${BASE}?lang=${lang}`);
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  // Every run event, as the page's own modules emit it; and the run state, for waiting.
  await page.evaluate(async () => {
    const { bus } = await import("/js/events.js");
    const st = await import("/js/state.js");
    window.__ev = [];
    window.__getState = st.getState;
    bus.onAny((e) => window.__ev.push({ type: e.type, payload: JSON.parse(JSON.stringify(e.payload ?? null)) }));
    // Faster than the speed buttons offer, so every play fits in a test run; the player reads this.
    st.setState({ speed: 40 });
  });
  return { context, page, log, external };
}

async function finish(name, t, checks, expectations) {
  const csp = await t.page.evaluate(() => window.__csp || []).catch(() => ["<page gone>"]);
  const consoleErrors = t.log.consoleErrors.filter((x) => !NETWORK_NOISE.test(x));
  const problems = expectations.filter(([ok]) => !ok).map(([, msg]) => msg);
  if (checks.FAILED) problems.unshift(`exception: ${checks.FAILED}`);
  if (t.external.length) problems.push(`requests to other hosts: ${t.external.join(", ")}`);
  const ok = !problems.length && !t.log.pageErrors.length && !consoleErrors.length && !csp.length;
  results.push({ name, ok, problems, checks, pageErrors: t.log.pageErrors, consoleErrors, csp });
  await t.context.close();
  return ok;
}

const shot = (page, file) => page.screenshot({ path: path.join(OUT, file) });
const text = (page, sel) => page.$eval(sel, (el) => el.textContent.replace(/\s+/g, " ").trim()).catch(() => null);
const waitState = (page, states, timeout = 90000) => page.waitForFunction((s) => s.includes(window.__getState().runState), states, { timeout });

async function startSim(page, entry) {
  await page.click(`.catalogue-chip[data-entry="${entry}"]`);
  await page.click("#btn-start");
  await page.waitForSelector('.mode-card[data-mode="simulation"] .mode-cta button');
  await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
}
async function toReview(page) {
  await waitState(page, ["awaiting_review"]);
  await page.waitForSelector("#btn-review-confirm");
}
async function chooseLever(page, choice) {
  await waitState(page, ["awaiting_decision"]);
  await page.waitForSelector(`.lever-card[data-lever="${choice}"]`);
  await page.click(`.lever-card[data-lever="${choice}"] .lever-id`);
  await page.click("#btn-approve-lever");
}

/** The engine's recomputation of the last published blocks, beside what the run published and showed. */
const recompute = (page) => page.evaluate(async () => {
  const { score } = await import("/js/engine.js");
  const { fmtScore } = await import("/js/format.js");
  const { getLang } = await import("/js/i18n/index.js");
  const ups = window.__ev.filter((e) => e.type === "score_update");
  const last = ups[ups.length - 1]?.payload?.result;
  if (!last) return null;
  const layerStatus = {};
  for (const e of window.__ev.filter((x) => x.type === "layer_status")) layerStatus[e.payload.layer] = e.payload.status;
  const blocks = last.blocks.map((v) => ({
    id: v.id, layer: v.layer, criticality: v.scored.criticality, hosting: v.scored.hosting, licence: v.scored.licence, exit: v.scored.exit,
    tech: v.scored.tech, operator: v.scored.operator, class_override: { tech: v.tech_class, operator: v.operator_class }
  }));
  const r = score(blocks, { layerStatus });
  const tile = document.querySelector("#kpi-overall-value")?.textContent.trim();
  return {
    overall: r.overall, published: last.overall,
    layers: Object.fromEntries(Object.entries(r.layers).map(([k, L]) => [k, L.score])),
    publishedLayers: Object.fromEntries(Object.entries(last.layers).map(([k, L]) => [k, L.score])),
    levels: Object.fromEntries(r.blocks.map((b) => [b.id, b.unscored ? null : b.level])),
    counts: r.counts, coverage: r.coverage,
    tile, tileExpected: r.overall === null ? null : fmtScore(r.overall, getLang())
  };
});
const sameCounts = (a, b) => !!a && !!b && JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());
const close9 = (a, b) => (a === null || a === undefined ? b === null || b === undefined : typeof b === "number" && Math.abs(a - b) < 1e-9);

/** Visible text that must never show: unresolved placeholders, broken values, raw keys of the fact audit. */
const brokenText = (page) => page.evaluate(() => {
  const roots = [".console", ".drawer", ".sov-map", ".kpis, #kpis, .kpi-row"].map((s) => document.querySelector(s)).filter(Boolean);
  const all = roots.map((r) => r.innerText).join("\n");
  const hits = [];
  for (const re of [/\{\{[^}]*\}\}/g, /\bundefined\b/g, /\bNaN\b/g, /\[object [A-Za-z]+\]/g, /\bnull\b/g]) for (const m of all.matchAll(re)) hits.push(m[0]);
  return [...new Set(hits)];
});

// ---- play ------------------------------------------------------------------------------------------------
if (wanted("play")) {
  let passed = 0;
  let total = 0;
  for (const entry of PRE_RUNS) {
    for (const lang of ["en", "de"]) {
      total += 1;
      if (NOT_A_SERVICE.has(entry)) { if (await playNotAService(entry, lang)) passed += 1; continue; }
      const t = await newPage({ lang });
      const { page } = t;
      const checks = {};
      try {
        await startSim(page, entry);
        await page.waitForSelector(".sim-watermark:not([hidden])");
        checks.badge = await text(page, "#mode-badge");
        checks.tape = await text(page, ".sim-watermark");
        await toReview(page);
        await page.click("#btn-review-confirm");
        await chooseLever(page, "L1");
        await waitState(page, TERMINAL);
        checks.state = await page.evaluate(() => window.__getState().runState);
        checks.fig = await recompute(page);
        checks.tileNote = await text(page, "#kpi-overall-sub");
        checks.heads = await page.$$eval(".hc-group", (els) => els.map((g) => ({ layer: g.dataset.layer, text: g.querySelector(".hc-score")?.textContent.trim(), cells: g.querySelectorAll(".hc-cell[data-block]").length })));
        checks.axes = await page.$$eval('.spider[data-view="layer"] .sp-axis-g', (els) => els.map((e) => ({ id: e.dataset.axis, v: e.dataset.value === "" ? null : Number(e.dataset.value) })));
        await page.click("#tab-outbox");
        await page.waitForSelector('.outbox-card[data-draft="report"]');
        checks.memo = await page.$eval('.outbox-card[data-draft="memo"]', (el) => ({ lang: el.querySelector(".md")?.getAttribute("lang"), note: el.querySelector(".outbox-status")?.textContent.trim(), text: el.querySelector(".md")?.innerText || "" })).catch(() => null);
        checks.report = await page.$eval('.outbox-card[data-draft="report"]', (el) => ({ lang: el.querySelector(".md")?.getAttribute("lang"), text: el.querySelector(".md")?.innerText || "" })).catch(() => null);
        checks.broken = await brokenText(page);
        checks.htmlLang = await page.getAttribute("html", "lang");
        if (total === 1 || entry === "epaybl") await shot(page, `play-${entry}-${lang}.png`);
      } catch (err) { checks.FAILED = String(err.message).split("\n").slice(0, 3).join(" "); }
      const f = checks.fig || {};
      const de = lang === "de";
      const ok = await finish(`play ${entry} ${lang}`, t, checks, [
        [checks.state === "done", `the run ends done (${checks.state})`],
        [checks.badge === "SIMULATION" && /SIMULATION/.test(checks.tape || ""), `the SIMULATION badge and tape (${checks.badge}; ${checks.tape})`],
        [close9(f.overall, f.published) && LAYERS.every((l) => close9(f.layers?.[l], f.publishedLayers?.[l])), `the published figures equal the engine's recomputation (${f.overall} vs ${f.published})`],
        [f.tile === (f.tileExpected ?? (de ? "keine Daten" : "no data")), `the overall tile shows the recomputed score (${f.tile} vs ${f.tileExpected})`],
        // A layer whose blocks have no origin on record says so, not "no evidence found" (R-15).
        [Array.isArray(checks.heads) && checks.heads.filter((g) => g.cells > 0 && !Number.isFinite(f.layers?.[g.layer])).every((g) => g.text === (de ? "Herkunft nicht belegt" : "no evidence on maker or operator")), `the layers without a scored block (${JSON.stringify(checks.heads?.filter((g) => g.cells > 0 && !Number.isFinite(f.layers?.[g.layer])))})`],
        // The tile says on how many layers the score rests when not on all six (the review's finding R-11).
        [(() => { const n = LAYERS.filter((l) => Number.isFinite(f.layers?.[l])).length; return checks.tileNote === (n === 6 || f.overall === null ? (de ? "indikativ" : "indicative") : de ? `indikativ; ${n} von 6 Ebenen bewertet` : `indicative; ${n} of 6 layers scored`); })(), `the overall tile's note (${checks.tileNote})`],
        [checks.axes?.length === 6 && checks.axes.every((a, i) => a.id === LAYERS[i] && close9(f.layers?.[a.id], a.v)), "the spider diagram's six axes carry the engine's layer scores"],
        [checks.memo?.lang === lang && checks.memo.note === (de ? "Entwurf. Nichts wird versendet." : "Draft. Nothing is sent.") && (de ? /Entscheidung: Hebel L1/ : /Decision: lever L1/).test(checks.memo.text), `the memo for L1 in the Outbox, in the run's language (${checks.memo?.lang}; ${checks.memo?.note})`],
        [checks.report?.lang === lang && (checks.report.text || "").length > 400 && (de ? /Befunde/ : /findings/).test(checks.report.text), `the report in the Outbox, in the run's language (${checks.report?.lang}, ${(checks.report?.text || "").length} characters)`],
        [checks.htmlLang === lang && Array.isArray(checks.broken) && checks.broken.length === 0, `no unresolved placeholder or broken value (${JSON.stringify(checks.broken)})`]
      ]);
      if (ok) passed += 1;
    }
  }
  const expected = 2 * PRE_RUNS.length;
  const problems = passed === total ? [] : ["see the failed plays above"];
  if (NOT_A_SERVICE.size !== 3) problems.push(`${NOT_A_SERVICE.size} pre-runs end "not_a_service", not 3 (${[...NOT_A_SERVICE].join(", ")})`);
  results.push({ name: `play: ${passed} of ${total} pre-run plays complete (${PRE_RUNS.length} pre-run files, ${NOT_A_SERVICE.size} of them ending without an assessment)`, ok: !problems.length && total === expected, problems, summaryOnly: true });
  if (!problems.length && total === expected) console.log(`SIMS PLAY OK (${passed} of ${total}, two per pre-run file)`);
}

/** One play of a pre-run that ends "not_a_service": it never reaches the review or the levers. */
async function playNotAService(entry, lang) {
  const t = await newPage({ lang });
  const { page } = t;
  const checks = {};
  const de = lang === "de";
  try {
    await startSim(page, entry);
    await page.waitForSelector(".sim-watermark:not([hidden])");
    checks.badge = await text(page, "#mode-badge");
    checks.tape = await text(page, ".sim-watermark");
    await waitState(page, TERMINAL);
    checks.state = await page.evaluate(() => window.__getState().runState);
    checks.end = await page.evaluate(() => window.__ev.filter((e) => e.type === "run_end").map((e) => e.payload.status));
    checks.endLine = await page.$$eval('.entry[data-type="run"] .run-title', (els) => els.map((e) => e.textContent.trim()).pop() || "");
    checks.steps = await page.evaluate(() => window.__ev.filter((e) => ["review_request", "levers", "action_draft", "block_recorded"].includes(e.type)).map((e) => e.type));
    checks.fig = await recompute(page);
    checks.tile = await text(page, "#kpi-overall-value");
    checks.cells = await page.$$eval(".hc-cell[data-block]", (els) => els.length);
    // What the screen says of a run without an assessment (the review's finding R-07): the rail's steps
    // after the research were not needed, every layer reads "not assessed", and so does the map's line.
    checks.rail = await page.$$eval(".rail .rail-step", (els) => els.map((e) => e.dataset.state));
    checks.railSaid = await page.$$eval(".rail .rail-step .vc-visually-hidden", (els) => els.map((e) => e.textContent.trim()));
    checks.heads = await page.$$eval(".hc-group .hc-score", (els) => els.map((e) => e.textContent.trim()));
    checks.meta = await text(page, ".sov-meta");
    await page.click("#tab-outbox");
    await page.waitForSelector('.outbox-card[data-draft="report"]');
    checks.cards = await page.$$eval(".outbox-card", (els) => els.map((e) => e.dataset.draft));
    checks.report = await page.$eval('.outbox-card[data-draft="report"]', (el) => ({ lang: el.querySelector(".md")?.getAttribute("lang"), text: el.querySelector(".md")?.innerText || "", links: el.querySelectorAll(".md a[href^='https://']").length })).catch(() => null);
    checks.exportAssessment = await page.$eval("#btn-file-assessment", (b) => ({ disabled: b.disabled || b.getAttribute("aria-disabled") === "true", why: b.closest(".export-item")?.querySelector(".export-name")?.textContent.trim() })).catch(() => null);
    checks.broken = await brokenText(page);
    checks.htmlLang = await page.getAttribute("html", "lang");
    if (entry === "zbds") await shot(page, `play-${entry}-${lang}.png`);
  } catch (err) { checks.FAILED = String(err.message).split("\n").slice(0, 3).join(" "); }
  return finish(`play ${entry} ${lang} (ends without an assessment)`, t, checks, [
    [checks.state === "done" && JSON.stringify(checks.end) === JSON.stringify(["not_a_service"]), `the run ends done as not a service (${checks.state}; ${JSON.stringify(checks.end)})`],
    [(de ? /kein digitaler Dienst in Betrieb/ : /is not a digital service in operation/).test(checks.endLine || ""), `the console's last line says so (${checks.endLine})`],
    [checks.badge === "SIMULATION" && /SIMULATION/.test(checks.tape || ""), `the SIMULATION badge and tape (${checks.badge}; ${checks.tape})`],
    [Array.isArray(checks.steps) && checks.steps.length === 0 && checks.fig === null && checks.cells === 0 && checks.tile === (de ? "keine Daten" : "no data"), `no block, review, lever or memo, and no figure (${JSON.stringify(checks.steps)}; ${checks.cells} cells; ${checks.tile})`],
    [JSON.stringify(checks.cards) === JSON.stringify(["report"]) && checks.report?.lang === lang && checks.report.text.length > 400 && (de ? /Quellen/ : /Sources/).test(checks.report.text) && checks.report.links >= 1, `only the report in the Outbox, in the run's language, with its sources (${JSON.stringify(checks.cards)}; ${checks.report?.lang}; ${checks.report?.links} links)`],
    [checks.exportAssessment?.disabled === true && (de ? /ohne Bewertung/ : /without an assessment/).test(checks.exportAssessment.why || ""), `the assessment export says why it has nothing to save (${checks.exportAssessment?.why})`],
    [checks.htmlLang === lang && Array.isArray(checks.broken) && checks.broken.length === 0, `no unresolved placeholder or broken value (${JSON.stringify(checks.broken)})`],
    [JSON.stringify(checks.rail) === JSON.stringify(["done", "done", "skipped", "skipped", "skipped"]) && checks.railSaid?.slice(2).every((x) => x === (de ? ": nicht nötig" : ": not needed")), `the rail: understood and researched, the rest not needed (${JSON.stringify(checks.rail)}; ${JSON.stringify(checks.railSaid)})`],
    [checks.heads?.length === 6 && checks.heads.every((x) => x === (de ? "nicht bewertet" : "not assessed")) && (de ? /ohne Bewertung beendet/ : /ended without an assessment/).test(checks.meta || "") && !(de ? /indikativ/ : /indicative/).test(checks.meta || ""), `every layer and the map's line say not assessed (${JSON.stringify(checks.heads)}; ${checks.meta})`],
    [(de ? /Keine Bewertung: Der Lauf endete ohne Bewertung, wie der Bericht sagt\./ : /No assessment: the run ended without one, as the report says\./).test(checks.report?.text || "") && !(de ? /Jede Zahl wurde im Code berechnet/ : /Every figure was computed in code/).test(checks.report?.text || ""), "the report's footer claims no assessment and no figure"]
  ]);
}

// ---- alternate -----------------------------------------------------------------------------------------------
if (wanted("alternate")) {
  const t = await newPage({ lang: "en" });
  const { page } = t;
  const checks = {};
  try {
    await startSim(page, "bundesportal");
    await toReview(page);
    checks.before = await recompute(page);
    // The platform's maker is a gap (B-02); the reviewer knows it.
    await page.click('.review-block[data-block="B-02"] .review-correct');
    await page.waitForSelector('.review-form[data-block="B-02"]');
    await page.fill('.review-form[data-block="B-02"] input[name="tech.name"]', "Example Software GmbH");
    await page.fill('.review-form[data-block="B-02"] input[name="tech.country"]', "DE");
    // The reason also carries a key pasted by mistake: the Outbox shows it redacted (R-03).
    await page.fill('.review-form[data-block="B-02"] textarea[name="reason"]', "The portal team named the platform's maker in a call. sk-ant-test-NOTAREALKEY-0123456789abcdef");
    await page.click('.review-form[data-block="B-02"] .review-apply');
    await page.waitForSelector('.review-block[data-block="B-02"] .corrected-tag');
    checks.after = await recompute(page);
    await page.click("#btn-review-confirm");
    await chooseLever(page, "keep");
    await waitState(page, TERMINAL);
    checks.final = await recompute(page);
    await page.click("#tab-outbox");
    await page.waitForSelector('.outbox-card[data-draft="report"]');
    checks.memo = await page.$eval('.outbox-card[data-draft="memo"] .md', (el) => el.innerText).catch(() => "");
    checks.report = await page.$eval('.outbox-card[data-draft="report"] .md', (el) => el.innerText).catch(() => "");
    checks.broken = await brokenText(page);
    await shot(page, "alternate-keep.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n").slice(0, 3).join(" "); }
  const b = checks.before || {};
  const a = checks.after || {};
  const fin = checks.final || {};
  await finish("alternate: a correction and Keep as is give consistent tiles, memo and report", t, checks, [
    [b.levels?.["B-02"] === 2 && a.levels?.["B-02"] === 4 && a.overall > b.overall, `the correction recomputes: B-02 ${b.levels?.["B-02"]} → ${a.levels?.["B-02"]}, overall ${b.overall} → ${a.overall}`],
    [close9(fin.overall, fin.published) && fin.tile === fin.tileExpected && close9(fin.overall, a.overall), `the tiles show the corrected assessment, unchanged by the decision (${fin.tile})`],
    [/Decision: keep things as they are/.test(checks.memo || "") && new RegExp(`Overall score: ${fin.tileExpected}`).test(checks.memo || ""), "the memo is for keeping things as they are, with the corrected figure"],
    [/Corrections by the reviewer/.test(checks.report || "") && /The portal team named the platform's maker in a call\./.test(checks.report || "") && /The decision is to keep things as they are\./.test(checks.report || ""), "the report lists the correction and the decision"],
    [/sk-ant-\[REDACTED\]/.test(checks.report || "") && !/NOTAREALKEY/.test(checks.report || ""), "a key pasted into the reason is redacted in the Outbox's report"],
    [Array.isArray(checks.broken) && checks.broken.length === 0, `no unresolved placeholder or broken value (${JSON.stringify(checks.broken)})`]
  ]);
}

// ---- map -----------------------------------------------------------------------------------------------------------
if (wanted("map")) {
  const t = await newPage({ lang: "en" });
  const { page } = t;
  const checks = {};
  try {
    await startSim(page, "epaybl");
    await toReview(page);
    checks.fig = await recompute(page);
    checks.layer = await page.$eval('.spider[data-view="layer"]', (svg) => ({
      axes: Number(svg.dataset.axes),
      list: [...svg.querySelectorAll(".sp-axis-g")].map((g) => ({ id: g.dataset.axis, v: g.dataset.value === "" ? null : Number(g.dataset.value), dashed: g.dataset.dashed === "true", line: g.querySelector("line")?.getAttribute("class") }))
    }));
    checks.mix = await page.$$eval(".sov-mix .mix-group", (groups) => Object.fromEntries(groups.map((g) => [g.dataset.group, Object.fromEntries([...g.querySelectorAll(".mix-row")].map((r) => [r.dataset.cls, Number(r.dataset.n)]))])));
    await shot(page, "map-layer.png");
    await page.click('.sov-views button[data-view="block"]');
    await page.waitForSelector('.spider[data-view="block"]');
    checks.block = await page.$eval('.spider[data-view="block"]', (svg) => ({
      axes: Number(svg.dataset.axes),
      list: [...svg.querySelectorAll(".sp-axis-g")].map((g) => ({ id: g.dataset.axis, v: g.dataset.value === "" ? null : Number(g.dataset.value), dashed: g.dataset.dashed === "true" }))
    }));
    await shot(page, "map-block.png");
    await page.click(".sov-table-btn");
    await page.waitForSelector(".sov-table:not([hidden]) table[data-table='layers']");
    checks.table = await page.$eval(".sov-table", (el) => ({
      layers: [...el.querySelectorAll("tr[data-layer]")].map((r) => ({ id: r.dataset.layer, v: r.dataset.value === "" ? null : Number(r.dataset.value), shown: r.querySelector("td")?.textContent.trim() })),
      blocks: [...el.querySelectorAll("tr[data-block]")].map((r) => ({ id: r.dataset.block, v: r.dataset.value === "" ? null : Number(r.dataset.value) })),
      spiderHidden: document.querySelector(".sov-spider")?.hidden
    }));
    checks.fmt = await page.evaluate(async (vals) => { const { fmtScore } = await import("/js/format.js"); return vals.map((v) => (v === null ? null : fmtScore(v))); }, LAYERS.map((l) => checks.fig?.layers?.[l] ?? null));
    await shot(page, "map-table.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n").slice(0, 3).join(" "); }
  const f = checks.fig || {};
  const blockIds = Object.keys(f.levels || {});
  const countsOf = (group) => Object.fromEntries(Object.entries(f.counts?.[group]?.all || {}).filter(([, n]) => n > 0));
  await finish("map: the spider by layer and by block, the mix and the table, with the engine's numbers", t, checks, [
    [checks.layer?.axes === 6 && checks.layer.list.map((x) => x.id).join() === LAYERS.join(), `six axes in the portal's order (${checks.layer?.list?.map((x) => x.id).join()})`],
    [checks.layer?.list?.every((x) => close9(f.layers?.[x.id], x.v)), "the layer view's values equal the engine's layer scores"],
    [checks.layer?.list?.every((x) => (f.layers?.[x.id] === null) === x.dashed && (!x.dashed || /dashed/.test(x.line || ""))) && checks.layer.list.some((x) => x.dashed), "dashed axes exactly where a layer has no score (infrastructure and platform here)"],
    [checks.block?.axes === blockIds.length && checks.block.list.map((x) => x.id).join() === blockIds.join(), `one axis per block (${checks.block?.axes} for ${blockIds.length} blocks)`],
    [checks.block?.list?.every((x) => (f.levels?.[x.id] === null ? x.dashed : close9(25 * f.levels[x.id], x.v))), "the block view's values are the engine's levels"],
    [sameCounts(checks.mix?.made_in, countsOf("made_in")) && sameCounts(checks.mix?.run_by, countsOf("run_by")), `the Made-in and Run-by mix carries the engine's counts (${JSON.stringify(checks.mix)})`],
    [checks.table?.spiderHidden === true && checks.table.layers.every((r, i) => r.id === LAYERS[i] && close9(f.layers?.[r.id], r.v) && (checks.fmt?.[i] === null || r.shown === checks.fmt[i])) && checks.table.blocks.every((r) => (f.levels?.[r.id] === null ? r.v === null : close9(25 * f.levels[r.id], r.v))), "the table has the same numbers, one click away"]
  ]);
}

// ---- review --------------------------------------------------------------------------------------------------------
if (wanted("review")) {
  const t = await newPage({ lang: "en" });
  const { page } = t;
  const checks = {};
  try {
    await startSim(page, "epaybl");
    await toReview(page);
    checks.before = await recompute(page);
    // A correction without a reason is refused, and nothing changes.
    await page.click('.review-block[data-block="B-02"] .review-correct');
    await page.fill('.review-form[data-block="B-02"] input[name="operator.name"]', "European Payments Initiative");
    await page.fill('.review-form[data-block="B-02"] input[name="operator.country"]', "BE");
    await page.click('.review-form[data-block="B-02"] .review-apply');
    checks.noReason = await text(page, '.review-form[data-block="B-02"] .review-msg');
    checks.decisionsWithoutReason = await page.evaluate(() => window.__ev.filter((e) => e.type === "review_decision").length);
    // With a reason it applies: B-02's operator, then B-03's hosting.
    await page.fill('.review-form[data-block="B-02"] textarea[name="reason"]', "Card payments move to Wero next quarter.");
    await page.click('.review-form[data-block="B-02"] .review-apply');
    await page.waitForSelector('.review-block[data-block="B-02"] .corrected-tag');
    await page.click('.review-block[data-block="B-03"] .review-correct');
    await page.selectOption('.review-form[data-block="B-03"] select[name="hosting"]', "EU");
    await page.fill('.review-form[data-block="B-03"] textarea[name="reason"]', "PayPal confirmed hosting in the EU.");
    await page.click('.review-form[data-block="B-03"] .review-apply');
    await page.waitForSelector('.review-block[data-block="B-03"] .corrected-tag');
    checks.after = await recompute(page);
    checks.log = await page.$$eval(".corrections-list li", (els) => els.map((e) => e.textContent.trim()));
    await shot(page, "review-corrected.png");
    await page.click("#btn-review-confirm");
    checks.done = await text(page, ".review-done");
    await chooseLever(page, "L1");
    await waitState(page, TERMINAL);
    await page.click("#tab-outbox");
    await page.waitForSelector('.outbox-card[data-draft="report"]');
    checks.report = await page.$eval('.outbox-card[data-draft="report"] .md', (el) => el.innerText).catch(() => "");
    checks.audit = await page.evaluate(() => window.__ev.filter((e) => e.type === "review_decision").map((e) => e.payload.action));
  } catch (err) { checks.FAILED = String(err.message).split("\n").slice(0, 3).join(" "); }
  // A second run: Skip resolves the review too.
  const t2 = await newPage({ lang: "de" });
  const checks2 = {};
  try {
    await startSim(t2.page, "fit-connect");
    await toReview(t2.page);
    // The German form shows an unknown maker in German, not as "unknown"/"UNKNOWN", and the codes are
    // spelled out where the person reads them (the review's R-27). Applied unchanged, it changes nothing.
    checks2.key = await text(t2.page, ".review-key");
    const unk = await t2.page.$$eval(".review-block", (els) => els.find((e) => /^UNB·/.test(e.querySelector(".review-codes")?.textContent.trim() || ""))?.dataset.block || null);
    checks2.unknownBlock = unk;
    if (unk) {
      await t2.page.click(`.review-block[data-block="${unk}"] .review-correct`);
      const form = `.review-form[data-block="${unk}"]`;
      await t2.page.waitForSelector(form);
      checks2.form = await t2.page.$eval(form, (f) => ({
        name: f.querySelector('input[name="tech.name"]').value,
        country: f.querySelector('input[name="tech.country"]').value,
        placeholder: f.querySelector('input[name="tech.country"]').placeholder
      }));
      await t2.page.fill(`${form} textarea[name="reason"]`, "Nur geöffnet.");
      await t2.page.click(`${form} .review-apply`);
      checks2.unchanged = await text(t2.page, `${form} .review-msg`);
      // An empty name is refused with a message that says what a party needs.
      await t2.page.fill(`${form} input[name="tech.name"]`, "");
      await t2.page.click(`${form} .review-apply`);
      checks2.noName = await text(t2.page, `${form} .review-msg`);
      await t2.page.click(`${form} .vc-button--ghost`);
    }
    await t2.page.click("#btn-review-skip");
    checks2.done = await text(t2.page, ".review-done");
    await chooseLever(t2.page, "keep");
    await waitState(t2.page, TERMINAL);
    checks2.state = await t2.page.evaluate(() => window.__getState().runState);
    // Hide brings the console back. A step's details hold the raw record under a German line that says
    // what it is; the record itself is marked as English (the review's R-21).
    await t2.page.click(".drawer-toggle");
    await t2.page.click(".result-toggle");
    checks2.raw = await t2.page.$eval(".result[data-open='true'] .result-body", (el) => ({
      note: el.querySelector(".result-note")?.textContent.trim() || null,
      lang: el.querySelector(".result-json")?.getAttribute("lang") || null,
      json: (() => { try { return Object.keys(JSON.parse(el.querySelector(".result-json")?.textContent || "")).join(); } catch { return null; } })()
    })).catch(() => null);
    await t2.page.click("#tab-outbox");
    await t2.page.waitForSelector('.outbox-card[data-draft="report"]');
    checks2.report = await t2.page.$eval('.outbox-card[data-draft="report"] .md', (el) => el.innerText).catch(() => "");
  } catch (err) { checks2.FAILED = String(err.message).split("\n").slice(0, 3).join(" "); }
  const b = checks.before || {};
  const a = checks.after || {};
  // The second run's problems count for this case too.
  t.log.pageErrors.push(...t2.log.pageErrors);
  t.log.consoleErrors.push(...t2.log.consoleErrors);
  t.external.push(...t2.external);
  checks.skip = checks2;
  if (checks2.FAILED && !checks.FAILED) checks.FAILED = `second run: ${checks2.FAILED}`;
  await t2.context.close();
  await finish("review: a correction needs a reason, recomputes and is logged; Confirm and Skip resolve; the report lists every correction", t, checks, [
    [checks.noReason === "A correction needs a reason." && checks.decisionsWithoutReason === 0, `no reason, no correction (${checks.noReason})`],
    [b.levels?.["B-02"] === 0 && a.levels?.["B-02"] === 2 && b.levels?.["B-03"] === 0 && a.levels?.["B-03"] === 1 && a.overall > b.overall && a.tile === a.tileExpected, `both corrections recompute (B-02 ${b.levels?.["B-02"]}→${a.levels?.["B-02"]}, B-03 ${b.levels?.["B-03"]}→${a.levels?.["B-03"]}, overall ${b.overall}→${a.overall}, tile ${a.tile})`],
    [checks.log?.length === 2 && /B-02/.test(checks.log[0]) && /Wero/.test(checks.log[0]) && /B-03/.test(checks.log[1]), `both are logged with their reasons (${JSON.stringify(checks.log)})`],
    [checks.done === "You confirmed the findings (2 corrections). They are frozen now.", `Confirm resolves the review (${checks.done})`],
    [/Corrections by the reviewer/.test(checks.report || "") && /Card payments move to Wero next quarter\./.test(checks.report || "") && /PayPal confirmed hosting in the EU\./.test(checks.report || ""), "the report lists every correction"],
    [JSON.stringify(checks.audit) === JSON.stringify(["correct", "correct", "confirm"]), `the decisions on the bus (${JSON.stringify(checks.audit)})`],
    [checks2.done === "Sie haben die Prüfung übersprungen (0 Korrekturen). Die Befunde sind jetzt festgeschrieben." && checks2.state === "done", `in a second run, in German, Skip resolves and the run completes (${checks2.done}; ${checks2.state})`],
    [/Die prüfende Person hat die Prüfung übersprungen\./.test(checks2.report || ""), "and its report says the review was skipped"],
    [/^Codes, hergestellt in · betrieben in: DE Deutschland, EU anderer EU-Staat, US USA, CN China, AND anderes Land, UNB unbekannt\.$/.test(checks2.key || "") && !!checks2.unknownBlock, `the German review spells out the codes (${checks2.key}; ${checks2.unknownBlock})`],
    [checks2.form?.name === "unbekannt" && checks2.form.country === "" && checks2.form.placeholder === "unbekannt", `an unknown maker reads "unbekannt", its country an empty field that says so (${JSON.stringify(checks2.form)})`],
    [/^Das Rohprotokoll des Aufrufs: /.test(checks2.raw?.note || "") && checks2.raw.lang === "en" && checks2.raw.json === "input,result", `a step's raw record is labelled in German and marked as English (${JSON.stringify(checks2.raw)})`],
    [checks2.unchanged === "Nichts geändert: Ändern Sie ein Feld oder brechen Sie ab." && /^Anbieter und Betreiber brauchen je einen Namen\./.test(checks2.noName || ""), `applied unchanged it changes nothing, and an empty name is refused (${checks2.unchanged}; ${checks2.noName})`]
  ]);
}

// ---- levers ----------------------------------------------------------------------------------------------------------
if (wanted("levers")) {
  const t = await newPage({ lang: "en" });
  const { page } = t;
  const checks = {};
  try {
    await startSim(page, "online-ausweis");
    await toReview(page);
    await page.click("#btn-review-confirm");
    await waitState(page, ["awaiting_decision"]);
    await page.waitForSelector('.lever-card[data-lever="keep"]');
    checks.atLevers = await recompute(page);
    checks.cards = await page.$$eval(".lever-card", (els) => els.map((e) => e.dataset.lever));
    checks.approveDisabled = await page.$eval("#btn-approve-lever", (b) => b.disabled);
    await page.click("#btn-approve-lever", { force: true }).catch(() => {});
    checks.decisionsBeforeChoice = await page.evaluate(() => window.__ev.filter((e) => e.type === "lever_decision").length);
    checks.whatIf = await page.$eval('.lever-card[data-lever="L1"] [data-fact="whatif.L1.overall"]', (el) => el.textContent.trim());
    // Both scores on the cards say "indicative" (the review's finding R-28).
    checks.scoreLabels = await page.$$eval('.lever-card[data-lever="L1"] dt, .lever-card[data-lever="keep"] dt', (els) => els.map((e) => e.textContent.trim()));
    await page.click('.lever-card[data-lever="L1"] .lever-id');
    checks.approveEnabled = await page.$eval("#btn-approve-lever", (b) => !b.disabled);
    checks.tileWhileChoosing = await text(page, "#kpi-overall-value");
    await shot(page, "levers.png");
    await page.click("#btn-approve-lever");
    await waitState(page, TERMINAL);
    checks.final = await recompute(page);
    await page.click("#tab-outbox");
    await page.waitForSelector('.outbox-card[data-draft="memo"]');
    checks.memo = await page.$eval('.outbox-card[data-draft="memo"]', (el) => ({ note: el.querySelector(".outbox-status")?.textContent.trim(), text: el.querySelector(".md")?.innerText || "" }));
    checks.whatIfFacts = await page.evaluate(() => window.__ev.filter((e) => e.type === "levers").map((e) => e.payload.levers.map((l) => l.whatif?.facts?.["whatif.L1.overall"] ?? l.whatif?.facts?.[`whatif.${l.lever_id}.overall`])));
  } catch (err) { checks.FAILED = String(err.message).split("\n").slice(0, 3).join(" "); }
  const at = checks.atLevers || {};
  const fin = checks.final || {};
  await finish("levers: at most three plus Keep as is, Approve needs a choice, a what-if never changes the assessment, the memo is a draft", t, checks, [
    [Array.isArray(checks.cards) && checks.cards.length >= 2 && checks.cards.length <= 4 && checks.cards.filter((c) => c === "keep").length === 1 && checks.cards[checks.cards.length - 1] === "keep", `at most three levers plus Keep as is (${JSON.stringify(checks.cards)})`],
    [checks.approveDisabled === true && checks.decisionsBeforeChoice === 0 && checks.approveEnabled === true, "Approve needs a choice"],
    [checks.scoreLabels?.includes("Overall score with the lever, indicative") && checks.scoreLabels.includes("Overall score now, indicative"), `the cards' scores say "indicative" (${JSON.stringify(checks.scoreLabels)})`],
    [close9(fin.overall, at.overall) && close9(fin.published, at.published) && checks.tileWhileChoosing === at.tileExpected && fin.tile === at.tileExpected, `the what-if leaves the assessment unchanged (overall ${at.overall} before and ${fin.overall} after; what-if ${checks.whatIf})`],
    [checks.memo?.note === "Draft. Nothing is sent." && /Decision: lever L1/.test(checks.memo.text) && new RegExp(`with the lever`).test(checks.memo.text), "the memo for L1 lands in the Outbox as a draft, with the what-if figure"]
  ]);
}

// ---- report ---------------------------------------------------------------------------------------------------------
for (const r of results) {
  if (r.summaryOnly) { console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`); continue; }
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  if (!r.ok) {
    for (const p of r.problems) console.log(`      - ${p}`);
    for (const e of r.pageErrors) console.log(`      - page error: ${e}`);
    for (const e of r.consoleErrors) console.log(`      - console error: ${e}`);
    for (const e of r.csp) console.log(`      - policy violation: ${e}`);
  }
}
await writeFile(path.join(OUT, "sims-results.json"), JSON.stringify(results, null, 2));
const cases = results.filter((r) => !r.summaryOnly && !/^play /.test(r.name) || r.summaryOnly);
const failed = cases.filter((r) => !r.ok).length;
console.log(`\n${cases.length - failed}/${cases.length} sims cases passed. Screenshots: ${OUT}`);
if (!failed && ONLY.length === 0) console.log("SIMS OK");
await browser.close();
await close();
process.exit(failed ? 1 : 0);
