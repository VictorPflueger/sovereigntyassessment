# Sovereignty Assessment

**Souveränitätsbewertung** · a browser-only agentic-AI prototype

How digitally sovereign is a German public service? You name a base service or a platform, for example BundID, FIT-Connect or the Bundesportal. An AI agent researches public sources on the building blocks the service rests on, who makes and who runs each block, and where each comes from: Germany, another EU state, the US, China, elsewhere, or unknown. A deterministic engine turns these findings into an indicative sovereignty level per block, a score per layer of the Deutschland-Stack, drawn as a hexagonal spider diagram, and one overall score with its weakest critical link. A person reviews the findings, may choose an improvement lever and gets a memo and a report as drafts.

Live site: https://victorpflueger.github.io/sovereigntyassessment/

Prototype – not an official service of the German Federal Government. The scores are indicative and are not an official assessment under the EU Cloud Sovereignty Framework.

## Status: version 0.2.0

| Version | Milestone | What it holds |
|---|---|---|
| 0.1.0 | M1 Shell, method and languages | The shared shell with Vici; English and German throughout; the catalogue of sixteen services with verified sources; Start agent with the mode and key dialogs; Diagnostics with "Run all tests"; the intro; the engine and the fact audit, proven on the brief's golden cases; the data contracts as JSON Schemas; CI |
| **0.2.0** | **M2 Agent, pre-runs and levers** | **The live agent with web search and web fetch, its fifteen tools and the guardrails in code; evidence verification; the sovereignty map; review, levers with what-ifs and the memo; the recorder; six pre-run assessments for Simulation, in both languages** |
| 0.3.0 | M3 Comparison, portfolio and exports | Compare, Portfolio, exports; the remaining pre-runs and a self-assessment of this prototype |
| 1.0.0 | M4 Hardening and release | Layout, design and accessibility suites; the documents complete; an independent review |

The plan for every milestone is [PLAN.md](PLAN.md). The first live run with a real key is Victor's to make (AC-21); the run book is below.

## What you can do in 0.2.0

- **Watch a pre-run assessment.** Six catalogue entries carry a pre-run, marked with a play sign in the catalogue: BundID, Deutschland-App, Online-Ausweis, FIT-Connect, ePayBL and Bundesportal. Simulation replays it offline, without a key, labelled SIMULATION throughout: the agent's steps in the console, the blocks arriving on the map, then your review and your choice of lever, exactly as in a live run. Each was researched on 19 November 2026 from public pages, and every quote it cites is listed in `research/` with its URL and the date read ([DATA_SOURCES.md](DATA_SOURCES.md) §7).
- **Run the agent live** on any service, in the catalogue or in your own words, with your own Anthropic API key (below).
- **Read the sovereignty map.** The spider diagram shows the six layers of the Deutschland-Stack in the portal's order, or one axis per building block; a layer without a score is a dashed axis, never a zero. Beside it, the Made-in and Run-by mix counts the blocks per origin class; below, the honeycomb shows every block with its level and its two codes; the same numbers are one click away as a table.
- **Review the findings.** The Review tab lists every block. You confirm, skip, or correct a block's criticality, its maker or operator (country and parent), hosting, licence or exit path; each correction needs a reason, is recomputed at once, marked "corrected by reviewer", logged, and listed in the report apart from the agent's findings.
- **Choose a lever.** Up to three levers, each priced by the engine on a copy of the blocks (the assessment never changes), plus "Keep as is". Approve needs a choice. The memo for your choice and the report land in the Outbox as drafts: "Draft. Nothing is sent."
- **Keep the record.** The Audit tab exports the run's events and model calls as JSON; after a live run, "Save run as simulation" downloads it as a pre-run file.
- Everything from 0.1.0 stays: both languages without a reload, Diagnostics with the golden cases, the intro.

## Run it

The prototype is static HTML, CSS and JavaScript modules: no build step, no backend, no dependency. Browsers block modules from `file://`, so serve the folder:

```
python -m http.server 8000
```

then open http://localhost:8000. Published on GitHub Pages (branch `main`, folder `/`), it works as is. Use a current Chrome or Edge.

## The two modes

**Start agent** opens the mode choice for the chosen service.

- **Simulation** replays a pre-run assessment offline, without a key and without any request: no model call, no cost. The tape at the top of the console says when the pre-run was made; the figures are computed again by the engine as the blocks arrive, so they are the same as in the recording, and a review correction or another lever changes them as it would in a live run. A service without a pre-run, or one typed in your own words, needs Live; the dialog says why.
- **Live** runs Claude (Sonnet 5.5 by default; Haiku 5.5 or Opus 5.5 in the model menu) with Anthropic's web search and web fetch tools on your own key: at most 40 model calls and €3.00 per run, checked before every call, with a cost meter that adds the tokens at the listed prices and $0.01 per search, converted at 0.894 euros per dollar. Live mode talks only to the Claude API; web search and web fetch run on Anthropic's servers. If your organisation has switched either tool off, the run stops at once with a message that offers Simulation instead.

## Your API key

The key is asked for only when a live run starts and is checked with the free `GET /v1/models` call. It is kept in this tab's session storage under `sa.anthropic.key` and never written to local storage, the console, logs, the audit export or a saved simulation; "Forget key" removes it; the key dialog refuses to work inside another page's frame; and the page's security policy lets it reach api.anthropic.com only. Use a dedicated key in a workspace with a low monthly spend limit (the dialog links to both settings at platform.claude.com).

## The first live run (AC-21): a run book

Version 0.2.0 was tested against a stand-in for the API that streams the real protocol (tests/live.mjs); it has not yet run against the real API, because no key is part of the build. The first live run is Victor's:

1. **Prepare the key.** Create a dedicated key in a workspace with a low spend limit, for example a few euros a month. Nothing else is needed.
2. **Open the app** at the live site after the merge, or locally as above, in Chrome or Edge, and open Diagnostics once: "Run all tests" checks that api.anthropic.com is reachable from your network, for free.
3. **Start a live run.** Choose a catalogue service, FIT-Connect for example (its pre-run shows what to expect), click Start agent, then "Continue with my API key", paste the key and check it. The run starts at once.
4. **Watch.** The console shows each step as one sentence; the small arrow beside a step opens its details: the tool call, the search or the page read. The run facts under the console count the model calls against the cap of 40 and show the cost so far.
5. **Review and decide.** When the Review tab asks, confirm or correct; then choose a lever or "Keep as is" and approve.
6. **Check the result.** The run ends with the report in the console and the Outbox. In the Audit tab, "Export audit log (JSON)" downloads the record: the model, every call's usage, the searches and pages, and the cost. "Save run as simulation" downloads the run as a pre-run file.
7. **Forget the key** (Start agent, then "Change or forget key").

Please send back the audit export, and say how many blocks the console reports with "fields without a verified quote" (the Building blocks tab marks those fields "unverified"): the evidence check relies on the fetched pages and on the citations the API returns (TECH_NOTES.md §14), and the first live run is where that is confirmed on the real API.

## Safety and the EU AI Act

"You are interacting with an AI system" is always visible, and everything the model wrote carries an AI label. The engine, not the model, computes every level, score and share; the model may cite them only through placeholders, and a fact audit in code blocks any number it writes itself, with two retries and then an "Unchecked" tag, never silently. Every finding carries its source: a URL this run read or the catalogue lists, the page title, a verbatim quote and the date read; a quote that the run's pages or citations do not contain leaves the fields it supports unknown. Nothing is inferred from general knowledge, and an unknown stays unknown. A person reviews every finding and decides on every lever; drafts are never sent.

## Quality and tests

`node tests/run-all.mjs` runs sixteen suites; GitHub Actions runs them on every push and pull request (Node.js 22, Ubuntu 24.04, Playwright 1.56.0). No test calls the real API or spends money: a stand-in answers for api.anthropic.com, streaming the server tools' blocks as the real API does. Besides the suites of 0.1.0 they now cover the six pre-runs under the brief's rules, with a planted defect for each rule (`runs`); the live agent's protocol, nudges, switched-off tools, evidence, caps, cost, guardrails and key (`live`); and the twelve plays of the pre-runs, a correction with "Keep as is", the map, the review and the levers in the browser (`sims`). [tests/README.md](tests/README.md) explains each and how to run the browser suites.

## Files

| Path | What it holds |
|---|---|
| `index.html` | The page, its security policy and the English defaults |
| `js/` | The app: the shared shell; the engine (`engine.js`, `classes.js`, `facts.js`); the live agent (`agent.js`, `prompt.js`), its tools and guardrails (`tools.js`, `guards.js`, `evidence.js`); the simulation player (`simulation.js`) and the recorder (`recorder.js`); the map (`sovmap.js`, `spider.js`, `mix.js`, `honeycomb.js`, `datatable.js`) and the drawer's panels; the languages (`js/i18n/`) |
| `css/` | The shell's stylesheets on Vici, with the app's own in `map.css` and `panels.css` and the block at the end of `style.css` |
| `data/` | The catalogue, the reference facts, the JSON Schemas, the golden cases for Diagnostics, and the pre-runs in `data/runs/` |
| `research/` | The research notes of the pre-runs: every quote with its URL, title and the date read |
| `vici/` | Vici, Victor's design system, unchanged |
| `tests/` | The suites, the golden fixtures, the API stand-in and their helpers |
| `tools/` | `golden.mjs`, which copies the golden fixtures for Diagnostics; `check-runs.mjs`, which checks the pre-runs and sets their quotes' verified flags from `research/` |
| `PLAN.md` | The build plan from Phase 0 |
| `TECH_NOTES.md` | What the code relies on, verified with dates; the agent, the evidence check, the guardrails, the simulation format; decisions and deviations |
| `DESIGN.md` | The interface and its colour grammar |
| `DATA_SOURCES.md` | Every source of the bundled data and the pre-runs, with the date read |
| `REVIEW.md` | The shared shell, the modules adapted for two languages, and the review to come |
| `DEMO_SCRIPT.md` | The talk tracks |

Built by Victor Pflüger. Design system: Vici.
