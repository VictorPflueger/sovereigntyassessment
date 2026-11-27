# Sovereignty Assessment: the five-minute demo

Version 2.1.0. **For** a CIO, a head of digitalisation or an IT strategist in government. **Goal:** after five minutes they can repeat one sentence: *"An AI agent found who makes and who runs every part of BundID, from real sources; code scored it 77 out of 100, indicative. No critical block is controlled from outside the EU, and the one block at 0, the App Store, is one BundID runs without."* The German script follows [below](#auf-deutsch).

## The four figures at the top

| Figure | What it shows | In the demo |
|---|---|---|
| Overall score | The layers' mean out of 100, and on how many of six it rests | 77 on 5 of 6 layers, 81 with the lever |
| Weakest critical link | The lowest level the service can't run without; under it, a lower block that isn't critical | Level 3 of 4; the App Store lower, at 0 |
| Exclusive non-EU control | The share of critical blocks run from outside the EU | 0 % of 4 |
| Session cost | What a live run would cost; the replay is free | "A live run would cost ≈ €0.62", "this replay: €0" |

## Before the call

1. Chrome or Edge, full screen (F11), standard zoom; other tabs closed, notifications off.
2. Walk the talk track once. The simulation needs no key and no network.
3. Let the guide open, or start at `?guide=0`. `?step=score` opens a step paused, `?lang=de` in German; EN | DE keeps the step.
4. For a live run, bring your own Anthropic API key from a workspace with a spend limit.

## The five minutes

The guide's last chapter, *Show it in five minutes*. Closing the guide starts Play, which stops wherever you act, at **Your turn**. Space gives a step its minute; → or a clicker moves on, ← goes back.

1. **Understand: point at the four figures.** (1 min)
   “BundID: 77 on 5 of 6 layers, 6 blocks; this replay costs nothing.”
2. **Score: open the App Store block.** It shows who makes and who runs it. (1 min)
   “Weakest critical link: Level 3 of 4; the App Store (0) isn't critical.”
3. **Confirm the findings, then open a starting point.** (1 min)
   “An app marketplace run in the EU would lift the score to 81.”
4. **All services: compare BundID with the ID wallet d-you.** Tick both, then Compare 2. (1 min)
   “BundID 77, the ID wallet 67: Compare puts each layer side by side.”
5. **Open the Serviceportal.NRW.** (1 min)
   “A state's platform, on the same six layers and by the same method: 91.”

## Questions you will get

**Is this an official assessment?** No. It is indicative: public criteria (the Deutschland-Stack's layers, the EU's Cloud Sovereignty Framework) applied to public sources, not an official service of the German Federal Government.

**Why does the tile say 4 of 4 when a block shows 0?** The tile counts only critical blocks, which in FIT-Connect all reach 4. Maven Central, at 0, is important, not critical; the line under the tile names it, and it takes the access layer to 0.

**Are blocks without sources left out?** No. A side without a checked quote counts as unknown and caps its block at 2; a block with neither side known shows as not known, stays out of its layer's sum, and is counted under the tile if critical.

**Why aren't the alternatives ranked?** The comparable services are, by their own scores. A starting point is what a public source names for one block; nobody has assessed it, so the list is alphabetical: for research, not a recommendation.

**Did the replay cost money?** No. It plays the recorded run in the browser and calls no model: "this replay: €0". The euro figure is what a live run on your own key would cost; it stops at your budget, €3 at most.

**Does it work for a state's platform?** Yes. The six layers are the Deutschland-Stack's, and the method applies to a state's platform as to a federal one: the Serviceportal.NRW scores 91 on 5 of 6 layers.

## If something goes wrong

- **The page stays on its loading screen.** It was opened from a file; serve the folder over http.
- **A live run stops early.** The story says why. Start agent, then Play the simulation.
- **The page moved on while you talked.** Press ← to go back; Space pauses.
- **Someone asks for a weaker case.** Open All services: Online payment scores 50, and this prototype, outside the ranking, 17.

## Auf Deutsch

**Für** CIOs, Digitalisierungsverantwortliche und IT-Strategen der Verwaltung. **Ziel:** Nach fünf Minuten können sie einen Satz wiederholen: *„Ein KI-Agent hat aus echten Quellen ermittelt, wer jeden Teil der BundID herstellt und betreibt; Code hat sie mit 77 von 100 bewertet, indikativ. Kein kritischer Baustein wird von außerhalb der EU kontrolliert, und den einzigen auf 0, den App Store, braucht die BundID nicht.“*

### Die fünf Minuten

Das letzte Kapitel des Guides, *In fünf Minuten vorführen*. Schließt der Guide, spielt die Seite ab und hält, wo Sie handeln, bei **Sie sind dran**. Die Leertaste gibt einem Schritt seine Minute; → oder ein Presenter geht weiter, ← zurück.

1. **Verstehen: auf die vier Kennzahlen zeigen.** (1 min)
   „BundID: 77 auf 5 von 6 Ebenen, 6 Bausteine; die Wiedergabe kostet nichts.“
2. **Bewerten: den App-Store-Baustein öffnen.** Er zeigt, wer ihn herstellt und betreibt. (1 min)
   „Schwächstes kritisches Glied: Stufe 3 von 4; der App Store (0) ist nicht kritisch.“
3. **Bestätigen, dann einen Ansatzpunkt öffnen.** (1 min)
   „Ein App-Marktplatz, betrieben in der EU, würde den Wert auf 81 heben.“
4. **Alle Dienste: BundID mit der Wallet d-you vergleichen.** Beide ankreuzen, dann „2 vergleichen“. (1 min)
   „BundID 77, die Wallet 67: Der Vergleich stellt jede Ebene nebeneinander.“
5. **Das Serviceportal.NRW öffnen.** (1 min)
   „Eine Landesplattform, nach derselben Methode auf sechs Ebenen: 91.“

### Fragen, die kommen

**Ist das eine amtliche Bewertung?** Nein. Sie ist indikativ: öffentliche Kriterien (die Ebenen des Deutschland-Stacks, das Cloud Sovereignty Framework der EU), angewandt auf öffentliche Quellen, kein offizielles Angebot der Bundesregierung.

**Warum zeigt die Kachel 4 von 4, wenn ein Baustein 0 hat?** Die Kachel zählt nur kritische Bausteine, und bei FIT-Connect erreichen alle 4. Maven Central, bei 0, ist wichtig, nicht kritisch; die Zeile unter der Kachel nennt es, und es zieht die Zugangsebene auf 0.

**Fallen Bausteine ohne Quellen weg?** Nein. Eine Seite ohne geprüftes Zitat gilt als unbekannt und begrenzt ihren Baustein auf 2; ein Baustein ohne bekannte Seite erscheint als nicht bekannt, fehlt in der Summe seiner Ebene und wird, wenn kritisch, unter der Kachel gezählt.

**Warum sind die Alternativen nicht gereiht?** Die vergleichbaren Dienste sind es, nach ihrem eigenen Wert. Ein Ansatzpunkt ist, was eine öffentliche Quelle für einen Baustein nennt; bewertet hat ihn niemand, also steht die Liste alphabetisch: für die Recherche, nicht als Empfehlung.

**Hat die Wiedergabe Geld gekostet?** Nein. Sie spielt den aufgezeichneten Lauf im Browser ab und ruft kein Modell auf: „diese Wiedergabe: 0 €“. Der Eurobetrag ist, was ein Live-Lauf mit eigenem Schlüssel kosten würde; er hält an Ihrem Budget, höchstens 3 €.

**Funktioniert das auch für die Plattform eines Landes?** Ja. Die sechs Ebenen sind die des Deutschland-Stacks, und die Methode gilt für die Plattform eines Landes wie für eine des Bundes: Das Serviceportal.NRW erreicht 91 auf 5 von 6 Ebenen.
