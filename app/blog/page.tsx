import Link from "next/link"
import type { Metadata } from "next"
import { getPosts, isSanityConfigured, formatSanityDate, urlFor } from "@/lib/sanity"
import { blogPosts, getAllCategories } from "@/lib/data/blog-posts"

export const metadata: Metadata = {
  title: "Blog | Pitonne Stem Cell & IV Therapy Tokyo",
  description: "Read the latest articles about IV therapy, stem cell treatments, wellness tips, and health insights from Pitonne in Tokyo.",
}

export default async function BlogPage() {
  // Try to fetch from Sanity, fallback to static posts
  const sanityConfigured = isSanityConfigured()
  const sanityPosts = sanityConfigured ? await getPosts() : []
  
  // Use Sanity posts if available, otherwise use static posts
  const posts = sanityPosts.length > 0 
    ? sanityPosts.map(post => ({
        slug: post.slug.current,
        title: post.title,
        date: formatSanityDate(post.publishedAt),
        excerpt: post.excerpt || "",
        readingTime: post.estimatedReadingTime,
        featureImage: post.mainImage ? urlFor(post.mainImage).width(600).height(400).url() : undefined,
        category: post.categories?.[0]?.title || "Wellness",
      }))
    : blogPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        date: new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        excerpt: post.excerpt,
        readingTime: post.readingTime,
        featureImage: post.featureImage,
        category: post.category,
      }))

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden py-16 lg:py-20">
        <div className="absolute right-0 top-10 w-24 h-32 opacity-30">
          <svg viewBox="0 0 100 130" className="w-full h-full text-[#d4c4a8]">
            <path d="M50 10 Q70 40 60 70 Q50 100 50 120" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M55 30 Q70 40 65 55" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M45 60 Q30 75 40 90" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-foreground">Blog</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Blog</h1>
          <p className="max-w-3xl text-muted-foreground text-lg">
            Insights on IV therapy, stem cell treatments, and wellness from the Pitonne team. We share educational content to help you make informed decisions about your health.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">Categories:</span>
            <Link 
              href="/blog"
              className="px-4 py-1.5 text-sm rounded-full bg-[#4AA69D] text-white"
            >
              All
            </Link>
            {getAllCategories().map(cat => (
              <Link 
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="px-4 py-1.5 text-sm rounded-full border border-border hover:border-[#4AA69D] hover:text-[#4AA69D] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block max-w-5xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8]">
                  {featuredPost.featureImage ? (
                    <img 
                      src={featuredPost.featureImage} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-white/50 flex items-center justify-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-[#d4c4a8]" />
                        </div>
                        <span className="text-sm text-muted-foreground">Featured Article</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-[#f5ebe0] text-foreground rounded-full mb-4">
                    Featured
                  </span>
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                    <span className="text-[#4AA69D]">{featuredPost.category}</span>
                    <span>&middot;</span>
                    <time>{featuredPost.date}</time>
                    {featuredPost.readingTime && (
                      <>
                        <span>&middot;</span>
                        <span>{featuredPost.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4 group-hover:text-[#4AA69D] transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <span className="text-[#4AA69D] font-medium group-hover:underline">
                    Read Article &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-serif text-foreground mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
            {otherPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-[#4AA69D] transition-all"
              >
                {post.featureImage ? (
                  <div className="aspect-video bg-[#f5ebe0] overflow-hidden">
                    <img 
                      src={post.featureImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#d4c4a8]" />
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                    <span className="text-[#4AA69D]">{post.category}</span>
                    <span>&middot;</span>
                    <time>{post.date}</time>
                    {post.readingTime && (
                      <>
                        <span>&middot;</span>
                        <span>{post.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#4AA69D] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-foreground mb-6">Stay Informed</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            Have questions about our services? Contact us to learn more about IV therapy, stem cell treatments, and wellness support in Tokyo.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-[#4AA69D] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#3d8a83] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
