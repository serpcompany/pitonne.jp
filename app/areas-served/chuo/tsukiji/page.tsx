import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Tsukiji, Chuo | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Tsukiji (築地), Chuo Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function TsukijiPage() {
  return (
    <AreaDetailPage
      areaName="Tsukiji"
      areaNameJa="築地"
      wardName="Chuo"
      wardSlug="chuo"
      description="Tsukiji remains a culinary destination even after the wholesale market's relocation. Visitors enjoying the area's famous seafood sometimes need our hangover recovery services the next morning."
      highlights={[
        "20-minute drive from clinic",
        "Tourist destination",
        "Recovery treatments",
        "Morning appointments"
      ]}
      landmarks={["Tsukiji Outer Market", "Namiyoke Shrine", "Tsukiji Honganji Temple"]}
      otherAreas={[
        { name: "Ginza", slug: "ginza" },
        { name: "Nihonbashi", slug: "nihonbashi" },
        { name: "Hatchobori", slug: "hatchobori" }
      ]}
    />
  )
}
