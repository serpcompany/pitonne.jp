import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { blogPosts } from "@/lib/data/blog-posts"
import { getService } from "@/lib/data/services"

const root = process.cwd()
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/image-audit/sheet-image-manifest.json"), "utf8")) as {
  entries: Array<{
    sheetName: string
    route?: string
    blogSlug?: string
    driveId?: string
    driveFilename?: string
    localPath?: string | null
    status: string
  }>
}

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)
    return entry.isDirectory() ? sourceFiles(entryPath) : [entryPath]
  })
}

describe("sheet image integration", () => {
  it("keeps a manifest for every Sheet image decision", () => {
    const usedEntries = manifest.entries.filter((entry) => entry.status === "used")
    const blockedEntries = manifest.entries.filter((entry) => entry.status === "blocked-external-license")

    expect(usedEntries.length).toBe(17)
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

    expect(getService("iv-therapy")?.image).toBe("/images/content/sheet/services/iv-therapy.jpg")
    expect(bySheetName.get("iv therapy")?.driveFilename).toBe("Hotel IV Drip_2_H.jpg")

    expect(getService("exosome-iv-drip")?.image).toBe("/images/content/sheet/services/exosome-iv-drip.jpg")
    expect(bySheetName.get("exosome iv drip")?.driveFilename).toBe("Exosome_H.jpg")

    expect(getService("hangover-iv-drip")?.image).toBe("/images/content/sheet/services/hangover-iv-drip.jpg")
    expect(bySheetName.get("hangover iv drip")?.driveFilename).toBe("Hangover_H.jpg")

    expect(getService("energy-fatigue-recovery-iv")?.image).toBe(
      "/images/content/sheet/services/energy-fatigue-recovery-iv.jpg",
    )
    expect(bySheetName.get("energy & fatigue recovery iv")?.driveFilename).toBe("Energy Recovery_H.jpg")

    expect(getService("immune-boost-iv-therapy")?.image).toBe(
      "/images/content/sheet/services/immune-boost-iv-therapy.jpg",
    )
    expect(bySheetName.get("immune boost iv therapy")?.driveFilename).toBe("Immune Boost_H.jpg")

    expect(getService("skin-brightening-iv-drip")?.image).toBe(
      "/images/content/sheet/services/skin-brightening-iv-drip.jpg",
    )
    expect(bySheetName.get("skin brightening iv drip")?.driveFilename).toBe("Skin Brightening_H.jpg")

    expect(getService("iv-vitamin-therapy")?.image).toBe("/images/content/sheet/services/iv-vitamin-therapy.jpg")
    expect(bySheetName.get("iv vitamin therapy")?.driveFilename).toBe("Vitamin Shot_H.jpg")

    expect(getService("medication")?.image).toBe("/images/office_exam_room-scaled.jpg")

    expect(getService("ed-medication")?.image).toBe("/images/content/sheet/services/ed-medication.jpg")
    expect(bySheetName.get("ED medication")?.driveFilename).toBe("Cialis_2_H.jpg")

    expect(getService("stem-cell-nasal-spray")?.image).toBe(
      "/images/content/sheet/services/stem-cell-nasal-spray.jpg",
    )
    expect(bySheetName.get("stem cell nasal spray")?.driveFilename).toBe("Exosome Nasal Spray_H.jpg")

    expect(getService("stem-cell-therapy")?.image).toBe("/images/content/sheet/services/stem-cell-therapy.jpg")
    expect(bySheetName.get("stem cell therapy")?.driveFilename).toBe("Consultation Room_Akira_H.jpg")
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
