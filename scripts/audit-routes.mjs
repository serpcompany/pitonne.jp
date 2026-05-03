import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const root = process.cwd()
const failures = []

const staticRoutes = new Set()

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".devin") continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (entry.name !== "page.tsx") continue
    const rel = path.relative(path.join(root, "app"), path.dirname(fullPath))
    if (rel.includes("[") || rel.includes("]")) continue
    staticRoutes.add(rel === "" ? "/" : `/${rel}/`)
  }
}

function markdownFrontmatter(dir) {
  return fs
    .readdirSync(path.join(root, dir))
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => matter(fs.readFileSync(path.join(root, dir, fileName), "utf8")).data)
}

function areaRoutes() {
  const source = fs.readFileSync(path.join(root, "lib/data/areas.ts"), "utf8")
  const routes = []
  let currentWard = ""

  for (const line of source.split("\n")) {
    const wardMatch = line.match(/^ {4}slug: "([^"]+)"/)
    if (wardMatch) {
      currentWard = wardMatch[1]
      routes.push(`/areas-served/${currentWard}/`)
      continue
    }

    const areaMatch = line.match(/^ {8}slug: "([^"]+)"/)
    if (areaMatch && currentWard) {
      routes.push(`/areas-served/${currentWard}/${areaMatch[1]}/`)
    }
  }

  return routes
}

walk(path.join(root, "app"))

const serviceRoutes = markdownFrontmatter("content/services").map((item) => item.canonicalPath)
const blogPosts = markdownFrontmatter("content/blog")
const blogRoutes = blogPosts.map((item) => `/blog/${item.slug}/`)
const categoryRoutes = [...new Set(blogPosts.map((item) => `/blog/category/${item.categorySlug}/`))]

const canonicalRoutes = [
  "/",
  "/about/",
  "/areas-served/",
  "/blog/",
  "/contact/",
  "/legal/",
  "/legal/disclaimer/",
  "/legal/privacy-policy/",
  "/legal/terms-conditions/",
  "/services/",
  ...serviceRoutes,
  ...blogRoutes,
  ...categoryRoutes,
  ...areaRoutes(),
]

for (const route of canonicalRoutes) {
  const parts = route.split("/").filter(Boolean)
  const slug = parts.at(-1)

  if (staticRoutes.has(route)) continue
  if (route.startsWith("/services/") && serviceRoutes.includes(route)) continue
  if (route.startsWith("/blog/category/") && categoryRoutes.includes(route)) continue
  if (route.startsWith("/blog/") && blogRoutes.includes(route)) continue
  if (route.startsWith("/areas-served/") && areaRoutes().includes(route)) continue

  failures.push(`Missing canonical route coverage: ${route}${slug ? ` (${slug})` : ""}`)
}

const nextConfig = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8")
for (const [source, destination] of [
  ["/services/medications/", "/services/medication/"],
]) {
  if (!nextConfig.includes(`source: "${source}"`) || !nextConfig.includes(`destination: "${destination}"`)) {
    failures.push(`Missing redirect from ${source} to ${destination}`)
  }
}

for (const duplicateRouteFile of [
  "app/privacy-policy/page.tsx",
  "app/terms-of-use/page.tsx",
  "app/medical-disclaimer/page.tsx",
  "app/legal/terms-and-conditions/page.tsx",
]) {
  if (fs.existsSync(path.join(root, duplicateRouteFile))) {
    failures.push(`Remove duplicate route file: ${duplicateRouteFile}`)
  }
}

for (const removedRedirect of ["/privacy-policy/", "/terms-of-use/", "/legal/terms-and-conditions/", "/medical-disclaimer/"]) {
  if (nextConfig.includes(`source: "${removedRedirect}"`)) {
    failures.push(`Remove legacy legal redirect source: ${removedRedirect}`)
  }
}

if (canonicalRoutes.includes("/areas-served/chiyoda/tokyo-station/")) {
  failures.push("Tokyo Station must not be treated as a canonical area route")
}

if (failures.length) {
  console.error(failures.join("\n"))
  process.exit(1)
}

console.log(`Route audit passed for ${new Set(canonicalRoutes).size} canonical routes.`)
