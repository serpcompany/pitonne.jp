import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Shimbashi, Minato | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Shimbashi (新橋), Minato Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function ShimbashiPage() {
  return (
    <AreaDetailPage
      areaName="Shimbashi"
      areaNameJa="新橋"
      wardName="Minato"
      wardSlug="minato"
      description="Shimbashi is known as the quintessential Japanese salaryman district, with countless izakayas and bars serving after-work crowds. Our hangover IV drip service is particularly popular among Shimbashi's hardworking professionals."
      highlights={[
        "15-minute drive from clinic",
        "Hangover IV drips highly requested",
        "Early morning appointments available",
        "Quick recovery treatments"
      ]}
      landmarks={["Shimbashi Station SL Plaza", "Shiodome City Center", "Hamarikyu Gardens"]}
      otherAreas={[
        { name: "Roppongi", slug: "roppongi" },
        { name: "Azabu Juban", slug: "azabu-juban" },
        { name: "Hiroo", slug: "hiroo" },
        { name: "Akasaka", slug: "akasaka" },
        { name: "Toranomon", slug: "toranomon" }
      ]}
    />
  )
}
