import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Tokyo Station, Chiyoda | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Tokyo Station (東京駅), Chiyoda Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function TokyoStationPage() {
  return (
    <AreaDetailPage
      areaName="Tokyo Station"
      areaNameJa="東京駅"
      wardName="Chiyoda"
      wardSlug="chiyoda"
      description="Tokyo Station is Japan's central transportation hub, surrounded by major hotels and office buildings. Travelers and business professionals passing through frequently use our convenient IV therapy services."
      highlights={[
        "25-minute drive from clinic",
        "Major transit hub",
        "Hotel visits to station hotels",
        "Traveler wellness services"
      ]}
      landmarks={["Tokyo Station Marunouchi Building", "KITTE", "Imperial Palace East Gardens"]}
      otherAreas={[
        { name: "Kanda", slug: "kanda" },
        { name: "Otemachi", slug: "otemachi" },
        { name: "Iidabashi", slug: "iidabashi" },
        { name: "Akihabara", slug: "akihabara" }
      ]}
    />
  )
}
