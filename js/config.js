// Central configuration. Every value here is documented and verified in TECH_NOTES.md; the user-visible
// words that go with these values live in js/i18n/en.js and js/i18n/de.js.

export const APP = {
  id: "sa",
  name: "Sovereignty Assessment",
  version: "0.1.0"
};

// The page's content security policy, exactly as index.html's meta tag carries it (TECH_NOTES §4).
// Diagnostics and tests/accept.mjs compare the two; web search and web fetch run on Anthropic's
// servers, so api.anthropic.com is the only outside host the page may reach.
export const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src https://api.anthropic.com; object-src 'none'; base-uri 'none'; form-action 'none'";

export const ANTHROPIC = {
  messagesUrl: "https://api.anthropic.com/v1/messages",
  modelsUrl: "https://api.anthropic.com/v1/models?limit=100",
  // The sister apps' version; 2026-10-21 is the newest, and the switch should happen in all
  // prototypes together (TECH_NOTES §2, I6).
  apiVersion: "2023-06-01",
  // Header that enables CORS for direct browser calls (verified by live probe, TECH_NOTES §2).
  browserHeader: "anthropic-dangerous-direct-browser-access",
  // The shared client keeps its paid web-search probe for the sister apps; this app does not call it
  // (it sends `thinking: disabled`, which Sonnet 5.5 refuses; TECH_NOTES, I7). The fee is the one the
  // cost meter adds per search.
  webSearchTool: { type: "web_search_20250305", name: "web_search", max_uses: 5 },
  webSearchUsdPer1000: 10,
  // Spend limits are set per workspace, so the key dialog advises a dedicated workspace with a
  // monthly spend limit and a key scoped to it.
  consoleKeysUrl: "https://platform.claude.com/settings/keys",
  consoleWorkspacesUrl: "https://platform.claude.com/settings/workspaces"
};

// The two server tools of the live agent, fixed for the whole run (brief §7; TECH_NOTES §2). The
// agent arrives in version 0.2.0; the definitions are here so Diagnostics and the tests see them.
export const SERVER_TOOLS = [
  { type: "web_search_20250305", name: "web_search", max_uses: 12, user_location: { type: "approximate", country: "DE", timezone: "Europe/Berlin" } },
  { type: "web_fetch_20250910", name: "web_fetch", max_uses: 10, max_content_tokens: 8000, citations: { enabled: true } }
];

// Prices in USD per million tokens (TECH_NOTES §1, verified 19 Nov 2026; equal to the sister apps').
// The model names are product names and stay as they are in both languages; the hints are i18n keys.
export const MODELS = [
  {
    id: "claude-sonnet-5-5", label: "Sonnet 5.5", hintKey: "model.hint.sonnet",
    effort: "medium", maxTokens: 16000,
    price: { input: 2.0, output: 10.0, cacheWrite: 2.5, cacheRead: 0.1 }
  },
  {
    id: "claude-haiku-5-5", label: "Haiku 5.5", hintKey: "model.hint.haiku",
    effort: "medium", maxTokens: 12000,
    price: { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01,
      longPrompt: { thresholdTokens: 100000, input: 0.5, output: 2.5, cacheWrite: 0.625, cacheRead: 0.05 } }
  },
  {
    id: "claude-opus-5-5", label: "Opus 5.5", hintKey: "model.hint.opus",
    effort: "high", maxTokens: 16000,
    price: { input: 4.0, output: 20.0, cacheWrite: 5.0, cacheRead: 0.2 }
  }
];
export const DEFAULT_MODEL = "claude-sonnet-5-5";

// Live-agent guardrails (brief §4 and §7). A run stops at whichever limit it reaches first.
export const AGENT = {
  maxSteps: 40,          // model calls per run
  budgetEur: 3.0,        // hard cost cap per run
  maxNudges: 2,          // at most two nudges, as Rebate Hunter sends
  idleTimeoutMs: 90000,  // no streamed data for this long counts as a failed request
  maxOutputTokens: 128000
};

// The sister apps' fixed rate (Rebate Hunter, Navigator and the Timetable Translator): a stable cost meter.
export const FX_USD_EUR = 0.894;

// Every browser storage key, all under this app's own prefix. GitHub Pages serves all of an
// account's project sites from one origin, so a sister app (Rebate Hunter uses "rh.", Navigator
// "nav.", the Timetable Translator "tt.", Repack Pilot "rp.") must never share a key with this one.
// The only shared key is Vici's theme choice, "vc-theme".
const P = `${APP.id}.`;
export const STORAGE = {
  apiKey: `${P}anthropic.key`,          // sessionStorage: this tab only
  diagnostics: `${P}diag`,              // sessionStorage: the last Diagnostics results
  model: `${P}model`,                   // sessionStorage
  speed: `${P}speed`,                   // sessionStorage
  sessionCost: `${P}sessionCostEur`,    // sessionStorage: live spend in this tab
  introSeen: `${P}introSeen`,           // localStorage: the intro opens by itself only on a first visit
  lang: `${P}lang`                      // localStorage: the language choice (brief §5)
};
export const THEME_KEY = "vc-theme";    // Vici's own key, shared by all of Victor's pages

export const UI = {
  // A pre-run older than this shows "Check for updates" (brief §6.6).
  staleDays: 90
};
