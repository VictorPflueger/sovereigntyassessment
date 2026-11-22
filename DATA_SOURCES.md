# Sovereignty Assessment: data sources

Version 2.0.0. Where the page's facts come from and when each source was opened with web tools. [research/sources.md](research/sources.md) lists every page, case by case; `research/<case>.md` holds every quote with its page and date.

## 1. At run time

Only a live run calls out: Anthropic's API (`api.anthropic.com`) with your key, to check the key at no cost and to run the agent, whose web search and web fetch run on Anthropic's servers. The page's security policy allows no other host, and the simulation calls nothing.

## 2. The method

| Source | Read | Used for |
|---|---|---|
| [Deutschland-Stack, Aufbau](https://deutschland-stack.gov.de/aufbau/) | 2026-11-19 | The six layers and their order |
| [Deutschland-Stack, Kriterien](https://deutschland-stack.gov.de/kriterien/) | 2026-11-19 | The exit path between operators and providers; the preference for the European single market |
| [BMDS, Deutschland-Stack, Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | 2026-11-19 | The catalogue's services |
| [EU Cloud Sovereignty Framework v1.2.1](https://ppc.land/content/files/2025/11/Cloud-Sovereignty-Framework.pdf) (a copy; the Commission's own download was not opened) | 2026-11-19 | The SEAL scale 0 to 4; levels 0 and 1 as exclusive non-EU control |
| [EU countries](https://european-union.europa.eu/principles-countries-history/eu-countries_en?page=1) | 2026-11-19 | The 26 member states besides Germany (`js/classes.js`) |

## 3. The catalogue and the reference facts

`data/catalogue.js` holds sixteen services from the Deutschland-Stack's documents and this prototype, with names in both languages and starting pages read on 19 or 20 November 2026. `data/ref_facts.js` holds six reference facts on app distribution, push messaging and the Federation's IT, each quoted in at most 150 characters from a page read on 19 November 2026.

## 4. The pre-runs

Seventeen runs written by hand in both languages, one per entry, as of 20 November 2026. Each cites only pages its research read, the catalogue lists or the reference facts hold; research/sources.md counts each run's pages and quotes. ZBDS, ZaPuK and low-code end without an assessment: their sources describe a component still in design, a target architecture and a category, not a running service.

## 5. What the page doesn't use

No client, company or personal data, no tracking, and no fonts, scripts or styles from another site: Vici's fonts ship in `vici/`.
