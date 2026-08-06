import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.test.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      '**/*.config.{js,mjs,ts}',
      'scripts/**/*.{js,mjs,ts}',
      'tests/**/*.{js,mjs,ts}',
      'src/**/*.test.ts',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
)
