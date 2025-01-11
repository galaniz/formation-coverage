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
    clearMocks: true,
    environment: 'node',
    setupFiles: [
      './tests/setup.ts'
    ],
    include: [
      '**/*.test.ts'
    ],
    coverage: {
      exclude: [
        'lib/',
        '__tests__/',
        '**/*.test.ts',
        "**/*.config.ts",
        '**/*Types.ts',
      ]
    }
  }
})
