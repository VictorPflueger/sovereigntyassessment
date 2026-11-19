// Numbers, dates and money through Intl, in the active language (en-GB or de-DE; brief §5): scores as
// whole numbers, shares as whole percentages ("92%", "92 %"), signed changes with a sign ("+9"), dates
// with the month written out, the cost meter in euros with cents. Computed values stay at full precision;
// only these functions round, for display.

import { locale, getLang, t } from "./i18n/index.js";

const cache = new Map();
function nf(lang, opts) {
  const key = `${lang}|${JSON.stringify(opts)}`;
  if (!cache.has(key)) cache.set(key, new Intl.NumberFormat(locale(lang), opts));
  return cache.get(key);
}
const has = (v) => v !== null && v !== undefined && Number.isFinite(Number(v));

/** "no data" for a figure without a basis: never shown as 0 (brief §6.5). */
export function noData(lang = getLang()) {
  return t("fact.noData", null, lang);
}

/** A score from 0 to 100 as a whole number: 72. */
export function fmtScore(value, lang = getLang()) {
  return has(value) ? nf(lang, { maximumFractionDigits: 0 }).format(Number(value)) : noData(lang);
}

/** A share as a whole percentage: "92%" in English, "92 %" in German. */
export function fmtShare(value, lang = getLang()) {
  return has(value) ? nf(lang, { style: "percent", maximumFractionDigits: 0 }).format(Number(value)) : noData(lang);
}

/** A signed change as a whole number: "+9", "−3", "0". */
export function fmtDelta(value, lang = getLang()) {
  return has(value) ? nf(lang, { maximumFractionDigits: 0, signDisplay: "exceptZero" }).format(Number(value)) : noData(lang);
}

/** A whole number with the language's grouping: 1,122 or 1.122. */
export function fmtInt(value, lang = getLang()) {
  return has(value) ? nf(lang, { maximumFractionDigits: 0 }).format(Math.round(Number(value))) : noData(lang);
}

/** Small euro amounts with cents, for the cost meter: "€0.38" or "0,38 €". */
export function fmtEur(value, lang = getLang()) {
  return nf(lang, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
}

/**
 * A date with the month written out: "19 November 2026" or "19. November 2026". A bare ISO date is
 * read as that day where the browser is, not as midnight UTC.
 */
export function fmtDate(iso, lang = getLang()) {
  const text = String(iso ?? "");
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T12:00:00` : text);
  if (Number.isNaN(d.getTime())) return noData(lang);
  return d.toLocaleDateString(locale(lang), { day: "numeric", month: "long", year: "numeric" });
}

/** "15:56:03" local time from an ISO timestamp. */
export function fmtTime(iso, lang = getLang()) {
  return new Date(iso).toLocaleTimeString(locale(lang), { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** mm:ss (or h:mm:ss) for the stopwatch. */
export function clock(ms) {
  const total = Math.max(0, Math.floor((ms || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (x) => String(x).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}
