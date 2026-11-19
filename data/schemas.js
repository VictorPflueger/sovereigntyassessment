/* The data contracts of the brief (§10): eleven JSON Schemas (draft 2020-12), one per kind of record the
 * app keeps, exports or replays. A script, not JSON, because the page's security policy allows no fetch
 * from its own origin: it sets window.SA_SCHEMAS. Schemas name each other by file name ("Evidence.json");
 * js/schema.js resolves those names within this set. The $id values are names, not addresses: nothing
 * is served there.
 *
 * Texts the model writes (names, roles, notes, the profile's texts, reasons, levers) hold the run's
 * language in a live run and both languages in a pre-run ({ "en": …, "de": … }). Code adds a block's
 * tech_class, operator_class, level, partly_unknown, unscored and unknown_fields, and each quote's
 * verified flag; the model never sends them.
 */
(function () {
  "use strict";
  var BASE = "https://victorpflueger.github.io/sovereigntyassessment/schemas/";
  var LAYERS = ["infrastructure", "devsecops", "platform", "base_service", "applications", "access"];
  var CLASSES = ["DE", "EU", "US", "CN", "OTHER", "UNKNOWN"];
  var BLOCK_FIELDS = ["tech", "tech.parent", "operator", "operator.parent", "hosting", "licence", "exit"];
  var PROFILE_FIELDS = ["what", "how", "owner", "operator", "status", "legal_basis", "governance"];
  var EVENT_TYPES = ["run_start", "state_change", "narration", "reasoning", "tool_call", "tool_result", "choice_request", "choice_decision",
    "profile_recorded", "research_step", "evidence_check", "block_recorded", "layer_status", "score_update", "review_request",
    "review_decision", "levers", "lever_decision", "action_draft", "action_decision", "report", "budget_update", "cost_update",
    "weights_change", "notice", "attempt_discarded", "run_end"];

  function schema(name, body) {
    var out = { $schema: "https://json-schema.org/draft/2020-12/schema", $id: BASE + name + ".json", title: name };
    for (var k in body) out[k] = body[k];
    return out;
  }
  // A text in the run's language, or in both languages in a pre-run.
  var TEXT = { anyOf: [{ type: "string" }, { type: "object", additionalProperties: false, required: ["en", "de"], properties: { en: { type: "string" }, de: { type: "string" } } }] };
  var BOTH = { type: "object", additionalProperties: false, required: ["en", "de"], properties: { en: { type: "string", minLength: 1 }, de: { type: "string", minLength: 1 } } };
  var COUNTRY = { type: "string", pattern: "^([A-Z]{2}|UNKNOWN)$" };
  var PARTY = {
    type: "object", additionalProperties: false, required: ["name", "country"],
    properties: {
      name: { type: "string", minLength: 1 }, country: COUNTRY,
      parent: { anyOf: [{ type: "null" }, { type: "object", additionalProperties: false, required: ["name", "country"], properties: { name: { type: "string", minLength: 1 }, country: COUNTRY } }] }
    }
  };
  var DATE = { type: "string", format: "date" };
  var TIMESTAMP = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}" };
  var URL = { type: "string", pattern: "^https?://[^\\s]+$" };
  var LANG = { type: "string", pattern: "^[a-z]{2}$" };
  var CHANGE = {
    type: "object", additionalProperties: false, required: ["block_id"],
    properties: {
      block_id: { type: "string", pattern: "^B-\\d{2}$" }, made_in: { type: "string", enum: CLASSES }, run_by: { type: "string", enum: CLASSES },
      hosting: { type: "string", enum: ["EU", "NON_EU", "UNKNOWN"] }, licence: { type: "string", enum: ["open_source", "proprietary", "unknown"] }
    }
  };
  var FACT_VALUE = { type: ["number", "string", "null"] };

  window.SA_SCHEMAS = {
    CatalogueEntry: schema("CatalogueEntry", {
      description: "One service of the bundled catalogue (brief §8): names in both languages, category, a one-line description, status, and verified starting URLs.",
      type: "object", additionalProperties: false,
      required: ["id", "category", "names", "description", "status", "urls"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9-]+$" },
        category: { type: "string", enum: ["base_service", "platform_or_access", "self_assessment"] },
        names: BOTH,
        aliases: { type: "array", items: { type: "string", minLength: 1 } },
        description: BOTH,
        status: BOTH,
        urls: {
          type: "array", minItems: 1,
          items: { type: "object", additionalProperties: false, required: ["url", "title", "lang", "read_on"],
            properties: { url: { type: "string", pattern: "^https://[^\\s]+$" }, title: { type: "string", minLength: 1 }, lang: LANG, read_on: DATE, note: TEXT } }
        }
      }
    }),
    Evidence: schema("Evidence", {
      description: "A source for a classification (brief §6.6): the URL this run returned or the catalogue or the reference facts list, the page title, a verbatim quote of at most 150 characters, its language, the date read and the fields it supports. Code adds verified and via.",
      type: "object", additionalProperties: false,
      required: ["url", "title", "lang", "supports"],
      properties: {
        url: URL, title: { type: "string", minLength: 1 }, quote: { type: "string", maxLength: 150 }, lang: LANG, read_on: DATE,
        supports: { type: "array", minItems: 1, items: { type: "string", enum: BLOCK_FIELDS.concat(PROFILE_FIELDS, ["not_applicable", "alternative", "fact"]) } },
        verified: { type: "boolean" },
        via: { type: "string", enum: ["fetched_text", "citation", "catalogue", "ref_facts", "recording", "none"] }
      }
    }),
    ServiceProfile: schema("ServiceProfile", {
      description: "The service profile (brief §7, rec_profile): names, category, what it does, how it works, owner, operator, status, legal basis, governance and sources.",
      type: "object", additionalProperties: false,
      required: ["names", "category", "what", "how", "owner", "operator", "status", "evidence"],
      properties: {
        names: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
        category: { type: "string", enum: ["base_service", "platform_or_access", "self_assessment"] },
        what: TEXT, how: TEXT, owner: PARTY, operator: PARTY, status: TEXT, legal_basis: TEXT, governance: TEXT,
        evidence: { type: "array", minItems: 1, items: { $ref: "Evidence.json" } }
      }
    }),
    BuildingBlock: schema("BuildingBlock", {
      description: "One component, product or service the assessed service depends on, in one layer (brief §6.2 and §10).",
      type: "object", additionalProperties: false,
      required: ["id", "layer", "name", "role", "criticality", "tech", "operator", "hosting", "licence", "exit", "evidence", "confidence"],
      properties: {
        id: { type: "string", pattern: "^B-\\d{2}$" },
        layer: { type: "string", enum: LAYERS },
        name: TEXT, role: TEXT, note: TEXT,
        criticality: { type: "string", enum: ["critical", "important", "supporting"] },
        tech: PARTY, operator: PARTY,
        hosting: { type: "string", enum: ["EU", "NON_EU", "UNKNOWN"] },
        licence: { type: "string", enum: ["open_source", "proprietary", "unknown"] },
        exit: { type: "string", enum: ["easy", "possible", "hard", "unknown"] },
        evidence: { type: "array", minItems: 1, items: { $ref: "Evidence.json" } },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
        tech_class: { type: "string", enum: CLASSES },
        operator_class: { type: "string", enum: CLASSES },
        level: { anyOf: [{ type: "integer", minimum: 0, maximum: 4 }, { type: "null" }] },
        partly_unknown: { type: "boolean" },
        unscored: { type: "boolean" },
        unknown_fields: { type: "array", items: { type: "string", enum: BLOCK_FIELDS } },
        corrections: {
          type: "array",
          items: { type: "object", additionalProperties: false, required: ["field", "to", "reason", "by"],
            properties: { field: { type: "string" }, from: {}, to: {}, reason: { type: "string", minLength: 1 }, by: { const: "reviewer" }, ts: TIMESTAMP } }
        }
      }
    }),
    LayerStatus: schema("LayerStatus", {
      description: "A layer marked by the agent (rec_layer): not applicable (with a source saying why) or no evidence found, with a short reason.",
      type: "object", additionalProperties: false,
      required: ["layer", "status", "reason"],
      properties: {
        layer: { type: "string", enum: LAYERS },
        status: { type: "string", enum: ["not_applicable", "no_evidence"] },
        reason: TEXT,
        evidence: { type: "array", items: { $ref: "Evidence.json" } }
      }
    }),
    EngineResult: schema("EngineResult", {
      description: "The engine's figures under their fact keys (brief §6.5 and §7 rule 3), at full precision; null is no data.",
      type: "object", additionalProperties: false,
      required: ["method_version", "facts"],
      properties: {
        method_version: { type: "string", minLength: 1 },
        weights: { type: "object", additionalProperties: { type: "number", minimum: 0 } },
        facts: { type: "object", additionalProperties: FACT_VALUE }
      }
    }),
    Lever: schema("Lever", {
      description: "An improvement lever (ui_propose_levers): a set of block changes by class, hosting or licence, never a company, with a rationale and evidence that such an alternative exists.",
      type: "object", additionalProperties: false,
      required: ["lever_id", "title", "rationale", "changes", "evidence"],
      properties: {
        lever_id: { type: "string", enum: ["L1", "L2", "L3"] },
        title: TEXT, rationale: TEXT,
        changes: { type: "array", minItems: 1, items: CHANGE },
        evidence: { type: "array", minItems: 1, items: { $ref: "Evidence.json" } },
        whatif: { type: "object", additionalProperties: false, required: ["facts"], properties: { facts: { type: "object", additionalProperties: FACT_VALUE } } }
      }
    }),
    Decision: schema("Decision", {
      description: "A person's step: a choice among candidates, a review action (a correction needs a reason), a lever choice, or a decision on a draft.",
      type: "object", additionalProperties: false,
      required: ["kind", "by", "ts"],
      properties: {
        kind: { type: "string", enum: ["choice", "review", "lever", "memo"] },
        request_id: { type: "string" },
        by: { const: "user" },
        ts: TIMESTAMP,
        chosen: { anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }] },
        action: { type: "string", enum: ["confirm", "skip", "correct", "approved", "rejected"] },
        block_id: { type: "string", pattern: "^B-\\d{2}$" },
        changes: { type: "object" },
        reason: { type: "string", minLength: 1 },
        lever_id: { type: "string", enum: ["L1", "L2", "L3", "keep"] },
        action_id: { type: "string" }
      }
    }),
    Assessment: schema("Assessment", {
      description: "A whole assessment as the app exports and replays it: the service, its as-of date, its source and the method version, the profile, the blocks, the layers' statuses and the person's corrections and decisions.",
      type: "object", additionalProperties: false,
      required: ["service", "category", "as_of", "source", "method_version", "profile", "blocks", "layers"],
      properties: {
        service: { type: "object", additionalProperties: false, required: ["query", "name"],
          properties: { query: { type: "string", minLength: 1 }, entry_id: { type: ["string", "null"] }, name: TEXT } },
        category: { type: "string", enum: ["base_service", "platform_or_access", "self_assessment"] },
        lang: { type: "string", enum: ["en", "de", "both"] },
        as_of: DATE,
        source: { type: "string", enum: ["hand_authored", "recorded", "live"] },
        method_version: { type: "string", minLength: 1 },
        profile: { $ref: "ServiceProfile.json" },
        blocks: { type: "array", items: { $ref: "BuildingBlock.json" } },
        layers: { type: "array", items: { $ref: "LayerStatus.json" } },
        weights: { type: "object", additionalProperties: { type: "number", minimum: 0 } },
        result: { $ref: "EngineResult.json" },
        decisions: { type: "array", items: { $ref: "Decision.json" } }
      }
    }),
    RunEvent: schema("RunEvent", {
      description: "One event on the run-event bus (js/events.js): the envelope with its type and payload.",
      type: "object", additionalProperties: false,
      required: ["id", "seq", "type", "ts", "t", "run_id", "mode", "payload"],
      properties: {
        id: { type: "string", minLength: 1 },
        seq: { type: "integer", minimum: 1 },
        type: { type: "string", enum: EVENT_TYPES },
        ts: TIMESTAMP,
        t: { anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }] },
        run_id: { type: ["string", "null"] },
        mode: { anyOf: [{ type: "string", enum: ["live", "simulation"] }, { type: "null" }] },
        payload: { type: "object" }
      }
    }),
    AuditEvent: schema("AuditEvent", {
      description: "One row of the audit log: a run event as the screen saw it, or a model call (what was sent without the key, what came back, usage and timing).",
      anyOf: [
        { $ref: "RunEvent.json" },
        { type: "object", additionalProperties: false, required: ["type", "ts", "run_id", "model", "request", "response", "usage", "request_id", "ms"],
          properties: {
            type: { const: "model_call" }, ts: TIMESTAMP, run_id: { type: ["string", "null"] }, seq: { type: "integer", minimum: 1 },
            model: { type: "string" }, request: { type: "object" }, response: { type: ["object", "null"] }, usage: { type: ["object", "null"] },
            request_id: { type: ["string", "null"] }, ms: { anyOf: [{ type: "integer", minimum: 0 }, { type: "null" }] }, error: { type: "object" }
          } }
      ]
    })
  };
})();
