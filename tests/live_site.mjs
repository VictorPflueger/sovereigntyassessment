// The published site: GitHub Pages serves exactly the files of this checkout, and the app starts there
// with no error and no request to any other host. Run after a Pages build (the "live site" workflow does
// this on every Pages build) or by hand.
//   files   index.html, the config, the engine, the fact audit, the dictionaries and the data as served
//           equal this checkout (Pages caches for up to ten minutes, so it retries for up to twelve)
//   start   the page boots in English and in German, and Diagnostics' local checks (the golden cases,
//           both languages, the key and privacy rules, the data) pass there; the API row is not run,
//           and api.anthropic.com is refused, so this check never calls the real API (up to three tries
//           a minute apart, for a deployment the CDN is still taking up)
// In GitHub Actions every problem is also printed as an annotation (::error / ::warning).
// Taken from the Timetable Translator's tests/live_site.mjs; version 0.1.0 has no simulation to run yet.
// Usage: node tests/live_site.mjs [url]   (default: the repository's GitHub Pages address; LIVE_URL)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { APP_ROOT, launchBrowser, SKIP_INTRO } from "./lib/harness.mjs";

const URL_BASE = (process.argv[2] || process.env.LIVE_URL || "https://victorpflueger.github.io/sovereigntyassessment/").replace(/\/?$/, "/");
const FILES = ["index.html", "js/config.js", "js/engine.js", "js/facts.js", "js/i18n/en.js", "js/i18n/de.js", "data/catalogue.js", "data/golden.js"];
const WAIT_MS = Number(process.env.LIVE_WAIT_MS || 12 * 60 * 1000);
const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const problems = [];

// 1. The files as served equal this checkout.
const deadline = Date.now() + WAIT_MS;
let stale = FILES;
while (true) {
  stale = [];
  for (const f of FILES) {
    try {
      const r = await fetch(`${URL_BASE}${f}?t=${Date.now()}`, { cache: "no-store" });
      const body = Buffer.from(await r.arrayBuffer());
      if (!r.ok || sha(body) !== sha(fs.readFileSync(path.join(APP_ROOT, f)))) stale.push(`${f} (${r.status})`);
    } catch (e) {
      stale.push(`${f} (${String(e.message || e).slice(0, 60)})`);
    }
  }
  if (!stale.length || Date.now() > deadline) break;
  console.log(`waiting for the site to serve this checkout: ${stale.join(", ")}`);
  await new Promise((r) => setTimeout(r, 30000));
}
if (stale.length) problems.push(`the site does not serve this checkout: ${stale.join(", ")}`);
else console.log(`PASS  files: ${FILES.length} files as served equal this checkout`);

// 2. The app starts there, in both languages, and its local checks pass.
async function startCheck() {
  const found = [];
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await context.addInitScript(SKIP_INTRO);
  // Never the real API from a test: the keyless probe is not run, and the host is refused anyway.
  await context.route(/^https:\/\/api\.anthropic\.com\//, (route) => route.abort("blockedbyclient"));
  const page = await context.newPage();
  const errors = [];
  const hosts = new Set();
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("request", (r) => { try { hosts.add(new URL(r.url()).host); } catch { /* data: URLs */ } });
  try {
    for (const [lang, name] of [["en", "Sovereignty Assessment"], ["de", "Souveränitätsbewertung"]]) {
      await page.goto(`${URL_BASE}?lang=${lang}`, { waitUntil: "load" });
      await page.waitForSelector('html[data-boot="ready"]', { timeout: 30000 });
      const shown = (await page.locator(".app-header .brand-name").innerText()).trim();
      if (shown !== name) found.push(`the ${lang} page is named "${shown}"`);
      await page.click("#btn-diagnostics");
      await page.waitForFunction(() => ["method", "languages", "privacy", "data"].every((id) => ["pass", "fail", "warn"].includes(document.querySelector(`.diag-table tr[data-test="${id}"] .diag-status`)?.dataset.s)), null, { timeout: 30000 });
      const statuses = await page.$$eval(".diag-table tbody tr", (rows) => rows.map((r) => `${r.dataset.test}:${r.querySelector(".diag-status")?.dataset.s}`));
      const bad = statuses.filter((s) => !/^anthropic:/.test(s) && !/:pass$/.test(s));
      if (bad.length) found.push(`Diagnostics' local checks in ${lang}: ${bad.join(", ")}`);
      await page.keyboard.press("Escape");
    }
  } catch (e) {
    found.push(`the app did not start: ${String(e.message || e).split("\n")[0]}`);
  }
  const own = new URL(URL_BASE).host;
  const other = [...hosts].filter((h) => h !== own);
  if (other.length) found.push(`requests to other hosts: ${other.join(", ")}`);
  if (errors.length) found.push(`page errors: ${errors.slice(0, 3).join(" | ")}`);
  await browser.close();
  return found;
}

// In GitHub Actions each problem also becomes an annotation, readable without the job log.
const annotate = (level, text) => { if (process.env.GITHUB_ACTIONS === "true") console.log(`::${level} title=live site::${text.replace(/\r?\n/g, " ")}`); };

if (!stale.length) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const found = await startCheck();
    if (!found.length) { console.log(`PASS  start: the app boots in English and German and its local checks pass on the published site${attempt > 1 ? ` (try ${attempt})` : ""}`); break; }
    if (attempt === 3) { problems.push(...found); break; }
    for (const f of found) { console.log(`WARN  try ${attempt}: ${f}`); annotate("warning", `try ${attempt}: ${f}`); }
    await new Promise((r) => setTimeout(r, 60000));
  }
}

for (const p of problems) annotate("error", p);
for (const p of problems) console.log(`FAIL  ${p}`);
console.log(`${URL_BASE}: ${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
if (!problems.length) console.log("LIVE SITE OK");
process.exit(problems.length ? 1 : 0);
