// Entry point: sets the language, checks that the data loaded, starts the presenter and removes the boot
// screen. The presenter is imported dynamically, so a file that fails to load is reported on the boot
// screen instead of a blank page. Browsers never run this module from file://; the boot screen explains
// that case on its own.

import { initLang, applyStatic, t } from "./i18n/index.js";

const REQUIRED = [["SA_CATALOGUE", "data/catalogue.js"], ["SA_REF_FACTS", "data/ref_facts.js"], ["SA_RUNS", "data/runs/"]];

boot().catch((err) => {
  console.error("[Sovereignty Assessment] Start-up failed:", err);
  const el = document.getElementById("boot");
  if (!el) return;
  el.dataset.state = "failed";
  document.getElementById("boot-status").textContent = t("p.boot.failed");
  const detail = document.getElementById("boot-detail");
  detail.textContent = String(err?.message || err);
  detail.hidden = false;
});

async function boot() {
  // English unless ?lang= or the visitor's last choice says German (js/lang.js has read the same).
  initLang();
  applyStatic();
  const missing = REQUIRED.filter(([name]) => !window[name]).map(([, file]) => file);
  if (missing.length) throw new Error(t("p.boot.missing", { files: missing.join(", ") }));
  let app;
  try {
    app = await import("./app.js");
  } catch (err) {
    throw new Error(t("p.boot.module", { error: String(err?.message || err) }));
  }
  await app.start();
  document.documentElement.dataset.boot = "ready";
  const el = document.getElementById("boot");
  el.dataset.state = "done";
  setTimeout(() => el.remove(), 300);
  // A last resort: an error the page did not expect says so, in the browser's console and on screen.
  const report = (message) => {
    if (!message || message === "Script error.") return;
    window.Vici?.toast?.({ title: t("p.error.title"), message: String(message).replace(/sk-ant-[A-Za-z0-9_-]{8,}/g, "sk-ant-[hidden]").slice(0, 200), tone: "danger" });
  };
  window.addEventListener("error", (e) => report(e.message || e.error?.message));
  window.addEventListener("unhandledrejection", (e) => { if (e.reason?.name !== "AbortError" && typeof e.reason !== "symbol") report(e.reason?.message || e.reason); });
}
