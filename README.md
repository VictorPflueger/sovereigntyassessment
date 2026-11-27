# Sovereignty Assessment

An AI agent finds out who makes and who runs each part of a German public service, from real sources, and code scores how much of it stays in European hands. It opens on BundID, the federal user account.

Live site: <https://victorpflueger.github.io/sovereigntyassessment/>

**Indicative, not an official assessment.** A prototype, not an official service of the German Federal Government. This is version 2.1.0, of 27 November 2026.

## The four figures

Top right, each explained in the guide.

| Figure | What it measures | BundID |
|---|---|---|
| Overall score | The layers' mean score out of 100, and on how many of the six it rests | 77 on 5 of 6 layers |
| Weakest critical link | The lowest level of the blocks the service can't run without, and any lower block that isn't | Level 3 of 4, Kubernetes; the App Store, 0 |
| Exclusive non-EU control | The share of critical blocks run from outside the EU | 0 % of 4 |
| Session cost | A live run's model fees: estimated in a replay, which is free; measured live | ≈ €0.62 on Sonnet 5.5, replay €0 |

Live, the score counts the layers done so far; the weakest link and the share wait for all six.

## The talk track

The guide, *How the prototype works*, opens once per browser tab. When it closes, the page plays each step as long as it takes to read and stops wherever you act, at **Your turn**. Space pauses; the arrow keys or a clicker move by hand. [DEMO_SCRIPT.md](DEMO_SCRIPT.md) has the guide's closing script in English and German, with the questions that come.

1. **Understand**: what BundID is and who runs it, in its own pages' words.
2. **Research**: six building blocks on the Deutschland-Stack's layers, who makes and runs each, every finding with a quote, link and date read.
3. **Score**: code gives every block a level from 0 to 4 and every layer a score; a click shows how each is made.
4. **Your review**: a person confirms the findings before the agent recommends anything.
5. **Recommend**: one lever, scored on a copy of the blocks; comparable services; unranked starting points for research that sources name. You approve the lever or keep things as they are; the agent drafts a memo, and nothing is sent.

A link opens a step, paused: `?case=bundid&step=score`. The case menu holds sixteen more services, a state's platform among them, and the prototype's own assessment; three end early, as their sources name no building blocks yet. **All services** lists them with their figures and compares two or three.

## Start agent: the simulation or a live run

The page opens on the simulation: the agent's run of 27 November 2026, replayed through its real tools; the engine computes every figure again, and no model is called. **Start agent** offers it first, then a live run with Claude on your own Anthropic API key, with "You are interacting with an AI system" beside it. The key stays in the page's memory and goes only to api.anthropic.com; a run stops at 40 model calls or at your budget, €3 at most. The page stores only theme and language.

## What is real

The services, the pages the agent read, every quote and the date it was read are real. The agent's words and tool calls in the simulation are replayed offline. Every level, score and lever is indicative, from a method built on public criteria. On your key, Claude reads the public web live with the same tools and rules, and its memo stays a draft.

[DATA_SOURCES.md](DATA_SOURCES.md) says where everything comes from; `research/` keeps every source a case cites.

## How it works

The agent reads, code scores, a person decides. A block gets the lower of two levels: who makes it (in the EU 4, open source from outside 3, other software from outside 2) and who runs it (in the EU 4, from outside but hosted in the EU 1, from outside 0). A field without a checked quote counts as unknown, and one unknown side caps a block at 2. A layer scores 25 times its blocks' mean level, critical blocks weighted three, important two, supporting one.

The engine and the fact check are version 1.0.0's files, byte for byte. Version 2.1.0 changed the catalogue, the pre-runs, five notes and seven case modules where it had to; [TECH_NOTES.md](TECH_NOTES.md) §25 says why, and `tests/fingerprint.mjs` pins them. On screen, `js/app.js` runs the steps, `js/story.js` words them, `js/chain.js` derives 2.1.0's figures, and `js/view.js` and `js/overview.js` draw. [DESIGN.md](DESIGN.md) describes the screen, on Vici 2.0, Victor's design system (`vici/`).

## Run it

Nothing to build or install. Serve the folder over http; open it in Chrome or Edge:

```
python -m http.server 8000
```

then <http://localhost:8000>. GitHub Pages publishes `main`; the *live site* workflow checks that the published page plays.

## Tests

`node tests/run-all.mjs` runs every suite, Vici's own checks included; [tests/README.md](tests/README.md) lists them. GitHub Actions runs them on every push; none calls the real API.

## History

Version 1.0.0 had a map, a drawer, a console, Compare, a Portfolio, exports and Diagnostics; its plan and review are in the git history (`1dc145e`). Version 2.0.0 cut them for one screen; 2.1.0 answers a review, and [REVIEW.md](REVIEW.md) holds its cold read.

## Author

Built by Victor Pflüger, on [Vici](https://victorpflueger.github.io/ViciDesign/).
