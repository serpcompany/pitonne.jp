import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from '@/components/not-found-page'
import { getAllCategories } from '@/lib/data/blog-posts'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { getServiceCategorySections } from '@/lib/data/services'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defined } from '@/test/defined'
import { routeHref } from '@/test/route-href'

function linksUnder(heading: string) {
  const title = screen.queryByRole('heading', { level: 2, name: heading })
  if (!title) return []
  return within(defined(title.parentElement))
    .getAllByRole('link')
    .map(link => [link.textContent, link.getAttribute('href')])
}

describe.each(locales)('not-found page (%s)', locale => {
  const dict = getDictionary(locale)

  it('says the page does not exist in one heading and one sentence', () => {
    const { container } = render(<NotFoundPage locale={locale} />)

    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(dict.notFound.heading)
    expect(screen.getByText(dict.notFound.message)).toBeInTheDocument()
  })

  it('links to the home page and every section index in this locale', () => {
    render(<NotFoundPage locale={locale} />)

    for (const [name, path] of [
      [dict.nav.home, canonicalRoutes.home],
      [dict.nav.services, canonicalRoutes.services],
      [dict.nav.blog, canonicalRoutes.blog],
      [dict.nav.areasServed, canonicalRoutes.areasServed],
      [dict.nav.videos, canonicalRoutes.videos],
      [dict.nav.faqs, canonicalRoutes.faqs]
    ]) {
      const href = routeHref(localizedRoute(path, locale))
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('links to every service category in the header menu and every blog category with posts', () => {
    render(<NotFoundPage locale={locale} />)
    const englishSections = getServiceCategorySections('en')

    expect(linksUnder(dict.nav.services)).toEqual(
      getServiceCategorySections(locale).map((section, index) => [
        section.title,
        routeHref(localizedRoute(englishSections[index].href, locale))
      ])
    )
    expect(linksUnder(dict.nav.blog)).toEqual(
      getAllCategories(locale).map(category => [
        category.name,
        routeHref(localizedRoute(`/blog/category/${category.slug}/`, locale))
      ])
    )
  })

  it('has no link to an HTML sitemap', () => {
    const { container } = render(<NotFoundPage locale={locale} />)
    const hrefs = [...container.querySelectorAll('a')].map(link => link.getAttribute('href'))

    expect(hrefs).not.toContainEqual(expect.stringContaining('sitemap'))
  })
})
