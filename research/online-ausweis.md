# Online ID (eID): research notes

Online-Ausweis (the online ID), researched on 19 November 2026: the AusweisApp's own pages, the Personalausweisportal's pages on eID servers and services, the Bundesverwaltungsamt's page on authorisation certificates, D-Trust's product sheet, the BSI's fact sheet on the identity card (published by Stadt Düren), a parliamentary paper, a netzpolitik.org article, the App Store listing and Apple's legal pages, and the bundled reference facts on app distribution (verified at build time).

Every quote below was read on its page with the web fetch tool on the date given, and the pre-run data/runs/online-ausweis.js cites it, except the quotes that follow a paragraph beginning "Not cited", which says why. tools/check-runs.mjs sets each quote's verified flag from this file: a quote counts only when it is listed here, verbatim, under its URL.

### [AusweisApp: About us](https://www.ausweisapp.bund.de/en/about-us)
Read on 2026-11-20 (English); first read on 2026-11-19, when the quote was cut at 125 characters by the fetch tool, and read again in full for the review of version 1.0.0.

> Since 2014, Bremen-based Governikus GmbH & Co. KG is developing the application on behalf of the German Federal Office for Information Security (BSI).

### [eID Server](https://personalausweisportal.de/Webs/PA/EN/business/technology/eID-server/eid-server-node.html)
Read on 2026-11-19 (English).

> The eID server consists of hardware and software components run by the service provider
> is to use an eID server certified by the Federal Office for Information Security (BSI)

### [BT-Drucksache 20/13075: Evolutionslösung für den elektronischen Personalausweis – eID](https://dserver.bundestag.de/btd/20/130/2013075.pdf)
Read on 2026-11-19 (German).

> Dieses Projekt wurde jedoch Ende 2023 von der Bundesregierung vorerst gestoppt

### [AusweisApp: Open Source Software](https://www.ausweisapp.bund.de/en/open-source)
Read on 2026-11-19 (English).

> Under the EUPL licence, users can get the original source code, duplicate it, develop it further
> The source code of AusweisApp is therefore available on the online platform GitHub.

### [Online-Ausweis: Der ePerso ist tot, lange lebe der ePerso (netzpolitik.org)](https://netzpolitik.org/2026/online-ausweis-der-eperso-ist-tot-lange-lebe-der-eperso/)
Read on 2026-11-19 (German).

> dass keine der Server-Implementierungen unter einer Open-Source-Lizenz verfügbar ist.
> Jedoch verlangt das Bundesverwaltungsamt für die Berechtigungszertifikate hohe Gebühren.

### [D-Trust-BerCA für Diensteanbieter und eID-Service-Provider (Produktblatt)](https://www.d-trust.net/files/dokumente/pdf/produktblatt_berechtigungszertifikate.pdf)
Read on 2026-11-19 (German).

> Sie besteht aus einer Public-Key-Infrastruktur (PKI) für Berechtigungszertifikate und einem Sperrmanagement.
> D-Trust GmbH | Kommandantenstraße 15 | 10969 Berlin

### [BVA - Vergabestelle für Berechtigungszertifikate](https://www.bva.bund.de/DE/Services/Behoerden/Produkt/PA-VfB/pa-vfb_node.html)
Read on 2026-11-19 (German).

Not cited since the review (R-01): it does not state what it was cited for; the authorisation certificates rest on the article that names the Bundesverwaltungsamt.

> Unternehmen und Behörden erhalten nur dann Zugang zu den elektronischen Ausweisdaten von Bürgerinnen und Bürgern


### [Der neue Personalausweis – die Fakten auf einen Blick (BSI, via Stadt Düren)](https://onlinedienste.dueren.de/suche/-/vr-bis-detail/dokument/12224/download)
Read on 2026-11-19 (German).

> von der Bundesdruckerei in Berlin hergestellt

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
