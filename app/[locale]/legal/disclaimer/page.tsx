import type { Metadata } from "next"
import { LegalMarkdownPage } from "@/components/legal/legal-markdown-page"
import { getMarkdownPage } from "@/lib/data/pages"
import { localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title: "Medical Disclaimer",
    description: "Medical disclaimer and important health information for Pitonne IV therapy and wellness services.",
    alternates: localizedHreflangAlternates("/legal/disclaimer/", locale as Locale),
    openGraph: {
      title: "Medical Disclaimer",
      description: "Medical disclaimer and important health information for Pitonne IV therapy and wellness services.",
      url: localizedHreflangAlternates("/legal/disclaimer/", locale as Locale).canonical,
    },
  }
}

export default function DisclaimerPage() {
  return (
    <LegalMarkdownPage
      page={getMarkdownPage("legal/disclaimer.md")}
      canonicalTitle="Medical Disclaimer"
      description="Important information about our medical services and treatments."
    />
  )
}
