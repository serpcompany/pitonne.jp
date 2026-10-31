import Link from "next/link"
import { getAllBlogPosts } from "@/lib/data/blog-posts"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export function LatestPostsSection({ count = 3, locale = "en" as Locale }: { count?: number; locale?: Locale }) {
  const dict = getDictionary(locale)
  const posts = getAllBlogPosts(locale).slice(0, count)

  if (posts.length === 0) return null

  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7A8F87] mb-4">
            {dict.blog.blog}
          </p>
          <h2 className="text-3xl md:text-4xl font-serif">
            {dict.blog.readOurLatestPosts}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-0">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={localizedRoute(`/blog/${post.slug}/`, locale)}
              className="block group"
            >
              <div className="flex items-start gap-4 py-5 border-b border-border">
                <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 w-24 shrink-0">
                  {new Date(post.publishedAt).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <h3 className="text-base md:text-lg font-medium group-hover:text-[#7A8F87] transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href={localizedRoute("/blog/", locale)}
            className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            {dict.blog.viewAllPosts}
          </Link>
        </div>
      </div>
    </section>
  )
}
