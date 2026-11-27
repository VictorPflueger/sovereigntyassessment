/* Pre-run assessment of Serviceportal.NRW (hand-authored, as of 2026-11-27): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/serviceportal-nrw.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["serviceportal-nrw"] = {
 "id": "serviceportal-nrw",
 "entry_id": "serviceportal-nrw",
 "source": "hand_authored",
 "as_of": "2026-11-27",
 "method_version": "1.0",
 "query": "Serviceportal.NRW",
 "steps": [
  {
   "say": {
    "en": "I look the Serviceportal.NRW up in the catalogue, read its ordinance, its imprint and the state's announcements, and look for who built it and who runs it.",
    "de": "Ich schlage das Serviceportal.NRW im Katalog nach, lese seine Verordnung, sein Impressum und die Mitteilungen des Landes und suche, wer es gebaut hat und wer es betreibt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Serviceportal.NRW"
   }
  },
  {
   "fetch": {
    "url": "https://recht.nrw.de/gvnrw/2020-s1212",
    "title": "GV. NRW. 2020 S. 1212"
   }
  },
  {
   "fetch": {
    "url": "https://recht.nrw.de/gvnrw/2025-s1138",
    "title": "GV. NRW. 2025 S. 1138"
   }
  },
  {
   "fetch": {
    "url": "https://www.land.nrw/pressemitteilung/das-neue-nordrhein-westfalen-portal-wird-zentrale-anlaufstelle-fuer-digitale",
    "title": "Das neue Nordrhein-Westfalen-Portal wird zentrale Anlaufstelle für digitale Verwaltungsleistungen"
   }
  },
  {
   "fetch": {
    "url": "https://www.land.nrw/node/25824",
    "title": "Hybrides Pressegespräch zum neuen Nordrhein-Westfalen-Portal"
   }
  },
  {
   "fetch": {
    "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
    "title": "NRW Serviceportal - Impressum"
   }
  },
  {
   "fetch": {
    "url": "https://www.land.nrw/pressemitteilung/ministerin-scharrenbach-weniger-digitales-klein-klein-mehr-service-fuer",
    "title": "Weniger digitales Klein-Klein, mehr Service für Bürgerinnen und Bürger: Nordrhein-Westfalen setzt zukünftig auf Nutzerkonto des Bundes"
   }
  },
  {
   "fetch": {
    "url": "https://new.drupal.org/case-study/serviceportal-20",
    "title": "Serviceportal 2.0 | Drupal.org"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "Serviceportal.NRW",
     "NRW Serviceportal",
     "meineverwaltung.nrw"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "The administrative portal of North Rhine-Westphalia under the Online Access Act: a service portal through which the state's authorities provide electronic administrative services.",
     "de": "Das Verwaltungsportal des Landes Nordrhein-Westfalen nach dem Onlinezugangsgesetz: ein Dienstleistungsportal, über das die Behörden des Landes elektronische Verwaltungsleistungen bereitstellen."
    },
    "how": {
     "en": "The site is built on the open-source content management system Drupal; people sign in with the BundID, the Federation's user account, and can pay fees through ePayBL.",
     "de": "Die Website ist mit dem quelloffenen Content-Management-System Drupal gebaut; Menschen melden sich mit der BundID an, dem Nutzerkonto des Bundes, und können Gebühren über ePayBL bezahlen."
    },
    "owner": {
     "name": "Land Nordrhein-Westfalen, Ministerium für Heimat, Kommunales, Bau und Digitalisierung",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In operation at meineverwaltung.nrw. In March 2026 the state announced that a landing page of the new Nordrhein-Westfalen-Portal is to replace it, and in November 2026 it presented the new portal shortly before its start.",
     "de": "In Betrieb unter meineverwaltung.nrw. Im März 2026 kündigte das Land an, dass eine Landing-Page des neuen Nordrhein-Westfalen-Portals es ersetzen soll; im November 2026 stellte es das neue Portal kurz vor dem Start vor."
    },
    "legal_basis": {
     "en": "The Serviceportal.NRW-Verordnung under the E-Government Act of North Rhine-Westphalia, last amended in December 2025.",
     "de": "Die Serviceportal.NRW-Verordnung nach dem E-Government-Gesetz Nordrhein-Westfalen, zuletzt im Dezember 2025 geändert."
    },
    "evidence": [
     {
      "url": "https://recht.nrw.de/gvnrw/2020-s1212",
      "title": "GV. NRW. 2020 S. 1212",
      "quote": "„Serviceportal.NRW“ ist ein Verwaltungsportal im Sinne von § 2 Absatz 2 des Onlinezugangsgesetzes.",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/gvnrw/2025-s1138",
      "title": "GV. NRW. 2025 S. 1138",
      "quote": "Das Serviceportal.NRW dient dabei als Dienstleistungsportal zur Bereitstellung von elektronischen Verwaltungsleistungen",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/gvnrw/2020-s1212",
      "title": "GV. NRW. 2020 S. 1212",
      "quote": "Verordnung über den Betrieb und Ausgestaltung des Serviceportals.NRW gemäß § 5 a des E-Government-Gesetzes",
      "lang": "de",
      "supports": [
       "legal_basis"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/gvnrw/2025-s1138",
      "title": "GV. NRW. 2025 S. 1138",
      "quote": "Verordnung zur Änderung der Serviceportal.NRW-Verordnung",
      "lang": "de",
      "supports": [
       "legal_basis"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/gvnrw/2020-s1212",
      "title": "GV. NRW. 2020 S. 1212",
      "quote": "Die für die Bereitstellung und den Betrieb des Serviceportal.NRW zuständige Stelle ist das für Digitalisierung",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Land Nordrhein-Westfalen",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Ministerium für Heimat, Kommunales, Bau und Digitalisierung",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "40219 Düsseldorf",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Der Internetauftritt meineverwaltung.nrw ist auf Basis des Open-Source-Content-Management-Systems „Drupal“ erstellt worden.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://www.land.nrw/pressemitteilung/ministerin-scharrenbach-weniger-digitales-klein-klein-mehr-service-fuer",
      "title": "Weniger digitales Klein-Klein, mehr Service für Bürgerinnen und Bürger: Nordrhein-Westfalen setzt zukünftig auf Nutzerkonto des Bundes",
      "quote": "Bereits seit Beginn 2023 ist die Anmeldung mit dem Nutzerkonto des Bundes auf der zentralen Internet-Plattform des Landes",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://new.drupal.org/case-study/serviceportal-20",
      "title": "Serviceportal 2.0 | Drupal.org",
      "quote": "as well as administrative search engines, service accounts and the electronic payment method ePayBL.",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/gvnrw/2020-s1212",
      "title": "GV. NRW. 2020 S. 1212",
      "quote": "ermöglicht Serviceportal.NRW dem Nutzer die Einzahlung dieser Gebühr über ein elektronisches Zahlungsverfahren",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://www.land.nrw/pressemitteilung/das-neue-nordrhein-westfalen-portal-wird-zentrale-anlaufstelle-fuer-digitale",
      "title": "Das neue Nordrhein-Westfalen-Portal wird zentrale Anlaufstelle für digitale Verwaltungsleistungen",
      "quote": "Das bisherige „Serviceportal.NRW“ soll durch eine zentrale Landing-Page des „Nordrhein-Westfalen-Portals“ ersetzt werden.",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://www.land.nrw/pressemitteilung/das-neue-nordrhein-westfalen-portal-wird-zentrale-anlaufstelle-fuer-digitale",
      "title": "Das neue Nordrhein-Westfalen-Portal wird zentrale Anlaufstelle für digitale Verwaltungsleistungen",
      "quote": "Ein erster Prototyp wurde am Donnerstag, 5. März 2026, im Ausschuss für Bauen, Wohnen und Digitalisierung",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://www.land.nrw/node/25824",
      "title": "Hybrides Pressegespräch zum neuen Nordrhein-Westfalen-Portal",
      "quote": "Ein Zugang. Hunderte Verwaltungsleistungen. Für 18 Millionen Menschen. Das neue Nordrhein-Westfalen-Portal.",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://www.land.nrw/node/25824",
      "title": "Hybrides Pressegespräch zum neuen Nordrhein-Westfalen-Portal",
      "quote": "Kurz vor dem Start",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     }
    ]
   }
  },
  {
   "say": {
    "en": "Infrastructure: the imprint names IT.NRW for the portal's technical support. I read IT.NRW's statute.",
    "de": "Infrastruktur: Das Impressum nennt IT.NRW für die technische Betreuung des Portals. Ich lese die Betriebssatzung von IT.NRW."
   }
  },
  {
   "fetch": {
    "url": "https://recht.nrw.de/mblnrw/2021-s48",
    "title": "Betriebssatzung für den Landesbetrieb Information und Technik Nordrhein-Westfalen"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "Servers of IT.NRW",
     "de": "Server von IT.NRW"
    },
    "role": {
     "en": "Run the portal: the imprint names IT.NRW for its technical support, and IT.NRW provides and runs the data centre and server services of the state administration.",
     "de": "Betreiben das Portal: Das Impressum nennt IT.NRW für seine technische Betreuung, und IT.NRW stellt die Rechenzentrums- und Serverleistungen der Landesverwaltung bereit und betreibt sie."
    },
    "note": {
     "en": "No source read says in which data centre the portal runs.",
     "de": "Keine gelesene Quelle sagt, in welchem Rechenzentrum das Portal läuft."
    },
    "criticality": "critical",
    "tech": {
     "name": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "confidence": "medium",
    "evidence": [
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/mblnrw/2021-s48",
      "title": "Betriebssatzung für den Landesbetrieb Information und Technik Nordrhein-Westfalen",
      "quote": "stellt die Kommunikations- und IT-Infrastruktur (Landesverwaltungsnetz, Rechenzentrums- und Serverleistung)",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/mblnrw/2021-s48",
      "title": "Betriebssatzung für den Landesbetrieb Information und Technik Nordrhein-Westfalen",
      "quote": "für die Landesverwaltung zur Verfügung, betreibt diese Infrastruktur und entwickelt sie weiter",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://recht.nrw.de/mblnrw/2021-s48",
      "title": "Betriebssatzung für den Landesbetrieb Information und Technik Nordrhein-Westfalen",
      "quote": "Der Landesbetrieb hat seinen Sitz in Düsseldorf mit Standorten in Aachen, Hagen, Köln, Münster, Oberhausen und Paderborn.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     }
    ]
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "devsecops",
    "status": "no_evidence",
    "reason": {
     "en": "No source read describes how the portal is developed, tested and deployed; the case study on drupal.org says only that d-NRW and T-Systems MMS developed it.",
     "de": "Keine gelesene Quelle beschreibt, wie das Portal entwickelt, getestet und ausgerollt wird; die Fallstudie auf drupal.org sagt nur, dass d-NRW und T-Systems MMS es entwickelt haben."
    }
   }
  },
  {
   "say": {
    "en": "Platform: the imprint says the site is built on the open-source content management system Drupal. I read who stands behind Drupal.",
    "de": "Plattform: Laut Impressum ist die Website mit dem quelloffenen Content-Management-System Drupal gebaut. Ich lese, wer hinter Drupal steht."
   }
  },
  {
   "fetch": {
    "url": "https://www.drupal.org/association/faq",
    "title": "Frequently asked questions"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Content management system Drupal",
     "de": "Content-Management-System Drupal"
    },
    "role": {
     "en": "Carries the portal's pages and services.",
     "de": "Trägt die Seiten und Dienste des Portals."
    },
    "note": {
     "en": "Drupal is an open-source project; the association that supports it is based in the US. The imprint names IT.NRW for the technical support.",
     "de": "Drupal ist ein quelloffenes Projekt; der Verein, der es unterstützt, sitzt in den USA. Das Impressum nennt IT.NRW für die technische Betreuung."
    },
    "criticality": "critical",
    "tech": {
     "name": "Drupal community, supported by the Drupal Association",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "open_source",
    "exit": "unknown",
    "confidence": "medium",
    "evidence": [
     {
      "url": "https://www.drupal.org/association/faq",
      "title": "Frequently asked questions",
      "quote": "The Drupal Association is a US-based 501(c)(3) non-profit that supports the Drupal open source project.",
      "lang": "en",
      "supports": [
       "tech",
       "licence"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Der Internetauftritt meineverwaltung.nrw ist auf Basis des Open-Source-Content-Management-Systems „Drupal“ erstellt worden.",
      "lang": "de",
      "supports": [
       "licence"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://new.drupal.org/case-study/serviceportal-20",
      "title": "Serviceportal 2.0 | Drupal.org",
      "quote": "As a result, it has an open-source content management system based on Drupal, which ensures a modular structure.",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     }
    ]
   }
  },
  {
   "say": {
    "en": "Base services: people sign in with the BundID. I read the BundID's imprint again for who built it and who runs it.",
    "de": "Basisdienste: Menschen melden sich mit der BundID an. Ich lese das Impressum der BundID noch einmal darauf, wer sie gebaut hat und wer sie betreibt."
   }
  },
  {
   "fetch": {
    "url": "https://id.bund.de/en/",
    "title": "BundID"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Sign-in with the BundID",
     "de": "Anmeldung mit der BundID"
    },
    "role": {
     "en": "Proves a person's identity before they apply; the state joined the Federation's user account.",
     "de": "Weist die Identität einer Person nach, bevor sie einen Antrag stellt; das Land hat sich dem Nutzerkonto des Bundes angeschlossen."
    },
    "criticality": "critical",
    "tech": {
     "name": "Anstalt für Kommunale Datenverarbeitung in Bayern (AKDB)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Informationstechnikzentrum Bund (ITZBund)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "confidence": "high",
    "evidence": [
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Realisierung: Anstalt für Kommunale Datenverarbeitung in Bayern (AKDB)",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Laufender Betrieb: Informationstechnikzentrum Bund (ITZBund)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     }
    ]
   }
  },
  {
   "say": {
    "en": "Applications: the portal itself, which d-NRW and T-Systems MMS developed, and the online forms a contractor connected to it.",
    "de": "Anwendungen: das Portal selbst, das d-NRW und T-Systems MMS entwickelt haben, und die Onlineformulare, die ein Auftragnehmer daran angebunden hat."
   }
  },
  {
   "fetch": {
    "url": "https://new.drupal.org/telekom-multimedia-solutions-gmbh",
    "title": "Telekom Multimedia Solutions GmbH | Drupal.org"
   }
  },
  {
   "fetch": {
    "url": "https://www.materna.de/en/newshub/blog/verwaltung-digital/this-is-how-public-services-work-serviceportalnrw-as-a-one-stop-shop-for-all-administrative-matters/",
    "title": "This is how public services work: Serviceportal.NRW as a one-stop shop for all administrative matters"
   }
  },
  {
   "fetch": {
    "url": "https://www.lucom.com/impressum",
    "title": "Impressum - Lucom GmbH"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "Software of the Serviceportal.NRW",
     "de": "Software des Serviceportal.NRW"
    },
    "role": {
     "en": "Takes applications online and leads to the state's online services.",
     "de": "Nimmt Anträge online entgegen und führt zu den Onlinediensten des Landes."
    },
    "note": {
     "en": "The case study on drupal.org names d-NRW and T-Systems MMS as its developers.",
     "de": "Die Fallstudie auf drupal.org nennt d-NRW und T-Systems MMS als Entwickler."
    },
    "criticality": "critical",
    "tech": {
     "name": "d-NRW AöR and T-Systems MMS",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "confidence": "medium",
    "evidence": [
     {
      "url": "https://new.drupal.org/case-study/serviceportal-20",
      "title": "Serviceportal 2.0 | Drupal.org",
      "quote": "d-NRW and T-Systems MMS developed a serviceportal that enables applications to be electronically recorded",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://new.drupal.org/telekom-multimedia-solutions-gmbh",
      "title": "Telekom Multimedia Solutions GmbH | Drupal.org",
      "quote": "Headquartered in Dresden",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "d-NRW AöR",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "44137 Dortmund",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     }
    ]
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "Online forms on the Lucom Interaction Platform",
     "de": "Onlineformulare auf der Lucom Interaction Platform"
    },
    "role": {
     "en": "Hold the online forms that a contractor connected to the portal in its first phase.",
     "de": "Halten die Onlineformulare, die ein Auftragnehmer in der ersten Phase an das Portal angebunden hat."
    },
    "note": {
     "en": "The ordinance also names an application assistant built into the portal; no source read says who runs the forms platform today.",
     "de": "Die Verordnung nennt auch einen in das Portal eingebauten Antragsassistenten; keine gelesene Quelle sagt, wer die Formularplattform heute betreibt."
    },
    "criticality": "important",
    "tech": {
     "name": "Lucom GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "confidence": "low",
    "evidence": [
     {
      "url": "https://www.materna.de/en/newshub/blog/verwaltung-digital/this-is-how-public-services-work-serviceportalnrw-as-a-one-stop-shop-for-all-administrative-matters/",
      "title": "This is how public services work: Serviceportal.NRW as a one-stop shop for all administrative matters",
      "quote": "To this end, we implemented, amongst other things, interfaces to connect the Lucom Interaction Platform (LIP) to the portal",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://www.lucom.com/impressum",
      "title": "Impressum - Lucom GmbH",
      "quote": "FormsForWeb® und Lucom Interaction Platform® sind eingetragene Marken der Lucom GmbH, Erkrath.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     }
    ]
   }
  },
  {
   "say": {
    "en": "Interface and access: the website meineverwaltung.nrw in the browser.",
    "de": "Oberfläche und Zugang: die Website meineverwaltung.nrw im Browser."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "Website meineverwaltung.nrw",
     "de": "Website meineverwaltung.nrw"
    },
    "role": {
     "en": "The pages in the browser on which people find the state's administrative services.",
     "de": "Die Seiten im Browser, auf denen Menschen die Verwaltungsleistungen des Landes finden."
    },
    "criticality": "critical",
    "tech": {
     "name": "d-NRW AöR and T-Systems MMS",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "confidence": "medium",
    "evidence": [
     {
      "url": "https://new.drupal.org/case-study/serviceportal-20",
      "title": "Serviceportal 2.0 | Drupal.org",
      "quote": "d-NRW and T-Systems MMS developed a serviceportal that enables applications to be electronically recorded",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://new.drupal.org/telekom-multimedia-solutions-gmbh",
      "title": "Telekom Multimedia Solutions GmbH | Drupal.org",
      "quote": "Headquartered in Dresden",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "d-NRW AöR",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "44137 Dortmund",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     },
     {
      "url": "https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f",
      "title": "NRW Serviceportal - Impressum",
      "quote": "Landesbetrieb Information und Technik Nordrhein-Westfalen (IT.NRW)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-27"
     }
    ]
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. Apart from the content management system, the blocks are made and run in Germany; who runs the forms platform is a gap.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Bis auf das Content-Management-System werden die Bausteine in Deutschland hergestellt und betrieben; wer die Formularplattform betreibt, ist eine Lücke."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Six building blocks in five layers; development, security and operations have no evidence. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The content management system is at {{fact:seal.B-02}}: open source whose supporting association is based in the US. The forms platform is at {{fact:seal.B-05}} because no source names who runs it. Please check, correct or confirm.",
     "de": "Sechs Bausteine in fünf Ebenen; für Entwicklung, Sicherheit und Betrieb fehlen Belege. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Das Content-Management-System steht auf {{fact:seal.B-02}}: quelloffen, sein unterstützender Verein sitzt in den USA. Die Formularplattform steht auf {{fact:seal.B-05}}, weil keine Quelle nennt, wer sie betreibt. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-02",
     "B-05"
    ]
   }
  },
  {
   "say": {
    "en": "For the content management system and the forms platform I look for what public sources name as alternatives: starting points for research, not a recommendation.",
    "de": "Für das Content-Management-System und die Formularplattform suche ich, was öffentliche Quellen als Alternativen nennen: Ansatzpunkte für die Recherche, keine Empfehlung."
   }
  },
  {
   "fetch": {
    "url": "https://produkt.gsb.bund.de/fileadmin/PDF/20250820_GSB_11_Produktblatt_final.pdf",
    "title": "GSB 11 – Ein modernes CMS für die öffentliche Verwaltung auf Basis von TYPO3"
   }
  },
  {
   "fetch": {
    "url": "https://www.ekom21.de/infocenter/presse/2026/01-2026-ekom21-losungen-in-der-dvc.pdf?cid=5fy",
    "title": "ekom21-Lösungen in der Deutschen Verwaltungscloud"
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-02",
      "made_in": "DE"
     }
    ]
   }
  },
  {
   "tool": "ui_propose_levers",
   "input": {
    "levers": [
     {
      "lever_id": "L1",
      "title": {
       "en": "Build the portal's pages on a content management system made in Germany",
       "de": "Die Seiten des Portals auf einem in Deutschland hergestellten Content-Management-System aufbauen"
      },
      "rationale": {
       "en": "The site runs on an open-source content management system whose supporting association is based in the US. The federal administration provides a content management system of its own for public websites. With one made in Germany the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die Website läuft auf einem quelloffenen Content-Management-System, dessen unterstützender Verein in den USA sitzt. Die Bundesverwaltung stellt für öffentliche Webauftritte ein eigenes Content-Management-System bereit. Mit einem in Deutschland hergestellten läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-02",
        "made_in": "DE"
       }
      ],
      "evidence": [
       {
        "url": "https://produkt.gsb.bund.de/fileadmin/PDF/20250820_GSB_11_Produktblatt_final.pdf",
        "title": "GSB 11 – Ein modernes CMS für die öffentliche Verwaltung auf Basis von TYPO3",
        "quote": "Der Government Site Builder (GSB) 11 ist das zentrale Content-Management-System",
        "lang": "de",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       }
      ]
     }
    ],
    "starting_points": [
     {
      "block_id": "B-02",
      "name": "Government Site Builder (GSB) 11",
      "note": {
       "en": "The federal administration's content management system, built on the open-source TYPO3.",
       "de": "Das Content-Management-System der Bundesverwaltung, gebaut auf dem quelloffenen TYPO3."
      },
      "evidence": [
       {
        "url": "https://produkt.gsb.bund.de/fileadmin/PDF/20250820_GSB_11_Produktblatt_final.pdf",
        "title": "GSB 11 – Ein modernes CMS für die öffentliche Verwaltung auf Basis von TYPO3",
        "quote": "Der Government Site Builder (GSB) 11 ist das zentrale Content-Management-System",
        "lang": "de",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       }
      ]
     },
     {
      "block_id": "B-05",
      "name": "civento",
      "note": {
       "en": "A platform of ekom21 for administrative processes from application to approval, offered through the German Administration Cloud.",
       "de": "Eine Plattform der ekom21 für Verwaltungsprozesse vom Antrag bis zur Genehmigung, angeboten über die Deutsche Verwaltungscloud."
      },
      "evidence": [
       {
        "url": "https://www.ekom21.de/infocenter/presse/2026/01-2026-ekom21-losungen-in-der-dvc.pdf?cid=5fy",
        "title": "ekom21-Lösungen in der Deutschen Verwaltungscloud",
        "quote": "Bei der dritten ekom21-Lösung in der DVC handelt es sich um civento.",
        "lang": "de",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       },
       {
        "url": "https://www.ekom21.de/infocenter/presse/2026/01-2026-ekom21-losungen-in-der-dvc.pdf?cid=5fy",
        "title": "ekom21-Lösungen in der Deutschen Verwaltungscloud",
        "quote": "Die Digitalisierungsplattform bietet die Möglichkeit Verwaltungsprozesse von der Antragstellung bis zur Genehmigung",
        "lang": "de",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       }
      ]
     }
    ]
   }
  },
  {
   "memo": true
  },
  {
   "report": {
    "outcome": "assessed",
    "findings": {
     "en": "# Serviceportal.NRW: findings\n\nThe Serviceportal.NRW is the administrative portal of North Rhine-Westphalia at meineverwaltung.nrw; the state plans to replace it with a landing page of the new Nordrhein-Westfalen-Portal. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}. The six layers are the Deutschland-Stack's; the method applies to a state's platform as it does to a federal one.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): the imprint names IT.NRW for the technical support, and IT.NRW provides and runs the state administration's data centre and server services; no source read says in which data centre the portal runs.\n- **Development, security and operations**: no source read describes how the portal is developed, tested and deployed.\n- **Platform** ({{fact:score.layer.platform}}): the site is built on the open-source content management system Drupal, whose supporting association is based in the US.\n- **Base services** ({{fact:score.layer.base_service}}): people sign in with the BundID, implemented by the AKDB and run by the ITZBund; fees can be paid through ePayBL, whose maker and operator for this portal no source read names.\n- **Applications** ({{fact:score.layer.applications}}): d-NRW and T-Systems MMS developed the portal; online forms run on the Lucom Interaction Platform, whose operator no source read names.\n- **Interface and access** ({{fact:score.layer.access}}): the website meineverwaltung.nrw.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# Serviceportal.NRW: Befunde\n\nDas Serviceportal.NRW ist das Verwaltungsportal des Landes Nordrhein-Westfalen unter meineverwaltung.nrw; das Land will es durch eine Landing-Page des neuen Nordrhein-Westfalen-Portals ersetzen. Sein Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}. Die sechs Ebenen sind die des Deutschland-Stacks; die Methode gilt für die Plattform eines Landes wie für eine des Bundes.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): Das Impressum nennt IT.NRW für die technische Betreuung, und IT.NRW stellt die Rechenzentrums- und Serverleistungen der Landesverwaltung bereit und betreibt sie; keine gelesene Quelle sagt, in welchem Rechenzentrum das Portal läuft.\n- **Entwicklung, Sicherheit und Betrieb**: Keine gelesene Quelle beschreibt, wie das Portal entwickelt, getestet und ausgerollt wird.\n- **Plattform** ({{fact:score.layer.platform}}): Die Website ist mit dem quelloffenen Content-Management-System Drupal gebaut, dessen unterstützender Verein in den USA sitzt.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Menschen melden sich mit der BundID an, umgesetzt von der AKDB und betrieben vom ITZBund; Gebühren lassen sich über ePayBL bezahlen, dessen Hersteller und Betreiber für dieses Portal keine gelesene Quelle nennt.\n- **Anwendungen** ({{fact:score.layer.applications}}): d-NRW und T-Systems MMS haben das Portal entwickelt; Onlineformulare laufen auf der Lucom Interaction Platform, deren Betreiber keine gelesene Quelle nennt.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): die Website meineverwaltung.nrw.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} mit {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
