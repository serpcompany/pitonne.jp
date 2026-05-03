#!/usr/bin/env node
// Downloads Google Docs as markdown and reformats them to match the blog post
// frontmatter conventions used in content/blog/*.md.

import fs from "node:fs/promises"
import path from "node:path"

const DOC_IDS = [
  "1axlTrWnnxnY1R9mA2PF585hGdNWWz7bhUhdFWCtatuU",
  "1SM9zNRtA8sEWHV2AFFwayBQIXr0sYRozrdOVSKIR5pg",
  "12KhckRCvLhlWr26KU2TFsGbQWRiwk27fFzMolZDmoFw",
  "1sTNKcmUt_iW3yzsnP-L_XOuln4Elro-Sp7ph2Ba2KPA",
  "1gV22cy8X-rpjR1BZ20zCOsX0mIYXfU9fE7DtsgN0_PE",
  "19N1F9tX7_d6OYZ289QEUGkbNeUhLpZ7l1-e2i3g2ARI",
  "1_Far1t7PBMkrHRRatlXqW8evg2qCHIYV4njSd9urFFk",
  "1WuqrQfcp7ea5c6QUuWA8BEy41Ab_y_Qkt-R9qMbHV48",
  "1AdHS4PJNVnxyTJ4JpcU7oCUzTYbl5eP7Ffh61GY8otU",
  "1kVk430OSOuZju5gNvydeNpse1TMHgYAsHLQ2u2DLzuQ",
  "1CnOsEDmI_12lurGeRX6PmdAdpRnM3OGEnlBt7OssXV0",
  "1Q02V5jSewmZlk73CXsS8Kdk3qByQWjEDBJN5kZQx_n0",
  "1DYR1grImSgaNTWLHvXkhCR7b3mdDuygcM49osImlLfc",
  "1MEceoXIForI_630cBbKJiXsnHsBGHwzfHXeYGG5JPzA",
]

const OUT_DIR = path.join(process.cwd(), "tmp", "blog-drafts")
const TODAY = new Date().toISOString().slice(0, 10)

function yamlEscape(value) {
  // Always single-quote and escape inner single quotes
  return `'${String(value).replace(/'/g, "''")}'`
}

function buildFrontmatter({ slug, title, excerpt, readingTime }) {
  const lines = [
    "---",
    `slug: ${slug}`,
    `title: ${yamlEscape(title)}`,
    `excerpt: ${yamlEscape(excerpt)}`,
    `publishedAt: '${TODAY}'`,
    "category: IV Therapy",
    "categorySlug: iv-therapy",
    "author:",
    "  name: Pitonne Medical Team",
    "  role: Wellness Experts",
    `readingTime: ${readingTime}`,
    "featured: false",
    "relatedServiceSlugs: []",
    "tags: []",
    "---",
  ]
  return lines.join("\n")
}

function slugifyAscii(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

function makeSlug(title, index, used) {
  const ascii = slugifyAscii(title)
  let base = ascii && ascii.length >= 3 ? ascii : `draft-post-${String(index + 1).padStart(2, "0")}`
  let candidate = base
  let n = 2
  while (used.has(candidate)) {
    candidate = `${base}-${n++}`
  }
  used.add(candidate)
  return candidate
}

function estimateReadingTime(text) {
  // Japanese ~ 600 chars/min, English ~ 200 wpm. Use char-based heuristic.
  const charCount = text.replace(/\s+/g, "").length
  return Math.max(1, Math.round(charCount / 600))
}

function cleanContent(rawMarkdown) {
  let md = rawMarkdown.replace(/\r\n/g, "\n")

  // Remove leading "# タブ 1" / "# Tab 1" headings that the export adds.
  md = md.replace(/^#\s*(?:タブ|Tab)\s*\d+\s*\n+/, "")

  // Drop a leading BOM if present.
  if (md.charCodeAt(0) === 0xfeff) md = md.slice(1)

  // Normalize: collapse 3+ blank lines to 2.
  md = md.replace(/\n{3,}/g, "\n\n")

  return md.trim() + "\n"
}

function extractTitle(md) {
  const match = md.match(/^#\s+(.+?)\s*$/m)
  return match ? match[1].trim() : null
}

function extractExcerpt(md) {
  // First non-heading paragraph
  const lines = md.split("\n")
  let started = false
  const buf = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (started) break
      continue
    }
    if (/^#{1,6}\s/.test(trimmed)) {
      if (started) break
      continue
    }
    started = true
    buf.push(trimmed)
  }
  let text = buf.join(" ").replace(/\s+/g, " ").trim()
  // Strip simple markdown emphasis/links for excerpt
  text = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1")
  text = text.replace(/\[(.+?)\]\([^)]+\)/g, "$1")
  if (text.length > 220) {
    text = text.slice(0, 217).replace(/\s+\S*$/, "") + "…"
  }
  return text || "Draft excerpt — please update."
}

async function fetchDoc(id) {
  const url = `https://docs.google.com/document/d/${id}/export?format=md`
  const res = await fetch(url, { redirect: "follow" })
  if (!res.ok) throw new Error(`Failed to fetch ${id}: ${res.status}`)
  return await res.text()
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })

  const summary = []
  const usedSlugs = new Set()

  for (let i = 0; i < DOC_IDS.length; i++) {
    const id = DOC_IDS[i]
    process.stdout.write(`[${i + 1}/${DOC_IDS.length}] ${id} … `)
    try {
      const raw = await fetchDoc(id)
      const body = cleanContent(raw)
      const title = extractTitle(body) || `Draft Post ${i + 1}`
      const excerpt = extractExcerpt(body)
      const readingTime = estimateReadingTime(body)
      const slug = makeSlug(title, i, usedSlugs)

      const frontmatter = buildFrontmatter({ slug, title, excerpt, readingTime })
      const fileBody = `${frontmatter}\n\n${body}`

      const filename = `${String(i + 1).padStart(2, "0")}-${slug}.md`
      const outPath = path.join(OUT_DIR, filename)
      await fs.writeFile(outPath, fileBody, "utf8")
      summary.push({ filename, title, slug })
      console.log("ok")
    } catch (err) {
      console.log(`FAILED: ${err.message}`)
      summary.push({ id, error: err.message })
    }
  }

  console.log("\nSummary:")
  for (const s of summary) {
    if (s.error) console.log(`  ! ${s.id}: ${s.error}`)
    else console.log(`  - ${s.filename}  —  ${s.title}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
