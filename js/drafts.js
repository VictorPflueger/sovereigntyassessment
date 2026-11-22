// The memo of a pre-run (brief §8): a recording holds no text that depends on the person's choice, so the
// memo the replayed agent drafts comes from a template here, for whichever lever the person approves.
// Until 1.0.0 this file also wrote the Outbox's memo and report as Markdown; 2.0.0 shows the memo on
// the page (js/view.js) and took the Outbox and the exports off it.

import { t } from "./i18n/index.js";

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
