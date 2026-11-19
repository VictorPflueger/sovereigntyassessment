// Text that follows the language. The app's views build their words with these helpers instead of
// typing them: tx() makes an element that names its i18n key (data-i18n, with data-i18n-vars for its
// placeholders), and attrs() names the keys of an element's attributes (data-i18n-attr). A language
// switch re-translates every such element in the document at once (applyStatic in js/i18n/index.js),
// open dialogs included, so a view only re-renders what it formats itself (numbers, dates, data).

import { h } from "./dom.js";
import { t, tn } from "./i18n/index.js";

/**
 * A text element in the active language that stays in it: <span data-i18n="key">text</span>.
 * opts: { tag (default "span"), cls, n (picks the plural form key.one or key.other), attrs }.
 */
export function tx(key, vars = null, { tag = "span", cls = null, n = null, attrs = {} } = {}) {
  const data = { i18n: key };
  if (vars && Object.keys(vars).length) data.i18nVars = JSON.stringify(vars);
  if (n !== null && n !== undefined) data.i18nN = String(n);
  const text = n !== null && n !== undefined ? tn(key, Number(n), vars || {}) : t(key, vars);
  const { dataset = {}, ...rest } = attrs;
  return h(tag, { ...rest, ...(cls ? { class: cls } : {}), dataset: { ...dataset, ...data } }, text);
}

/** Sets an element's attributes from i18n keys and keeps them in the active language: { title: key }. */
export function attrs(el, map) {
  const pairs = Object.entries(map).filter(([, key]) => key);
  for (const [attr, key] of pairs) el.setAttribute(attr, t(key));
  if (pairs.length) el.dataset.i18nAttr = pairs.map(([attr, key]) => `${attr}:${key}`).join("; ");
  else delete el.dataset.i18nAttr;
  return el;
}

/** Points an existing text element at another key (and placeholders), in the active language. */
export function retext(el, key, vars = null) {
  if (!el) return el;
  el.dataset.i18n = key;
  if (vars && Object.keys(vars).length) el.dataset.i18nVars = JSON.stringify(vars);
  else delete el.dataset.i18nVars;
  delete el.dataset.i18nN;
  el.textContent = t(key, vars);
  return el;
}
