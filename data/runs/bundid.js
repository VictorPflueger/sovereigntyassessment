/* Pre-run assessment of BundID (hand-authored, as of 2026-11-19): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/bundid.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["bundid"] = {
 "id": "bundid",
 "entry_id": "bundid",
 "source": "hand_authored",
 "as_of": "2026-11-19",
 "method_version": "1.0",
 "query": "BundID",
 "steps": [
  {
   "say": {
    "en": "I look BundID up in the catalogue and read its own site, whose imprint names who built and who runs it.",
    "de": "Ich schlage die BundID im Katalog nach und lese ihre eigene Seite, deren Impressum nennt, wer sie gebaut hat und wer sie betreibt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "BundID"
   }
  },
  {
   "fetch": {
    "url": "https://id.bund.de/en/",
    "title": "BundID"
   }
  },
  {
   "fetch": {
    "url": "https://www.arbeitsagentur.de/bundid",
    "title": "Die BundID: sicherer Zugang zu allen eServices | Bundesagentur für Arbeit"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "BundID",
     "Nutzerkonto Bund"
    ],
    "category": "base_service",
    "what": {
     "en": "The federal user account with which people identify themselves for online administrative services.",
     "de": "Das Nutzerkonto des Bundes, mit dem sich Menschen für Online-Verwaltungsleistungen ausweisen."
    },
    "how": {
     "en": "People sign in at id.bund.de with the online ID, an ELSTER certificate or certain EU identities; the account passes the verified identity to the online service.",
     "de": "Menschen melden sich unter id.bund.de mit dem Online-Ausweis, einem ELSTER-Zertifikat oder einzelnen EU-Identitäten an; das Konto gibt die geprüfte Identität an den Onlinedienst weiter."
    },
    "owner": {
     "name": "Bundesministerium für Digitales und Staatsmodernisierung (BMDS)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Informationstechnikzentrum Bund (ITZBund)",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In operation; the site is offered by the BMDS, implemented by the AKDB and run by the ITZBund, according to its imprint.",
     "de": "In Betrieb; laut Impressum ein Angebot des BMDS, umgesetzt von der AKDB und betrieben vom ITZBund."
    },
    "evidence": [
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Diese Webseite ist ein Angebot des Bundesministerium für Digitales und Staatsmodernisierung",
      "lang": "de",
      "supports": [
       "owner",
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Informationstechnikzentrum Bund (ITZBund)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.arbeitsagentur.de/bundid",
      "title": "Die BundID: sicherer Zugang zu allen eServices | Bundesagentur für Arbeit",
      "quote": "Anmeldung mit Benutzung der Zugangsart „ELSTER-Zertifikat“ und einzelnen „EU-Identitäten“.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://www.arbeitsagentur.de/bundid",
      "title": "Die BundID: sicherer Zugang zu allen eServices | Bundesagentur für Arbeit",
      "quote": "Einen Computer mit der AusweisApp und ein Smartphone mit der AusweisApp oder ein Personalausweis-Lesegerät.",
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
    "en": "Infrastructure: I read the bundled reference facts on the Federation's IT.",
    "de": "Infrastruktur: Ich lese die mitgelieferten Referenzfakten zur IT des Bundes."
   }
  },
  {
   "tool": "ref_facts",
   "input": {
    "topic": "federal_it"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "Data centres of the ITZBund",
     "de": "Rechenzentren des ITZBund"
    },
    "role": {
     "en": "Run the account, which the imprint assigns to the ITZBund for operation.",
     "de": "Betreiben das Konto, das laut Impressum das ITZBund betreibt."
    },
    "note": {
     "en": "The location of the data centres is not stated in the sources read.",
     "de": "Der Standort der Rechenzentren steht nicht in den gelesenen Quellen."
    },
    "criticality": "critical",
    "tech": {
     "name": "Informationstechnikzentrum Bund (ITZBund)",
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
    "exit": "hard",
    "evidence": [
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Informationstechnikzentrum Bund (ITZBund)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://bmds.bund.de/fileadmin/BMDS/Dokumente/AM_Gesamtarchitektur.pdf",
      "title": "Gesamtarchitektur für die Dienstekonsolidierung der IT des Bundes",
      "quote": "Der konsolidierte IT-Betrieb erfolgt in den Rechenzentren des zentralen IT-Dienstleister des Bundes (ITZBund)",
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
    "en": "Development, security and operations: a reference from a service partner describes the container platform the account runs on.",
    "de": "Entwicklung, Sicherheit und Betrieb: Eine Referenz eines Dienstleisters beschreibt die Container-Plattform, auf der das Konto läuft."
   }
  },
  {
   "fetch": {
    "url": "https://www.sva.de/sites/default/files/2021-11/SVA%20Referenz%20ITZBund.pdf",
    "title": "ITZBund stärkt Digitalisierung und Zukunftsfähigkeit (SVA, Referenz)",
    "pdf": true
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Kubernetes platform at the ITZBund",
     "de": "Kubernetes-Plattform beim ITZBund"
    },
    "role": {
     "en": "Deploys and runs the account's services.",
     "de": "Stellt die Dienste des Kontos bereit und betreibt sie."
    },
    "note": {
     "en": "The ITZBund provides the platform together with two service partners, according to one of them.",
     "de": "Das ITZBund stellt die Plattform laut einem der beiden Dienstleister gemeinsam mit diesen bereit."
    },
    "criticality": "critical",
    "tech": {
     "name": "Informationstechnikzentrum Bund (ITZBund)",
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
    "exit": "possible",
    "evidence": [
     {
      "url": "https://www.sva.de/sites/default/files/2021-11/SVA%20Referenz%20ITZBund.pdf",
      "title": "ITZBund stärkt Digitalisierung und Zukunftsfähigkeit (SVA, Referenz)",
      "quote": "Das ITZBund stellt im Auftrag des BMI gemeinsam mit SVA und ARWINET eine KubernetesPlattform zur Verfügung",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.sva.de/sites/default/files/2021-11/SVA%20Referenz%20ITZBund.pdf",
      "title": "ITZBund stärkt Digitalisierung und Zukunftsfähigkeit (SVA, Referenz)",
      "quote": "auf welcher das Nutzerkonto Bund betrieben werden",
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
    "layer": "platform",
    "status": "no_evidence",
    "reason": {
     "en": "No source read names a data, integration or AI platform that the BundID itself relies on.",
     "de": "Keine gelesene Quelle nennt eine Daten-, Integrations- oder KI-Plattform, auf die die BundID selbst angewiesen ist."
    }
   }
  },
  {
   "say": {
    "en": "Base services: signing in with the online ID needs the AusweisApp. I read who develops it and under which licence.",
    "de": "Basisdienste: Die Anmeldung mit dem Online-Ausweis braucht die AusweisApp. Ich lese, wer sie entwickelt und unter welcher Lizenz."
   }
  },
  {
   "fetch": {
    "url": "https://www.ausweisapp.bund.de/en/about-us",
    "title": "AusweisApp: About us"
   }
  },
  {
   "fetch": {
    "url": "https://www.ausweisapp.bund.de/en/open-source",
    "title": "AusweisApp: Open Source Software"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Online ID with the AusweisApp",
     "de": "Online-Ausweis mit der AusweisApp"
    },
    "role": {
     "en": "Proves a person's identity when they sign in with the identity card.",
     "de": "Weist die Identität nach, wenn sich jemand mit dem Personalausweis anmeldet."
    },
    "note": {
     "en": "Other sign-in means are the ELSTER certificate and certain EU identities.",
     "de": "Weitere Zugangsarten sind das ELSTER-Zertifikat und einzelne EU-Identitäten."
    },
    "criticality": "important",
    "tech": {
     "name": "Governikus GmbH & Co. KG",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bundesamt für Sicherheit in der Informationstechnik (BSI)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "open_source",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://www.ausweisapp.bund.de/en/about-us",
      "title": "AusweisApp: About us",
      "quote": "Since 2014, Bremen-based Governikus GmbH & Co. KG is developing the application on behalf of the German Federal Office",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.ausweisapp.bund.de/en/open-source",
      "title": "AusweisApp: Open Source Software",
      "quote": "Under the EUPL licence, users can get the original source code, duplicate it, develop it further",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true
     },
     {
      "url": "https://www.ausweisapp.bund.de/en/open-source",
      "title": "AusweisApp: Open Source Software",
      "quote": "The source code of AusweisApp is therefore available on the online platform GitHub.",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Applications: the account itself, implemented by the AKDB and run by the ITZBund.",
    "de": "Anwendungen: das Konto selbst, umgesetzt von der AKDB und betrieben vom ITZBund."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "BundID account software",
     "de": "Software des BundID-Kontos"
    },
    "role": {
     "en": "Identifies people for online services as the federal identity provider.",
     "de": "Identifiziert Menschen für Onlinedienste als Identitätsanbieter des Bundes."
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
    "exit": "hard",
    "evidence": [
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Anstalt für Kommunale Datenverarbeitung in Bayern (AKDB)",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Informationstechnikzentrum Bund (ITZBund)",
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
    "en": "Interface and access: people sign in in the browser, and with the online ID through the AusweisApp, which iPhones get from the App Store.",
    "de": "Oberfläche und Zugang: Die Anmeldung läuft im Browser, mit dem Online-Ausweis über die AusweisApp, die iPhones aus dem App Store beziehen."
   }
  },
  {
   "fetch": {
    "url": "https://apps.apple.com/us/app/id948660805",
    "title": "AusweisApp Bund App - App Store"
   }
  },
  {
   "search": {
    "query": "Apple Inc. One Apple Park Way Cupertino California legal notice",
    "results": [
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Apple-Affiliated Companies"
     },
     {
      "url": "https://support.apple.com/guide/apple-invites/copyright-and-trademarks-dev2727afbbc/ios",
      "title": "support.apple.com"
     },
     {
      "url": "https://register.apple.com/resources/tou/register_en.html",
      "title": "register en"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
    "title": "Legal - Privacy Policy Affiliated Company - Apple"
   }
  },
  {
   "fetch": {
    "url": "https://support.apple.com/guide/apple-invites/copyright-and-trademarks-dev2727afbbc/ios",
    "title": "Copyright and trademarks - Apple Support"
   }
  },
  {
   "tool": "ref_facts",
   "input": {
    "topic": "app_distribution"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "Sign-in page at id.bund.de",
     "de": "Anmeldeseite unter id.bund.de"
    },
    "role": {
     "en": "Where people sign in, in their own browser.",
     "de": "Hier melden sich Menschen an, im eigenen Browser."
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
    "exit": "hard",
    "evidence": [
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Anstalt für Kommunale Datenverarbeitung in Bayern (AKDB)",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Informationstechnikzentrum Bund (ITZBund)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://id.bund.de/en/",
      "title": "BundID",
      "quote": "Ihr aktuell verwendeter Webbrowser unterstützt nicht alle Funktionen der BundID.",
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
    "layer": "access",
    "name": {
     "en": "AusweisApp on iPhones through the App Store",
     "de": "AusweisApp auf iPhones über den App Store"
    },
    "role": {
     "en": "Delivers the AusweisApp to iPhone users, who need it for the online ID.",
     "de": "Liefert iPhone-Nutzenden die AusweisApp, die sie für den Online-Ausweis brauchen."
    },
    "note": {
     "en": "In the EU, alternative app marketplaces exist on iPhones; a card reader on a computer is another way to sign in.",
     "de": "In der EU gibt es auf iPhones alternative App-Marktplätze; ein Kartenlesegerät am Computer ist ein weiterer Weg zur Anmeldung."
    },
    "criticality": "important",
    "tech": {
     "name": "Apple Inc.",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Apple Distribution International Ltd.",
     "country": "IE",
     "parent": {
      "name": "Apple Inc.",
      "country": "US"
     }
    },
    "hosting": "UNKNOWN",
    "licence": "proprietary",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://support.apple.com/guide/apple-invites/copyright-and-trademarks-dev2727afbbc/ios",
      "title": "Copyright and trademarks - Apple Support",
      "quote": "App Store, iCloud, and iCloud+ are service marks of Apple Inc., registered in the U.S. and other countries and regions.",
      "lang": "en",
      "supports": [
       "tech",
       "licence"
      ],
      "verified": true
     },
     {
      "url": "https://apps.apple.com/us/app/id948660805",
      "title": "AusweisApp Bund App - App Store",
      "quote": "on the App Store",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Legal - Privacy Policy Affiliated Company - Apple",
      "quote": "Apple Distribution International Ltd., located at Hollyhill Industrial Estate, Hollyhill, Cork, Republic of Ireland",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Legal - Privacy Policy Affiliated Company - Apple",
      "quote": "Apple Inc., located at One Apple Park Way, Cupertino, California, United States",
      "lang": "en",
      "supports": [
       "operator.parent"
      ],
      "verified": true
     },
     {
      "url": "https://support.apple.com/en-mide/118110",
      "title": "About alternative app distribution - Apple Support",
      "quote": "Users in Brazil, Japan, or the European Union can install an alternative app marketplace by downloading it directly",
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
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. The access layer scores {{fact:score.layer.access}}, because iPhone users get the AusweisApp from a store whose operator belongs to a US group.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Die Zugangsebene erreicht {{fact:score.layer.access}}, weil iPhone-Nutzende die AusweisApp aus einem Store beziehen, dessen Betreiber zu einem US-Konzern gehört."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Six building blocks in five layers; no platform evidence. The overall score is {{fact:score.overall}}, indicative. The lowest level is the AusweisApp's distribution on iPhones, {{fact:seal.B-06}}. Please check, correct or confirm.",
     "de": "Sechs Bausteine in fünf Ebenen; keine Belege zur Plattform. Der Gesamtwert ist {{fact:score.overall}}, indikativ. Die niedrigste Stufe hat die Verteilung der AusweisApp auf iPhones, {{fact:seal.B-06}}. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-06"
    ]
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-06",
      "made_in": "EU",
      "run_by": "EU",
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
       "en": "Also offer the AusweisApp through an app marketplace run in the EU",
       "de": "Die AusweisApp auch über einen App-Marktplatz mit Betrieb in der EU anbieten"
      },
      "rationale": {
       "en": "In the EU, iPhone users can install alternative app marketplaces, so the app need not depend on one store. The overall score would be {{fact:whatif.L1.overall}}.",
       "de": "In der EU können iPhone-Nutzende alternative App-Marktplätze installieren; die App muss also nicht von einem Store abhängen. Der Gesamtwert läge bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-06",
        "made_in": "EU",
        "run_by": "EU",
        "hosting": "EU"
       }
      ],
      "evidence": [
       {
        "url": "https://support.apple.com/en-mide/118110",
        "title": "About alternative app distribution - Apple Support",
        "quote": "Users in Brazil, Japan, or the European Union can install an alternative app marketplace by downloading it directly",
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
     "en": "# BundID: findings\n\nThe BundID is the federal user account for online administrative services. According to its imprint, the site is offered by the BMDS, implemented by the AKDB and run by the ITZBund. Its overall score is {{fact:score.overall}}, indicative.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): the account runs at the ITZBund, whose data centres carry the Federation's consolidated IT.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): a service partner's reference names a Kubernetes platform at the ITZBund on which the account runs.\n- **Platform**: no source read names a platform the account relies on.\n- **Base services** ({{fact:score.layer.base_service}}): signing in with the online ID uses the AusweisApp, developed by Governikus on behalf of the BSI and published as open source.\n- **Applications** ({{fact:score.layer.applications}}): the account software comes from the AKDB.\n- **Interface and access** ({{fact:score.layer.access}}): people sign in in the browser; on iPhones the AusweisApp comes from the App Store, which Apple Distribution International operates for European users as part of the Apple group.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}. Evidence coverage is {{fact:coverage}}; exclusive non-EU control of critical blocks is {{fact:share.exclusive_non_eu}}. Where the data centres are is not stated in the sources read.",
     "de": "# BundID: Befunde\n\nDie BundID ist das Nutzerkonto des Bundes für Online-Verwaltungsleistungen. Laut Impressum ist die Seite ein Angebot des BMDS, umgesetzt von der AKDB und betrieben vom ITZBund. Der Gesamtwert ist {{fact:score.overall}}, indikativ.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): Das Konto läuft beim ITZBund, in dessen Rechenzentren die konsolidierte IT des Bundes betrieben wird.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Die Referenz eines Dienstleisters nennt eine Kubernetes-Plattform beim ITZBund, auf der das Konto läuft.\n- **Plattform**: Keine gelesene Quelle nennt eine Plattform, auf die das Konto angewiesen ist.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Die Anmeldung mit dem Online-Ausweis nutzt die AusweisApp, die Governikus im Auftrag des BSI entwickelt und als Open Source veröffentlicht.\n- **Anwendungen** ({{fact:score.layer.applications}}): Die Software des Kontos stammt von der AKDB.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): Die Anmeldung läuft im Browser; auf iPhones kommt die AusweisApp aus dem App Store, den für europäische Nutzende Apple Distribution International als Teil des Apple-Konzerns betreibt.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}. Die Belegabdeckung beträgt {{fact:coverage}}; die ausschließliche Kontrolle kritischer Bausteine außerhalb der EU beträgt {{fact:share.exclusive_non_eu}}. Wo die Rechenzentren stehen, sagen die gelesenen Quellen nicht."
    }
   }
  }
 ]
};
})();
