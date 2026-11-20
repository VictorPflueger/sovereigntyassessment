/* Pre-run assessment of DVC (German Administration Cloud) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/dvc.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["dvc"] = {
 "id": "dvc",
 "entry_id": "dvc",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "Deutsche Verwaltungscloud",
 "steps": [
  {
   "say": {
    "en": "I look the German Administration Cloud up in the catalogue, read its website and a conference talk on its operating platforms, and look for who the cloud providers and the operator are.",
    "de": "Ich schlage die Deutsche Verwaltungscloud im Katalog nach, lese ihre Website und einen Konferenzvortrag zu ihren Betriebsplattformen und suche, wer die Cloud-Anbieter und wer die Betreiberin sind."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Deutsche Verwaltungscloud"
   }
  },
  {
   "fetch": {
    "url": "https://www.deutsche-verwaltungscloud.de",
    "title": "Deutsche Verwaltungscloud – Startseite"
   }
  },
  {
   "fetch": {
    "url": "https://pretalx.com/public-it/talk/L93YNQ/",
    "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung"
   }
  },
  {
   "search": {
    "query": "govdigital Stack IT unterstützt die Genossenschaft der öffentlichen IT-Dienstleister",
    "results": [
     {
      "url": "https://channelpartner.de/a/stack-it-unterstuetzt-die-genossenschaft-der-oeffentlichen-it-dienstleister,3618413",
      "title": "govdigital: Stack IT unterstützt die Genossenschaft der öffentlichen IT-Dienstleister"
     },
     {
      "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
      "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
    "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform | ChannelPartner"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "Deutsche Verwaltungscloud",
     "DVC"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "The sovereign cloud foundation of the public administration in Germany.",
     "de": "Das souveräne Cloud-Fundament der öffentlichen Verwaltung in Deutschland."
    },
    "how": {
     "en": "Two operating platforms on sovereign private-sector cloud platforms, based on the cloud offerings of STACKIT and IONOS; public IT service providers are responsible for operations.",
     "de": "Zwei Betriebsplattformen auf souveränen privatwirtschaftlichen Cloud-Plattformen, auf Basis der Cloud-Angebote von StackIT und IONOS; öffentliche IT-Dienstleister tragen die Betriebsverantwortung."
    },
    "owner": {
     "name": "IT-Planungsrat",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "govdigital eG",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "Being built: the DVC first sets up two operating platforms.",
     "de": "Im Aufbau: Die DVC baut zunächst zwei Betriebsplattformen auf."
    },
    "governance": {
     "en": "Steered by the FITKO as a product of the IT-Planungsrat.",
     "de": "Als Produkt des IT-Planungsrats von der FITKO gesteuert."
    },
    "evidence": [
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Die Deutsche Verwaltungscloud (DVC) bildet das souveräne Cloud-Fundament der öffentlichen Verwaltung in Deutschland.",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true
     },
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Die DVC baut zunächst zwei DVC-Betriebsplattformen auf Basis souveräner privatwirtschaftlicher Cloud-Plattformen auf.",
      "lang": "de",
      "supports": [
       "how",
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://pretalx.com/public-it/talk/L93YNQ/",
      "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung",
      "quote": "auf Basis des souveränen Cloud-Angebots von StackIT und IONOS",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Dabei übernehmen öffentliche IT-Dienstleister die Betriebsverantwortung",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "wird als Produkt des deutschen IT-Planungsrats von der FITKO (Föderale IT-Kooperation) gesteuert.",
      "lang": "de",
      "supports": [
       "owner",
       "governance"
      ],
      "verified": true
     },
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Betreiberin ist govdigital eG.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
      "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform | ChannelPartner",
      "quote": "Govdigital eG ist das zentrale Kooperationsbündnis öffentlicher IT-Dienstleister in Deutschland.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     }
    ]
   }
  },
  {
   "say": {
    "en": "Infrastructure: the two operating platforms rest on the clouds of STACKIT and IONOS. I read who these providers are.",
    "de": "Infrastruktur: Die beiden Betriebsplattformen stehen auf den Clouds von StackIT und IONOS. Ich lese, wer diese Anbieter sind."
   }
  },
  {
   "fetch": {
    "url": "https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html",
    "title": "SVA ist beim KI-Projekt des Bundes dabei | ChannelPartner"
   }
  },
  {
   "fetch": {
    "url": "https://www.cio.de/article/3696729/bundesverwaltung-vergibt-cloud-grossauftrag-an-ionos.html",
    "title": "Air Gapping: Bundesverwaltung vergibt Cloud-Großauftrag an Ionos | CIO DE"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "DVC operating platform on STACKIT",
     "de": "DVC-Betriebsplattform auf StackIT"
    },
    "role": {
     "en": "One of the two operating platforms, based on STACKIT's cloud offering.",
     "de": "Eine der beiden Betriebsplattformen, auf Basis des Cloud-Angebots von StackIT."
    },
    "note": {
     "en": "Public IT service providers run the operating platforms; the sources read do not name them or say where the data centres are.",
     "de": "Öffentliche IT-Dienstleister betreiben die Betriebsplattformen; die gelesenen Quellen nennen sie nicht namentlich und sagen nicht, wo die Rechenzentren stehen."
    },
    "criticality": "critical",
    "tech": {
     "name": "STACKIT",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Öffentliche IT-Dienstleister (nicht namentlich genannt)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://pretalx.com/public-it/talk/L93YNQ/",
      "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung",
      "quote": "auf Basis des souveränen Cloud-Angebots von StackIT und IONOS",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.channelpartner.de/article/4176536/sva-ist-beim-ki-projekt-des-bundes-dabei.html",
      "title": "SVA ist beim KI-Projekt des Bundes dabei | ChannelPartner",
      "quote": "Deutsche IT-Dienstleister wie SVA und StackIT sind mit an Bord.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://pretalx.com/public-it/talk/L93YNQ/",
      "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung",
      "quote": "in Zusammenarbeit mit govdigital, zwei öffentlichen IT-Dienstleistern als Plattformbetreiber",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Dabei übernehmen öffentliche IT-Dienstleister die Betriebsverantwortung",
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
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "DVC operating platform on IONOS",
     "de": "DVC-Betriebsplattform auf IONOS"
    },
    "role": {
     "en": "The other operating platform, based on IONOS's cloud offering.",
     "de": "Die andere Betriebsplattform, auf Basis des Cloud-Angebots von IONOS."
    },
    "note": {
     "en": "A trade report on a federal cloud order to IONOS calls it a provider from Germany; the operators and the location of the data centres are not named.",
     "de": "Ein Fachbericht über einen Cloud-Auftrag des Bundes an IONOS nennt es einen Anbieter aus Deutschland; die Betreiber und der Standort der Rechenzentren werden nicht genannt."
    },
    "criticality": "critical",
    "tech": {
     "name": "IONOS",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Öffentliche IT-Dienstleister (nicht namentlich genannt)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://pretalx.com/public-it/talk/L93YNQ/",
      "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung",
      "quote": "auf Basis des souveränen Cloud-Angebots von StackIT und IONOS",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.cio.de/article/3696729/bundesverwaltung-vergibt-cloud-grossauftrag-an-ionos.html",
      "title": "Air Gapping: Bundesverwaltung vergibt Cloud-Großauftrag an Ionos | CIO DE",
      "quote": "Für die Verwaltung besonders sensibler Daten hat nun der Bund einem Anbieter aus Deutschland einen Großauftrag erteilt.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.cio.de/article/3696729/bundesverwaltung-vergibt-cloud-grossauftrag-an-ionos.html",
      "title": "Air Gapping: Bundesverwaltung vergibt Cloud-Großauftrag an Ionos | CIO DE",
      "quote": "Das ITZBund (Dienstsitz Berlin) setzt auf eine Private Cloud von Ionos.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://pretalx.com/public-it/talk/L93YNQ/",
      "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung",
      "quote": "in Zusammenarbeit mit govdigital, zwei öffentlichen IT-Dienstleistern als Plattformbetreiber",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Dabei übernehmen öffentliche IT-Dienstleister die Betriebsverantwortung",
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
    "en": "Development, security and operations: govdigital, the cooperative of public IT service providers, operates the DVC.",
    "de": "Entwicklung, Sicherheit und Betrieb: govdigital, die Genossenschaft öffentlicher IT-Dienstleister, betreibt die DVC."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Operation of the DVC by govdigital",
     "de": "Betrieb der DVC durch govdigital"
    },
    "role": {
     "en": "Operates the DVC together with the public IT service providers that run the platforms.",
     "de": "Betreibt die DVC gemeinsam mit den öffentlichen IT-Dienstleistern, die die Plattformen betreiben."
    },
    "criticality": "important",
    "tech": {
     "name": "govdigital eG",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "govdigital eG",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Betreiberin ist govdigital eG.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
      "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform | ChannelPartner",
      "quote": "Govdigital eG ist das zentrale Kooperationsbündnis öffentlicher IT-Dienstleister in Deutschland.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://pretalx.com/public-it/talk/L93YNQ/",
      "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung",
      "quote": "in Zusammenarbeit mit govdigital, zwei öffentlichen IT-Dienstleistern als Plattformbetreiber",
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
    "en": "Platform: the operating platforms run some platform software for the administrations' services. No source read names it.",
    "de": "Plattform: Die Betriebsplattformen betreiben eine Plattform-Software für die Dienste der Verwaltungen. Keine gelesene Quelle nennt sie."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Platform software of the DVC",
     "de": "Plattform-Software der DVC"
    },
    "role": {
     "en": "Carries the services that run on the operating platforms.",
     "de": "Trägt die Dienste, die auf den Betriebsplattformen laufen."
    },
    "note": {
     "en": "The sources read do not name the platform software, so who makes it is a gap; public IT service providers run the platforms.",
     "de": "Die gelesenen Quellen nennen die Plattform-Software nicht; wer sie herstellt, ist daher eine Lücke. Öffentliche IT-Dienstleister betreiben die Plattformen."
    },
    "criticality": "critical",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "Öffentliche IT-Dienstleister (nicht namentlich genannt)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://pretalx.com/public-it/talk/L93YNQ/",
      "title": "DVC – Die neuen Cloud-Betriebsplattformen für die öffentliche Verwaltung",
      "quote": "in Zusammenarbeit mit govdigital, zwei öffentlichen IT-Dienstleistern als Plattformbetreiber",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Dabei übernehmen öffentliche IT-Dienstleister die Betriebsverantwortung",
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
   "tool": "rec_layer",
   "input": {
    "layer": "base_service",
    "status": "no_evidence",
    "reason": {
     "en": "No source read names base services, such as identity or key management, that the DVC provides or relies on.",
     "de": "Keine gelesene Quelle nennt Basisdienste, etwa Identitäts- oder Schlüsselverwaltung, die die DVC bereitstellt oder nutzt."
    }
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "applications",
    "status": "not_applicable",
    "reason": {
     "en": "The DVC is the cloud foundation; the applications that run on it belong to the administrations that use it and are assessed on their own.",
     "de": "Die DVC ist das Cloud-Fundament; die Anwendungen darauf gehören den Verwaltungen, die sie nutzen, und werden für sich bewertet."
    },
    "evidence": [
     {
      "url": "https://www.deutsche-verwaltungscloud.de",
      "title": "Deutsche Verwaltungscloud – Startseite",
      "quote": "Die Deutsche Verwaltungscloud (DVC) bildet das souveräne Cloud-Fundament der öffentlichen Verwaltung in Deutschland.",
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
     "en": "No source read says how administrations order or reach the DVC's services.",
     "de": "Keine gelesene Quelle sagt, wie Verwaltungen die Dienste der DVC bestellen oder erreichen."
    }
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. German providers make the clouds, and German public IT service providers run them; who makes the platform software is a gap.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Deutsche Anbieter stellen die Clouds, und deutsche öffentliche IT-Dienstleister betreiben sie; wer die Plattform-Software herstellt, ist eine Lücke."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Four building blocks; base services and access have no evidence, and applications do not apply to a cloud foundation. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The platform software is at {{fact:seal.B-04}} because no source read names it. Please check, correct or confirm.",
     "de": "Vier Bausteine; für Basisdienste und Zugang fehlen Belege, und Anwendungen gehören nicht zu einem Cloud-Fundament. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Die Plattform-Software steht auf {{fact:seal.B-04}}, weil keine gelesene Quelle sie nennt. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-04"
    ]
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
       "en": "Name the platform software and build it from European or open-source components",
       "de": "Die Plattform-Software benennen und aus europäischen oder quelloffenen Komponenten bauen"
      },
      "rationale": {
       "en": "The sources do not say which platform software runs on the operating platforms. The Deutschland-Stack asks that solutions be bought mainly on the European market or developed as open source. If the platform software were made in the EU, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die Quellen sagen nicht, welche Plattform-Software auf den Betriebsplattformen läuft. Der Deutschland-Stack sieht vor, Lösungen vorrangig am europäischen Markt einzukaufen oder als Open Source zu entwickeln. Wäre die Plattform-Software in der EU hergestellt, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-04",
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
     "en": "# German Administration Cloud: findings\n\nThe DVC is the sovereign cloud foundation of the public administration in Germany, steered by the FITKO as a product of the IT-Planungsrat. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): two operating platforms, based on the cloud offerings of STACKIT and IONOS, both German providers; public IT service providers run them, but the sources read do not name them or say where the data centres are.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): govdigital, the cooperative of public IT service providers in Germany, operates the DVC.\n- **Platform** ({{fact:score.layer.platform}}): no source read names the platform software; who makes it is a gap.\n- **Base services**: no source read names any.\n- **Applications**: they do not apply to the cloud foundation itself; each application on it is assessed on its own.\n- **Interface and access**: no source read says how administrations order or reach the services.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# Deutsche Verwaltungscloud: Befunde\n\nDie DVC ist das souveräne Cloud-Fundament der öffentlichen Verwaltung in Deutschland, als Produkt des IT-Planungsrats von der FITKO gesteuert. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): zwei Betriebsplattformen auf Basis der Cloud-Angebote von StackIT und IONOS, beides deutsche Anbieter; öffentliche IT-Dienstleister betreiben sie, doch die gelesenen Quellen nennen sie nicht namentlich und sagen nicht, wo die Rechenzentren stehen.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): govdigital, die Genossenschaft öffentlicher IT-Dienstleister in Deutschland, betreibt die DVC.\n- **Plattform** ({{fact:score.layer.platform}}): Keine gelesene Quelle nennt die Plattform-Software; wer sie herstellt, ist eine Lücke.\n- **Basisdienste**: Keine gelesene Quelle nennt welche.\n- **Anwendungen**: Sie gehören nicht zum Cloud-Fundament selbst; jede Anwendung darauf wird für sich bewertet.\n- **Oberfläche und Zugang**: Keine gelesene Quelle sagt, wie Verwaltungen die Dienste bestellen oder erreichen.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
