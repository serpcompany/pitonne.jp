import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Ebisu, Shibuya | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Ebisu (恵比寿), Shibuya Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function EbisuPage() {
  return (
    <AreaDetailPage
      areaName="Ebisu"
      areaNameJa="恵比寿"
      wardName="Shibuya"
      wardSlug="shibuya"
      description="Ebisu is a sophisticated neighborhood known for its excellent restaurants, craft beer scene, and relaxed atmosphere. Young professionals living here often choose our skin brightening and vitamin IV treatments."
      highlights={[
        "12-minute drive from clinic",
        "Popular with young professionals",
        "Skin and beauty IVs in demand",
        "Weekend appointments available"
      ]}
      landmarks={["Yebisu Garden Place", "Tokyo Metropolitan Museum of Photography", "Ebisu Yokocho"]}
      otherAreas={[
        { name: "Daikanyama", slug: "daikanyama" },
        { name: "Omotesando", slug: "omotesando" },
        { name: "Harajuku", slug: "harajuku" },
        { name: "Yoyogi", slug: "yoyogi" },
        { name: "Sendagaya", slug: "sendagaya" }
      ]}
    />
  )
}
