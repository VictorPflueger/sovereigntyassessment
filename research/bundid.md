# BundID: research notes

BundID, researched on 19 November 2026: the BundID site and its imprint, the Bundesagentur für Arbeit's guide to signing in, a service partner's reference on the ITZBund's container platform, the AusweisApp's own pages, the App Store listing and Apple's legal pages, and the bundled reference facts on federal IT and app distribution (verified at build time, not repeated here). For the independent review of version 1.0.0, on 20 November 2026: who stewards Kubernetes, the platform's technology (its main repository, the CNCF and the Linux Foundation), and the AusweisApp's sentence read again in full.

Every quote below was read on its page with the web fetch tool on the date given, and the pre-run data/runs/bundid.js cites it, except the quotes that follow a paragraph beginning "Not cited", which says why. tools/check-runs.mjs sets each quote's verified flag from this file: a quote counts only when it is listed here, verbatim, under its URL.

### [BundID](https://id.bund.de/en/)
Read on 2026-11-20 (German); first read on 2026-11-19, when the two names were quoted without the labels before them in the imprint, and read again for the review of version 1.0.0. Each label is a heading and its name the line after it.

> Diese Webseite ist ein Angebot des Bundesministerium für Digitales und Staatsmodernisierung
> Laufender Betrieb: Informationstechnikzentrum Bund (ITZBund)
> Realisierung: Anstalt für Kommunale Datenverarbeitung in Bayern (AKDB)

Not cited since the review (R-01): a browser warning does not say who runs the BundID.

> Ihr aktuell verwendeter Webbrowser unterstützt nicht alle Funktionen der BundID.

### [Die BundID: sicherer Zugang zu allen eServices | Bundesagentur für Arbeit](https://www.arbeitsagentur.de/bundid)
Read on 2026-11-19 (German).

> Anmeldung mit Benutzung der Zugangsart „ELSTER-Zertifikat“ und einzelnen „EU-Identitäten“.
> Einen Computer mit der AusweisApp und ein Smartphone mit der AusweisApp oder ein Personalausweis-Lesegerät.

### [ITZBund stärkt Digitalisierung und Zukunftsfähigkeit (SVA, Referenz)](https://www.sva.de/sites/default/files/2021-11/SVA%20Referenz%20ITZBund.pdf)
Read on 2026-11-19 (German).

> Das ITZBund stellt im Auftrag des BMI gemeinsam mit SVA und ARWINET eine KubernetesPlattform zur Verfügung
> auf welcher das Nutzerkonto Bund betrieben werden

### [AusweisApp: About us](https://www.ausweisapp.bund.de/en/about-us)
Read on 2026-11-20 (English); first read on 2026-11-19, when the quote was cut at 125 characters by the fetch tool, and read again in full for the review of version 1.0.0.

> Since 2014, Bremen-based Governikus GmbH & Co. KG is developing the application on behalf of the German Federal Office for Information Security (BSI).

### [AusweisApp: Open Source Software](https://www.ausweisapp.bund.de/en/open-source)
Read on 2026-11-19 (English).

> Under the EUPL licence, users can get the original source code, duplicate it, develop it further
> The source code of AusweisApp is therefore available on the online platform GitHub.

### [Copyright and trademarks - Apple Support](https://support.apple.com/guide/apple-invites/copyright-and-trademarks-dev2727afbbc/ios)
Read on 2026-11-19 (English).

> App Store, iCloud, and iCloud+ are service marks of Apple Inc., registered in the U.S. and other countries and regions.

### [AusweisApp Bund App - App Store](https://apps.apple.com/us/app/id948660805)
Read on 2026-11-19 (English).

Not cited since the review (R-01): it does not say who runs the store.

> on the App Store


### [Legal - Privacy Policy Affiliated Company - Apple](https://www.apple.com/legal/privacy/en/affiliated-company/)
Read on 2026-11-20 (English); first read on 2026-11-19 for the two addresses, and read again for the review of version 1.0.0 for what the page says the Irish entity does. Under "Apple Media Services and iCloud", the address of Apple Distribution International follows the first sentence below and ends ", for all other users, excluding iCloud users in China mainland."

> Depending on your location, the Apple entity providing the services is:
> Apple Distribution International Ltd., located at Hollyhill Industrial Estate, Hollyhill, Cork, Republic of Ireland
> Apple Inc., located at One Apple Park Way, Cupertino, California, United States
> Apple Media Services include, where available, the App Store

### [GitHub - kubernetes/kubernetes: Production-Grade Container Scheduling and Management](https://github.com/kubernetes/kubernetes)
Read on 2026-11-20 (English).

> Kubernetes is hosted by the Cloud Native Computing Foundation (CNCF).
> Kubernetes, also known as K8s, is an open source system for managing containerized applications across multiple hosts.

### [Who we are](https://cncf.io/about/who-we-are/)
Read on 2026-11-20 (English).

> CNCF is part of the nonprofit Linux Foundation.

### [Privacy Policy | Linux Foundation](https://linuxfoundation.org/legal/privacy-policy)
Read on 2026-11-20 (English).

> The Linux Foundation, Attn: Legal Department, 548 Market St, PMB 57274, San Francisco, California 94104-5401, USA.

### [Deutschland-Stack – Wohin geht die Reise?](https://www.it-planungsrat.de/fileadmin/it-planungsrat/der-it-planungsrat/fachkongress/fachkongress_2026/pr%C3%A4sentationen/Tag2_Deutschland-Stack_Hartenstein.pdf)
Read on 2026-11-27 (German), for the starting points of version 2.1.0. Slides of the BMDS at the IT-Planungsrat's congress of 2026; the catalogue lists them for the ZBDS.

> Digitale Authentifizierung der Antragsteller:innen via EUDI-Wallet bzw. BundID

### [Open eCard: Platform independent and highly extensible Open eCard App released](https://www.openecard.org/en/news/details/platform-independent-and-highly-extensible-open-ecard-app-released/)
Read on 2026-11-27 (English), for the starting points of version 2.1.0. A news item of the Open eCard project of 6 November 2014; its contact address is ecsec GmbH in Michelau, Germany.

> A first result of the project is the Open eCard App, which provides an Open Source alternative to proprietary eID clients.

### [Move over, Apple: Meet the alternative app stores available in the EU and elsewhere](https://techcrunch.com/2026/02/22/move-over-apple-meet-the-alternative-app-stores-available-in-the-eu-and-elsewhere/)
Read on 2026-11-27 (English), for the starting points of version 2.1.0. TechCrunch, 22 February 2026. It lists seven alternative app stores for iPhones in the EU. Starting points take those open to apps of any kind from other developers: AltStore PAL, Onside and Skich. Left out by that rule: Setapp Mobile (closed on 16 February 2026), the Epic Games Store (games only), Aptoide's iPhone store (a game store) and the Mobivention marketplace (companies' internal apps).

> AltStore PAL is an officially approved alternative app marketplace in the EU.
> Onside is an alternative iOS app store available in both the EU and, now, Japan, as of February 17, 2026
> Last March, Skich announced the launch of an alternative app store for EU users

## Searches without a named alternative

Version 2.1.0 shows starting points for research for every weak block. Where none is shown, the searches below, made with the web search tool on 2026-11-27, found no public source that names an alternative which would raise the block's level.

- B-02, Kubernetes platform at the ITZBund: “Alternative zu Kubernetes Container-Orchestrierung europäisch Verwaltung souverän”; “European alternative to Kubernetes container orchestration made in EU open source”. The results name container platforms from outside the EU as alternatives to Kubernetes (Docker Swarm, Nomad, Apache Mesos, Amazon ECS), which would not raise the block's level, and list managed Kubernetes services of European providers, which run Kubernetes itself. No result names a container platform made in the EU that would take Kubernetes's place.
