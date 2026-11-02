import { describe, expect, it } from 'vitest'
import { SMOKE_TEST_HEADER } from '@/lib/canonical-host'
import { onRequest } from '../../functions/_middleware'

describe("the 404 page's own URLs", () => {
  const assetServer = () => {
    const asked: Request[] = []
    const page = new Response('static asset')
    const next = async (request?: Request) => {
      if (!request) return page
      asked.push(request)
      return new URL(request.url).pathname === '/404.html/'
        ? new Response('404 page', { status: 404 })
        : page
    }
    return { asked, next, page }
  }
  const serve = (url: string, init: RequestInit = {}, server = assetServer()) =>
    onRequest({ request: new Request(url, init), next: server.next })

  it.each([
    '/404',
    '/404/',
    '/404.html',
    '/404/index.html',
    '/_not-found',
    '/_not-found/',
    '/_not-found.html',
    '/_not-found/index.html',
    '/%34%30%34/',
    '/%5Fnot-found',
    '/404/?a=1'
  ])('answers %s as Pages answers a missing page', async pathname => {
    const server = assetServer()
    const response = await serve(`https://pitonne.jp${pathname}`, {}, server)
    expect(response.status).toBe(404)
    expect(await response.text()).toBe('404 page')
    expect(server.asked.map(request => [request.url, request.method, request.redirect])).toEqual([
      ['https://pitonne.jp/404.html/', 'GET', 'manual']
    ])
  })

  it.each([
    '/404/index',
    '/404/index/',
    '/4044/',
    '/404/x/',
    '/ja/404/',
    '/en/404/',
    '/not-found/',
    '/_not-found/index.txt',
    '/404.txt',
    '/no-such-page/'
  ])('leaves %s to the asset server', async pathname => {
    const server = assetServer()
    expect(await serve(`https://pitonne.jp${pathname}`, {}, server)).toBe(server.page)
    expect(server.asked).toEqual([])
  })

  it('keeps the method and headers of the request', async () => {
    const server = assetServer()
    const response = await serve(
      'https://pitonne.jp/404/',
      { method: 'HEAD', headers: { accept: 'text/html' } },
      server
    )
    expect(response.status).toBe(404)
    expect(server.asked[0].method).toBe('HEAD')
    expect(server.asked[0].headers.get('accept')).toBe('text/html')
  })

  it('answers 404 on hosts served as is, after the host redirect on the others', async () => {
    const smoke = { [SMOKE_TEST_HEADER]: '1' }
    for (const [url, headers] of [
      ['https://pr-79.pitonne-jp.pages.dev/404/', {}],
      ['https://pitonne-jp.pages.dev/_not-found/', smoke],
      ['http://127.0.0.1:8788/404', {}]
    ] as const) {
      expect((await serve(url, { headers })).status, url).toBe(404)
    }
    const redirected = await serve('https://pitonne-jp.pages.dev/404/')
    expect(redirected.status).toBe(308)
    expect(redirected.headers.get('location')).toBe('https://pitonne.jp/404/')
  })
})
