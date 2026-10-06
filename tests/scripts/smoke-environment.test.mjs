import { describe, expect, it, vi } from "vitest"
import { SMOKE_HEADERS } from "../../scripts/smoke-canonical-host.mjs"
import { SITEMAP_LINE, environmentChecks, isZoneHost, run, runChecks } from "../../scripts/smoke-environment.mjs"

const PRODUCTION_ROBOTS = `User-Agent: *\nAllow: /\nDisallow: /keystatic/\n\n${SITEMAP_LINE}\n`
const STAGING_ROBOTS = "User-Agent: *\nDisallow: /\n\nSitemap: https://pitonne.jp/sitemap-index.xml\n"
const html = (robots) => `<html><head><meta name="robots" content="${robots}"/></head><body></body></html>`
const response = (status, body, headers = {}) => ({ status, body, headers: new Headers(headers) })

const byPath = (environment) =>
  Object.fromEntries(environmentChecks(environment, "https://x.pages.dev").map((check) => [new URL(check.url).pathname, check]))

describe("environment smoke test", () => {
  it("checks pages in both locales and robots.txt everywhere, and the sitemap index on production", () => {
    expect(Object.keys(byPath("staging"))).toEqual(["/", "/ja/", "/robots.txt"])
    expect(Object.keys(byPath("preview"))).toEqual(["/", "/ja/", "/robots.txt"])
    expect(Object.keys(byPath("production"))).toEqual(["/", "/ja/", "/robots.txt", "/sitemap-index.xml"])
  })

  it("requires production to allow crawling, list its sitemap and send no noindex", () => {
    const checks = byPath("production")
    expect(checks["/robots.txt"].verify(response(200, PRODUCTION_ROBOTS))).toBeNull()
    expect(checks["/robots.txt"].verify(response(200, STAGING_ROBOTS))).toMatch(/disallows/)
    expect(checks["/robots.txt"].verify(response(200, "User-Agent: *\nAllow: /\n"))).toMatch(/Sitemap/)
    expect(checks["/"].verify(response(200, html("index, follow")))).toBeNull()
    expect(checks["/"].verify(response(200, html("noindex, nofollow")))).toMatch(/meta robots/)
    expect(checks["/"].verify(response(200, html("index, follow"), { "x-robots-tag": "noindex" }))).toMatch(/X-Robots-Tag/)
    expect(checks["/ja/"].verify(response(404, html("index, follow")))).toMatch(/404/)
    expect(checks["/sitemap-index.xml"].verify(response(200, "<?xml?><sitemapindex></sitemapindex>"))).toBeNull()
    expect(checks["/sitemap-index.xml"].verify(response(404, ""))).not.toBeNull()
  })

  it("requires staging and previews to disallow crawling and send noindex in both header and meta tag", () => {
    for (const environment of ["staging", "preview"]) {
      const checks = byPath(environment)
      expect(checks["/robots.txt"].verify(response(200, STAGING_ROBOTS))).toBeNull()
      expect(checks["/robots.txt"].verify(response(200, PRODUCTION_ROBOTS))).toMatch(/Disallow/)
      const noindex = { "x-robots-tag": "noindex, nofollow" }
      expect(checks["/"].verify(response(200, html("noindex, nofollow"), noindex))).toBeNull()
      expect(checks["/"].verify(response(200, html("noindex, nofollow")))).toMatch(/X-Robots-Tag is missing/)
      expect(checks["/ja/"].verify(response(200, html("index, follow"), noindex))).toMatch(/meta robots/)
    }
  })

  it("tolerates a Cloudflare challenge only on branded hosts", async () => {
    expect(isZoneHost("https://staging.pitonne.jp/")).toBe(true)
    expect(isZoneHost("https://staging.pitonne-jp.pages.dev/")).toBe(false)
    const challenged = async () => response(403, "", { "cf-mitigated": "challenge" })
    const [zonePage] = environmentChecks("staging", "https://staging.pitonne.jp")
    expect(await run(zonePage, { attempts: 1, probeFn: challenged })).toMatchObject({ ok: true, warning: true })
    const [pagesPage] = environmentChecks("staging", "https://staging.pitonne-jp.pages.dev")
    expect(await run(pagesPage, { attempts: 1, probeFn: challenged })).toMatchObject({ ok: false })
  })

  it("retries each origin's checks until it has had time to settle, then briefly", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    let clock = 0
    const now = () => clock
    const calls = new Map()
    const probeFn = async (url) => {
      calls.set(url, (calls.get(url) ?? 0) + 1)
      clock += 10
      return response(500, "")
    }
    const checks = ["https://x.pages.dev", "https://abc12345.x.pages.dev"].flatMap((origin) =>
      environmentChecks("staging", origin),
    )
    expect(await runChecks(checks, { delayMs: 0, probeFn, now, settleMs: 100 })).toBe(false)
    // Each origin's window opens at its first check, which retries until 100 ms later; the rest are past it
    expect(checks.map((check) => calls.get(check.url))).toEqual([10, 2, 2, 10, 2, 2])

    calls.clear()
    clock = 0
    const settling = async (url) => {
      calls.set(url, (calls.get(url) ?? 0) + 1)
      clock += 10
      return clock >= 50 ? response(200, STAGING_ROBOTS) : response(404, "")
    }
    const robots = byPath("staging")["/robots.txt"]
    expect(await runChecks([robots], { delayMs: 0, probeFn: settling, now })).toBe(true)
    expect(calls.get(robots.url)).toBe(5)
    log.mockRestore()
  })

  it("sends the smoke-test header so deployment URLs aren't redirected", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(STAGING_ROBOTS, { status: 200 }))
    const robots = byPath("staging")["/robots.txt"]
    expect(await run(robots, { attempts: 1 })).toMatchObject({ ok: true })
    expect(fetchSpy.mock.calls[0][1].headers).toEqual(SMOKE_HEADERS)
    fetchSpy.mockRestore()
  })
})
