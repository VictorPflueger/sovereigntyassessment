// The exports (brief §9; AC-17): the report as Markdown and as a self-contained HTML page, the assessment
// as JSON and the audit log as JSON, in the active language (brief §5: what code writes follows the
// active language; the findings the agent wrote keep the run's language and say so). Every file name
// starts with "sovereignty-assessment-" and ends with the language. The HTML page carries its own
// styles and the layer diagram as inline SVG, loads nothing and runs no script (its own security policy
// says so). The JSON is checked against the schemas before it is offered, and anything key-like is
// redacted, as in the audit export. Exports store URL, title and quote, never a page's text.

import { t, getLang } from "./i18n/index.js";
import { escapeHtml } from "./dom.js";
import { renderMarkdown } from "./md.js";
import { reportParts } from "./drafts.js";
import { redactSecrets } from "./keystore.js";
import { spiderSvg, wrapWords } from "./spider.js";
import { LAYERS } from "./engine.js";
import { fmtDate, fmtInt, fmtScore } from "./format.js";
import { formatFact } from "./facts.js";
import { weakestText } from "./compare.js";

export const EXPORT_PREFIX = "sovereignty-assessment-";

/** A file-name part from a service's name: lower case, ASCII, words joined by hyphens. */
export function slugOf(text) {
  const map = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", Ä: "ae", Ö: "oe", Ü: "ue" };
  return String(text || "").replace(/[äöüßÄÖÜ]/g, (c) => map[c]).normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48).replace(/-+$/, "") || "service";
}

/**
 * "sovereignty-assessment-report-bundid-2026-11-20-en.md" and the like; without a kind, the assessment
 * itself: "sovereignty-assessment-bundid-2026-11-20-en.json".
 */
export function exportFileName(kind, { service = "", date = "", lang = getLang(), ext = "json" } = {}) {
  return `${EXPORT_PREFIX}${[kind, service ? slugOf(service) : null, date || null, lang].filter(Boolean).join("-")}.${ext}`;
}

/** The report as Markdown in the active language; findings in another language are marked as such. */
export function reportMarkdownExport(report, lang = getLang()) {
  const p = reportParts(report, lang);
  const note = findingsNote(report, lang);
  return `${[p.findings, "", ...(note ? [`*${note}*`, ""] : []), p.closing].join("\n").trim()}\n`;
}

/** A line saying the findings keep the run's language, when it is not the active one; else null. */
function findingsNote(report, lang) {
  if (!report.lang || report.lang === lang) return null;
  const name = t(`lang.name.${report.lang}`, null, lang);
  return t("export.findingsLang", { lang: name }, lang);
}

/** The styles of the HTML report: Vici's light colours written out, system fonts, nothing loaded. */
const HTML_STYLE = `
:root { color-scheme: light; }
body { margin: 0; background: #fbf7f5; color: #250010; font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 32px 28px 48px; background: #ffffff; }
h1 { font-size: 28px; line-height: 1.2; margin: 0 0 6px; }
h2 { font-size: 21px; margin: 28px 0 8px; }
h3, h4 { font-size: 17px; margin: 20px 0 6px; }
p, li { max-width: 72ch; }
a { color: #8f2f42; }
blockquote { margin: 8px 0; padding: 2px 12px; border-left: 3px solid #d6c9c6; color: #5b4b4e; }
table { border-collapse: collapse; margin: 8px 0 16px; font-size: 15px; }
th, td { border-bottom: 1px solid #e7ddda; padding: 5px 10px; text-align: left; vertical-align: top; }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
.meta { color: #5b4b4e; margin: 0 0 4px; font-size: 14px; }
.tag { display: inline-block; padding: 1px 8px; border: 1px solid #8e7f80; font-size: 13px; }
.figures { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 18px 0 8px; }
.figures div { border: 1px solid #e7ddda; padding: 8px 10px; }
.figures dt { color: #5b4b4e; font-size: 13px; }
.figures dd { margin: 2px 0 0; font-weight: 700; font-size: 18px; }
figure { margin: 8px 0 0; }
figure svg { width: 100%; max-width: 620px; height: auto; display: block; }
figcaption { color: #5b4b4e; font-size: 14px; }
.spider .sp-ring { fill: none; stroke: #d6c9c6; stroke-width: 1; }
.spider .sp-ring--outer { stroke: #8e7f80; }
.spider .sp-tick { fill: #716163; font: 500 12px system-ui, sans-serif; }
.spider .sp-axis { stroke: #8e7f80; stroke-width: 1.25; }
.spider .sp-axis--dashed { stroke-dasharray: 5 5; }
.spider .sp-area { fill: #c2eaea; fill-opacity: 0.6; stroke: #006d70; stroke-width: 2.5; stroke-linejoin: round; }
.spider .sp-marker { fill: #006d70; stroke: #ffffff; stroke-width: 1.5; }
.spider .sp-value { fill: #250010; font: 700 16px system-ui, sans-serif; paint-order: stroke; stroke: #ffffff; stroke-width: 4px; stroke-linejoin: round; }
.spider .sp-label { fill: #250010; font: 500 14px system-ui, sans-serif; }
.spider .sp-label-muted { fill: #5b4b4e; font-style: italic; }
.findings { border-top: 1px solid #e7ddda; margin-top: 20px; }
.note { color: #5b4b4e; font-style: italic; }
footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e7ddda; color: #5b4b4e; font-size: 14px; }
@media print { body { background: #ffffff; } main { padding: 0; } }
`;

/**
 * The report as one self-contained HTML page in the active language. report: the Outbox's report;
 * result: the engine's result on screen (publicResult); meta: { service, asOf, sourceKey }.
 */
export function reportHtml(report, { lang = getLang(), result = null, service = "", asOf = "", sourceKey = "" } = {}) {
  const p = reportParts(report, lang);
  const findings = renderMarkdown(p.findings);
  findings.className = "findings";
  if (report.lang) findings.setAttribute("lang", report.lang);
  const closing = renderMarkdown(p.closing);
  closing.className = "closing";
  const title = t("export.html.title", { service }, lang);
  const facts = result?.facts || {};
  const parts = [];
  parts.push(`<header><h1>${escapeHtml(title)}</h1>`);
  parts.push(`<p class="meta">${escapeHtml([sourceKey ? t(sourceKey, { date: fmtDate(asOf, lang) }, lang) : fmtDate(asOf, lang), t("map.indicative", null, lang)].join(" · "))}</p>`);
  parts.push(`<p class="meta"><span class="tag">${escapeHtml(t("outbox.draftNote", null, lang))}</span></p></header>`);
  if (result) {
    const fig = (labelKey, text) => `<div><dt>${escapeHtml(t(labelKey, null, lang))}</dt><dd>${escapeHtml(text)}</dd></div>`;
    parts.push(`<dl class="figures">${[
      fig("kpi.overall.label", `${formatFact("score.overall", facts["score.overall"] ?? null, lang)} (${t("kpi.overall.note", null, lang)})`),
      fig("kpi.weakest.label", weakestText(result, lang)),
      fig("kpi.coverage.label", formatFact("coverage", facts.coverage ?? null, lang)),
      fig("kpi.exclusive.label", formatFact("share.exclusive_non_eu", facts["share.exclusive_non_eu"] ?? null, lang))
    ].join("")}</dl>`);
    const axes = LAYERS.map((l) => {
      const L = result.layers?.[l] || { score: null, status: "open" };
      return { id: l, lines: wrapWords(t(`layer.${l}`, null, lang), 22, 3), value: L.score, valueText: L.score === null ? t(`map.status.${L.status}`, null, lang) : fmtScore(L.score, lang), title: t(`layer.${l}.full`, null, lang) };
    });
    const svg = spiderSvg({ axes, kind: "layer", id: "export-spider", ticks: [25, 50, 75, 100].map((v) => ({ f: v / 100, text: fmtInt(v, lang) })), title: t("map.spider.layer", { service }, lang), desc: t("map.spider.desc", null, lang) });
    const rows = LAYERS.map((l) => {
      const L = result.layers?.[l] || { score: null, status: "open", blocks: 0, scored: 0 };
      return `<tr><th scope="row">${escapeHtml(t(`layer.${l}`, null, lang))}</th><td class="num">${escapeHtml(L.score === null ? t(`map.status.${L.status}`, null, lang) : fmtScore(L.score, lang))}</td><td class="num">${escapeHtml(t("map.blocksScored", { scored: fmtInt(L.scored ?? 0, lang), all: fmtInt(L.blocks ?? 0, lang) }, lang))}</td></tr>`;
    }).join("");
    parts.push(`<figure>${svg.outerHTML}<figcaption>${escapeHtml(t("map.spider.desc", null, lang))}</figcaption></figure>`);
    parts.push(`<table><caption>${escapeHtml(t("map.table.layers", null, lang))}</caption><thead><tr><th scope="col">${escapeHtml(t("map.col.layer", null, lang))}</th><th scope="col" class="num">${escapeHtml(t("map.col.score", null, lang))}</th><th scope="col" class="num">${escapeHtml(t("map.col.blocks", null, lang))}</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
  parts.push(findings.outerHTML);
  const note = findingsNote(report, lang);
  if (note) parts.push(`<p class="note">${escapeHtml(note)}</p>`);
  parts.push(closing.outerHTML);
  const footer = t("export.html.footer", { date: fmtDate(new Date().toISOString(), lang) }, lang);
  parts.push(`<footer>${escapeHtml(footer)}</footer>`);
  const head = [
    "<meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:\">",
    `<title>${escapeHtml(title)}</title>`,
    `<style>${HTML_STYLE}</style>`
  ].join("\n");
  return redactSecrets(`<!doctype html>\n<html lang="${lang === "de" ? "de" : "en"}">\n<head>\n${head}\n</head>\n<body>\n<main>\n${parts.join("\n")}\n</main>\n</body>\n</html>\n`);
}

/** An assessment as JSON text (the Assessment schema), with anything key-like redacted. */
export function assessmentJson(assessment) {
  return redactSecrets(`${JSON.stringify(assessment, null, 2)}\n`);
}
