// Cloudflare Pages middleware: 308 non-canonical hosts (pitonne-jp.pages.dev and its aliases) to https://pitonne.jp.
// `wrangler pages deploy out` bundles this directory from the repository root. `public/_routes.json` keeps static
// build assets (`/_next/static/*`) off the Function, so they stay free and never count against the request quota.
import { canonicalHostRedirect } from "../lib/canonical-host"

interface MiddlewareContext {
  request: Request
  next: () => Promise<Response>
}

export const onRequest = async ({ request, next }: MiddlewareContext): Promise<Response> =>
  canonicalHostRedirect(request) ?? next()
