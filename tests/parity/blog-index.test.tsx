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

  it("renders the featured-post placeholder and uses accessible active category contrast", async () => {
    render(await BlogPage({ params: Promise.resolve({ locale: "en" }) }))

    expect(getAllBlogPosts()[0].featureImage).toBeUndefined()
    expect(screen.queryByAltText(getAllBlogPosts()[0].title)).not.toBeInTheDocument()
    expect(screen.getByText(dict.blog.featuredArticle)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: dict.blog.all })).toHaveClass("bg-[#7A8F87]")
  })
})
