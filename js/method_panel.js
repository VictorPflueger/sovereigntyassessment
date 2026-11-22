// The method view (brief §9): the six layers with the portal's labels, the level rules and their source
// (the SEAL scale of the EU Cloud Sovereignty Framework, version 1.2.1; PLAN.md I10), the scores, the
// layer weights (editable, each change logged as an assumption), the class rules, the evidence rules and
// what the score is not. A dialog, opened from "Method" in the header and from the overall tile. Every
// word is an i18n key; the German labels of the layers come from the German dictionary, the English
// ones from the English, so the table shows both in either language.

import { h } from "./dom.js";
import { icon } from "./icons.js";
import { openModal } from "./modal.js";
import { tx } from "./text.js";
import { t, onLang } from "./i18n/index.js";
import { fmtDate, fmtTime, fmtWeight } from "./format.js";
import { LAYERS, METHOD_VERSION } from "./engine.js";
import { getWeights, setWeights, resetWeights, isEqualWeights, weightChanges, onWeights, WEIGHT_CHOICES } from "./weights.js";

/** The sources the view names, as read for this build (DATA_SOURCES.md §2). */
const SOURCES = {
  layers: { url: "https://deutschland-stack.gov.de/aufbau/", read_on: "2026-11-19", lang: "de" },
  seal: { url: "https://ppc.land/content/files/2025/11/Cloud-Sovereignty-Framework.pdf", read_on: "2026-11-20", lang: "en" },
  criteria: { url: "https://deutschland-stack.gov.de/kriterien/", read_on: "2026-11-19", lang: "de" }
};

const LIST = (prefix, keys) => h("ul", { class: "method-list" }, keys.map((k) => h("li", {}, t(`${prefix}.${k}`))));

/** Opens the method view. Resolves when it closes. */
export function openMethod() {
  return new Promise((resolve) => {
    let modal;
    let weightsSection = null;
    const body = h("div", { class: "method" });
    const status = h("p", { class: "method-status", role: "status", "aria-live": "polite" });

    function source(id) {
      const s = SOURCES[id];
      const read = t("method.readOn", { date: fmtDate(s.read_on) });
      return h("p", { class: "method-source" }, icon("link", 14),
        h("span", {}, t(`method.source.${id}`), ": ",
          h("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", hreflang: s.lang }, s.url.replace(/^https:\/\//, "")),
          ` (${read})`));
    }

    function weightsForm() {
      const w = getWeights();
      const rows = LAYERS.map((l) => {
        const sel = h("select", { class: "vc-select method-weight", id: `weight-${l}`, dataset: { layer: l } },
          WEIGHT_CHOICES.map((v) => h("option", { value: String(v) }, fmtWeight(v))));
        sel.value = String(w[l]);
        sel.addEventListener("change", () => {
          try {
            const change = setWeights({ [l]: Number(sel.value) });
            if (change) status.textContent = t("method.weights.logged");
          } catch {
            sel.value = String(getWeights()[l]);
            status.textContent = t("method.weights.refused");
          }
        });
        return h("div", { class: "method-weight-row" }, h("label", { for: `weight-${l}` }, t(`layer.${l}`)), sel);
      });
      const reset = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button", id: "btn-weights-reset", disabled: isEqualWeights() }, icon("reset", 16), t("method.weights.reset"));
      reset.addEventListener("click", () => { if (resetWeights()) status.textContent = t("method.weights.resetDone"); });
      const changes = weightChanges();
      return h("section", { class: "method-section method-weights", "aria-labelledby": "method-weights-title" },
        h("h3", { id: "method-weights-title" }, t("method.weights.title")),
        h("p", {}, t("method.weights.text")),
        h("div", { class: "method-weight-grid" }, rows),
        h("div", { class: "method-weight-actions" }, reset, h("span", { class: "method-weight-state" }, t(isEqualWeights() ? "method.weights.equal" : "method.weights.changed"))),
        status,
        h("h4", {}, t("method.weights.log")),
        changes.length
          ? h("ol", { class: "method-log" }, changes.map((c) => h("li", {}, t("method.weights.logItem", { time: fmtTime(c.ts), list: LAYERS.map((l) => `${t(`layer.${l}.short`)} ${fmtWeight(c.to[l])}`).join(", ") }))))
          : h("p", { class: "method-note" }, t("method.weights.none")));
    }

    function render() {
      const de = (k) => t(k, null, "de");
      const en = (k) => t(k, null, "en");
      body.replaceChildren(
        h("p", { class: "method-lead" }, t("method.lead", { version: METHOD_VERSION })),
        h("section", { class: "method-section", "aria-labelledby": "method-layers-title" },
          h("h3", { id: "method-layers-title" }, t("method.layers.title")),
          h("p", {}, t("method.layers.text")),
          h("table", { class: "vc-table method-table" },
            h("thead", {}, h("tr", {}, h("th", { scope: "col" }, t("method.col.portal")), h("th", { scope: "col" }, t("method.col.english")), h("th", { scope: "col" }, t("method.col.look")))),
            h("tbody", {}, LAYERS.map((l) => h("tr", { dataset: { layer: l } }, h("th", { scope: "row", lang: "de" }, de(`layer.${l}`)), h("td", { lang: "en" }, en(`layer.${l}`)), h("td", {}, t(`method.look.${l}`)))))),
          source("layers")),
        h("section", { class: "method-section", "aria-labelledby": "method-levels-title" },
          h("h3", { id: "method-levels-title" }, t("method.levels.title")),
          LIST("method.levels", ["tech", "op", "block", "alike"]),
          h("p", {}, t("method.seal.text")),
          h("ul", { class: "method-seal" }, [0, 1, 2, 3, 4].map((n) => h("li", { dataset: { seal: String(n) } }, t(`method.seal.${n}`)))),
          source("seal")),
        h("section", { class: "method-section", "aria-labelledby": "method-scores-title" },
          h("h3", { id: "method-scores-title" }, t("method.scores.title")),
          LIST("method.scores", ["weights", "layer", "overall", "weakest", "coverage", "exclusive", "counts", "whatif", "portfolio", "exit", "nodata"]),
          source("criteria")),
        (weightsSection = weightsForm()),
        h("section", { class: "method-section", "aria-labelledby": "method-classes-title" },
          h("h3", { id: "method-classes-title" }, t("method.classes.title")),
          LIST("method.classes", ["codes", "eu", "cn", "parent", "public", "steward", "product", "sides"])),
        h("section", { class: "method-section", "aria-labelledby": "method-evidence-title" },
          h("h3", { id: "method-evidence-title" }, t("method.evidence.title")),
          LIST("method.evidence", ["counts", "check", "fields", "general", "corrections", "primary", "neutral", "date"])),
        h("section", { class: "method-section method-not", "aria-labelledby": "method-not-title" },
          h("h3", { id: "method-not-title" }, t("method.not.title")),
          LIST("method.not", ["official", "quality", "unknown", "vendors", "time"])));
    }

    // A change of the weights redraws only their section, and the keyboard stays where it was.
    function redrawWeights() {
      const focused = document.activeElement?.id;
      const next = weightsForm();
      weightsSection?.replaceWith(next);
      weightsSection = next;
      if (focused) document.getElementById(focused)?.focus();
    }

    render();
    const offLang = onLang(render);
    const offWeights = onWeights(redrawWeights);
    modal = openModal({
      title: tx("method.title"),
      intro: tx("method.subtitle"),
      size: "wide",
      className: "method-modal",
      body: [body],
      footer: [h("button", { class: "vc-button", type: "button", id: "btn-method-close", autofocus: true, on: { click: () => modal.close(null) } }, tx("intro.close"))],
      onClose: () => { offLang(); offWeights(); resolve(); }
    });
  });
}
