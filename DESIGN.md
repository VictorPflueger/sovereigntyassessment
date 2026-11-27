# Sovereignty Assessment: design

Version 2.1.0, on Vici 2.0, Victor's design system (copied unchanged into `vici/`), and on the layout all his prototypes share, so a partner who presented one finds their way here. It fits 1280 × 720 and reads from the back of a room at 1920 × 1080, in both themes and languages.

## The screen

- **Header.** Two rows at every desktop width. The first holds the name, one sentence on what the prototype does and how real its data is, SIMULATION or LIVE, How it works, All services, the theme toggle and EN | DE; the second, right-aligned, the four key figures.
- **Talk track.** Play, Pause or Replay (Stop in a live run), the five steps, the case menu, and Start agent beside "You are interacting with an AI system".
- **Work area.** The stage on the left shows what to look at; its foot says this is not an official service of the German Federal Government, beside the byline. The story on the right says what it means: the agent's words, the decision log and the **Your turn** bar with the button to press.
- **All services.** A dialog lists every case with its four figures, function group and date, best first, with the cases that ended early and this prototype apart. Ticking two or three opens Compare: the figures and the six layers side by side, each name one click from its case.

## Colour

Merlot is you: the current step, your turn, the button to press, critical blocks. Lilac is the AI: its words, its lever, its memo and the live-run notice. A block's level runs from 4 in blue to 0 in red on Vici's diverging scale, always with its number, and level 2 and an unknown level get an outline. Green marks a figure your decision moved, red a share of critical blocks under exclusive non-EU control; the rest is ink.

## Play, words and languages

Play walks the steps, 7 to 14 seconds each, and stops where you act; Space pauses, as does a step chosen by hand. The screen says names, never the agent's ids (B-01, L1), and a level with one side unknown says so in words. EN | DE switches every word in place, also while Play runs; a live run keeps the agent's words in its starting language. Each language has its own guide, which opens once per tab. Nothing the story needs sits only in a tooltip: each block says in words how critical it is, and the key under the score step gives the levels, weights and points at the story's text size.

## The figures

Every figure comes from the engine's results in the run, the guide's too; `js/chain.js` derives lower blocks, arithmetic and comparable services from them, and `js/story.js` only words them. A score from part of the layers says so in its value ("77 on 5 of 6 layers"); in a live run the weakest link and the share show "…" until every layer is in (ViciDesign#17). An approved lever leaves the figures as assessed and notes what it would give: "81 if carried out".

The weakest-link tile never contradicts the stage, also after a lever: under the level it names a lower block that isn't critical, counts the critical blocks no source names, and says so when no link is weak. A click or Enter on a block or a score opens how it is made, in the engine's numbers; Esc closes it. In a replay the cost tile reads "A live run would cost ≈ €0.62" over "this replay: €0".

At Recommend the lever stands with the comparable services, ranked by score, and starting points for research that a public source names for a weak block, alphabetical and labelled as no recommendation.

## What stayed and what went

The engine and the fact check stayed byte for byte; 2.1.0 changed the other case files only where it had to (TECH_NOTES.md §25). Version 1's console went, with its map, drawer, control bar, Portfolio, exports, recorder, method view and Diagnostics. Compare came back in 2.1.0 as a dialog from All services, and keeps nothing once the tab closes.
