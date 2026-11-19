// The bundled catalogue (data/catalogue.js) as the app and the agent use it: name matching for the start
// field's suggestions and for cat_lookup, the entry's texts as the fact audit's evidence, and the
// starting URLs that a run may fetch. The name matching keeps Rebate Hunter's port of Python's
// difflib ratio (js/similarity.js there) for near misses such as "Bund-ID" or "Onlineausweis".

/** The catalogue's entries (window.SA_CATALOGUE in the browser, or the data passed in by a test). */
export function catalogueEntries(data = globalThis.window?.SA_CATALOGUE) {
  return Array.isArray(data?.entries) ? data.entries : [];
}

/** A name as a matching key: lower case, without accents, hyphens, spaces or punctuation. */
export function nameKey(text) {
  return String(text ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "");
}

/** Every name an entry answers to: its id, its names in both languages, the short form before a bracket, its aliases. */
export function entryNames(entry) {
  const names = [entry.id, entry.names?.en, entry.names?.de, ...(entry.aliases || [])].filter(Boolean);
  for (const n of [entry.names?.en, entry.names?.de]) {
    const short = String(n || "").replace(/\s*\(.*\)\s*$/, "").trim();
    if (short && !names.includes(short)) names.push(short);
  }
  return names;
}

/** SequenceMatcher(None, a, b).ratio() as in Python's difflib (Rebate Hunter's port), in [0, 1]. */
export function sequenceRatio(a, b) {
  const A = String(a ?? "");
  const B = String(b ?? "");
  const total = A.length + B.length;
  if (!total) return 1;
  const b2j = new Map();
  for (let j = 0; j < B.length; j++) {
    if (!b2j.has(B[j])) b2j.set(B[j], []);
    b2j.get(B[j]).push(j);
  }
  const longest = (alo, ahi, blo, bhi) => {
    let besti = alo, bestj = blo, bestsize = 0;
    let j2len = new Map();
    for (let i = alo; i < ahi; i++) {
      const next = new Map();
      for (const j of b2j.get(A[i]) || []) {
        if (j < blo) continue;
        if (j >= bhi) break;
        const k = (j2len.get(j - 1) || 0) + 1;
        next.set(j, k);
        if (k > bestsize) { besti = i - k + 1; bestj = j - k + 1; bestsize = k; }
      }
      j2len = next;
    }
    return [besti, bestj, bestsize];
  };
  let matches = 0;
  const queue = [[0, A.length, 0, B.length]];
  while (queue.length) {
    const [alo, ahi, blo, bhi] = queue.pop();
    const [i, j, k] = longest(alo, ahi, blo, bhi);
    if (!k) continue;
    matches += k;
    if (alo < i && blo < j) queue.push([alo, i, blo, j]);
    if (i + k < ahi && j + k < bhi) queue.push([i + k, ahi, j + k, bhi]);
  }
  return (2 * matches) / total;
}

/**
 * Entries for a typed name, best first: [{ entry, score, how }]. An exact name scores 1, a name that
 * starts with or contains the text 0.9 or 0.8 (from three characters on), a near miss its difflib ratio
 * when that reaches `min`. At most `limit` entries.
 */
export function lookup(query, { data, limit = 5, min = 0.72 } = {}) {
  const q = nameKey(query);
  if (!q) return [];
  const out = [];
  for (const entry of catalogueEntries(data)) {
    let best = { score: 0, how: "" };
    for (const name of entryNames(entry)) {
      const k = nameKey(name);
      if (!k) continue;
      let score = 0;
      let how = "";
      if (k === q) { score = 1; how = "exact"; }
      else if (q.length >= 3 && k.startsWith(q)) { score = 0.9; how = "prefix"; }
      else if (q.length >= 3 && k.includes(q)) { score = 0.8; how = "contains"; }
      else {
        const r = sequenceRatio(q, k);
        if (r >= min) { score = r * 0.85; how = "similar"; }
      }
      if (score > best.score) best = { score, how };
    }
    if (best.score > 0) out.push({ entry, ...best });
  }
  out.sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  return out.slice(0, limit);
}

/** The entry with this id, or null. */
export function entryById(id, data) {
  return catalogueEntries(data).find((e) => e.id === id) || null;
}

/** An entry's texts in both languages, which the fact audit counts as the run's evidence. */
export function entryTexts(entry) {
  if (!entry) return [];
  const both = (x) => (x && typeof x === "object" ? [x.en, x.de] : [x]);
  return [
    ...entryNames(entry), ...both(entry.description), ...both(entry.status),
    ...(entry.urls || []).flatMap((u) => [u.title, ...both(u.note)])
  ].filter(Boolean);
}

/** An entry's starting URLs, which a run may fetch and cite. */
export function entryUrls(entry) {
  return (entry?.urls || []).map((u) => u.url);
}

/** Entries grouped by category, in the catalogue's order: { base_service: [...], platform_or_access: [...] }. */
export function byCategory(data) {
  const groups = {};
  for (const e of catalogueEntries(data)) (groups[e.category] ||= []).push(e);
  return groups;
}
