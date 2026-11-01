import { environment, expect, indexable, origin, test } from './fixtures'

const noindex = /\bnoindex\b/i

test.describe(`the ${environment} build as Pages serves it`, () => {
  test.skip(({ isMobile }) => isMobile, 'Headers and redirects are the same at every width')

  test(`answers each page with the ${environment} indexing signals and canonical`, async ({
    page
  }) => {
    for (const path of ['/', '/ja/', '/services/', '/blog/']) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(200)
      const header = response?.headers()['x-robots-tag'] ?? ''
      const meta = await page.locator('meta[name="robots"]').getAttribute('content')
      if (indexable) {
        expect(header, `${path} X-Robots-Tag`).not.toMatch(noindex)
        expect(meta ?? '', `${path} meta robots`).not.toMatch(noindex)
      } else {
        expect(header, `${path} X-Robots-Tag`).toMatch(noindex)
        expect(meta ?? '', `${path} meta robots`).toMatch(noindex)
      }
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical, `${path} canonical`).toBe(path === '/' ? origin : `${origin}${path}`)
    }
  })

  test(`serves the ${environment} robots.txt`, async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()
    const sitemap = `Sitemap: ${origin}/sitemap-index.xml`
    expect(body).toContain(sitemap)
    expect(body.match(/^Sitemap:.*$/gm)).toEqual([sitemap])
    if (environment === 'production') expect(body).toMatch(/^Allow: \/$/m)
    else expect(body).toMatch(/^User-Agent: \*\nDisallow: \/$/m)
    if (environment === 'staging') expect(body).toMatch(/^User-Agent: AhrefsSiteAudit$/m)
  })

  test('answers a missing page with the 404 page, which no environment indexes', async ({
    page,
    errors
  }) => {
    const missing = '/no-such-page-e2e/'
    const response = await page.goto(missing)
    expect(response?.status()).toBe(404)
    const others = errors.filter(error => !error.includes(`${missing})`))
    errors.splice(0, errors.length, ...others)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', noindex)
    await page.locator('main').locator('a[href="/"]').first().click()
    await expect(page).toHaveURL('/')
  })

  for (const [from, status, to] of [
    ['/about', 308, '/about/'],
    ['/ja/contact', 308, '/ja/contact/'],
    ['/robots.txt/', 308, '/robots.txt'],
    ['/en/', 301, '/'],
    ['/en/services/', 301, '/services/'],
    ['/services/medications/', 301, '/services/medication/']
  ] as const) {
    test(`redirects ${from} to ${to} with one ${status}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 })
      expect(response.status()).toBe(status)
      expect(new URL(response.headers().location ?? '', 'http://site').pathname).toBe(to)
      const landed = await request.get(to, { maxRedirects: 0 })
      expect(landed.status(), `${to} answers without another redirect`).toBe(200)
    })
  }
})
