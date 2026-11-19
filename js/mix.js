// The service's Made-in and Run-by mix beside the spider diagram (brief §9): the blocks per origin class
// as sorted bars, for all blocks, with the critical blocks' count in each row. Classes without a block are
// left out; a class is named by its code and, on hover and for screen readers, in words.

import { h } from "./dom.js";
import { t } from "./i18n/index.js";
import { fmtInt } from "./format.js";
import { CLASSES } from "./classes.js";

/** Rows of one group, sorted by count (then in class order), zero counts left out. */
export function mixRows(all = {}, critical = {}) {
  return CLASSES.map((c, i) => ({ cls: c, n: all[c] || 0, critical: critical[c] || 0, i }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i);
}

export function renderMix(root, result) {
  root.replaceChildren();
  const counts = result?.counts;
  if (!counts) return;
  for (const [group, key] of [["made_in", "map.mix.madeIn"], ["run_by", "map.mix.runBy"]]) {
    const rows = mixRows(counts[group].all, counts[group].critical);
    const max = Math.max(1, ...rows.map((r) => r.n));
    const list = h("ul", { class: "mix-rows", "aria-label": t(key) });
    for (const r of rows) {
      const bar = h("span", { class: "mix-bar", "aria-hidden": "true" });
      bar.style.width = `${(100 * r.n) / max}%`;
      list.append(h("li", { class: "mix-row", dataset: { cls: r.cls, n: String(r.n) }, title: t(`class.${r.cls}`) },
        h("span", { class: "mix-code" }, t(`class.${r.cls}.short`)),
        h("span", { class: "mix-track" }, bar),
        h("span", { class: "mix-n vc-tabular" }, fmtInt(r.n)),
        h("span", { class: "visually-hidden vc-visually-hidden" }, t("map.mix.row", { cls: t(`class.${r.cls}`), n: fmtInt(r.n), critical: fmtInt(r.critical) }))));
    }
    root.append(h("section", { class: "mix-group", dataset: { group } }, h("h3", { class: "mix-title" }, t(key)), rows.length ? list : h("p", { class: "mix-empty" }, t("map.mix.empty"))));
  }
}
