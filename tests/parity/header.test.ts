import fs from "node:fs"
import path from "node:path"
import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vitest"
import { Header } from "@/components/header"

describe("header navigation parity", () => {
  it("keeps FAQs under the About dropdown instead of primary navigation", () => {
    const headerSource = fs.readFileSync(path.join(process.cwd(), "components/header.tsx"), "utf8")
    const primaryNavigation = headerSource.slice(
      headerSource.indexOf("const navigation = ["),
      headerSource.indexOf("]\n\nexport function Header"),
    )

    expect(headerSource).toContain('{ name: "About", href: canonicalRoutes.about, hasDropdown: "about" }')
    expect(primaryNavigation).not.toContain('{ name: "FAQs", href: canonicalRoutes.faqs }')
    expect(headerSource).toContain('{ name: "FAQs", href: canonicalRoutes.faqs }')
    expect(headerSource).toContain('item.hasDropdown === "about"')
    expect(headerSource).toContain('mobileExpandedSection === "about"')
  })

  it("exposes Japan and U.S. phone links through the header phone menu", () => {
    const headerSource = fs.readFileSync(path.join(process.cwd(), "components/header.tsx"), "utf8")

    expect(headerSource).toContain('setActiveDropdown("phone")')
    expect(headerSource).toContain('activeDropdown === "phone"')
    expect(headerSource).toContain("Phone")
    expect(headerSource).toContain("Japan")
    expect(headerSource).toContain("tel:070-2194-0199")
    expect(headerSource).toContain("070-2194-0199")
    expect(headerSource).toContain("U.S.")
    expect(headerSource).toContain("tel:+17868140323")
    expect(headerSource).toContain("+1 786 814 0323")
  })

  it("keeps mobile dropdown sections expandable with phone links in the menu", () => {
    render(React.createElement(Header))

    fireEvent.click(screen.getByRole("button", { name: "Toggle menu" }))

    expect(screen.getByRole("link", { name: "Japan: 070-2194-0199" })).toHaveAttribute(
      "href",
      "tel:070-2194-0199",
    )
    expect(screen.getByRole("link", { name: "U.S.: +1 786 814 0323" })).toHaveAttribute(
      "href",
      "tel:+17868140323",
    )

    fireEvent.click(screen.getByRole("button", { name: "About" }))
    expect(screen.getByRole("link", { name: "FAQs" })).toHaveAttribute("href", "/faqs")

    fireEvent.click(screen.getByRole("button", { name: "Services" }))
    expect(screen.getByRole("link", { name: "IV Therapy" })).toHaveAttribute("href", "/services/iv-therapy")

    fireEvent.click(screen.getByRole("button", { name: "Areas Served" }))
    expect(screen.getByRole("link", { name: "Roppongi" })).toHaveAttribute(
      "href",
      "/areas-served/minato/roppongi",
    )
  })
})
