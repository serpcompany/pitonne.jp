import Link from "next/link"
import type { Metadata } from "next"
import { MapPin } from "lucide-react"
import { PageHero } from "@/components/shared/page-hero"
import { ContactButton } from "@/components/shared/contact-button"
import { wards } from "@/lib/data/areas"
import { localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
import { localizedRoute } from "@/lib/data/routes"
import { getDictionary } from "@/lib/i18n/dictionaries"

export const dynamicParams = false

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return nonDefaultLocales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return {
    title: dict.areas.metaTitle,
    description: dict.areas.metaDescription,
    alternates: localizedHreflangAlternates("/areas-served/", locale as Locale),
    openGraph: {
      title: dict.areas.metaTitle,
      description: dict.areas.metaDescription,
      url: localizedCanonicalUrl("/areas-served/", locale as Locale),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  }
}

export default async function AreasServedPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = locale as Locale
  const dict = getDictionary(typedLocale)

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", typedLocale) },
          { label: dict.nav.areasServed },
        ]}
        title={dict.areas.heroTitle}
        description={dict.areas.heroDescription}
      />

      {/* Wards Grid */}
      <section className="py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {wards.map((ward) => (
              <div key={ward.slug}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-serif text-foreground">{typedLocale === "ja" ? ward.nameJa : `${ward.name} ${dict.areas.ward}`}</h2>
                    {typedLocale !== "ja" && <p className="text-sm text-muted-foreground">{ward.nameJa}</p>}
                  </div>
                  <Link
                    href={localizedRoute(`/areas-served/${ward.slug}/`, typedLocale)}
                    className="text-sm text-[#7A8F87] hover:underline"
                  >
                    {dict.areas.viewAllIn} {typedLocale === "ja" ? ward.nameJa : ward.name} &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ward.areas.map((area) => (
                    <Link
                      key={area.slug}
                      href={localizedRoute(`/areas-served/${ward.slug}/${area.slug}/`, typedLocale)}
                      className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-[#f5ebe0] hover:border-[#7A8F87] transition-all"
                    >
                      <MapPin className="h-5 w-5 text-[#7A8F87] shrink-0" />
                      <div>
                        <p className="font-medium text-foreground group-hover:text-[#7A8F87] transition-colors">{area.name}</p>
                        <p className="text-sm text-muted-foreground">{area.nameJa}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Info */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif text-foreground mb-6">{dict.areas.mobileWellnessServices}</h2>
            <p className="text-muted-foreground mb-8">
              {dict.areas.mobileWellnessDescription}
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{dict.areas.homeVisits}</h3>
                <p className="text-sm text-muted-foreground">
                  {dict.areas.homeVisitsDescription}
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{dict.areas.hotelService}</h3>
                <p className="text-sm text-muted-foreground">
                  {dict.areas.hotelServiceDescription}
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{dict.areas.officeVisits}</h3>
                <p className="text-sm text-muted-foreground">
                  {dict.areas.officeVisitsDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
            {dict.areas.notSureArea}
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            {dict.areas.notSureAreaDescription}
          </p>
          <ContactButton locale={typedLocale} />
        </div>
      </section>
    </>
  )
}
