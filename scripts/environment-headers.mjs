#!/usr/bin/env node
// Adds the environment's response headers to out/_headers after `next build` (issue #78).
//
// Every build that isn't explicitly production (Staging, PR previews, local builds) sends `X-Robots-Tag: noindex` on
// every response, on top of the meta robots tag and the `Disallow: /` robots.txt those builds already have. Cloudflare
// adds that header to `*.pitonne-jp.pages.dev` aliases on its own, but not to custom domains such as
// staging.pitonne.jp, so the build sets it explicitly. Production builds never get it.
// Usage: node scripts/environment-headers.mjs [outDir]   (reads DEPLOY_ENV / NEXT_PUBLIC_DEPLOY_ENV)
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

export const NOINDEX_MARKER = "# Non-production build: never index (scripts/environment-headers.mjs)"
export const NOINDEX_BLOCK = `${NOINDEX_MARKER}\n/*\n  X-Robots-Tag: noindex, nofollow\n`

/** Same rule as isProductionDeployment() in lib/seo.ts: production only when explicitly marked. */
export function isProductionEnv(env) {
  return env.DEPLOY_ENV === "production" || env.NEXT_PUBLIC_DEPLOY_ENV === "production"
}

/** The `_headers` file for this environment: the committed rules, plus the noindex block unless production. */
export function environmentHeaders(headers, production) {
  const markerAt = headers.indexOf(NOINDEX_MARKER)
  const base = (markerAt === -1 ? headers : headers.slice(0, markerAt)).replace(/\s*$/, "\n")
  return production ? base : `${base}\n${NOINDEX_BLOCK}`
}

function main([outDir = "out"]) {
  const file = path.resolve(outDir, "_headers")
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}; run \`next build\` first.`)
    process.exit(1)
  }
  const production = isProductionEnv(process.env)
  fs.writeFileSync(file, environmentHeaders(fs.readFileSync(file, "utf8"), production))
  console.log(production ? "Production build: indexable headers." : "Non-production build: added X-Robots-Tag: noindex.")
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2))
}
