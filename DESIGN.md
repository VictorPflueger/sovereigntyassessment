# Sovereignty Assessment: design

Version 2.0.0. On Vici 2.0, Victor's design system, copied unchanged into `vici/`, and on the layout every prototype of Victor's shares (Vici's *Build a prototype*), so a partner who presented one finds their way around this one.

## The screen

- **Header.** The name in a lilac hexagon, SIMULATION or LIVE, How it works, the theme toggle, EN | DE, and the four key figures top right.
- **Under the header.** One sentence on what the prototype does and that its sources are real and its scores indicative, beside the byline.
- **Talk track.** Play, Pause or Replay (Stop during a live run), the five steps, the case menu, and Start agent with "You are interacting with an AI system" beside it.
- **Work area.** The stage on the left shows what to look at: the service, the table of blocks, the levels, the finding to review, the lever and the memo. The story on the right says what it means: a title with the finding, a lead, the agent's words, the decision log, and the bar that says whose turn it is. The stage's foot says it is a prototype, not an official service of the German Federal Government.

It reads from the back of a room at 1920 × 1080 and fits 1280 × 720, in both themes and both languages; only a long list of sources scrolls inside the stage.

## Colour

| Colour | Means |
|---|---|
| Merlot | You: the current step, your turn, the button to press, critical blocks |
| Lilac | The AI: its words, its lever, its memo, the live-run notice |
| Blue to red | A block's level on Vici's diverging scale, 4 in blue to 0 in red, always with its number in the hexagon; level 2 and an unknown level get an outline |
| Green | A figure your decision moved |
| Red | A share of critical blocks under exclusive non-EU control |
| Ink | Everything else |

## Play and Your turn

The page plays its steps by itself, each for as long as its title and lead take to read (7 to 14 seconds), and stops where you act: the merlot **Your turn** bar under the story says what to do and holds the one button to press, which draws attention until it is pressed. Space pauses, as does a step chosen by hand. Vici's *Presenting step by step* sets the pattern.

## Plain words

The agent records blocks as B-01 and levers as L1. The screen says their names instead, in both languages, and a party named twice in the research table goes by its short form the second time: "Informationstechnikzentrum Bund (ITZBund)", then "ITZBund". The tests check every text of the seventeen cases.

## The figures

Every figure comes from the engine's results in the run; `js/story.js` only chooses and words them, and the guide's figures come from the same run. A score from part of the layers says so in its value ("77 on 5 of 6 layers"), and the weakest link and the share show "…" until every layer is in; Vici took this rule from here (ViciDesign#17). When you approve the lever, the score keeps its old value struck through beside the new one.

## Two languages

EN | DE switches every word in place, also while Play runs: the simulation replays in the other language with your decisions, and a live run keeps the agent's words in the language it started in. Each language has its own guide, which opens once per tab across both.

## What stayed and what went

The engine, the fact check, the evidence check, the guardrails, the agent, the simulation player and the pre-runs stayed, byte for byte. The console went: the sovereignty map and the honeycomb, the drawer with its tabs, the control bar, the console replay, Compare, the Portfolio, the exports, the recorder, the method view and Diagnostics.
