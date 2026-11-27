/* The bundled catalogue (brief §8): seventeen German digital base services, platforms and access channels,
 * each with names in both languages, category, a one-line description, status and verified starting
 * URLs, and as the eighteenth entry this prototype itself, in a category of its own (self_assessment,
 * from version 0.3.0). Every URL was opened with the web fetch tool on 19 November 2026 (the
 * self-assessment's on 20 November 2026, the Serviceportal.NRW's, added in version 2.1.0, on 27 November
 * 2026), and every description and status line rests on what those
 * pages say (DATA_SOURCES.md lists them). The live agent's cat_lookup
 * returns an entry with its URLs, which makes them fetchable; the fact audit counts an entry's texts
 * as part of the run's evidence. Live mode accepts any service; Simulation offers the entries that have
 * a pre-run (from version 0.2.0). From version 2.1.0 each entry also has a function group (identity and
 * sign-in, payments, data exchange and mailboxes, platforms, cloud and code, portals and apps; this
 * prototype stands apart as "self"), which the Recommend step uses for comparable services and the
 * overview for its sections.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var READ = "2026-11-19";
  var BMDS = {
    url: "https://bmds.bund.de/fileadmin/BMDS/Dokumente/260129_Deutschland-Stack_Standard_barrierefrei.pdf",
    title: "Deutschland-Stack, Sachstand", lang: "de", read_on: READ
  };
  var NRW_READ = "2026-11-27";
  function url(u, title, lang, note, read) {
    var out = { url: u, title: title, lang: lang, read_on: read || READ };
    if (note) out.note = note;
    return out;
  }

  window.SA_CATALOGUE = {
    as_of: READ,
    entries: [
      {
        id: "bundid", category: "base_service", group: "identity",
        names: { en: "BundID", de: "BundID" },
        aliases: ["Nutzerkonto Bund", "Nutzerkonto des Bundes", "Bund ID", "BundID-Konto", "id.bund.de"],
        description: {
          en: "The federal user account with which people identify themselves for online administrative services.",
          de: "Das Nutzerkonto des Bundes, mit dem sich Menschen für Online-Verwaltungsleistungen identifizieren."
        },
        status: {
          en: "In operation; the site is offered by the BMDS, and its imprint names the AKDB for the implementation and the ITZBund for operations.",
          de: "In Betrieb; die Website ist ein Angebot des BMDS, ihr Impressum nennt die AKDB für die Umsetzung und das ITZBund für den Betrieb."
        },
        urls: [url("https://id.bund.de/en/", "BundID", "en"), BMDS]
      },
      {
        id: "online-ausweis", category: "base_service", group: "identity",
        names: { en: "Online ID (eID)", de: "Online-Ausweis (eID)" },
        aliases: ["Online-Ausweis", "Onlineausweis", "eID", "Online-Ausweisfunktion", "eID-Funktion", "Personalausweis", "AusweisApp"],
        description: {
          en: "The online ID function of the German identity card, used with the AusweisApp.",
          de: "Die Online-Ausweisfunktion des deutschen Personalausweises, genutzt mit der AusweisApp."
        },
        status: {
          en: "In operation; the AusweisApp is developed by Governikus on behalf of the BSI, and services read the ID through an eID server.",
          de: "In Betrieb; die AusweisApp entwickelt Governikus im Auftrag des BSI, und Dienste lesen den Ausweis über einen eID-Server aus."
        },
        urls: [
          url("https://www.ausweisapp.bund.de/en/about-us", "AusweisApp: About us", "en"),
          url("https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-service/eid-service-node.html", "eID Service", "en")
        ]
      },
      {
        id: "eudi-wallet", category: "base_service", group: "identity",
        names: { en: "EUDI Wallet “d-you”", de: "EUDI-Wallet „d-you“" },
        aliases: ["d-you", "EUDI-Wallet", "EUDI Wallet", "digitale Brieftasche", "digital wallet"],
        description: {
          en: "Germany's state EUDI wallet app, to store ID documents and credentials on a smartphone.",
          de: "Die staatliche deutsche EUDI-Wallet-App, um Ausweis und Nachweise auf dem Smartphone zu speichern."
        },
        status: {
          en: "Official start planned for 2 January 2027; SPRIND leads the development on behalf of the BMDS.",
          de: "Offizieller Start für den 2. Januar 2027 geplant; die SPRIND leitet die Entwicklung im Auftrag des BMDS."
        },
        urls: [
          url("https://eudi-wallet.gov.de/en", "EUDI Wallet: Simple in everyday life. Secure for your data. | EUDI-Wallet", "en"),
          url("https://borncity.com/news/d-you-startet-am-2-januar-2027-deutschlands-digitale-identitaet/", "d-you startet am 2. Januar 2027: Deutschlands digitale Identität", "de",
            { en: "Press, 13 September 2026", de: "Presse, 13. September 2026" })
        ]
      },
      {
        id: "muk", category: "base_service", group: "identity",
        names: { en: "Mein Unternehmenskonto (MUK)", de: "Mein Unternehmenskonto (MUK)" },
        aliases: ["MUK", "Mein Unternehmenskonto", "Unternehmenskonto", "Organisationskonto", "ELSTER-Unternehmenskonto"],
        description: {
          en: "The government-provided user account for organisations, with an inbox for messages and official notices.",
          de: "Das staatlich bereitgestellte Nutzerkonto für Organisationen, mit einem Postfach für Mitteilungen und Bescheide."
        },
        status: {
          en: "In operation; based on ELSTER technology and developed jointly by Bavaria and Bremen.",
          de: "In Betrieb; auf Basis der ELSTER-Technologie, gemeinschaftlich von Bayern und Bremen entwickelt."
        },
        urls: [
          url("https://info.mein-unternehmenskonto.de/", "Das Unternehmenskonto auf Basis von ELSTER - Unternehmenskonto", "de"),
          url("https://ozg.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MF/OZG/Bilder/Veranstaltungen/OZG-Sprechstunden/Leitfaden_Organisationskonto_V1.0_49.Sprechstunde.pdf",
            "Leitfaden zur Beschaffung und Verwaltung von ELSTER-Organisationszertifikaten", "de")
        ]
      },
      {
        id: "fit-connect", category: "base_service", group: "data_exchange",
        names: { en: "FIT-Connect", de: "FIT-Connect" },
        aliases: ["FIT Connect", "Zustelldienst", "FITKO FIT-Connect"],
        description: {
          en: "A base infrastructure for the exchange of data between systems of the Federation, the Länder and the municipalities.",
          de: "Eine Basisinfrastruktur für den Datenaustausch zwischen Systemen von Bund, Ländern und Kommunen."
        },
        status: {
          en: "In operation; developed and run by the FITKO on behalf of the IT-Planungsrat.",
          de: "In Betrieb; im Auftrag des IT-Planungsrats von der FITKO entwickelt und betrieben."
        },
        urls: [
          url("https://docs.fitko.de/fit-connect/docs/intro/", "Einführung in FIT-Connect | FIT-Connect", "de"),
          url("https://docs.fitko.de/fit-connect/docs/faq/", "FAQ | FIT-Connect", "de")
        ]
      },
      {
        id: "noots", category: "base_service", group: "data_exchange",
        names: { en: "NOOTS (National Once-Only Technical System)", de: "NOOTS (Nationales Once-Only-Technical-System)" },
        aliases: ["NOOTS", "National Once-Only Technical System", "Nationales Once-Only-Technical-System", "Registermodernisierung", "Once-Only"],
        description: {
          en: "The IT infrastructure of the register modernisation, for the automatic retrieval of register data in applications.",
          de: "Die IT-Infrastruktur der Registermodernisierung, für den automatischen Abruf von Registerdaten in Anträgen."
        },
        status: {
          en: "Being built; the NOOTS state treaty is ratified nationwide, and the IT-Planungsrat decides on the start of operations.",
          de: "Im Aufbau; der NOOTS-Staatsvertrag ist bundesweit ratifiziert, und der IT-Planungsrat beschließt die Inbetriebnahme."
        },
        urls: [url("https://noots.gov.de/", "NOOTS – das Nationale Once-Only-Technical-System - Wissensplattform", "de"), BMDS]
      },
      {
        id: "zapuk", category: "base_service", group: "data_exchange",
        names: { en: "ZaPuK (target architecture for mailbox and communication solutions)", de: "ZaPuK (Zielarchitektur für Postfach- und Kommunikationslösungen)" },
        aliases: ["ZaPuK", "Zielarchitektur für Postfach- und Kommunikationslösungen", "Zielarchitektur Postfach"],
        description: {
          en: "The federal target architecture for mailbox and communication solutions between people, organisations and public bodies.",
          de: "Die föderale Zielarchitektur für Postfach- und Kommunikationslösungen zwischen Privatpersonen, Organisationen und öffentlichen Stellen."
        },
        status: {
          en: "A target architecture, not yet a service; transition and migration are planned from 2028.",
          de: "Eine Zielarchitektur, noch kein Dienst; Transition und Migration sind ab 2028 geplant."
        },
        urls: [
          url("https://www.fitko.de/fileadmin/fitko/veranstaltungen/die_fitko_stellt_vor/20260116-Handout_FITKO_stellt_vor_ZaPuK.pdf",
            "Die FITKO stellt vor: Zielarchitektur für Postfach- und Kommunikationslösungen (ZaPuK), Handout 16.01.2026", "de"),
          url("https://www.it-planungsrat.de/fileadmin/beschluesse/2025/Beschluss_2025_28_ZaPuK_%C3%9Cberblick.pdf",
            "Föderale Zielarchitektur für Postfach- und Kommunikationslösungen: Überblick und Handlungsempfehlung, Version 1.0", "de")
        ]
      },
      {
        id: "zbds", category: "base_service", group: "payments",
        names: { en: "ZBDS (central payment component)", de: "ZBDS (Zentrale Bezahlkomponente)" },
        aliases: ["ZBDS", "Zentrale Bezahlkomponente"],
        description: {
          en: "The central payment component of the Deutschland-Stack for fees and refunds, integrated with common payment systems (ePayBL).",
          de: "Die Zentrale Bezahlkomponente des Deutschland-Stacks für Gebühren und Rückerstattungen, integriert mit gängigen Zahlungssystemen (ePayBL)."
        },
        status: {
          en: "Named in the BMDS's Deutschland-Stack documents; no description of its own was found.",
          de: "In den Deutschland-Stack-Unterlagen des BMDS genannt; eine eigene Beschreibung wurde nicht gefunden."
        },
        urls: [BMDS, url("https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf",
          "Deutschland-Stack – Wohin geht die Reise?", "de")]
      },
      {
        id: "epaybl", category: "base_service", group: "payments",
        names: { en: "ePayBL", de: "ePayBL" },
        aliases: ["ePayment Bund-Länder", "ePay BL", "ePayBL 4", "Basiskomponente Zahlungsverkehr"],
        description: {
          en: "Software of the Federation and the Länder for paying administrative fees online.",
          de: "Software von Bund und Ländern, um Verwaltungsgebühren online zu bezahlen."
        },
        status: {
          en: "In use; developed by a community of the Federation and twelve Länder, whose office sits at the Staatsbetrieb Sächsische Informatik Dienste.",
          de: "Im Einsatz; entwickelt von einer Gemeinschaft aus Bund und zwölf Ländern, deren Geschäftsstelle beim Staatsbetrieb Sächsische Informatik Dienste sitzt."
        },
        urls: [url("https://www.epaybl.de/", "Online bezahlen in der öffentlichen Verwaltung - ePayBL", "de"), BMDS]
      },
      {
        id: "kipitz", category: "platform_or_access", group: "platforms",
        names: { en: "KIPITZ (federal AI platform)", de: "KIPITZ (KI-Plattform des Bundes)" },
        aliases: ["KIPITZ", "KI-Plattform des Bundes", "KI-Portal des ITZBund"],
        description: {
          en: "The central AI platform of the federal administration.",
          de: "Die zentrale KI-Plattform der Bundesverwaltung."
        },
        status: {
          en: "In operation in the data centres of the ITZBund, according to the Federal Government (August 2026).",
          de: "In Betrieb in den Rechenzentren des ITZBund, laut Bundesregierung (August 2026)."
        },
        urls: [url("https://www.bundestag.de/presse/hib/kurzmeldungen-1202030", "Bundesverwaltung nutzt KI als unterstützendes Werkzeug", "de"), BMDS]
      },
      {
        id: "low-code", category: "platform_or_access", group: "platforms",
        names: { en: "Low-code and workflow automation", de: "Low-Code und Workflowautomatisierung" },
        aliases: ["Low-Code", "LowCode", "Workflowautomatisierung", "Workflow-Automatisierung", "Low-Code-Plattform", "workflow automation"],
        description: {
          en: "Workflow automation (low code) in the Plattform layer, for the simple modelling of procedures and work processes.",
          de: "Workflowautomatisierung (Low-Code) in der Plattform-Schicht, für die einfache Modellierung von Verfahrens- und Arbeitsabläufen."
        },
        status: {
          en: "A building block of the Deutschland-Stack in the IT-Planungsrat's standards; its own standards are still to be set.",
          de: "Ein Baustein des Deutschland-Stacks in den Standards des IT-Planungsrats; eigene Standards sind noch festzulegen."
        },
        urls: [url("https://www.it-planungsrat.de/fileadmin/beschluesse/2026/Beschluss_2026_03_Deutschland-Stack_Standards.pdf",
          "Deutschland-Stack: Anlage Standards zum Beschlussvorschlag 49. IT-Planungsrat", "de"), BMDS]
      },
      {
        id: "marktplatz-deutschland-digital", category: "platform_or_access", group: "platforms",
        names: { en: "Marktplatz Deutschland Digital (MDD)", de: "Marktplatz Deutschland Digital (MDD)" },
        aliases: ["MDD", "Marktplatz Deutschland Digital", "Marktplatz der Zukunft"],
        description: {
          en: "The procurement platform that brings together the federal marketplaces of the Federation, the Länder and the municipalities.",
          de: "Die Beschaffungsplattform, die die föderalen Marktplätze von Bund, Ländern und Kommunen zusammenführt."
        },
        status: {
          en: "In production since 19 March 2026; built on the Cloud Service Portal.",
          de: "Seit dem 19. März 2026 im Produktivbetrieb; aufgebaut auf dem Cloud Service Portal."
        },
        urls: [
          url("https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Crew_Gesucht_Community-Funtktionen_Marktplatz_Deutschland_Fell.pdf",
            "Crew gesucht: Community-Funktionen für den Marktplatz Deutschland Digital", "de"),
          url("https://vergabeblog.de/2026-03-24/marktplatz-deutschland-digital-mdd-startet-produktivbetrieb/", "Marktplatz Deutschland Digital (MDD) startet Produktivbetrieb", "de",
            { en: "Press, 24 March 2026, citing govdigital eG", de: "Presse, 24. März 2026, mit Quelle govdigital eG" }),
          BMDS
        ]
      },
      {
        id: "opencode", category: "platform_or_access", group: "platforms",
        names: { en: "openCode", de: "openCode" },
        aliases: ["openCode", "Open CoDE", "OpenCoDE", "opencode.de"],
        description: {
          en: "The joint platform of the public administration for the exchange of open-source software.",
          de: "Die gemeinsame Plattform der öffentlichen Verwaltung für den Austausch von Open-Source-Software."
        },
        status: {
          en: "In operation; the ZenDiS has been responsible for it since early 2024.",
          de: "In Betrieb; seit Anfang 2024 verantwortet vom ZenDiS."
        },
        urls: [url("https://opencode.de/en/about-opencode", "About openCode | openCode.de", "en"), BMDS]
      },
      {
        id: "dvc", category: "platform_or_access", group: "platforms",
        names: { en: "DVC (German Administration Cloud)", de: "DVC (Deutsche Verwaltungscloud)" },
        aliases: ["DVC", "Deutsche Verwaltungscloud", "German Administration Cloud", "government cloud", "Verwaltungscloud"],
        description: {
          en: "The government cloud: a multi-cloud of the federal and state governments.",
          de: "Die Verwaltungscloud: eine Multi-Cloud von Bund und Ländern."
        },
        status: {
          en: "Launched on 27 March 2025, with the participating public IT service providers, govdigital and the FITKO.",
          de: "Am 27. März 2025 gestartet, mit den beteiligten öffentlichen IT-Dienstleistern, govdigital und der FITKO."
        },
        urls: [
          url("https://bmi.bund.de/SharedDocs/pressemitteilungen/EN/2025/03/dvc.html", "Germany launches government cloud", "en"),
          url("https://www.deutsche-verwaltungscloud.de", "Deutsche Verwaltungscloud – Startseite", "de"),
          url(BMDS.url, BMDS.title, "de", {
            en: "The BMDS document writes \"DVC\" without spelling it out; the BMI's press release names the Deutsche Verwaltungscloud \"DVC\".",
            de: "Das BMDS-Dokument schreibt „DVC“, ohne es auszuschreiben; die Pressemitteilung des BMI nennt die Deutsche Verwaltungscloud „DVC“."
          })
        ]
      },
      {
        id: "bundesportal", category: "platform_or_access", group: "portals",
        names: { en: "Federal Portal (Bundesportal)", de: "Bundesportal" },
        aliases: ["Bundesportal", "Verwaltungsportal des Bundes", "verwaltung.bund.de", "DeutschlandPortal", "Deutschland-Portal", "Federal Portal"],
        description: {
          en: "The administration portal of the Federation, which is to become the DeutschlandPortal.",
          de: "Das Verwaltungsportal des Bundes, künftig „DeutschlandPortal“."
        },
        status: {
          en: "In operation at verwaltung.bund.de; legal basis § 9a EGovG.",
          de: "In Betrieb unter verwaltung.bund.de; Rechtsgrundlage § 9a EGovG."
        },
        urls: [
          url("https://verwaltung.bund.de/portal/EN/ueber", "Bundesportal | What is the Federal Portal?", "en"),
          url("https://www.gesetze-im-internet.de/egovg/__9a.html", "§ 9a EGovG - Einzelnorm", "de"),
          BMDS
        ]
      },
      {
        id: "deutschland-app", category: "platform_or_access", group: "portals",
        names: { en: "Deutschland-App", de: "Deutschland-App" },
        aliases: ["D-APP", "Deutschland App", "Bürger-App", "Germany app"],
        description: {
          en: "The planned citizen app for administrative services; a prototype is being tested in six municipalities.",
          de: "Die geplante Bürger-App für Verwaltungsleistungen; ein Prototyp wird in sechs Kommunen erprobt."
        },
        status: {
          en: "Prototype in a pilot, not in the app stores; T-Systems International GmbH is the general contractor for the prototype.",
          de: "Prototyp im Pilotbetrieb, nicht in den App-Stores; Generalunternehmerin für den Prototyp ist die T-Systems International GmbH."
        },
        urls: [
          url("https://www.bundestag.de/1223070", "Deutschland-App: Prototyp wird in sechs Kommunen erprobt", "de"),
          url("https://www.wiesbaden.de/en/pressemitteilungen/pressereferat/juni/wiesbaden-wird-pilotkommune-fuer-die-deutschland-app", "Wiesbaden becomes pilot municipality for Germany app", "en")
        ]
      },
      {
        // From version 2.1.0: a state's platform, read on 27 November 2026 (brief SA-05). scope "state" makes
        // the Understand step say once that the six layers are the Deutschland-Stack's and the method applies
        // to a state's platform as to a federal one.
        id: "serviceportal-nrw", category: "platform_or_access", group: "portals", scope: "state",
        names: { en: "Serviceportal.NRW", de: "Serviceportal.NRW" },
        aliases: ["Serviceportal NRW", "NRW Serviceportal", "Serviceportal Nordrhein-Westfalen", "meineverwaltung.nrw", "Service portal NRW"],
        description: {
          en: "The administrative portal of North Rhine-Westphalia, through which the state's authorities provide electronic administrative services.",
          de: "Das Verwaltungsportal des Landes Nordrhein-Westfalen, über das die Behörden des Landes elektronische Verwaltungsleistungen bereitstellen."
        },
        status: {
          en: "In operation at meineverwaltung.nrw; in March 2026 the state announced that a landing page of the new Nordrhein-Westfalen-Portal is to replace it.",
          de: "In Betrieb unter meineverwaltung.nrw; im März 2026 kündigte das Land an, dass eine Landing-Page des neuen Nordrhein-Westfalen-Portals es ersetzen soll."
        },
        urls: [
          url("https://recht.nrw.de/gvnrw/2020-s1212", "GV. NRW. 2020 S. 1212", "de", null, NRW_READ),
          url("https://recht.nrw.de/gvnrw/2025-s1138", "GV. NRW. 2025 S. 1138", "de", null, NRW_READ),
          url("https://www.land.nrw/pressemitteilung/das-neue-nordrhein-westfalen-portal-wird-zentrale-anlaufstelle-fuer-digitale", "Das neue Nordrhein-Westfalen-Portal wird zentrale Anlaufstelle für digitale Verwaltungsleistungen", "de", null, NRW_READ),
          url("https://new.drupal.org/case-study/serviceportal-20", "Serviceportal 2.0 | Drupal.org", "en", null, NRW_READ),
          url("https://meineverwaltung.nrw/en/content/622acfaf-7cad-400f-8703-ae23effba10f", "NRW Serviceportal - Impressum", "de", null, NRW_READ)
        ]
      },
      {
        // This prototype, assessed with its own method. The Portfolio leaves the category out.
        id: "sovereignty-assessment", category: "self_assessment", group: "self",
        names: { en: "Sovereignty Assessment (this prototype)", de: "Souveränitätsbewertung (dieser Prototyp)" },
        aliases: ["Sovereignty Assessment", "Souveränitätsbewertung", "this prototype", "dieser Prototyp", "self-assessment", "Selbstbewertung", "sovereigntyassessment"],
        description: {
          en: "This prototype: a static site on GitHub Pages whose Live mode runs on Anthropic's Claude API with web search and web fetch on Anthropic's servers.",
          de: "Dieser Prototyp: eine statische Website auf GitHub Pages, deren Live-Modus auf der Claude-API von Anthropic läuft, mit Websuche und Web-Abruf auf den Servern von Anthropic."
        },
        status: {
          en: "A prototype built by Victor Pflüger and published on GitHub Pages; not an official service.",
          de: "Ein Prototyp, gebaut von Victor Pflüger und auf GitHub Pages veröffentlicht; kein offizieller Dienst."
        },
        urls: [
          { url: "https://github.com/VictorPflueger/sovereigntyassessment", title: "GitHub - VictorPflueger/sovereigntyassessment", lang: "en", read_on: "2026-11-20" },
          { url: "https://docs.github.com/en/articles/about-github-pages", title: "About GitHub Pages", lang: "en", read_on: "2026-11-20" }
        ]
      }
    ]
  };
})();
