// What differs between the prototypes in the shared Vici tests (tests/tokens.mjs, tests/hexagon.mjs,
// tests/page-icon.mjs and tests/vici-files.mjs). Those four files are the same in Rebate Hunter,
// Navigator, the Timetable Translator, Repack Pilot and this app; this file is the one place that is
// not. Everything here is Sovereignty Assessment's.

/** The prototype's name, as on its page and on its card on Victor's website. */
export const NAME = "Sovereignty Assessment";

/**
 * Colour pairs only this prototype draws (the shared shell's pairs are in tests/tokens.mjs):
 * [what, foreground token, background token, kind]. kind "text" needs 4.5:1, "mark" (a line, an icon,
 * a control's border, a bar) 3:1 (WCAG 2.2, 1.4.3 and 1.4.11). Tokens are Vici's, without "--vc-".
 * The honeycomb's fills and text tokens are the brief's (§9), measured in PLAN.md f.3; the sovereignty
 * map draws them from version 0.2.0, and these pairs hold its colours to that contrast from the start.
 */
export const COLOUR_PAIRS = [
  // The honeycomb: one hexagon cell per building block, filled by level on Vici's diverging scale, with
  // the level and the Made-in and Run-by codes written in the cell, so nothing reads by colour alone.
  ["Honeycomb: level 0, its number and codes on the fill", "text-inverse", "div-1", "text"],
  ["Honeycomb: level 1, its number and codes on the fill", "text", "div-3", "text"],
  ["Honeycomb: level 2, its number and codes on the fill", "text", "div-4", "text"],
  ["Honeycomb: level 3, its number and codes on the fill", "text", "div-5", "text"],
  ["Honeycomb: level 4, its number and codes on the fill", "text-inverse", "div-7", "text"],
  // The spider diagram: the assessed service in teal (merlot means the person in charge), a compared
  // service in apricot, both on the map's panel and on the canvas.
  ["Spider: the assessed service's line and markers, on panels", "data-2", "surface", "mark"],
  ["Spider: the assessed service's line and markers, on the canvas", "data-2", "bg-sunken", "mark"],
  ["Spider: the assessed service's line on its own pastel fill", "data-2", "data-pastel-2", "mark"],
  ["Spider: a compared service's line and markers, on panels", "data-3", "surface", "mark"],
  ["Spider: a dashed axis without a score, on panels", "border-strong", "surface", "mark"],
  ["Spider: the value beside a marker and the axis labels, on panels", "text", "surface", "text"]
];

/**
 * Colours that must stay apart, beyond the shared ones in tests/tokens.mjs: [what, token, token].
 * The test reports how far apart they stay under colour-vision deficiency; it does not fail on them.
 */
export const SEPARATIONS = [
  ["The assessed service (teal) vs a compared service (apricot)", "data-2", "data-3"],
  ["The assessed service (teal) vs checking (fjord), which pulses beside it", "data-2", "info-solid"],
  ["Level 0 vs level 1 in the honeycomb", "div-1", "div-3"],
  ["Level 3 vs level 4 in the honeycomb", "div-5", "div-7"]
];

/**
 * The hexagon test's tour of the app (tests/hexagon.mjs): the start screen with its intro, the
 * catalogue, Diagnostics, the mode and key dialogs, the drawer's tabs, and the German interface.
 * The page has just been opened, without SKIP_INTRO, so the intro opens by itself.
 * visit(name, { settle }) checks the page as it is, settle ms (250) after the step.
 */
export async function hexagonTour(page, visit) {
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  await page.waitForSelector(".intro-modal", { timeout: 10000 });
  await visit("start screen with the intro");
  await page.keyboard.press("Escape");
  await page.waitForSelector(".intro-modal", { state: "detached", timeout: 5000 });
  await visit("start screen with the catalogue");
  // The service field's suggestions.
  await page.fill("#service-input", "Bund");
  await page.waitForSelector("#service-suggestions:not([hidden]) [role=option]", { timeout: 5000 });
  await visit("suggestions");
  await page.keyboard.press("Escape");
  await page.click("#btn-diagnostics");
  await page.waitForSelector(".diag-table", { timeout: 5000 });
  await visit("diagnostics");
  await page.keyboard.press("Escape");
  await page.waitForSelector(".diag-table", { state: "detached", timeout: 5000 });
  // The mode dialog for a catalogue entry, then the key dialog behind the live card.
  await page.click('.catalogue-chip[data-entry="bundid"]');
  await page.click("#btn-start");
  await page.waitForSelector(".mode-card", { timeout: 5000 });
  await visit("mode dialog");
  await page.click('.mode-card[data-mode="live"] .mode-cta button');
  await page.waitForSelector("#api-key-input", { timeout: 5000 });
  await visit("key dialog");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#api-key-input", { state: "detached", timeout: 5000 });
  // Every drawer tab, then the drawer hidden again.
  for (const tab of ["blocks", "review", "levers", "outbox", "audit"]) {
    await page.click(`#tab-${tab}`);
    await visit(`drawer, ${tab}`, { settle: 150 });
  }
  await page.click(".drawer-toggle");
  // The German interface, and the intro in German.
  await page.click('#lang-switch button[data-lang="de"]');
  await page.waitForSelector('html[lang="de"]', { timeout: 5000 });
  await visit("German interface");
  await page.click("#btn-about");
  await page.waitForSelector(".intro-modal", { timeout: 5000 });
  await visit("German intro");
  await page.keyboard.press("Escape");
}

/**
 * The page icon (tests/page-icon.mjs): the icon and kind of this prototype's card on Victor's website
 * (VictorPflueger/VIP, data/prototypes.js), the colour of that kind's cell (Vici's lilac for a
 * prototype), and favicon.svg exactly: the card's cell drawn for small sizes.
 */
export const PAGE_ICON = {
  icon: "honeycomb",
  kind: "prototype",
  tone: "lilac",
  favicon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 103.92">
  <!-- Sovereignty Assessment's page icon: Vici's honeycomb icon in a lilac hexagon cell, the same as its
       card on Victor Pflüger's website (icon and kind: VictorPflueger/VIP, data/prototypes.js). Vici's
       lilac 100 (#f2e9fd) and lilac 900 (#372544); the icon is drawn larger than on the card and centred
       on the cell, so that it still reads at 16 px. -->
  <polygon points="120,51.96 90,103.92 30,103.92 0,51.96 30,0 90,0" fill="#f2e9fd"/>
  <g transform="translate(12.98 2.46) scale(4.5)" fill="none" stroke="#372544" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11.4 7.7 L9.5 10.99 L5.7 10.99 L3.8 7.7 L5.7 4.41 L9.5 4.41 Z"/>
    <path d="M17.1 11 L15.2 14.29 L11.4 14.29 L9.5 11 L11.4 7.71 L15.2 7.71 Z"/>
    <path d="M11.4 14.3 L9.5 17.59 L5.7 17.59 L3.8 14.3 L5.7 11.01 L9.5 11.01 Z"/>
  </g>
</svg>
`
};
