import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { onRequest } from "@/functions/_middleware"
import {
  CANONICAL_ORIGIN,
  SMOKE_TEST_HEADER,
  canonicalHostRedirect,
  canonicalPath,
  canonicalRedirectLocation,
  isNonCanonicalHost,
} from "@/lib/canonical-host"
import { SITE_URL } from "@/lib/seo"

const location = (url: string, headers: Record<string, string> = {}) =>
  canonicalRedirectLocation(url, new Headers(headers))

describe("canonical host", () => {
  it("matches the site URL used for canonical tags", () => {
    expect(CANONICAL_ORIGIN).toBe(SITE_URL)
  })

  it.each([
    "pitonne-jp.pages.dev",
    "PITONNE-JP.PAGES.DEV",
    "pitonne-jp.pages.dev.",
    "www.pitonne.jp",
    "main.pitonne-jp.pages.dev",
    "add-blog-posts-aug27.pitonne-jp.pages.dev",
    "d49a67b6.pitonne-jp.pages.dev",
    "pr-.pitonne-jp.pages.dev",
    "pr-12a.pitonne-jp.pages.dev",
    "staging-old.pitonne-jp.pages.dev",
  ])("redirects %s", (host) => {
    expect(isNonCanonicalHost(host)).toBe(true)
  })

  it.each([
    "pitonne.jp",
    "staging.pitonne.jp",
    "localhost",
    "127.0.0.1",
    "pr-79.pitonne-jp.pages.dev",
    "PR-79.pitonne-jp.pages.dev",
    "staging.pitonne-jp.pages.dev",
    "other-project.pages.dev",
    "evilpitonne-jp.pages.dev",
    "pitonne.jp.example.com",
  ])("serves %s as is", (host) => {
    expect(isNonCanonicalHost(host)).toBe(false)
  })
})

describe("canonical path", () => {
  it.each([
    ["/", "/"],
    ["/ja/", "/ja/"],
    ["/ja", "/ja/"],
    ["/blog/iv-therapy-for-jet-lag", "/blog/iv-therapy-for-jet-lag/"],
    ["/about//", "/about/"],
    ["/robots.txt", "/robots.txt"],
    ["/robots.txt/", "/robots.txt"],
    ["/ja/index.txt", "/ja/index.txt"],
    ["/sitemap.xml/", "/sitemap.xml"],
    ["/images/content/blog/x/featureImage.JPG", "/images/content/blog/x/featureImage.JPG"],
    // Dotted segments that aren't known files, and paths whose form is never changed
    ["/products/aws.amazon.com", "/products/aws.amazon.com"],
    ["/_next/static/chunks/app.js", "/_next/static/chunks/app.js"],
    ["/api/health", "/api/health"],
    ["/api", "/api"],
    ["/.well-known/security.txt", "/.well-known/security.txt"],
    ["/keystatic/cloud/oauth/callback", "/keystatic/cloud/oauth/callback"],
    ["/keystatic", "/keystatic"],
    // Only the first segment exempts a path
    ["/docs/api", "/docs/api/"],
  ])("%s -> %s", (input, expected) => {
    expect(canonicalPath(input)).toBe(expected)
  })
})

describe("canonical host redirect", () => {
  it("keeps the path and query string", () => {
    expect(location("https://pitonne-jp.pages.dev/ja/services/?utm_source=x&a=1")).toBe(
      "https://pitonne.jp/ja/services/?utm_source=x&a=1",
    )
    expect(location("https://www.pitonne.jp/")).toBe("https://pitonne.jp/")
    expect(location("http://main.pitonne-jp.pages.dev/contact")).toBe("https://pitonne.jp/contact/")
  })

  it("writes the homepage as the origin path, without dropping an encoded path", () => {
    expect(location("https://pitonne-jp.pages.dev")).toBe("https://pitonne.jp/")
    expect(location("https://pitonne-jp.pages.dev/ja/blog/%E3%83%86%E3%82%B9%E3%83%88/")).toBe(
      "https://pitonne.jp/ja/blog/%E3%83%86%E3%82%B9%E3%83%88/",
    )
  })

  it("exempts requests with the smoke-test header, whatever its value", () => {
    expect(location("https://pitonne-jp.pages.dev/", { [SMOKE_TEST_HEADER]: "1" })).toBeNull()
    expect(location("https://www.pitonne.jp/", { "X-Pitonne-Smoke-Test": "" })).toBeNull()
  })

  it("exempts preview aliases and the canonical host", () => {
    expect(location("https://pr-79.pitonne-jp.pages.dev/ja/")).toBeNull()
    expect(location("https://staging.pitonne-jp.pages.dev/")).toBeNull()
    expect(location("https://pitonne.jp/about")).toBeNull()
  })

  it("answers with a single 308", () => {
    const response = canonicalHostRedirect(new Request("https://pitonne-jp.pages.dev/faq/?q=1"))
    expect(response?.status).toBe(308)
    expect(response?.headers.get("location")).toBe("https://pitonne.jp/faq/?q=1")
    expect(canonicalHostRedirect(new Request("https://pitonne.jp/faq/"))).toBeNull()
  })
})

describe("Pages middleware", () => {
  const passthrough = new Response("static asset")
  const next = async () => passthrough

  it("redirects non-canonical hosts without reaching static assets", async () => {
    const response = await onRequest({ request: new Request("https://pitonne-jp.pages.dev/ja/"), next })
    expect(response.status).toBe(308)
    expect(response.headers.get("location")).toBe("https://pitonne.jp/ja/")
  })

  it("passes everything else to static assets", async () => {
    expect(await onRequest({ request: new Request("https://pitonne.jp/ja/"), next })).toBe(passthrough)
    expect(await onRequest({ request: new Request("https://pr-79.pitonne-jp.pages.dev/"), next })).toBe(passthrough)
    const smoke = new Request("https://pitonne-jp.pages.dev/", { headers: { [SMOKE_TEST_HEADER]: "1" } })
    expect(await onRequest({ request: smoke, next })).toBe(passthrough)
  })

  it("keeps hashed build assets off the Function", () => {
    const routes = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "_routes.json"), "utf8"))
    expect(routes).toEqual({ version: 1, include: ["/*"], exclude: ["/_next/static/*"] })
  })
})
