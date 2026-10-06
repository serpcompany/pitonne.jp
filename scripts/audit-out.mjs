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

const failures = [
  ...[...required, ...childSitemaps].filter((file) => !fs.existsSync(path.join(OUT, file))).map((file) => `missing out/${file}`),
  ...forbidden.filter((file) => fs.existsSync(path.join(OUT, file))).map((file) => `unexpected out/${file}`),
  ...(fs.existsSync(indexPath) && childSitemaps.length === 0 ? [`out/${SITEMAP_INDEX} lists no sitemaps`] : []),
]

if (failures.length > 0) {
  console.error(`Export audit failed (run \`pnpm build\` first):\n${failures.map((f) => `- ${f}`).join("\n")}`)
  process.exit(1)
}

console.log(`Export audit passed (${childSitemaps.length} child sitemaps).`)
