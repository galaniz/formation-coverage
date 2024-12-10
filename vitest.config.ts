/**
 * Vitest
 */

/* Imports */

import { defineConfig } from 'vitest/config'

/* Config */

export default defineConfig({
  test: {
    cache: false,
    globals: true,
    environment: 'node',
    include: [
      '**/*.test.ts'
    ],
    coverage: {
      exclude: [
        '__tests__',
        '__mocks__',
        "**/*.config.ts",
        '**/*Types.ts',
      ]
    }
  }
})
