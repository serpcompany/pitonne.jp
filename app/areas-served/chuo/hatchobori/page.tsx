import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Hatchobori, Chuo | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Hatchobori (八丁堀), Chuo Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function HatchoboriPage() {
  return (
    <AreaDetailPage
      areaName="Hatchobori"
      areaNameJa="八丁堀"
      wardName="Chuo"
      wardSlug="chuo"
      description="Hatchobori is a business district with excellent transportation access, popular with companies and hotels. Our IV therapy services are readily available to this convenient central Tokyo location."
      highlights={[
        "25-minute drive from clinic",
        "Business hotel area",
        "Transportation hub",
        "Quick service delivery"
      ]}
      landmarks={["Hatchobori Station", "Kayabacho Business District", "Sakuragawa Park"]}
      otherAreas={[
        { name: "Ginza", slug: "ginza" },
        { name: "Nihonbashi", slug: "nihonbashi" },
        { name: "Tsukiji", slug: "tsukiji" }
      ]}
    />
  )
}
