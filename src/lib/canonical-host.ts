export const CANONICAL_ORIGIN = 'https://pitonne.jp'
export const STAGING_ORIGIN = 'https://staging.pitonne.jp'
const CANONICAL_HOST = 'pitonne.jp'
const STAGING_HOST = new URL(STAGING_ORIGIN).hostname
const PAGES_HOST = 'pitonne-jp.pages.dev'
export const SMOKE_TEST_HEADER = 'x-pitonne-smoke-test'
const STAGING_BRANCH = 'staging'

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

interface HostRule {
  origin: string
  redirects: (hostname: string) => boolean
}

const PRODUCTION_HOSTS: HostRule = { origin: CANONICAL_ORIGIN, redirects: isNonCanonicalHost }

const STAGING_HOSTS: HostRule = {
  origin: STAGING_ORIGIN,
  redirects: host => normalizeHost(host).endsWith(`.${PAGES_HOST}`)
}

export function canonicalRedirectLocation(
  requestUrl: string | URL,
  headers: Headers,
  hosts = PRODUCTION_HOSTS
): string | null {
  if (headers.has(SMOKE_TEST_HEADER)) return null
  const url = new URL(requestUrl)
  if (!hosts.redirects(url.hostname)) return null
  return `${hosts.origin}${canonicalPath(url.pathname)}${url.search}`
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
  next: AssetServer,
  hosts = PRODUCTION_HOSTS
): Promise<Response | null> {
  const location = canonicalRedirectLocation(request.url, request.headers, hosts)
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
    `${hosts.origin}${canonicalPath(target.pathname)}${target.search || url.search}`
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

export interface FunctionEnv {
  CF_PAGES_BRANCH?: string
  STAGING_PASSWORD?: string
}

const STAGING_REALM = 'Basic realm="Pitonne staging", charset="UTF-8"'
const NOINDEX = 'noindex, nofollow'
const PRIVATE = 'private, no-store'
const GATE_EXEMPT_PATHS = new Set(['/robots.txt'])

type WorkersSubtleCrypto = SubtleCrypto & {
  timingSafeEqual: (a: ArrayBuffer, b: ArrayBuffer) => boolean
}

const sha256 = (value: string) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))

function basicAuthPassword(header: string | null): string | null {
  const [scheme, encoded, ...rest] = header?.trim().split(/\s+/) ?? []
  if (scheme?.toLowerCase() !== 'basic' || !encoded || rest.length > 0) return null
  let credentials: string
  try {
    const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0))
    credentials = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
  const colon = credentials.indexOf(':')
  return colon === -1 ? null : credentials.slice(colon + 1)
}

async function hasStagingPassword(request: Request, expected: string | undefined) {
  const given = basicAuthPassword(request.headers.get('authorization'))
  if (!expected || given === null) return false
  const [givenDigest, expectedDigest] = await Promise.all([sha256(given), sha256(expected)])
  return (crypto.subtle as WorkersSubtleCrypto).timingSafeEqual(givenDigest, expectedDigest)
}

function withoutAuthorization(request: Request): Request {
  if (!request.headers.has('authorization')) return request
  const headers = new Headers(request.headers)
  headers.delete('authorization')
  return new Request(request, { headers })
}

function keptPrivate(response: Response, noindex: boolean): Response {
  const marked = new Response(response.body, response)
  marked.headers.set('Cache-Control', PRIVATE)
  if (noindex) marked.headers.set('X-Robots-Tag', NOINDEX)
  return marked
}

const passwordRequired = () =>
  new Response('Password required', {
    status: 401,
    headers: {
      'WWW-Authenticate': STAGING_REALM,
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': NOINDEX
    }
  })

async function serveStaging(
  request: Request,
  next: AssetServer,
  password: string | undefined
): Promise<Response> {
  const forwarded = withoutAuthorization(request)
  const hostRedirect = await canonicalHostRedirect(forwarded, next, STAGING_HOSTS)
  if (hostRedirect) return hostRedirect
  const serve = async () => (await slashedFileRedirect(forwarded, next)) ?? next(forwarded)
  const exempt =
    request.headers.has(SMOKE_TEST_HEADER) || GATE_EXEMPT_PATHS.has(new URL(request.url).pathname)
  if (exempt) return keptPrivate(await serve(), true)
  if (!(await hasStagingPassword(request, password))) return passwordRequired()
  return keptPrivate(await serve(), false)
}

const STAGING_DEPLOYMENT_HOSTS = new Set([STAGING_HOST, `${STAGING_BRANCH}.${PAGES_HOST}`])

function servesStaging(request: Request, env: FunctionEnv): boolean {
  return (
    env.CF_PAGES_BRANCH === STAGING_BRANCH ||
    STAGING_DEPLOYMENT_HOSTS.has(normalizeHost(new URL(request.url).hostname))
  )
}

export async function handleRequest(
  request: Request,
  next: AssetServer,
  env: FunctionEnv = {}
): Promise<Response> {
  if (servesStaging(request, env)) return serveStaging(request, next, env.STAGING_PASSWORD)
  return (
    (await canonicalHostRedirect(request, next)) ??
    (await slashedFileRedirect(request, next)) ??
    next()
  )
}
