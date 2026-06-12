import { RelatedPitonneServices } from "@/components/blog/related-pitonne-services"
import { ContactButton } from "@/components/shared/contact-button"

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
        <ContactButton />
      </section>
    </>
  )
}
