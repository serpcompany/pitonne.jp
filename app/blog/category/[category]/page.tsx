import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/shared/page-hero"
import { ContactButton } from "@/components/shared/contact-button"
import { getAllCategories, getBlogPostsByCategory } from "@/lib/data/blog-posts"
import { canonicalUrl } from "@/lib/seo"

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categorySlug } = await params
  const categories = getAllCategories()
  const category = categories.find(c => c.slug === categorySlug)
  if (!category) return { title: "Category Not Found | Pitonne" }
  
  return {
    title: `${category.name} Articles`,
    description: `Explore our ${category.name.toLowerCase()} articles and guides.`,
    alternates: {
      canonical: canonicalUrl(`/blog/category/${category.slug}/`),
    },
    openGraph: {
      title: `${category.name} Articles`,
      description: `Explore our ${category.name.toLowerCase()} articles and guides.`,
      url: canonicalUrl(`/blog/category/${category.slug}/`),
    },
  }
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params
  const categories = getAllCategories()
  const category = categories.find(c => c.slug === categorySlug)
  
  if (!category) {
    notFound()
  }

  const categoryDescription = `Explore our ${category.name.toLowerCase()} articles and guides from the Pitonne team.`
  const categoryPosts = getBlogPostsByCategory(categorySlug)

  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog/" },
          { label: category.name },
        ]}
        eyebrow="Category"
        title={category.name}
        description={categoryDescription}
      />

      {/* Category Navigation */}
      <section className="py-6 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/blog"
              className="px-4 py-1.5 text-sm rounded-full border border-border hover:border-[#7A8F87] hover:text-[#7A8F87] transition-colors"
            >
              All
            </Link>
            {getAllCategories().map(cat => (
              <Link 
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                  cat.slug === categorySlug 
                    ? "bg-[#7A8F87] text-white"
                    : "border border-border hover:border-[#7A8F87] hover:text-[#7A8F87]"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {categoryPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
              {categoryPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-[#7A8F87] transition-all"
                >
                  <div className="aspect-video overflow-hidden bg-[#f5ebe0]">
                    {post.featureImage ? (
                      <img
                        src={post.featureImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                      <time>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </time>
                      <span>&middot;</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#7A8F87] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#f5ebe0] flex items-center justify-center mb-4">
                <div className="w-8 h-8 rounded-full bg-[#d4c4a8]" />
              </div>
              <p className="text-muted-foreground mb-6">No articles found in this category yet.</p>
              <Link 
                href="/blog"
                className="text-[#7A8F87] hover:underline"
              >
                View all articles
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">
            Have Questions?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our team is ready to help you learn more about {category.name.toLowerCase()} and how it might benefit you.
          </p>
          <ContactButton />
        </div>
      </section>
    </div>
  )
}
