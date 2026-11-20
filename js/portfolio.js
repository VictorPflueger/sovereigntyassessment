// The Portfolio (brief §9; AC-16): every loaded assessment at once. A sorted bar chart of the overall
// scores (no pies or donuts); per category, the exclusive non-EU control pooled over the scored critical
// blocks of its assessments (PLAN.md I11, the engine's portfolio()), and the Made-in mix as a hexagon
// waffle: one cell per building block, grouped by class, each group named with its class and count, so
// nothing reads by colour alone. The self-assessment of this prototype stays out (brief §8). A figure
// without a basis shows "no data", never 0. The person manages the loaded set here: assessment files
// (exports of this app) are loaded and checked against the schema, the pre-runs added again, one
// assessment or all removed.

import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { t, tn, onLang, getLang } from "./i18n/index.js";
import { fmtInt, fmtScore, fmtShare } from "./format.js";
import { CLASSES } from "./classes.js";
import { portfolio, LAYERS } from "./engine.js";
import { effectiveBlocks, scoreAssessment, serviceName } from "./assessment.js";
import { loadedAssessments, onLoaded, addFile, addPreRuns, clearLoaded, removeLoaded } from "./loaded.js";
import { getWeights, onWeights } from "./weights.js";
import { itemLabel } from "./compare.js";
import { svg, hexPoints } from "./spider.js";

const CATS = ["base_service", "platform_or_access"];
const MAX_FILE = 5 * 1024 * 1024;

/** One group of the waffle: n flat-topped hexagons in rows of twelve, drawn as SVG polygons. */
const PER_ROW = 12;
function waffleCells(n) {
  const s = 8;                         // the hexagon's radius
  const dx = 1.5 * s + 2.5;            // flat-topped hexagons side by side, rows offset like a honeycomb
  const dy = Math.sqrt(3) * s + 2;
  const cols = Math.min(n, PER_ROW);
  const rows = Math.ceil(n / PER_ROW);
  const W = (cols - 1) * dx + 2 * s + 1;
  const H = rows * dy + dy / 2 + 1;
  const root = svg("svg", { class: "waffle-svg", viewBox: `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`, width: W.toFixed(1), height: H.toFixed(1), "aria-hidden": "true", focusable: "false" });
  for (let i = 0; i < n; i++) {
    const col = i % PER_ROW;
    const row = Math.floor(i / PER_ROW);
    const x = s + 0.5 + col * dx;
    const y = s * Math.sqrt(3) / 2 + 0.5 + row * dy + (col % 2 ? dy / 2 : 0);
    root.append(svg("polygon", { class: "waffle-hex", points: hexPoints(x, y, s) }));
  }
  return root;
}

export function createPortfolio(host) {
  const state = { token: 0 };
  const title = h("h2", { class: "view-title", id: "pf-title" });
  const lead = h("p", { class: "view-lead" });
  const file = h("input", { type: "file", accept: ".json,application/json", multiple: true, class: "vc-visually-hidden", id: "pf-file", tabindex: "-1", "aria-hidden": "true" });
  const loadBtn = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button", id: "pf-load" });
  const preBtn = h("button", { class: "vc-button vc-button--secondary vc-button--sm", type: "button", id: "pf-prerun" });
  const clearBtn = h("button", { class: "vc-button vc-button--ghost vc-button--sm", type: "button", id: "pf-clear" });
  const status = h("p", { class: "pf-status", role: "status", "aria-live": "polite" });
  const scores = h("section", { class: "pf-scores", "aria-labelledby": "pf-scores-title" });
  const cats = h("div", { class: "pf-cats" });
  const loadedList = h("section", { class: "pf-loaded", "aria-labelledby": "pf-loaded-title" });
  const empty = h("div", { class: "vc-empty pf-empty", hidden: true });
  const body = h("div", { class: "pf-body" }, scores, cats);
  const el = h("section", { class: "portfolio view", hidden: true, "aria-labelledby": "pf-title" },
    h("header", { class: "view-head" }, h("div", { class: "view-heading" }, title, lead), h("div", { class: "view-slot" })),
    h("div", { class: "pf-actions" }, loadBtn, preBtn, clearBtn, file),
    status, empty, body, loadedList);
  host.append(el);

  loadBtn.addEventListener("click", () => file.click());
  file.addEventListener("change", async () => {
    const files = [...(file.files || [])];
    file.value = "";
    if (!files.length) return;
    const ok = [];
    const bad = [];
    for (const f of files) {
      if (f.size > MAX_FILE) { bad.push(t("portfolio.file.tooBig", { file: f.name })); continue; }
      const r = addFile(await f.text(), f.name);
      if (r.ok) ok.push(f.name);
      else bad.push(t("portfolio.file.invalid", { file: f.name, n: fmtInt(r.errors.length), path: r.errors[0]?.path || "–" }));
    }
    setStatus([ok.length ? t("portfolio.file.loaded", { n: fmtInt(ok.length) }) : null, ...bad].filter(Boolean).join(" "), bad.length ? "warn" : "ok");
  });
  preBtn.addEventListener("click", () => {
    const n = addPreRuns();
    setStatus(n ? t("portfolio.preRunsAdded", { n: fmtInt(n) }) : t("portfolio.preRunsThere"), "ok");
  });
  clearBtn.addEventListener("click", () => { clearLoaded(); setStatus(t("portfolio.cleared"), "ok"); });

  function setStatus(text, tone) {
    status.textContent = text;
    status.dataset.tone = tone;
  }

  async function render() {
    if (el.hidden) return;
    const token = ++state.token;
    const lang = getLang();
    const list = await loadedAssessments(lang);
    if (token !== state.token) return;
    const weights = getWeights();
    title.textContent = t("portfolio.title");
    loadBtn.replaceChildren(icon("upload", 16), t("portfolio.load"));
    preBtn.replaceChildren(icon("play", 16), t("portfolio.addPreRuns"));
    clearBtn.replaceChildren(icon("x", 16), t("portfolio.clear"));
    clearBtn.disabled = !list.length;

    const inScope = list.filter((x) => x.assessment.category !== "self_assessment");
    const left = list.length - inScope.length;
    lead.textContent = t(left ? "portfolio.leadSelf" : "portfolio.lead", { n: fmtInt(inScope.length) });
    empty.hidden = !!inScope.length;
    body.hidden = !inScope.length;
    if (!inScope.length) {
      empty.replaceChildren(h("strong", { class: "vc-empty__title" }, t("portfolio.emptyTitle")), h("p", { class: "vc-empty__text" }, t("portfolio.empty")));
    }

    // The engine's portfolio over the gated blocks, with the weights in force.
    const p = portfolio(list.map(({ item, assessment }) => ({ service: item.key, category: assessment.category, blocks: effectiveBlocks(assessment) })), { layerWeights: weights });
    const rows = inScope.map(({ item, assessment }) => {
      const s = scoreAssessment(assessment, weights);
      return { item, assessment, overall: s.overall, layers: LAYERS.filter((l) => s.layers?.[l]?.score !== null && s.layers?.[l]?.score !== undefined).length };
    })
      .sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1) || serviceName(a.assessment, lang).localeCompare(serviceName(b.assessment, lang), lang));
    drawScores(rows, lang);
    drawCategories(p);
    drawLoaded(list, weights, lang);
  }

  function drawScores(rows, lang) {
    const ol = h("ol", { class: "pf-bars", "aria-labelledby": "pf-scores-title" });
    for (const r of rows) {
      const bar = h("span", { class: "pf-bar", "aria-hidden": "true" });
      if (r.overall !== null) bar.style.width = `${Math.max(0, Math.min(100, r.overall))}%`;
      ol.append(h("li", { class: "pf-row", dataset: { key: r.item.key, category: r.assessment.category, overall: r.overall === null ? "" : String(r.overall) } },
        h("span", { class: "pf-name" }, serviceName(r.assessment, lang), h("span", { class: "vc-tag pf-cat-tag" }, t(`portfolio.cat.short.${r.assessment.category}`)),
          // A score that rests on fewer than six layers says so (the review's finding R-11).
          r.overall !== null && r.layers < LAYERS.length ? h("span", { class: "pf-layers" }, t("portfolio.layersScored", { scored: fmtInt(r.layers), all: fmtInt(LAYERS.length) })) : null),
        h("span", { class: "pf-track", dataset: { nodata: r.overall === null ? "true" : "false" } }, bar),
        h("span", { class: "pf-value vc-tabular" }, r.overall === null ? t("fact.noData") : fmtScore(r.overall))));
    }
    scores.replaceChildren(h("h3", { class: "pf-h", id: "pf-scores-title" }, t("portfolio.scores")), h("p", { class: "pf-note" }, t("portfolio.scoresNote")), ol);
  }

  function drawCategories(p) {
    clear(cats);
    for (const cat of CATS) {
      const c = p.categories[cat];
      const share = c ? c.exclusive_non_eu : null;
      const shareBar = h("span", { class: "pf-share-bar", "aria-hidden": "true" });
      if (share !== null) shareBar.style.width = `${100 * share}%`;
      const waffle = h("div", { class: "waffle", role: "list", "aria-label": t("portfolio.waffle", { cat: t(`catalogue.cat.${cat}`) }) });
      for (const cls of CLASSES) {
        const n = c?.made_in?.[cls] || 0;
        if (!n) continue;
        waffle.append(h("div", { class: "waffle-group", role: "listitem", dataset: { cls, n: String(n) }, title: t(`class.${cls}`) },
          h("span", { class: "waffle-label", "aria-hidden": "true" }, h("strong", {}, t(`class.${cls}.short`)), " ", h("span", { class: "vc-tabular" }, fmtInt(n))),
          waffleCells(n),
          h("span", { class: "vc-visually-hidden" }, t("portfolio.waffleRow", { cls: t(`class.${cls}`), n: fmtInt(n) }))));
      }
      cats.append(h("article", { class: "vc-card pf-cat", dataset: { category: cat } },
        h("h3", { class: "pf-h" }, t(`catalogue.cat.${cat}`), " ", h("span", { class: "pf-count" }, "· ", tn("portfolio.services", c?.services.length || 0, { n: fmtInt(c?.services.length || 0) }))),
        h("div", { class: "pf-share", dataset: { value: share === null ? "" : String(share) } },
          h("span", { class: "pf-share-label" }, t("kpi.exclusive.label")),
          h("strong", { class: "pf-share-value vc-tabular" }, share === null ? t("fact.noData") : fmtShare(share)),
          h("span", { class: "pf-share-track" }, shareBar),
          h("span", { class: "pf-share-note" }, c && c.critical ? t("portfolio.shareNote", { k: fmtInt(c.exclusive), n: fmtInt(c.critical) }) : t("portfolio.shareNone"))),
        h("h4", { class: "pf-sub" }, t("map.mix.madeIn")),
        waffle.childElementCount ? waffle : h("p", { class: "pf-note" }, t("map.mix.empty"))));
    }
  }

  function drawLoaded(list, weights, lang) {
    const rows = list.map(({ item, assessment }) => {
      const remove = h("button", { class: "vc-button vc-button--ghost vc-button--sm pf-remove", type: "button", dataset: { key: item.key }, "aria-label": t("portfolio.removeOne", { name: itemLabel(item, assessment, lang) }) }, icon("x", 16), t("portfolio.remove"));
      remove.addEventListener("click", () => { removeLoaded(item.key); setStatus(t("portfolio.removed", { name: serviceName(assessment, lang) }), "ok"); });
      const overall = scoreAssessment(assessment, weights).overall;
      return h("tr", { dataset: { key: item.key, origin: item.origin } },
        h("th", { scope: "row" }, itemLabel(item, assessment, lang)),
        h("td", {}, assessment.category === "self_assessment" ? h("span", { class: "vc-tag" }, t("portfolio.leftOut")) : t(`portfolio.cat.short.${assessment.category}`)),
        h("td", { class: "num vc-tabular" }, overall === null ? t("fact.noData") : fmtScore(overall)),
        h("td", { class: "num" }, remove));
    });
    loadedList.replaceChildren(h("h3", { class: "pf-h", id: "pf-loaded-title" }, t("portfolio.loaded", { n: fmtInt(list.length) })),
      list.length
        ? h("table", { class: "vc-table map-table pf-table" },
          h("thead", {}, h("tr", {}, h("th", { scope: "col" }, t("portfolio.col.assessment")), h("th", { scope: "col" }, t("portfolio.col.category")), h("th", { scope: "col", class: "num" }, t("kpi.overall.label")), h("th", { scope: "col", class: "num" }, h("span", { class: "vc-visually-hidden" }, t("portfolio.remove"))))),
          h("tbody", {}, rows))
        : h("p", { class: "pf-note" }, t("portfolio.noneLoaded")));
  }

  onLang(() => render());
  onLoaded(() => render());
  onWeights(() => render());
  return { el, render };
}
