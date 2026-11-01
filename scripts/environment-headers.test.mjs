import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  COMMITTED_ROUTES,
  environmentHeaders,
  environmentRoutes,
  GATED_ROUTES,
  NOINDEX_BLOCK
} from './environment-headers.mjs'

const committed = fs.readFileSync(path.join(process.cwd(), 'public', '_headers'), 'utf8')
const committedRoutes = fs.readFileSync(path.join(process.cwd(), 'public', '_routes.json'), 'utf8')

describe('environment headers', () => {
  it('sends X-Robots-Tag: noindex on every path of a preview', () => {
    const headers = environmentHeaders(committed, 'preview')
    expect(headers.startsWith(committed.trimEnd())).toBe(true)
    expect(headers).toContain('/*\n  X-Robots-Tag: noindex, nofollow\n')
  })

  it.each([
    'production',
    'staging'
  ])('leaves the committed headers unchanged on %s, which is indexable', environment => {
    expect(committed).not.toMatch(/X-Robots-Tag/i)
    expect(environmentHeaders(committed, environment)).toBe(committed.replace(/\s*$/, '\n'))
  })

  it('is idempotent and can switch a reused out/ to an indexable environment', () => {
    const once = environmentHeaders(committed, 'preview')
    expect(environmentHeaders(once, 'preview')).toBe(once)
    expect(once.split(NOINDEX_BLOCK)).toHaveLength(2)
    for (const environment of ['production', 'staging'])
      expect(environmentHeaders(once, environment)).not.toMatch(/X-Robots-Tag/i)
  })
})

describe('environment routes', () => {
  it('reads the committed _routes.json', () => {
    expect(fs.readFileSync(COMMITTED_ROUTES, 'utf8')).toBe(committedRoutes)
  })

  it.each([
    'production',
    'preview'
  ])('keeps the committed _routes.json byte for byte on %s', environment => {
    expect(environmentRoutes(committedRoutes, environment)).toBe(committedRoutes)
  })

  it('sends every staging path through the Function, so the password gate covers static files', () => {
    expect(JSON.parse(committedRoutes).exclude.length).toBeGreaterThan(0)
    const routes = environmentRoutes(committedRoutes, 'staging')
    expect(routes).toBe(GATED_ROUTES)
    expect(JSON.parse(routes)).toEqual({ version: 1, include: ['/*'], exclude: [] })
    expect(environmentRoutes(committedRoutes, 'production')).toBe(committedRoutes)
  })
})

describe('environment-headers.mjs on a build', () => {
  const noindexed = `${committed.replace(/\s*$/, '\n')}\n${NOINDEX_BLOCK}`
  it.each([
    [{ DEPLOY_ENV: 'production' }, committed.replace(/\s*$/, '\n'), committedRoutes],
    [{ DEPLOY_ENV: 'staging' }, committed.replace(/\s*$/, '\n'), GATED_ROUTES],
    [{ NEXT_PUBLIC_DEPLOY_ENV: 'staging' }, committed.replace(/\s*$/, '\n'), GATED_ROUTES],
    [{ DEPLOY_ENV: 'preview' }, noindexed, committedRoutes],
    [{}, noindexed, committedRoutes],
    [{ DEPLOY_ENV: 'staging', NEXT_PUBLIC_DEPLOY_ENV: 'production' }, noindexed, committedRoutes]
  ])('writes the headers and routes for %j into out/', (deployEnv, headers, routes) => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'pitonne-out-'))
    try {
      fs.writeFileSync(path.join(out, '_headers'), committed)
      fs.writeFileSync(path.join(out, '_routes.json'), GATED_ROUTES)
      const env = { ...process.env, ...deployEnv }
      if (!('DEPLOY_ENV' in deployEnv)) delete env.DEPLOY_ENV
      if (!('NEXT_PUBLIC_DEPLOY_ENV' in deployEnv)) delete env.NEXT_PUBLIC_DEPLOY_ENV
      execFileSync(process.execPath, ['scripts/environment-headers.mjs', out], { env })
      expect(fs.readFileSync(path.join(out, '_headers'), 'utf8')).toBe(headers)
      expect(fs.readFileSync(path.join(out, '_routes.json'), 'utf8')).toBe(routes)
    } finally {
      fs.rmSync(out, { recursive: true, force: true })
    }
  })
})
