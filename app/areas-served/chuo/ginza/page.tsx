import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Ginza, Chuo | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Ginza (銀座), Chuo Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function GinzaPage() {
  return (
    <AreaDetailPage
      areaName="Ginza"
      areaNameJa="銀座"
      wardName="Chuo"
      wardSlug="chuo"
      description="Ginza is Tokyo's most prestigious shopping and entertainment district, home to department stores, galleries, and Michelin-starred restaurants. Visitors staying at Ginza's luxury hotels frequently request our concierge wellness services."
      highlights={[
        "20-minute drive from clinic",
        "Luxury hotel partnerships",
        "Tourist and business traveler focus",
        "Same-day appointments"
      ]}
      landmarks={["Ginza Six", "Mitsukoshi Department Store", "Kabukiza Theatre"]}
      otherAreas={[
        { name: "Nihonbashi", slug: "nihonbashi" },
        { name: "Hatchobori", slug: "hatchobori" },
        { name: "Tsukiji", slug: "tsukiji" }
      ]}
    />
  )
}
