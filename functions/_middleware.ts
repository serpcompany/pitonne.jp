import {
  type AssetServer,
  canonicalHostRedirect,
  slashedFileRedirect
} from '../src/lib/canonical-host'

interface MiddlewareContext {
  request: Request
  next: AssetServer
}

export const onRequest = async ({ request, next }: MiddlewareContext): Promise<Response> =>
  (await canonicalHostRedirect(request, next)) ??
  (await slashedFileRedirect(request, next)) ??
  next()
