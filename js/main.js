// Entry point. Sets the language, checks the data files, then imports and starts the UI. The UI is
// imported dynamically so that a failed module load is reported on the boot screen instead of leaving a
// blank page. Browsers never run this module from file:// — the boot screen in index.html explains that
// case on its own. Nothing is loaded from a third party: every file comes from this site.

import { APP } from "./config.js";
import { initLang, applyStatic, t } from "./i18n/index.js";

const REQUIRED_DATA = [
  ["SA_CATALOGUE", "data/catalogue.js"],
  ["SA_REF_FACTS", "data/ref_facts.js"],
  ["SA_SCHEMAS", "data/schemas.js"]
];

boot().catch((err) => failBoot(err));

async function boot() {
  // English on a first visit, whatever the browser's language; ?lang= wins and is stored (brief §5).
  initLang();
  applyStatic();
  setBootStatus(t("boot.loading"));
  const missing = REQUIRED_DATA.filter(([name]) => !window[name]).map(([, file]) => file);
  if (missing.length) throw new Error(t("boot.missingData", { files: missing.join(", ") }));

  setBootStatus(t("boot.starting"));
  let ui;
  try {
    ui = await import("./ui.js");
  } catch (err) {
    throw new Error(t("boot.moduleFailed", { error: String(err?.message || err) }));
  }
  const { initUI, showBanner } = ui;
  const { redactSecrets } = await import("./keystore.js");

  const app = initUI();
  installErrorReporting(showBanner, redactSecrets);
  document.documentElement.dataset.boot = "ready";
  hideBoot();
  app.introOnFirstVisit();

  if (location.protocol === "file:") showBanner({ level: "warn", titleKey: "banner.file.title", key: "banner.file.text" });
  console.info(`[${APP.name}] ${APP.version} ready.`);
}

// ---- boot screen ------------------------------------------------------------------------------

function setBootStatus(text) {
  const el = document.getElementById("boot-status");
  if (el) el.textContent = text;
}

function hideBoot() {
  const el = document.getElementById("boot");
  if (!el) return;
  el.dataset.state = "done";
  setTimeout(() => el.remove(), 400);
}

function failBoot(err) {
  console.error(`[${APP.name}] Start-up failed:`, err);
  const el = document.getElementById("boot");
  if (!el) return;
  el.dataset.state = "failed";
  setBootStatus(t("boot.failed"));
  const detail = document.getElementById("boot-detail");
  if (detail) {
    detail.textContent = String(err?.message || err);
    detail.hidden = false;
  }
}

// ---- last-resort error reporting --------------------------------------------------------------

function installErrorReporting(showBanner, redactSecrets) {
  let shown = 0;
  const report = (message) => {
    const text = redactSecrets(String(message || "")).slice(0, 280);
    // "Script error." comes from cross-origin scripts such as browser extensions: not ours.
    if (!text || text === "Script error." || shown >= 3) return;
    shown += 1;
    showBanner({ level: "error", titleKey: "banner.error.title", extra: text, key: "banner.error.text", timeout: 15000 });
  };
  window.addEventListener("error", (e) => report(e.message || e.error?.message));
  window.addEventListener("unhandledrejection", (e) => {
    if (e.reason?.name === "AbortError") return; // user-initiated aborts are expected
    report(e.reason?.message || e.reason);
  });
}
