# Registration frontend refresh — 15 October 2026

The registration page uses a refined, minimalist direction: warm neutral surfaces, Infinity red, an open two-column desktop layout, and a compact progress tracker on phones. The existing infinity symbol is the visual anchor. Clear labels, generous control sizes, quiet motion, and readable translated copy take priority over decoration. These are design judgments, rather than measured conversion improvements.

## What changed

- Persistent labels and associated help/error messages, with native autofill and appropriate mobile keyboards.
- Five named steps, keyboard-friendly search dropdowns, focus on the first invalid field, and an editable review before submission.
- Larger branch cards, readable automatic Olympic schedules, and dependent KoukKhleang day/time selections that reset together.
- Height and weight are required, always visible, and range-checked. Optional notes remain in an expandable section.
- Policies can expand to their full text. All existing clauses and required consent rules remain present.
- Submission validates all steps again. Error responses preserve entries; pending requests disable form controls; successful requests clear the form and display the existing community links.
- Light mode for new visitors, an explicit dark mode toggle, remembered theme/language preferences, and reduced-motion support. At the user's request, unfinished registrations (including personal/health details) now save to this browser for up to seven days; a returning user chooses Continue or Start over. Completed registrations and discarded drafts are removed.
- Localized interface copy, including progress, dropdown feedback, policy headings, locations, review, community, and submission feedback. The document language and title follow the selected language.
- Self-hosted variable **Geist**, **Kantumruy Pro**, and **Noto Sans SC** fonts through Fontsource. Chinese font styles load when Chinese is selected; Unicode ranges let the browser request needed font subsets. License notices ship in `public/fonts/`.
- Removed the Font Awesome CDN dependency. Icons use the existing Phosphor package. Background maps load only when their dialog opens.
- Native smooth scrolling for anchors and step navigation, minimal scrolling to reveal validation errors, and coordinated focus without competing scrolls. Error navigation uses the visual viewport to account for mobile keyboards. Dropdown arrow navigation scrolls only the option list; closing dialogs restores focus without moving the page. No wheel/touch interception or animation loop is added.
- Production CSP, security-header output, bounded inputs, private request options, response validation, timeouts, and duplicate-aware failure recovery. See `SECURITY_RELIABILITY.md` for hosting limits and the separate backend review.
- A production service worker precaches the static form and fonts so previously cached registrations can reopen offline. Registration POSTs and API responses are never cached or automatically replayed.

## Preserved integration

`google_apps_script.js`, `fetch_locations.js`, location/school/relationship datasets, and the existing translation/policy dictionary are unchanged. The endpoint configuration, URL-encoded POST, response handling contract, registration field names, and consent serialization remain compatible with the original integration. No live registrations were created during verification.

The original English-name/signature rule remains: students enter their name and matching signature using English letters. Place names and nationalities without translations in the existing datasets retain their original spelling. Translated text has been checked for coverage and rendering, but has not had independent native-speaker proofreading.

## Verification

Run `npm run build` and `npm run lint:frontend` for production compilation and frontend linting.

`npm run test:frontend` uses Playwright and an installed Chrome browser. Provide the module path with `PLAYWRIGHT_MODULE` if Playwright is available through a shared runtime rather than this project's dependencies. The test fulfills all application requests from the built `dist/` directory and intercepts every POST, so it does not require a server or contact the production API. Set `FRONTEND_ARTIFACT_DIR` to choose where reports/screenshots are saved; the default `.frontend-check/` is ignored by Git.

The browser checks cover:

- Complete English desktop, Khmer phone, and Chinese tablet registration workflows, including minors and both branches.
- Required fields, missing/out-of-range height and weight, address cascades, school custom entries, schedule resets, signature matching, expanded emergency relationships, separate parent consent, editing review details, and reset after success.
- Successful responses, server errors, network failures, and preserved entries for retry.
- Dropdown search, arrows, Enter, Escape, Tab, active-descendant behavior, and no-results feedback.
- Dialog keyboard focus, Escape dismissal, and language/theme persistence.
- English, Khmer, and Chinese at 320, 390, 768, 1024, and 1440 pixels in both themes: 30 combinations without horizontal page overflow on the initial form.
- Persistent accessible labels, reduced motion, self-hosted font loading, text-color contrast at least 4.5:1 for the main theme tokens, and no browser runtime exceptions.
- An automated comparison that protects data files, browser payload keys, and the request method/encoding. Backend security is now tested separately.

The 16 October production review also fixed impossible calendar-date acceptance, preserved literal comparison text in medical notes, and guarded retries after generic backend errors that may follow a successful write. The backend source remains untouched. The application and React runtime now build as separate chunks (about 91.4 kB and 59.7 kB gzip), removing the large-chunk advisory without raising the warning threshold. The external theme script resolves correctly through Vite's public-asset handling, including subdirectory deployments.

`npm run check` validates frontend/tooling lint, storage, expiry, calendar-date and age boundaries, API failures, timeout, security policy, and production compilation. Repository-wide lint recognizes Apps Script globals and leaves one documented warning for its unused local CORS object. `npm run test:offline` checks a real service worker, complete browser recovery, preserved medical comparison text, invalid restored dates, and checked retries. Physical-device testing, assistive-technology testing, and native-speaker copy review remain outside these local browser checks.

The 17 October follow-up also verifies worker updates without forcing an active form to refresh, activation after tab closure, old-cache cleanup, and recovery after the update while offline. `npm run test:serving` checks the actual Vite production server and a completely intercepted Google-style redirect through the browser. It confirms all 34 registration fields remain compatible and clears drafts on success. All tests leave live registration data untouched; the live API and backend hardening conditions remain open in the security review.

## 30 October security follow-up

The backend is now hardened and deployed as Version 3. The 16/17 October notes above describe the earlier frontend-only scope. The current release conditions, tests and hosting status are documented in SECURITY_RELIABILITY.md and BACKEND_DEPLOYMENT.md. Browser payload fields and UI behavior are preserved; backend security scenarios run separately in the mandatory check command. Custom response headers still require deployment to a compatible host.

The submission follow-up deploys Version 4 (2026-10-30.2). All students now have 18 translated emergency relationship choices plus custom text, while under-17 parent/guardian consent stays required. Successful intercepted browser submissions run through the actual backend handler in a grid-aware isolated harness. Confirmed pre-write errors no longer display the uncertain/duplicate warning. Native date, numeric and escaped-text writes passed in an isolated Google spreadsheet. Five old reservations were confirmed blank and released through operator bookkeeping repair; no registration rows were changed. CSP was not weakened for antivirus-injected styles or fonts.
