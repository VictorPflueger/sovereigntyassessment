// Session cost of a simulated run: what the same run would cost live, from its own prompts and replies at
// list price. A live run measures its cost from the API's usage figures instead (js/cost.js).
//
// The estimate's assumptions, stated once (README, "What a live run costs"): about four characters make
// a token; the system prompt and the tool definitions are written to the cache on the first call and read
// from it on every later one, and so is everything sent after them; each client tool call ends a model
// call (a sentence for the screen goes with the call after it); the model's hidden reasoning is three
// times its visible output; a web search adds about 3,000 tokens of results and costs $0.01; a page read
// counts at the run's cap of 8,000 tokens (SERVER_TOOLS in js/config.js), because a replay keeps no page
// text. Pure module: the page and the tests share it.

import { buildSystemPrompt, buildOpeningMessage } from "./prompt.js";
import { toolDefinitions } from "./tools.js";
import { MODELS, FX_USD_EUR, ANTHROPIC, SERVER_TOOLS } from "./config.js";

export const ESTIMATE = {
  charsPerToken: 4,
  reasoningPerVisible: 3,
  searchTokens: 3000,
  fetchTokens: SERVER_TOOLS.find((t) => t.name === "web_fetch")?.max_content_tokens || 8000
};

const tokens = (text) => Math.ceil(String(text || "").length / ESTIMATE.charsPerToken);

/**
 * Estimated cost in euros of the run in `events` (a whole run, decisions included), for modelId.
 * Returns { eur, usd, calls, input, output }.
 */
export function estimateCost({ events, lang = "en", query = "", entryId = null, today = "", modelId = MODELS[0].id }) {
  const model = MODELS.find((m) => m.id === modelId) || MODELS[0];
  const p = model.price;
  const prefix = tokens(buildSystemPrompt({ lang, today })) + tokens(JSON.stringify(toolDefinitions()));
  const turns = [];
  let turn = { out: 0, back: 0, searches: 0 };
  const close = () => { turns.push(turn); turn = { out: 0, back: 0, searches: 0 }; };
  for (const e of events) {
    const x = e.payload || {};
    if (e.type === "tool_call") {
      turn.out += tokens(x.name) + tokens(JSON.stringify(x.input || {}));
    } else if (e.type === "tool_result") {
      if (x.name === "web_search") { turn.back += ESTIMATE.searchTokens; turn.searches += 1; }
      else if (x.name === "web_fetch") turn.back += ESTIMATE.fetchTokens;
      else {
        turn.back += tokens(JSON.stringify(x.result || {}));
        if (x.name !== "ui_progress") close();
      }
    }
  }
  if (turn.out || turn.back) close();
  turns.push({ out: tokens("The report is published."), back: 0, searches: 0 });

  let cached = 0;
  let fresh = prefix + tokens(buildOpeningMessage({ query, entryId, lang, today }));
  let usd = 0;
  let input = 0;
  let output = 0;
  for (const t of turns) {
    const written = t.out * (1 + ESTIMATE.reasoningPerVisible);
    usd += (cached * p.cacheRead + fresh * p.cacheWrite + written * p.output) / 1e6 + t.searches * (ANTHROPIC.webSearchUsdPer1000 / 1000);
    input += cached + fresh;
    output += written;
    cached += fresh;
    fresh = t.out + t.back;
  }
  return { eur: usd * FX_USD_EUR, usd, calls: turns.length, input, output };
}
