import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  isContentOnlyChange,
  isDocsOnlyChange,
  isDraft,
  isDraftOnlyChange
} from './draft-only-change.mjs'

const draft = '---\ntitle: A\ndraft: true\n---\nBody'
const published = '---\ntitle: A\ndraft: false\n---\nBody'
const noFlag = '---\ntitle: A\n---\nBody draft: true'

describe('draft-only change detection', () => {
  it('reads the draft flag from frontmatter only', () => {
    expect(isDraft(draft)).toBe(true)
    expect(isDraft(published)).toBe(false)
    expect(isDraft(noFlag)).toBe(false)
  })

  it('skips saves that keep blog posts as drafts', () => {
    expect(
      isDraftOnlyChange([{ path: 'content/blog/new-post.md', before: null, after: draft }])
    ).toBe(true)
    expect(
      isDraftOnlyChange([{ path: 'content/blog/ja/new-post.md', before: draft, after: draft }])
    ).toBe(true)
    expect(
      isDraftOnlyChange([{ path: 'content/blog/old-draft.md', before: draft, after: null }])
    ).toBe(true)
  })

  it('deploys when a post is published, unpublished, or anything else changes', () => {
    expect(
      isDraftOnlyChange([{ path: 'content/blog/post.md', before: draft, after: published }])
    ).toBe(false)
    expect(
      isDraftOnlyChange([{ path: 'content/blog/post.md', before: published, after: draft }])
    ).toBe(false)
    expect(
      isDraftOnlyChange([{ path: 'content/blog/post.md', before: published, after: null }])
    ).toBe(false)
    expect(
      isDraftOnlyChange([
        { path: 'content/blog/new-post.md', before: null, after: draft },
        { path: 'public/images/content/blog/new-post/featureImage.jpg', before: null, after: 'jpg' }
      ])
    ).toBe(false)
    expect(isDraftOnlyChange([])).toBe(false)
  })
})

describe('CMS content-only change detection', () => {
  it('treats blog posts, categories and blog images as content', () => {
    expect(
      isContentOnlyChange([
        'content/blog/post.md',
        'content/blog/ja/post.md',
        'content/blog-categories/iv-therapy.json',
        'public/images/content/blog/post/featureImage.jpg',
        'public/images/content/blog/ja/post/featureImage.jpg'
      ])
    ).toBe(true)
  })

  it('treats anything else as a code change', () => {
    expect(isContentOnlyChange([])).toBe(false)
    expect(isContentOnlyChange(['content/blog/post.md', 'src/lib/blog-rules.ts'])).toBe(false)
    expect(isContentOnlyChange(['content/services/iv-therapy.md'])).toBe(false)
    expect(isContentOnlyChange(['content/pages/about.md'])).toBe(false)
    expect(isContentOnlyChange(['public/images/content/sheet/home.jpg'])).toBe(false)
    expect(isContentOnlyChange(['keystatic.config.ts'])).toBe(false)
    expect(isContentOnlyChange(['content/blogs/post.md'])).toBe(false)
  })
})

describe('docs-only change detection', () => {
  it('treats Markdown under docs/, at the root and in skills as docs', () => {
    expect(
      isDocsOnlyChange([
        'docs/agents/ci-deploys.md',
        'docs/adr/0001-blog-cms.md',
        'AGENTS.md',
        'README.md',
        '.claude/skills/verify-site/SKILL.md'
      ])
    ).toBe(true)
  })

  it('treats content, code, config, data beside the docs and anything else as more than docs', () => {
    expect(isDocsOnlyChange([])).toBe(false)
    expect(isDocsOnlyChange(['docs/agents/ci-deploys.md', 'src/lib/seo.ts'])).toBe(false)
    expect(isDocsOnlyChange(['content/services/iv-therapy.md'])).toBe(false)
    expect(isDocsOnlyChange(['content/blog/post.md'])).toBe(false)
    expect(isDocsOnlyChange(['.claude/settings.json'])).toBe(false)
    expect(isDocsOnlyChange(['verify.json'])).toBe(false)
    expect(isDocsOnlyChange(['docs/image-audit/sheet-image-manifest.json'])).toBe(false)
    expect(isDocsOnlyChange(['.claude/skills/verify-site/serve.mjs'])).toBe(false)
  })

  it('treats ci.md as more than docs, since workflow-rules.test.ts reads its table of pinned actions', () => {
    expect(isDocsOnlyChange(['docs/agents/ci.md'])).toBe(false)
    expect(fs.readFileSync('tools/checks/workflow-rules.test.ts', 'utf8')).toContain(
      "fs.readFileSync('docs/agents/ci.md', 'utf8')"
    )
  })

  it('counts as docs no file that code, a test, a script or a root config names', () => {
    const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
      .split('\0')
      .filter(Boolean)
    const docs = tracked.filter(file => isDocsOnlyChange([file]))
    const readers = tracked.filter(
      file =>
        (/^(?:src|scripts|tools|e2e|functions)\//.test(file) || !file.includes('/')) &&
        !docs.includes(file) &&
        file !== 'scripts/draft-only-change.test.mjs'
    )
    expect(docs).toContain('AGENTS.md')
    expect(readers).toContain('src/lib/data/sheet-images.dom.test.tsx')
    const named = readers.flatMap(reader => {
      const text = fs.readFileSync(reader, 'utf8')
      return docs.filter(doc => text.includes(doc)).map(doc => `${reader} names ${doc}`)
    })
    const onlyInText = {
      'tools/checks/pull-request.mjs names docs/agents/ci-pull-requests.md':
        "issue-link's note, which links the doc",
      'verify.json names AGENTS.md': 'the docs check, which runs on a docs-only change',
      'verify.json names docs/cms.md': "a generated file's description, which links the doc"
    }
    expect(named).toEqual(Object.keys(onlyInText))
  })

  it('holds Tailwind to src and content, so a docs-only change leaves the CSS alone', () => {
    const css = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')
    expect(css).toMatch(/^@import "tailwindcss" source\(none\);$/m)
    const sources = [...css.matchAll(/^@source "([^"]+)";$/gm)].map(([, source]) =>
      path.posix.join('src/app', source).replace(/\/$/, '')
    )
    expect(sources).toEqual(['src', 'content'])
    const excluded = [...css.matchAll(/^@source not "([^"]+)";$/gm)].map(([, source]) =>
      path.posix.join('src/app', source)
    )
    expect(excluded).toEqual(['src/**/*.test.{ts,tsx}', 'src/test'])
  })
})
