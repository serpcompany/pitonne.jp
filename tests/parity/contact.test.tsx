import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContactPage from "@/app/[locale]/contact/page"
import { getBusinessInfo } from "@/lib/data/site"
import { getDictionary } from "@/lib/i18n/dictionaries"

const dict = getDictionary("en")
const info = getBusinessInfo("en")

describe("contact page", () => {
  it("links to the external booking form instead of rendering a local form", async () => {
    render(await ContactPage({ params: Promise.resolve({ locale: "en" }) }))

    expect(screen.getByRole("link", { name: dict.common.bookConsultation })).toHaveAttribute("href", info.bookingUrl)
    expect(screen.queryByRole("textbox", { name: /full name/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /send message/i })).not.toBeInTheDocument()
    expect(screen.queryByText("Nishi-Azabu, Tokyo")).not.toBeInTheDocument()

    const saturdayHours = info.hours.find((item) => item.day === "Saturday")
    expect(saturdayHours).toBeDefined()
    expect(screen.getByText(`${saturdayHours!.day}: ${saturdayHours!.hours}`)).toBeInTheDocument()
  })

  it("renders Japan and U.S. phone numbers as callable links", async () => {
    render(await ContactPage({ params: Promise.resolve({ locale: "en" }) }))

    expect(screen.getByRole("link", { name: `${dict.contact.japan}: ${info.phone}` })).toHaveAttribute(
      "href",
      "tel:03-6821-8285",
    )
    expect(screen.getByRole("link", { name: `${dict.contact.us}: +1 786 814 0323` })).toHaveAttribute(
      "href",
      "tel:+17868140323",
    )
  })
})
