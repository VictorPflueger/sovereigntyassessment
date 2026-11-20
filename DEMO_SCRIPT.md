# Sovereignty Assessment: demo script

Version 0.3.0, 20 November 2026. A five-minute demonstration in Simulation, two more minutes for Compare and the Portfolio, which needs no key and no network to the API, with an optional live run at the end. The talk tracks are written in English; in German, switch the interface with DE before you start, and every word on screen follows (brief §5 and §8).

## Pre-flight

1. Open the live site in a current Chrome or Edge on the presentation laptop, on the room's network: https://victorpflueger.github.io/sovereigntyassessment/
2. Choose the language of the audience with EN or DE in the header, or open the address with `?lang=de`.
3. Open **Diagnostics** and click **Run all tests**. Every row should pass: the Anthropic API reachable from this network, the method's golden cases recomputed here, both languages, the key and privacy rules, the catalogue and the reference facts.
4. For Live mode, have a dedicated API key ready in a workspace with a low monthly spend limit. Paste it only when Start agent asks for it; click **Forget key** when you finish on a shared computer.
5. Close the intro window once on the presentation laptop, so it does not open by itself during the talk ("How it works" brings it back).
6. Set the replay speed to ×2 for a five-minute slot (×4 for a three-minute one).

## The five minutes, in Simulation

1. **The question (30 seconds).** "How sovereign is a public service, layer by layer? Here are sixteen German base services and platforms, each with its sources, and this prototype itself." Point at the play sign: eleven of the services carry a pre-run, and so does the prototype.
2. **Start (30 seconds).** Choose **BundID**, click **Start agent**, then **Simulation**. "This replays a run recorded from public sources on 19 November 2026; it says so on the tape, and it calls nothing."
3. **Research (one minute).** The console narrates: the imprint, the data centres, the online ID, the app store. Open one step's details to show a quote and its source. "The model may not write a number. Every figure you see is computed in code; the model can only point at it."
4. **The map (one minute).** The spider diagram fills in by layer; the dashed axis is a layer without evidence, not a zero. Switch to **By building block** and back, and show the honeycomb: the red cell is the AusweisApp's distribution through the App Store, made and run in the US.
5. **Your review (one minute).** The Review tab opens by itself. Correct a block to show that a person can overrule the agent with a reason, and that the score follows at once; or confirm.
6. **The lever (one minute).** The levers are priced on a copy: "offer the app through a marketplace run in the EU" lifts the score, and the assessment itself does not change. Choose it, **Approve**, and open the **Outbox**: the memo and the report are drafts, and nothing is sent.

## Two more minutes: Compare and the Portfolio

1. **Compare (one minute).** Click **Compare** above the map. Choose BundID first and the EUDI Wallet second: the two spider diagrams lie on top of each other, teal and solid against apricot and dashed, and the table beside them gives the same numbers with the difference. "Same method, same engine, two services."
2. **The Portfolio (one minute).** Click **Portfolio**: every loaded assessment as a sorted bar chart, exclusive non-EU control per category, and the Made-in mix as a waffle of hexagons. Point out that the prototype's self-assessment is not in it: it is not a public service. If time allows, save an assessment from the Outbox and load it back with **Load assessment files**.

## "A sovereignty tool on a US model?"

The question comes in most rooms, and the prototype answers it with its own method. Choose **Sovereignty Assessment (this prototype)**, the last entry in the catalogue, and play it.

- **English.** "Yes, and it says so itself. The site is on GitHub Pages, the code on GitHub, both US companies; Live mode runs on Anthropic's Claude API, whose data is stored in the United States, with web search and web fetch on Anthropic's servers. So the score is low, and the weakest critical link is the hosting. What matters for the method: the engine and the Simulation run in your browser without calling the model, every figure is computed in code, and every finding has a source you can check. The lever it proposes is honest too: an EU region of a cloud platform changes where the model runs, not who runs it. And where it does not know something, such as the country of its own maker, it says so instead of assuming Germany."
- **Deutsch.** „Ja, und er sagt es selbst. Die Website liegt auf GitHub Pages, der Code auf GitHub, beides US-Unternehmen; der Live-Modus läuft auf der Claude-API von Anthropic, deren Daten in den Vereinigten Staaten gespeichert werden, mit Websuche und Web-Abruf auf den Servern von Anthropic. Deshalb ist der Wert niedrig, und das schwächste kritische Glied ist das Hosting. Für die Methode zählt: Engine und Simulation laufen in Ihrem Browser, ohne das Modell aufzurufen, jede Zahl wird im Code berechnet, und jeder Befund hat eine Quelle, die Sie prüfen können. Auch der vorgeschlagene Hebel ist ehrlich: Eine EU-Region einer Cloud-Plattform ändert, wo das Modell läuft, nicht, wer es betreibt. Und wo er etwas nicht weiß, etwa das Land seines eigenen Urhebers, sagt er das, statt Deutschland anzunehmen.“

## Optional: a live run

With a key ready, choose **FIT-Connect** or type a service in your own words, **Start agent**, **Live**, paste the key. Point at the run facts under the console: the model calls against the cap of 40 and the cost so far, capped at €3.00. A live run takes a few minutes; the review and the lever wait for you as in the simulation.

## If something goes wrong

- **The API is unreachable** or the key is refused: stay in Simulation, which needs neither.
- **Web search or web fetch is switched off** in the organisation's console: the live run stops with a message that offers Simulation.
- **The audience asks about a service without a pre-run:** run it live, or explain that the pre-runs show the method on real services, and the live agent does the same for any other. For the five catalogue entries without a pre-run, `research/` says what was read and why it is not enough.
- **Someone changed the layer weights:** open **Method** from the header and click **Reset**, or reload the page; the weights are never stored.
