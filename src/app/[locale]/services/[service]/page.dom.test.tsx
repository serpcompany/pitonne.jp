import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ServicePage from '@/app/[locale]/services/[service]/page'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { getAllServiceSlugs, getService, type Service } from '@/lib/data/services'
import { type Locale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defined } from '@/test/defined'

const servicePages = locales.flatMap(locale =>
  getAllServiceSlugs(locale).map(slug => [slug, locale] as const)
)

function withoutTrailingSlash(href: string | null) {
  return href === '/' ? href : (href?.replace(/\/$/, '') ?? null)
}

function expectedBreadcrumbLinks(service: Service, locale: Locale) {
  const dict = getDictionary(locale)
  const parent = service.parentSlug ? getService(service.parentSlug, locale) : undefined
  return [
    [dict.nav.home, canonicalRoutes.home],
    [dict.nav.services, canonicalRoutes.services],
    ...(parent ? [[parent.name, parent.canonicalPath]] : [])
  ].map(([label, href]) => [label, withoutTrailingSlash(localizedRoute(href, locale))])
}

describe('service page hero', () => {
  it.each(
    servicePages
  )('is a plain hero with breadcrumbs back to Services on %s (%s)', async (slug, locale) => {
    const service = defined(getService(slug, locale))
    const { container } = render(
      await ServicePage({ params: Promise.resolve({ locale, service: slug }) })
    )
    const hero = defined(container.querySelector('h1')?.closest('section'))
    const breadcrumb = within(defined(hero.querySelector('nav')))
    const media = Array.from(hero.querySelectorAll('img, picture, video'))

    expect(
      breadcrumb
        .getAllByRole('link')
        .map(link => [link.textContent, withoutTrailingSlash(link.getAttribute('href'))])
    ).toEqual(expectedBreadcrumbLinks(service, locale))
    expect(breadcrumb.getByText(service.name)).toHaveAttribute('aria-current', 'page')

    expect(hero).not.toHaveAttribute('style')
    expect(hero.querySelectorAll('[style*="background"], [class*="bg-[url"]')).toHaveLength(0)
    expect(hero.querySelectorAll('.absolute.inset-0')).toHaveLength(0)
    for (const image of media) expect(image.closest('.absolute')).toBeNull()
    if (service.kind === 'leaf') expect(media).toHaveLength(0)
  })
})
