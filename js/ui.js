// UI orchestrator: builds the components, wires the controls and dialogs and translates run events into
// drawer and state changes. Version 0.1.0 has the whole start flow (the service, Start agent, the mode
// dialog, the key dialog) but no run: the live agent and the simulation player arrive in version 0.2.0,
// so an accepted key ends with a notice that says so, and nothing runs or costs anything.

import { bus } from "./events.js";
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
import { onLang } from "./i18n/index.js";
import { hasKey } from "./keystore.js";
import { entryById, lookup } from "./catalogue.js";
import { h, withTooltip } from "./dom.js";
import { tx, attrs } from "./text.js";
import { icon } from "./icons.js";

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

  // ---- components ------------------------------------------------------------------------------
  const badge = document.getElementById("mode-badge");
  const consoleUI = createConsole(document.getElementById("console"));
  const kpis = createKpis(document.getElementById("kpis"));
  const drawer = createDrawer(document.getElementById("drawer"));
  // Until the agent arrives, each tab says what it will hold (Vici's empty state).
  for (const tab of DRAWER_TABS) {
    drawer.panel(tab.id).appendChild(h("div", { class: "vc-empty empty" },
      tx(`drawer.emptyTitle.${tab.id}`, null, { tag: "strong", cls: "vc-empty__title" }),
      tx(`drawer.empty.${tab.id}`, null, { tag: "p", cls: "vc-empty__text" })));
  }

  const catalogue = createCatalogueView(document.getElementById("map"), {
    onPick: (entry) => setState({ service: { entryId: entry.id, text: inLang(entry.names) } })
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
    onAbort: () => {},
    onReset: () => resetWorkspace(),
    onDiagnostics: () => openDiagnostics()
  });

  initLangSwitch();

  // ---- intro window: "How it works" in the header, and once by itself on a first visit -----------
  const aboutBtn = h("button", { class: "vc-button vc-button--secondary about-btn", type: "button", id: "btn-about" },
    icon("info", 18), tx("header.about", null, { cls: "btn-text" }));
  attrs(aboutBtn, { title: "header.about.title" });
  aboutBtn.addEventListener("click", () => showIntro());
  badge.after(withTooltip(aboutBtn, tx("header.about"), { below: true }));

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
    if (entry) setState({ service: { entryId: entry.id, text: inLang(entry.names) } });
    render(getState());
  });

  // ---- run events → UI effects --------------------------------------------------------------------
  bus.on("state_change", (ev) => setState({ runState: ev.payload.state }));
  bus.on("run_end", (ev) => {
    const st = ev.payload.status;
    setState({ runState: st === "done" || st === "not_a_service" ? "done" : st });
  });

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
    // The agent and the player arrive in version 0.2.0: say so, and run nothing.
    bus.emit("notice", mode === "live"
      ? { level: "info", key: "notice.liveNext", vars: { service } }
      : { level: "warn", key: "notice.noPreRun", vars: { service } });
  }

  function resetWorkspace() {
    bus.endRun();
    consoleUI.reset();
    kpis.reset();
    drawer.setOpen(false);
    setState({ runState: "idle", runId: null, mode: null });
  }

  /** Opens the intro once per browser: called by main.js after the boot screen is gone. */
  function introOnFirstVisit() {
    if (!introSeen() && !document.querySelector("dialog[open]")) showIntro();
  }

  return { start, resetWorkspace, showIntro, introOnFirstVisit, kpis, consoleUI };
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
