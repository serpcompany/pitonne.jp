import type { Metadata } from "next"
import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { JsonLd } from "@/components/shared/json-ld"
import { canonicalRoutes } from "@/lib/data/routes"
import { localizedRoute } from "@/lib/data/routes"
import { pitonneVideos } from "@/lib/data/videos"
import { localizedHreflangAlternates } from "@/lib/seo"
import { videoListJsonLd } from "@/lib/structured-data"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const dict = getDictionary(locale as Locale)

  return {
    title: dict.nav.videos,
    description: dict.videos.metaDescription,
    alternates: localizedHreflangAlternates(canonicalRoutes.videos, locale as Locale),
  }
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function VideosPage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale as Locale)

  return (
    <section className="bg-background">
      <JsonLd data={videoListJsonLd(pitonneVideos)} />
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <Breadcrumbs items={[{ label: dict.nav.home, href: localizedRoute(canonicalRoutes.home, locale as Locale) }, { label: dict.nav.videos }]} />

        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7A8F87]">{dict.videos.watch}</p>
          <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">{dict.videos.pitonneVideos}</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {dict.videos.videosDescription}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pitonneVideos.map((video) => (
            <article key={video.slug} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <Link href={localizedRoute(video.watchPath, locale as Locale)} className="group block">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={video.thumbnailUrl}
                    alt={locale === "ja" && video.titleJa ? video.titleJa : video.title}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition group-hover:bg-black/30">
                    <PlayCircle className="h-12 w-12" aria-hidden="true" />
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-base font-semibold leading-7 text-foreground group-hover:text-[#7A8F87]">
                    {locale === "ja" && video.titleJa ? video.titleJa : video.title}
                  </h2>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
