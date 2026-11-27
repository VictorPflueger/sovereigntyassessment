/* Pre-run assessment of Low-code and workflow automation (hand-authored, as of 2026-11-20): a recorded event stream that the
 * simulation player replays offline (js/simulation.js), through the same tool executors as the live agent.
 * Every quote is listed with its URL, title and read date in research/low-code.md; tools/check-runs.mjs
 * checks this file under section 8 of the brief and sets each quote's verified flag from those notes.
 * Model-written texts are { en, de } with the same placeholders; quotes stay in their own language.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var runs = window.SA_RUNS || (window.SA_RUNS = {});
  runs["low-code"] = {
 "id": "low-code",
 "entry_id": "low-code",
 "source": "hand_authored",
 "as_of": "2026-11-20",
 "method_version": "1.0",
 "query": "Low-code and workflow automation",
 "steps": [
  {
   "say": {
    "en": "I look low-code and workflow automation up in the catalogue and read the IT-Planungsrat's standards for the Deutschland-Stack, which name it.",
    "de": "Ich schlage Low-Code und Workflow-Automatisierung im Katalog nach und lese die Standards des IT-Planungsrats zum Deutschland-Stack, die sie nennen."
   }
  },
  {
   "tool": "cat_lookup",
   "input": {
    "query": "Low-code"
   }
  },
  {
   "fetch": {
    "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf",
    "title": "Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat",
    "pdf": true
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
   "tool": "rec_profile",
   "input": {
    "names": [
     "Low-Code",
     "Workflowautomatisierung"
    ],
    "category": "platform_or_access",
    "what": {
     "en": "Workflow automation (low code) for the simple modelling of procedures and work processes, a building block in the standards for the Deutschland-Stack.",
     "de": "Workflowautomatisierung (Low-Code) für die einfache Modellierung von Verfahrens- und Arbeitsabläufen, ein Baustein in den Standards zum Deutschland-Stack."
    },
    "how": {
     "en": "A category of platforms, not one service; the standards list the formats it still needs: for integrating or connecting external solutions, for exporting and importing models, and for running on different operating and infrastructure environments.",
     "de": "Eine Kategorie von Plattformen, kein einzelner Dienst; die Standards listen die Formate, die noch festzulegen sind: zur Integration oder Anbindung externer Lösungen, für Export und Import von Modellen und für die Ausführung auf verschiedenen Betriebs- und Infrastrukturumgebungen."
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
     "en": "A building block in the IT-Planungsrat's standards for the Deutschland-Stack; its own standards are still to be set.",
     "de": "Ein Baustein in den Standards des IT-Planungsrats zum Deutschland-Stack; eigene Standards sind noch festzulegen."
    },
    "evidence": [
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf",
      "title": "Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat",
      "quote": "Workflowautomatisierung (LowCode) wird für die einfache Modellierung von Verfahrens- und Arbeitsabläufen eingesetzt.",
      "lang": "de",
      "supports": [
       "what"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf",
      "title": "Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat",
      "quote": "Format zur Integration oder Anbindung von externen Lösungen",
      "lang": "de",
      "supports": [
       "how",
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf",
      "title": "Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat",
      "quote": "Format für Export und Import von Modellen",
      "lang": "de",
      "supports": [
       "how",
       "status"
      ],
      "verified": true,
      "read_on": "2026-11-20"
     },
     {
      "url": "https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf",
      "title": "Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat",
      "quote": "Format für die Ausführung auf verschiedenen Betriebs- und Infrastrukturumgebungen",
      "lang": "de",
      "supports": [
       "how",
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
    "en": "The standards describe workflow automation as a category for modelling procedures and work processes, name no product for it yet and list the formats still to be set. A category is not one service with a maker and an operator, so I end the run without an assessment.",
    "de": "Die Standards beschreiben Workflow-Automatisierung als Kategorie für die Modellierung von Verfahrens- und Arbeitsabläufen, nennen noch kein Produkt dafür und listen die noch festzulegenden Formate. Eine Kategorie ist kein einzelner Dienst mit Hersteller und Betreiber, daher beende ich den Lauf ohne Bewertung."
   }
  },
  {
   "report": {
    "outcome": "not_a_service",
    "findings": {
     "en": "# Low-code and workflow automation: no assessment\n\nLow-code and workflow automation is a building block in the IT-Planungsrat's standards for the Deutschland-Stack: it is used for the simple modelling of procedures and work processes. The standards name no product or standard for it yet and list what is still to be set: a format for integrating or connecting external solutions, one for exporting and importing models, and one for running them on different operating and infrastructure environments. A category is not one service with a maker and an operator, so this run ends without a score.\n\n- **When to assess it**: each low-code platform that an administration runs can be assessed on its own with a Live run; the formats still to be set will decide how easily an administration can move between such platforms.",
     "de": "# Low-Code und Workflow-Automatisierung: keine Bewertung\n\nLow-Code und Workflow-Automatisierung ist ein Baustein in den Standards des IT-Planungsrats zum Deutschland-Stack: Sie dient der einfachen Modellierung von Verfahrens- und Arbeitsabläufen. Die Standards nennen dafür noch kein Produkt und keinen Standard und listen, was noch festzulegen ist: ein Format zur Integration oder Anbindung externer Lösungen, eines für Export und Import von Modellen und eines für die Ausführung auf verschiedenen Betriebs- und Infrastrukturumgebungen. Eine Kategorie ist kein einzelner Dienst mit Hersteller und Betreiber, daher endet dieser Lauf ohne Wert.\n\n- **Wann sie sich bewerten lässt**: Jede Low-Code-Plattform, die eine Verwaltung betreibt, lässt sich mit einem Live-Lauf für sich bewerten; die noch festzulegenden Formate werden entscheiden, wie leicht eine Verwaltung zwischen solchen Plattformen wechseln kann."
    }
   }
  }
 ]
};
})();
