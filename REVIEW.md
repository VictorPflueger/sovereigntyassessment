# REVIEW: Sovereignty Assessment and its parity with the sister prototypes

This file keeps two things: the list of shared-shell files this app adapted, with the reason for each, so the sister prototypes (Rebate Hunter, Navigator, the Timetable Translator and Repack Pilot) can take the change over; and, from version 1.0.0, the independent review by an agent that did not build the prototype (brief, AC-23).

## Part 1. Status

| Version | Milestone | What it holds |
|---|---|---|
| 0.1.0 | M1 Shell, method and languages | The shared shell with Vici; English and German, the shell's strings included; mode and key dialogs; Diagnostics with "Run all tests"; the intro; the catalogue's sixteen entries; the first reference facts; the engine and the fact audit with the golden cases S1 to S4 and F01 to F29; the JSON Schemas; CI |
| 0.2.0 | M2 Agent, pre-runs and levers | The live agent with web search and web fetch, adapted from Rebate Hunter's; the evidence check and the guardrails in code; the sovereignty map; review, levers and the memo; the recorder; six pre-runs in both languages; the simulation player; the API stand-in with the server tools |

Comparison, the portfolio and the exports follow in version 0.3.0 (`PLAN.md`, section h). Version 0.2.0 changed no shared file; of the adapted modules, `js/handover.js` changed (below).

## Part 2. The shared shell

### Copied unchanged

The shell as the Timetable Translator's `REVIEW.md` lists it under "Shared shell", taken from the Timetable Translator at `04006b6` and identical to Rebate Hunter's `main` at `73c00f8` once app names and storage prefixes are normalised: `vici/` (Vici v1.0.0, byte for byte, with `vici/README.md`), `js/theme.js`, `js/anthropic.js`, `js/sse.js`, `js/cost.js`, `js/keystore.js`, `js/clock.js`, `js/dom.js`, `js/labels.js`, `js/md.js`, `css/components.css`, `css/console.css`, `css/drawer.css`, `css/modals.css` and `css/style.css` up to its app-specific block, and the four shared tests `tests/tokens.mjs`, `tests/hexagon.mjs`, `tests/page-icon.mjs` and `tests/vici-files.mjs`. What this app draws differently lives in `tests/lib/prototype.mjs`. `tests/parity.mjs` compares all of them with a Rebate Hunter checkout on every push.

The shell's own English strings stay where they are in these files and never reach the screen in this app: the shared client's error texts (`js/anthropic.js`) are translated by HTTP status and error type in `js/api_messages.js`, and Diagnostics writes its own lines from the probes' status codes.

### Adapted shell modules

Brief §4: two languages need one change in the shell. These four modules were adapted, and nothing else in the shell was.

| File | What changed | Reason |
|---|---|---|
| `js/drawer.js` | Every string ("Built by", the byline's link names, the tab list's name, "Show", "Hide", the toggle's name, the note) comes from `t()` and is re-rendered through `onLang()`; the app defines the tabs with `configureDrawer({ tabs, labelKey, noteKey })` instead of the fixed Options, Outbox and Audit | Adapted for two languages, so the drawer switches language without a reload, and because this app's five tabs (Building blocks, Review, Levers, Outbox, Audit) differ from the sister apps' three |
| `js/progress.js` | The rail's name, its state words and the person's turn come from `t()` and re-render through `onLang()`; the app defines the steps, the state-to-step map, the person's turns and the outcomes that count as complete with `configureRail({ steps, stateStep, turns, complete })` | Adapted for two languages, and because this app's five steps (Understand, Research, Score, Your review, Recommend) and its three turns (a choice, a review, a decision) differ from the sister apps' fixed steps and two turns |
| `js/handover.js` | `runStateLabel()` reads `t("state.<state>")`; the awaited step follows the app's `HUMAN_STATES` (one run state for each moment that waits for the person) and ends at once on `choice_decision`, `review_decision` or `lever_decision`; since version 0.2.0 a `review_decision` that corrects a block keeps the review awaited, because the person may correct several blocks before confirming or skipping | Adapted for two languages, and because this app gives every human step a run state of its own, so the shell's trick of telling two moments of one state apart by decision events is not needed |
| `js/modal.js` | The close button's name ("Close dialog") comes from `t()` and follows a language change while the dialog is open | Adapted for two languages, so an open dialog's close button is named in the active language; the dialog's content is the caller's and re-renders itself |

**How a sister app takes this over.** Copy the four modules and add an i18n module with the same five exports (`t`, `onLang`, and for the app `getLang`, `setLang`, `initLang`); give it the keys these modules use (`drawer.*`, `rail.*`, `state.*`, `modal.close`); call `configureDrawer()` and `configureRail()` with the app's own tabs and steps before the drawer and the rail are created. An app with one language keeps a dictionary with one language and never calls `setLang()`.

### App-owned files the shell imports

`js/events.js` (this app's run-event types and run states on the shared bus and envelope), `js/icons.js` (Vici's icons and the sister apps' shared drawings) and `tests/lib/harness.mjs` (storage keys under `sa.`, output folder from `SA_TEST_OUT`) are each app's own in every sister prototype, so `tests/parity.mjs` does not compare them.

## Part 3. Independent review

To come in version 1.0.0 (brief, AC-23).
