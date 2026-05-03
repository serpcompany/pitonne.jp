import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Harajuku, Shibuya | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Harajuku (原宿), Shibuya Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function HarajukuPage() {
  return (
    <AreaDetailPage
      areaName="Harajuku"
      areaNameJa="原宿"
      wardName="Shibuya"
      wardSlug="shibuya"
      description="Harajuku is the global center of Japanese street fashion and youth culture. The creative energy of this neighborhood attracts young professionals who value our modern approach to health and wellness."
      highlights={[
        "20-minute drive from clinic",
        "Youth and creative industries",
        "Vitamin and energy IVs",
        "Flexible scheduling"
      ]}
      landmarks={["Takeshita Street", "Laforet Harajuku", "Meiji Jingu"]}
      otherAreas={[
        { name: "Ebisu", slug: "ebisu" },
        { name: "Daikanyama", slug: "daikanyama" },
        { name: "Omotesando", slug: "omotesando" },
        { name: "Yoyogi", slug: "yoyogi" },
        { name: "Sendagaya", slug: "sendagaya" }
      ]}
    />
  )
}
