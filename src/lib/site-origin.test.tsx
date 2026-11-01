import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LocaleLayout, { generateMetadata as layoutMetadata } from '@/app/[locale]/layout'
import HomePage from '@/app/[locale]/page'
import robots from '@/app/robots'
import { GET as sitemapIndex } from '@/app/sitemap-index.xml/route'
import { GET as pagesSitemap } from '@/app/sitemap-pages.xml/route'
import { GET as videosSitemap } from '@/app/sitemap-videos.xml/route'
import { SiteMarkdown } from '@/components/shared/site-markdown'
import { blogPosts } from '@/lib/data/blog-posts'
import { services } from '@/lib/data/services'
import { pitonneVideos } from '@/lib/data/videos'
import { type DeployEnvironment, SITE_AUDITOR, siteOrigin } from '@/lib/deploy-environment.mts'
import { localizedPageMetadata } from '@/lib/seo'
import {
  blogPostingJsonLd,
  businessJsonLd,
  serviceJsonLd,
  videoBreadcrumbJsonLd,
  videoObjectJsonLd,
  websiteJsonLd
} from '@/lib/structured-data'
import { defined } from '@/test/defined'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Playfair_Display: () => ({ variable: 'font-playfair' })
}))

afterEach(() => {
  vi.unstubAllEnvs()
})

const SITE_URL = /^https?:\/\/(?:[\w-]+\.)*pitonne\.jp(?=[/:?#]|$)/

function siteUrls(value: unknown): string[] {
  if (typeof value === 'string') {
    const found = value.match(/https?:\/\/[^\s"'<>)]+/g) ?? []
    return found.filter(url => SITE_URL.test(url))
  }
  if (Array.isArray(value)) return value.flatMap(siteUrls)
  if (value && typeof value === 'object') return Object.values(value).flatMap(siteUrls)
  return []
}

const markupUrls = (markup: string) =>
  siteUrls([
    ...[...markup.matchAll(/\s(?:href|content|src)="([^"]*)"/g)].map(match => match[1]),
    ...[...markup.matchAll(/"(?:@id|url|item|mainEntityOfPage)":"([^"]*)"/g)].map(match => match[1])
  ])

function expectOnly(origin: string, urls: string[]) {
  expect(urls.length).toBeGreaterThan(0)
  expect(urls.filter(url => url !== origin && !url.startsWith(`${origin}/`))).toEqual([])
}

const environments: DeployEnvironment[] = ['production', 'staging']

describe.each(environments)('URLs a %s build writes', environment => {
  const origin = siteOrigin(environment)
  const build = () => vi.stubEnv('DEPLOY_ENV', environment)

  it('puts canonicals, og:url, hreflang and social images on its own host', async () => {
    build()
    for (const locale of ['en', 'ja']) {
      const markup = renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }))
      expect(markup).toContain(
        `<link rel="canonical" href="${locale === 'en' ? origin : `${origin}/ja/`}"/>`
      )
      expectOnly(origin, markupUrls(markup))
    }
    const metadata = localizedPageMetadata({
      title: 'Title',
      description: 'Description',
      path: services[0].canonicalPath,
      locale: 'ja'
    })
    expect(metadata.alternates.canonical).toBe(`${origin}/ja${services[0].canonicalPath}`)
    expectOnly(origin, siteUrls(metadata))
  })

  it('writes absolute site links in legal and service markdown on its own host', () => {
    build()
    const content = [
      'Form: https://pitonne.jp/contact/',
      '[Home](https://pitonne.jp) [Out](https://example.com/x/) [About](/about/)',
      '[Lookalike](https://pitonne.jpx/) [Plain](http://pitonne.jp/)'
    ].join('\n\n')
    const markup = renderToStaticMarkup(<SiteMarkdown content={content} />)
    expect(markup).toContain(`<a href="${origin}/contact/">https://pitonne.jp/contact/</a>`)
    expect(markup).toContain(`<a href="${origin}">Home</a>`)
    for (const untouched of ['https://example.com/x/', '/about/', 'https://pitonne.jpx/'])
      expect(markup).toContain(`<a href="${untouched}">`)
    expect(markup).toContain('<a href="http://pitonne.jp/">Plain</a>')
  })

  it('sets metadataBase, absolute links and JSON-LD ids in the layout', async () => {
    build()
    const metadata = await layoutMetadata({ params: Promise.resolve({ locale: 'ja' }) })
    expect(metadata.metadataBase?.toString()).toBe(`${origin}/`)
    expectOnly(origin, siteUrls(metadata.openGraph))
    const markup = renderToStaticMarkup(
      await LocaleLayout({ children: <main />, params: Promise.resolve({ locale: 'ja' }) })
    )
    expect(markup).toContain(`"@id":"${origin}/#business"`)
    expectOnly(origin, markupUrls(markup))
  })

  it('writes structured-data ids and URLs on its own host', () => {
    build()
    const post = defined(blogPosts[0])
    const video = defined(pitonneVideos[0])
    const schemas = [
      businessJsonLd('ja'),
      websiteJsonLd('en'),
      serviceJsonLd(services[0], 'ja'),
      blogPostingJsonLd(post, 'en'),
      blogPostingJsonLd(post, 'ja'),
      videoBreadcrumbJsonLd(video, 'ja'),
      { ...videoObjectJsonLd(video), description: '', name: '' }
    ]
    expect(businessJsonLd()).toMatchObject({ '@id': `${origin}/#business` })
    expect(blogPostingJsonLd(post, 'en')).toMatchObject({
      workTranslation: { '@id': `${origin}/ja/blog/${post.slug}/#blog-posting` }
    })
    expectOnly(origin, siteUrls(schemas))
  })

  it('lists its own URLs in the sitemap index, the sitemaps and their hreflang links', async () => {
    build()
    const index = await sitemapIndex().text()
    expect(index).toContain(`<loc>${origin}/sitemap-pages.xml</loc>`)
    const pages = await pagesSitemap().text()
    expect(pages).toContain(`<loc>${origin}</loc>`)
    for (const xml of [index, pages, await videosSitemap().text()]) {
      expectOnly(
        origin,
        siteUrls(
          [...xml.matchAll(/<loc>([^<]*)<\/loc>|\shref="([^"]*)"/g)].flatMap(m => m.slice(1))
        )
      )
    }
  })
})

describe('robots.txt', () => {
  it('blocks every crawler on staging except the site auditor, which gets production rules', () => {
    vi.stubEnv('DEPLOY_ENV', 'production')
    const production = robots()
    vi.stubEnv('DEPLOY_ENV', 'staging')
    const { userAgent, ...productionRules } = production.rules as { userAgent: string }
    expect(userAgent).toBe('*')
    expect(robots()).toEqual({
      rules: [
        { userAgent: '*', disallow: '/' },
        { userAgent: SITE_AUDITOR, ...productionRules }
      ],
      sitemap: 'https://staging.pitonne.jp/sitemap-index.xml'
    })
  })

  it('keeps production and previews as they were', () => {
    vi.stubEnv('DEPLOY_ENV', 'production')
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: '/keystatic/' },
      sitemap: 'https://pitonne.jp/sitemap-index.xml'
    })
    for (const value of ['preview', '', 'unknown']) {
      vi.stubEnv('DEPLOY_ENV', value)
      expect(robots()).toEqual({
        rules: { userAgent: '*', disallow: '/' },
        sitemap: 'https://pitonne.jp/sitemap-index.xml'
      })
    }
  })
})

describe('staging pages', () => {
  it('are indexable and load no analytics', async () => {
    vi.stubEnv('DEPLOY_ENV', 'staging')
    const metadata = await layoutMetadata({ params: Promise.resolve({ locale: 'en' }) })
    expect(metadata.robots).toEqual({ index: true, follow: true })
    const markup = renderToStaticMarkup(
      await LocaleLayout({ children: <main />, params: Promise.resolve({ locale: 'en' }) })
    )
    expect(markup).not.toContain('googletagmanager')
    expect(markup).not.toContain('GTM-')
  })
})
