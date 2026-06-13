import Link from "next/link"
import type { Metadata } from "next"
import { MapPin } from "lucide-react"
import { PageHero } from "@/components/shared/page-hero"
import { ContactButton } from "@/components/shared/contact-button"
import { wards } from "@/lib/data/areas"
import { localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { localizedRoute } from "@/lib/data/routes"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: "IV Therapy, Stem Cells, Medications & Blood Tests | Areas Served in Tokyo",
    description: "IV therapy, stem cell treatments, medications, and blood testing throughout central Tokyo. Mobile and in-clinic wellness care in Roppongi, Azabu, Shibuya, Ginza, and more from Pitonne.",
    alternates: localizedHreflangAlternates("/areas-served/", locale as Locale),
    openGraph: {
      title: "IV Therapy, Stem Cells, Medications & Blood Tests | Areas Served in Tokyo",
      description: "IV therapy, stem cell treatments, medications, and blood testing throughout central Tokyo. Mobile and in-clinic wellness care in Roppongi, Azabu, Shibuya, Ginza, and more from Pitonne.",
      url: localizedCanonicalUrl("/areas-served/", locale as Locale),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  }
}

export default async function AreasServedPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = locale as Locale

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: localizedRoute("/", typedLocale) },
          { label: "Areas Served" },
        ]}
        title="IV Therapy, Stem Cells, Medications & Blood Testing — Areas Served in Tokyo"
        description="Pitonne provides IV therapy, stem cell treatments, medications, and blood testing throughout central Tokyo. Our team travels to your home or hotel for private, concierge wellness care."
      />

      {/* Wards Grid */}
      <section className="py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {wards.map((ward) => (
              <div key={ward.slug}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-serif text-foreground">{ward.name} Ward</h2>
                    <p className="text-sm text-muted-foreground">{ward.nameJa}</p>
                  </div>
                  <Link
                    href={localizedRoute(`/areas-served/${ward.slug}/`, typedLocale)}
                    className="text-sm text-[#7A8F87] hover:underline"
                  >
                    View all in {ward.name} &rarr;
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
            <h2 className="text-3xl font-serif text-foreground mb-6">Mobile Wellness Services</h2>
            <p className="text-muted-foreground mb-8">
              Our team travels to locations throughout Tokyo to provide in-home and hotel-based wellness services. We primarily serve central Tokyo areas within a reasonable distance from our Nishi-Azabu clinic.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Home Visits</h3>
                <p className="text-sm text-muted-foreground">
                  Receive IV therapy and wellness services in the comfort of your own home.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Hotel Service</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for travelers and business visitors staying in Tokyo hotels.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Office Visits</h3>
                <p className="text-sm text-muted-foreground">
                  Corporate wellness services available at your workplace.
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
            Not Sure If We Serve Your Area?
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Contact us to confirm service availability in your location. We may be able to accommodate areas not listed above.
          </p>
          <ContactButton />
        </div>
      </section>
    </>
  )
}
