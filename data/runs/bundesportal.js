/* Pre-run assessment of Federal Portal (Bundesportal) (hand-authored, as of 2026-11-19): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/bundesportal.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["bundesportal"] = {
 "id": "bundesportal",
 "entry_id": "bundesportal",
 "source": "hand_authored",
 "as_of": "2026-11-19",
 "method_version": "1.0",
 "query": "Bundesportal",
 "steps": [
  {
   "say": {
    "en": "I look the Federal Portal up in the catalogue, read its legal basis and the Federation's plans for it, and look for who built and who runs it.",
    "de": "Ich schlage das Bundesportal im Katalog nach, lese seine Rechtsgrundlage und die Pläne des Bundes dafür und suche, wer es gebaut hat und wer es betreibt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Bundesportal"
   }
  },
  {
   "fetch": {
    "url": "https://www.gesetze-im-internet.de/egovg/__9a.html",
    "title": "§ 9a EGovG - Einzelnorm"
   }
  },
  {
   "fetch": {
    "url": "https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf",
    "title": "Deutschland-Stack, Sachstand",
    "pdf": true
   }
  },
  {
   "search": {
    "query": "\"Bundesportal\" betrieben ITZBund Antwort der Bundesregierung Drucksache",
    "results": [
     {
      "url": "https://www.bundestag.de/presse/hib/814130-814130",
      "title": "www.bundestag.de"
     },
     {
      "url": "https://dserver.bundestag.de/btd/21/064/2106478.pdf",
      "title": "dserver.bundestag.de"
     },
     {
      "url": "https://www.bundestag.de/webarchiv/presse/hib/2020_12/814130-814130",
      "title": "www.bundestag.de"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.bundestag.de/presse/hib/814130-814130",
    "title": "Umsetzung des Onlinezugangsgesetzes (hib 1402/2020)"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "Bundesportal",
     "Verwaltungsportal des Bundes"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "The administration portal of the Federation, provided by law to support the online work of the federal authorities.",
     "de": "Das Verwaltungsportal des Bundes, das per Gesetz die elektronische Verwaltungstätigkeit der Bundesbehörden unterstützt."
    },
    "how": {
     "en": "People find administrative services in the portal and start them online; proving one's identity through a user account is one of its basic functions.",
     "de": "Menschen finden im Portal Verwaltungsleistungen und starten sie online; der Identitätsnachweis über ein Nutzerkonto gehört zu seinen Basisfunktionen."
    },
    "owner": {
     "name": "Bundesrepublik Deutschland (Bund)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Informationstechnikzentrum Bund (ITZBund)",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In operation at verwaltung.bund.de; it is to become the DeutschlandPortal.",
     "de": "In Betrieb unter verwaltung.bund.de; es soll zum DeutschlandPortal werden."
    },
    "evidence": [
     {
      "url": "https://www.gesetze-im-internet.de/egovg/__9a.html",
      "title": "§ 9a EGovG - Einzelnorm",
      "quote": "Das Verwaltungsportal des Bundes nach § 1a Absatz 1 des Onlinezugangsgesetzes wird durch die dafür zuständige",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true
     },
     {
      "url": "https://www.gesetze-im-internet.de/egovg/__9a.html",
      "title": "§ 9a EGovG - Einzelnorm",
      "quote": "öffentliche Stelle zur fachunabhängigen und fachübergreifenden Unterstützung der elektronischen Verwaltungstätigkeit",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true
     },
     {
      "url": "https://www.gesetze-im-internet.de/egovg/__9a.html",
      "title": "§ 9a EGovG - Einzelnorm",
      "quote": "Ermöglichung des elektronischen Identitätsnachweises über ein Nutzerkonto nach § 2 Absatz 5 des Onlinezugangsgesetzes",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://www.bundestag.de/presse/hib/814130-814130",
      "title": "Umsetzung des Onlinezugangsgesetzes (hib 1402/2020)",
      "quote": "das von der Bundesdruckerei GmbH realisiert und dem Informationstechnikzentrum Bund (ITZBund) betrieben wird",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf",
      "title": "Deutschland-Stack, Sachstand",
      "quote": "Identifikation geeigneter Verwaltungsdienste im Bundesportal (künftig „DeutschlandPortal“)",
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
    "en": "Infrastructure: a parliamentary answer says the ITZBund runs the portal. I read the bundled reference facts on the Federation's IT.",
    "de": "Infrastruktur: Laut einer Antwort der Bundesregierung betreibt das ITZBund das Portal. Ich lese die mitgelieferten Referenzfakten zur IT des Bundes."
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
     "en": "Run the portal, which the ITZBund operates according to the Federal Government.",
     "de": "Betreiben das Portal, das laut Bundesregierung das ITZBund betreibt."
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
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.bundestag.de/presse/hib/814130-814130",
      "title": "Umsetzung des Onlinezugangsgesetzes (hib 1402/2020)",
      "quote": "das von der Bundesdruckerei GmbH realisiert und dem Informationstechnikzentrum Bund (ITZBund) betrieben wird",
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
   "tool": "rec_layer",
   "input": {
    "layer": "devsecops",
    "status": "no_evidence",
    "reason": {
     "en": "No source read describes how the portal is developed, tested and deployed; the parliamentary answer only says that the Bundesdruckerei built it.",
     "de": "Keine gelesene Quelle beschreibt, wie das Portal entwickelt, getestet und ausgerollt wird; die Antwort der Bundesregierung sagt nur, dass die Bundesdruckerei es gebaut hat."
    }
   }
  },
  {
   "say": {
    "en": "Platform: the portal runs on some software platform, such as a content management system. No source read names it.",
    "de": "Plattform: Das Portal läuft auf einer Software-Plattform, etwa einem Redaktionssystem. Keine gelesene Quelle nennt sie."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Software platform of the portal",
     "de": "Software-Plattform des Portals"
    },
    "role": {
     "en": "Carries the portal's pages and services.",
     "de": "Trägt die Seiten und Dienste des Portals."
    },
    "note": {
     "en": "The sources read do not name the content management system or the application platform, so who makes them is a gap; the ITZBund runs the portal.",
     "de": "Die gelesenen Quellen nennen weder das Redaktionssystem noch die Anwendungsplattform; wer sie herstellt, ist daher eine Lücke. Das ITZBund betreibt das Portal."
    },
    "criticality": "critical",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
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
    "evidence": [
     {
      "url": "https://www.bundestag.de/presse/hib/814130-814130",
      "title": "Umsetzung des Onlinezugangsgesetzes (hib 1402/2020)",
      "quote": "das von der Bundesdruckerei GmbH realisiert und dem Informationstechnikzentrum Bund (ITZBund) betrieben wird",
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
    "en": "Base services: people sign in with the BundID. I read its imprint and the Federation's plans for signing in.",
    "de": "Basisdienste: Menschen melden sich mit der BundID an. Ich lese ihr Impressum und die Pläne des Bundes zur Anmeldung."
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
    "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
    "title": "Deutschland-Stack: Wohin geht die Reise? (BMDS, Fachkongress des IT-Planungsrats)",
    "pdf": true
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
     "en": "Proves a person's identity before they start an online service.",
     "de": "Weist die Identität einer Person nach, bevor sie einen Onlinedienst startet."
    },
    "note": {
     "en": "The BundID's imprint names the AKDB as implementer and the ITZBund as operator; the Federation plans the EUDI wallet as a further way to sign in.",
     "de": "Das Impressum der BundID nennt die AKDB als Umsetzerin und das ITZBund als Betreiber; der Bund plant die EUDI-Wallet als weiteren Weg der Anmeldung."
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
    "exit": "possible",
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
      "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
      "title": "Deutschland-Stack: Wohin geht die Reise? (BMDS, Fachkongress des IT-Planungsrats)",
      "quote": "Digitale Authentifizierung der Antragsteller:innen via EUDI-Wallet bzw. BundID",
      "lang": "de",
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
    "en": "Applications: the portal itself. The parliamentary answer says who built it and who runs it.",
    "de": "Anwendungen: das Portal selbst. Die Antwort der Bundesregierung sagt, wer es gebaut hat und wer es betreibt."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "Software of the Federal Portal",
     "de": "Software des Bundesportals"
    },
    "role": {
     "en": "Lists the administrative services of the Federation, the Länder and the municipalities and leads to the online services.",
     "de": "Listet die Verwaltungsleistungen von Bund, Ländern und Kommunen und führt zu den Onlinediensten."
    },
    "note": {
     "en": "According to an answer of the Federal Government reported by the Bundestag, the Bundesdruckerei built the portal and the ITZBund runs it; the answer is several years old, and no newer source read says otherwise.",
     "de": "Laut einer vom Bundestag gemeldeten Antwort der Bundesregierung hat die Bundesdruckerei das Portal gebaut, und das ITZBund betreibt es; die Antwort ist einige Jahre alt, und keine neuere gelesene Quelle sagt etwas anderes."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bundesdruckerei GmbH",
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
    "evidence": [
     {
      "url": "https://www.bundestag.de/presse/hib/814130-814130",
      "title": "Umsetzung des Onlinezugangsgesetzes (hib 1402/2020)",
      "quote": "das von der Bundesdruckerei GmbH realisiert und dem Informationstechnikzentrum Bund (ITZBund) betrieben wird",
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
    "en": "Interface and access: the website verwaltung.bund.de in the browser.",
    "de": "Oberfläche und Zugang: die Website verwaltung.bund.de im Browser."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "Website verwaltung.bund.de",
     "de": "Website verwaltung.bund.de"
    },
    "role": {
     "en": "The pages in the browser on which people search for administrative services.",
     "de": "Die Seiten im Browser, auf denen Menschen Verwaltungsleistungen suchen."
    },
    "note": {
     "en": "The pages need JavaScript in the browser.",
     "de": "Die Seiten brauchen JavaScript im Browser."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bundesdruckerei GmbH",
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
    "evidence": [
     {
      "url": "https://www.bundestag.de/presse/hib/814130-814130",
      "title": "Umsetzung des Onlinezugangsgesetzes (hib 1402/2020)",
      "quote": "das von der Bundesdruckerei GmbH realisiert und dem Informationstechnikzentrum Bund (ITZBund) betrieben wird",
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
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. The blocks are made and run in Germany; the platform's maker is a gap.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Die Bausteine werden in Deutschland hergestellt und betrieben; der Hersteller der Plattform ist eine Lücke."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Five building blocks; development, security and operations have no evidence, and who makes the portal's platform is a gap. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The platform is at {{fact:seal.B-02}} because its maker is unknown. Please check, correct or confirm.",
     "de": "Fünf Bausteine; für Entwicklung, Sicherheit und Betrieb fehlen Belege, und wer die Plattform des Portals herstellt, ist eine Lücke. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Die Plattform steht auf {{fact:seal.B-02}}, weil ihr Hersteller unbekannt ist. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-02",
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
      "block_id": "B-02",
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
       "en": "Name the portal's platform and build it from European or open-source components",
       "de": "Die Plattform des Portals benennen und aus europäischen oder quelloffenen Komponenten bauen"
      },
      "rationale": {
       "en": "The sources do not say who makes the platform the portal runs on. The Deutschland-Stack asks that solutions be bought mainly on the European market or developed as open source. If the platform were made in the EU, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die Quellen sagen nicht, wer die Plattform herstellt, auf der das Portal läuft. Der Deutschland-Stack sieht vor, Lösungen vorrangig am europäischen Markt einzukaufen oder als Open Source zu entwickeln. Wäre die Plattform in der EU hergestellt, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-02",
        "made_in": "EU"
       }
      ],
      "evidence": [
       {
        "url": "https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf",
        "title": "Deutschland-Stack, Sachstand",
        "quote": "Lösungen werden primär am europäischen Markt eingekauft oder als Open Source entwickelt.",
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
     "en": "# Federal Portal: findings\n\nThe Federal Portal is the administration portal of the Federation at verwaltung.bund.de; it is to become the DeutschlandPortal. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): the ITZBund runs the portal; the consolidated IT of the Federation runs in the ITZBund's data centres, whose location the sources read do not state.\n- **Development, security and operations**: no source read describes how the portal is developed, tested and deployed.\n- **Platform** ({{fact:score.layer.platform}}): no source read names the content management system or the application platform; who makes them is a gap.\n- **Base services** ({{fact:score.layer.base_service}}): people sign in with the BundID, implemented by the AKDB and run by the ITZBund; the Federation plans the EUDI wallet as a further way to sign in.\n- **Applications** ({{fact:score.layer.applications}}): the Bundesdruckerei built the portal and the ITZBund runs it, according to an answer of the Federal Government that is several years old.\n- **Interface and access** ({{fact:score.layer.access}}): the website verwaltung.bund.de.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# Bundesportal: Befunde\n\nDas Bundesportal ist das Verwaltungsportal des Bundes unter verwaltung.bund.de; es soll zum DeutschlandPortal werden. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): Das ITZBund betreibt das Portal; die konsolidierte IT des Bundes läuft in den Rechenzentren des ITZBund, deren Standort die gelesenen Quellen nicht nennen.\n- **Entwicklung, Sicherheit und Betrieb**: Keine gelesene Quelle beschreibt, wie das Portal entwickelt, getestet und ausgerollt wird.\n- **Plattform** ({{fact:score.layer.platform}}): Keine gelesene Quelle nennt das Redaktionssystem oder die Anwendungsplattform; wer sie herstellt, ist eine Lücke.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Menschen melden sich mit der BundID an, umgesetzt von der AKDB und betrieben vom ITZBund; der Bund plant die EUDI-Wallet als weiteren Weg der Anmeldung.\n- **Anwendungen** ({{fact:score.layer.applications}}): Die Bundesdruckerei hat das Portal gebaut, und das ITZBund betreibt es, laut einer einige Jahre alten Antwort der Bundesregierung.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): die Website verwaltung.bund.de.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
