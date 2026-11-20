// UI orchestrator: builds the components, wires the controls and dialogs, starts a run in the chosen mode
// and translates run events into drawer and state changes. Both producers, the live agent (js/agent.js)
// and the simulation player (js/simulation.js), emit the same run events; the screen never asks which
// one is running, except for the mode badge, the console's tape and the audit export.

import { bus, newRunId } from "./events.js";
import { getState, setState, subscribe, isRunning, isFinished } from "./state.js";
import { createConsole } from "./console.js";
import { createKpis } from "./kpi.js";
import { configureDrawer, createDrawer } from "./drawer.js";
import { createControls } from "./controls.js";
import { createCatalogueView, hasPreRun, inLang } from "./catalogue_view.js";
import { chooseMode, askApiKey } from "./dialogs.js";
import { openDiagnostics } from "./diagnostics_view.js";
import { openIntro, introSeen } from "./intro.js";
import { setUpRail } from "./rail_steps.js";
import { initLangSwitch } from "./lang_switch.js";
import { onLang, getLang } from "./i18n/index.js";
import { hasKey } from "./keystore.js";
import { entryById, lookup } from "./catalogue.js";
import { h, withTooltip } from "./dom.js";
import { tx, attrs } from "./text.js";
import { icon } from "./icons.js";
import { createSovMap } from "./sovmap.js";
import { createBlocksPanel } from "./blocks_panel.js";
import { createReviewPanel } from "./review_panel.js";
import { createLeversPanel } from "./levers_panel.js";
import { createOutbox } from "./outbox.js";
import { createAuditPanel } from "./audit_panel.js";
import { initAudit } from "./audit.js";
import { createLiveAgent } from "./agent.js";
import { createSimulationPlayer } from "./simulation.js";
import { createCentre } from "./views.js";
import { createCompare } from "./compare.js";
import { createPortfolio } from "./portfolio.js";
import { createExportPanel } from "./export_panel.js";
import { openMethod } from "./method_panel.js";
import { getWeights, onWeights, isEqualWeights } from "./weights.js";
import { addPreRuns, addSessionAssessment } from "./loaded.js";
import { assessmentFromRecords } from "./assessment.js";

// The drawer's tabs (brief §9): building blocks, review, levers, outbox, audit.
export const DRAWER_TABS = Object.freeze([
  { id: "blocks", labelKey: "drawer.tab.blocks" },
  { id: "review", labelKey: "drawer.tab.review" },
  { id: "levers", labelKey: "drawer.tab.levers" },
  { id: "outbox", labelKey: "drawer.tab.outbox" },
  { id: "audit", labelKey: "drawer.tab.audit" }
]);

export function initUI() {
  setUpRail();
  configureDrawer({ tabs: [...DRAWER_TABS], labelKey: "drawer.label", noteKey: "drawer.note" });
  setState({ keyPresent: hasKey() });
  initAudit();

  // ---- components ------------------------------------------------------------------------------
  const badge = document.getElementById("mode-badge");
  const drawer = createDrawer(document.getElementById("drawer"));
  const openTab = (id) => drawer.show(id);
  const consoleUI = createConsole(document.getElementById("console"), { onOpenTab: openTab });
  const kpis = createKpis(document.getElementById("kpis"));

  const blocksPanel = createBlocksPanel(drawer.panel("blocks"), { onCount: (n) => drawer.setCount("blocks", n) });
  const reviewPanel = createReviewPanel(drawer.panel("review"), { getBlocks: () => sovmap.result()?.blocks || [] });
  createLeversPanel(drawer.panel("levers"));
  const outbox = createOutbox(drawer.panel("outbox"), { onCount: (n) => drawer.setCount("outbox", n) });
  createAuditPanel(drawer.panel("audit"), { onCount: (n) => drawer.setCount("audit", n) });

  const mapRoot = document.getElementById("map");
  const catalogue = createCatalogueView(mapRoot, {
    onPick: (entry) => setState({ service: { entryId: entry.id, text: inLang(entry.names) } })
  });
  const catalogueEl = mapRoot.querySelector(".catalogue");
  const sovmap = createSovMap(mapRoot, catalogueEl, {
    onPickBlock: (id) => { drawer.show("blocks"); blocksPanel.openBlock(id); },
    onShow: (on) => centre.setPart(on ? "map" : "catalogue")
  });
  // Compare and the Portfolio: views of the same area, over the loaded assessments (brief §9).
  addPreRuns();
  const compare = createCompare(mapRoot);
  const portfolio = createPortfolio(mapRoot);
  const centre = createCentre(mapRoot, { catalogue: catalogueEl, map: sovmap.el, compare: compare.el, portfolio: portfolio.el }, {
    onShow: (view) => { if (view === "compare") compare.render(); else if (view === "portfolio") portfolio.render(); }
  });

  const agent = createLiveAgent({ onKeyRejected: () => setState({ keyPresent: false }) });
  const player = createSimulationPlayer({ getSpeed: () => getState().speed });

  // ---- the run on screen as a record: the exports, the loaded set, the weights ----------------------
  let runMeta = null; // { run_id, mode, query, entry_id, lang, as_of, source }
  const runToolbox = () => (runMeta ? (runMeta.mode === "live" ? agent.toolbox() : player.toolbox()) : null);
  function runAssessment() {
    const tb = runToolbox();
    if (!tb) return null;
    return assessmentFromRecords(tb.records(), {
      query: runMeta.query, entryId: runMeta.entry_id, name: runMeta.query,
      asOf: runMeta.as_of, source: runMeta.mode === "live" ? "live" : runMeta.source || "hand_authored"
    });
  }
  /** Once the person has confirmed or skipped the review, the findings are frozen: the assessment joins the loaded set. */
  function refreshSession() {
    const tb = runToolbox();
    if (!tb || tb.records().review !== "resolved") return;
    addSessionAssessment(runAssessment());
  }
  const exportPanel = createExportPanel(drawer.panel("outbox"), {
    source: () => ({ run: runMeta, report: outbox.report(), result: runToolbox()?.result() || null, assessment: runAssessment })
  });
  // A change of the layer weights (the method view): the run on screen is scored again with them, the
  // levers priced again and the drafts' figures brought up to date; the change is logged as an
  // assumption on the bus (the audit log, the console), and Compare and the Portfolio follow.
  onWeights((change) => {
    const tb = runToolbox();
    const p = tb ? tb.setWeights(change.to) : null;
    bus.emit("weights_change", { from: change.from, to: change.to, by: "user", ...(p ? { result: p.result, values: p.values, levers: p.levers, memo: p.memo, report: p.report } : {}) });
    if (p?.result) bus.emit("score_update", { facts: { ...p.result.facts }, partial: false, result: p.result });
    bus.emit("notice", { level: "info", key: isEqualWeights(change.to) ? "notice.weightsEqual" : "notice.weights" });
    refreshSession();
    exportPanel.render();
  });

  const controls = createControls(document.getElementById("controls"), {
    // Typing a catalogue entry's exact name picks the entry; anything else is a free-text service.
    onServiceInput: (text) => {
      const best = lookup(text, { limit: 1 })[0];
      setState({ service: { entryId: best?.how === "exact" ? best.entry.id : null, text } });
    },
    onPickEntry: (entry) => setState({ service: { entryId: entry.id, text: inLang(entry.names) } }),
    onStart: () => start(),
    onSelectModel: (id) => setState({ model: id }),
    onSpeed: (n) => setState({ speed: n }),
    onAbort: () => abortRun(),
    onReset: () => resetWorkspace(),
    onDiagnostics: () => openDiagnostics()
  });

  initLangSwitch();

  // ---- intro window: "How it works" in the header, and once by itself on a first visit -----------
  const aboutBtn = h("button", { class: "vc-button vc-button--secondary about-btn", type: "button", id: "btn-about" },
    icon("info", 18), tx("header.about", null, { cls: "btn-text" }));
  attrs(aboutBtn, { title: "header.about.title" });
  aboutBtn.addEventListener("click", () => showIntro());
  const aboutAnchor = withTooltip(aboutBtn, tx("header.about"), { below: true });
  badge.after(aboutAnchor);
  // "Method": how the scores come about, the weights to change, what the score is not (brief §9).
  const methodBtn = h("button", { class: "vc-button vc-button--secondary about-btn method-btn", type: "button", id: "btn-method" },
    icon("book", 18), tx("header.method", null, { cls: "btn-text" }));
  attrs(methodBtn, { title: "header.method.title" });
  methodBtn.addEventListener("click", () => openMethod());
  // Beside the AI disclosure, on the badges' second row, so the first row keeps its width.
  (document.querySelector(".header-badges .ai-disclosure") || aboutAnchor).after(withTooltip(methodBtn, tx("header.method"), { below: true }));
  kpis.onOverall(() => openMethod());

  function showIntro() {
    const s = getState();
    // During a run the window only explains; it never starts or interrupts anything.
    if (isRunning(s)) return openIntro({});
    return openIntro({ startKey: isFinished(s) ? "controls.newRun" : "controls.start", onStart: () => start() });
  }

  // ---- state → view ----------------------------------------------------------------------------
  const BADGE = {
    live: { key: "badge.live", title: "badge.live.title", cls: "vc-tag vc-tag--solid mode-badge" },
    simulation: { key: "badge.simulation", title: "badge.simulation.title", cls: "vc-tag mode-badge" },
    none: { key: "badge.none", title: "badge.none.title", cls: "vc-tag mode-badge" }
  };
  const render = (s) => {
    controls.update(s);
    catalogue.select(s.service.entryId);
    const b = BADGE[s.mode] || BADGE.none;
    badge.dataset.mode = s.mode || "none";
    badge.className = b.cls;
    badge.replaceChildren(...(s.mode === "live" ? [h("span", { class: "mode-dot", "aria-hidden": "true" })] : []), tx(b.key));
    attrs(badge, { title: b.title });
  };
  subscribe(render);
  render(getState());
  // Words that code formats (the status pill, the tooltips of disabled buttons) follow a switch, and a
  // chosen catalogue entry shows its name in the new language.
  onLang(() => {
    const s = getState();
    const entry = s.service.entryId ? entryById(s.service.entryId) : null;
    if (entry && !isRunning(s)) setState({ service: { entryId: entry.id, text: inLang(entry.names) } });
    render(getState());
  });

  // ---- run events → UI effects --------------------------------------------------------------------
  bus.on("state_change", (ev) => setState({ runState: ev.payload.state }));
  bus.on("run_end", (ev) => {
    const st = ev.payload.status;
    setState({ runState: st === "done" || st === "not_a_service" ? "done" : st });
  });
  bus.on("score_update", (ev) => { kpis.show(ev.payload?.result || null); exportPanel.render(); });
  bus.on("run_start", (ev) => {
    const p = ev.payload || {};
    runMeta = { run_id: p.run_id, mode: p.mode, query: p.query, entry_id: p.entry_id ?? null, lang: p.lang, as_of: p.as_of || new Date().toISOString().slice(0, 10), source: p.source || null };
    centre.show("assessment");
    exportPanel.render();
  });
  bus.on("review_decision", (ev) => { if (ev.payload?.action !== "correct") setTimeout(refreshSession, 0); });
  bus.on("report", () => setTimeout(() => exportPanel.render(), 0));
  bus.on("run_end", () => setTimeout(() => { refreshSession(); exportPanel.render(); }, 0));
  // The person's turn opens the tab where it is taken, with a merlot count on the tab.
  // Where the drawer opens over the console's column (css/panels.css, from 1,101 px wide), the console
  // must not hide what the person needs to read: a new run folds the drawer away, so the narration is in
  // view, and so does a warning or an error the console writes.
  const drawerBeside = () => !!(globalThis.CSS?.supports?.("anchor-name", "--sa-console") && globalThis.matchMedia?.("(min-width: 1101px)").matches);
  bus.on("run_start", () => { if (drawerBeside() && drawer.isOpen()) drawer.setOpen(false); });
  bus.on("notice", (ev) => { if (ev.payload?.level !== "info" && drawerBeside() && drawer.isOpen()) drawer.setOpen(false); });
  bus.on("review_request", () => { drawer.setCount("review", 1, true); drawer.show("review"); });
  bus.on("review_decision", (ev) => { if (ev.payload?.action !== "correct") drawer.setCount("review", 0); });
  bus.on("levers", (ev) => { drawer.setCount("levers", (ev.payload?.levers || []).length + 1, true); drawer.show("levers"); });
  bus.on("lever_decision", () => drawer.setCount("levers", 0));
  bus.on("action_draft", () => drawer.show("outbox"));

  // ---- run control ---------------------------------------------------------------------------------
  async function start() {
    const s = getState();
    if (isRunning(s)) return;
    const text = s.service.text.trim();
    if (!text) {
      bus.emit("notice", { level: "warn", key: "notice.needService" });
      controls.focusService();
      return;
    }
    const entry = s.service.entryId ? entryById(s.service.entryId) : null;
    const service = entry ? inLang(entry.names) : text;
    // Simulation replays a pre-run assessment: one exists only for some catalogue entries.
    const simKey = entry && hasPreRun(entry.id) ? null : entry ? "dialog.mode.simNone" : "dialog.mode.simFreeText";
    let mode = await chooseMode({ service, simKey });
    if (!mode) return;
    if (mode === "key") {
      // "Change or forget key": the key dialog shows the stored key masked, with Forget key.
      const ok = await askApiKey();
      setState({ keyPresent: hasKey() });
      if (!ok) return;
      mode = "live";
    }
    if (mode === "live" && !hasKey()) {
      const ok = await askApiKey();
      setState({ keyPresent: hasKey() });
      if (!ok) return;
    }
    begin(mode, entry, service);
  }

  function begin(mode, entry, service) {
    const def = mode === "simulation" ? globalThis.SA_RUNS?.[entry?.id] : null;
    if (mode === "simulation" && !def) {
      bus.emit("notice", { level: "warn", key: "notice.noPreRun", vars: { service } });
      return;
    }
    clearViews();
    const run_id = newRunId();
    const lang = getLang();
    bus.beginRun({ run_id, mode });
    setState({ mode, runId: run_id, runState: "understanding" });
    if (mode === "simulation") {
      bus.emit("run_start", { run_id, mode, query: service, entry_id: entry.id, lang, source: def.source, as_of: def.as_of, weights: getWeights() });
      bus.emit("state_change", { state: "understanding" });
      player.play(def, { lang, service });
    } else {
      const model = getState().model;
      bus.emit("run_start", { run_id, mode, query: service, entry_id: entry?.id ?? null, lang, model, weights: getWeights() });
      agent.run({ query: service, entryId: entry?.id ?? null, lang, modelId: model });
    }
  }

  function abortRun() {
    if (agent.isActive()) agent.abort();
    if (player.isActive()) player.abort();
  }

  function clearViews() {
    consoleUI.reset();
    kpis.reset();
    for (const tab of DRAWER_TABS) drawer.setCount(tab.id, 0);
  }

  function resetWorkspace() {
    abortRun();
    bus.endRun();
    clearViews();
    sovmap.reset();
    blocksPanel.reset();
    drawer.setOpen(false);
    runMeta = null;
    exportPanel.render();
    setState({ runState: "idle", runId: null, mode: null });
  }

  /** Opens the intro once per browser: called by main.js after the boot screen is gone. */
  function introOnFirstVisit() {
    if (!introSeen() && !document.querySelector("dialog[open]")) showIntro();
  }

  return { start, resetWorkspace, showIntro, introOnFirstVisit, kpis, consoleUI, reviewPending: () => reviewPanel.pending(), centre, compare, portfolio, openMethod };
}

/**
 * A transient banner under the header (file://, unexpected errors). title and text are i18n keys;
 * `extra` is text that is not ours to translate (a browser's error message).
 */
export function showBanner({ level = "info", titleKey = "", key = "", vars = null, extra = "", timeout = 0 } = {}) {
  const stack = document.getElementById("banners");
  if (!stack) return null;
  // A Vici alert in the tone of its level, with its icon and a dismiss button that names itself.
  const close = h("button", { class: "vc-icon-button", type: "button" }, icon("x", 18));
  const tone = level === "error" ? "vc-alert--danger" : level === "warn" ? "vc-alert--warning" : "";
  const el = h("div", { class: ["vc-alert", tone, "banner"], dataset: { level }, role: level === "error" ? "alert" : "status" },
    icon(level === "info" ? "info" : "alert", 22),
    h("div", { class: "vc-alert__body banner-text" },
      titleKey ? tx(titleKey, null, { tag: "p", cls: "vc-alert__title" }) : null,
      h("p", {}, extra ? h("span", { class: "banner-extra" }, extra, " ") : null, key ? tx(key, vars) : null)),
    withTooltip(close, tx("banner.dismiss"), { below: true }));
  close.addEventListener("click", () => el.remove());
  stack.appendChild(el);
  if (timeout) setTimeout(() => el.remove(), timeout);
  return el;
}
