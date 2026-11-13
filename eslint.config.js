import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const OFFLINE = "Aucune donnée ne quitte le navigateur : passer par src/state/ (localStorage)."

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Garde-fou : les formulaires n'envoient rien à aucun serveur.
      'no-restricted-globals': [
        'error',
        ...['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource'].map((name) => ({ name, message: OFFLINE })),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'fetch', message: OFFLINE },
        { object: 'navigator', property: 'sendBeacon', message: OFFLINE },
      ],
    },
  },
)
