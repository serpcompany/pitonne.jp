// Sitemap index pattern (serpcompany/serp docs/engineering/websites/features/xml-sitemaps.md):
// /sitemap-index.xml lists one root-level URL set per content group, /sitemap-<group>.xml.
// /sitemap.xml serves the same XML as the index for clients that still request it.
import { getAllAreas, wards } from "@/lib/data/areas"
import { getAllBlogPostSlugs, getAllCategories, getBlogCategoryLocales, getBlogPostLocales } from "@/lib/data/blog-posts"
import { canonicalRoutes } from "@/lib/data/routes"
import { services } from "@/lib/data/services"
import { pitonneVideos } from "@/lib/data/videos"
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config"
import { normalizePath, SITE_URL } from "@/lib/seo"

// Order is the order of the index. A URL belongs to the first group that lists it.
export const sitemapGroups = ["pages", "services", "areas", "blog", "categories", "videos"] as const
export type SitemapGroup = (typeof sitemapGroups)[number]

export const SITEMAP_INDEX_FILE = "sitemap-index.xml"
export const sitemapFile = (group: SitemapGroup) => `sitemap-${group}.xml`

// sitemaps.org limit per file. Past it, add sitemap-<group>-2.xml beside the first file and list it in the index.
export const MAX_SITEMAP_URLS = 50_000

export interface SitemapVideo {
  thumbnailUrl: string
  title: string
  description: string
  playerUrl: string
  durationSeconds: number
  publicationDate: string
}

export interface SitemapEntry {
  url: string
  changeFrequency: "weekly" | "monthly"
  priority: number
  alternates: { en?: string; ja?: string; xDefault: string }
  video?: SitemapVideo
}

interface SitemapPath {
  path: string
  // Locales the page is published in; blog posts and categories can be single-locale
  locales: readonly Locale[]
  video?: (locale: Locale) => SitemapVideo
}

// The production origin, or the local dev server under `next dev`, so local sitemaps link to local pages.
export function sitemapOrigin(): string {
  return process.env.NODE_ENV === "development" ? `http://localhost:${process.env.PORT ?? 3000}` : SITE_URL
}

// The English homepage is the bare origin (no trailing slash); every other page ends in a slash.
export function sitemapUrl(path: string, locale: Locale, origin: string = SITE_URL): string {
  const normalizedPath = normalizePath(path)
  if (locale !== defaultLocale) return `${origin}/${locale}${normalizedPath}`
  return normalizedPath === "/" ? origin : `${origin}${normalizedPath}`
}

function groupPaths(): Record<SitemapGroup, SitemapPath[]> {
  const allLocales = (path: string): SitemapPath => ({ path, locales })
  const categorySlugs = Array.from(new Set(locales.flatMap((locale) => getAllCategories(locale).map((category) => category.slug))))

  return {
    pages: [
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
    ].map(allLocales),
    services: services.map((service) => allLocales(service.canonicalPath)),
    areas: [
      ...wards.map((ward) => `/areas-served/${ward.slug}/`),
      ...getAllAreas().map(({ ward, area }) => `/areas-served/${ward.slug}/${area.slug}/`),
    ].map(allLocales),
    blog: getAllBlogPostSlugs().map((slug) => ({ path: `/blog/${slug}/`, locales: getBlogPostLocales(slug) })),
    categories: categorySlugs.map((slug) => ({ path: `/blog/category/${slug}/`, locales: getBlogCategoryLocales(slug) })),
    videos: pitonneVideos.map((video) => ({
      path: video.watchPath,
      locales,
      video: (locale) => ({
        thumbnailUrl: video.thumbnailUrl,
        title: locale === "ja" ? (video.titleJa ?? video.title) : video.title,
        description:
          locale === "ja"
            ? (video.metaDescriptionJa ?? video.descriptionJa ?? video.description)
            : (video.metaDescription ?? video.description),
        playerUrl: video.embedUrl,
        durationSeconds: durationToSeconds(video.duration),
        publicationDate: video.uploadDate,
      }),
    })),
  }
}

export function sitemapEntriesForPath(
  path: string,
  pathLocales: readonly Locale[],
  origin: string = SITE_URL,
  video?: SitemapPath["video"],
): SitemapEntry[] {
  const normalizedPath = normalizePath(path)
  const changeFrequency = normalizedPath.startsWith("/blog/") ? "weekly" : "monthly"
  const depth = normalizedPath.split("/").filter(Boolean).length
  const priority = depth === 0 ? 1 : depth === 1 ? 0.8 : 0.6
  const url = (locale: Locale) => sitemapUrl(normalizedPath, locale, origin)

  const alternates: SitemapEntry["alternates"] = {
    ...(pathLocales.includes("en") ? { en: url("en") } : {}),
    ...(pathLocales.includes("ja") ? { ja: url("ja") } : {}),
    xDefault: url(pathLocales.includes(defaultLocale) ? defaultLocale : pathLocales[0]),
  }

  return pathLocales.map((locale) => ({
    url: url(locale),
    changeFrequency,
    priority,
    alternates,
    ...(video ? { video: video(locale) } : {}),
  }))
}

export function sitemapEntriesByGroup(origin: string = SITE_URL): Record<SitemapGroup, SitemapEntry[]> {
  const paths = groupPaths()
  const seen = new Set<string>()

  return Object.fromEntries(
    sitemapGroups.map((group) => {
      // Each URL is listed in exactly one sitemap
      const unique = paths[group].filter(({ path }) => (seen.has(path) ? false : (seen.add(path), true)))
      const entries = unique.flatMap(({ path, locales: pathLocales, video }) => sitemapEntriesForPath(path, pathLocales, origin, video))
      if (entries.length > MAX_SITEMAP_URLS) {
        throw new Error(`${sitemapFile(group)} has ${entries.length} URLs (max ${MAX_SITEMAP_URLS}); split it into numbered files`)
      }
      return [group, entries]
    }),
  ) as Record<SitemapGroup, SitemapEntry[]>
}

export function sitemapEntries(group: SitemapGroup, origin: string = SITE_URL): SitemapEntry[] {
  return sitemapEntriesByGroup(origin)[group]
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function durationToSeconds(duration: string): number {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!match) return 0
  const [, hours, minutes, seconds] = match
  return Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0)
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>'

export function sitemapIndexXml(origin: string = SITE_URL): string {
  const children = sitemapGroups.map((group) => `  <sitemap>\n    <loc>${escapeXml(`${origin}/${sitemapFile(group)}`)}</loc>\n  </sitemap>`)
  return [XML_HEADER, '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...children, "</sitemapindex>", ""].join("\n")
}

export function urlsetXml(entries: SitemapEntry[]): string {
  const hasVideo = entries.some((entry) => entry.video)
  const namespaces = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    'xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    ...(hasVideo ? ['xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'] : []),
  ]

  const urls = entries.map((entry) => {
    const alternates: Array<[string, string | undefined]> = [
      ["en", entry.alternates.en],
      ["ja", entry.alternates.ja],
      ["x-default", entry.alternates.xDefault],
    ]
    const alternateLinks = alternates
      .filter((link): link is [string, string] => Boolean(link[1]))
      .map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`)

    const video = entry.video
      ? [
          "    <video:video>",
          `      <video:thumbnail_loc>${escapeXml(entry.video.thumbnailUrl)}</video:thumbnail_loc>`,
          `      <video:title>${escapeXml(entry.video.title)}</video:title>`,
          `      <video:description>${escapeXml(entry.video.description)}</video:description>`,
          `      <video:player_loc>${escapeXml(entry.video.playerUrl)}</video:player_loc>`,
          `      <video:duration>${entry.video.durationSeconds}</video:duration>`,
          `      <video:publication_date>${escapeXml(entry.video.publicationDate)}</video:publication_date>`,
          "    </video:video>",
        ]
      : []

    return [
      "  <url>",
      `    <loc>${escapeXml(entry.url)}</loc>`,
      ...alternateLinks,
      `    <changefreq>${entry.changeFrequency}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      ...video,
      "  </url>",
    ].join("\n")
  })

  return [XML_HEADER, `<urlset ${namespaces.join(" ")}>`, ...urls, "</urlset>", ""].join("\n")
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}

export function sitemapIndexResponse(): Response {
  return xmlResponse(sitemapIndexXml(sitemapOrigin()))
}

export function sitemapResponse(group: SitemapGroup): Response {
  return xmlResponse(urlsetXml(sitemapEntries(group, sitemapOrigin())))
}
