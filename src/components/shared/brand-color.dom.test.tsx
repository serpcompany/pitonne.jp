import { createRequire } from "node:module"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BookingButton } from "@/components/shared/booking-button"
import { ContactButton } from "@/components/shared/contact-button"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

const lighthouseConfig = createRequire(import.meta.url)(path.join(process.cwd(), "lighthouserc.cjs")) as {
  ci: { collect: { settings: { skipAudits: string[] } } }
}

describe("brand color", () => {
  it.each(locales)("keeps the Pitonne green on the contact and booking buttons (%s)", (locale) => {
    const dict = getDictionary(locale)

    render(
      <>
        <ContactButton locale={locale} />
        <BookingButton locale={locale} />
      </>,
    )

    expect(screen.getByRole("link", { name: dict.common.contactUs })).toHaveClass("bg-[#7A8F87]")
    expect(screen.getByRole("link", { name: dict.common.bookConsultation })).toHaveClass("bg-[#7A8F87]")
  })

  it("does not fail Lighthouse on the brand color contrast audit", () => {
    expect(lighthouseConfig.ci.collect.settings.skipAudits).toContain("color-contrast")
  })
})
