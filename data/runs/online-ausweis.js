/* Pre-run assessment of Online ID (eID) (hand-authored, as of 2026-11-27): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/online-ausweis.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["online-ausweis"] = {
 "id": "online-ausweis",
 "entry_id": "online-ausweis",
 "source": "hand_authored",
 "as_of": "2026-11-27",
 "method_version": "1.0",
 "query": "Online-Ausweis",
 "steps": [
  {
   "say": {
    "en": "I look the online ID up in the catalogue and read the pages of the responsible federal authorities.",
    "de": "Ich schlage den Online-Ausweis im Katalog nach und lese die Seiten der zuständigen Bundesbehörden."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Online-Ausweis"
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
   "fetch": {
    "url": "https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-service/eid-service-node.html",
    "title": "eID Service"
   }
  },
  {
   "fetch": {
    "url": "https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-server/eid-server-node.html",
    "title": "eID Server"
   }
  },
  {
   "fetch": {
    "url": "https://dserver.bundestag.de/btd/20/130/2013075.pdf",
    "title": "BT-Drucksache 20/13075: Evolutionslösung für den elektronischen Personalausweis – eID",
    "pdf": true
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "Online-Ausweis",
     "eID-Funktion"
    ],
    "category": "base_service",
    "what": {
     "en": "The online ID function of the German identity card, with which people prove their identity to online services.",
     "de": "Die Online-Ausweisfunktion des deutschen Personalausweises, mit der Menschen ihre Identität gegenüber Onlinediensten nachweisen."
    },
    "how": {
     "en": "The card is read with the AusweisApp on a computer or smartphone; the service's eID server checks the data, using an authorisation certificate.",
     "de": "Die Karte wird mit der AusweisApp an Computer oder Smartphone ausgelesen; der eID-Server des Dienstes prüft die Daten mithilfe eines Berechtigungszertifikats."
    },
    "owner": {
     "name": "Bundesamt für Sicherheit in der Informationstechnik (BSI)",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "status": {
     "en": "In operation; a phone-only credential, the Smart-eID, was stopped by the Federal Government at the end of 2023.",
     "de": "In Betrieb; ein reines Smartphone-Verfahren, die Smart-eID, hat die Bundesregierung Ende 2023 gestoppt."
    },
    "evidence": [
     {
      "url": "https://www.ausweisapp.bund.de/en/about-us",
      "title": "AusweisApp: About us",
      "quote": "Since 2014, Bremen-based Governikus GmbH & Co. KG is developing the application on behalf of the German Federal Office for Information Security (BSI).",
      "lang": "en",
      "supports": [
       "owner"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-server/eid-server-node.html",
      "title": "eID Server",
      "quote": "The eID server consists of hardware and software components run by the service provider",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://dserver.bundestag.de/btd/20/130/2013075.pdf",
      "title": "BT-Drucksache 20/13075: Evolutionslösung für den elektronischen Personalausweis – eID",
      "quote": "Dieses Projekt wurde jedoch Ende 2023 von der Bundesregierung vorerst gestoppt",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ]
   }
  },
  {
   "tool": "rec_layer",
   "input": {
    "layer": "infrastructure",
    "status": "no_evidence",
    "reason": {
     "en": "No source read says where the central background systems of the online ID, such as the certificate and revocation systems, are hosted.",
     "de": "Keine gelesene Quelle sagt, wo die zentralen Hintergrundsysteme des Online-Ausweises, etwa Zertifikats- und Sperrsysteme, betrieben werden."
    }
   }
  },
  {
   "say": {
    "en": "Development, security and operations: the AusweisApp is developed by Governikus on behalf of the BSI.",
    "de": "Entwicklung, Sicherheit und Betrieb: Die AusweisApp entwickelt Governikus im Auftrag des BSI."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Development of the AusweisApp",
     "de": "Entwicklung der AusweisApp"
    },
    "role": {
     "en": "Builds and maintains the app that reads the identity card.",
     "de": "Baut und pflegt die App, die den Personalausweis ausliest."
    },
    "criticality": "critical",
    "tech": {
     "name": "Governikus GmbH & Co. KG",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Governikus GmbH & Co. KG",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "open_source",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.ausweisapp.bund.de/en/about-us",
      "title": "AusweisApp: About us",
      "quote": "Since 2014, Bremen-based Governikus GmbH & Co. KG is developing the application on behalf of the German Federal Office for Information Security (BSI).",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.ausweisapp.bund.de/en/open-source",
      "title": "AusweisApp: Open Source Software",
      "quote": "Under the EUPL licence, users can get the original source code, duplicate it, develop it further",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "high",
    "note": {
     "en": "Governikus develops the AusweisApp on behalf of the BSI, so the developer runs its development.",
     "de": "Governikus entwickelt die AusweisApp im Auftrag des BSI; die Entwicklung betreibt also der Entwickler."
    }
   }
  },
  {
   "say": {
    "en": "Platform: every service that reads the ID needs an eID server. I check who runs it and under which licence.",
    "de": "Plattform: Jeder Dienst, der den Ausweis ausliest, braucht einen eID-Server. Ich prüfe, wer ihn betreibt und unter welcher Lizenz."
   }
  },
  {
   "fetch": {
    "url": "https://netzpolitik.org/2026/online-ausweis-der-eperso-ist-tot-lange-lebe-der-eperso/",
    "title": "Online-Ausweis: Der ePerso ist tot, lange lebe der ePerso (netzpolitik.org)"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "eID servers of the services",
     "de": "eID-Server der Dienste"
    },
    "role": {
     "en": "Check the identity data for each online service that reads the card.",
     "de": "Prüfen die Ausweisdaten für jeden Onlinedienst, der die Karte ausliest."
    },
    "note": {
     "en": "Each service runs its own eID server or commissions an eID service; who makes and runs them differs, so this block is a gap. According to netzpolitik.org, no server implementation is open source.",
     "de": "Jeder Dienst betreibt einen eigenen eID-Server oder beauftragt einen eID-Service; wer sie herstellt und betreibt, ist verschieden, daher ist dieser Baustein eine Lücke. Laut netzpolitik.org ist keine Server-Implementierung Open Source."
    },
    "criticality": "critical",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "proprietary",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-server/eid-server-node.html",
      "title": "eID Server",
      "quote": "The eID server consists of hardware and software components run by the service provider",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-server/eid-server-node.html",
      "title": "eID Server",
      "quote": "is to use an eID server certified by the Federal Office for Information Security (BSI)",
      "lang": "en",
      "supports": [
       "exit"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://netzpolitik.org/2026/online-ausweis-der-eperso-ist-tot-lange-lebe-der-eperso/",
      "title": "Online-Ausweis: Der ePerso ist tot, lange lebe der ePerso (netzpolitik.org)",
      "quote": "dass keine der Server-Implementierungen unter einer Open-Source-Lizenz verfügbar ist.",
      "lang": "de",
      "supports": [
       "licence"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "say": {
    "en": "Base services: services may read the ID only with an authorisation certificate. I read who grants and who issues them.",
    "de": "Basisdienste: Dienste dürfen den Ausweis nur mit einem Berechtigungszertifikat auslesen. Ich lese, wer sie vergibt und wer sie ausstellt."
   }
  },
  {
   "fetch": {
    "url": "https://www.bva.bund.de/DE/Services/Behoerden/Produkt/PA-VfB/pa-vfb_node.html",
    "title": "BVA - Vergabestelle für Berechtigungszertifikate"
   }
  },
  {
   "fetch": {
    "url": "https://www.d-trust.net/files/dokumente/pdf/produktblatt_berechtigungszertifikate.pdf",
    "title": "D-Trust-BerCA für Diensteanbieter und eID-Service-Provider (Produktblatt)",
    "pdf": true
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Authorisation certificates",
     "de": "Berechtigungszertifikate"
    },
    "role": {
     "en": "Allow a service to read the identity card's data; revoked certificates are blocked.",
     "de": "Erlauben einem Dienst, die Daten des Ausweises zu lesen; gesperrte Zertifikate werden blockiert."
    },
    "note": {
     "en": "The Bundesverwaltungsamt grants the authorisation; the certificates come from a PKI with revocation management.",
     "de": "Das Bundesverwaltungsamt erteilt die Berechtigung; die Zertifikate stammen aus einer PKI mit Sperrmanagement."
    },
    "criticality": "critical",
    "tech": {
     "name": "D-Trust GmbH",
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
      "url": "https://www.d-trust.net/files/dokumente/pdf/produktblatt_berechtigungszertifikate.pdf",
      "title": "D-Trust-BerCA für Diensteanbieter und eID-Service-Provider (Produktblatt)",
      "quote": "Sie besteht aus einer Public-Key-Infrastruktur (PKI) für Berechtigungszertifikate und einem Sperrmanagement.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.d-trust.net/files/dokumente/pdf/produktblatt_berechtigungszertifikate.pdf",
      "title": "D-Trust-BerCA für Diensteanbieter und eID-Service-Provider (Produktblatt)",
      "quote": "D-Trust GmbH | Kommandantenstraße 15 | 10969 Berlin",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://netzpolitik.org/2026/online-ausweis-der-eperso-ist-tot-lange-lebe-der-eperso/",
      "title": "Online-Ausweis: Der ePerso ist tot, lange lebe der ePerso (netzpolitik.org)",
      "quote": "Jedoch verlangt das Bundesverwaltungsamt für die Berechtigungszertifikate hohe Gebühren.",
      "lang": "de",
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
   "say": {
    "en": "Applications: the AusweisApp itself, published as open source.",
    "de": "Anwendungen: die AusweisApp selbst, als Open Source veröffentlicht."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "AusweisApp",
     "de": "AusweisApp"
    },
    "role": {
     "en": "Reads the identity card and passes the data to the service's eID server.",
     "de": "Liest den Personalausweis aus und gibt die Daten an den eID-Server des Dienstes weiter."
    },
    "note": {
     "en": "The source code is published on GitHub under the EUPL. The app runs on each user's own device; no source read says who runs it for the service.",
     "de": "Der Quellcode ist auf GitHub unter der EUPL veröffentlicht. Die App läuft auf dem eigenen Gerät jeder Nutzerin und jedes Nutzers; keine gelesene Quelle sagt, wer sie für den Dienst betreibt."
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
    "licence": "open_source",
    "exit": "easy",
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
     },
     {
      "url": "https://www.ausweisapp.bund.de/en/open-source",
      "title": "AusweisApp: Open Source Software",
      "quote": "Under the EUPL licence, users can get the original source code, duplicate it, develop it further",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.ausweisapp.bund.de/en/open-source",
      "title": "AusweisApp: Open Source Software",
      "quote": "The source code of AusweisApp is therefore available on the online platform GitHub.",
      "lang": "en",
      "supports": [
       "exit"
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
    "en": "Interface and access: the card itself, and the app on iPhones.",
    "de": "Oberfläche und Zugang: die Karte selbst und die App auf iPhones."
   }
  },
  {
   "fetch": {
    "url": "https://onlinedienste.dueren.de/suche/-/vr-bis-detail/dokument/12224/download",
    "title": "Der neue Personalausweis – die Fakten auf einen Blick (BSI, via Stadt Düren)"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "The identity card",
     "de": "Der Personalausweis"
    },
    "role": {
     "en": "The chip card people hold to the reader or the phone.",
     "de": "Die Chipkarte, die Menschen an das Lesegerät oder das Smartphone halten."
    },
    "note": {
     "en": "The BSI says the card is produced by the Bundesdruckerei in Berlin; no source read says who runs it for a service.",
     "de": "Laut BSI wird die Karte von der Bundesdruckerei in Berlin hergestellt; keine gelesene Quelle sagt, wer sie für einen Dienst betreibt."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bundesdruckerei GmbH",
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
      "url": "https://onlinedienste.dueren.de/suche/-/vr-bis-detail/dokument/12224/download",
      "title": "Der neue Personalausweis – die Fakten auf einen Blick (BSI, via Stadt Düren)",
      "quote": "von der Bundesdruckerei in Berlin hergestellt",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     }
    ],
    "confidence": "medium"
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
     "en": "AusweisApp on iPhones through the App Store",
     "de": "AusweisApp auf iPhones über den App Store"
    },
    "role": {
     "en": "Delivers the AusweisApp to iPhone users.",
     "de": "Liefert iPhone-Nutzenden die AusweisApp."
    },
    "note": {
     "en": "In the EU, alternative app marketplaces exist on iPhones.",
     "de": "In der EU gibt es auf iPhones alternative App-Marktplätze."
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
    "licence": "unknown",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://support.apple.com/guide/apple-invites/copyright-and-trademarks-dev2727afbbc/ios",
      "title": "Copyright and trademarks - Apple Support",
      "quote": "App Store, iCloud, and iCloud+ are service marks of Apple Inc., registered in the U.S. and other countries and regions.",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-19"
     },
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Legal - Privacy Policy Affiliated Company - Apple",
      "quote": "Depending on your location, the Apple entity providing the services is:",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Legal - Privacy Policy Affiliated Company - Apple",
      "quote": "Apple Media Services include, where available, the App Store",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Legal - Privacy Policy Affiliated Company - Apple",
      "quote": "Apple Distribution International Ltd., located at Hollyhill Industrial Estate, Hollyhill, Cork, Republic of Ireland",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.apple.com/legal/privacy/en/affiliated-company/",
      "title": "Legal - Privacy Policy Affiliated Company - Apple",
      "quote": "Apple Inc., located at One Apple Park Way, Cupertino, California, United States",
      "lang": "en",
      "supports": [
       "operator.parent"
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
    "confidence": "high"
   }
  },
  {
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. The eID servers are a gap: each service runs its own, and the sources do not say who makes them.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Die eID-Server sind eine Lücke: Jeder Dienst betreibt einen eigenen, und die Quellen sagen nicht, wer sie herstellt."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Six building blocks; the infrastructure has no evidence and the eID servers are a gap. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The lowest scored level is the app's distribution on iPhones, {{fact:seal.B-06}}. Please check, correct or confirm.",
     "de": "Sechs Bausteine; für die Infrastruktur fehlen Belege, und die eID-Server sind eine Lücke. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Die niedrigste bewertete Stufe hat die Verteilung der App auf iPhones, {{fact:seal.B-06}}. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-02",
     "B-06"
    ]
   }
  },
  {
   "say": {
    "en": "For the weak blocks I look for what public sources name as alternatives: starting points for research, not a recommendation.",
    "de": "Für die schwachen Bausteine suche ich, was öffentliche Quellen als Alternativen nennen: Ansatzpunkte für die Recherche, keine Empfehlung."
   }
  },
  {
   "fetch": {
    "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
    "title": "Deutschland-Stack – Wohin geht die Reise?"
   }
  },
  {
   "fetch": {
    "url": "https://www.openecard.org/en/news/details/platform-independent-and-highly-extensible-open-ecard-app-released/",
    "title": "Open eCard: Platform independent and highly extensible Open eCard App released"
   }
  },
  {
   "fetch": {
    "url": "https://techcrunch.com/2026/02/22/move-over-apple-meet-the-alternative-app-stores-available-in-the-eu-and-elsewhere/",
    "title": "Move over, Apple: Meet the alternative app stores available in the EU and elsewhere"
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-06",
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
       "en": "Distribute the AusweisApp on iPhones through an app marketplace run in the EU",
       "de": "Die AusweisApp für iPhones über einen in der EU betriebenen App-Marktplatz vertreiben"
      },
      "rationale": {
       "en": "In the EU, iPhone users can install alternative app marketplaces. If the AusweisApp reached iPhones through a marketplace run in the EU rather than the phone maker's store, the overall score would be {{fact:whatif.L1.overall}}; the app would still run on the phone maker's platform.",
       "de": "In der EU können iPhone-Nutzende alternative App-Marktplätze installieren. Erreichte die AusweisApp iPhones über einen in der EU betriebenen Marktplatz statt über den Store des Herstellers, läge der Gesamtwert bei {{fact:whatif.L1.overall}}; die App liefe weiter auf der Plattform des Herstellers."
      },
      "changes": [
       {
        "block_id": "B-06",
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
       }
      ]
     }
    ],
    "starting_points": [
     {
      "block_id": "B-04",
      "name": "EUDI-Wallet",
      "note": {
       "en": "The federal plans name authentication with the EUDI wallet beside the BundID.",
       "de": "Die Pläne des Bundes nennen die Authentifizierung mit der EUDI-Wallet neben der BundID."
      },
      "catalogue_id": "eudi-wallet",
      "evidence": [
       {
        "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
        "title": "Deutschland-Stack – Wohin geht die Reise?",
        "quote": "Digitale Authentifizierung der Antragsteller:innen via EUDI-Wallet bzw. BundID",
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
      "block_id": "B-04",
      "name": "Open eCard App",
      "note": {
       "en": "An open-source eID client of the Open eCard project.",
       "de": "Ein quelloffener eID-Client des Projekts Open eCard."
      },
      "evidence": [
       {
        "url": "https://www.openecard.org/en/news/details/platform-independent-and-highly-extensible-open-ecard-app-released/",
        "title": "Open eCard: Platform independent and highly extensible Open eCard App released",
        "quote": "A first result of the project is the Open eCard App, which provides an Open Source alternative to proprietary eID clients.",
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
      "block_id": "B-06",
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
      "block_id": "B-06",
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
      "block_id": "B-06",
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
     "en": "# Online ID: findings\n\nThe online ID function of the German identity card proves a person's identity to online services. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure**: no source read says where the central background systems are hosted.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): Governikus develops the AusweisApp on behalf of the BSI.\n- **Platform**: each service runs its own eID server or commissions an eID service; who makes and runs them differs, and according to netzpolitik.org none of the server implementations is open source. The block is a gap.\n- **Base services** ({{fact:score.layer.base_service}}): the Bundesverwaltungsamt grants the authorisation to read the card; the certificates come from a PKI with revocation management described by D-Trust.\n- **Applications** ({{fact:score.layer.applications}}): the AusweisApp is open source under the EUPL.\n- **Interface and access** ({{fact:score.layer.access}}): the card is produced by the Bundesdruckerei in Berlin, according to the BSI, but no source read says who runs it for a service, so its level counts as partly unknown; on iPhones the AusweisApp comes from the App Store, which Apple Distribution International operates for European users as part of the Apple group.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}. A phone-only credential, the Smart-eID, was stopped at the end of 2023, according to a parliamentary paper.",
     "de": "# Online-Ausweis: Befunde\n\nDie Online-Ausweisfunktion des deutschen Personalausweises weist die Identität gegenüber Onlinediensten nach. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur**: Keine gelesene Quelle sagt, wo die zentralen Hintergrundsysteme betrieben werden.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Governikus entwickelt die AusweisApp im Auftrag des BSI.\n- **Plattform**: Jeder Dienst betreibt einen eigenen eID-Server oder beauftragt einen eID-Service; wer sie herstellt und betreibt, ist verschieden, und laut netzpolitik.org ist keine Server-Implementierung Open Source. Der Baustein ist eine Lücke.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Das Bundesverwaltungsamt erteilt die Berechtigung zum Auslesen; die Zertifikate stammen aus einer PKI mit Sperrmanagement, die D-Trust beschreibt.\n- **Anwendungen** ({{fact:score.layer.applications}}): Die AusweisApp ist Open Source unter der EUPL.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): Die Karte stellt laut BSI die Bundesdruckerei in Berlin her, doch keine gelesene Quelle sagt, wer sie für einen Dienst betreibt, daher gilt ihre Stufe als teilweise unbekannt; auf iPhones kommt die AusweisApp aus dem App Store, den für europäische Nutzende Apple Distribution International als Teil des Apple-Konzerns betreibt.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}. Ein reines Smartphone-Verfahren, die Smart-eID, wurde laut einer Bundestagsdrucksache Ende 2023 gestoppt."
    }
   }
  }
 ]
};
})();
