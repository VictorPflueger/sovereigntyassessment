/* Pre-run assessment of Deutschland-App (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/deutschland-app.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["deutschland-app"] = {
 "id": "deutschland-app",
 "entry_id": "deutschland-app",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "Deutschland-App",
 "steps": [
  {
   "say": {
    "en": "I look the Deutschland-App up in the catalogue and read the Bundestag's report on the Federal Government's answer, a pilot municipality's announcement and the press reports on who builds and runs the app.",
    "de": "Ich schlage die Deutschland-App im Katalog nach und lese die Meldung des Bundestages zur Antwort der Bundesregierung, die Mitteilung einer Pilotkommune und die Presseberichte dazu, wer die App baut und betreibt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Deutschland-App"
   }
  },
  {
   "fetch": {
    "url": "https://www.bundestag.de/1223070",
    "title": "Deutschland-App: Prototyp wird in sechs Kommunen erprobt"
   }
  },
  {
   "fetch": {
    "url": "https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app",
    "title": "Wiesbaden becomes pilot municipality for Germany app"
   }
  },
  {
   "search": {
    "query": "Deutschland-App SAP Telekom Schwarz Digits Wire Bürger-App",
    "results": [
     {
      "url": "https://www.techbook.de/mobile-lifestyle/apps/deutschland-app-amt-services",
      "title": "Zum Inhalt springen"
     },
     {
      "url": "https://stock3.com/news/sap-und-telekom-sollen-die-buerger-app-bauen-17008647",
      "title": "sap und telekom sollen die buerger app bauen 17008647"
     },
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany"
     },
     {
      "url": "https://netzpolitik.org/2026/verwaltungsdigitalisierung-vieles-unklar-bei-der-deutschland-app/",
      "title": "2026-10-16 964 82"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://heise.de/-11247830",
    "title": "SAP and Telekom develop central citizen app for Germany (heise online)"
   }
  },
  {
   "fetch": {
    "url": "https://netzpolitik.org/2026/verwaltungsdigitalisierung-vieles-unklar-bei-der-deutschland-app/",
    "title": "Verwaltungsdigitalisierung: Vieles unklar bei der Deutschland-App (netzpolitik.org)"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "Deutschland-App",
     "Bürger-App"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "The Federation's planned app for finding and applying for administrative services in family benefits, housing, social affairs and starting a business.",
     "de": "Die geplante App des Bundes, um Verwaltungsleistungen aus Familienleistungen, Wohnen, Sozialem und Unternehmensgründung zu finden und zu beantragen."
    },
    "how": {
     "en": "A prototype is tested in six pilot municipalities with a limited number of users; people are to identify themselves with the eID function of the identity card, among other means.",
     "de": "Ein Prototyp wird in sechs Pilotkommunen mit wenigen Nutzenden erprobt; die Identifikation soll unter anderem über die eID-Funktion des Personalausweises laufen."
    },
    "owner": {
     "name": "Bundesrepublik Deutschland (Bund)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Deutsche Telekom AG",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "Prototype in a pilot, not in the app stores.",
     "de": "Prototyp im Pilotbetrieb, nicht in den App-Stores."
    },
    "evidence": [
     {
      "url": "https://www.bundestag.de/1223070",
      "title": "Deutschland-App: Prototyp wird in sechs Kommunen erprobt",
      "quote": "Verwaltungsleistungen aus den Bereichen Familienleistungen, Wohnen, Soziales und Unternehmensgründung abdecken",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.bundestag.de/1223070",
      "title": "Deutschland-App: Prototyp wird in sechs Kommunen erprobt",
      "quote": "Die Identifikation und Authentifizierung solle unter anderem über die eID-Funktion des Personalausweises möglich sein.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app",
      "title": "Wiesbaden becomes pilot municipality for Germany app",
      "quote": "Access to the test phase is temporary, limited to the pilot municipalities, and intended only for a limited number of users.",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.bundestag.de/1223070",
      "title": "Deutschland-App: Prototyp wird in sechs Kommunen erprobt",
      "quote": "Für die Entwicklung des Prototyps sei die T-Systems International GmbH als Generalunternehmerin beauftragt worden",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app",
      "title": "Wiesbaden becomes pilot municipality for Germany app",
      "quote": "The Deutschland App is currently not available in app stores.",
      "lang": "en",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "Telekom will be responsible for the operational management",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ]
   }
  },
  {
   "say": {
    "en": "Infrastructure: the Federal Government's answer names no hosting; the press reports name T-Systems for the cloud and data storage.",
    "de": "Infrastruktur: Die Antwort der Bundesregierung nennt kein Hosting; die Presseberichte nennen T-Systems für Cloud und Datenspeicherung."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "Cloud and data storage of T-Systems",
     "de": "Cloud und Datenspeicherung bei T-Systems"
    },
    "role": {
     "en": "Hosts the app's software and stores its data.",
     "de": "Betreibt die Software der App und speichert ihre Daten."
    },
    "note": {
     "en": "Reported by heise; the Federal Government's answer names no hosting, and no source read says where the data centres are.",
     "de": "So berichtet heise; die Antwort der Bundesregierung nennt kein Hosting, und keine gelesene Quelle sagt, wo die Rechenzentren stehen."
    },
    "criticality": "critical",
    "tech": {
     "name": "T-Systems International GmbH",
     "country": "DE",
     "parent": {
      "name": "Deutsche Telekom AG",
      "country": "DE"
     }
    },
    "operator": {
     "name": "T-Systems International GmbH",
     "country": "DE",
     "parent": {
      "name": "Deutsche Telekom AG",
      "country": "DE"
     }
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "its subsidiary T-Systems will handle the cloud infrastructure and data storage.",
      "lang": "en",
      "supports": [
       "tech",
       "operator",
       "tech.parent",
       "operator.parent"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "low"
   }
  },
  {
   "say": {
    "en": "Development, security and operations: the Federal Government names T-Systems as general contractor.",
    "de": "Entwicklung, Sicherheit und Betrieb: Die Bundesregierung nennt T-Systems als Generalunternehmerin."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Development by the general contractor T-Systems",
     "de": "Entwicklung durch die Generalunternehmerin T-Systems"
    },
    "role": {
     "en": "Develops the prototype and chooses the further subcontractors and suppliers.",
     "de": "Entwickelt den Prototyp und wählt die weiteren Nachunternehmer und Lieferanten aus."
    },
    "note": {
     "en": "According to netzpolitik.org, the Federal Government's answer says nothing about the parts of SAP and Schwarz Digits.",
     "de": "Laut netzpolitik.org sagt die Antwort der Bundesregierung nichts zur Rolle von SAP und Schwarz Digits."
    },
    "criticality": "critical",
    "tech": {
     "name": "T-Systems International GmbH",
     "country": "DE",
     "parent": {
      "name": "Deutsche Telekom AG",
      "country": "DE"
     }
    },
    "operator": {
     "name": "T-Systems International GmbH",
     "country": "DE",
     "parent": {
      "name": "Deutsche Telekom AG",
      "country": "DE"
     }
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.bundestag.de/1223070",
      "title": "Deutschland-App: Prototyp wird in sechs Kommunen erprobt",
      "quote": "Für die Entwicklung des Prototyps sei die T-Systems International GmbH als Generalunternehmerin beauftragt worden",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.bundestag.de/1223070",
      "title": "Deutschland-App: Prototyp wird in sechs Kommunen erprobt",
      "quote": "Weitere Nachunternehmer und Lieferanten wähle und steuere T-Systems.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "its subsidiary T-Systems will handle the cloud infrastructure and data storage.",
      "lang": "en",
      "supports": [
       "tech.parent",
       "operator.parent"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Platform: the press names SAP's Business Technology Platform. I check where SAP has its seat.",
    "de": "Plattform: Die Presse nennt die Business Technology Platform von SAP. Ich prüfe, wo SAP seinen Sitz hat."
   }
  },
  {
   "search": {
    "query": "SAP SE Walldorf Impressum sap.com",
    "results": [
     {
      "url": "https://www.sap.com/germany/about/legal/impressum.html",
      "title": "www.sap.com"
     },
     {
      "url": "https://www.sap.com/germany/about/legal/impressum-se.html",
      "title": "Legal Disclosure - SAP SE"
     },
     {
      "url": "https://ir-api.eqs.com//media/document/456cd775-917f-4e55-947e-2af8368267db/assets/sap-2025-ezu.pdf",
      "title": "sap 2025 ezu"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://ir-api.eqs.com//media/document/456cd775-917f-4e55-947e-2af8368267db/assets/sap-2025-ezu.pdf",
    "title": "SAP: Erklärung zur Unternehmensführung 2025",
    "pdf": true
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "SAP Business Technology Platform",
     "de": "SAP Business Technology Platform"
    },
    "role": {
     "en": "The technical platform on which the app is built.",
     "de": "Die technische Plattform, auf der die App gebaut wird."
    },
    "note": {
     "en": "Reported by heise and netzpolitik.org; the Federal Government's answer does not confirm SAP's part. Telekom is to be responsible for operations.",
     "de": "So berichten heise und netzpolitik.org; die Antwort der Bundesregierung bestätigt die Rolle von SAP nicht. Die Telekom soll für den Betrieb verantwortlich sein."
    },
    "criticality": "critical",
    "tech": {
     "name": "SAP SE",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Deutsche Telekom AG",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "SAP's Business Technology Platform (BTP) will serve as the technical platform for the app",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://netzpolitik.org/2026/verwaltungsdigitalisierung-vieles-unklar-bei-der-deutschland-app/",
      "title": "Verwaltungsdigitalisierung: Vieles unklar bei der Deutschland-App (netzpolitik.org)",
      "quote": "Im Mai wurde bekannt, dass die Telekom mit dem Software-Hersteller SAP zusammenarbeiten will.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://ir-api.eqs.com//media/document/456cd775-917f-4e55-947e-2af8368267db/assets/sap-2025-ezu.pdf",
      "title": "SAP: Erklärung zur Unternehmensführung 2025",
      "quote": "Als SE mit Sitz in Walldorf, Deutschland, unterliegt SAP den europäischen und deutschen SE-Regelungen",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "Telekom will be responsible for the operational management",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "low"
   }
  },
  {
   "say": {
    "en": "Base services: signing in with the identity card, and a messenger as the channel to the authorities.",
    "de": "Basisdienste: die Anmeldung mit dem Personalausweis und ein Messenger als Kanal zu den Behörden."
   }
  },
  {
   "fetch": {
    "url": "https://www.ausweisapp.bund.de/en/about-us",
    "title": "AusweisApp: About us"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Sign-in with the online ID",
     "de": "Anmeldung mit dem Online-Ausweis"
    },
    "role": {
     "en": "Proves a person's identity in the app.",
     "de": "Weist die Identität einer Person in der App nach."
    },
    "note": {
     "en": "The Federal Government names the eID function of the identity card among the ways to sign in; the AusweisApp, which reads the card, is developed by Governikus on behalf of the BSI. No source read says who runs the online ID for this app.",
     "de": "Die Bundesregierung nennt die Online-Ausweisfunktion des Personalausweises unter den Wegen der Anmeldung; die AusweisApp, die den Ausweis liest, entwickelt Governikus im Auftrag des BSI. Keine gelesene Quelle sagt, wer den Online-Ausweis für diese App betreibt."
    },
    "criticality": "critical",
    "tech": {
     "name": "Governikus GmbH & Co. KG",
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
    "evidence": [
     {
      "url": "https://www.ausweisapp.bund.de/en/about-us",
      "title": "AusweisApp: About us",
      "quote": "Since 2014, Bremen-based Governikus GmbH & Co. KG is developing the application on behalf of the German Federal Office for Information Security (BSI).",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "search": {
    "query": "Wire messenger Wire Swiss GmbH Zug Schwarz Digits Beteiligung 2026",
    "results": [
     {
      "url": "https://apps.apple.com/FR/app/id930944768",
      "title": "Wire • Secure Messenger"
     },
     {
      "url": "https://wire.com/en/about",
      "title": "wire.com"
     },
     {
      "url": "https://wire.com/blog/schwarzgruppe_partnership",
      "title": "schwarzgruppe partnership"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://wire.com/en/about",
    "title": "About Wire"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Messenger Wire",
     "de": "Messenger Wire"
    },
    "role": {
     "en": "A secure channel for messages between people and the authorities.",
     "de": "Ein sicherer Kanal für Nachrichten zwischen Menschen und Behörden."
    },
    "note": {
     "en": "heise reports that Schwarz Digits integrates Wire into the app. Wire Swiss GmbH belongs to the Wire Group, whose parent company sits in Berlin. Who runs Wire for the app is not stated.",
     "de": "Laut heise integriert Schwarz Digits Wire in die App. Die Wire Swiss GmbH gehört zur Wire-Gruppe, deren Muttergesellschaft in Berlin sitzt. Wer Wire für die App betreibt, ist nicht genannt."
    },
    "criticality": "important",
    "tech": {
     "name": "Wire Swiss GmbH",
     "country": "CH",
     "parent": {
      "name": "Wire Group Holdings GmbH",
      "country": "DE"
     }
    },
    "operator": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "open_source",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "The digital division of the Schwarz Group will integrate the open-source messenger Wire into the app",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://wire.com/en/about",
      "title": "About Wire",
      "quote": "Wire Swiss GmbH (Switzerland)",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://wire.com/en/about",
      "title": "About Wire",
      "quote": "Wire Group Holdings GmbH, incorporated in Berlin, Germany",
      "lang": "en",
      "supports": [
       "tech.parent"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "low"
   }
  },
  {
   "say": {
    "en": "Applications: the prototype itself, tested in six pilot municipalities.",
    "de": "Anwendungen: der Prototyp selbst, erprobt in sechs Pilotkommunen."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "Prototype of the Deutschland-App",
     "de": "Prototyp der Deutschland-App"
    },
    "role": {
     "en": "Leads people to administrative services and their applications.",
     "de": "Führt Menschen zu Verwaltungsleistungen und ihren Anträgen."
    },
    "note": {
     "en": "It is tested in six pilot municipalities with a limited number of users; the renewal of child benefit and housing allowance are among the use cases.",
     "de": "Er wird in sechs Pilotkommunen mit wenigen Nutzenden erprobt; die Verlängerung von Kindergeld und Wohngeld gehört zu den Anwendungsfällen."
    },
    "criticality": "critical",
    "tech": {
     "name": "T-Systems International GmbH",
     "country": "DE",
     "parent": {
      "name": "Deutsche Telekom AG",
      "country": "DE"
     }
    },
    "operator": {
     "name": "Deutsche Telekom AG",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.bundestag.de/1223070",
      "title": "Deutschland-App: Prototyp wird in sechs Kommunen erprobt",
      "quote": "Für die Entwicklung des Prototyps sei die T-Systems International GmbH als Generalunternehmerin beauftragt worden",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "its subsidiary T-Systems will handle the cloud infrastructure and data storage.",
      "lang": "en",
      "supports": [
       "tech.parent"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://heise.de/-11247830",
      "title": "SAP and Telekom develop central citizen app for Germany (heise online)",
      "quote": "Telekom will be responsible for the operational management",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "access",
    "status": "no_evidence",
    "reason": {
     "en": "The app is not in the app stores yet; no source read says how it will reach people's phones.",
     "de": "Die App ist noch nicht in den App-Stores; keine gelesene Quelle sagt, wie sie auf die Smartphones der Menschen kommen soll."
    }
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. Every block is made in Germany and most are run there, though much rests on press reports; who runs the sign-in with the online ID and the messenger is open.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Alle Bausteine werden in Deutschland hergestellt und die meisten dort betrieben, vieles stützt sich aber auf Presseberichte; wer die Anmeldung mit dem Online-Ausweis und den Messenger betreibt, ist offen."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Six building blocks; the access layer has no evidence, and three blocks rest on press reports only. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The messenger is at {{fact:seal.B-05}} because its operator is unknown. Please check, correct or confirm.",
     "de": "Sechs Bausteine; für die Ebene Oberfläche und Zugang fehlen Belege, und drei Bausteine beruhen nur auf Presseberichten. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Der Messenger steht auf {{fact:seal.B-05}}, weil sein Betreiber unbekannt ist. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-01",
     "B-03",
     "B-05"
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
    "title": "Deutschland-Stack: Wohin geht die Reise? (BMDS, Fachkongress des IT-Planungsrats)",
    "pdf": true
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-05",
      "made_in": "DE",
      "run_by": "DE"
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
       "en": "Send messages from the authorities through the BundID postbox",
       "de": "Nachrichten der Behörden über das BundID-Postfach senden"
      },
      "rationale": {
       "en": "Who runs the messenger for the app is not stated. The Federation's plans already foresee the legally binding delivery of decisions through the BundID postbox, with notifications. If the channel were made and run in Germany, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Wer den Messenger für die App betreibt, ist nicht genannt. Die Pläne des Bundes sehen schon die rechtsverbindliche Zustellung von Bescheiden über das BundID-Postfach vor, mit Benachrichtigungen. Würde der Kanal in Deutschland hergestellt und betrieben, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-05",
        "made_in": "DE",
        "run_by": "DE"
       }
      ],
      "evidence": [
       {
        "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
        "title": "Deutschland-Stack: Wohin geht die Reise? (BMDS, Fachkongress des IT-Planungsrats)",
        "quote": "Rechtsverbindliche Zustellung der Bescheide über BundID-Postfach, mit Benachrichtigungen;",
        "lang": "de",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-19"
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
    "findings": {
     "en": "# Deutschland-App: findings\n\nThe Deutschland-App is the Federation's planned app for administrative services; a prototype is tested in six pilot municipalities and is not in the app stores. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): according to heise, T-Systems handles the cloud infrastructure and data storage; the Federal Government's answer names no hosting.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): T-Systems is the general contractor and chooses further subcontractors and suppliers, according to the Federal Government.\n- **Platform** ({{fact:score.layer.platform}}): the press names SAP's Business Technology Platform; SAP has its seat in Walldorf, Germany. The Federal Government's answer does not confirm SAP's part.\n- **Base services** ({{fact:score.layer.base_service}}): people are to sign in with the eID function of the identity card, among other means; Schwarz Digits integrates the messenger Wire, whose operator for the app is not stated.\n- **Applications** ({{fact:score.layer.applications}}): the prototype, with the renewal of child benefit and housing allowance among its use cases.\n- **Interface and access**: the app is not in the app stores yet; no source read says how it will reach people's phones.\n\nMuch of the picture rests on press reports; the Federal Government's answer leaves the parts of SAP and Schwarz Digits open.",
     "de": "# Deutschland-App: Befunde\n\nDie Deutschland-App ist die geplante App des Bundes für Verwaltungsleistungen; ein Prototyp wird in sechs Pilotkommunen erprobt und ist nicht in den App-Stores. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): Laut heise übernimmt T-Systems Cloud-Infrastruktur und Datenspeicherung; die Antwort der Bundesregierung nennt kein Hosting.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): T-Systems ist Generalunternehmerin und wählt laut Bundesregierung weitere Nachunternehmer und Lieferanten aus.\n- **Plattform** ({{fact:score.layer.platform}}): Die Presse nennt die Business Technology Platform von SAP; SAP hat seinen Sitz in Walldorf. Die Antwort der Bundesregierung bestätigt die Rolle von SAP nicht.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Die Anmeldung soll unter anderem über die eID-Funktion des Personalausweises laufen; Schwarz Digits integriert den Messenger Wire, dessen Betreiber für die App nicht genannt ist.\n- **Anwendungen** ({{fact:score.layer.applications}}): der Prototyp, zu dessen Anwendungsfällen die Verlängerung von Kindergeld und Wohngeld gehört.\n- **Oberfläche und Zugang**: Die App ist noch nicht in den App-Stores; keine gelesene Quelle sagt, wie sie auf die Smartphones kommen soll.\n\nVieles beruht auf Presseberichten; die Antwort der Bundesregierung lässt die Rolle von SAP und Schwarz Digits offen."
    }
   }
  }
 ]
};
})();
