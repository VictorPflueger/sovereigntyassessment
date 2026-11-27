# Version 2.1.0: cold read and reviews

This file records how version 2.1.0 was checked before its release on 27 November 2026: a cold read from screenshots alone, the partner review that Vici's prototype brief asks for, a design review, a usability audit and a critique of every screen 2.1.0 changed. It names no person. The cold readers and the critics were agents that had seen neither the code, the documents nor the brief. Version 1.0.0's review of the shared shell is in the git history (`1dc145e`).

## Cold read

### Method

Each reader got screenshots only, at 1280 × 720 with the guide closed: every step of BundID and FIT-Connect in one language, Recommend before and after the person's decision, or the three screens of All services in both languages. The readers answered in the language of their screenshots and were told to say when the screens did not show something. Three rounds of three readers each ran (English, German, the overview), the screens changing between them; a fourth reader then checked the screens that changed after round 3, and a fifth those that changed after the fourth. The table holds round 3's answers.

The expected answers and the words each answer must name were written before round 3's answers came in, from the engine's figures, and `tests/docs.mjs` checks every row against the engine. Two edits came after: where a reader answered FIT-Connect's question 1 with "the same tool" ("derselbe Ablauf"), the table repeats in square brackets what that reader wrote for BundID; and question 8 must name the quote ("quote", "Zitat") instead of the source, because one reader named the quotes and not the sources, which says the same. The readers' own confidence is in the note under the table.

### Questions

| # | English | Deutsch |
|---|---|---|
| 1 | What does the prototype do? | Was tut der Prototyp? |
| 2 | In one sentence, how sovereign is this service? | In einem Satz: Wie souverän ist dieser Dienst? |
| 3 | Which part is weakest, and can the service run without it? | Welcher Teil ist am schwächsten, und läuft der Dienst ohne ihn? |
| 4 | Why does that part get its level? | Warum bekommt dieser Teil seine Stufe? |
| 5 | What could replace it, and what would the score be then? | Was könnte ihn ersetzen, und welchen Wert hätte der Dienst dann? |
| 6 | Which comparable service scores higher? | Welcher vergleichbare Dienst schneidet besser ab? |
| 7 | Did this run cost money? | Hat dieser Lauf Geld gekostet? |
| 8 | What is real and what is replayed? | Was ist echt, und was ist nachgespielt? |

### Answers

| Q | Case | Lang | Expected | Given | Must name | Match |
|---|---|---|---|---|---|---|
| q1 | BundID | EN | An AI agent finds out who makes and who runs each building block of a public digital service, with a public source and a quote for every finding; code turns that into levels, layer scores and an overall score, indicative and not an official assessment. | It's a tool in which an AI agent looks up a public service and uses quoted public sources to work out who makes and who runs each building block, layer by layer from infrastructure to access. Here the service is BundID, "the federal user account with which people identify themselves for online administrative services", offered by the BMDS and run by the ITZBund. Code then rates each block from level 0 to 4 and gives the service a score out of 100 (marked indicative); a person checks the findings and can try a what-if "lever", and the agent drafts a memo that waits for approval and isn't sent anywhere. | agent; source | yes |
| q2 | BundID | EN | 77 of 100 on 5 of 6 layers, indicative: no critical block is under exclusive non-EU control, and the weakest critical link is at level 3 of 4. | Fairly sovereign but not fully: it scores 77 of 100 (indicative, on 5 of 6 layers), all four critical blocks are run in Germany by the ITZBund, none is under exclusive non-EU control and the weakest critical block is at level 3 of 4, but iPhone users get the AusweisApp through Apple's App Store, which is run from the US (level 0). | 77 | yes |
| q3 | BundID | EN | The lowest block is the AusweisApp on iPhones through the App Store, level 0, but it isn't critical: the service runs without it, though a main function degrades. The weakest critical link is the Kubernetes platform at the ITZBund, level 3 of 4. | It depends which "weakest" you mean. The lowest-rated part is getting the AusweisApp onto iPhones through the App Store (level 0); it's marked "important", not critical, so the service doesn't stop without it, though the legend says a main function degrades. The part the page calls the "weakest critical link" is the Kubernetes platform at the ITZBund (level 3 of 4), and because it's critical the service stops without it. | App Store; critical | yes |
| q4 | BundID | EN | The App Store is run by Apple Distribution International, part of Apple Inc. in the United States: run from outside the EU, so level 0. (The Kubernetes platform is open source made outside the EU and run in the EU by the ITZBund: level 3.) The weaker of maker and operator sets the level. | The App Store block is made by Apple Inc. and run by Apple Distribution International Ltd., part of Apple Inc., both shown as United States. So it's "made outside the EU and not open source; run from outside the EU, with no sign it is hosted in the EU", and since the weaker side sets the level, it gets 0. Going by the legend, Kubernetes gets level 3 because it's open source from outside the EU (a CNCF project, part of The Linux Foundation, US) but run in the EU by the ITZBund. | Apple | yes |
| q5 | BundID | EN | Distributing the AusweisApp on iPhones through an app marketplace run in the EU, with starting points for research such as AltStore PAL, not a recommendation; the overall score would rise from 77 to 81, indicative. | Offering the AusweisApp for iPhones through an app marketplace run in the EU (the starting points named are AltStore PAL, Onside and Skich) would raise the overall score from 77 to 81 (+4), and the weakest critical link would stay at level 3; the card adds that the app would still run on the phone maker's platform. For Kubernetes the searches found no alternative made in the EU, so nothing is offered there, and the screens don't say which level the marketplace block itself would get. | marketplace; 81 | yes |
| q6 | BundID | EN | In the same group, identity and sign-in, the Business account scores higher: 92. | The Business account scores higher: 92, on all 6 layers, even though its weakest part ("Software platform under ELSTER") is level 2, lower than BundID's 3. The other two comparable services score lower: Online ID 70 and ID wallet d-you 67. | Business account; 92 | yes |
| q7 | BundID | EN | No: this replay costs €0; only a live run on your own key would cost money. | No. This replay cost €0; the header says a live run would cost about €0.62. | no | yes |
| q8 | BundID | EN | The pages, sources and quotes are real, read on public websites and dated; the agent's run is a recorded run replayed in the browser, not live. | The agent's run is replayed: every agent box says "replayed, not live", there's a SIMULATION badge, and the run cost €0. The page presents three things as real: the quotes (with linked page titles and "read" dates of 19 and 20 November 2026), the levels, scores and what-if numbers that code computes, and the person's confirm and approve decisions, which a decision log records. The screens don't show whether the sources are still current, whether the memo is written live or replayed, or what "Start agent" would do. | quote; replay | yes |
| q1 | FIT-Connect | EN | (as BundID) An AI agent finds out who makes and who runs each building block of a public digital service, with a public source for every finding; code scores it, indicative. | It's the same tool [as for BundID: "an AI agent looks up a public service and uses quoted public sources to work out who makes and who runs each building block"], used here on FIT-Connect, "data exchange between administrations": a base infrastructure for submitting applications for administrative services digitally and routing them to the responsible authority (offered by the IT-Planungsrat, run by FITKO). The agent maps 7 building blocks on 5 of 6 layers with quotes and code scores them. A person checks the two flagged blocks, can try a what-if lever and gets a draft memo to approve. | agent; source | yes |
| q2 | FIT-Connect | EN | 76 of 100 on 5 of 6 layers, indicative: every critical block is at level 4 and none is under exclusive non-EU control. | Sovereign at the core with a gap at the edge: it scores 76 of 100 (indicative, on 5 of 6 layers), and all five critical blocks are at the top level 4 (made and run in the EU, in fact all in Germany), but the access layer scores 0 because the Java SDK is distributed through Maven Central, which Sonatype runs from the US. | 76 | yes |
| q3 | FIT-Connect | EN | The lowest block is the Java SDK distribution through Maven Central, level 0, but it isn't critical: the service runs without it, though a main function degrades. Every critical block is at level 4. | The weakest part is the Java SDK distribution through Maven Central (level 0). It's marked "important", not critical, so the service doesn't stop without it, though the legend says a main function degrades. The tile labelled "weakest critical link" points to the data centre of the Zustelldienst, but that block is at level 4 of 4 like all five critical blocks, so no critical part is actually weak; the next-lowest part is the authentication server and self-service portal (level 2, important). | Maven Central; critical | yes |
| q4 | FIT-Connect | EN | Maven Central is made and run by Sonatype, a US company: run from outside the EU, so level 0. | Maven Central is made and run by Sonatype, Inc. in the United States, so it's "made outside the EU and not open source; run from outside the EU, with no sign it is hosted in the EU", and since the weaker side sets the level, it gets 0. The authentication server gets level 2 because no source names who makes it: "With the maker or the operator not in the sources, the level is at most 2." | Sonatype | yes |
| q5 | FIT-Connect | EN | Distributing the SDKs from a registry run in the EU; the overall score would rise from 76 to 86, indicative. | Distributing the SDKs from a registry run in the EU would raise the overall score from 76 to 86 (+10), and the weakest critical link would stay at level 4. The card calls a registry run in Germany "a known path" because the SDK's source code already sits on a code platform its operator runs itself; the starting point named is Reposilite. Keycloak and Nubus are named as starting points for the authentication server, but no score is shown for them, and the screens don't say which level the new registry block itself would get. | registry; 86 | yes |
| q6 | FIT-Connect | EN | In the same group, data exchange and mailboxes, the Once-Only System scores higher: 88. | The Once-Only System scores higher, 88 against 76, but it's scored on only 4 of 6 layers and its weakest part ("Technology stack prescribed by Dataport") is level 2, so it isn't clearly more sovereign. It's the only comparable service shown. | Once-Only System; 88 | yes |
| q7 | FIT-Connect | EN | No: this replay costs €0. | No. This replay cost €0; a live run would cost about €0.57. | no | yes |
| q8 | FIT-Connect | EN | The pages, sources and quotes are real; the run is a recorded run replayed, not live. | It's the same split as for BundID: the agent's research and narration are replayed ("replayed, not live", SIMULATION badge, €0). The page presents as real the quotes (with linked page titles, read on 19 November 2026), the levels, scores and what-if numbers computed by code, and the confirm and approve decisions in the decision log. The screens don't show whether the sources are still current, whether the memo is written live, or what "Start agent" would do. | quote; replay | yes |
| q1 | BundID | DE | Ein KI-Agent findet heraus, wer jeden Baustein eines öffentlichen digitalen Dienstes herstellt und betreibt, mit einer öffentlichen Quelle und einem Zitat für jeden Befund; Code macht daraus Stufen, Ebenenwerte und einen Gesamtwert, indikativ und keine amtliche Bewertung. | Ein KI-Agent sucht in öffentlichen Quellen, wer die Bausteine der BundID (Nutzerkonto des Bundes) herstellt und betreibt. Das macht er auf sechs Ebenen von Infrastruktur bis Zugang und belegt jede Angabe mit einem Zitat; Code vergibt daraus Stufen von 0 bis 4 und einen indikativen Gesamtwert bis 100. Danach prüft ein Mensch die Befunde, der Prototyp rechnet einen „Hebel“ als Was-wäre-wenn durch und legt einen Memo-Entwurf zur Freigabe vor, der die Seite nicht verlässt. | Agent; Quelle | yes |
| q2 | BundID | DE | 77 von 100 auf 5 von 6 Ebenen, indikativ: Kein kritischer Baustein steht unter exklusiver Nicht-EU-Kontrolle, das schwächste kritische Glied hat Stufe 3 von 4. | Weitgehend souverän: indikativ 77 von 100 auf 5 von 6 Ebenen, kein kritischer Baustein steht unter exklusiver Nicht-EU-Kontrolle, und das schwächste kritische Glied (Kubernetes-Plattform beim ITZBund) liegt immerhin auf Stufe 3 von 4. | 77 | yes |
| q3 | BundID | DE | Am niedrigsten ist die AusweisApp auf iPhones über den App Store, Stufe 0, aber sie ist nicht kritisch: Der Dienst läuft ohne sie, eine Hauptfunktion leidet. Das schwächste kritische Glied ist die Kubernetes-Plattform beim ITZBund, Stufe 3 von 4. | Am niedrigsten bewertet ist die AusweisApp auf iPhones über den App Store (Stufe 0). Sie gilt nur als „wichtig“, nicht als kritisch, also steht der Dienst laut Legende ohne sie nicht still, aber eine Hauptfunktion leidet. Als „schwächstes kritisches Glied“ führt die Seite dagegen die Kubernetes-Plattform beim ITZBund (Stufe 3); ohne sie stünde der Dienst still. | App Store; kritisch | yes |
| q4 | BundID | DE | Den App Store betreibt Apple Distribution International, Teil von Apple Inc. in den USA: von außerhalb der EU betrieben, also Stufe 0. (Die Kubernetes-Plattform ist Open Source von außerhalb der EU, in der EU vom ITZBund betrieben: Stufe 3.) Der schwächere von Hersteller und Betreiber bestimmt die Stufe. | Hersteller ist Apple Inc. (USA), Betreiber ist Apple Distribution International Ltd., Teil von Apple Inc., laut Seite ebenfalls USA. Der Baustein ist also außerhalb der EU hergestellt, nicht quelloffen und wird von außerhalb der EU betrieben, ohne Beleg für ein Hosting in der EU; der schwächere der beiden Werte bestimmt die Stufe, also 0. Die Kubernetes-Plattform hat Stufe 3, weil sie laut Legende „quelloffen von außen, in der EU betrieben“ ist (Hersteller USA, Betreiber ITZBund). | Apple | yes |
| q5 | BundID | DE | Die AusweisApp für iPhones über einen in der EU betriebenen App-Marktplatz vertreiben, mit Ansatzpunkten für die Recherche wie AltStore PAL, keine Empfehlung; der Gesamtwert stiege von 77 auf 81, indikativ. | Vorgeschlagen ist, die AusweisApp für iPhones über einen in der EU betriebenen App-Marktplatz zu vertreiben; als Ansatzpunkte für die Recherche werden AltStore PAL, Onside und Skich genannt. Dann läge der Gesamtwert indikativ bei 81 statt 77, das schwächste kritische Glied bliebe auf Stufe 3, und die App liefe weiter auf der Plattform des Herstellers. Für die Kubernetes-Plattform haben die Suchen keine in der EU hergestellte Alternative gefunden. | Marktplatz; 81 | yes |
| q6 | BundID | DE | In derselben Gruppe, Identität und Anmeldung, schneidet das Unternehmenskonto besser ab: 92. | Beim Gesamtwert das Unternehmenskonto: 92 auf 6 von 6 Ebenen statt 77, allerdings liegt sein schwächstes Glied nur auf Stufe 2 (Software-Plattform unter ELSTER). Online-Ausweis (70) und Wallet d-you (67) liegen darunter; Wallet d-you hat zwar ein schwächstes Glied auf Stufe 4, ist aber nur auf 3 von 6 Ebenen bewertet. | Unternehmenskonto; 92 | yes |
| q7 | BundID | DE | Nein: Diese Wiedergabe kostet 0 €; nur ein Live-Lauf mit eigenem Schlüssel kostet Geld. | Nein, laut Kachel steht da „diese Wiedergabe: 0 €“; ein Live-Lauf liegt bei etwa 0,62 €. Ob dieser Betrag bei einem früheren echten Lauf wirklich angefallen ist oder nur geschätzt ist, sagt die Seite nicht eindeutig. | nein | yes |
| q8 | BundID | DE | Die Seiten, Quellen und Zitate sind echt, auf öffentlichen Websites gelesen und datiert; der Lauf des Agenten ist ein aufgezeichneter Lauf, im Browser nachgespielt, nicht live. | Echt sind laut Seite die Quellen, also Zitate von echten Seiten (BundID, Apple) mit Link und Lesedatum 19./20. November 2026, und die Rechnung: Stufen und Werte vergibt Code, nicht die KI. Nachgespielt ist der Agent: Oben steht „SIMULATION“, jede Agentennachricht ist als „nachgespielt, nicht live“ markiert, und einen Teil der Fakten nennt der Agent selbst „mitgeliefert“. Die 81 ist nur eine Was-wäre-wenn-Rechnung auf einer Kopie, das Memo ist ein Entwurf, der nicht versendet wird, und das Ganze ist ein Prototyp, „kein offizielles Angebot der Bundesregierung“. | Zitat; nachgespielt | yes |
| q1 | FIT-Connect | DE | (wie BundID) Ein KI-Agent findet heraus, wer jeden Baustein eines öffentlichen digitalen Dienstes herstellt und betreibt, mit einer öffentlichen Quelle für jeden Befund; Code bewertet ihn, indikativ. | Derselbe Ablauf [wie bei der BundID: „Ein KI-Agent sucht in öffentlichen Quellen, wer die Bausteine der BundID (Nutzerkonto des Bundes) herstellt und betreibt“] für FIT-Connect, die Basisinfrastruktur, über die Anträge auf Verwaltungsleistungen digital eingereicht und an die zuständige Behörde weitergeleitet werden (angeboten vom IT-Planungsrat, betrieben von der FITKO). Der Agent liest die eigene Dokumentation und ordnet 7 Bausteinen auf 5 von 6 Ebenen Hersteller und Betreiber zu; Code bewertet sie, ein Mensch prüft, dann folgen Hebel und Memo-Entwurf. | Agent; Quelle | yes |
| q2 | FIT-Connect | DE | 76 von 100 auf 5 von 6 Ebenen, indikativ: Jeder kritische Baustein hat Stufe 4, keiner steht unter exklusiver Nicht-EU-Kontrolle. | Im Kern voll souverän, denn alle fünf kritischen Bausteine stehen auf Stufe 4 von 4; insgesamt sind es aber nur indikativ 76 von 100 auf 5 von 6 Ebenen, weil die Ebene Zugang (SDK-Verteilung über Maven Central, USA) 0 Punkte bekommt. | 76 | yes |
| q3 | FIT-Connect | DE | Am niedrigsten ist die Verteilung des Java-SDK über Maven Central, Stufe 0, aber sie ist nicht kritisch: Der Dienst läuft ohne sie, eine Hauptfunktion leidet. Jeder kritische Baustein hat Stufe 4. | Am schwächsten ist die Verteilung des Java-SDK über Maven Central (Stufe 0, Ebene Zugang). Sie ist „wichtig“, nicht kritisch, also läuft der Dienst ohne sie weiter, laut Legende leidet aber eine Hauptfunktion; welche, steht nicht da. Ein schwaches kritisches Glied gibt es nicht, alle fünf kritischen Bausteine liegen auf Stufe 4. | Maven Central; kritisch | yes |
| q4 | FIT-Connect | DE | Maven Central stellt Sonatype her und betreibt es, ein US-Unternehmen: von außerhalb der EU betrieben, also Stufe 0. | Hersteller und Betreiber ist Sonatype, Inc. (USA): außerhalb der EU hergestellt, nicht quelloffen und von außerhalb der EU betrieben, ohne Beleg für ein Hosting in der EU, also Stufe 0. Weil es der einzige Baustein der Ebene Zugang ist, bekommt die ganze Ebene 0 Punkte. | Sonatype | yes |
| q5 | FIT-Connect | DE | Die SDKs aus einem Verzeichnis in der EU verteilen; der Gesamtwert stiege von 76 auf 86, indikativ. | Vorgeschlagen ist, die SDKs aus einem Paketverzeichnis in der EU bzw. mit Betrieb in Deutschland zu verteilen (Ansatzpunkt für die Recherche: Reposilite). Begründet wird das damit, dass der SDK-Quellcode schon auf einer selbst betriebenen Code-Plattform liegt; dann läge der Gesamtwert indikativ bei 86 statt 76, und das schwächste kritische Glied bliebe auf Stufe 4. Für den Authentifizierungsserver (Stufe 2) nennt die Seite Keycloak und Nubus als Ansatzpunkte, rechnet dafür aber keinen Wert aus. | Verzeichnis; 86 | yes |
| q6 | FIT-Connect | DE | In derselben Gruppe, Datenaustausch und Postfächer, schneidet das Once-Only-System besser ab: 88. | Gezeigt wird nur das Once-Only-System: 88 statt 76, allerdings nur auf 4 von 6 Ebenen und mit einem schwächsten Glied auf Stufe 2 („Von Dataport vorgegebener Technologiestack“). Beim Gesamtwert liegt es also vorn, beim schwächsten Glied schneidet FIT-Connect mit Stufe 4 besser ab. | Once-Only-System; 88 | yes |
| q7 | FIT-Connect | DE | Nein: Diese Wiedergabe kostet 0 €. | Nein, da steht „diese Wiedergabe: 0 €“; ein Live-Lauf liegt laut Kachel bei etwa 0,57 €. | nein | yes |
| q8 | FIT-Connect | DE | Die Seiten, Quellen und Zitate sind echt; der Lauf ist ein aufgezeichneter Lauf, nachgespielt, nicht live. | Echt sind laut Seite die Zitate aus der FIT-Connect-Dokumentation (Einführung, FAQ) und von Sonatype mit Lesedatum 19. November 2026, außerdem bewertet Code die Bausteine, nicht die KI. Nachgespielt sind die Agentenschritte („SIMULATION“, „nachgespielt, nicht live“, 0 €). Die 86 ist eine Was-wäre-wenn-Rechnung auf einer Kopie, und das Memo ist ein Entwurf, der die Seite nicht verlässt. | Zitat; nachgespielt | yes |
| q6 | Overview: BundID | EN | In BundID's group, identity and sign-in, the Business account scores higher: 92. | Business account scores higher: 92 (on 6 of 6 layers) against BundID's 77 (on 5 of 6 layers). It is the only service in BundID's function group, "identity and sign-in", that scores above it. Online ID (70) and ID wallet d-you (67) score lower. | Business account; 92 | yes |
| q6 | Overview: BundID | DE | In der Gruppe der BundID, Identität und Anmeldung, schneidet das Unternehmenskonto besser ab: 92. | Das Unternehmenskonto schneidet besser ab: Gesamtwert 92 (auf 6 von 6 Ebenen) gegenüber 77 bei BundID (auf 5 von 6 Ebenen). In der Funktionsgruppe „Identität und Anmeldung“ liegt nur dieser Dienst über BundID; Online-Ausweis (70) und Wallet d-you (67) liegen darunter. | Unternehmenskonto; 92 | yes |
| q6 | Overview: FIT-Connect | EN | In FIT-Connect's group, data exchange and mailboxes, the Once-Only System scores higher: 88. | Once-Only System scores higher: 88 (on 4 of 6 layers) against FIT-Connect's 76 (on 5 of 6 layers). It is the only other service in the function group "data exchange and mailboxes". | Once-Only System; 88 | yes |
| q6 | Overview: FIT-Connect | DE | In der Gruppe von FIT-Connect, Datenaustausch und Postfächer, schneidet das Once-Only-System besser ab: 88. | Das Once-Only-System schneidet besser ab: Gesamtwert 88 (auf 4 von 6 Ebenen) gegenüber 76 bei FIT-Connect (auf 5 von 6 Ebenen). Es ist der einzige andere Dienst der Funktionsgruppe „Datenaustausch und Postfächer“. | Once-Only-System; 88 | yes |

The readers' confidence was high for every answer but these, which they gave with medium confidence: question 3 in English for both services and in German for BundID ("the page uses two different meanings of 'weakest'"; for FIT-Connect, "the 'weakest critical link' label points at a level-4 block"), question 8 in both languages for both services, and question 6 in German for both services, where the reader added that the higher score rests on a weaker critical link or fewer layers.

### What changed between the rounds

- **After round 1.** The overview reader could not tell which services count as comparable. All services got its lead line: which services are comparable and what the levels run from and to.
- **After round 2.** Every answer matched; the readers still stumbled, and these changed: Research's title ("6 building blocks on 5 of 6 layers, with sources") and a shorter lead ("Layer by layer: 11 pages read, 21 quotes kept"), with a wider layer column and tighter rows so the table fits; Your review's prompt in the plural ("check the findings and their sources, then confirm"); a shorter German lead at Recommend; German singular forms ("1 weiterer"); a non-breaking hyphen in "sign-in"; and the score after a lever, "if carried out, indicative".
- **After round 3.** Every answer matched. In all three rounds, though, a reader took "Session cost ≈ €0.62 for a live run" for money spent at first glance, so the tile now says what its figure is: "A live run would cost ≈ €0.62" over "this replay: €0" (D6 back to the brief's default). Your review shows first the quotes that back the side setting the level, and a party in a group from another country shows its own country. All services says its order comes from the overall score, the mean of the layer scores, and counts "0 % of 4 critical"; the German Compare button says what ticking does; comparable services say "weakest critical link". The critique's fixes came in the same round (see its section).
- **After round 4.** The cost tile now read right at first glance, in both languages: "an estimate: a live (real) run of the agent would cost about €0.62. This run cost nothing." Three things still stopped the reader. The operator "Apple Distribution International Ltd. (Ireland)" beside "run from outside the EU" looked like a contradiction, so the level's reason now says "run by a company of a group outside the EU". The struck-through 77 beside 81 after the approval read as a change already made, so the header now keeps the figures as assessed and notes "81 if carried out" under 77. And "0 % of 6 critical" ran into the next column of All services, so the cell now wraps. Two German phrasings changed too: "Betreiber von BundID: …" and "BundID laut den eigenen Seiten".
- **After round 5.** The reader explained the level from the group rule ("run by a company of a group outside the EU") and saw that the assessment stayed as it was after the approval: the header kept 77, with "81 if carried out" in a green tile. The reader still missed a quote saying that the Irish company is Apple's, so BundID's card now shows the two quotes that do it together, in the order recorded: "Depending on your location, the Apple entity providing the services is:" and the address of Apple Distribution International Ltd. in Cork. The green tile first read as "the score went up" before the reader saw 77; it stays green to mark the person's decision.

### What still makes a reader stop, and why it stays

- **Two meanings of "weakest" in one tile.** "Weakest critical link: Level 3" sits over "Lowest overall: … 0, not critical". It is D1, the brief's default, and every reader answered question 3 right; three gave medium confidence. On FIT-Connect, "Level 4 of 4 … and 4 more at this level" reads as a paradox; the line under it names the real gap, Maven Central at 0.
- **"SIMULATION" and "replayed, not live" beside "You are interacting with an AI system".** The notice stands beside every control that can start a live run, by rule, and Start agent is one.
- **"Recommend" and "Suggested by the agent" beside "Starting points for research, not a recommendation".** The lever is the agent's recommendation and the starting points are not (D2's label).
- **The recorded runs' own words.** "Please check, correct or confirm" with only Confirm on the page; the agent's layer names ("Development, security and operations") beside the table's short ones; "Zustelldienst" and German quotes on the English page; "mitgelieferte Referenzfakten"; the agent's box at the memo repeating its words from Recommend; German "Verteilung der AusweisApp". The pre-runs are pinned (TECH_NOTES.md §25) and change only when a run is recorded again.
- **"Made by Apple Inc." under "AusweisApp on iPhones through the App Store".** Readers first took Apple for the app's maker; the block is the distribution channel, as its name says, and the agent's words say "the AusweisApp's distribution on iPhones".
- **A layer without blocks is left out of the score, not counted as 0.** Method 1.0, unchanged by the brief's rule; the score says on how many layers it rests.
- **Only one block to review for BundID**, though the Online ID is also below level 3: the recorded run asks about one.
- **"9 pages read, 14 quotes kept" against 22 quote links in FIT-Connect's table.** A quote can back more than one block.
- **FIT-Connect's second review card sits below the fold at 1280 × 720.** The stage scrolls (TECH_NOTES.md §25).
- **The lever does not show the level its block would reach;** the score and the weakest critical link it would give are shown.
- **German "eine Seite unbekannt"** (a side, not a web page) was once read as a web page; the words are 1.0.0's.
- **"Exclusive non-EU control" is explained at Score**, not on the first screen; the guide's table explains it too.

## Partner review

As Vici's prototype brief describes it (Build a prototype, The partner review), on the screens of this release.

**Partner review:** Sovereignty Assessment 2.1.0

**Verdict:** ready

**The One Thing:** An AI agent finds who makes and who runs each part of a public service, with a public source for every finding, and code scores it: BundID 77 of 100 on 5 of 6 layers, indicative, with its one block at level 0 not critical.

**Keeps its promise:** yes. Readers who had only the screenshots answered all eight questions as expected, in English and German, for BundID and FIT-Connect, and question 6 from All services alone. Every figure is the engine's (`tests/figures.mjs`, `tests/showcase.mjs`), its evidence is one click away (the quote, its page and the day it was read), and the replay says what it is: SIMULATION, "replayed, not live" and "this replay: €0".

**Opened cold** at 1280 × 720: in the first ten seconds the header says what the prototype does and how real its data is, and the four figures stand from the first second, BundID's 77 among them. What the levels and "critical" mean waits for Score's key.

**Every step**, with what it does, what it is worth and which figure moves:

| Step | What the prototype does | What it is worth | Figure |
|---|---|---|---|
| Understand | Looks the service up and reads its own pages: who offers it and who runs it, with 4 quotes | Whose service this is | The four figures stand; none moves |
| Research | Splits the service into 6 blocks on 5 of 6 layers, each with who makes it and who runs it: 11 pages read, 21 quotes kept | The evidence | None moves; the table is where they come from |
| Score | Code gives each block its level and each layer its score; criticality in words, the key at the story's size, every figure opens its make-up | How 77 is made | 77, explained |
| Your review | A person checks the App Store block and its quotes, then confirms | Oversight before any recommendation | None; the page waits for the person |
| Recommend | One lever, an app marketplace run in the EU, would lift the score to 81; starting points and comparable services; the person approves or keeps, the agent drafts a memo, nothing is sent | What could change | 77 stays, with "81 if carried out" |

No key figure moves: the figures stand from the first second, and the lever adds what it would give, "81 if carried out", since it is a proposal and the assessment stays as it is. No step goes on the cut list: each answers one of the cold read's questions. The case survives the cuts: every figure comes from the pre-run through the engine, its evidence is one click away, and the replay says it is one.

**The three things:** the byline at the stage's foot, in its own words; the talk track in the guide's last chapter, five timed steps with the run's figures; the four key figures at the top.

**Screens nobody demos:** loading (the boot screen until the pre-runs are played); the empty and ended states (three services "ended without an assessment" say why, and this prototype stands apart); a failed live run (a rejected key is forgotten and the dialog says why, a switched-off tool stops the run and says why: `tests/live.mjs`); the other theme and 1920 × 1080 (the critique's screenshots and `tests/showcase.mjs` layout); the page opened from a file (the boot note stays and says to serve it over http).

**Presented along the guide's script with a timer**, at 1280 × 720 in a headless browser that clicks what each step says while the lines are spoken at 140 words a minute: the page needs 18, 16, 14, 6 and 6 seconds in English (60 in all) and 17, 16, 13, 5 and 4 in German (56). Each step keeps most of its minute for the presenter's own words.

**Cut list:**

- The small legend under the score step: the key at the story's size says the same and what critical means.
- Research's long lead: "Layer by layer: 11 pages read, 21 quotes kept" says what counts.
- More than one quote per card when the agent asks about several blocks: the others are one click away.
- "estimated" on the cost tile: its label now says what the figure is.

**Fix list:** none open. The fixes this review asked for are in the cold read's "What changed" and in the critique.

**Keep list:** the byline; the talk track; the four key figures; SIMULATION and "You are interacting with an AI system"; "indicative, not an official assessment" and "not an official service of the German Federal Government"; a source for every finding; the make-ups; All services and Compare; drafts only, nothing sent.

## Design review

A design review of the changed screens: start from what the customer sees, cut until only the essential remains, and call nothing done that isn't.

**Verdict:** ready (9/10 on the review's scale: insanely great, ships)

**The One Thing:** An AI agent finds who makes and who runs each part of a public service from real sources, and code scores it: BundID 77 on 5 of 6 layers, indicative, with no critical block under exclusive non-EU control.

**Keeps its promise?** Yes. The cold read's answers match in both languages; the figures are the engine's; the replay costs nothing and says so in the tile's label.

**Quick diagnostic:** six of seven rows pass. The One Thing fits one sentence; the four figures stand on the first screen, and how 77 is made is one click away; the review was done cold, from screenshots; it is a working page on the device it is shown on, 1280 × 720 and 1920 × 1080; this cycle cut the small legend, the long lead, extra quotes and "estimated"; and the page is something to sign. The row that fails: not every edge state matches the hero screen (below).

**Cut list:** as the partner review's.

**Fix list:** none open. Fixed in this release after the critique and the cold read: the header after a lever, the review's evidence and its words for a group from outside the EU, the cost tile's label, the size of the weakest-link tile's lines.

**Back of the fence:** Your review scrolls at 1280 × 720 when the agent asks about several blocks (FIT-Connect); the recorded runs' own words leave seams the page cannot mend ("check, correct or confirm" with only Confirm, the agent's box at the memo repeating Recommend's words, "Zustelldienst" untranslated in English); in German at 720 px high the Start agent dialog's estimate sits one scroll down.

## Usability audit

Nielsen's ten heuristics and the quick diagnostic of "don't make me think" over the changed screens, on the critique's findings and the cold read's. Severity: 0 none, 1 cosmetic, 2 minor, 3 major, 4 catastrophic.

| Finding | Heuristic | Severity | State |
|---|---|---|---|
| After a lever the weakest-link tile showed the what-if without a mark and disagreed with Score, and the struck-through 77 beside 81 read as a change already made | 1, 4 | 3 | Fixed: the header keeps the figures as assessed and notes "81 if carried out" |
| "Session cost ≈ €0.62 for a live run" read as money spent at first glance, in every round | 2 | 3 | Fixed: "A live run would cost ≈ €0.62" over "this replay: €0" |
| Your review's visible quotes did not back the finding | 1, 9 | 3 | Fixed: the quotes that back the side setting the level come first; the party's own country shows |
| The weakest-link tile's lines at 12 px on a projector | 8 | 2 | Fixed: 14 px |
| "weakest:" under comparable services meant the critical link | 4 | 2 | Fixed: "weakest critical link:" |
| All services did not say what its order rests on | 2 | 2 | Fixed: "by the overall score: the mean of a service's layer scores" |
| The person's steps were marked by colour alone | 4, a11y | 2 | Fixed for screen readers: "your step" |
| "0 % of 4" without "critical"; the German Compare button without its purpose | 2 | 1 | Fixed |
| The agent offers "check, correct or confirm"; the page has only Confirm | 3, 4 | 2 | Open: the recorded run's words, pinned with the run |
| The agent's box at the memo repeats Recommend's words | 1 | 2 | Open: the recorded run has no words for the memo |
| Confirm is live while FIT-Connect's second review card is below the fold | 5 | 2 | Open: the stage scrolls; documented in TECH_NOTES.md §25 |
| "Your turn" stands where Play pauses and where a decision waits | 4 | 1 | Open: the bar names the act each time |
| Keys beyond Space are written nowhere | 7, 10 | 1 | Open |
| The disabled "Check key and start" relies on the two fields above it to say why | 9 | 1 | Open |

No finding of severity 3 or 4 is open. **Score: 9/10.** Of the quick diagnostic's ten rows, one fails, at severity 2: a reader still stops to think in places (two meanings of "weakest" in one tile, the recorded runs' own words). To reach 10/10: record the runs again with words that match the page (the memo, "correct"), and write the keys into the guide.

## Critique of every changed screen

Method: dual-agent (A: a design review agent with Impeccable's critique rubric, from the screenshots and the source · B: a detector and browser agent). Neither saw the other's work. The screens: the header's tiles, the score step with its key, the make-ups, Your review, Recommend with its starting points and comparable services, All services, Compare, the Serviceportal.NRW's first step, the step bar, the guide's last chapter and the Start agent dialog, in light and dark at 1280 × 720 and 1920 × 1080, and in German at 1280 × 720. The scores below are the critique's, before the fixes it led to.

### Design health score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | After a lever the weakest-link tile showed the what-if without a mark (fixed); the agent's box at the memo repeats Recommend's words |
| 2 | Match between system and real world | 3 | "Session cost" led with €0.62 for a run that cost nothing (fixed); "0 % of 2" without "critical" (fixed) |
| 3 | User control and freedom | 3 | A decision is undone only by Replay; the agent's words offer "correct", the page only Confirm |
| 4 | Consistency and standards | 2 | "weakest:" in comparable services meant the critical link (fixed); tile and table disagreed after a lever (fixed); "Your turn" for a pause and for a decision |
| 5 | Error prevention | 3 | Confirm is live while FIT-Connect's second review card is below the fold |
| 6 | Recognition rather than recall | 3 | The make-up's "÷ 5" needs the weights from the key |
| 7 | Flexibility and efficiency | 3 | Space, arrows, keys 1 to 5 and deep links; only Space is written down |
| 8 | Aesthetic and minimalist design | 3 | Calm; some lines repeat ("not a recommendation", "nothing is sent") |
| 9 | Error recovery | 3 | Live errors name a way out; the disabled "Check key and start" relies on the two fields above it to say why |
| 10 | Help and documentation | 3 | The guide's figures come from the run; the talk track leaves out the approval |
| **Total** | | **29/40** | **Good** |

### Design specificity

Authored for this product. The content model is the design: hexagon levels that always carry their number on a blue-to-red scale, lilac for the agent's words and merlot for the person's turn, the arithmetic in the make-ups, quotes with the date they were read, "Code, not the AI", and the prototype scoring itself 17, outside the ranking. The parts are Vici's.

The detector scanned `index.html` (39 findings, all placed at line 0 and traced by hand) and eleven URL scans: BundID's score, review and recommend steps, the Serviceportal.NRW's first step and the guide's last chapter, at 1280 × 720 and 1920 × 1080, and the German score step (65 findings). Its overlay ran in a headless browser with the page's script policy bypassed, so no person saw it; it found nothing inside the make-up, All services, Compare, the guide's last chapter or the four tiles.

- **True, fixed:** a bar down one side of the Your turn box (`#turn`, a 4 px stripe on a rounded box); a tinted, bordered note inside the bordered card on the Serviceportal.NRW's first step; agent text at 85 to 95 characters a line at 1920 × 1080; the Start agent dialog's paragraph at 86 to 89.
- **True, left:** the guide's leads at Vici's line height of 1.22 where they wrap (a Vici component); two single words left alone on a line at 1920 ("(IT.NRW)", "(BMDS)"), an advisory.
- **Deliberate:** Inter and the light theme's warm background, Vici's choices.
- **False positives:** low contrast on the step markers (they are hollow hexagon rings; measured on the pixels, 12.5:1 in light and 14.1:1 in dark); "organic" clip paths (Vici's hexagons); cramped padding in closed dialogs; a thin border with a wide shadow on the five closed dialogs; the turn bar's shadow in its own surface colour; the invalid-field stripe and the striped progress style, neither on the page.
- Deep links: `?step=recommend` opens Your review, since Recommend waits for the person's confirmation.

### Overall impression

Every figure shows where it comes from, and the colour says who speaks. The biggest risk was a header that disagreed with the stage after a decision; it now keeps the figures as assessed.

### What's working

- Every figure is one click from its source: the arithmetic, the read dates, "replayed, not live" and the AI notice. For officials, that trust is the product.
- Lilac is the agent and merlot is you, and every level is also a number. Small text measures 8.2:1 in light and 11.3:1 in dark.
- It is built to be presented: Play stops at decisions, the one button stays in one place, a clicker's keys work, and the talk track's figures come from the run.

### Priority issues

- **[P1] After a lever, the weakest-link tile contradicted the table.** Its lowest line switched to the what-if (the Online ID at level 2) without a mark, while Score still tagged the App Store at 0. Fixed: the header keeps the figures as assessed, the weakest-link tile its lowest line, and the score tile notes "81 if carried out" under 77; a struck-through 77 beside 81 had read as a change already made.
- **[P1] Your review's quotes did not back the finding.** The first quotes were the first recorded: a trademark notice and a sentence that ends at a colon. Fixed: a card shows first the quotes that back the side setting the level, in the order recorded, so BundID's card says that the Apple entity providing the services is Apple Distribution International Ltd. in Cork; a party in a group from another country shows its own country, "Apple Distribution International Ltd. (Ireland), part of Apple Inc.", and the level's reason says "run by a company of a group outside the EU". The agent's words still say "check, correct or confirm" with only Confirm on the page: the recorded run's words, left as they are.
- **[P1] The new details were the smallest text on a projector.** The tile's lowest line and its link were 12 px at 1280 × 720. Fixed: 14 px in the weakest-link tile; the score step's criticality words grow to 14 px from 1700 px wide (at 1280 × 720 the score step would scroll).
- **[P2] Labels that contradicted their numbers.** "weakest:" under comparable services meant the critical link; the cost tile read "Session cost ≈ €0.62". Fixed: "weakest critical link:" and "A live run would cost".
- **[P2] The person's steps were marked by colour alone.** Fixed for screen readers: "your step" follows the step's name. "Your turn" still stands both where Play pauses and where a decision waits.

### Persona red flags

- **Power user:** the keys beyond Space are written nowhere; the 77 tile opens nothing (its arithmetic opens from Score's "How 77 is made").
- **Keyboard and screen reader:** the person steps were colour only (fixed); the agent's box at the memo reads out Recommend's words again.
- **Official reading alone:** the visible quotes did not prove the finding (fixed); "÷ 5" is explained only by the key; "the research notes list the searches" points to research/, not to the page; a service with 100 on 3 of 6 layers leads All services.
- **Consultant presenting:** the talk track ends on the Serviceportal.NRW without approving the lever, so the memo and the log stay off the five minutes; the talk track's numbers 1 to 5 are not the keys 1 to 5.

### Minor observations

- The log said the agent "published" its report; it now says "recorded".
- In German, the lead at Recommend leaves out the memo, to fit.
- Compare drops a score above its hexagon in long cells.
- The Start agent dialog shows the estimate three times, and in German at 720 px high its last line sits one scroll down.
- The guide's last chapter leaves the lower half empty at 1920 × 1080.

### Questions to consider

- Should a replay hold the four figures back until Score, so 77 arrives as a reveal?
- Should the agent, not the recorded run, choose which blocks a person reviews?
- The Serviceportal.NRW's "Sign-in with the BundID" scores 4 while the BundID scores 77: should the screen say that a service's score is not passed on to the services that use it?

### Per screen

- **Header tiles:** stable across cases and themes; the weakest-link tile reads as a sentence, now at 14 px. At 1920 the row leaves room under the name.
- **Score step and key:** criticality in words on every row; long German names wrap. The key's three criticality terms run on in one sentence.
- **Make-ups:** the best trust device in the product; the overall make-up could print its terms ("÷ 5" stands for five layers).
- **Your review:** a clear card, now with the quotes that carry the finding; FIT-Connect's second card sits below the fold at 1280 × 720.
- **Recommend:** the lever, Keep as is and the bar make the choice fair; comparable services now say "weakest critical link", and after the approval the header keeps 77 with "81 if carried out".
- **All services:** the prototype's own row and the services that ended without an assessment are honest; the lead now says the order comes from the overall score, the mean of the layer scores.
- **Compare:** the section rows scan well and now read "0 % of 4 critical"; its "four figures" swap the header's cost for the lower block, so they are not quite the header's four.
- **Serviceportal.NRW:** its note frames a state platform in one line, now as a line, not a card in a card.
- **Step bar:** the person steps carry "your step" for screen readers; light and dark the same.
- **Guide, How to present:** timed and scripted, with the run's figures.
- **Start agent:** the simulation first and free; the live part now at most 68 characters a line.

Questions skipped: delegated run. The critique ran inside the 2.1.0 build, which asks no questions until its pull request; its priority issues went straight to the fixes above.
