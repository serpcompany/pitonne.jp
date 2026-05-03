import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Gotanda, Shinagawa | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Gotanda (五反田), Shinagawa Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function GotandaPage() {
  return (
    <AreaDetailPage
      areaName="Gotanda"
      areaNameJa="五反田"
      wardName="Shinagawa"
      wardSlug="shinagawa"
      description="Gotanda is a commercial district with a growing startup scene and active nightlife. Young professionals and entrepreneurs here value our energy and recovery treatments."
      highlights={[
        "15-minute drive from clinic",
        "Startup hub",
        "Nightlife district",
        "Hangover IVs popular"
      ]}
      landmarks={["TOC Building", "Gotanda Station", "Meguro River nearby"]}
      otherAreas={[
        { name: "Takanawa", slug: "takanawa" },
        { name: "Osaki", slug: "osaki" }
      ]}
    />
  )
}
