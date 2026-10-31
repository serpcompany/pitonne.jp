import fs from "node:fs"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import BlogPage from "@/app/[locale]/blog/page"
import { ServiceParentTemplate } from "@/components/services/service-parent-template"
import { ServicesIndexTemplate } from "@/components/services/services-index-template"
import { blogPosts, getAllBlogPosts } from "@/lib/data/blog-posts"
import { getLegalPage } from "@/lib/data/pages"
import {
  getAllServiceSlugs,
  getChildServices,
  getService,
  getServiceCategorySections,
  type Service,
} from "@/lib/data/services"
import { pitonneVideos } from "@/lib/data/videos"
import { locales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"
import { googleDriveImage, imageSource, localImagePath, publicAssetExists, renderedImageUrls } from "../images"
import { sitePageCases } from "../pages"

const root = process.cwd()
type ManifestEntry = {
  sheetName: string
  route?: string
  blogSlug?: string
  driveId?: string
  driveFilename?: string
  localPath?: string | null
  status: string
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/image-audit/sheet-image-manifest.json"), "utf8")) as {
  entries: ManifestEntry[]
}

function servicesFor(locale: Locale): Service[] {
  return getAllServiceSlugs(locale).map((slug) => getService(slug, locale)!)
}

function markdownImageSources(markdown: string): string[] {
  return [
    ...markdown.matchAll(/!\[[^\]]*\]\(\s*<?([^\s)>]+)/g),
    ...markdown.matchAll(/<img\s[^>]*\bsrc=["']([^"']+)["']/gi),
  ].map((match) => match[1])
}

function serviceSlugFromRoute(entry: ManifestEntry): string | null {
  return entry.route?.match(/^\/services\/([^/]+)\/$/)?.[1] ?? null
}


describe("sheet image integration", () => {
  it("keeps a manifest for every Sheet image decision", () => {
    const usedEntries = manifest.entries.filter((entry) => entry.status === "used")
    const blockedEntries = manifest.entries.filter((entry) => entry.status === "blocked-external-license")

    expect(usedEntries.length).toBe(19)
    expect(blockedEntries.map((entry) => entry.sheetName)).toEqual(["Medications"])

    for (const entry of usedEntries) {
      expect(entry.sheetName).toBeTruthy()
      expect(entry.localPath).toMatch(/^\/images\/content\/sheet\//)
      expect(entry.driveId).toBeTruthy()
      expect(entry.driveFilename).toBeTruthy()
      expect(entry.route || entry.blogSlug).toBeTruthy()
    }
  })

  it("keeps Sheet Drive images as local project assets", () => {
    const assetEntries = manifest.entries.filter((entry) => entry.localPath)

    for (const entry of assetEntries) {
      const localPath = path.join(root, "public", entry.localPath!)
      expect(fs.existsSync(localPath)).toBe(true)
      expect(fs.statSync(localPath).size).toBeGreaterThan(0)
    }
  })

  it("uses local sheet images for service routes", () => {
    const bySheetName = new Map(manifest.entries.map((entry) => [entry.sheetName, entry]))
    const usedServiceEntries = manifest.entries.filter(
      (entry) => entry.status === "used" && entry.localPath && serviceSlugFromRoute(entry),
    )

    for (const entry of usedServiceEntries) {
      const slug = serviceSlugFromRoute(entry)
      expect(getService(slug!)?.image).toBe(entry.localPath)
      expect(entry.driveFilename).toBeTruthy()
    }

    const blockedMedicationEntry = bySheetName.get("Medications")
    const medicationImage = getService("medication")?.image

    expect(blockedMedicationEntry?.status).toBe("blocked-external-license")
    expect(blockedMedicationEntry?.localPath).toBeNull()
    expect(medicationImage).toBeTruthy()
    expect(medicationImage).not.toMatch(/^https?:\/\//)
    expect(medicationImage).not.toMatch(/drive\.google\.com|lh3\.googleusercontent\.com|istockphoto\.com/)
    expect(publicAssetExists(medicationImage!)).toBe(true)
  })

  it("stores blog feature images in Keystatic's per-slug folders", () => {
    const postsBySlug = new Map(blogPosts.map((post) => [post.slug, post]))

    expect(postsBySlug.get("iv-therapy-for-dehydration")?.featureImage).toBe(
      "/images/content/blog/iv-therapy-for-dehydration/featureImage.jpg",
    )
    expect(postsBySlug.get("iv-therapy-for-fatigue")?.featureImage).toBe(
      "/images/content/blog/iv-therapy-for-fatigue/featureImage.jpg",
    )
    expect(postsBySlug.get("iv-therapy-for-hangover")?.featureImage).toBe(
      "/images/content/blog/iv-therapy-for-hangover/featureImage.jpg",
    )
  })

  it("promotes newly mapped AGA and Blood Tests images into service assets", () => {
    expect(getService("androgenetic-alopecia-medicine")?.image).toBe(
      "/images/content/sheet/services/androgenetic-alopecia.jpg",
    )
    expect(getService("blood-tests")?.image).toBe("/images/content/sheet/services/blood-tests.jpg")
    expect(publicAssetExists("/images/content/sheet/services/androgenetic-alopecia.jpg")).toBe(true)
    expect(publicAssetExists("/images/content/sheet/services/blood-tests.jpg")).toBe(true)
  })

  it("keeps every image the site renders from data as a local file rather than a Google Drive link", () => {
    for (const locale of locales) {
      const services = servicesFor(locale)
      const posts = getAllBlogPosts(locale)
      const legalPages = (["privacyPolicy", "termsConditions", "medicalDisclaimer"] as const).map((key) =>
        getLegalPage(key, locale),
      )
      const localImages = [
        ...services.flatMap((service) => (service.image ? [service.image] : [])),
        ...posts.flatMap((post) => (post.featureImage ? [post.featureImage] : [])),
      ]
      const markdownImages = [...services, ...posts, ...legalPages].flatMap((page) => markdownImageSources(page.content))

      expect(services.filter((service) => service.image).length).toBeGreaterThan(0)
      for (const image of localImages) {
        expect(image, image).toMatch(localImagePath)
        expect(publicAssetExists(image), image).toBe(true)
      }
      for (const image of markdownImages) expect(image).not.toMatch(googleDriveImage)
    }

    expect(DEFAULT_OG_IMAGE).toMatch(localImagePath)
    expect(publicAssetExists(DEFAULT_OG_IMAGE)).toBe(true)
    for (const video of pitonneVideos) expect(video.thumbnailUrl).not.toMatch(googleDriveImage)
  })
})

describe.each(locales)("sheet images on rendered templates (%s)", (locale) => {
  it("shows each parent service's own image in its hero", () => {
    const parents = servicesFor(locale).filter((service) => service.kind === "parent")
    expect(parents.length).toBeGreaterThan(0)

    for (const service of parents) {
      const { container, unmount } = render(
        <ServiceParentTemplate service={service} childServices={getChildServices(service.slug, locale)} locale={locale} />,
      )
      const hero = container.querySelector("h1")?.closest("section")

      expect(hero).toBeTruthy()
      expect(Array.from(hero!.querySelectorAll("img"), imageSource)).toEqual([service.image])
      for (const source of renderedImageUrls(container)) expect(publicAssetExists(source), source).toBe(true)
      unmount()
    }
  })

  it("shows the sheet services image on the services index", () => {
    const { container } = render(<ServicesIndexTemplate sections={getServiceCategorySections(locale)} locale={locale} />)

    expect(imageSource(screen.getByRole("img", { name: getDictionary(locale).services.heroImageAlt }))).toBe(
      "/images/content/sheet/services/services.jpg",
    )
    for (const source of renderedImageUrls(container)) expect(publicAssetExists(source), source).toBe(true)
  })

  it("shows only post feature images on the blog index, with no standalone hero image", async () => {
    const { container } = render(await BlogPage({ params: Promise.resolve({ locale }) }))
    const featureImages = getAllBlogPosts(locale).flatMap((post) => (post.featureImage ? [post.featureImage] : []))
    const sources = renderedImageUrls(container)

    expect(sources).not.toContain("/images/content/sheet/blog/blog.jpg")
    for (const source of sources) expect(featureImages).toContain(source)
  })
})

describe("rendered site images", () => {
  it.each(sitePageCases)("renders only local image files on the %s page (%s)", async (_name, _locale, page) => {
    const { container } = render(await page())

    for (const url of renderedImageUrls(container)) {
      expect(url).not.toMatch(googleDriveImage)
      expect(url).toMatch(localImagePath)
      expect(publicAssetExists(url), url).toBe(true)
    }
  })
})
