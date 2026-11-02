#!/usr/bin/env node
import { DEPLOY_ENVIRONMENTS, siteOrigin } from '../src/lib/deploy-environment.mts'
import { blocksEverything } from './robots-txt.mjs'
import { runMain } from './run-main.mjs'
import {
  MISSING_PAGE_PATH,
  REQUEST_TIMEOUT_MS,
  RETRY_DELAY_MS,
  SMOKE_HEADERS
} from './smoke-canonical-host.mjs'

const sitemapLine = origin => `Sitemap: ${origin}/sitemap-index.xml`
export const SITEMAP_LINE = sitemapLine(siteOrigin('production'))
export const STAGING_ORIGIN = siteOrigin('staging')
const STAGING_PASSWORD = 'stagingpassword'
export const PASSWORD_HEADERS = {
  authorization: `Basic ${Buffer.from(`smoke:${STAGING_PASSWORD}`).toString('base64')}`
}
const ENVIRONMENTS = new Set(DEPLOY_ENVIRONMENTS)

const ATTEMPTS = 2
const SETTLE_MS = 120_000

const robotsMetaTags = html =>
  [...html.matchAll(/<meta[^>]+name="robots"[^>]*content="([^"]*)"/gi)].map(match => match[1])
const metaRobots = html => robotsMetaTags(html)[0] ?? null
const hasNoindex = value => /\bnoindex\b/i.test(value ?? '')
const canonicalOf = html => html.match(/<link[^>]+rel="canonical"[^>]*href="([^"]*)"/i)?.[1] ?? null
const shown = value => (value === null ? 'missing' : `"${value}"`)

function noindexProblem({ headers, body }) {
  const header = headers.get('x-robots-tag')
  const meta = metaRobots(body)
  if (hasNoindex(header)) return `sends X-Robots-Tag: ${header}`
  if (hasNoindex(meta)) return `has meta robots "${meta}"`
  return null
}

function stagingCanonicalProblem(path, body) {
  const expected = path === '/' ? STAGING_ORIGIN : `${STAGING_ORIGIN}${path}`
  const canonical = canonicalOf(body)
  return canonical === expected ? null : `canonical is ${shown(canonical)}, expected ${expected}`
}

const withoutSmokeHeader = (url, verify, headers = {}) => ({
  url,
  headers,
  redirect: 'manual',
  verify
})

function stagingGateChecks(origin) {
  const locked = path =>
    withoutSmokeHeader(`${origin}${path}`, ({ status, headers }) => {
      if (status !== 401) return `status ${status} without the password, expected 401`
      const challenge = headers.get('www-authenticate')
      if (!/^Basic\b/i.test(challenge ?? ''))
        return `WWW-Authenticate is ${shown(challenge)}, expected Basic`
      const cacheControl = headers.get('cache-control')
      if (!/\bno-store\b/.test(cacheControl ?? ''))
        return `Cache-Control is ${shown(cacheControl)}, expected no-store`
      const robots = headers.get('x-robots-tag')
      return hasNoindex(robots) ? null : `X-Robots-Tag is ${shown(robots)}, expected noindex`
    })
  const unlocked = path =>
    withoutSmokeHeader(
      `${origin}${path}`,
      response => {
        if (response.status !== 200)
          return `status ${response.status} with the password, expected 200`
        const problem = noindexProblem(response)
        return problem
          ? `${problem} with the password`
          : stagingCanonicalProblem(path, response.body)
      },
      PASSWORD_HEADERS
    )
  const robots = withoutSmokeHeader(`${origin}/robots.txt`, ({ status, body }) => {
    if (status !== 200) return `status ${status} without the password, expected 200`
    if (!blocksEverything(body)) return "doesn't disallow all crawlers (`Disallow: /` for `*`)"
    const line = sitemapLine(STAGING_ORIGIN)
    return body.includes(line) ? null : `doesn't list \`${line}\``
  })
  return [
    locked('/'),
    locked('/ja/'),
    locked('/favicon.ico'),
    unlocked('/'),
    unlocked('/ja/'),
    robots
  ]
}

const stagingHostRedirect = origin =>
  withoutSmokeHeader(`${origin}/contact`, ({ status, headers }) => {
    const location = headers.get('location')
    const expected = `${STAGING_ORIGIN}/contact/`
    return status === 308 && location === expected
      ? null
      : `status ${status} to ${shown(location)}, expected 308 to ${expected}`
  })

const withoutPasswordPrompt = check => ({
  ...check,
  verify: response =>
    response.headers.has('www-authenticate')
      ? `sends WWW-Authenticate: ${response.headers.get('www-authenticate')} on production`
      : check.verify(response)
})

export function environmentChecks(environment, origin) {
  const production = environment === 'production'
  const staging = environment === 'staging'
  const page = path => ({
    url: `${origin}${path}`,
    verify(response) {
      const { status, headers, body } = response
      if (status !== 200) return `status ${status}, expected 200`
      if (production) {
        const problem = noindexProblem(response)
        return problem && `${problem} on production`
      }
      const header = headers.get('x-robots-tag')
      if (!hasNoindex(header)) return `X-Robots-Tag is ${shown(header)}, expected noindex`
      if (staging) return stagingCanonicalProblem(path, body)
      const meta = metaRobots(body)
      return hasNoindex(meta) ? null : `meta robots is ${shown(meta)}, expected noindex`
    }
  })

  const robots = {
    url: `${origin}/robots.txt`,
    verify({ status, body }) {
      if (status !== 200) return `status ${status}, expected 200`
      if (production) {
        if (blocksEverything(body)) return 'disallows all crawling on production'
        if (!/^Allow:\s*\/\s*$/m.test(body)) return 'has no `Allow: /`'
        if (!body.includes(SITEMAP_LINE)) return `doesn't list \`${SITEMAP_LINE}\``
      } else if (!blocksEverything(body)) {
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
  if (staging) {
    checks.push(
      ...(origin === STAGING_ORIGIN ? stagingGateChecks(origin) : [stagingHostRedirect(origin)])
    )
  }
  if (production) {
    checks.push({
      url: `${origin}/sitemap-index.xml`,
      verify: ({ status, body }) =>
        status === 200 && body.includes('<sitemapindex')
          ? null
          : `status ${status}, expected 200 with a <sitemapindex>`
    })
    return checks.map(withoutPasswordPrompt)
  }
  return checks
}

export function isZoneHost(url) {
  return !new URL(url).hostname.endsWith('.pages.dev')
}

async function probe(url, { redirect, headers = SMOKE_HEADERS } = {}) {
  const response = await fetch(url, {
    headers,
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
      const response = await probeFn(check.url, {
        redirect: check.redirect,
        headers: check.headers
      })
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
