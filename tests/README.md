# Tests

The app needs none of this: it is static files. The tests run on Node.js 22 without dependencies; the browser suites also need Playwright with Chromium, and the Vici suite a checkout of ViciDesign next to the repository (`../ViciDesign`, or the folder in `VICI_DIR`). No test calls the real API or spends money: the live suite answers api.anthropic.com with a stand-in, and every other host is refused.

## What runs

`node tests/run-all.mjs` runs every suite in order and, when all sixteen pass and none is skipped, ends with `ALL SUITES PASSED (16 of 16)`. `node tests/run-all.mjs unit showcase` runs only the named ones, and `--require-vici` fails the Vici suite without a ViciDesign checkout instead of skipping it, as GitHub Actions does. Each suite can also run on its own, and most take the names of single cases or groups as arguments.

| Suite | Kind | What it checks |
|---|---|---|
| `tokens` | Node | Vici's colours in both themes: every pair the page draws at its contrast, the levels' colour-blind separation (the page's pairs in `lib/prototype.mjs`) |
| `page-icon` | Node | `favicon.svg`, the header and the loading screen show the honeycomb in a lilac cell; with Victor's website (VictorPflueger/VIP) next to the repository, its card has the same icon and kind |
| `i18n` | Node | English and German: the same keys, no empty value, the same placeholders, every key the page asks for exists and every key is asked for, the static defaults in `index.html`, no sentence typed into the page's own scripts, exclusive non-EU control named as its tile names it in every pre-run |
| `unit` | Node | The streaming client and the cost maths, the formats, the catalogue's name matching, the API's errors as i18n keys, the choice of language, the security policy and the storage keys, the evidence check and the sequence rules; and the presenter (`presenter`): every pre-run played in both languages into five steps with names, not ids, its tiles equal to the engine's figures recomputed from the gated blocks, and a partial score that says on how many of six layers it rests while the other figures wait |
| `engine` | Node | The golden cases S1 to S4 within 1e-9 of their exact fractions and in both languages, the origin classes, no data is not zero, weights, fact keys |
| `audit` | Node | The fact audit on F01 to F29, the non-breaking-space variants, the cases of decisions D9 and D10, and edge cases |
| `figures` | Node | The figures 2.1.0 adds, computed by `js/chain.js` and checked against an independent computation: section 3's six cases (`section3`), every assessed case's lower and unknown blocks (`all-cases`), the make-up and each layer's arithmetic (`makeup`), comparable services (`comparable`), starting points for the weak blocks (`starting-points`), and that the view modules compute nothing (`view-computes-nothing`) |
| `runs` | Node | `tools/check-runs.mjs` passes all eighteen pre-runs along every lever choice in both languages, `index.html` loads each, each rule catches its planted defect, and the starting points' rules catch theirs (`planted-starting-points`) |
| `fingerprint` | Node | The engine's rules equal version 1.0.0's files byte for byte; the fact audit, the evidence check, the guardrails, the agent with its prompt, tools and client, the simulation player, the catalogue, the reference facts, the pre-runs, their research notes and `js/chain.js` equal the 2.1.0 baseline in `lib/baseline.mjs`; the agent's settings in `js/config.js` and the texts the case modules ask for equal 1.0.0's |
| `lean` | Node | The presenter's modules and lines, one module that makes requests and one host it may call, the security policy, nothing of 1.0.0's console on the page or in its scripts, the docs' length |
| `hygiene` | Node | No private term and no e-mail address in any file the repository publishes (below) |
| `docs` | Node | The documents' length and sections; every path and section they or the code name exists; `research/sources.md` counts each pre-run's pages and quotes and lists the pages each cites, and each research note has a heading for every page its pre-run cites and lists only quotes it cites, or says why not (`docs`); the demo script's five minutes are the guide's talk track in English and German, with the review's six questions answered in both (`talk-track`); the Serviceportal.NRW's pages with their dates (`nrw-sources`); a reason in TECH_NOTES.md §25 for every pinned file 2.1.0 changed (`pinned`); REVIEW.md's cold read (`cold-read`, or one question: `cold-read q3`) |
| `vici` | Chromium | Vici's own checks (`guideProblems`, `bylineProblems`, `writingProblems`, `aiNoticeProblems`) on the page as served and as rendered in English and German, each first failing on a planted control; ViciDesign's own guide check, scripts/check-guide-render.mjs there, over http; the writing rules on every text the presenter writes on every path of the eighteen cases, on the dictionaries and on the docs; Vici's policy, live-run dialog, storage and stored-key checks on the page; `vici/` equal to ViciDesign at the commit its README and the workflow name |
| `hexagon` | Chromium | Nothing round: the app's files, and the rendered page in both themes through the guide, every step and decision of BundID, the case menu, Start agent and the German page |
| `showcase` | Chromium | The presenter against the engine's figures: the guide (`guide`), the tiles (`kpis`), partial figures (`partial`), the header (`header`), the Your turn bar (`turn`), Play (`play`), EN and DE in place (`lang`), no other host and no link to the repository (`network`), BundID offline (`offline`), the steps (`steps`), names, not ids or acronyms (`names`), Start agent and the AI notice (`start`), the keep list (`keep`), all eighteen cases (`cases`) and the layout at 1920×1080 and 1280×720 in both themes and both languages (`layout`), and 2.1.0's cases listed in its header (the weak links, the make-up, the alternatives, All services and Compare, the Serviceportal.NRW, the free replay, the criteria, the guide's figures); each case prints `SHOWCASE OK <case>` |
| `live` | Chromium | The live agent against the API stand-in (`lib/fake-claude.mjs`), started with Start agent and answered at the Your turn bar: the protocol and a whole assessment with LIVE, partial tiles mid-run, EN and DE while the agent works and the measured cost (`protocol`), nudges, a switched-off web search and web fetch, the evidence check, the caps, the cost, the guardrails with the Unchecked tag, a run that finds no service, the key held in memory only, nothing kept after a whole run (`nothing-kept`), and the measured cost on the tile (`cost-tile`) |

`tests/live_site.mjs` checks the published site after a Pages build (the "live site" workflow): the files it serves equal this checkout, and the page boots in both languages with BundID's figures and plays its simulation to the end.

## Setup for the browser suites

```
npm install -g playwright@1.56.0
npx playwright install chromium
git clone https://github.com/VictorPflueger/ViciDesign ../ViciDesign
NODE_PATH="$(npm root -g)" node tests/run-all.mjs
```

`CHROME_PATH` points the suites at another Chromium or Chrome; `SA_TEST_OUT` sets the folder for screenshots and result files (by default `sovereignty-assessment-tests` in the system's temporary folder).

## The private term list

`tests/hygiene.mjs` checks every published file against a private list of terms that must never appear in this public repository. The list never enters the repository. It is read from the `HYGIENE_TERMS` environment variable (a repository secret in CI), from the file `HYGIENE_TERMS_FILE` names, or from `../.hygiene-terms` next to the repository folder; one entry per line, "term<TAB>what it is". Without a list only the generic checks run and the suite says so: `HYGIENE GENERIC OK` instead of `HYGIENE OK`.

## The golden cases

`fixtures/` holds the brief's section 11 as JSON, committed before the code that computes them; `engine` and `audit` recompute them.
