import fs from "node:fs/promises"
import path from "node:path"

export const BLOG_DRAFT_SOURCES = [
  {
    topic: "Allergies",
    slug: "exosome-iv-therapy-risks-precautions",
    docId: "1sTNKcmUt_iW3yzsnP-L_XOuln4Elro-Sp7ph2Ba2KPA",
    tabId: "t.k1x6twnjjk19",
    featureImage: "/images/content/sheet/services/immune-boost-iv-therapy.jpg",
    relatedServiceSlugs: ["exosome-iv-drip", "iv-therapy"],
    tags: ["iv therapy", "allergies", "safety", "tokyo"],
  },
  {
    topic: "Nausea",
    slug: "iv-therapy-for-hangover-in-tokyo",
    docId: "1_Far1t7PBMkrHRRatlXqW8evg2qCHIYV4njSd9urFFk",
    tabId: "t.0",
    featureImage: "/images/content/sheet/blog/iv-therapy-for-dehydration.jpg",
    relatedServiceSlugs: ["hangover-iv-drip", "iv-therapy"],
    tags: ["iv therapy", "nausea", "hydration", "tokyo"],
  },
  {
    topic: "Immune health",
    slug: "iv-therapy-for-cold-flu-tokyo",
    docId: "1AdHS4PJNVnxyTJ4JpcU7oCUzTYbl5eP7Ffh61GY8otU",
    tabId: "t.vs2e4rxb09mh",
    featureImage: "/images/content/sheet/services/immune-boost-iv-therapy.jpg",
    relatedServiceSlugs: ["immune-boost-iv-therapy", "iv-therapy"],
    tags: ["iv therapy", "immune health", "cold and flu", "tokyo"],
  },
  {
    topic: "Gut health",
    slug: "iv-therapy-for-detox-support",
    docId: "1MEceoXIForI_630cBbKJiXsnHsBGHwzfHXeYGG5JPzA",
    tabId: "t.jygco4njr3f8",
    featureImage: "/images/wellness-consultation.jpg",
    relatedServiceSlugs: ["iv-vitamin-therapy", "iv-therapy"],
    tags: ["iv therapy", "gut health", "detox", "tokyo"],
  },
  {
    topic: "Stress",
    slug: "iv-therapy-for-fatigue-in-tokyo",
    docId: "1CnOsEDmI_12lurGeRX6PmdAdpRnM3OGEnlBt7OssXV0",
    tabId: "t.tvgjq61z0xy1",
    featureImage: "/images/content/sheet/blog/iv-therapy-for-fatigue.jpg",
    relatedServiceSlugs: ["energy-fatigue-recovery-iv", "iv-therapy"],
    tags: ["iv therapy", "stress", "fatigue", "tokyo"],
  },
  {
    topic: "Jet lag",
    slug: "iv-therapy-for-low-energy",
    docId: "1Q02V5jSewmZlk73CXsS8Kdk3qByQWjEDBJN5kZQx_n0",
    tabId: "t.kheflcro80vc",
    featureImage: "/images/content/sheet/services/energy-fatigue-recovery-iv.jpg",
    relatedServiceSlugs: ["energy-fatigue-recovery-iv", "iv-therapy"],
    tags: ["iv therapy", "jet lag", "low energy", "tokyo"],
  },
  {
    topic: "Relaxation",
    slug: "exosome-iv-therapy-for-muscle-recovery",
    docId: "1kVk430OSOuZju5gNvydeNpse1TMHgYAsHLQ2u2DLzuQ",
    tabId: "t.7sb3s7d7mfa2",
    featureImage: "/images/content/sheet/services/exosome-iv-drip.jpg",
    relatedServiceSlugs: ["exosome-iv-drip", "iv-therapy"],
    tags: ["iv therapy", "relaxation", "recovery", "tokyo"],
  },
]

export const BLOG_DRAFT_OUT_DIR = path.join(process.cwd(), "tmp", "blog-drafts")
export const BLOG_DRAFT_PUBLISHED_AT = "2026-05-31"

export function buildGoogleDocExportUrl({ docId, tabId }) {
  const url = new URL(`https://docs.google.com/document/d/${docId}/export`)
  url.searchParams.set("format", "md")
  url.searchParams.set("tab", tabId)
  return url
}

function yamlEscape(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function formatYamlList(key, values) {
  return [key + ":", ...values.map((value) => `  - ${yamlEscape(value)}`)]
}

export function slugifyAscii(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

function makeSlug(source, title, index, usedSlugs) {
  const ascii = source.slug ?? slugifyAscii(title)
  const base = ascii && ascii.length >= 3 ? ascii : `draft-post-${String(index + 1).padStart(2, "0")}`
  let candidate = base
  let suffix = 2

  while (usedSlugs.has(candidate)) {
    candidate = `${base}-${suffix++}`
  }

  usedSlugs.add(candidate)
  return candidate
}

export function estimateReadingTime(markdown) {
  const wordCount = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()]|https?:\/\/\S+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.ceil(wordCount / 200))
}

export function cleanContent(rawMarkdown) {
  let markdown = rawMarkdown.replace(/\r\n/g, "\n")

  if (markdown.charCodeAt(0) === 0xfeff) {
    markdown = markdown.slice(1)
  }

  markdown = markdown.replace(/^#\s*(?:タブ|Tab)\s*\d+\s*\n+/u, "")
  markdown = markdown.replace(/^\s*If you want, I can continue with the next topic now:.*$/gim, "")
  markdown = markdown.replace(/^\s*\[image\d*\]:\s+\S+\s*$/gim, "")
  markdown = markdown.replace(/!\[\]\[image\d*\]\n*/g, "")
  markdown = markdown.replace(/\n{3,}/g, "\n\n")

  return markdown.trim() + "\n"
}

export function extractTitle(markdown) {
  return markdown.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim() ?? null
}

export function extractExcerpt(markdown) {
  const paragraphs = markdown
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !/^#{1,6}\s/.test(paragraph))

  let excerpt = (paragraphs[0] ?? "Draft excerpt - please update.")
    .replace(/\s+/g, " ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\([^)]+\)/g, "$1")
    .trim()

  if (excerpt.length > 220) {
    excerpt = excerpt.slice(0, 217).replace(/\s+\S*$/, "") + "..."
  }

  return excerpt
}

function buildFrontmatter({ source, slug, title, excerpt, readingTime }) {
  const lines = [
    "---",
    `slug: ${slug}`,
    `title: ${yamlEscape(title)}`,
    `excerpt: ${yamlEscape(excerpt)}`,
    `publishedAt: '${BLOG_DRAFT_PUBLISHED_AT}'`,
    "category: IV Therapy",
    "categorySlug: iv-therapy",
    "author:",
    "  name: Pitonne Medical Team",
    "  role: Wellness Experts",
    `readingTime: ${readingTime}`,
    "featured: false",
    `featureImage: ${source.featureImage}`,
    ...formatYamlList("relatedServiceSlugs", source.relatedServiceSlugs),
    ...formatYamlList("tags", source.tags),
    "---",
  ]

  return lines.join("\n")
}

export function buildDraftMarkdown({ source, index, usedSlugs, rawMarkdown }) {
  const body = cleanContent(rawMarkdown)
  const title = extractTitle(body) ?? `Draft Post ${index + 1}`
  const excerpt = extractExcerpt(body)
  const readingTime = estimateReadingTime(body)
  const slug = makeSlug(source, title, index, usedSlugs)
  const frontmatter = buildFrontmatter({ source, slug, title, excerpt, readingTime })

  return {
    slug,
    title,
    filename: `${slug}.md`,
    markdown: `${frontmatter}\n\n${body}`,
  }
}

export async function fetchDocMarkdown(source, fetchImpl = fetch) {
  const url = buildGoogleDocExportUrl(source)
  const response = await fetchImpl(url, { redirect: "follow" })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.docId} (${source.tabId}): ${response.status}`)
  }

  return await response.text()
}

async function cleanManagedMarkdown(outDir) {
  await fs.mkdir(outDir, { recursive: true })
  const entries = await fs.readdir(outDir, { withFileTypes: true })

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => fs.unlink(path.join(outDir, entry.name))),
  )
}

export async function writeBlogDrafts({
  sources = BLOG_DRAFT_SOURCES,
  outDir = BLOG_DRAFT_OUT_DIR,
  fetchImpl = fetch,
  clean = true,
} = {}) {
  if (clean) {
    await cleanManagedMarkdown(outDir)
  } else {
    await fs.mkdir(outDir, { recursive: true })
  }

  const usedSlugs = new Set()
  const drafts = []

  for (let index = 0; index < sources.length; index++) {
    const source = sources[index]
    const rawMarkdown = await fetchDocMarkdown(source, fetchImpl)
    const draft = buildDraftMarkdown({ source, index, usedSlugs, rawMarkdown })
    const outPath = path.join(outDir, draft.filename)

    await fs.writeFile(outPath, draft.markdown, "utf8")
    drafts.push({ ...draft, outPath, topic: source.topic })
  }

  return drafts
}
