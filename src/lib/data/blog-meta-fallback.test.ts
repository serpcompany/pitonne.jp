import { describe, expect, it } from "vitest"
import { META_DESCRIPTION_MAX_LENGTH, META_DESCRIPTION_MIN_LENGTH } from "@/lib/blog-rules"
import { fallbackMetaDescription } from "@/lib/data/blog-posts"

const shortJa = "短い抜粋です。".repeat(10) // 70 characters
const bodyJa = "## 見出し\n\n" + "本文の最初の文です。".repeat(3) + "\n\n" + "二つ目の段落の文です。".repeat(10)

describe("fallbackMetaDescription", () => {
  it("leaves a long enough excerpt alone", () => {
    expect(fallbackMetaDescription("a".repeat(META_DESCRIPTION_MIN_LENGTH), "Body text.", "en")).toBeUndefined()
  })

  it("extends a short excerpt with verbatim body sentences into the meta range", () => {
    const description = fallbackMetaDescription(shortJa, bodyJa, "ja")!
    expect(description.startsWith(shortJa)).toBe(true)
    expect(description.length).toBeGreaterThanOrEqual(META_DESCRIPTION_MIN_LENGTH)
    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH)
    expect(description).not.toContain("見出し")
    expect(description.endsWith("。")).toBe(true)
  })

  it("separates English sentences with spaces", () => {
    const excerpt = "Short excerpt that is under the minimum length for a meta description here."
    const body = "First body sentence explains the topic. Second body sentence adds a little more detail for readers."
    const description = fallbackMetaDescription(excerpt, body, "en")!
    expect(description).toMatch(/here\. First body sentence/)
    expect(description.length).toBeGreaterThanOrEqual(META_DESCRIPTION_MIN_LENGTH)
    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH)
  })

  it("cuts an overlong next sentence at the limit instead of staying short", () => {
    const description = fallbackMetaDescription(shortJa, "長い文".repeat(80) + "。", "ja")!
    expect(description.length).toBe(META_DESCRIPTION_MAX_LENGTH)
    expect(description.endsWith("…")).toBe(true)
  })
})
