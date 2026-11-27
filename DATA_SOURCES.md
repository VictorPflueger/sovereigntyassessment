# Sovereignty Assessment: data sources

Version 2.1.0. Where the page's facts come from and when each source was opened with web tools. [research/sources.md](research/sources.md) lists every page, case by case; `research/<case>.md` holds every quote with its page and date.

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

`data/catalogue.js` holds sixteen services from the Deutschland-Stack's documents, the Serviceportal.NRW and this prototype, with names in both languages and starting pages read on 19, 20 or 27 November 2026. `data/ref_facts.js` holds six reference facts on app distribution, push messaging and the Federation's IT, each quoted in at most 150 characters from a page read on 19 November 2026.

## 4. The pre-runs

Eighteen runs written by hand in both languages, one per entry, as of 20 or 27 November 2026. Each cites only pages its research read, the catalogue lists or the reference facts hold; research/sources.md counts each run's pages and quotes. ZBDS, ZaPuK and low-code end without an assessment: their sources describe a component still in design, a target architecture and a category, not a running service.

For version 2.1.0, BundID, the Online ID, the EUDI wallet, FIT-Connect and ePayBL gained starting points for research: each stands on a page that names it as an alternative, quoted with the date read. The Serviceportal.NRW's run cites these pages:

| Page | Read |
|---|---|
| [GV. NRW. 2020 S. 1212, the portal's ordinance](https://recht.nrw.de/gvnrw/2020-s1212) | 2026-11-27 |
| [GV. NRW. 2025 S. 1138, its amendment](https://recht.nrw.de/gvnrw/2025-s1138) | 2026-11-27 |
| [The portal's imprint](https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f) | 2026-11-27 |
| [The state on signing in with the BundID](https://www.land.nrw/pressemitteilung/ministerin-scharrenbach-weniger-digitales-klein-klein-mehr-service-fuer) | 2026-11-27 |
| [Serviceportal 2.0, drupal.org](https://new.drupal.org/case-study/serviceportal-20) | 2026-11-27 |
| [The new Nordrhein-Westfalen-Portal](https://www.land.nrw/pressemitteilung/das-neue-nordrhein-westfalen-portal-wird-zentrale-anlaufstelle-fuer-digitale) | 2026-11-27 |
| [Press briefing on the new portal](https://www.land.nrw/node/25824) | 2026-11-27 |
| [IT.NRW's statute](https://recht.nrw.de/mblnrw/2021-s48) | 2026-11-27 |
| [Drupal Association, FAQ](https://www.drupal.org/association/faq) | 2026-11-27 |
| [BundID](https://id.bund.de/en/) | 2026-11-27 |
| [Telekom Multimedia Solutions, drupal.org](https://new.drupal.org/telekom-multimedia-solutions-gmbh) | 2026-11-27 |
| [Materna on the Serviceportal.NRW](https://www.materna.de/en/newshub/blog/verwaltung-digital/this-is-how-public-services-work-serviceportalnrw-as-a-one-stop-shop-for-all-administrative-matters/) | 2026-11-27 |
| [Lucom's imprint](https://www.lucom.com/impressum) | 2026-11-27 |
| [GSB 11, product sheet](https://produkt.gsb.bund.de/fileadmin/PDF/20250820_GSB_11_Produktblatt_final.pdf) | 2026-11-27 |
| [ekom21 in the Deutsche Verwaltungscloud](https://www.ekom21.de/infocenter/presse/2026/01-2026-ekom21-losungen-in-der-dvc.pdf?cid=5fy) | 2026-11-27 |

## 5. What the page doesn't use

No client, company or personal data, no tracking, and no fonts, scripts or styles from another site: Vici's fonts ship in `vici/`.
