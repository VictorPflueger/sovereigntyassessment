# Sovereignty Assessment: build plan

**Status:** Phase 0 plan, waiting for Victor's approval. **Date:** 19 November 2026.

This plan turns the build brief into milestones. The brief decides what to build; this file decides how, in which order, and how each step is proven. The brief itself stays outside this repository. Where the plan departs from the brief or from a sister prototype, it says so and gives the reason. Numbers from the brief appear here unchanged; every other figure was measured or looked up on 19 November 2026 and says where it comes from.

Contents: [0 Summary](#0-phase-0-in-one-page) · [1 Findings and probes](#1-phase-0-findings) · [a Architecture](#a-architecture-and-file-tree) · [b Events and tools](#b-run-events-and-agent-tools) · [c Engine](#c-engine) · [d Evidence](#d-evidence-verification) · [e Languages](#e-two-languages) · [f Screens](#f-screens) · [g Tests](#g-test-plan-and-ci) · [h Milestones](#h-milestones) · [i Risks](#i-risks-and-how-i-will-test-them) · [Appendix](#appendix-a-cors-probe-for-your-browser)

---

## 0. Phase 0 in one page

**What I did.** Read the brief in full. Studied the four sister prototypes at the commits in 1.1 (documents, `index.html`, `js/`, `data/`, `tools/`, `tests/`, workflows) and played one Simulation of each to its end in headless Chrome, served locally because this environment cannot reach github.io. Read Vici v1.0.0 and the card data of the prototypes page. Attached the empty target repository. Probed the Claude API's CORS behaviour with curl and from a real Chrome page, and verified model IDs, prices, the web search and web fetch tools, strict tool limits and API versions in the official documentation. Read the method sources: the Deutschland-Stack portal, the EU Cloud Sovereignty Framework v1.2.1 and the BMDS Sachstand. Recomputed S1 to S4 with exact fractions, built a throwaway spike of the fact audit against F01 to F29, measured the honeycomb's contrast from Vici's tokens, and searched the public evidence for the six M2 pre-runs.

**The plan in five lines.**
1. The shell comes from Rebate Hunter and the Timetable Translator, copied unchanged except four modules (`drawer`, `progress`, `handover`, `modal`) that route their strings through the new i18n and take their tabs and steps from the app; `tests/parity.mjs` keeps every other shell file identical.
2. One run-event bus, two producers: the Live agent (Rebate Hunter's loop plus server-side web search and web fetch, fixed tool definitions, 40 calls and €3) and the Simulation player, which replays hand-authored pre-runs through the same executors.
3. A deterministic engine owns every level, score and share. It reproduces S1 to S4 exactly; the model cites figures only through fact keys, and the fact audit enforces rule 4.
4. Evidence is checked in code: a URL counts only if this run returned it (or the catalogue or the reference facts list it), a quote only if it is in the fetched text or in a citation of that URL. A field without a verified quote scores as unknown.
5. Four milestones, one pull request each; English and German from M1; Simulation plays offline from M2.

**Evidence base, in short.** Public sources exist for 34 of the 36 layer cells of the six M2 pre-runs (d.8). The two gaps are where the Online-Ausweis's central eID background systems are hosted and the Bundesportal's current software platform. FIT-Connect is the best documented (its FAQ names both data centres). The Deutschland-App rests on a government answer and press reports about a prototype that is not yet in the app stores.

**Decisions for you** (1.6): the brief's defaults for D1 to D8, and three new ones: D9 years in model text, D10 number words, D11 what to do if citations come back inside thinking blocks.

**What I need from you.** Enable GitHub Pages (Settings → Pages → Deploy from a branch → `main` / `/ (root)`), or tell me to: my GitHub CLI token in this session is not valid for the settings API, and a settings change needs your approval anyway. Add the repository secret `HYGIENE_TERMS` with only the terms that would reveal a relationship: the test matches whole words in every file, URLs included, and has no allowlist, so a provider that public sources name for a pre-run must not be on it (D7). Approve or change the decisions. Then I start M1.

---

## 1. Phase 0 findings

### 1.1 What I read

| Source | What | Notes |
|---|---|---|
| Build brief (project file, 19 Nov 2026) | In full | S1 to S4 recomputed (c.5); fact audit spike (c.6) |
| Rebate Hunter 7.2.0 (`73c00f8`) | README, DESIGN, TECH_NOTES, REVIEW, DEMO_SCRIPT, DATA_SOURCES, `index.html`, `js/`, `data/`, `tools/`, `tests/`, CI; closely: `js/agent.js` (request body, downgrades on 400, stop reasons, nudges), `js/anthropic.js`, `js/config.js` | The reference shell; its agent loop is the base of ours |
| Navigator 1.2.0 (`61f1483`) | The same set; closely: TECH_NOTES §2 (server-side web search) and §3 (CORS probes) | Lacks `js/clock.js` and `js/labels.js` (a.5) |
| Timetable Translator 1.4.0 (`04006b6`) | The same set; closely: REVIEW (shared shell), DESIGN (colour grammar, deviations from Vici), TECH_NOTES (verified facts, CSP, guardrails), `js/events.js`, `js/facts.js`, `tests/parity.mjs`, `tests/hygiene.mjs`, `tests/docs.mjs`, `tests/live_site.mjs`, both workflows | The newest build and the shell list this plan starts from |
| Repack Pilot 0.5.0 (`c319649`) | PLAN.md (the approved Phase 0 format), TECH_NOTES D71 (adapted shell modules) | Ten shell files differ from Rebate Hunter's (a.5) |
| Vici v1.0.0 (`fdd868b`) | Guidelines on colour, hexagon, layout, typography and data visualisation; data-display components; `dist/tokens.json`; `dist/vici-icons.svg` (has `vc-honeycomb`) | Diverging scale and data series used in f |
| VIP (`f6f7aae`) | `data/prototypes.js` (card fields: name, kind, subtitle, description, url, code, icon, tags, note) and its README | Card text proposed in M4 (D6) |

### 1.2 Sister prototypes played

The live sites are blocked by this environment's network allowlist (P13). I served each clone locally at the commit above and played one Simulation to its end with the repository's own decision plan in `tests/sims.mjs`, in headless Chrome 153.

| Prototype | Run | Result |
|---|---|---|
| Rebate Hunter | SC-CISCO-MA | Done; options A €17,100, B €17,500, C €1.09M, do nothing €2.14M; SIMULATION badge and watermark; no page error, no CSP violation, no network request |
| Navigator | SC-RTM-STRIKE | Done; options A €25k, B €50k, C €469k, do nothing €2.6M; same markings; no page error, no CSP violation, no network request |
| Timetable Translator | SC-PLATFORM | Done; misinformed passengers A 7, B 15, C 72, do nothing 312; same markings; no page error, no CSP violation, no network request |
| Repack Pilot | sc1 | Done; option B and both drafts approved; the replay equals the replay in Node (31 s at ×4) |

Screenshots and result files stay outside the repository (Appendix B).

### 1.3 Target repository

- `VictorPflueger/sovereigntyassessment`, public. Attached with push access on 19 Nov 2026 at 16:37 UTC: the clone reported an empty repository and `git ls-remote` returned no refs. The commit that adds this file is its first.
- **GitHub Pages: not enabled.** Please enable it (Settings → Pages → Deploy from a branch → `main` / `/ (root)`), or tell me to. Until M1 adds `index.html` there is nothing to show.
- **`HYGIENE_TERMS`:** please add the secret before M1's first pull request; `tests/hygiene.mjs` reads it (D7).

### 1.4 Probe log

All on 19 November 2026; network probes at the UTC times given.

| # | Probe | When (UTC) | Source or method | Result |
|---|---|---|---|---|
| P1 | Model IDs | 2026-11-19 | https://platform.claude.com/docs/models/overview | `claude-sonnet-5-5` (default here), `claude-haiku-5-5`, `claude-opus-5-5`: 1M context, 128K output; default effort high on Sonnet 5.5, medium on Haiku and Opus 5.5. Also listed: `claude-fable-5-2` (not added). The models API's `capabilities.server_tools` covers web search and code execution, not web fetch |
| P2 | Model prices | 2026-11-19 | https://platform.claude.com/docs/en/about-claude/pricing | Equal to the sister apps' `js/config.js`: Sonnet 5.5 $2 in, $10 out, $2.50 cache write (5 min), $0.10 cache read; Haiku 5.5 $0.10/$0.50/$0.125/$0.01 up to 100K prompt tokens and $0.50/$2.50/$0.625/$0.05 above; Opus 5.5 $4/$20/$5/$0.20. Web search $10 per 1,000 searches; web fetch has no fee beyond tokens |
| P3 | Web search tool | 2026-11-19 | https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool.md | `web_search_20250305` is the basic version; newer `web_search_20260209` (dynamic filtering) and `web_search_20260318`. `max_uses` counts within one turn (failed searches count; a turn spans requests that resume after `pause_turn` or whose last message holds only `tool_result` blocks); `user_location` approximate with country and timezone; results carry `encrypted_content` that must be passed back unchanged; citations `web_search_result_location` with `url`, `title`, `cited_text` (up to 150 characters); errors arrive inside the result with HTTP 200; an organisation that switched it off gets HTTP 400 "web search is not enabled" |
| P4 | Web fetch tool | 2026-11-19 | https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool.md | Stable, no beta header. `web_fetch_20250910` is the basic, ZDR-eligible version; newer `…20260209`, `…20260309`, `…20260318`. Fetches only URLs that appeared in user messages, client tool results or earlier search or fetch results; `max_uses` per turn; `max_content_tokens` limits text, not PDFs; PDFs come back base64-encoded; citations on fetched documents are `char_location` with `document_index`, `document_title` and `cited_text`, and no URL; switched off by an organisation: HTTP 400 "web fetch is not enabled" |
| P5 | Strict tool use limits | 2026-11-19 | https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md | At most 20 strict tools, 24 optional and 16 union-typed parameters per request; `additionalProperties: false`; no length or range keywords. As the brief says |
| P6 | API versions | 2026-11-19 | https://platform.claude.com/docs/en/api/versioning?version=2026-10-21 (returned by search) | `2026-10-21` is the newest; `2023-06-01` stays active. Under 2026-10-21 a document block placed directly in an assistant message returns 400 |
| P7 | Thinking on Sonnet 5.5 and Opus 5.5 | 2026-11-19 | https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5.md and https://platform.claude.com/docs/build-with-claude/thinking | Text between tool calls longer than a sentence or two comes back as progress-update thinking blocks (display "omitted" by default; "updates" behind the beta header `thinking-display-updates-2026-08-18`); shorter remarks stay text. Forced tool use returns 400; `thinking: disabled` returns 400 on Sonnet 5.5. Whether citations can appear in thinking blocks is not documented |
| P8 | CORS preflight | 2026-11-19 16:42 | curl through the session proxy: `OPTIONS /v1/messages`, `Origin: https://victorpflueger.github.io`, the four request headers | 200; `access-control-allow-origin: *`; allow-headers echo `x-api-key, anthropic-version, content-type, anthropic-dangerous-direct-browser-access`; max-age 600 |
| P9 | POST with the header | 2026-11-19 16:42 | curl, keyless `POST /v1/messages` with `anthropic-dangerous-direct-browser-access: true` | 401 `authentication_error` "x-api-key header is required"; `access-control-allow-origin: *`; `access-control-expose-headers: *` |
| P10 | POST without the header | 2026-11-19 16:42 | curl, the same call without the header | 401 without `access-control-allow-origin`: a browser blocks it, so the header stays mandatory |
| P11 | The same calls from a real page | 2026-11-19 16:42 | Chrome 153.0.8010.12 via Playwright, page served on 127.0.0.1 | With the header: 401 readable by the page. Without it: `TypeError: Failed to fetch` (a CORS block). Matches Navigator's TECH_NOTES §3 |
| P12 | GET /v1/models with the header | 2026-11-19 16:42 | curl and the same Chrome page, keyless | 401 with `access-control-allow-origin: *`; its preflight 200. The free key check works from a page |
| P13 | The sister apps' live sites on github.io | 2026-11-19 16:42 | curl: not probed (refused by the egress allowlist) | Exit 56, HTTP 000. The Simulations in 1.2 ran on local copies at the deployed commits; Appendix A has a one-line probe for your browser on github.io |
| M1 | Deutschland-Stack layers and their order | 2026-11-19 | https://deutschland-stack.gov.de/aufbau/ (reached through the portal's navigation) | Bottom-up: Infrastruktur; Entwicklung, Sicherheit und Betrieb (DevSecOps); Plattform; Basisdienst; Anwendungen und Dienstleistungen; Oberfläche und Zugang; with Strategie, Architektur und Governance framing the stack. The brief's six axes, labels and order hold |
| M2 | The minimum criterion | 2026-11-19 | https://deutschland-stack.gov.de/kriterien/ | "Mindestens ist eine Wechselfähigkeit zwischen Betreibern und Anbietern notwendig." The page also asks to buy preferably in the European single market (D2) |
| M3 | The SEAL scale of the EU Cloud Sovereignty Framework v1.2.1 | 2026-11-19 | https://ppc.land/content/files/2025/11/Cloud-Sovereignty-Framework.pdf (a copy of v1.2.1) and the Commission's implementation guidance https://commission.europa.eu/document/download/2ad80a48-166f-4c77-a513-80c53ca2a128_en | SEAL-0 "No Sovereignty" to SEAL-4 "Full Digital Sovereignty"; SEAL-0 and SEAL-1 are the two levels defined by exclusive control of non-EU third parties, so the brief's share holds. SEAL-3 is "Digital Resilience" in v1.2.1 and "Technological Sovereignty" in the guidance. The Commission's own PDF needed an approval in this session that was not given; M1 reads it |
| M4 | The BMDS document | 2026-11-19 | https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf | Every quote the brief takes from it is there. It writes "D-APP" (not Deutschland-App) and "Onlineausweis", has no MUK, does not spell out "DVC", and carries no date (the file name begins 260129) |

**Consequences for the plan.** The header and the request shape stay as in the sister apps. Fetched-document citations must be mapped to their URL in code (I2). The cited sentence the brief relies on may come back inside a thinking block (I3, D11). Diagnostics cannot pre-check web fetch (I4).

### 1.5 What I think is wrong, missing or not buildable in the brief

| # | Brief | Finding | Proposed fix |
|---|---|---|---|
| I1 | §7: validate every client tool's input "against its JSON Schema, as the sister apps do" | None of the four sisters has a schema validator; each tool handler checks its own input by hand | A small validator for the subset the tools use (`type`, `enum`, `required`, `properties`, `additionalProperties`, `items`, `minItems`, `maxItems`, `maxLength`, `pattern`, `anyOf`) in `js/schema.js`, no dependency. The same schemas validate the exports (AC-17) |
| I2 | §6.6: a quote verifies "within the `cited_text` of a citation of that URL" | Citations on fetched documents carry `document_index` and `document_title` but no URL (P4); only search citations carry one | `js/agent.js` keeps a registry of every document in the conversation in the API's order and maps `document_index` to the fetched URL; an ambiguous mapping leaves the quote unverified. Unit tests on recorded block shapes; checked live in AC-21 |
| I3 | §6.6: the agent "writes one sentence of plain text that cites the source" | On Sonnet 5.5 and Opus 5.5, text between tool calls longer than a sentence or two comes back as a progress-update thinking block without its text by default (P7); whether citations survive there is not documented | Keep the cited sentence to one short sentence, prefer HTML pages, and test it live in AC-21. If citations still go missing: D11 |
| I4 | §7 rule 8: Diagnostics reads `capabilities.server_tools.web_search.supported` | The models API lists web search, not web fetch (P1), so Diagnostics cannot pre-check web fetch | Diagnostics says so. A switched-off tool shows on the first live request (400); Live then stops with a clear message and offers Simulation (AC-08) |
| I5 | §7: `web_search_20250305` and `web_fetch_20250910` | Newer versions exist (P3, P4), with dynamic filtering through code execution | Keep the basic versions, as the brief says: no code execution, and `web_fetch_20250910` is the ZDR-eligible one. Dated in TECH_NOTES |
| I6 | §4: switching to `2026-10-21` "is one line" | Under `2026-10-21` a document block placed directly in an assistant message returns 400 (P6) | Stay on `2023-06-01`. Before the switch in all prototypes, a fake-API test checks that echoed server blocks never put a document directly into an assistant message |
| I7 | §4: the shared client | The shell's paid web-search probe sends `thinking: disabled`, which returns 400 on Sonnet 5.5 (P7); for Haiku 5.5 the documentation says nothing | This app does not use that probe; Diagnostics uses the free models call, as the brief asks. TECH_NOTES flags it for the sister apps |
| I8 | §7 rule 4: the fact audit | A literal spike passes all 29 cases and both non-breaking-space variants (c.6), but "seventy-two" and "zweiundsiebzig" pass, and "since 2019" is blocked even when the evidence contains 2019 | D9 and D10 |
| I9 | §8: Deutschland-App, "a prototype confirmed by the ministry" | One prototype tested in six Kommunen by a general contractor that chooses its own subcontractors (hib 786/2026), not in the app stores (a pilot city's notice), called "D-APP" by the BMDS | Catalogue status "prototype in a pilot", aliases D-APP and Bürger-App; its access layer stays a recorded gap until a distribution path is evidenced |
| I10 | §6.4: SEAL names | SEAL-3's name differs between v1.2.1 and the Commission's guidance (M3) | The method panel quotes v1.2.1 and names the version |
| I11 | §6.5: Portfolio | "The share of scored critical blocks at level 0 or 1" per category is pooled over the blocks (3 of 9 in S4), not a mean of the services' shares | Pooled, as S4 requires; the method panel says so |

### 1.6 Decisions for you

| # | Decision | My recommended default | Why |
|---|---|---|---|
| D1 | German product name | "Souveränitätsbewertung" (the brief's default) | |
| D2 | Score Germany above the other EU states? | No, alike (the brief's default) | The framework and the portal's single-market preference (M2) |
| D3 | Pre-runs after the first six | Every remaining catalogue entry with enough public evidence, plus this prototype itself (the brief's default) | Phase 0 shows how much evidence exists (d.8) |
| D4 | API key for recording pre-runs | Hand-authored pre-runs from public sources; you record live runs later and I curate them (the brief's default) | |
| D5 | Standards as a third category | Not in version 1 (the brief's default) | |
| D6 | Page icon and VIP card | Vici's `honeycomb` icon (`vc-honeycomb`), kind "prototype"; card text proposed in M4 (the brief's default) | |
| D7 | Providers named in public sources | Shown like any other provider, neutrally and with their sources; the private term list leaves them out (the brief's default) | The Deutschland-App's sources name its providers (d.8); a provider on the list would fail every build |
| D8 | First view of the spider diagram | By layer, the by-block view one click away (the brief's default) | |
| D9 (new) | Years in model text | Allow a four-digit year when that year appears in the run's evidence (a quote or a title); rule 4 otherwise unchanged; F01 to F29 keep their results | "Live since 2022" is a sourced fact; without this the agent can only quote it or write an ISO date |
| D10 (new) | Number words | Block cardinal number words above twelve in English and German, compounds included (seventy-two, zweiundsiebzig), outside placeholders and quotes; counts up to twelve stay allowed as words | Otherwise a figure can slip past the audit as a word; larger counts have fact keys |
| D11 (new) | If citations do not come back as text on Sonnet 5.5 or Opus 5.5 (AC-21) | Fetch first: a block whose only source is a PDF or an unfetched search result keeps the fields it supports unknown until a fetched page carries the quote; no beta header | Keeps the sister apps' request shape. The beta display mode (P7) stays an option you can choose instead |

---

## a. Architecture and file tree

### a.1 Layers in code

| Layer | Modules | Notes |
|---|---|---|
| Person and screen | `ui.js`, `controls.js`, `dialogs.js`, `intro.js`, `console.js`, `progress.js`, `handover.js`, `drawer.js`, `modal.js`, `ai_label.js`, `kpi.js`, `lang_switch.js`, `sovmap.js`, `spider.js`, `mix.js`, `honeycomb.js`, `datatable.js`, `blocks_panel.js`, `review_panel.js`, `levers_panel.js`, `method_panel.js`, `outbox.js`, `audit_panel.js`, `compare.js` and `portfolio.js` (M3) | The shell is the sister apps'; new: the sovereignty map, the panels, the language switch |
| Languages | `js/i18n/index.js`, `js/i18n/en.js`, `js/i18n/de.js`, `format.js`, `api_messages.js` | Every user-visible string; `Intl` with `en-GB` and `de-DE` (e) |
| Agent | `agent.js` (Live), `simulation.js` (pre-runs), `prompt.js`, `tools.js`, `tool_plain.js`, `summaries.js`, `recorder.js`, `sim_vars.js` | One bus, two producers |
| Control in code | `engine.js`, `classes.js`, `facts.js` (fact keys, placeholders, rule 4), `evidence.js` (provenance, quotes, field gating), `schema.js`, `guards.js`, `drafts.js`, `payoff.js`, run caps in `agent.js` | Every figure, every evidence decision and every person's step passes through here |
| Data | `catalogue.js` (index, aliases, suggestions) over `data/catalogue.js`; `data/ref_facts.js`; `data/runs/*.js`; `data/schemas.js`; `runs_check.js` | Data ships as scripts (`window.*`), because the policy allows no fetch from the page's own origin |
| Audit and export | `audit.js`, `run_facts.js`, `export.js` (M3) | JSON audit export in every milestone |

### a.2 How a run works

1. **Start.** The person types a name (suggestions from the catalogue) or picks a chip and presses **Start agent**. The mode dialog offers Simulation for entries with a pre-run and Live for any text; Live asks for the key (session storage, checked with `GET /v1/models`). `run_start` carries the query, the entry, the mode and the run's language.
2. **Understand.** `cat_lookup` returns the catalogue entry and makes its starting URLs fetchable. An ambiguous name goes to `ui_choose_service`; a text that is no digital service ends with `ui_final_report` and `not_a_service`. The agent records the profile with `rec_profile`.
3. **Research**, layer by layer. The agent searches and fetches (server tools) and reads `ref_facts`; before a block from a PDF or an unfetched search result it writes one short cited sentence. `rec_block` goes through `evidence.js` (provenance, quotes, field gating), `classes.js` and `engine.js`; `block_recorded` and `score_update` grow the spider diagram and the honeycomb as blocks arrive. `rec_layer` marks a layer "no evidence found" or "not applicable" with a source.
4. **Score.** `eng_score` returns the fact keys of section 6.5 of the brief; the tiles fill.
5. **Your review.** `ui_request_review` hands the findings to the person: confirm, skip, or correct a block with a reason. Each correction recomputes and is logged.
6. **Recommend.** The agent prices up to three levers with `eng_whatif` on copies and proposes them with `ui_propose_levers`; the person chooses one or "Keep as is" with the one merlot Approve. `ui_draft_memo` puts the memo in the Outbox ("Draft. Nothing is sent."). `ui_final_report` ends the run with its outcome; `run_end`.

**Simulation** plays a pre-run on the same bus: its research steps (queries, result titles and URLs, fetched pages) as events, then its recorded tool calls through the same executors, so the engine, the evidence flags and the screen behave as in Live. Figures are recomputed at playback; texts use placeholders. The review and the lever choice wait for the person in both modes; the lines that depend on them, the memo and the report's closing part come from templates in both languages. Speeds ×1, ×2 and ×4.

### a.3 File tree

```
sovereigntyassessment/
├─ index.html  favicon.svg  .nojekyll
├─ README.md  DESIGN.md  TECH_NOTES.md  DATA_SOURCES.md  DEMO_SCRIPT.md  REVIEW.md  PLAN.md
├─ .github/workflows/  tests.yml  live-site.yml
├─ vici/       Vici v1.0.0, unchanged (vici/README.md lists its files)
├─ css/        shell: style.css components.css console.css drawer.css modals.css
│              app:   map.css (spider, mix, honeycomb, table)  panels.css (blocks, review, levers, method, compare, portfolio)
├─ data/       catalogue.js  ref_facts.js  schemas.js  runs/<entry>.js (one pre-run each)
├─ research/   <entry>.md: URL, title, quote, date read for every hand-authored quote
├─ js/i18n/    index.js en.js de.js
├─ js/         shell, copied:  theme anthropic sse cost keystore clock dom labels md
│              shell, adapted: drawer progress handover modal
│              app shell:      main config events state icons ui controls dialogs intro console ai_label kpi
│                              audit audit_panel run_facts diagnostics diagnostics_view outbox drafts payoff
│                              format pop popovers api_messages lang_switch
│              method:         classes engine facts evidence schema guards catalogue runs_check
│              agent:          agent prompt tools tool_plain summaries simulation sim_vars recorder
│              screen:         sovmap spider mix honeycomb datatable blocks_panel review_panel levers_panel
│                              method_panel compare portfolio export
├─ tools/      check-runs.mjs
└─ tests/      run-all.mjs README.md
               lib/ harness.mjs prototype.mjs fake-claude.mjs fixtures.mjs
               fixtures/ s1-levels.json s2-assessment.json s3-levers.json s4-portfolio.json f-audit.json
               shared: tokens.mjs hexagon.mjs page-icon.mjs vici-files.mjs parity.mjs hygiene.mjs docs.mjs live_site.mjs remote_head.mjs
               app:    i18n.mjs unit.mjs engine.mjs audit.mjs runs.mjs smoke.mjs sims.mjs live.mjs accept.mjs layout.mjs design.mjs
```

### a.4 Reuse map

Verdicts: **Copy** (the same file; only the app's name and the `sa.` storage prefix differ, as `tests/parity.mjs` normalises them), **Adapt** (same role and structure, changed content), **Replace** (a new module in the same role), **New**, **Drop**, **Pattern** (read for its design, no code taken).

#### The shared shell (the Timetable Translator's REVIEW.md, "Shared shell"), and the files it imports

| Path | Verdict | Sovereignty Assessment |
|---|---|---|
| `vici/` | Copy | Vici v1.0.0 (`fdd868b`) byte for byte; `tests/vici-files.mjs` and `tests/parity.mjs` check it |
| `vici/README.md` | Copy | Lists Vici's files |
| `js/theme.js` | Copy | Theme before the first paint; `vc-theme` is the only shared storage key |
| `js/anthropic.js` | Copy | Streaming client, retries, key check. The app translates its errors by HTTP status and error type (`js/api_messages.js`), so this file stays unchanged; its paid web-search probe is not used (I7) |
| `js/sse.js` | Copy | SSE reader |
| `js/cost.js` | Copy | Price-table maths, the search fee included |
| `js/keystore.js` | Copy | Key in session storage under `sa.anthropic.key`; masking and redaction |
| `js/clock.js` | Copy | Run clock |
| `js/dom.js` | Copy | Safe element factory |
| `js/labels.js` | Copy | Console labels and run facts agree |
| `js/md.js` | Copy | Escape-first Markdown |
| `js/drawer.js` | Adapt | Strings through `t()`; the app defines the tabs (`configureDrawer`): Building blocks, Review, Levers, Outbox, Audit; Vici's byline kept |
| `js/progress.js` | Adapt | Strings through `t()`; the app defines the rail (`configureRail`): Understand, Research, Score, Your review, Recommend, with its state map |
| `js/handover.js` | Adapt | "Awaiting your choice / review / decision" through `t()`; states from the app's `RUN_STATES` |
| `js/modal.js` | Adapt | "Close dialog" through `t()`; open dialogs re-render on a language change |
| `css/components.css` | Copy | Buttons, chips, segmented control (also the EN and DE switch), AI label |
| `css/console.css` | Copy | Console and rail |
| `css/drawer.css` | Copy | Same rules |
| `css/modals.css` | Copy | Same rules |
| `css/style.css` | Copy | Shell rules unchanged up to the marked app-specific block; the block holds the workspace grid |
| `tests/tokens.mjs` | Copy | Vici's values in both themes, every pair the app draws (from `tests/lib/prototype.mjs`) |
| `tests/hexagon.mjs` | Copy | Nothing round; the list of exceptions stays empty |
| `tests/page-icon.mjs` | Copy | Page icon as on the card |
| `tests/vici-files.mjs` | Copy | `vici/` matches its release |
| `tests/lib/prototype.mjs` | Adapt | This app's values: name, the colour pairs of the spider, mix and honeycomb (f.3), the states the hexagon test visits, the `honeycomb` icon in lilac |
| `DESIGN.md` | Adapt | Colour grammar, the teal series as a deviation from Vici's series order, the honeycomb mapping |
| `tests/parity.mjs` | Adapt | Adds the app's names and `sa.` to the normalisation; moves the four i18n modules from the identical list to an adapted list, which checks that each exists and that REVIEW.md names it with its reason |
| `js/events.js` | Adapt | The app's own bus: the same class and envelope; new event types and run states (b.1) |
| `js/icons.js` | Adapt | Icons from Vici's set for layers, evidence, levers and origin |
| `tests/lib/harness.mjs` | Adapt | Storage keys `sa.*`; output folder from `SA_TEST_OUT` |

#### Other files of the Timetable Translator

| Path | Verdict | Sovereignty Assessment |
|---|---|---|
| `index.html` | Adapt | Same skeleton, boot screen and meta policy (exactly the brief's); English static defaults; new data scripts; the sovereignty map as the centrepiece |
| `favicon.svg` | Replace | Vici's honeycomb in a lilac hexagon cell (D6) |
| `README.md` | Adapt | Same structure; stub now, complete in M4 |
| `TECH_NOTES.md` | Adapt | Verified facts with dates (1.4 first), decisions, guardrails, simulation format, verification log, acceptance checklist |
| `DATA_SOURCES.md` | Adapt | Every source with its date |
| `DEMO_SCRIPT.md` | Adapt | Five minutes, an English and a German talk track |
| `REVIEW.md` | Adapt | The adapted shell modules with reasons (M1); the independent review (M4) |
| `.github/workflows/tests.yml` | Adapt | The suites of g; parity against Rebate Hunter's `main`; `HYGIENE_TERMS` from the secret |
| `.github/workflows/live-site.yml` | Copy | Checks the served site after every Pages build |
| `js/main.js` | Adapt | Required globals: `SA_CATALOGUE`, `SA_REF_FACTS`, `SA_RUNS`, `SA_SCHEMAS` |
| `js/config.js` | Adapt | `APP.id = "sa"`; models and prices (P1, P2); 1 USD = 0.894 EUR; caps 40 calls and €3; search fee; both server tool definitions; `anthropic-version: 2023-06-01`; storage keys |
| `js/state.js` | Adapt | Language, layer weights, map view, comparison selection |
| `js/agent.js` | Adapt | Rebate Hunter's loop (request body with caching, adaptive thinking with summaries, effort and `tool_choice` auto; downgrades on 400; stop reasons; at most two nudges) plus: fixed tool definitions with both server tools; server blocks echoed unchanged; the document registry for fetch citations (I2); search and fetch counts across the run; a disabled tool stops Live |
| `js/prompt.js` | Replace | The method, rules 1 to 9, the run's language |
| `js/tools.js` | Replace | The fifteen client tools of b.3, validated by `js/schema.js` |
| `js/tool_plain.js` | Adapt | One plain sentence per tool call, in both languages |
| `js/summaries.js` | Replace | One-line result summary per tool |
| `js/guards.js` | Adapt | Sequence rules shared by the live tools and `js/runs_check.js` (b.4) |
| `js/facts.js` | Adapt | Same role as the Timetable Translator's fact audit: rule 4 of the brief, fact keys and placeholder rendering (c.4, c.6) |
| `js/simulation.js` | Adapt | Plays pre-runs on the same bus (a.2) |
| `js/sim_vars.js` | Adapt | `{{fact:key}}` from the engine at playback |
| `js/sim_check.js` | Replace | `js/runs_check.js`: the pre-run checks of section 8 of the brief, in Diagnostics and in `tools/check-runs.mjs` |
| `js/recorder.js` | Adapt | "Save run as simulation": a live run into the pre-run format, `"source": "recorded"` |
| `js/console.js` | Adapt | One plain sentence per tool call, details one click away; searches and fetches pulse in fjord as an outline |
| `js/controls.js` | Adapt | Start agent, model, ×1 ×2 ×4, status, Abort, Reset, Diagnostics |
| `js/dialogs.js` | Adapt | Mode and key dialogs (the key dialog refuses to work in a frame) |
| `js/intro.js` | Adapt | "How it works": the five steps and what the score is not |
| `js/ui.js` | Adapt | Orchestration; the language switch re-renders without a reload |
| `js/kpi.js` | Adapt | Four tiles: overall score (indicative), weakest critical link, evidence coverage, exclusive non-EU control |
| `js/ai_label.js` | Adapt | Texts through `t()` |
| `js/audit.js` | Adapt | Evidence checks, budgets, corrections, weight changes as assumptions |
| `js/audit_panel.js` | Adapt | Filters for evidence and person's steps |
| `js/run_facts.js` | Adapt | Model calls of 40, searches and fetches used, nudges, cost |
| `js/diagnostics.js` | Adapt | Rows: API (free models call; web search supported; web fetch cannot be pre-checked, I4), policy equals config, storage keys, data and pre-runs, languages; "Run all tests" |
| `js/diagnostics_view.js` | Adapt | Same view |
| `js/options_panel.js` | Replace | `js/levers_panel.js` |
| `js/payoff.js` | Adapt | What a chosen lever changes on the tiles and the map (a what-if, never the assessment) |
| `js/drafts.js` | Adapt | The memo: header, before and after figures and "Draft. Nothing is sent." added in code |
| `js/outbox.js` | Adapt | Memo and report drafts |
| `js/format.js` | Adapt | `Intl` in the active language (e.4) |
| `js/pop.js` | Adapt | Popover mechanics for cells, markers and evidence |
| `js/popovers.js` | Replace | Block, layer and evidence details |
| `js/world.js` | Replace | `js/catalogue.js` |
| `js/world_check.js` | Replace | `js/runs_check.js` |
| `js/sync.js` | Pattern | A pure engine with no model maths, as `js/engine.js` |
| `js/ops.js` | Drop | Timetable queries |
| `js/mirror.js`, `js/mirror_align.js`, `js/mirror_card.js`, `js/mirror_data.js`, `js/mirror_monitor.js`, `js/mirror_strip.js`, `js/align_data.js` | Drop | The timetable centrepiece; the strip's fallback pattern lives on in the honeycomb's strip mode |
| `css/align.css`, `css/mirror.css` | Drop | Same |
| `data/world.js`, `data/scenarios.js`, `data/reference_cases.js`, `data/sim_runs.js` | Replace | `data/catalogue.js`, `data/ref_facts.js`, `data/runs/*.js`, `data/schemas.js` |
| `tools/build_world.mjs` | Drop | No synthetic world |
| `tools/check_world.mjs` | Replace | `tools/check-runs.mjs` |
| `tests/run-all.mjs` | Adapt | The suites of g |
| `tests/README.md` | Adapt | Set-up and cases |
| `tests/lib/fake-claude.mjs` | Adapt | Extended with server tool blocks (g) |
| `tests/unit.mjs` | Adapt | Streaming client and cost maths kept; schema validator, formatting, URL normalisation |
| `tests/engine.mjs` | Replace | S1 to S4, class derivation, what-ifs |
| `tests/smoke.mjs`, `tests/sims.mjs`, `tests/live.mjs`, `tests/accept.mjs`, `tests/layout.mjs`, `tests/design.mjs` | Adapt | New flows, same harness |
| `tests/docs.mjs` | Adapt | This app's document set |
| `tests/hygiene.mjs` | Copy | Reads `HYGIENE_TERMS` |
| `tests/live_site.mjs` | Adapt | Plays one pre-run on the published site |
| `tests/remote_head.mjs` | Copy | Used by the live-site check |
| `tests/pitch.mjs` | Drop | The sister's own five-minute run; this app's timing is checked in `sims` and demonstrated by hand (AC-22) |

#### Rebate Hunter, Navigator and Repack Pilot files without a Timetable Translator twin

| Path | Verdict | Sovereignty Assessment |
|---|---|---|
| Rebate Hunter `js/similarity.js` | Adapt | Name matching for suggestions and `cat_lookup`, inside `js/catalogue.js` |
| Rebate Hunter `js/board_group.js` | Pattern | Pure geometry with label separation and a fit test, for the spider's labels |
| Rebate Hunter `js/board_portfolio.js` | Pattern | The portfolio view |
| Rebate Hunter `js/figures.js` | Pattern | Superseded by the Timetable Translator's fact audit |
| Rebate Hunter `js/board.js`, `js/board_data.js`, `js/board_pop.js`, `js/board_race.js`, `js/board_band.js` | Pattern | Board state, view model and the short-board fallback |
| Rebate Hunter `js/erp.js`, `js/rebate.js`, `js/opendata.js`, `js/source_health.js` | Drop | No ERP, no rebate maths, no client-side open data (the policy allows only api.anthropic.com) |
| Navigator `js/map.js`, `js/libs.js`, `vendor/leaflet-1.9.4/*` | Drop | No map library and no runtime library |
| Repack Pilot TECH_NOTES D71 | Pattern | How REVIEW.md lists each adapted shell module and its reason |

**New, without a sister twin:** `js/i18n/*`, `js/schema.js`, `js/classes.js`, `js/engine.js`, `js/evidence.js`, `js/api_messages.js`, `js/lang_switch.js`, `js/sovmap.js`, `js/spider.js`, `js/mix.js`, `js/honeycomb.js`, `js/datatable.js`, `js/blocks_panel.js`, `js/review_panel.js`, `js/method_panel.js`, `js/compare.js`, `js/portfolio.js`, `js/export.js`, `css/map.css`, `css/panels.css`, `research/`, `tests/i18n.mjs`, `tests/audit.mjs`, `tests/runs.mjs`, `tests/fixtures/`.

### Measured shell differences (a.5)

The brief says the sisters differ in details. Measured on 19 Nov 2026 against Rebate Hunter at the commits of 1.1, with app names and storage prefixes normalised as in the Timetable Translator's `tests/parity.mjs` (shared modules and tests character for character, the shell stylesheets as code, `vici/` byte for byte, plus the three imported files):

| Sister | Shell files that differ from Rebate Hunter's | Shell files missing |
|---|---|---|
| Timetable Translator | `js/events.js`, `js/icons.js`, `tests/lib/harness.mjs` | none |
| Navigator | `js/dom.js`, `js/events.js`, `js/icons.js`, `tests/lib/harness.mjs` | `js/clock.js`, `js/labels.js` |
| Repack Pilot | `css/components.css`, `css/console.css`, `css/style.css`, `js/anthropic.js`, `js/cost.js`, `js/dom.js`, `js/drawer.js`, `js/events.js`, `js/handover.js`, `js/icons.js`, `js/modal.js`, `js/progress.js`, `tests/lib/harness.mjs` | none |

The Timetable Translator differs only in the files that are its own by design; so it and Rebate Hunter are the right source, as the brief says. Navigator lacks two shell modules; Repack Pilot adapted ten shell files (its TECH_NOTES D71). `vici/` is identical in all four.

---

## b. Run events and agent tools

### b.1 Run-event types

The envelope stays the sister apps': `{ id, seq, type, ts, t, run_id, mode, payload }`. Inherited with the same role: `run_start` (adds `query`, `entry_id`, `lang`, and for a pre-run `source` and `as_of`), `state_change`, `narration` (adds `lang` and `audit: "passed" \| "unchecked"`), `reasoning`, `tool_call`, `tool_result`, `action_draft` and `action_decision` (the memo), `report` (adds `outcome` and `lang`), `cost_update` (adds `web_fetches`), `notice`, `attempt_discarded`, `run_end` (status `done`, `not_a_service`, `stopped`, `aborted` or `error`). Dropped: the Timetable Translator's `alert`, `mirror_update`, `kpi_update`, `options` and `option_decision`, whose jobs the events below take over.

| Event | Payload |
|---|---|
| `choice_request` / `choice_decision` | `{ request_id, question, candidates: [{ entry_id?, name, description }] }` / `{ request_id, chosen: index \| null, by: "user" }` |
| `profile_recorded` | `{ profile, evidence_checks }` |
| `research_step` | `{ kind: "search" \| "fetch", query?, url?, title?, results?: [{ url, title }], ok, error_code? }`, from the server tool blocks; replayed in Simulation |
| `evidence_check` | `{ subject: block_id \| "profile" \| layer, url, quote, verified, via: "fetched_text" \| "citation" \| "catalogue" \| "ref_facts" \| "recording", fields }` |
| `block_recorded` | `{ op: "add" \| "update" \| "remove", block }`, the block with `tech_class`, `operator_class`, `level`, `partly_unknown` and the fields that count as unknown, and why |
| `layer_status` | `{ layer, status: "no_evidence" \| "not_applicable", reason, evidence? }` |
| `score_update` | `{ facts: { key: value }, partial }`, after every block change and on `eng_score` |
| `review_request` / `review_decision` | `{ request_id, summary, block_ids }` / `{ request_id, action: "confirm" \| "skip" \| "correct", block_id?, changes?, reason?, by: "user" }` |
| `levers` | `{ options_seq, levers: [{ lever_id, title, rationale, changes, evidence, whatif: { facts } }], keep: { facts } }` |
| `lever_decision` | `{ options_seq, lever_id: "L1" \| "L2" \| "L3" \| "keep", by: "user" }` |
| `budget_update` | `{ model_calls: { used, cap }, searches: { used, per_turn_cap }, fetches: { used, per_turn_cap }, nudges }` |
| `weights_change` | `{ from, to, by: "user" }`, logged as an assumption |

**Run states and the rail.** idle → understanding → (awaiting_choice) → researching → scoring → awaiting_review → recommending → awaiting_decision → drafting → done (or stopped, aborted, error). Rail: Understand (understanding, awaiting_choice) · Research · Score · Your review (awaiting_review) · Recommend (recommending, awaiting_decision, drafting). The rail step that waits for a person turns merlot.

### b.2 Model calls and budgets

A planning estimate for a Live run, not a measurement; AC-21 measures the first runs and TECH_NOTES records them.

| Step | What the agent does | Model calls | Searches | Fetches |
|---|---|---:|---:|---:|
| Understand | `cat_lookup`, `ui_progress`, maybe `ui_choose_service`, `rec_profile` | 3–4 | 1–2 | 1 |
| Research | per layer: search or fetch, the cited sentence where needed, `rec_block` (several in parallel), `rec_layer` | 14–20 | up to 10 | up to 8 |
| Score | `eng_score` | 1 | | |
| Your review | `ui_request_review`; corrections recompute in code | 1–2 | | |
| Recommend | `eng_whatif` up to three times, `ui_propose_levers`, `ui_draft_memo`, `ui_final_report` | 4–6 | 0–2 | 0–1 |
| **Total** | | **≈ 23–33 of 40** | **12 per turn** | **10 per turn** |

A run that only calls tools is one turn, so `max_uses` caps the whole run until a nudge starts a new turn. Code counts searches and fetches from the response blocks across the run, shows them in the run facts, and each nudge (at most two) tells the agent what is left of each budget. The €3 cap stays the hard stop. `max_content_tokens` does not shorten PDFs, so the prompt asks for HTML pages and allows a PDF only when no HTML page carries the fact.

### b.3 Tool schemas

Fifteen client tools and two server tools. The schemas are composed in `js/tools.js` from shared parts, so the definitions sent to the API hold no `$ref`. `js/schema.js` validates every call; a failure returns `is_error: true` with an instructive message. `strict` is not sent (P5). Block ids are assigned by code (`B-01`, `B-02`, …) and returned to the agent; the stored block has the shape of section 10 of the brief.

```js
const COUNTRY = { "type": "string", "pattern": "^([A-Z]{2}|UNKNOWN)$" };
const PARTY = { "type": "object", "additionalProperties": false, "required": ["name", "country"],
  "properties": { "name": { "type": "string" }, "country": COUNTRY,
    "parent": { "anyOf": [{ "type": "null" }, { "type": "object", "additionalProperties": false,
      "required": ["name", "country"], "properties": { "name": { "type": "string" }, "country": COUNTRY } }] } } };
const EVIDENCE = (fields) => ({ "type": "array", "minItems": 1, "items": { "type": "object", "additionalProperties": false,
  "required": ["url", "title", "lang", "supports"],
  "properties": { "url": { "type": "string" }, "title": { "type": "string" },
    "quote": { "type": "string", "maxLength": 150 },   // omitted: code takes the quote from this run's citation of the URL
    "lang": { "type": "string", "pattern": "^[a-z]{2}$" },
    "supports": { "type": "array", "minItems": 1, "items": { "type": "string", "enum": fields } } } } });
const LAYER = { "type": "string", "enum": ["infrastructure", "devsecops", "platform", "base_service", "applications", "access"] };
const BLOCK_FIELDS = ["tech", "tech.parent", "operator", "operator.parent", "hosting", "licence", "exit"];
const CLASS = { "type": "string", "enum": ["DE", "EU", "US", "CN", "OTHER", "UNKNOWN"] };
const CHANGES = { "type": "array", "minItems": 1, "items": { "type": "object", "additionalProperties": false, "required": ["block_id"],
  "properties": { "block_id": { "type": "string", "pattern": "^B-\\d{2}$" }, "made_in": CLASS, "run_by": CLASS,
    "hosting": { "type": "string", "enum": ["EU", "NON_EU", "UNKNOWN"] }, "licence": { "type": "string", "enum": ["open_source", "proprietary", "unknown"] } } } };
const BLOCK = { "layer": LAYER, "name": { "type": "string" }, "role": { "type": "string" }, "note": { "type": "string" },
  "criticality": { "type": "string", "enum": ["critical", "important", "supporting"] }, "tech": PARTY, "operator": PARTY,
  "hosting": { "type": "string", "enum": ["EU", "NON_EU", "UNKNOWN"] }, "licence": { "type": "string", "enum": ["open_source", "proprietary", "unknown"] },
  "exit": { "type": "string", "enum": ["easy", "possible", "hard", "unknown"] }, "confidence": { "type": "string", "enum": ["high", "medium", "low"] } };

export const CLIENT_TOOLS = [
  { "name": "cat_lookup", "description": "Find the service in the bundled catalogue by name or alias. Returns up to five entries with id, names in both languages, category, status note and verified starting URLs; those URLs become fetchable. An empty list means the service is not in the catalogue: research it from the web.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["query"], "properties": { "query": { "type": "string" } } } },
  { "name": "ref_facts", "description": "Bundled structural facts verified at build time, each with URL, title, verbatim quote and the fields it supports, for example how iOS and Android apps are distributed and how they receive push messages.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["topic"], "properties": { "topic": { "type": "string", "enum": ["app_distribution", "push_messaging", "mobile_os", "browsers", "federal_it"] } } } },
  { "name": "rec_profile", "description": "Record the service profile: names, category, what it does, how it works, owner, operator, status, legal basis and sources. Write in the run's language; figures only as placeholders.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["names", "category", "what", "how", "owner", "operator", "status", "evidence"],
      "properties": { "names": { "type": "array", "minItems": 1, "items": { "type": "string" } }, "category": { "type": "string", "enum": ["base_service", "platform_or_access"] },
        "what": { "type": "string" }, "how": { "type": "string" }, "owner": PARTY, "operator": PARTY, "status": { "type": "string" },
        "legal_basis": { "type": "string" }, "governance": { "type": "string" }, "evidence": EVIDENCE(["what", "how", "owner", "operator", "status", "legal_basis", "governance"]) } } },
  { "name": "rec_block", "description": "Record one building block with its evidence. Code checks each URL's provenance and each quote, derives Made in and Run by, and computes the level; a field without a verified quote counts as unknown. Returns the block id and what counted.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["layer", "name", "role", "criticality", "tech", "operator", "hosting", "licence", "exit", "evidence", "confidence"],
      "properties": { ...BLOCK, "evidence": EVIDENCE(BLOCK_FIELDS) } } },
  { "name": "rec_block_update", "description": "Change fields of a recorded block, with new evidence where a field needs it and a one-line reason.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["block_id", "changes", "reason"],
      "properties": { "block_id": { "type": "string", "pattern": "^B-\\d{2}$" }, "changes": { "type": "object", "additionalProperties": false, "properties": BLOCK },
        "evidence": EVIDENCE(BLOCK_FIELDS), "reason": { "type": "string" } } } },
  { "name": "rec_block_remove", "description": "Remove a recorded block, with a one-line reason.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["block_id", "reason"], "properties": { "block_id": { "type": "string", "pattern": "^B-\\d{2}$" }, "reason": { "type": "string" } } } },
  { "name": "rec_layer", "description": "Mark a layer 'not applicable' (with a source saying why) or 'no evidence found', with a short reason.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["layer", "status", "reason"],
      "properties": { "layer": LAYER, "status": { "type": "string", "enum": ["not_applicable", "no_evidence"] }, "reason": { "type": "string" }, "evidence": EVIDENCE(["not_applicable"]) } } },
  { "name": "eng_score", "description": "The engine's scores for the current blocks: layer scores, overall score, weakest critical link, evidence coverage, exclusive non-EU control and the Made-in and Run-by counts, each with its fact key and display value.",
    "input_schema": { "type": "object", "additionalProperties": false, "properties": {} } },
  { "name": "eng_whatif", "description": "Apply one lever's changes (Made-in class, Run-by class, hosting or licence of named blocks; never a company) to a copy of the blocks and return its figures as fact keys. The assessment does not change.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["lever_id", "changes"], "properties": { "lever_id": { "type": "string", "enum": ["L1", "L2", "L3"] }, "changes": CHANGES } } },
  { "name": "ui_progress", "description": "One short sentence of narration for the console, in the run's language. Audited: figures only as placeholders.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["text"], "properties": { "text": { "type": "string" } } } },
  { "name": "ui_choose_service", "description": "Show up to five candidates for an ambiguous name and wait for the person's choice.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["question", "candidates"],
      "properties": { "question": { "type": "string" }, "candidates": { "type": "array", "minItems": 2, "maxItems": 5, "items": { "type": "object", "additionalProperties": false, "required": ["name", "description"],
        "properties": { "entry_id": { "type": "string" }, "name": { "type": "string" }, "description": { "type": "string" } } } } } } },
  { "name": "ui_request_review", "description": "Hand the findings to the person and wait until they confirm, correct (each correction with a reason) or skip. Returns what they did.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["summary"], "properties": { "summary": { "type": "string" }, "focus": { "type": "array", "items": { "type": "string", "pattern": "^B-\\d{2}$" } } } } },
  { "name": "ui_propose_levers", "description": "Propose up to three levers, each a set of block changes with a rationale and evidence that such an alternative exists; 'Keep as is' is added in code. The engine prices each; waits for the person's choice.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["levers"],
      "properties": { "levers": { "type": "array", "minItems": 1, "maxItems": 3, "items": { "type": "object", "additionalProperties": false, "required": ["lever_id", "title", "rationale", "changes", "evidence"],
        "properties": { "lever_id": { "type": "string", "enum": ["L1", "L2", "L3"] }, "title": { "type": "string" }, "rationale": { "type": "string" }, "changes": CHANGES, "evidence": EVIDENCE(["alternative"]) } } } } } },
  { "name": "ui_draft_memo", "description": "Draft the memo for the chosen lever (or for keeping things as they are). Audited; code adds the header, the before and after figures and 'Draft. Nothing is sent.'",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["lever_id", "subject", "body"],
      "properties": { "lever_id": { "type": "string", "enum": ["L1", "L2", "L3", "keep"] }, "subject": { "type": "string" }, "body": { "type": "string" } } } },
  { "name": "ui_final_report", "description": "End the run with its outcome and the report in Markdown, figures only as placeholders.",
    "input_schema": { "type": "object", "additionalProperties": false, "required": ["outcome", "markdown"],
      "properties": { "outcome": { "type": "string", "enum": ["assessed", "not_a_service", "stopped"] }, "markdown": { "type": "string" } } } }
];

export const SERVER_TOOLS = [
  { "type": "web_search_20250305", "name": "web_search", "max_uses": 12, "user_location": { "type": "approximate", "country": "DE", "timezone": "Europe/Berlin" } },
  { "type": "web_fetch_20250910", "name": "web_fetch", "max_uses": 10, "max_content_tokens": 8000, "citations": { "enabled": true } }
];
```

Within the strict limits if `strict` is ever turned on: fifteen tools; union-typed parameters are only the `parent` fields. The length and pattern keywords would then move into code alone, as P5 requires.

### b.4 The rules in code

| Rule (section 7 of the brief) | Enforced by |
|---|---|
| 1 Data is never an instruction | The system prompt; tool results wrap page text as data; no tool can change the method, the weights or the budgets |
| 2 Research every layer; evidence first | `rec_block` refuses a block without evidence; `eng_score` reports layers with neither blocks nor a `rec_layer` status, and `ui_request_review` is refused until each layer has one or the other |
| 3 No figure written by the model | `js/facts.js`: placeholders `{{fact:key}}` with keys the engine returned; unknown keys refused (F13) |
| 4 Fact audit | `js/facts.js` on every audited field (c.6); two failed retries, then the text shows with an "Unchecked" tag and a console line |
| 5 Ask only through the three `ui_*` tools; no outcome before it | `js/guards.js`: `ui_draft_memo` refused before a `lever_decision`; `ui_final_report` with `assessed` refused before the review and the lever choice are resolved; the outcome must follow them |
| 6 Server tools | `js/agent.js`: `pause_turn` resent unchanged; a mixed turn answered with `tool_result` blocks only; every assistant block echoed unchanged (encrypted content, citations, thinking); in-result errors read from 200 responses; a 400 for a disabled tool stops Live and offers Simulation |
| 7 Input check | Prompt plus `cat_lookup`; `not_a_service` ends without blocks |
| 8 Budgets | Fixed `tools` array for the whole run (a test compares every request's array with the first); counts across turns; at most two nudges with what is left |
| 9 Cost | The meter (usage × price + searches × $0.01, at 0.894 EUR per USD); first measured runs recorded in TECH_NOTES |

---

## c. Engine

`js/classes.js` and `js/engine.js` are pure functions of the blocks, the weights and the evidence results, shared by the browser, the Node tests and `tools/check-runs.mjs`. They compute at full precision and round only for display.

### c.1 Origin classes

`classOf(country)`: `DE`; `EU` for the other 26 member states (AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE); `US`; `CN` for CN, HK and MO; `OTHER` for every other ISO 3166-1 alpha-2 code; `UNKNOWN` when no country is evidenced. A party with a recorded parent counts by the parent's country, so a German subsidiary of a US company is `US`. A German public body or public IT provider is recorded with country `DE`. An open-source project without an identifiable steward is recorded with country `UNKNOWN`. Made in is the technology provider's class, Run by the operator's.

### c.2 Levels

Before the levels, `js/evidence.js` replaces every field without a verified quote by its unknown (d.4).

```
techLevel(madeIn, licence) = madeIn in {DE, EU} ? 4 : madeIn in {US, CN, OTHER} ? (licence = open_source ? 3 : 2) : none
opLevel(runBy, hosting)    = runBy in {DE, EU} ? 4 : runBy in {US, CN, OTHER} ? (hosting = EU ? 1 : 0) : none
blockLevel                 = both none → unscored (a gap); exactly one none → min(the other, 2), "partly unknown"; else min(tech, op)
```

### c.3 Scores

Weights by criticality: critical 3, important 2, supporting 1. Layer score: 25 × the weighted mean level of the layer's scored blocks; a layer without scored blocks has no score ("no evidence found", or "not applicable" with a source), is drawn as a dashed axis and stays out of the overall score. Overall: the mean of the existing layer scores, equal weights by default; weights changed in the method panel are logged as assumptions. Weakest critical link: the lowest level among scored critical blocks; on a tie the first in layer order, then by block id, and the tile adds how many more share that level. Evidence coverage: the weight of scored blocks over the weight of all blocks. Exclusive non-EU control: the share of scored critical blocks at level 0 or 1. Made in and Run by: counts per class, for all blocks and for critical blocks. Lever what-if: the same computation on a copy with the lever's changes. Portfolio: per category, pooled over the scored critical blocks (I11), the Made-in mix and the overall scores; the self-assessment's category stays out. No data is not zero: a figure without a basis shows "no data" and is never counted as 0.

### c.4 Fact keys and display

`score.overall`, `score.layer.<layer>`, `seal.<block id>`, `weakest.block`, `weakest.level`, `weakest.ties`, `coverage`, `share.exclusive_non_eu`, `count.made_in.<class>`, `count.made_in.critical.<class>`, `count.run_by.<class>`, `whatif.<lever>.overall`, `whatif.<lever>.delta`, `whatif.<lever>.weakest`, `whatif.<lever>.exclusive_non_eu`, `portfolio.<category>.exclusive_non_eu`. Code renders each in the run's language with `Intl.NumberFormat`: scores with `maximumFractionDigits: 0`; shares with `style: "percent"` and no decimals ("92%", "92 %"); changes with `signDisplay: "exceptZero"` ("+9"). Tests compare raw values with the exact fractions to within 1e-9 and display strings after replacing non-breaking spaces with spaces.

### c.5 Golden cases S1 to S4, recomputed in Phase 0

A scratch recomputation with exact fractions (BigInt numerator and denominator) from the brief's input tables alone matches every expected value and every English and German display string: 84 of 84 checks. A negative control (B-02 changed from supporting to important) fails as it should. M1 writes these into `tests/fixtures/` before the engine.

| Case | Exact | English | German |
|---|---|---|---|
| S1 R01 to R13 | 4, 3, 2, 1, 0, 3, 2 (partly unknown), 2 (partly unknown), unscored, 1, 3, 0, 0 (partly unknown) | | |
| S2 layer infrastructure | 175/4 | 44 | 44 |
| S2 layer devsecops | 100 | 100 | 100 |
| S2 layer platform | 65 | 65 | 65 |
| S2 layer base_service | 100 | 100 | 100 |
| S2 layer applications | 375/4 | 94 | 94 |
| S2 layer access | 30 | 30 | 30 |
| S2 overall | 865/12 | 72 | 72 |
| S2 evidence coverage | 23/25 | 92% | 92 % |
| S2 exclusive non-EU control | 2/5 | 40% | 40 % |
| S2 other | weakest critical link B-10 at level 0; B-04 unscored; B-06 partly unknown; Made in, all: DE 3, EU 1, US 4, CN 1, OTHER 0, UNKNOWN 2; critical: DE 1, EU 1, US 3; Run by, all: DE 8, US 2, UNKNOWN 1 | | |
| S3 L1 overall and change | 1955/24 and 75/8; B-10 at level 0; exclusive 1/5 | 81 and +9 | 81 and +9 |
| S3 L2 overall and change | 925/12 and 5; B-01 at level 1; exclusive 1/5 | 77 and +5 | 77 and +5 |
| S3 the assessment after both | unchanged | | |
| S4 base services, platforms | 1/3, 2/3 | 33%, 67% | 33 %, 67 % |

### c.6 The fact audit (rule 4)

`js/facts.js` normalises whitespace (non-breaking spaces included), then in this order: resolves placeholders (an unknown key is an error); masks quoted text that appears verbatim in the run's evidence („…“, “…”, "…", »…«, ‚…‘); masks ISO dates, block ids and lever ids; masks legal references (§ or Art. with its number) found in the evidence; reports blocked words and fractions once each, as written (`SEAL-1`, `Two thirds`, `Prozent`, `Viertel`, `half` unless followed by a hyphen; whole words, case ignored; "a third party", "third-country", "once a quarter", "quarterly" and "vierteljährlich" pass); then reports every remaining number token (digits with "." or "," between digits and letters joined to it) unless it is a name as the evidence writes it ("C5", "Microsoft 365", "ISO 27001"). The run's evidence is the catalogue entry, the titles of the search results and pages the run read, and the quotes of its recorded evidence.

A throwaway spike of exactly this order passes all 29 cases with the expected tokens, and both non-breaking-space variants of F21 and F22: 31 of 31. Beyond the brief's cases it showed the gaps of I8: number words pass, German compounds such as "Zweidrittelmehrheit" pass, and a year from the evidence written outside a quote is blocked. D9 and D10 close them; `tests/audit.mjs` adds those cases to F01 to F29.

---

## d. Evidence verification

### d.1 Provenance

An evidence URL counts only if this run's `web_search` results or `web_fetch` results returned it, or `cat_lookup` or `ref_facts` listed it. URLs are compared after normalisation (lower-case scheme and host, fragment removed). Anything else is refused with `is_error: true` and the list of URLs the run may use (AC-09). Recordings and exports store URL, title and quote, never a page's text.

### d.2 Quotes

A quote is verified when, with whitespace normalised, it occurs in the text of the page at its URL as fetched in this run, or in the `cited_text` of a citation of that URL in this run. Search citations carry their URL; fetched-document citations are mapped to their URL through the document registry (I2). Quotes longer than 150 characters are refused.

### d.3 PDFs and search results

Fetched PDFs arrive base64-encoded and search results encrypted, so their quotes verify only through citations: before recording a block from such a source, the agent writes one short sentence that cites it, and code takes the quote from that citation (an evidence item without `quote` asks for exactly that). The sentence shows only behind Details in the console. The prompt prefers HTML pages and asks the agent to fetch before it records. If citations go missing on Sonnet 5.5 or Opus 5.5 (I3), D11 applies.

### d.4 Fields without a verified quote

Each evidence record names the fields it supports. A field without a verified quote counts as unknown for scoring, and the block says why: Made in becomes `UNKNOWN` when `tech` or a recorded `tech.parent` lacks one, Run by likewise with `operator` and `operator.parent`, the hosting region becomes `UNKNOWN`, the licence `unknown`, the exit path `unknown`. Nothing is inferred from general knowledge; an unknown is shown as unknown and never as a finding against a provider.

### d.5 Catalogue, reference facts and pre-runs

The catalogue's starting URLs and the reference facts' quotes are verified when I build them (M1) and listed in DATA_SOURCES with dates. Hand-authored pre-runs keep every quote in `research/<entry>.md` with URL, title and date read; `tools/check-runs.mjs` sets each quote's `verified` flag from there and fails on the conditions of section 8 of the brief. In Simulation the flag comes from the recording. A pre-run older than 90 days shows "Check for updates".

### d.6 Corrections and the report

A correction in the review needs a reason, not evidence; the block is marked "corrected by reviewer", and the report lists every correction apart from the agent's findings. The report writes neutrally ("According to …, … is operated by …"), names categories in levers and never ranks vendors.

### d.7 Where it is tested

`tests/unit.mjs` (normalisation, registry mapping on recorded block shapes), `tests/live.mjs` (a quote absent from fetched text and citations leaves its fields unknown and marks the block; an unreturned URL is refused: AC-09), `tests/runs.mjs` (every pre-run under section 8: AC-12), and the live run in AC-21.

### d.8 Evidence base of the six M2 pre-runs

Searched and read on 19 November 2026 with this session's web search and web fetch; nothing from memory. The research log behind this table (title, read date and the quotes seen) stays outside the repository until M2 checks every quote on its page and moves it to `research/`. No scoring yet: the third column says which block and which fields a source would support.

#### BundID

| Layer | Public sources | Blocks they would support |
|---|---|---|
| `infrastructure` | [Sachsen-Anhalt, OZG-Sprechstunde, 2023](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/39._Wechsel_zur_BundID.pdf); [BundID, OZG-Erfahrungsaustausch](https://www.fitko.de/fileadmin/fitko/veranstaltungen/ozg-erfahrungsaustausch-22/BundID_OZG-Erfahrungsaustausch.pdf); [Sachsen-Anhalt, authentication options, 2023](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/32.Authentifizierungsvarianten_bei_der_Nutzung_von_Online-Diensten.pdf) | Hosting and connection at the ITZBund (operator, hosting); connection through the Netze des Bundes |
| `devsecops` | [Kommune21, 2023](https://www.kommune21.de/meldung_41129_Go-Live+des+optimierten+Bund-Nutzerkontos.pdf); [SVA reference](https://www.sva.de/sites/default/files/2021-11/SVA%20Referenz%20ITZBund.pdf) | The account software from the AKDB (tech); the container platform provided by the ITZBund with SVA and ARWINET on the ministry's behalf (operator) |
| `platform` | [SVA reference](https://www.sva.de/sites/default/files/2021-11/SVA%20Referenz%20ITZBund.pdf) | A Kubernetes platform at the ITZBund that runs Nutzerkonto Bund (operator; the platform software's licence is not stated) |
| `base_service` | [Bundesagentur für Arbeit](https://www.arbeitsagentur.de/bundid); [hib 325/2026](https://www.bundestag.de/presse/hib/kurzmeldungen-1166970); [IT-Planungsrat 2026/19](https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_19_Verwaltungsanbindung_EUDI-Wallet_Pr%C3%A4sentation.pdf); [FIT-AB, May 2026](https://docs.fitko.de/fit/assets/pdf/fit-ab_dokumente/31sitzung/260519_FIT-AB_Verwaltungsanbindung%20EUDI-Wallet_s.pdf) | Sign-in means: Online-Ausweis, ELSTER certificate, EU identities; the Zentrales Bürgerpostfach inside the BundID; the EUDI wallet from January 2027 |
| `applications` | [AKDB press release, 2023](https://www.akdb.de/fileadmin/newsroom/pm/Pressemeldung_AKDB_OK_KOMM_Service_15_03_2023.pdf); [BMDS invitation, May 2026](https://www.landkreistag.de/images/Anlage.pdf); [heise](https://heise.de/-10237228) | The account as the federal identity provider (tech from the AKDB); owner now the BMDS; the planned DeutschlandID |
| `access` | [Bundesagentur für Arbeit](https://www.arbeitsagentur.de/bundid); [Einführung BundID](https://events.academiccloud.de/event/144/attachments/150/267/Einfuehrung-BundID.pdf) | Browser redirect to id.bund.de; the AusweisApp on a computer and a smartphone, or a card reader (the app's distribution: see Online-Ausweis) |

#### Online-Ausweis

| Layer | Public sources | Blocks they would support |
|---|---|---|
| `infrastructure` | No public source found for where the central eID background systems (the authorisation-certificate system and the revocation service) are hosted | A gap; eID servers sit with each provider (platform) |
| `devsecops` | [AusweisApp, about us](https://www.ausweisapp.bund.de/en/about-us); [BSI certificate for AusweisApp 2.5.0](https://www.ausweisapp.bund.de/fileadmin/user_upload/BSI-Zertifikat-2.5.0.pdf) | The AusweisApp developed by Governikus on behalf of the BSI since 2014 (tech); its conformity to BSI TR-03124 confirmed by the BSI |
| `platform` | [eID server](https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-server/eid-server-node.html); [eID service](https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-service/eid-service-node.html); [netzpolitik.org, 2026](https://netzpolitik.org/2026/online-ausweis-der-eperso-ist-tot-lange-lebe-der-eperso/) | eID servers run by the service provider or a commissioned eID service provider (operator, per relying service); no eID server implementation under an open-source licence (licence) |
| `base_service` | [Vergabestelle für Berechtigungszertifikate](https://www.bva.bund.de/DE/Services/Behoerden/Produkt/PA-VfB/pa-vfb_node.html); [D-Trust BerCA product sheet](https://www.d-trust.net/files/dokumente/pdf/produktblatt_berechtigungszertifikate.pdf) | Authorisation certificates: granted by the Bundesverwaltungsamt, issued through a certificate system with revocation management |
| `applications` | [AusweisApp as open source](https://www.ausweisapp.bund.de/en/open-source) | The AusweisApp under the EUPL, its source on GitHub (licence) |
| `access` | [Download page](https://www.ausweisapp.bund.de/en/download); [App Store listing](https://apps.apple.com/us/app/id948660805); [BSI questions and answers, via Stadt Düren](https://onlinedienste.dueren.de/suche/-/vr-bis-detail/dokument/12224/download); [BT-Drs. 20/13075](https://dserver.bundestag.de/btd/20/130/2013075.pdf) | The app on Android, iOS, macOS, Windows and ChromeOS; iOS distribution through Apple's App Store (with the reference facts); the card produced by the Bundesdruckerei in Berlin; no phone-only credential since the Smart-eID stopped at the end of 2023 |

#### FIT-Connect

| Layer | Public sources | Blocks they would support |
|---|---|---|
| `infrastructure` | [FIT-Connect FAQ, "Wer hostet FIT-Connect?"](https://docs.fitko.de/fit-connect/docs/faq/) | Two data centres: Global Access (authentication server, Self-Service-Portal, OAuth server) and Dataport (the Zustelldienst, operated by IT.Niedersachsen) |
| `devsecops` | [FIT-Connect, introduction](https://docs.fitko.de/fit-connect/docs/intro/); [FITKO slides, Nov 2024](https://fitko.de/fileadmin/fitko/veranstaltungen/die_fitko_stellt_vor/20241112_FSV_FIT_Connect_Praesentation.pdf); [Java SDK on git.fitko.de](https://git.fitko.de/fit-connect/sdk-java/-/tree/31162bda5eb1da8dbe05950d897c6e80dcba1617) | Developed and run by the FITKO on behalf of the IT-Planungsrat (tech, operator); code on the FITKO's GitLab under the EUPL (licence) |
| `platform` | [Terms of use v1.2.0](https://docs.fitko.de/fit-connect/assets/files/20241230_FIT-Connect_Nutzungsbedingungen_v1.2.0-ea9a06df9227dc6eed9d398318165dfb.pdf); [Technical final report, 2022](https://www.IT-Planungsrat.de/fileadmin/beschluesse/2022/Beschluss2022-32_FIT-Connect_AL2_Technischer-Abschlussbericht.pdf) | The Submission API implemented by the Zustelldienst; the routing service; a DVDV microservice |
| `base_service` | [IT-Planungsrat slides, 2022](https://www.it-planungsrat.de/fileadmin/beschluesse/2022/Beschluss2022-32_FIT-Connect_AL4_Folien.pdf); [Sachsen-Anhalt connection guide V1.7](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Themenfeld_Bildung/Dokumente_zur_Mitnutzung/OZG_ST_Anbindungsleitfaden_V1.7.pdf); [FITKO slides, Nov 2025](https://www.fitko.de/fileadmin/fitko/veranstaltungen/die_fitko_stellt_vor/2025_FITKOstelltvor_FIT-Connect..pdf) | Re-used base services: DVDV, PVOG, FIM, Governikus components and the administration PKI (DOI certificates to encrypt applications); the Zentrales Bürgerpostfach |
| `applications` | [FITKO press release, May 2022](https://www.fitko.de/fileadmin/fitko/aktuelles_pressemitteilungen/PM_FIT-Connect_Live-Betrieb_gestartet.pdf) | FIT-Connect itself, live since 2 May 2022 |
| `access` | [FIT-Connect one-pager](https://docs.fitko.de/fit-connect/assets/files/FITConnect_Onepager-1a613eda6435943cc90f0b214bc7321f.pdf); [Maven Central](https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client); [FIT-Connect FAQ](https://docs.fitko.de/fit-connect/docs/faq/) | Java and .NET SDKs on Maven Central and NuGet (EUPL-1.2, FITKO); the Self-Service-Portal in the browser |

#### ePayBL

| Layer | Public sources | Blocks they would support |
|---|---|---|
| `infrastructure` | [Sachsen-Anhalt, OZG-Sprechstunde, Sep 2023](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf); [NRW, Standardisierung ePayment](https://www.mhkbd.nrw/system/files/media/document/file/standardisierung_epayment_v1_0.pdf); [Sachsen-Anhalt, ePayment, 2022](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Themenfeld_Bildung/ePayment_in_der_oeffentlichen_Verwaltung.pdf) | Länder instances run by Dataport or SID; a central instance in North Rhine-Westphalia. The federal instance's operator: not found |
| `devsecops` | [Sächsische Staatskanzlei, 2024](https://medienservice.sachsen.de/medien/news/1079912/download_pdf); [ORH Bayern, 2022](https://orh.bayern.de/mam/aktuelles/medieninformationen/aktuell/22-47_-_elektronische_zahlungsabwicklung_in_der_staatsverwaltung.pdf); [SID, Sep 2025](https://www.sid.sachsen.de/download/SID_Kundenforum_2025_ORANGE_ePayBL.pdf); [Connector handbook](https://www.mhkbd.nrw/system/files/media/document/file/integrationshandbuch-epaybl-konnektor.pdf) | A developer community of the Bund and eleven Länder with its office in Saxony; the SID holds the process responsibility; a connector by DResearch (tech of a component) |
| `platform` | [SID, Sep 2025](https://www.sid.sachsen.de/download/SID_Kundenforum_2025_ORANGE_ePayBL.pdf); [TED 482883-2026](https://ted.europa.eu/en/notice/482883-2026/pdf); [Sachsen-Anhalt, Jun 2026](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf) | Versions 2.x and 3.x in operation, 4.x a new development; migration to ePayBL 4 under way; the developer of 4.x is not named |
| `base_service` | [AKDB e-payment guide](https://www.akdb.de/fileadmin/loesungen/E-Payment-Leitfaden_der_AKDB.pdf); [Sachsen-Anhalt, Jun 2026](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf); [Sachsen-Anhalt, Sep 2023](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf) | Payment service providers and schemes: S-Public Services with cards, direct debit and PayPal; PayPal and credit cards in Sachsen-Anhalt; Wero through ePayBL 4; earlier Mastercard, VISA and Giropay |
| `applications` | [Sächsische Staatskanzlei, 2024](https://medienservice.sachsen.de/medien/news/1079912/download_pdf); [TED 482883-2026](https://ted.europa.eu/en/notice/482883-2026/pdf) | ePayBL as the application for paying administrative fees online; the registered name »ePayBL« |
| `access` | [NRW, Standardisierung ePayment](https://www.mhkbd.nrw/system/files/media/document/file/standardisierung_epayment_v1_0.pdf) | The ePayBL paypage in the citizen's browser |

#### Bundesportal

| Layer | Public sources | Blocks they would support |
|---|---|---|
| `infrastructure` | [Tagesspiegel Background, beta launch](https://background.tagesspiegel.de/digitalisierung-und-ki/briefing/beta-bund-de-innenministerium-schaltet-buergerportal-frei) | Hosting at the ITZBund (said at the beta launch; a current statement is still to be found) |
| `devsecops` | [Tagesspiegel Background, beta launch](https://background.tagesspiegel.de/digitalisierung-und-ki/briefing/beta-bund-de-innenministerium-schaltet-buergerportal-frei); [ITZBund annual report 2018](https://epflicht.ulb.uni-bonn.de/download/pdf/713875) | Developed by the Federal Ministry of the Interior with the agency Init; the ITZBund contributed to the beta |
| `platform` | No public source found for the portal's current software platform | A gap |
| `base_service` | [§ 9a EGovG](https://www.gesetze-im-internet.de/egovg/__9a.html); [BMDS slides, Mar 2026](https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf) | Identity proof through a user account (BundID, the EUDI wallet planned) and payment procedures as the portal's basic functions; the legal basis |
| `applications` | [What is the Federal Portal?](https://verwaltung.bund.de/portal/EN/ueber); [BMDS slides, Mar 2026](https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf); [BMDS Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | The portal as the central point of access; to become the DeutschlandPortal; part of the federal administration platform with the D-APP |
| `access` | [What is the Federal Portal?](https://verwaltung.bund.de/portal/EN/ueber) | The web portal in the browser |

#### Deutschland-App

| Layer | Public sources | Blocks they would support |
|---|---|---|
| `infrastructure` | [stock3, Apr 2026](https://stock3.com/news/sap-und-telekom-sollen-die-buerger-app-bauen-17008647); [heise](https://heise.de/-11247830) | Cloud data centres and operation by T-Systems (press, citing an internal project document and a business daily) |
| `devsecops` | [hib 786/2026](https://www.bundestag.de/1223070); [netzpolitik.org, Oct 2026](https://netzpolitik.org/2026/verwaltungsdigitalisierung-vieles-unklar-bei-der-deutschland-app/) | T-Systems International GmbH as general contractor, choosing and steering its subcontractors; the government's answer names no roles for SAP or Schwarz Digits |
| `platform` | [stock3, Apr 2026](https://stock3.com/news/sap-und-telekom-sollen-die-buerger-app-bauen-17008647) | SAP's Business Technology Platform and AI agents (press) |
| `base_service` | [stock3, Apr 2026](https://stock3.com/news/sap-und-telekom-sollen-die-buerger-app-bauen-17008647); [heise](https://heise.de/-11247830); [BMDS slides, Mar 2026](https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf); [BT-Drs. 21/8030](https://dserver.bundestag.de/btd/21/080/2108030.pdf) | The open-source messenger Wire, integrated by Schwarz Digits, as the channel to authorities; authentication through the EUDI wallet or the BundID on the federal platform |
| `applications` | [hib 786/2026](https://www.bundestag.de/1223070); [Wiesbaden, pilot municipality](https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app) | One prototype tested in six Kommunen; use cases include child benefit and housing allowance |
| `access` | [Wiesbaden, pilot municipality](https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app) | Not in the app stores during the pilot; test access limited to the pilot municipalities |

**What this means for M2.** Each of the six pre-runs can record blocks with evidence in at least five layers. Expect partly unknown blocks where hosting or licence is not stated, a dashed infrastructure axis for the Online-Ausweis and a dashed platform axis for the Bundesportal unless M2 finds more. The Deutschland-App's pre-run will lean on press and one parliamentary answer and say so; its as-of date matters most. The BundID and FIT-Connect pre-runs are the strongest candidates for the five-minute demo.

---

## e. Two languages

### e.1 Mechanism

`js/i18n/en.js` and `js/i18n/de.js` export flat dictionaries with identical keys; `js/i18n/index.js` exports `t(key, vars)`, `getLang()`, `setLang(lang)`, `onLang(fn)` and the active `Intl` formatters. The choice: `?lang=de` or `?lang=en` in the URL wins and becomes the stored choice; otherwise local storage `sa.lang`; otherwise English, whatever the browser's language. `<html lang>` and the document title follow. The switch in the header is two toggle buttons with `aria-pressed`, drawn as Vici's segmented control. A change re-renders every view's text through `onLang` without a reload: the run, the console history and open dialogs stay. Lines that code writes (tool sentences, guardrail lines, run facts) are stored as keys with values and re-rendered; model-written text keeps its language and gets a small EN or DE tag. `index.html` keeps the English name and texts as static defaults, because the boot screen and `tests/page-icon.mjs` read them; i18n replaces them at runtime.

### e.2 The four shell modules

`drawer.js`, `progress.js`, `handover.js` and `modal.js` import `t` and `onLang`. `progress.js` exports `configureRail({ steps, stateStep })` and `drawer.js` exports `configureDrawer({ tabs })`, so the app defines the rail's steps and the drawer's tabs. `js/anthropic.js` stays unchanged: `js/api_messages.js` maps HTTP status and error type to keys where the app shows an error. REVIEW.md lists each adapted file with its reason, as Repack Pilot's D71 did, so the sister apps can take the i18n over.

### e.3 Model-written text

The system prompt says which language to write in: the one active when the run starts. Narration, the profile, block names, roles and notes, layer reasons, levers, the memo and the report are in that language. Pre-runs carry every model-written text as `{ "en": …, "de": … }` with identical placeholders (`tools/check-runs.mjs` checks). Quotes stay verbatim in their own language and carry a `lang` attribute. Layer names: the portal's German labels in German; the English labels of the brief in English, with the German original as a tooltip that keyboard focus also opens.

### e.4 Numbers, dates and exports

`format.js` formats through `Intl` with `en-GB` and `de-DE`: scores as whole numbers, shares as whole percentages ("92%", "92 %"), changes with a sign ("+9"), dates with the month written out, the cost meter in euros with cents. Exports follow the active language; DEMO_SCRIPT has an English and a German talk track.

### e.5 Tests

`tests/i18n.mjs` (static): identical keys, no empty value, the same placeholders in both languages, and no user-visible string hard-coded in `js/` (text set through the DOM helpers must come from `t()`; an allowlist holds only technical strings such as ids and class names). End to end in `smoke` and `accept`: a first visit with a German browser opens in English; `?lang=de` works and is stored; the switch needs no reload, updates `<html lang>` and also translates the shell's drawer, rail and dialogs (AC-04).

---

## f. Screens

Built on the shell's header, control bar, centrepiece, console, drawer and dialogs. The values in the sketches are those of the fictional golden case S2.

### f.1 1920×1080

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⬢ Sovereignty Assessment            [SIMULATION]   ✦ You are interacting with an AI system    ⓘ How it works     │
│   Prototype – not an official service of the German Federal Government          Method   [EN|DE]   ◐ Theme       │
│ ┌ Overall score ─────┐ ┌ Weakest critical link ──────────────────┐ ┌ Evidence coverage ┐ ┌ Exclusive non-EU ─┐   │
│ │ 72   indicative    │ │ Level 0 · B-10 App distribution on iOS  │ │ 92%               │ │ 40% of critical   │   │
│ └────────────────────┘ └─────────────────────────────────────────┘ └───────────────────┘ └───────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Enter a base service or platform ▾] ▷ Start agent │ Model ▾ │ ×1 ×2 ×4 │ ● Awaiting your review │ Abort Reset ⚙ │
├──────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────┤
│ Musterdienst · as of …           [By layer|By building block] [Table]    │ Understand ▸ Research ▸ Score ▸       │
│                Infrastructure 44             ┌ Made in ─────────────┐    │ Your review ▸ Recommend               │
│                       ⬡                      │ US       ████████ 4  │    │ ─────────────────────────────────     │
│   Interface     ⬡           ⬡  DevSecOps 100 │ DE       ██████   3  │    │ Searches the web for … (fjord)        │
│   and access 30      ⬢⬢⬢                     │ UNKNOWN  ████     2  │    │ Reads the operator's page …           │
│                 ⬡           ⬡  Platform 65   │ EU ██ 1   CN ██ 1    │    │ Records B-03 · DE·DE · level 4        │
│   Applications 94     ⬡   Base services 100  ├ Run by ──────────────┤    │ ✦ narration with the AI label         │
│                                              │ DE ████████████ 8    │    │ Details ▸                             │
│                                              │ US ███ 2  UNK ██ 1   │    │                                       │
│  Building blocks by layer                    └──────────────────────┘    │                                       │
│  Infrastructure ⬢1 US·US ⬢4 DE·DE   DevSecOps ⬢4 DE·DE ⬡ gap             │ Run facts: model calls, searches,     │
│  Platform ⬢3 US·DE ⬢2 UNK·DE   Base services ⬢4 DE·DE                    │ fetches, cost                         │
│  Applications ⬢4 EU·DE ⬢3 CN·DE   Interface and access ⬢0 US·US ⬢3 US·DE │                                       │
├──────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────┤
│ Building blocks │ Review │ Levers │ Outbox │ Audit                           Built by Victor Pflüger  ·  Hide    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Header:** page icon and name, mode badge, theme toggle, the EN and DE switch, the AI disclosure, the prototype line, How it works, Method, and the four tiles. The overall tile always says "indicative" and opens the method; the weakest-link tile names the block and adds "and n more" on a tie; "no data" replaces any figure without a basis.
- **Start:** one input with suggestions from the catalogue ("Enter a base service or platform"); before a run the centrepiece shows the catalogue as chips grouped by category, with a mark for entries that have a pre-run.
- **Centrepiece:** the spider diagram (plain SVG; concentric hexagons for levels 0 to 4 at 0, 25, 50, 75 and 100; hexagon markers with the value on each axis; dashed axes without a score; first axis at the top, the others clockwise), beside it the Made-in and Run-by mix as sorted bars, below them the honeycomb of the blocks grouped by layer. **By building block** gives every block its axis, labelled with its name and its codes; label separation and a fit test come from Rebate Hunter's board geometry. **Table** shows the same numbers. Compare and Portfolio (M3) are views of the same area.
- **Console and rail:** one plain sentence per tool call, details one click away, the run facts at the end. Searches and fetches pulse in fjord as an outline.
- **Drawer:** Building blocks (table with filters; each row opens its evidence: quote, source, date read, fields supported); Review; Levers (cards with the what-if score, the change and the weakest link afterwards, "Keep as is", one merlot Approve); Outbox ("Draft. Nothing is sent."); Audit.

### f.2 1280×720

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ⬢ Sovereignty Assessment [SIMULATION] ✦ You are interacting with an AI system        │
│   Prototype – not an official service of the German Federal Government               │
│   [72 indicative] [Weakest: level 0 · B-10] [Coverage 92%] [Non-EU 40%]  ⓘ [EN|DE] ◐ │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ [Service ▾] ▷ Start agent │ Model ▾ │ ×1 ×2 ×4 │ ● Researching │ Abort Reset ⚙       │
├────────────────────────────────────────────────────┬─────────────────────────────────┤
│ [By layer|By block] [Table]                        │ Understand ▸ Research ▸ …       │
│            ⬡ 44            Made in  US ████ 4      │ one plain sentence per          │
│    30 ⬡   ⬢⬢⬢   ⬡ 100      DE ███ 3   UNK ██ 2     │ tool call; details one          │
│    94 ⬡         ⬡ 65       Run by   DE ██████ 8    │ click away                      │
│            ⬡ 100                                   │                                 │
│ Infra ⬢1⬢4 │ DevSecOps ⬢4⬡ │ Platform ⬢3⬢2 │ …     │                                 │
├────────────────────────────────────────────────────┴─────────────────────────────────┤
│ Building blocks │ Review │ Levers │ Outbox │ Audit                          Hide     │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

The header keeps three short rows: the AI disclosure and the prototype line stay visible; the tiles shrink to a label and a value. The control bar drops its labels (the sister apps' breakpoints). The console narrows to about a third. Below a minimum height, or with the drawer open, the honeycomb folds into a strip of one row per layer and the axis labels shorten to the layer's short name, with the full label in the tooltip and the table; nothing is cut to an ellipsis (AC-18). "Hide" on the drawer brings the full map back.

### Honeycomb contrast (f.3)

The brief's mapping measured from Vici's `dist/tokens.json` (WCAG 2.2 contrast, both themes). Text on levels 0 and 4 in `--vc-text-inverse`, on levels 1 to 3 in `--vc-text`: every used pair reaches 4.5:1. On `--vc-div-2` and `--vc-div-6`, no text token reaches 4.5:1 on both themes, so those two fills stay unused, as the brief says.

| Fill | `--vc-text`, light | `--vc-text`, dark | `--vc-text-inverse`, light | `--vc-text-inverse`, dark | Use |
|---|---|---|---|---|---|
| `--vc-div-1` | 2.9 | 1.3 | 5.7 | 12.3 | level 0: `--vc-text-inverse` |
| `--vc-div-2` | 9.5 | 3.8 | 1.7 | 4.4 | not used |
| `--vc-div-3` | 14.5 | 8.5 | 1.1 | 1.9 | level 1: `--vc-text` |
| `--vc-div-4` | 16.4 | 12.9 | 1.0 | 1.3 | level 2: `--vc-text` |
| `--vc-div-5` | 14.8 | 8.1 | 1.1 | 2.0 | level 3: `--vc-text` |
| `--vc-div-6` | 9.9 | 3.6 | 1.7 | 4.6 | not used |
| `--vc-div-7` | 3.0 | 1.3 | 5.4 | 12.6 | level 4: `--vc-text-inverse` |

The spider's series also pass as marks (3:1): the assessed service's `--vc-data-2` line reaches 6.1 on the light surface and 14.1 on the dark one, and 4.7 and 7.2 on its own `--vc-data-pastel-2` fill; a compared service's `--vc-data-3` reaches 4.4 and 11.7. `tests/lib/prototype.mjs` lists these pairs so `tests/tokens.mjs` keeps them.

### f.4 Colour roles

Merlot is the person in charge (Approve, review, the rail step that waits). Lilac is the AI's voice (AI labels, narration, the agent's levers). Fjord is checking: searches and fetches pulse as an outline, never as a fill, so a pulse never reads as a level. The levels use Vici's diverging scale with the numbers and codes written in the cell. Danger, warning and success mark state only, always with a word or a mark. Teal (`--vc-data-2`) draws the assessed service and apricot (`--vc-data-3`) a compared one, because merlot means the person in charge (a deviation from Vici's series order, recorded in DESIGN.md). Ink is everything else; a neutral tape marks Simulation. Hexagons replace circles everywhere, without exception. Light theme by default, dark through Vici's toggle. No federal eagle, no ministry or service logos.

---

## g. Test plan and CI

`node tests/run-all.mjs` runs the suites. GitHub Actions runs the Node suites and then the browser suites on Node 22 and ubuntu-24.04 with Playwright 1.56.0, on every push and pull request; `live-site.yml` runs `tests/live_site.mjs` after every Pages build. No suite calls the real API or spends money. Every browser suite fails on a policy violation, a page error, an unexpected console error, or a request to any host other than the local server (and, in `live`, the intercepted API stand-in).

| Suite | Kind | Checks | From |
|---|---|---|---|
| tokens | Node | Vici's values in both themes, every pair the app draws: the honeycomb text on its fills, the series lines, the mix bars (shared file, app values in `tests/lib/prototype.mjs`) | M1 |
| page-icon | Node | Favicon, header and loading screen with the `honeycomb` icon; compared with the VIP card when a VIP checkout sits next to the repository | M1 |
| vici-files | Node | `vici/` matches its release | M1 |
| i18n | Node | Key parity, empty values, placeholders, stray strings (e.5) | M1 |
| unit | Node | Streaming client, retries, cost maths with the search fee, `js/schema.js`, `Intl` formatting with non-breaking spaces normalised, URL normalisation, the document registry, catalogue matching | M1 |
| engine | Node | S1 to S4 from `tests/fixtures/` (values to 1e-9, display strings in both languages); class derivation for the 26 other EU states, CN, HK, MO, OTHER and UNKNOWN, the parent rule and open source without a steward; what-ifs leave the assessment unchanged; no data is not zero; weights | M1 |
| audit | Node | F01 to F29 with the expected tokens, F21 and F22 again with a non-breaking space after "§"; the D9 and D10 cases | M1 |
| runs | Node | `tools/check-runs.mjs` over every pre-run (section 8 of the brief) | M2 |
| hygiene | Node | No private term and no e-mail address in any file, URLs included (`HYGIENE_TERMS`) | M1 |
| docs | Node | The document set complete; every path and section a document names exists | M1 |
| parity | Node | Against Rebate Hunter's `main`: `vici/` byte for byte, every shell file except the four adapted ones identical after name normalisation; REVIEW.md names each adapted file | M1 |
| smoke | Chromium | Main flows in both modes; the map by mouse and keyboard; language switch without reload; intro; Diagnostics; missing data files | M1 |
| sims | Chromium | Every pre-run fully offline without a key: SIMULATION tape, recomputed figures, complete texts in both languages; review and lever choices other than the recorded ones give consistent tiles, memo and report; the demo pre-run's timing at ×1 | M2 |
| live | Chromium | The agent against `tests/lib/fake-claude.mjs` with server tools (below) | M2 |
| accept | Chromium | Key lifecycle and privacy; the dialog refuses to work in a frame; policy equals the brief's; storage keys `sa.*` and `vc-theme` only; Abort and Reset in both modes; Simulation with zero external requests | M1 |
| layout | Chromium | 1920×1080, 1600×900, 1536×864, 1366×768, 1280×720 in both themes and both languages, at idle, during research, at review, with levers and with the drawer open: no horizontal overflow, nothing on the spider, honeycomb or tiles cut to an ellipsis, targets at least 40 px | M4 |
| design | Chromium | Colour grammar in the running app (merlot, lilac, fjord outline, state colours with words); reduced motion stops the diagram's animation; projector and colour-blind captures | M4 |
| hexagon | Chromium | Nothing round, in the files and in the rendered app in both themes | M1 |

**The API stand-in, extended.** `tests/lib/fake-claude.mjs` keeps the sister apps' protocol checks and adds: `server_tool_use` blocks for both tools; `web_search_tool_result` with `encrypted_content`; `web_fetch_tool_result` with a text document and a base64 PDF; citations of both kinds; `pause_turn`; a mixed turn (a search and a client tool in one response); in-result errors with HTTP 200 (`max_uses_exceeded`, `url_not_allowed`, `url_not_accessible`, `unavailable`); HTTP 400 "web search is not enabled" and "web fetch is not enabled"; usage with `server_tool_use.web_search_requests` and `web_fetch_requests`. It asserts that every assistant block comes back unchanged, that the `tools` array never changes, that a mixed turn is answered with `tool_result` blocks only, that at most two nudges are sent, that no 41st call starts and none after €3, and that the cost equals usage × price plus searches × $0.01 to 1e-9 (AC-08 to AC-10).

**CI.** `tests.yml`, Node job: `node tests/run-all.mjs tokens page-icon vici-files i18n unit engine audit runs hygiene docs` with `HYGIENE_TERMS` from the secret, then `parity` against a fresh clone of Rebate Hunter's `main`. Browser job: `npm install -g playwright@1.56.0 && npx playwright install --with-deps chromium`, then `NODE_PATH="$(npm root -g)" node tests/run-all.mjs smoke sims live accept layout design hexagon`. `live-site.yml` as the Timetable Translator's.

---

## h. Milestones

One branch and one pull request per milestone, titled with milestone and version, merged only with green CI and your approval; `main` stays deployable. Before each milestone, its acceptance criteria become a gates ledger kept with the build session, and the milestone is reported only when every gate is met. At each milestone you get what shipped, the pull request, test results, screenshots (1920×1080 and 1280×720, light and dark, English and German) and open decisions, in a few lines.

| Milestone | Scope | Acceptance criteria |
|---|---|---|
| **M1 Shell, method and languages (v0.1.0)** | Bootstrap with the shell and Vici; the four adapted modules and parity; `index.html` with the policy; both languages incl. the shell's strings; mode and key dialogs; Diagnostics; intro; the catalogue's sixteen entries with verified URLs; the first reference facts; `tests/fixtures/` (S1 to S4, F01 to F29) written before the code; `js/schema.js`, `js/classes.js`, `js/engine.js`, `js/facts.js`; the JSON Schemas of section 10 of the brief; CI with the M1 suites | AC-01 to AC-06 |
| **M2 Agent, pre-runs and levers (v0.2.0)** | The Live agent with web search and web fetch, all tools and guardrails; evidence verification; the sovereignty map (both spider views, the mix, the honeycomb, the table); review; levers with what-ifs and the memo; recorder; the six pre-runs in both languages with `research/` and `tools/check-runs.mjs`; the simulation player; the extended API stand-in | AC-07 to AC-15 and AC-21 |
| **M3 Comparison, portfolio and exports (v0.3.0)** | Compare, Portfolio, exports (Markdown, self-contained HTML, assessment and audit JSON validated against the schemas); the remaining pre-runs (D3) and the self-assessment of this prototype as the seventeenth entry | AC-16, AC-17 |
| **M4 Hardening and release (v1.0.0)** | Layout, design and accessibility suites complete; README, DESIGN, TECH_NOTES, DATA_SOURCES, DEMO_SCRIPT complete; the independent review by an agent that did not build the prototype; a pull request for the VIP card; Pages live and the live-site check | AC-18 to AC-20 and AC-22 to AC-24 |

| AC | Milestone | Test |
|---|---|---|
| AC-01 | M1 | engine |
| AC-02 | M1 | audit |
| AC-03 | M1 | engine |
| AC-04 | M1 | i18n (static), smoke and accept (end to end) |
| AC-05 | M1 | parity; tokens, hexagon, page-icon and vici-files with this app's values; docs (REVIEW.md lists the adapted modules) |
| AC-06 | M1 | accept (policy equals the brief's; storage keys), unit (no external script, style or font) |
| AC-07 | M2 | accept |
| AC-08 | M2 | unit and live |
| AC-09 | M2 | live |
| AC-10 | M2 | live |
| AC-11 | M2 | sims |
| AC-12 | M2 | runs |
| AC-13 | M2 | smoke and sims |
| AC-14 | M2 | sims and live |
| AC-15 | M2 | sims, live and accept |
| AC-16 | M3 | smoke (overlay), engine (S4 on the loaded set) |
| AC-17 | M3 | smoke (names, language), unit (schema validation of the JSON exports) |
| AC-18 | M4 | layout |
| AC-19 | M4 | tokens, hexagon, page-icon, vici-files, design |
| AC-20 | M4 | accept (keyboard only, visible focus), design (reduced motion), smoke (accessible names, quote `lang`) |
| AC-21 | M2 | manual: you run one catalogue service live with your key; the audit export shows model, usage, searches and cost |
| AC-22 | M4 | manual: the five-minute demo in English and German at ×1 |
| AC-23 | M4 | manual: the independent review, no high or medium finding open (REVIEW.md) |
| AC-24 | M4 | docs |

---

## i. Risks and how I will test them

| Risk | Mitigation | Test |
|---|---|---|
| Citations come back inside thinking blocks on Sonnet 5.5 or Opus 5.5, so PDF and search-only quotes never verify (I3) | One short cited sentence; HTML first; D11 | Fake-API cases with citations in text and in thinking blocks; AC-21 live |
| Fetched-document citations map to the wrong URL (I2) | Registry in API order; ambiguity means unverified | `unit` on recorded block shapes; AC-21 |
| Twelve searches and ten fetches are too few for six layers | Catalogue starting URLs and reference facts; parallel `rec_block`; nudges report what is left | `live` counts; AC-21 measures; prompt tuned in M2 |
| A run on Opus 5.5 nears €3 | Sonnet 5.5 by default; the meter; caps of 40 calls and €3 | `live` cost equals usage maths; first measured runs in TECH_NOTES |
| An organisation has switched off web search or web fetch | Clear stop of Live with Simulation offered; Diagnostics says what it cannot pre-check (I4) | `live` with both 400s |
| The fact audit blocks sourced text or lets a figure through | F01 to F29 plus D9 and D10 cases; "Unchecked" tag after two retries, never silent | `audit`; `live` refusal cases |
| An unknown is read as a verdict against a provider | "partly unknown" and "unknown" labels; neutral wording; the method panel says what the score is not | `smoke` checks labels; review in M4 |
| Hand-authored pre-runs go stale (the Deutschland-App changes fast) | `as_of` on every pre-run; "Check for updates" after 90 days; prefer parliamentary answers to press | `sims` with a clock set 91 days later |
| A quote in a pre-run is not on its page | Every quote checked on its page and kept in `research/` | `runs` |
| The block view gets crowded with many blocks | Label separation and fit test; short names with the full name in tooltip and table | `layout` with a fixture of thirty blocks |
| 1280×720 gets crowded | Strip mode for the honeycomb; tiles shrink to label and value | `layout` at five sizes and five states |
| A file names a client or a relationship | Private term list in CI; neutral provider names with sources (D7) | `hygiene` on every push |
| The shell drifts from the sister apps | Parity against Rebate Hunter's `main` | `parity` on every push |
| The API version changes under the shell (I6) | Stay on `2023-06-01`; switch in all prototypes together | `unit` pins the header; fake-API test before any switch |
| "A sovereignty tool on a US model?" | The self-assessment pre-run (M3) and an answer in DEMO_SCRIPT; README says that Live depends on Anthropic's server-side tools | `sims` plays the self-assessment; `docs` checks the answer exists |
| The language switch loses state or leaves strings untranslated | Views re-render through `onLang`; code lines stored as keys | `i18n`; `smoke` switches mid-run |

---

## Appendix A. CORS probe for your browser

This environment cannot reach github.io (P13). To confirm the browser path from the real origin, open https://victorpflueger.github.io/physicalAI-scheduler/ in Chrome (its security policy allows api.anthropic.com), press F12, paste into the console and press Enter:

```js
fetch("https://api.anthropic.com/v1/models",{headers:{"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"}}).then(r=>console.log("probe",r.status,r.headers.get("access-control-allow-origin"))).catch(e=>console.error("probe blocked:",e.message))
```

`probe 401 *` means a page on github.io can read the API's answer, as P11 found from a local page. `probe blocked: Failed to fetch` would mean it cannot; please send me the line either way.

## Appendix B. Phase 0 evidence kept outside the repository

The research log of d.8, the probe outputs, the scratch recomputation of S1 to S4, the fact-audit spike, the contrast and shell-difference measurements, the gates ledger and the screenshots of the four sister Simulations stay in the build session's working folder, not in this repository: they are scaffolding. M1 replaces the recomputation and the spike with `js/engine.js`, `js/facts.js` and their tests; M2 moves the checked quotes into `research/`.
