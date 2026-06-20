import type { MetadataRoute } from "next"
import { SITE_URL, isProductionDeployment } from "@/lib/seo"

export const dynamic = "force-static"

const sitemaps = [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/videos-sitemap.xml`]

export default function robots(): MetadataRoute.Robots {
  if (isProductionDeployment()) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: sitemaps,
    }
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: sitemaps,
  }
}
