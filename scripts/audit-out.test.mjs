import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { environmentHeaders, environmentRoutes } from './environment-headers.mjs'

const script = path.resolve('scripts/audit-out.mjs')
const committedHeaders = fs.readFileSync(path.join('public', '_headers'), 'utf8')
const committedRoutes = fs.readFileSync(path.join('public', '_routes.json'), 'utf8')
const ENVIRONMENTS = ['production', 'staging', 'preview']
const folders = []

afterEach(() => {
  for (const folder of folders.splice(0)) fs.rmSync(folder, { recursive: true, force: true })
})

const robots = {
  production: [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /keystatic/',
    '',
    'Sitemap: https://pitonne.jp/sitemap-index.xml'
  ],
  staging: [
    'User-Agent: *',
    'Disallow: /',
    '',
    'User-Agent: AhrefsSiteAudit',
    'Allow: /',
    'Disallow: /keystatic/',
    '',
    'Sitemap: https://staging.pitonne.jp/sitemap-index.xml'
  ],
  preview: ['User-Agent: *', 'Disallow: /', '', 'Sitemap: https://pitonne.jp/sitemap-index.xml']
}

function built(environment, changes = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `audit-out-${environment}-`))
  folders.push(root)
  const files = {
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
  }
  for (const [file, content] of Object.entries(files)) {
    if (content === null) continue
    const target = path.join(root, 'out', file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content)
  }
  return root
}

function audit(root, deployEnv = {}) {
  const env = { ...process.env, ...deployEnv }
  for (const name of ['DEPLOY_ENV', 'NEXT_PUBLIC_DEPLOY_ENV'])
    if (!(name in deployEnv)) delete env[name]
  const run = spawnSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8' })
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
