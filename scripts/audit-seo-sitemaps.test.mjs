import { describe, expect, it } from 'vitest'
import { auditSeo, SITE, seoPage, seoSite, sitemapIndex, urlset } from './audit-seo-test-site.mjs'
import { robots, tempTrees } from './audit-test-helpers.mjs'

const tree = tempTrees()
const ABOUT = `${SITE}/about/`
const INDEX = `${SITE}/sitemap-index.xml`
const PAGES = `${SITE}/sitemap-pages.xml`
const findingsFor = changes => {
  const run = auditSeo(tree, seoSite(SITE, changes))
  expect(run.status).toBe(1)
  return run.findings
}
const notListed = [
  '/: is not listed in any sitemap',
  '/about/: is not listed in any sitemap',
  '/ja/: is not listed in any sitemap'
]

describe('pnpm audit:seo on robots.txt', () => {
  it.each([
    ['no robots.txt', null, 'none'],
    ['two sitemaps', `Sitemap: ${INDEX}\nSitemap: ${PAGES}\n`, `${INDEX}, ${PAGES}`],
    ['another sitemap', `Sitemap: ${PAGES}\n`, PAGES]
  ])('fails %s', (_, robotsTxt, found) => {
    expect(findingsFor({ 'robots.txt': robotsTxt })).toEqual([
      `/robots.txt: must list only Sitemap: ${INDEX} (found ${found})`
    ])
  })
})

describe('pnpm audit:seo on the sitemap index', () => {
  it('fails a missing index, and each page and sitemap it would have listed', () => {
    expect(findingsFor({ 'sitemap-index.xml': null, 'sitemap.xml': null })).toEqual(
      [
        '/sitemap-index.xml: missing',
        '/sitemap-pages.xml: is not listed in /sitemap-index.xml',
        ...notListed
      ].sort()
    )
  })

  it.each([
    ['a <urlset>', `<urlset><loc>${PAGES}</loc></urlset>`],
    ['both kinds', `<sitemapindex><urlset></urlset><loc>${PAGES}</loc></sitemapindex>`]
  ])('fails an index that is %s', (_, xml) => {
    expect(findingsFor({ 'sitemap-index.xml': xml, 'sitemap.xml': xml })).toEqual([
      '/sitemap-index.xml: is not a <sitemapindex>'
    ])
  })

  it.each([
    ['other XML', urlset()],
    ['nothing', null]
  ])('fails a sitemap.xml that serves %s', (_, xml) => {
    expect(findingsFor({ 'sitemap.xml': xml })).toEqual([
      '/sitemap.xml: must serve the same XML as /sitemap-index.xml'
    ])
  })

  it('fails each child that is off the site, nested or missing, and each sitemap file it leaves out', () => {
    const index = sitemapIndex(
      PAGES,
      'https://example.com/sitemap-pages.xml',
      `${SITE}/nested/sitemap-blog.xml`,
      `${SITE}/sitemap_blog.xml`,
      `${SITE}/sitemap-gone.xml`
    )
    expect(
      findingsFor({
        'sitemap-index.xml': index,
        'sitemap.xml': index,
        'sitemap-extra.xml': urlset(),
        'sitemap.xsl': '<xsl/>'
      })
    ).toEqual(
      [
        `/sitemap-index.xml: child https://example.com/sitemap-pages.xml must be a root-level ${SITE}/sitemap-<group>.xml`,
        `/sitemap-index.xml: child ${SITE}/nested/sitemap-blog.xml must be a root-level ${SITE}/sitemap-<group>.xml`,
        `/sitemap-index.xml: child ${SITE}/sitemap_blog.xml must be a root-level ${SITE}/sitemap-<group>.xml`,
        `/sitemap-index.xml: lists missing sitemap ${SITE}/sitemap-gone.xml`,
        '/sitemap-extra.xml: is not listed in /sitemap-index.xml'
      ].sort()
    )
  })
})

describe('pnpm audit:seo on each child sitemap', () => {
  const pagesSitemap = xml => findingsFor({ 'sitemap-pages.xml': xml })
  const allPages = [SITE, `${SITE}/ja/`, ABOUT]

  it.each([
    ['an index', sitemapIndex(...allPages)],
    ['both kinds', `${urlset(...allPages)}<sitemapindex></sitemapindex>`]
  ])('fails a child that is %s', (_, xml) => {
    expect(pagesSitemap(xml)).toEqual(['/sitemap-pages.xml: is not a <urlset>'])
  })

  it('fails the homepage listed with a trailing slash, which is not its canonical', () => {
    expect(pagesSitemap(urlset(`${SITE}/`, `${SITE}/ja/`, ABOUT))).toEqual([
      `/sitemap-pages.xml: ${SITE}/ does not match the page canonical ${SITE}`,
      `/sitemap-pages.xml: lists the homepage as ${SITE}/ (use ${SITE})`
    ])
  })

  it('fails URLs that are not pages: no trailing slash, missing, off the site, or malformed', () => {
    const urls = [
      `${SITE}/about`,
      `${SITE}/missing/`,
      'https://example.com/about/',
      `${SITE}/%E0%A4%A/`
    ]
    expect(pagesSitemap(urlset(SITE, `${SITE}/ja/`, ...urls))).toEqual(
      [
        `/sitemap-pages.xml: URL has no trailing slash: ${SITE}/about`,
        ...urls.map(url => `/sitemap-pages.xml: lists URL that is not a page: ${url}`),
        '/about/: is not listed in any sitemap'
      ].sort()
    )
  })

  it('fails a URL whose page has another canonical, no canonical, or is no audited page', () => {
    const run = findingsFor({
      'about/index.html': seoPage({ url: ABOUT, canonical: `${SITE}/about-us/` }),
      'ja/index.html': seoPage({
        url: `${SITE}/ja/`,
        canonical: null,
        og: true,
        ogUrl: `${SITE}/ja/`
      }),
      'sitemap-pages.xml': urlset(...allPages, `${SITE}/_not-found/`)
    })
    expect(run).toEqual(
      [
        `/sitemap-pages.xml: ${ABOUT} does not match the page canonical ${SITE}/about-us/`,
        `/sitemap-pages.xml: ${SITE}/_not-found/ does not match the page canonical undefined`,
        `/sitemap-pages.xml: ${SITE}/ja/ does not match the page canonical null`
      ].sort()
    )
  })

  it('fails a noindex page listed in a sitemap, and does not ask for an unlisted one', () => {
    const noindexAbout = { 'about/index.html': seoPage({ url: ABOUT, robots: 'noindex, follow' }) }
    expect(findingsFor(noindexAbout)).toEqual([
      `/sitemap-pages.xml: lists a noindex page: ${ABOUT}`
    ])
    const unlisted = auditSeo(
      tree,
      seoSite(SITE, { ...noindexAbout, 'sitemap-pages.xml': urlset(SITE, `${SITE}/ja/`) })
    )
    expect(unlisted.status, unlisted.stdout).toBe(0)
  })

  it('asks nothing about indexing of a build that blocks crawlers', () => {
    const run = auditSeo(
      tree,
      seoSite(SITE, {
        'robots.txt': `${robots.preview.join('\n')}\n`,
        'about/index.html': seoPage({ url: ABOUT, robots: 'noindex' }),
        'sitemap-pages.xml': urlset(SITE, ABOUT)
      })
    )
    expect(run.status, run.stdout).toBe(0)
  })

  it('fails an hreflang alternate that is not a page', () => {
    const xml = urlset(...allPages).replace(
      '</url>',
      `<xhtml:link rel="alternate" hreflang="fr" href="${SITE}/fr/" /></url>`
    )
    expect(pagesSitemap(xml)).toEqual([
      `/sitemap-pages.xml: hreflang alternate is not a page: ${SITE}/fr/`
    ])
  })

  it('fails a URL listed in two sitemaps', () => {
    const index = sitemapIndex(PAGES, `${SITE}/sitemap-blog.xml`)
    expect(
      findingsFor({
        'sitemap-index.xml': index,
        'sitemap.xml': index,
        'sitemap-blog.xml': urlset(ABOUT)
      })
    ).toEqual([`${ABOUT}: listed in multiple sitemaps: sitemap-pages.xml, sitemap-blog.xml`])
  })

  it('passes a Japanese page listed at its percent-encoded URL', () => {
    const blog = `${SITE}/ja/${encodeURI('ブログ')}/`
    const run = auditSeo(
      tree,
      seoSite(SITE, {
        'ja/ブログ/index.html': seoPage({ url: blog }),
        'sitemap-pages.xml': urlset(...allPages, blog)
      })
    )
    expect(run.findings).toEqual([])
    expect(run.stdout).toContain('6 pages and 4 URLs in 1 sitemaps')
  })
})
