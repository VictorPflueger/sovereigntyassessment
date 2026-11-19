// The EN and DE switch in the header (index.html, #lang-switch): two toggle buttons with aria-pressed,
// drawn as the shell's segmented control. A click switches the whole interface without a reload and
// stores the choice (js/i18n/index.js); the buttons name their language in that language.

import { getLang, setLang, onLang, LANGS } from "./i18n/index.js";

export function initLangSwitch(root = document.getElementById("lang-switch")) {
  if (!root) return null;
  const buttons = [...root.querySelectorAll("button[data-lang]")].filter((b) => LANGS.includes(b.dataset.lang));
  const sync = () => {
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.lang === getLang()));
  };
  for (const b of buttons) b.addEventListener("click", () => setLang(b.dataset.lang));
  onLang(sync);
  sync();
  return { sync };
}
