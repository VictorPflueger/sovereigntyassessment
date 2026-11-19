/* Reference facts (brief §7, ref_facts): structural facts that many assessments meet, each with its URL,
 * the page title, a verbatim quote of at most 150 characters, its language, the date read and the fields
 * of a building block it supports. Every quote was read on its page with the web fetch tool on
 * 19 November 2026 (DATA_SOURCES.md). The live agent's ref_facts tool returns them by topic; their URLs
 * count as sources a run may cite, and their quotes count as verified. This is the first set; more
 * topics (mobile operating systems, browsers) follow with the pre-runs.
 * A script, not JSON, because the page's security policy allows no fetch from its own origin.
 */
(function () {
  "use strict";
  var READ = "2026-11-19";
  var APNS = { url: "https://developer.apple.com/documentation/usernotifications/setting-up-a-remote-notification-server.md", title: "Setting up a remote notification server" };
  var ALT = { url: "https://support.apple.com/en-mide/118110", title: "About alternative app distribution - Apple Support" };

  window.SA_REF_FACTS = {
    as_of: READ,
    topics: ["app_distribution", "push_messaging", "mobile_os", "browsers", "federal_it"],
    facts: [
      {
        id: "RF-01", topic: "push_messaging",
        statement: {
          en: "Remote notifications to apps on Apple devices pass through Apple Push Notification service (APNs), which Apple manages between the sender's server and the device.",
          de: "Push-Mitteilungen an Apps auf Apple-Geräten laufen über den Apple Push Notification service (APNs), den Apple zwischen dem Server des Absenders und dem Gerät betreibt."
        },
        evidence: { url: APNS.url, title: APNS.title, quote: "Apple manages everything in between, including the presentation of notifications to the user.", lang: "en", read_on: READ, supports: ["operator"] }
      },
      {
        id: "RF-02", topic: "push_messaging",
        statement: {
          en: "A service sends its notification request to APNs, which delivers the notification to the user's device.",
          de: "Ein Dienst schickt seine Mitteilung an APNs, und APNs stellt sie auf dem Gerät der Nutzerin oder des Nutzers zu."
        },
        evidence: { url: APNS.url, title: APNS.title, quote: "You then forward your request to APNs, which handles the delivery of the notification to the user’s device.", lang: "en", read_on: READ, supports: ["operator"] }
      },
      {
        id: "RF-03", topic: "app_distribution",
        statement: {
          en: "In the European Union, iPhone and iPad users can install alternative app marketplaces, so apps can reach them outside Apple's App Store too.",
          de: "In der Europäischen Union können iPhone- und iPad-Nutzende alternative App-Marktplätze installieren, sodass Apps sie auch außerhalb von Apples App Store erreichen."
        },
        evidence: { url: ALT.url, title: ALT.title, quote: "Users in Brazil, Japan, or the European Union can install an alternative app marketplace by downloading it directly", lang: "en", read_on: READ, supports: ["exit"] }
      },
      {
        id: "RF-04", topic: "app_distribution",
        statement: {
          en: "Apple neither makes nor manages the alternative app marketplaces.",
          de: "Apple stellt die alternativen App-Marktplätze weder her, noch betreibt es sie."
        },
        evidence: { url: ALT.url, title: ALT.title, quote: "Alternative app marketplaces aren't made or managed by Apple", lang: "en", read_on: READ, supports: ["exit"] }
      },
      {
        id: "RF-05", topic: "federal_it",
        statement: {
          en: "The consolidated IT of the Federation runs in the data centres of the ITZBund, the Federation's central IT service provider.",
          de: "Die konsolidierte IT des Bundes läuft in den Rechenzentren des ITZBund, des zentralen IT-Dienstleisters des Bundes."
        },
        evidence: { url: "https://bmds.bund.de/fileadmin/BMDS/Dokumente/AM_Gesamtarchitektur.pdf", title: "Gesamtarchitektur für die Dienstekonsolidierung der IT des Bundes", quote: "Der konsolidierte IT-Betrieb erfolgt in den Rechenzentren des zentralen IT-Dienstleister des Bundes (ITZBund)", lang: "de", read_on: READ, supports: ["operator"] }
      },
      {
        id: "RF-06", topic: "federal_it",
        statement: {
          en: "KIPITZ, the central AI platform of the federal administration, runs in the data centres of the ITZBund, according to the Federal Government.",
          de: "KIPITZ, die zentrale KI-Plattform der Bundesverwaltung, läuft laut Bundesregierung in den Rechenzentren des ITZBund."
        },
        evidence: { url: "https://www.bundestag.de/presse/hib/kurzmeldungen-1202030", title: "Bundesverwaltung nutzt KI als unterstützendes Werkzeug", quote: "die zentrale KI-Plattform der Bundesverwaltung KIPITZ, die in den Rechenzentren des ITZ Bund betrieben werde", lang: "de", read_on: READ, supports: ["operator"] }
      }
    ]
  };
})();
