#!/usr/bin/env node
// Reports blog/service pages whose rendered <title> or meta description falls outside
// the ranges used by Ahrefs Site Audit: title 15–70 chars (including " | Pitonne"),
// meta description 110–160 chars. Exits non-zero when any page is out of range.
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const TITLE_SUFFIX = " | Pitonne"
const TITLE_MIN = 15
const TITLE_MAX = 70
const DESC_MIN = 110
const DESC_MAX = 160

const sources = [
  { dir: "content/blog", titleKey: "title", descKey: "excerpt" },
  { dir: "content/blog/ja", titleKey: "title", descKey: "excerpt" },
  { dir: "content/services", titleKey: "title", descKey: "shortDescription" },
  { dir: "content/services/ja", titleKey: "title", descKey: "shortDescription" },
]

const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim()
const problems = []

for (const { dir, titleKey, descKey } of sources) {
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"))
    const title = normalize(data.metaTitle ?? data[titleKey]) + TITLE_SUFFIX
    const description = normalize(data.metaDescription ?? data[descKey])
    const where = `${dir}/${file}`

    if (title.length > TITLE_MAX) problems.push(`${where}: title too long (${title.length})`)
    if (title.length < TITLE_MIN) problems.push(`${where}: title too short (${title.length})`)
    if (description.length > DESC_MAX) problems.push(`${where}: description too long (${description.length})`)
    if (description.length < DESC_MIN) problems.push(`${where}: description too short (${description.length})`)
  }
}

if (problems.length > 0) {
  console.log(problems.join("\n"))
  console.log(`\n${problems.length} meta length issue(s)`)
  process.exit(1)
}

console.log("All blog and service meta titles/descriptions are within range.")
