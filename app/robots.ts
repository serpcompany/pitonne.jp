import type { MetadataRoute } from "next"
import { SITE_URL, isProductionDeployment } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  if (isProductionDeployment()) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    }
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
