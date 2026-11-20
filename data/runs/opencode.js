/* Pre-run assessment of openCode (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/opencode.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["opencode"] = {
 "id": "opencode",
 "entry_id": "opencode",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "openCode",
 "steps": [
  {
   "say": {
    "en": "I look openCode up in the catalogue, read its pages about the platform, its questions and answers and its data privacy notice, and look up the makers of the software it names.",
    "de": "Ich schlage openCode im Katalog nach, lese seine Seiten über die Plattform, seine Fragen und Antworten und seinen Datenschutzhinweis und schlage die Hersteller der Software nach, die es nennt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "openCode"
   }
  },
  {
   "fetch": {
    "url": "https://opencode.de/en/about-opencode",
    "title": "About openCode | openCode.de"
   }
  },
  {
   "search": {
    "query": "openCode FAQ ZenDiS operated Bring Your Own Runner data privacy Keycloak",
    "results": [
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions"
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy"
     },
     {
      "url": "https://opencode.de/en",
      "title": "openCode.de - Open Source Platform for Public Administration"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://opencode.de/en/frequently-asked-questions",
    "title": "Frequently asked questions | openCode.de"
   }
  },
  {
   "fetch": {
    "url": "https://opencode.de/en/data-privacy",
    "title": "Data Privacy | openCode.de"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "openCode",
     "opencode.de"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "The joint platform of the public administration for finding, sharing and developing open-source software.",
     "de": "Die gemeinsame Plattform der öffentlichen Verwaltung, um quelloffene Software zu finden, zu teilen und weiterzuentwickeln."
    },
    "how": {
     "en": "A code platform built on the GitLab system, with sign-in through Keycloak; ZenDiS operates and develops it.",
     "de": "Eine Code-Plattform auf Basis des GitLab-Systems, mit Anmeldung über Keycloak; ZenDiS betreibt und entwickelt sie."
    },
    "owner": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "status": {
     "en": "In operation; ZenDiS has been responsible for it since it took the platform over.",
     "de": "In Betrieb; ZenDiS verantwortet die Plattform, seit es sie übernommen hat."
    },
    "evidence": [
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "has become responsible for openCode and is continuously developing the platform",
      "lang": "en",
      "supports": [
       "what",
       "owner",
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "Early 2024, the Zentrum für Digitale Souveränität der Öffentlichen Verwaltung",
      "lang": "en",
      "supports": [
       "owner",
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Bring Your Own Runner: openCode supports the integration of your own CI/CD Runner through the GitLab system.",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "The Keycloak application creates a set of entries in your browser",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Since 2024, the platform has been operated by the Center for Digital Sovereignty in Public Administration (ZenDiS).",
      "lang": "en",
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
    "en": "Infrastructure: the data privacy notice names a hosting provider bound by a data processing agreement and says that no third-country transfers occur, but it does not name the provider.",
    "de": "Infrastruktur: Der Datenschutzhinweis nennt einen Hosting-Anbieter, der an einen Auftragsverarbeitungsvertrag gebunden ist, und sagt, dass keine Übermittlung in Drittländer stattfindet; den Anbieter nennt er nicht."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "Hosting provider of openCode",
     "de": "Hosting-Anbieter von openCode"
    },
    "role": {
     "en": "Hosts the platform.",
     "de": "Betreibt die Plattform als Hosting-Anbieter."
    },
    "note": {
     "en": "The provider is not named, so who makes and runs the hosting is a gap; no data leaves for third countries.",
     "de": "Der Anbieter wird nicht genannt; wer das Hosting herstellt und betreibt, ist daher eine Lücke. Daten gehen nicht in Drittländer."
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
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Our hosting provider, bound by a data processing agreement.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "No third-country transfers occur.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     }
    ],
    "confidence": "low"
   }
  },
  {
   "say": {
    "en": "Development, security and operations: ZenDiS, based in Bochum, operates the platform and keeps developing it.",
    "de": "Entwicklung, Sicherheit und Betrieb: ZenDiS mit Sitz in Bochum betreibt die Plattform und entwickelt sie weiter."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "Operation and development by ZenDiS",
     "de": "Betrieb und Entwicklung durch ZenDiS"
    },
    "role": {
     "en": "Operates the platform and keeps developing it.",
     "de": "Betreibt die Plattform und entwickelt sie weiter."
    },
    "criticality": "critical",
    "tech": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "Early 2024, the Zentrum für Digitale Souveränität der Öffentlichen Verwaltung",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "has become responsible for openCode and is continuously developing the platform",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Suttner-Nobel-Allee 4, 44803 Bochum",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Since 2024, the platform has been operated by the Center for Digital Sovereignty in Public Administration (ZenDiS).",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Our hosting provider, bound by a data processing agreement.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "No third-country transfers occur.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     }
    ],
    "confidence": "high"
   }
  },
  {
   "say": {
    "en": "Platform: the questions and answers name the GitLab system. I look up who makes it.",
    "de": "Plattform: Die Fragen und Antworten nennen das GitLab-System. Ich schlage nach, wer es herstellt."
   }
  },
  {
   "search": {
    "query": "GitLab Inc. investor relations headquarters San Francisco \"GitLab Inc.\" company",
    "results": [
     {
      "url": "https://about.gitlab.com/press/releases/2025-11-18-gitlab-to-announce-third-quarter-2026-financial-results/",
      "title": "GitLab To Announce Third Quarter Fiscal 2026 Financial Results"
     },
     {
      "url": "https://wiki.krisyotam.com/content/wikipedia_en_all_nopic_2026-03/GitLab_Inc.",
      "title": "GitLab Inc"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://about.gitlab.com/press/releases/2025-11-18-gitlab-to-announce-third-quarter-2026-financial-results/",
    "title": "GitLab To Announce Third Quarter Fiscal 2026 Financial Results"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "GitLab system",
     "de": "GitLab-System"
    },
    "role": {
     "en": "Carries the repositories, the issues and the CI/CD pipelines, into which users can bring their own runners.",
     "de": "Trägt die Repositorys, die Issues und die CI/CD-Pipelines, in die Nutzende eigene Runner einbinden können."
    },
    "note": {
     "en": "GitLab Inc. dates its press releases from San Francisco, California, and works all-remote. The sources read do not say which edition and licence openCode runs.",
     "de": "GitLab Inc. datiert seine Pressemitteilungen in San Francisco, Kalifornien, und arbeitet vollständig remote. Die gelesenen Quellen sagen nicht, welche Edition und Lizenz openCode einsetzt."
    },
    "criticality": "critical",
    "tech": {
     "name": "GitLab Inc.",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Bring Your Own Runner: openCode supports the integration of your own CI/CD Runner through the GitLab system.",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://about.gitlab.com/press/releases/2025-11-18-gitlab-to-announce-third-quarter-2026-financial-results/",
      "title": "GitLab To Announce Third Quarter Fiscal 2026 Financial Results",
      "quote": "San Francisco, CA - November 18, 2025 - All Remote – GitLab Inc., the most comprehensive, intelligent DevSecOps platform",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Since 2024, the platform has been operated by the Center for Digital Sovereignty in Public Administration (ZenDiS).",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Our hosting provider, bound by a data processing agreement.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "No third-country transfers occur.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "say": {
    "en": "Base services: sign-in runs through Keycloak. I read who stewards Keycloak.",
    "de": "Basisdienste: Die Anmeldung läuft über Keycloak. Ich lese, wer Keycloak trägt."
   }
  },
  {
   "search": {
    "query": "Keycloak Cloud Native Computing Foundation incubation project keycloak.org",
    "results": [
     {
      "url": "https://www.cncf.io/blog/2023/04/11/keycloak-joins-cncf-as-an-incubating-project/",
      "title": "Keycloak joins CNCF as an incubating project"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://www.cncf.io/blog/2023/04/11/keycloak-joins-cncf-as-an-incubating-project/",
    "title": "Keycloak joins CNCF as an incubating project | CNCF"
   }
  },
  {
   "search": {
    "query": "\"The Linux Foundation\" privacy policy address San Francisco 548 Market",
    "results": [
     {
      "url": "https://linuxfoundation.org/legal/privacy-policy",
      "title": "privacy policy"
     },
     {
      "url": "https://linuxfoundation.org/privacy",
      "title": "linuxfoundation.org"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://linuxfoundation.org/legal/privacy-policy",
    "title": "Privacy Policy | Linux Foundation"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Sign-in with Keycloak",
     "de": "Anmeldung mit Keycloak"
    },
    "role": {
     "en": "Signs users in to their personal accounts on openCode.",
     "de": "Meldet Nutzende an ihren persönlichen Konten auf openCode an."
    },
    "note": {
     "en": "Keycloak is a project of the Cloud Native Computing Foundation, part of the Linux Foundation in San Francisco, which supports free and open-source software projects.",
     "de": "Keycloak ist ein Projekt der Cloud Native Computing Foundation, die zur Linux Foundation in San Francisco gehört, die freie und quelloffene Softwareprojekte fördert."
    },
    "criticality": "critical",
    "tech": {
     "name": "Keycloak (a CNCF project)",
     "country": "UNKNOWN",
     "parent": {
      "name": "The Linux Foundation",
      "country": "US"
     }
    },
    "operator": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "open_source",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "The Keycloak application creates a set of entries in your browser",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.cncf.io/blog/2023/04/11/keycloak-joins-cncf-as-an-incubating-project/",
      "title": "Keycloak joins CNCF as an incubating project | CNCF",
      "quote": "As a CNCF-hosted project, Keycloak is part of a neutral foundation aligned with its technical interests",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.cncf.io/blog/2023/04/11/keycloak-joins-cncf-as-an-incubating-project/",
      "title": "Keycloak joins CNCF as an incubating project | CNCF",
      "quote": "and the larger Linux Foundation, which provides governance, marketing support, and community outreach.",
      "lang": "en",
      "supports": [
       "tech.parent"
      ],
      "verified": true
     },
     {
      "url": "https://linuxfoundation.org/legal/privacy-policy",
      "title": "Privacy Policy | Linux Foundation",
      "quote": "The Linux Foundation, Attn: Legal Department, 548 Market St, PMB 57274, San Francisco, California 94104-5401, USA.",
      "lang": "en",
      "supports": [
       "tech.parent"
      ],
      "verified": true
     },
     {
      "url": "https://linuxfoundation.org/legal/privacy-policy",
      "title": "Privacy Policy | Linux Foundation",
      "quote": "supports the collaborative and public development of free and open source software projects",
      "lang": "en",
      "supports": [
       "licence"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Since 2024, the platform has been operated by the Center for Digital Sovereignty in Public Administration (ZenDiS).",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Our hosting provider, bound by a data processing agreement.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "No third-country transfers occur.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "say": {
    "en": "Applications and access: openCode's own services and its website, which ZenDiS operates and develops.",
    "de": "Anwendungen und Zugang: die eigenen Dienste von openCode und seine Website, die ZenDiS betreibt und entwickelt."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "openCode platform services",
     "de": "Plattformdienste von openCode"
    },
    "role": {
     "en": "Let the administration find, share and develop open-source software together.",
     "de": "Lassen die Verwaltung quelloffene Software gemeinsam finden, teilen und weiterentwickeln."
    },
    "criticality": "critical",
    "tech": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "Early 2024, the Zentrum für Digitale Souveränität der Öffentlichen Verwaltung",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "has become responsible for openCode and is continuously developing the platform",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Suttner-Nobel-Allee 4, 44803 Bochum",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Since 2024, the platform has been operated by the Center for Digital Sovereignty in Public Administration (ZenDiS).",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Our hosting provider, bound by a data processing agreement.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "No third-country transfers occur.",
      "lang": "en",
      "supports": [
       "hosting"
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
     "en": "Website opencode.de",
     "de": "Website opencode.de"
    },
    "role": {
     "en": "The pages in the browser on which people sign in and find software.",
     "de": "Die Seiten im Browser, auf denen Menschen sich anmelden und Software finden."
    },
    "criticality": "critical",
    "tech": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "Zentrum für Digitale Souveränität der Öffentlichen Verwaltung (ZenDiS) GmbH",
     "country": "DE",
     "parent": null
    },
    "hosting": "EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "Early 2024, the Zentrum für Digitale Souveränität der Öffentlichen Verwaltung",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/about-opencode",
      "title": "About openCode | openCode.de",
      "quote": "has become responsible for openCode and is continuously developing the platform",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Suttner-Nobel-Allee 4, 44803 Bochum",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/frequently-asked-questions",
      "title": "Frequently asked questions | openCode.de",
      "quote": "Since 2024, the platform has been operated by the Center for Digital Sovereignty in Public Administration (ZenDiS).",
      "lang": "en",
      "supports": [
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "Our hosting provider, bound by a data processing agreement.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://opencode.de/en/data-privacy",
      "title": "Data Privacy | openCode.de",
      "quote": "No third-country transfers occur.",
      "lang": "en",
      "supports": [
       "hosting"
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
    "en": "Every layer has blocks. ZenDiS runs everything it names; the hosting provider is a gap, and the GitLab system comes from a US company under a licence the sources do not state.",
    "de": "Jede Ebene hat Bausteine. ZenDiS betreibt alles, was es nennt; der Hosting-Anbieter ist eine Lücke, und das GitLab-System kommt von einem US-Unternehmen unter einer Lizenz, die die Quellen nicht nennen."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Six building blocks. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}. The hosting provider is a gap because the data privacy notice does not name it, and the GitLab system is at {{fact:seal.B-03}}. Please check, correct or confirm.",
     "de": "Sechs Bausteine. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}. Der Hosting-Anbieter ist eine Lücke, weil der Datenschutzhinweis ihn nicht nennt, und das GitLab-System steht auf {{fact:seal.B-03}}. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-01",
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
       "en": "Run the code platform under an open-source licence and say so",
       "de": "Die Code-Plattform unter einer quelloffenen Lizenz betreiben und das ausweisen"
      },
      "rationale": {
       "en": "The sources do not say which edition and licence of its code platform openCode runs. The Deutschland-Stack asks that solutions be bought mainly on the European market or developed as open source. If the code platform ran under an open-source licence, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die Quellen sagen nicht, welche Edition und Lizenz seiner Code-Plattform openCode einsetzt. Der Deutschland-Stack sieht vor, Lösungen vorrangig am europäischen Markt einzukaufen oder als Open Source zu entwickeln. Liefe die Code-Plattform unter einer quelloffenen Lizenz, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
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
     "en": "# openCode: findings\n\nopenCode is the joint platform of the public administration for open-source software, operated and developed by ZenDiS in Bochum. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}.\n\n- **Infrastructure**: a hosting provider bound by a data processing agreement, with no transfers to third countries; the provider is not named, so the block is a gap.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): ZenDiS operates the platform and keeps developing it.\n- **Platform** ({{fact:score.layer.platform}}): the GitLab system of GitLab Inc. of San Francisco, California; the sources read do not say which edition and licence openCode runs.\n- **Base services** ({{fact:score.layer.base_service}}): sign-in with Keycloak, an open-source project of the Cloud Native Computing Foundation within the Linux Foundation.\n- **Applications** ({{fact:score.layer.applications}}): openCode's own services, from ZenDiS.\n- **Interface and access** ({{fact:score.layer.access}}): the website opencode.de.\n\nThe weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# openCode: Befunde\n\nopenCode ist die gemeinsame Plattform der öffentlichen Verwaltung für quelloffene Software, betrieben und entwickelt von ZenDiS in Bochum. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}.\n\n- **Infrastruktur**: ein Hosting-Anbieter, der an einen Auftragsverarbeitungsvertrag gebunden ist, ohne Übermittlung in Drittländer; der Anbieter wird nicht genannt, daher ist der Baustein eine Lücke.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): ZenDiS betreibt die Plattform und entwickelt sie weiter.\n- **Plattform** ({{fact:score.layer.platform}}): das GitLab-System der GitLab Inc. aus San Francisco, Kalifornien; die gelesenen Quellen sagen nicht, welche Edition und Lizenz openCode einsetzt.\n- **Basisdienste** ({{fact:score.layer.base_service}}): die Anmeldung mit Keycloak, einem quelloffenen Projekt der Cloud Native Computing Foundation in der Linux Foundation.\n- **Anwendungen** ({{fact:score.layer.applications}}): die eigenen Dienste von openCode, von ZenDiS.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): die Website opencode.de.\n\nDas schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
