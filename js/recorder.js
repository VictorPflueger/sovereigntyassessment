// "Save run as simulation" (brief §4 and §8): turns a finished live run into a pre-run file in the format
// the simulation player replays (data/runs/<entry>.js). It keeps the agent's narration, the research steps
// (queries, result titles and URLs, fetched pages' titles and URLs: never a page's text), and every client
// tool call with its input, its evidence carrying the quote code checked and the verified flag; the memo
// and the report's closing part become template steps, because they depend on the person's choice. No
// thinking, no key, no figure: the figures are recomputed at playback. The file is marked "recorded" and
// carries the run's one language: curating it means adding the second language, then tools/check-runs.mjs.

import { METHOD_VERSION } from "./engine.js";
import { redactSecrets } from "./keystore.js";
import { runFileText } from "./runs_check.js";

const SKIP = new Set(["ui_progress", "ui_draft_memo", "ui_final_report"]);

/** The pre-run object of a live run's events. */
export function recordRun(events, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const start = events.find((e) => e.type === "run_start")?.payload || {};
  const lang = start.lang || "en";
  const one = (text) => ({ [lang]: text });
  const steps = [];
  const calls = new Map();
  let open = null;
  for (const ev of events) {
    const p = ev.payload || {};
    if (ev.type === "narration" && !p.detail && p.done) steps.push({ say: one(p.text) });
    else if (ev.type === "research_step" && p.ok) {
      if (p.kind === "search") steps.push({ search: { query: p.query, results: (p.results || []).map((r) => ({ url: r.url, title: r.title })) } });
      else steps.push({ fetch: { url: p.url, title: p.title, ...(p.pdf ? { pdf: true } : {}) } });
    } else if (ev.type === "tool_call" && !p.server && !SKIP.has(p.name)) {
      open = { name: p.name, input: structuredClone(p.input || {}), checks: [] };
      calls.set(p.call_id, open);
    } else if (ev.type === "evidence_check" && open) {
      open.checks.push({ url: p.url, title: p.title, quote: p.quote, lang: p.lang, supports: p.fields, verified: !!p.verified });
    } else if (ev.type === "tool_result" && !p.server) {
      const c = calls.get(p.call_id);
      if (p.name === "ui_draft_memo" && p.ok) steps.push({ memo: true });
      else if (p.name === "ui_final_report" && p.ok) {
        const report = events.find((e) => e.type === "report")?.payload;
        steps.push({ report: { outcome: report?.outcome || "assessed", findings: one(report?.markdown || "") } });
      } else if (c && p.ok) steps.push({ tool: c.name, input: withChecks(c) });
      open = null;
    }
  }
  return {
    id: start.entry_id || slug(start.query),
    entry_id: start.entry_id || null,
    source: "recorded",
    as_of: today,
    method_version: METHOD_VERSION,
    query: start.query || "",
    recorded: { run_id: start.run_id || null, model: start.model || null, lang },
    steps
  };

  /** Texts the model wrote become { <lang>: text }; evidence carries the quotes code checked. */
  function withChecks(c) {
    const input = c.input;
    const wrap = (obj, keys) => { for (const k of keys) if (typeof obj?.[k] === "string") obj[k] = one(obj[k]); };
    let k = 0;
    const takeChecks = (items) => (items || []).map(() => c.checks[k++]).filter(Boolean);
    switch (c.name) {
      case "rec_profile": input.evidence = takeChecks(input.evidence); wrap(input, ["what", "how", "status", "legal_basis", "governance"]); break;
      case "rec_block": input.evidence = takeChecks(input.evidence); wrap(input, ["name", "role", "note"]); break;
      case "rec_block_update": if (input.evidence) input.evidence = takeChecks(input.evidence); wrap(input.changes, ["name", "role", "note"]); wrap(input, ["reason"]); break;
      case "rec_block_remove": wrap(input, ["reason"]); break;
      case "rec_layer": if (input.evidence) input.evidence = takeChecks(input.evidence); wrap(input, ["reason"]); break;
      case "ui_request_review": wrap(input, ["summary"]); break;
      case "ui_choose_service": wrap(input, ["question"]); for (const cand of input.candidates || []) wrap(cand, ["name", "description"]); break;
      case "ui_propose_levers": for (const l of input.levers || []) { l.evidence = takeChecks(l.evidence); wrap(l, ["title", "rationale"]); } break;
      default: break;
    }
    return input;
  }
}

function slug(text) {
  return String(text || "run").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "run";
}

/** The file text of a recorded run, with anything key-like redacted. */
export function recordingText(events, options) {
  const def = recordRun(events, options);
  return { def, text: redactSecrets(runFileText(def, def.query)) };
}
