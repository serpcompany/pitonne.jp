import matter from "gray-matter"
import { describe, expect, it } from "vitest"

import {
  BLOG_DRAFT_SOURCES,
  buildDraftMarkdown,
  buildGoogleDocExportUrl,
  cleanContent,
} from "../../scripts/google-docs-blog-drafts.mjs"

describe("google docs blog draft conversion", () => {
  it("uses explicit tab IDs for each configured draft source", () => {
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
        `https://docs.google.com/document/d/${source.docId}/export?format=md&tab=${source.tabId}`,
      )
    }
  })

  it("removes Google Docs tab headings while preserving the real English H1", () => {
    const cleaned = cleanContent("# タブ 2\n\n# Can IV Therapy Help with Nausea?\n\nBody paragraph.\n\n\nNext paragraph.")

    expect(cleaned).toBe("# Can IV Therapy Help with Nausea?\n\nBody paragraph.\n\nNext paragraph.\n")
  })

  it("builds markdown with blog frontmatter compatible with the BlogPost schema", () => {
    const draft = buildDraftMarkdown({
      source: { ...BLOG_DRAFT_SOURCES[0], slug: undefined },
      index: 0,
      usedSlugs: new Set(),
      rawMarkdown: [
        "# Tab 2",
        "",
        "# Can IV Therapy Help with Nausea?",
        "",
        "Nausea can make oral hydration difficult, especially during travel.",
      ].join("\n"),
    })
    const parsed = matter(draft.markdown)

    expect(draft.slug).toBe("can-iv-therapy-help-with-nausea")
    expect(parsed.data).toMatchObject({
      slug: "can-iv-therapy-help-with-nausea",
      title: "Can IV Therapy Help with Nausea?",
      publishedAt: "2026-05-31",
      category: "IV Therapy",
      categorySlug: "iv-therapy",
      author: {
        name: "Pitonne Medical Team",
        role: "Wellness Experts",
      },
      featured: false,
      featureImage: BLOG_DRAFT_SOURCES[0].featureImage,
    })
    expect(parsed.data.excerpt).toContain("Nausea can make oral hydration difficult")
    expect(parsed.data.readingTime).toBeGreaterThan(0)
    expect(parsed.data.relatedServiceSlugs.length).toBeGreaterThan(0)
    expect(parsed.data.tags.length).toBeGreaterThan(0)
    expect(parsed.content).toContain("# Can IV Therapy Help with Nausea?")
    expect(parsed.content).not.toContain("# Tab 2")
  })
})
