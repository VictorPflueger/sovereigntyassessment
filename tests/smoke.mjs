// Smoke tests of the start flow, both languages and the failure modes of loading (version 0.1.0 has no
// run yet: the agent and the simulation player arrive in 0.2.0):
//   lang-first-visit  a German browser's first visit opens in English, and nothing is stored
//   lang-url          ?lang=de opens in German and is stored; a reload keeps it; ?lang=en wins again
//   lang-switch       the EN and DE switch without a reload: <html lang>, the header, the tiles, the
//                     controls, the catalogue, the drawer, the rail and the console; an open dialog
//                     follows a switch; the German page shows no English-only text
//   catalogue         a chip fills the field and shows its sources; typed letters suggest entries, the
//                     keyboard picks one; Enter starts; an empty field asks for a service
//   diagnostics       Diagnostics' local checks, then "Run all tests" with the API stand-in, every row
//                     passing, in English and in German
//   intro             a first visit opens the intro window; "How it works" reopens it; Start agent in it
//                     leads to the mode choice
//   kpi               the header's tiles on the golden case S2, in both languages, and "no data" without one
//   missing-data      a data file is missing: the boot screen names it
// Every case fails on a page error, a console error, a policy violation, or a request to another host
// than this test server (api.anthropic.com is answered by a stand-in where a case needs it).
// Usage: node tests/smoke.mjs [case…]
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, NETWORK_NOISE, SKIP_INTRO, KEYS } from "./lib/harness.mjs";

const OUT = await outDir("smoke");
const { base: BASE, blockLocal, close } = await serveStatic(APP_ROOT, 8765);
const browser = await launchBrowser();
const results = [];

/** The API's answer to a call without a key: 401 with a JSON error the browser may read (CORS). */
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, OPTIONS" };
export const keylessProbe = (route) => {
  if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
  return route.fulfill({ status: 401, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify({ type: "error", error: { type: "authentication_error", message: "x-api-key header is required" } }) });
};

async function newPage({ anthropic = null, intro = false, viewport = { width: 1920, height: 1080 }, locale = "en-GB", url = "" } = {}) {
  const context = await browser.newContext({ viewport, locale, extraHTTPHeaders: locale.startsWith("de") ? { "accept-language": "de-DE,de;q=0.9" } : {} });
  if (!intro) await context.addInitScript(SKIP_INTRO);
  await context.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI} ${e.sample || ""}`.trim()));
  });
  const external = [];
  const api = [];
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (route) => {
    const u = new URL(route.request().url());
    if (u.host === "api.anthropic.com" && anthropic) { api.push(`${route.request().method()} ${u.pathname}`); return anthropic(route); }
    external.push(`${route.request().method()} ${u.host}${u.pathname}`);
    return route.abort("blockedbyclient");
  });
  const page = await context.newPage();
  const log = { pageErrors: [], consoleErrors: [] };
  page.on("pageerror", (e) => log.pageErrors.push(String(e.message || e)));
  page.on("console", (m) => { if (m.type() === "error") log.consoleErrors.push(m.text()); });
  if (url !== null) await boot(page, url);
  return { context, page, log, external, api };
}

const boot = async (page, url = "") => { await page.goto(BASE + url); await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 }); };

/** expectations: [[condition, message], …]; allowConsole: console errors that are part of the case. */
async function finish(name, { context, page, log, external }, checks, expectations, allowConsole = null) {
  const csp = await page.evaluate(() => window.__csp || []).catch(() => ["<page gone>"]);
  const consoleErrors = log.consoleErrors.filter((t) => !NETWORK_NOISE.test(t) && !(allowConsole && allowConsole.test(t)));
  const problems = expectations.filter(([ok]) => !ok).map(([, msg]) => msg);
  if (checks.FAILED) problems.unshift(`exception: ${checks.FAILED}`);
  if (external.length) problems.push(`requests to other hosts: ${external.join(", ")}`);
  const ok = !problems.length && !log.pageErrors.length && !consoleErrors.length && !csp.length;
  results.push({ name, ok, problems, checks, pageErrors: log.pageErrors, consoleErrors, csp });
  await context.close();
}

const shot = (page, file) => page.screenshot({ path: path.join(OUT, file) });
const text = (page, sel) => page.$eval(sel, (el) => el.textContent.replace(/\s+/g, " ").trim()).catch(() => null);
const stored = (page, key) => page.evaluate((k) => localStorage.getItem(k), key);

// ---- lang-first-visit ---------------------------------------------------------------------------------
if (wanted("lang-first-visit")) {
  const t = await newPage({ locale: "de-DE" });
  const { page } = t;
  const checks = {};
  try {
    checks.navigatorLang = await page.evaluate(() => navigator.language);
    checks.htmlLang = await page.getAttribute("html", "lang");
    checks.name = await text(page, ".app-header .brand-name");
    checks.start = await text(page, "#btn-start");
    checks.title = await page.title();
    checks.stored = await stored(page, KEYS.lang);
    checks.pressed = await page.getAttribute('#lang-switch button[data-lang="en"]', "aria-pressed");
    await shot(page, "01-first-visit-german-browser.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("lang-first-visit: a German browser's first visit opens in English", t, checks, [
    [/^de/.test(checks.navigatorLang || ""), `the browser says German (${checks.navigatorLang})`],
    [checks.htmlLang === "en", `<html lang> is en (${checks.htmlLang})`],
    [checks.name === "Sovereignty Assessment" && checks.start === "Start agent" && checks.title === "Sovereignty Assessment", "the interface is English"],
    [checks.stored === null, "nothing is stored on a first visit"],
    [checks.pressed === "true", "EN is pressed"]
  ]);
}

// ---- lang-url --------------------------------------------------------------------------------------------
if (wanted("lang-url")) {
  const t = await newPage({ url: "?lang=de" });
  const { page } = t;
  const checks = {};
  try {
    checks.de = { lang: await page.getAttribute("html", "lang"), name: await text(page, ".app-header .brand-name"), start: await text(page, "#btn-start"), title: await page.title(), stored: await stored(page, KEYS.lang), pressed: await page.getAttribute('#lang-switch button[data-lang="de"]', "aria-pressed") };
    await shot(page, "02-lang-url-de.png");
    await boot(page, "");
    checks.reload = { lang: await page.getAttribute("html", "lang"), name: await text(page, ".app-header .brand-name") };
    await boot(page, "?lang=en");
    checks.en = { lang: await page.getAttribute("html", "lang"), name: await text(page, ".app-header .brand-name"), stored: await stored(page, KEYS.lang) };
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("lang-url: ?lang=de works and is stored; a reload keeps it; ?lang=en wins again", t, checks, [
    [checks.de?.lang === "de" && checks.de?.name === "Souveränitätsbewertung" && checks.de?.start === "Agent starten" && checks.de?.title === "Souveränitätsbewertung", `German with ?lang=de (${JSON.stringify(checks.de)})`],
    [checks.de?.stored === "de" && checks.de?.pressed === "true", "the choice is stored under sa.lang, DE pressed"],
    [checks.reload?.lang === "de" && checks.reload?.name === "Souveränitätsbewertung", "a reload without ?lang keeps German"],
    [checks.en?.lang === "en" && checks.en?.name === "Sovereignty Assessment" && checks.en?.stored === "en", "?lang=en wins and is stored"]
  ]);
}

// ---- lang-switch ------------------------------------------------------------------------------------------
if (wanted("lang-switch")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  // What the shell and the app write in their own words, read in one go.
  const snapshot = () => page.evaluate(() => {
    const q = (s) => document.querySelector(s)?.textContent.replace(/\s+/g, " ").trim() ?? null;
    return {
      lang: document.documentElement.lang,
      title: document.title,
      name: q(".app-header .brand-name"),
      proto: q(".brand-proto"),
      badge: q("#mode-badge"),
      ai: q(".ai-disclosure"),
      kpi: q("#kpi-overall-label"),
      kpiValue: q("#kpi-overall-value"),
      start: q("#btn-start"),
      placeholder: document.querySelector("#service-input")?.getAttribute("placeholder"),
      field: document.querySelector("#service-input")?.value,
      pill: q("#status-pill"),
      chip: q('.catalogue-chip[data-entry="online-ausweis"]'),
      catalogueTitle: q("#catalogue-title"),
      tab: q("#tab-blocks .drawer-tab__label"),
      drawerToggle: q(".drawer-toggle"),
      drawerNote: q(".drawer-note__text"),
      builtBy: q(".vc-byline__label"),
      empty: q("#panel-blocks .vc-empty__title"),
      rail: [...document.querySelectorAll(".rail .rail-label")].map((e) => e.textContent.trim()),
      console: q("#console-heading"),
      notice: q('.entry[data-type="notice"] .entry-body')
    };
  });
  try {
    await page.evaluate(() => { window.__noReload = "still here"; });
    await page.click("#tab-blocks");
    // A notice in the console, written by code: it follows the language too.
    await page.click("#btn-start");
    await page.waitForSelector('.entry[data-type="notice"]');
    // A chosen entry: its name in the field follows the language.
    await page.click('.catalogue-chip[data-entry="online-ausweis"]');
    checks.en = await snapshot();
    await page.click('#lang-switch button[data-lang="de"]');
    await page.waitForSelector('html[lang="de"]');
    checks.de = await snapshot();
    checks.noReload = await page.evaluate(() => window.__noReload);
    checks.pressed = await page.getAttribute('#lang-switch button[data-lang="de"]', "aria-pressed");
    checks.stored = await stored(page, KEYS.lang);
    // No English-only text on the German page: no English value of the dictionaries that differs from
    // its German one shows anywhere (names and codes are the same in both and do not count).
    const englishLeft = () => page.evaluate(async () => {
      const en = (await import("/js/i18n/en.js")).default;
      const de = (await import("/js/i18n/de.js")).default;
      const body = document.body.innerText;
      // A text of two words or more anywhere in the page; a single word as a whole word, case and all.
      const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const shows = (v) => (v.split(/\s+/).length >= 2 ? body.includes(v) : new RegExp(`(?<![\\p{L}\\p{N}])${esc(v)}(?![\\p{L}\\p{N}])`, "u").test(body));
      return Object.keys(en).filter((k) => en[k] !== de[k] && !/\{/.test(en[k]) && shows(en[k].trim()));
    });
    checks.englishLeft = await englishLeft();
    // Positive control: one English word and one English sentence planted in the page are found.
    await page.evaluate(() => {
      const p = document.createElement("p");
      p.id = "planted-english";
      p.textContent = "Abort. Nothing to abort: no run in progress.";
      document.querySelector(".catalogue-head").appendChild(p);
    });
    checks.plantedFound = await englishLeft();
    await page.evaluate(() => document.getElementById("planted-english").remove());
    await shot(page, "03-lang-switch-de.png");
    // An open dialog follows a switch: Diagnostics' title and its close button's name.
    await page.click("#btn-diagnostics");
    await page.waitForSelector(".diag-table");
    checks.dialogDe = { title: await text(page, ".vc-dialog__title"), close: await text(page, ".dialog-close + .vc-tooltip, .vc-tooltip-anchor:has(.dialog-close) .vc-tooltip") };
    await page.evaluate(async () => (await import("/js/i18n/index.js")).setLang("en"));
    await page.waitForSelector('html[lang="en"]');
    checks.dialogEn = { title: await text(page, ".vc-dialog__title"), close: await text(page, ".vc-tooltip-anchor:has(.dialog-close) .vc-tooltip"), status: await text(page, '.diag-table tr[data-test="method"] .diag-status') };
    await page.keyboard.press("Escape");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const de = checks.de || {};
  const en = checks.en || {};
  await finish("lang-switch: EN and DE without a reload, the shell's drawer, rail and dialogs included", t, checks, [
    [checks.noReload === "still here", "no reload"],
    [de.lang === "de" && de.title === "Souveränitätsbewertung" && checks.pressed === "true" && checks.stored === "de", "<html lang>, the title, the pressed button and the stored choice follow"],
    [en.name === "Sovereignty Assessment" && de.name === "Souveränitätsbewertung" && de.proto === "Prototyp – kein offizielles Angebot der Bundesregierung", "header name and prototype line"],
    [de.badge === "Kein Lauf aktiv" && de.ai === "Sie interagieren mit einem KI-System", "mode badge and AI disclosure"],
    [en.kpi === "Overall score" && de.kpi === "Gesamtwert" && de.kpiValue === "keine Daten", "the tiles, \"no data\" included"],
    [de.start === "Agent starten" && de.placeholder === "Basisdienst oder Plattform eingeben" && de.pill === "Bereit", "the controls"],
    [en.field === "Online ID (eID)" && de.field === "Online-Ausweis (eID)", `the chosen entry's name in the field follows (${en.field} → ${de.field})`],
    [en.chip === "Online ID (eID)" && de.chip === "Online-Ausweis (eID)" && de.catalogueTitle === "Dienst auswählen", "the catalogue's names come from its German texts"],
    [en.tab === "Building blocks" && de.tab === "Bausteine" && /Ausblenden/.test(de.drawerToggle || "") && de.drawerNote === "Nur Entwürfe. Nichts wird versendet." && de.builtBy === "Gebaut von" && de.empty === "Noch keine Bausteine", `the drawer: tabs, toggle, note, byline, empty state (${JSON.stringify({ tab: de.tab, toggle: de.drawerToggle })})`],
    [JSON.stringify(en.rail) === JSON.stringify(["Understand", "Research", "Score", "Your review", "Recommend"]) && JSON.stringify(de.rail) === JSON.stringify(["Verstehen", "Recherchieren", "Bewerten", "Ihre Prüfung", "Empfehlen"]), `the rail (${JSON.stringify(de.rail)})`],
    [de.console === "Agentenkonsole" && /^Geben Sie zuerst/.test(de.notice || "") && /^Enter a base service/.test(en.notice || ""), "the console and a notice written by code"],
    [Array.isArray(checks.englishLeft) && checks.englishLeft.length === 0, `no English-only text on the German page (${JSON.stringify(checks.englishLeft)})`],
    [["controls.abort", "controls.abort.none"].every((k) => checks.plantedFound?.includes(k)), `the check finds planted English, a word and a sentence (${JSON.stringify(checks.plantedFound)})`],
    [checks.dialogDe?.title === "Diagnose" && checks.dialogDe?.close === "Dialog schließen", `a dialog opened in German (${JSON.stringify(checks.dialogDe)})`],
    [checks.dialogEn?.title === "Diagnostics" && checks.dialogEn?.close === "Close dialog" && checks.dialogEn?.status === "Pass", `the open dialog follows a switch (${JSON.stringify(checks.dialogEn)})`]
  ]);
}

// ---- catalogue ----------------------------------------------------------------------------------------------
if (wanted("catalogue")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  try {
    checks.chips = await page.$$eval(".catalogue-chip", (els) => els.length);
    checks.groups = await page.$$eval(".catalogue-group h3", (els) => els.map((e) => e.textContent.trim()));
    // Start with nothing chosen: a notice asks for a service, and the field takes the focus.
    await page.click("#btn-start");
    checks.needService = await text(page, '.entry[data-type="notice"][data-level="warn"] .entry-body');
    checks.focus = await page.evaluate(() => document.activeElement?.id);
    await page.click('.catalogue-chip[data-entry="fit-connect"]');
    checks.field = await page.inputValue("#service-input");
    checks.pressed = await page.isChecked('.catalogue-chip[data-entry="fit-connect"] input');
    checks.sources = await page.$$eval(".catalogue-sources a", (els) => els.map((a) => a.href));
    checks.detail = await text(page, ".catalogue-detail-name");
    await shot(page, "04-catalogue-chosen.png");
    // Typed letters: the suggestions, the keyboard's choice.
    await page.fill("#service-input", "");
    await page.type("#service-input", "Bund");
    await page.waitForSelector("#service-suggestions:not([hidden]) [role=option]");
    checks.suggestions = await page.$$eval("#service-suggestions [role=option]", (els) => els.map((e) => e.dataset.entry));
    checks.expanded = await page.getAttribute("#service-input", "aria-expanded");
    await shot(page, "05-suggestions.png");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    checks.active = await page.getAttribute("#service-input", "aria-activedescendant");
    await page.keyboard.press("Enter");
    checks.picked = await page.inputValue("#service-input");
    checks.pickedChip = await page.isChecked('.catalogue-chip[data-entry="bundid"] input');
    // A near miss still finds its entry; Enter in the field starts.
    await page.fill("#service-input", "Onlineausweis");
    await page.waitForSelector("#service-suggestions:not([hidden]) [role=option]");
    checks.nearMiss = await page.$eval("#service-suggestions [role=option]", (e) => e.dataset.entry);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Enter");
    await page.waitForSelector(".mode-card");
    checks.willAssess = await text(page, ".run-summary strong");
    await page.keyboard.press("Escape");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("catalogue: chips, sources, suggestions by mouse and keyboard, Enter starts", t, checks, [
    [checks.chips === 16 && JSON.stringify(checks.groups) === JSON.stringify(["Base services", "Platforms and access"]), `16 chips in two groups (${checks.chips}, ${JSON.stringify(checks.groups)})`],
    [/^Enter a base service or platform first/.test(checks.needService || "") && checks.focus === "service-input", "an empty field asks for a service and takes the focus"],
    [checks.field === "FIT-Connect" && checks.pressed === true && checks.detail?.startsWith("FIT-Connect"), "a chip fills the field and shows the entry"],
    [checks.sources?.length >= 1 && checks.sources.every((u) => u.startsWith("https://")), "its starting sources link out"],
    [JSON.stringify(checks.suggestions) === JSON.stringify(["bundesportal", "bundid", "epaybl", "kipitz"]) && checks.expanded === "true", `"Bund" suggests the entries (${JSON.stringify(checks.suggestions)})`],
    [checks.active === "service-option-bundid" && checks.picked === "BundID" && checks.pickedChip === true, "the keyboard picks the second suggestion"],
    [checks.nearMiss === "online-ausweis", "a near miss finds its entry"],
    [checks.willAssess === "Online ID (eID)", `Enter starts; a typed alias resolves to its entry (${checks.willAssess})`]
  ]);
}

// ---- diagnostics ------------------------------------------------------------------------------------------------
if (wanted("diagnostics")) {
  const t = await newPage({ anthropic: keylessProbe });
  const { page } = t;
  const checks = {};
  const statuses = () => page.$$eval(".diag-table tbody tr", (rows) => Object.fromEntries(rows.map((r) => [r.dataset.test, r.querySelector(".diag-status")?.dataset.s])));
  const runAll = async () => {
    await page.click("#btn-run-all");
    await page.waitForFunction(() => [...document.querySelectorAll(".diag-table .diag-status")].every((s) => !["running", "idle"].includes(s.dataset.s)), null, { timeout: 15000 });
  };
  try {
    await page.click("#btn-diagnostics");
    await page.waitForSelector(".diag-table");
    await page.waitForFunction(() => document.querySelectorAll('.diag-checks li').length >= 10);
    checks.local = await statuses();
    await runAll();
    checks.en = await statuses();
    checks.detailEn = await text(page, '.diag-table tr[data-test="anthropic"] td.detail');
    checks.methodEn = await text(page, '.diag-table tr[data-test="method"] td.detail');
    checks.failedChecks = await page.$$eval('.diag-checks li[data-ok="false"]', (els) => els.map((e) => e.textContent.trim()));
    await shot(page, "06-diagnostics-en.png");
    await page.keyboard.press("Escape");
    await page.click('#lang-switch button[data-lang="de"]');
    await page.click("#btn-diagnostics");
    await page.waitForSelector(".diag-table");
    checks.remembered = await text(page, '.diag-table tr[data-test="anthropic"] td.detail');
    await runAll();
    checks.de = await statuses();
    checks.detailDe = await text(page, '.diag-table tr[data-test="anthropic"] td.detail');
    checks.methodDe = await text(page, '.diag-table tr[data-test="method"] td.detail');
    checks.runAllDe = await text(page, "#btn-run-all");
    await shot(page, "07-diagnostics-de.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const all = (s) => s && Object.keys(s).length === 5 && Object.values(s).every((v) => v === "pass");
  await finish("diagnostics: Run all tests passes every row, in English and German", t, checks, [
    [checks.local?.anthropic === "idle" && ["method", "languages", "privacy", "data"].every((k) => checks.local?.[k] === "pass"), `the local checks pass on opening, the API waits (${JSON.stringify(checks.local)})`],
    [all(checks.en), `every row passes in English (${JSON.stringify(checks.en)})`],
    [all(checks.de), `every row passes in German (${JSON.stringify(checks.de)})`],
    [/^Reachable; CORS accepted/.test(checks.detailEn || "") && /^Erreichbar; CORS akzeptiert/.test(checks.detailDe || ""), "the API row in both languages"],
    [/^137 of 137 checks passed\.$/.test(checks.methodEn || "") && /^137 von 137 Prüfungen bestanden\.$/.test(checks.methodDe || ""), `the golden cases recomputed in the browser (${checks.methodEn})`],
    [/früher in dieser Sitzung/.test(checks.remembered || ""), "the earlier result of this tab is shown, in German"],
    [checks.runAllDe === "Alle Tests ausführen", "the button in German"],
    [Array.isArray(checks.failedChecks) && checks.failedChecks.length === 0, `no local check fails (${JSON.stringify(checks.failedChecks)})`]
  ]);
}

// ---- intro ----------------------------------------------------------------------------------------------------
if (wanted("intro")) {
  const t = await newPage({ intro: true });
  const { page } = t;
  const checks = {};
  try {
    await page.waitForSelector(".intro-modal", { timeout: 10000 });
    checks.title = await text(page, ".intro-modal .vc-dialog__title");
    checks.steps = await page.$$eval(".intro-modal .intro-step-title", (els) => els.map((e) => e.textContent.trim()));
    await shot(page, "08-intro.png");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".intro-modal", { state: "detached" });
    checks.seen = await stored(page, KEYS.introSeen);
    await boot(page);
    await page.waitForTimeout(600);
    checks.reopened = (await page.$(".intro-modal")) !== null;
    await page.click('#lang-switch button[data-lang="de"]');
    await page.click('.catalogue-chip[data-entry="epaybl"]');
    await page.click("#btn-about");
    await page.waitForSelector(".intro-modal");
    checks.titleDe = await text(page, ".intro-modal .vc-dialog__title");
    await page.click("#btn-intro-start");
    await page.waitForSelector(".mode-card", { timeout: 5000 });
    checks.modeTitle = await text(page, ".vc-dialog__title");
    await page.keyboard.press("Escape");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("intro: opens on a first visit, reopens from How it works, leads to the mode choice", t, checks, [
    [checks.title === "How the Sovereignty Assessment works", `the intro opens by itself (${checks.title})`],
    [JSON.stringify(checks.steps) === JSON.stringify(["Understand", "Research", "Score", "Your review", "Recommend"]), "the rail's five steps"],
    [checks.seen === "1" && checks.reopened === false, "remembered: it does not open again by itself"],
    [checks.titleDe === "So funktioniert die Souveränitätsbewertung", "How it works reopens it, in German"],
    [checks.modeTitle === "Wie soll der Agent laufen?", "Start agent leads to the mode choice"]
  ]);
}

// ---- kpi -------------------------------------------------------------------------------------------------------
if (wanted("kpi")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  try {
    checks.empty = await page.$$eval("#kpis .kpi-value", (els) => els.map((e) => e.textContent.trim()));
    // The tiles module on the golden case S2, in this page, with this page's engine.
    const read = () => page.evaluate(() => [...document.querySelectorAll("#test-kpis .kpi")].map((k) => `${k.querySelector(".kpi-value").textContent}|${k.querySelector(".kpi-sub").textContent}`));
    await page.evaluate(async () => {
      const golden = (await import("/data/golden.js")).default;
      const { blockFromRow } = await import("/js/selftest.js");
      const { score } = await import("/js/engine.js");
      const { createKpis } = await import("/js/kpi.js");
      const el = document.createElement("div");
      el.id = "test-kpis";
      el.className = "kpis";
      document.body.appendChild(el);
      window.__kpis = createKpis(el);
      window.__kpis.show(score(golden["s2-assessment.json"].blocks.map(blockFromRow)));
    });
    checks.en = await read();
    await page.click('#lang-switch button[data-lang="de"]');
    checks.de = (await read()).map((s) => s.replace(/[  ]/g, " "));
    await page.evaluate(() => window.__kpis.reset());
    checks.reset = await read();
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("kpi: the tiles on S2 in both languages, no data without an assessment", t, checks, [
    [JSON.stringify(checks.empty) === JSON.stringify(["no data", "no data", "no data", "no data"]), `no data before a run (${JSON.stringify(checks.empty)})`],
    [JSON.stringify(checks.en) === JSON.stringify(["72|indicative", "level 0|B-10 B-10", "92%|weighted share of blocks scored", "40%|of scored critical blocks"]), `S2 in English (${JSON.stringify(checks.en)})`],
    [JSON.stringify(checks.de) === JSON.stringify(["72|indikativ", "Stufe 0|B-10 B-10", "92 %|gewichteter Anteil bewerteter Bausteine", "40 %|der bewerteten kritischen Bausteine"]), `S2 in German (${JSON.stringify(checks.de)})`],
    [JSON.stringify(checks.reset) === JSON.stringify(["keine Daten|indikativ", "keine Daten|kein bewerteter kritischer Baustein", "keine Daten|gewichteter Anteil bewerteter Bausteine", "keine Daten|der bewerteten kritischen Bausteine"]), `reset to no data (${JSON.stringify(checks.reset)})`]
  ]);
}

// ---- missing-data: a data file did not deploy -----------------------------------------------------------------
if (wanted("missing-data")) {
  blockLocal.add("/data/catalogue.js");
  const t = await newPage({ url: null });
  const { page } = t;
  const checks = {};
  try {
    await page.goto(BASE);
    await page.waitForSelector('#boot[data-state="failed"]', { timeout: 15000 });
    checks.detail = (await page.textContent("#boot-detail")).trim();
    checks.status = (await page.textContent("#boot-status")).trim();
    await shot(page, "09-missing-data.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  blockLocal.delete("/data/catalogue.js");
  await finish("missing-data: the boot screen names the file", t, checks, [
    [/data\/catalogue\.js/.test(checks.detail || ""), `the missing file is named (${checks.detail})`],
    [checks.status === "The Sovereignty Assessment could not start.", "the boot status says so"]
  ], /Start-up failed/);
}

await browser.close();
await close();
await writeFile(path.join(OUT, "smoke-results.json"), JSON.stringify(results, null, 2));
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  for (const p of r.problems) console.log(`      - ${p}`);
  if (r.pageErrors.length || r.consoleErrors.length || r.csp.length) console.log(`      errors: ${JSON.stringify({ page: r.pageErrors, console: r.consoleErrors, csp: r.csp }).slice(0, 400)}`);
}
const passedAll = results.length > 0 && results.every((r) => r.ok);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} smoke cases passed. Screenshots: ${OUT}`);
if (passedAll && ONLY.length === 0) console.log("SMOKE OK");
process.exit(passedAll ? 0 : 1);
