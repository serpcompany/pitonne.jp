#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { deployEnvironment, hasPasswordGate, isIndexable } from '../src/lib/deploy-environment.mts'
import { runMain } from './run-main.mjs'

export const NOINDEX_MARKER =
  '# Non-production build: never index (scripts/environment-headers.mjs)'
export const NOINDEX_BLOCK = `${NOINDEX_MARKER}\n/*\n  X-Robots-Tag: noindex, nofollow\n`
export const GATED_ROUTES = `${JSON.stringify({ version: 1, include: ['/*'], exclude: [] }, null, 2)}\n`
export const COMMITTED_ROUTES = new URL('../public/_routes.json', import.meta.url)

export function environmentHeaders(headers, environment) {
  const markerAt = headers.indexOf(NOINDEX_MARKER)
  const base = (markerAt === -1 ? headers : headers.slice(0, markerAt)).replace(/\s*$/, '\n')
  return isIndexable(environment) ? base : `${base}\n${NOINDEX_BLOCK}`
}

export function environmentRoutes(committedRoutes, environment) {
  return hasPasswordGate(environment) ? GATED_ROUTES : committedRoutes
}

function main([outDir = 'out']) {
  const file = path.resolve(outDir, '_headers')
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}; run \`next build\` first.`)
    process.exit(1)
  }
  const environment = deployEnvironment(process.env)
  fs.writeFileSync(file, environmentHeaders(fs.readFileSync(file, 'utf8'), environment))
  fs.writeFileSync(
    path.resolve(outDir, '_routes.json'),
    environmentRoutes(fs.readFileSync(COMMITTED_ROUTES, 'utf8'), environment)
  )
  console.log(
    `${environment} build: ${isIndexable(environment) ? 'indexable headers' : 'added X-Robots-Tag: noindex'}; ${hasPasswordGate(environment) ? 'every path runs the password gate' : 'committed _routes.json'}.`
  )
}

await runMain(import.meta.url, main)
