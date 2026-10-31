import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { canonicalRoutes, localizedRoute } from "@/lib/data/routes"
import { getBusinessInfo } from "@/lib/data/site"
import { type Locale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { siteHeader } from "@/test/pages"

const retiredPhoneGroups = ["786", "814", "0323"]
const retiredPhoneHref = `tel:+1${retiredPhoneGroups.join("")}`
const retiredPhoneText = `+1 ${retiredPhoneGroups.join(" ")}`

function routeHref(path: string) {
  return expect.stringMatching(new RegExp(`^${path.replace(/\/$/, "")}/?$`))
}

function renderHeader(locale: Locale) {
  return render(siteHeader(locale))
}

function phoneLinks(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]'))
}

describe.each(locales)("header navigation (%s)", (locale) => {
  const dict = getDictionary(locale)
  const { phone } = getBusinessInfo(locale)
  const faqsHref = localizedRoute(canonicalRoutes.faqs, locale)

  it("keeps FAQs out of the primary navigation and reveals it only in the desktop About dropdown", () => {
    renderHeader(locale)

    expect(screen.queryByRole("link", { name: dict.nav.faqs })).not.toBeInTheDocument()

    for (const name of [dict.nav.services, dict.nav.areasServed]) {
      const item = screen.getByRole("link", { name })
      fireEvent.mouseEnter(item)
      expect(screen.queryByRole("link", { name: dict.nav.faqs })).not.toBeInTheDocument()
      fireEvent.mouseLeave(item)
    }

    const about = screen.getByRole("link", { name: dict.nav.about })
    fireEvent.mouseEnter(about)
    expect(screen.getByRole("link", { name: dict.nav.faqs })).toHaveAttribute("href", routeHref(faqsHref))

    fireEvent.mouseLeave(about)
    expect(screen.queryByRole("link", { name: dict.nav.faqs })).not.toBeInTheDocument()
  })

  it("keeps FAQs out of the mobile menu until the About section is expanded", () => {
    renderHeader(locale)

    fireEvent.click(screen.getByRole("button", { name: dict.common.toggleMenu }))
    expect(screen.queryByRole("link", { name: dict.nav.faqs })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: dict.nav.services }))
    expect(screen.queryByRole("link", { name: dict.nav.faqs })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: dict.nav.about }))
    expect(screen.getByRole("link", { name: dict.nav.faqs })).toHaveAttribute("href", routeHref(faqsHref))
  })

  it("links Videos from the primary navigation and the mobile menu", () => {
    const videosHref = localizedRoute(canonicalRoutes.videos, locale)
    renderHeader(locale)

    expect(screen.getByRole("link", { name: dict.nav.videos })).toHaveAttribute("href", routeHref(videosHref))

    fireEvent.click(screen.getByRole("button", { name: dict.common.toggleMenu }))
    const videosLinks = screen.getAllByRole("link", { name: dict.nav.videos })
    expect(videosLinks).toHaveLength(2)
    for (const link of videosLinks) expect(link).toHaveAttribute("href", routeHref(videosHref))
  })

  it("offers only the Japan number in the phone menu and the mobile menu", () => {
    const { container } = renderHeader(locale)

    expect(phoneLinks(container)).toEqual([])

    fireEvent.mouseEnter(screen.getByRole("button", { name: dict.nav.phone }))
    expect(phoneLinks(container).map((link) => [link.getAttribute("href"), link.textContent])).toEqual([
      [`tel:${phone}`, phone],
    ])

    fireEvent.click(screen.getByRole("button", { name: dict.common.toggleMenu }))
    const allPhoneLinks = phoneLinks(container)
    expect(allPhoneLinks).toHaveLength(2)
    for (const link of allPhoneLinks) {
      expect(link).toHaveAttribute("href", `tel:${phone}`)
      expect(link).toHaveTextContent(phone)
    }

    expect(container.querySelector(`a[href="${retiredPhoneHref}"]`)).not.toBeInTheDocument()
    expect(container).not.toHaveTextContent(retiredPhoneText)
  })

  it("labels the menu toggle with the dictionary text for the locale", () => {
    renderHeader(locale)

    expect(screen.getByRole("button", { name: dict.common.toggleMenu })).toBeInTheDocument()
    for (const other of locales.filter((candidate) => candidate !== locale)) {
      expect(getDictionary(other).common.toggleMenu).not.toBe(dict.common.toggleMenu)
      expect(screen.queryByRole("button", { name: getDictionary(other).common.toggleMenu })).not.toBeInTheDocument()
    }
  })
})
