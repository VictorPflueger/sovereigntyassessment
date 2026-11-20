// Agent console: the progress rail above a logbook (time · mark · entry), the run-facts line below it.
// One plain sentence per tool call, written by code and translated after a language switch, with the
// details one click away; the agent's narration (ui_progress) with the AI label, in the run's language;
// the model's plain text and its reasoning summaries behind Details (brief §6.6); the person's decisions
// in merlot; the report card. Simulation shows the neutral tape and the watermark. Both modes drive it
// through the same run events.

import { bus } from "./events.js";
import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { tx } from "./text.js";
import { createProgressRail } from "./progress.js";
import { fmtTime, fmtEur, fmtInt, fmtDate } from "./format.js";
import { onLang, getLang, t, tn } from "./i18n/index.js";
import { renderFacts } from "./facts.js";
import { toolLine, toolOutcome } from "./tool_plain.js";
import { aiLabel, langTag } from "./ai_label.js";
import { renderMarkdown } from "./md.js";
import { reportMarkdown, valueText } from "./drafts.js";

const LEVEL_ICON = { info: "info", warn: "alert", error: "alert" };
const SILENT_TOOLS = new Set(["ui_progress"]);

export function createConsole(panel, { onOpenTab } = {}) {
  const count = h("span", { class: "count vc-tabular" }, "");
  const log = h("div", { class: "log", role: "log", "aria-live": "polite", "aria-relevant": "additions", "aria-labelledby": "console-heading", tabindex: "0" });
  const rail = createProgressRail();
  rail.reset();
  const titleEl = tx("console.title", null, { tag: "h2", attrs: { id: "console-heading" } });
  const tape = h("div", { class: "sim-watermark", hidden: true, role: "note" });
  const facts = h("div", { class: "run-facts", "aria-live": "off", hidden: true });
  panel.append(
    h("div", { class: "console-head" }, h("div", { class: "console-title" }, titleEl, count)),
    rail.el,
    tape,
    log,
    facts
  );

  // Every entry with what it needs to be written again in another language.
  let entries = [];
  let byCall = new Map();
  let byMsg = new Map();
  let run = { lang: "en", mode: null, source: null, as_of: null, cost: null, budget: null, ended: false };

  function empty() {
    return h("div", { class: "log-empty" },
      tx("console.empty.title", null, { tag: "h3" }),
      tx("console.empty.text", null, { tag: "p" }),
      tx("console.empty.privacy", null, { tag: "p", cls: "log-empty-note" }));
  }

  function renderCount() {
    count.replaceChildren(entries.length ? tx("console.count", null, { n: entries.length }) : "");
  }

  /** A new entry: type, mark icon, attributes; render(body) fills the body and runs again on a switch. */
  function add(type, { mark = "info", dataset = {}, render }) {
    if (!entries.length) clear(log);
    const at = new Date().toISOString();
    const time = h("span", { class: "entry-time vc-tabular" }, fmtTime(at));
    const body = h("div", { class: "entry-body" });
    const el = h("div", { class: "entry", dataset: { type, ...dataset } },
      time, h("span", { class: "entry-mark", "aria-hidden": "true" }, icon(mark, 16)), body);
    const entry = { el, body, time, at, render: render ? () => { clear(body); render(body); follow(); } : null };
    entry.render?.();
    entries.push(entry);
    log.appendChild(el);
    follow();
    renderCount();
    return entry;
  }

  // The log follows the newest entry unless the person has scrolled up to read; scrolling back to the
  // bottom resumes it.
  let following = true;
  let programmatic = false;
  log.addEventListener("scroll", () => {
    if (programmatic) { programmatic = false; return; }
    following = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
  });
  function follow() {
    if (!following) return;
    programmatic = true;
    log.scrollTop = log.scrollHeight;
  }

  /** A line that code writes: { level: "info"|"warn"|"error", key, vars, action }. */
  function notice({ level = "info", key, vars = null, action = null } = {}) {
    if (!key) return null;
    return add("notice", {
      mark: LEVEL_ICON[level] || "info", dataset: { level },
      render: (body) => {
        body.append(h("p", {}, t(key, vars || null)));
        if (action === "simulation") body.append(h("p", { class: "notice-action" }, t("notice.trySimulation")));
      }
    });
  }

  // Times and the code-written lines follow the language.
  onLang(() => {
    for (const e of entries) {
      e.time.textContent = fmtTime(e.at);
      e.render?.();
    }
    renderTape();
    renderFacts2();
  });

  // ---- the run's frame ------------------------------------------------------------------------------
  function renderTape() {
    tape.hidden = run.mode !== "simulation";
    if (tape.hidden) return;
    tape.replaceChildren(t("console.tape.title"), " ", h("span", {}, run.source === "recorded" ? t("console.tape.recorded", { date: fmtDate(run.as_of) }) : t("console.tape.hand", { date: fmtDate(run.as_of) })));
  }

  function renderFacts2() {
    if (!run.mode) { facts.hidden = true; return; }
    facts.hidden = false;
    const b = run.budget || {};
    const c = run.cost || {};
    const searches = b.searches?.used ?? 0;
    const fetches = b.fetches?.used ?? 0;
    const parts = run.mode === "simulation"
      ? [t("facts.sim"), tn("facts.searches", searches), tn("facts.fetches", fetches)]
      : [t("facts.calls", { used: fmtInt(b.model_calls?.used ?? 0), cap: fmtInt(b.model_calls?.cap ?? 0) }), tn("facts.searches", searches), tn("facts.fetches", fetches), tn("facts.nudges", b.nudges ?? 0), t("facts.cost", { eur: fmtEur(c.eur ?? 0) })];
    const items = parts.flatMap((p, i) => [i ? h("span", { class: "run-facts-sep", "aria-hidden": "true" }, " · ") : null, h("span", { class: "run-facts-item vc-tabular" }, p)]).filter(Boolean);
    facts.replaceChildren(h("span", { class: "run-facts-label" }, t("facts.label"), ": "), ...items);
  }

  bus.on("run_start", (ev) => {
    const p = ev.payload || {};
    run = { lang: p.lang || "en", mode: p.mode, source: p.source || null, as_of: p.as_of || null, cost: null, budget: null, ended: false, query: p.query, model: p.model };
    log.dataset.sim = p.mode === "simulation" ? "true" : "false";
    renderTape();
    renderFacts2();
    add("run", {
      mark: p.mode === "simulation" ? "play" : "radar",
      render: (body) => {
        body.append(
          h("div", { class: "run-title" }, t(p.mode === "simulation" ? "console.run.sim" : "console.run.live", { service: p.query || "" })),
          h("div", {}, p.mode === "simulation"
            ? t(p.source === "recorded" ? "console.run.simMetaRecorded" : "console.run.simMeta", { date: fmtDate(p.as_of), lang: t(`lang.name.${run.lang}`) })
            : t("console.run.liveMeta", { model: p.model_label || p.model || "", lang: t(`lang.name.${run.lang}`) })));
      }
    });
  });
  bus.on("cost_update", (ev) => { run.cost = ev.payload; renderFacts2(); });
  bus.on("budget_update", (ev) => { run.budget = ev.payload; renderFacts2(); });

  // ---- the agent's words ----------------------------------------------------------------------------
  /** Model-written text in the run's language, with its placeholders rendered and its tags. */
  function modelText(text, values, { unchecked = null, cls = "narr-text" } = {}) {
    const p = h("p", { class: cls, lang: run.lang });
    p.append(renderFacts(text, values || {}, run.lang));
    const tags = h("span", { class: "narr-tags" });
    if (unchecked?.length) tags.append(h("span", { class: "vc-tag vc-tag--warning unchecked-tag", title: t("console.unchecked.title", { tokens: unchecked.join(", ") }) }, t("console.unchecked")));
    if (run.lang !== getLang()) tags.append(langTag(run.lang));
    if (tags.childNodes.length) p.append(" ", tags);
    return p;
  }

  bus.on("narration", (ev) => {
    const p = ev.payload || {};
    if (p.detail) {
      // The model's plain text (with its citations) shows only behind Details (brief §6.6).
      let e = byMsg.get(p.msg_id);
      if (!e) {
        const pre = h("div", { class: "reasoning-text", lang: run.lang });
        e = add("narration", {
          mark: "list", dataset: { detail: "true" },
          render: (body) => {
            const d = h("details", { class: "reasoning" }, h("summary", {}, icon("chevronRight", 14), t("console.detail")), pre);
            body.append(d);
          }
        });
        e.pre = pre;
        byMsg.set(p.msg_id, e);
      }
      e.pre.textContent = p.text;
      e.el.classList.toggle("streaming", !p.done);
      return;
    }
    const e = add("narration", {
      mark: "spark", dataset: { audit: p.audit || "passed" },
      render: (body) => {
        const line = h("div", { class: "narr-line" }, aiLabel("narration"), modelText(p.text, p.values, { unchecked: p.unchecked }));
        body.append(line);
      }
    });
    byMsg.set(p.msg_id, e);
  });

  bus.on("reasoning", (ev) => {
    const p = ev.payload || {};
    let e = byMsg.get(p.msg_id);
    if (!e) {
      const pre = h("div", { class: "reasoning-text" });
      e = add("reasoning", {
        mark: "list",
        render: (body) => body.append(h("details", { class: "reasoning" }, h("summary", {}, icon("chevronRight", 14), t("console.reasoning")), pre))
      });
      e.pre = pre;
      byMsg.set(p.msg_id, e);
    }
    e.pre.textContent = p.text;
    e.el.classList.toggle("streaming", !p.done);
  });

  // ---- tool calls -------------------------------------------------------------------------------------
  bus.on("tool_call", (ev) => {
    const p = ev.payload || {};
    if (SILENT_TOOLS.has(p.name)) return;
    const call = { name: p.name, input: p.input || {}, server: !!p.server, result: null, ok: null };
    const e = add("tool_call", {
      mark: p.server ? (p.name === "web_search" ? "search" : "globe") : "hexagon",
      dataset: { server: p.server ? "true" : "false", tool: p.name },
      render: (body) => renderTool(body, call)
    });
    e.call = call;
    byCall.set(p.call_id, e);
  });

  bus.on("tool_result", (ev) => {
    const p = ev.payload || {};
    let e = byCall.get(p.call_id);
    if (!e && SILENT_TOOLS.has(p.name)) {
      if (p.ok) return;
      // A refused narration sentence is shown, so the audit's refusal is visible.
      const call = { name: p.name, input: p.input || {}, server: false, result: null, ok: null };
      e = add("tool_call", { mark: "hexagon", dataset: { server: "false", tool: p.name }, render: (body) => renderTool(body, call) });
      e.call = call;
      byCall.set(p.call_id, e);
    }
    if (!e) return;
    e.call.result = p.result;
    e.call.ok = p.ok;
    e.el.dataset.ok = p.ok ? "true" : "false";
    e.render();
  });

  function renderTool(body, c) {
    if (!c) return;
    const lang = getLang();
    const line = h("div", { class: "tool-line" }, h("span", { class: "tool-sentence" }, toolLine(c.name, c.input, lang)));
    body.append(line);
    if (c.ok === null) return;
    const result = h("div", { class: "result", dataset: { open: "false" } });
    const toggle = h("button", { class: "result-toggle", type: "button", "aria-expanded": "false" },
      icon("chevronRight", 14), h("span", { class: "result-summary", dataset: { ok: c.ok ? "true" : "false" } }, toolOutcome(c.name, c.input, c.result, c.ok, lang)));
    const detail = h("div", { class: "result-body" }, JSON.stringify({ input: c.input, result: c.result }, null, 2));
    toggle.addEventListener("click", () => {
      const open = result.dataset.open !== "true";
      result.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    result.append(toggle, detail);
    if (c.name === "web_search" && c.ok && c.result?.results?.length) {
      result.append(h("div", { class: "result-sources" }, ...c.result.results.slice(0, 6).map((r) => h("a", { href: r.url, target: "_blank", rel: "noopener noreferrer" }, r.title || r.url))));
    }
    if (c.name === "web_fetch" && c.ok && c.result?.url) {
      result.append(h("div", { class: "result-sources" }, h("a", { href: c.result.url, target: "_blank", rel: "noopener noreferrer" }, c.result.url)));
    }
    body.append(result);
  }

  // ---- the person's steps -------------------------------------------------------------------------------
  function decision(render) {
    return add("decision", { mark: "user", render });
  }

  bus.on("review_request", (ev) => {
    const p = ev.payload || {};
    add("handover", {
      mark: "user",
      render: (body) => {
        body.append(h("p", { class: "handover-line" }, t("console.reviewAsked")));
        body.append(h("div", { class: "narr-line" }, aiLabel("review"), modelText(p.summary, p.values, { unchecked: p.unchecked })));
        const open = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button" }, t("console.openReview"));
        open.addEventListener("click", () => onOpenTab?.("review"));
        body.append(open);
      }
    });
  });

  bus.on("review_decision", (ev) => {
    const p = ev.payload || {};
    decision((body) => {
      if (p.action === "correct") {
        const changes = Object.entries(p.changes || {}).map(([f, v]) => `${t(`field.${f}`)}: ${valueText(f, v, getLang())}`).join("; ");
        body.append(h("p", {}, h("strong", {}, t("console.decision.correct", { block: p.block_id })), " ", changes, ". ", t("console.decision.reason", { reason: p.reason || "" })));
      } else {
        body.append(h("p", {}, h("strong", {}, t(p.action === "skip" ? "console.decision.skip" : "console.decision.confirm"))));
      }
    });
  });

  bus.on("levers", () => {
    add("handover", {
      mark: "user",
      render: (body) => {
        body.append(h("p", { class: "handover-line" }, t("console.leversAsked")));
        const open = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button" }, t("console.openLevers"));
        open.addEventListener("click", () => onOpenTab?.("levers"));
        body.append(open);
      }
    });
  });

  bus.on("lever_decision", (ev) => {
    const p = ev.payload || {};
    decision((body) => body.append(h("p", {}, h("strong", {}, p.lever_id === "keep" ? t("console.decision.keep") : t("console.decision.lever", { lever: p.lever_id })))));
  });

  bus.on("choice_request", () => {
    add("handover", { mark: "user", render: (body) => body.append(h("p", { class: "handover-line" }, t("console.choiceAsked"))) });
  });
  bus.on("choice_decision", (ev) => {
    const p = ev.payload || {};
    decision((body) => body.append(h("p", {}, h("strong", {}, Number.isInteger(p.chosen) ? t("console.decision.choice", { n: fmtInt(p.chosen + 1) }) : t("console.decision.choiceNone")))));
  });

  bus.on("action_draft", () => {
    add("notice", {
      mark: "memo", dataset: { level: "info" },
      render: (body) => {
        body.append(h("p", {}, t("console.memo")));
        const open = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button" }, t("console.openOutbox"));
        open.addEventListener("click", () => onOpenTab?.("outbox"));
        body.append(open);
      }
    });
  });

  bus.on("report", (ev) => {
    const r = ev.payload || {};
    add("report", {
      mark: "memo",
      render: (body) => {
        const card = h("div", { class: "vc-card report-card" }, aiLabel("report"));
        const md = h("div", { class: "md vc-prose", lang: r.lang });
        md.append(renderMarkdown(reportMarkdown(r, r.lang)));
        card.append(md);
        if (r.lang !== getLang()) card.append(langTag(r.lang));
        const open = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button" }, t("console.openOutbox"));
        open.addEventListener("click", () => onOpenTab?.("outbox"));
        card.append(h("div", { class: "report-actions" }, open));
        body.append(card);
      }
    });
  });

  bus.on("attempt_discarded", (ev) => {
    const p = ev.payload || {};
    for (const id of p.msg_ids || []) byMsg.get(id)?.el.classList.add("discarded");
    for (const id of p.call_ids || []) byCall.get(id)?.el.classList.add("discarded");
  });

  bus.on("notice", (ev) => notice(ev.payload || {}));
  bus.on("state_change", (ev) => rail.update(ev.payload?.state));
  bus.on("run_end", (ev) => {
    const p = ev.payload || {};
    rail.finish(p.status);
    run.ended = true;
    add("run", {
      mark: p.status === "done" || p.status === "not_a_service" ? "check" : "stop",
      // Why a run stopped is the notice just above (with its figures); this line names the outcome.
      render: (body) => body.append(h("div", { class: "run-title" }, t(`console.end.${p.status}`)))
    });
  });

  function reset() {
    following = true;
    entries = [];
    byCall = new Map();
    byMsg = new Map();
    run = { lang: getLang(), mode: null, source: null, as_of: null, cost: null, budget: null, ended: false };
    log.dataset.sim = "false";
    clear(log).appendChild(empty());
    renderCount();
    renderTape();
    renderFacts2();
    rail.reset();
  }
  reset();

  return { notice, reset, rail, title: titleEl };
}
