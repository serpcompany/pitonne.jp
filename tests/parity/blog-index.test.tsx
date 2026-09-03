import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import BlogPage from "@/app/[locale]/blog/page"
import { getAllBlogPosts } from "@/lib/data/blog-posts"
import { getDictionary } from "@/lib/i18n/dictionaries"

const dict = getDictionary("en")

describe("blog index page", () => {
  it("does not render the standalone top image below the hero", async () => {
    render(await BlogPage({ params: Promise.resolve({ locale: "en" }) }))

    expect(screen.queryByAltText("Pitonne wellness care and treatment insights in Tokyo")).not.toBeInTheDocument()
  })

  it("renders supplied featured images with descriptive alt text and accessible active category contrast", async () => {
    render(await BlogPage({ params: Promise.resolve({ locale: "en" }) }))

    const postsWithNewImages = getAllBlogPosts().filter((post) =>
      post.featureImage?.startsWith("/images/content/blog/"),
    )
    expect(postsWithNewImages).toHaveLength(7)
    for (const post of postsWithNewImages) {
      expect(post.featureImageAlt).toBeTruthy()
      expect(screen.getByRole("img", { name: post.featureImageAlt }).getAttribute("src")).toContain(
        encodeURIComponent(post.featureImage!),
      )
    }
    expect(screen.getByRole("link", { name: dict.blog.all })).toHaveClass("bg-[#7A8F87]")
  })
})
