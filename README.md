# Sovereignty Assessment

**Souveränitätsbewertung** · a browser-only agentic-AI prototype

How digitally sovereign is a German public service? You name a base service or a platform, for example BundID, FIT-Connect or the Bundesportal. An AI agent researches public sources on the building blocks the service rests on, who makes and who runs each block, and where each comes from: Germany, another EU state, the US, China, elsewhere, or unknown. A deterministic engine turns these findings into an indicative sovereignty level per block, a score per layer of the Deutschland-Stack, drawn as a hexagonal spider diagram, and one overall score with its weakest critical link. A person reviews the findings, may choose an improvement lever and exports a report.

Live site: https://victorpflueger.github.io/sovereigntyassessment/

Prototype – not an official service of the German Federal Government. The scores are indicative and are not an official assessment under the EU Cloud Sovereignty Framework.

## Status: version 0.1.0

| Version | Milestone | What it holds |
|---|---|---|
| **0.1.0** | **M1 Shell, method and languages** | The shared shell with Vici; English and German throughout; the catalogue of sixteen services with verified sources; Start agent with the mode and key dialogs; Diagnostics with "Run all tests"; the intro; the engine and the fact audit, proven on the brief's golden cases; the data contracts as JSON Schemas; CI |
| 0.2.0 | M2 Agent, pre-runs and levers | The live agent with web search and web fetch; the sovereignty map; review, levers and the memo; six pre-run assessments for Simulation |
| 0.3.0 | M3 Comparison, portfolio and exports | Compare, Portfolio, exports; the remaining pre-runs and a self-assessment of this prototype |
| 1.0.0 | M4 Hardening and release | Layout, design and accessibility suites; the documents complete; an independent review |

In this version Start agent leads through the mode choice and the key check, and then says plainly that the live agent comes with the next version: nothing runs and nothing is charged. The plan for every milestone is [PLAN.md](PLAN.md).

## What you can do in 0.1.0

- **Choose a service.** The centrepiece lists the catalogue: nine base services and seven platforms and access channels, each with its description, its status and its starting sources, read on 19 November 2026 ([DATA_SOURCES.md](DATA_SOURCES.md)). The field above suggests entries as you type, variants and near misses such as "Bund-ID", "Onlineausweis" or "FIT Konnect" included, and takes any other service in your own words.
- **Switch the language.** EN and DE in the header change every word at once, without a reload. English is the default on every first visit; `?lang=de` in the address opens German and remembers it.
- **Run Diagnostics.** It recomputes the brief's golden cases in your browser (137 checks), compares both languages, checks where the key would be kept and the page's security policy, validates the bundled data, and with "Run all tests" checks that api.anthropic.com is reachable from your network, without a key and for free.
- **Read How it works.** The intro window explains the agent's five steps: understand, research, score, your review, recommend.

## Run it

The prototype is static HTML, CSS and JavaScript modules: no build step, no backend, no dependency. Browsers block modules from `file://`, so serve the folder:

```
python -m http.server 8000
```

then open http://localhost:8000. Published on GitHub Pages (branch `main`, folder `/`), it works as is. Use a current Chrome or Edge.

## The two modes

**Start agent** opens the mode choice for the chosen service.

- **Simulation** replays a pre-run assessment offline, without a key, labelled SIMULATION throughout. The first pre-runs ship with version 0.2.0; until then the dialog says that none exists for the service yet.
- **Live** runs Claude with web search and web fetch on your own Anthropic API key, at most 40 model calls and €3 per run, with a live cost meter. Live mode talks only to the Claude API; web search and web fetch run on Anthropic's servers.

## Your API key

The key is asked for only when a live run starts and is checked with the free `GET /v1/models` call. It is kept in this tab's session storage under `sa.anthropic.key` and never written to local storage, the console, logs or exports; "Forget key" removes it; the key dialog refuses to work inside another page's frame; and the page's security policy lets it reach api.anthropic.com only. Use a dedicated key in a workspace with a low monthly spend limit (the dialog links to both settings at platform.claude.com).

## Safety and the EU AI Act

"You are interacting with an AI system" is always visible. The engine, not the model, computes every level, score and share; the model may cite them only through placeholders, and a fact audit blocks any number it writes itself. Every finding will carry its source: a URL this run read or the catalogue lists, the page title, a verbatim quote and the date read. Nothing is inferred from general knowledge, and an unknown stays unknown. A person reviews every finding and decides on every lever; drafts are never sent.

## Quality and tests

`node tests/run-all.mjs` runs thirteen suites; GitHub Actions runs them on every push and pull request (Node.js 22, Ubuntu 24.04, Playwright 1.56.0). No test calls the real API or spends money: a stand-in answers for api.anthropic.com. The suites cover the colour system, the page icon, Vici's files, both languages, the API client and the cost maths, the data contracts, the engine and the fact audit on the brief's golden cases, repository hygiene, the documents, parity of the shared shell with the sister prototypes, the start flow in the browser, the key and the security policy, and that nothing is round. [tests/README.md](tests/README.md) explains each and how to run the browser suites.

## Files

| Path | What it holds |
|---|---|
| `index.html` | The page, its security policy and the English defaults |
| `js/` | The app: the shared shell, the engine (`engine.js`, `classes.js`, `facts.js`), the languages (`js/i18n/`), the views and dialogs |
| `css/` | The shell's stylesheets on Vici, with the app's own block at the end of `style.css` |
| `data/` | The catalogue, the reference facts, the JSON Schemas and the golden cases for Diagnostics |
| `vici/` | Vici, Victor's design system, unchanged |
| `tests/` | The suites, the golden fixtures and their helpers |
| `tools/` | `golden.mjs`, which copies the golden fixtures for Diagnostics |
| `PLAN.md` | The build plan from Phase 0 |
| `TECH_NOTES.md` | What the code relies on, verified with dates; decisions and deviations |
| `DESIGN.md` | The interface and its colour grammar |
| `DATA_SOURCES.md` | Every source of the bundled data, with the date read |
| `REVIEW.md` | The shared shell, the modules adapted for two languages, and the review to come |
| `DEMO_SCRIPT.md` | The talk tracks, from version 0.2.0 |

Built by Victor Pflüger. Design system: Vici.
