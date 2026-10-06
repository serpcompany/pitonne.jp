import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { estimateReadingTime, loadBlogPostsFromDirectory, localizeBlogContentHref } from "@/lib/data/blog-posts"
import { localizedHreflangAlternates } from "@/lib/seo"
import { sitemapEntriesForPath } from "@/app/sitemap.xml/route"

const SITE_URL = "https://pitonne.jp"

const validFrontmatter = {
  slug: "example-post",
  title: "Example Post",
  excerpt:
    "An example excerpt that is long enough to work as the meta description, which needs one hundred and ten characters.",
  publishedAt: "2026-10-01",
  category: "IV Therapy",
  categorySlug: "iv-therapy",
  author: "\n  name: Pitonne Medical Team\n  role: Wellness Experts",
  featureImage: "/images/example.jpg",
  featureImageAlt: "Example image",
}

let tempDirs: string[] = []

function writePosts(posts: Record<string, Record<string, unknown>>, body = "Body text."): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-content-model-"))
  tempDirs.push(dir)
  for (const [fileName, frontmatter] of Object.entries(posts)) {
    const yaml = Object.entries(frontmatter)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${typeof value === "string" && !value.startsWith("\n") ? JSON.stringify(value) : value}`)
      .join("\n")
    fs.writeFileSync(path.join(dir, fileName), `---\n${yaml}\n---\n${body}\n`)
  }
  return dir
}

afterEach(() => {
  for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true })
  tempDirs = []
})

describe("blog content model", () => {
  it("excludes draft posts", () => {
    const dir = writePosts({
      "example-post.md": validFrontmatter,
      "draft-post.md": { ...validFrontmatter, slug: "draft-post", draft: true },
    })

    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog").map((post) => post.slug)).toEqual(["example-post"])
  })

  it("computes reading time from the body, by words in English and characters in Japanese", () => {
    expect(estimateReadingTime(Array(401).fill("word").join(" "), "en")).toBe(3)
    expect(estimateReadingTime("あ".repeat(1001), "ja")).toBe(3)
    expect(estimateReadingTime("", "en")).toBe(1)

    const dir = writePosts({ "example-post.md": validFrontmatter }, Array(250).fill("word").join(" "))
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].readingTime).toBe(2)
  })

  it("keeps readingTime frontmatter as an optional override", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, readingTime: 9 } })
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].readingTime).toBe(9)
  })

  it.each([
    ["excerpt shorter than 70 characters", { excerpt: "Too short." }, "excerpt"],
    ["excerpt longer than 160 characters", { excerpt: "x".repeat(161) }, "excerpt"],
    ["non-kebab-case slug", { slug: "Example_Post" }, "slug"],
    ["excerpt under 110 characters without a metaDescription", { excerpt: "x".repeat(90) }, "excerpt"],
    ["metaDescription shorter than 110 characters", { metaDescription: "Too short for search results." }, "metaDescription"],
    ["metaTitle longer than 60 characters", { metaTitle: "x".repeat(61) }, "metaTitle"],
    ["featureImage without featureImageAlt", { featureImageAlt: undefined }, "featureImageAlt"],
  ])("rejects %s", (_label, override, field) => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, ...override } })
    expect(() => loadBlogPostsFromDirectory(dir, "en", "content/blog")).toThrow(field)
  })

  it("allows a short excerpt when metaDescription covers the meta description", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, excerpt: "x".repeat(90), metaDescription: "y".repeat(120) } })
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].excerpt).toHaveLength(90)
  })

  it("allows a post without a feature image or alt text", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, featureImage: undefined, featureImageAlt: undefined } })
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].featureImage).toBeUndefined()
  })

  it("rejects a slug that does not match the filename", () => {
    const dir = writePosts({ "other-name.md": validFrontmatter })
    expect(() => loadBlogPostsFromDirectory(dir, "en", "content/blog")).toThrow("must match its filename")
  })
})

describe("single-locale blog posts", () => {
  it("emits hreflang only for the locales a page exists in", () => {
    expect(localizedHreflangAlternates("/blog/en-only/", "en", ["en"])).toEqual({
      canonical: `${SITE_URL}/blog/en-only/`,
      languages: { en: `${SITE_URL}/blog/en-only/`, "x-default": `${SITE_URL}/blog/en-only/` },
    })
    expect(localizedHreflangAlternates("/blog/ja-only/", "ja", ["ja"])).toEqual({
      canonical: `${SITE_URL}/ja/blog/ja-only/`,
      languages: { ja: `${SITE_URL}/ja/blog/ja-only/`, "x-default": `${SITE_URL}/ja/blog/ja-only/` },
    })
  })

  it("lists only the published locale in the sitemap", () => {
    const enOnly = sitemapEntriesForPath("/blog/en-only/", ["en"])
    expect(enOnly.map((entry) => entry.url)).toEqual([`${SITE_URL}/blog/en-only/`])
    expect(enOnly[0].alternates).toEqual({ en: `${SITE_URL}/blog/en-only/`, xDefault: `${SITE_URL}/blog/en-only/` })

    const jaOnly = sitemapEntriesForPath("/blog/ja-only/", ["ja"])
    expect(jaOnly.map((entry) => entry.url)).toEqual([`${SITE_URL}/ja/blog/ja-only/`])
    expect(jaOnly[0].alternates).toEqual({ ja: `${SITE_URL}/ja/blog/ja-only/`, xDefault: `${SITE_URL}/ja/blog/ja-only/` })
  })

  it("localizes relative links in Japanese content except to posts without a Japanese version", () => {
    expect(localizeBlogContentHref("/contact/", "en")).toBe("/contact/")
    expect(localizeBlogContentHref("/contact/", "ja")).toBe("/ja/contact/")
    expect(localizeBlogContentHref("/blog/iv-therapy-for-hangover/#faq", "ja")).toBe("/ja/blog/iv-therapy-for-hangover/#faq")
    expect(localizeBlogContentHref("/blog/not-translated-post/", "ja")).toBe("/blog/not-translated-post/")
    expect(localizeBlogContentHref("/ja/services/", "ja")).toBe("/ja/services/")
    expect(localizeBlogContentHref("/images/content/blog/example.jpg", "ja")).toBe("/images/content/blog/example.jpg")
    expect(localizeBlogContentHref("https://medlineplus.gov/", "ja")).toBe("https://medlineplus.gov/")
  })
})
