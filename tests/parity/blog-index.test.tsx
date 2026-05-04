import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import BlogPage from "@/app/blog/page"
import { getAllBlogPosts } from "@/lib/data/blog-posts"

describe("blog index page", () => {
  it("does not render the standalone top image below the hero", async () => {
    render(await BlogPage())

    expect(screen.queryByAltText("Pitonne wellness care and treatment insights in Tokyo")).not.toBeInTheDocument()
  })

  it("prioritizes the featured post image and uses accessible active category contrast", async () => {
    render(await BlogPage())

    const featuredImage = screen.getByAltText(getAllBlogPosts()[0].title)
    expect(featuredImage).toHaveAttribute("fetchpriority", "high")
    expect(screen.getByRole("link", { name: "All" })).toHaveClass("bg-[#7A8F87]")
  })
})
