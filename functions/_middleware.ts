// Cloudflare Pages middleware: 308 non-canonical hosts (pitonne-jp.pages.dev and its aliases) to https://pitonne.jp.
// `wrangler pages deploy out` bundles this directory from the repository root. `public/_routes.json` keeps static
// files (build assets, images, icons) off the Function, so they stay free and never count against the request quota.
import { canonicalHostRedirect } from "../lib/canonical-host"

interface MiddlewareContext {
  request: Request
  next: () => Promise<Response>
}

export const onRequest = async ({ request, next }: MiddlewareContext): Promise<Response> =>
  (await canonicalHostRedirect(request, next)) ?? next()
