import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Omotesando, Shibuya | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Omotesando (表参道), Shibuya Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function OmotesandoPage() {
  return (
    <AreaDetailPage
      areaName="Omotesando"
      areaNameJa="表参道"
      wardName="Shibuya"
      wardSlug="shibuya"
      description="Omotesando is Tokyo's Champs-Élysées, lined with flagship stores from the world's top fashion brands. The area's discerning clientele appreciates our premium wellness services and aesthetic treatments."
      highlights={[
        "18-minute drive from clinic",
        "Luxury retail district",
        "Beauty and skin treatments",
        "High-end hotel visits"
      ]}
      landmarks={["Omotesando Hills", "Nezu Museum", "Cat Street"]}
      otherAreas={[
        { name: "Ebisu", slug: "ebisu" },
        { name: "Daikanyama", slug: "daikanyama" },
        { name: "Harajuku", slug: "harajuku" },
        { name: "Yoyogi", slug: "yoyogi" },
        { name: "Sendagaya", slug: "sendagaya" }
      ]}
    />
  )
}
