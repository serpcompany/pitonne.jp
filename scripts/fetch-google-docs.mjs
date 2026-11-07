#!/usr/bin/env node
import { BLOG_DRAFT_SOURCES, writeBlogDrafts } from './google-docs-blog-drafts.mjs'
import { runMain } from './run-main.mjs'

export async function main() {
  try {
    const drafts = await writeBlogDrafts()

    console.log(`Generated ${drafts.length} blog drafts:`)
    for (const draft of drafts) {
      console.log(`  - ${draft.filename} (${draft.topic})`)
    }
  } catch (error) {
    console.error(error)
    console.error(`Configured sources: ${BLOG_DRAFT_SOURCES.length}`)
    process.exitCode = 1
  }
}

await runMain(import.meta.url, main)
