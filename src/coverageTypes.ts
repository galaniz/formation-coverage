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
 * @prop {string} [dir=formation-coverage]
 * @prop {string} [file=formation-coverage.json]
 * @prop {string} [url=http://localhost:3000]
 * @prop {string} [outDir=test]
 * @prop {string} [srcDir=src]
 * @prop {string[]} [include]
 * @prop {string[]} [exclude]
 * @prop {string[]} [reporters] - text | html | lcov
 */
export interface CoverageConfig {
  dir?: string
  file?: string
  url?: string
  outDir?: string
  srcDir?: string
  include?: string[]
  exclude?: string[]
  reporters?: Array<keyof ReportOptions>
}
