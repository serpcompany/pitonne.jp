import Link from "next/link"
import { RelatedPitonneServices } from "@/components/blog/related-pitonne-services"

export function BlogDiscoverySection({
  post,
}: {
  post: { slug: string; categorySlug: string; relatedServiceSlugs?: string[] }
}) {
  return (
    <>
      <RelatedPitonneServices post={post} />
      <section className="my-12 rounded-lg bg-[#faf9f7] p-6">
        <h2 className="mb-4 font-serif text-2xl text-foreground">Contact Pitonne</h2>
        <p className="mb-5 text-muted-foreground">
          Contact Pitonne to discuss clinician-guided wellness options and whether a service is appropriate for your goals.
        </p>
        <Link
          href="/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md bg-[#7A8F87] px-6 py-3 text-sm font-medium text-white hover:bg-[#245f5a]"
        >
          Contact Us
        </Link>
      </section>
    </>
  )
}
