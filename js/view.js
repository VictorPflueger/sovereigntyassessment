// Draws one step of js/story.js into the page: the stage on the left (what to look at) and the story on
// the right (what it means, the agent's words, the decision log). Every number comes in as text. Lilac
// marks what the agent wrote or suggested: its words, its lever, its memo. From 2.1.0 the story also holds
// how the score is made and the key to the levels (Score), and the starting points for research and the
// comparable services (Recommend); a block, a layer's score or the overall score opens its make-up.

import { t, tn, getLang } from "./i18n/index.js";

/** A tiny element builder: h("p", { class: "x" }, "text", child). */
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}
const icon = (name) => h("span", { class: `vc-icon vc-icon--${name}`, "aria-hidden": "true" });
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
/** The page never links to its own repository; a source there is named without a link. */
const OWN = /^https:\/\/github\.com\/VictorPflueger\/sovereigntyassessment(\/|$)/i;

let drawn = "";

/** Draws a step; a step that reads as it did is left as it is, so focus and selection stay put. */
export function renderStep(step, view, act) {
  const lang = getLang();
  const key = JSON.stringify([lang, step, view.mode]);
  if (key === drawn) return;
  drawn = key;
  const kind = step.stage.kind;
  const title = document.getElementById("stage-title");
  title.textContent = ["wait", "empty"].includes(kind) ? "" : t(`p.stage.${kind}`, { service: view.service.short });
  title.hidden = !title.textContent;
  const stage = document.getElementById("stage-body");
  stage.replaceChildren(...(STAGES[kind] || STAGES.empty)(step.stage, act).filter(Boolean), ...(step.comparable ? [comparableList(step.comparable)] : []));
  stage.dataset.kind = kind;
  for (const el of stage.querySelectorAll(".memo-body")) { el.addEventListener("scroll", () => more(el), { passive: true }); requestAnimationFrame(() => more(el)); }

  document.getElementById("story-title").textContent = step.title;
  document.getElementById("story-lead").textContent = step.lead;
  const extra = document.getElementById("story-extra");
  const parts = storyExtra(step);
  extra.replaceChildren(...parts);
  extra.hidden = !parts.length;
  extra.dataset.kind = parts.length ? kind : "";
  const said = step.agent || [];
  document.getElementById("agent").hidden = !said.length;
  const words = document.getElementById("agent-text");
  words.replaceChildren(...said.map((s) => h("p", { lang: view.runLang && view.runLang !== lang ? view.runLang : null }, s.text,
    s.unchecked ? h("span", { class: "vc-tag vc-tag--sm vc-tag--warning unchecked", lang }, t("p.unchecked")) : null)));
  words.scrollTop = 0;
  more(words);
}

/** The agent's words fade at the bottom while there is more to scroll to. */
export function more(el) {
  el.dataset.more = String(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
}

/** Forgets what was drawn, so the next render draws again (after a language switch). */
export function redraw() { drawn = ""; }

/**
 * A key figure's tile: its value with what it rests on, its old value struck through when the decision moved
 * it, its note, and (the weakest link's) the block it names, which opens its make-up, and what the figure
 * leaves out in words (vc-stat__also).
 */
export function renderTile(el, v) {
  const was = el.querySelector(".vc-stat__was");
  const to = el.querySelector(".kpi-to");
  if (was) { was.hidden = !v.was; was.textContent = v.was || ""; }
  if (to) { to.hidden = !v.was; to.textContent = v.was ? t("p.kpi.now") : ""; }
  el.querySelector(".kpi-main").textContent = v.value;
  const of = el.querySelector(".kpi-of");
  if (of) { of.hidden = !v.of; of.textContent = v.of ? ` ${v.of}` : ""; }
  el.querySelector(".kpi-note").replaceChildren(v.block ? opener(`block:${v.block}`, "kpi-open", v.note) : v.note || "");
  const also = el.querySelector(".kpi-also");
  if (also) {
    // Empty, it keeps its room, so the header keeps its height through a case.
    also.dataset.empty = String(!v.also?.length);
    also.replaceChildren(...(v.also || []).map((a) => h("span", { class: "kpi-also-line", dataset: { kind: a.kind } },
      a.level !== null && a.level !== undefined ? level(a.level, { size: "xs" }) : null, a.block ? opener(`block:${a.block}`, "kpi-open", a.text) : a.text)));
  }
  el.dataset.tone = v.tone || "";
}

/** The decision log under the agent's words: who approved what, and when. Closed until opened. */
export function renderLog(entries) {
  const log = document.getElementById("log");
  log.hidden = !entries.length;
  if (!entries.length) return;
  const lang = getLang();
  const time = (at) => (at ? new Date(at).toLocaleTimeString(lang === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "");
  document.getElementById("log-summary").textContent = tn("p.log.summary", entries.length);
  document.getElementById("log-list").replaceChildren(...entries.map((e) => h("li", {}, e.at ? h("time", { datetime: e.at }, time(e.at)) : null, ` ${e.who} ${e.what}`)));
}

/** A source as the stage lists it: the quote, then its page and the date it was read. */
function source(s) {
  const link = OWN.test(s.url) ? h("span", { class: "src-title" }, s.title) : h("a", { class: "src-title", href: s.url, rel: "noopener", target: "_blank" }, s.title);
  return h("li", { class: "src" },
    h("q", { class: "src-quote", lang: s.lang || null }, s.quote),
    h("span", { class: "src-meta" }, link, s.read ? ` · ${t("p.src.read", { date: s.read })}` : ""));
}

/**
 * A list of sources that shows its first few and keeps the rest one click away ("4 more quotes"), so the
 * finding they back stays in view at 1280 × 720.
 */
function sourceList(list, show = 2) {
  const items = list.map(source);
  const ol = h("ol", { class: "src-list" }, items);
  if (list.length <= show + 1) return ol;
  for (const li of items.slice(show)) li.hidden = true;
  const more = h("button", { type: "button", class: "src-more", onclick: (e) => {
    for (const li of items.slice(show)) li.hidden = false;
    e.currentTarget.remove();
  } }, tn("p.src.more", list.length - show));
  return h("div", { class: "src-block" }, ol, more);
}

/**
 * A level in a hexagon on Vici's diverging scale, with its number, so it never reads by colour alone. A
 * level with one side unknown keeps its plain number; the words beside it say which side is unknown.
 */
export function level(n, { size = "" } = {}) {
  const v = n === null || n === undefined ? "gap" : String(n);
  return h("span", { class: `lvl${size ? ` lvl--${size}` : ""}`, dataset: { level: v } }, h("span", { class: "lvl-n" }, v === "gap" ? "?" : v));
}

/** A button that opens a make-up (js/app.js fills and places the popover): a block, a layer or the score. */
export function opener(key, cls, text, label = null) {
  return h("button", { type: "button", class: `${cls} mk-open`, "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "makeup", "aria-label": label, dataset: { makeup: key } }, text);
}

/** What the story shows under its lead: at Score how the overall score is made; at Recommend the starting
 * points for research, each name opening its source. */
function storyExtra(step) {
  const out = [];
  if (step.sum) out.push(h("p", { class: "sum-line" }, step.sum.text, " ", opener("overall", "sum-open", step.sum.open)));
  const alts = step.alternatives || [];
  if (alts.length) {
    out.push(h("section", { class: "alts", "aria-labelledby": "alts-title" },
      h("h3", { class: "alts-title", id: "alts-title" }, t("p.alt.label")),
      h("ul", { class: "alt-blocks" }, alts.map((a) => h("li", { class: "alt-block", dataset: { block: a.block.id } },
        level(a.block.level, { size: "sm" }),
        h("p", { class: "alt-text" }, h("span", { class: "alt-head" }, t("p.alt.block", { block: a.block.name })), " ",
          a.none ? h("span", { class: "alt-none" }, t("p.alt.none"))
            : a.starting.map((p, i) => [i ? h("span", { class: "alt-sep", "aria-hidden": "true" }, " · ") : null, opener(p.key, "alt-open", p.name, t("p.alt.open", { name: p.name }))])))))));
  }
  return out;
}

/** The other assessed services of the case's function group, best first, each to open or to compare. */
function comparableList(c) {
  return h("section", { class: "comp panel", "aria-labelledby": "comp-title" },
    h("h3", { class: "comp-title", id: "comp-title" }, t("p.comp.title", { group: c.group })),
    c.pending ? h("p", { class: "comp-note" }, t("p.comp.pending"))
      : c.none ? h("p", { class: "comp-note" }, t("p.comp.none"))
        : h("ol", { class: "comp-list" }, c.items.map((x) => h("li", { class: `comp-item${x.current ? " comp-item--current" : ""}`, dataset: { case: x.id } },
          x.current ? h("span", { class: "comp-name" }, x.name, h("span", { class: "comp-this" }, ` (${t("p.comp.this")})`))
            : h("button", { type: "button", class: "comp-name comp-open", dataset: { openCase: x.id }, "aria-label": t("p.ov.openCase.label", { name: x.name }) }, x.name),
          h("span", { class: "comp-score" }, h("strong", {}, x.score), ` ${x.of}`),
          x.weakest ? h("span", { class: "comp-weak", title: null }, level(x.weakest.level, { size: "sm" }), h("span", {}, x.weakest.label)) : h("span", {}),
          x.current ? h("span", { class: "comp-gap" }) : h("button", { type: "button", class: "vc-button vc-button--outline vc-button--sm comp-cmp", dataset: { cmpWith: x.id }, "aria-label": t("p.cmp.with", { name: x.name }) }, t("p.comp.compare"))))));
}

/**
 * The make-up of a block, a layer's score or the overall score, as js/story.js words it (m), into the
 * popover. Every figure is text from the story; nothing here computes.
 */
export function renderMakeup(pop, m) {
  const title = h("p", { class: "mk-title", id: "makeup-title" }, m.level !== undefined ? level(m.level) : null, h("span", {}, m.title));
  const kids = [title];
  if (m.kind === "block") {
    const side = (label, x) => h("div", {}, h("dt", {}, label), h("dd", {}, h("span", {}, x.who, x.where && x.who !== t("p.party.unknown") ? ` · ${x.where}` : "", ` · ${x.detail}`), level(x.level, { size: "sm" })));
    kids.push(h("dl", { class: "mk-sides" }, side(t("p.made"), m.made), side(t("p.run"), m.run)));
    kids.push(h("p", { class: "mk-rule" }, m.rule, " ", m.crit));
    if (m.layer) kids.push(h("p", { class: "mk-layer" }, h("span", {}, t("p.mk.layer", { layer: m.layer.name })), " ", h("code", {}, m.layer.expr)));
    if (m.sources?.length) kids.push(h("details", { class: "mk-sources" }, h("summary", {}, tn("p.src.quotes", m.sources.length)), h("ol", { class: "src-list src-list--short" }, m.sources.map(source))));
  } else if (m.kind === "alt") {
    kids.push(h("p", { class: "mk-rule" }, m.levelText, m.catalogue ? ` · ${m.catalogue}` : ""));
    if (m.note) kids.push(h("p", { class: "mk-layer" }, m.note));
    if (m.source) kids.push(h("ol", { class: "src-list src-list--short" }, source(m.source)));
    kids.push(h("p", { class: "mk-rule muted" }, t("p.alt.label")));
  } else if (m.kind === "layer") {
    kids.push(h("p", { class: "mk-expr" }, h("code", {}, m.expr)));
    kids.push(h("ul", { class: "mk-terms" }, m.blocks.map((b) => h("li", {}, b))));
    kids.push(h("p", { class: "mk-rule" }, t("p.key.points")));
  } else {
    kids.push(h("p", { class: "mk-expr" }, h("code", {}, m.detail)));
    if (m.left?.length) kids.push(h("ul", { class: "mk-terms" }, m.left.map((x) => h("li", {}, x))));
    kids.push(h("p", { class: "mk-rule" }, t("p.key.points")));
  }
  kids.push(h("p", { class: "mk-esc" }, t("p.mk.esc")));
  pop.replaceChildren(...kids);
}

/** "2 quotes": opens and closes the list of sources with the given id. */
function quotesToggle(id, list) {
  return h("button", { type: "button", class: "src-toggle", "aria-expanded": "false", "aria-controls": id, onclick: (e) => {
    const open = e.currentTarget.getAttribute("aria-expanded") !== "true";
    e.currentTarget.setAttribute("aria-expanded", String(open));
    document.getElementById(id).hidden = !open;
  } }, tn("p.src.quotes", list.length));
}

/** A party in a table cell: the name, and where it belongs underneath. */
function party(o) {
  return h("td", { class: "party" }, o.who, o.where && o.who !== t("p.party.unknown") ? h("span", { class: "where" }, o.where) : null);
}

/** Made by and run by, as two short lines. */
function origin(b) {
  const line = (label, o) => h("div", {}, h("dt", {}, label), h("dd", {}, o.who, o.where && o.who !== t("p.party.unknown") ? h("span", { class: "where" }, ` · ${o.where}`) : null));
  return h("dl", { class: "origin" }, line(t("p.made"), b.made), line(t("p.run"), b.run));
}

const STAGES = {
  wait: (s) => [h("p", { class: "stage-empty" }, h("span", { class: "vc-spinner vc-spinner--sm", "aria-hidden": "true" }), ` ${s.text || ""}`)],
  empty: (s) => [h("p", { class: "stage-empty" }, s.text || "")],

  choice: (s, act) => [h("p", {}, s.question), h("ul", { class: "choices" }, s.candidates.map((c) => h("li", { class: "choice" },
    h("div", {}, h("p", { class: "choice-name" }, c.name), h("p", { class: "choice-text" }, c.text)),
    h("button", { type: "button", class: "vc-button vc-button--outline", onclick: () => act.choose(c.index) }, t("p.act.chooseThis")))))],

  service: (s) => [h("article", { class: "svc" },
    h("header", { class: "svc-head" }, h("p", { class: "svc-name" }, s.name), h("span", { class: "vc-tag vc-tag--feature vc-tag--sm" }, icon("sparkle"), t("p.recorded"))),
    h("p", { class: "svc-what" }, s.what),
    s.note ? h("p", { class: "svc-note" }, icon("info"), s.note) : null,
    h("dl", { class: "svc-facts" }, s.rows.map((r) => h("div", {}, h("dt", {}, r.label), h("dd", {}, r.value))))),
  s.sources.length ? h("section", { class: "sources", "aria-label": t("p.sources") }, h("p", { class: "sources-head" }, t("p.sources.n", { n: s.sources.length })), sourceList(s.sources)) : null],

  layers: (s) => [h("div", { class: "vc-table-wrap panel" }, h("table", { class: "vc-table vc-table--compact research" },
    h("caption", { class: "vc-visually-hidden" }, t("p.stage.layers")),
    h("colgroup", {}, h("col", { class: "c-layer" }), h("col", { class: "c-block" }), h("col", {}), h("col", {})),
    h("thead", {}, h("tr", {}, h("th", { scope: "col" }, t("p.col.layer")), h("th", { scope: "col" }, t("p.col.block")), h("th", { scope: "col" }, t("p.made")), h("th", { scope: "col" }, t("p.run")))),
    h("tbody", {}, s.rows.flatMap((r) => (r.blocks.length
      ? r.blocks.flatMap((b, i) => {
        // Each block's quotes open under its row: the quote, its page and the date it was read.
        const id = `src-${b.id}`;
        const more = b.sources.length ? quotesToggle(id, b.sources) : null;
        return [
          h("tr", { dataset: { layer: r.layer, critical: String(b.critical) } },
            i === 0 ? h("th", { scope: "row" }, r.name) : h("td", { class: "same-layer" }),
            h("td", { class: "block-name" }, b.name, b.critical ? h("span", { class: "crit" }, t("p.crit.critical")) : null, more),
            party(b.made), party(b.run)),
          b.sources.length ? h("tr", { class: "src-row", id, hidden: true }, h("td", {}), h("td", { colspan: "3" }, h("ol", { class: "src-list src-list--short" }, b.sources.map(source)))) : null
        ];
      })
      : [h("tr", { dataset: { layer: r.layer, status: r.status } }, h("th", { scope: "row" }, r.name), h("td", { class: "layer-none", colspan: "3" }, r.status === "open" ? t("p.layer.open") : r.reason || t(`p.layer.${r.status}`)))]))))),
  ],

  // Each block says its criticality in words and carries the marks the weakest-link tile uses; its name
  // opens how its level is made, a layer's score how that score is made. The key stands in the story.
  levels: (s) => [h("ol", { class: "layers layers--levels" }, s.rows.map((r) => h("li", { class: "layer", dataset: { layer: r.layer, status: r.status } },
    h("p", { class: "layer-name" }, r.name),
    r.blocks.length
      ? h("ul", { class: "cells" }, r.blocks.map((b) => h("li", { class: "cell", dataset: { block: b.id, critical: String(b.critical), marks: b.marks.map((m) => m.kind).join(" ") } },
        level(b.level),
        h("span", { class: "cell-text" },
          opener(`block:${b.id}`, "cell-name", b.name),
          h("span", { class: "cell-meta" }, h("span", { class: "cell-crit" }, b.criticality),
            b.marks.map((m) => h("span", { class: `cell-flag cell-flag--${m.kind}` }, m.text)))))))
      : h("p", { class: "layer-none" }, t(`p.layer.${r.status === "scored" ? "open" : r.status}`)),
    r.score !== null
      ? opener(`layer:${r.layer}`, "layer-score", r.score, t("p.mk.layerOpen", { layer: r.name, score: r.score }))
      : h("p", { class: "layer-score" }, h("span", { class: "muted" }, t("p.noScore")))))),
  s.key ? h("section", { class: "key", "aria-label": t("p.key.title") },
    h("ul", { class: "key-levels" }, s.key.levels.map((l) => h("li", {}, level(l.level, { size: "sm" }), h("span", {}, l.text)))),
    h("p", { class: "key-crit" }, s.key.crit.map((c, i) => [h("strong", {}, c.term), `: ${c.text}`, i < s.key.crit.length - 1 ? "; " : "."])),
    h("p", { class: "key-points" }, s.key.points)) : null],

  review: (s) => [h("ul", { class: "review" }, s.blocks.map((b) => h("li", { class: "review-block" },
    h("div", { class: "review-head" }, level(b.level, { size: "lg" }),
      h("div", {}, h("p", { class: "review-name" }, b.name), h("p", { class: "review-meta" }, `${b.layer} · ${b.criticality}`))),
    origin(b),
    h("p", { class: "review-why" }, cap(b.why)),
    b.sources.length ? h("section", { class: "sources", "aria-label": t("p.sources") }, h("p", { class: "sources-head" }, t("p.sources.n", { n: b.sources.length })), sourceList(b.sources)) : null))),
  s.status !== "open" ? h("p", { class: "outcome" }, icon("check"), t(s.status === "skip" ? "p.review.skipped" : "p.review.confirmed")) : null],

  levers: (s, act) => [h("ul", { class: "levers" },
    s.levers.map((l, i) => h("li", { class: "lever", dataset: { status: l.status } },
      h("div", { class: "lever-text" },
        h("p", { class: "lever-title" }, l.title, h("span", { class: "vc-tag vc-tag--sm vc-tag--feature" }, icon("sparkle"), t("p.suggested"))),
        h("p", { class: "lever-why" }, l.rationale, l.sources.length ? quotesToggle(`src-${l.id}`, l.sources) : null),
        l.sources.length ? h("ol", { class: "src-list src-list--short", id: `src-${l.id}`, hidden: true }, l.sources.map(source)) : null),
      h("dl", { class: "lever-figures" },
        h("div", {}, h("dt", {}, t("p.lever.score")), h("dd", {}, l.text.overall, l.text.delta ? h("span", { class: "delta" }, ` (${l.text.delta})`) : null)),
        h("div", {}, h("dt", {}, t("p.lever.weakest")), h("dd", {}, l.text.weakest))),
      l.status === "approved" ? h("p", { class: "lever-state" }, icon("check"), t("p.lever.approved"))
        : s.levers.length > 1 && i > 0 && l.status === "open" ? h("button", { type: "button", class: "vc-button vc-button--outline", onclick: () => act.approve(l.id) }, t("p.act.approveThis")) : null)),
    h("li", { class: "lever lever--keep", dataset: { status: s.keep.status } },
      h("div", { class: "lever-text" }, h("p", { class: "lever-title" }, t("p.lever.keep")), h("p", { class: "lever-why" }, t("p.lever.keepWhy"))),
      h("dl", { class: "lever-figures" }, h("div", {}, h("dt", {}, t("p.lever.score")), h("dd", {}, s.keep.overall))),
      s.keep.status === "approved" ? h("p", { class: "lever-state" }, icon("check"), t("p.lever.kept")) : null))],

  memo: (s) => [h("article", { class: "memo", dataset: { status: s.status } },
    h("header", { class: "memo-head" },
      h("span", { class: "vc-tag vc-tag--sm vc-tag--feature" }, icon("sparkle"), t("p.memo.draft")),
      h("span", { class: "memo-state" }, t(`p.memo.${s.status}`))),
    h("p", { class: "memo-meta" }, s.meta),
    h("p", { class: "memo-subject" }, s.subject),
    h("div", { class: "memo-body" }, s.body.map((p) => h("p", {}, p))),
    h("dl", { class: "memo-figures" }, s.figures.map((f) => h("div", {}, h("dt", {}, f.label), h("dd", {}, f.value))))),
  h("p", { class: "outcome outcome--quiet" }, icon("shield"), t("p.memo.nothingSent"))]
};
