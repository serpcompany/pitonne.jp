import type { MetadataRoute } from 'next'
import { isProductionDeployment } from '@/lib/seo'
import { SITEMAP_INDEX_FILE, sitemapOrigin } from '@/lib/sitemaps'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const sitemap = `${sitemapOrigin()}/${SITEMAP_INDEX_FILE}`

  if (isProductionDeployment()) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: '/keystatic/'
      },
      sitemap
    }
  }

  return {
    rules: {
      userAgent: '*',
      disallow: '/'
    },
    sitemap
  }
}
