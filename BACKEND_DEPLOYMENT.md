# Registration security deployment and operations

## Already deployed

On 30 October 2026 the existing Apps Script web-app deployment was updated from Version 1 to **Version 4**, using the tested `google_apps_script.js`. Its URL did not change. The read-only readiness GET confirms revision `2026-10-30.2`, the existing spreadsheet binding and valid column headers. No registration records were read for testing, submitted, migrated, modified or deleted.

For later updates, replace the code in the existing bound project, save, and choose **Deploy → Manage deployments → Edit → New version → Deploy** for the same deployment ID. Keep its current execution identity and access settings. Do not use the editor's Run button to test registration. Source edits alone do not update a versioned deployment.

Keep the spreadsheet binding and original 35 headers. The API stops on a header mismatch rather than repairing live data. There are no extra data columns or hidden metadata tabs. New receipts and rate counters live in Script Properties.

`REGISTRATION_SPREADSHEET_ID` is required in Project Settings → Script Properties. It is already configured to the existing container spreadsheet for this deployment. New installations must set their own spreadsheet ID there. Do not place it in frontend code or rely on `getActiveSpreadsheet()` in a web-app execution. The existing Sheets OAuth scope is sufficient; no broader scope was added.

## Deploy the frontend with security headers

The `github.io` domain cannot enforce the emitted custom response headers. Do not claim that committing `_headers` to GitHub Pages activates them.

Prepared target: **Cloudflare Workers Static Assets**, using `wrangler.jsonc` and `dist/`. A Cloudflare account is required; a custom domain is optional. Cloudflare Pages can also serve this same static build and `_headers` file. This repository does not contain Cloudflare credentials or an assumed account/domain.

1. Configure public build variable `VITE_GAS_WEB_APP_URL` with the existing `/exec` URL, and use Node 24 LTS.
2. Build with `npm ci` and `npm run check`.
3. Publish `dist/` with its generated `_headers`, worker, fonts and manifest. For Wrangler, use the official CLI with this repository's `wrangler.jsonc`; for a dashboard static deployment, use `dist/` as the output directory. No Worker function is needed. Adding a function requires separately applying response headers to function responses.
4. Run the read-only release gate:

   ```sh
   npm run verify:deployment -- https://YOUR-SITE/ https://script.google.com/macros/s/DEPLOYMENT/exec
   ```

5. Switch registration links only after that gate passes and inspect the language/theme/recovery flow at the new origin. Browser drafts cannot automatically move between origins. Keep existing users informed before changing addresses; do not collect duplicate registrations from both links.

No hosting account/domain has been chosen or authenticated for this revision yet. These steps are ready to apply once that information is provided.

## Safe operations

- Set Script Property `REGISTRATION_PAUSED` to `true` to stop new submissions during an incident; remove it or set it to `false` to resume.
- Default limits: 60 distinct requests per hour globally, five per student phone per day, and five per email per day. These are abuse limits, not authentication. Review them against real enrollment volume before changing them.
- Committed identical submissions deduplicate for seven days. Historic records are not retroactively indexed or rewritten. A changed field is a new request.
- Never clear the receipt store or rotate/delete `INFINITY_V2_HASH_KEY` casually. Doing so defeats duplicate protection. Keep one API writer for this sheet; the script lock does not coordinate unrelated scripts or human edits.
- A `write_uncertain` error requires operator review. A pending receipt identifies a reserved row number. Inspect that row through an authorized spreadsheet session before deciding whether an incomplete registration needs follow-up. A matching row is recovered automatically on an identical retry; a blank/mismatched row is never rewritten automatically. Do not delete the pending receipt until the outcome has been resolved and a duplicate has been ruled out.
- `checkRegistrationSetup` is a metadata-only operator diagnostic: grid size, blank status, formats, validation/protection metadata and receipt counts; no personal fields are logged. `releaseUnwrittenAttempts` uses the script lock and marks only pending reservations older than ten minutes, beyond the last data row, and confirmed entirely blank as retryable. It preserves the receipt and leaves registration rows unchanged. Exact retries retain the existing rate allowance. It does not resend any registration or reset limits for unrelated requests.
- New writes preserve existing formats, use actual dates/numbers for those fields, and escape literal text/phone zeroes. First-use empty tabs expand from 26 to 35 columns before header initialization. Do not add back a bulk text-format setter across typed table columns.
- Storage limits, missing binding/key, schema errors and service failures stop safely with generic errors. Preserve the user's browser draft while investigating; do not ask them to repeatedly resubmit.
- To roll back code, use Manage deployments to select the prior version of the same deployment. Version 1 has the old security gaps; rolling back is an emergency operational choice, not a security solution. A rollback does not undo registrations or clear receipts.

## Verification boundaries

`npm run test:backend` executes the actual Apps Script source against isolated spreadsheet/properties/lock mocks. It never contacts Google. `npm run test:reliability` covers browser failures, CSP and emitted hosting rules. `npm run verify:deployment` uses only GET requests and never verifies a live registration write. Real write validation needs a separate staging project/sheet or explicit authorization; the user's instruction to leave production data untouched remains in force.
