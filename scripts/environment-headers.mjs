#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { runMain } from './run-main.mjs'

export const NOINDEX_MARKER =
  '# Non-production build: never index (scripts/environment-headers.mjs)'
export const NOINDEX_BLOCK = `${NOINDEX_MARKER}\n/*\n  X-Robots-Tag: noindex, nofollow\n`

export function isProductionEnv(env) {
  return env.DEPLOY_ENV === 'production' || env.NEXT_PUBLIC_DEPLOY_ENV === 'production'
}

export function environmentHeaders(headers, production) {
  const markerAt = headers.indexOf(NOINDEX_MARKER)
  const base = (markerAt === -1 ? headers : headers.slice(0, markerAt)).replace(/\s*$/, '\n')
  return production ? base : `${base}\n${NOINDEX_BLOCK}`
}

function main([outDir = 'out']) {
  const file = path.resolve(outDir, '_headers')
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}; run \`next build\` first.`)
    process.exit(1)
  }
  const production = isProductionEnv(process.env)
  fs.writeFileSync(file, environmentHeaders(fs.readFileSync(file, 'utf8'), production))
  console.log(
    production
      ? 'Production build: indexable headers.'
      : 'Non-production build: added X-Robots-Tag: noindex.'
  )
}

await runMain(import.meta.url, main)
