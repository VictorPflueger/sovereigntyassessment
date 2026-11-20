// The four exports at the top of the Outbox (brief §9; AC-17): the report as Markdown and as a
// self-contained HTML page, the assessment as JSON and the audit log as JSON. Each button names the file
// it saves; one that has nothing to save yet says why. The files are saved by the browser on this
// computer: nothing is sent anywhere.

import { h, downloadText, setDisabled } from "./dom.js";
import { icon } from "./icons.js";
import { t, onLang, getLang } from "./i18n/index.js";
import { exportFileName, reportMarkdownExport, reportHtml, assessmentJson } from "./export.js";
import { assessmentErrors, serviceName } from "./assessment.js";
import { auditJson } from "./audit.js";

const KINDS = ["reportMd", "reportHtml", "assessment", "audit"];

/**
 * panel: the Outbox's drawer panel. source(): what there is to export now: { run: { run_id, query, as_of,
 * mode } | null, report (the Outbox's report) | null, result (the engine's result on screen) | null,
 * assessment() → an Assessment or null }.
 */
export function createExportPanel(panel, { source }) {
  const buttons = new Map();
  const names = new Map();
  const title = h("h3", { class: "export-title", id: "export-title" });
  const lead = h("p", { class: "export-lead" });
  const list = h("ul", { class: "export-list" });
  const status = h("p", { class: "export-status", role: "status", "aria-live": "polite" });
  for (const kind of KINDS) {
    const b = h("button", { class: "vc-button vc-button--secondary vc-button--sm export-btn", type: "button", id: `btn-file-${kind}`, dataset: { kind } });
    const name = h("span", { class: "export-name" });
    b.addEventListener("click", () => save(kind));
    buttons.set(kind, b);
    names.set(kind, name);
    list.append(h("li", { class: "export-item", dataset: { kind } }, b, name));
  }
  const card = h("section", { class: "vc-card export-card", "aria-labelledby": "export-title", hidden: true }, title, lead, list, status);
  panel.prepend(card);

  /** What one export would save now: { name, text, mime } or { why } with the reason it cannot. */
  function prepare(kind) {
    const s = source();
    const lang = getLang();
    if (!s.run) return { why: t("export.why.noRun") };
    const service = s.run.query || "";
    const date = s.run.as_of || new Date().toISOString().slice(0, 10);
    if (kind === "reportMd" || kind === "reportHtml") {
      if (!s.report) return { why: t("export.why.noReport") };
      if (kind === "reportMd") return { name: exportFileName("report", { service, date, lang, ext: "md" }), text: reportMarkdownExport(s.report, lang), mime: "text/markdown" };
      const sourceKey = s.run.mode === "simulation" ? "map.asOf" : "map.liveAsOf";
      return { name: exportFileName("report", { service, date, lang, ext: "html" }), text: reportHtml(s.report, { lang, result: s.result, service, asOf: date, sourceKey }), mime: "text/html" };
    }
    if (kind === "assessment") {
      const a = s.assessment();
      if (!a) return { why: t("export.why.noAssessment") };
      const errors = assessmentErrors(a);
      if (errors.length) return { why: t("export.why.invalid", { path: errors[0].path || "–" }) };
      return { name: exportFileName(null, { service: serviceName(a, a.lang) || service, date: a.as_of, lang, ext: "json" }), text: assessmentJson(a), mime: "application/json" };
    }
    return { name: exportFileName("audit", { service: s.run.run_id, lang, ext: "json" }), text: auditJson(), mime: "application/json" };
  }

  function save(kind) {
    const p = prepare(kind);
    if (!p.name) { status.textContent = p.why; return; }
    downloadText(p.name, p.text, p.mime);
    status.textContent = t("export.saved", { file: p.name });
  }

  function render() {
    const s = source();
    card.hidden = !s.run;
    if (!s.run) return;
    title.textContent = t("export.title");
    lead.textContent = t("export.lead");
    for (const kind of KINDS) {
      const b = buttons.get(kind);
      b.replaceChildren(icon("download", 16), t(`export.${kind}`));
      const p = prepare(kind);
      setDisabled(b, !p.name, p.why || "");
      names.get(kind).textContent = p.name || p.why;
      names.get(kind).dataset.ready = p.name ? "true" : "false";
    }
  }

  onLang(render);
  render();
  return { render, prepare };
}
