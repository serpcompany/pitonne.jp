import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Yoyogi, Shibuya | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Yoyogi (代々木), Shibuya Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function YoyogiPage() {
  return (
    <AreaDetailPage
      areaName="Yoyogi"
      areaNameJa="代々木"
      wardName="Shibuya"
      wardSlug="shibuya"
      description="Yoyogi offers a perfect blend of nature and urban convenience, anchored by the vast Yoyogi Park. Athletes and fitness enthusiasts in the area frequently request our energy recovery and immune boost treatments."
      highlights={[
        "20-minute drive from clinic",
        "Popular with athletes",
        "Recovery IVs after training",
        "Immune support treatments"
      ]}
      landmarks={["Yoyogi Park", "Meiji Shrine", "NHK Broadcasting Center"]}
      otherAreas={[
        { name: "Ebisu", slug: "ebisu" },
        { name: "Daikanyama", slug: "daikanyama" },
        { name: "Omotesando", slug: "omotesando" },
        { name: "Harajuku", slug: "harajuku" },
        { name: "Sendagaya", slug: "sendagaya" }
      ]}
    />
  )
}
