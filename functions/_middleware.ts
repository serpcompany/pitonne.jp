import { type AssetServer, type FunctionEnv, handleRequest } from '../src/lib/canonical-host'

interface MiddlewareContext {
  request: Request
  next: AssetServer
  env?: FunctionEnv
}

export const onRequest = ({ request, next, env }: MiddlewareContext): Promise<Response> =>
  handleRequest(request, next, env)
