// AI label: Vici's feature tag (lilac, the sparkle and "AI") on everything the agent wrote, which opens a
// short explanation on click: a toggletip in Vici's popover look that stays open until you click
// elsewhere or press Escape. Adapted from the Timetable Translator's js/ai_label.js: the words come from
// the i18n dictionaries and say what this app's code guarantees. Lilac is the AI's colour throughout;
// merlot stays with the person's decisions.

import { bus } from "./events.js";
import { h } from "./dom.js";
import { icon } from "./icons.js";
import { t } from "./i18n/index.js";
import { MODELS } from "./config.js";

let run = { mode: null, model: null, source: null };
bus.on("run_start", (ev) => {
  const p = ev.payload || {};
  run = { mode: p.mode, model: MODELS.find((m) => m.id === p.model)?.label || null, source: p.source || null };
});

function author() {
  if (run.mode === "live") return t("ai.author.live", { model: run.model || "Claude" });
  if (run.source === "recorded") return t("ai.author.recorded");
  return t("ai.author.hand");
}

const KINDS = ["narration", "profile", "block", "review", "levers", "memo", "report"];

let openTip = null;
function closeOpen() { openTip?.close(); }
document.addEventListener("pointerdown", (e) => { if (openTip && !openTip.contains(e.target)) closeOpen(); }, true);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && openTip) { const btn = openTip.button; closeOpen(); btn?.focus(); } });
window.addEventListener("resize", closeOpen);
for (const type of ["wheel", "touchmove"]) document.addEventListener(type, closeOpen, { capture: true, passive: true });

let counter = 0;

/** An AI label for `kind`; the explanation reflects the current run and the active language. */
export function aiLabel(kind = "narration") {
  const k = KINDS.includes(kind) ? kind : "narration";
  const id = `ai-tip-${++counter}`;
  const button = h("button", {
    class: "ai-label", type: "button", "aria-expanded": "false", "aria-controls": id,
    "aria-label": t("ai.label.aria"), title: t("ai.label.title"),
    "data-i18n-attr": "aria-label:ai.label.aria; title:ai.label.title"
  }, h("span", { class: "vc-tag vc-tag--feature ai-label-chip", "aria-hidden": "true" }, icon("spark", 14), "AI"));
  const tip = h("div", { class: "vc-popover ai-tip", id, role: "note", hidden: true });
  const wrap = h("span", { class: "ai-label-wrap" }, button, tip);
  wrap.button = button;

  wrap.close = () => {
    tip.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (openTip === wrap) openTip = null;
  };

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!tip.hidden) return wrap.close();
    closeOpen();
    tip.replaceChildren(h("strong", {}, t(`ai.kind.${k}`)), h("p", {}, author()), h("p", {}, t(`ai.kind.${k}.text`)), h("p", {}, t("ai.engine")));
    tip.hidden = false;
    // Fixed position next to the label, kept on screen; no clipping inside scrolling panels.
    const r = button.getBoundingClientRect();
    const w = Math.min(340, window.innerWidth - 24);
    tip.style.width = `${w}px`;
    tip.style.left = `${Math.max(12, Math.min(r.right - w, window.innerWidth - w - 12))}px`;
    const below = r.bottom + 6;
    const height = tip.offsetHeight;
    tip.style.top = `${below + height > window.innerHeight - 12 ? Math.max(12, r.top - height - 6) : below}px`;
    button.setAttribute("aria-expanded", "true");
    openTip = wrap;
  });
  return wrap;
}

/** A small EN or DE tag on model-written text whose language is not the interface's (brief §5). */
export function langTag(lang) {
  return h("span", { class: "vc-tag lang-tag", lang, title: t(`lang.tag.${lang}`), "data-i18n-attr": `title:lang.tag.${lang}` }, lang.toUpperCase());
}
