import fs from "node:fs"
import path from "node:path"

const root = process.cwd()

const canonicalRoutes = [
  "/",
  "/about/",
  "/areas-served/",
  "/areas-served/chiyoda/",
  "/areas-served/chiyoda/akihabara/",
  "/areas-served/chiyoda/iidabashi/",
  "/areas-served/chiyoda/kanda/",
  "/areas-served/chiyoda/otemachi/",
  "/areas-served/chiyoda/tokyo-station/",
  "/areas-served/chuo/",
  "/areas-served/chuo/ginza/",
  "/areas-served/chuo/hatchobori/",
  "/areas-served/chuo/nihonbashi/",
  "/areas-served/chuo/tsukiji/",
  "/areas-served/minato/",
  "/areas-served/minato/akasaka/",
  "/areas-served/minato/azabu-juban/",
  "/areas-served/minato/hiroo/",
  "/areas-served/minato/roppongi/",
  "/areas-served/minato/shimbashi/",
  "/areas-served/minato/toranomon/",
  "/areas-served/shibuya/",
  "/areas-served/shibuya/daikanyama/",
  "/areas-served/shibuya/ebisu/",
  "/areas-served/shibuya/harajuku/",
  "/areas-served/shibuya/hiroo/",
  "/areas-served/shibuya/omotesando/",
  "/areas-served/shibuya/sendagaya/",
  "/areas-served/shibuya/yoyogi/",
  "/areas-served/shibuya/yoyogi-uehara/",
  "/areas-served/shinagawa/",
  "/areas-served/shinagawa/gotanda/",
  "/areas-served/shinagawa/osaki/",
  "/areas-served/shinagawa/takanawa/",
  "/blog/",
  "/blog/category/iv-therapy/",
  "/blog/iv-therapy-for-dehydration/",
  "/blog/iv-therapy-for-fatigue/",
  "/blog/iv-therapy-for-hangover/",
  "/blog/what-is-an-exosome-iv-drip-differences-from-stem-cell-conditioned-media-cost-and-risks-explained/",
  "/contact/",
  "/legal/",
  "/legal/disclaimer/",
  "/legal/privacy-policy/",
  "/legal/terms-and-conditions/",
  "/legal/terms-conditions/",
  "/services/",
  "/services/ed-medication/",
  "/services/energy-fatigue-recovery-iv/",
  "/services/exosome-iv-drip/",
  "/services/hangover-iv-drip/",
  "/services/immune-boost-iv-therapy/",
  "/services/iv-therapy/",
  "/services/iv-vitamin-therapy/",
  "/services/medication/",
  "/services/skin-brightening-iv-drip/",
  "/services/stem-cell-nasal-spray/",
  "/services/stem-cell-therapy/",
]

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

function slugsFrom(file) {
  const source = fs.readFileSync(path.join(root, file), "utf8")
  return [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1])
}

function hasDynamicServiceRoute(route) {
  return route.startsWith("/services/") && route.split("/").filter(Boolean).length === 2
}

function hasDynamicWardRoute(route) {
  return route.startsWith("/areas-served/") && route.split("/").filter(Boolean).length === 2
}

function hasDynamicAreaRoute(route) {
  return route.startsWith("/areas-served/") && route.split("/").filter(Boolean).length === 3
}

function hasDynamicBlogRoute(route) {
  return route.startsWith("/blog/") && !route.startsWith("/blog/category/") && route.split("/").filter(Boolean).length === 2
}

function hasDynamicBlogCategoryRoute(route) {
  return route.startsWith("/blog/category/") && route.split("/").filter(Boolean).length === 3
}

walk(path.join(root, "app"))

const serviceSlugs = new Set(slugsFrom("lib/data/services.ts"))
const areaSource = fs.readFileSync(path.join(root, "lib/data/areas.ts"), "utf8")
const blogSlugs = new Set(slugsFrom("lib/data/blog-posts.ts"))
const blogSource = fs.readFileSync(path.join(root, "lib/data/blog-posts.ts"), "utf8")
const hasAreaDynamicPage = fs.existsSync(path.join(root, "app/areas-served/[ward]/[area]/page.tsx"))
const hasServiceDynamicPage = fs.existsSync(path.join(root, "app/services/[service]/page.tsx"))
const hasBlogDynamicPage = fs.existsSync(path.join(root, "app/blog/[post]/page.tsx"))

const failures = []

for (const route of canonicalRoutes) {
  const parts = route.split("/").filter(Boolean)
  const slug = parts.at(-1)

  if (staticRoutes.has(route)) continue
  if (hasServiceDynamicPage && hasDynamicServiceRoute(route) && serviceSlugs.has(slug)) continue
  if (hasDynamicWardRoute(route) && areaSource.includes(`slug: "${slug}"`)) continue
  if (hasAreaDynamicPage && hasDynamicAreaRoute(route) && areaSource.includes(`slug: "${slug}"`)) continue
  if (hasBlogDynamicPage && hasDynamicBlogRoute(route) && blogSlugs.has(slug)) continue
  if (hasDynamicBlogCategoryRoute(route) && blogSource.includes(`categorySlug: "${slug}"`)) continue

  failures.push(`Missing canonical route coverage: ${route}`)
}

for (const slug of ["iv-therapy", "stem-cell-therapy", "medication"]) {
  if (!serviceSlugs.has(slug)) {
    failures.push(`Missing parent service data slug: ${slug}`)
  }
}

if (!fs.readFileSync(path.join(root, "next.config.mjs"), "utf8").includes("/services/medications")) {
  failures.push("Missing redirect for /services/medications/ to /services/medication/")
}

if (failures.length) {
  console.error(failures.join("\n"))
  process.exit(1)
}

console.log(`Route audit passed for ${canonicalRoutes.length} canonical routes.`)
