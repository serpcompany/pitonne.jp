#!/usr/bin/env node
// Classifies a push to staging or main for the deploy jobs in .github/workflows/ci.yml:
// - skip: only blog posts that are drafts both before and after the change (a draft saved from the CMS). The built
//   site doesn't change, so nothing deploys.
// - content_only: only files the Keystatic CMS edits (blog posts, blog categories, blog images). These deploy without
//   waiting for the test job, so publishing stays quick; the build itself validates the content. Any other change
//   deploys only after the test job passes.
// Usage: node scripts/draft-only-change.mjs <before-sha> <after-sha>
//   (writes skip=true|false and content_only=true|false to $GITHUB_OUTPUT)
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import { pathToFileURL } from "node:url"

const BLOG_POST = /^content\/blog\/(ja\/)?[^/]+\.md$/
// What keystatic.config.ts writes: content/blog/*, content/blog/ja/*, content/blog-categories/*, and feature images
const CMS_CONTENT = /^(?:content\/blog\/|content\/blog-categories\/|public\/images\/content\/blog\/)/

export function isDraft(markdown) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return Boolean(frontmatter) && /^draft:\s*true\s*$/m.test(frontmatter[1])
}

// changes: [{ path, before: string | null, after: string | null }], null meaning the file didn't exist
export function isDraftOnlyChange(changes) {
  return (
    changes.length > 0 &&
    changes.every(
      ({ path, before, after }) =>
        BLOG_POST.test(path) && (before === null || isDraft(before)) && (after === null || isDraft(after))
    )
  )
}

/** True when every changed path is one the CMS edits. */
export function isContentOnlyChange(paths) {
  return paths.length > 0 && paths.every((path) => CMS_CONTENT.test(path))
}

function fileAt(sha, path) {
  try {
    return execFileSync("git", ["show", `${sha}:${path}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
  } catch {
    return null
  }
}

function main([before, after]) {
  let skip = false
  let contentOnly = false
  if (before && after && !/^0+$/.test(before)) {
    const paths = execFileSync("git", ["diff", "--name-only", before, after], { encoding: "utf8" }).split("\n").filter(Boolean)
    skip = isDraftOnlyChange(paths.map((path) => ({ path, before: fileAt(before, path), after: fileAt(after, path) })))
    contentOnly = isContentOnlyChange(paths)
  }
  console.log(
    skip
      ? "Only draft blog posts changed; skipping deploy."
      : contentOnly
        ? "Only CMS content changed."
        : "Code or configuration changed (or no previous commit to compare with).",
  )
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `skip=${skip}\ncontent_only=${contentOnly}\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2))
}
