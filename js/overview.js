// Draws the overview of every service and Compare (2.1.0) from js/cases.js's words into their dialogs.
// Every figure arrives as text; nothing here computes (tests/figures.mjs, view-computes-nothing).

import { t } from "./i18n/index.js";
import { h, level } from "./view.js";

/** A link of the chain in a cell: its level in a hexagon, the block, how many more share it; or words. */
function link(x) {
  if (!x || x.none) return h("span", { class: "ov-none" }, x?.none || "");
  return h("span", { class: "ov-link" }, level(x.level, { size: "sm" }), h("span", {}, x.name, x.more ? h("span", { class: "ov-also" }, x.more) : null,
    x.unknown ? h("span", { class: "ov-also" }, x.unknown) : null));
}

/** The case's name: a button that opens it, with its marks. */
function caseCell(r, tag = "th") {
  return h(tag, { scope: tag === "th" ? "row" : null, class: "ov-name" },
    h("button", { type: "button", class: "ov-open", dataset: { openCase: r.id }, "aria-label": t("p.ov.openCase.label", { name: r.name }) }, r.name),
    r.live ? h("span", { class: "vc-tag vc-tag--feature" }, t("p.ov.live")) : null,
    r.viewed ? h("span", { class: "vc-tag ov-viewed" }, t("p.ov.viewed")) : null);
}

function row(r, picks, { pick = true } = {}) {
  const on = picks.includes(r.key);
  return h("tr", { dataset: { case: r.id, key: r.key, live: String(r.live) } },
    h("td", { class: "ov-pick" }, pick ? h("label", { class: "vc-checkbox ov-check" },
      h("input", { type: "checkbox", dataset: { pick: r.key }, checked: on, disabled: !on && picks.length >= 3 }),
      h("span", { class: "vc-visually-hidden" }, t("p.ov.pick.label", { name: r.name }))) : null),
    caseCell(r),
    h("td", { class: "ov-score" }, h("strong", {}, r.score), h("span", { class: "ov-of" }, r.of)),
    h("td", {}, link(r.weakest)),
    h("td", {}, link(r.lower)),
    h("td", { class: "ov-num" }, r.exclusive),
    h("td", { class: "ov-group" }, r.group),
    h("td", { class: "ov-date" }, r.asOf));
}

/** The overview: every assessed service by score; this prototype and the cases without an assessment apart. */
export function renderOverview(body, m, picks) {
  const cols = ["service", "score", "weakest", "lower", "exclusive", "group", "asOf"];
  const span = cols.length + 1;
  const head = (key) => h("tr", { class: "ov-head" }, h("th", { scope: "colgroup", colspan: String(span) }, t(key)));
  body.replaceChildren(h("p", { class: "overview-lead" }, t("p.ov.lead")), h("div", { class: "vc-table-wrap ov-wrap" }, h("table", { class: "vc-table vc-table--compact ov-table" },
    h("caption", { class: "vc-visually-hidden" }, t("p.ov.title")),
    h("colgroup", {}, h("col", { class: "c-pick" }), cols.map((c) => h("col", { class: `c-${c}` }))),
    h("thead", {}, h("tr", {}, h("th", { scope: "col", class: "ov-pick" }, h("span", { class: "vc-visually-hidden" }, t("p.ov.pick"))),
      cols.map((c) => h("th", { scope: "col", class: `ov-col-${c}` }, t(`p.ov.col.${c}`))))),
    h("tbody", {}, m.rows.map((r) => row(r, picks))),
    m.self ? h("tbody", { class: "ov-apart" }, head("p.ov.self"), row(m.self, picks)) : null,
    m.ended.length ? h("tbody", { class: "ov-apart ov-ended" }, head("p.ov.ended"), m.ended.map((r) => h("tr", { dataset: { case: r.id } },
      h("td", { class: "ov-pick" }), caseCell(r), h("td", { colspan: String(cols.length - 2), class: "ov-reason" }, r.reason), h("td", { class: "ov-date" }, r.asOf)))) : null)));
}

/** Compare: one column a service, the four figures, then each layer's score and its lowest block. */
export function renderCompare(body, m) {
  const head = h("tr", {}, h("th", { scope: "col", class: "cmp-figure" }, t("p.cmp.figure")),
    m.cols.map((c) => h("th", { scope: "col", class: "cmp-case", dataset: { key: c.key } },
      h("button", { type: "button", class: "ov-open", dataset: { openCase: c.id }, "aria-label": t("p.ov.openCase.label", { name: c.name }) }, c.name),
      m.cols.length > 2 ? h("button", { type: "button", class: "vc-icon-button vc-icon-button--sm cmp-remove", dataset: { remove: c.key }, "aria-label": t("p.cmp.remove", { name: c.name }) }, h("span", { class: "vc-icon vc-icon--close", "aria-hidden": "true" })) : null)));
  const four = m.four.map((f) => h("tr", { dataset: { figure: f.key } }, h("th", { scope: "row" }, f.label), m.cols.map((c) => h("td", {},
    f.key === "score" ? [h("strong", { class: "cmp-score" }, c.score), h("span", { class: "ov-of" }, c.of)] : f.key === "exclusive" ? h("strong", {}, c.exclusive) : link(c[f.key])))));
  const layers = m.layers.map((l) => h("tr", { dataset: { layer: l.layer } }, h("th", { scope: "row" }, l.label), m.cols.map((c) => {
    const x = c.layers[l.layer];
    return h("td", {}, x.none ? h("span", { class: "ov-none" }, x.none)
      : [h("strong", { class: "cmp-score" }, x.score), h("span", { class: "ov-link" }, level(x.level, { size: "sm" }), h("span", {}, x.name, h("span", { class: "ov-also" }, x.more ? `${x.blocks}; ${x.more}` : x.blocks)))]);
  })));
  body.replaceChildren(h("div", { class: "vc-table-wrap cmp-wrap" }, h("table", { class: "vc-table vc-table--compact cmp-table", dataset: { n: String(m.cols.length) } },
    h("caption", { class: "vc-visually-hidden" }, m.title),
    h("thead", {}, head),
    h("tbody", {}, h("tr", { class: "ov-head" }, h("th", { scope: "colgroup", colspan: String(m.cols.length + 1) }, t("p.cmp.four"))), four),
    h("tbody", {}, h("tr", { class: "ov-head" }, h("th", { scope: "colgroup", colspan: String(m.cols.length + 1) }, t("p.cmp.layers"))), layers))));
}
