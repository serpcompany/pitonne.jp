import type { Metadata } from "next"
import { LegalMarkdownPage } from "@/components/legal/legal-markdown-page"
import { getLegalPage } from "@/lib/data/pages"
import { localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

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
    title: dict.legal.medicalDisclaimer,
    description: dict.legal.disclaimerMeta,
    alternates: localizedHreflangAlternates("/legal/disclaimer/", locale as Locale),
    openGraph: {
      title: dict.legal.medicalDisclaimer,
      description: dict.legal.disclaimerMeta,
      url: localizedHreflangAlternates("/legal/disclaimer/", locale as Locale).canonical,
    },
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DisclaimerPage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return (
    <LegalMarkdownPage
      page={getLegalPage("medicalDisclaimer", locale as Locale)}
      canonicalTitle={dict.legal.medicalDisclaimer}
      description={dict.legal.disclaimerDescription}
      locale={locale as Locale}
    />
  )
}
