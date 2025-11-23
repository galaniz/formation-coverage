/**
 * Coverage - Config
 */

/* Imports */

import type { CoverageConfig } from './coverageTypes.js'

/**
 * Default options.
 *
 * @private
 * @type {CoverageConfig}
 */
const coverageConfig: Required<CoverageConfig> = {
  dir: 'formation-coverage',
  file: 'formation-coverage.json',
  url: 'http://localhost:3000',
  reporters: ['text'],
  outDir: 'spec',
  srcDir: 'src',
  include: [],
  exclude: []
}

/* Exports */

export { coverageConfig }
