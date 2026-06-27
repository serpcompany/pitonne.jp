import type { Metadata } from "next"
import { ServicesIndexTemplate } from "@/components/services/services-index-template"
import { getServiceCategorySections } from "@/lib/data/services"
import { localizedHreflangAlternates, localizedCanonicalUrl } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
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
    title: dict.services.ourServices,
    description: dict.services.metaDescription,
    alternates: localizedHreflangAlternates("/services/", locale as Locale),
    openGraph: {
      title: dict.services.ourServices,
      description: dict.services.metaDescription,
      url: localizedCanonicalUrl("/services/", locale as Locale),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  }
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params

  return <ServicesIndexTemplate sections={getServiceCategorySections(locale as Locale)} locale={locale as Locale} />
}
