import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | Pitonne Stem Cell & IV Therapy",
  description: "Read the latest articles about IV therapy, stem cell treatments, wellness tips, and health insights from Pitonne in Tokyo.",
}

const posts = [
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

export default function BlogPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf9f7] overflow-hidden py-16 lg:py-20">
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
            <span>Blog</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Blog</h1>
          <p className="max-w-3xl text-muted-foreground">
            Insights on IV therapy, stem cell treatments, and wellness from the Pitonne team. We share educational content to help you make informed decisions about your health.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className={`py-8 ${index !== posts.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <time className="text-sm text-muted-foreground whitespace-nowrap md:w-32 shrink-0">
                      {post.date}
                    </time>
                    <div>
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-[#4AA69D] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif mb-6">Stay Informed</h2>
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
