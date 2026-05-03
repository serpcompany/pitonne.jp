import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Akasaka, Minato | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Akasaka (赤坂), Minato Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function AkasakaPage() {
  return (
    <AreaDetailPage
      areaName="Akasaka"
      areaNameJa="赤坂"
      wardName="Minato"
      wardSlug="minato"
      description="Akasaka is a major business and entertainment district, home to TBS headquarters, luxury hotels, and numerous corporate offices. Business executives frequently request our IV vitamin therapy and fatigue recovery treatments for maintaining peak performance."
      highlights={[
        "10-minute drive from our clinic",
        "Corporate wellness programs available",
        "Hotel visits to major chains",
        "Energy IV drips for busy professionals"
      ]}
      landmarks={["Akasaka Sacas", "The Capitol Hotel Tokyu", "Hie Shrine"]}
      otherAreas={[
        { name: "Roppongi", slug: "roppongi" },
        { name: "Azabu Juban", slug: "azabu-juban" },
        { name: "Hiroo", slug: "hiroo" },
        { name: "Toranomon", slug: "toranomon" },
        { name: "Shimbashi", slug: "shimbashi" }
      ]}
    />
  )
}
