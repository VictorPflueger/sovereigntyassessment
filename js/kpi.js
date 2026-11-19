// Header KPI strip: the overall score (always "indicative"), the weakest critical link, the evidence
// coverage and the exclusive non-EU control, from the engine's result (js/engine.js score()). A figure
// without a basis shows "no data", never 0 (brief §6.5). Labels are i18n keys; the figures are
// formatted for the active language and written again after a switch.

import { h } from "./dom.js";
import { tx, retext } from "./text.js";
import { onLang } from "./i18n/index.js";
import { formatFact } from "./facts.js";
import { noData } from "./format.js";

const TILES = [
  { id: "overall", labelKey: "kpi.overall.label" },
  { id: "weakest", labelKey: "kpi.weakest.label" },
  { id: "coverage", labelKey: "kpi.coverage.label" },
  { id: "exclusive", labelKey: "kpi.exclusive.label" }
];

export function createKpis(container) {
  const tiles = new Map();
  // Vici's stat card; the label names the group for screen readers.
  for (const tile of TILES) {
    const label = tx(tile.labelKey, null, { tag: "div", cls: "vc-stat__label kpi-label", attrs: { id: `kpi-${tile.id}-label` } });
    const value = h("div", { class: "vc-stat__value kpi-value", id: `kpi-${tile.id}-value` }, "");
    const sub = h("div", { class: "vc-stat__note kpi-sub", id: `kpi-${tile.id}-sub` }, h("span"));
    const el = h("div", { class: "vc-stat kpi", dataset: { tone: "muted", tile: tile.id }, role: "group", "aria-labelledby": `kpi-${tile.id}-label` }, label, value, sub);
    container.appendChild(el);
    tiles.set(tile.id, { el, value, sub });
  }

  let result = null;

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
    // The overall score always says "indicative" (brief §4, Honesty).
    set("overall", has("score.overall") ? formatFact("score.overall", facts["score.overall"]) : noData(), "kpi.overall.note", null, has("score.overall") ? "" : "muted");
    // The weakest critical link names its block, and how many more share its level on a tie.
    const w = r?.weakest;
    if (w && w.block_id) {
      const block = r.blocks?.find((b) => b.id === w.block_id);
      const name = block?.name ? `${w.block_id} ${block.name}` : w.block_id;
      set("weakest", formatFact("weakest.level", w.level), w.ties ? "kpi.weakest.tied" : "kpi.weakest.block", { block: name, n: w.ties }, "");
    } else {
      set("weakest", noData(), "kpi.weakest.none");
    }
    set("coverage", has("coverage") ? formatFact("coverage", facts.coverage) : noData(), "kpi.coverage.note", null, has("coverage") ? "" : "muted");
    set("exclusive", has("share.exclusive_non_eu") ? formatFact("share.exclusive_non_eu", facts["share.exclusive_non_eu"]) : noData(), "kpi.exclusive.note", null, has("share.exclusive_non_eu") ? "" : "muted");
  }

  onLang(render);
  render();

  return {
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
