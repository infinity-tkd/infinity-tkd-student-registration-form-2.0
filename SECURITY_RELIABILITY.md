# Security and recovery review — 30 October 2026

## Current deployment status

The hardened Apps Script source in `google_apps_script.js` was saved and deployed to the existing public web-app deployment as **Version 3**, revision **2026-10-30.1**. The original URL, spreadsheet binding, execution identity, and public registration access remain in place. The previous editor source was backed up locally under the ignored `.frontend-check/` directory. Version 1 remains available for rollback through Manage deployments.

A live **GET only** returned HTTP 200, JSON `{ "status": "ok", "service": "infinity-registration", "version": "2026-10-30.1", "ready": true }`, via Google's normal Content Service redirect, with `Access-Control-Allow-Origin: *`. The readiness handler checks the explicit server-side spreadsheet binding and column headers. It does not read registration records or write spreadsheet/properties data. **No live registration POSTs, sheet edits, deletions, migrations or backfills were performed.** Live write testing remains declined.

The security header configuration is implemented and tested in the build output. `wrangler.jsonc` prepares the static `dist/` site for Cloudflare Workers Static Assets, which supports `_headers`. **It has not been deployed there.** The existing GitHub Pages URL cannot enforce these custom response headers. Selecting and authenticating the replacement host, verifying its HTTPS response headers, and using its address for real registrations remain release conditions.

## Backend controls

| Risk | Implemented control |
| --- | --- |
| Bypassed browser validation | Server-enforced known fields, scalar types, length/body limits, content type, duplicate parameter rejection, required fields, phone/email syntax, calendar dates, ages 6–100, measurement bounds, enums, exact branch schedules, guardian rules, consent and matching typed signature. |
| Formula injection / coercion | New data cells use plain-text formatting and dangerous prefixes are escaped. Phone zeroes and medical comparisons are retained. Browser validation is no longer the only protection. |
| Duplicate / concurrent writes | Script-wide lock plus durable HMAC-keyed receipts. Identical normalized submissions are acknowledged once within seven days. A pending receipt is persisted before the sheet write. |
| Interrupted write | An identical retry inspects the reserved row without rewriting it. A verified matching non-formula row is acknowledged. A blank or mismatched pending row stops for operator review; it is never blindly appended, overwritten or expired. |
| Spam / storage exhaustion | Durable global limit of 60 distinct submissions/hour and five/contact/day for student phone and email, bounded properties storage, expiry of committed receipts and rate counters, fail-closed storage errors. Duplicate replays do not consume another allowance. |
| Error disclosure | Stable public codes and generic messages. No personal data or internal exception strings are returned or logged. |
| Historic sheet damage | Existing 35-column headers are checked before new writes. Unexpected schema stops registration. No existing row formatting, default-tab deletion, resizing, migration or repair is performed. Full sheets grow by adding new rows. |
| Missing active spreadsheet in web-app execution | Explicit `REGISTRATION_SPREADSHEET_ID` in server Script Properties and `openById`, configured to the project's existing container. The public readiness response exposes no spreadsheet ID or header values. |
| Operator incident response | `REGISTRATION_PAUSED=true` in Script Properties stops new registrations without exposing data. See `BACKEND_DEPLOYMENT.md`. |

The form still sends the same 34 URL-encoded fields using a simple credential-free POST. No browser secret or fictitious CORS header object is used. CORS is not an authentication or anti-bot mechanism. The API is intentionally public, and Apps Script does not provide trustworthy caller IP addresses to this handler. The limits reduce abuse but cannot prevent distributed denial of service or consumption of Google's platform quotas. Higher-risk traffic needs an authenticated gateway or server-verified bot challenge; do not hide a shared credential in frontend JavaScript.

Receipts apply only to submissions received by this revision, not historic records. Exact content-based deduplication lasts seven days for committed entries; editing a field creates a different request. Do not delete/rotate `INFINITY_V2_HASH_KEY` or clear pending receipts during normal operations. Script Properties contain HMAC identifiers, row numbers, expiry times and counters, not raw form/medical values. They are accessible to project editors and should be protected accordingly.

## Browser and hosting controls

Production CSP excludes inline scripts/eval and restricts scripts, fonts, images, connections and Google Maps frames. React renders submitted text as text. The theme bootstrap and all fonts are local assets. The browser uses HTTPS, omitted credentials/referrers, a request timeout, generic failures, and a persisted explicit retry guard. It never automatically sends an offline or uncertain registration.

The host must apply CSP including `frame-ancestors 'none'`, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP and CORP. `_headers` also revalidates HTML, manifests and service workers, while hashed assets can be cached immutably. Meta CSP cannot replace the framing response header. These policies do not change Google API response headers; Google controls its own Content Service responses.

## Recovery and privacy

- Drafts retain fields, language, step, schedule and submission uncertainty. Returning users choose Continue or Start over.
- Drafts contain personal/medical information, are unencrypted in the same browser, and expire after seven days without an update. Successful registration or Start over removes them. The UI explains shared-device access and storage failures.
- Immediate page-hide/visibility flush supplements debounced saving. Blocked, cleared or full browser storage cannot be recovered by the app.
- The service worker caches only listed local static GET assets. It never caches or replays registrations or external API responses. Updates wait for existing tabs to close.
- Offline reopening requires an earlier successful cache. Maps and registration sending still require connectivity. The error boundary provides a reload/recovery path.
- Moving to a new host changes the browser origin. Existing drafts stay at the old origin; users should complete or clear them before switching. No automatic export/transmission of drafts is performed.

## Verification and release conditions

`npm run check` now runs full repository lint, browser reliability units, backend security scenarios and production compilation. The backend suite uses an in-memory Apps Script/Sheets simulator: malformed requests, formulas, Unicode, minor consent, international addresses, schedules, concurrency, duplicate replays, failures before/after writing or during flush, receipt failures, schema/capacity/throttle/pause controls, first-use initialization and full-sheet growth. It asserts that seeded historic rows remain unchanged. No network is used by those tests.

The existing intercepted browser suites cover EN/KM/ZH workflows, 30 responsive/theme combinations, required measurements, validation, keyboard navigation, review/edit, reduced motion, contrast, font loading, offline recovery, worker updates and uncertain retries. The frontend UI and its payload shape are unchanged by this security revision. Those browser tests are local simulations; they do not establish a live production write.

Run `npm run verify:deployment -- https://YOUR-SITE/ https://script.google.com/macros/s/DEPLOYMENT/exec` after hosting deployment. It issues GETs only, checks every required response header, all cached assets, worker caching, the compiled API destination and backend health revision. It deliberately fails on the current GitHub Pages deployment because custom headers are missing.

Remaining conditions: deploy the static site on the selected header-capable host; pass the read-only deployment gate there; verify production write behavior through a separately authorized staging spreadsheet if desired; complete physical-device and independent language/accessibility review. Account access, spreadsheet sharing/retention and provider quotas remain operator responsibilities. No claim of universal or error-free security is made.

## Primary references

- [Google Apps Script locking and flush requirements](https://developers.google.com/apps-script/reference/lock/lock)
- [Script Properties](https://developers.google.com/apps-script/guides/properties) and [platform quotas](https://developers.google.com/apps-script/guides/services/quotas)
- [Spreadsheet range values and formulas](https://developers.google.com/apps-script/reference/spreadsheet/range)
- [Content Service redirects](https://developers.google.com/apps-script/guides/content#redirects)
- [Cloudflare Static Assets headers](https://developers.cloudflare.com/workers/static-assets/headers/)
