import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactButton } from '@/components/shared/contact-button'
import { PageHero } from '@/components/shared/page-hero'
import {
  getAllCategories,
  getBlogCategoryLocales,
  getBlogPostsByCategory
} from '@/lib/data/blog-posts'
import { localizedRoute } from '@/lib/data/routes'
import type { Locale } from '@/lib/i18n/config'
import { nonDefaultLocales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { formatPostDate } from '@/lib/post-date'
import { localizedPageMetadata } from '@/lib/seo'

export const dynamicParams = false

interface Props {
  params: Promise<{ locale: string; category: string }>
}

export async function generateStaticParams() {
  return nonDefaultLocales.flatMap(locale =>
    getAllCategories(locale).map(category => ({ locale, category: category.slug }))
  )
}

function categoryFromParams({ locale, category: categorySlug }: Awaited<Props['params']>) {
  const typedLocale = locale as Locale
  return {
    typedLocale,
    categorySlug,
    dict: getDictionary(typedLocale),
    category: getAllCategories(typedLocale).find(c => c.slug === categorySlug)
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { typedLocale, dict, category } = categoryFromParams(await params)
  if (!category) return { title: dict.common.notFoundCategory }
  const categoryDescription = category.description

  return localizedPageMetadata({
    title: `${category.name} ${dict.blog.articles}`,
    description: categoryDescription,
    path: `/blog/category/${category.slug}/`,
    locale: typedLocale,
    availableLocales: getBlogCategoryLocales(category.slug)
  })
}

export default async function BlogCategoryPage({ params }: Props) {
  const { typedLocale, categorySlug, dict, category } = categoryFromParams(await params)

  if (!category) {
    notFound()
  }

  const categoryDescription = category.description
  const categoryCtaDescription = category.ctaDescription ?? dict.blog.contactDescription
  const categoryPosts = getBlogPostsByCategory(categorySlug, typedLocale)

  return (
    <div className="bg-background">
      <PageHero
        locale={typedLocale}
        breadcrumbs={[
          { label: dict.nav.home, href: localizedRoute('/', typedLocale) },
          { label: dict.blog.blog, href: localizedRoute('/blog/', typedLocale) },
          { label: category.name }
        ]}
        eyebrow={dict.blog.category}
        title={category.name}
        description={categoryDescription}
      />

      <section className="py-6 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={localizedRoute('/blog/', typedLocale)}
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
                    ? 'bg-[#7A8F87] text-white'
                    : 'border border-border hover:border-[#7A8F87] hover:text-[#7A8F87]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
            {categoryPosts.map(post => (
              <Link
                key={post.slug}
                href={localizedRoute(`/blog/${post.slug}/`, typedLocale)}
                className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-[#7A8F87] transition-all"
              >
                <div className="aspect-video overflow-hidden bg-[#f5ebe0]">
                  {post.featureImage ? (
                    <img
                      src={post.featureImage}
                      alt={post.featureImageAlt}
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
                    <time>{formatPostDate(post.publishedAt, typedLocale)}</time>
                    <span>&middot;</span>
                    <span>
                      {post.readingTime} {dict.common.minRead}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#7A8F87] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#f5ebe0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">{dict.blog.haveQuestions}</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{categoryCtaDescription}</p>
          <ContactButton locale={typedLocale}>{dict.common.contactUs}</ContactButton>
        </div>
      </section>
    </div>
  )
}
