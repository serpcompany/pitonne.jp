import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import LocaleLayout from '@/app/[locale]/layout'
import { BlogPostTemplate } from '@/components/blog/blog-post-template'
import { ServiceDetailTemplate } from '@/components/services/service-detail-template'
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from '@/lib/data/blog-posts'
import { getService, getServicesFromSlugs } from '@/lib/data/services'
import { businessHours, isOpenBusinessHours } from '@/lib/data/site'
import { businessJsonLd, websiteJsonLd } from '@/lib/structured-data'
import { defined } from '@/test/defined'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Playfair_Display: () => ({ variable: 'font-playfair' })
}))

function jsonLdFrom(markup: string) {
  return [
    ...markup.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)
  ].map(match => JSON.parse(match[1]))
}

describe('structured data parity', () => {
  it('renders organization and website JSON-LD in the root layout', async () => {
    const markup = renderToStaticMarkup(
      await LocaleLayout({
        children: <div>Body</div>,
        params: Promise.resolve({ locale: 'en' })
      })
    )
    const schemas = jsonLdFrom(markup)

    expect(schemas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'MedicalBusiness',
          '@id': 'https://pitonne.jp/#business',
          name: 'Pitonne',
          url: 'https://pitonne.jp',
          telephone: '03-6821-8285'
        }),
        expect.objectContaining({
          '@type': 'WebSite',
          '@id': 'https://pitonne.jp/#website',
          url: 'https://pitonne.jp'
        })
      ])
    )

    const businessSchema = defined(
      schemas.find(schema => schema['@id'] === 'https://pitonne.jp/#business')
    )
    expect(businessSchema.openingHoursSpecification).toEqual(
      businessHours.filter(isOpenBusinessHours).map(item => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: item.day,
        opens: item.opens,
        closes: item.closes
      }))
    )
    expect(businessSchema.openingHoursSpecification).not.toContainEqual(
      expect.objectContaining({
        dayOfWeek: 'Sunday'
      })
    )

    const websiteSchema = schemas.find(schema => schema['@id'] === 'https://pitonne.jp/#website')
    expect(businessSchema).not.toHaveProperty('inLanguage')
    expect(businessSchema).not.toHaveProperty('availableLanguage')
    expect(businessSchema.knowsLanguage).toHaveLength(2)
    expect(websiteSchema).not.toHaveProperty('availableLanguage')
  })

  it('writes the Japanese homepage URL with its trailing slash', () => {
    expect(businessJsonLd('ja')).toMatchObject({ url: 'https://pitonne.jp/ja/' })
    expect(websiteJsonLd('ja')).toMatchObject({ url: 'https://pitonne.jp/ja/' })
  })

  it('renders Service JSON-LD on service detail pages', () => {
    const service = defined(getService('exosome-iv-drip'))

    const markup = renderToStaticMarkup(
      <ServiceDetailTemplate
        service={service}
        parentService={getService(defined(service.parentSlug))}
        relatedServices={getServicesFromSlugs(service.relatedServices)}
        relatedPosts={[]}
        locale="en"
      />
    )
    const schemas = jsonLdFrom(markup)

    expect(schemas).toContainEqual(
      expect.objectContaining({
        '@type': 'Service',
        '@id': 'https://pitonne.jp/services/exosome-iv-drip/#service',
        name: 'Exosome IV Drip',
        provider: { '@id': 'https://pitonne.jp/#business' }
      })
    )
  })

  it('renders BlogPosting JSON-LD on blog post pages', () => {
    const post = defined(getBlogPostBySlug('iv-therapy-for-hangover'))

    const markup = renderToStaticMarkup(
      <BlogPostTemplate
        post={{
          title: post.title,
          slug: post.slug,
          date: new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          content: post.content,
          excerpt: post.excerpt,
          readingTime: post.readingTime,
          category: post.category,
          categorySlug: post.categorySlug,
          author: post.author,
          featureImage: post.featureImage,
          relatedServiceSlugs: post.relatedServiceSlugs,
          tags: post.tags
        }}
        relatedPosts={getBlogPostsByCategory(post.categorySlug).filter(
          candidate => candidate.slug !== post.slug
        )}
        relatedServices={getServicesFromSlugs(post.relatedServiceSlugs || [])}
        latestPosts={getAllBlogPosts().filter(candidate => candidate.slug !== post.slug)}
        locale="en"
      />
    )
    const schemas = jsonLdFrom(markup)

    expect(schemas).toContainEqual(
      expect.objectContaining({
        '@type': 'BlogPosting',
        '@id': 'https://pitonne.jp/blog/iv-therapy-for-hangover/#blog-posting',
        headline: post.title,
        author: expect.objectContaining({ name: post.author.name })
      })
    )
  })
})
