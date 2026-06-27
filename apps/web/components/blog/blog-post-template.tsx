import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { PageHero } from "@/components/shared/page-hero"
import { JsonLd } from "@/components/shared/json-ld"
import { BlogDiscoverySection } from "@/components/blog/blog-discovery-section"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import type { BlogPost } from "@/lib/data/blog-posts"
import type { Service } from "@/lib/data/services"
import { blogPostingJsonLd } from "@/lib/structured-data"
import type { Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export interface BlogPostViewModel {
  slug: string
  title: string
  date: string
  publishedAt?: string
  content: string
  excerpt: string
  featureImage?: string | null
  readingTime?: number
  category: string
  categorySlug: string
  author?: { name: string; role?: string; image?: string | null } | null
  relatedServiceSlugs?: string[]
  tags?: string[]
}

function splitFinalTakeaway(content: string) {
  const marker = /^##\s+Final Takeaway\s*$/im
  const match = content.match(marker)

  if (!match || match.index === undefined) {
    return { before: content, final: "" }
  }

  return {
    before: content.slice(0, match.index).trim(),
    final: content.slice(match.index).trim(),
  }
}

function MarkdownContent({ content }: { content: string }) {
  const parts = splitVideoEmbeds(content)

  return (
    <>
      {parts.map((part, index) =>
        part.type === "video" ? (
          <VideoEmbed key={`${part.url}-${index}`} title={part.title} url={part.url} />
        ) : (
          <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
            {part.content}
          </ReactMarkdown>
        ),
      )}
    </>
  )
}

type MarkdownPart = { content: string; type: "markdown" } | { title?: string; type: "video"; url: string }

function splitVideoEmbeds(content: string): MarkdownPart[] {
  const parts: MarkdownPart[] = []
  const videoFencePattern = /```video\s*\n([\s\S]*?)\n```/g
  let lastIndex = 0

  for (const match of content.matchAll(videoFencePattern)) {
    if (match.index === undefined) {
      continue
    }

    const markdown = content.slice(lastIndex, match.index).trim()
    if (markdown) {
      parts.push({ type: "markdown", content: markdown })
    }

    try {
      const parsed = JSON.parse(match[1]) as { title?: unknown; url?: unknown }
      if (typeof parsed.url === "string" && parsed.url.trim()) {
        parts.push({
          type: "video",
          title: typeof parsed.title === "string" ? parsed.title : undefined,
          url: parsed.url,
        })
      }
    } catch {
      parts.push({ type: "markdown", content: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  const trailing = content.slice(lastIndex).trim()
  if (trailing) {
    parts.push({ type: "markdown", content: trailing })
  }

  return parts.length > 0 ? parts : [{ type: "markdown", content }]
}

function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.toString()
      }

      const id = parsed.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : null
    }

    if (host === "player.vimeo.com" && parsed.pathname.startsWith("/video/")) {
      return parsed.toString()
    }
  } catch {
    return null
  }

  return null
}

function VideoEmbed({ title, url }: { title?: string; url: string }) {
  const embedUrl = getVideoEmbedUrl(url)
  const label = title || "Embedded video"

  if (!embedUrl) {
    return (
      <p>
        <a href={url}>{label}</a>
      </p>
    )
  }

  return (
    <figure className="my-8">
      <div className="aspect-video overflow-hidden rounded-lg border border-border bg-black">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embedUrl}
          title={label}
        />
      </div>
      {title ? <figcaption className="mt-2 text-sm text-muted-foreground">{title}</figcaption> : null}
    </figure>
  )
}

function BlogContent({ post, locale = "en" as Locale }: { post: BlogPostViewModel; locale?: Locale }) {
  const content = splitFinalTakeaway(post.content)

  return (
    <div className="blog-prose">
      <MarkdownContent content={content.before} />
      <BlogDiscoverySection post={post} locale={locale} />
      {content.final ? <MarkdownContent content={content.final} /> : null}
    </div>
  )
}

function LatestPostsSection({ latestPosts, locale = "en" as Locale }: { latestPosts: BlogPost[]; locale?: Locale }) {
  const dict = getDictionary(locale)
  if (latestPosts.length === 0) {
    return null
  }

  return (
    <section className="border-t border-border bg-card py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 font-serif text-2xl text-foreground">{dict.blog.readOurLatestPosts}</h2>
        <div className="grid max-w-5xl gap-6 md:grid-cols-3">
          {latestPosts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={localizedRoute(`/blog/${post.slug}/`, locale)}
              className="group block rounded-lg border border-border bg-background p-5 transition-all hover:border-[#7A8F87] hover:shadow-md"
            >
              <p className="mb-2 text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-[#7A8F87]">{post.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BlogPostTemplate({
  post,
  relatedPosts,
  relatedServices,
  latestPosts,
  locale = "en" as Locale,
}: {
  post: BlogPostViewModel
  relatedPosts: BlogPost[]
  relatedServices: Service[]
  latestPosts: BlogPost[]
  locale?: Locale
}) {
  const dict = getDictionary(locale)
  return (
    <div className="bg-background">
      {post.author && (
        <JsonLd
          data={blogPostingJsonLd({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            publishedAt: post.publishedAt ?? post.date,
            featureImage: post.featureImage || undefined,
            author: {
              name: post.author.name,
              role: post.author.role ?? "",
            },
          }, locale)}
        />
      )}

      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", locale) },
          { label: dict.blog.blog, href: localizedRoute("/blog/", locale) },
          { label: dict.blog.article },
        ]}
        eyebrow={
          <Link
            href={localizedRoute(`/blog/category/${post.categorySlug}/`, locale)}
            className="inline-block rounded-full bg-[#7A8F87] px-3 py-1 text-xs font-medium normal-case tracking-normal text-white transition-colors hover:bg-[#245f5a]"
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
                <span>{post.readingTime} {dict.common.minRead}</span>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7A8F87] font-medium text-white">
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
            <div className="mx-auto max-w-4xl lg:max-w-none lg:px-0">
              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
                <img src={post.featureImage} alt={post.title} className="max-h-[420px] w-full rounded-lg object-cover shadow-lg" />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="min-w-0">
              <BlogContent post={post} locale={locale} />
            </article>

            <BlogSidebar relatedServices={relatedServices} relatedPosts={relatedPosts} locale={locale} />
          </div>
        </div>
      </section>

      <LatestPostsSection latestPosts={latestPosts} locale={locale} />
    </div>
  )
}
