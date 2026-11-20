// Design checks and review captures (AC-19, AC-20; DESIGN.md §3), each in the light and the dark theme:
//   grammar  the colour grammar in the running app, against the tokens of the theme on screen: merlot is
//            the person in charge (the rail's "Your review" step, the status pill while the run waits,
//            Confirm findings and Approve); lilac is the AI's voice (every AI label); fjord is checking (a
//            search or a fetch outlines the map in fjord, never as a fill); the levels fill the
//            honeycomb on Vici's diverging scale, each cell with its number written, so a danger fill
//            never stands without its mark; the assessed service is teal on its pastel; the SIMULATION
//            tape is neutral, never merlot or a state colour; and every state colour carries a word
//   motion   reduced motion stops the diagram's animation: with the reader's setting the fjord pulse
//            around the map runs no animation and nothing inside the map animates, while without it
//            the same pulse animates (the positive control)
//   review   screenshots for a design review at 1920×1080: the review as rendered and under a simulated
//            projector washout, and the finished run as seen with protanopia, deuteranopia and
//            tritanopia (Machado et al. 2009 matrices, applied in linear RGB), the whole page and the
//            map; the dark theme's files end in -dark
// Usage: node tests/design.mjs [case…]
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { APP_ROOT, ONLY, outDir, wanted, launchBrowser, serveStatic, SKIP_INTRO } from "./lib/harness.mjs";

const OUT = await outDir("design");
const { base: BASE, close } = await serveStatic(APP_ROOT, 8770);
const browser = await launchBrowser();
const results = [];
const THEMES = ["light", "dark"];
const suffix = (theme) => (theme === "light" ? "" : `-${theme}`);
const TERMINAL = ["done", "stopped", "aborted", "error"];

// Severity 1.0 (dichromacy). The same matrices as the colour check in tests/tokens.mjs.
const CVD = {
  "Normal vision": null,
  Protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  Deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  Tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]]
};
// A projector in a lit room: lower contrast, brighter, less saturated.
const WASHOUT = "contrast(0.62) brightness(1.18) saturate(0.8)";

/** A page in the given theme (Vici's remembered choice, vc-theme), optionally with reduced motion. */
async function newPage(theme = "light", { reducedMotion = "no-preference" } = {}) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, colorScheme: theme, reducedMotion });
  await context.addInitScript(SKIP_INTRO);
  await context.addInitScript((t) => { try { localStorage.setItem("vc-theme", t); } catch { /* blocked storage */ } }, theme);
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort("blockedbyclient"));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  await page.goto(BASE);
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  const shown = await page.evaluate(() => document.documentElement.dataset.theme);
  if (shown !== theme) errors.push(`the page shows the ${shown} theme, not the ${theme} one`);
  await page.evaluate(async () => {
    const st = await import("/js/state.js");
    window.__getState = st.getState;
    st.setState({ speed: 4 });
  });
  return { context, page, errors };
}
const waitState = (page, states, timeout = 120000) => page.waitForFunction((s) => s.includes(window.__getState().runState), states, { timeout });
async function startSim(page, entry) {
  await page.click(`.catalogue-chip[data-entry="${entry}"]`);
  await page.click("#btn-start");
  await page.waitForSelector('.mode-card[data-mode="simulation"] .mode-cta button');
  await page.click('.mode-card[data-mode="simulation"] .mode-cta button');
}

/** The colours on screen against the theme's tokens; returns { mismatches, counted }. */
function grammar(page, stage) {
  return page.evaluate((stage) => {
    const probe = document.createElement("i");
    document.body.append(probe);
    const colour = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
    const shown = (e) => !!e && e.getClientRects().length > 0 && !e.closest("[hidden]");
    const all = (sel) => [...document.querySelectorAll(sel)].filter(shown);
    const out = { mismatches: [], counted: {} };
    const expect = (what, got, token) => {
      out.counted[what] = (out.counted[what] || 0) + 1;
      const want = colour(token);
      if (got !== want) out.mismatches.push(`${stage}: ${what} is ${got}, not ${token} (${want})`);
    };
    // Lilac: every AI label.
    // (Vici paints a tag's hexagon in its ::before; the text takes the tag's foreground.)
    for (const chip of all(".ai-label-chip")) {
      const tag = chip.closest(".ai-label");
      if (tag?.matches(":hover") || tag?.getAttribute("aria-expanded") === "true") continue;
      expect("AI label", getComputedStyle(chip, "::before").backgroundColor, "--vc-feature-bg");
      expect("AI label's word", getComputedStyle(chip).color, "--vc-feature-text");
    }
    // Merlot: the person's step and the buttons that decide.
    if (stage === "review" || stage === "levers") {
      const step = document.querySelector('.rail-step[data-state="yours"] .vc-step__marker');
      if (step) expect("the rail's step for the person", getComputedStyle(step, "::before").backgroundColor, "--vc-accent");
      else out.mismatches.push(`${stage}: no rail step for the person`);
      const dot = document.querySelector('.status-pill[data-tone="waiting"] .dot');
      if (dot) expect("the status pill while the run waits", getComputedStyle(dot).backgroundColor, "--vc-accent");
      else out.mismatches.push(`${stage}: the status pill does not wait for the person`);
      const pillText = document.querySelector(".status-pill")?.textContent.trim();
      if (!pillText) out.mismatches.push(`${stage}: the status pill has no word`);
    }
    if (stage === "review") expect("Confirm findings", getComputedStyle(document.querySelector("#btn-review-confirm")).backgroundColor, "--vc-accent");
    if (stage === "levers") expect("Approve", getComputedStyle(document.querySelector("#btn-approve-lever")).backgroundColor, "--vc-accent");
    // The levels on Vici's diverging scale, each cell with its number.
    const FILL = { 0: "--vc-div-1", 1: "--vc-div-3", 2: "--vc-div-4", 3: "--vc-div-5", 4: "--vc-div-7" };
    for (const cell of all(".hc-cell[data-block]")) {
      const lv = cell.dataset.level;
      if (lv === "gap") continue;
      expect(`a level-${lv} cell`, getComputedStyle(cell.querySelector(".hc-hex")).fill, FILL[lv]);
      const mark = cell.querySelector(".hc-level")?.textContent.trim() || "";
      if (!mark.startsWith(lv)) out.mismatches.push(`${stage}: the level-${lv} cell ${cell.dataset.block} writes "${mark}"`);
    }
    // Teal: the assessed service.
    const area = document.querySelector('.sov-spider .spider .sp-area:not(.sp-area--b)');
    if (shown(area)) {
      expect("the service's line", getComputedStyle(area).stroke, "--vc-data-2");
      expect("the service's fill", getComputedStyle(area).fill, "--vc-data-pastel-2");
    }
    // The tape: neutral.
    const tape = document.querySelector(".sim-watermark");
    if (shown(tape)) {
      const bg = getComputedStyle(tape).backgroundColor;
      out.counted.tape = 1;
      for (const t of ["--vc-accent", "--vc-accent-soft", "--vc-danger-bg", "--vc-warning-bg", "--vc-success-bg", "--vc-info-bg", "--vc-feature-bg"]) if (bg === colour(t)) out.mismatches.push(`${stage}: the SIMULATION tape is in ${t}`);
      if (bg !== colour("--vc-bg-subtle")) out.mismatches.push(`${stage}: the SIMULATION tape is ${bg}, not the neutral --vc-bg-subtle`);
    }
    // A state colour always with a word: the tiles in a state tone have a value and a label.
    for (const tile of all('#kpis .kpi[data-tone]:not([data-tone=""]):not([data-tone="muted"])')) {
      if (!tile.querySelector(".kpi-label")?.textContent.trim() || !tile.querySelector(".kpi-value")?.textContent.trim()) out.mismatches.push(`${stage}: a tile in the ${tile.dataset.tone} tone without its words`);
    }
    probe.remove();
    return out;
  }, stage);
}

// ---- grammar ---------------------------------------------------------------------------------------------------
for (const theme of wanted("grammar") ? THEMES : []) {
  const { context, page, errors } = await newPage(theme);
  const problems = [];
  const counted = {};
  const add = (g) => { problems.push(...g.mismatches); for (const [k, v] of Object.entries(g.counted)) counted[k] = (counted[k] || 0) + v; };
  let pulse = null;
  try {
    await startSim(page, "bundid");
    // Fjord: a search or a fetch outlines the map, never fills it.
    await page.waitForSelector('.sov-map[data-pulse="on"]', { timeout: 60000 });
    pulse = await page.evaluate(() => {
      const probe = document.createElement("i");
      document.body.append(probe);
      probe.style.color = "var(--vc-info-solid)";
      const want = getComputedStyle(probe).color;
      probe.remove();
      const after = getComputedStyle(document.querySelector(".sov-map"), "::after");
      return { border: after.borderTopColor, want, fill: after.backgroundColor };
    });
    if (pulse.border !== pulse.want) problems.push(`the search pulse is ${pulse.border}, not fjord (${pulse.want})`);
    if (pulse.fill !== "rgba(0, 0, 0, 0)") problems.push(`the search pulse fills the map (${pulse.fill})`);
    await page.evaluate(async () => { const st = await import("/js/state.js"); st.setState({ speed: 40 }); });
    await waitState(page, ["awaiting_review"]);
    await page.waitForSelector("#btn-review-confirm");
    await page.waitForTimeout(400);
    add(await grammar(page, "review"));
    await page.screenshot({ path: path.join(OUT, `grammar-review${suffix(theme)}.png`) });
    await page.click("#btn-review-confirm");
    await waitState(page, ["awaiting_decision"]);
    await page.click('.lever-card[data-lever="L1"] .lever-id');
    await page.waitForTimeout(300);
    add(await grammar(page, "levers"));
    await page.click("#btn-approve-lever");
    await waitState(page, TERMINAL);
    await page.waitForTimeout(400);
    add(await grammar(page, "done"));
  } catch (e) { problems.push(`exception: ${String(e.message).split("\n")[0]}`); }
  for (const what of ["AI label", "the rail's step for the person", "the status pill while the run waits", "Confirm findings", "Approve", "a level-0 cell", "a level-4 cell", "the service's line", "tape"]) {
    if (!counted[what]) problems.push(`nothing measured for ${what}`);
  }
  problems.push(...errors.map((e) => `page error: ${e}`));
  results.push({ name: `grammar: merlot for the person, lilac for the AI, fjord outlines, the levels with their numbers, a neutral tape (${theme} theme; ${Object.values(counted).reduce((a, b) => a + b, 0)} colours measured)`, ok: !problems.length, problems });
  await context.close();
}

// ---- motion ----------------------------------------------------------------------------------------------------
if (wanted("motion")) {
  const problems = [];
  const seen = {};
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const { context, page, errors } = await newPage("light", { reducedMotion });
    try {
      await startSim(page, "bundid");
      await page.waitForSelector('.sov-map[data-pulse="on"]', { timeout: 60000 });
      seen[reducedMotion] = await page.evaluate(() => {
        const map = document.querySelector(".sov-map");
        const after = getComputedStyle(map, "::after");
        const inMap = document.getAnimations().filter((a) => {
          const t = a.effect?.target;
          const el = t?.nodeType === 1 ? t : a.effect?.target?.element;
          return el && (el === map || map.contains(el)) && a.playState === "running";
        });
        return { name: after.animationName, running: inMap.length, names: inMap.map((a) => a.animationName || a.constructor.name) };
      });
    } catch (e) { problems.push(`${reducedMotion}: exception: ${String(e.message).split("\n")[0]}`); }
    problems.push(...errors.map((e) => `${reducedMotion}: page error: ${e}`));
    await context.close();
  }
  const normal = seen["no-preference"];
  const reduced = seen.reduce;
  if (!normal || normal.name !== "fjordPulse" || normal.running < 1) problems.push(`without the setting the pulse should animate (the positive control): ${JSON.stringify(normal)}`);
  if (!reduced || reduced.name !== "none" || reduced.running !== 0) problems.push(`with reduced motion the map still animates: ${JSON.stringify(reduced)}`);
  results.push({ name: "motion: reduced motion stops the diagram's animation (the fjord pulse animates without the setting)", ok: !problems.length, problems });
}

// ---- review ----------------------------------------------------------------------------------------------------
for (const theme of wanted("review") ? THEMES : []) {
  const { context, page, errors } = await newPage(theme);
  const problems = [];
  const files = [];
  const file = (name) => `${name}${suffix(theme)}.png`;
  try {
    await page.evaluate(async () => { const st = await import("/js/state.js"); st.setState({ speed: 40 }); });
    await startSim(page, "bundid");
    await waitState(page, ["awaiting_review"]);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, file("review-map")) });
    await page.evaluate((f) => { document.documentElement.style.filter = f; }, WASHOUT);
    await page.screenshot({ path: path.join(OUT, file("review-map-washout")) });
    await page.evaluate(() => { document.documentElement.style.filter = ""; });
    files.push(file("review-map"), file("review-map-washout"));
    await page.click("#btn-review-confirm");
    await waitState(page, ["awaiting_decision"]);
    await page.click('.lever-card[data-lever="L1"] .lever-id');
    await page.click("#btn-approve-lever");
    await waitState(page, TERMINAL);
    // The finished run with the drawer hidden: the map and the console side by side.
    await page.click("#drawer .drawer-toggle");
    await page.waitForFunction(() => document.querySelector("#drawer")?.dataset.open === "false");
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      // Filter primitives work in linear RGB by default, which is where the matrices apply.
      svg.innerHTML = '<filter id="cvd-sim" color-interpolation-filters="linearRGB"><feColorMatrix id="cvd-matrix" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter>';
      document.body.appendChild(svg);
    });
    const shots = { full: [], map: [] };
    const mapBox = await page.$eval(".map-panel", (m) => { const r = m.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    for (const [name, m] of Object.entries(CVD)) {
      await page.evaluate((mat) => {
        const values = mat ? `${mat[0].join(" ")} 0 0 ${mat[1].join(" ")} 0 0 ${mat[2].join(" ")} 0 0 0 0 0 1 0` : "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0";
        document.getElementById("cvd-matrix").setAttribute("values", values);
        document.body.style.filter = mat ? "url(#cvd-sim)" : "";
      }, m);
      await page.waitForTimeout(300);
      shots.full.push([name, (await page.screenshot()).toString("base64")]);
      shots.map.push([name, (await page.screenshot({ clip: mapBox })).toString("base64")]);
    }
    await page.evaluate(() => { document.body.style.filter = ""; });
    const sheet = await context.newPage();
    for (const [kind, list] of Object.entries(shots)) {
      await sheet.setViewportSize({ width: 1920, height: 200 }); // the full-page capture grows to fit
      await sheet.setContent(`<!doctype html><html><body style="margin:0;background:#fff;font:600 20px Arial,sans-serif;color:#2c1f21">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px">${list.map(([n, b]) =>
          `<figure style="margin:0"><figcaption style="padding:2px 2px 6px">${n}</figcaption><img style="width:100%;display:block;border:1px solid #e5d9db" src="data:image/png;base64,${b}"></figure>`).join("")}</div></body></html>`);
      await sheet.waitForTimeout(200);
      await sheet.screenshot({ path: path.join(OUT, file(`review-cvd-${kind}`)), fullPage: true });
      files.push(file(`review-cvd-${kind}`));
    }
    await sheet.close();
  } catch (e) { problems.push(`exception: ${String(e.message).split("\n")[0]}`); }
  problems.push(...errors.map((e) => `page error: ${e}`));
  results.push({ name: `review captures (${files.length} files, ${theme} theme)`, ok: !problems.length && files.length === 4, problems });
  await context.close();
}

await browser.close();
await close();
await writeFile(path.join(OUT, "design-results.json"), JSON.stringify(results, null, 2));
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  for (const p of r.problems) console.log(`      - ${p}`);
}
const allOk = results.length > 0 && results.every((r) => r.ok);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} design cases passed. Screenshots: ${OUT}`);
if (allOk && ONLY.length === 0) console.log("DESIGN OK");
process.exit(allOk ? 0 : 1);
