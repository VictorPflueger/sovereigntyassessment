// The centrepiece's three views (brief §9; PLAN.md f.1: "Compare and Portfolio are views of the same
// area"): the assessment (the catalogue before a run, the sovereignty map during and after one),
// Compare and the Portfolio. One switch, three toggle buttons with aria-pressed, sits in the head of
// whichever view shows, so it never costs a row of its own. A run that starts brings the assessment back.

import { h } from "./dom.js";
import { icon } from "./icons.js";
import { t, onLang } from "./i18n/index.js";

export const CENTRE_VIEWS = Object.freeze(["assessment", "compare", "portfolio"]);
const ICON = { assessment: "honeycomb", compare: "layers", portfolio: "chart" };

/**
 * host: the map element. parts: { catalogue, map, compare, portfolio } (sections, each with a
 * .view-slot in its head). onShow(view): called after a switch, for the view to draw itself.
 */
export function createCentre(host, parts, { onShow } = {}) {
  const state = { view: "assessment", part: "catalogue" };
  const buttons = new Map();
  const group = h("div", { class: "segmented centre-views", role: "group", id: "centre-views" });
  for (const v of CENTRE_VIEWS) {
    const b = h("button", { type: "button", "aria-pressed": "false", dataset: { centre: v } });
    b.addEventListener("click", () => show(v));
    buttons.set(v, b);
    group.append(b);
  }

  function label() {
    group.setAttribute("aria-label", t("centre.label"));
    for (const [v, b] of buttons) {
      b.replaceChildren(icon(ICON[v], 16), h("span", { class: "centre-label" }, t(`centre.${v}`)));
      b.title = t(`centre.${v}.title`);
      b.setAttribute("aria-pressed", v === state.view ? "true" : "false");
    }
  }

  function apply() {
    const assessment = state.view === "assessment";
    parts.catalogue.hidden = !(assessment && state.part === "catalogue");
    parts.map.hidden = !(assessment && state.part === "map");
    parts.compare.hidden = state.view !== "compare";
    parts.portfolio.hidden = state.view !== "portfolio";
    host.dataset.view = assessment ? state.part : state.view;
    const visible = assessment ? parts[state.part] : parts[state.view];
    const slot = visible?.querySelector(".view-slot");
    if (slot && group.parentElement !== slot) slot.append(group);
    for (const [v, b] of buttons) b.setAttribute("aria-pressed", v === state.view ? "true" : "false");
  }

  /** Shows a view; a second click on the view that shows keeps it. */
  function show(view) {
    if (!CENTRE_VIEWS.includes(view)) return;
    const changed = view !== state.view;
    state.view = view;
    apply();
    if (changed) onShow?.(view);
  }

  onLang(label);
  label();
  apply();

  return {
    show,
    view: () => state.view,
    /** The assessment view's part: "catalogue" before a run, "map" once a run shows. */
    setPart(part) {
      state.part = part === "map" ? "map" : "catalogue";
      apply();
    },
    el: group
  };
}
