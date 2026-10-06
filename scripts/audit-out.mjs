// Checks the static export in out/ for the files Cloudflare Pages needs. Run after `pnpm build`.
// Sitemaps are checked by audit:seo, which reads them.
import fs from "node:fs"
import path from "node:path"

const OUT = path.join(process.cwd(), "out")
const required = ["index.html", "ja/index.html", "robots.txt", "_headers", "_redirects"]
// English is the default locale and is served without a prefix; an out/en/ folder means a duplicate site.
const forbidden = ["en"]

const failures = [
  ...required.filter((file) => !fs.existsSync(path.join(OUT, file))).map((file) => `missing out/${file}`),
  ...forbidden.filter((file) => fs.existsSync(path.join(OUT, file))).map((file) => `unexpected out/${file}`),
]

if (failures.length > 0) {
  console.error(`Export audit failed (run \`pnpm build\` first):\n${failures.map((f) => `- ${f}`).join("\n")}`)
  process.exit(1)
}

console.log("Export audit passed.")
