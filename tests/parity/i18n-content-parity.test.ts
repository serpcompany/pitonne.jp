import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

function getMdFiles(dir: string): string[] {
  const fullDir = path.join(root, dir)
  if (!fs.existsSync(fullDir)) return []
  return fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith(".md") && !fs.statSync(path.join(fullDir, f)).isDirectory())
    .sort()
}

describe("i18n content file parity", () => {
  it("every English blog post has a Japanese counterpart", () => {
    const en = getMdFiles("content/blog")
    const ja = getMdFiles("content/blog/ja")
    const missingInJa = en.filter((f) => !ja.includes(f))
    const missingInEn = ja.filter((f) => !en.includes(f))

    if (missingInJa.length > 0) {
      throw new Error(`Blog posts missing Japanese version:\n  ${missingInJa.join("\n  ")}`)
    }
    if (missingInEn.length > 0) {
      throw new Error(`Japanese blog posts missing English version:\n  ${missingInEn.join("\n  ")}`)
    }
  })

  it("every English service page has a Japanese counterpart", () => {
    const en = getMdFiles("content/services")
    const ja = getMdFiles("content/services/ja")
    const missingInJa = en.filter((f) => !ja.includes(f))
    const missingInEn = ja.filter((f) => !en.includes(f))

    if (missingInJa.length > 0) {
      throw new Error(`Service pages missing Japanese version:\n  ${missingInJa.join("\n  ")}`)
    }
    if (missingInEn.length > 0) {
      throw new Error(`Japanese service pages missing English version:\n  ${missingInEn.join("\n  ")}`)
    }
  })

  it("every English legal page has a Japanese counterpart", () => {
    const en = getMdFiles("content/pages/legal")
    const ja = getMdFiles("content/pages/legal/ja")
    const missingInJa = en.filter((f) => !ja.includes(f))
    const missingInEn = ja.filter((f) => !en.includes(f))

    if (missingInJa.length > 0) {
      throw new Error(`Legal pages missing Japanese version:\n  ${missingInJa.join("\n  ")}`)
    }
    if (missingInEn.length > 0) {
      throw new Error(`Japanese legal pages missing English version:\n  ${missingInEn.join("\n  ")}`)
    }
  })
})
