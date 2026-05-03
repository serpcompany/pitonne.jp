import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Hiroo, Minato | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Hiroo (広尾), Minato Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function HirooPage() {
  return (
    <AreaDetailPage
      areaName="Hiroo"
      areaNameJa="広尾"
      wardName="Minato"
      wardSlug="minato"
      description="Hiroo is an upscale residential area popular with international families and embassy staff. The neighborhood's peaceful atmosphere and proximity to international schools makes it ideal for our wellness consultation services."
      highlights={[
        "Adjacent to our Nishi Azabu location",
        "Many international residents",
        "Family-friendly wellness services",
        "Immune boost treatments popular here"
      ]}
      landmarks={["Arisugawa-no-miya Memorial Park", "National Azabu Supermarket", "Hiroo Station"]}
      otherAreas={[
        { name: "Roppongi", slug: "roppongi" },
        { name: "Azabu Juban", slug: "azabu-juban" },
        { name: "Akasaka", slug: "akasaka" },
        { name: "Toranomon", slug: "toranomon" },
        { name: "Shimbashi", slug: "shimbashi" }
      ]}
    />
  )
}
