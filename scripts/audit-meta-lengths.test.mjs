import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import limits from '../src/lib/seo-limits.json' with { type: 'json' }
import { main } from './audit-meta-lengths.mjs'
import { runAudit, tempTrees } from './audit-test-helpers.mjs'

const tree = tempTrees()

const SOURCES = ['content/blog', 'content/blog/ja', 'content/services', 'content/services/ja']
const titleOf = length => 'T'.repeat(length - limits.titleSuffix.length)
const textOf = length => 'D'.repeat(length)
const okTitle = titleOf(limits.title.max)
const okText = textOf(limits.description.min)

const frontmatter = data =>
  `---\n${Object.entries(data)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')}\n---\nBody\n`

function contentTree(entries = {}) {
  const root = tree(
    'audit-meta-',
    Object.fromEntries(
      Object.entries(entries).map(([file, data]) => [
        file,
        typeof data === 'string' ? data : frontmatter(data)
      ])
    )
  )
  for (const dir of SOURCES) fs.mkdirSync(path.join(root, dir), { recursive: true })
  return root
}

function audit(cwd) {
  const run = runAudit(main, [], { cwd })
  const problems = run.stdout.split('\n').filter(line => line.startsWith('content/'))
  return { ...run, problems }
}

const post = data => ({ title: okTitle, excerpt: okText, ...data })
const service = data => ({ title: okTitle, shortDescription: okText, ...data })

describe('pnpm audit:meta', () => {
  it("passes the site's own posts and services", () => {
    const run = audit(process.cwd())
    expect(run.status, run.stdout).toBe(0)
    expect(run.stdout).toBe('All blog and service meta titles/descriptions are within range.')
  })

  it('passes posts and services in both languages at the edges of each range', () => {
    const run = audit(
      contentTree({
        'content/blog/edge.md': post({ title: titleOf(limits.title.min) }),
        'content/blog/ja/edge.md': post({ excerpt: textOf(limits.description.max) }),
        'content/services/edge.md': service({ shortDescription: textOf(limits.description.max) }),
        'content/services/ja/edge.md': service({ title: titleOf(limits.title.min) })
      })
    )
    expect(run.status, run.stdout).toBe(0)
    expect(run.stdout).toBe('All blog and service meta titles/descriptions are within range.')
  })

  it('fails each title and description outside its range, counted with the title suffix', () => {
    const tooLongTitle = limits.title.max + 1
    const tooShortTitle = limits.title.min - 1
    const tooLong = limits.description.max + 1
    const tooShort = limits.description.min - 1
    const run = audit(
      contentTree({
        'content/blog/long-title.md': post({ title: titleOf(tooLongTitle) }),
        'content/blog/ja/short-title.md': post({ title: titleOf(tooShortTitle) }),
        'content/services/long-description.md': service({ shortDescription: textOf(tooLong) }),
        'content/services/ja/short-description.md': service({ shortDescription: textOf(tooShort) })
      })
    )
    expect(run.status).toBe(1)
    expect(run.problems.sort()).toEqual(
      [
        `content/blog/long-title.md: title too long (${tooLongTitle})`,
        `content/blog/ja/short-title.md: title too short (${tooShortTitle})`,
        `content/services/long-description.md: description too long (${tooLong})`,
        `content/services/ja/short-description.md: description too short (${tooShort})`
      ].sort()
    )
    expect(run.stdout).toMatch(/\n\n4 meta length issue\(s\)$/)
  })

  it('checks metaTitle and metaDescription over the title and excerpt they replace', () => {
    const run = audit(
      contentTree({
        'content/blog/meta.md': post({
          title: titleOf(limits.title.max + 5),
          metaTitle: okTitle,
          excerpt: textOf(5),
          metaDescription: textOf(limits.description.max + 2)
        })
      })
    )
    expect(run.problems).toEqual([
      `content/blog/meta.md: description too long (${limits.description.max + 2})`
    ])
  })

  it("lets a post's short excerpt through, since the page extends it, but not a short metaDescription or a service's short description", () => {
    const short = limits.description.min - 10
    const run = audit(
      contentTree({
        'content/blog/short-excerpt.md': post({ excerpt: textOf(short) }),
        'content/blog/ja/short-meta.md': post({ metaDescription: textOf(short) }),
        'content/services/short.md': service({ shortDescription: textOf(short) })
      })
    )
    expect(run.problems.sort()).toEqual(
      [
        `content/blog/ja/short-meta.md: description too short (${short})`,
        `content/services/short.md: description too short (${short})`
      ].sort()
    )
  })

  it('trims the whitespace around a title before it counts', () => {
    const run = audit(
      contentTree({ 'content/services/padded.md': service({ title: `\n  ${okTitle}  \n` }) })
    )
    expect(run.problems).toEqual([])
  })

  it('collapses whitespace before it counts, and counts a missing field as empty', () => {
    const spaced = ` ${Array(6).fill('Tokyo').join('\n\n     ')}\n`
    expect(spaced.length + limits.titleSuffix.length).toBeGreaterThan(limits.title.max)
    const run = audit(
      contentTree({
        'content/services/spaced.md': service({ title: spaced }),
        'content/services/ja/empty.md': { draft: false }
      })
    )
    expect(run.problems.sort()).toEqual(
      [
        `content/services/ja/empty.md: title too short (${limits.titleSuffix.length})`,
        'content/services/ja/empty.md: description too short (0)'
      ].sort()
    )
  })

  it('skips drafts and files that are not Markdown', () => {
    const run = audit(
      contentTree({
        'content/blog/draft.md': post({ title: '', draft: true }),
        'content/blog/notes.txt': 'title: x',
        'content/services/ja/draft.md': service({ shortDescription: '', draft: true })
      })
    )
    expect(run.status, run.stdout).toBe(0)
  })
})
