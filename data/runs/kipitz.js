/* Pre-run assessment of KIPITZ (federal AI platform) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/kipitz.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["kipitz"] = {
 "id": "kipitz",
 "entry_id": "kipitz",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "KIPITZ",
 "steps": [
  {
   "say": {
    "en": "I look KIPITZ up in the catalogue, read the Bundestag's news item on it and the bundled reference facts on the Federation's IT, then look for who built it, who runs it and which language models it uses.",
    "de": "Ich schlage KIPITZ im Katalog nach, lese die Meldung des Bundestages dazu und die mitgelieferten Referenzfakten zur IT des Bundes und suche dann, wer es gebaut hat, wer es betreibt und welche Sprachmodelle es nutzt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "KIPITZ"
   }
  },
  {
   "fetch": {
    "url": "https://www.bundestag.de/presse/hib/kurzmeldungen-1202030",
    "title": "Bundesverwaltung nutzt KI als unterstützendes Werkzeug"
   }
  },
  {
   "tool": "ref_facts",
   "input": {
    "topic": "federal_it"
   }
  },
  {
   "search": {
    "query": "ITZBund treibt Multi-Cloud und KI voran KIPITZ",
    "results": [
     {
      "url": "https://www.cio.de/article/4068266/itzbund-treibt-multi-cloud-und-ki-voran.html",
      "title": "ITZBund treibt Multi-Cloud und KI voran"
     },
     {
      "url": "https://www.cio.de/article/4196059/christine-serrette-verlaesst-das-itzbund-und-kehrt-zu-cgi-zurueck.html",
      "title": "Christine Serrette verlässt das ITZBund und kehrt zu CGI zurück"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.cio.de/article/4068266/itzbund-treibt-multi-cloud-und-ki-voran.html",
    "title": "ITZBund treibt Multi-Cloud und KI voran | CIO DE"
   }
  },
  {
   "search": {
    "query": "So nutzt der öffentliche Dienst Künstliche Intelligenz KIPITZ",
    "results": [
     {
      "url": "https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/",
      "title": "So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/",
    "title": "So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern"
   }
  },
  {
   "fetch": {
    "url": "https://heise.de/-11127774",
    "title": "Invisible Revolution: Federal Government Flooding Administration with AI"
   }
  },
  {
   "search": {
    "query": "SVA ist beim KI-Projekt des Bundes dabei KIPITZ",
    "results": [
     {
      "url": "https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html",
      "title": "SVA ist beim KI-Projekt des Bundes dabei"
     },
     {
      "url": "https://www.channelpartner.de/article/4180038/schwarz-digits-knackt-600er-marke-beim-partner-okosystem.html",
      "title": "Schwarz Digits knackt 600er-Marke beim Partner-Ökosystem"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html",
    "title": "SVA ist beim KI-Projekt des Bundes dabei | ChannelPartner"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "KIPITZ",
     "KI-Plattform des ITZBund"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "The central AI platform of the federal administration, created by the ITZBund.",
     "de": "Die zentrale KI-Plattform der Bundesverwaltung, geschaffen vom ITZBund."
    },
    "how": {
     "en": "A portal through which the administration uses language models; the sources speak of open-source models, mostly from outside Europe, run inside the administration's own infrastructure.",
     "de": "Ein Portal, über das die Verwaltung Sprachmodelle nutzt; die Quellen sprechen von quelloffenen Modellen, überwiegend von außerhalb Europas, die in der eigenen Infrastruktur der Verwaltung laufen."
    },
    "owner": {
     "name": "Informationstechnikzentrum Bund (ITZBund)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Informationstechnikzentrum Bund (ITZBund)",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In operation; a trade report says that the IT service provider SVA already runs the KIPITZ system.",
     "de": "In Betrieb; laut einem Fachbericht betreibt der IT-Dienstleister SVA das KIPITZ-System bereits."
    },
    "evidence": [
     {
      "url": "https://www.bundestag.de/presse/hib/kurzmeldungen-1202030",
      "title": "Bundesverwaltung nutzt KI als unterstützendes Werkzeug",
      "quote": "die zentrale KI-Plattform der Bundesverwaltung KIPITZ, die in den Rechenzentren des ITZ Bund betrieben werde",
      "lang": "de",
      "supports": [
       "what",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/",
      "title": "So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern",
      "quote": "Auf Bundesebene hat das Informationstechnikzentrum Bund (ITZBund) eine KI-Plattform geschaffen: KIPITZ.",
      "lang": "de",
      "supports": [
       "what",
       "owner"
      ],
      "verified": true
     },
     {
      "url": "https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/",
      "title": "So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern",
      "quote": "Innerhalb von KIPITZ werden ausschließlich Open-Source-Sprachmodelle genutzt",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://heise.de/-11127774",
      "title": "Invisible Revolution: Federal Government Flooding Administration with AI",
      "quote": "The federal administration currently uses predominantly non-European open-source models, which are operated within the administration",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://heise.de/-11127774",
      "title": "Invisible Revolution: Federal Government Flooding Administration with AI",
      "quote": "Operated by the ITZBund service center, this portal is the answer to the administration",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html",
      "title": "SVA ist beim KI-Projekt des Bundes dabei | ChannelPartner",
      "quote": "SVA betreibt schon jetzt das KIPITZ-System, der Betrieb kann hier nahtlos weitergehen.",
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
    "en": "Infrastructure: the Federal Government says KIPITZ runs in the ITZBund's data centres.",
    "de": "Infrastruktur: Laut Bundesregierung läuft KIPITZ in den Rechenzentren des ITZBund."
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
     "en": "Run KIPITZ, according to the Federal Government.",
     "de": "Betreiben KIPITZ, laut Bundesregierung."
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
      "url": "https://www.bundestag.de/presse/hib/kurzmeldungen-1202030",
      "title": "Bundesverwaltung nutzt KI als unterstützendes Werkzeug",
      "quote": "die zentrale KI-Plattform der Bundesverwaltung KIPITZ, die in den Rechenzentren des ITZ Bund betrieben werde",
      "lang": "de",
      "supports": [
       "tech",
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
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Development, security and operations: a team at the ITZBund built the portal, and a trade report names the IT service provider SVA as the one that runs the system.",
    "de": "Entwicklung, Sicherheit und Betrieb: Ein Team im ITZBund hat das Portal entwickelt, und ein Fachbericht nennt den IT-Dienstleister SVA als Betreiber des Systems."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Development of KIPITZ at the ITZBund",
     "de": "Entwicklung von KIPITZ im ITZBund"
    },
    "role": {
     "en": "Built the AI portal on top of the ITZBund's cloud.",
     "de": "Hat das KI-Portal auf der Cloud des ITZBund aufgebaut."
    },
    "criticality": "important",
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
      "url": "https://www.cio.de/article/4068266/itzbund-treibt-multi-cloud-und-ki-voran.html",
      "title": "ITZBund treibt Multi-Cloud und KI voran | CIO DE",
      "quote": "Darauf aufbauend entwickelte das Team um Serrette das KI-Portal KIPITZ.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.cio.de/article/4068266/itzbund-treibt-multi-cloud-und-ki-voran.html",
      "title": "ITZBund treibt Multi-Cloud und KI voran | CIO DE",
      "quote": "verantwortlich für die technische Leitung des Informationstechnikzentrum Bund",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://heise.de/-11127774",
      "title": "Invisible Revolution: Federal Government Flooding Administration with AI",
      "quote": "Operated by the ITZBund service center, this portal is the answer to the administration",
      "lang": "en",
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
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Operation of the KIPITZ system by SVA",
     "de": "Betrieb des KIPITZ-Systems durch SVA"
    },
    "role": {
     "en": "Runs the KIPITZ system, according to a trade report.",
     "de": "Betreibt das KIPITZ-System, laut einem Fachbericht."
    },
    "note": {
     "en": "The trade report calls SVA a German IT service provider; how operations are split with the ITZBund is not stated.",
     "de": "Der Fachbericht nennt SVA einen deutschen IT-Dienstleister; wie der Betrieb mit dem ITZBund aufgeteilt ist, steht dort nicht."
    },
    "criticality": "important",
    "tech": {
     "name": "SVA",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "SVA",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html",
      "title": "SVA ist beim KI-Projekt des Bundes dabei | ChannelPartner",
      "quote": "Deutsche IT-Dienstleister wie SVA und StackIT sind mit an Bord.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html",
      "title": "SVA ist beim KI-Projekt des Bundes dabei | ChannelPartner",
      "quote": "SVA betreibt schon jetzt das KIPITZ-System, der Betrieb kann hier nahtlos weitergehen.",
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
   "say": {
    "en": "Platform: the language models. The sources say they are open-source models, mostly from outside Europe, run inside the administration's infrastructure, but they do not name the models.",
    "de": "Plattform: die Sprachmodelle. Die Quellen sagen, es seien quelloffene Modelle, überwiegend von außerhalb Europas, die in der Infrastruktur der Verwaltung laufen, nennen die Modelle aber nicht."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Language models",
     "de": "Sprachmodelle"
    },
    "role": {
     "en": "Generate the texts that the portal returns.",
     "de": "Erzeugen die Texte, die das Portal ausgibt."
    },
    "note": {
     "en": "The sources speak of open-source models, mostly from outside Europe, and say that proprietary models can be used as well; none names a model or its maker, so the maker's country is a gap.",
     "de": "Die Quellen sprechen von quelloffenen Modellen, überwiegend von außerhalb Europas, und sagen, dass auch proprietäre Modelle genutzt werden können; keine nennt ein Modell oder seinen Hersteller, daher ist das Land des Herstellers eine Lücke."
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
    "licence": "open_source",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://heise.de/-11127774",
      "title": "Invisible Revolution: Federal Government Flooding Administration with AI",
      "quote": "The federal administration currently uses predominantly non-European open-source models, which are operated within the administration",
      "lang": "en",
      "supports": [
       "operator",
       "licence"
      ],
      "verified": true
     },
     {
      "url": "https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/",
      "title": "So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern",
      "quote": "Innerhalb von KIPITZ werden ausschließlich Open-Source-Sprachmodelle genutzt",
      "lang": "de",
      "supports": [
       "licence"
      ],
      "verified": true
     },
     {
      "url": "https://www.cio.de/article/4068266/itzbund-treibt-multi-cloud-und-ki-voran.html",
      "title": "ITZBund treibt Multi-Cloud und KI voran | CIO DE",
      "quote": "Zum Einsatz kommen Open-Source-basierte Sprachmodelle, proprietäre Modelle können aber auch verwendet werden.",
      "lang": "de",
      "supports": [
       "licence"
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
     "en": "No source read names base services, such as sign-in or a directory, that KIPITZ relies on.",
     "de": "Keine gelesene Quelle nennt Basisdienste, etwa Anmeldung oder ein Verzeichnis, auf die KIPITZ angewiesen ist."
    }
   }
  },
  {
   "say": {
    "en": "Applications: the KIPITZ portal itself, which a report calls a closed-source proprietary development.",
    "de": "Anwendungen: das KIPITZ-Portal selbst, das ein Bericht eine proprietäre Eigenentwicklung mit geschlossenem Quellcode nennt."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "KIPITZ portal",
     "de": "KIPITZ-Portal"
    },
    "role": {
     "en": "The portal through which the administration uses the language models.",
     "de": "Das Portal, über das die Verwaltung die Sprachmodelle nutzt."
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
    "licence": "proprietary",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.cio.de/article/4068266/itzbund-treibt-multi-cloud-und-ki-voran.html",
      "title": "ITZBund treibt Multi-Cloud und KI voran | CIO DE",
      "quote": "Darauf aufbauend entwickelte das Team um Serrette das KI-Portal KIPITZ.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/",
      "title": "So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern",
      "quote": "Auf Bundesebene hat das Informationstechnikzentrum Bund (ITZBund) eine KI-Plattform geschaffen: KIPITZ.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://heise.de/-11127774",
      "title": "Invisible Revolution: Federal Government Flooding Administration with AI",
      "quote": "Operated by the ITZBund service center, this portal is the answer to the administration",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://heise.de/-11127774",
      "title": "Invisible Revolution: Federal Government Flooding Administration with AI",
      "quote": "closed-source proprietary development",
      "lang": "en",
      "supports": [
       "licence"
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
    "layer": "access",
    "status": "no_evidence",
    "reason": {
     "en": "No source read says how staff reach KIPITZ, for example in the browser or from their own applications.",
     "de": "Keine gelesene Quelle sagt, wie Beschäftigte KIPITZ erreichen, etwa im Browser oder aus eigenen Anwendungen."
    }
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. The ITZBund builds and runs the portal; who makes the language models is a gap.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Das ITZBund baut und betreibt das Portal; wer die Sprachmodelle herstellt, ist eine Lücke."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Five building blocks; base services and access have no evidence. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The language models are at {{fact:seal.B-04}} because no source read names them or their makers. Please check, correct or confirm.",
     "de": "Fünf Bausteine; für Basisdienste und Zugang fehlen Belege. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Die Sprachmodelle stehen auf {{fact:seal.B-04}}, weil keine gelesene Quelle sie oder ihre Hersteller nennt. Bitte prüfen, korrigieren oder bestätigen Sie."
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
       "en": "Use language models made in the EU",
       "de": "Sprachmodelle aus der EU nutzen"
      },
      "rationale": {
       "en": "The sources say KIPITZ uses open-source models, mostly from outside Europe, without naming them. Another administration uses a language model of a French provider, hosted on a German cloud. If the models were made in the EU, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die Quellen sagen, dass KIPITZ quelloffene Modelle nutzt, überwiegend von außerhalb Europas, ohne sie zu nennen. Eine andere Verwaltung nutzt das Sprachmodell eines französischen Anbieters, gehostet auf einer deutschen Cloud. Wären die Modelle in der EU hergestellt, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-04",
        "made_in": "EU"
       }
      ],
      "evidence": [
       {
        "url": "https://oeffentlicher-dienst-news.de/so-nutzt-der-oeffentliche-dienst-kuenstliche-intelligenz-bund-laender/",
        "title": "So nutzt der öffentliche Dienst Künstliche Intelligenz: Exklusive Umfrage bei Bund und Ländern",
        "quote": "nutzt das Sprachmodell des französischen Anbieters Mistral, gehostet auf der deutschen Cloud-Infrastruktur von Stackit",
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
     "en": "# KIPITZ: findings\n\nKIPITZ is the central AI platform of the federal administration, created by the ITZBund. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): KIPITZ runs in the ITZBund's data centres, according to the Federal Government; their location is not stated.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): a team at the ITZBund built the portal; a trade report says that the German IT service provider SVA already runs the KIPITZ system.\n- **Platform** ({{fact:score.layer.platform}}): open-source language models, mostly from outside Europe, run inside the administration's infrastructure; no source read names the models or their makers, so who makes them is a gap.\n- **Base services**: no source read names any.\n- **Applications** ({{fact:score.layer.applications}}): the KIPITZ portal, a closed-source proprietary development of the ITZBund.\n- **Interface and access**: no source read says how staff reach the portal.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# KIPITZ: Befunde\n\nKIPITZ ist die zentrale KI-Plattform der Bundesverwaltung, geschaffen vom ITZBund. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): KIPITZ läuft laut Bundesregierung in den Rechenzentren des ITZBund; deren Standort wird nicht genannt.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Ein Team im ITZBund hat das Portal entwickelt; laut einem Fachbericht betreibt der deutsche IT-Dienstleister SVA das KIPITZ-System bereits.\n- **Plattform** ({{fact:score.layer.platform}}): Quelloffene Sprachmodelle, überwiegend von außerhalb Europas, laufen in der Infrastruktur der Verwaltung; keine gelesene Quelle nennt die Modelle oder ihre Hersteller, daher ist deren Herkunft eine Lücke.\n- **Basisdienste**: Keine gelesene Quelle nennt welche.\n- **Anwendungen** ({{fact:score.layer.applications}}): das KIPITZ-Portal, eine proprietäre Eigenentwicklung des ITZBund mit geschlossenem Quellcode.\n- **Oberfläche und Zugang**: Keine gelesene Quelle sagt, wie Beschäftigte das Portal erreichen.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
