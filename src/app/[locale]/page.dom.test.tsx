import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from '@/app/[locale]/page'
import { getAllBlogPosts } from '@/lib/data/blog-posts'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { getBusinessInfo } from '@/lib/data/site'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { routeHref } from '@/test/route-href'

const dict = getDictionary('en')
const businessInfo = getBusinessInfo('en')

describe('home page', () => {
  it('uses an accessible green CTA style and opens the hero booking link in a new tab', async () => {
    render(await HomePage({ params: Promise.resolve({ locale: 'en' }) }))

    const cta = screen.getByRole('link', { name: dict.common.bookConsultation })
    expect(cta).toHaveAttribute('href', businessInfo.bookingUrl)
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
    expect(cta).toHaveClass('bg-[#7A8F87]', 'hover:bg-[#245f5a]')
  })

  it('keeps the supporting homepage image out of the mobile LCP path', async () => {
    render(await HomePage({ params: Promise.resolve({ locale: 'en' }) }))

    const cta = screen.getByRole('link', { name: dict.common.bookConsultation })
    expect(cta.closest('section')).toHaveClass('min-h-[calc(100svh-73px)]')

    const lcpImage = screen.getByAltText('Tokyo Tower view near Pitonne in Nishi Azabu')
    expect(lcpImage).not.toHaveAttribute('fetchpriority', 'high')
  })

  it.each(
    locales
  )('opens the four service categories, the three newest posts and the blog (%s)', async locale => {
    const { container } = render(await HomePage({ params: Promise.resolve({ locale }) }))
    const hrefs = Array.from(container.querySelectorAll('a'), link => link.getAttribute('href'))
    const routes = [
      canonicalRoutes.ivTherapy,
      canonicalRoutes.stemCellTherapy,
      canonicalRoutes.medication,
      canonicalRoutes.bloodTests,
      ...getAllBlogPosts(locale)
        .slice(0, 3)
        .map(post => `/blog/${post.slug}/`),
      canonicalRoutes.blog
    ]
    for (const route of routes)
      expect(hrefs).toContainEqual(routeHref(localizedRoute(route, locale)))
  })

  it('adds the section on why to choose Pitonne on the Japanese home page only', async () => {
    for (const locale of locales) {
      render(await HomePage({ params: Promise.resolve({ locale }) }))
      const why = screen.queryByRole('heading', {
        level: 2,
        name: getDictionary(locale).home.whyChooseTitle
      })
      expect(Boolean(why), locale).toBe(locale === 'ja')
      cleanup()
    }
  })
})
