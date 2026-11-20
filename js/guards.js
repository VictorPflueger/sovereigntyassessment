// The sequence rules of a run, in code (brief §7, rules 2, 5 and 7; PLAN.md b.4). One function decides
// whether a tool may run now, from a small summary of the run's state, so the live agent, the simulation
// player and tools/check-runs.mjs apply exactly the same rules. A refusal is an instructive message for
// the model (tool results are English, like the system prompt); the person sees the tool's plain
// sentence in the console.
//
//   - Nothing runs after the report: the run is over.
//   - The findings are frozen once the person has reviewed them: only the person changes blocks then.
//   - The review waits until every layer has blocks or a recorded status, and until eng_score has run on
//     the current blocks.
//   - Levers come after the review; one decision per run.
//   - The memo follows the lever decision and names the same lever.
//   - An "assessed" report needs the review, the lever decision and the memo; "not_a_service" ends a run
//     without blocks; "stopped" may end a run at any point before a report.
//   - A service is chosen among candidates only before any block is recorded.

import { LAYERS } from "./engine.js";

/** Tools that record findings: refused once the person has reviewed them. */
export const RECORD_TOOLS = Object.freeze(["rec_profile", "rec_block", "rec_block_update", "rec_block_remove", "rec_layer"]);

/**
 * The layers that have neither a block nor a recorded status. s.layerBlocks: { layer: n }; s.layerStatus:
 * { layer: "no_evidence" | "not_applicable" }.
 */
export function openLayers(s) {
  return LAYERS.filter((l) => !(s.layerBlocks?.[l] > 0) && !s.layerStatus?.[l]);
}

/**
 * Whether a tool may run now. s: { reported, blocks, review: "none"|"requested"|"resolved", scoredFresh,
 * layerBlocks, layerStatus, levers: "none"|"proposed"|"decided", decision: lever id or null, memo,
 * outcome (requested), leverId (requested) }. Returns null, or { error } with what to do instead.
 */
export function guardTool(name, s, input = {}) {
  if (s.reported) return { error: "The report is published and the run is over. End your turn with one short closing sentence." };

  if (RECORD_TOOLS.includes(name) && s.review === "resolved") {
    return { error: "The person has reviewed the findings, so they are frozen: only the person changes blocks now. Continue with the levers (eng_whatif, ui_propose_levers)." };
  }

  switch (name) {
    case "ui_choose_service":
      if (s.blocks > 0) return { error: "Building blocks are already recorded for this service; a different service needs a new run. Continue the assessment." };
      return null;

    case "ui_request_review": {
      if (s.review === "resolved") return { error: "The person has already reviewed the findings. Continue with the levers." };
      if (!s.blocks) return { error: "There are no building blocks to review. Research the layers and record blocks with rec_block first, or end with ui_final_report and outcome \"not_a_service\" or \"stopped\"." };
      const open = openLayers(s);
      if (open.length) return { error: `These layers have neither a block nor a status: ${open.join(", ")}. Research them, or mark them with rec_layer ("no_evidence" with a short reason, or "not_applicable" with a source), then call eng_score and ask for the review again.` };
      if (!s.scoredFresh) return { error: "The blocks changed since the last eng_score. Call eng_score, then ask for the review again." };
      return null;
    }

    case "ui_propose_levers":
      if (s.review !== "resolved") return { error: "Levers come after the person's review. Call ui_request_review first." };
      if (s.levers === "decided") return { error: `The person has already chosen (${s.decision}). Draft the memo with ui_draft_memo for that choice.` };
      return null;

    case "ui_draft_memo":
      if (s.levers !== "decided") return { error: "The memo follows the person's lever decision. Propose the levers with ui_propose_levers and wait for the choice." };
      if (input.lever_id !== s.decision) return { error: `The person chose "${s.decision}", so the memo is for "${s.decision}", not "${input.lever_id}".` };
      if (s.memo) return { error: "The memo is already in the Outbox. Publish the report with ui_final_report." };
      return null;

    case "ui_final_report": {
      const outcome = input.outcome;
      if (outcome === "not_a_service" && s.blocks > 0) return { error: "Building blocks are recorded, so this is a service: \"not_a_service\" no longer fits. Finish the assessment, or end with outcome \"stopped\"." };
      if (outcome === "assessed") {
        if (s.review !== "resolved") return { error: "An assessed report needs the person's review first: call ui_request_review." };
        if (s.levers !== "decided") return { error: "An assessed report needs the person's lever decision first: propose the levers with ui_propose_levers." };
        if (!s.memo) return { error: "Draft the memo for the person's choice with ui_draft_memo before the report." };
      }
      return null;
    }

    default:
      return null;
  }
}
