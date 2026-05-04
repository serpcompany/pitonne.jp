import Link from "next/link"
import type { BlogPost } from "@/lib/data/blog-posts"
import type { Service } from "@/lib/data/services"
import { BookingButton } from "@/components/shared/booking-button"

export function ServiceSidebar({
  relatedServices,
  relatedPosts,
}: {
  relatedServices: Service[]
  relatedPosts: BlogPost[]
}) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Book This Service</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Use Pitonne&apos;s booking system to request a consultation and confirm whether this service fits your goals.
        </p>
        <BookingButton className="w-full" />
      </div>

      {relatedServices.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Related Services</h2>
          <ul className="space-y-3">
            {relatedServices.map((service) => (
              <li key={service.slug}>
                <Link href={service.canonicalPath} className="text-sm text-muted-foreground hover:text-[#7A8F87]">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Related Posts</h2>
          <ul className="space-y-4">
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}/`} className="block text-sm font-medium text-foreground hover:text-[#7A8F87]">
                  {post.title}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">{post.readingTime} min read</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
