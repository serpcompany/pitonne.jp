import fs from "node:fs"
import path from "node:path"
import { z } from "zod"
import type { Locale } from "@/lib/i18n/config"
import { BLOG_SLUG_PATTERN, META_DESCRIPTION_MAX_LENGTH, META_DESCRIPTION_MIN_LENGTH } from "@/lib/blog-rules"

// Blog categories are edited in the CMS (the blogCategories collection in keystatic.config.ts) and stored as
// content/blog-categories/<slug>.json. The filename is the slug that posts store in `categorySlug`.
export const BLOG_CATEGORIES_SUBDIR = "content/blog-categories"

const description = z.string().trim().min(META_DESCRIPTION_MIN_LENGTH).max(META_DESCRIPTION_MAX_LENGTH)

export const blogCategoryFileSchema = z.object({
  name: z.string().trim().min(1),
  nameJa: z.string().trim().min(1),
  // The category page's meta description, so it must fit the audit:meta range
  description,
  descriptionJa: description,
  // Optional text for the category page's contact section; falls back to the site's generic contact text
  ctaDescription: z.string().trim().min(1).optional(),
  ctaDescriptionJa: z.string().trim().min(1).optional(),
})

export interface BlogCategory {
  slug: string
  name: Record<Locale, string>
  description: Record<Locale, string>
  ctaDescription: Partial<Record<Locale, string>>
  sourcePath: string
}

export function loadBlogCategoriesFromDirectory(directory: string, contentSubdir: string = BLOG_CATEGORIES_SUBDIR): BlogCategory[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => {
      const sourcePath = `${contentSubdir}/${fileName}`
      const slug = fileName.replace(/\.json$/, "")

      if (!BLOG_SLUG_PATTERN.test(slug)) {
        throw new Error(`Blog category filename must be a lowercase kebab-case slug: ${sourcePath}`)
      }

      let data: unknown
      try {
        data = JSON.parse(fs.readFileSync(path.join(directory, fileName), "utf8"))
      } catch (error) {
        throw new Error(`Invalid JSON in ${sourcePath}: ${(error as Error).message}`)
      }

      const result = blogCategoryFileSchema.safeParse(data)
      if (!result.success) {
        const issues = result.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n")
        throw new Error(`Invalid blog category in ${sourcePath}:\n${issues}`)
      }

      const { name, nameJa, description, descriptionJa, ctaDescription, ctaDescriptionJa } = result.data
      return {
        slug,
        name: { en: name, ja: nameJa },
        description: { en: description, ja: descriptionJa },
        ctaDescription: { en: ctaDescription, ja: ctaDescriptionJa },
        sourcePath,
      }
    })
}

export const blogCategories: BlogCategory[] = loadBlogCategoriesFromDirectory(path.join(process.cwd(), BLOG_CATEGORIES_SUBDIR))

export function getBlogCategory(slug: string): BlogCategory | undefined {
  return blogCategories.find((category) => category.slug === slug)
}
