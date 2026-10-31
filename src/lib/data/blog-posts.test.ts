import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import matter from "gray-matter"
import {
  blogPosts,
  estimateReadingTime,
  getAllBlogPosts,
  getAllCategories,
  loadBlogPostsFromDirectory,
  localizeBlogContentHref,
  withoutLeadingTitleHeading,
} from "@/lib/data/blog-posts"
import { BLOG_RELATED_SERVICE_OPTIONS } from "@/lib/blog-rules"
import { blogCategories, loadBlogCategoriesFromDirectory } from "@/lib/data/blog-categories"
import { localizedHreflangAlternates } from "@/lib/seo"
import { sitemapEntriesForPath } from "@/lib/sitemaps"

const SITE_URL = "https://pitonne.jp"

const validFrontmatter = {
  slug: "example-post",
  title: "Example Post",
  excerpt:
    "An example excerpt that is long enough to work as the meta description, which needs one hundred and ten characters.",
  publishedAt: "2026-10-01",
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

function writeCategories(categories: Record<string, unknown>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-categories-"))
  tempDirs.push(dir)
  for (const [fileName, data] of Object.entries(categories)) {
    fs.writeFileSync(path.join(dir, fileName), typeof data === "string" ? data : JSON.stringify(data, null, 2))
  }
  return dir
}

const validCategory = {
  name: "Nutrition",
  nameJa: "栄養",
  description: "x".repeat(110),
  descriptionJa: "あ".repeat(110),
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
    ["metaDescription shorter than 110 characters", { metaDescription: "Too short for search results." }, "metaDescription"],
    ["metaTitle longer than 60 characters", { metaTitle: "x".repeat(61) }, "metaTitle"],
  ])("rejects %s", (_label, override, field) => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, ...override } })
    expect(() => loadBlogPostsFromDirectory(dir, "en", "content/blog")).toThrow(field)
  })

  it("publishes a short excerpt without a metaDescription instead of failing the build", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, excerpt: "x".repeat(90) } })
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].excerpt).toHaveLength(90)
  })

  it("allows a short excerpt when metaDescription covers the meta description", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, excerpt: "x".repeat(90), metaDescription: "y".repeat(120) } })
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].excerpt).toHaveLength(90)
  })

  it("keeps every feature image file in place, with a separate folder per locale", () => {
    for (const locale of ["en", "ja"] as const) {
      const folder = locale === "ja" ? "/images/content/blog/ja/" : "/images/content/blog/"
      for (const post of getAllBlogPosts(locale)) {
        if (!post.featureImage) continue
        expect(post.featureImage, post.sourcePath).toMatch(new RegExp(`^${folder}${post.slug}/`))
        expect(fs.existsSync(path.join(process.cwd(), "public", post.featureImage)), post.featureImage).toBe(true)
      }
    }
  })

  it("keeps every category file valid and every post's categorySlug pointing at one, in both locales", () => {
    const categoryDir = path.join(process.cwd(), "content/blog-categories")
    const categoryFiles = fs.readdirSync(categoryDir).filter((file) => file.endsWith(".json"))
    expect(categoryFiles.length).toBeGreaterThan(0)
    expect(blogCategories.map((category) => `${category.slug}.json`)).toEqual(categoryFiles.sort())

    const categorySlugs = blogCategories.map((category) => category.slug)
    // Read the raw frontmatter so drafts are covered too
    for (const dir of ["content/blog", "content/blog/ja"]) {
      for (const file of fs.readdirSync(path.join(process.cwd(), dir)).filter((name) => name.endsWith(".md"))) {
        const { data } = matter(fs.readFileSync(path.join(process.cwd(), dir, file), "utf8"))
        expect(categorySlugs, `${dir}/${file} categorySlug`).toContain(data.categorySlug)
      }
    }
  })

  it("localizes category names and descriptions from the category file", () => {
    const iv = blogCategories.find((category) => category.slug === "iv-therapy")!
    expect(iv.name).toEqual({ en: "IV Therapy", ja: "点滴療法" })
    expect(iv.description.en).toMatch(/^Explore IV therapy articles/)
    expect(iv.description.ja).toMatch(/^点滴療法に関する情報/)

    for (const locale of ["en", "ja"] as const) {
      const listed = getAllCategories(locale).find((category) => category.slug === "iv-therapy")!
      expect(listed).toMatchObject({ name: iv.name[locale], description: iv.description[locale], ctaDescription: iv.ctaDescription[locale] })
      expect(listed.ctaDescription).toBeTruthy()
      for (const post of getAllBlogPosts(locale)) {
        expect(post.category, post.sourcePath).toBe(blogCategories.find((category) => category.slug === post.categorySlug)!.name[locale])
      }
    }

    const dir = writeCategories({ "nutrition.json": validCategory })
    expect(loadBlogCategoriesFromDirectory(dir)).toEqual([
      {
        slug: "nutrition",
        name: { en: "Nutrition", ja: "栄養" },
        description: { en: validCategory.description, ja: validCategory.descriptionJa },
        ctaDescription: { en: undefined, ja: undefined },
        sourcePath: "content/blog-categories/nutrition.json",
      },
    ])
  })

  it("rejects a publishedAt timestamp instead of shifting it to another day", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, publishedAt: "PLACEHOLDER" } })
    const file = path.join(dir, "example-post.md")
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('"PLACEHOLDER"', "2026-03-16T08:00:00+09:00"))
    expect(() => loadBlogPostsFromDirectory(dir, "en", "content/blog")).toThrow("publishedAt")

    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("2026-03-16T08:00:00+09:00", "2026-03-16"))
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].publishedAt).toBe("2026-03-16")
  })

  it.each([
    ["a missing Japanese name", { nameJa: undefined }, "nameJa"],
    ["a description shorter than 110 characters", { description: "Too short." }, "description"],
    ["a Japanese description longer than 160 characters", { descriptionJa: "あ".repeat(161) }, "descriptionJa"],
  ])("rejects a category file with %s", (_label, override, field) => {
    const dir = writeCategories({ "nutrition.json": { ...validCategory, ...override } })
    expect(() => loadBlogCategoriesFromDirectory(dir)).toThrow(field)
  })

  it("rejects a category file that is not valid JSON or not named by a kebab-case slug", () => {
    expect(() => loadBlogCategoriesFromDirectory(writeCategories({ "nutrition.json": "{ name: " }))).toThrow("Invalid JSON")
    expect(() => loadBlogCategoriesFromDirectory(writeCategories({ "Nutrition_Tips.json": validCategory }))).toThrow("kebab-case")
  })

  it("localizes the category name from categorySlug and rejects unknown categories", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, categorySlug: "blood-tests" } })
    expect(loadBlogPostsFromDirectory(dir, "ja", "content/blog/ja")[0].category).toBe("血液検査")

    // A category created in the CMS works without any code change
    const categories = loadBlogCategoriesFromDirectory(writeCategories({ "nutrition.json": validCategory }))
    const nutrition = writePosts({ "example-post.md": { ...validFrontmatter, categorySlug: "nutrition" } })
    expect(loadBlogPostsFromDirectory(nutrition, "ja", "content/blog/ja", categories)[0].category).toBe("栄養")

    // Unknown categories fail the build, drafts included, naming the post and the slug
    expect(() => loadBlogPostsFromDirectory(nutrition, "en", "content/blog")).toThrow(
      'content/blog/example-post.md has categorySlug "nutrition", but content/blog-categories/nutrition.json does not exist'
    )
    const draft = writePosts({ "example-post.md": { ...validFrontmatter, categorySlug: "nutrition", draft: true } })
    expect(() => loadBlogPostsFromDirectory(draft, "en", "content/blog")).toThrow("categorySlug")
  })

  it("offers every service as a CMS related-service option and only links existing services", () => {
    const serviceSlugs = fs
      .readdirSync(path.join(process.cwd(), "content/services"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""))
      .sort()
    expect(BLOG_RELATED_SERVICE_OPTIONS.map((option) => option.value).sort()).toEqual(serviceSlugs)

    for (const post of [...blogPosts, ...getAllBlogPosts("ja")]) {
      for (const slug of post.relatedServiceSlugs) {
        expect(serviceSlugs, `${post.sourcePath} relatedServiceSlugs`).toContain(slug)
      }
    }
  })

  it("drops a leading title heading from the body", () => {
    expect(withoutLeadingTitleHeading("# My Title\n\nIntro paragraph.\n\n## Section")).toBe("Intro paragraph.\n\n## Section")
    expect(withoutLeadingTitleHeading("Intro.\n\n# Later heading")).toBe("Intro.\n\n# Later heading")
    expect(withoutLeadingTitleHeading("## Section\n\nText")).toBe("## Section\n\nText")
  })

  it("uses the post title as alt text when a feature image has none", () => {
    const dir = writePosts({ "example-post.md": { ...validFrontmatter, featureImageAlt: undefined } })
    expect(loadBlogPostsFromDirectory(dir, "en", "content/blog")[0].featureImageAlt).toBe(validFrontmatter.title)
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
