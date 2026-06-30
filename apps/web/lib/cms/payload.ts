import type { Locale } from "@/lib/i18n/config"

export type CmsPageKey = "home" | "about" | "faqs" | "contact"

export interface CmsBlogPost {
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
  readingTime?: number
  featureImage?: string
  featured: boolean
  relatedServiceSlugs: string[]
  tags: string[]
}

export interface CmsPageContent {
  key: CmsPageKey
  title: string
  heroDescription?: string
  metaTitle?: string
  metaDescription?: string
  body?: string
}

interface PayloadListResponse<T> {
  docs: T[]
}

interface PayloadMedia {
  url?: string | null
  filename?: string | null
}

interface PayloadBlogPost {
  slug?: string
  title?: string
  excerpt?: string
  body?: string
  publishedAt?: string
  category?: string
  categorySlug?: string
  author?: {
    name?: string
    role?: string
  }
  readingTime?: number
  featuredImage?: PayloadMedia | string | null
  featured?: boolean
  relatedServiceSlugs?: Array<{ slug?: string | null } | string> | null
  tags?: Array<{ tag?: string | null } | string> | null
}

interface PayloadPage {
  key?: CmsPageKey
  title?: string
  heroDescription?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  body?: string | null
}

const API_URL_ENV_NAMES = ["CMS_API_URL", "PAYLOAD_API_URL", "PAYLOAD_PUBLIC_SERVER_URL"] as const

const blogPostCache = new Map<string, Promise<CmsBlogPost[] | null>>()
const pageCache = new Map<string, Promise<CmsPageContent | null>>()
const shouldCacheCmsRequests = process.env.NODE_ENV === "production"

export function getCmsBaseUrl(): string | null {
  const rawUrl = API_URL_ENV_NAMES.map((name) => process.env[name]).find((value): value is string => Boolean(value?.trim()))

  if (!rawUrl) {
    return null
  }

  try {
    return new URL(rawUrl).origin + new URL(rawUrl).pathname.replace(/\/+$/, "")
  } catch {
    console.warn(`Ignoring invalid CMS API URL: ${rawUrl}`)
    return null
  }
}

export function isCmsConfigured(): boolean {
  return getCmsBaseUrl() !== null
}

export function resetCmsClientCacheForTests() {
  blogPostCache.clear()
  pageCache.clear()
}

function createCmsUrl(pathname: string, params: Record<string, string | number | boolean | undefined>) {
  const baseUrl = getCmsBaseUrl()
  if (!baseUrl) {
    return null
  }

  const url = new URL(pathname, baseUrl)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  return url
}

async function fetchPayloadList<T>(pathname: string, params: Record<string, string | number | boolean | undefined>) {
  const url = createCmsUrl(pathname, params)
  if (!url) {
    return null
  }

  const headers: HeadersInit = {
    Accept: "application/json",
  }
  if (process.env.CMS_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.CMS_API_TOKEN}`
  }

  try {
    const response = await fetch(url, {
      cache: shouldCacheCmsRequests ? "force-cache" : "no-store",
      headers,
    })

    if (!response.ok) {
      console.warn(`CMS request failed: ${response.status} ${response.statusText} for ${url.pathname}`)
      return null
    }

    return (await response.json()) as PayloadListResponse<T>
  } catch (error) {
    console.warn(`CMS request failed for ${url.pathname}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

function absoluteCmsUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  const baseUrl = getCmsBaseUrl()
  if (!baseUrl) {
    return value
  }

  return new URL(value, baseUrl).toString()
}

function normalizeMediaUrl(value: PayloadBlogPost["featuredImage"]): string | undefined {
  if (!value || typeof value === "string") {
    return undefined
  }

  const url = value.url || (value.filename ? `/api/media/file/${value.filename}` : undefined)
  return url ? absoluteCmsUrl(url) : undefined
}

function normalizeStringList(
  items: Array<{ slug?: string | null; tag?: string | null } | string> | null | undefined,
  key: "slug" | "tag",
): string[] {
  if (!items) {
    return []
  }

  return items
    .map((item) => (typeof item === "string" ? item : item[key]))
    .filter((value): value is string => Boolean(value))
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

function normalizeBlogPost(doc: PayloadBlogPost): CmsBlogPost | null {
  if (!doc.slug || !doc.title || !doc.excerpt || !doc.body || !doc.publishedAt || !doc.category || !doc.categorySlug) {
    return null
  }

  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.body.trim(),
    publishedAt: doc.publishedAt.slice(0, 10),
    category: doc.category,
    categorySlug: doc.categorySlug,
    author: {
      name: doc.author?.name || "Pitonne Medical Team",
      role: doc.author?.role || "Wellness Experts",
    },
    readingTime: doc.readingTime || estimateReadingTime(doc.body),
    featureImage: normalizeMediaUrl(doc.featuredImage),
    featured: doc.featured ?? false,
    relatedServiceSlugs: normalizeStringList(doc.relatedServiceSlugs, "slug"),
    tags: normalizeStringList(doc.tags, "tag"),
  }
}

function normalizePage(doc: PayloadPage): CmsPageContent | null {
  if (!doc.key || !doc.title) {
    return null
  }

  return {
    key: doc.key,
    title: doc.title,
    heroDescription: doc.heroDescription || undefined,
    metaTitle: doc.metaTitle || undefined,
    metaDescription: doc.metaDescription || undefined,
    body: doc.body || undefined,
  }
}

async function fetchCmsBlogPosts(locale: Locale): Promise<CmsBlogPost[] | null> {
  const response = await fetchPayloadList<PayloadBlogPost>("/api/blog-posts", {
    depth: 1,
    limit: 100,
    locale,
    sort: "-publishedAt",
    "where[_status][equals]": "published",
  })

  if (!response) {
    return null
  }

  return response.docs.map(normalizeBlogPost).filter((post): post is CmsBlogPost => post !== null)
}

export function getCmsBlogPosts(locale: Locale): Promise<CmsBlogPost[] | null> {
  if (!shouldCacheCmsRequests) {
    return fetchCmsBlogPosts(locale)
  }

  const cacheKey = `${getCmsBaseUrl() || "disabled"}:${locale}`
  if (!blogPostCache.has(cacheKey)) {
    blogPostCache.set(cacheKey, fetchCmsBlogPosts(locale))
  }

  return blogPostCache.get(cacheKey)!
}

async function fetchCmsPage(key: CmsPageKey, locale: Locale): Promise<CmsPageContent | null> {
  const response = await fetchPayloadList<PayloadPage>("/api/pages", {
    depth: 0,
    limit: 1,
    locale,
    "where[_status][equals]": "published",
    "where[key][equals]": key,
  })

  if (!response) {
    return null
  }

  return normalizePage(response.docs[0] ?? {})
}

export function getCmsPage(key: CmsPageKey, locale: Locale): Promise<CmsPageContent | null> {
  if (!shouldCacheCmsRequests) {
    return fetchCmsPage(key, locale)
  }

  const cacheKey = `${getCmsBaseUrl() || "disabled"}:${locale}:${key}`
  if (!pageCache.has(cacheKey)) {
    pageCache.set(cacheKey, fetchCmsPage(key, locale))
  }

  return pageCache.get(cacheKey)!
}
