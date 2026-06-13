import { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPostTemplate, type BlogPostViewModel } from "@/components/blog/blog-post-template"
import { blogPosts, getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/lib/data/blog-posts"
import { getServicesFromSlugs } from "@/lib/data/services"
import { absoluteUrl, canonicalUrl } from "@/lib/seo"

interface Props {
  params: Promise<{ post: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ post: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post: postSlug } = await params
  
  const post = getBlogPostBySlug(postSlug)
  if (post) {
    return {
      title: post.title,
      description: post.excerpt,
      alternates: {
        canonical: canonicalUrl(`/blog/${post.slug}/`),
      },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: canonicalUrl(`/blog/${post.slug}/`),
        type: "article",
        publishedTime: post.publishedAt,
        images: post.featureImage ? [absoluteUrl(post.featureImage)] : undefined,
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
  const { post: postSlug } = await params

  const staticPost = getBlogPostBySlug(postSlug)
  const post: BlogPostViewModel | null = staticPost
    ? {
        title: staticPost.title,
        slug: staticPost.slug,
        publishedAt: staticPost.publishedAt,
        date: new Date(staticPost.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
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
  const relatedPosts = getBlogPostsByCategory(post.categorySlug)
    .filter(p => p.slug !== postSlug)
    .slice(0, 3)

  // Resolve related services from frontmatter slugs
  const relatedServices = getServicesFromSlugs(post.relatedServiceSlugs ?? [])

  return (
    <BlogPostTemplate
      post={post}
      relatedPosts={relatedPosts}
      relatedServices={relatedServices}
      latestPosts={getAllBlogPosts().filter((candidate) => candidate.slug !== postSlug)}
    />
  )
}
