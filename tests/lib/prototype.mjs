// What differs between the prototypes in the shared Vici tests (tests/tokens.mjs, tests/hexagon.mjs
// and tests/page-icon.mjs). Those files are the same in Rebate Hunter, Navigator, the Timetable
// Translator, Repack Pilot and this app; this file is the one place that is not. Everything here is
// Sovereignty Assessment's.

/** The prototype's name, as on its page and on its card on Victor's website. */
export const NAME = "Sovereignty Assessment";

/**
 * Colour pairs only this prototype draws (the shared shell's pairs are in tests/tokens.mjs):
 * [what, foreground token, background token, kind]. kind "text" needs 4.5:1, "mark" (a line, an icon,
 * a control's border, a bar) 3:1 (WCAG 2.2, 1.4.3 and 1.4.11). Tokens are Vici's, without "--vc-".
 */
export const COLOUR_PAIRS = [
  // Step 3 and Your review: each block's level in a hexagon on Vici's diverging scale, with its number,
  // so nothing reads by colour alone.
  ["Levels: level 0, its number on the fill", "text-inverse", "div-1", "text"],
  ["Levels: level 1, its number on the fill", "text", "div-3", "text"],
  ["Levels: level 2, its number on the fill", "text", "div-4", "text"],
  ["Levels: level 3, its number on the fill", "text", "div-5", "text"],
  ["Levels: level 4, its number on the fill", "text-inverse", "div-7", "text"],
  // Level 2 and an unknown level sit close to the page, so a hexagon outline keeps them in view.
  ["Levels: the outline of level 2 and of an unknown level, in a layer's row", "border-strong", "surface", "mark"],
  ["Levels: the outline of level 2 and of an unknown level, in the legend on the stage", "border-strong", "bg-sunken", "mark"],
  ["Levels: an unknown level's question mark", "text-muted", "surface", "text"],
  // The stage on the left: the table, the legend and the note at its foot.
  ["Text on the stage", "text", "bg-sunken", "text"],
  ["The legend and the note at the stage's foot", "text-muted", "bg-sunken", "text"],
  ["Critical, the weakest link and the lowest level, named in merlot on the rows", "accent-text", "surface", "text"],
  // The story on the right: the agent's words, and the bar that says whose turn it is.
  ["The agent's words on its lilac tint", "text", "feature-bg", "text"],
  ["Your turn: its words on the merlot tint", "on-accent-soft", "accent-soft", "text"],
  ["Your turn: its lead on the merlot tint", "accent-text", "accent-soft", "text"],
  ["Your turn: the bar's merlot edge on its tint", "accent", "accent-soft", "mark"],
  // The tiles: a figure a decision moved turns green; a share of blocks at risk turns red.
  ["A tile a decision moved: its value on the green tint", "success-text", "success-bg", "text"],
  ["A tile at risk: its value on the red tint", "danger-text", "danger-bg", "text"]
];

/**
 * Colours that must stay apart, beyond the shared ones in tests/tokens.mjs: [what, token, token].
 * The test reports how far apart they stay under colour-vision deficiency; it does not fail on them.
 * The levels carry their number too, so a pair that comes close still reads.
 */
export const SEPARATIONS = [
  ["Level 0 vs level 1", "div-1", "div-3"],
  ["Level 1 vs level 2", "div-3", "div-4"],
  ["Level 2 vs level 3", "div-4", "div-5"],
  ["Level 3 vs level 4", "div-5", "div-7"]
];

/**
 * The hexagon test's tour of the page (tests/hexagon.mjs): the guide that opens by itself, the five
 * steps of the BundID case with every decision taken, the case menu, Start agent, and the German page
 * with its guide. The page has just been opened, without ?guide=0, so the guide opens by itself.
 * visit(name, { settle }) checks the page as it is, settle ms (250) after the step.
 */
export async function hexagonTour(page, visit) {
  await page.waitForSelector('html[data-boot="ready"]', { timeout: 20000 });
  await page.waitForSelector("#guide-en[open]", { timeout: 10000 });
  await visit("the guide, opened by itself");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#guide-en[open]", { state: "detached", timeout: 5000 }).catch(() => {});
  await page.waitForFunction(() => !document.querySelector("dialog[open]"), null, { timeout: 5000 });
  await page.keyboard.press("1");
  await visit("1 Understand");
  for (const [key, name] of [["2", "2 Research"], ["3", "3 Score"], ["4", "4 Your review"]]) {
    await page.keyboard.press(key);
    await visit(name, { settle: 200 });
  }
  await page.click("#turn-primary");
  await visit("4 Your review, confirmed", { settle: 200 });
  await page.keyboard.press("5");
  await visit("5 Recommend, the lever");
  await page.click("#turn-primary");
  await visit("5 Recommend, the memo");
  await page.click("#turn-primary");
  await visit("5 Recommend, done");
  await page.click("#case-button");
  await page.waitForSelector("#case-menu:popover-open", { timeout: 5000 });
  await visit("the case menu", { settle: 150 });
  await page.keyboard.press("Escape");
  await page.click("#start");
  await page.waitForSelector("#start-dialog[open]", { timeout: 5000 });
  await visit("Start agent");
  await page.keyboard.press("Escape");
  await page.click('.lang-option[data-lang="de"]');
  await page.waitForSelector('html[lang="de"]', { timeout: 5000 });
  await visit("the German page");
  await page.click('[data-vc-guide-open="guide-de"]');
  await page.waitForSelector("#guide-de[open]", { timeout: 5000 });
  await visit("the German guide");
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
