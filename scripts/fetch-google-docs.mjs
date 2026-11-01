#!/usr/bin/env node
import { BLOG_DRAFT_SOURCES, writeBlogDrafts } from './google-docs-blog-drafts.mjs'

async function main() {
  const drafts = await writeBlogDrafts()

  console.log(`Generated ${drafts.length} blog drafts:`)
  for (const draft of drafts) {
    console.log(`  - ${draft.filename} (${draft.topic})`)
  }
}

main().catch(error => {
  console.error(error)
  console.error(`Configured sources: ${BLOG_DRAFT_SOURCES.length}`)
  process.exit(1)
})
