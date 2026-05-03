import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Akihabara, Chiyoda | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Akihabara (秋葉原), Chiyoda Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function AkihabaraPage() {
  return (
    <AreaDetailPage
      areaName="Akihabara"
      areaNameJa="秋葉原"
      wardName="Chiyoda"
      wardSlug="chiyoda"
      description="Akihabara is world-famous as Tokyo's electronics and anime district. The area's tech professionals and visiting enthusiasts sometimes need our energy and recovery IV treatments."
      highlights={[
        "30-minute drive from clinic",
        "Tech and gaming district",
        "Tourist destination",
        "Energy treatments popular"
      ]}
      landmarks={["Yodobashi Camera", "Radio Kaikan", "mAAch ecute"]}
      otherAreas={[
        { name: "Tokyo Station", slug: "tokyo-station" },
        { name: "Kanda", slug: "kanda" },
        { name: "Otemachi", slug: "otemachi" },
        { name: "Iidabashi", slug: "iidabashi" }
      ]}
    />
  )
}
