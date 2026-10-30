# Infinity Taekwondo - Student Registration Form 2.0

A high-fidelity, premium, and interactive student registration web application built for **Infinity Taekwondo**. This project features a 5-step registration wizard, strict local input validations, dark mode, multi-language support (English, Khmer, and Chinese), Phnom Penh schools database auto-filtering, and serverless Google Sheets backend database integration.

---

## 🚀 Key Features

### 1. Refined, Minimalist UI/UX
* **Calm, readable layout**: Warm neutral surfaces, Infinity red accents, persistent field labels, a desktop progress sidebar, and a compact mobile step tracker.
* **Responsive Layout**: Fluid layouts designed for mobile, tablet, and desktop viewports.
* **Light mode by default**: An explicit dark mode toggle remembers the user's choice. English, Khmer, and Chinese use self-hosted Geist, Kantumruy Pro, and Noto Sans SC fonts.
* **Unified Iconography**: Phosphor icons without an external icon stylesheet. Transitions respect reduced-motion preferences.

### 2. Smart Form Navigation & Logic
* **5-Step Wizard Progress**: Tracks personal details, emergency info, branch selection, medical questionnaires, and agreement signatures.
* **Searchable Dropdowns**: Upgraded custom selectors (e.g. nationality, city/province, class times, belts) with full search filtering and keyboard navigation (Arrow Up/Down, Enter, Escape).
* **School Auto-Filter**: Smart search input that dynamically filters and autocompletes from Phnom Penh schools.
* **Auto-Scroll to Error**: Clicking "Next Step" or "Submit" with invalid fields automatically scrolls to and focuses the first invalid element.
* **Review before submission**: Review and edit registration details before accepting policies and signing.

### 3. Strict Validation & Rules
* **Minimum Age Policy (6+)**: Enforces that students must be at least 6 years old (ages 6 to 100). The HTML date picker restricts dates dynamically to prevent invalid entries.
* **Strict Minor Policy**: If a student is under 17, the emergency contact relation is validated to be a Parent or Guardian (supporting multi-language inputs). Submissions are locked until this is met.
* **Typed signature confirmation**: Requires a name matching Step 1, ignoring case and repeated spaces. This is a form confirmation, not identity verification or a cryptographic signature.
* **Bounded input and safe rendering**: Limits field sizes, validates calendar dates and measurements, filters phone/name characters, and refuses formula-like entries. React renders entries as text; medical comparisons such as `< 5 mg` remain intact.

### 4. Serverless Google Sheets Database
* **Direct Web API Integration**: Submits sanitized student entries to a Google Apps Script web app endpoint.
* **Auto Header Initialization**: The sheet automatically generates, styles (brand red `#EF2F38`), and freezes columns upon the first submission.
* **Tab Isolation & Resize**: Isolates entries into a dedicated `"Registrations"` spreadsheet tab and auto-resizes columns to prevent text clipping.

### 5. Multi-Language Feedback & Communities
* **English, Khmer, and Chinese**: The entire form (labels, placeholders, 20-clause waiver policies, and validation warnings) changes instantly based on language selection.
* **Telegram Group Invites**: The success modal prompts students to join the general **Infinity TKD Family Group** and their branch-specific group (Olympic or KoukKhleang) dynamically.
* **Support Contact Fallback**: If submission fails, the failure modal displays telephone, support email, and Telegram admin contacts.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 (Hooks, Context, state-driven rendering)
* **Build Tool**: Vite (Fast HMR & asset bundlers)
* **Styling**: Tailwind CSS v4 and CSS theme tokens, responsive layouts, and reduced-motion transitions
* **Icons**: `@phosphor-icons/react`
* **Fonts**: Self-hosted Fontsource variable fonts; Chinese font styles load on language selection

---

## 📁 Repository Structure

```text
├── public/                     # Brand assets, fonts, manifest, offline fallback
├── src/
│   ├── components/
│   │   └── SearchableSelect.jsx # Keyboard-friendly custom dropdown selector
│   ├── data/
│   │   ├── locations.js        # Complete Cambodia locations cascade database
│   │   ├── relationships.js    # Relations list options
│   │   ├── schools.js          # Phnom Penh school listings
│   │   └── translations.js     # Dictionary files (EN, KM, ZH)
│   ├── App.jsx                 # Core wizard controller & form pages
│   ├── index.css               # Tailwind theme setup and global utilities
│   └── main.jsx                # DOM entry point
├── google_apps_script.js       # Validated, locked, duplicate-protected Apps Script API
├── BACKEND_DEPLOYMENT.md       # Deployment, hosting and operations guide
├── SECURITY_RELIABILITY.md     # Security findings and deployment conditions
├── index.html                  # HTML template
├── package.json                # Project dependencies and script runner
└── README.md                   # Repository documentation
```

---

## 💻 Local Setup & Development

### Prerequisites
Use a supported [Node.js LTS release](https://nodejs.org/en/about/previous-releases) and `npm`. Node 24 LTS is used in deployment; Node 22.13+ also meets the installed tooling's requirements.

### 1. Clone the Repository
```bash
git clone https://github.com/infinity-tkd/infinity-tkd-student-registration-form-2.0.git
cd infinity-tkd-student-registration-form-2.0
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser. Keep the server running; opening the source `index.html` with a `file://` URL does not run a Vite application.

### 4. Build for Production
```bash
npm run build
```
This compiles optimized HTML, CSS, and JS assets into `dist/`. Configure the endpoint first. See the production conditions below before collecting real registrations.

Use `npm run preview` to inspect the build over HTTP at `http://127.0.0.1:4173`. Service-worker offline reopening is enabled in this production preview and HTTPS deployments, rather than the development server.

---

## 🗃️ Google Sheets Database Setup

To hook the form to your Google Sheet:
1. For an existing deployment, follow [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md) and keep its spreadsheet and URL. For a new isolated setup, open a blank Google Sheet and go to **Extensions** -> **Apps Script**.
2. Replace default code with the contents of [google_apps_script.js](google_apps_script.js) and save.
3. Click **Deploy** -> **New Deployment**. Select **Web App**.
   * Execute as: **Me**
   * Who has access: **Anyone**
4. Deploy, copy the public **Web App URL**, and configure it in an ignored `.env.local` file:
   ```dotenv
   VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
5. For GitHub Pages, set the repository Actions variable `VITE_GAS_WEB_APP_URL` to the same public URL. The local `.env.local` is not committed or copied into GitHub Actions.
6. Run `npm run build` and publish your build.

The endpoint URL is public frontend configuration, not a secret. See [SECURITY_RELIABILITY.md](SECURITY_RELIABILITY.md) for security policies, hosting limits, browser draft recovery, offline behavior, and verification commands.

## Production verification

Run `npm run check` for full repository lint, isolated reliability/backend security tests and a production build. Browser verification uses `npm run test:frontend`, `npm run test:offline`, and `npm run test:serving` with Playwright and installed Chrome; every registration POST is intercepted. The offline suite covers actual service workers, tab reopening and version updates. The serving suite checks Vite's production response headers and a simulated Google redirect through the browser. Set `PLAYWRIGHT_MODULE` when using a shared Playwright installation and `FRONTEND_ARTIFACT_DIR` to select a report directory.

The hardened backend was deployed as Version 3 on 30 October 2026 and its read-only health endpoint confirms revision `2026-10-30.1`. Server validation, literal spreadsheet writes, durable duplicate receipts, locking, request limits and generic errors are implemented. Live write tests were declined and no test registrations were created. See [SECURITY_RELIABILITY.md](SECURITY_RELIABILITY.md) for the test boundaries and operational limits.

GitHub Pages applies the HTML meta CSP but does not enforce `_headers`. The prepared `wrangler.jsonc` publishes `dist/` on Cloudflare Static Assets, where the header rules are supported. Hosting account/domain selection is still pending. Set `VITE_GAS_WEB_APP_URL` in the chosen build environment and run `npm run verify:deployment -- https://YOUR-SITE/ https://script.google.com/macros/s/DEPLOYMENT/exec` after publishing; this GET-only gate fails if security headers, assets or the backend health revision are missing. `npm run check` now includes full repository lint and `npm run test:backend` in addition to reliability tests and the build.
