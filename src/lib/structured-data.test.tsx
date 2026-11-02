import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import LocaleLayout from '@/app/[locale]/layout'
import { ServiceDetailTemplate } from '@/components/services/service-detail-template'
import { getAllBlogPosts, getBlogPostLocales } from '@/lib/data/blog-posts'
import { getService, getServicesFromSlugs } from '@/lib/data/services'
import { businessHours, getBusinessInfo, isOpenBusinessHours } from '@/lib/data/site'
import { type PitonneVideo, pitonneVideos } from '@/lib/data/videos'
import {
  blogPostingJsonLd,
  businessJsonLd,
  videoListJsonLd,
  videoObjectJsonLd,
  websiteJsonLd
} from '@/lib/structured-data'
import { englishBlogPost } from '@/test/blog-post'
import { defined } from '@/test/defined'
import { jsonLdFrom } from '@/test/json-ld'

const SITE_URL = 'https://pitonne.jp'

function expectSameJson(actual: unknown, expected: unknown) {
  expect(actual).toEqual(expected)
  expect(JSON.stringify(actual), 'the same keys in the same order').toBe(JSON.stringify(expected))
}

function englishVideo(video: PitonneVideo) {
  const watchUrl = `${SITE_URL}${video.watchPath}`
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${watchUrl}#video`,
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: video.embedUrl,
    url: watchUrl,
    mainEntityOfPage: watchUrl,
    publisher: { '@id': `${SITE_URL}/#business` },
    potentialAction: {
      '@type': 'WatchAction',
      target: { '@type': 'EntryPoint', urlTemplate: watchUrl }
    }
  }
}

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

  it('describes the business and the site on English pages as it always has', () => {
    const info = getBusinessInfo('en')
    expectSameJson(businessJsonLd('en'), {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: 'Pitonne',
      url: SITE_URL,
      telephone: '03-6821-8285',
      description: info.description,
      knowsLanguage: [
        { '@type': 'Language', name: 'English', alternateName: 'en' },
        { '@type': 'Language', name: 'Japanese', alternateName: 'ja' }
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${info.addressLine1}, ${info.addressLine2}`,
        addressLocality: 'Minato City',
        addressRegion: 'Tokyo',
        postalCode: '106-0031',
        addressCountry: 'JP'
      },
      openingHoursSpecification: businessHours.filter(isOpenBusinessHours).map(item => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: item.day,
        opens: item.opens,
        closes: item.closes
      }))
    })
    expectSameJson(websiteJsonLd('en'), {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Pitonne',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#business` },
      inLanguage: 'en'
    })
  })

  it('describes every English post as it always has, naming its Japanese translation', () => {
    for (const post of getAllBlogPosts('en')) {
      const url = `${SITE_URL}/blog/${post.slug}/`
      expectSameJson(blogPostingJsonLd(post, 'en'), {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${url}#blog-posting`,
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        image: post.featureImage ? `${SITE_URL}${post.featureImage}` : undefined,
        inLanguage: 'en',
        ...(getBlogPostLocales(post.slug).includes('ja')
          ? {
              workTranslation: {
                '@type': 'BlogPosting',
                '@id': `${SITE_URL}/ja/blog/${post.slug}/#blog-posting`
              }
            }
          : {}),
        author: { '@type': 'Person', name: post.author.name, jobTitle: post.author.role },
        publisher: { '@id': `${SITE_URL}/#business` },
        mainEntityOfPage: url
      })
    }
  })

  it('describes every video and the video list on English pages as it always has', () => {
    for (const video of pitonneVideos) {
      expectSameJson(videoObjectJsonLd(video), englishVideo(video))
    }
    expectSameJson(videoListJsonLd(pitonneVideos), {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Pitonne Videos',
      itemListElement: pitonneVideos.map((video, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}${video.watchPath}`,
        item: englishVideo(video)
      }))
    })
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
