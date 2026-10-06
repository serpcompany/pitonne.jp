import { pitonneVideos } from "@/lib/data/videos"
import { canonicalUrl, SITE_URL } from "@/lib/seo"

export const dynamic = "force-static"

export function GET() {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...pitonneVideos.flatMap((video) => {
      const enUrl = canonicalUrl(video.watchPath)
      const jaUrl = `${SITE_URL}/ja${video.watchPath}`

      const entries = [
        { watchUrl: enUrl, title: video.title, description: video.metaDescription ?? video.description },
        {
          watchUrl: jaUrl,
          title: video.titleJa ?? video.title,
          description: video.metaDescriptionJa ?? video.descriptionJa ?? video.description,
        },
      ]

      return entries.map(({ watchUrl, title, description }) => [
        "  <url>",
        `    <loc>${escapeXml(watchUrl)}</loc>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}" />`,
        `    <xhtml:link rel="alternate" hreflang="ja" href="${escapeXml(jaUrl)}" />`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(enUrl)}" />`,
        "    <video:video>",
        `      <video:thumbnail_loc>${escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>`,
        `      <video:title>${escapeXml(title)}</video:title>`,
        `      <video:description>${escapeXml(description)}</video:description>`,
        `      <video:player_loc>${escapeXml(video.embedUrl)}</video:player_loc>`,
        `      <video:duration>${durationToSeconds(video.duration)}</video:duration>`,
        `      <video:publication_date>${escapeXml(video.uploadDate)}</video:publication_date>`,
        "    </video:video>",
        "  </url>",
      ].join("\n"))
    }),
    "</urlset>",
  ].join("\n")

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  })
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

  if (!match) {
    return 0
  }

  const [, hours, minutes, seconds] = match

  return (Number(hours ?? 0) * 3600) + (Number(minutes ?? 0) * 60) + Number(seconds ?? 0)
}
