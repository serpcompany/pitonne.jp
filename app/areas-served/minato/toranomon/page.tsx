import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Toranomon, Minato | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Toranomon (虎ノ門), Minato Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function ToranomonPage() {
  return (
    <AreaDetailPage
      areaName="Toranomon"
      areaNameJa="虎ノ門"
      wardName="Minato"
      wardSlug="minato"
      description="Toranomon is Tokyo's newest business hub, featuring modern skyscrapers and the innovative Toranomon Hills development. The area's corporate professionals value our efficient, discreet IV therapy services delivered directly to their offices or hotels."
      highlights={[
        "15-minute drive from clinic",
        "Office visit services available",
        "Popular with finance professionals",
        "Immune boost and vitamin IVs in demand"
      ]}
      landmarks={["Toranomon Hills", "Andaz Tokyo", "Atago Shrine"]}
      otherAreas={[
        { name: "Roppongi", slug: "roppongi" },
        { name: "Azabu Juban", slug: "azabu-juban" },
        { name: "Hiroo", slug: "hiroo" },
        { name: "Akasaka", slug: "akasaka" },
        { name: "Shimbashi", slug: "shimbashi" }
      ]}
    />
  )
}
