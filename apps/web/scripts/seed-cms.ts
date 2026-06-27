import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

type Locale = "en" | "ja"
type Collection = "blog-posts" | "pages" | "media"

interface MarkdownBlogPost {
  slug: string
  title: string
  excerpt: string
  body: string
  publishedAt: string
  category: string
  categorySlug: string
  author: {
    name: string
    role: string
  }
  readingTime?: number
  featured?: boolean
  featureImage?: string
  relatedServiceSlugs: string[]
  tags: string[]
}

interface PageSeed {
  key: "home" | "about" | "faqs" | "contact"
  title: string
  heroDescription?: string
  metaTitle?: string
  metaDescription?: string
  body?: string
}

interface PayloadDoc {
  id: string | number
  filename?: string
}

interface PayloadListResponse<T> {
  docs: T[]
}

interface PayloadMutationResponse<T> {
  doc?: T
}

const root = process.cwd()
const cmsUrl = process.env.CMS_API_URL || process.env.PAYLOAD_API_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL

if (!cmsUrl) {
  throw new Error("Set CMS_API_URL to the Payload server URL before running this seed script.")
}

const baseUrl = new URL(cmsUrl)
let authToken = process.env.CMS_API_TOKEN

function apiUrl(pathname: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(pathname, baseUrl)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }
  return url
}

async function loginIfNeeded() {
  if (authToken) {
    return
  }

  const email = process.env.CMS_EMAIL
  const password = process.env.CMS_PASSWORD
  if (!email || !password) {
    throw new Error("Set CMS_API_TOKEN or CMS_EMAIL/CMS_PASSWORD before running this seed script.")
  }

  const response = await fetch(apiUrl("/api/users/login"), {
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })

  if (!response.ok) {
    throw new Error(`CMS login failed: ${response.status} ${response.statusText}`)
  }

  const payload = (await response.json()) as { token?: string }
  if (!payload.token) {
    throw new Error("CMS login did not return a token.")
  }

  authToken = payload.token
}

async function cmsFetch<T>(pathname: string, init: RequestInit = {}, params: Record<string, string | number | undefined> = {}) {
  await loginIfNeeded()

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${authToken}`)
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(apiUrl(pathname, params), {
    ...init,
    headers,
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`CMS request failed: ${response.status} ${response.statusText} ${details}`)
  }

  return (await response.json()) as T
}

async function findOne(collection: Collection, field: string, value: string) {
  const response = await cmsFetch<PayloadListResponse<PayloadDoc>>(`/api/${collection}`, undefined, {
    depth: 0,
    limit: 1,
    [`where[${field}][equals]`]: value,
  })

  return response.docs[0] ?? null
}

async function createDoc<T extends object>(collection: Collection, data: T, locale?: Locale) {
  const response = await cmsFetch<PayloadDoc | PayloadMutationResponse<PayloadDoc>>(
    `/api/${collection}`,
    {
      body: JSON.stringify(data),
      method: "POST",
    },
    locale ? { locale } : {},
  )

  return unwrapDoc(response)
}

async function updateDoc<T extends object>(collection: Collection, id: string | number, data: T, locale?: Locale) {
  const response = await cmsFetch<PayloadDoc | PayloadMutationResponse<PayloadDoc>>(
    `/api/${collection}/${id}`,
    {
      body: JSON.stringify(data),
      method: "PATCH",
    },
    locale ? { locale } : {},
  )

  return unwrapDoc(response)
}

function unwrapDoc(response: PayloadDoc | PayloadMutationResponse<PayloadDoc>): PayloadDoc {
  if ("doc" in response && response.doc) {
    return response.doc
  }

  if ("id" in response) {
    return response
  }

  throw new Error("Payload response did not include a document.")
}

async function upsertLocalizedDoc<T extends object>(
  collection: Exclude<Collection, "media">,
  lookupField: string,
  lookupValue: string,
  localizedData: Record<Locale, T>,
) {
  const existing = await findOne(collection, lookupField, lookupValue)
  const englishData = { ...localizedData.en, _status: "published" }
  const japaneseData = { ...localizedData.ja, _status: "published" }

  const doc = existing
    ? await updateDoc(collection, existing.id, englishData, "en")
    : await createDoc(collection, englishData, "en")

  await updateDoc(collection, doc.id, japaneseData, "ja")
  return doc
}

async function uploadMediaIfAvailable(imagePath: string | undefined, alt: string) {
  if (!imagePath?.startsWith("/")) {
    return undefined
  }

  const absolutePath = path.join(root, "public", imagePath)
  try {
    await fs.access(absolutePath)
  } catch {
    console.warn(`Skipping missing image: ${imagePath}`)
    return undefined
  }

  const filename = path.basename(imagePath)
  const existing = await findOne("media", "filename", filename)
  if (existing) {
    return existing.id
  }

  const buffer = await fs.readFile(absolutePath)
  const formData = new FormData()
  formData.append("_payload", JSON.stringify({ alt }))
  formData.append("file", new Blob([buffer]), filename)

  const uploaded = await cmsFetch<PayloadDoc | PayloadMutationResponse<PayloadDoc>>("/api/media", {
    body: formData,
    method: "POST",
  })

  return unwrapDoc(uploaded).id
}

async function readMarkdownBlogPost(locale: Locale, fileName: string): Promise<MarkdownBlogPost> {
  const directory = locale === "ja" ? path.join(root, "content", "blog", "ja") : path.join(root, "content", "blog")
  const raw = await fs.readFile(path.join(directory, fileName), "utf8")
  const parsed = matter(raw)
  const data = parsed.data as Record<string, any>

  return {
    slug: String(data.slug),
    title: String(data.title),
    excerpt: String(data.excerpt),
    body: parsed.content.trim(),
    publishedAt: String(data.publishedAt),
    category: String(data.category),
    categorySlug: String(data.categorySlug),
    author: {
      name: String(data.author?.name ?? "Pitonne Medical Team"),
      role: String(data.author?.role ?? "Wellness Experts"),
    },
    readingTime: typeof data.readingTime === "number" ? data.readingTime : undefined,
    featured: Boolean(data.featured),
    featureImage: typeof data.featureImage === "string" ? data.featureImage : undefined,
    relatedServiceSlugs: Array.isArray(data.relatedServiceSlugs) ? data.relatedServiceSlugs.map(String) : [],
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  }
}

function toCmsBlogPayload(post: MarkdownBlogPost, featuredImage?: string | number) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    category: post.category,
    categorySlug: post.categorySlug,
    author: post.author,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    featured: post.featured ?? false,
    featuredImage,
    relatedServiceSlugs: post.relatedServiceSlugs.map((slug) => ({ slug })),
    tags: post.tags.map((tag) => ({ tag })),
  }
}

async function seedBlogPosts() {
  const englishDir = path.join(root, "content", "blog")
  const fileNames = (await fs.readdir(englishDir)).filter((fileName) => fileName.endsWith(".md")).sort()

  for (const fileName of fileNames) {
    const en = await readMarkdownBlogPost("en", fileName)
    const ja = await readMarkdownBlogPost("ja", fileName)
    const mediaId = await uploadMediaIfAvailable(en.featureImage, en.title)

    await upsertLocalizedDoc("blog-posts", "slug", en.slug, {
      en: toCmsBlogPayload(en, mediaId),
      ja: toCmsBlogPayload(ja, mediaId),
    })

    console.log(`Seeded blog post: ${en.slug}`)
  }
}

async function readDictionary(locale: Locale) {
  const raw = await fs.readFile(path.join(root, "lib", "i18n", "dictionaries", `${locale}.json`), "utf8")
  return JSON.parse(raw) as any
}

function pageSeeds(dict: any): PageSeed[] {
  return [
    {
      key: "home",
      title: dict.home.heroTitle,
      heroDescription: dict.home.heroDescription,
    },
    {
      key: "about",
      title: dict.about.aboutPitonne,
      heroDescription: dict.about.heroDescription,
      metaTitle: dict.about.aboutPitonne,
      metaDescription: dict.about.metaDescription,
    },
    {
      key: "faqs",
      title: dict.faqs.frequentlyAskedQuestions,
      heroDescription: dict.faqs.heroDescription,
      metaTitle: dict.faqs.frequentlyAskedQuestions,
      metaDescription: dict.faqs.metaDescription,
    },
    {
      key: "contact",
      title: dict.contact.contactUs,
      heroDescription: dict.contact.heroDescription,
      metaTitle: dict.contact.contactUs,
      metaDescription: dict.contact.metaDescription,
    },
  ]
}

async function seedPages() {
  const [enDict, jaDict] = await Promise.all([readDictionary("en"), readDictionary("ja")])
  const enPages = new Map(pageSeeds(enDict).map((page) => [page.key, page]))
  const jaPages = new Map(pageSeeds(jaDict).map((page) => [page.key, page]))

  for (const [key, en] of enPages) {
    const ja = jaPages.get(key)
    if (!ja) {
      throw new Error(`Missing Japanese page seed for ${key}`)
    }

    await upsertLocalizedDoc("pages", "key", key, { en, ja })
    console.log(`Seeded page: ${key}`)
  }
}

async function main() {
  await seedPages()
  await seedBlogPosts()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
