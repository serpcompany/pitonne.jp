import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Osaki, Shinagawa | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Osaki (大崎), Shinagawa Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function OsakiPage() {
  return (
    <AreaDetailPage
      areaName="Osaki"
      areaNameJa="大崎"
      wardName="Shinagawa"
      wardSlug="shinagawa"
      description="Osaki has transformed into a modern business district with the Gate City complex. Corporate professionals in this area use our IV therapy services for wellness and performance support."
      highlights={[
        "20-minute drive from clinic",
        "Modern business complex",
        "Corporate clients",
        "Office visits available"
      ]}
      landmarks={["Gate City Osaki", "ThinkPark Tower", "O Art Museum"]}
      otherAreas={[
        { name: "Gotanda", slug: "gotanda" },
        { name: "Takanawa", slug: "takanawa" }
      ]}
    />
  )
}
