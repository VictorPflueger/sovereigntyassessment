// The drawer's Audit tab (brief §4): the run's events and model calls, their totals (model, usage,
// searches, fetches, cost: what AC-21 reads), the JSON export, and "Save run as simulation" after a live
// run. Exports store URL, title and quote, never a page's text, and never the key.

import { h, clear, downloadText } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { t, onLang } from "./i18n/index.js";
import { fmtEur, fmtInt } from "./format.js";
import { onAudit, auditCounts, auditTotals, auditJson, auditEvents } from "./audit.js";
import { recordingText } from "./recorder.js";
import { MODELS } from "./config.js";

export function createAuditPanel(panel, { onCount } = {}) {
  const emptyEl = h("div", { class: "vc-empty empty" },
    tx("drawer.emptyTitle.audit", null, { tag: "strong", cls: "vc-empty__title" }),
    tx("drawer.empty.audit", null, { tag: "p", cls: "vc-empty__text" }));
  const body = h("div", { class: "panel-body audit-body" });
  const status = h("p", { class: "audit-status", role: "status" });
  panel.append(emptyEl, body);

  function render() {
    const c = auditCounts();
    emptyEl.hidden = !c.run;
    clear(body);
    onCount?.(c.events);
    if (!c.run) return;
    const totals = auditTotals();
    const live = c.run.mode === "live";
    const rows = [
      ["audit.mode", t(`badge.${c.run.mode}`)],
      ["audit.events", fmtInt(c.events)],
      ...(live ? [
        ["audit.model", MODELS.find((m) => m.id === totals.model)?.label || totals.model || ""],
        ["audit.calls", fmtInt(totals.model_calls)],
        ["audit.tokens", t("audit.tokensValue", { input: fmtInt(totals.input_tokens), output: fmtInt(totals.output_tokens), read: fmtInt(totals.cache_read_tokens), write: fmtInt(totals.cache_write_tokens) })],
        ["audit.searches", fmtInt(totals.web_searches)],
        ["audit.fetches", fmtInt(totals.web_fetches)],
        ["audit.cost", fmtEur(totals.cost_eur)]
      ] : [["audit.searches", fmtInt(totals.web_searches)], ["audit.fetches", fmtInt(totals.web_fetches)], ["audit.cost", t("audit.noCost")]])
    ];
    body.append(h("dl", { class: "audit-totals" }, ...rows.map(([k, v]) => h("div", {}, h("dt", {}, t(k)), h("dd", { class: "vc-tabular" }, v)))));
    const exportBtn = h("button", { class: "vc-button vc-button--secondary", type: "button", id: "btn-export-audit" }, icon("download", 18), t("audit.export"));
    exportBtn.addEventListener("click", () => {
      downloadText(`sovereignty-assessment-audit-${c.run.run_id}.json`, auditJson());
      status.textContent = t("audit.exported");
    });
    const ended = !!c.run.status;
    const canRecord = live && ended;
    const record = h("button", { class: "vc-button vc-button--secondary", type: "button", id: "btn-save-simulation", disabled: !canRecord, "aria-disabled": canRecord ? "false" : "true", title: canRecord ? t("audit.record.title") : t(live ? "audit.record.afterRun" : "audit.record.liveOnly") }, icon("play", 18), t("audit.record"));
    record.addEventListener("click", () => {
      if (!canRecord) return;
      const { def, text } = recordingText(auditEvents());
      downloadText(`sovereignty-assessment-run-${def.id}-${def.as_of}.js`, text, "text/javascript");
      status.textContent = t("audit.recorded", { n: fmtInt(def.steps.length) });
    });
    body.append(h("div", { class: "audit-actions" }, exportBtn, record), status,
      h("p", { class: "audit-note" }, t("audit.note")));
  }

  let pending = false;
  onAudit(() => { if (!pending) { pending = true; queueMicrotask(() => { pending = false; render(); }); } });
  onLang(render);
  render();
}
