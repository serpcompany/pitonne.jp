import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
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
  // Blog posts may be published in one locale only (GitHub issue #64): the missing locale gets no page,
  // index entry, or hreflang. Services and legal pages stay strictly paired.
  it("pairs blog translations by identical filename and slug", () => {
    const en = getMdFiles("content/blog")
    const ja = getMdFiles("content/blog/ja")

    expect(en.length + ja.length).toBeGreaterThan(0)
    for (const [dir, files] of [["content/blog", en], ["content/blog/ja", ja]] as const) {
      for (const file of files) {
        const { data } = matter(fs.readFileSync(path.join(root, dir, file), "utf8"))
        expect(`${data.slug}.md`, `${dir}/${file}`).toBe(file)
      }
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
