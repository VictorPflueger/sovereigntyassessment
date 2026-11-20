// The drawer's Building blocks tab (brief §9): the blocks as a table with filters; each row opens its
// evidence: the quote (with its language), the source, the date read, the fields it supports, and
// whether code verified the quote and how. Fields without a verified quote say so: they count as unknown
// for scoring, which is never a finding against a provider (brief §6.6).

import { bus } from "./events.js";
import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { t, onLang } from "./i18n/index.js";
import { fmtDate, fmtInt } from "./format.js";
import { LAYERS } from "./engine.js";
import { partyText } from "./drafts.js";
import { aiLabel, langTag } from "./ai_label.js";
import { getLang } from "./i18n/index.js";

export function createBlocksPanel(panel, { onCount } = {}) {
  const state = { blocks: [], layerStatus: {}, open: new Set(), layer: "all", unknownOnly: false, lang: "en", profile: null };
  const filters = h("div", { class: "panel-filters" });
  const body = h("div", { class: "panel-body" });
  const emptyEl = h("div", { class: "vc-empty empty" },
    tx("drawer.emptyTitle.blocks", null, { tag: "strong", cls: "vc-empty__title" }),
    tx("drawer.empty.blocks", null, { tag: "p", cls: "vc-empty__text" }));
  panel.append(emptyEl, filters, body);

  function textOf(v) {
    return typeof v === "string" ? v : v?.[state.lang] || "";
  }

  function renderFilters() {
    const select = h("select", { class: "vc-select panel-select", id: "blocks-layer", "aria-label": t("blocks.filter.layer") },
      h("option", { value: "all" }, t("blocks.filter.all")),
      ...LAYERS.map((l) => h("option", { value: l }, t(`layer.${l}`))));
    select.value = state.layer;
    select.addEventListener("change", () => { state.layer = select.value; render(); });
    const unknown = h("input", { type: "checkbox", id: "blocks-unknown", class: "vc-checkbox" });
    unknown.checked = state.unknownOnly;
    unknown.addEventListener("change", () => { state.unknownOnly = unknown.checked; render(); });
    filters.replaceChildren(
      h("label", { class: "panel-filter" }, h("span", {}, t("blocks.filter.layer")), select),
      h("label", { class: "panel-filter panel-check" }, unknown, h("span", {}, t("blocks.filter.unknown"))));
  }

  function evidenceList(items, lang) {
    return h("ul", { class: "evidence-list" }, ...items.map((c) => h("li", { class: "evidence-item", dataset: { verified: c.verified ? "true" : "false" } },
      h("div", { class: "evidence-head" },
        h("span", { class: c.verified ? "vc-tag vc-tag--success ev-tag" : "vc-tag vc-tag--warning ev-tag" }, icon(c.verified ? "check" : "alert", 14), t(c.verified ? `blocks.ev.verified.${c.via}` : "blocks.ev.unverified")),
        h("a", { href: c.url, target: "_blank", rel: "noopener noreferrer", class: "evidence-source" }, c.title || c.url)),
      c.quote ? h("blockquote", { class: "evidence-quote", lang: c.lang || undefined }, c.quote) : h("p", { class: "evidence-noquote" }, t("blocks.ev.noQuote")),
      h("p", { class: "evidence-meta" }, t("blocks.ev.meta", { date: fmtDate(c.read_on, lang), fields: (c.supports || []).map((f) => t(`field.${f}`)).join(", ") })))));
  }

  function render() {
    const lang = getLang();
    emptyEl.hidden = state.blocks.length > 0;
    filters.hidden = state.blocks.length === 0;
    clear(body);
    if (!state.blocks.length) return;
    renderFilters();
    const rows = state.blocks.filter((b) => (state.layer === "all" || b.layer === state.layer) && (!state.unknownOnly || b.unknown_fields.length || b.unscored || b.partly_unknown));
    // Explicit roles keep the table a table for screen readers where a narrow drawer stacks its rows
    // (css/panels.css); each cell names its column for that layout.
    const COLS = ["map.col.block", "map.col.layer", "map.col.name", "map.col.criticality", "map.col.madeIn", "map.col.runBy", "blocks.col.hosting", "blocks.col.licence", "blocks.col.exit", "map.col.level"];
    const label = (i) => t(COLS[i]);
    const table = h("table", { class: "vc-table blocks-table", role: "table" },
      h("thead", { role: "rowgroup" }, h("tr", { role: "row" }, ...COLS.map((k) => h("th", { scope: "col", role: "columnheader" }, t(k))))));
    const tbody = h("tbody", { role: "rowgroup" });
    for (const b of rows) {
      const open = state.open.has(b.id);
      const toggle = h("button", { class: "row-toggle", type: "button", "aria-expanded": open ? "true" : "false", "aria-controls": `ev-${b.id}`, title: t("blocks.evidence") }, icon("chevronRight", 14), b.id);
      toggle.addEventListener("click", () => {
        if (state.open.has(b.id)) state.open.delete(b.id); else state.open.add(b.id);
        render();
        // The table is drawn again: the focus goes back to this block's toggle, not to the page (R-13).
        body.querySelector(`tr[data-block="${CSS.escape(b.id)}"] .row-toggle`)?.focus();
      });
      const unk = (f) => (b.unknown_fields.includes(f) ? h("span", { class: "unk-mark", title: t("blocks.unknown.title") }, " (" + t("blocks.unknown") + ")") : null);
      const corrected = b.corrections?.length ? h("span", { class: "vc-tag vc-tag--accent corrected-tag" }, t("blocks.corrected")) : null;
      const cell = (i, attrs, ...kids) => h("td", { role: "cell", ...attrs, dataset: { label: label(i), ...(attrs?.dataset || {}) } }, ...kids);
      tbody.append(h("tr", { role: "row", dataset: { block: b.id, open: open ? "true" : "false" } },
        h("th", { scope: "row", role: "rowheader" }, toggle),
        cell(1, { class: "col-more" }, t(`layer.${b.layer}.short`)),
        cell(2, { class: "col-name", lang: b.lang || state.lang }, textOf(b.name), corrected),
        cell(3, { class: "col-more" }, t(`value.criticality.${b.criticality}`)),
        cell(4, { class: "col-more" }, h("span", { class: "cls-code" }, t(`class.${b.tech_class}.short`)), " ", h("span", { class: "party" }, partyText(b.tech, lang)), unk("tech"), unk("tech.parent")),
        cell(5, { class: "col-more" }, h("span", { class: "cls-code" }, t(`class.${b.operator_class}.short`)), " ", h("span", { class: "party" }, partyText(b.operator, lang)), unk("operator"), unk("operator.parent")),
        cell(6, { class: "col-more" }, t(`value.hosting.${b.hosting}`), unk("hosting")),
        cell(7, { class: "col-more" }, t(`value.licence.${b.licence}`), unk("licence")),
        cell(8, { class: "col-more" }, t(`value.exit.${b.exit}`), unk("exit")),
        cell(9, { class: "vc-tabular num col-level" }, b.unscored ? t("map.gap") : fmtInt(b.level) + (b.partly_unknown ? " (" + t("map.partly") + ")" : ""))));
      if (open) {
        const role = textOf(b.role);
        const note = textOf(b.note);
        tbody.append(h("tr", { class: "evidence-row", id: `ev-${b.id}`, role: "row" }, h("td", { colspan: "10", role: "cell" },
          h("div", { class: "evidence-wrap" },
            h("div", { class: "narr-line" }, aiLabel("block"), h("p", { lang: b.lang || state.lang }, role, note ? ` ${note}` : ""), b.lang && b.lang !== lang ? langTag(b.lang) : null),
            b.unknown_fields.length ? h("p", { class: "unknown-why" }, icon("alert", 14), t("blocks.unknownWhy", { fields: b.unknown_fields.map((f) => t(`field.${f}`)).join(", ") })) : null,
            b.corrections?.length ? h("ul", { class: "corrections-list" }, ...b.corrections.map((c) => h("li", {}, t("blocks.correctionLine", { field: t(`field.${c.field}`), reason: c.reason })))) : null,
            evidenceList(b.evidence || [], lang)))));
      }
    }
    table.append(tbody);
    body.append(table);
    onCount?.(state.blocks.length);
  }

  bus.on("run_start", (ev) => {
    state.blocks = [];
    state.open = new Set();
    state.layer = "all";
    state.unknownOnly = false;
    state.lang = ev.payload?.lang || "en";
    render();
    onCount?.(0);
  });
  bus.on("score_update", (ev) => {
    state.blocks = ev.payload?.result?.blocks || [];
    render();
  });
  onLang(render);
  render();

  return {
    /** Opens a block's evidence (from a honeycomb cell). */
    openBlock(id) {
      state.layer = "all";
      state.unknownOnly = false;
      state.open.add(id);
      render();
      panel.querySelector(`tr[data-block="${CSS.escape(id)}"] .row-toggle`)?.focus();
    },
    reset() { state.blocks = []; state.open = new Set(); render(); }
  };
}
