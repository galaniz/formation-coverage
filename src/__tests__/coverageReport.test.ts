/**
 * Coverage - Report Tests
 */

/* Imports */

import type { CoverageData } from '../coverageTypes.js'
import { it, expect, describe, vi, beforeAll, afterAll } from 'vitest'
import { rm, mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setupCoverage, createCoverageReport } from '../coverage.js'
import { setCoverageConfig } from '../coverageConfig.js'

/* Use temporary fs instead of memfs */

vi.unmock('node:fs')
vi.unmock('node:fs/promises')

/**
 * Test script one js
 *
 * @type {string}
 */
const testScript1: string = "export function test(message = 'Hello, world!') {\n    console.info(message);\n}\n//# sourceMappingURL=script1.js.map"

/**
 * Test script one ts
 *
 * @type {string}
 */
const testScriptTs1: string = "export function test(message: string = 'Hello, world!'): void {\n  console.info(message);\n}"

/**
 * Test script two js
 *
 * @type {string}
 */
const testScript2: string = "export function other() {\n    return 'something';\n}\n//# sourceMappingURL=script2.js.map"

/**
 * Test script two ts
 *
 * @type {string}
 */
const testScriptTs2: string = "export function other(): string {\n  return 'something';\n}"

/**
 * Test script three js
 *
 * @type {string}
 */
const testScript3: string = 'export function add(a, b) {\n    if (!a) {\n        return 0;\n    }\n    return a + b;\n}\n//# sourceMappingURL=script3.js.map'

/**
 * Test script three ts
 *
 * @type {string}
 */
const testScriptTs3: string = 'export function add(a: number, b: number): number {\n  if (!a) { return 0; }\n  return a + b;\n}'

/**
 * Test script four js
 *
 * @type {string}
 */
const testScript4: string = 'export function multiply(a, b) {\n    return a * b;\n}\n//# sourceMappingURL=script4.js.map'

/**
 * Test script four ts
 *
 * @type {string}
 */
const testScriptTs4: string = 'export function multiply(a: number, b: number): number {\n  return a * b;\n}'

/**
 * Test script five js
 *
 * @type {string}
 */
const testScript5: string = 'export function divide(a, b) {\n    return a / b;\n}\n//# sourceMappingURL=script5.js.map'

/**
 * Test script five ts
 *
 * @type {string}
 */
const testScriptTs5: string = 'export function divide(a: number, b: number): number {\n  return a / b;\n}'

/**
 * Test lcov output
 * 
 * @type {string}
 */
const testLcov: string = `TN:
SF:../src/script1.ts
FN:1,test
FNF:1
FNH:1
FNDA:1,test
DA:1,1
DA:2,1
DA:3,1
LF:3
LH:3
BRDA:1,0,0,1
BRF:1
BRH:1
end_of_record
TN:
SF:../src/script2.ts
FN:1,other
FNF:1
FNH:0
FNDA:0,other
DA:1,0
DA:2,1
DA:3,1
LF:3
LH:2
BRDA:1,0,0,0
BRF:1
BRH:0
end_of_record
TN:
SF:../src/script3.ts
FN:1,add
FNF:1
FNH:1
FNDA:1,add
DA:1,1
DA:2,0
DA:3,1
DA:4,1
LF:4
LH:3
BRDA:1,0,0,1
BRDA:1,1,0,0
BRF:2
BRH:1
end_of_record
TN:
SF:../src/five/script5.ts
FN:1,divide
FNF:1
FNH:0
FNDA:0,divide
DA:2,0
LF:1
LH:0
BRF:0
BRH:0
end_of_record
`
/* Tests */

describe('createCoverageReport()', () => {
  let tempDir: string
  let outDir: string
  let srcDir: string
  let coverageDir: string

  beforeAll(async () => {
    tempDir = await mkdtemp(join(process.env.TEMP || tmpdir(), 'test-'))
    outDir = join(tempDir, 'test')
    srcDir = join(tempDir, 'src')
    coverageDir = join(tempDir, 'formation-coverage')

    await mkdir(outDir)
    await mkdir(srcDir)
    await mkdir(`${outDir}/five`)
    await mkdir(`${srcDir}/five`)

    const coverageData1: CoverageData[] = [
      {
        url: `${outDir}/script1.js`,
        scriptId: '1',
        source: testScript1,
        functions: [
          {
            functionName: 'test',
            isBlockCoverage: true,
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
        url: `${outDir}/script2.js`,
        scriptId: '2',
        source: testScript2,
        functions: [
          {
            functionName: 'other',
            isBlockCoverage: true,
            ranges: [
              { // 0% coverage
                startOffset: 0,
                endOffset: 26,
                count: 0
              },
              {
                startOffset: 27,
                endOffset: 53,
                count: 0
              }
            ]
          }
        ]
      }
    ]

    const coverageData2: CoverageData[] = [
      {
        url: `${outDir}/script3.js`,
        scriptId: '3',
        source: testScript3,
        functions: [
          {
            functionName: 'add',
            isBlockCoverage: true,
            ranges: [
              { // Skip conditional
                startOffset: 0,
                endOffset: 15,
                count: 1
              },
              {
                startOffset: 16,
                endOffset: 60,
                count: 0
              }
            ]
          }
        ]
      },
      {
        url: `${outDir}/script4.js`,
        scriptId: '4',
        functions: [
          {
            functionName: 'multiply',
            isBlockCoverage: true,
            ranges: [
              { // 75% coverage
                startOffset: 0,
                endOffset: 45,
                count: 1
              },
              { // Uncovered
                startOffset: 46,
                endOffset: 60,
                count: 0
              }
            ]
          }
        ]
      }
    ]

    const data =
      JSON.stringify(coverageData1) +
      '*|FRM_BREAK|*' +
      JSON.stringify(coverageData2) +
      '*|FRM_BREAK|*'

    setCoverageConfig({
      dir: coverageDir,
      file: `${coverageDir}/formation-coverage.json`,
      url: outDir,
      outDir,
      srcDir,
      exclude: [
        `${outDir}/script4.js`
      ],
      include: [
        `${outDir}/**/*.js`
      ],
      reporters: [
        'lcov'
      ]
    })

    await setupCoverage()
    await writeFile(`${coverageDir}/formation-coverage.json`, data)
    await writeFile(`${srcDir}/script1.ts`, testScriptTs1)
    await writeFile(`${srcDir}/script2.ts`, testScriptTs2)
    await writeFile(`${srcDir}/script3.ts`, testScriptTs3)
    await writeFile(`${srcDir}/script4.ts`, testScriptTs4)
    await writeFile(`${srcDir}/five/script5.ts`, testScriptTs5)
    await writeFile(`${outDir}/script1.js`, testScript1)
    await writeFile(`${outDir}/script2.js`, testScript2)
    await writeFile(`${outDir}/script3.js`, testScript3)
    await writeFile(`${outDir}/script4.js`, testScript4)
    await writeFile(`${outDir}/five/script5.js`, testScript5)
    await writeFile(`${outDir}/script1.js.map`, "{\"version\":3,\"file\":\"script1.js\",\"sourceRoot\":\"\",\"sources\":[\"../src/script1.ts\"],\"names\":[],\"mappings\":\"AAAA,MAAM,UAAU,IAAI,CAAC,UAAkB,eAAe;IACpD,OAAO,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC;AACxB,CAAC\",\"sourcesContent\":[\"export function test(message: string = 'Hello, world!'): void {\\n  console.info(message);\\n}\"]}")
    await writeFile(`${outDir}/script2.js.map`, "{\"version\":3,\"file\":\"script2.js\",\"sourceRoot\":\"\",\"sources\":[\"../src/script2.ts\"],\"names\":[],\"mappings\":\"AAAA,MAAM,UAAU,KAAK;IACnB,OAAO,WAAW,CAAC;AACrB,CAAC\",\"sourcesContent\":[\"export function other(): string {\\n  return 'something';\\n}\"]}")
    await writeFile(`${outDir}/script3.js.map`, '{\"version\":3,\"file\":\"script3.js\",\"sourceRoot\":\"\",\"sources\":[\"../src/script3.ts\"],\"names\":[],\"mappings\":\"AAAA,MAAM,UAAU,GAAG,CAAC,CAAS,EAAE,CAAS;IACtC,IAAI,CAAC,CAAC,EAAE,CAAC;QAAC,OAAO,CAAC,CAAC;IAAC,CAAC;IACrB,OAAO,CAAC,GAAG,CAAC,CAAC;AACf,CAAC\",\"sourcesContent\":[\"export function add(a: number, b: number): number {\\n  if (!a) { return 0; }\\n  return a + b;\\n}\"]}')
    await writeFile(`${outDir}/script4.js.map`, '{\"version\":3,\"file\":\"script4.js\",\"sourceRoot\":\"\",\"sources\":[\"../src/script4.ts\"],\"names\":[],\"mappings\":\"AAAA,MAAM,UAAU,QAAQ,CAAC,CAAS,EAAE,CAAS;IAC3C,OAAO,CAAC,GAAG,CAAC,CAAC;AACf,CAAC\",\"sourcesContent\":[\"export function multiply(a: number, b: number): number {\\n  return a * b;\\n}\"]}')
    await writeFile(`${outDir}/five/script5.js.map`, '{\"version\":3,\"file\":\"script5.js\",\"sourceRoot\":\"\",\"sources\":[\"../../src/five/script5.ts\"],\"names\":[],\"mappings\":\"AAAA,MAAM,UAAU,MAAM,CAAC,CAAS,EAAE,CAAS;IACzC,OAAO,CAAC,GAAG,CAAC,CAAC;AACf,CAAC\",\"sourcesContent\":[\"export function divide(a: number, b: number): number {\\n  return a / b;\\n}\"]}')
  })

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true })

    setCoverageConfig({
      dir: 'formation-coverage',
      file: 'formation-coverage.json',
      url: 'http://localhost:3000',
      reporters: [],
      outDir: 'test',
      srcDir: 'src',
      include: [],
      exclude: []
    })
  })

  it('should load coverage and create report', async () => {
    await createCoverageReport()

    const lcov = await readFile(`${coverageDir}/coverage-report/lcov.info`, 'utf-8')

    expect(lcov).toBe(testLcov)
  })
})
