import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import LocaleLayout from '@/app/[locale]/layout'
import { ServiceDetailTemplate } from '@/components/services/service-detail-template'
import { getAllBlogPosts } from '@/lib/data/blog-posts'
import { getService, getServicesFromSlugs } from '@/lib/data/services'
import { businessHours, isOpenBusinessHours } from '@/lib/data/site'
import { blogPostingJsonLd, businessJsonLd, websiteJsonLd } from '@/lib/structured-data'
import { englishBlogPost } from '@/test/blog-post'
import { defined } from '@/test/defined'
import { jsonLdFrom } from '@/test/json-ld'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Playfair_Display: () => ({ variable: 'font-playfair' })
}))

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

  it('names the language of the site and of each post', () => {
    for (const locale of ['en', 'ja'] as const) {
      expect(websiteJsonLd(locale).inLanguage).toBe(locale)
      expect(blogPostingJsonLd(getAllBlogPosts(locale)[0], locale).inLanguage).toBe(locale)
    }
  })

  it('renders BlogPosting JSON-LD on blog post pages', async () => {
    const { post, template } = await englishBlogPost('iv-therapy-for-hangover')
    const markup = renderToStaticMarkup(template)
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
