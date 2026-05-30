import type { Metadata } from "next"
import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { JsonLd } from "@/components/shared/json-ld"
import { canonicalRoutes } from "@/lib/data/routes"
import { pitonneVideos } from "@/lib/data/videos"
import { canonicalUrl } from "@/lib/seo"
import { videoListJsonLd } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: "Videos",
  description: "Watch Pitonne videos about mobile IV therapy, hangover IV support, and wellness care in Tokyo.",
  alternates: {
    canonical: canonicalUrl(canonicalRoutes.videos),
  },
}

export default function VideosPage() {
  return (
    <section className="bg-background">
      <JsonLd data={videoListJsonLd(pitonneVideos)} />
      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
        <Breadcrumbs items={[{ label: "Home", href: canonicalRoutes.home }, { label: "Videos" }]} />

        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7A8F87]">Watch</p>
          <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">Pitonne Videos</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Doctor-led videos from Pitonne covering mobile IV therapy, hangover IV support, and private wellness care in Tokyo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pitonneVideos.map((video) => (
            <article key={video.slug} className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <Link href={video.watchPath} className="group block">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition group-hover:bg-black/30">
                    <PlayCircle className="h-12 w-12" aria-hidden="true" />
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-base font-semibold leading-7 text-foreground group-hover:text-[#7A8F87]">
                    {video.title}
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
