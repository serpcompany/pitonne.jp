import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WardPage from '@/app/[locale]/areas-served/[ward]/page'
import AreasServedPage from '@/app/[locale]/areas-served/page'
import { wards } from '@/lib/data/areas'
import { getAllBlogPosts } from '@/lib/data/blog-posts'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { getServiceCategorySections } from '@/lib/data/services'
import type { Ward } from '@/lib/data/wards/ward'
import { type Locale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defined } from '@/test/defined'
import { routeHref } from '@/test/route-href'

const wardCases = wards.map(ward => [ward.slug, ward] as const)

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

function sectionHeaded(name: string) {
  return defined(screen.getByRole('heading', { name }).closest('section'))
}

function linksIn(section: HTMLElement) {
  return within(section)
    .getAllByRole('link')
    .map(link => [link.textContent, link.getAttribute('href')] as const)
}

function subheadingsIn(section: HTMLElement) {
  return within(section)
    .getAllByRole('heading', { level: 3 })
    .map(heading => [heading.textContent, heading.nextElementSibling?.textContent] as const)
}

describe.each(locales)('areas served (%s)', locale => {
  const dict = getDictionary(locale)
  const contactHref = routeHref(localizedRoute(canonicalRoutes.contact, locale))

  it('names each area of each ward in English and in Japanese on the areas index', async () => {
    render(await AreasServedPage({ params: Promise.resolve({ locale }) }))

    for (const ward of wards) expectEachAreaNamedInBothLanguages(ward, locale)
  })

  it('offers visits at home, at a hotel and at an office, then a contact button for an area it doesn’t list', async () => {
    render(await AreasServedPage({ params: Promise.resolve({ locale }) }))

    expect(subheadingsIn(sectionHeaded(dict.areas.mobileWellnessServices))).toEqual([
      [dict.areas.homeVisits, dict.areas.homeVisitsDescription],
      [dict.areas.hotelService, dict.areas.hotelServiceDescription],
      [dict.areas.officeVisits, dict.areas.officeVisitsDescription]
    ])
    expect(linksIn(sectionHeaded(dict.areas.notSureArea))).toEqual([
      [dict.common.contactUs, contactHref]
    ])
  })

  it.each(
    wardCases
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

  it.each(
    wardCases
  )('shows %s’s description, every service, the steps to get started, the latest posts and a link back to all areas', async (_, ward) => {
    render(await WardPage({ params: Promise.resolve({ locale, ward: ward.slug }) }))
    const steps = sectionHeaded(dict.areas.howToGetStarted)

    expect(
      within(defined(screen.getByRole('heading', { level: 1 }).closest('section'))).getByText(
        locale === 'ja' ? ward.descriptionJa : ward.description
      )
    ).toBeInTheDocument()
    expect(linksIn(sectionHeaded(dict.areas.careAvailable))).toEqual(
      getServiceCategorySections(locale).flatMap(section => [
        [section.title, routeHref(section.href)],
        ...section.services.map(service => [
          service.name,
          routeHref(localizedRoute(service.canonicalPath, locale))
        ])
      ])
    )
    expect(subheadingsIn(steps).map(([step]) => step)).toEqual([
      dict.areas.sendRequest,
      dict.areas.clinicalReview,
      dict.areas.carePlanning
    ])
    expect(linksIn(steps)).toEqual([[dict.areas.contactPitonne, contactHref]])
    expect(linksIn(sectionHeaded(dict.blog.readOurLatestPosts)).map(([, href]) => href)).toEqual([
      ...getAllBlogPosts(locale)
        .slice(0, 3)
        .map(post => routeHref(localizedRoute(`/blog/${post.slug}/`, locale))),
      routeHref(localizedRoute(canonicalRoutes.blog, locale))
    ])
    expect(
      screen.getByRole('link', { name: name => name.endsWith(dict.areas.viewAllAreasServed) })
    ).toHaveAttribute('href', routeHref(localizedRoute(canonicalRoutes.areasServed, locale)))
  })
})
