#!/usr/bin/env node
// Decides whether a push to main only touched blog posts that are drafts both before and after the change (a draft
// saved from the CMS). Such pushes don't change the built site, so the deploy workflow skips them.
// Usage: node scripts/draft-only-change.mjs <before-sha> <after-sha>   (writes skip=true|false to $GITHUB_OUTPUT)
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import { pathToFileURL } from "node:url"

const BLOG_POST = /^content\/blog\/(ja\/)?[^/]+\.md$/

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

function fileAt(sha, path) {
  try {
    return execFileSync("git", ["show", `${sha}:${path}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
  } catch {
    return null
  }
}

function main([before, after]) {
  let skip = false
  if (before && after && !/^0+$/.test(before)) {
    const paths = execFileSync("git", ["diff", "--name-only", before, after], { encoding: "utf8" }).split("\n").filter(Boolean)
    skip = isDraftOnlyChange(paths.map((path) => ({ path, before: fileAt(before, path), after: fileAt(after, path) })))
  }
  console.log(skip ? "Only draft blog posts changed; skipping deploy." : "Deploying.")
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `skip=${skip}\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2))
}
