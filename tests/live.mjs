// The live agent in the browser against a scripted stand-in for the Claude API (tests/lib/fake-claude.mjs),
// with web search and web fetch: no test calls the real API or spends anything (brief §15).
//   key             AC-07: the key, checked with GET /v1/models, lives only under sa.anthropic.key in session
//                   storage; it never appears in local storage, the audit export, a recording ("Save run as
//                   simulation"), the page or the console; Forget key removes it
//   protocol        AC-08: search and fetch blocks echoed unchanged with encrypted_content and citations;
//                   pause_turn resent unchanged; a mixed turn answered with tool_result blocks only; in-result
//                   errors (max_uses_exceeded, url_not_accessible) handled; searches and fetches counted
//                   across turns; the tools array the same in every request; a whole assessment with review,
//                   lever choice, memo and report
//   nudges          AC-08: at most two nudges, each saying what is left of the budgets; then the run stops
//   disabled-search AC-08: a 400 for a switched-off web search stops Live cleanly and offers Simulation
//   disabled-fetch  the same for web fetch
//   evidence        AC-09: a quote in the fetched text counts; a quote found nowhere leaves its fields
//                   unknown and marks the block; a PDF's quote counts through a page_location citation
//                   mapped by the document registry; an unmapped citation counts for nothing; an evidence URL
//                   the run never returned is refused with is_error and the URLs the run may use
//   caps            AC-10: no 41st model call; none once €3 is spent
//   cost            AC-10: the cost meter equals usage × price plus searches × $0.01, to within 1e-9
//   guardrails      the sequence rules (no memo before a decision, no assessed report before the review, no
//                   review before every layer has blocks or a status) and the fact audit's two retries,
//                   then the Unchecked tag
//   not-a-service   rule 7: a person's name ends with not_a_service and no blocks
// Every case fails on a page error, an unexpected console error, a policy violation, a request to any host
// but the stand-in, or a protocol violation the stand-in found.
// Usage: node tests/live.mjs [case…]
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, NETWORK_NOISE, MOCK_KEY, SKIP_INTRO, KEYS } from "./lib/harness.mjs";
import { createFakeClaude, text, tool, search, searchError, fetchText, fetchPdf, fetchError, resultFor } from "./lib/fake-claude.mjs";

const { MODELS, FX_USD_EUR, ANTHROPIC } = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const OUT = await outDir("live");
const { base: BASE, close } = await serveStatic(APP_ROOT, 8767);
const browser = await launchBrowser();
const results = [];
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-expose-headers": "*" };
const MODELS_LIST = { data: MODELS.map((m) => ({ id: m.id, type: "model", display_name: m.label, capabilities: { server_tools: { web_search: { supported: true } } } })), has_more: false };

async function newPage(fake, { viewport = { width: 1600, height: 900 }, lang = "en" } = {}) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  await context.addInitScript(SKIP_INTRO);
  await context.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`.trim()));
  });
  const external = [];
  const api = [];
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (u.host !== "api.anthropic.com") { external.push(`${req.method()} ${u.host}${u.pathname}`); return route.abort("blockedbyclient"); }
    api.push(`${req.method()} ${u.pathname}`);
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const key = req.headers()["x-api-key"];
    if (u.pathname === "/v1/models") {
      return route.fulfill({ status: key === MOCK_KEY ? 200 : 401, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(key === MOCK_KEY ? MODELS_LIST : { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }) });
    }
    const out = fake.handle(req.postData() || "{}", req.headers());
    return route.fulfill({ status: out.status, headers: { ...CORS, ...out.headers }, body: out.body });
  });
  const page = await context.newPage();
  const log = { pageErrors: [], consoleErrors: [], console: [] };
  page.on("pageerror", (e) => log.pageErrors.push(String(e.message || e)));
  page.on("console", (m) => { log.console.push(m.text()); if (m.type() === "error") log.consoleErrors.push(m.text()); });
  await page.goto(`${BASE}?lang=${lang}`);
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  return { context, page, log, external, api, fake };
}

async function finish(name, t, checks, expectations, { allowConsole = null } = {}) {
  const csp = await t.page.evaluate(() => window.__csp || []).catch(() => ["<page gone>"]);
  const consoleErrors = t.log.consoleErrors.filter((x) => !NETWORK_NOISE.test(x) && !(allowConsole && allowConsole.test(x)));
  const problems = expectations.filter(([ok]) => !ok).map(([, msg]) => msg);
  if (checks.FAILED) problems.unshift(`exception: ${checks.FAILED}`);
  if (t.external.length) problems.push(`requests to other hosts: ${t.external.join(", ")}`);
  if (t.fake.violations.length) problems.push(`protocol: ${t.fake.violations.join("; ")}`);
  const ok = !problems.length && !t.log.pageErrors.length && !consoleErrors.length && !csp.length;
  results.push({ name, ok, problems, checks, pageErrors: t.log.pageErrors, consoleErrors, csp });
  await t.context.close();
}

const shot = (page, file) => page.screenshot({ path: path.join(OUT, file) });
const textOf = (page, sel) => page.$eval(sel, (el) => el.textContent.replace(/\s+/g, " ").trim()).catch(() => null);
const allText = (page, sel) => page.$$eval(sel, (els) => els.map((el) => el.textContent.replace(/\s+/g, " ").trim())).catch(() => []);

/** From a catalogue entry (or a typed text) to a running live run, with the mock key. */
async function startLive(page, { entry = null, typed = null } = {}) {
  if (entry) await page.click(`.catalogue-chip[data-entry="${entry}"]`);
  else { await page.fill("#service-input", typed); await page.keyboard.press("Escape"); }
  await page.click("#btn-start");
  await page.waitForSelector(".mode-card");
  await page.click('.mode-card[data-mode="live"] .mode-cta button');
  const keyDialog = await page.waitForSelector("#api-key-input", { timeout: 3000 }).catch(() => null);
  if (keyDialog) {
    await page.fill("#api-key-input", MOCK_KEY);
    await page.click("#btn-check-key");
    await page.waitForSelector("#api-key-input", { state: "detached" });
  }
}
const ended = (page, timeout = 60000) => page.waitForFunction(() => /^(Done|Stopped|Aborted|Error)$/.test(document.querySelector("#status-pill")?.textContent.trim() || ""), null, { timeout });
async function download(page, selector) {
  // The buttons live in the drawer's Audit tab.
  if (!(await page.isVisible(selector))) await page.click("#tab-audit");
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 10000 }), page.click(selector)]);
  return readFile(await dl.path(), "utf8");
}
async function reviewConfirm(page) {
  await page.waitForSelector("#btn-review-confirm", { timeout: 30000 });
  await page.click("#btn-review-confirm");
}
async function chooseLever(page, id) {
  await page.waitForSelector(`.lever-card[data-lever="${id}"]`, { timeout: 30000 });
  await page.click(`.lever-card[data-lever="${id}"] .lever-id`);
  await page.click("#btn-approve-lever");
}

const FACTS_PROFILE = (url, quote) => ({ names: ["BundID"], category: "base_service", what: "The federal user account for online services.", how: "People sign in with the account and prove who they are.", owner: { name: "BMDS", country: "DE", parent: null }, operator: { name: "ITZBund", country: "DE", parent: null }, status: "In operation.", evidence: [{ url, title: "BundID", quote, lang: "en", supports: ["operator", "status"] }] });
const ID_URL = "https://id.bund.de/en/";
const PAGE = "BundID is the federal user account. The account is operated by the ITZBund in its data centres in Germany. Imprint: implementation by the AKDB.";

// ---- protocol -----------------------------------------------------------------------------------------------
if (wanted("protocol")) {
  const AKDB = { url: "https://www.akdb.de/bundid-referenz", title: "AKDB: BundID" };
  const ITZ = { url: "https://www.itzbund.de/bundid", title: "ITZBund: BundID" };
  const cat = tool("cat_lookup", { query: "BundID" });
  const s1 = search("BundID Betrieb ITZBund", [ITZ]);
  const f1 = fetchText(ID_URL, "BundID", PAGE);
  const profile = tool("rec_profile", FACTS_PROFILE(ID_URL, "The account is operated by the ITZBund"));
  const s2 = search("BundID AKDB", [AKDB]);
  const errS = searchError("BundID Quelltext", "max_uses_exceeded");
  const errF = fetchError("https://example.org/missing", "url_not_accessible");
  const b1 = tool("rec_block", { layer: "infrastructure", name: "Data centres of the ITZBund", role: "Hosts the account", criticality: "critical", tech: { name: "ITZBund", country: "DE", parent: null }, operator: { name: "ITZBund", country: "DE", parent: null }, hosting: "EU", licence: "unknown", exit: "possible", confidence: "high", evidence: [{ url: ID_URL, title: "BundID", quote: "operated by the ITZBund in its data centres in Germany", lang: "en", supports: ["tech", "operator", "hosting"] }] });
  const b2 = tool("rec_block", { layer: "devsecops", name: "Container platform software", role: "Runs the account's services", criticality: "critical", tech: { name: "Vendor Inc.", country: "US", parent: null }, operator: { name: "ITZBund", country: "DE", parent: null }, hosting: "EU", licence: "proprietary", exit: "hard", confidence: "medium", evidence: [{ url: AKDB.url, title: AKDB.title, lang: "en", supports: ["tech", "licence"] }, { url: ID_URL, title: "BundID", quote: "operated by the ITZBund", lang: "en", supports: ["operator", "hosting"] }] });
  const layers = ["platform", "base_service", "applications", "access"].map((layer) => tool("rec_layer", { layer, status: "no_evidence", reason: "No public source was found for this layer." }));
  const score = tool("eng_score", {});
  const review = tool("ui_request_review", { summary: "Please review the findings. The weakest critical link is {{fact:weakest.block}}." });
  const whatif = tool("eng_whatif", { lever_id: "L1", changes: [{ block_id: "B-02", made_in: "EU" }] });
  const levers = tool("ui_propose_levers", { levers: [{ lever_id: "L1", title: "A European technology provider", rationale: "With a provider from the EU the score would reach {{fact:whatif.L1.overall}}.", changes: [{ block_id: "B-02", made_in: "EU" }], evidence: [{ url: AKDB.url, title: AKDB.title, lang: "en", supports: ["alternative"] }] }] });
  const memo = tool("ui_draft_memo", { lever_id: "L1", subject: "Proposal: a European technology provider", body: "We propose to check a provider from the EU for the container platform." });
  const report = tool("ui_final_report", { outcome: "assessed", markdown: "# BundID\n\nThe overall score is {{fact:score.overall}}, indicative. The weakest critical link is {{fact:weakest.block}}." });
  const fake = createFakeClaude([
    { blocks: [text("I look the service up in the catalogue."), cat], stop: "tool_use", usage: { input_tokens: 3000, output_tokens: 200 } },
    // A mixed turn: a search, a fetch, a cited sentence and a client tool in one response.
    { blocks: [...s1, ...f1, text("According to its page, the ITZBund operates the account.", [{ type: "char_location", document_index: 0, document_title: "BundID", start_char_index: 39, end_char_index: 96, cited_text: "The account is operated by the ITZBund in its data centres in Germany." }]), profile], stop: "tool_use", usage: { input_tokens: 9000, output_tokens: 700, web_search_requests: 1, web_fetch_requests: 1 },
      expect: (req, { check }) => check(resultFor(req, cat.id)?.parsed?.entries?.[0]?.id === "bundid", "cat_lookup answered with the catalogue entry") },
    // A server tool paused the turn: the agent resends the conversation unchanged.
    { blocks: [...s2], stop: "pause_turn", usage: { input_tokens: 9500, output_tokens: 100, web_search_requests: 1 } },
    { blocks: [...errS, ...errF, text("The AKDB developed the account software.", [{ type: "web_search_result_location", url: AKDB.url, title: AKDB.title, cited_text: "The AKDB developed the BundID account software for the federal government.", encrypted_index: "eidx" }]), b1, b2], stop: "tool_use", usage: { input_tokens: 10000, output_tokens: 900 } },
    { blocks: [...layers], stop: "tool_use", usage: { input_tokens: 11000, output_tokens: 400 } },
    { blocks: [score], stop: "tool_use", usage: { input_tokens: 11500, output_tokens: 100 } },
    { blocks: [review], stop: "tool_use", usage: { input_tokens: 12000, output_tokens: 200 } },
    { blocks: [whatif], stop: "tool_use", usage: { input_tokens: 12500, output_tokens: 150 } },
    { blocks: [levers], stop: "tool_use", usage: { input_tokens: 13000, output_tokens: 300 } },
    { blocks: [memo], stop: "tool_use", usage: { input_tokens: 13500, output_tokens: 300 } },
    { blocks: [report], stop: "tool_use", usage: { input_tokens: 14000, output_tokens: 400 } },
    { blocks: [text("The assessment is published.")], stop: "end_turn", usage: { input_tokens: 14500, output_tokens: 20 } }
  ]);
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { entry: "bundid" });
    await reviewConfirm(page);
    checks.tilesBefore = await allText(page, ".kpi-value");
    await chooseLever(page, "L1");
    await ended(page);
    checks.pill = await textOf(page, "#status-pill");
    checks.tilesAfter = await allText(page, ".kpi-value");
    checks.requests = fake.requests.length;
    const last = fake.requests[fake.requests.length - 1].req;
    const r4 = fake.requests[4].req;
    checks.b1 = resultFor(r4, b1.id)?.parsed?.evidence?.map((e) => e.via);
    checks.b2 = resultFor(r4, b2.id)?.parsed?.evidence?.map((e) => e.via);
    checks.b2level = resultFor(r4, b2.id)?.parsed?.level;
    checks.lastHasReport = !!resultFor(last, report.id)?.parsed?.published;
    checks.facts = await textOf(page, ".run-facts");
    checks.failed = await allText(page, '.entry[data-tool="web_search"] .result-summary, .entry[data-tool="web_fetch"] .result-summary');
    checks.budgetNotice = (await allText(page, '.entry[data-type="notice"]')).filter((x) => /searches of this turn are used up/.test(x)).length;
    checks.outbox = await allText(page, ".outbox-card");
    checks.memoDraft = (checks.outbox[0] || "").includes("Draft. Nothing is sent.");
    const audit = JSON.parse(await download(page, "#btn-export-audit"));
    checks.audit = audit.totals;
    checks.auditPageText = JSON.stringify(audit).includes("in its data centres in Germany. Imprint");
    checks.auditEncrypted = JSON.stringify(audit).includes("enc:");
    await shot(page, "protocol.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("protocol: server-tool blocks echoed, pause_turn, a mixed turn, in-result errors, counts, a whole assessment", t, checks, [
    [checks.requests === 12, `twelve model calls (${checks.requests})`],
    [checks.pill === "Done", `the run is done (${checks.pill})`],
    [JSON.stringify(checks.b1) === JSON.stringify(["fetched_text"]), `a quote in the fetched page counts (${JSON.stringify(checks.b1)})`],
    [JSON.stringify(checks.b2) === JSON.stringify(["citation", "fetched_text"]) && checks.b2level === 2, `a search-result quote counts through its citation (${JSON.stringify(checks.b2)}, level ${checks.b2level})`],
    [checks.lastHasReport, "the report was published"],
    [/3 web searches/.test(checks.facts || "") && /2 pages read/.test(checks.facts || "") && /Model calls 12 of 40/.test(checks.facts || ""), `searches and fetches counted across turns (${checks.facts})`],
    [checks.failed.some((x) => /max_uses_exceeded/.test(x)) && checks.failed.some((x) => /url_not_accessible/.test(x)) && checks.budgetNotice === 1, `in-result errors shown (${JSON.stringify(checks.failed)})`],
    [JSON.stringify(checks.tilesBefore) === JSON.stringify(checks.tilesAfter), `a what-if never changes the tiles (${JSON.stringify(checks.tilesBefore)} → ${JSON.stringify(checks.tilesAfter)})`],
    [checks.memoDraft && checks.outbox.length === 2, "the memo and the report are in the Outbox as drafts"],
    [checks.audit?.model_calls === 12 && checks.audit?.web_searches === 3 && checks.audit?.web_fetches === 2 && checks.audit?.web_searches_billed === 2 && checks.audit?.model === "claude-sonnet-5-5", `the audit export shows model, calls, searches and fetches (${JSON.stringify(checks.audit)})`],
    [checks.auditPageText === false && checks.auditEncrypted === false, "the audit export holds no page text and no encrypted content"]
  ]);
}

// ---- nudges ---------------------------------------------------------------------------------------------------
if (wanted("nudges")) {
  const fake = createFakeClaude([
    { blocks: [text("I would like to ask you which ministry you mean.")], stop: "end_turn" },
    { blocks: [text("Should I continue?")], stop: "end_turn" },
    { blocks: [text("I will wait for your answer.")], stop: "end_turn" }
  ]);
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { entry: "fit-connect" });
    await ended(page);
    await page.waitForTimeout(800);
    checks.pill = await textOf(page, "#status-pill");
    checks.requests = fake.requests.length;
    checks.nudges = fake.nudges().map((m) => (Array.isArray(m.content) ? m.content.filter((b) => b.type === "text").map((b) => b.text).join(" ") : m.content));
    checks.notices = (await allText(page, '.entry[data-type="notice"]')).filter((x) => /asked to continue|ended its turn twice/.test(x)).length;
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("nudges: at most two, each with the budgets left, then the run stops", t, checks, [
    [checks.requests === 3, `three model calls (${checks.requests})`],
    [checks.nudges?.length === 2 && checks.nudges.every((n) => /Budgets left in this run: \d+ model calls and €\d+\.\d\d/.test(n) && /this new turn allows up to 12 searches and 10 fetches/.test(n)), `two nudges with the budgets left (${JSON.stringify(checks.nudges)})`],
    [checks.pill === "Stopped" && checks.notices === 3, `the run stops after the second nudge (${checks.pill}, ${checks.notices} notices)`]
  ]);
}

// ---- disabled-search, disabled-fetch ---------------------------------------------------------------------------
for (const [name, message, says] of [["disabled-search", "web search is not enabled for this organization", /Web search is switched off/], ["disabled-fetch", "web fetch is not enabled for this organization", /Web fetch is switched off/]]) {
  if (!wanted(name)) continue;
  const fake = createFakeClaude([{ error: { status: 400, type: "invalid_request_error", message } }]);
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { entry: "bundid" });
    await ended(page);
    await page.waitForTimeout(1500);
    checks.pill = await textOf(page, "#status-pill");
    checks.requests = fake.requests.length;
    checks.notice = (await allText(page, '.entry[data-type="notice"][data-level="error"]')).join(" | ");
    checks.key = await page.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish(`${name}: a 400 stops Live cleanly and offers Simulation`, t, checks, [
    [checks.requests === 1, `one request, no retry and nothing after it (${checks.requests})`],
    [checks.pill === "Stopped", `the run stops (${checks.pill})`],
    [says.test(checks.notice || "") && /Simulation mode replays the pre-run assessments without a key/.test(checks.notice || ""), `the message says why and offers Simulation (${checks.notice})`],
    [checks.key === MOCK_KEY, "the key stays: it was not rejected"]
  ]);
}

// ---- evidence ----------------------------------------------------------------------------------------------------
if (wanted("evidence")) {
  const URL1 = "https://www.example-operator.de/plattform";
  const PDF = "https://www.example-operator.de/bericht.pdf";
  const f1 = fetchText(URL1, "Plattform", "The platform runs in the EU. It is operated by Example GmbH in Berlin.");
  const f2 = fetchPdf(PDF, "Bericht 2026");
  const good = tool("rec_block", { layer: "platform", name: "Integration platform", role: "Connects the services", criticality: "critical", tech: { name: "Nobody Corp.", country: "US", parent: null }, operator: { name: "Example GmbH", country: "DE", parent: null }, hosting: "EU", licence: "proprietary", exit: "possible", confidence: "medium",
    evidence: [{ url: URL1, title: "Plattform", quote: "It is operated by Example GmbH in Berlin.", lang: "en", supports: ["operator"] }, { url: URL1, title: "Plattform", quote: "The platform is made by Nobody Corp.", lang: "en", supports: ["tech", "licence"] }, { url: PDF, title: "Bericht 2026", lang: "de", supports: ["hosting"] }] });
  const stray = tool("rec_block", { layer: "access", name: "Web portal", role: "Shows the forms", criticality: "important", tech: { name: "X", country: "DE", parent: null }, operator: { name: "X", country: "DE", parent: null }, hosting: "EU", licence: "unknown", exit: "unknown", confidence: "low", evidence: [{ url: "https://never-returned.example/page", title: "Never", quote: "X runs it.", lang: "en", supports: ["operator"] }] });
  const end = tool("ui_final_report", { outcome: "stopped", markdown: "The test stops here." });
  const fake = createFakeClaude([
    { blocks: [...f1, ...f2, text("The report says where it is hosted.", [{ type: "page_location", document_index: 1, document_title: "Bericht 2026", start_page_number: 3, end_page_number: 3, cited_text: "Die Plattform wird in Rechenzentren in Frankfurt am Main betrieben." }, { type: "char_location", document_index: 7, document_title: "Unknown", start_char_index: 0, end_char_index: 9, cited_text: "Run by Nobody Corp." }]), good, stray], stop: "tool_use", usage: { web_fetch_requests: 2 } },
    { blocks: [end], stop: "tool_use" },
    { blocks: [text("Stopped.")], stop: "end_turn" }
  ]);
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { typed: "Example platform" });
    await ended(page);
    const r2 = fake.requests[1].req;
    const g = resultFor(r2, good.id);
    const s = resultFor(r2, stray.id);
    checks.good = { error: !!g?.is_error, unknown: (g?.parsed?.unknown_fields || []).map((u) => u.field), via: (g?.parsed?.evidence || []).map((e) => `${e.via}${e.verified ? "" : ":unverified"}`), made: g?.parsed?.made_in, level: g?.parsed?.level, partly: g?.parsed?.partly_unknown };
    checks.stray = { error: !!s?.is_error, allowed: s?.parsed?.allowed_urls, refused: s?.parsed?.refused_urls };
    await page.click("#tab-blocks");
    await page.click('tr[data-block="B-01"] .row-toggle');
    checks.row = await textOf(page, 'tr[data-block="B-01"]');
    checks.evidence = await allText(page, ".evidence-item .ev-tag");
    checks.cell = await page.getAttribute('.hc-cell[data-block="B-01"]', "data-partly");
    await shot(page, "evidence.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("evidence: verified quotes count, a quote found nowhere leaves its fields unknown, an unreturned URL is refused", t, checks, [
    [checks.good && !checks.good.error && JSON.stringify(checks.good.via) === JSON.stringify(["fetched_text", "none:unverified", "citation"]), `fetched text, nowhere, and a PDF through its mapped citation (${JSON.stringify(checks.good?.via)})`],
    [JSON.stringify(checks.good?.unknown) === JSON.stringify(["tech", "licence", "exit"]) && checks.good?.made === "UNKNOWN" && checks.good?.level === 2 && checks.good?.partly === true, `the fields without a verified quote count as unknown and mark the block (${JSON.stringify(checks.good)})`],
    [checks.stray?.error && JSON.stringify(checks.stray.refused) === JSON.stringify(["https://never-returned.example/page"]) && Array.isArray(checks.stray.allowed) && checks.stray.allowed.length >= 2 && !checks.stray.allowed.includes("https://never-returned.example/page"), `an unreturned URL is refused with is_error and the allowed URLs (${JSON.stringify(checks.stray)})`],
    [/unverified/.test(checks.row || "") && checks.evidence.filter((x) => /quote not verified/.test(x)).length === 1 && checks.cell === "true", `the block shows its unknowns (${checks.row}; ${JSON.stringify(checks.evidence)})`]
  ]);
}

// ---- caps ----------------------------------------------------------------------------------------------------------
if (wanted("caps")) {
  const checks = {};
  // Forty calls, then the run stops: the stand-in answers every call with another tool call.
  const looping = createFakeClaude((n) => ({ blocks: [tool("ui_progress", { text: "Still researching." })], stop: "tool_use", usage: { input_tokens: 100, output_tokens: 10 } }));
  const t = await newPage(looping);
  try {
    await startLive(t.page, { entry: "bundid" });
    await ended(t.page, 120000);
    await t.page.waitForTimeout(1000);
    checks.calls = looping.requests.length;
    checks.pill = await textOf(t.page, "#status-pill");
    checks.notice = (await allText(t.page, '.entry[data-type="notice"]')).find((x) => /model calls/.test(x)) || null;
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  // The cost cap: one expensive call (400,000 output tokens on Sonnet 5.5 is $4.00, €3.58) and nothing after it.
  const costly = createFakeClaude([
    { blocks: [tool("ui_progress", { text: "I start with the catalogue." })], stop: "tool_use", usage: { input_tokens: 1000, output_tokens: 400000 } },
    { blocks: [text("This call must never happen.")], stop: "end_turn" }
  ]);
  const t2 = await newPage(costly);
  try {
    await startLive(t2.page, { entry: "bundid" });
    await ended(t2.page);
    await t2.page.waitForTimeout(1000);
    checks.costCalls = costly.requests.length;
    checks.costPill = await textOf(t2.page, "#status-pill");
    checks.costNotice = (await allText(t2.page, '.entry[data-type="notice"]')).find((x) => /cost cap/.test(x)) || null;
  } catch (err) { checks.FAILED = checks.FAILED || String(err.message).split("\n")[0]; }
  await t2.context.close();
  t.fake.violations.push(...costly.violations);
  await finish("caps: no 41st model call, and none once €3 is spent", t, checks, [
    [checks.calls === 40 && checks.pill === "Stopped" && !!checks.notice, `forty calls, then the run stops (${checks.calls}, ${checks.pill}, ${checks.notice})`],
    [checks.costCalls === 1 && checks.costPill === "Stopped" && !!checks.costNotice, `no call after €3 is spent (${checks.costCalls}, ${checks.costPill}, ${checks.costNotice})`]
  ]);
}

// ---- cost ------------------------------------------------------------------------------------------------------------
if (wanted("cost")) {
  const usages = [
    { input_tokens: 4321, output_tokens: 987, cache_creation_input_tokens: 2048, cache_read_input_tokens: 0, web_search_requests: 2, web_fetch_requests: 1 },
    { input_tokens: 1234, output_tokens: 3456, cache_creation_input_tokens: 0, cache_read_input_tokens: 8192, web_search_requests: 3, web_fetch_requests: 0 },
    { input_tokens: 777, output_tokens: 55, cache_creation_input_tokens: 0, cache_read_input_tokens: 9000, web_search_requests: 0, web_fetch_requests: 0 }
  ];
  const fake = createFakeClaude([
    { blocks: [tool("ui_progress", { text: "I look for the service." })], stop: "tool_use", usage: usages[0] },
    { blocks: [tool("ui_final_report", { outcome: "stopped", markdown: "The test stops here." })], stop: "tool_use", usage: usages[1] },
    { blocks: [text("Stopped.")], stop: "end_turn", usage: usages[2] }
  ]);
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { entry: "bundid" });
    await ended(page);
    const audit = JSON.parse(await download(page, "#btn-export-audit"));
    checks.eur = audit.totals.cost_eur;
    checks.usd = audit.totals.cost_usd;
    const p = MODELS.find((m) => m.id === "claude-sonnet-5-5").price;
    const usd = usages.reduce((s, u) => s + (u.input_tokens * p.input + u.output_tokens * p.output + u.cache_creation_input_tokens * p.cacheWrite + u.cache_read_input_tokens * p.cacheRead) / 1e6 + u.web_search_requests * (ANTHROPIC.webSearchUsdPer1000 / 1000), 0);
    checks.expectedUsd = usd;
    checks.expectedEur = usd * FX_USD_EUR;
    checks.facts = await textOf(page, ".run-facts");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("cost: the meter equals usage × price plus searches × $0.01, to within 1e-9", t, checks, [
    [Math.abs(checks.usd - checks.expectedUsd) < 1e-9 && Math.abs(checks.eur - checks.expectedEur) < 1e-9, `cost ${checks.eur} EUR = ${checks.expectedEur} EUR (${checks.usd} = ${checks.expectedUsd} USD)`],
    [/Cost €0\.\d\d/.test(checks.facts || ""), `the run facts show the cost (${checks.facts})`]
  ]);
}

// ---- guardrails ---------------------------------------------------------------------------------------------------------
if (wanted("guardrails")) {
  const memo = tool("ui_draft_memo", { lever_id: "L1", subject: "Early memo", body: "A memo before any decision." });
  const early = tool("ui_final_report", { outcome: "assessed", markdown: "# Done\nAll done." });
  const review = tool("ui_request_review", { summary: "Please review." });
  const say = () => tool("ui_progress", { text: "Coverage is 75% already." });
  const s1 = say();
  const s2 = say();
  const s3 = say();
  const stop = tool("ui_final_report", { outcome: "stopped", markdown: "The test stops here." });
  const fake = createFakeClaude([
    { blocks: [memo], stop: "tool_use" },
    { blocks: [early], stop: "tool_use" },
    { blocks: [review], stop: "tool_use" },
    { blocks: [s1], stop: "tool_use" },
    { blocks: [s2], stop: "tool_use" },
    { blocks: [s3], stop: "tool_use" },
    { blocks: [stop], stop: "tool_use" },
    { blocks: [text("Stopped.")], stop: "end_turn" }
  ]);
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { entry: "fit-connect" });
    await ended(page);
    const R = (n, id) => resultFor(fake.requests[n].req, id);
    checks.memo = R(1, memo.id);
    checks.early = R(2, early.id);
    checks.review = R(3, review.id);
    checks.s1 = R(4, s1.id);
    checks.s2 = R(5, s2.id);
    checks.s3 = R(6, s3.id);
    checks.unchecked = await allText(page, '.entry[data-type="narration"] .unchecked-tag');
    checks.narration = await allText(page, '.entry[data-type="narration"][data-audit="unchecked"] .narr-text');
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("guardrails: the sequence rules and the fact audit's two retries, then Unchecked", t, checks, [
    [checks.memo?.is_error && /follows the person's lever decision/.test(checks.memo.parsed?.error || ""), "no memo before a lever decision"],
    [checks.early?.is_error && /needs the person's review first/.test(checks.early.parsed?.error || ""), "no assessed report before the review"],
    [checks.review?.is_error && /no building blocks to review/.test(checks.review.parsed?.error || ""), "no review before blocks and layer statuses"],
    [checks.s1?.is_error && checks.s2?.is_error && /outside a placeholder: 75, %/.test(checks.s1.parsed?.error || "") && !checks.s3?.is_error, `the audit refuses a figure twice, then accepts the text (${checks.s1?.parsed?.error?.slice(0, 90)})`],
    [checks.unchecked?.length === 1 && /75%/.test(checks.narration?.[0] || ""), `the accepted text carries the Unchecked tag (${JSON.stringify(checks.unchecked)})`]
  ]);
}

// ---- not-a-service -----------------------------------------------------------------------------------------------------------
async function notAService(fake) {
  return [
    { blocks: [tool("ui_progress", { text: "This names a person, not a digital service or platform." }), tool("ui_final_report", { outcome: "not_a_service", markdown: "The text names a person, not a digital service, so there is nothing to assess." })], stop: "tool_use" },
    { blocks: [text("Nothing to assess.")], stop: "end_turn" }
  ];
}
if (wanted("not-a-service")) {
  const fake = createFakeClaude(await notAService());
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { typed: "Angela Merkel" });
    await ended(page);
    checks.pill = await textOf(page, "#status-pill");
    checks.end = (await allText(page, '.entry[data-type="run"] .run-title')).pop();
    checks.blocks = await page.$$eval(".hc-cell[data-block]", (els) => els.length);
    checks.overall = await textOf(page, "#kpi-overall-value");
    checks.requests = fake.requests.length;
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("not-a-service: a person's name ends the run without blocks", t, checks, [
    [checks.pill === "Done" && /names no digital service/.test(checks.end || ""), `the run ends as not a service (${checks.pill}; ${checks.end})`],
    [checks.blocks === 0 && checks.overall === "no data" && checks.requests === 2, `no blocks, no figures (${checks.blocks}, ${checks.overall}, ${checks.requests} calls)`]
  ]);
}

// ---- key -------------------------------------------------------------------------------------------------------------------
if (wanted("key")) {
  const fake = createFakeClaude(await notAService());
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { typed: "Angela Merkel" });
    await ended(page);
    checks.api = t.api.filter((x) => !x.startsWith("OPTIONS"));
    checks.session = await page.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
    checks.localHasKey = await page.evaluate((key) => Object.keys(localStorage).some((k) => (localStorage.getItem(k) || "").includes(key) || k.includes(key)), MOCK_KEY);
    checks.keys = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
    const audit = await download(page, "#btn-export-audit");
    checks.auditHasKey = audit.includes(MOCK_KEY) || audit.includes("sk-ant-test");
    const recording = await download(page, "#btn-save-simulation");
    checks.recordingHasKey = recording.includes(MOCK_KEY) || recording.includes("sk-ant-test");
    checks.recordingSource = /"source": "recorded"/.test(recording);
    checks.pageHasKey = (await page.content()).includes(MOCK_KEY);
    checks.consoleHasKey = t.log.console.some((x) => x.includes(MOCK_KEY));
    // Forget key: from the mode dialog's "Change or forget key".
    await page.click("#btn-start");
    await page.waitForSelector(".mode-card");
    await page.click("#btn-manage-key");
    await page.waitForSelector("#btn-forget-key:not([hidden])");
    await page.click("#btn-forget-key");
    checks.afterForget = await page.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
    await page.keyboard.press("Escape");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("key: checked with GET /v1/models, session storage only, never in an export, a recording, the page or the console; Forget key", t, checks, [
    [checks.api?.[0] === "GET /v1/models" && checks.api.slice(1).every((x) => x === "POST /v1/messages"), `the key is checked with the free models call first (${JSON.stringify(checks.api)})`],
    [checks.session === MOCK_KEY && checks.localHasKey === false, "the key lives in this tab's session storage only"],
    [checks.keys?.every((k) => k.startsWith("sa.") || k === "vc-theme"), `storage keys sa.* and vc-theme only (${JSON.stringify(checks.keys)})`],
    [checks.auditHasKey === false && checks.recordingHasKey === false && checks.recordingSource === true, "neither the audit export nor the recording holds the key"],
    [checks.pageHasKey === false && checks.consoleHasKey === false, "neither the page nor the console shows the key"],
    [checks.afterForget === null, "Forget key removes it"]
  ]);
}

// ---- report ---------------------------------------------------------------------------------------------------------------------
await browser.close();
await close();
await writeFile(path.join(OUT, "live-results.json"), JSON.stringify(results, null, 2));
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  if (!r.ok) {
    for (const p of r.problems) console.log(`      ${p}`);
    if (r.pageErrors.length) console.log(`      page errors: ${r.pageErrors.join(" | ")}`);
    if (r.consoleErrors.length) console.log(`      console errors: ${r.consoleErrors.join(" | ")}`);
    if (r.csp.length) console.log(`      policy violations: ${r.csp.join(" | ")}`);
    if (r.checks.FAILED) console.log(`      ${JSON.stringify(r.checks).slice(0, 600)}`);
  }
}
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} live cases passed.`);
if (results.length && passed === results.length && ONLY.length === 0) console.log("LIVE OK");
process.exit(results.length && passed === results.length ? 0 : 1);
