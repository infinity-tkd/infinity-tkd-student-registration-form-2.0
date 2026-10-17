import { fieldLimits, normalizeField } from "./input.js";

export const DRAFT_KEY = "infinity-registration-draft-v1";
export const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

export function hasDraftData(data, defaults) {
  return Object.keys(defaults).some(
    (key) =>
      data[key] !== defaults[key] && data[key] !== "" && data[key] !== false,
  );
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
    return true;
  } catch {
    return false;
  }
}

export function readDraft(defaults) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    if (raw.length > 100000) {
      clearDraft();
      return null;
    }
    const record = JSON.parse(raw);
    if (
      record?.version !== 1 ||
      !Number.isFinite(record.savedAt) ||
      record.savedAt > Date.now() + 60000 ||
      Date.now() - record.savedAt > DRAFT_TTL ||
      !record.data ||
      typeof record.data !== "object" ||
      Array.isArray(record.data)
    ) {
      clearDraft();
      return null;
    }
    const data = { ...defaults };
    for (const [key, initial] of Object.entries(defaults)) {
      const value = record.data[key];
      if (typeof initial === "boolean") data[key] = value === true;
      else if (typeof value === "string")
        data[key] = normalizeField(key, value);
    }
    if (!hasDraftData(data, defaults)) {
      clearDraft();
      return null;
    }
    return {
      version: 1,
      savedAt: record.savedAt,
      data,
      step:
        Number.isInteger(record.step) && record.step >= 1 && record.step <= 5
          ? record.step
          : 1,
      lang: ["en", "km", "zh"].includes(record.lang) ? record.lang : "en",
      scheduleGroup:
        typeof record.scheduleGroup === "string"
          ? record.scheduleGroup.slice(0, 80)
          : "",
      classTime:
        typeof record.classTime === "string"
          ? record.classTime.slice(0, 100)
          : "",
      submissionUncertain: record.submissionUncertain === true,
    };
  } catch {
    clearDraft();
    return null;
  }
}

export function writeDraft(snapshot, defaults) {
  try {
    if (!hasDraftData(snapshot.data, defaults)) return clearDraft();
    const data = Object.fromEntries(
      Object.entries(defaults).map(([key, initial]) => [
        key,
        typeof initial === "boolean"
          ? snapshot.data[key] === true
          : normalizeField(key, snapshot.data[key] || "").slice(
              0,
              fieldLimits[key] || 240,
            ),
      ]),
    );
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...snapshot, data, version: 1, savedAt: Date.now() }),
    );
    return true;
  } catch {
    return false;
  }
}
