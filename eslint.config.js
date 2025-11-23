/**
 * Eslint
 */

/* Imports */

import tseslint from 'typescript-eslint'

/* Config */

export default tseslint.config(
  {
    ignores: [
      '**/lib/*',
      '**/node_modules/*',
      '**/coverage/*'
    ]
  },
  {
    files: [
      'src/**/*.ts'
    ],
    rules: {
      semi: [ // Prefer no semicolons
        'warn',
        'never'
      ],
      'comma-dangle': [ // Prefer no trailing commas
        'warn',
        'never'
      ],
      quotes: [ // Prefer single quotes
        'warn',
        'single',
        {
          avoidEscape: true
        }
      ],
      '@typescript-eslint/restrict-template-expressions': [ // Allow numbers in template expressions
        'error',
        {
          allowNumber: true
        }
      ]
    },
    extends: [
      tseslint.configs.strictTypeChecked
    ],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        project: './tsconfig.json'
      }
    }
  }
)
