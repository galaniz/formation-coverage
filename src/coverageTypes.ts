/**
 * Coverage - Types
 */

/* Imports */

import type { ReportOptions } from 'istanbul-reports'

/**
 * @typedef {object} CoverageSourceMap
 * @prop {string} version
 * @prop {string[]} sources
 * @prop {string[]} names
 * @prop {string} [sourceRoot]
 * @prop {string[]} [sourcesContent]
 * @prop {string} mappings
 * @prop {string} file
 */
export interface CoverageSourceMap {
  version: string
  sources: string[]
  names: string[]
  sourceRoot?: string
  sourcesContent?: string[]
  mappings: string
  file: string
}

/**
 * @typedef {object} CoverageRangeData
 * @prop {number} count
 * @prop {number} startOffset
 * @prop {number} endOffset
 */
export interface CoverageRangeData {
  count: number
  startOffset: number
  endOffset: number
}

/**
 * @typedef {object} CoverageFnData
 * @prop {string} functionName
 * @prop {boolean} isBlockCoverage
 * @prop {CoverageRangeData[]} ranges
 */
export interface CoverageFnData {
  functionName: string
  isBlockCoverage: boolean
  ranges: CoverageRangeData[]
}

/**
 * @typedef {object} CoverageData
 * @prop {string} url
 * @prop {string} scriptId
 * @prop {string} [source]
 * @prop {CoverageFnData[]} functions
 */
export interface CoverageData {
  url: string
  scriptId: string
  source?: string
  functions: CoverageFnData[]
}

/**
 * @typedef {function} CoverageReportExclude
 * @param {string} entry
 * @return {boolean}
 */
export type CoverageReportExclude = (entry: string) => boolean

/**
 * @typedef {object} CoverageConfig
 * @prop {string} [dir='formation-coverage'] - Directory for coverage file and reports.
 * @prop {string} [file='formation-coverage.json'] - File name to store test coverage data.
 * @prop {string} [url='http://localhost:3000'] - Web server URL tests run on.
 * @prop {Array<'text'|'html'|'lcov'>} [reporters=['text']] - Coverage [report formats](https://www.npmjs.com/package/@types/istanbul-reports).
 * @prop {string} [outDir='spec'] - Directory with compiled and source map files.
 * @prop {string} [srcDir='src'] - Directory with source TypeScript files.
 * @prop {string[]} [include] - Glob patterns to include in reports.
 * @prop {string[]} [exclude] - Glob patterns to exclude from reports.
 */
export interface CoverageConfig {
  dir?: string
  file?: string
  url?: string
  reporters?: Array<keyof ReportOptions>
  outDir?: string
  srcDir?: string
  include?: string[]
  exclude?: string[]
}
