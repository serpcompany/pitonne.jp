import Link from "next/link"
import { PortableText } from "@portabletext/react"
import { PageHero } from "@/components/shared/page-hero"
import { BlogDiscoverySection } from "@/components/blog/blog-discovery-section"
import type { BlogPost } from "@/lib/data/blog-posts"

export interface BlogPostViewModel {
  slug: string
  title: string
  date: string
  content: string
  excerpt: string
  featureImage?: string | null
  readingTime?: number
  category: string
  categorySlug: string
  author?: { name: string; role?: string; image?: string | null } | null
  isSanity?: boolean
  sanityBody?: unknown[]
  relatedServiceSlugs?: string[]
  tags?: string[]
}

function splitFinalTakeaway(content: string) {
  const marker = /<h2>\s*Final Takeaway\s*<\/h2>/i
  const parts = content.split(marker)

  if (parts.length < 2) {
    return { before: content, final: "" }
  }

  return {
    before: parts[0],
    final: `<h2>Final Takeaway</h2>${parts.slice(1).join("<h2>Final Takeaway</h2>")}`,
  }
}

function BlogContent({ post }: { post: BlogPostViewModel }) {
  if (post.isSanity && post.sanityBody) {
    return (
      <div className="blog-prose">
        <PortableText value={post.sanityBody as never[]} />
        <BlogDiscoverySection post={post} />
      </div>
    )
  }

  const content = splitFinalTakeaway(post.content)

  return (
    <div className="blog-prose">
      <div dangerouslySetInnerHTML={{ __html: content.before }} />
      <BlogDiscoverySection post={post} />
      {content.final ? <div dangerouslySetInnerHTML={{ __html: content.final }} /> : null}
    </div>
  )
}

function ShareRow({ post }: { post: BlogPostViewModel }) {
  const postUrl = `/blog/${post.slug}/`

  return (
    <div className="mt-10 border-t border-border pt-6">
      <p className="mb-3 text-sm font-semibold text-foreground">Share This</p>
      <div className="flex flex-wrap gap-3">
        <Link href={`https://twitter.com/intent/tweet?url=${postUrl}`} className="text-sm text-[#4AA69D] hover:underline">
          X
        </Link>
        <Link href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`} className="text-sm text-[#4AA69D] hover:underline">
          Facebook
        </Link>
        <Link href="/blog/" className="text-sm text-[#4AA69D] hover:underline">
          Blog
        </Link>
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function LatestPostsSection({ latestPosts }: { latestPosts: BlogPost[] }) {
  if (latestPosts.length === 0) {
    return null
  }

  return (
    <section className="border-t border-border bg-card py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 font-serif text-2xl text-foreground">Read Our Latest Posts</h2>
        <div className="grid max-w-5xl gap-6 md:grid-cols-3">
          {latestPosts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="group block rounded-lg border border-border bg-background p-5 transition-all hover:border-[#4AA69D] hover:shadow-md"
            >
              <p className="mb-2 text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-[#4AA69D]">{post.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BlogPostTemplate({
  post,
  latestPosts,
}: {
  post: BlogPostViewModel
  relatedPosts: BlogPost[]
  latestPosts: BlogPost[]
}) {
  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog/" },
          { label: "Article" },
        ]}
        eyebrow={
          <Link
            href={`/blog/category/${post.categorySlug}/`}
            className="inline-block rounded-full bg-[#4AA69D] px-3 py-1 text-xs font-medium normal-case tracking-normal text-white transition-colors hover:bg-[#3d8a83]"
          >
            {post.category}
          </Link>
        }
        meta={
          <div className="flex items-center gap-4">
            <time>{post.date}</time>
            {post.readingTime && (
              <>
                <span>&middot;</span>
                <span>{post.readingTime} min read</span>
              </>
            )}
          </div>
        }
        title={post.title}
      >
        {post.author && (
          <div className="flex items-center gap-3">
            {post.author.image ? (
              <img src={post.author.image} alt={post.author.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4AA69D] font-medium text-white">
                {post.author.name.charAt(0)}
              </div>
            )}
            <div>
              <span className="block font-medium text-foreground">{post.author.name}</span>
              {post.author.role && <span className="text-sm text-muted-foreground">{post.author.role}</span>}
            </div>
          </div>
        )}
      </PageHero>

      {post.featureImage && (
        <section className="bg-card">
          <div className="container mx-auto -mt-8 px-4">
            <div className="mx-auto max-w-4xl">
              <img src={post.featureImage} alt={post.title} className="w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <article className="mx-auto max-w-3xl">
            <BlogContent post={post} />
            <ShareRow post={post} />
          </article>
        </div>
      </section>

      <LatestPostsSection latestPosts={latestPosts} />
    </div>
  )
}
