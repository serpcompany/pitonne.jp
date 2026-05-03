import { describe, expect, it } from "vitest"
import { canonicalRoutes } from "@/lib/data/routes"
import { businessInfo } from "@/lib/data/site"

describe("footer and CTA data parity", () => {
  it("uses live business hours and legal routes", () => {
    expect(businessInfo.hours).toContainEqual({ day: "Wednesday", hours: "Closed" })
    expect(businessInfo.hours).toContainEqual({ day: "Saturday", hours: "Closed" })
    expect(businessInfo.bookingUrl).toBe("https://ssv.onemorehand.jp/hic_pitonne/")
    expect(canonicalRoutes.termsConditions).toBe("/legal/terms-and-conditions/")
  })
})
