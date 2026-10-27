import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContactPage from "@/app/[locale]/contact/page"
import { getBusinessInfo } from "@/lib/data/site"
import { getDictionary } from "@/lib/i18n/dictionaries"

const dict = getDictionary("en")
const info = getBusinessInfo("en")

describe("contact page", () => {
  it("opens the secure GHL contact form instead of linking to the legacy inquiry site", async () => {
    render(await ContactPage({ params: Promise.resolve({ locale: "en" }) }))

    expect(screen.getByRole("link", { name: dict.common.bookConsultation })).toHaveAttribute("href", info.bookingUrl)
    expect(screen.queryByRole("textbox", { name: /full name/i })).not.toBeInTheDocument()
    expect(screen.queryByTitle(dict.contact.formTitle)).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: dict.common.sendMessage })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: dict.common.sendMessage }))

    expect(screen.getByRole("dialog", { name: dict.contact.formTitle })).toBeInTheDocument()
    expect(screen.getByTitle(dict.contact.formTitle)).toHaveAttribute(
      "src",
      "https://api.leadconnectorhq.com/widget/form/QJR9bZP4y72C8jUcGC7F",
    )
    expect(screen.queryByText("Nishi-Azabu, Tokyo")).not.toBeInTheDocument()

    const saturdayHours = info.hours.find((item) => item.day === "Saturday")
    expect(saturdayHours).toBeDefined()
    expect(screen.getByText(`${saturdayHours!.day}: ${saturdayHours!.hours}`)).toBeInTheDocument()
  })

  it.each(["en", "ja"] as const)("renders only the Japan phone number as a callable link (%s)", async (locale) => {
    const { container } = render(await ContactPage({ params: Promise.resolve({ locale }) }))

    expect(screen.getByRole("link", { name: getBusinessInfo(locale).phone })).toHaveAttribute(
      "href",
      "tel:03-6821-8285",
    )
    expect(container).not.toHaveTextContent("+1 786 814 0323")
    expect(container.querySelector('a[href="tel:+17868140323"]')).not.toBeInTheDocument()
  })

  it("does not expose the retired Gmail address", async () => {
    const { container } = render(await ContactPage({ params: Promise.resolve({ locale: "en" }) }))
    const retiredAddress = ["pitonne.am", "gmail.com"].join("@")

    expect(container).not.toHaveTextContent(retiredAddress)
    expect(container.querySelector('a[href^="mailto:"]')).not.toBeInTheDocument()
    expect(info).not.toHaveProperty("email")
  })

  it("does not offer the English-only contact form on the Japanese contact page", async () => {
    const jaDict = getDictionary("ja")

    render(await ContactPage({ params: Promise.resolve({ locale: "ja" }) }))

    expect(screen.queryByRole("button", { name: jaDict.common.sendMessage })).not.toBeInTheDocument()
    expect(screen.queryByTitle(jaDict.contact.formTitle)).not.toBeInTheDocument()
  })
})
