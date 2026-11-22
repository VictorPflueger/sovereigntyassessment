# Sovereignty Assessment: data sources

Version 2.0.0. What the page reads, where its bundled facts come from and when they were read. Every source was opened with web tools on the date given; nothing is from memory. The full lists, case by case, are in [research/sources.md](research/sources.md), and every quote with its page and date in `research/<case>.md`.

## 1. At run time

In a live run only, the page calls Anthropic's API (`api.anthropic.com`) with your key: the models list to check the key, at no cost, and the Messages API for the agent, whose web search and web fetch run on Anthropic's servers. Nothing else: the page's security policy allows that one outside host, and the simulation calls nothing at all.

## 2. The method

| Source | Read | Used for |
|---|---|---|
| [Deutschland-Stack, Aufbau](https://deutschland-stack.gov.de/aufbau/) | 2026-11-19 | The six layers and their order |
| [Deutschland-Stack, Kriterien](https://deutschland-stack.gov.de/kriterien/) | 2026-11-19 | The exit path between operators and providers; the preference for the European single market |
| [BMDS, Deutschland-Stack, Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | 2026-11-19 | The catalogue's services |
| [EU Cloud Sovereignty Framework v1.2.1](https://ppc.land/content/files/2025/11/Cloud-Sovereignty-Framework.pdf) (a copy; the Commission's own download was not opened) | 2026-11-19 | The SEAL scale 0 to 4, and levels 0 and 1 as exclusive non-EU control |
| [EU countries](https://european-union.europa.eu/principles-countries-history/eu-countries_en?page=1) | 2026-11-19 | The 26 member states besides Germany, in `js/classes.js` |

## 3. The catalogue and the reference facts

`data/catalogue.js` holds seventeen entries: sixteen services from the Deutschland-Stack's documents and this prototype, each with names in both languages and starting pages read on 19 or 20 November 2026 (listed in [research/sources.md](research/sources.md)). `data/ref_facts.js` holds six reference facts on app distribution, push messaging and the Federation's IT, each with a quote of at most 150 characters from Apple's, the BMDS's or the Bundestag's pages, read on 19 November 2026.

## 4. The pre-runs

One hand-written run per entry, in both languages, as of 20 November 2026. Pages and quotes count what each run cites besides the reference facts.

| Case | Pages | Quotes | Note |
|---|---|---|---|
| BundID | 10 | 19 | [bundid.md](research/bundid.md) |
| Online ID | 9 | 16 | [online-ausweis.md](research/online-ausweis.md) |
| EUDI Wallet | 7 | 10 | [eudi-wallet.md](research/eudi-wallet.md) |
| Business account (MUK) | 9 | 15 | [muk.md](research/muk.md) |
| FIT-Connect | 8 | 14 | [fit-connect.md](research/fit-connect.md) |
| NOOTS | 5 | 16 | [noots.md](research/noots.md) |
| ePayBL | 10 | 17 | [epaybl.md](research/epaybl.md) |
| ZBDS | 2 | 4 | [zbds.md](research/zbds.md) |
| ZaPuK | 3 | 7 | [zapuk.md](research/zapuk.md) |
| KIPITZ | 4 | 11 | [kipitz.md](research/kipitz.md) |
| Low-code | 1 | 4 | [low-code.md](research/low-code.md) |
| Marktplatz Deutschland Digital | 8 | 14 | [marktplatz-deutschland-digital.md](research/marktplatz-deutschland-digital.md) |
| openCode | 7 | 14 | [opencode.md](research/opencode.md) |
| German Administration Cloud | 6 | 12 | [dvc.md](research/dvc.md) |
| Federal Portal | 5 | 9 | [bundesportal.md](research/bundesportal.md) |
| Deutschland-App | 8 | 16 | [deutschland-app.md](research/deutschland-app.md) |
| This prototype | 12 | 23 | [sovereignty-assessment.md](research/sovereignty-assessment.md) |

ZBDS, ZaPuK and low-code end without an assessment: their sources describe a component still being designed, a target architecture and a category, not a service in operation.

## 5. What the page doesn't use

No client, company or personal data, no tracking, and no fonts, scripts or styles from another site: Vici's fonts ship in `vici/`.
