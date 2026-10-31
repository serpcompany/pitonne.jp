import { sitemapIndexResponse } from "@/lib/sitemaps"

export const dynamic = "force-static"

// Compatibility alias: the same XML as /sitemap-index.xml, the canonical entry point
export function GET() {
  return sitemapIndexResponse()
}
