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
export function event(data) {
  const contents = new URLSearchParams(data).toString();
  return { parameter: { ...data }, parameters: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, [value]])), postData: { contents, length: contents.length, type: "application/x-www-form-urlencoded" } };
}
export function backendHarness({ blank = false, sourceCode = source } = {}) {
  const properties = new Map([["REGISTRATION_SPREADSHEET_ID", "isolated-test-spreadsheet"]]);
  const rows = [];
  const formats = [];
  const formulas = new Map();
  const state = { locked: false, sheet: !blank, calls: 0, writes: 0, fail: "", frozen: 0, maxRows: 1000, maxColumns: blank ? 26 : 35, now: Date.UTC(2026, 9, 30, 6) };
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
    assert.ok(row + height - 1 <= state.maxRows && col + width - 1 <= state.maxColumns, "Range exceeds spreadsheet grid limits");
    const read = () => Array.from({ length: width }, (_, i) => rows[row - 1]?.[col - 1 + i] ?? "");
    return {
      getValues: () => [read()],
      getFormulas: () => [read().map((_v, i) => formulas.get(`${row}:${col+i}`) || "")],
      getNumberFormats: () => [read().map(() => "General")],
      getDataValidations: () => [read().map(() => null)],
      isBlank: () => read().every(v => v === ""),
      setNumberFormat(value) { if (state.fail === "format") throw new Error("Private format error"); formats.push({ row, col, width, value }); },
      setValues(values) {
        assert.ok(state.locked, "Every sheet write requires the script lock");
        assert.equal(values.length, 1);
        assert.equal(values[0].length, width);
        if (row > 1 && state.fail === "before") throw new Error("Private failure before write");
        if (state.onWrite && row > 1) { const hook = state.onWrite; state.onWrite = null; hook(); }
        rows[row - 1] ??= [];
        values[0].forEach((v, i) => {
          const key = `${row}:${col+i}`;
          if (typeof v === "string" && v.startsWith("=")) formulas.set(key,v); else formulas.delete(key);
          rows[row - 1][col - 1 + i] = typeof v === "string" && v.startsWith("'") ? v.slice(1) : v;
        });
        state.writes++;
        if (row > 1 && state.fail === "after") throw new Error("Private failure after write");
      },
    };
  }
  const sheet = { getRange: range, getSheetId: () => 42, getLastRow: () => rows.length, setFrozenRows: n => { state.frozen = n; }, getMaxRows: () => state.maxRows, insertRowsAfter: (_row, count) => { state.maxRows += count; }, getMaxColumns: () => state.maxColumns, insertColumnsAfter: (_col, count) => { state.maxColumns += count; }, getProtections: () => [] };
  const context = createContext({
    console: { info() {} },
    Date: Clock,
    Utilities: {
      Charset: { UTF_8: "UTF-8" }, getUuid: randomUUID,
      computeHmacSha256Signature: (text, key) => Array.from(createHmac("sha256", key).update(text).digest()),
      formatDate: date => date.toISOString().slice(0, 10),
      parseDate: value => new Date(value + "T00:00:00Z"),
    },
    SpreadsheetApp: {
      ProtectionType: { SHEET: "SHEET", RANGE: "RANGE" },
      getActiveSpreadsheet() { throw new Error("No active spreadsheet in a web app"); },
      openById(id) { assert.equal(id, "isolated-test-spreadsheet"); state.calls++; return {
        getId: () => "isolated-test-spreadsheet", getSheetByName: () => state.sheet ? sheet : null,
        getSpreadsheetTimeZone: () => "Asia/Phnom_Penh",
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
  runInContext(sourceCode, context);
  const headers = ["Timestamp", ...context.REGISTRATION_FIELDS.map(field => field[1])];
  if (!blank) rows.push(headers, Array(35).fill("EXISTING RECORD MUST STAY UNCHANGED"));
  return { context, rows, properties, state, formats, formulas, request(data = validRegistration) { return JSON.parse(context.doPost(event(data))); }, raw: e => JSON.parse(context.doPost(e)) };
}
