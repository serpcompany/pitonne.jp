import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Header } from '@/components/header'
import { wards } from '@/lib/data/areas'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { getServiceCategorySections } from '@/lib/data/services'
import { getBusinessInfo } from '@/lib/data/site'
import { type Locale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import {
  fixture,
  removeContentFixture,
  withContent,
  writeContentFixture
} from '@/test/content-fixture'
import { defined } from '@/test/defined'
import { routeHref } from '@/test/route-href'
import { type HeaderProps, siteHeader } from '@/test/site-header'

const pathname = vi.hoisted(() => ({ current: '/' }))
vi.mock('next/navigation', async original => ({
  ...(await original<typeof import('next/navigation')>()),
  usePathname: () => pathname.current
}))

const retiredPhoneGroups = ['786', '814', '0323']
const retiredPhoneHref = `tel:+1${retiredPhoneGroups.join('')}`
const retiredPhoneText = `+1 ${retiredPhoneGroups.join(' ')}`

async function renderHeader(locale: Locale, languageSwitcherPath?: string) {
  return render(await siteHeader(locale, languageSwitcherPath))
}

function phoneLinks(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]'))
}

const hrefsIn = (element: HTMLElement) =>
  within(element)
    .getAllByRole('link')
    .map(link => link.getAttribute('href'))

afterEach(() => {
  pathname.current = '/'
})

describe.each(locales)('header navigation (%s)', locale => {
  const dict = getDictionary(locale)
  const { phone } = getBusinessInfo(locale)
  const faqsHref = localizedRoute(canonicalRoutes.faqs, locale)

  it('keeps FAQs out of the primary navigation and reveals it only in the desktop About dropdown', async () => {
    await renderHeader(locale)

    expect(screen.queryByRole('link', { name: dict.nav.faqs })).not.toBeInTheDocument()

    for (const name of [dict.nav.services, dict.nav.areasServed]) {
      const item = screen.getByRole('link', { name })
      fireEvent.mouseEnter(item)
      expect(screen.queryByRole('link', { name: dict.nav.faqs })).not.toBeInTheDocument()
      fireEvent.mouseLeave(item)
    }

    const about = screen.getByRole('link', { name: dict.nav.about })
    fireEvent.mouseEnter(about)
    expect(screen.getByRole('link', { name: dict.nav.faqs })).toHaveAttribute(
      'href',
      routeHref(faqsHref)
    )

    fireEvent.mouseLeave(about)
    expect(screen.queryByRole('link', { name: dict.nav.faqs })).not.toBeInTheDocument()
  })

  it('keeps FAQs out of the mobile menu until the About section is expanded', async () => {
    await renderHeader(locale)

    fireEvent.click(screen.getByRole('button', { name: dict.common.toggleMenu }))
    expect(screen.queryByRole('link', { name: dict.nav.faqs })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: dict.nav.services }))
    expect(screen.queryByRole('link', { name: dict.nav.faqs })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: dict.nav.about }))
    expect(screen.getByRole('link', { name: dict.nav.faqs })).toHaveAttribute(
      'href',
      routeHref(faqsHref)
    )
  })

  it('links Videos from the primary navigation and the mobile menu', async () => {
    const videosHref = localizedRoute(canonicalRoutes.videos, locale)
    await renderHeader(locale)

    expect(screen.getByRole('link', { name: dict.nav.videos })).toHaveAttribute(
      'href',
      routeHref(videosHref)
    )

    fireEvent.click(screen.getByRole('button', { name: dict.common.toggleMenu }))
    const videosLinks = screen.getAllByRole('link', { name: dict.nav.videos })
    expect(videosLinks).toHaveLength(2)
    for (const link of videosLinks) expect(link).toHaveAttribute('href', routeHref(videosHref))
  })

  it('lists each service category with its services, and each ward with its areas, in its desktop menus', async () => {
    const { container } = await renderHeader(locale)
    const nav = defined(container.querySelector('nav'))

    fireEvent.mouseEnter(screen.getByRole('link', { name: dict.nav.services }))
    const serviceHrefs = getServiceCategorySections(locale).flatMap(section => [
      section.href,
      ...section.services.map(service => localizedRoute(service.canonicalPath, locale))
    ])
    for (const href of [...serviceHrefs, localizedRoute(canonicalRoutes.services, locale)]) {
      expect(hrefsIn(nav)).toContainEqual(routeHref(href))
    }
    fireEvent.mouseLeave(screen.getByRole('link', { name: dict.nav.services }))

    fireEvent.mouseEnter(screen.getByRole('link', { name: dict.nav.areasServed }))
    const areaHrefs = wards.flatMap(ward => [
      `/areas-served/${ward.slug}/`,
      ...ward.areas.map(area => `/areas-served/${ward.slug}/${area.slug}/`)
    ])
    for (const href of areaHrefs) {
      expect(hrefsIn(nav)).toContainEqual(routeHref(localizedRoute(href, locale)))
    }
  })

  it.each([
    [
      'desktop menu',
      () => fireEvent.mouseEnter(screen.getByRole('link', { name: dict.nav.areasServed }))
    ],
    [
      'mobile menu',
      () => {
        fireEvent.click(screen.getByRole('button', { name: dict.common.toggleMenu }))
        fireEvent.click(screen.getByRole('button', { name: dict.nav.areasServed }))
      }
    ]
  ])('names each ward and area in the Areas Served %s in this language', async (_, open) => {
    const [shown, other] =
      locale === 'ja' ? (['nameJa', 'name'] as const) : (['name', 'nameJa'] as const)
    const { container } = await renderHeader(locale)
    open()

    const links = Array.from(container.querySelectorAll('a')).map(link => [
      link.getAttribute('href'),
      link.firstChild?.textContent,
      link.querySelector('span')?.textContent ?? null
    ])
    for (const ward of wards) {
      expect(links).toContainEqual([
        routeHref(localizedRoute(`/areas-served/${ward.slug}/`, locale)),
        ward[shown],
        ward[other]
      ])
      for (const area of ward.areas) {
        expect(links).toContainEqual([
          routeHref(localizedRoute(`/areas-served/${ward.slug}/${area.slug}/`, locale)),
          area[shown],
          null
        ])
        expect(container).not.toHaveTextContent(area[other])
      }
    }
  })

  it('offers only the Japan number in the phone menu and the mobile menu', async () => {
    const { container } = await renderHeader(locale)

    expect(phoneLinks(container)).toEqual([])

    fireEvent.mouseEnter(screen.getByRole('button', { name: dict.nav.phone }))
    expect(
      phoneLinks(container).map(link => [link.getAttribute('href'), link.textContent])
    ).toEqual([[`tel:${phone}`, phone]])

    fireEvent.click(screen.getByRole('button', { name: dict.common.toggleMenu }))
    const allPhoneLinks = phoneLinks(container)
    expect(allPhoneLinks).toHaveLength(2)
    for (const link of allPhoneLinks) {
      expect(link).toHaveAttribute('href', `tel:${phone}`)
      expect(link).toHaveTextContent(phone)
    }

    expect(container.querySelector(`a[href="${retiredPhoneHref}"]`)).not.toBeInTheDocument()
    expect(container).not.toHaveTextContent(retiredPhoneText)
  })

  it('offers the clinic’s LINE account in a new tab on Japanese pages only, beside the phone and in the phone menu', async () => {
    const { container } = await renderHeader(locale)
    const lineLinks = () => Array.from(container.querySelectorAll('a[href^="https://line.me/"]'))
    const expected = locale === 'ja' ? 1 : 0

    expect(lineLinks()).toHaveLength(expected)
    fireEvent.click(screen.getByRole('button', { name: dict.common.toggleMenu }))
    expect(lineLinks()).toHaveLength(expected * 2)
    for (const link of lineLinks()) {
      expect(link).toHaveAttribute('href', getBusinessInfo(locale).lineUrl)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('links the logo to the home page in this language', async () => {
    await renderHeader(locale)

    expect(screen.getByRole('link', { name: dict.common.logoAlt })).toHaveAttribute(
      'href',
      routeHref(localizedRoute(canonicalRoutes.home, locale))
    )
  })

  it('shows the section links, then the language switcher, the Phone dropdown, LINE where offered and Contact Us', async () => {
    const { container } = await renderHeader(locale)
    const other = locales.find(candidate => candidate !== locale) ?? locale
    const sections = [
      dict.nav.home,
      dict.nav.about,
      dict.nav.services,
      dict.nav.areasServed,
      dict.nav.blog,
      dict.nav.videos
    ]
    const row = [
      ...sections.map(name => screen.getByRole('link', { name })),
      screen.getByRole('link', { name: dict.languageSwitcher[other] }),
      screen.getByRole('button', { name: dict.nav.phone }),
      ...screen.queryAllByRole('link', { name: dict.contact.lineContact }),
      screen.getByRole('link', { name: dict.common.contactUs })
    ]
    const label = (control: Element) => control.getAttribute('aria-label') ?? control.textContent

    expect(
      Array.from(container.querySelectorAll('a, button'))
        .filter(control => row.includes(control as HTMLElement))
        .map(label)
    ).toEqual(row.map(label))
  })

  it('opens the contact page in this language from Contact Us', async () => {
    await renderHeader(locale)

    expect(screen.getByRole('link', { name: dict.common.contactUs })).toHaveAttribute(
      'href',
      routeHref(localizedRoute(canonicalRoutes.contact, locale))
    )
  })

  it('points the language switcher at a given path in the other language', async () => {
    const other = locales.find(candidate => candidate !== locale) ?? locale
    await renderHeader(locale, canonicalRoutes.faqs)

    expect(screen.getByRole('link', { name: dict.languageSwitcher[other] })).toHaveAttribute(
      'href',
      routeHref(localizedRoute(canonicalRoutes.faqs, other))
    )
  })

  it('labels the menu toggle with the dictionary text for the locale', async () => {
    await renderHeader(locale)

    expect(screen.getByRole('button', { name: dict.common.toggleMenu })).toBeInTheDocument()
    for (const other of locales.filter(candidate => candidate !== locale)) {
      expect(getDictionary(other).common.toggleMenu).not.toBe(dict.common.toggleMenu)
      expect(
        screen.queryByRole('button', { name: getDictionary(other).common.toggleMenu })
      ).not.toBeInTheDocument()
    }
  })
})

describe('the language switcher with posts in one language added to a copy of the content', () => {
  const contentRoot = writeContentFixture()
  let headerProps: Record<Locale, HeaderProps>
  beforeAll(async () => {
    headerProps = await withContent(contentRoot, async () => {
      const layout = await import('@/test/site-header')
      return {
        en: (await layout.siteHeader('en')).props,
        ja: (await layout.siteHeader('ja')).props
      }
    })
  }, 600_000)
  afterAll(() => removeContentFixture(contentRoot))

  it.each([
    ['en', `/blog/${fixture.englishOnly}/`, '/ja/blog/'],
    ['en', `/blog/category/${fixture.englishOnlyCategory}/`, '/ja/blog/'],
    ['ja', `/ja/blog/${fixture.japaneseOnly}/`, '/blog/'],
    ['en', '/blog/', '/ja/blog/'],
    ['en', '/services/', '/ja/services/']
  ] as const)('on a %s page at %s, links the other language at %s', (locale, path, target) => {
    pathname.current = path
    render(<Header {...headerProps[locale]} />)
    const other = locale === 'en' ? 'ja' : 'en'

    expect(
      screen.getByRole('link', { name: getDictionary(locale).languageSwitcher[other] })
    ).toHaveAttribute('href', routeHref(target))
  })
})
