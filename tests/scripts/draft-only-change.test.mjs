import { describe, expect, it } from "vitest"
import { isDraft, isDraftOnlyChange } from "../../scripts/draft-only-change.mjs"

const draft = "---\ntitle: A\ndraft: true\n---\nBody"
const published = "---\ntitle: A\ndraft: false\n---\nBody"
const noFlag = "---\ntitle: A\n---\nBody draft: true"

describe("draft-only change detection", () => {
  it("reads the draft flag from frontmatter only", () => {
    expect(isDraft(draft)).toBe(true)
    expect(isDraft(published)).toBe(false)
    expect(isDraft(noFlag)).toBe(false)
  })

  it("skips saves that keep blog posts as drafts", () => {
    expect(isDraftOnlyChange([{ path: "content/blog/new-post.md", before: null, after: draft }])).toBe(true)
    expect(isDraftOnlyChange([{ path: "content/blog/ja/new-post.md", before: draft, after: draft }])).toBe(true)
    expect(isDraftOnlyChange([{ path: "content/blog/old-draft.md", before: draft, after: null }])).toBe(true)
  })

  it("deploys when a post is published, unpublished, or anything else changes", () => {
    expect(isDraftOnlyChange([{ path: "content/blog/post.md", before: draft, after: published }])).toBe(false)
    expect(isDraftOnlyChange([{ path: "content/blog/post.md", before: published, after: draft }])).toBe(false)
    expect(isDraftOnlyChange([{ path: "content/blog/post.md", before: published, after: null }])).toBe(false)
    expect(
      isDraftOnlyChange([
        { path: "content/blog/new-post.md", before: null, after: draft },
        { path: "public/images/content/blog/new-post/featureImage.jpg", before: null, after: "jpg" },
      ])
    ).toBe(false)
    expect(isDraftOnlyChange([])).toBe(false)
  })
})
