"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Phone, Menu, X, ChevronDown } from "lucide-react"
import { canonicalRoutes, localizedRoute, getAreaNavigation, type ServiceNavCategory } from "@/lib/data/routes"
import { businessInfo } from "@/lib/data/site"
import { ContactButton } from "@/components/shared/contact-button"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries"

function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const targetPath = locale === "en"
    ? `/ja${pathname}`
    : pathname.replace(/^\/ja/, "") || "/"

  return (
    <Link
      href={targetPath}
      className="text-sm font-medium text-foreground hover:text-[#7A8F87] transition-colors"
    >
      {locale === "en" ? "\u65E5\u672C\u8A9E" : "English"}
    </Link>
  )
}

export function Header({
  locale,
  dict,
  serviceNavigation,
}: {
  locale: Locale
  dict: Dictionary
  serviceNavigation: ServiceNavCategory[]
}) {
  const servicesMenu = { categories: serviceNavigation }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null)

  const areasMenu = {
    wards: getAreaNavigation(locale),
  }

  const aboutMenu = {
    items: [
      { name: dict.nav.about, href: localizedRoute(canonicalRoutes.about, locale) },
      { name: dict.nav.faqs, href: localizedRoute(canonicalRoutes.faqs, locale) },
    ],
  }

  const phoneLinks = [
    { label: "Japan", number: businessInfo.phone, href: "tel:070-2194-0199" },
    { label: "U.S.", number: "+1 786 814 0323", href: "tel:+17868140323" },
  ]

  const navigation = [
    { name: dict.nav.home, href: localizedRoute(canonicalRoutes.home, locale) },
    { name: dict.nav.about, href: localizedRoute(canonicalRoutes.about, locale), hasDropdown: "about" },
    { name: dict.nav.services, href: localizedRoute(canonicalRoutes.services, locale), hasDropdown: "services" },
    { name: dict.nav.areasServed, href: localizedRoute(canonicalRoutes.areasServed, locale), hasDropdown: "areas" },
    { name: dict.nav.blog, href: localizedRoute(canonicalRoutes.blog, locale) },
    { name: dict.nav.videos, href: localizedRoute(canonicalRoutes.videos, locale) },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 lg:px-8">
{/* Logo */}
  <Link href={localizedRoute("/", locale)} className="flex items-center">
    <img
      src="/images/pitt-wordlogo-blk-32.svg"
      alt="Pitonne Stem Cell & IV Therapy"
      className="h-8 w-auto"
    />
  </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navigation.map((item) => (
            <div
              key={item.name}
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

              {/* About Menu */}
              {item.hasDropdown === "about" && activeDropdown === "about" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-48">
                  <div className="rounded-lg border border-border bg-white p-3 shadow-xl">
                    <ul className="space-y-1">
                      {aboutMenu.items.map((link) => (
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

              {/* Services Mega Menu */}
              {item.hasDropdown === "services" && activeDropdown === "services" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[760px]">
                  <div className="bg-white rounded-lg shadow-xl border border-border p-6">
                  <div className="grid grid-cols-4 gap-6">
                    {servicesMenu.categories.map((category) => (
                      <div key={category.name}>
                        <Link
                          href={category.href}
                          className="text-sm font-semibold text-foreground hover:text-[#7A8F87] transition-colors"
                        >
                          {category.name}
                        </Link>
                        <ul className="mt-3 space-y-2">
                          {category.items.map((service) => (
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
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                      <Link
                        href={localizedRoute("/services/", locale)}
                        className="text-sm font-medium text-[#7A8F87] hover:underline"
                      >
                        {dict.nav.viewAllServices} &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Areas Mega Menu */}
              {item.hasDropdown === "areas" && activeDropdown === "areas" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[700px]">
                  <div className="bg-white rounded-lg shadow-xl border border-border p-6">
                  <div className="grid grid-cols-5 gap-4">
                    {areasMenu.wards.map((ward) => (
                      <div key={ward.name}>
                        <Link
                          href={ward.href}
                          className="text-sm font-semibold text-foreground hover:text-[#7A8F87] transition-colors"
                        >
                          {ward.name}
                          <span className="block text-xs text-muted-foreground font-normal">{ward.nameJa}</span>
                        </Link>
                        <ul className="mt-3 space-y-1.5">
                          {ward.areas.map((area) => (
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
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                      <Link
                        href={localizedRoute("/areas-served/", locale)}
                        className="text-sm font-medium text-[#7A8F87] hover:underline"
                      >
                        {dict.nav.viewAllAreas} &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Language Switcher & Phone & CTA */}
        <div className="hidden lg:flex items-center gap-6">
          <LanguageSwitcher locale={locale} />
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("phone")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-[#7A8F87] transition-colors"
            >
              <Phone className="h-4 w-4" />
              {dict.nav.phone}
              <ChevronDown className="h-4 w-4" />
            </button>

            {activeDropdown === "phone" && (
              <div className="absolute top-full right-0 pt-4 w-56">
                <div className="rounded-lg border border-border bg-white p-3 shadow-xl">
                  <ul className="space-y-1">
                    {phoneLinks.map((phone) => (
                      <li key={phone.label}>
                        <a
                          href={phone.href}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-[#7A8F87]"
                        >
                          <span className="font-medium text-foreground">{phone.label}</span>
                          <span className="block">{phone.number}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <ContactButton className="px-5 py-2.5" locale={locale}>
            {dict.common.contactUs}
          </ContactButton>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {/* Language Switcher - Mobile */}
            <div className="pb-3 mb-1 border-b border-border">
              <LanguageSwitcher locale={locale} />
            </div>

            {navigation.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      className="flex items-center justify-between w-full py-2 text-base font-medium text-foreground"
                      onClick={() => setMobileExpandedSection(
                        mobileExpandedSection === item.hasDropdown ? null : item.hasDropdown!
                      )}
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          mobileExpandedSection === item.hasDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Mobile About Dropdown */}
                    {item.hasDropdown === "about" && mobileExpandedSection === "about" && (
                      <div className="pl-4 pb-2 space-y-1">
                        {aboutMenu.items.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="block py-1 text-sm text-muted-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Mobile Services Dropdown */}
                    {item.hasDropdown === "services" && mobileExpandedSection === "services" && (
                      <div className="pl-4 pb-2 space-y-3">
                        {servicesMenu.categories.map((category) => (
                          <div key={category.name}>
                            <Link
                              href={category.href}
                              className="block py-1 text-sm font-medium text-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                            <div className="pl-3 space-y-1">
                              {category.items.map((service) => (
                                <Link
                                  key={service.name}
                                  href={service.href}
                                  className="block py-1 text-sm text-muted-foreground"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {service.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mobile Areas Dropdown */}
                    {item.hasDropdown === "areas" && mobileExpandedSection === "areas" && (
                      <div className="pl-4 pb-2 space-y-3">
                        {areasMenu.wards.map((ward) => (
                          <div key={ward.name}>
                            <Link
                              href={ward.href}
                              className="block py-1 text-sm font-medium text-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {ward.name} <span className="text-muted-foreground font-normal">{ward.nameJa}</span>
                            </Link>
                            <div className="pl-3 space-y-1">
                              {ward.areas.map((area) => (
                                <Link
                                  key={area.name}
                                  href={area.href}
                                  className="block py-1 text-sm text-muted-foreground"
                                  onClick={() => setMobileMenuOpen(false)}
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
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="mb-3 space-y-2">
                {phoneLinks.map((phone) => (
                  <a key={phone.label} href={phone.href} className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    <span>{phone.label}: {phone.number}</span>
                  </a>
                ))}
              </div>
              <ContactButton className="w-full px-5 py-2.5" locale={locale}>
                {dict.common.contactUs}
              </ContactButton>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
