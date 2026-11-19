// Diagnostics dialog: tests the one outside service from this browser and runs the local checks (the
// method on the golden cases, both languages, the key and privacy rules, the bundled data). The local
// checks run as soon as the dialog opens; "Run all tests" adds the API. Every word is an i18n key, so a
// language switch while the dialog is open translates it in place.

import { h, clear } from "./dom.js";
import { icon } from "./icons.js";
import { openModal } from "./modal.js";
import { tx } from "./text.js";
import { TESTS, LOCAL_TESTS, runAll, runTest, memory } from "./diagnostics.js";
import { APP } from "./config.js";

const STATUS_ICON = { pass: "check", fail: "x", warn: "alert", skip: "info", idle: "info" };
// Each status is a Vici tag in its tone, with its icon and its word; skipped and not run are plain.
const STATUS_TAG = { pass: "vc-tag--success", fail: "vc-tag--danger", warn: "vc-tag--warning", running: "vc-tag--info", skip: "", idle: "" };

const statusTag = (s, size = 16) => h("span", { class: ["vc-tag", STATUS_TAG[s] || "", "diag-status"], dataset: { s } },
  s === "running" ? h("span", { class: "vc-spinner vc-spinner--sm", "aria-hidden": "true" }) : icon(STATUS_ICON[s] || "info", size),
  tx(`diag.status.${s}`));

export function openDiagnostics() {
  const rows = new Map();
  const remembered = memory();
  const tbody = h("tbody");
  for (const test of TESTS) {
    const statusCell = h("td", { class: "status" });
    const msCell = h("td", { class: "ms vc-tabular" }, "");
    const detailCell = h("td", { class: "detail" }, tx(test.purposeKey));
    tbody.appendChild(h("tr", { dataset: { test: test.id } },
      h("td", {}, h("strong", {}, tx(test.labelKey)), h("span", { class: "host" }, test.host ? test.host : tx("diag.host.local"))),
      statusCell, msCell, detailCell));
    rows.set(test.id, { statusCell, msCell, detailCell });
    const prev = remembered[test.id];
    setRow(test.id, prev ? { status: prev.status, detail: prev.detail, earlier: true } : { status: "idle" });
  }

  const checkList = h("ul", { class: "world-checks diag-checks" });
  const checkSections = new Map();

  function setRow(id, r) {
    const row = rows.get(id);
    if (!row) return;
    const s = r.status || "idle";
    clear(row.statusCell).appendChild(statusTag(s));
    row.msCell.textContent = r.ms ? `${r.ms} ms` : "";
    if (r.detail?.key) {
      clear(row.detailCell).append(tx(r.detail.key, r.detail.vars || null), r.earlier ? " " : "", r.earlier ? tx("diag.earlier") : "");
    }
    if (r.checks) {
      checkSections.set(id, r.checks);
      renderChecks();
    }
  }

  // The local checks one by one, in the order of the table.
  function renderChecks() {
    clear(checkList);
    for (const test of TESTS) {
      const checks = checkSections.get(test.id);
      if (!checks) continue;
      for (const c of checks) {
        const s = c.ok ? "pass" : "fail";
        checkList.appendChild(h("li", { dataset: { ok: String(!!c.ok), test: test.id } },
          h("span", { class: ["vc-tag", STATUS_TAG[s], "world-mark"] }, icon(STATUS_ICON[s], 14), tx(`diag.status.${s}`)),
          h("span", {}, tx(c.key, c.vars || null))));
      }
    }
  }

  const runBtn = h("button", { class: "vc-button", type: "button", id: "btn-run-all", autofocus: true }, icon("pulse", 18), tx("diag.runAll"));
  let running = false;
  runBtn.addEventListener("click", async () => {
    if (running) return;
    running = true;
    runBtn.setAttribute("aria-disabled", "true");
    await runAll(setRow);
    runBtn.setAttribute("aria-disabled", "false");
    running = false;
  });

  const modal = openModal({
    title: tx("diag.title"),
    intro: tx("diag.intro"),
    size: "wide",
    className: "diag-modal",
    body: [
      h("div", { class: "vc-table-wrap diag-wrap" },
        h("table", { class: "vc-table diag-table" },
          h("thead", {}, h("tr", {}, h("th", {}, tx("diag.col.check")), h("th", {}, tx("diag.col.status")), h("th", {}, tx("diag.col.time")), h("th", {}, tx("diag.col.details")))),
          tbody)),
      h("div", { class: "diag-section" },
        h("h3", {}, tx("diag.checks.title")),
        h("p", {}, tx("diag.checks.lead")),
        checkList)
    ],
    footer: [
      h("span", { class: "dialog-note" }, tx("diag.note", { version: APP.version })),
      runBtn
    ]
  });

  // The local checks are instant: show them straight away.
  for (const id of LOCAL_TESTS) runTest(id).then((r) => setRow(id, r));
  return modal;
}
