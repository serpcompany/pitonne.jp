import { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPostTemplate, type BlogPostViewModel } from "@/components/blog/blog-post-template"
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/lib/data/blog-posts"
import { getServicesFromSlugs } from "@/lib/data/services"
import { absoluteUrl, localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"

interface Props {
  params: Promise<{ locale: string; post: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAllBlogPosts(locale).map((post) => ({ locale, post: post.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, post: postSlug } = await params
  const typedLocale = locale as Locale

  const post = getBlogPostBySlug(postSlug, typedLocale)
  if (post) {
    return {
      title: post.title,
      description: post.excerpt,
      alternates: localizedHreflangAlternates(`/blog/${post.slug}/`, typedLocale),
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: localizedCanonicalUrl(`/blog/${post.slug}/`, typedLocale),
        type: "article",
        publishedTime: post.publishedAt,
        images: post.featureImage ? [absoluteUrl(post.featureImage)] : undefined,
        locale: locale === "ja" ? "ja_JP" : "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: post.featureImage ? [absoluteUrl(post.featureImage)] : undefined,
      },
    }
  }

  return { title: "Post Not Found" }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, post: postSlug } = await params
  const typedLocale = locale as Locale
  const dateLocale = locale === "ja" ? "ja-JP" : "en-US"

  const staticPost = getBlogPostBySlug(postSlug, typedLocale)
  const post: BlogPostViewModel | null = staticPost
    ? {
        title: staticPost.title,
        slug: staticPost.slug,
        publishedAt: staticPost.publishedAt,
        date: new Date(staticPost.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" }),
        content: staticPost.content,
        excerpt: staticPost.excerpt,
        featureImage: staticPost.featureImage,
        readingTime: staticPost.readingTime,
        category: staticPost.category,
        categorySlug: staticPost.categorySlug,
        relatedServiceSlugs: staticPost.relatedServiceSlugs,
        tags: staticPost.tags,
        author: {
          name: staticPost.author.name,
          role: staticPost.author.role,
        },
      }
    : null

  if (!post) {
    notFound()
  }

  // Get related posts from same category
  const relatedPosts = getBlogPostsByCategory(post.categorySlug, typedLocale)
    .filter(p => p.slug !== postSlug)
    .slice(0, 3)

  // Resolve related services from frontmatter slugs
  const relatedServices = getServicesFromSlugs(post.relatedServiceSlugs ?? [], typedLocale)

  return (
    <BlogPostTemplate
      post={post}
      relatedPosts={relatedPosts}
      relatedServices={relatedServices}
      latestPosts={getAllBlogPosts(typedLocale).filter((candidate) => candidate.slug !== postSlug)}
    />
  )
}
