import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RelatedPitonneServices } from '@/components/blog/related-pitonne-services'
import { localizedRoute } from '@/lib/data/routes'
import { getAllServiceSlugs, getService } from '@/lib/data/services'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defined } from '@/test/defined'
import { routeHref } from '@/test/route-href'

describe.each(locales)('the related services box in a post’s body (%s)', locale => {
  const named = getAllServiceSlugs(locale)
    .filter(slug => slug !== 'iv-therapy')
    .slice(0, 2)
    .reverse()

  it.each([
    [
      'the services an IV therapy post names, in its order, and nothing more',
      'iv-therapy',
      named,
      named
    ],
    ['IV Therapy for an IV therapy post that names no service', 'iv-therapy', [], ['iv-therapy']],
    ['nothing for a post in another category that names no service', 'medication', [], []]
  ])('lists %s', (_, categorySlug, relatedServiceSlugs, expected) => {
    const { container } = render(
      <RelatedPitonneServices
        post={{ slug: 'a-post', categorySlug, relatedServiceSlugs }}
        locale={locale}
      />
    )
    const heading = screen.queryByRole('heading', {
      name: getDictionary(locale).blog.relatedPitonneServices
    })

    expect(heading !== null).toBe(expected.length > 0)
    expect(
      within(container)
        .queryAllByRole('link')
        .map(link => [link.textContent, link.getAttribute('href')])
    ).toEqual(
      expected.map(slug => {
        const service = defined(getService(slug, locale))
        return [service.name, routeHref(localizedRoute(service.canonicalPath, locale))]
      })
    )
  })
})
