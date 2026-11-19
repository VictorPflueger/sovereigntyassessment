// A small JSON Schema validator for the subset this app's schemas use (PLAN.md I1): type (one or a list),
// enum, const, required, properties, additionalProperties (false or a schema), items, minItems, maxItems,
// minLength, maxLength, pattern, format "date", minimum, maximum, anyOf, oneOf and $ref to another
// schema of data/schemas.js by its file name ("Evidence.json"). No dependency.
// The live agent validates every client tool's input with it (a failure returns is_error: true with
// the messages below), the exports are validated against data/schemas.js, and the tests use both.

const TYPE = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && Number.isFinite(v),
  integer: (v) => Number.isInteger(v),
  boolean: (v) => typeof v === "boolean",
  object: (v) => v !== null && typeof v === "object" && !Array.isArray(v),
  array: (v) => Array.isArray(v),
  null: (v) => v === null
};

const typeName = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
const at = (path) => path || "(the input)";

/**
 * Validates `value` against `schema`. registry: { Name: schema } for "$ref": "Name.json". Returns
 * { valid, errors: [{ path, message }] }, with messages that say what was expected.
 */
export function validate(value, schema, registry = {}) {
  const errors = [];
  check(value, schema, "", errors, registry);
  return { valid: errors.length === 0, errors };
}

/** The errors as one line each, for a tool result or a test message. */
export function describeErrors(errors) {
  return errors.map((e) => `${at(e.path)}: ${e.message}`).join("\n");
}

function resolve(ref, registry) {
  const name = ref.replace(/^.*\//, "").replace(/\.json$/, "");
  return registry[name] || null;
}

function check(v, s, path, errors, registry) {
  if (s === true || s === undefined) return;
  if (s === false) { errors.push({ path, message: "no value is allowed here" }); return; }
  if (s.$ref) {
    const target = resolve(s.$ref, registry);
    if (!target) { errors.push({ path, message: `unknown schema reference ${s.$ref}` }); return; }
    check(v, target, path, errors, registry);
    return;
  }
  if (s.type !== undefined) {
    const types = Array.isArray(s.type) ? s.type : [s.type];
    if (!types.some((t) => TYPE[t]?.(v))) {
      errors.push({ path, message: `expected ${types.join(" or ")}, got ${typeName(v)}` });
      return;
    }
  }
  if (s.const !== undefined && JSON.stringify(v) !== JSON.stringify(s.const)) errors.push({ path, message: `must be ${JSON.stringify(s.const)}` });
  if (s.enum && !s.enum.some((e) => JSON.stringify(e) === JSON.stringify(v))) {
    errors.push({ path, message: `must be one of ${s.enum.map((e) => JSON.stringify(e)).join(", ")}; got ${JSON.stringify(v)}` });
  }
  if (typeof v === "string") {
    if (s.minLength !== undefined && [...v].length < s.minLength) errors.push({ path, message: `must have at least ${s.minLength} characters` });
    if (s.maxLength !== undefined && [...v].length > s.maxLength) errors.push({ path, message: `must have at most ${s.maxLength} characters; it has ${[...v].length}` });
    if (s.pattern && !new RegExp(s.pattern, "u").test(v)) errors.push({ path, message: `must match ${s.pattern}; got ${JSON.stringify(v.slice(0, 60))}` });
    if (s.format === "date" && !(/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v))) {
      errors.push({ path, message: `must be a date written YYYY-MM-DD; got ${JSON.stringify(v)}` });
    }
  }
  if (typeof v === "number") {
    if (s.minimum !== undefined && v < s.minimum) errors.push({ path, message: `must be at least ${s.minimum}` });
    if (s.maximum !== undefined && v > s.maximum) errors.push({ path, message: `must be at most ${s.maximum}` });
  }
  if (Array.isArray(v)) {
    if (s.minItems !== undefined && v.length < s.minItems) errors.push({ path, message: `must have at least ${s.minItems} item${s.minItems === 1 ? "" : "s"}` });
    if (s.maxItems !== undefined && v.length > s.maxItems) errors.push({ path, message: `must have at most ${s.maxItems} items; it has ${v.length}` });
    if (s.items) v.forEach((item, i) => check(item, s.items, `${path}[${i}]`, errors, registry));
  }
  if (TYPE.object(v)) {
    for (const key of s.required || []) if (!Object.hasOwn(v, key)) errors.push({ path, message: `missing required field "${key}"` });
    const props = s.properties || {};
    for (const [key, val] of Object.entries(v)) {
      const sub = path ? `${path}.${key}` : key;
      if (Object.hasOwn(props, key)) check(val, props[key], sub, errors, registry);
      else if (s.additionalProperties === false) errors.push({ path: sub, message: `is not an allowed field (allowed: ${Object.keys(props).join(", ") || "none"})` });
      else if (s.additionalProperties && typeof s.additionalProperties === "object") check(val, s.additionalProperties, sub, errors, registry);
    }
  }
  if (s.anyOf) {
    const passing = s.anyOf.filter((alt) => validate(v, alt, registry).valid);
    if (!passing.length) {
      const why = s.anyOf.map((alt) => describeErrors(validate(v, alt, registry).errors).split("\n")[0]).join("; or ");
      errors.push({ path, message: `matches none of the allowed shapes (${why})` });
    }
  }
  if (s.oneOf) {
    const n = s.oneOf.filter((alt) => validate(v, alt, registry).valid).length;
    if (n !== 1) errors.push({ path, message: n ? "matches more than one of the allowed shapes" : "matches none of the allowed shapes" });
  }
}
