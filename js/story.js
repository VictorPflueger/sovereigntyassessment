// The five steps and the four key figures, built from a run (js/run.js). Every figure comes from the
// engine's results in the run (js/engine.js through the tools); this module only chooses and words them,
// in English or German. Pure module: the page renders what it returns, and the tests check its words and
// figures in Node.
//
// Model-written texts (the agent's sentences, block names, the levers) stay as the run recorded them, in
// the run's language. They reach the screen through plain(): the engine's placeholders filled in, block
// ids such as B-06 replaced by the block's name, lever ids by the lever's title.

import { t } from "./i18n/index.js";
import { renderFacts } from "./facts.js";
import { fmtScore, fmtInt, fmtDate } from "./format.js";
import { LAYERS, techLevel, opLevel } from "./engine.js";
import { STEP_IDS, scoredLayers } from "./run.js";

const words = (s) => (String(s).match(/\S+/g) || []).length;
const NBSP = " ";

/** A text in a language: a plain string as it is, { en, de } in that language. */
export function inLang(value, lang) {
  if (value && typeof value === "object") return value[lang] || value.en || value.de || "";
  return value == null ? "" : String(value);
}

/** A share as a whole percentage with a no-break space before the sign: "0 %", Vici's way in both languages. */
export function pct(value, lang) {
  return value === null || value === undefined ? "" : `${fmtInt(Math.round(Number(value) * 100), lang)}${NBSP}%`;
}

/** Euros with cents: "€0.64" or "0,64 €". */
export function eur(value, lang) {
  return new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-GB", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
}

/** The origin class as words: "Germany", "the US", "unknown". */
const place = (cls, lang) => t(`p.class.${cls || "UNKNOWN"}`, null, lang);

/** A party's name for the screen, with its parent: "Apple Distribution International Ltd., part of Apple Inc.". */
function partyName(p, lang) {
  const unknown = !p || !p.name || /^(unknown|unbekannt)$/i.test(String(p.name).trim());
  if (unknown && !p?.parent) return t("p.party.unknown", null, lang);
  const own = unknown ? t("p.party.unknown", null, lang) : p.name;
  return p.parent?.name ? t("p.party.parent", { party: own, parent: p.parent.name }, lang) : own;
}

/** Why a block has its level, in words: who makes it, who runs it, and what that gives. */
function levelWhy(b, lang) {
  const tech = techLevel(b.tech_class, b.scored?.licence ?? b.licence);
  const op = opLevel(b.operator_class, b.scored?.hosting ?? b.hosting);
  const made = tech === 4 ? "p.why.tech4" : tech === 3 ? "p.why.tech3" : tech === 2 ? "p.why.tech2" : "p.why.techNone";
  const run = op === 4 ? "p.why.op4" : op === 1 ? "p.why.op1" : op === 0 ? "p.why.op0" : "p.why.opNone";
  return t("p.why", { made: t(made, null, lang), run: t(run, null, lang) }, lang);
}

/**
 * story({ run, lang, mode, entry }) → { service, steps[5], kpis, log, ended, finished, decided }
 * run: digest(events) of js/run.js; entry: the catalogue entry, or null for a service typed in a live run.
 */
export function story({ run, lang = "en", mode = "simulation", entry = null }) {
  const result = run.score?.result || null;
  const facts = run.score?.facts || {};
  const blocks = new Map((result?.blocks || run.blockList || []).map((b) => [b.id, b]));
  for (const b of run.blockList || []) if (!blocks.has(b.id)) blocks.set(b.id, b);
  const levers = run.levers?.levers || [];
  const blockName = (id) => { const b = blocks.get(id); return b ? inLang(b.name, lang) : id; };
  const leverTitle = (id) => { const l = levers.find((x) => x.lever_id === id); return l ? inLang(l.title, lang) : id; };

  /** A figure before and after the lever; one that does not move reads "level 3, unchanged". */
  function change(from, to) { return from === to ? t("p.unchanged", { value: from }, lang) : `${from} → ${to}`; }

  /** A model-written text as the screen shows it: figures filled in, ids replaced by names. */
  const plain = (text, values = facts) => renderFacts(inLang(text, lang), { ...facts, ...(values || {}) }, run.lang || lang)
    .replace(/(?<![\p{L}\p{N}])B-\d{2}(?![\p{L}\p{N}])/gu, (id) => (blocks.has(id) ? `“${blockName(id)}”` : id))
    .replace(/(?<![\p{L}\p{N}])L[1-3](?![\p{L}\p{N}])/gu, (id) => (levers.some((l) => l.lever_id === id) ? `“${leverTitle(id)}”` : id));

  const service = {
    id: entry?.id || run.entryId || null,
    name: entry ? t(`p.case.${entry.id}`, null, lang) : run.query || "",
    short: entry ? t(`p.case.${entry.id}.short`, null, lang) : run.query || ""
  };
  const S = service.short;
  const notService = run.notService;
  const scored = scoredLayers(result);
  const complete = !!result && run.scoredOnce;
  const critical = result ? result.blocks.filter((b) => b.criticality === "critical" && !b.unscored) : [];
  const atRisk = critical.filter((b) => b.level <= 1).length;
  const weakest = result?.weakest ? { id: result.weakest.block_id, name: blockName(result.weakest.block_id), level: result.weakest.level, ties: result.weakest.ties } : null;
  const lowest = result ? result.blocks.filter((b) => !b.unscored).sort((a, b) => a.level - b.level || LAYERS.indexOf(a.layer) - LAYERS.indexOf(b.layer))[0] || null : null;
  const pages = run.research.filter((s) => s.kind === "fetch" && s.ok).length;
  const quotes = new Set(run.evidence.filter((c) => c.verified && c.quote).map((c) => `${c.url}|${c.quote}`)).size;
  const sources = (list) => (list || []).filter((c) => c.verified && c.quote).map((c) => ({ quote: c.quote, url: c.url, title: c.title || c.url, read: c.read_on ? fmtDate(c.read_on, lang) : "", lang: c.lang || "" }));
  const ended = run.end && !["done", "not_a_service"].includes(run.end.status) ? { status: run.end.status } : null;
  const pending = ended ? { kind: "empty", text: t("p.stage.stopped", null, lang) } : { kind: "wait", text: t("p.stage.working", null, lang) };
  const agent = (i) => run.narration.filter((m) => m.step === i).map((m) => ({ text: plain(m.text, m.values), unchecked: m.audit === "unchecked" }));
  const steps = [];

  // 1 Understand: the service as its own pages describe it, with who offers and who runs it.
  const pr = run.profile;
  const operatorKnown = pr && pr.operator && !/^(unknown)$/i.test(String(pr.operator.name || "").trim()) && pr.operator.country !== "UNKNOWN";
  steps.push({
    title: !pr ? t("p.s1.title.wait", { service: S }, lang) : operatorKnown ? t("p.s1.title", { service: S, operator: partyName(pr.operator, lang) }, lang) : t("p.s1.title.noOperator", { service: S }, lang),
    lead: t("p.s1.lead", null, lang),
    stage: pr ? {
      kind: "service", name: service.name, what: plain(pr.what), how: plain(pr.how), status: plain(pr.status),
      rows: [
        { label: t("p.s1.offered", null, lang), value: partyName(pr.owner, lang) },
        { label: t("p.s1.runBy", null, lang), value: partyName(pr.operator, lang) }
      ],
      sources: sources(pr.evidence)
    } : run.choice && !run.chosen ? { kind: "choice", question: plain(run.choice.question), candidates: run.choice.candidates.map((c, i) => ({ index: i, name: plain(c.name), text: plain(c.description) })) } : pending
  });

  // 2 Research: the six layers and the blocks the agent found in each, with who makes and who runs them.
  // As in any table an editor sets, a name with its short form in brackets is written out once and then
  // goes by the short form: "Informationstechnikzentrum Bund (ITZBund)", then "ITZBund".
  const seen = new Set();
  const once = (name) => {
    const m = /^(.+) \(([^()]{2,12})\)$/.exec(name || "");
    if (!m) return name;
    if (seen.has(name)) return m[2];
    seen.add(name);
    return name;
  };
  const rows = LAYERS.map((l) => {
    const inLayer = [...blocks.values()].filter((b) => b.layer === l);
    const st = run.layers[l];
    return {
      layer: l, name: t(`p.layer.${l}`, null, lang),
      status: inLayer.length ? "blocks" : st?.status || "open",
      reason: st ? plain(st.reason) : "",
      blocks: inLayer.map((b) => ({
        id: b.id, name: blockName(b.id), critical: b.criticality === "critical", criticality: t(`p.crit.${b.criticality}`, null, lang),
        made: { who: once(partyName(b.tech, lang)), where: place(b.tech_class, lang) },
        run: { who: once(partyName(b.operator, lang)), where: place(b.operator_class, lang) },
        sources: sources(b.evidence)
      }))
    };
  });
  const blockCount = blocks.size;
  const layersWithBlocks = rows.filter((r) => r.blocks.length).length;
  steps.push({
    title: notService ? t("p.s2.title.none", null, lang) : !blockCount ? t("p.s2.title.wait", null, lang)
      : blockCount === 1 ? t("p.s2.title.one", null, lang)
        : t("p.s2.title", { blocks: fmtInt(blockCount, lang), layers: fmtInt(layersWithBlocks, lang) }, lang),
    lead: notService ? t("p.s2.lead.none", { pages: fmtInt(pages, lang) }, lang) : t("p.s2.lead", { pages: fmtInt(pages, lang), quotes: fmtInt(quotes, lang) }, lang),
    stage: notService ? { kind: "empty", text: t("p.stage.notService", null, lang) } : blockCount || Object.keys(run.layers).length ? { kind: "layers", rows } : pending
  });

  // 3 Score: code gives every block its level and every layer its score.
  const levelRows = LAYERS.map((l) => {
    const lay = result?.layers?.[l] || null;
    return {
      layer: l, name: t(`p.layer.${l}`, null, lang), score: lay && lay.score !== null ? fmtScore(lay.score, lang) : null,
      status: lay ? (lay.score !== null ? "scored" : lay.status) : run.layers[l]?.status || "open",
      blocks: (result?.blocks || []).filter((b) => b.layer === l).map((b) => ({
        id: b.id, name: blockName(b.id), level: b.unscored ? null : b.level, partly: !!b.partly_unknown, critical: b.criticality === "critical",
        weakest: weakest?.id === b.id, lowest: !!lowest && lowest.id === b.id && lowest.level < (weakest?.level ?? 5)
      }))
    };
  });
  const score = result?.overall;
  steps.push({
    title: notService ? t("p.s3.title.none", null, lang) : !complete ? t("p.s3.title.wait", null, lang)
      : score === null ? t("p.s3.title.noScore", null, lang) : t("p.s3.title", { score: fmtScore(score, lang), scored: fmtInt(scored, lang) }, lang),
    lead: notService ? t("p.s3.lead.none", null, lang) : t("p.s3.lead", { exclusive: !complete || !critical.length ? "" : atRisk ? t("p.s3.lead.atRisk", { n: fmtInt(atRisk, lang), of: fmtInt(critical.length, lang) }, lang) : t("p.s3.lead.noneAtRisk", null, lang) }, lang).trim(),
    stage: notService ? { kind: "empty", text: t("p.stage.notNeeded", null, lang) } : complete ? { kind: "levels", rows: levelRows, weakest, lowest: lowest ? { id: lowest.id, name: blockName(lowest.id), level: lowest.level } : null } : pending
  });

  // 4 Your review: the agent asks a person to check its findings before it recommends anything.
  const rv = run.review;
  const focus = rv ? (rv.block_ids || []).map((id) => blocks.get(id)).filter(Boolean) : [];
  const reviewOpen = !!rv && !run.reviewed;
  const one = focus.length === 1 ? focus[0] : null;
  steps.push({
    title: notService ? t("p.s4.title.none", null, lang) : !rv ? t("p.s4.title.wait", null, lang)
      : run.reviewed ? t(run.reviewed.action === "skip" ? "p.s4.title.skipped" : "p.s4.title.confirmed", null, lang)
        : one && one.level !== null ? t("p.s4.title", { block: blockName(one.id), level: fmtInt(one.level, lang) }, lang) : t("p.s4.title.many", { n: fmtInt(focus.length, lang) }, lang),
    lead: notService ? t("p.s4.lead.none", null, lang) : t(run.reviewed ? "p.s4.lead.done" : "p.s4.lead", null, lang),
    agent: rv ? [{ text: plain(rv.summary, rv.values), unchecked: false }] : [],
    stage: notService ? { kind: "empty", text: t("p.stage.notNeeded", null, lang) } : rv ? {
      kind: "review", status: run.reviewed ? run.reviewed.action : "open",
      blocks: focus.map((b) => ({
        id: b.id, name: blockName(b.id), layer: t(`p.layer.${b.layer}`, null, lang), criticality: t(`p.crit.${b.criticality}`, null, lang),
        level: b.unscored ? null : b.level, partly: !!b.partly_unknown, why: levelWhy(b, lang),
        made: { who: partyName(b.tech, lang), where: place(b.tech_class, lang) },
        run: { who: partyName(b.operator, lang), where: place(b.operator_class, lang) },
        sources: sources(b.evidence)
      }))
    } : pending
  });

  // 5 Recommend: levers priced on a copy of the blocks, the person's decision, the memo the agent drafts.
  const decided = run.decision?.lever_id || null;
  const memo = run.memo;
  const keepScore = run.levers?.keep?.facts?.["score.overall"] ?? score;
  const leverCards = levers.map((l) => {
    const p = `whatif.${l.lever_id}`;
    const f = l.whatif?.facts || {};
    return {
      id: l.lever_id, title: plain(l.title), rationale: plain(l.rationale, { ...(run.levers?.values || {}), ...f }),
      overall: f[`${p}.overall`] ?? null, delta: f[`${p}.delta`] ?? null,
      weakest: f[`${p}.weakest.level`] ?? null, exclusive: f[`${p}.exclusive_non_eu`] ?? null,
      text: {
        overall: f[`${p}.overall`] === null || f[`${p}.overall`] === undefined ? t("p.noScore", null, lang) : fmtScore(f[`${p}.overall`], lang),
        delta: f[`${p}.delta`] === null || f[`${p}.delta`] === undefined ? "" : (f[`${p}.delta`] > 0.5 ? "+" : f[`${p}.delta`] < -0.5 ? "−" : "±") + fmtScore(Math.abs(f[`${p}.delta`]), lang),
        weakest: f[`${p}.weakest.level`] === null || f[`${p}.weakest.level`] === undefined ? t("p.noScore", null, lang) : t("p.levelOf", { n: fmtInt(f[`${p}.weakest.level`], lang) }, lang),
        exclusive: pct(f[`${p}.exclusive_non_eu`], lang)
      },
      sources: sources(l.evidence),
      status: decided ? (decided === l.lever_id ? "approved" : "closed") : "open"
    };
  });
  const chosen = leverCards.find((c) => c.id === decided) || null;
  let s5title;
  if (notService) s5title = t("p.s5.title.none", null, lang);
  else if (!run.levers) s5title = t("p.s5.title.wait", null, lang);
  else if (memo && memo.status !== "pending") s5title = t(memo.status === "approved" ? "p.s5.title.approved" : "p.s5.title.rejected", null, lang);
  else if (decided) s5title = memo ? t("p.s5.title.memo", null, lang) : t("p.s5.title.drafting", null, lang);
  else if (leverCards.length === 1 && leverCards[0].overall !== null && keepScore !== null && keepScore !== undefined) {
    s5title = Math.round(leverCards[0].overall) > Math.round(keepScore)
      ? t("p.s5.title.one", { from: fmtScore(keepScore, lang), to: fmtScore(leverCards[0].overall, lang) }, lang)
      : t("p.s5.title.oneSame", { score: fmtScore(keepScore, lang) }, lang);
  } else s5title = t("p.s5.title.many", { n: fmtInt(leverCards.length, lang) }, lang);
  const memoStage = memo ? {
    kind: "memo", status: memo.status, decision: decided, lever: chosen ? chosen.title : null,
    subject: plain(memo.subject, memo.values), body: plain(memo.body, memo.values).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
    figures: [
      { label: t("p.memo.score", null, lang), value: chosen ? change(fmtScore(keepScore, lang), chosen.overall === null ? t("p.noScore", null, lang) : chosen.text.overall) : fmtScore(keepScore, lang) },
      ...(chosen ? [{ label: t("p.memo.weakest", null, lang), value: change(weakest ? t("p.levelOf", { n: fmtInt(weakest.level, lang) }, lang) : t("p.noScore", null, lang), chosen.text.weakest) }] : [])
    ],
    meta: t("p.memo.meta", { service: S, date: fmtDate(memo.date || run.asOf || new Date().toISOString().slice(0, 10), lang) }, lang)
  } : null;
  steps.push({
    title: s5title,
    lead: notService ? t("p.s5.lead.none", null, lang) : t(decided ? "p.s5.lead.decided" : "p.s5.lead", null, lang),
    agent: agent(4),
    stage: notService ? { kind: "empty", text: t("p.stage.notNeeded", null, lang) }
      : memoStage && decided ? memoStage
        : run.levers ? { kind: "levers", levers: leverCards, keep: { overall: keepScore === null || keepScore === undefined ? t("p.noScore", null, lang) : fmtScore(keepScore, lang), status: decided === "keep" ? "approved" : decided ? "closed" : "open" } }
          : decided ? { kind: "wait", text: t("p.stage.drafting", null, lang) } : pending
  });

  // The agent's words for steps 1 to 3 come from its sentences; step 4 shows its review summary above.
  for (const i of [0, 1, 2]) steps[i].agent = agent(i);
  if (rv) steps[3].agent = [...agent(3), { text: plain(rv.summary, rv.values), unchecked: false }].filter((x, i, a) => a.findIndex((y) => y.text === x.text) === i);

  // Where the page waits for the person, and what it asks.
  const memoOpen = !!memo && memo.status === "pending";
  const leversOpen = !!run.levers && !decided;
  const choiceOpen = !!run.choice && !run.chosen;
  const waits = [choiceOpen, false, false, reviewOpen, leversOpen || memoOpen];
  const turns = [
    choiceOpen ? { text: t("p.turn.choice", null, lang), act: "choose", primary: t("p.act.choose", { name: plain(run.choice.candidates[0]?.name || "") }, lang) } : null,
    null, null,
    reviewOpen ? { text: t("p.turn.review", null, lang), act: "confirm", primary: t("p.act.confirm", null, lang) } : null,
    leversOpen ? { text: t(leverCards.length > 1 ? "p.turn.levers.many" : "p.turn.levers", null, lang), act: "approve", primary: t("p.act.approve", null, lang), secondary: t("p.act.keep", null, lang), secondaryAct: "keep" }
      : memoOpen ? { text: t("p.turn.memo", null, lang), act: "memo-approve", primary: t("p.act.memoApprove", null, lang), secondary: t("p.act.memoReject", null, lang), secondaryAct: "memo-reject" } : null
  ];
  const finished = !!run.end && !run.end.status?.match?.(/^(aborted)$/);
  steps.forEach((s, i) => Object.assign(s, {
    id: STEP_IDS[i], label: t(`p.step.${STEP_IDS[i]}`, null, lang),
    ready: notService ? i <= 1 : i <= run.reached || (!!run.end && i <= Math.max(run.reached, 1)),
    needed: !notService || i <= 1,
    waits: waits[i], turn: waits[i] ? turns[i] : null,
    person: i === 3 || i === 4
  }));
  // How long Play stays on a step: the time to read its title and lead, between 7 and 14 seconds.
  for (const s of steps) s.read = Math.min(14000, Math.max(7000, 3000 + 230 * words(`${s.title} ${s.lead}`)));

  return { service, steps, kpis: kpis(), log: log(), ended, finished, decided: !!decided, complete };

  function kpis() {
    const k = {};
    const waiting = mode === "live" && !complete && !notService ? t(run.end ? "p.kpi.stopped" : "p.kpi.waiting", null, lang) : null;
    // Overall score: its value always says on how many of the six layers it rests.
    if (notService) k.score = { value: t("p.kpi.none", null, lang), of: "", note: t("p.kpi.score.none", null, lang) };
    else if (!result || facts["score.overall"] === null || facts["score.overall"] === undefined) k.score = { value: "…", of: "", note: waiting || t("p.kpi.score.empty", null, lang) };
    else {
      const of = t("p.kpi.layers", { n: fmtInt(scored, lang) }, lang);
      if (chosen && chosen.overall !== null && Math.round(chosen.overall) !== Math.round(keepScore)) k.score = { was: fmtScore(keepScore, lang), value: chosen.text.overall, of, note: t("p.kpi.score.lever", null, lang), tone: "done" };
      else if (decided) k.score = { value: fmtScore(keepScore, lang), of, note: t(decided === "keep" ? "p.kpi.score.kept" : "p.kpi.score.same", null, lang), tone: "done" };
      else k.score = { value: fmtScore(facts["score.overall"], lang), of, note: complete ? t("p.kpi.score.note", null, lang) : t("p.kpi.score.partial", null, lang) };
    }
    // Weakest critical link and exclusive non-EU control wait until every layer has blocks or a status.
    if (notService) {
      k.weakest = { value: t("p.kpi.none", null, lang), of: "", note: t("p.kpi.noBlocks", null, lang) };
      k.exclusive = { value: t("p.kpi.none", null, lang), note: t("p.kpi.noBlocks", null, lang) };
    } else if (!complete) {
      k.weakest = { value: "…", of: "", note: waiting || t("p.kpi.score.empty", null, lang) };
      k.exclusive = { value: "…", note: waiting || t("p.kpi.score.empty", null, lang) };
    } else {
      const after = chosen && chosen.weakest !== null && weakest && chosen.weakest !== weakest.level ? chosen.weakest : null;
      k.weakest = weakest
        ? { value: t("p.kpi.level", { n: fmtInt(after ?? weakest.level, lang) }, lang), of: t("p.kpi.of4", null, lang), note: after !== null ? t("p.kpi.weakest.lever", { n: fmtInt(weakest.level, lang) }, lang) : weakest.name, tone: after !== null ? "done" : "" }
        : { value: t("p.kpi.none", null, lang), of: "", note: t("p.kpi.noCritical", null, lang) };
      const exAfter = chosen && chosen.exclusive !== null && Math.round(chosen.exclusive * 100) !== Math.round((result.exclusive_non_eu ?? 0) * 100) ? chosen.exclusive : null;
      k.exclusive = result.exclusive_non_eu === null
        ? { value: t("p.kpi.none", null, lang), note: t("p.kpi.noCritical", null, lang) }
        : { ...(exAfter !== null ? { was: pct(result.exclusive_non_eu, lang) } : {}), value: pct(exAfter ?? result.exclusive_non_eu, lang), note: t("p.kpi.ofCritical", { n: fmtInt(critical.length, lang) }, lang), tone: atRisk ? "risk" : "" };
    }
    return k;
  }

  function log() {
    return (run.log || []).map((e) => {
      let what;
      if (e.kind === "review") what = t(e.action === "skip" ? "p.log.skipped" : "p.log.confirmed", null, lang);
      else if (e.kind === "lever") what = e.lever_id === "keep" ? t("p.log.kept", null, lang) : t("p.log.lever", { title: leverTitle(e.lever_id) }, lang);
      else if (e.kind === "memo") what = t(e.decision === "approved" ? "p.log.memoApproved" : "p.log.memoRejected", null, lang);
      else if (e.kind === "choice") what = t("p.log.chose", { name: Number.isInteger(e.chosen) ? plain(run.choice?.candidates?.[e.chosen]?.name || "") : "" }, lang);
      else if (e.kind === "report") what = t("p.log.report", null, lang);
      return { at: e.at, who: e.by === "agent" ? t("p.log.agent", null, lang) : t("p.log.you", null, lang), what };
    }).filter((e) => e.what);
  }
}
