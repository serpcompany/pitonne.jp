import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Otemachi, Chiyoda | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Otemachi (大手町), Chiyoda Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function OtemachiPage() {
  return (
    <AreaDetailPage
      areaName="Otemachi"
      areaNameJa="大手町"
      wardName="Chiyoda"
      wardSlug="chiyoda"
      description="Otemachi is Tokyo's premier financial district, housing the headquarters of Japan's largest banks and corporations. Executive wellness is a priority here, and our IV therapy services support peak performance."
      highlights={[
        "25-minute drive from clinic",
        "Financial headquarters",
        "Executive wellness focus",
        "Discreet office visits"
      ]}
      landmarks={["Otemachi Tower", "Palace Hotel Tokyo", "Wadakura Fountain Park"]}
      otherAreas={[
        { name: "Tokyo Station", slug: "tokyo-station" },
        { name: "Kanda", slug: "kanda" },
        { name: "Iidabashi", slug: "iidabashi" },
        { name: "Akihabara", slug: "akihabara" }
      ]}
    />
  )
}
