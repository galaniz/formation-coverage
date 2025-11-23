# Formation Coverage  

Utility to generate code coverage reports for Playwright tests specifically for TypeScript source code.

## Installation

```shell
npm install -D @alanizcreative/formation-coverage
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes the following compiler options to enable source map generation:

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "inlineSources": true
  }
}
```

## setupCoverage  

**<code>setupCoverage(args: CoverageConfig): Promise&lt;void&gt;</code>**  

Set options and create coverage folder and file.

### Parameters  
- **`args`** <code><a href="#coverageconfig">CoverageConfig</a></code> required

### Returns  

<code>Promise&lt;void&gt;</code>

### Examples

It's recommended to configure coverage options in your Playwright `globalSetup` file:

```ts
// tests/setup.ts

import { setupCoverage } from '@alanizcreative/formation-coverage/coverage.js'

export default async function () {
  await setupCoverage({
    dir: 'spec-coverage',
    file: 'spec-coverage.json',
    url: 'http://localhost:8000',
    outDir: 'spec',
    srcDir: 'src',
    reporters: [
      'text',
      'html'
    ],
    include: [
      'spec/components/**\/*.js',
      'spec/effects/**\/*.js',
      'spec/layouts/**\/*.js',
      'spec/objects/**\/*.js'
    ],
    exclude: [
      'spec/utils/**\/*.js',
      'spec/config/**\/*.js',
      'spec/tests/**\/*.js',
      'spec/**\/*.spec.js'
    ]
  })
}
```

## doCoverage  

**<code>doCoverage(browserName: string, page: Page, start?: boolean): Promise&lt;void&gt;</code>**  

Start and end Playwright coverage and save to coverage file.

### Parameters  
- **`browserName`** <code>string</code> required  
Coverage only applies to Chromium browsers.  
- **`page`** <code>Page</code> required  
[Page](https://playwright.dev/docs/api/class-page) object provided by Playwright.  
- **`start`** <code>boolean</code> optional  
Start or stop coverage.  
Default: `true`

### Returns  

<code>Promise&lt;void&gt;</code>

### Examples

Use `doCoverage` before and after each test to capture coverage data:

```ts
// components/Navigation/__tests__/Navigation.spec.ts

import { test, expect } from '@playwright/test'
import { doCoverage } from '@alanizcreative/formation-coverage/coverage.js'

test.describe('Navigation', () => {
  test.beforeEach(async ({ browserName, page }) => {
    await doCoverage(browserName, page, true)
  })

  test.afterEach(async ({ browserName, page }) => {
    await doCoverage(browserName, page, false)
  })

  // Your test cases
})
```

## createCoverageReport  

**<code>createCoverageReport(): Promise&lt;void&gt;</code>**  

Create coverage report from JSON data.

### Returns  

<code>Promise&lt;void&gt;</code>

### Examples

Generate coverage reports after tests complete in your Playwright `globalTeardown` file:

```ts
// tests/teardown.ts

import { createCoverageReport } from '@alanizcreative/formation-coverage/coverage.js'

export default async function () {
  await createCoverageReport()
}
```

## Types

### CoverageConfig  

**Type:** <code>object</code>

#### Properties  
- **`dir`** <code>string</code> optional  
Directory for coverage file and reports.  
Default: `'formation-coverage'`  
- **`file`** <code>string</code> optional  
File name to store test coverage data.  
Default: `'formation-coverage.json'`  
- **`url`** <code>string</code> optional  
Web server URL tests run on.  
Default: `'http://localhost:3000'`  
- **`reporters`** <code>(&#39;text&#39;|&#39;html&#39;|&#39;lcov&#39;)[]</code> optional  
Coverage [report formats](https://www.npmjs.com/package/@types/istanbul-reports).  
Default: `['text']`  
- **`outDir`** <code>string</code> optional  
Directory with compiled and source map files.  
Default: `'spec'`  
- **`srcDir`** <code>string</code> optional  
Directory with source TypeScript files.  
Default: `'src'`  
- **`include`** <code>string[]</code> optional  
Glob patterns to include in reports.  
- **`exclude`** <code>string[]</code> optional  
Glob patterns to exclude from reports.