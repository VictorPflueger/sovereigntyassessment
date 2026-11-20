# Tests

The app needs none of this: it is static files. The tests run on Node.js 22 without dependencies; the browser suites also need Playwright with Chromium. No test calls the real API or spends money: the browser suites answer api.anthropic.com with a stand-in, and every other host is refused.

## What runs

`node tests/run-all.mjs` runs every suite in order and, when all eighteen pass and none is skipped, ends with `ALL SUITES PASSED (18 of 18)`; parity needs a Rebate Hunter checkout (`PARITY_REF`), and without one it is skipped and the line is not printed. `node tests/run-all.mjs unit smoke` runs only the named ones. Each suite can also run on its own, and most take the names of single cases or groups as arguments.

| Suite | Kind | What it checks |
|---|---|---|
| `tokens` | Node | Vici's colours in both themes: every pair the app draws at its contrast, colour-blind separation (shared file; the app's pairs in `lib/prototype.mjs`) |
| `page-icon` | Node | `favicon.svg`, the header and the loading screen show the honeycomb in a lilac cell; with a checkout of Victor's website (VictorPflueger/VIP) next to the repository, its card has the same icon and kind (shared file) |
| `vici-files` | Node | `vici/` holds exactly the files its README lists (shared file) |
| `i18n` | Node | English and German: the same keys, no empty value, the same placeholders, every key asked for exists and is used, the static defaults in `index.html`, no sentence typed into the code |
| `unit` | Node | The streaming client and the cost maths, the eleven schemas and the validator, the formats, the catalogue's name matching, the API's errors as i18n keys, the choice of language, the golden copy for Diagnostics, the security policy and the storage keys in the files; the evidence check (provenance, quotes in fetched text or citations, the document registry, gating and corrections) and the sequence rules; from 0.3.0 the exports (`exports`): every pre-run's assessment JSON valid against the schema and broken copies refused, the audit rows valid, an imported export scored like the original, the HTML report with no external reference, the file names |
| `engine` | Node | The golden cases S1 to S4 within 1e-9 of their exact fractions and in both languages, the origin classes, no data is not zero, weights, fact keys |
| `audit` | Node | The fact audit on F01 to F29, the non-breaking-space variants, the cases of decisions D9 and D10, and edge cases |
| `runs` | Node | `tools/check-runs.mjs` passes all seventeen pre-runs, the brief's six, the five of decision D3, the self-assessment and the five of 1.0.0, three of which end without an assessment (each played in both languages along every lever choice), `index.html` loads each, and each of its rules catches its planted defect: a missing language, different placeholders, an audit failure, an unknown fact key, a block without evidence, an unknown URL, a long quote, a quote missing from `research/`, a key-like string, a thinking block |
| `hygiene` | Node | No private term and no e-mail address in any file the repository publishes (below) |
| `docs` | Node | The documents exist with their sections; every path and section they or the code name exists |
| `parity` | Node | The shared shell against Rebate Hunter's `main`: `vici/` byte for byte, every shared file identical after name normalisation, REVIEW.md names each adapted module with its reason. Needs a checkout: `node tests/parity.mjs <path>` or `PARITY_REF`; without one it is skipped |
| `smoke` | Chromium | First visit in English, `?lang=`, the switch without a reload across the shell, the catalogue and its suggestions (seventeen chips in three groups), Diagnostics in both languages, the intro, the tiles, a missing data file; from 0.3.0 Compare (`compare`), the Portfolio on the brief's case S4 loaded from files (`portfolio`), the four exports in both languages (`exports`) and the method view with its weights (`method`); from 1.0.0 the accessible names (`names`): each spider axis an image named with its label and value, each honeycomb cell named with its block, level and codes, in both languages, and every quote with its language in the evidence and the report |
| `accept` | Chromium | Storage keys over a whole session with a short live run, the key and its dialog (an accepted key starts the run), the security policy enforced, the mode dialog (Simulation for an entry with a pre-run, its reason for one without), the refusal inside a frame; from 1.0.0 a whole run by keyboard alone, every focused control with a visible focus ring and in view (`keyboard`) |
| `hexagon` | Chromium | Nothing round: the app's files, and the rendered app in both themes (shared file) |
| `live` | Chromium | The live agent against the API stand-in (`lib/fake-claude.mjs`), which streams server-tool blocks and checks every request: the protocol (blocks echoed unchanged, `pause_turn`, a mixed turn, in-result errors, the tools array), nudges, a switched-off web search and web fetch, the evidence check, the caps, the cost meter, the guardrails, "not a service", and the key in the audit export and a saved simulation |
| `sims` | Chromium | Every pre-run played in English and German (two plays per pre-run file, `SIMS PLAY OK (34 of 34, two per pre-run file)`): the SIMULATION badge and tape, the tiles and the spider equal to the engine's recomputation, memo and report in the run's language; the three that end without an assessment end done with that line, no block, figure or memo, their report with its sources, and an assessment export that says why; a correction with "Keep as is"; the map's views, mix and table; review (a reason required, corrections logged, Confirm and Skip); levers (Approve needs a choice, a what-if never changes the assessment) |
| `layout` | Chromium | At 1920×1080, 1600×900, 1536×864, 1366×768 and 1280×720, in both themes and both languages, a pre-run through seven states (idle, research, review, levers, the Outbox open, the drawer hidden, the block view): no horizontal overflow; the tiles inside the header, apart, none of their text cut; the spider's labels inside the diagram and apart, its level ticks clear of its labels and values, each value clear of its marker, nothing of the map cut at its panel's edge; an open drawer's panel beside the map, never over it; every visible target at least 40 px. The edges of a run at 1280×720 and 1366×768 in both languages, its first seconds with every layer still showing its status, the review, the end and the block view, for the Marktplatz, NOOTS, BundID and the three pre-runs that end without an assessment (`edges`); a run of thirty blocks at 1920×1080 and 1280×720 in both languages (`blocks30`), and the targets of the intro, the mode dialog, Diagnostics, the method view, Compare and the Portfolio (`targets`) |
| `design` | Chromium | The colour grammar in the running app in both themes (`grammar`): merlot for the person's step, the waiting status and the deciding buttons, lilac for every AI label, the fjord outline of a search that never fills, the levels on Vici's diverging scale with their numbers, the service in teal, a neutral tape; reduced motion stops the map's pulse, which animates without it (`motion`); captures of the review as rendered and under a projector washout and of the finished run with protanopia, deuteranopia and tritanopia (`review`) |

`tests/live_site.mjs` checks the published site after a Pages build (the "live site" workflow), and `tests/remote_head.mjs` that GitHub's `main` holds the local HEAD with nothing uncommitted.

## Setup for the browser suites

```
npm install -g playwright@1.56.0
npx playwright install chromium
NODE_PATH="$(npm root -g)" node tests/run-all.mjs
```

`CHROME_PATH` points the suites at another Chromium or Chrome; `SA_TEST_OUT` sets the folder for screenshots and result files (by default `sovereignty-assessment-tests` in the system's temporary folder).

## The private term list

`tests/hygiene.mjs` checks every published file against a private list of terms that must never appear in this public repository. The list never enters the repository. It is read from the `HYGIENE_TERMS` environment variable (a repository secret in CI), from the file `HYGIENE_TERMS_FILE` names, or from `../.hygiene-terms` next to the repository folder; one entry per line, "term<TAB>what it is". Without a list only the generic checks run and the suite says so: `HYGIENE GENERIC OK` instead of `HYGIENE OK`. CI runs without a list (TECH_NOTES §12); the build session runs with its own before every push.

## The golden cases

`fixtures/` holds the brief's section 11 as JSON, committed before the code that computes them. `data/golden.js` is their copy for Diagnostics in the browser: after any change to `fixtures/`, run `node tools/golden.mjs`, or `tests/unit.mjs` fails.
