/* Pre-run assessment of ePayBL (hand-authored, as of 2026-11-19): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/epaybl.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["epaybl"] = {
 "id": "epaybl",
 "entry_id": "epaybl",
 "source": "hand_authored",
 "as_of": "2026-11-19",
 "method_version": "1.0",
 "query": "ePayBL",
 "steps": [
  {
   "say": {
    "en": "I look ePayBL up in the catalogue and read the developer community's page and the slides of a Land that uses it.",
    "de": "Ich schlage ePayBL im Katalog nach und lese die Seite der Entwicklergemeinschaft und die Folien eines Landes, das ePayBL nutzt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "ePayBL"
   }
  },
  {
   "fetch": {
    "url": "https://www.epaybl.de/",
    "title": "Online bezahlen in der öffentlichen Verwaltung - ePayBL"
   }
  },
  {
   "fetch": {
    "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf",
    "title": "38. OZG-Sprechstunde: Beantragungsprozess eines ePayBL-Mandanten, Basisdienst ePayLSA (Sachsen-Anhalt)",
    "pdf": true
   }
  },
  {
   "fetch": {
    "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf",
    "title": "73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)",
    "pdf": true
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "ePayBL",
     "ePayment Bund-Länder"
    ],
    "category": "base_service",
    "what": {
     "en": "Software of the Federation and the Länder with which authorities take fees for their online services.",
     "de": "Software von Bund und Ländern, mit der Behörden Gebühren für ihre Onlinedienste einnehmen."
    },
    "how": {
     "en": "An online service hands the payment to ePayBL, and people pay on its payment page; in Saxony-Anhalt currently with PayPal or credit card.",
     "de": "Ein Onlinedienst übergibt die Zahlung an ePayBL, und die Menschen bezahlen auf dessen Bezahlseite; in Sachsen-Anhalt derzeit mit PayPal oder Kreditkarte."
    },
    "owner": {
     "name": "Entwicklergemeinschaft ePayBL",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Dataport / SID",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In use; the Länder are moving to the new development ePayBL 4, Saxony-Anhalt by the end of the year.",
     "de": "Im Einsatz; die Länder wechseln auf die Neuentwicklung ePayBL 4, Sachsen-Anhalt bis zum Ende des Jahres."
    },
    "evidence": [
     {
      "url": "https://www.epaybl.de/",
      "title": "Online bezahlen in der öffentlichen Verwaltung - ePayBL",
      "quote": "Die Entwicklergemeinschaft besteht aktuell aus Vertretern vom Bund und zwölf Bundesländern.",
      "lang": "de",
      "supports": [
       "owner"
      ],
      "verified": true
     },
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf",
      "title": "38. OZG-Sprechstunde: Beantragungsprozess eines ePayBL-Mandanten, Basisdienst ePayLSA (Sachsen-Anhalt)",
      "quote": "Betrieb erfolgt unter anderem durch Dataport oder SID",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf",
      "title": "73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)",
      "quote": "Derzeit werden PayPal und Kreditkarte in Sachsen-Anhalt angeboten.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf",
      "title": "73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)",
      "quote": "Ablösung der ePayBL 3 auf ePayBL 4 bis zum Ende des Jahres",
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
   "tool": "rec_layer",
   "input": {
    "layer": "infrastructure",
    "status": "no_evidence",
    "reason": {
     "en": "No source read says in which data centres the ePayBL instances run.",
     "de": "Keine gelesene Quelle sagt, in welchen Rechenzentren die ePayBL-Instanzen laufen."
    }
   }
  },
  {
   "say": {
    "en": "Development, security and operations: the Federation and the Länder develop ePayBL together. I read who leads the work.",
    "de": "Entwicklung, Sicherheit und Betrieb: Bund und Länder entwickeln ePayBL gemeinsam. Ich lese, wer die Arbeit führt."
   }
  },
  {
   "fetch": {
    "url": "https://medienservice.sachsen.de/medien/news/1079912/download_pdf",
    "title": "Entwicklergemeinschaft ePay-Bund-Länder gewinnt den eGovernment Readers Choice Award 2024 in Gold",
    "pdf": true
   }
  },
  {
   "fetch": {
    "url": "https://www.sid.sachsen.de/download/SID_Kundenforum_2025_ORANGE_ePayBL.pdf",
    "title": "Wie schaffte es ePayBL zur Auszeichnung? Hinter den Kulissen eines Preisträgers (SID-Kundenforum)",
    "pdf": true
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Joint development by the Federation and the Länder",
     "de": "Gemeinsame Entwicklung durch Bund und Länder"
    },
    "role": {
     "en": "Plans and steers the development of ePayBL for its members.",
     "de": "Plant und steuert die Entwicklung von ePayBL für ihre Mitglieder."
    },
    "note": {
     "en": "The community's office is in Saxony; the SID holds the process responsibility for the Saxon payment component.",
     "de": "Die Geschäftsstelle der Gemeinschaft sitzt in Sachsen; der SID trägt die Verfahrensverantwortung für die sächsische Basiskomponente Zahlungsverkehr."
    },
    "criticality": "critical",
    "tech": {
     "name": "Entwicklergemeinschaft ePayBL",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Staatsbetrieb Sächsische Informatik Dienste (SID)",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.epaybl.de/",
      "title": "Online bezahlen in der öffentlichen Verwaltung - ePayBL",
      "quote": "Die Entwicklergemeinschaft besteht aktuell aus Vertretern vom Bund und zwölf Bundesländern.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://medienservice.sachsen.de/medien/news/1079912/download_pdf",
      "title": "Entwicklergemeinschaft ePay-Bund-Länder gewinnt den eGovernment Readers Choice Award 2024 in Gold",
      "quote": "In Sachsen ist die Geschäftsstelle beheimatet.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.sid.sachsen.de/download/SID_Kundenforum_2025_ORANGE_ePayBL.pdf",
      "title": "Wie schaffte es ePayBL zur Auszeichnung? Hinter den Kulissen eines Preisträgers (SID-Kundenforum)",
      "quote": "SID: Verfahrensverantwortung für Basiskomponente Zahlungsverkehr",
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
   "tool": "rec_layer",
   "input": {
    "layer": "platform",
    "status": "no_evidence",
    "reason": {
     "en": "No source read names a platform, such as a container or integration platform, that ePayBL runs on.",
     "de": "Keine gelesene Quelle nennt eine Plattform, etwa eine Container- oder Integrationsplattform, auf der ePayBL läuft."
    }
   }
  },
  {
   "say": {
    "en": "Base services: the payment methods. I check who stands behind the card schemes and PayPal, and whether a European alternative is coming.",
    "de": "Basisdienste: die Zahlarten. Ich prüfe, wer hinter den Kartensystemen und PayPal steht und ob eine europäische Alternative kommt."
   }
  },
  {
   "search": {
    "query": "Wero European Payments Initiative EPI Brussels banks",
    "results": [
     {
      "url": "https://wero-wallet.eu/news/epi-launches-wero-its-innovative-digital-payment-wallet-in-belgium",
      "title": "Brussels, 19th November 2024"
     },
     {
      "url": "https://www.thestar.com.my/tech/tech-news/2025/07/07/belgian-banks-join-european-payments-initiative-to-expand-wero-wallet-across-europe",
      "title": "Belgian banks join European Payments Initiative to expand Wero wallet across Europe"
     },
     {
      "url": "https://www.euronews.com/2024/11/20/european-mobile-payment-system-wero-launches-in-belgian-banks",
      "title": "european mobile payment system wero launches in belgian banks"
     },
     {
      "url": "https://epicompany.eu/media-insights/five-belgian-banks-join-epi-to-bring-wero-to-even-more-european-customers",
      "title": "July 6, 2025"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.thestar.com.my/tech/tech-news/2025/07/07/belgian-banks-join-european-payments-initiative-to-expand-wero-wallet-across-europe",
    "title": "Belgian banks join European Payments Initiative to expand Wero wallet across Europe (Reuters, via The Star)"
   }
  },
  {
   "fetch": {
    "url": "https://epicompany.eu/media-insights/five-belgian-banks-join-epi-to-bring-wero-to-even-more-european-customers",
    "title": "Five Belgian Banks Join EPI to Bring Wero to Even More European Customers"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Card payments (Mastercard, Visa)",
     "de": "Kartenzahlung (Mastercard, Visa)"
    },
    "role": {
     "en": "Let people pay fees by credit card.",
     "de": "Ermöglicht, Gebühren mit Kreditkarte zu bezahlen."
    },
    "note": {
     "en": "Saxony-Anhalt's slides name Mastercard and VISA as payment methods; Reuters calls Visa and Mastercard U.S. companies.",
     "de": "Die Folien Sachsen-Anhalts nennen Mastercard und VISA als Zahlarten; Reuters bezeichnet Visa und Mastercard als US-Unternehmen."
    },
    "criticality": "important",
    "tech": {
     "name": "Mastercard / Visa",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Mastercard / Visa",
     "country": "US",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf",
      "title": "38. OZG-Sprechstunde: Beantragungsprozess eines ePayBL-Mandanten, Basisdienst ePayLSA (Sachsen-Anhalt)",
      "quote": "Derzeitige Bezahlmethoden: Mastercard, VISA, Giropay",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.thestar.com.my/tech/tech-news/2025/07/07/belgian-banks-join-european-payments-initiative-to-expand-wero-wallet-across-europe",
      "title": "Belgian banks join European Payments Initiative to expand Wero wallet across Europe (Reuters, via The Star)",
      "quote": "The EPI was set up by European banks in a bid to rival the dominance of U.S. companies Visa and Mastercard.",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf",
      "title": "73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)",
      "quote": "Neue Zahlart wero über ePayBL 4",
      "lang": "de",
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
   "search": {
    "query": "PayPal (Europe) S.à r.l. et Cie S.C.A. Luxembourg Nutzungsbedingungen Deutschland",
    "results": [
     {
      "url": "https://www.paypal.com/ua/DE_de_DE/ua.pdf",
      "title": "paypal.com"
     },
     {
      "url": "https://www.paypal.com/de/webapps/mpp/ua/useragreement-emea-full",
      "title": "Zurück zur Startseite"
     },
     {
      "url": "https://www.paypal.com/de/webapps/mpp/ua/bcr",
      "title": "Zurück zur Startseite"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.paypal.com/de/webapps/mpp/ua/useragreement-emea-full",
    "title": "PayPal-Nutzungsbedingungen"
   }
  },
  {
   "search": {
    "query": "PayPal Holdings 10-K exhibit 21.01 list of subsidiaries PayPal (Europe) jurisdiction Luxembourg",
    "results": [
     {
      "url": "https://www.sec.gov/Archives/edgar/data/1633917/000163391719000043/ex2101subsidiaries.htm",
      "title": "EX-21.01 4 ex2101subsidiaries.htm EXHIBIT 21.01 Exhibit"
     },
     {
      "url": "https://www.sec.gov/Archives/edgar/data/1633917/000163391721000018/exhibit2101subsidiarylistf.htm",
      "title": "EX-21.01 3 exhibit2101subsidiarylistf.htm EX-21.01 Document"
     },
     {
      "url": "https://www.sec.gov/Archives/edgar/data/1633917/000163391725000019/0001633917-25-000019-index.html",
      "title": "Form 10-K - Annual report"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.sec.gov/Archives/edgar/data/1633917/000163391721000018/exhibit2101subsidiarylistf.htm",
    "title": "Exhibit 21.01: Subsidiaries of PayPal Holdings, Inc. (SEC EDGAR)"
   }
  },
  {
   "search": {
    "query": "San Jose, California-based PayPal 2026",
    "results": [
     {
      "url": "https://s205.q4cdn.com/875401827/files/doc_news/PayPal-Announces-Strategic-Reorganization-to-Accelerate-Growth-2026.pdf",
      "title": "PayPal Announces Strategic Reorganization to Accelerate Growth 2026"
     },
     {
      "url": "https://newsroom.paypal-corp.com/2026-04-29-PayPal-Announces-Strategic-Reorganization-to-Accelerate-Growth",
      "title": "2026 04 29 PayPal Announces Strategic Reorganization to Accelerate Growth"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://newsroom.paypal-corp.com/2026-04-29-PayPal-Announces-Strategic-Reorganization-to-Accelerate-Growth",
    "title": "PayPal Announces Strategic Reorganization to Accelerate Growth"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "PayPal",
     "de": "PayPal"
    },
    "role": {
     "en": "Lets people pay fees from a PayPal account.",
     "de": "Ermöglicht, Gebühren über ein PayPal-Konto zu bezahlen."
    },
    "note": {
     "en": "PayPal (Europe) provides the service from Luxembourg, licensed there as a bank; it is a subsidiary of PayPal Holdings, Inc. in San Jose, California.",
     "de": "PayPal (Europe) erbringt die Leistung aus Luxemburg und ist dort als Bank zugelassen; das Unternehmen ist eine Tochter der PayPal Holdings, Inc. in San Jose, Kalifornien."
    },
    "criticality": "important",
    "tech": {
     "name": "PayPal Holdings, Inc.",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "PayPal (Europe) S.à r.l. et Cie, S.C.A.",
     "country": "LU",
     "parent": {
      "name": "PayPal Holdings, Inc.",
      "country": "US"
     }
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf",
      "title": "73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)",
      "quote": "Derzeit werden PayPal und Kreditkarte in Sachsen-Anhalt angeboten.",
      "lang": "de",
      "supports": [
       "exit"
      ],
      "verified": true
     },
     {
      "url": "https://www.paypal.com/de/webapps/mpp/ua/useragreement-emea-full",
      "title": "PayPal-Nutzungsbedingungen",
      "quote": "Unsere Leistungen werden von PayPal (Europe) S.à r.l. et Cie, S.C.A. (R.C.S. Luxembourg B 118 349)",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.paypal.com/de/webapps/mpp/ua/useragreement-emea-full",
      "title": "PayPal-Nutzungsbedingungen",
      "quote": "PayPal ist in Luxemburg ordnungsgemäß als Bank (bzw. im rechtlichen Sinne als „Kreditinstitut“) lizenziert.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.sec.gov/Archives/edgar/data/1633917/000163391721000018/exhibit2101subsidiarylistf.htm",
      "title": "Exhibit 21.01: Subsidiaries of PayPal Holdings, Inc. (SEC EDGAR)",
      "quote": "SUBSIDIARIES OF PAYPAL HOLDINGS, INC.",
      "lang": "en",
      "supports": [
       "operator.parent"
      ],
      "verified": true
     },
     {
      "url": "https://www.sec.gov/Archives/edgar/data/1633917/000163391721000018/exhibit2101subsidiarylistf.htm",
      "title": "Exhibit 21.01: Subsidiaries of PayPal Holdings, Inc. (SEC EDGAR)",
      "quote": "PayPal (Europe) S.à r.l. et Cie. S.C.A.",
      "lang": "en",
      "supports": [
       "operator.parent"
      ],
      "verified": true
     },
     {
      "url": "https://newsroom.paypal-corp.com/2026-04-29-PayPal-Announces-Strategic-Reorganization-to-Accelerate-Growth",
      "title": "PayPal Announces Strategic Reorganization to Accelerate Growth",
      "quote": "SAN JOSE, Calif., April 29, 2026 /PRNewswire/ -- PayPal Holdings, Inc. (NASDAQ: PYPL) today announced a strategic reorganization",
      "lang": "en",
      "supports": [
       "tech",
       "operator.parent"
      ],
      "verified": true
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Applications: ePayBL itself and its instances. I read who runs them.",
    "de": "Anwendungen: ePayBL selbst und seine Instanzen. Ich lese, wer sie betreibt."
   }
  },
  {
   "fetch": {
    "url": "https://www.mhkbd.nrw/system/files/media/document/file/standardisierung_epayment_v1_0.pdf",
    "title": "Standardisierung ePayment-Lösung (Nordrhein-Westfalen)",
    "pdf": true
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "ePayBL 4 and its instances",
     "de": "ePayBL 4 und seine Instanzen"
    },
    "role": {
     "en": "Takes the payments of the authorities' online services and passes the data on to their cash systems.",
     "de": "Nimmt die Zahlungen der Onlinedienste der Behörden an und gibt die Daten an deren Kassensysteme weiter."
    },
    "note": {
     "en": "Public IT service providers run the instances, among them Dataport, the SID and, in North Rhine-Westphalia, the KDN. Saxony-Anhalt's slides mention a manufacturer of ePayBL without naming it, and no other source read names it, so who builds the software is a gap.",
     "de": "Öffentliche IT-Dienstleister betreiben die Instanzen, darunter Dataport, der SID und in Nordrhein-Westfalen der KDN. Die Folien Sachsen-Anhalts erwähnen einen Hersteller der ePayBL, ohne ihn zu nennen, und keine andere gelesene Quelle nennt ihn; wer die Software baut, ist daher eine Lücke."
    },
    "criticality": "critical",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "Dataport / SID / KDN",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "possible",
    "evidence": [
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf",
      "title": "38. OZG-Sprechstunde: Beantragungsprozess eines ePayBL-Mandanten, Basisdienst ePayLSA (Sachsen-Anhalt)",
      "quote": "Betrieb erfolgt unter anderem durch Dataport oder SID",
      "lang": "de",
      "supports": [
       "operator",
       "exit"
      ],
      "verified": true
     },
     {
      "url": "https://www.mhkbd.nrw/system/files/media/document/file/standardisierung_epayment_v1_0.pdf",
      "title": "Standardisierung ePayment-Lösung (Nordrhein-Westfalen)",
      "quote": "Der KDN betreibt bereits zentrale ePayBL Instanzen",
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
    "en": "Interface and access: the payment page that ePayBL generates.",
    "de": "Oberfläche und Zugang: die Bezahlseite, die ePayBL erzeugt."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "Payment page (PayPage)",
     "de": "Bezahlseite (PayPage)"
    },
    "role": {
     "en": "The page in the browser on which people choose a payment method and pay.",
     "de": "Die Seite im Browser, auf der Menschen eine Zahlart wählen und bezahlen."
    },
    "note": {
     "en": "It is part of the ePayBL software, so who builds it is not named either.",
     "de": "Sie ist Teil der ePayBL-Software; wer sie baut, ist daher ebenfalls nicht genannt."
    },
    "criticality": "critical",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "Dataport / SID / KDN",
     "country": "DE",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/38_OZG-Sprechstunde_Basisdienste_ePayLSA_130923.pdf",
      "title": "38. OZG-Sprechstunde: Beantragungsprozess eines ePayBL-Mandanten, Basisdienst ePayLSA (Sachsen-Anhalt)",
      "quote": "Betrieb erfolgt unter anderem durch Dataport oder SID",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.mhkbd.nrw/system/files/media/document/file/standardisierung_epayment_v1_0.pdf",
      "title": "Standardisierung ePayment-Lösung (Nordrhein-Westfalen)",
      "quote": "Der KDN betreibt bereits zentrale ePayBL Instanzen",
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
   "tool": "eng_score",
   "input": {}
  },
  {
   "say": {
    "en": "Every layer has blocks or a status. The payment methods depend on companies from the United States; who builds ePayBL itself is a gap.",
    "de": "Jede Ebene hat Bausteine oder einen Status. Die Zahlarten hängen von Unternehmen aus den USA ab; wer ePayBL selbst baut, ist eine Lücke."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Five building blocks; the infrastructure and the platform have no evidence, and who builds ePayBL 4 is a gap. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. Card payments are at {{fact:seal.B-02}} and PayPal at {{fact:seal.B-03}}. Please check, correct or confirm.",
     "de": "Fünf Bausteine; für Infrastruktur und Plattform fehlen Belege, und wer ePayBL 4 baut, ist eine Lücke. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Die Kartenzahlung steht auf {{fact:seal.B-02}}, PayPal auf {{fact:seal.B-03}}. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-02",
     "B-03",
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
      "made_in": "EU",
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
       "en": "Move card payments to a payment method made and run in the EU, once ePayBL 4 supports one",
       "de": "Kartenzahlungen auf ein in der EU hergestelltes und betriebenes Zahlverfahren verlagern, sobald ePayBL 4 eines unterstützt"
      },
      "rationale": {
       "en": "Saxony-Anhalt's slides say the manufacturer is building a new payment method into ePayBL 4, planned for the fourth quarter of 2026; according to its maker's own announcement, that method comes from a company in Brussels. If card payments moved to such a method, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Laut den Folien Sachsen-Anhalts baut der Hersteller ein neues Zahlverfahren in ePayBL 4 ein, geplant für das vierte Quartal 2026; nach der eigenen Mitteilung seines Herstellers kommt dieses Verfahren von einem Unternehmen in Brüssel. Liefen die Kartenzahlungen über ein solches Verfahren, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-02",
        "made_in": "EU",
        "run_by": "EU"
       }
      ],
      "evidence": [
       {
        "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf",
        "title": "73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)",
        "quote": "Neue Zahlart wero über ePayBL 4",
        "lang": "de",
        "supports": [
         "alternative"
        ],
        "verified": true
       },
       {
        "url": "https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/73.Kommunendigital-Sprechstunde_MODUL-F_epayLSA_nicht_barrierfrei.pdf",
        "title": "73. Kommunen-digital-Sprechstunde: Neues aus den Basisdiensten, Migration auf ePayBL 4 und MODUL-F (Sachsen-Anhalt)",
        "quote": "Die Integration in die ePayBL4 ist derzeit für Q4 2026 vorgesehen.",
        "lang": "de",
        "supports": [
         "alternative"
        ],
        "verified": true
       },
       {
        "url": "https://epicompany.eu/media-insights/five-belgian-banks-join-epi-to-bring-wero-to-even-more-european-customers",
        "title": "Five Belgian Banks Join EPI to Bring Wero to Even More European Customers",
        "quote": "European Payments Initiative (EPI), the European-grown player committed to offering a sovereign digital payment alternative",
        "lang": "en",
        "supports": [
         "alternative"
        ],
        "verified": true
       },
       {
        "url": "https://epicompany.eu/media-insights/five-belgian-banks-join-epi-to-bring-wero-to-even-more-european-customers",
        "title": "Five Belgian Banks Join EPI to Bring Wero to Even More European Customers",
        "quote": "De Lignestraat 13, 1000 Brussels, Belgium",
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
     "en": "# ePayBL: findings\n\nePayBL is the software of the Federation and the Länder with which authorities take fees for their online services. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure**: no source read says in which data centres the instances run.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): a community of the Federation and twelve Länder develops ePayBL; its office is in Saxony, and the SID holds the process responsibility for the Saxon payment component.\n- **Platform**: no source read names a platform that ePayBL runs on.\n- **Base services** ({{fact:score.layer.base_service}}): card payments rely on Mastercard and Visa, which Reuters calls U.S. companies; PayPal is provided by PayPal (Europe) in Luxembourg, a subsidiary of PayPal Holdings, Inc. in San Jose, California.\n- **Applications** ({{fact:score.layer.applications}}): public IT service providers such as Dataport, the SID and the KDN run the instances; Saxony-Anhalt's slides mention a manufacturer of ePayBL without naming it, so who builds the software is a gap.\n- **Interface and access** ({{fact:score.layer.access}}): the payment page is part of the ePayBL software and has the same gap.\n\nSaxony-Anhalt's slides plan Wero, the wallet of the European Payments Initiative, for ePayBL 4 in the fourth quarter of 2026.",
     "de": "# ePayBL: Befunde\n\nePayBL ist die Software von Bund und Ländern, mit der Behörden Gebühren für ihre Onlinedienste einnehmen. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur**: Keine gelesene Quelle sagt, in welchen Rechenzentren die Instanzen laufen.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Eine Gemeinschaft aus Bund und zwölf Ländern entwickelt ePayBL; ihre Geschäftsstelle sitzt in Sachsen, und der SID trägt die Verfahrensverantwortung für die sächsische Basiskomponente Zahlungsverkehr.\n- **Plattform**: Keine gelesene Quelle nennt eine Plattform, auf der ePayBL läuft.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Die Kartenzahlung beruht auf Mastercard und Visa, die Reuters als US-Unternehmen bezeichnet; PayPal erbringt die PayPal (Europe) in Luxemburg, eine Tochter der PayPal Holdings, Inc. in San Jose, Kalifornien.\n- **Anwendungen** ({{fact:score.layer.applications}}): Öffentliche IT-Dienstleister wie Dataport, der SID und der KDN betreiben die Instanzen; die Folien Sachsen-Anhalts erwähnen einen Hersteller der ePayBL, ohne ihn zu nennen, daher ist offen, wer die Software baut.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): Die Bezahlseite ist Teil der ePayBL-Software und hat dieselbe Lücke.\n\nDie Folien Sachsen-Anhalts planen Wero, die Wallet der European Payments Initiative, für ePayBL 4 im vierten Quartal 2026."
    }
   }
  }
 ]
};
})();
