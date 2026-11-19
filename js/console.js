// Agent console: the progress rail above a logbook (time · mark · entry). Version 0.1.0 has no run, so
// the log holds the start-up hint and the notices that code writes; the agent's sentences arrive with
// the live agent and the simulation player. A notice is stored as an i18n key with its placeholders and
// translated again after a language switch; the rail translates itself.

import { bus } from "./events.js";
import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { createProgressRail } from "./progress.js";
import { fmtTime } from "./format.js";
import { onLang } from "./i18n/index.js";

const LEVEL_ICON = { info: "info", warn: "alert", error: "alert" };

export function createConsole(panel) {
  const count = h("span", { class: "count vc-tabular" }, "");
  const log = h("div", { class: "log", role: "log", "aria-live": "polite", "aria-relevant": "additions", "aria-labelledby": "console-heading", tabindex: "0" });
  const rail = createProgressRail();
  rail.reset();
  const titleEl = tx("console.title", null, { tag: "h2", attrs: { id: "console-heading" } });
  panel.append(
    h("div", { class: "console-head" },
      h("div", { class: "console-title" }, titleEl, count)),
    rail.el,
    log
  );

  // Every entry with what its time needs to be written again in another language.
  let entries = [];

  function empty() {
    return h("div", { class: "log-empty" },
      tx("console.empty.title", null, { tag: "h3" }),
      tx("console.empty.text", null, { tag: "p" }),
      tx("console.empty.privacy", null, { tag: "p", cls: "log-empty-note" }));
  }

  function renderCount() {
    count.replaceChildren(entries.length ? tx("console.count", null, { n: entries.length }) : "");
  }

  /** A line that code writes: { level: "info"|"warn"|"error", key, vars }. */
  function notice({ level = "info", key, vars = null } = {}) {
    if (!key) return;
    if (!entries.length) clear(log);
    const at = new Date().toISOString();
    const time = h("span", { class: "entry-time vc-tabular" }, fmtTime(at));
    const el = h("div", { class: "entry", dataset: { type: "notice", level } },
      time,
      h("span", { class: "entry-mark", "aria-hidden": "true" }, icon(LEVEL_ICON[level] || "info", 16)),
      h("div", { class: "entry-body" }, tx(key, vars, { tag: "p" })));
    entries.push({ el, time, at });
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    renderCount();
    return el;
  }

  // Times follow the language's format (24-hour in both, but written by Intl).
  onLang(() => {
    for (const e of entries) e.time.textContent = fmtTime(e.at);
  });

  bus.on("notice", (ev) => notice(ev.payload || {}));
  bus.on("state_change", (ev) => rail.update(ev.payload?.state));
  bus.on("run_end", (ev) => rail.finish(ev.payload?.status));

  function reset() {
    entries = [];
    clear(log).appendChild(empty());
    renderCount();
    rail.reset();
  }
  reset();

  return { notice, reset, rail, title: titleEl };
}
