/**
 * Coverage
 */

/* Imports */

import type { Page } from '@playwright/test'
import type { CoverageData, CoverageReportArgs } from './coverageTypes.js'
import { mkdir, appendFile, writeFile, readFile, access, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { glob } from 'glob'
import v8toIstanbul from 'v8-to-istanbul'
import libCoverage from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import reports from 'istanbul-reports'

/**
 * Coverage directory name
 *
 * @type {string}
 */
let coverageDir: string = 'coverage'

/**
 * Temporary coverage file name
 *
 * @type {string}
 */
let coverageTempFile: string = 'coverage-tmp.json'

/**
 * Coverage file name
 *
 * @type {string}
 */
let coverageFile: string = 'coverage.json'

/**
 * Separator for temporary file data
 *
 * @type {string}
 */
const coverageBreak: string = '*|FRM_BREAK|*'

/**
 * Start and end playwright coverage and save to temp file
 *
 * @param {string} browserName
 * @param {Page} page
 * @param {boolean} [start=true]
 * @return {Promise<void>}
 */
const doCoverage = async (
  browserName: string,
  page: Page,
  start: boolean = true
): Promise<void> => {
  try {
    if (browserName !== 'chromium') {
      return
    }

    if (start) {
      return await page.coverage.startJSCoverage()
    }

    const result = await page.coverage.stopJSCoverage()

    await appendFile(resolve(coverageTempFile), JSON.stringify(result) + coverageBreak)
  } catch (error) {
    console.error('[FRM] Error appending to temporary coverage file: ', error)
  }
}

/**
 * Convert playwright coverage data
 *
 * @param {string} testUrl
 * @return {Promise<CoverageMapData[]>}
 */
const loadCoverage = async (
  testUrl: string = 'http://localhost:3000'
): Promise<CoverageData[]> => {
  try {
    const fileData = await readFile(resolve(coverageTempFile), 'utf8')
    const entries = fileData.split(coverageBreak).filter(Boolean)
    const coverage: CoverageData[] = entries.map(entry => JSON.parse(entry)).flat(Infinity)

    const result = coverage.map((entry) => {
      const { url, source } = entry

      if (source == null) {
        return entry
      }

      const sourceFile = url.replace(`${testUrl}/`, '').replace('.js', '.js.map')
      const newSource = source.replace(/sourceMappingURL=([^]+)\.map/, `sourceMappingURL=${sourceFile}`)

      entry.source = newSource
      entry.url = url.replace(`${testUrl}/`, './')

      return entry
    })

    return result
  } catch (error) {
    console.error('[FRM] Error loading coverage data:', error)
    return []
  }
}

/**
 * Create coverage folder and file
 *
 * @param {string} dirName
 * @param {string} fileName
 * @return {void}
 */
const setupCoverage = async (dirName: string, fileName: string): Promise<void> => {
  try {
    coverageDir = dirName
    coverageFile = `${dirName}/${fileName}.json`
    coverageTempFile = `${dirName}/${fileName}-tmp.json`

    await mkdir(resolve(coverageDir))
    const data = await loadCoverage()
    await writeFile(resolve(coverageFile), JSON.stringify(data))
  } catch (error) {
    console.error('[FRM] Error creating coverage file: ', error)
  }
}

/**
 * Create coverage report from json data
 *
 * @param {CoverageReportArgs} args
 * @return {Promise<void>}
 */
const createCoverageReport = async (args: CoverageReportArgs): Promise<void> => {
  try {
    /* Args */

    const {
      reporters = [],
      outDir = 'test',
      srcDir = 'src',
      include = [],
      exclude = []
    } = args

    /* Files to include in report */

    const includeFiles = await glob(include, { ignore: exclude })

    /* Coverage data map */

    const fileContents = await readFile(resolve(coverageFile), 'utf8')
    const coverageData = JSON.parse(fileContents)
    const coverageMap = libCoverage.createCoverageMap()
    const covered: string[] = []

    for (const entry of coverageData) {
      const entryUrl = entry.url

      if (!includeFiles.includes(entryUrl.replace('./', ''))) {
        continue
      }

      const converter = v8toIstanbul(entryUrl)
      await converter.load()
      converter.applyCoverage(entry.functions)

      const convertedCoverage = converter.toIstanbul()
      coverageMap.merge(convertedCoverage)

      covered.push(entryUrl)
    }

    /* Include outstanding files from src in map */

    for await (const file of includeFiles) {
      if (covered.includes(`./${file}`)) {
        continue
      }

      const filePath = resolve(file)
      const srcFilePath = filePath.replace(outDir, srcDir).replace('.js', '.ts')
      const srcEntry: Record<string, any> = {}

      srcEntry[srcFilePath] = {
        path: srcFilePath,
        statementMap: {},
        s: {},
        branchMap: {},
        b: {},
        fnMap: {},
        f: {},
        lineCoverage: {}
      }

      coverageMap.merge(srcEntry)
    }

    /* Context */

    const context = libReport.createContext({
      dir: `./${coverageDir}/coverage-report`,
      coverageMap
    })

    /* Reporters */

    reporters.forEach(reporter => {
      const report = reports.create(reporter, {
        projectRoot: resolve(coverageDir)
      })

      report.execute(context)
    })
  } catch (error) {
    console.error('[FRM] Error creating coverage report:', error)
  }
}

/**
 * Delete coverage files and folders
 *
 * @return {Promise<void>}
 */
const clearCoverage = async (): Promise<void> => {
  try {
    const dir = resolve(coverageDir)
    await access(dir)
    await rm(dir, { recursive: true, force: true })
  } catch (error) {
    const err = error as { code?: string }

    if (err?.code === 'ENOENT') {
      return
    }

    console.error('[FRM] Error clearing coverage files or directories:', error)
  }
}

/* Exports */

export {
  doCoverage,
  loadCoverage,
  setupCoverage,
  clearCoverage,
  createCoverageReport
}
