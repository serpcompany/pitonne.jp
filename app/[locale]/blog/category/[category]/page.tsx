import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/shared/page-hero"
import { ContactButton } from "@/components/shared/contact-button"
import { getAllCategories, getBlogPostsByCategory } from "@/lib/data/blog-posts"
import { localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

interface Props {
  params: Promise<{ locale: string; category: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAllCategories(locale).map((category) => ({ locale, category: category.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params
  const typedLocale = locale as Locale
  const dict = getDictionary(typedLocale)
  const categories = getAllCategories(typedLocale)
  const category = categories.find(c => c.slug === categorySlug)
  if (!category) return { title: "Category Not Found | Pitonne" }

  return {
    title: `${category.name} ${dict.blog.articles}`,
    description: `Explore our ${category.name.toLowerCase()} articles and guides.`,
    alternates: localizedHreflangAlternates(`/blog/category/${category.slug}/`, typedLocale),
    openGraph: {
      title: `${category.name} ${dict.blog.articles}`,
      description: `Explore our ${category.name.toLowerCase()} articles and guides.`,
      url: localizedCanonicalUrl(`/blog/category/${category.slug}/`, typedLocale),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  }
}

export default async function BlogCategoryPage({ params }: Props) {
  const { locale, category: categorySlug } = await params
  const typedLocale = locale as Locale
  const dateLocale = locale === "ja" ? "ja-JP" : "en-US"
  const dict = getDictionary(typedLocale)
  const categories = getAllCategories(typedLocale)
  const category = categories.find(c => c.slug === categorySlug)

  if (!category) {
    notFound()
  }

  const categoryDescription = `Explore our ${category.name.toLowerCase()} articles and guides from the Pitonne team.`
  const categoryPosts = getBlogPostsByCategory(categorySlug, typedLocale)

  return (
    <div className="bg-background">
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", typedLocale) },
          { label: dict.blog.blog, href: localizedRoute("/blog/", typedLocale) },
          { label: category.name },
        ]}
        eyebrow={dict.blog.category}
        title={category.name}
        description={categoryDescription}
      />

      {/* Category Navigation */}
      <section className="py-6 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={localizedRoute("/blog/", typedLocale)}
              className="px-4 py-1.5 text-sm rounded-full border border-border hover:border-[#7A8F87] hover:text-[#7A8F87] transition-colors"
            >
              {dict.blog.all}
            </Link>
            {getAllCategories(typedLocale).map(cat => (
              <Link
                key={cat.slug}
                href={localizedRoute(`/blog/category/${cat.slug}/`, typedLocale)}
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
                  href={localizedRoute(`/blog/${post.slug}/`, typedLocale)}
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
                        {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span>&middot;</span>
                      <span>{post.readingTime} {dict.common.minRead}</span>
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
              <p className="text-muted-foreground mb-6">{dict.blog.noArticlesFound}</p>
              <Link
                href={localizedRoute("/blog/", typedLocale)}
                className="text-[#7A8F87] hover:underline"
              >
                {dict.blog.viewAllArticles}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">
            {dict.blog.haveQuestions}
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
