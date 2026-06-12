import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContactPage from "@/app/contact/page"
import { businessInfo } from "@/lib/data/site"

describe("contact page", () => {
  it("links to the external booking form instead of rendering a local form", () => {
    render(<ContactPage />)

    expect(screen.getByRole("link", { name: "Book Consultation" })).toHaveAttribute("href", businessInfo.bookingUrl)
    expect(screen.queryByRole("textbox", { name: /full name/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /send message/i })).not.toBeInTheDocument()
    expect(screen.queryByText("Nishi-Azabu, Tokyo")).not.toBeInTheDocument()

    const saturdayHours = businessInfo.hours.find((item) => item.day === "Saturday")
    expect(saturdayHours).toBeDefined()
    expect(screen.getByText(`${saturdayHours!.day}: ${saturdayHours!.hours}`)).toBeInTheDocument()
  })

  it("renders Japan and U.S. phone numbers as callable links", () => {
    render(<ContactPage />)

    expect(screen.getByRole("link", { name: "Japan: 070-2194-0199" })).toHaveAttribute(
      "href",
      "tel:070-2194-0199",
    )
    expect(screen.getByRole("link", { name: "U.S.: +1 786 814 0323" })).toHaveAttribute(
      "href",
      "tel:+17868140323",
    )
  })
})
