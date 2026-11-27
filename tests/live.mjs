// The live agent in the browser against a scripted stand-in for the Claude API (tests/lib/fake-claude.mjs),
// with web search and web fetch: no test calls the real API or spends anything. Each run starts the way a
// presenter starts it (Start agent, the key, Check key and start) and is answered at the Your turn bar.
//   protocol        search and fetch blocks echoed unchanged; pause_turn resent unchanged; a mixed turn
//                   answered with tool_result blocks only; in-result errors handled; a whole assessment with
//                   review, lever, memo and report. On the page: LIVE in the header, the agent's words
//                   marked live, the tiles partial while layers are open (the score says on how many of six
//                   it rests, the weakest link and the share wait), the session cost measured, EN | DE in
//                   place while the agent works with its words kept in the run's language, Stop shown while
//                   it works, the memo a draft and nothing sent
//   nudges          at most two nudges, each saying what is left of the budgets; then the run stops
//   disabled-search a 400 for a switched-off web search stops the run cleanly and says why
//   disabled-fetch  the same for web fetch
//   evidence        a quote in the fetched text counts; a quote found nowhere leaves its fields unknown;
//                   a PDF's quote counts through a mapped citation; an unreturned URL is refused
//   caps            no 41st model call; none once €3 is spent
//   cost            the measured cost equals usage × price plus searches × $0.01, to within 1e-9, and the
//                   Session cost tile shows it as measured
//   guardrails      the sequence rules and the fact audit's two retries; the accepted text is marked unchecked
//   not-a-service   a run that finds no service ends without blocks and says so
//   key             checked with GET /v1/models first; held in the page's memory only, in no storage, never in
//                   the page or the console; a rejected key is forgotten and the dialog says why; Forget key
//   nothing-kept    Vici's storageProblems finds no script that touches storage but the theme and language
//                   modules, and after a whole live run, All services and Compare, the browser holds nothing
//                   but vc-theme, sa.lang and Vici's guide note (storedKeyProblems)
//   cost-tile       in a live run the tile says Session cost and shows the measured cost, in both languages,
//                   and nothing of a replay's words
//   (caps also keeps the visitor's own cap from the live-run dialog)
// Every case fails on a page error, an unexpected console error, a policy violation, a request to any host
// but the stand-in, or a protocol violation the stand-in found.
// Usage: node tests/live.mjs [case…]
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { readdirSync, readFileSync } from "node:fs";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, NETWORK_NOISE, MOCK_KEY, KEYS, viciDir, REQUIRE_VICI } from "./lib/harness.mjs";
import { createFakeClaude, text, tool, search, searchError, fetchText, fetchPdf, fetchError, resultFor } from "./lib/fake-claude.mjs";

const { MODELS, FX_USD_EUR, ANTHROPIC } = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const OUT = await outDir("live");
const { base: BASE, close } = await serveStatic(APP_ROOT, 8767);
const browser = await launchBrowser();
const results = [];
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-expose-headers": "*" };
const MODELS_LIST = { data: MODELS.map((m) => ({ id: m.id, type: "model", display_name: m.label, capabilities: { server_tools: { web_search: { supported: true } } } })), has_more: false };

async function newPage(fake, { viewport = { width: 1600, height: 900 }, lang = "en" } = {}) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`.trim()));
  });
  const external = [];
  const api = [];
  // A request can be held at its index until the test releases it, to look at the page mid-run.
  const holds = new Map();
  const arrived = new Map();
  let posts = 0;
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
    const index = posts++;
    arrived.get(index)?.();
    if (holds.has(index)) await holds.get(index).promise;
    const out = fake.handle(req.postData() || "{}", req.headers());
    return route.fulfill({ status: out.status, headers: { ...CORS, ...out.headers }, body: out.body });
  });
  const holdAt = (index) => { let release; const promise = new Promise((r) => { release = r; }); holds.set(index, { promise }); return release; };
  const held = (index) => new Promise((resolve) => { if (posts > index) resolve(); else arrived.set(index, resolve); });
  const page = await context.newPage();
  const log = { pageErrors: [], consoleErrors: [], console: [] };
  page.on("pageerror", (e) => log.pageErrors.push(String(e.message || e)));
  page.on("console", (m) => { log.console.push(m.text()); if (m.type() === "error") log.consoleErrors.push(m.text()); });
  await page.goto(`${BASE}?lang=${lang}&guide=0&step=understand`);
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  return { context, page, log, external, api, fake, holdAt, held };
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
/** The run as the presenter digests it (js/run.js), read from the page. */
const run = (page) => page.evaluate(() => {
  const r = window.sovereignty.S.run;
  return { end: r.end?.status || null, notices: (r.notices || []).map((n) => ({ level: n.level, key: n.key })), memo: r.memo?.status || null, cost: r.cost || null, blocks: r.blockList?.length || 0, narration: r.narration.map((m) => ({ text: m.text, audit: m.audit })), mode: window.sovereignty.S.mode };
});
/** The run's end, as a word: Done or Stopped. */
const PILL = { done: "Done", not_a_service: "Done", stopped: "Stopped", aborted: "Aborted", error: "Error" };
const pill = async (page) => PILL[(await run(page)).end] || null;

/** From a case to a running live run, the way a presenter starts it: Start agent, the key, the box, start. */
async function startLive(page, { entry = "bundid", key = MOCK_KEY, cap = null } = {}) {
  if (entry !== "bundid") await page.evaluate((id) => window.sovereignty.openCase(window.SA_CATALOGUE.entries.find((e) => e.id === id), 0), entry);
  await page.click("#start");
  await page.waitForSelector("#start-dialog[open]");
  await page.fill("#live-key", key);
  if (cap !== null) await page.$eval("#live-cap", (el, v) => { el.value = String(v); el.dispatchEvent(new Event("input", { bubbles: true })); }, cap);
  await page.check("#live-ack");
  await page.click("#live-start");
  if (key === MOCK_KEY) await page.waitForFunction(() => window.sovereignty.S.mode === "live", null, { timeout: 10000 });
}
const ended = (page, timeout = 60000) => page.waitForFunction(() => !!window.sovereignty.S.run?.end && !window.sovereignty.S.live?.isActive(), null, { timeout });
/** The person's turn at the bar: waits until the page asks for `act`, then presses the primary action. */
async function turn(page, act, timeout = 30000) {
  await page.waitForFunction((a) => { const s = window.sovereignty.S; const st = s.view.steps.find((x) => x.waits && x.turn?.act === a); if (st) s.view && window.sovereignty.go(s.view.steps.indexOf(st), { focus: false }); return !!st; }, act, { timeout });
  await page.waitForFunction((a) => document.getElementById("turn-primary").dataset.act === a, act, { timeout: 5000 });
  await page.click("#turn-primary");
}
const reviewConfirm = (page) => turn(page, "confirm");
const chooseLever = (page) => turn(page, "approve");
const approveMemo = (page) => turn(page, "memo-approve");
/** The notices of the run whose key matches. */
const noticed = async (page, re) => (await run(page)).notices.filter((n) => re.test(n.key));

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
  const say = tool("ui_progress", { text: "Two layers have blocks; I look at the other four now." });
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
    { blocks: [...errS, ...errF, text("The AKDB developed the account software.", [{ type: "web_search_result_location", url: AKDB.url, title: AKDB.title, cited_text: "The AKDB developed the BundID account software for the federal government.", encrypted_index: "eidx" }]), b1, b2, say], stop: "tool_use", usage: { input_tokens: 10000, output_tokens: 900 } },
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
  // The fifth request carries the results of the first two blocks: held there, the run has two of six layers.
  const release = t.holdAt(4);
  try {
    await startLive(page);
    await t.held(4);
    await page.waitForFunction(() => window.sovereignty.S.run?.blockList?.length === 2, null, { timeout: 10000 });
    await page.waitForTimeout(300);
    checks.header = await textOf(page, "#mode-text");
    checks.note = await textOf(page, "#agent-note");
    checks.stop = await page.isVisible("#stop");
    checks.partial = await page.evaluate(() => ["score", "weakest", "exclusive"].map((k) => document.querySelector(`#kpi-${k} .vc-stat__value`).innerText.replace(/\s+/g, " ").trim()));
    checks.partialNotes = await page.evaluate(() => ["weakest", "exclusive"].map((k) => document.querySelector(`#kpi-${k} .vc-stat__note`).innerText.trim()));
    checks.working = await page.evaluate(() => document.getElementById("turn").dataset.state);
    // EN | DE while the agent works: the page switches in place, the agent's words stay in the run's language.
    await page.evaluate(() => { window.__same = true; });
    await page.click('.lang-option[data-lang="de"]');
    await page.waitForFunction(() => document.documentElement.lang === "de");
    await page.waitForTimeout(300);
    checks.de = await page.evaluate(() => ({ same: window.__same === true, mode: window.sovereignty.S.mode, active: window.sovereignty.S.live?.isActive(), steps: [...document.querySelectorAll("#steps .vc-step__label")].map((e) => e.textContent).join("|"), words: [...document.querySelectorAll("#agent-text p")].map((p) => p.getAttribute("lang")), score: document.querySelector("#kpi-score .vc-stat__value").innerText.replace(/\s+/g, " ").trim() }));
    await page.click('.lang-option[data-lang="en"]');
    await page.waitForFunction(() => document.documentElement.lang === "en-GB");
    release();
    await reviewConfirm(page);
    await chooseLever(page);
    await approveMemo(page);
    await ended(page);
    await page.waitForTimeout(300);
    const r = await run(page);
    checks.pill = PILL[r.end];
    checks.memo = r.memo;
    checks.requests = fake.requests.length;
    const last = fake.requests[fake.requests.length - 1].req;
    const r4 = fake.requests[4].req;
    checks.b1 = resultFor(r4, b1.id)?.parsed?.evidence?.map((e) => e.via);
    checks.b2 = resultFor(r4, b2.id)?.parsed?.evidence?.map((e) => e.via);
    checks.b2level = resultFor(r4, b2.id)?.parsed?.level;
    checks.lastHasReport = !!resultFor(last, report.id)?.parsed?.published;
    checks.complete = await page.evaluate(() => ["score", "weakest", "exclusive"].map((k) => document.querySelector(`#kpi-${k} .vc-stat__value`).innerText.replace(/\s+/g, " ").trim()));
    checks.cost = await page.evaluate(() => ({ value: document.querySelector("#kpi-cost .vc-stat__value").innerText.trim(), note: document.querySelector("#kpi-cost .vc-stat__note").innerText.trim(), eur: window.sovereignty.S.run.cost?.eur }));
    checks.memoText = await page.evaluate(() => [document.querySelector(".memo")?.innerText || "", document.querySelector("#stage-body .outcome")?.innerText || ""].join(" | "));
    checks.log = await page.$$eval("#log-list li", (els) => els.map((e) => e.textContent.trim()));
    await shot(page, "protocol.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; release(); }
  const eur = (x) => `€${Number(x).toFixed(2)}`;
  await finish("protocol: server-tool blocks echoed, pause_turn, a mixed turn, in-result errors, a whole assessment at the Your turn bar", t, checks, [
    [checks.requests === 12, `twelve model calls (${checks.requests})`],
    [checks.pill === "Done", `the run is done (${checks.pill})`],
    [checks.header === "LIVE" && /^live, Claude Sonnet 5\.5$/.test(checks.note || "") && checks.stop && checks.working === "working", `LIVE in the header, the agent's words marked live, Stop shown, the bar says it works (${checks.header}, ${checks.note}, ${checks.stop}, ${checks.working})`],
    [/^(…|\d+ on 2 of 6 layers)$/.test(checks.partial?.[0] || "") && checks.partial?.[1] === "…" && checks.partial?.[2] === "…" && checks.partialNotes?.every((n) => n.length > 5), `on two of six layers the score says so and the other two wait (${JSON.stringify(checks.partial)} ${JSON.stringify(checks.partialNotes)})`],
    [checks.de?.same && checks.de.mode === "live" && checks.de.active && checks.de.steps === "Verstehen|Recherchieren|Bewerten|Ihre Prüfung|Empfehlen" && checks.de.words.length > 0 && checks.de.words.every((l) => l === "en") && /^(…|\d+ auf 2 von 6 Ebenen)$/.test(checks.de.score), `EN | DE switches in place while the agent works; its words stay English (${JSON.stringify(checks.de)})`],
    [JSON.stringify(checks.b1) === JSON.stringify(["fetched_text"]), `a quote in the fetched page counts (${JSON.stringify(checks.b1)})`],
    [JSON.stringify(checks.b2) === JSON.stringify(["citation", "fetched_text"]) && checks.b2level === 2, `a search-result quote counts through its citation (${JSON.stringify(checks.b2)}, level ${checks.b2level})`],
    [checks.lastHasReport, "the report was published"],
    [/ of 6 layers$/.test(checks.complete?.[0] || "") && !checks.complete?.slice(1).includes("…"), `at the end every figure is in (${JSON.stringify(checks.complete)})`],
    [checks.cost?.value === eur(checks.cost?.eur) && /^measured, Sonnet 5\.5$/.test(checks.cost?.note || ""), `the session cost is measured (${JSON.stringify(checks.cost)})`],
    [checks.memo === "approved" && /Draft/.test(checks.memoText || "") && /nothing leaves this page/i.test(checks.memoText || ""), `the memo is a draft, approved, and nothing is sent (${(checks.memoText || "").slice(0, 120)})`],
    [checks.log?.length >= 3 && checks.log.every((l) => /^\d\d:\d\d:\d\d /.test(l)), `the decision log has every decision with its time (${JSON.stringify(checks.log)})`]
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
    checks.pill = await pill(page);
    checks.requests = fake.requests.length;
    checks.nudges = fake.nudges().map((m) => (Array.isArray(m.content) ? m.content.filter((b) => b.type === "text").map((b) => b.text).join(" ") : m.content));
    checks.notices = (await noticed(page, /^notice\.(nudge|ended)$/)).length;
    checks.alert = await textOf(page, "#story-alert");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("nudges: at most two, each with the budgets left, then the run stops", t, checks, [
    [checks.requests === 3, `three model calls (${checks.requests})`],
    [checks.nudges?.length === 2 && checks.nudges.every((n) => /Budgets left in this run: \d+ model calls and €\d+\.\d\d/.test(n) && /this new turn allows up to 12 searches and 10 fetches/.test(n)), `two nudges with the budgets left (${JSON.stringify(checks.nudges)})`],
    [checks.pill === "Stopped" && checks.notices === 3 && /The agent ended its turn twice more/.test(checks.alert || ""), `the run stops after the second nudge and the page says why (${checks.pill}, ${checks.notices} notices, ${checks.alert})`]
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
    await startLive(page);
    await ended(page);
    await page.waitForTimeout(1200);
    checks.pill = await pill(page);
    checks.requests = fake.requests.length;
    checks.alert = await textOf(page, "#story-alert");
    checks.start = await page.isVisible("#start");
    // The key stays in the page's memory: Start agent shows it masked.
    await page.click("#start");
    await page.waitForSelector("#start-dialog[open]");
    checks.key = (await page.isVisible("#live-current")) ? await textOf(page, "#live-masked") : null;
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish(`${name}: a 400 stops the live run cleanly and says why`, t, checks, [
    [checks.requests === 1, `one request, no retry and nothing after it (${checks.requests})`],
    [checks.pill === "Stopped", `the run stops (${checks.pill})`],
    [says.test(checks.alert || "") && checks.start, `the page says why, and Start agent offers the simulation again (${checks.alert})`],
    [checks.key === `${MOCK_KEY.slice(0, 7)}…${MOCK_KEY.slice(-4)}`, `the key stays: it was not rejected (${checks.key})`]
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
    await startLive(page, { entry: "kipitz" });
    await ended(page);
    const r2 = fake.requests[1].req;
    const g = resultFor(r2, good.id);
    const s = resultFor(r2, stray.id);
    checks.good = { error: !!g?.is_error, unknown: (g?.parsed?.unknown_fields || []).map((u) => u.field), via: (g?.parsed?.evidence || []).map((e) => `${e.via}${e.verified ? "" : ":unverified"}`), made: g?.parsed?.made_in, level: g?.parsed?.level, partly: g?.parsed?.partly_unknown };
    checks.stray = { error: !!s?.is_error, allowed: s?.parsed?.allowed_urls, refused: s?.parsed?.refused_urls };
    // On the page: the research table names the block; the maker without a checked quote is not named.
    await page.evaluate(() => window.sovereignty.go(1, { focus: false }));
    await page.waitForTimeout(200);
    checks.row = await page.evaluate(() => [...document.querySelectorAll(".research tbody tr")].map((r) => r.innerText.replace(/\s+/g, " ").trim()).find((x) => /Integration platform/.test(x)) || null);
    await shot(page, "evidence.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("evidence: verified quotes count, a quote found nowhere leaves its fields unknown, an unreturned URL is refused", t, checks, [
    [checks.good && !checks.good.error && JSON.stringify(checks.good.via) === JSON.stringify(["fetched_text", "none:unverified", "citation"]), `fetched text, nowhere, and a PDF through its mapped citation (${JSON.stringify(checks.good?.via)})`],
    [JSON.stringify(checks.good?.unknown) === JSON.stringify(["tech", "licence", "exit"]) && checks.good?.made === "UNKNOWN" && checks.good?.level === 2 && checks.good?.partly === true, `the fields without a verified quote count as unknown and mark the block (${JSON.stringify(checks.good)})`],
    [checks.stray?.error && JSON.stringify(checks.stray.refused) === JSON.stringify(["https://never-returned.example/page"]) && Array.isArray(checks.stray.allowed) && checks.stray.allowed.length >= 2 && !checks.stray.allowed.includes("https://never-returned.example/page"), `an unreturned URL is refused with is_error and the allowed URLs (${JSON.stringify(checks.stray)})`],
    [/Integration platform/.test(checks.row || "") && /Nobody Corp\.\s*·?\s*country unknown/.test(checks.row || "") && /Example GmbH\s*·?\s*Germany/.test(checks.row || ""), `the table gives the operator its country from the quote and the maker none without one (${checks.row})`]
  ]);
}

// ---- caps ----------------------------------------------------------------------------------------------------------
if (wanted("caps")) {
  const checks = {};
  // Forty calls, then the run stops: the stand-in answers every call with another tool call.
  const looping = createFakeClaude(() => ({ blocks: [tool("ui_progress", { text: "Still researching." })], stop: "tool_use", usage: { input_tokens: 100, output_tokens: 10 } }));
  const t = await newPage(looping);
  try {
    await startLive(t.page, { cap: 3 });
    await ended(t.page, 120000);
    await t.page.waitForTimeout(1000);
    checks.calls = looping.requests.length;
    checks.pill = await pill(t.page);
    checks.notice = (await noticed(t.page, /^notice\.stepLimit$/)).length;
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  // The cost cap: one expensive call (400,000 output tokens on Sonnet 5.5 is $4.00, €3.58) and nothing after it.
  const costly = createFakeClaude([
    { blocks: [tool("ui_progress", { text: "I start with the catalogue." })], stop: "tool_use", usage: { input_tokens: 1000, output_tokens: 400000 } },
    { blocks: [text("This call must never happen.")], stop: "end_turn" }
  ]);
  const t2 = await newPage(costly);
  try {
    await startLive(t2.page, { cap: 3 });
    await ended(t2.page);
    await t2.page.waitForTimeout(1000);
    checks.costCalls = costly.requests.length;
    checks.costPill = await pill(t2.page);
    checks.costNotice = (await noticed(t2.page, /^notice\.costCap$/)).length;
  } catch (err) { checks.FAILED = checks.FAILED || String(err.message).split("\n")[0]; }
  await t2.context.close();
  t.fake.violations.push(...costly.violations);
  // The visitor's own cap: €0.50 in the dialog, and a first call of 100,000 output tokens (about €0.89) is the last.
  const capped = createFakeClaude([
    { blocks: [tool("ui_progress", { text: "I start with the catalogue." })], stop: "tool_use", usage: { input_tokens: 1000, output_tokens: 100000 } },
    { blocks: [text("This call must never happen.")], stop: "end_turn" }
  ]);
  const t3 = await newPage(capped);
  try {
    await startLive(t3.page, { cap: 0.5 });
    await ended(t3.page);
    await t3.page.waitForTimeout(500);
    checks.capCalls = capped.requests.length;
    checks.capNotice = (await noticed(t3.page, /^notice\.costCap$/)).length;
    checks.capEur = (await run(t3.page)).cost?.eur;
  } catch (err) { checks.FAILED = checks.FAILED || String(err.message).split("\n")[0]; }
  await t3.context.close();
  t.fake.violations.push(...capped.violations);
  await finish("caps: no 41st model call, and none once €3 is spent", t, checks, [
    [checks.calls === 40 && checks.pill === "Stopped" && checks.notice === 1, `forty calls, then the run stops (${checks.calls}, ${checks.pill}, ${checks.notice})`],
    [checks.costCalls === 1 && checks.costPill === "Stopped" && checks.costNotice === 1, `no call after €3 is spent (${checks.costCalls}, ${checks.costPill}, ${checks.costNotice})`],
    [checks.capCalls === 1 && checks.capNotice === 1 && checks.capEur > 0.5 && checks.capEur < 3, `the visitor's cap of €0.50 stops the run after the call that passed it (${checks.capCalls}, ${checks.capNotice}, €${checks.capEur})`]
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
    await startLive(page);
    await ended(page);
    await page.waitForTimeout(300);
    const r = await run(page);
    checks.eur = r.cost?.eur;
    checks.usd = r.cost?.usd;
    const p = MODELS.find((m) => m.id === "claude-sonnet-5-5").price;
    const usd = usages.reduce((s, u) => s + (u.input_tokens * p.input + u.output_tokens * p.output + u.cache_creation_input_tokens * p.cacheWrite + u.cache_read_input_tokens * p.cacheRead) / 1e6 + u.web_search_requests * (ANTHROPIC.webSearchUsdPer1000 / 1000), 0);
    checks.expectedUsd = usd;
    checks.expectedEur = usd * FX_USD_EUR;
    checks.tile = await page.evaluate(() => [document.querySelector("#kpi-cost .vc-stat__value").innerText.trim(), document.querySelector("#kpi-cost .vc-stat__note").innerText.trim()]);
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("cost: the measured cost equals usage × price plus searches × $0.01, to within 1e-9, on the Session cost tile", t, checks, [
    [Math.abs(checks.usd - checks.expectedUsd) < 1e-9 && Math.abs(checks.eur - checks.expectedEur) < 1e-9, `cost ${checks.eur} EUR = ${checks.expectedEur} EUR (${checks.usd} = ${checks.expectedUsd} USD)`],
    [checks.tile?.[0] === `€${Number(checks.expectedEur).toFixed(2)}` && /^measured/.test(checks.tile?.[1] || ""), `the tile shows the measured cost (${JSON.stringify(checks.tile)})`]
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
    checks.unchecked = (await run(page)).narration.filter((m) => m.audit === "unchecked").map((m) => m.text);
    // The step that shows the words: the one the run stopped on.
    checks.tag = [];
    for (let i = 0; i < 5 && !checks.tag.length; i++) {
      await page.evaluate((n) => window.sovereignty.go(n, { focus: false }), i);
      await page.waitForTimeout(150);
      checks.tag = await page.$$eval("#agent-text .unchecked", (els) => els.map((e) => [e.textContent, e.parentElement.textContent]));
    }
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("guardrails: the sequence rules and the fact audit's two retries, then the text marked unchecked", t, checks, [
    [checks.memo?.is_error && /follows the person's lever decision/.test(checks.memo.parsed?.error || ""), "no memo before a lever decision"],
    [checks.early?.is_error && /needs the person's review first/.test(checks.early.parsed?.error || ""), "no assessed report before the review"],
    [checks.review?.is_error && /no building blocks to review/.test(checks.review.parsed?.error || ""), "no review before blocks and layer statuses"],
    [checks.s1?.is_error && checks.s2?.is_error && /outside a placeholder: 75, %/.test(checks.s1.parsed?.error || "") && !checks.s3?.is_error, `the audit refuses a figure twice, then accepts the text (${checks.s1?.parsed?.error?.slice(0, 90)})`],
    [checks.unchecked?.length === 1 && /75%/.test(checks.unchecked[0]) && checks.tag?.length === 1 && checks.tag[0][0] === "Unchecked" && /75%/.test(checks.tag[0][1]), `the accepted text shows with its Unchecked tag (${JSON.stringify(checks.tag)})`]
  ]);
}

// ---- not-a-service -----------------------------------------------------------------------------------------------------------
const notAService = () => [
  { blocks: [tool("ui_progress", { text: "This names a person, not a digital service or platform." }), tool("ui_final_report", { outcome: "not_a_service", markdown: "The text names a person, not a digital service, so there is nothing to assess." })], stop: "tool_use" },
  { blocks: [text("Nothing to assess.")], stop: "end_turn" }
];
if (wanted("not-a-service")) {
  const fake = createFakeClaude(notAService());
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    await startLive(page, { entry: "zapuk" });
    await ended(page);
    await page.waitForTimeout(300);
    const r = await run(page);
    checks.end = r.end;
    checks.blocks = r.blocks;
    checks.overall = await page.evaluate(() => document.querySelector("#kpi-score .vc-stat__value").innerText.trim());
    checks.title = await page.evaluate(() => { window.sovereignty.go(1, { focus: false }); return document.getElementById("story-title").textContent; });
    checks.requests = fake.requests.length;
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("not-a-service: a run that finds no service ends without blocks and says so", t, checks, [
    [checks.end === "not_a_service" && /No building blocks/.test(checks.title || ""), `the run ends as not a service (${checks.end}; ${checks.title})`],
    [checks.blocks === 0 && checks.overall === "Not scored" && checks.requests === 2, `no blocks, no figures (${checks.blocks}, ${checks.overall}, ${checks.requests} calls)`]
  ]);
}

// ---- key -------------------------------------------------------------------------------------------------------------------
if (wanted("key")) {
  const fake = createFakeClaude(notAService());
  const t = await newPage(fake);
  const { page } = t;
  const checks = {};
  try {
    // A wrong key: the free check rejects it, the dialog says why, nothing is stored.
    await startLive(page, { key: "sk-ant-test-WRONGKEY-0123456789abcdefghijklmnopqrstuvwxyz0123456789" });
    await page.waitForFunction(() => /rejected this key/.test(document.getElementById("live-msg").textContent), null, { timeout: 10000 });
    checks.rejected = await textOf(page, "#live-msg");
    checks.afterWrong = await page.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
    await page.check("#live-ack");
    await page.fill("#live-key", MOCK_KEY);
    await page.click("#live-start");
    await page.waitForFunction(() => window.sovereignty.S.mode === "live", null, { timeout: 10000 });
    await ended(page);
    checks.api = t.api.filter((x) => !x.startsWith("OPTIONS"));
    checks.stored = await page.evaluate((key) => [localStorage, sessionStorage].some((st) => Object.keys(st).some((k) => k.includes(key) || (st.getItem(k) || "").includes(key))), MOCK_KEY);
    // Start agent again: the key in memory shows masked, and Forget key forgets it.
    await page.click("#start");
    await page.waitForSelector("#start-dialog[open]");
    checks.masked = await textOf(page, "#live-masked");
    checks.ackAgain = await page.isChecked("#live-ack");
    await page.click("#live-forget");
    checks.forgotten = await page.waitForSelector("#live-current", { state: "hidden", timeout: 3000 }).then(() => true, () => false);
    checks.startAfterForget = await page.evaluate(() => document.getElementById("live-start").disabled);
    checks.keys = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
    checks.pageHasKey = (await page.content()).includes(MOCK_KEY);
    checks.consoleHasKey = t.log.console.some((x) => x.includes(MOCK_KEY));
    checks.field = await page.inputValue("#live-key");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("key: checked with GET /v1/models first, held in the page's memory only, never on the page or in the console", t, checks, [
    [/Anthropic rejected this key \(401\)/.test(checks.rejected || "") && checks.afterWrong === null, `a rejected key is not kept, and the dialog says why (${checks.rejected})`],
    [checks.api?.[0] === "GET /v1/models" && checks.api.filter((x) => x === "GET /v1/models").length === 2 && checks.api.slice(2).every((x) => x === "POST /v1/messages"), `each key is checked with the free models call first (${JSON.stringify(checks.api)})`],
    [checks.stored === false, "the key is in no storage: the page's memory holds it"],
    [checks.masked === `${MOCK_KEY.slice(0, 7)}…${MOCK_KEY.slice(-4)}` && checks.ackAgain === false && checks.forgotten && checks.startAfterForget, `opened again, the dialog shows the key masked, the box unticked, and Forget key forgets it (${checks.masked}, ${checks.ackAgain}, ${checks.forgotten}, ${checks.startAfterForget})`],
    [checks.keys?.every((k) => k.startsWith("sa.") || k === "vc-theme" || k.startsWith("vc-guide:")), `storage keys sa.*, vc-theme and Vici's guide note only (${JSON.stringify(checks.keys)})`],
    [checks.pageHasKey === false && checks.consoleHasKey === false && checks.field === "", "neither the page nor the console shows the key, and the field is emptied"]
  ]);
}

// ---- nothing-kept -------------------------------------------------------------------------------------------------------------
/** A whole assessment for the stand-in: a profile, two blocks, four layer statuses, the score, the review, a lever, the memo, the report. */
function wholeRun() {
  const ev = [{ url: ID_URL, title: "BundID", quote: "operated by the ITZBund in its data centres in Germany", lang: "en", supports: ["tech", "operator", "hosting"] }];
  return [
    { blocks: [...fetchText(ID_URL, "BundID", PAGE), tool("rec_profile", FACTS_PROFILE(ID_URL, "The account is operated by the ITZBund"))], stop: "tool_use", usage: { input_tokens: 3000, output_tokens: 200, web_fetch_requests: 1 } },
    { blocks: [tool("rec_block", { layer: "infrastructure", name: "Data centres of the ITZBund", role: "Hosts the account", criticality: "critical", tech: { name: "ITZBund", country: "DE", parent: null }, operator: { name: "ITZBund", country: "DE", parent: null }, hosting: "EU", licence: "unknown", exit: "possible", confidence: "high", evidence: ev }),
      tool("rec_block", { layer: "applications", name: "Account software", role: "Runs the account", criticality: "critical", tech: { name: "ITZBund", country: "DE", parent: null }, operator: { name: "ITZBund", country: "DE", parent: null }, hosting: "EU", licence: "unknown", exit: "possible", confidence: "high", evidence: ev })], stop: "tool_use", usage: { input_tokens: 4000, output_tokens: 600 } },
    { blocks: ["devsecops", "platform", "base_service", "access"].map((layer) => tool("rec_layer", { layer, status: "no_evidence", reason: "No public source was found for this layer." })), stop: "tool_use", usage: { input_tokens: 5000, output_tokens: 300 } },
    { blocks: [tool("eng_score", {})], stop: "tool_use", usage: { input_tokens: 5500, output_tokens: 50 } },
    { blocks: [tool("ui_request_review", { summary: "Please review the findings." })], stop: "tool_use", usage: { input_tokens: 6000, output_tokens: 100 } },
    { blocks: [tool("eng_whatif", { lever_id: "L1", changes: [{ block_id: "B-02", made_in: "EU" }] })], stop: "tool_use", usage: { input_tokens: 6500, output_tokens: 100 } },
    { blocks: [tool("ui_propose_levers", { levers: [{ lever_id: "L1", title: "A second operator in the EU", rationale: "With it the score would reach {{fact:whatif.L1.overall}}.", changes: [{ block_id: "B-02", made_in: "EU" }], evidence: [{ url: ID_URL, title: "BundID", lang: "en", supports: ["alternative"] }] }] })], stop: "tool_use", usage: { input_tokens: 7000, output_tokens: 200 } },
    { blocks: [tool("ui_draft_memo", { lever_id: "L1", subject: "Proposal: a second operator", body: "We propose to check a second operator in the EU." })], stop: "tool_use", usage: { input_tokens: 7500, output_tokens: 200 } },
    { blocks: [tool("ui_final_report", { outcome: "assessed", markdown: "# BundID\n\nThe overall score is {{fact:score.overall}}, indicative." })], stop: "tool_use", usage: { input_tokens: 8000, output_tokens: 200 } },
    { blocks: [text("The assessment is published.")], stop: "end_turn", usage: { input_tokens: 8500, output_tokens: 20 } }
  ];
}
if (wanted("nothing-kept")) {
  const checks = {};
  const dir = viciDir();
  // Every script the page runs, as Vici's check reads them: only the theme and language modules may use storage.
  const ALLOW = ["js/theme.js", "js/lang.js", "js/i18n/index.js", "vici/dist/vici.js"];
  if (dir) {
    const { storageProblems, storedKeyProblems } = await import(pathToFileURL(path.join(dir, "scripts", "lib", "storage.mjs")).href);
    const files = ["index.html", "vici/dist/vici.js", ...readdirSync(path.join(APP_ROOT, "js")).filter((f) => f.endsWith(".js")).map((f) => `js/${f}`), ...readdirSync(path.join(APP_ROOT, "js/i18n")).map((f) => `js/i18n/${f}`)];
    const sources = Object.fromEntries(files.map((f) => [f, readFileSync(path.join(APP_ROOT, f), "utf8")]));
    checks.static = storageProblems(sources, { allow: ALLOW });
    checks.control = storageProblems({ ...sources, "js/app.js": `${sources["js/app.js"]}\nlocalStorage.setItem("sa.results", "x");` }, { allow: ALLOW }).length > 0;
    const fake = createFakeClaude(wholeRun());
    const t = await newPage(fake);
    const { page } = t;
    try {
      await startLive(page);
      await reviewConfirm(page);
      await chooseLever(page);
      await approveMemo(page);
      await ended(page);
      await page.waitForTimeout(300);
      // The live result stands beside its pre-run in All services, and in Compare, for this tab only.
      await page.click("#overview-open");
      checks.liveRow = await page.$$eval('#overview-body tr[data-key="live:bundid"]', (e) => e.length);
      await page.check('#overview-body [data-pick="live:bundid"]');
      await page.check('#overview-body [data-pick="bundid"]');
      await page.click("#ov-cmp");
      checks.compare = await page.$$eval("#cmp-body thead th[data-key]", (e) => e.map((x) => x.dataset.key));
      await page.keyboard.press("Escape");
      const stored = await page.evaluate(async () => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), databases: (await indexedDB.databases?.() || []).map((d) => d.name), caches: await caches.keys(), cookie: document.cookie }));
      checks.stored = stored;
      checks.storedProblems = storedKeyProblems(stored, { prefix: "sa" });
      checks.control2 = storedKeyProblems({ ...stored, local: [...stored.local, "sa.results"] }, { prefix: "sa" }).length > 0;
    } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
    await finish("nothing-kept: only the theme and language modules touch storage, and after a whole live run only vc-theme, sa.lang and Vici's guide note stay", t, checks, [
      [checks.control && checks.control2, "control: a planted store is caught, in the code and in the browser"],
      [Array.isArray(checks.static) && !checks.static.length, `storageProblems is empty (${JSON.stringify(checks.static)})`],
      [checks.liveRow === 1 && JSON.stringify(checks.compare) === JSON.stringify(["live:bundid", "bundid"]), `the live run's result stands in All services and in Compare (${checks.liveRow}, ${JSON.stringify(checks.compare)})`],
      [Array.isArray(checks.storedProblems) && !checks.storedProblems.length, `storedKeyProblems is empty (${JSON.stringify(checks.stored)}: ${JSON.stringify(checks.storedProblems)})`]
    ]);
  } else {
    results.push({ name: "nothing-kept: needs a ViciDesign checkout (VICI_DIR)", ok: !REQUIRE_VICI, problems: ["no ViciDesign checkout"], checks, pageErrors: [], consoleErrors: [], csp: [] });
  }
}

// ---- cost-tile -----------------------------------------------------------------------------------------------------------------
if (wanted("cost-tile")) {
  for (const lang of ["en", "de"]) {
    const usage = { input_tokens: 20000, output_tokens: 3000, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, web_search_requests: 1, web_fetch_requests: 0 };
    const fake = createFakeClaude([
      { blocks: [tool("ui_progress", { text: "I look for the service." })], stop: "tool_use", usage },
      { blocks: [tool("ui_final_report", { outcome: "stopped", markdown: "The test stops here." })], stop: "tool_use", usage },
      { blocks: [text("Stopped.")], stop: "end_turn", usage }
    ]);
    const t = await newPage(fake, { lang });
    const { page } = t;
    const checks = {};
    try {
      const before = await page.evaluate(() => document.querySelector("#kpi-cost").innerText);
      await startLive(page);
      await ended(page);
      await page.waitForTimeout(300);
      const r = await run(page);
      const eurOf = (x) => (lang === "en" ? `€${Number(x).toFixed(2)}` : `${Number(x).toFixed(2).replace(".", ",")} €`);
      checks.before = before.replace(/\s+/g, " ");
      checks.tile = await page.evaluate(() => { const n = (sel) => document.querySelector(sel).innerText.replace(/[\u00a0\u202f]/g, " ").replace(/\s+/g, " ").trim(); return { label: n("#kpi-cost .vc-stat__label"), value: n("#kpi-cost .vc-stat__value"), note: n("#kpi-cost .vc-stat__note") }; });
      checks.want = eurOf(r.cost?.eur).replace(/\u00a0/g, " ");
    } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
    const L = lang === "en" ? { label: "Session cost", note: /^measured, /, replay: /live run|replay/ } : { label: "Sitzungskosten", note: /^gemessen, /, replay: /Live-Lauf|Wiedergabe/ };
    await finish(`cost-tile: ${lang}: in a live run the tile shows the measured cost under Session cost`, t, checks, [
      [L.replay.test(checks.before || ""), `before the run, the tile speaks of a live run and the free replay (${checks.before})`],
      [checks.tile?.label === L.label && checks.tile.value === checks.want && L.note.test(checks.tile.note) && !L.replay.test(`${checks.tile.value} ${checks.tile.note}`), `after it, ${L.label} shows the measured cost (${JSON.stringify(checks.tile)} vs ${checks.want})`]
    ]);
  }
}

// ---- report ---------------------------------------------------------------------------------------------------------------------
await browser.close();
await close();
await writeFile(path.join(OUT, "live-results.json"), JSON.stringify(results, null, 2));
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  // A case passes when each of its results does: LIVE OK <case>.
  const id = r.name.split(":")[0];
  if (r.ok && results.filter((x) => x.name.split(":")[0] === id).every((x) => x.ok) && results.filter((x) => x.name.split(":")[0] === id).at(-1) === r) console.log(`LIVE OK ${id}`);
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
