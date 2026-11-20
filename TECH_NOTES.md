# Sovereignty Assessment: technical notes

Version 0.2.0 (milestone M2: agent, pre-runs and levers), 19 November 2026. What the code relies on, where each fact comes from and when it was checked, the decisions in force and the deviations from the brief. The build plan with the full probe log is [PLAN.md](PLAN.md); the bundled data's sources are in [DATA_SOURCES.md](DATA_SOURCES.md); the shared shell and the adapted modules are in [REVIEW.md](REVIEW.md).

## 1. Models, prices and the cost meter

Checked on 19 November 2026 (PLAN.md, probes P1 and P2) against https://platform.claude.com/docs/models/overview and https://platform.claude.com/docs/en/about-claude/pricing. The values are in `js/config.js` and equal the sister apps'.

| Model | API id | Input | Output | Cache write | Cache read | Effort set here |
|---|---|---|---|---|---|---|
| Sonnet 5.5 (default) | `claude-sonnet-5-5` | $2 | $10 | $2.50 | $0.10 | medium |
| Haiku 5.5 | `claude-haiku-5-5` | $0.10 | $0.50 | $0.125 | $0.01 | medium |
| Haiku 5.5 above 100K prompt tokens | | $0.50 | $2.50 | $0.625 | $0.05 | |
| Opus 5.5 | `claude-opus-5-5` | $4 | $20 | $5 | $0.20 | high |

Prices are in US dollars per million tokens. Web search costs $10 per 1,000 searches; web fetch has no fee beyond its tokens. The cost meter converts at 1 USD = 0.894 EUR, the sister apps' fixed rate. A run stops at 40 model calls or €3, whichever comes first (brief §4). `js/cost.js` is the shared shell's and is tested in `tests/unit.mjs` ("cost").

## 2. The API from the browser

- **Header.** Every call carries `anthropic-dangerous-direct-browser-access: true`. Without it the API's answer has no `access-control-allow-origin` and the browser blocks it (probes P8 to P12, 19 November 2026, from curl and from Chrome on a local page). With it, a keyless `POST /v1/messages` and `GET /v1/models` both answer 401 readable by the page.
- **Version.** `anthropic-version: 2023-06-01`, like every sister app. `2026-10-21` is the newest (P6); under it a document block placed directly in an assistant message returns 400, so the switch waits until a fake-API test covers the echoed server blocks, in all prototypes together (I6).
- **Server tools.** `web_search_20250305` and `web_fetch_20250910`, the basic versions the brief names (P3, P4; I5). Newer versions with dynamic filtering exist and are not used: they need code execution, and `web_fetch_20250910` is the ZDR-eligible one. The definitions in `js/config.js` (`SERVER_TOOLS`) are fixed for a whole run; the agent that sends them arrives in version 0.2.0.
- **What the models API tells.** `GET /v1/models` lists each model's server tools for web search and code execution, not for web fetch (P1), so Diagnostics cannot pre-check web fetch (I4).

## 3. The streaming client

`js/anthropic.js` and `js/sse.js` are the shared shell's files, unchanged (REVIEW.md). The app shows the client's errors through `js/api_messages.js`, which maps the HTTP status and the error type to an i18n key and keeps the API's own message as a placeholder: network, time-out, 401, 403, 429 with and without the spend limit, 400 for a key that spans workspaces, 529 and other 5xx answers (`tests/unit.mjs`, "api"). The shell's paid web-search probe (`probeWebSearch`) sends `thinking: disabled`, which Sonnet 5.5 refuses with 400 (P7); this app does not call it, and Diagnostics checks the key with the free models call instead (I7). The sister apps should know.

## 4. The security policy

The page's policy is exactly the brief's (§4):

`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src https://api.anthropic.com; object-src 'none'; base-uri 'none'; form-action 'none'`

It is the `<meta http-equiv="Content-Security-Policy">` of `index.html` and the constant `CSP` in `js/config.js`. `tests/unit.mjs` ("policy") checks that the two are equal and that `index.html` has no inline script, inline style or event handler and loads nothing from another site; `tests/accept.mjs` ("policy") checks that the running page carries it and that the browser refuses an inline script and a request to another host; Diagnostics compares the page's policy with the constant in the presenter's browser. Data ships as scripts that set `window.*` globals (`data/catalogue.js`, `data/ref_facts.js`, `data/schemas.js`) or as a module (`data/golden.js`), because the policy allows no fetch from the page's own origin.

## 5. The key and the storage keys

The key is asked for only when a live run starts and is checked with the free `GET /v1/models`. It is kept in this tab's session storage under `sa.anthropic.key`, never in local storage, the console, the page, logs or exports; "Forget key" removes it; the key dialog refuses to work inside another page's frame; the key goes only to api.anthropic.com, which the policy enforces. GitHub Pages serves all of an account's project sites from one origin, so every key of this app starts with `sa.`; the only shared key is Vici's `vc-theme`.

| Key | Storage | Holds |
|---|---|---|
| `sa.anthropic.key` | session | the API key, this tab only |
| `sa.diag` | session | the last API result of Diagnostics, for "earlier this session" |
| `sa.model` | session | the chosen model |
| `sa.speed` | session | the replay speed |
| `sa.sessionCostEur` | session | reserved for the live spend across runs in this tab; version 0.2.0 shows each run's cost in its run facts and writes nothing here |
| `sa.introSeen` | local | the intro opens by itself only on a first visit |
| `sa.lang` | local | the language choice |
| `vc-theme` | local | Vici's theme choice, shared by Victor's pages |

`tests/accept.mjs` ("storage") runs a whole session and checks that nothing else is written; `tests/unit.mjs` ("storage") checks that no script names a storage key as a literal.

## 6. Two languages

English on every first visit, whatever the browser says; `?lang=de` or `?lang=en` wins and is stored under `sa.lang`; otherwise the stored choice (`js/i18n/index.js`, `initLang`). `<html lang>` and the document title follow. Every user-visible string is a key in `js/i18n/en.js` and `js/i18n/de.js`, the same keys in both. The views build their words with `tx()` and `attrs()` from `js/text.js`: each element names its key in `data-i18n` (with `data-i18n-vars` for placeholders and `data-i18n-n` for a plural) or `data-i18n-attr`, so a switch re-translates every such element at once (`applyStatic`), open dialogs included; what a view formats itself (numbers, dates, the catalogue's own texts) it renders again through `onLang`. `index.html` keeps the English texts as static defaults, which `tests/i18n.mjs` compares with `en.js`.

Formats go through `Intl` with `en-GB` and `de-DE` (`js/format.js`): scores as whole numbers, shares as whole percentages ("92%", "92 %"), changes with a sign ("+9"), dates with the month written out, euros with cents. `tests/i18n.mjs` checks key parity, empty values, placeholders, that every key asked for exists and every key is used, and that no sentence is typed into the code (a positive control proves the check catches one); `tests/smoke.mjs` checks the first visit, `?lang=`, and the switch without a reload across the header, controls, catalogue, drawer, rail, console and an open dialog.

## 7. Origin classes

`js/classes.js` derives a class from an ISO 3166-1 alpha-2 code: `DE`; `EU` for the other 26 member states; `US`; `CN` for CN, HK and MO; `OTHER` for every other code; `UNKNOWN` when there is none or the value is not a two-letter code. The 26 codes were checked on 19 November 2026 against the EU's own country list (european-union.europa.eu, "Country profiles", two pages, 27 names). Three spellings are accepted: `EL`, the EU's code for Greece, counts as `GR`; `UK` counts as `GB` (`OTHER`); `EU` stands for the Union's own bodies and counts as `EU`. A provider counts by its ultimate parent's country when a parent is recorded; a recorded parent without a country is `UNKNOWN`. `tests/engine.mjs` ("classes") covers every rule (AC-03).

## 8. The engine and its fact keys

`js/engine.js` follows the brief's §6.4 and §6.5 and PLAN.md c: technology and operation levels, the block level as the lower of the two (capped at 2 and "partly unknown" when one side is unknown; unscored when both are), weights 3, 2 and 1 by criticality, layer scores as 25 × the weighted mean level, the overall score as the mean of the existing layer scores, the weakest critical link with its ties, the evidence coverage, the exclusive non-EU control, the Made-in and Run-by counts, the what-ifs on a copy of the blocks, and the portfolio pooled per category over the scored critical blocks (I11). A figure without a basis is `null` and shows "no data", never 0.

Fact keys: `score.overall`, `score.layer.<layer>`, `seal.<block>`, `coverage`, `share.exclusive_non_eu`, `weakest.block`, `weakest.level`, `weakest.ties`, `count.made_in.<class>`, `count.made_in.critical.<class>`, `count.run_by.<class>`, `count.run_by.critical.<class>`, `whatif.<L1–L3>.overall`, `whatif.<L>.delta`, `whatif.<L>.weakest.block`, `whatif.<L>.weakest.level`, `whatif.<L>.weakest.ties`, `whatif.<L>.exclusive_non_eu` and `portfolio.<category>.exclusive_non_eu`. Two refinements of PLAN.md c.4: the plan's single `whatif.<lever>.weakest` is split into a block, a level and a tie count, so the model can cite each, and `count.run_by.critical.<class>` is added beside its Made-in twin. `tests/engine.mjs` reproduces S1 to S4 within 1e-9 of the exact fractions and every display string in both languages (AC-01); Diagnostics recomputes the same cases in the browser from `data/golden.js` (`js/selftest.js`, 137 checks).

## 9. The fact audit

`js/facts.js` audits every model-written text in six steps on the text with its whitespace normalised: placeholders are resolved (an unknown key is an error); quoted text found verbatim in the run's evidence, ISO dates, block ids, lever ids and legal references found in the evidence are set aside; blocked words and fractions are reported; every other number token is reported unless the evidence writes it the same way. Each blocked token is reported once, as written, in the order it appears. The evidence is the catalogue entry, the titles of the pages and results the run read and the quotes it recorded; evidence URLs are set aside too, so a source can be linked.

- **D9.** A four-digit year passes when the run's evidence contains it ("since 2025" passes when a quote says 2025; "since 2019" does not).
- **D10.** Cardinal number words above twelve are blocked in English (thirteen to nineteen, the tens from twenty to ninety, hundred, thousand, million, billion and trillion, with their compounds such as "seventy-two" and their plurals such as "hundreds") and in German (any word made only of number parts that is above twelve, compounds such as "zweiundsiebzig" included, and Millionen, Milliarden, Billionen); "Jahrhundert" and counts up to twelve stay allowed.

`tests/audit.mjs` runs F01 to F29, F21 and F22 again with a non-breaking space after "§", the ten cases of D9 and D10 and 22 edge cases from the brief's wording (AC-02).

## 10. Schemas and the validator

`data/schemas.js` holds the eleven JSON Schemas of the brief's §10 (CatalogueEntry, ServiceProfile, BuildingBlock, Evidence, LayerStatus, Assessment, EngineResult, Lever, Decision, RunEvent, AuditEvent), each with an `$id` under https://victorpflueger.github.io/sovereigntyassessment/schemas/ and references by file name ("Evidence.json"). None of the sister apps has a validator (I1), so `js/schema.js` implements the subset the contracts use: `type`, `enum`, `const`, `required`, `properties`, `additionalProperties`, `items`, `minItems`, `maxItems`, `minLength`, `maxLength`, `pattern`, `format: date`, `minimum`, `maximum`, `anyOf`, `oneOf` and `$ref`. `tests/unit.mjs` ("schemas") validates the brief's example block, the golden blocks, the catalogue and the reference facts, and refuses ten broken copies.

## 11. Decisions D1 to D11

Victor approved the plan's defaults on 19 November 2026 ("Continue with the next step"); they are in force.

| # | Decision | In force |
|---|---|---|
| D1 | German product name | "Souveränitätsbewertung" |
| D2 | Germany and the other EU states | Scored alike; the Made-in display keeps them apart |
| D3 | Pre-runs after the first six | Every remaining catalogue entry with enough public evidence, and this prototype itself (M3) |
| D4 | Recording pre-runs | Hand-authored from public sources; Victor records live runs later |
| D5 | Standards as a third category | Not in version 1 (the catalogue schema refuses one) |
| D6 | Page icon and VIP card | Vici's `honeycomb` in a lilac cell; card text in M4 |
| D7 | Providers named in public sources | Shown neutrally with their sources; the private term list leaves them out |
| D8 | First view of the spider diagram | By layer, by block one click away (M2) |
| D9 | Years in model text | Allowed when the run's evidence contains the year (§9) |
| D10 | Number words | Blocked above twelve, in English and German (§9) |
| D11 | Citations missing from text on Sonnet 5.5 or Opus 5.5 | Fetch first; no beta header (AC-21, M2) |

## 12. Deviations and open issues

- **Hygiene without the private term list.** The brief has Victor add the list as the `HYGIENE_TERMS` secret; he cannot provide it. CI therefore runs `tests/hygiene.mjs` in its generic mode (e-mail addresses only), which says so ("HYGIENE GENERIC OK"). Before each push the build session runs the same test with its own list from a file outside the repository (`HYGIENE_TERMS_FILE`), which must print "HYGIENE OK". The list itself never enters the repository. The test's header is reworded neutrally; its code is the Timetable Translator's.
- **Not yet run against the real API.** Version 0.2.0 runs the live agent against a stand-in that streams the real protocol (§13, `tests/live.mjs`); no key is part of the build. The first live run is Victor's (AC-21; the README's run book), and it is where the citations of fetched pages (I2, I3) are confirmed on the real API.
- **The method view** (brief §9: the layers, the level rules and their source, the editable weights, the class and evidence rules, what the score is not) was announced here for version 0.2.0, but no milestone of PLAN.md h holds it, and version 0.2.0 does not have it. The engine already takes layer weights (§8). Proposed for version 0.3.0, with Compare and Portfolio; an open decision for Victor. The Commission's implementation guidance (PLAN.md, M3) needed an approval in Phase 0 that was not given and is still unread; the view will quote the framework's v1.2.1 and name the version (I10).
- **Pages the fetch tool could not read** while the pre-runs were researched: the Federal Portal's own pages return only a JavaScript notice; one paywalled teaser, SAP's imprint and one press article refused the tool; one procurement notice came back empty. None of them is cited; §17 lists what was used instead. One redirect target needed an approval that went unanswered and was not used.
- **Header at laptop widths.** Below 1,500 px the four tiles take a row of their own, so the prototype line and the tiles keep their full text (DESIGN.md §6).
- **The open drawer on a 1280 × 720 screen** leaves the map and the console a strip: the review, the levers and the drafts stay fully usable in the drawer, and Hide gives the map its room back. The spider diagram keeps its labels legible at any size it gets (DESIGN.md §9); the layout of short screens is part of M4's hardening.

| Issue | Topic | Status in 0.2.0 |
|---|---|---|
| I1 | No schema validator in the sister apps | Done: `js/schema.js` (§10) |
| I2 | Fetched-document citations carry no URL | Done: the document registry maps a citation's index to the fetched document's URL (§14); confirmed live in AC-21 |
| I3 | Cited sentences may arrive as thinking blocks | Done: citations are read from text and thinking blocks alike (§14); confirmed live in AC-21 |
| I4 | No pre-check for web fetch | Done: a switched-off tool stops Live with a message that offers Simulation (§13) |
| I5 | Newer server-tool versions | Basic versions kept (§2) |
| I6 | API version 2026-10-21 | Staying on 2023-06-01 (§2) |
| I7 | The shell's paid probe fails on Sonnet 5.5 | Not used (§3) |
| I8 | Number words and years in the audit | Done: D9 and D10 (§9) |
| I9 | Deutschland-App is a prototype in a pilot | Done: the catalogue's status and aliases (DATA_SOURCES.md §3) |
| I10 | SEAL-3's name differs between sources | Open: the method view, proposed for version 0.3.0 (§12) |
| I11 | The portfolio's share | Done: pooled over the blocks (§8) |

## 13. The live agent

`js/agent.js` runs the Claude tool-use loop in the browser, adapted from Rebate Hunter's agent, the sister app that already sends the server-side web search. One run is a series of streaming `POST /v1/messages` calls with the same `tools` array every time: the fifteen client tools of `js/tools.js` (`cat_lookup`, `ref_facts`, `rec_profile`, `rec_block`, `rec_block_update`, `rec_block_remove`, `rec_layer`, `eng_score`, `eng_whatif`, `ui_progress`, `ui_choose_service`, `ui_request_review`, `ui_propose_levers`, `ui_draft_memo`, `ui_final_report`) and the two server tools of `js/config.js`, `web_search_20250305` (at most 12 uses a turn, approximate location Germany) and `web_fetch_20250910` (at most 10 uses, 8,000 content tokens, citations on). `tool_choice` is `auto`; no tool carries `strict`.

- **The conversation.** Every assistant block goes back unchanged, encrypted search content, citations and thinking with its signature included. `stop_reason` drives the loop: `tool_use` runs the client tools and answers with `tool_result` blocks only, also in a mixed turn where a server tool ran in the same response; `pause_turn` resends the conversation unchanged; `max_tokens` retries once with more room when a tool call was cut off; `end_turn` before the report sends at most two nudges, each saying what is left of the budgets.
- **Errors inside results.** A search or fetch that fails inside an HTTP 200 (`max_uses_exceeded`, `url_not_accessible` and the like) is shown as the tool's failure and the run goes on. A 400 saying that web search or web fetch is switched off for the organisation stops Live at once with a message that offers Simulation; no further request is sent.
- **Caps** are checked before every call: no 41st model call, and none once €3.00 is spent. The cost meter adds each response's usage at the model's listed prices (§1) and $0.01 per web search, converted at 0.894 euros per dollar; `tests/live.mjs` checks it against the stand-in's usage to within 1e-9.
- **Searches and fetches** count only when the response that ran them is kept; their results then feed the evidence registry (§14).
- **The system prompt** (`js/prompt.js`) and every tool result are English, as the model reads them; whatever the person reads (narration, block names, reasons, levers, memo, report) is written in the run's language, and code's own lines come from the dictionaries. `tests/i18n.mjs` therefore leaves the model-facing files (`js/prompt.js`, `js/tools.js`, `js/guards.js`, `js/runs_check.js`) out of its stray-string check: their English strings never reach the screen as they are.
- **The audit** (`js/audit.js`) records every call: what was sent without the key, what came back, the usage and the timing; page texts and encrypted search results are left out. The Audit tab exports it as JSON.

## 14. Evidence verification

`js/evidence.js` holds one registry per run, used alike by the live agent, the simulation player, `tools/check-runs.mjs` and the tests (PLAN.md d).

- **Provenance.** An evidence URL counts only if this run's search results or fetched pages returned it, or `cat_lookup` or `ref_facts` listed it; a replayed pre-run lists its own research steps. A tool call citing any other URL is refused with `is_error: true`, naming the URLs it may cite. URLs compare with lower-case scheme and host and without the fragment; the path compares exactly.
- **Quotes.** A quote of at most 150 characters is verified when, with whitespace normalised, it occurs in the text of its URL's page as fetched in this run, or in the `cited_text` of a citation of that URL in this run. Search citations carry their URL. Fetched-document citations carry only a `document_index`: the registry numbers the fetched documents in the order the conversation holds them and maps the index to that document's URL, and refuses the mapping when the index points at no document or the citation's title differs from the document's (I2). Citations count from text and thinking blocks alike (I3). An evidence item without a quote takes this run's latest citation of its URL.
- **Gating.** A field without a verified quote counts as unknown for scoring: Made in becomes `UNKNOWN` when `tech` or a recorded `tech.parent` lacks one, Run by likewise with `operator` and `operator.parent`; hosting becomes `UNKNOWN`, licence and exit `unknown`. The block shows which fields are unverified and why, and an unknown is never a finding against a provider. A reviewer's correction needs a reason, not evidence, and counts as the reviewer set it.

## 15. Guardrails in code

- **The fact audit** (§9) runs on every audited field of every tool call: narration, the profile's texts, each block's name, role and note, each layer reason, each lever's title and rationale, the memo and the report. A failure returns `is_error: true` with the blocked tokens; after two failed retries the text is kept with an "Unchecked" tag and a notice, never silently.
- **The sequence rules** (`js/guards.js`), one function for the live agent, the player and `tools/check-runs.mjs`: nothing runs after the report; once the person has reviewed, the findings are frozen and only the person changes blocks; the review waits until every layer has blocks or a recorded status and `eng_score` has run on the current blocks; levers come after the review, one decision per run; the memo follows the decision and names the same lever; an "assessed" report needs the review, the decision and the memo; "not_a_service" ends a run only without blocks; "stopped" may end a run before a report; a service is chosen among candidates only before any block is recorded.
- **The person's steps** (`ui_choose_service`, `ui_request_review`, `ui_propose_levers`) wait for the person in both modes; the tool returns only what the person decided.

## 16. The simulation format and the recorder

A pre-run is a script `data/runs/<entry>.js` that sets `window.SA_RUNS["<entry>"]` (a script, because the security policy allows no fetch from the page's own origin): `{ id, entry_id, source: "hand_authored" | "recorded", as_of, method_version, query, steps }`. A step has one key: `say` (one sentence, `{ en, de }`), `search` (`{ query, results: [{ url, title }] }`), `fetch` (`{ url, title, pdf? }`; a page's text is never stored), `tool` with its `input` (texts as `{ en, de }`, evidence items with their `verified` flag), `memo: true` (the memo for the person's choice, from the template) or `report` (`{ findings: { en, de } }`, followed by code's closing part). Figures appear only as placeholders.

- **Playback** (`js/simulation.js`) runs the steps through the same tool executors as Live, so the engine recomputes every figure, the guardrails apply, and a review correction or another lever yields consistent tiles, memo and report (AC-11). The run's language is the one active at its start; the pauses (`STEP_MS`) divide by the speed ×1, ×2 or ×4. Nothing leaves the page.
- **`tools/check-runs.mjs`** checks each pre-run under the rules of section 8 of the brief: both languages in every model-written text, the same placeholders in both, the fact audit, known fact keys, evidence on every block, URLs the run's research steps or the catalogue or the reference facts returned, quotes of at most 150 characters, every quote listed under its URL in `research/<entry>.md` with a "Read on" date, no key-like string, no thinking block. It then plays each pre-run in both languages along every lever choice. With `--write` it sets each quote's `verified` flag from `research/`; without it, flags that differ from `research/` are a failure. `tests/runs.mjs` plants a defect for each rule.
- **Research notes** (`research/<entry>.md`) list, per source, `### [Title](URL)`, `Read on YYYY-MM-DD (German|English).` and each quote as a `> ` line. Quotes of the reference facts were verified when the facts were built (§4 of DATA_SOURCES.md) and are not repeated there.
- **The recorder** (`js/recorder.js`, "Save run as simulation" after a live run) writes the same format from a run's events: narration, research steps, every client tool call with its input and its checked evidence, template steps for the memo and the report; no thinking, no key, no figure. The file is marked "recorded" and holds the run's one language; curating it means adding the second language and running `tools/check-runs.mjs`.

## 17. How the pre-runs were researched and verified

The six pre-runs were written by hand on 19 November 2026 from public pages found with the build session's web search and read with its web fetch tool. That tool answers with a small model's reading of the page, so each check asked for the sentence verbatim, and only a quote the tool returned verbatim (or returned as consecutive verbatim parts) was used. The build session kept a log with one row per quote (URL, quote, result, date, the tool's answer); it is not part of the repository, and `research/` holds every quote the pre-runs cite, with its URL, title and read date. Where a page could not be read, nothing from it is cited (§12): the Federal Portal's pre-run rests on § 9a EGovG, the BMDS's Deutschland-Stack paper, a Bundestag news item on a parliamentary answer and the BundID's imprint; SAP's seat comes from SAP's corporate governance statement. Facts that only a press report gives (the Deutschland-App's cloud, platform and messenger) say so in the block's note and carry low confidence, and a block whose maker no source names (ePayBL's software, the Federal Portal's platform) is recorded as a gap rather than guessed.
