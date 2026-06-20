import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const failures = []

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8")
}

const footer = read("components/footer.tsx")
const header = read("components/header.tsx")
const home = read("app/[locale]/page.tsx")
const layout = read("app/layout.tsx")
const siteData = read("lib/data/site.ts")
const serviceDetailPage = read("app/[locale]/services/[service]/page.tsx")
const serviceDetailTemplate = read("components/services/service-detail-template.tsx")
const pageHero = read("components/shared/page-hero.tsx")
const areaDetailPage = read("components/area-detail-page.tsx")
const blogPostPage = read("app/[locale]/blog/[post]/page.tsx")
const blogPostTemplate = read("components/blog/blog-post-template.tsx")
const globalsCss = read("app/globals.css")

const expectedBusinessInfo = [
  "03-6821-8285",
  "pitonne.am@gmail.com",
  "106-0031 Tokyo, Minato City, Nishiazabu",
  "3 Chome−17−22 モダンフォルム西麻布 1階",
  "https://ssv.onemorehand.jp/hic_pitonne/",
]

for (const value of expectedBusinessInfo) {
  if (!footer.includes(value) && !layout.includes(value) && !siteData.includes(value)) {
    failures.push(`Missing Sheet business info in footer/layout: ${value}`)
  }
}

for (const value of ["businessHours", "formatBusinessHours", "businessHoursDisplay", "hours: businessHoursDisplay"]) {
  if (!siteData.includes(value)) {
    failures.push(`Business hours must be derived from the shared source in lib/data/site.ts: missing ${value}`)
  }
}

for (const [file, source] of [
  ["components/header.tsx", header],
  ["components/footer.tsx", footer],
  ["app/[locale]/page.tsx", home],
]) {
  if (source.includes("/services/medications")) {
    failures.push(`${file} links to non-canonical /services/medications`)
  }
  if (source.includes("/medical-disclaimer")) {
    failures.push(`${file} links to non-canonical /medical-disclaimer`)
  }
}

for (const disallowed of ["placeholder", "logoipsum", "glowence"]) {
  const matches = [
    ["app/[locale]/page.tsx", home],
    ["components/header.tsx", header],
    ["components/footer.tsx", footer],
  ].flatMap(([file, source]) =>
    source.toLowerCase().includes(disallowed) ? [file] : []
  )
  if (matches.length > 0) {
    failures.push(`Visible code references disallowed demo asset term "${disallowed}": ${matches.join(", ")}`)
  }
}

function walkContent(dir) {
  if (!fs.existsSync(path.join(root, dir))) return []
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkContent(rel)
    return entry.isFile() ? [rel] : []
  })
}

for (const file of walkContent("content")) {
  const source = read(file)
  for (const disallowed of ["localhost:10013", "wp-content/uploads", "controls_data", "SubmitResponseMarkup", "This draft should be finalized"]) {
    if (source.includes(disallowed)) {
      failures.push(`Content file ${file} contains disallowed migrated artifact: ${disallowed}`)
    }
  }
}

const serviceDetailUsesSharedHero = serviceDetailTemplate.includes("PageHero")
const serviceDetailLinksToServices =
  serviceDetailTemplate.includes("dict.nav.services") &&
  serviceDetailTemplate.includes('localizedRoute("/services/", locale)')

if (!serviceDetailPage.includes("ServiceDetailTemplate") || !serviceDetailUsesSharedHero || !serviceDetailLinksToServices) {
  failures.push("Service detail hero must include breadcrumb navigation back to Services")
}

if (!serviceDetailTemplate.includes("dict.nav.home") || !serviceDetailTemplate.includes("service.name")) {
  failures.push("Service detail breadcrumbs must include Home and the current service label")
}

const heroSource = serviceDetailUsesSharedHero
  ? pageHero
  : serviceDetailTemplate.slice(
      serviceDetailTemplate.indexOf("<section"),
      serviceDetailTemplate.indexOf('<section className="py-16')
    )

if (heroSource.includes("absolute inset-0") || heroSource.includes("object-cover")) {
  failures.push("Service detail hero must not use a background image or overlay")
}

if (!areaDetailPage.includes("www.google.com/maps") || !areaDetailPage.includes("<iframe")) {
  failures.push("Area detail page template must include a Google Maps embed")
}

if (!areaDetailPage.includes("mapQuery") || !areaDetailPage.includes("areaName") || !areaDetailPage.includes("wardName")) {
  failures.push("Area map embed must be generated from the current area and ward")
}

if (!blogPostPage.includes("BlogPostTemplate") || !blogPostTemplate.includes("blog-prose")) {
  failures.push("Blog post content must use the project-owned blog-prose formatting class")
}

for (const selector of [".blog-prose h2", ".blog-prose p", ".blog-prose ul", ".blog-prose li"]) {
  if (!globalsCss.includes(selector)) {
    failures.push(`Missing blog prose CSS selector: ${selector}`)
  }
}

if (failures.length) {
  console.error(failures.join("\n"))
  process.exit(1)
}

console.log("Content audit passed.")
