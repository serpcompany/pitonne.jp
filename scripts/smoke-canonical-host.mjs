#!/usr/bin/env node
import { pathToFileURL } from 'node:url'

export const CANONICAL_ORIGIN = 'https://pitonne.jp'
export const PAGES_ORIGIN = 'https://pitonne-jp.pages.dev'
export const WWW_ORIGIN = 'https://www.pitonne.jp'
export const SMOKE_TEST_HEADER = 'x-pitonne-smoke-test'
export const SMOKE_HEADERS = { [SMOKE_TEST_HEADER]: '1' }

const ATTEMPTS = 12
const LATER_ATTEMPTS = 2
const FRESH_DEPLOYMENT_MS = 120_000
const RETRY_DELAY_MS = 5000
const REQUEST_TIMEOUT_MS = 10_000

const redirect = (url, location, extra = {}) => ({
  url,
  expect: { status: 308, location },
  ...extra
})

export function redirectChecks(origin, marker) {
  const query = `?smoke=${encodeURIComponent(marker)}`
  return [
    redirect(`${origin}/ja/services/${query}`, `${CANONICAL_ORIGIN}/ja/services/${query}`),
    redirect(`${origin}/contact`, `${CANONICAL_ORIGIN}/contact/`),
    redirect(`${origin}/robots.txt`, `${CANONICAL_ORIGIN}/robots.txt`),
    redirect(`${origin}/en/`, `${CANONICAL_ORIGIN}/`)
  ]
}

export function passThroughChecks(origin, headers = SMOKE_HEADERS) {
  return [
    { url: `${origin}/ja/`, headers, expect: { status: 200, contentType: 'text/html' } },
    {
      url: `${origin}/keystatic/branch/main`,
      headers,
      expect: { status: 200, contentType: 'text/html' }
    },
    { url: `${origin}/en/`, headers, expect: { status: 301, location: '/' } },
    {
      url: `${origin}/sitemap.xml`,
      headers,
      expect: { status: 200, contentType: 'application/xml' }
    },
    { url: `${origin}/no-such-page-smoke-test/`, headers, expect: { status: 404 } }
  ]
}

export function slashedFileChecks(origin, marker, headers) {
  const query = `?smoke=${encodeURIComponent(marker)}`
  const checks = [
    redirect(`${origin}/sitemap-index.xml/${query}`, `${origin}/sitemap-index.xml${query}`),
    redirect(`${origin}/robots.txt/`, `${origin}/robots.txt`)
  ]
  return headers ? checks.map(check => ({ ...check, headers })) : checks
}

export function smokeChecks({ deploymentUrl, marker }) {
  const query = `?smoke=${encodeURIComponent(marker)}`
  const checks = [
    ...redirectChecks(PAGES_ORIGIN, marker),
    ...passThroughChecks(PAGES_ORIGIN),
    ...slashedFileChecks(CANONICAL_ORIGIN, marker),
    redirect(`${WWW_ORIGIN}/ja/services/${query}`, `${CANONICAL_ORIGIN}/ja/services/${query}`, {
      zone: true
    })
  ]
  if (deploymentUrl) {
    const origin = new URL(deploymentUrl).origin
    checks.push(
      ...[
        ...redirectChecks(origin, marker),
        ...passThroughChecks(origin),
        ...slashedFileChecks(origin, marker, SMOKE_HEADERS)
      ].map(check => ({ ...check, fresh: true }))
    )
  }
  return checks
}

export function sameLocation(location, expected, requestUrl) {
  if (!location) return false
  try {
    return new URL(location, requestUrl).href === new URL(expected, requestUrl).href
  } catch {
    return false
  }
}

export function evaluate(check, { status, location, contentType, mitigated }) {
  const { expect } = check
  const label = `${check.url}${check.headers ? ` (with ${Object.keys(check.headers).join(', ')})` : ''}`
  const got = `${status}${location ? ` -> ${location}` : ''}${contentType ? ` [${contentType}]` : ''}`
  const wanted = `${expect.status}${expect.location ? ` -> ${expect.location}` : ''}${
    expect.contentType ? ` [${expect.contentType}]` : ''
  }`
  const matches =
    status === expect.status &&
    (expect.location === undefined || sameLocation(location, expect.location, check.url)) &&
    (expect.contentType === undefined || (contentType ?? '').startsWith(expect.contentType))
  if (matches) return { ok: true, message: `${label}: ${got}` }
  if (check.zone && mitigated) {
    return {
      ok: true,
      warning: true,
      message: `${label}: Cloudflare challenged the CI runner (${status}); not checked.`
    }
  }
  return { ok: false, message: `${label}: ${got}, expected ${wanted}` }
}

export async function probe(check) {
  const response = await fetch(check.url, {
    redirect: 'manual',
    headers: check.headers ?? {},
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })
  await response.body?.cancel()
  return {
    status: response.status,
    location: response.headers.get('location'),
    contentType: response.headers.get('content-type'),
    mitigated: response.headers.has('cf-mitigated')
  }
}

export async function run(
  check,
  { attempts = ATTEMPTS, until = 0, delayMs = RETRY_DELAY_MS, probeFn = probe, now = Date.now } = {}
) {
  let result
  for (let attempt = 1; ; attempt++) {
    try {
      result = evaluate(check, await probeFn(check))
    } catch (error) {
      result = { ok: false, message: `${check.url}: ${error.message}` }
    }
    if (result.ok || (attempt >= attempts && now() >= until)) return result
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}

export async function runChecks(checks, { freshMs = FRESH_DEPLOYMENT_MS, ...options } = {}) {
  const now = options.now ?? Date.now
  let passed = true
  let freshUntil
  for (const [index, check] of checks.entries()) {
    const attempts =
      index === 0 ? options.attempts : Math.min(options.attempts ?? ATTEMPTS, LATER_ATTEMPTS)
    if (check.fresh) freshUntil ??= now() + freshMs
    const result = await run(check, { ...options, attempts, until: check.fresh ? freshUntil : 0 })
    if (!result.ok) passed = false
    const prefix = result.ok ? (result.warning ? '::warning::' : 'ok ') : '::error::'
    console.log(`${prefix}${result.message}`)
  }
  return passed
}

async function main([deploymentUrl]) {
  if (!deploymentUrl) {
    console.log(
      "::warning::No deployment URL given (wrangler-action's deployment-url output was empty); " +
        'checking pitonne-jp.pages.dev and www only.'
    )
  }
  const marker = process.env.GITHUB_SHA?.slice(0, 7) || String(Date.now())
  if (!(await runChecks(smokeChecks({ deploymentUrl, marker })))) process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv.slice(2))
}
