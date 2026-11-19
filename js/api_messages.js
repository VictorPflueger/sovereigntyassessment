// The shared API client's errors in the active language. js/anthropic.js stays the sister apps' file,
// unchanged (brief §4): where the app shows one of its errors, this module maps the HTTP status and the
// error type to an i18n key. The API's own message stays in English and fills a placeholder.

import { networkMessage } from "./anthropic.js";

const TIMED_OUT = networkMessage({ name: "AbortError" });

/**
 * The key and placeholders for a failed call: { status, error: { type, message } } as checkKey(),
 * probeEndpoint() (status and detail) or an ApiError gives it. Returns { key, vars }.
 */
export function apiMessage({ status = 0, error = null, detail = "" } = {}) {
  const message = String(error?.message || detail || "").trim();
  const type = error?.type || "";
  if (!status) return { key: message === TIMED_OUT ? "api.timeout" : "api.network", vars: null };
  if (status === 401) return { key: "api.unauthorized", vars: null };
  if (status === 403) return { key: "api.forbidden", vars: { message } };
  if (status === 429) {
    const spend = error?.details?.error_code === "enforced_spend_limit_reached" || /spend limit|credit balance/i.test(message);
    return { key: spend ? "api.spendLimit" : "api.rateLimited", vars: null };
  }
  if (status === 400 && /workspace/i.test(message)) return { key: "api.workspace", vars: { message } };
  if (status === 529 || type === "overloaded_error") return { key: "api.overloaded", vars: null };
  if (status >= 500) return { key: "api.server", vars: { status } };
  return { key: "api.other", vars: { status, message: message || type || String(status) } };
}
