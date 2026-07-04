import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import VideosPage, { generateMetadata as videosGenerateMetadata } from "@/app/[locale]/videos/page"
import WatchPage, { generateMetadata, generateStaticParams } from "@/app/[locale]/watch/[video]/page"
import { videoObjectJsonLd, videoBreadcrumbJsonLd, videoListJsonLd } from "@/lib/structured-data"
import { getVideoBySlug, pitonneVideos } from "@/lib/data/videos"

const SITE_URL = "https://pitonne.jp"

describe("Pitonne video pages", () => {
  it("keeps exact public YouTube metadata for the channel videos", () => {
    expect(pitonneVideos).toHaveLength(6)
    expect(pitonneVideos.map((video) => video.youtubeId)).toEqual([
      "wDjmsOyulh0",
      "IGmMAn8K7UY",
      "ovaSaAMcluk",
      "TWZZkcxUKGI",
      "I_-f5HJzHuk",
      "Vr2xySj8XBE",
    ])

    expect(pitonneVideos[0]).toMatchObject({
      slug: "iv-therapy-for-hangover-hydration-and-recovery-support",
      title: "IV Therapy for Hangover Hydration & Recovery Support",
      url: "https://www.youtube.com/watch?v=wDjmsOyulh0",
      thumbnailUrl: "https://i.ytimg.com/vi/wDjmsOyulh0/hqdefault.jpg",
      uploadDate: "2026-06-13T00:00:00.000Z",
      duration: "PT2M14S",
    })
    expect(pitonneVideos[0].description).toContain("Clinic visits are also available with a ¥5,000 discount")

    expect(pitonneVideos[1]).toMatchObject({
      slug: "tokyo-mobile-iv-hotel-home-office",
      title: "東京で訪問点滴を受ける方法｜ホテル・ご自宅・オフィスへお伺いします",
      url: "https://www.youtube.com/watch?v=IGmMAn8K7UY",
      thumbnailUrl: "https://i.ytimg.com/vi/IGmMAn8K7UY/hqdefault.jpg",
      uploadDate: "2026-06-13T00:00:00.000Z",
      duration: "PT2M34S",
    })
    expect(pitonneVideos[1].description).toContain("#MobileIVTokyo")

    expect(pitonneVideos[2]).toMatchObject({
      slug: "how-to-book-a-mobile-iv-at-your-hotel-home-or-office-in-tokyo-ova",
      title: "How to Book a Mobile IV at Your Hotel, Home, or Office in Tokyo",
      url: "https://www.youtube.com/watch?v=ovaSaAMcluk",
      thumbnailUrl: "https://i.ytimg.com/vi/ovaSaAMcluk/hqdefault.jpg",
      uploadDate: "2026-05-26T00:00:00.000Z",
      duration: "PT2M34S",
    })
    expect(pitonneVideos[2].description).toContain("#MobileIVTokyo")

    expect(pitonneVideos[4]).toMatchObject({
      slug: "can-ed-medication-be-prescribed-online-in-japan",
      title: "Can ED Medication Be Prescribed Online in Japan",
      thumbnailUrl: "https://i.ytimg.com/vi/I_-f5HJzHuk/maxresdefault.jpg",
      uploadDate: "2026-05-18T00:00:00.000Z",
      duration: "PT2M5S",
    })
    expect(pitonneVideos[4].description).toContain("ED治療薬が日本でオンライン処方できるのか")
  })

  it("builds watch paths, embed URLs, and lookups from slugs", () => {
    const video = getVideoBySlug("does-a-hangover-iv-really-help")

    expect(video).toMatchObject({
      title: "Does a Hangover IV Really Help",
      watchPath: "/watch/does-a-hangover-iv-really-help/",
      embedUrl: "https://www.youtube-nocookie.com/embed/TWZZkcxUKGI?rel=0&modestbranding=1",
    })
    expect(getVideoBySlug("missing-video")).toBeUndefined()
  })

  it("generates VideoObject, ItemList, and breadcrumb schema", () => {
    const video = pitonneVideos[0]

    expect(videoObjectJsonLd(video)).toMatchObject({
      "@type": "VideoObject",
      name: video.title,
      description: video.description,
      thumbnailUrl: [video.thumbnailUrl],
      uploadDate: "2026-06-13T00:00:00.000Z",
      duration: "PT2M14S",
      embedUrl: "https://www.youtube-nocookie.com/embed/wDjmsOyulh0?rel=0&modestbranding=1",
      url: `${SITE_URL}/watch/${video.slug}/`,
      publisher: { "@id": `${SITE_URL}/#business` },
    })

    const listSchema = videoListJsonLd(pitonneVideos)
    expect(listSchema).toMatchObject({
      "@type": "ItemList",
      name: "Pitonne Videos",
    })
    expect(listSchema.itemListElement).toHaveLength(6)
    expect(listSchema.itemListElement[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      url: `${SITE_URL}/watch/${video.slug}/`,
    })

    expect(videoBreadcrumbJsonLd(video)).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Videos", item: `${SITE_URL}/videos/` },
        { "@type": "ListItem", position: 3, name: video.title, item: `${SITE_URL}/watch/${video.slug}/` },
      ],
    })
  })

  it("renders a videos index and watch page with embedded YouTube players", async () => {
    const videosMarkup = renderToStaticMarkup(
      await VideosPage({ params: Promise.resolve({ locale: "en" }) }),
    )
    const videosMetadata = await videosGenerateMetadata({ params: Promise.resolve({ locale: "en" }) })
    expect(videosMetadata).toMatchObject({
      title: "Videos",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/videos/` }),
    })
    expect(videosMarkup).toContain("Videos")
    expect(videosMarkup).toContain("/watch/does-a-hangover-iv-really-help/")

    const watchMarkup = renderToStaticMarkup(
      await WatchPage({
        params: Promise.resolve({ locale: "en", video: "does-a-hangover-iv-really-help" }),
      }),
    )
    expect(watchMarkup).toContain("https://www.youtube-nocookie.com/embed/TWZZkcxUKGI")
    expect(watchMarkup).toContain("application/ld+json")
  })

  it("generates static params and metadata for watch pages", async () => {
    const staticParams = generateStaticParams()
    const jaParams = staticParams.filter((p) => p.locale === "ja")
    expect(jaParams).toEqual(
      pitonneVideos.map((video) => ({ locale: "ja", video: video.slug })),
    )
    expect(staticParams.some((p) => p.locale === "en")).toBe(false)

    await expect(
      generateMetadata({
        params: Promise.resolve({ locale: "en", video: "does-a-hangover-iv-really-help" }),
      }),
    ).resolves.toMatchObject({
      title: "Does a Hangover IV Really Help",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/watch/does-a-hangover-iv-really-help/` }),
      openGraph: {
        type: "video.other",
        url: `${SITE_URL}/watch/does-a-hangover-iv-really-help/`,
      },
    })
  })

  it("serves a Google video sitemap", async () => {
    const { GET } = await import("@/app/videos-sitemap.xml/route")
    const response = await GET()
    const xml = await response.text()

    expect(response.headers.get("content-type")).toBe("application/xml; charset=utf-8")
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">')
    expect(xml).toContain("<loc>https://pitonne.jp/watch/does-a-hangover-iv-really-help/</loc>")
    expect(xml).toContain("<video:title>Does a Hangover IV Really Help</video:title>")
    expect(xml).toContain("<video:player_loc>https://www.youtube-nocookie.com/embed/TWZZkcxUKGI?rel=0&amp;modestbranding=1</video:player_loc>")
    expect(xml).toContain("<video:duration>94</video:duration>")
    expect(xml).toContain("<video:publication_date>2026-05-18T00:00:00.000Z</video:publication_date>")
  })
})
