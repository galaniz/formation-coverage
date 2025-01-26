# Formation Coverage

A utility to generate code coverage reports for Playwright tests specifically for TypeScript source code.

## Installation

```bash
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

## Configuration Options

### `setCoverageConfig`

| Option        | Type          | Default                      | Description                                     |
|---------------|---------------|------------------------------|-------------------------------------------------|
| `dir`         | `string`      | `'formation-coverage'`       | Directory for coverage file and reports         |
| `file`        | `string`      | `'formation-coverage.json'`  | File name to store test coverage data           |
| `url`         | `string`      | `'http://localhost:3000'`    | Web server url tests run on                     |
| `reporters`   | `string[]`    | `['text']`                   | Coverage report formats (see [Istanbul Report Options](https://www.npmjs.com/package/@types/istanbul-reports)) |
| `outDir`      | `string`      | `'spec'`                     | Directory with compiled and source map files    |
| `srcDir`      | `string`      | `'src'`                      | Directory with source TypeScript files          |
| `include`     | `string[]`    | `[]`                         | Glob patterns to include in reports             |
| `exclude`     | `string[]`    | `[]`                         | Glob patterns to exclude from reports           |

## Setup Guide

### Global Setup

It's recommended to configure coverage options in your Playwright `globalSetup` file:

```typescript
// tests/setup.ts

import { setCoverageConfig } from '@alanizcreative/formation-coverage/coverageConfig.js'
import { setupCoverage } from '@alanizcreative/formation-coverage/coverage.js'

export default async function () {
  setCoverageConfig({
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
      'spec/components/**/*.js',
      'spec/effects/**/*.js',
      'spec/layouts/**/*.js',
      'spec/objects/**/*.js'
    ],
    exclude: [
      'spec/utils/**/*.js',
      'spec/config/**/*.js',
      'spec/tests/**/*.js',
      'spec/**/*.spec.js'
    ]
  })

  await setupCoverage()
}
```

### Test Setup

#### `doCoverage`

| Param             | Type                     | Default          | Description                                    |
|-------------------|--------------------------|------------------|------------------------------------------------|
| `browserName`     | `string`                 |                  | Coverage only applies to chromium browsers     |
| `page`            | `@playwright/test.Page`  |                  | [Page](https://playwright.dev/docs/api/class-page) object provided by Playwright |
| `start`           | `boolean`                | `true`           | Start or stop coverage                         |

Use `doCoverage` before and after each test to capture coverage data: 

```typescript
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

### Global Teardown

Generate coverage reports after tests complete in your Playwright `globalTeardown` file:

```typescript
// tests/teardown.ts

import { createCoverageReport } from '@alanizcreative/formation-coverage/coverage.js'

export default async function () {
  await createCoverageReport()
}
```
