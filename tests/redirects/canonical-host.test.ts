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
    ["/keystatic/", "/keystatic/"],
    ["/API/x", "/API/x"],
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

  it("keeps a protocol-relative-looking path on the canonical host", () => {
    expect(location("https://pitonne-jp.pages.dev//evil.com")).toBe("https://pitonne.jp//evil.com")
    expect(location("https://pitonne-jp.pages.dev//evil.com/x.js")).toBe("https://pitonne.jp//evil.com/x.js")
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

  const asset = (status = 200, headers: Record<string, string> = {}) => async () =>
    new Response(status === 200 ? "static asset" : null, { status, headers })

  it("answers with a single 308", async () => {
    const response = await canonicalHostRedirect(new Request("https://pitonne-jp.pages.dev/faq/?q=1"), asset())
    expect(response?.status).toBe(308)
    expect(response?.headers.get("location")).toBe("https://pitonne.jp/faq/?q=1")
    expect(await canonicalHostRedirect(new Request("https://pitonne.jp/faq/"), asset())).toBeNull()
  })

  it.each(["GET", "HEAD", "POST"])("redirects %s requests the same way", async (method) => {
    const response = await canonicalHostRedirect(
      new Request("https://pitonne-jp.pages.dev/contact", { method }),
      asset(method === "POST" ? 405 : 308, method === "POST" ? {} : { location: "/contact/" }),
    )
    expect(response?.status).toBe(308)
    expect(response?.headers.get("location")).toBe("https://pitonne.jp/contact/")
  })

  it("folds a _redirects rule into the same hop", async () => {
    const legacy = (url: string, location: string, status = 301) =>
      canonicalHostRedirect(new Request(url), asset(status, { location })).then((r) => r?.headers.get("location"))
    expect(await legacy("https://pitonne-jp.pages.dev/en/", "/")).toBe("https://pitonne.jp/")
    expect(await legacy("https://pitonne-jp.pages.dev/en/blog/?a=1", "/blog/")).toBe("https://pitonne.jp/blog/?a=1")
    expect(await legacy("https://pitonne-jp.pages.dev/services/medications", "/services/medication/")).toBe(
      "https://pitonne.jp/services/medication/",
    )
    expect(await legacy("https://main.pitonne-jp.pages.dev/old/?a=1", "/new/?b=2", 308)).toBe(
      "https://pitonne.jp/new/?b=2",
    )
    // Pages' own slash redirect also applies on paths the Function never re-slashes, as it does on pitonne.jp
    expect(await legacy("https://pitonne-jp.pages.dev/keystatic", "/keystatic/", 308)).toBe(
      "https://pitonne.jp/keystatic/",
    )
    // Relative targets resolve against the request; a target on another host isn't followed.
    expect(await legacy("https://pitonne-jp.pages.dev/x/y", "z")).toBe("https://pitonne.jp/x/z/")
    expect(await legacy("https://pitonne-jp.pages.dev/out/", "https://example.com/")).toBe("https://pitonne.jp/out/")
  })

  it.each([302, 303, 307])("doesn't make a temporary %i permanent", async (status) => {
    const response = await canonicalHostRedirect(
      new Request("https://main.pitonne-jp.pages.dev/old/?a=1"),
      asset(status, { location: "/new/?b=2" }),
    )
    expect(response?.status).toBe(308)
    expect(response?.headers.get("location")).toBe("https://pitonne.jp/old/?a=1")
  })

  it("falls back to the plain host redirect when the asset server fails", async () => {
    const response = await canonicalHostRedirect(new Request("https://pitonne-jp.pages.dev/en/?a=1"), async () => {
      throw new Error("asset server unavailable")
    })
    expect(response?.status).toBe(308)
    expect(response?.headers.get("location")).toBe("https://pitonne.jp/en/?a=1")
  })

  it("ignores asset responses that aren't redirects", async () => {
    for (const status of [200, 404, 405]) {
      const response = await canonicalHostRedirect(new Request("https://pitonne-jp.pages.dev/about"), asset(status))
      expect(response?.headers.get("location")).toBe("https://pitonne.jp/about/")
    }
  })

  it("doesn't call the asset server for requests it passes through", async () => {
    let calls = 0
    const next = async () => {
      calls++
      return new Response("static asset")
    }
    expect(await canonicalHostRedirect(new Request("https://pitonne.jp/"), next)).toBeNull()
    expect(calls).toBe(0)
  })
})

describe("Pages middleware", () => {
  const passthrough = new Response("static asset")
  const next = async () => passthrough

  it("redirects non-canonical hosts with one 308", async () => {
    const request = new Request("https://pitonne-jp.pages.dev/ja/")
    const response = await onRequest({ request, next: async () => new Response("static asset") })
    expect(response.status).toBe(308)
    expect(response.headers.get("location")).toBe("https://pitonne.jp/ja/")
  })

  it("passes everything else to static assets", async () => {
    expect(await onRequest({ request: new Request("https://pitonne.jp/ja/"), next })).toBe(passthrough)
    expect(await onRequest({ request: new Request("https://pr-79.pitonne-jp.pages.dev/"), next })).toBe(passthrough)
    const smoke = new Request("https://pitonne-jp.pages.dev/", { headers: { [SMOKE_TEST_HEADER]: "1" } })
    expect(await onRequest({ request: smoke, next })).toBe(passthrough)
  })

  it("passes the asset server's response through unchanged", async () => {
    const legacy = new Response(null, { status: 301, headers: { location: "/" } })
    expect(await onRequest({ request: new Request("https://pitonne.jp/en/"), next: async () => legacy })).toBe(legacy)
  })
})

describe("_routes.json", () => {
  const routes = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "_routes.json"), "utf8"))

  it("runs the Function on every path that isn't excluded", () => {
    expect(routes.version).toBe(1)
    expect(routes.include).toEqual(["/*"])
    // Cloudflare's limit is 100 include + exclude rules
    expect(routes.include.length + routes.exclude.length).toBeLessThanOrEqual(100)
  })

  it("excludes only static files, never a page or the files the smoke test checks", () => {
    for (const rule of routes.exclude as string[]) {
      expect(rule).toMatch(/^\/(?:_next\/\*|[a-z-]+\/\*|[^/]+\.[a-z]+)$/)
      if (rule.startsWith("/_next/")) continue
      expect(fs.existsSync(path.join(process.cwd(), "public", rule.replace(/\*$/, "")))).toBe(true)
    }
    for (const kept of ["/", "/ja/", "/blog/", "/keystatic/", "/robots.txt", "/sitemap.xml", "/en/"]) {
      const excluded = (routes.exclude as string[]).some(
        (rule) => kept === rule || (rule.endsWith("*") && kept.startsWith(rule.slice(0, -1))),
      )
      expect(excluded).toBe(false)
    }
  })

  it("keeps build assets and images off the Function", () => {
    expect(routes.exclude).toEqual(expect.arrayContaining(["/_next/*", "/images/*"]))
  })
})
