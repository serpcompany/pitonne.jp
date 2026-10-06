#!/usr/bin/env node
// Post-deploy smoke test for the canonical-host redirects (issue #79, functions/_middleware.ts).
// Asserts that each non-canonical host returns one 308 to the same path and query on https://pitonne.jp, and that
// the smoke-test header still reaches the deployment. Run after a production deploy:
// Usage: node scripts/smoke-canonical-host.mjs [deployment-url]   (for example https://d49a67b6.pitonne-jp.pages.dev)
import { pathToFileURL } from "node:url"

export const CANONICAL_ORIGIN = "https://pitonne.jp"
export const PAGES_ORIGIN = "https://pitonne-jp.pages.dev"
export const WWW_ORIGIN = "https://www.pitonne.jp"
export const SMOKE_TEST_HEADER = "x-pitonne-smoke-test"

// A new deployment can take a few seconds to replace the previous one at the edge.
const ATTEMPTS = 12
const RETRY_DELAY_MS = 5000

/**
 * The checks to run. `redirect` checks expect one 308 to `location`; `serve` checks expect a 200.
 * `zone: true` marks www, which a Cloudflare zone rule (not the Function) redirects.
 */
export function smokeChecks({ deploymentUrl, marker }) {
  const query = `?smoke=${encodeURIComponent(marker)}`
  const checks = [
    { kind: "redirect", url: `${PAGES_ORIGIN}/ja/services/${query}`, location: `${CANONICAL_ORIGIN}/ja/services/${query}` },
    { kind: "redirect", url: `${PAGES_ORIGIN}/contact`, location: `${CANONICAL_ORIGIN}/contact/` },
    { kind: "redirect", url: `${PAGES_ORIGIN}/robots.txt`, location: `${CANONICAL_ORIGIN}/robots.txt` },
    { kind: "serve", url: `${PAGES_ORIGIN}/`, headers: { [SMOKE_TEST_HEADER]: "1" } },
    { kind: "redirect", url: `${WWW_ORIGIN}/ja/services/${query}`, location: `${CANONICAL_ORIGIN}/ja/services/${query}`, zone: true },
  ]
  if (deploymentUrl) {
    const origin = new URL(deploymentUrl).origin
    checks.push(
      { kind: "redirect", url: `${origin}/ja/${query}`, location: `${CANONICAL_ORIGIN}/ja/${query}` },
      { kind: "serve", url: `${origin}/ja/`, headers: { [SMOKE_TEST_HEADER]: "1" } },
    )
  }
  return checks
}

/** Compares one response with its check. Returns { ok, warning?, message }. */
export function evaluate(check, { status, location, mitigated }) {
  const got = `${status}${location ? ` -> ${location}` : ""}`
  if (check.kind === "serve") {
    return { ok: status === 200, message: `${check.url} (with ${SMOKE_TEST_HEADER}): ${got}, expected 200` }
  }
  const expected = `308 -> ${check.location}`
  if (status === 308 && location === check.location) return { ok: true, message: `${check.url}: ${got}` }
  if (check.zone && status === 301 && location === check.location) {
    return {
      ok: true,
      warning: true,
      message: `${check.url}: ${got}, expected ${expected}. Change the www zone redirect rule's status code to 308.`,
    }
  }
  if (check.zone && mitigated) {
    return { ok: true, warning: true, message: `${check.url}: Cloudflare challenged the CI runner (${status}); not checked.` }
  }
  return { ok: false, message: `${check.url}: ${got}, expected ${expected}` }
}

async function probe(check) {
  const response = await fetch(check.url, { redirect: "manual", headers: check.headers ?? {} })
  await response.body?.cancel()
  return {
    status: response.status,
    location: response.headers.get("location"),
    mitigated: response.headers.has("cf-mitigated"),
  }
}

async function run(check) {
  let result
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      result = evaluate(check, await probe(check))
    } catch (error) {
      result = { ok: false, message: `${check.url}: ${error.message}` }
    }
    if (result.ok) return result
    if (attempt < ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
  }
  return result
}

async function main([deploymentUrl]) {
  const marker = process.env.GITHUB_SHA?.slice(0, 7) || String(Date.now())
  let failed = false
  for (const check of smokeChecks({ deploymentUrl, marker })) {
    const result = await run(check)
    if (!result.ok) failed = true
    const prefix = result.ok ? (result.warning ? "::warning::" : "ok ") : "::error::"
    console.log(`${prefix}${result.message}`)
  }
  if (failed) process.exit(1)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv.slice(2))
}
