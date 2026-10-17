export const fieldLimits = {
  englishName: 160,
  khmerName: 160,
  gender: 20,
  dob: 10,
  phone: 15,
  email: 254,
  height: 6,
  weight: 6,
  nationality: 120,
  address: 500,
  country: 120,
  city: 180,
  district: 180,
  commune: 180,
  school: 240,
  emergencyContact: 160,
  emergencyPhone: 15,
  relationship: 120,
  medicalNotes: 2000,
  allergies: 2000,
  migrationNotes: 2000,
  branch: 40,
  schedule: 180,
  belt: 30,
  medicalConditions: 2000,
  medications: 2000,
  pastInjuries: 2000,
  otherSports: 2000,
  howHear: 80,
  signature: 160,
};

export function normalizeField(name, value) {
  return String(value)
    .replace(/\p{Cc}/gu, (character) =>
      ["\n", "\r", "\t"].includes(character) ? character : "",
    )
    .slice(0, fieldLimits[name] || 240);
}

// Sheets interprets leading '=' as a formula. Refuse formula-like entries in the UI;
// the API must independently protect writes because browser checks can be bypassed.
export const looksLikeFormula = (value) =>
  typeof value === "string" && /^[\s\uFEFF]*[=+@]/u.test(value);
