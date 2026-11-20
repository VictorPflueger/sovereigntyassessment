// Smoke tests of the start flow, both languages and the failure modes of loading (the runs themselves
// are tests/live.mjs and tests/sims.mjs):
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
//   compare           two loaded assessments overlaid on one spider diagram by layer and side by side in a
//                     table, with the engine's numbers, in both languages (AC-16)
//   portfolio         the golden case S4 loaded from assessment files: 33% and 67%, sorted scores and the
//                     waffle from the engine, the self-assessment left out, a broken file refused (AC-16)
//   exports           after a pre-run, the four exports with their names, in the active language, the HTML
//                     self-contained, the JSON valid against the schemas (AC-17)
//   method            the method view and its sources; a weight change recomputes, is logged and reported
//   names             accessible names (AC-20): each of the spider's axes is an image named with its layer or
//                     block and its value, each honeycomb cell is named with its block, level and codes, in
//                     English and after a switch in German; every quote carries the language it was read
//                     in, in the evidence of the Building blocks tab and in the report's sources
//   missing-data      a data file is missing: the boot screen names it
// Every case fails on a page error, a console error, a policy violation, or a request to another host
// than this test server (api.anthropic.com is answered by a stand-in where a case needs it).
// Usage: node tests/smoke.mjs [case…]
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, NETWORK_NOISE, SKIP_INTRO, KEYS } from "./lib/harness.mjs";
import { fixture, fixtureAssessment } from "./lib/fixtures.mjs";

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
      chip: q('.catalogue-chip[data-entry="online-ausweis"] .chip-name'),
      preRun: q('.catalogue-chip[data-entry="online-ausweis"] .prerun-mark'),
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
    // The warning folded the drawer away from the console (it opens over the console's column); open it
    // again, so its words are read open.
    checks.foldedForNotice = await page.evaluate(() => document.querySelector("#drawer")?.dataset.open === "false");
    await page.click("#tab-blocks");
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
    [en.preRun === "pre-run available" && de.preRun === "vorab erstellter Lauf verfügbar", "the pre-run mark's hidden label follows"],
    [checks.foldedForNotice === true, "a warning in the console folds the drawer away from it"],
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
    [checks.chips === 17 && JSON.stringify(checks.groups) === JSON.stringify(["Base services", "Platforms and access", "This prototype"]), `17 chips in three groups, the self-assessment last (${checks.chips}, ${JSON.stringify(checks.groups)})`],
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
    // The weakest-link tile's tooltip says it weighs only the critical blocks (the review's finding R-22).
    const tip = () => page.$eval('#test-kpis .kpi[data-tile="weakest"]', (el) => el.getAttribute("title") || "");
    checks.tipEn = await tip();
    await page.click('#lang-switch button[data-lang="de"]');
    checks.de = (await read()).map((s) => s.replace(/[  ]/g, " "));
    checks.tipDe = await tip();
    await page.evaluate(() => window.__kpis.reset());
    checks.reset = await read();
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  await finish("kpi: the tiles on S2 in both languages, no data without an assessment", t, checks, [
    [JSON.stringify(checks.empty) === JSON.stringify(["no data", "no data", "no data", "no data"]), `no data before a run (${JSON.stringify(checks.empty)})`],
    [JSON.stringify(checks.en) === JSON.stringify(["72|indicative", "level 0|B-10 B-10", "92%|weighted share of blocks scored", "40%|of scored critical blocks"]), `S2 in English (${JSON.stringify(checks.en)})`],
    [JSON.stringify(checks.de) === JSON.stringify(["72|indikativ", "Stufe 0|B-10 B-10", "92 %|gewichteter Anteil bewerteter Bausteine", "40 %|der bewerteten kritischen Bausteine"]), `S2 in German (${JSON.stringify(checks.de)})`],
    [JSON.stringify(checks.reset) === JSON.stringify(["keine Daten|indikativ", "keine Daten|kein bewerteter kritischer Baustein", "keine Daten|gewichteter Anteil bewerteter Bausteine", "keine Daten|der bewerteten kritischen Bausteine"]), `reset to no data (${JSON.stringify(checks.reset)})`],
    [/The lowest level among the critical blocks; important and supporting blocks count in the layer scores, not here\.$/.test(checks.tipEn || "") && /Die niedrigste Stufe unter den kritischen Bausteinen; wichtige und unterstützende Bausteine zählen in den Ebenenwerten, nicht hier\.$/.test(checks.tipDe || ""), `the weakest-link tile's tooltip in both languages (${checks.tipEn}; ${checks.tipDe})`]
  ]);
}

// ---- version 0.3.0: Compare, the Portfolio, the exports and the method view --------------------------------
const nbsp = (s) => String(s ?? "").replace(/[  ]/g, " ");
const LAYER_ORDER = ["infrastructure", "devsecops", "platform", "base_service", "applications", "access"];
const centre = async (page, view) => { await page.click(`#centre-views button[data-centre="${view}"]`); await page.waitForTimeout(150); };
const fast = (page) => page.evaluate(async () => { const st = await import("/js/state.js"); window.__getState = st.getState; st.setState({ speed: 40 }); });
const waitRun = (page, states) => page.waitForFunction((s) => s.includes(window.__getState().runState), states, { timeout: 90000 });
/** A pre-run played to its report: the review confirmed, the lever (or "keep") approved. */
async function playToEnd(page, entry, choice = "keep") {
  await fast(page);
  await page.click(`.catalogue-chip[data-entry="${entry}"]`);
  await page.click("#btn-start");
  await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
  await waitRun(page, ["awaiting_review"]);
  await page.click("#btn-review-confirm");
  await waitRun(page, ["awaiting_decision"]);
  await page.click(`.lever-card[data-lever="${choice}"] .lever-id`);
  await page.click("#btn-approve-lever");
  await waitRun(page, ["done", "stopped", "aborted", "error"]);
}
/** Shows a drawer tab (a click on the tab that already shows would fold the drawer away). */
async function openTab(page, id) {
  const shown = await page.evaluate((tab) => document.querySelector(".drawer")?.dataset.open === "true" && document.querySelector(`#tab-${tab}`)?.getAttribute("aria-selected") === "true", id);
  if (!shown) await page.click(`#tab-${id}`);
}
/** A download the click starts: { name, text }. */
async function save(page, selector) {
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 15000 }), page.click(selector)]);
  const file = await dl.path();
  const { readFile } = await import("node:fs/promises");
  return { name: dl.suggestedFilename(), text: await readFile(file, "utf8") };
}

// ---- compare (AC-16) -------------------------------------------------------------------------------------
if (wanted("compare")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  try {
    await centre(page, "compare");
    await page.waitForSelector("#cmp-table");
    checks.options = await page.$$eval("#cmp-a option", (els) => els.map((e) => e.value));
    await page.selectOption("#cmp-a", "entry:bundid");
    await page.selectOption("#cmp-b", "entry:epaybl");
    await page.waitForFunction(() => document.querySelector("#cmp-table caption")?.textContent.includes("ePayBL"));
    const read = () => page.evaluate(async (order) => {
      const { loadedItems, assessmentOf } = await import("/js/loaded.js");
      const { scoreAssessment } = await import("/js/assessment.js");
      const { getLang } = await import("/js/i18n/index.js");
      const items = loadedItems();
      const lang = getLang();
      const ra = scoreAssessment(await assessmentOf(items.find((i) => i.key === "entry:bundid"), lang));
      const rb = scoreAssessment(await assessmentOf(items.find((i) => i.key === "entry:epaybl"), lang));
      const svg = document.querySelector(".cmp-spider svg.spider");
      const axes = [...svg.querySelectorAll(".sp-axis-g")].map((g) => ({ id: g.dataset.axis, value: g.dataset.value, dashed: g.dataset.dashed }));
      const bMarks = Object.fromEntries([...svg.querySelectorAll(".sp-marker--b")].map((m) => [m.dataset.axis, m.dataset.value]));
      const cell = (key, series) => document.querySelector(`#cmp-table td[data-key="${key}"][data-series="${series}"]`);
      return {
        expectA: order.map((l) => ra.layers[l].score), expectB: order.map((l) => rb.layers[l].score),
        axes, bMarks, areas: [svg.querySelectorAll(".sp-area").length, svg.querySelectorAll(".sp-area--b").length],
        tableA: order.map((l) => cell(`score.layer.${l}`, "a")?.dataset.value), tableB: order.map((l) => cell(`score.layer.${l}`, "b")?.dataset.value),
        overall: [cell("score.overall", "a")?.textContent, cell("score.overall", "b")?.textContent, ra.overall, rb.overall],
        layersRow: [cell("layers", "a")?.textContent, cell("layers", "b")?.textContent, order.filter((l) => ra.layers[l].score !== null).length, order.filter((l) => rb.layers[l].score !== null).length],
        caption: document.querySelector("#cmp-table caption")?.textContent, head: document.querySelector("#cmp-title")?.textContent,
        pressed: document.querySelector('#centre-views button[data-centre="compare"]')?.getAttribute("aria-pressed")
      };
    }, LAYER_ORDER);
    checks.en = await read();
    await shot(page, "10-compare-en.png");
    await page.click('#lang-switch button[data-lang="de"]');
    await page.waitForFunction(() => document.querySelector("#cmp-title")?.textContent === "Vergleich");
    checks.de = await read();
    await shot(page, "11-compare-de.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const val = (x) => (x === null || x === undefined ? "" : String(x));
  const fits = (r) => !!r && r.axes.length === 6 && r.axes.every((a, i) => a.id === LAYER_ORDER[i])
    && r.axes.every((a, i) => a.value === val(r.expectA[i]))
    && LAYER_ORDER.every((l, i) => (r.bMarks[l] ?? "") === val(r.expectB[i]))
    && r.axes.every((a, i) => a.dashed === String(r.expectA[i] === null && r.expectB[i] === null))
    && r.tableA.every((v, i) => v === val(r.expectA[i])) && r.tableB.every((v, i) => v === val(r.expectB[i]));
  await finish("compare: two assessments overlaid by layer and side by side, the engine's numbers, in both languages", t, checks, [
    [(checks.options || []).length >= 6 && checks.options.includes("entry:bundid") && checks.options.includes("entry:epaybl"), `the pre-runs are loaded (${(checks.options || []).length})`],
    [fits(checks.en), `English: six axes in the portal's order, both series and the table equal to the engine (${JSON.stringify(checks.en?.axes)} ${JSON.stringify(checks.en?.bMarks)})`],
    [fits(checks.de), "German: the same numbers"],
    [JSON.stringify(checks.en?.areas) === "[2,1]", `two areas, the second dashed (${JSON.stringify(checks.en?.areas)})`],
    [checks.en?.overall?.[0] === String(Math.round(checks.en?.overall?.[2])) && checks.en?.overall?.[1] === String(Math.round(checks.en?.overall?.[3])), `the overall scores (${JSON.stringify(checks.en?.overall)})`],
    [checks.en?.head === "Compare" && /BundID and ePayBL side by side/.test(checks.en?.caption || "") && checks.de?.head === "Vergleich" && /BundID und ePayBL nebeneinander/.test(checks.de?.caption || ""), `the view's words in each language (${checks.en?.caption} / ${checks.de?.caption})`],
    [checks.en?.pressed === "true", "the switch says Compare"],
    // How many layers each score rests on (the review's finding R-11).
    [checks.en?.layersRow?.[0] === `${checks.en.layersRow[2]} of 6` && checks.en.layersRow[1] === `${checks.en.layersRow[3]} of 6` && checks.de?.layersRow?.[0] === `${checks.de.layersRow[2]} von 6`, `the layers scored (${JSON.stringify(checks.en?.layersRow)} / ${JSON.stringify(checks.de?.layersRow)})`]
  ]);
}

// ---- portfolio (AC-16, S4 on the loaded set) -----------------------------------------------------------------
if (wanted("portfolio")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  try {
    const s4 = fixture("s4-portfolio.json");
    const s2 = fixture("s2-assessment.json");
    const files = s4.assessments.map((a) => ({ name: `${a.service}.json`, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(fixtureAssessment({ service: a.service, category: a.category, rows: a.from ? s2.blocks : a.blocks }))) }));
    // A self-assessment with a critical block at level 0: counted, it would change both shares.
    files.push({ name: "self.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(fixtureAssessment({ service: "This prototype", category: "self_assessment", rows: [{ id: "B-01", layer: "platform", criticality: "critical", made_in: "US", licence: "proprietary", run_by: "US", hosting: "NON_EU" }] }))) });
    files.push({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ service: { query: "Broken" }, category: "base_service" })) });
    await centre(page, "portfolio");
    await page.waitForSelector("#pf-clear");
    checks.before = await page.$$eval(".pf-row", (els) => els.length);
    checks.mddNote = await page.$eval('.pf-row[data-key="entry:marktplatz-deutschland-digital"] .pf-layers', (e) => e.textContent).catch(() => null);
    checks.bundidNote = await page.$eval('.pf-row[data-key="entry:bundid"] .pf-layers', (e) => e.textContent).catch(() => null);
    await page.click("#pf-clear");
    await page.waitForFunction(() => !document.querySelectorAll(".pf-row").length);
    await page.setInputFiles("#pf-file", files);
    await page.waitForFunction(() => document.querySelectorAll(".pf-row").length === 3, null, { timeout: 15000 });
    const read = () => page.evaluate(async () => {
      const { loadedAssessments } = await import("/js/loaded.js");
      const { scoreAssessment, effectiveBlocks } = await import("/js/assessment.js");
      const { portfolio } = await import("/js/engine.js");
      const list = await loadedAssessments("en");
      const p = portfolio(list.map(({ item, assessment }) => ({ service: item.key, category: assessment.category, blocks: effectiveBlocks(assessment) })));
      const rows = [...document.querySelectorAll(".pf-row")].map((r) => ({ key: r.dataset.key, overall: r.dataset.overall, value: r.querySelector(".pf-value").textContent, layersNote: r.querySelector(".pf-layers")?.textContent || null }));
      const layersOf = (s) => Object.values(s.layers).filter((L) => L.score !== null).length;
      const expected = list.filter((x) => x.assessment.category !== "self_assessment").map(({ item, assessment }) => { const s = scoreAssessment(assessment); return { key: item.key, overall: s.overall, layers: layersOf(s) }; }).sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1));
      const share = (cat) => document.querySelector(`.pf-cat[data-category="${cat}"] .pf-share-value`)?.textContent;
      const waffle = (cat) => Object.fromEntries([...document.querySelectorAll(`.pf-cat[data-category="${cat}"] .waffle-group`)].map((g) => [g.dataset.cls, Number(g.dataset.n)]));
      const drawn = (cat) => [...document.querySelectorAll(`.pf-cat[data-category="${cat}"] .waffle-group`)].reduce((n, g) => n + g.querySelectorAll(".waffle-hex").length, 0);
      const nonzero = (o) => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v > 0));
      return {
        rows, expected, status: document.querySelector(".pf-status")?.textContent, lead: document.querySelector("#pf-title + .view-lead, .portfolio .view-lead")?.textContent,
        share: { base: share("base_service"), platform: share("platform_or_access") },
        counts: { base: `${p.categories.base_service?.exclusive} of ${p.categories.base_service?.critical}`, platform: `${p.categories.platform_or_access?.exclusive} of ${p.categories.platform_or_access?.critical}` },
        waffle: { base: waffle("base_service"), platform: waffle("platform_or_access") },
        drawn: { base: drawn("base_service"), platform: drawn("platform_or_access") },
        engineMix: { base: nonzero(p.categories.base_service?.made_in), platform: nonzero(p.categories.platform_or_access?.made_in) },
        selfRow: document.querySelector('.pf-table tr[data-origin="file"] .vc-tag')?.textContent || null,
        loaded: document.querySelectorAll(".pf-table tbody tr").length
      };
    });
    checks.en = await read();
    await shot(page, "12-portfolio-s4-en.png");
    await page.click('#lang-switch button[data-lang="de"]');
    await page.waitForFunction(() => document.querySelector("#pf-title")?.textContent === "Portfolio" && document.querySelector(".pf-scores h3")?.textContent.startsWith("Gesamtwerte"));
    checks.de = await read();
    await shot(page, "13-portfolio-s4-de.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const sorted = (r) => !!r && r.rows.length === r.expected.length && r.rows.every((row, i) => row.key === r.expected[i].key && row.overall === String(r.expected[i].overall));
  await finish("portfolio: S4 for the loaded set, 33% and 67% (33 % and 67 %), sorted scores and the waffle from the engine, the self-assessment left out", t, checks, [
    [checks.before >= 6, `the pre-runs were loaded first (${checks.before})`],
    // A score on fewer than six layers says on how many (the review's finding R-11): the Marktplatz's three of
    // six among the pre-runs, BundID's five; and so does each bar of the loaded files.
    [checks.mddNote === "3 of 6 layers" && checks.bundidNote === "5 of 6 layers", `the pre-runs' notes (${checks.mddNote}; ${checks.bundidNote})`],
    [checks.en?.rows?.length === checks.en?.expected?.length && checks.en.rows.every((r) => { const e = checks.en.expected.find((x) => x.key === r.key); return e && (e.overall === null || e.layers === 6 ? r.layersNote === null : r.layersNote === `${e.layers} of 6 layers`); }), `each bar's layers note (${JSON.stringify(checks.en?.rows?.map((r) => r.layersNote))} for ${JSON.stringify(checks.en?.expected?.map((e) => e.layers))})`],
    [checks.en?.rows?.[0]?.key === "file:query:musterdienst:2026-11-20:hand_authored" && checks.en?.rows?.[0]?.value === "72", `Musterdienst is S2: overall 72, the highest (${JSON.stringify(checks.en?.rows?.[0])})`],
    [checks.en?.share?.base === "33%" && checks.en?.share?.platform === "67%", `English shares (${JSON.stringify(checks.en?.share)})`],
    [nbsp(checks.de?.share?.base) === "33 %" && nbsp(checks.de?.share?.platform) === "67 %", `German shares (${JSON.stringify(checks.de?.share)})`],
    [checks.en?.counts?.base === "3 of 9" && checks.en?.counts?.platform === "2 of 3", `pooled over the scored critical blocks (${JSON.stringify(checks.en?.counts)})`],
    [sorted(checks.en) && sorted(checks.de), `the bars sorted by the engine's overall scores (${JSON.stringify(checks.en?.rows)})`],
    [JSON.stringify(checks.en?.waffle) === JSON.stringify(checks.en?.engineMix) && checks.en?.drawn?.base === Object.values(checks.en?.engineMix?.base || {}).reduce((a, b) => a + b, 0), `the waffle's groups and cells equal the engine's Made-in mix (${JSON.stringify(checks.en?.waffle)})`],
    [checks.en?.loaded === 4 && /left out/.test(checks.en?.selfRow || "") && /left out/.test(checks.en?.lead || ""), `the self-assessment is loaded and left out (${checks.en?.selfRow}; ${checks.en?.lead})`],
    [/Files loaded: 4\./.test(checks.en?.status || "") && /broken\.json is not an assessment this app can read/.test(checks.en?.status || ""), `the loading says what it read and what it refused (${checks.en?.status})`]
  ]);
}

// ---- exports (AC-17) -------------------------------------------------------------------------------------------
if (wanted("exports")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  try {
    await playToEnd(page, "bundid", "L1");
    await openTab(page, "outbox");
    await page.waitForSelector('#btn-file-reportMd[aria-disabled="false"]');
    const all = async () => ({ md: await save(page, "#btn-file-reportMd"), html: await save(page, "#btn-file-reportHtml"), json: await save(page, "#btn-file-assessment"), audit: await save(page, "#btn-file-audit") });
    const valid = (files) => page.evaluate(async ({ json, audit }) => {
      const { validate } = await import("/js/schema.js");
      const S = window.SA_SCHEMAS;
      const a = JSON.parse(json);
      const log = JSON.parse(audit);
      const rows = [...log.events, ...log.model_calls];
      const bad = rows.filter((r) => !validate(r, S.AuditEvent, S).valid).map((r) => r.type);
      const tile = document.querySelector("#kpi-overall-value")?.textContent.trim();
      const { fmtScore } = await import("/js/format.js");
      return { assessment: validate(a, S.Assessment, S).errors.slice(0, 3), lang: a.lang, entry: a.service.entry_id, blocks: a.blocks.length, overall: fmtScore(a.result.facts["score.overall"], "en"), tile, auditRows: rows.length, auditBad: bad, auditKind: log.kind };
    }, { json: files.json.text, audit: files.audit.text });
    checks.en = await all();
    checks.enValid = await valid(checks.en);
    // The interface in German after the run: what code writes follows; the findings keep English.
    await page.click('#lang-switch button[data-lang="de"]');
    await page.waitForFunction(() => document.querySelector("#btn-file-reportMd")?.textContent.includes("Bericht"));
    checks.switched = await all();
    await shot(page, "14-exports-outbox-de.png");
    // A run in German: everything German.
    await page.click("#btn-reset");
    await playToEnd(page, "epaybl", "keep");
    await openTab(page, "outbox");
    await page.waitForSelector('#btn-file-reportMd[aria-disabled="false"]');
    checks.de = await all();
    checks.deValid = await valid(checks.de);
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const names = (f, service, date, lang) => !!f && f.md.name === `sovereignty-assessment-report-${service}-${date}-${lang}.md` && f.html.name === `sovereignty-assessment-report-${service}-${date}-${lang}.html`
    && f.json.name === `sovereignty-assessment-${service}-${date}-${lang}.json` && /^sovereignty-assessment-audit-run-[0-9a-z-]+-(en|de)\.json$/.test(f.audit.name) && f.audit.name.endsWith(`-${lang}.json`);
  const selfContained = (html) => !!html && /^<!doctype html>/i.test(html) && !/<script\b/i.test(html) && !/\s(src|srcset)=/i.test(html) && !/<link\b/i.test(html) && !/@import|url\(/i.test(html) && /Content-Security-Policy" content="default-src 'none'/.test(html) && /<svg\b/.test(html);
  const leftover = (f) => !f ? ["no files"] : [f.md.text, f.html.text].flatMap((x) => [...x.matchAll(/\{\{[^}]*\}\}|\bundefined\b|\bNaN\b/g)].map((m) => m[0]));
  const keyLike = (f) => !!f && Object.values(f).some((x) => /sk-ant-/.test(x.text));
  await finish("exports: the report as Markdown and HTML, the assessment and the audit as JSON, with the stated names, in the active language, valid against the schemas", t, checks, [
    [names(checks.en, "bundid", "2026-11-20", "en") && names(checks.switched, "bundid", "2026-11-20", "de") && names(checks.de, "epaybl", "2026-11-19", "de"), `the names (${JSON.stringify([checks.en?.md?.name, checks.en?.json?.name, checks.en?.audit?.name, checks.de?.html?.name])})`],
    [/## Corrections by the reviewer/.test(checks.en?.md?.text || "") && /Lever L1 was approved/.test(checks.en?.md?.text || "") && /Draft\. Nothing is sent\./.test(checks.en?.md?.text || "") && !/The findings above are in/.test(checks.en?.md?.text || ""), "the English report in Markdown"],
    [/<html lang="en">/.test(checks.en?.html?.text || "") && /<h1>Sovereignty assessment: BundID<\/h1>/.test(checks.en?.html?.text || "") && selfContained(checks.en?.html?.text), "the English HTML report, self-contained"],
    [/## Korrekturen/.test(checks.switched?.md?.text || "") && /Entwurf\. Nichts wird versendet\./.test(checks.switched?.md?.text || "") && /# BundID: findings/.test(checks.switched?.md?.text || "") && /Die Befunde oben sind auf Englisch/.test(checks.switched?.md?.text || ""), "after a switch: code's parts in German, the English findings marked as such"],
    [/<html lang="de">/.test(checks.switched?.html?.text || "") && /<div class="findings" lang="en">/.test(checks.switched?.html?.text || "") && selfContained(checks.switched?.html?.text), "after a switch: the HTML is German, the findings carry lang=en"],
    [/## Korrekturen/.test(checks.de?.md?.text || "") && !/Die Befunde oben sind auf/.test(checks.de?.md?.text || "") && /<html lang="de">/.test(checks.de?.html?.text || "") && /Souveränitätsbewertung: ePayBL/.test(checks.de?.html?.text || ""), "a German run: everything German"],
    [!leftover(checks.en).length && !leftover(checks.switched).length && !leftover(checks.de).length, `no unresolved placeholder or broken value (${JSON.stringify(leftover(checks.en))})`],
    [checks.enValid && !checks.enValid.assessment.length && checks.enValid.lang === "en" && checks.enValid.entry === "bundid" && checks.enValid.blocks >= 5 && checks.enValid.overall === checks.enValid.tile, `the English assessment JSON is valid and matches the tile (${JSON.stringify(checks.enValid)})`],
    [checks.deValid && !checks.deValid.assessment.length && checks.deValid.lang === "de" && checks.deValid.entry === "epaybl", `the German assessment JSON is valid (${JSON.stringify(checks.deValid?.assessment)})`],
    [checks.enValid?.auditKind === "audit" && checks.enValid.auditRows > 20 && !checks.enValid.auditBad.length && !checks.deValid?.auditBad?.length, `every audit row is a valid AuditEvent (${JSON.stringify(checks.enValid?.auditBad)})`],
    [!keyLike(checks.en) && !keyLike(checks.switched) && !keyLike(checks.de), "no key-like string in any file"]
  ]);
}

// ---- names (AC-20) -------------------------------------------------------------------------------------------------
if (wanted("names")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  /** The accessibility tree's view of the map: the spider's named images and the honeycomb's cells. */
  const names = () => page.evaluate(() => ({
    axes: [...document.querySelectorAll(".sov-spider svg.spider .sp-axis-g")].map((g) => ({ role: g.getAttribute("role"), name: g.getAttribute("aria-label") || "" })),
    svgRole: document.querySelector(".sov-spider svg.spider")?.getAttribute("role"),
    hidden: [...document.querySelectorAll(".sov-spider svg.spider > g.sp-markers, .sov-spider svg.spider > polygon.sp-area")].every((e) => e.getAttribute("aria-hidden") === "true"),
    cells: [...document.querySelectorAll(".hc-cell")].map((c) => ({ block: c.dataset.block || null, name: c.getAttribute("aria-label") || "", tag: c.tagName, role: c.getAttribute("role") }))
  }));
  try {
    await fast(page);
    await page.click('.catalogue-chip[data-entry="bundid"]');
    await page.click("#btn-start");
    await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
    await waitRun(page, ["awaiting_review"]);
    checks.en = await names();
    // The same names as the accessibility tree reports them (Playwright's ARIA snapshot).
    checks.snapshot = await page.locator(".sov-spider svg.spider").ariaSnapshot();
    await page.click('.sov-views button[data-view="block"]');
    await page.waitForSelector('.spider[data-view="block"]');
    checks.enBlocks = await names();
    await page.click('.sov-views button[data-view="layer"]');
    await page.click('#lang-switch button[data-lang="de"]');
    await page.waitForFunction(() => document.documentElement.lang === "de");
    await page.waitForTimeout(300);
    checks.de = await names();
    // The evidence of a block in the Building blocks tab: each quote with its language.
    await openTab(page, "blocks");
    await page.waitForSelector(".blocks-table .row-toggle");
    await page.click(".blocks-table .row-toggle");
    await page.waitForSelector("blockquote.evidence-quote");
    checks.evidence = await page.$$eval("blockquote.evidence-quote", (qs) => qs.map((q) => ({ lang: q.getAttribute("lang"), text: q.textContent.trim().slice(0, 40) })));
    await page.click('#lang-switch button[data-lang="en"]');
    await openTab(page, "review");
    await page.click("#btn-review-confirm");
    await waitRun(page, ["awaiting_decision"]);
    await page.click('.lever-card[data-lever="L1"] .lever-id');
    await page.click("#btn-approve-lever");
    await waitRun(page, ["done", "stopped", "aborted", "error"]);
    await openTab(page, "outbox");
    await page.waitForSelector('.outbox-card[data-draft="report"]');
    checks.report = await page.evaluate(async () => {
      const card = document.querySelector('.outbox-card[data-draft="report"] .md');
      const spans = [...card.querySelectorAll(".quote-text")].map((s) => ({ lang: s.getAttribute("lang"), text: s.textContent }));
      // The sources the report lists, as the run published them.
      const items = [...card.querySelectorAll("li")].filter((li) => /“/.test(li.textContent));
      return { spans, quoted: items.length, cardLang: card.getAttribute("lang") };
    });
  } catch (err) { checks.FAILED = String(err.message).split("\n").slice(0, 6).join(" / "); }
  const layerNames = (n, re) => !!n && n.svgRole === "group" && n.hidden && n.axes.length === 6 && n.axes.every((a) => a.role === "img" && re.test(a.name));
  const cellNames = (n, re) => !!n && n.cells.filter((c) => c.block).length >= 5 && n.cells.every((c) => (c.block ? c.tag === "BUTTON" && c.name.startsWith(c.block) && re.test(c.name) : c.role === "img" && c.name.length > 5));
  const evidence = checks.evidence || [];
  const spans = checks.report?.spans || [];
  await finish("names: the spider's axes and the honeycomb's cells are named in both languages, and every quote carries its language", t, checks, [
    [layerNames(checks.en, /^(Infrastructure|Development, security and operations|Platform|Base services|Applications and services|Interface and access) \(German: [^)]+\): (\d+|no evidence found|not researched yet)$/), `English: six named axes, the web a group (${JSON.stringify(checks.en?.axes?.map((a) => a.name))})`],
    [/img "Infrastructure \(German: Infrastruktur\): 100"/.test(checks.snapshot || "") && (checks.snapshot.match(/img "/g) || []).length === 6, `the accessibility tree has the six axes (${(checks.snapshot || "").split("\n").slice(0, 3).join(" | ")})`],
    [!!checks.enBlocks && checks.enBlocks.axes.length >= 5 && checks.enBlocks.axes.every((a) => a.role === "img" && /^B-\d\d .+: (level \d|gap)/.test(a.name)), `the block view: an axis per block, named (${JSON.stringify(checks.enBlocks?.axes?.slice(0, 2))})`],
    [cellNames(checks.en, /level \d|gap|unknown/), `English: every cell named with its block (${JSON.stringify(checks.en?.cells?.slice(0, 2))})`],
    [layerNames(checks.de, /^(Infrastruktur|Entwicklung, Sicherheit und Betrieb|Plattform|Basisdienst|Anwendungen und Dienstleistungen|Oberfläche und Zugang)/) && cellNames(checks.de, /Stufe \d|Lücke|unbekannt/), `German: the axes and cells named in German (${JSON.stringify(checks.de?.axes?.[0])}; ${JSON.stringify(checks.de?.cells?.[0])})`],
    [evidence.length >= 1 && evidence.every((q) => /^(de|en)$/.test(q.lang || "")), `every quote in the evidence carries its language (${JSON.stringify(evidence)})`],
    [spans.length >= 1 && spans.length >= (checks.report?.quoted || 0) && spans.every((q) => /^(de|en)$/.test(q.lang || "")) && spans.some((q) => q.lang === "de"), `every quote in the report's sources carries its language (${spans.length} quotes in ${checks.report?.quoted} sources; ${JSON.stringify(spans.slice(0, 2))})`]
  ]);
}

// ---- method -------------------------------------------------------------------------------------------------------
if (wanted("method")) {
  const t = await newPage();
  const { page } = t;
  const checks = {};
  try {
    await page.click("#btn-method");
    await page.waitForSelector(".method-modal .method-table");
    checks.view = await page.evaluate(() => ({
      layers: [...document.querySelectorAll(".method-table tbody tr")].map((r) => r.dataset.layer),
      german: [...document.querySelectorAll(".method-table tbody tr th")].map((th) => th.textContent),
      seal: [...document.querySelectorAll(".method-seal li")].map((li) => li.textContent),
      sources: [...document.querySelectorAll(".method-source a")].map((a) => a.href),
      sections: [...document.querySelectorAll(".method-section h3")].map((h) => h.textContent),
      weights: document.querySelectorAll(".method-weight").length
    }));
    await shot(page, "15-method-en.png");
    await page.click("#btn-method-close");
    await page.click("#kpi-overall");
    checks.fromTile = await page.waitForSelector(".method-modal", { timeout: 5000 }).then(() => true).catch(() => false);
    await page.click("#btn-method-close");
    await playToEnd(page, "bundid", "L1");
    checks.before = (await text(page, "#kpi-overall-value"));
    const w = { infrastructure: 3, devsecops: 1, platform: 1, base_service: 1, applications: 1, access: 0.5 };
    checks.expected = await page.evaluate(async (weights) => {
      const { loadedItems, assessmentOf } = await import("/js/loaded.js");
      const { scoreAssessment } = await import("/js/assessment.js");
      const { fmtScore } = await import("/js/format.js");
      const a = await assessmentOf(loadedItems().find((i) => i.key === "entry:bundid"), "en");
      return { equal: fmtScore(scoreAssessment(a).overall, "en"), weighted: fmtScore(scoreAssessment(a, weights).overall, "en"), raw: scoreAssessment(a, weights).overall };
    }, w);
    await page.click("#btn-method");
    await page.waitForSelector("#weight-infrastructure");
    await page.selectOption("#weight-infrastructure", "3");
    await page.selectOption("#weight-access", "0.5");
    await page.waitForTimeout(200);
    checks.after = await text(page, "#kpi-overall-value");
    checks.log = await page.$$eval(".method-log li", (els) => els.length);
    await page.click("#btn-method-close");
    await openTab(page, "outbox");
    checks.report = await save(page, "#btn-file-reportMd");
    checks.audit = JSON.parse((await save(page, "#btn-file-audit")).text).events.filter((e) => e.type === "weights_change").map((e) => e.payload.to);
    checks.notice = await page.$$eval('#console .entry[data-type="notice"]', (els) => els.map((e) => e.textContent).filter((x) => /You changed the layer weights/.test(x)).length);
    await page.click("#btn-method");
    await page.click("#btn-weights-reset");
    await page.waitForTimeout(200);
    checks.reset = await text(page, "#kpi-overall-value");
    // The page behind the open dialog is inert: the switch comes through the language module.
    await page.evaluate(async () => (await import("/js/i18n/index.js")).setLang("de"));
    await page.waitForFunction(() => document.querySelector(".method-modal .vc-dialog__title")?.textContent === "Methode");
    checks.de = await page.evaluate(() => ({ title: document.querySelector(".method-modal .vc-dialog__title")?.textContent, first: document.querySelector(".method-section h3")?.textContent, english: [...document.querySelectorAll(".method-table tbody tr td:first-of-type")].map((td) => td.textContent)[0] }));
    await shot(page, "16-method-de.png");
  } catch (err) { checks.FAILED = String(err.message).split("\n")[0]; }
  const v = checks.view || {};
  await finish("method: layers, levels with SEAL v1.2.1, scores, weights, classes, evidence and what the score is not; a weight change recomputes, is logged and named in the report", t, checks, [
    [JSON.stringify(v.layers) === JSON.stringify(LAYER_ORDER), `the six layers in the portal's order (${JSON.stringify(v.layers)})`],
    [JSON.stringify(v.german) === JSON.stringify(["Infrastruktur", "Entwicklung, Sicherheit und Betrieb (DevSecOps)", "Plattform", "Basisdienst", "Anwendungen und Dienstleistungen", "Oberfläche und Zugang"]), `the portal's German labels (${JSON.stringify(v.german)})`],
    [(v.seal || []).length === 5 && /SEAL-0, “No Sovereignty”/.test(v.seal[0]) && /SEAL-3, “Digital Resilience”/.test(v.seal[3]) && /SEAL-4, “Full Digital Sovereignty”/.test(v.seal[4]), `the SEAL scale of v1.2.1 (${JSON.stringify(v.seal)})`],
    [(v.sources || []).some((u) => u.includes("deutschland-stack.gov.de/aufbau")) && (v.sources || []).some((u) => u.includes("Cloud-Sovereignty-Framework.pdf")), "the sources are linked"],
    [(v.sections || []).includes("What the score is not") && (v.sections || []).includes("Where a provider comes from") && (v.sections || []).includes("Evidence") && v.weights === 6, `every section and six weights (${JSON.stringify(v.sections)})`],
    [checks.fromTile === true, "the overall tile opens the method"],
    [checks.before === checks.expected?.equal && checks.after === checks.expected?.weighted && checks.after !== checks.before, `the tile follows the weights (${checks.before} → ${checks.after}; engine ${JSON.stringify(checks.expected)})`],
    [checks.log === 2 && JSON.stringify(checks.audit?.map((x) => [x.infrastructure, x.access])) === JSON.stringify([[3, 1], [3, 0.5]]) && checks.notice >= 1, `each change logged: method view, audit, console (${checks.log}, ${JSON.stringify(checks.audit)}, ${checks.notice})`],
    [/## Assumptions/.test(checks.report?.text || "") && /Infrastructure 3/.test(checks.report?.text || "") && /Access 0\.5/.test(checks.report?.text || ""), "the report names the weights"],
    [checks.reset === checks.expected?.equal, `equal weights bring the score back (${checks.reset})`],
    [checks.de?.title === "Methode" && checks.de?.first === "Sechs Ebenen, ein Netzdiagramm" && checks.de?.english === "Infrastructure", `German (${JSON.stringify(checks.de)})`]
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
