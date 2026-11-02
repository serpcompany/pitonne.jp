import { timingSafeEqual } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  type AssetServer,
  type FunctionEnv,
  SMOKE_TEST_HEADER,
  STAGING_ORIGIN
} from '@/lib/canonical-host'
import { onRequest } from '../../functions/_middleware'

const PASSWORD = 'stagingpassword'
const PREVIEW_BRANCH = ['pr', 12].join('-')
const staging: FunctionEnv = { CF_PAGES_BRANCH: 'staging', STAGING_PASSWORD: PASSWORD }
const basic = (credentials: string) =>
  `Basic ${Buffer.from(credentials, 'utf8').toString('base64')}`

const subtle = crypto.subtle as SubtleCrypto & { timingSafeEqual?: unknown }
const compare = vi.fn((a: ArrayBuffer, b: ArrayBuffer) =>
  timingSafeEqual(new Uint8Array(a), new Uint8Array(b))
)
beforeAll(() => {
  Object.defineProperty(subtle, 'timingSafeEqual', { value: compare, configurable: true })
})
afterAll(() => {
  Reflect.deleteProperty(subtle, 'timingSafeEqual')
})

function assets(headers: Record<string, string> = { 'Content-Type': 'text/html' }) {
  const asked: Request[] = []
  const next: AssetServer = async request => {
    if (request) asked.push(request)
    return new Response('static asset', { headers })
  }
  return { asked, next }
}

async function serve(
  url: string,
  headers: Record<string, string> = {},
  env: FunctionEnv = staging,
  server = assets()
) {
  const response = await onRequest({
    request: new Request(url, { headers }),
    next: server.next,
    env
  })
  return { response, asked: server.asked }
}

const page = `${STAGING_ORIGIN}/ja/services/`

function expectChallenge(response: Response) {
  expect(response.status).toBe(401)
  expect(response.headers.get('www-authenticate')).toBe(
    'Basic realm="Pitonne staging", charset="UTF-8"'
  )
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(response.headers.get('x-robots-tag')).toMatch(/\bnoindex\b/)
}

describe('staging password gate', () => {
  it.each([
    ['no Authorization header', {}],
    ['the wrong password', { authorization: basic('editor:wrong') }],
    ['the password as the username', { authorization: basic(`${PASSWORD}:`) }],
    ['no colon', { authorization: basic(PASSWORD) }],
    ['a bearer token', { authorization: `Bearer ${PASSWORD}` }],
    ['broken base64', { authorization: 'Basic %%%' }]
  ])('answers 401 with a Basic challenge to %s, without serving anything', async (_, headers) => {
    const { response, asked } = await serve(page, headers)
    expectChallenge(response)
    expect(asked).toHaveLength(0)
  })

  it.each([
    '',
    'editor',
    'ahrefs',
    'ユーザー'
  ])('checks only the password, whatever the username (%j)', async username => {
    const { response, asked } = await serve(page, {
      authorization: basic(`${username}:${PASSWORD}`)
    })
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('static asset')
    expect(asked).toHaveLength(1)
  })

  it('accepts a password that contains a colon or non-ASCII characters', async () => {
    for (const password of ['pass:word', 'パスワード']) {
      const env = { ...staging, STAGING_PASSWORD: password }
      const { response } = await serve(page, { authorization: basic(`x:${password}`) }, env)
      expect(response.status).toBe(200)
      expectChallenge((await serve(page, { authorization: basic('x:pass') }, env)).response)
    }
  })

  it('compares SHA-256 digests of both values in constant time', async () => {
    const sha256 = async (value: string) =>
      Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
    const longer = 'wrong-and-much-longer-than-the-password'
    compare.mockClear()
    expectChallenge((await serve(page, { authorization: basic(`x:${longer}`) })).response)
    expect(compare).toHaveBeenCalledTimes(1)
    const [given, expected] = compare.mock.calls[0]
    expect(Buffer.from(given)).toEqual(await sha256(longer))
    expect(Buffer.from(expected)).toEqual(await sha256(PASSWORD))
  })

  it('fails closed when STAGING_PASSWORD is missing or empty', async () => {
    for (const STAGING_PASSWORD of [undefined, '']) {
      const env = { CF_PAGES_BRANCH: 'staging', STAGING_PASSWORD }
      for (const authorization of [basic(`x:${PASSWORD}`), basic('x:'), basic(':')]) {
        const { response, asked } = await serve(page, { authorization }, env)
        expectChallenge(response)
        expect(asked).toHaveLength(0)
      }
    }
  })

  it('strips Authorization before serving a verified request, and never adds noindex to it', async () => {
    const { response, asked } = await serve(page, {
      authorization: basic(`x:${PASSWORD}`),
      accept: 'text/html'
    })
    expect(response.headers.has('x-robots-tag')).toBe(false)
    expect(response.headers.has('www-authenticate')).toBe(false)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(asked[0].headers.has('authorization')).toBe(false)
    expect(asked[0].headers.get('accept')).toBe('text/html')
    expect(asked[0].url).toBe(page)
  })

  it.each([
    ['a smoke-test request', page, { [SMOKE_TEST_HEADER]: '1' }],
    ['/robots.txt', `${STAGING_ORIGIN}/robots.txt`, {}]
  ])('serves %s without the password, with noindex', async (_, url, headers) => {
    for (const env of [staging, { CF_PAGES_BRANCH: 'staging' }]) {
      const { response, asked } = await serve(url, { ...headers, authorization: 'Basic %%%' }, env)
      expect(response.status).toBe(200)
      expect(response.headers.get('x-robots-tag')).toMatch(/\bnoindex\b/)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(response.headers.has('www-authenticate')).toBe(false)
      expect(asked).toHaveLength(1)
      expect(asked[0].headers.has('authorization')).toBe(false)
    }
  })

  it('keeps noindex on an exempt request even when it carries the password', async () => {
    const { response } = await serve(`${STAGING_ORIGIN}/robots.txt`, {
      authorization: basic(`x:${PASSWORD}`)
    })
    expect(response.headers.get('x-robots-tag')).toMatch(/\bnoindex\b/)
  })

  it.each([
    '/favicon.ico',
    '/images/content/sheet/home.jpg',
    '/_next/static/x.js',
    '/robots.txt/'
  ])('gates %s like any page', async path => {
    expectChallenge((await serve(`${STAGING_ORIGIN}${path}`)).response)
  })

  it('redirects a slashed file only after the password check', async () => {
    const url = `${STAGING_ORIGIN}/sitemap-index.xml/?a=1`
    expectChallenge((await serve(url)).response)
    const { response } = await serve(url, { authorization: basic(`x:${PASSWORD}`) })
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`${STAGING_ORIGIN}/sitemap-index.xml?a=1`)
    expect(response.headers.has('x-robots-tag')).toBe(false)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })

  it('keeps every answer it serves out of shared caches, whatever the file itself allows', async () => {
    const cacheable = {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400'
    }
    const sitemap = `${STAGING_ORIGIN}/sitemap-index.xml`
    for (const [url, headers] of [
      [sitemap, { authorization: basic(`x:${PASSWORD}`) }],
      [sitemap, { [SMOKE_TEST_HEADER]: '1' }],
      [`${STAGING_ORIGIN}/robots.txt`, {}]
    ] as const) {
      const { response } = await serve(url, headers, staging, assets(cacheable))
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(response.headers.get('content-type')).toBe('application/xml')
    }
  })

  it.each([
    { CF_PAGES_BRANCH: 'main' },
    { CF_PAGES_BRANCH: PREVIEW_BRANCH },
    {}
  ])('never gates another deployment (%j), even with STAGING_PASSWORD set', async branch => {
    const env = { ...branch, STAGING_PASSWORD: PASSWORD }
    for (const url of ['https://pitonne.jp/ja/', 'https://pr-12.pitonne-jp.pages.dev/']) {
      const { response } = await serve(url, {}, env)
      expect(response.status).toBe(200)
      expect(response.headers.has('www-authenticate')).toBe(false)
      expect(response.headers.has('x-robots-tag')).toBe(false)
    }
  })
})

describe('staging canonical host', () => {
  const smoke = { [SMOKE_TEST_HEADER]: '1' }

  it.each([
    ['https://staging.pitonne-jp.pages.dev/ja/services/?a=1', `${STAGING_ORIGIN}/ja/services/?a=1`],
    ['https://d49a67b6.pitonne-jp.pages.dev/contact', `${STAGING_ORIGIN}/contact/`],
    ['https://STAGING.pitonne-jp.pages.dev/robots.txt/', `${STAGING_ORIGIN}/robots.txt`]
  ])('sends %s to %s in one 308, before asking for the password', async (url, location) => {
    const { response } = await serve(url)
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(location)
    expect(response.headers.has('www-authenticate')).toBe(false)
  })

  it.each([
    'https://pitonne.jp/about',
    'https://www.pitonne.jp/',
    'https://pitonne-jp.pages.dev/',
    'http://localhost:8788/',
    'http://127.0.0.1:8788/ja/'
  ])('gates %s as it gates the staging host, never sending it to Staging', async url => {
    const { response, asked } = await serve(url)
    expectChallenge(response)
    expect(response.headers.has('location')).toBe(false)
    expect(asked).toHaveLength(0)
    const verified = await serve(url, { authorization: basic(`x:${PASSWORD}`) })
    expect(verified.response.status).toBe(200)
    expect(verified.response.headers.has('location')).toBe(false)
  })

  it('folds a _redirects rule into the same hop', async () => {
    const legacy: AssetServer = async () =>
      new Response(null, { status: 301, headers: { location: '/' } })
    const response = await onRequest({
      request: new Request('https://staging.pitonne-jp.pages.dev/en/?a=1'),
      next: legacy,
      env: staging
    })
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`${STAGING_ORIGIN}/?a=1`)
  })

  it('serves the staging host and smoke-test requests on any host without redirecting', async () => {
    for (const url of [`${STAGING_ORIGIN}/ja/`, 'https://staging.pitonne.jp./ja/']) {
      expectChallenge((await serve(url)).response)
    }
    const { response } = await serve('https://d49a67b6.pitonne-jp.pages.dev/ja/', smoke)
    expect(response.status).toBe(200)
  })

  it('keeps the production host rules for every other host on other deployments', async () => {
    for (const env of [{ CF_PAGES_BRANCH: 'main' }, { CF_PAGES_BRANCH: PREVIEW_BRANCH }, {}]) {
      const hash = await serve('https://d49a67b6.pitonne-jp.pages.dev/ja/', {}, env)
      expect(hash.response.headers.get('location')).toBe('https://pitonne.jp/ja/')
    }
  })

  it.each([
    {},
    { CF_PAGES_BRANCH: 'main' }
  ])('gates the staging hosts when CF_PAGES_BRANCH is %j', async branch => {
    for (const env of [branch, { ...branch, STAGING_PASSWORD: PASSWORD }]) {
      expectChallenge((await serve(`${STAGING_ORIGIN}/ja/`, {}, env)).response)
      const alias = await serve('https://staging.pitonne-jp.pages.dev/ja/', {}, env)
      expect(alias.response.status).toBe(308)
      expect(alias.response.headers.get('location')).toBe(`${STAGING_ORIGIN}/ja/`)
    }
    const env = { ...branch, STAGING_PASSWORD: PASSWORD }
    const verified = await serve(page, { authorization: basic(`editor:${PASSWORD}`) }, env)
    expect(verified.response.status).toBe(200)
  })
})
