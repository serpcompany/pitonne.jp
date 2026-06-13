import type { Metadata } from "next"
import { ServicesIndexTemplate } from "@/components/services/services-index-template"
import { getServiceCategorySections } from "@/lib/data/services"
import { localizedHreflangAlternates, localizedCanonicalUrl } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: "Services",
    description: "Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients in Tokyo.",
    alternates: localizedHreflangAlternates("/services/", locale as Locale),
    openGraph: {
      title: "Services",
      description: "Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients in Tokyo.",
      url: localizedCanonicalUrl("/services/", locale as Locale),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  }
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params

  return <ServicesIndexTemplate sections={getServiceCategorySections(locale as Locale)} />
}
