import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import { locales, type Locale } from "@/lib/i18n/config"
import {
  BLOG_SLUG_PATTERN,
  EXCERPT_MAX_LENGTH,
  EXCERPT_MIN_LENGTH,
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_MIN_LENGTH,
  META_TITLE_MAX_LENGTH,
  META_TITLE_MIN_LENGTH,
} from "@/lib/blog-rules"
import { blogCategories, BLOG_CATEGORIES_SUBDIR, getBlogCategory, type BlogCategory } from "@/lib/data/blog-categories"

function blogContentDirectory(locale: Locale): string {
  if (locale === "ja") {
    return path.join(process.cwd(), "content", "blog", "ja")
  }
  return path.join(process.cwd(), "content", "blog")
}


export const blogPostFrontmatterSchema = z
  .object({
    // Defaults to the filename (Keystatic stores the slug only as the filename)
    slug: z.string().regex(BLOG_SLUG_PATTERN, "slug must be lowercase kebab-case").optional(),
    title: z.string().min(1),
    // Optional SEO overrides for <title> / meta description when the on-page title or excerpt is too long or short
    metaTitle: z.string().trim().min(META_TITLE_MIN_LENGTH).max(META_TITLE_MAX_LENGTH).optional(),
    metaDescription: z.string().trim().min(META_DESCRIPTION_MIN_LENGTH).max(META_DESCRIPTION_MAX_LENGTH).optional(),
    // Also the default meta/OG/Twitter description
    excerpt: z.string().trim().min(EXCERPT_MIN_LENGTH).max(EXCERPT_MAX_LENGTH),
    // Keystatic writes unquoted YAML dates, which gray-matter parses as Date objects at UTC midnight. A timestamp
    // with a time or timezone is rejected rather than converted, since converting could shift it to another day.
    publishedAt: z.preprocess(
      (value) =>
        value instanceof Date && value.toISOString().endsWith("T00:00:00.000Z") ? value.toISOString().slice(0, 10) : value,
      z.string({ message: "publishedAt must be a date (YYYY-MM-DD) without a time" }).regex(/^\d{4}-\d{2}-\d{2}$/)
    ),
    // Must match a category file in content/blog-categories (checked when the post is loaded)
    categorySlug: z.string().regex(BLOG_SLUG_PATTERN, "categorySlug must be lowercase kebab-case"),
    author: z.object({
      name: z.string().min(1),
      role: z.string().min(1),
    }),
    // Computed from the body when omitted; set only to override the estimate
    readingTime: z.number().int().positive().optional(),
    featureImage: z.string().min(1).optional(),
    featureImageAlt: z.string().trim().min(1).optional(),
    featured: z.boolean().optional(),
    relatedServiceSlugs: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    // Drafts are excluded from every build (production, staging, and PR previews)
    draft: z.boolean().optional(),
  })
  .refine((data) => !data.featureImage || data.featureImageAlt, {
    message: "featureImageAlt is required when featureImage is set",
    path: ["featureImageAlt"],
  })
  .refine((data) => data.metaDescription || data.excerpt.length >= META_DESCRIPTION_MIN_LENGTH, {
    message: `excerpt is the meta description, so it needs ${META_DESCRIPTION_MIN_LENGTH}+ characters unless metaDescription is set`,
    path: ["excerpt"],
  })

export interface BlogPost {
  slug: string
  title: string
  metaTitle?: string
  metaDescription?: string
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
  featureImageAlt?: string
  featured?: boolean
  relatedServiceSlugs: string[]
  tags: string[]
  sourcePath: string
}

const WORDS_PER_MINUTE = 200
// Japanese has no word spaces, so it is estimated from characters read per minute
const JA_CHARACTERS_PER_MINUTE = 500

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\{\{video:[a-z0-9-]+\}\}/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#>*_`|~]/g, " ")
}

export function estimateReadingTime(markdown: string, locale: Locale): number {
  const text = plainText(markdown)
  const minutes =
    locale === "ja"
      ? text.replace(/\s+/g, "").length / JA_CHARACTERS_PER_MINUTE
      : text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE

  return Math.max(1, Math.ceil(minutes))
}

export function loadBlogPostsFromDirectory(
  directory: string,
  locale: Locale,
  contentSubdir: string,
  categories: BlogCategory[] = blogCategories
): BlogPost[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .flatMap((fileName) => {
      const absolutePath = path.join(directory, fileName)
      const raw = fs.readFileSync(absolutePath, "utf8")
      const parsed = matter(raw)
      const result = blogPostFrontmatterSchema.safeParse({ slug: fileName.replace(/\.md$/, ""), ...parsed.data })

      if (!result.success) {
        const issues = result.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n")
        throw new Error(`Invalid frontmatter in ${contentSubdir}/${fileName}:\n${issues}`)
      }

      const { draft, readingTime, slug, ...frontmatter } = result.data

      if (`${slug}.md` !== fileName) {
        throw new Error(`Blog post slug "${slug}" must match its filename (${contentSubdir}/${fileName})`)
      }

      // Checked for drafts too, so deleting or renaming a category in the CMS can't silently orphan any post
      const category = categories.find((candidate) => candidate.slug === frontmatter.categorySlug)
      if (!category) {
        throw new Error(
          `Blog post ${contentSubdir}/${fileName} has categorySlug "${frontmatter.categorySlug}", but ${BLOG_CATEGORIES_SUBDIR}/${frontmatter.categorySlug}.json does not exist. Create that category or move the post to an existing one.`
        )
      }

      if (draft) {
        return []
      }

      const content = parsed.content.trim()

      return [
        {
          ...frontmatter,
          slug: slug!,
          category: category.name[locale],
          readingTime: readingTime ?? estimateReadingTime(content, locale),
          featureImage: frontmatter.featureImage || undefined,
          featureImageAlt: frontmatter.featureImageAlt || undefined,
          featured: frontmatter.featured ?? false,
          relatedServiceSlugs: frontmatter.relatedServiceSlugs ?? [],
          tags: frontmatter.tags ?? [],
          content,
          sourcePath: `${contentSubdir}/${fileName}`,
        },
      ]
    })
}

function loadBlogPosts(locale: Locale): BlogPost[] {
  return loadBlogPostsFromDirectory(blogContentDirectory(locale), locale, locale === "ja" ? "content/blog/ja" : "content/blog")
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

// A post may be published in one locale only; the missing locale has no page, index entry, or hreflang.
export function getBlogPostLocales(slug: string): Locale[] {
  return locales.filter((locale) => blogPostsByLocale[locale].some((post) => post.slug === slug))
}

// Blog post and category paths published in this locale that are missing in another locale
export function getUntranslatedBlogPaths(locale: Locale): string[] {
  const posts = blogPostsByLocale[locale]
  const untranslatedPosts = posts.filter((post) => getBlogPostLocales(post.slug).length !== locales.length).map((post) => `/blog/${post.slug}/`)
  const untranslatedCategories = Array.from(new Set(posts.map((post) => post.categorySlug)))
    .filter((categorySlug) => getBlogCategoryLocales(categorySlug).length !== locales.length)
    .map((categorySlug) => `/blog/category/${categorySlug}/`)
  return [...untranslatedPosts, ...untranslatedCategories]
}

export function getAllBlogPostSlugs(): string[] {
  return Array.from(new Set(locales.flatMap((locale) => blogPostsByLocale[locale].map((post) => post.slug))))
}

export function getBlogCategoryLocales(categorySlug: string): Locale[] {
  return locales.filter((locale) => blogPostsByLocale[locale].some((post) => post.categorySlug === categorySlug))
}

// Blog markdown links to locale-neutral paths (/blog/..., /contact/); JA posts resolve them to /ja/...,
// except for blog posts that have no Japanese version, which keep pointing at the English page.
export function localizeBlogContentHref(href: string, locale: Locale): string {
  if (locale === "en" || !href.startsWith("/") || href.startsWith("//")) return href
  if (href === "/ja" || href.startsWith("/ja/") || href.startsWith("/images/")) return href

  const pathname = href.split(/[?#]/)[0]
  if (/\.[a-z0-9]+$/i.test(pathname)) return href

  const blogPostMatch = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (blogPostMatch && !getBlogPostLocales(blogPostMatch[1]).includes(locale)) {
    return href
  }

  return `/${locale}${href}`
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

// Categories that have at least one post in this locale (only those get a category page), with names and
// descriptions from content/blog-categories
export function getAllCategories(
  locale: Locale = "en"
): { name: string; description: string; ctaDescription?: string; slug: string; count: number }[] {
  const posts = getPostsForLocale(locale)
  const categoryMap = new Map<string, { name: string; description: string; ctaDescription?: string; slug: string; count: number }>()

  for (const post of posts) {
    const existing = categoryMap.get(post.categorySlug)
    if (existing) {
      existing.count++
    } else {
      const category = getBlogCategory(post.categorySlug)
      if (!category) {
        throw new Error(`${post.sourcePath} has categorySlug "${post.categorySlug}", but ${BLOG_CATEGORIES_SUBDIR}/${post.categorySlug}.json does not exist`)
      }
      categoryMap.set(post.categorySlug, {
        name: category.name[locale],
        description: category.description[locale],
        ctaDescription: category.ctaDescription[locale],
        slug: post.categorySlug,
        count: 1,
      })
    }
  }

  return Array.from(categoryMap.values())
}
