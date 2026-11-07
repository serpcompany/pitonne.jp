import { main } from './audit-seo-build.mjs'
import { robots, runAudit } from './audit-test-helpers.mjs'

export const SITE = 'https://pitonne.jp'
const PAGE_TITLE = 'Pitonne clinic test page'
const PAGE_DESCRIPTION = 'D'.repeat(120)

export function seoPage({
  url,
  title = PAGE_TITLE,
  description = PAGE_DESCRIPTION,
  canonical = url,
  ogUrl = canonical,
  og = true,
  h1 = '<h1>Heading</h1>',
  robots: robotsContent = null,
  head = '',
  links = []
}) {
  const tags = [
    title === null ? '' : `<title>${title}</title>`,
    description === null ? '' : `<meta name="description" content="${description}">`,
    canonical === null ? '' : `<link rel="canonical" href="${canonical}">`,
    robotsContent === null ? '' : `<meta name="robots" content="${robotsContent}">`,
    og
      ? [
          '<meta property="og:title" content="Title">',
          '<meta property="og:description" content="Description">',
          `<meta property="og:image" content="${SITE}/og.png">`,
          `<meta property="og:url" content="${ogUrl}">`,
          '<meta property="og:type" content="website">'
        ].join('')
      : '',
    head
  ].join('')
  const anchors = links.map(href => `<a href="${href}">Link</a>`).join('')
  return `<!doctype html><html lang="en"><head>${tags}</head><body>${h1}${anchors}</body></html>`
}

export const urlset = (...urls) =>
  `<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls
    .map(url => `<url><loc>${url}</loc></url>`)
    .join('')}</urlset>`

export const sitemapIndex = (...locs) =>
  `<sitemapindex>${locs.map(loc => `<sitemap><loc>${loc}</loc></sitemap>`).join('')}</sitemapindex>`

export function seoSite(origin = SITE, changes = {}) {
  const index = sitemapIndex(`${origin}/sitemap-pages.xml`)
  const environment = origin === SITE ? 'production' : 'staging'
  return {
    'index.html': seoPage({ url: origin, links: ['/about/', '/ja/', 'https://example.com/'] }),
    'ja/index.html': seoPage({
      url: `${origin}/ja/`,
      links: ['/', '#top', 'mailto:hi@example.com']
    }),
    'about/index.html': seoPage({ url: `${origin}/about/`, links: ['/images/photo.png'] }),
    '404.html': '<html><title>404</title></html>',
    '_not-found/index.html': '<html><title>404</title></html>',
    '_next/static/chunk.html': '<html></html>',
    'keystatic/index.html': '<html></html>',
    'images/photo.png': 'png',
    'robots.txt': `${robots[environment].join('\n')}\n`,
    _redirects: '/en/* /:splat 308\n\n/old /about/ 301\n',
    'sitemap-index.xml': index,
    'sitemap.xml': index,
    'sitemap-pages.xml': urlset(origin, `${origin}/ja/`, `${origin}/about/`).replace(
      '</url>',
      `<xhtml:link rel="alternate" hreflang="ja" href="${origin}/ja/" /></url>`
    ),
    ...changes
  }
}

export function auditSeo(tree, files, { env = {}, argv = [], under = 'out' } = {}) {
  const root = tree('audit-seo-', files, under)
  const run = runAudit(main, argv, { cwd: root, env })
  const [listed] = run.stdout.split('\n\n')
  return { ...run, root, findings: run.status === 1 ? listed.split('\n').sort() : [] }
}
