/**
 * Infinity TKD registration API, security revision 2026-10-30.
 * Replace Code.gs in the EXISTING bound project and update its web deployment.
 * No migration, deletion, backfill, or rewrite of existing registrations occurs.
 * See BACKEND_DEPLOYMENT.md. Never test doPost against production.
 */
var REGISTRATION_VERSION = "2026-10-30.1";
// Original field order: 34 request fields, 35 sheet columns including timestamp.
var REGISTRATION_FIELDS = [
  ["englishName", "English Name", 160, true],
  ["khmerName", "Khmer Name", 160, false],
  ["gender", "Gender", 20, true],
  ["dob", "Date of Birth", 10, true],
  ["phone", "Phone Number", 15, true],
  ["email", "Email Address", 254, true],
  ["height", "Height (cm)", 6, true],
  ["weight", "Weight (kg)", 6, true],
  ["nationality", "Nationality", 120, true],
  ["address", "Address", 500, true],
  ["country", "Country", 120, true],
  ["city", "City/Province", 180, false],
  ["district", "District/Khan", 180, false],
  ["commune", "Commune/Sangkat", 180, false],
  ["school", "School/University", 240, false],
  ["emergencyContact", "Emergency Contact Name", 160, true],
  ["emergencyPhone", "Emergency Phone", 15, true],
  ["relationship", "Relationship to Student", 120, true],
  ["medicalNotes", "Medical Notes", 2000, false],
  ["allergies", "Allergies", 2000, false],
  ["migrationNotes", "Migration Notes", 2000, false],
  ["branch", "Selected Branch", 40, true],
  ["schedule", "Preferred Schedule", 180, true],
  ["belt", "Current Belt", 30, true],
  ["medicalConditions", "Medical Conditions", 2000, true],
  ["medications", "Medications Detail", 2000, true],
  ["pastInjuries", "Past Injuries Detail", 2000, true],
  ["otherSports", "Other Sports Detail", 2000, true],
  ["liabilityWaiver", "Liability Waiver Agreement", 10, true],
  ["privacyPolicy", "Data Privacy Agreement", 10, true],
  ["mediaPrivacy", "Media Release Agreement", 10, true],
  ["parentConsent", "Parent Consent Agreement", 10, true],
  ["howHear", "How they Heard", 80, true],
  ["signature", "Digital Signature", 160, true],
];
var REGISTRATION_PREFIX = "INFINITY_V2_";
var REGISTRATION_RECEIPT_TTL = 7 * 24 * 60 * 60 * 1000;

function registrationFailure_(code) {
  var error = new Error("Registration request could not be completed.");
  error.registrationCode = code;
  return error;
}

function registrationJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function registrationSpreadsheet_(properties) {
  var id = properties.getProperty("REGISTRATION_SPREADSHEET_ID");
  if (!id || !/^[a-zA-Z0-9_-]{20,}$/.test(id)) throw registrationFailure_("configuration");
  return SpreadsheetApp.openById(id);
}

function registrationHeaders_() {
  return ["Timestamp"].concat(REGISTRATION_FIELDS.map(function (field) { return field[1]; }));
}

function registrationCheckHeaders_(sheet) {
  var headers = registrationHeaders_();
  var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (!headers.every(function (header, index) { return existing[index] === header; }))
    throw registrationFailure_("sheet_schema");
}

// Read-only readiness: binding and column headers, never registration records.
// No properties/sheet initialization or writes occur in this handler.
function doGet() {
  var ready = false;
  try {
    var spreadsheet = registrationSpreadsheet_(PropertiesService.getScriptProperties());
    var sheet = spreadsheet.getSheetByName("Registrations");
    if (sheet && sheet.getLastRow() > 0) registrationCheckHeaders_(sheet);
    ready = true;
  } catch { /* Never expose binding IDs, headers or exception details. */ }
  return registrationJson_({ status: ready ? "ok" : "error", service: "infinity-registration", version: REGISTRATION_VERSION, ready: ready });
}

function registrationAge_(value, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  var date = new Date(value + "T12:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return NaN;
  var age = Number(today.slice(0, 4)) - Number(value.slice(0, 4));
  return age - (today.slice(5) < value.slice(5) ? 1 : 0);
}

function registrationValidate_(event) {
  if (!event || !event.postData || typeof event.postData.contents !== "string" ||
      event.postData.contents.length > 196608 || event.postData.length > 196608 ||
      !/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(event.postData.type || ""))
    throw registrationFailure_("invalid_request");
  var params = event.parameter;
  var multiple = event.parameters;
  if (!params || typeof params !== "object" || !multiple || typeof multiple !== "object")
    throw registrationFailure_("invalid_request");
  var allowed = REGISTRATION_FIELDS.map(function (field) { return field[0]; });
  Object.keys(params).concat(Object.keys(multiple)).forEach(function (key) {
    if (allowed.indexOf(key) < 0 || !Object.prototype.hasOwnProperty.call(multiple, key) ||
        !Array.isArray(multiple[key]) || multiple[key].length !== 1 ||
        multiple[key][0] !== params[key]) throw registrationFailure_("invalid_request");
  });
  var data = {};
  REGISTRATION_FIELDS.forEach(function (field) {
    var value = Object.prototype.hasOwnProperty.call(params, field[0]) ? params[field[0]] : "";
    if (typeof value !== "string" || value.length > field[2] ||
        Array.from(value).some(function (character) {
          var code = character.charCodeAt(0);
          return (code < 32 && code !== 9 && code !== 10 && code !== 13) || (code >= 127 && code <= 159);
        }))
      throw registrationFailure_("invalid_fields");
    value = value.trim();
    if (field[3] && !value) throw registrationFailure_("invalid_fields");
    data[field[0]] = value;
  });
  if (!/^[a-zA-Z\s'-]+$/.test(data.englishName) || !/[a-zA-Z]/.test(data.englishName) ||
      (data.khmerName && !/^[\u1780-\u17ff\s]+$/.test(data.khmerName)) ||
      ["Male", "Female"].indexOf(data.gender) < 0 ||
      !/^[0-9]{8,15}$/.test(data.phone) || !/^[0-9]{8,15}$/.test(data.emergencyPhone) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    throw registrationFailure_("invalid_fields");
  [["height", 80, 230], ["weight", 20, 200]].forEach(function (range) {
    var value = data[range[0]];
    if (!/^\d+(?:\.\d+)?$/.test(value) || Number(value) < range[1] || Number(value) > range[2])
      throw registrationFailure_("invalid_fields");
  });
  var today = Utilities.formatDate(new Date(), "Asia/Phnom_Penh", "yyyy-MM-dd");
  if (data.country === "Cambodia" && (!data.city || !data.district || !data.commune))
    throw registrationFailure_("invalid_fields");
  var age = registrationAge_(data.dob, today);
  if (!Number.isFinite(age) || age < 6 || age > 100) throw registrationFailure_("invalid_fields");
  if (["Parent", "Guardian", "Sibling", "Relative", "Spouse", "Friend", "Other"].indexOf(data.relationship) < 0 ||
      ["White", "Yellow", "Green", "Blue", "Red", "Black"].indexOf(data.belt) < 0 ||
      ["Facebook", "TikTok", "Google", "Friend/Family", "Banner/Flyer", "Other"].indexOf(data.howHear) < 0)
    throw registrationFailure_("invalid_fields");
  var validSchedule = data.branch === "Olympic" && data.schedule === "Saturday - Sunday 9:00 - 11:00 AM";
  if (data.branch === "KoukKhleang") {
    var groups = ["Saturday - Sunday", "Tuesday - Wednesday", "Thursday - Friday"];
    var times = [
      ["7:00 - 9:00 AM", "9:30 - 11:30 AM", "1:00 - 3:00 PM", "3:30 - 5:30 PM", "6:00 - 8:00 PM"],
      ["7:00 - 8:30 AM (Kid Class)", "9:00 - 11:00 AM (General)", "1:00 - 3:00 PM (General)", "3:30 - 5:00 PM (Kid Class)", "6:00 - 8:00 PM (General)"],
    ];
    validSchedule = groups.some(function (group, index) {
      return times[index === 0 ? 0 : 1].some(function (time) { return data.schedule === group + ": " + time; });
    });
  }
  if (!validSchedule) throw registrationFailure_("invalid_fields");
  ["liabilityWaiver", "privacyPolicy", "mediaPrivacy"].forEach(function (key) {
    if (data[key] !== "Agreed") throw registrationFailure_("consent_required");
  });
  if (age < 17) {
    if (["Parent", "Guardian"].indexOf(data.relationship) < 0 || data.parentConsent !== "Agreed")
      throw registrationFailure_("consent_required");
  } else if (["N/A", "No", "Agreed"].indexOf(data.parentConsent) < 0) {
    throw registrationFailure_("invalid_fields");
  } else data.parentConsent = "N/A";
  function name(value) { return value.toLowerCase().replace(/\s+/g, " "); }
  if (name(data.signature) !== name(data.englishName)) throw registrationFailure_("invalid_fields");
  return data;
}

// Escape formulas / CSV-active prefixes even when browser checks are bypassed.
function registrationCell_(value) {
  return /^[\s\uFEFF]*[=+\-@']/.test(value) ? "'" + value : value;
}

function registrationDigest_(value, secret) {
  return Utilities.computeHmacSha256Signature(value, secret, Utilities.Charset.UTF_8)
    .map(function (byte) { return ("0" + ((byte + 256) % 256).toString(16)).slice(-2); }).join("");
}

function registrationPrune_(properties, now) {
  var all = properties.getProperties();
  Object.keys(all).forEach(function (key) {
    if (!/^INFINITY_V2_(RECEIPT|RATE)_/.test(key)) return;
    var item;
    try { item = JSON.parse(all[key]); } catch { throw registrationFailure_("storage_unavailable"); }
    // An ambiguous write NEVER expires automatically; resolve it manually.
    if (item.expires <= now && item.state !== "pending") {
      properties.deleteProperty(key);
      delete all[key];
    }
  });
  if (Object.keys(all).filter(function (key) { return key.indexOf(REGISTRATION_PREFIX) === 0; }).length >= 1400 ||
      JSON.stringify(all).length > 350000) throw registrationFailure_("capacity");
}

function registrationThrottle_(properties, data, secret, now) {
  var limits = [
    ["GLOBAL", 60, 3600000],
    ["PHONE_" + registrationDigest_(data.phone, secret), 5, 86400000],
    ["EMAIL_" + registrationDigest_(data.email.toLowerCase(), secret), 5, 86400000],
  ];
  var updates = {};
  limits.forEach(function (limit) {
    var key = REGISTRATION_PREFIX + "RATE_" + limit[0];
    var raw = properties.getProperty(key);
    var entry = raw ? JSON.parse(raw) : { count: 0, expires: now + limit[2] };
    if (entry.expires <= now) entry = { count: 0, expires: now + limit[2] };
    if (entry.count >= limit[1]) throw registrationFailure_("rate_limited");
    entry.count++;
    updates[key] = JSON.stringify(entry);
  });
  properties.setProperties(updates, false);
}

function registrationMatches_(range, values) {
  var formulas = range.getFormulas()[0];
  var row = range.getValues()[0];
  return values.every(function (value, index) {
    return !formulas[index] && (String(row[index]) === value || String(row[index]) === registrationCell_(value));
  });
}

function doPost(event) {
  var lock;
  var locked = false;
  try {
    // Invalid requests never reach sheet, properties, or lock services.
    var data = registrationValidate_(event);
    lock = LockService.getScriptLock();
    locked = lock.tryLock(5000);
    if (!locked) throw registrationFailure_("busy");
    var properties = PropertiesService.getScriptProperties();
    if (properties.getProperty("REGISTRATION_PAUSED") === "true") throw registrationFailure_("paused");
    var now = Date.now();
    registrationPrune_(properties, now);
    var secret = properties.getProperty(REGISTRATION_PREFIX + "HASH_KEY");
    if (!secret) {
      if (Object.keys(properties.getProperties()).some(function (key) { return key.indexOf(REGISTRATION_PREFIX + "RECEIPT_") === 0; }))
        throw registrationFailure_("storage_unavailable");
      secret = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
      properties.setProperty(REGISTRATION_PREFIX + "HASH_KEY", secret);
    }
    var spreadsheet = registrationSpreadsheet_(properties);
    var values = REGISTRATION_FIELDS.map(function (field) { return data[field[0]]; });
    var receiptKey = REGISTRATION_PREFIX + "RECEIPT_" + registrationDigest_(JSON.stringify([spreadsheet.getId(), values]), secret);
    var previous = properties.getProperty(receiptKey);
    var sheet = spreadsheet.getSheetByName("Registrations");
    if (previous) {
      var receipt = JSON.parse(previous);
      if (!sheet || receipt.sheet !== sheet.getSheetId()) throw registrationFailure_("write_uncertain");
      if (receipt.state === "committed") return registrationJson_({ status: "success", duplicate: true });
      if (!registrationMatches_(sheet.getRange(receipt.row, 2, 1, values.length), values))
        throw registrationFailure_("write_uncertain");
      receipt.state = "committed";
      receipt.expires = now + REGISTRATION_RECEIPT_TTL;
      properties.setProperty(receiptKey, JSON.stringify(receipt));
      return registrationJson_({ status: "success", duplicate: true });
    }
    registrationThrottle_(properties, data, secret, now);
    var headers = registrationHeaders_();
    if (!sheet) sheet = spreadsheet.insertSheet("Registrations");
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      lastRow = 1;
    } else {
      registrationCheckHeaders_(sheet);
    }
    var row = lastRow + 1;
    var maxRows = sheet.getMaxRows();
    if (row > maxRows) sheet.insertRowsAfter(maxRows, row - maxRows);
    var target = sheet.getRange(row, 1, 1, headers.length);
    if (!target.isBlank()) throw registrationFailure_("write_uncertain");
    var pending = { state: "pending", row: row, sheet: sheet.getSheetId(), expires: now + REGISTRATION_RECEIPT_TTL };
    // Persist BEFORE writing. On a crash, retry inspects this row instead of
    // appending blindly. A pending blank/mismatched row requires manual review.
    properties.setProperty(receiptKey, JSON.stringify(pending));
    sheet.getRange(row, 2, 1, values.length).setNumberFormat("@");
    target.setValues([[new Date()].concat(values.map(registrationCell_))]);
    SpreadsheetApp.flush();
    pending.state = "committed";
    try { properties.setProperty(receiptKey, JSON.stringify(pending)); } catch { /* Pending receipt still protects retries. */ }
    return registrationJson_({ status: "success" });
  } catch (error) {
    return registrationJson_({ status: "error", code: error.registrationCode || "unavailable", message: "Registration could not be completed. Please try again later or contact our team." });
  } finally {
    if (locked) {
      try { lock.releaseLock(); } catch { /* Preserve known result. */ }
    }
  }
}
