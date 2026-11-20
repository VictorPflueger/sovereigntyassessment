// Layout for projector use (AC-18; PLAN.md f.1 and f.2):
//   viewports  at 1920×1080, 1600×900, 1536×864, 1366×768 and 1280×720, in both themes and both languages,
//              a pre-run played through seven states: idle (the catalogue), during research, at the review,
//              with the levers, finished with the Outbox open, finished with the drawer hidden, and its
//              block view. In each:
//              no horizontal overflow; the four tiles inside the header, apart from each other and from the
//              badges, and none of their text cut or ellipsed; on the map, the spider's labels inside the
//              diagram and apart from each other and from the values and level ticks, each value clear of
//              its marker, the spider, the mix and the honeycomb inside the map
//              panel, the honeycomb's groups apart and their heads inside them; an open drawer's panel
//              beside the map, never over it (from 1,101 px wide it takes the console's column); and
//              every visible target at least 40 px wide and high (text links inside prose excepted)
//   edges      at 1280×720 and 1366×768, in both languages, the first seconds of a run (every layer still
//              with its status line), the review, the end with the drawer hidden and the block view, for
//              the Marktplatz (three layers without evidence), NOOTS, BundID and the three pre-runs that end
//              without an assessment: the same measures
//   table      the map's table view at the end of BundID's run, at 1280×720 and 1920×1080 in both languages:
//              both tables inside their panel and no cell's text cut (the review's R-23)
//   blocks30   a run of thirty blocks, five per layer, at 1920×1080 and 1280×720 in English and German:
//              the block view's thirty labels inside the diagram and apart from each other, and the
//              honeycomb's thirty cells inside the map panel, none cut
//   targets    at 1920×1080, the dialogs and views a presenter opens: the intro window, the mode dialog,
//              Diagnostics, the method view, Compare and the Portfolio: every target at least 40 px
// Usage: node tests/layout.mjs [case…]
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, SKIP_INTRO } from "./lib/harness.mjs";

const OUT = await outDir("layout");
const { base: BASE, close } = await serveStatic(APP_ROOT, 8769);
const browser = await launchBrowser();
const results = [];
const SIZES = [[1920, 1080], [1600, 900], [1536, 864], [1366, 768], [1280, 720]];
// Pre-runs with long names, long tile notes and a gap, taken in turn across the sizes.
const ENTRIES = ["bundid", "sovereignty-assessment", "muk", "bundesportal", "dvc"];
const TERMINAL = ["done", "stopped", "aborted", "error"];

async function newPage({ width, height, lang = "en", theme = "light" }) {
  const context = await browser.newContext({ viewport: { width, height } });
  await context.addInitScript(SKIP_INTRO);
  await context.addInitScript((th) => { try { localStorage.setItem("vc-theme", th); } catch { /* blocked storage */ } }, theme);
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort("blockedbyclient"));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  await page.goto(`${BASE}?lang=${lang}`);
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  // Measure with the page's own fonts, not a fallback still on screen while they load.
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const st = await import("/js/state.js");
    window.__getState = st.getState;
    st.setState({ speed: 40 });
  });
  return { context, page, errors };
}

/** Waits until no finite animation runs, so sizes are taken at rest. */
const settle = (page) => page.waitForFunction(() => document.getAnimations().filter((a) => a.effect?.getComputedTiming?.().iterations !== Infinity).every((a) => a.playState !== "running"), null, { timeout: 5000 }).catch(() => {});
const waitState = (page, states, timeout = 90000) => page.waitForFunction((s) => s.includes(window.__getState().runState), states, { timeout });

/** Everything this suite measures on the page as it stands; returns the problems found. */
async function measure(page) {
  await settle(page);
  return page.evaluate(() => {
    const out = [];
    const shown = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden" && !el.closest("[hidden]");
    const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const hit = (a, b) => a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
    const within = (a, B, tol = 1) => a.l >= B.l - tol && a.r <= B.r + tol && a.t >= B.t - tol && a.b <= B.b + tol;
    const name = (el) => (el.getAttribute("aria-label") || el.textContent || el.className?.baseVal || el.className || el.tagName).toString().replace(/\s+/g, " ").trim().slice(0, 40);
    // Cut: some ancestor up to the map panel hides what lies outside its box and the element reaches out
    // of it. A scrolling ancestor cuts nothing: what lies beyond its edge is reached by scrolling.
    const cutOff = (el, stop) => {
      const E = box(el);
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        const ox = cs.overflowX;
        const oy = cs.overflowY;
        if (oy === "auto" || oy === "scroll") { if (ox === "visible" || ox === "auto" || ox === "scroll") return false; const A = box(a); return E.l < A.l - 1 || E.r > A.r + 1; }
        if (ox !== "visible" || oy !== "visible") { const A = box(a); if (!within(E, A)) return true; }
        if (a === stop) break;
      }
      return false;
    };
    const W = innerWidth;
    // No horizontal overflow.
    const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if (sw > W + 1) out.push(`horizontal overflow: the page is ${sw} px wide in a ${W} px window`);
    // The tiles: inside the header, apart from each other and from the badges, no text cut or ellipsed.
    const header = document.querySelector(".app-header");
    const H = box(header);
    const tiles = [...document.querySelectorAll("#kpis .kpi")].filter(shown);
    if (tiles.length !== 4) out.push(`${tiles.length} tiles shown, not 4`);
    tiles.forEach((tile, i) => {
      const T = box(tile);
      if (!within(T, H) || T.r > W + 1) out.push(`tile ${i + 1} leaves the header`);
      tiles.slice(i + 1).forEach((other, j) => { if (hit(T, box(other))) out.push(`tiles ${i + 1} and ${i + 2 + j} overlap`); });
      for (const el of tile.querySelectorAll("*")) {
        if (!shown(el) || el.closest("svg")) continue;
        const cs = getComputedStyle(el);
        const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible" || cs.textOverflow === "ellipsis" || (cs.webkitLineClamp && cs.webkitLineClamp !== "none");
        if (clips && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) out.push(`tile ${i + 1}: "${name(el)}" is cut (${el.scrollWidth}×${el.scrollHeight} in ${el.clientWidth}×${el.clientHeight})`);
        if (el.children.length === 0 && el.textContent.trim() && !within(box(el), T)) out.push(`tile ${i + 1}: "${name(el)}" runs out of its tile`);
      }
    });
    for (const badge of [...document.querySelectorAll(".header-badges > *")].filter(shown)) {
      for (const tile of tiles) if (hit(box(badge), box(tile))) out.push(`the badge "${name(badge)}" covers a tile`);
    }
    // The map: the spider's labels inside the diagram and apart; spider, mix and honeycomb inside the panel.
    const panel = document.querySelector(".map-panel");
    const P = box(panel);
    const sov = document.querySelector(".sov-map");
    if (shown(sov)) {
      for (const sel of [".sov-head", ".sov-spider", ".sov-mix", ".sov-bottom", ".sov-table"]) {
        const el = sov.querySelector(sel);
        if (shown(el) && cutOff(el, panel)) out.push(`the map's ${sel.slice(5)} is cut at the map panel's edge`);
      }
      // The spider in view: a map that scrolls keeps its diagram on screen.
      const sp = sov.querySelector(".sov-spider");
      if (shown(sp) && !within(box(sp), P)) out.push("the spider is not fully in view");
      const svgEl = sov.querySelector(".sov-spider svg.spider");
      if (shown(svgEl)) {
        const S = box(svgEl);
        if (S.h < 120) out.push(`the spider is only ${Math.round(S.h)} px high`);
        const labels = [...svgEl.querySelectorAll("text.sp-label")].filter((t) => t.textContent.trim());
        const values = [...svgEl.querySelectorAll("text.sp-value")].filter((t) => t.textContent.trim());
        for (const t of [...labels, ...values]) if (!within(box(t), S) || cutOff(t, panel)) out.push(`the spider's text "${name(t)}" is cut at the diagram's edge`);
        labels.forEach((a, i) => {
          const A = box(a);
          labels.slice(i + 1).forEach((b) => { if (hit(A, box(b))) out.push(`the spider's labels "${name(a)}" and "${name(b)}" overlap`); });
          for (const v of values) if (hit(A, box(v))) out.push(`the spider's label "${name(a)}" covers the value "${name(v)}"`);
        });
        // The level ticks on the first axis stay clear of the labels and the values.
        const ticks = [...svgEl.querySelectorAll("text.sp-tick")].filter((t) => t.textContent.trim());
        for (const k of ticks) for (const o of [...labels, ...values]) if (hit(box(k), box(o))) out.push(`the spider's tick "${name(k)}" and its text "${name(o)}" overlap`);
        // The values stand apart from each other, also where several sit at the centre (the review's R-29).
        values.forEach((v, i) => values.slice(i + 1).forEach((w) => { if (hit(box(v), box(w))) out.push(`the spider's values "${name(v)}" and "${name(w)}" overlap`); }));
        // Each value stands clear of its own marker.
        for (const v of values) {
          const m = svgEl.querySelector(`.sp-markers:not(.sp-markers--b) polygon[data-axis="${v.dataset.axis}"]`);
          if (m && !v.closest(".sp-markers--b") && hit(box(v), box(m))) out.push(`the spider's value "${name(v)}" covers its marker`);
        }
      }
      const groups = [...sov.querySelectorAll(".hc-group")].filter(shown);
      groups.forEach((g, i) => {
        const G = box(g);
        if (cutOff(g, panel)) out.push(`the honeycomb's group "${g.dataset.layer}" is cut at the map panel's edge`);
        groups.slice(i + 1).forEach((o) => { if (hit(G, box(o))) out.push(`the honeycomb's groups "${g.dataset.layer}" and "${o.dataset.layer}" overlap`); });
        const head = [...g.querySelectorAll(".hc-head > *")].filter(shown);
        for (const part of head) if (!within(box(part), G)) out.push(`the head "${name(part)}" runs out of its group "${g.dataset.layer}"`);
        if (head.length === 2 && hit(box(head[0]), box(head[1]))) out.push(`the head of "${g.dataset.layer}" overlaps itself`);
        for (const cell of g.querySelectorAll(".hc-cell")) if (shown(cell) && (cutOff(cell, panel) || !within(box(cell), G))) out.push(`the cell ${cell.dataset.block || "(empty)"} is cut`);
      });
    }
    // An open drawer: its panel beside the map (the console's column from 1,101 px), inside the window.
    const drawer = document.querySelector("#drawer");
    const body = drawer?.querySelector(".drawer-body");
    if (drawer?.dataset.open === "true" && shown(body) && box(body).h > 0) {
      const B = box(body);
      if (B.l < -1 || B.r > W + 1 || B.t < -1 || B.b > innerHeight + 1) out.push("the drawer's panel leaves the window");
      if (W >= 1101 && hit(B, P)) out.push("the drawer's panel covers the map");
      if (B.h < 200) out.push(`the drawer's panel is only ${Math.round(B.h)} px high`);
    }
    // Every visible target at least 40 px (text links inside prose excepted).
    const small = [];
    for (const el of document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="radio"], [role="menuitem"], label.vc-chip')) {
      if (!shown(el)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > W) continue;
      // A visually hidden control (a file input behind its label) is reached through its label.
      if (r.width <= 2 && r.height <= 2) continue;
      // Scrolled out of its panel's view: measured once it is scrolled into view.
      const scroller = el.parentElement?.closest(".map, .drawer-body, .log, .portfolio");
      if (scroller) { const S2 = box(scroller); if (r.bottom <= S2.t + 1 || r.top >= S2.b - 1) continue; }
      // A radio or checkbox inside its chip or label counts as that label.
      if (el.matches('input[type="radio"], input[type="checkbox"]') && el.closest("label")) continue;
      if (el.tagName === "A" && el.closest("p, li, .md, td, figcaption, .source-meta, .entry-body")) continue;
      // Covered by another element (the panel over the console): not a target the room can reach.
      const cx = Math.min(Math.max(r.left + r.width / 2, 0), W - 1);
      const cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
      const top = document.elementFromPoint(cx, cy);
      if (top && !el.contains(top) && !top.contains(el)) continue;
      if (r.height < 40 - 0.5 || r.width < 40 - 0.5) small.push(`${el.tagName.toLowerCase()} "${name(el)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    if (small.length) out.push(`targets under 40 px: ${[...new Set(small)].slice(0, 8).join("; ")}${small.length > 8 ? ` and ${small.length - 8} more` : ""}`);
    return out;
  });
}

// ---- viewports -----------------------------------------------------------------------------------------------
/** One size, theme and language: a pre-run played through the six states, each measured. */
async function viewport({ width, height, theme, lang, entry }) {
  const label = `${width}×${height} ${theme} ${lang}`;
  const { context, page, errors } = await newPage({ width, height, lang, theme });
  const problems = [];
  const states = [];
  const take = async (state, shotIt = false) => {
    const p = await measure(page);
    states.push(state);
    problems.push(...p.map((x) => `${state}: ${x}`));
    if (shotIt || p.length) await page.screenshot({ path: path.join(OUT, `${width}x${height}-${theme}-${lang}-${state}.png`) });
  };
  try {
    await take("idle");
    await page.click(`.catalogue-chip[data-entry="${entry}"]`);
    await page.click("#btn-start");
    await page.waitForSelector('.mode-card[data-mode="simulation"] .mode-cta button');
    await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
    await page.waitForFunction(() => document.querySelectorAll(".hc-cell[data-block]").length >= 2 && window.__getState().runState === "researching", null, { timeout: 60000 });
    // Slow the replay down while the research state is measured.
    await page.evaluate(async () => { const st = await import("/js/state.js"); st.setState({ speed: 1 }); });
    await take("research");
    await page.evaluate(async () => { const st = await import("/js/state.js"); st.setState({ speed: 40 }); });
    await waitState(page, ["awaiting_review"]);
    await page.waitForSelector("#btn-review-confirm");
    await take("review", width === 1280 || width === 1920);
    await page.click("#btn-review-confirm");
    await waitState(page, ["awaiting_decision"]);
    await page.waitForSelector('.lever-card[data-lever="keep"]');
    await take("levers", width === 1280 || width === 1920);
    await page.click('.lever-card[data-lever="keep"] .lever-id');
    await page.click("#btn-approve-lever");
    await waitState(page, TERMINAL);
    // The finished run opens the Outbox by itself; a click on an open tab would close the drawer.
    if (await page.getAttribute("#tab-outbox", "aria-selected") !== "true") await page.click("#tab-outbox");
    await page.waitForSelector('.outbox-card[data-draft="report"]');
    await page.waitForFunction(() => document.querySelector("#drawer")?.dataset.open === "true");
    await take("outbox");
    await page.click("#drawer .drawer-toggle");
    await page.waitForFunction(() => document.querySelector("#drawer")?.dataset.open === "false");
    await take("hidden", width === 1280 || width === 1920);
    // The block view of the same run: a label per block, the values beside the markers (the review's R-05).
    await page.click('.sov-map button[data-view="block"]');
    await page.waitForSelector('.sov-spider svg.spider[data-view="block"]');
    await take("block", width === 1280 || width === 1920);
  } catch (e) { problems.push(`exception after ${states.join(", ") || "loading"}: ${String(e.message).split("\n")[0]}`); }
  problems.push(...errors.map((e) => `page error: ${e}`));
  await context.close();
  return { name: `${label}: ${entry}, ${states.length} of 7 states`, ok: !problems.length && states.length === 7, problems };
}

/**
 * The edges of a run (the review's R-06): its first seconds, when every layer still has its status line,
 * then the review, the end with the drawer hidden and the block view; for the pre-runs that end without
 * an assessment, the start and the end. Every state measured like the viewports.
 */
async function edges({ width, height, theme, lang, entry }) {
  const label = `${width}×${height} ${theme} ${lang}`;
  const { context, page, errors } = await newPage({ width, height, lang, theme });
  const problems = [];
  const states = [];
  const take = async (state) => {
    const p = await measure(page);
    states.push(state);
    problems.push(...p.map((x) => `${state}: ${x}`));
    if (p.length) await page.screenshot({ path: path.join(OUT, `edges-${entry}-${width}x${height}-${theme}-${lang}-${state}.png`) });
  };
  const assessed = !["zbds", "zapuk", "low-code"].includes(entry);
  try {
    await page.evaluate(async () => { const st = await import("/js/state.js"); st.setState({ speed: 1 }); });
    await page.click(`.catalogue-chip[data-entry="${entry}"]`);
    await page.click("#btn-start");
    await page.waitForSelector('.mode-card[data-mode="simulation"] .mode-cta button');
    await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
    await page.waitForSelector(".sov-spider svg.spider");
    await page.waitForTimeout(1200);
    await take("start");
    await page.evaluate(async () => { const st = await import("/js/state.js"); st.setState({ speed: 40 }); });
    if (assessed) {
      await waitState(page, ["awaiting_review"]);
      await page.waitForSelector("#btn-review-confirm");
      await take("review");
      await page.click("#btn-review-confirm");
      await waitState(page, ["awaiting_decision"]);
      await page.waitForSelector('.lever-card[data-lever="keep"]');
      await page.click('.lever-card[data-lever="keep"] .lever-id');
      await page.click("#btn-approve-lever");
    }
    await waitState(page, TERMINAL);
    await page.waitForTimeout(400);
    if (await page.evaluate(() => document.querySelector("#drawer")?.dataset.open === "true")) await page.click("#drawer .drawer-toggle");
    await page.waitForFunction(() => document.querySelector("#drawer")?.dataset.open === "false");
    await take("done");
    if (assessed) {
      await page.click('.sov-map button[data-view="block"]');
      await page.waitForSelector('.sov-spider svg.spider[data-view="block"]');
      await take("block");
    }
  } catch (e) { problems.push(`exception after ${states.join(", ") || "loading"}: ${String(e.message).split("\n")[0]}`); }
  problems.push(...errors.map((e) => `page error: ${e}`));
  await context.close();
  const want = assessed ? 4 : 2;
  return { name: `edges ${label}: ${entry}, ${states.length} of ${want} states`, ok: !problems.length && states.length === want, problems };
}
if (wanted("edges")) {
  const jobs = [];
  for (const [width, height] of [[1280, 720], [1366, 768]]) for (const lang of ["de", "en"]) for (const entry of ["marktplatz-deutschland-digital", "zbds", "zapuk", "low-code", "bundid", "noots"]) jobs.push({ width, height, lang, entry, theme: jobs.length % 2 ? "dark" : "light" });
  for (let i = 0; i < jobs.length; i += 4) results.push(...(await Promise.all(jobs.slice(i, i + 4).map(edges))));
}
if (wanted("viewports")) {
  const jobs = [];
  for (const [width, height] of SIZES) for (const theme of ["light", "dark"]) for (const lang of ["en", "de"]) jobs.push({ width, height, theme, lang, entry: ENTRIES[jobs.length % ENTRIES.length] });
  // Four pages at a time: each has its own browser context, so they share nothing but the server.
  for (let i = 0; i < jobs.length; i += 4) results.push(...(await Promise.all(jobs.slice(i, i + 4).map(viewport))));
}

// ---- table ---------------------------------------------------------------------------------------------------
/**
 * The map's table view at the end of a run (the review's R-23): both tables inside their panel, no cell's
 * text cut, and the map measured as in the other states.
 */
async function tableView({ width, height, theme, lang, entry }) {
  const label = `${width}×${height} ${theme} ${lang}`;
  const { context, page, errors } = await newPage({ width, height, lang, theme });
  const problems = [];
  let tables = 0;
  try {
    await page.click(`.catalogue-chip[data-entry="${entry}"]`);
    await page.click("#btn-start");
    await page.waitForSelector('.mode-card[data-mode="simulation"] .mode-cta button');
    await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
    await waitState(page, ["awaiting_review"]);
    await page.click("#btn-review-confirm");
    await waitState(page, ["awaiting_decision"]);
    await page.waitForSelector('.lever-card[data-lever="keep"]');
    await page.click('.lever-card[data-lever="keep"] .lever-id');
    await page.click("#btn-approve-lever");
    await waitState(page, TERMINAL);
    await page.waitForTimeout(400);
    if (await page.evaluate(() => document.querySelector("#drawer")?.dataset.open === "true")) await page.click("#drawer .drawer-toggle");
    await page.waitForFunction(() => document.querySelector("#drawer")?.dataset.open === "false");
    await page.click(".sov-table-btn");
    await page.waitForSelector(".sov-table:not([hidden]) .map-table");
    const t = await page.evaluate(() => {
      const host = document.querySelector(".sov-table");
      const hb = host.getBoundingClientRect();
      const out = { tables: 0, cut: [], wide: [] };
      if (host.scrollWidth > host.clientWidth + 1) out.wide.push(`the panel scrolls sideways (${host.scrollWidth} > ${host.clientWidth})`);
      for (const tb of host.querySelectorAll(".map-table")) {
        out.tables += 1;
        const b = tb.getBoundingClientRect();
        if (b.right > hb.right + 1 || b.left < hb.left - 1) out.wide.push(`${tb.dataset.table} reaches ${Math.round(b.right - hb.right)} px beyond its panel`);
        for (const c of tb.querySelectorAll("th, td")) if (c.scrollWidth > c.clientWidth + 1) out.cut.push(`${tb.dataset.table}: "${c.textContent.trim()}"`);
      }
      return out;
    });
    tables = t.tables;
    problems.push(...t.wide, ...t.cut.map((x) => `cut cell ${x}`));
    problems.push(...(await measure(page)).map((x) => `table: ${x}`));
    if (problems.length) await page.screenshot({ path: path.join(OUT, `table-${entry}-${width}x${height}-${theme}-${lang}.png`) });
  } catch (e) { problems.push(`exception: ${String(e.message).split("\n")[0]}`); }
  problems.push(...errors.map((e) => `page error: ${e}`));
  await context.close();
  return { name: `table ${label}: ${entry}, ${tables} of 2 tables in their panel, no cell cut`, ok: !problems.length && tables === 2, problems };
}
if (wanted("table")) {
  const jobs = [];
  for (const [width, height] of [[1280, 720], [1920, 1080]]) for (const lang of ["de", "en"]) jobs.push({ width, height, lang, entry: "bundid", theme: lang === "de" ? "dark" : "light" });
  results.push(...(await Promise.all(jobs.map(tableView))));
}

// ---- blocks30 ------------------------------------------------------------------------------------------------
/** The BundID pre-run with its six blocks replaced by thirty, five per layer, from the same evidence. */
async function thirtyBlockRun() {
  const { readRunFile } = await import(pathToFileURL(path.join(APP_ROOT, "tools/check-runs.mjs")).href);
  const def = readRunFile(path.join(APP_ROOT, "data/runs/bundid.js"));
  const blocks = def.steps.filter((s) => s.tool === "rec_block");
  const score = def.steps.findIndex((s) => s.tool === "eng_score");
  const research = def.steps.slice(0, score).filter((s) => s.tool !== "rec_block" && s.tool !== "rec_layer");
  const LAYERS = ["infrastructure", "devsecops", "platform", "base_service", "applications", "access"];
  const made = [];
  for (let i = 0; i < 30; i++) {
    const tmpl = structuredClone(blocks[i % blocks.length]);
    tmpl.input.layer = LAYERS[i % 6];
    tmpl.input.criticality = i % 3 === 0 ? "critical" : i % 3 === 1 ? "important" : "supporting";
    // Letters, not numbers: the fact audit refuses a figure in a name.
    const part = i < 26 ? String.fromCharCode(65 + i) : `Z${String.fromCharCode(65 + i - 26)}`;
    tmpl.input.name = { en: `${tmpl.input.name.en}, part ${part}`, de: `${tmpl.input.name.de}, Teil ${part}` };
    made.push(tmpl);
  }
  return { ...def, steps: [...research, ...made, ...def.steps.slice(score)] };
}
if (wanted("blocks30")) {
  const def = await thirtyBlockRun();
  for (const [width, height] of [[1920, 1080], [1280, 720]]) {
    for (const lang of ["en", "de"]) {
      const { context, page, errors } = await newPage({ width, height, lang });
      const problems = [];
      const checks = {};
      try {
        await page.evaluate((d) => { window.SA_RUNS.bundid = d; }, def);
        await page.click('.catalogue-chip[data-entry="bundid"]');
        await page.click("#btn-start");
        await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
        await waitState(page, ["awaiting_review"]);
        checks.cells = await page.$$eval(".hc-cell[data-block]", (els) => els.length);
        problems.push(...(await measure(page)).map((x) => `review, by layer: ${x}`));
        // The block view, with the drawer hidden and open.
        await page.click('.sov-views button[data-view="block"]');
        await page.waitForSelector('.spider[data-view="block"]');
        checks.axes = await page.$eval('.spider[data-view="block"]', (s) => Number(s.dataset.axes));
        problems.push(...(await measure(page)).map((x) => `review, by block: ${x}`));
        await page.screenshot({ path: path.join(OUT, `blocks30-${width}x${height}-${lang}-open.png`) });
        await page.click("#drawer .drawer-toggle");
        await page.waitForFunction(() => document.querySelector("#drawer")?.dataset.open === "false");
        problems.push(...(await measure(page)).map((x) => `drawer hidden, by block: ${x}`));
        await page.screenshot({ path: path.join(OUT, `blocks30-${width}x${height}-${lang}-hidden.png`) });
      } catch (e) { problems.push(`exception: ${String(e.message).split("\n")[0]}`); }
      if (checks.cells !== 30) problems.push(`${checks.cells} cells in the honeycomb, not 30`);
      if (checks.axes !== 30) problems.push(`${checks.axes} axes in the block view, not 30`);
      problems.push(...errors.map((e) => `page error: ${e}`));
      results.push({ name: `blocks30: thirty blocks at ${width}×${height} in ${lang === "de" ? "German" : "English"}, labels apart and nothing cut`, ok: !problems.length, problems });
      await context.close();
    }
  }
}

// ---- targets -------------------------------------------------------------------------------------------------
if (wanted("targets")) {
  const { context, page, errors } = await newPage({ width: 1920, height: 1080 });
  const problems = [];
  const audit = async (label) => { problems.push(...(await measure(page)).filter((x) => x.startsWith("targets")).map((x) => `${label}: ${x}`)); };
  try {
    await page.click("#btn-about");
    await page.waitForSelector(".intro-modal");
    await audit("intro window");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".intro-modal", { state: "detached" });
    await page.click('.catalogue-chip[data-entry="epaybl"]');
    await page.click("#btn-start");
    await page.waitForSelector(".mode-card");
    await audit("mode dialog");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".mode-card", { state: "detached" });
    await page.click("#btn-diagnostics");
    await page.waitForSelector(".diag-checks, .diagnostics", { timeout: 10000 });
    await audit("Diagnostics");
    await page.keyboard.press("Escape");
    await page.click("#btn-method");
    await page.waitForSelector(".method");
    await audit("method view");
    await page.keyboard.press("Escape");
    await page.click('#centre-views button[data-centre="compare"]');
    await page.waitForSelector("#cmp-table");
    await audit("Compare");
    await page.click('#centre-views button[data-centre="portfolio"]');
    await page.waitForSelector(".portfolio");
    await audit("Portfolio");
  } catch (e) { problems.push(`exception: ${String(e.message).split("\n")[0]}`); }
  problems.push(...errors.map((e) => `page error: ${e}`));
  results.push({ name: "targets: at least 40 px at 1920×1080 in the intro, the mode dialog, Diagnostics, the method view, Compare and the Portfolio", ok: !problems.length, problems });
  await context.close();
}

await browser.close();
await close();
await writeFile(path.join(OUT, "layout-results.json"), JSON.stringify(results, null, 2));
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  for (const p of r.problems.slice(0, 25)) console.log(`      - ${p}`);
  if (r.problems.length > 25) console.log(`      … and ${r.problems.length - 25} more`);
}
const allOk = results.length > 0 && results.every((r) => r.ok);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} layout checks passed. Screenshots: ${OUT}`);
if (allOk && ONLY.length === 0) console.log("LAYOUT OK");
process.exit(allOk ? 0 : 1);
