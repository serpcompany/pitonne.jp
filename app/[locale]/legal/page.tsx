import type { Metadata } from "next"
import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
import { ContactButton } from "@/components/shared/contact-button"
import { localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const dict = getDictionary(locale as Locale)

  return {
    title: dict.legal.legal,
    description: dict.legal.metaDescription,
    alternates: localizedHreflangAlternates("/legal/", locale as Locale),
    openGraph: {
      title: dict.legal.legal,
      description: dict.legal.metaDescription,
      url: localizedHreflangAlternates("/legal/", locale as Locale).canonical,
    },
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LegalPage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  const legalPages = [
    {
      title: dict.legal.privacyPolicy,
      href: "/legal/privacy-policy",
      description: dict.legal.privacyPolicyDescription,
    },
    {
      title: dict.legal.termsOfUse,
      href: "/legal/terms-conditions/",
      description: dict.legal.termsDescription,
    },
    {
      title: dict.legal.medicalDisclaimer,
      href: "/legal/disclaimer",
      description: dict.legal.disclaimerDescription,
    },
  ]

  return (
    <div className="bg-[#faf9f7]">
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale as Locale) },
          { label: dict.nav.legal },
        ]}
        title={dict.legal.legalInformation}
        description={dict.legal.legalDescription}
      />

      {/* Legal Pages Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            {legalPages.map((page) => (
              <Link
                key={page.href}
                href={localizedRoute(page.href, locale as Locale)}
                className="bg-white p-8 rounded-lg border border-[#e5e5e5] hover:shadow-md hover:border-[#7A8F87] transition-all group"
              >
                <h2 className="font-serif text-xl text-[#1a1a1a] mb-3 group-hover:text-[#7A8F87] transition-colors">
                  {page.title}
                </h2>
                <p className="text-[#666] text-sm mb-4">
                  {page.description}
                </p>
                <span className="text-[#7A8F87] text-sm">
                  {dict.common.readMore} &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-2xl text-[#1a1a1a] mb-4">
            {dict.legal.questionsAboutPolicies}
          </h2>
          <p className="text-[#666] mb-6">
            {dict.legal.questionsDescription}
          </p>
          <ContactButton locale={locale as Locale} />
        </div>
      </section>
    </div>
  )
}
