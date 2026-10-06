// Cloudflare Pages middleware: 308 non-canonical hosts (pitonne-jp.pages.dev and its aliases) to https://pitonne.jp,
// and, on every host served as is (pitonne.jp, preview aliases, smoke-test requests), 308 slashed file URLs such as
// `/robots.txt/` to the file. Everything else passes through to the static asset server untouched.
// `wrangler pages deploy out` bundles this directory from the repository root. `public/_routes.json` keeps static
// files (build assets, images, icons) off the Function, so they stay free and never count against the request quota.
// The slashed form of an excluded path (`/images/x.jpg/`, `/_next/...js/`, and also `/favicon.ico/` and `/sitemap.xsl/`:
// Pages matches exact exclusions with a trailing slash too) never reaches the Function and stays a 404 (checked on the
// pr-92 preview, issue #92). Nothing links to those, and moving every image request onto the Function isn't worth it.
import { type AssetServer, canonicalHostRedirect, slashedFileRedirect } from "../lib/canonical-host"

interface MiddlewareContext {
  request: Request
  next: AssetServer
}

export const onRequest = async ({ request, next }: MiddlewareContext): Promise<Response> =>
  (await canonicalHostRedirect(request, next)) ?? (await slashedFileRedirect(request, next)) ?? next()
