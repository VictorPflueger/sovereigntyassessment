# Sovereignty Assessment: data sources

What the app reads, where each bundled fact comes from, and when it was read. Every source below was opened with this build's web tools on the date given; nothing is from memory. Version 0.1.0, 19 November 2026.

**In one paragraph.** The app bundles three kinds of data: the method (the Deutschland-Stack's layers and criteria, the EU Cloud Sovereignty Framework's SEAL scale), the catalogue of sixteen services with verified starting URLs, and a first set of reference facts with verbatim quotes. In Live mode (from version 0.2.0) the agent adds what Anthropic's server-side web search and web fetch return during the run; every finding names its source, and an unknown stays unknown. The golden cases of the tests (Musterdienst, Beispieldienst, Probeportal) are fictional.

---

## 1. Live data sources (called from the browser at run time)

| Service | Used for | Called when | Key |
|---|---|---|---|
| Anthropic Messages API (`api.anthropic.com/v1/messages`) | The live agent, with server-side web search and web fetch (version 0.2.0) | Live mode | Your own key, kept in this tab only |
| Anthropic Models API (`api.anthropic.com/v1/models`) | The free key check and the Diagnostics row | When you enter a key; Diagnostics | Your key (no tokens used); without a key, Diagnostics only checks that the API answers |

Nothing else. The page's security policy allows exactly one outside host, api.anthropic.com; web search and web fetch run on Anthropic's servers, so the browser itself never contacts the sites the agent reads.

## 2. The method

| Source | Read | Used for |
|---|---|---|
| Deutschland-Stack, Aufbau: https://deutschland-stack.gov.de/aufbau/ | 2026-11-19 | The six technical layers, their German labels and their order; the seventh layer as context |
| Deutschland-Stack, Kriterien: https://deutschland-stack.gov.de/kriterien/ | 2026-11-19 | The minimum criterion "Wechselfähigkeit zwischen Betreibern und Anbietern" (the exit path); the preference for the European single market (decision D2) |
| BMDS, Deutschland-Stack, Sachstand: https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf | 2026-11-19 | The catalogue's entries and the brief's quotes about them |
| European Commission, Cloud Sovereignty Framework v1.2.1, October 2025, read as a copy at https://ppc.land/content/files/2025/11/Cloud-Sovereignty-Framework.pdf; implementation guidance https://commission.europa.eu/document/download/2ad80a48-166f-4c77-a513-80c53ca2a128_en | 2026-11-19 | The SEAL scale from SEAL-0 "No Sovereignty" to SEAL-4 "Full Digital Sovereignty"; SEAL-0 and SEAL-1 as the levels of exclusive non-EU control. The Commission's own download of v1.2.1 was not opened in this build (it needed an approval that was not given) |
| European Union, EU countries: https://european-union.europa.eu/principles-countries-history/country-profiles_en and https://european-union.europa.eu/principles-countries-history/eu-countries_en?page=1 | 2026-11-19 | The 27 member states, so the 26 other than Germany in `js/classes.js` |

## 3. The catalogue (data/catalogue.js)

Sixteen entries, each with names in English and German, category, a one-line description, status and starting URLs. Every URL below was opened with web fetch on 19 November 2026, and each entry's description and status rest on what these pages say. Press sources are marked; official sources come first.

| Entry | Starting URL | Title | Read |
|---|---|---|---|
| BundID | https://id.bund.de/en/ | BundID | 2026-11-19 |
| BundID, NOOTS, ZBDS, ePayBL, KIPITZ, Low-code, Marktplatz Deutschland Digital, openCode, DVC, Bundesportal | https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf | Deutschland-Stack, Sachstand | 2026-11-19 |
| Online-Ausweis (eID) | https://www.ausweisapp.bund.de/en/about-us | AusweisApp: About us | 2026-11-19 |
| Online-Ausweis (eID) | https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-service/eid-service-node.html | eID Service | 2026-11-19 |
| EUDI-Wallet „d-you“ | https://eudi-wallet.gov.de/en | EUDI Wallet: Simple in everyday life. Secure for your data. \| EUDI-Wallet | 2026-11-19 |
| EUDI-Wallet „d-you“ (press, 13 September 2026) | https://borncity.com/news/d-you-startet-am-2-januar-2027-deutschlands-digitale-identitaet/ | d-you startet am 2. Januar 2027: Deutschlands digitale Identität | 2026-11-19 |
| MUK | https://info.mein-unternehmenskonto.de/ | Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto | 2026-11-19 |
| MUK | https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/Leitfaden_Organisationskonto_V1.0_49.Sprechstunde.pdf | Leitfaden zur Beschaffung und Verwaltung von ELSTER-Organisationszertifikaten | 2026-11-19 |
| FIT-Connect | https://docs.fitko.de/fit-connect/docs/intro/ | Einführung in FIT-Connect \| FIT-Connect | 2026-11-19 |
| FIT-Connect | https://docs.fitko.de/fit-connect/docs/faq/ | FAQ \| FIT-Connect | 2026-11-19 |
| NOOTS | https://noots.gov.de/ | NOOTS – das Nationale Once-Only-Technical-System - Wissensplattform | 2026-11-19 |
| ZaPuK | https://www.fitko.de/fileadmin/fitko/veranstaltungen/die_fitko_stellt_vor/20260116-Handout_FITKO_stellt_vor_ZaPuK.pdf | Die FITKO stellt vor: Zielarchitektur für Postfach- und Kommunikationslösungen (ZaPuK), Handout 16.01.2026 | 2026-11-19 |
| ZaPuK | https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf | Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0 | 2026-11-19 |
| ZBDS | https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf | Deutschland-Stack – Wohin geht die Reise? | 2026-11-19 |
| ePayBL | https://www.epaybl.de/ | Online bezahlen in der öffentlichen Verwaltung - ePayBL | 2026-11-19 |
| KIPITZ | https://www.bundestag.de/presse/hib/kurzmeldungen-1202030 | Bundesverwaltung nutzt KI als unterstützendes Werkzeug | 2026-11-19 |
| Low-code and workflow automation | https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf | Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat | 2026-11-19 |
| Marktplatz Deutschland Digital | https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf | Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital | 2026-11-19 |
| Marktplatz Deutschland Digital (press, 24 March 2026, citing govdigital eG) | https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/ | Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb | 2026-11-19 |
| openCode | https://opencode.de/en/about-opencode | About openCode \| openCode.de | 2026-11-19 |
| DVC | https://bmi.bund.de/SharedDocs/pressemitteilungen/EN/2025/03/dvc.html | Germany launches government cloud | 2026-11-19 |
| DVC | https://www.deutsche-verwaltungscloud.de | Deutsche Verwaltungscloud – Startseite | 2026-11-19 |
| Bundesportal | https://verwaltung.bund.de/portal/EN/ueber | Bundesportal \| What is the Federal Portal? | 2026-11-19 |
| Bundesportal | https://www.gesetze-im-internet.de/egovg/__9a.html | § 9a EGovG - Einzelnorm | 2026-11-19 |
| Deutschland-App | https://www.bundestag.de/1223070 | Deutschland-App: Prototyp wird in sechs Kommunen erprobt | 2026-11-19 |
| Deutschland-App | https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app | Wiesbaden becomes pilot municipality for Germany app | 2026-11-19 |

**Two readings to know.** The BMDS document lists "DVC" among the best practices of federal cooperation without spelling it out; the catalogue reads it as the Deutsche Verwaltungscloud, which the BMI's press release calls "DVC". The document writes "D-APP" where the catalogue says Deutschland-App, and "Onlineausweis" where it says Online-Ausweis. ZBDS has no page of its own that this build found: the entry rests on the BMDS's two Deutschland-Stack documents and says so.

## 4. Reference facts (data/ref_facts.js)

Each fact carries a verbatim quote of at most 150 characters, read on its page with web fetch.

| Fact | Topic | Source | Title | Read |
|---|---|---|---|---|
| RF-01, RF-02 | Push messaging | https://developer.apple.com/documentation/usernotifications/setting-up-a-remote-notification-server.md | Setting up a remote notification server | 2026-11-19 |
| RF-03, RF-04 | App distribution | https://support.apple.com/en-mide/118110 | About alternative app distribution - Apple Support | 2026-11-19 |
| RF-05 | Federal IT | https://bmds.bund.de/fileadmin/BMDS/Dokumente/AM_Gesamtarchitektur.pdf | Gesamtarchitektur für die Dienstekonsolidierung der IT des Bundes | 2026-11-19 |
| RF-06 | Federal IT | https://www.bundestag.de/presse/hib/kurzmeldungen-1202030 | Bundesverwaltung nutzt KI als unterstützendes Werkzeug | 2026-11-19 |

## 5. The golden cases (tests/fixtures/)

The brief's section 11, unchanged: the level rules R01 to R13, the assessment "Musterdienst", the levers L1 and L2, the portfolio with "Beispieldienst" and "Probeportal", and the fact-audit cases F01 to F29. All of them are fictional. For Beispieldienst and Probeportal the brief gives only the levels of their critical blocks; the fixture gives each a set of fictional blocks that yields exactly those levels, and the engine test checks that it does.

`data/golden.js` is an exact copy of these files for Diagnostics, which recomputes them in the presenter's browser: the security policy allows no fetch from the page's own origin, so the cases ship as a module. `tools/golden.mjs` writes it, and `tests/unit.mjs` fails when the copy and the fixtures differ.

## 6. What the app does not use

No client, company or personal data; no tracking; no fonts, scripts or styles from another site (Vici's fonts ship in `vici/`); no open-data APIs called from the browser. The pre-run assessments of version 0.2.0 are researched from public sources, with every quote kept in `research/` with its URL, title and the date it was read.
