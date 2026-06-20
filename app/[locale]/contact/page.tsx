import type { Metadata } from "next"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { PageHero } from "@/components/shared/page-hero"
import { BookingButton } from "@/components/shared/booking-button"
import { localizedHreflangAlternates } from "@/lib/seo"
import { getBusinessInfo } from "@/lib/data/site"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export const dynamicParams = false

export async function generateStaticParams() {
  return nonDefaultLocales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return {
    title: dict.contact.contactUs,
    description: dict.contact.metaDescription,
    alternates: localizedHreflangAlternates("/contact/", locale as Locale),
    openGraph: {
      title: dict.contact.contactUs,
      description: dict.contact.metaDescription,
      url: localizedHreflangAlternates("/contact/", locale as Locale).canonical,
    },
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)
  const info = getBusinessInfo(locale as Locale)

  const phoneLinks = [
    { label: dict.contact.japan, number: info.phone, href: "tel:070-2194-0199" },
    { label: dict.contact.us, number: "+1 786 814 0323", href: "tel:+17868140323" },
  ]

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale as Locale) },
          { label: dict.nav.contact },
        ]}
        title={dict.contact.contactUs}
        description={dict.contact.heroDescription}
      />

      {/* Contact Content */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif mb-6">{dict.common.sendMessage}</h2>
              <div className="rounded-lg border border-border bg-card p-8">
                <p className="mb-6 text-muted-foreground">
                  {dict.contact.inquiryFormDescription}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookingButton className="w-full sm:w-auto" locale={locale as Locale} />
                  <a
                    href="https://ssv.onemorehand.jp/hic_pitonne/support/inquiry?preview=on&lang=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-[#7A8F87] px-8 py-3 text-sm font-medium text-[#7A8F87] transition-colors hover:bg-[#7A8F87] hover:text-white w-full sm:w-auto"
                  >
                    {dict.common.sendMessage}
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-serif mb-6">{dict.contact.getInTouch}</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-[#7A8F87]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{dict.nav.phone}</h3>
                    <div className="space-y-1">
                      {phoneLinks.map((phone) => (
                        <a
                          key={phone.label}
                          href={phone.href}
                          className="block text-muted-foreground hover:text-[#7A8F87] transition-colors"
                        >
                          <span className="font-medium text-foreground">{phone.label}:</span> {phone.number}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-[#7A8F87]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{dict.contact.email}</h3>
                    <a href="mailto:pitonne.am@gmail.com" className="text-muted-foreground hover:text-[#7A8F87] transition-colors">
                      pitonne.am@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#7A8F87]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{dict.contact.location}</h3>
                    <address className="text-muted-foreground not-italic">
                      {dict.contact.address}
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-[#7A8F87]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{dict.footer.openHours}</h3>
                    <div className="text-muted-foreground text-sm space-y-1">
                      {info.hours.map((item) => (
                        <p key={item.day}>
                          {dict.days[item.day as keyof typeof dict.days] ?? item.day}: {item.hours}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}
