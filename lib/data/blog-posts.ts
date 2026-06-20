import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import type { Locale } from "@/lib/i18n/config"

function blogContentDirectory(locale: Locale): string {
  if (locale === "ja") {
    return path.join(process.cwd(), "content", "blog", "ja")
  }
  return path.join(process.cwd(), "content", "blog")
}

const blogPostFrontmatterSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().min(1),
  categorySlug: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
  }),
  readingTime: z.number().int().positive(),
  featureImage: z.string().optional(),
  featured: z.boolean().optional(),
  relatedServiceSlugs: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  category: string
  categorySlug: string
  author: {
    name: string
    role: string
  }
  readingTime: number
  featureImage?: string
  featured?: boolean
  relatedServiceSlugs: string[]
  tags: string[]
  sourcePath: string
}

function loadBlogPosts(locale: Locale): BlogPost[] {
  const directory = blogContentDirectory(locale)

  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const absolutePath = path.join(directory, fileName)
      const raw = fs.readFileSync(absolutePath, "utf8")
      const parsed = matter(raw)
      const frontmatter = blogPostFrontmatterSchema.parse(parsed.data)

      const contentSubdir = locale === "ja" ? "blog/ja" : "blog"

      return {
        ...frontmatter,
        featureImage: frontmatter.featureImage || undefined,
        featured: frontmatter.featured ?? false,
        relatedServiceSlugs: frontmatter.relatedServiceSlugs ?? [],
        tags: frontmatter.tags ?? [],
        content: parsed.content.trim(),
        sourcePath: `content/${contentSubdir}/${fileName}`,
      }
    })
}

const blogPostsByLocale = { en: loadBlogPosts("en"), ja: loadBlogPosts("ja") }

export const blogPosts: BlogPost[] = blogPostsByLocale.en

function getPostsForLocale(locale: Locale): BlogPost[] {
  return blogPostsByLocale[locale] ?? blogPostsByLocale.en
}

export function getAllBlogPosts(locale: Locale = "en"): BlogPost[] {
  return [...getPostsForLocale(locale)].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getBlogPostBySlug(slug: string, locale: Locale = "en"): BlogPost | undefined {
  return getPostsForLocale(locale).find((post) => post.slug === slug)
}

export function getBlogPostsByCategory(categorySlug: string, locale: Locale = "en"): BlogPost[] {
  return getAllBlogPosts(locale).filter((post) => post.categorySlug === categorySlug)
}

export function getFeaturedPosts(locale: Locale = "en"): BlogPost[] {
  return getAllBlogPosts(locale).filter((post) => post.featured)
}

export function getRelatedPosts(currentSlug: string, limit: number = 3, locale: Locale = "en"): BlogPost[] {
  const currentPost = getBlogPostBySlug(currentSlug, locale)
  if (!currentPost) return []

  return getBlogPostsByCategory(currentPost.categorySlug, locale).filter((post) => post.slug !== currentSlug).slice(0, limit)
}

export function getRelatedServiceSlugsForPost(post: { relatedServiceSlugs?: string[]; categorySlug: string }): string[] {
  if (post.relatedServiceSlugs?.length) {
    return post.relatedServiceSlugs
  }

  return post.categorySlug === "iv-therapy" ? ["iv-therapy"] : []
}

export function getBlogPostsForService(serviceSlug: string, limit: number = 3, locale: Locale = "en"): BlogPost[] {
  const matchingPosts = getAllBlogPosts(locale)
    .filter((post) => getRelatedServiceSlugsForPost(post).includes(serviceSlug))
    .slice(0, limit)

  return matchingPosts.length > 0 ? matchingPosts : getAllBlogPosts(locale).slice(0, limit)
}

export function getAllCategories(locale: Locale = "en"): { name: string; slug: string; count: number }[] {
  const posts = getPostsForLocale(locale)
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>()

  for (const post of posts) {
    const existing = categoryMap.get(post.categorySlug)
    if (existing) {
      existing.count++
    } else {
      categoryMap.set(post.categorySlug, {
        name: post.category,
        slug: post.categorySlug,
        count: 1,
      })
    }
  }

  return Array.from(categoryMap.values())
}
