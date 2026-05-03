import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Kanda, Chiyoda | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Kanda (神田), Chiyoda Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function KandaPage() {
  return (
    <AreaDetailPage
      areaName="Kanda"
      areaNameJa="神田"
      wardName="Chiyoda"
      wardSlug="chiyoda"
      description="Kanda is a historic commercial area known for its bookstores and traditional atmosphere. The neighborhood's mix of traditional businesses and modern offices creates diverse demand for our services."
      highlights={[
        "30-minute drive from clinic",
        "Historic business district",
        "Office visits available",
        "All treatments offered"
      ]}
      landmarks={["Kanda Myojin Shrine", "Book Town Jimbocho", "Kanda Yabu Soba"]}
      otherAreas={[
        { name: "Tokyo Station", slug: "tokyo-station" },
        { name: "Otemachi", slug: "otemachi" },
        { name: "Iidabashi", slug: "iidabashi" },
        { name: "Akihabara", slug: "akihabara" }
      ]}
    />
  )
}
