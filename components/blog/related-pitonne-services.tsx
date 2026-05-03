import Link from "next/link"
import { getRelatedServiceSlugsForPost } from "@/lib/data/blog-posts"
import { getServicesFromSlugs } from "@/lib/data/services"

export function RelatedPitonneServices({
  post,
}: {
  post: { slug: string; categorySlug: string; relatedServiceSlugs?: string[] }
}) {
  const relatedServices = getServicesFromSlugs(getRelatedServiceSlugsForPost(post))

  if (relatedServices.length === 0) {
    return null
  }

  return (
    <section className="my-12 rounded-lg border border-border bg-card p-6">
      <h2 className="mb-5 font-serif text-2xl text-foreground">Related Pitonne Services</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {relatedServices.map((service) => (
          <Link
            key={service.slug}
            href={service.canonicalPath}
            className="rounded-lg border border-border bg-background p-4 text-sm font-medium text-foreground transition-colors hover:border-[#4AA69D] hover:text-[#4AA69D]"
          >
            {service.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
