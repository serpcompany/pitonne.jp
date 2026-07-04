import { render, screen } from "@testing-library/react"
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { BlogPostTemplate } from "@/components/blog/blog-post-template"
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/lib/data/blog-posts"
import { getServicesFromSlugs } from "@/lib/data/services"
import { getVideoBySlug } from "@/lib/data/videos"

const migratedDraftSlugs = [
  "exosome-iv-tokyo-mobile-in-clinic-booking",
  "exosome-iv-therapy-tokyo-price-range",
  "stem-cell-therapy-vs-exosome-iv-therapy",
  "exosome-iv-therapy-risks-precautions",
  "iv-therapy-for-athletes-training-recovery",
  "iv-therapy-weight-management-pitonne",
  "iv-therapy-for-hangover-in-tokyo",
  "iv-therapy-for-dehydration-in-tokyo",
  "iv-therapy-for-cold-flu-tokyo",
  "exosome-iv-therapy-for-muscle-recovery",
  "iv-therapy-for-fatigue-in-tokyo",
  "iv-therapy-for-low-energy",
  "skin-iv-exosome-iv-therapy-beauty",
  "iv-therapy-for-detox-support",
]

describe("blog post parity", () => {
  it("loads static posts from markdown files with frontmatter", () => {
    const post = getBlogPostBySlug("iv-therapy-for-hangover")

    expect(post).toMatchObject({
      sourcePath: "content/blog/iv-therapy-for-hangover.md",
      title: "IV Therapy for Hangover: What It May Help With and What It Cannot Do",
    })
    expect(post?.content).toContain('## What People Usually Mean by "IV Therapy for Hangover"')
    expect(post?.content).not.toContain("<h2>")
  })

  it("renders markdown prose plus live discovery sections around the final takeaway", () => {
    const post = getBlogPostBySlug("iv-therapy-for-dehydration")
    expect(post).toBeDefined()

    const { container } = render(
      <BlogPostTemplate
        post={{
          title: post!.title,
          slug: post!.slug,
          date: new Date(post!.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          content: post!.content,
          excerpt: post!.excerpt,
          readingTime: post!.readingTime,
          category: post!.category,
          categorySlug: post!.categorySlug,
          author: post!.author,
          featureImage: post!.featureImage,
          relatedServiceSlugs: post!.relatedServiceSlugs,
          tags: post!.tags,
        }}
        relatedPosts={getBlogPostsByCategory(post!.categorySlug).filter((candidate) => candidate.slug !== post!.slug)}
        relatedServices={getServicesFromSlugs(post!.relatedServiceSlugs || [])}
        latestPosts={getAllBlogPosts().filter((candidate) => candidate.slug !== post!.slug)}
      />,
    )

    expect(container.querySelector(".blog-prose")).toBeInTheDocument()
    const renderedText = container.textContent || ""
    expect(renderedText.indexOf("Related Pitonne Services")).toBeGreaterThan(0)
    expect(renderedText.indexOf("Related Pitonne Services")).toBeLessThan(renderedText.indexOf("Final Takeaway"))
    expect(screen.getByRole("heading", { name: "Contact Pitonne" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute("href", "/contact")
    expect(screen.queryByText("Share This")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "X" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Facebook" })).not.toBeInTheDocument()
    expect(screen.getByRole("img", { name: post!.title })).toHaveClass("max-h-[420px]", "object-cover")
    expect(screen.getAllByRole("link", { name: "Blog" }).some((link) => link.getAttribute("href") === "/blog")).toBe(true)
    expect(screen.getByRole("heading", { name: "Read Our Latest Posts" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Questions About This Topic?" })).not.toBeInTheDocument()
  })

  it("renders blog video markers as YouTube embeds", () => {
    const post = getBlogPostBySlug("iv-therapy-for-hangover-in-tokyo")
    expect(post).toBeDefined()

    const { container } = render(
      <BlogPostTemplate
        post={{
          title: post!.title,
          slug: post!.slug,
          date: new Date(post!.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          content: post!.content,
          excerpt: post!.excerpt,
          readingTime: post!.readingTime,
          category: post!.category,
          categorySlug: post!.categorySlug,
          author: post!.author,
          featureImage: post!.featureImage,
          relatedServiceSlugs: post!.relatedServiceSlugs,
          tags: post!.tags,
        }}
        relatedPosts={getBlogPostsByCategory(post!.categorySlug).filter((candidate) => candidate.slug !== post!.slug)}
        relatedServices={getServicesFromSlugs(post!.relatedServiceSlugs || [])}
        latestPosts={getAllBlogPosts().filter((candidate) => candidate.slug !== post!.slug)}
      />,
    )

    expect(screen.getByTitle("IV Therapy for Hangover Hydration & Recovery Support")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/wDjmsOyulh0?rel=0&modestbranding=1",
    )
    expect(container.textContent).not.toContain("{{video:")
  })

  it("keeps blog video markers mapped to known Pitonne videos", () => {
    const videoMarkerPattern = /\{\{video:([a-z0-9-]+)\}\}/g

    for (const locale of ["en", "ja"] as const) {
      for (const post of getAllBlogPosts(locale)) {
        for (const match of post.content.matchAll(videoMarkerPattern)) {
          expect(getVideoBySlug(match[1]), `${post.sourcePath} references ${match[1]}`).toBeDefined()
        }
      }
    }
  })

  it("keeps migrated legacy blog bodies in sync with tracked markdown files", () => {
    const sourceRoot = path.join(process.cwd(), "content/blog")

    for (const slug of ["iv-therapy-for-dehydration", "iv-therapy-for-fatigue", "iv-therapy-for-hangover"]) {
      const markdownBody = fs
        .readFileSync(path.join(sourceRoot, `${slug}.md`), "utf8")
        .replace(/^---[\s\S]*?---\s*/, "")
        .trim()
      const post = getBlogPostBySlug(slug)

      expect(post?.content.trim()).toBe(markdownBody)
    }
  })

  it("publishes cleaned English-only draft posts with production slugs and metadata", () => {
    const japaneseScript = /[\u3040-\u30ff\u3400-\u9fff]/

    for (const slug of migratedDraftSlugs) {
      const post = getBlogPostBySlug(slug)
      expect(post, slug).toBeDefined()
      expect(post?.sourcePath).toBe(`content/blog/${slug}.md`)
      expect(post?.slug).toBe(slug)
      expect(post?.slug).not.toMatch(/draft|iv-therapy-\d|pitonne-\d|-sup$/)
      expect(post?.title).not.toMatch(japaneseScript)
      expect(post?.excerpt).not.toMatch(japaneseScript)
      expect(post?.content).not.toMatch(japaneseScript)
      expect(post?.content).not.toContain("# タブ 2")
      expect(post?.relatedServiceSlugs.length).toBeGreaterThan(0)
      expect(post?.tags.length).toBeGreaterThan(0)
      expect(post?.tags.every((tag) => !japaneseScript.test(tag))).toBe(true)
    }
  })

  it("keeps all blog markdown filenames, language, and discovery metadata linted", () => {
    const japaneseScript = /[\u3040-\u30ff\u3400-\u9fff]/

    for (const post of getAllBlogPosts()) {
      expect(post.sourcePath).toBe(`content/blog/${post.slug}.md`)
      expect(post.content).not.toContain("# タブ 2")
      expect(`${post.title}\n${post.excerpt}\n${post.content}`).not.toMatch(japaneseScript)
      expect(post.relatedServiceSlugs.length).toBeGreaterThan(0)
      expect(post.tags.length).toBeGreaterThan(0)
    }
  })
})
