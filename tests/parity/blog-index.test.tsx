import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import BlogPage from "@/app/blog/page"

describe("blog index page", () => {
  it("does not render the standalone top image below the hero", async () => {
    render(await BlogPage())

    expect(screen.queryByAltText("Pitonne wellness care and treatment insights in Tokyo")).not.toBeInTheDocument()
  })
})
