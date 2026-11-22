# Sovereignty Assessment: design

Version 2.0.0, on Vici 2.0, Victor's design system (copied unchanged into `vici/`), and on the layout all his prototypes share, so a partner who presented one finds their way around this one. It fits 1280 × 720 and reads from the back of a room at 1920 × 1080, in both themes and languages.

## The screen

- **Header.** The name, SIMULATION or LIVE, How it works, the theme toggle, EN | DE and the four key figures; under it one sentence on what the prototype does and how real its data is, beside the byline.
- **Talk track.** Play, Pause or Replay (Stop in a live run), the five steps, the case menu, and Start agent with "You are interacting with an AI system" beside it.
- **Work area.** The stage on the left shows what to look at; its foot says this is not an official service of the German Federal Government. The story on the right says what it means: the agent's words, the decision log and the **Your turn** bar with the one button to press.

## Colour

Merlot is you: the current step, your turn, the button to press, critical blocks. Lilac is the AI: its words, its lever, its memo and the live-run notice. A block's level runs from 4 in blue to 0 in red on Vici's diverging scale, always with its number, and level 2 and an unknown level get an outline. Green marks a figure your decision moved, red a share of critical blocks under exclusive non-EU control; everything else is ink.

## Play, words and languages

Play walks the steps, 7 to 14 seconds each, and stops where you act; Space pauses, as does a step chosen by hand. The screen says names, never the agent's ids (B-01, L1), and a level with one side unknown says so in words. EN | DE switches every word in place, also while Play runs; a live run keeps the agent's words in the language it started in. Each language has its own guide, which opens once per tab across both.

## The figures

Every figure comes from the engine's results in the run; `js/story.js` only chooses and words them, and the guide's figures come from the same run. A score from part of the layers says so in its value ("77 on 5 of 6 layers"); in a live run the weakest link and the share show "…" until every layer is in (ViciDesign#17). An approved lever keeps the old score struck through beside the new one.

## What stayed and what went

The case stayed byte for byte: engine, fact and evidence checks, guardrails, agent, simulation player and pre-runs. Version 1's console went, with its map and honeycomb views, drawer, control bar, Compare, Portfolio, exports, recorder, method view and Diagnostics.
