# Sovereignty Assessment: the five-minute demo

Version 2.0.0. **For** a CIO, a head of digitalisation or an IT strategist in government. **Goal:** after five minutes they can repeat one sentence: *"An AI agent found who makes and who runs every part of BundID, from real sources; code scored it 77 out of 100, indicative; no critical block is controlled from outside the EU, and a person decided what to recommend. Nothing was sent."*

## The four figures at the top

| Figure | What it shows | In the demo |
|---|---|---|
| Overall score | The layers' mean, out of 100, and on how many of the six it rests | 77 on 5 of 6 layers, then 81 with the lever |
| Weakest critical link | The lowest level among the blocks the service can't run without | Level 3 of 4, the Kubernetes platform |
| Exclusive non-EU control | The share of critical blocks run from outside the EU | 0 % of 4 |
| Session cost | What the agent's run costs in model fees | ≈ €0.52 for a live run |

## Before the call

1. Chrome or Edge, full screen (F11), standard zoom; other tabs closed, notifications off.
2. Walk the five steps once. The simulation needs no key and no network.
3. Let the guide open, or start at `?guide=0` if you explain it yourself. `?step=score` opens a step paused; `?lang=de` opens in German, and EN | DE switches without losing the step.
4. For a live run, bring your own Anthropic API key from a workspace with a spend limit.

## The five minutes

The guide's last chapter, *Show it in five minutes*. Closing the guide starts Play: each step stays 7 to 14 seconds and Play stops wherever you act, at **Your turn**. Press Space to give a step its minute; → or a clicker moves on, ← goes back.

1. **Understand: point at the four figures.** (1 min)
   “Who makes and who runs BundID, scored by code: 77 of 100, indicative.”
2. **Research: open one block's quotes.** (1 min)
   “6 building blocks, each with a quote, a link and the date it was read.”
3. **Score: point at the weakest critical link.** (1 min)
   “No critical block runs from outside the EU; weakest: Kubernetes, Level 3 of 4.”
4. **Your review: press Confirm the findings.** (1 min)
   “A person checks first: the AusweisApp for iPhones comes from Apple, level 0.”
5. **Recommend: press Approve the lever, then Approve the draft.** The score tile turns green: ~~77~~ 81. (1 min)
   “An app marketplace run in the EU lifts the score to 81. Nothing is sent.”

## Questions you will get

**Is this an official assessment?** No. It is indicative: a method from public criteria (the Deutschland-Stack's layers, the EU's Cloud Sovereignty Framework) applied to public sources, and not an official service of the German Federal Government.

**Where do the findings come from?** From the service's own pages and public documents, read on 20 November 2026. Every finding shows its quote, link and date read.

**Why is Kubernetes level 3, not 4?** It is open source made outside the EU and run by the ITZBund in Germany. Open source from outside reaches 3; the weaker of maker and operator sets the level.

**What does the AI decide?** Nothing. The agent reads and drafts, code computes every figure, and a person confirms the findings and chooses the lever.

**Can it assess our own service?** Not from this screen yet. Start agent runs Claude live on your key on the case on screen, with today's pages. A new service needs its entry in the catalogue first.

## If something goes wrong

- **The page stays on its loading screen.** It was opened from a file; serve the folder over http.
- **A live run stops early.** The story says why. Start agent, then Play the simulation.
- **The page moved on while you talked.** Press ← to go back; Space pauses.
- **Someone asks for a weaker case.** Open This prototype from the case menu: it runs on US platforms and scores 17.
