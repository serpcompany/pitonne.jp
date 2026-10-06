#!/usr/bin/env node
// Post-deploy smoke test for the canonical-host redirects (issue #79, functions/_middleware.ts).
// Asserts that each non-canonical host returns one 308 to the same path and query on https://pitonne.jp, and that
// requests the Function passes through still get `_redirects`, `_headers` and 404s from the static asset server.
// Run after a production deploy:
// Usage: node scripts/smoke-canonical-host.mjs <deployment-url>   (for example https://d49a67b6.pitonne-jp.pages.dev)
import { pathToFileURL } from "node:url"

export const CANONICAL_ORIGIN = "https://pitonne.jp"
export const PAGES_ORIGIN = "https://pitonne-jp.pages.dev"
export const WWW_ORIGIN = "https://www.pitonne.jp"
export const SMOKE_TEST_HEADER = "x-pitonne-smoke-test"
export const SMOKE_HEADERS = { [SMOKE_TEST_HEADER]: "1" }

// A new deployment can take a few seconds to replace the previous one at the edge. The first check waits for that
// (up to ATTEMPTS tries); once the edge has answered, every later check gets LATER_ATTEMPTS tries. Worst case, with
// every request hanging until its timeout: 12 x 15 s + 18 x 2 x 15 s, about 12 minutes, inside the job's 20.
const ATTEMPTS = 12
const LATER_ATTEMPTS = 2
const RETRY_DELAY_MS = 5000
const REQUEST_TIMEOUT_MS = 10_000

const redirect = (url, location, extra = {}) => ({ url, expect: { status: 308, location }, ...extra })

/** One 308 from a non-canonical origin (pages.dev, a deployment URL) to the matching pitonne.jp URL. */
export function redirectChecks(origin, marker) {
  const query = `?smoke=${encodeURIComponent(marker)}`
  return [
    redirect(`${origin}/ja/services/${query}`, `${CANONICAL_ORIGIN}/ja/services/${query}`),
    redirect(`${origin}/contact`, `${CANONICAL_ORIGIN}/contact/`),
    redirect(`${origin}/robots.txt`, `${CANONICAL_ORIGIN}/robots.txt`),
    // A `_redirects` rule is folded into the same hop: /en/ -> / on the canonical host
    redirect(`${origin}/en/`, `${CANONICAL_ORIGIN}/`),
  ]
}

/**
 * What the Function passes through must still reach the static asset server unchanged. On a non-canonical host this
 * needs the smoke-test header (`headers`); it is the same `next()` path every pitonne.jp request takes.
 */
export function passThroughChecks(origin, headers = SMOKE_HEADERS) {
  return [
    { url: `${origin}/ja/`, headers, expect: { status: 200, contentType: "text/html" } },
    // `_redirects`: the Keystatic single-page-app rewrite and a legacy 301
    { url: `${origin}/keystatic/branch/main`, headers, expect: { status: 200, contentType: "text/html" } },
    { url: `${origin}/en/`, headers, expect: { status: 301, location: "/" } },
    // `_headers`
    { url: `${origin}/sitemap.xml`, headers, expect: { status: 200, contentType: "application/xml" } },
    { url: `${origin}/no-such-page-smoke-test/`, headers, expect: { status: 404 } },
  ]
}

/** The production checks run after each deploy to main. `zone: true` marks www, which a zone rule redirects. */
export function smokeChecks({ deploymentUrl, marker }) {
  const query = `?smoke=${encodeURIComponent(marker)}`
  const checks = [
    ...redirectChecks(PAGES_ORIGIN, marker),
    ...passThroughChecks(PAGES_ORIGIN),
    redirect(`${WWW_ORIGIN}/ja/services/${query}`, `${CANONICAL_ORIGIN}/ja/services/${query}`, { zone: true }),
  ]
  if (deploymentUrl) {
    const origin = new URL(deploymentUrl).origin
    checks.push(...redirectChecks(origin, marker), ...passThroughChecks(origin))
  }
  return checks
}

/** Whether a `location` header points where expected; relative and absolute forms resolve against the request URL. */
export function sameLocation(location, expected, requestUrl) {
  if (!location) return false
  try {
    return new URL(location, requestUrl).href === new URL(expected, requestUrl).href
  } catch {
    return false
  }
}

/** Compares one response with its check. Returns { ok, warning?, message }. */
export function evaluate(check, { status, location, contentType, mitigated }) {
  const { expect } = check
  const label = `${check.url}${check.headers ? ` (with ${Object.keys(check.headers).join(", ")})` : ""}`
  const got = `${status}${location ? ` -> ${location}` : ""}${contentType ? ` [${contentType}]` : ""}`
  const wanted = `${expect.status}${expect.location ? ` -> ${expect.location}` : ""}${
    expect.contentType ? ` [${expect.contentType}]` : ""
  }`
  const matches =
    status === expect.status &&
    (expect.location === undefined || sameLocation(location, expect.location, check.url)) &&
    (expect.contentType === undefined || (contentType ?? "").startsWith(expect.contentType))
  if (matches) return { ok: true, message: `${label}: ${got}` }
  if (check.zone && status === 301 && sameLocation(location, expect.location, check.url)) {
    return {
      ok: true,
      warning: true,
      message: `${label}: ${got}, expected ${wanted}. Change the www zone redirect rule's status code to 308.`,
    }
  }
  if (check.zone && mitigated) {
    return { ok: true, warning: true, message: `${label}: Cloudflare challenged the CI runner (${status}); not checked.` }
  }
  return { ok: false, message: `${label}: ${got}, expected ${wanted}` }
}

export async function probe(check) {
  const response = await fetch(check.url, {
    redirect: "manual",
    headers: check.headers ?? {},
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  await response.body?.cancel()
  return {
    status: response.status,
    location: response.headers.get("location"),
    contentType: response.headers.get("content-type"),
    mitigated: response.headers.has("cf-mitigated"),
  }
}

/** Runs one check, retrying while it fails. */
export async function run(check, { attempts = ATTEMPTS, delayMs = RETRY_DELAY_MS, probeFn = probe } = {}) {
  let result
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      result = evaluate(check, await probeFn(check))
    } catch (error) {
      result = { ok: false, message: `${check.url}: ${error.message}` }
    }
    if (result.ok) return result
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return result
}

/** Runs every check, prints GitHub annotations for warnings and failures, and returns true when all passed. */
export async function runChecks(checks, options = {}) {
  let passed = true
  for (const [index, check] of checks.entries()) {
    const attempts = index === 0 ? options.attempts : Math.min(options.attempts ?? ATTEMPTS, LATER_ATTEMPTS)
    const result = await run(check, { ...options, attempts })
    if (!result.ok) passed = false
    const prefix = result.ok ? (result.warning ? "::warning::" : "ok ") : "::error::"
    console.log(`${prefix}${result.message}`)
  }
  return passed
}

async function main([deploymentUrl]) {
  if (!deploymentUrl) {
    console.log(
      "::warning::No deployment URL given (wrangler-action's deployment-url output was empty); " +
        "checking pitonne-jp.pages.dev and www only.",
    )
  }
  const marker = process.env.GITHUB_SHA?.slice(0, 7) || String(Date.now())
  if (!(await runChecks(smokeChecks({ deploymentUrl, marker })))) process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv.slice(2))
}
