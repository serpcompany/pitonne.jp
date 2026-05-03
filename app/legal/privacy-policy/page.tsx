import type { Metadata } from "next"
import { LegalMarkdownPage } from "@/components/legal/legal-markdown-page"
import { getMarkdownPage } from "@/lib/data/pages"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Pitonne Stem Cell & IV Therapy services in Tokyo.",
  alternates: {
    canonical: canonicalUrl("/legal/privacy-policy/"),
  },
  openGraph: {
    title: "Privacy Policy",
    description: "Privacy Policy for Pitonne Stem Cell & IV Therapy services in Tokyo.",
    url: canonicalUrl("/legal/privacy-policy/"),
  },
}

export default function PrivacyPolicyPage() {
  return <LegalMarkdownPage page={getMarkdownPage("legal/privacy-policy.md")} canonicalTitle="Privacy Policy" />
}
