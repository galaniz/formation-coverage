/**
 * Scripts - Docs
 */

/* Imports */

import { renderMarkdownDocs } from '@alanizcreative/formation-docs/docs.js'

/* Create README */

await renderMarkdownDocs({
  include: 'src/**\/*.ts',
  exclude: 'src/**\/*.test.ts',
  docsExclude: 'src/**\/*Types.ts'
})
