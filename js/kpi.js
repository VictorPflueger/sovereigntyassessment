// Header KPI strip: the overall score (always "indicative"), the weakest critical link, the evidence
// coverage and the exclusive non-EU control, from the engine's result (js/engine.js score()). A figure
// without a basis shows "no data", never 0 (brief §6.5). Labels are i18n keys; the figures are
// formatted for the active language and written again after a switch. The overall tile is a button that
// opens the method view (PLAN.md f.1): how the score is computed and what it is not.

import { h } from "./dom.js";
import { tx, retext, attrs } from "./text.js";
import { t, onLang } from "./i18n/index.js";
import { formatFact } from "./facts.js";
import { noData, fmtInt } from "./format.js";
import { LAYERS } from "./engine.js";

const TILES = [
  { id: "overall", labelKey: "kpi.overall.label" },
  { id: "weakest", labelKey: "kpi.weakest.label" },
  { id: "coverage", labelKey: "kpi.coverage.label" },
  { id: "exclusive", labelKey: "kpi.exclusive.label" }
];

export function createKpis(container) {
  const tiles = new Map();
  // Vici's stat card; the label names the group for screen readers.
  const overallClicks = new Set();
  for (const tile of TILES) {
    // The overall tile is a button (its parts are spans, as a button's content must be).
    const button = tile.id === "overall";
    const part = button ? "span" : "div";
    const label = tx(tile.labelKey, null, { tag: part, cls: "vc-stat__label kpi-label", attrs: { id: `kpi-${tile.id}-label` } });
    const value = h(part, { class: "vc-stat__value kpi-value", id: `kpi-${tile.id}-value` }, "");
    const sub = h(part, { class: "vc-stat__note kpi-sub", id: `kpi-${tile.id}-sub` }, h("span"));
    const el = button
      ? h("button", { class: "vc-stat kpi kpi--button", type: "button", id: "kpi-overall", dataset: { tone: "muted", tile: tile.id } }, label, value, sub)
      : h("div", { class: "vc-stat kpi", dataset: { tone: "muted", tile: tile.id }, role: "group", "aria-labelledby": `kpi-${tile.id}-label` }, label, value, sub);
    if (button) {
      attrs(el, { title: "kpi.overall.title" });
      el.addEventListener("click", () => { for (const fn of overallClicks) fn(); });
    }
    container.appendChild(el);
    tiles.set(tile.id, { el, value, sub });
  }

  let result = null;
  let weakest = null;

  /**
   * The weakest-link note names the block where its name fits the note's two lines; where it does not
   * (a long name, a narrow tile, German), the note keeps the block's id and the tile's tooltip gives the
   * name, so nothing is cut (AC-18). Checked again when the tile changes size.
   */
  function fitWeakest() {
    const tile = tiles.get("weakest");
    // The tooltip says which blocks the tile weighs: the critical ones only (the review's finding R-22).
    tile.el.setAttribute("title", t("kpi.weakest.title"));
    if (!weakest || !tile.sub.isConnected || !tile.sub.clientHeight) return;
    if (tile.sub.scrollHeight <= tile.sub.clientHeight + 1) return;
    retext(tile.sub.firstChild, weakest.key, { block: weakest.id, n: weakest.ties });
    tile.el.setAttribute("title", `${weakest.full}. ${t("kpi.weakest.title")}`);
  }
  if (typeof ResizeObserver === "function") {
    let frame = 0;
    let lastWidth = 0;
    new ResizeObserver(() => {
      const width = Math.round(tiles.get("weakest").el.getBoundingClientRect().width);
      if (width === lastWidth) return;
      lastWidth = width;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => render());
    }).observe(tiles.get("weakest").el);
  }

  const set = (id, text, noteKey, vars = null, tone = "muted") => {
    const tile = tiles.get(id);
    if (tile.value.textContent !== text) tile.value.textContent = text;
    tile.el.dataset.tone = tone;
    retext(tile.sub.firstChild, noteKey, vars);
  };

  function render() {
    const r = result;
    const facts = r?.facts || {};
    const has = (k) => facts[k] !== null && facts[k] !== undefined;
    // The overall score always says "indicative" (brief §4, Honesty), and how many of the six layers it
    // rests on when not all have a score (the review's finding R-11).
    const scoredLayers = LAYERS.filter((l) => Number.isFinite(r?.layers?.[l]?.score)).length;
    const partial = has("score.overall") && scoredLayers < LAYERS.length;
    set("overall", has("score.overall") ? formatFact("score.overall", facts["score.overall"]) : noData(), partial ? "kpi.overall.partial" : "kpi.overall.note", partial ? { scored: fmtInt(scoredLayers), all: fmtInt(LAYERS.length) } : null, has("score.overall") ? "" : "muted");
    // The weakest critical link names its block, and how many more share its level on a tie.
    const w = r?.weakest;
    if (w && w.block_id) {
      const block = r.blocks?.find((b) => b.id === w.block_id);
      const name = block?.name ? `${w.block_id} ${block.name}` : w.block_id;
      set("weakest", formatFact("weakest.level", w.level), w.ties ? "kpi.weakest.tied" : "kpi.weakest.block", { block: name, n: w.ties }, "");
      weakest = { full: name, id: w.block_id, ties: w.ties, key: w.ties ? "kpi.weakest.tied" : "kpi.weakest.block" };
    } else {
      set("weakest", noData(), "kpi.weakest.none");
      weakest = null;
    }
    fitWeakest();
    set("coverage", has("coverage") ? formatFact("coverage", facts.coverage) : noData(), "kpi.coverage.note", null, has("coverage") ? "" : "muted");
    set("exclusive", has("share.exclusive_non_eu") ? formatFact("share.exclusive_non_eu", facts["share.exclusive_non_eu"]) : noData(), "kpi.exclusive.note", null, has("share.exclusive_non_eu") ? "" : "muted");
  }

  onLang(render);
  render();

  return {
    /** Calls fn when the overall tile is pressed (the method view opens). */
    onOverall(fn) { overallClicks.add(fn); },
    /** Shows an engine result (score()), or no data for null. */
    show(next) {
      result = next || null;
      render();
    },
    reset() {
      result = null;
      render();
    }
  };
}
