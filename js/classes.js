// Origin classes, derived in code from ISO 3166-1 alpha-2 country codes (brief §6.3; PLAN.md c.1).
// Pure functions: the browser, the Node tests and tools/check-runs.mjs share them.
//
//   DE        Germany
//   EU        the other 26 member states of the European Union
//   US        the United States
//   CN        China, with Hong Kong and Macao
//   OTHER     every other country
//   UNKNOWN   no country evidenced
//
// A provider counts by its ultimate parent's country when a parent is recorded, so a German
// subsidiary of a US company is US; otherwise by its own country. A German public body or public IT
// provider is recorded with country DE. An open-source project without an identifiable steward is
// recorded with country UNKNOWN. "Made in" is the technology provider's class, "Run by" the operator's.

export const CLASSES = ["DE", "EU", "US", "CN", "OTHER", "UNKNOWN"];

/**
 * The 26 member states of the European Union other than Germany, by ISO 3166-1 alpha-2 code, as
 * the EU's own country list names them (verified on 19 November 2026; TECH_NOTES §7).
 */
export const EU_OTHER = Object.freeze([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"
]);

/** China with its two special administrative regions. */
export const CN_GROUP = Object.freeze(["CN", "HK", "MO"]);

/**
 * Codes that are not ISO 3166-1 country codes but turn up in public sources: "EL", the EU's own code
 * for Greece; "UK", reserved for the United Kingdom (ISO: GB); and "EU", reserved for the European
 * Union itself, whose bodies count as EU.
 */
const ALIASES = { EL: "GR", UK: "GB" };

/** The origin class of a country code ("FR" → "EU"); anything that is no two-letter code is UNKNOWN. */
export function classOf(country) {
  const raw = String(country ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(raw)) return "UNKNOWN";
  const code = ALIASES[raw] || raw;
  if (code === "DE") return "DE";
  if (code === "EU" || EU_OTHER.includes(code)) return "EU";
  if (code === "US") return "US";
  if (CN_GROUP.includes(code)) return "CN";
  return "OTHER";
}

/**
 * The class of a party ({ name, country, parent }): by its ultimate parent's country when a parent is
 * recorded, otherwise by its own country. A missing party is UNKNOWN.
 */
export function partyClass(party) {
  if (!party || typeof party !== "object") return "UNKNOWN";
  if (party.parent && typeof party.parent === "object") return classOf(party.parent.country);
  return classOf(party.country);
}

/** True for the classes that count as Europe in the levels (Germany and the other EU states alike: D2). */
export function isEuropean(cls) {
  return cls === "DE" || cls === "EU";
}

/** True for the classes outside the EU that the levels treat alike (US, CN, OTHER). */
export function isNonEu(cls) {
  return cls === "US" || cls === "CN" || cls === "OTHER";
}
