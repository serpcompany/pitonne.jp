#!/usr/bin/env node
// Post-deploy smoke test of environment-specific behaviour (issue #78, SERP environment-configuration standard):
// - production allows crawling, lists its sitemap, and sends no noindex;
// - staging and PR previews disallow crawling in robots.txt and send noindex (X-Robots-Tag header and meta robots).
// Every request carries the smoke-test header, so a deployment URL is served instead of 308ing to pitonne.jp.
// URLs on pages.dev must pass. Branded hosts (pitonne.jp, staging.pitonne.jp) sit behind Bot Fight Mode, which may
// challenge the CI runner: a challenge there is a warning, any other wrong answer still fails.
// Usage: node scripts/smoke-environment.mjs <production|staging|preview> <url> [url...]
import { pathToFileURL } from "node:url"

import { SMOKE_HEADERS } from "./smoke-canonical-host.mjs"

export const SITEMAP_LINE = "Sitemap: https://pitonne.jp/sitemap-index.xml"
const ENVIRONMENTS = new Set(["production", "staging", "preview"])

// A new deployment takes a while to reach the edge, and a brand-new deployment URL can answer 404 for over a minute,
// for some paths while others already work (seen 2026-10-06 on Staging, issue #109). So every check on an origin keeps
// retrying until SETTLE_MS after that origin's first check starts, and gets at least ATTEMPTS tries. Worst case, with
// every request hanging until its timeout, per origin: 135 s + 3 x 2 x 15 s, about 4 minutes; 3 origins on Staging.
const ATTEMPTS = 2
const SETTLE_MS = 120_000
const RETRY_DELAY_MS = 5000
const REQUEST_TIMEOUT_MS = 10_000

const metaRobots = (html) => html.match(/<meta[^>]+name="robots"[^>]*content="([^"]*)"/i)?.[1] ?? null
const hasNoindex = (value) => /\bnoindex\b/i.test(value ?? "")
const disallowsAll = (robots) => /^Disallow:\s*\/\s*$/m.test(robots)

/** The checks for one origin. Each check names what it wants and returns an error message, or null when it passes. */
export function environmentChecks(environment, origin) {
  const production = environment === "production"
  const page = (path) => ({
    url: `${origin}${path}`,
    verify({ status, headers, body }) {
      if (status !== 200) return `status ${status}, expected 200`
      const header = headers.get("x-robots-tag")
      const meta = metaRobots(body)
      if (production) {
        if (hasNoindex(header)) return `sends X-Robots-Tag: ${header} on production`
        if (hasNoindex(meta)) return `has meta robots "${meta}" on production`
      } else {
        if (!hasNoindex(header)) return `X-Robots-Tag is ${header === null ? "missing" : `"${header}"`}, expected noindex`
        if (!hasNoindex(meta)) return `meta robots is ${meta === null ? "missing" : `"${meta}"`}, expected noindex`
      }
      return null
    },
  })

  const robots = {
    url: `${origin}/robots.txt`,
    verify({ status, body }) {
      if (status !== 200) return `status ${status}, expected 200`
      if (production) {
        if (disallowsAll(body)) return "disallows all crawling on production"
        if (!/^Allow:\s*\/\s*$/m.test(body)) return "has no `Allow: /`"
        if (!body.includes(SITEMAP_LINE)) return `doesn't list \`${SITEMAP_LINE}\``
      } else if (!disallowsAll(body)) {
        return "doesn't disallow all crawling (`Disallow: /`)"
      }
      return null
    },
  }

  const checks = [page("/"), page("/ja/"), robots]
  if (production) {
    checks.push({
      url: `${origin}/sitemap-index.xml`,
      verify: ({ status, body }) =>
        status === 200 && body.includes("<sitemapindex") ? null : `status ${status}, expected 200 with a <sitemapindex>`,
    })
  }
  return checks
}

/** Branded hosts may challenge the CI runner (Bot Fight Mode); pages.dev hosts never do. */
export function isZoneHost(url) {
  return !new URL(url).hostname.endsWith(".pages.dev")
}

export async function probe(url) {
  const response = await fetch(url, { headers: SMOKE_HEADERS, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  return { status: response.status, headers: response.headers, body: await response.text() }
}

/**
 * Runs one check, retrying while it fails: at least `attempts` tries, and until `until` (a Date.now() time).
 * Returns { ok, warning?, message }.
 */
export async function run(
  check,
  { attempts = ATTEMPTS, until = 0, delayMs = RETRY_DELAY_MS, probeFn = probe, now = Date.now } = {},
) {
  let message = null
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await probeFn(check.url)
      if (isZoneHost(check.url) && response.headers.has("cf-mitigated")) {
        return { ok: true, warning: true, message: `${check.url}: Cloudflare challenged the CI runner (${response.status}); not checked.` }
      }
      message = check.verify(response)
    } catch (error) {
      message = error.message
    }
    if (message === null) return { ok: true, message: `${check.url}: ok` }
    if (attempt >= attempts && now() >= until) return { ok: false, message: `${check.url}: ${message}` }
    await new Promise((resolve) => setTimeout(resolve, delayMs))
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
    console.log(`${result.ok ? (result.warning ? "::warning::" : "ok ") : "::error::"}${result.message}`)
  }
  return passed
}

async function main([environment, ...urls]) {
  if (!ENVIRONMENTS.has(environment) || urls.filter(Boolean).length === 0) {
    console.error("Usage: node scripts/smoke-environment.mjs <production|staging|preview> <url> [url...]")
    process.exit(2)
  }
  const origins = [...new Set(urls.filter(Boolean).map((url) => new URL(url).origin))]
  const checks = origins.flatMap((origin) => environmentChecks(environment, origin))
  if (!(await runChecks(checks))) process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv.slice(2))
}
