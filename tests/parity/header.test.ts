import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

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
})
