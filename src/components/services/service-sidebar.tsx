import Link from "next/link"
import type { BlogPost } from "@/lib/data/blog-posts"
import type { Service } from "@/lib/data/services"
import { BookingButton } from "@/components/shared/booking-button"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export function ServiceSidebar({
  relatedServices,
  relatedPosts,
  locale = "en" as Locale,
}: {
  relatedServices: Service[]
  relatedPosts: BlogPost[]
  locale?: Locale
}) {
  const dict = getDictionary(locale)
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{dict.services.bookThisService}</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          {dict.services.bookServiceDescription}
        </p>
        <BookingButton className="w-full" locale={locale} />
      </div>

      {relatedServices.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{dict.services.relatedServices}</h2>
          <ul className="space-y-3">
            {relatedServices.map((service) => (
              <li key={service.slug}>
                <Link href={localizedRoute(service.canonicalPath, locale)} className="text-sm text-muted-foreground hover:text-[#7A8F87]">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{dict.services.relatedPosts}</h2>
          <ul className="space-y-4">
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link href={localizedRoute(`/blog/${post.slug}/`, locale)} className="block text-sm font-medium text-foreground hover:text-[#7A8F87]">
                  {post.title}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">{post.readingTime} {dict.common.minRead}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
