export const CANONICAL_ORIGIN = 'https://pitonne.jp'
const CANONICAL_HOST = 'pitonne.jp'
const PAGES_HOST = 'pitonne-jp.pages.dev'
export const SMOKE_TEST_HEADER = 'x-pitonne-smoke-test'

const NON_CANONICAL_HOSTS = new Set([`www.${CANONICAL_HOST}`, PAGES_HOST])
const PREVIEW_ALIAS = /^(?:pr-\d+|staging)$/

const FILE_EXTENSIONS = new Set([
  'avif',
  'css',
  'gif',
  'html',
  'ico',
  'jpeg',
  'jpg',
  'js',
  'json',
  'map',
  'mp4',
  'pdf',
  'png',
  'svg',
  'txt',
  'webm',
  'webmanifest',
  'webp',
  'woff',
  'woff2',
  'xml',
  'xsl'
])

const KEEP_PATH = /^\/(?:_|api(?:\/|$)|\.well-known\/|keystatic(?:\/|$))/i

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/\.$/, '')
}

export function isNonCanonicalHost(host: string): boolean {
  const hostname = normalizeHost(host)
  if (NON_CANONICAL_HOSTS.has(hostname)) return true
  if (!hostname.endsWith(`.${PAGES_HOST}`)) return false
  const label = hostname.slice(0, -`.${PAGES_HOST}`.length)
  return !PREVIEW_ALIAS.test(label)
}

export function canonicalPath(pathname: string): string {
  if (pathname === '/' || KEEP_PATH.test(pathname)) return pathname
  const trimmed = pathname.replace(/\/+$/, '')
  const lastSegment = trimmed.slice(trimmed.lastIndexOf('/') + 1)
  const dot = lastSegment.lastIndexOf('.')
  if (dot === -1) return `${trimmed}/`
  if (FILE_EXTENSIONS.has(lastSegment.slice(dot + 1).toLowerCase())) return trimmed
  return pathname
}

export function canonicalRedirectLocation(
  requestUrl: string | URL,
  headers: Headers
): string | null {
  if (headers.has(SMOKE_TEST_HEADER)) return null
  const url = new URL(requestUrl)
  if (!isNonCanonicalHost(url.hostname)) return null
  return `${CANONICAL_ORIGIN}${canonicalPath(url.pathname)}${url.search}`
}

const PERMANENT_REDIRECT_STATUSES = new Set([301, 308])

export type AssetServer = (request?: Request) => Promise<Response>

async function assetRedirectTarget(url: URL, ask: () => Promise<Response>): Promise<URL | null> {
  let asset: Response
  try {
    asset = await ask()
  } catch {
    return null
  }
  const location = asset.headers.get('location')
  await asset.body?.cancel().catch(() => undefined)
  if (!PERMANENT_REDIRECT_STATUSES.has(asset.status) || !location) return null
  const target = new URL(location, url)
  return target.host === url.host ? target : null
}

function askFor(url: URL, request: Request, next: AssetServer): () => Promise<Response> {
  return () =>
    next(new Request(url, { method: 'GET', headers: request.headers, redirect: 'manual' }))
}

const redirect308 = (location: string) =>
  new Response(null, {
    status: 308,
    headers: {
      Location: location,
      'Cache-Control': 'public, max-age=86400'
    }
  })

export async function canonicalHostRedirect(
  request: Request,
  next: AssetServer
): Promise<Response | null> {
  const location = canonicalRedirectLocation(request.url, request.headers)
  if (!location) return null

  const url = new URL(request.url)
  const file = slashedFileLocation(url)
  const fileUrl = file ? new URL(file) : null
  const target = await assetRedirectTarget(
    fileUrl ?? url,
    fileUrl ? askFor(fileUrl, request, next) : () => next()
  )
  if (!target) return redirect308(location)
  return redirect308(
    `${CANONICAL_ORIGIN}${canonicalPath(target.pathname)}${target.search || url.search}`
  )
}

export function slashedFileLocation(requestUrl: string | URL): string | null {
  const url = new URL(requestUrl)
  if (!url.pathname.endsWith('/')) return null
  const path = canonicalPath(url.pathname)
  if (path === url.pathname || path.endsWith('/')) return null
  return `${url.origin}${path}${url.search}`
}

export async function slashedFileRedirect(
  request: Request,
  next: AssetServer
): Promise<Response | null> {
  const file = slashedFileLocation(request.url)
  if (!file) return null
  const fileUrl = new URL(file)
  const target = await assetRedirectTarget(fileUrl, askFor(fileUrl, request, next))
  if (!target) return redirect308(file)
  const location = `${fileUrl.origin}${canonicalPath(target.pathname)}${target.search || fileUrl.search}`
  return redirect308(location === request.url ? file : location)
}
