import { getAllAreas, wards } from "@/lib/data/areas"
import { getAllBlogPostSlugs, getAllCategories, getBlogCategoryLocales, getBlogPostLocales } from "@/lib/data/blog-posts"
import { locales, type Locale } from "@/lib/i18n/config"
import { services } from "@/lib/data/services"
import { canonicalRoutes } from "@/lib/data/routes"
import { canonicalUrl, SITE_URL } from "@/lib/seo"

export const dynamic = "force-static"

interface SitemapEntry {
  url: string
  changeFrequency: "weekly" | "monthly"
  priority: number
  alternates: { en?: string; ja?: string; xDefault: string }
}

interface SitemapPath {
  path: string
  // Locales the page is published in; blog posts and categories can be single-locale
  locales: readonly Locale[]
}

export function buildEntries(): SitemapEntry[] {
  const staticPaths = [
    canonicalRoutes.home,
    canonicalRoutes.about,
    canonicalRoutes.services,
    canonicalRoutes.contact,
    canonicalRoutes.blog,
    canonicalRoutes.faqs,
    canonicalRoutes.areasServed,
    canonicalRoutes.videos,
    canonicalRoutes.legal,
    canonicalRoutes.privacyPolicy,
    canonicalRoutes.termsConditions,
    canonicalRoutes.medicalDisclaimer,
  ]

  const allLocalePaths = [
    ...staticPaths,
    ...services.map((service) => service.canonicalPath),
    // Watch pages are listed only in videos-sitemap.xml so each URL appears in exactly one sitemap.
    ...wards.map((ward) => `/areas-served/${ward.slug}/`),
    ...getAllAreas().map(({ ward, area }) => `/areas-served/${ward.slug}/${area.slug}/`),
  ]

  const categorySlugs = Array.from(new Set(locales.flatMap((locale) => getAllCategories(locale).map((category) => category.slug))))

  const paths: SitemapPath[] = [
    ...allLocalePaths.map((path) => ({ path, locales })),
    ...getAllBlogPostSlugs().map((slug) => ({ path: `/blog/${slug}/`, locales: getBlogPostLocales(slug) })),
    ...categorySlugs.map((slug) => ({ path: `/blog/category/${slug}/`, locales: getBlogCategoryLocales(slug) })),
  ]

  const seen = new Set<string>()
  const uniquePaths = paths.filter(({ path }) => (seen.has(path) ? false : (seen.add(path), true)))

  return uniquePaths.flatMap(({ path, locales: pathLocales }) => sitemapEntriesForPath(path, pathLocales))
}

export function sitemapEntriesForPath(path: string, pathLocales: readonly Locale[]): SitemapEntry[] {
  const changeFrequency = (path.startsWith("/blog/") ? "weekly" : "monthly") as "weekly" | "monthly"
  const priority = path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6
  const enUrl = canonicalUrl(path)
  const jaUrl = `${SITE_URL}/ja${path.endsWith("/") ? path : `${path}/`}`
  const urls: Record<Locale, string> = { en: enUrl, ja: jaUrl }

  const alternates: SitemapEntry["alternates"] = {
    ...(pathLocales.includes("en") ? { en: enUrl } : {}),
    ...(pathLocales.includes("ja") ? { ja: jaUrl } : {}),
    xDefault: urls[pathLocales.includes("en") ? "en" : pathLocales[0]],
  }

  return pathLocales.map((locale) => ({ url: urls[locale], changeFrequency, priority, alternates }))
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const alternateLinks = [
        ["en", entry.alternates.en],
        ["ja", entry.alternates.ja],
        ["x-default", entry.alternates.xDefault],
      ]
        .filter((link): link is [string, string] => Boolean(link[1]))
        .map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`)
        .join("\n")

      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
${alternateLinks}
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`
}

export function GET() {
  const entries = buildEntries()
  const xml = toXml(entries)

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
