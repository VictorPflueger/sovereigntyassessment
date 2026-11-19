// The spider diagram (brief §9; PLAN.md f.1): plain SVG, concentric polygons for levels 0 to 4 at 0, 25,
// 50, 75 and 100, hexagon markers with the value on each axis, a dashed axis where there is no score. The
// first axis at the top, the others clockwise. By layer: the six layers of the Deutschland-Stack in the
// portal's order, so the web is a hexagon. By building block: one axis per block at 25 × its level,
// labelled with its id, its Made-in and Run-by codes and its name; an unscored block's axis is dashed.
// The assessed service is teal (--vc-data-2) on its pastel fill: merlot means the person in charge
// (DESIGN.md). Nothing round: markers and rings are polygons (tests/hexagon.mjs).

const NS = "http://www.w3.org/2000/svg";

/** An SVG element: attributes as given, children as nodes or text. */
export function svg(tag, attrs = {}, ...children) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) el.setAttribute(k, String(v));
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const r2 = (x) => Math.round(x * 100) / 100;

/** The angle of axis i of n, in radians: the first at the top, the others clockwise. */
export function axisAngle(i, n) {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n;
}

/** A point at fraction f (0 to 1) of the radius on axis i of n. */
export function axisPoint(i, n, f, { cx, cy, r }) {
  const a = axisAngle(i, n);
  return [cx + Math.cos(a) * r * f, cy + Math.sin(a) * r * f];
}

/** A flat-topped hexagon's points around (x, y) with radius s. */
export function hexPoints(x, y, s) {
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    pts.push(`${r2(x + s * Math.cos(a))},${r2(y + s * Math.sin(a))}`);
  }
  return pts.join(" ");
}

/** Words wrapped into lines of at most `width` characters (a long word keeps its own line). */
export function wrapWords(text, width, maxLines = 3) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > width) { lines.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines;
  // More lines than allowed: the rest joins the last line, so nothing is lost.
  return [...lines.slice(0, maxLines - 1), lines.slice(maxLines - 1).join(" ")];
}

/**
 * The diagram. axes: [{ id, lines: [text…] (the label), value (0 to 100, or null), valueText, title }].
 * kind: "layer" or "block". ticks: [{ f, text }] ring labels. box: the host's size in pixels, when known.
 * Returns the <svg>.
 *
 * With a box, one unit of the drawing is one pixel: the web takes what room the labels leave, and the
 * labels keep their size in the stylesheet, so a short map (a small screen, the drawer open) draws a
 * smaller web with labels that stay legible instead of shrinking the whole picture (PLAN.md f.1).
 */
/** About how wide a character of a label is, in pixels, at the label's size in the stylesheet. */
const CHAR_PX = { layer: 8.2, block: 6.8 };

/**
 * A label's lines for a narrow box: re-wrapped to at most `width` characters (a long word keeps its own
 * line). In the block view the first line (the id and the codes) stays as it is.
 */
export function fitLabel(lines, width, kind) {
  const keep = kind === "block" ? lines.slice(0, 1) : [];
  const rest = kind === "block" ? lines.slice(1) : lines;
  if (!rest.length || rest.every((l) => String(l).length <= width)) return lines;
  return [...keep, ...wrapWords(rest.join(" "), width, kind === "block" ? 3 : 4)];
}

export function spiderGeometry(kind, n, box = null, longest = 0) {
  if (!box || !(box.w > 0) || !(box.h > 0)) {
    const W = 760;
    const H = 560;
    return { W, H, cx: W / 2, cy: H / 2 + 6, r: kind === "layer" ? 178 : n > 12 ? 170 : 182 };
  }
  const W = Math.max(320, Math.round(box.w));
  const H = Math.max(220, Math.round(box.h));
  // Room for the labels beside and above or below the web, from the longest label line at the label's
  // size in the stylesheet (15 px in the layer view, 12 px in the block view, about half an em a
  // character); three lines of a block's label need more height.
  const perChar = CHAR_PX[kind] || CHAR_PX.layer;
  const padX = Math.max(kind === "layer" ? 110 : 120, (kind === "layer" ? 22 : 16) + longest * perChar + 6);
  const padY = kind === "layer" ? 50 : 60;
  const r = Math.max(48, Math.min(230, (W - 2 * padX) / 2, (H - 2 * padY) / 2));
  return { W, H, cx: W / 2, cy: H / 2 + 4, r };
}

export function spiderSvg({ axes, kind = "layer", ticks = [], title = "", desc = "", box = null }) {
  const n = axes.length;
  // A short box: the block view's labels keep only the id and the codes, at the small size (each axis's
  // tooltip, the honeycomb and the table still name the block).
  const shortBox = !!box && kind === "block" && (box.h < 340 || box.w < 520);
  const big = !shortBox && (kind === "layer" || n <= 8);
  // Each label with the status line a dashed axis adds; in a box narrower than the labels need beside a
  // web of the smallest radius, the labels wrap narrower so they stay inside the drawing.
  const statusLines = axes.map((ax) => ((ax.value === null || ax.value === undefined) && ax.valueText ? 1 : 0));
  let labels = axes.map((ax, i) => [...(ax.lines || []), ...(statusLines[i] ? [ax.valueText] : [])].map(String));
  if (shortBox) labels = labels.map((l, i) => (statusLines[i] ? [l[0], l[l.length - 1]] : [l[0]]));
  if (box && box.w > 0 && !shortBox) {
    const room = (Math.max(320, Math.round(box.w)) - 2 * 60) / 2 - (kind === "layer" ? 22 : 16) - 8;
    const fit = Math.max(8, Math.floor(room / (CHAR_PX[kind] || CHAR_PX.layer)));
    labels = labels.map((l, i) => {
      // The status line of a dashed axis wraps on its own, after the name.
      if (!statusLines[i]) return fitLabel(l, fit, kind);
      const status = wrapWords(l[l.length - 1], fit, 2);
      statusLines[i] = status.length;
      return [...fitLabel(l.slice(0, -1), fit, kind), ...status];
    });
  }
  const longest = Math.max(0, ...labels.map((l) => Math.max(0, ...l.map((x) => x.length))));
  const { W, H, ...geo } = spiderGeometry(kind, n, box, longest);
  // A small web (a short map): no ring labels, smaller values, so nothing crowds the markers.
  const tight = geo.r < 90;
  const ring = Math.max(n, 3) === n ? n : 6; // fewer than three axes: hexagon rings
  const root = svg("svg", { class: "spider", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-labelledby": "spider-title spider-desc", "data-view": kind, "data-axes": n, preserveAspectRatio: "xMidYMid meet" });
  root.append(svg("title", { id: "spider-title" }, title), svg("desc", { id: "spider-desc" }, desc));

  // Rings for levels 1 to 4 (25, 50, 75, 100); level 0 is the centre.
  const rings = svg("g", { class: "sp-rings", "aria-hidden": "true" });
  for (const f of [0.25, 0.5, 0.75, 1]) {
    const pts = [];
    for (let i = 0; i < ring; i++) {
      const [x, y] = axisPoint(i, ring, f, geo);
      pts.push(`${r2(x)},${r2(y)}`);
    }
    rings.append(svg("polygon", { class: f === 1 ? "sp-ring sp-ring--outer" : "sp-ring", points: pts.join(" ") }));
  }
  for (const tk of tight ? [] : ticks) {
    rings.append(svg("text", { class: "sp-tick", x: r2(geo.cx + 6), y: r2(geo.cy - geo.r * tk.f - 4) }, tk.text));
  }
  root.append(rings);

  // Axes, with their labels.
  const axesG = svg("g", { class: "sp-axes" });
  axes.forEach((ax, i) => {
    const [x2, y2] = axisPoint(i, n, 1, geo);
    const dashed = ax.value === null || ax.value === undefined;
    const g = svg("g", { class: "sp-axis-g", "data-axis": ax.id, "data-value": dashed ? "" : String(ax.value), "data-dashed": dashed ? "true" : "false" });
    g.append(svg("title", {}, ax.title || ax.lines.join(" ")));
    g.append(svg("line", { class: dashed ? "sp-axis sp-axis--dashed" : "sp-axis", x1: geo.cx, y1: geo.cy, x2: r2(x2), y2: r2(y2) }));
    // The label beyond the axis end, anchored away from the centre.
    const a = axisAngle(i, n);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const gap = kind === "layer" ? 20 : 14;
    const lx = geo.cx + cos * (geo.r + gap);
    const ly = geo.cy + sin * (geo.r + gap);
    const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
    const lines = labels[i];
    const lh = big ? 17 : 14;
    const startY = sin < -0.3 ? ly - (lines.length - 1) * lh : sin > 0.3 ? ly + lh * 0.7 : ly - ((lines.length - 1) * lh) / 2 + 5;
    const text = svg("text", { class: big ? "sp-label" : "sp-label sp-label--small", x: r2(lx), y: r2(startY), "text-anchor": anchor });
    lines.forEach((line, k) => {
      const cls = k === 0 && kind === "block" ? "sp-label-strong" : k >= lines.length - statusLines[i] ? "sp-label-muted" : null;
      text.append(svg("tspan", { x: r2(lx), dy: k === 0 ? 0 : lh, class: cls }, line));
    });
    g.append(text);
    axesG.append(g);
  });
  root.append(axesG);

  // The service's area through the axes that have a value, in axis order.
  const pts = axes.map((ax, i) => (ax.value === null || ax.value === undefined ? null : axisPoint(i, n, Math.max(0, Math.min(100, ax.value)) / 100, geo))).filter(Boolean);
  if (pts.length >= 2) root.append(svg("polygon", { class: "sp-area", points: pts.map(([x, y]) => `${r2(x)},${r2(y)}`).join(" ") }));

  // Hexagon markers with the value beside them.
  const marks = svg("g", { class: "sp-markers" });
  axes.forEach((ax, i) => {
    if (ax.value === null || ax.value === undefined) return;
    const f = Math.max(0, Math.min(100, ax.value)) / 100;
    const [x, y] = axisPoint(i, n, f, geo);
    marks.append(svg("polygon", { class: "sp-marker", points: hexPoints(x, y, big ? 8 : 6.5), "data-axis": ax.id }));
    const a = axisAngle(i, n);
    const off = big ? 20 : 15;
    const tx = x + Math.cos(a + Math.PI / 2) * off * 0.9 + Math.cos(a) * 4;
    const ty = y + Math.sin(a + Math.PI / 2) * off * 0.9 + Math.sin(a) * 4 + 5;
    marks.append(svg("text", { class: big && !tight ? "sp-value" : "sp-value sp-value--small", x: r2(tx), y: r2(ty), "text-anchor": "middle", "data-axis": ax.id }, ax.valueText));
  });
  root.append(marks);
  return root;
}
