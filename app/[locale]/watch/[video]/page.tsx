import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { JsonLd } from "@/components/shared/json-ld"
import { canonicalRoutes, localizedRoute } from "@/lib/data/routes"
import { getVideoBySlug, pitonneVideos, type PitonneVideo } from "@/lib/data/videos"
import { absoluteUrl, localizedHreflangAlternates, SITE_NAME } from "@/lib/seo"
import { videoBreadcrumbJsonLd, videoObjectJsonLd } from "@/lib/structured-data"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

type WatchPageParams = {
  locale: string
  video: string
}

export function generateStaticParams(): WatchPageParams[] {
  return locales.flatMap((locale) =>
    pitonneVideos.map((video) => ({ locale, video: video.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<WatchPageParams>
}): Promise<Metadata> {
  const { locale, video: slug } = await params
  const video = getVideoBySlug(slug)

  if (!video) {
    return {
      title: "Video Not Found",
    }
  }

  const alternates = localizedHreflangAlternates(video.watchPath, locale as Locale)

  return {
    title: video.title,
    description: video.description,
    alternates,
    openGraph: {
      type: "video.other",
      url: alternates.canonical,
      title: video.title,
      description: video.description,
      siteName: SITE_NAME,
      images: [
        {
          url: absoluteUrl(video.thumbnailUrl),
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: video.description,
      images: [absoluteUrl(video.thumbnailUrl)],
    },
  }
}

interface Props {
  params: Promise<WatchPageParams>
}

export default async function WatchPage({ params }: Props) {
  const { locale, video: slug } = await params
  const dict = getDictionary(locale as Locale)
  const video = getVideoBySlug(slug)

  if (!video) {
    notFound()
  }

  const relatedVideos = pitonneVideos.filter((item) => item.slug !== video.slug).slice(0, 3)

  return (
    <article className="bg-background">
      <JsonLd data={videoObjectJsonLd(video)} />
      <JsonLd data={videoBreadcrumbJsonLd(video)} />
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <Breadcrumbs
          items={[
            { label: dict.nav.home, href: localizedRoute(canonicalRoutes.home, locale as Locale) },
            { label: dict.nav.videos, href: localizedRoute(canonicalRoutes.videos, locale as Locale) },
            { label: video.title },
          ]}
        />

        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7A8F87]">{dict.videos.pitonneVideo}</p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {video.title}
            </h1>
          </header>

          <VideoEmbed video={video} />

          {relatedVideos.length > 0 && (
            <section className="mt-12" aria-labelledby="more-videos">
              <h2 id="more-videos" className="font-serif text-2xl font-bold text-foreground">
                {dict.videos.moreVideos}
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {relatedVideos.map((related) => (
                  <Link
                    key={related.slug}
                    href={localizedRoute(related.watchPath, locale as Locale)}
                    className="group overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:border-[#7A8F87]"
                  >
                    <div className="aspect-video bg-muted">
                      <img
                        src={related.thumbnailUrl}
                        alt={related.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-sm font-semibold leading-6 text-foreground group-hover:text-[#7A8F87]">
                        {related.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  )
}

function VideoEmbed({ video }: { video: PitonneVideo }) {
  return (
    <div className="overflow-hidden rounded-lg bg-black shadow-lg">
      <iframe
        src={video.embedUrl}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full"
      />
    </div>
  )
}
