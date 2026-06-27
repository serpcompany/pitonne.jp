import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"
import { z } from "zod"
import { getCmsBlogPosts, type CmsBlogPost } from "@/lib/cms/payload"
import type { Locale } from "@/lib/i18n/config"

const contentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..", "content")

function blogContentDirectory(locale: Locale): string {
  if (locale === "ja") {
    return path.join(contentRoot, "blog", "ja")
  }
  return path.join(contentRoot, "blog")
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

function fromCmsPost(post: CmsBlogPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    publishedAt: post.publishedAt,
    category: post.category,
    categorySlug: post.categorySlug,
    author: post.author,
    readingTime: post.readingTime ?? 1,
    featureImage: post.featureImage,
    featured: post.featured,
    relatedServiceSlugs: post.relatedServiceSlugs,
    tags: post.tags,
    sourcePath: "cms:blog-posts",
  }
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

export async function getAllBlogPostsWithCms(locale: Locale = "en"): Promise<BlogPost[]> {
  const cmsPosts = await getCmsBlogPosts(locale)
  if (cmsPosts && cmsPosts.length > 0) {
    return cmsPosts
      .map(fromCmsPost)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }

  return getAllBlogPosts(locale)
}

export function getBlogPostBySlug(slug: string, locale: Locale = "en"): BlogPost | undefined {
  return getPostsForLocale(locale).find((post) => post.slug === slug)
}

export async function getBlogPostBySlugWithCms(slug: string, locale: Locale = "en"): Promise<BlogPost | undefined> {
  const posts = await getAllBlogPostsWithCms(locale)
  return posts.find((post) => post.slug === slug)
}

export function getBlogPostsByCategory(categorySlug: string, locale: Locale = "en"): BlogPost[] {
  return getAllBlogPosts(locale).filter((post) => post.categorySlug === categorySlug)
}

export async function getBlogPostsByCategoryWithCms(categorySlug: string, locale: Locale = "en"): Promise<BlogPost[]> {
  const posts = await getAllBlogPostsWithCms(locale)
  return posts.filter((post) => post.categorySlug === categorySlug)
}

export function getFeaturedPosts(locale: Locale = "en"): BlogPost[] {
  return getAllBlogPosts(locale).filter((post) => post.featured)
}

export async function getFeaturedPostsWithCms(locale: Locale = "en"): Promise<BlogPost[]> {
  return (await getAllBlogPostsWithCms(locale)).filter((post) => post.featured)
}

export function getRelatedPosts(currentSlug: string, limit: number = 3, locale: Locale = "en"): BlogPost[] {
  const currentPost = getBlogPostBySlug(currentSlug, locale)
  if (!currentPost) return []

  return getBlogPostsByCategory(currentPost.categorySlug, locale).filter((post) => post.slug !== currentSlug).slice(0, limit)
}

export async function getRelatedPostsWithCms(currentSlug: string, limit: number = 3, locale: Locale = "en"): Promise<BlogPost[]> {
  const currentPost = await getBlogPostBySlugWithCms(currentSlug, locale)
  if (!currentPost) return []

  return (await getBlogPostsByCategoryWithCms(currentPost.categorySlug, locale)).filter((post) => post.slug !== currentSlug).slice(0, limit)
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

export async function getBlogPostsForServiceWithCms(serviceSlug: string, limit: number = 3, locale: Locale = "en"): Promise<BlogPost[]> {
  const posts = await getAllBlogPostsWithCms(locale)
  const matchingPosts = posts
    .filter((post) => getRelatedServiceSlugsForPost(post).includes(serviceSlug))
    .slice(0, limit)

  return matchingPosts.length > 0 ? matchingPosts : posts.slice(0, limit)
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

export async function getAllCategoriesWithCms(locale: Locale = "en"): Promise<{ name: string; slug: string; count: number }[]> {
  const posts = await getAllBlogPostsWithCms(locale)
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
