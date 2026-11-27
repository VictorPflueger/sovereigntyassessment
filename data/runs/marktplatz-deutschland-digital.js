/* Pre-run assessment of Marktplatz Deutschland Digital (MDD) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/marktplatz-deutschland-digital.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["marktplatz-deutschland-digital"] = {
 "id": "marktplatz-deutschland-digital",
 "entry_id": "marktplatz-deutschland-digital",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "Marktplatz Deutschland Digital",
 "steps": [
  {
   "say": {
    "en": "I look the Marktplatz Deutschland Digital up in the catalogue, read the conference slides and the news of its start, and look for who develops and runs it and what it is built on.",
    "de": "Ich schlage den Marktplatz Deutschland Digital im Katalog nach, lese die Konferenzfolien und die Meldung zu seinem Start und suche, wer ihn entwickelt und betreibt und worauf er aufbaut."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Marktplatz Deutschland Digital"
   }
  },
  {
   "fetch": {
    "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf",
    "title": "Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital",
    "pdf": true
   }
  },
  {
   "fetch": {
    "url": "https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/",
    "title": "Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb - Vergabeblog"
   }
  },
  {
   "search": {
    "query": "Marktplatz Deutschland Digital Cloud Service Portal govdigital Betrieb Dataport",
    "results": [
     {
      "url": "https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/",
      "title": "dbb magazin 10/2026"
     },
     {
      "url": "https://www.fitko.de/fileadmin/fitko/veranstaltungen/die_fitko_stellt_vor/20241002_FSV_DVC_IV_Handout.pdf",
      "title": "20241002 FSV DVC IV Handout"
     },
     {
      "url": "https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/",
      "title": "marktplatz deutschland digital mdd startet produktivbetrieb"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/",
    "title": "dbb magazin 10/2026 – Page 27"
   }
  },
  {
   "search": {
    "query": "fitko.de aktuelles Marktplatz Deutschland Digital startet Produktivbetrieb govdigital eG Betrieb",
    "results": [
     {
      "url": "https://www.it-planungsrat.de/aktuelles/details/marktplatz-deutschland-digital-startet-produktivbetrieb",
      "title": "Marktplatz Deutschland Digital startet Produktivbetrieb"
     },
     {
      "url": "https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/",
      "title": "Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb - Vergabeblog"
     },
     {
      "url": "https://www.fitko.de/presse/pressedetail/ein-marktplatz-fuer-alles-marktplatz-deutschland-digital-startet-produktivbetrieb",
      "title": "Ein Marktplatz für alle(s): Marktplatz Deutschland Digital startet Produktivbetrieb"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.it-planungsrat.de/aktuelles/details/marktplatz-deutschland-digital-startet-produktivbetrieb",
    "title": "Marktplatz Deutschland Digital startet Produktivbetrieb"
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
     "Marktplatz Deutschland Digital",
     "MDD"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "The procurement platform that brings the federal marketplaces together and opens up to private providers and further marketplaces; its offers are aimed at public organisations.",
     "de": "Die Beschaffungsplattform, die die föderalen Marktplätze zusammenführt und sich für private Anbieter und weitere Marktplätze öffnet; ihre Angebote richten sich an öffentliche Organisationen."
    },
    "how": {
     "en": "Technically it rests on the former Cloud Service Portal of the German Administration Cloud, a configured Shopware.",
     "de": "Technisch beruht sie auf dem bisherigen Cloud-Service-Portal der Deutschen Verwaltungscloud, einer konfigurierten Shopware."
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
     "en": "In production.",
     "de": "Im Produktivbetrieb."
    },
    "evidence": [
     {
      "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf",
      "title": "Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital",
      "quote": "Die Plattform führt die föderalen Marktplätze zusammen und öffnet sich gezielt für private Anbieter sowie",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf",
      "title": "Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital",
      "quote": "weitere Marktplätze.",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf",
      "title": "Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital",
      "quote": "Die Angebote richten sich an öffentliche Organisationen.",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/",
      "title": "Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb - Vergabeblog",
      "quote": "Technisch basiert er auf dem bisherigen Cloud-Service-Portal (CSP) der Deutschen Verwaltungscloud (DVC).",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf",
      "title": "Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital",
      "quote": "Technologische Basis für den Marktplatz Deutschland Digital ist das Cloud Service Portal (konfigurierte Shopware)",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/",
      "title": "dbb magazin 10/2026 – Page 27",
      "quote": "unter der Leitung des IT-Planungsrates – genauso wie der Marktplatz Deutschland Digital.",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/",
      "title": "Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb - Vergabeblog",
      "quote": "Der Marktplatz Deutschland Digital (MDD) ist am 19.03. offiziell in den Produktivbetrieb gestartet.",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/aktuelles/details/marktplatz-deutschland-digital-startet-produktivbetrieb",
      "title": "Marktplatz Deutschland Digital startet Produktivbetrieb",
      "quote": "Der Marktplatz Deutschland Digital wird als Produkt des IT-Planungsrats von der FITKO (Föderale IT-Kooperation) gesteuert.",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/aktuelles/details/marktplatz-deutschland-digital-startet-produktivbetrieb",
      "title": "Marktplatz Deutschland Digital startet Produktivbetrieb",
      "quote": "Betreiberin ist die govdigital eG.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
      "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform | ChannelPartner",
      "quote": "Govdigital eG ist das zentrale Kooperationsbündnis öffentlicher IT-Dienstleister in Deutschland.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     }
    ]
   }
  },
  {
   "say": {
    "en": "Infrastructure: no source read says where the marketplace is hosted.",
    "de": "Infrastruktur: Keine gelesene Quelle sagt, wo der Marktplatz gehostet wird."
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "infrastructure",
    "status": "no_evidence",
    "reason": {
     "en": "No source read says where the marketplace or the Cloud Service Portal is hosted, or by whom.",
     "de": "Keine gelesene Quelle sagt, wo der Marktplatz oder das Cloud-Service-Portal gehostet wird und von wem."
    }
   }
  },
  {
   "say": {
    "en": "Development, security and operations: a magazine of the civil servants' federation says the FITKO and the cooperative govdigital develop it under the IT-Planungsrat.",
    "de": "Entwicklung, Sicherheit und Betrieb: Ein Magazin des Beamtenbunds sagt, dass die FITKO und die Genossenschaft govdigital ihn unter Leitung des IT-Planungsrats entwickeln."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Development by the FITKO and govdigital",
     "de": "Entwicklung durch die FITKO und govdigital"
    },
    "role": {
     "en": "Develop the German Administration Cloud and, in the same way, the marketplace, under the IT-Planungsrat.",
     "de": "Entwickeln die Deutsche Verwaltungscloud und ebenso den Marktplatz, unter Leitung des IT-Planungsrats."
    },
    "criticality": "important",
    "tech": {
     "name": "Föderale IT-Kooperation (FITKO) und govdigital eG",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Föderale IT-Kooperation (FITKO) und govdigital eG",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/",
      "title": "dbb magazin 10/2026 – Page 27",
      "quote": "Entwickelt wird die DVC von der Föderalen IT-Kooperation (FITKO) und der Genossenschaft govdigital",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/",
      "title": "dbb magazin 10/2026 – Page 27",
      "quote": "unter der Leitung des IT-Planungsrates – genauso wie der Marktplatz Deutschland Digital.",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
      "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform | ChannelPartner",
      "quote": "Govdigital eG ist das zentrale Kooperationsbündnis öffentlicher IT-Dienstleister in Deutschland.",
      "lang": "de",
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
   "say": {
    "en": "Platform: the slides call the Cloud Service Portal, a configured Shopware, the marketplace's technical basis. I look up who makes Shopware.",
    "de": "Plattform: Die Folien nennen das Cloud-Service-Portal, eine konfigurierte Shopware, die technische Basis des Marktplatzes. Ich schlage nach, wer Shopware herstellt."
   }
  },
  {
   "search": {
    "query": "shopware AG Schöppingen open source MIT license Shopware 6 Community Edition",
    "results": [
     {
      "url": "https://t3n.de/news/shopware-6-version-1165877/",
      "title": "Unsere Marken MIT Technology Review Digital Bash"
     },
     {
      "url": "https://www.shopware.com/it/download/successful/",
      "title": "White checkmark on a green circle"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://t3n.de/news/shopware-6-version-1165877/",
    "title": "Shopware 6: Vom klassischen Shopsystem zur E-Commerce-Plattform"
   }
  },
  {
   "search": {
    "query": "shopware AG Impressum Ebbinghoff Schöppingen",
    "results": [
     {
      "url": "https://Shopware.com/en/contact/contact-financial/",
      "title": "contact financial"
     },
     {
      "url": "https://www.shopware.com/en/privacy/website/",
      "title": "www.shopware.com"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.shopware.com/en/privacy/website/",
    "title": "Privacy | Shopware"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Cloud Service Portal, a configured Shopware",
     "de": "Cloud-Service-Portal, eine konfigurierte Shopware"
    },
    "role": {
     "en": "The shop software the marketplace is built on.",
     "de": "Die Shop-Software, auf der der Marktplatz aufbaut."
    },
    "note": {
     "en": "Shopware's maker, shopware AG, has its address in Schöppingen, Germany; which edition and licence the portal uses is not stated. The cooperative govdigital runs the marketplace and the FITKO steers it, according to the IT-Planungsrat's news of its start.",
     "de": "Der Hersteller von Shopware, die shopware AG, hat seine Anschrift in Schöppingen, Deutschland; welche Edition und Lizenz das Portal nutzt, steht nicht in den Quellen. Die Genossenschaft govdigital betreibt den Marktplatz, und die FITKO steuert ihn, laut der Meldung des IT-Planungsrats zu seinem Start."
    },
    "criticality": "critical",
    "tech": {
     "name": "Shopware AG",
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
      "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf",
      "title": "Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital",
      "quote": "Technologische Basis für den Marktplatz Deutschland Digital ist das Cloud Service Portal (konfigurierte Shopware)",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://t3n.de/news/shopware-6-version-1165877/",
      "title": "Shopware 6: Vom klassischen Shopsystem zur E-Commerce-Plattform",
      "quote": "Der Hersteller aus Schöppingen hat den Bereich der reinen Shopsysteme verlassen",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.shopware.com/en/privacy/website/",
      "title": "Privacy | Shopware",
      "quote": "shopware AG Ebbinghoff 10 D-48624 Schöppingen Germany",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/aktuelles/details/marktplatz-deutschland-digital-startet-produktivbetrieb",
      "title": "Marktplatz Deutschland Digital startet Produktivbetrieb",
      "quote": "Betreiberin ist die govdigital eG.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
      "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform | ChannelPartner",
      "quote": "Govdigital eG ist das zentrale Kooperationsbündnis öffentlicher IT-Dienstleister in Deutschland.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
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
     "en": "No source read names base services, such as sign-in or payment, that the marketplace relies on.",
     "de": "Keine gelesene Quelle nennt Basisdienste, etwa Anmeldung oder Bezahlung, auf die der Marktplatz angewiesen ist."
    }
   }
  },
  {
   "say": {
    "en": "Applications: the marketplace itself, on the former Cloud Service Portal.",
    "de": "Anwendungen: der Marktplatz selbst, auf dem bisherigen Cloud-Service-Portal."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "Marktplatz Deutschland Digital",
     "de": "Marktplatz Deutschland Digital"
    },
    "role": {
     "en": "Brings the federal marketplaces together; providers offer their products to public organisations there.",
     "de": "Führt die föderalen Marktplätze zusammen; Anbieter bieten dort öffentlichen Organisationen ihre Produkte an."
    },
    "criticality": "critical",
    "tech": {
     "name": "Föderale IT-Kooperation (FITKO) und govdigital eG",
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
      "url": "https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/",
      "title": "dbb magazin 10/2026 – Page 27",
      "quote": "unter der Leitung des IT-Planungsrates – genauso wie der Marktplatz Deutschland Digital.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.dbb.de/fileadmin/user_upload/dbb/epaper/2026/dbb_magazin_26_10/27/",
      "title": "dbb magazin 10/2026 – Page 27",
      "quote": "Entwickelt wird die DVC von der Föderalen IT-Kooperation (FITKO) und der Genossenschaft govdigital",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/",
      "title": "Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb - Vergabeblog",
      "quote": "Technisch basiert er auf dem bisherigen Cloud-Service-Portal (CSP) der Deutschen Verwaltungscloud (DVC).",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/aktuelles/details/marktplatz-deutschland-digital-startet-produktivbetrieb",
      "title": "Marktplatz Deutschland Digital startet Produktivbetrieb",
      "quote": "Betreiberin ist die govdigital eG.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.channelpartner.de/article/4243773/sechs-bundeslander-starten-open-source-bildungsplattform.html",
      "title": "Sechs Bundesländer starten Open-Source-Bildungsplattform | ChannelPartner",
      "quote": "Govdigital eG ist das zentrale Kooperationsbündnis öffentlicher IT-Dienstleister in Deutschland.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
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
     "en": "No source read describes the marketplace's web interface or who runs it apart from the portal.",
     "de": "Keine gelesene Quelle beschreibt die Weboberfläche des Marktplatzes oder wer sie neben dem Portal betreibt."
    }
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. What the sources name is made and run in Germany; where the marketplace is hosted is open.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Was die Quellen nennen, wird in Deutschland hergestellt und betrieben; wo der Marktplatz gehostet wird, ist offen."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Three building blocks; infrastructure, base services and access have no evidence. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The open question is the hosting, which no source read names. Please check, correct or confirm.",
     "de": "Drei Bausteine; für Infrastruktur, Basisdienste und Zugang fehlen Belege. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Offen ist das Hosting, das keine gelesene Quelle nennt. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-02"
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
      "block_id": "B-03",
      "licence": "open_source"
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
       "en": "Publish the marketplace's own code as open source",
       "de": "Den eigenen Code des Marktplatzes als Open Source veröffentlichen"
      },
      "rationale": {
       "en": "The Deutschland-Stack asks that solutions be bought mainly on the European market or developed as open source. The blocks the sources name are already made and run in Germany, so the overall score would stay at {{fact:whatif.L1.overall}}: what this assessment lacks are sources on the hosting, not another supplier.",
       "de": "Der Deutschland-Stack sieht vor, Lösungen vorrangig am europäischen Markt einzukaufen oder als Open Source zu entwickeln. Die Bausteine, die die Quellen nennen, werden bereits in Deutschland hergestellt und betrieben; der Gesamtwert bliebe daher bei {{fact:whatif.L1.overall}}. Was dieser Bewertung fehlt, sind Quellen zum Hosting, kein anderer Anbieter."
      },
      "changes": [
       {
        "block_id": "B-03",
        "licence": "open_source"
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
        "verified": true,
        "read_on": "2026-11-20"
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
     "en": "# Marktplatz Deutschland Digital: findings\n\nThe Marktplatz Deutschland Digital brings the federal marketplaces together for public organisations and is in production. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure**: no source read says where the marketplace is hosted, or by whom.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): the FITKO and the cooperative govdigital develop it under the IT-Planungsrat.\n- **Platform** ({{fact:score.layer.platform}}): the former Cloud Service Portal of the German Administration Cloud, a configured Shopware, whose maker is based in Schöppingen; the cooperative govdigital runs the marketplace, which the FITKO steers for the IT-Planungsrat.\n- **Base services**: no source read names any.\n- **Applications** ({{fact:score.layer.applications}}): the marketplace itself.\n- **Interface and access**: no source read describes them apart from the portal.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}. The high score rests on few blocks: the gaps are in the sources, above all on the hosting.",
     "de": "# Marktplatz Deutschland Digital: Befunde\n\nDer Marktplatz Deutschland Digital führt die föderalen Marktplätze für öffentliche Organisationen zusammen und ist im Produktivbetrieb. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur**: Keine gelesene Quelle sagt, wo der Marktplatz gehostet wird und von wem.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Die FITKO und die Genossenschaft govdigital entwickeln ihn unter Leitung des IT-Planungsrats.\n- **Plattform** ({{fact:score.layer.platform}}): das bisherige Cloud-Service-Portal der Deutschen Verwaltungscloud, eine konfigurierte Shopware, deren Hersteller in Schöppingen sitzt; die Genossenschaft govdigital betreibt den Marktplatz, den die FITKO für den IT-Planungsrat steuert.\n- **Basisdienste**: Keine gelesene Quelle nennt welche.\n- **Anwendungen** ({{fact:score.layer.applications}}): der Marktplatz selbst.\n- **Oberfläche und Zugang**: Keine gelesene Quelle beschreibt sie neben dem Portal.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}. Der hohe Wert beruht auf wenigen Bausteinen: Die Lücken liegen in den Quellen, vor allem beim Hosting."
    }
   }
  }
 ]
};
})();
