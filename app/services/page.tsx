import type { Metadata } from "next"
import { ServicesIndexTemplate } from "@/components/services/services-index-template"
import { getServiceCategorySections } from "@/lib/data/services"
import { canonicalUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Services",
  description: "Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients in Tokyo.",
  alternates: {
    canonical: canonicalUrl("/services/"),
  },
  openGraph: {
    title: "Services",
    description: "Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients in Tokyo.",
    url: canonicalUrl("/services/"),
  },
}

export default function ServicesPage() {
  return <ServicesIndexTemplate sections={getServiceCategorySections()} />
}
