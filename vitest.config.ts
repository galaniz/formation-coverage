/**
 * Vitest
 */

import { defineConfig } from 'vitest/config'

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
      reporter: [
        'text'
      ],
      exclude: [
        'lib/',
        '**/*.test.ts',
        "**/*.config.ts",
        '**/*Types.ts',
        '*.js'
      ]
    }
  }
})
