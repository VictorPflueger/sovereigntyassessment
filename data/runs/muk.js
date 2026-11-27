/* Pre-run assessment of Mein Unternehmenskonto (MUK) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/muk.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["muk"] = {
 "id": "muk",
 "entry_id": "muk",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "Mein Unternehmenskonto",
 "steps": [
  {
   "say": {
    "en": "I look Mein Unternehmenskonto up in the catalogue, read its information page, the Bavarian rules on its operation and the data protection notice, and look for who builds its parts.",
    "de": "Ich schlage Mein Unternehmenskonto im Katalog nach, lese seine Informationsseite, die bayerischen Regeln zu seinem Betrieb und den Datenschutzhinweis und suche, wer seine Teile baut."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Mein Unternehmenskonto"
   }
  },
  {
   "fetch": {
    "url": "https://info.mein-unternehmenskonto.de/",
    "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto"
   }
  },
  {
   "search": {
    "query": "BayMBl. 2022 Nr. 237 Organisationskonto Landesamt für Steuern",
    "results": [
     {
      "url": "https://www.verkuendung-bayern.de/baymbl/2022-237/",
      "title": "BayMBl. 2022 Nr. 237 - Verkündungsplattform Bayern"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.verkuendung-bayern.de/baymbl/2022-237/",
    "title": "BayMBl. 2022 Nr. 237 - Verkündungsplattform Bayern"
   }
  },
  {
   "search": {
    "query": "Verwaltungsvorschrift Betriebsbedingungen einheitlichen Organisationskontos",
    "results": [
     {
      "url": "https://www.gesetze-bayern.de/Content/Document/BayVV_206_D_12940/true",
      "title": "Verwaltungsvorschrift über die Betriebsbedingungen des einheitlichen Organisationskontos - Bürgerservice"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.gesetze-bayern.de/Content/Document/BayVV_206_D_12940/true",
    "title": "Verwaltungsvorschrift über die Betriebsbedingungen des einheitlichen Organisationskontos - Bürgerservice"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "Mein Unternehmenskonto",
     "MUK",
     "einheitliches Organisationskonto"
    ],
    "category": "base_service",
    "what": {
     "en": "The account that the state provides for organisations, with an integrated mailbox for messages and official notices.",
     "de": "Das staatlich bereitgestellte Nutzerkonto für Organisationen, mit integriertem Postfach für Mitteilungen und behördliche Bescheide."
    },
    "how": {
     "en": "Organisations sign in with ELSTER organisation certificates: the tax administration's ELSTER technology is used beyond tax matters.",
     "de": "Organisationen melden sich mit ELSTER-Organisationszertifikaten an: Die ELSTER-Technologie der Steuerverwaltung kommt auch außerhalb der Steuerverwaltung zum Einsatz."
    },
    "owner": {
     "name": "Freistaat Bayern",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In operation; organisations apply for their certificates when they create an account.",
     "de": "In Betrieb; Organisationen beantragen ihre Zertifikate, wenn sie ein Benutzerkonto erstellen."
    },
    "legal_basis": {
     "en": "An ordinance under the Online Access Act entrusts Bavaria and Bremen with operating the account; a Bavarian administrative regulation sets the operating conditions.",
     "de": "Eine Verordnung nach dem Onlinezugangsgesetz betraut Bayern und Bremen mit dem Betrieb des Kontos; eine bayerische Verwaltungsvorschrift regelt die Betriebsbedingungen."
    },
    "evidence": [
     {
      "url": "https://info.mein-unternehmenskonto.de/",
      "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto",
      "quote": "Das staatlicherseits bereitgestellte Nutzerkonto mit integriertem Postfach für Mitteilungen und behördliche Bescheide",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://info.mein-unternehmenskonto.de/",
      "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto",
      "quote": "kommt über Mein Unternehmenskonto die bewährte ELSTER-Technologie jetzt auch außerhalb der Steuerverwaltung zum Einsatz.",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://info.mein-unternehmenskonto.de/",
      "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto",
      "quote": "Beantragen Sie ein oder mehrere ELSTER-Organisationszertifikate unter „Benutzerkonto erstellen“.",
      "lang": "de",
      "supports": [
       "how",
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.gesetze-bayern.de/Content/Document/BayVV_206_D_12940/true",
      "title": "Verwaltungsvorschrift über die Betriebsbedingungen des einheitlichen Organisationskontos - Bürgerservice",
      "quote": "betraut den Freistaat Bayern und die Freie Hansestadt Bremen mit dem Betrieb des einheitlichen Organisationskontos",
      "lang": "de",
      "supports": [
       "owner",
       "legal_basis"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.verkuendung-bayern.de/baymbl/2022-237/",
      "title": "BayMBl. 2022 Nr. 237 - Verkündungsplattform Bayern",
      "quote": "Der Betrieb des Organisationskontos erfolgt entsprechend des Basiskonzepts Einheitliches Unternehmenskonto",
      "lang": "de",
      "supports": [
       "legal_basis"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.verkuendung-bayern.de/baymbl/2022-237/",
      "title": "BayMBl. 2022 Nr. 237 - Verkündungsplattform Bayern",
      "quote": "beim Landesamt für Steuern, welches seinerseits dem Staatsministerium für Finanzen und für Heimat untersteht.",
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
    "en": "Infrastructure: the ELSTER services run in the tax administration's own certified IT infrastructure. I read the BayernPortal's page and the data protection notice.",
    "de": "Infrastruktur: Die ELSTER-Leistungen laufen in einer eigenen zertifizierten IT-Infrastruktur der Steuerverwaltung. Ich lese die Seite des BayernPortals und den Datenschutzhinweis."
   }
  },
  {
   "search": {
    "query": "Steuererklärung Elektronische Übermittlung ELSTER ISO 27001 eigene IT-Infrastruktur",
    "results": [
     {
      "url": "https://www.bayernportal.de/dokumente/leistung/8777623333",
      "title": "Steuererklärung; Elektronische Übermittlung - BayernPortal"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.bayernportal.de/dokumente/leistung/8777623333",
    "title": "Steuererklärung; Elektronische Übermittlung - BayernPortal"
   }
  },
  {
   "fetch": {
    "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
    "title": "Datenschutz bei ELSTER",
    "pdf": true
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "IT infrastructure of the tax administration",
     "de": "IT-Infrastruktur der Steuerverwaltung"
    },
    "role": {
     "en": "Runs the ELSTER services on which the account is built.",
     "de": "Betreibt die ELSTER-Leistungen, auf denen das Konto aufbaut."
    },
    "note": {
     "en": "The ELSTER services run in the administration's own IT infrastructure, certified under ISO 27001 on the basis of the BSI's IT-Grundschutz; the data is stored on servers in Germany.",
     "de": "Die ELSTER-Leistungen laufen in einer eigenen IT-Infrastruktur der Verwaltung, zertifiziert nach ISO 27001 auf Basis des IT-Grundschutzes des BSI; die Daten liegen auf Servern in Deutschland."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://www.bayernportal.de/dokumente/leistung/8777623333",
      "title": "Steuererklärung; Elektronische Übermittlung - BayernPortal",
      "quote": "Die ELSTER-Leistungen werden in einer nach ISO 27001 auf Basis der IT-Grundschutz-Kataloge des BSI zertifizierten eigenen IT-Infrastruktur erbracht.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Betreiber dieser Webseiten ist das Bayerische Landesamt für Steuern.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
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
    "en": "Development, security and operations: the Bavarian rules say the account is operated under the base concept, at the State Office for Taxes.",
    "de": "Entwicklung, Sicherheit und Betrieb: Die bayerischen Regeln sagen, dass das Konto nach dem Basiskonzept betrieben wird, beim Landesamt für Steuern."
   }
  },
  {
   "search": {
    "query": "Handreichung Registrierungsprozess ELSTER-Organisationszertifikaten Mein Unternehmenskonto",
    "results": [
     {
      "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
      "title": "Handreichung zum Registrierungsprozess von ELSTER- ..."
     },
     {
      "url": "https://itvsh.de/infothek/mein-unternehmenskonto",
      "title": "Mein Unternehmenskonto für Kommunen und Behörden"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
    "title": "Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto",
    "pdf": true
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Operation of the account at the State Office for Taxes",
     "de": "Betrieb des Kontos beim Landesamt für Steuern"
    },
    "role": {
     "en": "Runs the account under the base concept and is responsible for ELSTER, identities and the mailbox.",
     "de": "Betreibt das Konto nach dem Basiskonzept und verantwortet ELSTER, Identitäten und das Postfach."
    },
    "criticality": "important",
    "tech": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
      "title": "Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto",
      "quote": "das Bayrische Landesamt für Steuern mit der Verantwortung für Elster, Identitäten und Postfach 2.0",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.verkuendung-bayern.de/baymbl/2022-237/",
      "title": "BayMBl. 2022 Nr. 237 - Verkündungsplattform Bayern",
      "quote": "Der Betrieb des Organisationskontos erfolgt entsprechend des Basiskonzepts Einheitliches Unternehmenskonto",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.verkuendung-bayern.de/baymbl/2022-237/",
      "title": "BayMBl. 2022 Nr. 237 - Verkündungsplattform Bayern",
      "quote": "beim Landesamt für Steuern, welches seinerseits dem Staatsministerium für Finanzen und für Heimat untersteht.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
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
    "en": "Platform: ELSTER and the account run on some software platform. No source read names it.",
    "de": "Plattform: ELSTER und das Konto laufen auf einer Software-Plattform. Keine gelesene Quelle nennt sie."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Software platform under ELSTER",
     "de": "Software-Plattform unter ELSTER"
    },
    "role": {
     "en": "Carries the ELSTER services and the account.",
     "de": "Trägt die ELSTER-Leistungen und das Konto."
    },
    "note": {
     "en": "The sources read do not name the platform software, so who makes it is a gap; the State Office for Taxes runs the services.",
     "de": "Die gelesenen Quellen nennen die Plattform-Software nicht; wer sie herstellt, ist daher eine Lücke. Das Landesamt für Steuern betreibt die Leistungen."
    },
    "criticality": "critical",
    "tech": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Betreiber dieser Webseiten ist das Bayerische Landesamt für Steuern.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     }
    ],
    "confidence": "low"
   }
  },
  {
   "say": {
    "en": "Base services: sign-in with ELSTER organisation certificates, the mailbox and the authorisation control. The guide names who developed the mailbox and the authorisation control.",
    "de": "Basisdienste: Anmeldung mit ELSTER-Organisationszertifikaten, das Postfach und die Berechtigungssteuerung. Die Handreichung nennt, wer Postfach und Berechtigungssteuerung entwickelt hat."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Sign-in with ELSTER organisation certificates",
     "de": "Anmeldung mit ELSTER-Organisationszertifikaten"
    },
    "role": {
     "en": "Proves the organisation's identity when its staff sign in.",
     "de": "Weist die Identität der Organisation nach, wenn sich ihre Beschäftigten anmelden."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://info.mein-unternehmenskonto.de/",
      "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto",
      "quote": "Beantragen Sie ein oder mehrere ELSTER-Organisationszertifikate unter „Benutzerkonto erstellen“.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://info.mein-unternehmenskonto.de/",
      "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto",
      "quote": "kommt über Mein Unternehmenskonto die bewährte ELSTER-Technologie jetzt auch außerhalb der Steuerverwaltung zum Einsatz.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
      "title": "Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto",
      "quote": "das Bayrische Landesamt für Steuern mit der Verantwortung für Elster, Identitäten und Postfach 2.0",
      "lang": "de",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "fetch": {
    "url": "https://www.ausweisapp.bund.de/en/about-us",
    "title": "AusweisApp: About us"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Mailbox (Postfach 2.0)",
     "de": "Postfach (Postfach 2.0)"
    },
    "role": {
     "en": "Delivers messages and official notices to the organisation.",
     "de": "Stellt der Organisation Mitteilungen und behördliche Bescheide zu."
    },
    "note": {
     "en": "Governikus, a company based in Bremen, developed the mailbox; the State Office for Taxes is responsible for it.",
     "de": "Governikus, ein Unternehmen aus Bremen, hat das Postfach entwickelt; verantwortlich ist das Landesamt für Steuern."
    },
    "criticality": "critical",
    "tech": {
     "name": "Governikus GmbH & Co. KG",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
      "title": "Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto",
      "quote": "die Entwicklung des OZG+-Postfachs durch Governikus",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
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
      "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
      "title": "Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto",
      "quote": "das Bayrische Landesamt für Steuern mit der Verantwortung für Elster, Identitäten und Postfach 2.0",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     }
    ],
    "confidence": "medium"
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
    "layer": "base_service",
    "name": {
     "en": "Authorisation control",
     "de": "Berechtigungssteuerung"
    },
    "role": {
     "en": "Manages what each person may do for the organisation.",
     "de": "Regelt, was jede Person für die Organisation tun darf."
    },
    "note": {
     "en": "Dataport, a public-law IT service provider of the administration, developed it; the State Office for Taxes runs the account's web pages.",
     "de": "Dataport, eine Anstalt des öffentlichen Rechts als IT-Dienstleister der Verwaltung, hat sie entwickelt; das Landesamt für Steuern betreibt die Webseiten des Kontos."
    },
    "criticality": "important",
    "tech": {
     "name": "Dataport AöR",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
      "title": "Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto",
      "quote": "die Entwicklung der Berechtigungssteuerung durch Dataport",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.cio.de/article/3666246/dataport-konsolidiert-5-rechenzentren.html",
      "title": "Ziel: PUE-Wert von 1,4: Dataport konsolidiert 5 Rechenzentren | CIO DE",
      "quote": "Die 2004 gegründete Anstalt des öffentlichen Rechts ist IT-Dienstleister der öffentlichen Verwaltung",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Betreiber dieser Webseiten ist das Bayerische Landesamt für Steuern.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
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
    "en": "Applications and access: the account itself and its web pages, which the State Office for Taxes runs.",
    "de": "Anwendungen und Zugang: das Konto selbst und seine Webseiten, die das Landesamt für Steuern betreibt."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "Mein Unternehmenskonto",
     "de": "Mein Unternehmenskonto"
    },
    "role": {
     "en": "The organisations' account with its integrated mailbox.",
     "de": "Das Konto der Organisationen mit integriertem Postfach."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://info.mein-unternehmenskonto.de/",
      "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto",
      "quote": "kommt über Mein Unternehmenskonto die bewährte ELSTER-Technologie jetzt auch außerhalb der Steuerverwaltung zum Einsatz.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://itvsh.de/fileadmin/user_upload/Dokumente/DiPlan_SH/Handreichung_zum_Registrierungsprozess_von_ELSTER_zentrale_Stelle_1.2.pdf",
      "title": "Handreichung zum Registrierungsprozess von ELSTER-Organisationszertifikaten im Rahmen von Mein Unternehmenskonto",
      "quote": "das Bayrische Landesamt für Steuern mit der Verantwortung für Elster, Identitäten und Postfach 2.0",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Betreiber dieser Webseiten ist das Bayerische Landesamt für Steuern.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
      ],
      "verified": true,
      "read_on": "2026-11-20"
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
     "en": "Web pages of the account",
     "de": "Webseiten des Kontos"
    },
    "role": {
     "en": "The pages in the browser on which organisations create their account and sign in.",
     "de": "Die Seiten im Browser, auf denen Organisationen ihr Konto erstellen und sich anmelden."
    },
    "criticality": "critical",
    "tech": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Bayerisches Landesamt für Steuern",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://info.mein-unternehmenskonto.de/",
      "title": "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto",
      "quote": "kommt über Mein Unternehmenskonto die bewährte ELSTER-Technologie jetzt auch außerhalb der Steuerverwaltung zum Einsatz.",
      "lang": "de",
      "supports": [
       "tech"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Betreiber dieser Webseiten ist das Bayerische Landesamt für Steuern.",
      "lang": "de",
      "supports": [
       "operator"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://download.elster.de/download/dokumente/Datenschutz_Mein_Unternehmenskonto.pdf",
      "title": "Datenschutz bei ELSTER",
      "quote": "Eine Speicherung Ihrer Daten erfolgt grundsätzlich nur auf unseren Servern in Deutschland.",
      "lang": "de",
      "supports": [
       "hosting"
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
    "en": "Every layer has blocks. German public bodies and companies build and run them, and the data stays on servers in Germany; who makes the software platform is a gap.",
    "de": "Jede Ebene hat Bausteine. Deutsche öffentliche Stellen und Unternehmen bauen und betreiben sie, und die Daten bleiben auf Servern in Deutschland; wer die Software-Plattform herstellt, ist eine Lücke."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Eight building blocks. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The software platform is at {{fact:seal.B-03}} because no source read names it. Please check, correct or confirm.",
     "de": "Acht Bausteine. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Die Software-Plattform steht auf {{fact:seal.B-03}}, weil keine gelesene Quelle sie nennt. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-03"
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
       "en": "Name the software platform under ELSTER and build it from European or open-source components",
       "de": "Die Software-Plattform unter ELSTER benennen und aus europäischen oder quelloffenen Komponenten bauen"
      },
      "rationale": {
       "en": "The sources do not say which software platform ELSTER and the account run on. The Deutschland-Stack asks that solutions be bought mainly on the European market or developed as open source. If the platform were made in the EU, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die Quellen sagen nicht, auf welcher Software-Plattform ELSTER und das Konto laufen. Der Deutschland-Stack sieht vor, Lösungen vorrangig am europäischen Markt einzukaufen oder als Open Source zu entwickeln. Wäre die Plattform in der EU hergestellt, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-03",
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
     "en": "# Mein Unternehmenskonto: findings\n\nMein Unternehmenskonto is the account that the state provides for organisations, with an integrated mailbox; it is built on the tax administration's ELSTER technology. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): the ELSTER services run in the tax administration's own certified IT infrastructure, and the data is stored on servers in Germany.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): an ordinance entrusts Bavaria and Bremen with operating the account; the Bavarian State Office for Taxes runs it under the base concept and is responsible for ELSTER, identities and the mailbox.\n- **Platform** ({{fact:score.layer.platform}}): no source read names the software platform under ELSTER; who makes it is a gap.\n- **Base services** ({{fact:score.layer.base_service}}): sign-in with ELSTER organisation certificates; the mailbox, developed by Governikus; and the authorisation control, developed by Dataport.\n- **Applications** ({{fact:score.layer.applications}}): the account itself, run by the State Office for Taxes.\n- **Interface and access** ({{fact:score.layer.access}}): the account's web pages, run by the same office.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# Mein Unternehmenskonto: Befunde\n\nMein Unternehmenskonto ist das staatlich bereitgestellte Nutzerkonto für Organisationen, mit integriertem Postfach; es baut auf der ELSTER-Technologie der Steuerverwaltung auf. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): Die ELSTER-Leistungen laufen in einer eigenen zertifizierten IT-Infrastruktur der Steuerverwaltung, und die Daten liegen auf Servern in Deutschland.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Eine Verordnung betraut Bayern und Bremen mit dem Betrieb des Kontos; das Bayerische Landesamt für Steuern betreibt es nach dem Basiskonzept und verantwortet ELSTER, Identitäten und das Postfach.\n- **Plattform** ({{fact:score.layer.platform}}): Keine gelesene Quelle nennt die Software-Plattform unter ELSTER; wer sie herstellt, ist eine Lücke.\n- **Basisdienste** ({{fact:score.layer.base_service}}): die Anmeldung mit ELSTER-Organisationszertifikaten, das Postfach, entwickelt von Governikus, und die Berechtigungssteuerung, entwickelt von Dataport.\n- **Anwendungen** ({{fact:score.layer.applications}}): das Konto selbst, betrieben vom Landesamt für Steuern.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): die Webseiten des Kontos, betrieben vom selben Amt.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
