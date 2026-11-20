/* Pre-run assessment of NOOTS (National Once-Only Technical System) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/noots.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["noots"] = {
 "id": "noots",
 "entry_id": "noots",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "NOOTS",
 "steps": [
  {
   "say": {
    "en": "I look NOOTS up in the catalogue, read the state treaty that sets it up and the federal office's description of its minimal version, and look for who builds and who runs its parts.",
    "de": "Ich schlage NOOTS im Katalog nach, lese den Staatsvertrag, der es errichtet, und die Beschreibung seiner Minimalversion durch das Bundesverwaltungsamt und suche, wer seine Teile baut und betreibt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "NOOTS"
   }
  },
  {
   "fetch": {
    "url": "https://noots.gov.de/",
    "title": "NOOTS – das Nationale Once-Only-Technical-System - Wissensplattform"
   }
  },
  {
   "search": {
    "query": "NOOTS Betrieb Bundesverwaltungsamt Komponenten Vermittlungsstelle Registerdatennavigation entwickelt",
    "results": [
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0"
     },
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "www.gesetze-im-internet.de"
     },
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/Integrationsanleitung-1.4.1.pdf",
      "title": "Integrationsanleitung 1.4.1"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
    "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
    "pdf": true
   }
  },
  {
   "fetch": {
    "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
    "title": "NOOTS MVP v1.4.0",
    "pdf": true
   }
  },
  {
   "fetch": {
    "url": "https://www.bundestag.de/1232782",
    "title": "Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "NOOTS",
     "Nationales Once-Only-Technical-System"
    ],
    "category": "base_service",
    "what": {
     "en": "A common IT system of the Federation and the Länder, made of components, interfaces and standards, through which public bodies retrieve and send electronic evidence and data.",
     "de": "Ein gemeinsames IT-System von Bund und Ländern aus Komponenten, Schnittstellen und Standards, über das öffentliche Stellen elektronische Nachweise und Daten abrufen und übermitteln."
    },
    "how": {
     "en": "Online services and registers connect to central components; a minimal version runs in Dataport's data centre, so far without the Vermittlungsstelle.",
     "de": "Onlinedienste und Register schließen sich an zentrale Komponenten an; eine Minimalversion läuft im Rechenzentrum von Dataport, bisher ohne Vermittlungsstelle."
    },
    "owner": {
     "name": "Bund und Länder (Vertragsparteien des NOOTS-Staatsvertrags)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bundesverwaltungsamt (BVA)",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "Usable for retrieving data, according to the Federal Government.",
     "de": "Laut Bundesregierung für den Datenabruf nutzbar."
    },
    "legal_basis": {
     "en": "The NOOTS state treaty of the Federation and the Länder.",
     "de": "Der NOOTS-Staatsvertrag von Bund und Ländern."
    },
    "evidence": [
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "Das Nationale Once-Only-Technical-System (NOOTS) ist ein gemeinsames informationstechnisches System",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true
     },
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "aus IT-Komponenten, Schnittstellen und Standards, das öffentlichen Stellen den Abruf und die Übermittlung von elektronischen Nachweisen",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true
     },
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Dataport stellt die Betriebsumgebung (NOOTS MVP PROD) im Twin Data Center ab spätestens 01. August 2025 bereit.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Im MVP ist keine Vermittlungsstelle (VS) enthalten.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "Die Vertragsparteien errichten und betreiben das NOOTS als gemeinsames informationstechnisches System und entwickeln es gemeinsam weiter.",
      "lang": "de",
      "supports": [
       "owner",
       "legal_basis"
      ],
      "verified": true
     },
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "Die operative Umsetzung der Errichtung, des Betriebs und der Weiterentwicklung des NOOTS erfolgt durch das",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "Bundesverwaltungsamt als betriebsverantwortliche Stelle.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.bundestag.de/1232782",
      "title": "Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag",
      "quote": "Bereits nutzbar seien FIT-Connect für den Datenaustausch und das Nationale Once-Only-Technical-System NOOTS",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://www.bundestag.de/1232782",
      "title": "Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag",
      "quote": "für den Datenabruf.",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true
     }
    ]
   }
  },
  {
   "say": {
    "en": "Infrastructure: the federal office's document says Dataport provides the production environment in its Twin Data Center. I check who Dataport is.",
    "de": "Infrastruktur: Das Dokument des Bundesverwaltungsamts sagt, dass Dataport die Produktionsumgebung in seinem Twin Data Center bereitstellt. Ich prüfe, wer Dataport ist."
   }
  },
  {
   "fetch": {
    "url": "https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html",
    "title": "Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren | CIO DE"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "Dataport's Twin Data Center",
     "de": "Twin Data Center von Dataport"
    },
    "role": {
     "en": "Hosts the production environment of NOOTS.",
     "de": "Beherbergt die Produktionsumgebung von NOOTS."
    },
    "note": {
     "en": "Dataport runs test environments there too and in its dSecureCloud, where the connection to the European once-only system runs for the time being; the sources read do not state where the data centre is.",
     "de": "Dataport betreibt dort auch Testumgebungen sowie in seiner dSecureCloud, in der vorerst die Anbindung an das europäische Once-Only-System läuft; wo das Rechenzentrum steht, sagen die gelesenen Quellen nicht."
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
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Dataport stellt die Betriebsumgebung (NOOTS MVP PROD) im Twin Data Center ab spätestens 01. August 2025 bereit.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Der eDAP wird bis auf Weiteres in der dSecureCloud betrieben.",
      "lang": "de",
      "supports": [
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
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Development, security and operations: SEITENBAU develops the software components, Dataport builds and supports them, and the state treaty makes the Bundesverwaltungsamt responsible for operations.",
    "de": "Entwicklung, Sicherheit und Betrieb: SEITENBAU entwickelt die Softwarekomponenten, Dataport baut und betreut sie, und der Staatsvertrag macht das Bundesverwaltungsamt für den Betrieb verantwortlich."
   }
  },
  {
   "search": {
    "query": "SEITENBAU GmbH Konstanz Impressum Softwareentwicklung öffentliche Verwaltung",
    "results": [
     {
      "url": "https://www.seitenbau.com/impressum",
      "title": "impressum - SEITENBAU"
     },
     {
      "url": "https://www.seitenbau.com/was-wir-koennen/registermodernisierung",
      "title": "Registermodernisierung - SEITENBAU"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.seitenbau.com/impressum",
    "title": "IMPRESSUM - SEITENBAU"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Development by SEITENBAU, build and support by Dataport",
     "de": "Entwicklung durch SEITENBAU, Bau und Betreuung durch Dataport"
    },
    "role": {
     "en": "SEITENBAU develops software components and delivers them to Dataport, which builds them and gives first- and second-level support.",
     "de": "SEITENBAU entwickelt Softwarekomponenten und liefert sie an Dataport, das sie baut und den First- und Second-Level-Support übernimmt."
    },
    "criticality": "important",
    "tech": {
     "name": "SEITENBAU GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Dataport AöR",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Die von SEITENBAU entwickelten Softwarekomponenten werden an Dataport geliefert und durch Dataport gebaut.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.seitenbau.com/impressum",
      "title": "IMPRESSUM - SEITENBAU",
      "quote": "SEITENBAU GmbH Seilerstraße 7 78467 Konstanz",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Dataport übernimmt den First und Second Level Support.",
      "lang": "de",
      "supports": [
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
       "operator"
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
    "layer": "devsecops",
    "name": {
     "en": "Operational responsibility of the Bundesverwaltungsamt",
     "de": "Betriebsverantwortung des Bundesverwaltungsamts"
    },
    "role": {
     "en": "Carries out the setting up, the operation and the further development of NOOTS, under the state treaty.",
     "de": "Setzt die Errichtung, den Betrieb und die Weiterentwicklung von NOOTS um, nach dem Staatsvertrag."
    },
    "criticality": "important",
    "tech": {
     "name": "Bundesverwaltungsamt (BVA)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bundesverwaltungsamt (BVA)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "Die operative Umsetzung der Errichtung, des Betriebs und der Weiterentwicklung des NOOTS erfolgt durch das",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "Bundesverwaltungsamt als betriebsverantwortliche Stelle.",
      "lang": "de",
      "supports": [
       "tech",
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
    "en": "Platform: the register data navigation rests on a technology stack that Dataport prescribes. The document does not name its products.",
    "de": "Plattform: Die Registerdatennavigation beruht auf einem Technologiestack, den Dataport vorgibt. Das Dokument nennt seine Produkte nicht."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Technology stack prescribed by Dataport",
     "de": "Von Dataport vorgegebener Technologiestack"
    },
    "role": {
     "en": "Carries the register data navigation and the other central components.",
     "de": "Trägt die Registerdatennavigation und die übrigen zentralen Komponenten."
    },
    "note": {
     "en": "The sources read do not name the stack's products, so who makes them is a gap; the federal office's stated aim is independence from vendors and the use of open source.",
     "de": "Die gelesenen Quellen nennen die Produkte des Stacks nicht; wer sie herstellt, ist daher eine Lücke. Erklärtes Ziel des Bundesverwaltungsamts sind Herstellerunabhängigkeit und Open Source."
    },
    "criticality": "critical",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "Dataport AöR",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Die RDN basiert auf dem von Dataport vorgegebenen Technologiestack",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Dataport stellt die Betriebsumgebung (NOOTS MVP PROD) im Twin Data Center ab spätestens 01. August 2025 bereit.",
      "lang": "de",
      "supports": [
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
       "operator"
      ],
      "verified": true
     }
    ],
    "confidence": "low"
   }
  },
  {
   "say": {
    "en": "Base services: the central components, such as the identity and access management for authorities and the register data navigation.",
    "de": "Basisdienste: die zentralen Komponenten, etwa das Identitäts- und Zugriffsmanagement für Behörden und die Registerdatennavigation."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Central NOOTS components",
     "de": "Zentrale NOOTS-Komponenten"
    },
    "role": {
     "en": "Let authorities identify themselves and find the register that holds a piece of evidence.",
     "de": "Lassen Behörden sich ausweisen und das Register finden, das einen Nachweis hält."
    },
    "note": {
     "en": "The federal office's document says SEITENBAU develops the software components that Dataport builds; it does not list them one by one. The minimal version has no Vermittlungsstelle yet.",
     "de": "Das Dokument des Bundesverwaltungsamts sagt, dass SEITENBAU die Softwarekomponenten entwickelt, die Dataport baut; einzeln listet es sie nicht auf. Die Minimalversion hat noch keine Vermittlungsstelle."
    },
    "criticality": "critical",
    "tech": {
     "name": "SEITENBAU GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Dataport AöR",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Die von SEITENBAU entwickelten Softwarekomponenten werden an Dataport geliefert und durch Dataport gebaut.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.seitenbau.com/impressum",
      "title": "IMPRESSUM - SEITENBAU",
      "quote": "SEITENBAU GmbH Seilerstraße 7 78467 Konstanz",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
      "title": "NOOTS MVP v1.4.0",
      "quote": "Dataport stellt die Betriebsumgebung (NOOTS MVP PROD) im Twin Data Center ab spätestens 01. August 2025 bereit.",
      "lang": "de",
      "supports": [
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
    "layer": "applications",
    "status": "not_applicable",
    "reason": {
     "en": "NOOTS lets public bodies retrieve evidence; the applications that use it are the authorities' own online services and registers, assessed on their own.",
     "de": "NOOTS lässt öffentliche Stellen Nachweise abrufen; die Anwendungen, die es nutzen, sind die eigenen Onlinedienste und Register der Behörden und werden für sich bewertet."
    },
    "evidence": [
     {
      "url": "https://www.gesetze-im-internet.de/nootsstvtr/NOOTSStVtr.pdf",
      "title": "Vertrag über die Errichtung, den Betrieb und die Weiterentwicklung des Nationalen Once-Only-Technical-Systems (NOOTS) – NOOTS-Staatsvertrag",
      "quote": "aus IT-Komponenten, Schnittstellen und Standards, das öffentlichen Stellen den Abruf und die Übermittlung von elektronischen Nachweisen",
      "lang": "de",
      "supports": [
       "not_applicable"
      ],
      "verified": true
     }
    ]
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "access",
    "status": "no_evidence",
    "reason": {
     "en": "No source read describes an interface of NOOTS itself; people reach it only through the online services connected to it.",
     "de": "Keine gelesene Quelle beschreibt eine eigene Oberfläche von NOOTS; Menschen erreichen es nur über die angeschlossenen Onlinedienste."
    }
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. German public bodies and a German company build and run what the sources name; the products of the technology stack are a gap.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Deutsche öffentliche Stellen und ein deutsches Unternehmen bauen und betreiben, was die Quellen nennen; die Produkte des Technologiestacks sind eine Lücke."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Five building blocks; applications do not apply and access has no evidence. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The technology stack is at {{fact:seal.B-04}} because no source read names its products. Please check, correct or confirm.",
     "de": "Fünf Bausteine; Anwendungen entfallen, und für den Zugang fehlen Belege. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Der Technologiestack steht auf {{fact:seal.B-04}}, weil keine gelesene Quelle seine Produkte nennt. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-04"
    ]
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-04",
      "made_in": "EU"
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
       "en": "Name the technology stack and build it from European or open-source products",
       "de": "Den Technologiestack benennen und aus europäischen oder quelloffenen Produkten bauen"
      },
      "rationale": {
       "en": "The sources do not name the products of the stack that Dataport prescribes. The federal office's document states the aim of independence from vendors and the use of open source. If the stack were made in the EU, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die Quellen nennen die Produkte des Stacks nicht, den Dataport vorgibt. Das Dokument des Bundesverwaltungsamts nennt als Ziel Herstellerunabhängigkeit und Open Source. Wäre der Stack in der EU hergestellt, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-04",
        "made_in": "EU"
       }
      ],
      "evidence": [
       {
        "url": "https://nova.noots.gov.de/fileadmin/Redaktion_NOVA/Anleitungen/NOOTS_MVP_v1.4.0.pdf",
        "title": "NOOTS MVP v1.4.0",
        "quote": "dabei wird das Ziel der Herstellerunabhängigkeit und die Verwendung von Open Source berücksichtigt",
        "lang": "de",
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
     "en": "# NOOTS: findings\n\nNOOTS is the common IT system of the Federation and the Länder through which public bodies retrieve and send electronic evidence; under the state treaty the Bundesverwaltungsamt is responsible for running it. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): Dataport provides the production environment in its Twin Data Center; where the data centre is, the sources read do not say.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): SEITENBAU develops the software components, Dataport builds and supports them, and the Bundesverwaltungsamt carries the operational responsibility.\n- **Platform** ({{fact:score.layer.platform}}): a technology stack that Dataport prescribes; no source read names its products, so who makes them is a gap.\n- **Base services** ({{fact:score.layer.base_service}}): the central components, such as the identity and access management for authorities and the register data navigation; the minimal version has no Vermittlungsstelle yet.\n- **Applications**: they do not apply; the online services and registers that use NOOTS are assessed on their own.\n- **Interface and access**: NOOTS has no interface of its own that the sources describe.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# NOOTS: Befunde\n\nNOOTS ist das gemeinsame IT-System von Bund und Ländern, über das öffentliche Stellen elektronische Nachweise abrufen und übermitteln; nach dem Staatsvertrag ist das Bundesverwaltungsamt für seinen Betrieb verantwortlich. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): Dataport stellt die Produktionsumgebung in seinem Twin Data Center bereit; wo das Rechenzentrum steht, sagen die gelesenen Quellen nicht.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): SEITENBAU entwickelt die Softwarekomponenten, Dataport baut und betreut sie, und das Bundesverwaltungsamt trägt die Betriebsverantwortung.\n- **Plattform** ({{fact:score.layer.platform}}): ein Technologiestack, den Dataport vorgibt; keine gelesene Quelle nennt seine Produkte, daher ist ihr Hersteller eine Lücke.\n- **Basisdienste** ({{fact:score.layer.base_service}}): die zentralen Komponenten, etwa das Identitäts- und Zugriffsmanagement für Behörden und die Registerdatennavigation; die Minimalversion hat noch keine Vermittlungsstelle.\n- **Anwendungen**: Sie entfallen; die Onlinedienste und Register, die NOOTS nutzen, werden für sich bewertet.\n- **Oberfläche und Zugang**: NOOTS hat keine eigene Oberfläche, die die Quellen beschreiben.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
