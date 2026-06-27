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
    title: dict.legal.privacyPolicy,
    description: dict.legal.privacyPolicyMeta,
    alternates: localizedHreflangAlternates("/legal/privacy-policy/", locale as Locale),
    openGraph: {
      title: dict.legal.privacyPolicy,
      description: dict.legal.privacyPolicyMeta,
      url: localizedHreflangAlternates("/legal/privacy-policy/", locale as Locale).canonical,
    },
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  const page = getLegalPage("privacyPolicy", locale as Locale)

  return <LegalMarkdownPage page={page} canonicalTitle={dict.legal.privacyPolicy} locale={locale as Locale} />
}
