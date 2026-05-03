import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Takanawa, Shinagawa | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Takanawa (高輪), Shinagawa Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function TakanawaPage() {
  return (
    <AreaDetailPage
      areaName="Takanawa"
      areaNameJa="高輪"
      wardName="Shinagawa"
      wardSlug="shinagawa"
      description="Takanawa is an upscale area featuring grand hotels and quiet residential streets. The neighborhood's luxury hotels frequently request our concierge IV therapy services for their guests."
      highlights={[
        "20-minute drive from clinic",
        "Luxury hotel area",
        "Residential district",
        "Premium service focus"
      ]}
      landmarks={["Takanawa Gateway Station", "Grand Prince Hotels", "Sengakuji Temple"]}
      otherAreas={[
        { name: "Gotanda", slug: "gotanda" },
        { name: "Osaki", slug: "osaki" }
      ]}
    />
  )
}
