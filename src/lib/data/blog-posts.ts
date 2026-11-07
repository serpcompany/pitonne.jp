import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import {
  BLOG_SLUG_PATTERN,
  EXCERPT_MAX_LENGTH,
  EXCERPT_MIN_LENGTH,
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_MIN_LENGTH,
  META_TITLE_MAX_LENGTH,
  META_TITLE_MIN_LENGTH
} from '@/lib/blog-rules'
import {
  BLOG_CATEGORIES_SUBDIR,
  type BlogCategory,
  blogCategories
} from '@/lib/data/blog-categories'
import { serviceSlugForCmsValue } from '@/lib/data/services'
import { type Locale, locales } from '@/lib/i18n/config'

function blogContentDirectory(locale: Locale): string {
  if (locale === 'ja') {
    return path.join(process.cwd(), 'content', 'blog', 'ja')
  }
  return path.join(process.cwd(), 'content', 'blog')
}

const blogPostFrontmatterSchema = z.object({
  slug: z.string().regex(BLOG_SLUG_PATTERN, 'slug must be lowercase kebab-case').optional(),
  title: z.string().min(1),
  metaTitle: z.string().trim().min(META_TITLE_MIN_LENGTH).max(META_TITLE_MAX_LENGTH).optional(),
  metaDescription: z
    .string()
    .trim()
    .min(META_DESCRIPTION_MIN_LENGTH)
    .max(META_DESCRIPTION_MAX_LENGTH)
    .optional(),
  excerpt: z.string().trim().min(EXCERPT_MIN_LENGTH).max(EXCERPT_MAX_LENGTH),
  publishedAt: z.preprocess(
    value =>
      value instanceof Date && value.toISOString().endsWith('T00:00:00.000Z')
        ? value.toISOString().slice(0, 10)
        : value,
    z
      .string({ message: 'publishedAt must be a date (YYYY-MM-DD) without a time' })
      .regex(/^\d{4}-\d{2}-\d{2}$/)
  ),
  categorySlug: z.string().regex(BLOG_SLUG_PATTERN, 'categorySlug must be lowercase kebab-case'),
  author: z.object({
    name: z.string().min(1),
    role: z.string().min(1)
  }),
  readingTime: z.number().int().positive().optional(),
  featureImage: z.string().min(1).optional(),
  featureImageAlt: z.string().trim().min(1).optional(),
  featured: z.boolean().optional(),
  relatedServiceSlugs: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional()
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
  featureImageAlt: string
  featured?: boolean
  relatedServiceSlugs: string[]
  tags: string[]
  sourcePath: string
}

const WORDS_PER_MINUTE = 200
const JA_CHARACTERS_PER_MINUTE = 500

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\{\{video:[a-z0-9-]+\}\}/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#>*_`|~]/g, ' ')
}

export function estimateReadingTime(markdown: string, locale: Locale): number {
  const text = plainText(markdown)
  const minutes =
    locale === 'ja'
      ? text.replace(/\s+/g, '').length / JA_CHARACTERS_PER_MINUTE
      : text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE

  return Math.max(1, Math.ceil(minutes))
}

export function fallbackMetaDescription(
  excerpt: string,
  markdown: string,
  locale: Locale
): string | undefined {
  if (excerpt.length >= META_DESCRIPTION_MIN_LENGTH) {
    return undefined
  }

  const separator = locale === 'ja' ? '' : ' '
  const sentences =
    plainText(markdown)
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.replace(/\s+/g, ' ').trim())
      .filter(paragraph => /[。！？.!?]$/.test(paragraph))
      .join(separator)
      .match(/[^。！？.!?]+[。！？.!?]+/g) ?? []

  let description = excerpt
  for (const sentence of sentences) {
    const next = `${description}${separator}${sentence.trim()}`
    if (next.length > META_DESCRIPTION_MAX_LENGTH) {
      break
    }
    description = next
    if (description.length >= META_DESCRIPTION_MIN_LENGTH) {
      return description
    }
  }

  const remainder = sentences.join(separator)
  if (!remainder) {
    return undefined
  }
  const extended = `${excerpt}${separator}${remainder}`
    .slice(0, META_DESCRIPTION_MAX_LENGTH - 1)
    .trimEnd()
  return `${extended}…`
}

export function withoutLeadingTitleHeading(markdown: string): string {
  return markdown.replace(/^#[ \t]+[^\n]*\n*/, '')
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
    .filter(fileName => fileName.endsWith('.md'))
    .flatMap(fileName => {
      const absolutePath = path.join(directory, fileName)
      const raw = fs.readFileSync(absolutePath, 'utf8')
      const parsed = matter(raw)
      const fileSlug = fileName.replace(/\.md$/, '')
      const result = blogPostFrontmatterSchema.safeParse({
        slug: fileSlug,
        ...parsed.data
      })

      if (!result.success) {
        const issues = result.error.issues
          .map(issue => `  ${issue.path.join('.')}: ${issue.message}`)
          .join('\n')
        throw new Error(`Invalid frontmatter in ${contentSubdir}/${fileName}:\n${issues}`)
      }

      const { draft, readingTime, slug, ...frontmatter } = result.data

      if (`${slug}.md` !== fileName) {
        throw new Error(
          `Blog post slug "${slug}" must match its filename (${contentSubdir}/${fileName})`
        )
      }

      const category = categories.find(candidate => candidate.slug === frontmatter.categorySlug)
      if (!category) {
        throw new Error(
          `Blog post ${contentSubdir}/${fileName} has categorySlug "${frontmatter.categorySlug}", but ${BLOG_CATEGORIES_SUBDIR}/${frontmatter.categorySlug}.json does not exist. Create that category or move the post to an existing one.`
        )
      }

      if (draft) {
        return []
      }

      const content = withoutLeadingTitleHeading(parsed.content.trim())

      return [
        {
          ...frontmatter,
          slug: fileSlug,
          category: category.name[locale],
          metaDescription:
            frontmatter.metaDescription ??
            fallbackMetaDescription(frontmatter.excerpt, content, locale),
          readingTime: readingTime ?? estimateReadingTime(content, locale),
          featureImage: frontmatter.featureImage || undefined,
          featureImageAlt: frontmatter.featureImageAlt || frontmatter.title,
          featured: frontmatter.featured ?? false,
          relatedServiceSlugs: (frontmatter.relatedServiceSlugs ?? []).map(serviceSlugForCmsValue),
          tags: frontmatter.tags ?? [],
          content,
          sourcePath: `${contentSubdir}/${fileName}`
        }
      ]
    })
}

function loadBlogPosts(locale: Locale): BlogPost[] {
  return loadBlogPostsFromDirectory(
    blogContentDirectory(locale),
    locale,
    locale === 'ja' ? 'content/blog/ja' : 'content/blog'
  )
}

const blogPostsByLocale = { en: loadBlogPosts('en'), ja: loadBlogPosts('ja') }

export const blogPosts: BlogPost[] = blogPostsByLocale.en

function getPostsForLocale(locale: Locale): BlogPost[] {
  return blogPostsByLocale[locale]
}

export function getAllBlogPosts(locale: Locale = 'en'): BlogPost[] {
  return [...getPostsForLocale(locale)].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getBlogPostBySlug(slug: string, locale: Locale = 'en'): BlogPost | undefined {
  return getPostsForLocale(locale).find(post => post.slug === slug)
}

export function getBlogPostLocales(slug: string): Locale[] {
  return locales.filter(locale => blogPostsByLocale[locale].some(post => post.slug === slug))
}

export function getUntranslatedBlogPaths(locale: Locale): string[] {
  const posts = blogPostsByLocale[locale]
  const untranslatedPosts = posts
    .filter(post => getBlogPostLocales(post.slug).length !== locales.length)
    .map(post => `/blog/${post.slug}/`)
  const untranslatedCategories = Array.from(new Set(posts.map(post => post.categorySlug)))
    .filter(categorySlug => getBlogCategoryLocales(categorySlug).length !== locales.length)
    .map(categorySlug => `/blog/category/${categorySlug}/`)
  return [...untranslatedPosts, ...untranslatedCategories]
}

export function getAllBlogPostSlugs(): string[] {
  return Array.from(
    new Set(locales.flatMap(locale => blogPostsByLocale[locale].map(post => post.slug)))
  )
}

export function getBlogCategoryLocales(categorySlug: string): Locale[] {
  return locales.filter(locale =>
    blogPostsByLocale[locale].some(post => post.categorySlug === categorySlug)
  )
}

export function localizeBlogContentHref(rawHref: string, locale: Locale): string {
  const href = rawHref.replace(/^https?:\/\/(?:www\.)?pitonne\.jp(?=\/|$)/i, '') || '/'
  if (locale === 'en' || !href.startsWith('/') || href.startsWith('//')) return href
  if (href === '/ja' || href.startsWith('/ja/') || href.startsWith('/images/')) return href

  const pathname = href.split(/[?#]/)[0]
  if (/\.[a-z0-9]+$/i.test(pathname)) return href

  const blogPostMatch = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (blogPostMatch && !getBlogPostLocales(blogPostMatch[1]).includes(locale)) {
    return href
  }

  return `/${locale}${href}`
}

export function getBlogPostsByCategory(categorySlug: string, locale: Locale = 'en'): BlogPost[] {
  return getAllBlogPosts(locale).filter(post => post.categorySlug === categorySlug)
}

export function getRelatedServiceSlugsForPost(post: {
  relatedServiceSlugs?: string[]
  categorySlug: string
}): string[] {
  if (post.relatedServiceSlugs?.length) {
    return post.relatedServiceSlugs
  }

  return post.categorySlug === 'iv-therapy' ? ['iv-therapy'] : []
}

export function getBlogPostsForService(
  serviceSlug: string,
  limit: number = 3,
  locale: Locale = 'en'
): BlogPost[] {
  const matchingPosts = getAllBlogPosts(locale)
    .filter(post => getRelatedServiceSlugsForPost(post).includes(serviceSlug))
    .slice(0, limit)

  return matchingPosts.length > 0 ? matchingPosts : getAllBlogPosts(locale).slice(0, limit)
}

export function getAllCategories(
  locale: Locale = 'en'
): { name: string; description: string; ctaDescription?: string; slug: string; count: number }[] {
  const posts = getPostsForLocale(locale)
  const slugs = Array.from(new Set(posts.map(post => post.categorySlug)))

  return slugs.flatMap(slug =>
    blogCategories
      .filter(category => category.slug === slug)
      .map(category => ({
        name: category.name[locale],
        description: category.description[locale],
        ctaDescription: category.ctaDescription[locale],
        slug,
        count: posts.filter(post => post.categorySlug === slug).length
      }))
  )
}
