import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from '@/components/footer'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { businessHours, businessHoursDisplay, businessInfo, getBusinessInfo } from '@/lib/data/site'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { routeHref } from '@/test/route-href'

const legacyEnglishLegalLinks = ['Privacy Policy', 'Terms of Use', 'Medical Disclaimer']

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function openingHours(info: ReturnType<typeof getBusinessInfo>) {
  return info.hours.filter(entry => /\d/.test(entry.hours))
}

describe('footer and CTA data parity', () => {
  it('uses live business hours and legal routes', () => {
    expect(businessHours).toEqual([
      ...weekdays.map(day => ({ day, opens: '09:00', closes: '17:00' })),
      { day: 'Saturday', opens: '09:00', closes: '13:00' },
      { day: 'Sunday', closed: true }
    ])
    expect(businessInfo.hours).toEqual(businessHoursDisplay)
    expect(businessInfo.bookingUrl).toBe(
      'https://api.leadconnectorhq.com/booking/pitonne/bp/english'
    )
    expect(getBusinessInfo('ja').bookingUrl).toBe(
      'https://api.leadconnectorhq.com/booking/pitonne/bp/japanese'
    )
    expect(canonicalRoutes.termsConditions).toBe('/legal/terms-conditions/')
  })
})

describe.each(locales)('footer (%s)', locale => {
  const dict = getDictionary(locale)
  const otherLocales = locales.filter(candidate => candidate !== locale)

  it("links Videos, Legal and all services with the locale's dictionary text and localized paths", () => {
    render(<Footer locale={locale} dict={dict} />)

    expect(screen.getByRole('link', { name: dict.nav.videos })).toHaveAttribute(
      'href',
      routeHref(localizedRoute(canonicalRoutes.videos, locale))
    )
    expect(screen.getByRole('link', { name: dict.nav.legal })).toHaveAttribute(
      'href',
      routeHref(localizedRoute(canonicalRoutes.legal, locale))
    )
    expect(screen.getByRole('link', { name: dict.nav.viewAllServices })).toHaveAttribute(
      'href',
      routeHref(localizedRoute(canonicalRoutes.services, locale))
    )

    for (const name of legacyEnglishLegalLinks) {
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument()
    }
    for (const other of otherLocales) {
      const otherNav = getDictionary(other).nav
      for (const name of [otherNav.videos, otherNav.legal, otherNav.viewAllServices]) {
        expect(screen.queryByRole('link', { name })).not.toBeInTheDocument()
      }
    }
  })

  it('shows the address, phone and opening hours for the locale', () => {
    const info = getBusinessInfo(locale)
    const { container } = render(<Footer locale={locale} dict={dict} />)
    const address = container.querySelector('address')

    expect(address).toHaveTextContent(info.addressLine1)
    expect(address).toHaveTextContent(info.addressLine2)
    expect(screen.getByRole('link', { name: info.phone })).toHaveAttribute(
      'href',
      `tel:${info.phone}`
    )
    for (const item of openingHours(info)) expect(screen.getByText(item.hours)).toBeInTheDocument()

    for (const other of otherLocales) {
      const otherInfo = getBusinessInfo(other)
      expect(container).not.toHaveTextContent(otherInfo.addressLine1)
      expect(container).not.toHaveTextContent(otherInfo.addressLine2)
      for (const item of openingHours(otherInfo))
        expect(container).not.toHaveTextContent(item.hours)
    }
  })
})
