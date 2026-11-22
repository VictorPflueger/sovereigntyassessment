// The case is version 1.0.0's, byte for byte: the engine, the fact check, the evidence check, the
// guardrails, the agent with its prompt, tools and client, the simulation player, the pre-run check, the
// catalogue, the reference facts, the seventeen pre-runs and their research notes. Each file's SHA-256 was
// taken from the release commit 1dc145e with `git show` on 22 November 2026 and is written here, so the
// check needs no git history (CI checks out one commit). The agent's settings in js/config.js (the API,
// the server tools, the models and their prices, the caps, the exchange rate, the security policy) and
// the words the case modules ask the dictionaries for (the API's errors, the notices, the memo templates)
// are compared with 1.0.0's too. Version 2.0.0 replaced only the screen around them.
// Usage: node tests/fingerprint.mjs
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { APP_ROOT } from "./lib/harness.mjs";

export const RELEASE_1 = "1dc145e";
export const SHA256 = {
  "js/engine.js": "1b852a128a885f49ede5b95010db925f0abc0959349fc2c39c4643f31d7797a0",
  "js/classes.js": "c517c360a11a06b10dcefcffb15b38d8bb57152d37b7f7a0a906686890986559",
  "js/weights.js": "d81f7a94cb5ba9e119b15680a74b7b35261f6b42377e747709b9bdf48da22bf5",
  "js/facts.js": "f7ee4cbf1e6960130495d307de7e5a0d25d842d35fcb1cd28463638f92c16665",
  "js/evidence.js": "75ad34fe81fc838bcaa6e259e9f4cc7fd91407c92698355be02a26044dc98cec",
  "js/guards.js": "5d97e3b431484a27c4ab3bc477c7ace60d00ac0c35d4cfc18ffbe6b2e9d5e228",
  "js/agent.js": "d7e5f5223afeca6044f069187dc9cde0c469f0244212daeda90a754e42f8e56d",
  "js/prompt.js": "c3a234a6db7d179a05ae12f63cc978e5297da282b034e6dcfef7aea6fa4056ed",
  "js/tools.js": "a6ccb96330523c2b274dd8aaa0f9984f6184dbe157414670ab561cb4d64514d3",
  "js/schema.js": "96ac8f36a218b9515a6d6b86bfc2670bfb4415c15e456649ecbb1395a20d72d7",
  "js/anthropic.js": "3340c80cc9699b1b25bfa0e82a13f67f6bd2281590f7b307be27902cf393c1a9",
  "js/sse.js": "56c0ab34b2f7041129700c0e99c8e37aa663529b8c3c57bb0247937519330fab",
  "js/cost.js": "21afb140e7c7cbcab7b7597cf504643a6b63eb3168d0650df79875b200a18d69",
  "js/api_messages.js": "0d2babf254bb80363592ec2c7dfa04b6291ef630f8f5ec8a679ae03055ed78b0",
  "js/run_common.js": "86a2303d8a957ef6f89417bf9b7475ba606e52d3a7c9872bf2919305bb745e8c",
  "js/events.js": "30c1cba496d956a0f8fa0203b8d804f8c23c33564ec438c30d1b68a9a8a87a48",
  "js/audit.js": "c335533d04493c5704a41c1971945a4153461e77319887358ff61e100f7a9ccd",
  "js/keystore.js": "026d329c385f010267c071abaa1868f00850bd7810c8321236bde499ac16bd9b",
  "js/catalogue.js": "1a5497ded55223bc9798baad73752c41640f36553ff08c2b6d81ac6a5ebcb794",
  "js/clock.js": "a3ba8ff80aea253d327320b94bb28646924f2c32cbd7e4e6a3508145152e4785",
  "js/simulation.js": "b71a269cfb17f555365f3f7ae0a5ebcdd9cec011ad20a4551b55ecb862b5fedb",
  "js/runs_check.js": "7d849deae422da2615c301b4a40b3dad80799ec212575b3371b29265eefb04ae",
  "js/i18n/index.js": "8f356f1f4debf911d51f6d078a4c95e106a58f1ea90110039e17693905b83070",
  "tools/check-runs.mjs": "6d2496f37a2df35211834f97c99587c3d41c5910725f1702964bdb2f3d9a3615",
  "data/catalogue.js": "08f65bbe0f44bf5fa8631cc7ff101aa3c6116b6dc9801c8fcd2fb92ed5cde91b",
  "data/ref_facts.js": "c867305afa3d327e42f87f68814089d008abfc45a3b092048159afd203eb1f0f",
  "data/runs/bundesportal.js": "4d95e87334032669e01b13286e3fc318cb0146e1c7858d2fcbc385189ad579dd",
  "data/runs/bundid.js": "dfb9973db3c7ce39947306c351e1a44bd16ec706dec0a88d2d2013b54f362d71",
  "data/runs/deutschland-app.js": "ad5529fc516f53ee3945f0d43167a2d69f7d7d1edda615c11f29b45aba10ecc5",
  "data/runs/dvc.js": "3892bf64d60fa49e286a4eea87a984cb9a44e6ba918c52dd562d6665f7629019",
  "data/runs/epaybl.js": "d9a98c50d91cb42a9bd86c703562e4347bb04ae88d124981a0d643f99743a0b9",
  "data/runs/eudi-wallet.js": "5be5f052cb69b1ad8590e6401c48aa9889f27b805f76198fb08a5d5b631fa078",
  "data/runs/fit-connect.js": "81c2ffea1e899263f6e67b6df484b1768605e00492331ae035b3383a281c9bff",
  "data/runs/kipitz.js": "1113b58a0db5931b3e79d4025f58329b6872d36f82ae35a9186e47fe1df41064",
  "data/runs/low-code.js": "248f51f5c663e3154dca0447c3d8beffa3e7ce995a8e1984e2a9a833f815486a",
  "data/runs/marktplatz-deutschland-digital.js": "adc5dfda41ec27c717442f54ec1b728f1825055d8d622f0a659737fab571a379",
  "data/runs/muk.js": "aa73675915caa2801e2bb2df83f548e057eb54f9d1612590fdc8e1076ca7d66b",
  "data/runs/noots.js": "6c09275b70559643c58e6b6d49855a7f167140a8e4ace5edbdfa02243ac3234b",
  "data/runs/online-ausweis.js": "a35b3bebdc6c82040aab4cd26dbf1deb9c9b145c809b982756c4488a314d5c51",
  "data/runs/opencode.js": "91bb9fe6f3b1de9b44c42c1b8a5c7205ca039d4625d98c5490a8a7bd1060e5e0",
  "data/runs/sovereignty-assessment.js": "58b205b811c55def1c38d5bd9b31c4e383ef62c4a1ccb5500c1e8f7da3cc9ab4",
  "data/runs/zapuk.js": "11283e1e48885854daf02aed13df73e48d64b72be41ece4366cba90e9c90a9aa",
  "data/runs/zbds.js": "2308bd84b549e616f230550dfff2c93bfcfce9a6e49cbc8988c2fdcada97ed82",
  "research/bundesportal.md": "095852a1f7196e5abaa428193f25b80f5ee7ed963ee64bfd9109e8f898f56643",
  "research/bundid.md": "5840acf6b5a528379c471926244ac14c411ca05ece67271aea904ae6a2da6c8a",
  "research/deutschland-app.md": "c27df3d288569bd3a5237cfa5e9971fd5d6aafc5710769ecf0c23eeaed5497b4",
  "research/dvc.md": "2b3d56d7e7cebd9bcaa6063bc5755722fda5a9efdd05f2dc05596d8b70e588ee",
  "research/epaybl.md": "85e81e9b8e516e0d7f4d081f6a8d326ff33ed28af887c6e57af73f65b0e0ffdc",
  "research/eudi-wallet.md": "b6dc755999667b0370ff4e43321bc130fa3339f7cf7caacf6a5770f281d427ce",
  "research/fit-connect.md": "1bbfc6370d2e251f9d8d467ac239d3d3a579e36a5ba4248209c1afab18cb7e14",
  "research/kipitz.md": "1259b4357387f756502c1154fe494a76cc32aebb94f8f02ec31eeb58a4dcf4e6",
  "research/low-code.md": "e02b1e9069456b0588340ebe8a31a5b6b3d8100ed2262b4750e0b47c739f0938",
  "research/marktplatz-deutschland-digital.md": "f56a36724b0a72bf8b046776ec96c32cf4a5cbbceae3c54ac7017ef6962b3bfc",
  "research/muk.md": "062175e522f76800099100cab014a6aff1093f5f4487ce6e19be53d3d1773cab",
  "research/noots.md": "0977d09c87c2b8d8e9c4c2fb393f707dee97de7c260c05cb75a41ae9c9e9d3db",
  "research/online-ausweis.md": "da4e170ec7b9e850f41494d00cfed42a570812a213c23b32901ca59fdb52bc18",
  "research/opencode.md": "c89baa9042c3bb88e772c1b64737b2cf8769a78318070ac39176502621afb101",
  "research/sovereignty-assessment.md": "8e5f8532c45800143195b874b3893d6273887a465d5d996ed0c94e3d8b1a1b87",
  "research/zapuk.md": "7143be20022db297f70f58e3d7b07f6cbf9992c07e21c706234cd3a1be633b7e",
  "research/zbds.md": "7da48d16ace4b3d3aea2ec028b64dfc62dd5709b9b776335167fe25c6c761598"
};
// js/config.js at 1.0.0: the agent's settings, as canonical JSON (keys sorted).
const CONFIG_1 = {"AGENT":{"budgetEur":3,"idleTimeoutMs":90000,"maxNudges":2,"maxOutputTokens":128000,"maxSteps":40},"ANTHROPIC":{"apiVersion":"2023-06-01","browserHeader":"anthropic-dangerous-direct-browser-access","consoleKeysUrl":"https://platform.claude.com/settings/keys","consoleWorkspacesUrl":"https://platform.claude.com/settings/workspaces","messagesUrl":"https://api.anthropic.com/v1/messages","modelsUrl":"https://api.anthropic.com/v1/models?limit=100","webSearchTool":{"max_uses":5,"name":"web_search","type":"web_search_20250305"},"webSearchUsdPer1000":10},"CSP":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src https://api.anthropic.com; object-src 'none'; base-uri 'none'; form-action 'none'","FX_USD_EUR":0.894,"MODELS":[{"effort":"medium","hintKey":"model.hint.sonnet","id":"claude-sonnet-5-5","label":"Sonnet 5.5","maxTokens":16000,"price":{"cacheRead":0.1,"cacheWrite":2.5,"input":2,"output":10}},{"effort":"medium","hintKey":"model.hint.haiku","id":"claude-haiku-5-5","label":"Haiku 5.5","maxTokens":12000,"price":{"cacheRead":0.01,"cacheWrite":0.125,"input":0.1,"longPrompt":{"cacheRead":0.05,"cacheWrite":0.625,"input":0.5,"output":2.5,"thresholdTokens":100000},"output":0.5}},{"effort":"high","hintKey":"model.hint.opus","id":"claude-opus-5-5","label":"Opus 5.5","maxTokens":16000,"price":{"cacheRead":0.2,"cacheWrite":5,"input":4,"output":20}}],"SERVER_TOOLS":[{"max_uses":12,"name":"web_search","type":"web_search_20250305","user_location":{"country":"DE","timezone":"Europe/Berlin","type":"approximate"}},{"citations":{"enabled":true},"max_content_tokens":8000,"max_uses":10,"name":"web_fetch","type":"web_fetch_20250910"}]};
// The dictionary keys the case modules ask for, and the SHA-256 of their English and German texts at
// 1.0.0 as canonical JSON ({ key: [en, de] }, keys sorted).
const CASE_KEYS = ["api.forbidden", "api.network", "api.other", "api.overloaded", "api.rateLimited", "api.server", "api.spendLimit", "api.timeout", "api.unauthorized", "api.workspace", "controls.aborted", "fact.level", "memo.sim.body.keep", "memo.sim.body.lever", "memo.sim.subject.keep", "memo.sim.subject.lever", "notice.contextWindow", "notice.correctionIgnored", "notice.correctionLogged", "notice.costCap", "notice.discarded", "notice.ended", "notice.fetchBudget", "notice.maxTokensRetry", "notice.modelMissing", "notice.nudge", "notice.refusal", "notice.retrying", "notice.searchBudget", "notice.simFailed", "notice.stepLimit", "notice.unchecked", "notice.unexpected", "notice.webFetchOff", "notice.webSearchOff"];
const CASE_WORDS_1 = "6d69e1b9f50aafba128788bc3d02b8195a2151e790e7b99e3fcd986a4c5c98fd";

const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}` : JSON.stringify(v));
const results = [];
const check = (ok, what, detail = "") => results.push({ ok, what, detail });

// The negative control: a file with one byte changed has another hash.
{
  const original = fs.readFileSync(path.join(APP_ROOT, "js/engine.js"));
  const planted = Buffer.concat([original, Buffer.from(" ")]);
  check(sha(original) === SHA256["js/engine.js"] && sha(planted) !== SHA256["js/engine.js"], "the check tells a changed byte (positive control: js/engine.js with one space more)");
}

// Every case file, byte for byte; and no file of the case is missing from the list.
const changed = [];
for (const [f, want] of Object.entries(SHA256)) {
  const p = path.join(APP_ROOT, f);
  if (!fs.existsSync(p)) { changed.push(`${f} is missing`); continue; }
  if (sha(fs.readFileSync(p)) !== want) changed.push(`${f} differs from ${RELEASE_1}`);
}
check(!changed.length, `${Object.keys(SHA256).length} files of the case equal ${RELEASE_1} byte for byte`, changed.join("; "));
const runs = fs.readdirSync(path.join(APP_ROOT, "data/runs")).map((f) => `data/runs/${f}`);
const notes = fs.readdirSync(path.join(APP_ROOT, "research")).filter((f) => f !== "sources.md").map((f) => `research/${f}`);
const unlisted = [...runs, ...notes].filter((f) => !Object.hasOwn(SHA256, f));
check(!unlisted.length && runs.length === 17 && notes.length === 17, `the seventeen pre-runs and their seventeen notes are all on the list`, unlisted.join(", "));

// The agent's settings.
const C = await import(pathToFileURL(path.join(APP_ROOT, "js/config.js")).href);
const now = canon({ ANTHROPIC: C.ANTHROPIC, SERVER_TOOLS: C.SERVER_TOOLS, MODELS: C.MODELS, AGENT: C.AGENT, FX_USD_EUR: C.FX_USD_EUR, CSP: C.CSP });
const was = canon(CONFIG_1);
const diff = Object.keys(CONFIG_1).filter((k) => canon(CONFIG_1[k]) !== canon({ ANTHROPIC: C.ANTHROPIC, SERVER_TOOLS: C.SERVER_TOOLS, MODELS: C.MODELS, AGENT: C.AGENT, FX_USD_EUR: C.FX_USD_EUR, CSP: C.CSP }[k]));
check(now === was, "js/config.js keeps 1.0.0's API, server tools, models and prices, caps, exchange rate and security policy", diff.join(", "));
check(C.APP.version === "2.0.0", `js/config.js says version ${C.APP.version}`);

// The words the case modules use.
const EN = (await import(pathToFileURL(path.join(APP_ROOT, "js/i18n/en.js")).href)).default;
const DE = (await import(pathToFileURL(path.join(APP_ROOT, "js/i18n/de.js")).href)).default;
const words = sha(canon(Object.fromEntries(CASE_KEYS.map((k) => [k, [EN[k], DE[k]]]))));
check(words === CASE_WORDS_1, `the ${CASE_KEYS.length} texts the case modules ask for read as in 1.0.0, in both languages`, CASE_KEYS.filter((k) => !EN[k] || !DE[k]).join(", "));

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.what}${!r.ok && r.detail ? `\n      ${r.detail}` : ""}`);
const failed = results.filter((r) => !r.ok).length;
if (!failed) console.log("CASE UNCHANGED");
process.exit(failed ? 1 : 0);
