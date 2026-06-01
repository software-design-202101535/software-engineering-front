import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },

  // JS/TS 기본 권장 규칙
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // 코드 품질
      'no-console': 'error',
      'no-debugger': 'error',
    },
  },

  // 테스트 파일: vitest globals 허용, console 허용
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Playwright E2E + 설정 파일: node globals, console 허용.
  // Playwright fixture의 `use` 인자가 React Hook으로 오인되므로 rules-of-hooks 비활성.
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-console': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },

  // Service Worker (public/firebase-messaging-sw.js 등)
  {
    files: ['public/**/*.js'],
    languageOptions: {
      globals: { ...globals.serviceworker, firebase: 'readonly' },
    },
  },
)
