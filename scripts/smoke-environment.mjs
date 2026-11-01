#!/usr/bin/env node
import { runMain } from './run-main.mjs'
import { MISSING_PAGE_PATH, SMOKE_HEADERS } from './smoke-canonical-host.mjs'

export const SITEMAP_LINE = 'Sitemap: https://pitonne.jp/sitemap-index.xml'
const ENVIRONMENTS = new Set(['production', 'staging', 'preview'])

const ATTEMPTS = 2
const SETTLE_MS = 120_000
const RETRY_DELAY_MS = 5000
const REQUEST_TIMEOUT_MS = 10_000

const robotsMetaTags = html =>
  [...html.matchAll(/<meta[^>]+name="robots"[^>]*content="([^"]*)"/gi)].map(match => match[1])
const metaRobots = html => robotsMetaTags(html)[0] ?? null
const hasNoindex = value => /\bnoindex\b/i.test(value ?? '')
const disallowsAll = robots => /^Disallow:\s*\/\s*$/m.test(robots)

export function environmentChecks(environment, origin) {
  const production = environment === 'production'
  const page = path => ({
    url: `${origin}${path}`,
    verify({ status, headers, body }) {
      if (status !== 200) return `status ${status}, expected 200`
      const header = headers.get('x-robots-tag')
      const meta = metaRobots(body)
      if (production) {
        if (hasNoindex(header)) return `sends X-Robots-Tag: ${header} on production`
        if (hasNoindex(meta)) return `has meta robots "${meta}" on production`
      } else {
        if (!hasNoindex(header))
          return `X-Robots-Tag is ${header === null ? 'missing' : `"${header}"`}, expected noindex`
        if (!hasNoindex(meta))
          return `meta robots is ${meta === null ? 'missing' : `"${meta}"`}, expected noindex`
      }
      return null
    }
  })

  const robots = {
    url: `${origin}/robots.txt`,
    verify({ status, body }) {
      if (status !== 200) return `status ${status}, expected 200`
      if (production) {
        if (disallowsAll(body)) return 'disallows all crawling on production'
        if (!/^Allow:\s*\/\s*$/m.test(body)) return 'has no `Allow: /`'
        if (!body.includes(SITEMAP_LINE)) return `doesn't list \`${SITEMAP_LINE}\``
      } else if (!disallowsAll(body)) {
        return "doesn't disallow all crawling (`Disallow: /`)"
      }
      return null
    }
  }

  const missingPage = {
    url: `${origin}${MISSING_PAGE_PATH}`,
    redirect: 'manual',
    verify({ status, body }) {
      if (status !== 404) return `status ${status}, expected 404`
      const tags = robotsMetaTags(body)
      if (tags.length !== 1 || !hasNoindex(tags[0]))
        return `has ${tags.length} meta robots tags (${tags.join('; ')}), expected one with noindex`
      if (!/<a\s[^>]*href="\/"/.test(body)) return 'has no link to the home page'
      return null
    }
  }

  const checks = [page('/'), page('/ja/'), robots, missingPage]
  if (production) {
    checks.push({
      url: `${origin}/sitemap-index.xml`,
      verify: ({ status, body }) =>
        status === 200 && body.includes('<sitemapindex')
          ? null
          : `status ${status}, expected 200 with a <sitemapindex>`
    })
  }
  return checks
}

export function isZoneHost(url) {
  return !new URL(url).hostname.endsWith('.pages.dev')
}

async function probe(url, { redirect } = {}) {
  const response = await fetch(url, {
    headers: SMOKE_HEADERS,
    redirect,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })
  return { status: response.status, headers: response.headers, body: await response.text() }
}

export async function run(
  check,
  { attempts = ATTEMPTS, until = 0, delayMs = RETRY_DELAY_MS, probeFn = probe, now = Date.now } = {}
) {
  let message = null
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await probeFn(check.url, { redirect: check.redirect })
      if (isZoneHost(check.url) && response.headers.has('cf-mitigated')) {
        return {
          ok: true,
          warning: true,
          message: `${check.url}: Cloudflare challenged the CI runner (${response.status}); not checked.`
        }
      }
      message = check.verify(response)
    } catch (error) {
      message = error.message
    }
    if (message === null) return { ok: true, message: `${check.url}: ok` }
    if (attempt >= attempts && now() >= until)
      return { ok: false, message: `${check.url}: ${message}` }
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}

export async function runChecks(checks, { settleMs = SETTLE_MS, ...options } = {}) {
  const now = options.now ?? Date.now
  const settleUntil = new Map()
  let passed = true
  for (const check of checks) {
    const { origin } = new URL(check.url)
    if (!settleUntil.has(origin)) settleUntil.set(origin, now() + settleMs)
    const result = await run(check, { ...options, until: settleUntil.get(origin) })
    if (!result.ok) passed = false
    console.log(
      `${result.ok ? (result.warning ? '::warning::' : 'ok ') : '::error::'}${result.message}`
    )
  }
  return passed
}

async function main([environment, ...urls]) {
  if (!ENVIRONMENTS.has(environment) || urls.filter(Boolean).length === 0) {
    console.error(
      'Usage: node scripts/smoke-environment.mjs <production|staging|preview> <url> [url...]'
    )
    process.exit(2)
  }
  const origins = [...new Set(urls.filter(Boolean).map(url => new URL(url).origin))]
  const checks = origins.flatMap(origin => environmentChecks(environment, origin))
  if (!(await runChecks(checks))) process.exit(1)
}

await runMain(import.meta.url, main)
