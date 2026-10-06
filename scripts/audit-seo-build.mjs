#!/usr/bin/env node
/**
 * Post-build SEO audit of the static export in out/ (run after `pnpm build`).
 *
 * Mirrors the Ahrefs Site Audit checks that previously failed for pitonne.jp:
 * - <title> 15–70 chars and meta description 110–160 chars
 * - exactly one <h1> per page
 * - complete Open Graph tags, with og:url matching the canonical URL
 * - internal links that resolve to a page (no 404s, no redirects)
 * - each URL listed in only one sitemap, and every sitemap URL exists
 * - no oversized image files
 *
 * Usage: node scripts/audit-seo-build.mjs [outDir]
 */

import fs from "node:fs"
import path from "node:path"

const OUT = path.resolve(process.argv[2] || "out")
const SITE_URL = "https://pitonne.jp"
const limits = JSON.parse(fs.readFileSync(new URL("../lib/seo-limits.json", import.meta.url), "utf8"))
const TITLE_RANGE = [limits.title.min, limits.title.max]
const DESCRIPTION_RANGE = [limits.description.min, limits.description.max]
const REQUIRED_OG = ["og:title", "og:description", "og:image", "og:url", "og:type"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const SITEMAPS = ["sitemap.xml", "videos-sitemap.xml"]

if (!fs.existsSync(path.join(OUT, "index.html"))) {
  console.error(`No build output found in ${OUT}. Run \`pnpm build\` first.`)
  process.exit(1)
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name)
    if (fs.statSync(fullPath).isDirectory()) {
      if (name !== "_next") walk(fullPath, files)
    } else {
      files.push(fullPath)
    }
  }
  return files
}

const HTML_ENTITIES = { amp: "&", quot: '"', "#x27": "'", "#39": "'", lt: "<", gt: ">" }
// Single pass so "&amp;quot;" decodes to "&quot;", not '"'
const decode = (value) => value.replace(/&(amp|quot|#x27|#39|lt|gt);/g, (_, entity) => HTML_ENTITIES[entity])

const SITE = new URL(SITE_URL)
const SITE_HOSTS = new Set([SITE.hostname, `www.${SITE.hostname}`])

// Parse a link against the page it appears on and compare hosts exactly (not by string prefix).
function classifyLink(href, baseUrl) {
  let url
  try {
    url = new URL(href, baseUrl)
  } catch {
    return { kind: "external" }
  }
  if (!SITE_HOSTS.has(url.hostname)) return { kind: "external" }
  if (url.protocol !== SITE.protocol || url.hostname !== SITE.hostname) return { kind: "non-canonical" }
  return { kind: "internal", path: url.pathname }
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`))
  return match ? decode(match[1]) : null
}

function metaContent(html, key) {
  for (const tag of html.match(/<meta[^>]*>/g) || []) {
    if (attribute(tag, "name") === key || attribute(tag, "property") === key) return attribute(tag, "content")
  }
  return null
}

const redirectSources = fs
  .readFileSync(path.join(OUT, "_redirects"), "utf8")
  .split("\n")
  .map((line) => line.trim().split(/\s+/)[0])
  .filter(Boolean)

function resolveInternal(href) {
  let pathname
  try {
    pathname = decodeURI(href.split("#")[0].split("?")[0])
  } catch {
    return "broken" // malformed percent-encoding
  }
  if (!pathname) return "ok"
  if (redirectSources.some((source) => source === pathname || (source.endsWith("*") && pathname.startsWith(source.slice(0, -1))))) {
    return "redirect"
  }
  const target = path.join(OUT, pathname)
  if (pathname.endsWith("/")) return fs.existsSync(path.join(target, "index.html")) ? "ok" : "broken"
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return "ok"
  if (fs.existsSync(path.join(target, "index.html"))) return "redirect" // missing trailing slash
  return "broken"
}

const allFiles = walk(OUT)
const pages = allFiles.filter((file) => file.endsWith(".html"))
const findings = []
const report = (urlPath, message) => findings.push(`${urlPath}: ${message}`)

for (const file of pages) {
  const urlPath = "/" + path.relative(OUT, file).replace(/index\.html$/, "").replace(/\.html$/, "")
  if (urlPath.startsWith("/404") || urlPath.startsWith("/_not-found")) continue

  const html = fs.readFileSync(file, "utf8")
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "")
  const description = metaContent(html, "description") || ""
  const canonical = attribute((html.match(/<link[^>]*rel="canonical"[^>]*>/) || [""])[0], "href")
  const h1Count = (html.match(/<h1[\s>]/g) || []).length

  if (title.length < TITLE_RANGE[0] || title.length > TITLE_RANGE[1]) {
    report(urlPath, `title is ${title.length} chars (want ${TITLE_RANGE.join("–")}): ${title}`)
  }
  if (description.length < DESCRIPTION_RANGE[0] || description.length > DESCRIPTION_RANGE[1]) {
    report(urlPath, `meta description is ${description.length} chars (want ${DESCRIPTION_RANGE.join("–")})`)
  }
  if (h1Count !== 1) report(urlPath, `has ${h1Count} <h1> tags (want 1)`)

  const missingOg = REQUIRED_OG.filter((key) => !metaContent(html, key))
  if (missingOg.length > 0) report(urlPath, `missing Open Graph tags: ${missingOg.join(", ")}`)
  const ogUrl = metaContent(html, "og:url")
  if (ogUrl && canonical && ogUrl !== canonical) report(urlPath, `og:url ${ogUrl} does not match canonical ${canonical}`)

  for (const tag of html.match(/<a\s[^>]*href="[^"]*"/g) || []) {
    const href = attribute(tag, "href")
    const link = classifyLink(href, SITE_URL + urlPath)
    if (link.kind === "non-canonical") {
      report(urlPath, `links to non-canonical URL ${href} (use ${SITE_URL})`)
      continue
    }
    if (link.kind !== "internal") continue
    const status = resolveInternal(link.path)
    if (status === "broken") report(urlPath, `broken internal link ${href}`)
    if (status === "redirect") report(urlPath, `internal link redirects: ${href}`)
  }
}

const sitemapOwners = new Map()
for (const sitemap of SITEMAPS) {
  const xml = fs.readFileSync(path.join(OUT, sitemap), "utf8")
  for (const [, loc] of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) {
    const url = decode(loc)
    sitemapOwners.set(url, [...(sitemapOwners.get(url) || []), sitemap])
    const link = classifyLink(url, SITE_URL)
    if (link.kind === "internal" && resolveInternal(link.path) !== "ok") {
      report(sitemap, `lists URL that is not a page: ${url}`)
    }
  }
}
for (const [url, owners] of sitemapOwners) {
  if (owners.length > 1) report(url, `listed in multiple sitemaps: ${owners.join(", ")}`)
}

for (const file of allFiles) {
  if (/\.(jpe?g|png|webp|gif|avif)$/i.test(file) && fs.statSync(file).size > MAX_IMAGE_BYTES) {
    const megabytes = (fs.statSync(file).size / 1024 / 1024).toFixed(1)
    report("/" + path.relative(OUT, file), `image is ${megabytes} MB (max ${MAX_IMAGE_BYTES / 1024 / 1024} MB)`)
  }
}

if (findings.length > 0) {
  console.log(findings.join("\n"))
  console.log(`\n${findings.length} SEO issue(s) found in ${pages.length} pages.`)
  process.exit(1)
}

console.log(`SEO audit passed for ${pages.length} pages and ${sitemapOwners.size} sitemap URLs.`)
