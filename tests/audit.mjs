// The fact audit against the golden cases (brief §7 rule 4 and §11; AC-02): F01 to F29 with the expected
// result and offending tokens, F21 and F22 again with a non-breaking space after "§", the cases of
// decisions D9 and D10, and the edges the brief's wording names (words match as whole words and ignore
// case; "half-" passes; "once a quarter" passes; each blocked token is reported once, as written).
// Usage: node tests/audit.mjs
import { ONLY } from "./lib/harness.mjs";
import { fixture } from "./lib/fixtures.mjs";
import { auditText } from "../js/facts.js";

const fx = fixture("f-audit.json");
const ctx = { facts: fx.facts, evidence: fx.evidence };
const results = [];
function run(id, text, expected, context = ctx) {
  const r = auditText(text, context);
  const ok = r.pass === expected.pass
    && JSON.stringify(r.tokens) === JSON.stringify(expected.tokens || [])
    && JSON.stringify(r.unknownFacts) === JSON.stringify(expected.unknown_facts || []);
  results.push({ id, ok, text, got: r, expected });
}

for (const c of fx.cases) run(c.id, c.text, c.expected);
for (const c of fx.nbsp_variants.cases) run(c.id, c.text, c.expected);
for (const c of fx.decisions.cases) run(c.id, c.text, c.expected);

// Edges of the brief's wording, with the same facts and evidence.
const EDGES = [
  ["E01", "Reports appear half-yearly.", { pass: true }],
  ["E02", "Updates arrive once a quarter.", { pass: true }],
  ["E03", "Third parties outside the EU run the push service.", { pass: true }],
  ["E04", "The third layer has no evidence.", { pass: true }],
  ["E05", "Die Daten werden vierteljährlich gemeldet.", { pass: true }],
  ["E06", "Die Hälfte der Bausteine stammt aus den USA.", { pass: false, tokens: ["Hälfte"] }],
  ["E07", "Ein Drittel der Schichten bleibt offen.", { pass: false, tokens: ["Drittel"] }],
  ["E08", "The block reaches seal-4 in this method.", { pass: false, tokens: ["seal-4"] }],
  ["E09", "Coverage reached 92 % and 92 % again.", { pass: false, tokens: ["92", "%"] }],
  ["E10", "Two-thirds of the blocks are proprietary.", { pass: false, tokens: ["Two-thirds"] }],
  ["E11", "Three quarters of the layers are scored.", { pass: false, tokens: ["Three quarters"] }],
  ["E12", "Halves of the stack are run abroad; quarters too; thirds also.", { pass: false, tokens: ["Halves", "quarters", "thirds"] }],
  ["E13", "One percent and one per cent are blocked.", { pass: false, tokens: ["percent", "per cent"] }],
  ["E14", "Score: {{fact:score.overall}}, layer {{fact:score.layer.access}}, coverage {{fact:coverage}}.", { pass: true }],
  ["E15", "Laut Quelle: „Rechtsgrundlage ist § 3 OZG“ und „Betrieb seit 2024“.", { pass: false, tokens: ["2024"] }],
  ["E16", "See https://example.org/report-2024 for details.", { pass: false, tokens: ["2024"] }],
  ["E17", "See https://example.org/report-2025 for details.", { pass: true }, { ...ctx, evidence: { ...fx.evidence, urls: ["https://example.org/report-2025"] } }],
  ["E18", "The legal basis is Art. 6 DSGVO.", { pass: true }, { ...ctx, evidence: { ...fx.evidence, quotes: [...fx.evidence.quotes, "verarbeitet nach Art. 6 DSGVO"] } }],
  ["E19", "The legal basis is Art. 9 DSGVO.", { pass: false, tokens: ["9"] }, { ...ctx, evidence: { ...fx.evidence, quotes: [...fx.evidence.quotes, "verarbeitet nach Art. 6 DSGVO"] } }],
  ["E20", "The catalogue says it runs Windows 11.", { pass: true }, { ...ctx, evidence: { ...fx.evidence, texts: ["A portal that runs Windows 11 clients"] } }],
  ["E21", "{{fact:score.overall}} and {{fact:nope}} and {{fact:nope}}.", { pass: false, unknown_facts: ["nope"] }],
  ["E22", "Ein Viertel  und   ein Viertel.", { pass: false, tokens: ["Viertel"] }]
];
for (const [id, text, expected, context] of EDGES) run(id, text, { tokens: [], unknown_facts: [], ...expected }, context);

let failed = 0;
for (const r of results) {
  if (r.ok) continue;
  failed += 1;
  console.log(`FAIL  ${r.id}: ${JSON.stringify(r.text)}\n      got ${JSON.stringify(r.got)}\n      expected ${JSON.stringify(r.expected)}`);
}
const line = (prefix, total, what) => {
  const ok = results.filter((r) => r.id.startsWith(prefix) && r.ok).length;
  console.log(`${ok === total ? "PASS" : "FAIL"}  ${ok} of ${total} ${what}`);
};
line("F", fx.cases.length + fx.nbsp_variants.cases.length, "brief cases (F01 to F29, F21 and F22 with a non-breaking space)");
line("D", fx.decisions.cases.length, "decision cases (D9, D10)");
line("E", EDGES.length, "edge cases");
console.log(`\n${results.length - failed}/${results.length} audit cases passed.`);
if (!failed && ONLY.length === 0) console.log("AUDIT OK");
process.exit(failed ? 1 : 0);
