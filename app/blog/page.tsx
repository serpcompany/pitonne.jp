import Link from "next/link"
import type { Metadata } from "next"
import { getPosts, isGhostConfigured, formatGhostDate } from "@/lib/ghost"

export const metadata: Metadata = {
  title: "Blog | Pitonne Stem Cell & IV Therapy Tokyo",
  description: "Read the latest articles about IV therapy, stem cell treatments, wellness tips, and health insights from Pitonne in Tokyo.",
}

// Static fallback posts when Ghost is not configured
const staticPosts = [
  {
    slug: "exosome-iv-drip",
    title: "What Is An Exosome IV Drip? Differences From Stem Cell Conditioned Media, Cost, And Risks Explained",
    date: "April 29, 2026",
    excerpt: "Learn about exosome IV drips, how they differ from stem cell conditioned media, what to expect in terms of cost, and potential risks to consider.",
  },
  {
    slug: "iv-therapy-fatigue",
    title: "IV Therapy For Fatigue: When Low Energy May Point To Hydration Support",
    date: "March 16, 2026",
    excerpt: "Explore how IV therapy may help with fatigue and low energy, and when hydration support could be beneficial for your wellness.",
  },
  {
    slug: "iv-therapy-hangover",
    title: "IV Therapy For Hangover: What It May Help With And What It Cannot Do",
    date: "March 16, 2026",
    excerpt: "Understand how hangover IV therapy works, what symptoms it may address, and realistic expectations for recovery.",
  },
  {
    slug: "stem-cell-nasal-spray",
    title: "Stem Cell Nasal Spray: A Convenient Approach to Regenerative Wellness",
    date: "February 28, 2026",
    excerpt: "Discover how stem cell nasal sprays work and their potential role in supporting cognitive wellness and daily recovery.",
  },
  {
    slug: "iv-vitamin-therapy-benefits",
    title: "IV Vitamin Therapy: Understanding Direct Nutrient Delivery",
    date: "February 15, 2026",
    excerpt: "Learn about IV vitamin therapy, how direct nutrient delivery works, and who may benefit from this approach to wellness.",
  },
  {
    slug: "immune-boost-iv",
    title: "Immune Boost IV Therapy: Supporting Your Body's Natural Defenses",
    date: "January 30, 2026",
    excerpt: "Explore how immune boost IV therapy may support your immune system and when it might be appropriate to consider.",
  },
]

export default async function BlogPage() {
  // Try to fetch from Ghost, fallback to static posts
  const ghostConfigured = isGhostConfigured()
  const ghostPosts = ghostConfigured ? await getPosts(20) : []
  
  // Use Ghost posts if available, otherwise use static posts
  const posts = ghostPosts.length > 0 
    ? ghostPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        date: formatGhostDate(post.published_at),
        excerpt: post.excerpt || "",
        readingTime: post.reading_time,
        featureImage: post.feature_image,
      }))
    : staticPosts.map(post => ({
        ...post,
        readingTime: undefined,
        featureImage: undefined,
      }))

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

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-background rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-[#4AA69D] transition-all"
              >
                {post.featureImage && (
                  <div className="aspect-video bg-[#f5ebe0] overflow-hidden">
                    <img 
                      src={post.featureImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                {!post.featureImage && (
                  <div className="aspect-video bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#d4c4a8]" />
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                    <time>{post.date}</time>
                    {post.readingTime && (
                      <>
                        <span>&middot;</span>
                        <span>{post.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#4AA69D] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
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
