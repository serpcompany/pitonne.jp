import type { Metadata } from "next"
import { LegalMarkdownPage } from "@/components/legal/legal-markdown-page"
import { getMarkdownPage } from "@/lib/data/pages"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Medical disclaimer and important health information for Pitonne IV therapy and wellness services.",
  alternates: {
    canonical: canonicalUrl("/legal/disclaimer/"),
  },
  openGraph: {
    title: "Medical Disclaimer",
    description: "Medical disclaimer and important health information for Pitonne IV therapy and wellness services.",
    url: canonicalUrl("/legal/disclaimer/"),
  },
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
