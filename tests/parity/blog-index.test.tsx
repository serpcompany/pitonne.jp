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

  it("prioritizes the featured post image and uses accessible active category contrast", async () => {
    render(await BlogPage({ params: Promise.resolve({ locale: "en" }) }))

    const featuredImage = screen.getByAltText(getAllBlogPosts()[0].title)
    expect(featuredImage).toHaveAttribute("fetchpriority", "high")
    expect(screen.getByRole("link", { name: dict.blog.all })).toHaveClass("bg-[#7A8F87]")
  })
})
