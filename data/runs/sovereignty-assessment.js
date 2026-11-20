/* Pre-run assessment of Sovereignty Assessment (this prototype) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/sovereignty-assessment.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["sovereignty-assessment"] = {
 "id": "sovereignty-assessment",
 "entry_id": "sovereignty-assessment",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "Sovereignty Assessment",
 "steps": [
  {
   "say": {
    "en": "I assess this prototype with its own method. I look it up in the catalogue, read its repository, then GitHub's pages on Pages and on privacy, Anthropic's pages on data residency, privacy and server tools, and the terms of Chrome and of Vici.",
    "de": "Ich bewerte diesen Prototyp mit seiner eigenen Methode. Ich schlage ihn im Katalog nach, lese sein Repository, dann die Seiten von GitHub zu Pages und zum Datenschutz, die Seiten von Anthropic zu Datenresidenz, Datenschutz und Server-Werkzeugen sowie die Bedingungen von Chrome und Vici."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Sovereignty Assessment"
   }
  },
  {
   "fetch": {
    "url": "https://github.com/VictorPflueger/sovereigntyassessment",
    "title": "GitHub - VictorPflueger/sovereigntyassessment"
   }
  },
  {
   "fetch": {
    "url": "https://github.com/VictorPflueger/sovereigntyassessment/blob/67d20c38a6e57c565cf4c45180788d2bb059caf6/README.md",
    "title": "sovereigntyassessment/README.md at 67d20c3 · VictorPflueger/sovereigntyassessment"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "Sovereignty Assessment",
     "Souveränitätsbewertung"
    ],
    "category": "self_assessment",
    "what": {
     "en": "This prototype: it assesses how digitally sovereign a German public service is.",
     "de": "Dieser Prototyp: Er bewertet, wie digital souverän ein deutscher öffentlicher Dienst ist."
    },
    "how": {
     "en": "Static HTML, CSS and JavaScript modules without a backend; Live mode talks only to the Claude API, whose web search and web fetch run on Anthropic's servers.",
     "de": "Statische HTML-, CSS- und JavaScript-Module ohne Backend; der Live-Modus spricht nur mit der Claude-API, deren Websuche und Web-Abruf auf den Servern von Anthropic laufen."
    },
    "owner": {
     "name": "Victor Pflüger",
     "country": "DE",
     "parent": null
    },
    "operator": {
     "name": "unknown",
     "country": "UNKNOWN",
     "parent": null
    },
    "status": {
     "en": "A prototype, published as a static site on GitHub Pages.",
     "de": "Ein Prototyp, als statische Website auf GitHub Pages veröffentlicht."
    },
    "evidence": [
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "How digitally sovereign is a German public service?",
      "lang": "en",
      "supports": [
       "what"
      ],
      "verified": true
     },
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "The prototype is static HTML, CSS and JavaScript modules: no build step, no backend, no dependency.",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "Live mode talks only to the Claude API; web search and web fetch run on Anthropic's servers.",
      "lang": "en",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment/blob/67d20c38a6e57c565cf4c45180788d2bb059caf6/README.md",
      "title": "sovereigntyassessment/README.md at 67d20c3 · VictorPflueger/sovereigntyassessment",
      "quote": "Built by Victor Pflüger in Germany.",
      "lang": "en",
      "supports": [
       "owner"
      ],
      "verified": true
     },
     {
      "url": "https://docs.github.com/en/articles/about-github-pages",
      "title": "About GitHub Pages",
      "quote": "GitHub Pages is a static site hosting service that takes HTML, CSS, and JavaScript files straight from a repository",
      "lang": "en",
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
    "en": "Infrastructure: GitHub Pages serves the files. I read who GitHub is, who owns it and where it keeps data.",
    "de": "Infrastruktur: GitHub Pages liefert die Dateien aus. Ich lese, wer GitHub ist, wem es gehört und wo es Daten hält."
   }
  },
  {
   "fetch": {
    "url": "https://docs.github.com/en/articles/about-github-pages",
    "title": "About GitHub Pages"
   }
  },
  {
   "fetch": {
    "url": "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
    "title": "GitHub General Privacy Statement - GitHub Docs"
   }
  },
  {
   "fetch": {
    "url": "https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/",
    "title": "Microsoft to acquire GitHub for $7.5 billion"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "infrastructure",
    "name": {
     "en": "GitHub Pages",
     "de": "GitHub Pages"
    },
    "role": {
     "en": "Serves the prototype's static files to the browser.",
     "de": "Liefert die statischen Dateien des Prototyps an den Browser aus."
    },
    "note": {
     "en": "GitHub logs the IP address of every visitor of a Pages site and keeps personal data in several regions, the United States among them. Microsoft acquired GitHub. The files are plain HTML, CSS and JavaScript, so any web server could serve them.",
     "de": "GitHub protokolliert die IP-Adresse aller, die eine Pages-Website besuchen, und hält personenbezogene Daten in mehreren Regionen, darunter die Vereinigten Staaten. Microsoft hat GitHub übernommen. Die Dateien sind reines HTML, CSS und JavaScript, jeder Webserver könnte sie ausliefern."
    },
    "criticality": "critical",
    "tech": {
     "name": "GitHub, Inc.",
     "country": "US",
     "parent": {
      "name": "Microsoft Corp.",
      "country": "US"
     }
    },
    "operator": {
     "name": "GitHub, Inc.",
     "country": "US",
     "parent": {
      "name": "Microsoft Corp.",
      "country": "US"
     }
    },
    "hosting": "NON_EU",
    "licence": "unknown",
    "exit": "easy",
    "evidence": [
     {
      "url": "https://docs.github.com/en/articles/about-github-pages",
      "title": "About GitHub Pages",
      "quote": "GitHub Pages is a static site hosting service that takes HTML, CSS, and JavaScript files straight from a repository",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
      "title": "GitHub General Privacy Statement - GitHub Docs",
      "quote": "GitHub, Inc. 88 Colin P. Kelly Jr. St. San Francisco, CA 94107 United States",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/",
      "title": "Microsoft to acquire GitHub for $7.5 billion",
      "quote": "Microsoft Corp. on Monday announced it has reached an agreement to acquire GitHub",
      "lang": "en",
      "supports": [
       "tech.parent",
       "operator.parent"
      ],
      "verified": true
     },
     {
      "url": "https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/",
      "title": "Microsoft to acquire GitHub for $7.5 billion",
      "quote": "REDMOND, Wash. — June 4, 2018 —",
      "lang": "en",
      "supports": [
       "tech.parent",
       "operator.parent"
      ],
      "verified": true
     },
     {
      "url": "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
      "title": "GitHub General Privacy Statement - GitHub Docs",
      "quote": "GitHub stores and processes Personal Data in a variety of locations, including your local region, the United States",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://docs.github.com/en/articles/about-github-pages",
      "title": "About GitHub Pages",
      "quote": "When a GitHub Pages site is visited, the visitor's IP address is logged and stored",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "The prototype is static HTML, CSS and JavaScript modules: no build step, no backend, no dependency.",
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
   "say": {
    "en": "Development, security and operations: the code lives in a GitHub repository, and GitHub Actions runs the tests.",
    "de": "Entwicklung, Sicherheit und Betrieb: Der Code liegt in einem GitHub-Repository, und GitHub Actions führt die Tests aus."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "devsecops",
    "name": {
     "en": "GitHub repository and GitHub Actions",
     "de": "GitHub-Repository und GitHub Actions"
    },
    "role": {
     "en": "Keep the code and run every test suite on each push and pull request.",
     "de": "Halten den Code und führen jede Testsuite bei jedem Push und Pull Request aus."
    },
    "criticality": "important",
    "tech": {
     "name": "GitHub, Inc.",
     "country": "US",
     "parent": {
      "name": "Microsoft Corp.",
      "country": "US"
     }
    },
    "operator": {
     "name": "GitHub, Inc.",
     "country": "US",
     "parent": {
      "name": "Microsoft Corp.",
      "country": "US"
     }
    },
    "hosting": "NON_EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "GitHub Actions runs them on every push and pull request (Node.js 22, Ubuntu 24.04, Playwright 1.56.0).",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
      "title": "GitHub General Privacy Statement - GitHub Docs",
      "quote": "GitHub, Inc. 88 Colin P. Kelly Jr. St. San Francisco, CA 94107 United States",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/",
      "title": "Microsoft to acquire GitHub for $7.5 billion",
      "quote": "Microsoft Corp. on Monday announced it has reached an agreement to acquire GitHub",
      "lang": "en",
      "supports": [
       "tech.parent",
       "operator.parent"
      ],
      "verified": true
     },
     {
      "url": "https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/",
      "title": "Microsoft to acquire GitHub for $7.5 billion",
      "quote": "REDMOND, Wash. — June 4, 2018 —",
      "lang": "en",
      "supports": [
       "tech.parent",
       "operator.parent"
      ],
      "verified": true
     },
     {
      "url": "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
      "title": "GitHub General Privacy Statement - GitHub Docs",
      "quote": "GitHub stores and processes Personal Data in a variety of locations, including your local region, the United States",
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
    "en": "Platform: Live mode runs on the Claude API. I read where Anthropic stores data and runs inference, and who Anthropic is.",
    "de": "Plattform: Der Live-Modus läuft auf der Claude-API. Ich lese, wo Anthropic Daten speichert und Inferenz ausführt und wer Anthropic ist."
   }
  },
  {
   "fetch": {
    "url": "https://platform.claude.com/docs/en/manage-claude/data-residency",
    "title": "Data residency - Claude Platform Docs"
   }
  },
  {
   "fetch": {
    "url": "https://www.anthropic.com/privacy",
    "title": "Privacy Policy \\ Anthropic"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "platform",
    "name": {
     "en": "Claude API",
     "de": "Claude-API"
    },
    "role": {
     "en": "Runs the model in Live mode: every step of the agent goes through it.",
     "de": "Führt das Modell im Live-Modus aus: Jeder Schritt des Agenten läuft darüber."
    },
    "note": {
     "en": "The only workspace geo is the United States, which sets where data is stored at rest; by default, inference may run in any available geography. Simulation plays the bundled pre-runs without calling the API.",
     "de": "Die einzige Workspace-Region sind die Vereinigten Staaten; sie bestimmt, wo Daten gespeichert werden. Standardmäßig darf die Inferenz in jeder verfügbaren Region laufen. Die Simulation spielt die mitgelieferten Vorab-Läufe ab, ohne die API aufzurufen."
    },
    "criticality": "critical",
    "tech": {
     "name": "Anthropic PBC",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Anthropic PBC",
     "country": "US",
     "parent": null
    },
    "hosting": "NON_EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "Live mode talks only to the Claude API; web search and web fetch run on Anthropic's servers.",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.anthropic.com/privacy",
      "title": "Privacy Policy \\ Anthropic",
      "quote": "Anthropic PBC with a registered address at 548 Market St, PMB 90375, San Francisco, CA 94104 (United States).",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://platform.claude.com/docs/en/manage-claude/data-residency",
      "title": "Data residency - Claude Platform Docs",
      "quote": "Currently, \"us\" is the only available workspace geo.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://platform.claude.com/docs/en/manage-claude/data-residency",
      "title": "Data residency - Claude Platform Docs",
      "quote": "Controls where data is stored at rest and where endpoint processing (such as image transcoding and code execution) occurs.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://platform.claude.com/docs/en/manage-claude/data-residency",
      "title": "Data residency - Claude Platform Docs",
      "quote": "Default. Inference may run in any available geography for optimal performance and availability.",
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
    "en": "Base services: web search and web fetch run as server tools on Anthropic's infrastructure.",
    "de": "Basisdienste: Websuche und Web-Abruf laufen als Server-Werkzeuge auf der Infrastruktur von Anthropic."
   }
  },
  {
   "fetch": {
    "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference",
    "title": "Tool reference - Claude Platform Docs"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "base_service",
    "name": {
     "en": "Web search and web fetch",
     "de": "Websuche und Web-Abruf"
    },
    "role": {
     "en": "Search the web and read pages for the agent in Live mode.",
     "de": "Suchen im Web und lesen Seiten für den Agenten im Live-Modus."
    },
    "note": {
     "en": "If an organisation switches either tool off, a Live run stops; Simulation does not use them.",
     "de": "Schaltet eine Organisation eines der beiden Werkzeuge ab, stoppt ein Live-Lauf; die Simulation nutzt sie nicht."
    },
    "criticality": "critical",
    "tech": {
     "name": "Anthropic PBC",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "Anthropic PBC",
     "country": "US",
     "parent": null
    },
    "hosting": "NON_EU",
    "licence": "unknown",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "Live mode talks only to the Claude API; web search and web fetch run on Anthropic's servers.",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference",
      "title": "Tool reference - Claude Platform Docs",
      "quote": "Anthropic provides two kinds of tools: server tools that run on Anthropic",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://www.anthropic.com/privacy",
      "title": "Privacy Policy \\ Anthropic",
      "quote": "Anthropic PBC with a registered address at 548 Market St, PMB 90375, San Francisco, CA 94104 (United States).",
      "lang": "en",
      "supports": [
       "tech",
       "operator"
      ],
      "verified": true
     },
     {
      "url": "https://platform.claude.com/docs/en/manage-claude/data-residency",
      "title": "Data residency - Claude Platform Docs",
      "quote": "Currently, \"us\" is the only available workspace geo.",
      "lang": "en",
      "supports": [
       "hosting"
      ],
      "verified": true
     },
     {
      "url": "https://platform.claude.com/docs/en/manage-claude/data-residency",
      "title": "Data residency - Claude Platform Docs",
      "quote": "Controls where data is stored at rest and where endpoint processing (such as image transcoding and code execution) occurs.",
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
    "en": "Applications: the prototype's own code. The repository names its maker and where he built it, but neither a licence nor who runs it.",
    "de": "Anwendungen: der eigene Code des Prototyps. Das Repository nennt seinen Urheber und wo er ihn gebaut hat, aber weder eine Lizenz noch, wer ihn betreibt."
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "applications",
    "name": {
     "en": "The prototype's code",
     "de": "Der Code des Prototyps"
    },
    "role": {
     "en": "The agent loop, the engine, the views and the pre-runs, all running in the visitor's browser.",
     "de": "Die Agentenschleife, die Engine, die Ansichten und die Vorab-Läufe, die alle im Browser der Besucher laufen."
    },
    "note": {
     "en": "The repository shows no licence. Its README says that Victor Pflüger built the prototype in Germany; no source says who runs it for this service: GitHub Pages serves the files, and the code runs in each visitor's browser.",
     "de": "Das Repository zeigt keine Lizenz. Seine README sagt, dass Victor Pflüger den Prototyp in Deutschland gebaut hat; keine Quelle sagt, wer ihn für diesen Dienst betreibt: GitHub Pages liefert die Dateien aus, und der Code läuft im Browser der Besucher."
    },
    "criticality": "critical",
    "tech": {
     "name": "Victor Pflüger",
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
      "url": "https://github.com/VictorPflueger/sovereigntyassessment/blob/67d20c38a6e57c565cf4c45180788d2bb059caf6/README.md",
      "title": "sovereigntyassessment/README.md at 67d20c3 · VictorPflueger/sovereigntyassessment",
      "quote": "Built by Victor Pflüger in Germany.",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     }
    ],
    "confidence": "medium"
   }
  },
  {
   "say": {
    "en": "Interface and access: Vici gives the interface its look, and the visitor's browser runs everything.",
    "de": "Oberfläche und Zugang: Vici gibt der Oberfläche ihr Aussehen, und der Browser der Besucher führt alles aus."
   }
  },
  {
   "fetch": {
    "url": "https://victorpflueger.github.io/ViciDesign/index.html",
    "title": "Vici Design System"
   }
  },
  {
   "tool": "rec_block",
   "input": {
    "layer": "access",
    "name": {
     "en": "Vici, the design system",
     "de": "Vici, das Designsystem"
    },
    "role": {
     "en": "The styles and components of the interface.",
     "de": "Die Stile und Komponenten der Oberfläche."
    },
    "note": {
     "en": "Its code is under the MIT licence; it has the same maker as the prototype. No source says who runs it for this service.",
     "de": "Sein Code steht unter der MIT-Lizenz; es hat denselben Urheber wie der Prototyp. Keine Quelle sagt, wer es für diesen Dienst betreibt."
    },
    "criticality": "important",
    "tech": {
     "name": "Victor Pflüger",
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
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "Design system: Vici.",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://victorpflueger.github.io/ViciDesign/index.html",
      "title": "Vici Design System",
      "quote": "Vici is Victor Pflüger",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment/blob/67d20c38a6e57c565cf4c45180788d2bb059caf6/README.md",
      "title": "sovereigntyassessment/README.md at 67d20c3 · VictorPflueger/sovereigntyassessment",
      "quote": "Built by Victor Pflüger in Germany.",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://victorpflueger.github.io/ViciDesign/index.html",
      "title": "Vici Design System",
      "quote": "code under the MIT licence, logo and name reserved.",
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
   "fetch": {
    "url": "https://www.google.com/intl/en/chrome/terms/",
    "title": "Google Chrome and ChromeOS Additional Terms of Service"
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
     "en": "The visitor's browser",
     "de": "Der Browser der Besucher"
    },
    "role": {
     "en": "Loads and runs the prototype; the repository asks for a current Chrome or Edge.",
     "de": "Lädt und führt den Prototyp aus; das Repository verlangt ein aktuelles Chrome oder Edge."
    },
    "note": {
     "en": "Chrome's executable is under Google's terms; on Edge, the other browser named, no source was read. The browser runs on the visitor's own device, so who runs it is the visitor.",
     "de": "Die ausführbare Datei von Chrome steht unter den Bedingungen von Google; zu Edge, dem anderen genannten Browser, wurde keine Quelle gelesen. Der Browser läuft auf dem eigenen Gerät der Besucher, betrieben wird er also von ihnen."
    },
    "criticality": "critical",
    "tech": {
     "name": "Google LLC",
     "country": "US",
     "parent": null
    },
    "operator": {
     "name": "The visitor",
     "country": "UNKNOWN",
     "parent": null
    },
    "hosting": "UNKNOWN",
    "licence": "proprietary",
    "exit": "unknown",
    "evidence": [
     {
      "url": "https://github.com/VictorPflueger/sovereigntyassessment",
      "title": "GitHub - VictorPflueger/sovereigntyassessment",
      "quote": "Use a current Chrome or Edge.",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://policies.google.com/terms",
      "title": "Google Terms of Service – Privacy & Terms – Google",
      "quote": "Google LLC organized under the laws of the State of Delaware, USA, and operating under the laws of the USA",
      "lang": "en",
      "supports": [
       "tech"
      ],
      "verified": true
     },
     {
      "url": "https://www.google.com/intl/en/chrome/terms/",
      "title": "Google Chrome and ChromeOS Additional Terms of Service",
      "quote": "These Google Chrome and ChromeOS Additional Terms of Service apply to the executable code version of Chrome and ChromeOS.",
      "lang": "en",
      "supports": [
       "tech",
       "licence"
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
    "en": "Every layer has blocks. GitHub and Anthropic are US companies that keep data in the United States; the code and Vici are made in Germany.",
    "de": "Jede Ebene hat Bausteine. GitHub und Anthropic sind US-Unternehmen, die Daten in den Vereinigten Staaten halten; der Code und Vici sind in Deutschland hergestellt."
   }
  },
  {
   "tool": "ui_request_review",
   "input": {
    "summary": {
     "en": "Seven building blocks. The overall score is {{fact:score.overall}}, indicative; evidence coverage is {{fact:coverage}}, and exclusive non-EU control of the critical blocks is {{fact:share.exclusive_non_eu}}. The hosting, the model and its web tools are at {{fact:seal.B-01}}, {{fact:seal.B-03}} and {{fact:seal.B-04}}: US companies, with data in the United States. Please check, correct or confirm.",
     "de": "Sieben Bausteine. Der Gesamtwert ist {{fact:score.overall}}, indikativ; die Belegabdeckung beträgt {{fact:coverage}}, und die exklusive Nicht-EU-Kontrolle der kritischen Bausteine liegt bei {{fact:share.exclusive_non_eu}}. Das Hosting, das Modell und seine Web-Werkzeuge stehen auf {{fact:seal.B-01}}, {{fact:seal.B-03}} und {{fact:seal.B-04}}: US-Unternehmen, mit Daten in den Vereinigten Staaten. Bitte prüfen, korrigieren oder bestätigen Sie."
    },
    "focus": [
     "B-01",
     "B-03",
     "B-04"
    ]
   }
  },
  {
   "say": {
    "en": "Levers: I look for a way to run the model in Europe.",
    "de": "Hebel: Ich suche einen Weg, das Modell in Europa zu betreiben."
   }
  },
  {
   "search": {
    "query": "Claude regional data residency Europe claude.com regional compliance",
    "results": [
     {
      "url": "https://claude.com/regional-compliance",
      "title": "Deploy Claude confidently, wherever you are"
     },
     {
      "url": "https://www.requesty.ai/eu/claude",
      "title": "Claude with EU data residency"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://claude.com/regional-compliance",
    "title": "Regional compliance | Claude by Anthropic"
   }
  },
  {
   "tool": "eng_whatif",
   "input": {
    "lever_id": "L1",
    "changes": [
     {
      "block_id": "B-03",
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
       "en": "Run the model in an EU region of a cloud platform",
       "de": "Das Modell in einer EU-Region einer Cloud-Plattform betreiben"
      },
      "rationale": {
       "en": "The model maker's own API keeps data in the United States. For Europe, the maker offers its models in country-specific regions through three large cloud platforms. Only the hosting changes: the maker still makes the model, the run-by class stays US, and the prototype would need another endpoint. With the model hosted in the EU, the overall score would be {{fact:whatif.L1.overall}}.",
       "de": "Die eigene API des Modellherstellers hält Daten in den Vereinigten Staaten. Für Europa bietet der Hersteller seine Modelle in länderspezifischen Regionen über drei große Cloud-Plattformen an. Nur das Hosting ändert sich: Der Hersteller stellt das Modell weiter her, die Betriebsklasse bleibt US, und der Prototyp bräuchte einen anderen Endpunkt. Läge das Modell in der EU, läge der Gesamtwert bei {{fact:whatif.L1.overall}}."
      },
      "changes": [
       {
        "block_id": "B-03",
        "hosting": "EU"
       }
      ],
      "evidence": [
       {
        "url": "https://claude.com/regional-compliance",
        "title": "Regional compliance | Claude by Anthropic",
        "quote": "For Europe, you can select country-specific deployment options through AWS Bedrock, GCP Vertex, and Microsoft Foundry",
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
     "en": "# Sovereignty Assessment: findings\n\nThis prototype, assessed with its own method. Its overall score is {{fact:score.overall}}, indicative, with evidence coverage of {{fact:coverage}}; exclusive non-EU control of the critical blocks is {{fact:share.exclusive_non_eu}}.\n\n- **Infrastructure** ({{fact:score.layer.infrastructure}}): GitHub Pages serves the static files. GitHub is a US company that Microsoft acquired; it logs the IP addresses of a Pages site's visitors and keeps personal data in several regions, the United States among them.\n- **Development, security and operations** ({{fact:score.layer.devsecops}}): the code lives on GitHub, and GitHub Actions runs the tests on every push and pull request.\n- **Platform** ({{fact:score.layer.platform}}): Live mode runs on Anthropic's Claude API. Anthropic is a US company; the only workspace geo is the United States, and by default inference may run in any available geography.\n- **Base services** ({{fact:score.layer.base_service}}): web search and web fetch run as server tools on Anthropic's infrastructure.\n- **Applications** ({{fact:score.layer.applications}}): the prototype's own code, built by Victor Pflüger in Germany, as its README says; no source says who runs it, so its level counts as partly unknown.\n- **Interface and access** ({{fact:score.layer.access}}): Vici, the design system of the same maker, with its code under the MIT licence and, like the code, no source on who runs it; and the visitor's browser, Chrome under Google's terms, or Edge.\n\nA sovereignty tool on a US model: yes, and the method says so in its own terms. The code and the design system are made in Germany, but Live mode depends on Anthropic in the United States and the site on GitHub; Simulation and the engine run in the browser without calling the model. The weakest critical link is {{fact:weakest.block}} at {{fact:weakest.level}}.",
     "de": "# Souveränitätsbewertung: Befunde\n\nDieser Prototyp, mit seiner eigenen Methode bewertet. Der Gesamtwert ist {{fact:score.overall}}, indikativ, bei einer Belegabdeckung von {{fact:coverage}}; die exklusive Nicht-EU-Kontrolle der kritischen Bausteine liegt bei {{fact:share.exclusive_non_eu}}.\n\n- **Infrastruktur** ({{fact:score.layer.infrastructure}}): GitHub Pages liefert die statischen Dateien aus. GitHub ist ein US-Unternehmen, das Microsoft übernommen hat; es protokolliert die IP-Adressen der Besucher einer Pages-Website und hält personenbezogene Daten in mehreren Regionen, darunter die Vereinigten Staaten.\n- **Entwicklung, Sicherheit und Betrieb** ({{fact:score.layer.devsecops}}): Der Code liegt auf GitHub, und GitHub Actions führt die Tests bei jedem Push und Pull Request aus.\n- **Plattform** ({{fact:score.layer.platform}}): Der Live-Modus läuft auf der Claude-API von Anthropic. Anthropic ist ein US-Unternehmen; die einzige Workspace-Region sind die Vereinigten Staaten, und standardmäßig darf die Inferenz in jeder verfügbaren Region laufen.\n- **Basisdienste** ({{fact:score.layer.base_service}}): Websuche und Web-Abruf laufen als Server-Werkzeuge auf der Infrastruktur von Anthropic.\n- **Anwendungen** ({{fact:score.layer.applications}}): der eigene Code des Prototyps, gebaut von Victor Pflüger in Deutschland, wie seine README sagt; keine Quelle sagt, wer ihn betreibt, daher gilt seine Stufe als teilweise unbekannt.\n- **Oberfläche und Zugang** ({{fact:score.layer.access}}): Vici, das Designsystem desselben Urhebers, dessen Code unter der MIT-Lizenz steht und zu dem, wie beim Code, keine Quelle sagt, wer es betreibt, und der Browser der Besucher, Chrome unter den Bedingungen von Google, oder Edge.\n\nEin Souveränitätswerkzeug auf einem US-Modell: ja, und die Methode sagt es in ihren eigenen Begriffen. Code und Designsystem sind in Deutschland hergestellt, doch der Live-Modus hängt an Anthropic in den Vereinigten Staaten und die Website an GitHub; Simulation und Engine laufen im Browser, ohne das Modell aufzurufen. Das schwächste kritische Glied ist {{fact:weakest.block}} auf {{fact:weakest.level}}."
    }
   }
  }
 ]
};
})();
