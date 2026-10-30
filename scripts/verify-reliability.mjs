import assert from "node:assert/strict";
import { submitRegistration, registrationEndpoint } from "../src/utils/api.js";
import {
  DRAFT_KEY,
  DRAFT_TTL,
  clearDraft,
  readDraft,
  writeDraft,
} from "../src/utils/drafts.js";
import { normalizeField, looksLikeFormula } from "../src/utils/input.js";
import { securityHeaders, securityPolicy } from "../build/security.mjs";
import { ageOnDate } from "../src/utils/dates.js";
import { reliabilityCopy } from "../src/data/reliability.js";
import { readFileSync } from "node:fs";

const today = new Date(2026, 9, 16);
assert.equal(ageOnDate("2020-10-16", today), 6);
assert.equal(ageOnDate("2020-10-17", today), 5);
assert.equal(ageOnDate("1926-10-16", today), 100);
assert.equal(ageOnDate("1925-10-16", today), 101);
assert.equal(ageOnDate("2000-02-29", today), 26);
for (const date of ["2001-02-29", "2000-02-31", "2000-13-01", "bad", ""])
  assert.ok(Number.isNaN(ageOnDate(date, today)));
for (const language of ["km", "zh"])
  assert.deepEqual(
    Object.keys(reliabilityCopy[language]).sort(),
    Object.keys(reliabilityCopy.en).sort(),
  );
console.log("PASS calendar dates, exact age boundaries, and trilingual recovery copy");

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
const defaults = {
  englishName: "",
  medicalNotes: "",
  parentConsent: false,
  country: "Cambodia",
};
assert.equal(readDraft(defaults), null);
const draft = {
  data: {
    ...defaults,
    englishName: "Sok Dara",
    medicalNotes: "Sensitive details",
    parentConsent: true,
  },
  step: 4,
  lang: "km",
  scheduleGroup: "Saturday - Sunday",
  classTime: "9:30 - 11:30 AM",
  submissionUncertain: true,
};
assert.ok(writeDraft(draft, defaults));
const recovered = readDraft(defaults);
assert.equal(recovered.data.medicalNotes, "Sensitive details");
assert.equal(recovered.step, 4);
assert.equal(recovered.submissionUncertain, true);
values.set(
  DRAFT_KEY,
  JSON.stringify({ ...recovered, savedAt: Date.now() - DRAFT_TTL - 100 }),
);
assert.equal(readDraft(defaults), null);
values.set(DRAFT_KEY, "{broken");
assert.equal(readDraft(defaults), null);
const poisoned = {
  ...recovered,
  data: JSON.parse(
    '{"englishName":"Sok Dara","__proto__":{"polluted":true},"unexpected":"drop"}',
  ),
};
values.set(DRAFT_KEY, JSON.stringify(poisoned));
assert.equal(readDraft(defaults).data.unexpected, undefined);
assert.equal({}.polluted, undefined);
assert.ok(clearDraft());
assert.equal(readDraft(defaults), null);
globalThis.localStorage = {
  getItem() {
    throw new Error("Blocked");
  },
  setItem() {
    throw new Error("Quota");
  },
  removeItem() {
    throw new Error("Blocked");
  },
};
assert.equal(readDraft(defaults), null);
assert.equal(writeDraft(draft, defaults), false);
assert.equal(clearDraft(), false);
assert.equal(
  normalizeField("medicalNotes", "a\u0000b\n中文ខ្មែរ"),
  "ab\n中文ខ្មែរ",
);
assert.equal(normalizeField("englishName", "A".repeat(500)).length, 160);
assert.ok(looksLikeFormula('  =IMPORTXML("x")'));
assert.equal(looksLikeFormula("Normal text"), false);
console.log(
  "PASS draft round-trip, privacy expiry, corrupted/poisoned storage, storage denial/quota, and Unicode input limits",
);

assert.throws(
  () => registrationEndpoint("http://untrusted.test/"),
  /configuration/,
);
assert.throws(
  () => registrationEndpoint("https://user:password@untrusted.test/"),
  /configuration/,
);
const endpoint = "https://script.google.com/macros/s/frontend-test/exec";
let sent;
globalThis.fetch = async (url, options) => {
  sent = { url, options };
  return {
    ok: true,
    json: async () => ({
      status: "success",
      message: "<script>ignored</script>",
    }),
  };
};
assert.equal(
  (
    await submitRegistration(endpoint, {
      englishName: "Sok Dara",
      liabilityWaiver: "Agreed",
    })
  ).status,
  "success",
);
assert.equal(sent.options.credentials, "omit");
assert.equal(sent.options.referrerPolicy, "no-referrer");
assert.equal(sent.options.body.get("englishName"), "Sok Dara");
for (const response of [
  { ok: false },
  {
    ok: true,
    json: async () => {
      throw new SyntaxError("HTML response");
    },
  },
  { ok: true, json: async () => ({ status: "unexpected" }) },
]) {
  globalThis.fetch = async () => response;
  await assert.rejects(
    submitRegistration(endpoint, {}),
    (error) => error.uncertain === true,
  );
}
globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({ status: "error", message: "Private backend detail" }),
});
await assert.rejects(
  submitRegistration(endpoint, {}),
  (error) =>
    error.code === "rejected" && error.uncertain && !error.message.includes("Private"),
);
globalThis.fetch = async () => {
  throw new TypeError("Network failure");
};
await assert.rejects(
  submitRegistration(endpoint, {}),
  (error) => error.uncertain === true,
);
globalThis.fetch = (_url, options) =>
  new Promise((_resolve, reject) =>
    options.signal.addEventListener("abort", () =>
      reject(new DOMException("Timed out", "AbortError")),
    ),
  );
await assert.rejects(
  submitRegistration(endpoint, {}, { timeoutMs: 5 }),
  (error) => error.code === "timeout" && error.uncertain,
);
Object.defineProperty(globalThis, "navigator", {
  value: { onLine: false },
  configurable: true,
});
await assert.rejects(
  submitRegistration(endpoint, {}),
  (error) => error.code === "offline" && !error.uncertain,
);
console.log(
  "PASS HTTPS endpoint validation, original POST contract, omitted credentials, HTTP errors, malformed JSON, rejection, network failure, timeout, and offline protection",
);

const policy = securityPolicy();
assert.ok(
  policy.includes("script-src 'self'") &&
    !policy.includes("unsafe-inline") &&
    !policy.includes("unsafe-eval"),
);
assert.ok(
  policy.includes("https://script.googleusercontent.com") &&
    policy.includes("form-action 'none'"),
);
assert.equal(securityHeaders()["X-Frame-Options"], "DENY");
assert.ok(
  securityHeaders()["Content-Security-Policy"].includes(
    "frame-ancestors 'none'",
  ),
);
assert.throws(() => securityPolicy({ endpoint: "http://bad.test/" }));
console.log(
  "PASS production CSP, redirect allowlist, framing headers, and HTTPS-only configuration",
);

// Exercise the actual build plugin's hosting output, not a duplicate policy.
const { securityPlugin } = await import("../build/security.mjs");
const emitted = new Map();
securityPlugin({}).generateBundle.call({ emitFile: file => emitted.set(file.fileName, file.source) });
const headerRules = emitted.get("_headers");
for (const [name, value] of Object.entries(securityHeaders()))
  assert.ok(headerRules.includes(`  ${name}: ${value}\n`));
assert.ok(headerRules.includes("/sw.js\n  Cache-Control: no-cache"));
assert.ok(headerRules.includes("/assets/*\n  Cache-Control: public, max-age=31536000, immutable"));
assert.ok(headerRules.split("\n").every(line => line.length < 2000));
const hosting = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
assert.equal(hosting.assets.directory, "./dist");
assert.equal(hosting.assets.not_found_handling, "404-page");
assert.equal(hosting.main, undefined); // Static assets use _headers; no Worker bypass.
console.log("PASS emitted host-enforced headers, safe worker caching and Cloudflare static hosting configuration");
