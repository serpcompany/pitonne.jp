import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import HomePage from "@/app/[locale]/page"
import { businessInfo } from "@/lib/data/site"
import { getDictionary } from "@/lib/i18n/dictionaries"

const dict = getDictionary("en")

describe("home page", () => {
  it("uses an accessible green CTA style and opens the hero booking link in a new tab", async () => {
    render(await HomePage({ params: Promise.resolve({ locale: "en" }) }))

    const cta = screen.getByRole("link", { name: dict.common.bookConsultation })
    expect(cta).toHaveAttribute("href", businessInfo.bookingUrl)
    expect(cta).toHaveAttribute("target", "_blank")
    expect(cta).toHaveAttribute("rel", "noopener noreferrer")
    expect(cta).toHaveClass("bg-[#7A8F87]", "hover:bg-[#245f5a]")
  })

  it("keeps the supporting homepage image out of the mobile LCP path", async () => {
    render(await HomePage({ params: Promise.resolve({ locale: "en" }) }))

    const cta = screen.getByRole("link", { name: dict.common.bookConsultation })
    expect(cta.closest("section")).toHaveClass("min-h-[calc(100svh-73px)]")

    const lcpImage = screen.getByAltText("Tokyo Tower view near Pitonne in Nishi Azabu")
    expect(lcpImage).not.toHaveAttribute("fetchpriority", "high")
  })
})
