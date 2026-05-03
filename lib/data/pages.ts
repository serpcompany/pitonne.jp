import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"

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

export function getMarkdownPage(relativePath: string): MarkdownPage {
  const sourcePath = `content/pages/${relativePath}`
  const absolutePath = path.join(pageContentDirectory, relativePath)
  const parsed = matter(fs.readFileSync(absolutePath, "utf8"))
  const frontmatter = pageFrontmatterSchema.parse(parsed.data)

  return {
    title: frontmatter.title,
    slug: frontmatter.slug,
    content: normalizePageContent(parsed.content),
    sourcePath,
  }
}
