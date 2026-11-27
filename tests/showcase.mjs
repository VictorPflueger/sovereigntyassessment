// The presenter in a browser, against the engine's own figures (recomputed here in Node from the gated
// blocks of the BundID pre-run, not read from the page's code). Cases, each runnable alone; each prints
// SHOWCASE OK <case> when it passes:
//   guide    the guide of the page's language opens in every new tab, not on a reload, once per tab
//            across both languages; ?guide=0 and ?guide=present; How it works has a row per key figure
//            with BundID's figures; the talk track has three to seven timed steps; every chapter fits
//   kpis     two to four tiles marked data-vc-kpi and data-vc-kpi-de sit top right at 1920 × 1080 and
//            1280 × 720 and show the engine's BundID figures before anything runs, in both languages
//   partial  the score's value says on how many of six layers it rests at every step, in both languages
//            (a live run's partial figures are in tests/live.mjs)
//   header   the icon and name, SIMULATION, How it works (So funktioniert's) with its words in view at
//            1280 px, EN | DE and the theme toggle; one sentence and the byline under the header
//   turn     wherever the page waits for a person, the Your turn bar right under the story holds the one
//            primary action, with vc-attention, in view
//   play     Play starts when the guide closes, holds a step 7 to 14 seconds, stops where the person
//            acts; Space pauses and plays; a chosen step pauses; it ends on Replay
//   lang     EN | DE switches every visible word in place, without a reload, also while Play runs, and
//            keeps the step and the decisions
//   network  nothing is requested from another site, every outside request blocked; no link to the
//            prototype's own repository on any step of any case
//   offline  BundID is the first screen and plays to its end with the browser offline
//   steps    five steps under the header, in both languages; Your review and Recommend are the person's;
//            keys, clicks and ?step= move between them
//   names    no block id, lever id or catalogue acronym on any screen of the BundID talk track, in both
//            languages; the case menu shows names, one entry per catalogue entry
//   start    Start agent offers the free simulation first; the AI notice stands beside every control
//            that can start a live run, in both languages
//   keep     the notes "indicative, not an official assessment" and "not an official service of the
//            German Federal Government" (no dash), quote, link and date read for every finding shown,
//            drafts only with nothing sent, and the decision log
//   cases    all seventeen cases from the menu, through every step, without an error
//   layout   1920 × 1080 and 1280 × 720, light and dark, English and German, every step of BundID: no
//            page scroll, the stage and the story fit, the header and its tiles apart and inside, every
//            target at least 24 px
// Usage: node tests/showcase.mjs [case…]
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_ROOT, wanted, launchBrowser, serveStatic, outDir, NETWORK_NOISE } from "./lib/harness.mjs";
import { loadData, playCase } from "./lib/play.mjs";

const mod = (p) => import(pathToFileURL(path.join(APP_ROOT, p)).href);
const OUT = await outDir("showcase");

// ---- the engine's figures for BundID, computed here ---------------------------------------------------
const win = loadData();
const { score, LAYERS } = await mod("js/engine.js");
const { gateBlock } = await mod("js/evidence.js");
const { estimateCost } = await mod("js/estimate.js");
const { DEFAULT_MODEL } = await mod("js/config.js");
const nb = (s) => String(s).replace(/[\u00a0\u202f]/g, " ").replace(/\s+/g, " ").trim();
const EXPECT = {};
// The page estimates a live run's cost from the case's run in English, whatever language it shows.
const costOf = async () => {
  const def = win.SA_RUNS.bundid;
  const lever = await playCase(def, "en", { choice: "L1" });
  return estimateCost({ events: lever.events, lang: "en", query: def.query, entryId: def.entry_id, today: def.as_of, modelId: DEFAULT_MODEL }).eur;
};
const COST = await costOf();
for (const lang of ["en", "de"]) {
  const kept = await playCase(win.SA_RUNS.bundid, lang, { choice: "keep" });
  const gated = kept.blocks.map((b) => ({ id: b.id, ...gateBlock(b, b.evidence, {}).effective }));
  const r = score(gated);
  const layers = LAYERS.filter((l) => r.layers[l].score !== null).length;
  const weakest = kept.blocks.find((b) => b.id === r.weakest.block_id);
  const critical = r.blocks.filter((b) => b.criticality === "critical" && !b.unscored).length;
  EXPECT[lang] = {
    score: String(Math.round(r.overall)), layers,
    of: lang === "en" ? `on ${layers} of 6 layers` : `auf ${layers} von 6 Ebenen`,
    weakest: lang === "en" ? `Level ${r.weakest.level}` : `Stufe ${r.weakest.level}`,
    weakestName: weakest.name,
    exclusive: `${Math.round(r.exclusive_non_eu * 100)} %`, critical,
    cost: COST, blocks: kept.blocks.length
  };
}
const eurText = (x, lang) => (lang === "en" ? `€${x.toFixed(2)}` : `${x.toFixed(2).replace(".", ",")} €`);
const LABELS = {
  en: { steps: ["Understand", "Research", "Score", "Your review", "Recommend"], kpis: ["Overall score", "Weakest critical link", "Exclusive non-EU control", "Session cost"], guide: "How it works", turn: "Your turn:", sentence: "real sources", note: "indicative, not an official assessment", foot: "not an official service of the German Federal Government", play: "Play", pause: "Pause", replay: "Replay" },
  de: { steps: ["Verstehen", "Recherchieren", "Bewerten", "Ihre Prüfung", "Empfehlen"], kpis: ["Gesamtwert", "Schwächstes kritisches Glied", "Exklusive Nicht-EU-Kontrolle", "Sitzungskosten"], guide: "So funktioniert's", turn: "Sie sind dran:", sentence: "echten Quellen", note: "indikativ, keine amtliche Bewertung", foot: "kein offizielles Angebot der Bundesregierung", play: "Abspielen", pause: "Pause", replay: "Neu abspielen" }
};

const server = await serveStatic(APP_ROOT, 8400 + Math.floor(Math.random() * 300));
const browser = await launchBrowser();
const failures = [];
let checks = 0;
const ran = [];
const expect = (name, what, ok, detail = "") => { checks += 1; if (!ok) failures.push(`${name}: ${what}${detail !== "" ? ` (${String(detail).slice(0, 300)})` : ""}`); };

/** Opens the page in a new tab of a new context. guide: let the guide open by itself; else ?guide=0. */
async function open(query = "", { size = [1600, 900], theme = "light", lang = "en", guide = false, context = null, offlineAfterLoad = false } = {}) {
  const ctx = context || await browser.newContext({ viewport: { width: size[0], height: size[1] } });
  if (!context) {
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort("blockedbyclient"));
    await ctx.addInitScript((t) => { try { localStorage.setItem("vc-theme", t); } catch { /* blocked */ } }, theme);
  }
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  page.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !NETWORK_NOISE.test(m.text())) errors.push(m.text()); });
  page.on("request", (r) => requests.push(r.url()));
  const q = new URLSearchParams(query);
  if (!q.has("lang")) q.set("lang", lang);
  if (!guide && !q.has("guide")) q.set("guide", "0");
  await page.goto(`${server.base}?${q}`);
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  await settle(page);
  if (offlineAfterLoad) await ctx.setOffline(true);
  return { context: ctx, page, errors, requests };
}
const settle = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const text = (page, sel) => page.locator(sel).first().innerText().then(nb);
const state = (page) => page.evaluate(() => {
  const S = window.sovereignty.S;
  const P = window.sovereignty.P;
  const primary = document.getElementById("turn-primary");
  const bar = document.getElementById("turn");
  return {
    step: S.view.steps[S.step].id, waits: !!S.view.steps[S.step].waits, playing: P.on, play: document.getElementById("play-text").textContent,
    bar: bar.dataset.state, lead: document.getElementById("turn-lead").textContent, what: document.getElementById("turn-what").textContent,
    primary: primary.hidden ? null : primary.textContent.trim(), attention: primary.classList.contains("vc-attention"), act: primary.dataset.act
  };
});
async function key(page, k) { await page.keyboard.press(k); await settle(page); }
const goLast = (page) => page.evaluate(() => window.sovereignty.go(window.sovereignty.S.view.steps.findLastIndex((st) => st.ready)));
/** Walks BundID to its end: each step, each decision with the bar's primary action. visit(name) at every stage. */
async function walk(page, visit) {
  for (const [k, name] of [["1", "understand"], ["2", "research"], ["3", "score"], ["4", "review"]]) { await key(page, k); await visit(name); }
  await page.click("#turn-primary"); await settle(page); await visit("review, confirmed");
  await key(page, "5"); await visit("recommend, the lever");
  await page.click("#turn-primary"); await settle(page); await visit("recommend, the memo");
  await page.click("#turn-primary"); await settle(page); await visit("recommend, done");
}
const visible = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const st = getComputedStyle(el);
  return r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5 && st.visibility !== "hidden" && st.display !== "none";
}, sel);
const done = (name) => { if (!failures.some((f) => f.startsWith(`${name}:`))) console.log(`SHOWCASE OK ${name}`); ran.push(name); };

// ---- guide ------------------------------------------------------------------------------------------
if (wanted("guide")) {
  for (const lang of ["en", "de"]) {
    const name = "guide";
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort("blockedbyclient"));
    const a = await open(`lang=${lang}`, { guide: true, context: ctx });
    const id = `#guide-${lang}`;
    const other = `#guide-${lang === "en" ? "de" : "en"}`;
    expect(name, `${lang}: the guide in the page's language opens by itself in a new tab`, await a.page.evaluate(([g, o]) => document.querySelector(g).open && !document.querySelector(o).open, [id, other]));
    expect(name, `${lang}: its title is in its language`, (await text(a.page, `${id} h2`)) === (lang === "en" ? "How the prototype works" : "So funktioniert der Prototyp"), await text(a.page, `${id} h2`));
    // Every chapter fits 1280 × 720.
    const chapters = await a.page.$$eval(`${id} .vc-guide__chapter`, (els) => els.length);
    for (let i = 0; i < chapters; i++) {
      const fit = await a.page.evaluate((g) => {
        const ch = [...document.querySelectorAll(`${g} .vc-guide__chapter`)].find((c) => !c.hidden);
        const box = ch.closest(".vc-guide__chapters") || ch.parentElement;
        const dlg = document.querySelector(g).getBoundingClientRect();
        return { id: ch.dataset.vcChapter, scroll: box.scrollHeight - box.clientHeight, inside: dlg.top >= 0 && dlg.bottom <= innerHeight };
      }, id);
      expect(name, `${lang}: chapter "${fit.id}" fits 1280 × 720 without scrolling`, fit.scroll <= 1 && fit.inside, JSON.stringify(fit));
      if (i < chapters - 1) { await a.page.click(`${id} [data-vc-guide-next]`); await settle(a.page); }
    }
    // How it works: a row per key figure, named as on its tile, with BundID's figure.
    const rows = await a.page.$$eval(`${id} [data-vc-chapter="how"] tbody tr`, (trs) => trs.map((r) => [r.querySelector("th")?.textContent.trim(), r.innerText.replace(/\s+/g, " ")]));
    const E = EXPECT[lang];
    expect(name, `${lang}: How it works has one row per key figure, named as on its tile`, rows.map((r) => r[0]).join("|") === LABELS[lang].kpis.join("|"), rows.map((r) => r[0]).join("|"));
    expect(name, `${lang}: the rows carry the engine's BundID figures`, nb(rows[0]?.[1]).includes(`${E.score} ${E.of}`) && nb(rows[1]?.[1]).includes(`${E.weakest} ${lang === "en" ? "of" : "von"} 4`) && nb(rows[1]?.[1]).includes(E.weakestName) && nb(rows[2]?.[1]).includes(E.exclusive) && nb(rows[3]?.[1]).includes(eurText(E.cost, lang)), JSON.stringify(rows.map((r) => nb(r[1]))));
    const say = await a.page.$$eval(`${id} [data-vc-chapter="present"] .vc-guide__path li`, (els) => els.map((e) => [e.querySelector(".vc-guide__time")?.textContent.trim(), e.innerText.replace(/\s+/g, " ")]));
    expect(name, `${lang}: the talk track has three to seven timed steps`, say.length >= 3 && say.length <= 7 && say.every(([t]) => /^\d+ min$/.test(t || "")), JSON.stringify(say));
    expect(name, `${lang}: the talk track quotes the engine's figures`, nb(say.map((s) => s[1]).join(" ")).includes(`${E.blocks} `) && nb(say.map((s) => s[1]).join(" ")).includes(`${E.weakest} ${lang === "en" ? "of" : "von"} 4`), JSON.stringify(say.map((s) => s[1])));
    await a.page.click(`${id} [data-vc-guide-next]`);
    await settle(a.page);
    expect(name, `${lang}: Start on the last chapter closes the guide and Play starts`, !(await a.page.evaluate((g) => document.querySelector(g).open, id)) && (await state(a.page)).playing);
    // A reload in the same tab, in either language: the guide stays closed.
    await a.page.reload();
    await a.page.waitForSelector('html[data-boot="ready"]');
    expect(name, `${lang}: a reload in the same tab leaves it closed`, !(await a.page.evaluate(() => [...document.querySelectorAll("dialog.vc-guide")].some((d) => d.open))));
    const otherLang = lang === "en" ? "de" : "en";
    await a.page.goto(`${server.base}?lang=${otherLang}`);
    await a.page.waitForSelector('html[data-boot="ready"]');
    await settle(a.page);
    expect(name, `${lang}: the same tab in the other language leaves its guide closed too (once per tab across both)`, !(await a.page.evaluate(() => [...document.querySelectorAll("dialog.vc-guide")].some((d) => d.open))));
    // A new tab opens it again.
    const b = await open(`lang=${lang}`, { guide: true, context: ctx });
    expect(name, `${lang}: a new tab opens it again`, await b.page.evaluate((g) => document.querySelector(g).open, id));
    expect(name, `${lang}: no error`, !a.errors.length && !b.errors.length, [...a.errors, ...b.errors].join(" | "));
    await ctx.close();
    const zero = await open(`lang=${lang}&guide=0`, { guide: true });
    expect(name, `${lang}: ?guide=0 keeps it closed`, !(await zero.page.evaluate(() => [...document.querySelectorAll("dialog.vc-guide")].some((d) => d.open))));
    await zero.context.close();
    const present = await open(`lang=${lang}&guide=present`, { guide: true });
    const shownChapter = await present.page.evaluate((g) => { const d = document.querySelector(g); return d.open ? [...d.querySelectorAll(".vc-guide__chapter")].find((c) => !c.hidden)?.dataset.vcChapter : null; }, id);
    expect(name, `${lang}: ?guide=present opens it on the talk track`, shownChapter === "present", shownChapter);
    await present.context.close();
  }
  done("guide");
}

// ---- kpis -------------------------------------------------------------------------------------------
if (wanted("kpis")) {
  const name = "kpis";
  for (const size of [[1920, 1080], [1280, 720]]) {
    for (const lang of ["en", "de"]) {
      const { context, page, errors } = await open(`lang=${lang}`, { size });
      const tiles = await page.$$eval("[data-vc-kpi]", (els) => els.map((e) => {
        const r = e.getBoundingClientRect();
        const header = document.querySelector(".app-header").getBoundingClientRect();
        return { en: e.dataset.vcKpi, de: e.dataset.vcKpiDe, label: e.querySelector(".vc-stat__label")?.textContent.trim(), value: e.querySelector(".vc-stat__value")?.innerText, note: e.querySelector(".vc-stat__note")?.innerText, right: r.right, left: r.left, top: r.top, bottom: r.bottom, header: [header.top, header.bottom, header.right] };
      }));
      const where = `${size[0]}×${size[1]} ${lang}`;
      expect(name, `${where}: two to four tiles, each with data-vc-kpi and data-vc-kpi-de`, tiles.length >= 2 && tiles.length <= 4 && tiles.every((t) => t.en && t.de), JSON.stringify(tiles.map((t) => [t.en, t.de])));
      expect(name, `${where}: the tiles say their names in the page's language`, tiles.map((t) => t.label).join("|") === LABELS[lang].kpis.join("|"), tiles.map((t) => t.label).join("|"));
      // Top right: one row of tiles in the header, under its name and controls (D8), ending at the window's right edge.
      expect(name, `${where}: the tiles sit top right, in one row inside the header`, tiles.every((t) => t.top >= t.header[0] && t.bottom <= t.header[1] + 0.5 && t.right <= size[0] && Math.abs(t.top - tiles[0].top) < 1) && tiles.every((t, i) => i === 0 || t.left >= tiles[i - 1].right) && tiles.at(-1).right > size[0] - 40, JSON.stringify(tiles.map((t) => [Math.round(t.left), Math.round(t.right), Math.round(t.top), Math.round(t.bottom)])));
      const E = EXPECT[lang];
      const v = tiles.map((t) => nb(t.value));
      expect(name, `${where}: Overall score is the engine's, on its layers`, v[0] === `${E.score} ${E.of}`, v[0]);
      expect(name, `${where}: Weakest critical link is the engine's, by its name`, v[1] === `${E.weakest} ${lang === "en" ? "of" : "von"} 4` && nb(tiles[1].note) === nb(E.weakestName), `${v[1]} / ${tiles[1].note}`);
      expect(name, `${where}: Exclusive non-EU control is the engine's share`, v[2] === E.exclusive && nb(tiles[2].note).includes(String(E.critical)), `${v[2]} / ${tiles[2].note}`);
      expect(name, `${where}: Session cost is what a live run would cost, and this replay is free`, v[3] === `≈ ${eurText(E.cost, lang)} ${lang === "en" ? "for a live run" : "im Live-Lauf"}` && nb(tiles[3].note) === (lang === "en" ? "this replay: €0" : "diese Wiedergabe: 0 €"), `${v[3]} / ${tiles[3].note}`);
      expect(name, `${where}: no error`, !errors.length, errors.join(" | "));
      await context.close();
    }
  }
  done("kpis");
}

// ---- partial ----------------------------------------------------------------------------------------
if (wanted("partial")) {
  const name = "partial";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const of = lang === "en" ? / of 6 layers$/ : / von 6 Ebenen$/;
    await walk(page, async (stage) => {
      const v = nb(await page.locator("#kpi-score .vc-stat__value").innerText());
      expect(name, `${lang}, ${stage}: the score's value says on how many of six layers it rests`, of.test(v), v);
    });
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("partial");
}

// ---- header -----------------------------------------------------------------------------------------
if (wanted("header")) {
  const name = "header";
  for (const lang of ["en", "de"]) {
    for (const size of [[1280, 720], [1920, 1080]]) {
      const { context, page, errors } = await open(`lang=${lang}`, { size });
      const where = `${size[0]} ${lang}`;
      const h = await page.evaluate(() => {
        const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
        const guide = [...document.querySelectorAll("[data-vc-guide-open]")].find((b) => !b.hidden);
        const parts = { brand: box(document.querySelector(".brand")), mode: box(document.getElementById("mode-tag")), guide: box(guide), theme: box(document.querySelector("[data-vc-theme-toggle], .theme-toggle")), lang: box(document.querySelector(".lang-switch")), kpis: box(document.querySelector(".kpis")) };
        return {
          parts, icon: !!document.querySelector(".brand .vc-cell .vc-icon--honeycomb"), name: document.querySelector(".brand-name")?.innerText.replace(/\s+/g, " ").trim(),
          mode: document.getElementById("mode-text").textContent, guideText: guide?.innerText.trim(), guideClipped: guide ? guide.scrollWidth > guide.clientWidth + 1 : true,
          langs: [...document.querySelectorAll(".lang-option")].map((b) => b.textContent.trim()), header: box(document.querySelector(".app-header")),
          sentence: document.querySelector(".intro-text")?.textContent.trim(), byline: !!document.querySelector(".stage-foot .vc-byline"), intro: box(document.querySelector(".intro-text")), inHeader: !!document.querySelector(".app-header .intro-text")
        };
      });
      expect(name, `${where}: the icon and the name`, h.icon && /Sovereignty Assessment|Souveränitäts­?bewertung/.test(h.name.replace(/\u00ad/g, "")), h.name);
      expect(name, `${where}: SIMULATION`, h.mode === "SIMULATION", h.mode);
      expect(name, `${where}: ${LABELS[lang].guide} with its words in view`, h.guideText === LABELS[lang].guide && !h.guideClipped && h.parts.guide.r <= size[0], h.guideText);
      expect(name, `${where}: EN | DE and the theme toggle`, h.langs.join("|") === "EN|DE" && !!h.parts.theme, h.langs.join("|"));
      const order = ["brand", "mode", "guide", "theme", "lang"].map((k) => h.parts[k]).filter(Boolean);
      expect(name, `${where}: the header's parts sit apart, left to right, inside the window, the figures under them`, order.every((p, i) => i === 0 || p.l >= order[i - 1].r - 0.5) && order.every((p) => p.r <= size[0] + 0.5) && h.parts.kpis.t >= Math.max(...order.map((p) => p.b)) - 0.5, JSON.stringify(order.map((p) => [Math.round(p.l), Math.round(p.r)])));
      expect(name, `${where}: one sentence beside the name says what it does and that its sources are real; the byline at the foot of the stage`, h.sentence.includes(LABELS[lang].sentence) && h.sentence.includes(LABELS[lang].note) && /^[^.!?]+[.!?]$/.test(h.sentence) && h.inHeader && h.intro.l >= h.parts.brand.r - 0.5 && h.intro.r <= h.parts.mode.l + 0.5 && h.byline, h.sentence);
      expect(name, `${where}: no error`, !errors.length, errors.join(" | "));
      await context.close();
    }
  }
  done("header");
}

// ---- turn -------------------------------------------------------------------------------------------
if (wanted("turn")) {
  const name = "turn";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    await walk(page, async (stage) => {
      const s = await state(page);
      const geometry = await page.evaluate(() => {
        const bar = document.getElementById("turn").getBoundingClientRect();
        const story = document.querySelector(".story").getBoundingClientRect();
        const last = [...document.querySelectorAll(".story > :not(.turn-bar):not([hidden])")].map((e) => e.getBoundingClientRect().bottom);
        return { inStory: bar.left >= story.left - 1 && bar.right <= story.right + 1, under: bar.top >= Math.max(...last) - 1, primaries: document.querySelectorAll(".turn-bar .vc-button:not(.vc-button--outline):not([hidden])").length };
      });
      if (s.waits) {
        expect(name, `${lang}, ${stage}: the page waits, and the bar says it is your turn`, s.bar === "turn" && s.lead === LABELS[lang].turn && s.what.length > 10, JSON.stringify(s));
        expect(name, `${lang}, ${stage}: one primary action, drawing attention`, !!s.primary && s.attention && geometry.primaries === 1, JSON.stringify({ ...s, ...geometry }));
      }
      expect(name, `${lang}, ${stage}: the bar sits right under the story, in view`, geometry.inStory && geometry.under && (await visible(page, "#turn")), JSON.stringify(geometry));
    });
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("turn");
}

// ---- play -------------------------------------------------------------------------------------------
if (wanted("play")) {
  const name = "play";
  const { context, page, errors } = await open("", { guide: true, size: [1600, 900] });
  expect(name, "Play waits while the guide is open", !(await state(page)).playing);
  await page.keyboard.press("Escape");
  await settle(page);
  const started = Date.now();
  let s = await state(page);
  expect(name, "closing the guide starts Play on step 1", s.playing && s.step === "understand" && s.play === LABELS.en.pause, JSON.stringify(s));
  await page.waitForFunction(() => window.sovereignty.S.view.steps[window.sovereignty.S.step].id === "research", null, { timeout: 16000 });
  const held = (Date.now() - started) / 1000;
  expect(name, "Play holds step 1 between 7 and 14 seconds", held >= 6.5 && held <= 14.8, `${held.toFixed(1)} s`);
  expect(name, "the address follows Play", new URL(page.url()).searchParams.get("step") === "research", page.url());
  await page.evaluate(() => document.activeElement?.blur());
  await key(page, " ");
  s = await state(page);
  expect(name, "Space pauses", !s.playing && s.play === LABELS.en.play, JSON.stringify(s));
  await page.waitForTimeout(1200);
  expect(name, "paused, the page stays on its step", (await state(page)).step === "research");
  await key(page, " ");
  expect(name, "Space plays again", (await state(page)).playing);
  await key(page, "3");
  s = await state(page);
  expect(name, "a chosen step pauses Play", !s.playing && s.step === "score", JSON.stringify(s));
  await page.click("#play");
  await settle(page);
  await page.waitForFunction(() => window.sovereignty.S.view.steps[window.sovereignty.S.step].id === "review", null, { timeout: 16000 });
  await page.waitForTimeout(600);
  s = await state(page);
  expect(name, "Play stops where the person acts: Your turn, the decision marked", s.waits && s.bar === "turn" && s.attention && s.act === "confirm", JSON.stringify(s));
  await page.waitForTimeout(1500);
  expect(name, "and waits there for the person", (await state(page)).step === "review" && (await page.evaluate(() => window.sovereignty.P.at)) === 0);
  // After the person acts, Play goes on by itself and stops again at the next decision.
  await page.click("#turn-primary");
  await settle(page);
  expect(name, "after the review Play moves on to Recommend by itself", await page.waitForFunction(() => window.sovereignty.S.view.steps[window.sovereignty.S.step].id === "recommend", null, { timeout: 16000 }).then(() => true, () => false));
  await page.waitForTimeout(400);
  s = await state(page);
  expect(name, "and stops at the lever", s.waits && s.act === "approve", JSON.stringify(s));
  await page.click("#turn-primary");
  await settle(page);
  await page.waitForFunction(() => window.sovereignty.S.view.steps[4].turn?.act === "memo-approve", null, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
  s = await state(page);
  expect(name, "after the lever Play holds on to the draft memo, still playing", s.waits && s.act === "memo-approve" && s.playing && s.play === LABELS.en.pause, JSON.stringify(s));
  await page.click("#turn-primary");
  await settle(page);
  s = await state(page);
  expect(name, "after the last decision the story ends on Replay", s.play === LABELS.en.replay && s.bar === "done", JSON.stringify(s));
  await page.click("#play");
  await page.waitForFunction(() => window.sovereignty.S.view?.steps[3].waits === true && window.sovereignty.S.step === 0, null, { timeout: 10000 }).catch(() => {});
  s = await state(page);
  expect(name, "Replay plays the case again from step 1, its decisions open again", s.step === "understand" && s.playing, JSON.stringify(s));
  expect(name, "no error", !errors.length, errors.join(" | "));
  await context.close();
  const link = await open("step=research", { guide: false });
  await link.page.waitForTimeout(1000);
  s = await state(link.page);
  expect(name, "a link to a step opens it paused", !s.playing && s.step === "research", JSON.stringify(s));
  await link.page.waitForTimeout(4600);
  expect(name, "paused, the next action draws the eye after a few seconds", (await state(link.page)).attention);
  await link.context.close();
  done("play");
}

// ---- lang -------------------------------------------------------------------------------------------
if (wanted("lang")) {
  const name = "lang";
  const { context, page, errors } = await open("", { size: [1600, 900] });
  await page.evaluate(() => { window.__sameDocument = true; });
  await key(page, "4");
  await page.click("#turn-primary");
  await settle(page);
  await key(page, "5");
  await page.click('.lang-option[data-lang="de"]');
  await page.waitForFunction(() => document.documentElement.lang === "de");
  await page.waitForTimeout(400);
  const de = await page.evaluate(() => ({ same: window.__sameDocument === true, step: window.sovereignty.S.view.steps[window.sovereignty.S.step].id, reviewed: !!window.sovereignty.S.run.reviewed, text: [".app-header", ".intro", ".talk", ".workspace"].map((s) => document.querySelector(s).innerText).join("\n") }));
  expect(name, "EN | DE switches in place, without a reload", de.same);
  expect(name, "the step and the decisions stay", de.step === "recommend" && de.reviewed, JSON.stringify({ step: de.step, reviewed: de.reviewed }));
  const ENGLISH = [/\bYour turn\b/, /\bOverall score\b/, /\bWeakest critical link\b/, /\bUnderstand\b/, /\bResearch\b/, /\bRecommend\b/, /\bStart agent\b/, /\bHow it works\b/, /\bSession cost\b/, /\bBuilt by\b/, /\blayers\b/, /\bthe lever\b/, /\bApprove\b/, /\bSources\b/, /\bPlay\b/, /\bmade\b/];
  const leftover = ENGLISH.filter((re) => re.test(de.text)).map((re) => re.source);
  expect(name, "every visible word is German after the switch", !leftover.length, leftover.join(", "));
  await page.click('.lang-option[data-lang="en"]');
  await page.waitForFunction(() => document.documentElement.lang === "en-GB");
  await page.waitForTimeout(400);
  const en = await page.evaluate(() => [".app-header", ".intro", ".talk", ".workspace"].map((s) => document.querySelector(s).innerText).join("\n"));
  const GERMAN = [/\bSie sind dran\b/, /\bGesamtwert\b/, /\bVerstehen\b/, /\bEmpfehlen\b/, /\bAgent starten\b/, /\bEbenen\b/, /\bQuellen\b/, /\bErstellt von\b/];
  const back = GERMAN.filter((re) => re.test(en)).map((re) => re.source);
  expect(name, "and back to English, every word", !back.length, back.join(", "));
  // While Play runs: the switch keeps Play going on the same step.
  await key(page, "1");
  await page.click("#play");
  await settle(page);
  await page.click('.lang-option[data-lang="de"]');
  await page.waitForFunction(() => document.documentElement.lang === "de");
  await page.waitForTimeout(300);
  const s = await state(page);
  expect(name, "a switch while Play runs keeps it running on its step", s.playing && s.step === "understand" && s.play === LABELS.de.pause, JSON.stringify(s));
  expect(name, "no error", !errors.length, errors.join(" | "));
  await context.close();
  done("lang");
}

// ---- network ----------------------------------------------------------------------------------------
if (wanted("network")) {
  const name = "network";
  const { context, page, errors, requests } = await open("", { size: [1600, 900] });
  const ownLinks = [];
  const caseIds = await page.$$eval("#case-menu [data-case]", (els) => els.map((e) => e.dataset.case));
  for (const id of caseIds) {
    await page.evaluate((id) => window.sovereignty.openCase(window.SA_CATALOGUE.entries.find((e) => e.id === id), 0), id);
    await settle(page);
    for (let guard = 0; guard < 12; guard++) {
      ownLinks.push(...(await page.$$eval('a[href*="github.com/VictorPflueger/sovereigntyassessment" i]', (as) => as.map((a) => a.href))).map((h) => `${id}: ${h}`));
      // Open every quote list on the step, so a hidden link counts too.
      await page.$$eval(".src-toggle, .src-more", (bs) => bs.forEach((b) => b.click()));
      ownLinks.push(...(await page.$$eval('a[href*="github.com/VictorPflueger/sovereigntyassessment" i]', (as) => as.map((a) => a.href))).map((h) => `${id}: ${h}`));
      const st = await state(page);
      if (st.waits && st.act) { await page.click("#turn-primary"); await settle(page); continue; }
      const next = await page.evaluate(() => !!window.sovereignty.S.view.steps[window.sovereignty.S.step + 1]?.ready);
      if (!next) break;
      await page.evaluate(() => window.sovereignty.go(window.sovereignty.S.step + 1));
      await settle(page);
    }
  }
  expect(name, `no link to the prototype's own repository on any step of the ${caseIds.length} cases`, !ownLinks.length, [...new Set(ownLinks)].slice(0, 4).join(", "));
  const outside = requests.filter((u) => !u.startsWith(server.base) && !u.startsWith("data:"));
  expect(name, "nothing requested from another site, every case played", !outside.length, outside.slice(0, 5).join(", "));
  expect(name, "no error", !errors.length, errors.join(" | "));
  await context.close();
  done("network");
}

// ---- offline ----------------------------------------------------------------------------------------
if (wanted("offline")) {
  const name = "offline";
  const { context, page, errors, requests } = await open("", { size: [1280, 720], offlineAfterLoad: true });
  expect(name, "BundID is the case on the first screen", (await text(page, "#case-name")) === "BundID" && (await state(page)).step === "understand", await text(page, "#case-name"));
  const before = requests.length;
  await walk(page, async () => {});
  const s = await state(page);
  expect(name, "offline, it plays to its end from its pre-run", s.bar === "done" && (await page.evaluate(() => window.sovereignty.S.run.memo?.status)) === "approved", JSON.stringify(s));
  // The browser fetches the page's icon again when the address changes; that is the browser's, not the page's.
  const after = requests.slice(before).filter((u) => !u.endsWith("/favicon.svg"));
  expect(name, "offline, the page makes no request at all", !after.length, after.join(", "));
  expect(name, "no error", !errors.length, errors.join(" | "));
  await context.close();
  done("offline");
}

// ---- steps ------------------------------------------------------------------------------------------
if (wanted("steps")) {
  const name = "steps";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const steps = await page.evaluate(() => {
      const header = document.querySelector(".app-header").getBoundingClientRect().bottom;
      return [...document.querySelectorAll("#steps .vc-step")].map((li) => ({ id: li.dataset.step, label: li.querySelector(".vc-step__label").textContent, person: li.dataset.person === "true", below: li.getBoundingClientRect().top >= header }));
    });
    expect(name, `${lang}: five steps under the header`, steps.length === 5 && steps.every((s) => s.below) && steps.map((s) => s.label).join("|") === LABELS[lang].steps.join("|"), steps.map((s) => s.label).join("|"));
    expect(name, `${lang}: Your review and Recommend are the person's turns`, steps.map((s) => s.person).join() === "false,false,false,true,true");
    for (const [i, id] of ["understand", "research", "score", "review"].entries()) {
      await page.click(`#steps .vc-step[data-step="${id}"] .vc-step__button`);
      await settle(page);
      expect(name, `${lang}: a click shows step ${i + 1}, marked, the address naming it`, (await state(page)).step === id && (await page.getAttribute(`#steps .vc-step[data-step="${id}"] .vc-step__button`, "aria-current")) === "step" && new URL(page.url()).searchParams.get("step") === id);
    }
    expect(name, `${lang}: Recommend opens only after the review`, await page.isDisabled('#steps .vc-step[data-step="recommend"] .vc-step__button'));
    await page.click("#turn-primary");
    await settle(page);
    await key(page, "ArrowRight");
    expect(name, `${lang}: → moves on`, (await state(page)).step === "recommend");
    await key(page, "PageUp");
    expect(name, `${lang}: a clicker's PageUp moves back`, (await state(page)).step === "review");
    await key(page, "1");
    expect(name, `${lang}: the 1 key shows step 1`, (await state(page)).step === "understand");
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  const link = await open("step=score");
  expect(name, "?step=score opens Score", (await state(link.page)).step === "score");
  await link.context.close();
  done("steps");
}

// ---- names ------------------------------------------------------------------------------------------
if (wanted("names")) {
  const name = "names";
  // The catalogue's acronyms: what an entry's names write in capitals, or in brackets.
  const acronyms = new Set();
  // "ID" (Online ID) and "FIT" (FIT-Connect) are parts of names, not acronyms that stand for one.
  for (const e of win.SA_CATALOGUE.entries) for (const n of Object.values(e.names || {})) for (const m of String(n).matchAll(/\b([A-Z][A-Za-z]*[A-Z][A-Za-z]*)\b/g)) if (m[1].length <= 7 && !/^(BundID|App|EU|AI|KI|ID|FIT)$/.test(m[1])) acronyms.add(m[1]);
  const ACR = new RegExp(`\\b(${[...acronyms].join("|")})\\b`);
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1600, 900] });
    const seen = [];
    await walk(page, async (stage) => {
      await page.$$eval(".src-toggle, .src-more", (bs) => bs.forEach((b) => b.click()));
      seen.push([stage, await page.evaluate(() => [".app-header", ".talk", ".workspace"].map((s) => document.querySelector(s).innerText).join("\n"))]);
    });
    const ids = seen.filter(([, t]) => /(?<![\p{L}\p{N}-])B-\d{2}(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])L[1-3](?![\p{L}\p{N}])/u.test(t)).map(([s]) => s);
    expect(name, `${lang}: no block or lever id on any screen of the BundID talk track`, !ids.length, ids.join(", "));
    const acr = seen.map(([s, t]) => [s, (t.match(ACR) || [])[0]]).filter(([, m]) => m);
    expect(name, `${lang}: no catalogue acronym on any screen of the BundID talk track (${[...acronyms].join(", ")})`, !acr.length, acr.map(([s, m]) => `${s}: ${m}`).join(", "));
    await page.click("#case-button");
    const items = await page.$$eval("#case-menu [data-case]", (els) => els.map((e) => e.querySelector(".case-item-name, .vc-menu__label")?.textContent.trim() || e.textContent.trim()));
    expect(name, `${lang}: the case menu offers every catalogue entry by its name`, items.length === win.SA_CATALOGUE.entries.length && items.every((t) => t.split(/\s+/).length >= 2 || /^(BundID|openCode|ePayBL)/.test(t)) && !items.some((t) => /^[A-Z]{2,6}$/.test(t)), items.join(" | "));
    await page.keyboard.press("Escape");
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("names");
}

// ---- start ------------------------------------------------------------------------------------------
if (wanted("start")) {
  const name = "start";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const notice = lang === "en" ? "You are interacting with an AI system" : "Sie interagieren mit einem KI-System";
    const beside = await page.evaluate((n) => {
      const out = [];
      for (const b of document.querySelectorAll("[data-vc-live]")) {
        const scope = b.closest(".start-card") || b.closest(".talk") || b.closest("dialog") || document.body;
        const tag = [...scope.querySelectorAll(".vc-tag--feature")].find((t) => t.textContent.includes(n));
        out.push({ id: b.id, ok: !!tag, near: tag ? Math.round(Math.hypot(tag.getBoundingClientRect().left - b.getBoundingClientRect().right, tag.getBoundingClientRect().top - b.getBoundingClientRect().top)) : null });
      }
      return out;
    }, notice);
    expect(name, `${lang}: "${notice}" beside every control that can start a live run`, beside.length >= 2 && beside.every((b) => b.ok), JSON.stringify(beside));
    await page.click("#start");
    await page.waitForSelector("#start-dialog[open]");
    await settle(page);
    const d = await page.evaluate(() => {
      const sim = document.querySelector("#start-dialog .start-sim");
      const key = document.getElementById("live-key");
      return { simFirst: !!sim?.querySelector("#start-sim") && !!(sim.compareDocumentPosition(key) & Node.DOCUMENT_POSITION_FOLLOWING), focus: document.activeElement?.id, simText: document.getElementById("start-sim-text").textContent };
    });
    expect(name, `${lang}: Start agent offers the free simulation first, focused`, d.simFirst && d.focus === "start-sim" && /BundID/.test(d.simText), JSON.stringify(d));
    expect(name, `${lang}: the AI notice stands beside the live run's start button, in the dialog's footer`, await page.evaluate((n) => { const foot = document.querySelector("#start-dialog .vc-dialog__footer"); return !!foot?.querySelector("#live-start") && [...foot.querySelectorAll(".vc-tag--feature")].some((t) => t.textContent.includes(n)); }, notice));
    // Start waits for a key and the acknowledgement, which is unticked at every opening.
    const gate = async () => page.evaluate(() => document.getElementById("live-start").disabled);
    const closed = await gate();
    await page.fill("#live-key", "sk-ant-api03-0123456789abcdefghijklmnopqrstuvwxyz");
    const keyOnly = await gate();
    await page.check("#live-ack");
    const both = await gate();
    await page.uncheck("#live-ack");
    expect(name, `${lang}: Start waits for the key and the acknowledgement`, closed && keyOnly && !both, JSON.stringify([closed, keyOnly, both]));
    await page.fill("#live-key", "");
    await page.click("#start-sim");
    const again = await page.waitForFunction(() => window.sovereignty.P.on && window.sovereignty.S.step === 0 && !window.sovereignty.S.replaying, null, { timeout: 10000 }).then(() => true, () => false);
    expect(name, `${lang}: the simulation plays again from step 1`, again, JSON.stringify(await state(page)));
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("start");
}

// ---- keep -------------------------------------------------------------------------------------------
if (wanted("keep")) {
  const name = "keep";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1600, 900] });
    const L = LABELS[lang];
    expect(name, `${lang}: the strip says "${L.note}"`, (await text(page, ".intro-text")).includes(L.note));
    const foot = await text(page, ".stage-foot");
    expect(name, `${lang}: the stage says "${L.foot}", with no dash`, foot.includes(L.foot) && !/[–—]/.test(foot), foot);
    let quotes = 0;
    await walk(page, async (stage) => {
      await page.$$eval(".src-toggle, .src-more", (bs) => bs.forEach((b) => b.click()));
      const src = await page.$$eval("#stage-body .src", (els) => els.map((e) => ({ quote: !!e.querySelector("q")?.textContent.trim(), link: !!e.querySelector("a[href^='https://']") || !!e.querySelector(".src-title"), read: /read \d|gelesen am \d/.test(e.querySelector(".src-meta")?.textContent || "") })));
      quotes += src.length;
      const bad = src.filter((s) => !s.quote || !s.link || !s.read);
      expect(name, `${lang}, ${stage}: every source shown has its quote, its page and the date it was read`, !bad.length, JSON.stringify(bad.slice(0, 2)));
    });
    expect(name, `${lang}: the talk track shows sources (${quotes})`, quotes >= 20, quotes);
    const memo = await page.evaluate(() => ({ status: window.sovereignty.S.run.memo?.status, text: document.querySelector(".memo")?.innerText || "", outcome: document.querySelector("#stage-body .outcome")?.innerText || "" }));
    expect(name, `${lang}: the memo is a draft and nothing is sent`, memo.status === "approved" && /Draft|Entwurf/.test(memo.text) && /nothing leaves this page|Nichts verlässt diese Seite/i.test(memo.outcome) && /not sent|nicht versendet/.test(memo.text), JSON.stringify(memo).slice(0, 200));
    const log = await page.$$eval("#log-list li", (els) => els.map((e) => e.textContent.trim()));
    expect(name, `${lang}: the decision log holds every decision with its time, open at the end`, log.length >= 3 && log.every((l) => /^\d\d:\d\d:\d\d /.test(l)) && (await page.evaluate(() => document.getElementById("log").open)), log.join(" | "));
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("keep");
}

// ---- cases ------------------------------------------------------------------------------------------
if (wanted("cases")) {
  const name = "cases";
  const { context, page, errors } = await open("", { size: [1280, 720] });
  await page.click("#case-button");
  const ids = await page.$$eval("#case-menu [data-case]", (els) => els.map((e) => e.dataset.case));
  await page.keyboard.press("Escape");
  expect(name, "eighteen cases in the menu", ids.length === 18, ids.length);
  for (const id of ids) {
    const before = await page.evaluate(() => window.sovereignty.S.runId);
    await page.click("#case-button");
    await page.click(`#case-menu [data-case="${id}"]`);
    await page.waitForFunction(([x, b]) => window.sovereignty.S.runId !== b && window.sovereignty.S.run?.entryId === x && !window.sovereignty.S.replaying, [id, before], { timeout: 15000 });
    await settle(page);
    expect(name, `${id}: the menu opens it at step 1`, (await state(page)).step === "understand");
    let guard = 0;
    for (; guard < 12; guard++) {
      const st = await state(page);
      if (st.waits && st.act) { await page.click("#turn-primary"); await settle(page); continue; }
      const next = await page.evaluate(() => !!window.sovereignty.S.view.steps[window.sovereignty.S.step + 1]?.ready);
      if (!next) break;
      await key(page, "ArrowRight");
    }
    const end = await state(page);
    expect(name, `${id}: it plays to its end`, end.bar === "done", JSON.stringify(end));
    const tile = nb(await page.locator("#kpi-score .vc-stat__value").innerText());
    expect(name, `${id}: the score tile is a figure on its layers, or says it is not scored`, / of 6 layers$/.test(tile) || /^Not scored$/.test(tile), tile);
  }
  expect(name, "no error", !errors.length, errors.join(" | "));
  await context.close();
  done("cases");
}

// ---- 2.1.0: every case's figures, computed here from the gated blocks of its pre-run -----------------------------
// The answers to the domain review (SA-01 to SA-07) are read off the page and compared with these.
const { links, layerSum } = await mod("js/chain.js");
const { digest } = await mod("js/run.js");
const { fmtDateShort } = await mod("js/format.js");
const ENG = {};
for (const def of Object.values(win.SA_RUNS)) {
  ENG[def.entry_id] = {};
  for (const lang of ["en", "de"]) {
    const kept = await playCase(def, lang, { choice: "keep" });
    const notService = digest(kept.events).notService;
    const gated = kept.blocks.map((b) => ({ id: b.id, ...gateBlock(b, b.evidence, {}).effective }));
    const result = !notService && gated.length ? score(gated) : null;
    ENG[def.entry_id][lang] = { result, notService, names: Object.fromEntries(kept.blocks.map((b) => [b.id, nb(b.name)])), links: result ? links(result) : null };
  }
}
const { t: tr } = await mod("js/i18n/index.js");
const t2 = (key, lang) => tr(key, null, lang);
const CSS_ESC = (v) => String(v).replace(/["\\]/g, "\\$&");
const ENTRIES = win.SA_CATALOGUE.entries.filter((e) => win.SA_RUNS[e.id]);
const ASSESSED = ENTRIES.filter((e) => ENG[e.id].en.result && ENG[e.id].en.result.overall !== null).map((e) => e.id);
const ENDED = ENTRIES.filter((e) => ENG[e.id].en.notService).map((e) => e.id);
const SELF = ENTRIES.filter((e) => e.category === "self_assessment").map((e) => e.id);
const scoredOf = (r) => LAYERS.filter((l) => r.layers[l].score !== null).length;
const W = {
  en: { level: (n) => `Level ${n} of 4`, of: (n) => `on ${n} of 6 layers`, lowest: "Lowest overall", notCritical: "not critical", noneCritical: "none critical", unknown: /critical blocks? not known/, noWeak: /^(No weak link|No block is lower)/, mark: { weakest: "weakest critical link", lowest: "lowest overall", unknown: "not known from the sources" }, crit: { critical: "critical", important: "important", supporting: "supporting" }, label: "Starting points for research, not a recommendation", points: "Level 4 is 100 points", noneLower: "none lower", live: "for a live run", replay: "this replay: €0", simFree: "the simulation costs nothing", state: "the six layers are the Deutschland-Stack's", viewed: "viewed" },
  de: { level: (n) => `Stufe ${n} von 4`, of: (n) => `auf ${n} von 6 Ebenen`, lowest: "Niedrigste insgesamt", notCritical: "nicht kritisch", noneCritical: "keiner kritisch", unknown: /kritische[r]? Bausteine? (aus den Quellen )?nicht bekannt/, noWeak: /^(Kein schwaches Glied|Kein Baustein liegt niedriger)/, mark: { weakest: "schwächstes kritisches Glied", lowest: "niedrigste insgesamt", unknown: "aus den Quellen nicht bekannt" }, crit: { critical: "kritisch", important: "wichtig", supporting: "unterstützend" }, label: "Ansatzpunkte für die Recherche, keine Empfehlung", points: "Stufe 4 sind 100 Punkte", noneLower: "keiner niedriger", live: "im Live-Lauf", replay: "diese Wiedergabe: 0 €", simFree: "die Simulation kostet nichts", state: "die sechs Ebenen sind die des Deutschland-Stacks", viewed: "angesehen" }
};
/** Opens a case at a step, paused; from Your review on, the findings confirmed as a person would. */
async function caseAt(page, id, step) {
  await page.evaluate(async ([id, step]) => {
    const s = window.sovereignty;
    await s.openCase(window.SA_CATALOGUE.entries.find((e) => e.id === id), 0);
    s.pause();
    if (step >= 3 && s.S.run.review && !s.S.run.reviewed) { s.act("confirm"); await new Promise((r) => setTimeout(r, 80)); }
    s.go(Math.min(step, s.S.view.steps.findLastIndex((st) => st.ready)));
  }, [id, step]);
  await settle(page);
}
/** The weakest-link tile and the score step's cells, as the page shows them. */
const readChain = (page) => page.evaluate(() => {
  const t = (el) => (el ? el.innerText.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim() : "");
  const tile = document.getElementById("kpi-weakest");
  return {
    value: t(tile.querySelector(".vc-stat__value")), note: t(tile.querySelector(".kpi-note")), noteBlock: tile.querySelector(".kpi-note [data-makeup]")?.dataset.makeup || null,
    also: [...tile.querySelectorAll(".kpi-also-line")].map((l) => ({ text: t(l.querySelector("[data-makeup]") || l), level: l.querySelector(".lvl")?.dataset.level ?? null, block: l.querySelector("[data-makeup]")?.dataset.makeup || null, visible: l.getBoundingClientRect().height > 0 })),
    cells: [...document.querySelectorAll("#stage-body .cell")].map((c) => ({ id: c.dataset.block, marks: (c.dataset.marks || "").split(" ").filter(Boolean), name: t(c.querySelector(".cell-name")), crit: t(c.querySelector(".cell-crit")), flags: [...c.querySelectorAll(".cell-flag")].map(t) }))
  };
});
/** The text of the open make-up. */
const makeupText = (page) => page.evaluate(() => { const p = document.getElementById("makeup"); return p.matches(":popover-open") ? p.innerText.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim() : null; });

// ---- weak-links -------------------------------------------------------------------------------------------------
if (wanted("weak-links")) {
  const name = "weak-links";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const w = W[lang];
    for (const id of ASSESSED) {
      await caseAt(page, id, 2);
      const E = ENG[id][lang];
      const L = E.links;
      const c = await readChain(page);
      const where = `${lang} ${id}`;
      const also = c.also.map((a) => a.text).join(" | ");
      const cell = (bid) => c.cells.find((x) => x.id === bid);
      if (L.weakest) {
        expect(name, `${where}: the tile shows the weakest critical link, by name`, c.value === w.level(L.weakest.level) && c.note === E.names[L.weakest.id] && c.noteBlock === `block:${L.weakest.id}`, `${c.value} / ${c.note}`);
        expect(name, `${where}: the step marks the tile's block`, cell(L.weakest.id)?.marks.includes("weakest") && cell(L.weakest.id)?.flags.includes(w.mark.weakest), JSON.stringify(cell(L.weakest.id)));
      }
      if (L.lower.length) {
        const low = L.lower[0];
        const line = c.also.find((a) => a.block === `block:${low.id}`);
        expect(name, `${where}: the tile shows the lower level with its block, not critical`, !!line && line.visible && line.level === String(low.level) && line.text.startsWith(`${w.lowest}: ${E.names[low.id]}, ${w.notCritical}`), also);
        expect(name, `${where}: the step marks the lowest block as the tile does, and every lower one`, cell(low.id)?.marks.includes("lowest") && cell(low.id)?.flags.includes(w.mark.lowest) && L.lower.slice(1).every((x) => cell(x.id)?.marks.includes("lower")), JSON.stringify(c.cells.filter((x) => x.marks.length)));
      }
      if (L.unknownCritical.length) {
        expect(name, `${where}: the tile counts the critical blocks no source names`, c.also.some((a) => w.unknown.test(a.text) && a.text.startsWith(String(L.unknownCritical.length))), also);
        expect(name, `${where}: the step names each of them`, L.unknownCritical.every((u) => cell(u)?.marks.includes("unknown") && cell(u)?.flags.includes(w.mark.unknown)), JSON.stringify(L.unknownCritical.map(cell)));
      }
      if (L.noWeak && L.weakest) expect(name, `${where}: no link is lower, and the tile says so in words`, c.also.length === 1 && w.noWeak.test(c.also[0].text), also);
    }
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("weak-links");
}

// ---- fit-connect-agree ----------------------------------------------------------------------------------------
if (wanted("fit-connect-agree")) {
  const name = "fit-connect-agree";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}&case=fit-connect`, { size: [1280, 720] });
    const w = W[lang];
    const E = ENG["fit-connect"][lang];
    const low = E.links.lower[0];
    expect(name, `${lang}: FIT-Connect's weakest critical link is at level 4 and a block that is not critical is lower`, E.links.weakest.level === 4 && !!low, JSON.stringify(E.links));
    for (const step of [2, 3, 4]) {
      await caseAt(page, "fit-connect", step);
      const c = await readChain(page);
      const body = nb(await page.evaluate(() => document.body.innerText));
      const fours = body.split(w.level(4)).length - 1;
      const line = c.also.find((a) => a.block === `block:${low.id}`);
      expect(name, `${lang}, step ${step + 1}: "${w.level(4)}" stands once, on the tile, with the lower block that is not critical under it`, fours === 1 && c.value === w.level(4) && !!line && line.visible && line.text.includes(E.names[low.id]) && line.text.includes(w.notCritical), `${fours} × / ${JSON.stringify(c.also)}`);
      if (step === 2) {
        const cell = c.cells.find((x) => x.id === low.id);
        const sum = await text(page, ".sum-line");
        expect(name, `${lang}: the stage marks the same block lowest overall, at level ${low.level}`, cell?.marks.includes("lowest") && cell?.name === E.names[low.id], JSON.stringify(cell));
        const access = E.result.layers.access.score;
        expect(name, `${lang}: the story says the access layer scores ${access} on its block at level ${low.level}`, sum.includes(String(Math.round(E.result.overall))) && new RegExp(`\\b${access}\\b`).test(sum) && sum.includes(String(low.level)), sum);
      }
    }
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("fit-connect-agree");
}

// ---- criticality ----------------------------------------------------------------------------------------------
if (wanted("criticality")) {
  const name = "criticality";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const w = W[lang];
    for (const id of ASSESSED) {
      await caseAt(page, id, 2);
      const E = ENG[id][lang];
      const c = await readChain(page);
      const wrong = E.result.blocks.filter((b) => c.cells.find((x) => x.id === b.id)?.crit !== w.crit[b.criticality]).map((b) => b.id);
      expect(name, `${lang} ${id}: every block says its criticality in words`, c.cells.length === E.result.blocks.length && !wrong.length, wrong.join(", "));
      const tileBlock = c.noteBlock?.slice(6);
      const lowLine = c.also.find((a) => a.text.startsWith(w.lowest));
      if (tileBlock) expect(name, `${lang} ${id}: the tile's block carries the tile's name on the step`, c.cells.find((x) => x.id === tileBlock)?.flags.includes(w.mark.weakest), tileBlock);
      if (lowLine) expect(name, `${lang} ${id}: the lowest block carries the tile's words on the step`, c.cells.find((x) => x.id === lowLine.block?.slice(6))?.flags.includes(w.mark.lowest) && lowLine.text.toLowerCase().startsWith(w.mark.lowest), lowLine.text);
    }
    await caseAt(page, "bundid", 2);
    const key = await page.evaluate(() => [...document.querySelectorAll("#stage-body .key")].map((k) => k.innerText.replace(/\s+/g, " ")));
    const terms = Object.values(w.crit);
    expect(name, `${lang}: one key on the step says once what critical, important and supporting mean`, key.length === 1 && terms.every((x) => key[0].toLowerCase().split(x).length - 1 >= 1) && (await page.evaluate(() => document.querySelectorAll("#story .key, .kpis .key").length)) === 0, key.join(" / "));
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("criticality");
}

// ---- makeup ---------------------------------------------------------------------------------------------------
if (wanted("makeup")) {
  const name = "makeup";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    for (const id of ["bundid", "fit-connect"]) {
      await caseAt(page, id, 2);
      const E = ENG[id][lang];
      for (const l of LAYERS) {
        const s = layerSum(E.result, l);
        if (s.value === null) continue;
        await page.click(`[data-makeup="layer:${l}"]`);
        const m = await makeupText(page);
        const expr = `${Math.round(s.value)} = (${s.terms.map((x) => `${x.level} × ${x.weight}`).join(" + ")}) ÷ ${s.weights} × 25`;
        expect(name, `${lang} ${id} ${l}: the layer's make-up reads ${expr} and names each block`, !!m && m.includes(expr) && s.terms.every((x) => m.includes(E.names[x.id])) && Math.abs(s.value - E.result.layers[l].score) < 1e-9, m);
        await page.keyboard.press("Escape");
      }
    }
    const acc = ENG.bundid[lang].result.layers.access.score;
    expect(name, `${lang}: BundID's access layer reads 60`, Math.round(acc) === 60, acc);
    expect(name, `${lang}: FIT-Connect's access layer reads 0 on its one block`, ENG["fit-connect"][lang].result.layers.access.score === 0 && layerSum(ENG["fit-connect"][lang].result, "access").terms.length === 1);
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("makeup");
}

// ---- makeup-keys ----------------------------------------------------------------------------------------------
if (wanted("makeup-keys")) {
  const name = "makeup-keys";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    await caseAt(page, "bundid", 2);
    const keys = await page.$$eval("#stage-body [data-makeup^='block:'], .kpis [data-makeup]", (els) => els.map((e) => e.dataset.makeup));
    const E = ENG.bundid[lang];
    expect(name, `${lang}: every block on the step and the blocks the tile names open a make-up`, keys.filter((k) => k.startsWith("block:")).length >= E.result.blocks.length + 1, keys.join(", "));
    const sel = (k, i) => `:is(#stage-body, .kpis) [data-makeup="${k}"] >> nth=${i}`;
    const seen = {};
    for (const [i, k] of keys.entries()) {
      const nth = keys.slice(0, i).filter((x) => x === k).length;
      const loc = page.locator(`[data-makeup="${k}"]`).nth(nth);
      await loc.click();
      const byClick = await makeupText(page);
      const expanded = await loc.getAttribute("aria-expanded");
      await page.keyboard.press("Escape");
      await settle(page);
      const closed = (await makeupText(page)) === null;
      const back = await loc.evaluate((el) => document.activeElement === el);
      await loc.focus();
      await page.keyboard.press("Enter");
      const byKey = await makeupText(page);
      await page.keyboard.press("Escape");
      await settle(page);
      const back2 = await loc.evaluate((el) => document.activeElement === el);
      const b = E.result.blocks.find((x) => `block:${x.id}` === k);
      seen[k] = true;
      expect(name, `${lang} ${k}: a click opens its make-up, which names it and its two sides`, !!byClick && byClick.includes(E.names[b.id]) && expanded === "true", byClick);
      expect(name, `${lang} ${k}: Esc closes it and the focus goes back`, closed && back);
      expect(name, `${lang} ${k}: Enter opens the same make-up, no hover needed, and Esc returns the focus`, byKey === byClick && back2, `${byKey} // ${byClick}`);
    }
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("makeup-keys");
}

// ---- overall-makeup -------------------------------------------------------------------------------------------
if (wanted("overall-makeup")) {
  const name = "overall-makeup";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    for (const id of ["bundid", "fit-connect"]) {
      await caseAt(page, id, 2);
      const r = ENG[id][lang].result;
      const scored = LAYERS.filter((l) => r.layers[l].score !== null);
      const sum = await text(page, ".sum-line");
      expect(name, `${lang} ${id}: the overall score explains itself in one line`, sum.startsWith(`${Math.round(r.overall)} `) && sum.includes(String(scored.length)) && (await page.$$eval("#story .sum-line", (e) => e.length)) === 1, sum);
      await page.click("#story [data-makeup='overall']");
      const m = await makeupText(page);
      const expr = `${Math.round(r.overall)} = (${scored.map((l) => Math.round(r.layers[l].score)).join(" + ")}) ÷ ${scored.length}`;
      expect(name, `${lang} ${id}: one click opens its arithmetic, ${expr}`, !!m && m.includes(expr), m);
      await page.keyboard.press("Escape");
      const points = await text(page, "#stage-body .key-points");
      expect(name, `${lang} ${id}: the key says once in words how levels become points`, points.startsWith(W[lang].points) && (await page.$$eval(".key-points", (e) => e.length)) === 1, points);
    }
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("overall-makeup");
}

// ---- alternatives ---------------------------------------------------------------------------------------------
if (wanted("alternatives")) {
  const name = "alternatives";
  const want = { bundid: [(n) => /App Store/.test(n)], "fit-connect": [(n) => /Maven Central/.test(n), (n) => /(authentication server|Authentifizierungsserver)/i.test(n) && !/Rechenzentrum|data centre/i.test(n)] };
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const collator = new Intl.Collator(lang === "de" ? "de-DE" : "en-GB", { sensitivity: "base" });
    for (const id of ["bundid", "fit-connect"]) {
      await caseAt(page, id, 4);
      const v = await page.evaluate(() => {
        const t = (el) => (el ? el.innerText.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim() : "");
        const alts = document.querySelector("#story .alts");
        return {
          inStory: !!alts, title: t(alts?.querySelector(".alts-title")),
          blocks: [...(alts?.querySelectorAll(".alt-block") || [])].map((b) => ({ id: b.dataset.block, head: t(b.querySelector(".alt-head")), names: [...b.querySelectorAll(".alt-open")].map(t), keys: [...b.querySelectorAll(".alt-open")].map((x) => x.dataset.makeup), none: t(b.querySelector(".alt-none")) })),
          comp: [...document.querySelectorAll(".comp-item")].map((i) => ({ id: i.dataset.case, current: i.classList.contains("comp-item--current"), score: t(i.querySelector(".comp-score strong")) }))
        };
      });
      const E = ENG[id][lang];
      expect(name, `${lang} ${id}: the starting points stand in the story, labelled as research and not a recommendation`, v.inStory && v.title === W[lang].label, v.title);
      for (const test of want[id]) {
        const b = v.blocks.find((x) => test(E.names[x.id] || ""));
        expect(name, `${lang} ${id}: ${b ? E.names[b.id] : "the block"} has a starting point`, !!b && b.names.length >= 1, JSON.stringify(v.blocks.map((x) => [E.names[x.id], x.names])));
      }
      for (const b of v.blocks) {
        expect(name, `${lang} ${id} ${b.id}: the list is alphabetical`, b.names.every((n, i) => i === 0 || collator.compare(b.names[i - 1], n) <= 0), b.names.join(", "));
        for (const k of b.keys) {
          await page.click(`[data-makeup="${CSS_ESC(k)}"]`);
          const src = await page.evaluate(() => { const p = document.getElementById("makeup"); const s = p.querySelector(".src"); return { quote: !!s?.querySelector("q")?.textContent.trim(), link: !!s?.querySelector("a[href^='https://']"), read: /read \d|gelesen am \d/.test(s?.querySelector(".src-meta")?.textContent || ""), label: p.innerText.includes(p.querySelector(".mk-rule.muted")?.textContent || "\u0000") }; });
          expect(name, `${lang} ${id} ${k}: one click shows its source: a quote, its page and the date read`, src.quote && src.link && src.read, JSON.stringify(src));
          await page.keyboard.press("Escape");
        }
      }
      if (id === "bundid") {
        const others = v.comp.filter((x) => !x.current);
        expect(name, `${lang}: BundID shows at least two comparable services`, others.length >= 2, JSON.stringify(v.comp));
        for (const x of others) expect(name, `${lang}: ${x.id}'s score is the engine's`, x.score === String(Math.round(ENG[x.id][lang].result.overall)), `${x.score} vs ${ENG[x.id][lang].result.overall}`);
        expect(name, `${lang}: comparable services go best first`, v.comp.every((x, i) => i === 0 || Number(v.comp[i - 1].score) >= Number(x.score)), JSON.stringify(v.comp));
      }
    }
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("alternatives");
}

// ---- overview -------------------------------------------------------------------------------------------------
if (wanted("overview")) {
  const name = "overview";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    await page.click("#overview-open");
    await page.waitForSelector("#overview[open]");
    const rows = await page.evaluate(() => {
      const t = (el) => (el ? el.innerText.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim() : "");
      return [...document.querySelectorAll("#overview-body tbody")].map((tb) => [...tb.querySelectorAll("tr[data-case]")].map((r) => {
        const td = [...r.children];
        const words = (cell) => t(cell?.querySelector(".ov-link > span:not(.lvl)") || cell);
        return { id: r.dataset.case, apart: tb.classList.contains("ov-apart"), ended: tb.classList.contains("ov-ended"), name: t(r.querySelector(".ov-open")), score: t(r.querySelector(".ov-score strong")), of: t(r.querySelector(".ov-score .ov-of")), weakest: words(td[3]), weakLevel: td[3]?.querySelector(".lvl")?.dataset.level ?? null, lower: words(td[4]), lowLevel: td[4]?.querySelector(".lvl")?.dataset.level ?? null, exclusive: t(td[5]), group: t(r.querySelector(".ov-group")), asOf: t(r.querySelector(".ov-date")), reason: t(r.querySelector(".ov-reason")) };
      })).flat();
    });
    const ranked = ASSESSED.filter((id) => !SELF.includes(id)).sort((a, b) => ENG[b][lang].result.overall - ENG[a][lang].result.overall || new Intl.Collator(lang === "de" ? "de-DE" : "en-GB").compare(nb(t2(`p.case.${a}.short`, lang)), nb(t2(`p.case.${b}.short`, lang))));
    const main = rows.filter((r) => !r.apart);
    expect(name, `${lang}: every assessed service with a pre-run, the Serviceportal NRW included, sorted by score`, main.map((r) => r.id).join() === ranked.join() && ranked.includes("serviceportal-nrw"), `${main.map((r) => r.id).join()} vs ${ranked.join()}`);
    for (const r of rows.filter((x) => !x.ended)) {
      const E = ENG[r.id][lang];
      const L = E.links;
      const entry = ENTRIES.find((e) => e.id === r.id);
      const ex = E.result.exclusive_non_eu;
      expect(name, `${lang} ${r.id}: score and layers are the engine's`, r.score === String(Math.round(E.result.overall)) && r.of === W[lang].of(scoredOf(E.result)), `${r.score} ${r.of}`);
      expect(name, `${lang} ${r.id}: the weakest critical link, by level and name`, L.weakest ? r.weakLevel === String(L.weakest.level) && r.weakest.startsWith(E.names[L.weakest.id]) : true, `${r.weakLevel} ${r.weakest}`);
      expect(name, `${lang} ${r.id}: the lowest level where lower, else words`, L.lower.length ? r.lowLevel === String(L.lower[0].level) && r.lower.startsWith(E.names[L.lower[0].id]) : r.lowLevel === null && (L.unknownCritical.length ? W[lang].unknown.test(r.lower) : r.lower === W[lang].noneLower), `${r.lowLevel} ${r.lower}`);
      expect(name, `${lang} ${r.id}: exclusive non-EU control, group and as-of date`, r.exclusive === (ex === null ? r.exclusive : `${Math.round(ex * 100)} %`) && (entry.group === "self" ? r.group === "" : r.group === t2(`p.group.${entry.group}`, lang)) && r.asOf === nb(fmtDateShort(win.SA_RUNS[r.id].as_of, lang)), `${r.exclusive} / ${r.group} / ${r.asOf}`);
    }
    expect(name, `${lang}: this prototype stands apart`, rows.filter((r) => r.apart && !r.ended).map((r) => r.id).join() === SELF.join(), JSON.stringify(rows.filter((r) => r.apart).map((r) => r.id)));
    const ended = rows.filter((r) => r.ended);
    expect(name, `${lang}: the cases without an assessment, each with its reason`, ended.map((r) => r.id).sort().join() === [...ENDED].sort().join() && ended.every((r) => r.reason.length > 10), JSON.stringify(ended.map((r) => [r.id, r.reason])));
    expect(name, `${lang}: every service with a pre-run is in it`, rows.length === ENTRIES.length, `${rows.length} of ${ENTRIES.length}`);
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("overview");
}

// ---- compare --------------------------------------------------------------------------------------------------
if (wanted("compare")) {
  const name = "compare";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    await caseAt(page, "bundid", 4);
    await page.click(`.comp-item[data-case="eudi-wallet"] [data-cmp-with]`);
    await page.waitForSelector("#cmp[open]");
    const v = await page.evaluate(() => {
      const t = (el) => (el ? el.innerText.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim() : "");
      const table = document.querySelector("#cmp-body table");
      const cols = [...table.querySelectorAll("thead th[data-key]")].map((th) => th.dataset.key);
      const row = (sel) => [...table.querySelectorAll(`tr${sel} td`)].map((td) => ({ text: t(td), level: td.querySelector(".lvl")?.dataset.level ?? null, score: t(td.querySelector(".cmp-score")) }));
      return { table: !!table, cols, figures: Object.fromEntries(["score", "weakest", "lower", "exclusive"].map((k) => [k, row(`[data-figure="${k}"]`)])), layers: Object.fromEntries(["infrastructure", "devsecops", "platform", "base_service", "applications", "access"].map((l) => [l, row(`[data-layer="${l}"]`)])), back: [...table.querySelectorAll("thead [data-open-case]")].map((b) => b.dataset.openCase) };
    });
    expect(name, `${lang}: Compare with the EUDI wallet opens BundID and the EUDI wallet, chosen, in a table`, v.table && v.cols.join() === "bundid,eudi-wallet", JSON.stringify(v.cols));
    v.cols.forEach((id, i) => {
      const E = ENG[id][lang];
      const f = v.figures;
      expect(name, `${lang} ${id}: the four figures are the engine's`, f.score[i].score === String(Math.round(E.result.overall)) && f.weakest[i].level === String(E.links.weakest.level) && f.weakest[i].text.includes(E.names[E.links.weakest.id]) && (E.links.lower.length ? f.lower[i].level === String(E.links.lower[0].level) : f.lower[i].level === null) && f.exclusive[i].text === `${Math.round(E.result.exclusive_non_eu * 100)} %`, JSON.stringify(Object.fromEntries(Object.entries(f).map(([k, x]) => [k, x[i]]))));
      for (const l of LAYERS) {
        const s = layerSum(E.result, l);
        const cell = v.layers[l][i];
        if (s.value === null) { expect(name, `${lang} ${id} ${l}: no score, in words`, !cell.score && cell.text.length > 5, cell.text); continue; }
        const low = [...s.terms].sort((a, b) => a.level - b.level || (a.criticality === "critical" ? 0 : 1) - (b.criticality === "critical" ? 0 : 1) || String(a.id).localeCompare(String(b.id)))[0];
        expect(name, `${lang} ${id} ${l}: the layer's score and the block that holds it down are the engine's`, cell.score === String(Math.round(E.result.layers[l].score)) && cell.level === String(low.level) && cell.text.includes(E.names[low.id]), JSON.stringify(cell));
      }
    });
    expect(name, `${lang}: one click back to each service`, v.back.join() === "bundid,eudi-wallet");
    await page.click(`#cmp-body thead [data-open-case="eudi-wallet"]`);
    const opened = await page.waitForFunction(() => window.sovereignty.S.entry.id === "eudi-wallet" && !document.querySelector("#cmp[open]"), null, { timeout: 5000 }).then(() => true, () => false);
    expect(name, `${lang}: its name opens the EUDI wallet`, opened);
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
    // Viewed: BundID on start, then the Online-Ausweis from the case menu.
    const b = await open(`lang=${lang}`, { size: [1280, 720] });
    await b.page.click("#case-button");
    await b.page.click(`#case-menu [data-case="online-ausweis"]`);
    await b.page.waitForFunction(() => window.sovereignty.S.entry.id === "online-ausweis" && !window.sovereignty.S.replaying);
    await b.page.evaluate(() => window.sovereignty.pause());
    await b.page.click("#overview-open");
    const viewed = await b.page.$$eval("#overview-body tr[data-case]", (rs) => rs.filter((r) => r.querySelector(".ov-viewed")).map((r) => r.dataset.case).sort());
    expect(name, `${lang}: opening the Online-Ausweis after BundID marks both viewed`, viewed.join() === "bundid,online-ausweis", viewed.join());
    const tag = await b.page.locator("#overview-body .ov-viewed").first().innerText();
    expect(name, `${lang}: the mark says "${W[lang].viewed}"`, nb(tag) === W[lang].viewed, tag);
    expect(name, `${lang}: no error, the second tab`, !b.errors.length, b.errors.join(" | "));
    await b.context.close();
  }
  done("compare");
}

// ---- overview-layout ------------------------------------------------------------------------------------------
if (wanted("overview-layout")) {
  const name = "overview-layout";
  const measure = (page, sel) => page.evaluate((sel) => {
    const d = document.querySelector(sel);
    const r = d.getBoundingClientRect();
    const body = d.querySelector(".vc-dialog__body");
    const cut = [...d.querySelectorAll("th, td, button, .ov-open, .ov-of, .ov-also, .vc-tag, h2, p")].filter((el) => el.offsetParent && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== "visible").map((el) => (el.textContent || el.className).trim().slice(0, 30));
    const tiny = [...d.querySelectorAll("th, td, span, button, p")].filter((el) => el.offsetParent && el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 0.75 * parseFloat(getComputedStyle(document.documentElement).fontSize) - 0.01).map((el) => el.textContent.trim().slice(0, 20));
    return { inside: r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5, hscroll: body.scrollWidth - body.clientWidth, page: document.scrollingElement.scrollWidth - innerWidth, cut: [...new Set(cut)].slice(0, 5), tiny: [...new Set(tiny)].slice(0, 5) };
  }, sel);
  for (const size of [[1280, 720], [1920, 1080]]) {
    for (const theme of ["light", "dark"]) {
      for (const lang of ["en", "de"]) {
        const { context, page, errors } = await open(`lang=${lang}`, { size, theme });
        const where = `${size[0]}×${size[1]} ${theme} ${lang}`;
        await page.click("#overview-open");
        await page.waitForSelector("#overview[open]");
        await page.waitForTimeout(250);
        const o = await measure(page, "#overview");
        expect(name, `${where}: the overview fits the window without horizontal scrolling, nothing cut, Vici's sizes`, o.inside && o.hscroll <= 1 && o.page <= 0 && !o.cut.length && !o.tiny.length, JSON.stringify(o));
        if (theme === "light") await page.screenshot({ path: path.join(OUT, `overview-${size[0]}-${lang}.png`) });
        for (const k of ["bundid", "eudi-wallet", "online-ausweis"]) await page.check(`#overview-body [data-pick="${k}"]`);
        await page.click("#ov-cmp");
        await page.waitForSelector("#cmp[open]");
        await page.waitForTimeout(250);
        const c = await measure(page, "#cmp");
        expect(name, `${where}: Compare of three fits too`, c.inside && c.hscroll <= 1 && c.page <= 0 && !c.cut.length && !c.tiny.length, JSON.stringify(c));
        if (theme === "light") await page.screenshot({ path: path.join(OUT, `compare-${size[0]}-${lang}.png`) });
        await page.keyboard.press("Escape");
        // The tiles' notes and what the weakest link leaves out, for every case: never cut.
        for (const id of ENTRIES.map((e) => e.id)) {
          await caseAt(page, id, 2);
          const cutNotes = await page.$$eval(".kpi .kpi-note, .kpi .kpi-also-line, .kpi .vc-stat__label, .kpi .vc-stat__value", (els) => els.filter((el) => el.getBoundingClientRect().width && (el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().right > innerWidth + 0.5)).map((el) => el.textContent.trim().slice(0, 40)));
          expect(name, `${where} ${id}: no tile note, label or value cut`, !cutNotes.length, cutNotes.join(" | "));
        }
        expect(name, `${where}: no error`, !errors.length, errors.join(" | "));
        await context.close();
      }
    }
  }
  done("overview-layout");
}

// ---- nrw ------------------------------------------------------------------------------------------------------
if (wanted("nrw")) {
  const name = "nrw";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720], offlineAfterLoad: true });
    await page.click("#case-button");
    const inMenu = await page.$$eval(`#case-menu [data-case="serviceportal-nrw"]`, (e) => e.length);
    expect(name, `${lang}: the Serviceportal NRW sits in the case menu`, inMenu === 1);
    await page.click(`#case-menu [data-case="serviceportal-nrw"]`);
    await page.waitForFunction(() => window.sovereignty.S.entry.id === "serviceportal-nrw" && !window.sovereignty.S.replaying);
    await page.evaluate(() => window.sovereignty.pause());
    const notes = [];
    let guard = 0;
    let figures = null;
    for (let i = 0; i < 5; i++) {
      await page.evaluate((i) => window.sovereignty.go(i), i);
      await settle(page);
      notes.push(await page.$$eval(".svc-note", (e) => e.map((x) => x.innerText.trim())));
      if (i === 2) figures = { v: nb(await page.locator("#kpi-score .vc-stat__value").innerText()), c: await readChain(page) };
      for (; guard < 6; guard++) {
        const st = await state(page);
        if (!(st.waits && st.act)) break;
        await page.click("#turn-primary");
        await settle(page);
      }
    }
    const flat = notes.flat();
    expect(name, `${lang}: the screen says once that the six layers are the Deutschland-Stack's and the method applies to a state's platform`, flat.length === 1 && notes[0].length === 1 && flat[0].toLowerCase().includes(W[lang].state.toLowerCase()), JSON.stringify(notes));
    await goLast(page);
    const end = await state(page);
    expect(name, `${lang}: offline, it plays to its end`, end.bar === "done", JSON.stringify(end));
    const E = ENG["serviceportal-nrw"][lang];
    const { v, c } = figures;
    expect(name, `${lang}: its figures are the engine's`, v.includes(String(Math.round(E.result.overall))) && v.endsWith(W[lang].of(scoredOf(E.result))) && c.note === E.names[E.links.weakest.id], `${v} / ${c.value} ${c.note}`);
    await page.click("#overview-open");
    expect(name, `${lang}: it stands in the overview`, (await page.$$eval(`#overview-body tr[data-case="serviceportal-nrw"]`, (e) => e.length)) === 1);
    await page.check(`#overview-body [data-pick="serviceportal-nrw"]`);
    await page.check(`#overview-body [data-pick="bundesportal"]`);
    await page.click("#ov-cmp");
    expect(name, `${lang}: and in Compare`, (await page.$$eval(`#cmp-body thead [data-key="serviceportal-nrw"]`, (e) => e.length)) === 1);
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("nrw");
}

// ---- cost -----------------------------------------------------------------------------------------------------
if (wanted("cost")) {
  const name = "cost";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const w = W[lang];
    const tile = await page.evaluate(() => { const t = document.getElementById("kpi-cost"); const n = (e) => e.innerText.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim(); return { label: n(t.querySelector(".vc-stat__label")), value: n(t.querySelector(".kpi-main")), of: n(t.querySelector(".kpi-of")), note: n(t.querySelector(".kpi-note")) }; });
    expect(name, `${lang}: the tile's euro figure is what a live run would cost, in words`, tile.value === `≈ ${eurText(COST, lang)}` && tile.of === w.live, JSON.stringify(tile));
    expect(name, `${lang}: and this replay costs nothing`, tile.note === w.replay, tile.note);
    const guide = await page.evaluate((lang) => [...document.querySelectorAll(`#guide-${lang} [data-vc-chapter="how"] tbody tr`)].at(-1)?.innerText.replace(/[  ]/g, " ").replace(/\s+/g, " ") || "", lang);
    expect(name, `${lang}: the guide's key-figure row says the same`, guide.includes(eurText(COST, lang)) && guide.includes(w.live) && guide.includes(w.replay), guide);
    const track = await page.evaluate((lang) => document.querySelector(`#guide-${lang} [data-vc-chapter="present"]`).innerText.replace(/[  ]/g, " ").replace(/\s+/g, " "), lang);
    expect(name, `${lang}: the talk track says the replay costs nothing`, track.includes(w.replay) || track.includes(lang === "en" ? "costs nothing" : "kostet nichts"), track.slice(0, 400));
    await page.click("#start");
    await page.waitForSelector("#start-dialog[open]");
    const est = nb(await page.locator("#live-estimate").innerText());
    expect(name, `${lang}: the live-run dialog says the same`, est.includes(eurText(COST, lang)) && est.includes(w.simFree), est);
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("cost");
}

// ---- criteria -------------------------------------------------------------------------------------------------
if (wanted("criteria")) {
  const name = "criteria";
  for (const size of [[1280, 720], [1920, 1080]]) {
    for (const lang of ["en", "de"]) {
      const { context, page, errors } = await open(`lang=${lang}`, { size });
      const where = `${size[0]}×${size[1]} ${lang}`;
      await caseAt(page, "bundid", 2);
      const k = await page.evaluate(() => {
        const key = document.querySelectorAll("#stage-body .key");
        const fs = (el) => parseFloat(getComputedStyle(el).fontSize);
        const body = fs(document.getElementById("story-lead"));
        const texts = [...(key[0]?.querySelectorAll(".key-levels li > span:not(.lvl), .key-crit, .key-points") || [])];
        return {
          blocks: key.length, parts: ["key-levels", "key-crit", "key-points"].every((c) => key[0]?.querySelector(`.${c}`)), hexes: key[0]?.querySelectorAll(".lvl").length || 0,
          body, min: Math.min(...texts.map(fs)), over: texts.filter((el) => el.scrollWidth > el.clientWidth + 1 || getComputedStyle(el).textOverflow === "ellipsis").map((el) => el.textContent.slice(0, 30)),
          stage: (() => { const s = document.querySelector(".stage"); return s.scrollHeight - s.clientHeight; })()
        };
      });
      expect(name, `${where}: the level criteria, with their hexagons, criticality and points, in one block`, k.blocks === 1 && k.parts && k.hexes === 6, JSON.stringify(k));
      expect(name, `${where}: at least the story's body size (${k.min} px vs ${k.body} px)`, k.min >= k.body - 0.01, JSON.stringify(k));
      expect(name, `${where}: no overflow or ellipsis`, !k.over.length, k.over.join(" | "));
      if (size[0] === 1280) {
        for (const id of ASSESSED) {
          await caseAt(page, id, 2);
          const over = await page.evaluate(() => { const s = document.querySelector(".stage"); return s.scrollHeight - s.clientHeight; });
          expect(name, `${where} ${id}: the score step's stage does not scroll`, over <= 1, over);
        }
      }
      expect(name, `${where}: no error`, !errors.length, errors.join(" | "));
      await context.close();
    }
  }
  done("criteria");
}

// ---- guide-figures --------------------------------------------------------------------------------------------
if (wanted("guide-figures")) {
  const name = "guide-figures";
  for (const lang of ["en", "de"]) {
    const { context, page, errors } = await open(`lang=${lang}`, { size: [1280, 720] });
    const E = ENG.bundid[lang];
    const L = E.links;
    const figs = await page.evaluate((lang) => Object.fromEntries([...document.querySelectorAll(`#guide-${lang} [data-fig]`)].map((el) => [el.dataset.fig, el.textContent.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim()])), lang);
    const w = W[lang];
    expect(name, `${lang}: the guide's figures are BundID's, from the engine`, figs.score === String(Math.round(E.result.overall)) && figs.layers === w.of(scoredOf(E.result)) && figs.weakest === w.level(L.weakest.level) && figs["weakest-name"] === E.names[L.weakest.id] && figs.exclusive === `${Math.round(E.result.exclusive_non_eu * 100)} %`, JSON.stringify(figs));
    expect(name, `${lang}: the lowest-overall line`, figs.lowest?.startsWith(`${w.lowest}: ${E.names[L.lower[0].id]}, ${w.notCritical}`), figs.lowest);
    expect(name, `${lang}: the critical blocks no source names`, figs.unknown === String(L.unknownCritical.length), figs.unknown);
    expect(name, `${lang}: the free replay`, figs.cost === eurText(COST, lang) && figs.replay === w.replay, `${figs.cost} / ${figs.replay}`);
    expect(name, `${lang}: no error`, !errors.length, errors.join(" | "));
    await context.close();
  }
  done("guide-figures");
}

// ---- layout -----------------------------------------------------------------------------------------
if (wanted("layout")) {
  const name = "layout";
  for (const size of [[1920, 1080], [1280, 720]]) {
    for (const theme of ["light", "dark"]) {
      for (const lang of ["en", "de"]) {
        const { context, page, errors } = await open(`lang=${lang}`, { size, theme });
        const where = `${size[0]}×${size[1]} ${theme} ${lang}`;
        const heights = new Set();
        await walk(page, async (stage) => {
          const m = await page.evaluate(() => {
            const over = (el) => el.scrollHeight - el.clientHeight;
            const header = document.querySelector(".app-header").getBoundingClientRect();
            const tiles = [...document.querySelectorAll(".kpi")].map((t) => t.getBoundingClientRect());
            const apart = tiles.every((r, i) => i === 0 || r.left >= tiles[i - 1].right - 0.5) && tiles.every((r) => r.top >= header.top - 0.5 && r.bottom <= header.bottom + 0.5 && r.right <= innerWidth + 0.5);
            const cut = [...document.querySelectorAll(".kpi .vc-stat__label, .kpi .vc-stat__value, .kpi .kpi-note, .kpi .kpi-also-line, .brand-name, .lang-option, .guide-open:not([hidden]), #mode-tag, .vc-step__label, #turn-primary, #case-name, .overview-open")].filter((el) => el.offsetParent && el.scrollWidth > el.clientWidth + 1).map((el) => el.className || el.id);
            const wide = [...document.querySelectorAll(".app-header *, .intro *, .talk *, .workspace *")].filter((el) => {
              const r = el.getBoundingClientRect();
              if (!r.width || el.closest(".vc-tooltip, [popover], dialog")) return false;
              return r.right > innerWidth + 1;
            }).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`);
            const small = [...document.querySelectorAll("button, a[href], select, input")].filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0 && !el.closest("dialog:not([open]), [popover]:not(:popover-open), .vc-skip-link, .src, .research") && (r.width < 24 || r.height < 24);
            }).map((el) => (el.getAttribute("aria-label") || el.textContent).trim().slice(0, 20));
            const bar = document.getElementById("turn").getBoundingClientRect();
            return { page: document.scrollingElement.scrollHeight - innerHeight, stage: over(document.querySelector(".stage")), story: over(document.querySelector(".story")), header: Math.round(header.height), apart, cut, wide: [...new Set(wide)].slice(0, 4), small: small.slice(0, 4), bar: bar.bottom <= innerHeight + 0.5 && bar.top >= 0 };
          });
          heights.add(m.header);
          expect(name, `${where}, ${stage}: no page scroll; the stage and the story fit`, m.page <= 0 && m.stage <= 1 && m.story <= 1, JSON.stringify({ page: m.page, stage: m.stage, story: m.story }));
          expect(name, `${where}, ${stage}: the tiles apart and inside the header; no label, value or button cut`, m.apart && !m.cut.length, m.cut.join(", "));
          expect(name, `${where}, ${stage}: nothing wider than the window; the bar in view`, !m.wide.length && m.bar, m.wide.join(", "));
          expect(name, `${where}, ${stage}: every target at least 24 px`, !m.small.length, m.small.join(", "));
          if (theme === "light" && lang === "en") await page.screenshot({ path: path.join(OUT, `layout-${size[0]}-${stage.replace(/\W+/g, "-")}.png`) });
        });
        expect(name, `${where}: the header keeps its height through the case`, heights.size === 1, [...heights].join(", "));
        expect(name, `${where}: no error`, !errors.length, errors.join(" | "));
        await context.close();
      }
    }
  }
  done("layout");
}

await browser.close();
await server.close();
if (failures.length) {
  console.log(failures.map((f) => `FAIL  ${f}`).join("\n"));
  console.log(`\n${failures.length} of ${checks} checks failed (${ran.join(", ")}). Screenshots: ${OUT}`);
  process.exit(1);
}
console.log(`${checks} checks passed (${ran.join(", ")}).`);
console.log(`SHOWCASE ${ran.join(" ")} OK`);
