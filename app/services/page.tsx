import type { Metadata } from "next"
import { ServicesIndexTemplate } from "@/components/services/services-index-template"
import { getServiceCategorySections } from "@/lib/data/services"

export const metadata: Metadata = {
  title: "Our Services | Pitonne Stem Cell & IV Therapy Tokyo",
  description: "Explore physician-guided medications, premium IV Therapy, blood testing and regenerative wellness services. Designed for busy professionals, travelers, and health-conscious clients in Tokyo.",
}

export default function ServicesPage() {
  return <ServicesIndexTemplate sections={getServiceCategorySections()} />
}
