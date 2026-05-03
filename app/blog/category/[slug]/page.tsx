import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

const categoryData: Record<string, { name: string; description: string }> = {
  "iv-therapy": {
    name: "IV Therapy",
    description: "Articles about IV therapy treatments, benefits, and wellness information.",
  },
}

const blogPosts = [
  {
    slug: "what-is-an-exosome-iv-drip-differences-from-stem-cell-conditioned-media-cost-and-risks-explained",
    title: "What is an Exosome IV Drip? Differences from Stem Cell Conditioned Media, Cost and Risks Explained",
    excerpt: "Learn about exosome IV drip therapy, how it differs from stem cell treatments, and what to expect.",
    date: "2024-01-15",
    category: "iv-therapy",
  },
  {
    slug: "iv-therapy-for-fatigue",
    title: "IV Therapy for Fatigue: How It Works and What to Expect",
    excerpt: "Discover how IV therapy can help combat chronic fatigue and restore your energy levels.",
    date: "2024-01-10",
    category: "iv-therapy",
  },
  {
    slug: "iv-therapy-for-dehydration",
    title: "IV Therapy for Dehydration: Fast, Effective Relief",
    excerpt: "Learn about the benefits of IV therapy for treating dehydration and how it compares to oral hydration.",
    date: "2024-01-05",
    category: "iv-therapy",
  },
  {
    slug: "iv-therapy-for-hangover",
    title: "IV Therapy for Hangover: Quick Recovery When You Need It",
    excerpt: "Everything you need to know about using IV therapy to recover from a hangover quickly.",
    date: "2024-01-01",
    category: "iv-therapy",
  },
]

export async function generateStaticParams() {
  return Object.keys(categoryData).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = categoryData[slug]
  if (!category) return { title: "Category Not Found | Pitonne" }
  
  return {
    title: `${category.name} Articles | Pitonne Blog`,
    description: category.description,
  }
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = categoryData[slug]
  
  if (!category) {
    notFound()
  }

  const categoryPosts = blogPosts.filter(post => post.category === slug)

  return (
    <div className="bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-[#4AA69D] mb-4">Blog Category</p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-6">
            {category.name}
          </h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {categoryPosts.map((post) => (
              <article key={post.slug} className="bg-white rounded-lg border border-[#e5e5e5] p-8 hover:shadow-md transition-shadow">
                <Link href={`/blog/${post.slug}`}>
                  <p className="text-sm text-[#4AA69D] mb-2">{post.date}</p>
                  <h2 className="font-serif text-2xl text-[#1a1a1a] mb-3 hover:text-[#4AA69D] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#666] mb-4">{post.excerpt}</p>
                  <span className="text-[#4AA69D] font-medium">Read more &rarr;</span>
                </Link>
              </article>
            ))}
          </div>

          {categoryPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#666]">No articles found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 border-t border-[#e5e5e5]">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/blog" className="text-[#4AA69D] hover:underline">
            &larr; Back to all articles
          </Link>
        </div>
      </section>
    </div>
  )
}
