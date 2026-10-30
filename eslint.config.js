import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.frontend-check/**']),
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/**/*.{js,jsx}', 'public/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  {
    files: ['build/**/*.mjs', 'scripts/**/*.{cjs,mjs}', 'scratch/**/*.js', '*.config.js', 'fetch_locations.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright's evaluate/initialization callbacks execute inside the page.
    files: ['scripts/verify-frontend.cjs', 'scripts/verify-offline.cjs', 'scripts/verify-serving.cjs'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['google_apps_script.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { SpreadsheetApp: 'readonly', ContentService: 'readonly', Utilities: 'readonly', PropertiesService: 'readonly', LockService: 'readonly' },
    },
    rules: {
      // Apps Script invokes global doGet/doPost entry points externally.
      'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none' }],
    },
  },
])
