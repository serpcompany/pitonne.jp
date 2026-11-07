#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { runMain } from './run-main.mjs'

const limits = JSON.parse(
  fs.readFileSync(new URL('../src/lib/seo-limits.json', import.meta.url), 'utf8')
)
const TITLE_SUFFIX = limits.titleSuffix
const TITLE_MIN = limits.title.min
const TITLE_MAX = limits.title.max
const DESC_MIN = limits.description.min
const DESC_MAX = limits.description.max

const sources = [
  { dir: 'content/blog', titleKey: 'title', descKey: 'excerpt', shortDescriptionExtended: true },
  { dir: 'content/blog/ja', titleKey: 'title', descKey: 'excerpt', shortDescriptionExtended: true },
  { dir: 'content/services', titleKey: 'title', descKey: 'shortDescription' },
  { dir: 'content/services/ja', titleKey: 'title', descKey: 'shortDescription' }
]

const normalize = value =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()

export function main(_argv, { cwd = process.cwd() } = {}) {
  const problems = []

  for (const { dir, titleKey, descKey, shortDescriptionExtended } of sources) {
    for (const file of fs.readdirSync(path.join(cwd, dir)).filter(name => name.endsWith('.md'))) {
      const { data } = matter(fs.readFileSync(path.join(cwd, dir, file), 'utf8'))
      if (data.draft) continue
      const title = normalize(data.metaTitle ?? data[titleKey]) + TITLE_SUFFIX
      const description = normalize(data.metaDescription ?? data[descKey])
      const where = `${dir}/${file}`

      if (title.length > TITLE_MAX) problems.push(`${where}: title too long (${title.length})`)
      if (title.length < TITLE_MIN) problems.push(`${where}: title too short (${title.length})`)
      if (description.length > DESC_MAX)
        problems.push(`${where}: description too long (${description.length})`)
      if (description.length < DESC_MIN && !(shortDescriptionExtended && !data.metaDescription))
        problems.push(`${where}: description too short (${description.length})`)
    }
  }

  if (problems.length > 0) {
    console.log(problems.join('\n'))
    console.log(`\n${problems.length} meta length issue(s)`)
    process.exitCode = 1
    return
  }

  console.log('All blog and service meta titles/descriptions are within range.')
  process.exitCode = 0
}

await runMain(import.meta.url, main)
