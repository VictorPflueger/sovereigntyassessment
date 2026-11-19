# Tests

The app needs none of this: it is static files. The tests run on Node.js 22 without dependencies; the browser suites also need Playwright with Chromium. No test calls the real API or spends money: the browser suites answer api.anthropic.com with a stand-in, and every other host is refused.

## What runs

`node tests/run-all.mjs` runs every suite in order and, when all thirteen pass and none is skipped, ends with `ALL SUITES PASSED (13 of 13)`; parity needs a Rebate Hunter checkout (`PARITY_REF`), and without one it is skipped and the line is not printed. `node tests/run-all.mjs unit smoke` runs only the named ones. Each suite can also run on its own, and most take the names of single cases or groups as arguments.

| Suite | Kind | What it checks |
|---|---|---|
| `tokens` | Node | Vici's colours in both themes: every pair the app draws at its contrast, colour-blind separation (shared file; the app's pairs in `lib/prototype.mjs`) |
| `page-icon` | Node | `favicon.svg`, the header and the loading screen show the honeycomb in a lilac cell (shared file) |
| `vici-files` | Node | `vici/` holds exactly the files its README lists (shared file) |
| `i18n` | Node | English and German: the same keys, no empty value, the same placeholders, every key asked for exists and is used, the static defaults in `index.html`, no sentence typed into the code |
| `unit` | Node | The streaming client and the cost maths, the eleven schemas and the validator, the formats, the catalogue's name matching, the API's errors as i18n keys, the choice of language, the golden copy for Diagnostics, the security policy and the storage keys in the files |
| `engine` | Node | The golden cases S1 to S4 within 1e-9 of their exact fractions and in both languages, the origin classes, no data is not zero, weights, fact keys |
| `audit` | Node | The fact audit on F01 to F29, the non-breaking-space variants, the cases of decisions D9 and D10, and edge cases |
| `hygiene` | Node | No private term and no e-mail address in any file the repository publishes (below) |
| `docs` | Node | The documents exist with their sections; every path and section they or the code name exists |
| `parity` | Node | The shared shell against Rebate Hunter's `main`: `vici/` byte for byte, every shared file identical after name normalisation, REVIEW.md names each adapted module with its reason. Needs a checkout: `node tests/parity.mjs <path>` or `PARITY_REF`; without one it is skipped |
| `smoke` | Chromium | First visit in English, `?lang=`, the switch without a reload across the shell, the catalogue and its suggestions, Diagnostics in both languages, the intro, the tiles, a missing data file |
| `accept` | Chromium | Storage keys over a whole session, the key and its dialog, the security policy enforced, the mode dialog, the refusal inside a frame |
| `hexagon` | Chromium | Nothing round: the app's files, and the rendered app in both themes (shared file) |

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
