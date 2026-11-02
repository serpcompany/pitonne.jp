import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WardPage from '@/app/[locale]/areas-served/[ward]/page'
import AreasServedPage from '@/app/[locale]/areas-served/page'
import { wards } from '@/lib/data/areas'
import { localizedRoute } from '@/lib/data/routes'
import type { Ward } from '@/lib/data/wards/ward'
import { type Locale, locales } from '@/lib/i18n/config'
import { defined } from '@/test/defined'

function expectEachAreaNamedInBothLanguages(ward: Ward, locale: Locale) {
  for (const area of ward.areas) {
    const href = localizedRoute(`/areas-served/${ward.slug}/${area.slug}/`, locale)
    const card = defined(
      screen
        .getAllByRole('link')
        .find(link => link.getAttribute('href')?.replace(/\/?$/, '/') === href)
    )
    expect(card).toHaveTextContent(area.name)
    expect(card).toHaveTextContent(area.nameJa)
  }
}

describe.each(locales)('areas served (%s)', locale => {
  it('names each area of each ward in English and in Japanese on the areas index', async () => {
    render(await AreasServedPage({ params: Promise.resolve({ locale }) }))

    for (const ward of wards) expectEachAreaNamedInBothLanguages(ward, locale)
  })

  it.each(
    wards.map(ward => [ward.slug, ward] as const)
  )('shows %s with a Google map of the ward and each area named in both languages', async (_, ward) => {
    const { container } = render(
      await WardPage({ params: Promise.resolve({ locale, ward: ward.slug }) })
    )
    const query = encodeURIComponent(`${ward.name}, Tokyo, Japan`)

    expect(
      Array.from(container.querySelectorAll('iframe'), frame => frame.getAttribute('src'))
    ).toContain(`https://www.google.com/maps?q=${query}&output=embed`)
    expectEachAreaNamedInBothLanguages(ward, locale)
  })
})
