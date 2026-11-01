import type { MetadataRoute } from 'next'
import {
  deployEnvironment,
  hasPasswordGate,
  isIndexable,
  SITE_AUDITOR
} from '@/lib/deploy-environment.mts'
import { SITEMAP_INDEX_FILE, sitemapOrigin } from '@/lib/sitemaps'

export const dynamic = 'force-static'

const crawlRules = { allow: '/', disallow: '/keystatic/' }
const blockEverything = { disallow: '/' }

export default function robots(): MetadataRoute.Robots {
  const environment = deployEnvironment()
  const sitemap = `${sitemapOrigin()}/${SITEMAP_INDEX_FILE}`

  if (!isIndexable(environment)) {
    return { rules: { userAgent: '*', ...blockEverything }, sitemap }
  }

  if (hasPasswordGate(environment)) {
    return {
      rules: [
        { userAgent: '*', ...blockEverything },
        { userAgent: SITE_AUDITOR, ...crawlRules }
      ],
      sitemap
    }
  }

  return { rules: { userAgent: '*', ...crawlRules }, sitemap }
}
