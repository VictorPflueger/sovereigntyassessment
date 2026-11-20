// The drawer's Levers tab (brief §9; AC-15): at most three levers plus "Keep as is", each a card with its
// what-if score, the change and the weakest critical link afterwards, priced by the engine on a copy of
// the blocks (the assessment never changes). The person chooses one card, then the one merlot Approve,
// which needs a choice. Lever cards carry the AI label: the agent proposed them; the figures are code's.

import { bus } from "./events.js";
import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { t, onLang, getLang } from "./i18n/index.js";
import { formatFact, renderFacts } from "./facts.js";
import { aiLabel, langTag } from "./ai_label.js";

export function createLeversPanel(panel) {
  const state = { set: null, choice: null, decided: null, lang: "en" };
  const emptyEl = h("div", { class: "vc-empty empty" },
    tx("drawer.emptyTitle.levers", null, { tag: "strong", cls: "vc-empty__title" }),
    tx("drawer.empty.levers", null, { tag: "p", cls: "vc-empty__text" }));
  const body = h("div", { class: "panel-body levers-body" });
  panel.append(emptyEl, body);

  const f = (facts, key) => formatFact(key, facts?.[key] ?? null);

  function changeText(c) {
    const parts = [];
    if (c.made_in) parts.push(t("levers.change.madeIn", { cls: t(`class.${c.made_in}`) }));
    if (c.run_by) parts.push(t("levers.change.runBy", { cls: t(`class.${c.run_by}`) }));
    if (c.hosting) parts.push(t("levers.change.hosting", { value: t(`value.hosting.${c.hosting}`) }));
    if (c.licence) parts.push(t("levers.change.licence", { value: t(`value.licence.${c.licence}`) }));
    return `${c.block_id}: ${parts.join("; ")}`;
  }

  function card(id, { title, rationale, changes, evidence, facts, keep }) {
    const lang = getLang();
    const chosen = state.choice === id;
    const p = keep ? "" : `whatif.${id}.`;
    const radio = h("input", { type: "radio", name: "lever-choice", value: id, class: "lever-radio", disabled: !!state.decided });
    radio.checked = chosen;
    radio.addEventListener("change", () => { state.choice = id; render(); });
    const weakest = facts?.[`${p}weakest.block`]
      ? t("levers.weakest", { block: facts[`${p}weakest.block`], level: f(facts, keep ? "weakest.level" : `${p}weakest.level`) })
      : t("levers.weakestNone");
    return h("label", { class: "vc-card lever-card", dataset: { lever: id, chosen: chosen ? "true" : "false", keep: keep ? "true" : "false" } },
      h("div", { class: "lever-head" }, radio,
        h("span", { class: "lever-id" }, keep ? t("levers.keep") : id),
        keep ? null : h("span", { class: "lever-title", lang: state.lang }, renderFacts(title, { ...(state.set?.values || {}), ...facts }, state.lang)),
        keep ? null : aiLabel("levers"),
        !keep && state.lang !== lang ? langTag(state.lang) : null),
      keep ? h("p", { class: "lever-rationale" }, t("levers.keepText")) : h("p", { class: "lever-rationale", lang: state.lang }, renderFacts(rationale, { ...(state.set?.values || {}), ...facts }, state.lang)),
      h("dl", { class: "lever-figures" },
        h("div", {}, h("dt", {}, t(keep ? "levers.overallNow" : "levers.overallAfter")), h("dd", { class: "vc-tabular", dataset: { fact: keep ? "score.overall" : `${p}overall` } }, f(facts, keep ? "score.overall" : `${p}overall`), keep ? null : h("span", { class: "lever-delta" }, ` (${f(facts, `${p}delta`)})`))),
        h("div", {}, h("dt", {}, t("levers.weakestLabel")), h("dd", {}, weakest)),
        h("div", {}, h("dt", {}, t("levers.exclusive")), h("dd", { class: "vc-tabular" }, f(facts, keep ? "share.exclusive_non_eu" : `${p}exclusive_non_eu`)))),
      keep ? null : h("ul", { class: "lever-changes" }, ...(changes || []).map((c) => h("li", {}, changeText(c)))),
      keep || !evidence?.length ? null : h("p", { class: "lever-evidence" }, icon(evidence.some((e) => e.verified) ? "check" : "alert", 14),
        t(evidence.some((e) => e.verified) ? "levers.evidenceVerified" : "levers.evidenceUnverified"), " ",
        ...evidence.map((e) => h("a", { href: e.url, target: "_blank", rel: "noopener noreferrer" }, e.title || e.url))));
  }

  function render() {
    emptyEl.hidden = !!state.set;
    clear(body);
    if (!state.set) return;
    const s = state.set;
    body.append(h("p", { class: "levers-lead" }, t(state.decided ? "levers.decided" : "levers.lead")));
    const cards = h("div", { class: "lever-cards", role: "radiogroup", "aria-label": t("levers.group") });
    for (const l of s.levers) cards.append(card(l.lever_id, { title: l.title, rationale: l.rationale, changes: l.changes, evidence: l.evidence, facts: l.whatif.facts }));
    cards.append(card("keep", { facts: s.keep.facts, keep: true }));
    body.append(cards);
    if (state.decided) {
      body.append(h("p", { class: "levers-done vc-alert" }, icon("check", 18), state.decided === "keep" ? t("levers.doneKeep") : t("levers.done", { lever: state.decided })));
      return;
    }
    const approve = h("button", { class: "vc-button vc-button--primary lever-approve", type: "button", id: "btn-approve-lever", disabled: !state.choice, "aria-disabled": state.choice ? "false" : "true" }, icon("check", 18), t("levers.approve"));
    const why = h("p", { class: "levers-why" }, state.choice ? t("levers.approveHint", { choice: state.choice === "keep" ? t("levers.keep") : state.choice }) : t("levers.needChoice"));
    approve.addEventListener("click", () => {
      if (!state.choice || state.decided) return;
      state.decided = state.choice;
      bus.emit("lever_decision", { options_seq: s.options_seq, lever_id: state.choice, by: "user" });
      render();
    });
    body.append(h("div", { class: "levers-footer" }, approve, why));
  }

  bus.on("run_start", (ev) => { state.set = null; state.choice = null; state.decided = null; state.lang = ev.payload?.lang || "en"; render(); });
  bus.on("levers", (ev) => { state.set = ev.payload; state.choice = null; state.decided = null; render(); });
  onLang(render);
  render();
  return { pending: () => !!state.set && !state.decided };
}
