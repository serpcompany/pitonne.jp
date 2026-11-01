import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEPLOY_ENVIRONMENTS,
  deployEnvironment,
  hasAnalytics,
  hasPasswordGate,
  isIndexable,
  siteOrigin
} from '@/lib/deploy-environment.mts'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('deploy environment', () => {
  it.each(DEPLOY_ENVIRONMENTS)('reads %s from DEPLOY_ENV or NEXT_PUBLIC_DEPLOY_ENV', name => {
    expect(deployEnvironment({ DEPLOY_ENV: name })).toBe(name)
    expect(deployEnvironment({ NEXT_PUBLIC_DEPLOY_ENV: name })).toBe(name)
    expect(deployEnvironment({ DEPLOY_ENV: name, NEXT_PUBLIC_DEPLOY_ENV: name })).toBe(name)
  })

  it.each([
    {},
    { DEPLOY_ENV: '' },
    { DEPLOY_ENV: 'Production' },
    { DEPLOY_ENV: 'prod' },
    { DEPLOY_ENV: ' production' },
    { NEXT_PUBLIC_DEPLOY_ENV: 'development' },
    { DEPLOY_ENV: 'production', NEXT_PUBLIC_DEPLOY_ENV: 'staging' },
    { DEPLOY_ENV: 'staging', NEXT_PUBLIC_DEPLOY_ENV: 'production' },
    { DEPLOY_ENV: 'production', NEXT_PUBLIC_DEPLOY_ENV: 'nope' }
  ])('falls back to preview for a missing, unknown or conflicting value: %j', env => {
    expect(deployEnvironment(env)).toBe('preview')
  })

  it('reads process.env when it is used, not when the module loads', () => {
    vi.stubEnv('DEPLOY_ENV', 'staging')
    vi.stubEnv('NEXT_PUBLIC_DEPLOY_ENV', '')
    expect(deployEnvironment()).toBe('staging')
    expect(siteOrigin()).toBe('https://staging.pitonne.jp')
    vi.stubEnv('DEPLOY_ENV', 'production')
    expect(deployEnvironment()).toBe('production')
    expect(siteOrigin()).toBe('https://pitonne.jp')
  })

  it('derives indexing, analytics, the password gate and the site origin from it', () => {
    const traits = Object.fromEntries(
      DEPLOY_ENVIRONMENTS.map(name => [
        name,
        [isIndexable(name), hasAnalytics(name), hasPasswordGate(name), siteOrigin(name)]
      ])
    )
    expect(traits).toEqual({
      production: [true, true, false, 'https://pitonne.jp'],
      staging: [true, false, true, 'https://staging.pitonne.jp'],
      preview: [false, false, false, 'https://pitonne.jp']
    })
  })

  it('is the only code that reads DEPLOY_ENV', () => {
    const root = process.cwd()
    const sources = ['src', 'scripts', 'functions', 'tools'].flatMap(dir =>
      fs
        .readdirSync(path.join(root, dir), { recursive: true })
        .map(String)
        .filter(file => /\.(?:[cm]?[jt]sx?)$/.test(file) && !/\.test\.[a-z]+$/.test(file))
        .map(file => path.join(dir, file).split(path.sep).join('/'))
    )
    const readers = sources.filter(file =>
      /\b(?:NEXT_PUBLIC_)?DEPLOY_ENV\b/.test(fs.readFileSync(path.join(root, file), 'utf8'))
    )
    expect(readers).toEqual(['src/lib/deploy-environment.mts'])
  })
})
