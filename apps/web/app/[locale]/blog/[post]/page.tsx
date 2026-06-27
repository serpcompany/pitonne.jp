import { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPostTemplate, type BlogPostViewModel } from "@/components/blog/blog-post-template"
import { getAllBlogPostsWithCms, getBlogPostBySlugWithCms, getBlogPostsByCategoryWithCms } from "@/lib/data/blog-posts"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { getServicesFromSlugs } from "@/lib/data/services"
import { absoluteUrl, localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"

export const dynamicParams = false

interface Props {
  params: Promise<{ locale: string; post: string }>
}

export async function generateStaticParams() {
  const params = await Promise.all(
    nonDefaultLocales.map(async (locale) =>
      (await getAllBlogPostsWithCms(locale)).map((post) => ({ locale, post: post.slug })),
    ),
  )

  return params.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, post: postSlug } = await params
  const typedLocale = locale as Locale

  const post = await getBlogPostBySlugWithCms(postSlug, typedLocale)
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

  return { title: getDictionary(typedLocale).common.notFoundPost }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, post: postSlug } = await params
  const typedLocale = locale as Locale
  const dateLocale = locale === "ja" ? "ja-JP" : "en-US"

  const sourcePost = await getBlogPostBySlugWithCms(postSlug, typedLocale)
  const post: BlogPostViewModel | null = sourcePost
    ? {
        title: sourcePost.title,
        slug: sourcePost.slug,
        publishedAt: sourcePost.publishedAt,
        date: new Date(sourcePost.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" }),
        content: sourcePost.content,
        excerpt: sourcePost.excerpt,
        featureImage: sourcePost.featureImage,
        readingTime: sourcePost.readingTime,
        category: sourcePost.category,
        categorySlug: sourcePost.categorySlug,
        relatedServiceSlugs: sourcePost.relatedServiceSlugs,
        tags: sourcePost.tags,
        author: {
          name: sourcePost.author.name,
          role: sourcePost.author.role,
        },
      }
    : null

  if (!post) {
    notFound()
  }

  // Get related posts from same category
  const relatedPosts = (await getBlogPostsByCategoryWithCms(post.categorySlug, typedLocale))
    .filter(p => p.slug !== postSlug)
    .slice(0, 3)

  // Resolve related services from frontmatter slugs
  const relatedServices = getServicesFromSlugs(post.relatedServiceSlugs ?? [], typedLocale)

  return (
    <BlogPostTemplate
      post={post}
      relatedPosts={relatedPosts}
      relatedServices={relatedServices}
      latestPosts={(await getAllBlogPostsWithCms(typedLocale)).filter((candidate) => candidate.slug !== postSlug)}
      locale={typedLocale}
    />
  )
}
