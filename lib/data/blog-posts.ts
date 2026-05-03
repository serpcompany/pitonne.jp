import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"

const blogContentDirectory = path.join(process.cwd(), "content", "blog")

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
  relatedServiceSlugs?: string[]
  tags?: string[]
  sourcePath: string
}

function loadBlogPosts(): BlogPost[] {
  if (!fs.existsSync(blogContentDirectory)) {
    return []
  }

  return fs
    .readdirSync(blogContentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const absolutePath = path.join(blogContentDirectory, fileName)
      const raw = fs.readFileSync(absolutePath, "utf8")
      const parsed = matter(raw)
      const frontmatter = blogPostFrontmatterSchema.parse(parsed.data)

      return {
        ...frontmatter,
        featureImage: frontmatter.featureImage || undefined,
        featured: frontmatter.featured ?? false,
        relatedServiceSlugs: frontmatter.relatedServiceSlugs ?? [],
        tags: frontmatter.tags ?? [],
        content: parsed.content.trim(),
        sourcePath: `content/blog/${fileName}`,
      }
    })
}

export const blogPosts: BlogPost[] = loadBlogPosts()

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getBlogPostsByCategory(categorySlug: string): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.categorySlug === categorySlug)
}

export function getFeaturedPosts(): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.featured)
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getBlogPostBySlug(currentSlug)
  if (!currentPost) return []

  return getBlogPostsByCategory(currentPost.categorySlug).filter((post) => post.slug !== currentSlug).slice(0, limit)
}

export function getRelatedServiceSlugsForPost(post: Pick<BlogPost, "relatedServiceSlugs" | "categorySlug">): string[] {
  if (post.relatedServiceSlugs?.length) {
    return post.relatedServiceSlugs
  }

  return post.categorySlug === "iv-therapy" ? ["iv-therapy"] : []
}

export function getBlogPostsForService(serviceSlug: string, limit: number = 3): BlogPost[] {
  const matchingPosts = getAllBlogPosts()
    .filter((post) => getRelatedServiceSlugsForPost(post).includes(serviceSlug))
    .slice(0, limit)

  return matchingPosts.length > 0 ? matchingPosts : getAllBlogPosts().slice(0, limit)
}

export function getAllCategories(): { name: string; slug: string; count: number }[] {
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>()

  for (const post of blogPosts) {
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
