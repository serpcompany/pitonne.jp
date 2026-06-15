import { RelatedPitonneServices } from "@/components/blog/related-pitonne-services"
import { ContactButton } from "@/components/shared/contact-button"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"

export function BlogDiscoverySection({
  post,
  locale = "en" as Locale,
}: {
  post: { slug: string; categorySlug: string; relatedServiceSlugs?: string[] }
  locale?: Locale
}) {
  const dict = getDictionary(locale)
  return (
    <>
      <RelatedPitonneServices post={post} locale={locale} />
      <section className="my-12 rounded-lg bg-[#faf9f7] p-6">
        <h2 className="mb-4 font-serif text-2xl text-foreground">{dict.blog.contactPitonne}</h2>
        <p className="mb-5 text-muted-foreground">
          {dict.blog.contactDescription}
        </p>
        <ContactButton locale={locale} />
      </section>
    </>
  )
}
