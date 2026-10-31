import fs from "node:fs"
import path from "node:path"
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { generateStaticParams as englishServicesParams } from "@/app/(en)/services/[service]/page"
import { generateMetadata as aboutMetadata } from "@/app/[locale]/about/page"
import { generateMetadata as areaMetadata } from "@/app/[locale]/areas-served/[ward]/[area]/page"
import { generateMetadata as wardMetadata } from "@/app/[locale]/areas-served/[ward]/page"
import { generateMetadata as postMetadata } from "@/app/[locale]/blog/[post]/page"
import { generateMetadata as categoryMetadata } from "@/app/[locale]/blog/category/[category]/page"
import { generateMetadata as contactMetadata } from "@/app/[locale]/contact/page"
import LocaleLayout, {
  generateMetadata as localeLayoutMetadata,
  generateStaticParams as localeLayoutParams,
} from "@/app/[locale]/layout"
import HomePage from "@/app/[locale]/page"
import {
  generateStaticParams as localeServicesParams,
  generateMetadata as serviceMetadata,
} from "@/app/[locale]/services/[service]/page"
import { generateMetadata as servicesMetadata } from "@/app/[locale]/services/page"
import robots from "@/app/robots"
import { getAllAreas, wards } from "@/lib/data/areas"
import { blogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { services } from "@/lib/data/services"
import { pitonneVideos } from "@/lib/data/videos"
import { sitemapEntries, sitemapEntriesByGroup, urlsetXml } from "@/lib/sitemaps"
import nextConfig from "../../next.config.mjs"

const SITE_URL = "https://pitonne.jp"
const root = process.cwd()
const legacyLegalPaths = ["/privacy-policy/", "/terms-of-use/", "/medical-disclaimer/", "/legal/terms-and-conditions/"]

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter" }),
  Playfair_Display: () => ({ variable: "font-playfair" }),
}))

async function withDeployEnv<T>(value: string | undefined, callback: () => T | Promise<T>): Promise<T> {
  const previous = process.env.DEPLOY_ENV
  if (value === undefined) {
    delete process.env.DEPLOY_ENV
  } else {
    process.env.DEPLOY_ENV = value
  }

  try {
    return await callback()
  } finally {
    if (previous === undefined) {
      delete process.env.DEPLOY_ENV
    } else {
      process.env.DEPLOY_ENV = previous
    }
  }
}

function appRoutes(directory = path.join(root, "src", "app"), segments: string[] = []): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      const routeSegments = /^\(.*\)$|^\[locale\]$/.test(entry.name) ? segments : [...segments, entry.name]
      return appRoutes(path.join(directory, entry.name), routeSegments)
    }
    return /^page\.(tsx|ts|jsx|js)$/.test(entry.name) ? [`/${segments.map((segment) => `${segment}/`).join("")}`] : []
  })
}

function pagesRedirects() {
  return fs
    .readFileSync(path.join(root, "public/_redirects"), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [source, target, status = "302"] = line.split(/\s+/)
      return { source, target, status: Number(status) }
    })
}

function redirectMatches(source: string, url: string): boolean {
  const pattern = source
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/:\w+/g, "[^/]+")
  return new RegExp(`^${pattern}$`).test(url)
}

describe("SEO parity", () => {
  it("lists each page in the sitemap of its content group", () => {
    const byGroup = Object.fromEntries(
      Object.entries(sitemapEntriesByGroup()).map(([group, entries]) => [group, entries.map((entry) => entry.url)]),
    ) as Record<string, string[]>

    expect(byGroup.pages).toContain(SITE_URL)
    for (const route of ["/about/", "/services/", "/contact/", "/blog/", "/faqs/", "/areas-served/", "/videos/", "/legal/"]) {
      expect(byGroup.pages).toContain(`${SITE_URL}${route}`)
      expect(byGroup.pages).toContain(`${SITE_URL}/ja${route}`)
    }
    for (const route of ["/legal/privacy-policy/", "/legal/terms-conditions/", "/legal/disclaimer/"]) {
      expect(byGroup.pages).toContain(`${SITE_URL}${route}`)
    }

    for (const service of services) {
      expect(byGroup.services).toContain(`${SITE_URL}${service.canonicalPath}`)
      expect(byGroup.services).toContain(`${SITE_URL}/ja${service.canonicalPath}`)
    }

    for (const post of blogPosts) {
      expect(byGroup.blog).toContain(`${SITE_URL}/blog/${post.slug}/`)
    }

    for (const category of getAllCategories()) {
      expect(byGroup.categories).toContain(`${SITE_URL}/blog/category/${category.slug}/`)
    }

    for (const ward of wards) {
      expect(byGroup.areas).toContain(`${SITE_URL}/areas-served/${ward.slug}/`)
    }

    for (const { ward, area } of getAllAreas()) {
      expect(byGroup.areas).toContain(`${SITE_URL}/areas-served/${ward.slug}/${area.slug}/`)
    }

    for (const video of pitonneVideos) {
      expect(byGroup.videos).toContain(`${SITE_URL}${video.watchPath}`)
      expect(byGroup.videos).toContain(`${SITE_URL}/ja${video.watchPath}`)
    }

    const allUrls = Object.values(byGroup).flat()
    expect(allUrls).not.toContain(`${SITE_URL}/privacy-policy/`)
    expect(allUrls).not.toContain(`${SITE_URL}/terms-of-use/`)
    expect(allUrls).not.toContain(`${SITE_URL}/medical-disclaimer/`)
    expect(allUrls).not.toContain(`${SITE_URL}/legal/terms-and-conditions/`)
    expect(allUrls).not.toContain(`${SITE_URL}/services/medications/`)
    expect(allUrls).not.toContain(`${SITE_URL}/areas-served/chiyoda/tokyo-station/`)
  })

  it("lists the homepage as the bare origin, with hreflang alternates", () => {
    const pages = sitemapEntries("pages")
    const rootEntry = pages.find((entry) => entry.url === SITE_URL)

    expect(rootEntry?.alternates).toEqual({ en: SITE_URL, ja: `${SITE_URL}/ja/`, xDefault: SITE_URL })
    expect(pages.map((entry) => entry.url)).not.toContain(`${SITE_URL}/`)

    const xml = urlsetXml(pages)
    expect(xml).toContain(`<loc>${SITE_URL}</loc>`)
    expect(xml).toContain(`hreflang="x-default" href="${SITE_URL}"`)
    expect(xml).not.toContain(`<loc>${SITE_URL}/</loc>`)
    expect(xml).not.toContain("https://pitonne.jp/en/")
  })

  it("writes the English homepage as the bare origin in its canonical, og:url and hreflang tags", async () => {
    const headTags = async (locale: string) => {
      const markup = renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }))
      const linkHref = (pattern: RegExp) => markup.match(pattern)?.[1]
      return {
        canonicals: markup.match(/<link rel="canonical"/g)?.length ?? 0,
        canonical: linkHref(/<link rel="canonical" href="([^"]*)"/),
        ogUrl: linkHref(/<meta property="og:url" content="([^"]*)"/),
        en: linkHref(/<link rel="alternate" hrefLang="en" href="([^"]*)"/),
        ja: linkHref(/<link rel="alternate" hrefLang="ja" href="([^"]*)"/),
        xDefault: linkHref(/<link rel="alternate" hrefLang="x-default" href="([^"]*)"/),
      }
    }

    expect(await headTags("en")).toEqual({
      canonicals: 1,
      canonical: SITE_URL,
      ogUrl: SITE_URL,
      en: SITE_URL,
      ja: `${SITE_URL}/ja/`,
      xDefault: SITE_URL,
    })
    expect(await headTags("ja")).toEqual({
      canonicals: 1,
      canonical: `${SITE_URL}/ja/`,
      ogUrl: `${SITE_URL}/ja/`,
      en: SITE_URL,
      ja: `${SITE_URL}/ja/`,
      xDefault: SITE_URL,
    })
  })

  it("allows production crawling and blocks non-production crawling", async () => {
    const production = await withDeployEnv("production", () => robots())
    expect(production).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${SITE_URL}/sitemap-index.xml`,
    })

    const preview = await withDeployEnv("preview", () => robots())
    expect(preview).toMatchObject({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${SITE_URL}/sitemap-index.xml`,
    })
  })

  it("exposes core page titles, descriptions, and canonical URLs", async () => {
    const rootMetadata = await localeLayoutMetadata({ params: Promise.resolve({ locale: "en" }) })
    expect(rootMetadata.metadataBase?.toString()).toBe(`${SITE_URL}/`)
    expect(rootMetadata.robots).toMatchObject({ index: false, follow: false })
    expect(rootMetadata.openGraph).toMatchObject({ siteName: "Pitonne" })
    expect(rootMetadata.openGraph).not.toHaveProperty("url")
    expect(rootMetadata).not.toHaveProperty("alternates")
    expect(rootMetadata.twitter).toMatchObject({ card: "summary_large_image" })

    const aboutMeta = await aboutMetadata({ params: Promise.resolve({ locale: "en" }) })
    expect(aboutMeta).toMatchObject({
      title: "About Pitonne",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/about/` }),
    })
    expect(aboutMeta.description).toEqual(expect.stringContaining("concierge wellness service"))

    const servicesMeta = await servicesMetadata({ params: Promise.resolve({ locale: "en" }) })
    expect(servicesMeta).toMatchObject({
      title: "IV Therapy, Medications & Blood Tests in Tokyo",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/services/` }),
    })

    const contactMeta = await contactMetadata({ params: Promise.resolve({ locale: "en" }) })
    expect(contactMeta).toMatchObject({
      title: "Contact Us",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/contact/` }),
    })

    await expect(serviceMetadata({ params: Promise.resolve({ locale: "en", service: "iv-therapy" }) })).resolves.toMatchObject({
      title: "IV Therapy",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/services/iv-therapy/` }),
    })

    await expect(serviceMetadata({ params: Promise.resolve({ locale: "en", service: "androgenetic-alopecia-medicine" }) })).resolves.toMatchObject({
      title: "AGA Medication",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/services/androgenetic-alopecia-medicine/` }),
    })

    await expect(serviceMetadata({ params: Promise.resolve({ locale: "en", service: "blood-tests" }) })).resolves.toMatchObject({
      title: "Blood Tests",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/services/blood-tests/` }),
    })

    await expect(postMetadata({ params: Promise.resolve({ locale: "en", post: "iv-therapy-for-hangover" }) })).resolves.toMatchObject({
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/blog/iv-therapy-for-hangover/` }),
    })

    await expect(categoryMetadata({ params: Promise.resolve({ locale: "en", category: "iv-therapy" }) })).resolves.toMatchObject({
      title: "IV Therapy Articles",
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/blog/category/iv-therapy/` }),
    })

    await expect(wardMetadata({ params: Promise.resolve({ locale: "en", ward: "minato" }) })).resolves.toMatchObject({
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/areas-served/minato/` }),
    })

    await expect(areaMetadata({ params: Promise.resolve({ locale: "en", ward: "minato", area: "roppongi" }) })).resolves.toMatchObject({
      alternates: expect.objectContaining({ canonical: `${SITE_URL}/areas-served/minato/roppongi/` }),
    })
  })

  it("renders Google Tag Manager only for production deployments", async () => {
    const layoutMarkup = async () =>
      renderToStaticMarkup(await LocaleLayout({ children: <div>Body</div>, params: Promise.resolve({ locale: "en" }) }))

    const productionMarkup = await withDeployEnv("production", layoutMarkup)
    expect(productionMarkup).toContain("GTM-TJ94H7LQ")
    expect(productionMarkup).toContain("googletagmanager.com/ns.html")

    const previewMarkup = await withDeployEnv("preview", layoutMarkup)
    expect(previewMarkup).not.toContain("GTM-TJ94H7LQ")
  })

  it("generates Japanese paths from the locale segment and bare paths from English wrappers", async () => {
    expect(await localeLayoutParams()).toEqual([{ locale: "ja" }])
    const localeServiceParams = await localeServicesParams()
    expect(localeServiceParams.every((params) => params.locale === "ja")).toBe(true)
    expect(englishServicesParams().every((params) => !("locale" in params))).toBe(true)
  })

  it("serves no legacy legal URL: no page, no Next.js redirect and no Cloudflare Pages redirect", () => {
    for (const phase of [PHASE_PRODUCTION_BUILD, PHASE_DEVELOPMENT_SERVER]) {
      expect(nextConfig(phase)).not.toHaveProperty("redirects")
    }
    expect(nextConfig(PHASE_PRODUCTION_BUILD).output).toBe("export")

    const routes = appRoutes()
    const redirects = pagesRedirects()
    expect(routes).toEqual(expect.arrayContaining(["/legal/privacy-policy/", "/legal/terms-conditions/", "/legal/disclaimer/"]))
    expect(redirects).toContainEqual({ source: "/services/medications/", target: "/services/medication/", status: 301 })

    for (const legacyPath of legacyLegalPaths) {
      expect(routes).not.toContain(legacyPath)
      for (const url of [legacyPath, legacyPath.replace(/\/$/, "")]) {
        expect(redirects.filter((redirect) => redirectMatches(redirect.source, url))).toEqual([])
      }
    }
  })
})
