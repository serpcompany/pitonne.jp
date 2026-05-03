import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { getAllAreas, wards } from "@/lib/data/areas"
import { blogPosts, getAllCategories } from "@/lib/data/blog-posts"
import { services } from "@/lib/data/services"

const SITE_URL = "https://pitonne.jp"

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter" }),
  Playfair_Display: () => ({ variable: "font-playfair" }),
}))

function withVercelEnv<T>(value: string | undefined, callback: () => T): T {
  const previous = process.env.VERCEL_ENV
  if (value === undefined) {
    delete process.env.VERCEL_ENV
  } else {
    process.env.VERCEL_ENV = value
  }

  try {
    return callback()
  } finally {
    if (previous === undefined) {
      delete process.env.VERCEL_ENV
    } else {
      process.env.VERCEL_ENV = previous
    }
  }
}

describe("SEO parity", () => {
  it("generates a canonical sitemap from static pages and data-backed routes", async () => {
    const sitemap = (await import("@/app/sitemap")).default()
    const urls = sitemap.map((entry) => entry.url)

    expect(urls).toContain(`${SITE_URL}/`)
    expect(urls).toContain(`${SITE_URL}/about/`)
    expect(urls).toContain(`${SITE_URL}/services/`)
    expect(urls).toContain(`${SITE_URL}/contact/`)
    expect(urls).toContain(`${SITE_URL}/blog/`)
    expect(urls).toContain(`${SITE_URL}/legal/`)
    expect(urls).toContain(`${SITE_URL}/legal/privacy-policy/`)
    expect(urls).toContain(`${SITE_URL}/legal/terms-conditions/`)
    expect(urls).toContain(`${SITE_URL}/legal/disclaimer/`)

    for (const service of services) {
      expect(urls).toContain(`${SITE_URL}${service.canonicalPath}`)
    }

    for (const post of blogPosts) {
      expect(urls).toContain(`${SITE_URL}/blog/${post.slug}/`)
    }

    for (const category of getAllCategories()) {
      expect(urls).toContain(`${SITE_URL}/blog/category/${category.slug}/`)
    }

    for (const ward of wards) {
      expect(urls).toContain(`${SITE_URL}/areas-served/${ward.slug}/`)
    }

    for (const { ward, area } of getAllAreas()) {
      expect(urls).toContain(`${SITE_URL}/areas-served/${ward.slug}/${area.slug}/`)
    }

    expect(urls).not.toContain(`${SITE_URL}/privacy-policy/`)
    expect(urls).not.toContain(`${SITE_URL}/terms-of-use/`)
    expect(urls).not.toContain(`${SITE_URL}/medical-disclaimer/`)
    expect(urls).not.toContain(`${SITE_URL}/legal/terms-and-conditions/`)
    expect(urls).not.toContain(`${SITE_URL}/services/medications/`)
    expect(urls.every((url) => url.startsWith(SITE_URL))).toBe(true)
  })

  it("allows production crawling and blocks non-production crawling", async () => {
    const { default: robots } = await import("@/app/robots")

    const production = withVercelEnv("production", () => robots())
    expect(production).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    })

    const preview = withVercelEnv("preview", () => robots())
    expect(preview).toMatchObject({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    })
  })

  it("exposes core page titles, descriptions, and canonical URLs", async () => {
    const { metadata: rootMetadata } = await import("@/app/layout")
    const { metadata: aboutMetadata } = await import("@/app/about/page")
    const { metadata: servicesMetadata } = await import("@/app/services/page")
    const { metadata: contactMetadata } = await import("@/app/contact/page")
    const { generateMetadata: serviceMetadata } = await import("@/app/services/[service]/page")
    const { generateMetadata: postMetadata } = await import("@/app/blog/[post]/page")
    const { generateMetadata: categoryMetadata } = await import("@/app/blog/category/[category]/page")
    const { generateMetadata: wardMetadata } = await import("@/app/areas-served/[ward]/page")
    const { generateMetadata: areaMetadata } = await import("@/app/areas-served/[ward]/[area]/page")

    expect(rootMetadata.metadataBase?.toString()).toBe(`${SITE_URL}/`)
    expect(rootMetadata.robots).toMatchObject({ index: false, follow: false })
    expect(rootMetadata.openGraph).toMatchObject({ siteName: "Pitonne", url: `${SITE_URL}/` })
    expect(rootMetadata.twitter).toMatchObject({ card: "summary_large_image" })

    expect(aboutMetadata).toMatchObject({
      title: "About Pitonne",
      alternates: { canonical: `${SITE_URL}/about/` },
    })
    expect(aboutMetadata.description).toEqual(expect.stringContaining("concierge wellness service"))

    expect(servicesMetadata).toMatchObject({
      title: "Services",
      alternates: { canonical: `${SITE_URL}/services/` },
    })

    expect(contactMetadata).toMatchObject({
      title: "Contact Pitonne",
      alternates: { canonical: `${SITE_URL}/contact/` },
    })

    await expect(serviceMetadata({ params: Promise.resolve({ service: "iv-therapy" }) })).resolves.toMatchObject({
      title: "IV Therapy",
      alternates: { canonical: `${SITE_URL}/services/iv-therapy/` },
    })

    await expect(postMetadata({ params: Promise.resolve({ post: "iv-therapy-for-hangover" }) })).resolves.toMatchObject({
      alternates: { canonical: `${SITE_URL}/blog/iv-therapy-for-hangover/` },
    })

    await expect(categoryMetadata({ params: Promise.resolve({ category: "iv-therapy" }) })).resolves.toMatchObject({
      title: "IV Therapy Articles",
      alternates: { canonical: `${SITE_URL}/blog/category/iv-therapy/` },
    })

    await expect(wardMetadata({ params: Promise.resolve({ ward: "minato" }) })).resolves.toMatchObject({
      alternates: { canonical: `${SITE_URL}/areas-served/minato/` },
    })

    await expect(areaMetadata({ params: Promise.resolve({ ward: "minato", area: "roppongi" }) })).resolves.toMatchObject({
      alternates: { canonical: `${SITE_URL}/areas-served/minato/roppongi/` },
    })
  })

  it("renders Google Tag Manager only for production deployments", async () => {
    vi.resetModules()
    const { default: ProductionLayout } = await withVercelEnv("production", () => import("@/app/layout"))
    const productionMarkup = withVercelEnv("production", () =>
      renderToStaticMarkup(
        <ProductionLayout>
          <div>Body</div>
        </ProductionLayout>,
      ),
    )
    expect(productionMarkup).toContain("GTM-TJ94H7LQ")
    expect(productionMarkup).toContain("googletagmanager.com/ns.html")

    vi.resetModules()
    const { default: PreviewLayout } = await withVercelEnv("preview", () => import("@/app/layout"))
    const previewMarkup = withVercelEnv("preview", () =>
      renderToStaticMarkup(
        <PreviewLayout>
          <div>Body</div>
        </PreviewLayout>,
      ),
    )
    expect(previewMarkup).not.toContain("GTM-TJ94H7LQ")
  })
})
