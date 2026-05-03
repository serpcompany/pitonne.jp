import type { Metadata } from "next"
import { LegalMarkdownPage } from "@/components/legal/legal-markdown-page"
import { getMarkdownPage } from "@/lib/data/pages"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for Pitonne Stem Cell & IV Therapy services in Tokyo.",
  alternates: {
    canonical: canonicalUrl("/legal/terms-conditions/"),
  },
  openGraph: {
    title: "Terms & Conditions",
    description: "Terms and Conditions for Pitonne Stem Cell & IV Therapy services in Tokyo.",
    url: canonicalUrl("/legal/terms-conditions/"),
  },
}

export default function TermsConditionsPage() {
  return <LegalMarkdownPage page={getMarkdownPage("legal/terms-conditions.md")} canonicalTitle="Terms & Conditions" />
}
