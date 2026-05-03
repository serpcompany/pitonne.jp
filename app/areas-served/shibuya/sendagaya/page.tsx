import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Sendagaya, Shibuya | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Sendagaya (千駄ヶ谷), Shibuya Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function SendagayaPage() {
  return (
    <AreaDetailPage
      areaName="Sendagaya"
      areaNameJa="千駄ヶ谷"
      wardName="Shibuya"
      wardSlug="shibuya"
      description="Sendagaya is home to the Japan National Stadium and numerous sports facilities. Athletes and sports professionals in this area frequently use our recovery IV treatments and performance support services."
      highlights={[
        "25-minute drive from clinic",
        "Olympic venue area",
        "Athletic recovery focus",
        "Team wellness programs"
      ]}
      landmarks={["Japan National Stadium", "Tokyo Metropolitan Gymnasium", "Shogi Hall"]}
      otherAreas={[
        { name: "Ebisu", slug: "ebisu" },
        { name: "Daikanyama", slug: "daikanyama" },
        { name: "Omotesando", slug: "omotesando" },
        { name: "Harajuku", slug: "harajuku" },
        { name: "Yoyogi", slug: "yoyogi" }
      ]}
    />
  )
}
