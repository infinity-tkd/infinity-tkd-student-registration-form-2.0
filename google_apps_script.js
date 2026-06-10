/**
 * Google Apps Script - Infinity Taekwondo Student Registration API
 * 
 * Production-Ready script to connect the React Student Registration Form
 * to a Google Sheet database.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any code in Code.gs and paste this script.
 * 4. Click Save.
 * 5. Click Deploy -> New Deployment.
 * 6. Select "Web app" as deployment type.
 *    - Description: "Infinity TKD Registration API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Required so public web submissions can connect)
 * 7. Click Deploy, authorize permissions if prompted, and copy the Web App URL.
 * 8. Paste the Web App URL into App.jsx at line 44 (GAS_WEB_APP_URL).
 */

function doPost(e) {
  // Setup CORS response headers
  var corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    // 1. Get or create the active Spreadsheet and the dedicated "Registrations" tab
    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = activeSpreadsheet.getSheetByName("Registrations");
    if (!sheet) {
      sheet = activeSpreadsheet.insertSheet("Registrations");
      // Delete empty default sheet if it is unused
      var defaultSheet = activeSpreadsheet.getSheetByName("Sheet1");
      if (defaultSheet && defaultSheet.getLastRow() === 0) {
        activeSpreadsheet.deleteSheet(defaultSheet);
      }
    }
    
    // 2. Extract parameters from e.parameter (application/x-www-form-urlencoded format)
    var params = e.parameter;
    
    // 3. Define headers in order
    var headers = [
      "Timestamp",
      "English Name",
      "Khmer Name",
      "Gender",
      "Date of Birth",
      "Phone Number",
      "Email Address",
      "Height (cm)",
      "Weight (kg)",
      "Nationality",
      "Address",
      "Country",
      "City/Province",
      "District/Khan",
      "Commune/Sangkat",
      "School/University",
      "Emergency Contact Name",
      "Emergency Phone",
      "Relationship to Student",
      "Medical Notes",
      "Allergies",
      "Migration Notes",
      "Selected Branch",
      "Preferred Schedule",
      "Current Belt",
      "Medical Conditions",
      "Medications Detail",
      "Past Injuries Detail",
      "Other Sports Detail",
      "Liability Waiver Agreement",
      "Data Privacy Agreement",
      "Media Release Agreement",
      "Parent Consent Agreement",
      "How they Heard",
      "Digital Signature"
    ];

    // 4. Initialize headers with styling if the sheet is blank
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      
      // Style headers: Bold, white text, brand-red background (#EF2F38), centered
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold")
                 .setBackground("#EF2F38")
                 .setFontColor("#FFFFFF")
                 .setHorizontalAlignment("center")
                 .setFontFamily("Montserrat");
                 
      sheet.setFrozenRows(1);
    }

    // 5. Gather form values matching header mappings
    var rowData = [];
    rowData.push(new Date()); // Auto-generated Timestamp
    
    rowData.push(params.englishName || "");
    rowData.push(params.khmerName || "");
    rowData.push(params.gender || "");
    rowData.push(params.dob || "");
    rowData.push(params.phone || "");
    rowData.push(params.email || "");
    rowData.push(params.height || "");
    rowData.push(params.weight || "");
    rowData.push(params.nationality || "");
    rowData.push(params.address || "");
    rowData.push(params.country || "");
    rowData.push(params.city || "");
    rowData.push(params.district || "");
    rowData.push(params.commune || "");
    rowData.push(params.school || "");
    rowData.push(params.emergencyContact || "");
    rowData.push(params.emergencyPhone || "");
    rowData.push(params.relationship || "");
    rowData.push(params.medicalNotes || "");
    rowData.push(params.allergies || "");
    rowData.push(params.migrationNotes || "");
    rowData.push(params.branch || "");
    rowData.push(params.schedule || "");
    rowData.push(params.belt || "");
    rowData.push(params.medicalConditions || "");
    rowData.push(params.medications || "");
    rowData.push(params.pastInjuries || "");
    rowData.push(params.otherSports || "");
    rowData.push(params.liabilityWaiver || "");
    rowData.push(params.privacyPolicy || "");
    rowData.push(params.mediaPrivacy || "");
    rowData.push(params.parentConsent || "");
    rowData.push(params.howHear || "");
    rowData.push(params.signature || "");

    // 6. Append data row
    sheet.appendRow(rowData);

    // 7. Auto-resize columns to fit content nicely
    try {
      sheet.autoResizeColumns(1, headers.length);
    } catch(err) {
      // Fallback if sheet is locked / busy
    }

    // 8. Return success JSON response
    var responseObj = {
      "status": "success",
      "message": "Student successfully registered",
      "row": sheet.getLastRow()
    };
    
    return ContentService.createTextOutput(JSON.stringify(responseObj))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error JSON response
    var errorObj = {
      "status": "error",
      "message": error.toString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Support OPTIONS pre-flight checks (CORS compliance)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
