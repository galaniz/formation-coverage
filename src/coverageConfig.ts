/**
 * Coverage - Config
 */

/* Imports */

import type { CoverageConfig } from './coverageTypes.js'

/**
 * Default options
 *
 * @type {CoverageConfig}
 */
let coverageConfig: Required<CoverageConfig> = {
  dir: 'formation-coverage',
  file: 'formation-coverage.json',
  url: 'http://localhost:3000',
  reporters: ['text'],
  outDir: 'spec',
  srcDir: 'src',
  include: [],
  exclude: []
}

/**
 * Update default config with user options
 *
 * @param {CoverageConfig} args
 * @return {CoverageConfig}
 */
const setCoverageConfig = (args: CoverageConfig): Required<CoverageConfig> => {
  coverageConfig = Object.assign(coverageConfig, args)

  return coverageConfig
}

/* Exports */

export {
  coverageConfig,
  setCoverageConfig
}
