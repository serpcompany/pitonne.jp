import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Azabu Juban, Minato | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Azabu Juban (麻布十番), Minato Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function AzabuJubanPage() {
  return (
    <AreaDetailPage
      areaName="Azabu Juban"
      areaNameJa="麻布十番"
      wardName="Minato"
      wardSlug="minato"
      description="Azabu Juban is a charming neighborhood blending traditional Tokyo atmosphere with modern sophistication. Home to long-established shops and trendy cafes, this area attracts discerning residents who appreciate our discreet, personalized wellness services."
      highlights={[
        "Walking distance from our clinic",
        "Discreet residential visits available",
        "Popular for skin brightening treatments",
        "Quiet, professional service environment"
      ]}
      landmarks={["Azabu Juban Shopping Street", "Zenpukuji Temple", "Ichinohashi Park"]}
      otherAreas={[
        { name: "Roppongi", slug: "roppongi" },
        { name: "Hiroo", slug: "hiroo" },
        { name: "Akasaka", slug: "akasaka" },
        { name: "Toranomon", slug: "toranomon" },
        { name: "Shimbashi", slug: "shimbashi" }
      ]}
    />
  )
}
