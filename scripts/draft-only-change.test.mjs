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
  it('treats the docs folder, root Markdown files and skills as docs, which no build reads', () => {
    expect(
      isDocsOnlyChange([
        'docs/agents/ci.md',
        'docs/adr/0001-blog-cms.md',
        'AGENTS.md',
        'README.md',
        '.claude/skills/verify-site/SKILL.md'
      ])
    ).toBe(true)
  })

  it('treats content, code, config and anything else as more than docs', () => {
    expect(isDocsOnlyChange([])).toBe(false)
    expect(isDocsOnlyChange(['docs/agents/ci.md', 'src/lib/seo.ts'])).toBe(false)
    expect(isDocsOnlyChange(['content/services/iv-therapy.md'])).toBe(false)
    expect(isDocsOnlyChange(['content/blog/post.md'])).toBe(false)
    expect(isDocsOnlyChange(['.claude/settings.json'])).toBe(false)
    expect(isDocsOnlyChange(['verify.json'])).toBe(false)
  })
})
