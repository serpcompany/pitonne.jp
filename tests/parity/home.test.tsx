import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import HomePage from "@/app/page"
import { businessInfo } from "@/lib/data/site"

describe("home page", () => {
  it("uses the green CTA style and opens the hero booking link in a new tab", () => {
    render(<HomePage />)

    const cta = screen.getByRole("link", { name: "Book Consultation" })
    expect(cta).toHaveAttribute("href", businessInfo.bookingUrl)
    expect(cta).toHaveAttribute("target", "_blank")
    expect(cta).toHaveAttribute("rel", "noopener noreferrer")
    expect(cta).toHaveClass("bg-[#4AA69D]", "hover:bg-[#3d8a83]")
  })
})
