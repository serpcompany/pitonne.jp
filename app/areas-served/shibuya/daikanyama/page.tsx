import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Daikanyama, Shibuya | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Daikanyama (代官山), Shibuya Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function DaikanyamaPage() {
  return (
    <AreaDetailPage
      areaName="Daikanyama"
      areaNameJa="代官山"
      wardName="Shibuya"
      wardSlug="shibuya"
      description="Daikanyama is Tokyo's most fashionable neighborhood, filled with designer boutiques, architecturally stunning buildings, and sophisticated cafes. The area's style-conscious residents appreciate our aesthetic-focused treatments."
      highlights={[
        "15-minute drive from clinic",
        "Fashion and creative industry clients",
        "Skin brightening popular",
        "Discrete, premium service"
      ]}
      landmarks={["Daikanyama T-Site", "Hillside Terrace", "LOG ROAD DAIKANYAMA"]}
      otherAreas={[
        { name: "Ebisu", slug: "ebisu" },
        { name: "Omotesando", slug: "omotesando" },
        { name: "Harajuku", slug: "harajuku" },
        { name: "Yoyogi", slug: "yoyogi" },
        { name: "Sendagaya", slug: "sendagaya" }
      ]}
    />
  )
}
