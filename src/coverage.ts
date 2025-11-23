/**
 * Coverage
 *
 * @file
 * title: Formation Coverage
 * Utility to generate code coverage reports for Playwright tests specifically for TypeScript source code.
 *
 * @example
 * title: Installation
 * shell: npm install -D @alanizcreative/formation-coverage
 *
 * @example
 * title: TypeScript Configuration
 * desc: Ensure your `tsconfig.json` includes the following compiler options to enable source map generation:
 * json: {
 *   "compilerOptions": {
 *     "sourceMap": true,
 *     "inlineSourceMap": false,
 *     "inlineSources": true
 *   }
 * }
 */

/* Imports */

import type { Page } from '@playwright/test'
import type { CoverageConfig, CoverageData, CoverageSourceMap } from './coverageTypes.js'
import { mkdir, appendFile, writeFile, readFile, access, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { glob } from 'glob'
import { createInstrumenter } from 'istanbul-lib-instrument'
import { coverageConfig } from './coverageConfig.js'
import libCoverage from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import reports from 'istanbul-reports'
import v8toIstanbul from 'v8-to-istanbul'

/**
 * Coverage directory or file.
 *
 * @private
 * @param {boolean} [isFile]
 * @return {string}
 */
const getCoveragePath = (isFile: boolean = true): string => {
  const { dir, file } = coverageConfig

  if (isFile) {
    return resolve(dir, file)
  }

  return resolve(dir)
}

/**
 * Separator for file data.
 *
 * @private
 * @type {string}
 */
const coverageBreak: string = '*|FRM_BREAK|*'

/**
 * Convert Playwright coverage data.
 *
 * @private
 * @param {string} testUrl
 * @param {boolean} urlAbs
 * @return {Promise<CoverageMapData[]>}
 */
const loadCoverage = async (testUrl: string, urlAbs: boolean = false): Promise<CoverageData[]> => {
  const fileData = await readFile(getCoveragePath(), 'utf8')
  const entries = fileData.split(coverageBreak).filter(Boolean)
  const coverage: CoverageData[] = entries.map(entry => JSON.parse(entry) as CoverageData).flat(Infinity)

  return coverage.map((entry) => {
    const { url, source } = entry

    if (source == null) {
      return entry
    }

    const sourceFile = url.replace('.js', '.js.map').replace(urlAbs ? '' : `${testUrl}/`, '')

    entry.source = source.replace(/sourceMappingURL=([^]+)\.map/, `sourceMappingURL=${sourceFile}`)
    entry.url = urlAbs ? url : url.replace(`${testUrl}/`, './')

    return entry
  })
}

/**
 * Set options and create coverage folder and file.
 * 
 * @example
 * desc: It's recommended to configure coverage options in your Playwright `globalSetup` file:
 * ts: // tests/setup.ts
 * 
 * import { setupCoverage } from '@alanizcreative/formation-coverage/coverage.js'
 * 
 * export default async function () {
 *   await setupCoverage({
 *     dir: 'spec-coverage',
 *     file: 'spec-coverage.json',
 *     url: 'http://localhost:8000',
 *     outDir: 'spec',
 *     srcDir: 'src',
 *     reporters: [
 *       'text',
 *       'html'
 *     ],
 *     include: [
 *       'spec/components/**\/*.js',
 *       'spec/effects/**\/*.js',
 *       'spec/layouts/**\/*.js',
 *       'spec/objects/**\/*.js'
 *     ],
 *     exclude: [
 *       'spec/utils/**\/*.js',
 *       'spec/config/**\/*.js',
 *       'spec/tests/**\/*.js',
 *       'spec/**\/*.spec.js'
 *     ]
 *   })
 * }
 * @param {CoverageConfig} args
 * @return {Promise<void>}
 */
const setupCoverage = async (args: CoverageConfig): Promise<void> => {
  /* Set config */

  Object.entries(args).forEach(([key, value]) => {
    coverageConfig[key as keyof CoverageConfig] = value // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  })

  /* Directory and file */

  const dir = getCoveragePath(false)
  const file = getCoveragePath()

  /* Clear directory if it exists */

  try {
    await access(dir)
    await rm(file, { recursive: true, force: true })
  } catch (error) {
    const err = error as { code?: string }

    if (err.code !== 'ENOENT') {
      throw error
    }
  }

  /* Create directory and file */

  process.env.FORMATION_COVERAGE_DIR = dir
  process.env.FORMATION_COVERAGE_FILE = file

  await mkdir(dir, { recursive: true })
  await writeFile(file, '')
}

/**
 * Start and end Playwright coverage and save to coverage file.
 * 
 * @example
 * desc: Use `doCoverage` before and after each test to capture coverage data:
 * ts: // components/Navigation/__tests__/Navigation.spec.ts
 * 
 * import { test, expect } from '@playwright/test'
 * import { doCoverage } from '@alanizcreative/formation-coverage/coverage.js'
 * 
 * test.describe('Navigation', () => {
 *   test.beforeEach(async ({ browserName, page }) => {
 *     await doCoverage(browserName, page, true)
 *   })
 * 
 *   test.afterEach(async ({ browserName, page }) => {
 *     await doCoverage(browserName, page, false)
 *   })
 * 
 *   // Your test cases
 * })
 * @param {string} browserName - Coverage only applies to Chromium browsers.
 * @param {Page} page - [Page](https://playwright.dev/docs/api/class-page) object provided by Playwright.
 * @param {boolean} [start=true] - Start or stop coverage.
 * @return {Promise<void>}
 */
const doCoverage = async (
  browserName: string,
  page: Page,
  start: boolean = true
): Promise<void> => {
  if (browserName !== 'chromium') {
    return
  }

  if (start) {
    await page.coverage.startJSCoverage()
    return
  }

  const result = await page.coverage.stopJSCoverage()
  const filePath = process.env.FORMATION_COVERAGE_FILE

  if (filePath == null) {
    throw new Error('No formation coverage file path')
  }

  await appendFile(filePath, JSON.stringify(result) + coverageBreak)
}

/**
 * Create coverage report from JSON data.
 *
 * @example
 * desc: Generate coverage reports after tests complete in your Playwright `globalTeardown` file:
 * ts: // tests/teardown.ts
 * 
 * import { createCoverageReport } from '@alanizcreative/formation-coverage/coverage.js'
 * 
 * export default async function () {
 *   await createCoverageReport()
 * }
 * @return {Promise<void>}
 */
const createCoverageReport = async (): Promise<void> => {
  /* Config args */

  const {
    url: testUrl,
    reporters,
    outDir,
    srcDir,
    include,
    exclude
  } = coverageConfig

  /* Dir */

  const coverageDir = getCoveragePath(false)

  /* URL type */

  const isAbs = testUrl.startsWith('/')
  const relDir = isAbs ? '' : './'

  /* Files to include in report */

  const includeFiles = await glob(include, { ignore: exclude })
  const hasIncludeFiles = includeFiles.length > 0

  /* Coverage data map */

  const coverageData = await loadCoverage(testUrl, isAbs)
  const coverageMap = libCoverage.createCoverageMap()
  const covered: string[] = []

  for (const entry of coverageData) {
    const entryUrl = entry.url

    if (hasIncludeFiles && !includeFiles.includes(entryUrl.replace(relDir, ''))) {
      continue
    }

    const converter = v8toIstanbul(entryUrl)
    await converter.load()
    converter.applyCoverage(entry.functions)

    const convertedCoverage = converter.toIstanbul()
    coverageMap.merge(convertedCoverage)

    covered.push(entryUrl)
  }

  /* Include outstanding/zero coverage files from src in map */

  for (const file of includeFiles) {
    if (covered.includes(`${relDir}${file}`)) {
      continue
    }

    const jsfilePath = resolve(file)
    const jsFileContents = await readFile(jsfilePath, 'utf-8')
    const mapFileContents = await readFile(`${file}.map`, 'utf-8')
    const mapFileJson = JSON.parse(mapFileContents) as CoverageSourceMap
    const tsFilePath = jsfilePath.replace(outDir, srcDir).replace('.js', '.ts')
    const tsEntry: libCoverage.CoverageMapData = {}

    const instrumenter = createInstrumenter({ produceSourceMap: true })
    instrumenter.instrumentSync(jsFileContents, jsfilePath, mapFileJson)

    tsEntry[tsFilePath] = Object.assign(instrumenter.fileCoverage, {
      path: tsFilePath
    })

    coverageMap.merge(tsEntry)
  }

  /* Context */

  const context = libReport.createContext({
    dir: `${coverageDir}/coverage-report`,
    coverageMap
  })

  /* Reporters */

  reporters.forEach(reporter => {
    const report = reports.create(reporter, {
      projectRoot: coverageDir
    })

    report.execute(context)
  })
}
 
/* Exports */

export {
  setupCoverage,
  doCoverage,
  createCoverageReport
}
