import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug as getSanityPost, isSanityConfigured, formatSanityDate, urlFor } from "@/lib/sanity"
import { BlogPostTemplate, type BlogPostViewModel } from "@/components/blog/blog-post-template"
import { blogPosts, getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/lib/data/blog-posts"
import { absoluteUrl, canonicalUrl } from "@/lib/seo"

interface Props {
  params: Promise<{ post: string }>
}

export async function generateStaticParams() {
  // Combine Sanity slugs (if configured) with static post slugs
  const staticSlugs = blogPosts.map(p => p.slug)
  return staticSlugs.map((post) => ({ post }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post: postSlug } = await params
  
  // Try Sanity first
  if (isSanityConfigured()) {
    const sanityPost = await getSanityPost(postSlug)
    if (sanityPost) {
      const image = sanityPost.mainImage ? urlFor(sanityPost.mainImage).width(1200).height(630).url() : undefined
      return {
        title: sanityPost.title,
        description: sanityPost.excerpt,
        alternates: {
          canonical: canonicalUrl(`/blog/${postSlug}/`),
        },
        openGraph: {
          title: sanityPost.title,
          description: sanityPost.excerpt,
          url: canonicalUrl(`/blog/${postSlug}/`),
          type: "article",
          images: image ? [image] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: sanityPost.title,
          description: sanityPost.excerpt,
          images: image ? [image] : undefined,
        },
      }
    }
  }
  
  // Fallback to static
  const staticPost = getBlogPostBySlug(postSlug)
  if (staticPost) {
    return {
      title: staticPost.title,
      description: staticPost.excerpt,
      alternates: {
        canonical: canonicalUrl(`/blog/${staticPost.slug}/`),
      },
      openGraph: {
        title: staticPost.title,
        description: staticPost.excerpt,
        url: canonicalUrl(`/blog/${staticPost.slug}/`),
        type: "article",
        publishedTime: staticPost.publishedAt,
        images: staticPost.featureImage ? [absoluteUrl(staticPost.featureImage)] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: staticPost.title,
        description: staticPost.excerpt,
        images: staticPost.featureImage ? [absoluteUrl(staticPost.featureImage)] : undefined,
      },
    }
  }
  
  return { title: "Post Not Found" }
}

export default async function BlogPostPage({ params }: Props) {
  const { post: postSlug } = await params
  
  // Try Sanity first
  let post: BlogPostViewModel | null = null
  
  if (isSanityConfigured()) {
    const sanityPost = await getSanityPost(postSlug)
    if (sanityPost) {
      post = {
        title: sanityPost.title,
        slug: postSlug,
        date: formatSanityDate(sanityPost.publishedAt),
        content: "",
        sanityBody: sanityPost.body,
        isSanity: true,
        excerpt: sanityPost.excerpt || "",
        featureImage: sanityPost.mainImage ? urlFor(sanityPost.mainImage).width(1200).height(630).url() : null,
        readingTime: sanityPost.estimatedReadingTime,
        category: sanityPost.categories?.[0]?.title || "Wellness",
        categorySlug: sanityPost.categories?.[0]?.slug?.current || "wellness",
        author: sanityPost.author ? {
          name: sanityPost.author.name,
          image: sanityPost.author.image ? urlFor(sanityPost.author.image).width(80).height(80).url() : null,
        } : null,
      }
    }
  }
  
  // Fallback to static
  if (!post) {
    const staticPost = getBlogPostBySlug(postSlug)
    if (staticPost) {
      post = {
        title: staticPost.title,
        slug: staticPost.slug,
        date: new Date(staticPost.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
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
    }
  }
  
  if (!post) {
    notFound()
  }

  // Get related posts from same category
  const relatedPosts = getBlogPostsByCategory(post.categorySlug)
    .filter(p => p.slug !== postSlug)
    .slice(0, 3)

  return (
    <BlogPostTemplate
      post={post}
      relatedPosts={relatedPosts}
      latestPosts={getAllBlogPosts().filter((candidate) => candidate.slug !== postSlug)}
    />
  )
}
