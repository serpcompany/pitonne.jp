// Canonical-host redirect for the Cloudflare Pages Function in `functions/_middleware.ts` (issue #79).
//
// Every non-canonical host that serves this Pages project returns one 308 to the same path and query on
// https://pitonne.jp, as the SERP environment-configuration standard requires. Exempt:
// - requests carrying the smoke-test header, so CI can reach any deployment through its pages.dev host;
// - the `pr-<n>` and `staging` preview aliases, which CI and reviewers use.
//
// Self-contained on purpose: Wrangler bundles this file into the Function and doesn't resolve the `@/` alias.

export const CANONICAL_ORIGIN = "https://pitonne.jp"
export const CANONICAL_HOST = "pitonne.jp"
export const PAGES_HOST = "pitonne-jp.pages.dev"
export const SMOKE_TEST_HEADER = "x-pitonne-smoke-test"

const NON_CANONICAL_HOSTS = new Set([`www.${CANONICAL_HOST}`, PAGES_HOST])
const PREVIEW_ALIAS = /^(?:pr-\d+|staging)$/

// Last path segments ending in one of these are files: they never take a trailing slash. Every other dotless
// segment is a page, which always ends in one (`trailingSlash: true`). See the URL trailing-slash standard.
const FILE_EXTENSIONS = new Set([
  "avif", "css", "gif", "html", "ico", "jpeg", "jpg", "js", "json", "map", "mp4", "pdf", "png", "svg", "txt",
  "webm", "webmanifest", "webp", "woff", "woff2", "xml", "xsl",
])

// Paths whose form is never changed: `_`-prefixed (`/_next/`), `/api`, `/.well-known/`, and the Keystatic SPA,
// whose router reads a trailing slash as an extra segment.
const KEEP_PATH = /^\/(?:_|api(?:\/|$)|\.well-known\/|keystatic(?:\/|$))/i

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/\.$/, "")
}

/** True when this host should be redirected to the canonical host. */
export function isNonCanonicalHost(host: string): boolean {
  const hostname = normalizeHost(host)
  if (NON_CANONICAL_HOSTS.has(hostname)) return true
  if (!hostname.endsWith(`.${PAGES_HOST}`)) return false
  // Branch aliases (`<branch>.pitonne-jp.pages.dev`) and immutable deployment URLs (`<hash>.pitonne-jp.pages.dev`)
  const label = hostname.slice(0, -`.${PAGES_HOST}`.length)
  return !PREVIEW_ALIAS.test(label)
}

/** The path in its canonical trailing-slash form, so the host redirect lands in one hop. */
export function canonicalPath(pathname: string): string {
  if (pathname === "/" || KEEP_PATH.test(pathname)) return pathname
  const trimmed = pathname.replace(/\/+$/, "")
  const lastSegment = trimmed.slice(trimmed.lastIndexOf("/") + 1)
  const dot = lastSegment.lastIndexOf(".")
  if (dot === -1) return `${trimmed}/`
  if (FILE_EXTENSIONS.has(lastSegment.slice(dot + 1).toLowerCase())) return trimmed
  // A dotted segment that isn't a known file: leave it exactly as requested.
  return pathname
}

/**
 * The `Location` for a canonical-host redirect, or `null` when the request should be served as is.
 * The path and query string are kept; only the trailing slash is normalized.
 */
export function canonicalRedirectLocation(requestUrl: string | URL, headers: Headers): string | null {
  if (headers.has(SMOKE_TEST_HEADER)) return null
  const url = new URL(requestUrl)
  if (!isNonCanonicalHost(url.hostname)) return null
  return `${CANONICAL_ORIGIN}${canonicalPath(url.pathname)}${url.search}`
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

/**
 * A 308 to the canonical host, or `null` when the request should pass through to static assets.
 *
 * `next` is the static asset server, which applies `public/_redirects` and Pages' own trailing-slash redirects. For a
 * non-canonical host it is asked first, so a legacy URL (`/en/`, `/services/medications`) lands on its final
 * `pitonne.jp` URL in one hop instead of two, with `_redirects` staying the only list of those rules.
 */
export async function canonicalHostRedirect(
  request: Request,
  next: () => Promise<Response>,
): Promise<Response | null> {
  let location = canonicalRedirectLocation(request.url, request.headers)
  if (!location) return null

  const asset = await next()
  const assetLocation = asset.headers.get("location")
  await asset.body?.cancel()
  if (REDIRECT_STATUSES.has(asset.status) && assetLocation) {
    const url = new URL(request.url)
    const target = new URL(assetLocation, url)
    // Only same-host targets are folded in; anything else keeps the plain host redirect.
    if (target.host === url.host) {
      location = `${CANONICAL_ORIGIN}${canonicalPath(target.pathname)}${target.search || url.search}`
    }
  }

  return new Response(null, {
    status: 308,
    headers: {
      Location: location,
      // Preview and deployment hosts change often; let the 308 be cached for a day, not forever.
      "Cache-Control": "public, max-age=86400",
    },
  })
}
