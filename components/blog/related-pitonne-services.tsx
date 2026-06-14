import Link from "next/link"
import { getRelatedServiceSlugsForPost } from "@/lib/data/blog-posts"
import { getServicesFromSlugs } from "@/lib/data/services"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export function RelatedPitonneServices({
  post,
  locale = "en" as Locale,
}: {
  post: { slug: string; categorySlug: string; relatedServiceSlugs?: string[] }
  locale?: Locale
}) {
  const dict = getDictionary(locale)
  const relatedServices = getServicesFromSlugs(getRelatedServiceSlugsForPost(post), locale)

  if (relatedServices.length === 0) {
    return null
  }

  return (
    <section className="my-12 rounded-lg border border-border bg-card p-6">
      <h2 className="mb-5 font-serif text-2xl text-foreground">{dict.blog.relatedPitonneServices}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {relatedServices.map((service) => (
          <Link
            key={service.slug}
            href={localizedRoute(service.canonicalPath, locale)}
            className="rounded-lg border border-border bg-background p-4 text-sm font-medium text-foreground transition-colors hover:border-[#7A8F87] hover:text-[#7A8F87]"
          >
            {service.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
