// Structure and invariants of the sitemap index pattern. Editors add blog posts at any time, so nothing here
// depends on how many posts exist or which ones; every check holds for whatever content is in the repo.
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { afterEach, describe, expect, it } from "vitest"
import { getBlogPostLocales, getAllBlogPostSlugs } from "@/lib/data/blog-posts"
import { locales } from "@/lib/i18n/config"
import {
  MAX_SITEMAP_URLS,
  SITEMAP_INDEX_FILE,
  sitemapEntriesByGroup,
  sitemapFile,
  sitemapGroups,
  sitemapIndexXml,
  sitemapOrigin,
  urlsetXml,
} from "@/lib/sitemaps"

const SITE_URL = "https://pitonne.jp"
const childRoutes: Record<(typeof sitemapGroups)[number], () => Promise<{ GET: () => Response }>> = {
  pages: () => import("@/app/sitemap-pages.xml/route"),
  services: () => import("@/app/sitemap-services.xml/route"),
  areas: () => import("@/app/sitemap-areas.xml/route"),
  blog: () => import("@/app/sitemap-blog.xml/route"),
  categories: () => import("@/app/sitemap-categories.xml/route"),
  videos: () => import("@/app/sitemap-videos.xml/route"),
}
const root = process.cwd()
const byGroup = sitemapEntriesByGroup()
const allEntries = Object.values(byGroup).flat()

function parseXml(xml: string): Document {
  const document = new DOMParser().parseFromString(xml, "application/xml")
  expect(document.getElementsByTagName("parsererror")).toHaveLength(0)
  return document
}

const textOf = (document: Document, tag: string) => Array.from(document.getElementsByTagName(tag)).map((node) => node.textContent)

describe("sitemap index", () => {
  it("lists one root-level sitemap-<group>.xml per content group", () => {
    const document = parseXml(sitemapIndexXml())

    expect(document.documentElement.localName).toBe("sitemapindex")
    expect(textOf(document, "loc")).toEqual(sitemapGroups.map((group) => `${SITE_URL}/sitemap-${group}.xml`))
    for (const group of sitemapGroups) {
      expect(sitemapFile(group)).toMatch(/^sitemap-[a-z0-9-]+\.xml$/)
    }
  })

  it("serves /sitemap.xml as the same XML as /sitemap-index.xml", async () => {
    const { GET: index } = await import("@/app/sitemap-index.xml/route")
    const { GET: alias } = await import("@/app/sitemap.xml/route")

    const indexResponse = index()
    expect(indexResponse.headers.get("content-type")).toBe("application/xml; charset=utf-8")
    expect(await alias().text()).toBe(await indexResponse.text())
  })

  it("has a route, cache headers and no legacy duplicate for every child sitemap", () => {
    const headers = fs.readFileSync(path.join(root, "public/_headers"), "utf8")
    const redirects = fs.readFileSync(path.join(root, "public/_redirects"), "utf8")
    const sitemapRoutes = fs.readdirSync(path.join(root, "app")).filter((name) => /sitemap.*\.xml$/.test(name))

    expect(sitemapRoutes.sort()).toEqual([SITEMAP_INDEX_FILE, "sitemap.xml", ...sitemapGroups.map(sitemapFile)].sort())
    for (const file of [SITEMAP_INDEX_FILE, "sitemap.xml", ...sitemapGroups.map(sitemapFile)]) {
      expect(fs.existsSync(path.join(root, "app", file, "route.ts"))).toBe(true)
      expect(headers).toContain(`/${file}\n  Content-Type: application/xml; charset=utf-8`)
    }
    // The old video sitemap redirects instead of listing the watch pages a second time
    expect(redirects).toMatch(/^\/videos-sitemap\.xml \/sitemap-videos\.xml 301$/m)
  })

  it("serves every child sitemap as a well-formed URL set", async () => {
    for (const group of sitemapGroups) {
      const { GET } = await childRoutes[group]()
      const response = GET()
      const document = parseXml(await response.text())

      expect(response.headers.get("content-type")).toBe("application/xml; charset=utf-8")
      expect(document.documentElement.localName).toBe("urlset")
      expect(textOf(document, "loc")).toEqual(byGroup[group].map((entry) => entry.url))
    }
  })
})

describe("sitemap URLs", () => {
  afterEach(() => {
    delete process.env.PORT
  })

  it("lists every URL in exactly one child sitemap, within the per-file limit", () => {
    const urls = allEntries.map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    for (const group of sitemapGroups) {
      expect(byGroup[group].length).toBeLessThanOrEqual(MAX_SITEMAP_URLS)
    }
    // Groups defined in code always have URLs; blog and categories come from the CMS and may be empty (a valid urlset)
    for (const group of ["pages", "services", "areas", "videos"] as const) {
      expect(byGroup[group].length).toBeGreaterThan(0)
    }
  })

  it("writes the homepage as the bare origin and every other URL with a trailing slash", () => {
    const urls = allEntries.flatMap((entry) => [entry.url, ...Object.values(entry.alternates)])
    expect(urls).toContain(SITE_URL)
    for (const url of urls) {
      expect(url).not.toBe(`${SITE_URL}/`)
      if (url === SITE_URL) continue
      expect(new URL(url).origin).toBe(SITE_URL)
      expect(url).toMatch(/\/$/)
    }
  })

  it("keeps hreflang alternates reciprocal and inside the same sitemap", () => {
    for (const group of sitemapGroups) {
      const groupUrls = new Set(byGroup[group].map((entry) => entry.url))
      for (const entry of byGroup[group]) {
        const { en, ja, xDefault } = entry.alternates
        expect(Object.values(entry.alternates)).toContain(entry.url)
        expect(xDefault).toBe(en ?? ja)
        for (const href of Object.values(entry.alternates)) {
          expect(groupUrls.has(href)).toBe(true)
        }
      }
    }
  })

  it("lists blog posts only in the locales they are published in, with no alternate for a missing translation", () => {
    for (const slug of getAllBlogPostSlugs()) {
      const postLocales = getBlogPostLocales(slug)
      const entries = byGroup.blog.filter((entry) => entry.url.endsWith(`/blog/${slug}/`))
      expect(entries).toHaveLength(postLocales.length)
      for (const entry of entries) {
        expect(Object.keys(entry.alternates).filter((key) => key !== "xDefault").sort()).toEqual([...postLocales].sort())
      }
    }
  })

  it("leaves out draft posts", () => {
    const urls = new Set(allEntries.map((entry) => entry.url))
    for (const locale of locales) {
      const directory = path.join(root, "content/blog", locale === "en" ? "" : locale)
      for (const fileName of fs.readdirSync(directory).filter((name) => name.endsWith(".md"))) {
        if (matter(fs.readFileSync(path.join(directory, fileName), "utf8")).data.draft !== true) continue
        const slug = fileName.replace(/\.md$/, "")
        expect(urls.has(`${SITE_URL}${locale === "en" ? "" : `/${locale}`}/blog/${slug}/`)).toBe(false)
      }
    }
  })

  it("uses the local origin under next dev", () => {
    const env = process.env as Record<string, string | undefined>
    const previous = env.NODE_ENV
    env.NODE_ENV = "development"
    process.env.PORT = "3008"
    try {
      expect(sitemapOrigin()).toBe("http://localhost:3008")
      const pages = sitemapEntriesByGroup(sitemapOrigin()).pages
      expect(urlsetXml(pages)).toContain("<loc>http://localhost:3008</loc>")
      expect(urlsetXml(pages)).not.toContain(SITE_URL)
    } finally {
      env.NODE_ENV = previous
    }
    expect(sitemapOrigin()).toBe(SITE_URL)
  })
})
