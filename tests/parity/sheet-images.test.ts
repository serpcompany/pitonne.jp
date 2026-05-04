import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { blogPosts } from "@/lib/data/blog-posts"
import { getService } from "@/lib/data/services"

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

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)
    return entry.isDirectory() ? sourceFiles(entryPath) : [entryPath]
  })
}

function serviceSlugFromRoute(entry: ManifestEntry): string | null {
  return entry.route?.match(/^\/services\/([^/]+)\/$/)?.[1] ?? null
}

function publicAssetExists(assetPath: string): boolean {
  return fs.existsSync(path.join(root, "public", assetPath))
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

  it("uses local sheet images for static blog entries", () => {
    const postsBySlug = new Map(blogPosts.map((post) => [post.slug, post]))

    expect(postsBySlug.get("iv-therapy-for-dehydration")?.featureImage).toBe(
      "/images/content/sheet/blog/iv-therapy-for-dehydration.jpg",
    )
    expect(postsBySlug.get("iv-therapy-for-fatigue")?.featureImage).toBe(
      "/images/content/sheet/blog/iv-therapy-for-fatigue.jpg",
    )
    expect(postsBySlug.get("iv-therapy-for-hangover")?.featureImage).toBe(
      "/images/content/sheet/blog/iv-therapy-for-hangover.jpg",
    )
  })

  it("promotes newly mapped AGA and Blood Tests images into service assets", () => {
    expect(getService("androgenetic-alopecia")?.image).toBe(
      "/images/content/sheet/services/androgenetic-alopecia.jpg",
    )
    expect(getService("blood-tests")?.image).toBe("/images/content/sheet/services/blood-tests.jpg")
    expect(publicAssetExists("/images/content/sheet/services/androgenetic-alopecia.jpg")).toBe(true)
    expect(publicAssetExists("/images/content/sheet/services/blood-tests.jpg")).toBe(true)
  })

  it("does not hotlink Google Drive images from production source", () => {
    const files = ["app", "components", "lib"].flatMap((dir) => sourceFiles(path.join(root, dir)))
    const offenders = files.filter((file) => {
      const source = fs.readFileSync(file, "utf8")
      return source.includes("drive.google.com") || source.includes("lh3.googleusercontent.com")
    })

    expect(offenders.map((file) => path.relative(root, file))).toEqual([])
  })

  it("renders sheet images on service templates without forcing a standalone blog hero image", () => {
    const parentServiceSource = fs.readFileSync(path.join(root, "components/services/service-parent-template.tsx"), "utf8")
    const servicesIndexSource = fs.readFileSync(path.join(root, "components/services/services-index-template.tsx"), "utf8")
    const blogIndexSource = fs.readFileSync(path.join(root, "app/blog/page.tsx"), "utf8")

    expect(parentServiceSource).toContain("service.image")
    expect(servicesIndexSource).toContain("/images/content/sheet/services/services.jpg")
    expect(blogIndexSource).not.toContain("/images/content/sheet/blog/blog.jpg")
  })
})
