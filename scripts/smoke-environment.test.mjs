import { describe, expect, it, vi } from 'vitest'
import { MISSING_PAGE_PATH, SMOKE_HEADERS } from './smoke-canonical-host.mjs'
import {
  environmentChecks,
  isZoneHost,
  NOT_FOUND_PAGE_PATHS,
  PASSWORD_HEADERS,
  run,
  runChecks,
  SITEMAP_LINE,
  STAGING_ORIGIN
} from './smoke-environment.mjs'

const PRODUCTION_ROBOTS = `User-Agent: *\nAllow: /\nDisallow: /keystatic/\n\n${SITEMAP_LINE}\n`
const STAGING_ROBOTS =
  'User-Agent: *\nDisallow: /\n\nSitemap: https://pitonne.jp/sitemap-index.xml\n'
const GATED_ROBOTS = `User-Agent: *\nDisallow: /\n\nUser-Agent: AhrefsSiteAudit\nAllow: /\nDisallow: /keystatic/\n\nSitemap: ${STAGING_ORIGIN}/sitemap-index.xml\n`
const html = robots =>
  `<html><head><meta name="robots" content="${robots}"/></head><body></body></html>`
const response = (status, body, headers = {}) => ({ status, body, headers: new Headers(headers) })

const byPath = environment =>
  Object.fromEntries(
    environmentChecks(environment, 'https://x.pages.dev').map(check => [
      new URL(check.url).pathname,
      check
    ])
  )

describe('environment smoke test', () => {
  it("checks pages in both locales, robots.txt, a missing page and the 404 page's own URLs everywhere, and the sitemap index on production", () => {
    const everywhere = ['/', '/ja/', '/robots.txt', MISSING_PAGE_PATH, '/404/', '/_not-found/']
    expect(Object.keys(byPath('staging'))).toEqual([...everywhere, '/contact'])
    expect(Object.keys(byPath('preview'))).toEqual(everywhere)
    expect(Object.keys(byPath('production'))).toEqual([...everywhere, '/sitemap-index.xml'])
  })

  it("requires a missing page and the 404 page's own URLs to answer 404 with one noindex robots tag and a link home", () => {
    const notFound = (robots, home = '/') =>
      `<html><head>${robots.map(content => `<meta name="robots" content="${content}"/>`).join('')}</head><body><a class="logo" href="${home}">Home</a></body></html>`
    for (const environment of ['production', 'staging', 'preview']) {
      for (const path of [MISSING_PAGE_PATH, ...NOT_FOUND_PAGE_PATHS]) {
        const missing = byPath(environment)[path]
        expect(missing.redirect).toBe('manual')
        expect(missing.verify(response(404, notFound(['noindex'])))).toBeNull()
        expect(missing.verify(response(200, notFound(['noindex'])))).toMatch(/status 200/)
        expect(missing.verify(response(308, ''))).toMatch(/status 308/)
        expect(missing.verify(response(404, notFound([])))).toMatch(/0 meta robots/)
        expect(missing.verify(response(404, notFound(['noindex', 'noindex, follow'])))).toMatch(
          /2 meta robots/
        )
        expect(missing.verify(response(404, notFound(['index, follow'])))).toMatch(/with noindex/)
        expect(missing.verify(response(404, notFound(['noindex'], '/about/')))).toMatch(
          /no link to the home page/
        )
      }
    }
  })

  it('requires production to allow crawling, list its sitemap and send no noindex', () => {
    const checks = byPath('production')
    expect(checks['/robots.txt'].verify(response(200, PRODUCTION_ROBOTS))).toBeNull()
    expect(checks['/robots.txt'].verify(response(200, STAGING_ROBOTS))).toMatch(/disallows/)
    expect(checks['/robots.txt'].verify(response(200, 'User-Agent: *\nAllow: /\n'))).toMatch(
      /Sitemap/
    )
    expect(checks['/'].verify(response(200, html('index, follow')))).toBeNull()
    expect(checks['/'].verify(response(200, html('noindex, nofollow')))).toMatch(/meta robots/)
    expect(
      checks['/'].verify(response(200, html('index, follow'), { 'x-robots-tag': 'noindex' }))
    ).toMatch(/X-Robots-Tag/)
    expect(checks['/ja/'].verify(response(404, html('index, follow')))).toMatch(/404/)
    expect(
      checks['/sitemap-index.xml'].verify(response(200, '<?xml?><sitemapindex></sitemapindex>'))
    ).toBeNull()
    expect(checks['/sitemap-index.xml'].verify(response(404, ''))).not.toBeNull()
  })

  it('requires previews to disallow crawling and send noindex in both header and meta tag', () => {
    const checks = byPath('preview')
    expect(checks['/robots.txt'].verify(response(200, STAGING_ROBOTS))).toBeNull()
    expect(checks['/robots.txt'].verify(response(200, PRODUCTION_ROBOTS))).toMatch(/Disallow/)
    const noindex = { 'x-robots-tag': 'noindex, nofollow' }
    expect(checks['/'].verify(response(200, html('noindex, nofollow'), noindex))).toBeNull()
    expect(checks['/'].verify(response(200, html('noindex, nofollow')))).toMatch(
      /X-Robots-Tag is missing/
    )
    expect(checks['/ja/'].verify(response(200, html('index, follow'), noindex))).toMatch(
      /meta robots/
    )
  })

  it('requires smoke-test requests to staging to pass the gate with noindex and a Staging canonical', () => {
    const checks = byPath('staging')
    for (const robots of [STAGING_ROBOTS, GATED_ROBOTS])
      expect(checks['/robots.txt'].verify(response(200, robots))).toBeNull()
    expect(checks['/robots.txt'].verify(response(200, PRODUCTION_ROBOTS))).toMatch(/Disallow/)
    const noindex = { 'x-robots-tag': 'noindex' }
    const stagingPage = (canonical, robots = 'index, follow') =>
      `<html><head><meta name="robots" content="${robots}"/><link rel="canonical" href="${canonical}"/></head></html>`
    expect(checks['/'].verify(response(200, stagingPage(STAGING_ORIGIN), noindex))).toBeNull()
    expect(
      checks['/ja/'].verify(response(200, stagingPage(`${STAGING_ORIGIN}/ja/`), noindex))
    ).toBeNull()
    expect(checks['/'].verify(response(200, stagingPage(STAGING_ORIGIN)))).toMatch(
      /X-Robots-Tag is missing/
    )
    expect(checks['/'].verify(response(401, '', noindex))).toMatch(/status 401/)
    expect(
      checks['/ja/'].verify(response(200, stagingPage('https://pitonne.jp/ja/'), noindex))
    ).toMatch(/canonical is "https:\/\/pitonne.jp\/ja\/", expected https:\/\/staging/)
  })

  it('requires other hosts serving staging to send a request without the header to the Staging host in one 308', () => {
    const redirect = byPath('staging')['/contact']
    expect(redirect).toMatchObject({ headers: {}, redirect: 'manual' })
    const to = location => response(308, '', { location })
    expect(redirect.verify(to(`${STAGING_ORIGIN}/contact/`))).toBeNull()
    expect(redirect.verify(to(`${STAGING_ORIGIN}/contact`))).toMatch(/expected 308/)
    expect(redirect.verify(to('https://pitonne.jp/contact/'))).toMatch(/expected 308/)
    expect(redirect.verify(response(301, '', { location: `${STAGING_ORIGIN}/contact/` }))).toMatch(
      /status 301/
    )
    expect(redirect.verify(response(200, ''))).toMatch(/status 200/)
  })

  it('tolerates a Cloudflare challenge only on branded hosts', async () => {
    expect(isZoneHost('https://staging.pitonne.jp/')).toBe(true)
    expect(isZoneHost('https://staging.pitonne-jp.pages.dev/')).toBe(false)
    const challenged = async () => response(403, '', { 'cf-mitigated': 'challenge' })
    const [zonePage] = environmentChecks('staging', 'https://staging.pitonne.jp')
    expect(await run(zonePage, { attempts: 1, probeFn: challenged })).toMatchObject({
      ok: true,
      warning: true
    })
    const [pagesPage] = environmentChecks('staging', 'https://staging.pitonne-jp.pages.dev')
    expect(await run(pagesPage, { attempts: 1, probeFn: challenged })).toMatchObject({ ok: false })
  })

  it("retries each origin's checks until it has had time to settle, then briefly", async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    let clock = 0
    const now = () => clock
    const calls = new Map()
    const probeFn = async url => {
      calls.set(url, (calls.get(url) ?? 0) + 1)
      clock += 10
      return response(500, '')
    }
    const checks = ['https://x.pages.dev', 'https://abc12345.x.pages.dev'].flatMap(origin =>
      environmentChecks('staging', origin)
    )
    expect(await runChecks(checks, { delayMs: 0, probeFn, now, settleMs: 100 })).toBe(false)
    expect(checks.map(check => calls.get(check.url))).toEqual([
      10, 2, 2, 2, 2, 2, 2, 10, 2, 2, 2, 2, 2, 2
    ])

    calls.clear()
    clock = 0
    const settling = async url => {
      calls.set(url, (calls.get(url) ?? 0) + 1)
      clock += 10
      return clock >= 50 ? response(200, STAGING_ROBOTS) : response(404, '')
    }
    const robots = byPath('staging')['/robots.txt']
    expect(await runChecks([robots], { delayMs: 0, probeFn: settling, now })).toBe(true)
    expect(calls.get(robots.url)).toBe(5)
    log.mockRestore()
  })

  it("sends the smoke-test header so deployment URLs aren't redirected", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(STAGING_ROBOTS, { status: 200 }))
    const robots = byPath('staging')['/robots.txt']
    expect(await run(robots, { attempts: 1 })).toMatchObject({ ok: true })
    expect(fetchSpy.mock.calls[0][1].headers).toEqual(SMOKE_HEADERS)
    expect(fetchSpy.mock.calls[0][1].redirect).toBeUndefined()
    fetchSpy.mockRestore()
  })

  it('fetches the missing page without following redirects', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 308, headers: { location: '/' } }))
    const missing = byPath('production')[MISSING_PAGE_PATH]
    expect(await run(missing, { attempts: 1 })).toMatchObject({ ok: false })
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ headers: SMOKE_HEADERS, redirect: 'manual' })
    fetchSpy.mockRestore()
  })

  it('fails production on any response that asks for a password', () => {
    const prompt = { 'www-authenticate': 'Basic realm="Pitonne staging"' }
    const checks = environmentChecks('production', 'https://x.pages.dev')
    const passing = [
      response(200, html('index, follow')),
      response(200, html('index, follow')),
      response(200, PRODUCTION_ROBOTS),
      ...[MISSING_PAGE_PATH, ...NOT_FOUND_PAGE_PATHS].map(() =>
        response(404, html('noindex').replace('<body>', '<body><a href="/">Home</a>'))
      ),
      response(200, '<sitemapindex></sitemapindex>')
    ]
    checks.forEach((check, index) => {
      const { status, body } = passing[index]
      expect(check.verify(passing[index])).toBeNull()
      expect(check.verify(response(status, body, prompt))).toMatch(/WWW-Authenticate.*production/)
    })
  })
})

describe('staging password gate smoke test', () => {
  const gate = environmentChecks('staging', STAGING_ORIGIN)
  const asking = check =>
    check.headers === undefined ? 'smoke' : check.headers === PASSWORD_HEADERS ? 'password' : 'none'
  const find = (path, kind) =>
    gate.find(check => new URL(check.url).pathname === path && asking(check) === kind)
  const challenge = (headers = {}) =>
    response(401, '', {
      'www-authenticate': 'Basic realm="Pitonne staging", charset="UTF-8"',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
      ...headers
    })
  const page = (canonical, robots = 'index, follow') =>
    `<html><head><meta name="robots" content="${robots}"/><link rel="canonical" href="${canonical}"/></head></html>`

  it('checks the gate only on the Staging host, without following redirects', () => {
    expect(gate.map(check => `${asking(check)} ${new URL(check.url).pathname}`)).toEqual([
      'smoke /',
      'smoke /ja/',
      'smoke /robots.txt',
      `smoke ${MISSING_PAGE_PATH}`,
      'smoke /404/',
      'smoke /_not-found/',
      'none /',
      'none /ja/',
      'none /favicon.ico',
      'password /',
      'password /ja/',
      'none /robots.txt'
    ])
    for (const check of gate.filter(candidate => asking(candidate) !== 'smoke'))
      expect(check.redirect).toBe('manual')
    expect(PASSWORD_HEADERS.authorization).toBe(
      `Basic ${Buffer.from('smoke:stagingpassword').toString('base64')}`
    )
  })

  it('requires 401 with a Basic challenge, no-store and noindex without the password', () => {
    for (const path of ['/', '/ja/', '/favicon.ico']) {
      const locked = find(path, 'none')
      expect(locked.verify(challenge())).toBeNull()
      expect(locked.verify(response(200, page(STAGING_ORIGIN)))).toMatch(/status 200/)
      expect(locked.verify(response(308, ''))).toMatch(/status 308/)
      expect(locked.verify(challenge({ 'www-authenticate': 'Bearer' }))).toMatch(/Basic/)
      expect(locked.verify(challenge({ 'cache-control': 'max-age=60' }))).toMatch(/no-store/)
      expect(locked.verify(challenge({ 'x-robots-tag': 'all' }))).toMatch(/noindex/)
    }
  })

  it('requires 200, a canonical on the Staging host and no noindex with the password', () => {
    const home = find('/', 'password')
    const ja = find('/ja/', 'password')
    expect(home.verify(response(200, page(STAGING_ORIGIN)))).toBeNull()
    expect(ja.verify(response(200, page(`${STAGING_ORIGIN}/ja/`)))).toBeNull()
    expect(home.verify(challenge())).toMatch(/status 401 with the password/)
    expect(home.verify(response(200, page('https://pitonne.jp')))).toMatch(/canonical/)
    expect(ja.verify(response(200, page(STAGING_ORIGIN)))).toMatch(/canonical/)
    expect(home.verify(response(200, page(STAGING_ORIGIN, 'noindex, nofollow')))).toMatch(
      /meta robots/
    )
    expect(home.verify(response(200, page(STAGING_ORIGIN), { 'x-robots-tag': 'noindex' }))).toMatch(
      /X-Robots-Tag/
    )
  })

  it('requires robots.txt without the password to disallow every crawler and list the Staging sitemap', () => {
    const robots = find('/robots.txt', 'none')
    expect(robots.verify(response(200, GATED_ROBOTS))).toBeNull()
    expect(robots.verify(challenge())).toMatch(/status 401/)
    expect(robots.verify(response(200, PRODUCTION_ROBOTS))).toMatch(/disallow/)
    expect(
      robots.verify(response(200, `User-Agent: AhrefsSiteAudit\nDisallow: /\n\n${SITEMAP_LINE}\n`))
    ).toMatch(/disallow/)
    expect(robots.verify(response(200, STAGING_ROBOTS))).toMatch(/staging\.pitonne\.jp/)
  })

  it('sends no smoke-test header, and the password only where a check asks', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('', { status: 401 }))
    await run(find('/', 'none'), { attempts: 1 })
    await run(find('/', 'password'), { attempts: 1 })
    expect(fetchSpy.mock.calls.map(call => call[1].headers)).toEqual([{}, PASSWORD_HEADERS])
    fetchSpy.mockRestore()
  })
})
