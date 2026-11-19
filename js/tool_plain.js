// One plain sentence per tool call for the console (brief §4, run model): what the agent does, in the
// active language, and what came of it. Written by code from the tool's input and result, so the lines
// follow a language switch; the model's own words (a block's name, a search query) stay as written.

import { t, tn } from "./i18n/index.js";
import { fmtInt } from "./format.js";

const layerName = (id, lang) => t(`layer.${id}`, null, lang);
const cls = (c, lang) => t(`class.${c || "UNKNOWN"}.short`, null, lang);

/** The sentence for a tool call as it starts. */
export function toolLine(name, input = {}, lang) {
  switch (name) {
    case "web_search": return t("tool.web_search", { query: input.query || "" }, lang);
    case "web_fetch": return t("tool.web_fetch", { url: input.url || "" }, lang);
    case "cat_lookup": return t("tool.cat_lookup", { query: input.query || "" }, lang);
    case "ref_facts": return t("tool.ref_facts", { topic: t(`topic.${input.topic}`, null, lang) }, lang);
    case "rec_profile": return t("tool.rec_profile", null, lang);
    case "rec_block": return t("tool.rec_block", { name: input.name || "", layer: layerName(input.layer, lang) }, lang);
    case "rec_block_update": return t("tool.rec_block_update", { block: input.block_id || "" }, lang);
    case "rec_block_remove": return t("tool.rec_block_remove", { block: input.block_id || "" }, lang);
    case "rec_layer": return t(`tool.rec_layer.${input.status === "not_applicable" ? "not_applicable" : "no_evidence"}`, { layer: layerName(input.layer, lang) }, lang);
    case "eng_score": return t("tool.eng_score", null, lang);
    case "eng_whatif": return t("tool.eng_whatif", { lever: input.lever_id || "" }, lang);
    case "ui_choose_service": return t("tool.ui_choose_service", null, lang);
    case "ui_request_review": return t("tool.ui_request_review", null, lang);
    case "ui_propose_levers": return tn("tool.ui_propose_levers", (input.levers || []).length, null, lang);
    case "ui_draft_memo": return t("tool.ui_draft_memo", null, lang);
    case "ui_final_report": return t("tool.ui_final_report", null, lang);
    default: return t("tool.other", { name }, lang);
  }
}

/** What came of a tool call: one short clause, or the refusal. */
export function toolOutcome(name, input = {}, result = {}, ok = true, lang) {
  const r = result || {};
  // A server tool's failure is reported by Anthropic's servers inside its result; a client tool's refusal
  // is code's, with the reason sent to the agent.
  if (!ok) return name === "web_search" || name === "web_fetch" ? t("tool.failed", { code: r.error || "unavailable" }, lang) : t("tool.refused", null, lang);
  switch (name) {
    case "web_search": return r.error ? t("tool.failed", { code: r.error }, lang) : tn("tool.web_search.ok", (r.results || []).length, null, lang);
    case "web_fetch": return r.error ? t("tool.failed", { code: r.error }, lang) : t(r.pdf ? "tool.web_fetch.pdf" : "tool.web_fetch.ok", { title: r.title || r.url || "" }, lang);
    case "cat_lookup": return (r.entries || []).length ? t("tool.cat_lookup.ok", { names: r.entries.map((e) => e.names?.[lang] || e.id).join(", ") }, lang) : t("tool.cat_lookup.none", null, lang);
    case "ref_facts": return tn("tool.ref_facts.ok", (r.facts || []).length, null, lang);
    case "rec_profile": return (r.unverified_fields || []).length ? tn("tool.rec_profile.partly", r.unverified_fields.length, null, lang) : t("tool.rec_profile.ok", null, lang);
    case "rec_block":
    case "rec_block_update": {
      const vars = { block: r.block_id, made: cls(r.made_in, lang), run: cls(r.run_by, lang), level: fmtInt(r.level, lang), n: (r.unknown_fields || []).length };
      if (r.unscored) return t("tool.rec_block.gap", vars, lang);
      return t(r.partly_unknown ? "tool.rec_block.partly" : "tool.rec_block.ok", vars, lang);
    }
    case "rec_block_remove": return t("tool.rec_block_remove.ok", null, lang);
    case "rec_layer": return t("tool.rec_layer.ok", null, lang);
    case "eng_score": return (r.open_layers || []).length ? tn("tool.eng_score.open", r.open_layers.length, null, lang) : t("tool.eng_score.ok", null, lang);
    case "eng_whatif": return t("tool.eng_whatif.ok", null, lang);
    case "ui_choose_service": return r.chosen ? t("tool.ui_choose_service.ok", { name: r.chosen.name }, lang) : t("tool.ui_choose_service.none", null, lang);
    case "ui_request_review": return t(`tool.ui_request_review.${r.action === "skip" ? "skip" : "confirm"}`, { n: fmtInt((r.corrections || []).length, lang) }, lang);
    case "ui_propose_levers": return r.decision === "keep" ? t("tool.ui_propose_levers.keep", null, lang) : t("tool.ui_propose_levers.ok", { lever: r.decision || "" }, lang);
    case "ui_draft_memo": return t("tool.ui_draft_memo.ok", null, lang);
    case "ui_final_report": return t("tool.ui_final_report.ok", null, lang);
    default: return t("tool.done", null, lang);
  }
}
