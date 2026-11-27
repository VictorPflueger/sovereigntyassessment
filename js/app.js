// The presenter: five steps over one case. The simulation replays the case's pre-run at once through the
// agent's own tools (js/simulation.js at full speed) and rests where a person acts; Start agent offers
// it again or a live run with Claude on the visitor's key (js/agent.js, loaded on demand). Both emit the
// same events, which js/run.js digests, js/story.js words and js/view.js draws. Play walks the steps by
// itself, each for its reading time, and stops where the person acts. Keys: Space plays or pauses;
// ← → (a clicker's PageUp and PageDown) and 1 to 5 step by hand. Links: ?case=bundid&step=score opens a
// step, paused. EN | DE switches every word in place: the simulation plays the same run again in the
// other language with the person's decisions, in a fraction of a second; a live run keeps the agent's
// own words in the language it started in. From 2.1.0 every pre-run plays once at the start, with nothing
// stored: All services compares them, Compare sets two or three side by side, and a block, a layer's score
// or the overall score opens how it is made.

import { bus, newRunId } from "./events.js";
import { createSimulationPlayer } from "./simulation.js";
import { MODELS, DEFAULT_MODEL } from "./config.js";
import { t, setLang, getLang, onLang } from "./i18n/index.js";
import { digest, STEP_IDS } from "./run.js";
import { story, eur } from "./story.js";
import { renderStep, renderLog, renderTile, renderMakeup, redraw, h, more } from "./view.js";
import { estimateCost } from "./estimate.js";
import { fmtDate, fmtScore, fmtInt } from "./format.js";
import { overviewModel, compareModel, scoresOf } from "./cases.js";
import { renderOverview, renderCompare } from "./overview.js";

const $ = (id) => document.getElementById(id);
const CATALOGUE = () => window.SA_CATALOGUE.entries;
const RUNS = () => window.SA_RUNS || {};
const FIRST = "bundid";
const IDLE_MS = 4000;
/** The cases the menu offers: every catalogue entry with a pre-run, in the catalogue's order. */
const cases = () => CATALOGUE().filter((e) => RUNS()[e.id]);
const modelName = (id) => MODELS.find((m) => m.id === id)?.label || id;

const player = createSimulationPlayer({ getSpeed: () => Infinity });
/**
 * Every pre-run, played once in this tab with an automatic person (the review confirmed, the first lever and
 * the memo approved): the figures of All services and of the comparable services, and what a live run would
 * cost. Nothing is stored; a reload plays them again.
 */
const played = new Map();
const costs = new Map();
let others = null;
/** What this tab has seen: the cases opened, a live run's result by case, the services picked for Compare. */
const seen = { viewed: new Set(), live: new Map(), picks: [] };
/** The make-up open: its opener and key, and whether a press on that opener is closing it. */
const MK = { opener: null, key: null, sig: "", closing: false };
/** The page: the case, the step, the mode, the run's events and the person's decisions with their times. */
const S = { entry: null, step: 0, mode: "simulation", model: DEFAULT_MODEL, runId: null, events: [], view: null, run: null, live: null, follow: false, frame: 0, decisions: {}, replaying: false, liveLang: null };
/** Play: on, the frame it asked for, the time spent reading the step, the step it timed. */
const P = { on: false, raf: 0, at: 0, last: 0, step: -1 };

export async function start() {
  const q = new URLSearchParams(location.search);
  const entry = cases().find((e) => e.id === q.get("case")) || cases().find((e) => e.id === FIRST);
  const at = STEP_IDS.indexOf(q.get("step"));
  bus.onAny((ev) => {
    if (!ev.run_id || ev.run_id !== S.runId) return;
    S.events.push(ev);
    answer(ev);
    if (!S.replaying) schedule();
  });
  buildCaseMenu();
  bindKeys();
  bindLanguage();
  bindMakeup();
  bindCases();
  bindStart();
  $("play").addEventListener("click", () => (P.on ? pause() : play()));
  $("turn-primary").addEventListener("click", () => act(S.view?.steps[S.step]?.turn?.act || "next"));
  $("turn-second").addEventListener("click", () => act(S.view?.steps[S.step]?.turn?.secondaryAct));
  $("stop").addEventListener("click", () => S.live?.abort());
  $("agent-text").addEventListener("scroll", (e) => more(e.target), { passive: true });
  addEventListener("resize", () => more($("agent-text")), { passive: true });
  document.querySelectorAll("#steps .vc-step__button").forEach((b, i) => b.addEventListener("click", () => go(i)));
  for (const type of ["pointerdown", "keydown", "wheel", "touchstart"]) document.addEventListener(type, nudge, { capture: true, passive: true });
  // The guide opens by itself in a new tab; Play holds while it is open and goes on when it closes,
  // unless a link asked for a step. Start on a guide opened later plays the case.
  let firstClose = true;
  document.addEventListener("vc:guideclose", (e) => {
    if (!e.target?.matches?.("dialog.vc-guide")) return;
    const done = e.detail?.returnValue === "done";
    if (firstClose) { firstClose = false; if (at < 0) play(); }
    else if (done) play();
    if (done && P.on) $("play").focus({ preventScroll: true });
  });
  await playAll();
  await openCase(entry, 0, { boot: true });
  fillGuides();
  // A link to a step opens it, paused, at the furthest step the run has reached.
  if (at >= 0) go(Math.min(at, S.view.steps.findLastIndex((st) => st.ready)), { focus: false });
  if (!document.querySelector("dialog.vc-guide[open]") && at < 0) play();
  window.sovereignty = { S, P, go, play, pause, act, setLanguage, openCase, openOverview, openCompare, seen };
}

// ---- the case: played at once from its pre-run, and again in the other language -------------------------

/** Opens a case at a step: the simulation plays its pre-run until a person has to act. */
async function openCase(entry, step = 0, { boot = false } = {}) {
  pause();
  stopRun();
  S.entry = entry;
  S.mode = "simulation";
  S.step = step;
  S.decisions = {};
  S.liveLang = null;
  seen.viewed.add(entry.id);
  Object.assign(P, { step, at: 0 });
  $("case-name").textContent = t(`p.case.${entry.id}.short`);
  document.querySelectorAll("#case-menu .vc-menu__item").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.case === entry.id)));
  if (!boot) {
    const url = new URL(location.href);
    url.searchParams.set("case", entry.id);
    url.searchParams.delete("step");
    history.replaceState(null, "", url);
  }
  await replay();
  setMode();
  render();
  if (!boot) $("announce").textContent = `${t(`p.case.${entry.id}`)}. ${t("p.announce.step", { n: 1, label: t("p.step.understand") })}`;
}

/**
 * Plays the case's pre-run in the page's language, answering every decision the person has already
 * taken, and resolves once the run waits for the person or has ended. The screen keeps what it shows
 * until then, so a language switch never flashes an empty step.
 */
async function replay() {
  const def = RUNS()[S.entry.id];
  stopRun();
  S.replaying = true;
  S.events = [];
  S.runId = newRunId();
  bus.beginRun({ run_id: S.runId, mode: "simulation" });
  bus.emit("run_start", { run_id: S.runId, mode: "simulation", query: def.query, entry_id: def.entry_id, lang: getLang(), source: def.source, as_of: def.as_of });
  bus.emit("state_change", { state: "understanding" });
  player.play(structuredClone(def), { lang: getLang(), service: def.query, mode: "simulation" });
  await rested(S.runId);
  S.replaying = false;
}

/** Resolves once the run of runId waits for the person or has ended. */
function rested(runId, limit = 15000) {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      if (S.runId !== runId) return resolve();
      const r = digest(S.events);
      const waiting = (r.choice && !r.chosen) || (r.review && !r.reviewed) || (r.levers && !r.decision) || (r.memo && r.memo.status === "pending");
      if (waiting || r.end || Date.now() - t0 > limit) resolve();
      else setTimeout(check, 10);
    };
    check();
  });
}

/** A decision the person has already taken goes back to the replayed run as soon as it asks. */
function answer(ev) {
  if (S.mode !== "simulation") return;
  const p = ev.payload || {};
  const d = S.decisions;
  if (ev.type === "choice_request" && d.choice) queueMicrotask(() => bus.emit("choice_decision", { request_id: p.request_id, chosen: d.choice.chosen, by: "user" }));
  if (ev.type === "review_request" && d.review) queueMicrotask(() => bus.emit("review_decision", { request_id: p.request_id, action: d.review.action, by: "user" }));
  if (ev.type === "levers" && d.lever) queueMicrotask(() => bus.emit("lever_decision", { options_seq: p.options_seq, lever_id: d.lever.lever_id, by: "user" }));
  if (ev.type === "action_draft" && d.memo) queueMicrotask(() => bus.emit("action_decision", { action_id: p.action_id, decision: d.memo.decision, by: "user" }));
}

function stopRun() {
  if (player.isActive()) player.abort();
  if (S.live?.isActive()) S.live.abort();
  S.live = null;
  bus.endRun();
}

// ---- the person's acts ----------------------------------------------------------------------------------

/** What the bar's buttons do: go on, or the person's own decision at this step. */
function act(what) {
  const r = S.run;
  if (!r) return;
  const at = new Date().toISOString();
  switch (what) {
    case "next": return go(S.step + 1, { keep: true });
    case "replay": return openCase(S.entry, 0).then(play);
    case "choose": return choose(0);
    case "confirm":
      if (!r.review || r.reviewed) return;
      S.decisions.review = { action: "confirm", at };
      bus.emit("review_decision", { request_id: r.review.request_id, action: "confirm", by: "user" });
      break;
    case "approve": return approve(r.levers?.levers?.[0]?.lever_id);
    case "keep": return approve("keep");
    case "memo-approve":
    case "memo-reject":
      if (!r.memo || r.memo.status !== "pending") return;
      S.decisions.memo = { decision: what === "memo-approve" ? "approved" : "rejected", at };
      bus.emit("action_decision", { action_id: r.memo.action_id, decision: S.decisions.memo.decision, by: "user" });
      break;
    default: return;
  }
  // The step's new words get their reading time before Play moves on.
  P.at = 0;
  focusStory();
}

function approve(leverId) {
  const r = S.run;
  if (!leverId || !r?.levers || r.decision) return;
  S.decisions.lever = { lever_id: leverId, at: new Date().toISOString() };
  bus.emit("lever_decision", { options_seq: r.levers.options_seq, lever_id: leverId, by: "user" });
  P.at = 0;
  focusStory();
}

function choose(index) {
  const r = S.run;
  if (!r?.choice || r.chosen) return;
  S.decisions.choice = { chosen: index, at: new Date().toISOString() };
  bus.emit("choice_decision", { request_id: r.choice.request_id, chosen: index, by: "user" });
  P.at = 0;
}

/** After a decision the focus goes to the step's title, which now says what happened. */
function focusStory() {
  requestAnimationFrame(() => $("story-title").focus({ preventScroll: true }));
}

// ---- steps ---------------------------------------------------------------------------------------------

/** Shows step i. A step the presenter chooses pauses Play (keep: Next and Play itself go on playing). */
function go(i, { focus = true, keep = false } = {}) {
  if (!keep) pause();
  if (!S.view) return;
  const target = Math.max(0, Math.min(STEP_IDS.length - 1, i));
  if (!S.view.steps[target].ready) return;
  S.step = target;
  if (P.step !== S.step) Object.assign(P, { step: S.step, at: 0 });
  if (S.mode === "live") S.follow = S.step >= (S.run?.reached ?? 0);
  const url = new URL(location.href);
  url.searchParams.set("case", S.entry.id);
  url.searchParams.set("step", STEP_IDS[S.step]);
  history.replaceState(null, "", url);
  render();
  const shown = S.view.steps[S.step];
  $("announce").textContent = `${t("p.announce.step", { n: S.step + 1, label: shown.label })}${shown.turn ? ` ${t("p.turn.lead")} ${shown.turn.text}` : ""}`;
  fill(0);
  nudge();
  // The step's title takes the focus, so a screen reader reads where the presenter is.
  if (focus) $("story-title").focus({ preventScroll: true });
}

function schedule() {
  if (S.frame) return;
  S.frame = requestAnimationFrame(() => { S.frame = 0; render(); });
}

function render() {
  if (!S.entry) return;
  const run = digest(S.events);
  // The decision log keeps the time the person decided, not the time a replay answered for them.
  for (const e of run.log) {
    const d = S.decisions[e.kind === "lever" ? "lever" : e.kind];
    if (d?.at && e.kind !== "report") e.at = d.at;
  }
  const lang = getLang();
  const view = story({ run, lang, mode: S.mode, entry: S.entry, others });
  view.mode = S.mode;
  view.runLang = run.lang;
  S.run = run;
  S.view = view;
  if (S.mode === "live" && S.follow && S.step < run.reached) S.step = run.reached;
  view.steps.forEach((st, i) => {
    const li = document.querySelector(`#steps .vc-step[data-step="${st.id}"]`);
    li.classList.toggle("vc-step--current", i === S.step);
    li.classList.toggle("vc-step--done", i < S.step && st.ready);
    const b = li.querySelector("button");
    if (i === S.step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    b.disabled = !st.ready;
    li.dataset.waits = String(!!st.waits);
    li.dataset.person = String(st.person);
    li.dataset.needed = String(st.needed);
    li.querySelector(".vc-step__label").textContent = st.label;
  });
  const step = view.steps[S.step];
  renderStep(step, view, { choose, approve });
  renderLog(S.step >= 3 ? view.log : []);
  const alert = $("story-alert");
  const stopped = view.ended && S.mode === "live";
  alert.hidden = !stopped;
  alert.textContent = stopped ? liveEndText(run) : "";
  const working = S.mode === "live" && S.live?.isActive() && !step.waits ? workingText(run) : "";
  $("story-working").hidden = !working;
  $("story-working-text").textContent = working;
  kpis(view, run);
  refreshMakeup();
  document.body.dataset.step = step.id;
  drawPlay();
  drawBar();
  // At the end the decision log opens once by itself: it is the record a customer asks about.
  if (finished() && S.logShown !== S.runId) { S.logShown = S.runId; $("log").open = true; }
}

// ---- Play: the steps go by themselves and stop where the person acts ------------------------------------

/** The story is over: the last step reached and nothing left for the person to do. */
function finished() {
  if (!S.view) return false;
  const last = S.view.steps.findLastIndex((st) => st.ready);
  const step = S.view.steps[S.step];
  return S.step === last && !step.waits && !!S.run?.end;
}
/** A dialog, the case menu or a make-up covers the page: Play holds its time until it closes. */
function covered() {
  if (document.querySelector("dialog[open]")) return true;
  try { return $("case-menu").matches(":popover-open") || $("makeup").matches(":popover-open"); } catch { return false; }
}

function play() {
  if (S.mode === "live") return;
  // Replay: the case again from the start, with its decisions open again.
  if (finished()) { openCase(S.entry, 0).then(play); return; }
  P.on = true;
  P.last = 0;
  $("turn-primary").classList.remove("vc-attention");
  drawPlay();
  drawBar();
  if (!P.raf) P.raf = requestAnimationFrame(frame);
}

function pause() {
  if (!P.on) return;
  P.on = false;
  cancelAnimationFrame(P.raf);
  P.raf = 0;
  fill(0);
  drawPlay();
  drawBar();
  nudge();
}

function frame(now) {
  P.raf = 0;
  if (!P.on) return;
  // Time away from the tab (or a slow frame) does not count.
  const dt = P.last ? Math.min(now - P.last, 100) : 0;
  P.last = now;
  if (S.view) {
    if (P.step !== S.step) Object.assign(P, { step: S.step, at: 0 });
    const step = S.view.steps[S.step];
    const next = S.view.steps[S.step + 1];
    if (step.waits) {
      // The person's turn: Play waits; once they have acted, the step's new words get their reading time.
      P.at = 0;
    } else if (!next || !next.ready) {
      // The story is over, or its next step will not come: Play ends. While the run still goes on (the
      // memo after the lever, a step still being written), Play holds and waits for it.
      if (finished() || (next && !next.needed)) { pause(); return; }
      P.at = 0;
    } else if (!covered()) {
      P.at += dt;
      if (P.at >= step.read) {
        go(S.step + 1, { focus: false, keep: true });
        P.raf = requestAnimationFrame(frame);
        return;
      }
    }
    fill(step.waits ? 0 : P.at / step.read);
    drawBar();
  }
  P.raf = requestAnimationFrame(frame);
}

/** How far the current step is read: the line to the next step and the bar in the button fill with it. */
function fill(p) {
  const v = Math.max(0, Math.min(1, p)).toFixed(4);
  document.querySelectorAll("#steps .vc-step").forEach((li, i) => li.style.setProperty("--vc-step-fill", i === S.step ? v : "0"));
  $("turn-primary").style.setProperty("--fill", v);
}

/** Play, Pause or Replay; in a live run the page follows the agent, so Stop takes Play's place. */
function drawPlay() {
  const b = $("play");
  b.hidden = S.mode === "live";
  const state = P.on ? "pause" : finished() ? "replay" : "play";
  b.dataset.state = state;
  b.querySelector(".vc-icon").className = `vc-icon vc-icon--${state === "pause" ? "pause" : state === "replay" ? "refresh" : "play"}`;
  $("play-text").textContent = t(`p.play.${state}`);
}

/**
 * The bar under the story asks for the next click where the eye is. Where the person acts, it says so
 * ("Your turn") and holds their decision; while Play reads a step, it says when the page moves on; paused,
 * it is the person's turn to go on. Its one dark button draws the eye until it is pressed.
 */
function drawBar() {
  if (!S.view) return;
  const step = S.view.steps[S.step];
  const next = S.view.steps[S.step + 1];
  const bar = $("turn");
  const primary = $("turn-primary");
  const second = $("turn-second");
  let state;
  let lead;
  let what;
  let label;
  let secondLabel = null;
  if (step.waits && step.turn) {
    state = "turn"; lead = t("p.turn.lead"); what = step.turn.text; label = step.turn.primary; secondLabel = step.turn.secondary || null;
  } else if (S.mode === "live" && S.live?.isActive() && !(next && next.ready && S.step < (S.run?.reached ?? 0))) {
    state = "working"; lead = t("p.bar.working"); what = workingText(S.run) || ""; label = null;
  } else if (finished() || !next || !next.ready) {
    state = "done"; lead = t("p.bar.done"); what = S.run?.notService ? t("p.bar.done.none") : S.run?.end ? t("p.bar.done.text") : ""; label = S.mode === "live" ? null : t("p.act.replay");
  } else if (P.on) {
    state = "playing"; lead = t("p.bar.playing", { s: Math.max(1, Math.ceil((step.read - P.at) / 1000)) }); what = ""; label = t("p.act.next", { label: next.label });
  } else {
    state = "turn"; lead = t("p.turn.lead"); what = t("p.turn.next", { label: next.label }); label = t("p.act.next", { label: next.label });
  }
  bar.dataset.state = state;
  if ($("turn-lead").textContent !== lead) $("turn-lead").textContent = lead;
  if ($("turn-what").textContent !== what) $("turn-what").textContent = what;
  primary.hidden = !label;
  if (label && $("turn-primary-text").textContent !== label) $("turn-primary-text").textContent = label;
  primary.dataset.act = step.waits && step.turn ? step.turn.act : state === "done" ? "replay" : "next";
  primary.classList.toggle("next", primary.dataset.act === "next");
  primary.classList.toggle("vc-button--secondary", state === "done");
  second.hidden = !secondLabel;
  if (secondLabel) second.textContent = secondLabel;
  // Where the person decides, the button draws the eye at once; paused elsewhere, after a few idle seconds.
  if (step.waits && step.turn) primary.classList.add("vc-attention");
  else if (state !== "turn") primary.classList.remove("vc-attention");
}

/** Paused, the primary action draws the eye after a few seconds without a click, a key or a scroll. */
let idle = 0;
function nudge() {
  clearTimeout(idle);
  const step = S.view?.steps[S.step];
  if (!(step?.waits && step.turn)) $("turn-primary").classList.remove("vc-attention");
  idle = setTimeout(() => {
    const b = $("turn-primary");
    if (!P.on && !b.hidden && $("turn").dataset.state === "turn" && !covered()) b.classList.add("vc-attention");
  }, IDLE_MS);
}

// ---- the key figures --------------------------------------------------------------------------------------

function kpis(view, run) {
  const k = view.kpis;
  renderTile($("kpi-score"), k.score);
  renderTile($("kpi-weakest"), k.weakest);
  renderTile($("kpi-exclusive"), k.exclusive);
  const lang = getLang();
  // A replay costs nothing: its label says the figure is what a live run of the case would cost, and a live
  // run shows what it cost under Session cost (D6, the brief's default since the cold read).
  const live = S.mode === "live";
  $("kpi-cost").querySelector(".vc-stat__label").textContent = t(live ? "p.kpi.cost.label" : "p.kpi.cost.would");
  renderTile($("kpi-cost"), live
    ? { value: eur(run.cost?.eur || 0, lang), note: t("p.kpi.cost.measured", { model: modelName(S.model) }) }
    : { value: `≈\u00a0${eur(costOf(S.entry.id).eur, lang)}`, note: t("p.kpi.cost.replay") });
}

// ---- every pre-run, played once -----------------------------------------------------------------------------

/** Plays every case's pre-run in turn before the first screen; about 20 ms a case. */
async function playAll() {
  for (const e of cases()) if (!played.has(e.id)) played.set(e.id, await playOnce(e));
  others = scoresOf(cases().map((e) => ({ entry: e, def: RUNS()[e.id], run: played.get(e.id).run })));
}

/** One pre-run to its end in English, with every decision answered: its events and their digest. */
async function playOnce(entry) {
  const def = RUNS()[entry.id];
  const runId = `play-${entry.id}`;
  const events = [];
  const off = bus.onAny((ev) => {
    if (ev.run_id !== runId) return;
    events.push(ev);
    const p = ev.payload || {};
    if (ev.type === "choice_request") queueMicrotask(() => bus.emit("choice_decision", { request_id: p.request_id, chosen: 0, by: "user" }));
    if (ev.type === "review_request") queueMicrotask(() => bus.emit("review_decision", { request_id: p.request_id, action: "confirm", by: "user" }));
    if (ev.type === "levers") queueMicrotask(() => bus.emit("lever_decision", { options_seq: p.options_seq, lever_id: p.levers[0]?.lever_id || "keep", by: "user" }));
    if (ev.type === "action_draft") queueMicrotask(() => bus.emit("action_decision", { action_id: p.action_id, decision: "approved", by: "user" }));
  });
  bus.beginRun({ run_id: runId, mode: "simulation" });
  try {
    bus.emit("run_start", { run_id: runId, mode: "simulation", query: def.query, entry_id: def.entry_id, lang: "en", source: def.source, as_of: def.as_of });
    await player.play(structuredClone(def), { lang: "en", service: def.query, mode: "simulation" });
  } finally {
    off();
    bus.endRun();
  }
  return { events, run: digest(events) };
}

/** What a live run of the case would cost with a model, estimated from its whole pre-run in English. */
function costOf(id, modelId = DEFAULT_MODEL) {
  const key = `${id}|${modelId}`;
  if (!costs.has(key)) {
    const def = RUNS()[id];
    costs.set(key, estimateCost({ events: played.get(id)?.events || [], lang: "en", query: def.query, entryId: def.entry_id, today: fmtDate(def.as_of, "en"), modelId }));
  }
  return costs.get(key);
}

// ---- the guides' figures: the BundID case, from the engine ---------------------------------------------

/**
 * Writes the default case's figures into the guide of the page's language (data-fig), from the run the
 * tiles show; the lever figure comes from the whole run the cost estimate plays. Names are in the run's
 * language, so the other guide is filled when the page switches to it.
 */
function fillGuides(lang = getLang()) {
  if (S.entry.id !== FIRST || !S.run) return;
  const v = story({ run: S.run, lang, mode: "simulation", entry: S.entry });
  const k = v.kpis;
  const r = S.run;
  const events = played.get(FIRST)?.events || [];
  const review = events.findIndex((e) => e.type === "review_request");
  const early = review < 0 ? events : events.slice(0, review);
  const res = r.score?.result;
  const lever = played.get(FIRST)?.run?.levers?.levers?.[0];
  const overall = lever?.whatif?.facts?.[`whatif.${lever.lever_id}.overall`];
  const figs = {
    score: k.score.value, layers: k.score.of.trim(), weakest: `${k.weakest.value} ${k.weakest.of}`.trim(), "weakest-name": k.weakest.note,
    exclusive: k.exclusive.value, critical: String(res ? res.blocks.filter((b) => b.criticality === "critical" && !b.unscored).length : ""),
    cost: eur(costOf(FIRST).eur, lang), blocks: String(r.blockList.length || ""),
    // What the research read and kept before Your review, as the Research step says it: counted in the
    // pre-run as played once at start, so the figure does not change while the replay on screen moves on.
    pages: String(new Set(early.filter((e) => e.type === "research_step" && e.payload?.kind === "fetch" && e.payload?.ok).map((e) => e.payload.url)).size || ""),
    quotes: String(new Set(early.filter((e) => e.type === "evidence_check" && e.payload?.verified && e.payload?.quote).map((e) => `${e.payload.url}|${e.payload.quote}`)).size || ""),
    lever: Number.isFinite(overall) ? String(Math.round(overall)) : "",
    "as-of": fmtDate(RUNS()[FIRST].as_of, lang),
    // What the tile leaves out, the critical blocks no source names, and the free replay (2.1.0).
    lowest: k.weakest.also?.find((a) => a.kind === "lower")?.text || "", unknown: v.unknownCritical === null ? "" : String(v.unknownCritical),
    "lowest-level": ((x) => (Number.isFinite(x) ? fmtInt(x, lang) : ""))(k.weakest.also?.find((a) => a.kind === "lower")?.level),
    replay: t("p.kpi.cost.replay", null, lang)
  };
  // The other cases the talk track names, from their own pre-runs: score@id and layers@id.
  const other = (key) => {
    const [what, id] = key.split("@");
    const o = others?.[id];
    if (!o || o.notService) return "";
    return what === "score" ? fmtScore(o.overall, lang) : t("p.kpi.layers", { n: o.layers }, lang);
  };
  document.querySelectorAll(`#guide-${lang} [data-fig]`).forEach((el) => {
    const value = el.dataset.fig.includes("@") ? other(el.dataset.fig) : figs[el.dataset.fig];
    if (value) el.textContent = value;
  });
}

// ---- cases, keys, mode, language --------------------------------------------------------------------------

function buildCaseMenu() {
  const groups = [["base_service", "p.menu.base"], ["platform_or_access", "p.menu.platform"], ["self_assessment", "p.menu.self"]];
  const items = [];
  for (const [cat, key] of groups) {
    const list = cases().filter((e) => e.category === cat);
    if (!list.length) continue;
    items.push(h("p", { class: "vc-menu__label", dataset: { i18n: key } }, t(key)));
    for (const e of list) {
      items.push(h("button", { type: "button", class: "vc-menu__item", role: "menuitemradio", "aria-checked": "false", dataset: { case: e.id }, onclick: () => { $("case-menu").hidePopover?.(); openCase(e, 0).then(play); } },
        h("span", { class: "case-item" }, h("span", { class: "case-item-title", dataset: { i18n: `p.case.${e.id}` } }, t(`p.case.${e.id}`)), h("span", { class: "case-item-tip", dataset: { i18n: `p.case.${e.id}.tip` } }, t(`p.case.${e.id}.tip`)))));
    }
  }
  // Every case side by side, one click from the menu too (SA-04).
  items.push(h("p", { class: "vc-menu__label", dataset: { i18n: "p.menu.all" } }, t("p.menu.all")),
    h("button", { type: "button", class: "vc-menu__item case-all", role: "menuitem", onclick: () => { $("case-menu").hidePopover?.(); openOverview(); } },
      h("span", { class: "case-item" }, h("span", { class: "case-item-title", dataset: { i18n: "p.ov.open" } }, t("p.ov.open")), h("span", { class: "case-item-tip", dataset: { i18n: "p.menu.all.tip" } }, t("p.menu.all.tip")))));
  $("case-menu").replaceChildren(...items);
  $("case-menu").addEventListener("toggle", (e) => $("case-button").setAttribute("aria-expanded", String(e.newState === "open")));
}

function bindKeys() {
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || document.querySelector("dialog[open]") || e.target.closest?.("input, select, textarea, [popover]")) return;
    // Space plays or pauses, unless it presses the button that has the focus.
    if (e.key === " ") {
      if (e.target.closest?.("button, a, summary, [role=button]")) return;
      e.preventDefault();
      if (!e.repeat) (P.on ? pause() : play());
      return;
    }
    const n = Number(e.key);
    // A clicker sends the arrow keys or PageDown and PageUp.
    if (e.key === "ArrowRight" || e.key === "PageDown") go(S.step + 1);
    else if (e.key === "ArrowLeft" || e.key === "PageUp") go(S.step - 1);
    else if (n >= 1 && n <= 5) go(n - 1);
    else return;
    e.preventDefault();
  });
}

/** EN | DE: every word switches in place; the simulation plays the same run again in the new language. */
function bindLanguage() {
  document.querySelectorAll(".lang-option").forEach((b) => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
  onLang(() => drawLanguage());
  drawLanguage();
}

async function setLanguage(lang) {
  if (lang === getLang()) return;
  setLang(lang);
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
  if (S.mode === "simulation" && S.entry) {
    const keepStep = S.step;
    const keepAt = P.at;
    await replay();
    S.step = keepStep;
    P.at = keepAt;
  }
  redraw();
  render();
  fillGuides(lang);
  if ($("overview").open) drawOverview();
  if ($("cmp").open) drawCompare();
  if ($("start-dialog").open) fillStart();
  $("announce").textContent = t("p.announce.lang");
}

function drawLanguage() {
  const lang = getLang();
  document.documentElement.setAttribute("lang", lang === "de" ? "de" : "en-GB");
  document.documentElement.dataset.lang = lang;
  document.querySelectorAll(".lang-option").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  for (const b of document.querySelectorAll("[data-vc-guide-open]")) b.hidden = b.dataset.vcGuideOpen !== `guide-${lang}`;
  if (S.entry) $("case-name").textContent = t(`p.case.${S.entry.id}.short`);
  setMode();
  redraw();
}

/** SIMULATION or LIVE in the header; the agent's words say whether they are replayed or live. */
function setMode() {
  const live = S.mode === "live";
  const running = live && !!S.live?.isActive();
  $("mode-text").textContent = live ? "LIVE" : "SIMULATION";
  $("mode-tag").dataset.mode = live ? "live" : "simulation";
  $("tip-mode").textContent = live ? t("p.mode.live.tip", { model: modelName(S.model) }) : t("p.mode.sim.tip", { date: S.entry ? fmtDate(RUNS()[S.entry.id].as_of) : "" });
  $("agent-note").textContent = live ? t("p.agent.live", { model: modelName(S.model) }) : t("p.agent.replayed");
  $("stop").hidden = !running;
  $("start").hidden = running;
}

// ---- how a figure is made: one popover for a block, a layer's score or the overall score ----------------

function bindMakeup() {
  const pop = $("makeup");
  // A press on the opener of the make-up already open closes it, and the click that follows stays closed.
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest?.("[data-makeup]");
    MK.closing = !!b && pop.matches(":popover-open") && b.dataset.makeup === MK.key;
  }, { capture: true });
  document.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-makeup]");
    if (!b) return;
    if (MK.closing) { MK.closing = false; return; }
    if (pop.matches(":popover-open") && b.dataset.makeup === MK.key) { pop.hidePopover(); return; }
    openMakeup(b);
  });
  pop.addEventListener("beforetoggle", (e) => {
    if (e.newState !== "closed") return;
    const back = MK.opener;
    back?.setAttribute("aria-expanded", "false");
    Object.assign(MK, { opener: null, key: null, sig: "" });
    // Esc or a click outside: the focus goes back to what opened it, unless the click put it elsewhere.
    const at = document.activeElement;
    if (back?.isConnected && (!at || at === document.body || pop.contains(at))) back.focus({ preventScroll: true });
  });
  addEventListener("resize", () => { if (MK.opener) place(pop, MK.opener); }, { passive: true });
}

function openMakeup(b) {
  const m = S.view?.makeups?.[b.dataset.makeup];
  const pop = $("makeup");
  if (!m) return;
  if (pop.matches(":popover-open")) pop.hidePopover();
  renderMakeup(pop, m);
  Object.assign(MK, { opener: b, key: b.dataset.makeup, sig: JSON.stringify(m) });
  pop.showPopover();
  b.setAttribute("aria-expanded", "true");
  place(pop, b);
  pop.focus({ preventScroll: true });
}

/** After a render the make-up follows its opener, and its words the language. */
function refreshMakeup() {
  const pop = $("makeup");
  if (!MK.key || !pop.matches(":popover-open")) return;
  const m = S.view?.makeups?.[MK.key];
  if (!m) { pop.hidePopover(); return; }
  const sig = JSON.stringify(m);
  if (sig !== MK.sig) { renderMakeup(pop, m); MK.sig = sig; }
  const b = document.querySelector(`[data-makeup="${MK.key}"]`);
  if (b && b !== MK.opener) { MK.opener = b; b.setAttribute("aria-expanded", "true"); }
  if (MK.opener?.isConnected) place(pop, MK.opener);
}

/** Under its opener, or above it where the window ends; never outside the window. */
function place(pop, b) {
  const r = b.getBoundingClientRect();
  const w = pop.offsetWidth;
  const ht = pop.offsetHeight;
  let top = r.bottom + 6;
  if (top + ht > innerHeight - 8) top = r.top - 6 - ht >= 8 ? r.top - 6 - ht : Math.max(8, innerHeight - 8 - ht);
  pop.style.left = `${Math.round(Math.min(Math.max(8, r.left), innerWidth - w - 8))}px`;
  pop.style.top = `${Math.round(top)}px`;
}

// ---- All services and Compare ---------------------------------------------------------------------------------

/** Every case with its pre-run's result, and after it a live run of this tab, if one assessed it. */
function allCases() {
  return cases().flatMap((e) => {
    const list = [{ entry: e, def: RUNS()[e.id], run: played.get(e.id)?.run }];
    const live = seen.live.get(e.id);
    if (live) list.push({ entry: e, def: RUNS()[e.id], run: live.run, asOf: live.at, live: true });
    return list;
  });
}

function bindCases() {
  $("overview-open").addEventListener("click", openOverview);
  $("ov-cmp").addEventListener("click", () => openCompare(seen.picks));
  $("cmp-all").addEventListener("click", openOverview);
  $("overview-body").addEventListener("change", (e) => {
    const box = e.target.closest?.("[data-pick]");
    if (!box) return;
    const k = box.dataset.pick;
    seen.picks = box.checked ? [...seen.picks.filter((x) => x !== k), k].slice(-3) : seen.picks.filter((x) => x !== k);
    syncPicks();
  });
  $("cmp-body").addEventListener("click", (e) => {
    const k = e.target.closest?.("[data-remove]")?.dataset.remove;
    if (!k) return;
    seen.picks = seen.picks.filter((x) => x !== k);
    drawCompare();
    $("cmp-body").querySelector(".ov-open")?.focus();
  });
  // A service's name opens it, from the overview, Compare or the comparable services; Compare with sets
  // the case beside the one shown.
  document.addEventListener("click", (e) => {
    const open = e.target.closest?.("[data-open-case]");
    const other = e.target.closest?.("[data-cmp-with]");
    if (open) {
      const entry = cases().find((c) => c.id === open.dataset.openCase);
      if (!entry) return;
      for (const d of [$("overview"), $("cmp")]) if (d.open) d.close();
      openCase(entry, 0).then(play);
    } else if (other) openCompare([S.entry.id, other.dataset.cmpWith]);
  });
}

function openOverview() {
  if ($("cmp").open) $("cmp").close();
  drawOverview();
  if (!$("overview").open) $("overview").showModal();
}

function drawOverview() {
  renderOverview($("overview-body"), overviewModel({ cases: allCases(), lang: getLang(), viewed: seen.viewed }), seen.picks);
  syncPicks();
}

/** The picks for Compare: two or three; the button says how many. */
function syncPicks() {
  for (const b of $("overview-body").querySelectorAll("[data-pick]")) {
    b.checked = seen.picks.includes(b.dataset.pick);
    b.disabled = !b.checked && seen.picks.length >= 3;
  }
  const n = seen.picks.length;
  $("ov-cmp").disabled = n < 2;
  $("ov-cmp-text").textContent = n < 2 ? t("p.ov.compare.none") : t("p.ov.compare.n", { n });
}

function openCompare(keys) {
  seen.picks = [...new Set(keys)].slice(0, 3);
  if (seen.picks.length < 2) { openOverview(); return; }
  if ($("overview").open) $("overview").close();
  drawCompare();
  if (!$("cmp").open) $("cmp").showModal();
}

function drawCompare() {
  if (seen.picks.length < 2) { $("cmp").close(); openOverview(); return; }
  const m = compareModel({ cases: allCases(), keys: seen.picks, lang: getLang() });
  $("cmp-title").textContent = m.title;
  renderCompare($("cmp-body"), m);
}

// ---- Start agent: the simulation again, or a live run in Vici's live-run dialog ------------------------------

function bindStart() {
  $("start").addEventListener("click", openStart);
  $("start-sim").addEventListener("click", () => { $("start-dialog").close(); openCase(S.entry, 0).then(play); });
  $("live-start").addEventListener("click", startLive);
  $("live-show").addEventListener("click", () => showKey($("live-show").getAttribute("aria-pressed") !== "true"));
  $("live-forget").addEventListener("click", async () => {
    (await import("./keystore.js")).forgetKey();
    S.keyHeld = "";
    fillStart();
    $("live-key").focus();
  });
  for (const id of ["live-key", "live-cap", "live-model", "live-ack"]) $(id).addEventListener("input", drawLive);
  $("live-ack").addEventListener("change", drawLive);
  // The key is typed into no form: Enter in it starts the run, once the box is ticked.
  $("live-key").addEventListener("keydown", (e) => { if (e.key === "Enter" && !$("live-start").disabled) { e.preventDefault(); startLive(); } });
}

async function openStart() {
  pause();
  const { getKey, maskKey } = await import("./keystore.js");
  S.keyHeld = getKey() ? maskKey() : "";
  $("live-msg").textContent = "";
  $("live-key").value = "";
  $("live-ack").checked = false;
  showKey(false);
  fillStart();
  $("start-dialog").showModal();
  $("start-sim").focus();
}

/** The dialog's words for the case, the models with what a run would cost, and the key in memory. */
function fillStart() {
  const lang = getLang();
  const name = t(`p.case.${S.entry.id}.short`);
  $("start-sim-text").textContent = t("p.start.sim.text", { service: name, date: fmtDate(RUNS()[S.entry.id].as_of) });
  $("live-text").textContent = t("p.start.live.text", { service: name });
  const model = $("live-model").value || S.model;
  $("live-model").replaceChildren(...MODELS.map((m) => h("option", { value: m.id, selected: m.id === model }, t("p.start.model", { model: m.label, cost: eur(costOf(S.entry.id, m.id).eur, lang) }))));
  $("live-current").hidden = !S.keyHeld;
  $("live-masked").textContent = S.keyHeld || "";
  drawLive();
}

/** The cap's value, the estimate against it, and Start: it waits for a key and the acknowledgement. */
function drawLive() {
  const lang = getLang();
  const cap = Number($("live-cap").value);
  const model = $("live-model").value || S.model;
  const cost = costOf(S.entry.id, model).eur;
  $("live-cap-value").textContent = eur(cap, lang);
  $("live-estimate").textContent = `${t("p.start.estimate", { service: t(`p.case.${S.entry.id}.short`), model: modelName(model), cost: eur(cost, lang) })}${cost > cap ? ` ${t("p.start.overCap")}` : ""}`;
  $("live-start").disabled = !$("live-ack").checked || !($("live-key").value.trim() || S.keyHeld);
}

function showKey(on) {
  const b = $("live-show");
  $("live-key").type = on ? "text" : "password";
  b.setAttribute("aria-pressed", String(on));
  b.setAttribute("aria-label", t(on ? "p.start.hide" : "p.start.show"));
  b.querySelector(".vc-icon").className = `vc-icon vc-icon--${on ? "eye-off" : "eye"}`;
}

async function startLive() {
  const msg = $("live-msg");
  const typed = $("live-key").value.trim();
  const framed = (() => { try { return window.top !== window.self; } catch { return true; } })();
  const { looksLikeKey, setKey, getKey, forgetKey } = await import("./keystore.js");
  const key = typed || getKey();
  msg.className = "vc-help vc-help--error";
  if (framed) { msg.textContent = t("p.live.framed"); return; }
  if (!$("live-ack").checked) { msg.textContent = t("p.start.noAck"); $("live-ack").focus(); return; }
  if (!key) { msg.textContent = t("p.live.noKey"); $("live-key").focus(); return; }
  if (!looksLikeKey(key)) { msg.textContent = t("p.live.badKey"); $("live-key").focus(); return; }
  $("live-start").disabled = true;
  msg.className = "vc-help";
  msg.textContent = t("p.live.checking");
  const { checkKey } = await import("./anthropic.js");
  const check = await checkKey(key);
  drawLive();
  msg.className = "vc-help vc-help--error";
  if (!check.ok) {
    msg.textContent = check.status === 0 ? t("p.live.unreachable") : check.status === 401 ? t("p.live.rejected") : t("p.live.other", { status: check.status });
    return;
  }
  setKey(key);
  const budgetEur = Number($("live-cap").value);
  S.model = $("live-model").value;
  $("start-dialog").close();
  $("live-key").value = "";
  pause();
  stopRun();
  const { createLiveAgent } = await import("./agent.js");
  S.mode = "live";
  S.step = 0;
  S.follow = true;
  S.events = [];
  S.decisions = {};
  S.liveLang = getLang();
  S.runId = newRunId();
  bus.beginRun({ run_id: S.runId, mode: "live" });
  const def = RUNS()[S.entry.id];
  const entry = S.entry;
  const runId = S.runId;
  bus.emit("run_start", { run_id: S.runId, mode: "live", query: def.query, entry_id: S.entry.id, lang: getLang(), model: S.model });
  const agent = createLiveAgent({ onKeyRejected: () => { forgetKey(); S.keyHeld = ""; } });
  S.live = agent;
  agent.run({ query: def.query, entryId: S.entry.id, lang: getLang(), modelId: S.model, budgetEur }).finally(() => {
    // The live run's result stays for this tab's life beside its pre-run in All services; nothing is stored.
    const run = runId === S.runId ? digest(S.events) : null;
    if (run?.score?.result && !run.notService) seen.live.set(entry.id, { run, at: new Date().toISOString().slice(0, 10) });
    setMode();
    schedule();
  });
  setMode();
  schedule();
}

/** What the agent is doing, from its last tool call. */
function workingText(run) {
  const c = run?.lastCall;
  if (!c) return t("p.working.start");
  if (c.name === "web_search") return t("p.working.search", { query: c.input?.query || "" });
  if (c.name === "web_fetch") { try { return t("p.working.fetch", { host: new URL(c.input?.url).hostname }); } catch { return t("p.working.read"); } }
  if (/^rec_/.test(c.name)) return t("p.working.record");
  if (/^eng_/.test(c.name)) return t("p.working.score");
  return t("p.working.think");
}

/** Why a live run ended: its last error, else the last notice that stopped it. */
const STOPPED_BY = /^notice\.(ended|stepLimit|costCap|contextWindow|refusal|webSearchOff|webFetchOff|modelMissing|unexpected)$/;
function liveEndText(run) {
  const notices = [...(run.notices || [])].reverse();
  const n = notices.find((x) => x.level === "error") || notices.find((x) => STOPPED_BY.test(x.key));
  const why = n ? t(n.key, n.vars || {}) : t(`p.live.end.${run.end?.status || "stopped"}`);
  return t("p.live.ended", { why });
}
