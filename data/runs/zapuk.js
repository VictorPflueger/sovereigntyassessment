/* Pre-run assessment of ZaPuK (target architecture for mailbox and communication solutions) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/zapuk.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["zapuk"] = {
 "id": "zapuk",
 "entry_id": "zapuk",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "ZaPuK",
 "steps": [
  {
   "say": {
    "en": "I look ZaPuK up in the catalogue, read the IT-Planungsrat's overview of the target architecture and the FITKO's handout, and check what the Federal Government says about the mailbox.",
    "de": "Ich schlage ZaPuK im Katalog nach, lese den Überblick des IT-Planungsrats zur Zielarchitektur und das Handout der FITKO und prüfe, was die Bundesregierung zum Postfach sagt."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "ZaPuK"
   }
  },
  {
   "fetch": {
    "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf",
    "title": "Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0",
    "pdf": true
   }
  },
  {
   "fetch": {
    "url": "https://www.fitko.de/fileadmin/fitko/veranstaltungen/die_fitko_stellt_vor/20260116-Handout_FITKO_stellt_vor_ZaPuK.pdf",
    "title": "Die FITKO stellt vor: Zielarchitektur für Postfach- und Kommunikationslösungen (ZaPuK), Handout 16.01.2026",
    "pdf": true
   }
  },
  {
   "search": {
    "query": "Bundesregierung Antwort Deutschland-Stack Postfach ZaPuK Bezahlkomponente Konzeption",
    "results": [
     {
      "url": "https://dserver.bundestag.de/btd/21/090/2109020.pdf",
      "title": "dserver.bundestag.de"
     },
     {
      "url": "https://www.bundestag.de/1232782",
      "title": "11.11.2026 Digitales und Staatsmodernisierung — Antwort — hib 920/2026"
     }
    ]
   }
  },
  {
   "fetch": {
    "url": "https://dserver.bundestag.de/btd/21/090/2109020.pdf",
    "title": "Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes",
    "pdf": true
   }
  },
  {
   "fetch": {
    "url": "https://www.bundestag.de/1232782",
    "title": "Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag"
   }
  },
  {
   "tool": "rec_profile",
   "input": {
    "names": [
     "ZaPuK",
     "Zielarchitektur für Postfach- und Kommunikationslösungen"
    ],
    "category": "base_service",
    "what": {
     "en": "The federal target architecture for mailbox and communication solutions: a framework and guideline for strategic planning.",
     "de": "Die föderale Zielarchitektur für Postfach- und Kommunikationslösungen: ein Rahmenwerk und eine Richtlinie für die strategische Planung."
    },
    "how": {
     "en": "It describes the configuration of the relevant business processes and a uniform federal mailbox and communication infrastructure.",
     "de": "Sie beschreibt die Konfiguration der einschlägigen Geschäftsprozesse und eine einheitliche föderale Postfach- und Kommunikationsinfrastruktur."
    },
    "owner": {
     "name": "UNKNOWN",
     "country": "UNKNOWN",
     "parent": null
    },
    "operator": {
     "name": "UNKNOWN",
     "country": "UNKNOWN",
     "parent": null
    },
    "status": {
     "en": "A target architecture: detailed transition and migration plans are still to be developed, and the Federal Government lists the mailbox as being designed.",
     "de": "Eine Zielarchitektur: Detaillierte Transitions- und Migrationspläne sollen noch entwickelt werden, und die Bundesregierung führt das Postfach als in Ausgestaltung."
    },
    "evidence": [
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf",
      "title": "Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0",
      "quote": "Die Zielarchitektur dient als strukturiertes Rahmenwerk und konkrete Richtlinie für die strategische Planung",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf",
      "title": "Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0",
      "quote": "Die Zielarchitektur beschreibt eine einheitliche föderale Postfach- und Kommunikationsinfrastruktur",
      "lang": "de",
      "supports": [
       "what",
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf",
      "title": "Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0",
      "quote": "Das vorliegende Dokument beschreibt eine Zielarchitektur, d. h. die Konfiguration der einschlägigen Geschäftsprozesse",
      "lang": "de",
      "supports": [
       "how"
      ],
      "verified": true
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf",
      "title": "Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0",
      "quote": "In dieser Phase sollen detaillierte Transitions- und Migrationspläne entwickelt werden.",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://dserver.bundestag.de/btd/21/090/2109020.pdf",
      "title": "Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes",
      "quote": "Postfach (in Ausgestaltung)",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://dserver.bundestag.de/btd/21/090/2109020.pdf",
      "title": "Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes",
      "quote": "Zahlungsabwicklung (ZBDS) und Postfach/Benachrichtigung (ZaPuk) sind Gegenstand einer Konzeptionierung",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true
     },
     {
      "url": "https://www.bundestag.de/1232782",
      "title": "Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag",
      "quote": "Für die Bezahlkomponente und das Postfach liefen noch Konzeptionsarbeiten, geht aus der Antwort weiter hervor.",
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
    "en": "ZaPuK is a target architecture: a framework for planning a uniform federal mailbox and communication infrastructure, with transition and migration plans still to come; the Federal Government says the mailbox is still being conceived. It is not a service with building blocks of its own, so I end the run without an assessment.",
    "de": "ZaPuK ist eine Zielarchitektur: ein Rahmenwerk für die Planung einer einheitlichen föderalen Postfach- und Kommunikationsinfrastruktur, dessen Transitions- und Migrationspläne noch folgen; laut Bundesregierung wird das Postfach noch konzipiert. Es ist kein Dienst mit eigenen Bausteinen, daher beende ich den Lauf ohne Bewertung."
   }
  },
  {
   "report": {
    "outcome": "not_a_service",
    "findings": {
     "en": "# ZaPuK: no assessment\n\nZaPuK is the federal target architecture for mailbox and communication solutions between people, organisations and public bodies. The IT-Planungsrat's overview calls it a framework and guideline for strategic planning that describes a uniform federal mailbox and communication infrastructure; detailed transition and migration plans are still to be developed. The Federal Government says the mailbox is being conceived, including its operating and financing model. A target architecture has no makers or operators of its own, so this run ends without a score.\n\n- **What exists today**: the mailboxes in use belong to the services that offer them; the mailbox of Mein Unternehmenskonto, for example, is part of that service's assessment in the catalogue.\n- **When to assess it**: once a federal mailbox runs under this architecture, a Live run can assess it like any other service.",
     "de": "# ZaPuK: keine Bewertung\n\nZaPuK ist die föderale Zielarchitektur für Postfach- und Kommunikationslösungen zwischen Menschen, Organisationen und öffentlichen Stellen. Der Überblick des IT-Planungsrats nennt sie ein Rahmenwerk und eine Richtlinie für die strategische Planung, die eine einheitliche föderale Postfach- und Kommunikationsinfrastruktur beschreibt; detaillierte Transitions- und Migrationspläne sollen noch entwickelt werden. Laut Bundesregierung wird das Postfach konzipiert, einschließlich Betriebs- und Finanzierungsmodell. Eine Zielarchitektur hat keine eigenen Hersteller oder Betreiber, daher endet dieser Lauf ohne Wert.\n\n- **Was es heute gibt**: Die genutzten Postfächer gehören zu den Diensten, die sie anbieten; das Postfach von Mein Unternehmenskonto etwa ist Teil der Bewertung dieses Dienstes im Katalog.\n- **Wann sie sich bewerten lässt**: sobald ein föderales Postfach nach dieser Architektur läuft; dann kann ein Live-Lauf es wie jeden anderen Dienst bewerten."
    }
   }
  }
 ]
};
})();
