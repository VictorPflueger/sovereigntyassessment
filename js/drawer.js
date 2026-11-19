// Bottom drawer shell: tabs, counts, open/close, and Vici's byline in the middle of the bar: "Built by",
// Victor's hexagon portrait and name, and his LinkedIn and website.
//
// Adapted from the shared shell for two languages (REVIEW.md, "Adapted shell modules"): every
// user-visible string comes from the app's i18n (t(), re-rendered through onLang()), and the app
// defines the tabs with configureDrawer() instead of the shell's fixed Options, Outbox and Audit.
// Everything else is the shared module's behaviour.

import { h } from "./dom.js";
import { icon } from "./icons.js";
import { t, onLang } from "./i18n/index.js";

let config = { tabs: [], labelKey: "drawer.label", noteKey: "drawer.note" };

/**
 * The app's tabs and texts: { tabs: [{ id, labelKey }], labelKey (the tab list's name), noteKey (the
 * note beside the toggle) }. Call once before createDrawer().
 */
export function configureDrawer({ tabs, labelKey = "drawer.label", noteKey = "drawer.note" }) {
  config = { tabs: tabs.map((x) => ({ ...x })), labelKey, noteKey };
}

/**
 * Vici's byline, as on all of Victor's pages. The portrait and LinkedIn's logo are Vici's files in
 * vici/assets/ (the content security policy allows no image from another site); either link opens
 * in a new tab, so a running demo is never left.
 */
function byline() {
  const label = h("span", { class: "vc-byline__label" }, t("drawer.builtBy"));
  const linkedin = h("a", { class: "vc-byline__icon", href: "https://www.linkedin.com/in/victorpflueger", target: "_blank", rel: "author noopener", "aria-label": t("drawer.linkedin") },
    h("img", { class: "vc-platform-mark", src: "vici/assets/marks/linkedin.png", alt: "", width: "840", height: "779" }));
  const website = h("a", { class: "vc-byline__icon", href: "https://victorpflueger.github.io/VIP/index.html", target: "_blank", rel: "author noopener", "aria-label": t("drawer.website") },
    h("span", { class: "vc-icon vc-icon--globe-hex", "aria-hidden": "true" }));
  const el = h("p", { class: "vc-byline" },
    label,
    h("span", { class: "vc-byline__person" },
      h("span", { class: "vc-avatar vc-avatar--xs" }, h("img", { src: "vici/assets/brand/portrait-96.jpg", alt: "", width: "96", height: "96" })),
      h("span", { class: "vc-byline__name" }, "Victor Pflüger")),
    h("span", { class: "vc-byline__links" }, linkedin, website));
  const relabel = () => {
    label.textContent = t("drawer.builtBy");
    linkedin.setAttribute("aria-label", t("drawer.linkedin"));
    website.setAttribute("aria-label", t("drawer.website"));
  };
  return { el, relabel };
}

export function createDrawer(root, { onToggle } = {}) {
  const tabs = new Map();
  const panels = new Map();
  // The bar holds three groups: the tabs on the left, the byline in the middle, the note and the
  // toggle on the right. Only the tabs form the tab list.
  const tabBar = h("div", { class: "drawer-tabs" });
  // Vici's tab list; this module owns the tabs (a click on the open tab closes the drawer), so the
  // list has no .vc-tabs around it for vici.js to bind.
  const tabList = h("div", { class: "vc-tabs__list drawer-tablist", role: "tablist", "aria-label": t(config.labelKey) });
  const body = h("div", { class: "drawer-body" });
  let active = config.tabs[0]?.id || null;
  let open = false;

  for (const tab of config.tabs) {
    const count = h("span", { class: "vc-badge count", hidden: true }, "0");
    const label = h("span", { class: "drawer-tab__label" }, t(tab.labelKey));
    const btn = h("button", {
      class: "drawer-tab", type: "button", role: "tab", id: `tab-${tab.id}`,
      "aria-selected": "false", "aria-controls": `panel-${tab.id}`
    }, label, count);
    btn.addEventListener("click", () => {
      if (open && active === tab.id) setOpen(false);
      else show(tab.id);
    });
    tabs.set(tab.id, { btn, count, label, labelKey: tab.labelKey });
    tabList.appendChild(btn);
    const panel = h("div", { class: "drawer-panel", id: `panel-${tab.id}`, role: "tabpanel", "aria-labelledby": `tab-${tab.id}`, hidden: true });
    panels.set(tab.id, panel);
    body.appendChild(panel);
  }

  const toggleBtn = h("button", { class: "vc-button vc-button--ghost button-compact drawer-toggle", type: "button", "aria-label": t("drawer.toggle") });
  const toggleFace = () => toggleBtn.replaceChildren(icon(open ? "chevronDown" : "chevronUp", 18), h("span", {}, t(open ? "drawer.hide" : "drawer.show")));
  toggleFace();
  toggleBtn.addEventListener("click", () => setOpen(!open));
  const note = h("span", { class: "drawer-note" }, icon("shield", 16), h("span", { class: "drawer-note__text" }, t(config.noteKey)));
  const credit = byline();
  tabBar.append(tabList, credit.el, h("div", { class: "drawer-end" }, note, toggleBtn));

  root.append(tabBar, body);
  root.dataset.open = "false";

  // A language change renames the tabs, the byline, the note and the toggle; counts and panels stay.
  onLang(() => {
    tabList.setAttribute("aria-label", t(config.labelKey));
    for (const tab of tabs.values()) tab.label.textContent = t(tab.labelKey);
    credit.relabel();
    note.querySelector(".drawer-note__text").textContent = t(config.noteKey);
    toggleBtn.setAttribute("aria-label", t("drawer.toggle"));
    toggleFace();
  });

  function show(id) {
    active = id;
    for (const [tid, tab] of tabs) tab.btn.setAttribute("aria-selected", String(tid === id));
    for (const [pid, p] of panels) p.hidden = pid !== id;
    setOpen(true);
  }

  function setOpen(v) {
    open = v;
    root.dataset.open = String(v);
    toggleFace();
    if (v) for (const [tid, tab] of tabs) tab.btn.setAttribute("aria-selected", String(tid === active));
    else for (const tab of tabs.values()) tab.btn.setAttribute("aria-selected", "false");
    if (v) for (const [pid, p] of panels) p.hidden = pid !== active;
    onToggle?.(v);
  }

  function setCount(id, n, attention = false) {
    const tab = tabs.get(id);
    if (!tab) return;
    tab.count.hidden = !n;
    tab.count.textContent = String(n);
    tab.count.dataset.tone = attention ? "attention" : "";
    // A count that needs your decision is a merlot badge; the others stay quiet.
    tab.count.classList.toggle("badge-quiet", !attention);
  }

  return { panel: (id) => panels.get(id), show, setOpen, setCount, isOpen: () => open, active: () => active };
}
