/* Pre-run assessment of ZBDS (central payment component) (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/zbds.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["zbds"] = {
 "id": "zbds",
 "entry_id": "zbds",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "ZBDS",
 "steps": [
  {
   "say": {
    "en": "I look the ZBDS up in the catalogue, read the Deutschland-Stack papers that name it and the Federal Government's latest answer on the stack's base components.",
    "de": "Ich schlage die ZBDS im Katalog nach, lese die Papiere zum Deutschland-Stack, die sie nennen, und die jüngste Antwort der Bundesregierung zu den Basiskomponenten des Stacks."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "ZBDS"
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
   "fetch": {
    "url": "https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
    "title": "Deutschland-Stack – Wohin geht die Reise?",
    "pdf": true
   }
  },
  {
   "search": {
    "query": "ZBDS zentrale Bezahldienst Komponente Deutschland-Stack Betrieb entwickelt",
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
     "ZBDS",
     "Zentrale Bezahlkomponente"
    ],
    "category": "base_service",
    "what": {
     "en": "The planned central payment component of the Deutschland-Stack, for payment processing.",
     "de": "Die geplante zentrale Bezahlkomponente des Deutschland-Stacks für die Zahlungsabwicklung."
    },
    "how": {
     "en": "Not described yet: no source read says how it will work.",
     "de": "Noch nicht beschrieben: Keine gelesene Quelle sagt, wie sie arbeiten wird."
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
     "en": "Being designed, together with its operating and financing model.",
     "de": "In Ausgestaltung, einschließlich Betriebs- und Finanzierungsmodell."
    },
    "evidence": [
     {
      "url": "https://dserver.bundestag.de/btd/21/090/2109020.pdf",
      "title": "Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes",
      "quote": "Zahlungsabwicklung (ZBDS) und Postfach/Benachrichtigung (ZaPuk) sind Gegenstand einer Konzeptionierung",
      "lang": "de",
      "supports": [
       "what",
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://dserver.bundestag.de/btd/21/090/2109020.pdf",
      "title": "Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes",
      "quote": "Bezahlkomponente (in Ausgestaltung)",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://dserver.bundestag.de/btd/21/090/2109020.pdf",
      "title": "Drucksache 21/9020: Der Deutschland-Stack – Entwicklungsstand, Verbindlichkeit und digitale Souveränität der Verwaltungsarchitektur des Bundes",
      "quote": "inklusive Betriebs- und Finanzierungsmodell bis spätestens zur 52. Sitzung des IT-Planungsrats.",
      "lang": "de",
      "supports": [
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.bundestag.de/1232782",
      "title": "Deutschland-Stack: Zwei von fünf Basiskomponenten nutzbar - Deutscher Bundestag",
      "quote": "Für die Bezahlkomponente und das Postfach liefen noch Konzeptionsarbeiten, geht aus der Antwort weiter hervor.",
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
    "en": "The Federal Government lists the payment component as still being designed, its operating and financing model included. No source read names a maker, an operator or a building block, so there is nothing to assess yet, and I end the run without an assessment.",
    "de": "Die Bundesregierung führt die Bezahlkomponente als noch in Ausgestaltung, einschließlich Betriebs- und Finanzierungsmodell. Keine gelesene Quelle nennt einen Hersteller, einen Betreiber oder einen Baustein; es gibt also noch nichts zu bewerten, und ich beende den Lauf ohne Bewertung."
   }
  },
  {
   "report": {
    "outcome": "not_a_service",
    "findings": {
     "en": "# ZBDS: no assessment yet\n\nThe ZBDS is the planned central payment component of the Deutschland-Stack. In its answer to a parliamentary question, the Federal Government lists the payment component as still being designed: the payment processing (ZBDS) and the mailbox (ZaPuK) are being conceived, including their operating and financing model. The Bundestag's news service reports that conception work is still under way for both. No source read names a maker, an operator or a building block, so there is nothing to assess yet, and this run ends without a score.\n\n- **What exists today**: ePayBL, the payment system the ZBDS is to be integrated with, has an assessment of its own in the catalogue.\n- **When to assess it**: once its operating model is set and its parts are named, a Live run can assess the ZBDS like any other service.",
     "de": "# ZBDS: noch keine Bewertung\n\nDie ZBDS ist die geplante zentrale Bezahlkomponente des Deutschland-Stacks. In ihrer Antwort auf eine parlamentarische Anfrage führt die Bundesregierung die Bezahlkomponente als noch in Ausgestaltung: Zahlungsabwicklung (ZBDS) und Postfach (ZaPuK) werden konzipiert, einschließlich Betriebs- und Finanzierungsmodell. Der Nachrichtendienst des Bundestages meldet, dass für beide noch Konzeptionsarbeiten laufen. Keine gelesene Quelle nennt einen Hersteller, einen Betreiber oder einen Baustein; es gibt also noch nichts zu bewerten, und dieser Lauf endet ohne Wert.\n\n- **Was es heute gibt**: ePayBL, das Bezahlsystem, an das die ZBDS angebunden werden soll, hat im Katalog eine eigene Bewertung.\n- **Wann sie sich bewerten lässt**: sobald ihr Betriebsmodell feststeht und ihre Teile benannt sind; dann kann ein Live-Lauf die ZBDS wie jeden anderen Dienst bewerten."
    }
   }
  }
 ]
};
})();
