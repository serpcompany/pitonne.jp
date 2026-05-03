import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Nihonbashi, Chuo | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Nihonbashi (日本橋), Chuo Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function NihonbashiPage() {
  return (
    <AreaDetailPage
      areaName="Nihonbashi"
      areaNameJa="日本橋"
      wardName="Chuo"
      wardSlug="chuo"
      description="Nihonbashi is Tokyo's historic commercial center, now a major financial district. The area's corporate professionals value our efficient IV therapy services for maintaining their demanding schedules."
      highlights={[
        "25-minute drive from clinic",
        "Financial district",
        "Corporate wellness programs",
        "Office visit available"
      ]}
      landmarks={["Nihonbashi Bridge", "Coredo Muromachi", "Bank of Japan"]}
      otherAreas={[
        { name: "Ginza", slug: "ginza" },
        { name: "Hatchobori", slug: "hatchobori" },
        { name: "Tsukiji", slug: "tsukiji" }
      ]}
    />
  )
}
