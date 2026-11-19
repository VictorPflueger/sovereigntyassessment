// The string literals of a JavaScript source, for the language test's checks (tests/i18n.mjs): every
// key the app asks for, and any user-visible sentence typed into the code instead of the dictionaries.
// A small tokenizer: comments are skipped, "…", '…' and `…` strings are read with their escapes
// (a template's ${…} parts are kept as "${}"), and a regular expression literal is recognised by what
// comes before its slash, as JavaScript's own grammar does, so the quotes inside a regex are not taken
// for strings. Each literal comes with its line number and the source line it sits on.

const REGEX_BEFORE = new Set(["(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^"]);
const REGEX_KEYWORDS = /(?:^|[^\w$])(?:return|typeof|case|do|else|in|of|new|delete|void|throw|yield|await)$/;

/** [{ value, quote, line, text }] for every string literal in `src`. */
export function stringLiterals(src) {
  const out = [];
  const lines = src.split("\n");
  let i = 0;
  let line = 1;
  let last = ""; // the last significant character before the current position
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "\n") { line += 1; i += 1; continue; }
    if (c === " " || c === "\t" || c === "\r") { i += 1; continue; }
    if (c === "/" && next === "/") { while (i < n && src[i] !== "\n") i += 1; continue; }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line += 1; i += 1; }
      i += 2;
      continue;
    }
    if (c === "\"" || c === "'" || c === "`") {
      const start = line;
      let value = "";
      i += 1;
      while (i < n && src[i] !== c) {
        if (src[i] === "\\") { value += src[i + 1] === "n" ? "\n" : src[i + 1]; i += 2; continue; }
        if (c === "`" && src[i] === "$" && src[i + 1] === "{") {
          // Skip the expression, braces balanced (strings inside it are not counted as text).
          let depth = 1;
          i += 2;
          while (i < n && depth) {
            if (src[i] === "{") depth += 1;
            else if (src[i] === "}") depth -= 1;
            else if (src[i] === "\n") line += 1;
            i += 1;
          }
          value += "${}";
          continue;
        }
        if (src[i] === "\n") line += 1;
        value += src[i];
        i += 1;
      }
      i += 1;
      out.push({ value, quote: c, line: start, text: lines[start - 1] || "" });
      last = c;
      continue;
    }
    if (c === "/") {
      const before = src.slice(Math.max(0, i - 12), i).trimEnd();
      if (!last || REGEX_BEFORE.has(last) || REGEX_KEYWORDS.test(before)) {
        // A regular expression literal: skip it, character classes included.
        i += 1;
        let inClass = false;
        while (i < n) {
          const d = src[i];
          if (d === "\\") { i += 2; continue; }
          if (d === "[") inClass = true;
          else if (d === "]") inClass = false;
          else if (d === "/" && !inClass) break;
          else if (d === "\n") break;
          i += 1;
        }
        i += 1;
        while (i < n && /[a-z]/i.test(src[i])) i += 1;
        last = "/";
        continue;
      }
    }
    last = c;
    i += 1;
  }
  return out;
}

/**
 * Does a literal read like a sentence a person would see? Two or more words of letters, and a capital
 * first letter or a sentence's end. Class lists, selectors, keys, ids, URLs and file names do not.
 */
export function looksLikeProse(value) {
  const v = String(value).trim();
  if (!v || !/\s/.test(v)) return false;                      // a key, an id, a code or a single word
  if (/^(https?:|mailto:|\/|\.\/|#|\.|\[)/.test(v)) return false; // URLs, paths, selectors
  if (/[<>{}=]/.test(v.replace(/\$\{\}/g, "").replace(/\{[a-zA-Z0-9_]+\}/g, ""))) return false; // markup or code
  const words = v.replace(/\$\{\}/g, " ").match(/\p{L}{2,}/gu) || [];
  if (words.length < 2) return false;
  return /^\p{Lu}/u.test(v) || /[.!?…:]$/.test(v);
}
