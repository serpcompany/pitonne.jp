import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip if already a locale-prefixed path
  if (pathname.startsWith("/ja/") || pathname === "/ja") {
    return NextResponse.next()
  }

  // Rewrite non-ja paths to /en/... internally (no browser redirect)
  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    "/((?!_next|images|fonts|api|favicon\\.ico|icon.*|apple-icon|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.xml|.*\\.txt|.*\\.css|.*\\.js).*)",
  ],
}
