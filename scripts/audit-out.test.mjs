import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { main } from './audit-out.mjs'
import { robots, runAudit, tempTrees } from './audit-test-helpers.mjs'
import { environmentHeaders, environmentRoutes } from './environment-headers.mjs'

const committedHeaders = fs.readFileSync(path.join('public', '_headers'), 'utf8')
const committedRoutes = fs.readFileSync(path.join('public', '_routes.json'), 'utf8')
const ENVIRONMENTS = ['production', 'staging', 'preview']
const tree = tempTrees()

function built(environment, changes = {}) {
  return tree(
    `audit-out-${environment}-`,
    {
      'index.html': '<html lang="en"></html>',
      'ja/index.html': '<html lang="ja"></html>',
      '404.html':
        '<html lang="en"><head><meta name="robots" content="noindex"></head><a href="/">Home</a></html>',
      'robots.txt': `${robots[environment].join('\n')}\n`,
      _headers: environmentHeaders(committedHeaders, environment),
      _redirects: '/en/* /:splat 301\n',
      '_routes.json': environmentRoutes(committedRoutes, environment),
      'sitemap-index.xml':
        '<sitemapindex><sitemap><loc>https://pitonne.jp/sitemap-pages.xml</loc></sitemap></sitemapindex>',
      'sitemap-pages.xml': '<urlset></urlset>',
      'sitemap.xml': '<urlset></urlset>',
      ...changes
    },
    'out'
  )
}

function audit(root, deployEnv = {}) {
  const run = runAudit(main, [], { cwd: root, env: deployEnv })
  const problems = run.stderr
    .split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2))
  return { status: run.status, problems, log: run.stdout + run.stderr }
}

const lacks = (file, text, environment) =>
  `out/${file} lacks "${text}", which a ${environment} build needs`
const has = (file, text, environment) =>
  `out/${file} has "${text}", which a ${environment} build must not`
const STAGING_SITEMAP = 'Sitemap: https://staging.pitonne.jp/sitemap-index.xml'

describe('pnpm audit:out', () => {
  it.each(ENVIRONMENTS)('passes a %s build, with its DEPLOY_ENV or with none', environment => {
    const root = built(environment)
    const withEnvironment = audit(root, { DEPLOY_ENV: environment })
    expect(withEnvironment.status, withEnvironment.log).toBe(0)
    expect(withEnvironment.log).toContain(`${environment} indexing signals`)
    const without = audit(root)
    expect(without.status, without.log).toBe(0)
    expect(without.log).not.toContain('indexing signals')
  })

  it.each([
    [
      'production',
      'staging',
      [
        lacks('robots.txt', 'Disallow: /', 'staging'),
        lacks('robots.txt', 'User-Agent: AhrefsSiteAudit', 'staging'),
        lacks('robots.txt', STAGING_SITEMAP, 'staging')
      ]
    ],
    [
      'production',
      'preview',
      [
        lacks('robots.txt', 'Disallow: /', 'preview'),
        lacks('_headers', 'X-Robots-Tag: noindex', 'preview')
      ]
    ],
    ['staging', 'production', [has('robots.txt', 'Disallow: /', 'production')]],
    ['staging', 'preview', [lacks('_headers', 'X-Robots-Tag: noindex', 'preview')]],
    [
      'preview',
      'production',
      [
        has('robots.txt', 'Disallow: /', 'production'),
        has('_headers', 'X-Robots-Tag: noindex', 'production')
      ]
    ],
    [
      'preview',
      'staging',
      [
        lacks('robots.txt', 'User-Agent: AhrefsSiteAudit', 'staging'),
        lacks('robots.txt', STAGING_SITEMAP, 'staging'),
        has('_headers', 'X-Robots-Tag: noindex', 'staging')
      ]
    ]
  ])('fails a %s build deployed as %s, on each signal that differs', (build, deployed, problems) => {
    const result = audit(built(build), { DEPLOY_ENV: deployed, NEXT_PUBLIC_DEPLOY_ENV: deployed })
    expect(result.status).toBe(1)
    expect(result.problems.sort()).toEqual([...problems].sort())
  })

  it('fails a Staging build whose robots.txt lists another sitemap, which only the Staging signals see', () => {
    const robotsTxt = robots.staging.join('\n').replace(STAGING_SITEMAP, robots.production.at(-1))
    const root = built('staging', { 'robots.txt': robotsTxt })
    expect(audit(root).status).toBe(0)
    expect(audit(root, { DEPLOY_ENV: 'staging' }).problems).toEqual([
      lacks('robots.txt', STAGING_SITEMAP, 'staging')
    ])
  })

  it.each([
    { DEPLOY_ENV: 'qa' },
    { DEPLOY_ENV: 'staging', NEXT_PUBLIC_DEPLOY_ENV: 'production' }
  ])('checks %j as a preview, as the build resolves it', deployEnv => {
    expect(audit(built('preview'), deployEnv).status).toBe(0)
    expect(audit(built('production'), deployEnv).problems).toContain(
      lacks('_headers', 'X-Robots-Tag: noindex', 'preview')
    )
  })

  it.each([
    ...ENVIRONMENTS.map(environment => [environment, { DEPLOY_ENV: environment }]),
    ['production', {}]
  ])('checks the files Pages needs in a %s build audited with %j', (environment, deployEnv) => {
    const root = built(environment, {
      _redirects: null,
      'en/index.html': '<html lang="en"></html>'
    })
    const result = audit(root, deployEnv)
    expect(result.status).toBe(1)
    expect(result.problems).toEqual(['missing out/_redirects', 'unexpected out/en'])
  })
})

describe('pnpm audit:out on a broken export', () => {
  const problemsOf = (environment, changes, deployEnv) => {
    const result = audit(built(environment, changes), deployEnv)
    expect(result.status).toBe(1)
    expect(result.log).toContain('Export audit failed (run `pnpm build` first):')
    return result.problems
  }

  it('names the sitemap index and the routes file when they are missing', () => {
    expect(problemsOf('production', { 'sitemap-index.xml': null, '_routes.json': null })).toEqual([
      'missing out/_routes.json',
      'missing out/sitemap-index.xml'
    ])
  })

  it('fails a sitemap index that lists no sitemaps, and one that lists a missing sitemap', () => {
    expect(
      problemsOf('production', { 'sitemap-index.xml': '<sitemapindex></sitemapindex>' })
    ).toEqual(['out/sitemap-index.xml lists no sitemaps'])
    expect(problemsOf('production', { 'sitemap-pages.xml': null })).toEqual([
      'missing out/sitemap-pages.xml'
    ])
  })

  it('fails each page under a path _routes.json keeps off the Function, and nothing else there', () => {
    const routes = {
      include: ['/*'],
      exclude: ['/images/*', '/icon.svg', '/legacy.html', '/gone/*']
    }
    const problems = problemsOf('production', {
      '_routes.json': JSON.stringify(routes),
      'images/gallery/index.html': '<html lang="en"></html>',
      'images/photo.png': 'png',
      'icon.svg': '<svg></svg>',
      'legacy.html': '<html lang="en"></html>'
    })
    const offTheFunction = file =>
      `out/${file} is a page under a path _routes.json keeps off the Function`
    expect(problems).toEqual([
      offTheFunction(path.join('images', 'gallery', 'index.html')),
      offTheFunction('legacy.html')
    ])
  })

  it('fails robots.txt and _headers that disagree about indexing', () => {
    expect(problemsOf('production', { 'robots.txt': `${robots.preview.join('\n')}\n` })).toEqual([
      'out/robots.txt disallows crawling but out/_headers sends no X-Robots-Tag: noindex'
    ])
    const previewHeaders = environmentHeaders(committedHeaders, 'preview')
    expect(problemsOf('production', { _headers: previewHeaders })).toEqual([
      'out/_headers sends X-Robots-Tag: noindex but out/robots.txt allows crawling'
    ])
  })

  it.each([
    ['the committed routes', committedRoutes],
    ['routes that include only the homepage', JSON.stringify({ include: ['/'], exclude: [] })]
  ])('fails a Staging build whose password gate misses paths, with %s', (_, routes) => {
    expect(problemsOf('staging', { '_routes.json': routes })).toContain(
      'out/robots.txt admits only AhrefsSiteAudit, so the password gate must cover every path, but out/_routes.json keeps paths off the Function'
    )
  })

  it('reports a missing robots.txt and _headers once, without the signals they would carry', () => {
    expect(
      problemsOf('preview', { 'robots.txt': null, _headers: null }, { DEPLOY_ENV: 'preview' })
    ).toEqual(['missing out/robots.txt', 'missing out/_headers'])
  })

  it('reports a missing 404 page only as missing', () => {
    expect(problemsOf('production', { '404.html': null })).toEqual(['missing out/404.html'])
  })

  it.each([
    [
      'a bare page',
      '<p>Not found</p>',
      [
        'out/404.html has no <html lang="en">',
        'out/404.html has 0 robots meta tags, expected one with noindex',
        'out/404.html has no link to /'
      ]
    ],
    [
      'a Japanese page linking only to the Japanese home',
      '<html lang="ja"><meta name="robots" content="noindex"><a href="/ja/">Home</a></html>',
      ['out/404.html has no <html lang="en">', 'out/404.html has no link to /']
    ],
    [
      'two robots tags',
      '<html lang="en"><meta name="robots" content="noindex"><meta name="robots" content="noindex"><a href="/">Home</a></html>',
      ['out/404.html has 2 robots meta tags, expected one with noindex']
    ],
    [
      'an indexable robots tag',
      '<html lang="en"><meta name="robots" content="index"><a href="/">Home</a></html>',
      ['out/404.html has 1 robots meta tags, expected one with noindex']
    ]
  ])('fails a 404 page that is %s', (_, page, problems) => {
    expect(problemsOf('production', { '404.html': page })).toEqual(problems)
  })
})
