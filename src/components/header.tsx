'use client'

import { ChevronDown, Menu, Phone, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { HeaderText } from '@/components/header-text'
import { ContactButton } from '@/components/shared/contact-button'
import { LineIcon } from '@/components/shared/line-icon'
import {
  canonicalRoutes,
  getAreaNavigation,
  localizedRoute,
  type ServiceNavCategory
} from '@/lib/data/routes'
import { getBusinessInfo } from '@/lib/data/site'
import type { Locale } from '@/lib/i18n/config'
import { normalizePath } from '@/lib/seo'

function LanguageSwitcher({
  locale,
  labels,
  untranslatedPaths
}: {
  locale: Locale
  labels: HeaderText['languageSwitcher']
  untranslatedPaths: string[]
}) {
  const pathname = usePathname() ?? '/'
  const targetLocale: Locale = locale === 'en' ? 'ja' : 'en'
  const neutralPath = normalizePath(pathname.replace(/^\/ja(?=\/|$)/, '') || '/')
  const targetPath = localizedRoute(
    untranslatedPaths.includes(neutralPath) ? canonicalRoutes.blog : neutralPath,
    targetLocale
  )

  return (
    <Link
      href={targetPath}
      className="text-sm font-medium text-foreground hover:text-[#7A8F87] transition-colors"
    >
      {labels[targetLocale]}
    </Link>
  )
}

function MegaMenu({
  widthClassName,
  gridClassName,
  viewAllHref,
  viewAllLabel,
  children
}: {
  widthClassName: string
  gridClassName: string
  viewAllHref: string
  viewAllLabel: string
  children: React.ReactNode
}) {
  return (
    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 ${widthClassName}`}>
      <div className="bg-white rounded-lg shadow-xl border border-border p-6">
        <div className={`grid ${gridClassName}`}>{children}</div>
        <div className="mt-6 pt-4 border-t border-border">
          <Link href={viewAllHref} className="text-sm font-medium text-[#7A8F87] hover:underline">
            {viewAllLabel} &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Header({
  locale,
  text,
  serviceNavigation,
  untranslatedPaths = []
}: {
  locale: Locale
  text: HeaderText
  serviceNavigation: ServiceNavCategory[]
  untranslatedPaths?: string[]
}) {
  const servicesMenu = { categories: serviceNavigation }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null)

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileExpandedSection(null)
  }

  const areasMenu = {
    wards: getAreaNavigation(locale)
  }

  const aboutMenu = {
    items: [
      { name: text.nav.about, href: localizedRoute(canonicalRoutes.about, locale) },
      { name: text.nav.faqs, href: localizedRoute(canonicalRoutes.faqs, locale) }
    ]
  }

  const { phone, lineUrl } = getBusinessInfo(locale)
  const phoneLinks = [{ number: phone, href: `tel:${phone}` }]

  const navigation = [
    { name: text.nav.home, href: localizedRoute(canonicalRoutes.home, locale) },
    {
      name: text.nav.about,
      href: localizedRoute(canonicalRoutes.about, locale),
      hasDropdown: 'about'
    },
    {
      name: text.nav.services,
      href: localizedRoute(canonicalRoutes.services, locale),
      hasDropdown: 'services'
    },
    {
      name: text.nav.areasServed,
      href: localizedRoute(canonicalRoutes.areasServed, locale),
      hasDropdown: 'areas'
    },
    { name: text.nav.blog, href: localizedRoute(canonicalRoutes.blog, locale) },
    { name: text.nav.videos, href: localizedRoute(canonicalRoutes.videos, locale) }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 lg:px-8">
        <Link href={localizedRoute('/', locale)} className="flex items-center">
          <img
            src="/images/pitt-wordlogo-blk-32.svg"
            alt={text.common.logoAlt}
            className="h-8 w-auto"
          />
        </Link>

        <div className="hidden xl:flex items-center gap-8">
          {navigation.map(item => (
            <div
              key={item.name}
              role="none"
              className="relative"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.hasDropdown)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-[#7A8F87] transition-colors"
              >
                {item.name}
                {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
              </Link>

              {item.hasDropdown === 'about' && activeDropdown === 'about' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-48">
                  <div className="rounded-lg border border-border bg-white p-3 shadow-xl">
                    <ul className="space-y-1">
                      {aboutMenu.items.map(link => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-[#7A8F87]"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {item.hasDropdown === 'services' && activeDropdown === 'services' && (
                <MegaMenu
                  widthClassName="w-[760px]"
                  gridClassName="grid-cols-4 gap-6"
                  viewAllHref={localizedRoute('/services/', locale)}
                  viewAllLabel={text.nav.viewAllServices}
                >
                  {servicesMenu.categories.map(category => (
                    <div key={category.name}>
                      <Link
                        href={category.href}
                        className="text-sm font-semibold text-foreground hover:text-[#7A8F87] transition-colors"
                      >
                        {category.name}
                      </Link>
                      <ul className="mt-3 space-y-2">
                        {category.items.map(service => (
                          <li key={service.name}>
                            <Link
                              href={service.href}
                              className="text-sm text-muted-foreground hover:text-[#7A8F87] transition-colors"
                            >
                              {service.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </MegaMenu>
              )}

              {item.hasDropdown === 'areas' && activeDropdown === 'areas' && (
                <MegaMenu
                  widthClassName="w-[700px]"
                  gridClassName="grid-cols-5 gap-4"
                  viewAllHref={localizedRoute('/areas-served/', locale)}
                  viewAllLabel={text.nav.viewAllAreas}
                >
                  {areasMenu.wards.map(ward => (
                    <div key={ward.name}>
                      <Link
                        href={ward.href}
                        className="text-sm font-semibold text-foreground hover:text-[#7A8F87] transition-colors"
                      >
                        {ward.name}
                        <span className="block text-xs text-muted-foreground font-normal">
                          {ward.nameJa}
                        </span>
                      </Link>
                      <ul className="mt-3 space-y-1.5">
                        {ward.areas.map(area => (
                          <li key={area.name}>
                            <Link
                              href={area.href}
                              className="text-xs text-muted-foreground hover:text-[#7A8F87] transition-colors"
                            >
                              {area.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </MegaMenu>
              )}
            </div>
          ))}
        </div>

        <div className="hidden xl:flex items-center gap-6">
          <LanguageSwitcher
            locale={locale}
            labels={text.languageSwitcher}
            untranslatedPaths={untranslatedPaths}
          />
          <div
            role="none"
            className="relative"
            onMouseEnter={() => setActiveDropdown('phone')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-[#7A8F87] transition-colors"
            >
              <Phone className="h-4 w-4" />
              {text.nav.phone}
              <ChevronDown className="h-4 w-4" />
            </button>

            {activeDropdown === 'phone' && (
              <div className="absolute top-full right-0 pt-4 w-56">
                <div className="rounded-lg border border-border bg-white p-3 shadow-xl">
                  <ul className="space-y-1">
                    {phoneLinks.map(phoneLink => (
                      <li key={phoneLink.href}>
                        <a
                          href={phoneLink.href}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-[#7A8F87]"
                        >
                          {phoneLink.number}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          {lineUrl && (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={text.contact.lineContact}
              title={text.contact.lineContact}
              className="-m-1.5 shrink-0 rounded-md p-1.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755] focus-visible:ring-offset-2"
            >
              <LineIcon className="h-7 w-7" />
            </a>
          )}
          <ContactButton className="px-5 py-2.5" locale={locale}>
            {text.common.contactUs}
          </ContactButton>
        </div>

        <button
          type="button"
          className="xl:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">{text.common.toggleMenu}</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-white max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <div className="pb-3 mb-1 border-b border-border">
              <LanguageSwitcher
                locale={locale}
                labels={text.languageSwitcher}
                untranslatedPaths={untranslatedPaths}
              />
            </div>

            {navigation.map(item => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full py-2 text-base font-medium text-foreground"
                      onClick={() =>
                        setMobileExpandedSection(
                          mobileExpandedSection === item.hasDropdown
                            ? null
                            : (item.hasDropdown ?? null)
                        )
                      }
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          mobileExpandedSection === item.hasDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {item.hasDropdown === 'about' && mobileExpandedSection === 'about' && (
                      <div className="pl-4 pb-2 space-y-1">
                        {aboutMenu.items.map(link => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="block py-1 text-sm text-muted-foreground"
                            onClick={closeMobileMenu}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {item.hasDropdown === 'services' && mobileExpandedSection === 'services' && (
                      <div className="pl-4 pb-2 space-y-3">
                        {servicesMenu.categories.map(category => (
                          <div key={category.name}>
                            <Link
                              href={category.href}
                              className="block py-1 text-sm font-medium text-foreground"
                              onClick={closeMobileMenu}
                            >
                              {category.name}
                            </Link>
                            <div className="pl-3 space-y-1">
                              {category.items.map(service => (
                                <Link
                                  key={service.name}
                                  href={service.href}
                                  className="block py-1 text-sm text-muted-foreground"
                                  onClick={closeMobileMenu}
                                >
                                  {service.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.hasDropdown === 'areas' && mobileExpandedSection === 'areas' && (
                      <div className="pl-4 pb-2 space-y-3">
                        {areasMenu.wards.map(ward => (
                          <div key={ward.name}>
                            <Link
                              href={ward.href}
                              className="block py-1 text-sm font-medium text-foreground"
                              onClick={closeMobileMenu}
                            >
                              {ward.name}{' '}
                              <span className="text-muted-foreground font-normal">
                                {ward.nameJa}
                              </span>
                            </Link>
                            <div className="pl-3 space-y-1">
                              {ward.areas.map(area => (
                                <Link
                                  key={area.name}
                                  href={area.href}
                                  className="block py-1 text-sm text-muted-foreground"
                                  onClick={closeMobileMenu}
                                >
                                  {area.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium text-foreground"
                    onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="mb-3 space-y-2">
                {phoneLinks.map(phoneLink => (
                  <a
                    key={phoneLink.href}
                    href={phoneLink.href}
                    className="flex items-center gap-2 text-sm font-medium"
                    onClick={closeMobileMenu}
                  >
                    <Phone className="h-4 w-4" />
                    <span>{phoneLink.number}</span>
                  </a>
                ))}
                {lineUrl && (
                  <a
                    href={lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium"
                    onClick={closeMobileMenu}
                  >
                    <LineIcon className="h-4 w-4" />
                    <span>{text.contact.lineContact}</span>
                  </a>
                )}
              </div>
              <ContactButton
                className="w-full px-5 py-2.5"
                locale={locale}
                onClick={closeMobileMenu}
              >
                {text.common.contactUs}
              </ContactButton>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
