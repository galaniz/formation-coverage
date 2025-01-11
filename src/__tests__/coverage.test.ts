/**
 * Coverage - Tests
 */

/* Imports */

import type { CoverageData } from '../coverageTypes.js'
import { it, expect, describe, vi, beforeEach } from 'vitest'
import { fs, vol } from 'memfs'
import {
  doCoverage,
  setupCoverage,
  createCoverageReport
} from '../coverage.js'

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
const testFile: string = 'testFile'

/**
 * Mock coverage data
 *
 * @type {CoverageData[]}
 */
const testCoverageData: CoverageData[] = [
  {
    url: '/script.js',
    scriptId: '123',
    source: "function test() { console.log('Hello, world!'); }",
    functions: [
      {
        functionName: 'test',
        isBlockCoverage: true,
        ranges: [
          {
            count: 1,
            startOffset: 0,
            endOffset: 10
          },
          {
            count: 2,
            startOffset: 15,
            endOffset: 50
          }
        ]
      }
    ]
  },
  {
    url: 'http://example.com/other-script.js',
    scriptId: '456',
    functions: [
      {
        functionName: 'otherFunction',
        isBlockCoverage: false,
        ranges: [
          {
            count: 0,
            startOffset: 5,
            endOffset: 25
          }
        ]
      }
    ]
  }
]

/* Test setupCoverage */

describe('setupCoverage()', () => {
  it('should throw error from empty dir name and file name', async () => {
    // @ts-expect-error
    await expect(async () => await setupCoverage()).rejects.toThrowError()
  })

  it('should throw an error if access EACCES', async () => {
    vi.spyOn(fs.promises, 'access').mockRejectedValueOnce(new Error('EACCES'))
    vol.fromJSON({
      '/files/testDir/testFile.json': ''
    })

    await expect(async () => await setupCoverage(testDir, testFile)).rejects.toThrowError('EACCES')
  })

  it('should throw an error if rm EPERM', async () => {
    vi.spyOn(fs.promises, 'rm').mockRejectedValueOnce(new Error('EPERM'))
    vol.fromJSON({
      '/files/testDir/testFile.json': ''
    })

    await expect(async () => await setupCoverage(testDir, testFile)).rejects.toThrowError('EPERM')
  })

  it('should create directory and file', async () => {
    await setupCoverage(testDir, testFile)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}.json`]

    expect(file).toBeDefined()
  })

  it('should remove then create directory and file', async () => {
    vol.fromJSON({
      '/files/testDir/testFile.json': '[{"test":"test"}]'
    })

    await setupCoverage(testDir, testFile)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}.json`]
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

  it('should not append to coverage file if browser is webkit', async () => {
    const testPage = {
      coverage: {
        startJSCoverage: vi.fn().mockResolvedValue(undefined),
        stopJSCoverage: vi.fn().mockResolvedValue(testCoverageData)
      }
    }

    await doCoverage('webkit', testPage as any, true)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}.json`]
    const expectedFileContent = ''

    expect(file).toBe(expectedFileContent)
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

    await doCoverage('chromium', testPage as any, true)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}.json`]
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

    await doCoverage('chromium', testPage as any, false)

    const files = vol.toJSON()
    const file = files[`${testDir}/${testFile}.json`]
    const expectedFileContent = JSON.stringify(testCoverageData) + '*|FRM_BREAK|*'

    expect(start).not.toHaveBeenCalled()
    expect(end).toHaveBeenCalledTimes(1)
    expect(file).toBe(expectedFileContent)
  })
})
