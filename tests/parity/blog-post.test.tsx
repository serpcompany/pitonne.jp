import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BlogPostTemplate } from "@/components/blog/blog-post-template"
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/lib/data/blog-posts"

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
        latestPosts={getAllBlogPosts().filter((candidate) => candidate.slug !== post!.slug)}
      />,
    )

    expect(container.querySelector(".blog-prose")).toBeInTheDocument()
    const renderedText = container.textContent || ""
    expect(renderedText.indexOf("Related Pitonne Services")).toBeGreaterThan(0)
    expect(renderedText.indexOf("Related Pitonne Services")).toBeLessThan(renderedText.indexOf("Final Takeaway"))
    expect(screen.getByRole("heading", { name: "Contact Pitonne" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute("target", "_blank")
    expect(screen.queryByText("Share This")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "X" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Facebook" })).not.toBeInTheDocument()
    expect(screen.getByRole("img", { name: post!.title })).toHaveClass("max-h-[420px]", "object-cover")
    expect(screen.getAllByRole("link", { name: "Blog" }).some((link) => link.getAttribute("href") === "/blog")).toBe(true)
    expect(screen.getByRole("heading", { name: "Read Our Latest Posts" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Questions About This Topic?" })).not.toBeInTheDocument()
  })
})
