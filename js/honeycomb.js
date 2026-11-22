// The honeycomb of the building blocks (brief §9; PLAN.md f.3): one hexagon cell per block, grouped by
// layer, filled by level on Vici's diverging scale (level 0 --vc-div-1, 1 --vc-div-3, 2 --vc-div-4,
// 3 --vc-div-5, 4 --vc-div-7). Each cell writes its level and its Made-in and Run-by codes, so nothing
// reads by colour alone, in --vc-text-inverse on levels 0 and 4 and --vc-text on 1 to 3; a gap (an
// unscored block) is an empty cell with a dashed outline, and so is a layer without blocks. A cell opens
// the block's evidence in the drawer.

import { h } from "./dom.js";
import { t } from "./i18n/index.js";
import { fmtInt, fmtScore, layerStatusKey } from "./format.js";
import { LAYERS } from "./engine.js";
import { svg, hexPoints } from "./spider.js";

const W = 64;
const H = 56;

function cellSvg({ level, label, codes, gap, partly }) {
  const s = svg("svg", { class: "hc-svg", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
  s.append(svg("polygon", { class: gap ? "hc-hex hc-hex--gap" : "hc-hex", points: hexPoints(W / 2, H / 2, 31) }));
  s.append(svg("text", { class: "hc-id", x: W / 2, y: 15, "text-anchor": "middle" }, label));
  s.append(svg("text", { class: "hc-level", x: W / 2, y: 34, "text-anchor": "middle" }, gap ? "–" : `${level}${partly ? "?" : ""}`));
  s.append(svg("text", { class: "hc-codes", x: W / 2, y: 47, "text-anchor": "middle" }, codes));
  return s;
}

/** onPick(blockId): a cell was chosen. */
export function renderHoneycomb(root, result, { layerStatus = {}, onPick, lang } = {}) {
  root.replaceChildren();
  const blocks = result?.blocks || [];
  for (const layer of LAYERS) {
    const inLayer = blocks.filter((b) => b.layer === layer);
    const score = result?.layers?.[layer]?.score ?? null;
    const status = layerStatus[layer]?.status || result?.layers?.[layer]?.status || "open";
    const head = h("div", { class: "hc-head" },
      h("span", { class: "hc-layer", title: t(`layer.${layer}.full`) }, t(`layer.${layer}.short`)),
      h("span", { class: "hc-score vc-tabular" }, score === null ? t(["not_applicable", "no_evidence", "not_assessed"].includes(status) ? layerStatusKey(status, inLayer.length) : "map.status.open") : fmtScore(score)));
    const cells = h("div", { class: "hc-cells" });
    for (const b of inLayer) {
      const codes = `${t(`class.${b.tech_class}.short`)}·${t(`class.${b.operator_class}.short`)}`;
      const gap = !!b.unscored;
      const name = typeof b.name === "string" ? b.name : b.name?.[lang] || "";
      const aria = gap
        ? t("map.cell.gap", { block: b.id, name, made: t(`class.${b.tech_class}`), run: t(`class.${b.operator_class}`) })
        : t(b.partly_unknown ? "map.cell.partly" : "map.cell", { block: b.id, name, level: fmtInt(b.level), made: t(`class.${b.tech_class}`), run: t(`class.${b.operator_class}`) });
      const btn = h("button", { class: "hc-cell", type: "button", dataset: { block: b.id, level: gap ? "gap" : String(b.level), partly: b.partly_unknown ? "true" : "false" }, "aria-label": aria, title: aria },
        cellSvg({ level: b.level, label: b.id, codes, gap, partly: b.partly_unknown }));
      btn.addEventListener("click", () => onPick?.(b.id));
      cells.append(btn);
    }
    if (!inLayer.length) {
      cells.append(h("span", { class: "hc-cell hc-cell--empty", dataset: { level: "gap" }, role: "img", "aria-label": t("map.cell.empty", { layer: t(`layer.${layer}`), status: t(layerStatusKey(status, inLayer.length)) }) },
        cellSvg({ level: null, label: "", codes: "", gap: true })));
    }
    root.append(h("div", { class: "hc-group", dataset: { layer, status } }, head, cells));
  }
}
