// The spider diagram (brief §9; PLAN.md f.1): plain SVG, concentric polygons for levels 0 to 4 at 0, 25,
// 50, 75 and 100, hexagon markers with the value on each axis, a dashed axis where there is no score. The
// first axis at the top, the others clockwise. By layer: the six layers of the Deutschland-Stack in the
// portal's order, so the web is a hexagon. By building block: one axis per block at 25 × its level,
// labelled with its id, its Made-in and Run-by codes and its name; an unscored block's axis is dashed.
// The assessed service is teal (--vc-data-2) on its pastel fill: merlot means the person in charge
// (DESIGN.md). Compare draws a second assessment over the first in apricot (--vc-data-3), with a dashed
// line and hollow markers, so the two series also differ without colour. Nothing round: markers and
// rings are polygons (tests/hexagon.mjs).

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
 * The diagram. axes: [{ id, lines: [text…] (the label), value (0 to 100, or null), valueText, title,
 * dashed? }]. kind: "layer" or "block". ticks: [{ f, text }] ring labels. box: the host's size in pixels,
 * when known. second (Compare): { values: [0 to 100 or null per axis], texts: [value text per axis] },
 * drawn over the first series; an axis is dashed when `dashed` says so, else when it has no value.
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

export function spiderGeometry(kind, n, box = null, longest = 0, labels = null, big = true, extra = 0) {
  if (!box || !(box.w > 0) || !(box.h > 0)) {
    const W = 760;
    const H = 560;
    return { W, H, cx: W / 2, cy: H / 2 + 6, r: kind === "layer" ? 178 : n > 12 ? 170 : 182 };
  }
  const W = Math.max(320, Math.round(box.w));
  const H = Math.max(220, Math.round(box.h));
  // The small label size (12 px) is about as wide per character in both views.
  const perChar = big ? CHAR_PX[kind] || CHAR_PX.layer : CHAR_PX.block;
  const gap = kind === "layer" ? 20 : 14;
  const cx = W / 2;
  // The block view sets its labels in columns beside the web (blockLabels): the web leaves room for the
  // longest label line on each side.
  // extra: room the block view's values need beyond the web, so the labels stand clear of them.
  if (kind === "block" || !labels) {
    const padX = Math.max(kind === "layer" ? 110 : 120, (kind === "layer" ? 22 : 16) + longest * perChar + 6) + extra;
    const padY = kind === "layer" ? 50 : 60;
    const fit = Math.min(230, (W - 2 * padX) / 2, (H - 2 * padY) / 2);
    return { W, H, cx, cy: H / 2 + 4, r: Math.max(48, fit), fit };
  }
  // The layer view: the largest web whose every label, placed as spiderSvg places it, stays inside the
  // drawing, from each label's lines (a long label wraps to more lines, a status line adds one). Each
  // edge of a label moves with the radius along its axis, so each gives a bound; the centre moves up or
  // down where that buys a larger web (a long label at the bottom, a short one at the top).
  const font = big ? 15 : 12;
  const lh = big ? 17 : 14;
  const asc = font * 0.8;
  const desc = font * 0.3;
  const boxes = labels.map((lines, i) => {
    const a = axisAngle(i, n);
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const L = Math.max(1, lines.length);
    const w = Math.max(0, ...lines.map((l) => String(l).length)) * perChar;
    const anchor = c > 0.3 ? "start" : c < -0.3 ? "end" : "middle";
    const [x0, x1] = anchor === "start" ? [0, w] : anchor === "end" ? [-w, 0] : [-w / 2, w / 2];
    const base = sn < -0.3 ? -(L - 1) * lh : sn > 0.3 ? 0.7 * lh : -((L - 1) * lh) / 2 + 5;
    return { c, sn, x0, x1, y0: base - asc, y1: base + (L - 1) * lh + desc };
  });
  const lim = (coef, room) => (coef > 1e-6 ? room / coef - gap : Infinity);
  const radiusAt = (cy) => Math.min(230, ...boxes.flatMap((b) => [
    lim(b.c, W - 3 - cx - b.x1),
    lim(-b.c, cx + b.x0 - 3),
    lim(b.sn, H - 3 - cy - b.y1),
    lim(-b.sn, cy + b.y0 - 3)
  ]));
  let best = { cy: H / 2 + 4, r: radiusAt(H / 2 + 4) };
  for (let d = -60; d <= 60; d += 4) {
    const cy = H / 2 + d;
    const r = radiusAt(cy);
    if (r > best.r + 0.5) best = { cy, r };
  }
  // fit: the radius the labels allow, before the floor; a caller compares label sets by it.
  return { W, H, cx, cy: best.cy, r: Math.max(40, best.r), fit: best.r };
}

/**
 * The block view's labels in two columns: an axis on the right half labels to the right of the web, one on
 * the left half to the left (the first axis, at the top, counts as right). In each column the labels keep
 * their axes' order from top to bottom and are pushed apart until none overlaps the next, within the
 * drawing's height; each stays outside the web's circle, and one moved away from its axis end gets a
 * leader line. When a column's labels cannot fit at full length, every label keeps its first line (the
 * id and the codes), and failing that only the id. Returns per axis { x, y (first baseline), anchor,
 * lines, status, leader }.
 */
const BLOCK_MARGIN = 8;
const blockSide = (i, n) => (i === 0 || Math.cos(axisAngle(i, n)) > 1e-9 ? "right" : "left");

/**
 * How much of each label the block view's two columns keep so that the busier column fits the drawing's
 * height: "full", the first line ("first": the id and the codes), or only the id ("id"). It depends on
 * the height alone, not on the web's radius, so the web can be sized for the lines that will be shown.
 */
export function blockLabelMode(labels, n, H, lh) {
  const room = H - 2 * BLOCK_MARGIN;
  const counts = { right: 0, left: 0 };
  labels.forEach((_, i) => { counts[blockSide(i, n)] += 1; });
  const busiest = Math.max(counts.right, counts.left);
  const need = (linesOf) => Math.max(...["right", "left"].map((sd) => labels.reduce((sum, l, i) => sum + (blockSide(i, n) === sd ? linesOf(l) * lh + 4 : 0), 0)));
  if (need((l) => l.length) <= room) return "full";
  return need(() => 1) <= room || busiest <= 1 ? "first" : "id";
}

/** The lines a block label keeps in a mode of blockLabelMode. */
function blockShown(lines, mode) {
  if (mode === "full") return lines;
  const first = String(lines[0]);
  return [mode === "id" ? first.split(" ")[0] : first];
}

export function blockLabels(labels, statusLines, { n, geo, H, lh, gap, R: radius = null }) {
  const margin = BLOCK_MARGIN;
  const side = (i) => blockSide(i, n);
  const mode = blockLabelMode(labels, n, H, lh);
  const shown = labels.map((l, i) => ({ lines: blockShown(l, mode), status: mode === "full" ? statusLines[i] : 0 }));
  const R = radius ?? geo.r + gap;
  const out = new Array(labels.length);
  for (const sd of ["right", "left"]) {
    const idx = labels.map((_, i) => i).filter((i) => side(i) === sd);
    // Desired: at the axis end's height, moved away from the centre by the share of its own height that
    // the axis's slope asks for, so a label above or below the web sits wholly outside it. Top to bottom on
    // both sides.
    const items = idx.map((i) => {
      const a = axisAngle(i, n);
      const h = shown[i].lines.length * lh;
      return { i, h, want: geo.cy + Math.sin(a) * (R + h / 2), end: [geo.cx + Math.cos(a) * (geo.r + 4), geo.cy + Math.sin(a) * (geo.r + 4)] };
    }).sort((p, q) => p.want - q.want);
    // Push down from the top, then up from the bottom, so the column fits between the margins.
    let y = margin;
    for (const it of items) { it.top = Math.max(it.want - it.h / 2, y); y = it.top + it.h + 4; }
    let bottom = H - margin;
    for (let k = items.length - 1; k >= 0; k--) { const it = items[k]; if (it.top + it.h > bottom) it.top = bottom - it.h; bottom = it.top - 4; }
    for (const it of items) {
      const mid = it.top + it.h / 2;
      // Outside the web's circle on its side, measured at the label's edge nearer the centre, so no part of
      // a label of several lines reaches into the web.
      const near = it.top <= geo.cy && it.top + it.h >= geo.cy ? 0 : Math.min(Math.abs(it.top - geo.cy), Math.abs(it.top + it.h - geo.cy));
      const dx = near < R ? Math.sqrt(R * R - near * near) : 0;
      const x = sd === "right" ? geo.cx + Math.max(dx, 4) : geo.cx - Math.max(dx, 4);
      // A label moved away from its axis end, up, down or aside, is joined to it by a line.
      const moved = Math.abs(mid - it.want) > lh * 0.6 || Math.abs(x - it.end[0]) > R - geo.r + 24;
      out[it.i] = {
        x, y: it.top + lh * 0.78, anchor: sd === "right" ? "start" : "end",
        lines: shown[it.i].lines, status: shown[it.i].status,
        leader: moved ? [it.end, [sd === "right" ? x - 3 : x + 3, mid]] : null
      };
    }
  }
  return out;
}

export function spiderSvg({ axes, kind = "layer", ticks = [], title = "", desc = "", box = null, second = null, id = "spider" }) {
  const n = axes.length;
  // A short box: the block view's labels keep only the id and the codes, at the small size (each axis's
  // tooltip, the honeycomb and the table still name the block).
  const shortBox = !!box && kind === "block" && (box.h < 340 || box.w < 520);
  let big = !shortBox && (kind === "layer" || n <= 8);
  // Each label with the status line a dashed axis adds; in a box narrower than the labels need beside a
  // web of the smallest radius, the labels wrap narrower so they stay inside the drawing.
  let statusLines = axes.map((ax) => ((ax.value === null || ax.value === undefined) && ax.valueText ? 1 : 0));
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
  let longest = Math.max(0, ...labels.map((l) => Math.max(0, ...l.map((x) => x.length))));
  // The block view's web leaves room beside it for the lines its columns will show: with many blocks those
  // are the ids and the codes only, so the names do not shrink the web.
  if (kind === "block" && box && box.h > 0) {
    const mode = blockLabelMode(labels, n, Math.max(220, Math.round(box.h)), big ? 17 : 14);
    longest = Math.max(0, ...labels.map((l) => Math.max(0, ...blockShown(l, mode).map((x) => String(x).length))));
  }
  // The block view's values, shown up to twelve blocks, need room beyond the web: its labels stand clear.
  const showValues = !(kind === "block" && n > 12);
  let { W, H, ...geo } = spiderGeometry(kind, n, box, longest, labels, big, kind === "block" && showValues ? 22 : 0);
  // The layer view on a short map (a small screen, German, every layer still with its status): its labels
  // fall back to the layers' short names, and if the web is still small, to the small label size; the
  // status lines are always counted. The full names stay when they leave the web 96 px; otherwise the short
  // names when they leave 72 px; otherwise whichever set leaves the largest web.
  if (kind === "layer" && box && geo.fit < 96 && axes.every((ax) => Array.isArray(ax.short) && ax.short.length)) {
    const layerSet = (small) => {
      const st = axes.map((ax) => ((ax.value === null || ax.value === undefined) && ax.valueText ? 1 : 0));
      const room = (Math.max(320, Math.round(box.w)) - 2 * 60) / 2 - 22 - 8;
      const fit = Math.max(8, Math.floor(room / (small ? CHAR_PX.block : CHAR_PX.layer)));
      const ls = axes.map((ax, i) => {
        if (!st[i]) return ax.short.map(String);
        const status = wrapWords(String(ax.valueText), fit, 2);
        st[i] = status.length;
        return [...ax.short.map(String), ...status];
      });
      const long = Math.max(0, ...ls.map((l) => Math.max(0, ...l.map((x) => x.length))));
      return { labels: ls, statusLines: st, big: !small, geo: spiderGeometry(kind, n, box, long, ls, !small) };
    };
    const full = { labels, statusLines, big, geo: { W, H, ...geo } };
    const shortBig = layerSet(false);
    let chosen = shortBig.geo.fit > full.geo.fit ? shortBig : full;
    if (chosen.geo.fit < 72) {
      const shortSmall = layerSet(true);
      if (shortSmall.geo.fit > chosen.geo.fit) chosen = shortSmall;
    }
    if (chosen !== full) {
      ({ labels, statusLines, big } = chosen);
      longest = Math.max(0, ...labels.map((l) => Math.max(0, ...l.map((x) => x.length))));
      ({ W, H, ...geo } = chosen.geo);
    }
  }
  // A small web (a short map): no ring labels, smaller values, so nothing crowds the markers.
  const tight = geo.r < 90;
  // How far a value moves from its marker across the axis (angle phi; a is the axis) so that the text's
  // box, with 2 px for its halo, clears the marker's box: either beside it or above or below it, whichever
  // is nearer. The value is centred on x and its baseline is 5 px below the point (and 4 px out along the
  // axis); in the app's font a digit is at most 0.67 em wide and the box runs from 0.94 em above the
  // baseline to 0.24 em below it. The marker is a flat-topped hexagon of radius s.
  const valueOffset = (a, phi, text, s) => {
    const fs = big && !tight ? 17 : 13;
    const halfW = String(text).length * 0.335 * fs + s + 2;
    const halfH = 0.588 * fs + s * 0.866 + 2;
    const c = Math.cos(phi);
    const sn = Math.sin(phi);
    const byX = Math.abs(c) > 1e-6 ? (halfW - Math.sign(c) * 4 * Math.cos(a)) / Math.abs(c) : Infinity;
    const byY = Math.abs(sn) > 1e-6 ? (halfH - Math.sign(sn) * (4 * Math.sin(a) + 5 - 0.353 * fs)) / Math.abs(sn) : Infinity;
    return Math.max(s + 2, Math.min(byX, byY));
  };
  const ring = Math.max(n, 3) === n ? n : 6; // fewer than three axes: hexagon rings
  // A group, not one image: each axis is an image named with its label and value (AC-20), so a screen
  // reader can step through the axes; the rings and the markers are decoration beside those names.
  const root = svg("svg", { class: "spider", viewBox: `0 0 ${W} ${H}`, role: "group", "aria-labelledby": `${id}-title ${id}-desc`, "data-view": kind, "data-axes": n, preserveAspectRatio: "xMidYMid meet" });
  root.append(svg("title", { id: `${id}-title` }, title), svg("desc", { id: `${id}-desc` }, desc));

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
  // Where each value stands: across its axis from the marker, by valueOffset. In the block view a value in
  // the outer half moves inward along its axis instead, so no value reaches beyond the web, where the
  // block view's labels stand. Each with its box (the text's box and 2 px of halo).
  const valueFs = big && !tight ? 17 : 13;
  const placeValue = (i, value, text, s, side) => {
    const f = Math.max(0, Math.min(100, value)) / 100;
    const [x, y] = axisPoint(i, n, f, geo);
    const a = axisAngle(i, n);
    const phi = kind === "block" && f >= 0.5 ? a + Math.PI : a + side * (Math.PI / 2);
    const off = valueOffset(a, phi, text, s);
    const tx = x + Math.cos(phi) * off + Math.cos(a) * 4;
    const ty = y + Math.sin(phi) * off + Math.sin(a) * 4 + 5;
    const hw = String(text).length * 0.335 * valueFs + 2;
    return { x, y, tx, ty, box: { l: tx - hw, r: tx + hw, t: ty - 0.94 * valueFs - 2, b: ty + 0.24 * valueFs + 2 } };
  };
  const firstValues = showValues ? axes.map((ax, i) => (ax.value === null || ax.value === undefined ? null : placeValue(i, ax.value, ax.valueText, big ? 8 : 6.5, 1))) : [];
  // The level ticks run up the first axis. The outer ring needs no tick (the top of the scale, where a
  // label or a value stands); a tick that a value's box would cover gives way to the value.
  const meets = (p, q) => p.l < q.r && q.l < p.r && p.t < q.b && q.t < p.b;
  for (const tk of tight ? [] : ticks) {
    const y = geo.cy - geo.r * tk.f - 4;
    const tickBox = { l: geo.cx + 4, r: geo.cx + 8 + String(tk.text).length * 7.5, t: y - 11, b: y + 3 };
    if (tk.f >= 1 || firstValues.some((v) => v && meets(v.box, tickBox))) continue;
    rings.append(svg("text", { class: "sp-tick", x: r2(geo.cx + 6), y: r2(y) }, tk.text));
  }
  root.append(rings);

  // Axes, with their labels.
  const lh = big ? 17 : 14;
  const gap = kind === "layer" ? 20 : 14;
  // The block view lays its labels out in two columns, one each side of the web, so that many blocks
  // keep their labels apart (blockLabels); the layer view's six labels sit at their axes' ends.
  // The block view's labels stand beyond the web; should a value's box still reach out there, their circle
  // clears it by 6 px.
  let labelR = geo.r + gap;
  for (const v of firstValues) {
    if (!v || kind !== "block") continue;
    for (const [px, py] of [[v.box.l, v.box.t], [v.box.r, v.box.t], [v.box.l, v.box.b], [v.box.r, v.box.b]]) labelR = Math.max(labelR, Math.hypot(px - geo.cx, py - geo.cy) + 6);
  }
  const placed = kind === "block" ? blockLabels(labels, statusLines, { n, geo, H, lh, gap, R: labelR }) : null;
  const axesG = svg("g", { class: "sp-axes" });
  axes.forEach((ax, i) => {
    const [x2, y2] = axisPoint(i, n, 1, geo);
    const dashed = ax.dashed !== undefined ? !!ax.dashed : ax.value === null || ax.value === undefined;
    const g = svg("g", { class: "sp-axis-g", role: "img", "aria-label": ax.title || ax.lines.join(" "), "data-axis": ax.id, "data-value": dashed ? "" : String(ax.value), "data-dashed": dashed ? "true" : "false" });
    g.append(svg("title", {}, ax.title || ax.lines.join(" ")));
    g.append(svg("line", { class: dashed ? "sp-axis sp-axis--dashed" : "sp-axis", x1: geo.cx, y1: geo.cy, x2: r2(x2), y2: r2(y2) }));
    if (placed) {
      const p = placed[i];
      // A label moved away from its axis end is joined to it by a thin line.
      if (p.leader) g.append(svg("polyline", { class: "sp-leader", points: p.leader.map(([x, y]) => `${r2(x)},${r2(y)}`).join(" ") }));
      const text = svg("text", { class: big ? "sp-label" : "sp-label sp-label--small", x: r2(p.x), y: r2(p.y), "text-anchor": p.anchor });
      p.lines.forEach((line, k) => {
        const cls = k === 0 ? "sp-label-strong" : k >= p.lines.length - p.status ? "sp-label-muted" : null;
        text.append(svg("tspan", { x: r2(p.x), dy: k === 0 ? 0 : lh, class: cls }, line));
      });
      g.append(text);
      axesG.append(g);
      return;
    }
    // The label beyond the axis end, anchored away from the centre.
    const a = axisAngle(i, n);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const lx = geo.cx + cos * (geo.r + gap);
    const ly = geo.cy + sin * (geo.r + gap);
    const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
    const lines = labels[i];
    const startY = sin < -0.3 ? ly - (lines.length - 1) * lh : sin > 0.3 ? ly + lh * 0.7 : ly - ((lines.length - 1) * lh) / 2 + 5;
    const text = svg("text", { class: big ? "sp-label" : "sp-label sp-label--small", x: r2(lx), y: r2(startY), "text-anchor": anchor });
    lines.forEach((line, k) => {
      const cls = k >= lines.length - statusLines[i] ? "sp-label-muted" : null;
      text.append(svg("tspan", { x: r2(lx), dy: k === 0 ? 0 : lh, class: cls }, line));
    });
    g.append(text);
    axesG.append(g);
  });
  root.append(axesG);

  // The service's area through the axes that have a value, in axis order.
  const pts = axes.map((ax, i) => (ax.value === null || ax.value === undefined ? null : axisPoint(i, n, Math.max(0, Math.min(100, ax.value)) / 100, geo))).filter(Boolean);
  if (pts.length >= 2) root.append(svg("polygon", { class: "sp-area", "aria-hidden": "true", points: pts.map(([x, y]) => `${r2(x)},${r2(y)}`).join(" ") }));

  // Hexagon markers with the value beside them. With more than twelve blocks the values would crowd each
  // other at the centre (showValues, above): the rings with their level ticks give the level, the
  // honeycomb and the table the number.
  const marks = svg("g", { class: "sp-markers", "aria-hidden": "true" });
  axes.forEach((ax, i) => {
    if (ax.value === null || ax.value === undefined) return;
    const f = Math.max(0, Math.min(100, ax.value)) / 100;
    const [x, y] = axisPoint(i, n, f, geo);
    marks.append(svg("polygon", { class: "sp-marker", points: hexPoints(x, y, big ? 8 : 6.5), "data-axis": ax.id }));
    if (!showValues) return;
    const v = firstValues[i];
    marks.append(svg("text", { class: big && !tight ? "sp-value" : "sp-value sp-value--small", x: r2(v.tx), y: r2(v.ty), "text-anchor": "middle", "data-axis": ax.id }, ax.valueText));
  });
  root.append(marks);

  // A second assessment (Compare): its area with a dashed line, hollow markers, the value on the other
  // side of the axis.
  if (second) {
    const val = (i) => { const v = second.values?.[i]; return v === null || v === undefined ? null : Math.max(0, Math.min(100, v)); };
    const pts2 = axes.map((ax, i) => (val(i) === null ? null : axisPoint(i, n, val(i) / 100, geo))).filter(Boolean);
    if (pts2.length >= 2) root.append(svg("polygon", { class: "sp-area sp-area--b", "aria-hidden": "true", points: pts2.map(([x, y]) => `${r2(x)},${r2(y)}`).join(" ") }));
    const marks2 = svg("g", { class: "sp-markers sp-markers--b", "aria-hidden": "true" });
    axes.forEach((ax, i) => {
      if (val(i) === null) return;
      const [x, y] = axisPoint(i, n, val(i) / 100, geo);
      marks2.append(svg("polygon", { class: "sp-marker sp-marker--b", points: hexPoints(x, y, big ? 7.5 : 6), "data-axis": ax.id, "data-value": String(second.values[i]) }));
      const { tx, ty } = placeValue(i, val(i), second.texts?.[i] ?? "", big ? 7.5 : 6, -1);
      marks2.append(svg("text", { class: big && !tight ? "sp-value sp-value--b" : "sp-value sp-value--b sp-value--small", x: r2(tx), y: r2(ty), "text-anchor": "middle", "data-axis": ax.id }, second.texts?.[i] ?? ""));
    });
    root.append(marks2);
  }
  return root;
}
