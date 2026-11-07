import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'

import {
  BLOG_DRAFT_SOURCES,
  buildDraftMarkdown,
  buildGoogleDocExportUrl,
  cleanContent
} from './google-docs-blog-drafts.mjs'

describe('google docs blog draft conversion', () => {
  it('uses explicit tab IDs for each configured draft source', () => {
    expect(BLOG_DRAFT_SOURCES).toHaveLength(7)

    for (const source of BLOG_DRAFT_SOURCES) {
      expect(source.docId).toMatch(/^[A-Za-z0-9_-]+$/)
      expect(source.tabId).toMatch(/^t\.[A-Za-z0-9_-]+$/)
      expect(source.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(source.featureImage).toMatch(/^\/images\//)
      expect(source.relatedServiceSlugs.length).toBeGreaterThan(0)
      expect(source.tags.length).toBeGreaterThan(0)

      const url = buildGoogleDocExportUrl(source)
      expect(url.toString()).toBe(
        `https://docs.google.com/document/d/${source.docId}/export?format=md&tab=${source.tabId}`
      )
    }
  })

  it('removes Google Docs tab headings while preserving the real English H1', () => {
    const cleaned = cleanContent(
      '# タブ 2\n\n# Can IV Therapy Help with Nausea?\n\nBody paragraph.\n\n\nNext paragraph.'
    )

    expect(cleaned).toBe(
      '# Can IV Therapy Help with Nausea?\n\nBody paragraph.\n\nNext paragraph.\n'
    )
  })

  it('builds markdown with blog frontmatter compatible with the BlogPost schema', () => {
    const draft = buildDraftMarkdown({
      source: { ...BLOG_DRAFT_SOURCES[0], slug: undefined },
      index: 0,
      usedSlugs: new Set(),
      rawMarkdown: [
        '# Tab 2',
        '',
        '# Can IV Therapy Help with Nausea?',
        '',
        'Nausea can make oral hydration difficult, especially during travel.'
      ].join('\n')
    })
    const parsed = matter(draft.markdown)

    expect(draft.slug).toBe('can-iv-therapy-help-with-nausea')
    expect(parsed.data).toMatchObject({
      slug: 'can-iv-therapy-help-with-nausea',
      title: 'Can IV Therapy Help with Nausea?',
      publishedAt: '2026-05-31',
      category: 'IV Therapy',
      categorySlug: 'iv-therapy',
      author: {
        name: 'Pitonne Medical Team',
        role: 'Wellness Experts'
      },
      featured: false,
      featureImage: BLOG_DRAFT_SOURCES[0].featureImage
    })
    expect(parsed.data.excerpt).toContain('Nausea can make oral hydration difficult')
    expect(parsed.data.readingTime).toBeGreaterThan(0)
    expect(parsed.data.relatedServiceSlugs.length).toBeGreaterThan(0)
    expect(parsed.data.tags.length).toBeGreaterThan(0)
    expect(parsed.content).toContain('# Can IV Therapy Help with Nausea?')
    expect(parsed.content).not.toContain('# Tab 2')
  })

  it('names a draft whose title has no ASCII letters after its place in the list', () => {
    const draft = buildDraftMarkdown({
      source: { ...BLOG_DRAFT_SOURCES[0], slug: undefined },
      index: 0,
      usedSlugs: new Set(),
      rawMarkdown: '# 点滴療法\n\n本文です。'
    })

    expect(draft.slug).toBe('draft-post-01')
    expect(draft.filename).toBe('draft-post-01.md')
    expect(matter(draft.markdown).data.title).toBe('点滴療法')
  })

  it('gives each later draft with a taken slug the next number', () => {
    const usedSlugs = new Set()
    const source = BLOG_DRAFT_SOURCES[1]
    const build = () =>
      buildDraftMarkdown({ source, index: 1, usedSlugs, rawMarkdown: '# A title' })

    expect([build().slug, build().slug, build().slug]).toEqual([
      source.slug,
      `${source.slug}-2`,
      `${source.slug}-3`
    ])
  })

  it('fills a placeholder title and excerpt for a doc with no H1 and no paragraph', () => {
    const draft = buildDraftMarkdown({
      source: BLOG_DRAFT_SOURCES[2],
      index: 2,
      usedSlugs: new Set(),
      rawMarkdown: '## Only a subheading'
    })
    const parsed = matter(draft.markdown)

    expect(draft.title).toBe('Draft Post 3')
    expect(parsed.data.title).toBe('Draft Post 3')
    expect(parsed.data.excerpt).toBe('Draft excerpt - please update.')
    expect(parsed.data.readingTime).toBe(1)
  })

  it('takes the excerpt from the first paragraph as plain text, cut at a whole word', () => {
    const marked = 'Hydration supports **recovery** after a *long* [flight](/blog/) day. '
    const plain = 'Hydration supports recovery after a long flight day. '
    const draft = buildDraftMarkdown({
      source: BLOG_DRAFT_SOURCES[3],
      index: 3,
      usedSlugs: new Set(),
      rawMarkdown: `# Title\n\n${marked.repeat(5)}\n\nSecond paragraph.`
    })
    const { excerpt } = matter(draft.markdown).data
    const kept = excerpt.slice(0, -'...'.length)

    expect(excerpt.length).toBeLessThanOrEqual(220)
    expect(excerpt.endsWith('...')).toBe(true)
    expect(plain.repeat(5).startsWith(kept)).toBe(true)
    expect(plain.repeat(5)[kept.length]).toBe(' ')
  })

  it('keeps a short first paragraph whole as the excerpt', () => {
    const draft = buildDraftMarkdown({
      source: BLOG_DRAFT_SOURCES[4],
      index: 4,
      usedSlugs: new Set(),
      rawMarkdown: '# Title\n\nA short   first\nparagraph.'
    })

    expect(matter(draft.markdown).data.excerpt).toBe('A short first paragraph.')
  })

  it('drops a byte order mark, export image references and the assistant follow-up line', () => {
    expect(
      cleanContent(
        '﻿# Title\r\n\r\n![][image1]\r\nBody.\r\n\r\nIf you want, I can continue with the next topic now: Stress\r\n\r\n[image1]: data:image/png;base64,AAAA\r\n'
      )
    ).toBe('# Title\n\nBody.\n')
  })
})
