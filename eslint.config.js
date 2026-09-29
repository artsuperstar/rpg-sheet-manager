import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const restricted = (patterns) => ['error', { patterns: patterns.map((group) => ({
  group: [group],
  message: 'Respeite as fronteiras entre app, shared e systems.',
})) }]

export default tseslint.config(
  { ignores: ['dist', 'playwright-report', 'test-results', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restricted(['**/app/**', '**/systems/**']) },
  },
  {
    files: ['src/systems/dnd/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restricted(['**/app/**', '**/ordem/**']) },
  },
  {
    files: ['src/systems/ordem/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restricted(['**/app/**', '**/dnd/**']) },
  },
)

