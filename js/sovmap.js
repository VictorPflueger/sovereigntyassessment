// The sovereignty map in the centrepiece (brief §9; PLAN.md f.1): before a run the catalogue, during and
// after a run the spider diagram (by layer, or by building block one click away: D8), beside it the
// Made-in and Run-by mix, below them the honeycomb, and the table of the same numbers one click away.
// It grows as blocks are recorded: every score_update carries the engine's result. Searches and fetches
// pulse in fjord as an outline, never as a fill (brief §4, Design).

import { bus } from "./events.js";
import { h } from "./dom.js";
import { icon } from "./icons.js";
import { t, onLang, getLang } from "./i18n/index.js";
import { fmtDate, fmtInt, fmtScore } from "./format.js";
import { LAYERS } from "./engine.js";
import { UI } from "./config.js";
import { appToday } from "./clock.js";
import { spiderSvg, wrapWords } from "./spider.js";
import { renderMix } from "./mix.js";
import { renderHoneycomb } from "./honeycomb.js";
import { renderTables } from "./datatable.js";

/** True when an as-of date is older than the staleness limit (brief §6.6: "Check for updates"). */
export function isStale(asOf, today = appToday()) {
  const d = new Date(`${asOf}T12:00:00`);
  return !Number.isNaN(d.getTime()) && (today.getTime() - d.getTime()) / 86400000 > UI.staleDays;
}

/**
 * host: the map's element; catalogue: the catalogue's element, hidden while a run shows. onShow(on): the
 * centre's switch (js/views.js) decides what shows; without it the map and the catalogue swap places.
 */
export function createSovMap(host, catalogue, { onPickBlock, onShow } = {}) {
  const state = { view: "layer", table: false, result: null, layerStatus: {}, run: null };
  const title = h("h2", { class: "sov-title", id: "sov-title" });
  const meta = h("p", { class: "sov-meta" });
  const byLayer = h("button", { type: "button", "aria-pressed": "true", dataset: { view: "layer" } });
  const byBlock = h("button", { type: "button", "aria-pressed": "false", dataset: { view: "block" } });
  const views = h("div", { class: "segmented sov-views", role: "group" }, byLayer, byBlock);
  const tableBtn = h("button", { class: "vc-button vc-button--secondary vc-button--sm sov-table-btn", type: "button", "aria-pressed": "false" });
  const spiderHost = h("div", { class: "sov-spider" });
  const mixHost = h("div", { class: "sov-mix" });
  const tableHost = h("div", { class: "sov-table", hidden: true });
  const hcHost = h("div", { class: "sov-honeycomb", "aria-labelledby": "sov-hc-title" });
  const hcTitle = h("h3", { class: "sov-hc-title", id: "sov-hc-title" });
  const map = h("section", { class: "sov-map", "aria-labelledby": "sov-title", hidden: true, dataset: { view: "layer", table: "false" } },
    h("header", { class: "sov-head" }, h("div", { class: "sov-heading" }, title, meta), h("div", { class: "sov-tools" }, views, tableBtn), h("div", { class: "view-slot" })),
    h("div", { class: "sov-top" }, spiderHost, mixHost),
    tableHost,
    h("div", { class: "sov-bottom" }, hcTitle, hcHost));
  host.append(map);

  byLayer.addEventListener("click", () => setView("layer"));
  byBlock.addEventListener("click", () => setView("block"));
  tableBtn.addEventListener("click", () => { state.table = !state.table; render(); });

  function setView(v) {
    state.view = v;
    render();
  }

  function spiderAxes(lang) {
    const r = state.result;
    if (state.view === "layer") {
      return LAYERS.map((l) => {
        const L = r?.layers?.[l] || { score: null, status: "open" };
        const status = L.score !== null ? "scored" : state.layerStatus[l]?.status || L.status;
        const value = L.score;
        return {
          id: l,
          lines: wrapWords(t(`layer.${l}`), 22, 3),
          // A short map uses the layer's short name; the axis's tooltip and the table keep the full one.
          short: [t(`layer.${l}.short`)],
          value,
          valueText: value === null ? t(`map.status.${status}`) : fmtScore(value),
          title: `${t(`layer.${l}.full`)}: ${value === null ? t(`map.status.${status}`) : fmtScore(value)}`
        };
      });
    }
    return (r?.blocks || []).map((b) => {
      const codes = `${t(`class.${b.tech_class}.short`)}·${t(`class.${b.operator_class}.short`)}`;
      const name = typeof b.name === "string" ? b.name : b.name?.[lang] || "";
      return {
        id: b.id,
        lines: [`${b.id} ${codes}`, ...wrapWords(name, 18, 2)],
        value: b.unscored ? null : 25 * b.level,
        valueText: b.unscored ? t("map.gap") : `${fmtInt(b.level)}${b.partly_unknown ? "?" : ""}`,
        title: `${b.id} ${name}: ${b.unscored ? t("map.gap") : t(b.partly_unknown ? "map.levelPartly" : "map.level", { level: fmtInt(b.level) })}`
      };
    });
  }

  function render() {
    const lang = getLang();
    const r = state.result;
    const run = state.run;
    if (!run) return;
    map.dataset.view = state.view;
    map.dataset.table = state.table ? "true" : "false";
    title.textContent = run.query || "";
    const stale = run.mode === "simulation" && run.as_of && isStale(run.as_of);
    meta.replaceChildren(...[
      h("span", {}, run.mode === "simulation" ? t("map.asOf", { date: fmtDate(run.as_of) }) : t("map.liveAsOf", { date: fmtDate(new Date().toISOString()) })),
      " · ",
      h("span", {}, t("map.indicative")),
      stale ? h("span", { class: "vc-tag vc-tag--warning stale-tag" }, icon("alert", 14), t("map.stale")) : null].filter(Boolean));
    byLayer.textContent = t("map.view.layer");
    byBlock.textContent = t("map.view.block");
    byLayer.setAttribute("aria-pressed", state.view === "layer" ? "true" : "false");
    byBlock.setAttribute("aria-pressed", state.view === "block" ? "true" : "false");
    views.setAttribute("aria-label", t("map.view.label"));
    tableBtn.replaceChildren(icon("list", 16), t(state.table ? "map.hideTable" : "map.showTable"));
    tableBtn.setAttribute("aria-pressed", state.table ? "true" : "false");
    hcTitle.textContent = t("map.honeycomb");

    drawSpider();
    renderMix(mixHost, r);
    tableHost.hidden = !state.table;
    spiderHost.hidden = state.table;
    mixHost.hidden = state.table;
    if (state.table) renderTables(tableHost, r, { layerStatus: state.layerStatus, lang: run.lang });
    renderHoneycomb(hcHost, r, { layerStatus: state.layerStatus, lang: run.lang, onPick: (id) => onPickBlock?.(id) });
  }

  /** The spider diagram, or a note while there is nothing to draw in the block view. */
  function drawSpider() {
    const run = state.run;
    if (!run) return;
    const lang = getLang();
    const axes = spiderAxes(lang);
    spiderHost.replaceChildren();
    if (state.view === "block" && !axes.length) {
      spiderHost.append(h("p", { class: "sov-note" }, t("map.noBlocks")));
      return;
    }
    spiderHost.append(spiderSvg({
      axes, kind: state.view, box: hostBox(),
      ticks: state.view === "layer" ? [25, 50, 75, 100].map((v) => ({ f: v / 100, text: fmtInt(v) })) : [1, 2, 3, 4].map((v) => ({ f: v / 4, text: fmtInt(v) })),
      title: t(state.view === "layer" ? "map.spider.layer" : "map.spider.block", { service: run.query || "" }),
      desc: t("map.spider.desc")
    }));
  }

  /** The spider's room in pixels, or null while it has none (hidden, or not yet laid out). */
  function hostBox() {
    const b = spiderHost.getBoundingClientRect();
    return b.width > 0 && b.height > 0 ? { w: b.width, h: b.height } : null;
  }

  // The spider is drawn at its host's size in pixels: it follows a resize of the window or the drawer
  // (in the next frame, so a resize never loops), and only when the size really changed.
  let boxKey = "";
  let boxFrame = 0;
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      const b = hostBox();
      const key = b ? `${Math.round(b.w / 4)}x${Math.round(b.h / 4)}` : "";
      if (key === boxKey) return;
      boxKey = key;
      cancelAnimationFrame(boxFrame);
      boxFrame = requestAnimationFrame(() => { if (state.run && !state.table && b) drawSpider(); });
    }).observe(spiderHost);
  }

  let pulseTimer = null;
  function pulse() {
    map.dataset.pulse = "on";
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => { delete map.dataset.pulse; }, 1400);
  }

  bus.on("run_start", (ev) => {
    const p = ev.payload || {};
    state.run = { query: p.query, mode: p.mode, as_of: p.as_of || null, lang: p.lang || "en" };
    state.result = null;
    state.layerStatus = {};
    state.view = "layer";
    state.table = false;
    show(true);
    render();
  });
  bus.on("score_update", (ev) => {
    if (!state.run) return;
    state.result = ev.payload?.result || state.result;
    render();
  });
  bus.on("layer_status", (ev) => {
    const p = ev.payload || {};
    state.layerStatus[p.layer] = { status: p.status, reason: p.reason };
  });
  bus.on("tool_call", (ev) => { if (ev.payload?.server && state.run) pulse(); });
  onLang(() => render());

  function show(on) {
    if (onShow) { onShow(on); return; }
    map.hidden = !on;
    catalogue.hidden = on;
    host.dataset.view = on ? "map" : "catalogue";
  }

  return {
    reset() {
      state.run = null;
      state.result = null;
      state.layerStatus = {};
      show(false);
    },
    result: () => state.result,
    el: map
  };
}
