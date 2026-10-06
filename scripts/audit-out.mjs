// Checks the static export in out/ for the files Cloudflare Pages needs. Run after `pnpm build`.
// It checks that every sitemap file exists; audit:seo reads them and checks their URLs.
import fs from "node:fs"
import path from "node:path"

const OUT = path.join(process.cwd(), "out")
const SITEMAP_INDEX = "sitemap-index.xml"
// _routes.json keeps static files off the canonical-host Function (functions/_middleware.ts)
const required = ["index.html", "ja/index.html", "robots.txt", "_headers", "_redirects", "_routes.json", SITEMAP_INDEX, "sitemap.xml"]
// English is the default locale and is served without a prefix; an out/en/ folder means a duplicate site.
const forbidden = ["en"]

// Every child sitemap the index lists (/sitemap-<group>.xml at the root) must be in the export
const indexPath = path.join(OUT, SITEMAP_INDEX)
const childSitemaps = fs.existsSync(indexPath)
  ? [...fs.readFileSync(indexPath, "utf8").matchAll(/<loc>[^<]*\/(sitemap-[^/<]+\.xml)<\/loc>/g)].map(([, file]) => file)
  : []

// Paths excluded in _routes.json never reach the canonical-host Function, so they answer 200 on pages.dev. Only static
// files may live there, never an exported page.
function htmlUnder(relative) {
  const full = path.join(OUT, relative)
  if (!fs.existsSync(full)) return []
  if (!fs.statSync(full).isDirectory()) return relative.endsWith(".html") ? [relative] : []
  return fs
    .readdirSync(full, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith(".html"))
    .map((file) => path.join(relative, file))
}
const routesPath = path.join(OUT, "_routes.json")
const excludedRoutes = fs.existsSync(routesPath) ? JSON.parse(fs.readFileSync(routesPath, "utf8")).exclude ?? [] : []
const htmlInExcludedRoutes = excludedRoutes.flatMap((rule) => htmlUnder(rule.replace(/^\//, "").replace(/\*$/, "")))

// Indexability must agree: a build whose robots.txt disallows everything (anything but production) also sends
// X-Robots-Tag: noindex from _headers (scripts/environment-headers.mjs), and a production build never does.
const read = (file) => (fs.existsSync(path.join(OUT, file)) ? fs.readFileSync(path.join(OUT, file), "utf8") : null)
const robots = read("robots.txt")
const headers = read("_headers")
const indexMismatch = []
if (robots !== null && headers !== null) {
  const disallowsAll = /^Disallow:\s*\/\s*$/m.test(robots)
  const sendsNoindex = /^\s*X-Robots-Tag:.*\bnoindex\b/im.test(headers)
  if (disallowsAll && !sendsNoindex) indexMismatch.push("out/robots.txt disallows crawling but out/_headers sends no X-Robots-Tag: noindex")
  if (!disallowsAll && sendsNoindex) indexMismatch.push("out/_headers sends X-Robots-Tag: noindex but out/robots.txt allows crawling")
}

const failures = [
  ...[...required, ...childSitemaps].filter((file) => !fs.existsSync(path.join(OUT, file))).map((file) => `missing out/${file}`),
  ...forbidden.filter((file) => fs.existsSync(path.join(OUT, file))).map((file) => `unexpected out/${file}`),
  ...htmlInExcludedRoutes.map((file) => `out/${file} is a page under a path _routes.json keeps off the Function`),
  ...indexMismatch,
  ...(fs.existsSync(indexPath) && childSitemaps.length === 0 ? [`out/${SITEMAP_INDEX} lists no sitemaps`] : []),
]

if (failures.length > 0) {
  console.error(`Export audit failed (run \`pnpm build\` first):\n${failures.map((f) => `- ${f}`).join("\n")}`)
  process.exit(1)
}

console.log(`Export audit passed (${childSitemaps.length} child sitemaps).`)
