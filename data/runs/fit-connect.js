/* Pre-run assessment of FIT-Connect (hand-authored, as of 2026-11-19): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/fit-connect.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["fit-connect"] = {
 "id": "fit-connect",
 "entry_id": "fit-connect",
 "source": "hand_authored",
 "as_of": "2026-11-19",
 "method_version": "1.0",
 "query": "FIT-Connect",
 "steps": [
  {
   "say": {
    "en": "I look FIT-Connect up in the catalogue and read its own documentation first.",
    "de": "Ich schlage FIT-Connect im Katalog nach und lese zuerst die eigene Dokumentation."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "FIT-Connect"
   }
  },
  {
   "fetch": {
    "url": "https://docs.fitko.de/fit-connect/docs/intro/",
    "title": "Einführung in FIT-Connect | FIT-Connect"
   }
  },
  {
   "fetch": {
    "url": "https://docs.fitko.de/fit-connect/docs/faq/",
    "title": "FAQ | FIT-Connect"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "FIT-Connect"
    ],
    "category": "base_service",
    "what": {
     "en": "A base infrastructure for submitting applications for administrative services digitally and routing them to the responsible authority.",
     "de": "Eine Basisinfrastruktur, über die Anträge auf Verwaltungsleistungen digital eingereicht und an die zuständige Behörde weitergeleitet werden."
    },
    "how": {
     "en": "Online services hand over application data to the Zustelldienst through an interface; the receiving authority's system collects them there. An authentication server with a self-service portal manages access.",
     "de": "Onlinedienste übergeben Antragsdaten über eine Schnittstelle an den Zustelldienst; das System der empfangenden Behörde holt sie dort ab. Ein Authentifizierungsserver mit Self-Service-Portal regelt den Zugang."
    },
    "owner": {
     "name": "IT-Planungsrat",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In production; developed and operated by the FITKO on behalf of the IT-Planungsrat.",
     "de": "In Produktion; im Auftrag des IT-Planungsrats von der FITKO entwickelt und betrieben."
    },
    "governance": {
     "en": "The IT-Planungsrat of the Federation and the Länder commissions FIT-Connect.",
     "de": "Der IT-Planungsrat von Bund und Ländern beauftragt FIT-Connect."
    },
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/docs/intro/",
      "title": "Einführung in FIT-Connect | FIT-Connect",
      "quote": "FIT-Connect wird im Auftrag des IT-Planungsrats von der Föderalen IT-Kooperation (FITKO) entwickelt und betrieben.",
      "lang": "de",
      "supports": [
       "owner",
       "operator",
       "status",
       "governance"
      ],
      "verified": true
     },
     {
      "url": "https://docs.fitko.de/fit-connect/docs/intro/",
      "title": "Einführung in FIT-Connect | FIT-Connect",
      "quote": "FIT-Connect ist eine Basisinfrastruktur-Komponente der Verwaltungsdigitalisierung in Deutschland.",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true
     },
     {
      "url": "https://docs.fitko.de/fit-connect/docs/faq/",
      "title": "FAQ | FIT-Connect",
      "quote": "Der Zustelldienst wird vom Landesbetrieb IT.Niedersachsen im Rechenzentrum von Dataport betrieben.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     }
    ]
   }
  },
  {
   "say": {
    "en": "Infrastructure: the FAQ names the data centres of the two production servers. I check who runs them and where.",
    "de": "Infrastruktur: Die FAQ nennt die Rechenzentren der beiden Produktivserver. Ich prüfe, wer sie betreibt und wo."
   }
  },
  {
   "search": {
    "query": "Dataport Rechenzentrum Anstalt des öffentlichen Rechts Standort",
    "results": [
     {
      "url": "https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html",
      "title": "dataport konsolidiert 5 rechenzentren"
     },
     {
      "url": "https://ted.europa.eu/de/notice/62427-2025/pdf",
      "title": "ted.europa.eu"
     },
     {
      "url": "https://www.landtag.ltsh.de/infothek/wahl19/drucks/01900/drucksache-19-01934.pdf",
      "title": "drucksache 19 01934"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html",
    "title": "Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren | CIO DE"
   }
  },
  {
   "search": {
    "query": "Global Access Internet Services GmbH Rechenzentrum München Impressum",
    "results": [
     {
      "url": "https://www.connect-professional.de/anbieterkompass/global-access-internet-services-gmbh.8908004/index.html",
      "title": "Company Icon"
     },
     {
      "url": "https://bayern-international.de/en/company-database/company-details/global-access-internet-services-gmbh-9346",
      "title": "Global Access Internet Services GmbH"
     },
     {
      "url": "https://www.peeringdb.com/net/1469",
      "title": "Global Access Internet Services GmbH"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.connect-professional.de/anbieterkompass/global-access-internet-services-gmbh.8908004/index.html",
    "title": "Global Access Internet Services GmbH (connect professional, Anbieterkompass)"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "Data centre of the Zustelldienst",
     "de": "Rechenzentrum des Zustelldienstes"
    },
    "role": {
     "en": "Hosts the Zustelldienst, through which every application passes.",
     "de": "Beherbergt den Zustelldienst, über den jeder Antrag läuft."
    },
    "note": {
     "en": "Dataport is a public-law IT provider of several Länder; its data centres are in Hamburg and Norderstedt, according to a trade report.",
     "de": "Dataport ist ein IT-Dienstleister mehrerer Länder in öffentlich-rechtlicher Form; seine Rechenzentren liegen laut einem Fachbericht in Hamburg und Norderstedt."
    },
    "criticality": "critical",
    "tech": {
     "name": "Dataport AöR",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Dataport AöR",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/docs/faq/",
      "title": "FAQ | FIT-Connect",
      "quote": "Der Zustelldienst wird vom Landesbetrieb IT.Niedersachsen im Rechenzentrum von Dataport betrieben.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html",
      "title": "Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren | CIO DE",
      "quote": "Die 2004 gegründete Anstalt des öffentlichen Rechts ist IT-Dienstleister der öffentlichen Verwaltung",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html",
      "title": "Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren | CIO DE",
      "quote": "Die Standorte liegen in Hamburg und im schleswig-holsteinischen Norderstedt direkt an der Hamburger Stadtgrenze.",
      "lang": "de",
      "supports": [
       "hosting"
      ],
      "verified": true
     }
    ],
    "confidence": "high"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "Data centre of the authentication server",
     "de": "Rechenzentrum des Authentifizierungsservers"
    },
    "role": {
     "en": "Hosts the authentication server with the self-service portal and the OAuth server.",
     "de": "Beherbergt den Authentifizierungsserver mit Self-Service-Portal und OAuth-Server."
    },
    "note": {
     "en": "Global Access Internet Services GmbH has its address in Munich; the data centre's own location is not stated in the sources read.",
     "de": "Die Global Access Internet Services GmbH hat ihre Anschrift in München; der Standort des Rechenzentrums selbst steht nicht in den gelesenen Quellen."
    },
    "criticality": "critical",
    "tech": {
     "name": "Global Access Internet Services GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Global Access Internet Services GmbH",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/docs/faq/",
      "title": "FAQ | FIT-Connect",
      "quote": "Der Authentifizierungsserver mit dem Self-Service-Portal und dem OAuth-Server befindet sich im Rechenzentrum von Global Access.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.connect-professional.de/anbieterkompass/global-access-internet-services-gmbh.8908004/index.html",
      "title": "Global Access Internet Services GmbH (connect professional, Anbieterkompass)",
      "quote": "Potsdamer Str. 3, 80802 München - Deutschland",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "say": {
    "en": "Development, security and operations: the FITKO develops and runs FIT-Connect on behalf of the IT-Planungsrat.",
    "de": "Entwicklung, Sicherheit und Betrieb: Die FITKO entwickelt und betreibt FIT-Connect im Auftrag des IT-Planungsrats."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Development and operation by the FITKO",
     "de": "Entwicklung und Betrieb durch die FITKO"
    },
    "role": {
     "en": "Develops FIT-Connect and runs its technical infrastructure.",
     "de": "Entwickelt FIT-Connect und betreibt die technische Infrastruktur."
    },
    "criticality": "critical",
    "tech": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/docs/intro/",
      "title": "Einführung in FIT-Connect | FIT-Connect",
      "quote": "FIT-Connect wird im Auftrag des IT-Planungsrats von der Föderalen IT-Kooperation (FITKO) entwickelt und betrieben.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://docs.fitko.de/fit-connect/docs/faq/",
      "title": "FAQ | FIT-Connect",
      "quote": "Die technische Infrastruktur wird betrieben durch die FITKO.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Platform: the Zustelldienst carries the submissions; the authentication server controls access.",
    "de": "Plattform: Der Zustelldienst trägt die Einreichungen; der Authentifizierungsserver regelt den Zugang."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Zustelldienst",
     "de": "Zustelldienst"
    },
    "role": {
     "en": "Receives the application data from online services and holds them for the receiving authority.",
     "de": "Nimmt die Antragsdaten der Onlinedienste an und hält sie für die empfangende Behörde bereit."
    },
    "criticality": "critical",
    "tech": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Landesbetrieb IT.Niedersachsen",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/docs/intro/",
      "title": "Einführung in FIT-Connect | FIT-Connect",
      "quote": "FIT-Connect wird im Auftrag des IT-Planungsrats von der Föderalen IT-Kooperation (FITKO) entwickelt und betrieben.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://docs.fitko.de/fit-connect/docs/faq/",
      "title": "FAQ | FIT-Connect",
      "quote": "Der Zustelldienst wird vom Landesbetrieb IT.Niedersachsen im Rechenzentrum von Dataport betrieben.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html",
      "title": "Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren | CIO DE",
      "quote": "Die Standorte liegen in Hamburg und im schleswig-holsteinischen Norderstedt direkt an der Hamburger Stadtgrenze.",
      "lang": "de",
      "supports": [
       "hosting"
      ],
      "verified": true
     }
    ],
    "confidence": "high"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Authentication server and self-service portal",
     "de": "Authentifizierungsserver und Self-Service-Portal"
    },
    "role": {
     "en": "Grants online services and authorities access to FIT-Connect.",
     "de": "Gewährt Onlinediensten und Behörden den Zugang zu FIT-Connect."
    },
    "note": {
     "en": "Which software it runs on, and who makes it, is not stated in the sources read.",
     "de": "Auf welcher Software er läuft und wer sie herstellt, steht nicht in den gelesenen Quellen."
    },
    "criticality": "important",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/docs/faq/",
      "title": "FAQ | FIT-Connect",
      "quote": "Die technische Infrastruktur wird betrieben durch die FITKO.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://docs.fitko.de/fit-connect/docs/faq/",
      "title": "FAQ | FIT-Connect",
      "quote": "Der Authentifizierungsserver mit dem Self-Service-Portal und dem OAuth-Server befindet sich im Rechenzentrum von Global Access.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "base_service",
    "status": "no_evidence",
    "reason": {
     "en": "Planning documents name re-used base services such as the administration's directory service and its PKI, but no source read says who runs them for FIT-Connect.",
     "de": "Planungsunterlagen nennen nachgenutzte Basisdienste wie das Verzeichnis der Verwaltung und ihre PKI, doch keine gelesene Quelle sagt, wer sie für FIT-Connect betreibt."
    }
   }
  },
  {
   "say": {
    "en": "Applications: FIT-Connect's own software, and the licence of its Java SDK.",
    "de": "Anwendungen: die eigene Software von FIT-Connect und die Lizenz ihres Java-SDK."
   }
  },
  {
   "fetch": {
    "url": "https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client",
    "title": "Maven Central: dev.fitko.fitconnect:sdk-client"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "FIT-Connect software",
     "de": "FIT-Connect-Software"
    },
    "role": {
     "en": "The service's own software: the Zustelldienst's interface and the SDKs for connected systems.",
     "de": "Die eigene Software des Dienstes: die Schnittstelle des Zustelldienstes und die SDKs für angebundene Systeme."
    },
    "note": {
     "en": "The Java SDK names the EUPL among its licences; its source is published on the FITKO's own GitLab.",
     "de": "Das Java-SDK nennt die EUPL unter seinen Lizenzen; sein Quellcode liegt im eigenen GitLab der FITKO."
    },
    "criticality": "critical",
    "tech": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "open_source",
    "exit": "easy",
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/docs/intro/",
      "title": "Einführung in FIT-Connect | FIT-Connect",
      "quote": "FIT-Connect wird im Auftrag des IT-Planungsrats von der Föderalen IT-Kooperation (FITKO) entwickelt und betrieben.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client",
      "title": "Maven Central: dev.fitko.fitconnect:sdk-client",
      "quote": "EUPL-1.2",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true
     },
     {
      "url": "https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client",
      "title": "Maven Central: dev.fitko.fitconnect:sdk-client",
      "quote": "https://git.fitko.de/fit-connect/java-sdk",
      "lang": "en",
      "supports": [
       "exit"
      ],
      "verified": true
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Interface and access: connected systems use the SDKs. I check where developers get them.",
    "de": "Oberfläche und Zugang: Angebundene Systeme nutzen die SDKs. Ich prüfe, woher Entwickler sie beziehen."
   }
  },
  {
   "fetch": {
    "url": "https://docs.fitko.de/fit-connect/assets/files/FITConnect_Onepager-1a613eda6435943cc90f0b214bc7321f.pdf",
    "title": "FIT-Connect Onepager (FITKO)",
    "pdf": true
   }
  },
  {
   "search": {
    "query": "Sonatype Maven Central company headquarters",
    "results": [
     {
      "url": "https://sonatype.com/about",
      "title": "About Sonatype"
     },
     {
      "url": "https://www.sonatype.com/blog/2010/09/sonatype-headquarters-moves-to-maryland?hs_amp=true",
      "title": "News and Notes from the Makers of Nexus | Sonatype Blog"
     },
     {
      "url": "https://www.cbinsights.com/company/sonatype",
      "title": "www.cbinsights.com"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://sonatype.com/about",
    "title": "About Sonatype | Our Company & Mission | Sonatype"
   }
  },
  {
   "fetch": {
    "url": "https://www.sonatype.com/blog/2010/09/sonatype-headquarters-moves-to-maryland?hs_amp=true",
    "title": "Sonatype Relocates Headquarters to Maryland"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "Java SDK distribution through Maven Central",
     "de": "Verteilung des Java-SDK über Maven Central"
    },
    "role": {
     "en": "Delivers the Java SDK, with which systems connect to FIT-Connect, to developers.",
     "de": "Liefert Entwicklern das Java-SDK, mit dem Systeme an FIT-Connect angebunden werden."
    },
    "note": {
     "en": "Maven Central is maintained by Sonatype, which moved its headquarters to Maryland; where the registry is hosted is not stated in the sources read.",
     "de": "Maven Central wird von Sonatype betreut, das seinen Hauptsitz nach Maryland verlegt hat; wo das Verzeichnis gehostet wird, steht nicht in den gelesenen Quellen."
    },
    "criticality": "important",
    "tech": {
     "name": "Föderale IT-Kooperation (FITKO)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Sonatype, Inc.",
     "country": "US",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "open_source",
    "exit": "easy",
    "evidence": [
     {
      "url": "https://docs.fitko.de/fit-connect/assets/files/FITConnect_Onepager-1a613eda6435943cc90f0b214bc7321f.pdf",
      "title": "FIT-Connect Onepager (FITKO)",
      "quote": "Es wird von der Föderalen IT-Kooperation (FITKO) entwickelt und betrieben.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client",
      "title": "Maven Central: dev.fitko.fitconnect:sdk-client",
      "quote": "EUPL-1.2",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true
     },
     {
      "url": "https://sonatype.com/about",
      "title": "About Sonatype | Our Company & Mission | Sonatype",
      "quote": "As the maintainers of Maven Central and creators of Nexus Repository",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.sonatype.com/blog/2010/09/sonatype-headquarters-moves-to-maryland?hs_amp=true",
      "title": "Sonatype Relocates Headquarters to Maryland",
      "quote": "With Jackson coming on board, Sonatype moves its headquarters from Silicon Valley to Maryland.",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client",
      "title": "Maven Central: dev.fitko.fitconnect:sdk-client",
      "quote": "https://git.fitko.de/fit-connect/java-sdk",
      "lang": "en",
      "supports": [
       "exit"
      ],
      "verified": true
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. The access layer scores {{fact:score.layer.access}}: the SDK reaches developers through a registry run from the United States.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Die Zugangsebene erreicht {{fact:score.layer.access}}: Das SDK erreicht Entwickler über ein Verzeichnis, das aus den USA betrieben wird."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Seven building blocks in five layers; the base services have no evidence. The overall score is {{fact:score.overall}}, indicative. The lowest level sits in the SDK distribution, {{fact:seal.B-07}}; the authentication server's software is unknown. Please check, correct or confirm.",
     "de": "Sieben Bausteine in fünf Ebenen; für die Basisdienste fehlen Belege. Der Gesamtwert ist {{fact:score.overall}}, indikativ. Die niedrigste Stufe liegt bei der Verteilung des SDK, {{fact:seal.B-07}}; die Software des Authentifizierungsservers ist unbekannt. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-07",
     "B-05"
    ]
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-07",
      "run_by": "DE",
      "hosting": "EU"
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
       "en": "Distribute the SDKs from a registry run in the EU",
       "de": "Die SDKs aus einem Verzeichnis in der EU verteilen"
      },
      "rationale": {
       "en": "The SDK's source code already lives on a code platform its operator runs itself, so a package registry run in Germany is a known path. With it the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Der Quellcode des SDK liegt bereits auf einer Code-Plattform, die sein Betreiber selbst betreibt; ein Paketverzeichnis mit Betrieb in Deutschland ist daher ein bekannter Weg. Damit läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-07",
        "run_by": "DE",
        "hosting": "EU"
       }
      ],
      "evidence": [
       {
        "url": "https://central.sonatype.com/artifact/dev.fitko.fitconnect/sdk-client",
        "title": "Maven Central: dev.fitko.fitconnect:sdk-client",
        "quote": "https://git.fitko.de/fit-connect/java-sdk",
        "lang": "en",
        "supports": [
         "alternative"
        ],
        "verified": true
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
     "en": "# FIT-Connect: findings\n\nFIT-Connect, the base infrastructure for submitting applications for administrative services, is developed and operated by the FITKO on behalf of the IT-Planungsrat. Its overall score is {{fact:score.overall}}, indicative.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): according to the FIT-Connect FAQ, the Zustelldienst runs in Dataport's data centre and the authentication server in the data centre of Global Access, both German providers.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): the FITKO develops FIT-Connect and runs its technical infrastructure.\n- **Platform** ({{fact:score.layer.platform}}): the Zustelldienst is operated by IT.Niedersachsen; the software of the authentication server is not named in the sources read, so that block is partly unknown.\n- **Base services**: planning documents name re-used base services, but no source read says who runs them for FIT-Connect.\n- **Applications** ({{fact:score.layer.applications}}): the Java SDK lists the EUPL among its licences.\n- **Interface and access** ({{fact:score.layer.access}}): the Java SDK reaches developers through Maven Central, which Sonatype maintains.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}. Evidence coverage is {{fact:coverage}}; exclusive non-EU control of critical blocks is {{fact:share.exclusive_non_eu}}.",
     "de": "# FIT-Connect: Befunde\n\nFIT-Connect, die Basisinfrastruktur für das Einreichen von Anträgen auf Verwaltungsleistungen, wird im Auftrag des IT-Planungsrats von der FITKO entwickelt und betrieben. Der Gesamtwert ist {{fact:score.overall}}, indikativ.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): Laut der FAQ von FIT-Connect läuft der Zustelldienst im Rechenzentrum von Dataport und der Authentifizierungsserver im Rechenzentrum von Global Access, beides Anbieter aus Deutschland.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Die FITKO entwickelt FIT-Connect und betreibt die technische Infrastruktur.\n- **Plattform** ({{fact:score.layer.platform}}): Den Zustelldienst betreibt IT.Niedersachsen; die Software des Authentifizierungsservers nennen die gelesenen Quellen nicht, daher ist dieser Baustein teilweise unbekannt.\n- **Basisdienste**: Planungsunterlagen nennen nachgenutzte Basisdienste, doch keine gelesene Quelle sagt, wer sie für FIT-Connect betreibt.\n- **Anwendungen** ({{fact:score.layer.applications}}): Das Java-SDK nennt die EUPL unter seinen Lizenzen.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): Das Java-SDK erreicht Entwickler über Maven Central, das Sonatype betreut.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}. Die Belegabdeckung beträgt {{fact:coverage}}; die ausschließliche Kontrolle kritischer Bausteine außerhalb der EU beträgt {{fact:share.exclusive_non_eu}}."
    }
   }
  }
 ]
};
})();
