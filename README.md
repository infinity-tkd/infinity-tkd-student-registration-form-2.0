# Infinity Taekwondo - Student Registration Form 2.0

A high-fidelity, premium, and interactive student registration web application built for **Infinity Taekwondo**. This project features a 5-step registration wizard, strict local input validations, dark mode, multi-language support (English, Khmer, and Chinese), Phnom Penh schools database auto-filtering, and serverless Google Sheets backend database integration.

---

## 🚀 Key Features

### 1. Premium Obsidian UI/UX
* **Obsidian & Frosted Glassmorphism**: Stunning aesthetics built on frosted glass cards, dynamic background gradients, and smooth focus highlights.
* **Responsive Layout**: Fluid layouts designed for mobile, tablet, and desktop viewports.
* **Dynamic Dark/Light Mode**: Toggle between themes instantly, with dark mode variables supported natively.
* **Unified Iconography**: Clean icons powered by Phosphor Icons and FontAwesome.

### 2. Smart Form Navigation & Logic
* **5-Step Wizard Progress**: Tracks personal details, emergency info, branch selection, medical questionnaires, and agreement signatures.
* **Searchable Dropdowns**: Upgraded custom selectors (e.g. nationality, city/province, class times, belts) with full search filtering and keyboard navigation (Arrow Up/Down, Enter, Escape).
* **School Auto-Filter**: Smart search input that dynamically filters and autocompletes from Phnom Penh schools.
* **Auto-Scroll to Error**: Clicking "Next Step" or "Submit" with invalid fields automatically scrolls to and focuses the first invalid element.

### 3. Strict Validation & Rules
* **Minimum Age Policy (6+)**: Enforces that students must be at least 6 years old (ages 6 to 100). The HTML date picker restricts dates dynamically to prevent invalid entries.
* **Strict Minor Policy**: If a student is under 17, the emergency contact relation is validated to be a Parent or Guardian (supporting multi-language inputs). Submissions are locked until this is met.
* **Secure Digital Signature**: Requires the student to type their signature matching their Step 1 English Name (case-insensitive and space-insensitive matching).
* **Keystroke Sanitization & XSS Filtering**: Automatically strips HTML tags on change, blocks non-numeric inputs for phones, heights, weights, and sanitizes character pools.

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
* **Styling**: Tailwind CSS v4 (Obsidian theme tokens, custom animations, transitions)
* **Icon Packs**: `@phosphor-icons/react` & FontAwesome 6.4.0 (CDN)

---

## 📁 Repository Structure

```text
├── Logo/                       # Brand SVG assets, guide guides, and PNG files
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
├── google_apps_script.js       # Production-ready database script
├── google_sheets_integration.md # Integration & deployment guide
├── index.html                  # HTML template
├── package.json                # Project dependencies and script runner
└── README.md                   # Repository documentation
```

---

## 💻 Local Setup & Development

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18 or higher) and `npm` installed.

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
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
This compiles optimized HTML, CSS, and JS assets into the `dist/` folder, ready for hosting.

---

## 🗃️ Google Sheets Database Setup

To hook the form to your Google Sheet:
1. Open a blank Google Sheet, go to **Extensions** -> **Apps Script**.
2. Replace default code with the contents of [google_apps_script.js](google_apps_script.js) and save.
3. Click **Deploy** -> **New Deployment**. Select **Web App**.
   * Execute as: **Me**
   * Who has access: **Anyone**
4. Deploy, copy the **Web App URL**, and paste it inside [src/App.jsx](src/App.jsx) at line 44:
   ```javascript
   const GAS_WEB_APP_URL = "YOUR_DEPLOYED_URL_HERE";
   ```
5. Run `npm run build` and publish your build.

For detailed steps, refer to [google_sheets_integration.md](google_sheets_integration.md).
