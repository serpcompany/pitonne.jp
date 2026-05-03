import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPostBySlug as getSanityPost, isSanityConfigured, formatSanityDate, urlFor } from "@/lib/sanity"
import { PortableText } from "@portabletext/react"
import { blogPosts, getBlogPostBySlug, getPostsByCategory } from "@/lib/data/blog-posts"

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
      return {
        title: `${sanityPost.title} | Pitonne Blog`,
        description: sanityPost.excerpt,
      }
    }
  }
  
  // Fallback to static
  const staticPost = getBlogPostBySlug(postSlug)
  if (staticPost) {
    return {
      title: `${staticPost.title} | Pitonne Blog`,
      description: staticPost.excerpt,
    }
  }
  
  return { title: "Post Not Found" }
}

export default async function BlogPostPage({ params }: Props) {
  const { post: postSlug } = await params
  
  // Try Sanity first
  let post: {
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
  } | null = null
  
  if (isSanityConfigured()) {
    const sanityPost = await getSanityPost(postSlug)
    if (sanityPost) {
      post = {
        title: sanityPost.title,
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
        date: new Date(staticPost.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        content: staticPost.content,
        excerpt: staticPost.excerpt,
        readingTime: staticPost.readingTime,
        category: staticPost.category,
        categorySlug: staticPost.categorySlug,
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
  const relatedPosts = getPostsByCategory(post.categorySlug)
    .filter(p => p.slug !== postSlug)
    .slice(0, 3)

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">&gt;</span>
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-foreground">Article</span>
          </nav>
          
          <div className="max-w-3xl">
            <Link 
              href={`/blog/category/${post.categorySlug}`}
              className="inline-block px-3 py-1 text-xs font-medium bg-[#4AA69D] text-white rounded-full mb-4 hover:bg-[#3d8a83] transition-colors"
            >
              {post.category}
            </Link>
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <time>{post.date}</time>
              {post.readingTime && (
                <>
                  <span>&middot;</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-tight">
              {post.title}
            </h1>
            {post.author && (
              <div className="mt-6 flex items-center gap-3">
                {post.author.image ? (
                  <img 
                    src={post.author.image} 
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#4AA69D] flex items-center justify-center text-white font-medium">
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="block text-foreground font-medium">{post.author.name}</span>
                  {post.author.role && (
                    <span className="text-sm text-muted-foreground">{post.author.role}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Image */}
      {post.featureImage && (
        <section className="bg-card">
          <div className="container mx-auto px-4 -mt-8">
            <div className="max-w-4xl mx-auto">
              <img 
                src={post.featureImage} 
                alt={post.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            {post.isSanity && post.sanityBody ? (
              <div className="prose prose-lg prose-gray max-w-none
                prose-headings:font-serif prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:my-1
                prose-strong:text-foreground
                prose-a:text-[#4AA69D] prose-a:no-underline hover:prose-a:underline">
                <PortableText value={post.sanityBody as never[]} />
              </div>
            ) : (
              <div 
                className="prose prose-lg prose-gray max-w-none
                  prose-headings:font-serif prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                  prose-li:my-1
                  prose-strong:text-foreground
                  prose-a:text-[#4AA69D] prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}
          </article>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 md:py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-serif text-foreground mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block bg-background rounded-lg border border-border overflow-hidden hover:shadow-md hover:border-[#4AA69D] transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#d4c4a8]" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(related.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-[#4AA69D] transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">
            Questions About This Topic?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team is here to help you understand your options and determine the best approach for your wellness goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-block bg-[#4AA69D] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              href="/blog"
              className="inline-block border border-foreground text-foreground px-8 py-3 rounded-md text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
