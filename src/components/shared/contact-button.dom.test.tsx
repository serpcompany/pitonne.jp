import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContactButton } from '@/components/shared/contact-button'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { routeHref } from '@/test/route-href'

describe('contact button', () => {
  it.each(locales)('opens the contact page in the page’s language (%s)', locale => {
    render(<ContactButton locale={locale}>{getDictionary(locale).common.contactUs}</ContactButton>)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      routeHref(localizedRoute(canonicalRoutes.contact, locale))
    )
  })
})
