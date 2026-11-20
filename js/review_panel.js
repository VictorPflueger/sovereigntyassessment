// The drawer's Review tab (brief §9; AC-14): the person confirms the findings, skips the review, or
// corrects a block's criticality, Made-in or Run-by party (country and parent), hosting, licence or exit
// path, each correction with a reason. A correction needs a reason, not evidence (brief §6.6): code
// recomputes, logs it, marks the block "corrected by reviewer", and the report lists it apart from the
// agent's findings. The run waits until the person confirms or skips.

import { bus } from "./events.js";
import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { t, onLang, getLang } from "./i18n/index.js";
import { fmtInt } from "./format.js";
import { partyText, valueText } from "./drafts.js";
import { aiLabel, langTag } from "./ai_label.js";
import { renderFacts } from "./facts.js";

const COUNTRY = /^([A-Z]{2}|UNKNOWN)$/;
const OPTIONS = {
  criticality: ["critical", "important", "supporting"],
  hosting: ["EU", "NON_EU", "UNKNOWN"],
  licence: ["open_source", "proprietary", "unknown"],
  exit: ["easy", "possible", "hard", "unknown"]
};

export function createReviewPanel(panel, { getBlocks } = {}) {
  const state = { request: null, resolved: null, corrections: [], editing: null, lang: "en", message: null, blocks: null };
  const emptyEl = h("div", { class: "vc-empty empty" },
    tx("drawer.emptyTitle.review", null, { tag: "strong", cls: "vc-empty__title" }),
    tx("drawer.empty.review", null, { tag: "p", cls: "vc-empty__text" }));
  const body = h("div", { class: "panel-body review-body" });
  panel.append(emptyEl, body);

  // The blocks as the latest score update published them (its own copy, so the panel never draws the
  // blocks of a view that has not taken the update yet); getBlocks only before the first update.
  const blocks = () => state.blocks || getBlocks?.() || [];
  const textOf = (v) => (typeof v === "string" ? v : v?.[state.lang] || "");

  function select(name, value, options, labelKey) {
    const s = h("select", { class: "vc-select", name, "aria-label": t(labelKey) }, ...options.map((o) => h("option", { value: o }, t(`value.${name}.${o}`))));
    s.value = value;
    return s;
  }

  function partyFields(prefix, party) {
    const name = h("input", { class: "vc-input", name: `${prefix}.name`, value: party?.name || "", "aria-label": t(`review.${prefix}.name`) });
    const country = h("input", { class: "vc-input country-input", name: `${prefix}.country`, value: party?.country || "UNKNOWN", maxlength: "7", "aria-label": t(`review.${prefix}.country`), autocomplete: "off", spellcheck: "false" });
    const pName = h("input", { class: "vc-input", name: `${prefix}.parent.name`, value: party?.parent?.name || "", "aria-label": t("review.parent.name") });
    const pCountry = h("input", { class: "vc-input country-input", name: `${prefix}.parent.country`, value: party?.parent?.country || "", maxlength: "7", "aria-label": t("review.parent.country"), autocomplete: "off", spellcheck: "false" });
    return {
      el: h("fieldset", { class: "review-party" }, h("legend", {}, t(`review.${prefix}`)),
        h("label", {}, h("span", {}, t("review.partyName")), name),
        h("label", {}, h("span", {}, t("review.country")), country),
        h("label", {}, h("span", {}, t("review.parent.name")), pName),
        h("label", {}, h("span", {}, t("review.parent.country")), pCountry)),
      read() {
        const c = country.value.trim().toUpperCase();
        const pn = pName.value.trim();
        const pc = pCountry.value.trim().toUpperCase();
        if (!name.value.trim() || !COUNTRY.test(c)) return { error: true };
        if ((pn && !COUNTRY.test(pc)) || (!pn && pc)) return { error: true };
        return { value: { name: name.value.trim(), country: c, parent: pn ? { name: pn, country: pc } : null } };
      }
    };
  }

  function form(b) {
    const crit = select("criticality", b.scored?.criticality || b.criticality, OPTIONS.criticality, "field.criticality");
    const tech = partyFields("tech", b.tech);
    const op = partyFields("operator", b.operator);
    const hosting = select("hosting", b.scored?.hosting ?? b.hosting, OPTIONS.hosting, "field.hosting");
    const licence = select("licence", b.scored?.licence ?? b.licence, OPTIONS.licence, "field.licence");
    const exit = select("exit", b.scored?.exit ?? b.exit, OPTIONS.exit, "field.exit");
    const reason = h("textarea", { class: "vc-textarea review-reason", name: "reason", rows: "2", required: true, "aria-required": "true", "aria-label": t("review.reason") });
    const msg = h("p", { class: "review-msg", role: "status" });
    const apply = h("button", { class: "vc-button vc-button--primary review-apply", type: "button" }, t("review.apply"));
    const cancel = h("button", { class: "vc-button vc-button--ghost", type: "button" }, t("review.cancel"));
    cancel.addEventListener("click", () => { state.editing = null; render(); });
    apply.addEventListener("click", () => {
      const why = reason.value.trim();
      if (!why) { msg.textContent = t("review.needReason"); reason.focus(); return; }
      const changes = {};
      const tr = tech.read();
      const or = op.read();
      if (tr.error || or.error) { msg.textContent = t("review.badCountry"); return; }
      const same = (a, c) => JSON.stringify(a ?? null) === JSON.stringify(c ?? null);
      if (crit.value !== (b.scored?.criticality || b.criticality)) changes.criticality = crit.value;
      if (!same(tr.value, b.scored?.tech)) changes.tech = tr.value;
      if (!same(or.value, b.scored?.operator)) changes.operator = or.value;
      if (hosting.value !== (b.scored?.hosting ?? b.hosting)) changes.hosting = hosting.value;
      if (licence.value !== (b.scored?.licence ?? b.licence)) changes.licence = licence.value;
      if (exit.value !== (b.scored?.exit ?? b.exit)) changes.exit = exit.value;
      if (!Object.keys(changes).length) { msg.textContent = t("review.nothing"); return; }
      bus.emit("review_decision", { request_id: state.request.request_id, action: "correct", block_id: b.id, changes, reason: why, by: "user" });
      state.editing = null;
      render();
    });
    return h("div", { class: "review-form", dataset: { block: b.id } },
      h("div", { class: "review-grid" },
        h("label", {}, h("span", {}, t("field.criticality")), crit),
        h("label", {}, h("span", {}, t("field.hosting")), hosting),
        h("label", {}, h("span", {}, t("field.licence")), licence),
        h("label", {}, h("span", {}, t("field.exit")), exit)),
      h("div", { class: "review-parties" }, tech.el, op.el),
      h("label", { class: "review-reason-label" }, h("span", {}, t("review.reason")), reason),
      msg,
      h("div", { class: "review-actions" }, apply, cancel));
  }

  function render() {
    const lang = getLang();
    emptyEl.hidden = !!state.request;
    clear(body);
    if (!state.request) return;
    const r = state.request;
    body.append(h("div", { class: "review-summary narr-line" }, aiLabel("review"), h("p", { lang: state.lang }, renderFacts(r.summary, r.values || {}, state.lang)), state.lang !== lang ? langTag(state.lang) : null));
    if (state.resolved) {
      body.append(h("p", { class: "review-done vc-alert" }, icon("check", 18), t(state.resolved === "skip" ? "review.doneSkip" : "review.doneConfirm", { n: fmtInt(state.corrections.length) })));
    } else {
      body.append(h("p", { class: "review-lead" }, t("review.lead")));
    }
    const list = h("ul", { class: "review-blocks" });
    const order = [...new Set([...(r.block_ids || []), ...blocks().map((b) => b.id)])];
    for (const id of order) {
      const b = blocks().find((x) => x.id === id);
      if (!b) continue;
      const editing = state.editing === id && !state.resolved;
      const corr = h("button", { class: "vc-button vc-button--secondary vc-button--sm review-correct", type: "button", disabled: !!state.resolved, "aria-expanded": editing ? "true" : "false" }, t("review.correct"));
      corr.addEventListener("click", () => { state.editing = editing ? null : id; render(); });
      list.append(h("li", { class: "review-block", dataset: { block: id, focus: (r.block_ids || []).includes(id) ? "true" : "false" } },
        h("div", { class: "review-block-head" },
          h("span", { class: "review-id" }, id),
          h("span", { class: "review-name", lang: b.lang || state.lang }, textOf(b.name)),
          h("span", { class: "review-codes" }, `${t(`class.${b.tech_class}.short`)}·${t(`class.${b.operator_class}.short`)}`),
          h("span", { class: "review-level" }, b.unscored ? t("map.gap") : t(b.partly_unknown ? "map.levelPartly" : "map.level", { level: fmtInt(b.level) })),
          b.corrections?.length ? h("span", { class: "vc-tag vc-tag--accent corrected-tag" }, t("blocks.corrected")) : null,
          corr),
        editing ? form(b) : null));
    }
    body.append(list);
    if (state.corrections.length) {
      body.append(h("h3", { class: "panel-subtitle" }, t("review.log")),
        h("ul", { class: "corrections-list" }, ...state.corrections.map((c) => h("li", {}, t("review.logLine", { block: c.block_id, field: t(`field.${c.field}`), from: valueText(c.field, c.from, lang), to: valueText(c.field, c.to, lang), reason: c.reason })))));
    }
    if (!state.resolved) {
      const confirm = h("button", { class: "vc-button vc-button--primary review-confirm", type: "button", id: "btn-review-confirm" }, icon("check", 18), t("review.confirm"));
      const skip = h("button", { class: "vc-button vc-button--secondary review-skip", type: "button", id: "btn-review-skip" }, t("review.skip"));
      confirm.addEventListener("click", () => decide("confirm"));
      skip.addEventListener("click", () => decide("skip"));
      body.append(h("div", { class: "review-footer" }, confirm, skip));
    }
  }

  function decide(action) {
    if (!state.request || state.resolved) return;
    state.resolved = action;
    bus.emit("review_decision", { request_id: state.request.request_id, action, by: "user" });
    render();
  }

  bus.on("run_start", (ev) => {
    state.request = null;
    state.resolved = null;
    state.corrections = [];
    state.editing = null;
    state.blocks = null;
    state.lang = ev.payload?.lang || "en";
    render();
  });
  bus.on("review_request", (ev) => {
    state.request = { ...ev.payload };
    state.resolved = null;
    render();
  });
  bus.on("block_recorded", (ev) => {
    const p = ev.payload || {};
    if (p.by !== "reviewer") return;
    const fresh = (p.block?.corrections || []).filter((c) => !state.corrections.some((x) => x.ts === c.ts && x.field === c.field && x.block_id === c.block_id));
    state.corrections.push(...fresh);
    render();
  });
  bus.on("score_update", (ev) => {
    state.blocks = ev.payload?.result?.blocks || state.blocks;
    if (state.request && !state.resolved) render();
  });
  onLang(render);
  render();

  return { pending: () => !!state.request && !state.resolved };
}
