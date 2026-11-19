// The golden cases of the brief (section 11) for Diagnostics in the browser: an exact copy of
// tests/fixtures/*.json, written by tools/golden.mjs. Do not edit by hand; tests/unit.mjs checks the copy.
// Fictional services and figures throughout.
export default Object.freeze({
 "f-audit.json": {
  "case": "F01 to F29",
  "what": "The fact audit (rule 4), as the brief's section 11 writes it: the run's facts and evidence, then each model text with the expected result and the offending tokens, in the order they appear",
  "facts": [
   "score.overall",
   "score.layer.access",
   "seal.B-03",
   "coverage"
  ],
  "evidence": {
   "titles": [
    "Microsoft 365 in the pilot authority",
    "BSI C5 and ISO 27001 for the data centre"
   ],
   "quotes": [
    "Betrieb durch T-Systems seit 2025",
    "Rechtsgrundlage ist § 3 OZG",
    "2025 übernahm T-Systems den Betrieb"
   ]
  },
  "cases": [
   {
    "id": "F01",
    "text": "The overall score is {{fact:score.overall}}.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F02",
    "text": "The overall score is 72.",
    "expected": {
     "pass": false,
     "tokens": [
      "72"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F03",
    "text": "Most critical blocks are run in Germany.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F04",
    "text": "Half of the critical blocks are made in the US.",
    "expected": {
     "pass": false,
     "tokens": [
      "Half"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F05",
    "text": "The office suite is Microsoft 365.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F06",
    "text": "The office suite is Microsoft 365 with Teams 2.0.",
    "expected": {
     "pass": false,
     "tokens": [
      "2.0"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F07",
    "text": "Block B-03 stands at {{fact:seal.B-03}}.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F08",
    "text": "Block B-03 is SEAL-1.",
    "expected": {
     "pass": false,
     "tokens": [
      "SEAL-1"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F09",
    "text": "Das sind 40 Prozent der kritischen Bausteine.",
    "expected": {
     "pass": false,
     "tokens": [
      "40",
      "Prozent"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F10",
    "text": "Die Quelle vom 2026-11-02 nennt das ITZBund als Betreiber.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F11",
    "text": "Laut Quelle: „Betrieb durch T-Systems seit 2025“.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F12",
    "text": "Laut Quelle: „Betrieb seit 2024“.",
    "expected": {
     "pass": false,
     "tokens": [
      "2024"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F13",
    "text": "Coverage is {{fact:coverage.critical}}.",
    "expected": {
     "pass": false,
     "tokens": [],
     "unknown_facts": [
      "coverage.critical"
     ]
    }
   },
   {
    "id": "F14",
    "text": "A quarter of the layers lack evidence.",
    "expected": {
     "pass": false,
     "tokens": [
      "A quarter"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F15",
    "text": "Ein Viertel der Schichten ist ohne Beleg.",
    "expected": {
     "pass": false,
     "tokens": [
      "Viertel"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F16",
    "text": "The score is {{fact:score.overall}} out of 100.",
    "expected": {
     "pass": false,
     "tokens": [
      "100"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F17",
    "text": "The operator publishes a quarterly status report.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F18",
    "text": "Lever L2 keeps three layers unchanged.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F19",
    "text": "The app store is run by a third party outside the EU.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F20",
    "text": "Two thirds of the blocks are made in the US.",
    "expected": {
     "pass": false,
     "tokens": [
      "Two thirds"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F21",
    "text": "The legal basis is § 3 OZG.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F22",
    "text": "The legal basis is § 9 OZG.",
    "expected": {
     "pass": false,
     "tokens": [
      "9"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F23",
    "text": "The operator holds a BSI C5 attestation.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F24",
    "text": "The operator also holds a PSD2 licence.",
    "expected": {
     "pass": false,
     "tokens": [
      "PSD2"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F25",
    "text": "Operations are certified to ISO 27001.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F26",
    "text": "Laut Quelle: „2025 übernahm T-Systems den Betrieb“.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F27",
    "text": "Laut Quelle: „2024 übernahm T-Systems den Betrieb“.",
    "expected": {
     "pass": false,
     "tokens": [
      "2024"
     ],
     "unknown_facts": []
    }
   },
   {
    "id": "F28",
    "text": "A third-party provider runs the app store.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   },
   {
    "id": "F29",
    "text": "The operator is a third-country company.",
    "expected": {
     "pass": true,
     "tokens": [],
     "unknown_facts": []
    }
   }
  ],
  "nbsp_variants": {
   "what": "F21 and F22 a second time with a non-breaking space after the section sign; the results stay the same",
   "cases": [
    {
     "id": "F21-nbsp",
     "text": "The legal basis is § 3 OZG.",
     "expected": {
      "pass": true,
      "tokens": [],
      "unknown_facts": []
     }
    },
    {
     "id": "F22-nbsp",
     "text": "The legal basis is § 9 OZG.",
     "expected": {
      "pass": false,
      "tokens": [
       "9"
      ],
      "unknown_facts": []
     }
    }
   ]
  },
  "decisions": {
   "what": "Cases for decisions D9 (a four-digit year passes when the run's evidence contains it) and D10 (cardinal number words above twelve are blocked, compounds included), written for this build; the same facts and evidence",
   "cases": [
    {
     "id": "D9-1",
     "text": "The operator has run the service since 2025.",
     "expected": {
      "pass": true,
      "tokens": [],
      "unknown_facts": []
     }
    },
    {
     "id": "D9-2",
     "text": "The operator has run the service since 2019.",
     "expected": {
      "pass": false,
      "tokens": [
       "2019"
      ],
      "unknown_facts": []
     }
    },
    {
     "id": "D9-3",
     "text": "Der Betrieb läuft seit 2025, laut der Quelle vom 2026-11-02.",
     "expected": {
      "pass": true,
      "tokens": [],
      "unknown_facts": []
     }
    },
    {
     "id": "D10-1",
     "text": "Seventy-two of the blocks are scored.",
     "expected": {
      "pass": false,
      "tokens": [
       "Seventy-two"
      ],
      "unknown_facts": []
     }
    },
    {
     "id": "D10-2",
     "text": "Zweiundsiebzig Bausteine sind bewertet.",
     "expected": {
      "pass": false,
      "tokens": [
       "Zweiundsiebzig"
      ],
      "unknown_facts": []
     }
    },
    {
     "id": "D10-3",
     "text": "Thirteen blocks lack evidence.",
     "expected": {
      "pass": false,
      "tokens": [
       "Thirteen"
      ],
      "unknown_facts": []
     }
    },
    {
     "id": "D10-4",
     "text": "The service rests on twelve building blocks in five layers.",
     "expected": {
      "pass": true,
      "tokens": [],
      "unknown_facts": []
     }
    },
    {
     "id": "D10-5",
     "text": "Der Dienst ruht auf zwölf Bausteinen.",
     "expected": {
      "pass": true,
      "tokens": [],
      "unknown_facts": []
     }
    },
    {
     "id": "D10-6",
     "text": "Hundreds of authorities use the service.",
     "expected": {
      "pass": false,
      "tokens": [
       "Hundreds"
      ],
      "unknown_facts": []
     }
    },
    {
     "id": "D10-7",
     "text": "Das Rechenzentrum stammt aus dem letzten Jahrhundert.",
     "expected": {
      "pass": true,
      "tokens": [],
      "unknown_facts": []
     }
    }
   ]
  }
 },
 "s1-levels.json": {
  "case": "S1",
  "what": "Level rules: one block per row, Made in and Run by as countries or UNKNOWN, as the brief's section 11 writes them",
  "cases": [
   {
    "id": "R01",
    "made_in": "DE",
    "licence": "proprietary",
    "run_by": "DE",
    "hosting": "EU",
    "expected": {
     "level": 4,
     "partly_unknown": false
    }
   },
   {
    "id": "R02",
    "made_in": "US",
    "licence": "open_source",
    "run_by": "DE",
    "hosting": "EU",
    "expected": {
     "level": 3,
     "partly_unknown": false
    }
   },
   {
    "id": "R03",
    "made_in": "US",
    "licence": "proprietary",
    "run_by": "DE",
    "hosting": "EU",
    "expected": {
     "level": 2,
     "partly_unknown": false
    }
   },
   {
    "id": "R04",
    "made_in": "US",
    "licence": "proprietary",
    "run_by": "US",
    "hosting": "EU",
    "expected": {
     "level": 1,
     "partly_unknown": false
    }
   },
   {
    "id": "R05",
    "made_in": "US",
    "licence": "proprietary",
    "run_by": "US",
    "hosting": "NON_EU",
    "expected": {
     "level": 0,
     "partly_unknown": false
    }
   },
   {
    "id": "R06",
    "made_in": "CN",
    "licence": "open_source",
    "run_by": "DE",
    "hosting": "EU",
    "expected": {
     "level": 3,
     "partly_unknown": false
    }
   },
   {
    "id": "R07",
    "made_in": "UNKNOWN",
    "licence": "unknown",
    "run_by": "DE",
    "hosting": "EU",
    "expected": {
     "level": 2,
     "partly_unknown": true
    }
   },
   {
    "id": "R08",
    "made_in": "DE",
    "licence": "proprietary",
    "run_by": "UNKNOWN",
    "hosting": "UNKNOWN",
    "expected": {
     "level": 2,
     "partly_unknown": true
    }
   },
   {
    "id": "R09",
    "made_in": "UNKNOWN",
    "licence": "unknown",
    "run_by": "UNKNOWN",
    "hosting": "UNKNOWN",
    "expected": {
     "level": null,
     "partly_unknown": false,
     "unscored": true
    }
   },
   {
    "id": "R10",
    "made_in": "FR",
    "licence": "proprietary",
    "run_by": "US",
    "hosting": "EU",
    "expected": {
     "level": 1,
     "partly_unknown": false
    }
   },
   {
    "id": "R11",
    "made_in": "CH",
    "licence": "open_source",
    "run_by": "NL",
    "hosting": "EU",
    "expected": {
     "level": 3,
     "partly_unknown": false
    }
   },
   {
    "id": "R12",
    "made_in": "US",
    "licence": "open_source",
    "run_by": "US",
    "hosting": "UNKNOWN",
    "expected": {
     "level": 0,
     "partly_unknown": false
    }
   },
   {
    "id": "R13",
    "made_in": "UNKNOWN",
    "licence": "unknown",
    "run_by": "US",
    "hosting": "NON_EU",
    "expected": {
     "level": 0,
     "partly_unknown": true
    }
   }
  ]
 },
 "s2-assessment.json": {
  "case": "S2",
  "what": "A whole assessment: the fictional \"Musterdienst\" with eleven blocks, as the brief's section 11 writes it",
  "service": "Musterdienst",
  "category": "base_service",
  "blocks": [
   {
    "id": "B-01",
    "layer": "infrastructure",
    "criticality": "critical",
    "made_in": "US",
    "licence": "proprietary",
    "run_by": "US",
    "hosting": "EU"
   },
   {
    "id": "B-02",
    "layer": "infrastructure",
    "criticality": "supporting",
    "made_in": "DE",
    "licence": "proprietary",
    "run_by": "DE",
    "hosting": "EU"
   },
   {
    "id": "B-03",
    "layer": "devsecops",
    "criticality": "important",
    "made_in": "DE",
    "licence": "proprietary",
    "run_by": "DE",
    "hosting": "EU"
   },
   {
    "id": "B-04",
    "layer": "devsecops",
    "criticality": "important",
    "made_in": "UNKNOWN",
    "licence": "unknown",
    "run_by": "UNKNOWN",
    "hosting": "UNKNOWN"
   },
   {
    "id": "B-05",
    "layer": "platform",
    "criticality": "critical",
    "made_in": "US",
    "licence": "open_source",
    "run_by": "DE",
    "hosting": "EU"
   },
   {
    "id": "B-06",
    "layer": "platform",
    "criticality": "important",
    "made_in": "UNKNOWN",
    "licence": "unknown",
    "run_by": "DE",
    "hosting": "EU"
   },
   {
    "id": "B-07",
    "layer": "base_service",
    "criticality": "critical",
    "made_in": "DE",
    "licence": "proprietary",
    "run_by": "DE",
    "hosting": "EU"
   },
   {
    "id": "B-08",
    "layer": "applications",
    "criticality": "critical",
    "made_in": "FR",
    "licence": "proprietary",
    "run_by": "DE",
    "hosting": "EU"
   },
   {
    "id": "B-09",
    "layer": "applications",
    "criticality": "supporting",
    "made_in": "CN",
    "licence": "open_source",
    "run_by": "DE",
    "hosting": "EU"
   },
   {
    "id": "B-10",
    "layer": "access",
    "criticality": "critical",
    "made_in": "US",
    "licence": "proprietary",
    "run_by": "US",
    "hosting": "NON_EU"
   },
   {
    "id": "B-11",
    "layer": "access",
    "criticality": "important",
    "made_in": "US",
    "licence": "open_source",
    "run_by": "DE",
    "hosting": "EU"
   }
  ],
  "expected": {
   "layers": {
    "infrastructure": {
     "exact": "175/4",
     "en": "44",
     "de": "44"
    },
    "devsecops": {
     "exact": "100",
     "en": "100",
     "de": "100"
    },
    "platform": {
     "exact": "65",
     "en": "65",
     "de": "65"
    },
    "base_service": {
     "exact": "100",
     "en": "100",
     "de": "100"
    },
    "applications": {
     "exact": "375/4",
     "en": "94",
     "de": "94"
    },
    "access": {
     "exact": "30",
     "en": "30",
     "de": "30"
    }
   },
   "overall": {
    "exact": "865/12",
    "en": "72",
    "de": "72"
   },
   "coverage": {
    "exact": "23/25",
    "en": "92%",
    "de": "92 %"
   },
   "exclusive_non_eu": {
    "exact": "2/5",
    "en": "40%",
    "de": "40 %"
   },
   "weakest": {
    "block": "B-10",
    "level": 0,
    "ties": 0
   },
   "unscored": [
    "B-04"
   ],
   "partly_unknown": [
    "B-06"
   ],
   "made_in_all": {
    "DE": 3,
    "EU": 1,
    "US": 4,
    "CN": 1,
    "OTHER": 0,
    "UNKNOWN": 2
   },
   "made_in_critical": {
    "DE": 1,
    "EU": 1,
    "US": 3,
    "CN": 0,
    "OTHER": 0,
    "UNKNOWN": 0
   },
   "run_by_all": {
    "DE": 8,
    "EU": 0,
    "US": 2,
    "CN": 0,
    "OTHER": 0,
    "UNKNOWN": 1
   }
  },
  "note": "The brief lists the critical Made-in counts as DE 1, EU 1, US 3 and the Run-by counts as DE 8, US 2, UNKNOWN 1; the classes it leaves out are zero, since the listed counts already add up to the five critical and the eleven blocks."
 },
 "s3-levers.json": {
  "case": "S3",
  "what": "Levers on the S2 assessment (Musterdienst), as the brief's section 11 writes them; the assessment itself stays unchanged after both what-ifs",
  "base": "s2-assessment.json",
  "levers": [
   {
    "lever_id": "L1",
    "change": "B-01 made in EU, run by EU, hosted in the EU",
    "changes": [
     {
      "block_id": "B-01",
      "made_in": "EU",
      "run_by": "EU",
      "hosting": "EU"
     }
    ],
    "expected": {
     "overall": {
      "exact": "1955/24",
      "en": "81",
      "de": "81"
     },
     "delta": {
      "exact": "75/8",
      "en": "+9",
      "de": "+9"
     },
     "weakest": {
      "block": "B-10",
      "level": 0
     },
     "exclusive_non_eu": {
      "exact": "1/5"
     }
    }
   },
   {
    "lever_id": "L2",
    "change": "B-10 run by EU, hosted in the EU, made in US as before",
    "changes": [
     {
      "block_id": "B-10",
      "run_by": "EU",
      "hosting": "EU"
     }
    ],
    "expected": {
     "overall": {
      "exact": "925/12",
      "en": "77",
      "de": "77"
     },
     "delta": {
      "exact": "5",
      "en": "+5",
      "de": "+5"
     },
     "weakest": {
      "block": "B-01",
      "level": 1
     },
     "exclusive_non_eu": {
      "exact": "1/5"
     }
    }
   }
  ]
 },
 "s4-portfolio.json": {
  "case": "S4",
  "what": "Portfolio: two base services and one platform, by the levels of their scored critical blocks, as the brief's section 11 writes them. Musterdienst is the S2 assessment; for the other two the brief gives only the levels, so each has blocks built to give exactly those levels (the test checks they do).",
  "assessments": [
   {
    "service": "Musterdienst",
    "category": "base_service",
    "from": "s2-assessment.json",
    "critical_levels": [
     1,
     3,
     4,
     4,
     0
    ]
   },
   {
    "service": "Beispieldienst",
    "category": "base_service",
    "critical_levels": [
     0,
     2,
     4,
     4
    ],
    "blocks": [
     {
      "id": "B-01",
      "layer": "access",
      "criticality": "critical",
      "made_in": "US",
      "licence": "proprietary",
      "run_by": "US",
      "hosting": "NON_EU"
     },
     {
      "id": "B-02",
      "layer": "platform",
      "criticality": "critical",
      "made_in": "US",
      "licence": "proprietary",
      "run_by": "DE",
      "hosting": "EU"
     },
     {
      "id": "B-03",
      "layer": "infrastructure",
      "criticality": "critical",
      "made_in": "DE",
      "licence": "proprietary",
      "run_by": "DE",
      "hosting": "EU"
     },
     {
      "id": "B-04",
      "layer": "applications",
      "criticality": "critical",
      "made_in": "DE",
      "licence": "open_source",
      "run_by": "DE",
      "hosting": "EU"
     }
    ]
   },
   {
    "service": "Probeportal",
    "category": "platform_or_access",
    "critical_levels": [
     1,
     1,
     3
    ],
    "blocks": [
     {
      "id": "B-01",
      "layer": "infrastructure",
      "criticality": "critical",
      "made_in": "US",
      "licence": "proprietary",
      "run_by": "US",
      "hosting": "EU"
     },
     {
      "id": "B-02",
      "layer": "platform",
      "criticality": "critical",
      "made_in": "US",
      "licence": "proprietary",
      "run_by": "US",
      "hosting": "EU"
     },
     {
      "id": "B-03",
      "layer": "access",
      "criticality": "critical",
      "made_in": "US",
      "licence": "open_source",
      "run_by": "DE",
      "hosting": "EU"
     }
    ]
   }
  ],
  "expected": {
   "base_service": {
    "count": "3 of 9",
    "exact": "1/3",
    "en": "33%",
    "de": "33 %"
   },
   "platform_or_access": {
    "count": "2 of 3",
    "exact": "2/3",
    "en": "67%",
    "de": "67 %"
   }
  }
 }
});
