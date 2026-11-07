import Image from 'next/image'
import Link from 'next/link'
import { PostDateline } from '@/components/blog/post-dateline'
import { ContactButton } from '@/components/shared/contact-button'
import { PageHero } from '@/components/shared/page-hero'
import { getAllBlogPosts, getAllCategories } from '@/lib/data/blog-posts'
import { localizedRoute } from '@/lib/data/routes'
import { formatPostDate } from '@/lib/post-date'
import {
  type LocalePageProps,
  localeDictionary,
  localeStaticParams,
  localizedMetadata
} from '../locale-page'

export const dynamicParams = false

export const generateStaticParams = localeStaticParams

export const generateMetadata = localizedMetadata('/blog/', ({ blog }) => ({
  title: blog.metaTitle,
  description: blog.metaDescription
}))

export default async function BlogPage({ params }: LocalePageProps) {
  const { locale, dict } = localeDictionary(await params)

  const posts = getAllBlogPosts(locale).map(post => ({
    slug: post.slug,
    title: post.title,
    date: formatPostDate(post.publishedAt, locale),
    excerpt: post.excerpt,
    readingTime: post.readingTime,
    featureImage: post.featureImage,
    featureImageAlt: post.featureImageAlt,
    category: post.category
  }))

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <>
      <PageHero
        locale={locale}
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute('/', locale) },
          { label: dict.blog.blog }
        ]}
        title={dict.blog.blog}
        description={dict.blog.heroDescription}
      />

      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">{dict.blog.categories}</span>
            <Link
              href={localizedRoute('/blog/', locale)}
              className="px-4 py-1.5 text-sm rounded-full bg-[#7A8F87] text-white"
            >
              {dict.blog.all}
            </Link>
            {getAllCategories(locale).map(cat => (
              <Link
                key={cat.slug}
                href={localizedRoute(`/blog/category/${cat.slug}/`, locale)}
                className="px-4 py-1.5 text-sm rounded-full border border-border hover:border-[#7A8F87] hover:text-[#7A8F87] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <Link
              href={localizedRoute(`/blog/${featuredPost.slug}/`, locale)}
              className="group block max-w-5xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-[#f5ebe0] to-[#e8d4c8]">
                  {featuredPost.featureImage ? (
                    <Image
                      src={featuredPost.featureImage}
                      alt={featuredPost.featureImageAlt}
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
                        <span className="text-sm text-muted-foreground">
                          {dict.blog.featuredArticle}
                        </span>
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
                    <PostDateline
                      date={featuredPost.date}
                      readingTime={featuredPost.readingTime}
                      locale={locale}
                    />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4 group-hover:text-[#7A8F87] transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                  <span className="text-[#7A8F87] font-medium group-hover:underline">
                    {dict.blog.readArticle} &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-serif text-foreground mb-8">{dict.blog.latestArticles}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
            {otherPosts.map(post => (
              <Link
                key={post.slug}
                href={localizedRoute(`/blog/${post.slug}/`, locale)}
                className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-[#7A8F87] transition-all"
              >
                {post.featureImage ? (
                  <div className="relative aspect-video bg-[#f5ebe0] overflow-hidden">
                    <Image
                      src={post.featureImage}
                      alt={post.featureImageAlt}
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
                    <PostDateline date={post.date} readingTime={post.readingTime} locale={locale} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#7A8F87] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-foreground mb-6">{dict.blog.stayInformed}</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
            {dict.blog.stayInformedDescription}
          </p>
          <ContactButton locale={locale}>{dict.common.contactUs}</ContactButton>
        </div>
      </section>
    </>
  )
}
