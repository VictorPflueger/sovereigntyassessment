// The drawer's Outbox tab (brief §9): the memo for the person's choice and the report, as drafts. Code
// adds the memo's header, its before-and-after figures and "Draft. Nothing is sent."; the report's
// reviewer corrections, decision, sources and method line. Nothing leaves the Outbox: the prototype is
// connected to no mail or document system, and the page may reach only api.anthropic.com.

import { bus } from "./events.js";
import { h, clear, copyText } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { t, onLang, getLang } from "./i18n/index.js";
import { renderMarkdown } from "./md.js";
import { memoMarkdown, reportMarkdown } from "./drafts.js";
import { aiLabel, langTag } from "./ai_label.js";

export function createOutbox(panel, { onCount } = {}) {
  const state = { memo: null, report: null };
  const emptyEl = h("div", { class: "vc-empty empty" },
    tx("drawer.emptyTitle.outbox", null, { tag: "strong", cls: "vc-empty__title" }),
    tx("drawer.empty.outbox", null, { tag: "p", cls: "vc-empty__text" }));
  const body = h("div", { class: "panel-body outbox-body" });
  panel.append(emptyEl, body);

  function draftCard(kind, markdown, lang, unchecked) {
    const copy = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button" }, icon("copy", 16), t("outbox.copy"));
    const done = h("span", { class: "outbox-copied", role: "status" });
    copy.addEventListener("click", async () => { done.textContent = (await copyText(markdown)) ? t("outbox.copied") : t("outbox.copyFailed"); });
    const md = h("div", { class: "md vc-prose", lang });
    md.append(renderMarkdown(markdown));
    return h("article", { class: "vc-card outbox-card", dataset: { draft: kind } },
      h("header", { class: "outbox-head" },
        h("span", { class: "vc-tag outbox-kind" }, icon(kind === "memo" ? "memo" : "list", 14), t(`outbox.kind.${kind}`)),
        h("span", { class: "vc-tag vc-tag--neutral outbox-status" }, icon("shield", 14), t("outbox.draftNote")),
        aiLabel(kind),
        lang !== getLang() ? langTag(lang) : null,
        unchecked?.length ? h("span", { class: "vc-tag vc-tag--warning unchecked-tag", title: t("console.unchecked.title", { tokens: unchecked.join(", ") }) }, t("console.unchecked")) : null),
      md,
      h("footer", { class: "outbox-foot" }, copy, done));
  }

  function render() {
    emptyEl.hidden = !!(state.memo || state.report);
    clear(body);
    if (state.memo) body.append(draftCard("memo", memoMarkdown(state.memo), state.memo.lang, state.memo.unchecked));
    if (state.report) body.append(draftCard("report", reportMarkdown(state.report), state.report.lang, state.report.unchecked));
    onCount?.((state.memo ? 1 : 0) + (state.report ? 1 : 0));
  }

  bus.on("run_start", () => { state.memo = null; state.report = null; render(); });
  bus.on("action_draft", (ev) => { state.memo = ev.payload; render(); });
  bus.on("report", (ev) => { state.report = ev.payload; render(); });
  // New layer weights (the method view): the drafts' figures follow, as new objects, so the events the
  // audit log holds keep what they showed.
  bus.on("weights_change", (ev) => {
    const p = ev.payload || {};
    if (state.memo && p.memo) state.memo = { ...state.memo, ...p.memo };
    if (state.report && p.report) {
      const c = state.report.closing || {};
      const decision = c.decision && p.report.decision_facts ? { ...c.decision, facts: { ...p.report.decision_facts } } : c.decision;
      state.report = { ...state.report, values: { ...p.report.values }, closing: { ...c, weights: { ...p.report.weights }, decision } };
    }
    if (p.memo || p.report) render();
  });
  onLang(render);
  render();
  return { memo: () => state.memo, report: () => state.report };
}
