// The table view of the sovereignty map (brief §9: "a table of the same numbers is one click away"): the
// layer scores of the spider diagram's layer view and the block levels of its block view, with the
// statuses, the classes and the counts the engine computed.

import { h } from "./dom.js";
import { t } from "./i18n/index.js";
import { fmtInt, fmtScore, layerStatusKey } from "./format.js";
import { LAYERS } from "./engine.js";

export function renderTables(root, result, { layerStatus = {}, lang } = {}) {
  root.replaceChildren();
  if (!result) return;
  const layers = h("table", { class: "vc-table map-table", dataset: { table: "layers" } },
    h("caption", {}, t("map.table.layers")),
    h("thead", {}, h("tr", {}, ...["map.col.layer", "map.col.score", "map.col.status", "map.col.blocks"].map((k) => h("th", { scope: "col" }, t(k))))),
    h("tbody", {}, ...LAYERS.map((l) => {
      const L = result.layers[l];
      const status = L.score !== null ? "scored" : layerStatus[l]?.status || L.status;
      return h("tr", { dataset: { layer: l, value: L.score === null ? "" : String(L.score) } },
        h("th", { scope: "row" }, t(`layer.${l}`)),
        h("td", { class: "vc-tabular num" }, L.score === null ? t("fact.noData") : fmtScore(L.score)),
        h("td", {}, t(layerStatusKey(status, L.blocks))),
        h("td", { class: "vc-tabular num" }, t("map.blocksScored", { scored: fmtInt(L.scored), all: fmtInt(L.blocks) })));
    })));
  const blocks = h("table", { class: "vc-table map-table", dataset: { table: "blocks" } },
    h("caption", {}, t("map.table.blocks")),
    h("thead", {}, h("tr", {}, ...["map.col.block", "map.col.layer", "map.col.name", "map.col.criticality", "map.col.madeIn", "map.col.runBy", "map.col.level"].map((k) => h("th", { scope: "col" }, t(k))))),
    h("tbody", {}, ...(result.blocks || []).map((b) => h("tr", { dataset: { block: b.id, value: b.unscored ? "" : String(25 * b.level) } },
      h("th", { scope: "row" }, b.id),
      h("td", {}, t(`layer.${b.layer}.short`)),
      h("td", { lang: b.lang || lang }, typeof b.name === "string" ? b.name : b.name?.[lang] || ""),
      h("td", {}, t(`value.criticality.${b.criticality}`)),
      h("td", {}, t(`class.${b.tech_class}`)),
      h("td", {}, t(`class.${b.operator_class}`)),
      h("td", { class: "vc-tabular num" }, b.unscored ? t("map.gap") : fmtInt(b.level) + (b.partly_unknown ? " (" + t("map.partly") + ")" : ""))))));
  root.append(layers, blocks);
}
