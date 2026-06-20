import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { ContactButton } from "@/components/shared/contact-button"
import { getAllBlogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { localizedCanonicalUrl, localizedHreflangAlternates } from "@/lib/seo"
import type { Locale } from "@/lib/i18n/config"
import { nonDefaultLocales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { localizedRoute } from "@/lib/data/routes"

export const dynamicParams = false

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return nonDefaultLocales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale as Locale
  const dict = getDictionary(typedLocale)

  return {
    title: dict.blog.blog,
    description: dict.blog.metaDescription,
    alternates: localizedHreflangAlternates("/blog/", typedLocale),
    openGraph: {
      title: dict.blog.blog,
      description: dict.blog.metaDescription,
      url: localizedCanonicalUrl("/blog/", typedLocale),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = locale as Locale
  const dateLocale = locale === "ja" ? "ja-JP" : "en-US"
  const dict = getDictionary(typedLocale)

  const posts = getAllBlogPosts(typedLocale).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: new Date(post.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" }),
    excerpt: post.excerpt,
    readingTime: post.readingTime,
    featureImage: post.featureImage,
    category: post.category,
  }))

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute("/", typedLocale) },
          { label: dict.blog.blog },
        ]}
        title={dict.blog.blog}
        description={dict.blog.heroDescription}
      />

      {/* Categories */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">{dict.blog.categories}</span>
            <Link
              href={localizedRoute("/blog/", typedLocale)}
              className="px-4 py-1.5 text-sm rounded-full bg-[#7A8F87] text-white"
            >
              {dict.blog.all}
            </Link>
            {getAllCategories(typedLocale).map(cat => (
              <Link
                key={cat.slug}
                href={localizedRoute(`/blog/category/${cat.slug}/`, typedLocale)}
                className="px-4 py-1.5 text-sm rounded-full border border-border hover:border-[#7A8F87] hover:text-[#7A8F87] transition-colors"
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
              href={localizedRoute(`/blog/${featuredPost.slug}/`, typedLocale)}
              className="group block max-w-5xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8]">
                  {featuredPost.featureImage ? (
                    <Image
                      src={featuredPost.featureImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fill
                      priority
                      fetchPriority="high"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-white/50 flex items-center justify-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-[#d4c4a8]" />
                        </div>
                        <span className="text-sm text-muted-foreground">{dict.blog.featuredArticle}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-[#f5ebe0] text-foreground rounded-full mb-4">
                    {dict.blog.featured}
                  </span>
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                    <span className="text-[#7A8F87]">{featuredPost.category}</span>
                    <span>&middot;</span>
                    <time>{featuredPost.date}</time>
                    {featuredPost.readingTime && (
                      <>
                        <span>&middot;</span>
                        <span>{featuredPost.readingTime} {dict.common.minRead}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4 group-hover:text-[#7A8F87] transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <span className="text-[#7A8F87] font-medium group-hover:underline">
                    {dict.blog.readArticle} &rarr;
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
          <h2 className="text-2xl font-serif text-foreground mb-8">{dict.blog.latestArticles}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
            {otherPosts.map((post) => (
              <Link
                key={post.slug}
                href={localizedRoute(`/blog/${post.slug}/`, typedLocale)}
                className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-[#7A8F87] transition-all"
              >
                {post.featureImage ? (
                  <div className="relative aspect-video bg-[#f5ebe0] overflow-hidden">
                    <Image
                      src={post.featureImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
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
                    <span className="text-[#7A8F87]">{post.category}</span>
                    <span>&middot;</span>
                    <time>{post.date}</time>
                    {post.readingTime && (
                      <>
                        <span>&middot;</span>
                        <span>{post.readingTime} {dict.common.minRead}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#7A8F87] transition-colors line-clamp-2">
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
          <h2 className="text-3xl font-serif text-foreground mb-6">{dict.blog.stayInformed}</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            {dict.blog.stayInformedDescription}
          </p>
          <ContactButton locale={typedLocale} />
        </div>
      </section>
    </>
  )
}
