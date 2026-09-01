import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'docs/project/extracted']),
  {
    // The service worker runs in a worker global, not the browser one.
    files: ['public/sw.js'],
    languageOptions: {
      globals: { ...globals.serviceworker, importScripts: 'readonly' },
    },
    rules: { 'no-undef': 'error' },
  },
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['public/sw.js'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Leading underscore marks a parameter that is part of a planned
      // interface but unused by the current placeholder implementation.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
])
