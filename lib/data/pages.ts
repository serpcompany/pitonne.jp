import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import type { Locale } from "@/lib/i18n/config"

const pageContentDirectory = path.join(process.cwd(), "content", "pages")

const pageFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
})

export interface MarkdownPage {
  title: string
  slug: string
  content: string
  sourcePath: string
}

function normalizePageContent(content: string) {
  return content
    .trim()
    .replace(/^Legal\s*/i, "")
    .replace(/^# .+\n+/, "")
    .trim()
}

export function getMarkdownPage(relativePath: string): MarkdownPage
export function getMarkdownPage(relativePath: string, locale: Locale): MarkdownPage | null
export function getMarkdownPage(relativePath: string, locale: Locale = "en"): MarkdownPage | null {
  let sourcePath: string
  let absolutePath: string

  if (locale === "ja") {
    const dir = path.dirname(relativePath)
    const file = path.basename(relativePath)
    const jaRelativePath = dir === "." ? `ja/${file}` : `${dir}/ja/${file}`
    sourcePath = `content/pages/${jaRelativePath}`
    absolutePath = path.join(pageContentDirectory, jaRelativePath)

    if (!fs.existsSync(absolutePath)) {
      return null
    }
  } else {
    sourcePath = `content/pages/${relativePath}`
    absolutePath = path.join(pageContentDirectory, relativePath)
  }

  const parsed = matter(fs.readFileSync(absolutePath, "utf8"))
  const frontmatter = pageFrontmatterSchema.parse(parsed.data)

  return {
    title: frontmatter.title,
    slug: frontmatter.slug,
    content: normalizePageContent(parsed.content),
    sourcePath,
  }
}
