/**
 * Coverage - Tests
 */

/* Imports */

import type { Page } from '@playwright/test'
import type { CoverageData } from '../coverageTypes.js'
import { it, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { fs, vol } from 'memfs'
import { doCoverage, setupCoverage } from '../coverage.js'
import { setCoverageConfig } from '../coverageConfig.js'

/**
 * Test directory
 *
 * @type {string}
 */
const testDir: string = '/files/testDir'

/**
 * Test coverage file
 *
 * @type {string}
 */
const testFile: string = 'testFile.json'

/**
 * Test script one js
 *
 * @type {string}
 */
const testScript1: string = "export function test(message = 'Hello, world!') {\n    console.info(message);\n}\n//# sourceMappingURL=script1.js.map"

/**
 * Test script two js
 *
 * @type {string}
 */
const testScript2: string = "export function other() {\n    return 'something';\n}\n//# sourceMappingURL=script2.js.map"

/**
 * Mock coverage data
 *
 * @type {CoverageData[]}
 */
const testCoverageData: CoverageData[] = [
  {
    url: '/files/test/script1.js',
    scriptId: '1',
    source: testScript1,
    functions: [
      {
        functionName: 'test',
        isBlockCoverage: false,
        ranges: [
          { // 100% coverage
            startOffset: 0,
            endOffset: 67,
            count: 1
          }
        ]
      }
    ]
  },
  {
    url: '/files/test/script2.js',
    scriptId: '2',
    source: testScript2,
    functions: [
      {
        functionName: 'other',
        isBlockCoverage: false,
        ranges: [
          { // 50% coverage
            startOffset: 0,
            endOffset: 25,
            count: 1
          },
          { // Uncovered
            startOffset: 26,
            endOffset: 50,
            count: 0
          }
        ]
      }
    ]
  }
]

/* Set and reset directory and file */

beforeEach(() => {
  setCoverageConfig({
    dir: testDir,
    file: testFile
  })
})

afterEach(() => {
  setCoverageConfig({
    dir: 'formation-coverage',
    file: 'formation-coverage.json'
  })
})

/* Test setupCoverage */

describe('setupCoverage()', () => {
  it('should throw an error if access EACCES', async () => {
    vi.spyOn(fs.promises, 'access').mockRejectedValueOnce(new Error('EACCES'))
    vol.fromJSON({
      '/files/testDir/testFile.json': ''
    })

    await expect(async () => { await setupCoverage() }).rejects.toThrowError('EACCES')
  })

  it('should throw an error if rm EPERM', async () => {
    vi.spyOn(fs.promises, 'rm').mockRejectedValueOnce(new Error('EPERM'))
    vol.fromJSON({
      '/files/testDir/testFile.json': ''
    })

    await expect(async () => { await setupCoverage() }).rejects.toThrowError('EPERM')
  })

  it('should create directory and file', async () => {
    await setupCoverage()

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}`]

    expect(file).toBeDefined()
  })

  it('should remove then create directory and file', async () => {
    vol.fromJSON({
      '/files/testDir/testFile.json': '[{"test":"test"}]'
    })

    await setupCoverage()

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}`]
    const expectedFileContent = ''

    expect(file).toBeDefined()
    expect(file).toBe(expectedFileContent)
  })
})

/* Test doCoverage */

describe('doCoverage()', () => {
  beforeEach(() => {
    vol.fromJSON({
      '/files/testDir/testFile.json': ''
    })
  })

  afterEach(() => {
    process.env.FORMATION_COVERAGE_FILE = '/files/testDir/testFile.json'
  })

  it('should not append to coverage file if browser is webkit', async () => {
    const testPage = {
      coverage: {
        startJSCoverage: vi.fn().mockResolvedValue(undefined),
        stopJSCoverage: vi.fn().mockResolvedValue(testCoverageData)
      }
    }

    await doCoverage('webkit', testPage as unknown as Page, true)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}`]
    const expectedFileContent = ''

    expect(file).toBe(expectedFileContent)
  })

  it('should throw an error if file path environment variable is null', async () => {
    const testPage = {
      coverage: {
        startJSCoverage: vi.fn().mockResolvedValue(undefined),
        stopJSCoverage: vi.fn().mockResolvedValue(testCoverageData)
      }
    }

    delete process.env.FORMATION_COVERAGE_FILE

    await expect(async () => { await doCoverage('chromium', testPage as unknown as Page, false) }).rejects.toThrowError('No formation coverage file path')
  })

  it('should start coverage', async () => {
    const start = vi.fn().mockResolvedValue(undefined)
    const end = vi.fn().mockResolvedValue(testCoverageData)

    const testPage = {
      coverage: {
        startJSCoverage: start,
        stopJSCoverage: end
      }
    }

    await doCoverage('chromium', testPage as unknown as Page, true)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}`]
    const expectedFileContent = ''

    expect(start).toHaveBeenCalledTimes(1)
    expect(end).not.toHaveBeenCalled()
    expect(file).toBe(expectedFileContent)
  })

  it('should end coverage and append to file', async () => {
    const start = vi.fn().mockResolvedValue(undefined)
    const end = vi.fn().mockResolvedValue(testCoverageData)

    const testPage = {
      coverage: {
        startJSCoverage: start,
        stopJSCoverage: end
      }
    }

    await doCoverage('chromium', testPage as unknown as Page, false)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}`]
    const expectedFileContent = JSON.stringify(testCoverageData) + '*|FRM_BREAK|*'

    expect(start).not.toHaveBeenCalled()
    expect(end).toHaveBeenCalledTimes(1)
    expect(file).toBe(expectedFileContent)
  })
})
