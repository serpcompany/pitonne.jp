import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("header navigation parity", () => {
  it("keeps FAQs under the About dropdown instead of primary navigation", () => {
    const headerSource = fs.readFileSync(path.join(process.cwd(), "components/header.tsx"), "utf8")
    const primaryNavigation = headerSource.slice(
      headerSource.indexOf("const navigation = ["),
      headerSource.indexOf("]\n\n  return"),
    )

    // Navigation uses dict lookups — verify the structure, not English strings
    expect(headerSource).toContain("dict.nav.about")
    expect(headerSource).toContain('hasDropdown: "about"')
    expect(primaryNavigation).not.toContain("dict.nav.faqs")
    expect(headerSource).toContain("dict.nav.videos")
    expect(headerSource).toContain("dict.nav.faqs")
    expect(headerSource).toContain('item.hasDropdown === "about"')
    expect(headerSource).toContain('mobileExpandedSection === "about"')
  })

  it("exposes phone links through the header phone menu using dict labels", () => {
    const headerSource = fs.readFileSync(path.join(process.cwd(), "components/header.tsx"), "utf8")

    expect(headerSource).toContain('setActiveDropdown("phone")')
    expect(headerSource).toContain('activeDropdown === "phone"')
    expect(headerSource).toContain("dict.contact.japan")
    expect(headerSource).toContain("dict.contact.us")
    expect(headerSource).toContain("tel:03-6821-8285")
    expect(headerSource).toContain("03-6821-8285")
    expect(headerSource).toContain("tel:+17868140323")
    expect(headerSource).toContain("+1 786 814 0323")
  })

  it("uses dict for toggle menu sr-only text", () => {
    const headerSource = fs.readFileSync(path.join(process.cwd(), "components/header.tsx"), "utf8")
    expect(headerSource).toContain("dict.common.toggleMenu")
  })
})
