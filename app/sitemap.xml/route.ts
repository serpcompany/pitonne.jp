import { getAllAreas, wards } from "@/lib/data/areas"
import { blogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { pitonneVideos } from "@/lib/data/videos"
import { services } from "@/lib/data/services"
import { canonicalRoutes } from "@/lib/data/routes"
import { canonicalUrl, SITE_URL } from "@/lib/seo"

export const dynamic = "force-static"

interface SitemapEntry {
  url: string
  changeFrequency: "weekly" | "monthly"
  priority: number
  alternates: { en: string; ja: string; xDefault: string }
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

  const paths = [
    ...staticPaths,
    ...services.map((service) => service.canonicalPath),
    ...blogPosts.map((post) => `/blog/${post.slug}/`),
    ...pitonneVideos.map((video) => video.watchPath),
    ...getAllCategories().map((category) => `/blog/category/${category.slug}/`),
    ...wards.map((ward) => `/areas-served/${ward.slug}/`),
    ...getAllAreas().map(({ ward, area }) => `/areas-served/${ward.slug}/${area.slug}/`),
  ]

  const uniquePaths = Array.from(new Set(paths))

  return uniquePaths.flatMap((path) => {
    const changeFrequency = (path.startsWith("/blog/") ? "weekly" : "monthly") as "weekly" | "monthly"
    const priority = path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6
    const enUrl = canonicalUrl(path)
    const jaUrl = `${SITE_URL}/ja${path.endsWith("/") ? path : `${path}/`}`

    return [
      { url: enUrl, changeFrequency, priority, alternates: { en: enUrl, ja: jaUrl, xDefault: enUrl } },
      { url: jaUrl, changeFrequency, priority, alternates: { en: enUrl, ja: jaUrl, xDefault: enUrl } },
    ]
  })
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(entry.alternates.en)}" />
    <xhtml:link rel="alternate" hreflang="ja" href="${escapeXml(entry.alternates.ja)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(entry.alternates.xDefault)}" />
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
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
