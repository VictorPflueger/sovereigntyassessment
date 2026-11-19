// Control bar: the service field with suggestions from the catalogue, Start agent, the model, the
// replay speed, the run's status, Abort, Reset and Diagnostics. Every word is an i18n key; the status
// pill and the model's name are written again after a language switch through update().

import { h, setDisabled, isDisabled, withTooltip } from "./dom.js";
import { icon } from "./icons.js";
import { tx, attrs, retext } from "./text.js";
import { t, getLang } from "./i18n/index.js";
import { MODELS } from "./config.js";
import { isRunning, isFinished } from "./state.js";
import { runStateLabel, onAwaitedChange } from "./handover.js";
import { lookup } from "./catalogue.js";
import { inLang } from "./catalogue_view.js";

const STATE_TONE = {
  idle: "", understanding: "active", awaiting_choice: "waiting", researching: "active", scoring: "active",
  awaiting_review: "waiting", recommending: "active", awaiting_decision: "waiting", drafting: "active",
  done: "done", stopped: "stopped", aborted: "stopped", error: "stopped"
};
// The status pill is a Vici tag in its tone, with a mark of its own and its words: ink while the
// agent works (a pulsing hexagon), merlot when it waits for you, success when done, danger when stopped.
const TONE_TAG = { "": "", active: "", waiting: "vc-tag--accent", done: "vc-tag--success", stopped: "vc-tag--danger" };

/**
 * handlers: { onServiceInput(text), onPickEntry(entry), onStart, onSelectModel(id), onSpeed(n),
 * onAbort, onReset, onDiagnostics }
 */
export function createControls(root, handlers) {
  const field = serviceField(handlers);

  const startBtn = h("button", { class: "vc-button", type: "button", id: "btn-start" }, icon("play", 18), tx("controls.start", null, { cls: "start-text" }));
  startBtn.addEventListener("click", () => { if (!isDisabled(startBtn)) handlers.onStart(); });

  const modelDd = dropdown({
    id: "model",
    captionKey: "controls.model",
    width: 210,
    items: MODELS.map((m) => ({ id: m.id, title: m.label, hintKey: m.hintKey })),
    onSelect: (id) => handlers.onSelectModel(id)
  });

  const speeds = [1, 2, 4];
  const speedBtns = speeds.map((n) => {
    const b = h("button", { type: "button", "aria-pressed": "false", dataset: { speed: String(n) } }, `×${n}`);
    b.setAttribute("aria-label", t("controls.speed.one", { n }));
    b.addEventListener("click", () => { if (!isDisabled(speedGroup)) handlers.onSpeed(n); });
    return b;
  });
  const speedGroup = h("div", { class: "segmented", role: "group", id: "speed-group" }, speedBtns);
  attrs(speedGroup, { "aria-label": "controls.speed.group" });

  const pillText = h("span", { class: "text" }, "");
  const pill = h("div", { class: "vc-tag status-pill", role: "status", "aria-live": "polite", id: "status-pill" }, h("span", { class: "dot", "aria-hidden": "true" }), pillText);

  const abortBtn = h("button", { class: "vc-button vc-button--danger", type: "button", id: "btn-abort" }, icon("stop", 18), tx("controls.abort"));
  abortBtn.addEventListener("click", () => { if (!isDisabled(abortBtn)) handlers.onAbort(); });
  // Reset and Diagnostics lose their words on laptop screens: their tooltips name them then.
  const resetBtn = h("button", { class: "vc-button vc-button--outline", type: "button", id: "btn-reset" }, icon("reset", 18), tx("controls.reset", null, { cls: "btn-text" }));
  attrs(resetBtn, { title: "controls.reset.title" });
  resetBtn.addEventListener("click", () => handlers.onReset());
  const diagBtn = h("button", { class: "vc-button vc-button--ghost", type: "button", id: "btn-diagnostics" }, icon("pulse", 18), tx("controls.diagnostics", null, { cls: "btn-text" }));
  attrs(diagBtn, { title: "controls.diagnostics.title" });
  diagBtn.addEventListener("click", () => handlers.onDiagnostics());

  root.append(
    field.el,
    startBtn,
    h("span", { class: "control-group" }, modelDd.el),
    h("span", { class: "control-group" }, tx("controls.replay", null, { cls: "control-label" }), speedGroup),
    h("span", { class: "spacer" }),
    pill,
    abortBtn,
    withTooltip(resetBtn, tx("controls.reset"), { below: true }),
    withTooltip(diagBtn, tx("controls.diagnostics"), { below: true })
  );

  // The pill names the step the run waits for; that can change without a new run state.
  let shownState = "idle";
  onAwaitedChange(() => { pillText.textContent = runStateLabel(shownState); });

  function update(s) {
    const running = isRunning(s);
    const finished = isFinished(s);
    const sim = s.mode === "simulation";
    const live = s.mode === "live";

    retext(startBtn.querySelector(".start-text"), finished ? "controls.newRun" : "controls.start");
    setDisabled(startBtn, running, t("controls.locked.running"));
    field.setDisabled(running);
    field.setValue(s.service?.text || "");

    const model = MODELS.find((m) => m.id === s.model) || MODELS[0];
    modelDd.setValue(model.id, model.label);
    modelDd.setDisabled(running || (sim && !finished), running ? t("controls.locked.agent") : t("controls.locked.liveOnly"));

    speedGroup.setAttribute("aria-disabled", String(live));
    speedGroup.title = live ? t("controls.speed.liveTitle") : t("controls.speed.title");
    for (const [i, b] of speedBtns.entries()) {
      b.setAttribute("aria-pressed", String(speeds[i] === s.speed));
      b.setAttribute("aria-label", t("controls.speed.one", { n: speeds[i] }));
    }

    setDisabled(abortBtn, !running, t("controls.abort.none"));

    pill.dataset.tone = STATE_TONE[s.runState] || "";
    pill.className = ["vc-tag", TONE_TAG[pill.dataset.tone], "status-pill"].filter(Boolean).join(" ");
    pillText.textContent = runStateLabel(s.runState);
    shownState = s.runState;
    modelDd.relabel();
  }

  return { update, focusService: () => field.focus(), field };
}

// ---- the service field: a combobox with the catalogue's suggestions -----------------------------

function serviceField({ onServiceInput, onPickEntry, onStart }) {
  const input = h("input", {
    class: "vc-input service-input", id: "service-input", type: "text", autocomplete: "off", spellcheck: "false",
    role: "combobox", "aria-autocomplete": "list", "aria-expanded": "false", "aria-controls": "service-suggestions",
    maxlength: "120"
  });
  attrs(input, { placeholder: "controls.service.placeholder", "aria-label": "controls.service.label" });
  const list = h("ul", { class: "vc-menu service-suggestions", id: "service-suggestions", role: "listbox", hidden: true });
  attrs(list, { "aria-label": "controls.service.suggestions" });
  let options = [];
  let active = -1;

  function close() {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    active = -1;
  }

  function open(query) {
    const lang = getLang();
    options = lookup(query, { limit: 6 }).map((x) => x.entry);
    list.replaceChildren(...options.map((entry, i) => {
      const li = h("li", {
        class: "vc-menu__item service-option", role: "option", id: `service-option-${entry.id}`,
        "aria-selected": "false", dataset: { entry: entry.id }
      },
      h("span", { class: "menu-title" }, inLang(entry.names, lang)),
      tx(`catalogue.cat.${entry.category}`, null, { cls: "menu-hint" }));
      // mousedown keeps the focus in the field, so the choice is made before it would blur.
      li.addEventListener("mousedown", (e) => { e.preventDefault(); choose(i); });
      return li;
    }));
    if (!options.length) { close(); return; }
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    move(-1);
  }

  function move(i) {
    active = i;
    [...list.children].forEach((li, j) => li.setAttribute("aria-selected", String(j === active)));
    if (active >= 0) {
      input.setAttribute("aria-activedescendant", list.children[active].id);
      list.children[active].scrollIntoView?.({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  }

  function choose(i) {
    const entry = options[i];
    if (!entry) return;
    input.value = inLang(entry.names);
    close();
    onPickEntry?.(entry);
  }

  input.addEventListener("input", () => {
    onServiceInput?.(input.value);
    if (input.value.trim()) open(input.value);
    else close();
  });
  input.addEventListener("keydown", (e) => {
    const shown = !list.hidden && options.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!shown) open(input.value);
      else move((active + 1) % options.length);
    } else if (e.key === "ArrowUp" && shown) {
      e.preventDefault();
      move((active - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      // Cancelled, so the key press does not also reach the button the next dialog focuses.
      e.preventDefault();
      if (shown && active >= 0) choose(active);
      else { close(); onStart?.(); }
    } else if (e.key === "Escape" && shown) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });
  input.addEventListener("blur", () => setTimeout(close, 0));

  const el = h("div", { class: "service-field" }, input, list);
  return {
    el,
    setValue(text) { if (document.activeElement !== input && input.value !== text) input.value = text; },
    setDisabled(disabled) { input.disabled = !!disabled; if (disabled) close(); },
    focus() { input.focus(); }
  };
}

// ---- dropdown ------------------------------------------------------------------------------------

function dropdown({ id, captionKey, items, onSelect, width }) {
  const valueEl = h("span", { class: "value" }, "");
  const captionEl = h("span", { class: "caption" }, tx(captionKey), ":");
  const toggle = h("button", {
    class: "vc-button vc-button--outline dropdown-toggle", type: "button", id: `dd-${id}`,
    "aria-haspopup": "menu", "aria-expanded": "false", style: width ? { minWidth: `${Math.min(width, 360)}px` } : undefined
  }, captionEl, valueEl, icon("chevronDown", 16));
  // Vici's menu, opened and closed by this module (no popover attribute: vici.js leaves it alone).
  const menu = h("div", { class: "vc-menu dropdown-menu", role: "menu", "aria-labelledby": `dd-${id}`, hidden: true });
  const itemEls = new Map();

  for (const it of items) {
    const el = h("button", { class: "vc-menu__item", type: "button", role: "menuitemradio", "aria-checked": "false", dataset: { id: it.id } },
      h("span"),
      h("span", { class: "menu-text" }, h("span", { class: "menu-title" }, it.title), it.hintKey ? tx(it.hintKey, null, { cls: "menu-hint" }) : null),
      h("span"));
    el.addEventListener("click", () => {
      if (isDisabled(el)) return;
      close();
      onSelect(it.id);
      toggle.focus();
    });
    itemEls.set(it.id, el);
    menu.appendChild(el);
  }

  const wrap = h("div", { class: "dropdown" }, toggle, menu);

  function open() {
    if (isDisabled(toggle)) return;
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    const current = menu.querySelector('[aria-checked="true"]') || menu.querySelector(".vc-menu__item");
    current?.focus();
    document.addEventListener("mousedown", outside, true);
  }
  function close() {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.removeEventListener("mousedown", outside, true);
  }
  function outside(e) {
    if (!wrap.contains(e.target)) close();
  }

  toggle.addEventListener("click", () => (menu.hidden ? open() : close()));
  toggle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); open(); }
  });
  menu.addEventListener("keydown", (e) => {
    const els = [...menu.querySelectorAll(".vc-menu__item")];
    const i = els.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); els[(i + 1) % els.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); els[(i - 1 + els.length) % els.length].focus(); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); toggle.focus(); }
    else if (e.key === "Tab") close();
  });

  let disabledReason = "";
  return {
    el: wrap,
    setValue(idVal, label) {
      valueEl.textContent = label || "";
      for (const [iid, el] of itemEls) el.setAttribute("aria-checked", String(iid === idVal));
    },
    setDisabled(disabled, reason) {
      disabledReason = reason;
      setDisabled(toggle, disabled, reason);
      if (disabled) close();
    },
    /** The disabled reason in the active language (the caller passes it translated). */
    relabel() {
      if (toggle.getAttribute("aria-disabled") === "true" && disabledReason) toggle.title = disabledReason;
    }
  };
}
