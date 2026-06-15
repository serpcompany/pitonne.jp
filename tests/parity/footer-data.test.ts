import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { canonicalRoutes } from "@/lib/data/routes"
import { businessHours, businessInfo, formatBusinessHours } from "@/lib/data/site"

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
    expect(businessInfo.bookingUrl).toBe("https://ssv.onemorehand.jp/hic_pitonne/reserve/index?preview=on&lang=en")
    expect(canonicalRoutes.termsConditions).toBe("/legal/terms-conditions/")
  })

  it("uses dict lookups for Videos and Legal links instead of hardcoded strings", () => {
    const footerSource = fs.readFileSync(path.join(process.cwd(), "components/footer.tsx"), "utf8")

    // Footer uses dict.nav for link names
    expect(footerSource).toContain("dict.nav.videos")
    expect(footerSource).toContain("dict.nav.legal")
    // Should NOT have hardcoded English link names
    expect(footerSource).not.toContain('name: "Videos"')
    expect(footerSource).not.toContain('name: "Legal"')
    expect(footerSource).not.toContain('name: "Privacy Policy"')
    expect(footerSource).not.toContain('name: "Terms of Use"')
    expect(footerSource).not.toContain('name: "Medical Disclaimer"')
  })

  it("uses getBusinessInfo for locale-aware data", () => {
    const footerSource = fs.readFileSync(path.join(process.cwd(), "components/footer.tsx"), "utf8")
    expect(footerSource).toContain("getBusinessInfo")
    expect(footerSource).toContain("getBusinessInfo(locale)")
  })
})
