// The memo and the report as the Outbox shows them (brief §7 and §9): the agent's text with its
// placeholders rendered, and the parts code writes around it in the run's language: the memo's header,
// its before-and-after figures and "Draft. Nothing is sent."; the report's reviewer corrections, the
// person's decision, the sources and the method line. A pre-run's memo comes from a template here, so the
// person may choose any lever (brief §8: a recording holds no text that depends on the person's choice).

import { t } from "./i18n/index.js";
import { renderFacts, formatFact } from "./facts.js";
import { fmtDate, fmtWeight } from "./format.js";
import { LAYERS } from "./engine.js";

/** The layer weights as a line of text when they are not all equal (the person's assumption), else null. */
export function weightsLine(weights, lang) {
  if (!weights) return null;
  const values = LAYERS.map((l) => Number(weights[l] ?? 1));
  if (values.every((v) => v === values[0])) return null;
  return t("report.weights", { list: LAYERS.map((l, i) => t("report.weights.item", { layer: t(`layer.${l}.short`, null, lang), weight: fmtWeight(values[i], lang) }, lang)).join(", ") }, lang);
}

/** A party as text: "Governikus GmbH & Co. KG (DE)", with its parent; null is unknown. */
export function partyText(p, lang) {
  if (!p || (p.country === "UNKNOWN" && /^(unknown|unbekannt)?$/i.test(String(p.name || "").trim()) && !p.parent)) return t("value.unknown", null, lang);
  const own = `${p.name} (${p.country})`;
  return p.parent ? t("value.partyParent", { party: own, parent: `${p.parent.name} (${p.parent.country})` }, lang) : own;
}

/** A field's value as text in a language. */
export function valueText(field, value, lang) {
  if (field === "tech" || field === "operator") return partyText(value, lang);
  if (value === null || value === undefined) return t("value.unknown", null, lang);
  return t(`value.${field}.${value}`, null, lang);
}

/** The memo of a pre-run for the person's choice, in the run's language. */
export function memoTemplate(leverSet, decision, lang) {
  const lever = leverSet?.levers?.find((l) => l.lever_id === decision) || null;
  if (!lever) {
    return { subject: t("memo.sim.subject.keep", null, lang), body: t("memo.sim.body.keep", null, lang) };
  }
  return {
    subject: t("memo.sim.subject.lever", { title: lever.title }, lang),
    body: t("memo.sim.body.lever", { title: lever.title, rationale: lever.rationale }, lang)
  };
}

const fact = (values, key, lang) => formatFact(key, values?.[key] ?? null, lang);

/** The memo as Markdown, in its own language. */
export function memoMarkdown(memo, lang = memo.lang) {
  const before = memo.before || {};
  const after = memo.after || null;
  const id = memo.lever_id;
  const overall = after
    ? t("memo.fig.overall.after", { before: fact(before, "score.overall", lang), after: fact(after, "whatif." + id + ".overall", lang), delta: fact(after, "whatif." + id + ".delta", lang) }, lang)
    : t("memo.fig.overall.now", { before: fact(before, "score.overall", lang) }, lang);
  const exclusive = after
    ? t("memo.fig.exclusive.after", { before: fact(before, "share.exclusive_non_eu", lang), after: fact(after, "whatif." + id + ".exclusive_non_eu", lang) }, lang)
    : t("memo.fig.exclusive.now", { before: fact(before, "share.exclusive_non_eu", lang) }, lang);
  const choice = id === "keep" ? t("memo.choice.keep", null, lang) : t("memo.choice.lever", { id, title: memo.lever_title || id }, lang);
  const lines = [
    "# " + renderFacts(memo.subject, memo.values, lang),
    "",
    t("memo.header", { service: memo.service, date: fmtDate(memo.date, lang) }, lang),
    "",
    choice,
    "",
    renderFacts(memo.body, memo.values, lang),
    "",
    "## " + t("memo.figures", null, lang),
    "",
    "- " + overall,
    "- " + weakestLine(before, after, id, lang),
    "- " + exclusive,
    ...(weightsLine(memo.weights, lang) ? ["- " + weightsLine(memo.weights, lang)] : []),
    "",
    "*" + t("memo.indicative", null, lang) + "*",
    "",
    "**" + t("outbox.draftNote", null, lang) + "**"
  ];
  return lines.join("\n");
}

function weakestText(values, prefix, lang) {
  const block = values?.[`${prefix}weakest.block`];
  if (!block) return t("memo.weakest.none", null, lang);
  return t("memo.weakest.at", { block, level: formatFact("weakest.level", values[`${prefix}weakest.level`], lang) }, lang);
}

function weakestLine(before, after, id, lang) {
  const now = weakestText(before, "", lang);
  return after
    ? t("memo.fig.weakest.after", { before: now, after: weakestText(after, `whatif.${id}.`, lang) }, lang)
    : t("memo.fig.weakest.now", { before: now }, lang);
}

/** The report as Markdown: the agent's findings, then the parts code writes (reportParts). */
export function reportMarkdown(report, lang = report.lang) {
  const p = reportParts(report, lang);
  return [p.findings, "", p.closing].join("\n");
}

/**
 * The report's two parts as Markdown: the agent's findings in the language they were written in, with
 * their figures rendered in it, and the parts code writes in `lang` (the Outbox: the run's language; an
 * export: the active language, brief §5): the reviewer's corrections, the decision, the layer weights
 * when a person changed them, the sources, the method line and "Draft. Nothing is sent."
 */
export function reportParts(report, lang = report.lang) {
  const c = report.closing || {};
  const findings = renderFacts(report.markdown, report.values, report.lang || lang).trim();
  const out = [];
  if (report.outcome === "assessed") {
    out.push("## " + t("report.corrections", null, lang), "");
    if (c.corrections?.length) {
      for (const k of c.corrections) {
        out.push("- " + t("report.correction", { block: k.block_id, field: t("field." + k.field, null, lang), from: valueText(k.field, k.from, lang), to: valueText(k.field, k.to, lang), reason: k.reason }, lang));
      }
    } else {
      out.push(t(c.review === "skip" ? "report.reviewSkipped" : "report.noCorrections", null, lang));
    }
    out.push("", "## " + t("report.decision", null, lang), "");
    const id = c.decision?.lever_id;
    if (id && id !== "keep") {
      const facts = c.decision.facts || {};
      out.push(t("report.decision.lever", { id, title: c.decision.title || id, after: formatFact("whatif." + id + ".overall", facts["whatif." + id + ".overall"] ?? null, lang), delta: formatFact("whatif." + id + ".delta", facts["whatif." + id + ".delta"] ?? null, lang) }, lang));
    } else {
      out.push(t("report.decision.keep", null, lang));
    }
    out.push("");
  }
  const weights = weightsLine(c.weights, lang);
  if (weights) out.push("## " + t("report.assumptions", null, lang), "", weights, "");
  if (c.sources?.length) {
    out.push("## " + t("report.sources", null, lang), "");
    for (const s of c.sources) {
      const mark = t(s.verified ? "report.source.verified" : "report.source.unverified", null, lang);
      const quote = s.quote ? " " + t("report.source.quote", { quote: s.quote }, lang) : "";
      const read = t("report.source.read", { date: fmtDate(s.read_on, lang) }, lang);
      out.push("- [" + (s.title || s.url) + "](" + s.url + ")" + quote + " (" + read + "; " + mark + ")");
    }
    out.push("");
  }
  out.push("*" + t("report.footer", { date: fmtDate(c.as_of, lang), method: c.method_version || "" }, lang) + "*", "", "**" + t("outbox.draftNote", null, lang) + "**");
  return { findings, closing: out.join("\n") };
}
