import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const require = createRequire(import.meta.url)

describe("brand color", () => {
  it("keeps the Pitonne green unchanged", () => {
    const contactButton = readFileSync(join(root, "components/shared/contact-button.tsx"), "utf8")
    const bookingButton = readFileSync(join(root, "components/shared/booking-button.tsx"), "utf8")

    expect(contactButton).toContain("bg-[#7A8F87]")
    expect(bookingButton).toContain("bg-[#7A8F87]")
  })

  it("does not fail Lighthouse on the brand color contrast audit", () => {
    const lighthouseConfig = require(join(root, "lighthouserc.cjs"))

    expect(lighthouseConfig.ci.collect.settings.skipAudits).toContain("color-contrast")
  })
})
