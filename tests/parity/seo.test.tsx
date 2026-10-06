import React from "react"
import fs from "node:fs"
import path from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { getAllAreas, wards } from "@/lib/data/areas"
import { blogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { pitonneVideos } from "@/lib/data/videos"
import { services } from "@/lib/data/services"

const SITE_URL = "https://pitonne.jp"

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter" }),
  Playfair_Display: () => ({ variable: "font-playfair" }),
}))

function withDeployEnv<T>(value: string | undefined, callback: () => T): T {
  const previous = process.env.DEPLOY_ENV
  if (value === undefined) {
    delete process.env.DEPLOY_ENV
  } else {
    process.env.DEPLOY_ENV = value
  }

  try {
    return callback()
  } finally {
    if (previous === undefined) {
      delete process.env.DEPLOY_ENV
    } else {
      process.env.DEPLOY_ENV = previous
    }
  }
}

describe("SEO parity", () => {
  it("lists each page in the sitemap of its content group", async () => {
    const { sitemapEntriesByGroup } = await import("@/lib/sitemaps")
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

  it("lists the homepage as the bare origin, with hreflang alternates", async () => {
    const { sitemapEntries, urlsetXml } = await import("@/lib/sitemaps")
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

  it("allows production crawling and blocks non-production crawling", async () => {
    const { default: robots } = await import("@/app/robots")

    const production = withDeployEnv("production", () => robots())
    expect(production).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${SITE_URL}/sitemap-index.xml`,
    })

    const preview = withDeployEnv("preview", () => robots())
    expect(preview).toMatchObject({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${SITE_URL}/sitemap-index.xml`,
    })
  })

  it("exposes core page titles, descriptions, and canonical URLs", async () => {
    const { generateMetadata: localeLayoutMetadata } = await import("@/app/[locale]/layout")
    const { generateMetadata: aboutMetadata } = await import("@/app/[locale]/about/page")
    const { generateMetadata: servicesMetadata } = await import("@/app/[locale]/services/page")
    const { generateMetadata: contactMetadata } = await import("@/app/[locale]/contact/page")
    const { generateMetadata: serviceMetadata } = await import("@/app/[locale]/services/[service]/page")
    const { generateMetadata: postMetadata } = await import("@/app/[locale]/blog/[post]/page")
    const { generateMetadata: categoryMetadata } = await import("@/app/[locale]/blog/category/[category]/page")
    const { generateMetadata: wardMetadata } = await import("@/app/[locale]/areas-served/[ward]/page")
    const { generateMetadata: areaMetadata } = await import("@/app/[locale]/areas-served/[ward]/[area]/page")

    const rootMetadata = await localeLayoutMetadata({ params: Promise.resolve({ locale: "en" }) })
    expect(rootMetadata.metadataBase?.toString()).toBe(`${SITE_URL}/`)
    expect(rootMetadata.robots).toMatchObject({ index: false, follow: false })
    expect(rootMetadata.openGraph).toMatchObject({ siteName: "Pitonne", url: `${SITE_URL}/` })
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
    vi.resetModules()
    process.env.DEPLOY_ENV = "production"
    const { default: ProductionLayout } = await import("@/app/[locale]/layout")
    const productionElement = await ProductionLayout({
      children: <div>Body</div>,
      params: Promise.resolve({ locale: "en" }),
    })
    const productionMarkup = renderToStaticMarkup(productionElement)
    expect(productionMarkup).toContain("GTM-TJ94H7LQ")
    expect(productionMarkup).toContain("googletagmanager.com/ns.html")

    vi.resetModules()
    process.env.DEPLOY_ENV = "preview"
    const { default: PreviewLayout } = await import("@/app/[locale]/layout")
    const previewElement = await PreviewLayout({
      children: <div>Body</div>,
      params: Promise.resolve({ locale: "en" }),
    })
    const previewMarkup = renderToStaticMarkup(previewElement)
    expect(previewMarkup).not.toContain("GTM-TJ94H7LQ")

    delete process.env.DEPLOY_ENV
  })

  it("generates Japanese paths from the locale segment and bare paths from English wrappers", async () => {
    const { generateStaticParams: localeLayoutParams } = await import("@/app/[locale]/layout")
    const { generateStaticParams: localeServicesParams } = await import("@/app/[locale]/services/[service]/page")
    const { generateStaticParams: englishServicesParams } = await import("@/app/(en)/services/[service]/page")

    expect(await localeLayoutParams()).toEqual([{ locale: "ja" }])
    const localeServiceParams = await localeServicesParams()
    expect(localeServiceParams.every((params) => params.locale === "ja")).toBe(true)
    expect(englishServicesParams().every((params) => !("locale" in params))).toBe(true)
  })

  it("removes legacy legal route implementations and redirects", () => {
    const root = process.cwd()
    const nextConfig = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8")

    expect(fs.existsSync(path.join(root, "app/privacy-policy/page.tsx"))).toBe(false)
    expect(fs.existsSync(path.join(root, "app/terms-of-use/page.tsx"))).toBe(false)
    expect(fs.existsSync(path.join(root, "app/medical-disclaimer/page.tsx"))).toBe(false)
    expect(nextConfig).not.toContain('source: "/privacy-policy/"')
    expect(nextConfig).not.toContain('source: "/terms-of-use/"')
    expect(nextConfig).not.toContain('source: "/legal/terms-and-conditions/"')
    expect(nextConfig).not.toContain('source: "/medical-disclaimer/"')
  })
})
