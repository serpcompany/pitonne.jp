import type { MetadataRoute } from "next"
import { isProductionDeployment } from "@/lib/seo"
import { SITEMAP_INDEX_FILE, sitemapOrigin } from "@/lib/sitemaps"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  // The sitemap index is the only entry point; it links every child sitemap
  const sitemap = `${sitemapOrigin()}/${SITEMAP_INDEX_FILE}`

  if (isProductionDeployment()) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        // The blog CMS sign-in page
        disallow: "/keystatic/",
      },
      sitemap,
    }
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap,
  }
}
