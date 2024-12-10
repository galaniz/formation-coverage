/**
 * Tests
 */

/* Imports */

import { it, expect, describe, vi, beforeEach } from 'vitest'
import { fs, vol } from 'memfs'
import {
  doCoverage,
  loadCoverage,
  setupCoverage,
  clearCoverage,
  createCoverageReport
} from '../src/coverage.js'

/* Mock dependencies */

vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset() // Reset the state of in-memory fs
})

/* Test setupCoverage */

describe('setupCoverage()', () => {
  it('should throw and handle error from empty dir name and file name', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // @ts-expect-error
    await setupCoverage()

    expect(console.error).toHaveBeenCalled()
  })
})
