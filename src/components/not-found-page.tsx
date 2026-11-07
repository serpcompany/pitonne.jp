import Link from 'next/link'
import { PageHero } from '@/components/shared/page-hero'
import { getAllCategories } from '@/lib/data/blog-posts'
import { canonicalRoutes, localizedRoute } from '@/lib/data/routes'
import { getServiceCategorySections } from '@/lib/data/services'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

type SiteLink = { name: string; href: string }

function CategoryLinks({ heading, links }: { heading: string; links: SiteLink[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <h2 className="mb-4 font-serif text-2xl text-foreground">{heading}</h2>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="text-[#7A8F87] hover:underline">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function NotFoundPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const sectionLinks: SiteLink[] = [
    { name: dict.nav.home, href: canonicalRoutes.home },
    { name: dict.nav.services, href: canonicalRoutes.services },
    { name: dict.nav.blog, href: canonicalRoutes.blog },
    { name: dict.nav.areasServed, href: canonicalRoutes.areasServed },
    { name: dict.nav.videos, href: canonicalRoutes.videos },
    { name: dict.nav.faqs, href: canonicalRoutes.faqs }
  ].map(link => ({ ...link, href: localizedRoute(link.href, locale) }))
  const serviceCategories = getServiceCategorySections(locale).map(section => ({
    name: section.title,
    href: section.href
  }))
  const blogCategories = getAllCategories(locale).map(category => ({
    name: category.name,
    href: localizedRoute(`/blog/category/${category.slug}/`, locale)
  }))

  return (
    <>
      <PageHero
        locale={locale}
        title={dict.notFound.heading}
        description={dict.notFound.message}
        actions={sectionLinks.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              index === 0
                ? 'px-4 py-1.5 text-sm rounded-full bg-[#7A8F87] text-white'
                : 'px-4 py-1.5 text-sm rounded-full border border-border hover:border-[#7A8F87] hover:text-[#7A8F87] transition-colors'
            }
          >
            {link.name}
          </Link>
        ))}
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <CategoryLinks heading={dict.nav.services} links={serviceCategories} />
            {blogCategories.length > 0 && (
              <CategoryLinks heading={dict.nav.blog} links={blogCategories} />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
