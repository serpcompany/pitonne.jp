import { sitemapResponse } from "@/lib/sitemaps"

export const dynamic = "force-static"

export function GET() {
  return sitemapResponse("pages")
}
