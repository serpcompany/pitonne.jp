import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import { Footer } from "@/components/footer"
import { canonicalRoutes } from "@/lib/data/routes"
import { businessHours, businessInfo, formatBusinessHours } from "@/lib/data/site"
import fs from "node:fs"
import path from "node:path"

describe("footer and CTA data parity", () => {
  it("uses live business hours and legal routes", () => {
    expect(businessHours).toEqual([
      { day: "Monday", opens: "10:00", closes: "19:00" },
      { day: "Tuesday", opens: "10:00", closes: "19:00" },
      { day: "Wednesday", opens: "10:00", closes: "19:00" },
      { day: "Thursday", opens: "10:00", closes: "19:00" },
      { day: "Friday", opens: "10:00", closes: "19:00" },
      { day: "Saturday", opens: "10:00", closes: "13:00" },
      { day: "Sunday", closed: true },
    ])
    expect(businessInfo.hours).toEqual(
      businessHours.map((item) => ({ day: item.day, hours: formatBusinessHours(item) })),
    )
    expect(businessInfo.bookingUrl).toBe("https://ssv.onemorehand.jp/hic_pitonne/support/inquiry?preview=on&lang=en")
    expect(canonicalRoutes.termsConditions).toBe("/legal/terms-conditions/")
  })

  it("links to the legal index from the footer instead of individual legal pages", () => {
    const footerSource = fs.readFileSync(path.join(process.cwd(), "components/footer.tsx"), "utf8")

    expect(footerSource).toContain('{ name: "Videos", href: canonicalRoutes.videos }')
    expect(footerSource).toContain('{ name: "Legal", href: canonicalRoutes.legal }')
    expect(footerSource).not.toContain('{ name: "Privacy Policy", href: canonicalRoutes.privacyPolicy }')
    expect(footerSource).not.toContain('{ name: "Terms of Use", href: canonicalRoutes.termsConditions }')
    expect(footerSource).not.toContain('{ name: "Medical Disclaimer", href: canonicalRoutes.medicalDisclaimer }')
  })

  it("does not render a phone number in the footer", () => {
    render(React.createElement(Footer))

    expect(screen.queryByRole("link", { name: businessInfo.phone })).not.toBeInTheDocument()
  })

  it("links Instagram to the pitonne_nurse profile", () => {
    render(React.createElement(Footer))

    expect(screen.getByLabelText("Instagram")).toHaveAttribute(
      "href",
      "https://www.instagram.com/pitonne_nurse",
    )
  })
})
