// The user's Anthropic API key, held in this page's memory only (version 2.1.0, Vici's nothing-kept rule):
// never in local or session storage, a cookie, a URL, a log or an export, and gone when the tab closes or
// reloads. It is shown masked and only ever attached to requests to api.anthropic.com (see anthropic.js).

const KEY_PATTERN = /^sk-ant-[A-Za-z0-9_-]{20,}$/;
let held = null;

export function getKey() {
  return held;
}

export function hasKey() {
  return !!getKey();
}

export function setKey(raw) {
  held = String(raw || "").trim() || null;
  return held;
}

export function forgetKey() {
  held = null;
}

/** Format check only; the real check is a free GET /v1/models call. */
export function looksLikeKey(raw) {
  return KEY_PATTERN.test(String(raw || "").trim());
}

/** Masked representation for display, e.g. "sk-ant-…9fQx". */
export function maskKey(key = getKey()) {
  if (!key) return "";
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

/** Removes anything that looks like an Anthropic key from a string (defence in depth for logs/exports). */
export function redactSecrets(text) {
  return String(text).replace(/sk-ant-[A-Za-z0-9_-]{8,}/g, "sk-ant-[REDACTED]");
}
