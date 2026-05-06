import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContactPage from "@/app/contact/page"
import { businessInfo } from "@/lib/data/site"

const inquiryUrl = "https://ssv.onemorehand.jp/hic_pitonne/support/inquiry?preview=on&lang=en"

describe("contact page", () => {
  it("links to the external inquiry form instead of rendering a local form", () => {
    render(<ContactPage />)

    expect(screen.getByRole("link", { name: "Open Inquiry Form" })).toHaveAttribute("href", inquiryUrl)
    expect(screen.queryByRole("textbox", { name: /full name/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /send message/i })).not.toBeInTheDocument()
    expect(screen.queryByText("Nishi-Azabu, Tokyo")).not.toBeInTheDocument()

    const saturdayHours = businessInfo.hours.find((item) => item.day === "Saturday")
    expect(saturdayHours).toBeDefined()
    expect(screen.getByText(`${saturdayHours!.day}: ${saturdayHours!.hours}`)).toBeInTheDocument()
  })
})
