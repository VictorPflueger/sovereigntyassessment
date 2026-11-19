// The start screen in the centrepiece: the bundled catalogue (data/catalogue.js) as chips grouped by
// category, with a mark for entries that have a pre-run assessment, and the chosen entry's description,
// status and verified starting sources. Choosing a chip fills the service field; any other service can
// be typed there. Names and texts come from the catalogue in both languages, so the view writes itself
// again after a language switch.

import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { getLang, onLang } from "./i18n/index.js";
import { byCategory, catalogueEntries, entryById } from "./catalogue.js";
import { fmtDate } from "./format.js";

const CATEGORIES = ["base_service", "platform_or_access"];

/** The entry's text in a language ({ en, de } or a plain string). */
export function inLang(value, lang = getLang()) {
  if (value && typeof value === "object") return value[lang] || value.en || "";
  return value ?? "";
}

/** True when a pre-run assessment ships for this entry (window.SA_RUNS, from version 0.2.0). */
export function hasPreRun(id) {
  return !!(globalThis.SA_RUNS && Object.hasOwn(globalThis.SA_RUNS, id));
}

/** onPick(entry): a chip was chosen. */
export function createCatalogueView(root, { onPick } = {}) {
  let selected = null;
  const chips = new Map();
  const groupsEl = h("div", { class: "catalogue-groups" });
  const detail = h("div", { class: "catalogue-detail", "aria-live": "polite" });
  const asOf = h("p", { class: "catalogue-asof" });

  root.append(
    h("section", { class: "catalogue", "aria-labelledby": "catalogue-title" },
      h("header", { class: "catalogue-head" },
        tx("catalogue.title", null, { tag: "h2", attrs: { id: "catalogue-title" } }),
        tx("catalogue.lead", null, { tag: "p", cls: "catalogue-lead", n: catalogueEntries().length }),
        asOf),
      groupsEl,
      detail));

  function render() {
    const lang = getLang();
    const data = globalThis.SA_CATALOGUE;
    asOf.replaceChildren(tx("catalogue.asOf", { date: fmtDate(data?.as_of, lang) }));
    clear(groupsEl);
    chips.clear();
    const groups = byCategory();
    for (const cat of CATEGORIES) {
      const entries = groups[cat] || [];
      if (!entries.length) continue;
      const headId = `catalogue-cat-${cat}`;
      const group = h("div", { class: "vc-chip-group catalogue-chips", role: "group", "aria-labelledby": headId });
      for (const entry of entries) {
        const pre = hasPreRun(entry.id);
        // Vici's chip around a radio button: one choice across the whole catalogue, by mouse or with
        // the arrow keys, and the chosen chip in merlot with Vici's tick.
        const radio = h("input", { type: "radio", name: "catalogue-entry", value: entry.id });
        radio.checked = entry.id === selected;
        const chip = h("label", { class: "vc-chip catalogue-chip", dataset: { entry: entry.id, prerun: String(pre) }, title: inLang(entry.description, lang) },
          radio,
          h("span", { class: "chip-name" }, inLang(entry.names, lang)),
          pre ? h("span", { class: "prerun-mark" }, icon("play", 14), tx("catalogue.preRun", null, { cls: "vc-visually-hidden" })) : null);
        radio.addEventListener("change", () => {
          if (!radio.checked) return;
          select(entry.id);
          onPick?.(entry);
        });
        chips.set(entry.id, radio);
        group.appendChild(chip);
      }
      groupsEl.appendChild(h("section", { class: "catalogue-group", dataset: { category: cat } },
        tx(`catalogue.cat.${cat}`, null, { tag: "h3", attrs: { id: headId } }), group));
    }
    renderDetail();
  }

  function renderDetail() {
    const lang = getLang();
    const entry = selected ? entryById(selected) : null;
    clear(detail);
    if (!entry) {
      detail.appendChild(tx("catalogue.hint", null, { tag: "p", cls: "catalogue-hint" }));
      return;
    }
    detail.append(
      h("h3", { class: "catalogue-detail-name" }, inLang(entry.names, lang), " ", tx(`catalogue.cat.${entry.category}`, null, { cls: "vc-tag catalogue-cat-tag" })),
      h("p", { class: "catalogue-detail-text" }, inLang(entry.description, lang)),
      h("p", { class: "catalogue-detail-status" }, tx("catalogue.status", null, { tag: "strong" }), " ", inLang(entry.status, lang)),
      tx("catalogue.sources", null, { tag: "h4" }),
      h("ul", { class: "catalogue-sources" }, (entry.urls || []).map((u) =>
        h("li", {},
          icon("link", 16),
          h("a", { href: u.url, target: "_blank", rel: "noopener noreferrer", hreflang: u.lang, lang: u.lang }, u.title),
          h("span", { class: "source-meta" }, tx("catalogue.readOn", { date: fmtDate(u.read_on, lang), lang: String(u.lang || "").toUpperCase() }))))));
  }

  /** Marks one entry as chosen (or none). */
  function select(id) {
    const next = id && entryById(id) ? id : null;
    if (next === selected) return;
    selected = next;
    for (const [cid, radio] of chips) radio.checked = cid === selected;
    renderDetail();
  }

  onLang(render);
  render();
  return { select, selected: () => selected };
}
