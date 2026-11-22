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
