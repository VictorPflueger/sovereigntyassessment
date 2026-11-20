# Tests

The app needs none of this: it is static files. The tests run on Node.js 22 without dependencies; the browser suites also need Playwright with Chromium. No test calls the real API or spends money: the browser suites answer api.anthropic.com with a stand-in, and every other host is refused.

## What runs

`node tests/run-all.mjs` runs every suite in order and, when all sixteen pass and none is skipped, ends with `ALL SUITES PASSED (16 of 16)`; parity needs a Rebate Hunter checkout (`PARITY_REF`), and without one it is skipped and the line is not printed. `node tests/run-all.mjs unit smoke` runs only the named ones. Each suite can also run on its own, and most take the names of single cases or groups as arguments.

| Suite | Kind | What it checks |
|---|---|---|
| `tokens` | Node | Vici's colours in both themes: every pair the app draws at its contrast, colour-blind separation (shared file; the app's pairs in `lib/prototype.mjs`) |
| `page-icon` | Node | `favicon.svg`, the header and the loading screen show the honeycomb in a lilac cell (shared file) |
| `vici-files` | Node | `vici/` holds exactly the files its README lists (shared file) |
| `i18n` | Node | English and German: the same keys, no empty value, the same placeholders, every key asked for exists and is used, the static defaults in `index.html`, no sentence typed into the code |
| `unit` | Node | The streaming client and the cost maths, the eleven schemas and the validator, the formats, the catalogue's name matching, the API's errors as i18n keys, the choice of language, the golden copy for Diagnostics, the security policy and the storage keys in the files; the evidence check (provenance, quotes in fetched text or citations, the document registry, gating and corrections) and the sequence rules; from 0.3.0 the exports (`exports`): every pre-run's assessment JSON valid against the schema and broken copies refused, the audit rows valid, an imported export scored like the original, the HTML report with no external reference, the file names |
| `engine` | Node | The golden cases S1 to S4 within 1e-9 of their exact fractions and in both languages, the origin classes, no data is not zero, weights, fact keys |
| `audit` | Node | The fact audit on F01 to F29, the non-breaking-space variants, the cases of decisions D9 and D10, and edge cases |
| `runs` | Node | `tools/check-runs.mjs` passes all twelve pre-runs, the brief's six, the five of decision D3 and the self-assessment (each played in both languages along every lever choice), `index.html` loads each, and each of its rules catches its planted defect: a missing language, different placeholders, an audit failure, an unknown fact key, a block without evidence, an unknown URL, a long quote, a quote missing from `research/`, a key-like string, a thinking block |
| `hygiene` | Node | No private term and no e-mail address in any file the repository publishes (below) |
| `docs` | Node | The documents exist with their sections; every path and section they or the code name exists |
| `parity` | Node | The shared shell against Rebate Hunter's `main`: `vici/` byte for byte, every shared file identical after name normalisation, REVIEW.md names each adapted module with its reason. Needs a checkout: `node tests/parity.mjs <path>` or `PARITY_REF`; without one it is skipped |
| `smoke` | Chromium | First visit in English, `?lang=`, the switch without a reload across the shell, the catalogue and its suggestions (seventeen chips in three groups), Diagnostics in both languages, the intro, the tiles, a missing data file; from 0.3.0 Compare (`compare`), the Portfolio on the brief's case S4 loaded from files (`portfolio`), the four exports in both languages (`exports`) and the method view with its weights (`method`) |
| `accept` | Chromium | Storage keys over a whole session with a short live run, the key and its dialog (an accepted key starts the run), the security policy enforced, the mode dialog (Simulation for an entry with a pre-run, its reason for one without), the refusal inside a frame |
| `hexagon` | Chromium | Nothing round: the app's files, and the rendered app in both themes (shared file) |
| `live` | Chromium | The live agent against the API stand-in (`lib/fake-claude.mjs`), which streams server-tool blocks and checks every request: the protocol (blocks echoed unchanged, `pause_turn`, a mixed turn, in-result errors, the tools array), nudges, a switched-off web search and web fetch, the evidence check, the caps, the cost meter, the guardrails, "not a service", and the key in the audit export and a saved simulation |
| `sims` | Chromium | Every pre-run played in English and German (two plays per pre-run file, `SIMS PLAY OK (24 of 24, two per pre-run file)`): the SIMULATION badge and tape, the tiles and the spider equal to the engine's recomputation, memo and report in the run's language; a correction with "Keep as is"; the map's views, mix and table; review (a reason required, corrections logged, Confirm and Skip); levers (Approve needs a choice, a what-if never changes the assessment) |

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
