import { describe, expect, it } from "vitest"
import { canonicalRoutes } from "@/lib/data/routes"
import { businessInfo } from "@/lib/data/site"
import fs from "node:fs"
import path from "node:path"

describe("footer and CTA data parity", () => {
  it("uses live business hours and legal routes", () => {
    expect(businessInfo.hours).toContainEqual({ day: "Wednesday", hours: "Closed" })
    expect(businessInfo.hours).toContainEqual({ day: "Saturday", hours: "Closed" })
    expect(businessInfo.bookingUrl).toBe("https://ssv.onemorehand.jp/hic_pitonne/")
    expect(canonicalRoutes.termsConditions).toBe("/legal/terms-conditions/")
  })

  it("links to the legal index from the footer instead of individual legal pages", () => {
    const footerSource = fs.readFileSync(path.join(process.cwd(), "components/footer.tsx"), "utf8")

    expect(footerSource).toContain('{ name: "Legal", href: canonicalRoutes.legal }')
    expect(footerSource).not.toContain('{ name: "Privacy Policy", href: canonicalRoutes.privacyPolicy }')
    expect(footerSource).not.toContain('{ name: "Terms of Use", href: canonicalRoutes.termsConditions }')
    expect(footerSource).not.toContain('{ name: "Medical Disclaimer", href: canonicalRoutes.medicalDisclaimer }')
  })
})
