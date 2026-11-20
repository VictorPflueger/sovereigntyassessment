# Sovereignty Assessment: data sources

What the app reads, where each bundled fact comes from, and when it was read. Every source below was opened with this build's web tools on the date given; nothing is from memory. Version 1.0.0, 20 November 2026.

**In one paragraph.** The app bundles three kinds of data: the method (the Deutschland-Stack's layers and criteria, the EU Cloud Sovereignty Framework's SEAL scale), the catalogue of sixteen services and this prototype with verified starting URLs, a first set of reference facts with verbatim quotes, and seventeen pre-runs for Simulation, one for every entry, with their research notes (§7). In Live mode the agent adds what Anthropic's server-side web search and web fetch return during the run; every finding names its source, and an unknown stays unknown. The golden cases of the tests (Musterdienst, Beispieldienst, Probeportal) are fictional.

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
| The same framework, re-read for the method view (version 0.3.0) | 2026-11-20 | The names of SEAL-0 to SEAL-4 as the method view shows them, with the source and the date read (TECH_NOTES.md §21) |
| European Union, EU countries: https://european-union.europa.eu/principles-countries-history/country-profiles_en and https://european-union.europa.eu/principles-countries-history/eu-countries_en?page=1 | 2026-11-19 | The 27 member states, so the 26 other than Germany in `js/classes.js` |

## 3. The catalogue (data/catalogue.js)

Seventeen entries, each with names in English and German, category, a one-line description, status and starting URLs: sixteen services and, from version 0.3.0, this prototype in the category `self_assessment`. Every URL below was opened with web fetch on 19 November 2026 (the prototype's on 20 November 2026), and each entry's description and status rest on what these pages say. Press sources are marked; official sources come first.

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
| This prototype (self-assessment, version 0.3.0) | https://github.com/VictorPflueger/sovereigntyassessment | GitHub - VictorPflueger/sovereigntyassessment | 2026-11-20 |
| This prototype (self-assessment, version 0.3.0) | https://docs.github.com/en/articles/about-github-pages | About GitHub Pages | 2026-11-20 |

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

No client, company or personal data; no tracking; no fonts, scripts or styles from another site (Vici's fonts ship in `vici/`); no open-data APIs called from the browser. The pre-run assessments of version 0.2.0 are researched from public sources, with every quote kept in the repository's research folder with its URL, title and the date it was read.

## 7. The pre-run assessments (data/runs/, research/)

Every one of the seventeen catalogue entries ships with a pre-run for Simulation, written by hand in both languages (`source: "hand_authored"`). The first six were written on 19 November 2026 (`as_of: "2026-11-19"`); the five of decision D3 and the self-assessment on 20 November 2026 (TECH_NOTES.md §18 and §19), and on the same day, for version 1.0.0, the five entries that until then had only a research note (`as_of: "2026-11-20"`). Three of those five, ZBDS, ZaPuK and low-code, end without an assessment: their sources describe a component still being designed, a target architecture and a category, not a service in operation, so they record a profile with its sources and no building block (TECH_NOTES.md §18). For the independent review of version 1.0.0 (REVIEW.md part 3), BundID, the Online ID and the Deutschland-App were revised on 20 November 2026 and carry that date: the AusweisApp's sentence was read again in full, and BundID's platform names Kubernetes's steward from three newly read sources. Each pre-run cites only pages its own research steps read, the catalogue lists or the reference facts hold. Every quote is listed verbatim under its URL in `research/<entry>.md` with the date read, and `tools/check-runs.mjs` sets each quote's verified flag from there (TECH_NOTES.md §16 and §17). The tables below name each pre-run's sources with the date read; the reference facts a pre-run uses are those of §4, verified when they were built.

### BundID (`data/runs/bundid.js`)

11 sources with 19 quotes; the reference facts on the Federation's IT and app distribution.

| Source | Language | Read |
|---|---|---|
| [BundID](https://id.bund.de/en/) | German | 2026-11-19 |
| [Die BundID: sicherer Zugang zu allen eServices \| Bundesagentur für Arbeit](https://www.arbeitsagentur.de/bundid) | German | 2026-11-19 |
| [ITZBund stärkt Digitalisierung und Zukunftsfähigkeit (SVA, Referenz)](https://www.sva.de/sites/default/files/2021-11/SVA%20Referenz%20ITZBund.pdf) | German | 2026-11-19 |
| [AusweisApp: About us](https://www.ausweisapp.bund.de/en/about-us) | English | 2026-11-20 |
| [AusweisApp: Open Source Software](https://www.ausweisapp.bund.de/en/open-source) | English | 2026-11-19 |
| [Copyright and trademarks - Apple Support](https://support.apple.com/guide/apple-invites/copyright-and-trademarks-dev2727afbbc/ios) | English | 2026-11-19 |
| [AusweisApp Bund App - App Store](https://apps.apple.com/us/app/id948660805) | English | 2026-11-19 |
| [Legal - Privacy Policy Affiliated Company - Apple](https://www.apple.com/legal/privacy/en/affiliated-company/) | English | 2026-11-19 |
| [GitHub - kubernetes/kubernetes: Production-Grade Container Scheduling and Management](https://github.com/kubernetes/kubernetes) | English | 2026-11-20 |
| [Who we are](https://cncf.io/about/who-we-are/) | English | 2026-11-20 |
| [Privacy Policy \| Linux Foundation](https://linuxfoundation.org/legal/privacy-policy) | English | 2026-11-20 |

### Deutschland-App (`data/runs/deutschland-app.js`)

8 sources with 16 quotes.

| Source | Language | Read |
|---|---|---|
| [Deutschland-App: Prototyp wird in sechs Kommunen erprobt](https://www.bundestag.de/1223070) | German | 2026-11-19 |
| [Wiesbaden becomes pilot municipality for Germany app](https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app) | English | 2026-11-19 |
| [SAP and Telekom develop central citizen app for Germany (heise online)](https://heise.de/-11247830) | English | 2026-11-19 |
| [Verwaltungsdigitalisierung: Vieles unklar bei der Deutschland-App (netzpolitik.org)](https://netzpolitik.org/2026/verwaltungsdigitalisierung-vieles-unklar-bei-der-deutschland-app/) | German | 2026-11-19 |
| [SAP: Erklärung zur Unternehmensführung 2025](https://ir-api.eqs.com//media/document/456cd775-917f-4e55-947e-2af8368267db/assets/sap-2025-ezu.pdf) | German | 2026-11-19 |
| [AusweisApp: About us](https://www.ausweisapp.bund.de/en/about-us) | English | 2026-11-20 |
| [About Wire](https://wire.com/en/about) | English | 2026-11-19 |
| [Deutschland-Stack: Wohin geht die Reise? (BMDS, Fachkongress des IT-Planungsrats)](https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf) | German | 2026-11-19 |

### Online-Ausweis (`data/runs/online-ausweis.js`)

11 sources with 16 quotes; the reference facts on app distribution.

| Source | Language | Read |
|---|---|---|
| [AusweisApp: About us](https://www.ausweisapp.bund.de/en/about-us) | English | 2026-11-20 |
| [eID Server](https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-server/eid-server-node.html) | English | 2026-11-19 |
| [BT-Drucksache 20/13075: Evolutionslösung für den elektronischen Personalausweis – eID](https://dserver.bundestag.de/btd/20/130/2013075.pdf) | German | 2026-11-19 |
| [AusweisApp: Open Source Software](https://www.ausweisapp.bund.de/en/open-source) | English | 2026-11-19 |
| [Online-Ausweis: Der ePerso ist tot, lange lebe der ePerso (netzpolitik.org)](https://netzpolitik.org/2026/online-ausweis-der-eperso-ist-tot-lange-lebe-der-eperso/) | German | 2026-11-19 |
| [D-Trust-BerCA für Diensteanbieter und eID-Service-Provider (Produktblatt)](https://www.d-trust.net/files/dokumente/pdf/produktblatt_berechtigungszertifikate.pdf) | German | 2026-11-19 |
| [BVA - Vergabestelle für Berechtigungszertifikate](https://www.bva.bund.de/DE/Services/Behoerden/Produkt/PA-VfB/pa-vfb_node.html) | German | 2026-11-19 |
| [Der neue Personalausweis – die Fakten auf einen Blick (BSI, via Stadt Düren)](https://onlinedienste.dueren.de/suche/-/vr-bis-detail/dokument/12224/download) | German | 2026-11-19 |
| [Copyright and trademarks - Apple Support](https://support.apple.com/guide/apple-invites/copyright-and-trademarks-dev2727afbbc/ios) | English | 2026-11-19 |
| [AusweisApp Bund App - App Store](https://apps.apple.com/us/app/id948660805) | English | 2026-11-19 |
| [Legal - Privacy Policy Affiliated Company - Apple](https://www.apple.com/legal/privacy/en/affiliated-company/) | English | 2026-11-19 |

### FIT-Connect (`data/runs/fit-connect.js`)

8 sources with 13 quotes.

| Source | Language | Read |
|---|---|---|
| [Einführung in FIT-Connect \| FIT-Connect](https://docs.fitko.de/fit-connect/docs/intro/) | German | 2026-11-19 |
| [FAQ \| FIT-Connect](https://docs.fitko.de/fit-connect/docs/faq/) | German | 2026-11-19 |
| [Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren \| CIO DE](https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html) | German | 2026-11-19 |
| [Global Access Internet Services GmbH (connect professional, Anbieterkompass)](https://www.connect-professional.de/anbieterkompass/global-access-internet-services-gmbh.8908004/index.html) | German | 2026-11-19 |
| [Maven Central: dev.fitko.fitconnect:sdk-client](https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client) | English | 2026-11-19 |
| [FIT-Connect Onepager (FITKO)](https://docs.fitko.de/fit-connect/assets/files/FITConnect_Onepager-1a613eda6435943cc90f0b214bc7321f.pdf) | German | 2026-11-19 |
| [About Sonatype \| Our Company & Mission \| Sonatype](https://sonatype.com/about) | English | 2026-11-19 |
| [Sonatype Relocates Headquarters to Maryland](https://www.sonatype.com/blog/2010/09/sonatype-headquarters-moves-to-maryland?hs_amp=true) | English | 2026-11-19 |

### ePayBL (`data/runs/epaybl.js`)

11 sources with 18 quotes.

| Source | Language | Read |
|---|---|---|
| [Online bezahlen in der öffentlichen Verwaltung - ePayBL](https://www.epaybl.de/) | German | 2026-11-19 |
| [38. OZG-Sprechstunde: Beantragungsprozess eines ePayBL-Mandanten, Basisdienst ePayLSA (Sachsen-Anhalt)](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf) | German | 2026-11-19 |
| [73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)](https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf) | German | 2026-11-19 |
| [Entwicklergemeinschaft ePay-Bund-Länder gewinnt den eGovernment Readers Choice Award 2024 in Gold](https://medienservice.sachsen.de/medien/news/1079912/download_pdf) | German | 2026-11-19 |
| [Wie schaffte es ePayBL zur Auszeichnung? Hinter den Kulissen eines Preisträgers (SID-Kundenforum)](https://www.sid.sachsen.de/download/SID_Kundenforum_2025_ORANGE_ePayBL.pdf) | German | 2026-11-19 |
| [Belgian banks join European Payments Initiative to expand Wero wallet across Europe (Reuters, via The Star)](https://www.thestar.com.my/tech/tech-news/2025/07/07/belgian-banks-join-european-payments-initiative-to-expand-wero-wallet-across-europe) | English | 2026-11-19 |
| [PayPal-Nutzungsbedingungen](https://www.paypal.com/de/webapps/mpp/ua/useragreement-emea-full) | German | 2026-11-19 |
| [Exhibit 21.01: Subsidiaries of PayPal Holdings, Inc. (SEC EDGAR)](https://www.sec.gov/Archives/edgar/data/1633917/000163391721000018/exhibit2101subsidiarylistf.htm) | English | 2026-11-19 |
| [PayPal Announces Strategic Reorganization to Accelerate Growth](https://newsroom.paypal-corp.com/2026-04-29-PayPal-Announces-Strategic-Reorganization-to-Accelerate-Growth) | English | 2026-11-19 |
| [Standardisierung ePayment-Lösung (Nordrhein-Westfalen)](https://www.mhkbd.nrw/system/files/media/document/file/standardisierung_epayment_v1_0.pdf) | German | 2026-11-19 |
| [Five Belgian Banks Join EPI to Bring Wero to Even More European Customers](https://epicompany.eu/media-insights/five-belgian-banks-join-epi-to-bring-wero-to-even-more-european-customers) | English | 2026-11-19 |

### Bundesportal (`data/runs/bundesportal.js`)

5 sources with 9 quotes; the reference facts on the Federation's IT.

| Source | Language | Read |
|---|---|---|
| [§ 9a EGovG - Einzelnorm](https://www.gesetze-im-internet.de/egovg/__9a.html) | German | 2026-11-19 |
| [Umsetzung des Onlinezugangsgesetzes (hib 1402/2020)](https://www.bundestag.de/presse/hib/814130-814130) | German | 2026-11-19 |
| [Deutschland-Stack, Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | German | 2026-11-19 |
| [BundID](https://id.bund.de/en/) | German | 2026-11-19 |
| [Deutschland-Stack: Wohin geht die Reise? (BMDS, Fachkongress des IT-Planungsrats)](https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf) | German | 2026-11-19 |

### EUDI Wallet (`data/runs/eudi-wallet.js`)

8 sources read, 7 of them with the 10 quotes cited; the reference facts on app distribution. The second heise report was read for the infrastructure layer, which the pre-run records as "no evidence found" without a quote.

| Source | Language | Read |
|---|---|---|
| [The national EUDI Wallet Project \| EUDI-Wallet](https://eudi-wallet.gov.de/en/about) | English | 2026-11-20 |
| [Demo of the EUDI wallet app: what the digital wallet can already do](https://heise.de/-10418753) | English | 2026-11-20 |
| [eID: German version of the EUDI wallet with cloud-based key storage](https://heise.de/-10417676) | English | 2026-11-20 |
| [d-you startet am 2. Januar 2027: Deutschlands digitale Identität](https://borncity.com/news/d-you-startet-am-2-januar-2027-deutschlands-digitale-identitaet/) | German | 2026-11-20 |
| [The digital ID in the EUDI Wallet \| EUDI-Wallet](https://eudi-wallet.gov.de/en/news/digitaler-ausweis) | English | 2026-11-20 |
| [FAQ zur EUDI-Wallet: Die wichtigsten Fragen und Antworten zur digitalen Brieftasche](https://netzpolitik.org/?p=512498) | German | 2026-11-20 |
| [Legal - Privacy Policy Affiliated Company - Apple](https://www.apple.com/legal/privacy/en/affiliated-company/) | English | 2026-11-20 |
| [Google Terms of Service – Privacy & Terms – Google](https://policies.google.com/terms) | English | 2026-11-20 |

### Mein Unternehmenskonto (`data/runs/muk.js`)

9 sources with 15 quotes.

| Source | Language | Read |
|---|---|---|
| [Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto](https://info.mein-unternehmenskonto.de/) | German | 2026-11-20 |
| [Verwaltungsvorschrift über die Betriebsbedingungen des einheitlichen Organisationskontos - Bürgerservice](https://www.gesetze-bayern.de/Content/Document/BayVV_206_D_12940/true) | German | 2026-11-20 |
| [BayMBl. 2022 Nr. 237 - Verkündungsplattform Bayern](https://www.verkuendung-bayern.de/baymbl/2022-237/) | German | 2026-11-20 |
| [Steuererklärung; Elektronische Übermittlung - BayernPortal](https://www.bayernportal.de/dokumente/leistung/8777623333) | German | 2026-11-20 |
| [Datenschutz bei ELSTER](https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf) | German | 2026-11-20 |
| [Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto](https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf) | German | 2026-11-20 |
| [AusweisApp: About us](https://www.ausweisapp.bund.de/en/about-us) | English | 2026-11-20 |
| [Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren \| CIO DE](https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html) | German | 2026-11-20 |
| [Deutschland-Stack, Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | German | 2026-11-20 |

### KIPITZ (`data/runs/kipitz.js`)

4 sources with 11 quotes; the reference facts on the Federation's IT.

| Source | Language | Read |
|---|---|---|
| [So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern](https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/) | German | 2026-11-20 |
| [Invisible Revolution: Federal Government Flooding Administration with AI](https://heise.de/-11127774) | English | 2026-11-20 |
| [SVA ist beim KI-Projekt des Bundes dabei \| ChannelPartner](https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html) | German | 2026-11-20 |
| [ITZBund treibt Multi-Cloud und KI voran \| CIO DE](https://www.cio.de/article/4068266/itzbund-treibt-multi-cloud-und-ki-voran.html) | German | 2026-11-20 |

### openCode (`data/runs/opencode.js`)

7 sources with 14 quotes.

| Source | Language | Read |
|---|---|---|
| [About openCode \| openCode.de](https://opencode.de/en/about-opencode) | English | 2026-11-20 |
| [Frequently asked questions \| openCode.de](https://opencode.de/en/frequently-asked-questions) | English | 2026-11-20 |
| [Data Privacy \| openCode.de](https://opencode.de/en/data-privacy) | English | 2026-11-20 |
| [GitLab To Announce Third Quarter Fiscal 2026 Financial Results](https://about.gitlab.com/press/releases/2025-11-18-gitlab-to-announce-third-quarter-2026-financial-results/) | English | 2026-11-20 |
| [Keycloak joins CNCF as an incubating project \| CNCF](https://www.cncf.io/blog/2023/04/11/keycloak-joins-cncf-as-an-incubating-project/) | English | 2026-11-20 |
| [Privacy Policy \| Linux Foundation](https://linuxfoundation.org/legal/privacy-policy) | English | 2026-11-20 |
| [Deutschland-Stack, Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | German | 2026-11-20 |

### German Administration Cloud (DVC) (`data/runs/dvc.js`)

6 sources with 12 quotes.

| Source | Language | Read |
|---|---|---|
| [Deutsche Verwaltungscloud – Startseite](https://www.deutsche-verwaltungscloud.de) | German | 2026-11-20 |
| [DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung](https://pretalx.com/public-it/talk/L93YNQ/) | German | 2026-11-20 |
| [Sechs Bundesländer starten Open-Source-Bildungsplattform \| ChannelPartner](https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html) | German | 2026-11-20 |
| [SVA ist beim KI-Projekt des Bundes dabei \| ChannelPartner](https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html) | German | 2026-11-20 |
| [Air Gapping: Bundesverwaltung vergibt Cloud-Großauftrag an Ionos \| CIO DE](https://www.cio.de/article/3696729/bundesverwaltung-vergibt-cloud-grossauftrag-an-ionos.html) | German | 2026-11-20 |
| [Deutschland-Stack, Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | German | 2026-11-20 |

### This prototype, the self-assessment (`data/runs/sovereignty-assessment.js`)

12 sources with 23 quotes; the README is cited both on the repository's front page and at the commit that added the maker's sentence.

| Source | Language | Read |
|---|---|---|
| [GitHub - VictorPflueger/sovereigntyassessment](https://github.com/VictorPflueger/sovereigntyassessment) | English | 2026-11-20 |
| [sovereigntyassessment/README.md at 67d20c3 · VictorPflueger/sovereigntyassessment](https://github.com/VictorPflueger/sovereigntyassessment/blob/67d20c38a6e57c565cf4c45180788d2bb059caf6/README.md) | English | 2026-11-20 |
| [About GitHub Pages](https://docs.github.com/en/articles/about-github-pages) | English | 2026-11-20 |
| [GitHub General Privacy Statement - GitHub Docs](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) | English | 2026-11-20 |
| [Microsoft to acquire GitHub for $7.5 billion](https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/) | English | 2026-11-20 |
| [Privacy Policy \ Anthropic](https://www.anthropic.com/privacy) | English | 2026-11-20 |
| [Data residency - Claude Platform Docs](https://platform.claude.com/docs/en/manage-claude/data-residency) | English | 2026-11-20 |
| [Tool reference - Claude Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference) | English | 2026-11-20 |
| [Vici Design System](https://victorpflueger.github.io/ViciDesign/index.html) | English | 2026-11-20 |
| [Google Terms of Service – Privacy & Terms – Google](https://policies.google.com/terms) | English | 2026-11-20 |
| [Google Chrome and ChromeOS Additional Terms of Service](https://www.google.com/intl/en/chrome/terms/) | English | 2026-11-20 |
| [Regional compliance \| Claude by Anthropic](https://claude.com/regional-compliance) | English | 2026-11-20 |

### NOOTS (National Once-Only Technical System) (`data/runs/noots.js`)

5 sources with 16 quotes.

| Source | Language | Read |
|---|---|---|
| [Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag](https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf) | German | 2026-11-20 |
| [NOOTS MVP v1.4.0](https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf) | German | 2026-11-20 |
| [Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag](https://www.bundestag.de/1232782) | German | 2026-11-20 |
| [Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren \| CIO DE](https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html) | German | 2026-11-20 |
| [IMPRESSUM - SEITENBAU](https://www.seitenbau.com/impressum) | German | 2026-11-20 |

### Marktplatz Deutschland Digital (MDD) (`data/runs/marktplatz-deutschland-digital.js`)

8 sources with 13 quotes.

| Source | Language | Read |
|---|---|---|
| [Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital](https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf) | German | 2026-11-20 |
| [Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb - Vergabeblog](https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/) | German | 2026-11-20 |
| [dbb magazin 10/2026 – Page 27](https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/) | German | 2026-11-20 |
| [Deutsche Verwaltungscloud – Startseite](https://www.deutsche-verwaltungscloud.de) | German | 2026-11-20 |
| [Die Deutsche Verwaltungscloud](https://www.fitko.de/fileadmin/fitko/veranstaltungen/die_fitko_stellt_vor/20241002_FSV_DVC_IV_Handout.pdf) | German | 2026-11-20 |
| [Sechs Bundesländer starten Open-Source-Bildungsplattform \| ChannelPartner](https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html) | German | 2026-11-20 |
| [Shopware 6: Vom klassischen Shopsystem zur E-Commerce-Plattform](https://t3n.de/news/shopware-6-version-1165877/) | German | 2026-11-20 |
| [Deutschland-Stack, Sachstand](https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf) | German | 2026-11-20 |

### ZBDS (central payment component) (`data/runs/zbds.js`)

2 sources with 4 quotes.

| Source | Language | Read |
|---|---|---|
| [Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes](https://dserver.bundestag.de/btd/21/090/2109020.pdf) | German | 2026-11-20 |
| [Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag](https://www.bundestag.de/1232782) | German | 2026-11-20 |

### ZaPuK (target architecture for mailbox and communication solutions) (`data/runs/zapuk.js`)

3 sources with 8 quotes.

| Source | Language | Read |
|---|---|---|
| [Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0](https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf) | German | 2026-11-20 |
| [Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes](https://dserver.bundestag.de/btd/21/090/2109020.pdf) | German | 2026-11-20 |
| [Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag](https://www.bundestag.de/1232782) | German | 2026-11-20 |

### Low-code and workflow automation (`data/runs/low-code.js`)

1 source with 4 quotes.

| Source | Language | Read |
|---|---|---|
| [Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat](https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf) | German | 2026-11-20 |
