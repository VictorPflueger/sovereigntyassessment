# Sovereignty Assessment: design

Version 0.2.0, 19 November 2026. How the interface looks and why. The look is Vici, Victor's design system, copied unchanged into `vici/`, through the sister prototypes' shared shell (REVIEW.md). The screens of the finished prototype are sketched in PLAN.md, section f; version 0.1.0 built the header, the control bar, the catalogue in the centrepiece, the console with its rail, the drawer and the dialogs, and version 0.2.0 adds the sovereignty map, the drawer's panels and the run in the console (§9).

## 1. Principles

- **Made for a room.** The prototype is shown on a projector to public-sector decision makers. It reads from the back of a room at 1920×1080 and stays usable down to 1280×720, without horizontal scrolling.
- **Honest at a glance.** "You are interacting with an AI system" is always visible; the header always carries "Prototype – not an official service of the German Federal Government"; every score says "indicative"; a figure without a basis says "no data" and is never drawn as 0; every finding will show its sources. No federal eagle, no ministry or service logo, nothing that imitates an official site.
- **The person decides.** The agent researches and proposes; a person reviews, chooses and approves. Nothing is sent.
- **Calm.** Light theme by default (lit rooms), dark through Vici's toggle. Motion only where something happens.

## 2. Layout

The sister apps' grid: header, control bar, workspace and drawer fill the window; only panels scroll.

- **Header:** the page icon and the name with the prototype line under it; the mode badge, "How it works", the theme toggle, the EN and DE switch and the AI disclosure; the four tiles (overall score, weakest critical link, evidence coverage, exclusive non-EU control).
- **Control bar:** the service field with suggestions from the catalogue ("Enter a base service or platform"), Start agent, the model, the replay speed, the run's status, Abort, Reset and Diagnostics.
- **Workspace:** the centrepiece (60 %) and the console (40 %). Before a run the centrepiece shows the catalogue as chips grouped by category, and the chosen entry's description, status and starting sources; the sovereignty map takes its place in version 0.2.0. The console holds the progress rail with the agent's five steps and the log.
- **Drawer:** Building blocks, Review, Levers, Outbox and Audit, with Vici's byline in the middle and "Drafts only. Nothing is sent." beside the toggle. Until the agent arrives, each tab says what it will hold.

## 3. Colour grammar

Four rules of meaning, the sister apps' grammar applied to this domain:

1. **Merlot is the person in charge:** Start agent, Approve, the chosen catalogue entry, the step that waits for a person, the focus ring. It never encodes a state.
2. **Lilac is the AI's voice:** the AI disclosure, AI labels, narration, the agent's levers, and the page icon's cell.
3. **Fjord is checking:** searches and fetches pulse in fjord as an outline, never as a fill, so a pulse never reads as a level.
4. **Ink and Vici's neutrals carry everything else.** Danger, warning and success mark state only, always with a word or a mark (Diagnostics' Pass, Fail and Check tags carry their icon and their word). A neutral tape marks Simulation.

The levels use Vici's diverging scale with the level number and the Made-in and Run-by codes written in each honeycomb cell: level 0 `--vc-div-1`, 1 `--vc-div-3`, 2 `--vc-div-4`, 3 `--vc-div-5`, 4 `--vc-div-7`, with `--vc-text-inverse` on levels 0 and 4 and `--vc-text` on levels 1 to 3. `--vc-div-2` and `--vc-div-6` stay unused, because no text token reaches 4.5:1 on them in both themes (PLAN.md f.3). The assessed service is drawn in teal (`--vc-data-2` with `--vc-data-pastel-2`) and a compared one in apricot (`--vc-data-3`). `tests/tokens.mjs` keeps every pair the app draws at its contrast in both themes, with the pairs listed in `tests/lib/prototype.mjs`.

The intro window's five steps take the same grammar: lilac where the AI works on its own (Understand), fjord where it checks (Research), neutral where code computes (Score), merlot where the person decides (Your review), ink for the levers (Recommend).

## 4. Hexagons

Hexagons replace circles everywhere, with no exception: Vici's cells, chips, tags, stepper markers, status dots and avatars are hexagons, and so are the spider diagram's rings and markers and the honeycomb's cells. `tests/hexagon.mjs` scans the app's files and the rendered app in both themes, through the start screen, the catalogue and its suggestions, Diagnostics, the mode and key dialogs, every drawer tab and the German interface, and fails on anything round.

## 5. Type and sizes

Vici's fonts, served from `vici/` (the security policy allows no font from another site), on the sister apps' fluid root size: 15 px at 1280 px wide, about 17 px at 1920 px, never above 18 px, and it follows the reader's own text-size setting. The tiles' figures use 2.125rem (1.875rem below 1,700 px). Every control the room clicks is at least 40 px high: the service field, the catalogue's chips and the language switch are 44 px or 40 px.

## 6. The header and the prototype line

At 1920×1080 the header is one row: the brand with its two lines, the badges in two rows, and the four tiles. Below 1,500 px wide the tiles take a row of their own under the brand and the badges, so neither the prototype line nor a tile's text is squeezed or cut; the header grows to three short rows, as PLAN.md f.2 sketches. The prototype line wraps rather than being cut to an ellipsis at any width. The control bar drops its labels on laptops (the sister apps' breakpoints), and Reset and Diagnostics keep their names in their tooltips.

## 7. Two languages in the interface

The EN and DE switch is two toggle buttons with `aria-pressed`, drawn as the shell's segmented control beside the theme toggle. Each names its language in that language ("English (EN)", "Deutsch (DE)"). A switch changes every word at once without a reload; what was typed, what is chosen and where a dialog stands stay. German texts address the reader formally (Sie) and use German quotation marks („…“). The catalogue's names and descriptions come from the catalogue in both languages. From version 0.2.0 the layers carry the Deutschland-Stack's German labels in German and the brief's English labels in English, with the German original as a tooltip.

## 8. Deviations from Vici and the sister apps

- **Teal for the assessed service.** Vici's data series start with merlot, but merlot means the person in charge here, so the assessed service takes the second series colour (teal) and a compared service the third (apricot). The brief asks for this record.
- **The catalogue's chips are radio buttons.** Vici's toggle chips (`aria-pressed`) let a second click undo the choice, and vici.js toggles them by itself; one service at a time is a single choice, so each chip wraps a radio button, Vici's other chip pattern, with its tick and the arrow keys across the whole catalogue.
- **A row of its own for the tiles below 1,500 px** (§6), where the sister apps keep the tiles beside the badges down to 1,180 px: this app's header carries a two-line prototype line and a language switch the others do not have.
- **The intro's step tones** are this app's (§3): the shared stylesheet's tones name the Timetable Translator's steps.
- **The person's turn on the rail** replaces the step's label with the merlot tag ("Your review") instead of standing beside it: this app's review step is itself called "Your review", and five steps with a tag beside one do not fit the console's width. The rule is in `css/panels.css`; the shared rail is unchanged.
- **The byline's label** gives way below 1,340 px instead of the shared stylesheet's 1,180 px, because the drawer's tabs now carry counts and the bar must stay one row in German (`css/panels.css`).

## 9. The sovereignty map and the drawer (version 0.2.0)

**The map** takes the centrepiece once a run starts; the catalogue gives way and returns with Reset.

- **The spider diagram** opens by layer: six axes in the portal's order (Infrastructure, Development, security and operations, Platform, Base services, Applications and services, Interface and access), so the web is a hexagon; "By building block" draws one axis per block at 25 × its level, labelled with its id, its two codes and its name. Rings mark the levels; a layer or block without a score is a dashed axis with its status in muted italics, never a zero. The service is teal on its pastel fill (§8). The diagram is drawn at its host's size in pixels: the web takes the room its labels leave, and the labels keep their size, so a short map (a laptop screen, the drawer open) shows a smaller web with labels that stay legible rather than shrinking everything; a very small web drops the ring labels.
- **The Made-in and Run-by mix** stands beside it: one bar per origin class, sorted by count, the class named by its code and, on hover and for screen readers, in words, with the critical blocks' count.
- **The honeycomb** below groups the blocks by layer, one hexagon cell per block, filled on the diverging scale (§3) with the level and both codes written in the cell; a gap is an empty cell with a dashed outline; "?" marks a partly unknown level. A short map folds it into one strip per layer with small cells that keep their level.
- **The table** is one click away and holds the same numbers: the layer scores with their statuses and the block levels with their classes.
- **Searching and reading** pulse a fjord outline around the map, never a fill; the console's pages-read count says the same in words.

**The console** carries the agent's narration with the lilac AI label, code's own lines without it, each tool call as one plain sentence with its details one click away, and the run facts underneath (calls against the cap, the cost, searches, pages read). In Simulation the neutral tape names the pre-run's date and the word SIMULATION stands faintly behind the log.

**The drawer's tabs** follow the run: Building blocks (the blocks with filters; each opens its evidence: the quote, the source, the date read and the fields it supports, and marks unverified fields), Review, Levers, Outbox and Audit. Merlot is the person in charge: the Review's Confirm, a block's "corrected by reviewer" tag, the levers' one Approve. A tab that needs the person shows its count in merlot and opens by itself; the others stay quiet. The Outbox's drafts carry "Draft. Nothing is sent." and the AI label; a draft in the other language says so.
