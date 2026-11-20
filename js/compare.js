// Compare (brief §9; AC-16): two loaded assessments overlaid on one spider diagram by layer, and side by
// side in a table. The first is drawn in teal like the assessed service, the second in apricot
// (--vc-data-3) with a dashed line and hollow markers, so the two also differ without colour (DESIGN.md).
// Every figure is computed in code from the assessments' own fields, with the layer weights in force
// (js/assessment.js scoreAssessment); a figure without a basis shows "no data", never 0.

import { h, clear } from "./dom.js";
import { t, onLang, getLang } from "./i18n/index.js";
import { fmtDate, fmtDelta, fmtInt, fmtScore, fmtShare, layerStatusKey } from "./format.js";
import { LAYERS } from "./engine.js";
import { spiderSvg, wrapWords } from "./spider.js";
import { loadedAssessments, onLoaded } from "./loaded.js";
import { scoreAssessment, serviceName } from "./assessment.js";
import { getWeights, onWeights } from "./weights.js";
import { formatFact } from "./facts.js";
import { isStale } from "./sovmap.js";

/** How a loaded assessment is named in a list: its service, then where it comes from. */
export function itemLabel(item, a, lang = getLang()) {
  const name = serviceName(a, lang);
  // An assessment older than ninety days says so here as on the map (the review's finding R-24).
  const stale = item.origin !== "session" && a.as_of && isStale(a.as_of) ? ` · ${t("map.stale", null, lang)}` : "";
  if (item.origin === "prerun") return t("loaded.label.prerun", { name, date: fmtDate(a.as_of, lang) }, lang) + stale;
  if (item.origin === "session") return t(a.source === "live" ? "loaded.label.sessionLive" : "loaded.label.session", { name }, lang);
  return t("loaded.label.file", { name, date: fmtDate(a.as_of, lang) }, lang) + stale;
}

/** The weakest critical link as text: "level 0 · B-06 App distribution on iOS", or no data. */
export function weakestText(result, lang = getLang()) {
  const w = result?.weakest;
  if (!w) return t("kpi.weakest.none", null, lang);
  const b = result.blocks.find((x) => x.id === w.block_id);
  const name = typeof b?.name === "string" ? b.name : b?.name?.[lang] || "";
  const level = formatFact("weakest.level", w.level, lang);
  return w.ties ? t("compare.weakestTied", { level, block: `${w.block_id} ${name}`.trim(), n: fmtInt(w.ties, lang) }, lang) : t("compare.weakest", { level, block: `${w.block_id} ${name}`.trim() }, lang);
}

export function createCompare(host) {
  const state = { a: null, b: null, token: 0, list: [] };
  const title = h("h2", { class: "view-title", id: "cmp-title" });
  const lead = h("p", { class: "view-lead" });
  const selA = h("select", { class: "vc-select cmp-select", id: "cmp-a" });
  const selB = h("select", { class: "vc-select cmp-select", id: "cmp-b" });
  const labA = h("label", { class: "cmp-pick", dataset: { series: "a" }, for: "cmp-a" }, h("span", { class: "cmp-key", "aria-hidden": "true" }), h("span", { class: "cmp-pick-label" }));
  const labB = h("label", { class: "cmp-pick", dataset: { series: "b" }, for: "cmp-b" }, h("span", { class: "cmp-key", "aria-hidden": "true" }), h("span", { class: "cmp-pick-label" }));
  const spiderHost = h("div", { class: "cmp-spider" });
  const tableHost = h("div", { class: "cmp-table-host" });
  const empty = h("p", { class: "vc-alert cmp-empty", hidden: true });
  const body = h("div", { class: "cmp-body" }, spiderHost, tableHost);
  const el = h("section", { class: "compare view", hidden: true, "aria-labelledby": "cmp-title" },
    h("header", { class: "view-head" }, h("div", { class: "view-heading" }, title, lead), h("div", { class: "view-slot" })),
    h("div", { class: "cmp-pickers" }, h("div", { class: "cmp-field" }, labA, selA), h("div", { class: "cmp-field" }, labB, selB)),
    empty, body);
  host.append(el);

  selA.addEventListener("change", () => { state.a = selA.value; if (state.b === state.a) state.b = other(state.a); render(); });
  selB.addEventListener("change", () => { state.b = selB.value; if (state.a === state.b) state.a = other(state.b); render(); });

  const other = (key) => state.list.find((x) => x.item.key !== key)?.item.key || null;

  function options(sel, chosen, lang) {
    sel.replaceChildren(...state.list.map(({ item, assessment }) => h("option", { value: item.key }, itemLabel(item, assessment, lang))));
    if (chosen) sel.value = chosen;
  }

  async function render() {
    if (el.hidden) return;
    const token = ++state.token;
    const lang = getLang();
    const list = await loadedAssessments(lang);
    if (token !== state.token) return;
    state.list = list;
    title.textContent = t("compare.title");
    lead.textContent = t("compare.lead", { n: fmtInt(list.length) });
    labA.lastChild.textContent = t("compare.first");
    labB.lastChild.textContent = t("compare.second");
    const keys = list.map((x) => x.item.key);
    if (!keys.includes(state.a)) state.a = keys[0] || null;
    if (!keys.includes(state.b) || state.b === state.a) state.b = keys.find((k) => k !== state.a) || null;
    options(selA, state.a, lang);
    options(selB, state.b, lang);
    const enough = list.length >= 2;
    empty.hidden = enough;
    body.hidden = !enough;
    selA.disabled = !enough;
    selB.disabled = !enough;
    if (!enough) {
      empty.textContent = t("compare.needTwo");
      clear(spiderHost);
      clear(tableHost);
      return;
    }
    const A = list.find((x) => x.item.key === state.a);
    const B = list.find((x) => x.item.key === state.b);
    const weights = getWeights();
    const ra = scoreAssessment(A.assessment, weights);
    const rb = scoreAssessment(B.assessment, weights);
    const nameA = serviceName(A.assessment, lang);
    const nameB = serviceName(B.assessment, lang);
    drawSpider(ra, rb, nameA, nameB);
    drawTable(A, B, ra, rb, nameA, nameB, lang);
  }

  function layerValue(r, l) {
    const L = r.layers[l];
    return L.score === null ? t(layerStatusKey(L.status, L.blocks)) : fmtScore(L.score);
  }

  function drawSpider(ra, rb, nameA, nameB) {
    const axes = LAYERS.map((l) => ({
      id: l,
      lines: wrapWords(t(`layer.${l}`), 22, 3),
      value: ra.layers[l].score,
      valueText: ra.layers[l].score === null ? null : fmtScore(ra.layers[l].score),
      dashed: ra.layers[l].score === null && rb.layers[l].score === null,
      title: `${t(`layer.${l}.full`)}: ${nameA} ${layerValue(ra, l)}; ${nameB} ${layerValue(rb, l)}`
    }));
    const b = spiderHost.getBoundingClientRect();
    spiderHost.replaceChildren(
      h("ul", { class: "cmp-legend", "aria-label": t("compare.legend") },
        h("li", { dataset: { series: "a" } }, h("span", { class: "cmp-key", "aria-hidden": "true" }), h("span", {}, nameA)),
        h("li", { dataset: { series: "b" } }, h("span", { class: "cmp-key", "aria-hidden": "true" }), h("span", {}, nameB))),
      spiderSvg({
        axes, kind: "layer", id: "cmp-spider",
        box: b.width > 0 && b.height > 60 ? { w: b.width, h: b.height - 40 } : null,
        ticks: [25, 50, 75, 100].map((v) => ({ f: v / 100, text: fmtInt(v) })),
        title: t("compare.spider", { a: nameA, b: nameB }),
        desc: t("compare.spiderDesc"),
        second: { values: LAYERS.map((l) => rb.layers[l].score), texts: LAYERS.map((l) => (rb.layers[l].score === null ? "" : fmtScore(rb.layers[l].score))) }
      }));
  }

  function drawTable(A, B, ra, rb, nameA, nameB, lang) {
    const cell = (key, value, text, series) => h("td", { class: "num vc-tabular", dataset: { key, series, value: value === null || value === undefined ? "" : String(value) } }, text);
    const delta = (key, a, b) => h("td", { class: "num vc-tabular", dataset: { key, series: "delta", value: a !== null && b !== null ? String(b - a) : "" } }, a !== null && b !== null ? fmtDelta(b - a) : "–");
    const rows = [];
    for (const l of LAYERS) {
      const a = ra.layers[l].score;
      const b = rb.layers[l].score;
      rows.push(h("tr", { dataset: { row: `layer.${l}` } }, h("th", { scope: "row", title: t(`layer.${l}.full`) }, t(`layer.${l}`)),
        cell(`score.layer.${l}`, a, layerValue(ra, l), "a"), cell(`score.layer.${l}`, b, layerValue(rb, l), "b"), delta(`score.layer.${l}`, a, b)));
    }
    rows.push(h("tr", { class: "cmp-total", dataset: { row: "overall" } }, h("th", { scope: "row" }, t("compare.row.overall")),
      cell("score.overall", ra.overall, fmtScore(ra.overall), "a"), cell("score.overall", rb.overall, fmtScore(rb.overall), "b"), delta("score.overall", ra.overall, rb.overall)));
    const layersScored = (r) => LAYERS.filter((l) => r.layers[l].score !== null).length;
    rows.push(h("tr", { dataset: { row: "layers" } }, h("th", { scope: "row" }, t("compare.row.layers")),
      cell("layers", layersScored(ra), t("map.layersScored", { scored: fmtInt(layersScored(ra)), all: fmtInt(LAYERS.length) }), "a"),
      cell("layers", layersScored(rb), t("map.layersScored", { scored: fmtInt(layersScored(rb)), all: fmtInt(LAYERS.length) }), "b"), h("td", { class: "num" }, "–")));
    rows.push(h("tr", { dataset: { row: "weakest" } }, h("th", { scope: "row" }, t("kpi.weakest.label")),
      cell("weakest.level", ra.weakest?.level ?? null, weakestText(ra, lang), "a"), cell("weakest.level", rb.weakest?.level ?? null, weakestText(rb, lang), "b"), h("td", { class: "num" }, "–")));
    rows.push(h("tr", { dataset: { row: "coverage" } }, h("th", { scope: "row" }, t("kpi.coverage.label")),
      cell("coverage", ra.coverage, fmtShare(ra.coverage), "a"), cell("coverage", rb.coverage, fmtShare(rb.coverage), "b"), h("td", { class: "num" }, "–")));
    rows.push(h("tr", { dataset: { row: "exclusive" } }, h("th", { scope: "row" }, t("kpi.exclusive.label")),
      cell("share.exclusive_non_eu", ra.exclusive_non_eu, fmtShare(ra.exclusive_non_eu), "a"), cell("share.exclusive_non_eu", rb.exclusive_non_eu, fmtShare(rb.exclusive_non_eu), "b"), h("td", { class: "num" }, "–")));
    const scored = (r) => r.blocks.filter((x) => !x.unscored).length;
    rows.push(h("tr", { dataset: { row: "blocks" } }, h("th", { scope: "row" }, t("compare.row.blocks")),
      cell("blocks", scored(ra), t("map.blocksScored", { scored: fmtInt(scored(ra)), all: fmtInt(ra.blocks.length) }), "a"),
      cell("blocks", scored(rb), t("map.blocksScored", { scored: fmtInt(scored(rb)), all: fmtInt(rb.blocks.length) }), "b"), h("td", { class: "num" }, "–")));
    rows.push(h("tr", { dataset: { row: "asof" } }, h("th", { scope: "row" }, t("compare.row.asOf")),
      h("td", { class: "num" }, itemLabel(A.item, A.assessment, lang)), h("td", { class: "num" }, itemLabel(B.item, B.assessment, lang)), h("td", { class: "num" }, "–")));
    tableHost.replaceChildren(h("table", { class: "vc-table map-table cmp-table", id: "cmp-table" },
      h("caption", {}, t("compare.table", { a: nameA, b: nameB })),
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, t("compare.col.measure")),
        h("th", { scope: "col", class: "num", dataset: { series: "a" } }, h("span", { class: "cmp-key", "aria-hidden": "true" }), nameA),
        h("th", { scope: "col", class: "num", dataset: { series: "b" } }, h("span", { class: "cmp-key", "aria-hidden": "true" }), nameB),
        h("th", { scope: "col", class: "num" }, t("compare.col.delta")))),
      h("tbody", {}, rows)));
  }

  // The spider is drawn at its host's size: it follows a resize, in the next frame.
  let frame = 0;
  let key = "";
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      const b = spiderHost.getBoundingClientRect();
      const k = `${Math.round(b.width / 8)}x${Math.round(b.height / 8)}`;
      if (k === key) return;
      key = k;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (!el.hidden) render(); });
    }).observe(spiderHost);
  }

  onLang(() => render());
  onLoaded(() => render());
  onWeights(() => render());

  return {
    el,
    render,
    /** Chooses the two assessments by their keys (the first stays in teal). */
    choose(a, b) { if (a) state.a = a; if (b) state.b = b; return render(); }
  };
}
