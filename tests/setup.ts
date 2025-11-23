/**
 * Tests - Setup
 */

/* Imports */

import { afterEach, vi } from 'vitest'
import { vol, fs } from 'memfs'

/* Mock fs dependencies */

vi.mock('fs', () => fs)
vi.mock('fs/promises', () => fs.promises)
vi.mock('node:fs', () => fs)
vi.mock('node:fs/promises', () => fs.promises)

/* Reset virtual files */

afterEach(() => {
  vol.reset()
})
