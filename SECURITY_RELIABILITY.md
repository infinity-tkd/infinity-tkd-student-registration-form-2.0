# Security and recovery review — 17 October 2026

## 1. Scope and current status

This change hardens the browser application and static hosting output, and adds recovery for offline use, closed tabs and interrupted submissions. It preserves the existing backend source and registration fields. This is a scoped implementation and review, not a claim that the whole system is free of vulnerabilities or that every browser/network failure can be prevented.

The supplied public Apps Script endpoint is configured in ignored `.env.local`. A live read-only GET returned HTTP 200 with an HTML error stating that `doGet` is missing, consistent with the local POST-only source. That does not verify a registration write or prove that the deployed source is identical to the local file. The user declined live write testing. No live registration POSTs are authorized or were sent during these checks.

Production assessment: frontend checks pass locally, but the complete service is not fully approved for public collection of real registrations. The unchanged backend validation/formula/idempotency findings, unverified live write path, and production hosting conditions below remain open. Browser testing used desktop Chrome with phone/tablet viewports, not physical iOS/Android devices.

## 2. Attack surface and trust boundaries

User input and locally stored drafts are untrusted. The UI validates types, field names, lengths and required fields, but browser checks can always be bypassed. React renders user content as text. The form sends URL-encoded data to its configured HTTPS endpoint; the Apps Script Content Service may redirect the response to `script.googleusercontent.com`. Google Maps is isolated in a restricted cross-origin iframe. Fonts and application code are self-hosted.

Draft storage contains personal and medical information at the user's explicit request. It is readable to scripts running on the same origin and potentially to other people using the same browser profile. It is not encrypted by this application. CSP reduces script-injection opportunities but does not make browser storage a secure vault.

## 3. Findings and fixes

| Finding | Status | Evidence / remaining action |
| --- | --- | --- |
| Missing content restrictions | Implemented | Production CSP blocks inline scripts, event handlers, plugins, arbitrary network destinations and native form navigation. Development has limited concessions for Vite HMR. |
| No custom response-header configuration | Implemented with hosting limitation | Vite dev/preview serve headers; builds emit `_headers` and `security-headers.json`. GitHub Pages does not consume `_headers`; its HTML meta CSP still applies. A configurable proxy/host is needed for the additional production response headers. |
| Unbounded input and weak request failure handling | Implemented | Known fields only, length limits, formula-like input checks, 20-second request timeout, omitted credentials/referrer, HTTP/JSON/status checks and generic messages. |
| Raw backend errors exposed in console | Removed from application handler | API error bodies are not shown or logged. |
| Lost entries after disconnect or closing the tab | Implemented | Debounced local draft saving plus immediate page-hide/visibility flush, schema validation, seven-day expiry and recovery choice. |
| Duplicate writes after uncertain responses | Browser mitigation implemented | An uncertain attempt is persisted. Reconnection never submits automatically. A user must acknowledge checking before retrying. Server idempotency is still needed for a guarantee. |
| Published dependency advisories | Compatible fixes applied | `npm audit` reports zero advisories at verification time; this is not a guarantee against unpublished issues. |
| Backend accepts unchecked parameters | Still present in unchanged backend | Server-side required/type/length/consent validation must be implemented independently of this UI. |
| Spreadsheet formula interpretation | Still present in unchanged backend | The UI refuses formula-like entries, but direct API callers can bypass that check. Google documents that `appendRow` interprets strings beginning with `=` as formulas. The server needs safe plain-text writes. |
| No backend idempotency / abuse control | Still present in unchanged backend | The public endpoint can receive repeated/direct requests. Add server-enforced request identifiers, duplicate handling and appropriate abuse controls. |
| Backend returns raw error text | Still present in unchanged backend | The UI ignores this text. The API should return stable public error codes instead of internal exception strings. |

The local `corsHeaders` object is never applied to a response, and declaring `doOptions` is not evidence that browser preflight is handled. The application continues to use the original URL-encoded simple POST without custom headers that would introduce a preflight.

## 4. Threat model

- **Spoofing/tampering:** modified drafts or direct calls can bypass browser validation. Drafts are restricted to known fields and types; the API remains the necessary enforcement boundary.
- **Information disclosure:** injected scripts, external referrers, raw errors and shared-device drafts could expose personal data. CSP, self-hosted assets, no-referrer requests, generic errors and draft deletion/expiry reduce these paths.
- **Denial of service:** oversized fields and stalled requests are bounded in the UI. A direct attacker still needs server-side limits.
- **Repudiation/duplicate submissions:** a dropped response may follow a successful write. Local uncertainty tracking and explicit retry reduce duplicate mistakes; they cannot replace server idempotency or audit records.
- **Privilege boundaries:** this is a public registration form. No browser-only control can authorize spreadsheet access or protect a server credential. The configured URL is public, not a secret.

## 5. Implemented controls

Production output includes Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy and HSTS configuration for HTTPS hosting. The meta CSP intentionally excludes `frame-ancestors`, because that directive requires a response header. `Cross-Origin-Embedder-Policy` is not enabled because this page embeds Google Maps.

The inline theme bootstrap is now a local external script. The production policy has no `unsafe-inline` or `unsafe-eval`. React's individual style-property updates continue to work without allowing arbitrary inline style attributes. The policy allows the configured HTTPS API origin and both Google response origins, and allows only the existing Google map frame origins.

## 6. Recovery and offline behavior

- Drafts retain all current registration fields, language, step, day/time selections and an uncertain-submission marker. A returning user explicitly chooses Continue or Start over.
- Drafts expire after seven days without an update. Successful registration and Start over delete the draft. Starting over from an active form asks for confirmation.
- Browser storage may be denied, full, cleared, or temporary in private mode. The UI reports when saving is unavailable; it cannot recover data the browser did not retain.
- A versioned service worker caches only a fixed list of local static GET assets. It never stores or replays registration POSTs or external API responses. An update waits for existing tabs to close rather than replacing a live form.
- Static cache reads use `CacheStorage.match` with a cache name rather than creating caches. Update tests wait for activation after closing the old controlled tab, then verify cache cleanup, draft restoration and offline reopening with the new worker. Rapidly reopening a controlled tab may legitimately keep the update waiting; it must not force a refresh of that form.
- Offline re-opening requires that the static shell was cached successfully during an earlier online visit. Maps and sending a registration still require connectivity. The service worker is enabled in production builds over HTTPS or localhost, not in Vite's development server.
- The React error boundary offers a reload path after a rendering failure. Saved entries can be recovered on return; unrecoverable device/browser storage loss is outside the app's control.
- There is no automatic write retry. An HTTP/network/timeout/invalid-response failure or a generic JSON error can mean the server already wrote the row. An isolated test confirms that the unchanged handler returns an error when `getLastRow` fails after `appendRow` succeeds. The UI preserves the uncertainty until a user confirms a retry or starts over.

## 7. Verification and assessment

`npm run build`, `npm run lint:frontend`, `npm run test:reliability`, `npm run test:frontend`, and `npm run test:offline` exercise production compilation, browser code, storage failure/expiry/corruption, Unicode limits, request errors/timeouts, security policy, all three form languages, 30 responsive/theme combinations, real offline page reopening, tab-close recovery, complete step/schedule/medical draft restoration, explicit retry and successful draft deletion. Browser tests intercept all registration POSTs.

`npm run test:serving` starts the actual Vite production preview server and checks its response headers. A Chrome DevTools network fixture intercepts every redirect hop, verifying that the browser follows a simulated Google POST-to-GET redirect under CSP and CORS, sends all 34 original fields and clears the draft after success. It blocks service workers for this isolated network test; the separate offline suite uses real service workers. These tests do not establish the live endpoint's CORS/deployment behavior. The local machine's antivirus can inject additional scripts/styles that CSP blocks; browser runtime exception counts refer to the application, not a promise of silence from third-party browser/network software.

The unchanged Apps Script also passes isolated tests for first-time sheet creation, 35-column header initialization, frozen headers, a nonfatal resize failure and an error after an append succeeded. The final dependency advisory check reports zero known npm vulnerabilities. Full repository lint exits successfully with zero errors and one warning for the unchanged backend's unused CORS object; frontend/tooling lint has no warnings.

The browser scripts require Playwright and installed Chrome. Set `PLAYWRIGHT_MODULE` to a shared Playwright installation when needed. `test:offline` starts a temporary localhost server and uses real service workers, including a subdirectory deployment test. Reports/screenshots go to `FRONTEND_ARTIFACT_DIR` or the ignored `.frontend-check/` directory.

No overall numerical security certification is assigned: server deployment, access controls, retention policy, real-device testing and live write behavior require independent evidence. The scoped frontend checks pass; the unchanged backend findings and hosting header limitations remain material.

## 8. Deployment conditions and sources

Set `VITE_GAS_WEB_APP_URL` in the deployment environment. The local ignored `.env.local` does not configure GitHub Actions; the existing workflow reads a repository Actions variable with that name. Enforce HTTPS on the deployed site. To enforce all emitted response headers, configure the hosting service or an authorized reverse proxy; do not assume a file in GitHub Pages changes its HTTP headers.

Production builds fail clearly when the endpoint is missing or still the example placeholder. The deployment workflow uses Node 24 LTS and runs `npm run check` (frontend/tooling lint, isolated reliability checks and production build). The reliability suite also executes the unchanged local Apps Script handler in an isolated spreadsheet mock to verify the POST-to-column mapping and an error after a successful write; this is not a live spreadsheet write test. Calendar-date tests reject impossible days and cover exact age boundaries. Browser tests check that restored invalid dates block submission and that medical comparisons remain unchanged.

Backend hardening and redeploying Apps Script remain separate from this frontend work. Keep the user's instruction to leave live data untouched. GitHub Actions has not been executed from this local review, and its endpoint variable and the final production domain/response headers have not been inspected through an authenticated hosting connection.

Open the source application over HTTP at `http://127.0.0.1:5173` while its development server is running. A `file://` source HTML URL cannot run this Vite application. Production preview uses `npm run preview` and enables offline caching; public hosting must serve the built `dist/` over HTTPS.

References: [CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors), [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/), [Google Apps Script Content Service redirects](https://developers.google.com/apps-script/guides/content#redirects), [Google Sheet appendRow behavior](https://developers.google.com/apps-script/reference/spreadsheet/sheet#appendrowrowcontents), [Service worker update lifecycle](https://developer.chrome.com/docs/workbox/handling-service-worker-updates), [supported Node.js releases](https://nodejs.org/en/about/previous-releases).
