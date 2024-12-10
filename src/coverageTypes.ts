/**
 * Coverage - Types
 */

/* Imports */

import type { ReportOptions } from 'istanbul-reports'

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
 * @param {string} url
 * @param {string} scriptId
 * @param {string} [source]
 * @param {CoverageFnData[]} functions
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
 * @typedef {object} CoverageReportArgs
 * @param {string} [outDir=test]
 * @param {string} [srcDir=src]
 * @param {string[]} [include]
 * @param {string[]} [exclude]
 * @param {string[]} [reporters] - text | html | lcov
 */
export interface CoverageReportArgs {
  outDir?: string
  srcDir?: string
  include?: string[]
  exclude?: string[]
  reporters?: Array<keyof ReportOptions>
}
