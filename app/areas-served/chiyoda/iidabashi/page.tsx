import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Iidabashi, Chiyoda | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Iidabashi (飯田橋), Chiyoda Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function IidabashiPage() {
  return (
    <AreaDetailPage
      areaName="Iidabashi"
      areaNameJa="飯田橋"
      wardName="Chiyoda"
      wardSlug="chiyoda"
      description="Iidabashi is a diverse area combining offices, universities, and the beautiful Kagurazaka neighborhood. The area's varied population appreciates our comprehensive wellness services."
      highlights={[
        "30-minute drive from clinic",
        "Mixed-use neighborhood",
        "University area",
        "Flexible scheduling"
      ]}
      landmarks={["Tokyo Dome City", "Kagurazaka", "Canal Cafe"]}
      otherAreas={[
        { name: "Tokyo Station", slug: "tokyo-station" },
        { name: "Kanda", slug: "kanda" },
        { name: "Otemachi", slug: "otemachi" },
        { name: "Akihabara", slug: "akihabara" }
      ]}
    />
  )
}
