/* Pre-run assessment of EUDI Wallet “d-you” (hand-authored, as of 2026-11-27): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/eudi-wallet.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["eudi-wallet"] = {
 "id": "eudi-wallet",
 "entry_id": "eudi-wallet",
 "source": "hand_authored",
 "as_of": "2026-11-27",
 "method_version": "1.0",
 "query": "EUDI Wallet",
 "steps": [
  {
   "say": {
    "en": "I look the EUDI wallet up in the catalogue, read the report on its start, the project's own pages and news reports on the prototype, and look for who builds, runs and distributes it.",
    "de": "Ich schlage die EUDI-Wallet im Katalog nach, lese den Bericht über ihren Start, die Seiten des Projekts und Berichte über den Prototyp und suche, wer sie baut, betreibt und verteilt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "EUDI Wallet"
   }
  },
  {
   "fetch": {
    "url": "https://borncity.com/news/d-you-startet-am-2-januar-2027-deutschlands-digitale-identitaet/",
    "title": "d-you startet am 2. Januar 2027: Deutschlands digitale Identität"
   }
  },
  {
   "search": {
    "query": "borncity EUDI Wallet Bundesdruckerei SPRIND Wallet Deutschland",
    "results": [
     {
      "url": "https://eudi-wallet.gov.de/en/about",
      "title": "eudi-wallet.gov.de"
     },
     {
      "url": "https://heise.de/-10418753",
      "title": "Demo of the EUDI wallet app: what the digital wallet can already do"
     },
     {
      "url": "https://eudi-wallet.gov.de/en/news/digitaler-ausweis",
      "title": "digitaler ausweis"
     },
     {
      "url": "https://netzpolitik.org/?p=512498",
      "title": "FAQ zur EUDI-WalletDie wichtigsten Fragen und Antworten zur digitalen Brieftasche"
     },
     {
      "url": "https://heise.de/-10417676",
      "title": "eID: German version of the EUDI wallet with cloud-based key storage"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://eudi-wallet.gov.de/en/about",
    "title": "The national EUDI Wallet Project | EUDI-Wallet"
   }
  },
  {
   "fetch": {
    "url": "https://netzpolitik.org/?p=512498",
    "title": "FAQ zur EUDI-Wallet: Die wichtigsten Fragen und Antworten zur digitalen Brieftasche"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "EUDI Wallet",
     "d-you",
     "staatliche EUDI-Wallet"
    ],
    "category": "base_service",
    "what": {
     "en": "The state EUDI wallet for Germany, with a digital ID that the Bundesdruckerei issues and that is equivalent to a physical ID card.",
     "de": "Die staatliche EUDI-Wallet für Deutschland, mit einem digitalen Ausweis, den die Bundesdruckerei ausstellt und der einem physischen Ausweis gleichwertig ist."
    },
    "how": {
     "en": "A smartphone app that the Federal Government wants to offer in the Apple and Google stores; it builds on the open-source reference implementation of the EU Commission.",
     "de": "Eine Smartphone-App, die die Bundesregierung in den Stores von Apple und Google anbieten will; sie baut auf der quelloffenen Referenzimplementierung der EU-Kommission auf."
    },
    "owner": {
     "name": "Bundesministerium für Digitales und Staatsmodernisierung (BMDS)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Common Code (SPRIND)",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In development; it is to go live under the name d-you.",
     "de": "In Entwicklung; sie soll unter dem Namen d-you an den Start gehen."
    },
    "evidence": [
     {
      "url": "https://eudi-wallet.gov.de/en/about",
      "title": "The national EUDI Wallet Project | EUDI-Wallet",
      "quote": "and is responsible for the development of the state EUDI Wallet and the establishment of the ecosystem.",
      "lang": "en",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://eudi-wallet.gov.de/en/about",
      "title": "The national EUDI Wallet Project | EUDI-Wallet",
      "quote": "On behalf of the Federal Ministry for Digital and State Modernization, SPRIND is leading the EUDI Wallet project",
      "lang": "en",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://heise.de/-10418753",
      "title": "Demo of the EUDI wallet app: what the digital wallet can already do",
      "quote": "The German government wants to make the application available in the Apple and Google stores",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://heise.de/-10418753",
      "title": "Demo of the EUDI wallet app: what the digital wallet can already do",
      "quote": "According to Sprind, this is based on the open-source code of a reference implementation of the EU Commission.",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://borncity.com/news/d-you-startet-am-2-januar-2027-deutschlands-digitale-identitaet/",
      "title": "d-you startet am 2. Januar 2027: Deutschlands digitale Identität",
      "quote": "Betrieben wird die d-you-App von Common Code, einer Einheit der Agentur für Sprunginnovationen (Sprind).",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://borncity.com/news/d-you-startet-am-2-januar-2027-deutschlands-digitale-identitaet/",
      "title": "d-you startet am 2. Januar 2027: Deutschlands digitale Identität",
      "quote": "Unter der Bezeichnung „d-you“ soll die Anwendung zum 2. Januar 2027 offiziell an den Start gehen.",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     }
    ]
   }
  },
  {
   "say": {
    "en": "Infrastructure: a report on the design says a cloud-based key storage is planned. No source read says who will make or run it, or where.",
    "de": "Infrastruktur: Ein Bericht zum Entwurf sagt, dass ein cloudbasierter Schlüsselspeicher geplant ist. Keine gelesene Quelle sagt, wer ihn herstellen oder betreiben wird und wo."
   }
  },
  {
   "fetch": {
    "url": "https://heise.de/-10417676",
    "title": "eID: German version of the EUDI wallet with cloud-based key storage"
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "infrastructure",
    "status": "no_evidence",
    "reason": {
     "en": "A cloud-based key storage with a high level of trust is planned, but no source read says who will make or run it, or where; nor does any say where the wallet's other server systems run.",
     "de": "Ein cloudbasierter Schlüsselspeicher mit hohem Vertrauensniveau ist geplant, doch keine gelesene Quelle sagt, wer ihn herstellen oder betreiben wird und wo; ebenso wenig, wo die übrigen Serversysteme der Wallet laufen."
    }
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "devsecops",
    "status": "no_evidence",
    "reason": {
     "en": "No source read describes how the wallet is built, tested and released, beyond that SPRIND leads its development with partners.",
     "de": "Keine gelesene Quelle beschreibt, wie die Wallet gebaut, getestet und veröffentlicht wird, außer dass SPRIND ihre Entwicklung mit Partnern leitet."
    }
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "platform",
    "status": "no_evidence",
    "reason": {
     "en": "No source read names the platform the wallet's server side runs on.",
     "de": "Keine gelesene Quelle nennt die Plattform, auf der die Serverseite der Wallet läuft."
    }
   }
  },
  {
   "say": {
    "en": "Base services: the digital ID in the wallet. The project's news page says the Bundesdruckerei issues it.",
    "de": "Basisdienste: der digitale Ausweis in der Wallet. Die Nachrichtenseite des Projekts sagt, dass die Bundesdruckerei ihn ausstellt."
   }
  },
  {
   "fetch": {
    "url": "https://eudi-wallet.gov.de/en/news/digitaler-ausweis",
    "title": "The digital ID in the EUDI Wallet | EUDI-Wallet"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Issuing the digital ID",
     "de": "Ausstellung des digitalen Ausweises"
    },
    "role": {
     "en": "Issues the digital ID that people keep in the wallet.",
     "de": "Stellt den digitalen Ausweis aus, den Menschen in der Wallet halten."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bundesdruckerei GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bundesdruckerei GmbH",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://eudi-wallet.gov.de/en/news/digitaler-ausweis",
      "title": "The digital ID in the EUDI Wallet | EUDI-Wallet",
      "quote": "It is officially issued by Bundesdruckerei and is therefore equivalent to a physical ID card.",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Applications: the wallet app itself. SPRIND develops it, and a unit of SPRIND is to run it.",
    "de": "Anwendungen: die Wallet-App selbst. SPRIND entwickelt sie, und eine Einheit von SPRIND soll sie betreiben."
   }
  },
  {
   "fetch": {
    "url": "https://heise.de/-10418753",
    "title": "Demo of the EUDI wallet app: what the digital wallet can already do"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "The wallet app d-you",
     "de": "Die Wallet-App d-you"
    },
    "role": {
     "en": "Keeps the digital ID and other credentials on the smartphone and shows them on request.",
     "de": "Hält den digitalen Ausweis und weitere Nachweise auf dem Smartphone und zeigt sie auf Anfrage vor."
    },
    "note": {
     "en": "It builds on the open-source reference implementation of the EU Commission, and its source code is said to be openly accessible; no source read names its licence.",
     "de": "Sie baut auf der quelloffenen Referenzimplementierung der EU-Kommission auf, und ihr Quellcode soll offen zugänglich sein; keine gelesene Quelle nennt ihre Lizenz."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bundesagentur für Sprunginnovationen (SPRIND)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Common Code (SPRIND)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://eudi-wallet.gov.de/en/about",
      "title": "The national EUDI Wallet Project | EUDI-Wallet",
      "quote": "and is responsible for the development of the state EUDI Wallet and the establishment of the ecosystem.",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://netzpolitik.org/?p=512498",
      "title": "FAQ zur EUDI-Wallet: Die wichtigsten Fragen und Antworten zur digitalen Brieftasche",
      "quote": "Die Umsetzung erfolgt durch die Bundesagentur für Sprunginnovationen (Sprind) in Zusammenarbeit mit Partnern.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://borncity.com/news/d-you-startet-am-2-januar-2027-deutschlands-digitale-identitaet/",
      "title": "d-you startet am 2. Januar 2027: Deutschlands digitale Identität",
      "quote": "Betrieben wird die d-you-App von Common Code, einer Einheit der Agentur für Sprunginnovationen (Sprind).",
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
   "say": {
    "en": "Interface and access: the Federal Government wants to offer the app in the stores of Apple and Google. I read the bundled reference facts on app distribution and who the two companies are.",
    "de": "Oberfläche und Zugang: Die Bundesregierung will die App in den Stores von Apple und Google anbieten. Ich lese die mitgelieferten Referenzfakten zum App-Vertrieb und wer die beiden Unternehmen sind."
   }
  },
  {
   "tool": "ref_facts",
   "input": {
    "topic": "app_distribution"
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
    "url": "https://policies.google.com/terms",
    "title": "Google Terms of Service – Privacy & Terms – Google"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "d-you in Apple's store",
     "de": "d-you im Store von Apple"
    },
    "role": {
     "en": "Brings the app to iPhones.",
     "de": "Bringt die App auf iPhones."
    },
    "note": {
     "en": "In the European Union, iPhone users can also install alternative app marketplaces, which Apple neither makes nor manages.",
     "de": "In der Europäischen Union können iPhone-Nutzende auch alternative App-Marktplätze installieren, die Apple weder herstellt noch betreibt."
    },
    "criticality": "important",
    "tech": {
     "name": "Apple Inc.",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Apple Inc.",
     "country": "US",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Legal - Privacy Policy Affiliated Company - Apple",
      "quote": "Apple Inc., located at One Apple Park Way, Cupertino, California, United States",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://heise.de/-10418753",
      "title": "Demo of the EUDI wallet app: what the digital wallet can already do",
      "quote": "The German government wants to make the application available in the Apple and Google stores",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
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
    "confidence": "medium"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "d-you in Google's store",
     "de": "d-you im Store von Google"
    },
    "role": {
     "en": "Brings the app to Android phones.",
     "de": "Bringt die App auf Android-Smartphones."
    },
    "criticality": "important",
    "tech": {
     "name": "Google LLC",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Google LLC",
     "country": "US",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://policies.google.com/terms",
      "title": "Google Terms of Service – Privacy & Terms – Google",
      "quote": "Google LLC organized under the laws of the State of Delaware, USA, and operating under the laws of the USA",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://heise.de/-10418753",
      "title": "Demo of the EUDI wallet app: what the digital wallet can already do",
      "quote": "The German government wants to make the application available in the Apple and Google stores",
      "lang": "en",
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
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. German public bodies issue the ID and build and run the app; the app stores belong to US companies, and where the key storage and the server systems run is open.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Deutsche öffentliche Stellen stellen den Ausweis aus und bauen und betreiben die App; die App-Stores gehören US-Unternehmen, und wo Schlüsselspeicher und Serversysteme laufen, ist offen."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Four building blocks; infrastructure, development and platform have no evidence. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The two app stores are at {{fact:seal.B-03}} and {{fact:seal.B-04}}. Please check, correct or confirm.",
     "de": "Vier Bausteine; für Infrastruktur, Entwicklung und Plattform fehlen Belege. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Die beiden App-Stores stehen auf {{fact:seal.B-03}} und {{fact:seal.B-04}}. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-03",
     "B-04"
    ]
   }
  },
  {
   "say": {
    "en": "For the two app stores I look for what public sources name as alternatives: starting points for research, not a recommendation.",
    "de": "Für die beiden App-Stores suche ich, was öffentliche Quellen als Alternativen nennen: Ansatzpunkte für die Recherche, keine Empfehlung."
   }
  },
  {
   "fetch": {
    "url": "https://techcrunch.com/2026/02/22/move-over-apple-meet-the-alternative-app-stores-available-in-the-eu-and-elsewhere/",
    "title": "Move over, Apple: Meet the alternative app stores available in the EU and elsewhere"
   }
  },
  {
   "fetch": {
    "url": "https://www.macrumors.com/2024/06/04/aptoide-marketplace-games-ios",
    "title": "Aptoide Launching Alternative iOS Game Marketplace in EU"
   }
  },
  {
   "fetch": {
    "url": "https://www.popsci.com/diy/f-droid-download/",
    "title": "What is F-Droid and how to set it up | Popular Science"
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-03",
      "run_by": "EU"
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
       "en": "Distribute d-you on iPhones through an app marketplace run in the EU",
       "de": "d-you für iPhones über einen in der EU betriebenen App-Marktplatz vertreiben"
      },
      "rationale": {
       "en": "In the EU, iPhone users can install alternative app marketplaces. If d-you reached iPhones through a marketplace run in the EU rather than the phone maker's store, the overall score would be {{fact:whatif.L1.overall}}; the app would still run on the phone maker's platform.",
       "de": "In der EU können iPhone-Nutzende alternative App-Marktplätze installieren. Erreichte d-you iPhones über einen in der EU betriebenen Marktplatz statt über den Store des Herstellers, läge der Gesamtwert bei {{fact:whatif.L1.overall}}; die App liefe weiter auf der Plattform des Herstellers."
      },
      "changes": [
       {
        "block_id": "B-03",
        "run_by": "EU"
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
       },
       {
        "url": "https://support.apple.com/en-mide/118110",
        "title": "About alternative app distribution - Apple Support",
        "quote": "Alternative app marketplaces aren't made or managed by Apple",
        "lang": "en",
        "supports": [
         "alternative"
        ],
        "verified": true
       }
      ]
     }
    ],
    "starting_points": [
     {
      "block_id": "B-03",
      "name": "AltStore PAL",
      "note": {
       "en": "An alternative app marketplace for iPhones in the EU that takes apps of other developers.",
       "de": "Ein alternativer App-Marktplatz für iPhones in der EU, der Apps anderer Entwickler aufnimmt."
      },
      "evidence": [
       {
        "url": "https://techcrunch.com/2026/02/22/move-over-apple-meet-the-alternative-app-stores-available-in-the-eu-and-elsewhere/",
        "title": "Move over, Apple: Meet the alternative app stores available in the EU and elsewhere",
        "quote": "AltStore PAL is an officially approved alternative app marketplace in the EU.",
        "lang": "en",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       }
      ]
     },
     {
      "block_id": "B-03",
      "name": "Onside",
      "note": {
       "en": "An alternative app store for iPhones in the EU.",
       "de": "Ein alternativer App-Store für iPhones in der EU."
      },
      "evidence": [
       {
        "url": "https://techcrunch.com/2026/02/22/move-over-apple-meet-the-alternative-app-stores-available-in-the-eu-and-elsewhere/",
        "title": "Move over, Apple: Meet the alternative app stores available in the EU and elsewhere",
        "quote": "Onside is an alternative iOS app store available in both the EU and, now, Japan, as of February 17, 2026",
        "lang": "en",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       }
      ]
     },
     {
      "block_id": "B-03",
      "name": "Skich",
      "note": {
       "en": "An alternative app store for iPhones in the EU.",
       "de": "Ein alternativer App-Store für iPhones in der EU."
      },
      "evidence": [
       {
        "url": "https://techcrunch.com/2026/02/22/move-over-apple-meet-the-alternative-app-stores-available-in-the-eu-and-elsewhere/",
        "title": "Move over, Apple: Meet the alternative app stores available in the EU and elsewhere",
        "quote": "Last March, Skich announced the launch of an alternative app store for EU users",
        "lang": "en",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       }
      ]
     },
     {
      "block_id": "B-04",
      "name": "Aptoide",
      "note": {
       "en": "An app store for Android phones, based in Lisbon.",
       "de": "Ein App-Store für Android-Telefone mit Sitz in Lissabon."
      },
      "tech": {
       "name": "Aptoide",
       "country": "PT",
       "parent": null
      },
      "operator": {
       "name": "Aptoide",
       "country": "PT",
       "parent": null
      },
      "evidence": [
       {
        "url": "https://www.macrumors.com/2024/06/04/aptoide-marketplace-games-ios",
        "title": "Aptoide Launching Alternative iOS Game Marketplace in EU",
        "quote": "Aptoide, a popular Google Play alternative for Android devices, will be launching an iOS game marketplace",
        "lang": "en",
        "supports": [
         "alternative"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       },
       {
        "url": "https://techcrunch.com/2026/02/22/move-over-apple-meet-the-alternative-app-stores-available-in-the-eu-and-elsewhere/",
        "title": "Move over, Apple: Meet the alternative app stores available in the EU and elsewhere",
        "quote": "An alternative game store for iPhone, Lisbon-based Aptoide is an open source solution for app distribution.",
        "lang": "en",
        "supports": [
         "tech",
         "operator"
        ],
        "verified": true,
        "read_on": "2026-11-27"
       }
      ]
     },
     {
      "block_id": "B-04",
      "name": "F-Droid",
      "note": {
       "en": "An app store for Android that takes only open-source apps.",
       "de": "Ein App-Store für Android, der nur quelloffene Apps aufnimmt."
      },
      "evidence": [
       {
        "url": "https://www.popsci.com/diy/f-droid-download/",
        "title": "What is F-Droid and how to set it up | Popular Science",
        "quote": "This app store is an alternative to Google Play and only includes open-source applications",
        "lang": "en",
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
    "findings": {
     "en": "# EUDI Wallet: findings\n\nThe state EUDI wallet for Germany is in development and is to go live under the name d-you; SPRIND leads the project on behalf of the BMDS. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure**: a cloud-based key storage with a high level of trust is planned; no source read says who will make or run it, or where the wallet's server systems run.\n- **Development, security and operations**: no source read describes them beyond SPRIND's lead.\n- **Platform**: no source read names the platform of the server side.\n- **Base services** ({{fact:score.layer.base_service}}): the Bundesdruckerei issues the digital ID, which is equivalent to a physical ID card.\n- **Applications** ({{fact:score.layer.applications}}): the app d-you, developed by SPRIND on the EU Commission's open-source reference implementation and to be run by Common Code, a unit of SPRIND.\n- **Interface and access** ({{fact:score.layer.access}}): the app is to be offered in the stores of Apple and Google, both US companies; in the EU, iPhone users can also install alternative marketplaces.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# EUDI-Wallet: Befunde\n\nDie staatliche EUDI-Wallet für Deutschland ist in Entwicklung und soll unter dem Namen d-you an den Start gehen; SPRIND leitet das Projekt im Auftrag des BMDS. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur**: Ein cloudbasierter Schlüsselspeicher mit hohem Vertrauensniveau ist geplant; keine gelesene Quelle sagt, wer ihn herstellen oder betreiben wird oder wo die Serversysteme der Wallet laufen.\n- **Entwicklung, Sicherheit und Betrieb**: Keine gelesene Quelle beschreibt sie über die Leitung durch SPRIND hinaus.\n- **Plattform**: Keine gelesene Quelle nennt die Plattform der Serverseite.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Die Bundesdruckerei stellt den digitalen Ausweis aus, der einem physischen Ausweis gleichwertig ist.\n- **Anwendungen** ({{fact:score.layer.applications}}): die App d-you, von SPRIND auf der quelloffenen Referenzimplementierung der EU-Kommission entwickelt und künftig von Common Code betrieben, einer Einheit von SPRIND.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): Die App soll in den Stores von Apple und Google angeboten werden, beides US-Unternehmen; in der EU können iPhone-Nutzende auch alternative Marktplätze installieren.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
