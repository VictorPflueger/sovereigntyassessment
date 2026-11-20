# Sovereignty Assessment: demo script

Version 0.2.0, 19 November 2026. A five-minute demonstration in Simulation, which needs no key and no network to the API, with an optional live run at the end. The talk tracks are written in English; in German, switch the interface with DE before you start, and every word on screen follows (brief §5 and §8).

## Pre-flight

1. Open the live site in a current Chrome or Edge on the presentation laptop, on the room's network: https://victorpflueger.github.io/sovereigntyassessment/
2. Choose the language of the audience with EN or DE in the header, or open the address with `?lang=de`.
3. Open **Diagnostics** and click **Run all tests**. Every row should pass: the Anthropic API reachable from this network, the method's golden cases recomputed here, both languages, the key and privacy rules, the catalogue and the reference facts.
4. For Live mode, have a dedicated API key ready in a workspace with a low monthly spend limit. Paste it only when Start agent asks for it; click **Forget key** when you finish on a shared computer.
5. Close the intro window once on the presentation laptop, so it does not open by itself during the talk ("How it works" brings it back).
6. Set the replay speed to ×2 for a five-minute slot (×4 for a three-minute one).

## The five minutes, in Simulation

1. **The question (30 seconds).** "How sovereign is a public service, layer by layer? Here are sixteen German base services and platforms, each with its sources." Point at the play sign: six of them carry a pre-run.
2. **Start (30 seconds).** Choose **BundID**, click **Start agent**, then **Simulation**. "This replays a run recorded from public sources on 19 November 2026; it says so on the tape, and it calls nothing."
3. **Research (one minute).** The console narrates: the imprint, the data centres, the online ID, the app store. Open one step's details to show a quote and its source. "The model may not write a number. Every figure you see is computed in code; the model can only point at it."
4. **The map (one minute).** The spider diagram fills in by layer; the dashed axis is a layer without evidence, not a zero. Switch to **By building block** and back, and show the honeycomb: the red cell is the AusweisApp's distribution through the App Store, made and run in the US.
5. **Your review (one minute).** The Review tab opens by itself. Correct a block to show that a person can overrule the agent with a reason, and that the score follows at once; or confirm.
6. **The lever (one minute).** The levers are priced on a copy: "offer the app through a marketplace run in the EU" lifts the score, and the assessment itself does not change. Choose it, **Approve**, and open the **Outbox**: the memo and the report are drafts, and nothing is sent.

## Optional: a live run

With a key ready, choose **FIT-Connect** or type a service in your own words, **Start agent**, **Live**, paste the key. Point at the run facts under the console: the model calls against the cap of 40 and the cost so far, capped at €3.00. A live run takes a few minutes; the review and the lever wait for you as in the simulation.

## If something goes wrong

- **The API is unreachable** or the key is refused: stay in Simulation, which needs neither.
- **Web search or web fetch is switched off** in the organisation's console: the live run stops with a message that offers Simulation.
- **The audience asks about a service without a pre-run:** run it live, or explain that the six pre-runs show the method on real services, and the live agent does the same for any other.
