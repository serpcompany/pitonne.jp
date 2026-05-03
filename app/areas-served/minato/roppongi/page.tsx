import type { Metadata } from "next"
import { AreaDetailPage } from "@/components/area-detail-page"

export const metadata: Metadata = {
  title: "Stem Cell & IV Therapy in Roppongi, Minato | Pitonne",
  description: "Premium IV therapy, stem cell treatments, and wellness services in Roppongi (六本木), Minato Ward, Tokyo. Mobile concierge care for hotels, homes, and offices.",
}

export default function RoppongiPage() {
  return (
    <AreaDetailPage
      areaName="Roppongi"
      areaNameJa="六本木"
      wardName="Minato"
      wardSlug="minato"
      description="Roppongi is Tokyo's premier entertainment and nightlife district, known for its vibrant clubs, international dining, and the iconic Roppongi Hills complex. Business professionals and travelers often seek our hangover IV drips and energy recovery treatments after late nights in this dynamic neighborhood."
      highlights={[
        "5-minute drive from our Nishi Azabu clinic",
        "Popular among business travelers and expats",
        "24/7 hotel visit availability",
        "Quick response times for urgent requests"
      ]}
      landmarks={["Roppongi Hills", "Tokyo Midtown", "National Art Center"]}
      otherAreas={[
        { name: "Azabu Juban", slug: "azabu-juban" },
        { name: "Hiroo", slug: "hiroo" },
        { name: "Akasaka", slug: "akasaka" },
        { name: "Toranomon", slug: "toranomon" },
        { name: "Shimbashi", slug: "shimbashi" }
      ]}
    />
  )
}
