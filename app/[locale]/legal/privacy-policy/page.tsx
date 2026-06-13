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
    title: "Privacy Policy",
    description: "Privacy Policy for Pitonne Stem Cell & IV Therapy services in Tokyo.",
    alternates: localizedHreflangAlternates("/legal/privacy-policy/", locale as Locale),
    openGraph: {
      title: "Privacy Policy",
      description: "Privacy Policy for Pitonne Stem Cell & IV Therapy services in Tokyo.",
      url: localizedHreflangAlternates("/legal/privacy-policy/", locale as Locale).canonical,
    },
  }
}

export default function PrivacyPolicyPage() {
  return <LegalMarkdownPage page={getMarkdownPage("legal/privacy-policy.md")} canonicalTitle="Privacy Policy" />
}
