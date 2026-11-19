# Sovereignty Assessment

**Souveränitätsbewertung** · a browser-only agentic-AI prototype

**Status: Phase 0.** This repository holds the build plan, [PLAN.md](PLAN.md); the prototype itself arrives with milestone M1. Once deployed it runs at https://victorpflueger.github.io/sovereigntyassessment/.

## What it will do

You type the name of a German digital base service or platform, for example BundID, FIT-Connect or the Bundesportal. An AI agent researches public sources on the building blocks the service rests on, who makes and who runs each block, and where each comes from: Germany, another EU state, the US, China, elsewhere, or unknown. A deterministic engine turns these findings into an indicative sovereignty level per block, a score per layer of the Deutschland-Stack, drawn as a hexagonal spider diagram, and one overall score with its weakest critical link. A person reviews the findings, may choose an improvement lever and exports a report.

- **Two modes.** Simulation replays pre-run assessments offline, without a key. Live runs the agent with the presenter's own Claude API key, kept for the browser session only, and depends on Anthropic's server-side web search and web fetch.
- **Two languages.** English by default, German one click away.
- **Every finding shows its sources.** Nothing is inferred from general knowledge; an unknown stays unknown.
- **Nothing leaves the outbox.** Drafts are never sent; Live mode talks only to the Claude API.

Prototype – not an official service of the German Federal Government. The scores are indicative and are not an official assessment under the EU Cloud Sovereignty Framework.

Built by Victor Pflüger. Design system: Vici.
