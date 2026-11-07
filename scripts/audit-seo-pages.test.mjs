import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { auditSeo, SITE, seoPage, seoSite } from './audit-seo-test-site.mjs'
import { tempTrees } from './audit-test-helpers.mjs'

const tree = tempTrees()
const ABOUT = `${SITE}/about/`
const withAbout = page => seoSite(SITE, { 'about/index.html': seoPage({ url: ABOUT, ...page }) })
const findingsFor = page => {
  const run = auditSeo(tree, withAbout(page))
  expect(run.status).toBe(1)
  expect(run.stdout).toMatch(/\n\n\d+ SEO issue\(s\) found in 5 pages\.$/)
  return run.findings
}

describe('pnpm audit:seo on a whole build', () => {
  it('passes a build whose pages, robots.txt and sitemaps agree, skipping 404s, _next and keystatic', () => {
    const run = auditSeo(tree, seoSite())
    expect(run.status, run.stdout).toBe(0)
    expect(run.stdout).toBe(`SEO audit passed for 5 pages and 3 URLs in 1 sitemaps on ${SITE}.`)
  })

  it("audits a Staging build on Staging's origin when DEPLOY_ENV says so", () => {
    const staging = 'https://staging.pitonne.jp'
    const run = auditSeo(tree, seoSite(staging), { env: { DEPLOY_ENV: 'staging' } })
    expect(run.status, run.stdout).toBe(0)
    expect(run.stdout).toContain(`on ${staging}.`)
    const asProduction = auditSeo(tree, seoSite(staging), { env: { DEPLOY_ENV: 'production' } })
    expect(asProduction.findings).toContain(
      `/robots.txt: must list only Sitemap: ${SITE}/sitemap-index.xml (found ${staging}/sitemap-index.xml)`
    )
  })

  it('reads the folder named as its argument instead of out/', () => {
    const run = auditSeo(tree, seoSite(), { argv: ['build'], under: 'build' })
    expect(run.status, run.stdout).toBe(0)
  })

  it('fails with a hint to build when the folder has no index.html', () => {
    const run = auditSeo(tree, { 'robots.txt': '' })
    expect(run.status).toBe(1)
    expect(run.stdout).toBe('')
    expect(run.stderr).toBe(
      `No build output found in ${path.join(run.root, 'out')}. Run \`pnpm build\` first.`
    )
  })

  it('fails an image over 5 MB, and no other file of that size', () => {
    const big = Buffer.alloc(5 * 1024 * 1024 + 1)
    const run = auditSeo(
      tree,
      seoSite(SITE, { 'images/hero.JPG': big, 'images/small.webp': 'webp', 'files/data.bin': big })
    )
    expect(run.findings).toEqual(['/images/hero.JPG: image is 5.0 MB (max 5 MB)'])
  })
})

describe('pnpm audit:seo on each page', () => {
  it.each([
    [
      'a short title, with entities counted once',
      { title: 'A &amp; B' },
      '/about/: title is 5 chars (want 15–70): A & B'
    ],
    [
      'a long title',
      { title: 'T'.repeat(71) },
      `/about/: title is 71 chars (want 15–70): ${'T'.repeat(71)}`
    ],
    ['no title', { title: null }, '/about/: title is 0 chars (want 15–70): '],
    [
      'no meta description',
      { description: null },
      '/about/: meta description is 0 chars (want 110–160)'
    ],
    [
      'a long meta description',
      { description: 'D'.repeat(161) },
      '/about/: meta description is 161 chars (want 110–160)'
    ],
    ['no <h1>', { h1: '' }, '/about/: has 0 <h1> tags (want 1)'],
    [
      'two <h1> tags',
      { h1: '<h1>One</h1><h1 class="x">Two</h1>' },
      '/about/: has 2 <h1> tags (want 1)'
    ],
    [
      'no Open Graph tags',
      { og: false },
      '/about/: missing Open Graph tags: og:title, og:description, og:image, og:url, og:type'
    ],
    [
      'no meta tags at all',
      { og: false, description: null, title: 'T'.repeat(70) },
      '/about/: meta description is 0 chars (want 110–160)',
      '/about/: missing Open Graph tags: og:title, og:description, og:image, og:url, og:type'
    ],
    [
      'two canonical tags',
      { head: `<link rel="canonical" href="${ABOUT}">` },
      '/about/: has 2 canonical tags (want 1)'
    ],
    [
      'an og:url that differs from the canonical',
      { ogUrl: `${SITE}/about-us/` },
      `/about/: og:url ${SITE}/about-us/ does not match canonical ${ABOUT}`
    ]
  ])('fails a page with %s', (_, page, ...findings) => {
    expect(findingsFor(page)).toEqual(findings)
  })

  it('fails every canonical and og:url on a page with no <head>', () => {
    const html = seoPage({ url: ABOUT }).replace('<head>', '').replace('</head>', '')
    expect(auditSeo(tree, seoSite(SITE, { 'about/index.html': html })).findings).toEqual([
      '/about/: has a canonical tag outside <head>',
      '/about/: has a og:url tag outside <head>'
    ])
  })
})

describe('pnpm audit:seo on links', () => {
  it('fails links to another host of the site, broken links and links that redirect', () => {
    const links = [
      'https://www.pitonne.jp/',
      'http://pitonne.jp/ja/',
      'https://staging.pitonne.jp/about/',
      '/missing/',
      '/images/',
      '/images/nope.png',
      '/%E0%A4%A',
      '/old',
      '/en/about/',
      '/about'
    ]
    expect(findingsFor({ links })).toEqual(
      [
        `/about/: links to non-canonical URL https://www.pitonne.jp/ (use ${SITE})`,
        `/about/: links to non-canonical URL http://pitonne.jp/ja/ (use ${SITE})`,
        `/about/: links to non-canonical URL https://staging.pitonne.jp/about/ (use ${SITE})`,
        '/about/: broken internal link /missing/',
        '/about/: broken internal link /images/',
        '/about/: broken internal link /images/nope.png',
        '/about/: broken internal link /%E0%A4%A',
        '/about/: internal link redirects: /old',
        '/about/: internal link redirects: /en/about/',
        '/about/: internal link redirects: /about'
      ].sort()
    )
  })

  it('passes links to pages, files, anchors and queries, and ignores other sites and malformed URLs', () => {
    const links = [
      '/ja/#faq',
      '/ja/?q=1',
      '../ja/',
      '/images/photo.png',
      `${SITE}/ja/`,
      'https://example.com/old',
      'http://[broken',
      'tel:0312345678'
    ]
    const run = auditSeo(tree, withAbout({ links }))
    expect(run.findings).toEqual([])
    expect(run.status).toBe(0)
  })
})
