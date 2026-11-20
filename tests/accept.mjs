// Acceptance tests of the key, the privacy rules and the security policy in the running app (brief §4;
// AC-06), with a stand-in for api.anthropic.com so no test calls the real API or spends anything:
//   storage      a whole session (language, intro, model, speed, a key, a short live run, Diagnostics, the
//                theme) writes only sa.* keys and Vici's vc-theme; the key lives in this tab's session
//                storage only, never in local storage, the console or the page; Forget key removes it
//   policy       the page's policy is exactly js/config.js's (the brief's), and the browser enforces it:
//                an inline script and a request to another host are refused
//   mode-dialog  Start agent opens the mode choice: the service, Simulation offered for an entry with a
//                pre-run and unavailable with its reason for one without and for free text, Live with the
//                key; Escape cancels. Every catalogue entry has a pre-run from 1.0.0, so the case takes
//                NOOTS's out of the page's bundle to show an entry without one
//   key-dialog   a rejected key (401) is not stored; a malformed one is refused before any request; an
//                accepted key is stored for this tab and starts the live run (two model calls against the
//                stand-in, which ends the run); "Change or forget key" and Forget key; the dialog in German
//   frame        inside another page's frame the key dialog refuses to work
// Every case fails on a page error, a console error, a policy violation or a request to another host.
// Usage: node tests/accept.mjs [case…]
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, NETWORK_NOISE, MOCK_KEY, SKIP_INTRO, KEYS } from "./lib/harness.mjs";
import { createFakeClaude, text as said, tool } from "./lib/fake-claude.mjs";

const { CSP } = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const OUT = await outDir("accept");
const { base: BASE, close } = await serveStatic(APP_ROOT, 8766);
const browser = await launchBrowser();
const results = [];
const BAD_KEY = "sk-ant-test-REJECTED-0123456789abcdefghijklmnopqrstuvwxyz";
const MODELS_LIST = { data: ["claude-sonnet-5-5", "claude-haiku-5-5", "claude-opus-5-5"].map((id) => ({ id, type: "model", display_name: id })), has_more: false };
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, OPTIONS" };

/**
 * A short live run for the stand-in: the agent ends it at once with outcome "stopped", in two model calls.
 * Each page gets its own (a run's assistant turns are checked against what the stand-in sent).
 */
const shortRun = () => createFakeClaude([
  { blocks: [tool("ui_progress", { text: "This test ends the run here." }), tool("ui_final_report", { outcome: "stopped", markdown: "The run was stopped by the acceptance test." })], stop: "tool_use" },
  { blocks: [said("Stopped.")], stop: "end_turn" }
]);

/** The API stand-in: the models list and a short run for the mock key, 401 for any other key or none. */
function anthropicStandIn(route, fake) {
  const req = route.request();
  if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
  const key = req.headers()["x-api-key"];
  const json = (status, body) => route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
  const pathname = new URL(req.url()).pathname;
  if (pathname === "/v1/models" && key === MOCK_KEY) return json(200, MODELS_LIST);
  if (pathname === "/v1/messages" && key === MOCK_KEY && req.method() === "POST") {
    const out = fake.handle(req.postData() || "{}", req.headers());
    return route.fulfill({ status: out.status, headers: { ...CORS, ...out.headers }, body: out.body });
  }
  return json(401, { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } });
}
const ended = (page, timeout = 30000) => page.waitForFunction(() => /^(Done|Stopped|Aborted|Error)$/.test(document.querySelector("#status-pill")?.textContent.trim() || ""), null, { timeout });

async function newPage({ intro = false, viewport = { width: 1600, height: 900 }, url = "" } = {}) {
  const context = await browser.newContext({ viewport });
  if (!intro) await context.addInitScript(SKIP_INTRO);
  await context.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`.trim()));
  });
  const external = [];
  const api = [];
  const fake = shortRun();
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (route) => {
    const u = new URL(route.request().url());
    if (u.host === "api.anthropic.com") { api.push(`${route.request().method()} ${u.pathname}`); return anthropicStandIn(route, fake); }
    external.push(`${route.request().method()} ${u.host}${u.pathname}`);
    return route.abort("blockedbyclient");
  });
  const page = await context.newPage();
  const log = { pageErrors: [], consoleErrors: [], console: [] };
  page.on("pageerror", (e) => log.pageErrors.push(String(e.message || e)));
  page.on("console", (m) => { log.console.push(m.text()); if (m.type() === "error") log.consoleErrors.push(m.text()); });
  if (url !== null) { await page.goto(BASE + url); await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 }); }
  return { context, page, log, external, api, fake };
}

/** expectations: [[condition, message], …]; expectCsp: policy violations that are the case's point. */
async function finish(name, { context, page, log, external, fake }, checks, expectations, { allowConsole = null, expectCsp = false } = {}) {
  const csp = await page.evaluate(() => window.__csp || []).catch(() => ["<page gone>"]);
  const consoleErrors = log.consoleErrors.filter((t) => !NETWORK_NOISE.test(t) && !(allowConsole && allowConsole.test(t)));
  const problems = expectations.filter(([ok]) => !ok).map(([, msg]) => msg);
  if (checks.FAILED) problems.unshift(`exception: ${checks.FAILED}`);
  if (external.length) problems.push(`requests to other hosts: ${external.join(", ")}`);
  const fakeViolations = fake?.violations || [];
  if (fakeViolations.length) problems.push(`protocol: ${fakeViolations.join("; ")}`);
  const ok = !problems.length && !log.pageErrors.length && !consoleErrors.length && (expectCsp || !csp.length);
  results.push({ name, ok, problems, checks, pageErrors: log.pageErrors, consoleErrors, csp });
  await context.close();
}

const shot = (page, file) => page.screenshot({ path: path.join(OUT, file) });
const text = (page, sel) => page.$eval(sel, (el) => el.textContent.replace(/\s+/g, " ").trim()).catch(() => null);
const storage = (page) => page.evaluate(() => {
  const dump = (s) => Object.fromEntries(Array.from({ length: s.length }, (_, i) => s.key(i)).map((k) => [k, s.getItem(k)]));
  return { local: dump(localStorage), session: dump(sessionStorage) };
});
/** From a chosen catalogue entry to the key dialog. */
async function toKeyDialog(page, entry = "bundid") {
  await page.click(`.catalogue-chip[data-entry="${entry}"]`);
  await page.click("#btn-start");
  await page.waitForSelector(".mode-card");
  await page.click('.mode-card[data-mode="live"] .mode-cta button');
  await page.waitForSelector("#api-key-input");
}

// ---- storage ---------------------------------------------------------------------------------------------
if (wanted("storage")) {
  const t = await newPage({ intro: true });
  const { page, log, api } = t;
  const checks = {};
  try {
    await page.waitForSelector(".intro-modal");
    await page.keyboard.press("Escape");
    await page.click('#lang-switch button[data-lang="de"]');
    await page.click('#lang-switch button[data-lang="en"]');
    await page.click("#dd-model");
    await page.click('.vc-menu__item[data-id="claude-haiku-5-5"]');
    await page.click('#speed-group button[data-speed="2"]');
    await page.click(".theme-toggle");
    await toKeyDialog(page);
    await page.fill("#api-key-input", MOCK_KEY);
    await page.click("#btn-check-key");
    await page.waitForSelector("#api-key-input", { state: "detached" });
    // The accepted key starts the live run; the stand-in ends it in two calls.
    await ended(page);
    checks.pillAfterRun = await text(page, "#status-pill");
    await page.click("#btn-diagnostics");
    await page.click("#btn-run-all");
    await page.waitForFunction(() => document.querySelector('.diag-table tr[data-test="anthropic"] .diag-status')?.dataset.s === "pass", null, { timeout: 15000 });
    checks.diagDetail = await text(page, '.diag-table tr[data-test="anthropic"] td.detail');
    await page.keyboard.press("Escape");
    const s = await storage(page);
    checks.keys = [...Object.keys(s.local).map((k) => `local ${k}`), ...Object.keys(s.session).map((k) => `session ${k}`)].sort();
    checks.foreign = checks.keys.filter((k) => !/^(local|session) (sa\.|vc-theme$)/.test(k));
    checks.keyInSession = s.session[KEYS.apiKey] === MOCK_KEY;
    checks.keyInLocal = Object.values(s.local).some((v) => String(v).includes("sk-ant-"));
    checks.keyElsewhere = Object.entries(s.session).filter(([k, v]) => k !== KEYS.apiKey && String(v).includes(MOCK_KEY)).map(([k]) => k);
    checks.keyInConsole = log.console.some((m) => m.includes(MOCK_KEY));
    checks.keyInPage = await page.evaluate((k) => document.documentElement.outerHTML.includes(k), MOCK_KEY);
    // Forget key, from the mode dialog's footer.
    await page.click("#btn-start");
    await page.waitForSelector("#btn-manage-key");
    await page.click("#btn-manage-key");
    await page.waitForSelector("#btn-forget-key:not([hidden])");
    await page.click("#btn-forget-key");
    checks.forgotMsg = await text(page, "#api-key-msg");
    checks.afterForget = (await storage(page)).session[KEYS.apiKey] ?? null;
    await page.keyboard.press("Escape");
    checks.messagesCalls = api.filter((a) => a.includes("/v1/messages"));
    checks.firstCall = api.find((a) => !a.startsWith("OPTIONS"));
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const want = ["local sa.introSeen", "local sa.lang", "local vc-theme", "session sa.anthropic.key", "session sa.diag", "session sa.model", "session sa.speed"];
  await finish("storage: only sa.* and vc-theme; the key in this tab's session storage only, then forgotten", t, checks, [
    [Array.isArray(checks.foreign) && checks.foreign.length === 0, `every key is sa.* or vc-theme (${JSON.stringify(checks.keys)})`],
    [want.every((k) => checks.keys?.includes(k)), `the session wrote each of the app's keys (${JSON.stringify(checks.keys)})`],
    [checks.keyInSession === true && checks.keyInLocal === false && checks.keyElsewhere?.length === 0, "the key only under sa.anthropic.key in session storage"],
    [checks.keyInConsole === false && checks.keyInPage === false, "the key never in the console or the page"],
    [/^Key valid \(free check, no tokens used\)\. All 3 models are available\.$/.test(checks.diagDetail || ""), `Diagnostics checks the stored key for free (${checks.diagDetail})`],
    [checks.forgotMsg === "Key removed from this tab." && checks.afterForget === null, "Forget key removes it"],
    [checks.firstCall === "GET /v1/models" && checks.messagesCalls?.filter((c) => c === "POST /v1/messages").length === 2 && /^(Done|Stopped)$/.test(checks.pillAfterRun || ""), `the free key check first, then the run's two model calls (${checks.firstCall}; ${JSON.stringify(checks.messagesCalls)}; ${checks.pillAfterRun})`]
  ]);
}

// ---- policy ---------------------------------------------------------------------------------------------------
if (wanted("policy")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  try {
    checks.meta = await page.$$eval('meta[http-equiv="Content-Security-Policy"]', (els) => els.map((e) => e.getAttribute("content")));
    // The browser enforces it: an inline script never runs, and another host is never reached.
    checks.inline = await page.evaluate(async () => {
      window.__inlineRan = false;
      const s = document.createElement("script");
      s.textContent = "window.__inlineRan = true";
      document.body.appendChild(s);
      await new Promise((r) => setTimeout(r, 100));
      return window.__inlineRan;
    });
    checks.fetchOther = await page.evaluate(async () => {
      try { await fetch("https://example.org/", { mode: "no-cors" }); return "reached"; } catch { return "refused"; }
    });
    checks.violations = await page.evaluate(() => window.__csp.slice());
    checks.resources = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => new URL(e.name).host).filter((h) => h !== location.host));
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("policy: exactly the brief's policy, enforced by the browser", t, checks, [
    [checks.meta?.length === 1 && checks.meta[0] === CSP, `one policy, equal to js/config.js's (${JSON.stringify(checks.meta)})`],
    [checks.inline === false, "an inline script is refused"],
    [checks.fetchOther === "refused", "a request to another host is refused"],
    [checks.violations?.some((v) => /^script-src/.test(v)) && checks.violations?.some((v) => /^connect-src https:\/\/example\.org/.test(v)), `the browser reports both refusals (${JSON.stringify(checks.violations)})`],
    [checks.resources?.length === 0, `nothing loaded from another host (${JSON.stringify(checks.resources)})`]
  ], { expectCsp: true, allowConsole: /Content Security Policy/ });
}

// ---- mode-dialog ---------------------------------------------------------------------------------------------
if (wanted("mode-dialog")) {
  const t = await newPage();
  const { page, api } = t;
  const checks = {};
  try {
    // An entry with a pre-run offers Simulation.
    await page.click('.catalogue-chip[data-entry="bundid"]');
    await page.click("#btn-start");
    await page.waitForSelector(".mode-card");
    checks.simBundid = await page.getAttribute('.mode-card[data-mode="simulation"]', "aria-disabled");
    checks.simBundidReason = await text(page, ".why-disabled");
    checks.simBundidButton = await text(page, '.mode-card[data-mode="simulation"] .mode-cta button');
    await page.keyboard.press("Escape");
    await page.waitForSelector(".mode-card", { state: "detached" });
    // An entry without one: every entry has a pre-run from 1.0.0, so NOOTS's is taken out of this page's
    // bundle first (the dialog asks the bundle when it opens). Simulation unavailable, with its reason.
    checks.nootsHadPreRun = await page.evaluate(() => { const had = Object.hasOwn(window.SA_RUNS || {}, "noots"); delete window.SA_RUNS.noots; return had; });
    await page.click('.catalogue-chip[data-entry="noots"]');
    await page.click("#btn-start");
    await page.waitForSelector(".mode-card");
    checks.title = await text(page, ".vc-dialog__title");
    checks.service = `${await text(page, ".run-summary .label")} ${await text(page, ".run-summary strong")}`;
    checks.simDisabled = await page.getAttribute('.mode-card[data-mode="simulation"]', "aria-disabled");
    checks.simReason = await text(page, ".why-disabled");
    checks.simButton = await page.getAttribute('.mode-card[data-mode="simulation"] .mode-cta button', "aria-disabled");
    checks.live = await text(page, '.mode-card[data-mode="live"] .mode-cta button');
    checks.caps = await text(page, '.mode-card[data-mode="live"] li:nth-child(3)');
    checks.focus = await page.evaluate(() => document.activeElement?.textContent.trim());
    await shot(page, "01-mode-dialog.png");
    // Simulation's button does nothing while it is unavailable (force: Playwright itself waits for an
    // aria-disabled button to become enabled).
    await page.click('.mode-card[data-mode="simulation"] .mode-cta button', { force: true });
    checks.stillOpen = (await page.$(".mode-card")) !== null;
    await page.keyboard.press("Escape");
    await page.waitForSelector(".mode-card", { state: "detached" });
    checks.idle = await text(page, "#status-pill");
    // Free text: Simulation replays catalogue entries only.
    await page.fill("#service-input", "Mein Fachverfahren");
    await page.keyboard.press("Escape");
    await page.click("#btn-start");
    await page.waitForSelector(".mode-card");
    checks.freeService = await text(page, ".run-summary strong");
    checks.freeReason = await text(page, ".why-disabled");
    // German, with the caps in German formats.
    await page.keyboard.press("Escape");
    await page.click('#lang-switch button[data-lang="de"]');
    await page.click("#btn-start");
    await page.waitForSelector(".mode-card");
    checks.titleDe = await text(page, ".vc-dialog__title");
    checks.capsDe = (await text(page, '.mode-card[data-mode="live"] li:nth-child(3)'))?.replace(/[  ]/g, " ");
    await shot(page, "02-mode-dialog-de.png");
    await page.keyboard.press("Escape");
    checks.calls = api.slice();
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("mode-dialog: the service, Simulation with its reason, Live, Escape cancels", t, checks, [
    [checks.simBundid !== "true" && !checks.simBundidReason && !!checks.simBundidButton, `an entry with a pre-run offers Simulation (${checks.simBundid}; ${checks.simBundidButton})`],
    [checks.title === "How should the agent run?" && checks.service === "Will assess: NOOTS (National Once-Only Technical System)", `title and service (${checks.service})`],
    [checks.nootsHadPreRun === true && checks.simDisabled === "true" && checks.simButton === "true" && checks.simReason === "No pre-run assessment exists for this service yet.", `Simulation unavailable, with its reason, once NOOTS's pre-run is out of the bundle (it had one: ${checks.nootsHadPreRun})`],
    [checks.stillOpen === true, "Simulation's button does nothing"],
    [checks.live === "Continue with my API key" && checks.focus === "Continue with my API key", "Live asks for the key, focused"],
    [checks.caps === "At most 40 model calls and €3.00 per run; the cost meter shows the spend live.", `the run's caps (${checks.caps})`],
    [checks.idle === "Idle", "Escape cancels and nothing runs"],
    [checks.freeService === "Mein Fachverfahren" && checks.freeReason === "Simulation replays catalogue entries only. A service in your own words needs the live agent.", "free text: Simulation replays catalogue entries only"],
    [checks.titleDe === "Wie soll der Agent laufen?" && checks.capsDe === "Höchstens 40 Modellaufrufe und 3,00 € pro Lauf; der Kostenzähler zeigt die Ausgaben live.", `German, with German formats (${checks.capsDe})`],
    [checks.calls?.length === 0, `no request to the API (${JSON.stringify(checks.calls)})`]
  ]);
}

// ---- key-dialog ------------------------------------------------------------------------------------------------
if (wanted("key-dialog")) {
  const t = await newPage();
  const { page, api } = t;
  const checks = {};
  try {
    await toKeyDialog(page);
    checks.type = await page.getAttribute("#api-key-input", "type");
    checks.forgetHidden = await page.$eval("#btn-forget-key", (b) => b.hidden);
    // Empty and malformed: refused before any request.
    await page.click("#btn-check-key");
    checks.empty = await text(page, "#api-key-msg");
    await page.fill("#api-key-input", "not-a-key");
    await page.click("#btn-check-key");
    checks.malformed = await text(page, "#api-key-msg");
    checks.callsBefore = api.length;
    // Rejected (401): said plainly, nothing stored.
    await page.fill("#api-key-input", BAD_KEY);
    await page.click("#btn-check-key");
    await page.waitForFunction(() => /401/.test(document.querySelector("#api-key-msg")?.textContent || ""));
    checks.rejected = await text(page, "#api-key-msg");
    checks.storedAfterReject = await page.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
    // Show key, then accepted.
    await page.click("#btn-show-key");
    checks.shown = await page.getAttribute("#api-key-input", "type");
    checks.hideTip = await text(page, ".vc-tooltip-anchor:has(#btn-show-key) .vc-tooltip");
    await page.fill("#api-key-input", MOCK_KEY);
    await page.click("#btn-check-key");
    await page.waitForSelector("#api-key-input", { state: "detached" });
    checks.storedAfterAccept = await page.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
    await ended(page);
    checks.pill = await text(page, "#status-pill");
    checks.badge = await text(page, "#mode-badge");
    checks.calls = api.filter((a) => !a.startsWith("OPTIONS"));
    await shot(page, "03-key-accepted.png");
    // With a key stored: the mode dialog offers it, and its footer changes or forgets it.
    await page.click("#btn-start");
    await page.waitForSelector(".mode-card");
    checks.useKey = await text(page, '.mode-card[data-mode="live"] .mode-cta button');
    checks.footer = await text(page, ".vc-dialog__footer .dialog-note");
    await page.click("#btn-manage-key");
    await page.waitForSelector("#btn-forget-key:not([hidden])");
    checks.current = await text(page, ".key-current");
    // The dialog in German, in place.
    await page.evaluate(async () => (await import("/js/i18n/index.js")).setLang("de"));
    checks.titleDe = await text(page, ".vc-dialog__title");
    checks.forgetDe = await text(page, "#btn-forget-key");
    checks.labelDe = await text(page, 'label[for="api-key-input"]');
    await shot(page, "04-key-dialog-de.png");
    await page.click("#btn-forget-key");
    checks.forgotDe = await text(page, "#api-key-msg");
    checks.storedAfterForget = await page.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
    await page.keyboard.press("Escape");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const masked = (s) => /sk-ant-…|sk-ant…|…[a-z0-9]{4}/.test(s || "") && !(s || "").includes(MOCK_KEY);
  await finish("key-dialog: rejected, malformed, accepted (the live run starts), change and forget, in German", t, checks, [
    [checks.type === "password" && checks.forgetHidden === true, "masked, no Forget key without a key"],
    [checks.empty === "Paste your Anthropic API key (it starts with sk-ant-)." && checks.malformed === "That does not look like an Anthropic API key. It should start with sk-ant-." && checks.callsBefore === 0, "empty and malformed refused before any request"],
    [checks.rejected === "Anthropic rejected this key (401). Check that it is active and copied completely." && checks.storedAfterReject === null, "a rejected key is said plainly and not stored"],
    [checks.shown === "text" && checks.hideTip === "Hide key", "Show key shows it and renames itself"],
    [checks.storedAfterAccept === MOCK_KEY, "an accepted key is stored for this tab"],
    [/^(Done|Stopped)$/.test(checks.pill || "") && checks.badge === "LIVE", `the accepted key starts the live run, which the stand-in ends (${checks.pill}; ${checks.badge})`],
    [JSON.stringify(checks.calls) === JSON.stringify(["GET /v1/models", "GET /v1/models", "POST /v1/messages", "POST /v1/messages"]), `the free key checks first, then the run's model calls (${JSON.stringify(checks.calls)})`],
    [masked(checks.useKey) && masked(checks.footer) && masked(checks.current), `the stored key shows masked (${checks.useKey}; ${checks.footer})`],
    [checks.titleDe === "Ihr Anthropic-API-Schlüssel" && checks.forgetDe === "Schlüssel vergessen" && checks.labelDe === "API-Schlüssel", "the open dialog follows a switch to German"],
    [checks.forgotDe === "Schlüssel aus diesem Tab entfernt." && checks.storedAfterForget === null, "Forget key removes it, said in German"]
  ]);
}

// ---- frame -------------------------------------------------------------------------------------------------------
if (wanted("frame")) {
  const t = await newPage({ url: null });
  const { page, context, api } = t;
  const checks = {};
  try {
    // A page of this test server that frames the app.
    await context.route(`${BASE}frame-test.html`, (route) => route.fulfill({ status: 200, headers: { "content-type": "text/html" }, body: `<!doctype html><title>frame</title><iframe src="${BASE}?lang=en" style="width:1500px;height:860px;border:0"></iframe>` }));
    await page.goto(`${BASE}frame-test.html`);
    const frame = await (await page.waitForSelector("iframe")).contentFrame();
    await frame.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
    await frame.click('.catalogue-chip[data-entry="bundid"]');
    await frame.click("#btn-start");
    await frame.waitForSelector(".mode-card");
    await frame.click('.mode-card[data-mode="live"] .mode-cta button');
    await frame.waitForSelector("#api-key-input");
    checks.disabled = await frame.$eval("#api-key-input", (i) => i.disabled);
    checks.msg = await frame.$eval("#api-key-msg", (e) => e.textContent.trim());
    checks.button = await frame.getAttribute("#btn-check-key", "aria-disabled");
    await frame.click("#btn-check-key", { force: true });
    await page.waitForTimeout(300);
    checks.calls = api.slice();
    checks.stored = await frame.evaluate((k) => sessionStorage.getItem(k), KEYS.apiKey);
    await shot(page, "05-framed.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("frame: the key dialog refuses to work inside another page", t, checks, [
    [checks.disabled === true && checks.button === "true", "the field and the check are disabled"],
    [checks.msg === "This page is running inside another page. Open it in its own tab to use live mode.", `it says why (${checks.msg})`],
    [checks.calls?.length === 0 && checks.stored === null, "no request, nothing stored"]
  ]);
}

await browser.close();
await close();
await writeFile(path.join(OUT, "accept-results.json"), JSON.stringify(results, null, 2));
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  for (const p of r.problems) console.log(`      - ${p}`);
  if (r.pageErrors.length || r.consoleErrors.length || (r.csp.length && !/policy/.test(r.name))) console.log(`      errors: ${JSON.stringify({ page: r.pageErrors, console: r.consoleErrors, csp: r.csp }).slice(0, 400)}`);
}
const passedAll = results.length > 0 && results.every((r) => r.ok);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} accept cases passed. Screenshots: ${OUT}`);
if (passedAll && ONLY.length === 0) console.log("ACCEPT OK");
process.exit(passedAll ? 0 : 1);
